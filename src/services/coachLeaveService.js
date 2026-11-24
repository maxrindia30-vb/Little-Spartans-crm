/**
 * Little Spartans ZenConnect CRM - Coach Leave Management Service
 *
 * Implements centralized, sequential leave approval workflow:
 *   Coach Portal (Submission)
 *      ↓ [Pending Super Coach Review]
 *   Super Coach Portal (Review & Recommendation / Correction / Rejection)
 *      ↓ [Pending Admin Final Approval]
 *   Admin Portal (Final Approval / Final Rejection)
 *      ↓ [Approved / Rejected]
 *   Synchronized across Coach Attendance Register & all 3 Portals
 */

export const LEAVE_TYPES = {
  FULL_DAY: 'Full Day',
  HALF_DAY: 'Half Day',
};

export const LEAVE_STATUSES = {
  PENDING_SUPER_COACH: 'Pending Super Coach Review',
  PENDING_ADMIN: 'Pending Admin Final Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RETURNED: 'Returned for Correction',
  SUPER_COACH_REJECTED: 'Rejected by Super Coach',
  // Backwards compatibility aliases
  PENDING: 'Pending Super Coach Review',
  SUPER_COACH_APPROVED: 'Pending Admin Final Approval',
};

export const HALF_DAY_SESSIONS = {
  MORNING: 'First Half (Morning)',
  EVENING: 'Second Half (Evening)',
};

/**
 * Status helper checks supporting sequential multi-tier flow
 */
export function isPendingSuperCoach(status) {
  return status === LEAVE_STATUSES.PENDING_SUPER_COACH || status === 'Pending';
}

export function isPendingAdmin(status) {
  return status === LEAVE_STATUSES.PENDING_ADMIN || status === 'Super Coach Approved';
}

export function isApproved(status) {
  return status === LEAVE_STATUSES.APPROVED;
}

export function isRejected(status) {
  return (
    status === LEAVE_STATUSES.REJECTED ||
    status === LEAVE_STATUSES.SUPER_COACH_REJECTED ||
    status === 'Super Coach Rejected'
  );
}

export function isReturned(status) {
  return status === LEAVE_STATUSES.RETURNED;
}

/**
 * Status presentation configuration (badge colors, labels, icons)
 */
export function getLeaveStatusBadge(status) {
  if (isApproved(status)) {
    return {
      label: 'Approved (Final)',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      pillClass: 'bg-emerald-500 text-white',
      borderClass: 'border-emerald-300',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      step: 3,
      stepLabel: 'Approved',
    };
  }
  if (isPendingAdmin(status)) {
    return {
      label: 'Pending Admin Final Approval',
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
      pillClass: 'bg-blue-600 text-white',
      borderClass: 'border-blue-300',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700',
      step: 2,
      stepLabel: 'Admin Review',
    };
  }
  if (isReturned(status)) {
    return {
      label: 'Returned for Correction',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      pillClass: 'bg-amber-500 text-white',
      borderClass: 'border-amber-300',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-700',
      step: 1,
      stepLabel: 'Action Required',
    };
  }
  if (status === LEAVE_STATUSES.SUPER_COACH_REJECTED || status === 'Super Coach Rejected') {
    return {
      label: 'Rejected by Super Coach',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      pillClass: 'bg-rose-500 text-white',
      borderClass: 'border-rose-300',
      bgLight: 'bg-rose-50',
      textColor: 'text-rose-700',
      step: 2,
      stepLabel: 'Rejected',
    };
  }
  if (isRejected(status)) {
    return {
      label: 'Rejected by Admin',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      pillClass: 'bg-rose-600 text-white',
      borderClass: 'border-rose-300',
      bgLight: 'bg-rose-50',
      textColor: 'text-rose-700',
      step: 3,
      stepLabel: 'Rejected',
    };
  }
  // Default: Pending Super Coach Review
  return {
    label: 'Pending Super Coach Review',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    pillClass: 'bg-amber-600 text-white',
    borderClass: 'border-amber-300',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-700',
    step: 1,
    stepLabel: 'Super Coach Review',
  };
}

/**
 * Calculates number of calendar days between two YMD date strings inclusive
 */
export function calculateLeaveDurationDays(startDate, endDate, leaveType = LEAVE_TYPES.FULL_DAY) {
  if (leaveType === LEAVE_TYPES.HALF_DAY) {
    return 0.5;
  }
  if (!startDate || !endDate) return 1;
  const d1 = new Date(`${startDate}T00:00:00`);
  const d2 = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return 1;
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
}

/**
 * Formats a date range e.g. "20 Nov 2026 → 22 Nov 2026 (3 days)"
 */
export function formatLeaveDateRange(startDate, endDate, leaveType = LEAVE_TYPES.FULL_DAY) {
  if (!startDate) return 'Date not specified';
  const formatShort = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
  };

  const startFormatted = formatShort(startDate);
  if (!endDate || startDate === endDate) {
    return leaveType === LEAVE_TYPES.HALF_DAY
      ? `${startFormatted} (Half Day)`
      : `${startFormatted} (1 Day)`;
  }

  const endFormatted = formatShort(endDate);
  const days = calculateLeaveDurationDays(startDate, endDate, leaveType);
  return `${startFormatted} → ${endFormatted} (${days} Days)`;
}

/**
 * Checks whether a given coach has an APPROVED leave covering a specific YMD date.
 * Strictly ignores Pending, Returned and Rejected leave requests.
 */
export function getCoachApprovedLeaveForDate(coachLeaveRequests = [], coachId, dateYmd) {
  if (!coachId || !dateYmd) return null;
  return (
    (coachLeaveRequests || []).find((req) => {
      if (!isApproved(req.status)) return false;
      if (req.coachId !== coachId) return false;
      const s = req.startDate;
      const e = req.endDate || req.startDate;
      return dateYmd >= s && dateYmd <= e;
    }) || null
  );
}

/**
 * Checks for date overlap against existing active/pending/approved leave requests
 * for the same coach to prevent duplicate submissions.
 */
export function checkDuplicateLeaveConflict(coachLeaveRequests = [], coachId, startDate, endDate, excludeId = null) {
  if (!coachId || !startDate) return null;
  const targetEnd = endDate || startDate;

  return (
    (coachLeaveRequests || []).find((req) => {
      if (excludeId && req.id === excludeId) return false;
      if (req.coachId !== coachId) return false;

      // Only check active requests: Pending, Recommended, or Approved
      // Rejected leaves or Returned for correction do not block a new submission
      if (
        req.status === LEAVE_STATUSES.REJECTED ||
        req.status === LEAVE_STATUSES.SUPER_COACH_REJECTED ||
        req.status === 'Rejected' ||
        req.status === 'Super Coach Rejected'
      ) {
        return false;
      }

      const reqStart = req.startDate;
      const reqEnd = req.endDate || req.startDate;
      const overlaps = startDate <= reqEnd && targetEnd >= reqStart;
      return overlaps;
    }) || null
  );
}

/**
 * Validates leave request payload before creation
 */
export function validateCoachLeavePayload(payload = {}) {
  const errors = [];
  if (!payload.coachId || !payload.coachName) {
    errors.push('Coach profile and ID are required to submit leave.');
  }
  if (!payload.startDate) {
    errors.push('Start Date is required.');
  }
  if (!payload.endDate) {
    errors.push('End Date is required.');
  }
  if (payload.startDate && payload.endDate && payload.startDate > payload.endDate) {
    errors.push('Start Date cannot be later than End Date.');
  }
  if (!payload.reason || !payload.reason.trim()) {
    errors.push('Reason for leave is mandatory.');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}
