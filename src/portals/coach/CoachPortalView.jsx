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
  ArrowRight,
  Inbox,
  User,
  Building2,
  BarChart2,
  Layers,
  Search
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import {
  ATTENDANCE_STATUSES,
  getCoachAssignedBatches,
  filterStudentsForAttendance,
  getSavedAttendanceRecord,
} from '../../services/attendanceService';
import KpiCard, { AnimatedCounter } from '../../components/common/KpiCard';
import FloatingCard from '../../components/common/FloatingCard';
import CoachAttendanceRegister from '../admin/CoachAttendanceRegister';
import AttendanceManagement from '../admin/AttendanceManagement';
import Modal from '../../components/common/Modal';
import EquipmentManagementModule from '../common/EquipmentManagementModule';
import SportsEventsModule from '../admin/SportsEventsModule';
import LiveCalendarButton from '../../components/common/LiveCalendarButton';
import CoachLeaveRequestsManager from '../common/CoachLeaveRequestsManager';

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
  const [coachAttSubView, setCoachAttSubView] = useState('mark_session');

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
  const [athleteSearch, setAthleteSearch] = useState('');
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
      
      {/* 1. COACH DASHBOARD */}
      {currentView === 'dashboard' && (
        <div className="space-y-6 animate-slide-up pb-8">
          
          {/* ============================================================ */}
          {/* 1. TOP HEADER: Good Morning, Coach! & Action Icons            */}
          {/* ============================================================ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="text-left space-y-1">
              <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-black text-[#172B50] tracking-tight flex items-center gap-2">
                <span>Good Morning, Coach {coachFirstName ? coachFirstName.charAt(0).toUpperCase() + coachFirstName.slice(1) : 'Coach'}!</span>
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
                onClick={() => addToast('Search my assigned athletes')}
                className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer"
                title="Search Athletes"
              >
                <Search className="w-4 h-4 text-[#172B50]" />
              </button>

              {/* 2. Notification */}
              <button
                type="button"
                onClick={() => addToast('No unread coach notices')}
                className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-[#172B50]" />
                <span className="w-2 h-2 rounded-full bg-[#F4510B] absolute top-2 right-2 ring-1 ring-white" />
              </button>

              {/* 3. Profile */}
              <div 
                onClick={() => setCurrentView('workspace')}
                className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full ring-2 ring-white shadow-2xs overflow-hidden cursor-pointer hover:ring-[#F4510B] transition-all" 
                title="Coach Workspace & Profile"
              >
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                  alt="Coach"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 4. Action: Coach Leave */}
              <button
                type="button"
                onClick={() => setIsLeaveOpen(true)}
                className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer"
                title="Apply Leave"
              >
                <CalendarOff className="w-4 h-4 text-[#172B50]" />
              </button>

              {/* 5. Live Calendar */}
              <LiveCalendarButton 
                classes={mySchedules} 
                onViewSchedule={() => setCurrentView('classes')} 
              />
            </div>
          </div>

          {/* ============================================================ */}
          {/* 2. FOUR PIPELINE SECTIONS WITH SVG FORK / BRACKET CONNECTORS  */}
          {/* ============================================================ */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
              
              {/* Card 1: Assigned Batches (Peach) */}
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
                        Assigned Batches
                      </h3>
                      <p className="text-[11px] font-medium text-[#172B50]/60">
                        My active training groups
                      </p>
                    </div>
                  </div>

                  {coachAssignedBatches.length === 0 ? (
                    <div className="min-h-[258px] py-6 text-center flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-xl bg-white text-[#F4510B] border border-[#F4510B20] flex items-center justify-center mb-2 shadow-2xs">
                        <Inbox className="w-5 h-5 text-[#F4510B]" />
                      </div>
                      <p className="text-xs font-black text-[#172B50]">No batches assigned</p>
                    </div>
                  ) : (
                    <div className="min-h-[258px] max-h-[258px] overflow-y-auto space-y-1.5 pr-1">
                      {coachAssignedBatches.map((b) => (
                        <div
                          key={b.id}
                          className="bg-white rounded-xl px-3 py-2 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-2 shrink-0 hover:border-[#F4510B30] transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-black text-[#172B50] truncate leading-tight">{b.name}</p>
                            <p className="text-[10px] font-medium text-[#172B50]/60 mt-0.5 truncate leading-tight">
                              {b.program} • {b.center} ({b.enrolledCount || 0}/{b.capacity || 20})
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setClassesSubView('batches');
                              setCurrentView('classes');
                            }}
                            className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-[#FFF4E8] text-[#F4510B] hover:bg-[#F4510B] hover:text-white transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-2.5 shrink-0">
                  <span className="text-[11px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                    Batch Management
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setClassesSubView('batches');
                      setCurrentView('classes');
                    }}
                    className="text-[11.5px] font-black text-[#F4510B] hover:text-[#d44105] flex items-center gap-1 group cursor-pointer transition-colors"
                  >
                    <span>View All ({coachAssignedBatches.length})</span>
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

              {/* Card 2: Athlete Roll Call (Sky Blue) */}
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
                      <GraduationCap className="w-4 h-4 text-[#0284C7]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                        Athlete Roll Call
                      </h3>
                      <p className="text-[11px] font-medium text-[#172B50]/60">
                        Assigned spartan students
                      </p>
                    </div>
                  </div>

                  {myStudents.length === 0 ? (
                    <div className="min-h-[258px] py-6 text-center flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-xl bg-white text-[#0284C7] border border-[#0284C720] flex items-center justify-center mb-2 shadow-2xs">
                        <GraduationCap className="w-5 h-5 text-[#0284C7]" />
                      </div>
                      <p className="text-xs font-black text-[#172B50]">No athletes enrolled</p>
                    </div>
                  ) : (
                    <div className="min-h-[258px] max-h-[258px] overflow-y-auto space-y-1.5 pr-1">
                      {myStudents.map((s) => (
                        <div
                          key={s.id}
                          className="bg-white rounded-xl px-3 py-2 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-2 shrink-0 hover:border-[#0284C730] transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-black text-[#172B50] truncate leading-tight">{s.name}</p>
                            <p className="text-[10px] font-medium text-[#172B50]/60 mt-0.5 truncate leading-tight">
                              {s.program || 'Athlete'} • Age {s.age || '6'} ({s.center})
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentView('attendance')}
                            className="w-6.5 h-6.5 rounded-lg bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
                            title="Mark Attendance"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-2.5 shrink-0">
                  <span className="text-[11px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                    Roster Oversight
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentView('students')}
                    className="text-[11.5px] font-black text-[#0284C7] hover:text-[#0369a1] flex items-center gap-1 group cursor-pointer transition-colors"
                  >
                    <span>View Athletes ({myStudents.length})</span>
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

              {/* Card 3: Replacement Sessions (Emerald) */}
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
                      <RefreshCw className="w-4 h-4 text-[#16A34A]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                        Replacement Sessions
                      </h3>
                      <p className="text-[11px] font-medium text-[#172B50]/60">
                        Assigned makeup classes
                      </p>
                    </div>
                  </div>

                  {assignedStudentReplacements.length === 0 ? (
                    <div className="min-h-[258px] py-6 text-center flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-xl bg-white text-[#16A34A] border border-[#16A34A20] flex items-center justify-center mb-2 shadow-2xs">
                        <RefreshCw className="w-5 h-5 text-[#16A34A]" />
                      </div>
                      <p className="text-xs font-black text-[#172B50]">No makeup sessions</p>
                      <p className="text-[10px] font-medium text-[#172B50]/55 mt-0.5">Admin-assigned slots appear here</p>
                    </div>
                  ) : (
                    <div className="min-h-[258px] max-h-[258px] overflow-y-auto space-y-1.5 pr-1">
                      {assignedStudentReplacements.map((r) => (
                        <div
                          key={r.id}
                          className="bg-white rounded-xl px-3 py-2 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-2 shrink-0 hover:border-[#16A34A30] transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-black text-[#172B50] truncate leading-tight">
                              {r.studentName}
                            </p>
                            <p className="text-[10px] font-medium text-[#172B50]/60 mt-0.5 truncate leading-tight">
                              {r.replacementSlot || `${r.replacementDate} (${r.replacementStartTime})`}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-2.5 shrink-0">
                  <span className="text-[11px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                    Compensation
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentView('compensation')}
                    className="text-[11.5px] font-black text-[#16A34A] hover:text-[#15803d] flex items-center gap-1 group cursor-pointer transition-colors"
                  >
                    <span>View All ({assignedStudentReplacements.length})</span>
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

              {/* Card 4: Coach Operations (White with 2x2 Action Tiles) */}
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
                        Coach Operations
                      </h3>
                      <p className="text-[11px] font-medium text-[#172B50]/60">
                        Daily faculty workflow
                      </p>
                    </div>
                  </div>

                  <div className="min-h-[258px] max-h-[258px] flex flex-col justify-center">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Tile 1: Mark Attendance */}
                      <button
                        type="button"
                        onClick={() => setCurrentView('attendance')}
                        className="bg-[#0B3B60] text-white rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm hover:bg-[#082d4a] active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                          <ClipboardCheck className="w-4.5 h-4.5 text-white" />
                        </div>
                        <span className="text-xs font-black text-white leading-tight">
                          Mark Attendance
                        </span>
                        <span className="text-[9.5px] font-medium text-white/70 mt-0.5">
                          Daily Register
                        </span>
                      </button>

                      {/* Tile 2: Class Timetable */}
                      <button
                        type="button"
                        onClick={() => setCurrentView('classes')}
                        className="bg-white text-[#172B50] rounded-xl p-3 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#FFF4E8] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                          <CalendarDays className="w-4.5 h-4.5 text-[#172B50]" />
                        </div>
                        <span className="text-xs font-black text-[#172B50] leading-tight">
                          My Timetable
                        </span>
                        <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                          {mySchedules.length} Sessions
                        </span>
                      </button>

                      {/* Tile 3: Coach Leave */}
                      <button
                        type="button"
                        onClick={() => setIsLeaveOpen(true)}
                        className="bg-white text-[#172B50] rounded-xl p-3 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#FFF5ED] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                          <CalendarOff className="w-4.5 h-4.5 text-[#F4510B]" />
                        </div>
                        <span className="text-xs font-black text-[#172B50] leading-tight">
                          Apply Leave
                        </span>
                        <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                          Faculty Time-off
                        </span>
                      </button>

                      {/* Tile 4: Equipment */}
                      <button
                        type="button"
                        onClick={() => setCurrentView('equipment')}
                        className="bg-white text-[#172B50] rounded-xl p-3 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#F0F7FF] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                          <Shield className="w-4.5 h-4.5 text-[#0284C7]" />
                        </div>
                        <span className="text-xs font-black text-[#172B50] leading-tight">
                          Equipment
                        </span>
                        <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                          Inspection & Gear
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-2.5 shrink-0">
                  <span className="text-[11px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                    Quick Operations
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentView('workspace')}
                    className="text-[11.5px] font-black text-[#172B50] hover:text-[#F4510B] flex items-center gap-1 group cursor-pointer transition-colors"
                  >
                    <span>My Workspace</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </FloatingCard>

            </div>
          </div>

          {/* ============================================================ */}
          {/* 3. MIDDLE ROW: Today's Classes, Performance & Faculty Toolkit */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
            
            {/* Card 1: Today's Training Sessions Table */}
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
                    Today's Training Schedule
                  </h2>
                </div>
              </div>

              {mySchedules.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-4 my-auto">
                  <div className="w-11 h-11 rounded-2xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center mb-2.5 shadow-2xs">
                    <CalendarDays className="w-5.5 h-5.5" />
                  </div>
                  <p className="text-xs sm:text-sm font-black text-[#172B50]">
                    No classes assigned today
                  </p>
                  <p className="text-[11px] text-[#172B50]/60 mt-1 max-w-[240px]">
                    Classes assigned to you will automatically appear here
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[300px] mt-1 pr-0.5 scrollbar-thin">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-[#172B5010] text-[#172B50]/60 font-black uppercase tracking-wider text-[10px]">
                        <th className="py-2 px-2.5">TIME</th>
                        <th className="py-2 px-2.5">BATCH</th>
                        <th className="py-2 px-2.5">LOCATION</th>
                        <th className="py-2 px-2.5">STUDENTS</th>
                        <th className="py-2 px-2.5 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#172B500C]">
                      {mySchedules.slice(0, 5).map((cls) => (
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
                            {cls.className || cls.batch || 'Training Batch'}
                          </td>
                          <td className="py-2.5 px-2.5">
                            <div className="flex items-center gap-1 font-bold text-[#172B50]/75">
                              <MapPin className="w-3 h-3 text-[#F4510B] shrink-0" />
                              <span>{cls.location}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2.5">
                            <span className="font-bold text-[#172B50]/80">
                              {cls.enrolledCount ?? 15} athletes
                            </span>
                          </td>
                          <td className="py-2.5 px-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => setCurrentView('attendance')}
                              className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#F4510B] text-white hover:bg-[#d94103] transition-colors cursor-pointer"
                            >
                              Attendance
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
                  onClick={() => setCurrentView('classes')}
                  className="text-[11.5px] font-black text-[#F4510B] hover:text-[#d44307] flex items-center gap-1 group cursor-pointer transition-colors"
                >
                  <span>Explore all sessions</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </FloatingCard>

            {/* Card 2: Coaching Performance & Turnout */}
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
                      Coaching Performance
                    </h2>
                  </div>
                  <span className="text-[10.5px] font-extrabold text-[#F4510B] bg-[#FFF5ED] px-2.5 py-1 rounded-full border border-[#F4510B20] select-none">
                    {mySchedules.length} Sessions
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center py-2.5 my-auto">
                <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                  {/* KPI 1 */}
                  <div 
                    onClick={() => setCurrentView('schedules')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#F0F7FF] border border-[#0284C720] flex flex-col justify-between hover:border-[#0284C750] transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
                          <CalendarDays className="w-3.5 h-3.5 text-[#0284C7]" />
                        </div>
                        <span className="text-[11px] font-black text-[#172B50] group-hover:text-[#0284C7] transition-colors">
                          Schedules
                        </span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                        {mySchedules.length}
                      </span>
                      <span className="text-[9.5px] font-bold text-[#172B50]/55 uppercase tracking-wide">
                        Timetables
                      </span>
                    </div>
                  </div>

                  {/* KPI 2 */}
                  <div 
                    onClick={() => setCurrentView('batches')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF5FF] border border-[#9333EA20] flex flex-col justify-between hover:border-[#9333EA50] transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
                          <GraduationCap className="w-3.5 h-3.5 text-[#9333EA]" />
                        </div>
                        <span className="text-[11px] font-black text-[#172B50] group-hover:text-[#9333EA] transition-colors">
                          Athletes
                        </span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-[#9333EA]" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                        {myStudents.length}
                      </span>
                      <span className="text-[9.5px] font-bold text-[#172B50]/55 uppercase tracking-wide">
                        Assigned
                      </span>
                    </div>
                  </div>

                  {/* KPI 3 */}
                  <div 
                    onClick={() => setCurrentView('compensation')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#F0FDF4] border border-[#16A34A20] flex flex-col justify-between hover:border-[#16A34A50] transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                          <RefreshCw className="w-3.5 h-3.5 text-[#16A34A]" />
                        </div>
                        <span className="text-[11px] font-black text-[#172B50] group-hover:text-[#16A34A] transition-colors">
                          Makeups
                        </span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                        {totalCompSlotCount}
                      </span>
                      <span className="text-[9.5px] font-bold text-[#172B50]/55 uppercase tracking-wide">
                        Slots
                      </span>
                    </div>
                  </div>

                  {/* KPI 4 */}
                  <div 
                    onClick={() => setCurrentView('evaluations')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#FFF5ED] border border-[#F4510B20] flex flex-col justify-between hover:border-[#F4510B50] transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-[#FFE2D1] text-[#F4510B] flex items-center justify-center shrink-0">
                          <Star className="w-3.5 h-3.5 text-[#F4510B]" />
                        </div>
                        <span className="text-[11px] font-black text-[#172B50] group-hover:text-[#F4510B] transition-colors">
                          Rating
                        </span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-[#F4510B]" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                        {coachProfile.rating || '4.9'}★
                      </span>
                      <span className="text-[9.5px] font-bold text-[#172B50]/55 uppercase tracking-wide">
                        5.0 Scale
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#172B500C] flex items-center justify-between text-xs px-1">
                  <span className="text-[11px] font-bold text-[#172B50]/65">
                    Faculty Status
                  </span>
                  <span className="text-[11px] font-black text-[#F4510B] bg-[#FFF5ED] px-2.5 py-0.5 rounded-lg border border-[#F4510B20]">
                    Active • {coachProfile.center}
                  </span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-auto shrink-0">
                <span className="text-[11px] font-bold text-[#172B50]/60 uppercase tracking-wider">
                  Evaluations & Logs
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentView('evaluations')}
                  className="text-[11.5px] font-black text-[#F4510B] hover:text-[#d44307] flex items-center gap-1 group cursor-pointer transition-colors"
                >
                  <span>Explore evaluations</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </FloatingCard>

            {/* Card 3: Coach Faculty Toolkit */}
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
                      Coach Faculty Toolkit
                    </h2>
                    <p className="text-[11px] font-medium text-[#172B50]/60">
                      Operations, safety & workspace
                    </p>
                  </div>
                </div>

                <div className="min-h-[265px] flex flex-col justify-center mt-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Tile 1: Mark Attendance */}
                    <button
                      type="button"
                      onClick={() => setCurrentView('attendance')}
                      className="bg-[#0B3B60] text-white rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-center text-center shadow-sm hover:bg-[#082d4a] active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-white/10 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <ClipboardCheck className="w-4.5 h-4.5 text-white" />
                      </div>
                      <span className="text-xs font-black text-white leading-tight">
                        Mark Attendance
                      </span>
                      <span className="text-[9.5px] font-medium text-white/70 mt-0.5">
                        Roll Call Register
                      </span>
                    </button>

                    {/* Tile 2: Class Timetables */}
                    <button
                      type="button"
                      onClick={() => setCurrentView('classes')}
                      className="bg-white text-[#172B50] rounded-2xl p-3 sm:p-3.5 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#F4510B35] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-[#FFF5ED] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <CalendarDays className="w-4.5 h-4.5 text-[#F4510B]" />
                      </div>
                      <span className="text-xs font-black text-[#172B50] leading-tight">
                        Class Schedules
                      </span>
                      <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                        {mySchedules.length} Sessions
                      </span>
                    </button>

                    {/* Tile 3: Equipment Inspection */}
                    <button
                      type="button"
                      onClick={() => setCurrentView('equipment')}
                      className="bg-white text-[#172B50] rounded-2xl p-3 sm:p-3.5 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#F4510B35] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-[#FFF4E8] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <Shield className="w-4.5 h-4.5 text-[#F4510B]" />
                      </div>
                      <span className="text-xs font-black text-[#172B50] leading-tight">
                        Gear Inspection
                      </span>
                      <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                        Condition Reports
                      </span>
                    </button>

                    {/* Tile 4: My Workspace */}
                    <button
                      type="button"
                      onClick={() => setCurrentView('workspace')}
                      className="bg-white text-[#172B50] rounded-2xl p-3 sm:p-3.5 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#0284C735] hover:bg-[#F0F9FF] active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-[#F0F9FF] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <UserCheck className="w-4.5 h-4.5 text-[#0284C7]" />
                      </div>
                      <span className="text-xs font-black text-[#172B50] leading-tight">
                        My Workspace
                      </span>
                      <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                        Profile & Leave
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-auto shrink-0">
                <span className="text-[11px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                  Faculty Workspace
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentView('workspace')}
                  className="text-[11.5px] font-black text-[#172B50] hover:text-[#F4510B] flex items-center gap-1 group cursor-pointer transition-colors"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </FloatingCard>

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
                My Class Schedules &amp; Court Allocations
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Real-time schedules published by Admin for Coach {coachProfile.name}. Any updates or cancellations reflect instantly.
              </p>
            </div>
          </div>

          {/* Top 4 KPI Cards matching Admin ProgramsClassesModule */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-[#FFF4E8] border border-[#F4510B25] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B18] text-[#F4510B] flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Assigned Schedules</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {mySchedules.length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0FDF4] border border-[#16A34A20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#16A34A18] text-[#16A34A] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Active Batches</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {myClasses.length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0F7FF] border border-[#0284C720] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#0284C718] text-[#0284C7] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-[#0284C7]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Enrolled Athletes</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {myStudents.length}
                </div>
              </div>
            </div>

            <div className="bg-[#FFF9F5] border border-[#F4510B20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B15] text-[#F4510B] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Assigned Center</div>
                <div className="text-base sm:text-lg font-black text-[#172B50] leading-none tracking-tight mt-0.5 truncate max-w-[120px]">
                  {coachProfile.center || 'Main Academy'}
                </div>
              </div>
            </div>
          </div>

          <div>

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

      {/* 3. MY STUDENTS: ADAPTED FROM ADMIN STUDENT MANAGEMENT */}
      {currentView === 'students' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                My Student Roster &amp; Athlete Management
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Athletes currently enrolled in your training batches across {coachProfile.center || 'academy centers'}
              </p>
            </div>
          </div>

          {/* Top 4 KPI Cards matching Admin StudentManagement */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-[#FFF4E8] border border-[#F4510B25] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B18] text-[#F4510B] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Assigned Athletes</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {myStudents.length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0FDF4] border border-[#16A34A20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#16A34A18] text-[#16A34A] flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Active Athletes</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {myStudents.filter(s => s.status !== 'Inactive').length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0F7FF] border border-[#0284C720] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#0284C718] text-[#0284C7] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-[#0284C7]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Average Turnout</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {myStudents.length > 0 ? Math.round(myStudents.reduce((acc, s) => acc + (s.attendanceRate || 95), 0) / myStudents.length) : 95}%
                </div>
              </div>
            </div>

            <div className="bg-[#FFF9F5] border border-[#F4510B20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B15] text-[#F4510B] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">My Batches</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {coachAssignedBatches.length}
                </div>
              </div>
            </div>
          </div>

          {/* Search bar matching Admin */}
          <div className="bg-white rounded-2xl p-4 border border-[#172B501A] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#172B50]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search athlete by name, kid ID, or program..."
                className="w-full pl-9 pr-4 py-2 bg-[#FFF4E8]/40 border border-[#172B5018] rounded-full text-xs font-semibold text-[#172B50] placeholder:text-[#172B50]/40 outline-none focus:border-[#F4510B]"
                onChange={(e) => setAthleteSearch(e.target.value)}
              />
            </div>
            <span className="text-xs font-bold text-[#172B50]/60">
              Showing {myStudents.length} athletes assigned to Coach {coachProfile.name}
            </span>
          </div>

          {/* Table matching Admin Student Management */}
          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF4E8] text-[#172B50] font-black uppercase text-[11px] tracking-wider border-b border-[#172B5015]">
                  <tr>
                    <th className="p-3.5"># KID ID</th>
                    <th className="p-3.5">STUDENT &amp; PARENT</th>
                    <th className="p-3.5">PROGRAM &amp; BATCH</th>
                    <th className="p-3.5">ATTENDANCE %</th>
                    <th className="p-3.5">MEDICAL &amp; NOTES</th>
                    <th className="p-3.5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B5010]">
                  {myStudents
                    .filter(s => !athleteSearch || s.name.toLowerCase().includes(athleteSearch.toLowerCase()) || (s.id && s.id.toLowerCase().includes(athleteSearch.toLowerCase())))
                    .map(s => (
                    <tr key={s.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] font-black text-[#F4510B]">{s.id}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-[#172B5020]" />
                          <div>
                            <span className="font-extrabold text-[#172B50] block">{s.name}</span>
                            <span className="text-[10px] text-[#172B50]/60 block">{s.parentName} ({s.parentPhone})</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-[#172B50] block">{s.program}</span>
                        <span className="text-[10.5px] font-semibold text-[#F4510B] block">{s.batchName || 'General Batch'}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-emerald-700">{s.attendanceRate || 95}%</span>
                          <div className="w-16 h-1.5 bg-[#172B5010] rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${s.attendanceRate || 95}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-[11px] text-[#172B50] opacity-80 max-w-xs truncate">
                        {s.medicalNote || 'Fit for full athletic drills'}
                      </td>
                      <td className="p-3.5 text-right">
                        <button 
                          onClick={() => {
                            setEvalStudent(s.id);
                            setCurrentView('evaluations');
                          }}
                          className="px-3 py-1.5 text-xs font-bold bg-[#172B50] text-white rounded-xl hover:bg-[#F4510B] transition-colors cursor-pointer shadow-2xs"
                        >
                          Evaluate Athlete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. ATTENDANCE (LOCATION & ASSIGNED BATCH SCOPED) */}
      {currentView === 'attendance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Sub-view Navigation matching Admin Module Tab Switcher */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-[#172B5018] shadow-2xs self-start w-fit">
            <button
              type="button"
              onClick={() => setCoachAttSubView('mark_session')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                coachAttSubView === 'mark_session'
                  ? 'bg-[#F4510B] text-white shadow-xs'
                  : 'text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B]'
              }`}
            >
              Student Attendance
            </button>
            <button
              type="button"
              onClick={() => setCoachAttSubView('register')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                coachAttSubView === 'register'
                  ? 'bg-[#F4510B] text-white shadow-xs'
                  : 'text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B]'
              }`}
            >
              Coach Attendance Register
            </button>
            <button
              type="button"
              onClick={() => setCoachAttSubView('my_leaves')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                coachAttSubView === 'my_leaves'
                  ? 'bg-[#F4510B] text-white shadow-xs'
                  : 'text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B]'
              }`}
            >
              My Leave Requests{(data.coachLeaveRequests || []).filter(r => r.coachId === coachProfile?.id && r.status === 'Pending').length > 0 ? ` (${(data.coachLeaveRequests || []).filter(r => r.coachId === coachProfile?.id && r.status === 'Pending').length})` : ''}
            </button>
          </div>

          {coachAttSubView === 'mark_session' ? (
            <AttendanceManagement 
              initialLocation={coachProfile.center || 'KK NAGAR'}
              initialCoach={coachProfile.name}
              fixedLocation={true}
              fixedCoach={true}
              portalRole="coach"
            />
          ) : (
            <CoachAttendanceRegister 
              currentPortal="coach" 
              defaultCoachId={coachProfile?.id}
              allowedCoaches={[coachProfile]} 
            />
          )}
        </div>
      )}

      {/* 5. STUDENT PERFORMANCE (EVALUATIONS) */}
      {currentView === 'evaluations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Spartan Athlete Skill Assessments &amp; Evaluations
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Admin-standard technical rubric scoring, belt progressions, and term milestone tracking
              </p>
            </div>
          </div>

          {/* Top 4 KPI Cards matching Admin Certificates / Evaluations */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-[#FFF4E8] border border-[#F4510B25] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B18] text-[#F4510B] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Total Athletes</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {myStudents.length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0FDF4] border border-[#16A34A20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#16A34A18] text-[#16A34A] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Evaluation Rubrics</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  5 Disciplines
                </div>
              </div>
            </div>

            <div className="bg-[#F0F7FF] border border-[#0284C720] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#0284C718] text-[#0284C7] flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 text-[#0284C7]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Average Score</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  8.8 / 10
                </div>
              </div>
            </div>

            <div className="bg-[#FFF9F5] border border-[#F4510B20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B15] text-[#F4510B] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Current Term</div>
                <div className="text-base sm:text-lg font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  Q4 2026
                </div>
              </div>
            </div>
          </div>

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

          {/* Top 4 KPI Cards matching Admin StudentCompensation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-[#FFF4E8] border border-[#F4510B25] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B18] text-[#F4510B] flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Assigned Replacements</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {assignedStudentReplacements.length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0FDF4] border border-[#16A34A20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#16A34A18] text-[#16A34A] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Completed Sessions</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {assignedStudentReplacements.filter(r => r.status === 'Completed').length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0F7FF] border border-[#0284C720] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#0284C718] text-[#0284C7] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-[#0284C7]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Pending Execution</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {assignedStudentReplacements.filter(r => r.status !== 'Completed').length}
                </div>
              </div>
            </div>

            <div className="bg-[#FFF9F5] border border-[#F4510B20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B15] text-[#F4510B] flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Substitute Coverage</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {coachComps.length}
                </div>
              </div>
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
      {(currentView === 'competitions' || currentView === 'sports_events') && (
        <SportsEventsModule />
      )}

      {/* 8. EQUIPMENT INSPECTION & REPORTING */}
      {currentView === 'equipment' && (
        <EquipmentManagementModule
          role="coach"
          allowedLocations={coachProfile.center ? [coachProfile.center] : null}
        />
      )}

      {/* 9. MY WORKSPACE (Module 7.8: Leave, Announcements, Profile) */}
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
