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

  // 3. Unique ID generation
  const studentId = generateUniquePrefixedId(students, 'STU');

  // 4. Create or Link Existing Parent (no duplicate parents!)
  const existingParent = findExistingParent(parents, {
    email: parentEmail,
    phone: parentPhone,
  });

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

    resolvedParent = {
      ...existingParent,
      name: existingParent.name || parentName,
      phone: existingParent.phone || parentPhone,
      email: existingParent.email || parentEmail,
      center: existingParent.center || finalLocation,
      centers: nextCenters,
      children: nextChildren,
      linkedStudentIds: nextLinkedIds,
      enquiryIds: nextEnquiryIds,
    };

    nextParents = parents.map((p) => (p.id === existingParent.id ? resolvedParent : p));

    // Sync child to parent's portal user account if present
    nextUserAccounts = nextUserAccounts.map((acc) => {
      if (
        acc.role === 'parent' &&
        (acc.email?.toLowerCase() === parentEmail ||
          (resolvedParent.email && acc.email?.toLowerCase() === resolvedParent.email.toLowerCase()))
      ) {
        return {
          ...acc,
          linkedStudents: Array.from(new Set([...(acc.linkedStudents || []), childName])),
        };
      }
      return acc;
    });
  } else {
    parentAction = 'created_new';
    const parentId = generateUniquePrefixedId(parents, 'PAR');

    const accountExists = nextUserAccounts.some(
      (acc) => acc.email?.toLowerCase() === parentEmail
    );

    if (!accountExists) {
      const tempPassword = `Spartan@${Math.floor(1000 + Math.random() * 9000)}`;
      const accId = generateUniquePrefixedId(nextUserAccounts, 'ACC');
      const newAccount = {
        id: accId,
        role: 'parent',
        name: parentName,
        email: parentEmail,
        phone: parentPhone,
        center: finalLocation,
        linkedStudents: [childName],
        status: 'Active',
        isTemporaryPassword: true,
        tempPasswordDisplay: tempPassword,
        createdAt: today,
        lastLogin: 'Never',
        permissions: ['VIEW_OWN_CHILDREN', 'MAKE_PAYMENTS', 'REQUEST_COMPENSATION'],
      };
      nextUserAccounts = [newAccount, ...nextUserAccounts];
      accountCreated = { account: newAccount, tempPassword };
    }

    resolvedParent = {
      id: parentId,
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
  const newStudent = {
    id: studentId,
    enquiryId: enquiry.id,
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
    },
  };
}
