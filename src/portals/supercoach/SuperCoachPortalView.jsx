import React, { useState, useMemo } from 'react';
import {
  Shield,
  MapPin,
  Users,
  User,
  Star,
  CalendarDays,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Package,
  Activity,
  UserCheck,
  TrendingUp,
  Filter,
  Plus,
  Search,
  Download,
  Eye,
  FileText,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Phone,
  Mail,
  Zap,
  Send,
  Sparkles,
  Layers,
  ArrowRight,
  Bell,
  Inbox,
  BarChart2,
  Building2
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { AnimatedCounter } from '../../components/common/KpiCard';
import FloatingCard from '../../components/common/FloatingCard';
import Modal from '../../components/common/Modal';
import EquipmentManagementModule from '../common/EquipmentManagementModule';
import { checkScheduleConflict } from '../../services/scheduleService';
import CoachAttendanceRegister from '../admin/CoachAttendanceRegister';
import AttendanceManagement from '../admin/AttendanceManagement';
import LiveCalendarButton from '../../components/common/LiveCalendarButton';
import CoachLeaveRequestsManager from '../common/CoachLeaveRequestsManager';

export default function SuperCoachPortalView() {
  const {
    data,
    currentView,
    setCurrentView,
    currentUser,
    reassignScheduleCoach,
    reportCoachIssue,
    createClassSchedule,
    addToast
  } = useCrm();

  // Super Coach assigned locations (Admin-granted access)
  const assignedLocations = useMemo(() => {
    return currentUser?.assignedLocations || ['KK NAGAR', 'KILPAUK', 'MAHALINGAPURAM'];
  }, [currentUser]);

  // Active location switcher for Super Coach dashboard
  const [selectedLocation, setSelectedLocation] = useState('All');

  // Internal active tab if navigated within Super Coach Portal
  const [activeTab, setActiveTab] = useState(() => {
    if (['dashboard', 'locations', 'coaches', 'equipment', 'schedules', 'attendance', 'reports'].includes(currentView)) {
      return currentView;
    }
    return 'dashboard';
  });

  // Attendance sub-view toggle: Coach Attendance Register vs Student Progression
  const [attendanceSubView, setAttendanceSubView] = useState('coach_register');

  // Keep activeTab synced with currentView when sidebar triggers navigation
  React.useEffect(() => {
    if (['dashboard', 'locations', 'coaches', 'equipment', 'schedules', 'attendance', 'reports'].includes(currentView)) {
      setActiveTab(currentView);
    }
  }, [currentView]);

  // Search & Filter in specific tabs
  const [coachSearch, setCoachSearch] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState('All');
  const [selectedLocationDetail, setSelectedLocationDetail] = useState(null);

  // Modals
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isCreateScheduleModalOpen, setIsCreateScheduleModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedCoachForIssue, setSelectedCoachForIssue] = useState(null);

  // Reassign coach form
  const [reassignForm, setReassignForm] = useState({
    newCoachId: '',
    note: ''
  });

  // Report coach issue form
  const [issueForm, setIssueForm] = useState({
    issueType: 'Punctuality & Attendance',
    priority: 'Medium',
    description: ''
  });

  // Create schedule form
  const [newScheduleForm, setNewScheduleForm] = useState({
    className: '',
    program: 'Spartan Gymnastics & Agility',
    batch: 'Batch Alpha (Evening)',
    location: assignedLocations[0] || 'KK NAGAR',
    coachId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '17:00',
    endTime: '18:00',
    venue: 'Training Court A'
  });

  // Scoped Locations Objects
  const scopedLocations = useMemo(() => {
    return (data.locations || []).filter((loc) => assignedLocations.includes(loc.name));
  }, [data.locations, assignedLocations]);

  // Scoped Coaches (operating in assigned locations)
  const scopedCoaches = useMemo(() => {
    return (data.coaches || []).filter((coach) => {
      if (!coach.center) return true;
      return assignedLocations.includes(coach.center);
    });
  }, [data.coaches, assignedLocations]);

  // Filtered coaches by selectedLocation
  const locationFilteredCoaches = useMemo(() => {
    return scopedCoaches.filter((coach) => {
      const matchLoc = selectedLocation === 'All' || coach.center === selectedLocation;
      const matchSearch =
        !coachSearch ||
        coach.name?.toLowerCase().includes(coachSearch.toLowerCase()) ||
        coach.specialization?.toLowerCase().includes(coachSearch.toLowerCase());
      return matchLoc && matchSearch;
    });
  }, [scopedCoaches, selectedLocation, coachSearch]);

  // Scoped Students
  const scopedStudents = useMemo(() => {
    return (data.students || []).filter((student) => {
      if (!student.center) return true;
      return assignedLocations.includes(student.center);
    });
  }, [data.students, assignedLocations]);

  // Scoped Schedules
  const scopedSchedules = useMemo(() => {
    return (data.classSchedules || []).filter((s) => assignedLocations.includes(s.location));
  }, [data.classSchedules, assignedLocations]);

  // Today's classes
  const todayYmd = new Date().toISOString().split('T')[0];
  const todayClasses = useMemo(() => {
    return scopedSchedules.filter((s) => {
      const matchDate = s.date === todayYmd;
      const matchLoc = selectedLocation === 'All' || s.location === selectedLocation;
      return matchDate && matchLoc;
    });
  }, [scopedSchedules, todayYmd, selectedLocation]);

  // Scoped Equipment
  const scopedEquipment = useMemo(() => {
    return (data.equipment || []).filter((i) => assignedLocations.includes(i.location));
  }, [data.equipment, assignedLocations]);

  // Scoped Reports
  const scopedReports = useMemo(() => {
    return (data.equipmentReports || []).filter((r) => assignedLocations.includes(r.location));
  }, [data.equipmentReports, assignedLocations]);

  // Overall KPIs
  const kpis = useMemo(() => {
    const locFilteredSchedules = selectedLocation === 'All' 
      ? scopedSchedules 
      : scopedSchedules.filter(s => s.location === selectedLocation);

    const locFilteredStudents = selectedLocation === 'All'
      ? scopedStudents
      : scopedStudents.filter(s => s.center === selectedLocation);

    const locFilteredCoaches = selectedLocation === 'All'
      ? scopedCoaches
      : scopedCoaches.filter(c => c.center === selectedLocation);

    const pendingEqReports = scopedReports.filter(
      (r) => (selectedLocation === 'All' || r.location === selectedLocation) && r.status === 'Pending Review'
    ).length;

    const locFilteredEq = selectedLocation === 'All'
      ? scopedEquipment
      : scopedEquipment.filter(i => i.location === selectedLocation);

    const goodEq = locFilteredEq.filter(i => i.condition === 'Good').length;
    const eqHealth = locFilteredEq.length > 0 ? Math.round((goodEq / locFilteredEq.length) * 100) : 100;

    return {
      assignedLocationsCount: assignedLocations.length,
      totalCoaches: locFilteredCoaches.length,
      totalStudents: locFilteredStudents.length,
      totalClasses: locFilteredSchedules.length,
      todayClassesCount: todayClasses.length,
      attendanceRate: 92,
      equipmentHealth: eqHealth,
      pendingEquipmentReports: pendingEqReports
    };
  }, [
    assignedLocations,
    selectedLocation,
    scopedSchedules,
    scopedStudents,
    scopedCoaches,
    scopedReports,
    scopedEquipment,
    todayClasses
  ]);

  // Handlers
  const handleOpenReassign = (schedule) => {
    setSelectedSchedule(schedule);
    const availableCoaches = scopedCoaches.filter((c) => c.center === schedule.location);
    setReassignForm({
      newCoachId: availableCoaches[0]?.id || '',
      note: ''
    });
    setIsReassignModalOpen(true);
  };

  const handleSaveReassign = (e) => {
    e.preventDefault();
    if (!selectedSchedule || !reassignForm.newCoachId) return;

    const newCoach = scopedCoaches.find((c) => c.id === reassignForm.newCoachId);
    if (!newCoach) {
      addToast('Please select a valid coach.', 'error');
      return;
    }

    const res = reassignScheduleCoach(
      selectedSchedule.id,
      newCoach.id,
      newCoach.name,
      currentUser?.name || 'Super Coach',
      reassignForm.note
    );

    if (res.success) {
      setIsReassignModalOpen(false);
      setSelectedSchedule(null);
    }
  };

  const handleOpenIssueModal = (coach) => {
    setSelectedCoachForIssue(coach);
    setIssueForm({
      issueType: 'Punctuality & Attendance',
      priority: 'Medium',
      description: ''
    });
    setIsIssueModalOpen(true);
  };

  const handleSaveIssue = (e) => {
    e.preventDefault();
    if (!selectedCoachForIssue || !issueForm.description.trim()) {
      addToast('Please provide a description of the issue.', 'error');
      return;
    }

    reportCoachIssue({
      coachId: selectedCoachForIssue.id,
      coachName: selectedCoachForIssue.name,
      location: selectedCoachForIssue.center || assignedLocations[0],
      issueType: issueForm.issueType,
      priority: issueForm.priority,
      description: issueForm.description,
      reportedBy: currentUser?.name || 'Super Coach'
    });

    setIsIssueModalOpen(false);
    setSelectedCoachForIssue(null);
  };

  const handleCreateScheduleSubmit = (e) => {
    e.preventDefault();
    const coach = scopedCoaches.find((c) => c.id === newScheduleForm.coachId);
    
    const candidate = {
      className: newScheduleForm.className || `${newScheduleForm.program} (${newScheduleForm.batch})`,
      program: newScheduleForm.program,
      batch: newScheduleForm.batch,
      location: newScheduleForm.location,
      coachId: coach?.id || '',
      coachName: coach?.name || 'Unassigned',
      date: newScheduleForm.date,
      startTime: newScheduleForm.startTime,
      endTime: newScheduleForm.endTime,
      venue: newScheduleForm.venue,
      status: 'Scheduled',
      enrolledCount: 12,
      capacity: 15
    };

    const res = createClassSchedule(candidate);
    if (res.success) {
      setIsCreateScheduleModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ============================================================ */}
      {/* 1. TOP HEADER: Good Morning, Super Coach! & Action Icons     */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {/* Left: Heading & Subtitle */}
        <div className="text-left space-y-1">
          <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-black text-[#172B50] tracking-tight flex items-center gap-2">
            <span>Good Morning, Super Coach!</span>
            <span className="inline-block transform origin-bottom hover:rotate-12 transition-transform cursor-default select-none">👋</span>
          </h1>
          <p className="text-xs sm:text-[13px] font-bold text-[#172B50]/65 tracking-tight text-left">
            Dashboard
          </p>
        </div>

        {/* Right: Quick Action Round Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 self-start sm:self-center shrink-0">
          {/* 1. Search */}
          <button
            type="button"
            onClick={() => addToast('Search active roster and coaches')}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4 text-[#172B50]" />
          </button>

          {/* 2. Notification */}
          <button
            type="button"
            onClick={() => addToast('Faculty and equipment alerts')}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#172B50]" />
            {kpis.pendingEquipmentReports > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#F4510B] absolute top-2 right-2 ring-1 ring-white" />
            )}
          </button>

          {/* 3. Profile */}
          <div 
            onClick={() => setActiveTab('coaches')}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full ring-2 ring-white shadow-2xs overflow-hidden cursor-pointer hover:ring-[#F4510B] transition-all" 
            title="Super Coach Profile"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
              alt="Super Coach"
              className="w-full h-full object-cover"
            />
          </div>

          {/* 4. Action */}
          <button
            type="button"
            onClick={() => setIsCreateScheduleModalOpen(true)}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer"
            title="Create Class"
          >
            <Plus className="w-4 h-4 text-[#172B50]" />
          </button>

          {/* 5. Live Calendar */}
          <LiveCalendarButton 
            classes={scopedSchedules} 
            onViewSchedule={() => setActiveTab('schedules')} 
          />
        </div>
      </div>

      {/* 2. TAB 1: OPERATIONS DASHBOARD */}
      {/* ============================================================ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-slide-up">
          
          {/* ============================================================ */}
          {/* 2. FOUR PIPELINE SECTIONS WITH SVG FORK / BRACKET CONNECTORS  */}
          {/* ============================================================ */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
              
              {/* Card 1: Authorized Locations (Peach) */}
              <FloatingCard 
                maxTilt={3} 
                scale={1.01} 
                glare={false}
                className="relative bg-[#FFF9F5] rounded-[24px] p-4 sm:p-4.5 border border-[#F4510B18] shadow-[0_4px_25px_rgba(244,81,11,0.03)] h-full"
                contentClassName="flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3.5">
                    <div className="w-8.5 h-8.5 rounded-xl bg-white text-[#F4510B] border border-[#F4510B25] shadow-2xs flex items-center justify-center shrink-0">
                      <Inbox className="w-4 h-4 text-[#F4510B]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                        Authorized Locations
                      </h3>
                      <p className="text-[11px] font-medium text-[#172B50]/60">
                        Multi-center jurisdiction
                      </p>
                    </div>
                  </div>

                  {scopedLocations.length === 0 ? (
                    <div className="min-h-[258px] py-6 text-center flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-xl bg-white text-[#F4510B] border border-[#F4510B20] flex items-center justify-center mb-2 shadow-2xs">
                        <MapPin className="w-5 h-5 text-[#F4510B]" />
                      </div>
                      <p className="text-xs font-black text-[#172B50]">No authorized centers</p>
                    </div>
                  ) : (
                    <div className="min-h-[258px] max-h-[258px] overflow-y-auto space-y-1.5 pr-1">
                      {scopedLocations.map((loc) => {
                        const locStudents = scopedStudents.filter(s => s.center === loc.name).length;
                        const locCoaches = scopedCoaches.filter(c => c.center === loc.name).length;
                        return (
                          <div
                            key={loc.id}
                            className="bg-white rounded-xl px-3 py-2 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-2 shrink-0 hover:border-[#F4510B30] transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-black text-[#172B50] truncate leading-tight">{loc.name}</p>
                              <p className="text-[10px] font-medium text-[#172B50]/60 mt-0.5 truncate leading-tight">
                                {locStudents} Athletes • {locCoaches} Coaches
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedLocation(loc.name)}
                              className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-[#FFF4E8] text-[#F4510B] hover:bg-[#F4510B] hover:text-white transition-colors cursor-pointer"
                            >
                              Focus
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-2.5 shrink-0">
                  <span className="text-[11px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                    Location Scope
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('locations')}
                    className="text-[11.5px] font-black text-[#F4510B] hover:text-[#d44105] flex items-center gap-1 group cursor-pointer transition-colors"
                  >
                    <span>View Hub ({scopedLocations.length})</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Desktop Connector 1 */}
                <div className="hidden lg:block absolute -right-[22px] top-[48%] -translate-y-1/2 w-[22px] h-[105px] pointer-events-none z-20">
                  <svg className="w-full h-full" viewBox="0 0 24 105" fill="none" preserveAspectRatio="none">
                    <path d="M 0,28 C 9,28 10,52 14,52 C 18,52 19,22 24,22" stroke="#0284C7" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                    <path d="M 14,52 L 24,52" stroke="#0284C7" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M 0,77 C 9,77 10,52 14,52 C 18,52 19,82 24,82" stroke="#0284C7" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
              </FloatingCard>

              {/* Card 2: Faculty & Coaches (Sky Blue) */}
              <FloatingCard 
                maxTilt={3} 
                scale={1.01} 
                glare={false}
                className="relative bg-[#F4FAFF] rounded-[24px] p-4 sm:p-4.5 border border-[#0284C718] shadow-[0_4px_25px_rgba(2,132,199,0.03)] h-full"
                contentClassName="flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3.5">
                    <div className="w-8.5 h-8.5 rounded-xl bg-white text-[#0284C7] border border-[#0284C725] shadow-2xs flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4 text-[#0284C7]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                        Faculty & Coaches
                      </h3>
                      <p className="text-[11px] font-medium text-[#172B50]/60">
                        Supervised faculty team
                      </p>
                    </div>
                  </div>

                  {locationFilteredCoaches.length === 0 ? (
                    <div className="min-h-[258px] py-6 text-center flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-xl bg-white text-[#0284C7] border border-[#0284C720] flex items-center justify-center mb-2 shadow-2xs">
                        <Users className="w-5 h-5 text-[#0284C7]" />
                      </div>
                      <p className="text-xs font-black text-[#172B50]">No coaches assigned</p>
                    </div>
                  ) : (
                    <div className="min-h-[258px] max-h-[258px] overflow-y-auto space-y-1.5 pr-1">
                      {locationFilteredCoaches.map((c) => (
                        <div
                          key={c.id}
                          className="bg-white rounded-xl px-3 py-2 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-2 shrink-0 hover:border-[#0284C730] transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-black text-[#172B50] truncate leading-tight">{c.name}</p>
                            <p className="text-[10px] font-medium text-[#172B50]/60 mt-0.5 truncate leading-tight">
                              {c.center} • {c.specialization} ({c.rating}★)
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenIssueModal(c)}
                            className="w-6.5 h-6.5 rounded-lg bg-white border border-[#172B5018] flex items-center justify-center text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Report Faculty Issue"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-2.5 shrink-0">
                  <span className="text-[11px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                    Staff Oversight
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('coaches')}
                    className="text-[11.5px] font-black text-[#0284C7] hover:text-[#0369a1] flex items-center gap-1 group cursor-pointer transition-colors"
                  >
                    <span>Manage Faculty ({locationFilteredCoaches.length})</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Desktop Connector 2 */}
                <div className="hidden lg:block absolute -right-[22px] top-[48%] -translate-y-1/2 w-[22px] h-[105px] pointer-events-none z-20">
                  <svg className="w-full h-full" viewBox="0 0 24 105" fill="none" preserveAspectRatio="none">
                    <path d="M 0,22 C 9,22 10,52 14,52 C 18,52 19,22 24,22" stroke="#F4510B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                    <path d="M 0,52 L 24,52" stroke="#F4510B" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M 0,82 C 9,82 10,52 14,52 C 18,52 19,82 24,82" stroke="#F4510B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
              </FloatingCard>

              {/* Card 3: Class Schedule (Emerald) */}
              <FloatingCard 
                maxTilt={3} 
                scale={1.01} 
                glare={false}
                className="relative bg-[#F4FDF7] rounded-[24px] p-4 sm:p-4.5 border border-[#16A34A18] shadow-[0_4px_25px_rgba(22,163,74,0.03)] h-full"
                contentClassName="flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3.5">
                    <div className="w-8.5 h-8.5 rounded-xl bg-white text-[#16A34A] border border-[#16A34A25] shadow-2xs flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-[#16A34A]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                        Class Schedule
                      </h3>
                    </div>
                  </div>

                  {todayClasses.length === 0 ? (
                    <div className="min-h-[258px] py-6 text-center flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-xl bg-white text-[#16A34A] border border-[#16A34A20] flex items-center justify-center mb-2 shadow-2xs">
                        <Clock className="w-5 h-5 text-[#16A34A]" />
                      </div>
                      <p className="text-xs font-black text-[#172B50]">No classes today</p>
                      <button
                        type="button"
                        onClick={() => setIsCreateScheduleModalOpen(true)}
                        className="mt-3 px-3 py-1.5 text-xs font-bold text-[#16A34A] bg-white border border-[#16A34A30] hover:bg-[#16A34A] hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                      >
                        + Create Class
                      </button>
                    </div>
                  ) : (
                    <div className="min-h-[258px] max-h-[258px] overflow-y-auto space-y-1.5 pr-1">
                      {todayClasses.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl px-3 py-2 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-2 shrink-0 hover:border-[#16A34A30] transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-black text-[#172B50] truncate leading-tight">
                              {item.startTime} • {item.className || item.batch}
                            </p>
                            <p className="text-[10px] font-medium text-[#172B50]/60 mt-0.5 truncate leading-tight">
                              {item.location} • Coach: {item.coachName}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenReassign(item)}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[#172B500C] text-[#172B50] hover:bg-[#F4510B] hover:text-white transition-colors cursor-pointer shrink-0"
                          >
                            Reassign
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-2.5 shrink-0">
                  <span className="text-[11px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                    Class Schedule
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('schedules')}
                    className="text-[11.5px] font-black text-[#16A34A] hover:text-[#15803d] flex items-center gap-1 group cursor-pointer transition-colors"
                  >
                    <span>View All ({todayClasses.length})</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Desktop Connector 3 */}
                <div className="hidden lg:block absolute -right-[22px] top-[48%] -translate-y-1/2 w-[22px] h-[105px] pointer-events-none z-20">
                  <svg className="w-full h-full" viewBox="0 0 24 105" fill="none" preserveAspectRatio="none">
                    <path d="M 0,82 C 10,82 12,30 24,30" stroke="#0284C7" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                    <circle cx="2" cy="82" r="2" fill="#0284C7" />
                    <circle cx="22" cy="30" r="2" fill="#0284C7" />
                  </svg>
                </div>
              </FloatingCard>

              {/* Card 4: Operations Command (White with 2x2 Action Tiles) */}
              <FloatingCard 
                maxTilt={3} 
                scale={1.01} 
                glare={false}
                className="relative bg-white rounded-[24px] p-4 sm:p-4.5 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)] h-full"
                contentClassName="flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3.5">
                    <div className="w-8.5 h-8.5 rounded-xl bg-[#FFF5ED] text-[#F4510B] border border-[#F4510B25] shadow-2xs flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4 text-[#F4510B]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                        Operations Command
                      </h3>
                      <p className="text-[11px] font-medium text-[#172B50]/60">
                        Super Coach execution
                      </p>
                    </div>
                  </div>

                  <div className="min-h-[258px] max-h-[258px] flex flex-col justify-center">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Tile 1: Create Class */}
                      <button
                        type="button"
                        onClick={() => setIsCreateScheduleModalOpen(true)}
                        className="bg-[#0B3B60] text-white rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm hover:bg-[#082d4a] active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                          <Plus className="w-4.5 h-4.5 text-white" />
                        </div>
                        <span className="text-xs font-black text-white leading-tight">
                          Create Class
                        </span>
                        <span className="text-[9.5px] font-medium text-white/70 mt-0.5">
                          New Timetable
                        </span>
                      </button>

                      {/* Tile 2: Attendance */}
                      <button
                        type="button"
                        onClick={() => setActiveTab('attendance')}
                        className="bg-white text-[#172B50] rounded-xl p-3 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#FFF4E8] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                          <CheckCircle2 className="w-4.5 h-4.5 text-[#172B50]" />
                        </div>
                        <span className="text-xs font-black text-[#172B50] leading-tight">
                          Attendance
                        </span>
                        <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                          Coach Roll Call
                        </span>
                      </button>

                      {/* Tile 3: Equipment */}
                      <button
                        type="button"
                        onClick={() => setActiveTab('equipment')}
                        className="bg-white text-[#172B50] rounded-xl p-3 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                          <Package className="w-4.5 h-4.5 text-emerald-600" />
                        </div>
                        <span className="text-xs font-black text-[#172B50] leading-tight">
                          Equipment
                        </span>
                        <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                          Health: {kpis.equipmentHealth}%
                        </span>
                      </button>

                      {/* Tile 4: Locations */}
                      <button
                        type="button"
                        onClick={() => setActiveTab('locations')}
                        className="bg-white text-[#172B50] rounded-xl p-3 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#F0F7FF] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                          <MapPin className="w-4.5 h-4.5 text-[#0284C7]" />
                        </div>
                        <span className="text-xs font-black text-[#172B50] leading-tight">
                          Location Hub
                        </span>
                        <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                          {assignedLocations.length} Centers
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-2.5 shrink-0">
                  <span className="text-[11px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                    Quick Access
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reports')}
                    className="text-[11.5px] font-black text-[#172B50] hover:text-[#F4510B] flex items-center gap-1 group cursor-pointer transition-colors"
                  >
                    <span>Reports & Analytics</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </FloatingCard>

            </div>
          </div>

          {/* ============================================================ */}
          {/* 3. MIDDLE ROW: Today's Classes, Operational Performance & Network */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
            
            {/* Card 1: Today's Classes Table */}
            <FloatingCard 
              maxTilt={2} 
              scale={1.006} 
              glare={false}
              className="w-full bg-white rounded-[28px] p-5 sm:p-6 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)] h-[440px] min-h-[440px]"
              contentClassName="flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#172B5010]">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0 shadow-2xs">
                    <CalendarDays className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#F4510B]" />
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-[#172B50] tracking-tight">
                    Today's Classes
                  </h2>
                </div>
              </div>

              {todayClasses.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-4 my-auto">
                  <div className="w-11 h-11 rounded-2xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center mb-2.5 shadow-2xs">
                    <CalendarDays className="w-5.5 h-5.5" />
                  </div>
                  <p className="text-xs sm:text-sm font-black text-[#172B50]">
                    No classes scheduled for today
                  </p>
                  <p className="text-[11px] text-[#172B50]/60 mt-1 max-w-[240px]">
                    Active classes across your centers will appear here
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[300px] mt-1 pr-0.5 scrollbar-thin">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-[#172B5010] text-[#172B50]/60 font-black uppercase tracking-wider text-[10px]">
                        <th className="py-2 px-2.5">TIME</th>
                        <th className="py-2 px-2.5">PROGRAM</th>
                        <th className="py-2 px-2.5">COACH</th>
                        <th className="py-2 px-2.5">LOCATION</th>
                        <th className="py-2 px-2.5 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#172B500C]">
                      {todayClasses.slice(0, 5).map((cls) => (
                        <tr 
                          key={cls.id} 
                          className="hover:bg-[#FFF4E8]/30 transition-colors"
                        >
                          <td className="py-2.5 px-2.5">
                            <div className="flex items-center gap-1.5 font-black text-[#172B50]">
                              <Clock className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                              <span>{cls.startTime || '09:00 AM'}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2.5 font-extrabold text-[#172B50] max-w-[130px] truncate">
                            {cls.className || cls.batch || 'Training Session'}
                          </td>
                          <td className="py-2.5 px-2.5">
                            <div className="flex items-center gap-1 font-bold text-[#172B50]/85">
                              <User className="w-3 h-3 text-[#172B50]/40 shrink-0" />
                              <span className="truncate max-w-[90px]">{cls.coachName || 'Coach'}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2.5">
                            <div className="flex items-center gap-1 font-bold text-[#172B50]/75">
                              <MapPin className="w-3 h-3 text-[#F4510B] shrink-0" />
                              <span>{cls.location}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenReassign(cls)}
                              className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#FFF4E8] text-[#F4510B] hover:bg-[#F4510B] hover:text-white transition-colors cursor-pointer"
                            >
                              Reassign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-auto shrink-0">
                <span className="text-[11px] font-bold text-[#172B50]/60 uppercase tracking-wider">
                  Daily Timetable
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('schedules')}
                  className="text-[11.5px] font-black text-[#F4510B] hover:text-[#d44307] flex items-center gap-1 group cursor-pointer transition-colors"
                >
                  <span>Explore all classes</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </FloatingCard>

            {/* Card 2: Faculty & Equipment Performance */}
            <FloatingCard 
              maxTilt={2} 
              scale={1.006} 
              glare={false}
              className="w-full bg-white rounded-[28px] p-5 sm:p-6 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)] h-[440px] min-h-[440px]"
              contentClassName="flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-[#172B5010]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0 shadow-2xs">
                      <BarChart2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#F4510B]" />
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-[#172B50] tracking-tight">
                      Operations Performance
                    </h2>
                  </div>
                  <span className="text-[10.5px] font-extrabold text-[#F4510B] bg-[#FFF5ED] px-2.5 py-1 rounded-full border border-[#F4510B20] select-none">
                    {kpis.totalClasses} Sessions
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center py-2.5 my-auto">
                <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                  {/* KPI 1 */}
                  <div 
                    onClick={() => setActiveTab('locations')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#F0F7FF] border border-[#0284C720] flex flex-col justify-between hover:border-[#0284C750] transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-[#0284C7]" />
                        </div>
                        <span className="text-[11px] font-black text-[#172B50] group-hover:text-[#0284C7] transition-colors">
                          Locations
                        </span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                        {kpis.assignedLocationsCount}
                      </span>
                      <span className="text-[9.5px] font-bold text-[#172B50]/55 uppercase tracking-wide">
                        Centers
                      </span>
                    </div>
                  </div>

                  {/* KPI 2 */}
                  <div 
                    onClick={() => setActiveTab('coaches')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF5FF] border border-[#9333EA20] flex flex-col justify-between hover:border-[#9333EA50] transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
                          <Users className="w-3.5 h-3.5 text-[#9333EA]" />
                        </div>
                        <span className="text-[11px] font-black text-[#172B50] group-hover:text-[#9333EA] transition-colors">
                          Faculty
                        </span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-[#9333EA]" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                        {kpis.totalCoaches}
                      </span>
                      <span className="text-[9.5px] font-bold text-[#172B50]/55 uppercase tracking-wide">
                        Coaches
                      </span>
                    </div>
                  </div>

                  {/* KPI 3 */}
                  <div 
                    onClick={() => setActiveTab('schedules')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#F0FDF4] border border-[#16A34A20] flex flex-col justify-between hover:border-[#16A34A50] transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                          <Clock className="w-3.5 h-3.5 text-[#16A34A]" />
                        </div>
                        <span className="text-[11px] font-black text-[#172B50] group-hover:text-[#16A34A] transition-colors">
                          Today
                        </span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                        {kpis.todayClassesCount}
                      </span>
                      <span className="text-[9.5px] font-bold text-[#172B50]/55 uppercase tracking-wide">
                        Classes
                      </span>
                    </div>
                  </div>

                  {/* KPI 4 */}
                  <div 
                    onClick={() => setActiveTab('equipment')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#FFF5ED] border border-[#F4510B20] flex flex-col justify-between hover:border-[#F4510B50] transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-[#FFE2D1] text-[#F4510B] flex items-center justify-center shrink-0">
                          <Package className="w-3.5 h-3.5 text-[#F4510B]" />
                        </div>
                        <span className="text-[11px] font-black text-[#172B50] group-hover:text-[#F4510B] transition-colors">
                          Equipment
                        </span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-[#F4510B]" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                        {kpis.equipmentHealth}%
                      </span>
                      <span className="text-[9.5px] font-bold text-[#172B50]/55 uppercase tracking-wide">
                        Health
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#172B500C] flex items-center justify-between text-xs px-1">
                  <span className="text-[11px] font-bold text-[#172B50]/65">
                    Equipment Alerts
                  </span>
                  <span className="text-[11px] font-black text-[#F4510B] bg-[#FFF5ED] px-2.5 py-0.5 rounded-lg border border-[#F4510B20]">
                    {kpis.pendingEquipmentReports} pending reports
                  </span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-auto shrink-0">
                <span className="text-[11px] font-bold text-[#172B50]/60 uppercase tracking-wider">
                  Operational Metrics
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('reports')}
                  className="text-[11.5px] font-black text-[#F4510B] hover:text-[#d44307] flex items-center gap-1 group cursor-pointer transition-colors"
                >
                  <span>Explore performance</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </FloatingCard>

            {/* Card 3: Location Network & Centers */}
            <FloatingCard 
              maxTilt={2} 
              scale={1.006} 
              glare={false}
              className="w-full bg-white rounded-[28px] p-5 sm:p-6 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)] h-[440px] min-h-[440px]"
              contentClassName="flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center gap-3 pb-3.5 border-b border-[#172B5010]">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0 shadow-2xs">
                    <Building2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#F4510B]" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-[#172B50] tracking-tight">
                      Academy Operations
                    </h2>
                    <p className="text-[11px] font-medium text-[#172B50]/60">
                      Centers, faculty & equipment
                    </p>
                  </div>
                </div>

                <div className="min-h-[265px] flex flex-col justify-center mt-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Tile 1: Coaches & Staff */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('coaches')}
                      className="bg-[#0B3B60] text-white rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-center text-center shadow-sm hover:bg-[#082d4a] active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-white/10 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <UserCheck className="w-4.5 h-4.5 text-white" />
                      </div>
                      <span className="text-xs font-black text-white leading-tight">
                        Coaches & Staff
                      </span>
                      <span className="text-[9.5px] font-medium text-white/70 mt-0.5">
                        {locationFilteredCoaches.length} Faculty
                      </span>
                    </button>

                    {/* Tile 2: Training Centers */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('locations')}
                      className="bg-white text-[#172B50] rounded-2xl p-3 sm:p-3.5 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#F4510B35] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-[#FFF5ED] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <MapPin className="w-4.5 h-4.5 text-[#F4510B]" />
                      </div>
                      <span className="text-xs font-black text-[#172B50] leading-tight">
                        Training Centers
                      </span>
                      <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                        {assignedLocations.length} Centers
                      </span>
                    </button>

                    {/* Tile 3: Class Timetables */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('schedules')}
                      className="bg-white text-[#172B50] rounded-2xl p-3 sm:p-3.5 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#F4510B35] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-[#FFF4E8] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <Calendar className="w-4.5 h-4.5 text-[#F4510B]" />
                      </div>
                      <span className="text-xs font-black text-[#172B50] leading-tight">
                        Class Schedules
                      </span>
                      <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                        {scopedSchedules.length} Sessions
                      </span>
                    </button>

                    {/* Tile 4: Equipment & Kits */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('equipment')}
                      className="bg-white text-[#172B50] rounded-2xl p-3 sm:p-3.5 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#0284C735] hover:bg-[#F0F9FF] active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-[#F0F9FF] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <Package className="w-4.5 h-4.5 text-[#0284C7]" />
                      </div>
                      <span className="text-xs font-black text-[#172B50] leading-tight">
                        Equipment & Kits
                      </span>
                      <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                        {scopedEquipment.length} Items Tracked
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-auto shrink-0">
                <span className="text-[11px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                  Academy Network
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('locations')}
                  className="text-[11.5px] font-black text-[#172B50] hover:text-[#F4510B] flex items-center gap-1 group cursor-pointer transition-colors"
                >
                  <span>View All Locations ({assignedLocations.length})</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </FloatingCard>

          </div>

        </div>
      )}

      {/* 3. TAB 2: MULTI-LOCATION HUB: ADAPTED FROM ADMIN ACADEMY SETTINGS & CENTERS */}
      {activeTab === 'locations' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Multi-Location Operations Hub
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Center operational oversight, arena capacity, equipment distribution, and staffing compliance across authorized branches
              </p>
            </div>
          </div>

          {/* Top 4 KPI Cards matching Admin Academy Settings */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-[#FFF4E8] border border-[#F4510B25] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B18] text-[#F4510B] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Authorized Centers</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {scopedLocations.length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0FDF4] border border-[#16A34A20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#16A34A18] text-[#16A34A] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Arenas &amp; Courts</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {scopedLocations.reduce((sum, l) => sum + (l.courts?.length || 0), 0)}
                </div>
              </div>
            </div>

            <div className="bg-[#F0F7FF] border border-[#0284C720] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#0284C718] text-[#0284C7] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-[#0284C7]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Supervised Faculty</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {scopedCoaches.length}
                </div>
              </div>
            </div>

            <div className="bg-[#FFF9F5] border border-[#F4510B20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B15] text-[#F4510B] flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Enrolled Athletes</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {scopedStudents.length}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {scopedLocations.map((loc) => {
              const locStudents = scopedStudents.filter((s) => s.center === loc.name);
              const locCoaches = scopedCoaches.filter((c) => c.center === loc.name);
              const locEq = scopedEquipment.filter((i) => i.location === loc.name);
              const locSchedules = scopedSchedules.filter((s) => s.location === loc.name);

              return (
                <FloatingCard
                  key={loc.id}
                  className="bg-white rounded-3xl p-6 border border-[#172B5014] shadow-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[#F4510B]">
                        <MapPin className="w-4 h-4" />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider">
                          Academy Location
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-[#172B50] mt-1">{loc.name}</h3>
                      <p className="text-xs text-[#172B50] opacity-60 mt-0.5">{loc.address}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Operational
                    </span>
                  </div>

                  {/* Courts list */}
                  <div className="mt-4 pt-3 border-t border-[#172B5010]">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#172B50] opacity-60 block mb-1.5">
                      Courts &amp; Arenas ({loc.courts?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(loc.courts || []).map((court, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5015]"
                        >
                          {court}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Operational counts */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#172B5010]">
                    <div className="p-2.5 rounded-xl bg-[#FFF4E8]/60 text-center">
                      <span className="text-[10px] font-bold text-[#172B50] opacity-70 block">Coaches</span>
                      <strong className="text-lg font-black text-[#172B50]">
                        <AnimatedCounter value={locCoaches.length} />
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FFF4E8]/60 text-center">
                      <span className="text-[10px] font-bold text-[#172B50] opacity-70 block">Athletes</span>
                      <strong className="text-lg font-black text-[#172B50]">
                        <AnimatedCounter value={locStudents.length} />
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FFF4E8]/60 text-center">
                      <span className="text-[10px] font-bold text-[#172B50] opacity-70 block">Equipment Types</span>
                      <strong className="text-lg font-black text-[#172B50]">
                        <AnimatedCounter value={locEq.length} />
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FFF4E8]/60 text-center">
                      <span className="text-[10px] font-bold text-[#172B50] opacity-70 block">Active Schedules</span>
                      <strong className="text-lg font-black text-[#172B50]">
                        <AnimatedCounter value={locSchedules.length} />
                      </strong>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLocation(loc.name);
                        setActiveTab('coaches');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#172B50] text-white hover:bg-[#F4510B] transition-colors cursor-pointer"
                    >
                      Inspect Operations →
                    </button>
                  </div>
                </FloatingCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. TAB 3: COACH MANAGEMENT                                    */}
      {/* ============================================================ */}
      {activeTab === 'coaches' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Coaching Faculty &amp; Supervision
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Faculty qualifications, session allocations, student ratios, and supervisory performance oversight
              </p>
            </div>
          </div>

          {/* Top 4 KPI Cards matching Admin CoachManagement */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-[#FFF4E8] border border-[#F4510B25] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B18] text-[#F4510B] flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Faculty Members</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {scopedCoaches.length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0FDF4] border border-[#16A34A20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#16A34A18] text-[#16A34A] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Certified Specialists</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {scopedCoaches.filter(c => c.certification).length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0F7FF] border border-[#0284C720] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#0284C718] text-[#0284C7] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-[#0284C7]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Active Batches</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {scopedSchedules.length}
                </div>
              </div>
            </div>

            <div className="bg-[#FFF9F5] border border-[#F4510B20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B15] text-[#F4510B] flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Faculty Rating</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  4.9 ★
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#172B5014] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-5 rounded-full bg-[#F4510B]" />
              <h3 className="text-base font-black text-[#172B50]">
                Coaching Faculty across Assigned Locations
              </h3>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-[#172B50] opacity-50 absolute left-3 top-2.5" />
              <input
                type="text"
                value={coachSearch}
                onChange={(e) => setCoachSearch(e.target.value)}
                placeholder="Search coach by name or specialization..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020] focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {locationFilteredCoaches.map((coach) => {
              const coachSchedules = scopedSchedules.filter((s) => s.coachId === coach.id);
              const coachStudents = scopedStudents.filter((st) => st.coachName === coach.name);

              return (
                <div
                  key={coach.id}
                  className="bg-white rounded-3xl p-5 border border-[#172B5014] shadow-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#172B50] text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm">
                          {coach.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-base font-black text-[#172B50]">{coach.name}</h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#F4510B] text-white inline-block mt-0.5">
                            {coach.center}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {coach.rating} ★
                      </span>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="opacity-70">Discipline:</span>
                        <strong className="text-[#172B50]">{coach.specialization}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="opacity-70">Credentials:</span>
                        <strong className="text-[#172B50]">{coach.certification || 'Certified Coach'}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="opacity-70">Experience:</span>
                        <strong className="text-[#172B50]">{coach.experience || '4+ Yrs'}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="opacity-70">Active Batches:</span>
                        <strong className="text-[#172B50]">{coachSchedules.length} Sessions</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="opacity-70">Assigned Athletes:</span>
                        <strong className="text-[#172B50]">{coachStudents.length} Students</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#172B5010] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenIssueModal(coach)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Report Issue</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLocation(coach.center);
                        setActiveTab('schedules');
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#172B50] hover:bg-[#F4510B] text-white transition-colors cursor-pointer"
                    >
                      View Timetable
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. TAB 4: EQUIPMENT MANAGEMENT MODULE                         */}
      {/* ============================================================ */}
      {activeTab === 'equipment' && (
        <EquipmentManagementModule
          role="super_coach"
          allowedLocations={assignedLocations}
        />
      )}

      {/* ============================================================ */}
      {/* 6. TAB 5: CLASS & SCHEDULE MANAGEMENT                         */}
      {/* ============================================================ */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Class Timetable &amp; Schedule Oversight
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Session scheduling, court allocations, and coach reassignment across authorized locations
              </p>
            </div>
          </div>

          {/* Top 4 KPI Cards matching Admin ClassSchedulesPage */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-[#FFF4E8] border border-[#F4510B25] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B18] text-[#F4510B] flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Published Schedules</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {scopedSchedules.length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0FDF4] border border-[#16A34A20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#16A34A18] text-[#16A34A] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Authorized Centers</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {assignedLocations.length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0F7FF] border border-[#0284C720] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#0284C718] text-[#0284C7] flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 text-[#0284C7]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Instructors Assigned</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {new Set(scopedSchedules.map(s => s.coachName)).size}
                </div>
              </div>
            </div>

            <div className="bg-[#FFF9F5] border border-[#F4510B20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B15] text-[#F4510B] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Status Compliance</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  100%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#172B5014] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-5 rounded-full bg-[#F4510B]" />
              <h3 className="text-base font-black text-[#172B50]">
                Class Timetable for Authorized Locations
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateScheduleModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F4510B] hover:bg-[#E04505] text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Schedule</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#172B5014] shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#172B50]">
                <thead className="bg-[#FFF4E8] border-b border-[#172B5015] text-[10.5px] font-extrabold uppercase tracking-wider text-[#172B50]">
                  <tr>
                    <th className="py-3 px-4">Class / Batch</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Assigned Coach</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Time</th>
                    <th className="py-3 px-3">Venue</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B5010]">
                  {scopedSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs opacity-60">
                        No active class schedules found in your assigned locations.
                      </td>
                    </tr>
                  ) : (
                    scopedSchedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-[#FFF4E8]/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold">
                          <span className="text-sm font-black text-[#172B50] block">
                            {schedule.className || schedule.batch}
                          </span>
                          <span className="text-[11px] opacity-60">{schedule.program}</span>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-[#F4510B]">
                          {schedule.location}
                        </td>
                        <td className="py-3.5 px-3 font-bold">
                          {schedule.coachName}
                        </td>
                        <td className="py-3.5 px-3 text-xs">
                          {schedule.date}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-xs">
                          {schedule.startTime} - {schedule.endTime}
                        </td>
                        <td className="py-3.5 px-3 text-xs opacity-75">
                          {schedule.venue}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              schedule.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : schedule.status === 'Cancelled'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {schedule.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenReassign(schedule)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#172B50] hover:bg-[#F4510B] text-white transition-colors cursor-pointer"
                          >
                            Reassign
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. TAB 6: ATTENDANCE & PERFORMANCE: ADAPTED FROM ADMIN ATTENDANCE & COMPENSATION */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Attendance &amp; Performance Oversight
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Centralized student attendance register, faculty attendance calendar, and skill progression across authorized locations
              </p>
            </div>
          </div>

          {/* Sub-tab Navigation matching Admin Attendance Module */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-[#172B5018] shadow-2xs self-start w-fit">
            <button
              type="button"
              onClick={() => setAttendanceSubView('student_attendance')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                attendanceSubView === 'student_attendance'
                  ? 'bg-[#F4510B] text-white shadow-xs'
                  : 'text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B]'
              }`}
            >
              Student Attendance Register
            </button>
            <button
              type="button"
              onClick={() => setAttendanceSubView('coach_register')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                attendanceSubView === 'coach_register'
                  ? 'bg-[#F4510B] text-white shadow-xs'
                  : 'text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B]'
              }`}
            >
              Coach Attendance Register
            </button>
            <button
              type="button"
              onClick={() => setAttendanceSubView('coach_leaves')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                attendanceSubView === 'coach_leaves'
                  ? 'bg-[#F4510B] text-white shadow-xs'
                  : 'text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B]'
              }`}
            >
              Coach Leave Requests{(data.coachLeaveRequests || []).filter(r => r.status === 'Pending').length > 0 ? ` (${(data.coachLeaveRequests || []).filter(r => r.status === 'Pending').length})` : ''}
            </button>

            <button
              type="button"
              onClick={() => setAttendanceSubView('student_progression')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                attendanceSubView === 'student_progression'
                  ? 'bg-[#F4510B] text-white shadow-xs'
                  : 'text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B]'
              }`}
            >
              Student Progression Oversight
            </button>
          </div>

          {attendanceSubView === 'student_attendance' && (
            <AttendanceManagement
              allowedLocations={assignedLocations}
              portalRole="super_coach"
            />
          )}

          {attendanceSubView === 'coach_register' && (
            <CoachAttendanceRegister 
              currentPortal="super_coach" 
              allowedCoaches={scopedCoaches} 
            />
          )}

          {attendanceSubView === 'student_progression' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-[#172B5014] shadow-card">
                  <span className="text-xs font-bold uppercase opacity-70 block">Average Attendance Rate</span>
                  <p className="text-3xl font-black text-emerald-700 mt-1">94.2%</p>
                  <span className="text-xs text-emerald-600 font-semibold mt-1 block">
                    Consistent across {assignedLocations.length} locations
                  </span>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#172B5014] shadow-card">
                  <span className="text-xs font-bold uppercase opacity-70 block">Submitted Register Compliance</span>
                  <p className="text-3xl font-black text-blue-700 mt-1">100%</p>
                  <span className="text-xs text-blue-600 font-semibold mt-1 block">
                    Zero missed attendance submissions today
                  </span>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#172B5014] shadow-card">
                  <span className="text-xs font-bold uppercase opacity-70 block">Active Student Athletes</span>
                  <p className="text-3xl font-black text-[#172B50] mt-1">{scopedStudents.length}</p>
                  <span className="text-xs text-[#172B50] opacity-60 font-semibold mt-1 block">
                    Across {scopedLocations.length} assigned centers
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#172B5014] shadow-card">
                <h3 className="text-base font-black text-[#172B50] mb-3">
                  Student Attendance &amp; Skill Progression Oversight
                </h3>
                <p className="text-xs text-[#172B50] opacity-70 mb-5">
                  Super Coach can monitor student participation and verify coach performance metrics without accessing financial records.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#172B50]">
                    <thead className="bg-[#FFF4E8] border-b border-[#172B5015] text-[10.5px] font-extrabold uppercase">
                      <tr>
                        <th className="py-3 px-4">Student Athlete</th>
                        <th className="py-3 px-3">Location</th>
                        <th className="py-3 px-3">Enrolled Program</th>
                        <th className="py-3 px-3">Lead Coach</th>
                        <th className="py-3 px-3 text-center">Attendance Streak</th>
                        <th className="py-3 px-3 text-center">Skill Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#172B5010]">
                      {scopedStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-xs opacity-60">
                            No students enrolled in your assigned locations yet.
                          </td>
                        </tr>
                      ) : (
                        scopedStudents.map((st) => (
                          <tr key={st.id} className="hover:bg-[#FFF4E8]/40">
                            <td className="py-3 px-4 font-bold">{st.name}</td>
                            <td className="py-3 px-3 font-bold text-[#F4510B]">{st.center}</td>
                            <td className="py-3 px-3">{st.program || 'Junior Athletics'}</td>
                            <td className="py-3 px-3 font-semibold">{st.coachName || 'Assigned Coach'}</td>
                            <td className="py-3 px-3 text-center font-bold text-emerald-700">100%</td>
                            <td className="py-3 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FFF5ED] text-[#F4510B]">
                                4.8 / 5.0
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. TAB 7: REPORTS & ANALYTICS                                 */}
      {/* ============================================================ */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#172B5014] shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Super Coach Multi-Location Analytics &amp; Reports
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Generate operational audits for class completion, coach rosters, equipment health, and attendance across authorized centers
              </p>
            </div>
          </div>

          {/* Top 4 KPI Cards matching Admin ReportsAnalytics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-[#FFF4E8] border border-[#F4510B25] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B18] text-[#F4510B] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Audit Reports</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  4 Available
                </div>
              </div>
            </div>

            <div className="bg-[#F0FDF4] border border-[#16A34A20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#16A34A18] text-[#16A34A] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Reporting Centers</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {assignedLocations.length} Centers
                </div>
              </div>
            </div>

            <div className="bg-[#F0F7FF] border border-[#0284C720] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#0284C718] text-[#0284C7] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#0284C7]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Compliance Rate</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  100%
                </div>
              </div>
            </div>

            <div className="bg-[#FFF9F5] border border-[#F4510B20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B15] text-[#F4510B] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Cadence</div>
                <div className="text-base sm:text-lg font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  Weekly Sync
                </div>
              </div>
            </div>
          </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#FFF4E8] border border-[#172B5015] flex flex-col justify-between">
                <div>
                  <FileText className="w-6 h-6 text-[#F4510B] mb-2" />
                  <h4 className="text-sm font-black text-[#172B50]">Location Performance Report</h4>
                  <p className="text-xs text-[#172B50] opacity-70 mt-1">
                    Multi-center participation, attendance compliance &amp; court utilization.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addToast('Location performance report generated for download.', 'success')}
                  className="mt-4 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#172B50] text-white hover:bg-[#F4510B] transition-colors cursor-pointer"
                >
                  Download Report
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF4E8] border border-[#172B5015] flex flex-col justify-between">
                <div>
                  <UserCheck className="w-6 h-6 text-emerald-600 mb-2" />
                  <h4 className="text-sm font-black text-[#172B50]">Coach Performance Audit</h4>
                  <p className="text-xs text-[#172B50] opacity-70 mt-1">
                    Attendance registers, batch progress, and reported operational issues.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addToast('Coach performance audit exported.', 'success')}
                  className="mt-4 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#172B50] text-white hover:bg-[#F4510B] transition-colors cursor-pointer"
                >
                  Download Report
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF4E8] border border-[#172B5015] flex flex-col justify-between">
                <div>
                  <Package className="w-6 h-6 text-blue-600 mb-2" />
                  <h4 className="text-sm font-black text-[#172B50]">Equipment Inventory &amp; Damage</h4>
                  <p className="text-xs text-[#172B50] opacity-70 mt-1">
                    Complete stock audit, verified coach reports, and maintenance backlog.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addToast('Equipment inventory report downloaded.', 'success')}
                  className="mt-4 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#172B50] text-white hover:bg-[#F4510B] transition-colors cursor-pointer"
                >
                  Download Report
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF4E8] border border-[#172B5015] flex flex-col justify-between">
                <div>
                  <GraduationCap className="w-6 h-6 text-purple-600 mb-2" />
                  <h4 className="text-sm font-black text-[#172B50]">Student Progress Ledger</h4>
                  <p className="text-xs text-[#172B50] opacity-70 mt-1">
                    Program evaluations, age-group assessments, and skill badges.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addToast('Student progress ledger exported.', 'success')}
                  className="mt-4 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#172B50] text-white hover:bg-[#F4510B] transition-colors cursor-pointer"
                >
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: REASSIGN COACH TO CLASS                                */}
      {/* ============================================================ */}
      <Modal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        title="Reassign Coach to Class Session"
        subtitle={`${selectedSchedule?.className} at ${selectedSchedule?.location} (${selectedSchedule?.date} ${selectedSchedule?.startTime})`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveReassign} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">New Coach Assignment *</label>
            <select
              value={reassignForm.newCoachId}
              onChange={(e) => setReassignForm({ ...reassignForm, newCoachId: e.target.value })}
              className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            >
              <option value="">Select Coach</option>
              {scopedCoaches
                .filter((c) => !selectedSchedule?.location || c.center === selectedSchedule.location)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.specialization}) - {c.center}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Reassignment Reason / Note</label>
            <textarea
              rows={2}
              value={reassignForm.note}
              onChange={(e) => setReassignForm({ ...reassignForm, note: e.target.value })}
              placeholder="e.g. Substitute coverage for lead coach attending training workshop..."
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReassignModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm cursor-pointer"
            >
              Save Reassignment
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL: REPORT COACH ISSUE TO ADMIN                            */}
      {/* ============================================================ */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Report Coach Issue to Admin"
        subtitle={`Flagging operational matter for Coach ${selectedCoachForIssue?.name} (${selectedCoachForIssue?.center})`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveIssue} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Issue Category</label>
              <select
                value={issueForm.issueType}
                onChange={(e) => setIssueForm({ ...issueForm, issueType: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              >
                <option value="Punctuality & Attendance">Punctuality &amp; Attendance</option>
                <option value="Curriculum Non-Compliance">Curriculum Non-Compliance</option>
                <option value="Parent Interaction Matter">Parent Interaction Matter</option>
                <option value="Equipment Mishandling">Equipment Mishandling</option>
                <option value="Other Operational Incident">Other Operational Incident</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Priority Level</label>
              <select
                value={issueForm.priority}
                onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High (Requires Admin Review)</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Incident Report Details *</label>
            <textarea
              required
              rows={3}
              value={issueForm.description}
              onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
              placeholder="Provide exact facts, date/time, and context for Director & Super Admin review..."
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm cursor-pointer"
            >
              Dispatch to Admin
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL: CREATE CLASS SCHEDULE (Super Coach)                   */}
      {/* ============================================================ */}
      <Modal
        isOpen={isCreateScheduleModalOpen}
        onClose={() => setIsCreateScheduleModalOpen(false)}
        title="Create Class Schedule"
        subtitle="Schedule a class in an authorized location"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateScheduleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Class Title</label>
            <input
              type="text"
              required
              value={newScheduleForm.className}
              onChange={(e) => setNewScheduleForm({ ...newScheduleForm, className: e.target.value })}
              placeholder="e.g. Spartan Gymnastics & Tumbling - Batch Alpha"
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Location *</label>
              <select
                value={newScheduleForm.location}
                onChange={(e) => setNewScheduleForm({ ...newScheduleForm, location: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              >
                {assignedLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Assigned Coach *</label>
              <select
                value={newScheduleForm.coachId}
                onChange={(e) => setNewScheduleForm({ ...newScheduleForm, coachId: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              >
                <option value="">Select Coach</option>
                {scopedCoaches
                  .filter((c) => c.center === newScheduleForm.location)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.specialization})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Date</label>
              <input
                type="date"
                required
                value={newScheduleForm.date}
                onChange={(e) => setNewScheduleForm({ ...newScheduleForm, date: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Start Time</label>
              <input
                type="time"
                required
                value={newScheduleForm.startTime}
                onChange={(e) => setNewScheduleForm({ ...newScheduleForm, startTime: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">End Time</label>
              <input
                type="time"
                required
                value={newScheduleForm.endTime}
                onChange={(e) => setNewScheduleForm({ ...newScheduleForm, endTime: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Court / Venue</label>
            <input
              type="text"
              value={newScheduleForm.venue}
              onChange={(e) => setNewScheduleForm({ ...newScheduleForm, venue: e.target.value })}
              placeholder="e.g. Training Court A / Practice Arena"
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateScheduleModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm cursor-pointer"
            >
              Publish Schedule
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
