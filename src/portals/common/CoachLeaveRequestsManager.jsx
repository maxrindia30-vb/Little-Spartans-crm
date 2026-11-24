import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Check,
  X,
  FileText,
  MapPin,
  User,
  Users,
  Paperclip,
  ChevronDown,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import { getCommonLocations } from '../../services/locationService';
import {
  LEAVE_TYPES,
  LEAVE_STATUSES,
  HALF_DAY_SESSIONS,
  calculateLeaveDurationDays,
  formatLeaveDateRange
} from '../../services/coachLeaveService';

export default function CoachLeaveRequestsManager({
  mode = 'coach', // 'coach' | 'admin' | 'super_coach' | 'super_admin'
  coachProfile: propCoachProfile,
  allowedLocations,
  onLeaveUpdated
}) {
  const {
    data,
    applyCoachLeave,
    reviewCoachLeave,
    deleteCoachLeave,
    addToast,
    currentUser,
    currentPortal
  } = useCrm();

  const commonLocations = getCommonLocations(data);
  const todayYmd = new Date().toISOString().split('T')[0];

  // Resolve coach profile if in coach mode
  const coachProfile = useMemo(() => {
    if (propCoachProfile) return propCoachProfile;
    if (currentUser?.role === 'coach') {
      const match = (data.coaches || []).find(
        (c) => c.id === currentUser.id || c.email === currentUser.email
      );
      if (match) return match;
    }
    return (
      data.coaches?.[0] || {
        id: 'COA-001',
        name: 'Academy Coach',
        center: commonLocations[0]?.name || 'KK NAGAR',
      }
    );
  }, [propCoachProfile, currentUser, data.coaches, commonLocations]);

  // Determine reviewer role / name
  const reviewerName = useMemo(() => {
    if (currentUser?.name) return currentUser.name;
    if (mode === 'super_coach' || mode === 'super_admin' || currentPortal === 'super_coach') {
      return 'Super Admin';
    }
    return 'Admin';
  }, [currentUser, mode, currentPortal]);

  const reviewerRole = useMemo(() => {
    if (mode === 'super_coach' || mode === 'super_admin' || currentPortal === 'super_coach') {
      return 'super_admin';
    }
    return 'admin';
  }, [mode, currentPortal]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('ALL');

  // Modals state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedDetailRequest, setSelectedDetailRequest] = useState(null);
  const [rejectingTarget, setRejectingTarget] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [quickReviewNotes, setQuickReviewNotes] = useState('');

  // Apply Form State
  const [formLeaveType, setFormLeaveType] = useState(LEAVE_TYPES.FULL_DAY);
  const [formHalfDaySession, setFormHalfDaySession] = useState(HALF_DAY_SESSIONS.MORNING);
  const [formStartDate, setFormStartDate] = useState(todayYmd);
  const [formEndDate, setFormEndDate] = useState(todayYmd);
  const [formReason, setFormReason] = useState('');
  const [formAttachmentName, setFormAttachmentName] = useState('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState('');

  // Handle Opening Apply Modal with auto-filled coach credentials
  const handleOpenApplyModal = () => {
    setFormLeaveType(LEAVE_TYPES.FULL_DAY);
    setFormHalfDaySession(HALF_DAY_SESSIONS.MORNING);
    setFormStartDate(todayYmd);
    setFormEndDate(todayYmd);
    setFormReason('');
    setFormAttachmentName('');
    setFormAttachmentUrl('');
    setIsApplyModalOpen(true);
  };

  // Submit Leave Request (Coach Portal)
  const handleSubmitLeave = (e) => {
    e.preventDefault();
    if (!formReason.trim()) {
      addToast('Please provide a reason for the leave request.', 'error');
      return;
    }
    if (formStartDate > formEndDate) {
      addToast('Start Date cannot be after End Date.', 'error');
      return;
    }

    const payload = {
      coachId: coachProfile.id,
      coachName: coachProfile.name,
      location: coachProfile.center || 'KK NAGAR',
      leaveType: formLeaveType,
      halfDaySession: formLeaveType === LEAVE_TYPES.HALF_DAY ? formHalfDaySession : null,
      startDate: formStartDate,
      endDate: formLeaveType === LEAVE_TYPES.HALF_DAY ? formStartDate : formEndDate,
      reason: formReason.trim(),
      attachmentName: formAttachmentName.trim(),
      attachmentUrl: formAttachmentUrl.trim(),
    };

    const res = applyCoachLeave(payload);
    if (res.success) {
      setIsApplyModalOpen(false);
      if (onLeaveUpdated) onLeaveUpdated();
    }
  };

  const isSuperCoach = mode === 'super_coach' || currentPortal === 'super_coach';

  // Approve Request Action (Two-Tier: Super Coach Recommended -> Admin Final Approval)
  const handleApprove = (request, notes = '') => {
    const nextStatus = isSuperCoach ? LEAVE_STATUSES.SUPER_COACH_APPROVED : LEAVE_STATUSES.APPROVED;
    const defaultNote = isSuperCoach
      ? 'Initial review approved by Super Coach. Forwarded for Admin final signoff.'
      : 'Approved with final signoff by Academy Administration.';
    const finalNotes = notes || quickReviewNotes || defaultNote;
    const res = reviewCoachLeave(request.id, {
      status: nextStatus,
      reviewedBy: reviewerName,
      reviewedRole,
      reviewNotes: finalNotes,
    });
    if (res.success) {
      if (selectedDetailRequest?.id === request.id) {
        setSelectedDetailRequest(res.request);
      }
      setQuickReviewNotes('');
      if (onLeaveUpdated) onLeaveUpdated();
    }
  };

  // Reject Request Action
  const handleConfirmReject = () => {
    if (!rejectingTarget) return;
    const nextStatus = isSuperCoach ? LEAVE_STATUSES.SUPER_COACH_REJECTED : LEAVE_STATUSES.REJECTED;
    const defaultNote = isSuperCoach
      ? 'Declined by Super Coach based on training schedule requirements.'
      : 'Declined with final signoff by Academy Administration.';
    const finalNotes = rejectionReasonInput.trim() || defaultNote;
    const res = reviewCoachLeave(rejectingTarget.id, {
      status: nextStatus,
      reviewedBy: reviewerName,
      reviewedRole,
      reviewNotes: finalNotes,
    });
    if (res.success) {
      if (selectedDetailRequest?.id === rejectingTarget.id) {
        setSelectedDetailRequest(res.request);
      }
      setRejectingTarget(null);
      setRejectionReasonInput('');
      if (onLeaveUpdated) onLeaveUpdated();
    }
  };

  // All coach leave requests from single shared CRM database
  const allRequests = useMemo(() => {
    return data.coachLeaveRequests || [];
  }, [data.coachLeaveRequests]);

  // Scoped requests based on mode
  const scopedRequests = useMemo(() => {
    if (mode === 'coach') {
      // Coach strictly views their own requests
      return allRequests.filter(
        (r) =>
          r.coachId === coachProfile.id ||
          (r.coachName && coachProfile.name && r.coachName.toLowerCase() === coachProfile.name.toLowerCase())
      );
    }
    // Super Coach / Super Admin / Admin: view all, optionally filtered by allowedLocations
    if (allowedLocations && allowedLocations.length > 0 && !allowedLocations.includes('All')) {
      return allRequests.filter((r) => allowedLocations.includes(r.location || r.center));
    }
    return allRequests;
  }, [allRequests, mode, coachProfile, allowedLocations]);

  // Filtered requests based on user filters & search
  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return scopedRequests.filter((req) => {
      const matchSearch =
        !q ||
        req.id.toLowerCase().includes(q) ||
        (req.coachName || '').toLowerCase().includes(q) ||
        (req.coachId || '').toLowerCase().includes(q) ||
        (req.reason || '').toLowerCase().includes(q) ||
        (req.location || '').toLowerCase().includes(q);

      const matchStatus = statusFilter === 'ALL' || req.status === statusFilter;
      const matchLocation = locationFilter === 'ALL' || (req.location || req.center) === locationFilter;
      const matchType = leaveTypeFilter === 'ALL' || req.leaveType === leaveTypeFilter;

      return matchSearch && matchStatus && matchLocation && matchType;
    });
  }, [scopedRequests, searchQuery, statusFilter, locationFilter, leaveTypeFilter]);

  // Metrics summary
  const metrics = useMemo(() => {
    const total = scopedRequests.length;
    const pending = scopedRequests.filter((r) => r.status === LEAVE_STATUSES.PENDING).length;
    const superCoachApproved = scopedRequests.filter((r) => r.status === LEAVE_STATUSES.SUPER_COACH_APPROVED).length;
    const approved = scopedRequests.filter((r) => r.status === LEAVE_STATUSES.APPROVED).length;
    const rejected = scopedRequests.filter((r) => r.status === LEAVE_STATUSES.REJECTED || r.status === LEAVE_STATUSES.SUPER_COACH_REJECTED).length;
    return { total, pending, superCoachApproved, approved, rejected };
  }, [scopedRequests]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Header & Quick Apply Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B501A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#F4510B] bg-[#FFF4E8] px-2.5 py-0.5 rounded-full border border-[#F4510B25]">
              {mode === 'coach' ? 'Coach Portal' : mode === 'super_coach' || mode === 'super_admin' ? 'Super Admin Portal' : 'Admin Portal'}
            </span>
            <span className="text-xs font-bold text-[#172B50]/60">• Synchronized Leave System</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight mt-1">
            {mode === 'coach' ? 'Coach Leave Requests & Attendance' : 'Coach Leave Request Management'}
          </h2>
          <p className="text-xs sm:text-[13px] text-[#172B50]/70 mt-0.5">
            {mode === 'coach'
              ? 'Submit leave requests with auto-filled credentials. Approved leaves automatically reflect in the attendance register.'
              : 'Review and govern faculty leave applications across academy centers. Approved leaves directly lock coach attendance.'}
          </p>
        </div>

        {/* Action Button: Apply for Leave */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenApplyModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#F4510B] text-white shadow-xs hover:bg-[#E04505] active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Requests */}
        <div className="bg-white rounded-2xl p-4 border border-[#172B5015] shadow-2xs">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#172B50]/65 block">
            {mode === 'coach' ? 'My Applications' : 'Total Requests'}
          </span>
          <p className="text-2xl sm:text-3xl font-black text-[#172B50] mt-1">{metrics.total}</p>
          <span className="text-[10px] text-[#172B50]/50 font-medium">All historical leaves</span>
        </div>

        {/* Pending Review */}
        <div className="bg-[#FFFBEB] rounded-2xl p-4 border border-amber-200/80 shadow-2xs">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-900 block flex items-center justify-between">
            <span>Pending Review</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </span>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">{metrics.pending}</p>
          <span className="text-[10px] text-amber-800/80 font-medium">Awaiting decision</span>
        </div>

        {/* Approved */}
        <div className="bg-[#F0FDF4] rounded-2xl p-4 border border-emerald-200/80 shadow-2xs">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-900 block flex items-center justify-between">
            <span>Approved</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">{metrics.approved}</p>
          <span className="text-[10px] text-emerald-800/80 font-medium">Locks attendance register</span>
        </div>

        {/* Rejected */}
        <div className="bg-[#FFF1F2] rounded-2xl p-4 border border-rose-200/80 shadow-2xs">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-rose-900 block flex items-center justify-between">
            <span>Rejected</span>
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
          </span>
          <p className="text-2xl sm:text-3xl font-black text-rose-700 mt-1">{metrics.rejected}</p>
          <span className="text-[10px] text-rose-800/80 font-medium">Review notes logged</span>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#172B5015] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#172B50]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              mode === 'coach'
                ? 'Search by request ID, dates, or reason...'
                : 'Search coach name, ID, location, or request ID...'
            }
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8F9FA] rounded-xl border border-[#172B5018] text-[#172B50] font-medium outline-none focus:border-[#F4510B] focus:bg-white transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Location filter (Admin / Super Admin view) */}
          {mode !== 'coach' && (
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold bg-[#F8F9FA] text-[#172B50] rounded-xl border border-[#172B5018] outline-none cursor-pointer"
            >
              <option value="ALL">All Locations</option>
              {commonLocations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          )}

          {/* Leave Type filter */}
          <select
            value={leaveTypeFilter}
            onChange={(e) => setLeaveTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-[#F8F9FA] text-[#172B50] rounded-xl border border-[#172B5018] outline-none cursor-pointer"
          >
            <option value="ALL">All Leave Types</option>
            <option value={LEAVE_TYPES.FULL_DAY}>Full Day</option>
            <option value={LEAVE_TYPES.HALF_DAY}>Half Day</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-[#F8F9FA] text-[#172B50] rounded-xl border border-[#172B5018] outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value={LEAVE_STATUSES.PENDING}>Pending</option>
            <option value={LEAVE_STATUSES.APPROVED}>Approved</option>
            <option value={LEAVE_STATUSES.REJECTED}>Rejected</option>
          </select>
        </div>
      </div>

      {/* 4. Leave Requests Table */}
      <div className="bg-white rounded-2xl border border-[#172B5018] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#172B5015] text-[10.5px] font-black uppercase tracking-wider text-[#172B50]/65">
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Coach</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Leave Type</th>
                <th className="py-3.5 px-4">Leave Dates</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172B500C]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#172B50]/60">
                    <Calendar className="w-10 h-10 text-[#172B50]/20 mx-auto mb-2" />
                    <p className="font-bold text-sm text-[#172B50]">No Leave Requests Found</p>
                    <p className="text-xs text-[#172B50]/50 mt-0.5">
                      {mode === 'coach'
                        ? 'Click "Apply for Leave" above to submit a new leave request.'
                        : 'No coach leave applications match the selected filters.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const durationDays = calculateLeaveDurationDays(
                    req.startDate,
                    req.endDate,
                    req.leaveType
                  );

                  return (
                    <tr key={req.id} className="hover:bg-[#FFF4E8]/25 transition-colors">
                      {/* Request ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-black text-[#F4510B] bg-[#FFF5ED] px-2 py-0.5 rounded-md border border-[#F4510B25]">
                          {req.id}
                        </span>
                      </td>

                      {/* Coach Name & ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#172B50] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {(req.coachName || 'C').charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-[#172B50] block">{req.coachName}</span>
                            <span className="font-mono text-[10px] text-[#172B50]/50 font-bold block">
                              {req.coachId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#172B50]">
                          <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                          <span>{req.location || req.center || 'All'}</span>
                        </span>
                      </td>

                      {/* Leave Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                            req.leaveType === LEAVE_TYPES.HALF_DAY
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {req.leaveType}
                          {req.halfDaySession && (
                            <span className="text-[9px] opacity-75">
                              ({req.halfDaySession.includes('Morning') ? 'Morning' : 'Evening'})
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Leave Dates */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-xs font-extrabold text-[#172B50]">
                          {formatLeaveDateRange(req.startDate, req.endDate, req.leaveType)}
                        </div>
                        <span className="text-[10px] text-[#172B50]/50 font-semibold block">
                          {durationDays === 0.5 ? 'Half Day' : `${durationDays} Day${durationDays > 1 ? 's' : ''}`}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="truncate text-xs text-[#172B50] font-medium" title={req.reason}>
                          {req.reason}
                        </p>
                        {req.attachmentName && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-bold mt-0.5">
                            <Paperclip className="w-2.5 h-2.5" />
                            <span>{req.attachmentName}</span>
                          </span>
                        )}
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-[#172B50]/65 text-[11px] font-semibold">
                        {req.appliedOn || (req.submittedAt ? req.submittedAt.split('T')[0] : 'Today')}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {req.status === LEAVE_STATUSES.APPROVED ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved (Final)</span>
                          </span>
                        ) : req.status === LEAVE_STATUSES.SUPER_COACH_APPROVED ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-blue-100 text-blue-900 border border-blue-300" title="Awaiting Admin Final Signoff">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            <span>Super Coach Approved</span>
                          </span>
                        ) : req.status === LEAVE_STATUSES.SUPER_COACH_REJECTED ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Super Coach Rejected</span>
                          </span>
                        ) : req.status === LEAVE_STATUSES.REJECTED ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Rejected by Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending Review</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Full Details */}
                          <button
                            type="button"
                            onClick={() => setSelectedDetailRequest(req)}
                            className="p-1.5 rounded-lg bg-white hover:bg-[#FFF4E8] text-[#172B50] hover:text-[#F4510B] border border-[#172B5018] shadow-2xs transition-colors cursor-pointer"
                            title="View Complete Request Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Review Actions (Two-Tier Workflow) */}
                          {mode !== 'coach' && (
                            (isSuperCoach && req.status === LEAVE_STATUSES.PENDING) ||
                            (!isSuperCoach && (req.status === LEAVE_STATUSES.PENDING || req.status === LEAVE_STATUSES.SUPER_COACH_APPROVED))
                          ) && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(req)}
                                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
                                title={isSuperCoach ? "Super Coach Initial Approval (Forward to Admin)" : "Admin Final Approval"}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingTarget(req);
                                  setRejectionReasonInput('');
                                }}
                                className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-colors cursor-pointer"
                                title={isSuperCoach ? "Super Coach Reject" : "Admin Reject"}
                              >
                                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </>
                          )}

                          {/* Coach Cancel Action (if Pending) */}
                          {mode === 'coach' && req.status === LEAVE_STATUSES.PENDING && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to withdraw this leave request?')) {
                                  deleteCoachLeave(req.id);
                                }
                              }}
                              className="px-2 py-1 rounded-md text-[10px] font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                            >
                              Withdraw
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

      {/* ========================================================= */}
      {/* MODAL 1: Apply for Leave (Coach Submission Form)          */}
      {/* ========================================================= */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Coach Leave"
        subtitle="Submit a formal leave request for Admin & Super Admin review"
      >
        <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
          {/* Read-Only Auto-Filled Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#FFF4E8]/60 rounded-xl border border-[#F4510B25]">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-[#172B50]/65 block mb-0.5">
                Coach Name
              </label>
              <input
                type="text"
                readOnly
                value={coachProfile.name}
                className="w-full px-3 py-1.5 text-xs font-black text-[#172B50] bg-white border border-[#172B5018] rounded-lg outline-none select-none cursor-default"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-[#172B50]/65 block mb-0.5">
                Coach ID &amp; Location
              </label>
              <input
                type="text"
                readOnly
                value={`${coachProfile.id} • ${coachProfile.center || 'KK NAGAR'}`}
                className="w-full px-3 py-1.5 text-xs font-mono font-bold text-[#F4510B] bg-white border border-[#172B5018] rounded-lg outline-none select-none cursor-default"
              />
            </div>
          </div>

          {/* Leave Type: Full Day / Half Day */}
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1.5">
              Leave Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormLeaveType(LEAVE_TYPES.FULL_DAY)}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  formLeaveType === LEAVE_TYPES.FULL_DAY
                    ? 'bg-[#172B50] text-white border-[#172B50] shadow-xs'
                    : 'bg-white text-[#172B50] border-[#172B5020] hover:bg-slate-50'
                }`}
              >
                <span>Full Day Leave</span>
              </button>

              <button
                type="button"
                onClick={() => setFormLeaveType(LEAVE_TYPES.HALF_DAY)}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  formLeaveType === LEAVE_TYPES.HALF_DAY
                    ? 'bg-[#172B50] text-white border-[#172B50] shadow-xs'
                    : 'bg-white text-[#172B50] border-[#172B5020] hover:bg-slate-50'
                }`}
              >
                <span>Half Day Leave</span>
              </button>
            </div>
          </div>

          {/* Half Day Session selector (only if Half Day selected) */}
          {formLeaveType === LEAVE_TYPES.HALF_DAY && (
            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1.5">
              <label className="text-[11px] font-bold text-purple-900 block">
                Select Half Day Session *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormHalfDaySession(HALF_DAY_SESSIONS.MORNING)}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
                    formHalfDaySession === HALF_DAY_SESSIONS.MORNING
                      ? 'bg-purple-700 text-white shadow-2xs'
                      : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  First Half (Morning)
                </button>
                <button
                  type="button"
                  onClick={() => setFormHalfDaySession(HALF_DAY_SESSIONS.EVENING)}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
                    formHalfDaySession === HALF_DAY_SESSIONS.EVENING
                      ? 'bg-purple-700 text-white shadow-2xs'
                      : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  Second Half (Evening)
                </button>
              </div>
            </div>
          )}

          {/* Date Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formStartDate}
                onChange={(e) => {
                  setFormStartDate(e.target.value);
                  if (formLeaveType === LEAVE_TYPES.HALF_DAY || formEndDate < e.target.value) {
                    setFormEndDate(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-[#172B5025] rounded-xl text-[#172B50] outline-none focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">
                {formLeaveType === LEAVE_TYPES.HALF_DAY ? 'Date (Half Day)' : 'End Date *'}
              </label>
              <input
                type="date"
                required
                disabled={formLeaveType === LEAVE_TYPES.HALF_DAY}
                value={formLeaveType === LEAVE_TYPES.HALF_DAY ? formStartDate : formEndDate}
                min={formStartDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-[#172B5025] rounded-xl text-[#172B50] outline-none focus:ring-2 focus:ring-[#F4510B] disabled:opacity-60 disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Reason for Leave */}
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">
              Reason for Leave *
            </label>
            <textarea
              required
              rows={3}
              value={formReason}
              onChange={(e) => setFormReason(e.target.value)}
              placeholder="State the reason for taking leave (e.g., medical appointment, family emergency, tournament travel)..."
              className="w-full px-3 py-2 text-xs bg-white border border-[#172B5025] rounded-xl text-[#172B50] outline-none focus:ring-2 focus:ring-[#F4510B]"
            />
          </div>

          {/* Optional Attachment */}
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">
              Optional Attachment (e.g. Medical Certificate, Letter)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formAttachmentName}
                onChange={(e) => setFormAttachmentName(e.target.value)}
                placeholder="Document reference or file name (e.g., Medical_Note.pdf)"
                className="w-full px-3 py-2 text-xs bg-white border border-[#172B5025] rounded-xl text-[#172B50] outline-none focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#172B5010]">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#F4510B] text-white hover:bg-[#E04505] active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              Submit Leave Request
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: View Complete Request Details & Review           */}
      {/* ========================================================= */}
      {selectedDetailRequest && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDetailRequest(null)}
          title={`Coach Leave Request: ${selectedDetailRequest.id}`}
          subtitle={`Submitted on ${selectedDetailRequest.appliedOn || 'Recent'} by ${selectedDetailRequest.coachName}`}
        >
          <div className="space-y-4 text-xs">
            {/* Status Banner */}
            <div
              className={`p-3.5 rounded-2xl flex items-center justify-between border ${
                selectedDetailRequest.status === LEAVE_STATUSES.APPROVED
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : selectedDetailRequest.status === LEAVE_STATUSES.SUPER_COACH_APPROVED
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : selectedDetailRequest.status === LEAVE_STATUSES.REJECTED || selectedDetailRequest.status === LEAVE_STATUSES.SUPER_COACH_REJECTED
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {selectedDetailRequest.status === LEAVE_STATUSES.APPROVED ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : selectedDetailRequest.status === LEAVE_STATUSES.SUPER_COACH_APPROVED ? (
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                ) : selectedDetailRequest.status === LEAVE_STATUSES.REJECTED || selectedDetailRequest.status === LEAVE_STATUSES.SUPER_COACH_REJECTED ? (
                  <XCircle className="w-5 h-5 text-rose-600" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600" />
                )}
                <div>
                  <span className="font-black text-sm block">Status: {selectedDetailRequest.status}</span>
                  <span className="text-[11px] opacity-80 block">
                    {selectedDetailRequest.status === LEAVE_STATUSES.APPROVED
                      ? 'Approved leave directly locks normal coach attendance for these dates.'
                      : selectedDetailRequest.status === LEAVE_STATUSES.SUPER_COACH_APPROVED
                      ? 'Super Coach has approved this leave. Awaiting Admin final signoff.'
                      : selectedDetailRequest.status === LEAVE_STATUSES.SUPER_COACH_REJECTED
                      ? 'Declined by Super Coach based on schedule requirements.'
                      : selectedDetailRequest.status === LEAVE_STATUSES.REJECTED
                      ? 'Request was rejected by Administration and has no effect on attendance.'
                      : 'Pending review by authorized Super Coach or Administrator.'}
                  </span>
                </div>
              </div>

              <span className="font-mono text-xs font-black uppercase px-2.5 py-1 rounded-lg bg-white/80 border border-current">
                {selectedDetailRequest.leaveType}
              </span>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-[#172B5012]">
              <div>
                <span className="text-[10px] font-black uppercase text-[#172B50]/60 block">Coach Details</span>
                <p className="font-extrabold text-[#172B50] mt-0.5">{selectedDetailRequest.coachName}</p>
                <span className="font-mono text-[10.5px] font-bold text-[#F4510B]">
                  ID: {selectedDetailRequest.coachId}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#172B50]/60 block">Location / Center</span>
                <p className="font-extrabold text-[#172B50] mt-0.5">
                  {selectedDetailRequest.location || selectedDetailRequest.center}
                </p>
                <span className="text-[10.5px] text-[#172B50]/60">Assigned Academy Facility</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#172B50]/60 block">Leave Duration</span>
                <p className="font-extrabold text-[#172B50] mt-0.5">
                  {formatLeaveDateRange(
                    selectedDetailRequest.startDate,
                    selectedDetailRequest.endDate,
                    selectedDetailRequest.leaveType
                  )}
                </p>
                {selectedDetailRequest.halfDaySession && (
                  <span className="text-[10px] font-bold text-purple-700 block">
                    {selectedDetailRequest.halfDaySession}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#172B50]/60 block">Submitted At</span>
                <p className="font-extrabold text-[#172B50] mt-0.5">
                  {selectedDetailRequest.appliedOn || 'Today'}
                </p>
                <span className="text-[10.5px] text-[#172B50]/60">Single Shared Record</span>
              </div>
            </div>

            {/* Reason Box */}
            <div className="p-3 bg-white border border-[#172B5015] rounded-xl space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#172B50]/65 block">
                Reason for Leave
              </span>
              <p className="text-xs text-[#172B50] font-medium whitespace-pre-wrap leading-relaxed">
                {selectedDetailRequest.reason}
              </p>
            </div>

            {/* Attachment if present */}
            {selectedDetailRequest.attachmentName && (
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-xs font-extrabold text-blue-900 block">
                      {selectedDetailRequest.attachmentName}
                    </span>
                    <span className="text-[10px] text-blue-700">Verified Attachment Record</span>
                  </div>
                </div>
              </div>
            )}

            {/* Decision & Two-Tier Approval Timeline */}
            {selectedDetailRequest.approvalTimeline && selectedDetailRequest.approvalTimeline.length > 0 ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">
                  Two-Tier Approval Audit Timeline
                </span>
                <div className="space-y-2">
                  {selectedDetailRequest.approvalTimeline.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                        item.action.includes('Approved') ? 'bg-emerald-500' : 'bg-rose-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-[#172B50]">{item.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#172B50]/75">By: {item.by} ({item.role})</p>
                        {item.notes && (
                          <p className="text-[11px] text-slate-600 italic mt-0.5">"{item.notes}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedDetailRequest.reviewedBy && (
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 space-y-1 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">
                  Review &amp; Decision History
                </span>
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Reviewed by: {selectedDetailRequest.reviewedBy} ({selectedDetailRequest.reviewedRole || 'Admin'})</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {selectedDetailRequest.reviewedAt ? new Date(selectedDetailRequest.reviewedAt).toLocaleDateString() : 'Recorded'}
                  </span>
                </div>
                {selectedDetailRequest.reviewNotes && (
                  <p className="text-xs text-slate-700 font-medium italic mt-1 bg-white p-2 rounded-lg border border-slate-200">
                    "{selectedDetailRequest.reviewNotes}"
                  </p>
                )}
              </div>
            )}

            {/* Review Actions (Two-Tier Workflow) */}
            {mode !== 'coach' && (
              (isSuperCoach && selectedDetailRequest.status === LEAVE_STATUSES.PENDING) ||
              (!isSuperCoach && (selectedDetailRequest.status === LEAVE_STATUSES.PENDING || selectedDetailRequest.status === LEAVE_STATUSES.SUPER_COACH_APPROVED))
            ) && (
              <div className="p-3.5 bg-[#FFF4E8] rounded-xl border border-[#F4510B25] space-y-2.5">
                <span className="text-xs font-black text-[#172B50] block">
                  {isSuperCoach ? 'Super Coach Initial Recommendation' : 'Admin Final Signoff'}
                </span>
                <input
                  type="text"
                  value={quickReviewNotes}
                  onChange={(e) => setQuickReviewNotes(e.target.value)}
                  placeholder="Optional review notes or decision comments..."
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-[#172B5020] text-[#172B50] outline-none"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingTarget(selectedDetailRequest);
                      setRejectionReasonInput('');
                    }}
                    className="px-4 py-1.5 rounded-lg font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-colors cursor-pointer"
                  >
                    {isSuperCoach ? 'Reject (Super Coach)' : 'Reject (Admin Final)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedDetailRequest, quickReviewNotes)}
                    className="px-4 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
                  >
                    {isSuperCoach ? 'Approve & Forward to Admin' : 'Admin Final Approval'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: Rejection Confirmation with Optional Reason      */}
      {/* ========================================================= */}
      {rejectingTarget && (
        <Modal
          isOpen={true}
          onClose={() => setRejectingTarget(null)}
          title={`Reject Leave Request: ${rejectingTarget.id}`}
          subtitle={`Rejecting application from ${rejectingTarget.coachName} (${rejectingTarget.startDate} to ${rejectingTarget.endDate})`}
        >
          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-xs block">Rejection Decision</span>
                <span className="text-[11px] opacity-80 block">
                  This decision will be synced across Admin and Super Admin portals. Coach {rejectingTarget.coachName} will receive a notification.
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">
                Reason for Rejection (Optional but Recommended)
              </label>
              <textarea
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Inadequate substitute coach coverage available for this batch, or vital tournament day scheduled..."
                className="w-full px-3 py-2 text-xs bg-white border border-[#172B5025] rounded-xl text-[#172B50] outline-none focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#172B5010]">
              <button
                type="button"
                onClick={() => setRejectingTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
