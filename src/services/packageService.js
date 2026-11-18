/**
 * Little Spartans ZenConnect CRM - Student Class Package & Attendance Tracking Service
 *
 * Implements individual class package configuration, 3-month validity calculations,
 * strictly attendance-based consumption (Present only, demo/absent excluded, duplicate-safe),
 * 20-class parent reminder automation, and package lifecycle state transitions.
 */

export const PACKAGE_TOTAL_CLASSES = 24;
export const PACKAGE_DURATION_MONTHS = 3;
export const PACKAGE_REMINDER_THRESHOLD = 20;

export const PACKAGE_STATUSES = {
  NOT_ACTIVATED: 'Not Activated',
  ACTIVE: 'Active',
  REMINDER_DUE: 'Reminder Due',
  COMPLETED: 'Completed',
  EXPIRED: 'Expired'
};

export const PACKAGE_STATUS_CONFIG = {
  'Not Activated': {
    label: 'Not Activated',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dot: 'bg-slate-400'
  },
  Active: {
    label: 'Active',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500'
  },
  'Reminder Due': {
    label: 'Reminder Due',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
    dot: 'bg-amber-500'
  },
  Completed: {
    label: 'Completed',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500'
  },
  Expired: {
    label: 'Expired',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500'
  }
};

/**
 * Calculates package expiry date as exactly 3 months from the activation date.
 * Handles month-end wrapping accurately (e.g. Nov 18 -> Feb 18).
 */
