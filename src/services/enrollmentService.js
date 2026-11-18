/**
 * Little Spartans ZenConnect CRM - Enquiry-to-Enrollment Integration Service
 *
 * Implements atomic, validated, duplicate-safe transaction logic linking:
 *   Enquiry -> Student Record -> Parent Record (Create or Link Existing) -> Batch & Location Sync
 *
 * ============================================================================
 * BACKEND INTEGRATION REQUIRED:
 * - POST /api/v1/enquiries/:enquiryId/enroll
 *   Runs inside a single SQL transaction (`BEGIN ... COMMIT / ROLLBACK`):
 *     1. Lock enquiry row (`SELECT ... FOR UPDATE`) and verify `stage != 'Enrolled'`
 *        and no student row exists with `enquiry_id = :enquiryId`.
 *     2. Validate required child, parent, program, and location fields.
 *     3. Lookup existing parent by unique `(email)` or `(phone)`; reuse & append child
 *        if found, or insert new parent row carrying forward `enquiry.location`.
 *     4. Insert student row with `location = enquiry.location`, `program`, `batch_id`,
 *        `parent_id`, and `enquiry_id`, with unique constraints:
 *          - UNIQUE (enquiry_id) on `students`
 *          - UNIQUE (email) on `parents` / `users`
 *     5. Update batch slot count if `preferred_batch_id` is assigned.
 *     6. Update original enquiry row (`stage = 'Enrolled'`, `enrolled_student_id`,
 *        `enrolled_parent_id`, `enrolled_at`).
 * - PATCH /api/v1/enquiries/:enquiryId
 * - PATCH /api/v1/students/:studentId
 * - PATCH /api/v1/parents/:parentId
 * ============================================================================
 */

export function normalizePhoneDigits(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Generates an automatic secure Spartan parent password
 * Format: Spartan@<last4PhoneDigits> (e.g. Spartan@3112) or Spartan@<4Digits>
 */
export function generateParentPassword(phone = '') {
  const digits = normalizePhoneDigits(phone);
  const suffix = digits.length >= 4 ? digits.slice(-4) : String(Math.floor(1000 + Math.random() * 9000));
  return `Spartan@${suffix}`;
}

export function calculateAgeFromDob(dob) {
  if (!dob) return null;
  const birth = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

/**
 * Generates a collision-free prefixed ID (e.g. STU-001, PAR-001, ACC-002)
 * by scanning max existing numeric suffix rather than relying on array length.
 */
export function generateUniquePrefixedId(items = [], prefix = 'REC') {
  const regex = new RegExp(`^${prefix}-(\\d+)$`, 'i');
  let maxNum = 0;
  items.forEach((item) => {
    const match = regex.exec(String(item?.id || ''));
    if (match) {
      const n = parseInt(match[1], 10);
      if (!Number.isNaN(n) && n > maxNum) maxNum = n;
    }
  });
  return `${prefix}-${String(maxNum + 1).padStart(3, '0')}`;
}

/**
 * Known academy location codes mapping
 */
export const LOCATION_CODES = {
  'KK NAGAR': 'KKN',
  'ANNA NAGAR': 'ANN',
  'KILPAUK': 'KLP',
  'MAHALINGAPURAM': 'MHL',
  'KOLATHUR': 'KOL',
};

/**
 * Returns standardized 3-letter location code (e.g. KKN, ANN, KLP)
 */
export function getLocationCode(locationName = '') {
  const normalized = String(locationName || '').trim().toUpperCase();
  if (LOCATION_CODES[normalized]) return LOCATION_CODES[normalized];

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    if (words[0] === 'KK') return 'KKN';
    return (words[0].slice(0, 2) + words[1].slice(0, 1)).toUpperCase();
  }
  return (normalized.replace(/[^A-Z]/g, '').slice(0, 3) || 'KKN').padEnd(3, 'X');
}

/**
 * Generates a collision-free permanent location-based Common Member ID:
 * Used identically for both Kid ID and Parent ID (One Common ID).
 * Format: LS-[LOCATION_CODE]-[YEAR]-[SEQUENCE]
 * Examples: LS-KKN-2026-001, LS-ANN-2026-001, LS-KLP-2026-001
 */
export function generateCommonMemberId(students = [], parents = [], locationName = '', customYear) {
  const locCode = getLocationCode(locationName);
  const currentYear = customYear || new Date().getFullYear();
  const prefix = `LS-${locCode}-${currentYear}`;
  const regex = new RegExp(`^LS-${locCode}-${currentYear}-(\\d+)$`, 'i');

  let maxSeq = 0;
  (students || []).forEach((s) => {
    const match = regex.exec(String(s?.id || ''));
    if (match) {
      const num = parseInt(match[1], 10);
      if (!Number.isNaN(num) && num > maxSeq) maxSeq = num;
    }
  });

  (parents || []).forEach((p) => {
    const match = regex.exec(String(p?.id || ''));
    if (match) {
      const num = parseInt(match[1], 10);
      if (!Number.isNaN(num) && num > maxSeq) maxSeq = num;
    }
  });

  const nextSeq = String(maxSeq + 1).padStart(3, '0');
  return `${prefix}-${nextSeq}`;
}

export function generateLocationKidId(students = [], locationName = '', customYear) {
  return generateCommonMemberId(students, [], locationName, customYear);
}

/**
 * Finds an existing parent by normalized email or normalized 10-digit phone
 * to prevent duplicate parent records when enrolling siblings.
 */
export function findExistingParent(parents = [], { email = '', phone = '' } = {}) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedPhone = normalizePhoneDigits(phone);

  return (
    parents.find((p) => {
      const pEmail = String(p.email || '').trim().toLowerCase();
      const pPhone = normalizePhoneDigits(p.phone || '');
      const emailMatch = Boolean(normalizedEmail && pEmail && normalizedEmail === pEmail);
      const phoneMatch = Boolean(
        normalizedPhone && normalizedPhone.length >= 7 && pPhone && normalizedPhone === pPhone
      );
      return emailMatch || phoneMatch;
    }) || null
  );
}

