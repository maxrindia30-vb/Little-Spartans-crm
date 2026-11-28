import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Maximize2,
  X,
  Camera,
  CameraOff,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Download,
  List,
  Layers,
  FileText,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { 
  COACH_ATTENDANCE_STATUS, 
  calculateWorkingDuration, 
  formatDisplayTime 
} from '../../services/coachAttendanceService';
import { getCoachApprovedLeaveForDate, LEAVE_TYPES } from '../../services/coachLeaveService';

const TIME_SLOTS = [
  '6:00 am',
  '7:00 am',
  '8:00 am',
  '9:00 am',
  '10:00 am',
  '11:00 am',
  '12:00 pm',
  '1:00 pm',
  '2:00 pm',
  '3:00 pm',
  '4:00 pm',
  '5:00 pm',
  '6:00 pm',
  '7:00 pm'
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatYMD(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseYMD(ymd) {
  if (!ymd) return new Date();
  const parts = ymd.split('-').map(Number);
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date();
}

function formatDisplayDate(ymd) {
  if (!ymd) return '';
  const d = parseYMD(ymd);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function extractHourSlot(timeStrOrIso) {
  if (!timeStrOrIso) return '9:00 am';
  if (typeof timeStrOrIso === 'string' && timeStrOrIso.includes('T')) {
    const d = new Date(timeStrOrIso);
    let h = d.getHours();
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return `${h}:00 ${ampm}`;
  }
  if (typeof timeStrOrIso === 'string') {
    const match = timeStrOrIso.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/);
    if (match) {
      let h = parseInt(match[1], 10);
      const isPm = match[3] && match[3].toLowerCase() === 'pm';
      if (isPm && h < 12) h += 12;
      if (!isPm && match[3] && match[3].toLowerCase() === 'am' && h === 12) h = 0;
      const ampm = h >= 12 ? 'pm' : 'am';
      const slotH = h % 12 || 12;
      return `${slotH}:00 ${ampm}`;
    }
  }
  return '9:00 am';
}

export default function CoachAttendanceCalendar({
  portalRole = 'admin',
  allowedLocations = null,
  allowedCoaches = null,
  defaultCoachId = null
}) {
  const { data, currentPortal, addToast } = useCrm();
  const effectiveRole = portalRole || currentPortal || 'admin';
  const isSuperCoach = effectiveRole === 'super_coach';

  // State: View Mode (Calendar vs List)
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [calendarView, setCalendarView] = useState('week'); // 'month' | 'week' | 'day'

  // Selected Date Anchor
  const todayYmd = useMemo(() => formatYMD(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(todayYmd);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedCoachId, setSelectedCoachId] = useState(defaultCoachId || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedBatchId, setSelectedBatchId] = useState('ALL');

  // Modals State
  const [inspectModalEntry, setInspectModalEntry] = useState(null);
  const [lightboxData, setLightboxData] = useState(null);

  const dateInputRef = useRef(null);

  // Scoped Locations List (Admin sees all; Super Coach sees strictly assigned locations)
  const availableLocations = useMemo(() => {
    if (allowedLocations && allowedLocations.length > 0) {
      return allowedLocations;
    }
    if (data.academy?.centers && data.academy.centers.length > 0) {
      return data.academy.centers;
    }
    return ['KK NAGAR', 'KILPAUK', 'MAHALINGAPURAM', 'ANNA NAGAR', 'KOLATHUR'];
  }, [allowedLocations, data.academy?.centers]);

  // Scoped Coaches List
  const availableCoaches = useMemo(() => {
    let list = allowedCoaches || data.coaches || [];
    if (isSuperCoach && availableLocations.length > 0) {
      list = list.filter(c => 
        availableLocations.includes(c.center) ||
        (c.assignedLocations || []).some(loc => availableLocations.includes(loc))
      );
    }
    return list;
  }, [allowedCoaches, data.coaches, isSuperCoach, availableLocations]);

  // Selected date object
  const currentDateObj = useMemo(() => parseYMD(selectedDate), [selectedDate]);

  // Heading label
  const monthYearHeading = useMemo(() => {
    return currentDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDateObj]);

  // Compute 7 days of the week for Week View
  const weekDays = useMemo(() => {
    const dayOfWeek = currentDateObj.getDay(); // 0 = Sunday
    const weekStart = new Date(currentDateObj);
    weekStart.setDate(currentDateObj.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const ymd = formatYMD(d);
      days.push({
        dayName: DAY_NAMES[i],
        dayShort: DAY_NAMES[i].slice(0, 3),
        dateNumber: String(d.getDate()).padStart(2, '0'),
        dateYmd: ymd,
        isToday: ymd === todayYmd,
        isSelected: ymd === selectedDate
      });
    }
    return days;
  }, [currentDateObj, selectedDate, todayYmd]);

  // Compute month grid days
  const monthGridDays = useMemo(() => {
    const year = currentDateObj.getFullYear();
    const month = currentDateObj.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const grid = [];
    // Leading days from previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      const prevDate = new Date(year, month, 1 - (startDayOfWeek - i));
      const ymd = formatYMD(prevDate);
      grid.push({
        dateNumber: String(prevDate.getDate()).padStart(2, '0'),
        dateYmd: ymd,
        isCurrentMonth: false,
        isToday: ymd === todayYmd,
        isSelected: ymd === selectedDate
      });
    }
    // Days in current month
    for (let i = 1; i <= totalDays; i++) {
      const curDate = new Date(year, month, i);
      const ymd = formatYMD(curDate);
      grid.push({
        dateNumber: String(i).padStart(2, '0'),
        dateYmd: ymd,
        isCurrentMonth: true,
        isToday: ymd === todayYmd,
        isSelected: ymd === selectedDate
      });
    }
    // Trailing days
    const remaining = (7 - (grid.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const ymd = formatYMD(nextDate);
      grid.push({
        dateNumber: String(nextDate.getDate()).padStart(2, '0'),
        dateYmd: ymd,
        isCurrentMonth: false,
        isToday: ymd === todayYmd,
        isSelected: ymd === selectedDate
      });
    }
    return grid;
  }, [currentDateObj, selectedDate, todayYmd]);

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(currentDateObj);
    if (calendarView === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (calendarView === 'day') {
      d.setDate(d.getDate() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    setSelectedDate(formatYMD(d));
  };

  const handleNext = () => {
    const d = new Date(currentDateObj);
    if (calendarView === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (calendarView === 'day') {
      d.setDate(d.getDate() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    setSelectedDate(formatYMD(d));
  };

  const handleToday = () => {
    setSelectedDate(todayYmd);
  };

  // Compile all unified attendance events across attendance records, approved leaves & schedules
  const allAttendanceEvents = useMemo(() => {
    const events = [];
    const rawAttendance = data.coachAttendanceRecords || [];
    const rawLeaves = data.coachLeaveRequests || [];
    const coaches = data.coaches || [];

    // 1. Process Actual Camera Attendance Records
    rawAttendance.forEach(rec => {
      // Role-based scope isolation
      if (isSuperCoach && availableLocations.length > 0 && !availableLocations.includes(rec.locationName)) {
        return;
      }

      const coach = coaches.find(c => c.id === rec.coachId || c.name === rec.coachName);
      const checkInHourSlot = extractHourSlot(rec.checkInTime || rec.checkInIso);
      
      // Determine refined status
      let eventStatus = 'checked_in';
      let statusLabel = 'Checked In';
      let statusColor = 'emerald'; // green

      if (rec.status === COACH_ATTENDANCE_STATUS.COMPLETED || rec.checkOutTime) {
        eventStatus = 'completed';
        statusLabel = 'Checked Out';
        statusColor = 'orange';
      } else {
        // If date is in the past and no checkout recorded
        if (rec.date < todayYmd) {
          eventStatus = 'incomplete';
          statusLabel = 'Incomplete (No Check-Out)';
          statusColor = 'amber';
        }
      }

      // Check if late check-in (after 09:30 AM or after assigned schedule time)
      if (rec.checkInTime && typeof rec.checkInTime === 'string') {
        const timeClean = rec.checkInTime.toLowerCase();
        if (timeClean.includes('10:') || timeClean.includes('11:') || timeClean.includes('12:')) {
          if (eventStatus !== 'incomplete') {
            eventStatus = 'late';
            statusLabel = 'Late Check-In';
            statusColor = 'amber';
          }
        }
      }

      events.push({
        id: rec.id || `ATT-${rec.date}-${rec.coachId}`,
        type: 'attendance',
        coachId: rec.coachId,
        coachName: rec.coachName || coach?.name || 'Coach',
        coachAvatar: coach?.avatar || rec.coachAvatar || null,
        coachRole: coach?.role || coach?.specialization || 'Coach',
        date: rec.date,
        timeSlot: checkInHourSlot,
        checkInTime: rec.checkInTime || '--:--',
        checkInIso: rec.checkInIso,
        checkInPhoto: rec.checkInPhoto || null,
        checkInLocation: rec.locationName || 'Main Center',
        checkOutTime: rec.checkOutTime || null,
        checkOutIso: rec.checkOutIso,
        checkOutPhoto: rec.checkOutPhoto || null,
        checkOutLocation: rec.checkOutLocation || rec.locationName || 'Main Center',
        totalDuration: rec.totalDurationFormatted || (rec.checkInIso && rec.checkOutIso ? calculateWorkingDuration(rec.checkInIso, rec.checkOutIso).formatted : '--'),
        status: eventStatus,
        statusLabel,
        statusColor,
        isCheckInException: rec.isCheckInException || false,
        checkInExceptionReason: rec.checkInExceptionReason || null,
        checkInApprovedBy: rec.checkInApprovedBy || null,
        isCheckOutException: rec.isCheckOutException || false,
        checkOutExceptionReason: rec.checkOutExceptionReason || null,
        checkOutApprovedBy: rec.checkOutApprovedBy || null,
        exceptionNotes: rec.exceptionNotes || null,
        remarks: rec.remarks || '',
        studentAttendanceSaved: rec.studentAttendanceSaved
      });
    });

    // 2. Process Approved Coach Leaves
    rawLeaves.forEach(leave => {
      if (leave.status !== 'Approved' && leave.status !== 'Completed') return;
      if (isSuperCoach && availableLocations.length > 0 && leave.center && !availableLocations.includes(leave.center)) {
        return;
      }

      const coach = coaches.find(c => c.id === leave.coachId || c.name === leave.coachName);
      const start = leave.startDate;
      const end = leave.endDate || leave.startDate;

      // Expand dates if range
      const cur = parseYMD(start);
      const endD = parseYMD(end);

      while (cur <= endD) {
        const ymd = formatYMD(cur);
        events.push({
          id: `LEAVE-${leave.id}-${ymd}`,
          type: 'leave',
          coachId: leave.coachId,
          coachName: leave.coachName || coach?.name || 'Coach',
          coachAvatar: coach?.avatar || null,
          coachRole: coach?.role || 'Coach',
          date: ymd,
          timeSlot: '9:00 am', // prominent banner
          checkInTime: null,
          checkInPhoto: null,
          checkInLocation: leave.center || 'All Centers',
          checkOutTime: null,
          checkOutPhoto: null,
          checkOutLocation: leave.center || 'All Centers',
          totalDuration: leave.leaveType === LEAVE_TYPES.HALF_DAY ? 'Half Day' : 'Full Day',
          status: 'on_leave',
          statusLabel: `On Leave (${leave.leaveType || 'Full Day'})`,
          statusColor: 'purple',
          remarks: leave.reason || 'Approved Leave',
          isLeave: true,
          leaveDetails: leave
        });
        cur.setDate(cur.getDate() + 1);
      }
    });

    return events;
  }, [data.coachAttendanceRecords, data.coachLeaveRequests, data.coaches, isSuperCoach, availableLocations, todayYmd]);

  // Filtered Events based on active filters
  const filteredEvents = useMemo(() => {
    return allAttendanceEvents.filter(ev => {
      // 1. Search Query (Coach Name, ID, Location)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = ev.coachName?.toLowerCase().includes(q);
        const matchId = ev.coachId?.toLowerCase().includes(q);
        const matchLoc = ev.checkInLocation?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchLoc) return false;
      }

      // 2. Location Filter
      if (selectedLocation !== 'ALL') {
        if (ev.checkInLocation !== selectedLocation && ev.checkOutLocation !== selectedLocation) {
          return false;
        }
      }

      // 3. Coach Filter
      if (selectedCoachId !== 'ALL' && ev.coachId !== selectedCoachId) {
        return false;
      }

      // 4. Status Filter
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'checked_in' && ev.status !== 'checked_in') return false;
        if (selectedStatus === 'completed' && ev.status !== 'completed') return false;
        if (selectedStatus === 'late' && ev.status !== 'late') return false;
        if (selectedStatus === 'incomplete' && ev.status !== 'incomplete') return false;
        if (selectedStatus === 'on_leave' && ev.status !== 'on_leave') return false;
        if (selectedStatus === 'absent' && ev.status !== 'absent') return false;
      }

      return true;
    });
  }, [allAttendanceEvents, searchQuery, selectedLocation, selectedCoachId, selectedStatus]);

  // Map events by date string and time slot
  const eventsByDateTime = useMemo(() => {
    const map = new Map();
    filteredEvents.forEach(ev => {
      const key = `${ev.date}::${ev.timeSlot}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);

      // Also map by date
      if (!map.has(ev.date)) map.set(ev.date, []);
      map.get(ev.date).push(ev);
    });
    return map;
  }, [filteredEvents]);

  // Export filtered attendance records to CSV
  const handleExportCsv = () => {
    const headers = [
      'COACH ID',
      'COACH NAME',
      'DATE',
      'LOCATION',
      'CHECK-IN TIME',
      'CHECK-OUT TIME',
      'DURATION',
      'STATUS',
      'CHECK-IN PHOTO AVAILABLE',
      'CHECK-OUT PHOTO AVAILABLE'
    ];

    const rows = filteredEvents.map(ev => [
      `"${ev.coachId}"`,
      `"${ev.coachName}"`,
      `"${ev.date}"`,
      `"${ev.checkInLocation}"`,
      `"${ev.checkInTime || '--'}"`,
      `"${ev.checkOutTime || '--'}"`,
      `"${ev.totalDuration}"`,
      `"${ev.statusLabel}"`,
      `"${ev.checkInPhoto ? 'YES' : 'NO'}"`,
      `"${ev.checkOutPhoto ? 'YES' : 'NO'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `coach_attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Coach attendance records exported to CSV successfully.', 'success');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* ============================================================ */}
      {/* 1. TOP HEADER & FILTER TOOLBAR                               */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B5014] shadow-xs space-y-4">
        
        {/* Row 1: Title, View Switcher & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0 shadow-2xs">
              <CalendarIcon className="w-5 h-5 text-[#F4510B]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">
                  Coach Attendance Calendar
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B25]">
                  {effectiveRole === 'admin' ? 'Academy Wide' : 'Assigned Locations'}
                </span>
              </div>
              <p className="text-xs text-[#172B50]/65 mt-0.5">
                Camera check-in / check-out history, working durations & photo verification
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Switcher: Calendar vs List */}
            <div className="inline-flex items-center bg-[#F4F6F9] p-1 rounded-2xl border border-[#172B5010]">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-white text-[#172B50] shadow-xs font-black'
                    : 'text-[#172B50]/70 hover:text-[#172B50]'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-[#F4510B]" />
                <span>Calendar</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-[#172B50] shadow-xs font-black'
                    : 'text-[#172B50]/70 hover:text-[#172B50]'
                }`}
              >
                <List className="w-3.5 h-3.5 text-[#F4510B]" />
                <span>List View</span>
                {filteredEvents.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#172B5010] text-[#172B50]">
                    {filteredEvents.length}
                  </span>
                )}
              </button>
            </div>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#F4510B] hover:bg-[#FFE8D6] transition-all border border-[#F4510B25] shadow-2xs cursor-pointer"
              title="Export filtered records to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Row 2: Comprehensive Filters Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-[#172B500C]">
          
          {/* 1. Search by Coach Name */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#172B50]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coach / ID..."
              className="w-full pl-8.5 pr-3 py-2 text-xs font-semibold rounded-xl border border-[#172B501A] bg-white text-[#172B50] focus:outline-none focus:border-[#F4510B] shadow-2xs placeholder:text-[#172B50]/40"
            />
          </div>

          {/* 2. Location Filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[#172B501A] bg-white text-[#172B50] focus:outline-none focus:border-[#F4510B] shadow-2xs cursor-pointer"
            >
              <option value="ALL">
                {isSuperCoach ? `All Assigned Centers (${availableLocations.length})` : 'All Academy Centers'}
              </option>
              {availableLocations.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Coach Filter */}
          <div>
            <select
              value={selectedCoachId}
              onChange={(e) => setSelectedCoachId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[#172B501A] bg-white text-[#172B50] focus:outline-none focus:border-[#F4510B] shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Faculty Coaches ({availableCoaches.length})</option>
              {availableCoaches.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.center || 'Faculty'})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[#172B501A] bg-white text-[#172B50] focus:outline-none focus:border-[#F4510B] shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="checked_in">Checked In (Active)</option>
              <option value="completed">Completed (Checked Out)</option>
              <option value="late">Late Check-In</option>
              <option value="incomplete">Incomplete / No Check-Out</option>
              <option value="on_leave">On Approved Leave</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          {/* 5. Date Picker Jump */}
          <div className="relative">
            <div 
              onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.focus()}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-[#F8FAFC] border border-[#172B501A] text-[#172B50] cursor-pointer hover:border-[#F4510B50] shadow-2xs"
            >
              <div className="flex items-center gap-1.5 truncate">
                <CalendarDays className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                <span className="truncate">{formatDisplayDate(selectedDate)}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/50 shrink-0" />
            </div>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer pointer-events-auto"
            />
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* 2. CALENDAR VIEW (MONTH / WEEK / DAY)                         */}
      {/* ============================================================ */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B5014] shadow-xs space-y-5">
          
          {/* Calendar Header Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Month & Year Title */}
            <div className="flex items-center gap-3">
              <h3 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">
                {monthYearHeading}
              </h3>
              <button
                type="button"
                onClick={handleToday}
                className="px-3 py-1 rounded-full text-xs font-black bg-[#172B500C] hover:bg-[#FFF4E8] hover:text-[#F4510B] text-[#172B50] transition-colors cursor-pointer"
              >
                Today
              </button>
            </div>

            {/* Mode Switcher: Month, Week, Day */}
            <div className="inline-flex items-center bg-[#F4F6F9] p-1 rounded-full border border-[#172B5010] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setCalendarView('month')}
                className={`px-4 sm:px-5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  calendarView === 'month'
                    ? 'bg-[#F4510B] text-white shadow-xs'
                    : 'text-[#172B50] hover:text-[#F4510B]'
                }`}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => setCalendarView('week')}
                className={`px-5 sm:px-6 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  calendarView === 'week'
                    ? 'bg-[#F4510B] text-white shadow-xs'
                    : 'text-[#172B50] hover:text-[#F4510B]'
                }`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setCalendarView('day')}
                className={`px-4 sm:px-5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  calendarView === 'day'
                    ? 'bg-[#F4510B] text-white shadow-xs'
                    : 'text-[#172B50] hover:text-[#F4510B]'
                }`}
              >
                Day
              </button>
            </div>

            {/* Prev / Next Period */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous"
                className="p-2 rounded-xl bg-[#F4F6F9] hover:bg-[#FFF4E8] text-[#172B50] hover:text-[#F4510B] border border-[#172B5010] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next"
                className="p-2 rounded-xl bg-[#F4F6F9] hover:bg-[#FFF4E8] text-[#172B50] hover:text-[#F4510B] border border-[#172B5010] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* ======================================================== */}
          {/* SUB-VIEW 1: WEEK VIEW (Hourly 7-Day Timetable)           */}
          {/* ======================================================== */}
          {calendarView === 'week' && (
            <div className="space-y-2.5">
              
              {/* Day Header Row */}
              <div className="flex items-center gap-2">
                <div className="w-20 sm:w-24 shrink-0 text-center text-[10px] font-black uppercase text-[#172B50]/50 tracking-wider">
                  TIME
                </div>
                <div className="flex-1 grid grid-cols-7 gap-2">
                  {weekDays.map(day => (
                    <button
                      key={day.dateYmd}
                      type="button"
                      onClick={() => setSelectedDate(day.dateYmd)}
                      className={`rounded-2xl py-2 px-1 text-center transition-all cursor-pointer ${
                        day.isSelected
                          ? 'bg-[#172B50] text-white shadow-md border border-[#172B50]'
                          : day.isToday
                            ? 'bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B40]'
                            : 'bg-[#F4F6F9] hover:bg-[#FFF4E8]/60 text-[#172B50] border border-transparent'
                      }`}
                    >
                      <span className={`block text-[10px] font-bold ${
                        day.isSelected ? 'text-slate-200' : 'text-[#172B50]/60'
                      }`}>
                        {day.dayShort}
                      </span>
                      <span className={`block text-base sm:text-lg font-black ${
                        day.isSelected ? 'text-white' : 'text-[#172B50]'
                      }`}>
                        {day.dateNumber}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hourly Timetable Grid */}
              <div className="border border-[#172B5014] rounded-2xl overflow-hidden bg-white shadow-2xs">
                {TIME_SLOTS.map((timeSlot, sIdx) => (
                  <div
                    key={timeSlot}
                    className={`flex items-stretch ${
                      sIdx !== TIME_SLOTS.length - 1 ? 'border-b border-[#172B5010]' : ''
                    }`}
                  >
                    {/* Time Slot Label */}
                    <div className="w-20 sm:w-24 px-2.5 py-3 text-[11px] font-bold text-[#172B50]/70 border-r border-[#172B5010] flex items-center justify-start shrink-0 select-none bg-[#FDFEFE]">
                      {timeSlot}
                    </div>

                    {/* 7 Day Columns */}
                    <div className="flex-1 grid grid-cols-7 divide-x divide-[#172B5010]">
                      {weekDays.map(day => {
                        const cellKey = `${day.dateYmd}::${timeSlot}`;
                        const cellEvents = eventsByDateTime.get(cellKey) || [];

                        return (
                          <div
                            key={cellKey}
                            className={`min-h-[64px] sm:min-h-[72px] p-1 transition-colors hover:bg-[#FFF4E8]/20 flex flex-col gap-1 ${
                              day.isSelected ? 'bg-[#F8FAFC]' : ''
                            }`}
                          >
                            {cellEvents.map(ev => (
                              <div
                                key={ev.id}
                                onClick={() => setInspectModalEntry(ev)}
                                className={`rounded-xl p-1.5 border text-left cursor-pointer transition-all hover:scale-101 hover:shadow-xs group ${
                                  ev.status === 'checked_in'
                                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                                    : ev.status === 'completed'
                                      ? 'bg-orange-50/90 border-orange-200 text-orange-950'
                                      : ev.status === 'late'
                                        ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                                        : ev.status === 'on_leave'
                                          ? 'bg-purple-50/90 border-purple-200 text-purple-950'
                                          : 'bg-rose-50/90 border-rose-200 text-rose-950'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-black truncate">
                                    {ev.coachName}
                                  </span>
                                  {ev.checkInPhoto && (
                                    <Camera className="w-2.5 h-2.5 text-[#F4510B] shrink-0" />
                                  )}
                                </div>

                                <div className="flex items-center gap-1 mt-0.5 text-[9px] font-bold opacity-80">
                                  <Clock className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">
                                    {ev.checkInTime} {ev.checkOutTime ? `→ ${ev.checkOutTime}` : ''}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between gap-1 mt-1 text-[8.5px] font-extrabold uppercase">
                                  <span className="truncate">{ev.checkInLocation}</span>
                                  <span className="shrink-0">{ev.totalDuration}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* SUB-VIEW 2: DAY VIEW (Single Day Detailed Hourly)        */}
          {/* ======================================================== */}
          {calendarView === 'day' && (
            <div className="space-y-3">
              <div className="bg-[#172B50] text-white rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300">
                    Day Schedule & Roster
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-white mt-0.5">
                    {formatDisplayDate(selectedDate)}
                  </h4>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-white/10 text-white">
                  {(eventsByDateTime.get(selectedDate) || []).length} Recorded Events
                </span>
              </div>

              <div className="border border-[#172B5014] rounded-2xl overflow-hidden bg-white shadow-2xs divide-y divide-[#172B5010]">
                {TIME_SLOTS.map(timeSlot => {
                  const cellKey = `${selectedDate}::${timeSlot}`;
                  const slotEvents = eventsByDateTime.get(cellKey) || [];

                  return (
                    <div key={timeSlot} className="flex items-start p-3 gap-4 hover:bg-[#F8FAFC] transition-colors">
                      <div className="w-20 sm:w-24 font-bold text-xs text-[#172B50]/70 pt-1 shrink-0">
                        {timeSlot}
                      </div>

                      <div className="flex-1">
                        {slotEvents.length === 0 ? (
                          <div className="text-[11px] text-[#172B50]/30 italic py-1">
                            No faculty attendance sessions starting in this slot
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {slotEvents.map(ev => (
                              <div
                                key={ev.id}
                                onClick={() => setInspectModalEntry(ev)}
                                className={`rounded-2xl p-3 border cursor-pointer hover:shadow-md transition-all ${
                                  ev.status === 'checked_in'
                                    ? 'bg-emerald-50/70 border-emerald-200'
                                    : ev.status === 'completed'
                                      ? 'bg-orange-50/70 border-orange-200'
                                      : ev.status === 'late'
                                        ? 'bg-amber-50/70 border-amber-300'
                                        : ev.status === 'on_leave'
                                          ? 'bg-purple-50/70 border-purple-200'
                                          : 'bg-rose-50/70 border-rose-200'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-white border border-[#172B5015] flex items-center justify-center font-black text-xs text-[#172B50] overflow-hidden">
                                      {ev.coachAvatar ? (
                                        <img src={ev.coachAvatar} alt={ev.coachName} className="w-full h-full object-cover" />
                                      ) : (
                                        ev.coachName.slice(0, 2).toUpperCase()
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-xs font-black text-[#172B50]">{ev.coachName}</p>
                                      <p className="text-[10px] text-[#172B50]/60">{ev.checkInLocation}</p>
                                    </div>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase ${
                                    ev.status === 'checked_in'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : ev.status === 'completed'
                                        ? 'bg-orange-100 text-orange-800'
                                        : ev.status === 'on_leave'
                                          ? 'bg-purple-100 text-purple-800'
                                          : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {ev.statusLabel}
                                  </span>
                                </div>

                                <div className="mt-2.5 pt-2 border-t border-[#172B5010] flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1 font-bold text-[#172B50]">
                                    <Clock className="w-3 h-3 text-[#F4510B]" />
                                    <span>{ev.checkInTime} → {ev.checkOutTime || 'Active'}</span>
                                  </div>
                                  <span className="font-mono font-bold text-[11px] text-[#F4510B]">
                                    {ev.totalDuration}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SUB-VIEW 3: MONTH VIEW (7-Column Monthly Grid)           */}
          {/* ======================================================== */}
          {calendarView === 'month' && (
            <div className="border border-[#172B5014] rounded-2xl overflow-hidden bg-white shadow-2xs">
              
              {/* Day Name Column Headers */}
              <div className="grid grid-cols-7 border-b border-[#172B5012] bg-[#F8FAFC] py-2.5 text-center text-xs font-black text-[#172B50] uppercase tracking-wider">
                {DAY_NAMES.map(name => (
                  <span key={name}>{name.slice(0, 3)}</span>
                ))}
              </div>

              {/* Month Grid Cells */}
              <div className="grid grid-cols-7 divide-x divide-y divide-[#172B5010]">
                {monthGridDays.map((cell, idx) => {
                  const dayEvents = eventsByDateTime.get(cell.dateYmd) || [];

                  return (
                    <div
                      key={`${cell.dateYmd}-${idx}`}
                      onClick={() => {
                        setSelectedDate(cell.dateYmd);
                        if (dayEvents.length === 1) {
                          setInspectModalEntry(dayEvents[0]);
                        }
                      }}
                      className={`min-h-[88px] sm:min-h-[105px] p-2 transition-all cursor-pointer flex flex-col justify-between hover:bg-[#FFF4E8]/25 ${
                        !cell.isCurrentMonth ? 'opacity-35 bg-slate-50/60' : ''
                      } ${cell.isSelected ? 'bg-[#FFF4E8]/50 ring-2 ring-[#F4510B] ring-inset' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black rounded-full w-6 h-6 flex items-center justify-center ${
                          cell.isToday
                            ? 'bg-[#F4510B] text-white shadow-xs'
                            : 'text-[#172B50]'
                        }`}>
                          {cell.dateNumber}
                        </span>

                        {dayEvents.length > 0 && (
                          <span className="text-[10px] font-black text-[#172B50]/60">
                            {dayEvents.length} logs
                          </span>
                        )}
                      </div>

                      <div className="mt-1 space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map(ev => (
                          <div
                            key={ev.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectModalEntry(ev);
                            }}
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-black truncate flex items-center gap-1 cursor-pointer transition-transform hover:scale-102 ${
                              ev.status === 'checked_in'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ev.status === 'completed'
                                  ? 'bg-orange-100 text-orange-800'
                                  : ev.status === 'on_leave'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                            <span className="truncate">{ev.coachName}</span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[9px] font-extrabold text-[#F4510B] block pl-1">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>
      )}

      {/* ============================================================ */}
      {/* 3. LIST VIEW (Tabular format matching Requirement 6)         */}
      {/* ============================================================ */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B5014] shadow-xs space-y-4">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-[#172B50] tracking-tight">
                Tabular Attendance Register
              </h3>
              <p className="text-xs text-[#172B50]/60">
                Displaying {filteredEvents.length} attendance records matching active filters
              </p>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="min-h-[220px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#172B5018] rounded-2xl bg-[#F8FAFC]">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#172B50]/40 flex items-center justify-center mb-2 shadow-2xs">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-[#172B50]">No attendance sessions recorded</h4>
              <p className="text-xs text-[#172B50]/60 mt-0.5 max-w-sm">
                No check-in or checkout events match the selected coach, location, date, or status filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#172B5012]">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#172B5012] text-[#172B50]/70 font-black uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3.5">COACH</th>
                    <th className="py-3 px-3.5">DATE</th>
                    <th className="py-3 px-3.5">LOCATION</th>
                    <th className="py-3 px-3.5">CHECK-IN</th>
                    <th className="py-3 px-3.5">CHECK-OUT</th>
                    <th className="py-3 px-3.5">DURATION</th>
                    <th className="py-3 px-3.5">STATUS</th>
                    <th className="py-3 px-3.5">PHOTOS</th>
                    <th className="py-3 px-3.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B500C]">
                  {filteredEvents.map(ev => {
                    const hasPhotos = Boolean(ev.checkInPhoto || ev.checkOutPhoto);
                    return (
                      <tr 
                        key={ev.id} 
                        className="hover:bg-[#FFF4E8]/25 transition-colors cursor-pointer"
                        onClick={() => setInspectModalEntry(ev)}
                      >
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-[#172B5015] overflow-hidden flex items-center justify-center font-black text-[#172B50] shrink-0">
                              {ev.coachAvatar ? (
                                <img src={ev.coachAvatar} alt={ev.coachName} className="w-full h-full object-cover" />
                              ) : (
                                ev.coachName.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-black text-[#172B50]">{ev.coachName}</p>
                              <p className="text-[10px] text-[#172B50]/55">{ev.coachId}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3.5 font-bold text-[#172B50]">
                          {formatDisplayDate(ev.date)}
                        </td>

                        <td className="py-3 px-3.5 font-bold text-[#172B50]">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#F4510B] shrink-0" />
                            <span>{ev.checkInLocation}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3.5">
                          <span className="font-mono font-bold text-[#172B50]">
                            {ev.checkInTime || '--:--'}
                          </span>
                        </td>

                        <td className="py-3 px-3.5">
                          <span className="font-mono font-bold text-[#172B50]">
                            {ev.checkOutTime || (ev.status === 'checked_in' ? 'Active' : '--:--')}
                          </span>
                        </td>

                        <td className="py-3 px-3.5">
                          <span className="font-mono font-black text-[#F4510B]">
                            {ev.totalDuration}
                          </span>
                        </td>

                        <td className="py-3 px-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase ${
                            ev.status === 'checked_in'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ev.status === 'completed'
                                ? 'bg-orange-100 text-orange-800'
                                : ev.status === 'on_leave'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {ev.statusLabel}
                          </span>
                        </td>

                        <td className="py-3 px-3.5">
                          {hasPhotos ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#F4510B] bg-[#FFF4E8] px-2 py-0.5 rounded-md border border-[#F4510B20]">
                              <Camera className="w-3 h-3" />
                              <span>{Boolean(ev.checkInPhoto && ev.checkOutPhoto) ? '2 Photos' : '1 Photo'}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#172B50]/40 font-semibold italic">
                              No photos
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectModalEntry(ev);
                            }}
                            className="px-3 py-1 rounded-lg text-xs font-black bg-[#172B50] hover:bg-[#F4510B] text-white transition-colors cursor-pointer"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ============================================================ */}
      {/* 4. DETAILED ATTENDANCE MODAL WITH PHOTOS (Requirement 4)      */}
      {/* ============================================================ */}
      {inspectModalEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-[#172B5015] flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#172B50] to-[#1E3A6E] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center font-black text-lg text-white shrink-0">
                  {inspectModalEntry.coachAvatar ? (
                    <img src={inspectModalEntry.coachAvatar} alt={inspectModalEntry.coachName} className="w-full h-full object-cover" />
                  ) : (
                    inspectModalEntry.coachName.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                      {inspectModalEntry.coachName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F4510B] text-white">
                      {inspectModalEntry.coachRole}
                    </span>
                  </div>
                  <p className="text-xs text-white/70 mt-0.5">
                    Coach ID: {inspectModalEntry.coachId} • {inspectModalEntry.checkInLocation}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectModalEntry(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              
              {/* Summary KPIs Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#172B5010]">
                <div>
                  <span className="text-[10px] font-bold text-[#172B50]/60 uppercase tracking-wider block">
                    SESSION DATE
                  </span>
                  <span className="text-xs font-black text-[#172B50] mt-0.5 block truncate">
                    {formatDisplayDate(inspectModalEntry.date)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#172B50]/60 uppercase tracking-wider block">
                    TOTAL DURATION
                  </span>
                  <span className="text-xs font-black text-[#F4510B] font-mono mt-0.5 block">
                    {inspectModalEntry.totalDuration}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#172B50]/60 uppercase tracking-wider block">
                    STATUS
                  </span>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    inspectModalEntry.status === 'checked_in'
                      ? 'bg-emerald-100 text-emerald-800'
                      : inspectModalEntry.status === 'completed'
                        ? 'bg-orange-100 text-orange-800'
                        : inspectModalEntry.status === 'on_leave'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                  }`}>
                    {inspectModalEntry.statusLabel}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#172B50]/60 uppercase tracking-wider block">
                    VERIFICATION
                  </span>
                  {inspectModalEntry.isCheckInException || inspectModalEntry.isCheckOutException ? (
                    <span className="text-xs font-black text-amber-700 flex items-center gap-1 mt-0.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>Exception Authorized</span>
                    </span>
                  ) : (
                    <span className="text-xs font-black text-emerald-700 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Live Camera</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Side-by-Side Photos Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-black text-[#172B50] flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#F4510B]" />
                    <span>Camera Attendance Verification Photos</span>
                  </h4>
                  
                  {Boolean(inspectModalEntry.checkInPhoto || inspectModalEntry.checkOutPhoto) && (
                    <button
                      type="button"
                      onClick={() => setLightboxData({
                        entry: inspectModalEntry,
                        currentPhoto: inspectModalEntry.checkInPhoto || inspectModalEntry.checkOutPhoto,
                        mode: 'checkin'
                      })}
                      className="text-xs font-black text-[#F4510B] hover:text-[#d44307] flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>View Photos in Lightbox</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Card 1: Check-In Photo */}
                  <div className="border border-[#172B5014] rounded-2xl p-3.5 bg-white space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#172B50] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Check-In Photo
                      </span>
                      <span className="text-[10.5px] font-mono font-bold text-[#172B50]/70">
                        {inspectModalEntry.checkInTime}
                      </span>
                    </div>

                    <div className="aspect-4/3 rounded-xl overflow-hidden bg-[#F8FAFC] border border-[#172B5010] flex items-center justify-center relative group">
                      {inspectModalEntry.checkInPhoto ? (
                        <>
                          <img
                            src={inspectModalEntry.checkInPhoto}
                            alt="Check-in verification"
                            className="w-full h-full object-cover transition-transform group-hover:scale-103"
                          />
                          <button
                            type="button"
                            onClick={() => setLightboxData({
                              entry: inspectModalEntry,
                              currentPhoto: inspectModalEntry.checkInPhoto,
                              mode: 'checkin'
                            })}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 cursor-pointer"
                          >
                            <ZoomIn className="w-4 h-4" />
                            <span>Click to Zoom</span>
                          </button>
                        </>
                      ) : inspectModalEntry.isCheckInException ? (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <ShieldAlert className="w-8 h-8 text-amber-500 mb-1.5" />
                          <span className="text-xs font-bold text-amber-900">Admin-Authorized Exception</span>
                          <span className="text-[10px] text-amber-800 font-semibold mt-0.5">
                            {inspectModalEntry.checkInExceptionReason || 'Hardware / Permission Issue'}
                          </span>
                          <span className="text-[9.5px] text-[#172B50]/60 mt-1">
                            Approved by: <strong>{inspectModalEntry.checkInApprovedBy || 'Admin'}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <CameraOff className="w-8 h-8 text-[#172B50]/30 mb-1.5" />
                          <span className="text-xs font-bold text-[#172B50]/60">Photo Not Available</span>
                          <span className="text-[10px] text-[#172B50]/40 mt-0.5">No check-in photo recorded</span>
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-[#172B50]/70 flex items-center justify-between pt-1">
                      <span>Location:</span>
                      <strong className="text-[#172B50] font-black">{inspectModalEntry.checkInLocation}</strong>
                    </div>
                  </div>

                  {/* Card 2: Check-Out Photo */}
                  <div className="border border-[#172B5014] rounded-2xl p-3.5 bg-white space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#172B50] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        Check-Out Photo
                      </span>
                      <span className="text-[10.5px] font-mono font-bold text-[#172B50]/70">
                        {inspectModalEntry.checkOutTime || 'Pending'}
                      </span>
                    </div>

                    <div className="aspect-4/3 rounded-xl overflow-hidden bg-[#F8FAFC] border border-[#172B5010] flex items-center justify-center relative group">
                      {inspectModalEntry.checkOutPhoto ? (
                        <>
                          <img
                            src={inspectModalEntry.checkOutPhoto}
                            alt="Check-out verification"
                            className="w-full h-full object-cover transition-transform group-hover:scale-103"
                          />
                          <button
                            type="button"
                            onClick={() => setLightboxData({
                              entry: inspectModalEntry,
                              currentPhoto: inspectModalEntry.checkOutPhoto,
                              mode: 'checkout'
                            })}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 cursor-pointer"
                          >
                            <ZoomIn className="w-4 h-4" />
                            <span>Click to Zoom</span>
                          </button>
                        </>
                      ) : inspectModalEntry.isCheckOutException ? (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <ShieldAlert className="w-8 h-8 text-amber-500 mb-1.5" />
                          <span className="text-xs font-bold text-amber-900">Admin-Authorized Exception</span>
                          <span className="text-[10px] text-amber-800 font-semibold mt-0.5">
                            {inspectModalEntry.checkOutExceptionReason || 'Hardware / Permission Issue'}
                          </span>
                          <span className="text-[9.5px] text-[#172B50]/60 mt-1">
                            Approved by: <strong>{inspectModalEntry.checkOutApprovedBy || 'Admin'}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <CameraOff className="w-8 h-8 text-[#172B50]/30 mb-1.5" />
                          <span className="text-xs font-bold text-[#172B50]/60">Photo Not Available</span>
                          <span className="text-[10px] text-[#172B50]/40 mt-0.5">
                            {inspectModalEntry.status === 'checked_in' ? 'Shift currently in progress' : 'Check-out photo not recorded'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-[#172B50]/70 flex items-center justify-between pt-1">
                      <span>Location:</span>
                      <strong className="text-[#172B50] font-black">{inspectModalEntry.checkOutLocation}</strong>
                    </div>
                  </div>

                </div>
              </div>

              {/* Authorized Camera Exception Audit Trail */}
              {(inspectModalEntry.isCheckInException || inspectModalEntry.isCheckOutException) && (
                <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-2xl text-xs text-amber-950 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Admin Exception &amp; Audit Trail</span>
                  </div>
                  <div className="text-[11.5px] text-amber-900 space-y-1 pl-5">
                    {inspectModalEntry.isCheckInException && (
                      <p>
                        <strong className="font-bold text-amber-950">Check-In Exception:</strong> {inspectModalEntry.checkInExceptionReason} &bull; <span className="text-amber-800">Approved by {inspectModalEntry.checkInApprovedBy}</span>
                      </p>
                    )}
                    {inspectModalEntry.isCheckOutException && (
                      <p>
                        <strong className="font-bold text-amber-950">Check-Out Exception:</strong> {inspectModalEntry.checkOutExceptionReason} &bull; <span className="text-amber-800">Approved by {inspectModalEntry.checkOutApprovedBy}</span>
                      </p>
                    )}
                    {inspectModalEntry.exceptionNotes && (
                      <p className="italic text-amber-800 text-[11px] pt-0.5">
                        &ldquo;{inspectModalEntry.exceptionNotes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Remarks / Details */}
              {inspectModalEntry.remarks && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-950 space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">
                    REMARKS & OBSERVATIONS
                  </span>
                  <p className="font-medium text-amber-900 leading-relaxed">
                    {inspectModalEntry.remarks}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-[#172B5010] bg-[#F8FAFC] flex items-center justify-between shrink-0">
              <span className="text-xs text-[#172B50]/60">
                Official Little Spartans Coach Attendance Record
              </span>

              <div className="flex items-center gap-2">
                {Boolean(inspectModalEntry.checkInPhoto || inspectModalEntry.checkOutPhoto) && (
                  <button
                    type="button"
                    onClick={() => setLightboxData({
                      entry: inspectModalEntry,
                      currentPhoto: inspectModalEntry.checkInPhoto || inspectModalEntry.checkOutPhoto,
                      mode: 'checkin'
                    })}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-[#F4510B] text-white hover:bg-[#d94103] transition-colors cursor-pointer shadow-xs"
                  >
                    View Photos
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setInspectModalEntry(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-[#172B5018] text-[#172B50] hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. FULL-SCREEN PHOTO PREVIEW LIGHTBOX MODAL                   */}
      {/* ============================================================ */}
      {lightboxData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[95vh] flex flex-col items-center">
            
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between text-white pb-3">
              <div>
                <h4 className="text-base font-black">
                  {lightboxData.entry.coachName} • {lightboxData.mode === 'checkin' ? 'Check-In Photo' : 'Check-Out Photo'}
                </h4>
                <p className="text-xs text-white/70">
                  {formatDisplayDate(lightboxData.entry.date)} • {lightboxData.entry.checkInLocation}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {lightboxData.entry.checkInPhoto && lightboxData.entry.checkOutPhoto && (
                  <div className="inline-flex bg-white/20 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setLightboxData(prev => ({ ...prev, currentPhoto: prev.entry.checkInPhoto, mode: 'checkin' }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        lightboxData.mode === 'checkin' ? 'bg-white text-black' : 'text-white'
                      }`}
                    >
                      Check-In
                    </button>
                    <button
                      type="button"
                      onClick={() => setLightboxData(prev => ({ ...prev, currentPhoto: prev.entry.checkOutPhoto, mode: 'checkout' }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        lightboxData.mode === 'checkout' ? 'bg-white text-black' : 'text-white'
                      }`}
                    >
                      Check-Out
                    </button>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => setLightboxData(null)}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Photo Center */}
            <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl max-h-[75vh] flex items-center justify-center bg-black">
              <img
                src={lightboxData.currentPhoto}
                alt="Enlarged verification"
                className="max-h-[75vh] max-w-full object-contain"
              />
            </div>

            {/* Bottom Info Pill */}
            <div className="mt-3 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold backdrop-blur-sm border border-white/10">
              Verified by Little Spartans Camera Verification System
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
