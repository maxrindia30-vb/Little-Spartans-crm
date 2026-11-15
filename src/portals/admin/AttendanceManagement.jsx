import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Calendar,
  Search,
  CheckCircle2,
  Save,
  Info,
  ChevronLeft,
  ChevronRight,
  Users,
  Check,
  X,
  Clock
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { getCommonLocations } from '../../services/locationService';
import {
  ATTENDANCE_STATUSES,
  filterStudentsForAttendance,
  getSavedAttendanceRecord,
  resolveStudentBatch,
} from '../../services/attendanceService';

export default function AttendanceManagement() {
  const { data, saveBatchAttendance, addToast } = useCrm();

  const commonLocations = getCommonLocations(data);

  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedDate, setSelectedDate] = useState('2026-11-11');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [selectedBatchId, setSelectedBatchId] = useState('All');
  const [selectedCoach, setSelectedCoach] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Draft edits keyed by `${studentId}::${batchId}::${date}::${location}`
  const [draftStatuses, setDraftStatuses] = useState({});

  const locationScopedClasses = useMemo(() => {
    return (data.classes || []).filter(
      c => selectedLocation === 'All' || c.center === selectedLocation
    );
  }, [data.classes, selectedLocation]);

  const availablePrograms = useMemo(() => {
    const names = new Set();
    locationScopedClasses.forEach(c => {
      if (c.program) names.add(c.program);
    });
    (data.students || []).forEach(s => {
      if ((selectedLocation === 'All' || s.center === selectedLocation) && s.program) {
        names.add(s.program);
      }
    });
    return Array.from(names);
  }, [locationScopedClasses, data.students, selectedLocation]);

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
    (data.students || []).forEach(s => {
      if ((selectedLocation === 'All' || s.center === selectedLocation) && s.coachName) {
        coachNames.add(s.coachName);
      }
    });
    return Array.from(coachNames);
  }, [locationScopedClasses, data.students, selectedLocation]);

  const handleLocationChange = (nextLocation) => {
    setSelectedLocation(nextLocation);
    setCurrentPage(1);

    const nextClasses = (data.classes || []).filter(
      c => nextLocation === 'All' || c.center === nextLocation
    );
    const nextStudents = (data.students || []).filter(
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
    return filterStudentsForAttendance(data.students || [], data.classes || [], {
      location: selectedLocation,
      program: selectedProgram,
      batchId: selectedBatchId,
      coach: selectedCoach,
      search: searchTerm,
    });
  }, [data.students, data.classes, selectedLocation, selectedProgram, selectedBatchId, selectedCoach, searchTerm]);

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

  const totalPages = Math.max(1, Math.ceil(studentRows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = studentRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleStageStatus = (row, status) => {
    setDraftStatuses(prev => ({
      ...prev,
      [row.draftKey]: status,
    }));
  };

  const handleMarkAllPresent = () => {
    if (studentRows.length === 0) {
      addToast('No students match the current location/batch filters.', 'error');
      return;
    }
    setDraftStatuses(prev => {
      const updated = { ...prev };
      studentRows.forEach(row => {
        updated[row.draftKey] = ATTENDANCE_STATUSES.PRESENT;
      });
      return updated;
    });
    addToast(`Staged ${studentRows.length} student(s) as Present. Click "Save Attendance" to commit.`, 'success');
  };

  const handleSaveAttendance = () => {
    if (!selectedDate) {
      addToast('Please select a training date before saving attendance.', 'error');
      return;
    }

    const markableRows = studentRows.filter(
      row =>
        row.currentStatus === ATTENDANCE_STATUSES.PRESENT ||
        row.currentStatus === ATTENDANCE_STATUSES.ABSENT
    );

    if (markableRows.length === 0) {
      addToast('Mark at least one student Present or Absent before saving.', 'error');
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

  const selectedBatchObj =
    selectedBatchId !== 'All'
      ? (data.classes || []).find(c => c.id === selectedBatchId)
      : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Daily Student Attendance Register
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Location-isolated turnout register synchronized with Coach Portal batch attendance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5025] rounded-xl hover:bg-white transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-[#F4510B]" />
            <span>Mark All Present</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAttendance}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4 text-white" />
            <span>
              Save Attendance{dirtyRowsCount > 0 ? ` (${dirtyRowsCount})` : ''}
            </span>
          </button>
        </div>
      </div>

      {/* Location & Composite Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#172B501A] shadow-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Location Filter */}
          <div>
            <label className="text-[10px] font-extrabold uppercase text-[#172B50] opacity-70 block mb-1">
              Academy Location
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-[#F4510B] absolute left-2.5 top-2.5 pointer-events-none" />
              <select
                aria-label="Filter student attendance by location"
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full pl-8 pr-2.5 py-2 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none focus:ring-2 focus:ring-[#F4510B]"
              >
                <option value="All">All Locations</option>
                {commonLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-[10px] font-extrabold uppercase text-[#172B50] opacity-70 block mb-1">
              Attendance Date
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-[#172B50] opacity-60 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="date"
                aria-label="Attendance Date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-2.5 py-2 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>
          </div>

          {/* Program Filter */}
          <div>
            <label className="text-[10px] font-extrabold uppercase text-[#172B50] opacity-70 block mb-1">
              Sports Program
            </label>
            <select
              aria-label="Filter by sports program"
              value={selectedProgram}
              onChange={(e) => {
                setSelectedProgram(e.target.value);
                setSelectedBatchId('All');
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none focus:ring-2 focus:ring-[#F4510B]"
            >
              <option value="All">All Programs</option>
              {availablePrograms.map(prog => (
                <option key={prog} value={prog}>
                  {prog}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Filter */}
          <div>
            <label className="text-[10px] font-extrabold uppercase text-[#172B50] opacity-70 block mb-1">
              Batch / Class
            </label>
            <select
              aria-label="Filter by batch"
              value={selectedBatchId}
              onChange={(e) => {
                setSelectedBatchId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none focus:ring-2 focus:ring-[#F4510B]"
            >
              <option value="All">All Batches</option>
              {availableBatches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Coach Filter */}
          <div>
            <label className="text-[10px] font-extrabold uppercase text-[#172B50] opacity-70 block mb-1">
              Coach
            </label>
            <select
              aria-label="Filter by coach"
              value={selectedCoach}
              onChange={(e) => {
                setSelectedCoach(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none focus:ring-2 focus:ring-[#F4510B]"
            >
              <option value="All">All Coaches</option>
              {availableCoaches.map(coach => (
                <option key={coach} value={coach}>
                  {coach}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="text-[10px] font-extrabold uppercase text-[#172B50] opacity-70 block mb-1">
              Search Athlete
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#172B50] opacity-50 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Name or ID..."
                className="w-full pl-8 pr-2.5 py-2 rounded-xl text-xs bg-[#FFF4E8] text-[#172B50] placeholder-[#172B5080] border border-[#172B5020] outline-none focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-[#172B5010]">
          <div className="px-3.5 py-2 rounded-xl bg-[#FFF4E8] border border-[#172B5015] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#172B50]">Total Students</span>
            <span className="text-sm font-black text-[#172B50]">{totalStudents}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#FFF4E8] border border-[#172B5015] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#172B50]">Present</span>
            <span className="text-sm font-black text-emerald-700">{presentCount}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#FFF4E8] border border-[#172B5015] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#172B50]">Absent</span>
            <span className="text-sm font-black text-[#F4510B]">{absentCount}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#FFF4E8] border border-[#172B5015] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#172B50]">Not Marked</span>
            <span className="text-sm font-black text-[#172B50] opacity-70">{notMarkedCount}</span>
          </div>
          <div className="col-span-2 sm:col-span-1 px-3.5 py-2 rounded-xl bg-[#172B50] text-white flex items-center justify-between">
            <span className="text-[11px] font-bold">Attendance %</span>
            <span className="text-sm font-black text-[#FFF4E8]">{attendancePct}%</span>
          </div>
        </div>
      </div>

      {/* Roster Table Card */}
      <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
        <div className="p-4 border-b border-[#172B5015] bg-[#FFF4E8]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-[#172B50]">
              {selectedBatchObj ? selectedBatchObj.name : selectedLocation === 'All' ? 'All Locations Student Register' : `${selectedLocation} Student Register`}
            </h3>
            <p className="text-xs text-[#172B50] opacity-75">
              Date: <strong>{selectedDate}</strong>
              {selectedBatchObj ? ` • ${selectedBatchObj.schedule} • ${selectedBatchObj.coach}` : ' • Records strictly isolated by student academy branch'}
            </p>
          </div>
          <span className="text-xs font-bold text-[#F4510B]">
            {attendancePct}% Turnout ({presentCount}/{totalStudents})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FFF4E8] text-[#172B50] font-extrabold uppercase tracking-wider text-[11px] border-b border-[#172B5015]">
                <th className="py-3 px-4">Athlete</th>
                <th className="py-3 px-4">Location & Batch</th>
                <th className="py-3 px-4">Coach</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Mark Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172B5010]">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-[#172B50] opacity-60">
                    <Users className="w-7 h-7 mx-auto mb-2 opacity-40" />
                    No students match the selected location, program, batch, coach, or search filters.
                  </td>
                </tr>
              ) : (
                paginatedRows.map(row => {
                  const { student, batch, currentStatus, isDirty, savedRecord } = row;
                  return (
                    <tr key={student.id} className="hover:bg-[#FFF4E8]/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#172B5020]"
                          />
                          <div>
                            <span className="font-extrabold text-[#172B50] block">{student.name}</span>
                            <span className="text-[10px] text-[#172B50] opacity-60">{student.id} • {student.parentPhone}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF4E8] text-[#F4510B] font-bold text-[10px] border border-[#F4510B20]">
                          <MapPin className="w-2.5 h-2.5" />
                          {student.center}
                        </span>
                        <span className="block font-bold text-[#172B50] mt-1">
                          {batch ? batch.name : student.program}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#172B50] block">
                          {batch?.coach || student.coachName}
                        </span>
                        {savedRecord?.markedBy && (
                          <span className="text-[10px] text-[#172B50] opacity-60 block">
                            Last saved by: {savedRecord.markedBy}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold ${
                            currentStatus === ATTENDANCE_STATUSES.PRESENT
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : currentStatus === ATTENDANCE_STATUSES.ABSENT
                              ? 'bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B40]'
                              : 'bg-slate-100 text-[#172B50] opacity-75 border border-[#172B5020]'
                          }`}
                        >
                          {currentStatus === ATTENDANCE_STATUSES.PRESENT && <Check className="w-3 h-3" />}
                          {currentStatus === ATTENDANCE_STATUSES.ABSENT && <X className="w-3 h-3" />}
                          {currentStatus === ATTENDANCE_STATUSES.NOT_MARKED && <Clock className="w-3 h-3" />}
                          <span>{currentStatus}</span>
                          {isDirty && <span className="text-[9px] ml-0.5 opacity-80">(Edited)</span>}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center bg-[#FFF4E8] p-1 rounded-xl border border-[#172B5015] gap-1">
                          <button
                            type="button"
                            onClick={() => handleStageStatus(row, ATTENDANCE_STATUSES.PRESENT)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                              currentStatus === ATTENDANCE_STATUSES.PRESENT
                                ? 'bg-[#172B50] text-white shadow-sm'
                                : 'text-[#172B50] hover:bg-white'
                            }`}
                          >
                            Present
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStageStatus(row, ATTENDANCE_STATUSES.ABSENT)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                              currentStatus === ATTENDANCE_STATUSES.ABSENT
                                ? 'bg-[#F4510B] text-white shadow-sm'
                                : 'text-[#172B50] hover:bg-white'
                            }`}
                          >
                            Absent
                          </button>
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
        <div className="px-4 py-3 bg-[#FFF4E8]/60 border-t border-[#172B5015] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#172B50]">
          <span className="font-semibold opacity-75">
            Page {safePage} of {totalPages} • {studentRows.length} athlete{studentRows.length === 1 ? '' : 's'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1.5 rounded-lg border border-[#172B5020] bg-white font-bold text-[#172B50] disabled:opacity-40 hover:bg-[#FFF4E8] inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1.5 rounded-lg border border-[#172B5020] bg-white font-bold text-[#172B50] disabled:opacity-40 hover:bg-[#FFF4E8] inline-flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Local Data & Backend Integration Note */}
      <div className="flex items-start gap-2.5 px-4 py-2.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015] text-[11px] text-[#172B50]">
        <Info className="w-4 h-4 text-[#F4510B] shrink-0 mt-0.5" />
        <span>
          Attendance saves into shared browser <code className="font-bold">localStorage</code> across Admin &amp; Coach portals (preventing duplicate{' '}
          <code className="font-bold">(studentId, batchId, date)</code> rows). Backend persistence requires{' '}
          <code className="font-bold">GET /api/v1/attendance</code> and <code className="font-bold">PUT /api/v1/attendance/batch</code>.
        </span>
      </div>
    </div>
  );
}
