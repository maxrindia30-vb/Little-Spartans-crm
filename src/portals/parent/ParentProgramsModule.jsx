import React, { useState, useMemo } from 'react';
import {
  LayoutGrid,
  CheckCircle2,
  PlusCircle,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  User,
  BarChart2,
  Trophy,
  Dumbbell,
  Users,
  Target,
  ArrowRight,
  Bell,
  ChevronDown,
  Sparkles,
  Zap,
  Activity,
  Award,
  ShieldCheck,
  Check,
  Info,
  Layers,
  ChevronRight,
  Flame,
  Star
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

// Custom Sports Vector Icons for authentic sports visuals
const FootballIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m10 8 4 0 2 3-2 3-4 0-2-3Z" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 2v6" />
    <path d="M12 16v6" />
    <path d="m4.93 4.93 4.24 3.07" />
    <path d="m14.83 8 4.24-3.07" />
    <path d="m14.83 16 4.24 3.07" />
    <path d="m4.93 19.07 4.24-3.07" />
  </svg>
);

const BasketballIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2.1 12h19.8" />
    <path d="M12 2.1v19.8" />
    <path d="M4.93 4.93c4.2 4.2 4.2 10.94 0 15.14" />
    <path d="M19.07 4.93c-4.2 4.2-4.2 10.94 0 15.14" />
  </svg>
);

const CricketIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 21 6.5-6.5" />
    <path d="m7.5 16.5 7-7a2.5 2.5 0 0 0-3.5-3.5l-7 7" fill="currentColor" fillOpacity="0.15" />
    <circle cx="18.5" cy="5.5" r="3" fill="#F4510B" fillOpacity="0.3" />
    <path d="M18.5 2.5a3 3 0 0 1 0 6" />
  </svg>
);

const RunningIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="17" cy="4" r="2" />
    <path d="m15 8-3 3-4-1-3 4" />
    <path d="m12 11-1 4 4 3 1 4" />
    <path d="m11 15-4-1-2 4" />
    <path d="m13 10 3 2 4-1" />
  </svg>
);

const BackpackIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    <path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5" />
    <circle cx="12" cy="10" r="1" />
  </svg>
);

