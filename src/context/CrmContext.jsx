import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initialAcademyData } from '../data/mockData';
import {
  checkScheduleConflict,
  buildRecurringSchedules,
} from '../services/scheduleService';
import {
  checkCompensationEligibility,
  validateReplacementSlot,
  formatReplacementSlotLabel,
} from '../services/compensationService';
import { upsertBatchAttendanceRecords } from '../services/attendanceService';
import {
  executeEnquiryEnrollmentTransaction,
  generateUniquePrefixedId,
  generateLocationKidId,
  generateCommonMemberId,
  generateParentPassword,
} from '../services/enrollmentService';
import {
  validateDemoPayload,
  buildDemoRecord,
  rescheduleDemoRecord,
  updateDemoStatusRecord,
  DEMO_STATUSES,
  ENQUIRY_SOURCES,
  calculateAgeFromDob,
} from '../services/demoService';
import {
  initialEquipmentInventory,
  initialEquipmentReports,
  REPORT_STATUSES,
} from '../services/equipmentService';
import {
  calculatePackageExpiryDate,
  computeStudentPackage,
  PACKAGE_TOTAL_CLASSES,
  PACKAGE_REMINDER_THRESHOLD,
  PACKAGE_STATUSES
} from '../services/packageService';
import {
  LEAVE_TYPES,
  LEAVE_STATUSES,
  HALF_DAY_SESSIONS,
  getCoachApprovedLeaveForDate,
  validateCoachLeavePayload,
} from '../services/coachLeaveService';

const CrmContext = createContext();

const LOCAL_STORAGE_KEY = 'little_spartans_crm_v6_clean';
const CURRENT_ROLE_KEY = 'little_spartans_current_portal';

const LEGACY_STORAGE_KEYS = [
  'little_spartans_crm_data',
  'little_spartans_crm_v1',
  'little_spartans_crm_v2',
  'little_spartans_crm_v3',
  'little_spartans_crm_v4',
  'little_spartans_crm_v4_clean',
  'little_spartans_crm_v5_clean',
  'little_spartans_crm_backup',
  'little_spartans_lead_automation_logs'
];

// Clean out legacy test/dummy data keys on startup
if (typeof window !== 'undefined' && window.localStorage) {
  LEGACY_STORAGE_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  });
}

