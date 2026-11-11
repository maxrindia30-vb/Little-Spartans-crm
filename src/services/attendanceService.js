/**
 * Little Spartans ZenConnect CRM - Location-Based Student Attendance Service
 *
 * Single source of truth validation, role-based access control, duplicate
 * prevention, and location-isolated filtering shared across Admin and Coach portals.
 *
 * ============================================================================
 * BACKEND INTEGRATION REQUIRED:
 * - GET /api/v1/attendance?location={loc}&date={yyyy-mm-dd}&program={prog}&batchId={id}&coachId={id}
 *   Returns attendance records scoped by branch & class.
 * - PUT /api/v1/attendance/batch
 *   Body: { location, batchId, date, entries: [{ studentId, status }] }
 *   Server must enforce:
 *     1. RBAC middleware: Admin can write any branch; Coach can only write
 *        batches/locations where coach_id === authenticated_user.coach_id.
 *     2. DB constraint: UNIQUE (student_id, batch_id, attendance_date) to
 *        prevent duplicate attendance records.
 *     3. Branch integrity check: student.location === batch.location.
 * ============================================================================
 */

export const ATTENDANCE_STATUSES = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  NOT_MARKED: 'Not Marked'
};

/**
 * Checks whether a user role is authorized to mark or update attendance
 * for a given location and batch.
 */
export function validateAttendancePermission({
  role,
  coachProfile,
  batch,
  location,
  classSchedules = []
}) {
  if (role === 'admin') {
    return { allowed: true };
  }

  if (role === 'coach') {
    if (!coachProfile) {
      return { allowed: false, reason: 'Coach profile could not be verified.' };
    }
    if (!batch) {
      return { allowed: false, reason: 'A valid assigned batch is required for coaches.' };
    }

    const coachFirstName = (coachProfile.name || '').split(' ')[0].toLowerCase();
    const assignedViaBatch =
      batch.coachId === coachProfile.id ||
      (batch.additionalCoaches || []).some((c) => c.coachId === coachProfile.id) ||
      (batch.coach && coachFirstName && batch.coach.toLowerCase().includes(coachFirstName));

    const assignedViaSchedule = classSchedules.some(
      (sch) =>
        sch.status !== 'Cancelled' &&
        (sch.batchId === batch.id || sch.batch === batch.name) &&
        (sch.coachId === coachProfile.id ||
          (sch.additionalCoaches || []).some((c) => c.coachId === coachProfile.id) ||
          (sch.coachName && coachFirstName && sch.coachName.toLowerCase().includes(coachFirstName)))
    );

    if (!assignedViaBatch && !assignedViaSchedule) {
      return {
        allowed: false,
        reason: `Permission denied: ${batch.name} is not assigned to ${coachProfile.name}.`
      };
    }

    if (location && location !== 'All' && batch.center !== location) {
      return {
        allowed: false,
        reason: `Location mismatch: ${batch.name} belongs to ${batch.center}, not ${location}.`
      };
    }

    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'Role-based access denied: Only Admin or assigned Coach can record attendance.'
  };
}

/**
 * Resolves the batches assigned to a specific coach across standing classes and published schedules.
 */
export function getCoachAssignedBatches({ coachProfile, classes = [], classSchedules = [] }) {
  if (!coachProfile) return [];
  const coachFirstName = (coachProfile.name || '').split(' ')[0].toLowerCase();

  const matchingBatchIds = new Set();

  classes.forEach((cls) => {
    if (
      cls.coachId === coachProfile.id ||
      (cls.additionalCoaches || []).some((c) => c.coachId === coachProfile.id) ||
      (cls.coach && coachFirstName && cls.coach.toLowerCase().includes(coachFirstName))
    ) {
      matchingBatchIds.add(cls.id);
    }
  });

  classSchedules.forEach((sch) => {
    if (
      sch.status !== 'Cancelled' &&
      sch.batchId &&
      (sch.coachId === coachProfile.id ||
        (sch.additionalCoaches || []).some((c) => c.coachId === coachProfile.id) ||
        (sch.coachName && coachFirstName && sch.coachName.toLowerCase().includes(coachFirstName)))
    ) {
      matchingBatchIds.add(sch.batchId);
    }
  });

  return classes.filter((cls) => matchingBatchIds.has(cls.id));
}

/**
 * Filters students for attendance strictly by location, program, batch, coach, and search.
 */
export function filterStudentsForAttendance(
  students = [],
  classes = [],
  { location = 'All', program = 'All', batchId = 'All', coach = 'All', search = '' } = {}
) {
  const query = search.trim().toLowerCase();
  const selectedBatchObj = batchId !== 'All' ? classes.find((c) => c.id === batchId) : null;

  return students.filter((student) => {
    // 1. Strict location isolation
    if (location !== 'All' && student.center !== location) {
      return false;
    }

    // 2. Program filter
    if (program !== 'All' && student.program !== program) {
      return false;
    }

    // 3. Batch filter: verify student belongs to the batch's location AND enrollment
    if (batchId !== 'All') {
      const enrolled = Array.isArray(student.enrolledClasses)
        ? student.enrolledClasses.includes(batchId)
        : false;

      if (!enrolled) {
        return false;
      }
      if (selectedBatchObj && student.center !== selectedBatchObj.center) {
        return false;
      }
    }

    // 4. Coach filter
    if (coach !== 'All') {
      const coachMatchesStudent =
        student.coachName && student.coachName.toLowerCase().includes(coach.toLowerCase());
      const coachMatchesBatch =
        selectedBatchObj &&
        selectedBatchObj.coach &&
        selectedBatchObj.coach.toLowerCase().includes(coach.toLowerCase());

      if (!coachMatchesStudent && !coachMatchesBatch) {
        return false;
      }
    }

    // 5. Search filter
    if (query) {
      const matches =
        student.name?.toLowerCase().includes(query) ||
        student.id?.toLowerCase().includes(query) ||
        student.program?.toLowerCase().includes(query);
      if (!matches) return false;
    }

    return true;
  });
}

