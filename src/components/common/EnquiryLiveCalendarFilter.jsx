import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  Clock,
  Sparkles,
  RotateCcw
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * Helper to format a YYYY-MM-DD date into friendly text like "22 Nov 2026"
 */
function formatFriendlyDate(ymd) {
  if (!ymd) return '';
  try {
    const [y, m, d] = ymd.split('-').map(Number);
    if (!y || !m || !d) return ymd;
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return ymd;
  }
}

/**
 * Computes standard date range bounds
 */
export function getDateFilterBounds() {
  const now = new Date();
  const todayYmd = now.toISOString().split('T')[0];

  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  const yesterdayYmd = yest.toISOString().split('T')[0];

  // Last 7 days
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const sevenDaysAgoYmd = sevenDaysAgo.toISOString().split('T')[0];

  // This Week (Monday to Sunday)
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 for Mon, 6 for Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  const startOfWeekYmd = monday.toISOString().split('T')[0];
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const endOfWeekYmd = sunday.toISOString().split('T')[0];

  // This Month
  const startOfMonthYmd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const endOfMonthYmd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

  return {
    todayYmd,
    yesterdayYmd,
    sevenDaysAgoYmd,
    startOfWeekYmd,
    endOfWeekYmd,
    startOfMonthYmd,
    endOfMonthYmd
  };
}

