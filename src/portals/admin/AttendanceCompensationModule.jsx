import React, { useMemo, useState } from 'react';
import { 
  CalendarCheck, 
  UserCheck, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  History, 
  Calendar, 
  Search, 
  Plus, 
  ShieldAlert,
  ArrowRight,
  Eye,
  Edit3,
  Ban,
  MapPin
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { getCommonLocations } from '../../services/locationService';
import {
  COMPENSATION_REASONS,
  COMPENSATION_STATUSES,
} from '../../services/compensationService';
import AttendanceManagement from './AttendanceManagement';
import Modal from '../../components/common/Modal';

const STATUS_BADGE_MAP = {
  Pending: 'bg-amber-100 text-amber-800',
  'Under Review': 'bg-indigo-100 text-indigo-800',
  Approved: 'bg-sky-100 text-sky-800',
  Scheduled: 'bg-blue-100 text-blue-800',
  Completed: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-rose-100 text-rose-800',
  Cancelled: 'bg-slate-200 text-slate-700',
  Expired: 'bg-orange-100 text-orange-800',
};

export default function AttendanceCompensationModule() {
  const { 
    data, 
    activeSubTab, 
    setActiveSubTab, 
    submitCompensationRequest,
    updateCompensationRequest,
    updateCompensationStatus, 
    checkScheduleConflictLive,
    createCoachCompensation,
    updateCoachCompensation,
    addToast 
  } = useCrm();

  const activeLocations = getCommonLocations(data);
  const todayYmd = new Date().toISOString().split('T')[0];

  // Active subtab: 'student_attendance' | 'coach_attendance' | 'student_compensation' | 'coach_compensation' | 'compensation_history'
  const currentTab = activeSubTab || 'student_attendance';

  // Student Compensation Filters
  const [compSearch, setCompSearch] = useState('');
  const [compStatusFilter, setCompStatusFilter] = useState('All');
  const [compLocationFilter, setCompLocationFilter] = useState('All');

  // Detail Modal
  const [detailRequest, setDetailRequest] = useState(null);
  const [detailAdminNotes, setDetailAdminNotes] = useState('');

  // Modal for Admin Approval & Slot Scheduling / Rescheduling / Coach Assignment
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [repDate, setRepDate] = useState(todayYmd);
  const [repStartTime, setRepStartTime] = useState('10:00');
  const [repEndTime, setRepEndTime] = useState('11:15');
  const [repLocation, setRepLocation] = useState(activeLocations[0]?.name || 'KK NAGAR');
  const [repProgram, setRepProgram] = useState((data.programs || [])[0]?.name || '');
  const [repBatchId, setRepBatchId] = useState('');
  const [repCoachId, setRepCoachId] = useState((data.coaches || [])[0]?.id || '');
  const [approvalNotes, setApprovalNotes] = useState('Approved replacement slot.');

  // Modal for Admin Manual Compensation Request
  const [isManualCompOpen, setIsManualCompOpen] = useState(false);
  const [manualLocation, setManualLocation] = useState(activeLocations[0]?.name || 'KK NAGAR');
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualParentId, setManualParentId] = useState('');
  const [manualProgram, setManualProgram] = useState('');
  const [manualBatchId, setManualBatchId] = useState('');
  const [manualMissedDate, setManualMissedDate] = useState(todayYmd);
  const [manualMissedSession, setManualMissedSession] = useState('');
  const [manualReasonCategory, setManualReasonCategory] = useState(COMPENSATION_REASONS[0]);
  const [manualReasonDetails, setManualReasonDetails] = useState('');
  const [manualAdminNotes, setManualAdminNotes] = useState('');

  // Modal for Coach Missed Session Replacement
  const [isCoachCompOpen, setIsCoachCompOpen] = useState(false);
  const [compCoachId, setCompCoachId] = useState((data.coaches || [])[0]?.id || 'COACH-1');
  const [missedSessionName, setMissedSessionName] = useState('Gymnastics Batch A');
  const [missedDate, setMissedDate] = useState('2026-11-20');
  const [coverageType, setCoverageType] = useState('Substitute Coach Assigned');
  const [substituteCoachName, setSubstituteCoachName] = useState((data.coaches || [])[0]?.name || 'Kapil');
  const [compScheduledDate, setCompScheduledDate] = useState('2026-11-22 (9:00 AM)');

  const openScheduleModal = (req) => {
    setSelectedRequest(req);
    setRepDate(req.replacementDate || todayYmd);
    setRepStartTime(req.replacementStartTime || '16:30');
    setRepEndTime(req.replacementEndTime || '17:30');
    setRepLocation(req.replacementLocation || req.center || req.location || activeLocations[0]?.name || '');
    setRepProgram(req.replacementProgram || req.program || (data.programs || [])[0]?.name || '');
    setRepBatchId(req.replacementBatchId || req.batchId || '');
    const defaultCoach = (data.coaches || []).find(
      c => c.id === req.replacementCoachId || c.name === req.replacementCoach
    ) || (data.coaches || [])[0];
    setRepCoachId(defaultCoach?.id || '');
    setApprovalNotes(req.approvalNotes || 'Replacement session scheduled by Admin.');
    setApprovalModalOpen(true);
  };

  const openManualCompModal = () => {
    const defLoc = activeLocations[0]?.name || '';
    const locStudents = (data.students || []).filter(s => !defLoc || s.center === defLoc);
    const firstStu = locStudents[0] || (data.students || [])[0];
    setManualLocation(firstStu?.center || defLoc);
    setManualStudentId(firstStu?.id || '');
    setManualParentId(firstStu?.parentId || '');
    setManualProgram(firstStu?.program || (data.programs || [])[0]?.name || '');
    const matchedBatch = (data.classes || []).find(
      c => c.center === (firstStu?.center || defLoc) &&
           ((c.enrolledStudentIds || []).includes(firstStu?.id) || c.name === firstStu?.batchName)
    );
    setManualBatchId(matchedBatch?.id || '');
    setManualMissedDate(todayYmd);
    setManualMissedSession(matchedBatch?.name || firstStu?.batchName || firstStu?.program || '');
    setManualReasonCategory(COMPENSATION_REASONS[0]);
    setManualReasonDetails('');
    setManualAdminNotes('');
    setIsManualCompOpen(true);
  };

  const handleManualStudentChange = (stuId) => {
    setManualStudentId(stuId);
    const stu = (data.students || []).find(s => s.id === stuId);
    if (!stu) return;
    setManualParentId(stu.parentId || '');
    if (stu.center) setManualLocation(stu.center);
    if (stu.program) setManualProgram(stu.program);
    const matchedBatch = (data.classes || []).find(
      c => c.center === stu.center &&
           ((c.enrolledStudentIds || []).includes(stu.id) || c.name === stu.batchName)
    );
    setManualBatchId(matchedBatch?.id || '');
    setManualMissedSession(matchedBatch?.name || stu.batchName || stu.program || '');
  };

  const handleManualCompSubmit = (e) => {
    e.preventDefault();
    const stu = (data.students || []).find(s => s.id === manualStudentId);
    if (!stu) {
      addToast('Please select a valid student first.', 'error');
      return;
    }
    const par = (data.parents || []).find(p => p.id === (manualParentId || stu.parentId));
    const batchObj = (data.classes || []).find(c => c.id === manualBatchId);

    const res = submitCompensationRequest({
      requestSource: 'Admin',
      studentId: stu.id,
      studentName: stu.name,
      parentId: par?.id || stu.parentId || '',
      parentName: par?.name || stu.parentName || '',
      parentEmail: par?.email || stu.parentEmail || '',
      parentPhone: par?.phone || '',
      center: manualLocation || stu.center,
      location: manualLocation || stu.center,
      program: manualProgram || stu.program,
      batchId: batchObj?.id || manualBatchId || '',
      batchName: batchObj?.name || stu.batchName || '',
      missedClass: manualMissedSession || batchObj?.name || `${manualProgram || stu.program} Session`,
      missedDate: manualMissedDate,
      reasonCategory: manualReasonCategory,
      explanation: manualReasonDetails || 'Logged manually by Academy Admin',
      adminNotes: manualAdminNotes,
    });

    if (res?.success) {
      setIsManualCompOpen(false);
    }
  };

  const handleScheduleReplacementSubmit = () => {
    if (!selectedRequest) return;
    const coachObj = (data.coaches || []).find(c => c.id === repCoachId);
    const batchObj = (data.classes || []).find(c => c.id === repBatchId);
    const res = updateCompensationRequest(selectedRequest.id, {
      status: 'Scheduled',
      replacementDate: repDate,
      replacementStartTime: repStartTime,
      replacementEndTime: repEndTime,
      replacementLocation: repLocation,
      replacementProgram: repProgram,
      replacementBatchId: repBatchId,
      replacementBatch: batchObj?.name || `${repProgram} Replacement`,
      replacementCoachId: coachObj?.id || repCoachId,
      replacementCoach: coachObj?.name || '',
      approvalNotes,
      adminNotes: approvalNotes,
    });
    if (res?.success) {
      setApprovalModalOpen(false);
    }
  };

  const handleApproveOnly = (reqId, notes = 'Approved by Admin. Pending replacement slot scheduling.') => {
    updateCompensationRequest(reqId, { status: 'Approved', approvalNotes: notes });
    setApprovalModalOpen(false);
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    updateCompensationRequest(selectedRequest.id, {
      status: 'Rejected',
      approvalNotes: approvalNotes || 'Does not meet compensation eligibility guidelines.',
    });
    setApprovalModalOpen(false);
  };

  const handleMarkCompleted = (id) => {
    updateCompensationRequest(id, {
      status: 'Completed',
      approvalNotes: 'Student attended scheduled compensation session.',
    });
  };

  const repConflict = useMemo(() => {
    if (!approvalModalOpen || !selectedRequest || !repDate || !repStartTime || !repEndTime) {
      return { hasConflict: false };
    }
    const coachObj = (data.coaches || []).find(c => c.id === repCoachId);
    if (!coachObj) return { hasConflict: false };
    return checkScheduleConflictLive(
      {
        location: repLocation,
        coachId: coachObj.id,
        coachName: coachObj.name,
        date: repDate,
        startTime: repStartTime,
        endTime: repEndTime,
        venue: '',
      },
      selectedRequest.linkedScheduleId || null
    );
  }, [approvalModalOpen, selectedRequest, repDate, repStartTime, repEndTime, repLocation, repCoachId, data.coaches, checkScheduleConflictLive]);

  const handleCreateCoachCompSubmit = (e) => {
    e.preventDefault();
    const coach = data.coaches.find(c => c.id === compCoachId) || data.coaches[0];
    if (!coach) {
      addToast('Add a coach first before assigning coach compensation.', 'error');
      return;
    }
    createCoachCompensation({
      coachId: coach.id,
      coachName: coach.name,
      missedSession: missedSessionName,
      missedDate,
      coverageType,
      substituteCoach: substituteCoachName,
      scheduledDate: compScheduledDate,
      center: coach.center,
      notes: 'Substitute scheduled by Admin'
    });
    setIsCoachCompOpen(false);
  };

  const studentRequests = data.compensationRequests || [];
  const filteredStudentRequests = useMemo(() => {
    const q = compSearch.trim().toLowerCase();
    return studentRequests.filter(req => {
      const matchLoc = compLocationFilter === 'All' || (req.center || req.location) === compLocationFilter;
      const matchStatus = compStatusFilter === 'All' || req.status === compStatusFilter;
      const matchSearch =
        !q ||
        (req.studentName || '').toLowerCase().includes(q) ||
        (req.parentName || '').toLowerCase().includes(q) ||
        (req.missedClass || '').toLowerCase().includes(q) ||
        (req.id || '').toLowerCase().includes(q);
      return matchLoc && matchStatus && matchSearch;
    });
  }, [studentRequests, compSearch, compStatusFilter, compLocationFilter]);

  const manualFilteredStudents = useMemo(() => {
    return (data.students || []).filter(
      s => !manualLocation || s.center === manualLocation
    );
  }, [data.students, manualLocation]);

  const manualFilteredBatches = useMemo(() => {
    return (data.classes || []).filter(
      c =>
        (!manualLocation || c.center === manualLocation) &&
        (!manualProgram || c.program === manualProgram)
    );
  }, [data.classes, manualLocation, manualProgram]);

  const repFilteredBatches = useMemo(() => {
    return (data.classes || []).filter(
      c =>
        (!repLocation || c.center === repLocation) &&
        (!repProgram || c.program === repProgram)
    );
  }, [data.classes, repLocation, repProgram]);

  const coachComps = data.coachCompensationClasses || [];

  return (
    <div className="space-y-6">
      {/* Module Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#172B501A] pb-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Attendance & Compensation Classes
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Student & Coach session tracking, replacement slot scheduling and eligibility approvals
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#172B5018] shadow-xs self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveSubTab('student_attendance')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'student_attendance'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Student Attendance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('coach_attendance')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'coach_attendance'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Coach Attendance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('student_compensation')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'student_compensation'
                ? 'bg-[#172B50] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-[#F4510B]" />
            <span>Student Compensation ({studentRequests.filter(r => r.status === 'Pending').length} Pending)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('coach_compensation')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'coach_compensation'
                ? 'bg-[#172B50] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <Clock className="w-4 h-4 text-[#F4510B]" />
            <span>Coach Compensation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('compensation_history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'compensation_history'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit History</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Student Attendance */}
      {currentTab === 'student_attendance' && (
        <AttendanceManagement />
      )}

      {/* SUBTAB 2: Coach Attendance */}
      {currentTab === 'coach_attendance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
            <h2 className="text-base font-extrabold text-[#172B50] mb-4">Coach Attendance & Session Turnout</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF4E8] text-[#172B50] font-bold uppercase tracking-wider text-[11px] border-b border-[#172B501A]">
                  <tr>
                    <th className="px-5 py-3.5">Coach</th>
                    <th className="px-4 py-3.5">Center</th>
                    <th className="px-4 py-3.5">Classes This Month</th>
                    <th className="px-4 py-3.5">Turnout Rate</th>
                    <th className="px-4 py-3.5">Approved Leaves</th>
                    <th className="px-4 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B5012]">
                  {data.coaches.map(c => (
                    <tr key={c.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-[#172B50]">{c.name}</td>
                      <td className="px-4 py-3.5">{c.center}</td>
                      <td className="px-4 py-3.5">24 Sessions</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-600">97.8%</td>
                      <td className="px-4 py-3.5">1 Day</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          On Duty
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Student Compensation Classes (Section 4.8) */}
      {currentTab === 'student_compensation' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Information Notice + Create Manual Request Action */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#172B50] to-[#20365F] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-card">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#F4510B]" />
                <h2 className="text-base font-extrabold tracking-wide">
                  Admin Authority: Student Compensation Approvals &amp; Scheduling
                </h2>
              </div>
              <p className="text-xs text-white/80 mt-1 max-w-2xl leading-relaxed">
                Manage both Parent-submitted requests and Admin manual compensation entries. Verify eligibility, approve, schedule replacement sessions, assign available coaches, and track completion across Coach &amp; Parent portals.
              </p>
            </div>
            <button
              type="button"
              onClick={openManualCompModal}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold bg-[#F4510B] text-white rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Compensation Request</span>
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 border border-[#172B501A] shadow-card flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#172B50]/50 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={compSearch}
                  onChange={(e) => setCompSearch(e.target.value)}
                  placeholder="Search student, parent, ID..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-[#FFF4E8]/50 border border-[#172B501F] text-xs font-medium text-[#172B50] focus:ring-2 focus:ring-[#F4510B] outline-none"
                />
              </div>

              <select
                value={compLocationFilter}
                onChange={(e) => setCompLocationFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#FFF4E8]/50 border border-[#172B501F] font-bold text-[#172B50]"
              >
                <option value="All">All Locations</option>
                {activeLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>

              <select
                value={compStatusFilter}
                onChange={(e) => setCompStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#FFF4E8]/50 border border-[#172B501F] font-bold text-[#172B50]"
              >
                <option value="All">All Statuses</option>
                {COMPENSATION_STATUSES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <span className="text-xs font-bold text-[#172B50]/70">
              Showing {filteredStudentRequests.length} of {studentRequests.length} requests
            </span>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <div className="p-4 border-b border-[#172B5015] flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#172B50]">Centralized Student Compensation Queue</h3>
              <div className="flex items-center gap-3 text-[11px] font-bold text-[#172B50]/70">
                <span>Pending: {studentRequests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length}</span>
                <span>•</span>
                <span>Scheduled: {studentRequests.filter(r => r.status === 'Scheduled').length}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF4E8] text-[#172B50] font-bold uppercase tracking-wider text-[11px] border-b border-[#172B501A]">
                  <tr>
                    <th className="px-4 py-3.5">Student &amp; Parent</th>
                    <th className="px-3 py-3.5">Academy Location</th>
                    <th className="px-3 py-3.5">Missed Class &amp; Date</th>
                    <th className="px-3 py-3.5">Reason &amp; Eligibility</th>
                    <th className="px-3 py-3.5">Source</th>
                    <th className="px-3 py-3.5">Replacement Slot &amp; Coach</th>
                    <th className="px-3 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B5012]">
                  {filteredStudentRequests.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-5 py-10 text-center text-xs text-[#172B50]/60">
                        No compensation requests match the active filters. Click <strong>Create Compensation Request</strong> to log one manually.
                      </td>
                    </tr>
                  ) : (
                    filteredStudentRequests.map(req => {
                      const canAct = !['Rejected', 'Cancelled', 'Completed', 'Expired'].includes(req.status);
                      return (
                        <tr key={req.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                          <td className="px-4 py-4">
                            <span className="font-bold text-[#172B50] block text-[13px]">{req.studentName}</span>
                            <span className="text-[11px] text-[#172B50]/75 block">{req.parentName || 'Parent on file'}</span>
                            <span className="text-[10px] font-mono text-[#172B50]/50 block">{req.id} • {req.appliedOn}</span>
                          </td>

                          <td className="px-3 py-4">
                            <span className="inline-flex items-center gap-1 font-bold text-[#172B50]">
                              <MapPin className="w-3 h-3 text-[#F4510B]" />
                              {req.center || req.location || '-'}
                            </span>
                            <span className="text-[10px] text-[#172B50]/65 block mt-0.5">{req.program}</span>
                          </td>

                          <td className="px-3 py-4">
                            <span className="font-bold text-[#172B50] block">{req.missedClass}</span>
                            <span className="text-[11px] text-[#F4510B] font-semibold block">{req.missedDate}</span>
                          </td>

                          <td className="px-3 py-4 max-w-[210px]">
                            <p className="text-[11px] text-[#172B50] font-medium leading-snug line-clamp-2">{req.reason}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-1 ${
                              (req.eligibility || '').toLowerCase().includes('expired')
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {req.eligibility || 'Eligible'}
                            </span>
                          </td>

                          <td className="px-3 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              req.requestSource === 'Admin'
                                ? 'bg-[#172B50] text-white'
                                : 'bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30]'
                            }`}>
                              {req.requestSource || 'Parent'}
                            </span>
                          </td>

                          <td className="px-3 py-4">
                            {req.replacementSlot ? (
                              <div className="space-y-0.5">
                                <span className="text-[11px] font-bold text-[#172B50] block">{req.replacementSlot}</span>
                                <span className="text-[10px] text-[#172B50]/70 block">Coach: {req.replacementCoach || 'Assigned'}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#172B50]/50 italic">Not scheduled yet</span>
                            )}
                          </td>

                          <td className="px-3 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-block ${
                              STATUS_BADGE_MAP[req.status] || 'bg-slate-100 text-slate-700'
                            }`}>
                              {req.status}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setDetailRequest(req);
                                  setDetailAdminNotes(req.adminNotes || req.approvalNotes || '');
                                }}
                                title="View Details"
                                className="px-2 py-1 text-[11px] font-bold bg-[#FFF4E8] text-[#172B50] rounded-lg hover:bg-[#172B50] hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Details</span>
                              </button>

                              {req.status === 'Pending' && (
                                <button
                                  type="button"
                                  onClick={() => updateCompensationRequest(req.id, { status: 'Under Review', approvalNotes: 'Moved to Admin verification review.' })}
                                  className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 text-indigo-800 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
                                >
                                  Review
                                </button>
                              )}

                              {(req.status === 'Pending' || req.status === 'Under Review') && (
                                <button
                                  type="button"
                                  onClick={() => handleApproveOnly(req.id)}
                                  className="px-2.5 py-1 text-[11px] font-bold bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}

                              {(req.status === 'Pending' || req.status === 'Under Review' || req.status === 'Approved') && (
                                <button
                                  type="button"
                                  onClick={() => openScheduleModal(req)}
                                  className="px-2.5 py-1 text-[11px] font-bold bg-[#F4510B] text-white rounded-lg hover:brightness-110 transition-all cursor-pointer"
                                >
                                  Schedule Replacement
                                </button>
                              )}

                              {req.status === 'Scheduled' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openScheduleModal(req)}
                                    className="px-2.5 py-1 text-[11px] font-bold bg-amber-100 text-amber-900 rounded-lg hover:bg-amber-200 transition-colors cursor-pointer"
                                  >
                                    Reschedule / Coach
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMarkCompleted(req.id)}
                                    className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                                  >
                                    Complete
                                  </button>
                                </>
                              )}

                              {canAct && (
                                <button
                                  type="button"
                                  onClick={() => updateCompensationRequest(req.id, { status: 'Cancelled', approvalNotes: 'Cancelled by Academy Admin.' })}
                                  title="Cancel Request"
                                  className="px-2 py-1 text-[11px] font-bold bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Coach Compensation Classes */}
      {currentTab === 'coach_compensation' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h2 className="text-base font-extrabold text-[#172B50]">Coach Absence & Session Coverage</h2>
              <p className="text-xs text-[#172B50]/70 mt-0.5">Manage missed coach classes, assign substitute coaches or schedule makeup drills</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCoachCompOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-xs hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Coach Coverage</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF4E8] text-[#172B50] font-bold uppercase tracking-wider text-[11px] border-b border-[#172B501A]">
                <tr>
                  <th className="px-5 py-3.5">Coach & Reason</th>
                  <th className="px-4 py-3.5">Missed Session</th>
                  <th className="px-4 py-3.5">Coverage Action</th>
                  <th className="px-4 py-3.5">Replacement Slot</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B5012]">
                {coachComps.map(cc => (
                  <tr key={cc.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-[#172B50] block">{cc.coachName}</span>
                      <span className="text-[11px] text-[#172B50]/70 block">{cc.reason}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-[#172B50] block">{cc.missedSession}</span>
                      <span className="text-[11px] text-[#F4510B] font-semibold block">{cc.missedDate}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-[#172B50] block">{cc.coverageType}</span>
                      <span className="text-[10px] text-[#172B50]/70 block">Assigned: {cc.substituteCoach}</span>
                    </td>
                    <td className="px-4 py-3.5 font-medium">{cc.scheduledDate}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        cc.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {cc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {cc.status === 'Scheduled' && (
                        <button
                          type="button"
                          onClick={() => updateCoachCompensation(cc.id, 'Completed')}
                          className="px-3 py-1 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                        >
                          Mark Done
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 5: Audit History */}
      {currentTab === 'compensation_history' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
            <h2 className="text-base font-extrabold text-[#172B50] mb-4">Completed Replacement Sessions Audit</h2>
            <div className="space-y-3">
              {[...studentRequests, ...coachComps].filter(x => x.status === 'Completed').map((comp, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-sm text-[#172B50] block">
                      {comp.studentName ? `Student: ${comp.studentName}` : `Coach Session: ${comp.coachName}`}
                    </span>
                    <p className="text-xs text-[#172B50]/80 mt-0.5">
                      Missed: {comp.missedClass || comp.missedSession} ({comp.missedDate}) &bull; Replaced on {comp.replacementSlot || comp.scheduledDate}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-full uppercase tracking-wider shrink-0">
                    Verified Completed
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedule / Reschedule / Assign Coach / Approve Student Compensation Modal */}
      {selectedRequest && (
        <Modal
          isOpen={approvalModalOpen}
          onClose={() => setApprovalModalOpen(false)}
          title={`${selectedRequest.status === 'Scheduled' ? 'Reschedule Replacement Class' : 'Review & Schedule Replacement'} (${selectedRequest.id})`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#FFF4E8] border border-[#172B5018] space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-[#172B50] text-sm">{selectedRequest.studentName}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#172B50] text-white">
                  {selectedRequest.requestSource || 'Parent'} Request
                </span>
              </div>
              <span className="text-[#172B50]/80 block">
                Parent: {selectedRequest.parentName} {selectedRequest.parentEmail ? `(${selectedRequest.parentEmail})` : ''}
              </span>
              <span className="text-[#F4510B] font-bold block">
                Missed: {selectedRequest.missedClass} • {selectedRequest.missedDate} • {selectedRequest.center || selectedRequest.location}
              </span>
              <p className="text-[#172B50] mt-1 pt-1 border-t border-[#172B5010]">
                <strong>Reason:</strong> {selectedRequest.reason}
              </p>
            </div>

            {repConflict.hasConflict && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{repConflict.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">Replacement Date *</label>
                <input
                  type="date"
                  value={repDate}
                  onChange={(e) => setRepDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">Academy Location *</label>
                <select
                  value={repLocation}
                  onChange={(e) => setRepLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50]"
                >
                  {activeLocations.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">Start Time *</label>
                <input
                  type="time"
                  value={repStartTime}
                  onChange={(e) => setRepStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">End Time *</label>
                <input
                  type="time"
                  value={repEndTime}
                  onChange={(e) => setRepEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">Sports Program *</label>
                <select
                  value={repProgram}
                  onChange={(e) => setRepProgram(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50]"
                >
                  {(data.programs || []).map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">Training Batch</label>
                <select
                  value={repBatchId}
                  onChange={(e) => setRepBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50]"
                >
                  <option value="">Dedicated Compensation Slot</option>
                  {repFilteredBatches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Assign Available Replacement Coach *</label>
              <select
                value={repCoachId}
                onChange={(e) => setRepCoachId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50]"
              >
                {(data.coaches || []).map(c => (
                  <option key={c.id} value={c.id}>{c.name} • {c.center} ({c.specialization})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Admin Notes (Synced to Parent &amp; Coach)</label>
              <textarea
                rows={2}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs text-[#172B50]"
                placeholder="Confirmation instructions for Parent and Coach..."
              />
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-[#172B5015]">
              <button
                type="button"
                onClick={handleReject}
                className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                Reject Request
              </button>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleApproveOnly(selectedRequest.id, approvalNotes)}
                  className="px-3.5 py-2 text-xs font-bold bg-[#172B50] text-white rounded-xl hover:brightness-110 cursor-pointer"
                >
                  Approve Only
                </button>
                <button
                  type="button"
                  disabled={repConflict.hasConflict}
                  onClick={handleScheduleReplacementSubmit}
                  className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-xs hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  Confirm &amp; Schedule Replacement
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin Manual Compensation Request Modal */}
      <Modal
        isOpen={isManualCompOpen}
        onClose={() => setIsManualCompOpen(false)}
        title="Create Manual Compensation Request"
        subtitle="Admin entry for student replacement session eligibility"
        size="md"
      >
        <form onSubmit={handleManualCompSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Academy Location *</label>
              <select
                required
                value={manualLocation}
                onChange={(e) => {
                  const nextLoc = e.target.value;
                  setManualLocation(nextLoc);
                  const firstStu = (data.students || []).find(s => s.center === nextLoc);
                  if (firstStu) handleManualStudentChange(firstStu.id);
                  else {
                    setManualStudentId('');
                    setManualParentId('');
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50]"
              >
                {activeLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Student *</label>
              <select
                required
                value={manualStudentId}
                onChange={(e) => handleManualStudentChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50]"
              >
                <option value="">Select Student</option>
                {manualFilteredStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.program})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Parent / Guardian (Auto-linked)</label>
              <select
                value={manualParentId}
                onChange={(e) => setManualParentId(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50]"
              >
                <option value="">Auto-linked / Walk-in Parent</option>
                {(data.parents || []).map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.phone || p.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Sports Program *</label>
              <select
                required
                value={manualProgram}
                onChange={(e) => setManualProgram(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50]"
              >
                {(data.programs || []).map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Training Batch</label>
              <select
                value={manualBatchId}
                onChange={(e) => {
                  const id = e.target.value;
                  setManualBatchId(id);
                  const b = (data.classes || []).find(c => c.id === id);
                  if (b) setManualMissedSession(b.name);
                }}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50]"
              >
                <option value="">General Program Batch</option>
                {manualFilteredBatches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Missed Class Date *</label>
              <input
                type="date"
                required
                value={manualMissedDate}
                onChange={(e) => setManualMissedDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Missed Session Label *</label>
              <input
                type="text"
                required
                value={manualMissedSession}
                onChange={(e) => setManualMissedSession(e.target.value)}
                placeholder="e.g. Evening Batch A (5:00 PM)"
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs text-[#172B50]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Reason Category *</label>
              <select
                value={manualReasonCategory}
                onChange={(e) => setManualReasonCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50]"
              >
                {COMPENSATION_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">Reason / Explanation *</label>
            <input
              type="text"
              required
              value={manualReasonDetails}
              onChange={(e) => setManualReasonDetails(e.target.value)}
              placeholder="Explain missed session reason..."
              className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs text-[#172B50]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">Admin Internal Notes</label>
            <textarea
              rows={2}
              value={manualAdminNotes}
              onChange={(e) => setManualAdminNotes(e.target.value)}
              placeholder="Optional internal approval/eligibility remarks..."
              className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs text-[#172B50]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#172B5015]">
            <button
              type="button"
              onClick={() => setIsManualCompOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-xs hover:brightness-110 cursor-pointer"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Request Details & Admin Notes Modal */}
      {detailRequest && (
        <Modal
          isOpen={Boolean(detailRequest)}
          onClose={() => setDetailRequest(null)}
          title={`Compensation Request Details • ${detailRequest.id}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#FFF4E8]/60 border border-[#172B5015]">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50]/60 block">Student</span>
                <span className="font-extrabold text-[#172B50]">{detailRequest.studentName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50]/60 block">Parent</span>
                <span className="font-bold text-[#172B50]">{detailRequest.parentName || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50]/60 block">Location &amp; Program</span>
                <span className="font-bold text-[#172B50]">{detailRequest.center || detailRequest.location} • {detailRequest.program}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50]/60 block">Source &amp; Status</span>
                <span className="font-extrabold text-[#F4510B]">{detailRequest.requestSource || 'Parent'} • {detailRequest.status}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50]/60 block">Missed Session</span>
                <span className="font-bold text-[#172B50]">{detailRequest.missedClass} ({detailRequest.missedDate})</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50]/60 block">Replacement Slot</span>
                <span className="font-bold text-[#172B50]">{detailRequest.replacementSlot || 'Pending Scheduling'}</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-[#172B50] block mb-1">Reason &amp; Eligibility</span>
              <p className="p-3 rounded-xl bg-slate-50 border border-[#172B5012] text-[#172B50]">
                {detailRequest.reason} <span className="ml-2 font-bold text-emerald-700">({detailRequest.eligibility})</span>
              </p>
            </div>

            <div>
              <label className="font-bold text-[#172B50] block mb-1">Admin Notes</label>
              <textarea
                rows={2}
                value={detailAdminNotes}
                onChange={(e) => setDetailAdminNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#172B5020] text-xs text-[#172B50]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#172B5015]">
              <button
                type="button"
                onClick={() => setDetailRequest(null)}
                className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  updateCompensationRequest(detailRequest.id, {
                    adminNotes: detailAdminNotes,
                    approvalNotes: detailAdminNotes,
                  });
                  setDetailRequest(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-[#172B50] text-white rounded-xl cursor-pointer"
              >
                Save Notes
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Coach Coverage Modal */}
      <Modal
        isOpen={isCoachCompOpen}
        onClose={() => setIsCoachCompOpen(false)}
        title="Assign Coach Session Coverage"
        size="md"
      >
        <form onSubmit={handleCreateCoachCompSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">Primary Absent Coach *</label>
            <select
              value={compCoachId}
              onChange={(e) => setCompCoachId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
            >
              {data.coaches.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.center}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">Missed Session / Batch *</label>
            <input
              type="text"
              required
              value={missedSessionName}
              onChange={(e) => setMissedSessionName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">Date of Absence *</label>
            <input
              type="date"
              required
              value={missedDate}
              onChange={(e) => setMissedDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">Substitute Coach Assigned *</label>
            <select
              value={substituteCoachName}
              onChange={(e) => setSubstituteCoachName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
            >
              {data.coaches.map(c => (
                <option key={c.id} value={c.name}>{c.name} ({c.specialization})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">Replacement Class Timetable *</label>
            <input
              type="text"
              required
              value={compScheduledDate}
              onChange={(e) => setCompScheduledDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#172B5015]">
            <button
              type="button"
              onClick={() => setIsCoachCompOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Confirm Coach Coverage
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
