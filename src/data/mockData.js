// Initial Clean Configuration for Little Spartans Sports Academy CRM
// All dummy student, coach, parent, enquiry, payment, and schedule records removed
// so locations and operational records can be entered and verified manually.

import {
  TERMS_AND_CONDITIONS_DOC,
  PARENT_DOS_AND_DONTS_DOC,
} from './termsAndPoliciesContent';

export const initialAcademyData = {
  academy: {
    name: "Little Spartans Sports Academy",
    tagline: "Empowering Young Champions Through Sports & Discipline",
    phone: "+91 98765 43210",
    email: "contact@littlespartans.co.in",
    website: "https://www.littlespartans.co.in",
    centers: ["KK NAGAR", "KILPAUK", "MAHALINGAPURAM", "ANNA NAGAR", "KOLATHUR"],
    academicYear: "2026-2027"
  },

  // Sport catalog used in enrollment, enquiry, batch, and schedule dropdowns
  programs: [
    { id: "PROG-1", name: "Spartan Gymnastics & Agility", ageGroup: "4 - 8 yrs", studentsCount: 0, feeMonthly: 4500, icon: "Award" },
    { id: "PROG-2", name: "Junior Football Champions", ageGroup: "6 - 12 yrs", studentsCount: 0, feeMonthly: 4000, icon: "Trophy" },
    { id: "PROG-3", name: "Spartan Athletics & Sprinting", ageGroup: "5 - 14 yrs", studentsCount: 0, feeMonthly: 3800, icon: "Zap" },
    { id: "PROG-4", name: "Basketball Rising Stars", ageGroup: "7 - 14 yrs", studentsCount: 0, feeMonthly: 4200, icon: "Activity" },
    { id: "PROG-5", name: "Spartan Martial Arts & Karate", ageGroup: "5 - 12 yrs", studentsCount: 0, feeMonthly: 4000, icon: "Shield" },
    { id: "PROG-6", name: "Little Cubs Multi-Sport", ageGroup: "3 - 5 yrs", studentsCount: 0, feeMonthly: 3500, icon: "Smile" }
  ],

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

  announcements: [
    {
      id: 'ANN-1',
      title: 'State Agility Championship 2026 Announced',
      date: '2026-11-20',
      target: 'All Parents & Students',
      content: 'Little Spartans Annual Agility & Gymnastics Tournament registrations are open now. Please confirm student entries by Friday.'
    },
    {
      id: 'ANN-2',
      title: 'Monsoon Outdoor Training Protocol & Court Relocation',
      date: '2026-11-18',
      target: 'All Centers',
      content: 'Due to afternoon rains, all agility drills will proceed inside covered indoor courts. Timings remain unaffected.'
    }
  ],

  // Communication Center Live Conversations (matches design reference)
  conversations: [
    {
      id: 'CONV-1',
      parentId: 'PAR-1',
      parentName: 'Priya R',
      childName: 'Arjun',
      avatarColor: 'bg-emerald-100 text-emerald-800',
      initial: 'P',
      lastMessage: 'Great, thank you!',
      lastTime: '10:24 AM',
      unread: 2,
      starred: true,
      online: true,
      phone: '+91 98401 23456',
      location: 'KK Nagar',
      messages: [
        {
          id: 'M1',
          sender: 'parent',
          senderName: 'Priya R',
          text: 'Hi, will there be class tomorrow?',
          time: '10:12 AM',
          date: 'Today',
          status: 'read'
        },
        {
          id: 'M2',
          sender: 'admin',
          senderName: 'Little Spartans Admin',
          text: 'Hi Priya, yes. The class will be as per the regular schedule.\n\n📍 Venue: KK Nagar\n⏰ Time: 5:00 PM – 6:00 PM',
          time: '10:18 AM',
          date: 'Today',
          status: 'read'
        },
        {
          id: 'M3',
          sender: 'parent',
          senderName: 'Priya R',
          text: 'Great, thank you!',
          time: '10:24 AM',
          date: 'Today',
          status: 'read'
        }
      ]
    },
    {
      id: 'CONV-2',
      parentId: 'PAR-2',
      parentName: 'Karthik M',
      childName: 'Dhruv',
      avatarColor: 'bg-purple-100 text-purple-800',
      initial: 'K',
      lastMessage: 'Fees payment done ✅',
      lastTime: '9:48 AM',
      unread: 3,
      starred: false,
      online: false,
      phone: '+91 98402 34567',
      location: 'Mahalingapuram',
      messages: [
        {
          id: 'M201',
          sender: 'parent',
          senderName: 'Karthik M',
          text: 'Fees payment done ✅',
          time: '9:48 AM',
          date: 'Today',
          status: 'delivered'
        }
      ]
    },
    {
      id: 'CONV-3',
      parentId: 'PAR-3',
      parentName: 'Lavanya S',
      childName: 'Minha',
      avatarColor: 'bg-amber-100 text-amber-800',
      initial: 'L',
      lastMessage: "Can you share this week's timetable?",
      lastTime: 'Yesterday',
      unread: 2,
      starred: true,
      online: true,
      phone: '+91 98403 45678',
      location: 'Arumbakkam',
      messages: [
        {
          id: 'M301',
          sender: 'parent',
          senderName: 'Lavanya S',
          text: "Can you share this week's timetable?",
          time: '4:15 PM',
          date: 'Yesterday',
          status: 'read'
        },
        {
          id: 'M302',
          sender: 'admin',
          senderName: 'Little Spartans Admin',
          text: 'Shared timetable with you! Let us know if you need any assistance.',
          time: '4:30 PM',
          date: 'Yesterday',
          status: 'read'
        }
      ]
    },
    {
      id: 'CONV-4',
      parentId: 'PAR-4',
      parentName: 'Suresh V',
      childName: 'Aaditya',
      avatarColor: 'bg-sky-100 text-sky-800',
      initial: 'S',
      lastMessage: 'Is the competition registration open?',
      lastTime: 'Yesterday',
      unread: 3,
      starred: false,
      online: false,
      phone: '+91 98404 56789',
      location: 'Kilpauk',
      messages: [
        {
          id: 'M401',
          sender: 'parent',
          senderName: 'Suresh V',
          text: 'Is the competition registration open?',
          time: '11:20 AM',
          date: 'Yesterday',
          status: 'read'
        }
      ]
    },
    {
      id: 'CONV-5',
      parentId: 'PAR-5',
      parentName: 'Meena D',
      childName: 'Ishaan',
      avatarColor: 'bg-pink-100 text-pink-800',
      initial: 'M',
      lastMessage: 'Thank you for the update!',
      lastTime: '18 Nov',
      unread: 1,
      starred: false,
      online: false,
      phone: '+91 98405 67890',
      location: 'KK Nagar',
      messages: [
        {
          id: 'M501',
          sender: 'admin',
          senderName: 'Little Spartans Admin',
          text: 'Ishaan earned the Gold Gymnastics Ribbon today! 🎉',
          time: '5:45 PM',
          date: '18 Nov',
          status: 'read'
        },
        {
          id: 'M502',
          sender: 'parent',
          senderName: 'Meena D',
          text: 'Thank you for the update!',
          time: '6:00 PM',
          date: '18 Nov',
          status: 'read'
        }
      ]
    },
    {
      id: 'CONV-6',
      parentId: 'PAR-6',
      parentName: 'Ravi K',
      childName: 'Sanvika',
      avatarColor: 'bg-emerald-100 text-emerald-800',
      initial: 'R',
      lastMessage: 'Do we need to bring any equipment?',
      lastTime: '17 Nov',
      unread: 1,
      starred: false,
      online: true,
      phone: '+91 98406 78901',
      location: 'Mahalingapuram',
      messages: [
        {
          id: 'M601',
          sender: 'parent',
          senderName: 'Ravi K',
          text: 'Do we need to bring any equipment?',
          time: '3:30 PM',
          date: '17 Nov',
          status: 'read'
        },
        {
          id: 'M602',
          sender: 'admin',
          senderName: 'Little Spartans Admin',
          text: 'All agility and gymnastics training equipment is provided at our academy centers.',
          time: '3:45 PM',
          date: '17 Nov',
          status: 'read'
        }
      ]
    }
  ],

  // Quick Action & Template Libraries
  messageTemplates: [
    {
      id: 'TPL-1',
      title: 'Class Schedule Reminder',
      category: 'Classes',
      content: 'Reminder: {child_name} has a training session scheduled on {day} at {time} at {location}. Please ensure they arrive 5 minutes early in athletic attire.'
    },
    {
      id: 'TPL-2',
      title: 'Monthly Fee Reminder',
      category: 'Fees & Payments',
      content: 'Dear {parent_name}, this is a gentle reminder that the training subscription for {child_name} is due for renewal. You can pay securely via the Parent Portal.'
    },
    {
      id: 'TPL-3',
      title: 'Weather & Holiday Notice',
      category: 'Announcements',
      content: 'Important Notice: Academy training classes at {location} today are rescheduled due to weather. Compensation sessions will be credited to your account.'
    },
    {
      id: 'TPL-4',
      title: 'Tournament & Cup Invite',
      category: 'Events',
      content: 'Exciting news! {child_name} has been nominated for the Little Spartans State Agility Cup. Registrations close this Friday!'
    },
    {
      id: 'TPL-5',
      title: 'Coach Replacement Alert',
      category: 'Classes',
      content: 'Notice: Coach {replacement_coach} will be covering for {original_coach} today for {batch} at {location}. Full training curriculum will proceed as planned.'
    }
  ],

  broadcasts: [
    {
      id: 'BC-1',
      title: 'Rainy Season Safety & Indoor Drill Protocol',
      target: 'All Centers',
      sentAt: '2026-11-19 09:30 AM',
      recipientsCount: 48,
      deliveredCount: 48,
      readCount: 42,
      content: 'All agility drills for the afternoon session will take place in the indoor gymnasium.'
    },
    {
      id: 'BC-2',
      title: 'Annual Sports Day Registration Open',
      target: 'KK Nagar & Mahalingapuram',
      sentAt: '2026-11-18 11:00 AM',
      recipientsCount: 32,
      deliveredCount: 32,
      readCount: 29,
      content: 'Registration for the Little Spartans Annual Agility Meet is now open on the portal.'
    }
  ],

  scheduledMessages: [
    {
      id: 'SCH-1',
      title: 'Weekend Batch Hydration Reminder',
      target: 'Saturday Morning Batches',
      scheduledDate: '2026-11-21 07:00 AM',
      content: 'Please ensure students carry a labeled water bottle for Saturday training.',
      status: 'Scheduled'
    }
  ],

  feeStructures: [],

  studentFeeAssignments: [],

  compensationRequests: [],

  compensationHistory: [],

  coachCompensationClasses: [],

  // Emergency Coach Replacement Audit History
  coachReplacements: [],

  // Super Admin root access account
  userAccounts: [
    {
      id: "ACC-001",
      role: "admin",
      name: "Balavivek S",
      email: "admin@littlespartans.co.in",
      phone: "+91 98765 43210",
      status: "Active",
      isTemporaryPassword: false,
      lastLogin: "2026-11-18 10:15 AM",
      createdAt: "2024-01-01",
      permissions: ["SUPER_ADMIN", "FULL_ACCESS"]
    }
  ],

  backups: [],
  termsAcceptances: [],

  // Shared Academy Branches (Chennai)
  locations: [
    {
      id: "LOC-1",
      name: "KK NAGAR",
      code: "LS-KKN",
      city: "Chennai",
      state: "Tamil Nadu",
      pinCode: "600078",
      address: "15, Munusamy Salai, KK Nagar, Chennai",
      contactPerson: "Coach Kabir Rao",
      contactPhone: "+91 98840 55441",
      operatingDays: "Mon - Sat",
      operatingHours: "06:00 AM - 08:30 PM",
      capacity: 150,
      status: "Active",
      facilities: ["Main Turf Ground", "Training Court A", "Practice Arena B", "Warm-up Studio"],
      courts: [
        "Main Turf Ground",
        "Training Court A",
        "Practice Arena B",
        "Warm-up Studio"
      ],
      programs: ["Spartan Gymnastics & Agility", "Junior Football Champions", "Spartan Athletics & Sprinting", "Basketball Rising Stars", "Little Cubs Multi-Sport"]
    },
    {
      id: "LOC-2",
      name: "KILPAUK",
      code: "LS-KPK",
      city: "Chennai",
      state: "Tamil Nadu",
      pinCode: "600010",
      address: "82, Poonamallee High Rd, Kilpauk, Chennai",
      contactPerson: "Coach Vikram Singh",
      contactPhone: "+91 98840 55442",
      operatingDays: "Mon - Sat",
      operatingHours: "06:00 AM - 08:30 PM",
      capacity: 140,
      status: "Active",
      facilities: ["Main Turf Ground", "Training Court A", "Practice Arena B", "Warm-up Studio"],
      courts: [
        "Main Turf Ground",
        "Training Court A",
        "Practice Arena B",
        "Warm-up Studio"
      ],
      programs: ["Spartan Gymnastics & Agility", "Junior Football Champions", "Spartan Athletics & Sprinting", "Basketball Rising Stars"]
    },
    {
      id: "LOC-3",
      name: "MAHALINGAPURAM",
      code: "LS-MHP",
      city: "Chennai",
      state: "Tamil Nadu",
      pinCode: "600034",
      address: "45, Josier St, Mahalingapuram, Chennai",
      contactPerson: "Coach Ramesh K",
      contactPhone: "+91 98840 55443",
      operatingDays: "Mon - Sat",
      operatingHours: "06:00 AM - 08:30 PM",
      capacity: 130,
      status: "Active",
      facilities: ["Main Turf Ground", "Training Court A", "Practice Arena B", "Warm-up Studio"],
      courts: [
        "Main Turf Ground",
        "Training Court A",
        "Practice Arena B",
        "Warm-up Studio"
      ],
      programs: ["Spartan Gymnastics & Agility", "Junior Football Champions", "Spartan Martial Arts & Karate"]
    },
    {
      id: "LOC-4",
      name: "ANNA NAGAR",
      code: "LS-ANR",
      city: "Chennai",
      state: "Tamil Nadu",
      pinCode: "600040",
      address: "12, 2nd Avenue, Anna Nagar, Chennai",
      contactPerson: "Coach Preethi S",
      contactPhone: "+91 98840 55444",
      operatingDays: "Mon - Sat",
      operatingHours: "06:00 AM - 08:30 PM",
      capacity: 160,
      status: "Active",
      facilities: ["Main Turf Ground", "Training Court A", "Practice Arena B", "Warm-up Studio"],
      courts: [
        "Main Turf Ground",
        "Training Court A",
        "Practice Arena B",
        "Warm-up Studio"
      ],
      programs: ["Spartan Gymnastics & Agility", "Junior Football Champions", "Spartan Athletics & Sprinting", "Little Cubs Multi-Sport"]
    },
    {
      id: "LOC-5",
      name: "KOLATHUR",
      code: "LS-KTR",
      city: "Chennai",
      state: "Tamil Nadu",
      pinCode: "600099",
      address: "28, Redhills Main Rd, Kolathur, Chennai",
      contactPerson: "Coach Dinesh V",
      contactPhone: "+91 98840 55445",
      operatingDays: "Mon - Sat",
      operatingHours: "06:00 AM - 08:30 PM",
      capacity: 120,
      status: "Active",
      facilities: ["Main Turf Ground", "Training Court A", "Practice Arena B", "Warm-up Studio"],
      courts: [
        "Main Turf Ground",
        "Training Court A",
        "Practice Arena B",
        "Warm-up Studio"
      ],
      programs: ["Junior Football Champions", "Basketball Rising Stars", "Spartan Martial Arts & Karate"]
    }
  ],

  // Academic Calendar & Terms Governance
  academicCalendar: {
    academicYear: "2026-2027",
    terms: [
      { id: "TERM-1", name: "Term 1 (Monsoon)", startDate: "2026-06-01", endDate: "2026-08-31", status: "Completed" },
      { id: "TERM-2", name: "Term 2 (Autumn & Winter)", startDate: "2026-09-01", endDate: "2026-11-30", status: "Active" },
      { id: "TERM-3", name: "Term 3 (Spring Championship)", startDate: "2026-12-01", endDate: "2027-02-28", status: "Upcoming" },
      { id: "CAMP-1", name: "Summer Spartan Intensive Camp", startDate: "2027-04-01", endDate: "2027-05-15", status: "Scheduled" }
    ],
    holidays: [
      { id: "HOL-1", name: "Independence Day", date: "2026-08-15", type: "National Holiday" },
      { id: "HOL-2", name: "Gandhi Jayanti", date: "2026-10-02", type: "National Holiday" },
      { id: "HOL-3", name: "Diwali Festival Break", date: "2026-11-01", type: "Festival Holiday" },
      { id: "HOL-4", name: "Christmas Day", date: "2026-12-25", type: "Academy Holiday" },
      { id: "HOL-5", name: "Pongal & Makar Sankranti", date: "2027-01-14", type: "Festival Holiday" },
      { id: "HOL-6", name: "Republic Day", date: "2027-01-26", type: "National Holiday" }
    ]
  },

  // Settings & Configuration Audit Trail
  settingsAuditLogs: [
    {
      id: "SET-LOG-101",
      timestamp: "2026-11-20T10:15:00Z",
      user: "Commander Vikramaditya",
      role: "Super Admin",
      category: "Brand & Identity",
      action: "Verification",
      field: "Brand Palette Tokens",
      oldValue: "Standard Theme",
      newValue: "Warm Cream, Spartan Orange, Navy Blue, Pure White",
      status: "Verified",
      ipAddress: "127.0.0.1"
    },
    {
      id: "SET-LOG-102",
      timestamp: "2026-11-18T14:30:00Z",
      user: "Commander Vikramaditya",
      role: "Super Admin",
      category: "Center Management",
      action: "Facility Verification",
      field: "Kolathur Courts",
      oldValue: "3 Courts",
      newValue: "Main Turf Ground, Training Court A, Practice Arena B, Warm-up Studio",
      status: "Verified",
      ipAddress: "127.0.0.1"
    },
    {
      id: "SET-LOG-103",
      timestamp: "2026-11-15T09:00:00Z",
      user: "Commander Vikramaditya",
      role: "Super Admin",
      category: "Academic Calendar",
      action: "Session Initialized",
      field: "Academic Year",
      oldValue: "2025-2026",
      newValue: "2026-2027",
      status: "Verified",
      ipAddress: "127.0.0.1"
    }
  ],

  // Shared Synchronized Class Schedules (Admin & Coach Portals)
  classSchedules: [],

  // Shared Location-Isolated Student Attendance Records (Admin & Coach Portals)
  attendanceRecords: [],

  // Cross-Portal Real-Time Alerts (Admin <-> Parent <-> Coach)
  notifications: [],

  // Super Coaches managing multi-location operations
  superCoaches: [
    {
      id: "SCOACH-1",
      name: "Senior Coach Kabir Rao",
      title: "Senior Super Coach & Operations Lead",
      email: "supercoach@littlespartans.co.in",
      phone: "+91 98840 55443",
      assignedLocations: ["KK NAGAR", "KILPAUK", "MAHALINGAPURAM"],
      specialization: "Multi-Disciplinary Program Director & Coach Mentor",
      experience: "9 Yrs",
      certification: "AFC & National Gymnastics Certified Master Coach",
      status: "Active"
    }
  ],

  // Location-Isolated Sports Equipment Inventory
  equipment: [],

  // Coach-submitted Equipment Condition & Damage Reports
  equipmentReports: [],

  // Terms & Conditions and Parent Conduct Guidelines Governance
  termsDocument: TERMS_AND_CONDITIONS_DOC,
  dosDontsDocument: PARENT_DOS_AND_DONTS_DOC,
  termsAcceptances: []
};
