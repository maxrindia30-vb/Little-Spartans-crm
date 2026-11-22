/**
 * Little Spartans CRM - Enquiry & Lead Funnel Service
 * Manages lead status resolution, dynamic funnel metrics, automatic status rules,
 * activity history, automation logs, and CSV import/export.
 */

export const LEAD_STATUS = {
  ALL: 'All',
  NEW: 'New',
  ACTIVE: 'Active',
  STALE: 'Stale',
  DEMO_REQUESTED: 'Demo Requested',
  DEMO_ATTENDED: 'Demo Attended',
  CONVERTED: 'Converted',
  LOST: 'Lost',
};

export const STATUS_COLORS = {
  Active: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    hex: '#10B981',
  },
  Stale: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    hex: '#F59E0B',
  },
  'Demo Requested': {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
    dot: 'bg-sky-500',
    hex: '#38BDF8',
  },
  'Demo Attended': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    hex: '#2563EB',
  },
  Converted: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
    hex: '#059669',
  },
  Lost: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    hex: '#EF4444',
  },
  New: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
    hex: '#6366F1',
  },
};

/**
 * Calculates days elapsed between a date string and today.
 */
export function calculateDaysSince(dateStr) {
  if (!dateStr) return 0;
  try {
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return 0;
    const now = new Date();
    // Normalize to midnight UTC/local
    const diffMs = now.getTime() - target.getTime();
    if (diffMs <= 0) return 0;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } catch (err) {
    return 0;
  }
}

/**
 * Formats date into readable string e.g. "20 Nov 2026"
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [y, m, d] = parts.split('-').map(Number);
    if (!y || !m || !d) {
      const dt = new Date(dateStr);
      if (isNaN(dt.getTime())) return dateStr;
      return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Resolves an enquiry's current dynamic lead status based on CRM state.
 * Automatic Lead Status Rules:
 * - Converted: student enrolled
 * - Demo Attended: demo completed
 * - Demo Requested: demo booked
 * - Lost: marked lost or 5+ consecutive days without parent response
 * - Stale: > 5 days without response
 * - Active: 0-5 days with response / under follow-up
 */
export function resolveLeadStatus(enquiry, demos = [], students = []) {
  if (!enquiry) return LEAD_STATUS.ACTIVE;

  // 1. Converted / Enrolled Check
  if (
    enquiry.stage === 'Enrolled' ||
    enquiry.status === LEAD_STATUS.CONVERTED ||
    enquiry.enrolledStudentId ||
    students.some(
      (s) =>
        s.enquiryId === enquiry.id ||
        (s.email && enquiry.email && s.email.toLowerCase().trim() === enquiry.email.toLowerCase().trim())
    )
  ) {
    return LEAD_STATUS.CONVERTED;
  }

  // 2. Demo Attended Check
  const matchingDemo = demos.find(
    (d) =>
      d.enquiryId === enquiry.id ||
      (d.childName && enquiry.childName && d.childName.toLowerCase().trim() === enquiry.childName.toLowerCase().trim())
  );

  if (enquiry.status === LEAD_STATUS.DEMO_ATTENDED || enquiry.stage === 'Trial Completed') {
    return LEAD_STATUS.DEMO_ATTENDED;
  }
  if (matchingDemo && (matchingDemo.status === 'Completed' || matchingDemo.status === 'Attended')) {
    return LEAD_STATUS.DEMO_ATTENDED;
  }

  // 3. Demo Requested Check
  if (
    enquiry.status === LEAD_STATUS.DEMO_REQUESTED ||
    enquiry.stage === 'Trial Scheduled' ||
    enquiry.demoId ||
    (matchingDemo && matchingDemo.status !== 'Cancelled')
  ) {
    return LEAD_STATUS.DEMO_REQUESTED;
  }

  // 4. Lost Check (Explicitly marked or auto-lost rule)
  if (enquiry.status === LEAD_STATUS.LOST || enquiry.isLost === true || enquiry.autoMarkedLost === true) {
    return LEAD_STATUS.LOST;
  }

  // 5. Days Elapsed Calculation based on lastParentResponse or enquiryDate
  const lastResponse = enquiry.lastParentResponse || enquiry.enquiryDate || enquiry.createdAt;
  const days = calculateDaysSince(lastResponse);

  // If explicitly flagged stale or days > 5
  if (enquiry.status === LEAD_STATUS.STALE || days > 5) {
    return LEAD_STATUS.STALE;
  }

  // 6. Active (0 - 5 days)
  return LEAD_STATUS.ACTIVE;
}

/**
 * Calculates all 7 KPI counts dynamically from CRM data.
 */
