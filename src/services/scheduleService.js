/**
 * Little Spartans ZenConnect CRM - Class Scheduling Service
 * 
 * Provides location-based class scheduling operations, conflict detection,
 * and automatic synchronization between Admin and Coach portals.
 * 
 * ============================================================================
 * BACKEND INTEGRATION SPECIFICATION:
 * When migrating from frontend mock state to production backend services:
 * 
 * 1. REST Endpoints:
 *    - GET    /api/v1/schedules
 *             Query Params: ?location=...&coachId=...&program=...&date=...&status=...
 *             Returns: Array of ClassSchedule entities
 * 
 *    - POST   /api/v1/schedules
 *             Body: { location, program, batch, coachId, coachName, date, startTime, endTime, venue, capacity, notes }
 *             Validates: Time conflict for coach and venue.
 *             Returns: Created ClassSchedule entity with HTTP 201
 * 
 *    - PUT    /api/v1/schedules/:id
 *             Body: Updated schedule fields
 *             Returns: Updated ClassSchedule entity with HTTP 200
 * 
 *    - PATCH  /api/v1/schedules/:id/status
 *             Body: { status: 'Scheduled' | 'Updated' | 'Cancelled' | 'Completed' }
 *             Returns: Updated status entity
 * 
 *    - DELETE /api/v1/schedules/:id
 *             Returns: 204 No Content
 * 
 * 2. Real-time Synchronization (SSE / WebSockets):
 *    - Topic: `ws://api.littlespartans.co.in/events/schedules`
 *    - Events: `schedule:created`, `schedule:updated`, `schedule:cancelled`
 *    - When Admin creates or updates a schedule, backend publishes event to
 *      coach's channel (`coach:{coachId}`).
 *    - Both portals listen to the same stream to ensure zero-lag synchronization.
 * ============================================================================
 */

/**
 * Checks if two time intervals overlap on the same date.
 * Assumes format "HH:MM" (e.g. "16:30", "17:45")
 */
export function isTimeOverlapping(start1, end1, start2, end2) {
  if (!start1 || !end1 || !start2 || !end2) return false;
  return start1 < end2 && end1 > start2;
}

/**
 * Validates a schedule against existing schedules to prevent duplicate or conflicting bookings.
 * Checks:
 * 1. Coach conflict: Is the coach already booked for another active class on the same date & time?
 * 2. Venue/Court conflict: Is the court/ground at that location already occupied on the same date & time?
 * 
 * @param {Object} candidate - The schedule to test
 * @param {Array} existingSchedules - List of current schedules
 * @param {string} [excludeId] - ID to ignore when editing an existing schedule
 * @returns {Object} { hasConflict: boolean, type?: 'coach'|'venue', message?: string, conflictingSchedule?: Object }
 */
export function checkScheduleConflict(candidate, existingSchedules = [], excludeId = null) {
  const { location, coachId, coachName, date, startTime, endTime, venue } = candidate;

  if (!date || !startTime || !endTime) {
    return { hasConflict: false };
  }

  // Only check active (non-cancelled) schedules
  const activeSchedules = existingSchedules.filter(s => 
    s.id !== excludeId && 
    s.status !== 'Cancelled' &&
    s.date === date
  );

  for (const existing of activeSchedules) {
    // Check if time slots overlap
    if (isTimeOverlapping(startTime, endTime, existing.startTime, existing.endTime)) {
      // 1. Check Coach Conflict (across any location)
      if (coachId && (existing.coachId === coachId || existing.coachName === coachName)) {
        return {
          hasConflict: true,
          type: 'coach',
          message: `Coach Conflict: ${coachName || 'Assigned Coach'} already has a scheduled class "${existing.batch || existing.program}" at ${existing.location} (${existing.startTime} - ${existing.endTime}) on this date.`,
          conflictingSchedule: existing
        };
      }

      // 2. Check Venue / Court Conflict (at same location)
      if (location && venue && existing.location === location && existing.venue === venue) {
        return {
          hasConflict: true,
          type: 'venue',
          message: `Venue Conflict: "${venue}" at ${location} is already booked for "${existing.batch || existing.program}" (${existing.startTime} - ${existing.endTime}) on this date.`,
          conflictingSchedule: existing
        };
      }
    }
  }

  return { hasConflict: false };
}
