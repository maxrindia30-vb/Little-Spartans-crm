import React, { useMemo, useState } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  CalendarDays,
  CreditCard, 
  ClipboardCheck, 
  Trophy, 
  CalendarOff, 
  Award, 
  Bell, 
  MessageSquare, 
  UserCheck2,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Plus,
  Download,
  AlertCircle,
  Star,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Check,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import {
  getChildMatchedSchedules,
  mergeScheduleAttendance,
  MON_FIRST_WEEKDAYS,
  formatYmd,
} from '../../services/scheduleService';
import { COMPENSATION_REASONS } from '../../services/compensationService';
import KpiCard from '../../components/common/KpiCard';
import Modal from '../../components/common/Modal';

const COMP_STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-900',
  'Under Review': 'bg-indigo-100 text-indigo-800',
  Approved: 'bg-sky-100 text-sky-800',
  Scheduled: 'bg-blue-100 text-blue-800',
  Completed: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-rose-100 text-rose-800',
  Cancelled: 'bg-slate-200 text-slate-700',
  Expired: 'bg-orange-100 text-orange-800',
};

function getMondayOfWeek(ymd) {
  const d = new Date(`${ymd}T00:00:00`);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export default function ParentPortalView() {
  const { 
    currentView, 
    setCurrentView, 
    data, 
    applyLeave, 
    addFeedback, 
    addPayment, 
    registerCompetition,
    submitCompensationRequest,
    addToast 
  } = useCrm();

  // Current logged in parent profile
  const parentProfile = data.parents[0] || { id: '', name: 'Parent Account', email: '' };
  const myChildren = parentProfile.id
    ? data.students.filter(s => s.parentId === parentProfile.id)
    : [];

  // States for modals
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveChild, setLeaveChild] = useState(myChildren[0]?.name || '');
  const [leaveStart, setLeaveStart] = useState('2026-11-20');
  const [leaveEnd, setLeaveEnd] = useState('2026-11-22');
  const [leaveReason, setLeaveReason] = useState('');

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('4500');
  const [selectedChildForPay, setSelectedChildForPay] = useState(myChildren[0]?.name || '');

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [fbComment, setFbComment] = useState('');
  const [fbRating, setFbRating] = useState('5');

  const todayYmd = formatYmd(new Date());

  // Compensation Request Modal state
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compChildId, setCompChildId] = useState(myChildren[0]?.id || '');
  const [compProgram, setCompProgram] = useState(myChildren[0]?.program || '');
  const [compBatchId, setCompBatchId] = useState('');
  const [missedDate, setMissedDate] = useState(todayYmd);
  const [compMissedSession, setCompMissedSession] = useState('');
  const [compReasonCategory, setCompReasonCategory] = useState(COMPENSATION_REASONS[0]);
  const [compExplanation, setCompExplanation] = useState('');

  // Parent Timetable & Schedule Sync state
  const [selectedScheduleChildId, setSelectedScheduleChildId] = useState('all');
  const [scheduleTab, setScheduleTab] = useState('weekly'); // 'weekly' | 'calendar' | 'upcoming' | 'completed' | 'cancelled'
  const [scheduleFocusDate, setScheduleFocusDate] = useState(todayYmd);

  const openParentCompModal = () => {
    const firstChild = myChildren[0];
    setCompChildId(firstChild?.id || '');
    setCompProgram(firstChild?.program || '');
    const childBatch = (data.classes || []).find(
      c => c.center === firstChild?.center &&
           ((c.enrolledStudentIds || []).includes(firstChild?.id) || c.name === firstChild?.batchName)
    );
    setCompBatchId(childBatch?.id || '');
    setMissedDate(todayYmd);
    setCompMissedSession(childBatch?.name || firstChild?.batchName || firstChild?.program || '');
    setCompReasonCategory(COMPENSATION_REASONS[0]);
    setCompExplanation('');
    setIsCompModalOpen(true);
  };

  const handleCompChildChange = (nextChildId) => {
    setCompChildId(nextChildId);
    const child = myChildren.find(c => c.id === nextChildId);
    if (!child) return;
    setCompProgram(child.program || '');
    const childBatch = (data.classes || []).find(
      c => c.center === child.center &&
           ((c.enrolledStudentIds || []).includes(child.id) || c.name === child.batchName)
    );
    setCompBatchId(childBatch?.id || '');
    setCompMissedSession(childBatch?.name || child.batchName || child.program || '');
  };

  const handleApplyChildLeave = (e) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    applyLeave({
      type: 'Student',
      applicantName: `${leaveChild} (Parent: ${parentProfile.name})`,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason,
      reviewedBy: 'Pending Admin Review'
    });

    setIsLeaveModalOpen(false);
    setLeaveReason('');
  };

  const handlePayTuition = (e) => {
    e.preventDefault();
    const child = myChildren.find(c => c.name === selectedChildForPay) || myChildren[0] || data.students[0];
    if (!child) {
      addToast('No student profile is linked yet.', 'error');
      return;
    }
    addPayment({
      studentId: child.id,
      studentName: child.name,
      parentName: parentProfile.name,
      amount: parseInt(payAmount) || 4500,
      program: child.program,
      billingMonth: 'December 2026',
      paymentMethod: 'UPI Instant Portal'
    });
    setIsPayModalOpen(false);
  };

  const handleSendFeedback = (e) => {
    e.preventDefault();
    if (!fbComment.trim()) return;
    addFeedback({
      parentName: parentProfile.name,
      studentName: myChildren[0]?.name || 'Student',
      coachName: myChildren[0]?.coachName || 'Academy Coach',
      rating: parseInt(fbRating) || 5,
      category: 'Parent Review',
      comment: fbComment,
      program: myChildren[0]?.program || data.programs[0]?.name || ''
    });
    setIsFeedbackModalOpen(false);
    setFbComment('');
  };

  const handleSubmitCompensation = (e) => {
    e.preventDefault();
    const child = myChildren.find(c => c.id === compChildId) || myChildren[0];
    if (!child) {
      addToast('No student profile is linked yet.', 'error');
      return;
    }
    const batchObj = (data.classes || []).find(c => c.id === compBatchId);
    const res = submitCompensationRequest({
      requestSource: 'Parent',
      studentId: child.id,
      studentName: child.name,
      parentId: parentProfile.id,
      parentName: parentProfile.name,
      parentEmail: parentProfile.email,
      center: child.center,
      location: child.center,
      program: compProgram || child.program,
      batchId: batchObj?.id || compBatchId || '',
      batchName: batchObj?.name || child.batchName || '',
      missedClass: compMissedSession || batchObj?.name || `${compProgram || child.program} Session`,
      missedDate,
      reasonCategory: compReasonCategory,
      explanation: compExplanation || compReasonCategory,
    });
    if (res?.success) {
      setIsCompModalOpen(false);
      setCompExplanation('');
    }
  };

  // Filter parent's compensation requests, payments, attendance & location-isolated class schedules
  const myChildNames = new Set(myChildren.map(c => c.name));
  const myChildIds = new Set(myChildren.map(c => c.id));
  const parentCompRequests = (data.compensationRequests || []).filter(
    c =>
      (parentProfile.id && c.parentId === parentProfile.id) ||
      (parentProfile.name && c.parentName === parentProfile.name) ||
      myChildNames.has(c.studentName) ||
      myChildIds.has(c.studentId)
  );
  const myPayments = (data.payments || []).filter(
    p => myChildIds.has(p.studentId) || myChildNames.has(p.studentName) || (parentProfile.name && p.parentName === parentProfile.name)
  );
  const myAttendanceRecords = (data.attendanceRecords || []).filter(
    r => myChildIds.has(r.studentId)
  );
  const myAttendanceCount = myAttendanceRecords.length;

  // Synchronized Read-Only Schedule Feed (strictly isolated per child's location, program & batch)
  const synchronizedChildSessions = useMemo(() => {
    const entries = [];
    myChildren.forEach(child => {
      const matched = getChildMatchedSchedules(child, data.classSchedules || [], data.classes || []);
      matched.forEach(sch => {
        entries.push({
          ...sch,
          childId: child.id,
          childName: child.name,
          attendanceStatus: mergeScheduleAttendance(sch, child, data.attendanceRecords || []),
        });
      });
    });
    return entries.sort((a, b) => `${a.date || ''}T${a.startTime || ''}`.localeCompare(`${b.date || ''}T${b.startTime || ''}`));
  }, [myChildren, data.classSchedules, data.classes, data.attendanceRecords]);

  const mySchedulesCount = synchronizedChildSessions.filter(s => s.status !== 'Cancelled').length;
  const upcomingChildSessions = synchronizedChildSessions.filter(
    s => s.status !== 'Cancelled' && s.status !== 'Completed' && (!s.date || s.date >= todayYmd)
  );
  const nextUpcomingSession = upcomingChildSessions[0] || null;

  const visibleChildSessions = useMemo(() => {
    if (selectedScheduleChildId === 'all') return synchronizedChildSessions;
    return synchronizedChildSessions.filter(s => s.childId === selectedScheduleChildId);
  }, [synchronizedChildSessions, selectedScheduleChildId]);

  const activeCompChild = myChildren.find(c => c.id === compChildId) || myChildren[0] || null;
  const compChildBatches = useMemo(() => {
    if (!activeCompChild) return [];
    return (data.classes || []).filter(
      c =>
        c.center === activeCompChild.center &&
        (!compProgram || c.program === compProgram)
    );
  }, [data.classes, activeCompChild, compProgram]);

  const weekDates = useMemo(() => {
    const monday = getMondayOfWeek(scheduleFocusDate);
    return MON_FIRST_WEEKDAYS.map((dayName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return { dayName, ymd: formatYmd(d), dateObj: d };
    });
  }, [scheduleFocusDate]);

  const monthGrid = useMemo(() => {
    const ref = new Date(`${scheduleFocusDate}T00:00:00`);
    const year = ref.getFullYear();
    const month = ref.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(formatYmd(new Date(year, month, day)));
    }
    return {
      label: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      cells,
    };
  }, [scheduleFocusDate]);

  const shiftFocusDate = (days) => {
    const d = new Date(`${scheduleFocusDate}T00:00:00`);
    d.setDate(d.getDate() + days);
    setScheduleFocusDate(formatYmd(d));
  };

  const parentDashboardModules = [
    {
      id: 'children',
      label: 'My Children',
      desc: 'Profiles, academy centres, assigned coaches & ranks',
      stat: `${myChildren.length} Registered`,
      icon: GraduationCap,
    },
    {
      id: 'classes',
      label: 'Classes & Schedule',
      desc: 'Weekly timetables, timings & batch allocations',
      stat: `${mySchedulesCount} Sessions`,
      icon: Calendar,
    },
    {
      id: 'attendance_compensation',
      label: 'Attendance & Compensation',
      desc: 'Daily attendance logs & makeup class requests',
      stat: `${myAttendanceCount} Logs • ${parentCompRequests.length} Requests`,
      icon: ClipboardCheck,
    },
    {
      id: 'fees_payments',
      label: 'Fees & Payments',
      desc: 'Tuition status, fee receipts & instant payment',
      stat: `${myPayments.length} Invoices`,
      icon: CreditCard,
    },
    {
      id: 'progress',
      label: 'Progress & Achievements',
      desc: 'Badges earned, coach ratings & performance milestones',
      stat: `${myChildren.reduce((sum, c) => sum + (c.badges?.length || 0), 0)} Badges`,
      icon: Award,
    },
    {
      id: 'competitions',
      label: 'Sports & Events',
      desc: 'Upcoming academy tournaments & event registrations',
      stat: `${(data.competitions || []).length} Events`,
      icon: Trophy,
    },
    {
      id: 'communication',
      label: 'Communication',
      desc: 'Academy announcements, notices & coach feedback',
      stat: `${(data.announcements || []).length} Notices`,
      icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. PARENT DASHBOARD (Upgraded Brand UI/UX) */}
      {currentView === 'dashboard' && (
        <div className="space-y-6 animate-slide-up">
          {/* Hero Welcome Header */}
          <div className="rounded-3xl bg-gradient-to-br from-[#172B50] via-[#1E3560] to-[#264275] p-6 sm:p-7 text-white shadow-card relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full bg-[#F4510B]/20 blur-2xl pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#F4510B] text-white tracking-wider">
                    Parent Portal
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/90 border border-white/15">
                    {parentProfile.center || myChildren[0]?.center || 'Chennai Academy'} • Term 2026-27
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome, {parentProfile.name}
                </h1>
                <p className="text-xs sm:text-sm text-white/80 mt-1">
                  Track your child&apos;s synchronized class timetables, attendance records, makeup requests &amp; fees at a glance.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={openParentCompModal}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold bg-[#F4510B] text-white rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-white" />
                  <span>Request Compensation</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-white text-[#172B50] rounded-xl shadow-sm hover:bg-[#FFF4E8] active:scale-95 transition-all cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-[#F4510B]" />
                  <span>Pay Fee</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                >
                  <CalendarOff className="w-4 h-4 text-[#FFA366]" />
                  <span>Apply Leave</span>
                </button>
              </div>
            </div>

            {/* Live Next Class Highlight Strip */}
            <div className="mt-5 pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs relative z-10">
              {nextUpcomingSession ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F4510B]/20 border border-[#F4510B]/40 flex items-center justify-center text-[#FFA366] shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#FFA366] block">
                      Next Upcoming Class • {nextUpcomingSession.location}
                    </span>
                    <span className="font-bold text-white">
                      {nextUpcomingSession.childName}: {nextUpcomingSession.className || nextUpcomingSession.batch} ({nextUpcomingSession.date} • {nextUpcomingSession.startTime} - {nextUpcomingSession.endTime}) with Coach {nextUpcomingSession.coachName}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white/80">
                  <Sparkles className="w-4 h-4 text-[#FFA366]" />
                  <span>Your upcoming location-synced sessions published by Admin will appear right here.</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setCurrentView('classes')}
                className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] shrink-0 transition-colors cursor-pointer self-start sm:self-auto"
              >
                Open Class Timetable &rarr;
              </button>
            </div>
          </div>

          {/* Summary KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#172B5018] shadow-card">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#172B50]/65 block">Registered Children</span>
              <div className="flex items-end justify-between mt-1">
                <h3 className="text-2xl sm:text-3xl font-black text-[#172B50]">{myChildren.length}</h3>
                <GraduationCap className="w-5 h-5 text-[#F4510B]" />
              </div>
              <p className="text-[11px] font-semibold text-[#172B50]/65 mt-1">{parentProfile.center || 'Active Academy'}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#172B5018] shadow-card">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#172B50]/65 block">Upcoming Classes</span>
              <div className="flex items-end justify-between mt-1">
                <h3 className="text-2xl sm:text-3xl font-black text-[#172B50]">{upcomingChildSessions.length}</h3>
                <CalendarDays className="w-5 h-5 text-[#F4510B]" />
              </div>
              <p className="text-[11px] font-semibold text-emerald-700 mt-1">{mySchedulesCount} Total Synced</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#172B5018] shadow-card">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#172B50]/65 block">Attendance Records</span>
              <div className="flex items-end justify-between mt-1">
                <h3 className="text-2xl sm:text-3xl font-black text-[#172B50]">{myAttendanceCount}</h3>
                <ClipboardCheck className="w-5 h-5 text-[#F4510B]" />
              </div>
              <p className="text-[11px] font-semibold text-[#172B50]/65 mt-1">Verified coach check-ins</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#172B5018] shadow-card">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#172B50]/65 block">Compensation Status</span>
              <div className="flex items-end justify-between mt-1">
                <h3 className="text-2xl sm:text-3xl font-black text-[#F4510B]">{parentCompRequests.length}</h3>
                <RefreshCw className="w-5 h-5 text-[#172B50]" />
              </div>
              <p className="text-[11px] font-semibold text-[#172B50]/65 mt-1">
                {parentCompRequests.filter(r => r.status === 'Scheduled').length} Scheduled Makeup(s)
              </p>
            </div>
          </div>

          {/* All Parent Navbar Modules Inside Dashboard */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172B50]">
                Parent Portal Modules
              </h2>
              <span className="text-xs font-semibold text-[#172B50] opacity-65">
                Quick access to every section
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {parentDashboardModules.map((mod) => {
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

          {/* Children Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myChildren.map(child => (
              <div key={child.id} className="interactive-card bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card group">
                <div className="flex items-start gap-4">
                  <img
                    src={child.avatar}
                    alt={child.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#F4510B] group-hover:scale-105 transition-transform duration-300 shadow-sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-[#172B50] group-hover:text-[#F4510B] transition-colors">
                          {child.name}
                        </h3>
                        <span className="text-xs font-bold text-[#F4510B]">{child.rank}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#172B50] text-white shadow-xs">
                        {child.feeStatus}
                      </span>
                    </div>
                    <p className="text-xs text-[#172B50] opacity-75 mt-1">
                      {child.program} • {child.center}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs">
                      <span className="font-bold text-[#172B50]">Attendance: {child.attendanceRate}%</span>
                      <span className="text-[#172B50] opacity-40">•</span>
                      <span className="font-bold text-[#172B50]">Coach: {child.coachName}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MY CHILDREN */}
      {currentView === 'children' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            My Registered Spartan Children
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myChildren.map(child => (
              <div key={child.id} className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card">
                <div className="flex items-center gap-4 pb-4 border-b border-[#172B5015]">
                  <img src={child.avatar} alt={child.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#F4510B]" />
                  <div>
                    <h3 className="text-lg font-black text-[#172B50]">{child.name}</h3>
                    <p className="text-xs font-bold text-[#F4510B]">{child.rank}</p>
                    <p className="text-xs text-[#172B50] opacity-75">ID: {child.id} • DOB: {child.dob}</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#172B5010]">
                    <span className="text-[#172B50] opacity-70">Program Enrolled:</span>
                    <span className="font-bold text-[#172B50]">{child.program}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#172B5010]">
                    <span className="text-[#172B50] opacity-70">Assigned Head Coach:</span>
                    <span className="font-bold text-[#172B50]">{child.coachName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#172B5010]">
                    <span className="text-[#172B50] opacity-70">Overall Attendance:</span>
                    <span className="font-bold text-[#F4510B]">{child.attendanceRate}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#172B5010]">
                    <span className="text-[#172B50] opacity-70">Tuition Status:</span>
                    <span className="font-bold text-[#172B50]">{child.feeStatus}</span>
                  </div>
                  <div className="p-3 bg-[#FFF4E8] rounded-xl border border-[#172B5015]">
                    <span className="font-bold text-[#172B50] block mb-1">Medical Record Note:</span>
                    <span className="text-[#172B50] opacity-80">{child.medicalNote}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CLASSES & SCHEDULE (Auto-Synchronized Read-Only View by Location, Program & Batch) */}
      {currentView === 'classes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#172B5015]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Live Academy Timetable Sync (Read-Only)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight mt-1">
                Class Timetable &amp; Sessions
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Showing only published classes matching your children&apos;s enrolled location, program, and batch.
              </p>
            </div>

            {myChildren.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-xl border border-[#172B501A]">
                <button
                  type="button"
                  onClick={() => setSelectedScheduleChildId('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    selectedScheduleChildId === 'all' ? 'bg-[#172B50] text-white' : 'text-[#172B50] hover:bg-[#FFF4E8]'
                  }`}
                >
                  All Children ({myChildren.length})
                </button>
                {myChildren.map(child => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => setSelectedScheduleChildId(child.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      selectedScheduleChildId === child.id ? 'bg-[#F4510B] text-white' : 'text-[#172B50] hover:bg-[#FFF4E8]'
                    }`}
                  >
                    {child.name} ({child.center})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Timetable View Switcher + Date Nav */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#172B501A] shadow-card flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'weekly', label: 'Weekly Timetable' },
                { id: 'calendar', label: 'Monthly Calendar' },
                { id: 'upcoming', label: `Upcoming (${visibleChildSessions.filter(s => s.status !== 'Cancelled' && s.status !== 'Completed' && (!s.date || s.date >= todayYmd)).length})` },
                { id: 'completed', label: `Completed (${visibleChildSessions.filter(s => s.status === 'Completed').length})` },
                { id: 'cancelled', label: `Cancelled (${visibleChildSessions.filter(s => s.status === 'Cancelled').length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setScheduleTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    scheduleTab === tab.id
                      ? 'bg-[#F4510B] text-white shadow-xs'
                      : 'text-[#172B50] hover:bg-[#FFF4E8]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {(scheduleTab === 'weekly' || scheduleTab === 'calendar') && (
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => shiftFocusDate(scheduleTab === 'weekly' ? -7 : -30)}
                  className="p-1.5 rounded-lg border border-[#172B5020] hover:bg-[#FFF4E8] text-[#172B50] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-extrabold text-[#172B50] min-w-[140px] text-center">
                  {scheduleTab === 'calendar'
                    ? monthGrid.label
                    : `${weekDates[0].ymd} to ${weekDates[6].ymd}`}
                </span>
                <button
                  type="button"
                  onClick={() => shiftFocusDate(scheduleTab === 'weekly' ? 7 : 30)}
                  className="p-1.5 rounded-lg border border-[#172B5020] hover:bg-[#FFF4E8] text-[#172B50] cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleFocusDate(todayYmd)}
                  className="px-2.5 py-1 rounded-lg bg-[#FFF4E8] text-[#F4510B] font-bold cursor-pointer"
                >
                  Today
                </button>
              </div>
            )}
          </div>

          {/* VIEW 1: WEEKLY TIMETABLE */}
          {scheduleTab === 'weekly' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
              {weekDates.map(col => {
                const daySessions = visibleChildSessions.filter(s => s.date === col.ymd);
                return (
                  <div key={col.ymd} className="bg-white rounded-2xl border border-[#172B501A] shadow-card flex flex-col min-h-[220px]">
                    <div className={`px-3 py-2.5 border-b border-[#172B5012] rounded-t-2xl ${
                      col.ymd === todayYmd ? 'bg-[#172B50] text-white' : 'bg-[#FFF4E8] text-[#172B50]'
                    }`}>
                      <span className="text-[11px] font-black uppercase tracking-wider block">{col.dayName.slice(0, 3)}</span>
                      <span className="text-[11px] opacity-80 font-semibold">{col.ymd}</span>
                    </div>
                    <div className="p-2.5 space-y-2 flex-1">
                      {daySessions.length === 0 ? (
                        <p className="text-[11px] text-[#172B50]/45 text-center py-6">No session</p>
                      ) : (
                        daySessions.map(sch => (
                          <div key={`${sch.id}-${sch.childId}`} className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${
                            sch.status === 'Cancelled'
                              ? 'bg-rose-50 border-rose-200'
                              : sch.isCompensationReplacement
                              ? 'bg-[#FFF4E8] border-[#F4510B]/40'
                              : 'bg-white border-[#172B501A]'
                          }`}>
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-black text-[#F4510B]">{sch.startTime} - {sch.endTime}</span>
                              {sch.isCompensationReplacement && (
                                <span className="px-1.5 py-0.2 rounded bg-[#F4510B] text-white text-[9px] font-bold">Makeup</span>
                              )}
                            </div>
                            <p className="font-extrabold text-[#172B50] leading-tight">{sch.className || sch.batch}</p>
                            <p className="text-[10px] font-semibold text-[#172B50]/75">{sch.childName} • {sch.location}</p>
                            <p className="text-[10px] text-[#172B50]/70">Coach: {sch.coachName}</p>
                            <div className="flex items-center justify-between pt-1">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                sch.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                                sch.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>{sch.status}</span>
                              <span className={`text-[9px] font-bold ${
                                sch.attendanceStatus === 'Present' ? 'text-emerald-700' :
                                sch.attendanceStatus === 'Absent' ? 'text-rose-600' : 'text-[#172B50]/50'
                              }`}>{sch.attendanceStatus}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 2: MONTHLY CALENDAR */}
          {scheduleTab === 'calendar' && (
            <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card p-4">
              <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-extrabold text-[#172B50] pb-2 border-b border-[#172B5012]">
                {MON_FIRST_WEEKDAYS.map(d => <div key={d}>{d.slice(0, 3)}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2 pt-2">
                {monthGrid.cells.map((ymd, idx) => {
                  if (!ymd) return <div key={`empty-${idx}`} className="min-h-[82px] rounded-xl bg-slate-50/50" />;
                  const daySessions = visibleChildSessions.filter(s => s.date === ymd);
                  return (
                    <div key={ymd} className={`min-h-[82px] p-1.5 rounded-xl border text-[10px] ${
                      ymd === todayYmd ? 'border-[#F4510B] bg-[#FFF4E8]/40' : 'border-[#172B5012] bg-white'
                    }`}>
                      <span className="font-extrabold text-[#172B50] block mb-1">{ymd.slice(8)}</span>
                      <div className="space-y-1">
                        {daySessions.slice(0, 2).map(sch => (
                          <div key={`${sch.id}-${sch.childId}`} className={`px-1.5 py-0.5 rounded font-bold truncate ${
                            sch.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                            sch.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-[#172B50] text-white'
                          }`} title={`${sch.childName}: ${sch.className || sch.batch} (${sch.startTime})`}>
                            {sch.startTime} {sch.className || sch.batch}
                          </div>
                        ))}
                        {daySessions.length > 2 && (
                          <span className="text-[9px] font-bold text-[#F4510B]">+{daySessions.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3/4/5: UPCOMING / COMPLETED / CANCELLED LIST */}
          {(scheduleTab === 'upcoming' || scheduleTab === 'completed' || scheduleTab === 'cancelled') && (() => {
            const list = visibleChildSessions.filter(s => {
              if (scheduleTab === 'completed') return s.status === 'Completed';
              if (scheduleTab === 'cancelled') return s.status === 'Cancelled';
              return s.status !== 'Cancelled' && s.status !== 'Completed' && (!s.date || s.date >= todayYmd);
            });
            return list.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-[#172B501A] shadow-card text-xs text-[#172B50]/70">
                No {scheduleTab} class sessions found for your children&apos;s enrolled location and batch.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.map(sch => (
                  <div key={`${sch.id}-${sch.childId}`} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#172B50] text-white">
                            {sch.childName}
                          </span>
                          <span className="text-[10px] font-bold uppercase text-[#F4510B]">{sch.program}</span>
                          {sch.isCompensationReplacement && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#F4510B] text-white">
                              Replacement Class
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-extrabold text-[#172B50] mt-1.5">{sch.className || sch.batch}</h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        sch.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                        sch.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {sch.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#FFF4E8]/60 border border-[#172B5010] text-xs text-[#172B50]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#F4510B]" />
                        <span className="font-bold">{sch.date} ({sch.weekday})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#F4510B]" />
                        <span className="font-bold">{sch.startTime} - {sch.endTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                        <span className="font-semibold">{sch.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserCheck2 className="w-3.5 h-3.5 text-[#F4510B]" />
                        <span className="font-semibold">Coach {sch.coachName}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[#172B50]/70 font-semibold">Batch: {sch.batch}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        sch.attendanceStatus === 'Present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sch.attendanceStatus === 'Absent'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        Attendance: {sch.attendanceStatus}
                      </span>
                    </div>

                    {sch.cancellationReason && (
                      <p className="text-[11px] font-semibold text-rose-700 bg-rose-50 p-2 rounded-lg">
                        Reason: {sch.cancellationReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* 4. ATTENDANCE & COMPENSATION (Combined Master Navigation Item) */}
      {(currentView === 'attendance_compensation' || currentView === 'attendance') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Attendance &amp; Compensation Classes
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Track session attendance logs and request authorized replacement classes when your child misses a session
              </p>
            </div>

            <button
              type="button"
              onClick={openParentCompModal}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Request Compensation</span>
            </button>
          </div>

          {/* Attendance Register Cards (Real Attendance Records per Child) */}
          <div className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card">
            <h3 className="text-sm font-extrabold text-[#172B50] pb-3 border-b border-[#172B5012] mb-4">
              Attendance Register Summary
            </h3>
            {myChildren.length === 0 ? (
              <p className="text-xs text-[#172B50]/70">No child profile is linked to this parent account yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myChildren.map(child => {
                  const childRecords = myAttendanceRecords.filter(r => r.studentId === child.id);
                  const presentCount = childRecords.filter(r => r.status === 'Present').length;
                  const absentCount = childRecords.filter(r => r.status === 'Absent').length;
                  const totalMarked = childRecords.length;
                  const computedRate = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : (child.attendanceRate || 0);
                  return (
                    <div key={child.id} className="p-4 rounded-xl bg-[#FFF4E8] border border-[#172B5015]">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="text-sm font-extrabold text-[#172B50] block">{child.name}</span>
                          <span className="text-[10px] font-bold text-[#172B50]/65">{child.center} • {child.program}</span>
                        </div>
                        <span className="text-xs font-black text-[#F4510B]">{computedRate}% Present</span>
                      </div>
                      <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[#172B5015]">
                        <div style={{ width: `${computedRate}%` }} className="h-full bg-[#172B50] rounded-full" />
                      </div>
                      <p className="text-[11px] text-[#172B50] opacity-75 mt-2">
                        {totalMarked === 0
                          ? 'No attendance logs recorded yet.'
                          : `${presentCount} present, ${absentCount} absent out of ${totalMarked} marked sessions.`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Compensation Requests Section */}
          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <div className="p-5 border-b border-[#172B5010] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#172B50]">Compensation Requests</h3>
                <p className="text-xs text-[#172B50] opacity-70">Track approval status, admin remarks &amp; scheduled replacement slots</p>
              </div>
              <span className="text-xs font-bold text-[#F4510B]">
                {parentCompRequests.length} Requests
              </span>
            </div>

            <div className="divide-y divide-[#172B500C]">
              {parentCompRequests.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#172B50] opacity-70">
                  No compensation requests yet. Missed a class? Click <strong>Request Compensation</strong> above.
                </div>
              ) : (
                parentCompRequests.map(comp => (
                  <div key={comp.id} className="p-4 sm:p-5 hover:bg-[#FFF4E8]/20 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-[#172B50] text-sm">{comp.studentName}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          COMP_STATUS_STYLES[comp.status] || 'bg-amber-100 text-amber-900'
                        }`}>
                          {comp.status}
                        </span>
                        {comp.requestSource && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5015]">
                            Source: {comp.requestSource}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#172B50] opacity-80">
                        Location: <strong>{comp.center || comp.location}</strong> • Missed: <strong>{comp.missedClass}</strong> on <strong>{comp.missedDate}</strong>
                      </p>
                      <p className="text-[11px] text-[#172B50] opacity-75">
                        Reason: &quot;{comp.reason}&quot;
                      </p>
                      {comp.approvalNotes && (
                        <p className="text-[11px] text-[#172B50] bg-[#FFF4E8]/60 px-2.5 py-1.5 rounded-lg inline-block mt-1">
                          <strong>Admin Response:</strong> {comp.approvalNotes}
                        </p>
                      )}
                    </div>

                    <div className="lg:text-right shrink-0 space-y-1">
                      {comp.replacementSlot ? (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-left lg:text-right space-y-0.5">
                          <span className="text-[10px] font-black uppercase text-emerald-700 block">
                            Scheduled Replacement Class
                          </span>
                          <span className="text-xs font-extrabold text-[#172B50] block">{comp.replacementSlot}</span>
                          {comp.replacementCoach && (
                            <span className="text-[11px] font-bold text-[#F4510B] block">
                              Assigned Coach: {comp.replacementCoach}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-[#172B50]/60 block">
                          Awaiting Admin slot assignment
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-gray-500 block">ID: {comp.id}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. FEES & PAYMENTS (Combined Master Navigation Item) */}
      {(currentView === 'fees_payments' || currentView === 'payments') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Fees, Payments & Official Receipts
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Transparent fee structures, sibling discount credits, online payment gateway & tax invoices
              </p>
            </div>

            <button
              onClick={() => setIsPayModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Online Now</span>
            </button>
          </div>

          {/* Fee Structure Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#172B50] opacity-70 block mb-1">
                Aarav's Fee Plan
              </span>
              <h3 className="text-2xl font-black text-[#172B50]">Quarterly Tuition</h3>
              <p className="text-xs text-[#172B50] opacity-80 mt-1">₹12,000 / Quarter (Gymnastics)</p>
              <div className="mt-3 pt-3 border-t border-[#172B5010] flex justify-between text-xs">
                <span className="text-emerald-700 font-bold">Paid till Dec 2026</span>
                <span className="font-mono text-gray-500">Zero Due</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#172B50] opacity-70 block mb-1">
                Family Benefit Applied
              </span>
              <h3 className="text-2xl font-black text-emerald-600">Sibling Discount 10%</h3>
              <p className="text-xs text-[#172B50] opacity-80 mt-1">Automatically applied for 2 enrolled children</p>
              <div className="mt-3 pt-3 border-t border-[#172B5010] flex justify-between text-xs">
                <span className="text-[#F4510B] font-bold">Saves ₹2,400 / yr</span>
                <span className="font-mono text-gray-500">Active</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#172B50] opacity-70 block mb-1">
                Upcoming Cycle Due
              </span>
              <h3 className="text-2xl font-black text-[#F4510B]">₹4,500</h3>
              <p className="text-xs text-[#172B50] opacity-80 mt-1">Due Date: 05 Jan 2027</p>
              <div className="mt-3 pt-3 border-t border-[#172B5010] flex justify-between text-xs">
                <span className="text-[#172B50] font-bold">UPI / Cards / NetBanking</span>
                <span className="text-[#F4510B] font-bold cursor-pointer hover:underline" onClick={() => setIsPayModalOpen(true)}>Pay Early &rarr;</span>
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <div className="p-4 border-b border-[#172B5010] flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#172B50]">
                Payment Receipts & Invoices
              </h3>
              <span className="text-xs text-[#172B50] opacity-70">Official Tax Invoices</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF4E8] text-[#172B50] font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Athlete</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B5010]">
                {data.payments.filter(p => p.parentName.includes('Rohan') || p.studentName.includes('Aarav') || p.studentName.includes('Sanya')).map(p => (
                  <tr key={p.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-[#172B50]">{p.invoiceNumber}</td>
                    <td className="p-3.5 font-semibold text-[#172B50]">{p.studentName}</td>
                    <td className="p-3.5 font-black text-[#172B50]">₹{p.amount.toLocaleString()}</td>
                    <td className="p-3.5 text-[#172B50] opacity-80">{p.paymentMethod}</td>
                    <td className="p-3.5 text-[#172B50]">{p.date}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#172B50] text-white">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button 
                        onClick={() => addToast(`Official receipt ${p.invoiceNumber} downloaded as PDF.`)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#F4510B] hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. PROGRESS & ACHIEVEMENTS */}
      {currentView === 'progress' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Spartan Progress & Belt Milestones
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myChildren.map(child => (
              <div key={child.id} className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#172B5015]">
                  <div>
                    <h3 className="text-lg font-black text-[#172B50]">{child.name}</h3>
                    <p className="text-xs font-bold text-[#F4510B]">{child.rank}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-[#172B50] text-white">
                    Level 3 Advanced
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-[#172B50]">Agility & Speed Obstacle Drill</span>
                      <span className="font-black text-[#F4510B]">9 / 10</span>
                    </div>
                    <div className="w-full h-2 bg-[#FFF4E8] rounded-full overflow-hidden">
                      <div className="w-[90%] h-full bg-[#F4510B] rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-[#172B50]">Balance Beam Routine</span>
                      <span className="font-black text-[#F4510B]">8.5 / 10</span>
                    </div>
                    <div className="w-full h-2 bg-[#FFF4E8] rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-[#F4510B] rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-[#172B50]">Spartan Discipline & Team Spirit</span>
                      <span className="font-black text-[#F4510B]">10 / 10</span>
                    </div>
                    <div className="w-full h-2 bg-[#FFF4E8] rounded-full overflow-hidden">
                      <div className="w-full h-full bg-[#172B50] rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#FFF4E8] rounded-xl border border-[#172B5015] text-xs">
                  <span className="font-bold text-[#172B50] block mb-0.5">Head Coach Remark:</span>
                  <p className="text-[#172B50] opacity-80 italic">
                    "Excellent motor coordination. Ready for the upcoming Karnataka State Junior Cup nomination!"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SPORTS & EVENTS / COMPETITIONS */}
      {currentView === 'competitions' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Academy Competitions & Tournaments
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {data.competitions.map(comp => (
              <div key={comp.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#F4510B]">{comp.sport}</span>
                  <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{comp.title}</h3>
                  <p className="text-xs text-[#172B50] opacity-75 mt-2">{comp.date} • {comp.venue}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#172B5015] flex justify-between items-center">
                  <span className="text-xs font-black text-[#172B50]">{comp.entryFee}</span>
                  <button
                    onClick={() => myChildren[0] && registerCompetition(comp.id, myChildren[0].name)}
                    className="px-3 py-1.5 text-xs font-bold bg-[#F4510B] text-white rounded-lg hover:brightness-110 cursor-pointer"
                  >
                    Register Child
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. COMMUNICATION */}
      {currentView === 'communication' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
              Announcements & Circulars
            </h1>
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              Send Feedback to Coach
            </button>
          </div>
          <div className="space-y-4">
            {data.announcements.map(ann => (
              <div key={ann.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
                <span className="text-[10px] font-bold text-[#F4510B] uppercase">{ann.date} • {ann.target}</span>
                <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{ann.title}</h3>
                <p className="text-xs text-[#172B50] opacity-80 mt-2 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}

      {/* Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Apply Planned Leave for Child"
        subtitle="Notify coaches and excuse student from training roster"
      >
        <form onSubmit={handleApplyChildLeave} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Select Child</label>
            <select
              value={leaveChild}
              onChange={(e) => setLeaveChild(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            >
              {myChildren.map(c => (
                <option key={c.id} value={c.name}>{c.name} ({c.program})</option>
              ))}
            </select>
          </div>

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
            <label className="text-xs font-bold text-[#172B50] block mb-1">Reason for Leave *</label>
            <textarea
              rows="3"
              required
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="e.g. School midterm exams, out of town..."
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              Submit Leave Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Compensation Request Modal (Parent Submission) */}
      <Modal
        isOpen={isCompModalOpen}
        onClose={() => setIsCompModalOpen(false)}
        title="Request Compensation Class"
        subtitle="Submit a makeup class request for Admin eligibility review & coach scheduling"
      >
        <form onSubmit={handleSubmitCompensation} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Select Child *</label>
              <select
                required
                value={compChildId}
                onChange={(e) => handleCompChildChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl font-semibold focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {myChildren.length === 0 ? (
                  <option value="">No registered child linked</option>
                ) : (
                  myChildren.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Academy Location (Auto)</label>
              <input
                type="text"
                readOnly
                value={activeCompChild?.center || parentProfile.center || ''}
                className="w-full px-3 py-2 text-xs bg-[#FFF4E8]/60 text-[#172B50] font-bold border border-[#172B5020] rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Sports Program *</label>
              <select
                required
                value={compProgram}
                onChange={(e) => setCompProgram(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl font-semibold focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {(data.programs || []).map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Training Batch</label>
              <select
                value={compBatchId}
                onChange={(e) => {
                  const id = e.target.value;
                  setCompBatchId(id);
                  const b = compChildBatches.find(x => x.id === id);
                  if (b) setCompMissedSession(b.name);
                }}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl font-semibold focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                <option value="">{activeCompChild?.batchName || 'Registered Program Batch'}</option>
                {compChildBatches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Missed Class Date *</label>
              <input
                type="date"
                required
                value={missedDate}
                onChange={(e) => setMissedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Missed Class / Session *</label>
              <input
                type="text"
                required
                value={compMissedSession}
                onChange={(e) => setCompMissedSession(e.target.value)}
                placeholder="e.g. Evening Batch A / Session"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Reason for Missing Class *</label>
            <select
              required
              value={compReasonCategory}
              onChange={(e) => setCompReasonCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl font-semibold focus:ring-2 focus:ring-[#F4510B] outline-none"
            >
              {COMPENSATION_REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Additional Explanation *</label>
            <textarea
              rows={2}
              required
              value={compExplanation}
              onChange={(e) => setCompExplanation(e.target.value)}
              placeholder="Share brief details for Admin review..."
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCompModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!activeCompChild}
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 disabled:opacity-50 cursor-pointer"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Pay Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Pay Term Tuition Fee"
        subtitle="Secure UPI & Net Banking Payment Gateway"
      >
        <form onSubmit={handlePayTuition} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Select Child</label>
            <select
              value={selectedChildForPay}
              onChange={(e) => setSelectedChildForPay(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            >
              {myChildren.map(c => (
                <option key={c.id} value={c.name}>{c.name} ({c.program})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Fee Amount (₹)</label>
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              Proceed to Pay ₹{payAmount}
            </button>
          </div>
        </form>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title="Review Coach Vikram Singh"
        subtitle="Rate session quality and child progress"
      >
        <form onSubmit={handleSendFeedback} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Star Rating</label>
            <select
              value={fbRating}
              onChange={(e) => setFbRating(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            >
              <option value="5">★★★★★ (5/5 Exceptional)</option>
              <option value="4">★★★★☆ (4/5 Very Good)</option>
              <option value="3">★★★☆☆ (3/5 Good)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Your Feedback & Comments *</label>
            <textarea
              rows="3"
              required
              value={fbComment}
              onChange={(e) => setFbComment(e.target.value)}
              placeholder="What did you love about recent sessions?"
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFeedbackModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
