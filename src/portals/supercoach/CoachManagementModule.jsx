import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Award,
  Layers,
  ClipboardCheck,
  Star,
  MapPin,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  MoreHorizontal,
  Plus,
  Eye,
  Edit2,
  CalendarDays,
  FileText,
  BarChart2,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  Zap,
  Check,
  LayoutGrid,
  UserPlus
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';

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

  // Sub-navigation tabs within Coach Management
  // 'faculty' | 'batches' | 'performance' | 'evaluations_overview'
  const [activeSubTab, setActiveSubTab] = useState('faculty');

  // Filters State
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedCoachId, setSelectedCoachId] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('22 Nov 2026 – 22 Nov 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterSpecialization, setFilterSpecialization] = useState('All');

  // Multi-select Checkboxes
  const [selectedCoachIds, setSelectedCoachIds] = useState([]);

  // Active Dropdown Action Menu
  const [activeMenuCoachId, setActiveMenuCoachId] = useState(null);

  // Modals State
  const [isAddCoachModalOpen, setIsAddCoachModalOpen] = useState(false);
  const [isAssignBatchModalOpen, setIsAssignBatchModalOpen] = useState(false);
  const [assignBatchCoach, setAssignBatchCoach] = useState(null);
  const [viewDetailCoach, setViewDetailCoach] = useState(null);
  const [viewBatchesCoach, setViewBatchesCoach] = useState(null);

  // Add Coach Form State (Super Coach Safe Fields - No Aadhaar/PAN/Bank)
  const [newCoachForm, setNewCoachForm] = useState({
    name: '',
    role: 'Coach',
    specialization: 'Foundational Movement',
    center: assignedLocations[0] || 'KK NAGAR',
    phone: '',
    email: '',
    experience: '3+ Yrs',
    certification: '',
    status: 'Active'
  });

  // Assign to Batch Form State
  const [assignForm, setAssignForm] = useState({
    coachId: '',
    location: assignedLocations[0] || 'KK NAGAR',
    batchId: '',
    role: 'Head Coach'
  });

  // 1. SCOPED & ENRICHED DATA
  const allCoaches = useMemo(() => data.coaches || [], [data.coaches]);
  const allClasses = useMemo(() => data.classes || [], [data.classes]);
  const allEvaluations = useMemo(() => data.evaluations || [], [data.evaluations]);

  // Scoped coaches within Super Coach authorized locations
  const scopedCoaches = useMemo(() => {
    return allCoaches.filter((coach) => {
      if (!coach.center && (!coach.assignedLocations || coach.assignedLocations.length === 0)) return true;
      if (coach.center && isLocationAuthorized(coach.center)) return true;
      if (Array.isArray(coach.assignedLocations)) {
        return coach.assignedLocations.some((loc) => isLocationAuthorized(loc));
      }
      return false;
    });
  }, [allCoaches, assignedLocationsNormalized]);

  // Scoped batches
  const scopedBatches = useMemo(() => {
    return allClasses.filter((b) => isLocationAuthorized(b.center));
  }, [allClasses, assignedLocationsNormalized]);

  // Scoped evaluations
  const scopedEvaluations = useMemo(() => {
    return allEvaluations.filter((ev) => isLocationAuthorized(ev.location || ev.center));
  }, [allEvaluations, assignedLocationsNormalized]);

  // Enriched coaches with dynamic batches, programs, session count, attendance, evaluations status
  const enrichedCoaches = useMemo(() => {
    return scopedCoaches.map((coach) => {
      // Find batches taught by coach
      const coachBatches = scopedBatches.filter(
        (b) => b.coachId === coach.id || b.coachName === coach.name || b.coach2Id === coach.id || b.coach2Name === coach.name
      );

      const batchNames = coachBatches.map((b) => b.name);
      const programNames = Array.from(new Set(coachBatches.map((b) => b.program).filter(Boolean)));

      // Dynamic pending evaluations for this coach
      const coachEvals = scopedEvaluations.filter(
        (ev) => ev.coachId === coach.id || ev.coachName === coach.name
      );
      const pendingCount = coachEvals.filter((ev) => ev.status === 'Pending').length;
      const returnedCount = coachEvals.filter((ev) => ev.status === 'Returned').length;

      let evalStatus = 'Up to Date';
      if (returnedCount > 0) {
        evalStatus = 'Review Due';
      } else if (pendingCount > 0) {
        evalStatus = `Pending (${pendingCount})`;
      } else if (coach.evaluationStatus) {
        evalStatus = coach.evaluationStatus;
      }

      return {
        ...coach,
        assignedBatchesList: batchNames.length > 0 ? batchNames : coach.assignedBatches || ['LE - B1'],
        programsList: programNames.length > 0 ? programNames : coach.programs || ['Foundational Movement'],
        sessionsCount: coach.sessions || (coachBatches.length > 0 ? coachBatches.length * 6 : 20),
        attendancePct: coach.attendance || 95,
        ratingNum: coach.rating ? Number(coach.rating) : 4.9,
        evaluationStatusDisplay: evalStatus,
        pendingEvaluationsCount: pendingCount,
      };
    });
  }, [scopedCoaches, scopedBatches, scopedEvaluations]);

  // 2. DYNAMIC TOP KPI VALUES
  const kpis = useMemo(() => {
    const totalCoaches = enrichedCoaches.length;
    const activeCoaches = enrichedCoaches.filter((c) => c.status === 'Active' || c.status === 'active').length;
    const certifiedSpecialists = enrichedCoaches.filter(
      (c) => (c.role && c.role.toLowerCase().includes('specialist')) || c.isCertifiedSpecialist
    ).length;
    const activeBatches = scopedBatches.filter((b) => b.status !== 'Inactive').length;
    const pendingEvaluations = scopedEvaluations.filter((ev) => ev.status === 'Pending').length;

    let avgRating = 4.9;
    if (enrichedCoaches.length > 0) {
      const sum = enrichedCoaches.reduce((acc, c) => acc + (c.ratingNum || 4.9), 0);
      avgRating = Number((sum / enrichedCoaches.length).toFixed(1));
    }

    return {
      totalCoaches,
      activeCoaches,
      certifiedSpecialists,
      activeBatches,
      pendingEvaluations,
      avgRating: `${avgRating} ★`
    };
  }, [enrichedCoaches, scopedBatches, scopedEvaluations]);

  // 3. FILTERED COACHES FOR TABLE
  const filteredCoaches = useMemo(() => {
    return enrichedCoaches.filter((coach) => {
      // Location
      if (selectedLocation !== 'All') {
        const normLoc = selectedLocation.toLowerCase().trim();
        const coachLoc = (coach.center || '').toLowerCase().trim();
        const inAssigned = Array.isArray(coach.assignedLocations) && coach.assignedLocations.some(
          (al) => al.toLowerCase().trim() === normLoc
        );
        if (coachLoc !== normLoc && !inAssigned) return false;
      }

      // Program
      if (selectedProgram !== 'All') {
        const normProg = selectedProgram.toLowerCase().trim();
        const inProgs = coach.programsList.some(
          (p) => p.toLowerCase().trim() === normProg
        );
        if (!inProgs) return false;
      }

      // Batch
      if (selectedBatch !== 'All') {
        const inBatches = coach.assignedBatchesList.some(
          (b) => b.toLowerCase().trim() === selectedBatch.toLowerCase().trim()
        );
        if (!inBatches) return false;
      }

      // Coach
      if (selectedCoachId !== 'All' && coach.id !== selectedCoachId) {
        return false;
      }

      // Specialization
      if (filterSpecialization !== 'All') {
        const normSpec = filterSpecialization.toLowerCase().trim();
        const coachSpec = (coach.specialization || '').toLowerCase().trim();
        if (coachSpec !== normSpec && !coachSpec.includes(normSpec)) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (coach.name || '').toLowerCase().includes(q);
        const specMatch = (coach.specialization || '').toLowerCase().includes(q);
        const centerMatch = (coach.center || '').toLowerCase().includes(q);
        if (!nameMatch && !specMatch && !centerMatch) return false;
      }

      return true;
    });
  }, [
    enrichedCoaches,
    selectedLocation,
    selectedProgram,
    selectedBatch,
    selectedCoachId,
    filterSpecialization,
    searchQuery
  ]);

  // Checkbox Handlers
  const isAllSelected = filteredCoaches.length > 0 && filteredCoaches.every((c) => selectedCoachIds.includes(c.id));
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCoachIds([]);
    } else {
      setSelectedCoachIds(filteredCoaches.map((c) => c.id));
    }
  };
  const handleToggleSelectCoach = (id) => {
    setSelectedCoachIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Specialization Badge Styles
  const getSpecializationBadgeStyle = (spec = '') => {
    const s = spec.toLowerCase();
    if (s.includes('athletic') || s.includes('movement & athletics')) {
      return 'bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]';
    }
    if (s.includes('football')) {
      return 'bg-[#EDE9FE] text-[#7C3AED] border border-[#DDD6FE]';
    }
    if (s.includes('basketball')) {
      return 'bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA]';
    }
    if (s.includes('foundational') || s.includes('gymnastic')) {
      return 'bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]';
    }
    return 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]';
  };

  // Evaluation Status Badge Styles
  const getEvaluationStatusBadge = (statusStr = '') => {
    if (statusStr.includes('Up to Date')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
          <Check className="w-3 h-3 stroke-[3]" />
          <span>Up to Date</span>
        </span>
      );
    }
    if (statusStr.includes('Pending')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
          <Clock className="w-3 h-3 stroke-[2.5]" />
          <span>{statusStr}</span>
        </span>
      );
    }
    if (statusStr.includes('Review Due') || statusStr.includes('Returned')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
          <Clock className="w-3 h-3 stroke-[2.5]" />
          <span>Review Due</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
        <span>{statusStr}</span>
      </span>
    );
  };

  // Batch Summary by Location calculations
  const locationBatchSummary = useMemo(() => {
    const locMap = {
      'KK Nagar': { count: 0, normName: 'KK NAGAR' },
      'Anna Nagar': { count: 0, normName: 'ANNA NAGAR' },
      'Kilpauk': { count: 0, normName: 'KILPAUK' },
      'Mahalingapuram': { count: 0, normName: 'MAHALINGAPURAM' }
    };

    scopedBatches.forEach((b) => {
      const bCenter = (b.center || '').toUpperCase();
      if (bCenter.includes('KK')) locMap['KK Nagar'].count++;
      else if (bCenter.includes('ANNA')) locMap['Anna Nagar'].count++;
      else if (bCenter.includes('KILPAUK')) locMap['Kilpauk'].count++;
      else if (bCenter.includes('MAHALINGA')) locMap['Mahalingapuram'].count++;
    });

    const maxCount = Math.max(1, ...Object.values(locMap).map((m) => m.count));

    return Object.entries(locMap).map(([name, val]) => ({
      name,
      normName: val.normName,
      count: val.count || 3,
      pct: Math.min(100, Math.round(((val.count || 3) / (maxCount || 4)) * 100))
    }));
  }, [scopedBatches]);

  // Evaluation Review summary counts
  const evalReviewCounts = useMemo(() => {
    const pending = scopedEvaluations.filter((ev) => ev.status === 'Pending').length || 8;
    const returned = scopedEvaluations.filter((ev) => ev.status === 'Returned').length || 2;
    const approved = scopedEvaluations.filter((ev) => ev.status === 'Approved').length || 36;
    return { pending, returned, approved };
  }, [scopedEvaluations]);

  // Handlers
  const handleOpenAddCoachModal = () => {
    setNewCoachForm({
      name: '',
      role: 'Coach',
      specialization: 'Foundational Movement',
      center: selectedLocation !== 'All' ? selectedLocation : assignedLocations[0] || 'KK NAGAR',
      phone: '',
      email: '',
      experience: '3+ Yrs',
      certification: '',
      status: 'Active'
    });
    setIsAddCoachModalOpen(true);
  };

  const handleSaveAddCoach = (e) => {
    e.preventDefault();
    if (!newCoachForm.name.trim() || !newCoachForm.phone.trim()) {
      addToast('Coach Name and Phone number are required.', 'error');
      return;
    }

    addCoach({
      name: newCoachForm.name.trim(),
      role: newCoachForm.role,
      specialization: newCoachForm.specialization,
      center: newCoachForm.center,
      assignedLocations: [newCoachForm.center],
      phone: newCoachForm.phone.trim(),
      email: newCoachForm.email.trim(),
      experience: newCoachForm.experience,
      certification: newCoachForm.certification,
      status: 'Active',
      rating: 4.8,
      attendance: 95,
      sessions: 16,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    addToast(`Coach ${newCoachForm.name} registered successfully.`, 'success');
    setIsAddCoachModalOpen(false);
  };

  const handleOpenAssignBatch = (coach) => {
    setAssignBatchCoach(coach);
    const initialLoc = coach?.center || assignedLocations[0] || 'KK NAGAR';
    const locBatches = scopedBatches.filter((b) => b.center === initialLoc);
    setAssignForm({
      coachId: coach?.id || '',
      location: initialLoc,
      batchId: locBatches[0]?.id || '',
      role: 'Head Coach'
    });
    setIsAssignBatchModalOpen(true);
    setActiveMenuCoachId(null);
  };

  const handleSaveAssignBatch = (e) => {
    e.preventDefault();
    if (!assignForm.coachId || !assignForm.batchId) {
      addToast('Please select both a Coach and a Batch.', 'error');
      return;
    }
    const coachObj = enrichedCoaches.find((c) => c.id === assignForm.coachId);
    const batchObj = scopedBatches.find((b) => b.id === assignForm.batchId);

    if (batchObj && coachObj) {
      reassignScheduleCoach(batchObj.id, coachObj.id, coachObj.name, 'Super Coach', `Assigned as ${assignForm.role}`);
      addToast(`Assigned ${coachObj.name} to batch ${batchObj.name} at ${assignForm.location}.`, 'success');
    }
    setIsAssignBatchModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* ======================================================== */}
      {/* 1. TOP 6 KPI CARDS (Matching Reference Screenshot)       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total Coaches */}
        <div className="bg-[#FFF9F5] border border-[#F4510B22] rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0 border border-[#F4510B25]">
            <Users className="w-5 h-5 text-[#F4510B]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none">
              {kpis.totalCoaches}
            </div>
            <div className="text-[11px] font-bold text-[#172B50]/70 mt-1 whitespace-nowrap">
              Total Coaches
            </div>
          </div>
        </div>

        {/* Card 2: Active Coaches */}
        <div className="bg-[#F0FDF4] border border-[#16A34A20] rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 border border-[#16A34A25]">
            <UserCheck className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none">
              {kpis.activeCoaches}
            </div>
            <div className="text-[11px] font-bold text-[#172B50]/70 mt-1 whitespace-nowrap">
              Active Coaches
            </div>
          </div>
        </div>

        {/* Card 3: Certified Specialists */}
        <div className="bg-[#F0F7FF] border border-[#0284C720] rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0 border border-[#0284C725]">
            <Award className="w-5 h-5 text-[#0284C7]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none">
              {kpis.certifiedSpecialists}
            </div>
            <div className="text-[11px] font-bold text-[#172B50]/70 mt-1 whitespace-nowrap">
              Certified Specialists
            </div>
          </div>
        </div>

        {/* Card 4: Active Batches */}
        <div className="bg-[#FAF5FF] border border-[#8B5CF620] rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#8B5CF6] flex items-center justify-center shrink-0 border border-[#8B5CF625]">
            <Layers className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none">
              {kpis.activeBatches}
            </div>
            <div className="text-[11px] font-bold text-[#172B50]/70 mt-1 whitespace-nowrap">
              Active Batches
            </div>
          </div>
        </div>

        {/* Card 5: Pending Evaluations */}
        <div className="bg-[#FFF7ED] border border-[#F9731620] rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFEDD5] text-[#F97316] flex items-center justify-center shrink-0 border border-[#F9731625]">
            <ClipboardCheck className="w-5 h-5 text-[#F97316]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none">
              {kpis.pendingEvaluations}
            </div>
            <div className="text-[11px] font-bold text-[#172B50]/70 mt-1 whitespace-nowrap">
              Pending Evaluations
            </div>
          </div>
        </div>

        {/* Card 6: Average Faculty Rating */}
        <div className="bg-[#FEFCE8] border border-[#EAB30820] rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEF08A] text-[#CA8A04] flex items-center justify-center shrink-0 border border-[#CA8A0425]">
            <Star className="w-5 h-5 text-[#CA8A04]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#172B50] leading-none">
              {kpis.avgRating}
            </div>
            <div className="text-[11px] font-bold text-[#172B50]/70 mt-1 whitespace-nowrap">
              Average Faculty Rating
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SUB-NAVIGATION TABS & ACTION BUTTON                   */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-[#172B5015] shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('faculty')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'faculty'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'bg-[#F8FAFC] text-[#172B50] hover:bg-[#FFF5ED] hover:text-[#F4510B]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Coaching Faculty</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('batches')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'batches'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'bg-[#F8FAFC] text-[#172B50] hover:bg-[#FFF5ED] hover:text-[#F4510B]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Batch Supervision</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('performance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'performance'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'bg-[#F8FAFC] text-[#172B50] hover:bg-[#FFF5ED] hover:text-[#F4510B]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Coach Performance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('evaluations_overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'evaluations_overview'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'bg-[#F8FAFC] text-[#172B50] hover:bg-[#FFF5ED] hover:text-[#F4510B]'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Evaluation Overview</span>
          </button>
        </div>

        {/* Right-hand Action: Review Child Evaluations */}
        <button
          type="button"
          onClick={() => {
            if (onNavigateToEvaluations) {
              onNavigateToEvaluations();
            }
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#F4510B] hover:bg-[#FFF5ED] border border-[#F4510B] text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
        >
          <span>Review Child Evaluations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. HORIZONTAL FILTERS TOOLBAR                            */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-[#172B5015] shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Location Filter */}
          <div className="relative inline-flex items-center">
            <MapPin className="w-3.5 h-3.5 text-[#F4510B] absolute left-3 pointer-events-none z-10" />
            <select
              aria-label="Filter coaches by location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="pl-8 pr-7 py-2 text-xs font-bold bg-[#F8FAFC] text-[#172B50] border border-[#172B5018] rounded-xl hover:border-[#F4510B50] focus:outline-none focus:ring-2 focus:ring-[#F4510B20] focus:border-[#F4510B] cursor-pointer appearance-none"
            >
              <option value="All">All Locations</option>
              {assignedLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Program Filter */}
          <div className="relative inline-flex items-center">
            <LayoutGrid className="w-3.5 h-3.5 text-[#F4510B] absolute left-3 pointer-events-none z-10" />
            <select
              aria-label="Filter coaches by program"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="pl-8 pr-7 py-2 text-xs font-bold bg-[#F8FAFC] text-[#172B50] border border-[#172B5018] rounded-xl hover:border-[#F4510B50] focus:outline-none focus:ring-2 focus:ring-[#F4510B20] focus:border-[#F4510B] cursor-pointer appearance-none"
            >
              <option value="All">All Programs</option>
              {(data.programs || []).map((prog) => (
                <option key={prog.id} value={prog.name}>
                  {prog.name}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Filter */}
          <div className="relative inline-flex items-center">
            <Layers className="w-3.5 h-3.5 text-[#F4510B] absolute left-3 pointer-events-none z-10" />
            <select
              aria-label="Filter coaches by batch"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="pl-8 pr-7 py-2 text-xs font-bold bg-[#F8FAFC] text-[#172B50] border border-[#172B5018] rounded-xl hover:border-[#F4510B50] focus:outline-none focus:ring-2 focus:ring-[#F4510B20] focus:border-[#F4510B] cursor-pointer appearance-none"
            >
              <option value="All">All Batches</option>
              {scopedBatches.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name} ({b.center})
                </option>
              ))}
            </select>
          </div>

          {/* Coach Filter */}
          <div className="relative inline-flex items-center">
            <UserCheck className="w-3.5 h-3.5 text-[#F4510B] absolute left-3 pointer-events-none z-10" />
            <select
              aria-label="Filter by specific coach"
              value={selectedCoachId}
              onChange={(e) => setSelectedCoachId(e.target.value)}
              className="pl-8 pr-7 py-2 text-xs font-bold bg-[#F8FAFC] text-[#172B50] border border-[#172B5018] rounded-xl hover:border-[#F4510B50] focus:outline-none focus:ring-2 focus:ring-[#F4510B20] focus:border-[#F4510B] cursor-pointer appearance-none"
            >
              <option value="All">All Coaches</option>
              {enrichedCoaches.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="relative inline-flex items-center">
            <Calendar className="w-3.5 h-3.5 text-[#F4510B] absolute left-3 pointer-events-none z-10" />
            <select
              aria-label="Date range"
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="pl-8 pr-7 py-2 text-xs font-bold bg-[#F8FAFC] text-[#172B50] border border-[#172B5018] rounded-xl hover:border-[#F4510B50] focus:outline-none focus:ring-2 focus:ring-[#F4510B20] focus:border-[#F4510B] cursor-pointer appearance-none"
            >
              <option value="22 Nov 2026 – 22 Nov 2026">22 Nov 2026 – 22 Nov 2026</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#172B50]/40 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coach by name, specialization..."
              className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-[#F8FAFC] text-[#172B50] placeholder-[#172B5060] border border-[#172B5018] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B20] focus:border-[#F4510B]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#172B50]/40 hover:text-[#172B50] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Advanced Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters((prev) => !prev)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
              showAdvancedFilters || filterSpecialization !== 'All'
                ? 'bg-[#FFF5ED] border-[#F4510B] text-[#F4510B]'
                : 'bg-[#F8FAFC] border-[#172B5018] text-[#F4510B] hover:bg-[#FFF5ED]'
            }`}
            title="Toggle advanced filters"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      {showAdvancedFilters && (
        <div className="bg-white rounded-2xl p-4 border border-[#172B5015] shadow-2xs space-y-2 animate-in fade-in duration-150">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#172B50]/60">
            Filter by Specialization:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Foundational Movement', 'Football', 'Basketball', 'Movement & Athletics'].map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => setFilterSpecialization(spec)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterSpecialization === spec
                    ? 'bg-[#172B50] text-white shadow-xs'
                    : 'bg-[#F8FAFC] text-[#172B50] hover:bg-[#FFF5ED] border border-[#172B5018]'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TAB CONTENT 1: COACHING FACULTY TABLE                 */}
      {/* ======================================================== */}
      {activeSubTab === 'faculty' && (
        <div className="bg-white rounded-2xl border border-[#172B5015] shadow-2xs overflow-hidden">
          {/* Card Header Title with Orange Vertical Bar */}
          <div className="p-4 border-b border-[#172B5010] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-5 rounded-full bg-[#F4510B]" />
              <h3 className="text-base font-black text-[#172B50]">
                Coaching Faculty ({filteredCoaches.length})
              </h3>
            </div>
            {selectedCoachIds.length > 0 && (
              <div className="text-xs font-bold text-[#F4510B]">
                {selectedCoachIds.length} coach(es) selected
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#172B5010] bg-[#FFFBF7]/60 text-[#172B50]/70 text-[11px] uppercase tracking-wider font-extrabold">
                  {/* 1. Checkbox */}
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      aria-label="Select all coaches"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-[#172B5030] text-[#F4510B] focus:ring-[#F4510B] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3 font-extrabold text-[#172B50] whitespace-nowrap">Coach Name</th>
                  <th className="py-3 px-3 font-extrabold text-[#172B50] whitespace-nowrap">Specialization</th>
                  <th className="py-3 px-3 font-extrabold text-[#172B50] whitespace-nowrap">Locations</th>
                  <th className="py-3 px-3 font-extrabold text-[#172B50] whitespace-nowrap">Programs</th>
                  <th className="py-3 px-3 font-extrabold text-[#172B50] whitespace-nowrap">Batches</th>
                  <th className="py-3 px-3 font-extrabold text-[#172B50] text-center whitespace-nowrap">Sessions</th>
                  <th className="py-3 px-3 font-extrabold text-[#172B50] text-center whitespace-nowrap">Attendance</th>
                  <th className="py-3 px-3 font-extrabold text-[#172B50] whitespace-nowrap">Rating</th>
                  <th className="py-3 px-3 font-extrabold text-[#172B50] whitespace-nowrap">Evaluation Status</th>
                  <th className="py-3 px-3 font-extrabold text-[#172B50] text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#172B500C]">
                {filteredCoaches.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 px-4 text-center">
                      <div className="max-w-sm mx-auto flex flex-col items-center">
                        <Users className="w-8 h-8 text-[#172B50]/30 mb-2" />
                        <h4 className="text-sm font-black text-[#172B50]">No coaches found</h4>
                        <p className="text-xs text-[#172B50]/60 mt-1">
                          Try adjusting your location, program, or search filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCoaches.map((coach) => {
                    const isChecked = selectedCoachIds.includes(coach.id);
                    const isMenuOpen = activeMenuCoachId === coach.id;

                    return (
                      <tr
                        key={coach.id}
                        className={`hover:bg-[#FFF9F5]/70 transition-colors ${
                          isChecked ? 'bg-[#FFF5ED]/50' : ''
                        }`}
                      >
                        {/* 1. Checkbox */}
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            aria-label={`Select coach ${coach.name}`}
                            checked={isChecked}
                            onChange={() => handleToggleSelectCoach(coach.id)}
                            className="w-4 h-4 rounded border-[#172B5030] text-[#F4510B] focus:ring-[#F4510B] cursor-pointer"
                          />
                        </td>

                        {/* 2. Coach Name & Photo */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={coach.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={coach.name}
                              className="w-9 h-9 rounded-full object-cover border border-[#172B5015] shrink-0"
                            />
                            <div>
                              <div className="font-black text-[#172B50] text-xs">
                                {coach.name}
                              </div>
                              <div className="text-[10px] text-[#172B50]/60 font-semibold">
                                {coach.role || 'Coach'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Specialization */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-black ${getSpecializationBadgeStyle(coach.specialization)}`}>
                            {coach.specialization || 'Foundational Movement'}
                          </span>
                        </td>

                        {/* 4. Locations */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-[#172B50] font-semibold">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                            <span>{coach.center}</span>
                          </div>
                        </td>

                        {/* 5. Programs */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-[#172B50]/80 font-medium">
                          {coach.programsList.join(', ')}
                        </td>

                        {/* 6. Batches */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-[#172B50] font-bold">
                          {coach.assignedBatchesList.join(', ')}
                        </td>

                        {/* 7. Sessions */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-center font-bold text-[#172B50]">
                          {coach.sessionsCount}
                        </td>

                        {/* 8. Attendance */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-center">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-black bg-[#DCFCE7] text-[#15803D]">
                            {coach.attendancePct}%
                          </span>
                        </td>

                        {/* 9. Rating */}
                        <td className="py-3.5 px-3 whitespace-nowrap font-black text-[#172B50]">
                          <span className="text-[#CA8A04]">{coach.ratingNum} ★</span>
                        </td>

                        {/* 10. Evaluation Status */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {getEvaluationStatusBadge(coach.evaluationStatusDisplay)}
                        </td>

                        {/* 11. Actions (3-Dot Menu) */}
                        <td className="py-3.5 px-3 text-right whitespace-nowrap relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuCoachId(isMenuOpen ? null : coach.id);
                            }}
                            className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#172B5015] hover:bg-[#FFF5ED] hover:border-[#F4510B50] text-[#172B50] flex items-center justify-center transition-all cursor-pointer ml-auto"
                            title="Coach actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {/* Action Dropdown Menu */}
                          {isMenuOpen && (
                            <div className="absolute right-3 top-10 w-48 bg-white rounded-2xl shadow-[0_10px_35px_rgba(23,43,80,0.15)] border border-[#172B5015] py-1.5 z-50 text-left text-xs animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setViewDetailCoach(coach);
                                  setActiveMenuCoachId(null);
                                }}
                                className="w-full px-3.5 py-2 text-[#172B50] hover:bg-[#FFF5ED] flex items-center gap-2.5 font-bold cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#172B50]/70" />
                                <span>View Coach Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setViewBatchesCoach(coach);
                                  setActiveMenuCoachId(null);
                                }}
                                className="w-full px-3.5 py-2 text-[#172B50] hover:bg-[#FFF5ED] flex items-center gap-2.5 font-bold cursor-pointer"
                              >
                                <Layers className="w-3.5 h-3.5 text-[#8B5CF6]" />
                                <span>View Assigned Batches</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenAssignBatch(coach)}
                                className="w-full px-3.5 py-2 text-[#172B50] hover:bg-[#FFF5ED] flex items-center gap-2.5 font-bold cursor-pointer"
                              >
                                <CalendarDays className="w-3.5 h-3.5 text-[#3B82F6]" />
                                <span>Assign to Batch</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuCoachId(null);
                                  if (onNavigateToEvaluations) onNavigateToEvaluations();
                                }}
                                className="w-full px-3.5 py-2 text-[#172B50] hover:bg-[#FFF5ED] flex items-center gap-2.5 font-bold cursor-pointer"
                              >
                                <ClipboardCheck className="w-3.5 h-3.5 text-[#10B981]" />
                                <span>View Child Evaluations</span>
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
        </div>
      )}

      {/* ======================================================== */}
      {/* 4B. TAB 2: BATCH SUPERVISION                             */}
      {/* ======================================================== */}
      {activeSubTab === 'batches' && (
        <div className="bg-white rounded-2xl border border-[#172B5015] shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#172B5010]">
            <div>
              <h3 className="text-base font-black text-[#172B50]">Batch Supervision Matrix</h3>
              <p className="text-xs text-[#172B50]/70 mt-0.5">
                Active class batches, coach staffing allocations, and session status across authorized centers
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenAssignBatch(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4510B] text-white text-xs font-bold rounded-xl shadow-xs hover:brightness-110 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Assign Coach</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scopedBatches.map((batch) => (
              <div
                key={batch.id}
                className="bg-[#FFFDF9] border border-[#172B5015] rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-sm text-[#172B50]">{batch.name}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-[#172B50]/70 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#F4510B]" />
                        <span>{batch.center}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#DCFCE7] text-[#15803D]">
                      {batch.status || 'Active'}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#172B50]/60">Program:</span>
                      <strong className="text-[#172B50] font-bold">{batch.program}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#172B50]/60">Lead Coach:</span>
                      <strong className="text-[#F4510B] font-black">{batch.coachName || 'Arun Prakash'}</strong>
                    </div>
                    {batch.coach2Name && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#172B50]/60">Assistant Coach:</span>
                        <strong className="text-[#172B50] font-bold">{batch.coach2Name}</strong>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[#172B50]/60">Schedule:</span>
                      <span className="text-[#172B50] font-medium">{batch.schedule}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#172B50]/60">Enrolled Athletes:</span>
                      <span className="font-bold text-[#172B50]">
                        {batch.enrolledCount || 8} / {batch.capacity || 15}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#172B5010] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      const coach = enrichedCoaches.find((c) => c.name === batch.coachName);
                      handleOpenAssignBatch(coach);
                    }}
                    className="text-xs font-bold text-[#F4510B] hover:underline cursor-pointer"
                  >
                    Reassign Coach →
                  </button>
                  <span className="text-[10px] font-bold text-[#172B50]/50">
                    Capacity: {Math.round(((batch.enrolledCount || 8) / (batch.capacity || 15)) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4C. TAB 3: COACH PERFORMANCE                             */}
      {/* ======================================================== */}
      {activeSubTab === 'performance' && (
        <div className="bg-white rounded-2xl border border-[#172B5015] shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#172B5010]">
            <div>
              <h3 className="text-base font-black text-[#172B50]">Coaching Faculty Performance & Oversight</h3>
              <p className="text-xs text-[#172B50]/70 mt-0.5">
                Attendance metrics, punctuality, student evaluation turnaround, and supervisory reviews
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrichedCoaches.map((coach) => (
              <div
                key={coach.id}
                className="bg-[#FFFDF9] border border-[#172B5015] rounded-2xl p-4 shadow-2xs flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={coach.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={coach.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-[#172B5015] shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-[#172B50]">{coach.name}</h4>
                      <span className="text-xs font-black text-[#CA8A04]">{coach.ratingNum} ★</span>
                    </div>
                    <p className="text-xs text-[#F4510B] font-bold mt-0.5">{coach.specialization}</p>
                    <div className="text-[11px] text-[#172B50]/60">{coach.center} • {coach.experience || '4+ Yrs Exp'}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-[#172B5010] text-center">
                  <div>
                    <div className="text-xs font-black text-[#172B50]">{coach.attendancePct}%</div>
                    <div className="text-[10px] text-[#172B50]/60">Attendance</div>
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#172B50]">{coach.sessionsCount}</div>
                    <div className="text-[10px] text-[#172B50]/60">Sessions</div>
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#172B50]">{coach.evaluationStatusDisplay}</div>
                    <div className="text-[10px] text-[#172B50]/60">Evaluations</div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-[#172B50]/80 bg-[#FFF5ED]/50 p-2 rounded-lg border border-[#F4510B15]">
                  <strong>Supervisory Note:</strong> Demonstrates consistent adherence to curriculum safety protocols and excellent parent rapport.
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4D. TAB 4: EVALUATION OVERVIEW                           */}
      {/* ======================================================== */}
      {activeSubTab === 'evaluations_overview' && (
        <div className="bg-white rounded-2xl border border-[#172B5015] shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#172B5010]">
            <div>
              <h3 className="text-base font-black text-[#172B50]">Quarterly Child Evaluation Supervision</h3>
              <p className="text-xs text-[#172B50]/70 mt-0.5">
                Overview of submitted evaluations by coaches awaiting Super Coach verification before publishing
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onNavigateToEvaluations) onNavigateToEvaluations();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F4510B] text-white text-xs font-bold rounded-xl shadow-xs hover:brightness-110 cursor-pointer"
            >
              <span>Go to Evaluation Review Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-[#FFF7ED] border border-[#F9731620] rounded-2xl p-4">
              <div className="text-xs font-bold text-[#F97316]">Pending Super Coach Verification</div>
              <div className="text-2xl font-black text-[#172B50] mt-1">{evalReviewCounts.pending}</div>
              <p className="text-[11px] text-[#172B50]/70 mt-1">Submitted by coaches, awaiting quality check & publishing</p>
            </div>
            <div className="bg-[#FEF2F2] border border-[#EF444420] rounded-2xl p-4">
              <div className="text-xs font-bold text-[#EF4444]">Returned for Coach Re-assessment</div>
              <div className="text-2xl font-black text-[#172B50] mt-1">{evalReviewCounts.returned}</div>
              <p className="text-[11px] text-[#172B50]/70 mt-1">Feedback provided to coach for skill rating adjustment</p>
            </div>
            <div className="bg-[#F0FDF4] border border-[#16A34A20] rounded-2xl p-4">
              <div className="text-xs font-bold text-[#16A34A]">Approved &amp; Live on Parent Portal</div>
              <div className="text-2xl font-black text-[#172B50] mt-1">{evalReviewCounts.approved}</div>
              <p className="text-[11px] text-[#172B50]/70 mt-1">Published milestones and badges visible to parents</p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. BOTTOM 3-CARD GRID (Exact layout from reference)      */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Batch Summary by Location */}
        <div className="bg-white rounded-2xl border border-[#172B5015] p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#172B5010]">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#F4510B]" />
                <h4 className="text-xs font-black text-[#172B50]">Batch Summary by Location</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('batches')}
                className="text-[11px] font-bold text-[#F4510B] hover:underline cursor-pointer"
              >
                View All →
              </button>
            </div>

            <div className="mt-3.5 space-y-3">
              {locationBatchSummary.map((loc) => (
                <div
                  key={loc.name}
                  onClick={() => setSelectedLocation(loc.normName)}
                  className="group cursor-pointer"
                  title={`Click to filter by ${loc.name}`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#172B50] group-hover:text-[#F4510B] transition-colors">
                      {loc.name}
                    </span>
                    <span className="font-black text-[#172B50] text-[11px]">
                      {loc.count} Batches
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                      style={{ width: `${loc.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Evaluation Review */}
        <div className="bg-white rounded-2xl border border-[#172B5015] p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#172B5010]">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-[#F4510B]" />
                <h4 className="text-xs font-black text-[#172B50]">Evaluation Review</h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToEvaluations) onNavigateToEvaluations();
                }}
                className="text-[11px] font-bold text-[#F4510B] hover:underline cursor-pointer"
              >
                View All →
              </button>
            </div>

            <div className="mt-3.5 space-y-2.5">
              {/* Row 1: Pending Evaluations */}
              <div
                onClick={() => {
                  if (onNavigateToEvaluations) onNavigateToEvaluations();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF5FF] hover:bg-[#F3E8FF] transition-colors border border-[#8B5CF620] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#EDE9FE] text-[#8B5CF6] flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#172B50]">Pending Evaluations</span>
                </div>
                <span className="min-w-[24px] h-6 px-2 rounded-full bg-[#8B5CF6] text-white text-xs font-black flex items-center justify-center">
                  {evalReviewCounts.pending}
                </span>
              </div>

              {/* Row 2: Returned to Coach */}
              <div
                onClick={() => {
                  if (onNavigateToEvaluations) onNavigateToEvaluations();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF7ED] hover:bg-[#FFEDD5] transition-colors border border-[#F9731620] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#FFEDD5] text-[#F97316] flex items-center justify-center">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#172B50]">Returned to Coach</span>
                </div>
                <span className="min-w-[24px] h-6 px-2 rounded-full bg-[#F97316] text-white text-xs font-black flex items-center justify-center">
                  {evalReviewCounts.returned}
                </span>
              </div>

              {/* Row 3: Approved & Published */}
              <div
                onClick={() => {
                  if (onNavigateToEvaluations) onNavigateToEvaluations();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] transition-colors border border-[#16A34A20] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#172B50]">Approved &amp; Published</span>
                </div>
                <span className="min-w-[24px] h-6 px-2 rounded-full bg-[#16A34A] text-white text-xs font-black flex items-center justify-center">
                  {evalReviewCounts.approved}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Quick Actions */}
        <div className="bg-white rounded-2xl border border-[#172B5015] p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-[#172B5010]">
              <Zap className="w-4 h-4 text-[#F4510B]" />
              <h4 className="text-xs font-black text-[#172B50]">Quick Actions</h4>
            </div>

            <div className="mt-3.5 grid grid-cols-3 gap-2">
              {/* Action 1: Add Coach */}
              <button
                type="button"
                onClick={handleOpenAddCoachModal}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FFF5ED] border border-[#F4510B25] hover:bg-[#F4510B] hover:text-white text-[#172B50] transition-all cursor-pointer group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-xl bg-white text-[#F4510B] group-hover:bg-white group-hover:text-[#F4510B] flex items-center justify-center mb-1.5 shadow-2xs">
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-black text-center leading-tight">
                  Add Coach
                </span>
              </button>

              {/* Action 2: Assign to Batch */}
              <button
                type="button"
                onClick={() => handleOpenAssignBatch(null)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FAF5FF] border border-[#8B5CF625] hover:bg-[#8B5CF6] hover:text-white text-[#172B50] transition-all cursor-pointer group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-xl bg-white text-[#8B5CF6] group-hover:bg-white group-hover:text-[#8B5CF6] flex items-center justify-center mb-1.5 shadow-2xs">
                  <CalendarDays className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-black text-center leading-tight">
                  Assign to Batch
                </span>
              </button>

              {/* Action 3: View Evaluations */}
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToEvaluations) onNavigateToEvaluations();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F0FDF4] border border-[#16A34A25] hover:bg-[#16A34A] hover:text-white text-[#172B50] transition-all cursor-pointer group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-xl bg-white text-[#16A34A] group-hover:bg-white group-hover:text-[#16A34A] flex items-center justify-center mb-1.5 shadow-2xs">
                  <ClipboardCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-black text-center leading-tight">
                  View Evaluations
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. MODAL: ADD COACH (SUPER COACH SAFE FIELDS)             */}
      {/* ======================================================== */}
      {isAddCoachModalOpen && (
        <Modal
          isOpen={isAddCoachModalOpen}
          onClose={() => setIsAddCoachModalOpen(false)}
          title="Add Spartan Coaching Faculty"
          subtitle="Register an accredited coach for batch supervision"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSaveAddCoach} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Coach Full Name <span className="text-[#F4510B]">*</span>
              </label>
              <input
                type="text"
                required
                value={newCoachForm.name}
                onChange={(e) => setNewCoachForm({ ...newCoachForm, name: e.target.value })}
                placeholder="e.g. Arun Prakash"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5020] focus:outline-none focus:border-[#F4510B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">
                  Designation / Role
                </label>
                <select
                  value={newCoachForm.role}
                  onChange={(e) => setNewCoachForm({ ...newCoachForm, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5020] focus:outline-none focus:border-[#F4510B]"
                >
                  <option value="Senior Coach">Senior Coach</option>
                  <option value="Coach">Coach</option>
                  <option value="Assistant Coach">Assistant Coach</option>
                  <option value="Specialist Trainer">Specialist Trainer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">
                  Primary Location
                </label>
                <select
                  value={newCoachForm.center}
                  onChange={(e) => setNewCoachForm({ ...newCoachForm, center: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5020] focus:outline-none focus:border-[#F4510B]"
                >
                  {assignedLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">
                  Specialization <span className="text-[#F4510B]">*</span>
                </label>
                <select
                  value={newCoachForm.specialization}
                  onChange={(e) => setNewCoachForm({ ...newCoachForm, specialization: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5020] focus:outline-none focus:border-[#F4510B]"
                >
                  <option value="Foundational Movement">Foundational Movement</option>
                  <option value="Movement & Athletics">Movement & Athletics</option>
                  <option value="Football">Football</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Spartan Gymnastics & Agility">Gymnastics & Agility</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">
                  Experience (Years)
                </label>
                <input
                  type="text"
                  value={newCoachForm.experience}
                  onChange={(e) => setNewCoachForm({ ...newCoachForm, experience: e.target.value })}
                  placeholder="e.g. 4+ Yrs"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5020] focus:outline-none focus:border-[#F4510B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">
                  Phone Number <span className="text-[#F4510B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCoachForm.phone}
                  onChange={(e) => setNewCoachForm({ ...newCoachForm, phone: e.target.value })}
                  placeholder="+91 98400 00000"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5020] focus:outline-none focus:border-[#F4510B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newCoachForm.email}
                  onChange={(e) => setNewCoachForm({ ...newCoachForm, email: e.target.value })}
                  placeholder="coach@littlespartans.co.in"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5020] focus:outline-none focus:border-[#F4510B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Certifications &amp; Licenses
              </label>
              <input
                type="text"
                value={newCoachForm.certification}
                onChange={(e) => setNewCoachForm({ ...newCoachForm, certification: e.target.value })}
                placeholder="e.g. NIS Certified, AIFF 'C' License"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5020] focus:outline-none focus:border-[#F4510B]"
              />
            </div>

            <div className="pt-3 border-t border-[#172B5010] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddCoachModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-[#F8FAFC] border border-[#172B5020] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-black bg-[#F4510B] text-white hover:brightness-110 shadow-sm cursor-pointer"
              >
                Register Coach
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* 7. MODAL: ASSIGN COACH TO BATCH                          */}
      {/* ======================================================== */}
      {isAssignBatchModalOpen && (
        <Modal
          isOpen={isAssignBatchModalOpen}
          onClose={() => setIsAssignBatchModalOpen(false)}
          title="Assign Coach to Training Batch"
          subtitle="Staffing oversight and coach allocation"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveAssignBatch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Select Coach
              </label>
              <select
                value={assignForm.coachId}
                onChange={(e) => setAssignForm({ ...assignForm, coachId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5020] focus:outline-none focus:border-[#F4510B]"
              >
                <option value="">-- Choose Coach --</option>
                {enrichedCoaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.specialization} • {c.center})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Location
              </label>
              <select
                value={assignForm.location}
                onChange={(e) => {
                  const loc = e.target.value;
                  const locBatches = scopedBatches.filter((b) => b.center === loc);
                  setAssignForm({
                    ...assignForm,
                    location: loc,
                    batchId: locBatches[0]?.id || ''
                  });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5020] focus:outline-none focus:border-[#F4510B]"
              >
                {assignedLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Target Batch
              </label>
              <select
                value={assignForm.batchId}
                onChange={(e) => setAssignForm({ ...assignForm, batchId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5020] focus:outline-none focus:border-[#F4510B]"
              >
                <option value="">-- Choose Batch --</option>
                {scopedBatches
                  .filter((b) => b.center === assignForm.location)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} - {b.program} ({b.schedule})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Assignment Role
              </label>
              <select
                value={assignForm.role}
                onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5020] focus:outline-none focus:border-[#F4510B]"
              >
                <option value="Head Coach">Head Coach</option>
                <option value="Assistant Coach">Assistant Coach</option>
                <option value="Specialist / Drill Trainer">Specialist / Drill Trainer</option>
              </select>
            </div>

            <div className="pt-3 border-t border-[#172B5010] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAssignBatchModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-[#F8FAFC] border border-[#172B5020] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-black bg-[#F4510B] text-white hover:brightness-110 shadow-sm cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* 8. MODAL: VIEW COACH DETAILS                             */}
      {/* ======================================================== */}
      {viewDetailCoach && (
        <Modal
          isOpen={Boolean(viewDetailCoach)}
          onClose={() => setViewDetailCoach(null)}
          title={`Coach Profile: ${viewDetailCoach.name}`}
          subtitle="Supervisory Faculty Record"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 pb-3 border-b border-[#172B5010]">
              <img
                src={viewDetailCoach.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={viewDetailCoach.name}
                className="w-16 h-16 rounded-2xl object-cover border border-[#172B5015]"
              />
              <div>
                <h4 className="text-base font-black text-[#172B50]">{viewDetailCoach.name}</h4>
                <div className="text-xs text-[#F4510B] font-bold">{viewDetailCoach.role || 'Coach'}</div>
                <div className="text-xs text-[#172B50]/60 mt-0.5">{viewDetailCoach.center}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#172B5008]">
                <span className="text-[#172B50]/60">Specialization:</span>
                <strong className="text-[#172B50]">{viewDetailCoach.specialization}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[#172B5008]">
                <span className="text-[#172B50]/60">Experience:</span>
                <strong className="text-[#172B50]">{viewDetailCoach.experience || '4+ Years'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[#172B5008]">
                <span className="text-[#172B50]/60">Certifications:</span>
                <strong className="text-[#172B50]">{viewDetailCoach.certification || 'Certified Coach'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[#172B5008]">
                <span className="text-[#172B50]/60">Assigned Batches:</span>
                <strong className="text-[#172B50]">{viewDetailCoach.assignedBatchesList?.join(', ')}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[#172B5008]">
                <span className="text-[#172B50]/60">Attendance Rate:</span>
                <strong className="text-[#16A34A]">{viewDetailCoach.attendancePct}%</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[#172B5008]">
                <span className="text-[#172B50]/60">Faculty Rating:</span>
                <strong className="text-[#CA8A04]">{viewDetailCoach.ratingNum} ★</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#172B50]/60">Evaluation Status:</span>
                <strong>{viewDetailCoach.evaluationStatusDisplay}</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-[#172B5010] flex justify-end">
              <button
                type="button"
                onClick={() => setViewDetailCoach(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#172B50] text-white hover:bg-[#F4510B] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* 9. MODAL: VIEW ASSIGNED BATCHES                          */}
      {/* ======================================================== */}
      {viewBatchesCoach && (
        <Modal
          isOpen={Boolean(viewBatchesCoach)}
          onClose={() => setViewBatchesCoach(null)}
          title={`Assigned Batches: ${viewBatchesCoach.name}`}
          subtitle={`Coaching assignments across authorized locations`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-3">
            {scopedBatches
              .filter(
                (b) =>
                  b.coachId === viewBatchesCoach.id ||
                  b.coachName === viewBatchesCoach.name ||
                  b.coach2Id === viewBatchesCoach.id ||
                  b.coach2Name === viewBatchesCoach.name
              )
              .map((b) => (
                <div key={b.id} className="p-3 bg-[#FFFDF9] rounded-xl border border-[#172B5015] flex justify-between items-center">
                  <div>
                    <h5 className="font-black text-xs text-[#172B50]">{b.name}</h5>
                    <div className="text-[11px] text-[#172B50]/70">{b.program} • {b.center}</div>
                    <div className="text-[10px] text-[#172B50]/50 mt-0.5">{b.schedule}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#DCFCE7] text-[#15803D]">
                    {b.enrolledCount || 8} Athletes
                  </span>
                </div>
              ))}

            <div className="pt-3 border-t border-[#172B5010] flex justify-end">
              <button
                type="button"
                onClick={() => setViewBatchesCoach(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#172B50] text-white hover:bg-[#F4510B] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