/**
 * Looks up a student's saved attendance status for a given date and batch/location.
 * Returns 'Present' | 'Absent' | 'Not Marked'.
 */
export function getSavedAttendanceRecord(records = [], { studentId, batchId = 'All', date, location = 'All' }) {
  return records.find((rec) => {
    if (rec.studentId !== studentId || rec.date !== date) return false;
    if (location !== 'All' && rec.location !== location) return false;
    if (batchId !== 'All' && rec.batchId !== batchId) return false;
    return true;
  }) || null;
}

/**
 * Resolves the primary batch object for a student when Admin edits attendance in "All" batch mode.
 */
export function resolveStudentBatch(student, classes = [], preferredBatchId = 'All') {
  if (preferredBatchId && preferredBatchId !== 'All') {
    const exact = classes.find((c) => c.id === preferredBatchId && c.center === student.center);
    if (exact) return exact;
  }

  const enrolledIds = Array.isArray(student.enrolledClasses) ? student.enrolledClasses : [];
  const enrolledMatch = classes.find(
    (c) => enrolledIds.includes(c.id) && c.center === student.center
  );
  if (enrolledMatch) return enrolledMatch;

  return (
    classes.find((c) => c.center === student.center && c.program === student.program) ||
    classes.find((c) => c.center === student.center) ||
    null
  );
}

/**
 * Upserts attendance records cleanly, preventing duplicate (studentId, batchId, date) rows
 * and ensuring records never mix across different academy locations.
 */
export function upsertBatchAttendanceRecords(
  existingRecords = [],
  {
    entries = [],
    date,
    location = 'All',
    batchId = 'All',
    students = [],
    classes = [],
    classSchedules = [],
    role,
    coachProfile = null,
    markedBy = 'Admin'
  }
) {
  if (!date) {
    return { success: false, error: 'Attendance date is required.' };
  }

  if (!entries || entries.length === 0) {
    return { success: false, error: 'No student attendance entries to save.' };
  }

  // If coach role, pre-verify batch & location ownership
  if (role === 'coach') {
    const targetBatch = classes.find((c) => c.id === batchId);
    const perm = validateAttendancePermission({
      role,
      coachProfile,
      batch: targetBatch,
      location,
      classSchedules
    });
    if (!perm.allowed) {
      return { success: false, error: perm.reason };
    }
  } else if (role !== 'admin') {
    return { success: false, error: 'Unauthorized role for attendance submission.' };
  }

  // Map existing records by composite key `${date}::${batchId}::${studentId}` to guarantee zero duplicates
  const recordMap = new Map();
  existingRecords.forEach((rec) => {
    const key = `${rec.date}::${rec.batchId}::${rec.studentId}`;
    recordMap.set(key, rec);
  });

  const nowIso = new Date().toISOString();
  let savedCount = 0;

  for (const entry of entries) {
    const { studentId, status } = entry;
    const student = students.find((s) => s.id === studentId);
    if (!student) continue;

    // Never mix attendance records between different locations
    if (location !== 'All' && student.center !== location) {
      return {
        success: false,
        error: `Location integrity violation: Student ${student.name} belongs to ${student.center}, not ${location}.`
      };
    }

    const resolvedBatch = resolveStudentBatch(student, classes, batchId);
    const effectiveBatchId = resolvedBatch?.id || (batchId !== 'All' ? batchId : 'UNASSIGNED');
    const effectiveBatchName = resolvedBatch?.name || `${student.program} Batch`;
    const effectiveLocation = student.center;
    const effectiveCoachId = resolvedBatch?.coachId || coachProfile?.id || '';
    const effectiveCoachName = resolvedBatch?.coach || student.coachName || 'Assigned Coach';

    const compositeKey = `${date}::${effectiveBatchId}::${studentId}`;

    if (status === ATTENDANCE_STATUSES.NOT_MARKED) {
      // Remove any existing marked entry if explicitly reset to Not Marked
      if (recordMap.has(compositeKey)) {
        recordMap.delete(compositeKey);
      }
      continue;
    }

    if (status !== ATTENDANCE_STATUSES.PRESENT && status !== ATTENDANCE_STATUSES.ABSENT) {
      return {
        success: false,
        error: `Invalid attendance status "${status}" for ${student.name}. Allowed: Present or Absent.`
      };
    }

    const updatedRecord = {
      id: `ATT-${date}-${effectiveBatchId}-${studentId}`,
      studentId,
      studentName: student.name,
      location: effectiveLocation,
      program: student.program,
      batchId: effectiveBatchId,
      batchName: effectiveBatchName,
      coachId: effectiveCoachId,
      coachName: effectiveCoachName,
      date,
      status,
      markedBy,
      markedByRole: role,
      updatedAt: nowIso
    };

    recordMap.set(compositeKey, updatedRecord);
    savedCount += 1;
  }

  // Sort newest dates first
  const nextRecords = Array.from(recordMap.values()).sort((a, b) =>
    b.date.localeCompare(a.date) || a.studentName.localeCompare(b.studentName)
  );

  return {
    success: true,
    records: nextRecords,
    savedCount
  };
}