export function calculatePackageExpiryDate(activationDate, durationMonths = PACKAGE_DURATION_MONTHS) {
  if (!activationDate) return '';
  const parts = activationDate.split('-');
  if (parts.length !== 3) return '';

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);

  const targetMonth = month + durationMonths;
  const targetDate = new Date(year, targetMonth, day);
  
  // If date rolled over past the end of target month (e.g. Jan 31 -> May 1 instead of Apr 30),
  // clamp to the last day of target month:
  if (targetDate.getMonth() !== (targetMonth % 12)) {
    const lastDayOfTargetMonth = new Date(year, targetMonth + 1, 0);
    const y = lastDayOfTargetMonth.getFullYear();
    const m = String(lastDayOfTargetMonth.getMonth() + 1).padStart(2, '0');
    const d = String(lastDayOfTargetMonth.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Format as YYYY-MM-DD
  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Extracts and deduplicates valid regular attendance records that consume package classes.
 * 
 * Rules:
 * 1. Must match student ID.
 * 2. Must be on or after package activation date.
 * 3. Status must strictly be 'Present' (Absent, Leave, Cancelled do not count).
 * 4. Demo sessions (isDemo === true, batchId === 'DEMO', or type === 'demo') never deduct.
 * 5. Deduplicates by session date + batchId so duplicate submissions do not deduct twice.
 */
export function getStudentPackageAttendance(student, attendanceRecords = []) {
  if (!student || !student.packageActivationDate) {
    return [];
  }

  const activationDate = student.packageActivationDate;
  const eligible = [];
  const seenSessions = new Set();

  // Sort chronological
  const records = [...attendanceRecords]
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  for (const rec of records) {
    // 1. Must be on or after package activation date
    if (rec.date < activationDate) {
      continue;
    }

    // 2. Demo classes must never be included in the 24-class package calculation
    if (rec.isDemo === true || rec.batchId === 'DEMO' || rec.type === 'demo' || (rec.program || '').toLowerCase().includes('demo')) {
      continue;
    }

    // 3. Only 'Present' consumes a class
    if (rec.status !== 'Present') {
      continue;
    }

    // 4. Duplicate attendance record must not deduct twice
    const sessionKey = `${rec.date}::${rec.batchId || rec.program || 'class'}`;
    if (seenSessions.has(sessionKey)) {
      continue;
    }
    seenSessions.add(sessionKey);

    eligible.push(rec);
  }

  return eligible;
}

/**
 * Computes individual package status, progress and reminder states for a student.
 */
export function computeStudentPackage(student, attendanceRecords = [], asOfDate = new Date().toISOString().split('T')[0]) {
  if (!student) {
    return {
      packageActivated: false,
      activationDate: null,
      expiryDate: null,
      totalClasses: PACKAGE_TOTAL_CLASSES,
      classesAttended: 0,
      classesRemaining: PACKAGE_TOTAL_CLASSES,
      usagePercentage: 0,
      isExpired: false,
      status: PACKAGE_STATUSES.NOT_ACTIVATED,
      reminderStatus: 'Not Activated',
      eligibleRecords: []
    };
  }

  const packageActivated = Boolean(student.packageActivationDate);
  const activationDate = student.packageActivationDate || null;
  const expiryDate = student.packageExpiryDate || (activationDate ? calculatePackageExpiryDate(activationDate) : null);

  if (!packageActivated) {
    const allRecords = (attendanceRecords || []).filter(r => r.studentId === student.id);
    return {
      packageActivated: false,
      activationDate: null,
      expiryDate: null,
      packageCycle: student.packageCycle || 1,
      totalClasses: PACKAGE_TOTAL_CLASSES,
      classesAttended: 0,
      classesRemaining: PACKAGE_TOTAL_CLASSES,
      usagePercentage: 0,
      percentage: 0,
      isExpired: false,
      isReminderDue: false,
      isCompleted: false,
      status: PACKAGE_STATUSES.NOT_ACTIVATED,
      reminderStatus: 'Pending Activation',
      eligibleRecords: [],
      attendanceBreakdown: allRecords
    };
  }

  // Get strictly valid Present attendance records
  const eligibleRecords = getStudentPackageAttendance(student, attendanceRecords);
  const classesAttended = eligibleRecords.length;
  const classesRemaining = Math.max(0, PACKAGE_TOTAL_CLASSES - classesAttended);
  const usagePercentage = Math.min(100, Math.round((classesAttended / PACKAGE_TOTAL_CLASSES) * 100));

  const isExpired = expiryDate ? asOfDate > expiryDate : false;

  // Derive package status
  let status = PACKAGE_STATUSES.ACTIVE;
  if (classesAttended >= PACKAGE_TOTAL_CLASSES) {
    status = PACKAGE_STATUSES.COMPLETED;
  } else if (isExpired) {
    status = PACKAGE_STATUSES.EXPIRED;
  } else if (classesAttended >= PACKAGE_REMINDER_THRESHOLD) {
    status = PACKAGE_STATUSES.REMINDER_DUE;
  }

  // Derive reminder status
  let reminderStatus = 'On Track';
  if (classesAttended >= PACKAGE_TOTAL_CLASSES) {
    reminderStatus = 'Completed (Renewal Due)';
  } else if (classesAttended >= PACKAGE_REMINDER_THRESHOLD) {
    reminderStatus = `Reminder Due (${classesRemaining} Left)`;
  } else if (classesRemaining <= 4) {
    reminderStatus = `Approaching Renewal (${classesRemaining} Left)`;
  }

  const allRecords = (attendanceRecords || []).filter(r => r.studentId === student.id);

  return {
    packageActivated: true,
    activationDate,
    expiryDate,
    packageCycle: student.packageCycle || 1,
    totalClasses: PACKAGE_TOTAL_CLASSES,
    classesAttended,
    classesRemaining,
    usagePercentage,
    percentage: usagePercentage,
    isExpired,
    isReminderDue: status === PACKAGE_STATUSES.REMINDER_DUE,
    isCompleted: status === PACKAGE_STATUSES.COMPLETED,
    status,
    reminderStatus,
    eligibleRecords,
    attendanceBreakdown: allRecords
  };
}

/**
 * Computes aggregate summary metrics across all student packages.
 */
export function calculatePackageOverviewMetrics(students = [], attendanceRecords = [], asOfDate = new Date().toISOString().split('T')[0]) {
  let totalEnrolled = students.length;
  let activePackages = 0;
  let reminderDueCount = 0;
  let lowClassesCount = 0; // 1-4 classes remaining
  let completedPackages = 0;
  let expiredPackages = 0;
  let notActivatedCount = 0;

  students.forEach((student) => {
    const pkg = computeStudentPackage(student, attendanceRecords, asOfDate);
    if (!pkg.packageActivated) {
      notActivatedCount += 1;
      return;
    }

    if (pkg.status === PACKAGE_STATUSES.ACTIVE) {
      activePackages += 1;
      if (pkg.classesRemaining >= 1 && pkg.classesRemaining <= 4) {
        lowClassesCount += 1;
      }
    } else if (pkg.status === PACKAGE_STATUSES.REMINDER_DUE) {
      reminderDueCount += 1;
      if (pkg.classesRemaining >= 1 && pkg.classesRemaining <= 4) {
        lowClassesCount += 1;
      }
    } else if (pkg.status === PACKAGE_STATUSES.COMPLETED) {
      completedPackages += 1;
    } else if (pkg.status === PACKAGE_STATUSES.EXPIRED) {
      expiredPackages += 1;
    }
  });

  return {
    totalEnrolled,
    totalStudents: totalEnrolled,
    activePackages,
    reminderDueCount,
    reminderDue: reminderDueCount,
    lowClassesCount,
    remaining1to4: lowClassesCount,
    completedPackages,
    completed: completedPackages,
    expiredPackages,
    expired: expiredPackages,
    notActivatedCount,
    notActivated: notActivatedCount
  };
}