export function calculateLeadKPIs(enquiries = [], demos = [], students = [], locations = []) {
  const totalEnquiries = enquiries.length;
  let activeLeads = 0;
  let staleLeads = 0;
  let demoRequested = 0;
  let demoAttended = 0;
  let converted = 0;
  let lostLeads = 0;
  let newLeads = 0;

  enquiries.forEach((enq) => {
    const resolved = resolveLeadStatus(enq, demos, students);
    const lastResponse = enq.lastParentResponse || enq.enquiryDate || enq.createdAt;
    const days = calculateDaysSince(lastResponse);

    if (resolved === LEAD_STATUS.CONVERTED) {
      converted++;
    } else if (resolved === LEAD_STATUS.DEMO_ATTENDED) {
      demoAttended++;
    } else if (resolved === LEAD_STATUS.DEMO_REQUESTED) {
      demoRequested++;
    } else if (resolved === LEAD_STATUS.LOST) {
      lostLeads++;
    } else if (resolved === LEAD_STATUS.STALE) {
      staleLeads++;
    } else {
      activeLeads++;
    }

    // New leads: created within 2 days or stage 'New' without demo
    if (days <= 2 && enq.stage === 'New' && resolved !== LEAD_STATUS.CONVERTED && resolved !== LEAD_STATUS.LOST) {
      newLeads++;
    }
  });

  return {
    totalEnquiries,
    activeLeads,
    staleLeads,
    demoRequested,
    demoAttended,
    converted,
    lostLeads,
    newLeads,
    locationsCount: locations.length || 1,
  };
}

/**
 * Calculates Lead Funnel stages and Insights conversion rates dynamically.
 */
export function calculateLeadFunnel(enquiries = [], demos = [], students = []) {
  const total = enquiries.length;
  const kpis = calculateLeadKPIs(enquiries, demos, students);

  // Funnel Cumulative Volumes:
  // Stage 1: Enquiries (100%)
  // Stage 2: Demo Requested (Requested + Attended + Converted)
  // Stage 3: Demo Attended (Attended + Converted)
  // Stage 4: Converted (Converted)
  const funnelStages = {
    enquiries: total,
    demoRequested: kpis.demoRequested + kpis.demoAttended + kpis.converted,
    demoAttended: kpis.demoAttended + kpis.converted,
    converted: kpis.converted,
  };

  const percentages = {
    enquiries: 100,
    demoRequested: total > 0 ? Number(((funnelStages.demoRequested / total) * 100).toFixed(1)) : 0,
    demoAttended: total > 0 ? Number(((funnelStages.demoAttended / total) * 100).toFixed(1)) : 0,
    converted: total > 0 ? Number(((funnelStages.converted / total) * 100).toFixed(1)) : 0,
  };

  // Funnel Insights:
  // 1. Enquiry -> Demo Request %
  // 2. Demo Request -> Attended %
  // 3. Attended -> Converted %
  const insights = {
    enquiryToDemoRate:
      total > 0 ? Number(((funnelStages.demoRequested / total) * 100).toFixed(1)) : 0,
    demoToAttendedRate:
      funnelStages.demoRequested > 0
        ? Number(((funnelStages.demoAttended / funnelStages.demoRequested) * 100).toFixed(1))
        : 0,
    attendedToConvertedRate:
      funnelStages.demoAttended > 0
        ? Number(((funnelStages.converted / funnelStages.demoAttended) * 100).toFixed(1))
        : 0,
  };

  return {
    stages: funnelStages,
    percentages,
    insights,
  };
}

/**
 * Generates SVG Donut Chart slice geometries for Lead Status Overview.
 */