export default function EnquiryLiveCalendarFilter({
  dateFilterMode = 'all',
  selectedDate = '',
  customDateRange = { start: '', end: '' },
  onDateFilterChange,
  enquiriesCountByDate = {},
  selectedLocation = 'All',
  totalFilteredCount = 0
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Initial calendar view defaulted to current month, selected date, or latest enquiry month
  const [viewYear, setViewYear] = useState(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}/.test(selectedDate)) {
      return parseInt(selectedDate.slice(0, 4), 10);
    }
    const dates = Object.keys(enquiriesCountByDate).filter(d => enquiriesCountByDate[d] > 0).sort();
    if (dates.length > 0) {
      const latest = dates[dates.length - 1];
      return parseInt(latest.slice(0, 4), 10);
    }
    return new Date().getFullYear();
  });

  const [viewMonth, setViewMonth] = useState(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}/.test(selectedDate)) {
      return parseInt(selectedDate.slice(5, 7), 10) - 1;
    }
    const dates = Object.keys(enquiriesCountByDate).filter(d => enquiriesCountByDate[d] > 0).sort();
    if (dates.length > 0) {
      const latest = dates[dates.length - 1];
      return parseInt(latest.slice(5, 7), 10) - 1;
    }
    return new Date().getMonth();
  });

  // Whenever popover opens, sync calendar view to selected date or latest enquiry month
  useEffect(() => {
    if (isOpen) {
      if (selectedDate && /^\d{4}-\d{2}-\d{2}/.test(selectedDate)) {
        setViewYear(parseInt(selectedDate.slice(0, 4), 10));
        setViewMonth(parseInt(selectedDate.slice(5, 7), 10) - 1);
      } else {
        const dates = Object.keys(enquiriesCountByDate).filter(d => enquiriesCountByDate[d] > 0).sort();
        if (dates.length > 0) {
          const latest = dates[dates.length - 1];
          setViewYear(parseInt(latest.slice(0, 4), 10));
          setViewMonth(parseInt(latest.slice(5, 7), 10) - 1);
        }
      }
    }
  }, [isOpen, selectedDate, enquiriesCountByDate]);

  // Local state for custom range inputs
  const [rangeStart, setRangeStart] = useState(customDateRange?.start || '');
  const [rangeEnd, setRangeEnd] = useState(customDateRange?.end || '');

  // Keep local range inputs synced with incoming props
  useEffect(() => {
    setRangeStart(customDateRange?.start || '');
    setRangeEnd(customDateRange?.end || '');
  }, [customDateRange]);

  // Click outside and Escape key listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const bounds = useMemo(() => getDateFilterBounds(), []);

  // Compute button display text
  const buttonLabel = useMemo(() => {
    if (dateFilterMode === 'today') return 'Enquiry Date: Today';
    if (dateFilterMode === 'yesterday') return 'Enquiry Date: Yesterday';
    if (dateFilterMode === 'this_week') return 'Enquiry Date: This Week';
    if (dateFilterMode === 'last_7_days') return 'Enquiry Date: Last 7 Days';
    if (dateFilterMode === 'this_month') return 'Enquiry Date: This Month';
    if (dateFilterMode === 'single_date' && selectedDate) {
      return `Enquiry Date: ${formatFriendlyDate(selectedDate)}`;
    }
    if (dateFilterMode === 'custom_range') {
      if (customDateRange?.start && customDateRange?.end) {
        return `Enquiry Date: ${formatFriendlyDate(customDateRange.start)} - ${formatFriendlyDate(customDateRange.end)}`;
      }
      if (customDateRange?.start) return `Enquiry Date: From ${formatFriendlyDate(customDateRange.start)}`;
    }
    return 'Enquiry Date: All Time';
  }, [dateFilterMode, selectedDate, customDateRange]);

  const isFiltered = dateFilterMode !== 'all';

  // Calendar calculations
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y, m) => (new Date(y, m, 1).getDay() + 6) % 7; // Monday = 0

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleJumpToday = (e) => {
    e.stopPropagation();
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  // Calendar Grid Cells
  const calendarCells = useMemo(() => {
    const cells = [];
    const currentMonthDays = daysInMonth(viewYear, viewMonth);
    const startOffset = firstDayOfMonth(viewYear, viewMonth);
    const prevMonthDays = daysInMonth(viewYear, viewMonth - 1);

    // Prev month padding cells
    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        dateStr: ''
      });
    }

    // Current month cells
    for (let d = 1; d <= currentMonthDays; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const count = enquiriesCountByDate[dateStr] || 0;
      cells.push({
        day: d,
        isCurrentMonth: true,
        dateStr,
        count
      });
    }

    return cells;
  }, [viewYear, viewMonth, enquiriesCountByDate]);

  // Handler: Selecting a specific calendar date cell
  const handleSelectDateCell = (dateStr) => {
    if (!dateStr) return;
    onDateFilterChange({
      mode: 'single_date',
      selectedDate: dateStr,
      customRange: { start: '', end: '' }
    });
    setIsOpen(false);
  };

  // Handler: Selecting a preset
  const handleSelectPreset = (mode) => {
    onDateFilterChange({
      mode,
      selectedDate: mode === 'today' ? bounds.todayYmd : mode === 'yesterday' ? bounds.yesterdayYmd : '',
      customRange: { start: '', end: '' }
    });
    if (mode === 'all') {
      setIsOpen(false);
    }
  };

  // Handler: Applying Custom Date Range
  const handleApplyCustomRange = (e) => {
    e.preventDefault();
    if (!rangeStart) return;
    onDateFilterChange({
      mode: 'custom_range',
      selectedDate: '',
      customRange: { start: rangeStart, end: rangeEnd || rangeStart }
    });
    setIsOpen(false);
  };

  // Handler: Resetting all date filter
  const handleResetDateFilter = (e) => {
    e?.stopPropagation();
    onDateFilterChange({
      mode: 'all',
      selectedDate: '',
      customRange: { start: '', end: '' }
    });
    setRangeStart('');
    setRangeEnd('');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      {/* ======================================================== */}
      {/* 1. Main Filter Button Trigger                            */}
      {/* ======================================================== */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`inline-flex items-center gap-2 pl-3 pr-8 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer select-none ${
          isFiltered
            ? 'bg-[#FFF5ED] text-[#F4510B] border-[#F4510B] shadow-2xs'
            : 'bg-[#F8FAFC] text-[#172B50] border-[#172B5018] hover:border-[#F4510B50]'
        }`}
        title="Filter enquiries by date with live calendar"
      >
        <Calendar className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
        <span className="whitespace-nowrap">{buttonLabel}</span>
        <ChevronDown
          className={`w-3 h-3 text-[#172B50]/50 absolute right-2.5 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-[#F4510B]' : ''
          }`}
        />
      </button>

      {/* Quick Clear Filter Button (When filtered) */}
      {isFiltered && (
        <button
          type="button"
          onClick={handleResetDateFilter}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#EF4444] text-white rounded-full flex items-center justify-center text-[10px] hover:bg-rose-600 shadow-xs cursor-pointer z-10"
          title="Clear date filter back to All Time"
        >
          <X className="w-2.5 h-2.5 stroke-[2.5]" />
        </button>
      )}

      {/* ======================================================== */}
      {/* 2. Interactive Calendar Popover Dropdown                 */}
      {/* ======================================================== */}
      {isOpen && (
        <div className="absolute left-0 top-11 z-50 bg-white rounded-2xl shadow-[0_16px_50px_rgba(23,43,80,0.18)] border border-[#172B5018] p-4 w-[340px] sm:w-[500px] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#172B5010] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#172B50]">Live Calendar Date Filter</h4>
                <p className="text-[10px] text-[#172B50]/60">
                  {selectedLocation !== 'All' ? `Filtering for ${selectedLocation}` : 'Click any date to see enquiries'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-lg text-[#172B50]/50 hover:text-[#172B50] hover:bg-[#172B500C] flex items-center justify-center cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            {/* Left Column: Quick Presets */}
            <div className="sm:col-span-5 flex flex-col gap-1.5 pr-0 sm:pr-3 sm:border-r sm:border-[#172B5010]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#172B50]/50 mb-1">
                Quick Presets
              </span>

              <button
                type="button"
                onClick={() => handleSelectPreset('all')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  dateFilterMode === 'all'
                    ? 'bg-[#172B50] text-white shadow-2xs'
                    : 'bg-[#F8FAFC] text-[#172B50] hover:bg-[#FFF5ED] hover:text-[#F4510B]'
                }`}
              >
                <span>All Time</span>
                {dateFilterMode === 'all' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('today')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  dateFilterMode === 'today'
                    ? 'bg-[#F4510B] text-white shadow-2xs'
                    : 'bg-[#F8FAFC] text-[#172B50] hover:bg-[#FFF5ED] hover:text-[#F4510B]'
                }`}
              >
                <span>Today</span>
                {enquiriesCountByDate[bounds.todayYmd] > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${dateFilterMode === 'today' ? 'bg-white text-[#F4510B]' : 'bg-[#F4510B] text-white'}`}>
                    {enquiriesCountByDate[bounds.todayYmd]}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('yesterday')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  dateFilterMode === 'yesterday'
                    ? 'bg-[#F4510B] text-white shadow-2xs'
                    : 'bg-[#F8FAFC] text-[#172B50] hover:bg-[#FFF5ED] hover:text-[#F4510B]'
                }`}
              >
                <span>Yesterday</span>
                {enquiriesCountByDate[bounds.yesterdayYmd] > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${dateFilterMode === 'yesterday' ? 'bg-white text-[#F4510B]' : 'bg-[#F4510B] text-white'}`}>
                    {enquiriesCountByDate[bounds.yesterdayYmd]}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('this_week')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  dateFilterMode === 'this_week'
                    ? 'bg-[#F4510B] text-white shadow-2xs'
                    : 'bg-[#F8FAFC] text-[#172B50] hover:bg-[#FFF5ED] hover:text-[#F4510B]'
                }`}
              >
                <span>This Week</span>
                {dateFilterMode === 'this_week' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('last_7_days')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  dateFilterMode === 'last_7_days'
                    ? 'bg-[#F4510B] text-white shadow-2xs'
                    : 'bg-[#F8FAFC] text-[#172B50] hover:bg-[#FFF5ED] hover:text-[#F4510B]'
                }`}
              >
                <span>Last 7 Days</span>
                {dateFilterMode === 'last_7_days' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('this_month')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  dateFilterMode === 'this_month'
                    ? 'bg-[#F4510B] text-white shadow-2xs'
                    : 'bg-[#F8FAFC] text-[#172B50] hover:bg-[#FFF5ED] hover:text-[#F4510B]'
                }`}
              >
                <span>This Month</span>
                {dateFilterMode === 'this_month' && <Check className="w-3.5 h-3.5" />}
              </button>

              {/* Custom Date Range Box */}
              <div className="mt-2 pt-2 border-t border-[#172B5010]">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#172B50]/50 block mb-1">
                  Custom Range
                </span>
                <form onSubmit={handleApplyCustomRange} className="space-y-1.5">
                  <input
                    type="date"
                    aria-label="Start date"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] font-semibold bg-[#F8FAFC] border border-[#172B5015] rounded-lg focus:outline-none focus:border-[#F4510B]"
                  />
                  <input
                    type="date"
                    aria-label="End date"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] font-semibold bg-[#F8FAFC] border border-[#172B5015] rounded-lg focus:outline-none focus:border-[#F4510B]"
                  />
                  <button
                    type="submit"
                    className="w-full py-1 text-[11px] font-black bg-[#172B50] text-white hover:bg-[#F4510B] rounded-lg transition-colors cursor-pointer"
                  >
                    Apply Range
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Live Month Calendar Grid */}
            <div className="sm:col-span-7 flex flex-col">
              {/* Calendar Month Navigation */}
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-6 h-6 rounded-lg text-[#172B50] hover:bg-[#FFF5ED] hover:text-[#F4510B] flex items-center justify-center transition-colors cursor-pointer"
                  title="Previous month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-[#172B50]">
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </span>
                  <button
                    type="button"
                    onClick={handleJumpToday}
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold text-[#F4510B] bg-[#FFF5ED] hover:brightness-95 transition-all cursor-pointer"
                    title="Jump to current month"
                  >
                    Today
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-6 h-6 rounded-lg text-[#172B50] hover:bg-[#FFF5ED] hover:text-[#F4510B] flex items-center justify-center transition-colors cursor-pointer"
                  title="Next month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Weekday Labels */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {WEEKDAY_NAMES.map((wd) => (
                  <span key={wd} className="text-[10px] font-black text-[#172B50]/40">
                    {wd}
                  </span>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((cell, idx) => {
                  if (!cell.isCurrentMonth) {
                    return (
                      <div
                        key={`prev-${idx}`}
                        className="h-8 rounded-lg flex items-center justify-center text-[10px] text-[#172B50]/20 font-medium select-none"
                      >
                        {cell.day}
                      </div>
                    );
                  }

                  const isSelected = dateFilterMode === 'single_date' && selectedDate === cell.dateStr;
                  const isToday = cell.dateStr === bounds.todayYmd;
                  const hasEnquiries = cell.count > 0;

                  return (
                    <button
                      key={cell.dateStr}
                      type="button"
                      onClick={() => handleSelectDateCell(cell.dateStr)}
                      className={`h-8 rounded-lg relative flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F4510B] text-white font-black shadow-xs'
                          : isToday
                          ? 'border border-[#F4510B] text-[#F4510B] font-black hover:bg-[#FFF5ED]'
                          : hasEnquiries
                          ? 'bg-[#FFF5ED] text-[#172B50] font-black hover:bg-[#F4510B] hover:text-white'
                          : 'hover:bg-[#F8FAFC] text-[#172B50]/80 font-medium'
                      }`}
                      title={`${formatFriendlyDate(cell.dateStr)}: ${cell.count} enquiry(s)`}
                    >
                      <span className="text-[11px] leading-tight">{cell.day}</span>
                      {hasEnquiries && (
                        <span
                          className={`absolute -top-1 -right-1 min-w-[14px] h-[14px] px-1 rounded-full text-[9px] font-black flex items-center justify-center shadow-2xs ${
                            isSelected
                              ? 'bg-white text-[#F4510B]'
                              : 'bg-[#F4510B] text-white'
                          }`}
                        >
                          {cell.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Calendar Footer Status */}
              <div className="mt-3 pt-2.5 border-t border-[#172B5010] flex items-center justify-between text-[10px]">
                <div className="text-[#172B50]/70">
                  {dateFilterMode === 'single_date' && selectedDate ? (
                    <span className="font-bold text-[#F4510B]">
                      Viewing: {formatFriendlyDate(selectedDate)} ({totalFilteredCount} matching)
                    </span>
                  ) : (
                    <span>Click a date with badge to filter</span>
                  )}
                </div>
                {isFiltered && (
                  <button
                    type="button"
                    onClick={handleResetDateFilter}
                    className="inline-flex items-center gap-1 text-[#EF4444] font-bold hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
