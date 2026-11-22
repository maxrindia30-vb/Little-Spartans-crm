import React, { useMemo, useState, useRef, useEffect } from 'react';
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
  AlertTriangle,
  UserCheck,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
  List,
  Columns,
  Upload,
  FileText,
  X,
  Paperclip,
  Download,
  Check,
  MoreVertical,
  Eye,
  Edit2,
  Layers,
  ArrowLeftRight,
  RotateCw,
} from 'lucide-react';
import { useCrm } from '../../../context/CrmContext';
import { getCommonLocations } from '../../../services/locationService';
import { getCoachApprovedLeaveForDate } from '../../../services/coachLeaveService';
import { checkScheduleConflict } from '../../../services/scheduleService';
import Modal from '../../../components/common/Modal';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON_FIRST_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function toYmd(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatSessionDate(ymd) {
  if (!ymd) return '';
  const d = new Date(`${ymd}T00:00:00`);
  if (isNaN(d.getTime())) return ymd;
  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = d.getDate();
  const monthName = d.toLocaleDateString('en-US', { month: 'short' });
  const year = d.getFullYear();
  return `${dayName}, ${dayNum} ${monthName} ${year}`;
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
    assignEmergencyCoachReplacement,
    revokeEmergencyCoachReplacement,
    addToast,
  } = useCrm();

  const activeLocations = getCommonLocations(data);
  const todayYmd = toYmd(new Date());

  // View Modes: 'all_schedules' | 'daily' | 'weekly' | 'calendar' | 'history'
  const [viewMode, setViewMode] = useState('all_schedules');
  const [focusDate, setFocusDate] = useState(todayYmd);

  // Reschedule Mode state for unified reschedule flow
  const [isRescheduleMode, setIsRescheduleMode] = useState(false);

  // Filters
  const [locationFilter, setLocationFilter] = useState('All');
  const [programFilter, setProgramFilter] = useState('All');
  const [coachFilter, setCoachFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Three-dot action dropdown state
  const [activeDropdownScheduleId, setActiveDropdownScheduleId] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside or escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdownScheduleId(null);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setActiveDropdownScheduleId(null);
      }
    }
    if (activeDropdownScheduleId) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDropdownScheduleId]);

  // Emergency Coach Replacement Drawer State
  const [replacementDrawerSchedule, setReplacementDrawerSchedule] = useState(null);
  const [replacementCoachId, setReplacementCoachId] = useState('');
  const [replacementReason, setReplacementReason] = useState('');
  const [replacementError, setReplacementError] = useState('');

  // View Class Modal State
  const [viewingClassSchedule, setViewingClassSchedule] = useState(null);

  // Revoke Replacement Modal State
  const [revokingSchedule, setRevokingSchedule] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');

  // File Upload Ref
  const fileInputRef = useRef(null);

  // All Locations dynamically from Academy Centers and Locations
  const allFilterLocations = useMemo(() => {
    const locSet = new Set();
    (data.locations || []).forEach((l) => locSet.add(l.name));
    (data.academy?.centers || []).forEach((c) => locSet.add(c));
    (data.classSchedules || []).forEach((s) => {
      if (s.location) locSet.add(s.location);
    });
    const arr = Array.from(locSet);
    return arr.length > 0 ? arr : ['KK NAGAR', 'KILPAUK', 'MAHALINGAPURAM', 'ANNA NAGAR', 'KOLATHUR'];
  }, [data.locations, data.academy, data.classSchedules]);

  // Available Programs
  const availableProgramsList = useMemo(() => {
    const progs = (data.programs || []).map((p) => p.name);
    if (!progs.includes('Spartan Gymnastics & Agility')) progs.unshift('Spartan Gymnastics & Agility');
    if (!progs.includes('Junior Football Champions')) progs.push('Junior Football Champions');
    if (!progs.includes('Spartan Athletics & Sprinting')) progs.push('Spartan Athletics & Sprinting');
    if (!progs.includes('Basketball Rising Stars')) progs.push('Basketball Rising Stars');
    if (!progs.includes('Spartan Martial Arts & Karate')) progs.push('Spartan Martial Arts & Karate');
    if (!progs.includes('Little Cubs Multi-Sport')) progs.push('Little Cubs Multi-Sport');
    if (!progs.includes('After School Program')) progs.push('After School Program');
    if (!progs.includes('School Program')) progs.push('School Program');
    return Array.from(new Set(progs));
  }, [data.programs]);

  // Create / Edit Modal State (same clean pattern as Super Coach portal)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    className: '',
    location: 'KK NAGAR',
    program: 'Spartan Gymnastics & Agility',
    batch: 'Batch Alpha (Evening)',
    batchId: '',
    startTime: '17:00',
    endTime: '18:00',
    timingDisplay: '5:00 PM – 6:00 PM',
    venue: 'Training Court A',
    weekdays: ['Sunday'],
    date: todayYmd,
    weekday: WEEKDAYS[new Date(`${todayYmd}T00:00:00`).getDay()] || 'Sunday',
    recurringWeeks: '1',
    coachId: '',
    coach2Id: '',
    capacity: '15',
    notes: '',
    attachment: null,
  });

  // Cancel Modal
  const [cancellingSchedule, setCancellingSchedule] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Available Venues for the selected Location
  const availableVenuesForLocation = useMemo(() => {
    const locLower = (scheduleForm.location || '').toLowerCase().trim();
    const locObj = (data.locations || []).find(
      (l) => (l.name || '').toLowerCase().trim() === locLower
    );
    if (locObj?.courts && Array.isArray(locObj.courts) && locObj.courts.length > 0) {
      return locObj.courts;
    }
    return ['Main Turf Ground', 'Training Court A', 'Practice Arena B', 'Warm-up Studio', 'Indoor Gymnasium'];
  }, [scheduleForm.location, data.locations]);

  // Dependent Batches for the selected Location
  const currentBatchesForLocation = useMemo(() => {
    const locLower = (scheduleForm.location || '').toLowerCase().trim();
    const fromClasses = (data.classes || [])
      .filter((c) => (c.center || c.location || '').toLowerCase().trim() === locLower)
      .map((c) => c.name);
    const defaults = [
      'Batch Alpha (Evening)',
      'Batch Beta (Morning)',
      'Weekend Morning League',
      'Mixed Age Group',
      'Junior Speedsters',
      'Evening Hoops',
      'Little Cubs Agility'
    ];
    return Array.from(new Set([...fromClasses, ...defaults]));
  }, [scheduleForm.location, data.classes]);

  // Available Coaches for the selected Location
  const availableCoachesForLocation = useMemo(() => {
    const locLower = (scheduleForm.location || '').toLowerCase().trim();
    const all = data.coaches || [];
    const matched = all.filter((c) => (c.center || '').toLowerCase().trim() === locLower);
    const others = all.filter((c) => (c.center || '').toLowerCase().trim() !== locLower);
    return [...matched, ...others];
  }, [scheduleForm.location, data.coaches]);

  // Available weekdays for the selected location
  const currentAvailableWeekdays = useMemo(() => {
    return MON_FIRST_DAYS;
  }, []);

  // Eligible Replacement Coaches for the selected session
  const replacementCoachOptions = useMemo(() => {
    if (!replacementDrawerSchedule) return [];
    const allCoaches = data.coaches || [];
    const sessionDate = replacementDrawerSchedule.date;
    const sessionStart = replacementDrawerSchedule.startTime;
    const sessionEnd = replacementDrawerSchedule.endTime;
    const originalCoachId = replacementDrawerSchedule.coachId;

    return allCoaches.map((coach) => {
      const isOriginal = coach.id === originalCoachId;

      const approvedLeave = getCoachApprovedLeaveForDate(
        data.coachLeaveRequests || [],
        coach.id,
        sessionDate
      );

      const conflict = checkScheduleConflict(
        {
          coachId: coach.id,
          coachName: coach.name,
          date: sessionDate,
          startTime: sessionStart,
          endTime: sessionEnd,
        },
        data.classSchedules || [],
        replacementDrawerSchedule.id
      );

      let available = true;
      let reason = 'Available';

      if (isOriginal) {
        available = false;
        reason = 'Original Primary Coach';
      } else if (approvedLeave) {
        available = false;
        reason = `On Leave (${approvedLeave.leaveType || 'Approved'})`;
      } else if (conflict.hasConflict) {
        available = false;
        reason = 'Schedule Conflict (Busy)';
      }

      return {
        coach,
        available,
        reason,
      };
    });
  }, [replacementDrawerSchedule, data.coaches, data.coachLeaveRequests, data.classSchedules]);

  const selectedReplacementCoachOption = useMemo(() => {
    if (!replacementCoachId) return null;
    return replacementCoachOptions.find((opt) => opt.coach.id === replacementCoachId) || null;
  }, [replacementCoachId, replacementCoachOptions]);

  const enrolledStudentsForViewingSchedule = useMemo(() => {
    if (!viewingClassSchedule) return [];
    const loc = (viewingClassSchedule.location || '').toLowerCase();
    const batch = (viewingClassSchedule.batch || '').toLowerCase();
    return (data.students || []).filter((s) => {
      const sLoc = (s.location || s.center || '').toLowerCase();
      const sBatch = (s.batch || s.timing || '').toLowerCase();
      return (
        (sLoc === loc && (sBatch.includes(batch) || batch.includes(sBatch))) ||
        (sLoc === loc && s.status === 'Active')
      );
    });
  }, [viewingClassSchedule, data.students]);

  const handleConfirmReplacement = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!replacementDrawerSchedule) return;
    if (!replacementCoachId) {
      setReplacementError('Please select a replacement coach.');
      return;
    }
    if (!replacementReason.trim()) {
      setReplacementError('Reason for replacement is mandatory.');
      return;
    }

    const selectedOption = replacementCoachOptions.find(
      (opt) => opt.coach.id === replacementCoachId
    );
    if (!selectedOption || !selectedOption.available) {
      setReplacementError(
        selectedOption?.reason || 'Selected coach is unavailable for this session.'
      );
      return;
    }

    const res = assignEmergencyCoachReplacement(replacementDrawerSchedule.id, {
      replacementCoachId,
      replacementCoachName: selectedOption.coach.name,
      replacementCoachAvatar: selectedOption.coach.avatar || null,
      reason: replacementReason.trim(),
    });

    if (res.success) {
      setReplacementDrawerSchedule(null);
      setReplacementCoachId('');
      setReplacementReason('');
      setReplacementError('');
    } else {
      setReplacementError(res.error || 'Failed to assign replacement.');
    }
  };

  const handleConfirmRevoke = () => {
    if (!revokingSchedule) return;
    revokeEmergencyCoachReplacement(revokingSchedule.id, revokeReason);
    setRevokingSchedule(null);
    setRevokeReason('');
  };

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

  // Live conflict evaluation in form
  const formConflict = useMemo(() => {
    if (!isScheduleModalOpen) return { hasConflict: false };
    const coachObj = (data.coaches || []).find((c) => c.id === scheduleForm.coachId);
    const coach2Obj = (data.coaches || []).find((c) => c.id === scheduleForm.coach2Id);
    const additionalCoaches = coach2Obj
      ? [{ coachId: coach2Obj.id, coachName: coach2Obj.name }]
      : [];
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
  }, [isScheduleModalOpen, scheduleForm, data.coaches, checkScheduleConflictLive, editingSchedule]);

  const openCreateModal = (presetDate = focusDate) => {
    setIsRescheduleMode(false);
    const weekday = WEEKDAYS[new Date(`${presetDate}T00:00:00`).getDay()];
    const defaultLoc = allFilterLocations[0] || 'KK NAGAR';
    const defaultProg = availableProgramsList[0] || 'Spartan Gymnastics & Agility';
    const defaultBatch = 'Batch Alpha (Evening)';
    const locCoaches = (data.coaches || []).filter(
      (c) => (c.center || '').toLowerCase().trim() === defaultLoc.toLowerCase().trim()
    );
    const defaultCoach = locCoaches[0]?.id || (data.coaches || [])[0]?.id || '';

    setEditingSchedule(null);
    setScheduleForm({
      className: `${defaultProg} (${defaultBatch})`,
      location: defaultLoc,
      program: defaultProg,
      batch: defaultBatch,
      batchId: '',
      startTime: '17:00',
      endTime: '18:00',
      timingDisplay: '5:00 PM – 6:00 PM',
      venue: 'Training Court A',
      weekdays: [weekday || 'Sunday'],
      date: presetDate,
      weekday: weekday || 'Sunday',
      recurringWeeks: '1',
      coachId: defaultCoach,
      coach2Id: '',
      capacity: '15',
      notes: '',
      attachment: null,
    });
    setIsScheduleModalOpen(true);
  };

  const openEditModal = (sch) => {
    setIsRescheduleMode(false);
    const derivedWeekday =
      sch.weekday || (sch.date ? WEEKDAYS[new Date(`${sch.date}T00:00:00`).getDay()] : 'Monday');

    setEditingSchedule(sch);
    setScheduleForm({
      className: sch.className || sch.batch || '',
      location: sch.location || allFilterLocations[0] || 'KK NAGAR',
      program: sch.program || availableProgramsList[0] || 'Spartan Gymnastics & Agility',
      batch: sch.batch || 'Batch Alpha (Evening)',
      batchId: sch.batchId || '',
      startTime: sch.startTime || '17:00',
      endTime: sch.endTime || '18:00',
      timingDisplay: sch.timingDisplay || `${sch.startTime} - ${sch.endTime}`,
      venue: sch.venue || 'Training Court A',
      weekdays: sch.weekdays && sch.weekdays.length > 0 ? sch.weekdays : [derivedWeekday],
      date: sch.date || todayYmd,
      weekday: derivedWeekday,
      recurringWeeks: '1',
      coachId: sch.coachId || '',
      coach2Id: sch.additionalCoaches?.[0]?.coachId || '',
      capacity: String(sch.capacity || 15),
      notes: sch.notes || '',
      attachment: sch.attachment || null,
    });
    setIsScheduleModalOpen(true);
  };

  const openRescheduleModal = (sch) => {
    setIsRescheduleMode(true);
    const derivedWeekday =
      sch.weekday || (sch.date ? WEEKDAYS[new Date(`${sch.date}T00:00:00`).getDay()] : 'Monday');

    setEditingSchedule(sch);
    setScheduleForm({
      className: sch.className || sch.batch || '',
      location: sch.location || allFilterLocations[0] || 'KK NAGAR',
      program: sch.program || availableProgramsList[0] || 'Spartan Gymnastics & Agility',
      batch: sch.batch || 'Batch Alpha (Evening)',
      batchId: sch.batchId || '',
      startTime: sch.startTime || '17:00',
      endTime: sch.endTime || '18:00',
      timingDisplay: sch.timingDisplay || `${sch.startTime} - ${sch.endTime}`,
      venue: sch.venue || 'Training Court A',
      weekdays: sch.weekdays && sch.weekdays.length > 0 ? sch.weekdays : [derivedWeekday],
      date: sch.date || todayYmd,
      weekday: derivedWeekday,
      recurringWeeks: '1',
      coachId: sch.coachId || '',
      coach2Id: sch.additionalCoaches?.[0]?.coachId || '',
      capacity: String(sch.capacity || 15),
      notes: sch.notes || '',
      attachment: sch.attachment || null,
    });
    setIsScheduleModalOpen(true);
  };

  // Location Change Handler
  const handleLocationChange = (nextLoc) => {
    const locLower = (nextLoc || '').toLowerCase().trim();
    const locCoaches = (data.coaches || []).filter(
      (c) => (c.center || '').toLowerCase().trim() === locLower
    );
    const locObj = (data.locations || []).find(
      (l) => (l.name || '').toLowerCase().trim() === locLower
    );
    const defaultCourt = locObj?.courts?.[0] || 'Training Court A';

    setScheduleForm((prev) => ({
      ...prev,
      location: nextLoc,
      coachId: locCoaches[0]?.id || prev.coachId,
      venue: defaultCourt,
    }));
  };

  // Batch Selection Handler
  const handleBatchChange = (batchName) => {
    setScheduleForm((prev) => ({
      ...prev,
      batch: batchName,
      className: prev.className || `${prev.program} (${batchName})`,
    }));
  };

  // Weekday Click Handler
  const handleWeekdayClick = (dayName) => {
    setScheduleForm((prev) => {
      const exists = prev.weekdays.includes(dayName);
      let updated;
      if (exists) {
        updated = prev.weekdays.filter((d) => d !== dayName);
        if (updated.length === 0) updated = [dayName];
      } else {
        updated = [...prev.weekdays, dayName];
      }
      return {
        ...prev,
        weekdays: updated,
        weekday: updated[0] || dayName,
      };
    });
  };

  // Date Change Handler
  const handleDateChange = (nextDate) => {
    if (!nextDate) return;
    const dayOfWeek = WEEKDAYS[new Date(`${nextDate}T00:00:00`).getDay()];
    setScheduleForm((prev) => ({
      ...prev,
      date: nextDate,
      weekday: dayOfWeek,
      weekdays: prev.weekdays.includes(dayOfWeek) ? prev.weekdays : [dayOfWeek, ...prev.weekdays],
    }));
  };

  // File Upload Handler (PDF, DOC, DOCX, Images)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setScheduleForm((prev) => ({
        ...prev,
        attachment: {
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: uploadEvent.target?.result,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  // Submit Handler
  const handleSaveSchedule = (e) => {
    e.preventDefault();

    if (!scheduleForm.location) {
      alert('Please select an Academy Location.');
      return;
    }
    if (!scheduleForm.batch) {
      alert('Please select a Batch.');
      return;
    }

    const selectedCoach = (data.coaches || []).find((c) => c.id === scheduleForm.coachId);
    const selectedCoach2 = (data.coaches || []).find((c) => c.id === scheduleForm.coach2Id);

    const additionalCoaches = selectedCoach2
      ? [{ coachId: selectedCoach2.id, coachName: selectedCoach2.name }]
      : [];

    const classTitle =
      scheduleForm.className.trim() || `${scheduleForm.program} (${scheduleForm.batch})`;

    const payload = {
      className: classTitle,
      location: scheduleForm.location,
      program: scheduleForm.program,
      programType: scheduleForm.program,
      batchId: scheduleForm.batchId || '',
      batch: scheduleForm.batch,
      coachId: selectedCoach?.id || scheduleForm.coachId || '',
      coachName: selectedCoach?.name || 'Unassigned',
      additionalCoaches,
      date: scheduleForm.date,
      weekday: scheduleForm.weekday || scheduleForm.weekdays[0] || 'Monday',
      weekdays: scheduleForm.weekdays,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      timingDisplay: `${scheduleForm.startTime} - ${scheduleForm.endTime}`,
      venue: scheduleForm.venue || 'Training Court A',
      capacity: parseInt(scheduleForm.capacity, 10) || 15,
      notes: scheduleForm.notes,
      attachment: scheduleForm.attachment || null,
      status: isRescheduleMode ? 'Rescheduled' : editingSchedule?.status || 'Scheduled',
    };

    if (editingSchedule) {
      const res = updateClassSchedule(editingSchedule.id, payload);
      if (res.success) {
        setIsScheduleModalOpen(false);
        if (isRescheduleMode && addToast) {
          addToast(`Session rescheduled to ${scheduleForm.date} (${payload.timingDisplay}) successfully!`, 'success');
        }
      }
    } else if (scheduleForm.weekdays.length > 1 && parseInt(scheduleForm.recurringWeeks, 10) > 1) {
      const res = createRecurringClassSchedules({
        ...payload,
        recurringDays: scheduleForm.weekdays,
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
          <div className="flex items-center gap-1 bg-[#FFF4E8] p-1 rounded-xl border border-[#172B5014] overflow-x-auto">
            {[
              { id: 'all_schedules', label: 'All Schedules', icon: Layers },
              { id: 'daily', label: 'Daily View', icon: List },
              { id: 'weekly', label: 'Weekly View', icon: Columns },
              { id: 'calendar', label: 'Calendar View', icon: CalendarDays },
              { id: 'history', label: 'Replacement History', icon: ArrowLeftRight },
            ].map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setViewMode(mode.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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
            {allFilterLocations.map((locName) => (
              <option key={locName} value={locName}>
                {locName}
              </option>
            ))}
          </select>

          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-[#172B501A] bg-[#FFF4E8] text-[#172B50]"
          >
            <option value="All">All Programs</option>
            <option value="After School Program">After School Program</option>
            <option value="School Program">School Program</option>
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

      {/* View 0: ALL SCHEDULES TIMETABLE TABLE (Matching Super Coach Portal Pattern) */}
      {viewMode === 'all_schedules' && (
        <div className="bg-white rounded-2xl border border-[#172B5014] shadow-card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#172B5012] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFF4E8]/50">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-5 rounded-full bg-[#F4510B]" />
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#172B50]">
                  Master Class Timetable across All Centers
                </h3>
                <p className="text-[11px] text-[#172B50]/65">
                  Synchronized across Admin, Super Coach &amp; Coach Portals ({filteredSchedules.length} Sessions)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openCreateModal(focusDate)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F4510B] hover:bg-[#d84306] text-white text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Schedule</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B50]">
              <thead className="bg-[#FFF4E8] border-b border-[#172B5015] text-[10.5px] font-extrabold uppercase tracking-wider text-[#172B50]">
                <tr>
                  <th className="py-3 px-4">Class / Batch</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Assigned Coach</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-3">Venue</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B5010]">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs opacity-60">
                      No matching class schedules found. Click "Schedule Class Session" to publish a new timetable.
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-[#FFF4E8]/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold">
                        <span className="text-sm font-black text-[#172B50] block">
                          {schedule.className || schedule.batch}
                        </span>
                        <span className="text-[11px] opacity-60">{schedule.program}</span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-[#F4510B]">
                        {schedule.location}
                      </td>
                      <td className="py-3.5 px-3 font-bold">
                        {schedule.coachName || 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-3 text-xs">
                        {schedule.date}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-xs">
                        {schedule.startTime} - {schedule.endTime}
                      </td>
                      <td className="py-3.5 px-3 text-xs opacity-75">
                        {schedule.venue || 'Training Court A'}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${renderStatusBadge(
                            schedule.status
                          )}`}
                        >
                          {schedule.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setViewingClassSchedule(schedule)}
                            className="px-2 py-1 rounded-lg text-xs font-bold bg-[#FFF4E8] text-[#172B50] hover:text-[#F4510B] border border-[#172B5015] hover:border-[#F4510B30] transition-colors cursor-pointer flex items-center gap-1"
                            title="View Class Details"
                          >
                            <Eye className="w-3 h-3 text-[#172B50]" />
                            <span>View</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(schedule)}
                            className="px-2 py-1 rounded-lg text-xs font-bold bg-[#172B50] hover:bg-[#F4510B] text-white transition-colors cursor-pointer flex items-center gap-1"
                            title="Edit Class Schedule"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {schedule.status !== 'Cancelled' && (
                            <button
                              type="button"
                              onClick={() => openRescheduleModal(schedule)}
                              className="px-2 py-1 rounded-lg text-xs font-bold bg-[#FFF4E8] text-[#F4510B] hover:bg-[#F4510B] hover:text-white border border-[#F4510B30] transition-colors cursor-pointer flex items-center gap-1"
                              title="Reschedule Class Session"
                            >
                              <RotateCw className="w-3 h-3" />
                              <span>Reschedule</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setReplacementDrawerSchedule(schedule);
                              setReplacementCoachId('');
                              setReplacementReason('');
                              setReplacementError('');
                            }}
                            className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer flex items-center gap-1"
                            title="Assign Replacement Coach"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Reassign</span>
                          </button>

                          {schedule.status !== 'Cancelled' && schedule.status !== 'Completed' && (
                            <button
                              type="button"
                              onClick={() => {
                                setCancellingSchedule(schedule);
                                setCancelReason('');
                              }}
                              className="px-2 py-1 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                              title="Cancel Class"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 1: DAILY VIEW */}
      {viewMode === 'daily' && (
        <div className="bg-white rounded-2xl border border-[#172B5014] p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#172B50]">
              Daily Timetable — {WEEKDAYS[new Date(`${focusDate}T00:00:00`).getDay()]} ({formatSessionDate(focusDate)})
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
              {dailySchedules.map((sch) => {
                const isReplacementActive = sch.replacement && sch.replacement.status === 'Active';
                const isMenuOpen = activeDropdownScheduleId === sch.id;

                return (
                  <div
                    key={sch.id}
                    className={`relative p-4 rounded-2xl border transition-all ${
                      isReplacementActive
                        ? 'bg-[#FFF7ED] border-[#F97316]/50 shadow-card'
                        : 'bg-[#FFF4E8]/40 border-[#172B5015]'
                    } space-y-3`}
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
                          {isReplacementActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]/60 shadow-2xs">
                              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                              Replacement Assigned
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-extrabold text-[#172B50] mt-1.5">{sch.batch}</h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${renderStatusBadge(
                            sch.status
                          )}`}
                        >
                          {sch.status}
                        </span>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownScheduleId(isMenuOpen ? null : sch.id);
                            }}
                            title="Class session actions"
                            className={`p-1.5 rounded-xl border border-[#172B5015] transition-colors cursor-pointer ${
                              isMenuOpen
                                ? 'bg-[#172B50] text-white'
                                : 'bg-white text-[#172B50] hover:border-[#F4510B]'
                            }`}
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {isMenuOpen && (
                            <div
                              ref={dropdownRef}
                              className="absolute right-0 top-9 z-50 w-52 bg-white rounded-2xl shadow-xl border border-[#172B501A] py-1.5 animate-in fade-in zoom-in-95 duration-150"
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdownScheduleId(null);
                                  setViewingClassSchedule(sch);
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] transition-colors text-left cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 shrink-0 text-[#172B50]/70" />
                                <span>View Class</span>
                              </button>

                              {sch.status !== 'Cancelled' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownScheduleId(null);
                                    setReplacementDrawerSchedule(sch);
                                    setReplacementCoachId('');
                                    setReplacementReason('');
                                    setReplacementError('');
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] transition-colors text-left cursor-pointer"
                                >
                                  <ArrowLeftRight className="w-3.5 h-3.5 shrink-0 text-[#F4510B]" />
                                  <span>Assign Replacement Coach</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdownScheduleId(null);
                                  openEditModal(sch);
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] transition-colors text-left cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 shrink-0 text-[#172B50]/70" />
                                <span>Edit Schedule</span>
                              </button>

                              {sch.status !== 'Cancelled' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownScheduleId(null);
                                    openRescheduleModal(sch);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] transition-colors text-left cursor-pointer"
                                >
                                  <RotateCw className="w-3.5 h-3.5 shrink-0 text-[#F4510B]" />
                                  <span>Reschedule Session</span>
                                </button>
                              )}

                              {sch.status !== 'Cancelled' && sch.status !== 'Completed' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownScheduleId(null);
                                    setCancellingSchedule(sch);
                                    setCancelReason('');
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer border-t border-[#172B500C] mt-1 pt-2"
                                >
                                  <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                                  <span>Cancel Class</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#172B50]">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#F4510B]" />
                        {sch.timingDisplay || `${sch.startTime} - ${sch.endTime}`}
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                        {sch.location}
                      </span>

                      {isReplacementActive ? (
                        <div className="col-span-2 space-y-1 p-2.5 rounded-xl bg-white border border-[#F97316]/30">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold line-through">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Original Coach: {sch.coachName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-extrabold">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Emergency Cover: {sch.replacement.replacementCoachName}</span>
                          </div>
                          {sch.additionalCoaches?.length > 0 && (
                            <div className="text-[11px] text-[#172B50]/70 font-semibold">
                              Coach 2: {sch.additionalCoaches.map((c) => c.coachName).join(', ')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="flex items-center gap-1.5 font-semibold col-span-2">
                          <UserCheck className="w-3.5 h-3.5 text-[#172B50]" />
                          Coach 1: {sch.coachName}
                          {sch.additionalCoaches?.length > 0 &&
                            ` • Coach 2: ${sch.additionalCoaches.map((c) => c.coachName).join(', ')}`}
                        </span>
                      )}

                      {sch.attachment && (
                        <div className="col-span-2 pt-0.5">
                          <a
                            href={sch.attachment.dataUrl}
                            download={sch.attachment.name}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-[#FFF5ED] border border-[#F4510B30] text-[#F4510B] hover:bg-[#F4510B] hover:text-white transition-colors"
                            title={`Download ${sch.attachment.name}`}
                          >
                            <Paperclip className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{sch.attachment.name}</span>
                          </a>
                        </div>
                      )}
                      {sch.notes && (
                        <div className="col-span-2 text-[11px] text-[#172B50]/75 bg-[#FFF4E8]/40 p-1.5 rounded-lg italic">
                          "{sch.notes}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#172B5010]">
                      <button
                        type="button"
                        onClick={() => setViewingClassSchedule(sch)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-[#172B50] border border-[#172B501A] hover:border-[#F4510B] cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> View Class
                      </button>
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
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View 2: WEEKLY TIMETABLE VIEW */}
      {viewMode === 'weekly' && (
        <div className="overflow-x-auto pb-4 no-scrollbar">
          <div className="grid grid-cols-7 gap-3 min-w-[1180px]">
            {weekDates.map((col) => {
              const colItems = filteredSchedules.filter((s) => s.date === col.ymd);
              const isToday = col.ymd === todayYmd;
              const isColActive = col.ymd === focusDate || (isToday && focusDate === todayYmd);

              return (
                <div
                  key={col.ymd}
                  className={`bg-white rounded-2xl border p-3 shadow-card flex flex-col min-h-[520px] max-h-[760px] transition-all ${
                    isColActive
                      ? 'border-2 border-[#F4510B] ring-2 ring-[#F4510B]/15'
                      : 'border-[#172B5014] hover:border-[#172B5025]'
                  }`}
                >
                  {/* Sticky Column Header */}
                  <div className="sticky top-0 bg-white z-10 flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#172B5010]">
                    <div>
                      <p className={`text-xs font-black tracking-tight ${isColActive ? 'text-[#F4510B]' : 'text-[#172B50]'}`}>
                        {col.dayName}
                      </p>
                      <p className="text-[10.5px] font-semibold text-[#172B50]/60 mt-0.5">{col.label}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openCreateModal(col.ymd)}
                      title={`Add class session on ${col.ymd}`}
                      className="p-1.5 rounded-xl bg-[#FFF4E8] text-[#F4510B] hover:bg-[#F4510B] hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Sessions or Empty State */}
                  {colItems.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-xs font-medium text-[#172B50]/40 text-center px-2 py-12 select-none">
                      No sessions
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
                      {colItems.map((sch) => {
                        const isReplacementActive = sch.replacement && sch.replacement.status === 'Active';
                        const isMenuOpen = activeDropdownScheduleId === sch.id;

                        return (
                          <div
                            key={sch.id}
                            className={`relative p-3 rounded-xl border text-[11px] transition-all ${
                              isReplacementActive
                                ? 'bg-[#FFF7ED] border-[#F97316]/50 shadow-2xs'
                                : 'bg-[#FFF9F5] border-[#F4510B22] hover:border-[#F4510B45] shadow-2xs'
                            } space-y-2`}
                          >
                            {/* Row 1: Time, Status Badge & Actions Dropdown Menu */}
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 text-xs font-black text-[#F4510B] tracking-tight whitespace-nowrap">
                                <Clock className="w-3.5 h-3.5 shrink-0 text-[#F4510B]" />
                                <span>{sch.timingDisplay || `${sch.startTime} – ${sch.endTime}`}</span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <span
                                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-black border ${renderStatusBadge(
                                    sch.status
                                  )}`}
                                >
                                  {sch.status}
                                </span>

                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDropdownScheduleId(isMenuOpen ? null : sch.id);
                                    }}
                                    title="Session actions"
                                    className={`p-1 rounded-lg border transition-all cursor-pointer ${
                                      isMenuOpen
                                        ? 'bg-[#172B50] text-white border-[#172B50]'
                                        : 'bg-white text-[#172B50] border-[#172B5018] hover:border-[#F4510B] hover:text-[#F4510B]'
                                    }`}
                                  >
                                    <MoreVertical className="w-3 h-3" />
                                  </button>

                                  {/* Dropdown Menu Popover */}
                                  {isMenuOpen && (
                                    <div
                                      ref={dropdownRef}
                                      className="absolute right-0 top-7 z-50 w-52 bg-white rounded-2xl shadow-xl border border-[#172B501A] py-1.5 animate-in fade-in zoom-in-95 duration-150"
                                    >
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveDropdownScheduleId(null);
                                          setViewingClassSchedule(sch);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] transition-colors text-left cursor-pointer"
                                      >
                                        <Eye className="w-3.5 h-3.5 shrink-0 text-[#172B50]/70" />
                                        <span>View Session Details</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveDropdownScheduleId(null);
                                          openEditModal(sch);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] transition-colors text-left cursor-pointer"
                                      >
                                        <Edit3 className="w-3.5 h-3.5 shrink-0 text-[#172B50]/70" />
                                        <span>Edit Session</span>
                                      </button>

                                      {sch.status !== 'Cancelled' && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdownScheduleId(null);
                                            openRescheduleModal(sch);
                                          }}
                                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] transition-colors text-left cursor-pointer"
                                        >
                                          <RotateCw className="w-3.5 h-3.5 shrink-0 text-[#F4510B]" />
                                          <span>Reschedule Session</span>
                                        </button>
                                      )}

                                      {sch.status !== 'Cancelled' && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdownScheduleId(null);
                                            setReplacementDrawerSchedule(sch);
                                            setReplacementCoachId('');
                                            setReplacementReason('');
                                            setReplacementError('');
                                          }}
                                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] transition-colors text-left cursor-pointer"
                                        >
                                          <UserCheck className="w-3.5 h-3.5 shrink-0 text-[#2563EB]" />
                                          <span>Assign Replacement Coach</span>
                                        </button>
                                      )}

                                      {sch.status !== 'Cancelled' && sch.status !== 'Completed' && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdownScheduleId(null);
                                            setCancellingSchedule(sch);
                                            setCancelReason('');
                                          }}
                                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer border-t border-[#172B500C] mt-1 pt-2"
                                        >
                                          <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                                          <span>Cancel Session</span>
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Row 2: Location & Session Type Badge */}
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 text-xs font-black text-[#172B50] uppercase tracking-wide truncate">
                                  <MapPin className="w-3 h-3 text-[#F4510B] shrink-0" />
                                  <span className="truncate">{sch.location}</span>
                                </div>
                                <span className="px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-[#172B500A] text-[#172B50]/75 border border-[#172B5012] uppercase tracking-wider shrink-0">
                                  {sch.sessionType || (sch.isCompensationReplacement ? 'Compensation' : 'Regular')}
                                </span>
                              </div>
                              <div className="text-[11px] font-bold text-[#F4510B] truncate mt-0.5">
                                {sch.program}
                              </div>
                              <div className="text-[10.5px] font-semibold text-[#172B50]/80 truncate">
                                {sch.batch || sch.className}
                              </div>
                            </div>

                            {/* Replacement Active Alert Badge */}
                            {isReplacementActive && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]/60 shadow-2xs">
                                <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                <span>Replacement Assigned</span>
                              </div>
                            )}

                            {/* Coaches: Coach 1 & Coach 2 */}
                            <div className="space-y-0.5 pt-1 border-t border-[#172B500C] text-[10.5px]">
                              {isReplacementActive ? (
                                <>
                                  <div className="flex items-center gap-1 text-slate-500 font-semibold line-through text-[10px]">
                                    <User className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                                    <span className="truncate">Coach 1: {sch.coachName} (Original)</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-emerald-800 font-extrabold text-[10px]">
                                    <UserCheck className="w-2.5 h-2.5 shrink-0 text-emerald-600" />
                                    <span className="truncate">Cover: {sch.replacement.replacementCoachName}</span>
                                  </div>
                                  {sch.additionalCoaches?.length > 0 && (
                                    <div className="flex items-center gap-1 text-[#172B50]/75 font-semibold text-[10px]">
                                      <User className="w-2.5 h-2.5 shrink-0 text-[#172B50]/50" />
                                      <span className="truncate">
                                        Coach 2: {sch.additionalCoaches.map((c) => c.coachName).join(', ')}
                                      </span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1 text-[#172B50] font-bold text-[10.5px]">
                                    <User className="w-2.5 h-2.5 shrink-0 text-[#172B50]/70" />
                                    <span className="truncate">Coach 1: {sch.coachName || 'Unassigned'}</span>
                                  </div>
                                  {sch.additionalCoaches?.length > 0 && (
                                    <div className="flex items-center gap-1 text-[#172B50]/80 font-semibold text-[10px]">
                                      <User className="w-2.5 h-2.5 shrink-0 text-[#172B50]/50" />
                                      <span className="truncate">
                                        Coach 2: {sch.additionalCoaches.map((c) => c.coachName).join(', ')}
                                      </span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Venue & Capacity */}
                            {(sch.venue || sch.capacity) && (
                              <div className="flex items-center justify-between text-[9.5px] text-[#172B50]/70 font-semibold pt-1 border-t border-[#172B5008]">
                                <span className="truncate max-w-[65%]">{sch.venue || 'Training Court A'}</span>
                                {sch.capacity && (
                                  <span className="shrink-0 bg-white px-1.5 py-0.5 rounded border border-[#172B5010]">
                                    {sch.enrolledCount !== undefined ? `${sch.enrolledCount}/${sch.capacity}` : `Cap: ${sch.capacity}`}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Notes */}
                            {sch.notes && (
                              <div className="text-[9.5px] text-[#172B50]/70 italic bg-white/70 p-1.5 rounded-lg border border-[#172B500C] line-clamp-2">
                                "{sch.notes}"
                              </div>
                            )}

                            {/* Attachment Link */}
                            {sch.attachment && (
                              <div className="pt-0.5">
                                <a
                                  href={sch.attachment.dataUrl}
                                  download={sch.attachment.name}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[9.5px] font-bold text-[#F4510B] hover:underline"
                                  title={`Download ${sch.attachment.name}`}
                                >
                                  <Paperclip className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate max-w-[120px]">{sch.attachment.name}</span>
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 4: REPLACEMENT HISTORY AUDIT VIEW */}
      {viewMode === 'history' && (
        <div className="bg-white rounded-2xl border border-[#172B5014] p-5 shadow-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-[#172B50] flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-[#F4510B]" />
                Emergency Coach Replacement Audit Trail
              </h3>
              <p className="text-[11px] text-[#172B50]/65 font-medium mt-0.5">
                Complete historical record of emergency coach substitutions, assignments, and attendance status.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30]">
              {(data.coachReplacements || []).length} Replacements Logged
            </span>
          </div>

          {(data.coachReplacements || []).length === 0 ? (
            <div className="p-12 rounded-2xl border border-dashed border-[#172B5020] text-center space-y-2">
              <ArrowLeftRight className="w-8 h-8 text-[#172B50]/30 mx-auto" />
              <p className="text-xs font-bold text-[#172B50] opacity-70">
                No emergency coach replacements have been recorded yet.
              </p>
              <p className="text-[11px] text-[#172B50]/50">
                Use the three-dot (⋮) menu on any scheduled class in Weekly or Daily view to assign a replacement coach.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#172B50]">
                <thead>
                  <tr className="border-b border-[#172B5014] text-[11px] font-black uppercase text-[#172B50]/60 bg-slate-50/70">
                    <th className="p-3">Session Date & Time</th>
                    <th className="p-3">Location & Batch</th>
                    <th className="p-3">Original Coach</th>
                    <th className="p-3">Replacement Coach</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Assigned By</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Attendance</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B500C]">
                  {(data.coachReplacements || []).map((rep) => {
                    const matchedSchedule = (data.classSchedules || []).find((s) => s.id === rep.scheduleId);
                    return (
                      <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-semibold whitespace-nowrap">
                          <div className="font-bold text-[#172B50]">{formatSessionDate(rep.date)}</div>
                          <div className="text-[10px] text-[#172B50]/60">{rep.startTime} - {rep.endTime}</div>
                        </td>
                        <td className="p-3">
                          <span className="font-extrabold text-[#172B50] block">{rep.location}</span>
                          <span className="text-[10px] text-[#F4510B] font-bold">{rep.batch}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                            <span className="font-bold text-slate-600 line-through">{rep.originalCoachName}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-extrabold text-emerald-800">{rep.replacementCoachName}</span>
                          </div>
                        </td>
                        <td className="p-3 max-w-[200px]">
                          <p className="text-xs text-[#172B50]/80 italic truncate" title={rep.reason}>
                            "{rep.reason}"
                          </p>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-bold text-[#172B50] block">{rep.assignedBy}</span>
                          <span className="text-[10px] text-[#172B50]/55">
                            {rep.assignedAt ? new Date(rep.assignedAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            rep.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : rep.status === 'Completed'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {rep.status}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            rep.attendanceStatus === 'Marked'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {rep.attendanceStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          {rep.status === 'Active' && (
                            <button
                              type="button"
                              onClick={() => {
                                setRevokingSchedule(matchedSchedule || {
                                  id: rep.scheduleId,
                                  batch: rep.batch,
                                  location: rep.location,
                                  coachName: rep.originalCoachName,
                                  replacement: {
                                    replacementCoachName: rep.replacementCoachName,
                                  },
                                });
                                setRevokeReason('');
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                            >
                              Revoke Cover
                            </button>
                          )}
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

      {/* Schedule Create / Edit / Reschedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={
          isRescheduleMode
            ? `Reschedule Session: ${editingSchedule?.id || ''}`
            : editingSchedule
            ? `Edit Class Schedule: ${editingSchedule.id}`
            : 'Create Class Schedule'
        }
        subtitle={
          isRescheduleMode
            ? `Update session date, timing, or venue for ${editingSchedule?.className || editingSchedule?.batch || ''}`
            : 'Schedule a class session across authorized academy centers'
        }
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          {formConflict.hasConflict && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formConflict.message}</span>
            </div>
          )}

          {/* 1. Class Title */}
          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">
              Class Title *
            </label>
            <input
              type="text"
              required
              value={scheduleForm.className}
              onChange={(e) => setScheduleForm({ ...scheduleForm, className: e.target.value })}
              placeholder="e.g. Spartan Gymnastics & Agility - Batch Alpha"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] bg-white font-semibold"
            />
          </div>

          {/* 2. Location & Assigned Coach */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Academy Location *
              </label>
              <select
                required
                value={scheduleForm.location}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] bg-white font-semibold"
              >
                <option value="">Select Location</option>
                {allFilterLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Assigned Coach *
              </label>
              <select
                required
                value={scheduleForm.coachId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, coachId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] bg-white font-semibold"
              >
                <option value="">Select Coach</option>
                {availableCoachesForLocation.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.specialization || 'Academy Coach'}) - {c.center || 'All Centers'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Program & Batch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Sports Program *
              </label>
              <select
                required
                value={scheduleForm.program}
                onChange={(e) => {
                  const p = e.target.value;
                  setScheduleForm({
                    ...scheduleForm,
                    program: p,
                    className: scheduleForm.className ? scheduleForm.className : `${p} (${scheduleForm.batch || 'Batch Alpha'})`
                  });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] bg-white font-semibold"
              >
                {availableProgramsList.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Batch / Cohort *
              </label>
              <select
                value={scheduleForm.batch}
                onChange={(e) => handleBatchChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] bg-white font-semibold"
              >
                {currentBatchesForLocation.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Date, Start Time & End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Class Date *
              </label>
              <input
                type="date"
                required
                value={scheduleForm.date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] bg-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={scheduleForm.startTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] bg-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={scheduleForm.endTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] bg-white font-semibold"
              />
            </div>
          </div>

          {/* 5. Court / Venue & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Court / Arena Venue
              </label>
              <select
                value={scheduleForm.venue}
                onChange={(e) => setScheduleForm({ ...scheduleForm, venue: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] bg-white font-semibold"
              >
                {availableVenuesForLocation.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Athlete Capacity
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={scheduleForm.capacity}
                onChange={(e) => setScheduleForm({ ...scheduleForm, capacity: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] bg-white font-semibold"
              />
            </div>
          </div>

          {/* 6. Weekdays repeat (Optional) */}
          <div className="p-3 rounded-xl bg-[#FFF4E8]/60 border border-[#F4510B20] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-xs font-bold text-[#172B50]">
                Recurring Days (Optional)
              </span>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="font-bold text-[#172B50]">Repeat:</span>
                <select
                  value={scheduleForm.recurringWeeks}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, recurringWeeks: e.target.value })}
                  className="px-2 py-0.5 rounded-lg bg-white border border-[#172B5020] text-xs font-bold text-[#172B50]"
                >
                  <option value="1">1 Week (Single Session)</option>
                  <option value="2">2 Weeks</option>
                  <option value="4">4 Weeks</option>
                  <option value="8">8 Weeks</option>
                  <option value="12">12 Weeks</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MON_FIRST_DAYS.map((dayName) => {
                const isSelected = scheduleForm.weekdays.includes(dayName);
                return (
                  <button
                    key={dayName}
                    type="button"
                    onClick={() => handleWeekdayClick(dayName)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F4510B] text-white border border-[#F4510B] shadow-2xs'
                        : 'bg-white text-[#172B50] border border-[#172B5020] hover:bg-[#FFF4E8]'
                    }`}
                  >
                    {dayName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. Special Notes */}
          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">
              Session Notes &amp; Guidelines
            </label>
            <input
              type="text"
              value={scheduleForm.notes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
              placeholder="e.g. Focus on warm-up drills, agility cones..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] bg-white font-medium"
            />
          </div>

          {/* Submit Actions */}
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
              disabled={formConflict.hasConflict || !scheduleForm.location || !scheduleForm.batch}
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#F4510B] text-white hover:bg-[#d84306] disabled:opacity-50 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              {isRescheduleMode ? 'Confirm Reschedule' : editingSchedule ? 'Save Changes' : 'Publish Schedule'}
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

      {/* Slide-over Drawer: Assign Replacement Coach */}
      {replacementDrawerSchedule && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setReplacementDrawerSchedule(null)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-[#172B5014] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#172B50]">
                    Assign Replacement Coach
                  </h3>
                  <p className="text-[11px] text-[#172B50]/65 font-medium">
                    Emergency replacement for a scheduled class
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplacementDrawerSchedule(null)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-[#172B50] hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <form onSubmit={handleConfirmReplacement} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                {/* Class Details Card */}
                <div className="p-3.5 rounded-2xl bg-[#FFF5ED] border border-[#F4510B30] space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#F4510B]">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>Class Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <span className="text-[10px] text-[#172B50]/60 font-semibold block">Date</span>
                      <span className="font-extrabold text-[#172B50]">
                        {formatSessionDate(replacementDrawerSchedule.date)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#172B50]/60 font-semibold block">Location</span>
                      <span className="font-extrabold text-[#172B50]">
                        {replacementDrawerSchedule.location}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#172B50]/60 font-semibold block">Batch</span>
                      <span className="font-extrabold text-[#172B50]">
                        {replacementDrawerSchedule.batch}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#172B50]/60 font-semibold block">Timing</span>
                      <span className="font-extrabold text-[#172B50]">
                        {replacementDrawerSchedule.timingDisplay || `${replacementDrawerSchedule.startTime} - ${replacementDrawerSchedule.endTime}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Original Coach Section */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#172B50]">Original Coach</label>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-[#172B5014]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#172B50] text-white flex items-center justify-center font-black text-xs shrink-0">
                        {replacementDrawerSchedule.coachName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-[#172B50] block">
                          {replacementDrawerSchedule.coachName}
                        </span>
                        <span className="text-[10px] text-[#172B50]/60">Primary Assigned Coach</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200">
                      Unavailable
                    </span>
                  </div>

                  {/* Coach 2 if assigned */}
                  {replacementDrawerSchedule.additionalCoaches?.length > 0 && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-[#172B5010] text-xs">
                      <span className="text-[11px] text-[#172B50]/70 font-semibold">
                        Coach 2: {replacementDrawerSchedule.additionalCoaches.map((c) => c.coachName).join(', ')}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">Unchanged</span>
                    </div>
                  )}
                </div>

                {/* Replacement Coach Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#172B50]">
                    Replacement Coach *
                  </label>
                  <select
                    required
                    value={replacementCoachId}
                    onChange={(e) => {
                      setReplacementCoachId(e.target.value);
                      setReplacementError('');
                    }}
                    className="w-full px-3 py-2.5 text-xs font-bold rounded-xl border border-[#172B5022] text-[#172B50] bg-white focus:outline-none focus:border-[#F4510B]"
                  >
                    <option value="">Select an eligible coach...</option>
                    {replacementCoachOptions.map((opt) => (
                      <option
                        key={opt.coach.id}
                        value={opt.coach.id}
                        disabled={!opt.available}
                      >
                        {opt.coach.name} {!opt.available ? `(${opt.reason})` : '— Available'}
                      </option>
                    ))}
                  </select>

                  {/* Selected Coach Preview Card with Available Badge (matching reference design) */}
                  {selectedReplacementCoachOption && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                          {selectedReplacementCoachOption.coach.name?.charAt(0) || 'R'}
                        </div>
                        <div>
                          <span className="text-xs font-extrabold text-[#172B50] block">
                            {selectedReplacementCoachOption.coach.name}
                          </span>
                          <span className="text-[10px] text-emerald-800 font-semibold">
                            {selectedReplacementCoachOption.coach.specialization || 'Academy Coach'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Available
                      </span>
                    </div>
                  )}
                </div>

                {/* Reason for Replacement */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#172B50]">
                    Reason for Replacement *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={replacementReason}
                    onChange={(e) => {
                      setReplacementReason(e.target.value);
                      setReplacementError('');
                    }}
                    placeholder="e.g. Coach A - emergency leave"
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#172B5022] text-[#172B50] focus:outline-none focus:border-[#F4510B]"
                  />
                </div>

                {/* Error Message */}
                {replacementError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{replacementError}</span>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-[#172B5014] flex items-center justify-end gap-2.5 bg-slate-50/80">
                <button
                  type="button"
                  onClick={() => setReplacementDrawerSchedule(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] bg-white border border-[#172B5020] hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#F4510B] text-white hover:bg-[#d84306] shadow-sm cursor-pointer active:scale-95 transition-all"
                >
                  Confirm Replacement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Class Details Modal */}
      <Modal
        isOpen={Boolean(viewingClassSchedule)}
        onClose={() => setViewingClassSchedule(null)}
        title={viewingClassSchedule ? `Class Details: ${viewingClassSchedule.batch}` : 'Class Details'}
        subtitle={
          viewingClassSchedule
            ? `${viewingClassSchedule.location} • ${formatSessionDate(viewingClassSchedule.date)} • ${viewingClassSchedule.timingDisplay || `${viewingClassSchedule.startTime} - ${viewingClassSchedule.endTime}`}`
            : ''
        }
        maxWidth="max-w-2xl"
      >
        {viewingClassSchedule && (
          <div className="space-y-4">
            {/* Session Header Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-[#FFF4E8]/60 border border-[#172B5012] text-xs">
              <div>
                <span className="text-[10px] text-[#172B50]/60 font-semibold block">Program</span>
                <span className="font-extrabold text-[#F4510B]">{viewingClassSchedule.program}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#172B50]/60 font-semibold block">Location</span>
                <span className="font-extrabold text-[#172B50]">{viewingClassSchedule.location}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#172B50]/60 font-semibold block">Batch</span>
                <span className="font-extrabold text-[#172B50]">{viewingClassSchedule.batch}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#172B50]/60 font-semibold block">Capacity</span>
                <span className="font-extrabold text-[#172B50]">{viewingClassSchedule.capacity || 20} Students</span>
              </div>
            </div>

            {/* Coach Assignment Details */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-white border border-[#172B5014]">
              <h4 className="text-xs font-black text-[#172B50] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#F4510B]" />
                Coach Faculty Assignment
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Primary Coach</span>
                  <span
                    className={`font-extrabold ${
                      viewingClassSchedule.replacement?.status === 'Active'
                        ? 'line-through text-slate-400'
                        : 'text-[#172B50]'
                    }`}
                  >
                    {viewingClassSchedule.coachName}
                  </span>
                  {viewingClassSchedule.replacement?.status === 'Active' && (
                    <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
                      (Unavailable — Emergency Replacement Active)
                    </span>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Assistant / Coach 2</span>
                  <span className="font-extrabold text-[#172B50]">
                    {viewingClassSchedule.additionalCoaches?.length > 0
                      ? viewingClassSchedule.additionalCoaches.map((c) => c.coachName).join(', ')
                      : 'None Assigned'}
                  </span>
                </div>
              </div>

              {/* Emergency Cover Active Info */}
              {viewingClassSchedule.replacement && viewingClassSchedule.replacement.status === 'Active' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-emerald-700" />
                      Active Emergency Cover
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Temporary Coach
                    </span>
                  </div>
                  <p className="text-xs text-[#172B50]">
                    <span className="font-bold">Cover Coach:</span>{' '}
                    <span className="font-extrabold text-emerald-900">
                      {viewingClassSchedule.replacement.replacementCoachName}
                    </span>
                  </p>
                  <p className="text-xs text-[#172B50]">
                    <span className="font-bold">Reason:</span> "{viewingClassSchedule.replacement.reason}"
                  </p>
                  <p className="text-[10.5px] text-[#172B50]/65">
                    Assigned by {viewingClassSchedule.replacement.assignedBy} on{' '}
                    {viewingClassSchedule.replacement.assignedAt
                      ? new Date(viewingClassSchedule.replacement.assignedAt).toLocaleString()
                      : ''}
                  </p>
                </div>
              )}
            </div>

            {/* Attachment and Notes */}
            {(viewingClassSchedule.attachment || viewingClassSchedule.notes) && (
              <div className="p-3.5 rounded-2xl bg-white border border-[#172B5014] space-y-2 text-xs">
                <h4 className="text-xs font-black text-[#172B50]">Session Notes & Drill Materials</h4>
                {viewingClassSchedule.notes && (
                  <p className="italic text-[#172B50]/80 bg-slate-50 p-2 rounded-xl">
                    "{viewingClassSchedule.notes}"
                  </p>
                )}
                {viewingClassSchedule.attachment && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF5ED] border border-[#F4510B30]">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-[#F4510B]" />
                      <span className="font-bold text-[#172B50]">{viewingClassSchedule.attachment.name}</span>
                    </div>
                    <a
                      href={viewingClassSchedule.attachment.dataUrl}
                      download={viewingClassSchedule.attachment.name}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-[#F4510B] text-white hover:bg-[#d84306]"
                    >
                      Download
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Enrolled Students Roster */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#172B5014] space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#172B50] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#F4510B]" />
                  Enrolled Students ({enrolledStudentsForViewingSchedule.length})
                </h4>
                <span className="text-[10px] text-[#172B50]/60">
                  Attendance access scoped strictly to this roster
                </span>
              </div>

              {enrolledStudentsForViewingSchedule.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                  No enrolled students found for {viewingClassSchedule.location} • {viewingClassSchedule.batch}.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {enrolledStudentsForViewingSchedule.map((student) => (
                    <div key={student.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <span className="font-extrabold text-[#172B50] block">{student.name}</span>
                        <span className="text-[10px] text-slate-500">
                          Parent: {student.parentName || student.guardian || 'N/A'} • {student.phone || student.contact || ''}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {student.status || 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#172B5014]">
              <div>
                {viewingClassSchedule.replacement?.status === 'Active' && (
                  <button
                    type="button"
                    onClick={() => {
                      setRevokingSchedule(viewingClassSchedule);
                      setViewingClassSchedule(null);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                  >
                    Revoke Replacement
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {viewingClassSchedule.status !== 'Cancelled' &&
                  viewingClassSchedule.status !== 'Completed' &&
                  (!viewingClassSchedule.replacement || viewingClassSchedule.replacement.status !== 'Active') && (
                    <button
                      type="button"
                      onClick={() => {
                        setReplacementDrawerSchedule(viewingClassSchedule);
                        setReplacementCoachId('');
                        setReplacementReason('');
                        setReplacementError('');
                        setViewingClassSchedule(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#172B50] text-white hover:bg-[#0e1d38] cursor-pointer"
                    >
                      Assign Replacement Coach
                    </button>
                  )}

                <button
                  type="button"
                  onClick={() => setViewingClassSchedule(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Revoke Replacement Modal */}
      <Modal
        isOpen={Boolean(revokingSchedule)}
        onClose={() => setRevokingSchedule(null)}
        title="Revoke Emergency Coach Cover"
        subtitle={revokingSchedule ? `${revokingSchedule.batch} • ${revokingSchedule.location}` : ''}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
            <p className="font-extrabold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Confirm Replacement Revocation
            </p>
            <p>
              This will immediately revoke temporary class access for cover coach{' '}
              <span className="font-extrabold text-[#172B50]">
                {revokingSchedule?.replacement?.replacementCoachName}
              </span>{' '}
              and restore{' '}
              <span className="font-extrabold text-[#172B50]">
                {revokingSchedule?.coachName}
              </span>{' '}
              as the primary coach.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">
              Reason for Revocation (Optional)
            </label>
            <textarea
              rows={2}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="e.g. Original coach recovered / available to take session..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#172B5014]">
            <button
              type="button"
              onClick={() => setRevokingSchedule(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRevoke}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#F4510B] text-white hover:bg-[#d84306] cursor-pointer"
            >
              Confirm Revocation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
