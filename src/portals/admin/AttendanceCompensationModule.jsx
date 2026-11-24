import React, { useMemo, useState, useEffect } from 'react';
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
  MapPin,
  Users
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { getCommonLocations } from '../../services/locationService';
import {
  COMPENSATION_REASONS,
  COMPENSATION_STATUSES,
} from '../../services/compensationService';
import AttendanceManagement from './AttendanceManagement';
import CoachAttendanceRegister from './CoachAttendanceRegister';
import StudentCompensationManager from './StudentCompensationManager';
import CoachLeaveRequestsManager from '../common/CoachLeaveRequestsManager';
import SuperCoachAttendanceOverview from '../supercoach/SuperCoachAttendanceOverview';
import AdminLeaveManagementTab from './AdminLeaveManagementTab';
import AdminCompensationSlotManager from './AdminCompensationSlotManager';
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
    currentView, 
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

  const [selectedLoc, setSelectedLoc] = useState('KK NAGAR');

  // Resolve active subtab with resilient fallback to attendance_overview
  const resolveTab = (tab) => {
    if (tab === 'attendance_overview' || tab === 'overview') return 'attendance_overview';
    if (tab === 'location_wise' || tab === 'location_attendance' || tab === 'locations') return 'location_wise';
    if (tab === 'student_att' || tab === 'student_attendance' || tab === 'attendance') return 'student_attendance';
    if (tab === 'coach_att' || tab === 'coach_attendance') return 'coach_attendance';
    if (tab === 'leave_requests' || tab === 'leaves' || tab === 'coach_leaves' || tab === 'student_leaves') return 'leave_requests';
    if (tab === 'compensation_management' || tab === 'student_compensation' || tab === 'compensation' || tab === 'slots') return 'compensation_management';
    if (currentView === 'leaves' || currentView === 'coach_leaves') return 'leave_requests';
    return 'attendance_overview';
  };

  const currentTab = resolveTab(activeSubTab);

  useEffect(() => {
    if (activeSubTab !== currentTab && setActiveSubTab) {
      setActiveSubTab(currentTab);
    }
  }, [activeSubTab, currentTab, setActiveSubTab]);

  const pendingLeavesCount = (data.studentLeaveRequests || []).filter(r => r.status === 'Pending').length + 
    (data.coachLeaveRequests || []).filter(r => r.status === 'Pending' || r.status === 'Pending Admin Review' || r.status === 'Pending Admin Final Approval').length;
  
  const pendingCompCount = (data.compensationRequests || []).filter(r => r.status === 'Pending').length;

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
  const [substituteCoachName, setSubstituteCoachName] = useState((data.coaches || [])[0]?.name || 'Unassigned Coach');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B20] flex items-center justify-center shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5 text-[#F4510B]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight">
              Attendance &amp; Compensation Classes
            </h1>
          </div>
        </div>

        {/* Tab Switcher: 6 Tabs matching Admin Centralized Attendance Management */}
        <div className="flex items-center bg-white p-1 rounded-full border border-[#172B5018] shadow-2xs self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'attendance_overview', label: 'Attendance Overview' },
            { id: 'location_wise', label: 'Location Attendance' },
            { id: 'student_attendance', label: 'Student Register' },
            { id: 'coach_attendance', label: 'Coach Attendance' },
            { 
              id: 'leave_requests', 
              label: `Leave Requests${pendingLeavesCount > 0 ? ` (${pendingLeavesCount})` : ''}` 
            },
            { 
              id: 'compensation_management', 
              label: `Compensation Management${pendingCompCount > 0 ? ` (${pendingCompCount})` : ''}` 
            },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`inline-flex items-center justify-center px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentTab === tab.id
                  ? 'bg-[#F4510B] text-white shadow-xs'
                  : 'text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUBTAB 1: Attendance Overview */}
      {currentTab === 'attendance_overview' && (
        <SuperCoachAttendanceOverview allowedLocations={['KK NAGAR', 'KILPAUK', 'MAHALINGAPURAM', 'ANNA NAGAR', 'KOLATHUR']} />
      )}

      {/* SUBTAB 2: Location-wise Attendance strictly isolating records */}
      {currentTab === 'location_wise' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#172B501A] shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#F4510B]" />
                <div>
                  <h3 className="text-sm font-extrabold text-[#172B50]">Location-wise Attendance Isolation</h3>
                  <p className="text-xs text-gray-500">Strictly isolates student rosters, batches, and attendance marks to the selected center</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#F4510B] bg-[#FFF4E8] px-3 py-1 rounded-full border border-[#F4510B30] self-start sm:self-auto">
                Selected: {selectedLoc}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
              {['KK NAGAR', 'KILPAUK', 'MAHALINGAPURAM', 'ANNA NAGAR', 'KOLATHUR'].map(loc => {
                const isSelected = selectedLoc === loc;
                const locStudentsCount = (data.students || []).filter(s => s.center === loc).length;
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setSelectedLoc(loc)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#172B50] text-white shadow-sm ring-2 ring-[#172B50]'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{loc}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isSelected ? 'bg-[#F4510B] text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {locStudentsCount} Students
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <AttendanceManagement
            key={selectedLoc}
            initialLocation={selectedLoc}
            allowedLocations={[selectedLoc]}
            fixedLocation={true}
          />
        </div>
      )}

      {/* SUBTAB 3: Student Attendance Register */}
      {currentTab === 'student_attendance' && (
        <AttendanceManagement />
      )}

      {/* SUBTAB 4: Coach Attendance */}
      {currentTab === 'coach_attendance' && (
        <CoachAttendanceRegister />
      )}

      {/* SUBTAB 5: Leave Requests (Centralized Student Leaves & Coach Leaves) */}
      {currentTab === 'leave_requests' && (
        <AdminLeaveManagementTab />
      )}

      {/* SUBTAB 6: Compensation Class Management */}
      {currentTab === 'compensation_management' && (
        <AdminCompensationSlotManager />
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
                <label className="block text-xs font-bold text-[#172B50] mb-1">Batches</label>
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
              <label className="block text-xs font-bold text-[#172B50] mb-1">Batches</label>
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
