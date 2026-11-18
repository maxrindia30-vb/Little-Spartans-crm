import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  User, 
  Users, 
  Calendar, 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Search, 
  Download, 
  Save, 
  Check,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Lock
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import CoachLeaveRequestsManager from '../common/CoachLeaveRequestsManager';
import {
  LEAVE_TYPES,
  LEAVE_STATUSES,
  HALF_DAY_SESSIONS,
  getCoachApprovedLeaveForDate,
  formatLeaveDateRange,
  calculateLeaveDurationDays
} from '../../services/coachLeaveService';

const TIME_SLOTS = [
  '6:00 am',
  '7:00 am',
  '8:00 am',
  '9:00 am',
  '10:00 am',
  '11:00 am',
  '12:00 pm'
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatDateToYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateToDMY(ymdString) {
  if (!ymdString) return '';
  const parts = ymdString.split('-');
  if (parts.length !== 3) return ymdString;
  const [y, m, d] = parts;
  return `${d}-${m}-${y}`;
}

export default function CoachAttendanceRegister({ 
  currentPortal: portalProp, 
  defaultCoachId, 
  allowedCoaches 
}) {
  const { data, addToast, applyCoachLeave, currentPortal: crmPortal } = useCrm();
  const effectivePortal = portalProp || crmPortal || 'admin';

  // State: selected date, default 11-11-2026 (YYYY-MM-DD = 2026-11-11)
  const [selectedDate, setSelectedDate] = useState('2026-11-11');
  const [calendarView, setCalendarView] = useState('week'); // 'month' | 'week' | 'day'

  // Filter States
  const [selectedCoachId, setSelectedCoachId] = useState(defaultCoachId || 'all');
  const [selectedBatchId, setSelectedBatchId] = useState('all');
  const [coachSearchQuery, setCoachSearchQuery] = useState('');

  // Coach Leave Workflow States
  const [showLeaveManager, setShowLeaveManager] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [formLeaveType, setFormLeaveType] = useState(LEAVE_TYPES.FULL_DAY);
  const [formHalfDaySession, setFormHalfDaySession] = useState(HALF_DAY_SESSIONS.MORNING);
  const [formStartDate, setFormStartDate] = useState(selectedDate);
  const [formEndDate, setFormEndDate] = useState(selectedDate);
  const [formReason, setFormReason] = useState('');
  const [formAttachmentName, setFormAttachmentName] = useState('');

  // Dropdown Open states
  const [isCoachDropdownOpen, setIsCoachDropdownOpen] = useState(false);
  const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);

  const coachDropdownRef = useRef(null);
  const batchDropdownRef = useRef(null);
  const dateInputRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (coachDropdownRef.current && !coachDropdownRef.current.contains(e.target)) {
        setIsCoachDropdownOpen(false);
      }
      if (batchDropdownRef.current && !batchDropdownRef.current.contains(e.target)) {
        setIsBatchDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse selected date
  const parsedDate = useMemo(() => {
    const parts = selectedDate.split('-').map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date(2026, 10, 11);
  }, [selectedDate]);

  // Month & Year heading (e.g., "November, 2026")
  const monthYearHeading = useMemo(() => {
    const month = parsedDate.toLocaleDateString('en-US', { month: 'long' });
    const year = parsedDate.getFullYear();
    return `${month}, ${year}`;
  }, [parsedDate]);

  // Compute 7 days of the week for Week View (Sunday 08 to Saturday 14 November 2026)
  const weekDays = useMemo(() => {
    const dayOfWeek = parsedDate.getDay(); // 0 is Sunday
    const weekStart = new Date(parsedDate);
    weekStart.setDate(parsedDate.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const fullDate = formatDateToYMD(d);
      const dateNumber = String(d.getDate()).padStart(2, '0');
      days.push({
        dayName: DAY_NAMES[i],
        dateNumber,
        fullDate,
        isSelected: fullDate === selectedDate
      });
    }
    return days;
  }, [parsedDate, selectedDate]);

  // Days for Month View
  const monthGridDays = useMemo(() => {
    const year = parsedDate.getFullYear();
    const month = parsedDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const grid = [];
    // Leading days from previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      const prevDate = new Date(year, month, 1 - (startDayOfWeek - i));
      grid.push({
        dateNumber: String(prevDate.getDate()).padStart(2, '0'),
        fullDate: formatDateToYMD(prevDate),
        isCurrentMonth: false,
        isSelected: formatDateToYMD(prevDate) === selectedDate
      });
    }
    // Days in current month
    for (let i = 1; i <= totalDays; i++) {
      const curDate = new Date(year, month, i);
      const fullDate = formatDateToYMD(curDate);
      grid.push({
        dateNumber: String(i).padStart(2, '0'),
        fullDate,
        isCurrentMonth: true,
        isSelected: fullDate === selectedDate
      });
    }
    // Trailing days
    const remaining = (7 - (grid.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      grid.push({
        dateNumber: String(nextDate.getDate()).padStart(2, '0'),
        fullDate: formatDateToYMD(nextDate),
        isCurrentMonth: false,
        isSelected: formatDateToYMD(nextDate) === selectedDate
      });
    }
    return grid;
  }, [parsedDate, selectedDate]);

  // Filtered coaches from actual data (no dummy records)
  const availableCoaches = useMemo(() => {
    const all = allowedCoaches || data.coaches || [];
    if (!coachSearchQuery.trim()) return all;
    const q = coachSearchQuery.toLowerCase();
    return all.filter(c => 
      c.name?.toLowerCase().includes(q) || 
      c.specialization?.toLowerCase().includes(q) ||
      c.center?.toLowerCase().includes(q)
    );
  }, [allowedCoaches, data.coaches, coachSearchQuery]);

  // Selected coach label
  const selectedCoachLabel = useMemo(() => {
    if (selectedCoachId === 'all') return 'All Coaches';
    const found = (data.coaches || []).find(c => c.id === selectedCoachId);
    return found ? found.name : 'All Coaches';
  }, [selectedCoachId, data.coaches]);

  // Target coach ID for leave queries and applications
  const targetCoachIdForLeave = useMemo(() => {
    if (defaultCoachId) return defaultCoachId;
    if (selectedCoachId !== 'all') return selectedCoachId;
    return (data.coaches || [])[0]?.id || '';
  }, [defaultCoachId, selectedCoachId, data.coaches]);

  // Target coach record
  const targetCoachRecord = useMemo(() => {
    if (!targetCoachIdForLeave) return null;
    return (data.coaches || []).find(c => c.id === targetCoachIdForLeave) || null;
  }, [targetCoachIdForLeave, data.coaches]);

  // Active approved leave covering the currently selected date
  const activeApprovedLeave = useMemo(() => {
    if (!targetCoachIdForLeave) return null;
    return getCoachApprovedLeaveForDate(data.coachLeaveRequests || [], targetCoachIdForLeave, selectedDate);
  }, [data.coachLeaveRequests, targetCoachIdForLeave, selectedDate]);

  // Count pending leaves for current coach or all coaches
  const pendingLeavesCount = useMemo(() => {
    const list = data.coachLeaveRequests || [];
    if (effectivePortal === 'coach' && defaultCoachId) {
      return list.filter(r => r.coachId === defaultCoachId && r.status === LEAVE_STATUSES.PENDING).length;
    }
    return list.filter(r => r.status === LEAVE_STATUSES.PENDING).length;
  }, [data.coachLeaveRequests, effectivePortal, defaultCoachId]);

  // Selected batch label
  const selectedBatchLabel = useMemo(() => {
    if (selectedBatchId === 'all') return 'All Batches';
    const found = (data.classes || []).find(b => b.id === selectedBatchId);
    return found ? found.name : 'All Batches';
  }, [selectedBatchId, data.classes]);

  // Navigation: Previous
  const handlePrev = () => {
    const d = new Date(parsedDate);
    if (calendarView === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (calendarView === 'day') {
      d.setDate(d.getDate() - 1);
    } else {
      // week
      d.setDate(d.getDate() - 7);
    }
    setSelectedDate(formatDateToYMD(d));
  };

  // Navigation: Next
  const handleNext = () => {
    const d = new Date(parsedDate);
    if (calendarView === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (calendarView === 'day') {
      d.setDate(d.getDate() + 1);
    } else {
      // week
      d.setDate(d.getDate() + 7);
    }
    setSelectedDate(formatDateToYMD(d));
  };

  // Navigation: Today (Default reference date: 2026-11-11)
  const handleToday = () => {
    setSelectedDate('2026-11-11');
  };

  // Date picker change
  const handleDateChange = (e) => {
    if (e.target.value) {
      setSelectedDate(e.target.value);
    }
  };

  // Save Attendance action with strict approved leave lock
  const handleSaveAttendance = () => {
    if (activeApprovedLeave && activeApprovedLeave.leaveType === LEAVE_TYPES.FULL_DAY) {
      addToast(`Cannot mark normal attendance: Coach ${targetCoachRecord?.name || ''} is on Approved Full-Day Leave on ${formatDateToDMY(selectedDate)}.`, 'error');
      return;
    }
    const coachLabel = selectedCoachId === 'all' ? 'All Coaches' : selectedCoachLabel;
    addToast(`Coach attendance saved successfully for ${coachLabel} on ${formatDateToDMY(selectedDate)}.`, 'success');
  };

  // Apply Leave Handlers
  const handleOpenApplyModal = () => {
    setFormStartDate(selectedDate);
    setFormEndDate(selectedDate);
    setFormLeaveType(LEAVE_TYPES.FULL_DAY);
    setFormHalfDaySession(HALF_DAY_SESSIONS.MORNING);
    setFormReason('');
    setFormAttachmentName('');
    setIsApplyModalOpen(true);
  };

  const handleApplyLeaveSubmit = (e) => {
    e.preventDefault();
    if (!targetCoachIdForLeave) {
      addToast('No coach profile found to submit leave application.', 'error');
      return;
    }
    const coachRec = (data.coaches || []).find(c => c.id === targetCoachIdForLeave);
    const res = applyCoachLeave({
      coachId: targetCoachIdForLeave,
      coachName: coachRec?.name || selectedCoachLabel,
      coachEmail: coachRec?.email || '',
      center: coachRec?.center || 'Main Branch',
      leaveType: formLeaveType,
      halfDaySession: formLeaveType === LEAVE_TYPES.HALF_DAY ? formHalfDaySession : undefined,
      startDate: formStartDate,
      endDate: formEndDate,
      reason: formReason,
      attachmentName: formAttachmentName || undefined,
    });
    if (res.success) {
      setIsApplyModalOpen(false);
    }
  };

  // Export Data action
  const handleExportData = () => {
    const headers = ['COACH ID', 'COACH NAME', 'CENTER / LOCATION', 'BATCH', 'DATE', 'STATUS'];
    const exportCoaches = selectedCoachId === 'all' 
      ? (data.coaches || [])
      : (data.coaches || []).filter(c => c.id === selectedCoachId);

    const rows = exportCoaches.length > 0 
      ? exportCoaches.map(c => [
          `"${c.id}"`,
          `"${c.name}"`,
          `"${c.center || 'All Centers'}"`,
          `"${selectedBatchLabel}"`,
          `"${selectedDate}"`,
          `"Scheduled"`
        ])
      : [[
          `"ALL"`,
          `"${selectedCoachLabel}"`,
          `"All Centers"`,
          `"${selectedBatchLabel}"`,
          `"${selectedDate}"`,
          `"No active session logs"`
        ]];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `coach_attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Exported Coach Attendance register (${formatDateToDMY(selectedDate)}) to CSV.`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ========================================================= */}
      {/* 1. MAIN CARD: Coach Attendance Register & Filter Controls */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B501A] shadow-xs space-y-5">
        {/* Top Row: Title + Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#F4510B]" />
            <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">
              Coach Attendance Register
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {/* Apply for Leave Button */}
            <button
              type="button"
              onClick={handleOpenApplyModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#FFF4E8] text-[#F4510B] hover:bg-[#FFE8D6] transition-all border border-[#F4510B30] shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#F4510B]" />
              <span>Apply for Leave</span>
            </button>

            {/* View Leave Requests Toggle */}
            <button
              type="button"
              onClick={() => setShowLeaveManager((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border shadow-2xs cursor-pointer ${
                showLeaveManager
                  ? 'bg-[#172B50] text-white border-[#172B50]'
                  : 'bg-white text-[#172B50] border-[#172B5020] hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{effectivePortal === 'coach' ? 'My Leave Requests' : 'Coach Leaves'}</span>
              {pendingLeavesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#F4510B] text-white">
                  {pendingLeavesCount}
                </span>
              )}
            </button>

            {/* Export Data Button */}
            <button
              type="button"
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#FFF4E8] text-[#F4510B] hover:bg-[#FFE8D6] transition-all border border-[#F4510B25] shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#F4510B]" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Save Attendance Button */}
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={activeApprovedLeave && activeApprovedLeave.leaveType === LEAVE_TYPES.FULL_DAY}
              className={`inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer ${
                activeApprovedLeave && activeApprovedLeave.leaveType === LEAVE_TYPES.FULL_DAY
                  ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                  : 'bg-[#F4510B] text-white hover:bg-[#E04505]'
              }`}
              title={activeApprovedLeave && activeApprovedLeave.leaveType === LEAVE_TYPES.FULL_DAY ? 'Attendance locked: Coach is on approved leave' : 'Save Attendance'}
            >
              {activeApprovedLeave && activeApprovedLeave.leaveType === LEAVE_TYPES.FULL_DAY ? (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Locked (On Leave)</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>Save Attendance</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Approved Leave Alert Banner */}
        {activeApprovedLeave && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-amber-950">
                  On Approved {activeApprovedLeave.leaveType} Leave ({formatLeaveDateRange(activeApprovedLeave.startDate, activeApprovedLeave.endDate)})
                </p>
                <p className="text-[11px] text-amber-800/85 mt-0.5">
                  Coach: <strong className="font-bold">{activeApprovedLeave.coachName}</strong> ({activeApprovedLeave.coachId}) • Reason: &ldquo;{activeApprovedLeave.reason}&rdquo;
                  {activeApprovedLeave.leaveType === LEAVE_TYPES.HALF_DAY && ` • Session: ${activeApprovedLeave.halfDaySession || 'Morning'}`}
                </p>
              </div>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              Leave Approved
            </span>
          </div>
        )}

        {/* Embedded Coach Leave Requests Manager if toggled */}
        {showLeaveManager && (
          <div className="pt-2 border-t border-[#172B5014] animate-in fade-in">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-sm font-extrabold text-[#172B50] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#F4510B]" />
                <span>Coach Leave Management</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLeaveManager(false)}
                className="text-xs text-[#172B50]/60 hover:text-[#F4510B] font-bold cursor-pointer"
              >
                Close View ✕
              </button>
            </div>
            <CoachLeaveRequestsManager
              mode={effectivePortal}
              coachId={effectivePortal === 'coach' ? defaultCoachId : undefined}
            />
          </div>
        )}

        {/* Filter Controls Row: All Coaches, Date Picker, Batch / Class, Search Coach */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end pt-1">
          {/* 1. All Coaches Dropdown (Orange Pill Button matching Image 1) */}
          <div className="relative" ref={coachDropdownRef}>
            <button
              type="button"
              onClick={() => setIsCoachDropdownOpen(prev => !prev)}
              aria-label="Filter by Coach"
              className="w-full bg-[#F4510B] text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between gap-2 shadow-xs hover:bg-[#E04505] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <Users className="w-4 h-4 text-white shrink-0" />
                <span className="truncate">{selectedCoachLabel}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white shrink-0 transition-transform ${isCoachDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isCoachDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-full min-w-[240px] bg-white rounded-2xl shadow-xl border border-[#172B5018] p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="max-h-60 overflow-y-auto space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCoachId('all');
                      setIsCoachDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      selectedCoachId === 'all'
                        ? 'bg-[#FFF4E8] text-[#F4510B]'
                        : 'text-[#172B50] hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <span>All Coaches</span>
                    {selectedCoachId === 'all' && <Check className="w-4 h-4 text-[#F4510B]" />}
                  </button>

                  <div className="h-px bg-[#172B5010] my-1" />

                  {availableCoaches.length === 0 ? (
                    <div className="px-3 py-3 text-[11px] text-[#172B50] opacity-60 text-center">
                      No coaches registered yet
                    </div>
                  ) : (
                    availableCoaches.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCoachId(c.id);
                          setIsCoachDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          selectedCoachId === c.id
                            ? 'bg-[#FFF4E8] text-[#F4510B]'
                            : 'text-[#172B50] hover:bg-[#F8F9FA]'
                        }`}
                      >
                        <div className="truncate">
                          <p className="truncate">{c.name}</p>
                          {c.specialization && (
                            <p className="text-[10px] font-medium opacity-65">{c.specialization}</p>
                          )}
                        </div>
                        {selectedCoachId === c.id && <Check className="w-4 h-4 text-[#F4510B] shrink-0" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Attendance Date Picker (DD-MM-YYYY, default 11-11-2026) */}
          <div className="relative">
            <div 
              onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.focus()}
              className="flex items-center justify-between bg-[#FFF4E8] border border-[#172B5018] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#172B50] cursor-pointer hover:border-[#F4510B50] transition-all"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#172B50] shrink-0" />
                <span className="tracking-wide">{formatDateToDMY(selectedDate)}</span>
              </div>
              <CalendarDays className="w-4 h-4 text-[#172B50] shrink-0 opacity-80" />
            </div>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              aria-label="Attendance Date"
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer pointer-events-auto"
            />
          </div>

          {/* 3. Batch / Class Dropdown */}
          <div className="relative" ref={batchDropdownRef}>
            <label className="text-[10px] font-extrabold uppercase text-[#172B50] opacity-75 block mb-1">
              Batch / Class
            </label>
            <button
              type="button"
              onClick={() => setIsBatchDropdownOpen(prev => !prev)}
              aria-label="Filter by Batch or Class"
              className="w-full bg-[#FFF4E8] text-[#172B50] border border-[#172B5018] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between gap-2 hover:border-[#F4510B50] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <Layers className="w-4 h-4 text-[#F4510B] shrink-0" />
                <span className="truncate">{selectedBatchLabel}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#172B50] shrink-0 transition-transform ${isBatchDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Batch Menu */}
            {isBatchDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-full min-w-[240px] bg-white rounded-2xl shadow-xl border border-[#172B5018] p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="max-h-60 overflow-y-auto space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBatchId('all');
                      setIsBatchDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      selectedBatchId === 'all'
                        ? 'bg-[#FFF4E8] text-[#F4510B]'
                        : 'text-[#172B50] hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <span>All Batches</span>
                    {selectedBatchId === 'all' && <Check className="w-4 h-4 text-[#F4510B]" />}
                  </button>

                  <div className="h-px bg-[#172B5010] my-1" />

                  {(data.classes || []).length === 0 ? (
                    <div className="px-3 py-3 text-[11px] text-[#172B50] opacity-60 text-center">
                      No batches created yet
                    </div>
                  ) : (
                    (data.classes || []).map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSelectedBatchId(b.id);
                          setIsBatchDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          selectedBatchId === b.id
                            ? 'bg-[#FFF4E8] text-[#F4510B]'
                            : 'text-[#172B50] hover:bg-[#F8F9FA]'
                        }`}
                      >
                        <div className="truncate">
                          <p className="truncate">{b.name}</p>
                          <p className="text-[10px] font-medium opacity-65">{b.program || b.sport} • {b.location || b.center}</p>
                        </div>
                        {selectedBatchId === b.id && <Check className="w-4 h-4 text-[#F4510B] shrink-0" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. Search Coach Input */}
          <div>
            <label className="text-[10px] font-extrabold uppercase text-[#172B50] opacity-75 block mb-1">
              Search Coach
            </label>
            <div className="relative flex items-center bg-white border border-[#172B5018] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#F4510B] focus-within:border-transparent transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={coachSearchQuery}
                onChange={(e) => setCoachSearchQuery(e.target.value)}
                placeholder="Search by coach name..."
                className="w-full text-xs sm:text-sm text-[#172B50] placeholder-slate-400 bg-transparent outline-none font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CALENDAR SECTION: November, 2026, View Toggles & Grid   */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#172B501A] shadow-xs space-y-6">
        {/* Calendar Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Dynamic Month Heading ("November, 2026") */}
          <h3 className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight">
            {monthYearHeading}
          </h3>

          {/* Center: View Switcher (Month, Week, Day) */}
          <div className="inline-flex items-center bg-[#F4F6F9] p-1 rounded-full border border-[#172B5010] self-start md:self-auto">
            <button
              type="button"
              onClick={() => setCalendarView('month')}
              className={`px-4 sm:px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                calendarView === 'month'
                  ? 'bg-[#F4510B] text-white shadow-2xs'
                  : 'text-[#172B50] hover:text-[#F4510B]'
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setCalendarView('week')}
              className={`px-5 sm:px-6 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                calendarView === 'week'
                  ? 'bg-[#F4510B] text-white shadow-2xs'
                  : 'text-[#172B50] hover:text-[#F4510B]'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setCalendarView('day')}
              className={`px-4 sm:px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                calendarView === 'day'
                  ? 'bg-[#F4510B] text-white shadow-2xs'
                  : 'text-[#172B50] hover:text-[#F4510B]'
              }`}
            >
              Day
            </button>
          </div>

          {/* Right: Prev (<), Today, Next (>) Navigation */}
          <div className="flex items-center gap-1.5 self-start md:self-auto">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Period"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#F4F6F9] hover:bg-[#FFF4E8] text-[#172B50] hover:text-[#F4510B] border border-[#172B5010] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-4 py-2 rounded-xl bg-[#F4F6F9] hover:bg-[#FFF4E8] text-xs font-bold text-[#172B50] hover:text-[#F4510B] border border-[#172B5010] transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Period"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#F4F6F9] hover:bg-[#FFF4E8] text-[#172B50] hover:text-[#F4510B] border border-[#172B5010] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VIEW A: WEEK VIEW (Sunday 08 - Saturday 14 Nov, 2026)      */}
        {/* ========================================================= */}
        {calendarView === 'week' && (
          <div className="space-y-3">
            {/* Day Header Cards Row (Aligned with Timetable Columns) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Spacer matching Time Column width */}
              <div className="w-20 sm:w-24 shrink-0" />

              {/* 7 Days Columns */}
              <div className="flex-1 grid grid-cols-7 gap-2 sm:gap-3">
                {weekDays.map((day) => (
                  <button
                    key={day.fullDate}
                    type="button"
                    onClick={() => setSelectedDate(day.fullDate)}
                    className={`rounded-2xl py-2.5 px-2 text-center transition-all cursor-pointer ${
                      day.isSelected
                        ? 'bg-[#172B50] text-white shadow-md border border-[#172B50]'
                        : 'bg-[#F4F6F9] hover:bg-[#FFF4E8] text-[#172B50] border border-transparent'
                    }`}
                  >
                    <span className={`block text-[10px] sm:text-[11px] font-semibold tracking-wide ${
                      day.isSelected ? 'text-slate-200' : 'text-slate-500'
                    }`}>
                      {day.dayName}
                    </span>
                    <span className={`block text-base sm:text-xl font-black mt-0.5 ${
                      day.isSelected ? 'text-white' : 'text-[#172B50]'
                    }`}>
                      {day.dateNumber}
                    </span>
                    {(() => {
                      const dayLeave = getCoachApprovedLeaveForDate(data.coachLeaveRequests || [], targetCoachIdForLeave, day.fullDate);
                      if (!dayLeave) return null;
                      return (
                        <span className="block mt-1 text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 rounded px-1 py-0.5 truncate">
                          Leave
                        </span>
                      );
                    })()}
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Empty Weekly Timetable Grid (6:00 am - 12:00 pm) */}
            <div className="border border-[#172B5018] rounded-2xl overflow-hidden bg-white shadow-2xs">
              {TIME_SLOTS.map((time, index) => (
                <div 
                  key={time} 
                  className={`flex items-stretch ${
                    index !== TIME_SLOTS.length - 1 ? 'border-b border-[#172B5012]' : ''
                  }`}
                >
                  {/* Time Slot Label */}
                  <div className="w-20 sm:w-24 px-3 py-4 text-xs font-semibold text-[#172B50] opacity-80 border-r border-[#172B5012] flex items-center justify-start shrink-0 select-none">
                    {time}
                  </div>

                  {/* 7 Empty Day Cells */}
                  <div className="flex-1 grid grid-cols-7">
                    {weekDays.map((day, dIdx) => (
                      <div
                        key={`${time}-${day.fullDate}`}
                        className={`h-14 sm:h-16 hover:bg-[#FFF4E8]/20 transition-colors ${
                          dIdx !== 6 ? 'border-r border-[#172B5012]' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW B: DAY VIEW (Selected Date Single Timetable Column)   */}
        {/* ========================================================= */}
        {calendarView === 'day' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-20 sm:w-24 shrink-0" />
              <div className="flex-1 max-w-sm">
                <div className="bg-[#172B50] text-white rounded-2xl py-2.5 px-4 text-center shadow-md">
                  <span className="block text-xs font-semibold text-slate-200">
                    {DAY_NAMES[parsedDate.getDay()]}
                  </span>
                  <span className="block text-xl font-black mt-0.5 text-white">
                    {formatDateToDMY(selectedDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-[#172B5018] rounded-2xl overflow-hidden bg-white shadow-2xs">
              {TIME_SLOTS.map((time, index) => (
                <div 
                  key={time} 
                  className={`flex items-stretch ${
                    index !== TIME_SLOTS.length - 1 ? 'border-b border-[#172B5012]' : ''
                  }`}
                >
                  <div className="w-20 sm:w-24 px-3 py-4 text-xs font-semibold text-[#172B50] opacity-80 border-r border-[#172B5012] flex items-center justify-start shrink-0 select-none">
                    {time}
                  </div>
                  <div className="flex-1 h-14 sm:h-16 hover:bg-[#FFF4E8]/20 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW C: MONTH VIEW (Monthly Calendar Grid)                 */}
        {/* ========================================================= */}
        {calendarView === 'month' && (
          <div className="border border-[#172B5018] rounded-2xl overflow-hidden bg-white shadow-2xs">
            {/* Day name column headers */}
            <div className="grid grid-cols-7 border-b border-[#172B5015] bg-[#F4F6F9] py-3 text-center">
              {DAY_NAMES.map(dayName => (
                <span key={dayName} className="text-xs font-bold text-[#172B50] uppercase tracking-wider">
                  {dayName.slice(0, 3)}
                </span>
              ))}
            </div>

            {/* Grid of days */}
            <div className="grid grid-cols-7 divide-x divide-y divide-[#172B5012]">
              {monthGridDays.map((cell, idx) => {
                const cellLeave = getCoachApprovedLeaveForDate(data.coachLeaveRequests || [], targetCoachIdForLeave, cell.fullDate);
                return (
                  <div
                    key={`${cell.fullDate}-${idx}`}
                    onClick={() => setSelectedDate(cell.fullDate)}
                    className={`h-20 sm:h-24 p-2 transition-all cursor-pointer hover:bg-[#FFF4E8]/30 ${
                      !cell.isCurrentMonth ? 'opacity-35 bg-slate-50/50' : ''
                    } ${cell.isSelected ? 'bg-[#FFF4E8]' : ''}`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                        cell.isSelected
                          ? 'bg-[#172B50] text-white shadow-sm'
                          : cell.isCurrentMonth
                          ? 'text-[#172B50]'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dateNumber}
                    </span>
                    {cellLeave && (
                      <span className="block mt-1 text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/90 rounded px-1 py-0.5 truncate text-center">
                        On Leave
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* APPLY FOR LEAVE MODAL                                     */}
      {/* ========================================================= */}
      {isApplyModalOpen && (
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title="Apply for Coach Leave"
        >
          <form onSubmit={handleApplyLeaveSubmit} className="space-y-4">
            {/* Auto-filled Coach Identity Banner */}
            <div className="bg-[#FFF4E8] border border-[#F4510B20] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#F4510B]">
                  Applicant Coach
                </span>
                <h4 className="text-sm font-black text-[#172B50] mt-0.5">
                  {targetCoachRecord?.name || selectedCoachLabel}
                </h4>
                <p className="text-[11px] text-[#172B50]/70">
                  ID: <strong className="font-bold">{targetCoachIdForLeave}</strong> • Location: {targetCoachRecord?.center || 'Main Branch'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#F4510B15] text-[#F4510B] flex items-center justify-center font-black text-sm shrink-0">
                {(targetCoachRecord?.name || 'C')[0]}
              </div>
            </div>

            {/* Leave Type: Full Day / Half Day */}
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1.5">
                Leave Type <span className="text-[#F4510B]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormLeaveType(LEAVE_TYPES.FULL_DAY)}
                  className={`py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    formLeaveType === LEAVE_TYPES.FULL_DAY
                      ? 'bg-[#172B50] text-white border-[#172B50]'
                      : 'bg-white text-[#172B50] border-[#172B5020] hover:bg-[#FFF4E8]'
                  }`}
                >
                  Full Day
                </button>
                <button
                  type="button"
                  onClick={() => setFormLeaveType(LEAVE_TYPES.HALF_DAY)}
                  className={`py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    formLeaveType === LEAVE_TYPES.HALF_DAY
                      ? 'bg-[#172B50] text-white border-[#172B50]'
                      : 'bg-white text-[#172B50] border-[#172B5020] hover:bg-[#FFF4E8]'
                  }`}
                >
                  Half Day
                </button>
              </div>
            </div>

            {/* Half Day Session Selector */}
            {formLeaveType === LEAVE_TYPES.HALF_DAY && (
              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1.5">
                  Half Day Session <span className="text-[#F4510B]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(HALF_DAY_SESSIONS).map((sess) => (
                    <button
                      key={sess}
                      type="button"
                      onClick={() => setFormHalfDaySession(sess)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formHalfDaySession === sess
                          ? 'bg-[#F4510B] text-white border-[#F4510B]'
                          : 'bg-white text-[#172B50] border-[#172B5020] hover:bg-slate-50'
                      }`}
                    >
                      {sess}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">
                  Start Date <span className="text-[#F4510B]">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formStartDate}
                  onChange={(e) => {
                    setFormStartDate(e.target.value);
                    if (formLeaveType === LEAVE_TYPES.HALF_DAY || e.target.value > formEndDate) {
                      setFormEndDate(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[#172B5025] focus:outline-none focus:border-[#F4510B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">
                  End Date <span className="text-[#F4510B]">*</span>
                </label>
                <input
                  type="date"
                  required
                  disabled={formLeaveType === LEAVE_TYPES.HALF_DAY}
                  value={formEndDate}
                  min={formStartDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className={`w-full px-3 py-2 text-xs font-bold rounded-xl border border-[#172B5025] focus:outline-none focus:border-[#F4510B] ${
                    formLeaveType === LEAVE_TYPES.HALF_DAY ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Reason for Leave <span className="text-[#F4510B]">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="State the reason for leave (medical, personal, family emergency, etc.)..."
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-[#172B5025] focus:outline-none focus:border-[#F4510B]"
              />
            </div>

            {/* Optional Attachment */}
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Optional Attachment / Doctor Note (File Name)
              </label>
              <input
                type="text"
                placeholder="e.g. medical_certificate.pdf or leave_note.jpg"
                value={formAttachmentName}
                onChange={(e) => setFormAttachmentName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5025] focus:outline-none focus:border-[#F4510B]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#172B5014]">
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-black bg-[#F4510B] text-white hover:bg-[#E04505] shadow-xs cursor-pointer"
              >
                Submit Leave Request
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
