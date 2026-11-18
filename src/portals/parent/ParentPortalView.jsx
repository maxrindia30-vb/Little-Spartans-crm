import React, { useMemo, useState } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  CalendarDays,
  CreditCard, 
  ClipboardCheck, 
  Trophy,
  Medal,
  Users,
  Layers, 
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
  ChevronRight,
  CalendarX,
  Search,
  Activity,
  Building2,
  User,
  Zap,
  BarChart2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  CalendarCheck
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import {
  getChildMatchedSchedules,
  mergeScheduleAttendance,
  MON_FIRST_WEEKDAYS,
  formatYmd,
} from '../../services/scheduleService';
import { COMPENSATION_REASONS } from '../../services/compensationService';
import {
  computeStudentPackage,
  calculatePackageExpiryDate,
  calculatePackageOverviewMetrics,
  PACKAGE_STATUS_CONFIG,
  PACKAGE_TOTAL_CLASSES,
  PACKAGE_STATUSES,
  PACKAGE_REMINDER_THRESHOLD,
  getStudentPackageAttendance
} from '../../services/packageService';
import KpiCard, { AnimatedCounter } from '../../components/common/KpiCard';
import FloatingCard from '../../components/common/FloatingCard';
import Modal from '../../components/common/Modal';
import LiveCalendarButton from '../../components/common/LiveCalendarButton';
import FeesPaymentsModule from '../admin/FeesPaymentsModule';
import SportsEventsModule from '../admin/SportsEventsModule';

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
  const myChildren = useMemo(() => {
    if (parentProfile?.id) {
      const filtered = (data.students || []).filter(s => 
        s.parentId === parentProfile.id ||
        (parentProfile.email && s.parentEmail && s.parentEmail.toLowerCase() === parentProfile.email.toLowerCase()) ||
        (parentProfile.phone && s.parentPhone && s.parentPhone === parentProfile.phone) ||
        (parentProfile.name && s.parentName && s.parentName.toLowerCase().trim() === parentProfile.name.toLowerCase().trim())
      );
      if (filtered.length > 0) return filtered;
    }
    return (data.students || []);
  }, [parentProfile, data.students]);

  // Package Audit & Attendance History Modal state
  const [packageHistoryChild, setPackageHistoryChild] = useState(null);

  const todayYmd = formatYmd(new Date());

  // Individual Class Package calculations for parent's children (24 classes, 3 months duration)
  const myChildrenPackages = useMemo(() => {
    return myChildren.map(child => ({
      child,
      pkg: computeStudentPackage(child, data.attendanceRecords || [], todayYmd)
    }));
  }, [myChildren, data.attendanceRecords, todayYmd]);

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
  const [parentAttSubTab, setParentAttSubTab] = useState('attendance');

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
      
      {/* 1. MASTER TOP HEADER (Admin Dashboard Reference System) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {/* Left: Heading & Subtitle */}
        <div className="text-left space-y-1">
          <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-black text-[#172B50] tracking-tight flex items-center gap-2">
            <span>Good Morning, {parentProfile.name ? parentProfile.name.split(' ')[0] : 'Parent'}!</span>
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
            onClick={() => addToast('Search classes, coaches & records')}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4 text-[#172B50]" />
          </button>

          {/* 2. Notification */}
          <button
            type="button"
            onClick={() => setCurrentView('communication')}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer relative"
            title="Academy Notifications"
          >
            <Bell className="w-4 h-4 text-[#172B50]" />
            {(data.announcements || []).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#F4510B] absolute top-2 right-2 ring-1 ring-white" />
            )}
          </button>

          {/* 3. Profile */}
          <div 
            onClick={() => setCurrentView('children')}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full ring-2 ring-white shadow-2xs overflow-hidden cursor-pointer hover:ring-[#F4510B] transition-all" 
            title="Parent & Athlete Profiles"
          >
            <img
              src={myChildren[0]?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"}
              alt="Parent Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* 4. Action: Request Makeup / Compensation */}
          <button
            type="button"
            onClick={openParentCompModal}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer"
            title="Request Makeup / Compensation"
          >
            <Plus className="w-4 h-4 text-[#172B50]" />
          </button>

          {/* 5. Live Calendar */}
          <LiveCalendarButton 
            classes={synchronizedChildSessions} 
            onViewSchedule={() => setCurrentView('classes')} 
          />
        </div>
      </div>

      {/* 2. PARENT DASHBOARD MAIN VIEW */}
      {currentView === 'dashboard' && (
        <div className="space-y-6 animate-slide-up">
          
          {/* TOP 4 PIPELINE / FAMILY SUMMARY CARDS (MASTER ADMIN DESIGN) */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
              
              {/* CARD 1: My Spartan Athletes (Peach #FFF9F5) */}
              <div className="relative flex flex-col">
                <FloatingCard
                  scale={1.01}
                  maxTilt={2}
                  className="rounded-[24px] p-5 bg-[#FFF9F5] border border-[#172B5014] shadow-[0_4px_25px_rgba(23,43,80,0.03)] flex flex-col justify-between h-full relative"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#F4510B]/10 border border-[#F4510B]/20 flex items-center justify-center text-[#F4510B]">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-sm font-black text-[#172B50] tracking-tight">
                            My Spartan Athletes
                          </h2>
                          <p className="text-[11px] font-bold text-[#172B50]/60">
                            {myChildren.length} Enrolled {myChildren.length === 1 ? 'Child' : 'Children'}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white border border-[#172B5012] text-[#172B50]">
                        Active Roster
                      </span>
                    </div>

                    {/* Children List */}
                    <div className="space-y-2.5 min-h-[258px] max-h-[258px] overflow-y-auto pr-1">
                      {myChildren.length === 0 ? (
                        <div className="p-4 rounded-xl bg-white/70 border border-dashed border-[#172B5020] text-center text-xs text-[#172B50]/70">
                          No enrolled children found linked to this account.
                        </div>
                      ) : (
                        myChildren.map((child) => (
                          <div
                            key={child.id}
                            className="p-3 rounded-2xl bg-white border border-[#172B5010] shadow-2xs hover:border-[#F4510B40] transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={child.avatar}
                                alt={child.name}
                                className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#172B5015] group-hover:ring-[#F4510B] transition-all"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <h4 className="text-xs font-black text-[#172B50] truncate group-hover:text-[#F4510B] transition-colors">
                                    {child.name}
                                  </h4>
                                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#172B50] text-white shrink-0">
                                    {child.rank || 'Spartan'}
                                  </span>
                                </div>
                                <p className="text-[10.5px] font-bold text-[#172B50]/70 truncate mt-0.5">
                                  {child.program} • {child.center}
                                </p>
                                <div className="flex items-center justify-between text-[10px] text-[#172B50]/60 mt-1 font-semibold">
                                  <span>Coach: {child.coachName || 'Assigned'}</span>
                                  <span className="text-emerald-700 font-bold">{child.attendanceRate}% Attendance</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Footer link */}
                  <div className="pt-3 mt-3 border-t border-[#172B5010] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentView('children')}
                      className="text-xs font-extrabold text-[#F4510B] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Athlete Profiles</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-bold text-[#172B50]/50">
                      Term 2026-27
                    </span>
                  </div>
                </FloatingCard>

                {/* SVG Bracket Connector 1 -> 2 */}
                <div className="hidden xl:block absolute -top-4 right-[-14px] w-7 h-8 pointer-events-none z-10">
                  <svg className="w-full h-full text-[#172B50]/20" viewBox="0 0 28 32" fill="none">
                    <path d="M4 4 C 18 4, 18 28, 28 28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                  </svg>
                </div>
              </div>

              {/* CARD 2: Upcoming Sessions (Sky Blue #F4FAFF) */}
              <div className="relative flex flex-col">
                <FloatingCard
                  scale={1.01}
                  maxTilt={2}
                  className="rounded-[24px] p-5 bg-[#F4FAFF] border border-[#172B5014] shadow-[0_4px_25px_rgba(23,43,80,0.03)] flex flex-col justify-between h-full relative"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#0B3B60]/10 border border-[#0B3B60]/20 flex items-center justify-center text-[#0B3B60]">
                          <CalendarDays className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-sm font-black text-[#172B50] tracking-tight">
                            Upcoming Classes
                          </h2>
                          <p className="text-[11px] font-bold text-[#172B50]/60">
                            {upcomingChildSessions.length} Next Scheduled
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0B3B60] text-white">
                        Live Timetable
                      </span>
                    </div>

                    {/* Classes List */}
                    <div className="space-y-2.5 min-h-[258px] max-h-[258px] overflow-y-auto pr-1">
                      {upcomingChildSessions.length === 0 ? (
                        <div className="p-4 rounded-xl bg-white/70 border border-dashed border-[#172B5020] text-center text-xs text-[#172B50]/70">
                          No upcoming sessions published for your child&apos;s batch yet.
                        </div>
                      ) : (
                        upcomingChildSessions.slice(0, 4).map((session, i) => (
                          <div
                            key={session.id || i}
                            className="p-3 rounded-2xl bg-white border border-[#172B5010] shadow-2xs hover:border-[#0B3B60]/40 transition-all"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-[10px] font-black uppercase text-[#0B3B60] bg-[#F4FAFF] px-2 py-0.5 rounded-md border border-[#0B3B60]/15">
                                {session.date || 'Weekly'} • {session.startTime || '07:00'} - {session.endTime || '08:00'}
                              </span>
                              <span className="text-[10px] font-black text-[#F4510B]">
                                {session.childName}
                              </span>
                            </div>
                            <h4 className="text-xs font-black text-[#172B50] truncate mt-1">
                              {session.className || session.program || 'Training Session'}
                            </h4>
                            <div className="flex items-center justify-between text-[10px] font-bold text-[#172B50]/65 mt-1">
                              <span>Coach {session.coachName || 'Spartan Coach'}</span>
                              <span className="text-[#0B3B60]">{session.location}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Footer link */}
                  <div className="pt-3 mt-3 border-t border-[#172B5010] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentView('classes')}
                      className="text-xs font-extrabold text-[#0B3B60] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Class Timetable</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-bold text-[#172B50]/50">
                      {mySchedulesCount} Total Batches
                    </span>
                  </div>
                </FloatingCard>

                {/* SVG Bracket Connector 2 -> 3 */}
                <div className="hidden xl:block absolute -top-4 right-[-14px] w-7 h-8 pointer-events-none z-10">
                  <svg className="w-full h-full text-[#172B50]/20" viewBox="0 0 28 32" fill="none">
                    <path d="M4 4 C 18 4, 18 28, 28 28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                  </svg>
                </div>
              </div>

              {/* CARD 3: Attendance & Makeups (Mint #F4FDF7) */}
              <div className="relative flex flex-col">
                <FloatingCard
                  scale={1.01}
                  maxTilt={2}
                  className="rounded-[24px] p-5 bg-[#F4FDF7] border border-[#172B5014] shadow-[0_4px_25px_rgba(23,43,80,0.03)] flex flex-col justify-between h-full relative"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                          <ClipboardCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-sm font-black text-[#172B50] tracking-tight">
                            Attendance & Makeups
                          </h2>
                          <p className="text-[11px] font-bold text-[#172B50]/60">
                            {myAttendanceCount} Verified Check-ins
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#10B981] text-white">
                        Verified
                      </span>
                    </div>

                    {/* Attendance / Makeup Requests list */}
                    <div className="space-y-2.5 min-h-[258px] max-h-[258px] overflow-y-auto pr-1">
                      {parentCompRequests.length > 0 ? (
                        parentCompRequests.slice(0, 3).map((req) => (
                          <div
                            key={req.id}
                            className="p-3 rounded-2xl bg-white border border-[#172B5010] shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-black uppercase text-[#F4510B] bg-[#FFF4E8] px-2 py-0.5 rounded-md">
                                Makeup: {req.studentName}
                              </span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                req.status === 'Scheduled' || req.status === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.status === 'Rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}>
                                {req.status}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-[#172B50] mt-1">
                              Missed: {req.missedDate} ({req.program})
                            </p>
                            <p className="text-[10px] text-[#172B50]/60 mt-0.5">
                              {req.replacementSlot ? `Scheduled: ${req.replacementSlot.date} (${req.replacementSlot.startTime})` : req.explanation || 'Pending review'}
                            </p>
                          </div>
                        ))
                      ) : null}

                      {myAttendanceRecords.slice(0, 3).map((rec, i) => (
                        <div
                          key={rec.id || i}
                          className="p-3 rounded-2xl bg-white border border-[#172B5010] shadow-2xs flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-[#172B50]">{rec.studentName}</span>
                              <span className="text-[10px] text-[#172B50]/60">({rec.date})</span>
                            </div>
                            <p className="text-[10.5px] font-bold text-[#172B50]/70 mt-0.5">{rec.program} • {rec.location || rec.center}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                            rec.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {rec.status}
                          </span>
                        </div>
                      ))}

                      {myAttendanceRecords.length === 0 && parentCompRequests.length === 0 && (
                        <div className="p-4 rounded-xl bg-white/70 border border-dashed border-[#172B5020] text-center text-xs text-[#172B50]/70">
                          Attendance check-ins marked by coaches will appear here with live sync.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer link */}
                  <div className="pt-3 mt-3 border-t border-[#172B5010] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentView('attendance_compensation')}
                      className="text-xs font-extrabold text-[#10B981] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Full Attendance History</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-bold text-[#172B50]/50">
                      {parentCompRequests.length} Makeups
                    </span>
                  </div>
                </FloatingCard>

                {/* SVG Bracket Connector 3 -> 4 */}
                <div className="hidden xl:block absolute -top-4 right-[-14px] w-7 h-8 pointer-events-none z-10">
                  <svg className="w-full h-full text-[#172B50]/20" viewBox="0 0 28 32" fill="none">
                    <path d="M4 4 C 18 4, 18 28, 28 28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                  </svg>
                </div>
              </div>

              {/* CARD 4: Family Command Hub (White #FFFFFF) */}
              <div className="relative flex flex-col">
                <FloatingCard
                  scale={1.01}
                  maxTilt={2}
                  className="rounded-[24px] p-5 bg-white border border-[#172B5014] shadow-[0_4px_25px_rgba(23,43,80,0.03)] flex flex-col justify-between h-full relative"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#F4510B]/10 border border-[#F4510B]/20 flex items-center justify-center text-[#F4510B]">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-sm font-black text-[#172B50] tracking-tight">
                            Family Quick Hub
                          </h2>
                          <p className="text-[11px] font-bold text-[#172B50]/60">
                            Direct Parent Actions
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#172B50]/5 text-[#172B50] border border-[#172B5012]">
                        Quick Link
                      </span>
                    </div>

                    {/* 2x2 Quick Action Tiles */}
                    <div className="grid grid-cols-2 gap-2.5 min-h-[258px]">
                      {/* Tile 1: Request Compensation (Featured Navy) */}
                      <button
                        type="button"
                        onClick={openParentCompModal}
                        className="p-3.5 rounded-2xl bg-[#0B3B60] text-white flex flex-col justify-between text-left hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center text-white mb-2">
                          <RefreshCw className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-white/70 block">Missed Class?</span>
                          <span className="text-xs font-black text-white leading-tight">Request Makeup</span>
                        </div>
                      </button>

                      {/* Tile 2: Class Timetable */}
                      <button
                        type="button"
                        onClick={() => setCurrentView('classes')}
                        className="p-3.5 rounded-2xl bg-white border border-[#172B5015] hover:border-[#F4510B] hover:bg-[#FFF4E8]/40 flex flex-col justify-between text-left active:scale-95 transition-all shadow-2xs cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-xl bg-[#FFF4E8] flex items-center justify-center text-[#F4510B] mb-2">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#172B50]/60 block">Batches</span>
                          <span className="text-xs font-black text-[#172B50] leading-tight">Class Timetable</span>
                        </div>
                      </button>

                      {/* Tile 3: Apply Leave */}
                      <button
                        type="button"
                        onClick={() => setIsLeaveModalOpen(true)}
                        className="p-3.5 rounded-2xl bg-white border border-[#172B5015] hover:border-[#F4510B] hover:bg-[#FFF4E8]/40 flex flex-col justify-between text-left active:scale-95 transition-all shadow-2xs cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-xl bg-[#FFF4E8] flex items-center justify-center text-[#F4510B] mb-2">
                          <CalendarOff className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#172B50]/60 block">Planned Off</span>
                          <span className="text-xs font-black text-[#172B50] leading-tight">Apply Leave</span>
                        </div>
                      </button>

                      {/* Tile 4: Coach Feedback */}
                      <button
                        type="button"
                        onClick={() => setIsFeedbackModalOpen(true)}
                        className="p-3.5 rounded-2xl bg-white border border-[#172B5015] hover:border-[#F4510B] hover:bg-[#FFF4E8]/40 flex flex-col justify-between text-left active:scale-95 transition-all shadow-2xs cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-xl bg-[#F4FAFF] flex items-center justify-center text-[#0B3B60] mb-2">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#172B50]/60 block">Review</span>
                          <span className="text-xs font-black text-[#172B50] leading-tight">Coach Feedback</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Footer link */}
                  <div className="pt-3 mt-3 border-t border-[#172B5010] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentView('attendance_compensation')}
                      className="text-xs font-extrabold text-[#F4510B] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Compensation Requests</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-bold text-[#172B50]/50">
                      Family Desk
                    </span>
                  </div>
                </FloatingCard>
              </div>

            </div>
          </div>

          {/* MIDDLE ROW: 3 DYNAMIC MASTER CARDS (h-[440px] matching Admin Reference) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
            
            {/* COLUMN 1: Weekly Class Timetable (Table format) */}
            <FloatingCard
              scale={1.006}
              maxTilt={2}
              className="rounded-[28px] p-5 sm:p-6 bg-white border border-[#172B5014] shadow-[0_4px_25px_rgba(23,43,80,0.03)] flex flex-col justify-between h-[440px] min-h-[440px]"
            >
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F4510B]/10 border border-[#F4510B]/20 flex items-center justify-center text-[#F4510B]">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                        Weekly Training Timetable
                      </h3>
                      <p className="text-[11px] font-bold text-[#172B50]/60">
                        {myChildren.map(c => c.name).join(', ')}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#172B50] text-white">
                    {mySchedulesCount} Sessions
                  </span>
                </div>

                {/* Table of synchronized sessions */}
                <div className="flex-1 overflow-y-auto pr-1">
                  {synchronizedChildSessions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <Calendar className="w-10 h-10 text-[#172B50]/20 mb-2" />
                      <p className="text-xs font-bold text-[#172B50]/70">No synchronized schedules found.</p>
                      <p className="text-[11px] text-[#172B50]/50 mt-1">Schedules published by Admin will automatically appear here.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#172B5010] text-[10px] font-black uppercase text-[#172B50]/50 tracking-wider">
                            <th className="pb-2">TIME</th>
                            <th className="pb-2">ATHLETE</th>
                            <th className="pb-2">PROGRAM</th>
                            <th className="pb-2">LOCATION</th>
                            <th className="pb-2 text-right">COACH</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#172B5008] text-xs">
                          {synchronizedChildSessions.slice(0, 6).map((sch, idx) => (
                            <tr key={sch.id || idx} className="hover:bg-[#FFF4E8]/30 transition-colors">
                              <td className="py-2.5 font-bold text-[#172B50]">
                                <span className="block">{sch.day || sch.date || 'Weekly'}</span>
                                <span className="text-[10px] text-[#172B50]/60">{sch.startTime}</span>
                              </td>
                              <td className="py-2.5 font-black text-[#F4510B]">
                                {sch.childName}
                              </td>
                              <td className="py-2.5 font-bold text-[#172B50]">
                                {sch.program || sch.className}
                              </td>
                              <td className="py-2.5 text-[#172B50]/70 font-semibold text-[11px]">
                                {sch.location}
                              </td>
                              <td className="py-2.5 text-right font-bold text-[#172B50] text-[11px]">
                                {sch.coachName || 'Spartan Coach'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom bar */}
              <div className="pt-3 mt-2 border-t border-[#172B5010] flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setCurrentView('classes')}
                  className="text-xs font-extrabold text-[#F4510B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full Timetable View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10.5px] font-bold text-[#172B50]/50">
                  Live Synced
                </span>
              </div>
            </FloatingCard>

            {/* COLUMN 2: Athlete Attendance & Health (2x2 KPI + Progress) */}
            <FloatingCard
              scale={1.006}
              maxTilt={2}
              className="rounded-[28px] p-5 sm:p-6 bg-white border border-[#172B5014] shadow-[0_4px_25px_rgba(23,43,80,0.03)] flex flex-col justify-between h-[440px] min-h-[440px]"
            >
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#0B3B60]/10 border border-[#0B3B60]/20 flex items-center justify-center text-[#0B3B60]">
                      <BarChart2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                        Athlete Health & Performance
                      </h3>
                      <p className="text-[11px] font-bold text-[#172B50]/60">
                        Attendance & Turnout Metrics
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#10B981] text-white">
                    Verified Sync
                  </span>
                </div>

                {/* 2x2 Metric Cards */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3.5 rounded-2xl bg-[#FFF9F5] border border-[#172B5010] flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#F4510B]">
                      Children
                    </span>
                    <span className="text-2xl font-black text-[#172B50] my-1">
                      {myChildren.length}
                    </span>
                    <span className="text-[10px] font-bold text-[#172B50]/60 truncate">
                      {parentProfile.center || 'Active Center'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F4FAFF] border border-[#172B5010] flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0B3B60]">
                      Upcoming
                    </span>
                    <span className="text-2xl font-black text-[#172B50] my-1">
                      {String(upcomingChildSessions.length).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-[#172B50]/60 truncate">
                      {mySchedulesCount} Total Batches
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F4FDF7] border border-[#172B5010] flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                      Check-ins
                    </span>
                    <span className="text-2xl font-black text-[#172B50] my-1">
                      {myAttendanceCount}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700/80 truncate">
                      Coach Verified
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF5FF] border border-[#172B5010] flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">
                      Makeups
                    </span>
                    <span className="text-2xl font-black text-[#172B50] my-1">
                      {parentCompRequests.length}
                    </span>
                    <span className="text-[10px] font-bold text-purple-700/80 truncate">
                      {parentCompRequests.filter(r => r.status === 'Scheduled').length} Scheduled
                    </span>
                  </div>
                </div>

                {/* Turnout & Next Session Banner */}
                <div className="p-3 rounded-2xl bg-[#FFF4E8] border border-[#F4510B20] shrink-0">
                  <div className="flex items-center justify-between text-xs font-black text-[#172B50] mb-1">
                    <span>Average Attendance Health</span>
                    <span className="text-[#F4510B]">
                      {myChildren.length > 0 
                        ? Math.round(myChildren.reduce((acc, c) => acc + (c.attendanceRate || 90), 0) / myChildren.length)
                        : 92}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#F4510B] to-[#10B981] rounded-full" 
                      style={{ 
                        width: `${myChildren.length > 0 
                          ? Math.round(myChildren.reduce((acc, c) => acc + (c.attendanceRate || 90), 0) / myChildren.length)
                          : 92}%` 
                      }} 
                    />
                  </div>
                  <p className="text-[10px] text-[#172B50]/70 mt-1.5 font-semibold">
                    {nextUpcomingSession 
                      ? `Next: ${nextUpcomingSession.childName} on ${nextUpcomingSession.date || 'Weekly'} at ${nextUpcomingSession.startTime || '07:00'}`
                      : 'All scheduled sessions are up to date!'}
                  </p>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="pt-3 mt-2 border-t border-[#172B5010] flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setCurrentView('attendance_compensation')}
                  className="text-xs font-extrabold text-[#0B3B60] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Attendance History</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10.5px] font-bold text-[#172B50]/50">
                  Performance Hub
                </span>
              </div>
            </FloatingCard>

            {/* COLUMN 3: Parent Hub & Quick Services (Action Tiles matching Admin) */}
            <FloatingCard
              scale={1.006}
              maxTilt={2}
              className="rounded-[28px] p-5 sm:p-6 bg-white border border-[#172B5014] shadow-[0_4px_25px_rgba(23,43,80,0.03)] flex flex-col justify-between h-[440px] min-h-[440px]"
            >
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F4510B]/10 border border-[#F4510B]/20 flex items-center justify-center text-[#F4510B]">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                        Family Services & Operations
                      </h3>
                      <p className="text-[11px] font-bold text-[#172B50]/60">
                        Direct Access Center
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#172B50] text-white">
                    Self-Service
                  </span>
                </div>

                {/* 2x2 Action Tiles */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {/* Action 1: Request Compensation (Featured Navy #0B3B60) */}
                  <button
                    type="button"
                    onClick={openParentCompModal}
                    className="p-3.5 rounded-2xl bg-[#0B3B60] text-white flex flex-col justify-between text-left hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white mb-2">
                      <RefreshCw className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-white/70 block">Makeup Class</span>
                      <span className="text-xs font-black text-white leading-tight">Request Makeups</span>
                    </div>
                  </button>

                  {/* Action 2: Class Timetable */}
                  <button
                    type="button"
                    onClick={() => setCurrentView('classes')}
                    className="p-3.5 rounded-2xl bg-white border border-[#172B5015] hover:border-[#F4510B] hover:bg-[#FFF4E8]/40 flex flex-col justify-between text-left active:scale-95 transition-all shadow-2xs cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] flex items-center justify-center text-[#F4510B] mb-2">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#172B50]/60 block">Schedules</span>
                      <span className="text-xs font-black text-[#172B50] leading-tight">Class Timetable</span>
                    </div>
                  </button>

                  {/* Action 3: Progress & Badges */}
                  <button
                    type="button"
                    onClick={() => setCurrentView('progress')}
                    className="p-3.5 rounded-2xl bg-white border border-[#172B5015] hover:border-[#F4510B] hover:bg-[#FFF4E8]/40 flex flex-col justify-between text-left active:scale-95 transition-all shadow-2xs cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] flex items-center justify-center text-[#F4510B] mb-2">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#172B50]/60 block">Milestones</span>
                      <span className="text-xs font-black text-[#172B50] leading-tight">Badges & Ranks</span>
                    </div>
                  </button>

                  {/* Action 4: Notices & Feedback */}
                  <button
                    type="button"
                    onClick={() => setCurrentView('communication')}
                    className="p-3.5 rounded-2xl bg-white border border-[#172B5015] hover:border-[#F4510B] hover:bg-[#FFF4E8]/40 flex flex-col justify-between text-left active:scale-95 transition-all shadow-2xs cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#F4FAFF] flex items-center justify-center text-[#0B3B60] mb-2">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#172B50]/60 block">Academy Desk</span>
                      <span className="text-xs font-black text-[#172B50] leading-tight">Notices & Feedback</span>
                    </div>
                  </button>
                </div>

                {/* Notice Banner */}
                <div className="p-3 rounded-2xl bg-[#F4FAFF] border border-[#0B3B60]/15 shrink-0 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#F4510B] shrink-0" />
                    <p className="text-[11px] font-bold text-[#172B50]">
                      {(data.announcements && data.announcements[0]?.title) || 'Term 2026-27 Registrations Open'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentView('communication')}
                    className="text-[10.5px] font-black text-[#0B3B60] hover:underline shrink-0 cursor-pointer"
                  >
                    Read
                  </button>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="pt-3 mt-2 border-t border-[#172B5010] flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="text-xs font-extrabold text-[#F4510B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Share Coach Feedback</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10.5px] font-bold text-[#172B50]/50">
                  Direct Line
                </span>
              </div>
            </FloatingCard>

          </div>

          {/* INDIVIDUAL STUDENT CLASS PACKAGES & 24-CLASS QUOTA TRACKING */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B501A] shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#172B5010]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F4510B]/10 border border-[#F4510B]/20 flex items-center justify-center text-[#F4510B] shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-[#172B50] tracking-tight">
                      Individual Student Class Packages
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#172B50] text-white">
                      24 Classes • 3 Months
                    </span>
                  </div>
                  <p className="text-xs text-[#172B50]/65 mt-0.5">
                    Live attendance-deducted class balance, validity dates &amp; automatic renewal triggers for your athletes
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentView('fees_payments')}
                className="px-4 py-2 rounded-xl text-xs font-black bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30] hover:bg-[#F4510B] hover:text-white transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>Fees &amp; Full Package History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {myChildrenPackages.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#FFF9F5] border border-dashed border-[#172B5020] text-center">
                <p className="text-xs font-bold text-[#172B50]/70">No registered children found on your account.</p>
                <p className="text-[11px] text-[#172B50]/50 mt-1">Class package tracking will activate automatically upon enrollment confirmation.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myChildrenPackages.map(({ child, pkg }) => {
                  const statusCfg = PACKAGE_STATUS_CONFIG[pkg.status] || PACKAGE_STATUS_CONFIG['Active'];
                  const isReminderDue = pkg.status === 'Reminder Due' || (pkg.classesAttended >= 20 && pkg.classesAttended < 24);
                  const isCompleted = pkg.status === 'Completed' || pkg.classesAttended >= 24;
                  const isExpired = pkg.status === 'Expired';

                  return (
                    <div 
                      key={child.id} 
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isReminderDue 
                          ? 'bg-[#FFF9F5] border-amber-300 shadow-sm' 
                          : isCompleted 
                          ? 'bg-[#F8FAFC] border-indigo-200' 
                          : 'bg-white border-[#172B5014] hover:border-[#F4510B30] shadow-2xs'
                      }`}
                    >
                      {/* Athlete Header */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#172B500E]">
                        <div className="flex items-center gap-3">
                          <img 
                            src={child.avatar} 
                            alt={child.name} 
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#172B5015]"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-black text-[#172B50]">{child.name}</h3>
                              <span className="text-[10px] font-bold text-[#172B50]/50">({child.id})</span>
                            </div>
                            <p className="text-[11px] font-bold text-[#F4510B] mt-0.5">{child.program}</p>
                            <p className="text-[10.5px] text-[#172B50]/60 font-semibold">{child.center} • Coach {child.coachName || 'Assigned'}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${statusCfg.badge}`}>
                            {pkg.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold ${
                            child.feeStatus === 'Paid' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : child.feeStatus === 'Unpaid' 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            Tuition: {child.feeStatus || 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Package Validity 3-Month Metrics */}
                      <div className="grid grid-cols-3 gap-2 my-3 text-center">
                        <div className="p-2 rounded-xl bg-white/80 border border-[#172B500C]">
                          <span className="text-[10px] font-bold text-[#172B50]/60 block uppercase">Activation</span>
                          <span className="text-xs font-black text-[#172B50] mt-0.5 block truncate">
                            {pkg.activationDate || 'Pending'}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/80 border border-[#172B500C]">
                          <span className="text-[10px] font-bold text-[#172B50]/60 block uppercase">Valid Until (3 Mo)</span>
                          <span className="text-xs font-black text-[#172B50] mt-0.5 block truncate">
                            {pkg.expiryDate || 'N/A'}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/80 border border-[#172B500C]">
                          <span className="text-[10px] font-bold text-[#172B50]/60 block uppercase">Remaining</span>
                          <span className={`text-xs font-black mt-0.5 block ${
                            isCompleted ? 'text-indigo-700' : isReminderDue ? 'text-[#F4510B]' : 'text-emerald-700'
                          }`}>
                            {pkg.classesRemaining} Classes
                          </span>
                        </div>
                      </div>

                      {/* Usage Progress Bar */}
                      <div className="space-y-1.5 my-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#172B50]">
                            {pkg.classesAttended} of 24 Attended
                          </span>
                          <span className="font-black text-[#172B50]">
                            {pkg.percentage}%
                          </span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-[#172B500D] overflow-hidden p-0.5 border border-[#172B5010]">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted 
                                ? 'bg-gradient-to-r from-indigo-500 to-indigo-700' 
                                : isReminderDue 
                                ? 'bg-gradient-to-r from-amber-500 to-[#F4510B]' 
                                : isExpired 
                                ? 'bg-gradient-to-r from-rose-400 to-rose-600' 
                                : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                            }`}
                            style={{ width: `${pkg.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Reminder / Notification Banners */}
                      {isReminderDue && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-black block">Renewal Reminder Approaching</span>
                            <span className="text-[11px] text-amber-800">
                              {child.name} has attended {pkg.classesAttended} of 24 classes (only {pkg.classesRemaining} remaining). Package expires on {pkg.expiryDate}. Please renew to prevent class interruption.
                            </span>
                          </div>
                        </div>
                      )}

                      {isCompleted && (
                        <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-start gap-2 mb-3">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-black block">24 Classes Completed • Renewal Due</span>
                            <span className="text-[11px] text-indigo-800">
                              All 24 classes for this 3-month package have been completed! Please renew for the next cycle.
                            </span>
                          </div>
                        </div>
                      )}

                      {isExpired && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2 mb-3">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-black block">Package Expired</span>
                            <span className="text-[11px] text-rose-800">
                              This package expired on {pkg.expiryDate}. Please contact academy desk to reactivate.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Card Footer Actions */}
                      <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-[#172B50]/60">
                          {pkg.attendanceBreakdown.filter(a => a.status === 'Present').length} Present • {pkg.attendanceBreakdown.filter(a => a.status === 'Absent').length} Absent
                        </span>
                        <button
                          type="button"
                          onClick={() => setPackageHistoryChild(child)}
                          className="font-extrabold text-[#F4510B] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>View Attendance History</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ATHLETE ROSTER SUMMARY STRIP */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#172B50]">
                Registered Spartan Athletes
              </h2>
              <button
                type="button"
                onClick={() => setCurrentView('children')}
                className="text-xs font-bold text-[#F4510B] hover:underline cursor-pointer"
              >
                View Full Profiles &rarr;
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        </div>
      )}

      {/* 3. MY CHILDREN: ADAPTED FROM ADMIN STUDENT MANAGEMENT */}
      {currentView === 'children' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                My Registered Spartan Athletes
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Official athlete profiles, program enrollments, assigned coaches, and emergency records
              </p>
            </div>
          </div>

          {/* Top 4 KPI Cards matching Admin StudentManagement */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-[#FFF4E8] border border-[#F4510B25] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B18] text-[#F4510B] flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Registered Children</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {myChildren.length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0FDF4] border border-[#16A34A20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#16A34A18] text-[#16A34A] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Active Programs</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {new Set(myChildren.map(c => c.program)).size}
                </div>
              </div>
            </div>

            <div className="bg-[#F0F7FF] border border-[#0284C720] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#0284C718] text-[#0284C7] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-[#0284C7]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Overall Turnout</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {myChildren.length > 0 ? Math.round(myChildren.reduce((acc, c) => acc + (c.attendanceRate || 95), 0) / myChildren.length) : 95}%
                </div>
              </div>
            </div>

            <div className="bg-[#FFF9F5] border border-[#F4510B20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B15] text-[#F4510B] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Academy Centers</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {new Set(myChildren.map(c => c.center)).size}
                </div>
              </div>
            </div>
          </div>

          {/* Children Profiles Grid matching Admin Student Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myChildren.map(child => (
              <div key={child.id} className="bg-white rounded-3xl p-6 border border-[#172B501A] shadow-card hover:border-[#F4510B30] transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#172B5012]">
                    <div className="flex items-center gap-3.5">
                      <img src={child.avatar} alt={child.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#F4510B] shadow-2xs" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-[#172B50]">{child.name}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#172B50] text-white">
                            {child.rank || 'Spartan'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#F4510B] mt-0.5">{child.program}</p>
                        <p className="text-[11px] text-[#172B50]/60">Athlete ID: {child.id} • DOB: {child.dob}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2.5 mt-4 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-[#172B500C]">
                      <span className="text-[#172B50]/70 font-semibold">Training Center:</span>
                      <span className="font-extrabold text-[#172B50]">{child.center}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[#172B500C]">
                      <span className="text-[#172B50]/70 font-semibold">Assigned Head Coach:</span>
                      <span className="font-extrabold text-[#172B50]">{child.coachName || 'Assigned Coach'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[#172B500C]">
                      <span className="text-[#172B50]/70 font-semibold">Attendance Turnout:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-emerald-700">{child.attendanceRate}%</span>
                        <div className="w-16 h-1.5 bg-[#172B5010] rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${child.attendanceRate}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[#172B500C]">
                      <span className="text-[#172B50]/70 font-semibold">Tuition Status:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10.5px]">
                        {child.feeStatus || 'Paid & Verified'}
                      </span>
                    </div>
                    <div className="p-3 bg-[#FFF4E8] rounded-2xl border border-[#172B5015] mt-2">
                      <span className="font-bold text-[#172B50] text-[11px] block mb-0.5">Medical &amp; Physical Fitness:</span>
                      <span className="text-[11px] text-[#172B50]/80">{child.medicalNote || 'Fit for full athletic drills'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-[#172B5010]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedScheduleChildId(child.id);
                      setCurrentView('classes');
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#172B50] text-white hover:bg-[#F4510B] transition-colors cursor-pointer"
                  >
                    View Timetable
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCompChildId(child.id);
                      setCurrentView('attendance_compensation');
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30] hover:bg-[#F4510B] hover:text-white transition-colors cursor-pointer"
                  >
                    Attendance &amp; Compensation
                  </button>
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
          </div>

          {/* Top 4 KPI Cards matching Admin ProgramsClassesModule */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-[#FFF4E8] border border-[#F4510B25] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B18] text-[#F4510B] flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Weekly Sessions</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {visibleChildSessions.length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0FDF4] border border-[#16A34A20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#16A34A18] text-[#16A34A] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Enrolled Programs</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {new Set(myChildren.map(c => c.program)).size}
                </div>
              </div>
            </div>

            <div className="bg-[#F0F7FF] border border-[#0284C720] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#0284C718] text-[#0284C7] flex items-center justify-center shrink-0">
                <UserCheck2 className="w-4 h-4 text-[#0284C7]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Assigned Coaches</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {new Set(myChildren.map(c => c.coachName)).size}
                </div>
              </div>
            </div>

            <div className="bg-[#FFF9F5] border border-[#F4510B20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B15] text-[#F4510B] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Training Centers</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {new Set(myChildren.map(c => c.center)).size}
                </div>
              </div>
            </div>
          </div>

          <div>

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

          {/* Top 4 KPI Cards matching Admin Attendance & Compensation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-[#FFF4E8] border border-[#F4510B25] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B18] text-[#F4510B] flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Total Marked Sessions</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {myAttendanceRecords.length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0FDF4] border border-[#16A34A20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#16A34A18] text-[#16A34A] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Present Attendance</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {myAttendanceRecords.filter(r => r.status === 'Present').length}
                </div>
              </div>
            </div>

            <div className="bg-[#FFF1F2] border border-[#F43F5E20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F43F5E18] text-[#F43F5E] flex items-center justify-center shrink-0">
                <CalendarX className="w-4 h-4 text-[#F43F5E]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Missed Sessions (Absent)</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {myAttendanceRecords.filter(r => r.status === 'Absent').length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0F7FF] border border-[#0284C720] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#0284C718] text-[#0284C7] flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 text-[#0284C7]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Compensation Requests</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {parentCompRequests.length}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-view Navigation matching Admin Module Tab Switcher */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-[#172B5018] shadow-2xs self-start w-fit">
            <button
              type="button"
              onClick={() => setParentAttSubTab('attendance')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                parentAttSubTab === 'attendance'
                  ? 'bg-[#F4510B] text-white shadow-xs'
                  : 'text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B]'
              }`}
            >
              Daily Attendance Register
            </button>
            <button
              type="button"
              onClick={() => setParentAttSubTab('compensation')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                parentAttSubTab === 'compensation'
                  ? 'bg-[#F4510B] text-white shadow-xs'
                  : 'text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B]'
              }`}
            >
              Compensation Requests ({parentCompRequests.length})
            </button>
          </div>

          {/* 1. Absence Alerts (Prominent Notification when child is marked Absent by coach) */}
          {myAttendanceRecords.some(r => r.status === 'Absent') && (
            <div className="space-y-3">
              {myAttendanceRecords.filter(r => r.status === 'Absent').map(abs => {
                const hasCompReq = parentCompRequests.some(
                  r => r.studentId === abs.studentId && r.missedDate === abs.date
                );
                return (
                  <div 
                    key={abs.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#FFF4E8] border border-[#F4510B30] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F4510B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <CalendarX className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#172B50]">
                          Absence Notice: Your child {abs.studentName} was absent on {abs.date}.
                        </h4>
                        <p className="text-xs text-[#172B50] opacity-80 mt-1">
                          Location: <strong>{abs.location}</strong> • Program: <strong>{abs.program}</strong> • Class: <strong>{abs.batchName || 'Assigned Session'}</strong>.
                          {hasCompReq ? ' A compensation request has already been logged with Admin.' : ' You may submit an authorized compensation request for this session.'}
                        </p>
                      </div>
                    </div>
                    {!hasCompReq && (
                      <button
                        type="button"
                        onClick={() => {
                          setCompChildId(abs.studentId);
                          setMissedDate(abs.date);
                          setCompMissedSession(abs.batchName || `${abs.program} Session`);
                          setCompProgram(abs.program || '');
                          setIsCompModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-[#F4510B] text-white hover:bg-[#E04505] transition-all shadow-xs shrink-0 cursor-pointer self-start sm:self-auto"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Request Compensation</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB CONTENT: ATTENDANCE REGISTER */}
          {parentAttSubTab === 'attendance' && (
            <>
              {/* 2. Attendance Register Summary & Progress */}
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

              {/* 3. Daily Attendance Calendar (Present = Green, Absent = Red, Not Marked = Grey) */}
              <div className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#172B5012]">
                  <div>
                    <h3 className="text-sm font-black text-[#172B50]">
                      Daily Attendance Calendar (November 2026)
                    </h3>
                    <p className="text-xs text-[#172B50] opacity-70">
                      Read-only attendance records synchronized live from coach session check-ins
                    </p>
                  </div>

                  {/* Status Color Legend */}
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                      <span className="text-emerald-700">Present (Green)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                      <span className="text-rose-700">Absent (Red)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300 inline-block" />
                      <span className="text-slate-600">Not Marked (Grey)</span>
                    </div>
                  </div>
                </div>

                {/* Calendar Grid: 30 days of November 2026 */}
                <div className="grid grid-cols-7 gap-2 text-center">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <span key={d} className="text-[11px] font-black text-[#172B50] uppercase tracking-wider py-1">
                      {d}
                    </span>
                  ))}

                  {Array.from({ length: 30 }, (_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `2026-11-${String(dayNum).padStart(2, '0')}`;
                    const dayRecords = myAttendanceRecords.filter(r => r.date === dateStr);
                    const hasPresent = dayRecords.some(r => r.status === 'Present');
                    const hasAbsent = dayRecords.some(r => r.status === 'Absent');

                    let badgeColor = 'bg-slate-50 text-slate-400 border border-slate-200/60';
                    let statusLabel = 'Not Marked';

                    if (hasAbsent) {
                      badgeColor = 'bg-rose-500 text-white font-black shadow-xs';
                      statusLabel = 'Absent';
                    } else if (hasPresent) {
                      badgeColor = 'bg-emerald-500 text-white font-black shadow-xs';
                      statusLabel = 'Present';
                    }

                    return (
                      <div
                        key={dateStr}
                        className="p-2 sm:p-2.5 rounded-xl border border-[#172B5010] flex flex-col items-center justify-between min-h-[64px] bg-white transition-all"
                      >
                        <span className="text-xs font-extrabold text-[#172B50]">
                          {dayNum}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1.5 block w-full truncate ${badgeColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Attendance History Table */}
              <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
                <div className="p-5 border-b border-[#172B5010] flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-[#172B50]">Daily Attendance History</h3>
                    <p className="text-xs text-[#172B50] opacity-70">Official session participation records for your linked child profiles</p>
                  </div>
                  <span className="text-xs font-bold text-[#172B50]/70">
                    {myAttendanceRecords.length} Total Logs
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFF4E8] text-[#172B50] font-black uppercase tracking-wider text-[11px] border-b border-[#172B501A]">
                      <tr>
                        <th className="px-5 py-3.5">Date</th>
                        <th className="px-4 py-3.5">Athlete</th>
                        <th className="px-4 py-3.5">Program &amp; Location</th>
                        <th className="px-4 py-3.5">Batch / Class</th>
                        <th className="px-4 py-3.5">Marked By Coach</th>
                        <th className="px-5 py-3.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#172B5010]">
                      {myAttendanceRecords.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-10 text-center text-xs text-[#172B50] opacity-65">
                            No session attendance logs recorded for your children yet.
                          </td>
                        </tr>
                      ) : (
                        myAttendanceRecords.map(rec => (
                          <tr key={rec.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                            <td className="px-5 py-3.5 font-bold text-[#172B50]">{rec.date}</td>
                            <td className="px-4 py-3.5 font-black text-[#172B50]">{rec.studentName}</td>
                            <td className="px-4 py-3.5">
                              <span className="font-bold text-[#172B50] block">{rec.program}</span>
                              <span className="text-[11px] font-bold text-[#F4510B] block">{rec.location}</span>
                            </td>
                            <td className="px-4 py-3.5 font-medium text-[#172B50]">{rec.batchName || 'Training Batch'}</td>
                            <td className="px-4 py-3.5 text-[#172B50] opacity-80">{rec.coachName || rec.markedBy || 'Coach'}</td>
                            <td className="px-5 py-3.5 text-right">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                rec.status === 'Present'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {rec.status}
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

          {/* TAB CONTENT: COMPENSATION REQUESTS */}
          {parentAttSubTab === 'compensation' && (
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
          )}
        </div>
      )}

      {/* 5. FEES & INDIVIDUAL CLASS PACKAGES (PARENT ISOLATED VIEW) */}
      {(currentView === 'fees_payments' || currentView === 'payments') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#F4510B]/10 text-[#F4510B] border border-[#F4510B]/20">
                  Individual 24-Class Quota
                </span>
                <span className="text-[11px] font-bold text-[#172B50]/50">• 3 Months Validity</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Class Packages &amp; Tuition Tracking
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Attendance-based class quota, package validity dates &amp; tuition fee records for your registered athletes
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedChildForPay(myChildren[0]?.name || '');
                  setIsPayModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-black bg-[#F4510B] text-white hover:brightness-110 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay / Renew Tuition</span>
              </button>
            </div>
          </div>

          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-[#FFF4E8] border border-[#F4510B25] rounded-2xl px-3.5 sm:px-4 py-3 flex items-center gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#F4510B18] text-[#F4510B] flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Registered Athletes</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {myChildren.length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0FDF4] border border-[#16A34A20] rounded-2xl px-3.5 sm:px-4 py-3 flex items-center gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#16A34A18] text-[#16A34A] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Active Packages</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {myChildrenPackages.filter(p => p.pkg.status === 'Active' || p.pkg.status === 'Reminder Due').length}
                </div>
              </div>
            </div>

            <div className="bg-[#F0F7FF] border border-[#0284C720] rounded-2xl px-3.5 sm:px-4 py-3 flex items-center gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-[#0284C718] text-[#0284C7] flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-4 h-4 text-[#0284C7]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Classes Attended</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {myChildrenPackages.reduce((sum, p) => sum + p.pkg.classesAttended, 0)}
                </div>
              </div>
            </div>

            <div className="bg-[#FAF5FF] border border-purple-200 rounded-2xl px-3.5 sm:px-4 py-3 flex items-center gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-purple-700" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Classes Remaining</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  {myChildrenPackages.reduce((sum, p) => sum + p.pkg.classesRemaining, 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Child Package Cards List */}
          <div className="space-y-5">
            {myChildrenPackages.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-dashed border-[#172B5020] text-center">
                <Users className="w-12 h-12 text-[#172B50]/20 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#172B50]">No Enrolled Athletes Found</h3>
                <p className="text-xs text-[#172B50]/60 mt-1 max-w-md mx-auto">
                  Once your child is confirmed and enrolled into a Little Spartans training batch, their individual 24-class package will be activated here automatically.
                </p>
              </div>
            ) : (
              myChildrenPackages.map(({ child, pkg }) => {
                const statusCfg = PACKAGE_STATUS_CONFIG[pkg.status] || PACKAGE_STATUS_CONFIG['Active'];
                const isReminderDue = pkg.status === 'Reminder Due' || (pkg.classesAttended >= 20 && pkg.classesAttended < 24);
                const isCompleted = pkg.status === 'Completed' || pkg.classesAttended >= 24;
                const isExpired = pkg.status === 'Expired';

                return (
                  <div
                    key={child.id}
                    className="bg-white rounded-3xl p-6 border border-[#172B501A] shadow-card hover:border-[#F4510B30] transition-all space-y-5"
                  >
                    {/* Athlete Profile & Status Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#172B5010]">
                      <div className="flex items-center gap-4">
                        <img
                          src={child.avatar}
                          alt={child.name}
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#F4510B] shadow-2xs"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-[#172B50]">{child.name}</h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#172B50] text-white">
                              {child.rank || 'Spartan'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#F4510B] mt-0.5">{child.program}</p>
                          <p className="text-[11px] text-[#172B50]/60 mt-0.5">
                            Athlete ID: <span className="font-mono font-bold text-[#172B50]">{child.id}</span> • Center: <span className="font-bold text-[#172B50]">{child.center}</span> • Coach: <span className="font-bold text-[#172B50]">{child.coachName || 'Assigned'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${statusCfg.badge}`}>
                          Package: {pkg.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          child.feeStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : child.feeStatus === 'Unpaid'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          Fee Status: {child.feeStatus || 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* 3-Month Validity & 24-Class Quota Breakdown Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Validity Period Box */}
                      <div className="p-4 rounded-2xl bg-[#FFF9F5] border border-[#F4510B18] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#F4510B]">
                            Package Validity
                          </span>
                          <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-md text-[#172B50] border border-[#172B5010]">
                            3 Months Duration
                          </span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-[#172B50]/70 font-semibold">Activation Date:</span>
                            <span className="font-black text-[#172B50]">{pkg.activationDate || 'Pending'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#172B50]/70 font-semibold">Expiry Date:</span>
                            <span className="font-black text-[#172B50]">{pkg.expiryDate || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-[#F4510B15]">
                            <span className="text-[#172B50]/70 font-semibold">Cycle:</span>
                            <span className="font-black text-[#F4510B]">Cycle #{pkg.packageCycle || 1}</span>
                          </div>
                        </div>
                      </div>

                      {/* Class Usage Quota Box */}
                      <div className="p-4 rounded-2xl bg-[#F4FAFF] border border-[#0B3B60]/15 space-y-2 md:col-span-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B3B60]">
                            24-Class Quota Consumption
                          </span>
                          <span className="text-xs font-black text-[#172B50]">
                            {pkg.classesAttended} / 24 Classes Attended ({pkg.classesRemaining} Left)
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3.5 rounded-full bg-white overflow-hidden p-0.5 border border-[#0B3B60]/20">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted
                                ? 'bg-gradient-to-r from-indigo-500 to-indigo-700'
                                : isReminderDue
                                ? 'bg-gradient-to-r from-amber-500 to-[#F4510B]'
                                : isExpired
                                ? 'bg-gradient-to-r from-rose-400 to-rose-600'
                                : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                            }`}
                            style={{ width: `${pkg.percentage}%` }}
                          />
                        </div>

                        {/* Consumption stats summary */}
                        <div className="flex flex-wrap items-center justify-between text-[11px] font-semibold text-[#172B50]/70 pt-1">
                          <span className="text-emerald-700 font-bold">
                            ✓ {pkg.attendanceBreakdown.filter(a => a.status === 'Present').length} Present (Deducted)
                          </span>
                          <span>•</span>
                          <span className="text-rose-700">
                            ✕ {pkg.attendanceBreakdown.filter(a => a.status === 'Absent').length} Absent (No deduction)
                          </span>
                          <span>•</span>
                          <span className="text-sky-700">
                            ★ {pkg.attendanceBreakdown.filter(a => a.isDemo).length} Demo (No deduction)
                          </span>
                          <span>•</span>
                          <span className="font-black text-[#172B50]">
                            {pkg.percentage}% Consumed
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Alert Notifications */}
                    {isReminderDue && (
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-black text-amber-900">
                            Package Renewal Reminder (20 of 24 Classes Attended)
                          </h4>
                          <p className="text-xs text-amber-800 mt-0.5">
                            {child.name} has attended {pkg.classesAttended} classes with only {pkg.classesRemaining} remaining. Package validity ends on {pkg.expiryDate}. Please renew the package to avoid any training stoppage.
                          </p>
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-black text-indigo-900">
                            Package Completed (24 / 24 Classes Attended) • Renewal Due
                          </h4>
                          <p className="text-xs text-indigo-800 mt-0.5">
                            Congratulations! {child.name} has completed the full 24-class training quota. Package renewal is now due for the next 3-month cycle.
                          </p>
                        </div>
                      </div>
                    )}

                    {isExpired && (
                      <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-black text-rose-900">
                            Package Expired (3-Month Validity Ended)
                          </h4>
                          <p className="text-xs text-rose-800 mt-0.5">
                            This package reached its 3-month expiration date on {pkg.expiryDate}. Please contact the academy desk to activate a new package.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Attendance Audit Log Table for this child */}
                    <div className="rounded-2xl border border-[#172B5012] overflow-hidden">
                      <div className="p-3.5 bg-[#172B5005] border-b border-[#172B5010] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="w-4 h-4 text-[#F4510B]" />
                          <h4 className="text-xs font-black text-[#172B50]">
                            Verified Attendance &amp; Quota Deductions ({pkg.attendanceBreakdown.length} Records)
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold text-[#172B50]/60">
                          Independent Student Tracking
                        </span>
                      </div>

                      {pkg.attendanceBreakdown.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#172B50]/60">
                          No attendance records entered for this package yet. Once coaches verify check-ins, sessions will show here.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 border-b border-[#172B5010] text-[10px] font-black uppercase text-[#172B50]/60 tracking-wider">
                                <th className="py-2.5 px-4">DATE</th>
                                <th className="py-2.5 px-3">BATCH / SESSION</th>
                                <th className="py-2.5 px-3">LOCATION</th>
                                <th className="py-2.5 px-3">ATTENDANCE</th>
                                <th className="py-2.5 px-3">QUOTA IMPACT</th>
                                <th className="py-2.5 px-4 text-right">COACH</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#172B500A]">
                              {pkg.attendanceBreakdown.slice(0, 5).map((rec, idx) => (
                                <tr key={rec.id || idx} className="hover:bg-[#FFF4E8]/20 transition-colors">
                                  <td className="py-2.5 px-4 font-bold text-[#172B50]">
                                    {rec.date}
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-[#172B50]">
                                    {rec.className || rec.batchId || child.program}
                                  </td>
                                  <td className="py-2.5 px-3 text-[#172B50]/70 text-[11px]">
                                    {rec.center || rec.location || child.center}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                      rec.status === 'Present'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}>
                                      {rec.status}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className={`text-[11px] font-black ${
                                      rec.status === 'Present'
                                        ? 'text-emerald-700'
                                        : 'text-[#172B50]/50'
                                    }`}>
                                      {rec.status === 'Present' ? '-1 Class Deducted' : '0 (No Deduction)'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-semibold text-[#172B50]/80 text-[11px]">
                                    {rec.markedBy || child.coachName || 'Spartan Coach'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div className="p-3 bg-slate-50 border-t border-[#172B500E] flex items-center justify-between">
                        <span className="text-[11px] text-[#172B50]/70 font-semibold">
                          Showing recent sessions. Click full audit log to see every class date.
                        </span>
                        <button
                          type="button"
                          onClick={() => setPackageHistoryChild(child)}
                          className="text-xs font-black text-[#F4510B] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Complete Audit History</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] text-[#172B50]/60">
                        Package ID: <span className="font-mono font-bold text-[#172B50]">{child.id}-PKG-{child.packageCycle || 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPackageHistoryChild(child)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white border border-[#172B5018] text-[#172B50] hover:bg-[#FFF4E8] transition-colors cursor-pointer"
                        >
                          Audit Attendance
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedChildForPay(child.name);
                            setIsPayModalOpen(true);
                          }}
                          className="px-4 py-1.5 rounded-xl text-xs font-black bg-[#F4510B] text-white hover:brightness-110 shadow-xs transition-all cursor-pointer"
                        >
                          Pay / Renew Tuition
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Payment Receipts & Tuition Records */}
          <div className="bg-white rounded-3xl p-6 border border-[#172B501A] shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-[#172B5010] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0B3B60]/10 text-[#0B3B60] flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#172B50]">
                    Tuition Invoices &amp; Payment Receipts
                  </h3>
                  <p className="text-[11px] text-[#172B50]/60">
                    Official financial statements and payment receipts for your children
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedChildForPay(myChildren[0]?.name || '');
                  setIsPayModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#172B50] text-white hover:bg-[#F4510B] transition-colors cursor-pointer"
              >
                + Make Payment
              </button>
            </div>

            {(() => {
              const childNames = myChildren.map(c => c.name.toLowerCase());
              const parentPayments = (data.payments || []).filter(p => 
                (p.studentName && childNames.includes(p.studentName.toLowerCase())) ||
                (p.parentName && parentProfile.name && p.parentName.toLowerCase() === parentProfile.name.toLowerCase())
              );

              if (parentPayments.length === 0) {
                return (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-[#172B5015]">
                    <Receipt className="w-10 h-10 text-[#172B50]/20 mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#172B50]">No Payment Receipts Found</p>
                    <p className="text-[11px] text-[#172B50]/50 mt-0.5">
                      Receipts will be generated here upon completing online tuition or manual desk payments.
                    </p>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#172B5010] text-[10px] font-black uppercase text-[#172B50]/50 tracking-wider">
                        <th className="pb-2.5 px-3">INVOICE #</th>
                        <th className="pb-2.5 px-3">DATE</th>
                        <th className="pb-2.5 px-3">ATHLETE</th>
                        <th className="pb-2.5 px-3">AMOUNT</th>
                        <th className="pb-2.5 px-3">METHOD</th>
                        <th className="pb-2.5 px-3">STATUS</th>
                        <th className="pb-2.5 px-3 text-right">RECEIPT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#172B5008]">
                      {parentPayments.map((pay, i) => (
                        <tr key={pay.id || i} className="hover:bg-[#FFF4E8]/20 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-[#172B50]">
                            {pay.id || `INV-${202600 + i}`}
                          </td>
                          <td className="py-3 px-3 font-semibold text-[#172B50]/70">
                            {pay.date || todayYmd}
                          </td>
                          <td className="py-3 px-3 font-black text-[#F4510B]">
                            {pay.studentName || myChildren[0]?.name}
                          </td>
                          <td className="py-3 px-3 font-black text-[#172B50]">
                            ₹{pay.amount ? Number(pay.amount).toLocaleString('en-IN') : '4,500'}
                          </td>
                          <td className="py-3 px-3 text-[#172B50]/70 text-[11px]">
                            {pay.method || 'Online UPI'}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                              {pay.status || 'Paid'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => addToast(`Receipt #${pay.id || 'INV'} downloaded successfully`, 'success')}
                              className="text-xs font-bold text-[#0B3B60] hover:underline cursor-pointer"
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 6. PROGRESS & ACHIEVEMENTS */}
      {currentView === 'progress' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Spartan Progress &amp; Belt Milestones
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Official athletic skills assessments, obstacle course ratings, and promotion milestones
              </p>
            </div>
          </div>

          {/* Top 4 KPI Cards matching Admin Certificates / Progress */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-[#FFF4E8] border border-[#F4510B25] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B18] text-[#F4510B] flex items-center justify-center shrink-0">
                <Medal className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Current Belt Rank</div>
                <div className="text-base sm:text-lg font-black text-[#172B50] leading-none tracking-tight mt-0.5 truncate">
                  {myChildren[0]?.rank || 'Spartan'}
                </div>
              </div>
            </div>

            <div className="bg-[#F0FDF4] border border-[#16A34A20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#16A34A18] text-[#16A34A] flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Skills Assessed</div>
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
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Performance Index</div>
                <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  9.1 / 10
                </div>
              </div>
            </div>

            <div className="bg-[#FFF9F5] border border-[#F4510B20] rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F4510B15] text-[#F4510B] flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#172B50]/70 whitespace-nowrap">Academy Standing</div>
                <div className="text-base sm:text-lg font-black text-[#172B50] leading-none tracking-tight mt-0.5">
                  Level 3 Advanced
                </div>
              </div>
            </div>
          </div>

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
      {(currentView === 'competitions' || currentView === 'sports_events') && (
        <SportsEventsModule />
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
              <label className="text-xs font-bold text-[#172B50] block mb-1">Batches</label>
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

      {/* 5. INDIVIDUAL STUDENT PACKAGE ATTENDANCE AUDIT MODAL */}
      <Modal
        isOpen={Boolean(packageHistoryChild)}
        onClose={() => setPackageHistoryChild(null)}
        title={packageHistoryChild ? `Attendance & Package Audit — ${packageHistoryChild.name}` : 'Package Audit'}
      >
        {packageHistoryChild && (() => {
          const pkgInfo = computeStudentPackage(packageHistoryChild, data.attendanceRecords || [], todayYmd);
          const statusCfg = PACKAGE_STATUS_CONFIG[pkgInfo.status] || PACKAGE_STATUS_CONFIG['Active'];

          return (
            <div className="space-y-4">
              {/* Athlete & Package Header */}
              <div className="p-4 rounded-2xl bg-[#FFF9F5] border border-[#F4510B15] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={packageHistoryChild.avatar}
                    alt={packageHistoryChild.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#F4510B]"
                  />
                  <div>
                    <h3 className="text-base font-black text-[#172B50]">{packageHistoryChild.name}</h3>
                    <p className="text-xs font-bold text-[#F4510B]">{packageHistoryChild.program}</p>
                    <p className="text-[11px] text-[#172B50]/60">
                      ID: <span className="font-mono font-bold text-[#172B50]">{packageHistoryChild.id}</span> • {packageHistoryChild.center}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusCfg.badge}`}>
                    {pkgInfo.status}
                  </span>
                  <span className="text-[11px] font-bold text-[#172B50]/70">
                    Cycle #{pkgInfo.packageCycle || 1}
                  </span>
                </div>
              </div>

              {/* 4 Summary Stat Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-[#172B5010]">
                  <span className="text-[10px] font-bold uppercase text-[#172B50]/60 block">Total Quota</span>
                  <span className="text-base font-black text-[#172B50] mt-0.5 block">24 Classes</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">Attended</span>
                  <span className="text-base font-black text-emerald-700 mt-0.5 block">{pkgInfo.classesAttended}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] font-bold uppercase text-amber-800 block">Remaining</span>
                  <span className="text-base font-black text-amber-700 mt-0.5 block">{pkgInfo.classesRemaining}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200">
                  <span className="text-[10px] font-bold uppercase text-sky-800 block">Valid Until</span>
                  <span className="text-xs font-black text-sky-800 mt-1 block truncate">{pkgInfo.expiryDate || 'N/A'}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#172B50]">
                  <span>Package Usage: {pkgInfo.classesAttended} / 24</span>
                  <span>{pkgInfo.percentage}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#172B5010] overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#F4510B]"
                    style={{ width: `${pkgInfo.percentage}%` }}
                  />
                </div>
              </div>

              {/* Business Rule Explanation */}
              <div className="p-3 rounded-xl bg-[#F4FAFF] border border-[#0B3B60]/15 text-xs text-[#0B3B60] flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Quota Policy:</strong> Only confirmed regular <strong>&quot;Present&quot;</strong> check-ins deduct 1 class from your 24-class package balance. Trial demos, absences, and holidays are <em>never</em> deducted.
                </p>
              </div>

              {/* Table of Records */}
              <div className="border border-[#172B5012] rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-[#FFF9F5] border-b border-[#172B5010] text-[10px] font-black uppercase text-[#172B50]/60">
                    <tr>
                      <th className="py-2.5 px-3">DATE</th>
                      <th className="py-2.5 px-3">BATCH</th>
                      <th className="py-2.5 px-3">STATUS</th>
                      <th className="py-2.5 px-3">QUOTA IMPACT</th>
                      <th className="py-2.5 px-3 text-right">COACH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#172B500A]">
                    {pkgInfo.attendanceBreakdown.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-xs text-[#172B50]/50">
                          No attendance records entered for this student yet.
                        </td>
                      </tr>
                    ) : (
                      pkgInfo.attendanceBreakdown.map((rec, i) => (
                        <tr key={rec.id || i} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-[#172B50]">{rec.date}</td>
                          <td className="py-2.5 px-3 text-[#172B50]/80">{rec.className || rec.batchId || packageHistoryChild.program}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              rec.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold">
                            {rec.status === 'Present' ? (
                              <span className="text-emerald-700">-1 Class Deducted</span>
                            ) : (
                              <span className="text-slate-400">0 (No deduction)</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#172B50]/70 text-[11px]">
                            {rec.markedBy || packageHistoryChild.coachName || 'Coach'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Close Button */}
              <div className="pt-3 border-t border-[#172B5010] flex justify-end">
                <button
                  type="button"
                  onClick={() => setPackageHistoryChild(null)}
                  className="px-5 py-2 text-xs font-bold bg-[#172B50] text-white rounded-xl hover:bg-[#F4510B] transition-colors cursor-pointer"
                >
                  Close Audit Log
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

    </div>
  );
}
