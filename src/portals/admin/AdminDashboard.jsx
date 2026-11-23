import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  UserPlus,
  GraduationCap, 
  UserCheck, 
  User,
  Plus, 
  Download, 
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Calendar,
  CalendarDays,
  Globe,
  TrendingUp,
  Search,
  Bell,
  Upload,
  Star,
  BarChart2,
  MapPin,
  Inbox,
  Mail,
  Trophy,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  Package,
  Settings,
  LogOut,
  Target
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import { getCommonLocations } from '../../services/locationService';
import { calculateDemoMetrics } from '../../services/demoService';

export default function AdminDashboard() {
  const { 
    data, 
    setCurrentView, 
    setActiveSubTab, 
    addStudent, 
    addEnquiry, 
    addPayment, 
    addToast,
    logout 
  } = useCrm();
  const commonLocations = getCommonLocations(data);

  const [modalType, setModalType] = useState(null); // 'student' | 'enquiry' | 'payment'

  // Quick form states
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAge, setNewStudentAge] = useState('7');
  const [newStudentProgram, setNewStudentProgram] = useState(data.programs?.[0]?.name || '');
  const [newStudentParent, setNewStudentParent] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');

  const [enqChild, setEnqChild] = useState('');
  const [enqParent, setEnqParent] = useState('');
  const [enqPhone, setEnqPhone] = useState('');
  const [enqEmail, setEnqEmail] = useState('');
  const [enqLocation, setEnqLocation] = useState(commonLocations[0]?.name || 'KK NAGAR');
  const [enqProgram, setEnqProgram] = useState(data.programs?.[0]?.name || '');

  const [payStudent, setPayStudent] = useState(data.students?.[0]?.name || '');
  const [payAmount, setPayAmount] = useState('4500');

  // Live dynamic CRM metrics (NO hardcoded fake numbers)
  const demoMetrics = calculateDemoMetrics(data.enquiries || [], data.demos || [], data.students || []);
  const totalEnquiries = demoMetrics.totalEnquiries || 0;
  const websiteCount = demoMetrics.websiteEnquiries || 0;
  const manualCount = demoMetrics.manualEnquiries || 0;
  const websitePct = totalEnquiries > 0 ? Math.round((websiteCount / totalEnquiries) * 100) : 0;
  const manualPct = totalEnquiries > 0 ? Math.round((manualCount / totalEnquiries) * 100) : 0;

  // Helper to sort latest records first
  const getLatestRecords = (items) => {
    if (!Array.isArray(items)) return [];
    return [...items].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.date || a.enquiryDate || a.joinDate || 0).getTime();
      const timeB = new Date(b.createdAt || b.date || b.enquiryDate || b.joinDate || 0).getTime();
      if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB && (timeA > 0 || timeB > 0)) {
        return timeB - timeA;
      }
      return 0;
    });
  };

  // Live dynamic lists sorted latest first (NO hardcoded records)
  const allEnquiries = getLatestRecords(data.enquiries || []);
  const allDemos = getLatestRecords(data.demos || []);
  const allStudents = getLatestRecords(data.students || []);
  const liveClasses = data.classSchedules || [];

  const todayYmd = new Date().toISOString().slice(0, 10);
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayWeekday = weekdayNames[new Date().getDay()];

  // Row 1 KPI Calculations (Connected dynamically to live data)
  const totalEnquiriesCount = allEnquiries.length;
  const todayEnquiriesCount = allEnquiries.filter(e => {
    const d = e.createdAt || e.date || e.enquiryDate || '';
    return d.startsWith(todayYmd);
  }).length;

  const totalDemosCount = allDemos.length;
  const scheduledDemosCount = allDemos.filter(d => 
    d.status === 'Scheduled' || d.status === 'Confirmed' || d.status === 'Upcoming' || !d.status
  ).length;

  const assignedDemosCount = allDemos.filter(d => 
    Boolean(d.coachId || d.coachName || d.assignedCoach)
  ).length;
  const inProgressAssignsCount = allDemos.filter(d => 
    Boolean(d.coachId || d.coachName || d.assignedCoach) && 
    (d.status === 'Scheduled' || d.status === 'Confirmed' || d.status === 'In Progress' || !d.completed)
  ).length;

  const totalEnrolledCount = allStudents.length;
  const todayEnrolledCount = allStudents.filter(s => {
    const d = s.createdAt || s.date || s.joinDate || s.enrollmentDate || '';
    return d.startsWith(todayYmd);
  }).length;

  // Row 2 Demo Performance Calculations
  const completedDemosCount = allDemos.filter(d => 
    d.status === 'Completed' || d.completed === true
  ).length;
  const cancelledDemosCount = allDemos.filter(d => 
    d.status === 'Cancelled' || d.status === 'Declined' || d.status === 'No Show'
  ).length;
  const demoConversionPct = totalDemosCount > 0 
    ? ((completedDemosCount / totalDemosCount) * 100).toFixed(1)
    : '0.0';

  // Row 2 Today's Classes
  const todayClasses = liveClasses.filter(cls => 
    cls.date === todayYmd || cls.weekday === todayWeekday || cls.dayOfWeek === todayWeekday
  );

  // Row 2 Academy Operations (Centers & Equipment)
  const activeLocationsCount = (Array.isArray(data.locations) && data.locations.length > 0)
    ? data.locations.filter(loc => loc.status !== 'Inactive').length
    : (commonLocations?.length || (data.academy?.centers || []).length);

  const activeEquipmentCount = Array.isArray(data.equipment)
    ? data.equipment.filter(item => item.status !== 'Inactive' && item.status !== 'Retired').length
    : 0;

  // ============================================================
  // LIVE CALENDAR POPOVER STATE & HELPERS
  // ============================================================
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedCalDate, setSelectedCalDate] = useState(() => new Date());
  const [calViewYear, setCalViewYear] = useState(() => new Date().getFullYear());
  const [calViewMonth, setCalViewMonth] = useState(() => new Date().getMonth()); // 0-indexed
  const [liveClock, setLiveClock] = useState(() => new Date());
  const calendarRef = useRef(null);

  // Live real-time clock tick (every second)
  useEffect(() => {
    const timer = setInterval(() => setLiveClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Click outside and Escape key listener to close calendar popover
  useEffect(() => {
    function handleClickOutside(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setCalendarOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setCalendarOpen(false);
      }
    }
    if (calendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [calendarOpen]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (calViewMonth === 0) {
      setCalViewMonth(11);
      setCalViewYear(y => y - 1);
    } else {
      setCalViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calViewMonth === 11) {
      setCalViewMonth(0);
      setCalViewYear(y => y + 1);
    } else {
      setCalViewMonth(m => m + 1);
    }
  };

  const handleJumpToday = () => {
    const now = new Date();
    setCalViewMonth(now.getMonth());
    setCalViewYear(now.getFullYear());
    setSelectedCalDate(now);
  };

  // Generate calendar grid cells
  const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calViewYear, calViewMonth, 1).getDay();
  const daysInPrevMonth = new Date(calViewYear, calViewMonth, 0).getDate();

  const calCells = [];
  // Trailing days from previous month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      month: calViewMonth - 1,
      year: calViewYear,
      hasClasses: false
    });
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dObj = new Date(calViewYear, calViewMonth, d);
    const ymd = `${calViewYear}-${String(calViewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const wDay = weekdayNames[dObj.getDay()];
    const hasClasses = (data.classSchedules || []).some(
      sch => sch.date === ymd || sch.weekday === wDay || sch.dayOfWeek === wDay
    );
    calCells.push({
      day: d,
      isCurrentMonth: true,
      month: calViewMonth,
      year: calViewYear,
      hasClasses
    });
  }
  // Leading days of next month to complete row
  const remainingCells = (7 - (calCells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    calCells.push({
      day: d,
      isCurrentMonth: false,
      month: calViewMonth + 1,
      year: calViewYear,
      hasClasses: false
    });
  }

  // Selected date scheduled classes
  const selectedYmd = `${selectedCalDate.getFullYear()}-${String(selectedCalDate.getMonth() + 1).padStart(2, '0')}-${String(selectedCalDate.getDate()).padStart(2, '0')}`;
  const selectedWDay = weekdayNames[selectedCalDate.getDay()];
  const selectedDayClasses = (data.classSchedules || []).filter(
    sch => sch.date === selectedYmd || sch.weekday === selectedWDay || sch.dayOfWeek === selectedWDay
  );

  const handleCreateStudent = (e) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentParent.trim()) return;
    addStudent({
      name: newStudentName,
      age: parseInt(newStudentAge) || 7,
      gender: 'Youth',
      parentName: newStudentParent,
      parentPhone: newStudentPhone || '+91 98000 00000',
      parentEmail: `${newStudentParent.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      program: newStudentProgram || 'Junior Football Champions',
      center: data.academy?.centers?.[0] || 'KK NAGAR',
      coachName: data.coaches?.[0]?.name || 'Unassigned Coach',
      rank: 'Little Spartan Recruit',
      medicalNote: 'Routine fitness check passed'
    });
    setModalType(null);
    setNewStudentName('');
    setNewStudentParent('');
    setNewStudentPhone('');
  };

  const handleCreateEnquiry = (e) => {
    e.preventDefault();
    if (!enqChild.trim() || !enqParent.trim()) return;
    addEnquiry({
      childName: enqChild,
      childAge: 6,
      parentName: enqParent,
      phone: enqPhone || '+91 98765 00000',
      email: enqEmail.trim() || `${enqParent.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      interestedProgram: enqProgram || 'Junior Football Champions',
      center: enqLocation || commonLocations[0]?.name || 'KK NAGAR',
      notes: 'Parent submitted quick walk-in lead at academy reception desk.',
      stage: 'New'
    });
    setModalType(null);
    setEnqChild('');
    setEnqParent('');
    setEnqPhone('');
    setEnqEmail('');
  };

  const handleQuickPayment = (e) => {
    e.preventDefault();
    const stu = data.students.find(s => s.name === payStudent) || data.students[0];
    if (!stu) {
      addToast('Enroll a student first before recording a payment.', 'error');
      return;
    }
    addPayment({
      studentId: stu.id,
      studentName: stu.name,
      parentName: stu.parentName,
      amount: parseInt(payAmount) || 4500,
      program: stu.program,
      billingMonth: 'November 2026',
      paymentMethod: 'UPI Instant Desk'
    });
    setModalType(null);
  };

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      
      {/* ============================================================ */}
      {/* 1. TOP HEADER: Good Morning, Admin! & Action Icons           */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {/* Left: Heading & Subtitle (Positioned immediately to the right of sidebar) */}
        <div className="text-left space-y-1">
          <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-black text-[#172B50] tracking-tight flex items-center gap-2">
            <span>Good Morning, Admin!</span>
            <span className="inline-block transform origin-bottom hover:rotate-12 transition-transform cursor-default select-none">👋</span>
          </h1>
          <p className="text-xs sm:text-[13px] font-bold text-[#172B50]/65 tracking-tight text-left">
            Dashboard
          </p>
        </div>

        {/* Right: Quick Action Round Buttons - All 5 actions in a single horizontal row */}
        <div className="flex items-center gap-2 sm:gap-2.5 self-start sm:self-center shrink-0">
          {/* 1. Search */}
          <button
            type="button"
            onClick={() => addToast('Search active roster and records')}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4 text-[#172B50]" />
          </button>

          {/* 2. Notification */}
          <button
            type="button"
            onClick={() => addToast('No unread notifications')}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#172B50]" />
            <span className="w-2 h-2 rounded-full bg-[#F4510B] absolute top-2 right-2 ring-1 ring-white" />
          </button>

          {/* 3. Upload */}
          <button
            type="button"
            onClick={() => setCurrentView('export')}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer"
            title="Export Academy Data"
          >
            <Upload className="w-4 h-4 text-[#172B50]" />
          </button>

          {/* 5. Calendar (Live Calendar) */}
          <div className="relative" ref={calendarRef}>
            <button
              type="button"
              onClick={() => setCalendarOpen(prev => !prev)}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border ${
                calendarOpen 
                  ? 'border-[#F4510B] ring-2 ring-[#F4510B]/25 bg-[#FFF5ED]' 
                  : 'border-[#172B5015] hover:bg-[#FFF4E8] hover:border-[#F4510B40]'
              } shadow-2xs flex items-center justify-center text-[#172B50] transition-all cursor-pointer relative`}
              title={`Live Calendar (Today: ${liveClock.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})`}
            >
              <Calendar className="w-4 h-4 text-[#172B50]" />
              {/* Live Day Badge */}
              <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-[#F4510B] text-white text-[9px] font-black flex items-center justify-center leading-none ring-1.5 ring-white shadow-2xs select-none">
                {liveClock.getDate()}
              </span>
            </button>

            {/* Interactive Live Calendar Popover */}
            {calendarOpen && (
              <div className="absolute right-0 top-full mt-2.5 z-50 w-[310px] sm:w-[330px] bg-white rounded-2xl shadow-[0_16px_40px_rgba(23,43,80,0.18)] border border-[#172B5015] p-3.5 sm:p-4 animate-in fade-in zoom-in-95 duration-150">
                {/* Header: Title, Live Clock & Close Button */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#172B5010]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#172B50]">
                      Live Calendar
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#172B50]/65 bg-[#172B5008] px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-[#F4510B]" />
                      <span>{liveClock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCalendarOpen(false)}
                      className="w-5 h-5 rounded-md text-[#172B50]/60 hover:text-[#172B50] hover:bg-[#172B500C] flex items-center justify-center transition-colors cursor-pointer"
                      title="Close"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Month Navigation Row */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                    {monthNames[calViewMonth]} {calViewYear}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="w-6 h-6 rounded-lg bg-[#172B5008] hover:bg-[#FFF4E8] text-[#172B50] flex items-center justify-center transition-colors cursor-pointer"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleJumpToday}
                      className="px-2 py-0.5 rounded-lg bg-[#FFF5ED] hover:bg-[#F4510B] hover:text-white text-[#F4510B] text-[10px] font-extrabold transition-colors cursor-pointer"
                      title="Jump to Today"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="w-6 h-6 rounded-lg bg-[#172B5008] hover:bg-[#FFF4E8] text-[#172B50] flex items-center justify-center transition-colors cursor-pointer"
                      title="Next Month"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Day of Week Labels */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                    <span key={i} className="text-[10px] font-black text-[#172B50]/45 uppercase select-none">
                      {d}
                    </span>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calCells.map((cell, idx) => {
                    const todayDate = new Date();
                    const isToday = cell.isCurrentMonth && 
                      cell.day === todayDate.getDate() && 
                      calViewMonth === todayDate.getMonth() && 
                      calViewYear === todayDate.getFullYear();
                    const isSelected = cell.isCurrentMonth && 
                      cell.day === selectedCalDate.getDate() && 
                      calViewMonth === selectedCalDate.getMonth() && 
                      calViewYear === selectedCalDate.getFullYear();
                    
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!cell.isCurrentMonth}
                        onClick={() => {
                          if (cell.isCurrentMonth) {
                            setSelectedCalDate(new Date(calViewYear, calViewMonth, cell.day));
                          }
                        }}
                        className={`h-7 w-7 sm:h-7.5 sm:w-7.5 mx-auto rounded-lg text-[11px] font-bold flex flex-col items-center justify-center relative transition-all ${
                          !cell.isCurrentMonth
                            ? 'text-[#172B50]/20 cursor-default'
                            : isSelected
                            ? 'bg-[#172B50] text-white shadow-2xs scale-105'
                            : isToday
                            ? 'bg-[#FFF5ED] text-[#F4510B] font-black ring-1.5 ring-[#F4510B] hover:bg-[#F4510B] hover:text-white'
                            : 'text-[#172B50] hover:bg-[#FFF4E8] cursor-pointer'
                        }`}
                      >
                        <span>{cell.day}</span>
                        {cell.hasClasses && cell.isCurrentMonth && (
                          <span className={`w-1 h-1 rounded-full absolute bottom-0.5 ${isSelected ? 'bg-white' : 'bg-[#F4510B]'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Day Agenda Box */}
                <div className="mt-3 pt-2.5 border-t border-[#172B5010]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-black text-[#172B50]">
                      {selectedCalDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[10px] font-bold text-[#172B50]/60">
                      {selectedDayClasses.length} {selectedDayClasses.length === 1 ? 'class' : 'classes'}
                    </span>
                  </div>

                  {selectedDayClasses.length === 0 ? (
                    <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#172B5008] text-center">
                      <p className="text-[11px] font-medium text-[#172B50]/60">
                        No classes scheduled for this date
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[110px] overflow-y-auto scrollbar-thin pr-0.5">
                      {selectedDayClasses.slice(0, 3).map((cls, i) => (
                        <div key={cls.id || i} className="p-1.5 rounded-lg bg-[#FFF5ED] border border-[#F4510B20] text-left">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-black text-[#172B50] truncate">{cls.program || 'Junior Football'}</span>
                            <span className="font-bold text-[#F4510B] shrink-0">{cls.startTime || cls.time || '09:00 AM'}</span>
                          </div>
                          <div className="text-[9.5px] text-[#172B50]/70 truncate mt-0.5">
                            {cls.center || cls.location || 'KK NAGAR'} • {cls.coachName || 'Coach Arjun'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Action Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setCalendarOpen(false);
                      setCurrentView('schedules');
                    }}
                    className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-[#172B50] hover:bg-[#F4510B] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Open Class Schedules</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 1: FOUR KPI SUMMARY CARDS                                */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: New Enquiries (Green Theme) */}
        <div 
          onClick={() => setCurrentView('enquiries')}
          className="bg-white rounded-[22px] p-4.5 sm:p-5 border border-emerald-200/90 shadow-2xs flex items-center justify-between hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#DCFCE7] text-[#10B981] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <UserPlus className="w-5.5 h-5.5 text-[#10B981]" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#172B50]/70 block truncate">
                NEW ENQUIRIES
              </span>
              <span className="text-2xl sm:text-[30px] font-black text-[#172B50] leading-none mt-1 block tracking-tight">
                {totalEnquiriesCount}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] shrink-0 select-none">
            +{todayEnquiriesCount} today
          </span>
        </div>

        {/* Card 2: New Demos (Purple Theme) */}
        <div 
          onClick={() => setCurrentView('demos')}
          className="bg-white rounded-[22px] p-4.5 sm:p-5 border border-purple-200/90 shadow-2xs flex items-center justify-between hover:border-purple-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <Calendar className="w-5.5 h-5.5 text-[#9333EA]" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#172B50]/70 block truncate">
                NEW DEMOS
              </span>
              <span className="text-2xl sm:text-[30px] font-black text-[#172B50] leading-none mt-1 block tracking-tight">
                {totalDemosCount}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#F3E8FF] text-[#9333EA] border border-[#E9D5FF] shrink-0 select-none">
            {scheduledDemosCount} scheduled
          </span>
        </div>

        {/* Card 3: Demo Assigns (Teal Theme) */}
        <div 
          onClick={() => setCurrentView('demos')}
          className="bg-white rounded-[22px] p-4.5 sm:p-5 border border-teal-200/90 shadow-2xs flex items-center justify-between hover:border-teal-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <UserCheck className="w-5.5 h-5.5 text-[#0D9488]" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#172B50]/70 block truncate">
                DEMO ASSIGNS
              </span>
              <span className="text-2xl sm:text-[30px] font-black text-[#172B50] leading-none mt-1 block tracking-tight">
                {assignedDemosCount}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] shrink-0 select-none">
            {inProgressAssignsCount} in progress
          </span>
        </div>

        {/* Card 4: Enrolled (Coral/Red Theme) */}
        <div 
          onClick={() => {
            setCurrentView('people');
            if (setActiveSubTab) setActiveSubTab('students');
          }}
          className="bg-white rounded-[22px] p-4.5 sm:p-5 border border-rose-200/90 shadow-2xs flex items-center justify-between hover:border-rose-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#FFE4E6] text-[#F43F5E] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <GraduationCap className="w-5.5 h-5.5 text-[#F43F5E]" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#172B50]/70 block truncate">
                ENROLLED
              </span>
              <span className="text-2xl sm:text-[30px] font-black text-[#172B50] leading-none mt-1 block tracking-tight">
                {totalEnrolledCount}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3] shrink-0 select-none">
            +{todayEnrolledCount} today
          </span>
        </div>

      </div>

      {/* ============================================================ */}
      {/* ROW 2: MAIN DASHBOARD CARDS (3 Equal Compact Cards)          */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
        
        {/* ---------------------------------------------------- */}
        {/* Card A: Today's Classes (Light Orange Pastel)         */}
        {/* ---------------------------------------------------- */}
        <div className="bg-[#FFE5D3] rounded-[22px] p-3.5 sm:p-4 border border-[#F4510B]/20 shadow-[0_4px_20px_rgba(244,81,11,0.05)] flex flex-col justify-between h-[235px] sm:h-[240px]">
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-[#F4510B15]">
              <div className="w-6.5 h-6.5 rounded-lg bg-white text-[#F4510B] border border-[#F4510B25] flex items-center justify-center shrink-0 shadow-2xs">
                <CalendarDays className="w-3.5 h-3.5 text-[#F4510B]" />
              </div>
              <h2 className="text-sm sm:text-[15px] font-black text-[#172B50] tracking-tight">
                Today's Classes
              </h2>
            </div>
          </div>

          {/* Body: Empty State or Scheduled Classes */}
          {todayClasses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-1 my-auto">
              <div className="w-8 h-8 rounded-xl bg-white text-[#F4510B] border border-[#F4510B25] flex items-center justify-center mb-1 shadow-2xs">
                <CalendarDays className="w-4 h-4 text-[#F4510B]" />
              </div>
              <p className="text-xs sm:text-[12.5px] font-black text-[#172B50] leading-tight">
                No classes scheduled for today
              </p>
              <p className="text-[10px] sm:text-[10.5px] font-medium text-[#172B50]/65 mt-0.5 max-w-[240px] leading-tight">
                All classes for today are completed or not yet scheduled.
              </p>
              <button
                type="button"
                onClick={() => setCurrentView('schedules')}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-[#F4510B] bg-white border border-[#F4510B30] hover:bg-[#F4510B] hover:text-white rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <span>Create Class Schedule +</span>
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto max-h-[140px] my-1 pr-1 space-y-1.5 scrollbar-thin">
              {todayClasses.slice(0, 3).map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => setCurrentView('schedules')}
                  className="bg-white rounded-lg px-2.5 py-1.5 border border-[#F4510B15] shadow-2xs flex items-center justify-between text-xs hover:border-[#F4510B40] transition-colors cursor-pointer"
                >
                  <div className="min-w-0 pr-1.5">
                    <p className="font-black text-[#172B50] text-[11px] truncate leading-tight">{cls.className || cls.program}</p>
                    <p className="text-[9.5px] text-[#172B50]/60 truncate leading-tight">{cls.location || cls.center} • {cls.coachName || 'Coach'}</p>
                  </div>
                  <span className="font-extrabold text-[#F4510B] text-[10px] shrink-0 bg-[#FFF5ED] px-1.5 py-0.5 rounded border border-[#F4510B20]">
                    {cls.startTime || cls.time || '09:00 AM'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="pt-2 border-t border-[#F4510B15] flex items-center justify-between text-xs mt-auto shrink-0">
            <span className="text-[10px] sm:text-[10.5px] font-bold text-[#172B50]/65 uppercase tracking-wider">
              DAILY SCHEDULE
            </span>
            <button
              type="button"
              onClick={() => setCurrentView('schedules')}
              className="text-[11px] font-black text-[#F4510B] hover:text-[#d44105] flex items-center gap-1 group cursor-pointer transition-colors"
            >
              <span>View Full Schedule</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Card B: Demo Performance (Light Blue Pastel)          */}
        {/* ---------------------------------------------------- */}
        <div className="bg-[#D9EFFE] rounded-[22px] p-3.5 sm:p-4 border border-[#0284C7]/20 shadow-[0_4px_20px_rgba(2,132,199,0.05)] flex flex-col justify-between h-[235px] sm:h-[240px]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#0284C715]">
              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 rounded-lg bg-white text-[#0284C7] border border-[#0284C725] flex items-center justify-center shrink-0 shadow-2xs">
                  <BarChart2 className="w-3.5 h-3.5 text-[#0284C7]" />
                </div>
                <h2 className="text-sm sm:text-[15px] font-black text-[#172B50] tracking-tight">
                  Demo Performance
                </h2>
              </div>
              <span className="text-[10px] font-extrabold text-[#0284C7] bg-white px-2 py-0.5 rounded-full border border-[#0284C725] select-none shadow-2xs">
                {totalDemosCount} Demos
              </span>
            </div>

            {/* Two KPI sub-cards side by side */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {/* Completed Sub-card */}
              <div 
                onClick={() => setCurrentView('demos')}
                className="bg-white rounded-xl p-2 border border-[#0284C715] shadow-2xs hover:border-[#16A34A40] transition-all cursor-pointer group flex flex-col justify-between h-[62px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                    <span className="text-[10.5px] font-black text-[#172B50]">Completed</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-[#172B50] leading-none">
                    {completedDemosCount}
                  </span>
                  <span className="text-[8.5px] font-bold text-[#172B50]/50 tracking-wider uppercase">
                    FINALIZED
                  </span>
                </div>
              </div>

              {/* Cancelled Sub-card */}
              <div 
                onClick={() => setCurrentView('demos')}
                className="bg-white rounded-xl p-2 border border-[#0284C715] shadow-2xs hover:border-[#EA580C40] transition-all cursor-pointer group flex flex-col justify-between h-[62px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full border border-[#EA580C] flex items-center justify-center">
                      <X className="w-2 h-2 text-[#EA580C] stroke-[3]" />
                    </div>
                    <span className="text-[10.5px] font-black text-[#172B50]">Cancelled</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-[#172B50] leading-none">
                    {cancelledDemosCount}
                  </span>
                  <span className="text-[8.5px] font-bold text-[#172B50]/50 tracking-wider uppercase">
                    DECLINED
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Rows */}
            <div className="space-y-1 mt-2 px-0.5">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-[#172B50]/75 font-bold">
                  <div className="w-3 h-3 rounded-full border border-[#0284C7] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[#0284C7]" />
                  </div>
                  <span>Conversion Rate</span>
                </div>
                <span className="text-[11px] font-black text-[#0284C7]">
                  {demoConversionPct}% Success
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-[#172B50]/75 font-bold">
                  <div className="w-3 h-3 rounded-full border border-[#0284C7] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[#0284C7]" />
                  </div>
                  <span>Demo to Admission</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView('demos')}
                  className="text-[11px] font-black text-[#0284C7] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Detailed Report</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#0284C715] flex items-center justify-between text-xs mt-auto shrink-0">
            <span className="text-[10px] sm:text-[10.5px] font-bold text-[#172B50]/65 uppercase tracking-wider">
              DEMO ANALYTICS
            </span>
            <button
              type="button"
              onClick={() => setCurrentView('demos')}
              className="text-[11px] font-black text-[#0284C7] hover:text-[#0369a1] flex items-center gap-1 group cursor-pointer transition-colors"
            >
              <span>Explore All Demos</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Card C: Academy Operations (Light Green Pastel)       */}
        {/* ---------------------------------------------------- */}
        <div className="bg-[#DEF7E6] rounded-[22px] p-3.5 sm:p-4 border border-[#16A34A]/20 shadow-[0_4px_20px_rgba(22,163,74,0.05)] flex flex-col justify-between h-[235px] sm:h-[240px]">
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-[#16A34A15]">
              <div className="w-6.5 h-6.5 rounded-lg bg-white text-[#16A34A] border border-[#16A34A25] flex items-center justify-center shrink-0 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-[#16A34A]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-[15px] font-black text-[#172B50] tracking-tight leading-tight">
                  Academy Operations
                </h2>
                <p className="text-[10px] font-medium text-[#172B50]/60 leading-tight">
                  Centers, faculty &amp; equipment
                </p>
              </div>
            </div>

            {/* Two tiles: Locations & Equipment & Kits */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {/* Tile 1: Locations */}
              <button
                type="button"
                onClick={() => {
                  if (setActiveSubTab) setActiveSubTab('centers');
                  setCurrentView('settings');
                }}
                className="bg-white rounded-xl p-2 border border-[#16A34A15] shadow-2xs hover:border-[#F4510B35] hover:shadow-xs active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center text-center group h-[96px] sm:h-[100px]"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FFF5ED] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                </div>
                <span className="text-[11px] font-black text-[#172B50] leading-tight">
                  Locations
                </span>
                <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5 leading-tight">
                  {activeLocationsCount} Active Centers
                </span>
              </button>

              {/* Tile 2: Equipment & Kits */}
              <button
                type="button"
                onClick={() => setCurrentView('equipment')}
                className="bg-white rounded-xl p-2 border border-[#16A34A15] shadow-2xs hover:border-[#0284C735] hover:shadow-xs active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center text-center group h-[96px] sm:h-[100px]"
              >
                <div className="w-7 h-7 rounded-lg bg-[#F0F9FF] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <Package className="w-3.5 h-3.5 text-[#0284C7]" />
                </div>
                <span className="text-[11px] font-black text-[#172B50] leading-tight">
                  Equipment &amp; Kits
                </span>
                <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5 leading-tight">
                  {activeEquipmentCount} Active Items
                </span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-[#16A34A15] flex items-center justify-between text-xs mt-auto shrink-0">
            <span className="text-[10px] sm:text-[10.5px] font-bold text-[#172B50]/65 uppercase tracking-wider">
              ACADEMY RESOURCES
            </span>
            <button
              type="button"
              onClick={() => {
                if (setActiveSubTab) setActiveSubTab('centers');
                setCurrentView('settings');
              }}
              className="text-[11px] font-black text-[#16A34A] hover:text-[#15803d] flex items-center gap-1 group cursor-pointer transition-colors"
            >
              <span>View All ({activeLocationsCount + activeEquipmentCount})</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* ROW 3: WORKFLOW CARDS (4 Equal Cards)                        */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
        
        {/* ---------------------------------------------------- */}
        {/* Card 1: Enquiry Intake (Lead Capture)                 */}
        {/* ---------------------------------------------------- */}
        <div className="bg-[#FFE5D3] rounded-[22px] p-3.5 sm:p-4 border border-[#F4510B]/20 shadow-[0_4px_20px_rgba(244,81,11,0.05)] flex flex-col justify-between h-[245px] sm:h-[250px]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white text-[#F4510B] border border-[#F4510B25] shadow-2xs flex items-center justify-center shrink-0">
                  <Inbox className="w-3.5 h-3.5 text-[#F4510B]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-[13px] font-black text-[#172B50] tracking-tight truncate">
                    Enquiry Intake
                  </h3>
                  <p className="text-[10px] font-medium text-[#172B50]/60 truncate leading-none">
                    Capture and qualify new leads
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalType('enquiry')}
                title="Add Enquiry"
                className="w-6 h-6 rounded-lg bg-[#F4510B] text-white flex items-center justify-center shadow-xs hover:bg-[#d44105] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Exactly 3 Recent Enquiries or Empty State */}
            {allEnquiries.length === 0 ? (
              <div className="py-2.5 text-center flex flex-col items-center justify-center">
                <div className="w-7 h-7 rounded-lg bg-white text-[#F4510B] border border-[#F4510B20] flex items-center justify-center mb-1 shadow-2xs">
                  <Inbox className="w-3.5 h-3.5 text-[#F4510B]" />
                </div>
                <p className="text-xs font-black text-[#172B50]">No enquiries logged yet</p>
                <p className="text-[9.5px] font-medium text-[#172B50]/55 mt-0.5">Capture new leads to start pipeline</p>
                <button
                  type="button"
                  onClick={() => setModalType('enquiry')}
                  className="mt-1.5 px-2.5 py-0.5 text-[10.5px] font-bold text-[#F4510B] bg-white border border-[#F4510B30] hover:bg-[#F4510B] hover:text-white rounded-lg transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  + Add Enquiry
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {allEnquiries.slice(0, 3).map((enq) => (
                  <div
                    key={enq.id}
                    className="bg-white rounded-xl px-2.5 py-1.5 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-1.5 shrink-0 hover:border-[#F4510B30] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-black text-[#172B50] truncate leading-tight">{enq.childName}</p>
                      <p className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5 truncate leading-tight">
                        {enq.interestedProgram || 'Spartan Gymnastics & Agility'} • {enq.center || 'KK NAGAR'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          addToast(`${enq.childName} enquiry verified`);
                          setCurrentView('enquiries');
                        }}
                        className="w-5.5 h-5.5 rounded-md bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
                        title="Verify & Go to Enquiries"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentView('demos')}
                        className="w-5.5 h-5.5 rounded-md bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] transition-all cursor-pointer"
                        title="Schedule Trial"
                      >
                        <Calendar className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Footer */}
          <div className="pt-2 border-t border-[#172B500C] flex items-center justify-between text-xs mt-auto shrink-0">
            <span className="text-[10px] font-bold text-[#172B50]/65 uppercase tracking-wider">
              LEAD CAPTURE
            </span>
            <button
              type="button"
              onClick={() => setCurrentView('enquiries')}
              className="text-[11px] font-black text-[#F4510B] hover:text-[#d44105] flex items-center gap-1 group cursor-pointer transition-colors"
            >
              <span>View All ({allEnquiries.length})</span>
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Card 2: Demo & Assessment (Demo Management)           */}
        {/* ---------------------------------------------------- */}
        <div className="bg-[#D9EFFE] rounded-[22px] p-3.5 sm:p-4 border border-[#0284C7]/20 shadow-[0_4px_20px_rgba(2,132,199,0.05)] flex flex-col justify-between h-[245px] sm:h-[250px]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white text-[#0284C7] border border-[#0284C725] shadow-2xs flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-[#0284C7]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-[13px] font-black text-[#172B50] tracking-tight truncate">
                    Demo &amp; Assessment
                  </h3>
                  <p className="text-[10px] font-medium text-[#172B50]/60 truncate leading-none">
                    Schedule and track demo sessions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView('demos')}
                title="Demo Register"
                className="w-6 h-6 rounded-lg bg-[#0284C7] text-white flex items-center justify-center shadow-xs hover:bg-[#0369a1] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Exactly 3 Recent Demos or Empty State */}
            {allDemos.length === 0 ? (
              <div className="py-2.5 text-center flex flex-col items-center justify-center">
                <div className="w-7 h-7 rounded-lg bg-white text-[#0284C7] border border-[#0284C720] flex items-center justify-center mb-1 shadow-2xs">
                  <Mail className="w-3.5 h-3.5 text-[#0284C7]" />
                </div>
                <p className="text-xs font-black text-[#172B50]">No demos scheduled</p>
                <p className="text-[9.5px] font-medium text-[#172B50]/55 mt-0.5">Trials will appear here once booked</p>
                <button
                  type="button"
                  onClick={() => setCurrentView('demos')}
                  className="mt-1.5 px-2.5 py-0.5 text-[10.5px] font-bold text-[#0284C7] bg-white border border-[#0284C730] hover:bg-[#0284C7] hover:text-white rounded-lg transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  Demo Register
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {allDemos.slice(0, 3).map((demo) => (
                  <div
                    key={demo.id}
                    className="bg-white rounded-xl px-2.5 py-1.5 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-1.5 shrink-0 hover:border-[#0284C730] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-black text-[#172B50] truncate leading-tight">{demo.childName}</p>
                      <p className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5 truncate leading-tight">
                        {demo.program || demo.className || 'Spartan Gymnastics & Agility'} Demo
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          addToast(`${demo.childName} demo verified`);
                          setCurrentView('demos');
                        }}
                        className="w-5.5 h-5.5 rounded-md bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
                        title="Verify & Go to Demos"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentView('demos')}
                        className="w-5.5 h-5.5 rounded-md bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-[#F0F7FF] hover:text-[#0284C7] transition-all cursor-pointer"
                        title="View Slot"
                      >
                        <Calendar className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Footer */}
          <div className="pt-2 border-t border-[#172B500C] flex items-center justify-between text-xs mt-auto shrink-0">
            <span className="text-[10px] font-bold text-[#172B50]/65 uppercase tracking-wider">
              DEMO MANAGEMENT
            </span>
            <button
              type="button"
              onClick={() => setCurrentView('demos')}
              className="text-[11px] font-black text-[#0284C7] hover:text-[#0369a1] flex items-center gap-1 group cursor-pointer transition-colors"
            >
              <span>View All ({allDemos.length})</span>
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Card 3: Admission & Enrollment (Enrollment)          */}
        {/* ---------------------------------------------------- */}
        <div className="bg-[#DEF7E6] rounded-[22px] p-3.5 sm:p-4 border border-[#16A34A]/20 shadow-[0_4px_20px_rgba(22,163,74,0.05)] flex flex-col justify-between h-[245px] sm:h-[250px]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white text-[#16A34A] border border-[#16A34A25] shadow-2xs flex items-center justify-center shrink-0">
                  <GraduationCap className="w-3.5 h-3.5 text-[#16A34A]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-[13px] font-black text-[#172B50] tracking-tight truncate">
                    Admission &amp; Enrollment
                  </h3>
                  <p className="text-[10px] font-medium text-[#172B50]/60 truncate leading-none">
                    Convert demo to enrollment
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalType('student')}
                title="Enroll Student"
                className="w-6 h-6 rounded-lg bg-[#16A34A] text-white flex items-center justify-center shadow-xs hover:bg-[#15803d] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Exactly 3 Recent Students or Empty State */}
            {allStudents.length === 0 ? (
              <div className="py-2.5 text-center flex flex-col items-center justify-center">
                <div className="w-7 h-7 rounded-lg bg-white text-[#16A34A] border border-[#16A34A20] flex items-center justify-center mb-1 shadow-2xs">
                  <GraduationCap className="w-3.5 h-3.5 text-[#16A34A]" />
                </div>
                <p className="text-xs font-black text-[#172B50]">No enrolled students yet</p>
                <p className="text-[9.5px] font-medium text-[#172B50]/55 mt-0.5">Enrolled recruits will appear here</p>
                <button
                  type="button"
                  onClick={() => setModalType('student')}
                  className="mt-1.5 px-2.5 py-0.5 text-[10.5px] font-bold text-[#16A34A] bg-white border border-[#16A34A30] hover:bg-[#16A34A] hover:text-white rounded-lg transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  + Enroll Student
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {allStudents.slice(0, 3).map((stu) => (
                  <div
                    key={stu.id}
                    className="bg-white rounded-xl px-2.5 py-1.5 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-1.5 shrink-0 hover:border-[#16A34A30] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-black text-[#172B50] truncate leading-tight">{stu.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="inline-block px-1.5 py-0.2 rounded-full text-[8.5px] font-black bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                          {stu.status || 'Active'}
                        </span>
                        <span className="text-[9.5px] font-medium text-[#172B50]/55 truncate">
                          {stu.program || 'Spartan Gymnastics & Agility'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          addToast(`${stu.name} attendance recorded`);
                          setCurrentView('people');
                          if (setActiveSubTab) setActiveSubTab('students');
                        }}
                        className="w-5.5 h-5.5 rounded-md bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
                        title="Active Student & Go to Students"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('people');
                          if (setActiveSubTab) setActiveSubTab('students');
                        }}
                        className="w-5.5 h-5.5 rounded-md bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
                        title="View Profile"
                      >
                        <User className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Footer */}
          <div className="pt-2 border-t border-[#172B500C] flex items-center justify-between text-xs mt-auto shrink-0">
            <span className="text-[10px] font-bold text-[#172B50]/65 uppercase tracking-wider">
              ENROLLMENT
            </span>
            <button
              type="button"
              onClick={() => {
                setCurrentView('people');
                if (setActiveSubTab) setActiveSubTab('students');
              }}
              className="text-[11px] font-black text-[#16A34A] hover:text-[#15803d] flex items-center gap-1 group cursor-pointer transition-colors"
            >
              <span>View All ({allStudents.length})</span>
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Card 4: Student Engagement (After Enrollment)        */}
        {/* ---------------------------------------------------- */}
        <div className="bg-[#FEF7D6] rounded-[22px] p-3.5 sm:p-4 border border-[#EAB308]/25 shadow-[0_4px_20px_rgba(202,138,4,0.05)] flex flex-col justify-between h-[245px] sm:h-[250px]">
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-white text-[#CA8A04] border border-[#EAB30835] shadow-2xs flex items-center justify-center shrink-0">
                <Calendar className="w-3.5 h-3.5 text-[#CA8A04]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-[13px] font-black text-[#172B50] tracking-tight truncate">
                  Student Engagement
                </h3>
                <p className="text-[10px] font-medium text-[#172B50]/60 truncate leading-none">
                  Ongoing student lifecycle
                </p>
              </div>
            </div>

            {/* 4 Action Tiles: 2x2 grid */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-0.5">
              {/* Tile 1: Class Schedule (Active dark blue) */}
              <button
                type="button"
                onClick={() => setCurrentView('schedules')}
                className="bg-[#0B3B60] text-white rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-center text-center shadow-xs hover:bg-[#082d4a] active:scale-95 transition-all cursor-pointer h-[56px] sm:h-[58px] group"
              >
                <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center mb-0.5 group-hover:scale-105 transition-transform">
                  <Calendar className="w-3 h-3 text-white" />
                </div>
                <span className="text-[10.5px] font-black text-white leading-tight">
                  Class Schedule
                </span>
                <span className="text-[8.5px] font-medium text-white/70 leading-none mt-0.5">
                  Daily Timetable
                </span>
              </button>

              {/* Tile 2: Attendance */}
              <button
                type="button"
                onClick={() => {
                  if (setActiveSubTab) setActiveSubTab('student_attendance');
                  setCurrentView('attendance_compensation');
                }}
                className="bg-white text-[#172B50] rounded-xl p-1.5 sm:p-2 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer h-[56px] sm:h-[58px] group"
              >
                <div className="w-5 h-5 rounded-md bg-[#FFF4E8] flex items-center justify-center mb-0.5 group-hover:scale-105 transition-transform">
                  <BarChart2 className="w-3 h-3 text-[#172B50]" />
                </div>
                <span className="text-[10.5px] font-black text-[#172B50] leading-tight">
                  Attendance
                </span>
                <span className="text-[8.5px] font-medium text-[#172B50]/60 leading-none mt-0.5">
                  Roll Call &amp; Logs
                </span>
              </button>

              {/* Tile 3: Performance */}
              <button
                type="button"
                onClick={() => setCurrentView('sports_events')}
                className="bg-white text-[#172B50] rounded-xl p-1.5 sm:p-2 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer h-[56px] sm:h-[58px] group"
              >
                <div className="w-5 h-5 rounded-md bg-[#FFF5ED] flex items-center justify-center mb-0.5 group-hover:scale-105 transition-transform">
                  <Star className="w-3 h-3 text-[#F4510B]" />
                </div>
                <span className="text-[10.5px] font-black text-[#172B50] leading-tight">
                  Performance
                </span>
                <span className="text-[8.5px] font-medium text-[#172B50]/60 leading-none mt-0.5">
                  Badges &amp; Skills
                </span>
              </button>

              {/* Tile 4: Parent Updates */}
              <button
                type="button"
                onClick={() => setCurrentView('communication')}
                className="bg-white text-[#172B50] rounded-xl p-1.5 sm:p-2 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer h-[56px] sm:h-[58px] group"
              >
                <div className="w-5 h-5 rounded-md bg-[#F0F7FF] flex items-center justify-center mb-0.5 group-hover:scale-105 transition-transform">
                  <Users className="w-3.5 h-3.5 text-[#0284C7]" />
                </div>
                <span className="text-[10.5px] font-black text-[#172B50] leading-tight">
                  Parent Updates
                </span>
                <span className="text-[8.5px] font-medium text-[#172B50]/60 leading-none mt-0.5">
                  Broadcasts
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-2 border-t border-[#172B500C] flex items-center justify-between text-xs mt-auto shrink-0">
            <span className="text-[10px] font-bold text-[#172B50]/65 uppercase tracking-wider">
              AFTER ENROLLMENT
            </span>
            <button
              type="button"
              onClick={() => setCurrentView('schedules')}
              className="text-[11px] font-black text-[#B45309] hover:text-[#92400E] flex items-center gap-1 group cursor-pointer transition-colors"
            >
              <span>View All ({liveClasses.length || 0})</span>
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>



      {/* ============================================================ */}
      {/* 5. MODALS (Enroll Student, Add Enquiry, Quick Payment)         */}
      {/* ============================================================ */}
      {/* 1. Enroll Student Modal */}
      <Modal
        isOpen={modalType === 'student'}
        onClose={() => setModalType(null)}
        title="Enroll New Spartan Student"
        subtitle="Register athlete into official Little Spartans Academy roster"
      >
        <form onSubmit={handleCreateStudent} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Athlete Full Name *</label>
            <input
              type="text"
              required
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Age *</label>
              <input
                type="number"
                min="3"
                max="16"
                required
                value={newStudentAge}
                onChange={(e) => setNewStudentAge(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Assigned Program</label>
              <select
                value={newStudentProgram}
                onChange={(e) => setNewStudentProgram(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {data.programs.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                value={newStudentParent}
                onChange={(e) => setNewStudentParent(e.target.value)}
                placeholder="e.g. Shalini Rao"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Contact Phone *</label>
              <input
                type="tel"
                required
                value={newStudentPhone}
                onChange={(e) => setNewStudentPhone(e.target.value)}
                placeholder="+91 98888 77777"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Enroll Athlete Now
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Add Enquiry Modal */}
      <Modal
        isOpen={modalType === 'enquiry'}
        onClose={() => setModalType(null)}
        title="Add New Enquiry"
        subtitle="Capture prospective student information"
      >
        <form onSubmit={handleCreateEnquiry} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Child Name *</label>
              <input
                type="text"
                required
                value={enqChild}
                onChange={(e) => setEnqChild(e.target.value)}
                placeholder="Child's name"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Parent Name *</label>
              <input
                type="text"
                required
                value={enqParent}
                onChange={(e) => setEnqParent(e.target.value)}
                placeholder="Parent's name"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={enqPhone}
                onChange={(e) => setEnqPhone(e.target.value)}
                placeholder="+91 98..."
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Parent Email ID</label>
              <input
                type="email"
                value={enqEmail}
                onChange={(e) => setEnqEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Location *</label>
              <select
                value={enqLocation}
                onChange={(e) => setEnqLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {commonLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Interested Program</label>
              <select
                value={enqProgram}
                onChange={(e) => setEnqProgram(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {data.programs.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Save Enquiry
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Quick Payment Modal */}
      <Modal
        isOpen={modalType === 'payment'}
        onClose={() => setModalType(null)}
        title="Record Fee Collection"
        subtitle="Generate instant receipt for tuition fee"
      >
        <form onSubmit={handleQuickPayment} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Select Student</label>
            <select
              value={payStudent}
              onChange={(e) => setPayStudent(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            >
              {data.students.map(s => (
                <option key={s.id} value={s.name}>{s.name} ({s.program})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Fee Amount (₹)</label>
            <input
              type="number"
              required
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Record Payment
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
