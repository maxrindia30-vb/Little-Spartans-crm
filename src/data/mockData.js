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

  classes: [
    {
      id: "CLS-001",
      name: "Batch Alpha (Evening)",
      program: "Spartan Gymnastics & Agility",
      center: "KK NAGAR",
      schedule: "Mon, Wed, Fri • 4:30 PM - 5:30 PM",
      coachName: "Coach Kabir Rao",
      coachId: "COACH-001",
      enrolled: 12,
      capacity: 15,
      status: "Active"
    },
    {
      id: "CLS-002",
      name: "Batch Beta (Morning)",
      program: "Junior Football Champions",
      center: "KILPAUK",
      schedule: "Tue, Thu, Sat • 6:30 AM - 7:30 AM",
      coachName: "Coach Vikram Singh",
      coachId: "COACH-002",
      enrolled: 14,
      capacity: 16,
      status: "Active"
    },
    {
      id: "CLS-003",
      name: "Batch Alpha (Evening)",
      program: "Spartan Athletics & Sprinting",
      center: "MAHALINGAPURAM",
      schedule: "Mon, Wed, Fri • 4:30 PM - 5:30 PM",
      coachName: "Coach Arumugam K",
      coachId: "COACH-003",
      enrolled: 10,
      capacity: 15,
      status: "Active"
    },
    {
      id: "CLS-004",
      name: "Weekend Morning League",
      program: "Basketball Rising Stars",
      center: "ANNA NAGAR",
      schedule: "Sat, Sun • 8:00 AM - 9:30 AM",
      coachName: "Coach Rajesh Kumar",
      coachId: "COACH-004",
      enrolled: 12,
      capacity: 15,
      status: "Active"
    },
    {
      id: "CLS-005",
      name: "Junior Speedsters",
      program: "Spartan Martial Arts & Karate",
      center: "KOLATHUR",
      schedule: "Mon, Wed, Fri • 5:00 PM - 6:00 PM",
      coachName: "Coach Dinesh V",
      coachId: "COACH-005",
      enrolled: 8,
      capacity: 14,
      status: "Active"
    }
  ],

  coaches: [
    {
      id: "COACH-001",
      name: "Coach Kabir Rao",
      email: "kabir.rao@littlespartans.co.in",
      phone: "+91 98840 55441",
      center: "KK NAGAR",
      specialization: "Spartan Gymnastics & Agility",
      experience: "7 Yrs",
      certification: "National Gymnastics Coach",
      status: "Active",
      rating: "4.9"
    },
    {
      id: "COACH-002",
      name: "Coach Vikram Singh",
      email: "vikram.singh@littlespartans.co.in",
      phone: "+91 98840 55442",
      center: "KILPAUK",
      specialization: "Junior Football Champions",
      experience: "6 Yrs",
      certification: "AFC Level 2 Coach",
      status: "Active",
      rating: "4.8"
    },
    {
      id: "COACH-003",
      name: "Coach Arumugam K",
      email: "arumugam.k@littlespartans.co.in",
      phone: "+91 98840 55443",
      center: "MAHALINGAPURAM",
      specialization: "Spartan Athletics & Sprinting",
      experience: "5 Yrs",
      certification: "Athletics Federation Certified",
      status: "Active",
      rating: "4.9"
    },
    {
      id: "COACH-004",
      name: "Coach Rajesh Kumar",
      email: "rajesh.kumar@littlespartans.co.in",
      phone: "+91 98840 55444",
      center: "ANNA NAGAR",
      specialization: "Basketball Rising Stars",
      experience: "8 Yrs",
      certification: "BFI Level 1 Coach",
      status: "Active",
      rating: "4.7"
    },
    {
      id: "COACH-005",
      name: "Coach Dinesh V",
      email: "dinesh.v@littlespartans.co.in",
      phone: "+91 98840 55445",
      center: "KOLATHUR",
      specialization: "Spartan Martial Arts & Karate",
      experience: "6 Yrs",
      certification: "Black Belt 3rd Dan",
      status: "Active",
      rating: "4.8"
    }
  ],

  students: [
    {
      id: "LS-KKN-2026-001",
      parentId: "LS-KKN-2026-001",
      name: "Aarav Mehta",
      age: 8,
      gender: "Male",
      center: "KK NAGAR",
      location: "KK NAGAR",
      program: "Spartan Gymnastics & Agility",
      batch: "Batch Alpha (Evening)",
      coachName: "Coach Kabir Rao",
      coachId: "COACH-001",
      parentName: "Suresh Mehta",
      parentPhone: "+91 98840 12345",
      parentEmail: "suresh.mehta@gmail.com",
      status: "Active",
      package: "Quarterly Agility Tier 1",
      enrolledClasses: ["Batch Alpha (Evening)"],
      attendanceRate: 95,
      enquiryId: "ENQ-004"
    },
    {
      id: "LS-KPK-2026-002",
      parentId: "LS-KPK-2026-002",
      name: "Diya Nair",
      age: 7,
      gender: "Female",
      center: "KILPAUK",
      location: "KILPAUK",
      program: "Spartan Athletics & Sprinting",
      batch: "Batch Alpha (Evening)",
      coachName: "Coach Vikram Singh",
      coachId: "COACH-002",
      parentName: "Manoj Nair",
      parentPhone: "+91 98840 23456",
      parentEmail: "manoj.nair@gmail.com",
      status: "Active",
      package: "Half-Yearly Elite Sprint",
      enrolledClasses: ["Batch Alpha (Evening)"],
      attendanceRate: 92,
      enquiryId: "ENQ-005"
    },
    {
      id: "LS-MHP-2026-003",
      parentId: "LS-MHP-2026-003",
      name: "Kavya Reddy",
      age: 6,
      gender: "Female",
      center: "MAHALINGAPURAM",
      location: "MAHALINGAPURAM",
      program: "Spartan Gymnastics & Agility",
      batch: "Batch Alpha (Evening)",
      coachName: "Coach Arumugam K",
      coachId: "COACH-003",
      parentName: "Venkatesh Reddy",
      parentPhone: "+91 98840 34567",
      parentEmail: "venkat.reddy@gmail.com",
      status: "Active",
      package: "Quarterly Agility Tier 1",
      enrolledClasses: ["Batch Alpha (Evening)"],
      attendanceRate: 96,
      enquiryId: "ENQ-006"
    }
  ],

  parents: [
    {
      id: "LS-KKN-2026-001",
      name: "Suresh Mehta",
      phone: "+91 98840 12345",
      email: "suresh.mehta@gmail.com",
      center: "KK NAGAR",
      children: ["Aarav Mehta"],
      linkedStudentIds: ["LS-KKN-2026-001"],
      status: "Active"
    },
    {
      id: "LS-KPK-2026-002",
      name: "Manoj Nair",
      phone: "+91 98840 23456",
      email: "manoj.nair@gmail.com",
      center: "KILPAUK",
      children: ["Diya Nair"],
      linkedStudentIds: ["LS-KPK-2026-002"],
      status: "Active"
    },
    {
      id: "LS-MHP-2026-003",
      name: "Venkatesh Reddy",
      phone: "+91 98840 34567",
      email: "venkat.reddy@gmail.com",
      center: "MAHALINGAPURAM",
      children: ["Kavya Reddy"],
      linkedStudentIds: ["LS-MHP-2026-003"],
      status: "Active"
    }
  ],

  enquiries: [
    {
      id: "ENQ-001",
      enquiryDate: "2026-11-21",
      childName: "Rohan Rao",
      childAge: 7,
      age: 7,
      parentName: "Deepak Rao",
      phone: "+91 98841 12345",
      email: "deepak.rao@gmail.com",
      center: "KK NAGAR",
      interestedProgram: "Spartan Gymnastics & Agility",
      status: "Active",
      stage: "New",
      lastParentResponse: "2026-11-22",
      source: "Website",
      notes: "Parent enquired about evening agility foundation batches."
    },
    {
      id: "ENQ-002",
      enquiryDate: "2026-11-20",
      childName: "Ananya Sharma",
      childAge: 6,
      age: 6,
      parentName: "Kavita Sharma",
      phone: "+91 98842 23456",
      email: "kavita.sharma@gmail.com",
      center: "KILPAUK",
      interestedProgram: "Spartan Gymnastics & Agility",
      status: "Demo Requested",
      stage: "Trial Scheduled",
      demoId: "DEMO-001",
      lastParentResponse: "2026-11-21",
      source: "Instagram",
      notes: "Trial scheduled for Monday 4:30 PM with Coach Vikram."
    },
    {
      id: "ENQ-003",
      enquiryDate: "2026-11-18",
      childName: "Pranav Kumar",
      childAge: 9,
      age: 9,
      parentName: "Rajesh Kumar",
      phone: "+91 98843 34567",
      email: "rajesh.k@gmail.com",
      center: "MAHALINGAPURAM",
      interestedProgram: "Junior Football Champions",
      status: "Demo Attended",
      stage: "Trial Completed",
      demoId: "DEMO-002",
      lastParentResponse: "2026-11-20",
      source: "Google Ads",
      notes: "Trial completed successfully. Parent reviewing 3-month package."
    },
    {
      id: "ENQ-004",
      enquiryDate: "2026-11-15",
      childName: "Aarav Mehta",
      childAge: 8,
      age: 8,
      parentName: "Suresh Mehta",
      phone: "+91 98840 12345",
      email: "suresh.mehta@gmail.com",
      center: "KK NAGAR",
      interestedProgram: "Spartan Gymnastics & Agility",
      status: "Converted",
      stage: "Enrolled",
      enrolledStudentId: "LS-KKN-2026-001",
      lastParentResponse: "2026-11-19",
      source: "Referral",
      notes: "Enrolled in Batch Alpha. Welcome kit issued."
    },
    {
      id: "ENQ-005",
      enquiryDate: "2026-11-14",
      childName: "Diya Nair",
      childAge: 7,
      age: 7,
      parentName: "Manoj Nair",
      phone: "+91 98840 23456",
      email: "manoj.nair@gmail.com",
      center: "KILPAUK",
      interestedProgram: "Spartan Athletics & Sprinting",
      status: "Converted",
      stage: "Enrolled",
      enrolledStudentId: "LS-KPK-2026-002",
      lastParentResponse: "2026-11-18",
      source: "Walk-in",
      notes: "Enrolled for sprinting & sprint technique."
    },
    {
      id: "ENQ-006",
      enquiryDate: "2026-11-12",
      childName: "Kavya Reddy",
      childAge: 6,
      age: 6,
      parentName: "Venkatesh Reddy",
      phone: "+91 98840 34567",
      email: "venkat.reddy@gmail.com",
      center: "MAHALINGAPURAM",
      interestedProgram: "Spartan Gymnastics & Agility",
      status: "Converted",
      stage: "Enrolled",
      enrolledStudentId: "LS-MHP-2026-003",
      lastParentResponse: "2026-11-17",
      source: "Website",
      notes: "Enrolled in morning agility batch."
    },
    {
      id: "ENQ-007",
      enquiryDate: "2026-11-20",
      childName: "Siddharth Verma",
      childAge: 8,
      age: 8,
      parentName: "Pooja Verma",
      phone: "+91 98844 45678",
      email: "pooja.verma@gmail.com",
      center: "ANNA NAGAR",
      interestedProgram: "Basketball Rising Stars",
      status: "Demo Requested",
      stage: "Trial Scheduled",
      demoId: "DEMO-003",
      lastParentResponse: "2026-11-21",
      source: "Website",
      notes: "Saturday morning basketball trial booked."
    },
    {
      id: "ENQ-008",
      enquiryDate: "2026-11-21",
      childName: "Tanvi Sundaram",
      childAge: 5,
      age: 5,
      parentName: "Sundaram R",
      phone: "+91 98845 56789",
      email: "sundaram.r@gmail.com",
      center: "KOLATHUR",
      interestedProgram: "Little Cubs Multi-Sport",
      status: "Active",
      stage: "New",
      lastParentResponse: "2026-11-21",
      source: "Walk-in",
      notes: "Parent enquired at front desk for agility foundation."
    },
    {
      id: "ENQ-009",
      enquiryDate: "2026-11-17",
      childName: "Aditya Balaji",
      childAge: 10,
      age: 10,
      parentName: "Balaji V",
      phone: "+91 98846 67890",
      email: "balaji.v@gmail.com",
      center: "KK NAGAR",
      interestedProgram: "Junior Football Champions",
      status: "Demo Attended",
      stage: "Trial Completed",
      demoId: "DEMO-004",
      lastParentResponse: "2026-11-19",
      source: "Facebook",
      notes: "Trial attended with Coach Kabir. Decision expected today."
    },
    {
      id: "ENQ-010",
      enquiryDate: "2026-11-12",
      childName: "Ishaan Iyer",
      childAge: 9,
      age: 9,
      parentName: "Subramanian Iyer",
      phone: "+91 98847 78901",
      email: "subbu.iyer@gmail.com",
      center: "ANNA NAGAR",
      interestedProgram: "Spartan Gymnastics & Agility",
      status: "Stale",
      stage: "New",
      lastParentResponse: "2026-11-13",
      source: "Google Ads",
      notes: "Follow-up message sent, awaiting parent reply."
    },
    {
      id: "ENQ-011",
      enquiryDate: "2026-11-11",
      childName: "Meera Krishnan",
      childAge: 7,
      age: 7,
      parentName: "Krishnan S",
      phone: "+91 98848 89012",
      email: "krishnan.s@gmail.com",
      center: "KILPAUK",
      interestedProgram: "Spartan Athletics & Sprinting",
      status: "Stale",
      stage: "New",
      lastParentResponse: "2026-11-12",
      source: "Website",
      notes: "No response after initial query."
    },
    {
      id: "ENQ-012",
      enquiryDate: "2026-11-05",
      childName: "Varun Narayanan",
      childAge: 11,
      age: 11,
      parentName: "Narayanan T",
      phone: "+91 98849 90123",
      email: "narayanan.t@gmail.com",
      center: "KOLATHUR",
      interestedProgram: "Basketball Rising Stars",
      status: "Lost",
      stage: "Lost",
      isLost: true,
      lastParentResponse: "2026-11-06",
      source: "Referral",
      notes: "Parent opted for another sports venue closer to residence."
    },
    {
      id: "ENQ-013",
      enquiryDate: "2026-11-22",
      childName: "Samaira Patel",
      childAge: 6,
      age: 6,
      parentName: "Nitin Patel",
      phone: "+91 98850 01234",
      email: "nitin.patel@gmail.com",
      center: "KK NAGAR",
      interestedProgram: "Spartan Gymnastics & Agility",
      status: "Active",
      stage: "New",
      lastParentResponse: "2026-11-22",
      source: "Website",
      notes: "New lead arrived today morning."
    },
    {
      id: "ENQ-014",
      enquiryDate: "2026-11-21",
      childName: "Vihaan Gupta",
      childAge: 8,
      age: 8,
      parentName: "Amit Gupta",
      phone: "+91 98851 12345",
      email: "amit.gupta@gmail.com",
      center: "MAHALINGAPURAM",
      interestedProgram: "Spartan Athletics & Sprinting",
      status: "Demo Requested",
      stage: "Trial Scheduled",
      demoId: "DEMO-005",
      lastParentResponse: "2026-11-22",
      source: "Google Ads",
      notes: "Trial booked for Wednesday."
    },
    {
      id: "ENQ-015",
      enquiryDate: "2026-11-16",
      childName: "Anika Chawla",
      childAge: 7,
      age: 7,
      parentName: "Gaurav Chawla",
      phone: "+91 98852 23456",
      email: "gaurav.chawla@gmail.com",
      center: "ANNA NAGAR",
      interestedProgram: "Spartan Gymnastics & Agility",
      status: "Demo Attended",
      stage: "Trial Completed",
      demoId: "DEMO-006",
      lastParentResponse: "2026-11-18",
      source: "Instagram",
      notes: "Trial completed successfully."
    },
    {
      id: "ENQ-016",
      enquiryDate: "2026-11-08",
      childName: "Aryan Pillai",
      childAge: 9,
      age: 9,
      parentName: "Gopinath Pillai",
      phone: "+91 98853 34567",
      email: "gopinath.p@gmail.com",
      center: "KOLATHUR",
      interestedProgram: "Junior Football Champions",
      status: "Lost",
      stage: "Lost",
      isLost: true,
      lastParentResponse: "2026-11-09",
      source: "Walk-in",
      notes: "Timing conflict with academic tuition."
    }
  ],

  demos: [
    {
      id: "DEMO-001",
      enquiryId: "ENQ-002",
      childName: "Ananya Sharma",
      parentName: "Kavita Sharma",
      phone: "+91 98842 23456",
      center: "KILPAUK",
      program: "Spartan Gymnastics & Agility",
      batch: "Batch Alpha (Evening)",
      coachName: "Coach Vikram Singh",
      coachId: "COACH-002",
      date: "2026-11-24",
      time: "04:30 PM",
      status: "Scheduled"
    },
    {
      id: "DEMO-002",
      enquiryId: "ENQ-003",
      childName: "Pranav Kumar",
      parentName: "Rajesh Kumar",
      phone: "+91 98843 34567",
      center: "MAHALINGAPURAM",
      program: "Junior Football Champions",
      batch: "Batch Beta (Morning)",
      coachName: "Coach Arumugam K",
      coachId: "COACH-003",
      date: "2026-11-19",
      time: "07:30 AM",
      status: "Completed"
    },
    {
      id: "DEMO-003",
      enquiryId: "ENQ-007",
      childName: "Siddharth Verma",
      parentName: "Pooja Verma",
      phone: "+91 98844 45678",
      center: "ANNA NAGAR",
      program: "Basketball Rising Stars",
      batch: "Weekend Morning League",
      coachName: "Coach Rajesh Kumar",
      coachId: "COACH-004",
      date: "2026-11-28",
      time: "09:00 AM",
      status: "Scheduled"
    },
    {
      id: "DEMO-004",
      enquiryId: "ENQ-009",
      childName: "Aditya Balaji",
      parentName: "Balaji V",
      phone: "+91 98846 67890",
      center: "KK NAGAR",
      program: "Junior Football Champions",
      batch: "Batch Alpha (Evening)",
      coachName: "Coach Kabir Rao",
      coachId: "COACH-001",
      date: "2026-11-19",
      time: "05:00 PM",
      status: "Completed"
    },
    {
      id: "DEMO-005",
      enquiryId: "ENQ-014",
      childName: "Vihaan Gupta",
      parentName: "Amit Gupta",
      phone: "+91 98851 12345",
      center: "MAHALINGAPURAM",
      program: "Spartan Athletics & Sprinting",
      batch: "Batch Alpha (Evening)",
      coachName: "Coach Arumugam K",
      coachId: "COACH-003",
      date: "2026-11-25",
      time: "04:30 PM",
      status: "Scheduled"
    },
    {
      id: "DEMO-006",
      enquiryId: "ENQ-015",
      childName: "Anika Chawla",
      parentName: "Gaurav Chawla",
      phone: "+91 98852 23456",
      center: "ANNA NAGAR",
      program: "Spartan Gymnastics & Agility",
      batch: "Batch Beta (Morning)",
      coachName: "Coach Rajesh Kumar",
      coachId: "COACH-004",
      date: "2026-11-18",
      time: "08:00 AM",
      status: "Completed"
    }
  ],

  payments: [
    {
      id: "PAY-001",
      studentId: "LS-KKN-2026-001",
      studentName: "Aarav Mehta",
      parentName: "Suresh Mehta",
      amount: 12000,
      date: "2026-11-15",
      status: "Paid",
      method: "Online UPI",
      center: "KK NAGAR",
      package: "Quarterly Agility Tier 1"
    },
    {
      id: "PAY-002",
      studentId: "LS-KPK-2026-002",
      studentName: "Diya Nair",
      parentName: "Manoj Nair",
      amount: 22000,
      date: "2026-11-14",
      status: "Paid",
      method: "Credit Card",
      center: "KILPAUK",
      package: "Half-Yearly Elite Sprint"
    },
    {
      id: "PAY-003",
      studentId: "LS-MHP-2026-003",
      studentName: "Kavya Reddy",
      parentName: "Venkatesh Reddy",
      amount: 12000,
      date: "2026-11-12",
      status: "Paid",
      method: "Net Banking",
      center: "MAHALINGAPURAM",
      package: "Quarterly Agility Tier 1"
    }
  ],

  competitions: [
    {
      id: "COMPETITION-001",
      title: "Chennai Junior Spartan Agility Cup 2026",
      program: "Spartan Gymnastics & Agility",
      center: "KK NAGAR",
      date: "2026-12-15",
      status: "Upcoming",
      participantsCount: 24,
      venue: "Main Turf Ground & Arena"
    }
  ],

  leaveRequests: [],
  coachLeaveRequests: [
    {
      id: "LEAVE-001",
      coachId: "COACH-001",
      coachName: "Coach Kabir Rao",
      center: "KK NAGAR",
      startDate: "2026-11-26",
      endDate: "2026-11-27",
      leaveType: "Sick Leave",
      reason: "Recovery from ankle sprain",
      status: "Approved",
      approvedBy: "Admin",
      approvedAt: "2026-11-21T15:00:00Z"
    }
  ],

  feedback: [
    {
      id: "FB-001",
      studentId: "LS-KKN-2026-001",
      studentName: "Aarav Patel",
      coachName: "Coach Kabir Rao",
      date: "2026-11-20",
      rating: 5,
      comments: "Excellent agility and discipline demonstrated during the floor balance sequence.",
      type: "Coach Evaluation"
    }
  ],

  certificates: [
    {
      id: "CERT-001",
      studentId: "LS-KKN-2026-001",
      studentName: "Aarav Patel",
      program: "Spartan Gymnastics & Agility",
      level: "Level 1 Bronze Spartan",
      issueDate: "2026-11-15",
      certificateNumber: "LS-CERT-2026-001"
    }
  ],

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

  compensationRequests: [
    {
      id: "COMP-001",
      parentId: "LS-KKN-2026-001",
      parentName: "Rajesh Patel",
      studentId: "LS-KKN-2026-001",
      studentName: "Aarav Patel",
      missedDate: "2026-11-15",
      missedSessionName: "Spartan Gymnastics & Agility",
      reason: "Medical / Doctor Visit",
      compensationDate: "2026-11-24",
      compensationSlot: "5:00 PM – 6:00 PM",
      venue: "Training Court A",
      center: "KK NAGAR",
      status: "Approved",
      requestedAt: "2026-11-16T09:00:00Z",
      reviewedBy: "Admin",
      reviewedAt: "2026-11-16T11:30:00Z"
    }
  ],

  compensationHistory: [
    {
      id: "COMP-HIST-001",
      studentId: "LS-KKN-2026-001",
      studentName: "Aarav Patel",
      compensationRequestId: "COMP-001",
      action: "Approved",
      actor: "Admin",
      timestamp: "2026-11-16T11:30:00Z",
      notes: "Slot allocated in Batch Alpha compensation window."
    }
  ],

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

  // Shared Synchronized Class Schedules (Admin, Super Coach & Coach Portals)
  classSchedules: [
    {
      id: "SCH-001",
      className: "Spartan Gymnastics & Agility - Evening Batch Alpha",
      program: "Spartan Gymnastics & Agility",
      batch: "Batch Alpha (Evening)",
      batchId: "B-KKN-GYM-1",
      location: "KK NAGAR",
      coachId: "COACH-001",
      coachName: "Coach Kabir Rao",
      additionalCoaches: [],
      date: "2026-11-22",
      weekday: "Sunday",
      weekdays: ["Sunday", "Tuesday", "Thursday"],
      startTime: "17:00",
      endTime: "18:00",
      timingDisplay: "5:00 PM – 6:00 PM",
      venue: "Training Court A",
      capacity: 15,
      enrolledCount: 12,
      status: "Scheduled",
      notes: "Focus on balance beams and floor tumbling drills."
    },
    {
      id: "SCH-002",
      className: "Junior Football Champions - Sunday Sprint Batch",
      program: "Junior Football Champions",
      batch: "Weekend Morning League",
      batchId: "B-KPK-FTB-1",
      location: "KILPAUK",
      coachId: "COACH-002",
      coachName: "Coach Vikram Singh",
      additionalCoaches: [],
      date: "2026-11-22",
      weekday: "Sunday",
      weekdays: ["Saturday", "Sunday"],
      startTime: "16:30",
      endTime: "17:30",
      timingDisplay: "4:30 PM – 5:30 PM",
      venue: "Main Turf Ground",
      capacity: 20,
      enrolledCount: 16,
      status: "Scheduled",
      notes: "Passing drills and mini 5v5 tactical match."
    },
    {
      id: "SCH-003",
      className: "Spartan Athletics & Sprinting - Junior Speedsters",
      program: "Spartan Athletics & Sprinting",
      batch: "Evening Agility Cohort",
      batchId: "B-MAH-ATH-1",
      location: "MAHALINGAPURAM",
      coachId: "COACH-003",
      coachName: "Coach Arumugam K",
      additionalCoaches: [],
      date: "2026-11-23",
      weekday: "Monday",
      weekdays: ["Monday", "Wednesday", "Friday"],
      startTime: "17:00",
      endTime: "18:00",
      timingDisplay: "5:00 PM – 6:00 PM",
      venue: "Practice Arena B",
      capacity: 18,
      enrolledCount: 14,
      status: "Scheduled",
      notes: "Sprint mechanics and acceleration technique."
    },
    {
      id: "SCH-004",
      className: "Basketball Rising Stars - Fundamentals & Dribbling",
      program: "Basketball Rising Stars",
      batch: "Evening Hoops",
      batchId: "B-ANN-BSK-1",
      location: "ANNA NAGAR",
      coachId: "COACH-004",
      coachName: "Coach Rajesh Kumar",
      additionalCoaches: [],
      date: "2026-11-22",
      weekday: "Sunday",
      weekdays: ["Sunday", "Wednesday"],
      startTime: "18:00",
      endTime: "19:00",
      timingDisplay: "6:00 PM – 7:00 PM",
      venue: "Training Court A",
      capacity: 15,
      enrolledCount: 11,
      status: "Scheduled",
      notes: "Defensive footwork and free throw drills."
    }
  ],

  // Shared Location-Isolated Student Attendance Records (Admin & Coach Portals)
  attendanceRecords: [
    {
      id: "ATT-001",
      studentId: "LS-KKN-2026-001",
      studentName: "Aarav Patel",
      batchId: "B-KKN-GYM-1",
      classId: "CLS-001",
      date: "2026-11-20",
      location: "KK NAGAR",
      status: "Present",
      markedBy: "COACH-001",
      markedAt: "2026-11-20T17:15:00Z"
    },
    {
      id: "ATT-002",
      studentId: "LS-KKN-2026-001",
      studentName: "Aarav Patel",
      batchId: "B-KKN-GYM-1",
      classId: "CLS-001",
      date: "2026-11-18",
      location: "KK NAGAR",
      status: "Present",
      markedBy: "COACH-001",
      markedAt: "2026-11-18T17:10:00Z"
    },
    {
      id: "ATT-003",
      studentId: "LS-KPK-2026-002",
      studentName: "Priya Sundaram",
      batchId: "B-KPK-FTB-1",
      classId: "CLS-002",
      date: "2026-11-21",
      location: "KILPAUK",
      status: "Present",
      markedBy: "COACH-002",
      markedAt: "2026-11-21T16:35:00Z"
    },
    {
      id: "ATT-004",
      studentId: "LS-MHP-2026-003",
      studentName: "Rohan Chandran",
      batchId: "B-MHP-ATH-1",
      classId: "CLS-003",
      date: "2026-11-21",
      location: "MAHALINGAPURAM",
      status: "Present",
      markedBy: "COACH-003",
      markedAt: "2026-11-21T17:05:00Z"
    }
  ],

  // Cross-Portal Real-Time Alerts (Admin <-> Parent <-> Coach)
  notifications: [
    {
      id: "NOTIF-001",
      title: "New Admission Lead",
      message: "Aarav Sharma enquiry registered for Little Cubs Multi-Sport at KK Nagar.",
      type: "enquiry",
      time: "10 mins ago",
      date: "2026-11-22",
      read: false,
      role: "admin"
    },
    {
      id: "NOTIF-002",
      title: "Demo Session Scheduled",
      message: "Trial session for Diya Raman confirmed for Gymnastics at KK Nagar on Nov 22, 5:00 PM.",
      type: "demo",
      time: "1 hour ago",
      date: "2026-11-22",
      read: false,
      role: "coach"
    },
    {
      id: "NOTIF-003",
      title: "Payment Received",
      message: "₹7,500 received from Rajesh Patel for Aarav Patel (Receipt #PAY-001).",
      type: "payment",
      time: "2 hours ago",
      date: "2026-11-21",
      read: true,
      role: "parent"
    }
  ],

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
  termsAcceptances: [
    {
      id: "ACC-001",
      userId: "LS-KKN-2026-001",
      userName: "Rajesh Patel",
      userEmail: "rajesh.patel@gmail.com",
      userRole: "parent",
      termsVersion: "1.0",
      dosDontsVersion: "1.0",
      termsAcceptedAt: "2026-11-19T10:30:00Z",
      ipAddress: "192.168.1.45",
      status: "Accepted"
    },
    {
      id: "ACC-002",
      userId: "LS-KPK-2026-002",
      userName: "Karthik Sundaram",
      userEmail: "karthik.s@gmail.com",
      userRole: "parent",
      termsVersion: "1.0",
      dosDontsVersion: "1.0",
      termsAcceptedAt: "2026-11-20T11:15:00Z",
      ipAddress: "192.168.1.88",
      status: "Accepted"
    },
    {
      id: "ACC-003",
      userId: "LS-MHP-2026-003",
      userName: "Lakshmi Chandran",
      userEmail: "lakshmi.c@gmail.com",
      userRole: "parent",
      termsVersion: "1.0",
      dosDontsVersion: "1.0",
      termsAcceptedAt: "2026-11-20T14:40:00Z",
      ipAddress: "192.168.1.92",
      status: "Accepted"
    }
  ]
};
