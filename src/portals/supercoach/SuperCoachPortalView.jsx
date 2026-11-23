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
  Edit2,
  XCircle,
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
import EvaluationReviewModule from './EvaluationReviewModule';
import CoachManagementModule from './CoachManagementModule';
import SuperCoachDashboardView from './SuperCoachDashboardView';

export default function SuperCoachPortalView() {
  const {
    data,
    currentView,
    setCurrentView,
    currentUser,
    reassignScheduleCoach,
    reportCoachIssue,
    createClassSchedule,
    updateClassSchedule,
    cancelClassSchedule,
    addToast
  } = useCrm();

  // Super Coach assigned locations (Admin-granted access)
  const assignedLocations = useMemo(() => {
    if (Array.isArray(currentUser?.assignedLocations) && currentUser.assignedLocations.length > 0) {
      return currentUser.assignedLocations;
    }
    return ['KK NAGAR', 'KILPAUK', 'MAHALINGAPURAM', 'ANNA NAGAR'];
  }, [currentUser]);

  // Normalized location matcher for case-insensitive cross-portal sync
  const assignedLocationsNormalized = useMemo(() => {
    return assignedLocations.map((l) => (l || '').toLowerCase().trim());
  }, [assignedLocations]);

  const isLocationAuthorized = React.useCallback((locName) => {
    if (!locName) return true;
    if (!assignedLocationsNormalized || assignedLocationsNormalized.length === 0) return true;
    const norm = String(locName).toLowerCase().trim();
    return assignedLocationsNormalized.some(
      (al) => al === norm || norm.includes(al) || al.includes(norm)
    );
  }, [assignedLocationsNormalized]);

  // Active location switcher for Super Coach dashboard
  const [selectedLocation, setSelectedLocation] = useState('All');

  // Internal active tab if navigated within Super Coach Portal
  const [activeTab, setActiveTab] = useState(() => {
    if (['dashboard', 'evaluations', 'locations', 'coaches', 'equipment', 'schedules', 'attendance', 'reports'].includes(currentView)) {
      return currentView;
    }
    return 'dashboard';
  });

  // Attendance sub-view toggle: Coach Attendance Register vs Student Progression
  const [attendanceSubView, setAttendanceSubView] = useState('coach_register');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (setCurrentView) setCurrentView(tab);
  };

  // Keep activeTab synced with currentView when sidebar triggers navigation
  React.useEffect(() => {
    if (['dashboard', 'evaluations', 'locations', 'coaches', 'equipment', 'schedules', 'attendance', 'reports'].includes(currentView)) {
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
  const [isViewScheduleModalOpen, setIsViewScheduleModalOpen] = useState(false);
  const [isEditScheduleModalOpen, setIsEditScheduleModalOpen] = useState(false);
  const [isCancelScheduleModalOpen, setIsCancelScheduleModalOpen] = useState(false);

  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [viewingSchedule, setViewingSchedule] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [cancellingSchedule, setCancellingSchedule] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
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

  // Edit schedule form
  const [editScheduleForm, setEditScheduleForm] = useState({
    className: '',
    program: '',
    batch: '',
    location: '',
    coachId: '',
    coachName: '',
    date: '',
    startTime: '17:00',
    endTime: '18:00',
    venue: 'Training Court A',
    capacity: 15,
    status: 'Scheduled',
    notes: ''
  });

  // Scoped Locations Objects (case-insensitive authorized match)
  const scopedLocations = useMemo(() => {
    return (data.locations || []).filter((loc) => isLocationAuthorized(loc.name));
  }, [data.locations, isLocationAuthorized]);

  // Scoped Coaches (operating in assigned locations)
  const scopedCoaches = useMemo(() => {
    return (data.coaches || []).filter((coach) => {
      if (!coach.center) return true;
      return isLocationAuthorized(coach.center);
    });
  }, [data.coaches, isLocationAuthorized]);

  // Filtered coaches by selectedLocation
  const locationFilteredCoaches = useMemo(() => {
    return scopedCoaches.filter((coach) => {
      const matchLoc = selectedLocation === 'All' || isLocationAuthorized(coach.center);
      const matchSearch =
        !coachSearch ||
        coach.name?.toLowerCase().includes(coachSearch.toLowerCase()) ||
        coach.specialization?.toLowerCase().includes(coachSearch.toLowerCase());
      return matchLoc && matchSearch;
    });
  }, [scopedCoaches, selectedLocation, coachSearch, isLocationAuthorized]);

  // Scoped Students
  const scopedStudents = useMemo(() => {
    return (data.students || []).filter((student) => {
      if (!student.center) return true;
      return isLocationAuthorized(student.center);
    });
  }, [data.students, isLocationAuthorized]);

  // Scoped Schedules (case-insensitive location match across Admin & Super Coach)
  const scopedSchedules = useMemo(() => {
    return (data.classSchedules || []).filter((s) => isLocationAuthorized(s.location));
  }, [data.classSchedules, isLocationAuthorized]);

  // Today's classes
  const todayYmd = new Date().toISOString().split('T')[0];
  const todayClasses = useMemo(() => {
    return scopedSchedules.filter((s) => {
      const matchDate = s.date === todayYmd;
      const matchLoc = selectedLocation === 'All' || (s.location || '').toLowerCase() === selectedLocation.toLowerCase();
      return matchDate && matchLoc;
    });
  }, [scopedSchedules, todayYmd, selectedLocation]);

  // Scoped Equipment
  const scopedEquipment = useMemo(() => {
    return (data.equipment || []).filter((i) => isLocationAuthorized(i.location));
  }, [data.equipment, isLocationAuthorized]);

  // Scoped Reports
  const scopedReports = useMemo(() => {
    return (data.equipmentReports || []).filter((r) => isLocationAuthorized(r.location));
  }, [data.equipmentReports, isLocationAuthorized]);

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

  const handleOpenViewSchedule = (schedule) => {
    setViewingSchedule(schedule);
    setIsViewScheduleModalOpen(true);
  };

  const handleOpenEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setEditScheduleForm({
      className: schedule.className || schedule.batch || '',
      program: schedule.program || 'Spartan Gymnastics & Agility',
      batch: schedule.batch || 'Batch Alpha',
      location: schedule.location || assignedLocations[0],
      coachId: schedule.coachId || '',
      coachName: schedule.coachName || 'Unassigned',
      date: schedule.date || todayYmd,
      startTime: schedule.startTime || '17:00',
      endTime: schedule.endTime || '18:00',
      venue: schedule.venue || 'Training Court A',
      capacity: schedule.capacity || 15,
      status: schedule.status || 'Scheduled',
      notes: schedule.notes || ''
    });
    setIsEditScheduleModalOpen(true);
  };

  const handleEditScheduleSubmit = (e) => {
    e.preventDefault();
    if (!editingSchedule) return;

    const coach = scopedCoaches.find((c) => c.id === editScheduleForm.coachId);

    const payload = {
      className: editScheduleForm.className.trim() || `${editScheduleForm.program} (${editScheduleForm.batch})`,
      program: editScheduleForm.program,
      batch: editScheduleForm.batch,
      location: editScheduleForm.location,
      coachId: coach?.id || editScheduleForm.coachId || '',
      coachName: coach?.name || editScheduleForm.coachName || 'Unassigned',
      date: editScheduleForm.date,
      startTime: editScheduleForm.startTime,
      endTime: editScheduleForm.endTime,
      timingDisplay: `${editScheduleForm.startTime} - ${editScheduleForm.endTime}`,
      venue: editScheduleForm.venue,
      capacity: parseInt(editScheduleForm.capacity, 10) || 15,
      status: editScheduleForm.status,
      notes: editScheduleForm.notes
    };

    const res = updateClassSchedule(editingSchedule.id, payload);
    if (res.success) {
      setIsEditScheduleModalOpen(false);
      setEditingSchedule(null);
    }
  };

  const handleOpenCancelSchedule = (schedule) => {
    setCancellingSchedule(schedule);
    setCancelReason('');
    setIsCancelScheduleModalOpen(true);
  };

  const handleCancelScheduleSubmit = (e) => {
    e.preventDefault();
    if (!cancellingSchedule) return;

    const res = cancelClassSchedule(cancellingSchedule.id, cancelReason);
    if (res.success) {
      setIsCancelScheduleModalOpen(false);
      setCancellingSchedule(null);
      setCancelReason('');
    }
  };

  return (
    <div className="space-y-6">

      {/* ============================================================ */}
      {/* 1. TOP HEADER: Good Morning, Super Coach! & Action Icons     */}
      {/* ============================================================ */}
      {activeTab !== 'evaluations' && (
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
      )}

      {/* 2. TAB 1: OPERATIONS DASHBOARD */}
      {/* ============================================================ */}
      {activeTab === 'dashboard' && (
        <SuperCoachDashboardView
          kpis={kpis}
          scopedLocations={scopedLocations}
          scopedStudents={scopedStudents}
          scopedCoaches={scopedCoaches}
          locationFilteredCoaches={locationFilteredCoaches}
          todayClasses={todayClasses}
          assignedLocations={assignedLocations}
          setSelectedLocation={setSelectedLocation}
          setActiveTab={handleTabChange}
          setIsCreateScheduleModalOpen={setIsCreateScheduleModalOpen}
          handleOpenIssueModal={handleOpenIssueModal}
          handleOpenReassign={handleOpenReassign}
        />
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
        <CoachManagementModule onNavigateToEvaluations={() => setActiveTab('evaluations')} />
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
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleOpenViewSchedule(schedule)}
                              className="px-2 py-1 rounded-lg text-xs font-bold bg-[#FFF4E8] text-[#172B50] hover:text-[#F4510B] border border-[#172B5015] hover:border-[#F4510B30] transition-colors cursor-pointer flex items-center gap-1"
                              title="View Class Details"
                            >
                              <Eye className="w-3 h-3 text-[#172B50]" />
                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditSchedule(schedule)}
                              className="px-2 py-1 rounded-lg text-xs font-bold bg-[#172B50] hover:bg-[#F4510B] text-white transition-colors cursor-pointer flex items-center gap-1"
                              title="Edit Class Schedule"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenReassign(schedule)}
                              className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer flex items-center gap-1"
                              title="Reassign Coach"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Reassign</span>
                            </button>

                            {schedule.status !== 'Cancelled' && (
                              <button
                                type="button"
                                onClick={() => handleOpenCancelSchedule(schedule)}
                                className="px-2 py-1 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                                title="Cancel Class Session"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Cancel</span>
                              </button>
                            )}
                          </div>
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
      {/* 8. TAB: EVALUATION REVIEW (MATCHES REFERENCE SCREENSHOT)     */}
      {/* ============================================================ */}
      {activeTab === 'evaluations' && (
        <EvaluationReviewModule />
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

      {/* ============================================================ */}
      {/* MODAL: VIEW CLASS SCHEDULE DETAILS (Super Coach)              */}
      {/* ============================================================ */}
      <Modal
        isOpen={isViewScheduleModalOpen && Boolean(viewingSchedule)}
        onClose={() => {
          setIsViewScheduleModalOpen(false);
          setViewingSchedule(null);
        }}
        title="Class Session Details"
        subtitle={viewingSchedule?.id ? `Schedule ID: ${viewingSchedule.id}` : 'Class Overview'}
        maxWidth="max-w-lg"
      >
        {viewingSchedule && (
          <div className="space-y-4 text-xs text-[#172B50]">
            <div className="p-4 rounded-2xl bg-[#FFF4E8] border border-[#F4510B25] space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F4510B] block">
                    {viewingSchedule.program || 'Sports Program'}
                  </span>
                  <h3 className="text-base font-black text-[#172B50]">
                    {viewingSchedule.className || viewingSchedule.batch}
                  </h3>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                    viewingSchedule.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : viewingSchedule.status === 'Cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {viewingSchedule.status || 'Scheduled'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white border border-[#172B5015] shadow-2xs">
                <span className="text-[10px] font-bold text-[#172B50]/60 block uppercase">Academy Location</span>
                <span className="text-sm font-black text-[#F4510B] mt-0.5 block">{viewingSchedule.location}</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#172B5015] shadow-2xs">
                <span className="text-[10px] font-bold text-[#172B50]/60 block uppercase">Court / Arena</span>
                <span className="text-sm font-bold text-[#172B50] mt-0.5 block">{viewingSchedule.venue || 'Training Court A'}</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#172B5015] shadow-2xs">
                <span className="text-[10px] font-bold text-[#172B50]/60 block uppercase">Assigned Head Coach</span>
                <span className="text-sm font-black text-[#172B50] mt-0.5 block">{viewingSchedule.coachName || 'Unassigned'}</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#172B5015] shadow-2xs">
                <span className="text-[10px] font-bold text-[#172B50]/60 block uppercase">Session Date & Time</span>
                <span className="text-xs font-bold text-[#172B50] mt-0.5 block">
                  {viewingSchedule.date} ({viewingSchedule.startTime} - {viewingSchedule.endTime})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#172B5015] shadow-2xs">
                <span className="text-[10px] font-bold text-[#172B50]/60 block uppercase">Athlete Capacity</span>
                <span className="text-xs font-bold text-[#172B50] mt-0.5 block">
                  {viewingSchedule.enrolledCount || 12} Enrolled / {viewingSchedule.capacity || 15} Max
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#172B5015] shadow-2xs">
                <span className="text-[10px] font-bold text-[#172B50]/60 block uppercase">Batch Name</span>
                <span className="text-xs font-bold text-[#172B50] mt-0.5 block">{viewingSchedule.batch || 'Batch Alpha'}</span>
              </div>
            </div>

            {viewingSchedule.notes && (
              <div className="p-3 rounded-xl bg-[#FFF4E8]/60 border border-[#172B5015]">
                <span className="text-[10px] font-bold text-[#172B50]/70 block uppercase mb-1">Session Instructions</span>
                <p className="text-xs text-[#172B50] leading-relaxed">{viewingSchedule.notes}</p>
              </div>
            )}

            <div className="pt-3 border-t border-[#172B5015] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const s = viewingSchedule;
                  setIsViewScheduleModalOpen(false);
                  setViewingSchedule(null);
                  handleOpenReassign(s);
                }}
                className="px-3.5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                Reassign Coach
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const s = viewingSchedule;
                    setIsViewScheduleModalOpen(false);
                    setViewingSchedule(null);
                    handleOpenEditSchedule(s);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-[#172B50] hover:bg-[#F4510B] text-white rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  Edit Schedule
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsViewScheduleModalOpen(false);
                    setViewingSchedule(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl border border-[#172B5020]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* MODAL: EDIT CLASS SCHEDULE (Super Coach)                     */}
      {/* ============================================================ */}
      <Modal
        isOpen={isEditScheduleModalOpen && Boolean(editingSchedule)}
        onClose={() => {
          setIsEditScheduleModalOpen(false);
          setEditingSchedule(null);
        }}
        title={`Edit Schedule: ${editingSchedule?.id || ''}`}
        subtitle="Update class timetable, court venue, or instructor assignment"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleEditScheduleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Class Title *</label>
            <input
              type="text"
              required
              value={editScheduleForm.className}
              onChange={(e) => setEditScheduleForm({ ...editScheduleForm, className: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Location *</label>
              <select
                value={editScheduleForm.location}
                onChange={(e) => setEditScheduleForm({ ...editScheduleForm, location: e.target.value })}
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
                value={editScheduleForm.coachId}
                onChange={(e) => {
                  const c = scopedCoaches.find(co => co.id === e.target.value);
                  setEditScheduleForm({
                    ...editScheduleForm,
                    coachId: e.target.value,
                    coachName: c?.name || 'Unassigned'
                  });
                }}
                className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              >
                <option value="">Select Coach</option>
                {scopedCoaches
                  .filter((c) => !editScheduleForm.location || isLocationAuthorized(c.center))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.specialization})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Program</label>
              <select
                value={editScheduleForm.program}
                onChange={(e) => setEditScheduleForm({ ...editScheduleForm, program: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              >
                {(data.programs || []).map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
                <option value="After School Program">After School Program</option>
                <option value="School Program">School Program</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Batch / Cohort</label>
              <input
                type="text"
                value={editScheduleForm.batch}
                onChange={(e) => setEditScheduleForm({ ...editScheduleForm, batch: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Date</label>
              <input
                type="date"
                required
                value={editScheduleForm.date}
                onChange={(e) => setEditScheduleForm({ ...editScheduleForm, date: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Start Time</label>
              <input
                type="time"
                required
                value={editScheduleForm.startTime}
                onChange={(e) => setEditScheduleForm({ ...editScheduleForm, startTime: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">End Time</label>
              <input
                type="time"
                required
                value={editScheduleForm.endTime}
                onChange={(e) => setEditScheduleForm({ ...editScheduleForm, endTime: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Court / Venue</label>
              <input
                type="text"
                value={editScheduleForm.venue}
                onChange={(e) => setEditScheduleForm({ ...editScheduleForm, venue: e.target.value })}
                placeholder="e.g. Training Court A"
                className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Status</label>
              <select
                value={editScheduleForm.status}
                onChange={(e) => setEditScheduleForm({ ...editScheduleForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Updated">Updated</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Special Notes</label>
            <textarea
              rows={2}
              value={editScheduleForm.notes}
              onChange={(e) => setEditScheduleForm({ ...editScheduleForm, notes: e.target.value })}
              placeholder="e.g. Bring agility cones, warm-up drills..."
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsEditScheduleModalOpen(false);
                setEditingSchedule(null);
              }}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm cursor-pointer hover:bg-[#d84306]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL: CANCEL CLASS SCHEDULE (Super Coach)                   */}
      {/* ============================================================ */}
      <Modal
        isOpen={isCancelScheduleModalOpen && Boolean(cancellingSchedule)}
        onClose={() => {
          setIsCancelScheduleModalOpen(false);
          setCancellingSchedule(null);
        }}
        title="Cancel Class Session"
        subtitle={cancellingSchedule ? `${cancellingSchedule.className || cancellingSchedule.batch} (${cancellingSchedule.date})` : ''}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCancelScheduleSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <p className="font-bold">Are you sure you want to cancel this scheduled class?</p>
            <p className="text-[11px] mt-1 opacity-80">
              Assigned coaches and registered parents will be notified immediately of this cancellation.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Cancellation Reason *</label>
            <textarea
              required
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Unforeseen weather conditions, court maintenance..."
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsCancelScheduleModalOpen(false);
                setCancellingSchedule(null);
              }}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm cursor-pointer"
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
