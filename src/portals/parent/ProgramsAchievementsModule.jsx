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
  Flag,
  ArrowRight,
  Shield,
  HelpCircle,
  X,
  Send,
  Phone,
  Mail,
  User,
  Heart
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';

export default function ProgramsAchievementsModule() {
  const {
    data,
    currentUser,
    addEnquiry,
    addDemo,
    addToast
  } = useCrm();

  // Active Main Tab: 'explore' (Explore Programs) vs 'achievements' (My Child's Achievements)
  const [activeTab, setActiveTab] = useState('explore');

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

  // Selected Program for Details Modal
  const [selectedProgramDetail, setSelectedProgramDetail] = useState(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

  // Demo / Enquiry Form
  const [leadForm, setLeadForm] = useState({
    parentName: currentUser?.name || 'Karthik K',
    parentPhone: '+91 98765 00002',
    parentEmail: currentUser?.email || 'parent.aarav@littlespartans.co.in',
    childName: 'Aarav K',
    childAge: '5',
    preferredDate: '2026-11-28',
    notes: 'Interested in weekend demo session.'
  });

  // Current active parent child (defaults to Aarav K matching reference screenshots)
  const activeChild = useMemo(() => {
    // Check data.students for Aarav K or first student
    const student = (data.students || []).find(s => 
      s.name?.toLowerCase().includes('aarav') || 
      s.id === 'STU-LS-002'
    ) || (data.students || [])[0] || {
      id: 'STU-LS-002',
      rollNo: 'LS002',
      name: 'Aarav K',
      age: 5,
      gender: 'Male',
      center: 'KK NAGAR',
      program: 'Foundational Movement',
      batch: 'LE - B1',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      evaluations: {
        balance: 80,
        jumping: 75,
        throwing: 85,
        running: 78,
        overall: 86
      }
    };

    return student;
  }, [data.students]);

  // Master Programs Catalog matching the reference design exactly
  const allProgramsList = useMemo(() => {
    return [
      {
        id: 'PROG-FM',
        name: 'Foundational Movement',
        subtitle: 'Balance · Coordination · Movement',
        ageGroup: 'Ages 3 – 5',
        minAge: 3,
        maxAge: 5,
        sessionsPerWeek: '2–3 sessions/week',
        icon: Activity,
        iconColor: 'text-[#F4510B]',
        iconBg: 'bg-[#FFF0E6]',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        description: 'Age-appropriate physical literacy introducing agility obstacle drills, safe two-foot landing, and dynamic balance games.',
        skills: ['Balance & Core Stability', 'Safe Jumping & Landing', 'Throwing & Catching', 'Running Agility'],
        locations: ['KK NAGAR', 'KILPAUK', 'MAHALINGAPURAM', 'ANNA NAGAR'],
        days: 'Mon, Wed, Fri',
        monthlyFee: '₹4,000 / month'
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
        iconColor: 'text-[#F4510B]',
        iconBg: 'bg-[#FFF0E6]',
        image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&auto=format&fit=crop&q=80',
        description: 'Grassroots football coaching developing ball mastery, directional control, short passes, and small-sided match awareness.',
        skills: ['Close Ball Dribbling', 'First Touch Passing', 'Target Shooting', 'Tactical Positioning'],
        locations: ['KK NAGAR', 'KILPAUK', 'ANNA NAGAR'],
        days: 'Tue, Thu, Sat',
        monthlyFee: '₹4,200 / month'
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
        iconColor: 'text-[#F4510B]',
        iconBg: 'bg-[#FFF0E6]',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80',
        description: 'Fundamental basketball mechanics including crossover dribbling, shooting form, defensive footwork, and fast-break decision making.',
        skills: ['Crossover Dribbling', 'Shooting Mechanics', 'Court Footwork', 'Rebound & Fast Break'],
        locations: ['KK NAGAR', 'MAHALINGAPURAM', 'KOLATHUR'],
        days: 'Mon, Wed, Fri',
        monthlyFee: '₹4,500 / month'
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
        iconColor: 'text-[#F4510B]',
        iconBg: 'bg-[#FFF0E6]',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80',
        description: 'Track and field athletics training building explosive sprint mechanics, stride posture, hurdle jumps, and endurance resilience.',
        skills: ['Sprint Acceleration', 'Long Jump Technique', 'Endurance Pacing', 'Ladder & Cone Agility'],
        locations: ['KK NAGAR', 'KILPAUK', 'ANNA NAGAR', 'MAHALINGAPURAM'],
        days: 'Tue, Thu, Sat',
        monthlyFee: '₹3,800 / month'
      }
    ];
  }, []);

  // Filtered Programs
  const filteredPrograms = useMemo(() => {
    return allProgramsList.filter(prog => {
      if (selectedLocation !== 'All Locations') {
        const normLoc = selectedLocation.toLowerCase().trim();
        const hasLoc = prog.locations.some(l => l.toLowerCase().trim() === normLoc);
        if (!hasLoc) return false;
      }
      if (selectedProgram !== 'All Programs') {
        if (prog.name !== selectedProgram) return false;
      }
      if (selectedAgeGroup !== 'All Age Groups') {
        if (prog.ageGroup !== selectedAgeGroup) return false;
      }
      if (selectedDays !== 'All Days') {
        if (!prog.days.toLowerCase().includes(selectedDays.toLowerCase().slice(0, 3))) return false;
      }
      return true;
    });
  }, [allProgramsList, selectedLocation, selectedProgram, selectedAgeGroup, selectedDays]);

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
      center: selectedLocation !== 'All Locations' ? selectedLocation : 'KK NAGAR',
      preferredDate: leadForm.preferredDate,
      status: 'Demo Requested',
      source: 'Parent Portal - Programs & Achievements'
    });

    addEnquiry({
      childName: leadForm.childName,
      parentName: leadForm.parentName,
      parentPhone: leadForm.parentPhone,
      parentEmail: leadForm.parentEmail,
      program: selectedProgramDetail.name,
      center: selectedLocation !== 'All Locations' ? selectedLocation : 'KK NAGAR',
      stage: 'Demo Requested',
      source: 'Parent Portal - Programs'
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
      center: selectedLocation !== 'All Locations' ? selectedLocation : 'KK NAGAR',
      stage: 'New Enquiry',
      notes: leadForm.notes,
      source: 'Parent Portal - Explore Programs'
    });

    setIsEnquiryModalOpen(false);
    addToast(`Enquiry submitted for ${selectedProgramDetail.name}! Admissions desk will call.`, 'success');
  };

  return (
    <div className="space-y-5 animate-slide-up pb-8 font-sans">

      {/* ============================================================ */}
      {/* 1. TOP HEADER (Exact Match with Reference Design)            */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="text-left space-y-0.5">
          <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-black text-[#172B50] tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#FFF0E6] flex items-center justify-center text-[#F4510B] border border-[#F4510B]/30 shadow-2xs shrink-0">
              <Award className="w-4.5 h-4.5 text-[#F4510B]" />
            </span>
            <span>{activeTab === 'explore' ? 'Programs & Achievements' : "My Child's Achievements"}</span>
          </h1>
          <p className="text-xs sm:text-[13px] font-bold text-[#172B50]/65 tracking-tight text-left pl-10.5">
            {activeTab === 'explore'
              ? 'Discover new adventures and celebrate every little milestone.'
              : "Track your child's milestones, badges, certificates and overall progress."
            }
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. TAB 1: EXPLORE PROGRAMS VIEW (SCREENSHOT 1)               */}
      {/* ============================================================ */}
      {activeTab === 'explore' && (
        <div className="space-y-5">
          
          {/* ============================================================ */}
          {/* A. HERO BANNER: Find the right adventure for your child!     */}
          {/* ============================================================ */}
          <div className="rounded-2xl bg-[#FFF4E8] border border-[#172B50]/10 p-5 sm:p-6 shadow-2xs relative overflow-hidden">
            
            {/* Subtle background curved glow */}
            <div className="absolute -bottom-10 -right-10 w-96 h-96 rounded-full bg-gradient-to-br from-[#F4510B]/12 via-[#F4510B]/5 to-transparent pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center relative z-10">
              
              {/* Left Content (5 Cols) */}
              <div className="md:col-span-5 text-left space-y-2">
                <h2 className="text-2xl sm:text-[26px] font-black text-[#172B50] tracking-tight leading-snug">
                  <span>Find the right adventure </span>
                  <span className="text-[#F4510B] underline decoration-[#F4510B]/40 decoration-wavy">for your child!</span>
                </h2>
                <p className="text-xs sm:text-[13px] font-bold text-[#172B50]/70 leading-relaxed max-w-sm">
                  Explore sports programs designed to build confidence, coordination and physical skills.
                </p>
              </div>

              {/* Center Cutout Illustration (3 Cols) */}
              <div className="md:col-span-3 flex justify-center py-1">
                <div className="relative flex items-center justify-center">
                  <div className="w-48 h-32 rounded-2xl overflow-hidden flex items-center justify-center shadow-xs">
                    <img
                      src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80"
                      alt="Children playing sports"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Right Bullet Points (4 Cols) */}
              <div className="md:col-span-4 space-y-2 text-left sm:pl-4">
                {[
                  'Builds core physical skills',
                  'Improves focus & confidence',
                  'Encourages teamwork',
                  'Supports overall growth'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#F4510B] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="text-xs font-black text-[#172B50]">{item}</span>
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
          {/* C. DYNAMIC CASCADING FILTERS                                 */}
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
                  {['All Locations', 'KK NAGAR', 'KILPAUK', 'MAHALINGAPURAM', 'ANNA NAGAR', 'KOLATHUR'].map(loc => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => { setSelectedLocation(loc); setIsLocOpen(false); }}
                      className="w-full text-left px-3.5 py-1.5 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] flex items-center justify-between"
                    >
                      <span>{loc}</span>
                      {selectedLocation === loc && <Check className="w-3 h-3 text-[#F4510B]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Program */}
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
                  {['All Programs', 'Foundational Movement', 'Football', 'Basketball', 'Athletics'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setSelectedProgram(p); setIsProgOpen(false); }}
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
                  {['All Age Groups', 'Ages 3 – 5', 'Ages 5 – 12', 'Ages 7 – 14', 'Ages 6 – 14'].map(ag => (
                    <button
                      key={ag}
                      type="button"
                      onClick={() => { setSelectedAgeGroup(ag); setIsAgeOpen(false); }}
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
                  {['All Days', 'Mon, Wed, Fri', 'Tue, Thu, Sat', 'Weekend Only'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => { setSelectedDays(d); setIsDaysOpen(false); }}
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
                <h2 className="text-base font-black text-[#172B50] tracking-tight">Our Programs</h2>
                <p className="text-xs font-bold text-[#172B50]/60">Age-appropriate sports programs for every Little Spartan.</p>
              </div>

              {/* 2x2 Programs Grid matching reference screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredPrograms.map(prog => {
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
                          <p className="text-[10.5px] font-bold text-[#172B50]/60 mt-0.5 truncate">{prog.subtitle}</p>
                          
                          <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-[10px] font-black border border-[#16A34A]/20">
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
            <div className="lg:col-span-4 bg-white rounded-2xl border border-[#172B50]/12 p-4 shadow-card space-y-4 text-left">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#172B50]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF0E6] text-[#F4510B] flex items-center justify-center shrink-0 border border-[#F4510B]/20">
                    <Trophy className="w-4 h-4 text-[#F4510B]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#172B50] leading-none">{activeChild.name}'s Achievements</h3>
                    <p className="text-[10px] font-bold text-[#172B50]/60 mt-1">
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

              {/* 3 Metric Summary Boxes */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-[#FFF4E8] border border-[#F4510B]/20">
                  <Award className="w-4 h-4 text-[#F4510B] mx-auto mb-1" />
                  <div className="text-base font-black text-[#172B50] leading-none">6</div>
                  <div className="text-[10px] font-bold text-[#172B50]/70 mt-0.5">Badges</div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF5FF] border border-purple-200">
                  <Trophy className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <div className="text-base font-black text-[#172B50] leading-none">3</div>
                  <div className="text-[10px] font-bold text-[#172B50]/70 mt-0.5">Milestones</div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-emerald-200">
                  <FileText className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <div className="text-base font-black text-[#172B50] leading-none">2</div>
                  <div className="text-[10px] font-bold text-[#172B50]/70 mt-0.5">Certificates</div>
                </div>
              </div>

              {/* Recent Achievement */}
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

                <div className="p-3 rounded-xl bg-[#FFF4E8]/60 border border-[#F4510B]/20 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FFF0E6] border border-[#F4510B]/40 flex items-center justify-center shrink-0">
                    <Award className="w-4.5 h-4.5 text-[#F4510B]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-[#172B50] truncate">Balance Champion</div>
                    <div className="text-[10px] font-bold text-[#172B50]/65 truncate">For excellent body control and stability.</div>
                    <div className="text-[9.5px] font-bold text-[#172B50]/50 mt-0.5">20 Nov, 2026</div>
                  </div>
                </div>
              </div>

              {/* Progress Highlights */}
              <div className="space-y-2 pt-1 border-t border-[#172B50]/10">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#172B50]">
                  <BarChart2 className="w-3.5 h-3.5 text-[#F4510B]" />
                  <span>Progress Highlights</span>
                </div>

                <div className="space-y-2 text-xs font-bold">
                  {/* Balance */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#172B50]">Balance</span>
                      <span className="text-[#172B50] font-black">{activeChild.evaluations?.balance || 80}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeChild.evaluations?.balance || 80}%` }} />
                    </div>
                  </div>

                  {/* Jumping & Landing */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#172B50]">Jumping &amp; Landing</span>
                      <span className="text-[#172B50] font-black">{activeChild.evaluations?.jumping || 75}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeChild.evaluations?.jumping || 75}%` }} />
                    </div>
                  </div>

                  {/* Throwing & Catching */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#172B50]">Throwing &amp; Catching</span>
                      <span className="text-[#172B50] font-black">{activeChild.evaluations?.throwing || 85}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeChild.evaluations?.throwing || 85}%` }} />
                    </div>
                  </div>

                  {/* Running */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#172B50]">Running</span>
                      <span className="text-[#172B50] font-black">{activeChild.evaluations?.running || 78}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeChild.evaluations?.running || 78}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. TAB 2: MY CHILD'S ACHIEVEMENTS FULL VIEW (SCREENSHOT 2)   */}
      {/* ============================================================ */}
      {activeTab === 'achievements' && (
        <div className="space-y-5">
          
          {/* ============================================================ */}
          {/* A. HERO BANNER: Child Card + Cutout + 4 KPI Cards            */}
          {/* ============================================================ */}
          <div className="rounded-2xl bg-[#FFF4E8] border border-[#172B50]/10 p-5 sm:p-6 shadow-2xs relative overflow-hidden text-left">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              
              {/* Child Profile Info (5 Cols) */}
              <div className="md:col-span-4 flex items-center gap-3.5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 ring-[#F4510B]/30 shadow-xs shrink-0">
                  <img
                    src={activeChild.avatar || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80'}
                    alt={activeChild.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">{activeChild.name}</h2>
                  <div className="text-xs font-bold text-[#172B50]/65">
                    Age: {activeChild.age || 5} | Batch: {activeChild.batch || 'LE - B1'}
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#172B50]/15 text-[10.5px] font-black text-[#172B50]">
                      {activeChild.program || 'Foundational Movement'}
                    </span>
                    <span className="text-[11px] font-bold text-[#172B50]/70 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#F4510B]" />
                      <span>{activeChild.center || 'KK Nagar'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Cheerful Running Kid Cutout (3 Cols) */}
              <div className="md:col-span-3 hidden sm:flex justify-center">
                <div className="w-32 h-28 rounded-xl overflow-hidden shadow-2xs">
                  <img
                    src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&auto=format&fit=crop&q=80"
                    alt="Active Child"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* 4 KPI Cards (5 Cols) */}
              <div className="md:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-3 rounded-xl bg-white border border-[#172B50]/12 shadow-2xs">
                  <Award className="w-4 h-4 text-[#F4510B] mx-auto mb-1" />
                  <div className="text-xl font-black text-[#172B50] leading-none">6</div>
                  <div className="text-[10px] font-bold text-[#172B50]/65 mt-0.5">Badges</div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#172B50]/12 shadow-2xs">
                  <Trophy className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <div className="text-xl font-black text-[#172B50] leading-none">3</div>
                  <div className="text-[10px] font-bold text-[#172B50]/65 mt-0.5">Milestones</div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#172B50]/12 shadow-2xs">
                  <FileText className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <div className="text-xl font-black text-[#172B50] leading-none">2</div>
                  <div className="text-[10px] font-bold text-[#172B50]/65 mt-0.5">Certificates</div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#172B50]/12 shadow-2xs">
                  <TrendingUp className="w-4 h-4 text-[#F4510B] mx-auto mb-1" />
                  <div className="text-xl font-black text-[#F4510B] leading-none">86%</div>
                  <div className="text-[10px] font-bold text-[#172B50]/65 mt-0.5">Overall Progress</div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* B. SUB-TABS: My Child's Achievements | Programs              */}
          {/* ============================================================ */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('achievements')}
              className="px-4 py-2 rounded-xl text-xs font-black bg-[#F4510B] text-white flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>My Child's Achievements</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('explore')}
              className="px-4 py-2 rounded-xl text-xs font-black bg-white border border-[#172B50]/15 text-[#172B50] hover:bg-[#FFF4E8] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Programs</span>
            </button>

            <button
              type="button"
              onClick={() => addToast('Full progress report available for download', 'info')}
              className="px-4 py-2 rounded-xl text-xs font-black bg-white border border-[#172B50]/15 text-[#172B50] hover:bg-[#FFF4E8] flex items-center gap-2 transition-all cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#172B50]/70" />
              <span>Progress Report</span>
            </button>
          </div>

          {/* ============================================================ */}
          {/* C. TWO-COLUMN MAIN CONTENT                                   */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* LEFT COLUMN: Badges Earned & Recent Achievements (6 Cols) */}
            <div className="lg:col-span-6 space-y-5 text-left">
              
              {/* Badges Earned (6) */}
              <div className="bg-white rounded-2xl border border-[#172B50]/12 p-5 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#172B50]">Badges Earned (6)</h3>
                  <button type="button" onClick={() => addToast('Showing all 6 earned badges', 'info')} className="text-xs font-bold text-[#F4510B] hover:underline cursor-pointer">
                    View All →
                  </button>
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
                      <div key={idx} className="p-2 rounded-xl bg-white border border-[#172B50]/10 flex flex-col items-center shadow-2xs hover:scale-105 transition-transform">
                        <div className={`w-9 h-9 rounded-xl ${b.bg} ${b.border} border flex items-center justify-center mb-1 shadow-2xs`}>
                          <BIcon className={`w-4 h-4 ${b.text}`} />
                        </div>
                        <span className="text-[10px] font-black text-[#172B50] leading-tight text-center truncate w-full">
                          {b.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Achievements Timeline */}
              <div className="bg-white rounded-2xl border border-[#172B50]/12 p-5 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#172B50]">Recent Achievements</h3>
                </div>

                <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-[#172B50]/12 pl-1">
                  
                  {/* Timeline Item 1 */}
                  <div className="relative flex items-start gap-3 pl-2">
                    <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 shadow-2xs z-10">
                      <Trophy className="w-3.5 h-3.5 text-amber-700" />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-xs font-black text-[#172B50]">Balance Champion</h4>
                        <p className="text-[11px] font-medium text-[#172B50]/65">For excellent body control and stability.</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#172B50]/50 shrink-0">20 Nov, 2026</span>
                    </div>
                  </div>

                  {/* Timeline Item 2 */}
                  <div className="relative flex items-start gap-3 pl-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 shadow-2xs z-10">
                      <Flag className="w-3.5 h-3.5 text-emerald-700" />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-xs font-black text-[#172B50]">Foundational Milestone Completed</h4>
                        <p className="text-[11px] font-medium text-[#172B50]/65">Completed all core movement skills.</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#172B50]/50 shrink-0">05 Nov, 2026</span>
                    </div>
                  </div>

                  {/* Timeline Item 3 */}
                  <div className="relative flex items-start gap-3 pl-2">
                    <div className="w-7 h-7 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center shrink-0 shadow-2xs z-10">
                      <FileText className="w-3.5 h-3.5 text-purple-700" />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-xs font-black text-[#172B50]">Program Participation Certificate</h4>
                        <p className="text-[11px] font-medium text-[#172B50]/65">Foundational Movement – Quarter 3</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#172B50]/50 shrink-0">01 Nov, 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Certificates & Skill Progress (6 Cols) */}
            <div className="lg:col-span-6 space-y-5 text-left">
              
              {/* My Certificates (2) */}
              <div className="bg-white rounded-2xl border border-[#172B50]/12 p-5 shadow-card space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#172B50]">My Certificates (2)</h3>
                  <button type="button" onClick={() => addToast('Opening certificate archive', 'info')} className="text-xs font-bold text-[#F4510B] hover:underline cursor-pointer">
                    View All →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Certificate 1 */}
                  <div className="p-3.5 rounded-xl border border-amber-300/80 bg-[#FFFDF9] flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-[#172B50] truncate">Program Participation Certificate</h4>
                        <p className="text-[10px] font-medium text-[#172B50]/60 truncate">Foundational Movement Quarter 3</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToast('Downloading certificate PDF...', 'success')}
                      className="p-1.5 rounded-lg border border-[#172B50]/15 text-[#172B50] hover:bg-[#FFF4E8] cursor-pointer shrink-0"
                      title="Download Certificate"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Certificate 2 */}
                  <div className="p-3.5 rounded-xl border border-amber-300/80 bg-[#FFFDF9] flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-[#172B50] truncate">Milestone Certificate Balance &amp; Coordination</h4>
                        <p className="text-[10px] font-medium text-[#172B50]/60 truncate">For excellent improvement in balance and control</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToast('Downloading certificate PDF...', 'success')}
                      className="p-1.5 rounded-lg border border-[#172B50]/15 text-[#172B50] hover:bg-[#FFF4E8] cursor-pointer shrink-0"
                      title="Download Certificate"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Skill Progress (Current Cycle) */}
              <div className="bg-white rounded-2xl border border-[#172B50]/12 p-5 shadow-card space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#172B50]">Skill Progress (Current Cycle)</h3>
                </div>

                <div className="space-y-3">
                  {/* Balance */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                      <Scale className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="w-32 text-xs font-bold text-[#172B50] truncate">Balance</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '80%' }} />
                    </div>
                    <span className="text-xs font-black text-[#172B50] w-8 text-right">80%</span>
                  </div>

                  {/* Jumping & Landing */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                      <Activity className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <span className="w-32 text-xs font-bold text-[#172B50] truncate">Jumping &amp; Landing</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '75%' }} />
                    </div>
                    <span className="text-xs font-black text-[#172B50] w-8 text-right">75%</span>
                  </div>

                  {/* Throwing & Catching */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
                      <Target className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <span className="w-32 text-xs font-bold text-[#172B50] truncate">Throwing &amp; Catching</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '85%' }} />
                    </div>
                    <span className="text-xs font-black text-[#172B50] w-8 text-right">85%</span>
                  </div>

                  {/* Running */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-200">
                      <Zap className="w-3.5 h-3.5 text-cyan-600" />
                    </div>
                    <span className="w-32 text-xs font-bold text-[#172B50] truncate">Running</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '78%' }} />
                    </div>
                    <span className="text-xs font-black text-[#172B50] w-8 text-right">78%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* D. NEXT MILESTONE BANNER (BOTTOM OF ACHIEVEMENTS VIEW)       */}
          {/* ============================================================ */}
          <div className="bg-[#FFF4E8] border border-[#F4510B]/20 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] border border-[#F4510B]/30 flex items-center justify-center shrink-0 shadow-2xs">
                <Flag className="w-6 h-6 text-[#F4510B]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#F4510B] tracking-wider">Next Milestone</span>
                <h3 className="text-base font-black text-[#172B50]">Agility Master</h3>
                <p className="text-xs font-medium text-[#172B50]/70">Complete agility drills with improved speed and control.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Progress Bar */}
              <div className="w-full sm:w-56 space-y-1">
                <div className="flex justify-between text-xs font-black text-[#F4510B]">
                  <span>60% Completed</span>
                </div>
                <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[#172B50]/10">
                  <div className="h-full bg-[#F4510B] rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              {/* Target Date */}
              <div className="flex items-center gap-2 pl-3 border-l border-[#172B50]/15 shrink-0">
                <Calendar className="w-4 h-4 text-[#F4510B]" />
                <div className="leading-tight">
                  <div className="text-[9.5px] font-black uppercase text-[#172B50]/60">Target</div>
                  <div className="text-xs font-black text-[#172B50]">Dec 15, 2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MODAL: PROGRAM DETAILS                                    */}
      {/* ============================================================ */}
      {selectedProgramDetail && (
        <Modal
          isOpen={Boolean(selectedProgramDetail)}
          onClose={() => setSelectedProgramDetail(null)}
          title={selectedProgramDetail.name}
          subtitle={selectedProgramDetail.subtitle}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-left">
            {/* Banner Image */}
            <div className="w-full h-44 rounded-2xl overflow-hidden bg-[#FFF4E8]">
              <img
                src={selectedProgramDetail.image}
                alt={selectedProgramDetail.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-[#FFF4E8] border border-[#F4510B]/20">
                <div className="text-[10px] font-bold text-[#172B50]/60">Age Group</div>
                <div className="text-xs font-black text-[#F4510B] mt-0.5">{selectedProgramDetail.ageGroup}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FFF4E8] border border-[#F4510B]/20">
                <div className="text-[10px] font-bold text-[#172B50]/60">Schedule</div>
                <div className="text-xs font-black text-[#172B50] mt-0.5">{selectedProgramDetail.days}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FFF4E8] border border-[#F4510B]/20">
                <div className="text-[10px] font-bold text-[#172B50]/60">Tuition Fee</div>
                <div className="text-xs font-black text-[#172B50] mt-0.5">{selectedProgramDetail.monthlyFee}</div>
              </div>
            </div>

            {/* Program Overview */}
            <div>
              <h4 className="text-xs font-black uppercase text-[#172B50]/70 tracking-wider mb-1">Program Overview</h4>
              <p className="text-xs font-medium text-[#172B50] leading-relaxed">
                {selectedProgramDetail.description}
              </p>
            </div>

            {/* Core Skills Developed */}
            <div>
              <h4 className="text-xs font-black uppercase text-[#172B50]/70 tracking-wider mb-1.5">Core Skills Developed</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedProgramDetail.skills.map((skill, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-bold text-[#172B50]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Training Centers */}
            <div>
              <h4 className="text-xs font-black uppercase text-[#172B50]/70 tracking-wider mb-1.5">Available Centers</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedProgramDetail.locations.map(loc => (
                  <span key={loc} className="px-3 py-1 rounded-full bg-[#FFF4E8] border border-[#F4510B]/20 text-xs font-bold text-[#172B50] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#F4510B]" />
                    <span>{loc}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-[#172B50]/15 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsEnquiryModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-black border border-[#172B50]/25 rounded-xl text-[#172B50] hover:bg-[#FFF4E8] cursor-pointer"
              >
                Send Enquiry
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDemoModalOpen(true);
                }}
                className="px-5 py-2 text-xs font-black bg-[#F4510B] text-white rounded-xl shadow-md hover:brightness-110 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Book Free Trial Demo</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* 5. MODAL: BOOK TRIAL DEMO                                    */}
      {/* ============================================================ */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        title="Book Free Trial Demo Session"
        subtitle={`Experience a trial session in ${selectedProgramDetail?.name} for ${leadForm.childName}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitDemo} className="space-y-3.5 text-left">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Child Name</label>
            <input
              type="text"
              required
              value={leadForm.childName}
              onChange={(e) => setLeadForm({ ...leadForm, childName: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B50]/20 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Child Age</label>
              <input
                type="number"
                required
                value={leadForm.childAge}
                onChange={(e) => setLeadForm({ ...leadForm, childAge: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B50]/20 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Preferred Date</label>
              <input
                type="date"
                required
                value={leadForm.preferredDate}
                onChange={(e) => setLeadForm({ ...leadForm, preferredDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B50]/20 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Parent Contact Number</label>
            <input
              type="tel"
              required
              value={leadForm.parentPhone}
              onChange={(e) => setLeadForm({ ...leadForm, parentPhone: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B50]/20 rounded-xl"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black bg-[#F4510B] text-white rounded-xl shadow-md hover:brightness-110 cursor-pointer"
            >
              Confirm Demo Booking
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* 6. MODAL: GENERAL ENQUIRY                                    */}
      {/* ============================================================ */}
      <Modal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        title="Send Program Enquiry"
        subtitle={`Request batch timings & fees for ${selectedProgramDetail?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitEnquiry} className="space-y-3.5 text-left">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Your Question / Notes</label>
            <textarea
              rows={3}
              required
              value={leadForm.notes}
              onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
              className="w-full p-2.5 text-xs bg-white text-[#172B50] border border-[#172B50]/20 rounded-xl resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Contact Phone</label>
            <input
              type="tel"
              required
              value={leadForm.parentPhone}
              onChange={(e) => setLeadForm({ ...leadForm, parentPhone: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B50]/20 rounded-xl"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEnquiryModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black bg-[#172B50] text-white rounded-xl shadow-md hover:bg-[#F4510B] cursor-pointer"
            >
              Submit Enquiry
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}