export function getDonutChartData(kpis) {
  const total = kpis.totalEnquiries || 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.327

  const items = [
    { label: 'Active Leads (≤ 5 days)', count: kpis.activeLeads, color: STATUS_COLORS.Active.hex },
    { label: 'Stale Leads (> 5 days)', count: kpis.staleLeads, color: STATUS_COLORS.Stale.hex },
    { label: 'Demo Requested', count: kpis.demoRequested, color: STATUS_COLORS['Demo Requested'].hex },
    { label: 'Demo Attended', count: kpis.demoAttended, color: STATUS_COLORS['Demo Attended'].hex },
    { label: 'Converted (Enrolled)', count: kpis.converted, color: STATUS_COLORS.Converted.hex },
    { label: 'Lost (No response for 5 days)', count: kpis.lostLeads, color: STATUS_COLORS.Lost.hex },
  ];

  let accumulatedPercent = 0;
  const slices = items.map((item) => {
    const pct = total > 0 ? (item.count / total) * 100 : 0;
    const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += pct;
    return {
      ...item,
      percentage: pct.toFixed(1),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return {
    total,
    slices,
    circumference,
    radius,
  };
}

/**
 * Automation Logs Management (Stored in localStorage)
 */
const AUTOMATION_LOGS_STORAGE_KEY = 'little_spartans_lead_automation_logs';

export const INITIAL_AUTOMATION_LOGS = [];

const DUMMY_LOG_IDS = new Set(['LOG-001', 'LOG-002', 'LOG-003', 'LOG-004']);

export function getStoredAutomationLogs() {
  try {
    const raw = localStorage.getItem(AUTOMATION_LOGS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    // Filter out any legacy dummy logs
    const cleaned = parsed.filter((l) => l && l.id && !DUMMY_LOG_IDS.has(l.id));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(AUTOMATION_LOGS_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveAutomationLog(logEntry) {
  try {
    const current = getStoredAutomationLogs();
    const newEntry = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...logEntry,
    };
    const updated = [newEntry, ...current].slice(0, 100); // keep last 100
    localStorage.setItem(AUTOMATION_LOGS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save automation log:', err);
    return [];
  }
}

/**
 * Activity History Management
 */
const ACTIVITY_STORAGE_PREFIX = 'little_spartans_enquiry_activities_';

export function getEnquiryActivities(enquiryId) {
  if (!enquiryId) return [];
  try {
    const raw = localStorage.getItem(`${ACTIVITY_STORAGE_PREFIX}${enquiryId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function addEnquiryActivity(enquiryId, activity) {
  if (!enquiryId) return [];
  try {
    const current = getEnquiryActivities(enquiryId);
    const newEntry = {
      id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      author: activity.author || 'Admin Desk',
      ...activity,
    };
    const updated = [newEntry, ...current];
    localStorage.setItem(`${ACTIVITY_STORAGE_PREFIX}${enquiryId}`, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save activity:', err);
    return [];
  }
}

/**
 * Parse CSV text for lead import
 */
export function parseCSVLeads(csvText) {
  if (!csvText || typeof csvText !== 'string') return { valid: [], errors: ['Empty CSV file'] };

  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { valid: [], errors: ['CSV must have a header row and at least one data row'] };
  }

  const rawHeaders = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
  const headerMap = {};
  rawHeaders.forEach((h, idx) => {
    if (h.includes('child') && h.includes('name')) headerMap.childName = idx;
    else if (h.includes('parent') && h.includes('name')) headerMap.parentName = idx;
    else if (h.includes('phone') || h.includes('mobile') || h.includes('contact')) headerMap.phone = idx;
    else if (h.includes('email')) headerMap.email = idx;
    else if (h.includes('program') || h.includes('sport')) headerMap.program = idx;
    else if (h.includes('center') || h.includes('location')) headerMap.center = idx;
    else if (h.includes('age')) headerMap.childAge = idx;
    else if (h.includes('dob') || h.includes('birth')) headerMap.dob = idx;
    else if (h.includes('gender')) headerMap.gender = idx;
    else if (h.includes('note') || h.includes('remark')) headerMap.notes = idx;
  });

  if (headerMap.childName === undefined && headerMap.parentName === undefined) {
    return { valid: [], errors: ['Header must contain at least "Child Name" or "Parent Name" and "Phone"'] };
  }

  const valid = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    // Simple CSV parser supporting quotes
    const row = [];
    let insideQuotes = false;
    let currentCell = '';
    for (const char of lines[i]) {
      if (char === '"' || char === "'") {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    row.push(currentCell.trim());

    const childName = (headerMap.childName !== undefined ? row[headerMap.childName] : row[0]) || '';
    const parentName = (headerMap.parentName !== undefined ? row[headerMap.parentName] : row[1]) || '';
    const phone = (headerMap.phone !== undefined ? row[headerMap.phone] : row[2]) || '';
    const email = (headerMap.email !== undefined ? row[headerMap.email] : row[3]) || '';
    const program = (headerMap.program !== undefined ? row[headerMap.program] : row[4]) || 'Football';
    const center = (headerMap.center !== undefined ? row[headerMap.center] : row[5]) || 'KK NAGAR';
    const childAge = (headerMap.childAge !== undefined ? row[headerMap.childAge] : '6') || '6';
    const notes = (headerMap.notes !== undefined ? row[headerMap.notes] : 'Imported via CSV lead file') || '';

    if (!childName.trim() && !parentName.trim()) {
      errors.push(`Row ${i + 1}: Missing both Child Name and Parent Name`);
      continue;
    }
    if (!phone.trim()) {
      errors.push(`Row ${i + 1}: Missing contact phone number for "${childName || parentName}"`);
      continue;
    }

    valid.push({
      childName: childName.trim() || `Child of ${parentName.trim()}`,
      parentName: parentName.trim() || 'Parent',
      phone: phone.trim(),
      email: email.trim(),
      interestedProgram: program.trim() || 'Football',
      center: center.trim() || 'KK NAGAR',
      childAge: String(childAge).trim() || '6',
      gender: 'Male',
      dob: '',
      notes: notes.trim(),
      source: 'CSV Import',
      stage: 'New',
      enquiryDate: new Date().toISOString().split('T')[0],
      lastParentResponse: new Date().toISOString().split('T')[0],
    });
  }

  return { valid, errors };
}

/**
 * Returns a downloadable sample CSV template for lead import.
 */
export function getSampleLeadsCSV() {
  return `Child Name,Parent Name,Phone,Email ID,Program,Location,Age,Notes
Athlete Name,Guardian Name,+91 98765 43210,guardian@example.com,Spartan Gymnastics & Agility,KK NAGAR,6,Interested in weekday batches`;
}
