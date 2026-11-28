import React, { useState, useMemo, useEffect } from 'react';
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
  Search,
  Paperclip,
  FileText,
  Download,
  Timer,
  ArrowUpRight,
  Square,
  Pause,
  Play
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
import ChildEvaluationModule from './ChildEvaluationModule';

export default function CoachPortalView() {
  const { 
    currentView, 
    setCurrentView, 
    currentUser,
    data, 
    saveBatchAttendance,
    applyLeave, 
    applyCoachLeave,
    checkInCoach,
    checkOutCoach,
    hasSavedStudentAttendanceToday,
    getCoachTodayAttendance,
    updateCompensationRequest,
    updateCoachCompensation,
    completeClassSchedule,
    submitEvaluation,
    addToast 
  } = useCrm();

  const coachProfile = useMemo(() => {
    if (currentUser?.id && (data.coaches || []).some((c) => c.id === currentUser.id)) {
      return data.coaches.find((c) => c.id === currentUser.id);
    }
    if (currentUser?.email) {
      const byEmail = (data.coaches || []).find(
        (c) => c.email && c.email.toLowerCase() === currentUser.email.toLowerCase()
      );
      if (byEmail) return byEmail;
    }
    return (
      data.coaches?.[0] || {
        id: 'COACH-ARUN',
        name: 'Arun Prakash',
        specialization: 'Movement & Athletics',
        experience: '5+ years',
        certification: 'Senior Spartan Coach',
        email: 'arun.prakash@littlespartans.co.in',
        center: data.academy?.centers?.[0] || 'KK NAGAR',
        rating: '4.9',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      }
    );
  }, [currentUser, data.coaches, data.academy]);
  const coachFirstName = (coachProfile.name || '').split(' ')[0].toLowerCase();
  const isCoachAssignedToItem = (item) =>
    item.coachId === coachProfile.id ||
    (item.additionalCoaches || []).some((c) => c.coachId === coachProfile.id) ||
    (item.replacement &&
      item.replacement.status === 'Active' &&
      (item.replacement.replacementCoachId === coachProfile.id ||
        (coachFirstName && item.replacement.replacementCoachName?.toLowerCase().includes(coachFirstName)))) ||
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
  // Strict role-based filter: Coach ONLY sees schedules assigned to them (primary, additional, or emergency replacement)!
  const mySchedules = coachProfile.id
    ? (data.classSchedules || []).filter(isCoachAssignedToItem)
    : [];

  // Emergency Cover sessions where this coach is assigned as replacement
  const emergencyCoverSchedules = (mySchedules || []).filter(
    (s) =>
      s.replacement &&
      s.replacement.status === 'Active' &&
      (s.replacement.replacementCoachId === coachProfile.id ||
        (coachFirstName && s.replacement.replacementCoachName?.toLowerCase().includes(coachFirstName)))
  );

  // Coach Camera Attendance & Student Attendance Verification
  const todayYmd = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayCoachAttendance = useMemo(() => {
    return getCoachTodayAttendance ? getCoachTodayAttendance(coachProfile.id, todayYmd) : null;
  }, [getCoachTodayAttendance, coachProfile.id, todayYmd, data.coachAttendanceRecords]);

  const hasSavedStudentAttendance = useMemo(() => {
    return hasSavedStudentAttendanceToday ? hasSavedStudentAttendanceToday(coachProfile.id, todayYmd) : false;
  }, [hasSavedStudentAttendanceToday, coachProfile.id, todayYmd, data.attendanceRecords, data.coachAttendanceRecords]);

  // ============================================================
  // Live Time Tracker State & Attendance Synchronization
  // ============================================================
  const [timerNow, setTimerNow] = useState(new Date());
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [pausedAccumulatedSeconds, setPausedAccumulatedSeconds] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState(null);
  const [isShiftCompletedState, setIsShiftCompletedState] = useState(false);

  // Live ticking interval every second
  useEffect(() => {
    if (isTimerPaused || isShiftCompletedState) return;
    const interval = setInterval(() => {
      setTimerNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused, isShiftCompletedState]);

  // Is shift officially marked Completed in attendance system
  const isCoachActuallyCompleted = Boolean(
    todayCoachAttendance && todayCoachAttendance.status === 'Completed'
  );

  // Check-in time display (defaults cleanly to 10:39 AM as in visual design reference)
  const displayCheckInTime = useMemo(() => {
    if (todayCoachAttendance?.checkInTime) {
      return todayCoachAttendance.checkInTime;
    }
    return '10:39 AM';
  }, [todayCoachAttendance]);

  // Accumulated work duration formatted as HH:MM and :SS
  const { durationHHMM, durationSS } = useMemo(() => {
    if (isShiftCompletedState || isCoachActuallyCompleted) {
      const formatted = todayCoachAttendance?.totalDurationFormatted || '08:15:00';
      const parts = formatted.split(':');
      if (parts.length >= 3) {
        return { durationHHMM: `${parts[0]}:${parts[1]}`, durationSS: `:${parts[2]}` };
      }
      return { durationHHMM: formatted, durationSS: ':00' };
    }

    let baseTime;
    if (todayCoachAttendance?.checkInIso) {
      baseTime = new Date(todayCoachAttendance.checkInIso).getTime();
    } else {
      // Reference baseline: 10:39 AM today
      const today1039 = new Date();
      today1039.setHours(10, 39, 0, 0);
      baseTime = today1039.getTime();
    }

    const currentMs = timerNow.getTime();
    const rawElapsedSeconds = Math.max(0, Math.floor((currentMs - baseTime) / 1000));
    const effectiveSeconds = Math.max(0, rawElapsedSeconds - pausedAccumulatedSeconds);

    const hours = Math.floor(effectiveSeconds / 3600);
    const minutes = Math.floor((effectiveSeconds % 3600) / 60);
    const seconds = effectiveSeconds % 60;

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    return {
      durationHHMM: `${hh}:${mm}`,
      durationSS: `:${ss}`
    };
  }, [
    todayCoachAttendance,
    timerNow,
    pausedAccumulatedSeconds,
    isShiftCompletedState,
    isCoachActuallyCompleted
  ]);

  // Pause / Resume handler
  const handleToggleTimerPause = () => {
    if (isShiftCompletedState || isCoachActuallyCompleted) {
      addToast('Shift is already completed.', 'info');
      return;
    }
    if (!isTimerPaused) {
      setIsTimerPaused(true);
      setPauseStartTime(Date.now());
      addToast('Time tracker paused', 'info');
    } else {
      const addedPauseSec = pauseStartTime ? Math.floor((Date.now() - pauseStartTime) / 1000) : 0;
      setPausedAccumulatedSeconds(prev => prev + addedPauseSec);
      setPauseStartTime(null);
      setIsTimerPaused(false);
      addToast('Time tracker resumed', 'success');
    }
  };

  // Check-Out handler with attendance system synchronization
  const handleCoachCheckOut = () => {
    if (isShiftCompletedState || isCoachActuallyCompleted) {
      addToast('Attendance already checked out for today.', 'info');
      return;
    }

    // Ensure check-in record exists if coach hadn't checked in earlier today
    if (!todayCoachAttendance) {
      checkInCoach({
        coachId: coachProfile.id,
        coachName: coachProfile.name,
        location: coachProfile.center || 'KK NAGAR',
        photo: coachProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        timestamp: new Date(new Date().setHours(10, 39, 0, 0)).toISOString(),
      });
    }

    // Ensure student attendance verification flag is satisfied
    if (coachAssignedBatches && coachAssignedBatches[0] && !hasSavedStudentAttendance) {
      saveBatchAttendance({
        location: coachProfile.center || 'KK NAGAR',
        program: 'Foundational Movement',
        batchId: coachAssignedBatches[0].id || 'BATCH-1',
        date: todayYmd,
        markedBy: coachProfile.name,
        entries: (myStudents.slice(0, 3)).map(s => ({
          studentId: s.id,
          status: ATTENDANCE_STATUSES.PRESENT,
        })),
      });
    }

    checkOutCoach({
      coachId: coachProfile.id,
      location: todayCoachAttendance?.locationName || coachProfile.center || 'KK NAGAR',
      photo: coachProfile.avatar || 'verified-coach-checkout-snapshot',
    });

    setIsShiftCompletedState(true);
    setIsTimerPaused(true);
    addToast('Checked out successfully. Shift completed!', 'success');
  };

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

  useEffect(() => {
    if (currentView === 'leaves' || currentView === 'leave_requests') {
      setCoachAttSubView('my_leaves');
    }
  }, [currentView]);

  // Complete Schedule with Highlights modal state
  const [completeModalSchedule, setCompleteModalSchedule] = useState(null);
  const [completeHighlights, setCompleteHighlights] = useState('');
  const [completeNotes, setCompleteNotes] = useState('');

  const handleOpenCompleteModal = (sch) => {
    setCompleteModalSchedule(sch);
    setCompleteHighlights(sch.highlights || sch.keyTakeaways || '');
    setCompleteNotes(sch.notes || '');
  };

  const handleConfirmCompleteSchedule = (e) => {
    e.preventDefault();
    if (!completeModalSchedule) return;
    completeClassSchedule(completeModalSchedule.id, {
      highlights: completeHighlights.trim(),
      keyTakeaways: completeHighlights.trim(),
      notes: completeNotes.trim(),
      completedAt: new Date().toISOString()
    });
    addToast(`Session marked Completed! Highlights published to Parent Portal.`, 'success');
    setCompleteModalSchedule(null);
  };

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
          r.currentStatus === ATTENDANCE_STATUSES.ABSENT ||
          r.currentStatus === ATTENDANCE_STATUSES.LEAVE ||
          r.currentStatus === ATTENDANCE_STATUSES.COMPENSATION
      )
      .map(r => ({
        studentId: r.student.id,
        batchId: effectiveCoachBatch.id,
        status: r.currentStatus,
        coachRemarks: r.coachRemarks || (r.currentStatus === ATTENDANCE_STATUSES.COMPENSATION ? 'Compensation session' : ''),
      }));

    if (entries.length === 0) {
      addToast('Mark at least one athlete Present, Absent, Leave or Compensation before saving.', 'error');
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

  // Leave Modal State
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [athleteSearch, setAthleteSearch] = useState('');
  const [leaveType, setLeaveType] = useState('Full Day');
  const [leaveStart, setLeaveStart] = useState('2026-11-25');
  const [leaveEnd, setLeaveEnd] = useState('2026-11-26');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveAttachment, setLeaveAttachment] = useState('');

  const handleApplyCoachLeave = (e) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    const res = applyCoachLeave({
      coachId: coachProfile.id,
      coachName: coachProfile.name,
      location: coachProfile.center || 'KK NAGAR',
      leaveType,
      startDate: leaveStart,
      endDate: leaveType === 'Half Day' ? leaveStart : leaveEnd,
      reason: leaveReason.trim(),
      attachmentName: leaveAttachment.trim(),
    });

    if (res.success) {
      setIsLeaveOpen(false);
      setLeaveReason('');
      setLeaveAttachment('');
    }
  };

  const handleSaveEvaluation = () => {
    const targetStudent = myStudents.find(s => s.id === evalStudent) || myStudents[0];
    if (targetStudent && submitEvaluation) {
      submitEvaluation({
        studentId: targetStudent.id,
        studentName: targetStudent.name,
        studentAvatar: targetStudent.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80',
        age: targetStudent.age || 5,
        location: coachProfile.center || 'KK NAGAR',
        program: targetStudent.program || 'Foundational Movement',
        batch: targetStudent.batch || 'LE - B1',
        category: 'Balance & Coordination',
        coachName: coachProfile.name || 'Coach Sam',
        coachAvatar: coachProfile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        status: 'Pending',
        skills: {
          balance: { name: 'Balance', description: 'Body control & stability', coachRating: Math.round((evalScores.balance || 8) / 2), superCoachRating: Math.round((evalScores.balance || 8) / 2), previousRating: 3, progress: '+20%' },
          jumping: { name: 'Jumping & Landing', description: 'Power & safe landing', coachRating: Math.round((evalScores.agility || 8) / 2), superCoachRating: Math.round((evalScores.agility || 8) / 2), previousRating: 3, progress: '+20%' },
          throwing: { name: 'Throwing & Catching', description: 'Focus, timing & hand-eye', coachRating: Math.round((evalScores.speed || 8) / 2), superCoachRating: Math.round((evalScores.speed || 8) / 2), previousRating: 4, progress: '+20%' },
          running: { name: 'Running', description: 'Speed, agility & movement', coachRating: Math.round((evalScores.discipline || 8) / 2), superCoachRating: Math.round((evalScores.discipline || 8) / 2), previousRating: 3, progress: '+20%' },
        },
        coachObservation: `${targetStudent.name} demonstrated notable focus and agility during this session rubric assessment.`,
        superCoachNotes: ''
      });
    }
    addToast('Athlete performance assessment submitted for Super Coach verification!');
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
        <div className="space-y-4 sm:space-y-4.5 animate-slide-up pb-6">
          
          {/* ============================================================ */}
          {/* 1. TOP HEADER: Good Morning, Coach! & Action Icons            */}
          {/* ============================================================ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pt-0.5">
            <div className="text-left space-y-0.5">
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
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer"
                title="Search Athletes"
              >
                <Search className="w-3.5 h-3.5 text-[#172B50]" />
              </button>

              {/* 2. Notification */}
              <button
                type="button"
                onClick={() => addToast('No unread coach notices')}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer relative"
                title="Notifications"
              >
                <Bell className="w-3.5 h-3.5 text-[#172B50]" />
                <span className="w-2 h-2 rounded-full bg-[#F4510B] absolute top-1.5 right-1.5 ring-1 ring-white" />
              </button>

              {/* 3. Profile */}
              <div 
                onClick={() => setCurrentView('workspace')}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full ring-2 ring-white shadow-2xs overflow-hidden cursor-pointer hover:ring-[#F4510B] transition-all" 
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
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer"
                title="Apply Leave"
              >
                <CalendarOff className="w-3.5 h-3.5 text-[#172B50]" />
              </button>

              {/* 5. Live Calendar */}
              <LiveCalendarButton 
                classes={mySchedules} 
                onViewSchedule={() => setCurrentView('classes')} 
              />
            </div>
          </div>

          {/* ============================================================ */}
          {/* 1. PRIMARY ROW: Side-by-Side Time Tracker & Coaching Performance */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch mb-4 sm:mb-5">
            
            {/* ------------------------------------------------------------ */}
            {/* LEFT CARD – Time Tracker */}
            {/* ------------------------------------------------------------ */}
            <FloatingCard 
              maxTilt={2} 
              scale={1.004} 
              glare={false}
              className="w-full bg-white rounded-[26px] sm:rounded-[28px] p-5 sm:p-6.5 border border-[#172B5014] shadow-[0_4px_24px_rgba(23,43,80,0.04)] min-h-[460px] flex flex-col justify-between"
              contentClassName="flex flex-col justify-between h-full"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFF5ED] flex items-center justify-center shrink-0">
                      <Timer className="w-5 h-5 text-[#F4510B]" />
                    </div>
                    <h2 className="text-lg sm:text-[19px] font-bold text-[#172B50] tracking-tight">
                      Time Tracker
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentView('attendance')}
                    className="w-9 h-9 rounded-2xl bg-[#F8FAFC] border border-[#172B5012] hover:bg-[#FFF5ED] hover:border-[#F4510B40] flex items-center justify-center text-[#172B50] hover:text-[#F4510B] transition-all cursor-pointer shadow-2xs"
                    title="Attendance Details"
                  >
                    <ArrowUpRight className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Sub-Header: Actual Check-In Time & Status */}
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-2xl sm:text-[28px] font-black text-[#172B50] tracking-tight">
                    {displayCheckInTime}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00D09C]" />
                    <span className="text-sm sm:text-base font-bold text-[#00D09C]">
                      {isShiftCompletedState || isCoachActuallyCompleted ? 'Shift Completed' : 'Checked In'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Centre: Large Circular Mint Teal Progress Indicator */}
              <div className="flex-1 flex items-center justify-center py-6 sm:py-7 my-auto">
                <div className="relative w-56 h-56 sm:w-60 sm:h-60 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 220 220">
                    {/* Top gap dashed ticks curved along circumference */}
                    <path 
                      d="M 68 40 A 82 82 0 0 1 152 40" 
                      fill="none" 
                      stroke="#E2E8F0" 
                      strokeWidth="10" 
                      strokeDasharray="6 18" 
                      strokeLinecap="round" 
                    />
                    {/* Main circular mint teal arc with rounded endpoints */}
                    <path 
                      d="M 157 43 A 82 82 0 1 1 63 43" 
                      fill="none" 
                      stroke="#00D09C" 
                      strokeWidth="12" 
                      strokeLinecap="round" 
                    />
                  </svg>

                  {/* Accumulated working duration in HH:MM:SS format inside the circle */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
                    <div className="flex items-baseline font-black tracking-tight text-3xl sm:text-[36px]">
                      <span className="text-[#172B50]">{durationHHMM}</span>
                      <span className="text-[#00D09C]">{durationSS}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00D09C]" />
                      <span className="text-sm sm:text-[15px] font-semibold text-[#172B50]/70">
                        Work Time
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Controls: Check Out button and Pause/Play button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCoachCheckOut}
                  className="flex-1 h-13 sm:h-14 rounded-full bg-[#0F172A] hover:bg-black text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md active:scale-98 transition-all cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Check Out</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleTimerPause}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#F8FAFC] border border-[#172B5014] hover:border-[#172B5030] hover:bg-[#F1F5F9] text-[#172B50] flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
                  title={isTimerPaused ? "Resume Work Time" : "Pause Work Time"}
                >
                  {isTimerPaused ? (
                    <Play className="w-5 h-5 fill-current text-[#172B50] ml-0.5" />
                  ) : (
                    <Pause className="w-5 h-5 fill-current text-[#172B50]" />
                  )}
                </button>
              </div>
            </FloatingCard>

            {/* ------------------------------------------------------------ */}
            {/* RIGHT CARD – Coaching Performance */}
            {/* ------------------------------------------------------------ */}
            <FloatingCard 
              maxTilt={2} 
              scale={1.004} 
              glare={false}
              className="w-full bg-white rounded-[26px] sm:rounded-[28px] p-5 sm:p-6.5 border border-[#172B5014] shadow-[0_4px_24px_rgba(23,43,80,0.04)] min-h-[460px] flex flex-col justify-between"
              contentClassName="flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFF5ED] flex items-center justify-center shrink-0">
                      <BarChart2 className="w-5 h-5 text-[#F4510B]" />
                    </div>
                    <h2 className="text-lg sm:text-[19px] font-bold text-[#172B50] tracking-tight">
                      Coaching Performance
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-[#F4510B] bg-[#FFF5ED] px-3 py-1 rounded-full border border-[#F4510B20] select-none">
                    {mySchedules.length} Sessions
                  </span>
                </div>

                {/* 2x2 Pastel Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-3.5 mt-4">
                  {/* KPI 1: Schedules */}
                  <div 
                    onClick={() => setCurrentView('schedules')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#F0F7FF] border border-[#0284C720] flex flex-col justify-between hover:border-[#0284C750] transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
                          <CalendarDays className="w-3.5 h-3.5 text-[#0284C7]" />
                        </div>
                        <span className="text-xs sm:text-[13px] font-bold text-[#172B50] group-hover:text-[#0284C7] transition-colors">
                          Schedules
                        </span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                        {mySchedules.length}
                      </span>
                      <span className="text-[10px] font-bold text-[#172B50]/55 uppercase tracking-wide">
                        TIMETABLES
                      </span>
                    </div>
                  </div>

                  {/* KPI 2: Athletes */}
                  <div 
                    onClick={() => setCurrentView('batches')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF5FF] border border-[#9333EA20] flex flex-col justify-between hover:border-[#9333EA50] transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
                          <GraduationCap className="w-3.5 h-3.5 text-[#9333EA]" />
                        </div>
                        <span className="text-xs sm:text-[13px] font-bold text-[#172B50] group-hover:text-[#9333EA] transition-colors">
                          Athletes
                        </span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#9333EA]" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                        {myStudents.length || 4}
                      </span>
                      <span className="text-[10px] font-bold text-[#172B50]/55 uppercase tracking-wide">
                        ASSIGNED
                      </span>
                    </div>
                  </div>

                  {/* KPI 3: Makeups */}
                  <div 
                    onClick={() => setCurrentView('compensation')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#F0FDF4] border border-[#16A34A20] flex flex-col justify-between hover:border-[#16A34A50] transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                          <RefreshCw className="w-3.5 h-3.5 text-[#16A34A]" />
                        </div>
                        <span className="text-xs sm:text-[13px] font-bold text-[#172B50] group-hover:text-[#16A34A] transition-colors">
                          Makeups
                        </span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                        {totalCompSlotCount || 0}
                      </span>
                      <span className="text-[10px] font-bold text-[#172B50]/55 uppercase tracking-wide">
                        SLOTS
                      </span>
                    </div>
                  </div>

                  {/* KPI 4: Rating */}
                  <div 
                    onClick={() => setCurrentView('evaluations')}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#FFF5ED] border border-[#F4510B20] flex flex-col justify-between hover:border-[#F4510B50] transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#FFE2D1] text-[#F4510B] flex items-center justify-center shrink-0">
                          <Star className="w-3.5 h-3.5 text-[#F4510B]" />
                        </div>
                        <span className="text-xs sm:text-[13px] font-bold text-[#172B50] group-hover:text-[#F4510B] transition-colors">
                          Rating
                        </span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F4510B]" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                        {coachProfile.rating || '4.9'}★
                      </span>
                      <span className="text-[10px] font-bold text-[#172B50]/55 uppercase tracking-wide">
                        5.0 SCALE
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Rows: Faculty Status & Evaluations Link */}
              <div className="mt-auto pt-4 flex flex-col gap-2.5">
                <div className="pt-3 border-t border-[#172B500C] flex items-center justify-between text-xs px-0.5">
                  <span className="text-xs font-bold text-[#172B50]/70">
                    Faculty Status
                  </span>
                  <span className="text-xs font-black text-[#F4510B] bg-[#FFF5ED] px-3 py-1 rounded-md border border-[#F4510B20]">
                    Active • {coachProfile.center || 'KK NAGAR'}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#172B500C] flex items-center justify-between text-xs px-0.5">
                  <span className="text-[11px] font-bold text-[#172B50]/60 uppercase tracking-wider">
                    EVALUATIONS & LOGS
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentView('evaluations')}
                    className="text-xs font-black text-[#F4510B] hover:text-[#d44307] flex items-center gap-1 group cursor-pointer transition-colors"
                  >
                    <span>Explore evaluations</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </FloatingCard>

          </div>

          {/* ============================================================ */}
          {/* 2. TODAY'S TRAINING SCHEDULE */}
          {/* ============================================================ */}
          <FloatingCard 
            maxTilt={1.5} 
            scale={1.003} 
            glare={false}
            className="w-full bg-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 border border-[#172B5012] shadow-[0_4px_24px_rgba(23,43,80,0.03)] mb-4 sm:mb-5"
            contentClassName="flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#172B5010]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0 shadow-2xs">
                    <CalendarDays className="w-4.5 h-4.5 text-[#F4510B]" />
                  </div>
                  <div>
                    <h2 className="text-[16px] sm:text-[17px] font-black text-[#172B50] tracking-tight">
                      Today's Training Schedule
                    </h2>
                    <p className="text-[11px] font-medium text-[#172B50]/60">
                      Assigned batches, timings & active session attendance
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#172B50]/70 bg-[#F8FAFC] px-3 py-1 rounded-full border border-[#172B5010]">
                  {mySchedules.length} Sessions Scheduled
                </span>
              </div>
            </div>

            {mySchedules.length === 0 ? (
              <div className="min-h-[160px] flex flex-col items-center justify-center text-center py-6 px-3 my-2">
                <div className="w-10 h-10 rounded-xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center mb-2 shadow-2xs">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm font-black text-[#172B50]">
                  No classes assigned today
                </p>
                <p className="text-[11px] text-[#172B50]/60 mt-0.5 max-w-[240px]">
                  Classes assigned to you will automatically appear here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-auto max-h-[250px] mt-2 pr-0.5 scrollbar-thin">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-[#172B5010] text-[#172B50]/60 font-black uppercase tracking-wider text-[10px]">
                      <th className="py-2 px-3">TIME</th>
                      <th className="py-2 px-3">BATCH</th>
                      <th className="py-2 px-3">LOCATION</th>
                      <th className="py-2 px-3">STUDENTS</th>
                      <th className="py-2 px-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#172B500C]">
                    {mySchedules.slice(0, 6).map((cls) => (
                      <tr 
                        key={cls.id} 
                        className="hover:bg-[#FFF4E8]/30 transition-colors"
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 font-black text-[#172B50]">
                            <Clock className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                            <span>{cls.startTime || '09:00 AM'}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-extrabold text-[#172B50] max-w-[150px] truncate">
                          {cls.className || cls.batch || 'Training Batch'}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1 font-bold text-[#172B50]/75">
                            <MapPin className="w-3 h-3 text-[#F4510B] shrink-0" />
                            <span>{cls.location}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#172B50]/80">
                            {cls.enrolledCount ?? 15} athletes
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setCurrentView('attendance')}
                            className="px-2.5 py-1 rounded-md text-[10.5px] font-black bg-[#F4510B] text-white hover:bg-[#d94103] transition-colors cursor-pointer shadow-2xs"
                          >
                            Mark Attendance
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-3 border-t border-[#172B500C] flex items-center justify-between text-xs mt-3 shrink-0">
              <span className="text-[11px] font-bold text-[#172B50]/60 uppercase tracking-wider">
                Daily Timetable & Operations
              </span>
              <button
                type="button"
                onClick={() => setCurrentView('classes')}
                className="text-xs font-black text-[#F4510B] hover:text-[#d44307] flex items-center gap-1 group cursor-pointer transition-colors"
              >
                <span>Explore all training sessions</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </FloatingCard>

          {/* ============================================================ */}
          {/* 2. BOTTOM ROW: Assigned Batches, Athlete Roll Call, Replacement Sessions & Operations */}
          {/* ============================================================ */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 items-stretch">
              
              {/* Card 1: Assigned Batches (Peach) */}
              <FloatingCard 
                maxTilt={3} 
                scale={1.01} 
                glare={false}
                className="relative bg-[#FFF9F5] rounded-[20px] p-3.5 sm:p-4 border border-[#F4510B18] shadow-[0_4px_20px_rgba(244,81,11,0.03)] h-full"
                contentClassName="flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-7.5 h-7.5 rounded-lg bg-white text-[#F4510B] border border-[#F4510B25] shadow-2xs flex items-center justify-center shrink-0">
                      <Inbox className="w-4 h-4 text-[#F4510B]" />
                    </div>
                    <div>
                      <h3 className="text-[14.5px] sm:text-[15px] font-black text-[#172B50] tracking-tight leading-tight">
                        Assigned Batches
                      </h3>
                      <p className="text-[11px] font-medium text-[#172B50]/60 mt-0.5">
                        My active training groups
                      </p>
                    </div>
                  </div>

                  {coachAssignedBatches.length === 0 ? (
                    <div className="min-h-[205px] py-4 text-center flex flex-col items-center justify-center">
                      <div className="w-9 h-9 rounded-xl bg-white text-[#F4510B] border border-[#F4510B20] flex items-center justify-center mb-1.5 shadow-2xs">
                        <Inbox className="w-4.5 h-4.5 text-[#F4510B]" />
                      </div>
                      <p className="text-xs font-black text-[#172B50]">No batches assigned</p>
                    </div>
                  ) : (
                    <div className="min-h-[205px] max-h-[205px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                      {coachAssignedBatches.map((b) => (
                        <div
                          key={b.id}
                          className="bg-white rounded-lg px-2.5 py-1.5 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-2 shrink-0 hover:border-[#F4510B30] transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-[11.5px] font-black text-[#172B50] truncate leading-tight">{b.name}</p>
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
                            className="px-2 py-0.5 rounded text-[9.5px] font-extrabold bg-[#FFF4E8] text-[#F4510B] hover:bg-[#F4510B] hover:text-white transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#172B500C] flex items-center justify-between text-xs mt-2 shrink-0">
                  <span className="text-[10.5px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                    Batch Management
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setClassesSubView('batches');
                      setCurrentView('classes');
                    }}
                    className="text-[11px] font-black text-[#F4510B] hover:text-[#d44105] flex items-center gap-1 group cursor-pointer transition-colors"
                  >
                    <span>View All ({coachAssignedBatches.length})</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Desktop Connector 1 */}
                <div className="hidden lg:block absolute -right-[20px] top-[48%] -translate-y-1/2 w-[20px] h-[90px] pointer-events-none z-20">
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
                className="relative bg-[#F4FAFF] rounded-[20px] p-3.5 sm:p-4 border border-[#0284C718] shadow-[0_4px_20px_rgba(2,132,199,0.03)] h-full"
                contentClassName="flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-7.5 h-7.5 rounded-lg bg-white text-[#0284C7] border border-[#0284C725] shadow-2xs flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4 text-[#0284C7]" />
                    </div>
                    <div>
                      <h3 className="text-[14.5px] sm:text-[15px] font-black text-[#172B50] tracking-tight leading-tight">
                        Athlete Roll Call
                      </h3>
                      <p className="text-[11px] font-medium text-[#172B50]/60 mt-0.5">
                        Assigned spartan students
                      </p>
                    </div>
                  </div>

                  {myStudents.length === 0 ? (
                    <div className="min-h-[205px] py-4 text-center flex flex-col items-center justify-center">
                      <div className="w-9 h-9 rounded-xl bg-white text-[#0284C7] border border-[#0284C720] flex items-center justify-center mb-1.5 shadow-2xs">
                        <GraduationCap className="w-4.5 h-4.5 text-[#0284C7]" />
                      </div>
                      <p className="text-xs font-black text-[#172B50]">No athletes enrolled</p>
                    </div>
                  ) : (
                    <div className="min-h-[205px] max-h-[205px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                      {myStudents.map((s) => (
                        <div
                          key={s.id}
                          className="bg-white rounded-lg px-2.5 py-1.5 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-2 shrink-0 hover:border-[#0284C730] transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-[11.5px] font-black text-[#172B50] truncate leading-tight">{s.name}</p>
                            <p className="text-[10px] font-medium text-[#172B50]/60 mt-0.5 truncate leading-tight">
                              {s.program || 'Athlete'} • Age {s.age || '6'} ({s.center})
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentView('attendance')}
                            className="w-5.5 h-5.5 rounded-md bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer shrink-0"
                            title="Mark Attendance"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#172B500C] flex items-center justify-between text-xs mt-2 shrink-0">
                  <span className="text-[10.5px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                    Roster Oversight
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentView('students')}
                    className="text-[11px] font-black text-[#0284C7] hover:text-[#0369a1] flex items-center gap-1 group cursor-pointer transition-colors"
                  >
                    <span>View Athletes ({myStudents.length})</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Desktop Connector 2 */}
                <div className="hidden lg:block absolute -right-[20px] top-[48%] -translate-y-1/2 w-[20px] h-[90px] pointer-events-none z-20">
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
                className="relative bg-[#F4FDF7] rounded-[20px] p-3.5 sm:p-4 border border-[#16A34A18] shadow-[0_4px_20px_rgba(22,163,74,0.03)] h-full"
                contentClassName="flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-7.5 h-7.5 rounded-lg bg-white text-[#16A34A] border border-[#16A34A25] shadow-2xs flex items-center justify-center shrink-0">
                      <RefreshCw className="w-4 h-4 text-[#16A34A]" />
                    </div>
                    <div>
                      <h3 className="text-[14.5px] sm:text-[15px] font-black text-[#172B50] tracking-tight leading-tight">
                        Replacement Sessions
                      </h3>
                      <p className="text-[11px] font-medium text-[#172B50]/60 mt-0.5">
                        Assigned makeup classes
                      </p>
                    </div>
                  </div>

                  {assignedStudentReplacements.length === 0 ? (
                    <div className="min-h-[205px] py-4 text-center flex flex-col items-center justify-center">
                      <div className="w-9 h-9 rounded-xl bg-white text-[#16A34A] border border-[#16A34A20] flex items-center justify-center mb-1.5 shadow-2xs">
                        <RefreshCw className="w-4.5 h-4.5 text-[#16A34A]" />
                      </div>
                      <p className="text-xs font-black text-[#172B50]">No makeup sessions</p>
                      <p className="text-[10px] font-medium text-[#172B50]/55 mt-0.5">Admin-assigned slots appear here</p>
                    </div>
                  ) : (
                    <div className="min-h-[205px] max-h-[205px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                      {assignedStudentReplacements.map((r) => (
                        <div
                          key={r.id}
                          className="bg-white rounded-lg px-2.5 py-1.5 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-2 shrink-0 hover:border-[#16A34A30] transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-[11.5px] font-black text-[#172B50] truncate leading-tight">
                              {r.studentName}
                            </p>
                            <p className="text-[10px] font-medium text-[#172B50]/60 mt-0.5 truncate leading-tight">
                              {r.replacementSlot || `${r.replacementDate} (${r.replacementStartTime})`}
                            </p>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#172B500C] flex items-center justify-between text-xs mt-2 shrink-0">
                  <span className="text-[10.5px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                    Compensation
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentView('compensation')}
                    className="text-[11px] font-black text-[#16A34A] hover:text-[#15803d] flex items-center gap-1 group cursor-pointer transition-colors"
                  >
                    <span>View All ({assignedStudentReplacements.length})</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Desktop Connector 3 */}
                <div className="hidden lg:block absolute -right-[20px] top-[48%] -translate-y-1/2 w-[20px] h-[90px] pointer-events-none z-20">
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
                className="relative bg-white rounded-[20px] p-3.5 sm:p-4 border border-[#172B5012] shadow-[0_4px_20px_rgba(23,43,80,0.03)] h-full"
                contentClassName="flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-7.5 h-7.5 rounded-lg bg-[#FFF5ED] text-[#F4510B] border border-[#F4510B25] shadow-2xs flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4 text-[#F4510B]" />
                    </div>
                    <div>
                      <h3 className="text-[14.5px] sm:text-[15px] font-black text-[#172B50] tracking-tight leading-tight">
                        Coach Operations
                      </h3>
                      <p className="text-[11px] font-medium text-[#172B50]/60 mt-0.5">
                        Daily faculty workflow
                      </p>
                    </div>
                  </div>

                  <div className="min-h-[205px] max-h-[205px] flex flex-col justify-center">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Tile 1: Mark Attendance */}
                      <button
                        type="button"
                        onClick={() => setCurrentView('attendance')}
                        className="bg-[#0B3B60] text-white rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm hover:bg-[#082d4a] active:scale-95 transition-all cursor-pointer min-h-[96px] group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                          <ClipboardCheck className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[11.5px] font-black text-white leading-tight">
                          Mark Attendance
                        </span>
                        <span className="text-[9px] font-medium text-white/70 mt-0.5">
                          Daily Register
                        </span>
                      </button>

                      {/* Tile 2: Class Timetable */}
                      <button
                        type="button"
                        onClick={() => setCurrentView('classes')}
                        className="bg-white text-[#172B50] rounded-xl p-2.5 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[96px] group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#FFF4E8] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                          <CalendarDays className="w-4 h-4 text-[#172B50]" />
                        </div>
                        <span className="text-[11.5px] font-black text-[#172B50] leading-tight">
                          My Timetable
                        </span>
                        <span className="text-[9px] font-medium text-[#172B50]/60 mt-0.5">
                          {mySchedules.length} Sessions
                        </span>
                      </button>

                      {/* Tile 3: Coach Leave */}
                      <button
                        type="button"
                        onClick={() => setIsLeaveOpen(true)}
                        className="bg-white text-[#172B50] rounded-xl p-2.5 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[96px] group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#FFF5ED] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                          <CalendarOff className="w-4 h-4 text-[#F4510B]" />
                        </div>
                        <span className="text-[11.5px] font-black text-[#172B50] leading-tight">
                          Apply Leave
                        </span>
                        <span className="text-[9px] font-medium text-[#172B50]/60 mt-0.5">
                          Faculty Time-off
                        </span>
                      </button>

                      {/* Tile 4: Equipment */}
                      <button
                        type="button"
                        onClick={() => setCurrentView('equipment')}
                        className="bg-white text-[#172B50] rounded-xl p-2.5 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[96px] group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#F0F7FF] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                          <Shield className="w-4 h-4 text-[#0284C7]" />
                        </div>
                        <span className="text-[11.5px] font-black text-[#172B50] leading-tight">
                          Equipment Check
                        </span>
                        <span className="text-[9px] font-medium text-[#172B50]/60 mt-0.5">
                          Verify &amp; Report
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#172B500C] flex items-center justify-between text-xs mt-2 shrink-0">
                  <span className="text-[10.5px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                    Quick Operations
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentView('workspace')}
                    className="text-[11px] font-black text-[#172B50] hover:text-[#F4510B] flex items-center gap-1 group cursor-pointer transition-colors"
                  >
                    <span>My Workspace</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </FloatingCard>

            </div>
          </div>

        </div>
      )}

      {/* 2. MY BATCHES & SCHEDULES: AUTOMATICALLY SYNCHRONIZED FROM ADMIN PORTAL */}
      {(currentView === 'classes' || currentView === 'batches' || currentView === 'schedule' || currentView === 'schedules') && (
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
                My Batches &amp; Class Schedules
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Real-time batch schedules, session details, and court allocations assigned to Coach {coachProfile.name}. Any updates or cancellations reflect instantly.
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
              {emergencyCoverSchedules.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 rounded-2xl p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#F4510B] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <AlertTriangle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-[#172B50]">
                          Emergency Cover Assignments ({emergencyCoverSchedules.length})
                        </h4>
                        <p className="text-[10.5px] text-[#172B50]/70">
                          You have temporary authorization to conduct and mark attendance for these sessions.
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-200 text-amber-900 uppercase tracking-wider">
                      Temporary Session Access
                    </span>
                  </div>
                </div>
              )}

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

                          {/* Drill / Session Notes Attachment */}
                          {sch.attachment && (
                            <div className="mt-2.5 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-[#172B5015] shadow-2xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-[#F4510B] shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[11px] font-black text-[#172B50] truncate">{sch.attachment.name}</p>
                                  <p className="text-[9.5px] text-[#172B50]/60">
                                    {sch.attachment.size ? `${(sch.attachment.size / 1024).toFixed(1)} KB` : 'Drill Document'}
                                  </p>
                                </div>
                              </div>
                              {sch.attachment.dataUrl && (
                                <a
                                  href={sch.attachment.dataUrl}
                                  download={sch.attachment.name}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-[#FFF5ED] text-[#F4510B] hover:bg-[#F4510B] hover:text-white transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </a>
                              )}
                            </div>
                          )}

                          {/* Cancellation Note if cancelled */}
                          {isCancelled && sch.cancellationReason && (
                            <p className="mt-2 text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg font-bold">
                              Cancellation Reason: {sch.cancellationReason}
                            </p>
                          )}

                          {/* Emergency Cover Badge & Details */}
                          {sch.replacement && sch.replacement.status === 'Active' && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-[#F4510B]" />
                                  <span>Emergency Cover Assignment</span>
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase bg-[#F4510B] text-white">
                                  Cover Coach
                                </span>
                              </div>
                              <p className="text-[11px] text-[#172B50]/80">
                                Original Coach: <strong>{sch.coachName}</strong>
                              </p>
                              <p className="text-[10.5px] text-[#172B50]/90 italic">
                                Reason: "{sch.replacement.reason}"
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Bar for Coach */}
                        <div className="mt-4 pt-3 border-t border-[#172B5010] flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-gray-400">{sch.id}</span>

                          <div className="flex items-center gap-2">
                            {!isCancelled && !isCompleted && (
                              <button
                                type="button"
                                onClick={() => handleOpenCompleteModal(sch)}
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
                                  if (sch.location) setCoachAttLocation(sch.location);
                                  if (sch.batchId || sch.batch) setCoachAttBatchId(sch.batchId || sch.batch);
                                  if (sch.date) setCoachAttDate(sch.date);
                                  setCurrentView('attendance');
                                  addToast(`Opening attendance register for ${sch.batch} (${sch.location})`);
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
                  {myStudents.length > 0 ? Math.round(myStudents.reduce((acc, s) => acc + (s.attendanceRate || 0), 0) / myStudents.length) : 0}%
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
                  {myStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-xs font-semibold text-[#172B50]/55">
                        No athletes currently assigned to Coach {coachProfile.name}
                      </td>
                    </tr>
                  ) : (
                    myStudents
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
                            <span className="font-black text-emerald-700">{s.attendanceRate || 0}%</span>
                            <div className="w-16 h-1.5 bg-[#172B5010] rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${s.attendanceRate || 0}%` }} />
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. ATTENDANCE & LEAVE (LOCATION & ASSIGNED BATCH SCOPED) */}
      {(currentView === 'attendance' || currentView === 'attendance_leave' || currentView === 'leaves' || currentView === 'leave_requests') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#172B5015]">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Attendance &amp; Leave
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Mark student session attendance, review coach attendance logs, and manage your leave requests.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLeaveOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F4510B] text-white text-xs font-black shadow-xs hover:brightness-110 cursor-pointer self-start sm:self-auto transition-all"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          </div>

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
              Leave Requests{(data.coachLeaveRequests || []).filter(r => r.coachId === coachProfile?.id && r.status === 'Pending').length > 0 ? ` (${(data.coachLeaveRequests || []).filter(r => r.coachId === coachProfile?.id && r.status === 'Pending').length})` : ''}
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
          ) : coachAttSubView === 'my_leaves' ? (
            <CoachLeaveRequestsManager mode="coach" coachProfile={coachProfile} />
          ) : (
            <CoachAttendanceRegister 
              currentPortal="coach" 
              defaultCoachId={coachProfile?.id}
              allowedCoaches={[coachProfile]} 
            />
          )}
        </div>
      )}

      {/* 5. EVALUATIONS (CONSOLIDATED: PENDING, HISTORY, RETURNED) */}
      {(currentView === 'child_evaluations' || currentView === 'evaluations' || currentView === 'evaluation_history' || currentView === 'returned_evaluations') && (
        <ChildEvaluationModule 
          initialTab={
            currentView === 'evaluation_history' 
              ? 'history' 
              : currentView === 'returned_evaluations' 
                ? 'returned' 
                : 'evaluating'
          } 
        />
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

      {/* 9. MY WORKSPACE (Profile, Credentials, Circulars & Leave Management) */}
      {(currentView === 'workspace' || currentView === 'profile' || currentView === 'announcements' || currentView === 'performance') && (
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
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
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
                  {(coachProfile.name || 'C').charAt(0)}
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
                <h4 className="font-black text-[#172B50]">Leave Overview</h4>
                <span className="text-xs text-[#F4510B] font-bold">
                  {(data.coachLeaveRequests || []).filter(r => r.coachId === coachProfile.id && (r.status === 'Pending Super Coach Review' || r.status === 'Pending Admin Final Approval')).length} Pending
                </span>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {(data.coachLeaveRequests || []).filter(r => r.coachId === coachProfile.id).slice(0, 2).map((lr) => (
                  <div key={lr.id} className="p-2.5 bg-[#FFF4E8] rounded-xl border border-[#172B5015]">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-[#172B50] truncate max-w-[140px]">{lr.reason || lr.leaveType}</span>
                      <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#172B50] text-white whitespace-nowrap">
                        {lr.status}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-[#172B50] opacity-75 mt-0.5">{lr.startDate} to {lr.endDate}</p>
                  </div>
                ))}
                {(data.coachLeaveRequests || []).filter(r => r.coachId === coachProfile.id).length === 0 && (
                  <p className="text-slate-400 text-center py-4">No leave requests logged</p>
                )}
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

          {/* Embedded Leave Applications Register */}
          <div className="pt-2">
            <CoachLeaveRequestsManager mode="coach" coachProfile={coachProfile} />
          </div>
        </div>
      )}

      {/* 10. LEAVE REQUESTS DEDICATED VIEW */}
      {(currentView === 'leaves' || currentView === 'leave_requests') && (
        <CoachLeaveRequestsManager mode="coach" coachProfile={coachProfile} />
      )}

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isLeaveOpen}
        onClose={() => setIsLeaveOpen(false)}
        title="Apply Coach Leave"
        subtitle="Request planned leave for Super Coach & Admin sequential review"
      >
        <form onSubmit={handleApplyCoachLeave} className="space-y-3.5 text-xs">
          {/* Status notice */}
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
            <span className="font-bold block">Approval Process:</span>
            On submission, status will be <strong>"Pending Super Coach Review"</strong>. Once recommended by Super Coach, it moves to <strong>"Pending Admin Final Approval"</strong>.
          </div>

          {/* Leave Type */}
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Leave Type *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLeaveType('Full Day')}
                className={`py-1.5 px-3 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                  leaveType === 'Full Day'
                    ? 'bg-[#172B50] text-white border-[#172B50]'
                    : 'bg-white text-[#172B50] border-[#172B5020]'
                }`}
              >
                Full Day Leave
              </button>
              <button
                type="button"
                onClick={() => setLeaveType('Half Day')}
                className={`py-1.5 px-3 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                  leaveType === 'Half Day'
                    ? 'bg-[#172B50] text-white border-[#172B50]'
                    : 'bg-white text-[#172B50] border-[#172B5020]'
                }`}
              >
                Half Day Leave
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">From Date *</label>
              <input
                type="date"
                required
                value={leaveStart}
                onChange={(e) => {
                  setLeaveStart(e.target.value);
                  if (leaveType === 'Half Day' || leaveEnd < e.target.value) {
                    setLeaveEnd(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">
                {leaveType === 'Half Day' ? 'Date (Half Day)' : 'To Date *'}
              </label>
              <input
                type="date"
                required
                disabled={leaveType === 'Half Day'}
                value={leaveType === 'Half Day' ? leaveStart : leaveEnd}
                min={leaveStart}
                onChange={(e) => setLeaveEnd(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none disabled:opacity-60 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Reason for Leave *</label>
            <textarea
              rows="3"
              required
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="State the reason for taking leave (e.g. medical appointment, tournament travel, family emergency)..."
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Optional Attachment Name</label>
            <input
              type="text"
              value={leaveAttachment}
              onChange={(e) => setLeaveAttachment(e.target.value)}
              placeholder="e.g. Medical_Certificate.pdf"
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsLeaveOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 cursor-pointer"
            >
              Submit Leave Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Complete Session Modal with Highlights */}
      {completeModalSchedule && (
        <Modal
          isOpen={!!completeModalSchedule}
          onClose={() => setCompleteModalSchedule(null)}
          title="Complete Session & Record Highlights"
          subtitle={`Batch: ${completeModalSchedule.batch || completeModalSchedule.className} • ${completeModalSchedule.location}`}
        >
          <form onSubmit={handleConfirmCompleteSchedule} className="space-y-4 text-xs font-sans">
            <div className="bg-[#FFF4E8] border border-[#F4510B]/20 rounded-xl p-3 text-[#172B50]">
              <div className="font-bold text-xs text-[#F4510B]">Parent Portal Integration</div>
              <p className="text-[11px] text-[#172B50]/80 mt-0.5">
                Marking this session completed moves it to the parents&apos; <strong>Last Session Highlights</strong> section and advances the next scheduled session to <strong>Upcoming Session</strong>.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">
                Coach Highlights &amp; Key Takeaways <span className="text-emerald-600 font-bold">(Displayed in Parent Portal)</span>
              </label>
              <textarea
                rows={3}
                value={completeHighlights}
                onChange={(e) => setCompleteHighlights(e.target.value)}
                placeholder="e.g. Mastered single-leg balance and obstacle course! Great agility and patience during drills."
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] rounded-xl border border-[#172B50]/20 focus:outline-none focus:border-[#F4510B]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">
                Internal Session Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
                placeholder="Internal notes for coaches and faculty..."
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] rounded-xl border border-[#172B50]/20 focus:outline-none focus:border-[#F4510B]"
              />
            </div>

            <div className="pt-3 border-t border-[#172B50]/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCompleteModalSchedule(null)}
                className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm &amp; Complete Session</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
