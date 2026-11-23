import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  CalendarDays,
  Star,
  Award,
  Layers,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  UploadCloud,
  ChevronDown,
  RotateCcw,
  Check,
  X,
  Bell,
  Sparkles,
  BarChart2,
  GraduationCap,
  Activity,
  Briefcase,
  TrendingUp,
  FileCheck,
  Image as ImageIcon,
  Lock,
  ExternalLink
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';

// Spartan Helmet Logo
const SpartanHelmetIcon = ({ className = "w-5 h-5 text-[#F4510B]" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="currentColor">
    <path d="M26 3C17 3 10 9 7 17c3-2 7-3 11-3 8 0 15 5 18 12 1-3 2-6 2-9 0-9-5-14-12-14z" />
    <path d="M11 18C6 21 3 26 3 33c0 8 6 14 14 15v-6c-3-1-5-4-5-8 0-2 1-5 3-6 2 2 4 4 7 4h5c3 0 5-2 7-4 2 2 3 4 3 6 0 4-2 7-5 8v6c8-1 14-7 14-15 0-7-3-12-8-15-3 2-7 4-12 4s-9-2-12-4z" />
    <path d="M22 28h4v12l-2 3-2-3V28z" />
  </svg>
);

// Standard Coach Specializations in Little Spartans
const SPECIALIZATION_OPTIONS = [
  'Spartan Gymnastics & Agility',
  'Junior Football Champions',
  'Spartan Athletics & Sprinting',
  'Basketball Rising Stars',
  'Spartan Martial Arts & Karate',
  'Movement & Athletics',
  'Foundational Movement',
  'Multi-Sport Motor Skills',
  'Badminton & Racket Skills'
];

// Permitted Documents for Super Coach (Strictly excludes confidential Aadhaar, PAN, Bank Details)
const PERMITTED_DOCUMENT_KEYS = [
  { key: 'resume', label: 'Resume / CV', icon: FileText, hint: 'PDF or DOCX (Max 5MB)' },
  { key: 'coaching', label: 'Coaching Certifications', icon: Award, hint: 'Federation / Youth License' },
  { key: 'education', label: 'Educational Certificates', icon: FileCheck, hint: 'Degree or Diploma' },
  { key: 'contract', label: 'Signed Employment Agreement', icon: FileText, hint: 'Academy Agreement Copy' },
  { key: 'photo', label: 'Passport Photo', icon: ImageIcon, hint: 'JPG/PNG with clear background' }
];

export default function CoachManagementModule({ onNavigateToEvaluations }) {
  const {
    data,
    currentUser,
    addCoach,
    updateCoach,
    reassignScheduleCoach,
    addToast
  } = useCrm();

  // Super Coach authorized locations
  const assignedLocations = useMemo(() => {
    if (Array.isArray(currentUser?.assignedLocations) && currentUser.assignedLocations.length > 0) {
      return currentUser.assignedLocations;
    }
    return ['KK NAGAR', 'KILPAUK', 'MAHALINGAPURAM', 'ANNA NAGAR'];
  }, [currentUser]);

  const assignedLocationsNormalized = useMemo(() => {
    return assignedLocations.map((l) => (l || '').toLowerCase().trim());
  }, [assignedLocations]);

  const isLocationAuthorized = (locName) => {
    if (!locName) return true;
    if (!assignedLocationsNormalized || assignedLocationsNormalized.length === 0) return true;
    const norm = String(locName).toLowerCase().trim();
    return assignedLocationsNormalized.some(
      (al) => al === norm || norm.includes(al) || al.includes(norm)
    );
  };

  // 1. STATE MANAGEMENT
  // Tabs: 'all' | 'active' | 'inactive' | 'on_leave' | 'new_joins'
  const [statusTab, setStatusTab] = useState('all');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');

  // Active Dropdown Action Menu ID
  const [activeMenuCoachId, setActiveMenuCoachId] = useState(null);
  const actionMenuRef = useRef(null);

  // Close action dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setActiveMenuCoachId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notifications Popover State
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef(null);

  // Modals State
  const [isAddCoachModalOpen, setIsAddCoachModalOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState(null);
  const [viewDetailCoach, setViewDetailCoach] = useState(null);
  const [detailActiveTab, setDetailActiveTab] = useState('overview'); // 'overview' | 'programs' | 'batches' | 'sessions' | 'performance' | 'documents' | 'audit'

  // Master Data Sources
  const rawCoaches = useMemo(() => data.coaches || [], [data.coaches]);
  const rawClasses = useMemo(() => data.classes || [], [data.classes]);
  const rawPrograms = useMemo(() => data.programs || [], [data.programs]);
  const rawLocations = useMemo(() => data.locations || [], [data.locations]);
  const rawEvaluations = useMemo(() => data.evaluations || [], [data.evaluations]);
  const rawLeaveRequests = useMemo(() => data.coachLeaveRequests || [], [data.coachLeaveRequests]);

  // Today YMD for checking active leaves
  const todayYmd = new Date().toISOString().split('T')[0];

  // Helper to determine if coach is on leave
  const isCoachOnLeave = (coach) => {
    if (coach.status?.toLowerCase() === 'on leave' || coach.onLeave === true) return true;
    const activeLeave = rawLeaveRequests.find(
      (r) => (r.coachId === coach.id || r.coachName === coach.name) &&
             r.status === 'Approved' &&
             r.startDate <= todayYmd &&
             r.endDate >= todayYmd
    );
    return Boolean(activeLeave);
  };

  // Helper to determine if coach is a new join (last 60 days or sequence)
  const isCoachNewJoin = (coach) => {
    if (coach.isNew || coach.newJoin) return true;
    if (coach.createdAt) {
      const createdDate = new Date(coach.createdAt);
      if (!Number.isNaN(createdDate.getTime())) {
        const daysDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 60;
      }
    }
    return coach.id === 'COACH-KEERTHANA' || coach.id?.includes('004') || coach.id?.includes('005');
  };

  // Scoped coaches for Super Coach
  const scopedCoaches = useMemo(() => {
    return rawCoaches.filter((coach) => {
      if (!coach.center && (!coach.assignedLocations || coach.assignedLocations.length === 0)) return true;
      if (coach.center && isLocationAuthorized(coach.center)) return true;
      if (Array.isArray(coach.assignedLocations)) {
        return coach.assignedLocations.some((loc) => isLocationAuthorized(loc));
      }
      return false;
    });
  }, [rawCoaches, assignedLocationsNormalized]);

  // Enriched coaches with live batches, programs, ratings and leaves
  const enrichedCoaches = useMemo(() => {
    return scopedCoaches.map((coach) => {
      // Find batches taught by this coach
      const coachBatches = rawClasses.filter(
        (b) => isLocationAuthorized(b.center) &&
          (b.coachId === coach.id || b.coachName === coach.name || b.coach2Id === coach.id || b.coach2Name === coach.name)
      );

      const batchNames = coachBatches.map((b) => b.name || b.batchName).filter(Boolean);
      const programNames = Array.from(new Set(
        coachBatches.map((b) => b.program).concat(coach.programs || []).filter(Boolean)
      ));

      const onLeave = isCoachOnLeave(coach);
      const isNew = isCoachNewJoin(coach);
      const isInactive = coach.status?.toLowerCase() === 'inactive';
      const effectiveStatus = isInactive ? 'Inactive' : onLeave ? 'On Leave' : 'Active';

      const ratingNum = coach.rating ? Number(coach.rating) : 4.9;

      // Evaluation reviews for this coach
      const coachEvals = rawEvaluations.filter(
        (ev) => ev.coachId === coach.id || ev.coachName === coach.name
      );
      const pendingEvals = coachEvals.filter((ev) => ev.status === 'Pending').length;

      return {
        ...coach,
        effectiveStatus,
        isOnLeave: onLeave,
        isNewJoin: isNew,
        assignedBatchesList: batchNames.length > 0 ? batchNames : (coach.assignedBatches || ['LE - B1']),
        programsList: programNames.length > 0 ? programNames : ['Foundational Movement'],
        sessionsCount: coach.sessions || (coachBatches.length > 0 ? coachBatches.length * 6 : 20),
        attendancePct: coach.attendance || 95,
        ratingNum,
        ratingDisplay: ratingNum.toFixed(1),
        pendingEvaluationsCount: pendingEvals,
        experienceDisplay: coach.experience || '4+ Yrs',
        specializationDisplay: coach.specialization || 'Foundational Movement'
      };
    });
  }, [scopedCoaches, rawClasses, rawEvaluations, rawLeaveRequests, todayYmd, assignedLocationsNormalized]);

  // 2. DYNAMIC KPI COUNTS (SECTION 3)
  const kpiCounts = useMemo(() => {
    const total = enrichedCoaches.length;
    const active = enrichedCoaches.filter((c) => c.effectiveStatus === 'Active').length;
    const inactive = enrichedCoaches.filter((c) => c.effectiveStatus === 'Inactive').length;
    const onLeave = enrichedCoaches.filter((c) => c.effectiveStatus === 'On Leave').length;
    const newJoins = enrichedCoaches.filter((c) => c.isNewJoin).length;

    let avgRating = 4.9;
    if (total > 0) {
      const sum = enrichedCoaches.reduce((acc, c) => acc + (c.ratingNum || 4.9), 0);
      avgRating = Number((sum / total).toFixed(1));
    }

    return {
      total,
      active,
      inactive,
      onLeave,
      newJoins,
      avgRating: `${avgRating} ★`
    };
  }, [enrichedCoaches]);

  // 3. FILTERED COACHES FOR TABLE (SECTIONS 4 & 5)
  const filteredCoaches = useMemo(() => {
    return enrichedCoaches.filter((coach) => {
      // 1. Status Tab filter
      if (statusTab === 'active' && coach.effectiveStatus !== 'Active') return false;
      if (statusTab === 'inactive' && coach.effectiveStatus !== 'Inactive') return false;
      if (statusTab === 'on_leave' && coach.effectiveStatus !== 'On Leave') return false;
      if (statusTab === 'new_joins' && !coach.isNewJoin) return false;

      // 2. Location filter
      if (selectedLocation !== 'All') {
        const normLoc = selectedLocation.toLowerCase().trim();
        const coachLoc = (coach.center || '').toLowerCase().trim();
        const inAssigned = Array.isArray(coach.assignedLocations) && coach.assignedLocations.some(
          (al) => al.toLowerCase().trim() === normLoc
        );
        if (coachLoc !== normLoc && !inAssigned) return false;
      }

      // 3. Specialization filter
      if (selectedSpecialization !== 'All') {
        const normSpec = selectedSpecialization.toLowerCase().trim();
        const coachSpec = (coach.specialization || '').toLowerCase().trim();
        if (coachSpec !== normSpec && !coachSpec.includes(normSpec)) return false;
      }

      // 4. Program filter
      if (selectedProgram !== 'All') {
        const normProg = selectedProgram.toLowerCase().trim();
        const inProgs = coach.programsList.some(
          (p) => p.toLowerCase().trim() === normProg || p.toLowerCase().includes(normProg)
        );
        if (!inProgs) return false;
      }

      // 5. Batch filter
      if (selectedBatch !== 'All') {
        const normBatch = selectedBatch.toLowerCase().trim();
        const inBatches = coach.assignedBatchesList.some(
          (b) => b.toLowerCase().trim() === normBatch || b.toLowerCase().includes(normBatch)
        );
        if (!inBatches) return false;
      }

      // 6. Search query (name, email, phone, id)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (coach.name || '').toLowerCase().includes(q);
        const emailMatch = (coach.email || '').toLowerCase().includes(q);
        const phoneMatch = (coach.phone || '').toLowerCase().includes(q);
        const idMatch = (coach.id || '').toLowerCase().includes(q);
        const specMatch = (coach.specialization || '').toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !phoneMatch && !idMatch && !specMatch) return false;
      }

      return true;
    });
  }, [
    enrichedCoaches,
    statusTab,
    selectedLocation,
    selectedSpecialization,
    selectedProgram,
    selectedBatch,
    searchQuery
  ]);

  // Distinct Filter Dropdown Options
  const availableLocations = useMemo(() => {
    const locSet = new Set();
    assignedLocations.forEach((l) => locSet.add(l));
    rawLocations.forEach((l) => {
      if (l.name && isLocationAuthorized(l.name)) locSet.add(l.name);
    });
    return Array.from(locSet);
  }, [assignedLocations, rawLocations]);

  const availableSpecializations = useMemo(() => {
    const specSet = new Set(SPECIALIZATION_OPTIONS);
    enrichedCoaches.forEach((c) => {
      if (c.specialization) specSet.add(c.specialization);
    });
    return Array.from(specSet);
  }, [enrichedCoaches]);

  const availablePrograms = useMemo(() => {
    const progSet = new Set();
    rawPrograms.forEach((p) => {
      if (p.name) progSet.add(p.name);
    });
    enrichedCoaches.forEach((c) => {
      c.programsList?.forEach((p) => progSet.add(p));
    });
    return Array.from(progSet);
  }, [rawPrograms, enrichedCoaches]);

  const availableBatches = useMemo(() => {
    const batchSet = new Set();
    rawClasses.forEach((b) => {
      if (isLocationAuthorized(b.center)) {
        if (b.name) batchSet.add(b.name);
        if (b.batchName) batchSet.add(b.batchName);
      }
    });
    enrichedCoaches.forEach((c) => {
      c.assignedBatchesList?.forEach((b) => batchSet.add(b));
    });
    return Array.from(batchSet);
  }, [rawClasses, enrichedCoaches]);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLocation('All');
    setSelectedSpecialization('All');
    setSelectedProgram('All');
    setSelectedBatch('All');
    setStatusTab('all');
  };

  const hasActiveFilters = searchQuery || selectedLocation !== 'All' || selectedSpecialization !== 'All' || selectedProgram !== 'All' || selectedBatch !== 'All' || statusTab !== 'all';

  // Toggle Coach Status (Activate / Deactivate)
  const handleToggleCoachStatus = (coach) => {
    const newStatus = coach.effectiveStatus === 'Active' ? 'Inactive' : 'Active';
    updateCoach(coach.id, {
      status: newStatus,
      auditAction: `Status changed to ${newStatus}`,
      auditNote: `Coach status toggled by Super Coach (${currentUser?.name || 'Anita R.'})`
    });
    addToast(`Coach ${coach.name} marked as ${newStatus}.`, 'success');
    setActiveMenuCoachId(null);
  };

  // Open Detailed Profile with specific initial tab
  const handleOpenDetailModal = (coach, tab = 'overview') => {
    setViewDetailCoach(coach);
    setDetailActiveTab(tab);
    setActiveMenuCoachId(null);
  };

  // Add / Edit Form State
  const [coachFormData, setCoachFormData] = useState({
    name: '',
    role: 'Coach',
    dob: '',
    gender: 'Male',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    center: assignedLocations[0] || 'KK NAGAR',
    assignedLocations: [assignedLocations[0] || 'KK NAGAR'],
    specialization: 'Foundational Movement',
    experience: '3',
    certification: 'Certified Youth Specialist (Level 1)',
    sportsQualifications: 'B.P.Ed / State Championship Athlete',
    skills: 'Agility Drills, Biomechanics, Strength Conditioning',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    documents: {
      resume: { name: 'resume_profile.pdf', size: '1.2 MB', uploadedAt: todayYmd, status: 'uploaded' },
      coaching: { name: 'coaching_cert_l1.pdf', size: '850 KB', uploadedAt: todayYmd, status: 'uploaded' }
    }
  });

  const handleOpenAddModal = () => {
    setEditingCoach(null);
    setCoachFormData({
      name: '',
      role: 'Coach',
      dob: '1995-05-15',
      gender: 'Male',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      center: selectedLocation !== 'All' ? selectedLocation : assignedLocations[0] || 'KK NAGAR',
      assignedLocations: [selectedLocation !== 'All' ? selectedLocation : assignedLocations[0] || 'KK NAGAR'],
      specialization: 'Foundational Movement',
      experience: '3',
      certification: 'Certified Youth Specialist (Level 1)',
      sportsQualifications: 'B.P.Ed / State Championship Athlete',
      skills: 'Agility Drills, Biomechanics, Strength Conditioning',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      documents: {
        resume: { name: 'resume_profile.pdf', size: '1.2 MB', uploadedAt: todayYmd, status: 'uploaded' },
        coaching: { name: 'coaching_cert_l1.pdf', size: '850 KB', uploadedAt: todayYmd, status: 'uploaded' }
      }
    });
    setIsAddCoachModalOpen(true);
    setActiveMenuCoachId(null);
  };

  const handleOpenEditModal = (coach) => {
    setEditingCoach(coach);
    setCoachFormData({
      name: coach.name || '',
      role: coach.role || 'Coach',
      dob: coach.dob || '1994-06-12',
      gender: coach.gender || 'Male',
      phone: coach.phone || '',
      whatsapp: coach.whatsapp || coach.phone || '',
      email: coach.email || '',
      address: coach.address || 'Chennai, Tamil Nadu',
      center: coach.center || assignedLocations[0] || 'KK NAGAR',
      assignedLocations: Array.isArray(coach.assignedLocations) && coach.assignedLocations.length > 0 
        ? coach.assignedLocations 
        : [coach.center || assignedLocations[0] || 'KK NAGAR'],
      specialization: coach.specialization || 'Foundational Movement',
      experience: String(coach.experience || '4').replace(/\D/g, '') || '4',
      certification: coach.certification || 'Certified Coach',
      sportsQualifications: coach.sportsQualifications || 'Youth Coaching Certification',
      skills: coach.skills || 'Sports Training & Agility',
      status: coach.effectiveStatus || 'Active',
      avatar: coach.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      documents: coach.documents || {
        resume: { name: 'resume_profile.pdf', size: '1.2 MB', uploadedAt: todayYmd, status: 'uploaded' }
      }
    });
    setIsAddCoachModalOpen(true);
    setActiveMenuCoachId(null);
  };

  const handleSaveCoachForm = (e) => {
    e.preventDefault();
    if (!coachFormData.name.trim()) {
      addToast('Coach Full Name is required.', 'error');
      return;
    }
    if (!coachFormData.phone.trim()) {
      addToast('Contact Phone Number is required.', 'error');
      return;
    }
    if (!coachFormData.email.trim()) {
      addToast('Email Address is required.', 'error');
      return;
    }

    if (editingCoach) {
      // Update existing coach
      updateCoach(editingCoach.id, {
        name: coachFormData.name.trim(),
        role: coachFormData.role,
        dob: coachFormData.dob,
        gender: coachFormData.gender,
        phone: coachFormData.phone.trim(),
        whatsapp: coachFormData.whatsapp.trim(),
        email: coachFormData.email.trim().toLowerCase(),
        address: coachFormData.address.trim(),
        center: coachFormData.center,
        assignedLocations: coachFormData.assignedLocations,
        specialization: coachFormData.specialization,
        experience: `${coachFormData.experience}+ Yrs`,
        experienceYears: coachFormData.experience,
        certification: coachFormData.certification,
        sportsQualifications: coachFormData.sportsQualifications,
        skills: coachFormData.skills,
        status: coachFormData.status,
        avatar: coachFormData.avatar,
        documents: coachFormData.documents,
        auditAction: 'Profile Updated',
        auditNote: `Updated by Super Coach (${currentUser?.name || 'Anita R.'})`
      });
      addToast(`Coach ${coachFormData.name} profile updated successfully.`, 'success');
    } else {
      // Add new coach
      addCoach({
        name: coachFormData.name.trim(),
        role: coachFormData.role,
        dob: coachFormData.dob,
        gender: coachFormData.gender,
        phone: coachFormData.phone.trim(),
        whatsapp: coachFormData.whatsapp.trim(),
        email: coachFormData.email.trim().toLowerCase(),
        address: coachFormData.address.trim(),
        center: coachFormData.center,
        assignedLocations: coachFormData.assignedLocations,
        specialization: coachFormData.specialization,
        experience: `${coachFormData.experience}+ Yrs`,
        experienceYears: coachFormData.experience,
        certification: coachFormData.certification,
        sportsQualifications: coachFormData.sportsQualifications,
        skills: coachFormData.skills,
        status: 'Active',
        rating: 5.0,
        sessions: 0,
        attendance: 100,
        avatar: coachFormData.avatar,
        documents: coachFormData.documents,
        createdAt: todayYmd,
        isNew: true,
        auditLog: [
          {
            action: 'Coach Registered',
            performedBy: `Super Coach (${currentUser?.name || 'Anita R.'})`,
            timestamp: new Date().toISOString(),
            details: 'Initial onboarding registration completed via Super Coach Portal'
          }
        ]
      });
      addToast(`New coach ${coachFormData.name} registered successfully.`, 'success');
    }

    setIsAddCoachModalOpen(false);
  };

  // Specialization Badge Styles
  const getSpecializationBadgeStyle = (spec = '') => {
    const s = spec.toLowerCase();
    if (s.includes('athletic') || s.includes('sprinting')) {
      return 'bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]';
    }
    if (s.includes('football')) {
      return 'bg-[#EDE9FE] text-[#7C3AED] border border-[#DDD6FE]';
    }
    if (s.includes('basketball')) {
      return 'bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA]';
    }
    if (s.includes('foundational') || s.includes('gymnastic') || s.includes('movement')) {
      return 'bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]';
    }
    if (s.includes('martial') || s.includes('karate')) {
      return 'bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]';
    }
    return 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]';
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
          <span>Active</span>
        </span>
      );
    }
    if (status === 'On Leave') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] shadow-2xs">
          <Clock className="w-3 h-3 text-[#D97706]" />
          <span>On Leave</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1] shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
        <span>Inactive</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-slide-up pb-12">
      
      {/* ============================================================ */}
      {/* 1. PAGE HEADER (SECTION 2)                                   */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#172B5012]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF5ED] text-[#F4510B] border border-[#F4510B25] shadow-2xs flex items-center justify-center shrink-0">
              <SpartanHelmetIcon className="w-6 h-6 text-[#F4510B]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">
                Coach Management
              </h1>
              <p className="text-xs sm:text-sm font-medium text-[#172B50]/65 mt-0.5">
                Create, manage and oversee all academy coaches.
              </p>
            </div>
          </div>
        </div>

        {/* Top-Right Header Actions: Search, Notifications, Profile, Add Coach */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Search Toggle */}
          <div className="relative">
            {showSearchInput ? (
              <div className="flex items-center gap-1 bg-white border border-[#172B5020] rounded-xl px-2.5 py-1.5 shadow-2xs">
                <Search className="w-3.5 h-3.5 text-[#172B50]/50" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Quick find..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs text-[#172B50] outline-none w-28 sm:w-36 font-semibold"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowSearchInput(false)}
                  className="text-[#172B50]/40 hover:text-[#172B50]"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowSearchInput(true)}
                className="w-9 h-9 rounded-xl bg-white border border-[#172B5018] text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B30] flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                title="Search coaches"
              >
                <Search className="w-4 h-4 text-[#172B50]" />
              </button>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-xl bg-white border border-[#172B5018] text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B30] flex items-center justify-center transition-all shadow-2xs cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-[#172B50]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F4510B] ring-2 ring-white" />
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-[#172B5015] p-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-[#172B5010]">
                  <span className="text-xs font-black text-[#172B50]">Coach Alerts & Updates</span>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 mt-2 max-h-56 overflow-y-auto">
                  <div className="p-2 rounded-xl bg-[#FFF9F5] border border-[#F4510B15]">
                    <p className="text-[11px] font-bold text-[#172B50]">All faculty operational</p>
                    <p className="text-[10px] text-[#172B50]/60">Multi-location coaching schedules verified for today.</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[11px] font-bold text-[#172B50]">Super Coach Oversight</p>
                    <p className="text-[10px] text-[#172B50]/60">{assignedLocations.length} active centers assigned under your jurisdiction.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Super Coach Profile Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#172B500A] border border-[#172B5012]">
            <div className="w-6 h-6 rounded-full bg-[#172B50] text-white flex items-center justify-center text-[10px] font-black">
              SC
            </div>
            <div className="text-left">
              <span className="text-xs font-black text-[#172B50] leading-none block">
                {currentUser?.name || 'Anita R.'}
              </span>
              <span className="text-[9.5px] font-bold text-[#F4510B] leading-none block mt-0.5">
                Super Coach
              </span>
            </div>
          </div>

          {/* Add Coach Primary Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-[#F4510B] text-white text-xs font-black flex items-center gap-2 hover:bg-[#d94406] shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Add Coach</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SUMMARY KPI CARDS (SECTION 3)                              */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Coaches */}
        <div 
          onClick={() => setStatusTab('all')}
          className="bg-white rounded-[22px] p-4.5 border border-[#172B5012] shadow-2xs flex flex-col justify-between hover:border-[#172B5030] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#172B50]/65 uppercase tracking-wider">Total Coaches</span>
            <div className="w-8 h-8 rounded-xl bg-[#F0F7FF] text-[#0284C7] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#0284C7]" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight">{kpiCounts.total}</p>
            <p className="text-[10.5px] font-medium text-[#172B50]/60 mt-0.5">All registered faculty</p>
          </div>
        </div>

        {/* Active Coaches */}
        <div 
          onClick={() => setStatusTab('active')}
          className="bg-gradient-to-br from-[#F0FDF4] to-white rounded-[22px] p-4.5 border border-[#BBF7D0] shadow-2xs flex flex-col justify-between hover:border-[#16A34A] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Active Coaches</span>
            <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-[#16A34A]" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight">{kpiCounts.active}</p>
            <p className="text-[10.5px] font-medium text-emerald-700/70 mt-0.5">Currently operational</p>
          </div>
        </div>

        {/* Inactive Coaches */}
        <div 
          onClick={() => setStatusTab('inactive')}
          className="bg-gradient-to-br from-[#F8FAFC] to-white rounded-[22px] p-4.5 border border-[#CBD5E1] shadow-2xs flex flex-col justify-between hover:border-[#64748B] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Inactive Coaches</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <UserX className="w-4 h-4 text-slate-600" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{kpiCounts.inactive}</p>
            <p className="text-[10.5px] font-medium text-slate-500 mt-0.5">Archived & dormant</p>
          </div>
        </div>

        {/* On Leave */}
        <div 
          onClick={() => setStatusTab('on_leave')}
          className="bg-gradient-to-br from-[#FEFCE8] to-white rounded-[22px] p-4.5 border border-[#FDE68A] shadow-2xs flex flex-col justify-between hover:border-[#D97706] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">On Leave</span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-[#D97706]" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-amber-900 tracking-tight">{kpiCounts.onLeave}</p>
            <p className="text-[10.5px] font-medium text-amber-700/70 mt-0.5">Approved absence</p>
          </div>
        </div>

        {/* Average Coach Rating */}
        <div className="bg-gradient-to-br from-[#FFF9F5] to-white rounded-[22px] p-4.5 border border-[#FED7AA] shadow-2xs flex flex-col justify-between hover:border-[#F4510B] transition-all group col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#F4510B] uppercase tracking-wider">Average Rating</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center">
              <Star className="w-4 h-4 text-[#F4510B] fill-[#F4510B]" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight">{kpiCounts.avgRating}</p>
            <p className="text-[10.5px] font-medium text-[#172B50]/60 mt-0.5">Faculty performance score</p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. COACH STATUS TABS (SECTION 4)                             */}
      {/* ============================================================ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#172B500C]">
        {[
          { id: 'all', label: 'All Coaches', count: kpiCounts.total },
          { id: 'active', label: 'Active', count: kpiCounts.active },
          { id: 'inactive', label: 'Inactive', count: kpiCounts.inactive },
          { id: 'on_leave', label: 'On Leave', count: kpiCounts.onLeave },
          { id: 'new_joins', label: 'New Joins', count: kpiCounts.newJoins }
        ].map((tab) => {
          const isActive = statusTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusTab(tab.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#172B50] text-white shadow-sm'
                  : 'bg-white text-[#172B50]/70 hover:bg-[#FFF4E8] hover:text-[#172B50] border border-[#172B5010]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isActive ? 'bg-white/20 text-white' : 'bg-[#172B500C] text-[#172B50]'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 4. FILTERS AND SEARCH TOOLBAR (SECTION 5)                     */}
      {/* ============================================================ */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#172B5015] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
          
          {/* 1. Search by coach name, email or phone */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#172B50]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold bg-[#FAFAFA] border border-[#172B5015] text-[#172B50] placeholder:text-[#172B50]/40 focus:outline-none focus:border-[#F4510B] focus:bg-white transition-colors"
            />
          </div>

          {/* 2. All Locations Filter */}
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#FAFAFA] border border-[#172B5015] text-[#172B50] focus:outline-none focus:border-[#F4510B] focus:bg-white transition-colors appearance-none cursor-pointer pr-8"
            >
              <option value="All">All Locations</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 3. All Specializations Filter */}
          <div className="relative">
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#FAFAFA] border border-[#172B5015] text-[#172B50] focus:outline-none focus:border-[#F4510B] focus:bg-white transition-colors appearance-none cursor-pointer pr-8"
            >
              <option value="All">All Specializations</option>
              {availableSpecializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 4. All Programs Filter */}
          <div className="relative">
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#FAFAFA] border border-[#172B5015] text-[#172B50] focus:outline-none focus:border-[#F4510B] focus:bg-white transition-colors appearance-none cursor-pointer pr-8"
            >
              <option value="All">All Programs</option>
              {availablePrograms.map((prog) => (
                <option key={prog} value={prog}>
                  {prog}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 5. All Batches Filter */}
          <div className="relative">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#FAFAFA] border border-[#172B5015] text-[#172B50] focus:outline-none focus:border-[#F4510B] focus:bg-white transition-colors appearance-none cursor-pointer pr-8"
            >
              <option value="All">All Batches</option>
              {availableBatches.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Clear Filters Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[#172B500C] text-xs">
            <span className="text-[#172B50]/60 font-medium">
              Showing <strong className="text-[#172B50]">{filteredCoaches.length}</strong> of {enrichedCoaches.length} coaches
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-black text-[#F4510B] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 5. COACH DIRECTORY TABLE (SECTION 6)                         */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl border border-[#172B5015] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FFF4E8]/60 border-b border-[#172B5012] text-[11px] font-black text-[#172B50] uppercase tracking-wider">
                <th className="py-3.5 px-4">Coach Name</th>
                <th className="py-3.5 px-3">Coach ID</th>
                <th className="py-3.5 px-3">Specialization</th>
                <th className="py-3.5 px-3">Experience</th>
                <th className="py-3.5 px-3">Programs</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Rating</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172B500C] text-xs font-semibold text-[#172B50]">
              {filteredCoaches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF5ED] text-[#F4510B] border border-[#F4510B20] flex items-center justify-center mb-3">
                        <Users className="w-6 h-6 text-[#F4510B]" />
                      </div>
                      <h4 className="text-sm font-black text-[#172B50]">No Coaches Found</h4>
                      <p className="text-xs text-[#172B50]/60 max-w-sm mt-1">
                        No coach records match your current filter criteria or status tab selection.
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-[#FFF4E8] text-[#F4510B] text-xs font-black border border-[#F4510B30] hover:bg-[#F4510B] hover:text-white transition-all cursor-pointer"
                        >
                          Clear Active Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoaches.map((coach) => {
                  const isMenuOpen = activeMenuCoachId === coach.id;

                  return (
                    <tr
                      key={coach.id}
                      className="hover:bg-[#FFF9F5]/50 transition-colors group"
                    >
                      {/* 1. Coach Name (Photo & Full Name) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={coach.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={coach.name}
                            className="w-10 h-10 rounded-full object-cover border border-[#172B5015] shadow-2xs shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-[#172B50] group-hover:text-[#F4510B] transition-colors truncate">
                                {coach.name}
                              </span>
                              {coach.isNewJoin && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#E0F2FE] text-[#0284C7] shrink-0">
                                  NEW
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-medium text-[#172B50]/60 truncate mt-0.5">
                              {coach.email || coach.phone || coach.center}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Coach ID */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-[#172B500C] text-[#172B50] border border-[#172B5010]">
                          {coach.id}
                        </span>
                      </td>

                      {/* 3. Specialization */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${getSpecializationBadgeStyle(coach.specializationDisplay)}`}>
                          {coach.specializationDisplay}
                        </span>
                      </td>

                      {/* 4. Experience */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-xs font-bold text-[#172B50]/80">
                          {coach.experienceDisplay}
                        </span>
                      </td>

                      {/* 5. Programs */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {coach.programsList.slice(0, 2).map((prog, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B20] truncate max-w-[130px]"
                              title={prog}
                            >
                              {prog}
                            </span>
                          ))}
                          {coach.programsList.length > 2 && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-[#172B50]/70">
                              +{coach.programsList.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 6. Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {renderStatusBadge(coach.effectiveStatus)}
                      </td>

                      {/* 7. Rating */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEFCE8] text-[#CA8A04] border border-[#FEF08A] font-black text-xs">
                          <Star className="w-3 h-3 fill-[#CA8A04] text-[#CA8A04]" />
                          <span>{coach.ratingDisplay}</span>
                        </div>
                      </td>

                      {/* 8. Actions (Three-dot action menu) */}
                      <td className="py-3 px-4 text-right whitespace-nowrap relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuCoachId(isMenuOpen ? null : coach.id);
                          }}
                          className="w-8 h-8 rounded-lg bg-transparent hover:bg-[#172B500C] text-[#172B50] flex items-center justify-center transition-colors cursor-pointer ml-auto"
                          title="Coach Actions"
                        >
                          <MoreVertical className="w-4 h-4 text-[#172B50]" />
                        </button>

                        {/* Three-Dot Dropdown Menu (Section 7) */}
                        {isMenuOpen && (
                          <div
                            ref={actionMenuRef}
                            className="absolute right-4 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-[#172B5018] py-1.5 z-50 text-left animate-in fade-in zoom-in-95"
                          >
                            <div className="px-3 py-1.5 border-b border-[#172B500C] mb-1">
                              <p className="text-[11px] font-black text-[#172B50] truncate">{coach.name}</p>
                              <p className="text-[9.5px] font-medium text-[#172B50]/50 truncate">{coach.id}</p>
                            </div>

                            {/* 1. View Coach Details */}
                            <button
                              type="button"
                              onClick={() => handleOpenDetailModal(coach, 'overview')}
                              className="w-full px-3 py-1.5 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#172B50]/60" />
                              <span>View Coach Details</span>
                            </button>

                            {/* 2. Edit Coach Details */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(coach)}
                              className="w-full px-3 py-1.5 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#172B50]/60" />
                              <span>Edit Coach Details</span>
                            </button>

                            {/* 3. View Assigned Programs */}
                            <button
                              type="button"
                              onClick={() => handleOpenDetailModal(coach, 'programs')}
                              className="w-full px-3 py-1.5 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5 text-[#172B50]/60" />
                              <span>View Assigned Programs</span>
                            </button>

                            {/* 4. View Assigned Batches */}
                            <button
                              type="button"
                              onClick={() => handleOpenDetailModal(coach, 'batches')}
                              className="w-full px-3 py-1.5 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <Layers className="w-3.5 h-3.5 text-[#172B50]/60" />
                              <span>View Assigned Batches</span>
                            </button>

                            {/* 5. View Session History */}
                            <button
                              type="button"
                              onClick={() => handleOpenDetailModal(coach, 'sessions')}
                              className="w-full px-3 py-1.5 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#172B50]/60" />
                              <span>View Session History</span>
                            </button>

                            {/* 6. View Performance */}
                            <button
                              type="button"
                              onClick={() => handleOpenDetailModal(coach, 'performance')}
                              className="w-full px-3 py-1.5 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <BarChart2 className="w-3.5 h-3.5 text-[#172B50]/60" />
                              <span>View Performance</span>
                            </button>

                            <div className="my-1 border-t border-[#172B500C]" />

                            {/* 7. Activate / Deactivate Coach */}
                            <button
                              type="button"
                              onClick={() => handleToggleCoachStatus(coach)}
                              className={`w-full px-3 py-1.5 text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                coach.effectiveStatus === 'Active'
                                  ? 'text-rose-600 hover:bg-rose-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {coach.effectiveStatus === 'Active' ? (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Deactivate Coach</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Activate Coach</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[#172B5010] bg-[#FAFAFA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#172B50]/60 font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Super Coach jurisdiction: verified across {assignedLocations.length} active centers</span>
          </div>
          <div>
            Showing <strong className="text-[#172B50]">{filteredCoaches.length}</strong> of {enrichedCoaches.length} registered coaches
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. MODAL: VIEW COACH DETAILS (SECTIONS 7 & 8)                */}
      {/* ============================================================ */}
      {viewDetailCoach && (
        <Modal
          isOpen={Boolean(viewDetailCoach)}
          onClose={() => setViewDetailCoach(null)}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5">
            {/* Modal Header Profile Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFF9F5] border border-[#F4510B20]">
              <div className="flex items-center gap-3.5">
                <img
                  src={viewDetailCoach.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={viewDetailCoach.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#172B50] tracking-tight">{viewDetailCoach.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#172B500C] text-[#172B50]">
                      {viewDetailCoach.id}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#F4510B] mt-0.5">
                    {viewDetailCoach.specializationDisplay}
                  </p>
                  <p className="text-[11px] font-medium text-[#172B50]/60 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#F4510B]" />
                    <span>{viewDetailCoach.center || assignedLocations[0]}</span>
                    <span>•</span>
                    <span>Experience: {viewDetailCoach.experienceDisplay}</span>
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                {renderStatusBadge(viewDetailCoach.effectiveStatus)}
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEFCE8] text-[#CA8A04] border border-[#FEF08A] text-xs font-black">
                  <Star className="w-3.5 h-3.5 fill-[#CA8A04]" />
                  <span>{viewDetailCoach.ratingDisplay} Rating</span>
                </div>
              </div>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex items-center gap-1.5 border-b border-[#172B5012] overflow-x-auto scrollbar-none pb-1">
              {[
                { id: 'overview', label: 'Overview & Bio' },
                { id: 'programs', label: `Programs (${viewDetailCoach.programsList?.length || 0})` },
                { id: 'batches', label: `Batches (${viewDetailCoach.assignedBatchesList?.length || 0})` },
                { id: 'sessions', label: 'Session History' },
                { id: 'performance', label: 'Performance' },
                { id: 'documents', label: 'Documents' },
                { id: 'audit', label: 'Audit Log' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDetailActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    detailActiveTab === tab.id
                      ? 'bg-[#172B50] text-white shadow-2xs'
                      : 'text-[#172B50]/70 hover:bg-[#FFF4E8] hover:text-[#172B50]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview & Bio */}
            {detailActiveTab === 'overview' && (
              <div className="space-y-4 text-xs">
                {/* Personal Information */}
                <div className="p-4 rounded-xl bg-white border border-[#172B5012] space-y-3">
                  <h4 className="font-black text-[#172B50] text-sm flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#F4510B]" />
                    <span>Personal Information</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[#172B50]/60 font-semibold block">Full Name</span>
                      <strong className="text-[#172B50] font-bold">{viewDetailCoach.name}</strong>
                    </div>
                    <div>
                      <span className="text-[#172B50]/60 font-semibold block">Date of Birth</span>
                      <strong className="text-[#172B50] font-bold">{viewDetailCoach.dob || '12 May 1994'}</strong>
                    </div>
                    <div>
                      <span className="text-[#172B50]/60 font-semibold block">Phone Number</span>
                      <strong className="text-[#172B50] font-bold">{viewDetailCoach.phone || '+91 98401 11223'}</strong>
                    </div>
                    <div>
                      <span className="text-[#172B50]/60 font-semibold block">Email Address</span>
                      <strong className="text-[#172B50] font-bold">{viewDetailCoach.email || 'coach@littlespartans.co.in'}</strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[#172B50]/60 font-semibold block">Residential Address</span>
                      <strong className="text-[#172B50] font-bold">{viewDetailCoach.address || 'Chennai, Tamil Nadu - 600040'}</strong>
                    </div>
                  </div>
                </div>

                {/* Professional Qualifications */}
                <div className="p-4 rounded-xl bg-white border border-[#172B5012] space-y-3">
                  <h4 className="font-black text-[#172B50] text-sm flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#0284C7]" />
                    <span>Professional Qualifications & Certifications</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[#172B50]/60 font-semibold block">Specialization</span>
                      <strong className="text-[#172B50] font-bold">{viewDetailCoach.specializationDisplay}</strong>
                    </div>
                    <div>
                      <span className="text-[#172B50]/60 font-semibold block">Coaching Experience</span>
                      <strong className="text-[#172B50] font-bold">{viewDetailCoach.experienceDisplay}</strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[#172B50]/60 font-semibold block">Certification</span>
                      <strong className="text-[#172B50] font-bold">{viewDetailCoach.certification || 'NIS Certified Youth Movement Specialist (Level 2)'}</strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[#172B50]/60 font-semibold block">Sports Qualifications</span>
                      <strong className="text-[#172B50] font-bold">{viewDetailCoach.sportsQualifications || 'B.P.Ed / State Championship Gold Medalist'}</strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[#172B50]/60 font-semibold block">Skills & Coaching Core</span>
                      <strong className="text-[#172B50] font-bold">{viewDetailCoach.skills || 'Agility Drills, Youth Biomechanics, Strength Conditioning, Injury Prevention'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Assigned Programs */}
            {detailActiveTab === 'programs' && (
              <div className="space-y-3 text-xs">
                <p className="text-[#172B50]/70 font-semibold">
                  Programs curriculum delivered by Coach <strong className="text-[#172B50]">{viewDetailCoach.name}</strong>:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewDetailCoach.programsList?.map((prog, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#FFF9F5] border border-[#F4510B20] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white text-[#F4510B] border border-[#F4510B25] flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4 text-[#F4510B]" />
                      </div>
                      <div>
                        <h5 className="font-black text-[#172B50] text-xs">{prog}</h5>
                        <p className="text-[10.5px] font-medium text-[#172B50]/60 mt-0.5">Active Little Spartans Program</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Assigned Batches */}
            {detailActiveTab === 'batches' && (
              <div className="space-y-3 text-xs">
                <p className="text-[#172B50]/70 font-semibold">
                  Assigned batches at authorized training centers:
                </p>
                <div className="space-y-2">
                  {viewDetailCoach.assignedBatchesList?.map((batch, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-[#172B5012] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#172B500C] text-[#172B50] flex items-center justify-center font-black text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-black text-[#172B50]">{batch}</p>
                          <p className="text-[10px] text-[#172B50]/60">Assigned Head Coach • Location: {viewDetailCoach.center}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#DCFCE7] text-[#15803D]">
                        Active Batch
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Session History */}
            {detailActiveTab === 'sessions' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#F0F7FF] border border-[#0284C720] text-center">
                    <span className="text-[10px] font-bold text-[#0284C7] uppercase">Total Sessions</span>
                    <strong className="text-xl font-black text-[#172B50] block mt-1">{viewDetailCoach.sessionsCount}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#16A34A20] text-center">
                    <span className="text-[10px] font-bold text-[#16A34A] uppercase">Attendance Rate</span>
                    <strong className="text-xl font-black text-[#16A34A] block mt-1">{viewDetailCoach.attendancePct}%</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FFF9F5] border border-[#F4510B20] text-center col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-[#F4510B] uppercase">Pending Reviews</span>
                    <strong className="text-xl font-black text-[#F4510B] block mt-1">{viewDetailCoach.pendingEvaluationsCount}</strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#172B5012] space-y-2">
                  <h5 className="font-black text-[#172B50] text-xs">Recent Coaching Sessions</h5>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span>Foundational Movement • Training Court A</span>
                      <span className="font-bold text-emerald-700">Completed (15/15 Athletes)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span>Agility Drills & Biomechanics • Main Turf</span>
                      <span className="font-bold text-emerald-700">Completed (14/15 Athletes)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Performance */}
            {detailActiveTab === 'performance' && (
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-[#FFF9F5] border border-[#F4510B25] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#F4510B] uppercase">Faculty Quality Score</span>
                    <h4 className="text-2xl font-black text-[#172B50] mt-0.5">{viewDetailCoach.ratingDisplay} / 5.0</h4>
                    <p className="text-[11px] text-[#172B50]/60 mt-0.5">Based on Super Coach observations and athlete feedback</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white text-[#F4510B] border border-[#F4510B30] flex items-center justify-center">
                    <Star className="w-6 h-6 fill-[#F4510B] text-[#F4510B]" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#172B5012] space-y-2">
                  <h5 className="font-black text-[#172B50] text-xs">Super Coach Observation Note</h5>
                  <p className="text-[11.5px] text-[#172B50]/70 italic">
                    "Demonstrates exceptional patience with 4-6 age groups. Clear cues during agility ladder drills and meticulous adherence to safety protocols."
                  </p>
                </div>
              </div>
            )}

            {/* Tab 6: Permitted Documents (Restricted fields strictly excluded) */}
            {detailActiveTab === 'documents' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Privacy & Role Isolation Policy</strong>
                    <span className="text-[11px] opacity-80">
                      Confidential government identity (Aadhaar, PAN), bank account and compensation details are restricted to Academy Administration and are not exposed in this portal.
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {PERMITTED_DOCUMENT_KEYS.map((doc) => {
                    const Icon = doc.icon;
                    const isUploaded = viewDetailCoach.documents?.[doc.key];
                    return (
                      <div key={doc.key} className="p-3 rounded-xl bg-white border border-[#172B5012] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#172B500C] text-[#172B50] flex items-center justify-center">
                            <Icon className="w-4 h-4 text-[#172B50]" />
                          </div>
                          <div>
                            <span className="font-bold text-[#172B50] block">{doc.label}</span>
                            <span className="text-[10px] text-[#172B50]/50">{doc.hint}</span>
                          </div>
                        </div>

                        {isUploaded ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="text-[10.5px] font-medium text-[#172B50]/40">
                            Pending Upload
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 7: Audit Log */}
            {detailActiveTab === 'audit' && (
              <div className="space-y-2.5 text-xs max-h-56 overflow-y-auto">
                {(viewDetailCoach.auditLog && viewDetailCoach.auditLog.length > 0) ? (
                  viewDetailCoach.auditLog.map((log, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <div className="flex items-center justify-between font-bold text-[#172B50]">
                        <span>{log.action}</span>
                        <span className="text-[10px] text-[#172B50]/50 font-normal">
                          {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#172B50]/70">{log.details}</p>
                      <span className="text-[10px] text-[#F4510B] font-semibold">By: {log.performedBy}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-[#172B50]/60">
                    No historical audit logs recorded for this coach yet.
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#172B5012]">
              <button
                type="button"
                onClick={() => {
                  setViewDetailCoach(null);
                  handleOpenEditModal(viewDetailCoach);
                }}
                className="px-4 py-2 rounded-xl bg-[#FFF4E8] text-[#F4510B] text-xs font-black border border-[#F4510B30] hover:bg-[#F4510B] hover:text-white transition-all cursor-pointer"
              >
                Edit Coach Details
              </button>
              <button
                type="button"
                onClick={() => setViewDetailCoach(null)}
                className="px-4 py-2 rounded-xl bg-[#172B50] text-white text-xs font-bold hover:bg-[#111f38] transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* 7. MODAL: ADD / EDIT COACH FORM (SECTIONS 8 & 9)             */}
      {/* ============================================================ */}
      {isAddCoachModalOpen && (
        <Modal
          isOpen={isAddCoachModalOpen}
          onClose={() => setIsAddCoachModalOpen(false)}
          title={editingCoach ? `Edit Coach Details: ${editingCoach.name}` : "Register New Academy Coach"}
          subtitle="Super Coach Onboarding & Roster Governance"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSaveCoachForm} className="space-y-4">
            
            {/* Super Coach Scope & Sensitive Data Banner */}
            <div className="p-3 rounded-xl bg-[#FFF9F5] border border-[#F4510B20] text-xs text-[#172B50] flex items-center gap-2.5">
              <SpartanHelmetIcon className="w-5 h-5 text-[#F4510B] shrink-0" />
              <p className="text-[11px] leading-tight">
                <strong>Super Coach Permissions:</strong> Manage coaching faculty, personal & professional details and permitted credentials. Aadhaar, PAN and compensation details are managed by Admin.
              </p>
            </div>

            {/* Section 1: Personal Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-[#172B50] uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#F4510B]" />
                <span>1. Personal Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-[#172B50] mb-1">
                    Coach Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arun Prakash"
                    value={coachFormData.name}
                    onChange={(e) => setCoachFormData({ ...coachFormData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAFAFA] border border-[#172B5018] text-[#172B50] focus:outline-none focus:border-[#F4510B] focus:bg-white"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold text-[#172B50] mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={coachFormData.dob}
                    onChange={(e) => setCoachFormData({ ...coachFormData, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAFAFA] border border-[#172B5018] text-[#172B50] focus:outline-none focus:border-[#F4510B] focus:bg-white"
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-xs font-bold text-[#172B50] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98401 11223"
                    value={coachFormData.phone}
                    onChange={(e) => setCoachFormData({ ...coachFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAFAFA] border border-[#172B5018] text-[#172B50] focus:outline-none focus:border-[#F4510B] focus:bg-white"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-[#172B50] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="coach.name@littlespartans.co.in"
                    value={coachFormData.email}
                    onChange={(e) => setCoachFormData({ ...coachFormData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAFAFA] border border-[#172B5018] text-[#172B50] focus:outline-none focus:border-[#F4510B] focus:bg-white"
                  />
                </div>

                {/* Primary Training Location */}
                <div>
                  <label className="block text-xs font-bold text-[#172B50] mb-1">
                    Primary Academy Center *
                  </label>
                  <select
                    value={coachFormData.center}
                    onChange={(e) => setCoachFormData({ 
                      ...coachFormData, 
                      center: e.target.value,
                      assignedLocations: [e.target.value]
                    })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#FAFAFA] border border-[#172B5018] text-[#172B50] focus:outline-none focus:border-[#F4510B] focus:bg-white cursor-pointer"
                  >
                    {availableLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-[#172B50] mb-1">
                    Gender
                  </label>
                  <select
                    value={coachFormData.gender}
                    onChange={(e) => setCoachFormData({ ...coachFormData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#FAFAFA] border border-[#172B5018] text-[#172B50] focus:outline-none focus:border-[#F4510B] focus:bg-white cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Residential Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#172B50] mb-1">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    placeholder="Street, Area, Chennai - PIN"
                    value={coachFormData.address}
                    onChange={(e) => setCoachFormData({ ...coachFormData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAFAFA] border border-[#172B5018] text-[#172B50] focus:outline-none focus:border-[#F4510B] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Professional Details */}
            <div className="space-y-3 pt-2 border-t border-[#172B5010]">
              <h4 className="text-xs font-black text-[#172B50] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>2. Professional Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Specialization */}
                <div>
                  <label className="block text-xs font-bold text-[#172B50] mb-1">
                    Primary Specialization *
                  </label>
                  <select
                    value={coachFormData.specialization}
                    onChange={(e) => setCoachFormData({ ...coachFormData, specialization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#FAFAFA] border border-[#172B5018] text-[#172B50] focus:outline-none focus:border-[#F4510B] focus:bg-white cursor-pointer"
                  >
                    {SPECIALIZATION_OPTIONS.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience in Years */}
                <div>
                  <label className="block text-xs font-bold text-[#172B50] mb-1">
                    Experience (Years) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    required
                    value={coachFormData.experience}
                    onChange={(e) => setCoachFormData({ ...coachFormData, experience: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAFAFA] border border-[#172B5018] text-[#172B50] focus:outline-none focus:border-[#F4510B] focus:bg-white"
                  />
                </div>

                {/* Certification */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#172B50] mb-1">
                    Certifications & Licenses
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NIS Certified Youth Specialist, AIFF Level C, BFI Level 1"
                    value={coachFormData.certification}
                    onChange={(e) => setCoachFormData({ ...coachFormData, certification: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAFAFA] border border-[#172B5018] text-[#172B50] focus:outline-none focus:border-[#F4510B] focus:bg-white"
                  />
                </div>

                {/* Sports Qualifications */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#172B50] mb-1">
                    Sports Qualifications & Achievements
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B.P.Ed / State Championship Gold Medalist"
                    value={coachFormData.sportsQualifications}
                    onChange={(e) => setCoachFormData({ ...coachFormData, sportsQualifications: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAFAFA] border border-[#172B5018] text-[#172B50] focus:outline-none focus:border-[#F4510B] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#172B5012]">
              <button
                type="button"
                onClick={() => setIsAddCoachModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#172B5020] text-[#172B50] text-xs font-bold hover:bg-[#FFF4E8] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#F4510B] text-white text-xs font-black hover:bg-[#d94406] shadow-sm transition-all cursor-pointer active:scale-95"
              >
                {editingCoach ? 'Save Coach Changes' : 'Create Coach Record'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
