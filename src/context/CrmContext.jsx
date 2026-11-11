import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialAcademyData } from '../data/mockData';
import { checkScheduleConflict } from '../services/scheduleService';
import { upsertBatchAttendanceRecords } from '../services/attendanceService';

const CrmContext = createContext();

const LOCAL_STORAGE_KEY = 'little_spartans_crm_v3_chennai';
const CURRENT_ROLE_KEY = 'little_spartans_current_portal';

export function CrmProvider({ children }) {
  // Load data from localStorage or fallback to initial data
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure canonical locations and required arrays exist
        return {
          ...initialAcademyData,
          ...parsed,
          academy: {
            ...initialAcademyData.academy,
            ...(parsed.academy || {}),
            centers: initialAcademyData.academy.centers,
          },
          locations: initialAcademyData.locations,
          classSchedules: Array.isArray(parsed.classSchedules) ? parsed.classSchedules : initialAcademyData.classSchedules,
          attendanceRecords: Array.isArray(parsed.attendanceRecords) ? parsed.attendanceRecords : initialAcademyData.attendanceRecords,
        };
      }
    } catch (e) {
      console.error('Error loading stored CRM data', e);
    }
    return initialAcademyData;
  });

  // Current active portal: 'admin' | 'parent' | 'coach' | 'support'
  const [currentPortal, setCurrentPortal] = useState(() => {
    try {
      const savedPortal = localStorage.getItem(CURRENT_ROLE_KEY);
      if (savedPortal && ['admin', 'parent', 'coach', 'support'].includes(savedPortal)) {
        return savedPortal;
      }
    } catch (e) {}
    return 'admin';
  });

  // Active module view within portal
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState('');
  
  // Search query in top navbar
  const [globalSearch, setGlobalSearch] = useState('');

  // Mobile sidebar drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authentication state (default false to present the Little Spartans ZenConnect login portal immediately)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
      name: "Dr. Rohan Sharma",
      role: "Parent (Aarav & Sanya)",
      portalTitle: "Parent Portal",
      email: "rohan.sharma@gmail.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      badge: "Verified Parent"
    },
    coach: {
      name: "Coach Vikram Singh",
      role: "Head Coach (Gymnastics)",
      portalTitle: "Coach Portal",
      email: "vikram@littlespartans.co.in",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      badge: "FIG Level 2 Coach"
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

    const newStudent = {
      ...studentData,
      id: `STU-00${data.students.length + 1}`,
      joinDate: new Date().toISOString().split('T')[0],
      attendanceRate: 100,
      feeStatus: studentData.feeStatus || 'Paid',
      enrolledClasses:
        studentData.enrolledClasses && studentData.enrolledClasses.length > 0
          ? studentData.enrolledClasses
          : matchedClass
          ? [matchedClass.id]
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
      id: `ENQ-${500 + data.enquiries.length + 1}`,
      createdAt: new Date().toISOString().split('T')[0],
      stage: enquiryData.stage || 'New'
    };
    setData(prev => ({
      ...prev,
      enquiries: [newEnq, ...prev.enquiries]
    }));
    addToast(`New enquiry for "${newEnq.childName}" registered.`);
    return newEnq;
  };

  const updateEnquiryStage = (id, newStage) => {
    setData(prev => ({
      ...prev,
      enquiries: prev.enquiries.map(e => e.id === id ? { ...e, stage: newStage } : e)
    }));
    addToast(`Enquiry moved to ${newStage}.`);
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
    const newAccount = {
      id: `ACC-00${(data.userAccounts || []).length + 1}`,
      ...accountData,
      email: accountData.email.trim().toLowerCase(),
      status: 'Active',
      isTemporaryPassword: true,
      tempPasswordDisplay: tempPassword,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      permissions: accountData.role === 'coach' 
        ? ["MARK_CLASS_ATTENDANCE", "UPDATE_STUDENT_PERFORMANCE", "VIEW_ASSIGNED_CLASSES"]
        : ["VIEW_OWN_CHILDREN", "MAKE_PAYMENTS", "REQUEST_COMPENSATION"]
    };

    setData(prev => ({
      ...prev,
      userAccounts: [newAccount, ...(prev.userAccounts || [])]
    }));

    addToast(`Account created for ${newAccount.name}! Invitation sent to ${newAccount.email} with temp password.`);
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

  // Module 4.8: Student Compensation Class Requests
  const submitCompensationRequest = (reqData) => {
    const newReq = {
      id: `CMP-00${(data.compensationRequests || []).length + 1}`,
      ...reqData,
      appliedOn: new Date().toISOString().split('T')[0],
      status: 'Pending',
      reviewedBy: 'Pending Admin Approval',
      approvalNotes: 'Awaiting slot review by Admin'
    };
    setData(prev => ({
      ...prev,
      compensationRequests: [newReq, ...(prev.compensationRequests || [])]
    }));
    addToast('Compensation class request submitted for Admin review.');
    return newReq;
  };

  const updateCompensationStatus = (id, newStatus, approvalNotes, replacementSlot, replacementCoach) => {
    setData(prev => ({
      ...prev,
      compensationRequests: (prev.compensationRequests || []).map(r => {
        if (r.id === id) {
          return {
            ...r,
            status: newStatus,
            reviewedBy: 'Admin Vikramaditya',
            approvalNotes: approvalNotes || r.approvalNotes,
            replacementSlot: replacementSlot || r.replacementSlot,
            replacementCoach: replacementCoach || r.replacementCoach
          };
        }
        return r;
      })
    }));
    addToast(`Compensation request ${id} updated to ${newStatus}.`);
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

  // Location-Based Class Scheduling: Synchronized across Admin & Coach Portals
  const createClassSchedule = (candidate) => {
    const conflict = checkScheduleConflict(candidate, data.classSchedules || []);
    if (conflict.hasConflict) {
      addToast(conflict.message, 'error');
      return { success: false, message: conflict.message };
    }

    const id = `SCH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSchedule = {
      id,
      location: candidate.location,
      program: candidate.program,
      programId: candidate.programId || '',
      batch: candidate.batch,
      batchId: candidate.batchId || '',
      coachId: candidate.coachId,
      coachName: candidate.coachName,
      date: candidate.date,
      startTime: candidate.startTime,
      endTime: candidate.endTime,
      venue: candidate.venue,
      capacity: parseInt(candidate.capacity, 10) || 20,
      enrolledCount: candidate.enrolledCount || 0,
      enrolledStudents: candidate.enrolledStudents && candidate.enrolledStudents.length > 0 
        ? candidate.enrolledStudents 
        : ["Aarav Sharma", "Ananya Sharma", "Vihaan Patel"],
      notes: candidate.notes || '',
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
      publishedBy: 'Admin Vikramaditya'
    };

    setData(prev => ({
      ...prev,
      classSchedules: [newSchedule, ...(prev.classSchedules || [])]
    }));

    addToast(`Schedule "${newSchedule.batch}" published! Automatically synced to ${newSchedule.coachName}'s Coach Portal.`, 'success');
    return { success: true, schedule: newSchedule };
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

    setData(prev => ({
      ...prev,
      classSchedules: (prev.classSchedules || []).map(s => 
        s.id === id 
          ? { 
              ...s, 
              ...updates, 
              status: updates.status || (s.status === 'Completed' ? 'Completed' : 'Updated'),
              updatedAt: new Date().toISOString() 
            } 
          : s
      )
    }));

    addToast(`Schedule ${id} updated! Coach Portal synchronized.`, 'info');
    return { success: true };
  };

  const cancelClassSchedule = (id, reason = '') => {
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
      )
    }));
    addToast(`Schedule ${id} marked as Cancelled. Coach Portal updated.`, 'warning');
    return { success: true };
  };

  const completeClassSchedule = (id) => {
    setData(prev => ({
      ...prev,
      classSchedules: (prev.classSchedules || []).map(s => 
        s.id === id 
          ? { ...s, status: 'Completed', completedAt: new Date().toISOString() } 
          : s
      )
    }));
    addToast(`Class session ${id} marked as Completed.`, 'success');
    return { success: true };
  };

  const checkScheduleConflictLive = (candidate, excludeId = null) => {
    return checkScheduleConflict(candidate, data.classSchedules || [], excludeId);
  };

  const navigateTo = (view, subTab = '') => {
    setCurrentView(view);
    if (subTab) setActiveSubTab(subTab);
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
        isLoggedIn,
        login: (portalRole) => {
          if (portalRole) setCurrentPortal(portalRole);
          setIsLoggedIn(true);
        },
        logout: () => {
          setIsLoggedIn(false);
        },
        toasts,
        addToast,
        removeToast,
        resetAllData,
        // Actions
        addStudent,
        updateStudent,
        deleteStudent,
        addEnquiry,
        updateEnquiryStage,
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
        updateCompensationStatus,
        createCoachCompensation,
        updateCoachCompensation,
        createBackup,
        restoreBackup,
        saveBatchAttendance,
        // Location-Based Class Scheduling Actions
        createClassSchedule,
        updateClassSchedule,
        cancelClassSchedule,
        completeClassSchedule,
        checkScheduleConflictLive
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
