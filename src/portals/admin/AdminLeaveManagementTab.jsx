import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  User,
  Users,
  Search,
  Check,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import CoachLeaveRequestsManager from '../common/CoachLeaveRequestsManager';
import Modal from '../../components/common/Modal';

export default function AdminLeaveManagementTab() {
  const { data, reviewStudentLeave, addToast } = useCrm();

  const [activeLeaveSubTab, setActiveLeaveSubTab] = useState('student_leaves'); // 'student_leaves' | 'coach_leaves'
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Review modal
  const [selectedStudentLeave, setSelectedStudentLeave] = useState(null);
  const [decision, setDecision] = useState('Approved');
  const [reviewNotes, setReviewNotes] = useState('');

  const academyLocations = ['KK NAGAR', 'KILPAUK', 'MAHALINGAPURAM', 'ANNA NAGAR', 'KOLATHUR'];

  const studentLeaves = useMemo(() => {
    return (data.studentLeaveRequests || []).filter(l => {
      if (filterLocation !== 'All' && l.location !== filterLocation) return false;
      if (filterStatus !== 'All' && l.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = (l.childName || l.studentName || '').toLowerCase().includes(q) ||
          (l.parentName || '').toLowerCase().includes(q) ||
          (l.reason || '').toLowerCase().includes(q) ||
          (l.id || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [data.studentLeaveRequests, filterLocation, filterStatus, searchQuery]);

  const pendingCount = (data.studentLeaveRequests || []).filter(l => l.status === 'Pending').length;
  const coachPendingCount = (data.coachLeaveRequests || []).filter(r => r.status === 'Pending' || r.status === 'Pending Admin Final Approval').length;

  const handleOpenReview = (leave, initialDecision) => {
    setSelectedStudentLeave(leave);
    setDecision(initialDecision);
    setReviewNotes(initialDecision === 'Approved' ? 'Approved by Admin' : 'Reason not eligible for approved absence');
  };

  const handleConfirmReview = () => {
    if (!selectedStudentLeave) return;
    const res = reviewStudentLeave(selectedStudentLeave.id, {
      status: decision,
      reviewer: 'Admin',
      reviewNotes
    });
    if (res?.success) {
      setSelectedStudentLeave(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-[#F4510B]" />
            <span>Centralized Leave Requests Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#172B50]/70 mt-0.5">
            Review and authorize planned student leaves and faculty leave approvals
          </p>
        </div>
      </div>

      {/* Sub-tab Switcher: Student Leaves vs Coach Leaves */}
      <div className="flex items-center gap-2 border-b border-[#172B5014] pb-2">
        <button
          type="button"
          onClick={() => setActiveLeaveSubTab('student_leaves')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeLeaveSubTab === 'student_leaves'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'text-[#172B50] hover:bg-[#FFF4E8]'
          }`}
        >
          <span>Student Leave Requests</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveLeaveSubTab('coach_leaves')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeLeaveSubTab === 'coach_leaves'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'text-[#172B50] hover:bg-[#FFF4E8]'
          }`}
        >
          <span>Coach Leave Requests</span>
          {coachPendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900">
              {coachPendingCount}
            </span>
          )}
        </button>
      </div>

      {/* VIEW A: STUDENT LEAVES */}
      {activeLeaveSubTab === 'student_leaves' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#172B5014] shadow-card flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#FFF4E8]/60 border border-[#172B5014] rounded-xl px-3 py-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="bg-transparent border-0 font-bold text-[#172B50] outline-none cursor-pointer"
              >
                <option value="All">All Locations</option>
                {academyLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#FFF4E8]/60 border border-[#172B5014] rounded-xl px-3 py-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-[#F4510B]" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent border-0 font-bold text-[#172B50] outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px] flex items-center bg-[#FFF4E8]/30 border border-[#172B5015] rounded-xl px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-[#172B50]/40 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student, parent, or reason..."
                className="w-full bg-transparent border-0 text-xs font-medium text-[#172B50] pl-2 outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B5014] shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#172B5012] text-[#172B50]/60 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Child Name &amp; ID</th>
                    <th className="py-3 px-3">Parent Info</th>
                    <th className="py-3 px-3">Location &amp; Program</th>
                    <th className="py-3 px-3">Leave Dates</th>
                    <th className="py-3 px-3">Reason &amp; Notes</th>
                    <th className="py-3 px-3 text-center">Compensation Requested?</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B500A]">
                  {studentLeaves.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-xs text-[#172B50]/50">
                        No student leave requests found.
                      </td>
                    </tr>
                  ) : (
                    studentLeaves.map(leave => (
                      <tr key={leave.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-[#172B50]">{leave.childName || leave.studentName}</div>
                          <div className="text-[10px] font-mono text-[#F4510B]">{leave.childId || leave.studentId}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-[#172B50]">{leave.parentName}</div>
                          <div className="text-[10px] text-[#172B50]/60">{leave.parentId}</div>
                        </td>
                        <td className="py-3.5 px-3 text-[#172B50]/80">
                          {leave.location} • {leave.program}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-[#172B50]">
                          {leave.startDate} {leave.endDate !== leave.startDate ? `to ${leave.endDate}` : ''}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-[#172B50]">{leave.reason}</div>
                          {leave.notes && <div className="text-[10px] text-[#172B50]/60 truncate max-w-[150px]">{leave.notes}</div>}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {leave.requestCompensation ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800">
                              Yes ({leave.preferredCompensationDate || 'Preferred'})
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#172B50]/40">No</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            leave.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          {leave.status === 'Pending' ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenReview(leave, 'Approved')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenReview(leave, 'Rejected')}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                <X className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#172B50]/60 font-semibold">
                              Reviewed ({leave.reviewedBy || 'Admin'})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: COACH LEAVES */}
      {activeLeaveSubTab === 'coach_leaves' && (
        <CoachLeaveRequestsManager mode="admin" />
      )}

      {/* MODAL: REVIEW STUDENT LEAVE */}
      {selectedStudentLeave && (
        <Modal
          isOpen={!!selectedStudentLeave}
          onClose={() => setSelectedStudentLeave(null)}
          title={`Review Leave: ${selectedStudentLeave.childName || selectedStudentLeave.studentName}`}
          subtitle={`Requested for ${selectedStudentLeave.startDate} • Reason: ${selectedStudentLeave.reason}`}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Decision</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDecision('Approved')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    decision === 'Approved'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-[#172B50] border-[#172B5018] hover:bg-[#FFF4E8]'
                  }`}
                >
                  Approve Leave
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('Rejected')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    decision === 'Rejected'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-[#172B50] border-[#172B5018] hover:bg-[#FFF4E8]'
                  }`}
                >
                  Reject Leave
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">
                Review Notes &amp; Feedback for Parent
              </label>
              <textarea
                rows="2"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full bg-white border border-[#172B5018] rounded-xl px-3 py-2 text-xs font-medium text-[#172B50] outline-none resize-none"
              />
            </div>

            <div className="pt-3 border-t border-[#172B5010] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedStudentLeave(null)}
                className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReview}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs hover:brightness-110 cursor-pointer ${
                  decision === 'Approved' ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              >
                Confirm {decision}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
