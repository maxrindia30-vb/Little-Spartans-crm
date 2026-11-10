import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialAcademyData } from '../data/mockData';

const CrmContext = createContext();

const LOCAL_STORAGE_KEY = 'little_spartans_crm_v2_data';
const CURRENT_ROLE_KEY = 'little_spartans_current_portal';

export function CrmProvider({ children }) {
  // Load data from localStorage or fallback to initial data
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
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
    const newStudent = {
      ...studentData,
      id: `STU-00${data.students.length + 1}`,
      joinDate: new Date().toISOString().split('T')[0],
      attendanceRate: 100,
      feeStatus: studentData.feeStatus || 'Paid',
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

  const markAttendance = (classId, studentId, status) => {
    // Updates student attendance rate & logs
    addToast(`Attendance marked as "${status}" for student.`);
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

  return (
    <CrmContext.Provider
      value={{
        data,
        setData,
        currentPortal,
        setCurrentPortal,
        currentView,
        setCurrentView,
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
        registerCompetition
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
