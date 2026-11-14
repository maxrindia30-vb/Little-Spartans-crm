import React, { useState, useMemo } from 'react';
import {
  Shield,
  MapPin,
  Users,
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
  ArrowRight
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { AnimatedCounter } from '../../components/common/KpiCard';
import FloatingCard from '../../components/common/FloatingCard';
import Modal from '../../components/common/Modal';
import EquipmentManagementModule from '../common/EquipmentManagementModule';
import { checkScheduleConflict } from '../../services/scheduleService';

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
      {/* 1. SUPER COACH COMMAND BAR & MULTI-LOCATION SCOPE            */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B5014] shadow-card relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-7 rounded-full bg-[#F4510B]" />
              <h1 className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight">
                Super Coach Command Portal
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] shadow-xs select-none">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]"></span>
                </span>
                <span>MULTI-LOCATION OVERSIGHT</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#172B50] opacity-70 mt-1 ml-5">
              Managing operations, coaching staff, class schedules &amp; sports equipment across authorized centers
            </p>
          </div>

          {/* Location Switcher Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-[#FFF4E8] p-1.5 rounded-2xl border border-[#172B5014]">
            <span className="text-[11px] font-extrabold uppercase text-[#172B50] opacity-60 px-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
              Location:
            </span>
            <button
              type="button"
              onClick={() => setSelectedLocation('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedLocation === 'All'
                  ? 'bg-[#172B50] text-white shadow-xs'
                  : 'text-[#172B50] hover:bg-white'
              }`}
            >
              All Assigned ({assignedLocations.length})
            </button>
            {assignedLocations.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setSelectedLocation(loc)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedLocation === loc
                    ? 'bg-[#F4510B] text-white shadow-xs'
                    : 'text-[#172B50] hover:bg-white'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex items-center gap-2 overflow-x-auto mt-6 pt-4 border-t border-[#172B5010] no-scrollbar">
          {[
            { id: 'dashboard', label: 'Operations Dashboard', icon: Activity },
            { id: 'locations', label: 'Multi-Location Hub', icon: MapPin },
            { id: 'coaches', label: 'Coach Management', icon: UserCheck },
            { id: 'equipment', label: 'Equipment Management', icon: Package },
            { id: 'schedules', label: 'Class & Schedules', icon: Calendar },
            { id: 'attendance', label: 'Attendance & Performance', icon: CheckCircle2 },
            { id: 'reports', label: 'Reports & Analytics', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (setCurrentView) setCurrentView(tab.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#172B50] text-white shadow-sm'
                    : 'bg-[#FFF4E8] text-[#172B50] hover:bg-white border border-[#172B5010]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F4510B]' : 'text-[#172B50]'}`} />
                <span>{tab.label}</span>
                {tab.id === 'equipment' && kpis.pendingEquipmentReports > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#F4510B] animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. TAB 1: OPERATIONS DASHBOARD                                */}
      {/* ============================================================ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Row of 4 Primary KPIs with Floating 3D Physics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <FloatingCard className="bg-white rounded-2xl p-5 border border-[#172B5014] shadow-card flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#172B50] opacity-70 block">
                  Assigned Locations
                </span>
                <p className="text-2xl sm:text-3xl font-black text-[#172B50] mt-0.5">
                  <AnimatedCounter value={kpis.assignedLocationsCount} />
                </p>
                <span className="text-[11px] font-semibold text-[#F4510B]">
                  {assignedLocations.join(' · ')}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-[#F4510B]" />
              </div>
            </FloatingCard>

            <FloatingCard className="bg-white rounded-2xl p-5 border border-[#172B5014] shadow-card flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#172B50] opacity-70 block">
                  Authorized Faculty
                </span>
                <p className="text-2xl sm:text-3xl font-black text-[#172B50] mt-0.5">
                  <AnimatedCounter value={kpis.totalCoaches} />
                </p>
                <span className="text-[11px] font-semibold text-emerald-600">
                  {kpis.totalStudents} enrolled athletes
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
            </FloatingCard>

            <FloatingCard className="bg-white rounded-2xl p-5 border border-[#172B5014] shadow-card flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#172B50] opacity-70 block">
                  Today's Court Classes
                </span>
                <p className="text-2xl sm:text-3xl font-black text-[#172B50] mt-0.5">
                  <AnimatedCounter value={kpis.todayClassesCount} />
                </p>
                <span className="text-[11px] font-semibold text-blue-600">
                  {kpis.totalClasses} scheduled this term
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </FloatingCard>

            <FloatingCard className="bg-white rounded-2xl p-5 border border-[#172B5014] shadow-card flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#172B50] opacity-70 block">
                  Equipment Health
                </span>
                <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-0.5">
                  <AnimatedCounter value={`${kpis.equipmentHealth}%`} />
                </p>
                <span className="text-[11px] font-bold text-amber-600">
                  {kpis.pendingEquipmentReports} reports pending review
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
            </FloatingCard>
          </div>

          {/* Center Operational Grid: Today's Class Timetable & Coach Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 cols: Today's Court Sessions & Assignments */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#172B5014] shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-5 rounded-full bg-[#F4510B]" />
                    <h3 className="text-base font-black text-[#172B50]">
                      Today's Classes &amp; Faculty Assignments
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreateScheduleModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F4510B] text-white hover:bg-[#E04505] transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Session</span>
                  </button>
                </div>

                {todayClasses.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#172B50] opacity-60">
                    No active sessions scheduled for today at {selectedLocation === 'All' ? 'your assigned centers' : selectedLocation}.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayClasses.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-[#FFF4E8]/60 border border-[#172B5012] flex items-center justify-between hover:bg-[#FFF4E8] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-[#172B5015] flex flex-col items-center justify-center font-mono shrink-0">
                            <span className="text-[9px] font-bold text-[#F4510B]">START</span>
                            <span className="text-xs font-black text-[#172B50]">{item.startTime}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-[#172B50]">{item.className || item.batch}</span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#172B5010] text-[#172B50]">
                                {item.location}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-[#172B50] opacity-75 block mt-0.5">
                              Assigned Coach: <strong className="text-[#F4510B]">{item.coachName}</strong> · Venue: {item.venue}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenReassign(item)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-[#172B50] border border-[#172B5020] hover:border-[#F4510B] hover:text-[#F4510B] transition-all cursor-pointer shadow-2xs"
                          >
                            Reassign Coach
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#172B5010] flex items-center justify-between text-xs text-[#172B50] opacity-70">
                <span>Showing schedules for authorized locations</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('schedules')}
                  className="font-bold text-[#F4510B] hover:underline cursor-pointer"
                >
                  View Full Timetable →
                </button>
              </div>
            </div>

            {/* Right 5 cols: Coach Performance & Attendance Oversight */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#172B5014] shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-5 rounded-full bg-emerald-600" />
                    <h3 className="text-base font-black text-[#172B50]">
                      Coach Roster &amp; Compliance
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-[#172B50] opacity-60">
                    {locationFilteredCoaches.length} Coaches
                  </span>
                </div>

                <div className="space-y-3">
                  {locationFilteredCoaches.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-2xl bg-white border border-[#172B5015] shadow-2xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#172B50] text-white flex items-center justify-center font-black text-sm shrink-0">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-[#172B50]">{c.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {c.center}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#172B50] opacity-70 block">
                            {c.specialization} · Rating {c.rating}★
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenIssueModal(c)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Report issue to Admin"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#172B5010] flex items-center justify-between text-xs text-[#172B50] opacity-70">
                <span>Compliance: 100% attendance submissions</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('coaches')}
                  className="font-bold text-[#F4510B] hover:underline cursor-pointer"
                >
                  Manage Faculty →
                </button>
              </div>
            </div>

          </div>

          {/* Location-wise Operations & Performance comparative matrix */}
          <div className="bg-white rounded-3xl p-6 border border-[#172B5014] shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-5 rounded-full bg-[#172B50]" />
                <h3 className="text-base font-black text-[#172B50]">
                  Location-wise Operational Matrix
                </h3>
              </div>
              <span className="text-xs text-[#172B50] opacity-65 font-bold">
                Assigned Centers Comparative Analytics
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scopedLocations.map((loc) => {
                const locStudents = scopedStudents.filter(s => s.center === loc.name).length;
                const locCoaches = scopedCoaches.filter(c => c.center === loc.name).length;
                const locSchedules = scopedSchedules.filter(s => s.location === loc.name).length;
                const locEq = scopedEquipment.filter(i => i.location === loc.name).length;

                return (
                  <div
                    key={loc.id}
                    className="p-5 rounded-2xl bg-[#FFF4E8]/60 border border-[#172B5015] hover:border-[#F4510B] transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-black text-[#172B50]">{loc.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F4510B] text-white">
                        ACTIVE
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between py-1 border-b border-[#172B5010]">
                        <span className="opacity-70">Enrolled Students:</span>
                        <strong className="text-sm font-black text-[#172B50]">{locStudents}</strong>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-[#172B5010]">
                        <span className="opacity-70">Dedicated Faculty:</span>
                        <strong className="text-sm font-black text-[#172B50]">{locCoaches} Coaches</strong>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-[#172B5010]">
                        <span className="opacity-70">Active Timetables:</span>
                        <strong className="text-sm font-black text-[#172B50]">{locSchedules} Sessions</strong>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="opacity-70">Gear Inventory:</span>
                        <strong className="text-sm font-black text-emerald-700">{locEq} Equipment types</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. TAB 2: MULTI-LOCATION HUB                                  */}
      {/* ============================================================ */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
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
      {/* 7. TAB 6: ATTENDANCE & PERFORMANCE                            */}
      {/* ============================================================ */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
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
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. TAB 7: REPORTS & ANALYTICS                                 */}
      {/* ============================================================ */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#172B5014] shadow-card">
            <h3 className="text-base font-black text-[#172B50] mb-2">
              Super Coach Multi-Location Analytics &amp; Reports
            </h3>
            <p className="text-xs text-[#172B50] opacity-70 mb-6">
              Generate operational reports for class completion, coach rosters, equipment health, and attendance across authorized centers.
            </p>

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
        title="Schedule Class Session"
        subtitle="Schedule a session in an authorized location"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateScheduleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Class / Session Title</label>
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