/**
 * Validates required enquiry details prior to executing an enrollment transaction.
 */
export function validateEnquiryForEnrollment(enquiry, overrides = {}, activeLocations = []) {
  const merged = { ...(enquiry || {}), ...(overrides || {}) };
  const errors = [];

  if (!merged.childName || !String(merged.childName).trim()) {
    errors.push("Child's name is required.");
  }

  const computedAge = merged.dob ? calculateAgeFromDob(merged.dob) : null;
  const numericAge = computedAge ?? parseInt(merged.childAge, 10);
  if (Number.isNaN(numericAge) || numericAge < 2 || numericAge > 18) {
    errors.push("Valid child Date of Birth or Age (2–18 years) is required.");
  }

  if (!merged.gender || !String(merged.gender).trim()) {
    errors.push('Child gender is required.');
  }

  if (!merged.parentName || !String(merged.parentName).trim()) {
    errors.push('Parent / Guardian name is required.');
  }

  const phoneDigits = normalizePhoneDigits(merged.phone);
  if (!phoneDigits || phoneDigits.length < 7) {
    errors.push('Valid parent mobile number (at least 7 digits) is required.');
  }

  const email = String(merged.email || '').trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid parent email address is required.');
  }

  if (!merged.interestedProgram || !String(merged.interestedProgram).trim()) {
    errors.push('Interested sports program is required.');
  }

  if (!merged.center || !String(merged.center).trim()) {
    errors.push('Preferred academy location is required.');
  } else if (
    Array.isArray(activeLocations) &&
    activeLocations.length > 0 &&
    !activeLocations.some((l) => l.name === merged.center)
  ) {
    errors.push(`Selected academy location "${merged.center}" is invalid or inactive.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    resolvedAge: numericAge,
  };
}

/**
 * Executes an atomic Enquiry -> Student -> Parent -> Batch enrollment transition.
 * Guarantees no partial or duplicate records are written if validation or duplicate checks fail.
 */
export function executeEnquiryEnrollmentTransaction(
  stateSnapshot,
  { enquiryId, overrides = {}, activeLocations = [] }
) {
  const enquiries = stateSnapshot?.enquiries || [];
  const students = stateSnapshot?.students || [];
  const parents = stateSnapshot?.parents || [];
  const classes = stateSnapshot?.classes || [];
  const coaches = stateSnapshot?.coaches || [];
  const userAccounts = stateSnapshot?.userAccounts || [];

  const enquiry = enquiries.find((e) => e.id === enquiryId);
  if (!enquiry) {
    return { success: false, errors: ['Original enquiry record could not be found.'] };
  }

  // 1. Duplicate enrollment prevention (stage flag OR existing linked student)
  const existingLinkedStudent = students.find((s) => s.enquiryId === enquiry.id);
  if (enquiry.stage === 'Enrolled' || existingLinkedStudent) {
    return {
      success: false,
      duplicate: true,
      errors: [
        `Enquiry ${enquiry.id} is already enrolled${
          existingLinkedStudent ? ` (Student ID: ${existingLinkedStudent.id})` : ''
        }. Duplicate enrollment prevented.`,
      ],
      existingStudent: existingLinkedStudent || null,
    };
  }

  // 2. Strict pre-flight validation (all or nothing)
  const validation = validateEnquiryForEnrollment(enquiry, overrides, activeLocations);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }

  const merged = { ...enquiry, ...overrides };
  const today = new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString();

  // Carry forward exact Location, Program & Batch without substituting defaults
  const finalLocation = String(merged.center).trim();
  const finalProgram = String(merged.interestedProgram).trim();
  const childName = String(merged.childName).trim();
  const parentName = String(merged.parentName).trim();
  const parentPhone = String(merged.phone).trim();
  const parentEmail = String(merged.email).trim().toLowerCase();

  // Optional batch verification (scoped strictly to finalLocation)
  const requestedBatchId = merged.preferredBatchId || '';
  const selectedBatch = requestedBatchId
    ? classes.find((c) => c.id === requestedBatchId && c.center === finalLocation)
    : null;

  if (requestedBatchId && !selectedBatch) {
    return {
      success: false,
      errors: [`Selected batch is not available at ${finalLocation}. Please pick a valid batch for this location.`],
    };
  }

  // Prevent duplicate identical student (same child name + parent phone/email + location)
  const duplicateStudent = students.find(
    (s) =>
      s.center === finalLocation &&
      s.name?.trim().toLowerCase() === childName.toLowerCase() &&
      ((s.parentEmail && s.parentEmail.toLowerCase() === parentEmail) ||
        (s.parentPhone && normalizePhoneDigits(s.parentPhone) === normalizePhoneDigits(parentPhone)))
  );
  if (duplicateStudent) {
    return {
      success: false,
      duplicate: true,
      errors: [
        `Student "${childName}" already exists under ${parentName} at ${finalLocation} (${duplicateStudent.id}).`,
      ],
    };
  }

  // 3. Unique permanent location-based Member ID generation (One Common ID for Parent & Kid)
  // Format: LS-[LOCATION_CODE]-[YEAR]-[SEQUENCE] (e.g. LS-KKN-2026-001)
  const existingParent = findExistingParent(parents, {
    email: parentEmail,
    phone: parentPhone,
  });

  const commonMemberId = (existingParent?.id && existingParent.id.startsWith('LS-'))
    ? existingParent.id
    : generateCommonMemberId(students, parents, finalLocation);

  const studentId = commonMemberId;
  const parentId = commonMemberId;
  const autoGeneratedPassword = generateParentPassword(parentPhone);

  let resolvedParent;
  let parentAction;
  let nextParents;
  let nextUserAccounts = [...userAccounts];
  let accountCreated = null;

  if (existingParent) {
    parentAction = 'linked_existing';
    const nextChildren = Array.from(new Set([...(existingParent.children || []), childName]));
    const nextLinkedIds = Array.from(new Set([...(existingParent.linkedStudentIds || []), studentId]));
    const nextEnquiryIds = Array.from(new Set([...(existingParent.enquiryIds || []), enquiry.id]));
    const nextCenters = Array.from(
      new Set([existingParent.center, ...(existingParent.centers || []), finalLocation].filter(Boolean))
    );
    const existingPass = existingParent.password || existingParent.tempPassword || autoGeneratedPassword;

    resolvedParent = {
      ...existingParent,
      id: parentId, // Harmonize to common member ID
      name: existingParent.name || parentName,
      phone: existingParent.phone || parentPhone,
      email: existingParent.email || parentEmail,
      center: existingParent.center || finalLocation,
      centers: nextCenters,
      children: nextChildren,
      linkedStudentIds: nextLinkedIds,
      enquiryIds: nextEnquiryIds,
      password: existingPass,
      tempPassword: existingPass,
      tempPasswordDisplay: existingPass,
      portalAccess: true,
      status: 'Active',
    };

    nextParents = parents.map((p) => (p.id === existingParent.id ? resolvedParent : p));

    // Sync child to parent's portal user account if present, or create if missing
    let accountFound = false;
    nextUserAccounts = nextUserAccounts.map((acc) => {
      if (
        acc.role === 'parent' &&
        (acc.email?.toLowerCase() === parentEmail ||
          (resolvedParent.email && acc.email?.toLowerCase() === resolvedParent.email.toLowerCase()))
      ) {
        accountFound = true;
        const currentLocs = Array.isArray(acc.locations) && acc.locations.length > 0 ? acc.locations : [finalLocation];
        const nextLocs = Array.from(new Set([...currentLocs, finalLocation]));
        return {
          ...acc,
          center: finalLocation,
          locations: nextLocs,
          tempPasswordDisplay: acc.tempPasswordDisplay || existingPass,
          password: acc.password || existingPass,
          linkedStudents: Array.from(new Set([...(acc.linkedStudents || []), childName])),
          status: 'Active',
        };
      }
      return acc;
    });

    if (!accountFound) {
      const newAccount = {
        id: `ACC-${parentId}`,
        role: 'parent',
        name: resolvedParent.name,
        email: resolvedParent.email,
        phone: resolvedParent.phone,
        center: finalLocation,
        locations: [finalLocation],
        linkedStudents: resolvedParent.children,
        status: 'Active',
        isTemporaryPassword: true,
        password: existingPass,
        tempPasswordDisplay: existingPass,
        createdAt: today,
        lastLogin: 'Never',
        permissions: ['VIEW_OWN_CHILDREN', 'MAKE_PAYMENTS', 'REQUEST_COMPENSATION'],
      };
      nextUserAccounts = [newAccount, ...nextUserAccounts];
      accountCreated = { account: newAccount, tempPassword: existingPass };
    }
  } else {
    parentAction = 'created_new';

    const accountExists = nextUserAccounts.some(
      (acc) => acc.email?.toLowerCase() === parentEmail
    );

    if (!accountExists) {
      const newAccount = {
        id: `ACC-${parentId}`,
        role: 'parent',
        name: parentName,
        email: parentEmail,
        phone: parentPhone,
        center: finalLocation,
        locations: [finalLocation],
        linkedStudents: [childName],
        status: 'Active',
        isTemporaryPassword: true,
        password: autoGeneratedPassword,
        tempPasswordDisplay: autoGeneratedPassword,
        createdAt: today,
        lastLogin: 'Never',
        permissions: ['VIEW_OWN_CHILDREN', 'MAKE_PAYMENTS', 'REQUEST_COMPENSATION'],
      };
      nextUserAccounts = [newAccount, ...nextUserAccounts];
      accountCreated = { account: newAccount, tempPassword: autoGeneratedPassword };
    }

    resolvedParent = {
      id: parentId, // Exactly the same ID as studentId
      name: parentName,
      phone: parentPhone,
      email: parentEmail,
      center: finalLocation,
      centers: [finalLocation],
      address: `${finalLocation}, Chennai`,
      children: [childName],
      linkedStudentIds: [studentId],
      enquiryIds: [enquiry.id],
      totalFeesPaid: '₹0',
      pendingDue: '₹0',
      portalAccess: true,
      status: 'Active',
      createdAt: today,
      password: autoGeneratedPassword,
      tempPassword: autoGeneratedPassword,
      tempPasswordDisplay: autoGeneratedPassword,
    };

    nextParents = [resolvedParent, ...parents];
  }

  // 5. Resolve Coach & Batch Assignment
  const batchCoachName =
    selectedBatch?.coach && selectedBatch.coach !== 'Unassigned'
      ? selectedBatch.coach
      : coaches.find((c) => c.center === finalLocation)?.name || coaches[0]?.name || 'Unassigned';

  let nextClasses = [...classes];
  let enrolledBatchNames = [];
  let batchEnrollmentState = 'none';

  if (selectedBatch) {
    const currentEnrolled = selectedBatch.enrolledStudentIds || [];
    const currentWaitlist = selectedBatch.waitlistStudentIds || [];
    const cap = selectedBatch.capacity || 15;

    if (currentEnrolled.length < cap) {
      const updatedEnrolledIds = Array.from(new Set([...currentEnrolled, studentId]));
      nextClasses = classes.map((c) =>
        c.id === selectedBatch.id
          ? {
              ...c,
              enrolledStudentIds: updatedEnrolledIds,
              enrolled: updatedEnrolledIds.length,
            }
          : c
      );
      enrolledBatchNames = [selectedBatch.name];
      batchEnrollmentState = 'enrolled';
    } else {
      const updatedWaitlistIds = Array.from(new Set([...currentWaitlist, studentId]));
      nextClasses = classes.map((c) =>
        c.id === selectedBatch.id
          ? {
              ...c,
              waitlistStudentIds: updatedWaitlistIds,
            }
          : c
      );
      batchEnrollmentState = 'waitlisted';
    }
  }

  // 6. Create Student Record
  const targetDemoId = merged.demoId || enquiry.demoId || null;

  const newStudent = {
    id: studentId,
    enquiryId: enquiry.id,
    demoId: targetDemoId,
    parentId: resolvedParent.id,
    name: childName,
    dob: merged.dob || '',
    age: validation.resolvedAge,
    gender: merged.gender,
    parentName: resolvedParent.name,
    parentPhone: resolvedParent.phone,
    parentEmail: resolvedParent.email,
    program: finalProgram,
    center: finalLocation,
    preferredBatchId: selectedBatch?.id || '',
    batchName: selectedBatch?.name || merged.preferredBatchName || '',
    enrolledClasses: enrolledBatchNames,
    coachName: batchCoachName,
    rank: 'Little Spartan Recruit',
    status: 'Active',
    enrollmentStatus: 'Enrolled',
    feeStatus: 'Pending',
    joinDate: today,
    attendanceRate: 100,
    medicalNote: merged.notes || 'Enrolled via Admission Enquiry',
    badges: ['New Spartan Recruit'],
    avatar:
      'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80',
  };

  const nextStudents = [newStudent, ...students];

  // 7. Update Demo Record if linked
  const demos = stateSnapshot?.demos || [];
  const nextDemos = demos.map((d) => {
    if (d.id === targetDemoId) {
      return {
        ...d,
        convertedToStudent: true,
        studentId,
        status: 'Completed',
        updatedAt: nowIso,
        history: [
          {
            id: `HIST-${Date.now()}-conv`,
            timestamp: nowIso,
            action: `Converted to Student (${studentId})`,
            fromStatus: d.status,
            toStatus: 'Completed',
            date: d.demoDate,
            time: d.demoTime,
            location: d.location,
            coachName: d.coachName,
            note: `Successfully enrolled as Student ${studentId} (${childName}) under Parent ${resolvedParent.name}.`,
            updatedBy: 'Admin',
          },
          ...(d.history || []),
        ],
      };
    }
    return d;
  });

  // 7. Update Original Enquiry (preserved for future reference & auditability)
  const updatedEnquiry = {
    ...enquiry,
    ...overrides,
    center: finalLocation,
    interestedProgram: finalProgram,
    childAge: validation.resolvedAge,
    stage: 'Enrolled',
    enrolledStudentId: newStudent.id,
    enrolledParentId: resolvedParent.id,
    preferredBatchId: selectedBatch?.id || merged.preferredBatchId || '',
    preferredBatchName: selectedBatch?.name || merged.preferredBatchName || '',
    enrollmentCompletedAt: nowIso,
  };

  const nextEnquiries = enquiries.map((e) => (e.id === enquiry.id ? updatedEnquiry : e));

  return {
    success: true,
    student: newStudent,
    parent: resolvedParent,
    parentAction,
    accountCreated,
    batchEnrollmentState,
    enquiry: updatedEnquiry,
    nextStateSlice: {
      students: nextStudents,
      parents: nextParents,
      userAccounts: nextUserAccounts,
      classes: nextClasses,
      enquiries: nextEnquiries,
      demos: nextDemos,
    },
  };
}
