import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
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
  Package
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import FloatingCard from '../../components/common/FloatingCard';
import { getCommonLocations } from '../../services/locationService';
import { calculateDemoMetrics } from '../../services/demoService';

export default function AdminDashboard() {
  const { data, setCurrentView, addStudent, addEnquiry, addPayment, addToast } = useCrm();
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
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

          {/* 3. Profile */}
          <div 
            onClick={() => setCurrentView('people')}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full ring-2 ring-white shadow-2xs overflow-hidden cursor-pointer hover:ring-[#F4510B] transition-all" 
            title="Admin Profile"
          >
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"
              alt="Admin"
              className="w-full h-full object-cover"
            />
          </div>

          {/* 4. Upload */}
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
      {/* 2. FOUR PIPELINE SECTIONS WITH SVG FORK / BRACKET CONNECTORS  */}
      {/* ============================================================ */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
          
          {/* ---------------------------------------------------- */}
          {/* Card 1: Enquiry Intake (Lead Capture)                 */}
          {/* ---------------------------------------------------- */}
          <FloatingCard 
            maxTilt={3} 
            scale={1.01} 
            glare={false}
            className="relative bg-[#FFF9F5] rounded-[24px] p-4 sm:p-4.5 border border-[#F4510B18] shadow-[0_4px_25px_rgba(244,81,11,0.03)] h-full"
            contentClassName="flex flex-col justify-between h-full"
          >
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-3.5">
                <div className="w-8.5 h-8.5 rounded-xl bg-white text-[#F4510B] border border-[#F4510B25] shadow-2xs flex items-center justify-center shrink-0">
                  <Inbox className="w-4 h-4 text-[#F4510B]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                    Enquiry Intake
                  </h3>
                  <p className="text-[11px] font-medium text-[#172B50]/60">
                    Capture and qualify new leads
                  </p>
                </div>
              </div>

              {/* Dynamic Enquiries (5 Visible, Scroll if > 5) or Clean Zero State */}
              {allEnquiries.length === 0 ? (
                <div className="min-h-[258px] py-6 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#F4510B] border border-[#F4510B20] flex items-center justify-center mb-2 shadow-2xs">
                    <Inbox className="w-5 h-5 text-[#F4510B]" />
                  </div>
                  <p className="text-xs font-black text-[#172B50]">No enquiries logged yet</p>
                  <p className="text-[10px] font-medium text-[#172B50]/55 mt-0.5">Capture new leads to start pipeline</p>
                  <button
                    type="button"
                    onClick={() => setModalType('enquiry')}
                    className="mt-3 px-3 py-1.5 text-xs font-bold text-[#F4510B] bg-white border border-[#F4510B30] hover:bg-[#F4510B] hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    + Add Enquiry
                  </button>
                </div>
              ) : (
                <div className="min-h-[258px] max-h-[258px] overflow-y-auto space-y-1.5 pr-1">
                  {allEnquiries.map((enq) => (
                    <div
                      key={enq.id}
                      className="bg-white rounded-xl px-3 py-2 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-2 shrink-0 hover:border-[#F4510B30] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-black text-[#172B50] truncate leading-tight">{enq.childName}</p>
                        <p className="text-[10px] font-medium text-[#172B50]/60 mt-0.5 truncate leading-tight">
                          {enq.interestedProgram || 'Sports'} • {enq.center || 'KK NAGAR'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => addToast(`${enq.childName} enquiry verified`)}
                          className="w-6.5 h-6.5 rounded-lg bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
                          title="Verify"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentView('demos')}
                          className="w-6.5 h-6.5 rounded-lg bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] transition-all cursor-pointer"
                          title="Schedule Trial"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Footer: Workflow Stage & View All Link */}
            <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-2.5 shrink-0">
              <span className="text-[11px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                Lead Capture
              </span>
              <button
                type="button"
                onClick={() => setCurrentView('enquiries')}
                className="text-[11.5px] font-black text-[#F4510B] hover:text-[#d44105] flex items-center gap-1 group cursor-pointer transition-colors"
              >
                <span>View All ({allEnquiries.length})</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Desktop Connector 1 to Card 2: Cyan/Blue Bracket Curve */}
            <div className="hidden lg:block absolute -right-[22px] top-[48%] -translate-y-1/2 w-[22px] h-[105px] pointer-events-none z-20">
              <svg className="w-full h-full" viewBox="0 0 24 105" fill="none" preserveAspectRatio="none">
                <path 
                  d="M 0,28 C 9,28 10,52 14,52 C 18,52 19,22 24,22" 
                  stroke="#0284C7" 
                  strokeWidth="1.8" 
                  fill="none" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 14,52 L 24,52" 
                  stroke="#0284C7" 
                  strokeWidth="1.8" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 0,77 C 9,77 10,52 14,52 C 18,52 19,82 24,82" 
                  stroke="#0284C7" 
                  strokeWidth="1.8" 
                  fill="none" 
                  strokeLinecap="round" 
                />
              </svg>
            </div>
          </FloatingCard>

          {/* ---------------------------------------------------- */}
          {/* Card 2: Demo & Assessment (Demo Management)           */}
          {/* ---------------------------------------------------- */}
          <FloatingCard 
            maxTilt={3} 
            scale={1.01} 
            glare={false}
            className="relative bg-[#F4FAFF] rounded-[24px] p-4 sm:p-4.5 border border-[#0284C718] shadow-[0_4px_25px_rgba(2,132,199,0.03)] h-full"
            contentClassName="flex flex-col justify-between h-full"
          >
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-3.5">
                <div className="w-8.5 h-8.5 rounded-xl bg-white text-[#0284C7] border border-[#0284C725] shadow-2xs flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#0284C7]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                    Demo &amp; Assessment
                  </h3>
                  <p className="text-[11px] font-medium text-[#172B50]/60">
                    Schedule and track demo sessions
                  </p>
                </div>
              </div>

              {/* Dynamic Demos (5 Visible, Scroll if > 5) or Clean Zero State */}
              {allDemos.length === 0 ? (
                <div className="min-h-[258px] py-6 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#0284C7] border border-[#0284C720] flex items-center justify-center mb-2 shadow-2xs">
                    <Mail className="w-5 h-5 text-[#0284C7]" />
                  </div>
                  <p className="text-xs font-black text-[#172B50]">No demos scheduled</p>
                  <p className="text-[10px] font-medium text-[#172B50]/55 mt-0.5">Trials will appear here once booked</p>
                  <button
                    type="button"
                    onClick={() => setCurrentView('demos')}
                    className="mt-3 px-3 py-1.5 text-xs font-bold text-[#0284C7] bg-white border border-[#0284C730] hover:bg-[#0284C7] hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    Demo Register
                  </button>
                </div>
              ) : (
                <div className="min-h-[258px] max-h-[258px] overflow-y-auto space-y-1.5 pr-1">
                  {allDemos.map((demo) => (
                    <div
                      key={demo.id}
                      className="bg-white rounded-xl px-3 py-2 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-2 shrink-0 hover:border-[#0284C730] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-black text-[#172B50] truncate leading-tight">{demo.childName}</p>
                        <p className="text-[10px] font-medium text-[#172B50]/60 mt-0.5 truncate leading-tight">
                          {demo.program || demo.className || 'Trial'} Demo
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => addToast(`${demo.childName} demo verified`)}
                          className="w-6.5 h-6.5 rounded-lg bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
                          title="Verify Demo"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentView('demos')}
                          className="w-6.5 h-6.5 rounded-lg bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-[#F0F7FF] hover:text-[#0284C7] transition-all cursor-pointer"
                          title="View Slot"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Footer: Workflow Stage & View All Link */}
            <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-2.5 shrink-0">
              <span className="text-[11px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                Demo Management
              </span>
              <button
                type="button"
                onClick={() => setCurrentView('demos')}
                className="text-[11.5px] font-black text-[#0284C7] hover:text-[#0369a1] flex items-center gap-1 group cursor-pointer transition-colors"
              >
                <span>View All ({allDemos.length})</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Desktop Connector 2 to Card 3: Orange Bracket Curve */}
            <div className="hidden lg:block absolute -right-[22px] top-[48%] -translate-y-1/2 w-[22px] h-[105px] pointer-events-none z-20">
              <svg className="w-full h-full" viewBox="0 0 24 105" fill="none" preserveAspectRatio="none">
                <path 
                  d="M 0,22 C 9,22 10,52 14,52 C 18,52 19,22 24,22" 
                  stroke="#F4510B" 
                  strokeWidth="1.8" 
                  fill="none" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 0,52 L 24,52" 
                  stroke="#F4510B" 
                  strokeWidth="1.8" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 0,82 C 9,82 10,52 14,52 C 18,52 19,82 24,82" 
                  stroke="#F4510B" 
                  strokeWidth="1.8" 
                  fill="none" 
                  strokeLinecap="round" 
                />
              </svg>
            </div>
          </FloatingCard>

          {/* ---------------------------------------------------- */}
          {/* Card 3: Admission & Enrollment (Enrollment)          */}
          {/* ---------------------------------------------------- */}
          <FloatingCard 
            maxTilt={3} 
            scale={1.01} 
            glare={false}
            className="relative bg-[#F4FDF7] rounded-[24px] p-4 sm:p-4.5 border border-[#16A34A18] shadow-[0_4px_25px_rgba(22,163,74,0.03)] h-full"
            contentClassName="flex flex-col justify-between h-full"
          >
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-3.5">
                <div className="w-8.5 h-8.5 rounded-xl bg-white text-[#16A34A] border border-[#16A34A25] shadow-2xs flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-[#16A34A]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                    Admission &amp; Enrollment
                  </h3>
                  <p className="text-[11px] font-medium text-[#172B50]/60">
                    Convert demo to enrollment
                  </p>
                </div>
              </div>

              {/* Dynamic Students (5 Visible, Scroll if > 5) or Clean Zero State */}
              {allStudents.length === 0 ? (
                <div className="min-h-[258px] py-6 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#16A34A] border border-[#16A34A20] flex items-center justify-center mb-2 shadow-2xs">
                    <GraduationCap className="w-5 h-5 text-[#16A34A]" />
                  </div>
                  <p className="text-xs font-black text-[#172B50]">No enrolled students yet</p>
                  <p className="text-[10px] font-medium text-[#172B50]/55 mt-0.5">Enrolled recruits will appear here</p>
                  <button
                    type="button"
                    onClick={() => setModalType('student')}
                    className="mt-3 px-3 py-1.5 text-xs font-bold text-[#16A34A] bg-white border border-[#16A34A30] hover:bg-[#16A34A] hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    + Enroll Student
                  </button>
                </div>
              ) : (
                <div className="min-h-[258px] max-h-[258px] overflow-y-auto space-y-1.5 pr-1">
                  {allStudents.map((stu) => (
                    <div
                      key={stu.id}
                      className="bg-white rounded-xl px-3 py-2 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-2 shrink-0 hover:border-[#16A34A30] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-black text-[#172B50] truncate leading-tight">{stu.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-block px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                            {stu.status || 'Enrolled'}
                          </span>
                          <span className="text-[9.5px] font-medium text-[#172B50]/55 truncate">
                            {stu.program || 'Junior Football'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => addToast(`${stu.name} attendance recorded`)}
                          className="w-6.5 h-6.5 rounded-lg bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
                          title="Active Student"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentView('people')}
                          className="w-6.5 h-6.5 rounded-lg bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
                          title="View Profile"
                        >
                          <User className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Footer: Workflow Stage & View All Link */}
            <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-2.5 shrink-0">
              <span className="text-[11px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                Enrollment
              </span>
              <button
                type="button"
                onClick={() => setCurrentView('people')}
                className="text-[11.5px] font-black text-[#16A34A] hover:text-[#15803d] flex items-center gap-1 group cursor-pointer transition-colors"
              >
                <span>View All ({allStudents.length})</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Desktop Connector 3 to Card 4: S-curve line directly to Class Schedule tile */}
            <div className="hidden lg:block absolute -right-[22px] top-[48%] -translate-y-1/2 w-[22px] h-[105px] pointer-events-none z-20">
              <svg className="w-full h-full" viewBox="0 0 24 105" fill="none" preserveAspectRatio="none">
                <path 
                  d="M 0,82 C 10,82 12,30 24,30" 
                  stroke="#0284C7" 
                  strokeWidth="1.8" 
                  fill="none" 
                  strokeLinecap="round" 
                />
                <circle cx="2" cy="82" r="2" fill="#0284C7" />
                <circle cx="22" cy="30" r="2" fill="#0284C7" />
              </svg>
            </div>
          </FloatingCard>

          {/* ---------------------------------------------------- */}
          {/* Card 4: Student Engagement (After Enrollment)        */}
          {/* ---------------------------------------------------- */}
          <FloatingCard 
            maxTilt={3} 
            scale={1.01} 
            glare={false}
            className="relative bg-white rounded-[24px] p-4 sm:p-4.5 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)] h-full"
            contentClassName="flex flex-col justify-between h-full"
          >
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-3.5">
                <div className="w-8.5 h-8.5 rounded-xl bg-[#FFF5ED] text-[#F4510B] border border-[#F4510B25] shadow-2xs flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-[#F4510B]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                    Student Engagement
                  </h3>
                  <p className="text-[11px] font-medium text-[#172B50]/60">
                    Ongoing student lifecycle
                  </p>
                </div>
              </div>

              {/* 4 Action Tiles: 2x2 grid aligned with 5-record height */}
              <div className="min-h-[258px] max-h-[258px] flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-2">
                  {/* Tile 1: Class Schedule (Active dark blue) */}
                  <button
                    type="button"
                    onClick={() => setCurrentView('schedules')}
                    className="bg-[#0B3B60] text-white rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm hover:bg-[#082d4a] active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                      <Calendar className="w-4.5 h-4.5 text-white" />
                    </div>
                    <span className="text-xs font-black text-white leading-tight">
                      Class Schedule
                    </span>
                    <span className="text-[9.5px] font-medium text-white/70 mt-0.5">
                      Daily Sessions
                    </span>
                  </button>

                  {/* Tile 2: Attendance */}
                  <button
                    type="button"
                    onClick={() => setCurrentView('attendance_compensation')}
                    className="bg-white text-[#172B50] rounded-xl p-3 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FFF4E8] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                      <BarChart2 className="w-4.5 h-4.5 text-[#172B50]" />
                    </div>
                    <span className="text-xs font-black text-[#172B50] leading-tight">
                      Attendance
                    </span>
                    <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                      Roll Call & Logs
                    </span>
                  </button>

                  {/* Tile 3: Performance */}
                  <button
                    type="button"
                    onClick={() => setCurrentView('sports_events')}
                    className="bg-white text-[#172B50] rounded-xl p-3 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FFF5ED] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                      <Star className="w-4.5 h-4.5 text-[#F4510B]" />
                    </div>
                    <span className="text-xs font-black text-[#172B50] leading-tight">
                      Performance
                    </span>
                    <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                      Badges & Skills
                    </span>
                  </button>

                  {/* Tile 4: Parent Updates */}
                  <button
                    type="button"
                    onClick={() => setCurrentView('communication')}
                    className="bg-white text-[#172B50] rounded-xl p-3 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F0F7FF] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                      <Users className="w-4.5 h-4.5 text-[#0284C7]" />
                    </div>
                    <span className="text-xs font-black text-[#172B50] leading-tight">
                      Parent Updates
                    </span>
                    <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                      Broadcasts
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Footer: Workflow Stage & View All Link */}
            <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-2.5 shrink-0">
              <span className="text-[11px] font-bold text-[#172B50]/65 uppercase tracking-wider">
                After Enrollment
              </span>
              <button
                type="button"
                onClick={() => setCurrentView('schedules')}
                className="text-[11.5px] font-black text-[#172B50] hover:text-[#F4510B] flex items-center gap-1 group cursor-pointer transition-colors"
              >
                <span>View All ({liveClasses.length})</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </FloatingCard>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MIDDLE ROW: Today's Classes, Enquiry Sources & Academy Operations */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
        
        {/* ---------------------------------------------------- */}
        {/* Card 1: Today's Classes                              */}
        {/* ---------------------------------------------------- */}
        <FloatingCard 
          maxTilt={2} 
          scale={1.006} 
          glare={false}
          className="w-full bg-white rounded-[28px] p-5 sm:p-6 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)] h-[440px] min-h-[440px]"
          contentClassName="flex flex-col justify-between h-full"
        >
          <div>
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#172B5010]">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0 shadow-2xs">
                <CalendarDays className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#F4510B]" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#172B50] tracking-tight">
                Today's Classes
              </h2>
            </div>
          </div>

          {/* Live Classes Table or Clean Zero State */}
          {liveClasses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-4 my-auto">
              <div className="w-11 h-11 rounded-2xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center mb-2.5 shadow-2xs">
                <CalendarDays className="w-5.5 h-5.5" />
              </div>
              <p className="text-xs sm:text-sm font-black text-[#172B50]">
                No classes scheduled for today
              </p>
              <p className="text-[11px] text-[#172B50]/60 mt-1 max-w-[240px]">
                Scheduled training sessions will appear here live
              </p>
              <button
                type="button"
                onClick={() => setCurrentView('schedules')}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#F4510B] bg-[#FFF5ED] hover:bg-[#F4510B] hover:text-white rounded-xl transition-all cursor-pointer shadow-2xs group"
              >
                <span>Open Class Schedules</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[300px] mt-1 pr-0.5 scrollbar-thin">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#172B5010] text-[#172B50]/60 font-black uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-2.5">TIME</th>
                    <th className="py-2 px-2.5">PROGRAM</th>
                    <th className="py-2 px-2.5">COACH</th>
                    <th className="py-2 px-2.5">LOCATION</th>
                    <th className="py-2 px-2.5 text-right">CAPACITY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B500C]">
                  {liveClasses.slice(0, 5).map((cls) => {
                    const enrolled = cls.enrolledCount ?? (cls.enrolledStudents ? cls.enrolledStudents.length : 0);
                    const capacity = cls.capacity || 20;
                    const isFull = enrolled >= capacity;
                    const isNearlyFull = !isFull && (enrolled / capacity >= 0.8);

                    return (
                      <tr 
                        key={cls.id} 
                        className="hover:bg-[#FFF4E8]/30 transition-colors cursor-pointer" 
                        onClick={() => setCurrentView('schedules')}
                      >
                        <td className="py-2.5 px-2.5">
                          <div className="flex items-center gap-1.5 font-black text-[#172B50]">
                            <Clock className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                            <span>{cls.startTime || cls.time || '09:00 AM'}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 font-extrabold text-[#172B50] max-w-[130px] truncate">
                          {cls.className || cls.program || 'Sports Session'}
                        </td>
                        <td className="py-2.5 px-2.5">
                          <div className="flex items-center gap-1 font-bold text-[#172B50]/85">
                            <User className="w-3 h-3 text-[#172B50]/40 shrink-0" />
                            <span className="truncate max-w-[90px]">{cls.coachName || cls.coach || 'Coach'}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <div className="flex items-center gap-1 font-bold text-[#172B50]/75">
                            <MapPin className="w-3 h-3 text-[#F4510B] shrink-0" />
                            <span>{cls.location || cls.center || 'KK NAGAR'}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 text-right">
                          {isFull ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F4510B] text-white">
                              Full {enrolled}/{capacity}
                            </span>
                          ) : isNearlyFull ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {enrolled}/{capacity}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {enrolled}/{capacity}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom Footer matching Priority Tasks */}
          <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-auto shrink-0">
            <span className="text-[11px] font-bold text-[#172B50]/60 uppercase tracking-wider">
              Daily Timetable
            </span>
            <button
              type="button"
              onClick={() => setCurrentView('schedules')}
              className="text-[11.5px] font-black text-[#F4510B] hover:text-[#d44307] flex items-center gap-1 group cursor-pointer transition-colors"
            >
              <span>Explore all classes</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </FloatingCard>

        {/* ---------------------------------------------------- */}
        {/* Card 2: Enquiry Sources (Exact width & height of Today's Classes) */}
        {/* ---------------------------------------------------- */}
        <FloatingCard 
          maxTilt={2} 
          scale={1.006} 
          glare={false}
          onClick={() => setCurrentView('enquiries')}
          className="w-full bg-white rounded-[28px] p-5 sm:p-6 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)] cursor-pointer hover:border-[#F4510B35] h-[440px] min-h-[440px] transition-all"
          contentClassName="flex flex-col justify-between h-full"
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#172B5010]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0 shadow-2xs">
                  <GraduationCap className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#F4510B]" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-[#172B50] tracking-tight">
                  Enquiry Sources
                </h2>
              </div>
              <span className="text-[10.5px] font-extrabold text-[#F4510B] bg-[#FFF5ED] px-2.5 py-1 rounded-full border border-[#F4510B20] select-none">
                {totalEnquiries} Leads
              </span>
            </div>
          </div>

          {/* Centered Donut, Legend & Source Breakdown (Removes excessive empty space) */}
          <div className="flex-1 flex flex-col justify-center py-2.5 my-auto">
            {/* Donut and Primary Legend */}
            <div className="flex items-center justify-center gap-5 sm:gap-6">
              {/* SVG Donut */}
              <div className="relative w-30 h-30 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
                <svg className="w-30 h-30 sm:w-32 sm:h-32" viewBox="0 0 160 160">
                  {/* Background track circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="50"
                    fill="transparent"
                    stroke="#172B50"
                    strokeWidth="20"
                    opacity={totalEnquiries > 0 ? "0.08" : "0.12"}
                  />

                  {totalEnquiries > 0 && (
                    <>
                      {/* Website Segment */}
                      <circle
                        cx="80"
                        cy="80"
                        r="50"
                        fill="transparent"
                        stroke="#F4510B"
                        strokeWidth="20"
                        strokeDasharray={`${(websiteCount / totalEnquiries) * 314.16} 314.16`}
                        strokeDashoffset="0"
                        transform="rotate(-90 80 80)"
                      />
                      {/* Manual / Walk-in Segment */}
                      <circle
                        cx="80"
                        cy="80"
                        r="50"
                        fill="transparent"
                        stroke="#0284C7"
                        strokeWidth="20"
                        strokeDasharray={`${(manualCount / totalEnquiries) * 314.16} 314.16`}
                        strokeDashoffset={`-${(websiteCount / totalEnquiries) * 314.16}`}
                        transform="rotate(-90 80 80)"
                      />
                    </>
                  )}

                  {/* Inner text matching live metrics */}
                  <text x="80" y="74" textAnchor="middle" className="text-3xl font-black fill-[#172B50] font-sans">
                    {totalEnquiries}
                  </text>
                  <text x="80" y="90" textAnchor="middle" className="text-[10px] font-bold fill-[#172B50] opacity-65 font-sans tracking-wider uppercase">
                    Total
                  </text>
                  <text x="80" y="102" textAnchor="middle" className="text-[10px] font-bold fill-[#172B50] opacity-65 font-sans tracking-wider uppercase">
                    Enquiries
                  </text>
                </svg>
              </div>

              {/* Dynamic Legend */}
              <div className="space-y-2 text-xs w-full max-w-[145px]">
                <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-[#FFF5ED] transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F4510B] shrink-0" />
                    <span className="font-extrabold text-[#172B50]">Website</span>
                  </div>
                  <span className="font-black text-[#172B50]">{websitePct}%</span>
                </div>

                <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-[#F0F9FF] transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] shrink-0" />
                    <span className="font-extrabold text-[#172B50] truncate">Manual / Walk-in</span>
                  </div>
                  <span className="font-black text-[#172B50]">{manualPct}%</span>
                </div>
              </div>
            </div>

            {/* Source Details Cards */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#172B500C]">
              {/* Website Channel */}
              <div className="p-2.5 rounded-2xl bg-[#FFF9F5] border border-[#F4510B18] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-black text-[#172B50] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F4510B]" />
                    <span>Website</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-[#F4510B]">{websitePct}%</span>
                </div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className="text-base sm:text-lg font-black text-[#172B50]">{websiteCount}</span>
                  <span className="text-[9.5px] font-bold text-[#172B50]/55">online leads</span>
                </div>
              </div>

              {/* Manual / Walk-in Channel */}
              <div className="p-2.5 rounded-2xl bg-[#F0F9FF] border border-[#0284C718] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-black text-[#172B50] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                    <span className="truncate">Walk-in</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-[#0284C7]">{manualPct}%</span>
                </div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className="text-base sm:text-lg font-black text-[#172B50]">{manualCount}</span>
                  <span className="text-[9.5px] font-bold text-[#172B50]/55">desk leads</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Link matching Priority Tasks */}
          <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-auto shrink-0">
            <span className="text-[11px] font-bold text-[#172B50]/60 uppercase tracking-wider">
              Lead Channels
            </span>
            <button
              type="button"
              onClick={() => setCurrentView('enquiries')}
              className="text-[11.5px] font-black text-[#F4510B] hover:text-[#d44307] flex items-center gap-1 group cursor-pointer transition-colors"
            >
              <span>Explore all enquiries</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </FloatingCard>

        {/* ---------------------------------------------------- */}
        {/* Card 3: Academy Operations (UI/UX Ref: Image 3)      */}
        {/* ---------------------------------------------------- */}
        <FloatingCard 
          maxTilt={2} 
          scale={1.006} 
          glare={false}
          className="w-full bg-white rounded-[28px] p-5 sm:p-6 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)] h-[440px] min-h-[440px]"
          contentClassName="flex flex-col justify-between h-full"
        >
          <div>
            {/* Header matching Image 3 */}
            <div className="flex items-center gap-3 pb-3.5 border-b border-[#172B5010]">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0 shadow-2xs">
                <Building2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#F4510B]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#172B50] tracking-tight">
                  Academy Operations
                </h2>
                <p className="text-[11px] font-medium text-[#172B50]/60">
                  Centers, faculty & equipment
                </p>
              </div>
            </div>

            {/* 4 Action Tiles: 2-column grid matching Image 3 */}
            <div className="min-h-[265px] flex flex-col justify-center mt-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                {/* Tile 1: Coaches & Staff (Featured dark blue tile) */}
                <button
                  type="button"
                  onClick={() => setCurrentView('people')}
                  className="bg-[#0B3B60] text-white rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-center text-center shadow-sm hover:bg-[#082d4a] active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                >
                  <div className="w-8.5 h-8.5 rounded-xl bg-white/10 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <UserCheck className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="text-xs font-black text-white leading-tight">
                    Coaches & Staff
                  </span>
                  <span className="text-[9.5px] font-medium text-white/70 mt-0.5">
                    {data.coaches?.length || 6} Active Coaches
                  </span>
                </button>

                {/* Tile 2: Training Centers */}
                <button
                  type="button"
                  onClick={() => setCurrentView('people')}
                  className="bg-white text-[#172B50] rounded-2xl p-3 sm:p-3.5 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#F4510B35] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                >
                  <div className="w-8.5 h-8.5 rounded-xl bg-[#FFF5ED] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <MapPin className="w-4.5 h-4.5 text-[#F4510B]" />
                  </div>
                  <span className="text-xs font-black text-[#172B50] leading-tight">
                    Training Centers
                  </span>
                  <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                    {commonLocations?.length || data.academy?.centers?.length || 5} Venues
                  </span>
                </button>

                {/* Tile 3: Competitions */}
                <button
                  type="button"
                  onClick={() => setCurrentView('sports_events')}
                  className="bg-white text-[#172B50] rounded-2xl p-3 sm:p-3.5 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#F4510B35] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                >
                  <div className="w-8.5 h-8.5 rounded-xl bg-[#FFF4E8] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Trophy className="w-4.5 h-4.5 text-[#F4510B]" />
                  </div>
                  <span className="text-xs font-black text-[#172B50] leading-tight">
                    Competitions
                  </span>
                  <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                    {data.competitions?.length || 0} Fixtures & Cups
                  </span>
                </button>

                {/* Tile 4: Equipment & Kits */}
                <button
                  type="button"
                  onClick={() => setCurrentView('equipment')}
                  className="bg-white text-[#172B50] rounded-2xl p-3 sm:p-3.5 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#0284C735] hover:bg-[#F0F9FF] active:scale-95 transition-all cursor-pointer min-h-[120px] group"
                >
                  <div className="w-8.5 h-8.5 rounded-xl bg-[#F0F9FF] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Package className="w-4.5 h-4.5 text-[#0284C7]" />
                  </div>
                  <span className="text-xs font-black text-[#172B50] leading-tight">
                    Equipment & Kits
                  </span>
                  <span className="text-[9.5px] font-medium text-[#172B50]/60 mt-0.5">
                    {data.equipment?.length || 0} Tracked Items
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Footer matching Image 3 */}
          <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-xs mt-auto shrink-0">
            <span className="text-[11px] font-bold text-[#172B50]/65 uppercase tracking-wider">
              Academy Network
            </span>
            <button
              type="button"
              onClick={() => setCurrentView('people')}
              className="text-[11.5px] font-black text-[#172B50] hover:text-[#F4510B] flex items-center gap-1 group cursor-pointer transition-colors"
            >
              <span>View All ({(data.coaches?.length || 6) + (commonLocations?.length || 5)})</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </FloatingCard>

      </div>

      {/* ============================================================ */}
      {/* 4. BOTTOM SECTION: Demo Performance (4 Cards in a Strip)      */}
      {/* ============================================================ */}
      <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)]">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0">
            <BarChart2 className="w-4 h-4 text-[#F4510B]" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#172B50] tracking-tight">
            Demo Performance
          </h2>
        </div>

        {/* 4 Metric Cards Bound to Real Live CRM Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Demos */}
          <FloatingCard 
            onClick={() => setCurrentView('demos')}
            maxTilt={6}
            scale={1.025}
            className="bg-gradient-to-br from-[#F0F7FF] via-[#F8FBFF] to-white rounded-2xl p-4 sm:p-5 border border-[#BAE6FD]/60 flex items-center gap-4 shadow-2xs hover:border-[#0284C7] transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
              <Calendar className="w-5.5 h-5.5 text-[#0284C7]" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                {demoMetrics.totalDemos || 0}
              </p>
              <p className="text-xs font-bold text-[#172B50]/70 mt-1">
                Total Demos
              </p>
            </div>
          </FloatingCard>

          {/* Card 2: Upcoming */}
          <FloatingCard 
            onClick={() => setCurrentView('demos')}
            maxTilt={6}
            scale={1.025}
            className="bg-gradient-to-br from-[#FAF5FF] via-[#FCF9FF] to-white rounded-2xl p-4 sm:p-5 border border-[#E9D5FF]/60 flex items-center gap-4 shadow-2xs hover:border-[#9333EA] transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
              <Clock className="w-5.5 h-5.5 text-[#9333EA]" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                {demoMetrics.upcomingDemos || 0}
              </p>
              <p className="text-xs font-bold text-[#172B50]/70 mt-1">
                Upcoming
              </p>
            </div>
          </FloatingCard>

          {/* Card 3: Completed */}
          <FloatingCard 
            onClick={() => setCurrentView('demos')}
            maxTilt={6}
            scale={1.025}
            className="bg-gradient-to-br from-[#F0FDF4] via-[#F8FDF9] to-white rounded-2xl p-4 sm:p-5 border border-[#BBF7D0]/60 flex items-center gap-4 shadow-2xs hover:border-[#16A34A] transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5.5 h-5.5 text-[#16A34A]" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                {demoMetrics.completedDemos || 0}
              </p>
              <p className="text-xs font-bold text-[#172B50]/70 mt-1">
                Completed
              </p>
            </div>
          </FloatingCard>

          {/* Card 4: Conversions */}
          <FloatingCard 
            onClick={() => setCurrentView('demos')}
            maxTilt={6}
            scale={1.025}
            className="bg-gradient-to-br from-[#FFF5ED] via-[#FFF9F5] to-white rounded-2xl p-4 sm:p-5 border border-[#FED7AA]/60 flex items-center gap-4 shadow-2xs hover:border-[#F4510B] transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FFE2D1] text-[#F4510B] flex items-center justify-center shrink-0">
              <Trophy className="w-5.5 h-5.5 text-[#F4510B]" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                {demoMetrics.studentConversions || 0}
              </p>
              <p className="text-xs font-bold text-[#172B50]/70 mt-1">
                Conversions
              </p>
            </div>
          </FloatingCard>
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
