import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeftRight,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  User,
  AlertTriangle,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  History,
  Check
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export default function SuperCoachAttendanceOverview({
  allowedLocations = []
}) {
  const { data } = useCrm();

  // Filters state
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [selectedBatchId, setSelectedBatchId] = useState('All');
  const [selectedCoachId, setSelectedCoachId] = useState('All');
  const [selectedDate, setSelectedDate] = useState('2026-11-22');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Active sub-tab within overview: 'location_wise' | 'batch_wise' | 'child_wise' | 'missing' | 'audit'
  const [activeTab, setActiveTab] = useState('location_wise');

  // Locations authorized for this Super Coach
  const effectiveLocations = useMemo(() => {
    const all = ['KK NAGAR', 'KILPAUK', 'MAHALINGAPURAM', 'ANNA NAGAR', 'KOLATHUR'];
    if (allowedLocations && allowedLocations.length > 0) {
      return all.filter(loc => allowedLocations.includes(loc));
    }
    return all;
  }, [allowedLocations]);

  // Scoped attendance records
  const scopedAttendance = useMemo(() => {
    return (data.attendanceRecords || []).filter(rec => {
      // 1. Location restriction
      if (effectiveLocations.length > 0 && !effectiveLocations.includes(rec.location)) {
        return false;
      }
      if (selectedLocation !== 'All' && rec.location !== selectedLocation) {
        return false;
      }
      // 2. Program filter
      if (selectedProgram !== 'All' && rec.program !== selectedProgram) {
        return false;
      }
      // 3. Batch filter
      if (selectedBatchId !== 'All' && rec.batchId !== selectedBatchId) {
        return false;
      }
      // 4. Coach filter
      if (selectedCoachId !== 'All' && rec.coachId !== selectedCoachId && rec.coachName !== selectedCoachId) {
        return false;
      }
      // 5. Date filter
      if (selectedDate && rec.date !== selectedDate && rec.sessionDate !== selectedDate) {
        return false;
      }
      // 6. Status filter
      if (selectedStatus !== 'All' && rec.status !== selectedStatus) {
        return false;
      }
      // 7. Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches = (rec.studentName || rec.childName || '').toLowerCase().includes(q) ||
          (rec.studentId || rec.childId || '').toLowerCase().includes(q) ||
          (rec.coachName || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [
    data.attendanceRecords,
    effectiveLocations,
    selectedLocation,
    selectedProgram,
    selectedBatchId,
    selectedCoachId,
    selectedDate,
    selectedStatus,
    searchTerm
  ]);

  // Scoped students count
  const scopedStudents = useMemo(() => {
    return (data.students || []).filter(s => {
      if (effectiveLocations.length > 0 && !effectiveLocations.includes(s.center)) return false;
      if (selectedLocation !== 'All' && s.center !== selectedLocation) return false;
      if (selectedProgram !== 'All' && s.program !== selectedProgram) return false;
      return true;
    });
  }, [data.students, effectiveLocations, selectedLocation, selectedProgram]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const present = scopedAttendance.filter(r => r.status === 'Present').length;
    const absent = scopedAttendance.filter(r => r.status === 'Absent').length;
    const leave = scopedAttendance.filter(r => r.status === 'Leave').length;
    const compensation = scopedAttendance.filter(r => r.status === 'Compensation').length;
    const totalRecords = scopedAttendance.length;

    const denominator = present + absent;
    const attendancePct = denominator > 0 ? Math.round((present / denominator) * 100) : 100;

    return {
      totalStudents: scopedStudents.length,
      present,
      absent,
      leave,
      compensation,
      attendancePct
    };
  }, [scopedAttendance, scopedStudents]);

  // Location-wise breakdown table
  const locationBreakdown = useMemo(() => {
    const locs = selectedLocation === 'All' ? effectiveLocations : [selectedLocation];
    return locs.map(loc => {
      const records = (data.attendanceRecords || []).filter(r =>
        r.location === loc && (!selectedDate || r.date === selectedDate || r.sessionDate === selectedDate)
      );
      const locStudents = (data.students || []).filter(s => s.center === loc);
      const present = records.filter(r => r.status === 'Present').length;
      const absent = records.filter(r => r.status === 'Absent').length;
      const leave = records.filter(r => r.status === 'Leave').length;
      const comp = records.filter(r => r.status === 'Compensation').length;
      const denom = present + absent;
      const pct = denom > 0 ? Math.round((present / denom) * 100) : 100;

      return {
        location: loc,
        totalEnrolled: locStudents.length,
        markedRecords: records.length,
        present,
        absent,
        leave,
        comp,
        pct
      };
    });
  }, [selectedLocation, effectiveLocations, data.attendanceRecords, data.students, selectedDate]);

  // Batch-wise breakdown table
  const batchBreakdown = useMemo(() => {
    const batches = (data.classes || []).filter(c =>
      effectiveLocations.includes(c.center) &&
      (selectedLocation === 'All' || c.center === selectedLocation) &&
      (selectedProgram === 'All' || c.program === selectedProgram)
    );

    return batches.map(batch => {
      const records = (data.attendanceRecords || []).filter(r =>
        r.batchId === batch.id && (!selectedDate || r.date === selectedDate || r.sessionDate === selectedDate)
      );
      const present = records.filter(r => r.status === 'Present').length;
      const absent = records.filter(r => r.status === 'Absent').length;
      const leave = records.filter(r => r.status === 'Leave').length;
      const comp = records.filter(r => r.status === 'Compensation').length;

      return {
        batchId: batch.id,
        batchName: batch.name,
        location: batch.center,
        program: batch.program,
        coachName: batch.coach || 'Assigned Coach',
        timing: batch.timing || '08:00 AM – 09:00 AM',
        hasSubmitted: records.length > 0,
        markedCount: records.length,
        present,
        absent,
        leave,
        comp
      };
    });
  }, [data.classes, effectiveLocations, selectedLocation, selectedProgram, data.attendanceRecords, selectedDate]);

  // Missing Attendance Detector (Batches with 0 submitted records for selectedDate)
  const missingBatches = useMemo(() => {
    return batchBreakdown.filter(b => !b.hasSubmitted);
  }, [batchBreakdown]);

  // Audit history: recently edited or submitted records
  const auditLogs = useMemo(() => {
    const historyLogs = data.compensationHistory || [];
    if (historyLogs.length > 0) return historyLogs.slice(0, 10);
    return [
      {
        id: '1',
        timestamp: '2026-11-24T10:15:00Z',
        type: 'Attendance Marked',
        studentName: 'Aarav K',
        location: 'KK NAGAR',
        date: '2026-11-24',
        details: 'Approved – Family Function recorded as Leave',
        actor: 'Admin',
        status: 'Leave'
      },
      {
        id: '2',
        timestamp: '2026-11-22T09:00:00Z',
        type: 'Compensation Completed',
        studentName: 'Aarav K',
        location: 'KK NAGAR',
        date: '2026-11-22',
        details: 'Compensation session marked Present under Coach Sam',
        actor: 'Coach Sam',
        status: 'Compensation'
      }
    ];
  }, [data.compensationHistory]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* =================================================================== */}
      {/* 1. TOP HEADER BANNER                                                */}
      {/* =================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#F4510B]" />
            <span>Attendance Oversight & Multi-Location Analytics</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#172B50]/70 mt-0.5">
            Real-time compliance monitor across authorized locations: {effectiveLocations.join(' • ')}
          </p>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. TOP 6 KPI TILES                                                  */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        
        {/* Total Students */}
        <div className="bg-white rounded-2xl p-4 border border-[#172B5014] shadow-card">
          <div className="flex items-center justify-between text-[#172B50]/60 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Athletes</span>
            <Users className="w-4 h-4 text-[#172B50]/40" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#172B50]">
            {kpis.totalStudents}
          </div>
          <span className="text-[10px] text-[#172B50]/60 font-semibold mt-1 block">
            Across {effectiveLocations.length} centers
          </span>
        </div>

        {/* Present Students */}
        <div className="bg-[#F0FDF4] rounded-2xl p-4 border border-[#16A34A20] shadow-card">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Present</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800">
            {kpis.present}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
            Active attendees
          </span>
        </div>

        {/* Absent Students */}
        <div className="bg-[#FEF2F2] rounded-2xl p-4 border border-[#DC262620] shadow-card">
          <div className="flex items-center justify-between text-rose-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Absent</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-800">
            {kpis.absent}
          </div>
          <span className="text-[10px] text-rose-700 font-semibold mt-1 block">
            Unexcused missed
          </span>
        </div>

        {/* Approved Leave */}
        <div className="bg-[#FFFBEB] rounded-2xl p-4 border border-[#D9770625] shadow-card">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Approved Leave</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-800">
            {kpis.leave}
          </div>
          <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
            Formal parental notice
          </span>
        </div>

        {/* Compensation Sessions */}
        <div className="bg-[#FAF5FF] rounded-2xl p-4 border border-[#9333EA25] shadow-card">
          <div className="flex items-center justify-between text-purple-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Compensation</span>
            <ArrowLeftRight className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-800">
            {kpis.compensation}
          </div>
          <span className="text-[10px] text-purple-700 font-semibold mt-1 block">
            Makeup slots utilized
          </span>
        </div>

        {/* Attendance Percentage */}
        <div className="bg-[#FFF4E8] rounded-2xl p-4 border border-[#F4510B25] shadow-card">
          <div className="flex items-center justify-between text-[#F4510B] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Turnout Rate</span>
            <TrendingUp className="w-4 h-4 text-[#F4510B]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#F4510B]">
            {kpis.attendancePct}%
          </div>
          <span className="text-[10px] text-[#172B50]/70 font-semibold mt-1 block">
            Present vs Absent ratio
          </span>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 3. MULTI-LEVEL FILTER CONTROL BAR                                   */}
      {/* =================================================================== */}
      <div className="bg-white rounded-3xl p-5 border border-[#172B5014] shadow-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          
          {/* Location Filter */}
          <div>
            <label className="text-[11px] font-bold text-[#172B50] block mb-1">Location</label>
            <div className="relative flex items-center bg-[#FFF4E8]/60 border border-[#172B5014] rounded-xl px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-transparent border-0 text-xs font-bold text-[#172B50] pl-2 outline-none cursor-pointer"
              >
                <option value="All">All Locations</option>
                {effectiveLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Program Filter */}
          <div>
            <label className="text-[11px] font-bold text-[#172B50] block mb-1">Program</label>
            <div className="relative flex items-center bg-[#FFF4E8]/60 border border-[#172B5014] rounded-xl px-3 py-2">
              <Layers className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full bg-transparent border-0 text-xs font-bold text-[#172B50] pl-2 outline-none cursor-pointer"
              >
                <option value="All">All Programs</option>
                <option value="Foundational Movement">Foundational Movement</option>
                <option value="Athletics">Athletics</option>
                <option value="Football">Football</option>
                <option value="Basketball">Basketball</option>
              </select>
            </div>
          </div>

          {/* Batch Filter */}
          <div>
            <label className="text-[11px] font-bold text-[#172B50] block mb-1">Batch</label>
            <div className="relative flex items-center bg-[#FFF4E8]/60 border border-[#172B5014] rounded-xl px-3 py-2">
              <Calendar className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full bg-transparent border-0 text-xs font-bold text-[#172B50] pl-2 outline-none cursor-pointer"
              >
                <option value="All">All Batches</option>
                {(data.classes || []).map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.center})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Coach Filter */}
          <div>
            <label className="text-[11px] font-bold text-[#172B50] block mb-1">Coach</label>
            <div className="relative flex items-center bg-[#FFF4E8]/60 border border-[#172B5014] rounded-xl px-3 py-2">
              <User className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
              <select
                value={selectedCoachId}
                onChange={(e) => setSelectedCoachId(e.target.value)}
                className="w-full bg-transparent border-0 text-xs font-bold text-[#172B50] pl-2 outline-none cursor-pointer"
              >
                <option value="All">All Coaches</option>
                {(data.coaches || []).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Selector */}
          <div>
            <label className="text-[11px] font-bold text-[#172B50] block mb-1">Date</label>
            <div className="relative flex items-center bg-[#FFF4E8]/60 border border-[#172B5014] rounded-xl px-3 py-2">
              <Calendar className="w-3.5 h-3.5 text-[#172B50] shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-transparent border-0 text-xs font-bold text-[#172B50] pl-2 outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Attendance Status */}
          <div>
            <label className="text-[11px] font-bold text-[#172B50] block mb-1">Status</label>
            <div className="relative flex items-center bg-[#FFF4E8]/60 border border-[#172B5014] rounded-xl px-3 py-2">
              <Filter className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-transparent border-0 text-xs font-bold text-[#172B50] pl-2 outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
                <option value="Compensation">Compensation</option>
              </select>
            </div>
          </div>

        </div>

        {/* Search Input Bar */}
        <div className="pt-2 flex items-center gap-3">
          <div className="relative flex-1 flex items-center bg-[#FFF4E8]/40 border border-[#172B5015] rounded-xl px-3.5 py-2">
            <Search className="w-4 h-4 text-[#172B50]/40 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by child name, ID, or coach name..."
              className="w-full bg-transparent border-0 text-xs font-medium text-[#172B50] pl-2 outline-none"
            />
          </div>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="px-3 py-2 text-xs font-bold text-[#F4510B] hover:bg-[#FFF4E8] rounded-xl cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. SUB-TAB VIEW SELECTOR                                            */}
      {/* =================================================================== */}
      <div className="flex items-center gap-2 border-b border-[#172B5014] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('location_wise')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'location_wise'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'text-[#172B50] hover:bg-[#FFF4E8]'
          }`}
        >
          Location Breakdown ({locationBreakdown.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('batch_wise')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'batch_wise'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'text-[#172B50] hover:bg-[#FFF4E8]'
          }`}
        >
          Batch &amp; Timetable Analysis ({batchBreakdown.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('missing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'missing'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'text-[#172B50] hover:bg-[#FFF4E8]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Missing Submissions ({missingBatches.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('child_wise')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'child_wise'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'text-[#172B50] hover:bg-[#FFF4E8]'
          }`}
        >
          Child-Wise Records ({scopedAttendance.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'text-[#172B50] hover:bg-[#FFF4E8]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit &amp; Corrections Log</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* 5. TAB VIEWS CONTENT                                                */}
      {/* =================================================================== */}
      
      {/* VIEW A: LOCATION-WISE BREAKDOWN */}
      {activeTab === 'location_wise' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B5014] shadow-card">
          <h3 className="text-base font-black text-[#172B50] mb-3">
            Location-Wise Participation &amp; Compliance ({selectedDate})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#172B5012] text-[#172B50]/60 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Academy Location</th>
                  <th className="py-3 px-3 text-center">Enrolled Athletes</th>
                  <th className="py-3 px-3 text-center">Marked Records</th>
                  <th className="py-3 px-3 text-center">Present</th>
                  <th className="py-3 px-3 text-center">Absent</th>
                  <th className="py-3 px-3 text-center">Approved Leave</th>
                  <th className="py-3 px-3 text-center">Compensation</th>
                  <th className="py-3 px-3 text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B500A]">
                {locationBreakdown.map(loc => (
                  <tr key={loc.location} className="hover:bg-[#FFF4E8]/20 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-[#172B50] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#F4510B]" />
                      <span>{loc.location}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-semibold text-[#172B50]">
                      {loc.totalEnrolled}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-[#172B50]">
                      {loc.markedRecords}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-emerald-700">
                      {loc.present}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-rose-700">
                      {loc.absent}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-amber-700">
                      {loc.leave}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-purple-700">
                      {loc.comp}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-black text-xs bg-emerald-100 text-emerald-800">
                        {loc.pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW B: BATCH-WISE ANALYSIS */}
      {activeTab === 'batch_wise' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B5014] shadow-card">
          <h3 className="text-base font-black text-[#172B50] mb-3">
            Batch-Level Submissions &amp; Coach Responsibility
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#172B5012] text-[#172B50]/60 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Batch Name</th>
                  <th className="py-3 px-3">Location &amp; Program</th>
                  <th className="py-3 px-3">Lead Coach</th>
                  <th className="py-3 px-3">Session Time</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Present</th>
                  <th className="py-3 px-3 text-center">Absent</th>
                  <th className="py-3 px-3 text-center">Leave</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B500A]">
                {batchBreakdown.map(batch => (
                  <tr key={batch.batchId} className="hover:bg-[#FFF4E8]/20 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-[#172B50]">
                      {batch.batchName}
                    </td>
                    <td className="py-3.5 px-3 text-[#172B50]/70">
                      {batch.location} • {batch.program}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[#172B50]">
                      {batch.coachName}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-[#172B50]/80">
                      {batch.timing}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {batch.hasSubmitted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3" />
                          <span>Submitted</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-emerald-700">
                      {batch.present}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-rose-700">
                      {batch.absent}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-amber-700">
                      {batch.leave}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW C: MISSING ATTENDANCE DETECTOR */}
      {activeTab === 'missing' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B5014] shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#172B50] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Batches Missing Attendance Submission ({selectedDate})</span>
            </h3>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              {missingBatches.length} Pending Submission(s)
            </span>
          </div>

          {missingBatches.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900">100% Submission Compliance</h4>
              <p className="text-xs text-emerald-700">
                All scheduled batches for {selectedDate} have completed student attendance submissions!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missingBatches.map(batch => (
                <div key={batch.batchId} className="p-4 bg-[#FFFDF7] border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#172B50]">{batch.batchName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                      Pending
                    </span>
                  </div>
                  <div className="text-xs text-[#172B50]/80 space-y-0.5">
                    <p><span className="font-semibold">Center:</span> {batch.location}</p>
                    <p><span className="font-semibold">Program:</span> {batch.program}</p>
                    <p><span className="font-semibold">Lead Coach:</span> {batch.coachName}</p>
                    <p><span className="font-semibold">Time:</span> {batch.timing}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW D: CHILD-WISE RECORDS */}
      {activeTab === 'child_wise' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B5014] shadow-card">
          <h3 className="text-base font-black text-[#172B50] mb-3">
            Individual Child Attendance Records ({scopedAttendance.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#172B5012] text-[#172B50]/60 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Child Name &amp; ID</th>
                  <th className="py-3 px-3">Location &amp; Program</th>
                  <th className="py-3 px-3">Batch &amp; Coach</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B500A]">
                {scopedAttendance.map(rec => (
                  <tr key={rec.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#172B50]">{rec.childName || rec.studentName}</div>
                      <div className="text-[10px] font-mono text-[#F4510B]">{rec.childId || rec.studentId}</div>
                    </td>
                    <td className="py-3.5 px-3 text-[#172B50]/70">
                      {rec.location} • {rec.program}
                    </td>
                    <td className="py-3.5 px-3 text-[#172B50]/80">
                      <div className="font-semibold">{rec.batchName || rec.batchId}</div>
                      <div className="text-[10px] text-[#172B50]/60">{rec.coachName}</div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[#172B50]">
                      {rec.date || rec.sessionDate}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        rec.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                        rec.status === 'Absent' ? 'bg-rose-100 text-rose-800' :
                        rec.status === 'Leave' ? 'bg-amber-100 text-amber-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[#172B50]/70">
                      {rec.coachRemarks || '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW E: AUDIT & CORRECTIONS LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B5014] shadow-card">
          <h3 className="text-base font-black text-[#172B50] mb-3 flex items-center gap-2">
            <History className="w-5 h-5 text-[#F4510B]" />
            <span>Attendance Corrections &amp; Audit Trail</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#172B5012] text-[#172B50]/60 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Event Type</th>
                  <th className="py-3 px-3">Athlete</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Target Date</th>
                  <th className="py-3 px-3">Details</th>
                  <th className="py-3 px-3">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B500A]">
                {auditLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-[#FFF4E8]/20 transition-colors">
                    <td className="py-3.5 px-3 font-mono text-[11px] text-[#172B50]/70">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('en-GB') : '–'}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[#172B50]">
                      {log.type}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[#172B50]">
                      {log.studentName}
                    </td>
                    <td className="py-3.5 px-3 text-[#172B50]/70">
                      {log.location}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[#172B50]">
                      {log.date}
                    </td>
                    <td className="py-3.5 px-3 text-[#172B50]/80">
                      {log.details}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[#F4510B]">
                      {log.actor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
