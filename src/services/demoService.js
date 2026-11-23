/**
 * Little Spartans ZenConnect CRM - Demo Management Service
 * Domain logic for Enquiry Sources, Demo Bookings, Coach Filtering,
 * History Logging, and Demo-to-Student Conversion.
 */

export const ENQUIRY_SOURCES = {
  WEBSITE: 'Website',
  INSTAGRAM: 'Instagram',
  WHATSAPP: 'WhatsApp',
  MANUAL: 'Manual / Walk-in',
  OTHER: 'Other',
};

export const ENQUIRY_SOURCE_CONFIG = {
  [ENQUIRY_SOURCES.WEBSITE]: {
    label: 'Website',
    color: 'blue',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    dotClass: 'bg-blue-500',
    iconName: 'Globe',
  },
  [ENQUIRY_SOURCES.INSTAGRAM]: {
    label: 'Instagram',
    color: 'pink',
    badgeClass: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
    dotClass: 'bg-fuchsia-500',
    iconName: 'Instagram',
  },
  [ENQUIRY_SOURCES.WHATSAPP]: {
    label: 'WhatsApp',
    color: 'green',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500',
    iconName: 'MessageCircle',
  },
  [ENQUIRY_SOURCES.MANUAL]: {
    label: 'Manual / Walk-in',
    color: 'orange',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    dotClass: 'bg-[#F4510B]',
    iconName: 'UserCheck',
  },
  [ENQUIRY_SOURCES.OTHER]: {
    label: 'Other',
    color: 'grey',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    dotClass: 'bg-slate-500',
    iconName: 'HelpCircle',
  },
};

export const DEMO_STATUSES = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
  RESCHEDULED: 'Rescheduled',
};

