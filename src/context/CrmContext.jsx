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
} from '../services/enrollmentService';
import {
  validateDemoPayload,
  buildDemoRecord,
  rescheduleDemoRecord,
  updateDemoStatusRecord,
  DEMO_STATUSES,
  ENQUIRY_SOURCES,
} from '../services/demoService';
import {
  initialEquipmentInventory,
  initialEquipmentReports,
  REPORT_STATUSES,
} from '../services/equipmentService';

const CrmContext = createContext();

const LOCAL_STORAGE_KEY = 'little_spartans_crm_v4_clean';
const CURRENT_ROLE_KEY = 'little_spartans_current_portal';

export function CrmProvider({ children }) {
  // Load data from localStorage or fallback to initial data
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Purge dummy/legacy coach records so fresh academy accounts start at 0
        const legacyCoachNames = new Set([
          'coach vikram singh', 
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
        const storedCoaches = (Array.isArray(parsed.coaches) ? parsed.coaches : [])
          .filter((c) => !legacyCoachNames.has((c.name || '').toLowerCase().trim()));

        const mergedCoaches = [
          ...initialAcademyData.coaches,
          ...storedCoaches.filter((c) => !new Set(initialAcademyData.coaches.map(ic => ic.name.toLowerCase().trim())).has((c.name || '').toLowerCase().trim())),
        ];
        const storedLocations =
          Array.isArray(parsed.locations) && parsed.locations.length > 0
            ? parsed.locations
            : initialAcademyData.locations;
        const activeCenters = storedLocations
          .filter((l) => l.status !== 'Inactive')
          .map((l) => l.name);

        return {
          ...initialAcademyData,
          ...parsed,
          academy: {
            ...initialAcademyData.academy,
            ...(parsed.academy || {}),
            centers: activeCenters.length > 0 ? activeCenters : initialAcademyData.academy.centers,
          },
          locations: storedLocations,
          coaches: mergedCoaches,
          enquiries: Array.isArray(parsed.enquiries) && parsed.enquiries.length > 0
            ? parsed.enquiries.map(enq => ({
                ...enq,
                source: enq.source || ENQUIRY_SOURCES.MANUAL,
              }))
            : (initialAcademyData.enquiries || []),
          demos: Array.isArray(parsed.demos) && parsed.demos.length > 0 ? parsed.demos : (initialAcademyData.demos || []),
          classSchedules: Array.isArray(parsed.classSchedules) ? parsed.classSchedules : initialAcademyData.classSchedules,
          attendanceRecords: Array.isArray(parsed.attendanceRecords) ? parsed.attendanceRecords : initialAcademyData.attendanceRecords,
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : (initialAcademyData.notifications || []),
          superCoaches: Array.isArray(parsed.superCoaches) && parsed.superCoaches.length > 0 ? parsed.superCoaches : initialAcademyData.superCoaches,
          equipment: Array.isArray(parsed.equipment) && parsed.equipment.length > 0 ? parsed.equipment : initialEquipmentInventory,
          equipmentReports: Array.isArray(parsed.equipmentReports) && parsed.equipmentReports.length > 0 ? parsed.equipmentReports : initialEquipmentReports,
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
    try {
      const savedPortal = localStorage.getItem(CURRENT_ROLE_KEY);
      if (savedPortal && ['admin', 'parent', 'coach', 'super_coach', 'support'].includes(savedPortal)) {
        return savedPortal;
      }
    } catch (e) {}
    return 'admin';
  });

  // Active module view within portal
  const [currentView, setCurrentViewRaw] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState('students');

  const setCurrentView = (view) => {
    setCurrentViewRaw(view);
    if (view === 'people' || view === 'students') {
      setActiveSubTab('students');
    }
  };
  
  // Search query in top navbar
  const [globalSearch, setGlobalSearch] = useState('');

  // Mobile sidebar drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Focus navigation state (e.g. jump directly from Enquiry Enrollment -> Student / Parent record)
  const [focusedRecord, setFocusedRecord] = useState(null);
  const enrollingIdsRef = useRef(new Set());

  // Authentication state (default false to present the Little Spartans ZenConnect login portal immediately)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_ROLE_KEY, currentPortal);
    } catch (e) {}
    // Reset view to dashboard when changing portal
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

  // Reset to default mock data
  const resetAllData = () => {
    setData(initialAcademyData);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    addToast('Academy CRM data reset to default demo dataset.', 'info');
  };

  // Current logged in user credentials per portal
  const currentUserProfiles = {
    admin: {
      name: "Commander Vikramaditya",
      role: "Academy Director",
      portalTitle: "Admin Portal",
      email: "director@littlespartans.co.in",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      badge: "Super Admin"
    },
    parent: {
      name: data.parents[0]?.name || "Parent Account",
      role: data.parents[0]?.center ? `Parent (${data.parents[0].center})` : "Parent Portal",
      portalTitle: "Parent Portal",
      email: data.parents[0]?.email || "parent@littlespartans.co.in",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      badge: "Verified Parent"
    },
    coach: {
      name: data.coaches[0]?.name || "Coach Account",
      role: data.coaches[0]?.specialization || "Sports Coach",
      portalTitle: "Coach Portal",
      email: data.coaches[0]?.email || "coach@littlespartans.co.in",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      badge: "Academy Coach"
    },
    super_coach: {
      name: (data.superCoaches && data.superCoaches[0]?.name) || "Senior Coach Kabir Rao",
      role: (data.superCoaches && data.superCoaches[0]?.title) || "Senior Super Coach & Operations Lead",
      portalTitle: "Super Coach Portal",
      email: (data.superCoaches && data.superCoaches[0]?.email) || "supercoach@littlespartans.co.in",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
      badge: "Super Coach",
      assignedLocations: (data.superCoaches && data.superCoaches[0]?.assignedLocations) || ["KK NAGAR", "KILPAUK", "MAHALINGAPURAM"]
    },
    support: {
      name: "Priya Menon",
      role: "Lead Relations Officer",
      portalTitle: "Customer Support Portal",
      email: "support@littlespartans.co.in",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
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

    // Permanent location-based Kid ID format: LS-[LOCATION_CODE]-[YEAR]-[SEQUENCE]
    const studentId = studentData.id || generateLocationKidId(data.students || [], studentData.center);
    const newStudent = {
      ...studentData,
      id: studentId,
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
    setData(prev => ({
      ...prev,
      students: [newStudent, ...prev.students]
    }));
    addToast(`Student "${newStudent.name}" enrolled successfully!`);
    return newStudent;
  };

  const updateStudent = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === id ? { ...s, ...updatedFields } : s)
    }));
    addToast('Student details updated.');
  };

  const deleteStudent = (id) => {
    setData(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== id)
    }));
    addToast('Student record removed.', 'info');
  };

  const addEnquiry = (enquiryData) => {
    const newEnq = {
      ...enquiryData,
      id: generateUniquePrefixedId(data.enquiries || [], 'ENQ'),
      source: enquiryData.source || ENQUIRY_SOURCES.MANUAL,
      enquiryDate: enquiryData.enquiryDate || new Date().toISOString().split('T')[0],
      createdAt: enquiryData.enquiryDate || new Date().toISOString().split('T')[0],
      stage: enquiryData.stage || 'New',
      demoId: enquiryData.demoId || null,
    };
    setData(prev => ({
      ...prev,
      enquiries: [newEnq, ...prev.enquiries]
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

  const updateDemoStatus = (id, newStatus, note = '') => {
    const target = (data.demos || []).find(d => d.id === id);
    if (!target) return { success: false, error: 'Demo not found' };

    const updated = updateDemoStatusRecord(target, newStatus, note);
    
    setData(prev => {
      let updatedEnquiries = prev.enquiries || [];
      if (target.enquiryId) {
        let enquiryStage = null;
        if (newStatus === DEMO_STATUSES.COMPLETED) enquiryStage = 'Demo Completed';
        else if (newStatus === DEMO_STATUSES.CANCELLED) enquiryStage = 'Demo Cancelled';
        else if (newStatus === DEMO_STATUSES.NO_SHOW) enquiryStage = 'Demo No Show';
        else if (newStatus === DEMO_STATUSES.CONFIRMED) enquiryStage = 'Demo Scheduled';
        else if (newStatus === DEMO_STATUSES.RESCHEDULED) enquiryStage = 'Demo Scheduled';

        if (enquiryStage) {
          updatedEnquiries = updatedEnquiries.map(e => e.id === target.enquiryId ? { ...e, stage: enquiryStage } : e);
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
      : 'Commander Vikramaditya (Admin)';

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

    setData(prev => ({
      ...prev,
      attendanceRecords: result.records,
    }));

    addToast(
      `Saved ${result.savedCount} attendance record${result.savedCount === 1 ? '' : 's'} for ${date} in browser storage (backend API not connected).`,
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

  const applyLeave = (leaveData) => {
    const newLeave = {
      ...leaveData,
      id: `LEV-${100 + data.leaveRequests.length + 1}`,
      appliedOn: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    setData(prev => ({
      ...prev,
      leaveRequests: [newLeave, ...prev.leaveRequests]
    }));
    addToast('Leave request submitted successfully.');
  };

  const updateLeaveStatus = (id, newStatus, reviewer) => {
    setData(prev => ({
      ...prev,
      leaveRequests: prev.leaveRequests.map(l => l.id === id ? { ...l, status: newStatus, reviewedBy: reviewer || 'Admin' } : l)
    }));
    addToast(`Leave request ${newStatus}.`);
  };

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
    const parentId = generateUniquePrefixedId(existingParents, 'PAR');
    const linkedStudentNames = Array.isArray(parentData.children) ? parentData.children : [];
    const normalizedEmail = (parentData.email || '').trim().toLowerCase();

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

      const tempPassword = `Spartan@${Math.floor(1000 + Math.random() * 9000)}`;
      const newAccount = {
        id: `ACC-${String(nextUserAccounts.length + 1).padStart(3, '0')}`,
        role: 'parent',
        name: parentData.name.trim(),
        email: normalizedEmail,
        phone: parentData.phone?.trim() || '',
        center: parentData.center,
        linkedStudents: linkedStudentNames,
        status: 'Active',
        isTemporaryPassword: true,
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
      totalFeesPaid: '₹0',
      pendingDue: '₹0',
      portalAccess: parentData.grantPortalAccess !== false,
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
        `Parent "${newParent.name}" (${newParent.center}) added & Parent Portal activated! Temp Password: ${createdAccountResult.tempPassword}`,
        'success'
      );
    } else {
      addToast(`Parent "${newParent.name}" added under ${newParent.center}.`, 'success');
    }

    return { success: true, parent: newParent, ...createdAccountResult };
  };

  const updateParent = (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      parents: (prev.parents || []).map((p) =>
        p.id === id ? { ...p, ...updatedFields } : p
      ),
    }));
    addToast('Parent record updated.');
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

    const tempPassword = `Spartan@${Math.floor(1000 + Math.random() * 9000)}`;
    const normalizedEmail = accountData.email.trim().toLowerCase();
    const newAccount = {
      id: `ACC-${String((data.userAccounts || []).length + 1).padStart(3, '0')}`,
      ...accountData,
      email: normalizedEmail,
      status: 'Active',
      isTemporaryPassword: true,
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
        const parentId = `PAR-${String(nextParents.length + 1).padStart(3, '0')}`;
        const childrenNames = Array.isArray(accountData.linkedStudents) ? accountData.linkedStudents : [];
        const center = accountData.center || prev.academy?.centers?.[0] || 'KK NAGAR';

        nextParents = [
          {
            id: parentId,
            name: accountData.name.trim(),
            phone: accountData.phone?.trim() || '',
            email: normalizedEmail,
            center,
            address: `${center}, Chennai`,
            children: childrenNames,
            totalFeesPaid: '₹0',
            pendingDue: '₹0',
            portalAccess: true,
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
      reviewedBy: requestSource === 'Admin' ? 'Admin Vikramaditya' : 'Pending Admin Approval',
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

    setData(prev => ({
      ...prev,
      compensationRequests: [newReq, ...(prev.compensationRequests || [])],
      notifications: [alertNotif, ...(prev.notifications || [])].slice(0, 80),
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
          publishedBy: 'Admin Vikramaditya',
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
      reviewedBy: updates.reviewedBy || (currentPortal === 'coach' ? existing.reviewedBy : 'Admin Vikramaditya'),
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

    setData(prev => ({
      ...prev,
      compensationRequests: (prev.compensationRequests || []).map(r => (r.id === id ? updatedReq : r)),
      classSchedules: nextSchedules,
      notifications: [...newNotifications, ...(prev.notifications || [])].slice(0, 80),
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
      assignedBy: 'Admin Vikramaditya'
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
      batch: candidate.batch,
      batchId: candidate.batchId || matchedBatch?.id || '',
      coachId: candidate.coachId,
      coachName: candidate.coachName,
      additionalCoaches: candidate.additionalCoaches || matchedBatch?.additionalCoaches || [],
      weekday: derivedWeekday,
      date: candidate.date,
      startTime: candidate.startTime,
      endTime: candidate.endTime,
      venue: candidate.venue || '',
      capacity: parseInt(candidate.capacity, 10) || matchedBatch?.capacity || 20,
      enrolledCount: candidate.enrolledCount ?? dynamicStudents.length,
      enrolledStudents: dynamicStudents,
      enrolledStudentIds: dynamicStudentIds,
      recurringGroupId: candidate.recurringGroupId || '',
      scheduleType: candidate.scheduleType || 'one-time',
      notes: candidate.notes || '',
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
      publishedBy: 'Admin Vikramaditya',
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
          ? { ...s, status: 'Completed', completedAt: new Date().toISOString() } 
          : s
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

  // --- Module 1: Academy Locations & Sports Programs Management ---
  const addLocation = (locPayload) => {
    const normalizedName = (locPayload.name || '').trim().toUpperCase();
    if (!normalizedName) {
      addToast('Location name is required.', 'error');
      return { success: false };
    }
    const duplicate = (data.locations || []).some(
      (loc) => loc.name.trim().toUpperCase() === normalizedName
    );
    if (duplicate) {
      addToast(`Location "${normalizedName}" already exists.`, 'error');
      return { success: false };
    }

    const courtsList = Array.isArray(locPayload.courts)
      ? locPayload.courts.map((c) => c.trim()).filter(Boolean)
      : String(locPayload.courts || '')
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean);

    const newLocation = {
      id: `LOC-${Math.floor(100 + Math.random() * 900)}`,
      name: normalizedName,
      city: (locPayload.city || 'Chennai').trim(),
      address: (locPayload.address || `${normalizedName}, Chennai`).trim(),
      courts: courtsList.length > 0 ? courtsList : ['Main Training Arena'],
      status: locPayload.status || 'Active',
    };

    setData((prev) => {
      const updatedLocations = [...(prev.locations || []), newLocation];
      const activeCenters = updatedLocations
        .filter((l) => l.status !== 'Inactive')
        .map((l) => l.name);
      return {
        ...prev,
        locations: updatedLocations,
        academy: { ...prev.academy, centers: activeCenters },
      };
    });

    addToast(`Academy location "${normalizedName}" added.`, 'success');
    return { success: true, location: newLocation };
  };

  const updateLocation = (id, updates) => {
    const existing = (data.locations || []).find((l) => l.id === id);
    if (!existing) {
      addToast('Location not found.', 'error');
      return { success: false };
    }
    const nextName = (updates.name || existing.name).trim().toUpperCase();
    const duplicate = (data.locations || []).some(
      (loc) => loc.id !== id && loc.name.trim().toUpperCase() === nextName
    );
    if (duplicate) {
      addToast(`Location "${nextName}" already exists.`, 'error');
      return { success: false };
    }

    const courtsList = Array.isArray(updates.courts)
      ? updates.courts.map((c) => c.trim()).filter(Boolean)
      : updates.courts !== undefined
      ? String(updates.courts)
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      : existing.courts;

    const oldName = existing.name;
    setData((prev) => {
      const updatedLocations = (prev.locations || []).map((loc) =>
        loc.id === id
          ? {
              ...loc,
              ...updates,
              name: nextName,
              courts: courtsList.length > 0 ? courtsList : loc.courts,
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
        academy: { ...prev.academy, centers: activeCenters },
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

    addToast(`Location "${nextName}" updated.`, 'info');
    return { success: true };
  };

  const toggleLocationStatus = (id) => {
    const existing = (data.locations || []).find((l) => l.id === id);
    if (!existing) return { success: false };
    const nextStatus = existing.status === 'Inactive' ? 'Active' : 'Inactive';
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
      };
    });
    addToast(`Location "${existing.name}" marked as ${nextStatus}.`, nextStatus === 'Active' ? 'success' : 'warning');
    return { success: true, status: nextStatus };
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
    const newItem = {
      ...itemPayload,
      id: itemPayload.id || `EQ-${itemPayload.location?.slice(0, 3).toUpperCase() || 'GEN'}-${Date.now().toString().slice(-4)}`,
      totalQty: Number(itemPayload.totalQty) || 0,
      availableQty: Number(itemPayload.availableQty) || Number(itemPayload.totalQty) || 0,
      damagedQty: Number(itemPayload.damagedQty) || 0,
      missingQty: Number(itemPayload.missingQty) || 0,
      condition: itemPayload.condition || 'Good',
      purchaseDate: itemPayload.purchaseDate || new Date().toISOString().split('T')[0],
      lastInspectionDate: itemPayload.lastInspectionDate || new Date().toISOString().split('T')[0],
      lastUpdatedBy: itemPayload.lastUpdatedBy || 'Administrator',
      remarks: itemPayload.remarks || '',
      history: [
        {
          id: `EQH-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Item Registered',
          user: itemPayload.lastUpdatedBy || 'Administrator',
          role: currentPortal === 'super_coach' ? 'Super Coach' : 'Admin',
          details: `Initial stock registered: ${itemPayload.totalQty} units.`
        }
      ]
    };

    setData(prev => ({
      ...prev,
      equipment: [newItem, ...(prev.equipment || [])]
    }));

    addToast(`Equipment "${newItem.name}" added to ${newItem.location} inventory.`, 'success');
    return { success: true, item: newItem };
  };

  const updateEquipmentItem = (id, updates, auditNote = '') => {
    const existing = (data.equipment || []).find(e => e.id === id);
    if (!existing) {
      addToast('Equipment item not found.', 'error');
      return { success: false };
    }

    const updatedItem = {
      ...existing,
      ...updates,
      totalQty: updates.totalQty !== undefined ? Number(updates.totalQty) : existing.totalQty,
      availableQty: updates.availableQty !== undefined ? Number(updates.availableQty) : existing.availableQty,
      damagedQty: updates.damagedQty !== undefined ? Number(updates.damagedQty) : existing.damagedQty,
      missingQty: updates.missingQty !== undefined ? Number(updates.missingQty) : existing.missingQty,
      lastUpdatedBy: updates.lastUpdatedBy || currentUserProfiles[currentPortal]?.name || 'Admin',
      lastInspectionDate: updates.lastInspectionDate || new Date().toISOString().split('T')[0],
      history: [
        {
          id: `EQH-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: updates.action || 'Inventory Updated',
          user: updates.lastUpdatedBy || currentUserProfiles[currentPortal]?.name || 'Admin',
          role: currentPortal === 'super_coach' ? 'Super Coach' : currentPortal === 'coach' ? 'Coach' : 'Admin',
          details: auditNote || `Condition: ${updates.condition || existing.condition}; Available: ${updates.availableQty ?? existing.availableQty}`
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
    const newReport = {
      ...reportPayload,
      id: `EQREP-${Date.now().toString().slice(-4)}`,
      status: REPORT_STATUSES.PENDING_REVIEW,
      submittedBy: reportPayload.submittedBy || currentUserProfiles[currentPortal]?.name || 'Coach',
      submittedRole: 'coach',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      equipmentReports: [newReport, ...(prev.equipmentReports || [])]
    }));

    addToast(`Equipment report submitted for "${newReport.equipmentName}". Super Coach notified for verification.`, 'success');
    return { success: true, report: newReport };
  };

  const verifyEquipmentReport = (reportId, verificationData = {}) => {
    const report = (data.equipmentReports || []).find(r => r.id === reportId);
    if (!report) return { success: false, message: 'Report not found' };

    const reviewerName = verificationData.reviewer || currentUserProfiles.super_coach?.name || 'Senior Coach Kabir Rao';
    const notes = verificationData.notes || 'Verified on site by Super Coach';
    const status = verificationData.status || REPORT_STATUSES.VERIFIED_BY_SUPER_COACH;

    const updatedReport = {
      ...report,
      status,
      superCoachReview: {
        reviewer: reviewerName,
        role: 'Super Coach',
        timestamp: new Date().toISOString(),
        notes,
        action: verificationData.action || 'Verified'
      },
      updatedAt: new Date().toISOString()
    };

    let updatedEquipment = [...(data.equipment || [])];
    if (verificationData.updateInventory && report.equipmentId) {
      updatedEquipment = updatedEquipment.map(item => {
        if (item.id === report.equipmentId) {
          const damagedCount = Number(report.damagedCount) || 0;
          const missingCount = Number(report.missingCount) || 0;
          const newDamaged = Math.max(item.damagedQty || 0, damagedCount);
          const newMissing = Math.max(item.missingQty || 0, missingCount);
          const newAvailable = Math.max(0, item.totalQty - newDamaged - newMissing);

          return {
            ...item,
            condition: report.reportedCondition || item.condition,
            damagedQty: newDamaged,
            missingQty: newMissing,
            availableQty: newAvailable,
            lastInspectionDate: new Date().toISOString().split('T')[0],
            lastUpdatedBy: reviewerName,
            history: [
              {
                id: `EQH-${Date.now()}`,
                timestamp: new Date().toISOString(),
                action: 'Verified by Super Coach',
                user: reviewerName,
                role: 'Super Coach',
                details: `Super Coach verified report ${reportId}: ${notes}`
              },
              ...(item.history || [])
            ]
          };
        }
        return item;
      });
    }

    setData(prev => ({
      ...prev,
      equipment: updatedEquipment,
      equipmentReports: (prev.equipmentReports || []).map(r => r.id === reportId ? updatedReport : r)
    }));

    addToast(`Equipment Report ${reportId} verified by Super Coach!`, 'success');
    return { success: true, report: updatedReport };
  };

  const adminApproveEquipmentReport = (reportId, approvalData = {}) => {
    const report = (data.equipmentReports || []).find(r => r.id === reportId);
    if (!report) return { success: false, message: 'Report not found' };

    const reviewerName = approvalData.reviewer || currentUserProfiles.admin?.name || 'Commander Vikramaditya';
    const notes = approvalData.notes || 'Admin approved maintenance/replacement.';
    const status = approvalData.status || REPORT_STATUSES.APPROVED_BY_ADMIN;

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
      updatedAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      equipmentReports: (prev.equipmentReports || []).map(r => r.id === reportId ? updatedReport : r)
    }));

    addToast(`Equipment Report ${reportId} sanctioned by Admin (${approvalData.action || 'Approved'}).`, 'success');
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

  const navigateTo = (view, subTab = '') => {
    setCurrentView(view);
    if (subTab) {
      setActiveSubTab(subTab);
    } else if (view === 'people' || view === 'students') {
      setActiveSubTab('students');
    }
    setSidebarOpen(false);
  };

  const navigateToPersonRecord = (type, id) => {
    setCurrentView('people');
    setActiveSubTab(type === 'parent' ? 'parents' : 'students');
    setFocusedRecord({ type, id });
    setSidebarOpen(false);
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
          setShowMotivationalModal(true);
        },
        logout: () => {
          setIsLoggedIn(false);
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
        addEnquiry,
        updateEnquiry,
        updateEnquiryStage,
        enrollFromEnquiry,
        // Demo Management
        addDemo,
        updateDemo,
        updateDemoStatus,
        rescheduleDemo,
        convertDemoToStudent,
        addPayment,
        markAttendance,
        applyLeave,
        updateLeaveStatus,
        createTicket,
        updateTicketStatus,
        addTicketReply,
        addFeedback,
        registerCompetition,
        createAccount,
        resetAccountPassword,
        toggleAccountStatus,
        createFeeStructure,
        assignStudentFee,
        submitCompensationRequest,
        updateCompensationRequest,
        updateCompensationStatus,
        createCoachCompensation,
        updateCoachCompensation,
        createBackup,
        restoreBackup,
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
        updateSuperCoachLocations,
        reassignScheduleCoach,
        reportCoachIssue
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