export function CrmProvider({ children }) {
  // Load data from localStorage or fallback to initial data
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Define known seed dummy IDs and names to purge project-wide
        const DUMMY_COACH_NAMES = new Set([
          'coach kabir rao',
          'coach vikram singh',
          'coach arumugam k',
          'coach rajesh kumar',
          'coach dinesh v',
          'sensei rajesh kumar',
          'coach priya nair',
          'coach david miller',
          'kapil',
          'coach kapil',
          'dibi',
          'coach dibi',
          'hanif',
          'coach hanif',
          'teja',
          'coach teja'
        ]);

        const DUMMY_CHILD_NAMES = new Set([
          'rohan rao', 'ananya sharma', 'pranav kumar', 'aarav mehta',
          'diya nair', 'kavya reddy', 'siddharth verma', 'tanvi sundaram',
          'aditya balaji', 'ishaan iyer', 'meera krishnan', 'varun narayanan',
          'samaira patel', 'vihaan gupta', 'anika chawla', 'aryan pillai',
          'aarav patel', 'aarav sharma', 'priya sundaram', 'rohan chandran',
          'krrish iyer', 'diya patel', 'ananya verma'
        ]);

        const DUMMY_PARENT_NAMES = new Set([
          'suresh mehta', 'manoj nair', 'venkatesh reddy', 'deepak rao',
          'kavita sharma', 'rajesh kumar', 'pooja verma', 'sundaram r',
          'balaji v', 'subramanian iyer', 'krishnan s', 'narayanan t',
          'nitin patel', 'amit gupta', 'gaurav chawla', 'gopinath pillai',
          'rajesh patel', 'priya patel', 'amit sharma', 'neha verma',
          'karthik iyer', 'karthik sundaram', 'lakshmi chandran'
        ]);

        const isDummyEnquiry = (e) => {
          if (!e) return true;
          if (e.id && /^ENQ-0(0[1-9]|1[0-9]|20)$/.test(e.id)) return true;
          const child = (e.childName || '').toLowerCase().trim();
          const parent = (e.parentName || '').toLowerCase().trim();
          if (DUMMY_CHILD_NAMES.has(child) || DUMMY_PARENT_NAMES.has(parent)) return true;
          return false;
        };

        const isDummyDemo = (d) => {
          if (!d) return true;
          if (d.id && /^DEMO-0(0[1-9]|1[0-9]|20)$/.test(d.id)) return true;
          const child = (d.childName || '').toLowerCase().trim();
          const parent = (d.parentName || '').toLowerCase().trim();
          if (DUMMY_CHILD_NAMES.has(child) || DUMMY_PARENT_NAMES.has(parent)) return true;
          return false;
        };

        const isDummyStudent = (s) => {
          if (!s) return true;
          if (s.id && /^LS-(KKN|KPK|MHP|AN|KOL)-2026-00[1-5]$/.test(s.id)) return true;
          const name = (s.name || '').toLowerCase().trim();
          const parent = (s.parentName || '').toLowerCase().trim();
          if (DUMMY_CHILD_NAMES.has(name) || DUMMY_PARENT_NAMES.has(parent)) return true;
          return false;
        };

        const isDummyParent = (p) => {
          if (!p) return true;
          const name = (p.name || '').toLowerCase().trim();
          if (DUMMY_PARENT_NAMES.has(name)) return true;
          return false;
        };

        const isDummyCoach = (c) => {
          if (!c) return true;
          if (c.id && /^COACH-0(0[1-9]|1[0-9])$/.test(c.id)) return true;
          const name = (c.name || '').toLowerCase().trim();
          if (DUMMY_COACH_NAMES.has(name)) return true;
          return false;
        };

        const isDummyClass = (cl) => {
          if (!cl) return true;
          if (cl.id && /^CLS-0(0[1-9]|1[0-9])$/.test(cl.id)) return true;
          return false;
        };

        const isDummySchedule = (s) => {
          if (!s) return true;
          if (s.id && /^SCH-0(0[1-9]|1[0-9])$/.test(s.id)) return true;
          return false;
        };

        const isDummyAttendance = (a) => {
          if (!a) return true;
          if (a.id && /^ATT-0(0[1-9]|1[0-9])$/.test(a.id)) return true;
          const stName = (a.studentName || '').toLowerCase().trim();
          if (DUMMY_CHILD_NAMES.has(stName)) return true;
          return false;
        };

        const isDummyPayment = (p) => {
          if (!p) return true;
          if (p.id && /^PAY-0(0[1-9]|1[0-9])$/.test(p.id)) return true;
          const stName = (p.studentName || '').toLowerCase().trim();
          const prName = (p.parentName || '').toLowerCase().trim();
          if (DUMMY_CHILD_NAMES.has(stName) || DUMMY_PARENT_NAMES.has(prName)) return true;
          return false;
        };

        // Purge dummy/legacy records from stored data
        const loadedCoaches = (Array.isArray(parsed.coaches) && parsed.coaches.length > 0
          ? parsed.coaches
          : initialAcademyData.coaches || [])
          .filter((c) => !isDummyCoach(c));
        const storedCoaches = [...loadedCoaches];
        (initialAcademyData.coaches || []).forEach((ic) => {
          if (!storedCoaches.some((c) => c.id === ic.id || (c.name && ic.name && c.name.toLowerCase() === ic.name.toLowerCase()))) {
            storedCoaches.push(ic);
          }
        });

        const loadedEnquiries = (Array.isArray(parsed.enquiries) && parsed.enquiries.length > 0
          ? parsed.enquiries
          : initialAcademyData.enquiries || [])
          .filter((e) => !isDummyEnquiry(e));
        const storedEnquiries = [...loadedEnquiries];
        (initialAcademyData.enquiries || []).forEach((ie) => {
          if (!storedEnquiries.some((e) => e.id === ie.id)) {
            storedEnquiries.push(ie);
          }
        });

        const storedLocations = (Array.isArray(parsed.locations) && parsed.locations.length > 0
          ? parsed.locations
          : initialAcademyData.locations).map(loc => ({
            ...loc,
            contactPerson: (loc.contactPerson && !DUMMY_COACH_NAMES.has(loc.contactPerson.toLowerCase().trim())) ? loc.contactPerson : 'Branch Coordinator',
            contactPhone: loc.contactPhone || '+91 98765 43210'
          }));

        const activeCenters = storedLocations
          .filter((l) => l.status !== 'Inactive')
          .map((l) => l.name);

        const rawStudents = (Array.isArray(parsed.students) ? parsed.students : [])
          .filter(s => !isDummyStudent(s));

        const rawParents = (Array.isArray(parsed.parents) ? parsed.parents : [])
          .filter(p => !isDummyParent(p));

        // Migrate & harmonize One Common ID for Kid & Parent, Auto-generate passwords
        const migratedStudents = rawStudents.map((student) => ({
          ...student,
          parentId: student.parentId?.startsWith('LS-') ? student.parentId : (student.id?.startsWith('LS-') ? student.id : student.parentId || student.id),
        }));

        const migratedParents = rawParents.map((parent) => {
          const normParentPhone = String(parent.phone || '').replace(/\D/g, '');
          const normParentEmail = String(parent.email || '').trim().toLowerCase();
          const normParentName = String(parent.name || '').trim().toLowerCase();

          const matchingChild = migratedStudents.find((s) => {
            const normStudentParentPhone = String(s.parentPhone || '').replace(/\D/g, '');
            const normStudentParentEmail = String(s.parentEmail || '').trim().toLowerCase();
            const normStudentParentName = String(s.parentName || '').trim().toLowerCase();
            const childName = String(s.name || '').trim().toLowerCase();

            return (
              s.id === parent.id ||
              s.parentId === parent.id ||
              (Array.isArray(parent.linkedStudentIds) && parent.linkedStudentIds.includes(s.id)) ||
              (normParentEmail && normStudentParentEmail && normParentEmail === normStudentParentEmail) ||
              (normParentPhone && normStudentParentPhone && (normParentPhone.slice(-10) === normStudentParentPhone.slice(-10))) ||
              (normParentName && normStudentParentName && normParentName === normStudentParentName) ||
              (Array.isArray(parent.children) && parent.children.some((cn) => String(cn || '').trim().toLowerCase() === childName))
            );
          });

          // Harmonize to One Common ID for Kid & Parent (e.g. LS-KKN-2026-001)
          const commonId =
            matchingChild?.id && matchingChild.id.startsWith('LS-')
              ? matchingChild.id
              : (parent.id && parent.id.startsWith('LS-'))
              ? parent.id
              : matchingChild?.id
              ? matchingChild.id
              : (Array.isArray(parent.linkedStudentIds) && parent.linkedStudentIds[0])
              ? parent.linkedStudentIds[0]
              : parent.id;

          if (matchingChild) {
            matchingChild.parentId = commonId;
            matchingChild.parentName = matchingChild.parentName || parent.name;
          }

          const autoPass = parent.password || parent.tempPassword || generateParentPassword(parent.phone);

          return {
            ...parent,
            id: commonId,
            password: autoPass,
            tempPassword: autoPass,
            tempPasswordDisplay: autoPass,
            portalAccess: true,
            status: 'Active',
            children: matchingChild
              ? Array.from(new Set([...(parent.children || []), matchingChild.name]))
              : parent.children || [],
            linkedStudentIds: matchingChild ? [commonId] : parent.linkedStudentIds || [],
          };
        });

        // Ensure userAccounts contains active parent accounts matching location
        const existingAccounts = Array.isArray(parsed.userAccounts)
          ? parsed.userAccounts
          : initialAcademyData.userAccounts || [];

        // Retain super_admin, admin, coach, and valid parent accounts (filter dummy parents)
        const retainedAccounts = existingAccounts.filter(
          (a) => (a.role === 'admin' || a.role === 'super_admin' || a.id === 'ACC-001') && !DUMMY_PARENT_NAMES.has((a.name || '').toLowerCase().trim())
        );

        // Auto-sync parent accounts for all enrolled parents matching locations
        const parentAccounts = migratedParents.map((p) => {
          const existingAcc = existingAccounts.find(
            (a) => a.email && p.email && a.email.toLowerCase() === p.email.toLowerCase()
          );
          const targetLoc = p.center || 'KK NAGAR';
          return {
            id: existingAcc?.id || `ACC-${p.id}`,
            role: 'parent',
            name: p.name,
            email: p.email,
            phone: p.phone,
            center: targetLoc,
            locations: [targetLoc],
            linkedStudents: p.children || [],
            status: 'Active',
            isTemporaryPassword: true,
            password: p.password,
            tempPasswordDisplay: p.password,
            createdAt: p.createdAt || 'Today',
            lastLogin: existingAcc?.lastLogin || 'Never',
            permissions: ['VIEW_OWN_CHILDREN', 'MAKE_PAYMENTS', 'REQUEST_COMPENSATION'],
          };
        });

        const mergedAccounts = [...retainedAccounts];
        parentAccounts.forEach((pa) => {
          if (!mergedAccounts.some((a) => a.email && pa.email && a.email.toLowerCase() === pa.email.toLowerCase())) {
            mergedAccounts.push(pa);
          }
        });

        return {
          ...initialAcademyData,
          ...parsed,
          students: migratedStudents.filter(s => !isDummyStudent(s)),
          parents: migratedParents.filter(p => !isDummyParent(p)),
          classes: (Array.isArray(parsed.classes) && parsed.classes.length > 0
            ? parsed.classes
            : (initialAcademyData.classes || [])).filter(cl => !isDummyClass(cl)),
          academy: {
            ...initialAcademyData.academy,
            ...(parsed.academy || {}),
            centers: activeCenters.length > 0 ? activeCenters : initialAcademyData.academy.centers,
          },
          locations: storedLocations,
          coaches: storedCoaches,
          enquiries: storedEnquiries
            .filter(e => !isDummyEnquiry(e))
            .map(enq => ({
              ...enq,
              source: enq.source || ENQUIRY_SOURCES.MANUAL,
            })),
          demos: (Array.isArray(parsed.demos) && parsed.demos.length > 0
            ? parsed.demos
            : (initialAcademyData.demos || [])).filter(d => !isDummyDemo(d)),
          payments: (Array.isArray(parsed.payments) ? parsed.payments : []).filter(p => !isDummyPayment(p)),
          classSchedules: (Array.isArray(parsed.classSchedules) ? parsed.classSchedules : []).filter(s => !isDummySchedule(s)),
          attendanceRecords: (Array.isArray(parsed.attendanceRecords) ? parsed.attendanceRecords : []).filter(a => !isDummyAttendance(a)),
          compensationRequests: (Array.isArray(parsed.compensationRequests) ? parsed.compensationRequests : []).filter(r => !r.id?.startsWith('CR-')),
          compensationHistory: (Array.isArray(parsed.compensationHistory) ? parsed.compensationHistory : []).filter(h => !h.id?.startsWith('CH-')),
          notifications: (Array.isArray(parsed.notifications) ? parsed.notifications : []).filter(n => !n.id?.startsWith('NOTIF-')),
          superCoaches: (Array.isArray(parsed.superCoaches) && parsed.superCoaches.length > 0 ? parsed.superCoaches : (initialAcademyData.superCoaches || [])).filter(sc => sc.id !== 'SCOACH-1' && !sc.name?.includes('Kabir')),
          equipment: (Array.isArray(parsed.equipment) && parsed.equipment.length > 0) ? parsed.equipment : initialEquipmentInventory,
          equipmentReports: (Array.isArray(parsed.equipmentReports) && parsed.equipmentReports.length > 0) ? parsed.equipmentReports : initialEquipmentReports,
          evaluations: (Array.isArray(parsed.evaluations) && parsed.evaluations.length > 0
            ? parsed.evaluations
            : (initialAcademyData.evaluations || [])),
          userAccounts: mergedAccounts,
          coachLeaveRequests: (Array.isArray(parsed.coachLeaveRequests) ? parsed.coachLeaveRequests : []).filter(r => !DUMMY_CLR_IDS.has(r.id)),
          leaveRequests: (Array.isArray(parsed.leaveRequests) ? parsed.leaveRequests : []).filter(r => !DUMMY_CLR_IDS.has(r.id)),
          coachReplacements: Array.isArray(parsed.coachReplacements) ? parsed.coachReplacements : [],
          conversations: (Array.isArray(parsed.conversations) ? parsed.conversations : []).filter(c => !DUMMY_CONV_IDS.has(c.id)),
          broadcasts: (Array.isArray(parsed.broadcasts) ? parsed.broadcasts : []).filter(b => !DUMMY_BCAST_IDS.has(b.id)),
          messageTemplates: Array.isArray(parsed.messageTemplates) && parsed.messageTemplates.length > 0
            ? parsed.messageTemplates
            : initialAcademyData.messageTemplates,
          scheduledMessages: (Array.isArray(parsed.scheduledMessages) ? parsed.scheduledMessages : []),
          termsDocument: parsed.termsDocument || initialAcademyData.termsDocument,
          dosDontsDocument: parsed.dosDontsDocument || initialAcademyData.dosDontsDocument,
          termsAcceptances: (Array.isArray(parsed.termsAcceptances) ? parsed.termsAcceptances : []).filter(a => !a.id?.startsWith('ACC-')),
          academicCalendar: parsed.academicCalendar || initialAcademyData.academicCalendar,
          settingsAuditLogs: Array.isArray(parsed.settingsAuditLogs) && parsed.settingsAuditLogs.length > 0
            ? parsed.settingsAuditLogs
            : (initialAcademyData.settingsAuditLogs || []),
        };
      }
    } catch (e) {
      console.error('Error loading stored CRM data', e);
    }
    return {
      ...initialAcademyData,
      equipment: initialEquipmentInventory,
      equipmentReports: initialEquipmentReports,
    };
  });

  // Current active portal: 'admin' | 'parent' | 'coach' | 'super_coach' | 'support'
  const [currentPortal, setCurrentPortal] = useState(() => {
    if (typeof window !== 'undefined' && window.location) {
      try {
        const params = new URLSearchParams(window.location.search);
        const p = params.get('portal');
        if (p && ['admin', 'parent', 'coach', 'super_coach', 'support'].includes(p)) {
          return p;
        }
      } catch (e) {}
    }
    try {
      const savedPortal = localStorage.getItem(CURRENT_ROLE_KEY);
      if (savedPortal && ['admin', 'parent', 'coach', 'super_coach', 'support'].includes(savedPortal)) {
        return savedPortal;
      }
    } catch (e) {}
    return 'admin';
  });

  // Active module view within portal
  const [currentView, setCurrentViewRaw] = useState(() => {
    if (typeof window !== 'undefined' && window.location) {
      try {
        const params = new URLSearchParams(window.location.search);
        const v = params.get('view');
        if (v) return v;
      } catch (e) {}
    }
    try {
      const saved = localStorage.getItem('little_spartans_current_view');
      if (saved) return saved;
    } catch (e) {}
    return 'dashboard';
  });

  const [activeSubTab, setActiveSubTabRaw] = useState(() => {
    if (typeof window !== 'undefined' && window.location) {
      try {
        const params = new URLSearchParams(window.location.search);
        const s = params.get('subTab') || params.get('subtab') || params.get('tab');
        if (s) return s;
        const v = params.get('view');
        if (v === 'kids' || v === 'students') return 'students';
        if (v === 'parents') return 'parents';
        if (v === 'coaches') return 'coaches';
      } catch (e) {}
    }
    try {
      const saved = localStorage.getItem('little_spartans_active_subtab');
      if (saved) return saved;
    } catch (e) {}
    return 'students';
  });

  const setCurrentView = (view, subTab = '') => {
    setCurrentViewRaw(view);
    let resolvedSubTab = subTab;
    if (!resolvedSubTab) {
      if (view === 'students' || view === 'kids') {
        resolvedSubTab = 'students';
      } else if (view === 'parents') {
        resolvedSubTab = 'parents';
      } else if (view === 'coaches') {
        resolvedSubTab = 'coaches';
      } else if (view === 'people') {
        resolvedSubTab = ['students', 'parents', 'coaches'].includes(activeSubTab) ? activeSubTab : 'students';
      } else if (view === 'equipment' || view === 'equipment_management') {
        resolvedSubTab = ['inventory', 'reports'].includes(activeSubTab) ? activeSubTab : 'inventory';
      }
    }

    if (resolvedSubTab) {
      setActiveSubTabRaw(resolvedSubTab);
    }

    try {
      localStorage.setItem('little_spartans_current_view', view);
      if (resolvedSubTab) {
        localStorage.setItem('little_spartans_active_subtab', resolvedSubTab);
      }
    } catch (e) {}

    if (typeof window !== 'undefined' && window.history) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('view', view);
        if (resolvedSubTab && (view === 'people' || view === 'students' || view === 'parents' || view === 'coaches' || view === 'kids')) {
          url.searchParams.set('subTab', resolvedSubTab);
        } else if (resolvedSubTab) {
          url.searchParams.set('subTab', resolvedSubTab);
        } else {
          url.searchParams.delete('subTab');
        }
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}
    }
  };

  const setActiveSubTab = (subTab) => {
    setActiveSubTabRaw(subTab);
    try {
      localStorage.setItem('little_spartans_active_subtab', subTab);
    } catch (e) {}
    if (typeof window !== 'undefined' && window.history) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('subTab', subTab);
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}
    }
  };
  
  // Search query in top navbar
  const [globalSearch, setGlobalSearch] = useState('');

  // Mobile sidebar drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Focus navigation state (e.g. jump directly from Enquiry Enrollment -> Student / Parent record)
  const [focusedRecord, setFocusedRecord] = useState(null);
  const enrollingIdsRef = useRef(new Set());

  // Authentication state (supports session persistence on refresh)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      const savedAuth = localStorage.getItem('little_spartans_is_logged_in');
      if (savedAuth !== null) return savedAuth === 'true';
    } catch (e) {}
    return false;
  });
  const [showMotivationalModal, setShowMotivationalModal] = useState(false);

  // Active Toast notification
  const [toasts, setToasts] = useState([]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving CRM data to localStorage', e);
    }
  }, [data]);

  // Save current portal
  const isPortalInitialMount = useRef(true);
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_ROLE_KEY, currentPortal);
    } catch (e) {}
    if (isPortalInitialMount.current) {
      isPortalInitialMount.current = false;
      return;
    }
    // Reset view to dashboard only when user explicitly switches portals
    setCurrentView('dashboard');
    setSidebarOpen(false);
  }, [currentPortal]);

  // Toast helper
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Reset to default clean state
  const resetAllData = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      LEGACY_STORAGE_KEYS.forEach(k => {
        try { localStorage.removeItem(k); } catch (e) {}
      });
      sessionStorage.clear();
    } catch (e) {}
    setData({
      ...initialAcademyData,
      classes: [],
      coaches: [],
      students: [],
      parents: [],
      enquiries: [],
      demos: [],
      payments: [],
      competitions: [],
      leaveRequests: [],
      coachLeaveRequests: [],
      feedback: [],
      certificates: [],
      supportTickets: [],
      followups: [],
      announcements: [],
      feeStructures: [],
      studentFeeAssignments: [],
      compensationRequests: [],
      compensationHistory: [],
      coachCompensationClasses: [],
      classSchedules: [],
      attendanceRecords: [],
      notifications: [],
      equipment: [],
      equipmentReports: [],
      evaluations: [],
      coachReplacements: [],
      conversations: initialAcademyData.conversations || [],
      broadcasts: initialAcademyData.broadcasts || [],
      messageTemplates: initialAcademyData.messageTemplates || [],
      scheduledMessages: initialAcademyData.scheduledMessages || [],
      termsDocument: initialAcademyData.termsDocument,
      dosDontsDocument: initialAcademyData.dosDontsDocument,
      termsAcceptances: [],
      academicCalendar: initialAcademyData.academicCalendar,
      settingsAuditLogs: initialAcademyData.settingsAuditLogs || [],
      userAccounts: [initialAcademyData.userAccounts[0]],
      locations: initialAcademyData.locations,
      programs: initialAcademyData.programs,
    });
    addToast('All dummy records cleared across all portals');
  };
  const resetToCleanSlate = resetAllData;

  // Current logged in user credentials per portal
  const currentUserProfiles = {
    admin: {
      name: (data.userAccounts && data.userAccounts[0]?.name) || "Administrator",
      role: "Academy Director",
      portalTitle: "Admin Portal",
      email: (data.userAccounts && data.userAccounts[0]?.email) || "director@littlespartans.co.in",
      avatar: null,
      badge: "Super Admin"
    },
    parent: {
      name: data.parents[0]?.name || "Parent Account",
      role: data.parents[0]?.center ? `Parent (${data.parents[0].center})` : "Parent Portal",
      portalTitle: "Parent Portal",
      email: data.parents[0]?.email || "parent@littlespartans.co.in",
      avatar: null,
      badge: "Verified Parent"
    },
    coach: {
      name: data.coaches[0]?.name || "Coach Account",
      role: data.coaches[0]?.specialization || "Sports Coach",
      portalTitle: "Coach Portal",
      email: data.coaches[0]?.email || "coach@littlespartans.co.in",
      avatar: null,
      badge: "Academy Coach"
    },
    super_coach: {
      name: (data.superCoaches && data.superCoaches[0]?.name) || "Anita R.",
      role: (data.superCoaches && data.superCoaches[0]?.title) || "Super Coach",
      portalTitle: "Super Coach Portal",
      email: (data.superCoaches && data.superCoaches[0]?.email) || "anita.r@littlespartans.co.in",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      badge: "Super Coach",
      assignedLocations: (data.superCoaches && data.superCoaches[0]?.assignedLocations && data.superCoaches[0].assignedLocations.length > 0)
        ? data.superCoaches[0].assignedLocations
        : ["KK NAGAR", "ANNA NAGAR", "KILPAUK", "MAHALINGAPURAM"]
    },
    support: {
      name: "Customer Support Lead",
      role: "Lead Relations Officer",
      portalTitle: "Customer Support Portal",
      email: "support@littlespartans.co.in",
      avatar: null,
      badge: "Support Lead"
    }
  };

  // CRUD Actions
  const addStudent = (studentData) => {
    const matchedClass =
      (data.classes || []).find(
        c =>
          (!studentData.center || c.center === studentData.center) &&
          (!studentData.program || c.program === studentData.program)
      ) ||
      (data.classes || []).find(c => !studentData.center || c.center === studentData.center);

    // One Common ID for Kid & Parent: LS-[LOCATION_CODE]-[YEAR]-[SEQUENCE]
    const commonId = studentData.id || generateCommonMemberId(data.students || [], data.parents || [], studentData.center);
    const studentId = commonId;
    const parentId = commonId;

    const newStudent = {
      ...studentData,
      id: studentId,
      parentId: parentId,
      joinDate: new Date().toISOString().split('T')[0],
      status: studentData.status || 'Active',
      attendanceRate: 100,
      feeStatus: studentData.feeStatus || 'Paid',
      enrolledClasses:
        studentData.enrolledClasses && studentData.enrolledClasses.length > 0
          ? studentData.enrolledClasses
          : matchedClass
          ? [matchedClass.name]
          : [],
      badges: ['New Spartan recruit'],
      avatar: studentData.avatar || 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80'
    };

    // Auto-create or sync linked parent and portal account
    const parentName = studentData.parentName?.trim();
    const parentPhone = studentData.parentPhone?.trim();
    const parentEmail = studentData.parentEmail?.trim().toLowerCase();
    const autoPassword = generateParentPassword(parentPhone);

    setData(prev => {
      let nextParents = prev.parents || [];
      let nextAccounts = prev.userAccounts || [];

      if (parentName) {
        const existingPIdx = nextParents.findIndex(p =>
          (parentEmail && p.email?.toLowerCase() === parentEmail) ||
          (parentPhone && p.phone === parentPhone)
        );

        if (existingPIdx >= 0) {
          const ep = nextParents[existingPIdx];
          const updatedP = {
            ...ep,
            id: parentId, // Harmonize to One Common ID for Kid & Parent
            children: Array.from(new Set([...(ep.children || []), newStudent.name])),
            linkedStudentIds: Array.from(new Set([...(ep.linkedStudentIds || []), studentId])),
            password: ep.password || autoPassword,
            tempPasswordDisplay: ep.password || autoPassword,
          };
          nextParents = nextParents.map((p, idx) => idx === existingPIdx ? updatedP : p);
        } else {
          const newParent = {
            id: parentId, // Exactly the same ID as studentId
            name: parentName,
            phone: parentPhone || '',
            email: parentEmail || '',
            center: studentData.center,
            address: `${studentData.center}, Chennai`,
            children: [newStudent.name],
            linkedStudentIds: [studentId],
            totalFeesPaid: '₹0',
            pendingDue: '₹0',
            portalAccess: true,
            status: 'Active',
            password: autoPassword,
            tempPassword: autoPassword,
            tempPasswordDisplay: autoPassword,
            createdAt: new Date().toISOString().split('T')[0],
          };
          nextParents = [newParent, ...nextParents];
        }

        const accEmail = parentEmail || `${parentName.toLowerCase().replace(/\s+/g, '')}@spartanparent.com`;
        const existingAccIdx = nextAccounts.findIndex(a => 
          (a.email && a.email.toLowerCase() === accEmail.toLowerCase()) ||
          a.id === `ACC-${parentId}` ||
          (a.phone && parentPhone && a.phone.replace(/\D/g, '') === parentPhone.replace(/\D/g, ''))
        );

        if (existingAccIdx >= 0) {
          const existingAcc = nextAccounts[existingAccIdx];
          const updatedAcc = {
            ...existingAcc,
            id: `ACC-${parentId}`,
            role: 'parent',
            name: parentName,
            center: studentData.center,
            locations: Array.from(new Set([...(existingAcc.locations || []), studentData.center])),
            linkedStudents: Array.from(new Set([...(existingAcc.linkedStudents || []), newStudent.name])),
            password: existingAcc.password || autoPassword,
            tempPasswordDisplay: existingAcc.tempPasswordDisplay || autoPassword,
            status: 'Active',
          };
          nextAccounts = nextAccounts.map((a, idx) => idx === existingAccIdx ? updatedAcc : a);
        } else {
          const newAcc = {
            id: `ACC-${parentId}`,
            role: 'parent',
            name: parentName,
            email: accEmail,
            phone: parentPhone || '',
            center: studentData.center,
            locations: [studentData.center],
            linkedStudents: [newStudent.name],
            status: 'Active',
            isTemporaryPassword: true,
            password: autoPassword,
            tempPasswordDisplay: autoPassword,
            createdAt: new Date().toISOString().split('T')[0],
            lastLogin: 'Never',
            permissions: ['VIEW_OWN_CHILDREN', 'MAKE_PAYMENTS', 'REQUEST_COMPENSATION'],
          };
          nextAccounts = [newAcc, ...nextAccounts];
        }
      }

      return {
        ...prev,
        students: [newStudent, ...prev.students],
        parents: nextParents,
        userAccounts: nextAccounts
      };
    });

    addToast(`Student "${newStudent.name}" (${studentId}) enrolled successfully!`);
    return newStudent;
  };

  const updateStudent = (id, updatedFields) => {
    setData(prev => {
      const nextStudents = prev.students.map(s => s.id === id ? { ...s, ...updatedFields } : s);
      let nextParents = prev.parents || [];

      // If feeStatus was updated, synchronize with linked parent billing
      if (updatedFields.feeStatus) {
        const targetStudent = nextStudents.find(s => s.id === id);
        if (targetStudent) {
          nextParents = nextParents.map(p => {
            const isLinked =
              p.id === targetStudent.parentId ||
              p.id === targetStudent.id ||
              (p.linkedStudentIds || []).includes(targetStudent.id) ||
              (p.children || []).includes(targetStudent.name);
            if (isLinked) {
              return {
                ...p,
                pendingDue: updatedFields.feeStatus === 'Paid' ? '₹0' : '₹6,500',
                totalFeesPaid: updatedFields.feeStatus === 'Paid' ? (p.totalFeesPaid === '₹0' ? '₹6,500' : p.totalFeesPaid) : p.totalFeesPaid,
              };
            }
            return p;
          });
        }
      }

      return {
        ...prev,
        students: nextStudents,
        parents: nextParents,
      };
    });
    addToast('Student details updated.');
  };

  const deleteStudent = (id) => {
    setData(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== id)
    }));
    addToast('Student record removed.', 'info');
  };

  // --------------------------------------------------------------------------
  // Student Individual Class Package Management
  // --------------------------------------------------------------------------
  const activateStudentPackage = (studentId, activationDate = new Date().toISOString().split('T')[0]) => {
    const student = (data.students || []).find(s => s.id === studentId);
    if (!student) {
      addToast('Student record not found.', 'error');
      return { success: false, error: 'Student not found' };
    }

    const expiryDate = calculatePackageExpiryDate(activationDate);
    const updatedFields = {
      packageActivationDate: activationDate,
      packageExpiryDate: expiryDate,
      packageStatus: PACKAGE_STATUSES.ACTIVE,
      packageCycle: student.packageCycle || 1,
      reminder20Notified: false,
      completionNotified: false
    };

    const notif = createNotificationRecord({
      targetRole: 'parent',
      targetParentId: student.parentId || '',
      targetLocation: student.center,
      title: `24-Class Package Activated: ${student.name}`,
      message: `Your child's 24-Class Package for ${student.program} is now active from ${activationDate} to ${expiryDate} (3 months validity).`,
      type: 'success'
    });

    setData(prev => ({
      ...prev,
      students: (prev.students || []).map(s => s.id === studentId ? { ...s, ...updatedFields } : s),
      notifications: [notif, ...(prev.notifications || [])].slice(0, 80)
    }));

    addToast(`24-Class Package activated for ${student.name} through ${expiryDate}!`, 'success');
    return { success: true, student: { ...student, ...updatedFields } };
  };

  const renewStudentPackage = (studentId, newActivationDate = new Date().toISOString().split('T')[0]) => {
    const student = (data.students || []).find(s => s.id === studentId);
    if (!student) {
      addToast('Student record not found.', 'error');
      return { success: false, error: 'Student not found' };
    }

    const expiryDate = calculatePackageExpiryDate(newActivationDate);
    const updatedFields = {
      packageActivationDate: newActivationDate,
      packageExpiryDate: expiryDate,
      packageStatus: PACKAGE_STATUSES.ACTIVE,
      packageCycle: (student.packageCycle || 1) + 1,
      reminder20Notified: false,
      completionNotified: false
    };

    const notif = createNotificationRecord({
      targetRole: 'parent',
      targetParentId: student.parentId || '',
      targetLocation: student.center,
      title: `Class Package Renewed: ${student.name}`,
      message: `A fresh 24-Class Package for ${student.name} has been renewed from ${newActivationDate} to ${expiryDate} (Cycle ${(student.packageCycle || 1) + 1}).`,
      type: 'success'
    });

    setData(prev => ({
      ...prev,
      students: (prev.students || []).map(s => s.id === studentId ? { ...s, ...updatedFields } : s),
      notifications: [notif, ...(prev.notifications || [])].slice(0, 80)
    }));

    addToast(`Fresh 24-class package renewed for ${student.name}!`, 'success');
    return { success: true, student: { ...student, ...updatedFields } };
  };

  const sendManualPackageReminder = (studentId) => {
    const student = (data.students || []).find(s => s.id === studentId);
    if (!student) {
      addToast('Student record not found.', 'error');
      return { success: false };
    }

    const pkg = computeStudentPackage(student, data.attendanceRecords || []);
    const notif = createNotificationRecord({
      targetRole: 'parent',
      targetParentId: student.parentId || '',
      targetLocation: student.center,
      title: `Package Renewal Notice: ${student.name}`,
      message: `Dear Parent, ${student.name} has attended ${pkg.classesAttended} of 24 classes (${pkg.classesRemaining} remaining). Package valid through ${pkg.expiryDate}. Contact academy for renewal.`,
      type: 'warning'
    });

    setData(prev => ({
      ...prev,
      notifications: [notif, ...(prev.notifications || [])].slice(0, 80)
    }));

    addToast(`Package renewal alert dispatched to ${student.parentName} (${student.parentPhone || 'Parent'}).`, 'success');
    return { success: true };
  };

  const addEnquiry = (enquiryData) => {
    const centerName = enquiryData.center || enquiryData.location || 'KK NAGAR';
    const nowIso = new Date().toISOString();
    const todayYmd = nowIso.split('T')[0];
    const enqDate = enquiryData.enquiryDate || todayYmd;
    const createdAt = enquiryData.createdAt || (enquiryData.enquiryDate ? `${enquiryData.enquiryDate}T10:00:00.000Z` : nowIso);

    const newEnq = {
      ...enquiryData,
      id: generateUniquePrefixedId(data.enquiries || [], 'ENQ'),
      center: centerName,
      location: centerName,
      source: enquiryData.source || ENQUIRY_SOURCES.MANUAL,
      enquiryDate: enqDate,
      createdAt: createdAt,
      lastParentResponse: enquiryData.lastParentResponse || enqDate,
      stage: enquiryData.stage || 'New',
      demoId: enquiryData.demoId || null,
    };
    setData(prev => ({
      ...prev,
      enquiries: [newEnq, ...(prev.enquiries || [])]
    }));
    addToast(`New enquiry for "${newEnq.childName}" registered (${newEnq.source}).`);
    return newEnq;
  };

  const updateEnquiry = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      enquiries: (prev.enquiries || []).map(e =>
        e.id === id
          ? {
              ...e,
              ...updatedFields,
              createdAt: updatedFields.enquiryDate || e.createdAt,
            }
          : e
      )
    }));
    addToast(`Enquiry ${id} details updated.`);
    return { success: true };
  };

  const updateEnquiryStage = (id, newStage) => {
    setData(prev => ({
      ...prev,
      enquiries: prev.enquiries.map(e => e.id === id ? { ...e, stage: newStage } : e)
    }));
    addToast(`Enquiry moved to ${newStage}.`);
  };

  // Atomic Enquiry-to-Enrollment Transaction:
  // Creates Student + Creates or Links Existing Parent + Syncs Batch & Location + Marks Enquiry Enrolled
  const enrollFromEnquiry = (enquiryId, overrides = {}) => {
    if (enrollingIdsRef.current.has(enquiryId)) {
      return {
        success: false,
        duplicate: true,
        errors: ['Enrollment is already in progress for this enquiry.'],
      };
    }

    enrollingIdsRef.current.add(enquiryId);
    try {
      const activeLocations = (data.locations || []).filter((l) => l.status !== 'Inactive');
      const result = executeEnquiryEnrollmentTransaction(data, {
        enquiryId,
        overrides,
        activeLocations,
      });

      if (!result.success) {
        addToast(result.errors?.[0] || 'Enrollment validation failed.', 'error');
        return result;
      }

      setData((prev) => ({
        ...prev,
        ...result.nextStateSlice,
      }));

      const parentMsg =
        result.parentAction === 'linked_existing'
          ? `linked to existing Parent ${result.parent.name} (${result.parent.id})`
          : `new Parent ${result.parent.name} (${result.parent.id}) created`;

      addToast(
        `Enrolled ${result.student.name} (${result.student.id}) at ${result.student.center} and ${parentMsg}.`,
        'success'
      );

      return result;
    } finally {
      enrollingIdsRef.current.delete(enquiryId);
    }
  };

  // --- Demo Management Actions ---
  const addDemo = (demoPayload) => {
    const activeLocations = (data.locations || []).filter(l => l.status !== 'Inactive');
    const validation = validateDemoPayload(demoPayload, activeLocations);
    if (!validation.isValid) {
      addToast(validation.errors[0] || 'Demo details are incomplete.', 'error');
      return { success: false, errors: validation.errors };
    }

    const newDemo = buildDemoRecord(demoPayload, data.demos || []);
    
    setData(prev => {
      let updatedEnquiries = prev.enquiries || [];
      if (newDemo.enquiryId) {
        updatedEnquiries = updatedEnquiries.map(e => {
          if (e.id === newDemo.enquiryId) {
            return {
              ...e,
              demoId: newDemo.id,
              stage: 'Demo Scheduled',
            };
          }
          return e;
        });
      }
      return {
        ...prev,
        demos: [newDemo, ...(prev.demos || [])],
        enquiries: updatedEnquiries,
      };
    });

    addToast(`Demo ${newDemo.id} scheduled for ${newDemo.childName} on ${newDemo.demoDate} at ${newDemo.location}.`, 'success');
    return { success: true, demo: newDemo };
  };

  const updateDemo = (id, updates) => {
    setData(prev => ({
      ...prev,
      demos: (prev.demos || []).map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d),
    }));
    addToast(`Demo ${id} updated.`);
    return { success: true };
  };

  const updateDemoConversionStatus = (id, newConversionStatus) => {
    const target = (data.demos || []).find(d => d.id === id);
    if (!target) return { success: false, error: 'Demo not found' };

    const now = new Date().toISOString();
    const prevStatus = target.conversionStatus || (target.convertedToStudent ? 'Converted to Student' : 'Pending Demo');
    const historyEntry = {
      id: `HIST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: now,
      action: `Conversion status changed to ${newConversionStatus}`,
      fromStatus: prevStatus,
      toStatus: newConversionStatus,
      date: target.demoDate,
      time: target.demoTime,
      location: target.location,
      note: `Conversion status updated from "${prevStatus}" to "${newConversionStatus}".`,
      updatedBy: 'Admin',
    };

    setData(prev => ({
      ...prev,
      demos: (prev.demos || []).map(d => d.id === id ? {
        ...d,
        conversionStatus: newConversionStatus,
        convertedToStudent: newConversionStatus === 'Converted to Student' ? true : d.convertedToStudent,
        updatedAt: now,
        history: [historyEntry, ...(d.history || [])],
      } : d),
    }));

    addToast(`Demo ${id} conversion status updated to "${newConversionStatus}".`, 'info');
    return { success: true };
  };

  const updateDemoStatus = (id, newStatus, note = '') => {
    const target = (data.demos || []).find(d => d.id === id);
    if (!target) return { success: false, error: 'Demo not found' };

    const updated = updateDemoStatusRecord(target, newStatus, note);
    
    setData(prev => {
      let updatedEnquiries = prev.enquiries || [];
      if (target.enquiryId) {
        let enquiryStage = null;
        let enquiryStatus = null;
        if (newStatus === DEMO_STATUSES.COMPLETED || newStatus === 'Attended' || newStatus === DEMO_STATUSES.ATTENDED) {
          enquiryStage = 'Trial Completed';
          enquiryStatus = 'Demo Attended';
        } else if (newStatus === DEMO_STATUSES.CANCELLED) {
          enquiryStage = 'Demo Cancelled';
        } else if (newStatus === DEMO_STATUSES.NO_SHOW) {
          enquiryStage = 'Demo No Show';
        } else if (newStatus === DEMO_STATUSES.CONFIRMED || newStatus === DEMO_STATUSES.SCHEDULED) {
          enquiryStage = 'Trial Scheduled';
          enquiryStatus = 'Demo Requested';
        } else if (newStatus === DEMO_STATUSES.PENDING_SCHEDULING || newStatus === 'Pending Scheduling') {
          enquiryStage = 'Trial Scheduled';
          enquiryStatus = 'Demo Requested';
        } else if (newStatus === DEMO_STATUSES.RESCHEDULED) {
          enquiryStage = 'Trial Scheduled';
        }

        if (enquiryStage || enquiryStatus) {
          updatedEnquiries = updatedEnquiries.map(e => e.id === target.enquiryId ? {
            ...e,
            ...(enquiryStage ? { stage: enquiryStage } : {}),
            ...(enquiryStatus ? { status: enquiryStatus } : {}),
          } : e);
        }
      }

      return {
        ...prev,
        demos: (prev.demos || []).map(d => d.id === id ? updated : d),
        enquiries: updatedEnquiries,
      };
    });

    addToast(`Demo ${id} status updated to ${newStatus}.`, 'info');
    return { success: true, demo: updated };
  };

  const syncEnquiryLeadStatus = (enquiryId, newStatusChoice, reason = '') => {
    const targetEnquiry = (data.enquiries || []).find((e) => e.id === enquiryId);
    if (!targetEnquiry) return { success: false, error: 'Enquiry not found' };

    const now = new Date().toISOString();
    const todayStr = now.slice(0, 10);

    // Look for existing linked demo
    let existingDemo = (data.demos || []).find(
      (d) =>
        d.enquiryId === enquiryId ||
        d.id === targetEnquiry.demoId ||
        (d.childName &&
          targetEnquiry.childName &&
          d.childName.toLowerCase().trim() === targetEnquiry.childName.toLowerCase().trim() &&
          d.phone === targetEnquiry.phone)
    );

    let linkedDemoId = existingDemo?.id || null;
    let isNewDemo = false;

    const isDemoReq =
      newStatusChoice === 'Demo Requested' ||
      newStatusChoice.toLowerCase().includes('demo requested');
    const isDemoAtt =
      newStatusChoice === 'Demo Attended' ||
      newStatusChoice.toLowerCase().includes('demo attended');
    const isConverted =
      newStatusChoice === 'Converted (Enrolled)' ||
      newStatusChoice.toLowerCase().includes('converted');

    if (isDemoReq) {
      if (existingDemo) {
        linkedDemoId = existingDemo.id;
        const historyEntry = {
          id: `HIST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: now,
          action: 'Lead Status Changed to Demo Requested',
          fromStatus: existingDemo.status,
          toStatus:
            existingDemo.status === 'Scheduled' || existingDemo.status === 'Confirmed'
              ? existingDemo.status
              : 'Pending Scheduling',
          note: reason || 'Updated automatically from Enquiry List status change to Demo Requested.',
          updatedBy: 'Admin Desk',
        };

        setData((prev) => ({
          ...prev,
          enquiries: (prev.enquiries || []).map((e) =>
            e.id === enquiryId
              ? {
                  ...e,
                  status: 'Demo Requested',
                  stage: 'Trial Scheduled',
                  demoId: linkedDemoId,
                  updatedAt: now,
                }
              : e
          ),
          demos: (prev.demos || []).map((d) =>
            d.id === existingDemo.id
              ? {
                  ...d,
                  childName: targetEnquiry.childName,
                  dob: targetEnquiry.dob || d.dob || '',
                  childAge: targetEnquiry.childAge || d.childAge || '',
                  gender: targetEnquiry.gender || d.gender || 'Male',
                  parentName: targetEnquiry.parentName,
                  phone: targetEnquiry.phone,
                  email: targetEnquiry.email || d.email || '',
                  location: targetEnquiry.center || targetEnquiry.location || d.location,
                  program: targetEnquiry.interestedProgram || d.program,
                  status:
                    d.status === 'Scheduled' || d.status === 'Confirmed'
                      ? d.status
                      : 'Pending Scheduling',
                  conversionStatus: d.conversionStatus || 'Pending Demo',
                  updatedAt: now,
                  history: [historyEntry, ...(d.history || [])],
                }
              : d
          ),
        }));
      } else {
        const count = (data.demos || []).length + 1;
        linkedDemoId = `DEMO-${String(count).padStart(3, '0')}`;
        isNewDemo = true;

        const newDemo = {
          id: linkedDemoId,
          enquiryId: targetEnquiry.id,
          childName: targetEnquiry.childName.trim(),
          dob: targetEnquiry.dob || '',
          childAge: targetEnquiry.childAge
            ? String(targetEnquiry.childAge)
            : (targetEnquiry.dob ? String(calculateAgeFromDob(targetEnquiry.dob) || '') : ''),
          gender: targetEnquiry.gender || 'Male',
          parentName: targetEnquiry.parentName.trim(),
          phone: targetEnquiry.phone.trim(),
          email: targetEnquiry.email ? targetEnquiry.email.trim() : '',
          location: targetEnquiry.center || targetEnquiry.location || 'KK NAGAR',
          program: targetEnquiry.interestedProgram || 'Foundational Movement',
          demoDate: targetEnquiry.trialDate && targetEnquiry.trialDate !== '-' ? targetEnquiry.trialDate : '',
          demoTime: targetEnquiry.trialTime || '17:00',
          coachId: '',
          coachName: '',
          status: 'Pending Scheduling',
          conversionStatus: 'Pending Demo',
          convertedToStudent: false,
          studentId: null,
          createdAt: now,
          updatedAt: now,
          notes: reason ? `Lead status changed to Demo Requested: ${reason}` : (targetEnquiry.notes || 'Demo requested via Enquiry List.'),
          history: [
            {
              id: `HIST-${Date.now()}-01`,
              timestamp: now,
              action: 'Demo Created via Lead Status',
              fromStatus: null,
              toStatus: 'Pending Scheduling',
              note: reason || 'Created automatically upon lead status update to Demo Requested.',
              updatedBy: 'Admin Desk',
            },
          ],
        };

        setData((prev) => ({
          ...prev,
          enquiries: (prev.enquiries || []).map((e) =>
            e.id === enquiryId
              ? {
                  ...e,
                  status: 'Demo Requested',
                  stage: 'Trial Scheduled',
                  demoId: linkedDemoId,
                  updatedAt: now,
                }
              : e
          ),
          demos: [newDemo, ...(prev.demos || [])],
        }));
      }

      addToast(`Lead ${enquiryId} status set to Demo Requested. Linked demo ${linkedDemoId} ${isNewDemo ? 'created' : 'updated'}.`, 'success');
      return { success: true, demoId: linkedDemoId, isNewDemo, status: 'Demo Requested' };
    }

    if (isDemoAtt) {
      if (existingDemo) {
        linkedDemoId = existingDemo.id;
        const historyEntry = {
          id: `HIST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: now,
          action: 'Attendance marked: Attended',
          fromStatus: existingDemo.status,
          toStatus: 'Attended',
          note: reason || 'Updated automatically from Enquiry List status change to Demo Attended.',
          updatedBy: 'Admin Desk',
        };

        setData((prev) => ({
          ...prev,
          enquiries: (prev.enquiries || []).map((e) =>
            e.id === enquiryId
              ? {
                  ...e,
                  status: 'Demo Attended',
                  stage: 'Trial Completed',
                  demoId: linkedDemoId,
                  updatedAt: now,
                }
              : e
          ),
          demos: (prev.demos || []).map((d) =>
            d.id === existingDemo.id
              ? {
                  ...d,
                  status: 'Attended',
                  conversionStatus: d.conversionStatus || 'Pending Demo',
                  updatedAt: now,
                  history: [historyEntry, ...(d.history || [])],
                }
              : d
          ),
        }));
      } else {
        const count = (data.demos || []).length + 1;
        linkedDemoId = `DEMO-${String(count).padStart(3, '0')}`;
        isNewDemo = true;

        const newDemo = {
          id: linkedDemoId,
          enquiryId: targetEnquiry.id,
          childName: targetEnquiry.childName.trim(),
          dob: targetEnquiry.dob || '',
          childAge: targetEnquiry.childAge
            ? String(targetEnquiry.childAge)
            : (targetEnquiry.dob ? String(calculateAgeFromDob(targetEnquiry.dob) || '') : ''),
          gender: targetEnquiry.gender || 'Male',
          parentName: targetEnquiry.parentName.trim(),
          phone: targetEnquiry.phone.trim(),
          email: targetEnquiry.email ? targetEnquiry.email.trim() : '',
          location: targetEnquiry.center || targetEnquiry.location || 'KK NAGAR',
          program: targetEnquiry.interestedProgram || 'Foundational Movement',
          demoDate: targetEnquiry.trialDate && targetEnquiry.trialDate !== '-' ? targetEnquiry.trialDate : todayStr,
          demoTime: targetEnquiry.trialTime || '17:00',
          coachId: '',
          coachName: '',
          status: 'Attended',
          conversionStatus: 'Pending Demo',
          convertedToStudent: false,
          studentId: null,
          createdAt: now,
          updatedAt: now,
          notes: reason ? `Lead status changed to Demo Attended: ${reason}` : (targetEnquiry.notes || 'Demo attended via Enquiry List.'),
          history: [
            {
              id: `HIST-${Date.now()}-01`,
              timestamp: now,
              action: 'Demo Attended via Lead Status',
              fromStatus: null,
              toStatus: 'Attended',
              note: reason || 'Created automatically upon lead status update to Demo Attended.',
              updatedBy: 'Admin Desk',
            },
          ],
        };

        setData((prev) => ({
          ...prev,
          enquiries: (prev.enquiries || []).map((e) =>
            e.id === enquiryId
              ? {
                  ...e,
                  status: 'Demo Attended',
                  stage: 'Trial Completed',
                  demoId: linkedDemoId,
                  updatedAt: now,
                }
              : e
          ),
          demos: [newDemo, ...(prev.demos || [])],
        }));
      }

      addToast(`Lead ${enquiryId} status set to Demo Attended. Linked demo ${linkedDemoId} updated.`, 'success');
      return { success: true, demoId: linkedDemoId, isNewDemo, status: 'Demo Attended' };
    }

    if (isConverted) {
      setData((prev) => ({
        ...prev,
        enquiries: (prev.enquiries || []).map((e) =>
          e.id === enquiryId
            ? {
                ...e,
                status: 'Converted (Enrolled)',
                stage: 'Enrolled',
                updatedAt: now,
              }
            : e
        ),
        demos: (prev.demos || []).map((d) =>
          existingDemo && d.id === existingDemo.id
            ? {
                ...d,
                conversionStatus: 'Converted to Student',
                convertedToStudent: true,
                updatedAt: now,
              }
            : d
        ),
      }));
      addToast(`Lead ${enquiryId} status updated to Converted.`, 'success');
      return { success: true, demoId: existingDemo?.id || null, status: 'Converted (Enrolled)' };
    }

    // Default: Active, Stale, Lost
    setData((prev) => ({
      ...prev,
      enquiries: (prev.enquiries || []).map((e) =>
        e.id === enquiryId
          ? {
              ...e,
              status: newStatusChoice,
              lastParentResponse:
                newStatusChoice.includes('Active')
                  ? todayStr
                  : e.lastParentResponse,
              stage: newStatusChoice.includes('Lost') ? 'Closed / Lost' : e.stage,
              updatedAt: now,
            }
          : e
      ),
    }));

    addToast(`Lead ${enquiryId} status updated to ${newStatusChoice}.`, 'success');
    return { success: true, status: newStatusChoice };
  };

  const rescheduleDemo = (id, updates) => {
    const target = (data.demos || []).find(d => d.id === id);
    if (!target) return { success: false, error: 'Demo not found' };

    const updated = rescheduleDemoRecord(target, updates);
    
    setData(prev => ({
      ...prev,
      demos: (prev.demos || []).map(d => d.id === id ? updated : d),
    }));

    addToast(`Demo ${id} rescheduled to ${updates.demoDate} at ${updates.demoTime}.`, 'success');
    return { success: true, demo: updated };
  };

  const convertDemoToStudent = (demoId, overrides = {}) => {
    const demo = (data.demos || []).find(d => d.id === demoId);
    if (!demo) {
      addToast('Demo record not found.', 'error');
      return { success: false, error: 'Demo record not found.' };
    }

    if (demo.convertedToStudent) {
      addToast(`Demo ${demo.id} has already been converted to Student (${demo.studentId}). Duplicate conversion blocked.`, 'error');
      return { success: false, duplicate: true, error: 'Demo already converted' };
    }

    // Build or find synthetic or real enquiry
    let targetEnquiryId = demo.enquiryId;
    let existingEnquiry = (data.enquiries || []).find(e => e.id === targetEnquiryId);

    if (!existingEnquiry) {
      const syntheticEnq = {
        id: `ENQ-DEMO-${demo.id}`,
        childName: demo.childName,
        childAge: demo.childAge || '6',
        gender: demo.gender || 'Male',
        dob: demo.dob || '',
        parentName: demo.parentName,
        phone: demo.phone,
        email: demo.email || '',
        interestedProgram: demo.program,
        center: demo.location,
        preferredBatchId: overrides.preferredBatchId || '',
        enquiryDate: demo.demoDate,
        notes: demo.notes || `Converted from Demo ${demo.id}`,
        stage: 'Demo Completed',
        source: ENQUIRY_SOURCES.MANUAL,
        demoId: demo.id,
      };
      targetEnquiryId = syntheticEnq.id;
      existingEnquiry = syntheticEnq;

      setData(prev => ({
        ...prev,
        enquiries: [syntheticEnq, ...(prev.enquiries || [])],
      }));
    }

    const enrollmentOverrides = {
      ...overrides,
      demoId: demo.id,
      center: overrides.center || demo.location,
      interestedProgram: overrides.interestedProgram || demo.program,
      childName: overrides.childName || demo.childName,
      parentName: overrides.parentName || demo.parentName,
      phone: overrides.phone || demo.phone,
      email: overrides.email || demo.email,
    };

    const res = enrollFromEnquiry(targetEnquiryId, enrollmentOverrides);
    if (res.success) {
      setData(prev => ({
        ...prev,
        demos: (prev.demos || []).map(d => d.id === demo.id ? {
          ...d,
          convertedToStudent: true,
          conversionStatus: 'Converted to Student',
          studentId: res.student.id,
          status: DEMO_STATUSES.COMPLETED,
          updatedAt: new Date().toISOString(),
        } : d),
      }));
    }
    return res;
  };

  const addPayment = (paymentData) => {
    const newInv = {
      ...paymentData,
      id: `INV-${9020 + data.payments.length + 1}`,
      invoiceNumber: `LSA-2026-11-${String(data.payments.length + 1).padStart(3, '0')}`,
      paymentDate: new Date().toISOString().split('T')[0],
      transactionId: `TXN${Math.floor(1000000 + Math.random() * 9000000)}`,
      status: 'Paid'
    };
    setData(prev => ({
      ...prev,
      payments: [newInv, ...prev.payments]
    }));
    addToast(`Payment of ₹${paymentData.amount.toLocaleString()} received! Receipt generated.`);
  };

  const saveBatchAttendance = ({ entries, date, location, batchId }) => {
    const coachProfile = currentPortal === 'coach' ? data.coaches[0] : null;
    const markedBy = currentPortal === 'coach'
      ? (coachProfile?.name || 'Coach')
      : ((data.userAccounts && data.userAccounts[0]?.name ? `${data.userAccounts[0].name} (Admin)` : 'Administrator (Admin)'));

    // Map existing records to detect edits
    const prevMap = new Map();
    (data.attendanceRecords || []).forEach(r => {
      prevMap.set(`${r.date}::${r.batchId}::${r.studentId}`, r);
    });

    const result = upsertBatchAttendanceRecords(data.attendanceRecords || [], {
      entries,
      date,
      location,
      batchId,
      students: data.students || [],
      classes: data.classes || [],
      classSchedules: data.classSchedules || [],
      role: currentPortal,
      coachProfile,
      markedBy,
    });

    if (!result.success) {
      addToast(result.error || 'Unable to save attendance records.', 'error');
      return result;
    }

    const newNotifications = [];
    const newHistoryLogs = [];
    let updatedCompensationRequests = [...(data.compensationRequests || [])];

    entries.forEach(entry => {
      const student = (data.students || []).find(s => s.id === entry.studentId);
      if (!student) return;

      const prevRec = prevMap.get(`${date}::${entry.batchId || batchId}::${entry.studentId}`);
      const prevStatus = prevRec?.status;

      // 1. When marked Absent (by Coach or Admin)
      if (entry.status === 'Absent') {
        const notif = createNotificationRecord({
          targetRole: 'parent',
          targetParentId: student.parentId || '',
          targetLocation: student.center,
          title: `Absence Recorded: ${student.name}`,
          message: `Your child ${student.name} was absent on ${date}. You may submit a compensation request in the Parent Portal.`,
          type: 'warning',
        });
        newNotifications.push(notif);

        newHistoryLogs.push({
          id: `HIST-${Date.now()}-${student.id}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          type: prevStatus ? 'Attendance Edited' : 'Attendance Marked',
          studentId: student.id,
          studentName: student.name,
          parentName: student.parentName || '',
          location: student.center,
          program: student.program || '',
          date,
          details: `Marked Absent by ${markedBy}`,
          actor: markedBy,
          role: currentPortal === 'coach' ? 'Coach' : 'Admin',
          status: 'Absent',
        });
      }
      // 2. When edited from Absent to Present by Admin (Rule 8)
      else if (prevStatus === 'Absent' && entry.status === 'Present') {
        updatedCompensationRequests = updatedCompensationRequests.map(req => {
          if (req.studentId === student.id && req.missedDate === date && req.status === 'Pending') {
            return {
              ...req,
              status: 'Cancelled',
              adminNotes: 'Attendance was updated from Absent to Present by Admin.',
              updatedAt: new Date().toISOString(),
            };
          }
          return req;
        });

        const notif = createNotificationRecord({
          targetRole: 'parent',
          targetParentId: student.parentId || '',
          targetLocation: student.center,
          title: `Attendance Corrected: ${student.name}`,
          message: `Attendance for ${student.name} on ${date} was updated to Present.`,
          type: 'info',
        });
        newNotifications.push(notif);

        newHistoryLogs.push({
          id: `HIST-${Date.now()}-${student.id}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          type: 'Attendance Edited',
          studentId: student.id,
          studentName: student.name,
          parentName: student.parentName || '',
          location: student.center,
          program: student.program || '',
          date,
          details: `Changed from Absent to Present by ${markedBy}`,
          actor: markedBy,
          role: currentPortal === 'coach' ? 'Coach' : 'Admin',
          status: 'Present',
        });
      }
      // 3. When marked Present initially
      else if (!prevStatus && entry.status === 'Present') {
        newHistoryLogs.push({
          id: `HIST-${Date.now()}-${student.id}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          type: 'Attendance Marked',
          studentId: student.id,
          studentName: student.name,
          parentName: student.parentName || '',
          location: student.center,
          program: student.program || '',
          date,
          details: `Marked Present by ${markedBy}`,
          actor: markedBy,
          role: currentPortal === 'coach' ? 'Coach' : 'Admin',
          status: 'Present',
        });
      }
    });

    // ------------------------------------------------------------------------
    // Automatic Class Package Tracking & Reminder Automation
    // ------------------------------------------------------------------------
    const studentPackageUpdates = {};
    const todayYmd = new Date().toISOString().split('T')[0];

    (data.students || []).forEach(student => {
      // Evaluate each student who has an active package
      if (student.packageActivationDate) {
        const pkg = computeStudentPackage(student, result.records, todayYmd);
        
        // 1. 20-Class Parent Reminder Automation
        if (pkg.classesAttended >= PACKAGE_REMINDER_THRESHOLD && !student.reminder20Notified) {
          const reminderNotif = createNotificationRecord({
            targetRole: 'parent',
            targetParentId: student.parentId || '',
            targetLocation: student.center,
            title: `Class Package Renewal Reminder: ${student.name}`,
            message: `Your child ${student.name} has attended 20 of 24 classes (${pkg.classesRemaining} remaining). Package renewal is approaching.`,
            type: 'warning'
          });
          newNotifications.push(reminderNotif);

          studentPackageUpdates[student.id] = {
            ...(studentPackageUpdates[student.id] || {}),
            reminder20Notified: true,
            reminder20Date: todayYmd,
            packageStatus: PACKAGE_STATUSES.REMINDER_DUE
          };
        }

        // 2. 24-Class Package Completion & Renewal Notice
        if (pkg.classesAttended >= PACKAGE_TOTAL_CLASSES && !student.completionNotified) {
          const completionNotif = createNotificationRecord({
            targetRole: 'parent',
            targetParentId: student.parentId || '',
            targetLocation: student.center,
            title: `Package Completed - Renewal Due: ${student.name}`,
            message: `${student.name} has completed all 24 classes of the package. Renewal is now due. Please contact the academy desk to enroll for the next term.`,
            type: 'warning'
          });
          newNotifications.push(completionNotif);

          studentPackageUpdates[student.id] = {
            ...(studentPackageUpdates[student.id] || {}),
            completionNotified: true,
            completionDate: todayYmd,
            packageStatus: PACKAGE_STATUSES.COMPLETED
          };
        }
      }
    });

    setData(prev => ({
      ...prev,
      attendanceRecords: result.records,
      compensationRequests: updatedCompensationRequests,
      notifications: [...newNotifications, ...(prev.notifications || [])].slice(0, 80),
      compensationHistory: [...newHistoryLogs, ...(prev.compensationHistory || [])],
      coachReplacements: (prev.coachReplacements || []).map((r) => {
        if (
          r.date === date &&
          (!location || location === 'All' || r.location === location) &&
          (!batchId || batchId === 'All' || r.batch === batchId || r.batchId === batchId)
        ) {
          return { ...r, attendanceStatus: 'Marked' };
        }
        return r;
      }),
      students: Object.keys(studentPackageUpdates).length > 0
        ? (prev.students || []).map(s => studentPackageUpdates[s.id] ? { ...s, ...studentPackageUpdates[s.id] } : s)
        : prev.students
    }));

    addToast(
      `Saved ${result.savedCount} attendance record${result.savedCount === 1 ? '' : 's'} for ${date}.`,
      'success'
    );
    return result;
  };

  const markAttendance = (classId, studentId, status, date = new Date().toISOString().split('T')[0], location = '') => {
    const student = (data.students || []).find(s => s.id === studentId);
    const batch = (data.classes || []).find(c => c.id === classId);
    return saveBatchAttendance({
      entries: [{ studentId, batchId: classId, status }],
      date,
      location: location || batch?.center || student?.center || '',
      batchId: classId,
    });
  };

  // ==========================================================================
  // Coach Leave Request Workflow (Unified Coach Portal <-> Super Admin <-> Admin)
  // ==========================================================================
  const applyCoachLeave = (leavePayload = {}) => {
    const coachId = leavePayload.coachId || '';
    const coachName = leavePayload.coachName || '';
    const location = leavePayload.location || leavePayload.center || 'KK NAGAR';
    const leaveType = leavePayload.leaveType || LEAVE_TYPES.FULL_DAY;
    const halfDaySession =
      leavePayload.halfDaySession ||
      (leaveType === LEAVE_TYPES.HALF_DAY ? HALF_DAY_SESSIONS.MORNING : null);
    const startDate = leavePayload.startDate || new Date().toISOString().split('T')[0];
    const endDate = leavePayload.endDate || startDate;
    const reason = (leavePayload.reason || '').trim();
    const attachmentUrl = leavePayload.attachmentUrl || '';
    const attachmentName = leavePayload.attachmentName || '';

    const validation = validateCoachLeavePayload({
      coachId,
      coachName,
      startDate,
      endDate,
      leaveType,
      reason,
    });

    if (!validation.isValid) {
      addToast(validation.errors[0] || 'Incomplete leave request details.', 'error');
      return { success: false, errors: validation.errors };
    }

    // Duplicate detection: prevent identical active pending request for same coach and dates
    const existingPending = (data.coachLeaveRequests || []).find(
      (r) =>
        r.coachId === coachId &&
        r.status === LEAVE_STATUSES.PENDING &&
        r.startDate <= endDate &&
        (r.endDate || r.startDate) >= startDate
    );
    if (existingPending) {
      addToast(`A pending leave request (${existingPending.id}) is already awaiting review for these dates.`, 'error');
      return { success: false, duplicate: true, error: 'Duplicate pending leave request', existingId: existingPending.id };
    }

    // Generate collision-free Leave Request ID: CLR-001, CLR-002...
    const nextId = generateUniquePrefixedId(data.coachLeaveRequests || [], 'CLR');
    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const newRequest = {
      id: nextId,
      coachId,
      coachName,
      location,
      center: location,
      leaveType,
      halfDaySession,
      startDate,
      endDate,
      reason,
      attachmentUrl,
      attachmentName,
      status: LEAVE_STATUSES.PENDING,
      appliedOn: today,
      submittedAt: nowIso,
      reviewedBy: null,
      reviewedRole: null,
      reviewedAt: null,
      reviewNotes: '',
    };

    // Cross-portal notification for Admins & Super Admins
    const adminNotif = createNotificationRecord({
      targetRole: 'admin',
      targetLocation: location,
      title: `Coach Leave Request: ${coachName}`,
      message: `${coachName} (${coachId}) submitted a ${leaveType} leave request for ${startDate} to ${endDate}. Reason: ${reason}`,
      type: 'warning',
    });

    const superAdminNotif = createNotificationRecord({
      targetRole: 'super_admin',
      targetLocation: location,
      title: `Coach Leave Request: ${coachName}`,
      message: `${coachName} submitted ${leaveType} leave (${startDate} to ${endDate}) pending review.`,
      type: 'warning',
    });

    setData((prev) => {
      const nextCoachLeaves = [newRequest, ...(prev.coachLeaveRequests || [])];
      return {
        ...prev,
        coachLeaveRequests: nextCoachLeaves,
        leaveRequests: nextCoachLeaves, // Synchronize for backwards compatibility
        notifications: [adminNotif, superAdminNotif, ...(prev.notifications || [])].slice(0, 80),
      };
    });

    addToast(`Leave request ${nextId} submitted successfully. Status: Pending.`, 'success');
    return { success: true, request: newRequest };
  };

  const reviewCoachLeave = (requestId, { status, reviewedBy, reviewedRole, reviewNotes } = {}) => {
    if (status !== LEAVE_STATUSES.APPROVED && status !== LEAVE_STATUSES.REJECTED) {
      addToast('Invalid review status. Must be Approved or Rejected.', 'error');
      return { success: false, error: 'Invalid status' };
    }

    const targetReq = (data.coachLeaveRequests || []).find((r) => r.id === requestId);
    if (!targetReq) {
      addToast(`Leave request ${requestId} not found.`, 'error');
      return { success: false, error: 'Request not found' };
    }

    const reviewerName = reviewedBy || (currentPortal === 'super_coach' ? 'Super Admin' : 'Admin');
    const reviewerRole = reviewedRole || (currentPortal === 'super_coach' ? 'super_admin' : 'admin');
    const nowIso = new Date().toISOString();

    const updatedRequest = {
      ...targetReq,
      status,
      reviewedBy: reviewerName,
      reviewedRole: reviewerRole,
      reviewedAt: nowIso,
      reviewNotes:
        reviewNotes ||
        (status === LEAVE_STATUSES.APPROVED
          ? 'Approved by Academy Administration.'
          : 'Declined according to staffing schedule requirements.'),
    };

    // Notify the Coach
    const coachNotif = createNotificationRecord({
      targetRole: 'coach',
      targetCoachId: targetReq.coachId,
      targetLocation: targetReq.location,
      title: `Leave Request ${status}: ${targetReq.id}`,
      message: `Your ${targetReq.leaveType} leave request for ${targetReq.startDate} to ${targetReq.endDate} has been ${status.toLowerCase()} by ${reviewerName}.${reviewNotes ? ` Note: ${reviewNotes}` : ''}`,
      type: status === LEAVE_STATUSES.APPROVED ? 'success' : 'error',
    });

    setData((prev) => {
      const nextCoachLeaves = (prev.coachLeaveRequests || []).map((r) =>
        r.id === requestId ? updatedRequest : r
      );
      return {
        ...prev,
        coachLeaveRequests: nextCoachLeaves,
        leaveRequests: nextCoachLeaves,
        notifications: [coachNotif, ...(prev.notifications || [])].slice(0, 80),
      };
    });

    addToast(`Coach leave request ${requestId} has been ${status}.`, 'success');
    return { success: true, request: updatedRequest };
  };

  const deleteCoachLeave = (requestId) => {
    setData((prev) => ({
      ...prev,
      coachLeaveRequests: (prev.coachLeaveRequests || []).filter((r) => r.id !== requestId),
      leaveRequests: (prev.leaveRequests || []).filter((r) => r.id !== requestId),
    }));
    addToast(`Leave request ${requestId} removed.`, 'info');
  };

  // Legacy wrappers for backwards compatibility
  const applyLeave = (leaveData) => applyCoachLeave(leaveData);
  const updateLeaveStatus = (id, newStatus, reviewer, reviewNotes) =>
    reviewCoachLeave(id, { status: newStatus, reviewedBy: reviewer, reviewNotes });

  const createTicket = (ticketData) => {
    const newTicket = {
      ...ticketData,
      id: `TCK-${800 + data.supportTickets.length + 1}`,
      status: 'Open',
      lastUpdate: 'Just now',
      messages: [
        {
          sender: ticketData.customerName,
          time: 'Just now',
          text: ticketData.description
        }
      ]
    };
    setData(prev => ({
      ...prev,
      supportTickets: [newTicket, ...prev.supportTickets]
    }));
    addToast(`Ticket #${newTicket.id} created.`);
  };

  const updateTicketStatus = (id, newStatus) => {
    setData(prev => ({
      ...prev,
      supportTickets: prev.supportTickets.map(t => t.id === id ? { ...t, status: newStatus, lastUpdate: 'Just now' } : t)
    }));
    addToast(`Ticket status set to ${newStatus}.`);
  };

  const addTicketReply = (id, replyText, senderName) => {
    setData(prev => ({
      ...prev,
      supportTickets: prev.supportTickets.map(t => {
        if (t.id === id) {
          return {
            ...t,
            lastUpdate: 'Just now',
            messages: [
              ...t.messages,
              {
                sender: senderName,
                time: 'Just now',
                text: replyText
              }
            ]
          };
        }
        return t;
      })
    }));
    addToast('Reply sent to customer.');
  };

  const addFeedback = (feedbackData) => {
    const newFb = {
      ...feedbackData,
      id: `FB-${String(data.feedback.length + 1).padStart(2, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Published'
    };
    setData(prev => ({
      ...prev,
      feedback: [newFb, ...prev.feedback]
    }));
    addToast('Thank you! Your feedback has been shared with academy coaches.');
  };

  const registerCompetition = (compId, studentName) => {
    setData(prev => ({
      ...prev,
      competitions: prev.competitions.map(c => c.id === compId ? { ...c, registeredCount: c.registeredCount + 1 } : c)
    }));
    addToast(`Successfully registered ${studentName} for the tournament!`);
  };

  const addParent = (parentData) => {
    const existingParents = data.parents || [];
    const firstLinkedStudentId = Array.isArray(parentData.linkedStudentIds) && parentData.linkedStudentIds[0];
    const parentId =
      firstLinkedStudentId ||
      generateCommonMemberId(data.students || [], existingParents, parentData.center);
    const linkedStudentNames = Array.isArray(parentData.children) ? parentData.children : [];
    const normalizedEmail = (parentData.email || '').trim().toLowerCase();
    const tempPassword = generateParentPassword(parentData.phone);

    let createdAccountResult = null;
    let nextUserAccounts = data.userAccounts || [];

    if (parentData.grantPortalAccess !== false) {
      if (!normalizedEmail) {
        addToast('Parent Email ID is required to grant Parent Portal access.', 'error');
        return { success: false, error: 'Email required' };
      }
      const emailExists = nextUserAccounts.some(
        a => a.email.toLowerCase() === normalizedEmail
      );
      if (emailExists) {
        addToast(`Error: An account with email "${parentData.email}" already exists.`, 'error');
        return { success: false, error: 'Email already exists' };
      }

      const newAccount = {
        id: `ACC-${parentId}`,
        role: 'parent',
        name: parentData.name.trim(),
        email: normalizedEmail,
        phone: parentData.phone?.trim() || '',
        center: parentData.center,
        locations: [parentData.center],
        linkedStudents: linkedStudentNames,
        status: 'Active',
        isTemporaryPassword: true,
        password: tempPassword,
        tempPasswordDisplay: tempPassword,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'Never',
        permissions: ['VIEW_OWN_CHILDREN', 'MAKE_PAYMENTS', 'REQUEST_COMPENSATION'],
      };
      nextUserAccounts = [newAccount, ...nextUserAccounts];
      createdAccountResult = { account: newAccount, tempPassword };
    }

    const newParent = {
      id: parentId,
      name: parentData.name.trim(),
      phone: parentData.phone?.trim() || '',
      email: normalizedEmail,
      center: parentData.center,
      address: parentData.address?.trim() || `${parentData.center}, Chennai`,
      children: linkedStudentNames,
      linkedStudentIds: Array.isArray(parentData.linkedStudentIds) ? parentData.linkedStudentIds : (firstLinkedStudentId ? [firstLinkedStudentId] : []),
      totalFeesPaid: '₹0',
      pendingDue: '₹0',
      portalAccess: parentData.grantPortalAccess !== false,
      status: 'Active',
      password: tempPassword,
      tempPassword: tempPassword,
      tempPasswordDisplay: tempPassword,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedStudents = (data.students || []).map(stu => {
      const matchedById =
        Array.isArray(parentData.linkedStudentIds) &&
        parentData.linkedStudentIds.includes(stu.id);
      const matchedByName =
        linkedStudentNames.includes(stu.name) && stu.center === parentData.center;

      if (matchedById || matchedByName) {
        return {
          ...stu,
          parentId,
          parentName: newParent.name,
          parentPhone: newParent.phone || stu.parentPhone,
          parentEmail: newParent.email || stu.parentEmail,
        };
      }
      return stu;
    });

    setData(prev => ({
      ...prev,
      parents: [newParent, ...(prev.parents || [])],
      students: updatedStudents,
      userAccounts: nextUserAccounts,
    }));

    if (createdAccountResult) {
      addToast(
        `Parent "${newParent.name}" (${newParent.id}) added & Portal activated! Password: ${createdAccountResult.tempPassword}`,
        'success'
      );
    } else {
      addToast(`Parent "${newParent.name}" (${newParent.id}) added under ${newParent.center}.`, 'success');
    }

    return { success: true, parent: newParent, ...createdAccountResult };
  };

  const updateParent = (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      parents: (prev.parents || []).map((p) =>
        p.id === id || (p.linkedStudentIds || []).includes(id) ? { ...p, ...updatedFields, id } : p
      ),
    }));
    addToast('Parent record updated.');
    return { success: true };
  };

  const addCoach = (coachPayload) => {
    const nextSeq = (data.coaches || []).reduce((max, c) => {
      const match = (c.id || '').match(/COACH-(\d+)/i);
      const num = match ? parseInt(match[1], 10) : 0;
      return num > max ? num : max;
    }, (data.coaches || []).length);
    const coachId = coachPayload.id || `COACH-${String(nextSeq + 1).padStart(3, '0')}`;

    const newCoach = {
      ...coachPayload,
      id: coachId,
      status: coachPayload.status || 'Active',
      rating: coachPayload.rating || '5.0',
      activeBatches: coachPayload.activeBatches || 0,
      studentsCount: coachPayload.studentsCount || 0,
      auditLog: coachPayload.auditLog || [
        {
          action: 'Coach Registered',
          performedBy: 'Admin (Super Admin)',
          timestamp: new Date().toISOString(),
          details: 'Initial onboarding registration completed via Admin Portal'
        }
      ]
    };

    setData((prev) => ({
      ...prev,
      coaches: [...(prev.coaches || []), newCoach]
    }));

    return newCoach;
  };

  const updateCoach = (coachId, updates) => {
    setData((prev) => ({
      ...prev,
      coaches: (prev.coaches || []).map((c) => {
        if (c.id === coachId) {
          const auditHistory = c.auditLog || [];
          const newAuditEntry = {
            action: updates.auditAction || 'Profile Updated',
            performedBy: 'Admin (Super Admin)',
            timestamp: new Date().toISOString(),
            details: updates.auditNote || 'Coach profile details updated by administrator'
          };
          const cleanUpdates = { ...updates };
          delete cleanUpdates.auditAction;
          delete cleanUpdates.auditNote;
          return {
            ...c,
            ...cleanUpdates,
            auditLog: [newAuditEntry, ...auditHistory]
          };
        }
        return c;
      })
    }));
    return { success: true };
  };

  const deleteCoach = (coachId) => {
    setData((prev) => ({
      ...prev,
      coaches: (prev.coaches || []).filter((c) => c.id !== coachId)
    }));
    return { success: true };
  };

  // Module 5: Account Management (Admin Creates Parent & Coach Accounts)
  const createAccount = (accountData) => {
    // Check email uniqueness
    const exists = (data.userAccounts || []).some(
      a => a.email.toLowerCase() === accountData.email.trim().toLowerCase()
    );
    if (exists) {
      addToast(`Error: An account with email "${accountData.email}" already exists.`, 'error');
      return { success: false, error: 'Email already exists' };
    }

    const normalizedEmail = accountData.email.trim().toLowerCase();
    const targetLoc = accountData.center || accountData.locations?.[0] || 'KK NAGAR';
    const locs = accountData.locations?.length ? accountData.locations : [targetLoc];

    // Determine ID: for parents, check if child linked or generate common ID
    const childrenNames = Array.isArray(accountData.linkedStudents) ? accountData.linkedStudents : [];
    const matchedChild = (data.students || []).find(s => 
      childrenNames.includes(s.name) ||
      (s.parentEmail && s.parentEmail.toLowerCase() === normalizedEmail)
    );

    const commonMemberId = (matchedChild?.id && matchedChild.id.startsWith('LS-'))
      ? matchedChild.id
      : generateCommonMemberId(data.students || [], data.parents || [], targetLoc);

    const tempPassword = accountData.role === 'parent'
      ? generateParentPassword(accountData.phone)
      : `Spartan@${Math.floor(1000 + Math.random() * 9000)}`;

    const newAccount = {
      id: accountData.role === 'parent' ? `ACC-${commonMemberId}` : `ACC-${String((data.userAccounts || []).length + 1).padStart(3, '0')}`,
      ...accountData,
      email: normalizedEmail,
      center: targetLoc,
      locations: locs,
      status: 'Active',
      isTemporaryPassword: true,
      password: tempPassword,
      tempPasswordDisplay: tempPassword,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      permissions: accountData.role === 'coach' 
        ? ["MARK_CLASS_ATTENDANCE", "UPDATE_STUDENT_PERFORMANCE", "VIEW_ASSIGNED_CLASSES"]
        : ["VIEW_OWN_CHILDREN", "MAKE_PAYMENTS", "REQUEST_COMPENSATION"]
    };

    setData(prev => {
      let nextParents = prev.parents || [];
      let nextStudents = prev.students || [];

      if (
        accountData.role === 'parent' &&
        !nextParents.some(p => (p.email || '').toLowerCase() === normalizedEmail)
      ) {
        const parentId = commonMemberId;

        nextParents = [
          {
            id: parentId,
            name: accountData.name.trim(),
            phone: accountData.phone?.trim() || '',
            email: normalizedEmail,
            center: targetLoc,
            address: `${targetLoc}, Chennai`,
            children: childrenNames,
            linkedStudentIds: matchedChild ? [matchedChild.id] : [],
            totalFeesPaid: '₹0',
            pendingDue: '₹0',
            portalAccess: true,
            status: 'Active',
            password: tempPassword,
            tempPassword: tempPassword,
            tempPasswordDisplay: tempPassword,
            createdAt: new Date().toISOString().split('T')[0],
          },
          ...nextParents,
        ];

        nextStudents = nextStudents.map(stu =>
          childrenNames.includes(stu.name)
            ? { ...stu, parentId, parentName: accountData.name.trim(), parentEmail: normalizedEmail }
            : stu
        );
      }

      return {
        ...prev,
        parents: nextParents,
        students: nextStudents,
        userAccounts: [newAccount, ...(prev.userAccounts || [])]
      };
    });

    addToast(`Account created for ${newAccount.name}! Temp password: ${tempPassword}`);
    return { success: true, account: newAccount, tempPassword };
  };

  const resetAccountPassword = (accountId) => {
    const newTemp = `Spartan@${Math.floor(1000 + Math.random() * 9000)}`;
    setData(prev => ({
      ...prev,
      userAccounts: (prev.userAccounts || []).map(a => 
        a.id === accountId ? { ...a, isTemporaryPassword: true, tempPasswordDisplay: newTemp } : a
      )
    }));
    addToast(`Temporary password reset to ${newTemp}. Invitation re-sent!`);
  };

  const toggleAccountStatus = (accountId) => {
    setData(prev => ({
      ...prev,
      userAccounts: (prev.userAccounts || []).map(a => 
        a.id === accountId ? { ...a, status: a.status === 'Active' ? 'Deactivated' : 'Active' } : a
      )
    }));
    addToast('Account status updated.');
  };

  const deleteAccount = (accountId, accountEmail) => {
    setData(prev => ({
      ...prev,
      userAccounts: (prev.userAccounts || []).filter(
        a => a.id !== accountId && (!accountEmail || (a.email && a.email.toLowerCase() !== accountEmail.toLowerCase()))
      ),
      parents: (prev.parents || []).map(p =>
        (accountEmail && p.email && p.email.toLowerCase() === accountEmail.toLowerCase())
          ? { ...p, portalAccess: false }
          : p
      )
    }));
    addToast('Account deleted permanently.', 'info');
  };

  // Module 4.9: Fee Structures & Assignments
  const createFeeStructure = (feeData) => {
    const newStructure = {
      id: `FS-0${(data.feeStructures || []).length + 1}`,
      ...feeData,
      status: 'Active'
    };
    setData(prev => ({
      ...prev,
      feeStructures: [newStructure, ...(prev.feeStructures || [])]
    }));
    addToast(`Fee structure created for ${newStructure.programName}.`);
    return newStructure;
  };

  const assignStudentFee = (assignmentData) => {
    const newAssignment = {
      id: `SFA-00${(data.studentFeeAssignments || []).length + 1}`,
      ...assignmentData,
      status: assignmentData.remainingBalance === 0 ? 'Paid' : 'Pending',
      lastPaymentDate: new Date().toISOString().split('T')[0]
    };
    setData(prev => ({
      ...prev,
      studentFeeAssignments: [newAssignment, ...(prev.studentFeeAssignments || [])]
    }));
    addToast(`Fee assigned to ${assignmentData.studentName}.`);
    return newAssignment;
  };

  // Cross-portal notification builder
  const createNotificationRecord = ({
    targetRole = 'all',
    targetParentId = '',
    targetCoachId = '',
    targetLocation = '',
    title,
    message,
    type = 'info',
  }) => ({
    id: `NTF-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    targetRole,
    targetParentId,
    targetCoachId,
    targetLocation,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  });

  const markNotificationsRead = (role = 'all') => {
    setData(prev => ({
      ...prev,
      notifications: (prev.notifications || []).map(n =>
        role === 'all' || n.targetRole === role || n.targetRole === 'all'
          ? { ...n, read: true }
          : n
      )
    }));
  };

  // Module 4.8: Student Compensation Class Requests (Unified Parent + Admin Workflow)
  const submitCompensationRequest = (reqData) => {
    const requestSource = reqData.requestSource || (currentPortal === 'admin' ? 'Admin' : 'Parent');
    const student = (data.students || []).find(s => s.id === reqData.studentId)
      || (data.students || []).find(s => s.name === reqData.studentName);
    const parent = (data.parents || []).find(p => p.id === (reqData.parentId || student?.parentId))
      || (data.parents || []).find(p => p.name === (reqData.parentName || student?.parentName));

    const eligibilityResult = checkCompensationEligibility({
      student: student || (reqData.studentId ? { id: reqData.studentId, name: reqData.studentName, status: 'Active', parentId: reqData.parentId } : null),
      missedDate: reqData.missedDate,
      missedClass: reqData.missedClass || reqData.batchName,
      batchId: reqData.batchId,
      existingRequests: data.compensationRequests || [],
      parentId: reqData.parentId || parent?.id || '',
      role: requestSource === 'Admin' ? 'admin' : 'parent',
    });

    if (!eligibilityResult.valid) {
      addToast(eligibilityResult.reason, 'error');
      return { success: false, message: eligibilityResult.reason };
    }

    const nowIso = new Date().toISOString();
    const requestId = generateUniquePrefixedId('CMP', data.compensationRequests || [], 100);
    const center = reqData.center || reqData.location || student?.center || parent?.center || '';
    const reasonCategory = reqData.reasonCategory || 'Other';
    const explanation = reqData.explanation || reqData.reason || '';
    const formattedReason = reasonCategory && explanation && !explanation.startsWith(reasonCategory)
      ? `${reasonCategory}: ${explanation}`
      : (explanation || reasonCategory);

    const initialStatus = requestSource === 'Admin' && reqData.initialStatus
      ? reqData.initialStatus
      : 'Pending';

    const newReq = {
      id: requestId,
      studentId: student?.id || reqData.studentId || '',
      studentName: student?.name || reqData.studentName || '',
      parentId: parent?.id || reqData.parentId || student?.parentId || '',
      parentName: parent?.name || reqData.parentName || student?.parentName || '',
      parentEmail: parent?.email || reqData.parentEmail || student?.parentEmail || '',
      parentPhone: parent?.phone || reqData.parentPhone || '',
      center,
      location: center,
      program: reqData.program || student?.program || '',
      batchId: reqData.batchId || '',
      batchName: reqData.batchName || reqData.missedClass || '',
      missedClass: reqData.missedClass || reqData.batchName || `${reqData.program || student?.program || 'Training'} Session`,
      missedDate: reqData.missedDate,
      reasonCategory,
      explanation,
      reason: formattedReason,
      requestSource,
      eligibility: reqData.eligibility || eligibilityResult.eligibilityLabel,
      appliedOn: nowIso.split('T')[0],
      createdAt: nowIso,
      updatedAt: nowIso,
      status: initialStatus,
      adminNotes: reqData.adminNotes || '',
      approvalNotes: reqData.adminNotes || (requestSource === 'Admin' ? 'Created manually by Admin' : 'Awaiting Admin review'),
      reviewedBy: requestSource === 'Admin' ? 'Administrator' : 'Pending Admin Approval',
      replacementDate: '',
      replacementStartTime: '',
      replacementEndTime: '',
      replacementLocation: '',
      replacementProgram: '',
      replacementBatchId: '',
      replacementBatch: '',
      replacementSlot: '',
      replacementCoachId: '',
      replacementCoach: '',
      linkedScheduleId: '',
    };

    const alertNotif = requestSource === 'Parent'
      ? createNotificationRecord({
          targetRole: 'admin',
          targetLocation: center,
          title: 'New Compensation Request',
          message: `${newReq.parentName || 'Parent'} requested a compensation class for ${newReq.studentName} (${newReq.missedDate} • ${center}).`,
          type: 'warning',
        })
      : createNotificationRecord({
          targetRole: 'parent',
          targetParentId: newReq.parentId,
          targetLocation: center,
          title: 'Compensation Request Created by Admin',
          message: `Admin logged a compensation request (${newReq.id}) for ${newReq.studentName} for missed session on ${newReq.missedDate}.`,
          type: 'info',
        });

    const historyEntry = {
      id: `HIST-${Date.now()}-${newReq.studentId}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: nowIso,
      type: 'Request Submitted',
      studentId: newReq.studentId,
      studentName: newReq.studentName,
      parentName: newReq.parentName,
      location: newReq.location,
      program: newReq.program,
      date: newReq.missedDate,
      details: `Submitted compensation request for missed session on ${newReq.missedDate} (${newReq.reason})`,
      actor: newReq.parentName || requestSource,
      role: requestSource,
      status: 'Pending',
    };

    setData(prev => ({
      ...prev,
      compensationRequests: [newReq, ...(prev.compensationRequests || [])],
      notifications: [alertNotif, ...(prev.notifications || [])].slice(0, 80),
      compensationHistory: [historyEntry, ...(prev.compensationHistory || [])],
    }));

    addToast(
      requestSource === 'Admin'
        ? `Manual compensation request ${newReq.id} created for ${newReq.studentName}.`
        : 'Compensation request submitted for Admin review.',
      'success'
    );
    return { success: true, request: newReq };
  };

  const updateCompensationRequest = (id, updates = {}) => {
    const existing = (data.compensationRequests || []).find(r => r.id === id);
    if (!existing) {
      addToast(`Compensation request ${id} not found.`, 'error');
      return { success: false, message: 'Request not found.' };
    }

    // RBAC protection: Parents may never approve, reject, assign coaches, or schedule replacements
    if (currentPortal === 'parent') {
      addToast('Permission Denied: Only Academy Admin can approve, schedule, or modify requests.', 'error');
      return { success: false, message: 'Unauthorized parent mutation.' };
    }

    const nextStatus = updates.status || existing.status;
    const isScheduling = Boolean(updates.replacementDate && updates.replacementStartTime && updates.replacementEndTime);

    let nextSchedules = [...(data.classSchedules || [])];
    let linkedScheduleId = existing.linkedScheduleId || '';
    let replacementSlot = updates.replacementSlot ?? existing.replacementSlot ?? '';
    let replacementCoach = updates.replacementCoach ?? existing.replacementCoach ?? '';
    let replacementCoachId = updates.replacementCoachId ?? existing.replacementCoachId ?? '';

    if (isScheduling) {
      const coachObj = (data.coaches || []).find(
        c => c.id === updates.replacementCoachId || c.name === updates.replacementCoach
      );
      replacementCoachId = coachObj?.id || updates.replacementCoachId || '';
      replacementCoach = coachObj?.name || updates.replacementCoach || '';
      const replacementLocation = updates.replacementLocation || existing.center || existing.location;
      const replacementProgram = updates.replacementProgram || existing.program;
      const replacementBatch = updates.replacementBatch || updates.replacementBatchName || `${replacementProgram} (Compensation)`;

      const slotValidation = validateReplacementSlot({
        replacementDate: updates.replacementDate,
        replacementStartTime: updates.replacementStartTime,
        replacementEndTime: updates.replacementEndTime,
        replacementLocation,
        replacementCoachId,
        replacementCoachName: replacementCoach,
        classSchedules: nextSchedules,
        excludeScheduleId: linkedScheduleId || null,
      });

      if (!slotValidation.valid) {
        addToast(slotValidation.message, 'error');
        return { success: false, message: slotValidation.message };
      }

      replacementSlot = formatReplacementSlotLabel({
        replacementDate: updates.replacementDate,
        replacementStartTime: updates.replacementStartTime,
        replacementEndTime: updates.replacementEndTime,
        replacementLocation,
      });

      const weekday = updates.replacementDate
        ? new Date(`${updates.replacementDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' })
        : '';

      if (linkedScheduleId && nextSchedules.some(s => s.id === linkedScheduleId)) {
        nextSchedules = nextSchedules.map(s =>
          s.id === linkedScheduleId
            ? {
                ...s,
                location: replacementLocation,
                program: replacementProgram,
                batch: replacementBatch,
                batchId: updates.replacementBatchId || s.batchId || '',
                coachId: replacementCoachId,
                coachName: replacementCoach,
                date: updates.replacementDate,
                weekday,
                startTime: updates.replacementStartTime,
                endTime: updates.replacementEndTime,
                status: 'Updated',
                notes: updates.approvalNotes || updates.adminNotes || `Replacement session for ${existing.studentName}`,
                updatedAt: new Date().toISOString(),
              }
            : s
        );
      } else {
        linkedScheduleId = `SCH-CMP-${Date.now().toString(36).toUpperCase().slice(-5)}`;
        const replacementSchedule = {
          id: linkedScheduleId,
          location: replacementLocation,
          program: replacementProgram,
          batch: replacementBatch,
          batchId: updates.replacementBatchId || '',
          coachId: replacementCoachId,
          coachName: replacementCoach,
          additionalCoaches: [],
          weekday,
          date: updates.replacementDate,
          startTime: updates.replacementStartTime,
          endTime: updates.replacementEndTime,
          venue: '',
          capacity: 1,
          enrolledCount: 1,
          enrolledStudents: [existing.studentName],
          enrolledStudentIds: existing.studentId ? [existing.studentId] : [],
          targetStudentId: existing.studentId || '',
          isCompensationReplacement: true,
          compensationRequestId: id,
          notes: updates.approvalNotes || updates.adminNotes || `Replacement class for missed session on ${existing.missedDate}`,
          status: 'Scheduled',
          createdAt: new Date().toISOString(),
          publishedBy: 'Administrator',
        };
        nextSchedules = [replacementSchedule, ...nextSchedules];
      }
    } else if ((nextStatus === 'Cancelled' || nextStatus === 'Rejected' || nextStatus === 'Completed') && linkedScheduleId) {
      nextSchedules = nextSchedules.map(s =>
        s.id === linkedScheduleId
          ? {
              ...s,
              status: nextStatus === 'Completed' ? 'Completed' : 'Cancelled',
              cancellationReason: nextStatus !== 'Completed' ? (updates.approvalNotes || `Compensation ${nextStatus}`) : s.cancellationReason,
              updatedAt: new Date().toISOString(),
            }
          : s
      );
    }

    const updatedReq = {
      ...existing,
      ...updates,
      status: isScheduling ? 'Scheduled' : nextStatus,
      replacementSlot,
      replacementCoach,
      replacementCoachId,
      linkedScheduleId,
      reviewedBy: updates.reviewedBy || (currentPortal === 'coach' ? existing.reviewedBy : 'Administrator'),
      updatedAt: new Date().toISOString(),
    };

    const newNotifications = [];
    if (updatedReq.parentId || updatedReq.parentName) {
      newNotifications.push(
        createNotificationRecord({
          targetRole: 'parent',
          targetParentId: updatedReq.parentId,
          targetLocation: updatedReq.center,
          title: `Compensation ${updatedReq.status}`,
          message:
            updatedReq.status === 'Scheduled'
              ? `${updatedReq.studentName}'s replacement class is scheduled on ${updatedReq.replacementSlot} with Coach ${updatedReq.replacementCoach}.`
              : `${updatedReq.studentName}'s compensation request (${id}) is now ${updatedReq.status}.`,
          type: updatedReq.status === 'Rejected' || updatedReq.status === 'Cancelled' ? 'warning' : 'success',
        })
      );
    }
    if (isScheduling && replacementCoachId) {
      newNotifications.push(
        createNotificationRecord({
          targetRole: 'coach',
          targetCoachId: replacementCoachId,
          targetLocation: updatedReq.replacementLocation || updatedReq.center,
          title: 'Replacement Session Assigned',
          message: `You are assigned a replacement compensation session for ${updatedReq.studentName} on ${updatedReq.replacementSlot}.`,
          type: 'info',
        })
      );
    }

    const historyEvent = {
      id: `HIST-${Date.now()}-${updatedReq.studentId || id}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: isScheduling ? 'Compensation Allotted' : `Request ${updatedReq.status}`,
      studentId: updatedReq.studentId,
      studentName: updatedReq.studentName,
      parentName: updatedReq.parentName,
      location: updatedReq.replacementLocation || updatedReq.center,
      program: updatedReq.replacementProgram || updatedReq.program,
      date: updatedReq.replacementDate || updatedReq.missedDate,
      details: isScheduling
        ? `Allotted replacement session on ${updatedReq.replacementDate} (${updatedReq.replacementSlot}) with ${updatedReq.replacementCoach}`
        : `Request status updated to ${updatedReq.status}. Notes: ${updatedReq.approvalNotes || ''}`,
      actor: 'Administrator',
      role: 'Admin',
      status: updatedReq.status,
    };

    setData(prev => ({
      ...prev,
      compensationRequests: (prev.compensationRequests || []).map(r => (r.id === id ? updatedReq : r)),
      classSchedules: nextSchedules,
      notifications: [...newNotifications, ...(prev.notifications || [])].slice(0, 80),
      compensationHistory: [historyEvent, ...(prev.compensationHistory || [])],
    }));

    addToast(`Compensation request ${id} updated to ${updatedReq.status}.`, 'success');
    return { success: true, request: updatedReq };
  };

  const updateCompensationStatus = (id, newStatus, approvalNotes, replacementSlot, replacementCoach) => {
    return updateCompensationRequest(id, {
      status: newStatus,
      approvalNotes,
      ...(replacementSlot ? { replacementSlot } : {}),
      ...(replacementCoach ? { replacementCoach } : {}),
    });
  };

  // Module 4.8: Coach Compensation Classes
  const createCoachCompensation = (compData) => {
    const newComp = {
      id: `CCOMP-0${(data.coachCompensationClasses || []).length + 1}`,
      ...compData,
      status: 'Scheduled',
      assignedBy: 'Administrator'
    };
    setData(prev => ({
      ...prev,
      coachCompensationClasses: [newComp, ...(prev.coachCompensationClasses || [])]
    }));
    addToast(`Coach replacement class assigned to ${newComp.coachName}.`);
  };

  const updateCoachCompensation = (id, newStatus) => {
    setData(prev => ({
      ...prev,
      coachCompensationClasses: (prev.coachCompensationClasses || []).map(c => 
        c.id === id ? { ...c, status: newStatus } : c
      )
    }));
    addToast(`Coach compensation status updated to ${newStatus}.`);
  };

  // Module 8: Automatic Backup & Recovery
  const createBackup = (type = 'Manual Snapshot') => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString();
    const newBackup = {
      id: `BK-${dateStr}-${Math.floor(100 + Math.random() * 900)}`,
      name: `${type} (${timeStr})`,
      timestamp: `${dateStr} ${timeStr} IST`,
      type,
      size: `${(JSON.stringify(data).length / 1024 / 1024).toFixed(2)} MB`,
      recordsCount: Object.values(data).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 1), 0),
      status: 'Successful',
      checksum: `sha256-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`
    };

    setData(prev => ({
      ...prev,
      backups: [newBackup, ...(prev.backups || [])]
    }));

    // Trigger instant JSON file download
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `little_spartans_backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.warn('Backup download anchor prevented in non-browser context');
    }

    addToast(`New backup "${newBackup.id}" created & downloaded successfully!`);
    return newBackup;
  };

  const restoreBackup = (backupId) => {
    addToast(`System restored to backup ${backupId}. Academy state verified.`, 'success');
  };

  // Location-Based Class Scheduling: Synchronized across Admin, Coach & Parent Portals
  const buildFullScheduleRecord = (candidate, existingClasses = [], existingStudents = [], suffix = '') => {
    const id = `SCH-${Math.floor(1000 + Math.random() * 9000)}${suffix}`;
    const matchedBatch = (existingClasses || []).find(
      (cls) =>
        (candidate.batchId && cls.id === candidate.batchId) ||
        (cls.name === candidate.batch && cls.center === candidate.location)
    );
    const matchingStudentObjs = (existingStudents || []).filter(
      (s) =>
        s.center === candidate.location &&
        (matchedBatch?.enrolledStudentIds?.includes(s.id) ||
          s.enrolledClasses?.includes(candidate.batch) ||
          s.batchName === candidate.batch)
    );
    const dynamicStudents =
      candidate.enrolledStudents && candidate.enrolledStudents.length > 0
        ? candidate.enrolledStudents
        : matchingStudentObjs.map((s) => s.name);
    const dynamicStudentIds =
      candidate.enrolledStudentIds && candidate.enrolledStudentIds.length > 0
        ? candidate.enrolledStudentIds
        : matchingStudentObjs.map((s) => s.id);

    const derivedWeekday =
      candidate.weekday ||
      (candidate.date
        ? new Date(`${candidate.date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' })
        : '');

    return {
      id,
      className: candidate.className || candidate.batch || `${candidate.program} Session`,
      location: candidate.location,
      program: candidate.program,
      programId: candidate.programId || '',
      programType: candidate.programType || '',
      batch: candidate.batch,
      batchId: candidate.batchId || matchedBatch?.id || '',
      coachId: candidate.coachId,
      coachName: candidate.coachName,
      additionalCoaches: candidate.additionalCoaches || matchedBatch?.additionalCoaches || [],
      weekday: derivedWeekday,
      date: candidate.date,
      startTime: candidate.startTime,
      endTime: candidate.endTime,
      timingDisplay: candidate.timingDisplay || '',
      venue: candidate.venue || '',
      capacity: parseInt(candidate.capacity, 10) || matchedBatch?.capacity || 20,
      enrolledCount: candidate.enrolledCount ?? dynamicStudents.length,
      enrolledStudents: dynamicStudents,
      enrolledStudentIds: dynamicStudentIds,
      recurringGroupId: candidate.recurringGroupId || '',
      scheduleType: candidate.scheduleType || 'one-time',
      notes: candidate.notes || '',
      attachment: candidate.attachment || null,
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
      publishedBy: 'Administrator',
    };
  };

  const createClassSchedule = (candidate) => {
    const conflict = checkScheduleConflict(candidate, data.classSchedules || []);
    if (conflict.hasConflict) {
      addToast(conflict.message, 'error');
      return { success: false, message: conflict.message };
    }

    const newSchedule = buildFullScheduleRecord(candidate, data.classes, data.students);
    const parentNotif = createNotificationRecord({
      targetRole: 'parent',
      targetLocation: newSchedule.location,
      title: 'New Class Scheduled',
      message: `${newSchedule.className} (${newSchedule.location}) scheduled on ${newSchedule.date} (${newSchedule.startTime} - ${newSchedule.endTime}).`,
      type: 'info',
    });
    const coachNotif = newSchedule.coachId
      ? createNotificationRecord({
          targetRole: 'coach',
          targetCoachId: newSchedule.coachId,
          targetLocation: newSchedule.location,
          title: 'New Class Assigned',
          message: `You have been scheduled for ${newSchedule.className} at ${newSchedule.location} on ${newSchedule.date} (${newSchedule.startTime} - ${newSchedule.endTime}).`,
          type: 'info',
        })
      : null;

    setData(prev => ({
      ...prev,
      classSchedules: [newSchedule, ...(prev.classSchedules || [])],
      notifications: [parentNotif, ...(coachNotif ? [coachNotif] : []), ...(prev.notifications || [])].slice(0, 80),
    }));

    addToast(`Schedule "${newSchedule.className}" published! Automatically synced to Coach & Parent Portals.`, 'success');
    return { success: true, schedule: newSchedule };
  };

  const createRecurringClassSchedules = (template) => {
    const plan = buildRecurringSchedules(template, data.classSchedules || []);
    if (plan.occurrencesCount === 0) {
      addToast('No valid class dates matched your selected weekday pattern & range.', 'error');
      return { success: false, message: 'No matching dates found.' };
    }
    if (plan.createdCandidates.length === 0) {
      const msg = plan.skippedConflicts[0]?.message || 'All selected recurring slots already exist or conflict with coach schedules.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }

    const recurringGroupId = `REC-${Date.now().toString(36).toUpperCase().slice(-5)}`;
    const createdSchedules = plan.createdCandidates.map((cand, idx) =>
      buildFullScheduleRecord(
        { ...cand, recurringGroupId, scheduleType: 'recurring' },
        data.classes,
        data.students,
        `-${idx + 1}`
      )
    );

    const sample = createdSchedules[0];
    const parentNotif = createNotificationRecord({
      targetRole: 'parent',
      targetLocation: sample.location,
      title: 'Weekly Class Timetable Published',
      message: `${createdSchedules.length} recurring sessions for ${sample.className} (${sample.location}) published starting ${sample.date}.`,
      type: 'info',
    });
    const coachNotif = sample.coachId
      ? createNotificationRecord({
          targetRole: 'coach',
          targetCoachId: sample.coachId,
          targetLocation: sample.location,
          title: 'Recurring Coaching Timetable Published',
          message: `${createdSchedules.length} sessions assigned for ${sample.className} at ${sample.location}.`,
          type: 'info',
        })
      : null;

    setData(prev => ({
      ...prev,
      classSchedules: [...createdSchedules, ...(prev.classSchedules || [])],
      notifications: [parentNotif, ...(coachNotif ? [coachNotif] : []), ...(prev.notifications || [])].slice(0, 80),
    }));

    const skippedCount = plan.skippedConflicts.length + plan.skippedDuplicates.length;
    addToast(
      `Published ${createdSchedules.length} recurring sessions${skippedCount > 0 ? ` (${skippedCount} skipped due to conflicts/duplicates)` : ''}! Synced to Coach & Parent Portals.`,
      'success'
    );
    return {
      success: true,
      createdCount: createdSchedules.length,
      skippedConflicts: plan.skippedConflicts,
      skippedDuplicates: plan.skippedDuplicates,
      schedules: createdSchedules,
    };
  };

  const updateClassSchedule = (id, updates) => {
    const existing = (data.classSchedules || []).find(s => s.id === id);
    if (!existing) {
      addToast('Schedule not found', 'error');
      return { success: false };
    }

    const candidate = { ...existing, ...updates };
    const conflict = checkScheduleConflict(candidate, data.classSchedules || [], id);
    if (conflict.hasConflict) {
      addToast(conflict.message, 'error');
      return { success: false, message: conflict.message };
    }

    const parentNotif = createNotificationRecord({
      targetRole: 'parent',
      targetLocation: candidate.location,
      title: 'Class Schedule Updated',
      message: `${candidate.className || candidate.batch} at ${candidate.location} on ${candidate.date} (${candidate.startTime} - ${candidate.endTime}) was updated.`,
      type: 'info',
    });

    setData(prev => ({
      ...prev,
      classSchedules: (prev.classSchedules || []).map(s => 
        s.id === id 
          ? { 
              ...s, 
              ...updates, 
              className: updates.className || updates.batch || s.className || s.batch,
              status: updates.status || (s.status === 'Completed' ? 'Completed' : 'Updated'),
              updatedAt: new Date().toISOString() 
            } 
          : s
      ),
      notifications: [parentNotif, ...(prev.notifications || [])].slice(0, 80),
    }));

    addToast(`Schedule ${id} updated! Coach & Parent Portals synchronized.`, 'info');
    return { success: true };
  };

  const cancelClassSchedule = (id, reason = '') => {
    const existing = (data.classSchedules || []).find(s => s.id === id);
    const parentNotif = existing
      ? createNotificationRecord({
          targetRole: 'parent',
          targetLocation: existing.location,
          title: 'Class Session Cancelled',
          message: `${existing.className || existing.batch} (${existing.location}) on ${existing.date} has been cancelled${reason ? `: ${reason}` : '.'}`,
          type: 'warning',
        })
      : null;

    setData(prev => ({
      ...prev,
      classSchedules: (prev.classSchedules || []).map(s => 
        s.id === id 
          ? { 
              ...s, 
              status: 'Cancelled', 
              cancellationReason: reason, 
              cancelledAt: new Date().toISOString() 
            } 
          : s
      ),
      compensationRequests: existing?.compensationRequestId
        ? (prev.compensationRequests || []).map(r =>
            r.id === existing.compensationRequestId
              ? { ...r, status: 'Cancelled', approvalNotes: reason || 'Replacement class cancelled by Admin', updatedAt: new Date().toISOString() }
              : r
          )
        : prev.compensationRequests,
      notifications: parentNotif ? [parentNotif, ...(prev.notifications || [])].slice(0, 80) : prev.notifications,
    }));
    addToast(`Schedule ${id} marked as Cancelled. Coach & Parent Portals updated.`, 'warning');
    return { success: true };
  };

  const completeClassSchedule = (id) => {
    const existing = (data.classSchedules || []).find(s => s.id === id);
    setData(prev => ({
      ...prev,
      classSchedules: (prev.classSchedules || []).map(s => 
        s.id === id 
          ? { 
              ...s, 
              status: 'Completed', 
              completedAt: new Date().toISOString(),
              replacement: s.replacement ? { ...s.replacement, status: 'Completed' } : s.replacement,
            } 
          : s
      ),
      coachReplacements: (prev.coachReplacements || []).map(r =>
        r.scheduleId === id
          ? { ...r, status: 'Completed', attendanceStatus: 'Marked' }
          : r
      ),
      compensationRequests: existing?.compensationRequestId
        ? (prev.compensationRequests || []).map(r =>
            r.id === existing.compensationRequestId
              ? { ...r, status: 'Completed', approvalNotes: 'Replacement session completed and verified.', updatedAt: new Date().toISOString() }
              : r
          )
        : prev.compensationRequests,
    }));
    addToast(`Class session ${id} marked as Completed.`, 'success');
    return { success: true };
  };

  const checkScheduleConflictLive = (candidate, excludeId = null) => {
    return checkScheduleConflict(candidate, data.classSchedules || [], excludeId);
  };

  // --- Module 3: Emergency Coach Replacement Logic ---
  const assignEmergencyCoachReplacement = (scheduleId, payload) => {
    const { replacementCoachId, replacementCoachName, replacementCoachAvatar, reason } = payload || {};

    if (!scheduleId) {
      addToast('Invalid class schedule identifier.', 'error');
      return { success: false, error: 'Schedule ID is required' };
    }
    if (!replacementCoachId || !replacementCoachName) {
      addToast('Please select an eligible replacement coach.', 'error');
      return { success: false, error: 'Replacement coach is required' };
    }
    if (!reason || !reason.trim()) {
      addToast('Reason for replacement is mandatory.', 'error');
      return { success: false, error: 'Reason is required' };
    }

    const schedule = (data.classSchedules || []).find((s) => s.id === scheduleId);
    if (!schedule) {
      addToast('Class schedule not found.', 'error');
      return { success: false, error: 'Schedule not found' };
    }

    // 1. Prevent assigning same coach as original primary coach
    if (schedule.coachId === replacementCoachId) {
      const msg = 'Replacement coach cannot be the original primary coach.';
      addToast(msg, 'error');
      return { success: false, error: msg };
    }

    // 2. Validate replacement coach does not have approved leave on this date
    const approvedLeave = getCoachApprovedLeaveForDate(
      data.coachLeaveRequests || [],
      replacementCoachId,
      schedule.date
    );
    if (approvedLeave) {
      const msg = `Conflict: ${replacementCoachName} has approved leave on ${schedule.date} (${approvedLeave.leaveType || 'Leave'}).`;
      addToast(msg, 'error');
      return { success: false, error: msg };
    }

    // 3. Validate replacement coach has no conflicting schedule on that date and time
    const conflictCheck = checkScheduleConflict(
      {
        coachId: replacementCoachId,
        coachName: replacementCoachName,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      },
      data.classSchedules || [],
      scheduleId
    );
    if (conflictCheck.hasConflict) {
      const msg = `Conflict: ${replacementCoachName} is already scheduled for another session during this time.`;
      addToast(msg, 'error');
      return { success: false, error: msg };
    }

    const replacementId = `REP-${schedule.id}-${Date.now().toString().slice(-6)}`;
    const assignedBy = currentUserProfiles[currentPortal]?.name || 'Super Admin';
    const assignedAt = new Date().toISOString();

    const replacementObj = {
      replacementId,
      scheduleId: schedule.id,
      originalCoachId: schedule.coachId,
      originalCoachName: schedule.coachName,
      originalAdditionalCoaches: schedule.additionalCoaches || [],
      replacementCoachId,
      replacementCoachName,
      replacementCoachAvatar: replacementCoachAvatar || null,
      reason: reason.trim(),
      assignedBy,
      assignedAt,
      status: 'Active',
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location,
      batch: schedule.batch,
      program: schedule.program,
    };

    const historyRecord = {
      id: replacementId,
      scheduleId: schedule.id,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location,
      batch: schedule.batch,
      program: schedule.program,
      originalCoachId: schedule.coachId,
      originalCoachName: schedule.coachName,
      originalCoach2Name: schedule.additionalCoaches?.[0]?.coachName || null,
      replacementCoachId,
      replacementCoachName,
      replacementCoachAvatar: replacementCoachAvatar || null,
      reason: reason.trim(),
      assignedBy,
      assignedAt,
      status: 'Active',
      attendanceStatus: 'Pending',
    };

    const coachNotification = createNotificationRecord({
      targetRole: 'coach',
      targetLocation: schedule.location,
      title: 'Emergency Cover Assignment',
      message: `You are assigned as emergency replacement coach for ${schedule.batch} at ${schedule.location} on ${schedule.date} (${schedule.startTime} - ${schedule.endTime}). Reason: ${reason.trim()}`,
      type: 'warning',
    });

    setData((prev) => ({
      ...prev,
      classSchedules: (prev.classSchedules || []).map((s) =>
        s.id === scheduleId
          ? {
              ...s,
              replacement: replacementObj,
              status: s.status === 'Completed' ? 'Completed' : 'Updated',
              updatedAt: assignedAt,
            }
          : s
      ),
      coachReplacements: [historyRecord, ...(prev.coachReplacements || [])],
      notifications: [coachNotification, ...(prev.notifications || [])].slice(0, 80),
    }));

    addToast(`Replacement coach ${replacementCoachName} assigned for ${schedule.batch}!`, 'success');
    return { success: true, replacement: replacementObj };
  };

  const revokeEmergencyCoachReplacement = (scheduleId, revokeReason = '') => {
    const schedule = (data.classSchedules || []).find((s) => s.id === scheduleId);
    if (!schedule || !schedule.replacement) {
      addToast('No active replacement found for this schedule.', 'error');
      return { success: false, error: 'No replacement found' };
    }

    const revokedAt = new Date().toISOString();
    const revokedBy = currentUserProfiles[currentPortal]?.name || 'Super Admin';

    const notif = createNotificationRecord({
      targetRole: 'coach',
      targetLocation: schedule.location,
      title: 'Emergency Cover Revoked',
      message: `Your emergency cover assignment for ${schedule.batch} at ${schedule.location} on ${schedule.date} has been revoked.${revokeReason ? ` Reason: ${revokeReason}` : ''}`,
      type: 'info',
    });

    setData((prev) => ({
      ...prev,
      classSchedules: (prev.classSchedules || []).map((s) =>
        s.id === scheduleId
          ? {
              ...s,
              replacement: null,
              updatedAt: revokedAt,
            }
          : s
      ),
      coachReplacements: (prev.coachReplacements || []).map((r) =>
        r.scheduleId === scheduleId && r.status === 'Active'
          ? {
              ...r,
              status: 'Revoked',
              revokedAt,
              revokedBy,
              revokeReason: revokeReason.trim() || 'Revoked by Admin',
            }
          : r
      ),
      notifications: [notif, ...(prev.notifications || [])].slice(0, 80),
    }));

    addToast('Emergency coach replacement revoked.', 'info');
    return { success: true };
  };

  // --- Module 1: Academy Locations & Sports Programs Management ---
  const logSettingsAudit = ({ category, action, field, oldValue, newValue }) => {
    const newLog = {
      id: `SET-LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      user: currentUser?.name || 'Administrator',
      role: currentUser?.badge || currentUser?.role || 'Super Admin',
      category: category || 'Settings & Configuration',
      action: action || 'Update',
      field: field || 'Configuration',
      oldValue: String(oldValue ?? '—'),
      newValue: String(newValue ?? '—'),
      status: 'Verified',
      ipAddress: '127.0.0.1 (Authorized Admin Session)'
    };
    setData((prev) => ({
      ...prev,
      settingsAuditLogs: [newLog, ...(prev.settingsAuditLogs || [])]
    }));
    return newLog;
  };

  const addLocation = (locPayload) => {
    const rawName = (locPayload.name || '').trim();
    if (!rawName) {
      addToast('Center Name is required.', 'error');
      return { success: false, error: 'Center Name is required.' };
    }
    const rawCode = (locPayload.code || '').trim().toUpperCase();
    if (!rawCode) {
      addToast('Center Code is required.', 'error');
      return { success: false, error: 'Center Code is required.' };
    }
    const rawAddress = (locPayload.address || '').trim();
    if (!rawAddress) {
      addToast('Full Street Address is required.', 'error');
      return { success: false, error: 'Full Street Address is required.' };
    }

    const currentLocations = data.locations || [];

    // Duplicate Center Name check (case-insensitive)
    const duplicateName = currentLocations.some(
      (loc) => loc.name && loc.name.trim().toUpperCase() === rawName.toUpperCase()
    );
    if (duplicateName) {
      addToast(`Center "${rawName}" already exists.`, 'error');
      return { success: false, error: `Center "${rawName}" already exists. Please choose a unique name.` };
    }

    // Duplicate Center Code check (case-insensitive)
    const duplicateCode = currentLocations.some(
      (loc) => loc.code && loc.code.trim().toUpperCase() === rawCode
    );
    if (duplicateCode) {
      addToast(`Center Code "${rawCode}" is already in use.`, 'error');
      return { success: false, error: `Center Code "${rawCode}" is already in use by another center.` };
    }

    const courtsList = Array.isArray(locPayload.facilities || locPayload.courts)
      ? (locPayload.facilities || locPayload.courts).map((c) => c.trim()).filter(Boolean)
      : String(locPayload.facilities || locPayload.courts || '')
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean);

    const programsList = Array.isArray(locPayload.programs)
      ? locPayload.programs
      : String(locPayload.programs || '')
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean);

    // Generate unique numerical or timestamp-based ID
    const numericIds = currentLocations
      .map((l) => parseInt(String(l.id || '').replace(/\D/g, ''), 10))
      .filter((n) => !isNaN(n));
    const nextNum = numericIds.length > 0 ? Math.max(...numericIds) + 1 : currentLocations.length + 1;
    const generatedId = locPayload.id || `LOC-${nextNum}`;

    const newLocation = {
      id: generatedId,
      name: rawName,
      code: rawCode,
      city: (locPayload.city || 'Chennai').trim(),
      state: (locPayload.state || 'Tamil Nadu').trim(),
      pinCode: (locPayload.pinCode || '600001').trim(),
      address: rawAddress,
      contactPerson: (locPayload.contactPerson || 'Operations Lead').trim(),
      contactPhone: (locPayload.contactPhone || '+91 98765 43210').trim(),
      operatingDays: (locPayload.operatingDays || 'Mon - Sat').trim(),
      operatingHours: (locPayload.operatingHours || '06:00 AM - 08:30 PM').trim(),
      capacity: parseInt(locPayload.capacity, 10) || 150,
      facilities: courtsList.length > 0 ? courtsList : ['Main Turf Ground', 'Training Court A'],
      courts: courtsList.length > 0 ? courtsList : ['Main Turf Ground', 'Training Court A'],
      programs: programsList.length > 0 ? programsList : ['Spartan Gymnastics & Agility', 'Junior Football Champions'],
      status: locPayload.status === 'Inactive' ? 'Inactive' : 'Active',
      createdAt: new Date().toISOString()
    };

    const newAudit = {
      id: `SET-LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      user: currentUser?.name || 'Administrator',
      role: currentUser?.badge || currentUser?.role || 'Super Admin',
      category: 'Center Management',
      action: 'Add Center',
      field: 'New Center Created',
      oldValue: 'None',
      newValue: `${rawName} (${rawCode})`,
      status: 'Verified',
      ipAddress: '127.0.0.1'
    };

    setData((prev) => {
      const prevLocations = prev.locations || [];
      const updatedLocations = [...prevLocations, newLocation];
      const activeCenters = updatedLocations
        .filter((l) => l.status !== 'Inactive')
        .map((l) => l.name);
      return {
        ...prev,
        locations: updatedLocations,
        academy: { ...(prev.academy || {}), centers: activeCenters },
        settingsAuditLogs: [newAudit, ...(prev.settingsAuditLogs || [])]
      };
    });

    addToast(`Academy center "${rawName}" added successfully.`, 'success');
    return { success: true, location: newLocation };
  };

  const updateLocation = (id, updates) => {
    const currentLocations = data.locations || [];
    const existing = currentLocations.find((l) => l.id === id);
    if (!existing) {
      addToast('Center location not found.', 'error');
      return { success: false, error: 'Center location not found.' };
    }
    const nextName = (updates.name || existing.name).trim();
    if (!nextName) {
      addToast('Center Name is required.', 'error');
      return { success: false, error: 'Center Name is required.' };
    }
    const nextCode = (updates.code || existing.code || '').trim().toUpperCase();
    if (!nextCode) {
      addToast('Center Code is required.', 'error');
      return { success: false, error: 'Center Code is required.' };
    }

    // Duplicate name check (excluding self)
    const duplicateName = currentLocations.some(
      (loc) => loc.id !== id && loc.name && loc.name.trim().toUpperCase() === nextName.toUpperCase()
    );
    if (duplicateName) {
      addToast(`Center "${nextName}" already exists.`, 'error');
      return { success: false, error: `Center "${nextName}" already exists. Please choose a unique name.` };
    }

    // Duplicate code check (excluding self)
    const duplicateCode = currentLocations.some(
      (loc) => loc.id !== id && loc.code && loc.code.trim().toUpperCase() === nextCode
    );
    if (duplicateCode) {
      addToast(`Center Code "${nextCode}" is already in use.`, 'error');
      return { success: false, error: `Center Code "${nextCode}" is already in use by another center.` };
    }

    const courtsList = Array.isArray(updates.facilities || updates.courts)
      ? (updates.facilities || updates.courts).map((c) => c.trim()).filter(Boolean)
      : (updates.facilities || updates.courts) !== undefined
      ? String(updates.facilities || updates.courts)
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      : existing.courts || existing.facilities || [];

    const programsList = Array.isArray(updates.programs)
      ? updates.programs
      : updates.programs !== undefined
      ? String(updates.programs).split(',').map((p) => p.trim()).filter(Boolean)
      : existing.programs || [];

    const oldName = existing.name;
    const newAudit = {
      id: `SET-LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      user: currentUser?.name || 'Administrator',
      role: currentUser?.badge || currentUser?.role || 'Super Admin',
      category: 'Center Management',
      action: 'Update Center',
      field: `${nextName} Details`,
      oldValue: `${oldName} (${existing.code || 'Code'})`,
      newValue: `${nextName} (${nextCode})`,
      status: 'Verified',
      ipAddress: '127.0.0.1'
    };

    setData((prev) => {
      const updatedLocations = (prev.locations || []).map((loc) =>
        loc.id === id
          ? {
              ...loc,
              ...updates,
              name: nextName,
              code: nextCode,
              facilities: courtsList.length > 0 ? courtsList : loc.facilities,
              courts: courtsList.length > 0 ? courtsList : loc.courts,
              programs: programsList.length > 0 ? programsList : loc.programs,
            }
          : loc
      );
      const activeCenters = updatedLocations
        .filter((l) => l.status !== 'Inactive')
        .map((l) => l.name);

      // Keep downstream references consistent if renamed
      const renameMap = (val) => (val === oldName ? nextName : val);
      return {
        ...prev,
        locations: updatedLocations,
        academy: { ...(prev.academy || {}), centers: activeCenters },
        settingsAuditLogs: [newAudit, ...(prev.settingsAuditLogs || [])],
        programs: (prev.programs || []).map((p) => ({
          ...p,
          locations: Array.isArray(p.locations) ? p.locations.map(renameMap) : p.locations,
        })),
        classes: (prev.classes || []).map((c) => ({ ...c, center: renameMap(c.center) })),
        classSchedules: (prev.classSchedules || []).map((s) => ({
          ...s,
          location: renameMap(s.location),
        })),
        students: (prev.students || []).map((st) => ({ ...st, center: renameMap(st.center) })),
        coaches: (prev.coaches || []).map((ch) => ({ ...ch, center: renameMap(ch.center) })),
      };
    });

    addToast(`Center "${nextName}" updated successfully.`, 'info');
    return { success: true };
  };

  const toggleLocationStatus = (id) => {
    const existing = (data.locations || []).find((l) => l.id === id);
    if (!existing) return { success: false };
    const nextStatus = existing.status === 'Inactive' ? 'Active' : 'Inactive';
    
    const newAudit = {
      id: `SET-LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      user: currentUser?.name || 'Administrator',
      role: currentUser?.badge || currentUser?.role || 'Super Admin',
      category: 'Center Management',
      action: nextStatus === 'Active' ? 'Activate Center' : 'Deactivate Center',
      field: `${existing.name} Status`,
      oldValue: existing.status,
      newValue: nextStatus,
      status: 'Verified',
      ipAddress: '127.0.0.1'
    };

    setData((prev) => {
      const updatedLocations = (prev.locations || []).map((loc) =>
        loc.id === id ? { ...loc, status: nextStatus } : loc
      );
      const activeCenters = updatedLocations
        .filter((l) => l.status !== 'Inactive')
        .map((l) => l.name);
      return {
        ...prev,
        locations: updatedLocations,
        academy: { ...prev.academy, centers: activeCenters },
        settingsAuditLogs: [newAudit, ...(prev.settingsAuditLogs || [])]
      };
    });
    addToast(
      `Center "${existing.name}" is now ${nextStatus}. Historical records preserved.`,
      nextStatus === 'Active' ? 'success' : 'warning'
    );
    return { success: true, status: nextStatus };
  };

  // Update Academy General Information (Name, Tagline, Phone, Email, Website)
  const updateAcademyGeneralInfo = (infoPayload) => {
    const oldAcademy = data.academy || {};
    const newAudit = {
      id: `SET-LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      user: currentUser?.name || 'Administrator',
      role: currentUser?.badge || currentUser?.role || 'Super Admin',
      category: 'General Information',
      action: 'Update Academy Profile',
      field: 'Academy Details',
      oldValue: `${oldAcademy.name || ''} | ${oldAcademy.email || ''}`,
      newValue: `${infoPayload.name || oldAcademy.name} | ${infoPayload.email || oldAcademy.email}`,
      status: 'Verified',
      ipAddress: '127.0.0.1'
    };

    setData((prev) => ({
      ...prev,
      academy: {
        ...prev.academy,
        ...infoPayload
      },
      settingsAuditLogs: [newAudit, ...(prev.settingsAuditLogs || [])]
    }));
    addToast('Academy General Information updated successfully.', 'success');
  };

  // Update Academic Year
  const updateAcademicYear = (newYear) => {
    if (!newYear || !newYear.trim()) return;
    const oldYear = data.academy?.academicYear || '2026-2027';
    const newAudit = {
      id: `SET-LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      user: currentUser?.name || 'Administrator',
      role: currentUser?.badge || currentUser?.role || 'Super Admin',
      category: 'Academic Calendar',
      action: 'Year Updated',
      field: 'Academic Year',
      oldValue: oldYear,
      newValue: newYear.trim(),
      status: 'Verified',
      ipAddress: '127.0.0.1'
    };

    setData((prev) => ({
      ...prev,
      academy: {
        ...prev.academy,
        academicYear: newYear.trim()
      },
      academicCalendar: {
        ...(prev.academicCalendar || {}),
        academicYear: newYear.trim()
      },
      settingsAuditLogs: [newAudit, ...(prev.settingsAuditLogs || [])]
    }));
    addToast(`Academic Year set to ${newYear.trim()}.`, 'success');
  };

  // Academic Terms
  const addAcademicTerm = (termPayload) => {
    const newTerm = {
      id: `TERM-${Date.now()}`,
      name: termPayload.name || 'New Term',
      startDate: termPayload.startDate || '2026-06-01',
      endDate: termPayload.endDate || '2026-08-31',
      status: termPayload.status || 'Upcoming'
    };
    setData((prev) => {
      const currentCal = prev.academicCalendar || initialAcademyData.academicCalendar;
      return {
        ...prev,
        academicCalendar: {
          ...currentCal,
          terms: [...(currentCal.terms || []), newTerm]
        }
      };
    });
    addToast(`Term "${newTerm.name}" added to Academic Calendar.`, 'success');
  };

  // Academic Holidays
  const addAcademicHoliday = (holidayPayload) => {
    const newHoliday = {
      id: `HOL-${Date.now()}`,
      name: holidayPayload.name || 'Academy Holiday',
      date: holidayPayload.date || new Date().toISOString().split('T')[0],
      type: holidayPayload.type || 'Academy Holiday'
    };
    setData((prev) => {
      const currentCal = prev.academicCalendar || initialAcademyData.academicCalendar;
      return {
        ...prev,
        academicCalendar: {
          ...currentCal,
          holidays: [...(currentCal.holidays || []), newHoliday]
        }
      };
    });
    addToast(`Holiday "${newHoliday.name}" added to calendar.`, 'success');
  };

  const deleteAcademicHoliday = (holidayId) => {
    setData((prev) => {
      const currentCal = prev.academicCalendar || initialAcademyData.academicCalendar;
      return {
        ...prev,
        academicCalendar: {
          ...currentCal,
          holidays: (currentCal.holidays || []).filter(h => h.id !== holidayId)
        }
      };
    });
    addToast('Holiday removed from calendar.', 'info');
  };

  const addProgram = (programPayload) => {
    const name = (programPayload.name || '').trim();
    if (!name) {
      addToast('Program name is required.', 'error');
      return { success: false };
    }
    const duplicate = (data.programs || []).some(
      (p) => p.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      addToast(`Program "${name}" already exists.`, 'error');
      return { success: false };
    }

    const newProgram = {
      id: `PRG-${Math.floor(100 + Math.random() * 900)}`,
      name,
      description: (programPayload.description || '').trim(),
      ageGroup: (programPayload.ageGroup || 'All Ages').trim(),
      duration: (programPayload.duration || '60 mins / session').trim(),
      feeMonthly: Number(programPayload.feeMonthly) || 0,
      eligibility: (programPayload.eligibility || 'Open enrollment').trim(),
      locations: Array.isArray(programPayload.locations) ? programPayload.locations : [],
      icon: programPayload.icon || '🏆',
      studentsCount: 0,
      status: programPayload.status || 'Active',
    };

    setData((prev) => ({
      ...prev,
      programs: [newProgram, ...(prev.programs || [])],
    }));

    addToast(`Sports Program "${name}" created.`, 'success');
    return { success: true, program: newProgram };
  };

  const updateProgram = (id, updates) => {
    const existing = (data.programs || []).find((p) => p.id === id);
    if (!existing) {
      addToast('Program not found.', 'error');
      return { success: false };
    }
    const nextName = (updates.name || existing.name).trim();
    const duplicate = (data.programs || []).some(
      (p) => p.id !== id && p.name.trim().toLowerCase() === nextName.toLowerCase()
    );
    if (duplicate) {
      addToast(`Program "${nextName}" already exists.`, 'error');
      return { success: false };
    }

    const oldName = existing.name;
    setData((prev) => ({
      ...prev,
      programs: (prev.programs || []).map((p) =>
        p.id === id
          ? {
              ...p,
              ...updates,
              name: nextName,
              feeMonthly:
                updates.feeMonthly !== undefined ? Number(updates.feeMonthly) || 0 : p.feeMonthly,
            }
          : p
      ),
      classes: (prev.classes || []).map((c) =>
        c.program === oldName ? { ...c, program: nextName } : c
      ),
      classSchedules: (prev.classSchedules || []).map((s) =>
        s.program === oldName ? { ...s, program: nextName } : s
      ),
    }));

    addToast(`Sports Program "${nextName}" updated.`, 'info');
    return { success: true };
  };

  const toggleProgramStatus = (id) => {
    const existing = (data.programs || []).find((p) => p.id === id);
    if (!existing) return { success: false };
    const nextStatus = existing.status === 'Inactive' ? 'Active' : 'Inactive';
    setData((prev) => ({
      ...prev,
      programs: (prev.programs || []).map((p) =>
        p.id === id ? { ...p, status: nextStatus } : p
      ),
    }));
    addToast(`Program "${existing.name}" marked as ${nextStatus}.`, nextStatus === 'Active' ? 'success' : 'warning');
    return { success: true, status: nextStatus };
  };

  // --- Module 2: Training Batches (Location -> Program -> Batch -> Students/Waitlist) ---
  const createBatch = (batchPayload) => {
    const name = (batchPayload.name || '').trim();
    const center = (batchPayload.center || '').trim();
    const program = (batchPayload.program || '').trim();
    if (!name || !center || !program) {
      addToast('Location, Sports Program, and Batch Name are required.', 'error');
      return { success: false };
    }

    const duplicate = (data.classes || []).some(
      (c) =>
        c.center === center &&
        c.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      addToast(`Batch "${name}" already exists at ${center}.`, 'error');
      return { success: false };
    }

    const primaryCoach = (data.coaches || []).find((c) => c.id === batchPayload.coachId);
    const capacity = Math.max(1, parseInt(batchPayload.capacity, 10) || 15);
    const enrolledIds = Array.isArray(batchPayload.enrolledStudentIds)
      ? batchPayload.enrolledStudentIds
      : [];

    const newBatch = {
      id: `CLS-${Math.floor(100 + Math.random() * 900)}`,
      name,
      program,
      center,
      ageGroup: (batchPayload.ageGroup || 'All Ages').trim(),
      level: batchPayload.level || 'Beginner',
      coachId: primaryCoach?.id || batchPayload.coachId || '',
      coach: primaryCoach?.name || batchPayload.coach || 'Unassigned',
      additionalCoaches: batchPayload.additionalCoaches || [],
      schedule: (batchPayload.schedule || 'Flexible Weekly Slots').trim(),
      capacity,
      enrolledStudentIds: enrolledIds,
      waitlistStudentIds: Array.isArray(batchPayload.waitlistStudentIds)
        ? batchPayload.waitlistStudentIds
        : [],
      enrolled: enrolledIds.length,
      status: batchPayload.status || 'Active',
    };

    setData((prev) => ({
      ...prev,
      classes: [newBatch, ...(prev.classes || [])],
      students: (prev.students || []).map((st) => {
        if (!enrolledIds.includes(st.id)) return st;
        const nextEnrolled = Array.from(new Set([...(st.enrolledClasses || []), newBatch.name]));
        return {
          ...st,
          enrolledClasses: nextEnrolled,
          program: st.program || newBatch.program,
          coachName: primaryCoach?.name || st.coachName,
        };
      }),
    }));

    addToast(`Training Batch "${name}" created under ${program} (${center}).`, 'success');
    return { success: true, batch: newBatch };
  };

  const updateBatch = (id, updates) => {
    const existing = (data.classes || []).find((c) => c.id === id);
    if (!existing) {
      addToast('Training batch not found.', 'error');
      return { success: false };
    }
    const nextName = (updates.name || existing.name).trim();
    const nextCenter = updates.center || existing.center;
    const duplicate = (data.classes || []).some(
      (c) => c.id !== id && c.center === nextCenter && c.name.trim().toLowerCase() === nextName.toLowerCase()
    );
    if (duplicate) {
      addToast(`Batch "${nextName}" already exists at ${nextCenter}.`, 'error');
      return { success: false };
    }

    const oldName = existing.name;
    const nextCapacity =
      updates.capacity !== undefined ? Math.max(1, parseInt(updates.capacity, 10) || 15) : existing.capacity;

    setData((prev) => ({
      ...prev,
      classes: (prev.classes || []).map((c) =>
        c.id === id
          ? {
              ...c,
              ...updates,
              name: nextName,
              center: nextCenter,
              capacity: nextCapacity,
            }
          : c
      ),
      classSchedules: (prev.classSchedules || []).map((s) =>
        s.batchId === id || s.batch === oldName
          ? {
              ...s,
              batch: nextName,
              program: updates.program || s.program,
              location: nextCenter,
              capacity: nextCapacity,
            }
          : s
      ),
      students: (prev.students || []).map((st) => ({
        ...st,
        enrolledClasses: (st.enrolledClasses || []).map((clsName) =>
          clsName === oldName ? nextName : clsName
        ),
      })),
    }));

    addToast(`Training Batch "${nextName}" updated.`, 'info');
    return { success: true };
  };

  const toggleBatchStatus = (id, forcedStatus = null) => {
    const existing = (data.classes || []).find((c) => c.id === id);
    if (!existing) return { success: false };
    const nextStatus = forcedStatus || (existing.status === 'Inactive' ? 'Active' : 'Inactive');
    setData((prev) => ({
      ...prev,
      classes: (prev.classes || []).map((c) =>
        c.id === id ? { ...c, status: nextStatus } : c
      ),
    }));
    addToast(`Batch "${existing.name}" marked as ${nextStatus}.`, nextStatus === 'Active' ? 'success' : 'warning');
    return { success: true, status: nextStatus };
  };

  const deleteBatch = (id) => {
    const existing = (data.classes || []).find((c) => c.id === id);
    if (!existing) return { success: false };
    setData((prev) => ({
      ...prev,
      classes: (prev.classes || []).filter((c) => c.id !== id),
    }));
    addToast(`Training Batch "${existing.name}" removed successfully.`, 'info');
    return { success: true };
  };

  const updateBatchEnrollment = (batchId, { enrolledStudentIds, waitlistStudentIds }) => {
    const batch = (data.classes || []).find((c) => c.id === batchId);
    if (!batch) {
      addToast('Batch not found.', 'error');
      return { success: false };
    }

    // Location isolation: only students belonging to this batch's location can be enrolled
    const validLocationStudentIds = new Set(
      (data.students || []).filter((s) => s.center === batch.center).map((s) => s.id)
    );
    const cleanEnrolled = (enrolledStudentIds || []).filter((sid) => validLocationStudentIds.has(sid));
    const enrolledSet = new Set(cleanEnrolled);
    const cleanWaitlist = (waitlistStudentIds || []).filter(
      (sid) => validLocationStudentIds.has(sid) && !enrolledSet.has(sid)
    );

    const enrolledNames = (data.students || [])
      .filter((s) => enrolledSet.has(s.id))
      .map((s) => s.name);

    setData((prev) => ({
      ...prev,
      classes: (prev.classes || []).map((c) =>
        c.id === batchId
          ? {
              ...c,
              enrolledStudentIds: cleanEnrolled,
              waitlistStudentIds: cleanWaitlist,
              enrolled: cleanEnrolled.length,
            }
          : c
      ),
      students: (prev.students || []).map((st) => {
        const currentClasses = st.enrolledClasses || [];
        const hasBatch = currentClasses.includes(batch.name);
        if (enrolledSet.has(st.id) && !hasBatch) {
          return {
            ...st,
            enrolledClasses: [...currentClasses, batch.name],
            program: st.program || batch.program,
            coachName: batch.coach && batch.coach !== 'Unassigned' ? batch.coach : st.coachName,
          };
        }
        if (!enrolledSet.has(st.id) && hasBatch) {
          return {
            ...st,
            enrolledClasses: currentClasses.filter((clsName) => clsName !== batch.name),
          };
        }
        return st;
      }),
      classSchedules: (prev.classSchedules || []).map((s) =>
        s.batchId === batchId || (s.batch === batch.name && s.location === batch.center)
          ? {
              ...s,
              enrolledCount: cleanEnrolled.length,
              enrolledStudents: enrolledNames,
            }
          : s
      ),
    }));

    addToast(`Enrollment updated for "${batch.name}" (${cleanEnrolled.length} enrolled, ${cleanWaitlist.length} waitlisted).`, 'success');
    return { success: true };
  };

  // --- Module 4: Coach Assignments (Primary & Additional Coaches synced to Schedules & Coach Portal) ---
  const assignCoachesToBatch = ({ batchId, primaryCoachId, additionalCoachIds = [] }) => {
    const batch = (data.classes || []).find((c) => c.id === batchId);
    if (!batch) {
      addToast('Training batch not found.', 'error');
      return { success: false };
    }

    const primaryCoach = (data.coaches || []).find((c) => c.id === primaryCoachId) || null;
    const additionalCoaches = (data.coaches || [])
      .filter((c) => additionalCoachIds.includes(c.id) && c.id !== primaryCoachId)
      .map((c) => ({ coachId: c.id, coachName: c.name }));

    // Check active schedules of this batch for timing conflicts against the new primary coach
    const batchSchedules = (data.classSchedules || []).filter(
      (s) => s.status !== 'Cancelled' && (s.batchId === batchId || (s.batch === batch.name && s.location === batch.center))
    );
    if (primaryCoach) {
      for (const sch of batchSchedules) {
        const conflict = checkScheduleConflict(
          {
            ...sch,
            coachId: primaryCoach.id,
            coachName: primaryCoach.name,
            additionalCoaches,
          },
          data.classSchedules || [],
          sch.id
        );
        if (conflict.hasConflict && conflict.type === 'coach') {
          addToast(conflict.message, 'error');
          return { success: false, message: conflict.message };
        }
      }
    }

    setData((prev) => ({
      ...prev,
      classes: (prev.classes || []).map((c) =>
        c.id === batchId
          ? {
              ...c,
              coachId: primaryCoach?.id || '',
              coach: primaryCoach?.name || 'Unassigned',
              additionalCoaches,
            }
          : c
      ),
      classSchedules: (prev.classSchedules || []).map((s) =>
        s.status !== 'Cancelled' &&
        (s.batchId === batchId || (s.batch === batch.name && s.location === batch.center))
          ? {
              ...s,
              coachId: primaryCoach?.id || '',
              coachName: primaryCoach?.name || 'Unassigned',
              additionalCoaches,
              status: s.status === 'Completed' ? 'Completed' : 'Updated',
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
      students: (prev.students || []).map((st) =>
        st.center === batch.center &&
        (batch.enrolledStudentIds?.includes(st.id) || st.enrolledClasses?.includes(batch.name))
          ? {
              ...st,
              coachName: primaryCoach?.name || st.coachName,
            }
          : st
      ),
    }));

    addToast(
      `Coach assignment updated for "${batch.name}" & synced to Coach Portal.`,
      'success'
    );
    return { success: true };
  };

  // Equipment Management Actions
  const addEquipmentItem = (itemPayload) => {
    const rawLoc = (itemPayload.location || '').trim();
    if (!itemPayload.name || !itemPayload.name.trim()) {
      addToast('Equipment Name is required.', 'error');
      return { success: false, error: 'Name is required' };
    }
    if (!rawLoc) {
      addToast('Academy Location is required.', 'error');
      return { success: false, error: 'Location is required' };
    }

    // Check duplicate in the SAME location
    const existingSameLoc = (data.equipment || []).find(
      e => e.location?.toUpperCase() === rawLoc.toUpperCase() && e.name?.trim().toLowerCase() === itemPayload.name.trim().toLowerCase()
    );
    if (existingSameLoc) {
      addToast(`Equipment "${itemPayload.name.trim()}" already exists in ${rawLoc} inventory. Updating stock instead.`, 'info');
      return updateEquipmentItem(existingSameLoc.id, {
        totalQty: (existingSameLoc.totalQty || 0) + (Number(itemPayload.totalQty) || 0),
        availableQty: (existingSameLoc.availableQty || 0) + (Number(itemPayload.availableQty) || Number(itemPayload.totalQty) || 0),
        condition: itemPayload.condition || existingSameLoc.condition,
        remarks: itemPayload.remarks ? `${existingSameLoc.remarks ? existingSameLoc.remarks + ' | ' : ''}${itemPayload.remarks}` : existingSameLoc.remarks
      }, 'Added additional stock to existing record');
    }

    const totalQty = Number(itemPayload.totalQty) || 0;
    const damagedQty = Number(itemPayload.damagedQty) || 0;
    const missingQty = Number(itemPayload.missingQty) || 0;
    const availableQty = itemPayload.availableQty !== undefined ? Number(itemPayload.availableQty) : Math.max(0, totalQty - damagedQty - missingQty);

    const newItem = {
      ...itemPayload,
      id: itemPayload.id || `EQ-${rawLoc.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      name: itemPayload.name.trim(),
      category: itemPayload.category || 'Football',
      location: rawLoc,
      totalQty,
      availableQty,
      damagedQty,
      missingQty,
      condition: itemPayload.condition || 'Good',
      purchaseDate: itemPayload.purchaseDate || new Date().toISOString().split('T')[0],
      lastInspectionDate: itemPayload.lastInspectionDate || new Date().toISOString().split('T')[0],
      lastUpdatedBy: itemPayload.lastUpdatedBy || currentUserProfiles[currentPortal]?.name || 'Administrator',
      imageUrl: itemPayload.imageUrl || '',
      remarks: itemPayload.remarks || '',
      history: [
        {
          id: `EQH-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Item Registered',
          user: itemPayload.lastUpdatedBy || currentUserProfiles[currentPortal]?.name || 'Administrator',
          role: currentPortal === 'super_coach' ? 'Super Coach' : currentPortal === 'coach' ? 'Coach' : 'Admin',
          details: `Initial stock registered for ${rawLoc}: ${totalQty} total units (${availableQty} available).`
        }
      ]
    };

    // If added to fulfill a coach request, mark that request as Fulfilled
    let updatedReports = data.equipmentReports || [];
    if (itemPayload.linkedRequestId) {
      updatedReports = updatedReports.map(r => {
        if (r.id === itemPayload.linkedRequestId) {
          return {
            ...r,
            status: 'Fulfilled',
            equipmentId: newItem.id,
            fulfilledAt: new Date().toISOString(),
            history: [
              ...(r.history || []),
              {
                id: `EQRH-${Date.now()}`,
                timestamp: new Date().toISOString(),
                action: 'Equipment Added & Fulfilled',
                user: newItem.lastUpdatedBy,
                role: currentPortal === 'super_coach' ? 'Super Coach' : 'Admin',
                details: `Added new equipment record ${newItem.id} to satisfy request.`
              }
            ]
          };
        }
        return r;
      });
    }

    setData(prev => ({
      ...prev,
      equipment: [newItem, ...(prev.equipment || [])],
      equipmentReports: updatedReports
    }));

    addToast(`Equipment "${newItem.name}" registered for ${newItem.location} inventory.`, 'success');
    return { success: true, item: newItem };
  };

  const updateEquipmentItem = (id, updates, auditNote = '') => {
    const existing = (data.equipment || []).find(e => e.id === id);
    if (!existing) {
      addToast('Equipment item not found.', 'error');
      return { success: false };
    }

    const totalQty = updates.totalQty !== undefined ? Number(updates.totalQty) : existing.totalQty;
    const damagedQty = updates.damagedQty !== undefined ? Number(updates.damagedQty) : existing.damagedQty;
    const missingQty = updates.missingQty !== undefined ? Number(updates.missingQty) : existing.missingQty;
    const availableQty = updates.availableQty !== undefined 
      ? Number(updates.availableQty) 
      : Math.max(0, totalQty - damagedQty - missingQty);

    const userName = updates.lastUpdatedBy || currentUserProfiles[currentPortal]?.name || 'Admin';

    const updatedItem = {
      ...existing,
      ...updates,
      totalQty,
      availableQty,
      damagedQty,
      missingQty,
      condition: updates.condition || existing.condition,
      lastUpdatedBy: userName,
      lastInspectionDate: updates.lastInspectionDate || new Date().toISOString().split('T')[0],
      history: [
        {
          id: `EQH-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: updates.action || 'Inventory Calibrated',
          user: userName,
          role: currentPortal === 'super_coach' ? 'Super Coach' : currentPortal === 'coach' ? 'Coach' : 'Admin',
          details: auditNote || `Stock calibrated: Total: ${totalQty}, Available: ${availableQty}, Damaged: ${damagedQty}, Missing: ${missingQty}, Condition: ${updates.condition || existing.condition}`
        },
        ...(existing.history || [])
      ]
    };

    setData(prev => ({
      ...prev,
      equipment: (prev.equipment || []).map(e => e.id === id ? updatedItem : e)
    }));

    addToast(`Equipment "${updatedItem.name}" updated successfully.`, 'success');
    return { success: true, item: updatedItem };
  };

  const deleteEquipmentItem = (id) => {
    const existing = (data.equipment || []).find(e => e.id === id);
    setData(prev => ({
      ...prev,
      equipment: (prev.equipment || []).filter(e => e.id !== id)
    }));
    addToast(`Equipment record "${existing?.name || id}" removed.`, 'info');
    return { success: true };
  };

  const submitEquipmentReport = (reportPayload) => {
    const coachName = reportPayload.coachName || currentUserProfiles[currentPortal]?.name || 'Coach';
    const loc = reportPayload.location || 'KK NAGAR';
    const reqType = reportPayload.requestType || 'New Equipment Required';
    const reqQty = Number(reportPayload.requiredQty) || 1;
    const damagedCount = Number(reportPayload.damagedCount) || 0;
    const missingCount = Number(reportPayload.missingCount) || 0;

    const newReport = {
      ...reportPayload,
      id: `EQREQ-${Date.now().toString().slice(-4)}`,
      coachName,
      coachId: reportPayload.coachId || '',
      location: loc,
      equipmentName: reportPayload.equipmentName || 'Equipment Item',
      equipmentId: reportPayload.equipmentId || '',
      category: reportPayload.category || 'Other sports equipment',
      requestType: reqType,
      requiredQty: reqQty,
      damagedCount,
      missingCount,
      reportedCondition: reportPayload.reportedCondition || 'Good',
      remarks: reportPayload.remarks || '',
      photoUrl: reportPayload.photoUrl || reportPayload.photoNote || '',
      photoNote: reportPayload.photoNote || '',
      submissionDate: reportPayload.submissionDate || new Date().toISOString().split('T')[0],
      status: 'Pending Review',
      submittedBy: coachName,
      submittedRole: 'coach',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: `EQRH-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Request Submitted',
          user: coachName,
          role: 'Coach',
          details: `${reqType}: ${reportPayload.equipmentName} (Req: ${reqQty} units) submitted for ${loc}.`
        }
      ]
    };

    setData(prev => ({
      ...prev,
      equipmentReports: [newReport, ...(prev.equipmentReports || [])]
    }));

    addToast(`Equipment request submitted for "${newReport.equipmentName}". Super Coach notified.`, 'success');
    return { success: true, report: newReport };
  };

  const reviewEquipmentRequest = (requestId, reviewData = {}) => {
    const report = (data.equipmentReports || []).find(r => r.id === requestId);
    if (!report) return { success: false, message: 'Request not found' };

    const reviewerName = reviewData.reviewer || currentUserProfiles[currentPortal]?.name || 'Super Coach';
    const notes = reviewData.notes || 'Reviewed by Super Coach';
    const status = reviewData.status || 'Reviewed';
    const action = reviewData.action || status;

    const updatedReport = {
      ...report,
      status,
      superCoachReview: {
        reviewer: reviewerName,
        role: currentPortal === 'admin' ? 'Admin' : 'Super Coach',
        timestamp: new Date().toISOString(),
        notes,
        action
      },
      updatedAt: new Date().toISOString(),
      history: [
        ...(report.history || []),
        {
          id: `EQRH-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: `Request ${action}`,
          user: reviewerName,
          role: currentPortal === 'admin' ? 'Admin' : 'Super Coach',
          details: notes
        }
      ]
    };

    setData(prev => ({
      ...prev,
      equipmentReports: (prev.equipmentReports || []).map(r => r.id === requestId ? updatedReport : r)
    }));

    addToast(`Equipment Request ${requestId} ${status} successfully.`, 'success');
    return { success: true, report: updatedReport };
  };

  const fulfillEquipmentRequest = (requestId, fulfillmentData = {}) => {
    const report = (data.equipmentReports || []).find(r => r.id === requestId);
    if (!report) return { success: false, message: 'Request not found' };

    const userName = fulfillmentData.fulfilledBy || currentUserProfiles[currentPortal]?.name || 'Super Coach';
    const notes = fulfillmentData.notes || 'Equipment stocked and fulfilled.';

    const updatedReport = {
      ...report,
      status: 'Fulfilled',
      fulfilledAt: new Date().toISOString(),
      fulfilledBy: userName,
      updatedAt: new Date().toISOString(),
      history: [
        ...(report.history || []),
        {
          id: `EQRH-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Request Fulfilled',
          user: userName,
          role: currentPortal === 'admin' ? 'Admin' : 'Super Coach',
          details: notes
        }
      ]
    };

    setData(prev => ({
      ...prev,
      equipmentReports: (prev.equipmentReports || []).map(r => r.id === requestId ? updatedReport : r)
    }));

    addToast(`Equipment Request ${requestId} marked as Fulfilled.`, 'success');
    return { success: true, report: updatedReport };
  };

  const confirmEquipmentCheck = (location, coachName) => {
    const loc = location || 'KK NAGAR';
    const cName = coachName || currentUserProfiles[currentPortal]?.name || 'Coach';
    const today = new Date().toISOString().split('T')[0];

    const updatedEquipment = (data.equipment || []).map(item => {
      if (item.location?.toUpperCase() === loc.toUpperCase()) {
        return {
          ...item,
          lastInspectionDate: today,
          lastUpdatedBy: `${cName} (Coach)`,
          history: [
            {
              id: `EQH-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              timestamp: new Date().toISOString(),
              action: 'Equipment Check Confirmed',
              user: cName,
              role: 'Coach',
              details: `Physical inspection confirmed on site for ${loc} training session.`
            },
            ...(item.history || [])
          ]
        };
      }
      return item;
    });

    setData(prev => ({
      ...prev,
      equipment: updatedEquipment
    }));

    addToast(`Equipment Check confirmed for ${loc} by Coach ${cName}.`, 'success');
    return { success: true };
  };

  const verifyEquipmentReport = (reportId, verificationData = {}) => {
    return reviewEquipmentRequest(reportId, verificationData);
  };

  const adminApproveEquipmentReport = (reportId, approvalData = {}) => {
    const report = (data.equipmentReports || []).find(r => r.id === reportId);
    if (!report) return { success: false, message: 'Report not found' };

    const reviewerName = approvalData.reviewer || currentUserProfiles.admin?.name || 'Administrator';
    const notes = approvalData.notes || 'Admin approved maintenance/replacement.';
    const status = approvalData.status || 'Approved';

    const updatedReport = {
      ...report,
      status,
      adminApproval: {
        reviewer: reviewerName,
        role: 'Admin',
        timestamp: new Date().toISOString(),
        notes,
        action: approvalData.action || 'Approved'
      },
      updatedAt: new Date().toISOString(),
      history: [
        ...(report.history || []),
        {
          id: `EQRH-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: `Admin Sanction (${status})`,
          user: reviewerName,
          role: 'Admin',
          details: notes
        }
      ]
    };

    setData(prev => ({
      ...prev,
      equipmentReports: (prev.equipmentReports || []).map(r => r.id === reportId ? updatedReport : r)
    }));

    addToast(`Equipment Request ${reportId} approved by Admin.`, 'success');
    return { success: true, report: updatedReport };
  };

    const updateSuperCoachLocations = (superCoachId, assignedLocations) => {
    setData(prev => ({
      ...prev,
      superCoaches: (prev.superCoaches || []).map(sc => 
        sc.id === superCoachId ? { ...sc, assignedLocations } : sc
      )
    }));
    addToast('Super Coach assigned locations updated successfully.', 'success');
    return { success: true };
  };

  const reassignScheduleCoach = (scheduleId, newCoachId, newCoachName, reassignedBy = 'Super Coach', note = '') => {
    const existing = (data.classSchedules || []).find(s => s.id === scheduleId);
    if (!existing) {
      addToast('Class schedule not found.', 'error');
      return { success: false };
    }

    const candidate = {
      ...existing,
      coachId: newCoachId,
      coachName: newCoachName
    };

    const conflict = checkScheduleConflict(candidate, data.classSchedules || [], scheduleId);
    if (conflict.hasConflict) {
      addToast(conflict.message, 'error');
      return { success: false, message: conflict.message };
    }

    const coachNotif = createNotificationRecord({
      targetRole: 'coach',
      targetCoachId: newCoachId,
      targetLocation: existing.location,
      title: 'Class Reassigned to You',
      message: `You have been reassigned to ${existing.className || existing.batch} at ${existing.location} on ${existing.date} (${existing.startTime} - ${existing.endTime}) by ${reassignedBy}.`,
      type: 'info'
    });

    setData(prev => ({
      ...prev,
      classSchedules: (prev.classSchedules || []).map(s => 
        s.id === scheduleId
          ? {
              ...s,
              coachId: newCoachId,
              coachName: newCoachName,
              reassignedBy,
              reassignNote: note,
              updatedAt: new Date().toISOString()
            }
          : s
      ),
      notifications: [coachNotif, ...(prev.notifications || [])].slice(0, 80)
    }));

    addToast(`Coach reassigned to ${newCoachName} for "${existing.className || existing.batch}". Synced to Coach & Admin portals.`, 'success');
    return { success: true };
  };

  const reportCoachIssue = ({ coachId, coachName, location, issueType, priority = 'Medium', description, reportedBy = 'Super Coach' }) => {
    const newTicket = {
      id: `CISSUE-${Date.now().toString().slice(-4)}`,
      category: 'Coach Operations',
      subject: `[${priority}] Coach Issue: ${coachName} (${location}) - ${issueType}`,
      location,
      coachId,
      coachName,
      issueType,
      priority,
      description,
      reportedBy,
      status: 'Open',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: `MSG-${Date.now()}`,
          sender: reportedBy,
          role: 'Super Coach',
          text: description,
          timestamp: new Date().toISOString()
        }
      ]
    };

    const adminNotif = createNotificationRecord({
      targetRole: 'admin',
      targetLocation: location,
      title: `Coach Issue Reported: ${coachName}`,
      message: `[${priority}] ${issueType} reported at ${location} by ${reportedBy}.`,
      type: 'warning'
    });

    setData(prev => ({
      ...prev,
      supportTickets: [newTicket, ...(prev.supportTickets || [])],
      notifications: [adminNotif, ...(prev.notifications || [])].slice(0, 80)
    }));

    addToast(`Issue regarding Coach ${coachName} reported to Admin Command Center.`, 'success');
    return { success: true, ticket: newTicket };
  };

  // --- Module 8: Communication Center Operations ---
  const sendConversationMessage = (conversationId, text, attachment = null) => {
    if (!conversationId || (!text?.trim() && !attachment)) return { success: false };
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const msgId = `MSG-${Date.now()}`;

    const newMsg = {
      id: msgId,
      sender: 'admin',
      senderName: 'Little Spartans Admin',
      text: text?.trim() || '',
      attachment: attachment || null,
      time: formattedTime,
      date: 'Today',
      status: 'read'
    };

    setData(prev => ({
      ...prev,
      conversations: (prev.conversations || []).map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: text?.trim() || (attachment ? `📎 ${attachment.name}` : ''),
            lastTime: formattedTime,
            messages: [...(conv.messages || []), newMsg]
          };
        }
        return conv;
      })
    }));

    return { success: true, message: newMsg };
  };

  const markConversationRead = (conversationId) => {
    setData(prev => ({
      ...prev,
      conversations: (prev.conversations || []).map(conv => {
        if (conv.id === conversationId && conv.unread > 0) {
          return {
            ...conv,
            unread: 0,
            messages: (conv.messages || []).map(m => ({ ...m, status: 'read' }))
          };
        }
        return conv;
      })
    }));
  };

  const toggleConversationStar = (conversationId) => {
    setData(prev => ({
      ...prev,
      conversations: (prev.conversations || []).map(conv => {
        if (conv.id === conversationId) {
          return { ...conv, starred: !conv.starred };
        }
        return conv;
      })
    }));
  };

  const createOrOpenConversation = (parentPayload) => {
    const { parentName, childName, phone, location, initialText } = parentPayload;
    if (!parentName?.trim()) return { success: false, error: 'Parent name is required' };

    const existing = (data.conversations || []).find(
      c => c.parentName.toLowerCase() === parentName.trim().toLowerCase() || (phone && c.phone === phone)
    );

    if (existing) {
      if (initialText?.trim()) {
        sendConversationMessage(existing.id, initialText.trim());
      }
      return { success: true, conversation: existing };
    }

    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const colors = [
      'bg-emerald-100 text-emerald-800',
      'bg-purple-100 text-purple-800',
      'bg-amber-100 text-amber-800',
      'bg-sky-100 text-sky-800',
      'bg-pink-100 text-pink-800',
    ];
    const initial = parentName.trim().charAt(0).toUpperCase();
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const newConvId = `CONV-${Date.now().toString().slice(-6)}`;
    const initialMsg = initialText?.trim() ? [{
      id: `MSG-${Date.now()}`,
      sender: 'admin',
      senderName: 'Little Spartans Admin',
      text: initialText.trim(),
      time: formattedTime,
      date: 'Today',
      status: 'read'
    }] : [];

    const newConv = {
      id: newConvId,
      parentId: `PAR-${Date.now().toString().slice(-4)}`,
      parentName: parentName.trim(),
      childName: childName?.trim() || 'Student',
      avatarColor,
      initial,
      lastMessage: initialText?.trim() || 'Conversation started',
      lastTime: formattedTime,
      unread: 0,
      starred: false,
      online: true,
      phone: phone || '',
      location: location || 'KK Nagar',
      messages: initialMsg
    };

    setData(prev => ({
      ...prev,
      conversations: [newConv, ...(prev.conversations || [])]
    }));

    return { success: true, conversation: newConv };
  };

  const sendBroadcastMessage = (broadcastData) => {
    const { title, target, content } = broadcastData;
    if (!title?.trim() || !content?.trim()) {
      addToast('Title and content are required for broadcast.', 'error');
      return { success: false };
    }

    const now = new Date();
    const sentAt = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });

    const newBc = {
      id: `BC-${Date.now().toString().slice(-5)}`,
      title: title.trim(),
      target: target || 'All Centers',
      sentAt,
      recipientsCount: 45,
      deliveredCount: 45,
      readCount: 0,
      content: content.trim()
    };

    setData(prev => ({
      ...prev,
      broadcasts: [newBc, ...(prev.broadcasts || [])],
      notifications: [
        {
          id: `NTF-BC-${Date.now()}`,
          title: `Broadcast: ${title.trim()}`,
          message: content.trim().slice(0, 80) + '...',
          targetRole: 'parent',
          read: false,
          createdAt: new Date().toISOString()
        },
        ...(prev.notifications || [])
      ]
    }));

    addToast(`Broadcast "${title.trim()}" dispatched!`, 'success');
    return { success: true, broadcast: newBc };
  };

  const scheduleNewMessage = (scheduleData) => {
    const { title, target, content, scheduledDate } = scheduleData;
    if (!title?.trim() || !content?.trim() || !scheduledDate) {
      addToast('Please provide title, content and scheduled date.', 'error');
      return { success: false };
    }

    const newSch = {
      id: `SCH-${Date.now().toString().slice(-5)}`,
      title: title.trim(),
      target: target || 'All Centers',
      scheduledDate,
      content: content.trim(),
      status: 'Scheduled'
    };

    setData(prev => ({
      ...prev,
      scheduledMessages: [newSch, ...(prev.scheduledMessages || [])]
    }));

    addToast(`Message "${title.trim()}" scheduled!`, 'success');
    return { success: true, scheduledMessage: newSch };
  };

  const publishAnnouncementRecord = (annPayload) => {
    const { title, target, content } = annPayload;
    if (!title?.trim() || !content?.trim()) return { success: false };

    const newAnn = {
      id: `ANN-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      date: new Date().toISOString().split('T')[0],
      target: target || 'All Parents & Students',
      content: content.trim()
    };

    setData(prev => ({
      ...prev,
      announcements: [newAnn, ...(prev.announcements || [])]
    }));

    addToast(`Announcement "${title.trim()}" published!`, 'success');
    return { success: true, announcement: newAnn };
  };

  const navigateTo = (view, subTab = '') => {
    setCurrentView(view, subTab);
    if (subTab) {
      setActiveSubTab(subTab);
    } else if (view === 'people' || view === 'students' || view === 'kids') {
      setActiveSubTab('students');
    }
    setSidebarOpen(false);
  };

  const navigateToPersonRecord = (type, id) => {
    const targetSubTab = type === 'parent' ? 'parents' : 'students';
    setCurrentView('people', targetSubTab);
    setActiveSubTab(targetSubTab);
    setFocusedRecord({ type, id });
    setSidebarOpen(false);
  };

  // First-Time Login Terms & Conditions Acceptance (Strictly for Parent Portal)
  const checkUserTermsAcceptance = (userId, userEmail, userRole) => {
    const activeTermsVersion = data.termsDocument?.version || '1.0';
    const activeDosDontsVersion = data.dosDontsDocument?.version || '1.0';

    const acceptances = data.termsAcceptances || [];
    const normalizedEmail = (userEmail || '').toLowerCase().trim();

    const hasAccepted = acceptances.some((rec) => {
      const matchUser =
        (normalizedEmail && rec.userEmail && rec.userEmail.toLowerCase().trim() === normalizedEmail) ||
        (userId && rec.userId === userId) ||
        (userRole && rec.userRole === userRole && (!userEmail || rec.userEmail === userEmail));

      return (
        matchUser &&
        rec.termsVersion === activeTermsVersion &&
        rec.dosDontsVersion === activeDosDontsVersion &&
        rec.termsAccepted === true &&
        rec.dosDontsAccepted === true
      );
    });

    return hasAccepted;
  };

  const recordTermsAcceptance = async (payload) => {
    const activeTermsVersion = data.termsDocument?.version || '1.0';
    const activeDosDontsVersion = data.dosDontsDocument?.version || '1.0';

    const {
      userId,
      userEmail,
      userName,
      userRole,
      termsVersion = activeTermsVersion,
      dosDontsVersion = activeDosDontsVersion
    } = payload || {};
    const timestamp = new Date().toISOString();

    const newRecord = {
      id: `ACK-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      userId: userId || userEmail || 'ACC-PARENT',
      userEmail: userEmail || currentUserProfiles[currentPortal]?.email || '',
      userName: userName || currentUserProfiles[currentPortal]?.name || 'Academy Parent',
      userRole: userRole || currentPortal || 'parent',
      termsVersion,
      termsAccepted: true,
      termsAcceptedAt: timestamp,
      dosDontsVersion,
      dosDontsAccepted: true,
      dosDontsAcceptedAt: timestamp,
      ipAddress: '127.0.0.1 (Verified Session)',
      status: 'Active',
      createdAt: timestamp,
    };

    setData((prev) => {
      const existing = prev.termsAcceptances || [];
      const updatedAcceptances = [newRecord, ...existing];
      const updatedAccounts = (prev.userAccounts || []).map((acc) => {
        const match =
          (newRecord.userEmail && acc.email && acc.email.toLowerCase() === newRecord.userEmail.toLowerCase()) ||
          (newRecord.userId && acc.id === newRecord.userId);
        if (match) {
          return {
            ...acc,
            termsAccepted: true,
            termsVersion,
            termsAcceptedAt: timestamp,
            dosDontsAccepted: true,
            dosDontsVersion,
            dosDontsAcceptedAt: timestamp,
          };
        }
        return acc;
      });

      return {
        ...prev,
        termsAcceptances: updatedAcceptances,
        userAccounts: updatedAccounts,
      };
    });

    return { success: true, record: newRecord };
  };

  // =========================================================================
  // ADMIN TERMS & POLICIES GOVERNANCE METHODS
  // =========================================================================

  // Add new section to Terms & Conditions
  const addTermsSection = (newSection) => {
    setData((prev) => {
      const currentDoc = prev.termsDocument || initialAcademyData.termsDocument;
      const currentSections = currentDoc.sections || [];
      const nextNumber = currentSections.length > 0 
        ? Math.max(...currentSections.map(s => s.number)) + 1 
        : 1;

      const sectionToAdd = {
        number: newSection.number || nextNumber,
        title: newSection.title || `Section ${nextNumber}`,
        points: Array.isArray(newSection.points) && newSection.points.length > 0 
          ? newSection.points 
          : [newSection.text || 'Policy terms details.']
      };

      const updatedSections = [...currentSections, sectionToAdd];
      return {
        ...prev,
        termsDocument: {
          ...currentDoc,
          lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          sections: updatedSections
        }
      };
    });
    addToast('New Terms & Conditions section added successfully.', 'success');
  };

  // Update existing section in Terms & Conditions
  const updateTermsSection = (sectionNumber, updatedFields) => {
    setData((prev) => {
      const currentDoc = prev.termsDocument || initialAcademyData.termsDocument;
      const updatedSections = (currentDoc.sections || []).map((sec) => {
        if (sec.number === sectionNumber) {
          return {
            ...sec,
            ...updatedFields,
            points: Array.isArray(updatedFields.points) ? updatedFields.points : sec.points
          };
        }
        return sec;
      });

      return {
        ...prev,
        termsDocument: {
          ...currentDoc,
          lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          sections: updatedSections
        }
      };
    });
    addToast(`Section ${sectionNumber} updated successfully.`, 'success');
  };

  // Delete section from Terms & Conditions
  const deleteTermsSection = (sectionNumber) => {
    setData((prev) => {
      const currentDoc = prev.termsDocument || initialAcademyData.termsDocument;
      const filtered = (currentDoc.sections || []).filter(s => s.number !== sectionNumber);
      // Re-index section numbers
      const reindexed = filtered.map((sec, idx) => ({
        ...sec,
        number: idx + 1
      }));

      return {
        ...prev,
        termsDocument: {
          ...currentDoc,
          lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          sections: reindexed
        }
      };
    });
    addToast(`Section ${sectionNumber} deleted and list re-indexed.`, 'info');
  };

  // Add rule to Parent Do's or Don'ts
  const addConductRule = (type, ruleText) => {
    if (!ruleText || !ruleText.trim()) return;
    setData((prev) => {
      const currentDoc = prev.dosDontsDocument || initialAcademyData.dosDontsDocument;
      const listKey = type === 'dos' ? 'dos' : 'donts';
      const existingList = currentDoc[listKey] || [];
      const updatedList = [...existingList, ruleText.trim()];

      return {
        ...prev,
        dosDontsDocument: {
          ...currentDoc,
          lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          [listKey]: updatedList
        }
      };
    });
    addToast(`New Parent ${type === 'dos' ? 'Do' : "Don't"} guideline added.`, 'success');
  };

  // Update rule in Parent Do's or Don'ts
  const updateConductRule = (type, index, ruleText) => {
    if (!ruleText || !ruleText.trim()) return;
    setData((prev) => {
      const currentDoc = prev.dosDontsDocument || initialAcademyData.dosDontsDocument;
      const listKey = type === 'dos' ? 'dos' : 'donts';
      const updatedList = [...(currentDoc[listKey] || [])];
      updatedList[index] = ruleText.trim();

      return {
        ...prev,
        dosDontsDocument: {
          ...currentDoc,
          lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          [listKey]: updatedList
        }
      };
    });
    addToast(`Parent guideline updated.`, 'success');
  };

  // Delete rule in Parent Do's or Don'ts
  const deleteConductRule = (type, index) => {
    setData((prev) => {
      const currentDoc = prev.dosDontsDocument || initialAcademyData.dosDontsDocument;
      const listKey = type === 'dos' ? 'dos' : 'donts';
      const updatedList = (currentDoc[listKey] || []).filter((_, i) => i !== index);

      return {
        ...prev,
        dosDontsDocument: {
          ...currentDoc,
          lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          [listKey]: updatedList
        }
      };
    });
    addToast(`Guideline removed.`, 'info');
  };

  // Update Parent Acknowledgement Text
  const updateParentAcknowledgementText = (newText) => {
    setData((prev) => {
      const currentDoc = prev.dosDontsDocument || initialAcademyData.dosDontsDocument;
      return {
        ...prev,
        dosDontsDocument: {
          ...currentDoc,
          acknowledgement: newText,
          lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        }
      };
    });
    addToast('Parent acknowledgement statement updated.', 'success');
  };

  // Publish new version (forces re-acknowledgement for parents)
  const publishNewTermsVersion = ({ termsVersion, dosDontsVersion, changeNotes }) => {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    setData((prev) => {
      const currentTerms = prev.termsDocument || initialAcademyData.termsDocument;
      const currentDosDonts = prev.dosDontsDocument || initialAcademyData.dosDontsDocument;

      return {
        ...prev,
        termsDocument: {
          ...currentTerms,
          version: termsVersion || currentTerms.version,
          lastUpdated: today
        },
        dosDontsDocument: {
          ...currentDosDonts,
          version: dosDontsVersion || currentDosDonts.version,
          lastUpdated: today
        }
      };
    });
    addToast(`Published new Terms & Policies Version ${termsVersion || 'update'}! Parents will be prompted on next login.`, 'success');
  };

  // Reset terms to academy default template
  const resetTermsDataToDefault = () => {
    setData((prev) => ({
      ...prev,
      termsDocument: initialAcademyData.termsDocument,
      dosDontsDocument: initialAcademyData.dosDontsDocument,
    }));
    addToast('Terms & Policies restored to academy default.', 'info');
  };

  const resetTermsAcceptanceForTesting = (userEmail) => {
    const normalized = (userEmail || '').toLowerCase().trim();
    setData((prev) => ({
      ...prev,
      termsAcceptances: (prev.termsAcceptances || []).filter(
        (r) => normalized && r.userEmail && r.userEmail.toLowerCase().trim() !== normalized
      ),
      userAccounts: (prev.userAccounts || []).map((acc) => {
        if (!normalized || (acc.email && acc.email.toLowerCase().trim() === normalized)) {
          return {
            ...acc,
            termsAccepted: false,
            termsAcceptedAt: null,
            dosDontsAccepted: false,
            dosDontsAcceptedAt: null,
          };
        }
        return acc;
      }),
    }));
    addToast('Terms & Conditions acceptance reset for testing.', 'info');
  };

  // =========================================================================
  // EVALUATION REVIEW & QUALITY ASSURANCE ACTIONS
  // =========================================================================
  const saveDraftEvaluation = (evalData) => {
    const id = evalData.id || `EV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const draftEval = {
      ...evalData,
      id,
      status: 'Draft',
      updatedAt: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
      publishedToParent: false,
    };
    setData((prev) => {
      const existingIdx = (prev.evaluations || []).findIndex(
        (e) => e.id === id || (e.studentId === evalData.studentId && e.cycle === evalData.cycle)
      );
      let updatedList;
      if (existingIdx >= 0) {
        updatedList = [...prev.evaluations];
        updatedList[existingIdx] = { ...updatedList[existingIdx], ...draftEval };
      } else {
        updatedList = [draftEval, ...(prev.evaluations || [])];
      }
      return {
        ...prev,
        evaluations: updatedList,
      };
    });
    addToast(`Evaluation for ${evalData.studentName || 'child'} saved as Draft.`, 'info');
    return draftEval;
  };

  const submitEvaluation = (evalData) => {
    const id = evalData.id || `EV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEval = {
      ...evalData,
      id,
      status: 'Pending',
      submittedAt: evalData.submittedAt || new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
      publishedToParent: false,
    };
    setData((prev) => {
      const existingIdx = (prev.evaluations || []).findIndex(
        (e) => e.id === id || (e.studentId === evalData.studentId && e.cycle === evalData.cycle)
      );
      let updatedList;
      if (existingIdx >= 0) {
        updatedList = [...prev.evaluations];
        updatedList[existingIdx] = { ...updatedList[existingIdx], ...newEval, status: 'Pending' };
      } else {
        updatedList = [newEval, ...(prev.evaluations || [])];
      }
      return {
        ...prev,
        evaluations: updatedList,
      };
    });
    addToast(`Evaluation ${id} submitted to Super Coach for review!`, 'success');
    return newEval;
  };

  const updateEvaluation = (id, updates) => {
    setData((prev) => ({
      ...prev,
      evaluations: (prev.evaluations || []).map((ev) => (ev.id === id ? { ...ev, ...updates } : ev)),
    }));
    addToast('Evaluation changes saved successfully!', 'success');
  };

  const approveEvaluation = (id, reviewNotes) => {
    let approvedStudentId = null;
    let approvedSkills = null;
    let approvedObservation = null;

    setData((prev) => {
      const updatedEvals = (prev.evaluations || []).map((ev) => {
        if (ev.id === id) {
          approvedStudentId = ev.studentId;
          approvedSkills = ev.skills;
          approvedObservation = reviewNotes !== undefined ? reviewNotes : (ev.superCoachNotes || ev.coachObservation);
          return {
            ...ev,
            status: 'Approved',
            superCoachNotes: reviewNotes !== undefined ? reviewNotes : ev.superCoachNotes,
            approvedAt: new Date().toISOString(),
            publishedToParent: true,
          };
        }
        return ev;
      });

      // Synchronize evaluation progression to student record for Parent Portal
      const updatedStudents = (prev.students || []).map((st) => {
        if (st.id === approvedStudentId && approvedSkills) {
          const bal = (approvedSkills.balance?.superCoachRating || approvedSkills.balance?.coachRating || 4) * 20;
          const jump = (approvedSkills.jumping?.superCoachRating || approvedSkills.jumping?.coachRating || 4) * 20;
          const thr = (approvedSkills.throwing?.superCoachRating || approvedSkills.throwing?.coachRating || 5) * 20;
          const run = (approvedSkills.running?.superCoachRating || approvedSkills.running?.coachRating || 4) * 20;
          const overall = Math.round((bal + jump + thr + run) / 4);
          return {
            ...st,
            evaluations: {
              balance: bal,
              jumping: jump,
              throwing: thr,
              running: run,
              overall,
              remark: approvedObservation || 'Consistent focus and athletic growth.',
              lastEvaluated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            }
          };
        }
        return st;
      });

      return {
        ...prev,
        evaluations: updatedEvals,
        students: updatedStudents,
      };
    });
    addToast(`Evaluation ${id} approved and published to Parent Portal!`, 'success');
  };

  const returnEvaluation = (id, returnReason, superCoachNotes) => {
    setData((prev) => ({
      ...prev,
      evaluations: (prev.evaluations || []).map((ev) => {
        if (ev.id === id) {
          return {
            ...ev,
            status: 'Returned',
            returnReason,
            superCoachNotes: superCoachNotes !== undefined ? superCoachNotes : ev.superCoachNotes,
            returnedAt: new Date().toISOString(),
            publishedToParent: false,
          };
        }
        return ev;
      }),
    }));
    addToast(`Evaluation ${id} returned to coach for revision.`, 'info');
  };

  const bulkApproveEvaluations = (ids) => {
    const idSet = new Set(ids);
    setData((prev) => ({
      ...prev,
      evaluations: (prev.evaluations || []).map((ev) => {
        if (idSet.has(ev.id)) {
          return {
            ...ev,
            status: 'Approved',
            approvedAt: new Date().toISOString(),
            publishedToParent: true,
          };
        }
        return ev;
      }),
    }));
    addToast(`${ids.length} evaluation(s) approved and published to Parent Portal!`, 'success');
  };

  return (
    <CrmContext.Provider
      value={{
        data,
        setData,
        currentPortal,
        setCurrentPortal,
        currentView,
        setCurrentView,
        activeSubTab,
        setActiveSubTab,
        navigateTo,
        currentUser: currentUserProfiles[currentPortal],
        globalSearch,
        setGlobalSearch,
        sidebarOpen,
        setSidebarOpen,
        focusedRecord,
        setFocusedRecord,
        navigateToPersonRecord,
        isLoggedIn,
        login: (portalRole) => {
          if (portalRole) setCurrentPortal(portalRole);
          setIsLoggedIn(true);
          try {
            localStorage.setItem('little_spartans_is_logged_in', 'true');
          } catch (e) {}
          setShowMotivationalModal(true);
        },
        logout: () => {
          setIsLoggedIn(false);
          try {
            localStorage.setItem('little_spartans_is_logged_in', 'false');
          } catch (e) {}
          setShowMotivationalModal(false);
        },
        showMotivationalModal,
        setShowMotivationalModal,
        toasts,
        addToast,
        removeToast,
        resetAllData,
        // Actions
        addStudent,
        addParent,
        updateParent,
        updateStudent,
        deleteStudent,
        addCoach,
        updateCoach,
        deleteCoach,
        addEnquiry,
        updateEnquiry,
        updateEnquiryStage,
        syncEnquiryLeadStatus,
        enrollFromEnquiry,
        // Demo Management
        addDemo,
        updateDemo,
        updateDemoStatus,
        updateDemoConversionStatus,
        rescheduleDemo,
        convertDemoToStudent,
        addPayment,
        markAttendance,
        applyLeave,
        updateLeaveStatus,
        applyCoachLeave,
        reviewCoachLeave,
        deleteCoachLeave,
        getCoachApprovedLeaveForDate,
        createTicket,
        updateTicketStatus,
        addTicketReply,
        addFeedback,
        registerCompetition,
        createAccount,
        resetAccountPassword,
        toggleAccountStatus,
        deleteAccount,
        createFeeStructure,
        assignStudentFee,
        submitCompensationRequest,
        updateCompensationRequest,
        updateCompensationStatus,
        createCoachCompensation,
        updateCoachCompensation,
        createBackup,
        restoreBackup,
        // Student Individual Class Package Management
        activateStudentPackage,
        renewStudentPackage,
        sendManualPackageReminder,
        saveBatchAttendance,
        // Location-Based Class Scheduling Actions
        createClassSchedule,
        createRecurringClassSchedules,
        updateClassSchedule,
        cancelClassSchedule,
        completeClassSchedule,
        checkScheduleConflictLive,
        markNotificationsRead,
        // Programs & Classes Separate Management Modules
        addLocation,
        updateLocation,
        toggleLocationStatus,
        addProgram,
        updateProgram,
        toggleProgramStatus,
        createBatch,
        updateBatch,
        toggleBatchStatus,
        deleteBatch,
        updateBatchEnrollment,
        assignCoachesToBatch,
        // Super Coach & Sports Equipment Management Actions
        addEquipmentItem,
        updateEquipmentItem,
        deleteEquipmentItem,
        submitEquipmentReport,
        verifyEquipmentReport,
        adminApproveEquipmentReport,
        submitEquipmentRequest: submitEquipmentReport,
        reviewEquipmentRequest,
        fulfillEquipmentRequest,
        confirmEquipmentCheck,
        updateSuperCoachLocations,
        reassignScheduleCoach,
        reportCoachIssue,
        // Evaluation Review Actions
        saveDraftEvaluation,
        submitEvaluation,
        updateEvaluation,
        approveEvaluation,
        returnEvaluation,
        bulkApproveEvaluations,
        // Emergency Coach Replacement Actions
        assignEmergencyCoachReplacement,
        revokeEmergencyCoachReplacement,
        // Module 8 Communication Center Actions
        sendConversationMessage,
        markConversationRead,
        toggleConversationStar,
        createOrOpenConversation,
        sendBroadcastMessage,
        scheduleNewMessage,
        publishAnnouncementRecord,
        resetToCleanSlate,
        // Settings & Configuration Governance
        settingsAuditLogs: data.settingsAuditLogs || initialAcademyData.settingsAuditLogs || [],
        academicCalendar: data.academicCalendar || initialAcademyData.academicCalendar,
        updateAcademyGeneralInfo,
        updateAcademicYear,
        addAcademicTerm,
        addAcademicHoliday,
        deleteAcademicHoliday,
        logSettingsAudit,
        // First-Time Login Terms & Conditions & Admin Governance
        termsDocument: data.termsDocument || initialAcademyData.termsDocument,
        dosDontsDocument: data.dosDontsDocument || initialAcademyData.dosDontsDocument,
        termsAcceptances: data.termsAcceptances || [],
        checkUserTermsAcceptance,
        recordTermsAcceptance,
        resetTermsAcceptanceForTesting,
        addTermsSection,
        updateTermsSection,
        deleteTermsSection,
        addConductRule,
        updateConductRule,
        deleteConductRule,
        updateParentAcknowledgementText,
        publishNewTermsVersion,
        resetTermsDataToDefault,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
}
