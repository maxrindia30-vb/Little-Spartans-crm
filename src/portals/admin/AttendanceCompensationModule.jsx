import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import AttendanceManagement from './AttendanceManagement';
import Modal from '../../components/common/Modal';

export default function AttendanceCompensationModule() {
  const { 
    data, 
    activeSubTab, 
    setActiveSubTab, 
    updateCompensationStatus, 
    createCoachCompensation,
    updateCoachCompensation,
    addToast 
  } = useCrm();

  // Active subtab: 'student_attendance' | 'coach_attendance' | 'student_compensation' | 'coach_compensation' | 'compensation_history'
  const currentTab = activeSubTab || 'student_attendance';

  // Modal for Admin Approval & Slot Scheduling
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [slotDate, setSlotDate] = useState('Saturday, Nov 21 (10:00 AM - 11:15 AM)');
  const [replacementCoach, setReplacementCoach] = useState('Coach Vikram Singh');
  const [approvalNotes, setApprovalNotes] = useState('Approved replacement slot in weekend batch.');

  // Modal for Coach Missed Session Replacement
  const [isCoachCompOpen, setIsCoachCompOpen] = useState(false);
  const [compCoachId, setCompCoachId] = useState('COACH-1');
  const [missedSessionName, setMissedSessionName] = useState('Gymnastics Batch A');
  const [missedDate, setMissedDate] = useState('2026-11-20');
  const [coverageType, setCoverageType] = useState('Substitute Coach Assigned');
  const [substituteCoachName, setSubstituteCoachName] = useState('Coach Rahul Dev');
  const [compScheduledDate, setCompScheduledDate] = useState('2026-11-22 (9:00 AM)');

  const handleApprove = () => {
    if (!selectedRequest) return;
    updateCompensationStatus(
      selectedRequest.id,
      'Approved',
      approvalNotes,
      slotDate,
      replacementCoach
    );
    setApprovalModalOpen(false);
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    updateCompensationStatus(
      selectedRequest.id,
      'Rejected',
      approvalNotes || 'Does not meet eligibility guidelines for medical/school leave.'
    );
    setApprovalModalOpen(false);
  };

  const handleMarkCompleted = (id) => {
    updateCompensationStatus(id, 'Completed', 'Student attended scheduled compensation session.');
  };

  const handleCreateCoachCompSubmit = (e) => {
    e.preventDefault();
    const coach = data.coaches.find(c => c.id === compCoachId) || data.coaches[0];
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
          {/* Information Notice */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#172B50] to-[#20365F] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-card">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#F4510B]" />
                <h2 className="text-base font-extrabold tracking-wide">
                  Admin Authority: Student Compensation Approvals
                </h2>
              </div>
              <p className="text-xs text-white/80 mt-1 max-w-2xl leading-relaxed">
                Parents request replacement classes for missed sessions due to illness or school exams. Admin validates eligibility, approves slot capacity, assigns replacement coaches, and tracks attendance.
              </p>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <div className="p-4 border-b border-[#172B5015] flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#172B50]">Active Compensation Requests</h3>
              <span className="text-xs font-semibold text-[#172B50]/60">
                {studentRequests.length} total records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF4E8] text-[#172B50] font-bold uppercase tracking-wider text-[11px] border-b border-[#172B501A]">
                  <tr>
                    <th className="px-5 py-3.5">Student & Parent</th>
                    <th className="px-4 py-3.5">Missed Class & Date</th>
                    <th className="px-4 py-3.5">Reason & Eligibility</th>
                    <th className="px-4 py-3.5">Replacement Slot & Coach</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B5012]">
                  {studentRequests.map(req => (
                    <tr key={req.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-bold text-[#172B50] block text-[13px]">{req.studentName}</span>
                        <span className="text-[11px] text-[#172B50]/70 block">{req.parentName}</span>
                        <span className="text-[10px] text-[#172B50]/50 block">Applied: {req.appliedOn}</span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-bold text-[#172B50] block">{req.missedClass}</span>
                        <span className="text-[11px] text-[#F4510B] font-semibold block">{req.missedDate}</span>
                        <span className="text-[10px] text-[#172B50]/60 block">{req.center}</span>
                      </td>

                      <td className="px-4 py-4 max-w-xs">
                        <p className="text-[11px] text-[#172B50] font-medium leading-relaxed">{req.reason}</p>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
                          {req.eligibility}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {req.replacementSlot ? (
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-[#172B50] block">{req.replacementSlot}</span>
                            <span className="text-[10px] text-[#172B50]/70 block">Trainer: {req.replacementCoach}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#172B50]/50 italic">Slot not scheduled</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-block ${
                          req.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                          req.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          req.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        {req.status === 'Pending' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRequest(req);
                              setApprovalModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-bold bg-[#F4510B] text-white rounded-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                          >
                            Review & Schedule
                          </button>
                        ) : req.status === 'Approved' ? (
                          <button
                            type="button"
                            onClick={() => handleMarkCompleted(req.id)}
                            className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#172B50]/60 font-semibold">Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
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

      {/* Review & Schedule Student Compensation Modal */}
      {selectedRequest && (
        <Modal
          isOpen={approvalModalOpen}
          onClose={() => setApprovalModalOpen(false)}
          title={`Review Compensation Request (${selectedRequest.id})`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-[#FFF4E8] border border-[#172B5018] space-y-1">
              <span className="font-bold text-[#172B50] block text-sm">{selectedRequest.studentName}</span>
              <span className="text-[#172B50]/80 block">Parent: {selectedRequest.parentName} ({selectedRequest.parentEmail})</span>
              <span className="text-[#F4510B] font-semibold block">Missed: {selectedRequest.missedClass} on {selectedRequest.missedDate}</span>
              <p className="text-[#172B50] mt-1 pt-1 border-t border-[#172B5010]">
                <strong>Reason:</strong> {selectedRequest.reason}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Select Available Replacement Slot *
              </label>
              <select
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
              >
                <option value="Saturday, Nov 14 (10:00 AM - 11:15 AM)">Saturday, Nov 14 (10:00 AM - 11:15 AM) - Indiranagar</option>
                <option value="Sunday, Nov 15 (4:00 PM - 5:30 PM)">Sunday, Nov 15 (4:00 PM - 5:30 PM) - Koramangala</option>
                <option value="Wednesday, Nov 18 (5:00 PM - 6:15 PM)">Wednesday, Nov 18 (5:00 PM - 6:15 PM) - Indiranagar</option>
                <option value="Saturday, Nov 21 (11:30 AM - 12:45 PM)">Saturday, Nov 21 (11:30 AM - 12:45 PM) - HSR Elite</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Assign Replacement Coach *
              </label>
              <select
                value={replacementCoach}
                onChange={(e) => setReplacementCoach(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
              >
                {data.coaches.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.specialization})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Admin Notes for Parent & Coach Notification
              </label>
              <textarea
                rows={2}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
                placeholder="Add special drills instructions or confirmation notes..."
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#172B5015]">
              <button
                type="button"
                onClick={handleReject}
                className="px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                Reject Request
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setApprovalModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Approve & Schedule
                </button>
              </div>
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
