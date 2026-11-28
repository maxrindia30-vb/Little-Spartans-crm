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
  Play,
  Camera,
  Shuffle,
  Zap,
  Dumbbell,
  Package,
  AlertTriangle
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import {
  ATTENDANCE_STATUSES,
  getCoachAssignedBatches,
  filterStudentsForAttendance,
  getSavedAttendanceRecord,
} from '../../services/attendanceService';
import { COACH_ATTENDANCE_STATUS } from '../../services/coachAttendanceService';
import CameraCaptureModal from '../../components/common/CameraCaptureModal';
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
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraActionType, setCameraActionType] = useState('checkin'); // 'checkin' | 'checkout'

  // Live ticking interval every second
  useEffect(() => {
    if (isTimerPaused || isShiftCompletedState) return;
    const interval = setInterval(() => {
      setTimerNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused, isShiftCompletedState]);

  // Is coach checked in or completed
  const isCoachActuallyCheckedIn = Boolean(
    todayCoachAttendance &&
      (todayCoachAttendance.status === 'checked_in' ||
        todayCoachAttendance.status === 'Checked In' ||
        todayCoachAttendance.status === COACH_ATTENDANCE_STATUS.CHECKED_IN)
  );

  const isCoachActuallyCompleted = Boolean(
    isShiftCompletedState ||
      (todayCoachAttendance &&
        (todayCoachAttendance.status === 'completed' ||
          todayCoachAttendance.status === 'Completed' ||
          todayCoachAttendance.status === COACH_ATTENDANCE_STATUS.COMPLETED))
  );

  // Check-in time display
  const displayCheckInTime = useMemo(() => {
    if (todayCoachAttendance?.checkInTime) {
      return todayCoachAttendance.checkInTime;
    }
    if (isCoachActuallyCheckedIn) {
      return '10:39 AM';
    }
    return '--:--';
  }, [todayCoachAttendance, isCoachActuallyCheckedIn]);

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

    if (!isCoachActuallyCheckedIn) {
      return { durationHHMM: '00:00', durationSS: ':00' };
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
    isCoachActuallyCompleted,
    isCoachActuallyCheckedIn
  ]);

  // Pause / Resume handler
  const handleToggleTimerPause = () => {
    if (!isCoachActuallyCheckedIn) {
      addToast('Please complete camera check-in first to start tracking work duration.', 'warning');
      return;
    }
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

  // Camera capture confirmed handler (handles Check-In, Check-Out, and Admin Exceptions)
  const handleCameraCaptureConfirm = ({ photo, isException, exceptionReason, exceptionApprovedBy, exceptionNotes }) => {
    if (cameraActionType === 'checkin') {
      const res = checkInCoach({
        coachId: coachProfile.id,
        coachName: coachProfile.name,
        location: coachProfile.center || 'KK NAGAR',
        photo,
        isException,
        exceptionReason,
        exceptionApprovedBy,
        exceptionNotes,
        timestamp: new Date().toISOString(),
      });
      if (res && res.success) {
        setCameraModalOpen(false);
        setIsTimerPaused(false);
        setPausedAccumulatedSeconds(0);
      }
    } else {
      const res = checkOutCoach({
        coachId: coachProfile.id,
        location: todayCoachAttendance?.locationName || coachProfile.center || 'KK NAGAR',
        photo,
        isException,
        exceptionReason,
        exceptionApprovedBy,
        exceptionNotes,
        timestamp: new Date().toISOString(),
      });
      if (res && res.success) {
        setCameraModalOpen(false);
        setIsShiftCompletedState(true);
        setIsTimerPaused(true);
      }
    }
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

  // Coaching Performance period dropdown & metrics
  const [selectedPerfPeriod, setSelectedPerfPeriod] = useState('This Month');
  const [perfMonthDropdownOpen, setPerfMonthDropdownOpen] = useState(false);
  const [timeTrackerInfoOpen, setTimeTrackerInfoOpen] = useState(false);

  const perfMetrics = useMemo(() => {
    if (selectedPerfPeriod === 'Last Month') {
      return [
        { label: 'Attendance', value: 92, icon: <CalendarDays className="w-3.5 h-3.5 text-[#16A34A]" /> },
        { label: 'Session Completion', value: 88, icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> },
        { label: 'Evaluation Submission', value: 90, icon: <ClipboardCheck className="w-3.5 h-3.5 text-[#16A34A]" /> },
        { label: 'Athlete Progress', value: 89, icon: <Award className="w-3.5 h-3.5 text-[#16A34A]" /> },
      ];
    }
    if (selectedPerfPeriod === 'This Quarter') {
      return [
        { label: 'Attendance', value: 95, icon: <CalendarDays className="w-3.5 h-3.5 text-[#16A34A]" /> },
        { label: 'Session Completion', value: 93, icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> },
        { label: 'Evaluation Submission', value: 94, icon: <ClipboardCheck className="w-3.5 h-3.5 text-[#16A34A]" /> },
        { label: 'Athlete Progress', value: 92, icon: <Award className="w-3.5 h-3.5 text-[#16A34A]" /> },
      ];
    }
    return [
      { label: 'Attendance', value: 94, icon: <CalendarDays className="w-3.5 h-3.5 text-[#16A34A]" /> },
      { label: 'Session Completion', value: 90, icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> },
      { label: 'Evaluation Submission', value: 92, icon: <ClipboardCheck className="w-3.5 h-3.5 text-[#16A34A]" /> },
      { label: 'Athlete Progress', value: 91, icon: <Award className="w-3.5 h-3.5 text-[#16A34A]" /> },
    ];
  }, [selectedPerfPeriod]);

  const overallPerfPct = useMemo(() => {
    const sum = perfMetrics.reduce((acc, m) => acc + m.value, 0);
    return Math.round(sum / perfMetrics.length);
  }, [perfMetrics]);

  // Today's training schedule timeline items
  const todayTrainingSessions = useMemo(() => {
    if (mySchedules && mySchedules.length > 0) {
      return mySchedules.slice(0, 3).map((s, idx) => {
        const sportLower = (s.program || s.sport || s.className || '').toLowerCase();
        let icon = '⚽';
        if (sportLower.includes('football') || sportLower.includes('soccer')) icon = '⚽';
        else if (sportLower.includes('multi') || sportLower.includes('athletic') || sportLower.includes('run')) icon = '🏃';
        else if (sportLower.includes('skill') || sportLower.includes('strength') || sportLower.includes('fit') || sportLower.includes('gym')) icon = '🏋️';
        else if (sportLower.includes('basket')) icon = '🏀';
        else if (sportLower.includes('swim')) icon = '🏊';
        else if (idx === 0) icon = '⚽';
        else if (idx === 1) icon = '🏃';
        else icon = '🏋️';

        const startTime = s.startTime || (idx === 0 ? '4:00 PM' : idx === 1 ? '5:15 PM' : '6:30 PM');
        const endTime = s.endTime || (idx === 0 ? '5:00 PM' : idx === 1 ? '6:15 PM' : '7:30 PM');
        const timeStr = `${startTime} – ${endTime}`;
        const batchTitle = `${s.batch || s.name || `B${idx + 1}`} – ${s.program || s.className || 'Training Session'}`;
        const location = s.location || coachProfile.center || 'KK Nagar';

        return {
          id: s.id || `session-${idx}`,
          icon,
          time: timeStr,
          title: batchTitle,
          location,
        };
      });
    }

    return [
      {
        id: 'sched-ref-1',
        icon: '⚽',
        time: '4:00 PM – 5:00 PM',
        title: 'B1 – Football Training',
        location: coachProfile.center || 'KK Nagar',
      },
      {
        id: 'sched-ref-2',
        icon: '🏃',
        time: '5:15 PM – 6:15 PM',
        title: 'B2 – Multi-Sport',
        location: coachProfile.center || 'KK Nagar',
      },
      {
        id: 'sched-ref-3',
        icon: '🏋️',
        time: '6:30 PM – 7:30 PM',
        title: 'B1 – Skill Development',
        location: coachProfile.center || 'KK Nagar',
      },
    ];
  }, [mySchedules, coachProfile.center]);

  return (
    <div className="space-y-6">
      
      {/* 1. COACH DASHBOARD */}
      {currentView === 'dashboard' && (
        <div className="space-y-4 sm:space-y-5 animate-slide-up pb-6">
          
          {/* ============================================================ */}
          {/* TOP HEADER: Good Morning, Coach! & Action Icons             */}
          {/* ============================================================ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pt-0.5">
            <div className="text-left space-y-0.5">
              <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-black text-[#172B50] tracking-tight flex items-center gap-2">
                <span>Good Morning, Coach {coachFirstName ? coachFirstName.charAt(0).toUpperCase() + coachFirstName.slice(1) : 'Coach'}!</span>
                <span className="inline-block transform origin-bottom hover:rotate-12 transition-transform cursor-default select-none">👋</span>
              </h1>
              <p className="text-xs sm:text-[13px] font-bold text-[#172B50]/65 tracking-tight text-left">
                Dashboard &bull; Little Spartans ZenConnect
              </p>
            </div>

            {/* Right: Quick Action Round Buttons */}
            <div className="flex items-center gap-2 sm:gap-2.5 self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => addToast('Search my assigned athletes')}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer"
                title="Search Athletes"
              >
                <Search className="w-3.5 h-3.5 text-[#172B50]" />
              </button>

              <button
                type="button"
                onClick={() => addToast('No unread coach notices')}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer relative"
                title="Notifications"
              >
                <Bell className="w-3.5 h-3.5 text-[#172B50]" />
                <span className="w-2 h-2 rounded-full bg-[#F4510B] absolute top-1.5 right-1.5 ring-1 ring-white" />
              </button>

              <div 
                onClick={() => setCurrentView('workspace')}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full ring-2 ring-white shadow-2xs overflow-hidden cursor-pointer hover:ring-[#F4510B] transition-all" 
                title="Coach Workspace & Profile"
              >
                <img
                  src={coachProfile.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"}
                  alt="Coach"
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsLeaveOpen(true)}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer"
                title="Apply Leave"
              >
                <CalendarOff className="w-3.5 h-3.5 text-[#172B50]" />
              </button>

              <LiveCalendarButton 
                classes={mySchedules} 
                onViewSchedule={() => setCurrentView('classes')} 
              />
            </div>
          </div>

          {/* ============================================================ */}
          {/* A. TOP KPI CARDS: 4 IN A SINGLE HORIZONTAL ROW              */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
            
            {/* 1. Schedules */}
            <div 
              onClick={() => setCurrentView('classes')}
              className="relative overflow-hidden bg-[#F0F7FF] border border-[#DCEBFE] rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 shadow-[0_4px_16px_rgba(2,132,199,0.04)] hover:shadow-[0_6px_20px_rgba(2,132,199,0.08)] transition-all cursor-pointer group flex items-center gap-3"
            >
              <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-[#BAE6FD]/40 blur-lg pointer-events-none" />
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 text-[#0284C7] shadow-2xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <CalendarDays className="w-4.5 h-4.5 text-[#0284C7]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] sm:text-[12.5px] font-extrabold text-[#172B50] leading-tight">
                  Schedules
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight">
                    {mySchedules.length || 6}
                  </span>
                  <span className="text-[10.5px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <span>&uarr;</span> Today
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Athletes */}
            <div 
              onClick={() => setCurrentView('students')}
              className="relative overflow-hidden bg-[#FAF5FF] border border-[#F3E8FF] rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 shadow-[0_4px_16px_rgba(147,51,234,0.04)] hover:shadow-[0_6px_20px_rgba(147,51,234,0.08)] transition-all cursor-pointer group flex items-center gap-3"
            >
              <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-[#E9D5FF]/40 blur-lg pointer-events-none" />
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 text-[#9333EA] shadow-2xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-4.5 h-4.5 text-[#9333EA]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] sm:text-[12.5px] font-extrabold text-[#172B50] leading-tight">
                  Athletes
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight">
                    {myStudents.length || 28}
                  </span>
                  <span className="text-[10.5px] font-bold text-[#172B50]/60">
                    Assigned
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Makeups */}
            <div 
              onClick={() => setCurrentView('compensation')}
              className="relative overflow-hidden bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 shadow-[0_4px_16px_rgba(22,163,74,0.04)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.08)] transition-all cursor-pointer group flex items-center gap-3"
            >
              <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-[#BBF7D0]/40 blur-lg pointer-events-none" />
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 text-[#16A34A] shadow-2xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Shuffle className="w-4.5 h-4.5 text-[#16A34A]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] sm:text-[12.5px] font-extrabold text-[#172B50] leading-tight">
                  Makeups
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight">
                    {totalCompSlotCount || 2}
                  </span>
                  <span className="text-[10.5px] font-bold text-[#172B50]/60">
                    Pending
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Rating */}
            <div 
              onClick={() => setCurrentView('evaluations')}
              className="relative overflow-hidden bg-[#FFF9F5] border border-[#FFE8D9] rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 shadow-[0_4px_16px_rgba(244,81,11,0.04)] hover:shadow-[0_6px_20px_rgba(244,81,11,0.08)] transition-all cursor-pointer group flex items-center gap-3"
            >
              <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-[#FED7AA]/40 blur-lg pointer-events-none" />
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 text-[#F4510B] shadow-2xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Star className="w-4.5 h-4.5 text-[#F4510B] fill-[#F4510B]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] sm:text-[12.5px] font-extrabold text-[#172B50] leading-tight">
                  Rating
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight">
                    {coachProfile.rating || '5.0'}
                  </span>
                  <Star className="w-3.5 h-3.5 text-[#F4510B] fill-[#F4510B] shrink-0" />
                  <span className="text-[10.5px] font-bold text-[#172B50]/60 ml-0.5">
                    Coach Score
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* B, C, D. MAIN SECTION: 3-COLUMN LAYOUT                       */}
          {/* Time Tracker | Today's Training Schedule | Coaching Performance */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 items-stretch">
            
            {/* ------------------------------------------------------------ */}
            {/* 1. TIME TRACKER CARD                                         */}
            {/* ------------------------------------------------------------ */}
            <div className="w-full bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-4 border border-[#172B5014] shadow-[0_4px_20px_rgba(23,43,80,0.03)] flex flex-col justify-between h-full">
              
              {/* Header */}
              <div>
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#FFF5ED] flex items-center justify-center shrink-0">
                      <Timer className="w-4 h-4 text-[#F4510B]" />
                    </div>
                    <h2 className="text-sm sm:text-[15px] font-black text-[#172B50] tracking-tight">
                      Time Tracker
                    </h2>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setTimeTrackerInfoOpen(!timeTrackerInfoOpen)}
                      className="w-6.5 h-6.5 rounded-full bg-[#F8FAFC] border border-[#172B5012] hover:bg-[#FFF5ED] flex items-center justify-center text-[#172B50]/60 hover:text-[#F4510B] transition-all cursor-pointer"
                      title="Attendance Information"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    {timeTrackerInfoOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 p-2.5 bg-white border border-[#172B5015] shadow-lg rounded-2xl text-[10.5px] text-[#172B50] z-30 font-medium">
                        <p className="font-bold text-[#F4510B] mb-1">Time Tracker Guide</p>
                        <p>Camera verification is required on Check In and Check Out. Status: <strong className="font-bold">{isCoachActuallyCheckedIn ? `Checked in at ${displayCheckInTime}` : 'Not checked in'}</strong>.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Large Circular Progress / Timer Ring */}
              <div className="flex-1 flex items-center justify-center py-2 sm:py-2.5 my-auto">
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="74"
                      fill="none"
                      stroke="#F1F5F9"
                      strokeWidth="11"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="74"
                      fill="none"
                      stroke="#00D09C"
                      strokeWidth="11"
                      strokeLinecap="round"
                      strokeDasharray="465"
                      strokeDashoffset={isCoachActuallyCheckedIn ? "115" : "350"}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>

                  {/* Digital Timer & Status in Center */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
                    <div className="flex items-baseline font-black tracking-tight text-xl sm:text-2xl font-mono">
                      <span className="text-[#172B50]">{durationHHMM}</span>
                      <span className="text-[#00D09C]">{durationSS}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-2 h-2 rounded-full ${
                        isShiftCompletedState || isCoachActuallyCompleted
                           ? 'bg-[#00D09C]'
                           : isCoachActuallyCheckedIn
                           ? 'bg-[#00D09C] animate-pulse'
                           : 'bg-slate-300'
                      }`} />
                      <span className="text-[11px] sm:text-xs font-bold text-[#172B50]/70">
                        {isShiftCompletedState || isCoachActuallyCompleted
                          ? 'Shift Completed'
                          : isCoachActuallyCheckedIn
                          ? 'Work Time'
                          : 'Work Time'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Check In & Check Out Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCameraActionType('checkin');
                    setCameraModalOpen(true);
                  }}
                  disabled={isCoachActuallyCheckedIn || isShiftCompletedState || isCoachActuallyCompleted}
                  className={`h-9 sm:h-9.5 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    !isCoachActuallyCheckedIn
                      ? 'bg-[#F4510B] hover:bg-[#d94406] text-white active:scale-98'
                      : 'bg-[#F4510B]/40 text-white cursor-not-allowed opacity-70'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                  <span>Check In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isCoachActuallyCheckedIn) {
                      addToast('Please complete Check-In first before Checking Out.', 'warning');
                      return;
                    }
                    setCameraActionType('checkout');
                    setCameraModalOpen(true);
                  }}
                  disabled={!isCoachActuallyCheckedIn || isShiftCompletedState || isCoachActuallyCompleted}
                  className={`h-9 sm:h-9.5 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isCoachActuallyCheckedIn && !isShiftCompletedState && !isCoachActuallyCompleted
                      ? 'bg-white hover:bg-[#F8FAFC] text-[#172B50] border border-[#172B5020] shadow-2xs active:scale-98'
                      : isShiftCompletedState || isCoachActuallyCompleted
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-white text-[#172B50]/40 border border-[#172B5014] cursor-not-allowed'
                  }`}
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Check Out</span>
                </button>
              </div>

            </div>

            {/* ------------------------------------------------------------ */}
            {/* 2. TODAY'S TRAINING SCHEDULE CARD                            */}
            {/* ------------------------------------------------------------ */}
            <div className="w-full bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-4 border border-[#172B5014] shadow-[0_4px_20px_rgba(23,43,80,0.03)] flex flex-col justify-between h-full">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#172B500C]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF5ED] flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-[#F4510B]" />
                  </div>
                  <h2 className="text-sm sm:text-[15px] font-black text-[#172B50] tracking-tight">
                    Today's Training Schedule
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentView('classes')}
                  className="text-xs font-bold text-[#F4510B] hover:text-[#d44105] flex items-center gap-1 group cursor-pointer transition-colors"
                >
                  <span>View Full Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Timeline List of Sessions */}
              <div className="flex-1 py-2 flex flex-col justify-around min-h-[175px] sm:min-h-[190px]">
                {todayTrainingSessions.map((session, idx) => (
                  <div key={session.id || idx} className="relative flex items-center gap-2.5 py-1">
                    
                    {/* Vertical Connecting Line */}
                    {idx < todayTrainingSessions.length - 1 && (
                      <div className="absolute left-[3.5px] top-[14px] bottom-[-14px] w-0.5 bg-[#F4510B]/30" />
                    )}
                    
                    {/* Timeline Dot */}
                    <div className="w-2 h-2 rounded-full bg-[#F4510B] shrink-0 ring-3 ring-[#FFF5ED] z-10" />

                    {/* Sport Icon Pill */}
                    <div className="w-7 h-7 rounded-full bg-[#F8FAFC] border border-[#172B5012] flex items-center justify-center shrink-0 text-sm shadow-2xs">
                      {session.icon}
                    </div>

                    {/* Time & Title */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[10.5px] sm:text-[11px] font-bold text-[#172B50]/65 leading-tight">
                        {session.time}
                      </p>
                      <p className="text-[11.5px] sm:text-[12px] font-extrabold text-[#172B50] leading-tight mt-0.5">
                        {session.title}
                      </p>
                    </div>

                    {/* Location Badge (Cream Pill) */}
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF5ED] text-[#172B50] border border-[#F4510B18]">
                      {session.location}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom Subtle Note */}
              <div className="pt-2 border-t border-[#172B500C] flex items-center justify-between text-[10.5px] text-[#172B50]/60">
                <span>{todayTrainingSessions.length} assigned session(s) today</span>
                <span className="font-bold text-[#F4510B]">Live Synchronized</span>
              </div>

            </div>

            {/* ------------------------------------------------------------ */}
            {/* 3. COACHING PERFORMANCE CARD                                 */}
            {/* ------------------------------------------------------------ */}
            <div className="w-full bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-4 border border-[#172B5014] shadow-[0_4px_20px_rgba(23,43,80,0.03)] flex flex-col justify-between h-full">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-[#172B500C]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF5ED] flex items-center justify-center shrink-0">
                    <BarChart2 className="w-4 h-4 text-[#F4510B]" />
                  </div>
                  <h2 className="text-sm sm:text-[15px] font-black text-[#172B50] tracking-tight">
                    Coaching Performance
                  </h2>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPerfMonthDropdownOpen(!perfMonthDropdownOpen)}
                    className="px-2 py-0.5 rounded-full bg-white border border-[#172B5018] text-[11px] font-bold text-[#172B50] flex items-center gap-1 shadow-2xs cursor-pointer hover:border-[#172B5035]"
                  >
                    <span>{selectedPerfPeriod}</span>
                    <ChevronDown className="w-3 h-3 text-[#172B50]/60" />
                  </button>
                  {perfMonthDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-[#172B5014] p-1 z-30 min-w-[110px]">
                      {['This Month', 'Last Month', 'This Quarter'].map(period => (
                        <button
                          key={period}
                          type="button"
                          onClick={() => {
                            setSelectedPerfPeriod(period);
                            setPerfMonthDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1 text-xs font-bold text-[#172B50] hover:bg-[#FFF5ED] rounded-lg transition-colors cursor-pointer"
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Content: Left Semi-Circular Gauge & Right 4 Metric Rows */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center py-1.5">
                
                {/* Left: Semi-circular Gauge (5 cols) */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center">
                  <div className="relative w-30 h-16 sm:w-34 sm:h-18 flex items-center justify-center">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 160 90">
                      <path
                        d="M 15 80 A 65 65 0 0 1 145 80"
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="13"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 15 80 A 65 65 0 0 1 145 80"
                        fill="none"
                        stroke="#00D09C"
                        strokeWidth="13"
                        strokeLinecap="round"
                        strokeDasharray="204"
                        strokeDashoffset={204 - (204 * (overallPerfPct / 100))}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    <div className="absolute bottom-0 inset-x-0 flex flex-col items-center justify-center pointer-events-none select-none">
                      <span className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight">
                        {overallPerfPct}%
                      </span>
                    </div>
                  </div>
                  <span className="text-[10.5px] font-bold text-[#172B50]/65 text-center mt-1">
                    Overall Performance
                  </span>
                </div>

                {/* Right: 4 Metric Rows (7 cols) */}
                <div className="sm:col-span-7 space-y-1">
                  {perfMetrics.map((metric, idx) => (
                    <div 
                      key={idx}
                      className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-lg px-2 py-1 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-white/90 text-[#16A34A] flex items-center justify-center shrink-0 shadow-2xs">
                          {metric.icon}
                        </div>
                        <span className="text-[10.5px] sm:text-[11px] font-bold text-[#172B50]">
                          {metric.label}
                        </span>
                      </div>
                      <span className="text-[11.5px] sm:text-xs font-black text-[#172B50]">
                        {metric.value}%
                      </span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Bottom Evaluation Link */}
              <div className="pt-1.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-0.5">
                <span className="text-[10px] font-bold text-[#172B50]/60 uppercase tracking-wider">
                  Rubric Assessment
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentView('evaluations')}
                  className="text-[11px] font-bold text-[#F4510B] hover:text-[#d44105] flex items-center gap-1 group cursor-pointer transition-colors"
                >
                  <span>Explore evaluations</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </div>

          </div>

          {/* ============================================================ */}
          {/* E. BOTTOM DASHBOARD CARDS: 4 IN A SINGLE ROW                 */}
          {/* Assigned Batches | Athletes | Upcoming & Alerts | Quick Actions */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 items-stretch">
            
            {/* 1. Assigned Batches */}
            <div 
              onClick={() => {
                setClassesSubView('batches');
                setCurrentView('classes');
              }}
              className="w-full bg-white rounded-[20px] p-3 sm:p-3.5 border border-[#172B5014] shadow-[0_4px_20px_rgba(23,43,80,0.03)] hover:shadow-[0_6px_22px_rgba(23,43,80,0.06)] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-5.5 h-5.5 rounded-md bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0">
                    <Layers className="w-3 h-3 text-[#F4510B]" />
                  </div>
                  <h3 className="text-[13px] sm:text-[13.5px] font-extrabold text-[#172B50] tracking-tight">
                    Assigned Batches
                  </h3>
                </div>
                <p className="text-[10px] font-medium text-[#172B50]/60 pl-7">
                  My active training groups
                </p>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1">
                <div>
                  <span className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight block">
                    {coachAssignedBatches.length || 4}
                  </span>
                  <span className="text-[10.5px] font-bold text-[#172B50]/65 mt-0.5 block">
                    Batches
                  </span>
                </div>

                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FFF5ED] border border-[#F4510B18] shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5 text-[#F4510B]" />
                </div>
              </div>
            </div>

            {/* 2. Athletes */}
            <div 
              onClick={() => setCurrentView('students')}
              className="w-full bg-white rounded-[20px] p-3 sm:p-3.5 border border-[#172B5014] shadow-[0_4px_20px_rgba(23,43,80,0.03)] hover:shadow-[0_6px_22px_rgba(23,43,80,0.06)] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-5.5 h-5.5 rounded-md bg-[#F0F7FF] text-[#0284C7] flex items-center justify-center shrink-0">
                    <Users className="w-3 h-3 text-[#0284C7]" />
                  </div>
                  <h3 className="text-[13px] sm:text-[13.5px] font-extrabold text-[#172B50] tracking-tight">
                    Athletes
                  </h3>
                </div>
                <p className="text-[10px] font-medium text-[#172B50]/60 pl-7">
                  Total assigned athletes
                </p>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1">
                <div>
                  <span className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight block">
                    {myStudents.length || 28}
                  </span>
                  <span className="text-[10.5px] font-bold text-[#172B50]/65 mt-0.5 block">
                    Athletes
                  </span>
                </div>

                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F0F7FF] border border-[#0284C718] shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5 text-[#0284C7]" />
                </div>
              </div>
            </div>

            {/* 3. Upcoming & Alerts */}
            <div className="w-full bg-white rounded-[20px] p-3 sm:p-3.5 border border-[#172B5014] shadow-[0_4px_20px_rgba(23,43,80,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5.5 h-5.5 rounded-md bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0">
                      <Bell className="w-3 h-3 text-[#F4510B]" />
                    </div>
                    <h3 className="text-[13px] sm:text-[13.5px] font-extrabold text-[#172B50] tracking-tight">
                      Upcoming &amp; Alerts
                    </h3>
                  </div>

                  <span className="w-4.5 h-4.5 rounded-full bg-[#F4510B] text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                    2
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 mt-1.5 pt-0.5 flex-1 flex flex-col justify-around">
                {/* Row 1: Upcoming Sessions */}
                <div className="flex items-center justify-between gap-1.5 p-1.5 bg-[#F8FAFC] rounded-lg border border-[#172B500C]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Calendar className="w-3 h-3 text-[#F4510B] shrink-0" />
                    <span className="text-[10.5px] sm:text-[11px] font-bold text-[#172B50] whitespace-nowrap">
                      2 Session(s) tomorrow
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentView('classes')}
                    className="px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-[#FFF5ED] text-[#F4510B] hover:bg-[#F4510B] hover:text-white transition cursor-pointer shrink-0"
                  >
                    View &rarr;
                  </button>
                </div>

                {/* Row 2: Pending Leave Requests */}
                <div className="flex items-center justify-between gap-1.5 p-1.5 bg-[#F8FAFC] rounded-lg border border-[#172B500C]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <AlertTriangle className="w-3 h-3 text-[#F4510B] shrink-0" />
                    <span className="text-[10.5px] sm:text-[11px] font-bold text-[#172B50] whitespace-nowrap">
                      1 Leave request pending
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentView('leaves')}
                    className="px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-[#FFF5ED] text-[#F4510B] hover:bg-[#F4510B] hover:text-white transition cursor-pointer shrink-0"
                  >
                    Review &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Quick Actions */}
            <div className="w-full bg-white rounded-[20px] p-3 sm:p-3.5 border border-[#172B5014] shadow-[0_4px_20px_rgba(23,43,80,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5.5 h-5.5 rounded-md bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0">
                    <Zap className="w-3 h-3 text-[#F4510B]" />
                  </div>
                  <h3 className="text-[13px] sm:text-[13.5px] font-extrabold text-[#172B50] tracking-tight">
                    Quick Actions
                  </h3>
                </div>
              </div>

              {/* 4 Action Tiles Grid */}
              <div className="grid grid-cols-4 gap-1.5 mt-1.5 pt-0.5 flex-1 items-stretch">
                {/* 1. Mark Attendance */}
                <button
                  type="button"
                  onClick={() => setCurrentView('attendance')}
                  className="bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-emerald-100/80 rounded-xl p-1 sm:p-1.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-102 active:scale-98 group min-h-[52px]"
                  title="Mark Attendance"
                >
                  <div className="w-5 h-5 rounded-md bg-white/90 text-[#16A34A] flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                    <ClipboardCheck className="w-3 h-3 text-[#16A34A]" />
                  </div>
                  <span className="text-[9px] sm:text-[9.5px] font-bold text-[#172B50] leading-tight mt-1">
                    Mark Attendance
                  </span>
                </button>

                {/* 2. Session Notes */}
                <button
                  type="button"
                  onClick={() => setCurrentView('classes')}
                  className="bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-purple-100/80 rounded-xl p-1 sm:p-1.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-102 active:scale-98 group min-h-[52px]"
                  title="Session Notes"
                >
                  <div className="w-5 h-5 rounded-md bg-white/90 text-[#9333EA] flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                    <FileText className="w-3 h-3 text-[#9333EA]" />
                  </div>
                  <span className="text-[9px] sm:text-[9.5px] font-bold text-[#172B50] leading-tight mt-1">
                    Session Notes
                  </span>
                </button>

                {/* 3. Apply Leave */}
                <button
                  type="button"
                  onClick={() => setIsLeaveOpen(true)}
                  className="bg-[#F0FFFC] hover:bg-[#E0FDF8] border border-teal-100/80 rounded-xl p-1 sm:p-1.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-102 active:scale-98 group min-h-[52px]"
                  title="Apply Leave"
                >
                  <div className="w-5 h-5 rounded-md bg-white/90 text-[#0D9488] flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                    <UserCheck className="w-3 h-3 text-[#0D9488]" />
                  </div>
                  <span className="text-[9px] sm:text-[9.5px] font-bold text-[#172B50] leading-tight mt-1">
                    Apply Leave
                  </span>
                </button>

                {/* 4. Equipment Check */}
                <button
                  type="button"
                  onClick={() => setCurrentView('equipment')}
                  className="bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-rose-100/80 rounded-xl p-1 sm:p-1.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-102 active:scale-98 group min-h-[52px]"
                  title="Equipment Check"
                >
                  <div className="w-5 h-5 rounded-md bg-white/90 text-[#E11D48] flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                    <Package className="w-3 h-3 text-[#E11D48]" />
                  </div>
                  <span className="text-[9px] sm:text-[9.5px] font-bold text-[#172B50] leading-tight mt-1">
                    Equipment Check
                  </span>
                </button>
              </div>
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

      {/* Live Coach Camera Check-In / Check-Out Verification Modal */}
      <CameraCaptureModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        actionType={cameraActionType}
        title={cameraActionType === 'checkin' ? 'Coach Live Check-In Camera' : 'Coach Live Check-Out Camera'}
        subtitle={
          cameraActionType === 'checkin'
            ? 'Verify attendance and capture check-in snapshot tagged with location & time.'
            : 'Capture shift completion photo to confirm check-out and calculate total duration.'
        }
        location={coachProfile.center || 'KK NAGAR'}
        coachName={coachProfile.name || 'Coach'}
        onCaptureConfirm={handleCameraCaptureConfirm}
      />

    </div>
  );
}
