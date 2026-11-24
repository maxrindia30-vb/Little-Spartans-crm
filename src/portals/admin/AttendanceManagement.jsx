import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Calendar,
  Search,
  Save,
  ChevronLeft,
  ChevronRight,
  Users,
  Check,
  X,
  Clock,
  Download,
  Layers,
  User,
  Hash,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { getCommonLocations } from '../../services/locationService';
import {
  ATTENDANCE_STATUSES,
  filterStudentsForAttendance,
  getSavedAttendanceRecord,
  resolveStudentBatch,
} from '../../services/attendanceService';

export default function AttendanceManagement({
  initialLocation,
  initialCoach,
  allowedLocations,
  allowedCoaches,
  fixedLocation = false,
  fixedCoach = false,
  portalRole = 'admin',
} = {}) {
  const { data, saveBatchAttendance, addToast } = useCrm();

  const allLocations = getCommonLocations(data);
  const commonLocations = useMemo(() => {
    if (allowedLocations && allowedLocations.length > 0) {
      return allLocations.filter(loc => allowedLocations.includes(loc.name));
    }
    return allLocations;
  }, [allLocations, allowedLocations]);

  const defaultLoc = initialLocation || (allowedLocations && allowedLocations[0]) || 'All';
  const defaultCoach = initialCoach || 'All';

  const [selectedLocation, setSelectedLocation] = useState(defaultLoc);
  const [selectedDate, setSelectedDate] = useState('2026-11-11');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [selectedBatchId, setSelectedBatchId] = useState('All');
  const [selectedCoach, setSelectedCoach] = useState(defaultCoach);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Draft edits keyed by `${studentId}::${batchId}::${date}::${location}`
  const [draftStatuses, setDraftStatuses] = useState({});

  const scopedBaseClasses = useMemo(() => {
    let list = data.classes || [];
    if (allowedLocations && allowedLocations.length > 0) {
      list = list.filter(c => allowedLocations.includes(c.center));
    }
    return list;
  }, [data.classes, allowedLocations]);

  const scopedBaseStudents = useMemo(() => {
    let list = data.students || [];
    if (allowedLocations && allowedLocations.length > 0) {
      list = list.filter(s => allowedLocations.includes(s.center));
    }
    return list;
  }, [data.students, allowedLocations]);

  const locationScopedClasses = useMemo(() => {
    return scopedBaseClasses.filter(
      c => selectedLocation === 'All' || c.center === selectedLocation
    );
  }, [scopedBaseClasses, selectedLocation]);

  const availablePrograms = useMemo(() => {
    const names = new Set();
    locationScopedClasses.forEach(c => {
      if (c.program) names.add(c.program);
    });
    scopedBaseStudents.forEach(s => {
      if ((selectedLocation === 'All' || s.center === selectedLocation) && s.program) {
        names.add(s.program);
      }
    });
    return Array.from(names);
  }, [locationScopedClasses, scopedBaseStudents, selectedLocation]);

  const availableBatches = useMemo(() => {
    return locationScopedClasses.filter(
      c => selectedProgram === 'All' || c.program === selectedProgram
    );
  }, [locationScopedClasses, selectedProgram]);

  const availableCoaches = useMemo(() => {
    const coachNames = new Set();
    locationScopedClasses.forEach(c => {
      if (c.coach) coachNames.add(c.coach);
    });
    scopedBaseStudents.forEach(s => {
      if ((selectedLocation === 'All' || s.center === selectedLocation) && s.coachName) {
        coachNames.add(s.coachName);
      }
    });
    return Array.from(coachNames);
  }, [locationScopedClasses, scopedBaseStudents, selectedLocation]);

  const handleLocationChange = (nextLocation) => {
    setSelectedLocation(nextLocation);
    setCurrentPage(1);

    const nextClasses = scopedBaseClasses.filter(
      c => nextLocation === 'All' || c.center === nextLocation
    );
    const nextStudents = scopedBaseStudents.filter(
      s => nextLocation === 'All' || s.center === nextLocation
    );

    if (
      selectedProgram !== 'All' &&
      !nextClasses.some(c => c.program === selectedProgram) &&
      !nextStudents.some(s => s.program === selectedProgram)
    ) {
      setSelectedProgram('All');
    }

    if (
      selectedBatchId !== 'All' &&
      !nextClasses.some(c => c.id === selectedBatchId)
    ) {
      setSelectedBatchId('All');
    }

    if (
      selectedCoach !== 'All' &&
      !nextClasses.some(c => c.coach === selectedCoach) &&
      !nextStudents.some(s => s.coachName === selectedCoach)
    ) {
      setSelectedCoach('All');
    }
  };

  const filteredStudents = useMemo(() => {
    return filterStudentsForAttendance(scopedBaseStudents, scopedBaseClasses, {
      location: selectedLocation,
      program: selectedProgram,
      batchId: selectedBatchId,
      coach: selectedCoach,
      search: searchTerm,
    });
  }, [scopedBaseStudents, scopedBaseClasses, selectedLocation, selectedProgram, selectedBatchId, selectedCoach, searchTerm]);

  const studentRows = useMemo(() => {
    return filteredStudents.map(student => {
      const batch = resolveStudentBatch(
        student,
        data.classes || [],
        selectedBatchId !== 'All' ? selectedBatchId : null
      );
      const batchId = batch?.id || 'UNASSIGNED';
      const draftKey = `${student.id}::${batchId}::${selectedDate}::${student.center}`;
      const savedRecord = getSavedAttendanceRecord(data.attendanceRecords || [], {
        studentId: student.id,
        batchId: batch?.id,
        date: selectedDate,
        location: student.center,
      });

      const savedStatus = savedRecord?.status || ATTENDANCE_STATUSES.NOT_MARKED;
      const currentStatus = draftStatuses[draftKey] || savedStatus;
      const isDirty = Boolean(draftStatuses[draftKey] && draftStatuses[draftKey] !== savedStatus);

      return {
        student,
        batch,
        batchId,
        draftKey,
        savedStatus,
        currentStatus,
        isDirty,
        savedRecord,
      };
    });
  }, [filteredStudents, data.classes, data.attendanceRecords, selectedBatchId, selectedDate, draftStatuses]);

  const totalStudents = studentRows.length;
  const presentCount = studentRows.filter(r => r.currentStatus === ATTENDANCE_STATUSES.PRESENT).length;
  const absentCount = studentRows.filter(r => r.currentStatus === ATTENDANCE_STATUSES.ABSENT).length;
  const notMarkedCount = studentRows.filter(r => r.currentStatus === ATTENDANCE_STATUSES.NOT_MARKED).length;
  const attendancePct = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
  const dirtyRowsCount = studentRows.filter(r => r.isDirty).length;

  const displayedRows = useMemo(() => {
    if (selectedStatus === 'All') return studentRows;
    return studentRows.filter(r => r.currentStatus === selectedStatus);
  }, [studentRows, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(displayedRows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = displayedRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleStageStatus = (row, status) => {
    setDraftStatuses(prev => ({
      ...prev,
      [row.draftKey]: status,
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedDate) {
      addToast('Please select a training date before saving attendance.', 'error');
      return;
    }

    const markableRows = studentRows.filter(
      row =>
        row.currentStatus === ATTENDANCE_STATUSES.PRESENT ||
        row.currentStatus === ATTENDANCE_STATUSES.ABSENT ||
        row.currentStatus === ATTENDANCE_STATUSES.LEAVE ||
        row.currentStatus === ATTENDANCE_STATUSES.COMPENSATION
    );

    if (markableRows.length === 0) {
      addToast('Mark at least one student Present, Absent, Leave or Compensation before saving.', 'error');
      return;
    }

    // Group writes strictly by location + batchId so branches are never mixed
    const groupedByLocationBatch = new Map();
    markableRows.forEach(row => {
      if (!row.batch) return;
      const groupKey = `${row.student.center}::${row.batch.id}`;
      if (!groupedByLocationBatch.has(groupKey)) {
        groupedByLocationBatch.set(groupKey, {
          location: row.student.center,
          batchId: row.batch.id,
          entries: [],
        });
      }
      groupedByLocationBatch.get(groupKey).entries.push({
        studentId: row.student.id,
        batchId: row.batch.id,
        status: row.currentStatus,
      });
    });

    if (groupedByLocationBatch.size === 0) {
      addToast('No valid location-batch assignments found for the selected students.', 'error');
      return;
    }

    let allSucceeded = true;
    groupedByLocationBatch.forEach(group => {
      const res = saveBatchAttendance({
        entries: group.entries,
        date: selectedDate,
        location: group.location,
        batchId: group.batchId,
        markedBy: initialCoach || 'Admin Attendance',
      });
      if (!res?.success) {
        allSucceeded = false;
      }
    });

    if (allSucceeded) {
      setDraftStatuses(prev => {
        const next = { ...prev };
        markableRows.forEach(row => {
          delete next[row.draftKey];
        });
        return next;
      });
    }
  };

  const handleExportData = () => {
    if (studentRows.length === 0) {
      addToast('No student records to export.', 'error');
      return;
    }
    const headers = ['KID ID', 'KID NAME', 'PROGRAM', 'LOCATION', 'DATE', 'STATUS'];
    const rows = studentRows.map(r => [
      `"${r.student.id}"`,
      `"${r.student.name}"`,
      `"${r.student.program || r.batch?.program || ''}"`,
      `"${r.student.center}"`,
      `"${selectedDate}"`,
      `"${r.currentStatus}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_register_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Exported ${studentRows.length} attendance record(s) to CSV.`, 'success');
  };

  const selectedBatchObj =
    selectedBatchId !== 'All'
      ? (data.classes || []).find(c => c.id === selectedBatchId)
      : null;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Daily Student Attendance Register Header & Filters Card */}
      <div className="bg-white rounded-3xl border border-[#172B5014] p-5 sm:p-6 shadow-xs space-y-5">
        {/* Top Row: Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#F4510B]" />
            <h2 className="text-xl font-black text-[#172B50] tracking-tight">
              Daily Student Attendance Register
            </h2>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-[#FFF4E8] text-[#172B50] border border-[#F4510B25] hover:bg-[#ffe7d1] shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#F4510B]" />
              <span>Export Data</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAttendance}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold bg-[#F4510B] text-white hover:bg-[#d94103] active:scale-95 shadow-[0_4px_14px_rgba(244,81,11,0.3)] transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-white" />
              <span>
                Save Attendance{dirtyRowsCount > 0 ? ` (${dirtyRowsCount})` : ''}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Row: 4 Horizontal Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Academy Location */}
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1.5">
              Academy Location
            </label>
            <div className="relative flex items-center bg-[#FFF4E8]/60 border border-[#172B5014] rounded-full px-3.5 py-2 hover:border-[#F4510B]/40 transition-all">
              <MapPin className="w-4 h-4 text-[#F4510B] shrink-0" />
              <select
                aria-label="Filter student attendance by location"
                value={selectedLocation}
                disabled={fixedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className={`w-full bg-transparent border-0 text-xs sm:text-sm font-bold text-[#172B50] pl-2 pr-6 outline-none appearance-none ${
                  fixedLocation ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
                }`}
              >
                {!fixedLocation && <option value="All">All Locations</option>}
                {commonLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#172B50]/60 shrink-0 pointer-events-none absolute right-3.5" />
            </div>
          </div>

          {/* Attendance Date */}
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1.5">
              Attendance Date
            </label>
            <div className="relative flex items-center bg-[#FFF4E8]/60 border border-[#172B5014] rounded-full px-3.5 py-2 hover:border-[#F4510B]/40 transition-all">
              <Calendar className="w-4 h-4 text-[#172B50] shrink-0" />
              <input
                type="date"
                aria-label="Attendance Date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-transparent border-0 text-xs sm:text-sm font-bold text-[#172B50] pl-2 pr-6 outline-none cursor-pointer"
              />
              <Calendar className="w-4 h-4 text-[#172B50]/60 shrink-0 pointer-events-none absolute right-3.5" />
            </div>
          </div>

          {/* Batch / Class */}
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1.5">
              Batch / Class
            </label>
            <div className="relative flex items-center bg-[#FFF4E8]/60 border border-[#172B5014] rounded-full px-3.5 py-2 hover:border-[#F4510B]/40 transition-all">
              <Layers className="w-4 h-4 text-[#F4510B] shrink-0" />
              <select
                aria-label="Filter by batch"
                value={selectedBatchId}
                onChange={(e) => {
                  setSelectedBatchId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-transparent border-0 text-xs sm:text-sm font-bold text-[#172B50] pl-2 pr-6 outline-none appearance-none cursor-pointer"
              >
                <option value="All">All Batches</option>
                {availableBatches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#172B50]/60 shrink-0 pointer-events-none absolute right-3.5" />
            </div>
          </div>

          {/* Search Athlete */}
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1.5">
              Search Athlete
            </label>
            <div className="relative flex items-center bg-white border border-[#172B5018] rounded-full px-3.5 py-2 hover:border-[#F4510B]/40 transition-all">
              <Search className="w-4 h-4 text-[#172B50]/40 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Name or ID..."
                className="w-full bg-transparent border-0 text-xs sm:text-sm font-medium text-[#172B50] placeholder:text-[#172B50]/40 pl-2 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Secondary Row: Sports Program, Coach & Status Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#172B500E]">
          {/* Sports Program */}
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1.5">
              Sports Program
            </label>
            <div className="relative flex items-center bg-[#FFF4E8]/60 border border-[#172B5014] rounded-full px-3.5 py-2 hover:border-[#F4510B]/40 transition-all">
              <Layers className="w-4 h-4 text-[#F4510B] shrink-0" />
              <select
                aria-label="Filter by program"
                value={selectedProgram}
                onChange={(e) => {
                  setSelectedProgram(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-transparent border-0 text-xs sm:text-sm font-bold text-[#172B50] pl-2 pr-6 outline-none appearance-none cursor-pointer"
              >
                <option value="All">All Sports Programs</option>
                {availablePrograms.map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#172B50]/60 shrink-0 pointer-events-none absolute right-3.5" />
            </div>
          </div>

          {/* Assigned Coach */}
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1.5">
              Assigned Coach
            </label>
            <div className="relative flex items-center bg-[#FFF4E8]/60 border border-[#172B5014] rounded-full px-3.5 py-2 hover:border-[#F4510B]/40 transition-all">
              <User className="w-4 h-4 text-[#F4510B] shrink-0" />
              <select
                aria-label="Filter by coach"
                value={selectedCoach}
                disabled={fixedCoach}
                onChange={(e) => {
                  setSelectedCoach(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full bg-transparent border-0 text-xs sm:text-sm font-bold text-[#172B50] pl-2 pr-6 outline-none appearance-none ${
                  fixedCoach ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
                }`}
              >
                {!fixedCoach && <option value="All">All Coaches</option>}
                {availableCoaches.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#172B50]/60 shrink-0 pointer-events-none absolute right-3.5" />
            </div>
          </div>

          {/* Attendance Status */}
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1.5">
              Attendance Status
            </label>
            <div className="relative flex items-center bg-[#FFF4E8]/60 border border-[#172B5014] rounded-full px-3.5 py-2 hover:border-[#F4510B]/40 transition-all">
              <Check className="w-4 h-4 text-[#F4510B] shrink-0" />
              <select
                aria-label="Filter by status"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-transparent border-0 text-xs sm:text-sm font-bold text-[#172B50] pl-2 pr-6 outline-none appearance-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value={ATTENDANCE_STATUSES.PRESENT}>Present</option>
                <option value={ATTENDANCE_STATUSES.ABSENT}>Absent</option>
                <option value={ATTENDANCE_STATUSES.NOT_MARKED}>Not Marked</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#172B50]/60 shrink-0 pointer-events-none absolute right-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. All Locations Student Register Table Card */}
      <div className="bg-white rounded-3xl border border-[#172B5014] shadow-xs overflow-hidden">
        {/* Table Subheader */}
        <div className="px-5 py-4 border-b border-[#172B5012] bg-[#FFF4E8]/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0E6] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-[#F4510B]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#172B50] tracking-tight">
                {selectedBatchObj
                  ? selectedBatchObj.name
                  : selectedLocation === 'All'
                  ? 'All Locations Student Register'
                  : `${selectedLocation} Student Register`}
              </h3>
              <p className="text-xs text-[#172B50]/65 font-medium mt-0.5">
                Date: {selectedDate}
                {selectedBatchObj
                  ? ` • ${selectedBatchObj.schedule} • ${selectedBatchObj.coach}`
                  : ' • Records strictly isolated by student academy branch'}
              </p>
            </div>
          </div>

          {/* Status Filter Pills & Turnout Badge */}
          <div className="flex items-center flex-wrap gap-2.5">
            <div className="inline-flex items-center bg-white p-1 rounded-full border border-[#172B5014] shadow-2xs gap-1">
              <button
                type="button"
                onClick={() => { setSelectedStatus('All'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === 'All'
                    ? 'bg-[#172B50] text-white shadow-2xs'
                    : 'text-[#172B50]/70 hover:text-[#172B50]'
                }`}
              >
                All ({totalStudents})
              </button>
              <button
                type="button"
                onClick={() => { setSelectedStatus(ATTENDANCE_STATUSES.PRESENT); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === ATTENDANCE_STATUSES.PRESENT
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-emerald-700/80 hover:text-emerald-800'
                }`}
              >
                Present ({presentCount})
              </button>
              <button
                type="button"
                onClick={() => { setSelectedStatus(ATTENDANCE_STATUSES.ABSENT); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === ATTENDANCE_STATUSES.ABSENT
                    ? 'bg-[#F4510B] text-white shadow-2xs'
                    : 'text-[#F4510B]/80 hover:text-[#F4510B]'
                }`}
              >
                Absent ({absentCount})
              </button>
              <button
                type="button"
                onClick={() => { setSelectedStatus(ATTENDANCE_STATUSES.NOT_MARKED); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === ATTENDANCE_STATUSES.NOT_MARKED
                    ? 'bg-slate-600 text-white shadow-2xs'
                    : 'text-slate-600/80 hover:text-slate-800'
                }`}
              >
                Not Marked ({notMarkedCount})
              </button>
            </div>

            {/* Turnout Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B25] shadow-2xs">
              <Users className="w-3.5 h-3.5 text-[#F4510B]" />
              <span>
                {attendancePct}% Turnout ({presentCount}/{totalStudents})
              </span>
            </div>
          </div>
        </div>

        {/* Responsive Table with Exactly 5 Required Columns */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF4E8] text-[#172B50] font-black uppercase tracking-wider text-[11px] border-y border-[#172B5012]">
              <tr>
                {/* 1. KID ID */}
                <th className="py-3.5 px-5">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-[#F4510B]" />
                    <span>KID ID</span>
                  </div>
                </th>

                {/* 2. KID NAME */}
                <th className="py-3.5 px-5">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#F4510B]" />
                    <span>KID NAME</span>
                  </div>
                </th>

                {/* 3. PROGRAM */}
                <th className="py-3.5 px-5">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#F4510B]" />
                    <span>PROGRAM</span>
                  </div>
                </th>

                {/* 4. LOCATION */}
                <th className="py-3.5 px-5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                    <span>LOCATION</span>
                  </div>
                </th>

                {/* 5. MARK ATTENDANCE (Far Right) */}
                <th className="py-3.5 px-5 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#F4510B]" />
                    <span>MARK ATTENDANCE</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#172B5010]">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-0">
                    {/* Centered Sports-themed Empty State matching reference image */}
                    <div className="py-16 sm:py-20 relative overflow-hidden text-center flex flex-col items-center justify-center">
                      {/* Running kids watermark bottom right */}
                      <div className="absolute right-6 sm:right-12 bottom-3 sm:bottom-4 opacity-20 pointer-events-none select-none hidden sm:block">
                        <svg className="w-44 h-32 text-[#F4510B]" viewBox="0 0 160 120" fill="currentColor">
                          <circle cx="50" cy="25" r="12" />
                          <path d="M45 40 L35 70 L20 85 L25 90 L40 75 L48 55 L60 70 L75 80 L80 72 L65 62 L55 45 Z" />
                          <path d="M40 45 L25 55 L20 50 L35 40 Z" />
                          <path d="M50 45 L65 52 L75 48 L73 40 L62 45 Z" />
                          <circle cx="110" cy="20" r="14" />
                          <path d="M105 37 L92 68 L75 82 L80 88 L98 73 L108 52 L122 68 L138 78 L142 70 L128 60 L116 42 Z" />
                          <path d="M100 42 L82 52 L78 46 L95 37 Z" />
                          <path d="M112 42 L128 50 L140 45 L138 37 L125 42 Z" />
                        </svg>
                      </div>

                      {/* Warm cream bottom wave gradient */}
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FFF4E8]/60 to-transparent pointer-events-none" />

                      {/* Vector graphic: User + Clipboard + Checklist */}
                      <div className="relative mb-4 flex items-center justify-center">
                        <div className="absolute inset-0 bg-[#FFF5ED] rounded-full blur-[2px] transform scale-110" />
                        <svg 
                          className="w-36 h-28 relative z-10 text-[#F4510B]" 
                          viewBox="0 0 140 100" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {/* Sparkles top right */}
                          <path d="M96 16L102 10" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M106 24L113 22" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M102 32L108 34" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />

                          {/* Clipboard */}
                          <rect x="42" y="14" width="46" height="62" rx="7" fill="#FFFFFF" stroke="#F4510B" strokeWidth="3" />
                          {/* Clip top */}
                          <path d="M54 14V10C54 7.8 55.8 6 58 6H72C74.2 6 76 7.8 76 10V14" stroke="#F4510B" strokeWidth="3" strokeLinecap="round" />
                          <circle cx="65" cy="10" r="2" fill="#F4510B" />
                          {/* Checklist rows */}
                          <path d="M50 28L53.5 31.5L58 27" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="62" y1="29" x2="78" y2="29" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M50 40L53.5 43.5L58 39" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="62" y1="41" x2="75" y2="41" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M50 52L53.5 55.5L58 51" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="62" y1="53" x2="71" y2="53" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />

                          {/* User icon on left / front */}
                          <g transform="translate(14, 38)">
                            <circle cx="20" cy="12" r="9" fill="#FFF5ED" stroke="#F4510B" strokeWidth="3" />
                            <path d="M8 38 C8 27, 13 23, 20 23 C27 23, 32 27, 32 38" fill="#FFF5ED" stroke="#F4510B" strokeWidth="3" strokeLinecap="round" />
                          </g>
                        </svg>
                      </div>

                      {/* Heading */}
                      <h3 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight mb-1.5">
                        No students found
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-[#172B50]/70 max-w-md mx-auto mb-2 leading-relaxed">
                        No students match the selected location, program, batch, coach, or search filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRows.map(row => {
                  const { student, batch, currentStatus, isDirty } = row;
                  return (
                    <tr key={student.id} className="hover:bg-[#FFF4E8]/35 transition-colors">
                      {/* 1. KID ID */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-mono font-bold text-xs text-[#F4510B] bg-[#FFF5ED] border border-[#F4510B25] shadow-2xs">
                          {student.id}
                        </span>
                      </td>

                      {/* 2. KID NAME */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              student.avatar ||
                              'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
                            }
                            alt={student.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#172B5015] shrink-0"
                          />
                          <div>
                            <span className="font-extrabold text-[#172B50] block leading-tight text-sm">
                              {student.name}
                            </span>
                            <span className="text-[11px] text-[#172B50]/65 font-medium block mt-0.5">
                              {student.age || '5'} yrs • {student.gender || 'Athlete'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. PROGRAM */}
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-[#172B50] block">
                          {student.program || batch?.program || 'Sports Program'}
                        </span>
                        {batch && (
                          <span className="text-[10px] text-[#172B50]/65 block mt-0.5">
                            Batch: {batch.name}
                          </span>
                        )}
                      </td>

                      {/* 4. LOCATION */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F4510B]">
                          <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                          <span>{student.center}</span>
                        </span>
                      </td>

                      {/* 5. MARK ATTENDANCE */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          {/* Current status indicator */}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold ${
                              currentStatus === ATTENDANCE_STATUSES.PRESENT
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : currentStatus === ATTENDANCE_STATUSES.ABSENT
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : currentStatus === ATTENDANCE_STATUSES.LEAVE
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : currentStatus === ATTENDANCE_STATUSES.COMPENSATION
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-slate-100 text-[#172B50]/70 border border-[#172B5020]'
                            }`}
                          >
                            {currentStatus === ATTENDANCE_STATUSES.PRESENT && <Check className="w-3 h-3 text-emerald-600" />}
                            {currentStatus === ATTENDANCE_STATUSES.ABSENT && <X className="w-3 h-3 text-rose-600" />}
                            {currentStatus === ATTENDANCE_STATUSES.LEAVE && <Clock className="w-3 h-3 text-amber-600" />}
                            {currentStatus === ATTENDANCE_STATUSES.COMPENSATION && <RotateCcw className="w-3 h-3 text-purple-600" />}
                            {currentStatus === ATTENDANCE_STATUSES.NOT_MARKED && <Clock className="w-3 h-3" />}
                            <span>{currentStatus}</span>
                            {isDirty && <span className="text-[9px] ml-0.5 opacity-80">(Edited)</span>}
                          </span>

                          {/* Present / Absent / Leave / Compensation Action Buttons */}
                          <div className="inline-flex items-center bg-[#FFF4E8] p-1 rounded-xl border border-[#172B5015] gap-1">
                            <button
                              type="button"
                              onClick={() => handleStageStatus(row, ATTENDANCE_STATUSES.PRESENT)}
                              title="Mark Present (Green)"
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                                currentStatus === ATTENDANCE_STATUSES.PRESENT
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-[#172B50] hover:bg-white'
                              }`}
                            >
                              Present
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStageStatus(row, ATTENDANCE_STATUSES.ABSENT)}
                              title="Mark Absent (Red)"
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                                currentStatus === ATTENDANCE_STATUSES.ABSENT
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-[#172B50] hover:bg-white'
                              }`}
                            >
                              Absent
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStageStatus(row, ATTENDANCE_STATUSES.LEAVE)}
                              title="Mark Leave (Amber)"
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                                currentStatus === ATTENDANCE_STATUSES.LEAVE
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'text-[#172B50] hover:bg-white'
                              }`}
                            >
                              Leave
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStageStatus(row, ATTENDANCE_STATUSES.COMPENSATION)}
                              title="Mark Compensation (Purple)"
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                                currentStatus === ATTENDANCE_STATUSES.COMPENSATION
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'text-[#172B50] hover:bg-white'
                              }`}
                            >
                              Comp
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 bg-[#FFF4E8]/40 border-t border-[#172B5012] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#172B50]">
          <span className="font-semibold opacity-75">
            Page {safePage} of {totalPages} • {displayedRows.length} athlete{displayedRows.length === 1 ? '' : 's'}
            {selectedStatus !== 'All' ? ` (${selectedStatus})` : ''}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-[#172B5018] bg-white font-bold text-[#172B50] disabled:opacity-40 hover:bg-[#FFF4E8] inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-[#172B5018] bg-white font-bold text-[#172B50] disabled:opacity-40 hover:bg-[#FFF4E8] inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
