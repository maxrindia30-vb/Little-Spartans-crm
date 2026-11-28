import React, { useState, useMemo, useEffect } from 'react';
import {
  ClipboardCheck,
  MapPin,
  Layers,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  Star,
  Trophy,
  BarChart2,
  Target,
  FileText,
  Save,
  Send,
  Search,
  Filter,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Zap,
  Activity,
  Scale,
  Award,
  Bell,
  Check,
  X,
  History,
  BookOpen,
  Info
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import { DynamicBadgeIcon } from '../../components/common/BadgeIllustrations';
import {
  PROGRAM_BADGE_CATALOG,
  MILESTONE_CATALOG,
  BADGE_STATUSES,
  RADAR_DIMENSIONS,
} from '../../services/childDevelopmentService';

export default function ChildEvaluationModule({ initialTab = 'evaluating' }) {
  const {
    data,
    currentUser,
    saveDraftEvaluation,
    submitEvaluation,
    updateEvaluation,
    submitChildBadgeAchievement,
    submitChildMilestone,
    saveChildObservation,
    updateChildBadgeProgress,
    childJourneys,
    childDevelopmentSubmissions,
    addToast
  } = useCrm();

  // Current Coach Profile
  const coachProfile = useMemo(() => {
    return data.coaches?.find(c => c.id === 'COACH-SAM' || c.name?.toLowerCase().includes('sam')) ||
      data.coaches?.[0] || {
        id: 'COACH-SAM',
        name: 'Coach Sam',
        role: 'Coach',
        center: 'KK NAGAR',
        assignedLocations: ['KK NAGAR', 'KILPAUK'],
        specialization: 'Foundational Movement',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
      };
  }, [data.coaches]);

  // Coach Authorized Locations
  const assignedLocations = useMemo(() => {
    return coachProfile.assignedLocations || [coachProfile.center || 'KK NAGAR'];
  }, [coachProfile]);

  // Main navigation tab within Child Evaluation module
  const [activeModuleTab, setActiveModuleTab] = useState(initialTab); // 'evaluating' | 'history' | 'returned'

  useEffect(() => {
    if (initialTab) {
      setActiveModuleTab(initialTab);
    }
  }, [initialTab]);

  // Cascading Filters
  const [selectedLocation, setSelectedLocation] = useState(assignedLocations[0] || 'KK NAGAR');
  const [selectedProgram, setSelectedProgram] = useState('Foundational Movement');
  const [selectedBatch, setSelectedBatch] = useState('LE - B1');
  const [selectedCycle, setSelectedCycle] = useState('Quarter 4 (Oct – Dec 2026)');

  // Filter Dropdown Open States
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
  const [isProgDropdownOpen, setIsProgDropdownOpen] = useState(false);
  const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);
  const [isCycleDropdownOpen, setIsCycleDropdownOpen] = useState(false);

  // Search & Filter state in child list
  const [childSearchQuery, setChildSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Evaluated' | 'Pending' | 'Draft' | 'Not Evaluated'

  // Sub-tabs in evaluation form
  const [activeSubTab, setActiveSubTab] = useState('skills'); // 'skills' | 'observations' | 'plan' | 'previous'

  // Selected Child ID
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Confirmation Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Badge & Milestone Submission State
  const [isBadgeSubmitModalOpen, setIsBadgeSubmitModalOpen] = useState(false);
  const [selectedBadgeToSubmit, setSelectedBadgeToSubmit] = useState(null);
  const [badgeSessionDate, setBadgeSessionDate] = useState('2026-11-26');
  const [badgeEvidenceNotes, setBadgeEvidenceNotes] = useState('');
  const [badgeDemonstratedChecklist, setBadgeDemonstratedChecklist] = useState([]);

  const [isMilestoneSubmitModalOpen, setIsMilestoneSubmitModalOpen] = useState(false);
  const [selectedMilestoneToSubmit, setSelectedMilestoneToSubmit] = useState(null);
  const [milestoneSessionDate, setMilestoneSessionDate] = useState('2026-11-26');
  const [milestoneEvidenceNotes, setMilestoneEvidenceNotes] = useState('');

  // Radar Dimension State for Session Observation
  const [radarDimensions, setRadarDimensions] = useState({
    balance: 82,
    coordination: 78,
    agility: 80,
    strength: 70,
    flexibility: 75,
    stamina: 65,
    focus: 85,
    confidence: 82,
    instructions: 88,
  });
  const [selectedKeyObservations, setSelectedKeyObservations] = useState([
    'Good balance and body control',
    'Improved coordination and agility',
    'Shows great teamwork',
  ]);

  // Available Programs for Selected Location
  const programOptions = useMemo(() => {
    const list = new Set();
    // Programs from classes
    (data.classes || []).forEach(cl => {
      if ((cl.center || '').toLowerCase().trim() === selectedLocation.toLowerCase().trim() && cl.program) {
        list.add(cl.program);
      }
    });
    // Curriculum catalog fallback
    (data.programs || []).forEach(p => list.add(p.name));
    list.add('Foundational Movement');
    return Array.from(list);
  }, [data.classes, data.programs, selectedLocation]);

  // Available Batches for Selected Location & Program
  const batchOptions = useMemo(() => {
    const list = new Set();
    (data.classes || []).forEach(cl => {
      const locMatch = (cl.center || '').toLowerCase().trim() === selectedLocation.toLowerCase().trim();
      const progMatch = (cl.program || '').toLowerCase().trim() === selectedProgram.toLowerCase().trim();
      if (locMatch && progMatch && cl.name) {
        list.add(cl.name);
      }
    });
    if (selectedProgram === 'Foundational Movement') {
      list.add('LE - B1');
    }
    if (list.size === 0) {
      list.add('LE - B1');
      list.add('Junior Champions');
    }
    return Array.from(list);
  }, [data.classes, selectedLocation, selectedProgram]);

  // Students in selected Batch
  const batchStudents = useMemo(() => {
    // Look up from data.students
    let matched = (data.students || []).filter(st => {
      const locMatch = (st.center || '').toLowerCase().trim() === selectedLocation.toLowerCase().trim();
      const progMatch = (st.program || '').toLowerCase().trim() === selectedProgram.toLowerCase().trim();
      const batchMatch = (st.batch || '').toLowerCase().trim() === selectedBatch.toLowerCase().trim() ||
        (Array.isArray(st.enrolledClasses) && st.enrolledClasses.some(c => c.toLowerCase().trim() === selectedBatch.toLowerCase().trim()));
      return locMatch && (batchMatch || progMatch);
    });

    // If batch is LE - B1 and fewer than 5, ensure default reference students exist
    if (matched.length === 0 && selectedBatch === 'LE - B1') {
      matched = [
        {
          id: 'STU-LS-001',
          rollNo: 'LS001',
          name: 'Priya S',
          age: 5,
          gender: 'Female',
          center: 'KK NAGAR',
          program: 'Foundational Movement',
          batch: 'LE - B1',
          avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80',
        },
        {
          id: 'STU-LS-002',
          rollNo: 'LS002',
          name: 'Aarav K',
          age: 4,
          gender: 'Male',
          center: 'KK NAGAR',
          program: 'Foundational Movement',
          batch: 'LE - B1',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
        },
        {
          id: 'STU-LS-003',
          rollNo: 'LS003',
          name: 'Rohan M',
          age: 4,
          gender: 'Male',
          center: 'KK NAGAR',
          program: 'Foundational Movement',
          batch: 'LE - B1',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
        },
        {
          id: 'STU-LS-004',
          rollNo: 'LS004',
          name: 'Diya R',
          age: 5,
          gender: 'Female',
          center: 'KK NAGAR',
          program: 'Foundational Movement',
          batch: 'LE - B1',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        },
        {
          id: 'STU-LS-005',
          rollNo: 'LS005',
          name: 'Vivaan P',
          age: 5,
          gender: 'Male',
          center: 'KK NAGAR',
          program: 'Foundational Movement',
          batch: 'LE - B1',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        }
      ];
    }

    return matched;
  }, [data.students, selectedLocation, selectedProgram, selectedBatch]);

  // Set default selected student
  useEffect(() => {
    if (batchStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(batchStudents[0].id);
    }
  }, [batchStudents, selectedStudentId]);

  // Active Selected Student
  const currentStudent = useMemo(() => {
    return batchStudents.find(s => s.id === selectedStudentId) || batchStudents[0] || null;
  }, [batchStudents, selectedStudentId]);

  // Current Student Journey & Submissions
  const currentStudentJourney = useMemo(() => {
    if (!currentStudent) return null;
    const journeys = childJourneys || data.childJourneys || {};
    return journeys[currentStudent.id] || journeys['STU-LS-002'] || null;
  }, [childJourneys, data.childJourneys, currentStudent]);

  // Submissions for this student
  const studentSubmissions = useMemo(() => {
    if (!currentStudent) return [];
    const list = childDevelopmentSubmissions || data.childDevelopmentSubmissions || [];
    return list.filter((s) => s.childId === currentStudent.id || s.childName === currentStudent.name);
  }, [childDevelopmentSubmissions, data.childDevelopmentSubmissions, currentStudent]);

  // Existing Evaluation Record for Current Student in this Cycle
  const currentEvaluation = useMemo(() => {
    if (!currentStudent) return null;
    return (data.evaluations || []).find(e =>
      e.studentId === currentStudent.id ||
      e.studentName === currentStudent.name
    ) || null;
  }, [data.evaluations, currentStudent]);

  // Form State for Child Evaluation
  const [formData, setFormData] = useState({
    balanceRating: 4,
    balanceNotes: 'Good stability during basic movements.',
    jumpingRating: 4,
    jumpingNotes: 'Jumps with good control, needs more height.',
    throwingRating: 5,
    throwingNotes: 'Excellent hand-eye coordination.',
    runningRating: 4,
    runningNotes: 'Good speed and effort, can improve turns.',
    strengths: 'Shows good focus, coordination and confidence during activities.',
    improvementAreas: 'Can work on maintaining balance during quick direction changes.',
    nextSessionFocus: 'Balance drills and change of direction activities.',
    coachObservation: 'Overall performance is good. Priya is active, enthusiastic and follows instructions well.'
  });

  // Sync Form Data when currentStudent or currentEvaluation changes
  useEffect(() => {
    if (currentEvaluation) {
      const skills = currentEvaluation.skills || {};
      setFormData({
        balanceRating: skills.balance?.coachRating || 4,
        balanceNotes: skills.balance?.coachNotes || 'Good stability during basic movements.',
        jumpingRating: skills.jumping?.coachRating || 4,
        jumpingNotes: skills.jumping?.coachNotes || 'Jumps with good control, needs more height.',
        throwingRating: skills.throwing?.coachRating || 5,
        throwingNotes: skills.throwing?.coachNotes || 'Excellent hand-eye coordination.',
        runningRating: skills.running?.coachRating || 4,
        runningNotes: skills.running?.coachNotes || 'Good speed and effort, can improve turns.',
        strengths: currentEvaluation.strengths || 'Shows good focus, coordination and confidence during activities.',
        improvementAreas: currentEvaluation.improvementAreas || 'Can work on maintaining balance during quick direction changes.',
        nextSessionFocus: currentEvaluation.nextSessionFocus || 'Balance drills and change of direction activities.',
        coachObservation: currentEvaluation.coachObservation || 'Overall performance is good. Priya is active, enthusiastic and follows instructions well.'
      });
    } else if (currentStudent) {
      // Default initial evaluation values matching the reference mockup
      if (currentStudent.name === 'Priya S') {
        setFormData({
          balanceRating: 4,
          balanceNotes: 'Good stability during basic movements.',
          jumpingRating: 4,
          jumpingNotes: 'Jumps with good control, needs more height.',
          throwingRating: 5,
          throwingNotes: 'Excellent hand-eye coordination.',
          runningRating: 4,
          runningNotes: 'Good speed and effort, can improve turns.',
          strengths: 'Shows good focus, coordination and confidence during activities.',
          improvementAreas: 'Can work on maintaining balance during quick direction changes.',
          nextSessionFocus: 'Balance drills and change of direction activities.',
          coachObservation: 'Overall performance is good. Priya is active, enthusiastic and follows instructions well.'
        });
      } else {
        setFormData({
          balanceRating: 4,
          balanceNotes: `Shows steady core balance during warm-up drills.`,
          jumpingRating: 4,
          jumpingNotes: `Good vertical spring and safe two-foot landing.`,
          throwingRating: 4,
          throwingNotes: `Consistent catching grip and hand-eye focus.`,
          runningRating: 4,
          runningNotes: `Good linear sprint speed, working on lateral agility.`,
          strengths: `${currentStudent.name} brings high energy, curiosity and discipline to practice.`,
          improvementAreas: `Continue working on swift balance recovery after jumps.`,
          nextSessionFocus: `Obstacle navigation drills and multi-directional sprints.`,
          coachObservation: `Strong enthusiasm and positive progress observed across all rubrics.`
        });
      }
    }
  }, [currentStudent, currentEvaluation]);

  // Evaluation status for current student
  const currentStatus = useMemo(() => {
    if (!currentEvaluation) return 'Draft'; // Default in screenshot is Draft
    return currentEvaluation.status || 'Draft';
  }, [currentEvaluation]);

  // Helper: Status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', border: 'border-[#16A34A]/30', label: 'Approved' };
      case 'Pending':
        return { bg: 'bg-[#FFF0E6]', text: 'text-[#F4510B]', border: 'border-[#F4510B]/30', label: 'Pending Review' };
      case 'Returned':
        return { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', border: 'border-[#EF4444]/30', label: 'Returned' };
      case 'Draft':
        return { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', border: 'border-[#D97706]/30', label: 'Draft' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', label: 'Not Evaluated' };
    }
  };

  // Status mapping for children list
  const getChildStatus = (student) => {
    const ev = (data.evaluations || []).find(e => e.studentId === student.id || e.studentName === student.name);
    if (!ev) return 'Not Evaluated';
    return ev.status || 'Draft';
  };

  // Filtered children based on search and status
  const filteredStudents = useMemo(() => {
    return batchStudents.filter(student => {
      if (childSearchQuery.trim()) {
        const q = childSearchQuery.toLowerCase().trim();
        const nameMatch = (student.name || '').toLowerCase().includes(q);
        const rollMatch = (student.rollNo || '').toLowerCase().includes(q);
        if (!nameMatch && !rollMatch) return false;
      }
      if (statusFilter !== 'All') {
        const st = getChildStatus(student);
        if (statusFilter === 'Not Evaluated' && st !== 'Not Evaluated') return false;
        if (statusFilter === 'Draft' && st !== 'Draft') return false;
        if (statusFilter === 'Pending' && st !== 'Pending') return false;
        if (statusFilter === 'Evaluated' && (st === 'Not Evaluated')) return false;
      }
      return true;
    });
  }, [batchStudents, childSearchQuery, statusFilter, data.evaluations]);

  // Star Rating Click Handler
  const handleRatingClick = (skillKey, score) => {
    setFormData(prev => ({
      ...prev,
      [`${skillKey}Rating`]: score
    }));
  };

  // Save as Draft
  const handleSaveDraft = () => {
    if (!currentStudent) return;
    const avgScore = (
      (formData.balanceRating + formData.jumpingRating + formData.throwingRating + formData.runningRating) / 4
    ).toFixed(1);

    const draftPayload = {
      id: currentEvaluation?.id,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentAvatar: currentStudent.avatar,
      age: currentStudent.age || 5,
      gender: currentStudent.gender || 'Female',
      rollNo: currentStudent.rollNo || 'LS001',
      location: selectedLocation,
      program: selectedProgram,
      batch: selectedBatch,
      cycle: selectedCycle,
      coachId: coachProfile.id,
      coachName: coachProfile.name,
      coachAvatar: coachProfile.avatar,
      status: 'Draft',
      skills: {
        balance: { name: 'Balance', description: 'Body control & stability', coachRating: formData.balanceRating, coachNotes: formData.balanceNotes, previousRating: 3, progress: '+20%' },
        jumping: { name: 'Jumping & Landing', description: 'Power & safe landing', coachRating: formData.jumpingRating, coachNotes: formData.jumpingNotes, previousRating: 3, progress: '+20%' },
        throwing: { name: 'Throwing & Catching', description: 'Focus, timing & hand-eye', coachRating: formData.throwingRating, coachNotes: formData.throwingNotes, previousRating: 4, progress: '+20%' },
        running: { name: 'Running', description: 'Speed, agility & movement', coachRating: formData.runningRating, coachNotes: formData.runningNotes, previousRating: 3, progress: '+20%' },
      },
      overallRating: avgScore,
      strengths: formData.strengths,
      improvementAreas: formData.improvementAreas,
      nextSessionFocus: formData.nextSessionFocus,
      coachObservation: formData.coachObservation,
    };

    saveDraftEvaluation(draftPayload);
  };

  // Submit for Super Coach Review
  const handleConfirmSubmit = () => {
    if (!currentStudent) return;
    const avgScore = (
      (formData.balanceRating + formData.jumpingRating + formData.throwingRating + formData.runningRating) / 4
    ).toFixed(1);

    const submitPayload = {
      id: currentEvaluation?.id,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentAvatar: currentStudent.avatar,
      age: currentStudent.age || 5,
      gender: currentStudent.gender || 'Female',
      rollNo: currentStudent.rollNo || 'LS001',
      location: selectedLocation,
      program: selectedProgram,
      batch: selectedBatch,
      cycle: selectedCycle,
      category: 'Foundational Skills',
      coachId: coachProfile.id,
      coachName: coachProfile.name,
      coachAvatar: coachProfile.avatar,
      status: 'Pending',
      skills: {
        balance: { name: 'Balance', description: 'Body control & stability', coachRating: formData.balanceRating, superCoachRating: formData.balanceRating, coachNotes: formData.balanceNotes, previousRating: 3, progress: '+20%' },
        jumping: { name: 'Jumping & Landing', description: 'Power & safe landing', coachRating: formData.jumpingRating, superCoachRating: formData.jumpingRating, coachNotes: formData.jumpingNotes, previousRating: 3, progress: '+20%' },
        throwing: { name: 'Throwing & Catching', description: 'Focus, timing & hand-eye', coachRating: formData.throwingRating, superCoachRating: formData.throwingRating, coachNotes: formData.throwingNotes, previousRating: 4, progress: '+20%' },
        running: { name: 'Running', description: 'Speed, agility & movement', coachRating: formData.runningRating, superCoachRating: formData.runningRating, coachNotes: formData.runningNotes, previousRating: 3, progress: '+20%' },
      },
      overallRating: avgScore,
      strengths: formData.strengths,
      improvementAreas: formData.improvementAreas,
      nextSessionFocus: formData.nextSessionFocus,
      coachObservation: formData.coachObservation,
      submittedAt: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
    };

    submitEvaluation(submitPayload);
    setIsSubmitModalOpen(false);
  };

  // Evaluations for History view
  const coachEvaluationsList = useMemo(() => {
    return (data.evaluations || []).filter(e => {
      const matchCoach = !e.coachId || e.coachId === coachProfile.id || e.coachName === coachProfile.name;
      return matchCoach;
    });
  }, [data.evaluations, coachProfile]);

  // Returned evaluations specifically
  const returnedEvaluationsList = useMemo(() => {
    return coachEvaluationsList.filter(e => e.status === 'Returned');
  }, [coachEvaluationsList]);

  return (
    <div className="space-y-4 animate-slide-up pb-8 font-sans">

      {/* ============================================================ */}
      {/* 1. HEADER (Exact match with reference screenshot)            */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {/* Left: Heading & Subtitle */}
        <div className="text-left space-y-0.5">
          <div className="text-[10.5px] font-black uppercase text-[#172B50]/60 tracking-wider">
            COACH PORTAL
          </div>
          <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-black text-[#172B50] tracking-tight flex items-center gap-2">
            <span>Evaluations</span>
            <span className="w-7 h-7 rounded-lg bg-[#FFF0E6] flex items-center justify-center text-[#F4510B] border border-[#F4510B]/30">
              <ClipboardCheck className="w-4 h-4 text-[#F4510B]" />
            </span>
          </h1>
          <p className="text-xs sm:text-[13px] font-bold text-[#172B50]/65 tracking-tight text-left">
            Evaluate assigned children, review past evaluation records, and update returned submissions.
          </p>
        </div>

        {/* Right: Location selector, Notification, Coach Profile */}
        <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-center shrink-0">
          
          {/* Location Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLocDropdownOpen(!isLocDropdownOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#172B50]/15 shadow-2xs hover:bg-[#FFF4E8] text-xs font-bold text-[#172B50] transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
              <span>{selectedLocation}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/60" />
            </button>
            {isLocDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[#172B50]/15 rounded-xl shadow-lg py-1 z-30 animate-in fade-in zoom-in-95">
                {assignedLocations.map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setIsLocDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-bold flex items-center justify-between ${
                      selectedLocation === loc ? 'bg-[#FFF4E8] text-[#F4510B]' : 'text-[#172B50] hover:bg-[#FFF4E8]/50'
                    }`}
                  >
                    <span>{loc}</span>
                    {selectedLocation === loc && <Check className="w-3.5 h-3.5 text-[#F4510B]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Button with Alert */}
          <button
            type="button"
            onClick={() => addToast('No new faculty messages', 'info')}
            className="w-8.5 h-8.5 rounded-full bg-white border border-[#172B50]/15 shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] transition-all cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#172B50]" />
            {returnedEvaluationsList.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#F4510B] absolute top-2 right-2 ring-1 ring-white" />
            )}
          </button>

          {/* Coach Profile Pill */}
          <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white border border-[#172B50]/15 shadow-2xs">
            <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-[#F4510B]/30 shrink-0">
              <img
                src={coachProfile.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"}
                alt={coachProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <div className="text-xs font-black text-[#172B50]">{coachProfile.name || 'Coach Sam'}</div>
              <div className="text-[10px] font-bold text-[#172B50]/60">{coachProfile.role || 'Coach'}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/40 ml-0.5 hidden sm:block" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. EVALUATION TABS: PENDING | HISTORY | RETURNED             */}
      {/* ============================================================ */}
      <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-[#172B5018] shadow-2xs self-start w-fit">
        <button
          type="button"
          onClick={() => setActiveModuleTab('evaluating')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeModuleTab === 'evaluating'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B]'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Pending Evaluations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModuleTab('history')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeModuleTab === 'history'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Evaluation History</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
            activeModuleTab === 'history' ? 'bg-white text-[#F4510B]' : 'bg-[#172B50]/10 text-[#172B50]'
          }`}>
            {coachEvaluationsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModuleTab('returned')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeModuleTab === 'returned'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B]'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Returned Evaluations</span>
          {returnedEvaluationsList.length > 0 && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeModuleTab === 'returned' ? 'bg-white text-[#F4510B]' : 'bg-red-500 text-white'
            }`}>
              {returnedEvaluationsList.length}
            </span>
          )}
        </button>
      </div>

      {activeModuleTab === 'evaluating' && (
        <div className="space-y-4 animate-in fade-in duration-200">

      {/* ============================================================ */}
      {/* 2. EVALUATION WORKFLOW BANNER (Step-by-Step Indicator)        */}
      {/* ============================================================ */}
      <div className="bg-[#FFF4E8] border border-[#F4510B]/20 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        {/* Left Title */}
        <div className="text-sm font-black text-[#172B50] tracking-tight shrink-0 flex items-center gap-2">
          <span>Evaluation Workflow</span>
        </div>

        {/* 3 Interactive Workflow Steps */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Step 1: Coach */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border-2 border-[#F4510B] shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-[#FFF0E6] text-[#F4510B] flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-[#F4510B]" />
            </div>
            <div className="text-left leading-none">
              <div className="text-xs font-black text-[#F4510B]">1. Coach</div>
              <div className="text-[10.5px] font-bold text-[#172B50]/70 mt-0.5">Evaluate &amp; Submit</div>
            </div>
          </div>

          {/* Connector Arrow */}
          <div className="text-[#172B50]/40 font-bold select-none">→</div>

          {/* Step 2: Super Coach */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/80 border border-[#172B50]/15 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-[#FFF0E6] text-[#F4510B] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#F4510B]" />
            </div>
            <div className="text-left leading-none">
              <div className="text-xs font-black text-[#172B50]">2. Super Coach</div>
              <div className="text-[10.5px] font-bold text-[#172B50]/70 mt-0.5">Review, Edit &amp; Approve</div>
            </div>
          </div>

          {/* Connector Arrow */}
          <div className="text-[#172B50]/40 font-bold select-none">→</div>

          {/* Step 3: Parent */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#F0FDF4] border border-[#16A34A]/30 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-[#16A34A]" />
            </div>
            <div className="text-left leading-none">
              <div className="text-xs font-black text-[#16A34A]">3. Parent</div>
              <div className="text-[10.5px] font-bold text-[#172B50]/70 mt-0.5">View Published Evaluation</div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. DYNAMIC CASCADING FILTERS (Location → Program → Batch)     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* 1. Location */}
        <div className="relative">
          <label className="text-[11px] font-bold text-[#172B50]/70 block mb-1">Location</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLocDropdownOpen(!isLocDropdownOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2 bg-white border border-[#172B50]/15 rounded-xl shadow-2xs text-xs font-bold text-[#172B50] hover:border-[#F4510B]/40 transition-all text-left"
            >
              <span className="flex items-center gap-2 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                <span className="truncate">{selectedLocation}</span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/50 shrink-0 ml-1" />
            </button>
            {isLocDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#172B50]/15 rounded-xl shadow-xl py-1 z-20">
                {assignedLocations.map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setIsLocDropdownOpen(false);
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
        </div>

        {/* 2. Program */}
        <div className="relative">
          <label className="text-[11px] font-bold text-[#172B50]/70 block mb-1">Program</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProgDropdownOpen(!isProgDropdownOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2 bg-white border border-[#172B50]/15 rounded-xl shadow-2xs text-xs font-bold text-[#172B50] hover:border-[#F4510B]/40 transition-all text-left"
            >
              <span className="flex items-center gap-2 truncate">
                <Layers className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                <span className="truncate">{selectedProgram}</span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/50 shrink-0 ml-1" />
            </button>
            {isProgDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#172B50]/15 rounded-xl shadow-xl py-1 z-20">
                {programOptions.map(prog => (
                  <button
                    key={prog}
                    type="button"
                    onClick={() => {
                      setSelectedProgram(prog);
                      setIsProgDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-1.5 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] flex items-center justify-between"
                  >
                    <span>{prog}</span>
                    {selectedProgram === prog && <Check className="w-3 h-3 text-[#F4510B]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Batch */}
        <div className="relative">
          <label className="text-[11px] font-bold text-[#172B50]/70 block mb-1">Batch</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsBatchDropdownOpen(!isBatchDropdownOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2 bg-white border border-[#172B50]/15 rounded-xl shadow-2xs text-xs font-bold text-[#172B50] hover:border-[#F4510B]/40 transition-all text-left"
            >
              <span className="flex items-center gap-2 truncate">
                <Users className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                <span className="truncate">{selectedBatch}</span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/50 shrink-0 ml-1" />
            </button>
            {isBatchDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#172B50]/15 rounded-xl shadow-xl py-1 z-20">
                {batchOptions.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setSelectedBatch(b);
                      setIsBatchDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-1.5 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] flex items-center justify-between"
                  >
                    <span>{b}</span>
                    {selectedBatch === b && <Check className="w-3 h-3 text-[#F4510B]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. Evaluation Cycle */}
        <div className="relative">
          <label className="text-[11px] font-bold text-[#172B50]/70 block mb-1">Evaluation Cycle</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCycleDropdownOpen(!isCycleDropdownOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2 bg-white border border-[#172B50]/15 rounded-xl shadow-2xs text-xs font-bold text-[#172B50] hover:border-[#F4510B]/40 transition-all text-left"
            >
              <span className="flex items-center gap-2 truncate">
                <Calendar className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                <span className="truncate">{selectedCycle}</span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/50 shrink-0 ml-1" />
            </button>
            {isCycleDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#172B50]/15 rounded-xl shadow-xl py-1 z-20">
                {[
                  'Quarter 4 (Oct – Dec 2026)',
                  'Quarter 1 (Jan – Mar 2027)',
                  'Mid-Term Assessment'
                ].map(cycle => (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => {
                      setSelectedCycle(cycle);
                      setIsCycleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-1.5 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] flex items-center justify-between"
                  >
                    <span>{cycle}</span>
                    {selectedCycle === cycle && <Check className="w-3 h-3 text-[#F4510B]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MAIN SPLIT CONTENT: Left Child List | Right Workspace     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: Children in Batch (4 Cols on LG)                */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#172B50]/12 p-4 shadow-card space-y-3">
          
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#172B50] tracking-tight">
              Children in Batch ({selectedBatch})
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isSearchOpen ? 'bg-[#FFF4E8] border-[#F4510B] text-[#F4510B]' : 'bg-white border-[#172B50]/15 text-[#172B50]/70 hover:bg-[#FFF4E8]'
                }`}
                title="Search Child"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const states = ['All', 'Evaluated', 'Draft', 'Not Evaluated'];
                  const nextIdx = (states.indexOf(statusFilter) + 1) % states.length;
                  setStatusFilter(states[nextIdx]);
                }}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  statusFilter !== 'All' ? 'bg-[#FFF4E8] border-[#F4510B] text-[#F4510B]' : 'bg-white border-[#172B50]/15 text-[#172B50]/70 hover:bg-[#FFF4E8]'
                }`}
                title={`Filter by Status: ${statusFilter}`}
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Inline Search Bar */}
          {isSearchOpen && (
            <div className="relative animate-in fade-in duration-150">
              <Search className="w-3.5 h-3.5 text-[#172B50]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                value={childSearchQuery}
                onChange={(e) => setChildSearchQuery(e.target.value)}
                placeholder="Search by name or roll no..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FFF4E8]/60 text-[#172B50] font-medium rounded-xl border border-[#172B50]/15 focus:outline-none focus:border-[#F4510B]"
              />
            </div>
          )}

          {/* Children Cards List */}
          <div className="space-y-2">
            {filteredStudents.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-[#172B50]/50">
                No children found in this batch.
              </div>
            ) : (
              filteredStudents.map(student => {
                const isSelected = student.id === selectedStudentId;
                const status = getChildStatus(student);
                const badge = getStatusBadge(status);

                return (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#FFF4E8] border-[#F4510B] shadow-xs'
                        : 'bg-white border-[#172B50]/12 hover:border-[#F4510B]/40 hover:bg-[#FFF4E8]/30'
                    }`}
                  >
                    {/* Left: Checkbox + Avatar + Name/Roll */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Checkbox */}
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-[#F4510B] text-white' : 'border border-[#172B50]/30 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-[#172B50]/10 shrink-0">
                        <img
                          src={student.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80'}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Name & Details */}
                      <div className="text-left min-w-0">
                        <div className="text-xs font-black text-[#172B50] truncate">{student.name}</div>
                        <div className="text-[10px] font-bold text-[#172B50]/60 truncate">
                          Age: {student.age || 5} · Roll No: {student.rollNo || 'LS001'}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Pill */}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${badge.bg} ${badge.text} ${badge.border}`}>
                      {badge.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Count */}
          <div className="pt-2 border-t border-[#172B50]/10 flex items-center justify-between text-xs font-bold text-[#172B50]/70">
            <span>Total Children: {batchStudents.length}</span>
            {statusFilter !== 'All' && (
              <button
                type="button"
                onClick={() => setStatusFilter('All')}
                className="text-[10.5px] text-[#F4510B] hover:underline cursor-pointer"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Child Evaluation Workspace (8 Cols on LG)     */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#172B50]/12 p-4 sm:p-5 shadow-card space-y-4">
          
          {/* 1. Child Profile Header Banner */}
          {currentStudent && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#172B50]/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#F4510B]/30 shadow-xs shrink-0">
                  <img
                    src={currentStudent.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80'}
                    alt={currentStudent.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-[#172B50] tracking-tight">{currentStudent.name}</h2>
                    <span className="text-xs font-bold text-[#172B50]/60">
                      Age: {currentStudent.age || 5} · Gender: {currentStudent.gender || 'Female'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#172B50]/65 mt-0.5">
                    Location: <span className="text-[#172B50]">{selectedLocation}</span> · Program: <span className="text-[#172B50]">{selectedProgram}</span> · Batch: <span className="text-[#172B50]">{selectedBatch}</span>
                  </div>
                </div>
              </div>

              {/* Status Box */}
              <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-xl border border-[#172B50]/15 bg-[#FFF4E8]/40 shadow-2xs">
                <ClipboardCheck className="w-4 h-4 text-[#F4510B]" />
                <div className="text-left leading-none">
                  <div className="text-[9px] font-black uppercase text-[#172B50]/60 tracking-wider">Evaluation Status</div>
                  <div className="text-xs font-black text-[#172B50] mt-0.5">{currentStatus}</div>
                </div>
              </div>
            </div>
          )}

          {/* Super Coach Returned Notification Banner (if returned) */}
          {currentStatus === 'Returned' && currentEvaluation && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-left space-y-1 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-xs font-black text-red-700">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Returned by Super Coach for Revision</span>
              </div>
              <p className="text-xs font-bold text-red-800">
                Reason: {currentEvaluation.returnReason || 'Please review and adjust rating rubrics.'}
              </p>
              {currentEvaluation.superCoachNotes && (
                <p className="text-[11px] text-red-700 italic">
                  "{currentEvaluation.superCoachNotes}"
                </p>
              )}
            </div>
          )}

          {/* 2. Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-[#172B50]/10 pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSubTab('badges')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'badges'
                  ? 'bg-[#F4510B] text-white shadow-xs'
                  : 'bg-[#FFF4E8] text-[#172B50] hover:bg-[#F4510B]/15'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Skill Badges &amp; Milestones</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('skills')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'skills'
                  ? 'bg-[#F4510B] text-white shadow-xs'
                  : 'bg-[#FFF4E8] text-[#172B50] hover:bg-[#F4510B]/15'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Skill Evaluation</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('observations')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'observations'
                  ? 'bg-[#F4510B] text-white shadow-xs'
                  : 'bg-[#FFF4E8] text-[#172B50] hover:bg-[#F4510B]/15'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Radar &amp; Habit Observations</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('submissions')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'submissions'
                  ? 'bg-[#F4510B] text-white shadow-xs'
                  : 'bg-[#FFF4E8] text-[#172B50] hover:bg-[#F4510B]/15'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Submissions Queue ({studentSubmissions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('plan')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'plan'
                  ? 'bg-[#F4510B] text-white shadow-xs'
                  : 'bg-[#FFF4E8] text-[#172B50] hover:bg-[#F4510B]/15'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Focus &amp; Plan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('previous')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'previous'
                  ? 'bg-[#F4510B] text-white shadow-xs'
                  : 'bg-[#FFF4E8] text-[#172B50] hover:bg-[#F4510B]/15'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Previous Evaluations</span>
            </button>
          </div>

          {/* SUB-TAB 0: SKILL BADGES & MILESTONES */}
          {activeSubTab === 'badges' && (
            <div className="space-y-6 text-left">
              <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#F4510B]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase text-[#F4510B] tracking-wider">Session-Based Skill Progression</div>
                  <h3 className="text-base font-black text-[#172B50]">
                    {currentStudent?.name}&apos;s Skill Trail &amp; Badge Achievements
                  </h3>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">
                    Record in-class skill mastery and submit eligible badges &amp; milestones for Super Coach verification.
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-white border border-[#F4510B]/30 text-xs font-black text-[#F4510B] shrink-0 shadow-2xs">
                  {currentStudentJourney?.overallProgress || 80}% Overall Progress
                </div>
              </div>

              {/* Badges List on Pathway */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h4 className="text-xs font-black text-[#172B50] uppercase tracking-wider">
                    Applicable Program Badges ({currentStudentJourney?.pathwayBadges?.length || 5})
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">Program: {selectedProgram}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(currentStudentJourney?.pathwayBadges || [
                    { badgeId: 'BADGE-FM-JUMP', name: 'Jumping', category: 'Locomotor', status: 'completed', iconType: 'rabbit' },
                    { badgeId: 'BADGE-FM-TURNS', name: 'Taking Turns', category: 'Social & Emotional', status: 'completed', iconType: 'fox_bear' },
                    { badgeId: 'BADGE-FM-HOP', name: 'Hopping', category: 'Locomotor', status: 'in_progress', progress: 60, iconType: 'duck' },
                    { badgeId: 'BADGE-FM-BAL', name: 'Balancing', category: 'Stability', status: 'locked', iconType: 'beam_girl' },
                    { badgeId: 'BADGE-FM-THROW', name: 'Throwing', category: 'Object Control', status: 'locked', iconType: 'target' },
                  ]).map((badge) => {
                    const isCompleted = badge.status === 'completed';
                    const isInProgress = badge.status === 'in_progress' || badge.status === 'ready_for_assessment';

                    return (
                      <div
                        key={badge.badgeId}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          isCompleted
                            ? 'bg-[#F0FDF4] border-emerald-200'
                            : isInProgress
                            ? 'bg-[#FFF9F3] border-[#F4510B]/30'
                            : 'bg-slate-50 border-slate-200 opacity-80'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <DynamicBadgeIcon iconType={badge.iconType || 'star'} size={56} status={badge.status} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="text-xs font-black text-[#172B50] truncate">{badge.name}</h5>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : isInProgress
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : 'bg-slate-200 text-slate-700 border-slate-300'
                                }`}
                              >
                                {isCompleted ? '✓ Completed' : isInProgress ? `In Progress (${badge.progress || 60}%)` : '🔒 Locked'}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 block mt-0.5">{badge.category}</span>
                            <p className="text-[11px] font-medium text-slate-600 mt-1 line-clamp-2 leading-tight">
                              {badge.description}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar & Actions */}
                        <div className="pt-2 border-t border-black/5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500">Progress:</span>
                            <select
                              value={badge.status === 'completed' ? '100' : String(badge.progress || (badge.status === 'locked' ? 0 : 60))}
                              disabled={isCompleted}
                              onChange={(e) => {
                                const newProg = Number(e.target.value);
                                const newStatus = newProg === 100 ? BADGE_STATUSES.READY_FOR_ASSESSMENT : newProg > 0 ? BADGE_STATUSES.IN_PROGRESS : BADGE_STATUSES.LOCKED;
                                updateChildBadgeProgress(currentStudent.id, badge.badgeId, {
                                  progress: newProg,
                                  status: newStatus,
                                });
                                addToast(`Updated ${badge.name} progress to ${newProg}%.`, 'info');
                              }}
                              className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 cursor-pointer"
                            >
                              <option value="0">0% (Locked)</option>
                              <option value="30">30% (Practising)</option>
                              <option value="60">60% (Advancing)</option>
                              <option value="90">90% (Near Mastery)</option>
                              <option value="100">100% (Ready for Review)</option>
                            </select>
                          </div>

                          {!isCompleted && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBadgeToSubmit(badge);
                                setBadgeEvidenceNotes(`Demonstrated full criteria for ${badge.name} during scheduled session.`);
                                setBadgeDemonstratedChecklist(badge.whatChildDid || [
                                  `Demonstrated ${badge.name} with consistent control`,
                                  'Followed coach directions and safety guidelines',
                                ]);
                                setIsBadgeSubmitModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#F4510B] hover:bg-[#d44307] text-white text-xs font-black flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              <span>Submit to Super Coach</span>
                            </button>
                          )}
                          {isCompleted && (
                            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified {badge.completedDateShort || badge.completedDate}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Milestone Submission Section */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-[#172B50] uppercase tracking-wider">
                    Academy Milestones Submission
                  </h4>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    Curriculum Checkpoints
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MILESTONE_CATALOG.map((ms) => {
                    const alreadyAchieved = (currentStudentJourney?.milestones || []).some((m) => m.id === ms.id || m.title === ms.title);
                    return (
                      <div
                        key={ms.id}
                        className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                          alreadyAchieved ? 'bg-purple-50/50 border-purple-200' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0">
                            <Trophy className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-black text-[#172B50] truncate">{ms.title}</h5>
                            <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug line-clamp-2">
                              {ms.description}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {alreadyAchieved ? (
                            <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                              Achieved ✓
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMilestoneToSubmit(ms);
                                setMilestoneEvidenceNotes(`Demonstrated exceptional dedication and completed criteria for ${ms.title}.`);
                                setIsMilestoneSubmitModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-[#172B50] hover:bg-[#F4510B] text-white text-[11px] font-black transition-colors cursor-pointer shadow-2xs"
                            >
                              Submit
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. SUB-TAB 1: SKILL EVALUATION TABLE */}
          {activeSubTab === 'skills' && (
            <div className="space-y-4">
              
              {/* Skill Area Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#172B50]/10 text-[11px] font-black uppercase text-[#172B50]/60">
                      <th className="py-2 px-2">Skill Area</th>
                      <th className="py-2 px-3 text-center">Rating (1 – 5) <span className="lowercase font-normal">ⓘ</span></th>
                      <th className="py-2 px-3">Coach Notes (Optional)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#172B50]/8">
                    
                    {/* Row 1: Balance */}
                    <tr>
                      <td className="py-3 px-2 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                            <Scale className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-[#172B50]">Balance</div>
                            <div className="text-[10px] font-bold text-[#172B50]/60">Body control &amp; stability</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 align-middle text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* 5 Stars */}
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleRatingClick('balance', star)}
                                className="p-0.5 text-[#F4510B] hover:scale-115 transition-transform cursor-pointer"
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    star <= formData.balanceRating
                                      ? 'fill-[#F4510B] text-[#F4510B]'
                                      : 'fill-transparent text-[#172B50]/20'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          {/* Rating Pill */}
                          <span className="text-[11px] font-black text-[#172B50] px-2 py-0.5 rounded-md bg-[#FFF4E8] border border-[#F4510B]/30">
                            {formData.balanceRating} / 5
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 align-middle">
                        <input
                          type="text"
                          value={formData.balanceNotes}
                          onChange={(e) => setFormData({ ...formData, balanceNotes: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs text-[#172B50] font-medium bg-[#FFF4E8]/40 border border-[#172B50]/15 rounded-xl focus:outline-none focus:border-[#F4510B]"
                          placeholder="e.g. Good stability during basic movements."
                        />
                      </td>
                    </tr>

                    {/* Row 2: Jumping & Landing */}
                    <tr>
                      <td className="py-3 px-2 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                            <Activity className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-[#172B50]">Jumping &amp; Landing</div>
                            <div className="text-[10px] font-bold text-[#172B50]/60">Power &amp; safe landing</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 align-middle text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleRatingClick('jumping', star)}
                                className="p-0.5 text-[#F4510B] hover:scale-115 transition-transform cursor-pointer"
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    star <= formData.jumpingRating
                                      ? 'fill-[#F4510B] text-[#F4510B]'
                                      : 'fill-transparent text-[#172B50]/20'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <span className="text-[11px] font-black text-[#172B50] px-2 py-0.5 rounded-md bg-[#FFF4E8] border border-[#F4510B]/30">
                            {formData.jumpingRating} / 5
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 align-middle">
                        <input
                          type="text"
                          value={formData.jumpingNotes}
                          onChange={(e) => setFormData({ ...formData, jumpingNotes: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs text-[#172B50] font-medium bg-[#FFF4E8]/40 border border-[#172B50]/15 rounded-xl focus:outline-none focus:border-[#F4510B]"
                          placeholder="e.g. Jumps with good control, needs more height."
                        />
                      </td>
                    </tr>

                    {/* Row 3: Throwing & Catching */}
                    <tr>
                      <td className="py-3 px-2 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
                            <Target className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-[#172B50]">Throwing &amp; Catching</div>
                            <div className="text-[10px] font-bold text-[#172B50]/60">Focus, timing &amp; hand-eye</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 align-middle text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleRatingClick('throwing', star)}
                                className="p-0.5 text-[#F4510B] hover:scale-115 transition-transform cursor-pointer"
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    star <= formData.throwingRating
                                      ? 'fill-[#F4510B] text-[#F4510B]'
                                      : 'fill-transparent text-[#172B50]/20'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <span className="text-[11px] font-black text-[#172B50] px-2 py-0.5 rounded-md bg-[#FFF4E8] border border-[#F4510B]/30">
                            {formData.throwingRating} / 5
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 align-middle">
                        <input
                          type="text"
                          value={formData.throwingNotes}
                          onChange={(e) => setFormData({ ...formData, throwingNotes: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs text-[#172B50] font-medium bg-[#FFF4E8]/40 border border-[#172B50]/15 rounded-xl focus:outline-none focus:border-[#F4510B]"
                          placeholder="e.g. Excellent hand-eye coordination."
                        />
                      </td>
                    </tr>

                    {/* Row 4: Running */}
                    <tr>
                      <td className="py-3 px-2 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-200">
                            <Zap className="w-4 h-4 text-cyan-600" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-[#172B50]">Running</div>
                            <div className="text-[10px] font-bold text-[#172B50]/60">Speed, agility &amp; movement</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 align-middle text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleRatingClick('running', star)}
                                className="p-0.5 text-[#F4510B] hover:scale-115 transition-transform cursor-pointer"
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    star <= formData.runningRating
                                      ? 'fill-[#F4510B] text-[#F4510B]'
                                      : 'fill-transparent text-[#172B50]/20'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <span className="text-[11px] font-black text-[#172B50] px-2 py-0.5 rounded-md bg-[#FFF4E8] border border-[#F4510B]/30">
                            {formData.runningRating} / 5
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 align-middle">
                        <input
                          type="text"
                          value={formData.runningNotes}
                          onChange={(e) => setFormData({ ...formData, runningNotes: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs text-[#172B50] font-medium bg-[#FFF4E8]/40 border border-[#172B50]/15 rounded-xl focus:outline-none focus:border-[#F4510B]"
                          placeholder="e.g. Good speed and effort, can improve turns."
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 4 Observation & Focus Grid Cards (2x2 Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                
                {/* 1. Strengths */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#172B50]/12 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-[#172B50]">
                    <Trophy className="w-4 h-4 text-[#F4510B]" />
                    <span>Strengths</span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.strengths}
                    onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                    className="w-full p-2.5 text-xs text-[#172B50] font-medium bg-[#FFF4E8]/30 border border-[#172B50]/12 rounded-xl focus:outline-none focus:border-[#F4510B] resize-none"
                    placeholder="Describe key strengths demonstrated..."
                  />
                </div>

                {/* 2. Improvement Areas */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#172B50]/12 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-[#172B50]">
                    <BarChart2 className="w-4 h-4 text-[#F4510B]" />
                    <span>Improvement Areas</span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.improvementAreas}
                    onChange={(e) => setFormData({ ...formData, improvementAreas: e.target.value })}
                    className="w-full p-2.5 text-xs text-[#172B50] font-medium bg-[#FFF4E8]/30 border border-[#172B50]/12 rounded-xl focus:outline-none focus:border-[#F4510B] resize-none"
                    placeholder="Target areas needing further practice..."
                  />
                </div>

                {/* 3. Next Session Focus */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#172B50]/12 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-[#172B50]">
                    <Target className="w-4 h-4 text-[#F4510B]" />
                    <span>Next Session Focus</span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.nextSessionFocus}
                    onChange={(e) => setFormData({ ...formData, nextSessionFocus: e.target.value })}
                    className="w-full p-2.5 text-xs text-[#172B50] font-medium bg-[#FFF4E8]/30 border border-[#172B50]/12 rounded-xl focus:outline-none focus:border-[#F4510B] resize-none"
                    placeholder="Specific drills and coaching goals for upcoming classes..."
                  />
                </div>

                {/* 4. Coach Observation */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#172B50]/12 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-[#172B50]">
                    <FileText className="w-4 h-4 text-[#F4510B]" />
                    <span>Coach Observation</span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.coachObservation}
                    onChange={(e) => setFormData({ ...formData, coachObservation: e.target.value })}
                    className="w-full p-2.5 text-xs text-[#172B50] font-medium bg-[#FFF4E8]/30 border border-[#172B50]/12 rounded-xl focus:outline-none focus:border-[#F4510B] resize-none"
                    placeholder="Summary observation for this evaluation cycle..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: OBSERVATIONS & RADAR DIMENSIONS */}
          {activeSubTab === 'observations' && (
            <div className="space-y-5 text-left">
              <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#F4510B]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-black uppercase text-[#F4510B] tracking-wider">
                    Child Development Profile &amp; Radar Dimensions
                  </h3>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">
                    Record coach-observed habit ratings across 9 developmental dimensions for {currentStudent?.name}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    saveChildObservation({
                      childId: currentStudent.id,
                      dimensions: radarDimensions,
                      keyObservations: selectedKeyObservations,
                      coachNotes: formData.coachObservation,
                      coachId: coachProfile.id,
                      coachName: coachProfile.name,
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-[#F4510B] hover:bg-[#d44307] text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#F4510B]/20 transition-all cursor-pointer shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save to Development Profile</span>
                </button>
              </div>

              {/* 9 Dimensions Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {RADAR_DIMENSIONS.map((dim) => {
                  const val = radarDimensions[dim.key] ?? 75;
                  return (
                    <div key={dim.key} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between text-xs font-black text-[#172B50]">
                        <span>{dim.label}</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#FFF4E8] text-[#F4510B] font-black border border-[#F4510B]/20">
                          {val}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        step="5"
                        value={val}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setRadarDimensions((prev) => ({ ...prev, [dim.key]: v }));
                        }}
                        className="w-full accent-[#F4510B] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] font-bold text-slate-400">
                        <span>Emerging (20%)</span>
                        <span>Proficient (80%)</span>
                        <span>Mastery (100%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Key Observations Checklist */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <span className="text-xs font-black uppercase text-[#172B50] tracking-wider block">
                  Observed Habit Badges &amp; Checklist
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Good balance and body control',
                    'Improved coordination and agility',
                    'Shows great teamwork',
                    'Needs a little more endurance',
                    'Quick reaction to audio cues',
                    'Maintains focus during coach demonstrations',
                  ].map((obsText) => {
                    const isChecked = selectedKeyObservations.includes(obsText);
                    return (
                      <label
                        key={obsText}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isChecked ? 'bg-[#FFF4E8] border-[#F4510B] text-[#172B50]' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedKeyObservations(selectedKeyObservations.filter((o) => o !== obsText));
                            } else {
                              setSelectedKeyObservations([...selectedKeyObservations, obsText]);
                            }
                          }}
                          className="accent-[#F4510B] w-4 h-4 rounded"
                        />
                        <span>{obsText}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Coach Summary Comments */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <label className="text-xs font-black uppercase text-[#172B50] tracking-wider block">
                  Detailed Coach Observations (Visible to Parent after approval)
                </label>
                <textarea
                  rows={3}
                  value={formData.coachObservation}
                  onChange={(e) => setFormData({ ...formData, coachObservation: e.target.value })}
                  placeholder="Record qualitative feedback, movement mechanics, and social cooperation notes..."
                  className="w-full p-3 text-xs bg-slate-50 text-[#172B50] font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#F4510B] focus:bg-white resize-none"
                />
              </div>
            </div>
          )}

          {/* SUB-TAB: SUBMISSIONS QUEUE */}
          {activeSubTab === 'submissions' && (
            <div className="space-y-4 text-left">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase text-[#172B50]/70 tracking-wider">
                    Verification Pipeline for {currentStudent?.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Track the live review status of badges and milestones submitted to Super Coach.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#172B50] text-white text-xs font-black">
                  {studentSubmissions.length} Submissions
                </span>
              </div>

              {studentSubmissions.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                  No submissions yet for {currentStudent?.name}. Use the &quot;Skill Badges &amp; Milestones&quot; tab to submit achievements!
                </div>
              ) : (
                <div className="space-y-3">
                  {studentSubmissions.map((sub) => {
                    const isPending = sub.status === 'Pending Super Coach Review' || sub.status === 'Pending';
                    const isApproved = sub.status === 'Approved & Published' || sub.status === 'Approved';
                    const isReturned = sub.status === 'Returned for Correction' || sub.status === 'Returned';

                    return (
                      <div
                        key={sub.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isPending
                            ? 'bg-amber-50/60 border-amber-200'
                            : isApproved
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : isReturned
                            ? 'bg-red-50/60 border-red-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-black/5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#172B50] text-white">
                              {sub.type === 'badge' ? 'Badge Achievement' : 'Milestone'}
                            </span>
                            <h5 className="text-xs font-black text-[#172B50]">
                              {sub.type === 'badge' ? sub.badgeName : sub.milestoneTitle}
                            </h5>
                          </div>

                          <span
                            className={`text-[10.5px] font-black px-2.5 py-0.5 rounded-full border ${
                              isPending
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : isApproved
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : isReturned
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>

                        <p className="text-xs font-medium text-slate-700 mt-2">
                          <span className="font-bold">Coach Evidence:</span> {sub.evidenceNotes}
                        </p>

                        {/* Audit / Reviewer Remarks */}
                        {sub.reviewNotes && (
                          <div className="mt-2 p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                            <span className="font-black text-[#172B50]">Super Coach Remarks:</span>{' '}
                            <span className="text-slate-600 italic">&quot;{sub.reviewNotes}&quot;</span>
                            {sub.reviewedBy && (
                              <span className="text-[10px] font-bold text-slate-400 block mt-1">
                                Reviewed by {sub.reviewedBy}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-400 mt-3 pt-2 border-t border-black/5">
                          <span>Session Date: {sub.sessionDate}</span>
                          <span>Coach: {sub.coachName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 3: FOCUS & PLAN */}
          {activeSubTab === 'plan' && (
            <div className="space-y-4 text-left">
              <div className="p-4 rounded-xl bg-[#FFF4E8]/50 border border-[#F4510B]/20 space-y-3">
                <h3 className="text-xs font-black uppercase text-[#172B50]/70 tracking-wider">Quarter Milestone &amp; Progression Plan</h3>
                <div>
                  <label className="text-xs font-bold text-[#172B50] block mb-1">Next Session Drills</label>
                  <textarea
                    rows={3}
                    value={formData.nextSessionFocus}
                    onChange={(e) => setFormData({ ...formData, nextSessionFocus: e.target.value })}
                    className="w-full p-3 text-xs bg-white text-[#172B50] rounded-xl border border-[#172B50]/15"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#172B50] block mb-1">Target Skill Area</label>
                    <input
                      type="text"
                      value="Dynamic Balance & Multi-directional agility"
                      disabled
                      className="w-full px-3 py-2 text-xs bg-white text-[#172B50] rounded-xl border border-[#172B50]/15"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#172B50] block mb-1">Recommended Equipment</label>
                    <input
                      type="text"
                      value="Balance beam, cones, soft agility rings"
                      disabled
                      className="w-full px-3 py-2 text-xs bg-white text-[#172B50] rounded-xl border border-[#172B50]/15"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 4: PREVIOUS EVALUATIONS */}
          {activeSubTab === 'previous' && (
            <div className="space-y-3 text-left">
              <div className="p-3.5 rounded-xl bg-white border border-[#172B50]/12 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#172B50]">Quarter 3 (Jul – Sep 2026) Evaluation</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Approved</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center pt-1">
                  <div className="p-2 rounded-lg bg-[#FFF4E8]/60">
                    <div className="text-[10px] font-bold text-[#172B50]/60">Balance</div>
                    <div className="text-xs font-black text-[#F4510B]">3 / 5</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FFF4E8]/60">
                    <div className="text-[10px] font-bold text-[#172B50]/60">Jumping</div>
                    <div className="text-xs font-black text-[#F4510B]">3 / 5</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FFF4E8]/60">
                    <div className="text-[10px] font-bold text-[#172B50]/60">Throwing</div>
                    <div className="text-xs font-black text-[#F4510B]">4 / 5</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FFF4E8]/60">
                    <div className="text-[10px] font-bold text-[#172B50]/60">Running</div>
                    <div className="text-xs font-black text-[#F4510B]">3 / 5</div>
                  </div>
                </div>
                <p className="text-[11px] text-[#172B50]/70 italic mt-1">
                  "Progressing nicely from initial orientation. Good basic movement coordination."
                </p>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 5. BOTTOM ACTION BAR: Save as Draft | Submit for Review     */}
          {/* ============================================================ */}
          <div className="pt-4 border-t border-[#172B50]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Save as Draft */}
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#172B50]/25 text-xs font-black text-[#172B50] hover:bg-[#FFF4E8] transition-all cursor-pointer shadow-2xs"
            >
              <Save className="w-4 h-4 text-[#172B50]" />
              <span>Save as Draft</span>
            </button>

            {/* Submit for Review + Subtext */}
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#F4510B] text-white text-xs font-black hover:brightness-110 shadow-md shadow-[#F4510B]/30 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 text-white" />
                <span>Submit for Review</span>
              </button>
              <span className="text-[10px] font-bold text-[#172B50]/55">
                This evaluation will be sent to the Super Coach for review and approval.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: CONFIRM SUBMISSION FOR SUPER COACH REVIEW             */}
      {/* ============================================================ */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Child Evaluation"
        subtitle={`Submit evaluation for ${currentStudent?.name} to Super Coach review pipeline`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-left">
          <div className="p-3.5 rounded-xl bg-[#FFF4E8] border border-[#F4510B]/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172B50]/70">Athlete:</span>
              <span className="text-xs font-black text-[#172B50]">{currentStudent?.name} ({currentStudent?.rollNo || 'LS001'})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172B50]/70">Location &amp; Batch:</span>
              <span className="text-xs font-black text-[#172B50]">{selectedLocation} · {selectedBatch}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172B50]/70">Evaluation Cycle:</span>
              <span className="text-xs font-black text-[#172B50]">{selectedCycle}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#172B50]/10 pt-2">
              <span className="text-xs font-bold text-[#172B50]/70">Average Rating:</span>
              <span className="text-sm font-black text-[#F4510B]">
                {((formData.balanceRating + formData.jumpingRating + formData.throwingRating + formData.runningRating) / 4).toFixed(1)} / 5
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
            Once submitted, this evaluation will appear in Super Coach <strong>Evaluation Review → Pending Reviews</strong>. You can view or revise it if returned.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              className="px-5 py-2 text-xs font-black bg-[#F4510B] text-white rounded-xl shadow-md hover:brightness-110 cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confirm &amp; Submit</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL: SUBMIT BADGE ACHIEVEMENT FOR SUPER COACH VERIFICATION */}
      {/* ============================================================ */}
      {isBadgeSubmitModalOpen && selectedBadgeToSubmit && (
        <Modal
          isOpen={isBadgeSubmitModalOpen}
          onClose={() => setIsBadgeSubmitModalOpen(false)}
          title={`Submit Badge Achievement – ${selectedBadgeToSubmit.name}`}
          subtitle={`Submit ${currentStudent?.name}'s skill achievement to Super Coach review pipeline`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-left p-1">
            <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#F4510B]/20 flex items-center gap-3">
              <DynamicBadgeIcon iconType={selectedBadgeToSubmit.iconType || 'star'} size={60} status="completed" />
              <div>
                <h4 className="text-sm font-black text-[#172B50]">{selectedBadgeToSubmit.name}</h4>
                <p className="text-xs font-bold text-slate-500">{selectedBadgeToSubmit.category} &bull; {selectedProgram}</p>
                <span className="text-[10px] font-black text-[#F4510B] uppercase">Athlete: {currentStudent?.name} ({currentStudent?.rollNo})</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-[#172B50] block mb-1">Scheduled Session Date *</label>
              <input
                type="date"
                value={badgeSessionDate}
                onChange={(e) => setBadgeSessionDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 text-[#172B50] font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-[#F4510B]"
              />
            </div>

            <div>
              <label className="text-xs font-black text-[#172B50] block mb-1.5">What the Athlete Demonstrated *</label>
              <div className="space-y-1.5">
                {(selectedBadgeToSubmit.whatChildDid || [
                  `Demonstrated ${selectedBadgeToSubmit.name} mechanics smoothly`,
                  'Completed 3 consecutive drill reps without fault',
                  'Exceeded minimum balance/coordination criteria',
                ]).map((item, idx) => (
                  <label key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-[#F4510B] w-4 h-4 rounded" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-[#172B50] block mb-1">Supporting Coach Observations &amp; Evidence *</label>
              <textarea
                rows={3}
                value={badgeEvidenceNotes}
                onChange={(e) => setBadgeEvidenceNotes(e.target.value)}
                placeholder="Describe how the child met all rubric requirements during today's training session..."
                className="w-full p-3 text-xs bg-slate-50 text-[#172B50] font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#F4510B] resize-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 leading-snug">
              <strong>Super Coach Verification Rule:</strong> Once submitted, this badge achievement will be reviewed by Super Coach before becoming visible to parents.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBadgeSubmitModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  submitChildBadgeAchievement({
                    childId: currentStudent.id,
                    badgeId: selectedBadgeToSubmit.badgeId,
                    badgeName: selectedBadgeToSubmit.name,
                    category: selectedBadgeToSubmit.category,
                    sessionDate: badgeSessionDate,
                    evidenceNotes: badgeEvidenceNotes,
                    whatChildDemonstrated: selectedBadgeToSubmit.whatChildDid || [],
                    coachId: coachProfile.id,
                    coachName: coachProfile.name,
                    location: selectedLocation,
                    program: selectedProgram,
                    batch: selectedBatch,
                  });
                  setIsBadgeSubmitModalOpen(false);
                }}
                className="px-5 py-2 text-xs font-black bg-[#F4510B] text-white rounded-xl shadow-md hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Badge for Verification</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* MODAL: SUBMIT MILESTONE FOR SUPER COACH VERIFICATION         */}
      {/* ============================================================ */}
      {isMilestoneSubmitModalOpen && selectedMilestoneToSubmit && (
        <Modal
          isOpen={isMilestoneSubmitModalOpen}
          onClose={() => setIsMilestoneSubmitModalOpen(false)}
          title={`Submit Milestone – ${selectedMilestoneToSubmit.title}`}
          subtitle={`Submit ${currentStudent?.name}'s milestone checkpoint to Super Coach review pipeline`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-left p-1">
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#172B50]">{selectedMilestoneToSubmit.title}</h4>
                <p className="text-xs font-bold text-slate-500">{selectedMilestoneToSubmit.category} &bull; {selectedProgram}</p>
                <span className="text-[10px] font-black text-purple-700 uppercase">Athlete: {currentStudent?.name} ({currentStudent?.rollNo})</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-[#172B50] block mb-1">Session / Achievement Date *</label>
              <input
                type="date"
                value={milestoneSessionDate}
                onChange={(e) => setMilestoneSessionDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 text-[#172B50] font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-[#F4510B]"
              />
            </div>

            <div>
              <label className="text-xs font-black text-[#172B50] block mb-1">Milestone Description &amp; Evidence *</label>
              <textarea
                rows={3}
                value={milestoneEvidenceNotes}
                onChange={(e) => setMilestoneEvidenceNotes(e.target.value)}
                placeholder="Detail the training session dedication, drill mastery, or attendance milestone met..."
                className="w-full p-3 text-xs bg-slate-50 text-[#172B50] font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#F4510B] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMilestoneSubmitModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  submitChildMilestone({
                    childId: currentStudent.id,
                    milestoneId: selectedMilestoneToSubmit.id,
                    milestoneTitle: selectedMilestoneToSubmit.title,
                    category: selectedMilestoneToSubmit.category,
                    sessionDate: milestoneSessionDate,
                    evidenceNotes: milestoneEvidenceNotes,
                    coachId: coachProfile.id,
                    coachName: coachProfile.name,
                    location: selectedLocation,
                    program: selectedProgram,
                    batch: selectedBatch,
                  });
                  setIsMilestoneSubmitModalOpen(false);
                }}
                className="px-5 py-2 text-xs font-black bg-[#F4510B] text-white rounded-xl shadow-md hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Milestone for Verification</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. EVALUATION HISTORY TABLE (WHEN HISTORY TAB IS SELECTED)   */}
      {/* ============================================================ */}
      {activeModuleTab === 'history' && (
        <div className="mt-6 bg-white rounded-2xl border border-[#172B50]/12 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#172B50]">Coach Evaluation History</h3>
            <span className="text-xs font-bold text-[#172B50]/60">Total: {coachEvaluationsList.length}</span>
          </div>
          {coachEvaluationsList.length === 0 ? (
            <div className="py-8 text-center text-xs font-bold text-[#172B50]/50">
              No historical evaluations submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#172B50]/10 text-[11px] font-black uppercase text-[#172B50]/60">
                    <th className="py-2.5 px-3">Child</th>
                    <th className="py-2.5 px-3">Location &amp; Batch</th>
                    <th className="py-2.5 px-3">Cycle</th>
                    <th className="py-2.5 px-3">Overall Rating</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B50]/8 font-medium">
                  {coachEvaluationsList.map(ev => {
                    const badge = getStatusBadge(ev.status);
                    return (
                      <tr key={ev.id} className="hover:bg-[#FFF4E8]/30">
                        <td className="py-2.5 px-3 font-black text-[#172B50]">{ev.studentName}</td>
                        <td className="py-2.5 px-3">{ev.location} · {ev.batch}</td>
                        <td className="py-2.5 px-3">{ev.cycle || 'Quarter 4 2026'}</td>
                        <td className="py-2.5 px-3 font-bold text-[#F4510B]">{ev.overallRating} / 5</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#172B50]/60">{ev.submittedAt || ev.updatedAt || 'Recent'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. RETURNED EVALUATIONS TAB (IF RETURNED SELECTED)           */}
      {/* ============================================================ */}
      {activeModuleTab === 'returned' && (
        <div className="mt-6 bg-white rounded-2xl border border-[#172B50]/12 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#172B50]">Returned Evaluations for Revision</h3>
            <span className="text-xs font-bold text-[#EF4444] font-black">Needs Action: {returnedEvaluationsList.length}</span>
          </div>
          {returnedEvaluationsList.length === 0 ? (
            <div className="py-8 text-center text-xs font-bold text-[#172B50]/50">
              No returned evaluations. All submissions are in good standing!
            </div>
          ) : (
            <div className="space-y-3">
              {returnedEvaluationsList.map(ev => (
                <div key={ev.id} className="p-4 rounded-xl border border-red-200 bg-red-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#172B50]">{ev.studentName}</span>
                      <span className="text-xs text-[#172B50]/60">({ev.location} · {ev.batch})</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700">Returned</span>
                    </div>
                    <p className="text-xs font-bold text-red-800 mt-1">
                      Reason: {ev.returnReason || 'Revision requested by Super Coach.'}
                    </p>
                    {ev.superCoachNotes && (
                      <p className="text-xs text-[#172B50]/70 italic mt-0.5">"{ev.superCoachNotes}"</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(ev.studentId);
                      setActiveModuleTab('evaluating');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#F4510B] text-white text-xs font-black shadow-xs hover:brightness-110 cursor-pointer shrink-0"
                  >
                    Edit &amp; Resubmit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}