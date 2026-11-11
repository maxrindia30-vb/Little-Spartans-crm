import React, { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  Plus,
  MapPin,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  List,
  Columns,
} from 'lucide-react';
import { useCrm } from '../../../context/CrmContext';
import { getCommonLocations } from '../../../services/locationService';
import Modal from '../../../components/common/Modal';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON_FIRST_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function toYmd(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMondayOfWeek(ymd) {
  const d = new Date(`${ymd}T00:00:00`);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export default function ClassSchedulesPage() {
  const {
    data,
    createClassSchedule,
    createRecurringClassSchedules,
    updateClassSchedule,
    cancelClassSchedule,
    completeClassSchedule,
    checkScheduleConflictLive,
  } = useCrm();

  const activeLocations = getCommonLocations(data);
  const todayYmd = toYmd(new Date());

  // View Modes: 'daily' | 'weekly' | 'calendar'
  const [viewMode, setViewMode] = useState('weekly');
  const [focusDate, setFocusDate] = useState(todayYmd);

  // Filters
  const [locationFilter, setLocationFilter] = useState('All');
  const [programFilter, setProgramFilter] = useState('All');
  const [coachFilter, setCoachFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Create / Edit Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    className: '',
    scheduleMode: 'one-time',
    recurringDays: ['Monday', 'Wednesday', 'Friday'],
    recurringWeeks: '4',
    location: activeLocations[0]?.name || '',
    program: (data.programs || [])[0]?.name || '',
    batchId: '',
    batch: '',
    date: todayYmd,
    weekday: WEEKDAYS[new Date(`${todayYmd}T00:00:00`).getDay()],
    startTime: '16:30',
    endTime: '17:30',
    coachId: '',
    coach2Id: '',
    capacity: '15',
    notes: '',
  });

  // Cancel Modal
  const [cancellingSchedule, setCancellingSchedule] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const filteredSchedules = useMemo(() => {
    return (data.classSchedules || [])
      .filter((sch) => {
        const matchesLoc = locationFilter === 'All' || sch.location === locationFilter;
        const matchesProg = programFilter === 'All' || sch.program === programFilter;
        const matchesCoach =
          coachFilter === 'All' ||
          sch.coachId === coachFilter ||
          (sch.additionalCoaches || []).some((ac) => ac.coachId === coachFilter);
        const matchesStatus = statusFilter === 'All' || sch.status === statusFilter;
        return matchesLoc && matchesProg && matchesCoach && matchesStatus;
      })
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
  }, [data.classSchedules, locationFilter, programFilter, coachFilter, statusFilter]);

  // Hierarchy: batches belonging to the selected Location + Program
  const matchingBatchesForForm = useMemo(() => {
    return (data.classes || []).filter(
      (c) =>
        (!scheduleForm.location || c.center === scheduleForm.location) &&
        (!scheduleForm.program || c.program === scheduleForm.program) &&
        c.status !== 'Inactive'
    );
  }, [data.classes, scheduleForm.location, scheduleForm.program]);

  // Live conflict evaluation in form
  const formConflict = useMemo(() => {
    if (!isScheduleModalOpen) return { hasConflict: false };
    const coachObj = (data.coaches || []).find((c) => c.id === scheduleForm.coachId);
    const coach2Obj = (data.coaches || []).find((c) => c.id === scheduleForm.coach2Id);
    const matchedBatch = (data.classes || []).find((c) => c.id === scheduleForm.batchId);
    const additionalCoaches = coach2Obj
      ? [{ coachId: coach2Obj.id, coachName: coach2Obj.name }]
      : matchedBatch?.additionalCoaches || [];
    return checkScheduleConflictLive(
      {
        location: scheduleForm.location,
        coachId: scheduleForm.coachId,
        coachName: coachObj?.name || '',
        additionalCoaches,
        date: scheduleForm.date,
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        venue: '',
      },
      editingSchedule?.id || null
    );
  }, [isScheduleModalOpen, scheduleForm, data.coaches, data.classes, checkScheduleConflictLive, editingSchedule]);

  const openCreateModal = (presetDate = focusDate) => {
    const defaultLoc = locationFilter !== 'All' ? locationFilter : activeLocations[0]?.name || '';
    const defaultProg =
      programFilter !== 'All' ? programFilter : (data.programs || [])[0]?.name || '';
    const firstBatch = (data.classes || []).find(
      (c) => c.center === defaultLoc && c.program === defaultProg && c.status !== 'Inactive'
    );
    const weekday = WEEKDAYS[new Date(`${presetDate}T00:00:00`).getDay()];

    setEditingSchedule(null);
    setScheduleForm({
      className: firstBatch?.name || '',
      scheduleMode: 'one-time',
      recurringDays: [weekday || 'Monday'],
      recurringWeeks: '4',
      location: defaultLoc,
      program: defaultProg,
      batchId: firstBatch?.id || '',
      batch: firstBatch?.name || '',
      date: presetDate,
      weekday,
      startTime: '16:30',
      endTime: '17:30',
      coachId: firstBatch?.coachId || '',
      coach2Id: firstBatch?.additionalCoaches?.[0]?.coachId || '',
      capacity: String(firstBatch?.capacity || 15),
      notes: '',
    });
    setIsScheduleModalOpen(true);
  };

  const openEditModal = (sch) => {
    const derivedWeekday =
      sch.weekday || (sch.date ? WEEKDAYS[new Date(`${sch.date}T00:00:00`).getDay()] : 'Monday');
    setEditingSchedule(sch);
    setScheduleForm({
      className: sch.className || sch.batch || '',
      scheduleMode: 'one-time',
      recurringDays: [derivedWeekday],
      recurringWeeks: '4',
      location: sch.location || '',
      program: sch.program || '',
      batchId: sch.batchId || '',
      batch: sch.batch || '',
      date: sch.date || todayYmd,
      weekday: derivedWeekday,
      startTime: sch.startTime || '16:30',
      endTime: sch.endTime || '17:30',
      coachId: sch.coachId || '',
      coach2Id: sch.additionalCoaches?.[0]?.coachId || '',
      capacity: String(sch.capacity || 15),
      notes: sch.notes || '',
    });
    setIsScheduleModalOpen(true);
  };

  const handleBatchSelection = (batchId) => {
    const batch = (data.classes || []).find((c) => c.id === batchId);
    if (!batch) {
      setScheduleForm((prev) => ({ ...prev, batchId: '', batch: '' }));
      return;
    }
    setScheduleForm((prev) => ({
      ...prev,
      batchId: batch.id,
      batch: batch.name,
      className: prev.className || batch.name,
      coachId: batch.coachId || prev.coachId,
      coach2Id: batch.additionalCoaches?.[0]?.coachId || prev.coach2Id,
      capacity: String(batch.capacity || prev.capacity),
    }));
  };

  const toggleRecurringDay = (dayName) => {
    setScheduleForm((prev) => {
      const exists = prev.recurringDays.includes(dayName);
      const nextDays = exists
        ? prev.recurringDays.filter((d) => d !== dayName)
        : [...prev.recurringDays, dayName];
      return { ...prev, recurringDays: nextDays };
    });
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    const selectedCoach = (data.coaches || []).find((c) => c.id === scheduleForm.coachId);
    const selectedCoach2 = (data.coaches || []).find((c) => c.id === scheduleForm.coach2Id);
    const selectedBatch = (data.classes || []).find((c) => c.id === scheduleForm.batchId);

    const additionalCoaches = selectedCoach2
      ? [{ coachId: selectedCoach2.id, coachName: selectedCoach2.name }]
      : selectedBatch?.additionalCoaches || [];

    const batchLabel = selectedBatch?.name || scheduleForm.batch || `${scheduleForm.program} Session`;
    const payload = {
      className: scheduleForm.className.trim() || batchLabel,
      location: scheduleForm.location,
      program: scheduleForm.program,
      batchId: scheduleForm.batchId,
      batch: batchLabel,
      coachId: selectedCoach?.id || '',
      coachName: selectedCoach?.name || 'Unassigned',
      additionalCoaches,
      date: scheduleForm.date,
      weekday: scheduleForm.weekday,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      venue: '',
      capacity: parseInt(scheduleForm.capacity, 10) || 15,
      notes: scheduleForm.notes,
    };

    if (editingSchedule) {
      const res = updateClassSchedule(editingSchedule.id, payload);
      if (res.success) setIsScheduleModalOpen(false);
    } else if (scheduleForm.scheduleMode === 'recurring') {
      const res = createRecurringClassSchedules({
        ...payload,
        recurringDays: scheduleForm.recurringDays,
        weeks: parseInt(scheduleForm.recurringWeeks, 10) || 4,
      });
      if (res.success) setIsScheduleModalOpen(false);
    } else {
      const res = createClassSchedule(payload);
      if (res.success) setIsScheduleModalOpen(false);
    }
  };

  // Calendar / Week date generators
  const weekDates = useMemo(() => {
    const monday = getMondayOfWeek(focusDate);
    return MON_FIRST_DAYS.map((dayName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return {
        dayName,
        ymd: toYmd(d),
        label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      };
    });
  }, [focusDate]);

  const calendarDays = useMemo(() => {
    const d = new Date(`${focusDate}T00:00:00`);
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startOffset = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
    const cells = [];
    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let dayNum = 1; dayNum <= lastDayOfMonth.getDate(); dayNum += 1) {
      const cellDate = new Date(year, month, dayNum);
      cells.push({
        dayNum,
        ymd: toYmd(cellDate),
      });
    }
    return {
      monthLabel: firstDayOfMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      cells,
    };
  }, [focusDate]);

  const shiftFocusDate = (deltaDays) => {
    const d = new Date(`${focusDate}T00:00:00`);
    d.setDate(d.getDate() + deltaDays);
    setFocusDate(toYmd(d));
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Updated':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  const dailySchedules = filteredSchedules.filter((s) => s.date === focusDate);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#172B5012] shadow-card">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F4510B]">
            <Clock className="w-3.5 h-3.5" /> Module 3 • Timetable, Venues & Conflict Guard
          </div>
          <h2 className="text-xl font-extrabold text-[#172B50] tracking-tight mt-0.5">
            Class Schedules (Daily, Weekly & Calendar)
          </h2>
          <p className="text-xs text-[#172B50] opacity-70 mt-0.5">
            Schedule location-specific sessions by batch, weekday, date, time & court. Every change automatically syncs to Coach Portal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openCreateModal(focusDate)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F4510B] text-white text-xs font-extrabold shadow-sm hover:bg-[#d84306] transition-all cursor-pointer self-start lg:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule Class Session
        </button>
      </div>

      {/* Filters + View Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-[#172B5012] shadow-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* View Mode Pills */}
          <div className="flex items-center gap-1 bg-[#FFF4E8] p-1 rounded-xl border border-[#172B5014]">
            {[
              { id: 'daily', label: 'Daily View', icon: List },
              { id: 'weekly', label: 'Weekly View', icon: Columns },
              { id: 'calendar', label: 'Calendar View', icon: CalendarDays },
            ].map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setViewMode(mode.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === mode.id
                      ? 'bg-[#172B50] text-white shadow-xs'
                      : 'text-[#172B50] opacity-75 hover:opacity-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {mode.label}
                </button>
              );
            })}
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftFocusDate(viewMode === 'daily' ? -1 : viewMode === 'weekly' ? -7 : -30)}
              className="p-2 rounded-xl border border-[#172B5018] bg-[#FFF4E8] text-[#172B50] hover:border-[#F4510B] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={focusDate}
              onChange={(e) => setFocusDate(e.target.value || todayYmd)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[#172B501A] bg-white text-[#172B50]"
            />
            <button
              type="button"
              onClick={() => shiftFocusDate(viewMode === 'daily' ? 1 : viewMode === 'weekly' ? 7 : 30)}
              className="p-2 rounded-xl border border-[#172B5018] bg-[#FFF4E8] text-[#172B50] hover:border-[#F4510B] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setFocusDate(todayYmd)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#F4510B] bg-[#FFF4E8] border border-[#F4510B25] cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>

        {/* Filter Selects */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-[#172B5010]">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-[#172B501A] bg-[#FFF4E8] text-[#172B50]"
          >
            <option value="All">All Locations</option>
            {activeLocations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>

          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-[#172B501A] bg-[#FFF4E8] text-[#172B50]"
          >
            <option value="All">All Sports Programs</option>
            {(data.programs || []).map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={coachFilter}
            onChange={(e) => setCoachFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-[#172B501A] bg-[#FFF4E8] text-[#172B50]"
          >
            <option value="All">All Coaches</option>
            {(data.coaches || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-[#172B501A] bg-[#FFF4E8] text-[#172B50]"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Updated">Updated</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* View 1: DAILY VIEW */}
      {viewMode === 'daily' && (
        <div className="bg-white rounded-2xl border border-[#172B5014] p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#172B50]">
              Daily Timetable — {WEEKDAYS[new Date(`${focusDate}T00:00:00`).getDay()]} ({focusDate})
            </h3>
            <span className="text-xs font-bold text-[#F4510B]">{dailySchedules.length} sessions</span>
          </div>

          {dailySchedules.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-[#172B5020] text-center">
              <p className="text-xs font-bold text-[#172B50] opacity-70">
                No class sessions scheduled on {focusDate}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {dailySchedules.map((sch) => (
                <div
                  key={sch.id}
                  className="p-4 rounded-2xl border border-[#172B5015] bg-[#FFF4E8]/40 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-[#172B50] text-white">
                          {sch.location}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white text-[#F4510B] border border-[#F4510B25]">
                          {sch.program}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-[#172B50] mt-1.5">{sch.batch}</h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${renderStatusBadge(
                        sch.status
                      )}`}
                    >
                      {sch.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-[#172B50]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[#F4510B]" />
                      {sch.startTime} - {sch.endTime}
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                      {sch.location}
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold col-span-2">
                      <UserCheck className="w-3.5 h-3.5 text-[#172B50]" />
                      Coach 1: {sch.coachName}
                      {sch.additionalCoaches?.length > 0 &&
                        ` • Coach 2: ${sch.additionalCoaches.map((c) => c.coachName).join(', ')}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#172B5010]">
                    <button
                      type="button"
                      onClick={() => openEditModal(sch)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-[#172B50] border border-[#172B501A] hover:border-[#F4510B] cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    {sch.status !== 'Completed' && sch.status !== 'Cancelled' && (
                      <>
                        <button
                          type="button"
                          onClick={() => completeClassSchedule(sch.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Complete
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCancellingSchedule(sch);
                            setCancelReason('');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer"
                        >
                          <XCircle className="w-3 h-3" /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View 2: WEEKLY TIMETABLE VIEW */}
      {viewMode === 'weekly' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
          {weekDates.map((col) => {
            const colItems = filteredSchedules.filter((s) => s.date === col.ymd);
            const isToday = col.ymd === todayYmd;

            return (
              <div
                key={col.ymd}
                className={`bg-white rounded-2xl border p-3 shadow-card flex flex-col min-h-[260px] ${
                  isToday ? 'border-[#F4510B]' : 'border-[#172B5014]'
                }`}
              >
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#172B5010]">
                  <div>
                    <p className={`text-xs font-extrabold ${isToday ? 'text-[#F4510B]' : 'text-[#172B50]'}`}>
                      {col.dayName}
                    </p>
                    <p className="text-[10px] font-semibold text-[#172B50] opacity-60">{col.label}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openCreateModal(col.ymd)}
                    title={`Add class on ${col.ymd}`}
                    className="p-1 rounded-lg bg-[#FFF4E8] text-[#F4510B] hover:bg-[#F4510B] hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {colItems.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-[11px] text-[#172B50] opacity-40 text-center px-2">
                    No sessions
                  </div>
                ) : (
                  <div className="space-y-2">
                    {colItems.map((sch) => (
                      <div
                        key={sch.id}
                        className="p-2.5 rounded-xl bg-[#FFF4E8]/75 border border-[#172B5012] space-y-1 text-[11px]"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold text-[#F4510B]">
                            {sch.startTime}-{sch.endTime}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${renderStatusBadge(
                              sch.status
                            )}`}
                          >
                            {sch.status}
                          </span>
                        </div>
                        <p className="font-extrabold text-[#172B50] leading-tight">{sch.batch}</p>
                        <p className="text-[10px] text-[#172B50] opacity-75">
                          {sch.location}
                        </p>
                        <p className="text-[10px] font-semibold text-[#172B50]">
                          Coach 1: {sch.coachName}
                          {sch.additionalCoaches?.length > 0 &&
                            ` • Coach 2: ${sch.additionalCoaches.map((c) => c.coachName).join(', ')}`}
                        </p>
                        <div className="flex items-center gap-1 pt-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(sch)}
                            className="text-[10px] font-bold text-[#172B50] hover:text-[#F4510B] cursor-pointer"
                          >
                            Edit
                          </button>
                          {sch.status !== 'Cancelled' && sch.status !== 'Completed' && (
                            <>
                              <span className="opacity-30">•</span>
                              <button
                                type="button"
                                onClick={() => completeClassSchedule(sch.id)}
                                className="text-[10px] font-bold text-emerald-700 cursor-pointer"
                              >
                                Complete
                              </button>
                              <span className="opacity-30">•</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setCancellingSchedule(sch);
                                  setCancelReason('');
                                }}
                                className="text-[10px] font-bold text-rose-600 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* View 3: MONTHLY CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-[#172B5014] p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#172B50] flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#F4510B]" />
              {calendarDays.monthLabel}
            </h3>
            <span className="text-[11px] font-semibold text-[#172B50] opacity-65">
              Click any date to inspect or add sessions
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-extrabold text-[#172B50] opacity-70">
            {MON_FIRST_DAYS.map((d) => (
              <div key={d} className="py-1">
                {d.slice(0, 3)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.cells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="min-h-[86px] rounded-xl bg-slate-50/60" />;
              }
              const dayItems = filteredSchedules.filter((s) => s.date === cell.ymd);
              const isSelected = cell.ymd === focusDate;

              return (
                <div
                  key={cell.ymd}
                  onClick={() => setFocusDate(cell.ymd)}
                  className={`min-h-[86px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#F4510B] bg-[#FFF4E8]'
                      : 'border-[#172B5012] bg-white hover:border-[#F4510B55]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#172B50]">{cell.dayNum}</span>
                    {dayItems.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#F4510B] text-white">
                        {dayItems.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 mt-1">
                    {dayItems.slice(0, 2).map((sch) => (
                      <div
                        key={sch.id}
                        className="truncate px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#172B50] text-white"
                        title={`${sch.startTime} ${sch.batch} (${sch.location})`}
                      >
                        {sch.startTime} {sch.batch}
                      </div>
                    ))}
                    {dayItems.length > 2 && (
                      <div className="text-[9px] font-bold text-[#F4510B]">
                        +{dayItems.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule Create / Edit Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={editingSchedule ? `Edit Schedule: ${editingSchedule.id}` : 'Schedule Class Session'}
        subtitle="Location → Program → Batch → Weekday & Timing → Venue & Coach (auto-synced to Coach Portal)"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          {formConflict.hasConflict && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formConflict.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Academy Location *</label>
              <select
                required
                value={scheduleForm.location}
                onChange={(e) => {
                  const nextLoc = e.target.value;
                  setScheduleForm((prev) => ({
                    ...prev,
                    location: nextLoc,
                    batchId: '',
                    batch: '',
                  }));
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              >
                <option value="">Select Location</option>
                {activeLocations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Sports Program *</label>
              <select
                required
                value={scheduleForm.program}
                onChange={(e) =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    program: e.target.value,
                    batchId: '',
                    batch: '',
                  }))
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              >
                <option value="">Select Program</option>
                {(data.programs || []).map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Class Title / Name</label>
              <input
                type="text"
                value={scheduleForm.className}
                onChange={(e) => setScheduleForm({ ...scheduleForm, className: e.target.value })}
                placeholder="e.g. Little Strikers Morning Drills"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Batches *</label>
              {matchingBatchesForForm.length > 0 ? (
                <select
                  value={scheduleForm.batchId}
                  onChange={(e) => handleBatchSelection(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
                >
                  <option value="">Select Batch</option>
                  {matchingBatchesForForm.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (Cap {b.capacity})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={scheduleForm.batch}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, batch: e.target.value })}
                  placeholder="Enter batch name or create under Batches"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
                />
              )}
            </div>
          </div>

          {!editingSchedule && (
            <div className="p-3 rounded-xl bg-[#FFF4E8]/70 border border-[#172B5015] space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-[#172B50]">Schedule Mode</span>
                <div className="inline-flex rounded-lg bg-white border border-[#172B501A] p-0.5">
                  <button
                    type="button"
                    onClick={() => setScheduleForm((prev) => ({ ...prev, scheduleMode: 'one-time' }))}
                    className={`px-3 py-1 text-[11px] font-bold rounded-md cursor-pointer ${
                      scheduleForm.scheduleMode === 'one-time'
                        ? 'bg-[#172B50] text-white'
                        : 'text-[#172B50]'
                    }`}
                  >
                    One-Time Class
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleForm((prev) => ({ ...prev, scheduleMode: 'recurring' }))}
                    className={`px-3 py-1 text-[11px] font-bold rounded-md cursor-pointer ${
                      scheduleForm.scheduleMode === 'recurring'
                        ? 'bg-[#F4510B] text-white'
                        : 'text-[#172B50]'
                    }`}
                  >
                    Weekly Recurring Timetable
                  </button>
                </div>
              </div>

              {scheduleForm.scheduleMode === 'recurring' && (
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#172B50]">Recurring Days *</span>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="font-bold text-[#172B50]">Repeat For:</span>
                      <select
                        value={scheduleForm.recurringWeeks}
                        onChange={(e) => setScheduleForm((prev) => ({ ...prev, recurringWeeks: e.target.value }))}
                        className="px-2 py-1 rounded-lg bg-white border border-[#172B5020] font-bold text-[#172B50]"
                      >
                        <option value="2">2 Weeks</option>
                        <option value="4">4 Weeks</option>
                        <option value="8">8 Weeks</option>
                        <option value="12">12 Weeks</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {MON_FIRST_DAYS.map((dayName) => {
                      const active = scheduleForm.recurringDays.includes(dayName);
                      return (
                        <button
                          key={dayName}
                          type="button"
                          onClick={() => toggleRecurringDay(dayName)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                            active
                              ? 'bg-[#F4510B] text-white border-[#F4510B]'
                              : 'bg-white text-[#172B50] border-[#172B5020] hover:bg-[#FFF4E8]'
                          }`}
                        >
                          {dayName.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                {scheduleForm.scheduleMode === 'recurring' && !editingSchedule ? 'Start Date *' : 'Class Date *'}
              </label>
              <input
                type="date"
                required
                value={scheduleForm.date}
                onChange={(e) => {
                  const nextDate = e.target.value;
                  const nextWeekday = nextDate
                    ? WEEKDAYS[new Date(`${nextDate}T00:00:00`).getDay()]
                    : scheduleForm.weekday;
                  setScheduleForm({ ...scheduleForm, date: nextDate, weekday: nextWeekday });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Weekday</label>
              <select
                value={scheduleForm.weekday}
                onChange={(e) => setScheduleForm({ ...scheduleForm, weekday: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              >
                {MON_FIRST_DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={scheduleForm.startTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">End Time *</label>
              <input
                type="time"
                required
                value={scheduleForm.endTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Coach 1</label>
              <select
                value={scheduleForm.coachId}
                onChange={(e) => {
                  const nextCoach1 = e.target.value;
                  setScheduleForm((prev) => ({
                    ...prev,
                    coachId: nextCoach1,
                    coach2Id: prev.coach2Id === nextCoach1 ? '' : prev.coach2Id,
                  }));
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              >
                <option value="">Select Coach 1</option>
                {(data.coaches || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Coach 2</label>
              <select
                value={scheduleForm.coach2Id}
                onChange={(e) => setScheduleForm({ ...scheduleForm, coach2Id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              >
                <option value="">Select Coach 2 (Optional)</option>
                {(data.coaches || [])
                  .filter((c) => c.id !== scheduleForm.coachId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">Session Notes / Drills</label>
            <input
              type="text"
              value={scheduleForm.notes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
              placeholder="Equipment setup or drill instructions..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#172B5014]">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formConflict.hasConflict}
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#F4510B] text-white hover:bg-[#d84306] disabled:opacity-50 cursor-pointer"
            >
              {editingSchedule ? 'Update Schedule' : 'Publish Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Schedule Modal */}
      <Modal
        isOpen={Boolean(cancellingSchedule)}
        onClose={() => setCancellingSchedule(null)}
        title="Cancel Class Session"
        subtitle={cancellingSchedule ? `${cancellingSchedule.batch} • ${cancellingSchedule.date}` : ''}
      >
        <div className="space-y-4">
          <textarea
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation (notifies Coach Portal automatically)..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCancellingSchedule(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
            >
              Keep Session
            </button>
            <button
              type="button"
              onClick={() => {
                if (cancellingSchedule) {
                  cancelClassSchedule(cancellingSchedule.id, cancelReason);
                  setCancellingSchedule(null);
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
            >
              Confirm Cancellation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
