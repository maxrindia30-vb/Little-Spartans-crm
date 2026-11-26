import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  ShieldCheck,
  X,
  Send,
  Phone,
  Mail,
  User,
  Heart,
  BarChart2,
  Medal,
  Share2,
  Lock,
  Compass,
  Info,
  CalendarCheck,
  Flag,
  FileCheck
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import SportsCertificate from '../../components/common/SportsCertificate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  DynamicBadgeIcon,
  RabbitJumpingBadge,
  FoxBearTurnsBadge,
  DuckHoppingBadge,
  BeamBalancingBadge,
  TargetThrowingBadge,
  SprinterRunningBadge,
  JumpRopeSkippingBadge,
  FocusStarBadge,
  TeamPlayerBadge,
} from '../../components/common/BadgeIllustrations';
import {
  INITIAL_CHILD_JOURNEYS,
  BADGE_STATUSES,
  RADAR_DIMENSIONS,
  PROGRAM_BADGE_CATALOG,
  getRadarCoordinates,
} from '../../services/childDevelopmentService';

export default function ProgramsAchievementsModule({
  parentProfile = null,
  myChildren = [],
  activeChild: propActiveChild = null,
  selectedChildId = '',
  onSelectChild = null,
  initialTab = 'journey', // 'journey' | 'milestones' | 'profile' | 'certificates' | 'evaluations' | 'explore'
}) {
  const { data, currentUser, addEnquiry, addDemo, addToast } = useCrm();

  // Active Main Sub-Tab: 'journey' (Development Journey) | 'milestones' | 'profile' | 'certificates' | 'evaluations' | 'explore'
  const [activeSubTab, setActiveSubTab] = useState(initialTab || 'journey');

  useEffect(() => {
    if (initialTab && initialTab !== activeSubTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab]);

  // Selected Child Resolution
  const activeChild = useMemo(() => {
    if (propActiveChild) return propActiveChild;
    if (myChildren && myChildren.length > 0) {
      if (selectedChildId) {
        const found = myChildren.find((c) => c.id === selectedChildId);
        if (found) return found;
      }
      return myChildren[0];
    }
    const student =
      (data.students || []).find((s) => s.id === 'STU-LS-002' || s.name?.includes('Aarav')) ||
      (data.students || [])[0] || {
        id: 'STU-LS-002',
        rollNo: 'LS002',
        name: 'Aarav K',
        age: 5,
        gender: 'Male',
        center: 'KK NAGAR',
        program: 'Foundational Movement',
        batch: 'LE - B1',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      };
    return student;
  }, [propActiveChild, myChildren, selectedChildId, data.students]);

  // Resolve child's development journey from centralized CRM context
  const childJourney = useMemo(() => {
    const journeys = data.childJourneys || INITIAL_CHILD_JOURNEYS;
    const matched = journeys[activeChild.id];
    if (matched) return matched;

    // Fallback based on child name or default
    if (activeChild.name?.toLowerCase().includes('diya') || activeChild.id === 'STU-LS-004') {
      return journeys['STU-LS-004'] || INITIAL_CHILD_JOURNEYS['STU-LS-004'];
    }
    return journeys['STU-LS-002'] || INITIAL_CHILD_JOURNEYS['STU-LS-002'];
  }, [data.childJourneys, activeChild]);

  // Badge Details Modal State (Centered Popup Modal)
  const [selectedBadgeModal, setSelectedBadgeModal] = useState(null);

  // Lock background scrolling and handle Escape key for the Badge Details Modal
  useEffect(() => {
    if (!selectedBadgeModal) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedBadgeModal(null);
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedBadgeModal]);

  // Handle Badge Click (Skill Trail, Earned Badges grid, and All Badges modal)
  const handleBadgeClick = (badge) => {
    if (!badge) return;
    if (badge.status === BADGE_STATUSES.LOCKED || badge.locked) {
      addToast('Keep exploring to unlock this badge! 🌟', 'info');
      return;
    }

    // Dynamic resolution from catalog or pathway if extra details are needed
    let catalogMatch = null;
    try {
      const programBadges = (PROGRAM_BADGE_CATALOG && PROGRAM_BADGE_CATALOG[childJourney?.program]) || [];
      catalogMatch = programBadges.find((b) => b.id === badge.badgeId || b.id === badge.id || b.name === badge.name);
      if (!catalogMatch && PROGRAM_BADGE_CATALOG) {
        Object.values(PROGRAM_BADGE_CATALOG).forEach((list) => {
          if (!catalogMatch && Array.isArray(list)) {
            const found = list.find((b) => b.id === badge.badgeId || b.id === badge.id || b.name === badge.name);
            if (found) catalogMatch = found;
          }
        });
      }
    } catch (e) {}

    const resolvedBadge = {
      ...badge,
      badgeId: badge.badgeId || badge.id,
      name: badge.name,
      category: badge.category || catalogMatch?.category || 'Skill Development',
      status: badge.status || BADGE_STATUSES.COMPLETED,
      completedDate: badge.completedDate || badge.date || 'Oct 31, 2026',
      progress: badge.progress ?? (badge.status === BADGE_STATUSES.COMPLETED ? 100 : 60),
      description: badge.description || catalogMatch?.description || `Demonstrated high proficiency in ${badge.name}.`,
      whatChildDid: (badge.whatChildDid && badge.whatChildDid.length > 0)
        ? badge.whatChildDid
        : (catalogMatch?.whatChildDid || [
            `Mastered key ${badge.name} technique with confidence`,
            'Showed active listening and positive effort in all drills',
            'Demonstrated teamwork and sportsmanship with peers',
          ]),
      iconType: badge.iconType || catalogMatch?.iconType || 'star',
      program: selectedChild?.program || childJourney?.program || 'Foundational Movement',
      batch: selectedChild?.batch || childJourney?.batch || 'LE - B1',
      location: selectedChild?.location || childJourney?.center || 'KK Nagar',
      coachName: badge.coachName || childJourney?.coachName || 'Coach Karthik',
      coachTitle: badge.coachTitle || childJourney?.coachTitle || 'Primary Coach',
      coachAvatar: badge.coachAvatar || childJourney?.coachAvatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      verified: badge.verified ?? true,
      verifiedBy: badge.verifiedBy || 'Super Coach Alex',
      verifiedDate: badge.verifiedDate || badge.completedDate || 'Oct 31, 2026',
    };

    setSelectedBadgeModal(resolvedBadge);
  };

  // Modals State
  const [selectedCertModal, setSelectedCertModal] = useState(null);
  const certDownloadRef = React.useRef(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadCertificatePdf = async (cert) => {
    if (!certDownloadRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(certDownloadRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFDF8',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      // Landscape A4 is 297mm x 210mm.
      // Aspect ratio is 16:10 -> 277mm x 173.1mm, centered vertically.
      pdf.addImage(imgData, 'PNG', 10, 18.5, 277, 173.1);
      const studentClean = (activeChild?.name || 'Athlete').replace(/\s+/g, '_');
      const certNumClean = cert?.certNumber || cert?.id || '2026';
      pdf.save(`Little_Spartans_Certificate_${certNumClean}_${studentClean}.pdf`);
      addToast(`Certificate #${certNumClean} downloaded successfully as PDF!`, 'success');
    } catch (err) {
      console.error('Failed to generate PDF certificate:', err);
      addToast('Could not generate PDF certificate. Please try again.', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  const [isAllBadgesModalOpen, setIsAllBadgesModalOpen] = useState(false);
  const [isAllMilestonesModalOpen, setIsAllMilestonesModalOpen] = useState(false);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(childJourney?.trailPeriod || 'Oct – Dec 2026');

  // KPI calculations derived from real child journey records
  const kpiStats = useMemo(() => {
    const badgesCount = childJourney?.earnedBadges?.length || activeChild.badgesCount || 6;
    const milestonesCount = childJourney?.milestones?.length || activeChild.milestonesCount || 3;
    const certificatesCount = childJourney?.certificates?.length || activeChild.certificatesCount || 2;
    const progress = childJourney?.overallProgress ?? activeChild.overallProgress ?? 80;
    return {
      badges: badgesCount,
      milestones: milestonesCount,
      certificates: certificatesCount,
      progress,
    };
  }, [childJourney, activeChild]);

  // Radar chart coordinates computed dynamically from active child's development profile
  const radarData = useMemo(() => {
    const dims = childJourney?.developmentProfile?.dimensions || {
      balance: 82,
      coordination: 78,
      agility: 80,
      strength: 70,
      flexibility: 75,
      stamina: 65,
      focus: 85,
      confidence: 82,
      instructions: 88,
    };
    const prevDims = childJourney?.developmentProfile?.previousDimensions || {};
    const { spokes, webLevels, getPolygonPoints } = getRadarCoordinates(dims, 120, 110, 80);
    const activePolygon = getPolygonPoints(dims);
    const previousPolygon = getPolygonPoints(prevDims);
    return { spokes, webLevels, activePolygon, previousPolygon, dims };
  }, [childJourney]);

  // Handle Child Switch
  const handleSelectChild = (child) => {
    if (onSelectChild) {
      onSelectChild(child.id);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* ========================================================================= */}
      {/* 1. PAGE TITLE & BREADCRUMB (Global header provides greeting & child select)*/}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 text-left">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">
            Programs &amp; Achievements
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-[#172B50]/65 mt-0.5">
            Parent Portal &gt; Programs &amp; Achievements
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CHILD SUMMARY CARD (AVATAR, BATCH, LOCATION, 4 KPI STATS)              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Child Profile Information */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-1 bg-gradient-to-tr from-[#F4510B] to-amber-400 shadow-sm">
              <img
                src={activeChild.avatar || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80'}
                alt={activeChild.name}
                className="w-full h-full rounded-full object-cover border-2 border-white"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs" title="Enrolled & Active">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">{activeChild.name}</h2>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
              Age: {activeChild.age || 5} Years &nbsp;|&nbsp; Batch: {activeChild.batch || 'LE - B1'}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#EBF5FF] text-[#0284C7] border border-[#0284C7]/20">
                {activeChild.program || childJourney.program || 'Foundational Movement'}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                {activeChild.center || 'KK Nagar'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: 4 Rounded KPI Pill Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 shrink-0">
          {/* 1. Badges */}
          <div className="bg-[#FFF9F3] border border-[#F4510B]/15 rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-center min-w-[95px] text-center shadow-2xs hover:border-[#F4510B]/30 transition-all">
            <div className="w-7 h-7 rounded-full bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center mb-1">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-lg sm:text-xl font-black text-[#172B50] leading-none">{kpiStats.badges}</span>
            <span className="text-[11px] font-bold text-slate-500 mt-1">Badges</span>
          </div>

          {/* 2. Milestones */}
          <div className="bg-[#FAF5FF] border border-purple-200/60 rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-center min-w-[95px] text-center shadow-2xs hover:border-purple-300 transition-all">
            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-1">
              <Flag className="w-4 h-4" />
            </div>
            <span className="text-lg sm:text-xl font-black text-[#172B50] leading-none">{kpiStats.milestones}</span>
            <span className="text-[11px] font-bold text-slate-500 mt-1">Milestones</span>
          </div>

          {/* 3. Certificates */}
          <div
            onClick={() => setActiveSubTab('certificates')}
            className="bg-[#F0FDF4] border border-emerald-200/60 rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-center min-w-[95px] text-center shadow-2xs hover:border-emerald-300 transition-all cursor-pointer"
            title="Click to view all certificates"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
              <FileCheck className="w-4 h-4" />
            </div>
            <span className="text-lg sm:text-xl font-black text-[#172B50] leading-none">{kpiStats.certificates}</span>
            <span className="text-[11px] font-bold text-slate-500 mt-1">Certificates</span>
          </div>

          {/* 4. Overall Progress */}
          <div className="bg-[#FFF4E8] border border-[#F4510B]/25 rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-center min-w-[95px] text-center shadow-2xs hover:border-[#F4510B]/40 transition-all">
            <div className="w-7 h-7 rounded-full bg-[#F4510B] text-white flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-lg sm:text-xl font-black text-[#F4510B] leading-none">{kpiStats.progress}%</span>
            <span className="text-[11px] font-bold text-slate-600 mt-1">Overall Progress</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SUB-NAVIGATION TABS (DEVELOPMENT JOURNEY | MILESTONES | PROFILE | ...)   */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={() => setActiveSubTab('journey')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-2xs ${
            activeSubTab === 'journey'
              ? 'bg-[#F4510B] text-white shadow-[#F4510B]/20'
              : 'bg-white text-[#172B50] border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Development Journey</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('milestones')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-2xs ${
            activeSubTab === 'milestones'
              ? 'bg-[#F4510B] text-white shadow-[#F4510B]/20'
              : 'bg-white text-[#172B50] border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Milestones</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
            {kpiStats.milestones}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-2xs ${
            activeSubTab === 'profile'
              ? 'bg-[#F4510B] text-white shadow-[#F4510B]/20'
              : 'bg-white text-[#172B50] border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Development Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('certificates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-2xs ${
            activeSubTab === 'certificates'
              ? 'bg-[#F4510B] text-white shadow-[#F4510B]/20'
              : 'bg-white text-[#172B50] border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Certificates</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
            {kpiStats.certificates}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('evaluations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-2xs ${
            activeSubTab === 'evaluations'
              ? 'bg-[#F4510B] text-white shadow-[#F4510B]/20'
              : 'bg-white text-[#172B50] border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Evaluations</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN TAB: DEVELOPMENT JOURNEY (MATCHES REFERENCE IMAGE PIXEL-FOR-PIXEL) */}
      {/* ========================================================================= */}
      {activeSubTab === 'journey' && (
        <div className="space-y-5">
          {/* THE INTERACTIVE WINDING SKILL TRAIL */}
          <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex flex-col justify-between overflow-hidden relative">
            {/* Header inside Trail Card */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 relative z-10">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#172B50]/60">
                  Our Quarterly Skill Trail
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#172B50] mt-0.5">
                  {childJourney.trailTitle || 'The Autumn Adventure'}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 max-w-md">
                  {childJourney.trailSubtitle || 'Four little discoveries. Three months of moving, connecting and growing.'}
                </p>
              </div>

              {/* Period Selector Dropdown */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-black text-[#172B50] shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#F4510B]" />
                  <span>{selectedPeriod}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                {isPeriodDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-30">
                    {['Oct – Dec 2026', 'Jul – Sep 2026', 'Apr – Jun 2026'].map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => {
                          setSelectedPeriod(period);
                          setIsPeriodDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-1.5 text-xs font-bold transition-colors ${
                          selectedPeriod === period ? 'bg-[#FFF4E8] text-[#F4510B] font-black' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* THE WINDING TRAIL SVG CANVAS */}
            <div className="relative my-4 py-4 min-h-[310px] flex items-center justify-center overflow-x-auto">
              <div className="w-[740px] sm:w-[780px] h-[280px] relative shrink-0">
                {/* Background Soft Hills & Clouds Landscape */}
                <svg viewBox="0 0 780 280" className="w-full h-full absolute inset-0 pointer-events-none">
                  <defs>
                    <linearGradient id="hillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#F0FDF4" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#DCFCE7" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="pathwayGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#86EFAC" />
                      <stop offset="38%" stopColor="#34D399" />
                      <stop offset="42%" stopColor="#E2D9C8" />
                      <stop offset="100%" stopColor="#E2D9C8" />
                    </linearGradient>
                  </defs>

                  {/* Whimsical Rolling Hills */}
                  <path d="M 0 140 Q 180 80 400 130 T 780 110 L 780 280 L 0 280 Z" fill="url(#hillGrad)" />

                  {/* Cute Background Trees */}
                  <g opacity="0.75">
                    {/* Tree 1 */}
                    <rect x="70" y="80" width="6" height="24" fill="#92400E" rx="2" />
                    <circle cx="73" cy="74" r="14" fill="#6EE7B7" />
                    <circle cx="73" cy="70" r="10" fill="#34D399" />
                    {/* Tree 2 */}
                    <rect x="230" y="60" width="5" height="20" fill="#92400E" rx="2" />
                    <circle cx="232" cy="54" r="12" fill="#A7F3D0" />
                    {/* Tree 3 */}
                    <rect x="620" y="70" width="6" height="22" fill="#92400E" rx="2" />
                    <circle cx="623" cy="65" r="13" fill="#6EE7B7" />
                    {/* Bushes */}
                    <ellipse cx="380" cy="230" rx="16" ry="8" fill="#A7F3D0" opacity="0.6" />
                    <ellipse cx="680" cy="220" rx="18" ry="9" fill="#A7F3D0" opacity="0.6" />
                  </g>

                  {/* Winding Sandy Pathway Base */}
                  <path
                    d="M 60 170 C 180 120, 240 215, 380 175 C 500 135, 610 205, 730 160"
                    fill="none"
                    stroke="#E5DECE"
                    strokeWidth="28"
                    strokeLinecap="round"
                  />

                  {/* Completed Portion of Trail in Vibrant Green */}
                  <path
                    d="M 60 170 C 180 120, 240 215, 330 188"
                    fill="none"
                    stroke="#86EFAC"
                    strokeWidth="26"
                    strokeLinecap="round"
                  />

                  {/* Dashed Center Guide Line */}
                  <path
                    d="M 60 170 C 180 120, 240 215, 380 175 C 500 135, 610 205, 730 160"
                    fill="none"
                    stroke="#D1C7B3"
                    strokeWidth="2.5"
                    strokeDasharray="6 6"
                    strokeLinecap="round"
                  />
                </svg>

                {/* BADGE 1: JUMPING (Locomotor) - COMPLETED */}
                <div
                  onClick={() => {
                    const b = childJourney.pathwayBadges?.[0] || {
                      badgeId: 'BADGE-FM-JUMP',
                      name: 'Jumping',
                      category: 'Locomotor',
                      iconType: 'rabbit',
                      status: BADGE_STATUSES.COMPLETED,
                      completedDate: 'Oct 10, 2026',
                    };
                    handleBadgeClick(b);
                  }}
                  className="absolute left-[70px] top-[75px] flex flex-col items-center cursor-pointer group"
                >
                  <div className="relative">
                    <div className="p-1 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                      <RabbitJumpingBadge size={72} status={BADGE_STATUSES.COMPLETED} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#172B50] mt-1.5 group-hover:text-emerald-600 transition-colors">
                    Jumping
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">Locomotor</span>
                  <div className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                    <span>Completed</span>
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-400 mt-0.5">Oct 10</span>
                </div>

                {/* BADGE 2: TAKING TURNS (Social & Emotional) - COMPLETED */}
                <div
                  onClick={() => {
                    const b = childJourney.pathwayBadges?.[1] || {
                      badgeId: 'BADGE-FM-TURNS',
                      name: 'Taking Turns',
                      category: 'Social & Emotional',
                      iconType: 'fox_bear',
                      status: BADGE_STATUSES.COMPLETED,
                      completedDate: 'Oct 31, 2026',
                    };
                    handleBadgeClick(b);
                  }}
                  className="absolute left-[225px] top-[60px] flex flex-col items-center cursor-pointer group z-20"
                >
                  <div className="relative">
                    <div className="p-1 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                      <FoxBearTurnsBadge size={80} status={BADGE_STATUSES.COMPLETED} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#172B50] mt-1.5 group-hover:text-[#F4510B] transition-colors">
                    Taking Turns
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">Social &amp; Emotional</span>
                  <div className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                    <span>Completed</span>
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-400 mt-0.5">Oct 31</span>
                </div>

                {/* CURRENT PROGRESS PIN: Week 6 of 12 • Nov 12 (Directly between Badge 2 & 3) */}
                <div className="absolute left-[340px] top-[182px] z-20 flex flex-col items-center">
                  <div className="px-3 py-1 rounded-full bg-[#172B50] text-white text-[10px] font-black shadow-md border border-white/20 flex items-center gap-1.5 tracking-tight animate-bounce">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F4510B] animate-pulse"></span>
                    <span>Week 6 of 12 &bull; Nov 12</span>
                  </div>
                  <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-5 border-t-[#172B50] -mt-0.5"></div>
                </div>

                {/* BADGE 3: HOPPING (Locomotor) - IN PROGRESS 60% */}
                <div
                  onClick={() => {
                    const b = childJourney.pathwayBadges?.[2] || {
                      badgeId: 'BADGE-FM-HOP',
                      name: 'Hopping',
                      category: 'Locomotor',
                      iconType: 'duck',
                      status: BADGE_STATUSES.IN_PROGRESS,
                      progress: 60,
                    };
                    handleBadgeClick(b);
                  }}
                  className="absolute left-[440px] top-[95px] flex flex-col items-center cursor-pointer group"
                >
                  <div className="relative">
                    <div className="p-1 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                      <DuckHoppingBadge size={72} status={BADGE_STATUSES.IN_PROGRESS} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center border-2 border-white shadow-xs" title="Currently Practising">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#172B50] mt-1.5 group-hover:text-[#0284C7] transition-colors">
                    Hopping
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">Locomotor</span>
                  <div className="mt-1 text-[10.5px] font-black text-[#F4510B]">
                    In Progress
                  </div>
                  {/* Orange Progress Bar */}
                  <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-[#F4510B] h-full rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <span className="text-[9.5px] font-black text-[#F4510B] mt-0.5">60%</span>
                </div>

                {/* BADGE 4: BALANCING (Stability) - LOCKED */}
                <div
                  onClick={() => {
                    const b = childJourney.pathwayBadges?.[3] || {
                      badgeId: 'BADGE-FM-BAL',
                      name: 'Balancing',
                      category: 'Stability',
                      iconType: 'beam_girl',
                      status: BADGE_STATUSES.LOCKED,
                    };
                    handleBadgeClick(b);
                  }}
                  className="absolute left-[565px] top-[75px] flex flex-col items-center cursor-pointer group opacity-75 hover:opacity-100"
                >
                  <div className="relative">
                    <div className="p-1 rounded-full transition-all duration-300 group-hover:scale-105">
                      <BeamBalancingBadge size={72} status={BADGE_STATUSES.LOCKED} />
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-700 mt-1.5">Balancing</span>
                  <span className="text-[10px] font-semibold text-slate-400">Stability</span>
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Locked</span>
                  </div>
                </div>

                {/* BADGE 5: THROWING (Object Control) - LOCKED */}
                <div
                  onClick={() => {
                    const b = childJourney.pathwayBadges?.[4] || {
                      badgeId: 'BADGE-FM-THROW',
                      name: 'Throwing',
                      category: 'Object Control',
                      iconType: 'target',
                      status: BADGE_STATUSES.LOCKED,
                    };
                    handleBadgeClick(b);
                  }}
                  className="absolute left-[670px] top-[85px] flex flex-col items-center cursor-pointer group opacity-75 hover:opacity-100"
                >
                  <div className="relative">
                    <div className="p-1 rounded-full transition-all duration-300 group-hover:scale-105">
                      <TargetThrowingBadge size={72} status={BADGE_STATUSES.LOCKED} />
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-700 mt-1.5">Throwing</span>
                  <span className="text-[10px] font-semibold text-slate-400">Object Control</span>
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Locked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer inside Trail Card: Badge Counter & Legend */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[#172B50] font-black">
                  <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
                  2 of 5 badges earned
                </span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1 text-[#172B50] font-black">
                  <Flag className="w-3.5 h-3.5 text-purple-600" />
                  3 milestones achieved
                </span>
              </div>

              {/* Legend: Completed, In Progress, Locked */}
              <div className="flex items-center gap-4 text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Completed</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>In Progress</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Lock className="w-3 h-3" />
                  <span>Locked</span>
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. BOTTOM ROW: 3 EQUAL-WIDTH CARDS (MATCHES REFERENCE IMAGE)               */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* CARD 1: BADGES EARNED (6) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-black text-[#172B50]">
                    Badges Earned ({kpiStats.badges})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAllBadgesModalOpen(true)}
                    className="text-xs font-bold text-[#F4510B] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* 3x2 Grid of Badges */}
                <div className="grid grid-cols-3 gap-3 my-4">
                  {(childJourney.earnedBadges || [
                    { id: 'BADGE-FM-JUMP', name: 'Jumping', iconType: 'rabbit', category: 'Locomotor', date: 'Oct 10, 2026' },
                    { id: 'BADGE-FM-TURNS', name: 'Taking Turns', iconType: 'fox_bear', category: 'Social & Emotional', date: 'Oct 31, 2026' },
                    { id: 'BADGE-FM-RUN', name: 'Running', iconType: 'sprinter', category: 'Locomotor', date: 'Sep 15, 2026' },
                    { id: 'BADGE-FM-SKIP', name: 'Skipping', iconType: 'rope_kid', category: 'Locomotor', date: 'Sep 28, 2026' },
                    { id: 'BADGE-FM-STAR', name: 'Focus Star', iconType: 'star', category: 'Cognitive & Focus', date: 'Oct 15, 2026' },
                    { id: 'BADGE-FM-TEAM', name: 'Team Player', iconType: 'friends', category: 'Social & Emotional', date: 'Nov 02, 2026' },
                  ]).slice(0, 6).map((eb) => (
                    <div
                      key={eb.id}
                      onClick={() => {
                        const pathwayMatch = childJourney.pathwayBadges?.find((b) => b.badgeId === eb.id || b.name === eb.name);
                        if (pathwayMatch) {
                          handleBadgeClick(pathwayMatch);
                        } else {
                          handleBadgeClick({
                            ...eb,
                            status: BADGE_STATUSES.COMPLETED,
                            completedDate: eb.date || 'Oct 2026',
                          });
                        }
                      }}
                      className="flex flex-col items-center text-center p-2 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group"
                    >
                      <div className="p-1 rounded-2xl group-hover:scale-105 transition-transform">
                        <DynamicBadgeIcon iconType={eb.iconType || 'star'} size={52} status={BADGE_STATUSES.COMPLETED} />
                      </div>
                      <span className="text-[11px] font-black text-[#172B50] mt-1.5 group-hover:text-[#F4510B] transition-colors leading-tight">
                        {eb.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative Subtle Background Art */}
              <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>Earned across all modules</span>
                <span className="text-emerald-600 font-black">All Verified ✓</span>
              </div>
            </div>

            {/* CARD 2: MILESTONES ACHIEVED (3) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-black text-[#172B50]">
                    Milestones Achieved ({kpiStats.milestones})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAllMilestonesModalOpen(true)}
                    className="text-xs font-bold text-[#F4510B] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* List of 3 Milestones */}
                <div className="space-y-3.5 my-3.5">
                  {(childJourney.milestones || [
                    {
                      id: 'm1',
                      title: 'Level 1 Foundational Movement Complete',
                      description: 'Successfully mastered basic motor skills.',
                      achievedDate: 'Nov 15, 2026',
                      iconType: 'trophy',
                    },
                    {
                      id: 'm2',
                      title: '25 Training Sessions Milestone',
                      description: 'Showed consistent attendance and effort.',
                      achievedDate: 'Nov 02, 2026',
                      iconType: 'star',
                    },
                    {
                      id: 'm3',
                      title: 'First Solo Agility Drill',
                      description: 'Completed the agility circuit independently.',
                      achievedDate: 'Oct 18, 2026',
                      iconType: 'flag',
                    },
                  ]).slice(0, 3).map((ms) => (
                    <div key={ms.id} className="flex items-start gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {ms.iconType === 'trophy' ? (
                          <Trophy className="w-4 h-4" />
                        ) : ms.iconType === 'star' ? (
                          <Star className="w-4 h-4 fill-[#F4510B]" />
                        ) : (
                          <Flag className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="text-xs font-black text-[#172B50] truncate">{ms.title}</h5>
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">{ms.achievedDate}</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">
                          {ms.description}
                        </p>
                      </div>
                      <div className="shrink-0 text-emerald-500 mt-1" title="Confirmed Milestone">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-[11px] font-bold text-slate-400 border-t border-slate-100 flex items-center justify-between">
                <span>Verified by Super Coach</span>
                <span className="text-purple-600 font-black">Official Records</span>
              </div>
            </div>

            {/* CARD 3: DEVELOPMENT PROFILE (RADAR CHART & KEY OBSERVATIONS) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-black text-[#172B50]">Development Profile</h4>
                    <p className="text-[10px] font-bold text-slate-400">
                      Latest Assessment &bull; {childJourney.developmentProfile?.assessmentDate || 'Nov 10, 2026'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('profile')}
                    className="text-xs font-bold text-[#F4510B] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View History</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* SVG SPIDER / RADAR CHART */}
                <div className="flex items-center justify-center my-2">
                  <div className="w-[200px] h-[175px] relative">
                    <svg viewBox="0 0 240 220" className="w-full h-full">
                      <defs>
                        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#059669" stopOpacity="0.15" />
                        </radialGradient>
                      </defs>

                      {/* Concentric Web Polygons */}
                      {radarData.webLevels.map((lvl, idx) => (
                        <polygon
                          key={idx}
                          points={lvl.points}
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Radial Web Spokes */}
                      {radarData.spokes.map((spoke, idx) => (
                        <line
                          key={idx}
                          x1="120"
                          y1="110"
                          x2={spoke.xOuter}
                          y2={spoke.yOuter}
                          stroke="#E2E8F0"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Active Dimension Polygon */}
                      <polygon
                        points={radarData.activePolygon}
                        fill="url(#radarFill)"
                        stroke="#10B981"
                        strokeWidth="2"
                      />

                      {/* Labels at outer endpoints */}
                      {radarData.spokes.map((spoke, idx) => (
                        <text
                          key={idx}
                          x={spoke.xLabel}
                          y={spoke.yLabel}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="text-[8px] font-black fill-slate-500 select-none"
                        >
                          {spoke.label}
                        </text>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Key Observations Checklist */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Key Observations</span>
                  {(childJourney.developmentProfile?.keyObservations || [
                    'Good balance and body control',
                    'Improved coordination and agility',
                    'Shows great teamwork',
                    'Needs a little more endurance',
                  ]).map((obs, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
                      <span className="truncate">{obs}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-[10.5px] font-bold text-slate-400 border-t border-slate-100 flex items-center justify-between">
                <span>Assessed by {childJourney.coachName || 'Coach Karthik'}</span>
                <span className="text-emerald-600 font-black">Official Rubric</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB 2: MILESTONES TRACKER                                              */}
      {/* ========================================================================= */}
      {activeSubTab === 'milestones' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-black text-[#172B50] flex items-center gap-2">
                <Flag className="w-5 h-5 text-[#F4510B]" />
                {activeChild.name}&apos;s Academy Milestones
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                Significant achievements, session dedication, and curriculum checkpoints verified by coaches.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-black border border-purple-200">
              {kpiStats.milestones} Milestones Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(childJourney.milestones || []).map((ms, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-[#FAFBFD] hover:border-purple-300 transition-all flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0 shadow-2xs">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-black text-[#172B50] truncate">{ms.title}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified ✓
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">{ms.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-[11px] font-bold text-slate-400">
                    <span>Achieved: {ms.achievedDate}</span>
                    <span>&bull;</span>
                    <span>Coach: {ms.coach || childJourney.coachName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TAB 3: DEVELOPMENT PROFILE (EXPANDED RADAR & OBSERVATIONS)             */}
      {/* ========================================================================= */}
      {activeSubTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-black text-[#172B50] flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#F4510B]" />
                {activeChild.name}&apos;s Physical &amp; Social Development Profile
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                Evaluation conducted across 9 fundamental athletic dimensions based on coach-recorded observations.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 block">Assessment Date</span>
              <span className="text-xs font-black text-[#172B50]">
                {childJourney.developmentProfile?.assessmentDate || 'Nov 10, 2026'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Expanded Radar Canvas */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 bg-[#F8FAFC] rounded-3xl border border-slate-100">
              <div className="w-[320px] sm:w-[360px] h-[320px] relative">
                <svg viewBox="0 0 240 220" className="w-full h-full">
                  <defs>
                    <radialGradient id="radarFillLg" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
                    </radialGradient>
                  </defs>
                  {radarData.webLevels.map((lvl, idx) => (
                    <polygon key={idx} points={lvl.points} fill="none" stroke="#E2E8F0" strokeWidth="1" />
                  ))}
                  {radarData.spokes.map((spoke, idx) => (
                    <line key={idx} x1="120" y1="110" x2={spoke.xOuter} y2={spoke.yOuter} stroke="#E2E8F0" strokeWidth="1" />
                  ))}
                  {/* Previous Assessment Comparison Polygon (Dotted) */}
                  <polygon
                    points={radarData.previousPolygon}
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  {/* Active Assessment Polygon */}
                  <polygon points={radarData.activePolygon} fill="url(#radarFillLg)" stroke="#10B981" strokeWidth="2.5" />
                  {radarData.spokes.map((spoke, idx) => (
                    <text
                      key={idx}
                      x={spoke.xLabel}
                      y={spoke.yLabel}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[9px] font-black fill-slate-700 select-none"
                    >
                      {spoke.label}
                    </text>
                  ))}
                </svg>
              </div>
              <div className="flex items-center gap-6 mt-3 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span>Current Assessment (Nov 2026)</span>
                </span>
                <span className="flex items-center gap-2 text-slate-400">
                  <span className="w-3 h-0.5 bg-slate-400 border-t border-dashed"></span>
                  <span>Previous Baseline</span>
                </span>
              </div>
            </div>

            {/* Dimension Breakdown & Observations */}
            <div className="lg:col-span-6 space-y-4">
              <h4 className="text-sm font-black text-[#172B50] uppercase tracking-wider">Dimension Scores (100-Point Scale)</h4>
              <div className="space-y-2.5">
                {RADAR_DIMENSIONS.map((dim) => {
                  const score = radarData.dims[dim.key] ?? 75;
                  return (
                    <div key={dim.key}>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-slate-700">{dim.label}</span>
                        <span className="text-[#172B50] font-black">{score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[#10B981]"
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coach Summary Note */}
              <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#F4510B]/20 mt-4">
                <span className="text-[11px] font-black text-[#F4510B] uppercase tracking-wider">Coach Observation Notes</span>
                <p className="text-xs font-semibold text-slate-700 mt-1 leading-relaxed">
                  {childJourney.developmentProfile?.coachNotes ||
                    'Aarav is showing exceptional body awareness and obstacle traversal skills. Consistently demonstrates respectful sharing and eager participation.'}
                </p>
                <span className="text-[10px] font-bold text-slate-400 mt-2 block">
                  Recorded by {childJourney.coachName || 'Coach Karthik'} &bull; Verified by Super Coach Alex
                </span>
              </div>
            </div>
          </div>

          {/* Athlete Profile & Enrollment Information */}
          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-base font-black text-[#172B50] mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#F4510B]" />
              <span>Athlete Information &amp; Official Academy Standing</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Student Identity</span>
                <p className="text-sm font-black text-[#172B50]">{activeChild.name}</p>
                <p className="text-xs font-semibold text-slate-500">Kid ID: <span className="font-mono text-[#F4510B] font-bold">{activeChild.id || activeChild.childId || 'LS-CH-2026-1045'}</span></p>
                <p className="text-xs font-medium text-slate-500">Age: {activeChild.age || 5} Years &bull; Batch: {activeChild.batch || 'LE - B1'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Training &amp; Center</span>
                <p className="text-sm font-black text-[#172B50]">{activeChild.program || childJourney.program || 'Foundational Movement'}</p>
                <p className="text-xs font-semibold text-slate-500">Location: {activeChild.center || 'KK Nagar'}</p>
                <p className="text-xs font-medium text-slate-500">Primary Coach: {childJourney.coachName || 'Coach Karthik'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Academy Standing</span>
                <p className="text-sm font-black text-[#172B50]">{activeChild.rank || 'Spartan Junior Athlete'}</p>
                <p className="text-xs font-semibold text-emerald-600">Attendance Turnout: {activeChild.attendanceRate || 90}%</p>
                <p className="text-xs font-medium text-slate-500">Status: <span className="text-emerald-600 font-bold">Active &bull; Enrolled</span></p>
              </div>
            </div>

            {/* Coach Assessments & Skill Drills */}
            <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
              <span className="text-xs font-black text-[#172B50] uppercase tracking-wider block">Skill Drill Evaluations</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-600">Agility &amp; Obstacles</span>
                    <span className="text-[#F4510B] font-black">{activeChild.evaluations?.agility ? `${activeChild.evaluations.agility} / 10` : '8.5 / 10'}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F4510B] rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-600">Balance Beam</span>
                    <span className="text-[#F4510B] font-black">{activeChild.evaluations?.balance ? `${activeChild.evaluations.balance} / 10` : '8.2 / 10'}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-600">Discipline &amp; Team Spirit</span>
                    <span className="text-[#F4510B] font-black">{activeChild.evaluations?.discipline ? `${activeChild.evaluations.discipline} / 10` : '9.0 / 10'}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#172B50] rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TAB 4: OFFICIAL CERTIFICATES                                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'certificates' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-black text-[#172B50] flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#F4510B]" />
                Official Certificates of Achievement
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                Verified certificates issued for curriculum mastery and stage completions.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
              {kpiStats.certificates} Verified Certificates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(childJourney.certificates || []).map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-3xl border-2 border-[#172B50]/15 bg-gradient-to-br from-white to-[#FFF9F3] hover:border-[#F4510B]/50 transition-all shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                    <span className="text-[10.5px] font-black text-[#F4510B] tracking-wider uppercase">
                      Official Certificate
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {cert.certNumber}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-[#172B50] mt-3">{cert.title}</h4>
                  <p className="text-xs font-medium text-slate-600 mt-1">
                    Awarded to <span className="font-bold text-[#172B50]">{activeChild.name}</span> for demonstrated excellence in {cert.program}.
                  </p>
                  <div className="flex items-center gap-3 mt-4 text-[11px] font-bold text-slate-500">
                    <span>Issued: {cert.issueDate}</span>
                    <span>&bull;</span>
                    <span>Authority: {cert.issuedBy}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified &amp; Authenticated</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCertModal(cert)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#172B50] text-white hover:bg-[#F4510B] text-xs font-black transition-colors cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View / Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. TAB 5: PUBLISHED EVALUATION HISTORY                                     */}
      {/* ========================================================================= */}
      {activeSubTab === 'evaluations' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-black text-[#172B50] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#F4510B]" />
                Published Evaluation History
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                Official evaluations signed off by coaches and authorized by Super Coach.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-[#FAFBFD] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#F4510B] uppercase tracking-wider">Quarter 4 Evaluation</span>
                <h4 className="text-sm font-black text-[#172B50]">
                  Foundational Movement Mastery &bull; Oct – Dec 2026
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                Approved &bull; Nov 10, 2026
              </span>
            </div>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              &quot;Aarav demonstrates superior gross motor stability and listens with great concentration during station setups. Recommending advancement to agility phase 2.&quot;
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-2 border-t border-slate-200/60">
              <span>Evaluated by: {childJourney.coachName || 'Coach Karthik'}</span>
              <span>&bull;</span>
              <span>Super Coach Reviewer: Super Coach Alex</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. MODAL: OFFICIAL CERTIFICATE PREVIEW & DOWNLOAD                         */}
      {/* ========================================================================= */}
      {selectedCertModal && (
        <Modal
          isOpen={Boolean(selectedCertModal)}
          onClose={() => setSelectedCertModal(null)}
          title="Official Sports Certificate Preview"
          subtitle="Authenticated landscape sports academy certificate &bull; Ready for high-resolution download"
          maxWidth="max-w-5xl"
        >
          <div className="space-y-4">
            {/* Scrollable container on mobile / tablet to guarantee 16:10 landscape presentation */}
            <div className="overflow-x-auto p-1.5 sm:p-2 bg-slate-50/70 rounded-2xl border border-slate-200/80 shadow-inner">
              <div className="min-w-[700px] lg:min-w-0">
                <SportsCertificate
                  innerRef={certDownloadRef}
                  cert={selectedCertModal}
                  child={activeChild}
                  coach={{
                    name: selectedCertModal.issuedBy?.includes('Coach')
                      ? selectedCertModal.issuedBy
                      : childJourney?.coachName || 'Coach Karthik',
                    title: 'Primary Coach',
                  }}
                  academyName="Little Spartans Sports Academy"
                />
              </div>
            </div>

            {/* Modal Actions & Trust Metadata */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Official verifiable credential #{selectedCertModal.certNumber} &bull; Verified by Super Coach Alex
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedCertModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={isGeneratingPdf}
                  onClick={() => handleDownloadCertificatePdf(selectedCertModal)}
                  className="px-5 py-2 rounded-xl bg-[#F4510B] hover:bg-[#d44307] active:scale-95 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Certificate'}</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 11. MODAL: ALL EARNED BADGES                                              */}
      {/* ========================================================================= */}
      {isAllBadgesModalOpen && (
        <Modal
          isOpen={isAllBadgesModalOpen}
          onClose={() => setIsAllBadgesModalOpen(false)}
          title={`All Earned Badges (${kpiStats.badges})`}
        >
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(childJourney.earnedBadges || []).map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  setIsAllBadgesModalOpen(false);
                  const pathwayMatch = childJourney.pathwayBadges?.find(
                    (pb) => pb.badgeId === b.id || pb.name === b.name
                  );
                  handleBadgeClick(pathwayMatch || { ...b, status: BADGE_STATUSES.COMPLETED });
                }}
                className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-[#F4510B]/50 hover:shadow-xs transition-all flex flex-col items-center text-center cursor-pointer group"
              >
                <div className="group-hover:scale-105 transition-transform">
                  <DynamicBadgeIcon iconType={b.iconType || 'star'} size={64} status={BADGE_STATUSES.COMPLETED} />
                </div>
                <span className="text-xs font-black text-[#172B50] group-hover:text-[#F4510B] transition-colors mt-2">{b.name}</span>
                <span className="text-[10px] font-semibold text-slate-500">{b.category || 'Skill'}</span>
                <span className="text-[10px] font-bold text-emerald-600 mt-1">Earned {b.date}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 12. MODAL: ALL MILESTONES                                                 */}
      {/* ========================================================================= */}
      {isAllMilestonesModalOpen && (
        <Modal
          isOpen={isAllMilestonesModalOpen}
          onClose={() => setIsAllMilestonesModalOpen(false)}
          title={`All Unlocked Milestones (${kpiStats.milestones})`}
        >
          <div className="p-4 space-y-3">
            {(childJourney.milestones || []).map((m) => (
              <div key={m.id} className="p-3.5 rounded-2xl border border-slate-200 bg-[#FAFBFD] flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#172B50]">{m.title}</h4>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">{m.description}</p>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                    Achieved {m.achievedDate} &bull; Verified by {m.coach || childJourney.coachName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 12. MODAL: ALL MILESTONES                                                 */}
      {/* ========================================================================= */}
      {isAllMilestonesModalOpen && (
        <Modal
          isOpen={isAllMilestonesModalOpen}
          onClose={() => setIsAllMilestonesModalOpen(false)}
          title={`All Unlocked Milestones (${kpiStats.milestones})`}
        >
          <div className="p-4 space-y-3">
            {(childJourney.milestones || []).map((m) => (
              <div key={m.id} className="p-3.5 rounded-2xl border border-slate-200 bg-[#FAFBFD] flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#172B50]">{m.title}</h4>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">{m.description}</p>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                    Achieved {m.achievedDate} &bull; Verified by {m.coach || childJourney.coachName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 13. MODAL: BADGE DETAILS POPUP (CENTERED POPUP MODAL)                     */}
      {/* ========================================================================= */}
      {selectedBadgeModal && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setSelectedBadgeModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#172B50]/65 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="badge-modal-title"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 fade-in duration-200"
          >
            {/* Top Gradient & Badge Illustration Hero */}
            <div className="bg-gradient-to-b from-[#FFF4E8] via-[#FFF9F3] to-white pt-7 pb-4 px-6 text-center relative border-b border-amber-100/60">
              {/* Close (X) Icon Button */}
              <button
                type="button"
                onClick={() => setSelectedBadgeModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/95 hover:bg-slate-100 text-slate-400 hover:text-[#172B50] flex items-center justify-center transition-colors shadow-2xs border border-slate-200/60 cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Large Badge Illustration */}
              <div className="inline-block p-2.5 rounded-3xl bg-white border border-amber-100 shadow-sm mb-3">
                <DynamicBadgeIcon
                  iconType={selectedBadgeModal.iconType || 'star'}
                  size={104}
                  status={selectedBadgeModal.status || BADGE_STATUSES.COMPLETED}
                />
              </div>

              {/* Badge Name & Category */}
              <h3 id="badge-modal-title" className="text-2xl font-black text-[#172B50] tracking-tight">
                {selectedBadgeModal.name}
              </h3>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                {selectedBadgeModal.category}
              </div>

              {/* Status Pill */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5">
                {selectedBadgeModal.status === BADGE_STATUSES.COMPLETED ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Completed &bull; {selectedBadgeModal.completedDate || selectedBadgeModal.date || 'Oct 31, 2026'}</span>
                    </span>
                    {selectedBadgeModal.verified && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Verified &amp; Published</span>
                      </span>
                    )}
                  </>
                ) : selectedBadgeModal.status === BADGE_STATUSES.IN_PROGRESS ? (
                  <div className="flex flex-col items-center">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-black border border-amber-200 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>In Progress ({selectedBadgeModal.progress || 60}%)</span>
                    </span>
                    <div className="w-48 bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-[#F4510B] h-full rounded-full transition-all duration-500"
                        style={{ width: `${selectedBadgeModal.progress || 60}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                    <Lock className="w-3 h-3" />
                    <span>Locked</span>
                  </span>
                )}
              </div>
            </div>

            {/* Modal Body Content (Scrollable) */}
            <div className="px-6 py-5 overflow-y-auto space-y-4 text-left">
              {/* Badge Description */}
              <div className="bg-[#FFFDF9] p-3.5 rounded-2xl border border-amber-100/70 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed text-center">
                {selectedBadgeModal.description}
              </div>

              {/* "What your child did" / "What your child is practicing" */}
              {selectedBadgeModal.whatChildDid && selectedBadgeModal.whatChildDid.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-[#172B50] uppercase tracking-wider flex items-center gap-1.5">
                    {selectedBadgeModal.status === BADGE_STATUSES.COMPLETED ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-[#F4510B]" />
                    )}
                    <span>
                      {selectedBadgeModal.status === BADGE_STATUSES.COMPLETED
                        ? 'What your child did'
                        : 'What your child is practicing'}
                    </span>
                  </h4>
                  <div className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-slate-100 space-y-2">
                    {selectedBadgeModal.whatChildDid.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Program & Session Details */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Program &amp; Session Context
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Program</span>
                    <span className="font-black text-[#172B50] truncate block mt-0.5">
                      {selectedBadgeModal.program}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Batch &amp; Location</span>
                    <span className="font-black text-[#172B50] truncate block mt-0.5">
                      {selectedBadgeModal.batch} &bull; {selectedBadgeModal.location}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Child</span>
                    <span className="font-black text-[#172B50] truncate block mt-0.5">
                      {selectedBadgeModal.childName || selectedChild?.name} (Age {selectedBadgeModal.childAge || selectedChild?.age})
                    </span>
                  </div>
                </div>
              </div>

              {/* Coach & Verification Profile */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedBadgeModal.coachAvatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'}
                    alt={selectedBadgeModal.coachName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <h5 className="text-xs font-black text-[#172B50]">{selectedBadgeModal.coachName}</h5>
                    <p className="text-[10px] font-bold text-slate-500">{selectedBadgeModal.coachTitle || 'Primary Coach'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified by Super Coach</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#F4510B]" />
                <span>Little Spartans Achievement</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedBadgeModal(null)}
                className="px-5 py-2 text-xs font-black text-white bg-[#172B50] hover:bg-[#F4510B] rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
