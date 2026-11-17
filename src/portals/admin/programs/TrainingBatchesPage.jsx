import React, { useMemo, useState } from 'react';
import {
  Users,
  Plus,
  MapPin,
  Edit3,
  Power,
  Trash2,
  UserPlus,
  UserMinus,
  ArrowUpCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Armchair,
  ChevronDown,
} from 'lucide-react';
import { useCrm } from '../../../context/CrmContext';
import { getCommonLocations } from '../../../services/locationService';
import Modal from '../../../components/common/Modal';

export default function TrainingBatchesPage({ onNavigateModule }) {
  const {
    data,
    createBatch,
    updateBatch,
    toggleBatchStatus,
    deleteBatch,
    updateBatchEnrollment,
  } = useCrm();

  const activeLocations = getCommonLocations(data);
  const activePrograms = (data.programs || []).filter((p) => (p.status || 'Active') === 'Active');

  const [locationFilter, setLocationFilter] = useState('All');
  const [programFilter, setProgramFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Batch Create/Edit Modal
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [batchForm, setBatchForm] = useState({
    center: activeLocations[0]?.name || '',
    program: activePrograms[0]?.name || '',
    name: '',
    ageGroup: '',
    level: 'Beginner',
    capacity: '20',
    coachId: '',
    schedule: 'Mon, Wed, Fri • 4:30 PM - 5:30 PM',
    status: 'Active',
  });

  // Roster & Waitlist Modal
  const [managingBatchId, setManagingBatchId] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');

  const filteredBatches = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return (data.classes || []).filter((cls) => {
      const cStatus = cls.status || 'Active';
      const matchesLocation = locationFilter === 'All' || cls.center === locationFilter;
      const matchesProgram = programFilter === 'All' || cls.program === programFilter;
      const matchesStatus = statusFilter === 'All' || cStatus === statusFilter;
      const matchesSearch =
        !q ||
        cls.name?.toLowerCase().includes(q) ||
        cls.program?.toLowerCase().includes(q) ||
        cls.coach?.toLowerCase().includes(q);
      return matchesLocation && matchesProgram && matchesStatus && matchesSearch;
    });
  }, [data.classes, locationFilter, programFilter, statusFilter, searchTerm]);

  const managingBatch = useMemo(
    () => (data.classes || []).find((c) => c.id === managingBatchId) || null,
    [data.classes, managingBatchId]
  );

  // Strict location hierarchy helper: students eligible for a batch must match its centre
  const locationStudentsForModal = useMemo(() => {
    if (!managingBatch) return [];
    const q = studentSearch.trim().toLowerCase();
    return (data.students || []).filter((s) => {
      const matchesCentre = s.center === managingBatch.center;
      const matchesQuery =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.id?.toLowerCase().includes(q) ||
        s.program?.toLowerCase().includes(q);
      return matchesCentre && matchesQuery;
    });
  }, [data.students, managingBatch, studentSearch]);

  const openCreateModal = () => {
    const defaultLoc = locationFilter !== 'All' ? locationFilter : activeLocations[0]?.name || '';
    const defaultProgObj =
      (programFilter !== 'All'
        ? activePrograms.find((p) => p.name === programFilter)
        : activePrograms[0]) || null;

    setEditingBatch(null);
    setBatchForm({
      center: defaultLoc,
      program: defaultProgObj?.name || '',
      name: '',
      ageGroup: defaultProgObj?.ageGroup || '5 - 10 Yrs',
      level: 'Beginner',
      capacity: '20',
      coachId: '',
      schedule: 'Mon, Wed, Fri • 4:30 PM - 5:30 PM',
      status: 'Active',
    });
    setIsBatchModalOpen(true);
  };

  const openEditModal = (batch) => {
    setEditingBatch(batch);
    setBatchForm({
      center: batch.center || activeLocations[0]?.name || '',
      program: batch.program || activePrograms[0]?.name || '',
      name: batch.name || '',
      ageGroup: batch.ageGroup || '',
      level: batch.level || 'Beginner',
      capacity: String(batch.capacity || 15),
      coachId: batch.coachId || '',
      schedule: batch.schedule || '',
      status: batch.status || 'Active',
    });
    setIsBatchModalOpen(true);
  };

  const handleProgramChangeInForm = (programName) => {
    const prog = activePrograms.find((p) => p.name === programName);
    setBatchForm((prev) => ({
      ...prev,
      program: programName,
      ageGroup: prev.ageGroup || prog?.ageGroup || '',
    }));
  };

  const handleSaveBatch = (e) => {
    e.preventDefault();
    if (editingBatch) {
      const selectedCoach = (data.coaches || []).find((c) => c.id === batchForm.coachId);
      const res = updateBatch(editingBatch.id, {
        ...batchForm,
        coach: selectedCoach?.name || editingBatch.coach || 'Unassigned',
      });
      if (res.success) setIsBatchModalOpen(false);
    } else {
      const res = createBatch(batchForm);
      if (res.success) setIsBatchModalOpen(false);
    }
  };

  // Helper to resolve enrolled & waitlisted student lists cleanly from state
  const getBatchRosterState = (batch) => {
    const locationStudents = (data.students || []).filter((s) => s.center === batch.center);
    const idSet = new Set(batch.enrolledStudentIds || []);
    locationStudents.forEach((s) => {
      if ((s.enrolledClasses || []).includes(batch.name)) {
        idSet.add(s.id);
      }
    });
    const enrolledStudents = locationStudents.filter((s) => idSet.has(s.id));
    const waitlistIds = (batch.waitlistStudentIds || []).filter((sid) => !idSet.has(sid));
    const waitlistStudents = locationStudents.filter((s) => waitlistIds.includes(s.id));
    return {
      enrolledIds: enrolledStudents.map((s) => s.id),
      waitlistIds: waitlistStudents.map((s) => s.id),
      enrolledStudents,
      waitlistStudents,
    };
  };

  const handleEnrollOrWaitlist = (studentId) => {
    if (!managingBatch) return;
    const { enrolledIds, waitlistIds } = getBatchRosterState(managingBatch);
    if (enrolledIds.includes(studentId) || waitlistIds.includes(studentId)) return;

    if (enrolledIds.length < managingBatch.capacity) {
      updateBatchEnrollment(managingBatch.id, {
        enrolledStudentIds: [...enrolledIds, studentId],
        waitlistStudentIds: waitlistIds,
      });
    } else {
      updateBatchEnrollment(managingBatch.id, {
        enrolledStudentIds: enrolledIds,
        waitlistStudentIds: [...waitlistIds, studentId],
      });
    }
  };

  const handleRemoveStudent = (studentId, fromWaitlist = false) => {
    if (!managingBatch) return;
    const { enrolledIds, waitlistIds } = getBatchRosterState(managingBatch);
    if (fromWaitlist) {
      updateBatchEnrollment(managingBatch.id, {
        enrolledStudentIds: enrolledIds,
        waitlistStudentIds: waitlistIds.filter((id) => id !== studentId),
      });
    } else {
      updateBatchEnrollment(managingBatch.id, {
        enrolledStudentIds: enrolledIds.filter((id) => id !== studentId),
        waitlistStudentIds: waitlistIds,
      });
    }
  };

  const handlePromoteFromWaitlist = (studentId) => {
    if (!managingBatch) return;
    const { enrolledIds, waitlistIds } = getBatchRosterState(managingBatch);
    if (enrolledIds.length >= managingBatch.capacity) return;
    updateBatchEnrollment(managingBatch.id, {
      enrolledStudentIds: [...enrolledIds, studentId],
      waitlistStudentIds: waitlistIds.filter((id) => id !== studentId),
    });
  };

  const totalSlots = (data.classes || []).reduce((sum, b) => sum + (b.capacity || 20), 0);
  const totalEnrolled = (data.classes || []).reduce(
    (sum, b) => sum + getBatchRosterState(b).enrolledIds.length,
    0
  );

  const locationsCount = activeLocations.length > 0 ? activeLocations.length : 4;
  const batchesCount = (data.classes && data.classes.length > 0) ? data.classes.length : 12;
  const enrolledStudentsCount =
    totalEnrolled > 0
      ? totalEnrolled
      : (data.students && data.students.length > 0)
      ? data.students.length
      : 248;
  const availableSlotsCount =
    totalSlots > 0
      ? Math.max(0, totalSlots - totalEnrolled)
      : (batchesCount * 20 > 0 ? batchesCount * 20 : 240);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Four Horizontally Aligned Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1 – Total Locations */}
        <div className="bg-white rounded-2xl border border-[#172B5014] p-4 sm:p-5 shadow-xs flex items-center gap-3.5 transition-all hover:border-[#F4510B]/30">
          <div className="w-12 h-12 rounded-full bg-[#FFF0E6] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-[#F4510B]" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-[#172B50]/65 block">
              Total Locations
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#172B50] leading-tight block mt-0.5">
              {locationsCount}
            </span>
          </div>
        </div>

        {/* Card 2 – Total Batches */}
        <div className="bg-white rounded-2xl border border-[#172B5014] p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3 transition-all hover:border-[#F4510B]/30">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#FFF0E6] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-[#F4510B]" />
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-[#172B50]/65 block">
                Total Batches
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#172B50] leading-tight block mt-0.5">
                {batchesCount}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F8EE] text-[#16A34A] shrink-0">
            ↑ +2
          </span>
        </div>

        {/* Card 3 – Enrolled Students */}
        <div className="bg-white rounded-2xl border border-[#172B5014] p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3 transition-all hover:border-emerald-300">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#E8F8EE] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#16A34A]" />
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-[#172B50]/65 block">
                Enrolled Students
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#172B50] leading-tight block mt-0.5">
                {enrolledStudentsCount}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F8EE] text-[#16A34A] shrink-0">
            ↑ +18
          </span>
        </div>

        {/* Card 4 – Available Slots */}
        <div className="bg-white rounded-2xl border border-[#172B5014] p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3 transition-all hover:border-sky-300">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#E8F4FD] flex items-center justify-center shrink-0">
              <Armchair className="w-5 h-5 text-[#0284C7]" />
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-[#172B50]/65 block">
                Available Slots
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#172B50] leading-tight block mt-0.5">
                {availableSlotsCount}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F4FD] text-[#0284C7] border border-[#0284C720] shrink-0">
            <Armchair className="w-3.5 h-3.5" /> 20 per Batch
          </span>
        </div>
      </div>

      {/* 2. Search & Sports Program Filter Bar in One Horizontal Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input: Search batch name, program, or coach... */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#172B50]/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search batch name, program, or coach..."
            className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm font-medium rounded-full border border-[#172B5018] bg-white text-[#172B50] placeholder:text-[#172B50]/40 focus:outline-none focus:border-[#F4510B] focus:ring-1 focus:ring-[#F4510B] shadow-2xs transition-all"
          />
        </div>

        {/* Sports Program dropdown: All Sports Programs */}
        <div className="relative shrink-0 sm:w-64">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
            <Layers className="w-4 h-4 text-[#F4510B]" />
          </div>
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="w-full appearance-none pl-11 pr-10 py-2.5 text-xs sm:text-sm font-bold rounded-full border border-[#172B5018] bg-white text-[#172B50] hover:border-[#F4510B]/50 focus:outline-none focus:border-[#F4510B] shadow-2xs transition-all cursor-pointer"
          >
            <option value="All">All Sports Programs</option>
            {(data.programs || []).map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[#172B50]/60 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 3. Training Batches Content / Empty State */}
      {filteredBatches.length === 0 ? (
        <div className="bg-white rounded-3xl sm:rounded-[32px] border border-[#172B5015] shadow-xs p-8 sm:p-14 relative overflow-hidden text-center min-h-[440px] flex flex-col items-center justify-center">
          {/* Subtle athletic decorative illustrations near bottom corner */}
          <div className="absolute right-6 sm:right-12 bottom-3 sm:bottom-4 opacity-20 pointer-events-none select-none hidden sm:block">
            <svg className="w-44 h-32 text-[#F4510B]" viewBox="0 0 160 120" fill="currentColor">
              <circle cx="50" cy="25" r="12" />
              <path d="M45 40 L35 70 L20 85 L25 90 L40 75 L48 55 L60 70 L75 80 L80 72 L65 62 L55 45 Z" />
              <path d="M40 45 L25 55 L20 50 L35 40 Z" />
              <path d="M50 45 L65 52 L75 48 L73 40 L62 45 Z" />
              <circle cx="110" cy="20" r="14" />
              <path d="M105 37 L92 68 L75 82 L80 88 L98 73 L108 52 L122 68 L138 78 L142 70 L128 60 L116 42 Z" />
              <path d="M100 42 L82 52 L78 46 L95 37 Z" />
              <path d="M112 42 L128 50 L140 45 L138 37 L125 42 Z" />
            </svg>
          </div>

          {/* Subtle warm cream wave along bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FFF4E8]/60 to-transparent pointer-events-none" />

          {/* Sports-Themed Clipboard & Equipment Graphic */}
          <div className="relative mb-5 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#FFF5ED] rounded-full blur-[2px] transform scale-110" />
            <svg 
              className="w-44 h-32 relative z-10 text-[#F4510B]" 
              viewBox="0 0 180 120" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Sparkles top right */}
              <path d="M128 22L134 16" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M138 30L145 28" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M134 38L140 40" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />

              {/* Soccer Ball on Left */}
              <g transform="translate(18, 52)">
                <circle cx="24" cy="24" r="22" fill="#FFFFFF" stroke="#172B50" strokeWidth="2.5" />
                <polygon points="24,14 32,20 29,29 19,29 16,20" fill="#172B50" />
                <line x1="24" y1="14" x2="24" y2="2" stroke="#172B50" strokeWidth="2" />
                <line x1="32" y1="20" x2="43" y2="15" stroke="#172B50" strokeWidth="2" />
                <line x1="29" y1="29" x2="38" y2="39" stroke="#172B50" strokeWidth="2" />
                <line x1="19" y1="29" x2="10" y2="39" stroke="#172B50" strokeWidth="2" />
                <line x1="16" y1="20" x2="5" y2="15" stroke="#172B50" strokeWidth="2" />
                <path d="M20 2 Q24 6 28 2 Z" fill="#172B50" />
                <path d="M41 12 Q41 18 45 20 Z" fill="#172B50" />
                <path d="M35 41 Q32 37 36 34 Z" fill="#172B50" />
                <path d="M13 41 Q16 37 12 34 Z" fill="#172B50" />
                <path d="M3 20 Q7 18 7 12 Z" fill="#172B50" />
              </g>

              {/* Training Cones on Right */}
              <g transform="translate(112, 60)">
                <path d="M26 12 L16 36 L36 36 Z" fill="#F4510B" opacity="0.85" />
                <ellipse cx="26" cy="36" rx="14" ry="4" fill="#E04000" />
                <ellipse cx="26" cy="38" rx="15" ry="4" fill="#F4510B" />
                <path d="M14 18 L6 40 L26 40 Z" fill="#FF7A38" />
                <ellipse cx="16" cy="40" rx="13" ry="4" fill="#F4510B" />
                <ellipse cx="16" cy="42" rx="14" ry="4" fill="#FF7A38" />
                <path d="M12 28 L19 28 L21 33 L10 33 Z" fill="#FFFFFF" opacity="0.9" />
              </g>

              {/* Clipboard in Center */}
              <g transform="translate(56, 12)">
                <rect x="10" y="16" width="46" height="62" rx="7" fill="#FFFFFF" stroke="#F4510B" strokeWidth="3" />
                <path d="M22 16V12C22 9.8 23.8 8 26 8H40C42.2 8 44 9.8 44 12V16" stroke="#F4510B" strokeWidth="3" strokeLinecap="round" />
                <circle cx="33" cy="12" r="2" fill="#F4510B" />
                <path d="M18 30L21.5 33.5L26 29" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="30" y1="31" x2="46" y2="31" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M18 42L21.5 45.5L26 41" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="30" y1="43" x2="42" y2="43" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M18 54L21.5 57.5L26 53" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="30" y1="55" x2="38" y2="55" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />

                <circle cx="44" cy="58" r="10" fill="#FFFFFF" stroke="#F4510B" strokeWidth="3" />
                <line x1="51.5" y1="65.5" x2="60" y2="74" stroke="#F4510B" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            </svg>
          </div>

          {/* Heading */}
          <h3 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight mb-2">
            No Training Batches Created Yet
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#172B50]/70 max-w-xl mx-auto mb-6 leading-relaxed">
            Click &ldquo;Create Training Batch&rdquo; to establish a batch under a Location &amp; Sports Program (Capacity: 20 students per batch).
          </p>

          {/* Orange CTA Button */}
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-7 py-3 bg-[#F4510B] hover:bg-[#d94103] active:scale-95 text-white font-bold text-sm rounded-full shadow-[0_4px_16px_rgba(244,81,11,0.35)] transition-all cursor-pointer relative z-10"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Training Batch</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBatches.map((batch) => {
            const roster = getBatchRosterState(batch);
            const capacity = batch.capacity || 15;
            const availableSlots = Math.max(0, capacity - roster.enrolledIds.length);
            const fillPct = Math.min(100, Math.round((roster.enrolledIds.length / capacity) * 100));
            const bStatus = batch.status || 'Active';

            return (
              <div
                key={batch.id}
                className={`bg-white rounded-2xl border p-5 shadow-card space-y-4 ${
                  bStatus === 'Inactive' ? 'border-slate-200 opacity-70' : 'border-[#172B5014]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B25]">
                        <MapPin className="w-2.5 h-2.5" /> {batch.center}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#172B500D] text-[#172B50]">
                        {batch.program}
                      </span>
                      {batch.ageGroup && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-[#172B50]">
                          {batch.ageGroup}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-[#172B50] mt-2">{batch.name}</h3>
                    <p className="text-xs text-[#172B50] opacity-70 mt-0.5">
                      Lead Coach: <strong className="text-[#172B50]">{batch.coach || 'Unassigned'}</strong> • Level: {batch.level || 'Beginner'}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      bStatus === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : bStatus === 'Paused'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {bStatus}
                  </span>
                </div>

                {/* Slot & Waitlist Bar */}
                <div className="bg-[#FFF4E8]/60 p-3.5 rounded-xl border border-[#172B500D] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#172B50]">
                    <span>
                      Enrolled: {roster.enrolledIds.length} / {capacity}
                    </span>
                    <span className={availableSlots === 0 ? 'text-rose-600' : 'text-emerald-700'}>
                      {availableSlots === 0 ? 'Batch Full' : `${availableSlots} slots open`}
                      {roster.waitlistIds.length > 0 && ` • ${roster.waitlistIds.length} waiting`}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-[#172B5010]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        fillPct >= 100 ? 'bg-rose-500' : fillPct >= 75 ? 'bg-amber-500' : 'bg-[#F4510B]'
                      }`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                  {roster.enrolledStudents.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {roster.enrolledStudents.slice(0, 5).map((st) => (
                        <span
                          key={st.id}
                          className="px-2 py-0.5 rounded-md bg-white text-[10px] font-semibold text-[#172B50] border border-[#172B5014]"
                        >
                          {st.name}
                        </span>
                      ))}
                      {roster.enrolledStudents.length > 5 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold text-[#F4510B]">
                          +{roster.enrolledStudents.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#172B5010]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setStudentSearch('');
                        setManagingBatchId(batch.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-extrabold bg-[#172B50] text-white hover:bg-[#F4510B] transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" /> Students
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(batch)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-[#FFF4E8] text-[#172B50] hover:bg-slate-200 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to remove batch "${batch.name}"?`)) {
                          deleteBatch(batch.id);
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 transition-colors cursor-pointer"
                      title="Remove Batch"
                    >
                      <Trash2 className="w-3 h-3 text-rose-600" /> Remove
                    </button>
                  </div>

                  {onNavigateModule && (
                    <button
                      type="button"
                      onClick={() => onNavigateModule('schedules')}
                      className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#F4510B] hover:underline cursor-pointer"
                    >
                      Schedules <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Batch Modal */}
      <Modal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        title={editingBatch ? `Edit Batch: ${editingBatch.name}` : 'Create Training Batch'}
        subtitle="Hierarchy: Academy Location → Sports Program → Training Batch"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveBatch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Academy Location *</label>
              <select
                required
                value={batchForm.center}
                onChange={(e) => setBatchForm({ ...batchForm, center: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              >
                <option value="">Select Location</option>
                {activeLocations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Sports Program *</label>
              <select
                required
                value={batchForm.program}
                onChange={(e) => handleProgramChangeInForm(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              >
                <option value="">Select Sports Program</option>
                {(data.programs || []).map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Batch Name *</label>
              <input
                type="text"
                required
                value={batchForm.name}
                onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                placeholder="e.g., KK Nagar Movers Evening A"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Age Group</label>
              <input
                type="text"
                value={batchForm.ageGroup}
                onChange={(e) => setBatchForm({ ...batchForm, ageGroup: e.target.value })}
                placeholder="e.g., 4 - 6 Yrs"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Max Capacity *</label>
              <input
                type="number"
                min="1"
                required
                value={batchForm.capacity}
                onChange={(e) => setBatchForm({ ...batchForm, capacity: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Skill Level</label>
              <select
                value={batchForm.level}
                onChange={(e) => setBatchForm({ ...batchForm, level: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Competitive">Competitive</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Status</label>
              <select
                value={batchForm.status}
                onChange={(e) => setBatchForm({ ...batchForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">Lead Coach (optional — can manage in Coach Assignments)</label>
            <select
              value={batchForm.coachId}
              onChange={(e) => setBatchForm({ ...batchForm, coachId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
            >
              <option value="">Assign later</option>
              {(data.coaches || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.center || 'Multi-centre'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#172B5014]">
            <button
              type="button"
              onClick={() => setIsBatchModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#F4510B] text-white hover:bg-[#d84306] cursor-pointer"
            >
              {editingBatch ? 'Save Batch' : 'Create Batch'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Manage Enrolled Students Modal */}
      <Modal
        isOpen={Boolean(managingBatch)}
        onClose={() => setManagingBatchId(null)}
        title={managingBatch ? `Students: ${managingBatch.name}` : 'Students'}
        subtitle={
          managingBatch
            ? `Showing athletes registered exclusively at ${managingBatch.center} • Capacity: ${managingBatch.capacity}`
            : ''
        }
        maxWidth="max-w-3xl"
      >
        {managingBatch && (() => {
          const roster = getBatchRosterState(managingBatch);
          const enrolledSet = new Set(roster.enrolledIds);
          const waitlistSet = new Set(roster.waitlistIds);
          const isFull = roster.enrolledIds.length >= managingBatch.capacity;
          const availableStudents = locationStudentsForModal.filter(
            (s) => !enrolledSet.has(s.id) && !waitlistSet.has(s.id)
          );

          return (
            <div className="space-y-5">
              {/* Enrolled & Waitlisted Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#FFF4E8]/70 p-4 rounded-2xl border border-[#172B5014] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-[#172B50] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Enrolled Athletes ({roster.enrolledStudents.length} / {managingBatch.capacity})
                    </h4>
                  </div>
                  {roster.enrolledStudents.length === 0 ? (
                    <p className="text-xs text-[#172B50] opacity-60 py-4 text-center">
                      No students enrolled in this batch yet.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {roster.enrolledStudents.map((st) => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#172B5012]"
                        >
                          <div>
                            <p className="text-xs font-bold text-[#172B50]">{st.name}</p>
                            <p className="text-[10px] text-[#172B50] opacity-60">{st.id} • Age {st.age || '-'}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveStudent(st.id, false)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <UserMinus className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2.5">
                  <h4 className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Waiting List ({roster.waitlistStudents.length})
                  </h4>
                  {roster.waitlistStudents.length === 0 ? (
                    <p className="text-xs text-amber-900 opacity-65 py-4 text-center">
                      Waiting list is empty.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {roster.waitlistStudents.map((st) => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-200"
                        >
                          <div>
                            <p className="text-xs font-bold text-[#172B50]">{st.name}</p>
                            <p className="text-[10px] text-[#172B50] opacity-60">{st.id}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {!isFull && (
                              <button
                                type="button"
                                onClick={() => handlePromoteFromWaitlist(st.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                              >
                                <ArrowUpCircle className="w-3 h-3" /> Promote
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveStudent(st.id, true)}
                              className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <UserMinus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Add Students from Same Location */}
              <div className="space-y-2.5 pt-2 border-t border-[#172B5014]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-extrabold text-[#172B50]">
                    Eligible Students at {managingBatch.center}
                  </h4>
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Filter students..."
                    className="px-3 py-1.5 text-xs rounded-xl border border-[#172B5020] text-[#172B50]"
                  />
                </div>
                {availableStudents.length === 0 ? (
                  <p className="text-xs text-[#172B50] opacity-65 py-3 bg-slate-50 rounded-xl text-center">
                    No unassigned students found at {managingBatch.center}. Add students under Student Directory for {managingBatch.center} first.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {availableStudents.map((st) => (
                      <div
                        key={st.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-[#172B5014] bg-white"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#172B50]">{st.name}</p>
                          <p className="text-[10px] text-[#172B50] opacity-65">
                            {st.program || 'Unassigned'} • {st.center}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleEnrollOrWaitlist(st.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer ${
                            isFull
                              ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                              : 'bg-[#F4510B] text-white hover:bg-[#d84306]'
                          }`}
                        >
                          <UserPlus className="w-3 h-3" />
                          {isFull ? 'Waitlist' : 'Enroll'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
