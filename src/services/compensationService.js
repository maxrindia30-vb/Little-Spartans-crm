/**
 * Little Spartans ZenConnect CRM - Student Compensation Domain Service
 *
 * Unified business rules shared by Parent Portal, Admin Portal, and Coach Portal.
 * Single source of truth for compensation eligibility, duplicate prevention,
 * role-based authority checks, and replacement slot validation.
 *
 * ============================================================================
 * BACKEND INTEGRATION SPECIFICATION:
 * - POST   /api/v1/compensations               (Parent or Admin creates request)
 * - GET    /api/v1/compensations               (Admin: all; Parent: own children only)
 * - PATCH  /api/v1/compensations/:id/status    (Admin only: Approve, Reject, Review, Complete, Cancel)
 * - POST   /api/v1/compensations/:id/schedule  (Admin only: Schedule/Reschedule replacement + sync coach)
 * Unique DB index recommended on (student_id, missed_date, batch_id) WHERE status NOT IN ('Rejected', 'Cancelled')
 * ============================================================================
 */

import { checkScheduleConflict } from './scheduleService.js';

export const COMPENSATION_STATUSES = [
  'Pending',
  'Under Review',
  'Approved',
  'Rejected',
  'Scheduled',
  'Completed',
  'Cancelled',
  'Expired',
];

export const COMPENSATION_REASONS = [
  'Illness',
  'School Examination',
  'Personal Reason',
  'Other',
];

export const DEFAULT_EXPIRY_DAYS = 30;

export function canActorManageCompensation(role) {
  return String(role || '').toLowerCase() === 'admin';
}

export function normalizeDateDiffDays(missedDate, referenceDate = new Date()) {
  if (!missedDate) return null;
  const missed = new Date(`${missedDate}T00:00:00`);
  if (Number.isNaN(missed.getTime())) return null;
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);
  return Math.floor((ref.getTime() - missed.getTime()) / (1000 * 60 * 60 * 24));
}

export function checkCompensationEligibility({
  student,
  missedDate,
  missedClass = '',
  batchId = '',
  existingRequests = [],
  parentId = '',
  role = 'parent',
  referenceDate = new Date(),
  allowAdminOverride = true,
}) {
  if (!student) {
    return { valid: false, eligible: false, eligibilityLabel: 'Invalid Student', reason: 'Selected student profile was not found.' };
  }

  if (student.status === 'Inactive') {
    return { valid: false, eligible: false, eligibilityLabel: 'Inactive Student', reason: `${student.name} is currently marked Inactive.` };
  }

  // Strict Parent RBAC: parent can only request for their own linked children
  if (String(role).toLowerCase() === 'parent' && parentId && student.parentId && student.parentId !== parentId) {
    return {
      valid: false,
      eligible: false,
      eligibilityLabel: 'Unauthorized',
      reason: 'Parents can only submit compensation requests for their own registered children.',
    };
  }

  if (!missedDate) {
    return { valid: false, eligible: false, eligibilityLabel: 'Missing Date', reason: 'Missed class date is required.' };
  }

  // Duplicate check across active/completed compensation requests
  const normalizedClass = String(missedClass || '').trim().toLowerCase();
  const duplicate = (existingRequests || []).find((req) => {
    if (req.status === 'Rejected' || req.status === 'Cancelled') return false;
    if (req.studentId !== student.id) return false;
    if (req.missedDate !== missedDate) return false;
    if (batchId && req.batchId) return req.batchId === batchId;
    if (normalizedClass && req.missedClass) {
      return String(req.missedClass).trim().toLowerCase() === normalizedClass;
    }
    return true;
  });

  if (duplicate) {
    return {
      valid: false,
      eligible: false,
      eligibilityLabel: 'Duplicate Request',
      reason: `A compensation request (${duplicate.id}) already exists for ${student.name} on ${missedDate}.`,
    };
  }

  const diffDays = normalizeDateDiffDays(missedDate, referenceDate);
  const isExpired = diffDays !== null && diffDays > DEFAULT_EXPIRY_DAYS;

  if (isExpired && !(role === 'admin' && allowAdminOverride)) {
    return {
      valid: false,
      eligible: false,
      isExpired: true,
      eligibilityLabel: `Expired (> ${DEFAULT_EXPIRY_DAYS} days)`,
      reason: `Missed class date (${missedDate}) exceeded the ${DEFAULT_EXPIRY_DAYS}-day compensation eligibility window.`,
    };
  }

  if (isExpired && role === 'admin' && allowAdminOverride) {
    return {
      valid: true,
      eligible: true,
      isExpired: true,
      eligibilityLabel: 'Admin Override (Expired Window)',
    };
  }

  return {
    valid: true,
    eligible: true,
    isExpired: false,
    eligibilityLabel: 'Eligible (Within Policy Window)',
  };
}

export function validateReplacementSlot({
  replacementDate,
  replacementStartTime,
  replacementEndTime,
  replacementLocation,
  replacementCoachId,
  replacementCoachName,
  classSchedules = [],
  excludeScheduleId = null,
}) {
  if (!replacementDate || !replacementStartTime || !replacementEndTime || !replacementLocation) {
    return { valid: false, message: 'Replacement date, start time, end time, and location are required.' };
  }
  if (replacementStartTime >= replacementEndTime) {
    return { valid: false, message: 'Replacement end time must be after start time.' };
  }
  if (!replacementCoachId && !replacementCoachName) {
    return { valid: false, message: 'Please assign an available replacement coach.' };
  }

  const conflict = checkScheduleConflict(
    {
      location: replacementLocation,
      coachId: replacementCoachId,
      coachName: replacementCoachName,
      date: replacementDate,
      startTime: replacementStartTime,
      endTime: replacementEndTime,
      venue: '',
    },
    classSchedules,
    excludeScheduleId
  );

  if (conflict.hasConflict) {
    return { valid: false, message: conflict.message };
  }

  return { valid: true };
}

export function formatReplacementSlotLabel({ replacementDate, replacementStartTime, replacementEndTime, replacementLocation }) {
  if (!replacementDate) return '';
  const timeRange = replacementStartTime && replacementEndTime ? ` (${replacementStartTime} - ${replacementEndTime})` : '';
  const locPart = replacementLocation ? ` • ${replacementLocation}` : '';
  return `${replacementDate}${timeRange}${locPart}`;
}
