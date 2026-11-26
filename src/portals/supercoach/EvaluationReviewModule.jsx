import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  MapPin,
  Layers,
  Users,
  Calendar,
  CheckCircle2,
  RotateCcw,
  BarChart2,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  ExternalLink,
  Activity,
  Scale,
  Target,
  Zap,
  FileText,
  Save,
  Bell,
  ChevronDown,
  ChevronRight,
  Check,
  Plus,
  Award,
  User,
  Clock,
  AlertCircle,
  Sparkles,
  X,
  MessageSquare,
  Flag,
  FileCheck
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import { DynamicBadgeIcon } from '../../components/common/BadgeIllustrations';

export default function EvaluationReviewModule() {
  const {
    data,
    currentUser,
    currentPortal,
    submitEvaluation,
    updateEvaluation,
    approveEvaluation,
    returnEvaluation,
    bulkApproveEvaluations,
    reviewChildDevelopmentSubmission,
    childDevelopmentSubmissions,
    childJourneys,
    addToast
  } = useCrm();

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.badge === 'Super Admin' || currentPortal === 'admin';

  // Super Coach & Admin authorized locations
  const assignedLocations = useMemo(() => {
    if (isAdmin) {
      return (data.locations || []).map((l) => l.name || l.code);
    }
    return currentUser?.assignedLocations || ['KK NAGAR', 'KILPAUK', 'MAHALINGAPURAM'];
  }, [currentUser, isAdmin, data.locations]);

  const assignedLocationsNormalized = useMemo(() => {
    return assignedLocations.map((l) => (l || '').toLowerCase().trim());
  }, [assignedLocations]);

  const isLocationAuthorized = (locName) => {
    if (isAdmin) return true;
    if (!locName) return false;
    const norm = String(locName).toLowerCase().trim();
    return assignedLocationsNormalized.some(
      (al) => al === norm || norm.includes(al) || al.includes(norm)
    );
  };

  // State: Filters
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('Oct 1, 2026 – Dec 31, 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);

  // State: Tab selection
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'returned' | 'all'
  const [activeSubTab, setActiveSubTab] = useState('skills'); // 'skills' | 'notes' | 'comparison' | 'activity'

  // State: Selection & Multi-select
  const [selectedEvalId, setSelectedEvalId] = useState(null);
  const [selectedEvalIds, setSelectedEvalIds] = useState([]);

  // State: Editable fields
  const [editedRatings, setEditedRatings] = useState({
    balance: 4,
    jumping: 4,
    throwing: 5,
    running: 4,
  });
  const [reviewNotes, setReviewNotes] = useState('');

  // Modals
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  const [isNewEvalModalOpen, setIsNewEvalModalOpen] = useState(false);

  // Child Development Review State
  const [reviewMode, setReviewMode] = useState('child_dev'); // 'child_dev' | 'eval_scoring'
  const [devFilterStatus, setDevFilterStatus] = useState('all'); // 'all' | 'pending' | 'approved' | 'returned' | 'badges' | 'milestones'
  const [selectedDevSubmissionId, setSelectedDevSubmissionId] = useState(null);
  const [devReviewNotes, setDevReviewNotes] = useState('');
  const [isDevReturnModalOpen, setIsDevReturnModalOpen] = useState(false);
  const [devReturnReason, setDevReturnReason] = useState('');
  const [isDevRejectModalOpen, setIsDevRejectModalOpen] = useState(false);
  const [devRejectReason, setDevRejectReason] = useState('');

  // New Evaluation Form (for simulation/creation)
  const [newEvalForm, setNewEvalForm] = useState({
    studentId: '',
    coachName: 'Coach Sam',
    location: 'KK NAGAR',
    program: 'Foundational Movement',
    batch: 'LE - B1',
    category: 'Balance & Coordination',
    balance: 4,
    jumping: 4,
    throwing: 5,
    running: 4,
    coachObservation: 'Athlete showed great focus and improvement in balance and throwing skills. Highly cooperative in drills.'
  });

  // 1. DYNAMIC FILTER OPTIONS
  // Locations: All authorized locations
  const locationOptions = useMemo(() => {
    return assignedLocations;
  }, [assignedLocations]);

  // Programs: Cascaded from selected location
  const programOptions = useMemo(() => {
    if (selectedLocation === 'All') {
      const progs = new Set((data.programs || []).map(p => p.name));
      (data.classes || []).forEach(c => {
        if (c.program && isLocationAuthorized(c.center)) progs.add(c.program);
      });
      return Array.from(progs);
    }
    const progs = new Set();
    (data.classes || []).forEach(c => {
      const cCenter = (c.center || '').toLowerCase().trim();
      const selCenter = selectedLocation.toLowerCase().trim();
      if ((cCenter === selCenter || cCenter.includes(selCenter) || selCenter.includes(cCenter)) && c.program) {
        progs.add(c.program);
      }
    });
    if (progs.size === 0) {
      (data.programs || []).forEach(p => progs.add(p.name));
    }
    return Array.from(progs);
  }, [selectedLocation, data.classes, data.programs]);

  // Batches: Cascaded from selected location & program
  const batchOptions = useMemo(() => {
    const batches = new Set();
    (data.classes || []).forEach(c => {
      const cCenter = (c.center || '').toLowerCase().trim();
      const selCenter = selectedLocation.toLowerCase().trim();
      const locMatch = selectedLocation === 'All' ? isLocationAuthorized(c.center) : (cCenter === selCenter || cCenter.includes(selCenter) || selCenter.includes(cCenter));
      const progMatch = selectedProgram === 'All' || (c.program || '').toLowerCase().trim() === selectedProgram.toLowerCase().trim();

      if (locMatch && progMatch && c.name) {
        batches.add(c.name);
      }
    });
    return Array.from(batches);
  }, [selectedLocation, selectedProgram, data.classes]);

  // Reset filter when parent filter changes
  useEffect(() => {
    if (selectedProgram !== 'All' && !programOptions.includes(selectedProgram)) {
      setSelectedProgram('All');
    }
  }, [programOptions, selectedProgram]);

  useEffect(() => {
    if (selectedBatch !== 'All' && !batchOptions.includes(selectedBatch)) {
      setSelectedBatch('All');
    }
  }, [batchOptions, selectedBatch]);

  // 2. FILTER EVALUATIONS
  const allScopedEvaluations = useMemo(() => {
    return (data.evaluations || []).filter(ev => {
      if (!ev.location) return true;
      return isLocationAuthorized(ev.location);
    });
  }, [data.evaluations, assignedLocationsNormalized]);

  const filteredEvaluations = useMemo(() => {
    return allScopedEvaluations.filter(ev => {
      // Location
      if (selectedLocation !== 'All') {
        const normLoc = selectedLocation.toLowerCase().trim();
        const normEvLoc = (ev.location || '').toLowerCase().trim();
        if (normEvLoc !== normLoc && !normEvLoc.includes(normLoc) && !normLoc.includes(normEvLoc)) {
          return false;
        }
      }
      // Program
      if (selectedProgram !== 'All') {
        const normProg = selectedProgram.toLowerCase().trim();
        const normEvProg = (ev.program || '').toLowerCase().trim();
        if (normEvProg !== normProg && !normEvProg.includes(normProg) && !normProg.includes(normEvProg)) {
          return false;
        }
      }
      // Batch
      if (selectedBatch !== 'All') {
        const normBatch = selectedBatch.toLowerCase().trim();
        const normEvBatch = (ev.batch || '').toLowerCase().trim();
        if (normEvBatch !== normBatch && !normEvBatch.includes(normBatch) && !normBatch.includes(normEvBatch)) {
          return false;
        }
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (ev.studentName || '').toLowerCase().includes(q);
        const coachMatch = (ev.coachName || '').toLowerCase().includes(q);
        const idMatch = (ev.id || '').toLowerCase().includes(q);
        if (!nameMatch && !coachMatch && !idMatch) return false;
      }
      return true;
    });
  }, [allScopedEvaluations, selectedLocation, selectedProgram, selectedBatch, searchQuery]);

  // Tab Slices
  const pendingEvals = useMemo(() => filteredEvaluations.filter(e => e.status === 'Pending'), [filteredEvaluations]);
  const approvedEvals = useMemo(() => filteredEvaluations.filter(e => e.status === 'Approved'), [filteredEvaluations]);
  const returnedEvals = useMemo(() => filteredEvaluations.filter(e => e.status === 'Returned'), [filteredEvaluations]);

  // Active Tab evaluations
  const activeTabEvaluations = useMemo(() => {
    switch (activeTab) {
      case 'pending': return pendingEvals;
      case 'approved': return approvedEvals;
      case 'returned': return returnedEvals;
      case 'all': default: return filteredEvaluations;
    }
  }, [activeTab, pendingEvals, approvedEvals, returnedEvals, filteredEvaluations]);

  // 3. DYNAMIC KPI COUNTS
  const kpis = useMemo(() => {
    const total = filteredEvaluations.length;
    const pending = pendingEvals.length;
    const approved = approvedEvals.length;
    const returned = returnedEvals.length;

    const coachesSet = new Set(filteredEvaluations.map(e => e.coachId || e.coachName).filter(Boolean));
    const coachesSubmitted = coachesSet.size;

    let qualityPct = 0;
    if (total > 0) {
      const avgScore = filteredEvaluations.reduce((acc, e) => {
        const overall = Number(e.overallRating) || 4.2;
        return acc + overall;
      }, 0) / total;
      qualityPct = Math.round((avgScore / 5) * 100);
    }

    return {
      pending,
      approved,
      returned,
      coachesSubmitted,
      qualityPercentage: total > 0 ? `${qualityPct}%` : '— %'
    };
  }, [filteredEvaluations, pendingEvals, approvedEvals, returnedEvals]);

  // Scoped Child Development Submissions
  const scopedDevSubmissions = useMemo(() => {
    const list = childDevelopmentSubmissions || data.childDevelopmentSubmissions || [];
    return list.filter((sub) => {
      if (!isLocationAuthorized(sub.location)) return false;
      if (selectedLocation !== 'All') {
        const normLoc = selectedLocation.toLowerCase().trim();
        const subLoc = (sub.location || '').toLowerCase().trim();
        if (subLoc !== normLoc && !subLoc.includes(normLoc) && !normLoc.includes(subLoc)) {
          return false;
        }
      }
      if (selectedProgram !== 'All') {
        const normProg = selectedProgram.toLowerCase().trim();
        const subProg = (sub.program || '').toLowerCase().trim();
        if (subProg !== normProg && !subProg.includes(normProg) && !normProg.includes(subProg)) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const childMatch = (sub.childName || '').toLowerCase().includes(q);
        const coachMatch = (sub.coachName || '').toLowerCase().includes(q);
        const badgeMatch = (sub.badgeName || sub.milestoneTitle || '').toLowerCase().includes(q);
        if (!childMatch && !coachMatch && !badgeMatch) return false;
      }
      return true;
    });
  }, [childDevelopmentSubmissions, data.childDevelopmentSubmissions, selectedLocation, selectedProgram, searchQuery, assignedLocationsNormalized]);

  const filteredDevSubmissions = useMemo(() => {
    switch (devFilterStatus) {
      case 'pending':
        return scopedDevSubmissions.filter((s) => s.status === 'Pending Super Coach Review' || s.status === 'Pending');
      case 'approved':
        return scopedDevSubmissions.filter((s) => s.status === 'Approved & Published' || s.status === 'Approved');
      case 'returned':
        return scopedDevSubmissions.filter((s) => s.status === 'Returned for Correction' || s.status === 'Returned');
      case 'badges':
        return scopedDevSubmissions.filter((s) => s.type === 'badge');
      case 'milestones':
        return scopedDevSubmissions.filter((s) => s.type === 'milestone');
      case 'all':
      default:
        return scopedDevSubmissions;
    }
  }, [scopedDevSubmissions, devFilterStatus]);

  const devKpis = useMemo(() => {
    const total = scopedDevSubmissions.length;
    const pending = scopedDevSubmissions.filter((s) => s.status === 'Pending Super Coach Review' || s.status === 'Pending').length;
    const approved = scopedDevSubmissions.filter((s) => s.status === 'Approved & Published' || s.status === 'Approved').length;
    const returned = scopedDevSubmissions.filter((s) => s.status === 'Returned for Correction' || s.status === 'Returned').length;
    const badgesCount = scopedDevSubmissions.filter((s) => s.type === 'badge').length;
    const milestonesCount = scopedDevSubmissions.filter((s) => s.type === 'milestone').length;
    return { total, pending, approved, returned, badgesCount, milestonesCount };
  }, [scopedDevSubmissions]);

  const selectedDevSubmission = useMemo(() => {
    if (filteredDevSubmissions.length === 0) return null;
    return filteredDevSubmissions.find((s) => s.id === selectedDevSubmissionId) || filteredDevSubmissions[0];
  }, [filteredDevSubmissions, selectedDevSubmissionId]);

  // 4. SELECTED EVALUATION
  const selectedEval = useMemo(() => {
    if (activeTabEvaluations.length === 0) return null;
    return activeTabEvaluations.find(e => e.id === selectedEvalId) || activeTabEvaluations[0];
  }, [activeTabEvaluations, selectedEvalId]);

  // Sync edits when selectedEval changes
  useEffect(() => {
    if (selectedEval) {
      setEditedRatings({
        balance: selectedEval.skills?.balance?.superCoachRating || selectedEval.skills?.balance?.coachRating || 4,
        jumping: selectedEval.skills?.jumping?.superCoachRating || selectedEval.skills?.jumping?.coachRating || 4,
        throwing: selectedEval.skills?.throwing?.superCoachRating || selectedEval.skills?.throwing?.coachRating || 5,
        running: selectedEval.skills?.running?.superCoachRating || selectedEval.skills?.running?.coachRating || 4,
      });
      setReviewNotes(selectedEval.superCoachNotes || '');
    } else {
      setEditedRatings({ balance: 4, jumping: 4, throwing: 5, running: 4 });
      setReviewNotes('');
    }
  }, [selectedEval]);

  // Calculated overall score
  const liveOverallProgress = useMemo(() => {
    const b = Number(editedRatings.balance) || 4;
    const j = Number(editedRatings.jumping) || 4;
    const t = Number(editedRatings.throwing) || 5;
    const r = Number(editedRatings.running) || 4;
    const avg = ((b + j + t + r) / 4).toFixed(1);
    const pct = Math.round((avg / 5) * 100);
    return { avg, pct };
  }, [editedRatings]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedLocation('All');
    setSelectedProgram('All');
    setSelectedBatch('All');
    setSelectedDateRange('Oct 1, 2026 – Dec 31, 2026');
    setSearchQuery('');
    setSelectedEvalIds([]);
    addToast('Filters reset to All Locations', 'info');
  };

  // Bulk Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEvalIds(activeTabEvaluations.map(ev => ev.id));
    } else {
      setSelectedEvalIds([]);
    }
  };

  const handleToggleSelectOne = (id, e) => {
    e.stopPropagation();
    setSelectedEvalIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Actions
  const handleSaveChanges = () => {
    if (!selectedEval) return;
    updateEvaluation(selectedEval.id, {
      skills: {
        balance: {
          ...(selectedEval.skills?.balance || { name: 'Balance', description: 'Body control & stability', coachRating: 4, previousRating: 3, progress: '+20%' }),
          superCoachRating: Number(editedRatings.balance)
        },
        jumping: {
          ...(selectedEval.skills?.jumping || { name: 'Jumping & Landing', description: 'Power & safe landing', coachRating: 4, previousRating: 3, progress: '+20%' }),
          superCoachRating: Number(editedRatings.jumping)
        },
        throwing: {
          ...(selectedEval.skills?.throwing || { name: 'Throwing & Catching', description: 'Focus, timing & hand-eye', coachRating: 5, previousRating: 4, progress: '+20%' }),
          superCoachRating: Number(editedRatings.throwing)
        },
        running: {
          ...(selectedEval.skills?.running || { name: 'Running', description: 'Speed, agility & movement', coachRating: 4, previousRating: 3, progress: '+20%' }),
          superCoachRating: Number(editedRatings.running)
        },
      },
      overallRating: liveOverallProgress.avg,
      superCoachNotes: reviewNotes
    });
  };

  const handleConfirmReturn = () => {
    if (!selectedEval) return;
    if (!returnReason.trim()) {
      addToast('Please provide a correction reason for the coach.', 'error');
      return;
    }
    returnEvaluation(selectedEval.id, returnReason, reviewNotes);
    setIsReturnModalOpen(false);
    setReturnReason('');
  };

  const handleConfirmApprove = () => {
    if (!selectedEval) return;
    approveEvaluation(selectedEval.id, reviewNotes);
    setIsApproveConfirmOpen(false);
  };

  const handleBulkApprove = () => {
    if (selectedEvalIds.length === 0) return;
    bulkApproveEvaluations(selectedEvalIds);
    setSelectedEvalIds([]);
  };

  // Create Evaluation Simulation
  const handleCreateNewEval = (e) => {
    e.preventDefault();
    const student = (data.students || []).find(s => s.id === newEvalForm.studentId) || {
      id: `STU-${Math.floor(100 + Math.random() * 900)}`,
      name: 'Priya S',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80',
      age: 5
    };

    submitEvaluation({
      studentId: student.id,
      studentName: student.name,
      studentAvatar: student.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80',
      age: student.age || 5,
      location: newEvalForm.location,
      program: newEvalForm.program,
      batch: newEvalForm.batch,
      category: newEvalForm.category,
      coachName: newEvalForm.coachName,
      coachAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      status: 'Pending',
      skills: {
        balance: { name: 'Balance', description: 'Body control & stability', coachRating: Number(newEvalForm.balance), superCoachRating: Number(newEvalForm.balance), previousRating: 3, progress: '+20%' },
        jumping: { name: 'Jumping & Landing', description: 'Power & safe landing', coachRating: Number(newEvalForm.jumping), superCoachRating: Number(newEvalForm.jumping), previousRating: 3, progress: '+20%' },
        throwing: { name: 'Throwing & Catching', description: 'Focus, timing & hand-eye', coachRating: Number(newEvalForm.throwing), superCoachRating: Number(newEvalForm.throwing), previousRating: 4, progress: '+20%' },
        running: { name: 'Running', description: 'Speed, agility & movement', coachRating: Number(newEvalForm.running), superCoachRating: Number(newEvalForm.running), previousRating: 3, progress: '+20%' },
      },
      overallRating: ((Number(newEvalForm.balance) + Number(newEvalForm.jumping) + Number(newEvalForm.throwing) + Number(newEvalForm.running)) / 4).toFixed(1),
      coachObservation: newEvalForm.coachObservation,
      superCoachNotes: ''
    });

    setIsNewEvalModalOpen(false);
  };

  // Child Development Actions
  const handleApproveDevSubmission = (sub) => {
    if (!sub) return;
    reviewChildDevelopmentSubmission(
      sub.id,
      'Approved',
      devReviewNotes || 'Verified and approved by Super Coach. Published to Parent Portal.'
    );
    addToast(`Approved "${sub.badgeName || sub.milestoneTitle}" for ${sub.childName}! Published to Parent Portal.`, 'success');
    setDevReviewNotes('');
  };

  const handleConfirmDevReturn = () => {
    if (!selectedDevSubmission) return;
    if (!devReturnReason.trim()) {
      addToast('Please provide a reason for return.', 'error');
      return;
    }
    reviewChildDevelopmentSubmission(selectedDevSubmission.id, 'Returned', devReturnReason);
    addToast(`Returned submission to ${selectedDevSubmission.coachName} for correction.`, 'info');
    setIsDevReturnModalOpen(false);
    setDevReturnReason('');
  };

  const handleConfirmDevReject = () => {
    if (!selectedDevSubmission) return;
    if (!devRejectReason.trim()) {
      addToast('Please provide a rejection reason.', 'error');
      return;
    }
    reviewChildDevelopmentSubmission(selectedDevSubmission.id, 'Rejected', devRejectReason);
    addToast(`Rejected submission for ${selectedDevSubmission.childName}.`, 'error');
    setIsDevRejectModalOpen(false);
    setDevRejectReason('');
  };

  return (
    <div className="space-y-5 animate-slide-up pb-8">
      
      {/* ============================================================ */}
      {/* 1. HEADER (Exact match with reference screenshot)            */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {/* Left: Heading & Subtitle */}
        <div className="text-left space-y-0.5">
          <div className="text-[10px] font-black uppercase text-[#172B50]/60 tracking-wider">
            SUPER COACH PORTAL
          </div>
          <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-black text-[#172B50] tracking-tight flex items-center gap-2">
            <span>Evaluation Review</span>
            <span className="w-7 h-7 rounded-lg bg-[#FFF0E6] flex items-center justify-center text-[#F4510B] border border-[#F4510B]/30">
              <ShieldCheck className="w-4 h-4 text-[#F4510B]" />
            </span>
          </h1>
          <p className="text-xs sm:text-[13px] font-bold text-[#172B50]/65 tracking-tight text-left">
            Review, verify and ensure quality learning for every Little Spartan.
          </p>
        </div>

        {/* Right: Location selector, Notification, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-center shrink-0">
          
          {/* Quick Simulation Button (for reviewers to add sample evaluation) */}
          <button
            type="button"
            onClick={() => setIsNewEvalModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF4E8] border border-[#F4510B]/30 text-xs font-bold text-[#F4510B] hover:bg-[#F4510B] hover:text-white transition-all cursor-pointer shadow-2xs"
            title="Simulate Coach Submission"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Simulate Submission</span>
          </button>

          {/* Location Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#172B50]/15 shadow-2xs hover:bg-[#FFF4E8] text-xs font-bold text-[#172B50] transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
              <span>{selectedLocation === 'All' ? 'All Locations' : selectedLocation}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/60" />
            </button>
            {isLocationMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocation('All');
                    setIsLocationMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                    selectedLocation === 'All' ? 'font-black text-[#F4510B] bg-[#FFF8F2]' : 'font-bold text-[#172B50] hover:bg-[#FFF4E8]'
                  }`}
                >
                  All Locations
                </button>
                {locationOptions.map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setIsLocationMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                      selectedLocation === loc ? 'font-black text-[#F4510B] bg-[#FFF8F2]' : 'font-bold text-[#172B50] hover:bg-[#FFF4E8]'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Button */}
          <button
            type="button"
            onClick={() => addToast('Review notifications active', 'info')}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B50]/15 shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] transition-all cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#172B50]" />
            <span className="w-2 h-2 rounded-full bg-[#F4510B] absolute top-2 right-2 ring-1 ring-white" />
          </button>

          {/* Profile Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#172B50]/15 shadow-2xs">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
              alt="Anita R."
              className="w-7 h-7 rounded-full object-cover ring-1 ring-[#F4510B]/30"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-black text-[#172B50] leading-tight">Anita R.</div>
              <div className="text-[10px] text-gray-500 font-semibold leading-tight">Super Coach</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Mode Switcher: Child Development & Badges VS Evaluation Scoring */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-xl">
          <button
            type="button"
            onClick={() => setReviewMode('child_dev')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              reviewMode === 'child_dev'
                ? 'bg-[#172B50] text-white shadow-xs'
                : 'text-[#172B50]/70 hover:text-[#172B50]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#F4510B]" />
            <span>Child Development & Badges</span>
            {devKpis.pending > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[#F4510B] text-white font-black animate-pulse">
                {devKpis.pending}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setReviewMode('eval_scoring')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              reviewMode === 'eval_scoring'
                ? 'bg-[#172B50] text-white shadow-xs'
                : 'text-[#172B50]/70 hover:text-[#172B50]'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-emerald-500" />
            <span>Evaluation Scoring Reviews</span>
            {kpis.pending > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500 text-white font-black">
                {kpis.pending}
              </span>
            )}
          </button>
        </div>

        <div className="text-right text-xs font-bold text-gray-500 px-3 hidden lg:block">
          {reviewMode === 'child_dev' ? (
            <span className="flex items-center gap-1.5 text-[#F4510B]">
              <ShieldCheck className="w-4 h-4" />
              <span>Verifying Coach Submissions & Pathway Badges</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Reviewing Quarterly Assessment Scores</span>
            </span>
          )}
        </div>
      </div>

      {reviewMode === 'child_dev' ? (
        <div className="space-y-5">
          {/* KPI Cards for Child Dev */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#F4510B] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#F4510B]" />
              </div>
              <div>
                <div className="text-2xl font-black text-[#172B50] leading-none">{devKpis.pending}</div>
                <div className="text-xs font-bold text-[#172B50]/70 mt-1">Pending Verification</div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-black text-[#172B50] leading-none">{devKpis.badgesCount}</div>
                <div className="text-xs font-bold text-[#172B50]/70 mt-1">Skill Badges</div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Flag className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-black text-[#172B50] leading-none">{devKpis.milestonesCount}</div>
                <div className="text-xs font-bold text-[#172B50]/70 mt-1">Milestones</div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-black text-[#172B50] leading-none">{devKpis.approved}</div>
                <div className="text-xs font-bold text-[#172B50]/70 mt-1">Approved & Published</div>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { key: 'all', label: `All Submissions (${devKpis.total})`, icon: Layers },
              { key: 'pending', label: `Pending Review (${devKpis.pending})`, icon: Clock },
              { key: 'badges', label: `Skill Badges (${devKpis.badgesCount})`, icon: Award },
              { key: 'milestones', label: `Milestones (${devKpis.milestonesCount})`, icon: Flag },
              { key: 'approved', label: `Approved (${devKpis.approved})`, icon: CheckCircle2 },
              { key: 'returned', label: `Returned (${devKpis.returned})`, icon: RotateCcw },
            ].map(pill => {
              const Icon = pill.icon;
              const isActive = devFilterStatus === pill.key;
              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setDevFilterStatus(pill.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#F4510B] text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-[#172B50] hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>

          {/* 2-Column Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Submissions Queue */}
            <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-black text-[#172B50]">Submissions Queue</h3>
                  <p className="text-[11px] text-gray-500 font-bold">Showing {filteredDevSubmissions.length} records</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#F4510B] bg-[#FFF0E6] px-2.5 py-1 rounded-full">
                  Live Queue
                </span>
              </div>

              <div className="mt-3 space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {filteredDevSubmissions.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs font-bold">No submissions match the current filter.</p>
                  </div>
                ) : (
                  filteredDevSubmissions.map(sub => {
                    const isSelected = selectedDevSubmission?.id === sub.id;
                    const isPending = sub.status === 'Pending Super Coach Review' || sub.status === 'Pending';
                    const isApproved = sub.status === 'Approved & Published' || sub.status === 'Approved';
                    const isReturned = sub.status === 'Returned for Correction' || sub.status === 'Returned';

                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedDevSubmissionId(sub.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'border-[#F4510B] bg-[#FFF8F2]/70 shadow-xs ring-1 ring-[#F4510B]/30'
                            : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            sub.type === 'badge' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                          }`}>
                            {sub.type === 'badge' ? 'Skill Badge' : 'Milestone'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPending
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : isApproved
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isReturned
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {sub.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 shadow-2xs overflow-hidden">
                            {sub.type === 'badge' ? (
                              <DynamicBadgeIcon iconKey={sub.iconKey || sub.badgeId} size="w-10 h-10" />
                            ) : (
                              <Flag className="w-6 h-6 text-purple-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black text-[#172B50] truncate">
                              {sub.badgeName || sub.milestoneTitle}
                            </h4>
                            <div className="text-[11px] font-bold text-gray-600 truncate mt-0.5">
                              {sub.childName} • Age {sub.childAge} • {sub.program}
                            </div>
                            <div className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">
                              Coach {sub.coachName} • {sub.location} • {sub.submissionDate}
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-[#F4510B] translate-x-0.5' : 'text-gray-300'}`} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Detailed Review Workspace */}
            <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl p-5 shadow-2xs text-left">
              {!selectedDevSubmission ? (
                <div className="py-20 text-center text-gray-400">
                  <Sparkles className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-bold">Select a submission from the queue to verify details.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Header Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#FFF4E8] to-white border border-[#F4510B]/20">
                    <div className="flex items-center gap-3.5">
                      <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-xs border border-gray-100 flex items-center justify-center shrink-0">
                        {selectedDevSubmission.type === 'badge' ? (
                          <DynamicBadgeIcon iconKey={selectedDevSubmission.iconKey || selectedDevSubmission.badgeId} size="w-13 h-13" />
                        ) : (
                          <Flag className="w-8 h-8 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            selectedDevSubmission.type === 'badge' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {selectedDevSubmission.type === 'badge' ? 'Skill Badge Submission' : 'Major Milestone Submission'}
                          </span>
                          <span className="text-[11px] font-bold text-gray-500">
                            {selectedDevSubmission.category}
                          </span>
                        </div>
                        <h2 className="text-lg font-black text-[#172B50] mt-0.5">
                          {selectedDevSubmission.badgeName || selectedDevSubmission.milestoneTitle}
                        </h2>
                        <div className="text-xs font-bold text-[#F4510B]">
                          Child: {selectedDevSubmission.childName} (Age {selectedDevSubmission.childAge}) • {selectedDevSubmission.program} ({selectedDevSubmission.batch})
                        </div>
                      </div>
                    </div>

                    <div className="self-start sm:self-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black ${
                        selectedDevSubmission.status === 'Pending Super Coach Review' || selectedDevSubmission.status === 'Pending'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : selectedDevSubmission.status === 'Approved & Published' || selectedDevSubmission.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : selectedDevSubmission.status === 'Returned for Correction' || selectedDevSubmission.status === 'Returned'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-current" />
                        <span>{selectedDevSubmission.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Submission Context Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Submitting Coach</div>
                      <div className="font-black text-[#172B50] mt-0.5">Coach {selectedDevSubmission.coachName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Location</div>
                      <div className="font-black text-[#172B50] mt-0.5">{selectedDevSubmission.location}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Date Submitted</div>
                      <div className="font-black text-[#172B50] mt-0.5">{selectedDevSubmission.submissionDate}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Child ID</div>
                      <div className="font-black text-[#172B50] mt-0.5">{selectedDevSubmission.childId}</div>
                    </div>
                  </div>

                  {/* What the child demonstrated (Criteria checklist) */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-[#172B50] uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Skill Criteria & Evidence Checklist</span>
                    </h3>
                    <div className="bg-[#FFFDF9] border border-orange-100 rounded-xl p-3.5 space-y-2">
                      {(selectedDevSubmission.criteriaChecklist || [
                        { label: 'Demonstrated complete skill repetition without coach assistance', passed: true },
                        { label: 'Exhibited proper landing mechanics and stability', passed: true },
                        { label: 'Showed encouragement and teamwork with peers', passed: true }
                      ]).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-[#172B50]">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                          <span className="font-bold leading-relaxed">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coach's Observation Notes & Drill Context */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-[#172B50] uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#F4510B]" />
                      <span>Coach's Observation & Drill Context</span>
                    </h3>
                    <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3.5 text-xs text-[#172B50] space-y-1.5">
                      <p className="font-medium leading-relaxed italic text-gray-700">
                        "{selectedDevSubmission.coachNotes || 'Athlete showed outstanding progress during today\'s session.'}"
                      </p>
                      {selectedDevSubmission.evidence && (
                        <div className="pt-2 border-t border-gray-200/60 text-[11px] text-gray-500 font-semibold">
                          <strong className="text-gray-700">Evidence Record:</strong> {selectedDevSubmission.evidence}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Super Coach Action Center */}
                  <div className="pt-2 border-t border-gray-100 space-y-3">
                    <h3 className="text-xs font-black text-[#172B50] uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#F4510B]" />
                      <span>Super Coach Verification Decision</span>
                    </h3>

                    {selectedDevSubmission.status === 'Approved & Published' || selectedDevSubmission.status === 'Approved' ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-black text-sm">Verified & Published to Parent Portal</div>
                          <div className="font-semibold text-emerald-800 mt-0.5">
                            This badge is live on {selectedDevSubmission.childName}'s development journey trail and reflected in parent KPI statistics.
                          </div>
                        </div>
                      </div>
                    ) : selectedDevSubmission.status === 'Returned for Correction' || selectedDevSubmission.status === 'Returned' ? (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-900">
                        <RotateCcw className="w-6 h-6 text-rose-600 shrink-0" />
                        <div>
                          <div className="font-black text-sm">Returned for Coach Correction</div>
                          <div className="font-semibold text-rose-800 mt-0.5">
                            Feedback sent to Coach {selectedDevSubmission.coachName}. Awaiting updated session drill record.
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 block mb-1">
                            Super Coach Verification Notes / Parent Message (Optional)
                          </label>
                          <textarea
                            value={devReviewNotes}
                            onChange={(e) => setDevReviewNotes(e.target.value)}
                            rows={2}
                            placeholder="Add encouraging feedback or official verification notes (will be published to Parent Portal)..."
                            className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-[#F4510B] resize-none"
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsDevReturnModalOpen(true)}
                              className="px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Return for Correction</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsDevRejectModalOpen(true)}
                              className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleApproveDevSubmission(selectedDevSubmission)}
                            className="px-5 py-2.5 text-xs font-black text-white bg-[#F4510B] hover:bg-[#e04505] rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve & Publish to Parent Portal</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Audit Trail History */}
                  <div className="pt-2 border-t border-gray-100">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">
                      Submission Audit History
                    </h4>
                    <div className="space-y-1.5">
                      {(selectedDevSubmission.auditTrail || [
                        { action: 'Submitted for Review', performer: `Coach ${selectedDevSubmission.coachName}`, timestamp: selectedDevSubmission.submissionDate }
                      ]).map((audit, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] py-1 px-2.5 rounded-lg bg-gray-50 text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F4510B]" />
                            <span className="font-bold text-[#172B50]">{audit.action}</span>
                            <span className="text-gray-400 font-semibold">• by {audit.performer}</span>
                          </div>
                          <span className="text-gray-400 font-semibold">{audit.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <>
      {/* ============================================================ */}
      {/* 2. FIVE COMPACT KPI CARDS                                    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
        
        {/* KPI 1: Pending Review */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#F4510B] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-[#F4510B]" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#172B50] leading-none tracking-tight">
              {kpis.pending}
            </div>
            <div className="text-xs font-bold text-[#172B50]/70 mt-1 whitespace-nowrap">
              Pending Review
            </div>
          </div>
        </div>

        {/* KPI 2: Approved */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#172B50] leading-none tracking-tight">
              {kpis.approved}
            </div>
            <div className="text-xs font-bold text-[#172B50]/70 mt-1 whitespace-nowrap">
              Approved
            </div>
          </div>
        </div>

        {/* KPI 3: Returned to Coach */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#F4510B] flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 text-[#F4510B]" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#172B50] leading-none tracking-tight">
              {kpis.returned}
            </div>
            <div className="text-xs font-bold text-[#172B50]/70 mt-1 whitespace-nowrap">
              Returned to Coach
            </div>
          </div>
        </div>

        {/* KPI 4: Coaches Submitted */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#172B50] leading-none tracking-tight">
              {kpis.coachesSubmitted}
            </div>
            <div className="text-xs font-bold text-[#172B50]/70 mt-1 whitespace-nowrap">
              Coaches Submitted
            </div>
          </div>
        </div>

        {/* KPI 5: Evaluation Quality */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs hover:shadow-xs transition-shadow col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5 text-[#10B981]" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#172B50] leading-none tracking-tight">
              {kpis.qualityPercentage}
            </div>
            <div className="text-[11px] font-bold text-[#172B50]/70 mt-0.5 leading-tight">
              Evaluation Quality <br className="hidden lg:inline" />
              <span className="text-[10px] text-[#172B50]/50 font-semibold">(This Quarter)</span>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. LOCATION & BATCH FILTERS BAR (Cascaded Hierarchy)         */}
      {/* ============================================================ */}
      <div className="bg-white border border-gray-100 rounded-2xl p-3 sm:p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          
          {/* Filter 1: Location */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold text-[#172B50]/70 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
              <span>Location</span>
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold text-[#172B50] bg-white border border-gray-200 rounded-xl outline-none focus:border-[#F4510B] cursor-pointer"
            >
              <option value="All">All Locations</option>
              {locationOptions.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Filter 2: Program (Cascaded) */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold text-[#172B50]/70 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#F4510B]" />
              <span>Program</span>
            </label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold text-[#172B50] bg-white border border-gray-200 rounded-xl outline-none focus:border-[#F4510B] cursor-pointer"
            >
              <option value="All">All Programs</option>
              {programOptions.map(prog => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>
          </div>

          {/* Filter 3: Batch (Cascaded) */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold text-[#172B50]/70 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#F4510B]" />
              <span>Batch</span>
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold text-[#172B50] bg-white border border-gray-200 rounded-xl outline-none focus:border-[#F4510B] cursor-pointer"
            >
              <option value="All">All Batches</option>
              {batchOptions.map(batch => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </div>

          {/* Filter 4: Date Range */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold text-[#172B50]/70 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#F4510B]" />
              <span>Date Range</span>
            </label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold text-[#172B50] bg-white border border-gray-200 rounded-xl outline-none focus:border-[#F4510B] cursor-pointer"
            >
              <option value="Oct 1, 2026 – Dec 31, 2026">Oct 1, 2026 – Dec 31, 2026</option>
              <option value="This Month">This Month (Nov 2026)</option>
              <option value="All Time">All Time</option>
            </select>
          </div>

          {/* Filter 5: Reset Action */}
          <div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full px-3 py-2 text-xs font-bold text-[#172B50] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#172B50]/70" />
              <span>Reset</span>
            </button>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. EVALUATION TABS (Pending, Approved, Returned, All)         */}
      {/* ============================================================ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        
        {/* Tab 1: Pending Reviews */}
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'pending'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-[#172B50] hover:bg-gray-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Pending Reviews ({kpis.pending})</span>
        </button>

        {/* Tab 2: Approved */}
        <button
          type="button"
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'approved'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-[#172B50] hover:bg-gray-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Approved ({kpis.approved})</span>
        </button>

        {/* Tab 3: Returned */}
        <button
          type="button"
          onClick={() => setActiveTab('returned')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'returned'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-[#172B50] hover:bg-gray-50'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Returned ({kpis.returned})</span>
        </button>

        {/* Tab 4: All Evaluations */}
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'all'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-[#172B50] hover:bg-gray-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Evaluations ({filteredEvaluations.length})</span>
        </button>

      </div>

      {/* ============================================================ */}
      {/* 5. MAIN CONTENT: TWO COLUMN LAYOUT                           */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: PENDING EVALUATIONS LIST                    */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-4 shadow-2xs flex flex-col justify-between min-h-[560px]">
          <div>
            
            {/* Header: Title + Search & Filter icons */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 gap-2">
              <h2 className="text-base font-black text-[#172B50] capitalize">
                {activeTab === 'pending' ? 'Pending Evaluations' : activeTab === 'approved' ? 'Approved Evaluations' : activeTab === 'returned' ? 'Returned Evaluations' : 'All Evaluations'}
              </h2>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-[#FFF4E8] text-[#172B50] flex items-center justify-center transition-colors cursor-pointer"
                  title="Search evaluations"
                >
                  <Search className="w-4 h-4 text-[#172B50]" />
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-[#FFF4E8] text-[#172B50] flex items-center justify-center transition-colors cursor-pointer"
                  title="Filter options"
                >
                  <Filter className="w-4 h-4 text-[#172B50]" />
                </button>
              </div>
            </div>

            {/* Expandable Search Input */}
            {isSearchOpen && (
              <div className="pt-2 pb-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by child, coach, or ID..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#F4510B]"
                    autoFocus
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Active Filter Chips Pill */}
            {(selectedLocation !== 'All' || selectedProgram !== 'All' || selectedBatch !== 'All') && (
              <div className="my-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FFF4E8] border border-[#F4510B]/20 text-[11px] font-bold text-[#172B50]">
                <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                <span>{selectedLocation}</span>
                {selectedProgram !== 'All' && <span>| {selectedProgram}</span>}
                {selectedBatch !== 'All' && <span>| {selectedBatch}</span>}
              </div>
            )}

            {/* Evaluations List */}
            <div className="space-y-2 mt-2 max-h-[460px] overflow-y-auto pr-1">
              {activeTabEvaluations.length === 0 ? (
                <div className="py-14 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#F4510B] flex items-center justify-center mx-auto shadow-2xs">
                    <Award className="w-6 h-6 text-[#F4510B]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#172B50]">
                      {activeTab === 'pending'
                        ? 'No pending evaluations.'
                        : activeTab === 'approved'
                        ? 'No approved evaluations.'
                        : activeTab === 'returned'
                        ? 'No returned evaluations.'
                        : 'No evaluations found.'}
                    </h3>
                    <p className="text-xs text-[#172B50]/60 mt-1 max-w-[240px] mx-auto">
                      {selectedLocation !== 'All' || selectedBatch !== 'All'
                        ? 'No coach submissions matching this filter.'
                        : 'Coach assessments submitted for athletes will appear here.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNewEvalModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFF4E8] border border-[#F4510B]/30 text-xs font-bold text-[#F4510B] hover:bg-[#F4510B] hover:text-white transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Sample Evaluation</span>
                  </button>
                </div>
              ) : (
                activeTabEvaluations.map((ev) => {
                  const isSelected = selectedEval?.id === ev.id;
                  const isChecked = selectedEvalIds.includes(ev.id);

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvalId(ev.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-left ${
                        isSelected
                          ? 'border-[#F4510B] bg-[#FFF8F2] shadow-2xs ring-1 ring-[#F4510B]/20'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      {/* Left: Checkbox + Avatar + Child info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleToggleSelectOne(ev.id, e)}
                          className="w-4 h-4 rounded text-[#F4510B] focus:ring-[#F4510B] cursor-pointer"
                        />
                        <img
                          src={ev.studentAvatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80'}
                          alt={ev.studentName}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-black text-[#172B50] truncate">
                            {ev.studentName}
                          </h4>
                          <p className="text-[11px] text-[#172B50]/65">
                            Age: {ev.age || 5}
                          </p>
                          <span className="inline-block text-[10px] font-bold text-[#F4510B] truncate max-w-[140px]">
                            {ev.category || ev.program}
                          </span>
                        </div>
                      </div>

                      {/* Right: Submitter + Timestamp + Status Pill */}
                      <div className="text-right shrink-0 space-y-1">
                        <div>
                          <div className="text-[10px] text-gray-400 font-semibold leading-tight">Submitted by</div>
                          <div className="text-[11px] font-bold text-[#172B50] leading-tight truncate max-w-[100px]">
                            {ev.coachName}
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium">
                          {ev.submittedAt}
                        </div>
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              ev.status === 'Pending'
                                ? 'bg-[#FFF0E6] text-[#F4510B] border-[#F4510B]/30'
                                : ev.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {ev.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Bottom Bar: Select All + Bulk Action */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-[#172B50]">
              <input
                type="checkbox"
                checked={activeTabEvaluations.length > 0 && selectedEvalIds.length === activeTabEvaluations.length}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded text-[#F4510B] focus:ring-[#F4510B]"
              />
              <span>Select All</span>
            </label>

            <span className="text-[11px] font-bold text-[#172B50]/60">
              {selectedEvalIds.length} Selected
            </span>

            <button
              type="button"
              disabled={selectedEvalIds.length === 0 || activeTab !== 'pending'}
              onClick={handleBulkApprove}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs ${
                selectedEvalIds.length > 0 && activeTab === 'pending'
                  ? 'bg-[#172B50] text-white hover:bg-[#F4510B] cursor-pointer shadow-2xs'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Bulk Approve</span>
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: EVALUATION REVIEW PANEL                    */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl p-5 shadow-2xs space-y-4 text-left">
          
          {!selectedEval ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF0E6] text-[#F4510B] flex items-center justify-center mx-auto shadow-2xs">
                <FileText className="w-7 h-7 text-[#F4510B]" />
              </div>
              <h3 className="text-base font-black text-[#172B50]">
                Select a child to review their evaluation
              </h3>
              <p className="text-xs text-[#172B50]/60 max-w-sm mx-auto">
                Choose an athlete assessment from the left list to review coach ratings, adjust Super Coach evaluations, and publish to the Parent Portal.
              </p>
            </div>
          ) : (
            <>
              {/* Header: Title + ID */}
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black text-[#172B50]">
                  Evaluation Review
                </h3>
                <div className="text-xs font-bold text-[#172B50]/60 flex items-center gap-1">
                  <span>Evaluation ID: <strong className="font-mono text-[#172B50]">{selectedEval.id}</strong></span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              {/* Child Profile Summary Box */}
              <div className="bg-[#FFFDFB] border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Left: Child Details */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedEval.studentAvatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80'}
                    alt={selectedEval.studentName}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-[#F4510B]/30 shrink-0"
                  />
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-[#172B50] leading-tight">
                      {selectedEval.studentName}
                    </h2>
                    <div className="text-xs text-[#172B50]/70 mt-1 space-x-1.5 flex flex-wrap gap-y-0.5">
                      <span>Age: <strong>{selectedEval.age || 5}</strong></span>
                      <span>•</span>
                      <span>Location: <strong>{selectedEval.location}</strong></span>
                    </div>
                    <div className="text-[11px] text-[#172B50]/60 mt-0.5">
                      Program: <strong>{selectedEval.program}</strong> • Batch: <strong>{selectedEval.batch}</strong>
                    </div>
                  </div>
                </div>

                {/* Right: Submitting Coach Box */}
                <div className="bg-white border border-gray-200/80 rounded-xl p-2.5 flex items-center gap-2.5 shrink-0 shadow-2xs">
                  <img
                    src={selectedEval.coachAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'}
                    alt={selectedEval.coachName}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200"
                  />
                  <div className="text-left">
                    <div className="text-[10px] text-gray-400 font-semibold leading-tight">Submitted by:</div>
                    <div className="text-xs font-bold text-[#172B50] leading-tight">{selectedEval.coachName}</div>
                    <div className="text-[10px] text-gray-500 font-medium">{selectedEval.submittedAt}</div>
                  </div>
                </div>

              </div>

              {/* 4 Sub-Tabs */}
              <div className="flex items-center gap-1 sm:gap-2 border-b border-gray-100 pb-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('skills')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    activeSubTab === 'skills'
                      ? 'bg-[#F4510B] text-white shadow-xs'
                      : 'text-[#172B50]/70 hover:text-[#172B50] hover:bg-gray-50'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Skill Evaluation</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('notes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    activeSubTab === 'notes'
                      ? 'bg-[#F4510B] text-white shadow-xs'
                      : 'text-[#172B50]/70 hover:text-[#172B50] hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Coach Notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('comparison')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    activeSubTab === 'comparison'
                      ? 'bg-[#F4510B] text-white shadow-xs'
                      : 'text-[#172B50]/70 hover:text-[#172B50] hover:bg-gray-50'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Progress Comparison</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('activity')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    activeSubTab === 'activity'
                      ? 'bg-[#F4510B] text-white shadow-xs'
                      : 'text-[#172B50]/70 hover:text-[#172B50] hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Activity Details</span>
                </button>
              </div>

              {/* Sub-Tab 1: Skill Evaluation */}
              {activeSubTab === 'skills' && (
                <div className="space-y-4">
                  
                  {/* Table & Overall Gauge */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Left: Skills Table (col 8) */}
                    <div className="md:col-span-8 overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 text-[10.5px] font-bold text-[#172B50]/60 uppercase">
                            <th className="pb-2">Skill Area</th>
                            <th className="pb-2 text-center">Coach Rating</th>
                            <th className="pb-2 text-center">Your Rating (Edit)</th>
                            <th className="pb-2 text-center">Previous Rating</th>
                            <th className="pb-2 text-center">Progress</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          
                          {/* Row 1: Balance */}
                          <tr>
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                                <div>
                                  <div className="font-bold text-[#172B50]">Balance</div>
                                  <div className="text-[10px] text-[#172B50]/55">Body control & stability</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 text-center font-bold text-[#172B50]">
                              {selectedEval.skills?.balance?.coachRating || 4} / 5
                            </td>
                            <td className="py-2.5 text-center">
                              <select
                                value={editedRatings.balance}
                                onChange={(e) => setEditedRatings({ ...editedRatings, balance: Number(e.target.value) })}
                                className="px-2 py-1 text-xs font-bold text-[#172B50] bg-white border border-gray-200 rounded-lg outline-none focus:border-[#F4510B] cursor-pointer"
                              >
                                {[1, 2, 3, 4, 5].map(v => (
                                  <option key={v} value={v}>{v} / 5</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2.5 text-center font-bold text-gray-400">
                              {selectedEval.skills?.balance?.previousRating || 3} / 5
                            </td>
                            <td className="py-2.5 text-center font-bold text-emerald-600">
                              {selectedEval.skills?.balance?.progress || '↑ +20%'}
                            </td>
                          </tr>

                          {/* Row 2: Jumping & Landing */}
                          <tr>
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-amber-100/70 text-amber-600 flex items-center justify-center shrink-0">
                                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                                </div>
                                <div>
                                  <div className="font-bold text-[#172B50]">Jumping & Landing</div>
                                  <div className="text-[10px] text-[#172B50]/55">Power & safe landing</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 text-center font-bold text-[#172B50]">
                              {selectedEval.skills?.jumping?.coachRating || 4} / 5
                            </td>
                            <td className="py-2.5 text-center">
                              <select
                                value={editedRatings.jumping}
                                onChange={(e) => setEditedRatings({ ...editedRatings, jumping: Number(e.target.value) })}
                                className="px-2 py-1 text-xs font-bold text-[#172B50] bg-white border border-gray-200 rounded-lg outline-none focus:border-[#F4510B] cursor-pointer"
                              >
                                {[1, 2, 3, 4, 5].map(v => (
                                  <option key={v} value={v}>{v} / 5</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2.5 text-center font-bold text-gray-400">
                              {selectedEval.skills?.jumping?.previousRating || 3} / 5
                            </td>
                            <td className="py-2.5 text-center font-bold text-emerald-600">
                              {selectedEval.skills?.jumping?.progress || '↑ +20%'}
                            </td>
                          </tr>

                          {/* Row 3: Throwing & Catching */}
                          <tr>
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0">
                                  <Target className="w-3.5 h-3.5 text-purple-600" />
                                </div>
                                <div>
                                  <div className="font-bold text-[#172B50]">Throwing & Catching</div>
                                  <div className="text-[10px] text-[#172B50]/55">Focus, timing & hand-eye</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 text-center font-bold text-[#172B50]">
                              {selectedEval.skills?.throwing?.coachRating || 5} / 5
                            </td>
                            <td className="py-2.5 text-center">
                              <select
                                value={editedRatings.throwing}
                                onChange={(e) => setEditedRatings({ ...editedRatings, throwing: Number(e.target.value) })}
                                className="px-2 py-1 text-xs font-bold text-[#172B50] bg-white border border-gray-200 rounded-lg outline-none focus:border-[#F4510B] cursor-pointer"
                              >
                                {[1, 2, 3, 4, 5].map(v => (
                                  <option key={v} value={v}>{v} / 5</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2.5 text-center font-bold text-gray-400">
                              {selectedEval.skills?.throwing?.previousRating || 4} / 5
                            </td>
                            <td className="py-2.5 text-center font-bold text-emerald-600">
                              {selectedEval.skills?.throwing?.progress || '↑ +20%'}
                            </td>
                          </tr>

                          {/* Row 4: Running */}
                          <tr>
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-cyan-100/70 text-cyan-600 flex items-center justify-center shrink-0">
                                  <Zap className="w-3.5 h-3.5 text-cyan-600" />
                                </div>
                                <div>
                                  <div className="font-bold text-[#172B50]">Running</div>
                                  <div className="text-[10px] text-[#172B50]/55">Speed, agility & movement</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 text-center font-bold text-[#172B50]">
                              {selectedEval.skills?.running?.coachRating || 4} / 5
                            </td>
                            <td className="py-2.5 text-center">
                              <select
                                value={editedRatings.running}
                                onChange={(e) => setEditedRatings({ ...editedRatings, running: Number(e.target.value) })}
                                className="px-2 py-1 text-xs font-bold text-[#172B50] bg-white border border-gray-200 rounded-lg outline-none focus:border-[#F4510B] cursor-pointer"
                              >
                                {[1, 2, 3, 4, 5].map(v => (
                                  <option key={v} value={v}>{v} / 5</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2.5 text-center font-bold text-gray-400">
                              {selectedEval.skills?.running?.previousRating || 3} / 5
                            </td>
                            <td className="py-2.5 text-center font-bold text-emerald-600">
                              {selectedEval.skills?.running?.progress || '↑ +20%'}
                            </td>
                          </tr>

                        </tbody>
                      </table>
                    </div>

                    {/* Right: Overall Progress Gauge (col 4) */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <div className="text-xs font-bold text-[#172B50] mb-2">
                        Overall Progress
                      </div>
                      
                      {/* Gauge circle SVG */}
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                          {/* Background track */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#E2E8F0"
                            strokeWidth="8"
                            fill="none"
                          />
                          {/* Fill progress */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#10B981"
                            strokeWidth="8"
                            strokeDasharray="251.2"
                            strokeDashoffset={251.2 - (251.2 * liveOverallProgress.pct) / 100}
                            strokeLinecap="round"
                            fill="none"
                            className="transition-all duration-300"
                          />
                        </svg>

                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <div className="text-xl font-black text-[#172B50] leading-none">
                            {liveOverallProgress.avg} <span className="text-xs text-gray-400 font-bold">/ 5</span>
                          </div>
                          <div className="text-[11px] font-bold text-gray-500 mt-0.5">
                            ({liveOverallProgress.pct}%)
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                        <span>↑ +18%</span>
                        <span className="text-gray-400 font-medium">vs. last evaluation</span>
                      </div>
                    </div>

                  </div>

                  {/* Observations & Review Notes (2 boxes) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Box 1: Coach's Observation */}
                    <div className="bg-[#FFFDFB] border border-gray-100 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={selectedEval.coachAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'}
                          alt={selectedEval.coachName}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <h4 className="text-xs font-black text-[#172B50]">
                          Coach's Observation
                        </h4>
                      </div>
                      <p className="text-xs text-[#172B50]/75 leading-relaxed italic">
                        "{selectedEval.coachObservation || 'Priya showed great focus and improvement in balance and throwing skills. She is more confident during turns and group activities.'}"
                      </p>
                    </div>

                    {/* Box 2: Your Review Notes (Editable) */}
                    <div className="bg-[#FFFDFB] border border-gray-100 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#F4510B]" />
                          <h4 className="text-xs font-black text-[#172B50]">
                            Your Review Notes (Optional)
                          </h4>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold">
                          {reviewNotes.length} / 250
                        </span>
                      </div>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value.slice(0, 250))}
                        rows={3}
                        placeholder="Evaluation is accurate. Progress is consistent with session observations. Approved for publish."
                        className="w-full p-2.5 text-xs text-[#172B50] bg-white border border-gray-200 rounded-xl outline-none focus:border-[#F4510B] leading-relaxed resize-none"
                      />
                    </div>

                  </div>

                </div>
              )}

              {/* Sub-Tab 2: Coach Notes */}
              {activeSubTab === 'notes' && (
                <div className="space-y-3 py-2">
                  <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-100 space-y-2">
                    <h4 className="text-xs font-bold text-[#172B50]">Weekly Training Highlights</h4>
                    <p className="text-xs text-[#172B50]/70 leading-relaxed">
                      {selectedEval.studentName} has been consistent in all agility drills. Improved single-leg balance and hand-eye ball toss accuracy across three weeks.
                    </p>
                  </div>
                  <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-100 space-y-2">
                    <h4 className="text-xs font-bold text-[#172B50]">Areas for Focus Next Term</h4>
                    <p className="text-xs text-[#172B50]/70 leading-relaxed">
                      Encourage deeper squats during jumping landings and continuous sprint rhythm between agility ladder rungs.
                    </p>
                  </div>
                </div>
              )}

              {/* Sub-Tab 3: Progress Comparison */}
              {activeSubTab === 'comparison' && (
                <div className="space-y-3 py-2">
                  <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-100">
                    <div className="text-xs font-bold text-[#172B50] mb-2">Quarter-over-Quarter Growth</div>
                    <div className="space-y-2">
                      {['Balance (+20%)', 'Jumping & Landing (+20%)', 'Throwing & Catching (+20%)', 'Running (+20%)'].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-[#172B50]">{item}</span>
                          <span className="text-emerald-600 font-bold">Progressing on Track</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 4: Activity Details */}
              {activeSubTab === 'activity' && (
                <div className="space-y-3 py-2">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-gray-400 text-[10px] uppercase font-bold">Training Location</div>
                      <div className="font-bold text-[#172B50] mt-0.5">{selectedEval.location}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-gray-400 text-[10px] uppercase font-bold">Enrolled Program</div>
                      <div className="font-bold text-[#172B50] mt-0.5">{selectedEval.program}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-gray-400 text-[10px] uppercase font-bold">Assigned Batch</div>
                      <div className="font-bold text-[#172B50] mt-0.5">{selectedEval.batch}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-gray-400 text-[10px] uppercase font-bold">Term / Period</div>
                      <div className="font-bold text-[#172B50] mt-0.5">{selectedDateRange}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Action Buttons (Matching Screenshot) */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                
                {/* 1. Return to Coach */}
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#F4510B] text-[#F4510B] text-xs font-bold hover:bg-[#FFF4E8] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Return to Coach</span>
                </button>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {/* 2. Save Changes */}
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-300 text-[#172B50] text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>

                  {/* 3. Approve & Publish */}
                  <button
                    type="button"
                    onClick={() => setIsApproveConfirmOpen(true)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#F4510B] text-white text-xs font-bold hover:bg-[#e04505] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Publish</span>
                  </button>
                </div>

              </div>
            </>
          )}

        </div>

      </div>
      </>
      )}

      {/* ============================================================ */}
      {/* 6. MODALS                                                    */}
      {/* ============================================================ */}

      {/* Modal: Return to Coach */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Return Evaluation to Coach"
        subtitle="Specify what requires correction before this evaluation can be published."
      >
        <div className="space-y-4 text-left">
          <div className="p-3 bg-[#FFF4E8] border border-[#F4510B]/20 rounded-xl text-xs space-y-1">
            <span className="font-bold text-[#172B50]">Athlete:</span> {selectedEval?.studentName} ({selectedEval?.id})
            <br />
            <span className="font-bold text-[#172B50]">Submitting Coach:</span> {selectedEval?.coachName}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#172B50]">
              Reason for Return (Required) *
            </label>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              rows={4}
              placeholder="e.g. Please re-assess jumping routine and ensure video evidence aligns with a 5/5 score."
              className="w-full p-3 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-[#F4510B] resize-none"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsReturnModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReturn}
              className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl hover:bg-[#e04505] cursor-pointer shadow-xs"
            >
              Confirm Return to Coach
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Approve & Publish Confirmation */}
      <Modal
        isOpen={isApproveConfirmOpen}
        onClose={() => setIsApproveConfirmOpen(false)}
        title="Approve & Publish Evaluation"
        subtitle="Publish athletic performance report card to Parent Portal"
      >
        <div className="space-y-4 text-left">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Ready for Parent Publication</span>
            </div>
            <p className="text-emerald-900 leading-relaxed">
              Approving this evaluation will immediately update <strong>{selectedEval?.studentName}</strong>'s progress scorecard in the Parent Portal with the verified Super Coach ratings.
            </p>
            <div className="pt-1 text-[11px] text-emerald-800 font-bold">
              Overall Score: {liveOverallProgress.avg} / 5 ({liveOverallProgress.pct}%)
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsApproveConfirmOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmApprove}
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl hover:bg-[#e04505] cursor-pointer shadow-xs"
            >
              Approve & Publish Now
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Simulate / Create Evaluation */}
      <Modal
        isOpen={isNewEvalModalOpen}
        onClose={() => setIsNewEvalModalOpen(false)}
        title="Simulate Coach Assessment Submission"
        subtitle="Create an evaluation record to test Super Coach review workflow"
      >
        <form onSubmit={handleCreateNewEval} className="space-y-3.5 text-left">
          <div className="grid grid-cols-2 gap-3 text-xs">
            
            <div className="space-y-1">
              <label className="font-bold text-[#172B50]">Athlete Student *</label>
              <select
                value={newEvalForm.studentId}
                onChange={(e) => setNewEvalForm({ ...newEvalForm, studentId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#F4510B]"
              >
                <option value="">Priya S (Sample Athlete)</option>
                {(data.students || []).map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#172B50]">Submitting Coach *</label>
              <input
                type="text"
                value={newEvalForm.coachName}
                onChange={(e) => setNewEvalForm({ ...newEvalForm, coachName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#F4510B]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#172B50]">Location *</label>
              <select
                value={newEvalForm.location}
                onChange={(e) => setNewEvalForm({ ...newEvalForm, location: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#F4510B]"
              >
                {locationOptions.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#172B50]">Batch *</label>
              <input
                type="text"
                value={newEvalForm.batch}
                onChange={(e) => setNewEvalForm({ ...newEvalForm, batch: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#F4510B]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#172B50]">Program *</label>
              <input
                type="text"
                value={newEvalForm.program}
                onChange={(e) => setNewEvalForm({ ...newEvalForm, program: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#F4510B]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#172B50]">Category</label>
              <input
                type="text"
                value={newEvalForm.category}
                onChange={(e) => setNewEvalForm({ ...newEvalForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#F4510B]"
              />
            </div>

          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-[#172B50]">Coach's Observation</label>
            <textarea
              value={newEvalForm.coachObservation}
              onChange={(e) => setNewEvalForm({ ...newEvalForm, coachObservation: e.target.value })}
              rows={2}
              className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#F4510B] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewEvalModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl hover:bg-[#e04505] cursor-pointer shadow-xs"
            >
              Submit for Review
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Return Child Development Submission */}
      <Modal
        isOpen={isDevReturnModalOpen}
        onClose={() => setIsDevReturnModalOpen(false)}
        title="Return to Coach for Correction"
        subtitle={`Request corrections from Coach ${selectedDevSubmission?.coachName} for ${selectedDevSubmission?.childName}'s submission`}
      >
        <div className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#172B50]">
              Reason for Return (Required) *
            </label>
            <textarea
              value={devReturnReason}
              onChange={(e) => setDevReturnReason(e.target.value)}
              rows={4}
              placeholder="e.g. Please provide additional drill observations or verify that both attempts were completed without assistance."
              className="w-full p-3 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-[#F4510B] resize-none"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDevReturnModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDevReturn}
              className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl hover:bg-[#e04505] cursor-pointer shadow-xs"
            >
              Confirm Return to Coach
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Reject Child Development Submission */}
      <Modal
        isOpen={isDevRejectModalOpen}
        onClose={() => setIsDevRejectModalOpen(false)}
        title="Reject Badge / Milestone Submission"
        subtitle={`Reject ${selectedDevSubmission?.childName}'s submission from Coach ${selectedDevSubmission?.coachName}`}
      >
        <div className="space-y-4 text-left">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
            <strong>Caution:</strong> Rejecting will mark this submission as rejected and notify the coach. The badge will remain locked for the child until newly resubmitted.
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#172B50]">
              Rejection Reason (Required) *
            </label>
            <textarea
              value={devRejectReason}
              onChange={(e) => setDevRejectReason(e.target.value)}
              rows={4}
              placeholder="e.g. Skill criteria not yet met for this age level. Recommend further practice in regular sessions."
              className="w-full p-3 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-red-500 resize-none"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDevRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDevReject}
              className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 cursor-pointer shadow-xs"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