export default function ParentProgramsModule({
  parentProfile,
  myChildren = [],
  activeChild: propActiveChild,
  selectedChildId,
  onSelectChild,
  onNavigateView
}) {
  const { data, addToast } = useCrm();

  // Active child resolution
  const activeChild = useMemo(() => {
    return (
      myChildren.find(c => c.id === selectedChildId || c.childId === selectedChildId) ||
      propActiveChild ||
      myChildren[0] ||
      (data.students || [])[0]
    );
  }, [selectedChildId, propActiveChild, myChildren, data.students]);

  const childName = activeChild?.name || 'Aarav S';
  const childCenter = activeChild?.center || activeChild?.locationName || 'Adyar Centre';
  const childBatch = activeChild?.batch || activeChild?.batchName || 'B1';

  // Filter Tabs: 'all' | 'enrolled' | 'available' | 'after_school'
  const [activeFilterTab, setActiveFilterTab] = useState('all');

  // Selected Program for Details Panel (defaults to 'football')
  const [selectedProgramId, setSelectedProgramId] = useState('football');

  // Details Panel Tabs: 'overview' | 'schedule' | 'progress'
  const [activeDetailTab, setActiveDetailTab] = useState('overview');

  // Schedule Modal / Request Dialog
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // 6 Complete Program Definitions matching reference screenshot exactly
  const programsList = useMemo(() => [
    {
      id: 'football',
      title: 'Football',
      iconType: 'football',
      image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&auto=format&fit=crop&q=80',
      heroBg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80',
      description: 'Skill building, teamwork and match play.',
      ageGroup: 'Age 5 – 14 Years',
      level: 'Beginner to Advanced',
      duration: 'Jan 2026 – Mar 2026',
      location: childCenter.includes('Adyar') ? 'Adyar Centre' : childCenter,
      enrolled: true,
      batch: childBatch,
      isAfterSchool: false,
      popular: false,
      highlights: [
        'Skill development sessions',
        'Fitness & agility training',
        'Team play and match practice',
        'Age-appropriate coaching'
      ],
      schedule: {
        days: 'Tuesday, Thursday & Saturday',
        timings: '05:00 PM – 06:15 PM',
        batchName: `Junior Spartans – Batch ${childBatch}`,
        centerName: `${childCenter} – Ground 2`,
        coachName: 'Coach Karthik R (Senior Football Coach)',
        upcomingSessions: [
          { date: '28 Nov 2026', day: 'Thu', time: '05:00 PM – 06:15 PM', topic: 'Ball Control & Dribbling Drill', coach: 'Coach Karthik R' },
          { date: '30 Nov 2026', day: 'Sat', time: '05:00 PM – 06:15 PM', topic: 'Small-Sided Match Practice', coach: 'Coach Karthik R' },
          { date: '02 Dec 2026', day: 'Tue', time: '05:00 PM – 06:15 PM', topic: 'Agility Circuit & Shooting', coach: 'Coach Karthik R' }
        ]
      },
      progress: {
        overall: 82,
        attendanceRate: '92%',
        classesAttended: '23 / 25',
        skills: [
          { name: 'Ball Control & Dribbling', score: 85 },
          { name: 'Passing & Receiving', score: 78 },
          { name: 'Agility & Speed', score: 88 },
          { name: 'Team Play & Tactical Awareness', score: 76 }
        ],
        coachFeedback: `${childName.split(' ')[0]} has shown remarkable progress in ball control and spatial awareness. Always eager to learn and demonstrates great sportsmanship.`,
        milestone: 'Playmaker Bronze Badge Achieved'
      }
    },
    {
      id: 'basketball',
      title: 'Basketball',
      iconType: 'basketball',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80',
      heroBg: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1000&auto=format&fit=crop&q=80',
      description: 'Agility, coordination and game awareness.',
      ageGroup: 'Age 6 – 14 Years',
      level: 'Beginner to Advanced',
      duration: 'Jan 2026 – Mar 2026',
      location: childCenter.includes('Adyar') ? 'Adyar Centre' : childCenter,
      enrolled: false,
      batch: 'BB-1',
      isAfterSchool: false,
      popular: false,
      highlights: [
        'Dribbling, shooting & footwork',
        'Hand-eye coordination drills',
        'Offensive & defensive strategies',
        'Fun mini-games & court tournaments'
      ],
      schedule: {
        days: 'Monday, Wednesday & Friday',
        timings: '04:30 PM – 05:45 PM',
        batchName: 'Hoops Academy – Batch K1',
        centerName: `${childCenter} Indoor Court 1`,
        coachName: 'Coach Deepa M (Basketball Specialist)',
        upcomingSessions: [
          { date: '29 Nov 2026', day: 'Fri', time: '04:30 PM – 05:45 PM', topic: 'Crossover Dribble & Layup Drill', coach: 'Coach Deepa M' },
          { date: '01 Dec 2026', day: 'Mon', time: '04:30 PM – 05:45 PM', topic: 'Defensive Stance & Rebounding', coach: 'Coach Deepa M' }
        ]
      },
      progress: {
        overall: 0,
        attendanceRate: 'N/A',
        classesAttended: '0 / 24',
        skills: [
          { name: 'Ball Handling', score: 0 },
          { name: 'Shooting Technique', score: 0 },
          { name: 'Footwork & Speed', score: 0 }
        ],
        coachFeedback: 'Program available for enrollment. Free trial session available on request.',
        milestone: 'Ready to Enroll'
      }
    },
    {
      id: 'cricket',
      title: 'Cricket',
      iconType: 'cricket',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80',
      heroBg: 'https://images.unsplash.com/photo-1531415074868-036b1c57e329?w=1000&auto=format&fit=crop&q=80',
      description: 'Batting, bowling, fielding and match practice.',
      ageGroup: 'Age 7 – 15 Years',
      level: 'Beginner to Advanced',
      duration: 'Jan 2026 – Mar 2026',
      location: childCenter.includes('Adyar') ? 'Adyar Centre' : childCenter,
      enrolled: false,
      batch: 'CR-1',
      isAfterSchool: false,
      popular: false,
      highlights: [
        'Batting technique & stance drills',
        'Fast & spin bowling fundamentals',
        'High-intensity catching & fielding',
        'Turf net practice & weekend matches'
      ],
      schedule: {
        days: 'Tuesday, Thursday & Saturday',
        timings: '06:30 AM – 08:00 AM',
        batchName: 'Spartan Willow Masters',
        centerName: `${childCenter} Cricket Nets & Turf`,
        coachName: 'Coach Suresh K (BCCI Certified)',
        upcomingSessions: [
          { date: '28 Nov 2026', day: 'Thu', time: '06:30 AM – 08:00 AM', topic: 'Forward Defensive & Cover Drive', coach: 'Coach Suresh K' },
          { date: '30 Nov 2026', day: 'Sat', time: '06:30 AM – 08:00 AM', topic: 'Net Practice & Match Simulation', coach: 'Coach Suresh K' }
        ]
      },
      progress: {
        overall: 0,
        attendanceRate: 'N/A',
        classesAttended: '0 / 24',
        skills: [
          { name: 'Batting Stance & Timing', score: 0 },
          { name: 'Bowling Accuracy', score: 0 },
          { name: 'Fielding Reflexes', score: 0 }
        ],
        coachFeedback: 'Program open for new admissions. Register your interest for the upcoming batch.',
        milestone: 'Registration Open'
      }
    },
    {
      id: 'athletics',
      title: 'Athletics',
      iconType: 'athletics',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
      heroBg: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000&auto=format&fit=crop&q=80',
      description: 'Speed, strength and overall fitness.',
      ageGroup: 'Age 6 – 14 Years',
      level: 'All Levels',
      duration: 'Jan 2026 – Mar 2026',
      location: childCenter.includes('Adyar') ? 'Adyar Centre' : childCenter,
      enrolled: false,
      batch: 'ATH-1',
      isAfterSchool: false,
      popular: false,
      highlights: [
        'Sprint mechanics & running posture',
        'Agility ladders & hurdle jumps',
        'Cardiovascular endurance training',
        'Core stability & functional strength'
      ],
      schedule: {
        days: 'Wednesday & Friday',
        timings: '05:30 PM – 06:45 PM',
        batchName: 'Sprint Stars – Track Batch A',
        centerName: `${childCenter} Synthetic Track`,
        coachName: 'Coach Rajesh V (Athletics Specialist)',
        upcomingSessions: [
          { date: '29 Nov 2026', day: 'Fri', time: '05:30 PM – 06:45 PM', topic: 'Sprint Starts & Acceleration Drill', coach: 'Coach Rajesh V' }
        ]
      },
      progress: {
        overall: 0,
        attendanceRate: 'N/A',
        classesAttended: '0 / 18',
        skills: [
          { name: 'Running Form', score: 0 },
          { name: 'Reaction Time', score: 0 },
          { name: 'Endurance', score: 0 }
        ],
        coachFeedback: 'Specialized track training designed to build explosive athletic foundation.',
        milestone: 'Open for Enrollment'
      }
    },
    {
      id: 'multi_sport',
      title: 'Multi-Sport',
      iconType: 'multi_sport',
      image: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&auto=format&fit=crop&q=80',
      heroBg: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=1000&auto=format&fit=crop&q=80',
      description: 'A mix of sports for overall development.',
      ageGroup: 'Age 5 – 12 Years',
      level: 'Foundation Level',
      duration: 'Jan 2026 – Mar 2026',
      location: childCenter.includes('Adyar') ? 'Adyar Centre' : childCenter,
      enrolled: true,
      batch: 'MS-2',
      isAfterSchool: false,
      popular: false,
      highlights: [
        'Multi-sport exposure (Football, Basketball, Athletics)',
        'Motor skills & vestibular development',
        'Teamwork & communication games',
        'Injury prevention & active lifestyle habit'
      ],
      schedule: {
        days: 'Sunday',
        timings: '09:00 AM – 10:30 AM',
        batchName: 'Multi-Sport Explorers – Batch MS2',
        centerName: `${childCenter} Main Multi-Arena`,
        coachName: 'Coach Karthik R & Coach Priya N',
        upcomingSessions: [
          { date: '01 Dec 2026', day: 'Sun', time: '09:00 AM – 10:30 AM', topic: 'Hand-Eye Coordination & Relay Games', coach: 'Coach Karthik R' }
        ]
      },
      progress: {
        overall: 88,
        attendanceRate: '95%',
        classesAttended: '19 / 20',
        skills: [
          { name: 'Locomotor Agility', score: 92 },
          { name: 'Stability & Balance', score: 86 },
          { name: 'Object Control', score: 85 }
        ],
        coachFeedback: `${childName.split(' ')[0]} loves exploring diverse sports disciplines. His versatility and energy are commendable.`,
        milestone: 'Foundational Movement Certified'
      }
    },
    {
      id: 'after_school',
      title: 'After School Program',
      iconType: 'after_school',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
      heroBg: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1000&auto=format&fit=crop&q=80',
      description: 'Structured sports training after school hours.',
      ageGroup: 'Age 5 – 14 Years',
      level: 'Location Based',
      duration: 'Academic Year 2026 – 2027',
      location: 'All Centres',
      enrolled: false,
      batch: 'ASP-1',
      isAfterSchool: true,
      popular: true,
      highlights: [
        'Structured daily sports & fitness sessions',
        'Supervised warm-up & cool-down routines',
        'Healthy nutritional snack guidance',
        'Safe transit & dedicated guardian pickup zone'
      ],
      schedule: {
        days: 'Monday to Friday',
        timings: '03:30 PM – 05:30 PM',
        batchName: 'After-School Champions Club',
        centerName: `${childCenter} Academy Center`,
        coachName: 'Head Coach Ananya & Academy Team',
        upcomingSessions: [
          { date: '28 Nov 2026', day: 'Thu', time: '03:30 PM – 05:30 PM', topic: 'Movement Circuit & Active Play', coach: 'Coach Ananya' },
          { date: '29 Nov 2026', day: 'Fri', time: '03:30 PM – 05:30 PM', topic: 'Weekend Sports Showcase', coach: 'Coach Ananya' }
        ]
      },
      progress: {
        overall: 0,
        attendanceRate: 'N/A',
        classesAttended: '0 / 60',
        skills: [
          { name: 'Daily Physical Activity', score: 0 },
          { name: 'Social Interaction', score: 0 },
          { name: 'Discipline & Routine', score: 0 }
        ],
        coachFeedback: 'Ideal for busy working parents. Includes snack break, supervised coaching and character development.',
        milestone: 'Admissions Open'
      }
    }
  ], [childName, childCenter, childBatch]);

  // Filter programs based on selected filter tab
  const filteredPrograms = useMemo(() => {
    if (activeFilterTab === 'enrolled') {
      return programsList.filter(p => p.enrolled);
    }
    if (activeFilterTab === 'available') {
      return programsList.filter(p => !p.enrolled);
    }
    if (activeFilterTab === 'after_school') {
      return programsList.filter(p => p.isAfterSchool);
    }
    return programsList;
  }, [activeFilterTab, programsList]);

  // Selected program object
  const selectedProgram = useMemo(() => {
    return programsList.find(p => p.id === selectedProgramId) || programsList[0];
  }, [selectedProgramId, programsList]);

  // Render sport-specific icon
  const renderSportIcon = (iconType, className = 'w-5 h-5') => {
    switch (iconType) {
      case 'football':
        return <FootballIcon className={className} />;
      case 'basketball':
        return <BasketballIcon className={className} />;
      case 'cricket':
        return <CricketIcon className={className} />;
      case 'athletics':
        return <RunningIcon className={className} />;
      case 'multi_sport':
        return <Layers className={className} />;
      case 'after_school':
        return <BackpackIcon className={className} />;
      default:
        return <Trophy className={className} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* =================================================================== */}
      {/* 1. TOP HEADER (Matching Reference Screenshot: Programs + Subtitle)  */}
      {/* =================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="text-left space-y-1">
          <h1 className="text-2xl sm:text-[28px] font-black text-[#172B50] tracking-tight">
            Programs
          </h1>
          <p className="text-xs sm:text-[13px] font-semibold text-[#172B50]/65 tracking-tight text-left">
            Explore training programs, schedules and progress for your child.
          </p>
        </div>

        {/* Right Action Icons: Notification Bell + Parent Profile Pill */}
        <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
          {/* Academy Notification Bell */}
          <button
            type="button"
            onClick={() => onNavigateView ? onNavigateView('communication') : addToast('Viewing academy announcements', 'info')}
            className="w-9 h-9 rounded-full bg-white border border-[#172B50]/15 shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B]/40 transition-all cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#172B50]" />
            <span className="w-2 h-2 rounded-full bg-[#F4510B] absolute top-2 right-2 ring-1 ring-white" />
          </button>

          {/* Parent Profile Pill */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-[#172B50]/15 shadow-2xs">
            <div className="w-7 h-7 rounded-full bg-[#172B50] flex items-center justify-center text-white text-xs font-bold shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left leading-tight hidden xs:block">
              <p className="text-xs font-black text-[#172B50]">
                {parentProfile?.name || 'Mrs. Priya S'}
              </p>
              <p className="text-[10px] font-semibold text-[#172B50]/60">Parent</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/60 ml-0.5" />
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. HERO BANNER: "Our Programs" + Smiling Boy Athlete + 4 Features    */}
      {/* =================================================================== */}
      <div className="relative w-full rounded-3xl overflow-hidden shadow-2xs border border-[#FEE6D6] min-h-[175px] sm:min-h-[185px] bg-gradient-to-r from-[#FFF4E8] via-[#FFEADB] to-[#F4510B] flex flex-col md:flex-row items-center justify-between p-6 sm:p-7 gap-6">
        
        {/* Dynamic Curved Wave Background Divider */}
        <div 
          className="absolute inset-0 pointer-events-none hidden md:block" 
          style={{
            background: 'radial-gradient(ellipse at 65% 50%, rgba(244, 81, 11, 0.95) 0%, rgba(244, 81, 11, 1) 45%, transparent 46%)',
            mixBlendMode: 'normal'
          }} 
        />

        {/* Left Side: "Our Programs" Typography & Subtitle */}
        <div className="relative z-10 text-left space-y-1.5 max-w-sm shrink-0">
          <div className="leading-tight">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#172B50] block">
              Our
            </span>
            <span className="text-3xl sm:text-4xl font-black text-[#F4510B] tracking-tight italic relative inline-block">
              Programs
              {/* Decorative curved brush stroke under Programs */}
              <svg className="absolute -bottom-1 left-0 w-full h-2 text-[#F4510B]" viewBox="0 0 100 12" fill="none" preserveAspectRatio="none">
                <path d="M2 7C25 1 75 1 98 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </div>
          <p className="text-xs sm:text-[13px] font-semibold text-[#172B50]/80 pt-2 leading-relaxed">
            Age-appropriate sports training for skill, fitness and confidence.
          </p>
        </div>

        {/* Center: Cheerful Young Boy Athlete Celebrating with Raised Fist */}
        <div className="relative z-10 flex items-center justify-center -my-3 sm:-my-4 shrink-0">
          <div className="relative group">
            {/* Dynamic Energy Accent Lines above raised fist */}
            <div className="absolute -top-3 -right-2 text-[#F4510B] animate-pulse">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                <line x1="19.07" y1="4.93" x2="16.24" y2="7.76" />
              </svg>
            </div>
            {/* Athlete Photo with Circular Shield Badge Styling */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden ring-4 ring-white/90 shadow-lg bg-[#FFE6D0] relative flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=500&auto=format&fit=crop&q=80"
                alt="Smiling Young Spartan Athlete"
                className="w-full h-full object-cover object-top scale-105"
              />
              <div className="absolute bottom-1 right-1 bg-[#F4510B] text-white p-1 rounded-md shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: 4 Pillars of Little Spartans on Orange Canvas */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full md:w-auto shrink-0 pt-2 md:pt-0">
          {/* 1. Build Skills */}
          <div className="flex flex-col items-center text-center space-y-1.5 group cursor-default">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center text-white backdrop-blur-xs transition-transform group-hover:scale-110 shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-white text-xs sm:text-[13px] font-bold tracking-tight">
              Build Skills
            </span>
          </div>

          {/* 2. Stay Active */}
          <div className="flex flex-col items-center text-center space-y-1.5 group cursor-default">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center text-white backdrop-blur-xs transition-transform group-hover:scale-110 shadow-xs">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-white text-xs sm:text-[13px] font-bold tracking-tight">
              Stay Active
            </span>
          </div>

          {/* 3. Make Friends */}
          <div className="flex flex-col items-center text-center space-y-1.5 group cursor-default">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center text-white backdrop-blur-xs transition-transform group-hover:scale-110 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-white text-xs sm:text-[13px] font-bold tracking-tight">
              Make Friends
            </span>
          </div>

          {/* 4. Compete & Grow */}
          <div className="flex flex-col items-center text-center space-y-1.5 group cursor-default">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center text-white backdrop-blur-xs transition-transform group-hover:scale-110 shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-white text-xs sm:text-[13px] font-bold tracking-tight">
              Compete &amp; Grow
            </span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. PROGRAM FILTER TABS (All, Enrolled, Available, After School)     */}
      {/* =================================================================== */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {/* All Programs Tab */}
        <button
          type="button"
          onClick={() => setActiveFilterTab('all')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeFilterTab === 'all'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'bg-white text-[#172B50]/75 hover:bg-[#FFF4E8] hover:text-[#F4510B] border border-slate-200/80 shadow-2xs'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>All Programs</span>
        </button>

        {/* Enrolled Programs Tab */}
        <button
          type="button"
          onClick={() => setActiveFilterTab('enrolled')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeFilterTab === 'enrolled'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'bg-white text-[#172B50]/75 hover:bg-[#FFF4E8] hover:text-[#F4510B] border border-slate-200/80 shadow-2xs'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Enrolled Programs</span>
        </button>

        {/* Available Programs Tab */}
        <button
          type="button"
          onClick={() => setActiveFilterTab('available')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeFilterTab === 'available'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'bg-white text-[#172B50]/75 hover:bg-[#FFF4E8] hover:text-[#F4510B] border border-slate-200/80 shadow-2xs'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Available Programs</span>
        </button>

        {/* After School Program Tab */}
        <button
          type="button"
          onClick={() => setActiveFilterTab('after_school')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeFilterTab === 'after_school'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'bg-white text-[#172B50]/75 hover:bg-[#FFF4E8] hover:text-[#F4510B] border border-slate-200/80 shadow-2xs'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>After School Program</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* 4. MAIN WORKSPACE: 6 CARDS GRID (Left) + DETAILS PANEL (Right)      */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ================================================================= */}
        {/* LEFT COLUMN: 6 PROGRAM CARDS (3x2 Grid)                           */}
        {/* ================================================================= */}
        <div className="lg:col-span-8">
          {filteredPrograms.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-200 shadow-2xs">
              <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#172B50]">No programs match this filter</p>
              <button
                type="button"
                onClick={() => setActiveFilterTab('all')}
                className="mt-3 px-4 py-2 bg-[#FFF4E8] text-[#F4510B] text-xs font-bold rounded-lg hover:bg-[#F4510B] hover:text-white transition-all cursor-pointer"
              >
                Show All Programs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredPrograms.map((program) => {
                const isSelected = selectedProgramId === program.id;
                return (
                  <div
                    key={program.id}
                    onClick={() => setSelectedProgramId(program.id)}
                    className={`bg-white rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'ring-2 ring-[#F4510B] border-transparent shadow-md'
                        : 'border border-slate-200/70 hover:border-[#F4510B]/50 hover:shadow-sm'
                    }`}
                  >
                    {/* Top Program Photo Container */}
                    <div className="relative h-36 w-full overflow-hidden bg-slate-100 p-2 pb-0">
                      <div className="w-full h-full rounded-xl overflow-hidden relative">
                        <img
                          src={program.image}
                          alt={program.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60" />

                        {/* Popular Badge for After School Program */}
                        {program.popular && (
                          <div className="absolute top-2 right-2 bg-[#F4510B] text-white text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full shadow-xs uppercase">
                            Popular
                          </div>
                        )}

                        {/* Enrolled Indicator Tag */}
                        {program.enrolled && (
                          <div className="absolute top-2 left-2 bg-[#172B50]/90 backdrop-blur-xs text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Enrolled</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between text-left">
                      
                      {/* Sport Icon + Title */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="text-[#172B50]">
                            {renderSportIcon(program.iconType, 'w-4 h-4')}
                          </div>
                          <h3 className="text-base font-black text-[#172B50] tracking-tight group-hover:text-[#F4510B] transition-colors">
                            {program.title}
                          </h3>
                        </div>
                        <p className="text-xs font-medium text-[#172B50]/70 leading-relaxed line-clamp-2 min-h-[32px]">
                          {program.description}
                        </p>
                      </div>

                      {/* Tags & Action Button Row */}
                      <div className="flex items-end justify-between pt-1 border-t border-slate-100 gap-2">
                        {/* Age & Skill Level Pill Tags */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="inline-block bg-[#FFF4E8] text-[#172B50] font-bold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-md truncate max-w-full">
                            {program.ageGroup}
                          </div>
                          <div className="inline-block bg-[#FFF4E8] text-[#172B50] font-bold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-md truncate max-w-full">
                            {program.level}
                          </div>
                        </div>

                        {/* Circular Arrow Button (Orange-tinted) */}
                        <button
                          type="button"
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#F4510B] text-white shadow-2xs'
                              : 'bg-[#FFF4E8] text-[#F4510B] group-hover:bg-[#F4510B] group-hover:text-white'
                          }`}
                          title={`View ${program.title} Details`}
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: SELECTED PROGRAM DETAILS PANEL                      */}
        {/* ================================================================= */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs sticky top-4">
            
            {/* Header: Hero Sport Image with Overlay & Program Title */}
            <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-[#172B50]">
              <img
                src={selectedProgram.heroBg || selectedProgram.image}
                alt={selectedProgram.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Status Pill Badge (Enrolled or Available) */}
              <div className="absolute top-3 left-3">
                {selectedProgram.enrolled ? (
                  <span className="bg-[#F4510B] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Enrolled
                  </span>
                ) : (
                  <span className="bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                    <PlusCircle className="w-3 h-3" />
                    Available
                  </span>
                )}
              </div>

              {/* Soccer Ball Graphic / Sport Accent on Top Right */}
              <div className="absolute top-3 right-3 text-white/30">
                {renderSportIcon(selectedProgram.iconType, 'w-10 h-10')}
              </div>

              {/* Program Name & Subtext inside overlay */}
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <div className="flex items-center gap-2 text-white">
                  {renderSportIcon(selectedProgram.iconType, 'w-5 h-5 text-[#FFE6D0]')}
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {selectedProgram.title}
                  </h2>
                </div>
                <p className="text-white/85 text-xs font-medium truncate mt-0.5">
                  {childName} | Batch: {selectedProgram.batch} | {selectedProgram.location}
                </p>
              </div>
            </div>

            {/* Three Navigation Tabs: Program Overview | Schedule | Progress */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/70">
              <div className="grid grid-cols-3 gap-1 bg-slate-200/60 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveDetailTab('overview')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
                    activeDetailTab === 'overview'
                      ? 'bg-[#F4510B] text-white shadow-2xs'
                      : 'text-[#172B50]/70 hover:text-[#172B50]'
                  }`}
                >
                  Program Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDetailTab('schedule')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
                    activeDetailTab === 'schedule'
                      ? 'bg-[#F4510B] text-white shadow-2xs'
                      : 'text-[#172B50]/70 hover:text-[#172B50]'
                  }`}
                >
                  Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDetailTab('progress')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
                    activeDetailTab === 'progress'
                      ? 'bg-[#F4510B] text-white shadow-2xs'
                      : 'text-[#172B50]/70 hover:text-[#172B50]'
                  }`}
                >
                  Progress
                </button>
              </div>
            </div>

            {/* Tab 1: Program Overview Content (Matching Reference Screenshot) */}
            {activeDetailTab === 'overview' && (
              <div className="p-4 space-y-4 text-left animate-in fade-in duration-150">
                {/* Metadata Details Rows */}
                <div className="space-y-3 divide-y divide-slate-100">
                  {/* Row 1: Program Duration */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-2 text-[#172B50]/75">
                      <Calendar className="w-4 h-4 text-[#F4510B]" />
                      <span className="font-semibold">Program Duration</span>
                    </div>
                    <span className="font-bold text-[#172B50]">
                      {selectedProgram.duration}
                    </span>
                  </div>

                  {/* Row 2: Age Group */}
                  <div className="flex items-center justify-between text-xs pt-3">
                    <div className="flex items-center gap-2 text-[#172B50]/75">
                      <User className="w-4 h-4 text-[#F4510B]" />
                      <span className="font-semibold">Age Group</span>
                    </div>
                    <span className="font-bold text-[#172B50]">
                      {selectedProgram.ageGroup.replace('Age ', '')}
                    </span>
                  </div>

                  {/* Row 3: Level */}
                  <div className="flex items-center justify-between text-xs pt-3">
                    <div className="flex items-center gap-2 text-[#172B50]/75">
                      <BarChart2 className="w-4 h-4 text-[#F4510B]" />
                      <span className="font-semibold">Level</span>
                    </div>
                    <span className="font-bold text-[#172B50]">
                      {selectedProgram.level}
                    </span>
                  </div>

                  {/* Row 4: Location */}
                  <div className="flex items-center justify-between text-xs pt-3">
                    <div className="flex items-center gap-2 text-[#172B50]/75">
                      <MapPin className="w-4 h-4 text-[#F4510B]" />
                      <span className="font-semibold">Location</span>
                    </div>
                    <span className="font-bold text-[#172B50]">
                      {selectedProgram.location}
                    </span>
                  </div>
                </div>

                {/* Program Highlights Section */}
                <div className="pt-2">
                  <h3 className="text-sm font-black text-[#172B50] mb-2.5">
                    Program Highlights
                  </h3>
                  <div className="space-y-2">
                    {selectedProgram.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#172B50]/85">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 shrink-0" />
                        <span className="font-semibold">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button: View Full Schedule */}
                <div className="pt-2">
                  {selectedProgram.enrolled ? (
                    <button
                      type="button"
                      onClick={() => setActiveDetailTab('schedule')}
                      className="w-full py-2.5 px-4 rounded-xl border-2 border-[#F4510B] text-[#F4510B] hover:bg-[#F4510B] hover:text-white transition-all font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs group"
                    >
                      <span>View Full Schedule</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEnrollModal(true);
                          addToast(`Enrollment enquiry logged for ${selectedProgram.title}`, 'success');
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#F4510B] text-white hover:bg-[#d94103] transition-all font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Enroll Now</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveDetailTab('schedule')}
                        className="py-2.5 px-3 rounded-xl border border-slate-200 text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] transition-all font-bold text-xs cursor-pointer"
                      >
                        Timings
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Schedule Tab Content */}
            {activeDetailTab === 'schedule' && (
              <div className="p-4 space-y-4 text-left animate-in fade-in duration-150">
                {/* Batch & Centre Overview */}
                <div className="bg-[#FFF4E8]/60 rounded-xl p-3 border border-[#FEE6D6] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#172B50]/70">Class Batch:</span>
                    <span className="font-black text-[#F4510B]">{selectedProgram.schedule.batchName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#172B50]/70">Timetable:</span>
                    <span className="font-bold text-[#172B50]">{selectedProgram.schedule.days}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#172B50]/70">Timings:</span>
                    <span className="font-bold text-[#172B50]">{selectedProgram.schedule.timings}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#FEE6D6]/60">
                    <span className="font-semibold text-[#172B50]/70">Lead Coach:</span>
                    <span className="font-bold text-[#172B50]">{selectedProgram.schedule.coachName}</span>
                  </div>
                </div>

                {/* Upcoming Scheduled Sessions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-[#172B50]/60 tracking-wider">
                    Upcoming Sessions
                  </h4>
                  <div className="space-y-2">
                    {selectedProgram.schedule.upcomingSessions.map((session, sIdx) => (
                      <div key={sIdx} className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-[#FFEADB] text-[#F4510B] flex flex-col items-center justify-center font-bold text-[11px] shrink-0">
                            <span>{session.day}</span>
                            <span className="text-[9px] -mt-0.5">{session.date.split(' ')[0]}</span>
                          </div>
                          <div>
                            <p className="text-xs font-black text-[#172B50]">{session.topic}</p>
                            <p className="text-[11px] font-medium text-[#172B50]/65 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-[#F4510B]" />
                              <span>{session.time}</span>
                            </p>
                          </div>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                          Scheduled
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button: Back to Overview */}
                <button
                  type="button"
                  onClick={() => setActiveDetailTab('overview')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#172B50] font-bold text-xs transition-colors cursor-pointer"
                >
                  ← Back to Program Overview
                </button>
              </div>
            )}

            {/* Tab 3: Progress Tab Content */}
            {activeDetailTab === 'progress' && (
              <div className="p-4 space-y-4 text-left animate-in fade-in duration-150">
                {selectedProgram.enrolled ? (
                  <>
                    {/* Overall Progress KPI & Attendance */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#FFF4E8] rounded-xl p-3 border border-[#FEE6D6] text-center">
                        <p className="text-[10px] font-black uppercase text-[#172B50]/60 tracking-wider">Overall Progress</p>
                        <p className="text-2xl font-black text-[#F4510B] mt-0.5">{selectedProgram.progress.overall}%</p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Top 15% in Batch</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 text-center">
                        <p className="text-[10px] font-black uppercase text-[#172B50]/60 tracking-wider">Attendance</p>
                        <p className="text-2xl font-black text-[#172B50] mt-0.5">{selectedProgram.progress.attendanceRate}</p>
                        <p className="text-[10px] text-[#172B50]/60 font-semibold mt-0.5">{selectedProgram.progress.classesAttended} sessions</p>
                      </div>
                    </div>

                    {/* Skill Breakdown Progress Bars */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-black uppercase text-[#172B50]/60 tracking-wider">
                        Skill Competency
                      </h4>
                      <div className="space-y-2">
                        {selectedProgram.progress.skills.map((skill, skIdx) => (
                          <div key={skIdx} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-[#172B50]">
                              <span>{skill.name}</span>
                              <span className="text-[#F4510B]">{skill.score}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#F4510B] to-amber-500 transition-all duration-500"
                                style={{ width: `${skill.score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Coach Feedback Box */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1">
                      <p className="text-[10px] font-black uppercase text-[#172B50]/60 tracking-wider flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#F4510B]" />
                        <span>Coach Observation</span>
                      </p>
                      <p className="text-xs italic text-[#172B50]/80 leading-relaxed">
                        "{selectedProgram.progress.coachFeedback}"
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#172B50]">
                        Unlock {selectedProgram.title} Journey
                      </h4>
                      <p className="text-xs text-[#172B50]/70 max-w-xs mx-auto">
                        Progress tracking, skill badges and performance reports become active upon child enrollment.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEnrollModal(true);
                        addToast(`Enrollment requested for ${selectedProgram.title}`, 'success');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#F4510B] text-white font-bold text-xs hover:bg-[#d94103] transition-all cursor-pointer shadow-xs"
                    >
                      Request Free Demo Class
                    </button>
                  </div>
                )}

                {/* Back to Overview */}
                <button
                  type="button"
                  onClick={() => setActiveDetailTab('overview')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#172B50] font-bold text-xs transition-colors cursor-pointer"
                >
                  ← Back to Program Overview
                </button>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 5. ENROLLMENT / DEMO CLASS MODAL                                    */}
      {/* =================================================================== */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#172B50]">
                    Enroll in {selectedProgram.title}
                  </h3>
                  <p className="text-xs text-[#172B50]/60">Little Spartans Sports Academy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#FFF4E8] rounded-xl p-3 border border-[#FEE6D6]">
                <p className="font-bold text-[#172B50]">Athlete: <span className="text-[#F4510B]">{childName}</span></p>
                <p className="text-[#172B50]/70 mt-0.5">Centre: {selectedProgram.location}</p>
                <p className="text-[#172B50]/70">Schedule: {selectedProgram.schedule.days} ({selectedProgram.schedule.timings})</p>
              </div>
              <p className="text-[#172B50]/80">
                Our academy coordinator will contact you via WhatsApp / phone to confirm the schedule and batch placement.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[#172B50] font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEnrollModal(false);
                  addToast(`Enrollment request submitted for ${selectedProgram.title}!`, 'success');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#F4510B] text-white font-bold text-xs hover:bg-[#d94103] cursor-pointer shadow-xs"
              >
                Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
