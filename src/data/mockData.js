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

  coaches: [],

  students: [],

  parents: [],

  enquiries: [],

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
  attendanceRecords: []
};
