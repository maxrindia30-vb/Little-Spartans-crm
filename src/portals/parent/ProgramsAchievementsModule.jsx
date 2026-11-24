import React, { useState, useMemo } from 'react';
import {
  Award,
  Rocket,
  Trophy,
  MapPin,
  Layers,
  Users,
  Calendar,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Check,
  Star,
  Activity,
  Zap,
  Target,
  Scale,
  Download,
  FileText,
  Clock,
  Sparkles,
  TrendingUp,
  Flame,
  ArrowRight,
  Shield,
  X,
  Send,
  Phone,
  Mail,
  User,
  Heart,
  BarChart2,
  Medal,
  Share2,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';

export default function ProgramsAchievementsModule({
  parentProfile = null,
  myChildren = [],
  activeChild: propActiveChild = null,
  selectedChildId = '',
  onSelectChild = null,
  initialTab = 'explore',
}) {
  const { data, currentUser, addEnquiry, addDemo, addToast } = useCrm();

  // Active Main Tab: 'explore' (Explore Programs) vs 'achievements' (My Child's Achievements)
  const [activeTab, setActiveTab] = useState(initialTab || 'explore');

  // Multi-Child Resolution
  const activeChild = useMemo(() => {
    if (propActiveChild) return propActiveChild;
    if (myChildren && myChildren.length > 0) {
      if (selectedChildId) {
        const found = myChildren.find((c) => c.id === selectedChildId);
        if (found) return found;
      }
      return myChildren[0];
    }
    // Fallback search in data.students for Aarav K or first student
    const student =
      (data.students || []).find(
        (s) => s.name?.toLowerCase().includes('aarav') || s.id === 'STU-LS-002'
      ) ||
      (data.students || [])[0] || {
        id: 'STU-LS-002',
        rollNo: 'LS002',
        name: 'Aarav K',
        age: 5,
        gender: 'Male',
        center: 'KK NAGAR',
        program: 'Foundational Movement',
        batch: 'LE - B1',
        avatar:
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
        evaluations: {
          balance: 80,
          jumping: 75,
          throwing: 85,
          running: 78,
          overall: 86,
        },
        badgesCount: 6,
        milestonesCount: 3,
        certificatesCount: 2,
      };

    return student;
  }, [propActiveChild, myChildren, selectedChildId, data.students]);

  // Child Enrolled Location
  const childCenter = useMemo(() => {
    return activeChild.center || activeChild.location || 'KK NAGAR';
  }, [activeChild]);

  // Filters State for Explore Programs
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedProgram, setSelectedProgram] = useState('All Programs');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('All Age Groups');
  const [selectedDays, setSelectedDays] = useState('All Days');

  // Filter Dropdown Open States
  const [isLocOpen, setIsLocOpen] = useState(false);
  const [isProgOpen, setIsProgOpen] = useState(false);
  const [isAgeOpen, setIsAgeOpen] = useState(false);
  const [isDaysOpen, setIsDaysOpen] = useState(false);
  const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);

  // Selected Program for Details Modal
  const [selectedProgramDetail, setSelectedProgramDetail] = useState(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [selectedCertificateModal, setSelectedCertificateModal] = useState(null);

  // Demo / Enquiry Form
  const [leadForm, setLeadForm] = useState({
    parentName: parentProfile?.name || currentUser?.name || 'Karthik K',
    parentPhone: parentProfile?.phone || '+91 98765 00002',
    parentEmail: parentProfile?.email || currentUser?.email || 'parent.aarav@littlespartans.co.in',
    childName: activeChild?.name || 'Aarav K',
    childAge: String(activeChild?.age || 5),
    preferredDate: '2026-11-28',
    notes: 'Interested in weekend demo session at academy center.',
  });

  // Approved Evaluations for this specific active child
  const childApprovedEvaluations = useMemo(() => {
    return (data.evaluations || []).filter((e) => {
      const matchChild =
        e.studentId === activeChild.id ||
        (e.studentName && activeChild.name && e.studentName.toLowerCase().trim() === activeChild.name.toLowerCase().trim());
      const isApprovedOrPublished = e.status === 'Approved' || e.publishedToParent === true;
      return matchChild && isApprovedOrPublished;
    });
  }, [data.evaluations, activeChild]);

  // Latest approved evaluation
  const latestApprovedEval = useMemo(() => {
    if (childApprovedEvaluations.length > 0) {
      return childApprovedEvaluations[0];
    }
    return null;
  }, [childApprovedEvaluations]);

  // Progress Highlights (Derived dynamically from approved evaluation or student profile)
  const progressHighlights = useMemo(() => {
    if (latestApprovedEval && latestApprovedEval.skills) {
      const s = latestApprovedEval.skills;
      const calcPct = (skillObj, defaultScore) => {
        if (!skillObj) return defaultScore;
        const rating = skillObj.superCoachRating ?? skillObj.coachRating;
        if (typeof rating === 'number') {
          return Math.min(100, Math.round(rating * 20)); // 5-star converted to 100%
        }
        return defaultScore;
      };

      return {
        balance: calcPct(s.balance, activeChild.evaluations?.balance || 80),
        jumping: calcPct(s.jumping, activeChild.evaluations?.jumping || 75),
        throwing: calcPct(s.throwing, activeChild.evaluations?.throwing || 85),
        running: calcPct(s.running, activeChild.evaluations?.running || 78),
      };
    }

    return {
      balance: activeChild.evaluations?.balance || 80,
      jumping: activeChild.evaluations?.jumping || 75,
      throwing: activeChild.evaluations?.throwing || 85,
      running: activeChild.evaluations?.running || 78,
    };
  }, [latestApprovedEval, activeChild]);

  // KPI Metrics (Badges, Milestones, Certificates)
  const kpiCounts = useMemo(() => {
    const badges = activeChild.badgesCount || 6;
    const milestones = activeChild.milestonesCount || 3;
    const certificates = activeChild.certificatesCount || 2;
    return { badges, milestones, certificates };
  }, [activeChild]);

  // Dynamic Programs List from Database (respects active child location and Admin Master Data)
  const allProgramsList = useMemo(() => {
    const defaultPrograms = [
      {
        id: 'PROG-FM',
        name: 'Foundational Movement',
        subtitle: 'Balance · Coordination · Movement',
        ageGroup: 'Ages 3 – 5',
        minAge: 3,
        maxAge: 5,
        sessionsPerWeek: '2–3 sessions/week',
        icon: Activity,
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        description:
          'Age-appropriate physical literacy introducing agility obstacle drills, safe two-foot landing, and dynamic balance games.',
        skills: ['Balance & Core Stability', 'Safe Jumping & Landing', 'Throwing & Catching', 'Running Agility'],
        locations: ['KK NAGAR', 'KILPAUK', 'MAHALINGAPURAM', 'ANNA NAGAR'],
        days: 'Mon, Wed, Fri',
        monthlyFee: '₹4,000 / month',
        status: 'Active',
      },
      {
        id: 'PROG-FT',
        name: 'Football',
        subtitle: 'Dribbling · Passing · Teamwork',
        ageGroup: 'Ages 5 – 12',
        minAge: 5,
        maxAge: 12,
        sessionsPerWeek: '2–3 sessions/week',
        icon: Trophy,
        image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&auto=format&fit=crop&q=80',
        description:
          'Grassroots football coaching developing ball mastery, directional control, short passes, and small-sided match awareness.',
        skills: ['Close Ball Dribbling', 'First Touch Passing', 'Target Shooting', 'Tactical Positioning'],
        locations: ['KK NAGAR', 'KILPAUK', 'ANNA NAGAR'],
        days: 'Tue, Thu, Sat',
        monthlyFee: '₹4,200 / month',
        status: 'Active',
      },
      {
        id: 'PROG-BB',
        name: 'Basketball',
        subtitle: 'Dribbling · Shooting · Agility',
        ageGroup: 'Ages 7 – 14',
        minAge: 7,
        maxAge: 14,
        sessionsPerWeek: '2–3 sessions/week',
        icon: Zap,
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80',
        description:
          'Fundamental basketball mechanics including crossover dribbling, shooting form, defensive footwork, and fast-break decision making.',
        skills: ['Crossover Dribbling', 'Shooting Mechanics', 'Court Footwork', 'Rebound & Fast Break'],
        locations: ['KK NAGAR', 'MAHALINGAPURAM', 'KOLATHUR'],
        days: 'Mon, Wed, Fri',
        monthlyFee: '₹4,500 / month',
        status: 'Active',
      },
      {
        id: 'PROG-ATH',
        name: 'Athletics',
        subtitle: 'Running · Jumping · Speed',
        ageGroup: 'Ages 6 – 14',
        minAge: 6,
        maxAge: 14,
        sessionsPerWeek: '2–3 sessions/week',
        icon: Award,
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80',
        description:
          'Track and field athletics training building explosive sprint mechanics, stride posture, hurdle jumps, and endurance resilience.',
        skills: ['Sprint Acceleration', 'Long Jump Technique', 'Endurance Pacing', 'Ladder & Cone Agility'],
        locations: ['KK NAGAR', 'KILPAUK', 'ANNA NAGAR', 'MAHALINGAPURAM'],
        days: 'Tue, Thu, Sat',
        monthlyFee: '₹3,800 / month',
        status: 'Active',
      },
    ];

    // Merge programs from Admin database
    const dbPrograms = (data.programs || []).map((p) => {
      const iconMap = {
        Activity,
        Trophy,
        Zap,
        Award,
        Flame,
        Target,
        Sparkles,
      };
      const ResolvedIcon = typeof p.icon === 'string' && iconMap[p.icon] ? iconMap[p.icon] : Activity;

      return {
        id: p.id,
        name: p.name,
        subtitle: p.subtitle || `${p.name} Coaching Curriculum`,
        ageGroup: p.ageGroup || `Ages ${p.minAge || 4} – ${p.maxAge || 12}`,
        minAge: p.minAge || 4,
        maxAge: p.maxAge || 12,
        sessionsPerWeek: p.sessionsPerWeek || '2–3 sessions/week',
        icon: ResolvedIcon,
        image: p.image || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        description: p.description || 'Age-appropriate physical development coaching.',
        skills: p.skills || ['Agility', 'Movement', 'Balance'],
        locations: p.locations || (p.location ? [p.location] : ['KK NAGAR']),
        days: p.days || 'Mon, Wed, Fri',
        monthlyFee: p.feeMonthly ? `₹${p.feeMonthly.toLocaleString()} / month` : '₹4,000 / month',
        status: p.status || 'Active',
      };
    });

    // Combine avoiding duplicate IDs
    const combined = [...defaultPrograms];
    dbPrograms.forEach((p) => {
      const idx = combined.findIndex((cp) => cp.name.toLowerCase() === p.name.toLowerCase());
      if (idx >= 0) {
        combined[idx] = { ...combined[idx], ...p };
      } else {
        combined.push(p);
      }
    });

    return combined.filter((p) => p.status === 'Active');
  }, [data.programs]);

  // Filtered Programs based on Active Child Location and UI Filters
  const filteredPrograms = useMemo(() => {
    return allProgramsList.filter((prog) => {
      // Location Filtering: respect active child location & selection
      if (selectedLocation !== 'All Locations') {
        const normLoc = selectedLocation.toLowerCase().trim();
        const hasLoc = prog.locations.some((l) => l.toLowerCase().trim() === normLoc);
        if (!hasLoc) return false;
      } else {
        // Under All Locations, prioritize programs offered at child center or available
        const hasChildCenter = prog.locations.some((l) => l.toLowerCase().trim() === childCenter.toLowerCase().trim());
        // Show if offered at child's center or if child's center is in list
        if (!hasChildCenter && prog.locations.length > 0 && !prog.locations.includes(childCenter)) {
          // If child is at KK NAGAR, we only show programs offered at KK NAGAR
          return false;
        }
      }

      // Program Name Filter
      if (selectedProgram !== 'All Programs') {
        if (prog.name !== selectedProgram) return false;
      }

      // Age Group Filter
      if (selectedAgeGroup !== 'All Age Groups') {
        if (prog.ageGroup !== selectedAgeGroup) return false;
      }

      // Days Filter
      if (selectedDays !== 'All Days') {
        if (!prog.days.toLowerCase().includes(selectedDays.toLowerCase().slice(0, 3))) return false;
      }

      return true;
    });
  }, [allProgramsList, selectedLocation, selectedProgram, selectedAgeGroup, selectedDays, childCenter]);

  // Available Locations for dropdown: restrict to child's center and available centers
  const filterLocationsList = useMemo(() => {
    const set = new Set(['All Locations', childCenter]);
    (data.locations || []).forEach((l) => {
      if (l.status !== 'Inactive') set.add(l.name);
    });
    return Array.from(set);
  }, [childCenter, data.locations]);

  // Handle Book Demo Submission
  const handleSubmitDemo = (e) => {
    e.preventDefault();
    if (!selectedProgramDetail) return;

    addDemo({
      childName: leadForm.childName,
      parentName: leadForm.parentName,
      parentPhone: leadForm.parentPhone,
      parentEmail: leadForm.parentEmail,
      program: selectedProgramDetail.name,
      center: childCenter,
      preferredDate: leadForm.preferredDate,
      status: 'Demo Requested',
      source: 'Parent Portal - Programs & Achievements',
    });

    addEnquiry({
      childName: leadForm.childName,
      parentName: leadForm.parentName,
      parentPhone: leadForm.parentPhone,
      parentEmail: leadForm.parentEmail,
      program: selectedProgramDetail.name,
      center: childCenter,
      stage: 'Demo Requested',
      source: 'Parent Portal - Programs',
    });

    setIsDemoModalOpen(false);
    addToast(`Demo booked for ${selectedProgramDetail.name}! Coach will contact you.`, 'success');
  };

  // Handle Enquiry Submission
  const handleSubmitEnquiry = (e) => {
    e.preventDefault();
    if (!selectedProgramDetail) return;

    addEnquiry({
      childName: leadForm.childName,
      parentName: leadForm.parentName,
      parentPhone: leadForm.parentPhone,
      parentEmail: leadForm.parentEmail,
      program: selectedProgramDetail.name,
      center: childCenter,
      stage: 'New Enquiry',
      source: 'Parent Portal - Programs',
      notes: leadForm.notes,
    });

    setIsEnquiryModalOpen(false);
    addToast(`Enquiry submitted for ${selectedProgramDetail.name}! Admissions will reach out.`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* ============================================================ */}
      {/* 1. PAGE HEADER                                               */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
        <div>
          <div className="flex items-center gap-2.5">
            {/* Medal Icon matching reference design */}
            <div className="w-9 h-9 rounded-2xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0 border border-[#F4510B]/20">
              <Award className="w-5 h-5 text-[#F4510B]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight">
              Programs &amp; Achievements
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[#172B50]/70 mt-1 pl-11.5">
            Discover new adventures and celebrate every little milestone.
          </p>
        </div>

        {/* Multi-Child Selector if parent has multiple children */}
        {myChildren.length > 1 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsChildSelectorOpen(!isChildSelectorOpen)}
              className="px-3.5 py-2 bg-white border border-[#172B5020] rounded-2xl text-xs font-black text-[#172B50] flex items-center gap-2 shadow-2xs hover:border-[#F4510B]"
            >
              <User size={13} className="text-[#F4510B]" />
              <span>Viewing: {activeChild.name}</span>
              <ChevronDown size={14} className="text-[#172B5060]" />
            </button>

            {isChildSelectorOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-[#172B5018] rounded-2xl shadow-xl py-1.5 z-40">
                {myChildren.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      if (onSelectChild) onSelectChild(ch.id);
                      setIsChildSelectorOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-bold flex items-center justify-between hover:bg-[#FFF4E8] ${
                      activeChild.id === ch.id ? 'text-[#F4510B] bg-[#FFF4E8]/60 font-black' : 'text-[#172B50]'
                    }`}
                  >
                    <span>
                      {ch.name} ({ch.center || 'KK NAGAR'})
                    </span>
                    {activeChild.id === ch.id && <Check size={13} className="text-[#F4510B]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. TAB 1: EXPLORE PROGRAMS (REFERENCE DESIGN EXACT REPLICA)  */}
      {/* ============================================================ */}
      {activeTab === 'explore' && (
        <div className="space-y-5">
          {/* ============================================================ */}
          {/* A. HERO BANNER: Find the right adventure for your child!     */}
          {/* ============================================================ */}
          <div className="rounded-3xl bg-[#FFF5EC] border border-[#FEE6D5] p-5 sm:p-6 shadow-sm relative overflow-hidden text-left">
            {/* Subtle background curved glow */}
            <div className="absolute -bottom-12 -right-12 w-96 h-96 rounded-full bg-gradient-to-br from-[#F4510B]/12 via-[#F4510B]/5 to-transparent pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center relative z-10">
              {/* Left Content (5 Cols) */}
              <div className="md:col-span-5 space-y-2.5">
                <h2 className="text-2xl sm:text-[27px] font-black text-[#172B50] tracking-tight leading-tight">
                  <span>Find the right adventure </span>
                  <span className="text-[#172B50] relative inline-block">
                    for your child!
                    <span className="absolute left-0 bottom-0.5 w-full h-1 bg-[#F4510B] rounded-full" />
                  </span>
                </h2>
                <p className="text-xs sm:text-[13px] font-semibold text-[#172B50]/75 leading-relaxed max-w-sm">
                  Explore sports programs designed to build confidence, coordination and physical skills.
                </p>
              </div>

              {/* Center Cutout Illustration (3 Cols) */}
              <div className="md:col-span-3 flex justify-center py-1">
                <div className="relative flex items-center justify-center">
                  <div className="w-52 h-32 rounded-2xl overflow-hidden flex items-center justify-center shadow-xs">
                    <img
                      src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=450&auto=format&fit=crop&q=80"
                      alt="Children playing sports"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              {/* Right Checklist (4 Cols) */}
              <div className="md:col-span-4 space-y-2.5 sm:pl-4">
                {[
                  'Builds core physical skills',
                  'Improves focus & confidence',
                  'Encourages teamwork',
                  'Supports overall growth',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#F4510B] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs font-bold text-[#172B50]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* B. MAIN TWO TABS: Explore Programs & My Child's Achievements */}
          {/* ============================================================ */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('explore')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                activeTab === 'explore'
                  ? 'bg-[#F4510B] text-white'
                  : 'bg-white border border-[#172B50]/15 text-[#172B50] hover:bg-[#FFF4E8]'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Explore Programs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('achievements')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                activeTab === 'achievements'
                  ? 'bg-[#F4510B] text-white'
                  : 'bg-white border border-[#172B50]/15 text-[#172B50] hover:bg-[#FFF4E8]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-[#172B50]" />
              <span>My Child's Achievements</span>
            </button>
          </div>

          {/* ============================================================ */}
          {/* C. CASCADING FUNCTIONAL FILTERS                              */}
          {/* ============================================================ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {/* 1. Location */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLocOpen(!isLocOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2 bg-white border border-[#172B50]/15 rounded-xl text-xs font-bold text-[#172B50] hover:border-[#F4510B]/40 shadow-2xs transition-all"
              >
                <span className="flex items-center gap-2 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                  <span className="truncate">{selectedLocation}</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/50 shrink-0" />
              </button>
              {isLocOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#172B50]/15 rounded-xl shadow-lg py-1 z-30">
                  {filterLocationsList.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setSelectedLocation(loc);
                        setIsLocOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] flex items-center justify-between"
                    >
                      <span>{loc}</span>
                      {selectedLocation === loc && <Check className="w-3 h-3 text-[#F4510B]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Programs */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProgOpen(!isProgOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2 bg-white border border-[#172B50]/15 rounded-xl text-xs font-bold text-[#172B50] hover:border-[#F4510B]/40 shadow-2xs transition-all"
              >
                <span className="flex items-center gap-2 truncate">
                  <Layers className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                  <span className="truncate">{selectedProgram}</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/50 shrink-0" />
              </button>
              {isProgOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#172B50]/15 rounded-xl shadow-lg py-1 z-30">
                  {['All Programs', 'Foundational Movement', 'Football', 'Basketball', 'Athletics'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setSelectedProgram(p);
                        setIsProgOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] flex items-center justify-between"
                    >
                      <span>{p}</span>
                      {selectedProgram === p && <Check className="w-3 h-3 text-[#F4510B]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Age Group */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAgeOpen(!isAgeOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2 bg-white border border-[#172B50]/15 rounded-xl text-xs font-bold text-[#172B50] hover:border-[#F4510B]/40 shadow-2xs transition-all"
              >
                <span className="flex items-center gap-2 truncate">
                  <Users className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                  <span className="truncate">{selectedAgeGroup}</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/50 shrink-0" />
              </button>
              {isAgeOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#172B50]/15 rounded-xl shadow-lg py-1 z-30">
                  {['All Age Groups', 'Ages 3 – 5', 'Ages 5 – 12', 'Ages 7 – 14', 'Ages 6 – 14'].map((ag) => (
                    <button
                      key={ag}
                      type="button"
                      onClick={() => {
                        setSelectedAgeGroup(ag);
                        setIsAgeOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] flex items-center justify-between"
                    >
                      <span>{ag}</span>
                      {selectedAgeGroup === ag && <Check className="w-3 h-3 text-[#F4510B]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Days */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDaysOpen(!isDaysOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2 bg-white border border-[#172B50]/15 rounded-xl text-xs font-bold text-[#172B50] hover:border-[#F4510B]/40 shadow-2xs transition-all"
              >
                <span className="flex items-center gap-2 truncate">
                  <Calendar className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                  <span className="truncate">{selectedDays}</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/50 shrink-0" />
              </button>
              {isDaysOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#172B50]/15 rounded-xl shadow-lg py-1 z-30">
                  {['All Days', 'Mon, Wed, Fri', 'Tue, Thu, Sat', 'Weekend Only'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setSelectedDays(d);
                        setIsDaysOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] flex items-center justify-between"
                    >
                      <span>{d}</span>
                      {selectedDays === d && <Check className="w-3 h-3 text-[#F4510B]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* D. SPLIT LAYOUT: Our Programs (Left) | Achievements Preview  */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT: OUR PROGRAMS (8 Cols on LG) */}
            <div className="lg:col-span-8 space-y-3.5 text-left">
              <div>
                <h2 className="text-lg font-black text-[#172B50] tracking-tight">Our Programs</h2>
                <p className="text-xs font-semibold text-[#172B50]/65">
                  Age-appropriate sports programs for every Little Spartan.
                </p>
              </div>

              {/* 2x2 Programs Grid matching reference screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredPrograms.map((prog) => {
                  const ProgIcon = prog.icon;
                  return (
                    <div
                      key={prog.id}
                      onClick={() => setSelectedProgramDetail(prog)}
                      className="bg-white rounded-2xl border border-[#172B50]/12 p-3 shadow-2xs hover:shadow-card hover:border-[#F4510B]/40 transition-all cursor-pointer flex gap-3 group"
                    >
                      {/* Thumbnail Image */}
                      <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-[#FFF4E8]">
                        <img
                          src={prog.image}
                          alt={prog.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <ProgIcon className="w-4 h-4 text-[#F4510B] shrink-0" />
                            <h3 className="text-sm font-black text-[#172B50] truncate">{prog.name}</h3>
                          </div>
                          <p className="text-[10.5px] font-semibold text-[#172B50]/60 mt-0.5 truncate">
                            {prog.subtitle}
                          </p>

                          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-[10px] font-black border border-[#16A34A]/20">
                            {prog.ageGroup}
                          </span>
                        </div>

                        {/* Bottom Row */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] font-bold text-[#172B50]/70 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#172B50]/50" />
                            <span>{prog.sessionsPerWeek}</span>
                          </span>

                          <div className="w-6 h-6 rounded-full border border-[#F4510B]/40 flex items-center justify-center text-[#F4510B] group-hover:bg-[#F4510B] group-hover:text-white transition-colors">
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: CHILD ACHIEVEMENTS PREVIEW (4 Cols on LG) */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-[#172B50]/12 p-4 sm:p-5 shadow-card space-y-4 text-left">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#172B50]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#FFF0E6] text-[#F4510B] flex items-center justify-center shrink-0 border border-[#F4510B]/20 shadow-2xs">
                    <Trophy className="w-4 h-4 text-[#F4510B]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#172B50] leading-none">
                      {activeChild.name}'s Achievements
                    </h3>
                    <p className="text-[10.5px] font-bold text-[#172B50]/60 mt-1">
                      {activeChild.name} | Age: {activeChild.age || 5} | {activeChild.batch || 'LE - B1'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('achievements')}
                  className="w-7 h-7 rounded-full border border-[#F4510B]/30 flex items-center justify-center text-[#F4510B] hover:bg-[#FFF4E8] transition-all cursor-pointer"
                  title="View full achievements"
                >
                  <ChevronRight className="w-4 h-4 text-[#F4510B]" />
                </button>
              </div>

              {/* 3 Metric Summary Boxes (Peach, Purple, Mint) */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-[#FFF4E8] border border-[#F4510B]/20 shadow-2xs">
                  <Award className="w-4 h-4 text-[#F4510B] mx-auto mb-1" />
                  <div className="text-lg font-black text-[#172B50] leading-none">{kpiCounts.badges}</div>
                  <div className="text-[10px] font-bold text-[#172B50]/70 mt-0.5">Badges</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#FAF5FF] border border-purple-200 shadow-2xs">
                  <Trophy className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <div className="text-lg font-black text-[#172B50] leading-none">{kpiCounts.milestones}</div>
                  <div className="text-[10px] font-bold text-[#172B50]/70 mt-0.5">Milestones</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#F0FDF4] border border-emerald-200 shadow-2xs">
                  <FileText className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <div className="text-lg font-black text-[#172B50] leading-none">{kpiCounts.certificates}</div>
                  <div className="text-[10px] font-bold text-[#172B50]/70 mt-0.5">Certificates</div>
                </div>
              </div>

              {/* Recent Achievement Section */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-black text-[#172B50]">
                  <span>Recent Achievement</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('achievements')}
                    className="text-[10.5px] text-[#F4510B] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>View All</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Highlight Card */}
                <div className="p-3 rounded-2xl bg-[#FFFBF7] border border-[#F4510B]/20 flex items-center gap-3 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                    <Medal className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-[#172B50] truncate">Balance Champion</h4>
                    <p className="text-[10px] font-semibold text-[#172B50]/70 mt-0.5 leading-snug">
                      For excellent body control and stability.
                    </p>
                    <span className="text-[9.5px] font-bold text-[#172B50]/50 block mt-1">20 Nov, 2026</span>
                  </div>
                </div>
              </div>

              {/* Progress Highlights (Dynamic Bars from Approved Evaluation Data) */}
              <div className="space-y-2 pt-1 border-t border-[#172B50]/10">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#172B50]">
                  <BarChart2 className="w-4 h-4 text-[#F4510B]" />
                  <span>Progress Highlights</span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {/* Balance */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-semibold text-[#172B50]">
                      <span>Balance</span>
                      <span className="font-black text-[#172B50]">{progressHighlights.balance}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressHighlights.balance}%` }}
                      />
                    </div>
                  </div>

                  {/* Jumping & Landing */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-semibold text-[#172B50]">
                      <span>Jumping &amp; Landing</span>
                      <span className="font-black text-[#172B50]">{progressHighlights.jumping}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressHighlights.jumping}%` }}
                      />
                    </div>
                  </div>

                  {/* Throwing & Catching */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-semibold text-[#172B50]">
                      <span>Throwing &amp; Catching</span>
                      <span className="font-black text-[#172B50]">{progressHighlights.throwing}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressHighlights.throwing}%` }}
                      />
                    </div>
                  </div>

                  {/* Running */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-semibold text-[#172B50]">
                      <span>Running</span>
                      <span className="font-black text-[#172B50]">{progressHighlights.running}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressHighlights.running}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. TAB 2: MY CHILD'S ACHIEVEMENTS FULL VIEW                  */}
      {/* ============================================================ */}
      {activeTab === 'achievements' && (
        <div className="space-y-5 text-left">
          {/* A. Hero Banner for Child */}
          <div className="rounded-3xl bg-[#FFF5EC] border border-[#FEE6D5] p-5 sm:p-6 shadow-sm relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Child Profile Info (5 Cols) */}
              <div className="md:col-span-5 flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-[#F4510B]/30 shadow-xs shrink-0">
                  <img
                    src={
                      activeChild.avatar ||
                      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80'
                    }
                    alt={activeChild.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">{activeChild.name}</h2>
                  <div className="text-xs font-semibold text-[#172B50]/70">
                    Age: {activeChild.age || 5} | Batch: {activeChild.batch || 'LE - B1'}
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#172B50]/15 text-[10.5px] font-black text-[#172B50]">
                      {activeChild.program || 'Foundational Movement'}
                    </span>
                    <span className="text-[11px] font-bold text-[#172B50]/70 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#F4510B]" />
                      <span>{childCenter}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Cheerful Running Kid Cutout (2 Cols) */}
              <div className="md:col-span-2 hidden sm:flex justify-center">
                <div className="w-28 h-24 rounded-xl overflow-hidden shadow-2xs">
                  <img
                    src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&auto=format&fit=crop&q=80"
                    alt="Active Child"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* 4 KPI Cards (5 Cols) */}
              <div className="md:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-white border border-[#172B50]/12 shadow-2xs">
                  <Award className="w-4 h-4 text-[#F4510B] mx-auto mb-1" />
                  <div className="text-xl font-black text-[#172B50] leading-none">{kpiCounts.badges}</div>
                  <div className="text-[10px] font-bold text-[#172B50]/65 mt-0.5">Badges</div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#172B50]/12 shadow-2xs">
                  <Trophy className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <div className="text-xl font-black text-[#172B50] leading-none">{kpiCounts.milestones}</div>
                  <div className="text-[10px] font-bold text-[#172B50]/65 mt-0.5">Milestones</div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#172B50]/12 shadow-2xs">
                  <FileText className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <div className="text-xl font-black text-[#172B50] leading-none">{kpiCounts.certificates}</div>
                  <div className="text-[10px] font-bold text-[#172B50]/65 mt-0.5">Certificates</div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#172B50]/12 shadow-2xs">
                  <TrendingUp className="w-4 h-4 text-[#F4510B] mx-auto mb-1" />
                  <div className="text-xl font-black text-[#F4510B] leading-none">
                    {Math.round(
                      (progressHighlights.balance +
                        progressHighlights.jumping +
                        progressHighlights.throwing +
                        progressHighlights.running) /
                        4
                    )}
                    %
                  </div>
                  <div className="text-[10px] font-bold text-[#172B50]/65 mt-0.5">Overall Progress</div>
                </div>
              </div>
            </div>
          </div>

          {/* B. Navigation Tabs inside Achievements */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('explore')}
              className="px-4 py-2 rounded-xl text-xs font-black bg-white border border-[#172B50]/15 text-[#172B50] hover:bg-[#FFF4E8] flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Rocket className="w-3.5 h-3.5 text-[#F4510B]" />
              <span>Explore Programs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('achievements')}
              className="px-4 py-2 rounded-xl text-xs font-black bg-[#F4510B] text-white flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-white" />
              <span>My Child's Achievements</span>
            </button>
          </div>

          {/* C. Two Column Content: Badges & Milestones (Left), Published Evaluations & Certificates (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT COLUMN: Badges & Milestones (6 Cols) */}
            <div className="lg:col-span-6 space-y-5">
              {/* Badges Earned */}
              <div className="bg-white rounded-3xl border border-[#172B50]/12 p-5 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#172B50]">Badges Earned ({kpiCounts.badges})</h3>
                  <span className="text-xs font-bold text-[#F4510B]">Verified by Super Coach</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                  {[
                    { name: 'Balance Champ', bg: 'bg-amber-100', border: 'border-amber-300', icon: Scale, text: 'text-amber-800' },
                    { name: 'Focus Star', bg: 'bg-indigo-100', border: 'border-indigo-300', icon: Target, text: 'text-indigo-800' },
                    { name: 'Team Player', bg: 'bg-purple-100', border: 'border-purple-300', icon: Users, text: 'text-purple-800' },
                    { name: 'Active Spartan', bg: 'bg-emerald-100', border: 'border-emerald-300', icon: Zap, text: 'text-emerald-800' },
                    { name: 'Consistency Pro', bg: 'bg-orange-100', border: 'border-orange-300', icon: Flame, text: 'text-orange-800' },
                    { name: 'Movement Master', bg: 'bg-cyan-100', border: 'border-cyan-300', icon: Sparkles, text: 'text-cyan-800' },
                  ].map((b, idx) => {
                    const BIcon = b.icon;
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-2xl bg-[#F8FAFC] border border-[#172B50]/10 flex flex-col items-center shadow-2xs hover:scale-105 transition-transform"
                      >
                        <div className={`w-10 h-10 rounded-xl ${b.bg} ${b.border} border flex items-center justify-center mb-1.5 shadow-2xs`}>
                          <BIcon className={`w-5 h-5 ${b.text}`} />
                        </div>
                        <span className="text-[10px] font-black text-[#172B50] leading-tight text-center truncate w-full">
                          {b.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Milestones Timeline */}
              <div className="bg-white rounded-3xl border border-[#172B50]/12 p-5 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#172B50]">Milestones Unlocked</h3>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                    {kpiCounts.milestones} Achieved
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      title: 'Level 1 Foundational Movement Complete',
                      desc: 'Successfully mastered basic motor skills, safe two-foot landing, and ladder coordination.',
                      date: '15 Nov, 2026',
                      icon: Trophy,
                      color: 'text-purple-600 bg-purple-50 border-purple-200',
                    },
                    {
                      title: '25 Training Sessions Milestone',
                      desc: 'Demonstrated exceptional attendance and dedication at KK Nagar training center.',
                      date: '02 Nov, 2026',
                      icon: Star,
                      color: 'text-amber-600 bg-amber-50 border-amber-200',
                    },
                    {
                      title: 'First Solo Agility Drill Assessment',
                      desc: 'Executed hurdle jumps and cone shuttle drill with precision and zero penalties.',
                      date: '18 Oct, 2026',
                      icon: Zap,
                      color: 'text-blue-600 bg-blue-50 border-blue-200',
                    },
                  ].map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-[#172B50]/10 bg-[#F8FAFC] flex items-start gap-3 shadow-2xs"
                    >
                      <div className={`w-8 h-8 rounded-xl ${m.color} border flex items-center justify-center shrink-0`}>
                        <m.icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-[#172B50]">{m.title}</h4>
                          <span className="text-[10px] font-bold text-[#172B50]/50">{m.date}</span>
                        </div>
                        <p className="text-[11px] text-[#172B50]/70 mt-1">{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Published Coach Evaluations & Official Certificates (6 Cols) */}
            <div className="lg:col-span-6 space-y-5">
              {/* Official Certificates */}
              <div className="bg-white rounded-3xl border border-[#172B50]/12 p-5 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#172B50]">Official Certificates ({kpiCounts.certificates})</h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    Verified Digital Credentials
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: 'CERT-LS-2026-001',
                      title: 'Spartan Physical Literacy & Movement Certificate',
                      program: 'Foundational Movement (Level 1)',
                      issuedDate: '15 Nov, 2026',
                      signatory: 'Academy Director & Super Coach',
                    },
                    {
                      id: 'CERT-LS-2026-002',
                      title: 'Spartan Junior Sprint & Agility Badge Certificate',
                      program: 'Athletics & Obstacle Course',
                      issuedDate: '01 Oct, 2026',
                      signatory: 'Senior Athletic Coach',
                    },
                  ].map((cert) => (
                    <div
                      key={cert.id}
                      className="p-4 rounded-2xl border border-[#172B50]/10 bg-[#F8FAFC] flex items-center justify-between gap-3 shadow-2xs hover:border-[#F4510B]/30 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                          <FileText size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-[#172B50] leading-snug">{cert.title}</h4>
                          <div className="text-[10px] text-[#172B50]/60 mt-0.5">
                            {cert.program} • Issued: {cert.issuedDate}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedCertificateModal(cert)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#172B50]/20 text-[#172B50] text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1 shrink-0 shadow-2xs"
                      >
                        <Download size={12} />
                        <span>View</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Published Coach Evaluation Reports */}
              <div className="bg-white rounded-3xl border border-[#172B50]/12 p-5 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#172B50]">Published Evaluation History</h3>
                  <span className="text-xs font-bold text-[#172B50]/60">
                    {childApprovedEvaluations.length} Published Report{childApprovedEvaluations.length === 1 ? '' : 's'}
                  </span>
                </div>

                {childApprovedEvaluations.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#172B50]/10 text-center space-y-1.5">
                    <CheckCircle2 size={24} className="text-emerald-500 mx-auto" />
                    <h4 className="text-xs font-bold text-[#172B50]">Up to Date with Evaluations</h4>
                    <p className="text-[11px] text-[#172B50]/65 max-w-xs mx-auto">
                      All approved coach evaluations published by Super Coach will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {childApprovedEvaluations.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-4 rounded-2xl border border-[#172B50]/10 bg-[#F8FAFC] space-y-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-[#F4510B] uppercase tracking-wider block">
                              {ev.cycle || 'Monthly Assessment'} • {ev.location || childCenter}
                            </span>
                            <h4 className="text-xs font-black text-[#172B50] mt-0.5">
                              {ev.program || activeChild.program}
                            </h4>
                          </div>
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Approved &amp; Published
                          </span>
                        </div>

                        {/* Coach Observation */}
                        {ev.coachObservation && (
                          <div className="p-2.5 rounded-xl bg-white border border-[#172B50]/08 text-xs text-[#172B50]/80">
                            <span className="font-bold text-[#172B50] block mb-0.5">Coach Remark:</span>
                            <span>{ev.coachObservation}</span>
                          </div>
                        )}

                        {/* Super Coach Notes */}
                        {ev.superCoachNotes && (
                          <div className="p-2.5 rounded-xl bg-[#FFF4E8] border border-[#F4510B]/20 text-xs text-[#172B50]">
                            <span className="font-bold text-[#F4510B] block mb-0.5">Super Coach Endorsement:</span>
                            <span>{ev.superCoachNotes}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] font-bold text-[#172B50]/50 pt-1 border-t border-[#172B50]/08">
                          <span>Evaluated by: {ev.coachName || 'Academy Coach'}</span>
                          <span>Verified by: Super Coach Anita R.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. PROGRAM DETAILS MODAL                                      */}
      {/* ============================================================ */}
      {selectedProgramDetail && (
        <Modal
          isOpen={!!selectedProgramDetail}
          onClose={() => setSelectedProgramDetail(null)}
          title={selectedProgramDetail.name}
          subtitle={`${selectedProgramDetail.subtitle} • ${selectedProgramDetail.ageGroup}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-left">
            <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
              <img
                src={selectedProgramDetail.image}
                alt={selectedProgramDetail.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B50]/60">About the Program</h4>
              <p className="text-xs text-[#172B50] leading-relaxed mt-1">{selectedProgramDetail.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#172B50]/10">
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#172B50]/10">
                <span className="text-[10px] font-bold text-[#172B50]/60 block">Age Eligibility</span>
                <span className="text-xs font-black text-[#172B50]">{selectedProgramDetail.ageGroup}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#172B50]/10">
                <span className="text-[10px] font-bold text-[#172B50]/60 block">Weekly Frequency</span>
                <span className="text-xs font-black text-[#172B50]">{selectedProgramDetail.sessionsPerWeek}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#172B50]/10 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-[#172B50]/60 block">Academy Fee</span>
                <span className="text-xs font-black text-[#F4510B]">{selectedProgramDetail.monthlyFee}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B50]/60 mb-2">Curriculum Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedProgramDetail.skills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#FFF4E8] text-[#F4510B] text-xs font-bold border border-[#F4510B]/20"
                  >
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#172B50]/10">
              <button
                type="button"
                onClick={() => {
                  setIsEnquiryModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] bg-white border border-[#172B50]/20 hover:bg-slate-50 transition"
              >
                Submit Enquiry
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDemoModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-[#F4510B] hover:bg-[#d94406] shadow-md transition"
              >
                Book Free Demo Class
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* 5. BOOK FREE DEMO CLASS MODAL                                */}
      {/* ============================================================ */}
      {isDemoModalOpen && selectedProgramDetail && (
        <Modal
          isOpen={isDemoModalOpen}
          onClose={() => setIsDemoModalOpen(false)}
          title={`Book Free Demo: ${selectedProgramDetail.name}`}
          subtitle={`Trial session for ${activeChild.name} at ${childCenter}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmitDemo} className="space-y-3.5 text-left text-xs">
            <div>
              <label className="block font-bold text-[#172B50] mb-1">Child Name *</label>
              <input
                type="text"
                required
                value={leadForm.childName}
                onChange={(e) => setLeadForm({ ...leadForm, childName: e.target.value })}
                className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50] bg-white font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-[#172B50] mb-1">Parent Name *</label>
                <input
                  type="text"
                  required
                  value={leadForm.parentName}
                  onChange={(e) => setLeadForm({ ...leadForm, parentName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50] bg-white font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-[#172B50] mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={leadForm.parentPhone}
                  onChange={(e) => setLeadForm({ ...leadForm, parentPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50] bg-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-[#172B50] mb-1">Center Location</label>
                <input
                  type="text"
                  disabled
                  value={childCenter}
                  className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50] bg-slate-100 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-[#172B50] mb-1">Preferred Date *</label>
                <input
                  type="date"
                  required
                  value={leadForm.preferredDate}
                  onChange={(e) => setLeadForm({ ...leadForm, preferredDate: e.target.value })}
                  className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50] bg-white font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#172B50]/10">
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(false)}
                className="px-4 py-2 rounded-xl font-bold text-[#172B50] hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-black text-white bg-[#F4510B] hover:bg-[#d94406] shadow-md"
              >
                Confirm Demo Session
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* 6. SUBMIT ENQUIRY MODAL                                      */}
      {/* ============================================================ */}
      {isEnquiryModalOpen && selectedProgramDetail && (
        <Modal
          isOpen={isEnquiryModalOpen}
          onClose={() => setIsEnquiryModalOpen(false)}
          title={`Enquire: ${selectedProgramDetail.name}`}
          subtitle={`Inquire about enrollment, timing and fees at ${childCenter}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmitEnquiry} className="space-y-3.5 text-left text-xs">
            <div>
              <label className="block font-bold text-[#172B50] mb-1">Child Name *</label>
              <input
                type="text"
                required
                value={leadForm.childName}
                onChange={(e) => setLeadForm({ ...leadForm, childName: e.target.value })}
                className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50] bg-white font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-[#172B50] mb-1">Parent Name *</label>
                <input
                  type="text"
                  required
                  value={leadForm.parentName}
                  onChange={(e) => setLeadForm({ ...leadForm, parentName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50] bg-white font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-[#172B50] mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={leadForm.parentPhone}
                  onChange={(e) => setLeadForm({ ...leadForm, parentPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50] bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#172B50] mb-1">Questions / Specific Requests</label>
              <textarea
                rows={3}
                value={leadForm.notes}
                onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                className="w-full px-3 py-2 border border-[#172B5020] rounded-xl text-[#172B50] bg-white font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#172B50]/10">
              <button
                type="button"
                onClick={() => setIsEnquiryModalOpen(false)}
                className="px-4 py-2 rounded-xl font-bold text-[#172B50] hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-black text-white bg-[#F4510B] hover:bg-[#d94406] shadow-md"
              >
                Send Enquiry
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* 7. DIGITAL CERTIFICATE MODAL                                 */}
      {/* ============================================================ */}
      {selectedCertificateModal && (
        <Modal
          isOpen={!!selectedCertificateModal}
          onClose={() => setSelectedCertificateModal(null)}
          title="Little Spartans Sports Academy - Certificate of Achievement"
          subtitle={`Credential ID: ${selectedCertificateModal.id}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-center p-2">
            <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-50/60 to-white border-2 border-amber-300 shadow-inner space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
                <Trophy size={24} />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#F4510B] block">
                  Certificate of Achievement
                </span>
                <h3 className="text-base sm:text-lg font-black text-[#172B50] mt-1">
                  {selectedCertificateModal.title}
                </h3>
              </div>

              <p className="text-xs text-[#172B50]/75">
                This is proudly presented to{' '}
                <strong className="text-[#172B50] underline decoration-[#F4510B]/50">{activeChild.name}</strong> for
                successful performance in{' '}
                <strong className="text-[#172B50]">{selectedCertificateModal.program}</strong> at{' '}
                <strong className="text-[#172B50]">{childCenter}</strong>.
              </p>

              <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-bold text-[#172B50]/60">
                <span>Date: {selectedCertificateModal.issuedDate}</span>
                <span>Verified: {selectedCertificateModal.signatory}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-[#F4510B] hover:bg-[#d94406] shadow-md flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>Download / Print Certificate</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
