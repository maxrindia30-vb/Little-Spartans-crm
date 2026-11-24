/**
 * Coach Attendance Service
 * Handles coach camera check-in, check-out, working duration calculations,
 * location-wise multi-center tracking, and student attendance check-out gating.
 */

export const COACH_ATTENDANCE_STATUS = {
  NOT_CHECKED_IN: 'not_checked_in',
  CHECKED_IN: 'checked_in',
  COMPLETED: 'completed',
  MISSED: 'missed',
};

/**
 * Format timestamp into display time: "09:30 AM" or "05:15 PM"
 */
export function formatDisplayTime(dateOrIso) {
  if (!dateOrIso) return '--:--';
  const d = typeof dateOrIso === 'string' && dateOrIso.includes('T')
    ? new Date(dateOrIso)
    : new Date();
  
  if (typeof dateOrIso === 'string' && !dateOrIso.includes('T') && dateOrIso.includes(':')) {
    // Already in HH:mm or HH:mm:ss format
    const parts = dateOrIso.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
  }

  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats duration between check-in and check-out
 */
export function calculateWorkingDuration(checkInTime, checkOutTime) {
  if (!checkInTime) return { minutes: 0, formatted: '--' };

  const start = new Date(checkInTime).getTime();
  const end = checkOutTime ? new Date(checkOutTime).getTime() : Date.now();

  if (isNaN(start) || isNaN(end) || end < start) {
    return { minutes: 0, formatted: '0m' };
  }

  const diffMs = end - start;
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let formatted = '';
  if (hours > 0) {
    formatted += `${hours}h `;
  }
  formatted += `${minutes}m`;

  return {
    minutes: totalMinutes,
    formatted: formatted.trim(),
  };
}

/**
 * Live duration counter ticking in seconds (e.g. 03h 15m 42s)
 */
export function formatLiveDuration(checkInIso, now = new Date()) {
  if (!checkInIso) return '00:00:00';
  const start = new Date(checkInIso).getTime();
  const current = now instanceof Date ? now.getTime() : new Date(now).getTime();

  if (isNaN(start) || isNaN(current) || current < start) {
    return '00h 00m 00s';
  }

  const diffSec = Math.floor((current - start) / 1000);
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

/**
 * Find today's coach attendance record
 */
export function getCoachTodayAttendance(records = [], coachId, dateYmd, location = null) {
  if (!coachId || !dateYmd) return null;
  return (records || []).find((r) => {
    const matchCoach = r.coachId === coachId || r.coachName === coachId;
    const matchDate = r.date === dateYmd;
    const matchLocation = !location || r.locationName === location || r.locationId === location;
    return matchCoach && matchDate && matchLocation;
  }) || null;
}

/**
 * Check if coach has an active check-in at another location on the same day without checkout
 */
export function checkLocationOverlap(records = [], coachId, dateYmd, targetLocation) {
  if (!coachId || !dateYmd || !targetLocation) return null;
  return (records || []).find((r) => {
    return (
      (r.coachId === coachId || r.coachName === coachId) &&
      r.date === dateYmd &&
      r.locationName !== targetLocation &&
      r.status === COACH_ATTENDANCE_STATUS.CHECKED_IN &&
      !r.checkOutTime
    );
  }) || null;
}

/**
 * Validate Check-In Payload
 */
export function validateCheckInPayload({ coachId, coachName, location, photo }) {
  const errors = [];
  if (!coachId) errors.push('Coach ID is required for check-in.');
  if (!coachName) errors.push('Coach name is required for check-in.');
  if (!location) errors.push('Assigned location is required for check-in.');
  if (!photo || typeof photo !== 'string' || photo.trim().length === 0) {
    errors.push('A live photo is strictly required to complete check-in.');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Check-Out Payload
 */
export function validateCheckOutPayload({ coachId, photo, record, hasSavedStudentAttendance }) {
  const errors = [];
  if (!coachId) errors.push('Coach ID is required for check-out.');
  if (!record) errors.push('No active check-in record found for today.');
  if (record && record.status === COACH_ATTENDANCE_STATUS.COMPLETED) {
    errors.push('Attendance has already been completed for today.');
  }
  if (!hasSavedStudentAttendance) {
    errors.push("Save today's student attendance to enable Check Out.");
  }
  if (!photo || typeof photo !== 'string' || photo.trim().length === 0) {
    errors.push('A live photo is strictly required to complete check-out.');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}
