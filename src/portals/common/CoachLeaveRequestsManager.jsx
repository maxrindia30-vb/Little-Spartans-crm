import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CalendarCheck,
  CalendarOff,
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
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Send,
  MessageSquare,
  History,
  Edit3
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import { getCommonLocations } from '../../services/locationService';
import {
  LEAVE_TYPES,
  LEAVE_STATUSES,
  HALF_DAY_SESSIONS,
  calculateLeaveDurationDays,
  formatLeaveDateRange,
  getLeaveStatusBadge,
  isPendingSuperCoach,
  isPendingAdmin,
  isApproved,
  isRejected,
  isReturned,
} from '../../services/coachLeaveService';

export default function CoachLeaveRequestsManager({
  mode = 'coach', // 'coach' | 'admin' | 'super_coach' | 'super_admin'
  coachProfile: propCoachProfile,
  allowedLocations,
  onLeaveUpdated,
}) {
  const {
    data,
    applyCoachLeave,
    reviewCoachLeave,
    resubmitCoachLeave,
    deleteCoachLeave,
    addToast,
    currentUser,
    currentPortal,
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

  // Determine reviewer role and name
  const isSuperCoach = mode === 'super_coach' || currentPortal === 'super_coach';
  const isAdmin = mode === 'admin' || currentPortal === 'admin';

  const reviewerName = useMemo(() => {
    if (currentUser?.name) return currentUser.name;
    if (isSuperCoach) return 'Super Coach (Regional Director)';
    return 'Admin Command Desk';
  }, [currentUser, isSuperCoach]);

  const reviewerId = useMemo(() => {
    if (currentUser?.id) return currentUser.id;
    if (isSuperCoach) return 'SC-001';
    return 'ADM-001';
  }, [currentUser, isSuperCoach]);

  const reviewerRole = useMemo(() => {
    if (isSuperCoach) return 'super_coach';
    return 'admin';
  }, [isSuperCoach]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('ALL');

  // Modals state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedDetailRequest, setSelectedDetailRequest] = useState(null);

  // Super Coach Review Action Modal
  const [superCoachActionTarget, setSuperCoachActionTarget] = useState(null); // request object
  const [superCoachActionType, setSuperCoachActionType] = useState('RECOMMEND'); // 'RECOMMEND' | 'RETURN' | 'REJECT'
  const [superCoachNotes, setSuperCoachNotes] = useState('');

  // Admin Final Review Modal
  const [adminActionTarget, setAdminActionTarget] = useState(null); // request object
  const [adminActionType, setAdminActionType] = useState('APPROVE'); // 'APPROVE' | 'REJECT'
  const [adminNotes, setAdminNotes] = useState('');

  // Coach Edit / Resubmit Modal (when Returned for Correction)
  const [resubmittingTarget, setResubmittingTarget] = useState(null);
  const [resubmitForm, setResubmitForm] = useState({
    startDate: todayYmd,
    endDate: todayYmd,
    leaveType: LEAVE_TYPES.FULL_DAY,
    halfDaySession: HALF_DAY_SESSIONS.MORNING,
    reason: '',
    attachmentName: '',
  });

  // Apply Form State (New Submission)
  const [formLeaveType, setFormLeaveType] = useState(LEAVE_TYPES.FULL_DAY);
  const [formHalfDaySession, setFormHalfDaySession] = useState(HALF_DAY_SESSIONS.MORNING);
  const [formStartDate, setFormStartDate] = useState(todayYmd);
  const [formEndDate, setFormEndDate] = useState(todayYmd);
  const [formReason, setFormReason] = useState('');
  const [formAttachmentName, setFormAttachmentName] = useState('');

  // Handle Opening Apply Modal
  const handleOpenApplyModal = () => {
    setFormLeaveType(LEAVE_TYPES.FULL_DAY);
    setFormHalfDaySession(HALF_DAY_SESSIONS.MORNING);
    setFormStartDate(todayYmd);
    setFormEndDate(todayYmd);
    setFormReason('');
    setFormAttachmentName('');
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
    };

    const res = applyCoachLeave(payload);
    if (res.success) {
      setIsApplyModalOpen(false);
      if (onLeaveUpdated) onLeaveUpdated();
    }
  };

  // Submit Resubmission after Correction
  const handleConfirmResubmit = (e) => {
    e.preventDefault();
    if (!resubmittingTarget) return;
    if (!resubmitForm.reason.trim()) {
      addToast('Please provide the corrected reason for leave.', 'error');
      return;
    }

    const res = resubmitCoachLeave(resubmittingTarget.id, {
      startDate: resubmitForm.startDate,
      endDate: resubmitForm.leaveType === LEAVE_TYPES.HALF_DAY ? resubmitForm.startDate : resubmitForm.endDate,
      leaveType: resubmitForm.leaveType,
      halfDaySession: resubmitForm.leaveType === LEAVE_TYPES.HALF_DAY ? resubmitForm.halfDaySession : null,
      reason: resubmitForm.reason.trim(),
      attachmentName: resubmitForm.attachmentName.trim(),
    });

    if (res.success) {
      setResubmittingTarget(null);
      if (selectedDetailRequest?.id === resubmittingTarget.id) {
        setSelectedDetailRequest(res.request);
      }
      if (onLeaveUpdated) onLeaveUpdated();
    }
  };

  // Open Resubmit Modal
  const handleOpenResubmitModal = (req) => {
    setResubmittingTarget(req);
    setResubmitForm({
      startDate: req.startDate || todayYmd,
      endDate: req.endDate || req.startDate || todayYmd,
      leaveType: req.leaveType || LEAVE_TYPES.FULL_DAY,
      halfDaySession: req.halfDaySession || HALF_DAY_SESSIONS.MORNING,
      reason: req.reason || '',
      attachmentName: req.attachmentName || '',
    });
  };

  // Execute Super Coach Review Action
  const handleExecuteSuperCoachReview = (e) => {
    e.preventDefault();
    if (!superCoachActionTarget) return;

    let targetStatus;
    let defaultNote;

    if (superCoachActionType === 'RECOMMEND') {
      targetStatus = LEAVE_STATUSES.PENDING_ADMIN;
      defaultNote = 'Recommended approval by Super Coach. Replacement coach coverage verified.';
    } else if (superCoachActionType === 'RETURN') {
      targetStatus = LEAVE_STATUSES.RETURNED;
      if (!superCoachNotes.trim()) {
        addToast('Please provide instructions on what needs correction.', 'error');
        return;
      }
      defaultNote = 'Returned to coach for correction.';
    } else {
      targetStatus = LEAVE_STATUSES.SUPER_COACH_REJECTED;
      if (!superCoachNotes.trim()) {
        addToast('Please specify the reason for rejecting this leave request.', 'error');
        return;
      }
      defaultNote = 'Declined by Super Coach based on training schedule and batch commitments.';
    }

    const res = reviewCoachLeave(superCoachActionTarget.id, {
      status: targetStatus,
      reviewerId,
      reviewedBy: reviewerName,
      reviewedRole: 'super_coach',
      reviewNotes: superCoachNotes.trim() || defaultNote,
    });

    if (res.success) {
      if (selectedDetailRequest?.id === superCoachActionTarget.id) {
        setSelectedDetailRequest(res.request);
      }
      setSuperCoachActionTarget(null);
      setSuperCoachNotes('');
      if (onLeaveUpdated) onLeaveUpdated();
    }
  };

  // Execute Admin Final Review Action
  const handleExecuteAdminReview = (e) => {
    e.preventDefault();
    if (!adminActionTarget) return;

    const targetStatus = adminActionType === 'APPROVE' ? LEAVE_STATUSES.APPROVED : LEAVE_STATUSES.REJECTED;
    const defaultNote =
      adminActionType === 'APPROVE'
        ? 'Final approval granted by Academy Administration. Roster and attendance register locked.'
        : 'Final rejection issued by Academy Administration.';

    const res = reviewCoachLeave(adminActionTarget.id, {
      status: targetStatus,
      reviewerId,
      reviewedBy: reviewerName,
      reviewedRole: 'admin',
      reviewNotes: adminNotes.trim() || defaultNote,
    });

    if (res.success) {
      if (selectedDetailRequest?.id === adminActionTarget.id) {
        setSelectedDetailRequest(res.request);
      }
      setAdminActionTarget(null);
      setAdminNotes('');
      if (onLeaveUpdated) onLeaveUpdated();
    }
  };

  // All coach leave requests from single shared CRM state
  const allRequests = useMemo(() => {
    return data.coachLeaveRequests || [];
  }, [data.coachLeaveRequests]);

  // Scoped requests based on mode
  const scopedRequests = useMemo(() => {
    if (mode === 'coach') {
      return allRequests.filter(
        (r) =>
          r.coachId === coachProfile.id ||
          (r.coachName && coachProfile.name && r.coachName.toLowerCase() === coachProfile.name.toLowerCase())
      );
    }
    if (allowedLocations && allowedLocations.length > 0 && !allowedLocations.includes('All')) {
      return allRequests.filter((r) => allowedLocations.includes(r.location || r.center));
    }
    return allRequests;
  }, [allRequests, mode, coachProfile, allowedLocations]);

  // Metrics summary
  const metrics = useMemo(() => {
    const total = scopedRequests.length;
    const pendingSuperCoach = scopedRequests.filter((r) => isPendingSuperCoach(r.status)).length;
    const pendingAdmin = scopedRequests.filter((r) => isPendingAdmin(r.status)).length;
    const returned = scopedRequests.filter((r) => isReturned(r.status)).length;
    const approved = scopedRequests.filter((r) => isApproved(r.status)).length;
    const rejected = scopedRequests.filter((r) => isRejected(r.status)).length;

    return { total, pendingSuperCoach, pendingAdmin, returned, approved, rejected };
  }, [scopedRequests]);

  // Filtered requests based on active tab & filters
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

      let matchTab = true;
      if (activeTab === 'PENDING_SC') {
        matchTab = isPendingSuperCoach(req.status);
      } else if (activeTab === 'PENDING_ADMIN') {
        matchTab = isPendingAdmin(req.status);
      } else if (activeTab === 'RETURNED') {
        matchTab = isReturned(req.status);
      } else if (activeTab === 'APPROVED') {
        matchTab = isApproved(req.status);
      } else if (activeTab === 'REJECTED') {
        matchTab = isRejected(req.status);
      }

      const matchLocation = locationFilter === 'ALL' || (req.location || req.center) === locationFilter;
      const matchType = leaveTypeFilter === 'ALL' || req.leaveType === leaveTypeFilter;

      return matchSearch && matchTab && matchLocation && matchType;
    });
  }, [scopedRequests, searchQuery, activeTab, locationFilter, leaveTypeFilter]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Header & Quick Apply Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B501A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#F4510B] bg-[#FFF4E8] px-2.5 py-0.5 rounded-full border border-[#F4510B25]">
              {mode === 'coach'
                ? 'Coach Portal'
                : isSuperCoach
                ? 'Super Coach Portal'
                : 'Admin Portal'}
            </span>
            <span className="text-xs font-bold text-[#172B50]/60">
              • Sequential Leave Approval Workflow (Coach → Super Coach → Admin)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight mt-1">
            {mode === 'coach'
              ? 'My Leave Applications & Approval Status'
              : isSuperCoach
              ? 'Coach Leave Management & Review Desk'
              : 'Admin Leave Final Approval & Governance'}
          </h2>
          <p className="text-xs sm:text-[13px] text-[#172B50]/70 mt-0.5">
            {mode === 'coach'
              ? 'Submit planned leave requests. Requests are reviewed first by your Super Coach and then given final approval by Admin.'
              : isSuperCoach
              ? 'Review coach absence applications. Recommend approval to forward requests to Admin, return for correction, or reject.'
              : 'Govern forwarded coach leave requests. Admin holds final signoff authority to approve or reject leave across academy centers.'}
          </p>
        </div>

        {/* Action Button: Apply for Leave (visible in coach mode, or quick apply in admin) */}
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total Requests */}
        <div className="bg-white rounded-2xl p-4 border border-[#172B5015] shadow-2xs">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#172B50]/65 block">
            {mode === 'coach' ? 'My Requests' : 'Total Requests'}
          </span>
          <p className="text-2xl sm:text-3xl font-black text-[#172B50] mt-1">{metrics.total}</p>
          <span className="text-[10px] text-[#172B50]/50 font-medium">All historical leaves</span>
        </div>

        {/* Pending Super Coach Review */}
        <div
          onClick={() => setActiveTab('PENDING_SC')}
          className={`rounded-2xl p-4 border shadow-2xs cursor-pointer transition-all ${
            activeTab === 'PENDING_SC' ? 'ring-2 ring-amber-500 bg-[#FFFBEB] border-amber-300' : 'bg-[#FFFBEB]/70 border-amber-200 hover:bg-[#FFFBEB]'
          }`}
        >
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-900 block flex items-center justify-between">
            <span>Pending Super Coach</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </span>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">{metrics.pendingSuperCoach}</p>
          <span className="text-[10px] text-amber-800/80 font-medium">Stage 1: Initial Review</span>
        </div>

        {/* Pending Admin Final Approval */}
        <div
          onClick={() => setActiveTab('PENDING_ADMIN')}
          className={`rounded-2xl p-4 border shadow-2xs cursor-pointer transition-all ${
            activeTab === 'PENDING_ADMIN' ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300' : 'bg-blue-50/70 border-blue-200 hover:bg-blue-50'
          }`}
        >
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-blue-900 block flex items-center justify-between">
            <span>Pending Admin</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          </span>
          <p className="text-2xl sm:text-3xl font-black text-blue-700 mt-1">{metrics.pendingAdmin}</p>
          <span className="text-[10px] text-blue-800/80 font-medium">Stage 2: Final Signoff</span>
        </div>

        {/* Returned for Correction */}
        <div
          onClick={() => setActiveTab('RETURNED')}
          className={`rounded-2xl p-4 border shadow-2xs cursor-pointer transition-all ${
            activeTab === 'RETURNED' ? 'ring-2 ring-orange-500 bg-[#FFF5ED] border-orange-300' : 'bg-[#FFF5ED]/70 border-orange-200 hover:bg-[#FFF5ED]'
          }`}
        >
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-orange-900 block flex items-center justify-between">
            <span>Needs Correction</span>
            <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
          </span>
          <p className="text-2xl sm:text-3xl font-black text-orange-700 mt-1">{metrics.returned}</p>
          <span className="text-[10px] text-orange-800/80 font-medium">Sent back to coach</span>
        </div>

        {/* Final Approved */}
        <div
          onClick={() => setActiveTab('APPROVED')}
          className={`rounded-2xl p-4 border shadow-2xs cursor-pointer transition-all ${
            activeTab === 'APPROVED' ? 'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-300' : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-900 block flex items-center justify-between">
            <span>Approved (Final)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">{metrics.approved}</p>
          <span className="text-[10px] text-emerald-800/80 font-medium">Attendance locked</span>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar with Segmented Status Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-[#172B5015] shadow-2xs space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { key: 'ALL', label: 'All Requests', count: metrics.total },
            {
              key: 'PENDING_SC',
              label: isSuperCoach ? 'Needs My Review' : 'Pending Super Coach',
              count: metrics.pendingSuperCoach,
              highlight: isSuperCoach && metrics.pendingSuperCoach > 0,
            },
            {
              key: 'PENDING_ADMIN',
              label: isAdmin ? 'Awaiting My Signoff' : 'Pending Admin Final',
              count: metrics.pendingAdmin,
              highlight: isAdmin && metrics.pendingAdmin > 0,
            },
            { key: 'RETURNED', label: 'Returned for Correction', count: metrics.returned },
            { key: 'APPROVED', label: 'Final Approved', count: metrics.approved },
            { key: 'REJECTED', label: 'Rejected', count: metrics.rejected },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#172B50] text-white shadow-xs'
                    : tab.highlight
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold hover:bg-amber-200'
                    : 'bg-[#F8F9FA] text-[#172B50]/75 hover:bg-[#FFF4E8] hover:text-[#F4510B]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-[#172B50]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-[#172B500C]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#172B50]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                mode === 'coach'
                  ? 'Search by request ID, dates, or reason...'
                  : 'Search by coach name, coach ID, location, or request ID...'
              }
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8F9FA] rounded-xl border border-[#172B5018] text-[#172B50] font-medium outline-none focus:border-[#F4510B] focus:bg-white transition-all"
            />
          </div>

          {/* Location & Leave Type Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
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

            <select
              value={leaveTypeFilter}
              onChange={(e) => setLeaveTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold bg-[#F8F9FA] text-[#172B50] rounded-xl border border-[#172B5018] outline-none cursor-pointer"
            >
              <option value="ALL">All Leave Types</option>
              <option value={LEAVE_TYPES.FULL_DAY}>Full Day</option>
              <option value={LEAVE_TYPES.HALF_DAY}>Half Day</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Leave Requests Table with Step Journey */}
      <div className="bg-white rounded-2xl border border-[#172B5018] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#172B5015] text-[10.5px] font-black uppercase tracking-wider text-[#172B50]/65">
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Coach</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Leave Type</th>
                <th className="py-3.5 px-4">Dates &amp; Duration</th>
                <th className="py-3.5 px-4">Reason &amp; Attachment</th>
                <th className="py-3.5 px-4">Super Coach Review</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172B500C]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#172B50]/60">
                    <CalendarOff className="w-10 h-10 text-[#172B50]/20 mx-auto mb-2" />
                    <p className="font-bold text-sm text-[#172B50]">No Leave Applications Found</p>
                    <p className="text-xs text-[#172B50]/50 mt-0.5">
                      {mode === 'coach'
                        ? 'Click "Apply for Leave" above to submit a new leave request.'
                        : 'No coach leave applications match the selected status or filters.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const durationDays = calculateLeaveDurationDays(req.startDate, req.endDate, req.leaveType);
                  const badge = getLeaveStatusBadge(req.status);
                  const canSuperCoachAct = isSuperCoach && isPendingSuperCoach(req.status);
                  const canAdminAct = isAdmin && isPendingAdmin(req.status);
                  const isCoachActionNeeded = mode === 'coach' && isReturned(req.status);

                  return (
                    <tr key={req.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
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

                      {/* Dates & Duration */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-xs font-extrabold text-[#172B50]">
                          {formatLeaveDateRange(req.startDate, req.endDate, req.leaveType)}
                        </div>
                        <span className="text-[10px] text-[#172B50]/50 font-semibold block">
                          {durationDays === 0.5 ? 'Half Day' : `${durationDays} Day${durationDays > 1 ? 's' : ''}`}
                        </span>
                      </td>

                      {/* Reason & Attachment */}
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
                        <span className="text-[9.5px] text-[#172B50]/40 block mt-0.5">
                          Submitted: {req.appliedOn || 'Recent'}
                        </span>
                      </td>

                      {/* Super Coach Review Callout */}
                      <td className="py-3 px-4 max-w-xs">
                        {req.superCoachReview ? (
                          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[10.5px]">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-800">
                                {req.superCoachReview.decision}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                {new Date(req.superCoachReview.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="text-[9.5px] text-slate-600 block">
                              By: {req.superCoachReview.reviewerName}
                            </span>
                            {req.superCoachReview.comments && (
                              <p className="text-[10px] text-slate-700 italic truncate mt-0.5" title={req.superCoachReview.comments}>
                                "{req.superCoachReview.comments}"
                              </p>
                            )}
                          </div>
                        ) : isPendingSuperCoach(req.status) ? (
                          <span className="text-[10.5px] text-amber-700 font-medium italic">
                            Awaiting Super Coach Review
                          </span>
                        ) : (
                          <span className="text-[10.5px] text-[#172B50]/40">--</span>
                        )}
                      </td>

                      {/* Current Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black border ${badge.badgeClass}`}
                        >
                          {isApproved(req.status) ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : isPendingAdmin(req.status) ? (
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                          ) : isReturned(req.status) ? (
                            <RotateCcw className="w-3 h-3 text-amber-600" />
                          ) : isRejected(req.status) ? (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                          )}
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Full History & Details */}
                          <button
                            type="button"
                            onClick={() => setSelectedDetailRequest(req)}
                            className="p-1.5 rounded-lg bg-white hover:bg-[#FFF4E8] text-[#172B50] hover:text-[#F4510B] border border-[#172B5018] shadow-2xs transition-colors cursor-pointer"
                            title="View Full Approval History"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Coach Action: Correct & Resubmit */}
                          {isCoachActionNeeded && (
                            <button
                              type="button"
                              onClick={() => handleOpenResubmitModal(req)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-[#F4510B] text-white hover:bg-[#E04505] shadow-2xs transition-all cursor-pointer"
                              title="Correct & Resubmit Leave"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Correct</span>
                            </button>
                          )}

                          {/* Super Coach Actions: Recommend / Return / Reject */}
                          {canSuperCoachAct && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setSuperCoachActionTarget(req);
                                  setSuperCoachActionType('RECOMMEND');
                                  setSuperCoachNotes('Recommended approval. Coaching roster and replacement covered.');
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all cursor-pointer"
                                title="Recommend Approval to Admin"
                              >
                                <Check className="w-3 h-3 stroke-[2.5]" />
                                <span>Recommend</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSuperCoachActionTarget(req);
                                  setSuperCoachActionType('RETURN');
                                  setSuperCoachNotes('');
                                }}
                                className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition-all cursor-pointer"
                                title="Send Back for Correction"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSuperCoachActionTarget(req);
                                  setSuperCoachActionType('REJECT');
                                  setSuperCoachNotes('');
                                }}
                                className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-all cursor-pointer"
                                title="Reject Request"
                              >
                                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </>
                          )}

                          {/* Admin Actions: Final Approve / Final Reject */}
                          {canAdminAct && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setAdminActionTarget(req);
                                  setAdminActionType('APPROVE');
                                  setAdminNotes('Final approval granted. Attendance register locked.');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all cursor-pointer"
                                title="Final Approve Leave"
                              >
                                <Check className="w-3 h-3 stroke-[2.5]" />
                                <span>Final Approve</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setAdminActionTarget(req);
                                  setAdminActionType('REJECT');
                                  setAdminNotes('');
                                }}
                                className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-all cursor-pointer"
                                title="Final Reject Leave"
                              >
                                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </>
                          )}

                          {/* Coach Withdraw Action if still pending */}
                          {mode === 'coach' && isPendingSuperCoach(req.status) && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Withdraw this pending leave request?')) {
                                  deleteCoachLeave(req.id);
                                }
                              }}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
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
        subtitle="Submit a formal leave request for Super Coach & Admin sequential approval"
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

          {/* Workflow Stage Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold block">Approval Process:</span>
              On submission, status will be <strong>"Pending Super Coach Review"</strong>. Once recommended by Super Coach, it automatically moves to <strong>"Pending Admin Final Approval"</strong>.
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

          {/* Half Day Session selector */}
          {formLeaveType === LEAVE_TYPES.HALF_DAY && (
            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1.5">
              <label className="text-[11px] font-bold text-purple-900 block">
                Select Half Day Session *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormHalfDaySession(HALF_DAY_SESSIONS.MORNING)}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
              placeholder="State the reason for taking leave (e.g. medical appointment, tournament travel, family emergency)..."
              className="w-full px-3 py-2 text-xs bg-white border border-[#172B5025] rounded-xl text-[#172B50] outline-none focus:ring-2 focus:ring-[#F4510B]"
            />
          </div>

          {/* Optional Attachment */}
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">
              Optional Attachment (e.g. Medical Certificate, Letter)
            </label>
            <input
              type="text"
              value={formAttachmentName}
              onChange={(e) => setFormAttachmentName(e.target.value)}
              placeholder="Document reference or file name (e.g. Medical_Certificate.pdf)"
              className="w-full px-3 py-2 text-xs bg-white border border-[#172B5025] rounded-xl text-[#172B50] outline-none focus:ring-2 focus:ring-[#F4510B]"
            />
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
      {/* MODAL 2: Super Coach Review Decision Modal                */}
      {/* ========================================================= */}
      {superCoachActionTarget && (
        <Modal
          isOpen={true}
          onClose={() => setSuperCoachActionTarget(null)}
          title={
            superCoachActionType === 'RECOMMEND'
              ? `Recommend Approval: ${superCoachActionTarget.id}`
              : superCoachActionType === 'RETURN'
              ? `Return for Correction: ${superCoachActionTarget.id}`
              : `Reject Leave Request: ${superCoachActionTarget.id}`
          }
          subtitle={`Coach ${superCoachActionTarget.coachName} (${superCoachActionTarget.startDate} to ${superCoachActionTarget.endDate})`}
        >
          <form onSubmit={handleExecuteSuperCoachReview} className="space-y-4 text-xs">
            {/* Action Type Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSuperCoachActionType('RECOMMEND')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  superCoachActionType === 'RECOMMEND'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Check className="w-4 h-4 text-emerald-600 mx-auto mb-1 stroke-[2.5]" />
                <span className="block text-[11px]">Recommend Approval</span>
                <span className="text-[9.5px] opacity-75">Forward to Admin</span>
              </button>

              <button
                type="button"
                onClick={() => setSuperCoachActionType('RETURN')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  superCoachActionType === 'RETURN'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-black ring-1 ring-amber-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <RotateCcw className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <span className="block text-[11px]">Return to Coach</span>
                <span className="text-[9.5px] opacity-75">Request Correction</span>
              </button>

              <button
                type="button"
                onClick={() => setSuperCoachActionType('REJECT')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  superCoachActionType === 'REJECT'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 font-black ring-1 ring-rose-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <X className="w-4 h-4 text-rose-600 mx-auto mb-1 stroke-[2.5]" />
                <span className="block text-[11px]">Reject Leave</span>
                <span className="text-[9.5px] opacity-75">Decline request</span>
              </button>
            </div>

            {/* Request Summary Card */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>{superCoachActionTarget.leaveType} Leave</span>
                <span className="text-slate-500">{superCoachActionTarget.location}</span>
              </div>
              <p className="text-slate-600 font-medium italic">"{superCoachActionTarget.reason}"</p>
            </div>

            {/* Comments Field */}
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">
                {superCoachActionType === 'RECOMMEND'
                  ? 'Review Comments & Replacement Coach Notes (Optional)'
                  : superCoachActionType === 'RETURN'
                  ? 'Correction Instructions for Coach (Mandatory) *'
                  : 'Reason for Rejection (Mandatory) *'}
              </label>
              <textarea
                rows={3}
                required={superCoachActionType !== 'RECOMMEND'}
                value={superCoachNotes}
                onChange={(e) => setSuperCoachNotes(e.target.value)}
                placeholder={
                  superCoachActionType === 'RECOMMEND'
                    ? 'e.g. Replacement coach assigned. Recommended for Admin final approval...'
                    : superCoachActionType === 'RETURN'
                    ? 'e.g. Please adjust end date to return before Sunday finals, or upload proof...'
                    : 'e.g. No substitute coach coverage available during high-demand tournament weekend...'
                }
                className="w-full px-3 py-2 text-xs bg-white border border-[#172B5025] rounded-xl text-[#172B50] outline-none focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#172B5010]">
              <button
                type="button"
                onClick={() => setSuperCoachActionTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
                  superCoachActionType === 'RECOMMEND'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : superCoachActionType === 'RETURN'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {superCoachActionType === 'RECOMMEND'
                  ? 'Confirm & Forward to Admin'
                  : superCoachActionType === 'RETURN'
                  ? 'Send Back for Correction'
                  : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: Admin Final Approval & Signoff Modal             */}
      {/* ========================================================= */}
      {adminActionTarget && (
        <Modal
          isOpen={true}
          onClose={() => setAdminActionTarget(null)}
          title={`Admin Final Authority: ${adminActionTarget.id}`}
          subtitle={`Final Signoff for ${adminActionTarget.coachName} (${adminActionTarget.startDate} to ${adminActionTarget.endDate})`}
        >
          <form onSubmit={handleExecuteAdminReview} className="space-y-4 text-xs">
            {/* Super Coach Prior Review Information */}
            {adminActionTarget.superCoachReview ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 text-blue-900">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span>Super Coach Recommendation: {adminActionTarget.superCoachReview.decision}</span>
                  </span>
                  <span className="text-[10px] text-blue-700 font-mono">
                    {new Date(adminActionTarget.superCoachReview.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-blue-800">
                  Reviewer: <strong>{adminActionTarget.superCoachReview.reviewerName}</strong>
                </p>
                {adminActionTarget.superCoachReview.comments && (
                  <p className="text-[11px] text-blue-900 italic bg-white/70 p-2 rounded-lg border border-blue-200">
                    "{adminActionTarget.superCoachReview.comments}"
                  </p>
                )}
              </div>
            ) : (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium">
                Note: This request has been routed directly for administrative determination.
              </div>
            )}

            {/* Decision Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAdminActionType('APPROVE')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  adminActionType === 'APPROVE'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <span className="block text-xs">Final Approve</span>
                <span className="text-[10px] opacity-75">Locks coach attendance register</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminActionType('REJECT')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  adminActionType === 'REJECT'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 font-black ring-1 ring-rose-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                <span className="block text-xs">Final Reject</span>
                <span className="text-[10px] opacity-75">Declines request permanently</span>
              </button>
            </div>

            {/* Admin Comments */}
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">
                Admin Decision Comments (Optional for Approval, Mandatory for Rejection)
              </label>
              <textarea
                rows={3}
                required={adminActionType === 'REJECT'}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  adminActionType === 'APPROVE'
                    ? 'e.g. Approved with final signoff. Substitute faculty recorded on attendance ledger...'
                    : 'e.g. Leave denied due to mandatory operational requirements...'
                }
                className="w-full px-3 py-2 text-xs bg-white border border-[#172B5025] rounded-xl text-[#172B50] outline-none focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#172B5010]">
              <button
                type="button"
                onClick={() => setAdminActionTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
                  adminActionType === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {adminActionType === 'APPROVE' ? 'Grant Final Approval' : 'Confirm Final Rejection'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: Coach Resubmit after Correction                  */}
      {/* ========================================================= */}
      {resubmittingTarget && (
        <Modal
          isOpen={true}
          onClose={() => setResubmittingTarget(null)}
          title={`Correct & Resubmit Leave: ${resubmittingTarget.id}`}
          subtitle="Update your leave request based on Super Coach feedback"
        >
          <form onSubmit={handleConfirmResubmit} className="space-y-4 text-xs">
            {/* Feedback from Super Coach */}
            {resubmittingTarget.superCoachReview?.comments && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1 text-amber-900">
                <span className="font-extrabold flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Feedback from Super Coach ({resubmittingTarget.superCoachReview.reviewerName}):</span>
                </span>
                <p className="text-xs font-medium italic">"{resubmittingTarget.superCoachReview.comments}"</p>
              </div>
            )}

            {/* Date Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={resubmitForm.startDate}
                  onChange={(e) => setResubmitForm({ ...resubmitForm, startDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white border border-[#172B5025] rounded-xl text-[#172B50]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={resubmitForm.endDate}
                  min={resubmitForm.startDate}
                  onChange={(e) => setResubmitForm({ ...resubmitForm, endDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white border border-[#172B5025] rounded-xl text-[#172B50]"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Updated Reason / Clarification *</label>
              <textarea
                rows={3}
                required
                value={resubmitForm.reason}
                onChange={(e) => setResubmitForm({ ...resubmitForm, reason: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-[#172B5025] rounded-xl text-[#172B50]"
              />
            </div>

            {/* Attachment */}
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Attachment File Name</label>
              <input
                type="text"
                value={resubmitForm.attachmentName}
                onChange={(e) => setResubmitForm({ ...resubmitForm, attachmentName: e.target.value })}
                placeholder="e.g. Revised_Medical_Note.pdf"
                className="w-full px-3 py-2 text-xs bg-white border border-[#172B5025] rounded-xl text-[#172B50]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#172B5010]">
              <button
                type="button"
                onClick={() => setResubmittingTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#F4510B] text-white hover:bg-[#E04505] shadow-xs cursor-pointer"
              >
                Resubmit to Super Coach
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: View Complete Request Details & Audit History    */}
      {/* ========================================================= */}
      {selectedDetailRequest && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDetailRequest(null)}
          title={`Leave Request: ${selectedDetailRequest.id}`}
          subtitle={`Submitted on ${selectedDetailRequest.appliedOn || 'Recent'} by ${selectedDetailRequest.coachName}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Status & Sequential Workflow Indicator */}
            <div
              className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
                getLeaveStatusBadge(selectedDetailRequest.status).bgLight
              } ${getLeaveStatusBadge(selectedDetailRequest.status).borderClass}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                  getLeaveStatusBadge(selectedDetailRequest.status).pillClass
                }`}>
                  {isApproved(selectedDetailRequest.status) ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isPendingAdmin(selectedDetailRequest.status) ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : isReturned(selectedDetailRequest.status) ? (
                    <RotateCcw className="w-5 h-5" />
                  ) : isRejected(selectedDetailRequest.status) ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <span className="font-black text-sm text-[#172B50] block">
                    Status: {selectedDetailRequest.status}
                  </span>
                  <span className="text-[11px] opacity-80 block text-[#172B50]">
                    {isApproved(selectedDetailRequest.status)
                      ? 'Approved leave directly locks normal coach attendance for these dates.'
                      : isPendingAdmin(selectedDetailRequest.status)
                      ? 'Super Coach has recommended approval. Awaiting final Admin signoff.'
                      : isReturned(selectedDetailRequest.status)
                      ? 'Returned to coach for correction or additional information.'
                      : isRejected(selectedDetailRequest.status)
                      ? 'Leave request declined. Attendance remains unaffected.'
                      : 'Pending review by assigned Super Coach.'}
                  </span>
                </div>
              </div>

              <span className="font-mono text-xs font-black uppercase px-3 py-1 rounded-lg bg-white/90 border border-current self-start sm:self-auto">
                {selectedDetailRequest.leaveType}
              </span>
            </div>

            {/* 3-Step Visual Progress Tracker */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-600 block mb-3">
                Approval Flow Progress (Sequential)
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                {/* Step 1: Submission */}
                <div className="p-2 rounded-xl bg-white border border-emerald-300">
                  <div className="w-5 h-5 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold mb-1">
                    ✓
                  </div>
                  <span className="font-black text-slate-800 block">1. Coach Applied</span>
                  <span className="text-[9.5px] text-slate-400 block">{selectedDetailRequest.appliedOn || 'Done'}</span>
                </div>

                {/* Step 2: Super Coach */}
                <div className={`p-2 rounded-xl border ${
                  isPendingAdmin(selectedDetailRequest.status) || isApproved(selectedDetailRequest.status)
                    ? 'bg-white border-emerald-300'
                    : isPendingSuperCoach(selectedDetailRequest.status)
                    ? 'bg-amber-50 border-amber-400'
                    : isReturned(selectedDetailRequest.status)
                    ? 'bg-orange-50 border-orange-400'
                    : 'bg-white border-slate-200'
                }`}>
                  <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold mb-1 text-white ${
                    isPendingAdmin(selectedDetailRequest.status) || isApproved(selectedDetailRequest.status)
                      ? 'bg-emerald-500'
                      : isPendingSuperCoach(selectedDetailRequest.status)
                      ? 'bg-amber-500'
                      : isReturned(selectedDetailRequest.status)
                      ? 'bg-orange-500'
                      : 'bg-slate-300'
                  }`}>
                    2
                  </div>
                  <span className="font-black text-slate-800 block">2. Super Coach Review</span>
                  <span className="text-[9.5px] text-slate-500 block">
                    {selectedDetailRequest.superCoachReview ? selectedDetailRequest.superCoachReview.decision : 'Pending Review'}
                  </span>
                </div>

                {/* Step 3: Admin Final */}
                <div className={`p-2 rounded-xl border ${
                  isApproved(selectedDetailRequest.status)
                    ? 'bg-white border-emerald-300'
                    : isPendingAdmin(selectedDetailRequest.status)
                    ? 'bg-blue-50 border-blue-400 animate-pulse'
                    : selectedDetailRequest.status === LEAVE_STATUSES.REJECTED
                    ? 'bg-rose-50 border-rose-400'
                    : 'bg-white border-slate-200 opacity-60'
                }`}>
                  <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold mb-1 text-white ${
                    isApproved(selectedDetailRequest.status)
                      ? 'bg-emerald-500'
                      : isPendingAdmin(selectedDetailRequest.status)
                      ? 'bg-blue-600'
                      : selectedDetailRequest.status === LEAVE_STATUSES.REJECTED
                      ? 'bg-rose-600'
                      : 'bg-slate-300'
                  }`}>
                    3
                  </div>
                  <span className="font-black text-slate-800 block">3. Admin Final Signoff</span>
                  <span className="text-[9.5px] text-slate-500 block">
                    {isApproved(selectedDetailRequest.status)
                      ? 'Approved'
                      : selectedDetailRequest.status === LEAVE_STATUSES.REJECTED
                      ? 'Rejected'
                      : isPendingAdmin(selectedDetailRequest.status)
                      ? 'Awaiting Signoff'
                      : 'Queued'}
                  </span>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
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
                <span className="text-[10px] font-black uppercase text-[#172B50]/60 block">Leave Request ID</span>
                <p className="font-mono font-black text-[#F4510B] mt-0.5">{selectedDetailRequest.id}</p>
                <span className="text-[10.5px] text-[#172B50]/60">Single Shared System Key</span>
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

            {/* Super Coach Review Box (if completed) */}
            {selectedDetailRequest.superCoachReview && (
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-blue-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span>Super Coach Review: {selectedDetailRequest.superCoachReview.decision}</span>
                  </span>
                  <span className="text-[10px] text-blue-700 font-mono">
                    {new Date(selectedDetailRequest.superCoachReview.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-blue-800">
                  Reviewer: <strong>{selectedDetailRequest.superCoachReview.reviewerName}</strong>
                </p>
                {selectedDetailRequest.superCoachReview.comments && (
                  <p className="text-[11px] text-blue-900 italic bg-white p-2 rounded-lg border border-blue-200 mt-1">
                    "{selectedDetailRequest.superCoachReview.comments}"
                  </p>
                )}
              </div>
            )}

            {/* Admin Final Review Box (if completed) */}
            {selectedDetailRequest.adminReview && (
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Admin Final Determination: {selectedDetailRequest.adminReview.decision}</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono">
                    {new Date(selectedDetailRequest.adminReview.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Reviewer: <strong>{selectedDetailRequest.adminReview.reviewerName}</strong>
                </p>
                {selectedDetailRequest.adminReview.comments && (
                  <p className="text-[11px] text-emerald-900 italic bg-white p-2 rounded-lg border border-emerald-200 mt-1">
                    "{selectedDetailRequest.adminReview.comments}"
                  </p>
                )}
              </div>
            )}

            {/* Complete Chronological Approval History */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                <span>Sequential Audit History Log</span>
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(selectedDetailRequest.approvalHistory || selectedDetailRequest.approvalTimeline || []).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-white p-2.5 rounded-lg border border-slate-200">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        item.action.includes('Approved') || item.action.includes('Recommend')
                          ? 'bg-emerald-500'
                          : item.action.includes('Correction')
                          ? 'bg-amber-500'
                          : item.action.includes('Reject')
                          ? 'bg-rose-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#172B50]">{item.action}</span>
                        <span className="text-[9.5px] text-slate-400 font-mono">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-600">
                        By: <strong>{item.by}</strong> ({item.role || 'System'})
                      </p>
                      {item.comments && (
                        <p className="text-[10.5px] text-slate-700 italic mt-0.5">"{item.comments}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Footer in Detail Modal */}
            <div className="pt-2 flex items-center justify-between border-t border-[#172B5010]">
              <span className="text-[10px] text-slate-400 font-mono">
                System ID: {selectedDetailRequest.id}
              </span>

              <div className="flex items-center gap-2">
                {isSuperCoach && isPendingSuperCoach(selectedDetailRequest.status) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSuperCoachActionTarget(selectedDetailRequest);
                      setSuperCoachActionType('RECOMMEND');
                      setSuperCoachNotes('Recommended approval. Coaching coverage verified.');
                    }}
                    className="px-4 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs cursor-pointer"
                  >
                    Review &amp; Recommend
                  </button>
                )}

                {isAdmin && isPendingAdmin(selectedDetailRequest.status) && (
                  <button
                    type="button"
                    onClick={() => {
                      setAdminActionTarget(selectedDetailRequest);
                      setAdminActionType('APPROVE');
                      setAdminNotes('Final approval granted by Administration.');
                    }}
                    className="px-4 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs cursor-pointer"
                  >
                    Grant Final Approval
                  </button>
                )}

                {mode === 'coach' && isReturned(selectedDetailRequest.status) && (
                  <button
                    type="button"
                    onClick={() => handleOpenResubmitModal(selectedDetailRequest)}
                    className="px-4 py-1.5 rounded-lg font-bold text-xs bg-[#F4510B] hover:bg-[#E04505] text-white shadow-2xs cursor-pointer"
                  >
                    Correct &amp; Resubmit
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedDetailRequest(null)}
                  className="px-4 py-1.5 rounded-lg font-bold text-xs text-[#172B50] hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
