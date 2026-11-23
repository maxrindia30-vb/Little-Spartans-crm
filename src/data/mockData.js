// Clean Configuration for Little Spartans Sports Academy CRM
// All dummy student, coach, parent, enquiry, demo, payment, schedule, attendance, and notification records removed
// Operational records start at zero and are entered/managed dynamically through CRM portals.

import {
  TERMS_AND_CONDITIONS_DOC,
  PARENT_DOS_AND_DONTS_DOC,
} from './termsAndPoliciesContent';

export const initialAcademyData = {
  // Official Academy Details & Identity (Little Spartans Sports Academy)
  academy: {
    name: "Little Spartans Sports Academy",
    tagline: "Empowering Young Champions Through Sports & Discipline",
    phone: "+91 98765 43210",
    email: "contact@littlespartans.co.in",
    website: "https://www.littlespartans.co.in",
    centers: ["KK NAGAR", "KILPAUK", "MAHALINGAPURAM", "ANNA NAGAR", "KOLATHUR"],
    academicYear: "2026-2027"
  },

  // Official Sports Curriculum Catalog
    programs: [
    {
      id: "PROG-1",
      name: "Foundational Movement",
      subtitle: "Balance · Coordination · Movement",
      ageGroup: "Ages 3 – 5",
      minAge: 3,
      maxAge: 5,
      sessionsPerWeek: "2–3 sessions/week",
      studentsCount: 5,
      feeMonthly: 4000,
      icon: "Activity",
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
      description: "Age-appropriate physical literacy introducing agility obstacle drills, safe two-foot landing, and dynamic balance games.",
      skills: ["Body Control & Balance", "Safe Jumping & Landing", "Throwing & Catching", "Running Agility"],
      days: "Mon, Wed, Fri",
      location: "KK NAGAR"
    },
    {
      id: "PROG-2",
      name: "Football",
      subtitle: "Dribbling · Passing · Teamwork",
      ageGroup: "Ages 5 – 12",
      minAge: 5,
      maxAge: 12,
      sessionsPerWeek: "2–3 sessions/week",
      studentsCount: 12,
      feeMonthly: 4200,
      icon: "Trophy",
      image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&auto=format&fit=crop&q=80",
      description: "Grassroots football coaching developing ball mastery, directional control, short passes, and small-sided match awareness.",
      skills: ["Close Ball Dribbling", "First Touch Passing", "Target Shooting", "Tactical Positioning"],
      days: "Tue, Thu, Sat",
      location: "KK NAGAR"
    },
    {
      id: "PROG-3",
      name: "Basketball",
      subtitle: "Dribbling · Shooting · Agility",
      ageGroup: "Ages 7 – 14",
      minAge: 7,
      maxAge: 14,
      sessionsPerWeek: "2–3 sessions/week",
      studentsCount: 8,
      feeMonthly: 4500,
      icon: "Zap",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80",
      description: "Fundamental basketball mechanics including crossover dribbling, shooting form, defensive footwork, and fast-break decision making.",
      skills: ["Crossover Dribbling", "Shooting Mechanics", "Court Footwork", "Rebound & Fast Break"],
      days: "Mon, Wed, Fri",
      location: "KK NAGAR"
    },
    {
      id: "PROG-4",
      name: "Athletics",
      subtitle: "Running · Jumping · Speed",
      ageGroup: "Ages 6 – 14",
      minAge: 6,
      maxAge: 14,
      sessionsPerWeek: "2–3 sessions/week",
      studentsCount: 10,
      feeMonthly: 3800,
      icon: "Award",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80",
      description: "Track and field athletics training building explosive sprint mechanics, stride posture, hurdle jumps, and endurance resilience.",
      skills: ["Sprint Acceleration", "Long Jump Technique", "Endurance Pacing", "Ladder & Cone Agility"],
      days: "Tue, Thu, Sat",
      location: "KK NAGAR"
    }
  ],

  // Operational Data: All start clean with ZERO dummy records
  classes: [
    {
        "id": "BATCH-LE-B1",
        "name": "LE - B1",
        "program": "Foundational Movement",
        "center": "KK NAGAR",
        "coachId": "COACH-ARUN",
        "coach": "Arun Prakash",
        "coachName": "Arun Prakash",
        "coach2Id": "COACH-SAM",
        "coach2Name": "Coach Sam",
        "schedule": "Mon, Wed, Fri 4:00 PM - 5:00 PM",
        "capacity": 15,
        "enrolledCount": 5,
        "status": "Active"
    },
    {
        "id": "BATCH-LE-B2",
        "name": "LE - B2",
        "program": "Spartan Athletics & Sprinting",
        "center": "KK NAGAR",
        "coachId": "COACH-ARUN",
        "coach": "Arun Prakash",
        "coachName": "Arun Prakash",
        "schedule": "Tue, Thu, Sat 4:30 PM - 5:30 PM",
        "capacity": 15,
        "enrolledCount": 6,
        "status": "Active"
    },
    {
        "id": "BATCH-FB-KKN1",
        "name": "FB - KKN1",
        "program": "Junior Football Champions",
        "center": "KK NAGAR",
        "coachId": "COACH-SAM",
        "coach": "Coach Sam",
        "coachName": "Coach Sam",
        "schedule": "Sat, Sun 7:00 AM - 8:30 AM",
        "capacity": 18,
        "enrolledCount": 10,
        "status": "Active"
    },
    {
        "id": "BATCH-GYM-KKN1",
        "name": "GYM - KKN1",
        "program": "Spartan Gymnastics & Agility",
        "center": "KK NAGAR",
        "coachId": "COACH-ARUN",
        "coach": "Arun Prakash",
        "coachName": "Arun Prakash",
        "schedule": "Mon, Wed 5:30 PM - 6:30 PM",
        "capacity": 12,
        "enrolledCount": 8,
        "status": "Active"
    },
    {
        "id": "BATCH-FB-B1",
        "name": "FB - B1",
        "program": "Junior Football Champions",
        "center": "ANNA NAGAR",
        "coachId": "COACH-DIVYA",
        "coach": "Divya R",
        "coachName": "Divya R",
        "schedule": "Tue, Thu, Sat 5:00 PM - 6:00 PM",
        "capacity": 16,
        "enrolledCount": 12,
        "status": "Active"
    },
    {
        "id": "BATCH-ATH-AN1",
        "name": "ATH - AN1",
        "program": "Spartan Athletics & Sprinting",
        "center": "ANNA NAGAR",
        "coachId": "COACH-DIVYA",
        "coach": "Divya R",
        "coachName": "Divya R",
        "schedule": "Mon, Wed, Fri 6:00 PM - 7:00 PM",
        "capacity": 15,
        "enrolledCount": 9,
        "status": "Active"
    },
    {
        "id": "BATCH-MCS-AN1",
        "name": "MCS - AN1",
        "program": "Little Cubs Multi-Sport",
        "center": "ANNA NAGAR",
        "coachId": "COACH-DIVYA",
        "coach": "Divya R",
        "coachName": "Divya R",
        "schedule": "Sat, Sun 8:30 AM - 9:30 AM",
        "capacity": 14,
        "enrolledCount": 11,
        "status": "Active"
    },
    {
        "id": "BATCH-BB-B1",
        "name": "BB - B1",
        "program": "Basketball Rising Stars",
        "center": "KILPAUK",
        "coachId": "COACH-VIGNESH",
        "coach": "Vignesh K",
        "coachName": "Vignesh K",
        "schedule": "Mon, Wed, Fri 5:00 PM - 6:00 PM",
        "capacity": 15,
        "enrolledCount": 12,
        "status": "Active"
    },
    {
        "id": "BATCH-MV-B1",
        "name": "MV - B1",
        "program": "Foundational Movement",
        "center": "KILPAUK",
        "coachId": "COACH-VIGNESH",
        "coach": "Vignesh K",
        "coachName": "Vignesh K",
        "schedule": "Tue, Thu, Sat 4:00 PM - 5:00 PM",
        "capacity": 15,
        "enrolledCount": 8,
        "status": "Active"
    },
    {
        "id": "BATCH-FM-B1",
        "name": "FM - B1",
        "program": "Foundational Movement",
        "center": "MAHALINGAPURAM",
        "coachId": "COACH-KEERTHANA",
        "coach": "Keerthana S",
        "coachName": "Keerthana S",
        "schedule": "Mon, Wed, Fri 4:00 PM - 5:00 PM",
        "capacity": 15,
        "enrolledCount": 7,
        "status": "Active"
    },
    {
        "id": "BATCH-GYM-MHP1",
        "name": "GYM - MHP1",
        "program": "Spartan Gymnastics & Agility",
        "center": "MAHALINGAPURAM",
        "coachId": "COACH-KEERTHANA",
        "coach": "Keerthana S",
        "coachName": "Keerthana S",
        "schedule": "Tue, Thu 5:00 PM - 6:00 PM",
        "capacity": 12,
        "enrolledCount": 6,
        "status": "Active"
    },
    {
        "id": "BATCH-FB-MHP1",
        "name": "FB - MHP1",
        "program": "Junior Football Champions",
        "center": "MAHALINGAPURAM",
        "coachId": "COACH-KEERTHANA",
        "coach": "Keerthana S",
        "coachName": "Keerthana S",
        "schedule": "Sat, Sun 7:30 AM - 9:00 AM",
        "capacity": 16,
        "enrolledCount": 10,
        "status": "Active"
    }
],
  coaches: [
    {
        "id": "COACH-ARUN",
        "name": "Arun Prakash",
        "role": "Senior Coach",
        "specialization": "Movement & Athletics",
        "phone": "+91 98401 11223",
        "email": "arun.prakash@littlespartans.co.in",
        "center": "KK NAGAR",
        "assignedLocations": [
            "KK NAGAR",
            "KILPAUK"
        ],
        "programs": [
            "Foundational Movement",
            "Spartan Athletics & Sprinting"
        ],
        "assignedBatches": [
            "LE - B1",
            "LE - B2"
        ],
        "sessions": 24,
        "attendance": 96,
        "rating": 4.9,
        "status": "Active",
        "evaluationStatus": "Up to Date",
        "pendingEvaluationsCount": 0,
        "certification": "NIS Certified Athletics Specialist, Level 2",
        "experience": "6+ Yrs",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
        "id": "COACH-DIVYA",
        "name": "Divya R",
        "role": "Coach",
        "specialization": "Football",
        "phone": "+91 98402 22334",
        "email": "divya.r@littlespartans.co.in",
        "center": "ANNA NAGAR",
        "assignedLocations": [
            "ANNA NAGAR"
        ],
        "programs": [
            "Junior Football Champions"
        ],
        "assignedBatches": [
            "FB - B1"
        ],
        "sessions": 18,
        "attendance": 94,
        "rating": 4.8,
        "status": "Active",
        "evaluationStatus": "Pending (2)",
        "pendingEvaluationsCount": 2,
        "certification": "AIFF 'C' License Certified",
        "experience": "4+ Yrs",
        "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    },
    {
        "id": "COACH-VIGNESH",
        "name": "Vignesh K",
        "role": "Coach",
        "specialization": "Basketball",
        "phone": "+91 98403 33445",
        "email": "vignesh.k@littlespartans.co.in",
        "center": "KILPAUK",
        "assignedLocations": [
            "KILPAUK"
        ],
        "programs": [
            "Basketball Rising Stars",
            "Foundational Movement"
        ],
        "assignedBatches": [
            "BB - B1",
            "MV - B1"
        ],
        "sessions": 20,
        "attendance": 92,
        "rating": 4.7,
        "status": "Active",
        "evaluationStatus": "Up to Date",
        "pendingEvaluationsCount": 0,
        "certification": "BFI Level 1 Certified Basketball Coach",
        "experience": "5+ Yrs",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    {
        "id": "COACH-KEERTHANA",
        "name": "Keerthana S",
        "role": "Coach",
        "specialization": "Foundational Movement",
        "phone": "+91 98404 44556",
        "email": "keerthana.s@littlespartans.co.in",
        "center": "MAHALINGAPURAM",
        "assignedLocations": [
            "MAHALINGAPURAM"
        ],
        "programs": [
            "Foundational Movement"
        ],
        "assignedBatches": [
            "FM - B1"
        ],
        "sessions": 22,
        "attendance": 95,
        "rating": 4.9,
        "status": "Active",
        "evaluationStatus": "Review Due",
        "pendingEvaluationsCount": 1,
        "certification": "Child Physical Literacy Specialist",
        "experience": "3+ Yrs",
        "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
    },
    {
        "id": "COACH-SAM",
        "name": "Coach Sam",
        "role": "Lead Coach",
        "specialization": "Foundational Movement",
        "phone": "+91 98765 43210",
        "email": "coach.sam@littlespartans.co.in",
        "center": "KK NAGAR",
        "assignedLocations": [
            "KK NAGAR",
            "KILPAUK"
        ],
        "programs": [
            "Foundational Movement",
            "Junior Football Champions"
        ],
        "assignedBatches": [
            "LE - B1",
            "FB - KKN1"
        ],
        "sessions": 24,
        "attendance": 97,
        "rating": 4.9,
        "status": "Active",
        "evaluationStatus": "Up to Date",
        "pendingEvaluationsCount": 0,
        "certification": "Youth Athletic Development Certified",
        "experience": "5+ Yrs",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    }
],
  students: [
    {
      id: "STU-LS-001",
      rollNo: "LS001",
      name: "Priya S",
      age: 5,
      gender: "Female",
      center: "KK NAGAR",
      program: "Foundational Movement",
      batch: "LE - B1",
      coachId: "COACH-SAM",
      coachName: "Coach Sam",
      avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80",
      enrolledClasses: ["LE - B1"],
      status: "Active",
      parentName: "Senthil S",
      parentPhone: "+91 98765 00001",
      parentEmail: "parent.priya@littlespartans.co.in"
    },
    {
            "id": "COACH-KARTHIK-N",
            "name": "Karthik Narayanan",
            "role": "Senior Coach",
            "specialization": "Football",
            "phone": "+91 98405 55667",
            "email": "karthik.n@littlespartans.co.in",
            "center": "ANNA NAGAR",
            "assignedLocations": [
                    "ANNA NAGAR"
            ],
            "programs": [
                    "Junior Football Champions"
            ],
            "assignedBatches": [
                    "FB - B1"
            ],
            "sessions": 18,
            "attendance": 95,
            "rating": 4.9,
            "status": "Active",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "AFC 'B' Diploma",
            "experience": "7+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-MEENAKSHI-S",
            "name": "Meenakshi Sundaram",
            "role": "Coach",
            "specialization": "Gymnastics & Agility",
            "phone": "+91 98406 66778",
            "email": "meenakshi.s@littlespartans.co.in",
            "center": "KK NAGAR",
            "assignedLocations": [
                    "KK NAGAR"
            ],
            "programs": [
                    "Spartan Gymnastics & Agility"
            ],
            "assignedBatches": [
                    "LE - B1"
            ],
            "sessions": 20,
            "attendance": 96,
            "rating": 4.8,
            "status": "Active",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "National Gymnastics Coach",
            "experience": "4+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-DEEPA-R",
            "name": "Deepa Ramesh",
            "role": "Coach",
            "specialization": "Foundational Movement",
            "phone": "+91 98407 77889",
            "email": "deepa.r@littlespartans.co.in",
            "center": "MAHALINGAPURAM",
            "assignedLocations": [
                    "MAHALINGAPURAM"
            ],
            "programs": [
                    "Foundational Movement"
            ],
            "assignedBatches": [
                    "FM - B1"
            ],
            "sessions": 22,
            "attendance": 94,
            "rating": 4.9,
            "status": "Active",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "Child Movement Specialist",
            "experience": "5+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-ARVIND-S",
            "name": "Arvind Swamy",
            "role": "Coach",
            "specialization": "Basketball",
            "phone": "+91 98408 88990",
            "email": "arvind.s@littlespartans.co.in",
            "center": "KILPAUK",
            "assignedLocations": [
                    "KILPAUK"
            ],
            "programs": [
                    "Basketball Rising Stars"
            ],
            "assignedBatches": [
                    "BB - B1"
            ],
            "sessions": 19,
            "attendance": 93,
            "rating": 4.8,
            "status": "Active",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "State Basketball Coach",
            "experience": "4+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-HARISH-K",
            "name": "Harish Kumar",
            "role": "Coach",
            "specialization": "Athletics & Sprinting",
            "phone": "+91 98409 99001",
            "email": "harish.k@littlespartans.co.in",
            "center": "KK NAGAR",
            "assignedLocations": [
                    "KK NAGAR"
            ],
            "programs": [
                    "Spartan Athletics & Sprinting"
            ],
            "assignedBatches": [
                    "ATH - KKN1"
            ],
            "sessions": 21,
            "attendance": 97,
            "rating": 4.9,
            "status": "Active",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "Track & Field Coach",
            "experience": "5+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-POOJA-S",
            "name": "Pooja Sundar",
            "role": "Coach",
            "specialization": "Foundational Movement",
            "phone": "+91 98410 11223",
            "email": "pooja.s@littlespartans.co.in",
            "center": "ANNA NAGAR",
            "assignedLocations": [
                    "ANNA NAGAR"
            ],
            "programs": [
                    "Foundational Movement"
            ],
            "assignedBatches": [
                    "FB - B1"
            ],
            "sessions": 18,
            "attendance": 95,
            "rating": 4.9,
            "status": "Active",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "Movement Educator",
            "experience": "3+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-ASHWIN-B",
            "name": "Ashwin Balaji",
            "role": "Coach",
            "specialization": "Football",
            "phone": "+91 98411 22334",
            "email": "ashwin.b@littlespartans.co.in",
            "center": "KILPAUK",
            "assignedLocations": [
                    "KILPAUK"
            ],
            "programs": [
                    "Junior Football Champions"
            ],
            "assignedBatches": [
                    "MV - B1"
            ],
            "sessions": 20,
            "attendance": 94,
            "rating": 4.8,
            "status": "Active",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "Grassroots Football Leader",
            "experience": "4+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-SNEHA-I",
            "name": "Sneha Iyer",
            "role": "Coach",
            "specialization": "Gymnastics & Agility",
            "phone": "+91 98412 33445",
            "email": "sneha.i@littlespartans.co.in",
            "center": "MAHALINGAPURAM",
            "assignedLocations": [
                    "MAHALINGAPURAM"
            ],
            "programs": [
                    "Spartan Gymnastics & Agility"
            ],
            "assignedBatches": [
                    "GYM - MHP1"
            ],
            "sessions": 22,
            "attendance": 96,
            "rating": 4.9,
            "status": "Active",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "Agility Specialist",
            "experience": "4+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-VARUN-P",
            "name": "Varun Prasad",
            "role": "Coach",
            "specialization": "Athletics & Sprinting",
            "phone": "+91 98413 44556",
            "email": "varun.p@littlespartans.co.in",
            "center": "KK NAGAR",
            "assignedLocations": [
                    "KK NAGAR"
            ],
            "programs": [
                    "Spartan Athletics & Sprinting"
            ],
            "assignedBatches": [
                    "ATH - KKN1"
            ],
            "sessions": 20,
            "attendance": 95,
            "rating": 4.8,
            "status": "Active",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "Athletics Coach",
            "experience": "3+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-ROHIT-V",
            "name": "Rohit Verma",
            "role": "Coach",
            "specialization": "Basketball",
            "phone": "+91 98414 55667",
            "email": "rohit.v@littlespartans.co.in",
            "center": "ANNA NAGAR",
            "assignedLocations": [
                    "ANNA NAGAR"
            ],
            "programs": [
                    "Basketball Rising Stars"
            ],
            "assignedBatches": [
                    "BB - AN1"
            ],
            "sessions": 18,
            "attendance": 96,
            "rating": 4.9,
            "status": "Active",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "Youth Basketball Specialist",
            "experience": "5+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-PRIYA-V",
            "name": "Priya Venkataraman",
            "role": "Coach",
            "specialization": "Foundational Movement",
            "phone": "+91 98415 66778",
            "email": "priya.v@littlespartans.co.in",
            "center": "KILPAUK",
            "assignedLocations": [
                    "KILPAUK"
            ],
            "programs": [
                    "Foundational Movement"
            ],
            "assignedBatches": [
                    "MV - B1"
            ],
            "sessions": 21,
            "attendance": 95,
            "rating": 4.9,
            "status": "Active",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "Early Childhood Physical Educator",
            "experience": "4+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-NAVEEN-R",
            "name": "Naveen Raj",
            "role": "Coach",
            "specialization": "Gymnastics & Agility",
            "phone": "+91 98416 77889",
            "email": "naveen.r@littlespartans.co.in",
            "center": "MAHALINGAPURAM",
            "assignedLocations": [
                    "MAHALINGAPURAM"
            ],
            "programs": [
                    "Spartan Gymnastics & Agility"
            ],
            "assignedBatches": [
                    "GYM - MHP1"
            ],
            "sessions": 20,
            "attendance": 94,
            "rating": 4.8,
            "status": "Active",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "Acrobatics & Agility Coach",
            "experience": "3+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-ANANYA-K",
            "name": "Ananya Krishnan",
            "role": "Coach",
            "specialization": "Football",
            "phone": "+91 98417 88990",
            "email": "ananya.k@littlespartans.co.in",
            "center": "KK NAGAR",
            "assignedLocations": [
                    "KK NAGAR"
            ],
            "programs": [
                    "Junior Football Champions"
            ],
            "assignedBatches": [
                    "FB - KKN1"
            ],
            "sessions": 22,
            "attendance": 96,
            "rating": 4.9,
            "status": "Active",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "Youth Football Coach",
            "experience": "4+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-SPEC-VIKRAM",
            "name": "Dr. Vikram Sen",
            "role": "Visiting Specialist",
            "specialization": "Sports Physiotherapy",
            "phone": "+91 98418 99001",
            "email": "dr.vikram@littlespartans.co.in",
            "center": "KK NAGAR",
            "assignedLocations": [
                    "KK NAGAR"
            ],
            "programs": [
                    "Foundational Movement"
            ],
            "assignedBatches": [
                    "LE - B1"
            ],
            "sessions": 8,
            "attendance": 98,
            "rating": 5,
            "status": "On Leave",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "Certified Sports Physiotherapist & Specialist",
            "experience": "10+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-SPEC-SHALINI",
            "name": "Shalini Menon",
            "role": "Visiting Specialist",
            "specialization": "Child Biomechanics",
            "phone": "+91 98419 11223",
            "email": "shalini.m@littlespartans.co.in",
            "center": "ANNA NAGAR",
            "assignedLocations": [
                    "ANNA NAGAR"
            ],
            "programs": [
                    "Foundational Movement"
            ],
            "assignedBatches": [
                    "FB - B1"
            ],
            "sessions": 6,
            "attendance": 97,
            "rating": 4.9,
            "status": "On Leave",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "Certified Child Biomechanics Specialist",
            "experience": "8+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-SPEC-RAJESH",
            "name": "Rajesh Kannan",
            "role": "Visiting Specialist",
            "specialization": "Strength & Conditioning",
            "phone": "+91 98420 22334",
            "email": "rajesh.k@littlespartans.co.in",
            "center": "KILPAUK",
            "assignedLocations": [
                    "KILPAUK"
            ],
            "programs": [
                    "Basketball Rising Stars"
            ],
            "assignedBatches": [
                    "BB - B1"
            ],
            "sessions": 10,
            "attendance": 96,
            "rating": 4.9,
            "status": "Inactive",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "Certified Strength & Conditioning Specialist",
            "experience": "9+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-SPEC-GOWTHAM",
            "name": "Gowtham Mani",
            "role": "Visiting Specialist",
            "specialization": "Speed & Agility",
            "phone": "+91 98421 33445",
            "email": "gowtham.m@littlespartans.co.in",
            "center": "MAHALINGAPURAM",
            "assignedLocations": [
                    "MAHALINGAPURAM"
            ],
            "programs": [
                    "Spartan Gymnastics & Agility"
            ],
            "assignedBatches": [
                    "FM - B1"
            ],
            "sessions": 8,
            "attendance": 95,
            "rating": 4.8,
            "status": "Inactive",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "Certified Speed & Agility Specialist",
            "experience": "7+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-SPEC-BHAVANI",
            "name": "Bhavani Shankar",
            "role": "Visiting Specialist",
            "specialization": "Gymnastics Technical",
            "phone": "+91 98422 44556",
            "email": "bhavani.s@littlespartans.co.in",
            "center": "KK NAGAR",
            "assignedLocations": [
                    "KK NAGAR"
            ],
            "programs": [
                    "Spartan Gymnastics & Agility"
            ],
            "assignedBatches": [
                    "LE - B1"
            ],
            "sessions": 8,
            "attendance": 97,
            "rating": 4.9,
            "status": "On Leave",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "Certified Gymnastics Technical Specialist",
            "experience": "8+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
    },
    {
            "id": "COACH-SPEC-MANOJ",
            "name": "Manoj Prabhakar",
            "role": "Visiting Specialist",
            "specialization": "Athletic Assessment",
            "phone": "+91 98423 55667",
            "email": "manoj.p@littlespartans.co.in",
            "center": "ANNA NAGAR",
            "assignedLocations": [
                    "ANNA NAGAR"
            ],
            "programs": [
                    "Junior Football Champions"
            ],
            "assignedBatches": [
                    "FB - B1"
            ],
            "sessions": 6,
            "attendance": 96,
            "rating": 4.9,
            "status": "Inactive",
            "evaluationStatus": "Up to Date",
            "pendingEvaluationsCount": 0,
            "certification": "Certified Athletic Performance Specialist",
            "experience": "11+ Yrs",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "STU-LS-002",
      rollNo: "LS002",
      name: "Aarav K",
      age: 5,
      gender: "Male",
      center: "KK NAGAR",
      program: "Foundational Movement",
      batch: "LE - B1",
      coachId: "COACH-SAM",
      coachName: "Coach Sam",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
      enrolledClasses: ["LE - B1"],
      status: "Active",
      parentName: "Karthik K",
      parentPhone: "+91 98765 00002",
      parentEmail: "parent.aarav@littlespartans.co.in",
      evaluations: {
        balance: 80,
        jumping: 75,
        throwing: 85,
        running: 78,
        overall: 86,
        remark: "Shows excellent agility, balance and listening focus."
      },
      badgesCount: 6,
      milestonesCount: 3,
      certificatesCount: 2,
      overallProgress: 86
    },
    {
      id: "STU-LS-003",
      rollNo: "LS003",
      name: "Rohan M",
      age: 4,
      gender: "Male",
      center: "KK NAGAR",
      program: "Foundational Movement",
      batch: "LE - B1",
      coachId: "COACH-SAM",
      coachName: "Coach Sam",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
      enrolledClasses: ["LE - B1"],
      status: "Active",
      parentName: "Murugan M",
      parentPhone: "+91 98765 00003",
      parentEmail: "parent.rohan@littlespartans.co.in"
    },
    {
      id: "STU-LS-004",
      rollNo: "LS004",
      name: "Diya R",
      age: 5,
      gender: "Female",
      center: "KK NAGAR",
      program: "Foundational Movement",
      batch: "LE - B1",
      coachId: "COACH-SAM",
      coachName: "Coach Sam",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      enrolledClasses: ["LE - B1"],
      status: "Active",
      parentName: "Ramesh R",
      parentPhone: "+91 98765 00004",
      parentEmail: "parent.diya@littlespartans.co.in"
    },
    {
      id: "STU-LS-005",
      rollNo: "LS005",
      name: "Vivaan P",
      age: 5,
      gender: "Male",
      center: "KK NAGAR",
      program: "Foundational Movement",
      batch: "LE - B1",
      coachId: "COACH-SAM",
      coachName: "Coach Sam",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      enrolledClasses: ["LE - B1"],
      status: "Active",
      parentName: "Prakash P",
      parentPhone: "+91 98765 00005",
      parentEmail: "parent.vivaan@littlespartans.co.in"
    }
  ],
    parents: [
    {
      id: "PAR-002",
      name: "Karthik K",
      email: "parent.aarav@littlespartans.co.in",
      phone: "+91 98765 00002",
      center: "KK NAGAR",
      children: ["Aarav K"],
      linkedStudentIds: ["STU-LS-002"],
      status: "Active"
    }
  ],
  enquiries: [
    {
      id: "ENQ-0285",
      childName: "Kabir Sundaram",
      childAge: 7,
      dob: "2019-06-18",
      gender: "Male",
      parentName: "Meenakshi Sundaram",
      phone: "+91 98401 23456",
      email: "meenakshi.s@gmail.com",
      center: "KK NAGAR",
      location: "KK NAGAR",
      interestedProgram: "Junior Football Champions",
      program: "Junior Football Champions",
      stage: "New",
      status: "Active",
      enquiryDate: "2026-11-22",
      createdAt: "2026-11-22T09:30:00.000Z",
      lastParentResponse: "2026-11-22",
      source: "Phone Inquiry",
      notes: "Parent called regarding weekend football batch at KK Nagar."
    },
    {
      id: "ENQ-0287",
      childName: "Tanya Nambiar",
      childAge: 6,
      dob: "2020-07-25",
      gender: "Female",
      parentName: "Rajesh Nambiar",
      phone: "+91 98403 45678",
      email: "rajesh.n@gmail.com",
      center: "KOLATHUR",
      location: "KOLATHUR",
      interestedProgram: "Basketball Rising Stars",
      program: "Basketball Rising Stars",
      stage: "New",
      status: "Active",
      enquiryDate: "2026-11-22",
      createdAt: "2026-11-22T17:15:00.000Z",
      lastParentResponse: "2026-11-22",
      source: "Website",
      notes: "Enquired about evening basketball coaching at Kolathur."
    },
    {
      id: "ENQ-0286",
      childName: "Rithvik Menon",
      childAge: 5,
      dob: "2021-02-14",
      gender: "Male",
      parentName: "Anand Menon",
      phone: "+91 98402 34567",
      email: "anand.menon@gmail.com",
      center: "ANNA NAGAR",
      location: "ANNA NAGAR",
      interestedProgram: "Spartan Athletics & Sprinting",
      program: "Spartan Athletics & Sprinting",
      stage: "New",
      status: "Active",
      enquiryDate: "2026-11-21",
      createdAt: "2026-11-21T14:45:00.000Z",
      lastParentResponse: "2026-11-21",
      source: "Instagram",
      notes: "Interested in athletics sprinting and stamina building."
    },
    {
      id: "ENQ-0284",
      childName: "Aarav Krishna",
      childAge: 6,
      dob: "2020-04-12",
      gender: "Male",
      parentName: "Rohit Krishna",
      phone: "+91 98765 43210",
      email: "rohit.krishna@gmail.com",
      center: "KK NAGAR",
      location: "KK NAGAR",
      interestedProgram: "Junior Football Champions",
      program: "Junior Football Champions",
      stage: "Demo Completed",
      status: "Demo Attended",
      demoId: "DEMO-0284",
      enquiryDate: "2026-11-20",
      createdAt: "2026-11-20T10:15:00.000Z",
      lastParentResponse: "2026-11-21",
      source: "Website",
      notes: "Attended football demo at KK Nagar turf, coach feedback excellent."
    },
    {
      id: "ENQ-0283",
      childName: "Kiara Mehta",
      childAge: 5,
      dob: "2021-05-20",
      gender: "Female",
      parentName: "Anita Mehta",
      phone: "+91 99876 54321",
      email: "anita.mehta@gmail.com",
      center: "ANNA NAGAR",
      location: "ANNA NAGAR",
      interestedProgram: "Little Cubs Multi-Sport",
      program: "Little Cubs Multi-Sport",
      stage: "Demo Scheduled",
      status: "Demo Requested",
      demoId: "DEMO-0283",
      enquiryDate: "2026-11-18",
      createdAt: "2026-11-18T11:20:00.000Z",
      lastParentResponse: "2026-11-19",
      source: "WhatsApp",
      notes: "Demo requested for weekend session."
    },
    {
      id: "ENQ-0282",
      childName: "Vihaan Raj",
      childAge: 8,
      dob: "2018-09-08",
      gender: "Male",
      parentName: "Suresh Raj",
      phone: "+91 91234 56789",
      email: "suresh.raj@gmail.com",
      center: "KILPAUK",
      location: "KILPAUK",
      interestedProgram: "Basketball Rising Stars",
      program: "Basketball Rising Stars",
      stage: "Follow-up Required",
      status: "Stale",
      enquiryDate: "2026-11-05",
      createdAt: "2026-11-05T16:10:00.000Z",
      lastParentResponse: "2026-11-10",
      source: "Website",
      notes: "Awaiting parent confirmation for batch timing."
    },
    {
      id: "ENQ-0281",
      childName: "Myra Sharma",
      childAge: 4,
      dob: "2022-08-11",
      gender: "Female",
      parentName: "Pooja Sharma",
      phone: "+91 98700 11223",
      email: "pooja.sharma@gmail.com",
      center: "MAHALINGAPURAM",
      location: "MAHALINGAPURAM",
      interestedProgram: "Spartan Gymnastics & Agility",
      program: "Spartan Gymnastics & Agility",
      stage: "Lost",
      status: "Lost",
      enquiryDate: "2026-10-28",
      createdAt: "2026-10-28T12:00:00.000Z",
      lastParentResponse: "2026-11-02",
      source: "Manual / Walk-in",
      notes: "Relocating to another city."
    },
    {
          "id": "ENQ-0288",
          "childName": "Advait Nair",
          "childAge": 6,
          "dob": "2020-05-14",
          "gender": "Male",
          "parentName": "Harish Nair",
          "phone": "+91 98404 12345",
          "email": "harish.nair@gmail.com",
          "center": "KK NAGAR",
          "location": "KK NAGAR",
          "interestedProgram": "Spartan Gymnastics & Agility",
          "program": "Spartan Gymnastics & Agility",
          "stage": "New",
          "status": "Active",
          "enquiryDate": "2026-11-22",
          "createdAt": "2026-11-22T11:00:00.000Z",
          "lastParentResponse": "2026-11-22",
          "source": "Website",
          "notes": "Interested in agility and gymnastics training for 6-year-old."
    },
    {
          "id": "ENQ-0289",
          "childName": "Tanmay Gowda",
          "childAge": 8,
          "dob": "2018-08-22",
          "gender": "Male",
          "parentName": "Prakash Gowda",
          "phone": "+91 98405 23456",
          "email": "prakash.g@gmail.com",
          "center": "KK NAGAR",
          "location": "KK NAGAR",
          "interestedProgram": "Spartan Athletics & Sprinting",
          "program": "Spartan Athletics & Sprinting",
          "stage": "New",
          "status": "Active",
          "enquiryDate": "2026-11-21",
          "createdAt": "2026-11-21T16:30:00.000Z",
          "lastParentResponse": "2026-11-21",
          "source": "Phone Inquiry",
          "notes": "Parent enquired about track sprinting techniques at KK Nagar."
    },
    {
          "id": "ENQ-0290",
          "childName": "Ananya Raman",
          "childAge": 6,
          "dob": "2020-03-10",
          "gender": "Female",
          "parentName": "Sridhar Raman",
          "phone": "+91 98406 34567",
          "email": "sridhar.r@gmail.com",
          "center": "ANNA NAGAR",
          "location": "ANNA NAGAR",
          "interestedProgram": "Junior Football Champions",
          "program": "Junior Football Champions",
          "stage": "New",
          "status": "Active",
          "enquiryDate": "2026-11-22",
          "createdAt": "2026-11-22T14:20:00.000Z",
          "lastParentResponse": "2026-11-22",
          "source": "Website",
          "notes": "Online inquiry for weekend football training at Anna Nagar."
    },
    {
          "id": "ENQ-0291",
          "childName": "Gautham Sundar",
          "childAge": 7,
          "dob": "2019-11-05",
          "gender": "Male",
          "parentName": "Suresh Sundar",
          "phone": "+91 98407 45678",
          "email": "suresh.s@gmail.com",
          "center": "ANNA NAGAR",
          "location": "ANNA NAGAR",
          "interestedProgram": "Basketball Rising Stars",
          "program": "Basketball Rising Stars",
          "stage": "New",
          "status": "Active",
          "enquiryDate": "2026-11-20",
          "createdAt": "2026-11-20T09:45:00.000Z",
          "lastParentResponse": "2026-11-21",
          "source": "Instagram",
          "notes": "Inquired via Instagram DM regarding Anna Nagar basketball coaching."
    },
    {
          "id": "ENQ-0292",
          "childName": "Siddharth Balaji",
          "childAge": 7,
          "dob": "2019-07-19",
          "gender": "Male",
          "parentName": "Gautam Balaji",
          "phone": "+91 98408 56789",
          "email": "gautam.b@gmail.com",
          "center": "KILPAUK",
          "location": "KILPAUK",
          "interestedProgram": "Basketball Rising Stars",
          "program": "Basketball Rising Stars",
          "stage": "New",
          "status": "Active",
          "enquiryDate": "2026-11-22",
          "createdAt": "2026-11-22T15:10:00.000Z",
          "lastParentResponse": "2026-11-22",
          "source": "Website",
          "notes": "Parent filled enquiry form for Kilpauk basketball academy."
    },
    {
          "id": "ENQ-0293",
          "childName": "Varun Narayanan",
          "childAge": 6,
          "dob": "2020-09-30",
          "gender": "Male",
          "parentName": "Narayanan K",
          "phone": "+91 98409 67890",
          "email": "narayanan.k@gmail.com",
          "center": "KILPAUK",
          "location": "KILPAUK",
          "interestedProgram": "Spartan Athletics & Sprinting",
          "program": "Spartan Athletics & Sprinting",
          "stage": "New",
          "status": "Active",
          "enquiryDate": "2026-11-21",
          "createdAt": "2026-11-21T11:15:00.000Z",
          "lastParentResponse": "2026-11-21",
          "source": "WhatsApp",
          "notes": "Enquired about Kilpauk morning athletics batch."
    },
    {
          "id": "ENQ-0294",
          "childName": "Diya Krishnan",
          "childAge": 5,
          "dob": "2021-01-15",
          "gender": "Female",
          "parentName": "Ramesh Krishnan",
          "phone": "+91 98410 78901",
          "email": "ramesh.k@gmail.com",
          "center": "MAHALINGAPURAM",
          "location": "MAHALINGAPURAM",
          "interestedProgram": "Foundational Movement",
          "program": "Foundational Movement",
          "stage": "New",
          "status": "Active",
          "enquiryDate": "2026-11-22",
          "createdAt": "2026-11-22T10:30:00.000Z",
          "lastParentResponse": "2026-11-22",
          "source": "Phone Inquiry",
          "notes": "Parent called asking for foundational balance classes at Mahalingapuram."
    },
    {
          "id": "ENQ-0295",
          "childName": "Kavya Srinivasan",
          "childAge": 6,
          "dob": "2020-12-04",
          "gender": "Female",
          "parentName": "Raghav Srinivasan",
          "phone": "+91 98411 89012",
          "email": "raghav.s@gmail.com",
          "center": "MAHALINGAPURAM",
          "location": "MAHALINGAPURAM",
          "interestedProgram": "Spartan Athletics & Sprinting",
          "program": "Spartan Athletics & Sprinting",
          "stage": "New",
          "status": "Active",
          "enquiryDate": "2026-11-21",
          "createdAt": "2026-11-21T18:00:00.000Z",
          "lastParentResponse": "2026-11-21",
          "source": "Website",
          "notes": "Athletics inquiry from Mahalingapuram resident."
    },
    {
          "id": "ENQ-0296",
          "childName": "Arjun Pillai",
          "childAge": 7,
          "dob": "2019-04-28",
          "gender": "Male",
          "parentName": "Madhavan Pillai",
          "phone": "+91 98412 90123",
          "email": "madhavan.p@gmail.com",
          "center": "KOLATHUR",
          "location": "KOLATHUR",
          "interestedProgram": "Little Cubs Multi-Sport",
          "program": "Little Cubs Multi-Sport",
          "stage": "New",
          "status": "Active",
          "enquiryDate": "2026-11-22",
          "createdAt": "2026-11-22T12:45:00.000Z",
          "lastParentResponse": "2026-11-22",
          "source": "WhatsApp",
          "notes": "WhatsApp inquiry for multi-sport activities in Kolathur."
    }
  ],
  demos: [
    {
      id: "DEMO-0284",
      enquiryId: "ENQ-0284",
      childName: "Aarav Krishna",
      parentName: "Rohit Krishna",
      phone: "+91 98765 43210",
      email: "rohit.krishna@gmail.com",
      location: "KK NAGAR",
      center: "KK NAGAR",
      program: "Junior Football Champions",
      demoDate: "2026-11-21",
      demoTime: "17:00",
      coachName: "Coach Sam",
      coachId: "COACH-SAM",
      status: "Completed",
      notes: "Great coordination and enthusiasm."
    },
    {
      id: "DEMO-0283",
      enquiryId: "ENQ-0283",
      childName: "Kiara Mehta",
      parentName: "Anita Mehta",
      phone: "+91 99876 54321",
      email: "anita.mehta@gmail.com",
      location: "ANNA NAGAR",
      center: "ANNA NAGAR",
      program: "Little Cubs Multi-Sport",
      demoDate: "2026-11-24",
      demoTime: "16:30",
      coachName: "Coach Priya",
      coachId: "COACH-PRIYA",
      status: "Scheduled",
      notes: "Multi-sport trial request."
    }
  ],
  payments: [],
  competitions: [],
  leaveRequests: [],
  coachLeaveRequests: [],
  feedback: [],
  certificates: [],
  supportTickets: [],
  followups: [],
  announcements: [],
  conversations: [],
  broadcasts: [],
  scheduledMessages: [],
  feeStructures: [],
  studentFeeAssignments: [],
  compensationRequests: [],
  compensationHistory: [],
  coachCompensationClasses: [],
  coachReplacements: [],
  backups: [],
  termsAcceptances: [],
  classSchedules: [],
  attendanceRecords: [],
  notifications: [],
  superCoaches: [
    {
      id: "SC-001",
      name: "Anita R.",
      title: "Super Coach",
      email: "anita.r@littlespartans.co.in",
      phone: "+91 98401 22345",
      assignedLocations: ["KK NAGAR", "ANNA NAGAR", "KILPAUK", "MAHALINGAPURAM"],
      role: "super_coach"
    }
  ],
  equipment: [],
  equipmentReports: [],

  // Communication message templates (Legitimate system templates)
  messageTemplates: [
    {
      id: "TPL-1",
      title: "Welcome to Little Spartans",
      category: "Onboarding",
      subject: "Welcome to Little Spartans Sports Academy!",
      body: "Dear Parent, welcome to Little Spartans Sports Academy! We are excited to embark on this athletic journey with your child."
    },
    {
      id: "TPL-2",
      title: "Monthly Fee Reminder",
      category: "Billing",
      subject: "Tuition Fee Reminder - Little Spartans",
      body: "Dear Parent, this is a gentle reminder that the training fee for the upcoming month is due."
    },
    {
      id: "TPL-3",
      title: "Class Rescheduling Alert",
      category: "Scheduling",
      subject: "Session Update - Little Spartans Academy",
      body: "Dear Parent, please note that the upcoming training session has been rescheduled. Please check your timetable."
    }
  ],

  // Master Root Super Admin Account
  userAccounts: [
    {
      id: "ACC-001",
      role: "admin",
      name: "Balavivek S",
      email: "admin@littlespartans.co.in",
      phone: "+91 98765 43210",
      status: "Active",
      isTemporaryPassword: false,
      lastLogin: "Today",
      createdAt: "2024-01-01",
      permissions: ["SUPER_ADMIN", "FULL_ACCESS"]
    }
  ],

  // Registered Academy Centers (Chennai)
  locations: [
    {
      id: "LOC-1",
      name: "KK NAGAR",
      code: "LS-KKN",
      city: "Chennai",
      state: "Tamil Nadu",
      pinCode: "600078",
      address: "15, Munusamy Salai, KK Nagar, Chennai",
      contactPerson: "Branch Coordinator",
      contactPhone: "+91 98765 43210",
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
      contactPerson: "Branch Coordinator",
      contactPhone: "+91 98765 43210",
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
      contactPerson: "Branch Coordinator",
      contactPhone: "+91 98765 43210",
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
      contactPerson: "Branch Coordinator",
      contactPhone: "+91 98765 43210",
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
      contactPerson: "Branch Coordinator",
      contactPhone: "+91 98765 43210",
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
      user: "Administrator",
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
      user: "Administrator",
      role: "Super Admin",
      category: "Center Management",
      action: "Facility Verification",
      field: "Center Facilities",
      oldValue: "Standard",
      newValue: "Main Turf Ground, Training Court A, Practice Arena B, Warm-up Studio",
      status: "Verified",
      ipAddress: "127.0.0.1"
    },
    {
      id: "SET-LOG-103",
      timestamp: "2026-11-15T09:00:00Z",
      user: "Administrator",
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

  // Terms & Conditions and Parent Conduct Guidelines Governance
  termsDocument: TERMS_AND_CONDITIONS_DOC,
  dosDontsDocument: PARENT_DOS_AND_DONTS_DOC,
  evaluations: []
};
