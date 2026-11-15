import React, { useMemo, useState } from 'react';
import {
  Users,
  Plus,
  MapPin,
  Edit3,
  Power,
  UserPlus,
  UserMinus,
  ArrowUpCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
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
    capacity: '15',
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
      capacity: '15',
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

  const totalSlots = filteredBatches.reduce((sum, b) => sum + (b.capacity || 0), 0);
  const totalEnrolled = filteredBatches.reduce((sum, b) => sum + getBatchRosterState(b).enrolledIds.length, 0);
  const totalWaitlist = filteredBatches.reduce((sum, b) => sum + getBatchRosterState(b).waitlistIds.length, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#172B5012] shadow-card">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F4510B]">
            <Layers className="w-3.5 h-3.5" /> Module 2 • Location → Program → Training Batch
          </div>
          <h2 className="text-xl font-extrabold text-[#172B50] tracking-tight mt-0.5">
            Training Batches, Capacities & Waitlists
          </h2>
          <p className="text-xs text-[#172B50] opacity-70 mt-0.5">
            Create location-scoped batches under each Sports Program, monitor available slots, enroll students, and manage waiting lists.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F4510B] text-white text-xs font-extrabold shadow-sm hover:bg-[#d84306] transition-all cursor-pointer self-start lg:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Training Batch
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#172B5012] shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#172B50] opacity-60">Matching Batches</p>
          <p className="text-2xl font-extrabold text-[#172B50] mt-1">{filteredBatches.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#172B5012] shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#172B50] opacity-60">Enrolled Students</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{totalEnrolled}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#172B5012] shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#172B50] opacity-60">Available Slots</p>
          <p className="text-2xl font-extrabold text-[#F4510B] mt-1">{Math.max(0, totalSlots - totalEnrolled)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#172B5012] shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#172B50] opacity-60">Waitlisted Athletes</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{totalWaitlist}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#172B5012] shadow-card flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[210px]">
          <Search className="w-4 h-4 text-[#172B50] opacity-40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search batch name, program, or coach..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#172B501A] bg-[#FFF4E8]/40 text-[#172B50] focus:outline-none focus:border-[#F4510B]"
          />
        </div>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="px-3 py-2 text-xs font-bold rounded-xl border border-[#172B501A] bg-[#FFF4E8] text-[#172B50]"
        >
          <option value="All">All Locations</option>
          {activeLocations.map((loc) => (
            <option key={loc.id} value={loc.name}>
              {loc.name}
            </option>
          ))}
        </select>

        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="px-3 py-2 text-xs font-bold rounded-xl border border-[#172B501A] bg-[#FFF4E8] text-[#172B50]"
        >
          <option value="All">All Sports Programs</option>
          {(data.programs || []).map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 bg-[#FFF4E8] p-1 rounded-xl border border-[#172B5014]">
          {['All', 'Active', 'Paused', 'Inactive'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === st ? 'bg-[#172B50] text-white' : 'text-[#172B50] opacity-75'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Batches List */}
      {filteredBatches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#172B5026] p-10 text-center">
          <Users className="w-10 h-10 text-[#F4510B] opacity-60 mx-auto mb-2" />
          <h3 className="text-sm font-extrabold text-[#172B50]">No Training Batches Created Yet</h3>
          <p className="text-xs text-[#172B50] opacity-65 mt-1">
            Click &ldquo;Create Training Batch&rdquo; to establish a batch under a Location & Sports Program, then assign students and schedules.
          </p>
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
                      <Users className="w-3.5 h-3.5" /> Students & Waitlist
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
                      onClick={() => toggleBatchStatus(batch.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 cursor-pointer"
                    >
                      <Power className="w-3 h-3" /> {bStatus === 'Inactive' ? 'Activate' : 'Deactivate'}
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

      {/* Manage Enrolled Students & Waitlist Modal */}
      <Modal
        isOpen={Boolean(managingBatch)}
        onClose={() => setManagingBatchId(null)}
        title={managingBatch ? `Roster & Waitlist: ${managingBatch.name}` : 'Roster'}
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
