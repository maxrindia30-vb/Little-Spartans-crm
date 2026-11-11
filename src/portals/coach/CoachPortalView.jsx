import React, { useState } from 'react';
import { 
  Calendar, 
  GraduationCap, 
  ClipboardCheck, 
  Trophy, 
  CalendarOff, 
  BookOpen, 
  Bell, 
  UserCheck2, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Plus, 
  Star, 
  Activity, 
  Award, 
  Shield, 
  Heart,
  RefreshCw,
  Check,
  MessageSquare,
  Sparkles,
  UserCheck,
  CalendarDays,
  Filter,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Save,
  Info,
  Users,
  X,
  ArrowRight
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import {
  ATTENDANCE_STATUSES,
  getCoachAssignedBatches,
  filterStudentsForAttendance,
  getSavedAttendanceRecord,
} from '../../services/attendanceService';
import KpiCard from '../../components/common/KpiCard';
import Modal from '../../components/common/Modal';

export default function CoachPortalView() {
  const { 
    currentView, 
    setCurrentView, 
    data, 
    saveBatchAttendance,
    applyLeave, 
    updateCompensationRequest,
    updateCoachCompensation,
    completeClassSchedule,
    addToast 
  } = useCrm();

  const coachProfile = data.coaches[0] || {
    id: '',
    name: 'Coach (Unassigned)',
    specialization: 'Sports Training',
    experience: '-',
    certification: 'Academy Coach',
    email: '',
    center: data.academy.centers[0] || 'KK NAGAR',
    rating: '-',
  };
  const coachFirstName = (coachProfile.name || '').split(' ')[0].toLowerCase();
  const isCoachAssignedToItem = (item) =>
    item.coachId === coachProfile.id ||
    (item.additionalCoaches || []).some((c) => c.coachId === coachProfile.id) ||
    (coachFirstName && (item.coach || item.coachName)?.toLowerCase().includes(coachFirstName));

  const myClasses = coachProfile.id ? data.classes.filter(isCoachAssignedToItem) : [];
  const myClassNames = new Set(myClasses.map((c) => c.name));
  const myStudents = coachProfile.id
    ? data.students.filter(
        (s) =>
          (coachFirstName && s.coachName?.toLowerCase().includes(coachFirstName)) ||
          (s.enrolledClasses || []).some((clsName) => myClassNames.has(clsName))
      )
    : [];

  // Automatic Coach Portal Synchronization:
  // Strict role-based filter: Coach ONLY sees schedules assigned to them (primary or additional)!
  const mySchedules = coachProfile.id
    ? (data.classSchedules || []).filter(isCoachAssignedToItem)
    : [];

  // Sub-view toggle in "My Classes": 'schedules' | 'batches'
  const [classesSubView, setClassesSubView] = useState('schedules');
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState('all');
  const [scheduleLocationFilter, setScheduleLocationFilter] = useState('all');
  const [expandedStudentsScheduleId, setExpandedStudentsScheduleId] = useState(null);

  // Coach Location-Wise Attendance state (scoped strictly to coach's assigned locations & batches)
  const coachAssignedBatches = getCoachAssignedBatches({
    coachProfile,
    classes: data.classes || [],
    classSchedules: data.classSchedules || [],
  });
  const coachAssignedLocations = Array.from(
    new Set(coachAssignedBatches.map(b => b.center).filter(Boolean))
  );

  const [coachAttLocation, setCoachAttLocation] = useState(coachAssignedLocations[0] || '');
  const [coachAttBatchId, setCoachAttBatchId] = useState(coachAssignedBatches[0]?.id || '');
  const [coachAttDate, setCoachAttDate] = useState('2026-11-11');
  const [coachAttDrafts, setCoachAttDrafts] = useState({});

  const effectiveCoachLocation =
    coachAttLocation && coachAssignedLocations.includes(coachAttLocation)
      ? coachAttLocation
      : (coachAssignedLocations[0] || '');

  const coachLocationBatches = coachAssignedBatches.filter(
    b => b.center === effectiveCoachLocation
  );

  const effectiveCoachBatch =
    coachLocationBatches.find(b => b.id === coachAttBatchId) ||
    coachLocationBatches[0] ||
    null;

  const coachAttStudents = effectiveCoachBatch
    ? filterStudentsForAttendance(data.students || [], data.classes || [], {
        location: effectiveCoachLocation,
        batchId: effectiveCoachBatch.id,
      })
    : [];

  const coachAttRows = coachAttStudents.map(student => {
    const batchId = effectiveCoachBatch?.id || 'UNASSIGNED';
    const draftKey = `${student.id}::${batchId}::${coachAttDate}::${effectiveCoachLocation}`;
    const savedRecord = getSavedAttendanceRecord(data.attendanceRecords || [], {
      studentId: student.id,
      batchId,
      date: coachAttDate,
      location: effectiveCoachLocation,
    });
    const savedStatus = savedRecord?.status || ATTENDANCE_STATUSES.NOT_MARKED;
    const currentStatus = coachAttDrafts[draftKey] || savedStatus;
    const isDirty = Boolean(coachAttDrafts[draftKey] && coachAttDrafts[draftKey] !== savedStatus);

    return {
      student,
      batchId,
      draftKey,
      savedStatus,
      currentStatus,
      isDirty,
      savedRecord,
    };
  });

  const coachAttTotal = coachAttRows.length;
  const coachAttPresent = coachAttRows.filter(r => r.currentStatus === ATTENDANCE_STATUSES.PRESENT).length;
  const coachAttAbsent = coachAttRows.filter(r => r.currentStatus === ATTENDANCE_STATUSES.ABSENT).length;
  const coachAttNotMarked = coachAttRows.filter(r => r.currentStatus === ATTENDANCE_STATUSES.NOT_MARKED).length;
  const coachAttDirtyCount = coachAttRows.filter(r => r.isDirty).length;

  const handleCoachLocationChange = (nextLoc) => {
    setCoachAttLocation(nextLoc);
    const nextBatches = coachAssignedBatches.filter(b => b.center === nextLoc);
    setCoachAttBatchId(nextBatches[0]?.id || '');
  };

  const handleSaveCoachAttendance = () => {
    if (!effectiveCoachBatch || !effectiveCoachLocation) {
      addToast('No assigned location or batch is selected.', 'error');
      return;
    }

    const entries = coachAttRows
      .filter(
        r =>
          r.currentStatus === ATTENDANCE_STATUSES.PRESENT ||
          r.currentStatus === ATTENDANCE_STATUSES.ABSENT
      )
      .map(r => ({
        studentId: r.student.id,
        batchId: effectiveCoachBatch.id,
        status: r.currentStatus,
      }));

    if (entries.length === 0) {
      addToast('Mark at least one athlete Present or Absent before saving.', 'error');
      return;
    }

    const res = saveBatchAttendance({
      entries,
      date: coachAttDate,
      location: effectiveCoachLocation,
      batchId: effectiveCoachBatch.id,
    });

    if (res?.success) {
      setCoachAttDrafts(prev => {
        const next = { ...prev };
        coachAttRows.forEach(r => {
          delete next[r.draftKey];
        });
        return next;
      });
    }
  };

  // Evaluation states
  const [evalStudent, setEvalStudent] = useState(myStudents[0]?.id || '');
  const [evalScores, setEvalScores] = useState({
    agility: 9,
    speed: 8,
    balance: 9,
    discipline: 10,
    spirit: 10
  });

  // Leave Modal
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [leaveStart, setLeaveStart] = useState('2026-11-25');
  const [leaveEnd, setLeaveEnd] = useState('2026-11-26');
  const [leaveReason, setLeaveReason] = useState('');

  const handleApplyCoachLeave = (e) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    applyLeave({
      type: 'Coach',
      applicantName: coachProfile.name,
      coachId: coachProfile.id,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason,
      reviewedBy: 'Pending Head Coach'
    });

    setIsLeaveOpen(false);
    setLeaveReason('');
  };

  const handleSaveEvaluation = () => {
    addToast('Athlete performance assessment saved and synced to parent report card!');
  };

  // Filter coach absence coverage + assigned student compensation replacement classes
  const coachComps = (data.coachCompensationClasses || []).filter(
    c =>
      c.coachId === coachProfile.id ||
      (coachFirstName && (c.coachName?.toLowerCase().includes(coachFirstName) || c.substituteCoach?.toLowerCase().includes(coachFirstName)))
  );

  const assignedStudentReplacements = (data.compensationRequests || []).filter(
    r =>
      (r.status === 'Scheduled' || r.status === 'Completed') &&
      (r.replacementCoachId === coachProfile.id ||
        (coachProfile.name && r.replacementCoach === coachProfile.name) ||
        (coachFirstName && r.replacementCoach?.toLowerCase().includes(coachFirstName)))
  );

  const handleMarkReplacementAttendance = (repReq, attendanceStatus) => {
    const repDate = repReq.replacementDate || coachAttDate;
    const repLoc = repReq.replacementLocation || repReq.center || coachProfile.center;
    if (repReq.studentId) {
      saveBatchAttendance({
        location: repLoc,
        program: repReq.replacementProgram || repReq.program,
        batchId: repReq.replacementBatchId || repReq.batchId || 'COMPENSATION',
        batchName: repReq.replacementBatch || 'Compensation Replacement Session',
        date: repDate,
        markedBy: coachProfile.name,
        entries: [
          {
            studentId: repReq.studentId,
            studentName: repReq.studentName,
            status: attendanceStatus,
          },
        ],
      });
    }
    if (attendanceStatus === ATTENDANCE_STATUSES.PRESENT && repReq.status === 'Scheduled') {
      updateCompensationRequest(repReq.id, {
        status: 'Completed',
        approvalNotes: `Attended replacement session with Coach ${coachProfile.name} on ${repDate}.`,
      });
    }
  };

  // Filtered coach schedules
  const filteredMySchedules = mySchedules.filter(s => {
    if (scheduleStatusFilter !== 'all' && s.status !== scheduleStatusFilter) return false;
    if (scheduleLocationFilter !== 'all' && s.location !== scheduleLocationFilter) return false;
    return true;
  });

  // Upcoming live schedule
  const nextScheduledClass = mySchedules.find(s => s.status === 'Scheduled' || s.status === 'Updated') || mySchedules[0];

  const totalCompSlotCount = coachComps.length + assignedStudentReplacements.length;

  const coachDashboardModules = [
    {
      id: 'classes',
      label: 'My Classes',
      desc: 'Published timetables, batches & session status',
      stat: `${mySchedules.length} Schedules`,
      icon: Calendar,
    },
    {
      id: 'students',
      label: 'My Students',
      desc: 'Athletes assigned across your active batches',
      stat: `${myStudents.length} Athletes`,
      icon: GraduationCap,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      desc: 'Location-scoped Present / Absent daily register',
      stat: `${coachAssignedBatches.length} Batches`,
      icon: ClipboardCheck,
    },
    {
      id: 'evaluations',
      label: 'Student Performance',
      desc: 'Skill scoring, agility tracking & parent reports',
      stat: `${myStudents.length} Profiles`,
      icon: Award,
    },
    {
      id: 'compensation',
      label: 'Compensation Classes',
      desc: 'Assigned replacement sessions & coach coverage',
      stat: `${totalCompSlotCount} Slots`,
      icon: RefreshCw,
    },
    {
      id: 'competitions',
      label: 'Sports & Events',
      desc: 'Academy tournaments, trials & sports meets',
      stat: `${(data.competitions || []).length} Events`,
      icon: Trophy,
    },
    {
      id: 'workspace',
      label: 'My Workspace',
      desc: 'Coach profile, leave requests & faculty tools',
      stat: `${coachProfile.center || 'Active'}`,
      icon: UserCheck,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. COACH DASHBOARD (Upgraded Brand UI/UX) */}
      {currentView === 'dashboard' && (
        <div className="space-y-6 animate-slide-up">
          {/* Hero Command Header */}
          <div className="rounded-3xl bg-gradient-to-br from-[#172B50] via-[#1E3560] to-[#264275] p-6 sm:p-7 text-white shadow-card relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full bg-[#F4510B]/20 blur-2xl pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#F4510B] text-white tracking-wider">
                    Coach Workspace
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/90 border border-white/15">
                    {coachProfile.certification || 'Certified Coach'} • {coachProfile.center}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Coach Command: {coachProfile.name}
                </h1>
                <p className="text-xs sm:text-sm text-white/80 mt-1">
                  {coachProfile.specialization} • Assigned Schedules, Daily Attendance &amp; Replacement Sessions synced live from Admin.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentView('attendance')}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold bg-[#F4510B] text-white rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <ClipboardCheck className="w-4 h-4 text-white" />
                  <span>Mark Attendance</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('classes')}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-white text-[#172B50] rounded-xl shadow-sm hover:bg-[#FFF4E8] active:scale-95 transition-all cursor-pointer"
                >
                  <CalendarDays className="w-4 h-4 text-[#F4510B]" />
                  <span>My Schedules ({mySchedules.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsLeaveOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                >
                  <CalendarOff className="w-4 h-4 text-[#FFA366]" />
                  <span>Coach Leave</span>
                </button>
              </div>
            </div>

            {/* Synchronized Next Class Highlight */}
            <div className="mt-5 pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs relative z-10">
              {nextScheduledClass ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F4510B]/20 border border-[#F4510B]/40 flex items-center justify-center text-[#FFA366] shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FFA366]">
                        Next Synchronized Session • {nextScheduledClass.location}
                      </span>
                      {nextScheduledClass.isCompensationReplacement && (
                        <span className="px-1.5 py-0.2 rounded bg-[#F4510B] text-white text-[9px] font-bold">REPLACEMENT</span>
                      )}
                    </div>
                    <span className="font-bold text-white block">
                      {nextScheduledClass.className || nextScheduledClass.batch} • {nextScheduledClass.date} ({nextScheduledClass.startTime} – {nextScheduledClass.endTime})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white/80">
                  <Sparkles className="w-4 h-4 text-[#FFA366]" />
                  <span>No upcoming classes scheduled yet. Sessions assigned by Admin appear here automatically.</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setCurrentView('classes')}
                className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] shrink-0 transition-colors cursor-pointer self-start sm:self-auto"
              >
                View Full Schedule &rarr;
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#172B501A] shadow-card">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#172B50]/65 block mb-1">
                Published Schedules
              </span>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#172B50]">{mySchedules.length}</h3>
                <CalendarDays className="w-5 h-5 text-[#F4510B]" />
              </div>
              <p className="text-xs font-bold text-[#F4510B] mt-1">Synced from Admin</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#172B501A] shadow-card">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#172B50]/65 block mb-1">
                Assigned Athletes
              </span>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#172B50]">{myStudents.length}</h3>
                <GraduationCap className="w-5 h-5 text-[#F4510B]" />
              </div>
              <p className="text-xs font-bold text-emerald-600 mt-1">Across {coachAssignedBatches.length} Batches</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#172B501A] shadow-card">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#172B50]/65 block mb-1">
                Compensation Slots
              </span>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#172B50]">{totalCompSlotCount}</h3>
                <RefreshCw className="w-5 h-5 text-[#F4510B]" />
              </div>
              <p className="text-xs font-bold text-[#F4510B] mt-1">{assignedStudentReplacements.filter(r => r.status === 'Scheduled').length} Upcoming Replacements</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#172B501A] shadow-card">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#172B50]/65 block mb-1">
                Faculty Rating
              </span>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#172B50]">{coachProfile.rating || '4.9'} / 5.0</h3>
                <Star className="w-5 h-5 text-[#F4510B]" />
              </div>
              <p className="text-xs font-bold text-emerald-600 mt-1">{coachProfile.experience || 'Experienced'} Experience</p>
            </div>
          </div>

          {/* All Coach Navbar Modules Inside Dashboard */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172B50]">
                Coach Portal Modules
              </h2>
              <span className="text-xs font-semibold text-[#172B50] opacity-65">
                Quick access to every section
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {coachDashboardModules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setCurrentView(mod.id)}
                    className="text-left bg-white rounded-2xl p-4 border border-[#172B501A] shadow-card hover:border-[#F4510B] hover:-translate-y-0.5 hover:shadow-dropdown transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FFF4E8] border border-[#F4510B25] flex items-center justify-center text-[#F4510B] group-hover:bg-[#F4510B] group-hover:text-white transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFF4E8] text-[#172B50] border border-[#172B5012]">
                          {mod.stat}
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-[#172B50] group-hover:text-[#F4510B] transition-colors">
                        {mod.label}
                      </h3>
                      <p className="text-[11px] text-[#172B50] opacity-70 mt-1 line-clamp-2">
                        {mod.desc}
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-[#172B5010] flex items-center justify-between text-[11px] font-extrabold text-[#F4510B]">
                      <span>Open {mod.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. MY CLASSES: AUTOMATICALLY SYNCHRONIZED FROM ADMIN PORTAL */}
      {currentView === 'classes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#172B5015]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10.5px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Auto-Synchronized with Admin Command Center
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight mt-1">
                My Class Schedules & Court Allocations
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Real-time schedules published by Admin for Coach {coachProfile.name}. Any updates or cancellations reflect instantly.
              </p>
            </div>

            {/* Toggle View: Schedules vs Standing Batches */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#172B5015] self-start sm:self-auto shadow-xs">
              <button
                onClick={() => setClassesSubView('schedules')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  classesSubView === 'schedules'
                    ? 'bg-[#F4510B] text-white shadow-xs'
                    : 'text-[#172B50] hover:bg-[#FFF4E8]'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Location Schedules ({mySchedules.length})</span>
              </button>

              <button
                onClick={() => setClassesSubView('batches')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  classesSubView === 'batches'
                    ? 'bg-[#172B50] text-white shadow-xs'
                    : 'text-[#172B50] hover:bg-[#FFF4E8]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Standing Batches ({myClasses.length})</span>
              </button>
            </div>
          </div>

          {/* VIEW A: SYNCHRONIZED LOCATION SCHEDULES */}
          {classesSubView === 'schedules' && (
            <div className="space-y-4">
              
              {/* Filter Bar for Coach */}
              <div className="bg-white rounded-2xl p-4 border border-[#172B501A] shadow-card flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#172B50] flex items-center gap-1 mr-1">
                    <Filter className="w-3.5 h-3.5 text-[#F4510B]" />
                    <span>Filter:</span>
                  </span>

                  {/* Status Filter */}
                  <select
                    value={scheduleStatusFilter}
                    onChange={(e) => setScheduleStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#FFF4E8]/60 border border-[#172B5020] font-bold text-[#172B50]"
                  >
                    <option value="all">All Statuses ({mySchedules.length})</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Updated">Updated</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  {/* Location Filter */}
                  <select
                    value={scheduleLocationFilter}
                    onChange={(e) => setScheduleLocationFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#FFF4E8]/60 border border-[#172B5020] font-bold text-[#172B50]"
                  >
                    <option value="all">All Locations</option>
                    {(data.locations || []).map(loc => (
                      <option key={loc.id} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                <span className="text-[#172B50] opacity-70">
                  Showing <strong>{filteredMySchedules.length}</strong> schedules assigned to you
                </span>
              </div>

              {/* Schedules Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredMySchedules.length === 0 ? (
                  <div className="col-span-full bg-white rounded-2xl p-8 text-center border border-[#172B501A] shadow-card space-y-2">
                    <CalendarDays className="w-10 h-10 text-gray-300 mx-auto" />
                    <h3 className="text-sm font-bold text-[#172B50]">No Matching Schedules</h3>
                    <p className="text-xs text-[#172B50]/70">
                      You have no classes matching this filter. Newly published sessions from Admin will automatically appear here.
                    </p>
                  </div>
                ) : (
                  filteredMySchedules.map(sch => {
                    const isCancelled = sch.status === 'Cancelled';
                    const isCompleted = sch.status === 'Completed';
                    const isExpanded = expandedStudentsScheduleId === sch.id;

                    return (
                      <div 
                        key={sch.id}
                        className={`bg-white rounded-2xl p-5 border shadow-card flex flex-col justify-between transition-all ${
                          isCancelled 
                            ? 'border-rose-200 bg-rose-50/20' 
                            : isCompleted 
                            ? 'border-emerald-200' 
                            : 'border-[#172B501A]'
                        }`}
                      >
                        <div>
                          {/* Top Badges */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#172B50] text-white">
                                {sch.program}
                              </span>
                              {sch.isCompensationReplacement && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#F4510B] text-white">
                                  Replacement
                                </span>
                              )}
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              sch.status === 'Scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : sch.status === 'Updated'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : sch.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800 line-through'
                            }`}>
                              {sch.status}
                            </span>
                          </div>

                          {/* Batch Name */}
                          <h3 className={`text-base font-extrabold text-[#172B50] mt-2 ${
                            isCancelled ? 'line-through text-gray-500' : ''
                          }`}>
                            {sch.className || sch.batch}
                          </h3>

                          {/* Location */}
                          <div className="mt-3 p-3 bg-[#FFF4E8]/60 rounded-xl border border-[#172B5010] space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-[#172B50]">
                              <MapPin className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                              <span>{sch.location}</span>
                            </div>
                          </div>

                          {/* Date and Time */}
                          <div className="mt-3 space-y-1.5 text-xs text-[#172B50]">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="font-semibold">{sch.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="font-bold text-[#172B50]">{sch.startTime} – {sch.endTime}</span>
                            </div>
                          </div>

                          {/* Assigned Students Count & Toggle */}
                          <div className="mt-3 pt-2.5 border-t border-[#172B5010]">
                            <div className="flex items-center justify-between text-xs font-semibold text-[#172B50]">
                              <span>Assigned Athletes: {sch.enrolledStudents?.length || sch.enrolledCount || 0} / {sch.capacity}</span>
                              <button
                                type="button"
                                onClick={() => setExpandedStudentsScheduleId(isExpanded ? null : sch.id)}
                                className="text-[11px] font-bold text-[#F4510B] hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>{isExpanded ? 'Hide Roster' : 'View Roster'}</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </div>

                            {/* Expanded Students Roster */}
                            {isExpanded && (
                              <div className="mt-2 p-2.5 bg-[#FFF4E8]/40 rounded-xl border border-[#172B5010] text-[11px] space-y-1 animate-in fade-in">
                                <span className="font-bold text-[#172B50] block mb-1">Enrolled Kids:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {(sch.enrolledStudents || []).length === 0 ? (
                                    <span className="text-[#172B50]/60">No athletes assigned yet</span>
                                  ) : (
                                    (sch.enrolledStudents || []).map((kid, idx) => (
                                      <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-[#172B5015] text-[#172B50] font-medium">
                                        {kid}
                                      </span>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Admin Notes / Instructions */}
                          {sch.notes && (
                            <p className="mt-3 text-[11px] text-[#172B50]/80 bg-[#FFF4E8]/30 p-2.5 rounded-lg italic">
                              <strong>Admin Note:</strong> "{sch.notes}"
                            </p>
                          )}

                          {/* Cancellation Note if cancelled */}
                          {isCancelled && sch.cancellationReason && (
                            <p className="mt-2 text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg font-bold">
                              Cancellation Reason: {sch.cancellationReason}
                            </p>
                          )}
                        </div>

                        {/* Action Bar for Coach */}
                        <div className="mt-4 pt-3 border-t border-[#172B5010] flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-gray-400">{sch.id}</span>

                          <div className="flex items-center gap-2">
                            {!isCancelled && !isCompleted && (
                              <button
                                type="button"
                                onClick={() => completeClassSchedule(sch.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Mark Completed</span>
                              </button>
                            )}

                            {!isCancelled && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentView('attendance');
                                  addToast(`Opening attendance register for ${sch.batch}`);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172B50] text-white text-xs font-bold rounded-lg hover:bg-[#F4510B] transition-colors cursor-pointer"
                              >
                                <ClipboardCheck className="w-3.5 h-3.5" />
                                <span>Attendance</span>
                              </button>
                            )}

                            {isCompleted && (
                              <span className="flex items-center gap-1 text-emerald-700 text-xs font-bold">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Class Completed</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* VIEW B: GENERAL STANDING BATCHES */}
          {classesSubView === 'batches' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myClasses.map(cls => (
                <div key={cls.id} className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#F4510B]">{cls.program}</span>
                      <h3 className="text-lg font-black text-[#172B50] mt-0.5">{cls.name}</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#172B50] text-white">
                      {cls.enrolledCount || cls.enrolled} Spartans
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-[#172B50]">
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#F4510B]" />
                      <span>{cls.schedule}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                      <span>{cls.center}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* 3. MY STUDENTS */}
      {currentView === 'students' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            My Student Roster & Medical Alerts
          </h1>
          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF4E8] text-[#172B50] font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Athlete</th>
                  <th className="p-3.5">Age / Gender</th>
                  <th className="p-3.5">Rank</th>
                  <th className="p-3.5">Turnout</th>
                  <th className="p-3.5">Emergency Note</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B5010]">
                {myStudents.map(s => (
                  <tr key={s.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                    <td className="p-3.5 font-bold text-[#172B50] flex items-center gap-2">
                      <img src={s.avatar} alt={s.name} className="w-7 h-7 rounded-full object-cover" />
                      <span>{s.name}</span>
                    </td>
                    <td className="p-3.5">{s.age} yrs • {s.gender}</td>
                    <td className="p-3.5 font-bold text-[#F4510B]">{s.rank}</td>
                    <td className="p-3.5 font-bold text-emerald-700">{s.attendanceRate || 95}%</td>
                    <td className="p-3.5 text-[11px] text-[#172B50] opacity-80">{s.medicalNote || 'Fit for full drills'}</td>
                    <td className="p-3.5 text-right">
                      <button 
                        onClick={() => {
                          setEvalStudent(s.id);
                          setCurrentView('evaluations');
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold bg-[#172B50] text-white rounded-lg hover:bg-[#F4510B]"
                      >
                        Evaluate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ATTENDANCE (LOCATION & ASSIGNED BATCH SCOPED) */}
      {currentView === 'attendance' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Mark Session Attendance
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Showing only locations, classes &amp; athletes assigned to <strong>{coachProfile.name}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveCoachAttendance}
              disabled={!effectiveCoachBatch || coachAttRows.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 self-start sm:self-auto"
            >
              <Save className="w-4 h-4" />
              <span>
                Save Attendance{coachAttDirtyCount > 0 ? ` (${coachAttDirtyCount})` : ''}
              </span>
            </button>
          </div>

          {/* Coach Assigned Selectors & Summary Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#172B501A] shadow-card space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#172B50] opacity-70 block mb-1">
                  Assigned Location
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#F4510B] absolute left-2.5 top-2.5 pointer-events-none" />
                  <select
                    aria-label="Select assigned academy location"
                    value={effectiveCoachLocation}
                    onChange={(e) => handleCoachLocationChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none focus:ring-2 focus:ring-[#F4510B]"
                  >
                    {coachAssignedLocations.length === 0 ? (
                      <option value="">No Assigned Locations</option>
                    ) : (
                      coachAssignedLocations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#172B50] opacity-70 block mb-1">
                  Assigned Class / Batch
                </label>
                <select
                  aria-label="Select assigned class or batch"
                  value={effectiveCoachBatch?.id || ''}
                  onChange={(e) => setCoachAttBatchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none focus:ring-2 focus:ring-[#F4510B]"
                >
                  {coachLocationBatches.length === 0 ? (
                    <option value="">No Assigned Batches at Location</option>
                  ) : (
                    coachLocationBatches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.program})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#172B50] opacity-70 block mb-1">
                  Attendance Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-[#172B50] opacity-60 absolute left-2.5 top-2.5 pointer-events-none" />
                  <input
                    type="date"
                    aria-label="Coach attendance date"
                    value={coachAttDate}
                    onChange={(e) => setCoachAttDate(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none focus:ring-2 focus:ring-[#F4510B]"
                  />
                </div>
              </div>
            </div>

            {/* Coach Attendance Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#172B5010]">
              <div className="px-3.5 py-2 rounded-xl bg-[#FFF4E8] border border-[#172B5015] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#172B50]">Total Students</span>
                <span className="text-sm font-black text-[#172B50]">{coachAttTotal}</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-[#FFF4E8] border border-[#172B5015] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#172B50]">Present</span>
                <span className="text-sm font-black text-emerald-700">{coachAttPresent}</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-[#FFF4E8] border border-[#172B5015] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#172B50]">Absent</span>
                <span className="text-sm font-black text-[#F4510B]">{coachAttAbsent}</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-[#172B50] text-white flex items-center justify-between">
                <span className="text-[11px] font-bold">Not Marked</span>
                <span className="text-sm font-black text-[#FFF4E8]">{coachAttNotMarked}</span>
              </div>
            </div>
          </div>

          {/* Student List for Assigned Batch + Location */}
          <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
            {effectiveCoachBatch && (
              <div className="pb-3 mb-3 border-b border-[#172B5015] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-[#172B50]">
                    {effectiveCoachBatch.name} • {effectiveCoachLocation}
                  </h3>
                  <p className="text-[11px] text-[#172B50] opacity-75">
                    {effectiveCoachBatch.program} • {effectiveCoachBatch.schedule} • Date: <strong>{coachAttDate}</strong>
                  </p>
                </div>
                <span className="text-xs font-bold text-[#F4510B]">
                  {coachAttTotal > 0 ? Math.round((coachAttPresent / coachAttTotal) * 100) : 0}% Present
                </span>
              </div>
            )}

            <div className="space-y-3">
              {coachAttRows.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#172B50] opacity-65 space-y-1.5">
                  <Users className="w-7 h-7 mx-auto opacity-40" />
                  <p>No students enrolled in this assigned class at {effectiveCoachLocation || 'this location'}.</p>
                </div>
              ) : (
                coachAttRows.map(row => {
                  const { student, draftKey, currentStatus, isDirty } = row;
                  return (
                    <div
                      key={student.id}
                      className="p-3.5 bg-[#FFF4E8] rounded-xl border border-[#172B5015] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img src={student.avatar} alt={student.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-[#172B5020]" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-[#172B50]">{student.name}</h4>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                                currentStatus === ATTENDANCE_STATUSES.PRESENT
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : currentStatus === ATTENDANCE_STATUSES.ABSENT
                                  ? 'bg-[#F4510B]/15 text-[#F4510B]'
                                  : 'bg-white text-[#172B50] opacity-75 border border-[#172B5020]'
                              }`}
                            >
                              {currentStatus === ATTENDANCE_STATUSES.PRESENT && <Check className="w-2.5 h-2.5" />}
                              {currentStatus === ATTENDANCE_STATUSES.ABSENT && <X className="w-2.5 h-2.5" />}
                              {currentStatus === ATTENDANCE_STATUSES.NOT_MARKED && <Clock className="w-2.5 h-2.5" />}
                              <span>{currentStatus}</span>
                              {isDirty && <span className="opacity-75">(Unsaved)</span>}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#172B50] opacity-75">
                            {student.id} • {student.center} • {student.program}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {[ATTENDANCE_STATUSES.PRESENT, ATTENDANCE_STATUSES.ABSENT].map(status => (
                          <button
                            key={status}
                            type="button"
                            onClick={() =>
                              setCoachAttDrafts(prev => ({
                                ...prev,
                                [draftKey]: status,
                              }))
                            }
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === status
                                ? status === ATTENDANCE_STATUSES.PRESENT
                                  ? 'bg-[#172B50] text-white shadow-sm'
                                  : 'bg-[#F4510B] text-white shadow-sm'
                                : 'bg-white text-[#172B50] border border-[#172B5020] hover:bg-white/80'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {assignedStudentReplacements.filter(r => r.status === 'Scheduled').length > 0 && (
            <div className="bg-white rounded-2xl border border-[#F4510B30] shadow-card overflow-hidden">
              <div className="p-4 border-b border-[#172B5010] bg-[#FFF4E8]/60 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#172B50]">
                    Replacement Compensation Sessions — Attendance
                  </h3>
                  <p className="text-[11px] text-[#172B50]/70">
                    Mark Present or Absent for makeup classes scheduled to you by Admin
                  </p>
                </div>
                <span className="text-xs font-extrabold text-[#F4510B]">
                  {assignedStudentReplacements.filter(r => r.status === 'Scheduled').length} Active
                </span>
              </div>
              <div className="divide-y divide-[#172B5010]">
                {assignedStudentReplacements.filter(r => r.status === 'Scheduled').map(rep => (
                  <div key={rep.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-extrabold text-[#172B50] text-sm">{rep.studentName}</span>
                      <p className="text-[11px] text-[#172B50]/75 mt-0.5">
                        {rep.replacementSlot} • {rep.replacementProgram || rep.program} (Makeup for {rep.missedDate})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMarkReplacementAttendance(rep, ATTENDANCE_STATUSES.PRESENT)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#172B50] text-white font-bold hover:bg-emerald-600 transition-colors cursor-pointer"
                      >
                        Present &amp; Complete
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkReplacementAttendance(rep, ATTENDANCE_STATUSES.ABSENT)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30] font-bold hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        Mark Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2.5 px-4 py-2.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015] text-[11px] text-[#172B50]">
            <Info className="w-4 h-4 text-[#F4510B] shrink-0 mt-0.5" />
            <span>
              Saving updates the shared attendance register in browser <code className="font-bold">localStorage</code> so Admin Portal reflects it immediately. Production sync requires <code className="font-bold">PUT /api/v1/attendance/batch</code> with Coach RBAC verification.
            </span>
          </div>
        </div>
      )}

      {/* 5. STUDENT PERFORMANCE (EVALUATIONS) */}
      {currentView === 'evaluations' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Spartan Athlete Skill Assessments
          </h1>

          <div className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#172B5015]">
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Select Athlete to Evaluate</label>
                <select
                  value={evalStudent}
                  onChange={(e) => setEvalStudent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] rounded-xl outline-none"
                >
                  {myStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.age} yrs - {s.rank})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Assessment Term</label>
                <input
                  type="text"
                  disabled
                  value="Q4 2026 Term Final Evaluation"
                  className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Rubrics */}
            <div className="space-y-3">
              {[
                { key: 'agility', label: 'Motor Agility & Obstacle Navigation' },
                { key: 'speed', label: 'Reaction Time & Sprint Velocity' },
                { key: 'balance', label: 'Core Strength & Balance Beam Stance' },
                { key: 'discipline', label: 'Coach Punctuality & Listening Discipline' },
                { key: 'spirit', label: 'Spartan Spirit & Team Encouragement' },
              ].map(rubric => (
                <div key={rubric.key} className="p-3 bg-[#FFF4E8] rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-[#172B50]">{rubric.label}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={evalScores[rubric.key]}
                      onChange={(e) => setEvalScores(prev => ({ ...prev, [rubric.key]: parseInt(e.target.value) }))}
                      className="accent-[#F4510B]"
                    />
                    <span className="text-xs font-black text-[#F4510B] w-6 text-right">
                      {evalScores[rubric.key]}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#172B5015] flex justify-end">
              <button
                onClick={handleSaveEvaluation}
                className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl hover:brightness-110 shadow-sm"
              >
                Save Evaluation Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. COMPENSATION CLASSES (Student Replacements + Coach Coverage) */}
      {currentView === 'compensation' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Compensation Classes &amp; Replacement Assignments
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Track student makeup sessions assigned to you, mark replacement attendance, and manage substitute coverage
              </p>
            </div>
          </div>

          {/* Assigned Student Compensation Replacement Sessions */}
          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <div className="p-4 border-b border-[#172B5010] flex items-center justify-between bg-[#FFF4E8]/40">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#172B50]">
                Assigned Student Replacement Sessions
              </h3>
              <span className="text-xs font-bold text-[#F4510B]">
                {assignedStudentReplacements.length} Assigned
              </span>
            </div>

            <div className="divide-y divide-[#172B500C]">
              {assignedStudentReplacements.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#172B50] opacity-70">
                  No student replacement sessions assigned to you yet. When Admin schedules a replacement slot under Student Compensation, it appears here automatically.
                </div>
              ) : (
                assignedStudentReplacements.map(rep => (
                  <div key={rep.id} className="p-4 hover:bg-[#FFF4E8]/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#172B50] text-sm">{rep.studentName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rep.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {rep.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#172B50] opacity-80 mt-1">
                        Replacement Slot: <strong>{rep.replacementSlot}</strong> • Program: {rep.replacementProgram || rep.program}
                      </p>
                      <p className="text-[11px] text-[#F4510B] font-semibold mt-0.5">
                        Makeup for missed class on {rep.missedDate} ({rep.missedClass})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {rep.status === 'Scheduled' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleMarkReplacementAttendance(rep, ATTENDANCE_STATUSES.PRESENT)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Present &amp; Completed</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMarkReplacementAttendance(rep, ATTENDANCE_STATUSES.ABSENT)}
                            className="px-3 py-1.5 rounded-lg bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30] text-xs font-bold cursor-pointer"
                          >
                            Absent
                          </button>
                        </>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-700 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Completed</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <div className="p-4 border-b border-[#172B5010] flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#172B50]">
                Coach Substitute Coverage Sessions
              </h3>
              <span className="text-xs font-bold text-[#F4510B]">
                {coachComps.length} Active Sessions
              </span>
            </div>

            <div className="divide-y divide-[#172B500C]">
              {coachComps.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#172B50] opacity-70">
                  No substitute coverage sessions assigned today.
                </div>
              ) : (
                coachComps.map(c => (
                  <div key={c.id} className="p-4 hover:bg-[#FFF4E8]/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#172B50]">{c.missedSession || c.program}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#172B50] opacity-75 mt-1">
                        Schedule: <strong>{c.scheduledDate || c.schedule}</strong> • Center: {c.center || 'Main Center'}
                      </p>
                      <p className="text-[11px] text-[#F4510B] font-semibold mt-0.5">
                        Coverage: {c.coverageType || 'Substitute'} • {c.substituteCoach || c.coachName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {c.status !== 'Completed' ? (
                        <button
                          type="button"
                          onClick={() => updateCoachCompensation(c.id, 'Completed')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Session Completed</span>
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-700 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. SPORTS & EVENTS */}
      {currentView === 'competitions' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Tournament Squad Nominations
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {data.competitions.map(comp => (
              <div key={comp.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#F4510B]">{comp.sport}</span>
                  <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{comp.title}</h3>
                  <p className="text-xs text-[#172B50] opacity-75 mt-1">{comp.date} • {comp.venue}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#172B5015]">
                  <button
                    onClick={() => addToast(`Squad list for ${comp.title} submitted to organizers.`)}
                    className="w-full py-2 text-xs font-bold bg-[#172B50] text-white rounded-lg hover:bg-[#F4510B] transition-colors"
                  >
                    Nominate Squad ({comp.registeredCount} Kids)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. MY WORKSPACE (Module 7.8: Leave, Announcements, Profile) */}
      {(currentView === 'workspace' || currentView === 'leaves' || currentView === 'profile') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                My Coach Workspace
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Faculty profile, credentials, leave application & academy circulars
              </p>
            </div>

            <button
              onClick={() => setIsLeaveOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
            >
              <CalendarOff className="w-4 h-4" />
              <span>Apply Coach Leave</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card space-y-4 text-xs">
              <div className="flex items-center gap-4 pb-4 border-b border-[#172B5015]">
                <div className="w-16 h-16 rounded-2xl bg-[#172B50] flex items-center justify-center text-white text-xl font-bold">
                  VS
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#172B50]">{coachProfile.name}</h3>
                  <p className="text-xs text-[#172B50] opacity-75">{coachProfile.email}</p>
                  <span className="text-[10px] font-bold text-[#F4510B]">{coachProfile.certification}</span>
                </div>
              </div>
              <div className="space-y-2 text-[#172B50]">
                <p><span className="font-bold">Specialization:</span> {coachProfile.specialization}</p>
                <p><span className="font-bold">Experience:</span> {coachProfile.experience}</p>
                <p><span className="font-bold">Training Facility:</span> {coachProfile.center}</p>
                <p><span className="font-bold">Faculty Rating:</span> {coachProfile.rating} / 5.0 (5 Star)</p>
              </div>
            </div>

            {/* Leave Status Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card space-y-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#172B5015]">
                <h4 className="font-black text-[#172B50]">My Leave Record</h4>
                <span className="text-xs text-[#F4510B] font-bold">1 Pending</span>
              </div>
              <div className="p-3.5 bg-[#FFF4E8] rounded-xl border border-[#172B5015]">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-[#172B50]">National Coaches Clinic</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#172B50] text-white">
                    Pending
                  </span>
                </div>
                <p className="text-[11px] text-[#172B50] opacity-75 mt-1">Nov 20 to Nov 21, 2026</p>
                <p className="text-[11px] text-[#F4510B] mt-1 italic">"Substitute assigned to Coach Rahul"</p>
              </div>
            </div>

            {/* Circulars & Notices Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card space-y-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#172B5015]">
                <h4 className="font-black text-[#172B50]">Faculty Circulars</h4>
                <Bell className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div className="space-y-2">
                {data.announcements.slice(0, 2).map(ann => (
                  <div key={ann.id} className="p-2.5 rounded-lg border border-[#172B5010] hover:bg-[#FFF4E8]/30">
                    <span className="text-[10px] font-bold text-[#F4510B]">{ann.date}</span>
                    <h5 className="font-bold text-[#172B50] text-[11px] mt-0.5">{ann.title}</h5>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isLeaveOpen}
        onClose={() => setIsLeaveOpen(false)}
        title="Apply Coach Leave"
        subtitle="Request substitute coverage for training batch"
      >
        <form onSubmit={handleApplyCoachLeave} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">From Date</label>
              <input
                type="date"
                required
                value={leaveStart}
                onChange={(e) => setLeaveStart(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">To Date</label>
              <input
                type="date"
                required
                value={leaveEnd}
                onChange={(e) => setLeaveEnd(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Reason & Substitute Note *</label>
            <textarea
              rows="3"
              required
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="e.g. Attending NIS Gymnastics Clinic. Coach Rahul will cover Friday batch."
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsLeaveOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              Submit Leave
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
