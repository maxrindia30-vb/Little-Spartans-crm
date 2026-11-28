/**
 * Little Spartans ZenConnect CRM - Class Scheduling Service
 *
 * Provides location-based class scheduling operations, conflict detection,
 * recurring weekly session generation, attendance matching, and real-time
 * synchronization across Admin, Coach, and Parent portals.
 *
 * ============================================================================
 * BACKEND INTEGRATION SPECIFICATION:
 * - GET    /api/v1/schedules
 *          Query Params: ?location=...&coachId=...&program=...&date=...&status=...
 * - POST   /api/v1/schedules
 * - POST   /api/v1/schedules/recurring
 * - PUT    /api/v1/schedules/:id
 * - PATCH  /api/v1/schedules/:id/status
 * - DELETE /api/v1/schedules/:id
 * Note: Parent read queries MUST enforce location + enrolled student's batch/program isolation.
 * ============================================================================
 */

export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const MON_FIRST_WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function isTimeOverlapping(start1, end1, start2, end2) {
  if (!start1 || !end1 || !start2 || !end2) return false;
  return start1 < end2 && end1 > start2;
}

export function formatYmd(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function checkScheduleConflict(candidate, existingSchedules = [], excludeId = null) {
  const { location, coachId, coachName, additionalCoaches = [], date, startTime, endTime, venue } = candidate;

  if (!date || !startTime || !endTime) {
    return { hasConflict: false };
  }

  const activeSchedules = existingSchedules.filter(
    (s) => s.id !== excludeId && s.status !== 'Cancelled' && s.date === date
  );

  const candidateCoachIds = new Set(
    [coachId, ...(additionalCoaches || []).map((c) => c.coachId)].filter(Boolean)
  );

  for (const existing of activeSchedules) {
    if (isTimeOverlapping(startTime, endTime, existing.startTime, existing.endTime)) {
      const existingCoachIds = new Set(
        [existing.coachId, ...(existing.additionalCoaches || []).map((c) => c.coachId)].filter(Boolean)
      );
      const hasSharedCoachId = [...candidateCoachIds].some((id) => existingCoachIds.has(id));
      const hasSamePrimaryName = coachName && existing.coachName && existing.coachName === coachName;

      if (hasSharedCoachId || hasSamePrimaryName) {
        return {
          hasConflict: true,
          type: 'coach',
          message: `Coach Conflict: ${coachName || 'Assigned Coach'} is already scheduled for "${existing.batch || existing.program}" at ${existing.location} (${existing.startTime} - ${existing.endTime}) on this date.`,
          conflictingSchedule: existing,
        };
      }

      if (location && venue && existing.location === location && existing.venue === venue) {
        return {
          hasConflict: true,
          type: 'venue',
          message: `Venue Conflict: "${venue}" at ${location} is already booked for "${existing.batch || existing.program}" (${existing.startTime} - ${existing.endTime}) on this date.`,
          conflictingSchedule: existing,
        };
      }
    }
  }

  return { hasConflict: false };
}

/**
 * Generates YYYY-MM-DD occurrence dates for a weekly recurring schedule.
 */
export function generateRecurringDates({
  startDate,
  endDate = '',
  recurringDays = [],
  weeks = 4,
}) {
  if (!startDate || !Array.isArray(recurringDays) || recurringDays.length === 0) {
    return [];
  }

  const start = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return [];

  let end;
  if (endDate) {
    end = new Date(`${endDate}T00:00:00`);
  } else {
    const safeWeeks = Math.max(1, Math.min(16, parseInt(weeks, 10) || 4));
    end = new Date(start);
    end.setDate(start.getDate() + safeWeeks * 7 - 1);
  }

  if (Number.isNaN(end.getTime()) || end < start) return [];

  // Guard maximum span of 120 days
  const maxEnd = new Date(start);
  maxEnd.setDate(start.getDate() + 120);
  if (end > maxEnd) end = maxEnd;

  const targetDaySet = new Set(recurringDays.map((d) => String(d).trim().toLowerCase()));
  const results = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const weekday = WEEKDAY_NAMES[cursor.getDay()];
    if (targetDaySet.has(weekday.toLowerCase())) {
      results.push({
        date: formatYmd(cursor),
        weekday,
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return results;
}

/**
 * Builds non-duplicate, non-conflicting schedule payloads for recurring classes.
 */
export function buildRecurringSchedules(template, existingSchedules = []) {
  const occurrences = generateRecurringDates({
    startDate: template.date,
    endDate: template.endDate,
    recurringDays: template.recurringDays,
    weeks: template.weeks,
  });

  const createdCandidates = [];
  const skippedConflicts = [];
  const skippedDuplicates = [];
  const workingPool = [...existingSchedules];

  for (const occ of occurrences) {
    const duplicate = workingPool.find(
      (s) =>
        s.status !== 'Cancelled' &&
        s.date === occ.date &&
        s.location === template.location &&
        s.batch === template.batch &&
        s.startTime === template.startTime &&
        s.endTime === template.endTime
    );

    if (duplicate) {
      skippedDuplicates.push({ date: occ.date, weekday: occ.weekday, existingId: duplicate.id });
      continue;
    }

    const candidate = {
      ...template,
      date: occ.date,
      weekday: occ.weekday,
    };

    const conflict = checkScheduleConflict(candidate, workingPool);
    if (conflict.hasConflict) {
      skippedConflicts.push({ date: occ.date, weekday: occ.weekday, message: conflict.message });
      continue;
    }

    createdCandidates.push(candidate);
    workingPool.push({ ...candidate, id: `TMP-${occ.date}` });
  }

  return {
    occurrencesCount: occurrences.length,
    createdCandidates,
    skippedConflicts,
    skippedDuplicates,
  };
}

export function normalizeLocationName(loc) {
  if (!loc) return '';
  return String(loc).replace(/\s*\([^)]*\)/g, '').trim().toUpperCase();
}

/**
 * Strictly matches central class schedules to a parent's child based on:
 * - Same Academy Location (child.center)
 * - Enrolled Batch / Program (or child-specific compensation replacement session)
 * - Multiple batches and enrolled programs
 * Never leaks other locations or unrelated students' replacement slots.
 */
export function getChildMatchedSchedules(child, classSchedules = [], classes = []) {
  if (!child || !child.center) return [];

  const rawChildLoc = String(child.center).trim().toUpperCase();
  const normChildLoc = normalizeLocationName(child.center);

  const childPrograms = new Set(
    [
      child.program,
      child.programId,
      ...(Array.isArray(child.programs) ? child.programs : []),
      ...(Array.isArray(child.enrolledPrograms) ? child.enrolledPrograms : []),
    ]
      .filter(Boolean)
      .map((p) => String(p).trim().toLowerCase())
  );

  const childBatches = new Set(
    [
      child.batch,
      child.batchName,
      child.batchId,
      ...(Array.isArray(child.enrolledClasses) ? child.enrolledClasses : []),
      ...(Array.isArray(child.batches) ? child.batches : []),
      ...(Array.isArray(child.enrolledBatches) ? child.enrolledBatches : []),
    ]
      .filter(Boolean)
      .map((b) => String(b).trim().toLowerCase())
  );

  // Also check classes roster where student ID is enrolled
  const enrolledClassIds = new Set();
  (classes || []).forEach((cls) => {
    const clsLoc = normalizeLocationName(cls.center || cls.location);
    if (
      (!clsLoc || clsLoc === normChildLoc || String(cls.center || '').trim().toUpperCase() === rawChildLoc) &&
      ((cls.enrolledStudentIds || []).includes(child.id) ||
        (cls.enrolledStudents || []).includes(child.name))
    ) {
      enrolledClassIds.add(cls.id);
      if (cls.name) childBatches.add(String(cls.name).trim().toLowerCase());
      if (cls.batchId) childBatches.add(String(cls.batchId).trim().toLowerCase());
      if (cls.program) childPrograms.add(String(cls.program).trim().toLowerCase());
    }
  });

  const seenIds = new Set();

  return (classSchedules || [])
    .filter((s) => {
      if (!s || s.deleted) return false;
      if (seenIds.has(s.id)) return false;

      const schLocRaw = String(s.location || '').trim().toUpperCase();
      const schLocNorm = normalizeLocationName(s.location);
      const isLocMatch = schLocNorm === normChildLoc || schLocRaw === rawChildLoc;
      if (!isLocMatch) return false;

      // Replacement classes created from Student Compensation are visible ONLY to that student
      if (s.isCompensationReplacement || s.compensationRequestId) {
        if (
          s.targetStudentId === child.id ||
          (s.enrolledStudentIds || []).includes(child.id) ||
          (s.enrolledStudents || []).includes(child.name)
        ) {
          seenIds.add(s.id);
          return true;
        }
        return false;
      }

      // Direct roster membership on the schedule
      if (
        (s.enrolledStudentIds || []).includes(child.id) ||
        (s.enrolledStudents || []).includes(child.name)
      ) {
        seenIds.add(s.id);
        return true;
      }

      // Batch ID / Batch name match
      if (s.batchId && enrolledClassIds.has(s.batchId)) {
        seenIds.add(s.id);
        return true;
      }
      const schBatch = String(s.batch || s.batchName || '').trim().toLowerCase();
      if (schBatch && childBatches.has(schBatch)) {
        seenIds.add(s.id);
        return true;
      }

      // If student enrolled in program
      const schProg = String(s.program || '').trim().toLowerCase();
      if (schProg && childPrograms.has(schProg)) {
        if (!s.batch || childBatches.size === 0 || childBatches.has(schBatch)) {
          seenIds.add(s.id);
          return true;
        }
      }

      return false;
    })
    .sort((a, b) => `${a.date || ''}T${a.startTime || ''}`.localeCompare(`${b.date || ''}T${b.startTime || ''}`));
}

/**
 * Resolves a child's attendance status for a given scheduled session.
 */
export function mergeScheduleAttendance(schedule, child, attendanceRecords = []) {
  if (!schedule || !child) return 'Not Marked';

  const schLoc = String(schedule.location || '').trim().toUpperCase();
  const match = (attendanceRecords || []).find((rec) => {
    const isChildMatch =
      rec.studentId === child.id ||
      rec.childId === child.id ||
      (rec.childName && child.name && String(rec.childName).trim().toLowerCase() === String(child.name).trim().toLowerCase()) ||
      (rec.studentName && child.name && String(rec.studentName).trim().toLowerCase() === String(child.name).trim().toLowerCase());
    if (!isChildMatch) return false;
    if (rec.date !== schedule.date && rec.sessionDate !== schedule.date) return false;
    if (rec.location && schLoc && String(rec.location).trim().toUpperCase() !== schLoc) {
      return false;
    }
    if (schedule.batchId && rec.batchId && rec.batchId !== schedule.batchId && rec.batchName !== schedule.batch) {
      return false;
    }
    return true;
  });

  return match?.status || 'Not Marked';
}