export const DEMO_STATUS_CONFIG = {
  [DEMO_STATUSES.SCHEDULED]: {
    label: 'Scheduled',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
  },
  [DEMO_STATUSES.CONFIRMED]: {
    label: 'Confirmed',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotClass: 'bg-indigo-500',
  },
  [DEMO_STATUSES.COMPLETED]: {
    label: 'Completed',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  [DEMO_STATUSES.CANCELLED]: {
    label: 'Cancelled',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
  },
  [DEMO_STATUSES.NO_SHOW]: {
    label: 'No Show',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  [DEMO_STATUSES.RESCHEDULED]: {
    label: 'Rescheduled',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500',
  },
};

export const CONVERSION_STAGES = [
  'Pending Demo',
  'Demo Attended',
  'Demo Absent',
  'Re-demo Requested',
  'Converted to Student',
  'Not Converted',
];

export const CONVERSION_STAGE_CONFIG = {
  'Pending Demo': {
    label: 'Pending Demo',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    dotClass: 'bg-amber-500',
  },
  'Demo Attended': {
    label: 'Demo Attended',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    dotClass: 'bg-blue-500',
  },
  'Demo Absent': {
    label: 'Demo Absent',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
    dotClass: 'bg-rose-500',
  },
  'Re-demo Requested': {
    label: 'Re-demo Requested',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    dotClass: 'bg-purple-500',
  },
  'Converted to Student': {
    label: 'Converted to Student',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100',
    dotClass: 'bg-emerald-500',
  },
  'Not Converted': {
    label: 'Not Converted',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200',
    dotClass: 'bg-slate-400',
  },
};

export function calculateAgeFromDob(dob) {
  if (!dob) return null;
  const birth = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
}

export const ENQUIRY_STAGES = {
  NEW: 'New Enquiry',
  FOLLOW_UP: 'Follow-up',
  INTERESTED: 'Interested',
  DEMO_SCHEDULED: 'Demo Scheduled',
  DEMO_COMPLETED: 'Demo Completed',
  DEMO_CANCELLED: 'Demo Cancelled',
  DEMO_NO_SHOW: 'Demo No Show',
  ENROLLED: 'Enrolled',
  LOST: 'Closed / Lost',
};

/**
 * Filter coaches eligible for a demo based on selected academy location and sports program.
 * Falls back to active coaches if no exact match.
 */
export function filterCoachesForDemo({ coaches = [], location = '', program = '' }) {
  if (!Array.isArray(coaches)) return [];
  const normalizedLoc = String(location || '').trim().toUpperCase();
  const normalizedProg = String(program || '').trim().toLowerCase();

  const matched = coaches.filter(c => {
    if (c.status === 'Inactive') return false;
    const coachLoc = String(c.center || '').trim().toUpperCase();
    const locMatch = !normalizedLoc || coachLoc === normalizedLoc || coachLoc.includes(normalizedLoc);
    
    if (!normalizedProg) return locMatch;
    const spec = String(c.specialization || '').toLowerCase();
    const progMatch = spec.includes(normalizedProg) || normalizedProg.includes(spec) || spec.includes('multi-sports') || spec.includes('athletics');
    return locMatch && progMatch;
  });

  // If strict match produces none, fallback to coaches at that location
  if (matched.length === 0 && normalizedLoc) {
    const locOnly = coaches.filter(c => {
      if (c.status === 'Inactive') return false;
      const coachLoc = String(c.center || '').trim().toUpperCase();
      return coachLoc === normalizedLoc || coachLoc.includes(normalizedLoc);
    });
    if (locOnly.length > 0) return locOnly;
  }

  // Fallback to all active coaches
  return matched.length > 0 ? matched : coaches.filter(c => c.status !== 'Inactive');
}

/**
 * Validate demo booking payload
 */
export function validateDemoPayload(payload, activeLocations = []) {
  const errors = [];
  if (!payload.childName || !payload.childName.trim()) {
    errors.push("Child's name is required.");
  }
  if (!payload.dob || !String(payload.dob).trim()) {
    errors.push("Child's Date of Birth (DOB) is required.");
  }
  if (!payload.parentName || !payload.parentName.trim()) {
    errors.push("Parent/Guardian name is required.");
  }
  if (!payload.phone || !payload.phone.trim()) {
    errors.push("Parent contact number is required.");
  }
  if (!payload.location || !payload.location.trim()) {
    errors.push("Academy location is mandatory for scheduling a demo.");
  } else if (activeLocations.length > 0) {
    const valid = activeLocations.some(
      l => (l.name || l).toLowerCase() === payload.location.trim().toLowerCase()
    );
    if (!valid) {
      errors.push(`Selected location "${payload.location}" is not recognized.`);
    }
  }
  if (!payload.program || !payload.program.trim()) {
    errors.push("Sports program is required.");
  }
  if (!payload.demoDate || !payload.demoDate.trim()) {
    errors.push("Demo date is required.");
  }
  if (!payload.demoTime || !payload.demoTime.trim()) {
    errors.push("Demo time is required.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Build a new Demo record with unique ID and initial history log
 */
export function buildDemoRecord(payload, existingDemos = [], createdBy = 'Admin') {
  const count = existingDemos.length + 1;
  const id = `DEMO-${String(count).padStart(3, '0')}`;
  const now = new Date().toISOString();

  const computedAge = payload.dob ? calculateAgeFromDob(payload.dob) : null;
  const childAge = computedAge !== null ? String(computedAge) : (payload.childAge || '');

  return {
    id,
    enquiryId: payload.enquiryId || '',
    childName: payload.childName.trim(),
    childAge,
    gender: payload.gender || 'Male',
    dob: payload.dob ? String(payload.dob).trim() : '',
    parentName: payload.parentName.trim(),
    phone: payload.phone.trim(),
    email: payload.email ? payload.email.trim() : '',
    location: payload.location.trim(),
    program: payload.program.trim(),
    demoDate: payload.demoDate,
    demoTime: payload.demoTime,
    coachId: payload.coachId || '',
    coachName: payload.coachName || '',
    notes: payload.notes || '',
    status: payload.status || DEMO_STATUSES.SCHEDULED,
    conversionStatus: payload.conversionStatus || 'Pending Demo',
    convertedToStudent: payload.conversionStatus === 'Converted to Student' || false,
    studentId: payload.studentId || null,
    createdAt: now,
    updatedAt: now,
    history: [
      {
        id: `HIST-${Date.now()}-01`,
        timestamp: now,
        action: 'Demo Scheduled',
        fromStatus: null,
        toStatus: payload.status || DEMO_STATUSES.SCHEDULED,
        date: payload.demoDate,
        time: payload.demoTime,
        location: payload.location.trim(),
        coachName: payload.coachName || '',
        note: payload.notes || 'Initial demo session scheduled via Admin Portal.',
        updatedBy: createdBy,
      },
    ],
  };
}

/**
 * Reschedule a Demo record and append history log
 */
export function rescheduleDemoRecord(demo, updates, updatedBy = 'Admin') {
  const now = new Date().toISOString();
  const prevDate = demo.demoDate;
  const prevTime = demo.demoTime;
  const prevLoc = demo.location;
  const prevCoach = demo.coachName;

  const historyEntry = {
    id: `HIST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: now,
    action: 'Demo Rescheduled',
    fromStatus: demo.status,
    toStatus: updates.status || DEMO_STATUSES.RESCHEDULED,
    previousDate: prevDate,
    previousTime: prevTime,
    previousLocation: prevLoc,
    previousCoach: prevCoach,
    date: updates.demoDate || prevDate,
    time: updates.demoTime || prevTime,
    location: updates.location || prevLoc,
    coachName: updates.coachName || prevCoach,
    note: updates.rescheduleReason || updates.notes || `Rescheduled from ${prevDate} ${prevTime} to ${updates.demoDate} ${updates.demoTime}.`,
    updatedBy,
  };

  return {
    ...demo,
    demoDate: updates.demoDate || demo.demoDate,
    demoTime: updates.demoTime || demo.demoTime,
    location: updates.location || demo.location,
    coachId: updates.coachId !== undefined ? updates.coachId : demo.coachId,
    coachName: updates.coachName !== undefined ? updates.coachName : demo.coachName,
    notes: updates.notes ? `${demo.notes ? demo.notes + ' | ' : ''}${updates.notes}` : demo.notes,
    status: updates.status || DEMO_STATUSES.RESCHEDULED,
    updatedAt: now,
    history: [historyEntry, ...(demo.history || [])],
  };
}

/**
 * Update Demo status with audit log
 */
export function updateDemoStatusRecord(demo, newStatus, note = '', updatedBy = 'Admin') {
  const now = new Date().toISOString();
  const historyEntry = {
    id: `HIST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: now,
    action: `Status changed to ${newStatus}`,
    fromStatus: demo.status,
    toStatus: newStatus,
    date: demo.demoDate,
    time: demo.demoTime,
    location: demo.location,
    coachName: demo.coachName,
    note: note || `Status updated from ${demo.status} to ${newStatus}.`,
    updatedBy,
  };

  return {
    ...demo,
    status: newStatus,
    updatedAt: now,
    history: [historyEntry, ...(demo.history || [])],
  };
}

/**
 * Calculate KPI summary metrics for Enquiries, Sources & Demos
 */
export function calculateDemoMetrics(enquiries = [], demos = [], students = []) {
  const totalEnquiries = enquiries.length;
  const websiteEnquiries = enquiries.filter(e => (e.source || '').toLowerCase() === 'website').length;
  const instagramEnquiries = enquiries.filter(e => (e.source || '').toLowerCase() === 'instagram').length;
  const whatsappEnquiries = enquiries.filter(e => (e.source || '').toLowerCase() === 'whatsapp').length;
  const manualEnquiries = enquiries.filter(e => {
    const s = (e.source || '').toLowerCase();
    return s.includes('manual') || s.includes('walk');
  }).length;
  const otherEnquiries = totalEnquiries - (websiteEnquiries + instagramEnquiries + whatsappEnquiries + manualEnquiries);

  const totalDemos = demos.length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingDemos = demos.filter(d => 
    (d.status === DEMO_STATUSES.SCHEDULED || d.status === DEMO_STATUSES.CONFIRMED || d.status === DEMO_STATUSES.RESCHEDULED) &&
    d.demoDate >= todayStr
  ).length;
  const completedDemos = demos.filter(d => d.status === DEMO_STATUSES.COMPLETED).length;

  const studentConversions = demos.filter(d => d.convertedToStudent === true).length +
    enquiries.filter(e => e.stage === 'Enrolled').length;

  return {
    totalEnquiries,
    websiteEnquiries,
    instagramEnquiries,
    whatsappEnquiries,
    manualEnquiries,
    otherEnquiries: Math.max(0, otherEnquiries),
    totalDemos,
    upcomingDemos,
    completedDemos,
    studentConversions,
    conversionRate: totalEnquiries > 0 ? Math.round((studentConversions / totalEnquiries) * 100) : 0,
  };
}
