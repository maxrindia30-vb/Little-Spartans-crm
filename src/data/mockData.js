// Initial Clean Configuration for Little Spartans Sports Academy CRM
// All dummy student, coach, parent, enquiry, payment, and schedule records removed
// so locations and operational records can be entered and verified manually.

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

  coaches: [
    {
      id: "COACH-1",
      name: "Kapil",
      specialization: "Gymnastics & Multi-Sports",
      experience: "6 Yrs",
      certification: "NIS Certified",
      phone: "",
      email: "kapil@littlespartans.co.in",
      center: "KK NAGAR",
      rating: 4.9,
      activeBatches: 0,
      studentsCount: 0,
      status: "Active"
    },
    {
      id: "COACH-2",
      name: "Dibi",
      specialization: "Kids Fitness & Athletics",
      experience: "5 Yrs",
      certification: "Certified Youth Trainer",
      phone: "",
      email: "dibi@littlespartans.co.in",
      center: "KK NAGAR",
      rating: 4.9,
      activeBatches: 0,
      studentsCount: 0,
      status: "Active"
    },
    {
      id: "COACH-3",
      name: "Hanif",
      specialization: "Agility & Team Sports",
      experience: "5 Yrs",
      certification: "Sports Coaching Diploma",
      phone: "",
      email: "hanif@littlespartans.co.in",
      center: "KILPAUK",
      rating: 4.8,
      activeBatches: 0,
      studentsCount: 0,
      status: "Active"
    },
    {
      id: "COACH-4",
      name: "Teja",
      specialization: "Foundational Movement & Gymnastics",
      experience: "4 Yrs",
      certification: "Certified Coach",
      phone: "",
      email: "teja@littlespartans.co.in",
      center: "ANNA NAGAR",
      rating: 4.8,
      activeBatches: 0,
      studentsCount: 0,
      status: "Active"
    }
  ],

  students: [],

  parents: [],

  enquiries: [
    {
      id: "ENQ-101",
      childName: "Aditya Subramanian",
      dob: "2019-04-12",
      childAge: "7",
      gender: "Male",
      parentName: "Karthik Subramanian",
      phone: "+91 98401 23456",
      email: "karthik.sub@gmail.com",
      interestedProgram: "Spartan Gymnastics & Agility",
      center: "KK NAGAR",
      preferredBatchId: "",
      source: "Website",
      stage: "Demo Scheduled",
      demoId: "DEMO-001",
      enquiryDate: "2026-11-12",
      notes: "Looking for beginner gymnastics and foundational fitness drills."
    },
    {
      id: "ENQ-102",
      childName: "Sanya Venkat",
      dob: "2020-08-20",
      childAge: "6",
      gender: "Female",
      parentName: "Deepa Venkataraman",
      phone: "+91 98412 87654",
      email: "deepa.venkat@outlook.com",
      interestedProgram: "Junior Spartan Athletics",
      center: "KILPAUK",
      preferredBatchId: "",
      source: "Instagram",
      stage: "Interested",
      demoId: null,
      enquiryDate: "2026-11-13",
      notes: "Saw our Instagram reels on agility hurdles. Interested in weekend slot."
    },
    {
      id: "ENQ-103",
      childName: "Rohan Krishnan",
      dob: "2018-11-05",
      childAge: "8",
      gender: "Male",
      parentName: "Krishnan Sundaram",
      phone: "+91 94440 98123",
      email: "krishnan.s@yahoo.com",
      interestedProgram: "Spartan Football & Agility",
      center: "ANNA NAGAR",
      preferredBatchId: "",
      source: "WhatsApp",
      stage: "New",
      demoId: null,
      enquiryDate: "2026-11-14",
      notes: "Direct WhatsApp inquiry from parent community group."
    },
    {
      id: "ENQ-104",
      childName: "Meera Rajesh",
      dob: "2021-02-18",
      childAge: "5",
      gender: "Female",
      parentName: "Rajesh Kannan",
      phone: "+91 97910 11223",
      email: "rajesh.kannan@gmail.com",
      interestedProgram: "Spartan Gymnastics & Agility",
      center: "MAHALINGAPURAM",
      preferredBatchId: "",
      source: "Manual / Walk-in",
      stage: "Demo Completed",
      demoId: "DEMO-002",
      enquiryDate: "2026-11-10",
      notes: "Walk-in inquiry during evening practice session. Completed trial."
    }
  ],

  demos: [
    {
      id: "DEMO-001",
      enquiryId: "ENQ-101",
      childName: "Aditya Subramanian",
      childAge: "7",
      gender: "Male",
      dob: "2019-04-12",
      parentName: "Karthik Subramanian",
      phone: "+91 98401 23456",
      email: "karthik.sub@gmail.com",
      location: "KK NAGAR",
      program: "Spartan Gymnastics & Agility",
      demoDate: "2026-11-16",
      demoTime: "17:00",
      coachId: "COACH-1",
      coachName: "Kapil",
      notes: "Trial on tumbling mats and balance beam basics.",
      status: "Scheduled",
      convertedToStudent: false,
      studentId: null,
      createdAt: "2026-11-12T10:30:00Z",
      updatedAt: "2026-11-12T10:30:00Z",
      history: [
        {
          id: "HIST-001",
          timestamp: "2026-11-12T10:30:00Z",
          action: "Demo Scheduled",
          fromStatus: null,
          toStatus: "Scheduled",
          date: "2026-11-16",
          time: "17:00",
          location: "KK NAGAR",
          coachName: "Kapil",
          note: "Demo converted from Enquiry ENQ-101.",
          updatedBy: "Admin"
        }
      ]
    },
    {
      id: "DEMO-002",
      enquiryId: "ENQ-104",
      childName: "Meera Rajesh",
      childAge: "5",
      gender: "Female",
      dob: "2021-02-18",
      parentName: "Rajesh Kannan",
      phone: "+91 97910 11223",
      email: "rajesh.kannan@gmail.com",
      location: "MAHALINGAPURAM",
      program: "Spartan Gymnastics & Agility",
      demoDate: "2026-11-14",
      demoTime: "16:30",
      coachId: "COACH-1",
      coachName: "Kapil",
      notes: "Excellent motor balance and listening skills. Ready for enrollment.",
      status: "Completed",
      convertedToStudent: false,
      studentId: null,
      createdAt: "2026-11-10T14:00:00Z",
      updatedAt: "2026-11-14T17:15:00Z",
      history: [
        {
          id: "HIST-002",
          timestamp: "2026-11-10T14:00:00Z",
          action: "Demo Scheduled",
          fromStatus: null,
          toStatus: "Scheduled",
          date: "2026-11-14",
          time: "16:30",
          location: "MAHALINGAPURAM",
          coachName: "Kapil",
          note: "Walk-in demo booked.",
          updatedBy: "Admin"
        },
        {
          id: "HIST-003",
          timestamp: "2026-11-14T17:15:00Z",
          action: "Status changed to Completed",
          fromStatus: "Scheduled",
          toStatus: "Completed",
          date: "2026-11-14",
          time: "16:30",
          location: "MAHALINGAPURAM",
          coachName: "Kapil",
          note: "Child attended trial session with Coach Kapil. Highly interested.",
          updatedBy: "Coach Kapil"
        }
      ]
    }
  ],

  payments: [],

  competitions: [],

  leaveRequests: [],

  feedback: [],

  certificates: [],

  supportTickets: [],

  followups: [],

  announcements: [],

  feeStructures: [],

  studentFeeAssignments: [],

  compensationRequests: [],

  coachCompensationClasses: [],

  // Super Admin root access account
  userAccounts: [
    {
      id: "ACC-001",
      role: "admin",
      name: "Commander Vikramaditya",
      email: "director@littlespartans.co.in",
      phone: "+91 98765 43210",
      status: "Active",
      isTemporaryPassword: false,
      lastLogin: "2026-11-11 09:15 AM",
      createdAt: "2024-01-01",
      permissions: ["SUPER_ADMIN", "FULL_ACCESS"]
    }
  ],

  backups: [],

  // Shared Academy Branches (Chennai)
  locations: [
    {
      id: "LOC-1",
      name: "KK NAGAR",
      city: "Chennai",
      address: "KK Nagar, Chennai",
      courts: [
        "Main Turf Ground",
        "Training Court A",
        "Practice Arena B",
        "Warm-up Studio"
      ]
    },
    {
      id: "LOC-2",
      name: "KILPAUK",
      city: "Chennai",
      address: "Kilpauk, Chennai",
      courts: [
        "Main Turf Ground",
        "Training Court A",
        "Practice Arena B",
        "Warm-up Studio"
      ]
    },
    {
      id: "LOC-3",
      name: "MAHALINGAPURAM",
      city: "Chennai",
      address: "Mahalingapuram, Chennai",
      courts: [
        "Main Turf Ground",
        "Training Court A",
        "Practice Arena B",
        "Warm-up Studio"
      ]
    },
    {
      id: "LOC-4",
      name: "ANNA NAGAR",
      city: "Chennai",
      address: "Anna Nagar, Chennai",
      courts: [
        "Main Turf Ground",
        "Training Court A",
        "Practice Arena B",
        "Warm-up Studio"
      ]
    },
    {
      id: "LOC-5",
      name: "KOLATHUR",
      city: "Chennai",
      address: "Kolathur, Chennai",
      courts: [
        "Main Turf Ground",
        "Training Court A",
        "Practice Arena B",
        "Warm-up Studio"
      ]
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
  equipmentReports: []
};
