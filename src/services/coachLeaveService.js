/**
 * Little Spartans ZenConnect CRM - Coach Leave Management Service
 *
 * Implements atomic, synchronized leave request workflow across:
 *   Coach Portal <--> Super Admin Portal <--> Admin Portal <--> Coach Attendance Register
 */

export const LEAVE_TYPES = {
  FULL_DAY: 'Full Day',
  HALF_DAY: 'Half Day',
};

export const LEAVE_STATUSES = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const HALF_DAY_SESSIONS = {
  MORNING: 'First Half (Morning)',
  EVENING: 'Second Half (Evening)',
};

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
 * Strictly ignores Pending and Rejected leave requests.
 */
export function getCoachApprovedLeaveForDate(coachLeaveRequests = [], coachId, dateYmd) {
  if (!coachId || !dateYmd) return null;
  return (
    (coachLeaveRequests || []).find((req) => {
      if (req.status !== LEAVE_STATUSES.APPROVED) return false;
      if (req.coachId !== coachId) return false;
      const s = req.startDate;
      const e = req.endDate || req.startDate;
      return dateYmd >= s && dateYmd <= e;
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
