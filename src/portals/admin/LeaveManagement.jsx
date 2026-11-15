import React, { useState } from 'react';
import { CalendarOff, CheckCircle2, XCircle, Clock, Plus, User } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';

export default function LeaveManagement() {
  const { data, updateLeaveStatus, applyLeave } = useCrm();
  const [filterType, setFilterType] = useState('All'); // 'All' | 'Student' | 'Coach'
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  // Form states
  const [applicantName, setApplicantName] = useState(data.students[0]?.name || '');
  const [type, setType] = useState('Student');
  const [startDate, setStartDate] = useState('2026-11-20');
  const [endDate, setEndDate] = useState('2026-11-22');
  const [reason, setReason] = useState('');

  const filteredLeaves = data.leaveRequests.filter(l => {
    if (filterType === 'All') return true;
    return l.type === filterType;
  });

  const handleApply = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    applyLeave({
      type,
      applicantName,
      startDate,
      endDate,
      reason,
      reviewedBy: 'Admin Reviewer'
    });

    setIsApplyOpen(false);
    setReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Leave & Absence Management
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Approve athlete planned leaves and faculty substitute allocations
          </p>
        </div>

        <button
          onClick={() => setIsApplyOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Submit Leave Application</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-[#172B501A] shadow-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['All', 'Student', 'Coach'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === t
                  ? 'bg-[#172B50] text-white shadow-sm'
                  : 'bg-[#FFF4E8] text-[#172B50] hover:bg-white border border-[#172B5015]'
              }`}
            >
              {t} Applications
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-[#F4510B] hidden sm:block">
          {data.leaveRequests.filter(l => l.status === 'Pending').length} Pending Approvals
        </span>
      </div>

      {/* Leave Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLeaves.map(leave => (
          <div key={leave.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card flex flex-col justify-between hover:shadow-dropdown transition-shadow">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    leave.type === 'Coach' ? 'bg-[#172B50] text-white' : 'bg-[#FFF4E8] text-[#172B50] border border-[#172B5020]'
                  }`}>
                    {leave.type} Leave
                  </span>
                  <h3 className="text-sm font-extrabold text-[#172B50] mt-1.5">{leave.applicantName}</h3>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  leave.status === 'Approved'
                    ? 'bg-[#172B50] text-white'
                    : leave.status === 'Rejected'
                    ? 'bg-[#172B50] text-white opacity-60'
                    : 'bg-[#F4510B] text-white'
                }`}>
                  {leave.status}
                </span>
              </div>

              {/* Dates */}
              <div className="mt-3 p-2.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015] text-xs">
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">Duration</span>
                <p className="font-extrabold text-[#172B50] mt-0.5">
                  {leave.startDate} to {leave.endDate}
                </p>
              </div>

              {/* Reason */}
              <div className="mt-3 text-xs">
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">Reason</span>
                <p className="text-[#172B50] opacity-80 mt-0.5 line-clamp-2 italic">"{leave.reason}"</p>
              </div>
            </div>

            {/* Actions for Admin */}
            <div className="mt-4 pt-3 border-t border-[#172B5015] flex items-center justify-between">
              <span className="text-[10px] text-[#172B50] opacity-60">
                Applied: {leave.appliedOn}
              </span>

              {leave.status === 'Pending' ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateLeaveStatus(leave.id, 'Approved', 'Admin Office')}
                    className="px-2.5 py-1 text-xs font-bold bg-[#172B50] text-white rounded-lg hover:bg-[#F4510B] transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateLeaveStatus(leave.id, 'Rejected', 'Admin Office')}
                    className="px-2.5 py-1 text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] rounded-lg hover:bg-white transition-colors"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <span className="text-[11px] font-bold text-[#172B50] opacity-75">
                  Reviewed
                </span>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        title="Apply Leave Application"
        subtitle="Log planned absence for an athlete or coach"
      >
        <form onSubmit={handleApply} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Applicant Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                <option value="Student">Student Athlete</option>
                <option value="Coach">Academy Coach</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Applicant Name *</label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">From Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">To Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Reason for Absence *</label>
            <textarea
              rows="3"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. School exams, family travel, sports clinic..."
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsApplyOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
