import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  MapPin,
  CheckCircle2,
  Clock,
  Camera,
  AlertCircle,
  Eye,
  Maximize2,
  X,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { COACH_ATTENDANCE_STATUS } from '../../services/coachAttendanceService';

export default function CoachAttendanceCalendar({ allowedLocations = [], allowedCoaches = null }) {
  const { data } = useCrm();

  // Calendar Month State (Year and Month index 0-11)
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  // Filters
  const [selectedCoachId, setSelectedCoachId] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Date for Inspection Panel (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  });

  // Modal zoom photo state
  const [zoomModalData, setZoomModalData] = useState(null);

  // Available coaches scoped
  const coachesList = useMemo(() => {
    let list = data.coaches || [];
    if (allowedCoaches && allowedCoaches.length > 0) {
      list = list.filter((c) => allowedCoaches.some((ac) => ac.id === c.id));
    }
    if (allowedLocations.length > 0) {
      list = list.filter((c) =>
        allowedLocations.includes(c.center) ||
        (c.assignedLocations || []).some((loc) => allowedLocations.includes(loc))
      );
    }
    return list;
  }, [data.coaches, allowedCoaches, allowedLocations]);

  // Available locations
  const locationsList = useMemo(() => {
    if (allowedLocations.length > 0) return allowedLocations;
    return (data.locations || []).map((l) => l.name);
  }, [allowedLocations, data.locations]);

  // All coach attendance records
  const allRecords = useMemo(() => {
    return data.coachAttendanceRecords || [];
  }, [data.coachAttendanceRecords]);

  // Calendar days generation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Previous month padding days
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const monthStr = String(currentMonth === 0 ? 12 : currentMonth).padStart(2, '0');
      const yearVal = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({
        dayNumber: d,
        dateYmd: `${yearVal}-${monthStr}-${String(d).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      days.push({
        dayNumber: d,
        dateYmd: `${currentYear}-${monthStr}-${String(d).padStart(2, '0')}`,
        isCurrentMonth: true,
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const monthStr = String(currentMonth + 2 > 12 ? 1 : currentMonth + 2).padStart(2, '0');
      const yearVal = currentMonth + 1 >= 12 ? currentYear + 1 : currentYear;
      days.push({
        dayNumber: d,
        dateYmd: `${yearVal}-${monthStr}-${String(d).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    const pad = (n) => String(n).padStart(2, '0');
    setSelectedDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
  };

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate day-wise records lookup map
  const recordsByDate = useMemo(() => {
    const map = new Map();
    allRecords.forEach((rec) => {
      // Filter matching
      if (selectedCoachId !== 'ALL' && rec.coachId !== selectedCoachId) return;
      if (selectedLocation !== 'ALL' && rec.locationName !== selectedLocation) return;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = rec.coachName?.toLowerCase().includes(q);
        const matchId = rec.coachId?.toLowerCase().includes(q);
        const matchLoc = rec.locationName?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchLoc) return;
      }

      if (!map.has(rec.date)) {
        map.set(rec.date, []);
      }
      map.get(rec.date).push(rec);
    });
    return map;
  }, [allRecords, selectedCoachId, selectedLocation, searchQuery]);

  // Inspection Panel records for the selected date
  const selectedDateRecords = useMemo(() => {
    const list = recordsByDate.get(selectedDate) || [];
    if (selectedStatusFilter === 'ALL') return list;
    if (selectedStatusFilter === 'checked_in') return list.filter((r) => r.status === COACH_ATTENDANCE_STATUS.CHECKED_IN);
    if (selectedStatusFilter === 'completed') return list.filter((r) => r.status === COACH_ATTENDANCE_STATUS.COMPLETED);
    return list;
  }, [recordsByDate, selectedDate, selectedStatusFilter]);

  // Selected date formatted heading
  const selectedDateHeading = useMemo(() => {
    if (!selectedDate) return '';
    const parts = selectedDate.split('-').map(Number);
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return selectedDate;
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Top Filter and Navigation Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#172B5014] shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Month & Year Navigation */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0">
              <CalendarIcon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#172B50] tracking-tight">{monthName}</h2>
                <button
                  type="button"
                  onClick={handleGoToday}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#172B5010] hover:bg-[#172B5018] text-[#172B50] transition"
                >
                  Today
                </button>
              </div>
              <p className="text-xs text-[#172B5080]">Monthly Faculty Check-in / Check-out Dot Statuses</p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl border border-[#172B5015] hover:bg-slate-100 text-[#172B50] transition"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl border border-[#172B5015] hover:bg-slate-100 text-[#172B50] transition"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Filters: Coach, Location, Status, Search */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#172B5060]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coach / location..."
                className="pl-8 pr-3 py-2 text-xs rounded-xl border border-[#172B501A] bg-white text-[#172B50] w-44 focus:outline-none focus:border-[#F4510B]"
              />
            </div>

            {/* Coach Filter */}
            <select
              value={selectedCoachId}
              onChange={(e) => setSelectedCoachId(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-[#172B501A] bg-white text-[#172B50] focus:outline-none"
            >
              <option value="ALL">All Coaches ({coachesList.length})</option>
              {coachesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id})
                </option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-[#172B501A] bg-white text-[#172B50] focus:outline-none"
            >
              <option value="ALL">All Locations</option>
              {locationsList.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-[#172B501A] bg-white text-[#172B50] focus:outline-none"
            >
              <option value="ALL">All Attendance Statuses</option>
              <option value="checked_in">Checked In (Ongoing)</option>
              <option value="completed">Shift Completed</option>
            </select>
          </div>
        </div>

        {/* Legend Indicators */}
        <div className="mt-4 pt-3.5 border-t border-[#172B5010] flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-bold text-[#172B5070]">Indicators:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[#172B50] font-semibold">Green dot: Check-in completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F4510B]" />
              <span className="text-[#172B50] font-semibold">Orange dot: Check-out completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-[#172B50] font-semibold">Red dot: Missing / Exception</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="text-[#172B50] font-semibold">Grey dot: No record</span>
            </div>
          </div>
          <span className="text-[#172B5070] italic">
            Click any calendar day to inspect detailed coach photos &amp; timestamps.
          </span>
        </div>
      </div>

      {/* Main Grid: Calendar on Left (7 cols), Inspection Panel on Right or Below */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid (7 of 12 on large screens) */}
        <div className="xl:col-span-7 bg-white rounded-3xl p-5 border border-[#172B5014] shadow-card">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2 text-xs font-black text-[#172B5080] uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((cell) => {
              const records = recordsByDate.get(cell.dateYmd) || [];
              const isSelected = cell.dateYmd === selectedDate;
              const hasCheckIn = records.some((r) => !!r.checkInTime);
              const hasCheckOut = records.some((r) => !!r.checkOutTime || r.status === COACH_ATTENDANCE_STATUS.COMPLETED);
              const hasRecord = records.length > 0;

              return (
                <div
                  key={cell.dateYmd}
                  onClick={() => setSelectedDate(cell.dateYmd)}
                  className={`min-h-[75px] sm:min-h-[85px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#F4510B] bg-[#FFF5ED] shadow-sm ring-2 ring-[#F4510B30]'
                      : cell.isCurrentMonth
                      ? 'border-[#172B5012] bg-white hover:border-[#172B5030] hover:bg-slate-50/70'
                      : 'border-transparent bg-slate-50/40 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black rounded-lg px-1.5 py-0.5 ${
                        isSelected
                          ? 'bg-[#F4510B] text-white'
                          : cell.isCurrentMonth
                          ? 'text-[#172B50]'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {hasRecord && (
                      <span className="text-[10px] font-bold text-[#172B5070]">
                        {records.length} {records.length === 1 ? 'coach' : 'coaches'}
                      </span>
                    )}
                  </div>

                  {/* Dot Status Indicators */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {hasRecord ? (
                      <>
                        {/* Green Dot: Check-in completed */}
                        {hasCheckIn && (
                          <span
                            className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs"
                            title="Check-in completed"
                          />
                        )}
                        {/* Orange Dot: Check-out completed */}
                        {hasCheckOut && (
                          <span
                            className="w-2.5 h-2.5 rounded-full bg-[#F4510B] shadow-2xs"
                            title="Check-out completed"
                          />
                        )}
                        {/* Exception red dot if checked in but hours missing or student attendance not saved */}
                        {records.some((r) => r.status === COACH_ATTENDANCE_STATUS.CHECKED_IN && !r.studentAttendanceSaved && cell.dateYmd < new Date().toISOString().split('T')[0]) && (
                          <span
                            className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-2xs"
                            title="Incomplete / Missing student attendance"
                          />
                        )}
                      </>
                    ) : (
                      /* Grey Dot: No attendance record */
                      cell.isCurrentMonth && (
                        <span
                          className="w-2 h-2 rounded-full bg-slate-300"
                          title="No attendance record logged"
                        />
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Attendance Inspection Panel (5 of 12 on large screens) */}
        <div className="xl:col-span-5 bg-white rounded-3xl p-5 border border-[#172B5014] shadow-card flex flex-col">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#172B5012]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#F4510B]">
                Attendance Inspection
              </span>
              <h3 className="text-base font-black text-[#172B50] mt-0.5">{selectedDateHeading}</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#172B5010] text-[#172B50]">
              {selectedDateRecords.length} Record{selectedDateRecords.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Inspection Records List */}
          <div className="mt-4 space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {selectedDateRecords.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <Clock size={22} />
                </div>
                <h4 className="text-sm font-bold text-[#172B50]">No Coach Attendance Logged</h4>
                <p className="text-xs text-[#172B5070] mt-1 max-w-xs">
                  There are no verified coach check-in records recorded for {selectedDateHeading}.
                </p>
              </div>
            ) : (
              selectedDateRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl border border-[#172B5014] bg-[#F8FAFC] space-y-3.5 hover:border-[#172B5024] transition shadow-2xs"
                >
                  {/* Coach Identity Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-[#172B5018] shrink-0">
                        {rec.coachAvatar ? (
                          <img
                            src={rec.coachAvatar}
                            alt={rec.coachName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-[#172B50]">
                            <User size={18} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#172B50]">{rec.coachName}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-[#172B5080]">
                          <span className="font-mono font-bold text-[#172B50]">{rec.coachId}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin size={11} className="text-[#F4510B]" />
                            {rec.locationName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${
                        rec.status === COACH_ATTENDANCE_STATUS.COMPLETED
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {rec.status === COACH_ATTENDANCE_STATUS.COMPLETED ? 'Completed' : 'Checked In'}
                    </span>
                  </div>

                  {/* Dual Photos & Timings Strip */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#172B5010]">
                    {/* Check-In Photo & Time */}
                    <div className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-[#172B5010]">
                      <div
                        onClick={() =>
                          setZoomModalData({
                            url: rec.checkInPhoto,
                            title: 'Check-In Verification Photo',
                            time: rec.checkInTime,
                            coach: rec.coachName,
                            location: rec.locationName,
                          })
                        }
                        className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-[#172B5015] shrink-0 cursor-pointer group"
                      >
                        {rec.checkInPhoto ? (
                          <img
                            src={rec.checkInPhoto}
                            alt="Check-in verification"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Camera size={16} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                          <Eye size={12} />
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                          Check-In
                        </span>
                        <span className="text-xs font-black text-[#172B50] font-mono block">
                          {rec.checkInTime || '--:--'}
                        </span>
                      </div>
                    </div>

                    {/* Check-Out Photo & Time */}
                    <div className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-[#172B5010]">
                      <div
                        onClick={() =>
                          rec.checkOutPhoto &&
                          setZoomModalData({
                            url: rec.checkOutPhoto,
                            title: 'Check-Out Verification Photo',
                            time: rec.checkOutTime,
                            coach: rec.coachName,
                            location: rec.locationName,
                          })
                        }
                        className={`relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-[#172B5015] shrink-0 ${
                          rec.checkOutPhoto ? 'cursor-pointer group' : ''
                        }`}
                      >
                        {rec.checkOutPhoto ? (
                          <img
                            src={rec.checkOutPhoto}
                            alt="Check-out verification"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Camera size={16} />
                          </div>
                        )}
                        {rec.checkOutPhoto && (
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                            <Eye size={12} />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F4510B] block">
                          Check-Out
                        </span>
                        <span className="text-xs font-black text-[#172B50] font-mono block">
                          {rec.checkOutTime || '--:--'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Footer: Total Duration & Student Attendance Saved Status */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#172B5010]">
                    <div className="flex items-center gap-1.5 font-bold text-[#172B50]">
                      <Clock size={13} className="text-[#F4510B]" />
                      <span>Duration:</span>
                      <span className="font-black text-[#F4510B] font-mono">
                        {rec.totalDurationFormatted || `${rec.totalDurationMinutes || 0}m`}
                      </span>
                    </div>

                    {/* Student Attendance Verified Badge */}
                    {rec.studentAttendanceSaved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>Student Attendance Saved</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        <AlertCircle size={12} className="text-amber-600" />
                        <span>Student Attendance Pending</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Full-Resolution Photo Viewer Modal */}
      {zoomModalData && zoomModalData.url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#172B5020]">
            <div className="px-5 py-3.5 border-b border-[#172B5012] flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <h4 className="text-sm font-black text-[#172B50]">{zoomModalData.title}</h4>
                <p className="text-[11px] text-[#172B5080]">
                  {zoomModalData.coach} • 📍 {zoomModalData.location} • 🕒 {zoomModalData.time}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setZoomModalData(null)}
                className="p-1 rounded-full hover:bg-slate-200 text-[#172B5080] hover:text-[#172B50] transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center">
              <img
                src={zoomModalData.url}
                alt={zoomModalData.title}
                className="max-h-[460px] w-auto rounded-2xl object-contain shadow-lg"
              />
            </div>
            <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#172B5012] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Verified by Little Spartans Attendance System</span>
              </div>
              <button
                type="button"
                onClick={() => setZoomModalData(null)}
                className="px-4 py-2 bg-[#172B50] text-white rounded-xl text-xs font-bold hover:bg-[#172B50EE] transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
