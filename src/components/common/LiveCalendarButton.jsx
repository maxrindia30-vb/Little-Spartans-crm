import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight 
} from 'lucide-react';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function LiveCalendarButton({ classes = [], onViewSchedule }) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedCalDate, setSelectedCalDate] = useState(() => new Date());
  const [calViewYear, setCalViewYear] = useState(() => new Date().getFullYear());
  const [calViewMonth, setCalViewMonth] = useState(() => new Date().getMonth());
  const [liveClock, setLiveClock] = useState(() => new Date());
  const calendarRef = useRef(null);

  // Live real-time clock tick
  useEffect(() => {
    const timer = setInterval(() => setLiveClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Click outside and Escape key listener
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

  // Calendar calculations
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

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
    setCalViewYear(now.getFullYear());
    setCalViewMonth(now.getMonth());
    setSelectedCalDate(now);
  };

  const currentMonthDays = daysInMonth(calViewYear, calViewMonth);
  const startDayOffset = firstDayOfMonth(calViewYear, calViewMonth);
  const prevMonthDays = daysInMonth(calViewYear, calViewMonth - 1);

  const calCells = useMemo(() => {
    const cells = [];
    for (let i = startDayOffset - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }
    for (let d = 1; d <= currentMonthDays; d++) {
      const cellDateStr = `${calViewYear}-${String(calViewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayClasses = (classes || []).filter(c => {
        if (!c.date) return false;
        return c.date === cellDateStr;
      });
      cells.push({ 
        day: d, 
        isCurrentMonth: true, 
        dateStr: cellDateStr, 
        hasClasses: dayClasses.length > 0 
      });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, isCurrentMonth: false });
    }
    return cells;
  }, [calViewYear, calViewMonth, currentMonthDays, startDayOffset, prevMonthDays, classes]);

  const selectedDateStr = `${selectedCalDate.getFullYear()}-${String(selectedCalDate.getMonth() + 1).padStart(2, '0')}-${String(selectedCalDate.getDate()).padStart(2, '0')}`;
  
  const selectedDayClasses = useMemo(() => {
    return (classes || []).filter(c => c.date === selectedDateStr);
  }, [classes, selectedDateStr]);

  return (
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
        <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-[#F4510B] text-white text-[9px] font-black flex items-center justify-center leading-none ring-1.5 ring-white shadow-2xs select-none">
          {liveClock.getDate()}
        </span>
      </button>

      {calendarOpen && (
        <div className="absolute right-0 top-full mt-2.5 z-50 w-[310px] sm:w-[330px] bg-white rounded-2xl shadow-[0_16px_40px_rgba(23,43,80,0.18)] border border-[#172B5015] p-3.5 sm:p-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
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

          {/* Month Navigation */}
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

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
              <span key={i} className="text-[10px] font-black text-[#172B50]/45 uppercase select-none">
                {d}
              </span>
            ))}
          </div>

          {/* Day Grid */}
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
                  No sessions scheduled for this date
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[110px] overflow-y-auto scrollbar-thin pr-0.5">
                {selectedDayClasses.slice(0, 3).map((cls, i) => (
                  <div key={cls.id || i} className="p-1.5 rounded-lg bg-[#FFF5ED] border border-[#F4510B20] text-left">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-black text-[#172B50] truncate">{cls.program || cls.className || 'Training Session'}</span>
                      <span className="font-bold text-[#F4510B] shrink-0">{cls.startTime || cls.time || '09:00 AM'}</span>
                    </div>
                    <div className="text-[9.5px] text-[#172B50]/70 truncate mt-0.5">
                      {cls.center || cls.location || 'KK NAGAR'}{cls.coachName ? ` • ${cls.coachName}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {onViewSchedule && (
              <button
                type="button"
                onClick={() => {
                  setCalendarOpen(false);
                  onViewSchedule();
                }}
                className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-[#172B50] hover:bg-[#F4510B] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <span>Open Class Schedules</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
