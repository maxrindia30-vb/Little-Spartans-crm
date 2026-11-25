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
  CalendarCheck,
  Scale,
  Target,
  Headphones,
  Package,
  Image,
  Megaphone,
  ChevronDown,
  Smartphone
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
import ProgramsAchievementsModule from './ProgramsAchievementsModule';
import ParentAttendanceModule from './ParentAttendanceModule';

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
    addToast,
    toggleIphoneView
  } = useCrm();

  // Current logged in parent profile
  const parentProfile = data.parents[0] || { id: '', name: 'Parent', email: '' };
  const myChildren = useMemo(() => {
    if (parentProfile?.id) {
      const filtered = (data.students || []).filter(s => 
        s.id === parentProfile.id ||
        s.parentId === parentProfile.id ||
        (parentProfile.email && s.parentEmail && s.parentEmail.toLowerCase() === parentProfile.email.toLowerCase()) ||
        (parentProfile.phone && s.parentPhone && s.parentPhone === parentProfile.phone) ||
        (parentProfile.name && s.parentName && s.parentName.toLowerCase().trim() === parentProfile.name.toLowerCase().trim())
      );
      if (filtered.length > 0) return filtered;
    }
    return [];
  }, [parentProfile, data.students]);

  // Selected child state for multi-child support
  const [selectedChildId, setSelectedChildId] = useState('');
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Active selected child
  const activeChild = useMemo(() => {
    if (!myChildren || myChildren.length === 0) return null;
    return myChildren.find(c => c.id === selectedChildId) || myChildren[0];
  }, [myChildren, selectedChildId]);

  // Harmonized Display Parent ID
  const parentDisplayId = useMemo(() => {
    if (parentProfile?.id && parentProfile.id.trim()) return parentProfile.id;
    if (activeChild?.parentId && activeChild.parentId.trim()) return activeChild.parentId;
    if (activeChild?.id && activeChild.id.trim()) return activeChild.id;
    return '—';
  }, [parentProfile, activeChild]);

  // Keep commonMemberId for backward compatibility in subviews
  const commonMemberId = parentDisplayId !== '—' ? parentDisplayId : '';

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

  // Active child package calculation
  const activeChildPkg = useMemo(() => {
    if (!activeChild) return null;
    return computeStudentPackage(activeChild, data.attendanceRecords || [], todayYmd);
  }, [activeChild, data.attendanceRecords, todayYmd]);

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

  // Active Child Derived Session & Attendance Data
  const activeChildSessions = useMemo(() => {
    if (!activeChild) return [];
    return synchronizedChildSessions.filter(s => s.childId === activeChild.id);
  }, [activeChild, synchronizedChildSessions]);

  const upcomingSession = useMemo(() => {
    if (!activeChild) return null;
    return activeChildSessions.find(s => s.status !== 'Cancelled' && s.status !== 'Completed' && (!s.date || s.date >= todayYmd)) || null;
  }, [activeChild, activeChildSessions, todayYmd]);

  const lastCompletedSession = useMemo(() => {
    if (!activeChild) return null;
    const completedOrPast = activeChildSessions.filter(s => (s.status === 'Completed' || (s.date && s.date < todayYmd)) && s.status !== 'Cancelled');
    return completedOrPast[completedOrPast.length - 1] || null;
  }, [activeChild, activeChildSessions, todayYmd]);

  const activeChildAttendance = useMemo(() => {
    if (!activeChild) return [];
    return (data.attendanceRecords || []).filter(r => r.studentId === activeChild.id);
  }, [activeChild, data.attendanceRecords]);

  const attendancePercentage = useMemo(() => {
    if (!activeChild || activeChildAttendance.length === 0) return null;
    const present = activeChildAttendance.filter(r => r.status === 'Present').length;
    return Math.round((present / activeChildAttendance.length) * 100);
  }, [activeChild, activeChildAttendance]);

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
      
      {/* 1. MASTER TOP HEADER (Parent Portal Empty-State & Dynamic Reference) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {/* Left: Heading & Subtitle */}
        <div className="text-left space-y-1">
          <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-black text-[#172B50] tracking-tight flex items-center gap-2">
            <span>Good Morning, Parent!</span>
            <span className="inline-block transform origin-bottom hover:rotate-12 transition-transform cursor-default select-none">👋</span>
          </h1>
          <p className="text-xs sm:text-[13px] font-bold text-[#172B50]/65 tracking-tight text-left flex items-center gap-2">
            <span>Dashboard</span>
            <span>•</span>
            <span className="font-bold text-[#172B50]/65">
              Parent ID: <span className="font-mono text-[#F4510B]">{parentDisplayId}</span>
            </span>
          </p>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 self-start sm:self-center shrink-0">
          {/* Child Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsChildDropdownOpen(!isChildDropdownOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#172B50]/15 shadow-2xs hover:bg-[#FFF4E8] hover:border-[#F4510B]/30 transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#FFE8D6] flex items-center justify-center text-[#F4510B] shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[#172B50] max-w-[120px] truncate">
                {activeChild ? activeChild.name : 'Select Child'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/60 shrink-0" />
            </button>

            {isChildDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase text-[#172B50]/50 tracking-wider">
                  Select Athlete
                </div>
                {myChildren.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-[#172B50]/60 italic">
                    No linked children profiles found.
                  </div>
                ) : (
                  myChildren.map(child => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => {
                        setSelectedChildId(child.id);
                        setIsChildDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-[#FFF4E8] transition-colors cursor-pointer ${
                        activeChild?.id === child.id ? 'font-black text-[#F4510B] bg-[#FFF8F2]' : 'font-bold text-[#172B50]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-5 h-5 rounded-full bg-[#FFE8D6] text-[#F4510B] flex items-center justify-center text-[10px] font-bold shrink-0">
                          {child.name.charAt(0)}
                        </div>
                        <span className="truncate">{child.name}</span>
                      </div>
                      {activeChild?.id === child.id && (
                        <Check className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* iPhone 18 Pro Max View Toggle */}
          <button
            type="button"
            onClick={() => toggleIphoneView && toggleIphoneView(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-900 to-[#172B50] hover:from-[#F4510B] hover:to-[#d83f05] text-white text-xs font-black transition-all cursor-pointer shadow-2xs border border-slate-700 hover:border-[#F4510B]"
            title="Switch to iPhone 18 Pro Max Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#F4510B]" />
            <span>iPhone 18 Pro Max</span>
          </button>

          {/* Search Button */}
          <button
            type="button"
            onClick={() => addToast('Search classes, coaches & records', 'info')}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B50]/15 shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B]/40 transition-all cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4 text-[#172B50]" />
          </button>

          {/* Notification Button */}
          <button
            type="button"
            onClick={() => setCurrentView('communication')}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B50]/15 shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B]/40 transition-all cursor-pointer relative"
            title="Academy Notifications"
          >
            <Bell className="w-4 h-4 text-[#172B50]" />
            {(data.announcements || []).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#F4510B] absolute top-2 right-2 ring-1 ring-white" />
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-[#E2E8F0] border border-[#172B50]/15 shadow-2xs flex items-center justify-center text-[#64748B] hover:ring-2 hover:ring-[#F4510B]/40 transition-all cursor-pointer overflow-hidden"
              title="Parent Profile"
            >
              {parentProfile?.avatar ? (
                <img src={parentProfile.avatar} alt="Parent Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-[#64748B]" />
              )}
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-gray-50">
                  <p className="text-xs font-black text-[#172B50] truncate">{parentProfile?.name || 'Spartan Parent'}</p>
                  <p className="text-[11px] text-[#172B50]/60 truncate">{parentProfile?.email || 'parent@littlespartans.com'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('children');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Athlete Profiles</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('fees_payments');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Tuition & Billing</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. PARENT DASHBOARD MAIN VIEW */}
      {currentView === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start animate-slide-up">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: HERO, JOURNEY, HIGHLIGHTS, STATS, PACKAGE  */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* 1. Hero Banner: THIS QUARTER'S ADVENTURE */}
            <div className="bg-[#FFF4E8] rounded-3xl p-6 sm:p-7 border border-[#FEE6D6] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
              <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-[#FFEAD8] opacity-50 pointer-events-none" />

              <div className="relative z-10 space-y-2 text-left max-w-md">
                <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#F4510B]">
                  THIS QUARTER'S ADVENTURE
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight leading-tight">
                  {activeChild?.program ? `${activeChild.name}'s Adventure!` : "Start Your Child's Journey!"}
                </h2>
                <p className="text-xs sm:text-sm text-[#172B50]/75 leading-relaxed">
                  {activeChild?.program 
                    ? `Enrolled in ${activeChild.program}. Track growth, skills and progress.` 
                    : "Enroll in a program to track growth, skills and progress."}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentView('classes')}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#F4510B] text-white text-xs font-bold hover:bg-[#e04505] transition-all shadow-xs cursor-pointer"
                  >
                    <span>Browse Programs</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Children Sports Illustration matching screenshot */}
              <div className="relative z-10 shrink-0 w-full max-w-[280px] sm:max-w-[320px] h-[140px] flex items-center justify-center">
                <svg viewBox="0 0 320 160" className="w-full h-full" fill="none">
                  {/* Soft warm ground shadow / sand ellipse */}
                  <ellipse cx="160" cy="135" rx="140" ry="20" fill="#FCE9D8" />
                  
                  {/* Agility Ladder */}
                  <g transform="translate(100, 118) rotate(-12)">
                    <line x1="0" y1="0" x2="84" y2="0" stroke="#3B82F6" strokeWidth="2.5" />
                    <line x1="0" y1="14" x2="84" y2="14" stroke="#3B82F6" strokeWidth="2.5" />
                    <line x1="12" y1="0" x2="12" y2="14" stroke="#F59E0B" strokeWidth="2" />
                    <line x1="28" y1="0" x2="28" y2="14" stroke="#F59E0B" strokeWidth="2" />
                    <line x1="44" y1="0" x2="44" y2="14" stroke="#F59E0B" strokeWidth="2" />
                    <line x1="60" y1="0" x2="60" y2="14" stroke="#F59E0B" strokeWidth="2" />
                    <line x1="76" y1="0" x2="76" y2="14" stroke="#F59E0B" strokeWidth="2" />
                  </g>

                  {/* Training Cones (Yellow/Orange) */}
                  <path d="M88 138L95 120L102 138H88Z" fill="#FBBF24" />
                  <ellipse cx="95" cy="138" rx="7" ry="2" fill="#F59E0B" />
                  <path d="M185 140L191 124L197 140H185Z" fill="#FBBF24" />
                  <ellipse cx="191" cy="140" rx="6" ry="2" fill="#F59E0B" />

                  {/* Boy Jumping (Left) */}
                  <g transform="translate(110, 26)">
                    <ellipse cx="25" cy="102" rx="14" ry="4" fill="#000000" fillOpacity="0.08" />
                    <circle cx="28" cy="20" r="11" fill="#FCD34D" />
                    <path d="M18 18C18 10 23 7 32 8C38 9 39 14 39 18C36 15 32 15 28 17C24 19 20 19 18 18Z" fill="#1E293B" />
                    <circle cx="26" cy="20" r="1.5" fill="#1E293B" />
                    <path d="M28 24C29 25 31 25 32 24" stroke="#1E293B" strokeWidth="1" strokeLinecap="round" />
                    <path d="M20 31L36 31L39 52L17 52L20 31Z" fill="#F4510B" />
                    <path d="M20 34L8 24L11 20L22 30" fill="#FCD34D" />
                    <path d="M36 34L48 26L50 30L38 38" fill="#FCD34D" />
                    <path d="M17 52L39 52L41 68L30 68L28 58L26 68L15 68L17 52Z" fill="#172B50" />
                    <path d="M18 68L12 85L20 88L24 73" fill="#FCD34D" />
                    <rect x="7" y="85" width="16" height="7" rx="3.5" fill="#2563EB" />
                    <path d="M35 68L44 80L38 85L31 71" fill="#FCD34D" />
                    <rect x="40" y="78" width="14" height="7" rx="3.5" fill="#2563EB" />
                  </g>

                  {/* Girl Running (Right) */}
                  <g transform="translate(195, 34)">
                    <ellipse cx="25" cy="94" rx="14" ry="4" fill="#000000" fillOpacity="0.08" />
                    <path d="M30 18C36 14 44 18 42 28C38 30 35 26 33 22" fill="#78350F" />
                    <circle cx="22" cy="18" r="10" fill="#FDE68A" />
                    <path d="M13 16C13 9 18 7 26 8C31 9 32 14 32 17C29 15 26 15 22 16C18 17 15 17 13 16Z" fill="#78350F" />
                    <circle cx="21" cy="18" r="1.5" fill="#1E293B" />
                    <path d="M22 22C23 23 25 23 26 22" stroke="#1E293B" strokeWidth="1" strokeLinecap="round" />
                    <path d="M15 28L29 28L32 48L12 48L15 28Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                    <path d="M15 30L6 40L9 43L18 34" fill="#FDE68A" />
                    <path d="M29 30L38 38L35 41L27 34" fill="#FDE68A" />
                    <path d="M12 48L32 48L33 63L24 63L22 54L20 63L11 63L12 48Z" fill="#172B50" />
                    <path d="M14 63L8 78L15 80L19 66" fill="#FDE68A" />
                    <rect x="5" y="77" width="13" height="6" rx="3" fill="#F4510B" />
                    <path d="M28 63L36 74L31 77L25 66" fill="#FDE68A" />
                    <rect x="33" y="73" width="13" height="6" rx="3" fill="#F4510B" />
                  </g>

                  {/* Soccer Ball (Far Right) */}
                  <g transform="translate(255, 118)">
                    <circle cx="10" cy="10" r="9" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1" />
                    <polygon points="10,6 13,8 12,11 8,11 7,8" fill="#1E293B" />
                    <path d="M10 6L10 2M13 8L17 7M12 11L14 15M8 11L6 15M7 8L3 7" stroke="#1E293B" strokeWidth="1" />
                  </g>
                </svg>
              </div>
            </div>

            {/* 2. My Child's Learning Journey */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-[#172B50] tracking-tight">
                  My Child's Learning Journey
                </h2>
                <button
                  type="button"
                  onClick={() => setCurrentView('progress')}
                  className="text-xs font-bold text-[#172B50] hover:text-[#F4510B] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Explore Progress</span>
                  <span>→</span>
                </button>
              </div>

              {/* 4 Skill Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
                {/* Card 1: Balance */}
                <div className="bg-[#EBF7F2] border border-[#10B981]/20 rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:border-[#10B981]/40 transition-all">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mb-2.5">
                      <Scale className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-[#172B50]">Balance</h3>
                    <p className="text-[11px] text-[#172B50]/55 mt-0.5">
                      {activeChild?.evaluations?.balance ? 'Coach Assessed' : 'No evaluation yet'}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-emerald-200/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: activeChild?.evaluations?.balance ? `${activeChild.evaluations.balance}%` : '0%' }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#172B50]/60 shrink-0">
                      {activeChild?.evaluations?.balance ? `${activeChild.evaluations.balance}%` : '— %'}
                    </span>
                  </div>
                </div>

                {/* Card 2: Jumping & Landing */}
                <div className="bg-[#FEF7EC] border border-[#F59E0B]/20 rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:border-[#F59E0B]/40 transition-all">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center mb-2.5">
                      <Activity className="w-4 h-4 text-amber-600" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-[#172B50]">Jumping & Landing</h3>
                    <p className="text-[11px] text-[#172B50]/55 mt-0.5">
                      {activeChild?.evaluations?.jumping ? 'Coach Assessed' : 'No evaluation yet'}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-amber-200/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: activeChild?.evaluations?.jumping ? `${activeChild.evaluations.jumping}%` : '0%' }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#172B50]/60 shrink-0">
                      {activeChild?.evaluations?.jumping ? `${activeChild.evaluations.jumping}%` : '— %'}
                    </span>
                  </div>
                </div>

                {/* Card 3: Throwing & Catching */}
                <div className="bg-[#F6F1FD] border border-[#8B5CF6]/20 rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:border-[#8B5CF6]/40 transition-all">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center mb-2.5">
                      <Target className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-[#172B50]">Throwing & Catching</h3>
                    <p className="text-[11px] text-[#172B50]/55 mt-0.5">
                      {activeChild?.evaluations?.throwing ? 'Coach Assessed' : 'No evaluation yet'}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-purple-200/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: activeChild?.evaluations?.throwing ? `${activeChild.evaluations.throwing}%` : '0%' }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#172B50]/60 shrink-0">
                      {activeChild?.evaluations?.throwing ? `${activeChild.evaluations.throwing}%` : '— %'}
                    </span>
                  </div>
                </div>

                {/* Card 4: Running */}
                <div className="bg-[#EEF8FD] border border-[#06B6D4]/20 rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:border-[#06B6D4]/40 transition-all">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-cyan-100/80 text-cyan-600 flex items-center justify-center mb-2.5">
                      <Zap className="w-4 h-4 text-cyan-600" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-[#172B50]">Running</h3>
                    <p className="text-[11px] text-[#172B50]/55 mt-0.5">
                      {activeChild?.evaluations?.running ? 'Coach Assessed' : 'No evaluation yet'}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-cyan-200/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500 rounded-full transition-all"
                        style={{ width: activeChild?.evaluations?.running ? `${activeChild.evaluations.running}%` : '0%' }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#172B50]/60 shrink-0">
                      {activeChild?.evaluations?.running ? `${activeChild.evaluations.running}%` : '— %'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Last Session Highlights */}
            <div className="bg-white rounded-2xl p-5 border border-[#172B50]/10 shadow-2xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-[#FFF0E6] text-[#F4510B] flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-[#F4510B]" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-[#172B50]">Last Session Highlights</h3>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3.5">
                  {/* Clipboard Illustration */}
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 48 48" className="w-11 h-11" fill="none">
                      <rect x="8" y="10" width="28" height="34" rx="4" fill="#8B5CF6" fillOpacity="0.15" />
                      <rect x="12" y="6" width="28" height="34" rx="4" fill="#A78BFA" fillOpacity="0.25" />
                      <rect x="14" y="8" width="24" height="30" rx="3" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="1.5" />
                      <rect x="21" y="5" width="10" height="6" rx="2" fill="#7C3AED" />
                      <path d="M19 16H31M19 21H31M19 26H27" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="35" cy="35" r="7" fill="#F4510B" />
                      <path d="M32 35L34 37L38 33" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-bold text-[#172B50]">
                      {lastCompletedSession 
                        ? `${lastCompletedSession.program || 'Session'} • ${lastCompletedSession.date}` 
                        : "No session highlights yet."}
                    </p>
                    <p className="text-[11px] sm:text-xs text-[#172B50]/60 mt-0.5">
                      {lastCompletedSession 
                        ? (lastCompletedSession.notes || "Great effort and agility shown during drills!") 
                        : "Once your child attends a class, you'll see the key takeaways here."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentView('classes')}
                  className="px-4 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-[#172B50] hover:bg-gray-50 transition-all flex items-center gap-1 self-start sm:self-center shrink-0 cursor-pointer"
                >
                  <span>View Session</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* 4. Small Steps. Measurable Growth. & Moments That Matter (Row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Small Steps Card */}
              <div className="bg-white rounded-2xl p-5 border border-[#172B50]/10 shadow-2xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-[#172B50]">
                    Small Steps. Measurable Growth.
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCurrentView('progress')}
                    className="text-[11px] font-bold text-[#172B50] hover:text-[#F4510B] flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View Full Report</span>
                    <span>→</span>
                  </button>
                </div>

                {/* 4 Stat Columns */}
                <div className="grid grid-cols-4 gap-2 pt-1 border-t border-gray-50">
                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#172B50]/70">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="truncate">Attendance</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-[#172B50] mt-1">
                      {attendancePercentage !== null ? `${attendancePercentage}%` : '— %'}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#172B50]/70">
                      <Layers className="w-3.5 h-3.5 text-amber-500" />
                      <span className="truncate">Sessions</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-[#172B50] mt-1">
                      {activeChildPkg?.attendedClasses ? activeChildPkg.attendedClasses : '—'}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#172B50]/70">
                      <Target className="w-3.5 h-3.5 text-purple-500" />
                      <span className="truncate">Skill Progress</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-[#172B50] mt-1">
                      {activeChild?.evaluations?.overall ? `${activeChild.evaluations.overall}%` : '—'}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#172B50]/70">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate">Milestones</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-[#172B50] mt-1">
                      {activeChild?.milestonesCount ? activeChild.milestonesCount : '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Moments That Matter Card */}
              <div className="bg-white rounded-2xl p-5 border border-[#172B50]/10 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#F4510B]" />
                  <h3 className="text-xs sm:text-sm font-black text-[#172B50]">
                    Moments That Matter
                  </h3>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  {/* Polaroid Photo Illustration */}
                  <div className="w-14 h-12 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 56 46" className="w-13 h-11" fill="none">
                      <rect x="4" y="6" width="34" height="34" rx="3" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" transform="rotate(-6 21 23)" />
                      <rect x="14" y="4" width="36" height="36" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                      <rect x="18" y="8" width="28" height="22" rx="2" fill="#E0F2FE" />
                      <circle cx="38" cy="14" r="3" fill="#FBBF24" />
                      <path d="M20 28L28 18L35 26L40 21L46 28H20Z" fill="#34D399" />
                    </svg>
                  </div>

                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-bold text-[#172B50]">No moments yet.</p>
                    <p className="text-[11px] text-[#172B50]/60 mt-0.5">
                      Exciting moments from your child's journey will appear here.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. My Child's Program & Package */}
            <div className="bg-white rounded-2xl p-5 border border-[#172B50]/10 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#F4510B]" />
                  <h3 className="text-sm sm:text-base font-black text-[#172B50]">
                    My Child's Program & Package
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView('classes')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <span>→</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Left Box (col 8) */}
                <div className="md:col-span-8 bg-[#FFFBF7] border border-orange-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {/* Open Box Illustration */}
                    <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
                        <path d="M12 24L24 17L36 24V38L24 45L12 38V24Z" fill="#F59E0B" />
                        <path d="M24 17L36 24L24 31L12 24L24 17Z" fill="#FBBF24" />
                        <path d="M24 31V45L36 38V24L24 31Z" fill="#D97706" />
                        <path d="M12 24L7 16L19 12L24 17L12 24Z" fill="#FDE68A" />
                        <path d="M36 24L41 16L29 12L24 17L36 24Z" fill="#FCD34D" />
                        <path d="M24 6V11M16 8L18 12M32 8L30 12" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>

                    <div className="text-left">
                      <p className="text-xs sm:text-sm font-bold text-[#172B50]">
                        {activeChild?.program ? activeChild.program : "No program enrolled yet."}
                      </p>
                      <p className="text-[11px] text-[#172B50]/60 mt-0.5">
                        {activeChild?.program 
                          ? `${activeChild.center} • ${activeChild.batchName || 'General Batch'}` 
                          : "Enroll in a program to see details, batch, validity and session progress."}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentView('classes')}
                    className="px-4 py-2 rounded-full bg-[#F4510B] text-white text-xs font-bold hover:bg-[#e04505] transition-all whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Explore Programs</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Right Semi-circle Gauge (col 4) */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-2">
                  <div className="relative w-36 h-20 flex items-center justify-center">
                    <svg viewBox="0 0 100 55" className="w-full h-full">
                      <path
                        d="M 12 50 A 38 38 0 0 1 88 50"
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      {activeChildPkg && activeChildPkg.totalClasses > 0 && (
                        <path
                          d="M 12 50 A 38 38 0 0 1 88 50"
                          fill="none"
                          stroke="#F4510B"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray="120"
                          strokeDashoffset={120 - (120 * (activeChildPkg.attendedClasses || 0)) / activeChildPkg.totalClasses}
                        />
                      )}
                    </svg>

                    <div className="absolute bottom-0 inset-x-0 text-center">
                      <div className="text-lg sm:text-xl font-black text-[#172B50] leading-none">
                        {activeChildPkg ? `${activeChildPkg.attendedClasses || 0} / ${activeChildPkg.totalClasses || 24}` : '— / —'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#172B50]/60 mt-1">
                    Sessions Completed
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: READY SET PLAY, QUICK HUB, GOOD TO KNOW   */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* 1. Ready, Set, Play! Card */}
            <div className="bg-white rounded-2xl p-5 border border-[#172B50]/10 shadow-2xs text-center flex flex-col justify-between space-y-4">
              <div className="text-left font-black text-sm sm:text-base text-[#172B50]">
                Ready, Set, Play!
              </div>

              <div className="py-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] flex items-center justify-center text-[#F4510B] mb-2.5 shadow-2xs">
                  <Calendar className="w-6 h-6 text-[#F4510B]" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-[#172B50]">
                  {upcomingSession ? upcomingSession.title || 'Next Spartan Class' : "No Upcoming Class"}
                </h4>
                <p className="text-xs text-[#172B50]/60 mt-1 max-w-[220px]">
                  {upcomingSession 
                    ? `${upcomingSession.day || upcomingSession.date} • ${upcomingSession.startTime || ''}` 
                    : "Your child doesn't have any scheduled class yet."}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentView('classes')}
                  className="flex-1 py-2 px-3 rounded-full bg-[#F4510B] text-white text-xs font-bold hover:bg-[#e04505] transition-all text-center cursor-pointer shadow-xs"
                >
                  Explore Programs →
                </button>
                <button
                  type="button"
                  onClick={() => openParentCompModal()}
                  className="flex-1 py-2 px-3 rounded-full border border-gray-200 text-[#172B50] text-xs font-bold hover:bg-gray-50 transition-all text-center cursor-pointer"
                >
                  Request Class
                </button>
              </div>
            </div>

            {/* 2. Parent Quick Hub */}
            <div className="bg-white rounded-2xl p-5 border border-[#172B50]/10 shadow-2xs space-y-3">
              <h3 className="font-black text-sm sm:text-base text-[#172B50]">
                Parent Quick Hub
              </h3>

              <div className="grid grid-cols-4 gap-2">
                {/* 1. Class Timetable */}
                <div
                  onClick={() => setCurrentView('classes')}
                  className="bg-[#FFF8F2] hover:bg-[#FFF1E6] hover:border-[#F4510B]/30 border border-transparent rounded-xl p-2 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all min-h-[72px]"
                >
                  <CalendarCheck className="w-5 h-5 text-[#F4510B]" />
                  <span className="text-[10px] font-bold text-[#172B50] leading-tight line-clamp-2">Class Timetable</span>
                </div>

                {/* 2. Attendance History */}
                <div
                  onClick={() => setCurrentView('attendance_compensation')}
                  className="bg-[#FFF8F2] hover:bg-[#FFF1E6] hover:border-[#F4510B]/30 border border-transparent rounded-xl p-2 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all min-h-[72px]"
                >
                  <ClipboardCheck className="w-5 h-5 text-[#F4510B]" />
                  <span className="text-[10px] font-bold text-[#172B50] leading-tight line-clamp-2">Attendance History</span>
                </div>

                {/* 3. Request Makeup */}
                <div
                  onClick={openParentCompModal}
                  className="bg-[#FFF8F2] hover:bg-[#FFF1E6] hover:border-[#F4510B]/30 border border-transparent rounded-xl p-2 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all min-h-[72px]"
                >
                  <RefreshCw className="w-5 h-5 text-[#F4510B]" />
                  <span className="text-[10px] font-bold text-[#172B50] leading-tight line-clamp-2">Request Makeup</span>
                </div>

                {/* 4. Apply Leave */}
                <div
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="bg-[#FFF8F2] hover:bg-[#FFF1E6] hover:border-[#F4510B]/30 border border-transparent rounded-xl p-2 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all min-h-[72px]"
                >
                  <CalendarOff className="w-5 h-5 text-[#F4510B]" />
                  <span className="text-[10px] font-bold text-[#172B50] leading-tight line-clamp-2">Apply Leave</span>
                </div>

                {/* 5. Coach Feedback */}
                <div
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="bg-[#FFF8F2] hover:bg-[#FFF1E6] hover:border-[#F4510B]/30 border border-transparent rounded-xl p-2 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all min-h-[72px]"
                >
                  <MessageSquare className="w-5 h-5 text-[#F4510B]" />
                  <span className="text-[10px] font-bold text-[#172B50] leading-tight line-clamp-2">Coach Feedback</span>
                </div>

                {/* 6. Program & Package */}
                <div
                  onClick={() => setCurrentView('classes')}
                  className="bg-[#FFF8F2] hover:bg-[#FFF1E6] hover:border-[#F4510B]/30 border border-transparent rounded-xl p-2 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all min-h-[72px]"
                >
                  <Package className="w-5 h-5 text-[#F4510B]" />
                  <span className="text-[10px] font-bold text-[#172B50] leading-tight line-clamp-2">Program & Package</span>
                </div>

                {/* 7. Fees & Payments */}
                <div
                  onClick={() => setCurrentView('fees_payments')}
                  className="bg-[#FFF8F2] hover:bg-[#FFF1E6] hover:border-[#F4510B]/30 border border-transparent rounded-xl p-2 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all min-h-[72px]"
                >
                  <CreditCard className="w-5 h-5 text-[#F4510B]" />
                  <span className="text-[10px] font-bold text-[#172B50] leading-tight line-clamp-2">Fees & Payments</span>
                </div>

                {/* 8. Contact Support */}
                <div
                  onClick={() => addToast('Academy Support Hotline: +91 98400 12345 (9 AM - 7 PM)', 'info')}
                  className="bg-[#FFF8F2] hover:bg-[#FFF1E6] hover:border-[#F4510B]/30 border border-transparent rounded-xl p-2 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all min-h-[72px]"
                >
                  <Headphones className="w-5 h-5 text-[#F4510B]" />
                  <span className="text-[10px] font-bold text-[#172B50] leading-tight line-clamp-2">Contact Support</span>
                </div>
              </div>
            </div>

            {/* 3. Good to Know Card */}
            <div className="bg-white rounded-2xl p-5 border border-[#172B50]/10 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm sm:text-base text-[#172B50]">Good to Know</h3>
                <button
                  type="button"
                  onClick={() => setCurrentView('communication')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <span>→</span>
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {/* 1. Megaphone */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#F4510B] shrink-0">
                    <Megaphone className="w-4 h-4 text-[#F4510B]" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-[#172B50]">
                      {data.announcements && data.announcements.length > 0 ? data.announcements[0].title : "No announcements yet."}
                    </h4>
                    <p className="text-[11px] text-[#172B50]/60">
                      {data.announcements && data.announcements.length > 0 ? data.announcements[0].content : "We'll share important updates here."}
                    </p>
                  </div>
                </div>

                {/* 2. Calendar Event */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#F4510B] shrink-0">
                    <Calendar className="w-4 h-4 text-[#F4510B]" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-[#172B50]">
                      {data.competitions && data.competitions.length > 0 ? data.competitions[0].title : "No upcoming events."}
                    </h4>
                    <p className="text-[11px] text-[#172B50]/60">
                      {data.competitions && data.competitions.length > 0 ? `${data.competitions[0].date} • ${data.competitions[0].location}` : "Events and activities will be listed here."}
                    </p>
                  </div>
                </div>

                {/* 3. Star Updates */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#F4510B] shrink-0">
                    <Star className="w-4 h-4 text-[#F4510B]" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-[#172B50]">Nothing right now.</h4>
                    <p className="text-[11px] text-[#172B50]/60">Check back later for more updates.</p>
                  </div>
                </div>
              </div>
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
                  {myChildren.length > 0 ? Math.round(myChildren.reduce((acc, c) => acc + (c.attendanceRate || 0), 0) / myChildren.length) : 0}%
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
                  {myChildren[0]?.rank || '—'}
                </div>
              </div>
            </div>
          </div>

          {myChildren.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-2xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF0E6] text-[#F4510B] flex items-center justify-center mx-auto shadow-2xs">
                <Award className="w-7 h-7 text-[#F4510B]" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#172B50]">No Student Evaluations Yet</h3>
              <p className="text-xs text-[#172B50]/60 max-w-md mx-auto">
                Once your child is enrolled and attends skill assessment sessions, official coach evaluations and belt milestones will appear here.
              </p>
              <button 
                type="button"
                onClick={() => setCurrentView('classes')}
                className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#F4510B] text-white text-xs font-bold hover:bg-[#e04505] transition-all cursor-pointer"
              >
                <span>Browse Programs & Classes</span>
                <span>→</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myChildren.map(child => (
                <div key={child.id} className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#172B5015]">
                    <div>
                      <h3 className="text-lg font-black text-[#172B50]">{child.name}</h3>
                      <p className="text-xs font-bold text-[#F4510B]">
                        {child.rank || 'Spartan'} • Kid ID: <span className="font-mono font-bold text-[#172B50]">{child.id}</span>
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-[#172B50] text-white">
                      {child.rank || 'Spartan'}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-[#172B50]">Agility & Speed Obstacle Drill</span>
                        <span className="font-black text-[#F4510B]">{child.evaluations?.agility ? `${child.evaluations.agility} / 10` : '—'}</span>
                      </div>
                      <div className="w-full h-2 bg-[#FFF4E8] rounded-full overflow-hidden">
                        <div className="h-full bg-[#F4510B] rounded-full" style={{ width: child.evaluations?.agility ? `${child.evaluations.agility * 10}%` : '0%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-[#172B50]">Balance Beam Routine</span>
                        <span className="font-black text-[#F4510B]">{child.evaluations?.balance ? `${child.evaluations.balance} / 10` : '—'}</span>
                      </div>
                      <div className="w-full h-2 bg-[#FFF4E8] rounded-full overflow-hidden">
                        <div className="h-full bg-[#F4510B] rounded-full" style={{ width: child.evaluations?.balance ? `${child.evaluations.balance * 10}%` : '0%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-[#172B50]">Spartan Discipline & Team Spirit</span>
                        <span className="font-black text-[#F4510B]">{child.evaluations?.discipline ? `${child.evaluations.discipline} / 10` : '—'}</span>
                      </div>
                      <div className="w-full h-2 bg-[#FFF4E8] rounded-full overflow-hidden">
                        <div className="h-full bg-[#172B50] rounded-full" style={{ width: child.evaluations?.discipline ? `${child.evaluations.discipline * 10}%` : '0%' }} />
                      </div>
                    </div>
                  </div>

                  {child.evaluations?.remark && (
                    <div className="p-3 bg-[#FFF4E8] rounded-xl border border-[#172B5015] text-xs">
                      <span className="font-bold text-[#172B50] block mb-0.5">Head Coach Remark:</span>
                      <p className="text-[#172B50] opacity-80 italic">
                        "{child.evaluations.remark}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. SPORTS & EVENTS / COMPETITIONS */}
      {(currentView === 'competitions' || currentView === 'sports_events') && (
        <SportsEventsModule />
      )}

            {/* 7.5. PROGRAMS & ACHIEVEMENTS */}
      {(currentView === 'programs_achievements' || currentView === 'progress' || currentView === 'programs' || currentView === 'achievements' || currentView === 'learning_journey') && (
        <ProgramsAchievementsModule
          parentProfile={parentProfile}
          myChildren={myChildren}
          activeChild={activeChild}
          selectedChildId={selectedChildId}
          onSelectChild={setSelectedChildId}
          initialTab={currentView === 'achievements' || currentView === 'progress' ? 'achievements' : 'explore'}
        />
      )}

      {/* 7.6. ATTENDANCE & COMPENSATION MODULE */}
      {(currentView === 'attendance' || currentView === 'attendance_compensation' || currentView === 'leave_requests' || currentView === 'compensation_class') && (
        <ParentAttendanceModule
          parentProfile={parentProfile}
          myChildren={myChildren}
          activeChild={activeChild}
          setActiveChild={(child) => setSelectedChildId(child.id)}
          initialSelectedDate="2026-11-19"
        />
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
          {(data.announcements || []).length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-2xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF0E6] text-[#F4510B] flex items-center justify-center mx-auto shadow-2xs">
                <Megaphone className="w-7 h-7 text-[#F4510B]" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#172B50]">No Announcements Yet</h3>
              <p className="text-xs text-[#172B50]/60 max-w-md mx-auto">
                Academy circulars, holiday notices, and important parent updates will be published here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
            {data.announcements.map(ann => (
              <div key={ann.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
                <span className="text-[10px] font-bold text-[#F4510B] uppercase">{ann.date} • {ann.target}</span>
                <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{ann.title}</h3>
                <p className="text-xs text-[#172B50] opacity-80 mt-2 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
          )}
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
        title={myChildren[0]?.coachName ? `Review ${myChildren[0].coachName}` : "Submit Coach Feedback"}
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
