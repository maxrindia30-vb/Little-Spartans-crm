import React, { useMemo, useState } from 'react';
import {
  Trophy,
  Plus,
  MapPin,
  Edit3,
  Power,
  Clock,
  Users,
  Search,
  CheckCircle2,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useCrm } from '../../../context/CrmContext';
import { getCommonLocations } from '../../../services/locationService';
import Modal from '../../../components/common/Modal';

const PROGRAM_PRESETS = [
  { name: 'Little Strikers', ageGroup: '4 - 6 Yrs', duration: '45 mins', icon: '⚽', eligibility: 'Beginners & early motor skills' },
  { name: 'Movers', ageGroup: '3 - 5 Yrs', duration: '45 mins', icon: '🏃', eligibility: 'Foundational balance & movement' },
  { name: 'Teamers', ageGroup: '6 - 8 Yrs', duration: '60 mins', icon: '🤝', eligibility: 'Team coordination & ball skills' },
  { name: 'Gamers', ageGroup: '8 - 12 Yrs', duration: '60 mins', icon: '🎯', eligibility: 'Competitive game tactics' },
  { name: 'Professional Gymnastics', ageGroup: '6 - 16 Yrs', duration: '90 mins', icon: '🤸', eligibility: 'Coach assessment required' },
  { name: 'Mighty Strikers', ageGroup: '7 - 10 Yrs', duration: '60 mins', icon: '⚡', eligibility: 'Intermediate agility & drills' },
  { name: 'Mixed Age Group', ageGroup: '4 - 12 Yrs', duration: '60 mins', icon: '🌟', eligibility: 'Open centre cohort' },
  { name: 'Little Graspers', ageGroup: '2 - 3.5 Yrs', duration: '40 mins', icon: '🧸', eligibility: 'Toddlers gymnastics & grip' },
  { name: 'Multi-sports Program', ageGroup: '5 - 12 Yrs', duration: '60 mins', icon: '🏅', eligibility: 'All-round athletic development' },
];

export default function SportsProgramsPage({ onNavigateModule }) {
  const {
    data,
    addProgram,
    updateProgram,
    toggleProgramStatus,
    addLocation,
    updateLocation,
    toggleLocationStatus,
  } = useCrm();

  const allLocations = getCommonLocations(data, { includeInactive: true });
  const activeLocations = allLocations.filter((l) => l.status !== 'Inactive');

  const [locationFilter, setLocationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Program Modal State
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [programForm, setProgramForm] = useState({
    name: '',
    description: '',
    ageGroup: '5 - 10 Yrs',
    duration: '60 mins / session',
    feeMonthly: '3500',
    eligibility: 'Open enrollment',
    locations: [],
    icon: '🏆',
    status: 'Active',
  });

  // Location Manager Modal State
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationForm, setLocationForm] = useState({
    name: '',
    city: 'Chennai',
    address: '',
    courts: 'Main Arena, Floor Zone',
    status: 'Active',
  });

  const filteredPrograms = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return (data.programs || []).filter((p) => {
      const pStatus = p.status || 'Active';
      const matchesStatus = statusFilter === 'All' || pStatus === statusFilter;
      const matchesLoc =
        locationFilter === 'All' ||
        !p.locations ||
        p.locations.length === 0 ||
        p.locations.includes(locationFilter);
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.ageGroup?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);
      return matchesStatus && matchesLoc && matchesSearch;
    });
  }, [data.programs, locationFilter, statusFilter, searchTerm]);

  const openAddProgramModal = (preset = null) => {
    setEditingProgram(null);
    setProgramForm({
      name: preset?.name || '',
      description: preset ? `${preset.name} structured curriculum focusing on ${preset.eligibility.toLowerCase()}.` : '',
      ageGroup: preset?.ageGroup || '5 - 10 Yrs',
      duration: preset?.duration || '60 mins / session',
      feeMonthly: '3500',
      eligibility: preset?.eligibility || 'Open enrollment',
      locations: locationFilter !== 'All' ? [locationFilter] : activeLocations.map((l) => l.name),
      icon: preset?.icon || '🏆',
      status: 'Active',
    });
    setIsProgramModalOpen(true);
  };

  const openEditProgramModal = (program) => {
    setEditingProgram(program);
    setProgramForm({
      name: program.name || '',
      description: program.description || '',
      ageGroup: program.ageGroup || '',
      duration: program.duration || '60 mins / session',
      feeMonthly: String(program.feeMonthly || 0),
      eligibility: program.eligibility || 'Open enrollment',
      locations: Array.isArray(program.locations) ? program.locations : [],
      icon: program.icon || '🏆',
      status: program.status || 'Active',
    });
    setIsProgramModalOpen(true);
  };

  const handleToggleProgramLocation = (locName) => {
    setProgramForm((prev) => ({
      ...prev,
      locations: prev.locations.includes(locName)
        ? prev.locations.filter((l) => l !== locName)
        : [...prev.locations, locName],
    }));
  };

  const handleSaveProgram = (e) => {
    e.preventDefault();
    if (editingProgram) {
      const res = updateProgram(editingProgram.id, programForm);
      if (res.success) setIsProgramModalOpen(false);
    } else {
      const res = addProgram(programForm);
      if (res.success) setIsProgramModalOpen(false);
    }
  };

  const openLocationEditor = (loc = null) => {
    if (loc) {
      setEditingLocation(loc);
      setLocationForm({
        name: loc.name,
        city: loc.city || 'Chennai',
        address: loc.address || '',
        courts: (loc.courts || []).join(', '),
        status: loc.status || 'Active',
      });
    } else {
      setEditingLocation(null);
      setLocationForm({
        name: '',
        city: 'Chennai',
        address: '',
        courts: 'Arena Court 1, Turf Zone',
        status: 'Active',
      });
    }
  };

  const handleSaveLocation = (e) => {
    e.preventDefault();
    if (editingLocation) {
      const res = updateLocation(editingLocation.id, locationForm);
      if (res.success) openLocationEditor(null);
    } else {
      const res = addLocation(locationForm);
      if (res.success) openLocationEditor(null);
    }
  };

  const activeProgramsCount = (data.programs || []).filter((p) => (p.status || 'Active') === 'Active').length;
  const existingProgramNames = new Set((data.programs || []).map((p) => p.name.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#172B5012] shadow-card">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F4510B]">
            <Trophy className="w-3.5 h-3.5" /> Module 1 • Curriculum & Academy Centres
          </div>
          <h2 className="text-xl font-extrabold text-[#172B50] tracking-tight mt-0.5">
            Sports Programs & Academy Locations
          </h2>
          <p className="text-xs text-[#172B50] opacity-70 mt-0.5">
            Create sports programs, define eligibility & age groups, and manage active academy locations dynamically.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              openLocationEditor(null);
              setIsLocationModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFF4E8] text-[#172B50] border border-[#172B501F] text-xs font-extrabold hover:border-[#F4510B] hover:text-[#F4510B] transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-[#F4510B]" />
            Manage Locations ({activeLocations.length} Active)
          </button>
          <button
            type="button"
            onClick={() => openAddProgramModal(null)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F4510B] text-white text-xs font-extrabold shadow-sm hover:bg-[#d84306] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Sports Program
          </button>
        </div>
      </div>

      {/* Hierarchy / Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#172B5012] shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#172B50] opacity-60">Active Locations</p>
          <p className="text-2xl font-extrabold text-[#172B50] mt-1">{activeLocations.length}</p>
          <p className="text-[11px] text-[#172B50] opacity-65 mt-0.5">{allLocations.length} total configured</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#172B5012] shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#172B50] opacity-60">Sports Programs</p>
          <p className="text-2xl font-extrabold text-[#F4510B] mt-1">{activeProgramsCount}</p>
          <p className="text-[11px] text-[#172B50] opacity-65 mt-0.5">{(data.programs || []).length} total in catalog</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#172B5012] shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#172B50] opacity-60">Training Batches</p>
          <p className="text-2xl font-extrabold text-[#172B50] mt-1">{(data.classes || []).length}</p>
          <p className="text-[11px] text-[#172B50] opacity-65 mt-0.5">Linked to programs</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#172B5012] shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#172B50] opacity-60">Enrolled Athletes</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{(data.students || []).length}</p>
          <p className="text-[11px] text-[#172B50] opacity-65 mt-0.5">Across active centres</p>
        </div>
      </div>

      {/* Filters & Quick Templates */}
      <div className="bg-white p-4 rounded-2xl border border-[#172B5012] shadow-card space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#172B50] opacity-40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search programs by name, age group, or description..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#172B501A] bg-[#FFF4E8]/40 text-[#172B50] focus:outline-none focus:border-[#F4510B]"
            />
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#F4510B]" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-[#172B501A] bg-[#FFF4E8] text-[#172B50] focus:outline-none focus:border-[#F4510B]"
            >
              <option value="All">All Locations</option>
              {activeLocations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-[#FFF4E8] p-1 rounded-xl border border-[#172B5014]">
            {['All', 'Active', 'Inactive'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#172B50] text-white'
                    : 'text-[#172B50] opacity-75 hover:opacity-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Quick-Add Templates */}
        <div className="pt-2 border-t border-[#172B5010] flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#172B50] opacity-70 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-[#F4510B]" /> Quick-add catalog templates:
          </span>
          {PROGRAM_PRESETS.filter((preset) => !existingProgramNames.has(preset.name.toLowerCase())).map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => openAddProgramModal(preset)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFF4E8] text-[#172B50] border border-[#F4510B30] hover:bg-[#F4510B] hover:text-white transition-colors cursor-pointer"
            >
              <span>{preset.icon}</span>
              <span>+ {preset.name}</span>
            </button>
          ))}
          {PROGRAM_PRESETS.every((preset) => existingProgramNames.has(preset.name.toLowerCase())) && (
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All catalog templates added
            </span>
          )}
        </div>
      </div>

      {/* Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#172B5026] p-10 text-center">
          <Trophy className="w-10 h-10 text-[#F4510B] opacity-60 mx-auto mb-2" />
          <h3 className="text-sm font-extrabold text-[#172B50]">No Sports Programs Match This Filter</h3>
          <p className="text-xs text-[#172B50] opacity-65 mt-1">
            Click &ldquo;Add Sports Program&rdquo; or choose a quick-add template above to configure your academy syllabus.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPrograms.map((prog) => {
            const pStatus = prog.status || 'Active';
            const linkedBatches = (data.classes || []).filter((c) => c.program === prog.name);
            const enrolledCount = (data.students || []).filter((s) => s.program === prog.name).length;
            const progLocations =
              Array.isArray(prog.locations) && prog.locations.length > 0
                ? prog.locations
                : activeLocations.map((l) => l.name);

            return (
              <div
                key={prog.id}
                className={`bg-white rounded-2xl border p-5 shadow-card flex flex-col justify-between transition-all ${
                  pStatus === 'Inactive' ? 'border-[#172B5015] opacity-70' : 'border-[#172B5014] hover:border-[#F4510B66]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#FFF4E8] border border-[#F4510B25] flex items-center justify-center text-xl shrink-0">
                        {prog.icon || '🏆'}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#172B50] leading-snug">{prog.name}</h3>
                        <p className="text-[11px] font-semibold text-[#F4510B]">{prog.ageGroup || 'All Ages'}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        pStatus === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {pStatus}
                    </span>
                  </div>

                  {prog.description && (
                    <p className="text-xs text-[#172B50] opacity-75 line-clamp-2">{prog.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#FFF4E8]/60 p-3 rounded-xl border border-[#172B500D]">
                    <div className="flex items-center gap-1.5 text-[#172B50]">
                      <Clock className="w-3.5 h-3.5 text-[#F4510B]" />
                      <span className="font-semibold">{prog.duration || '60 mins'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#172B50]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#F4510B]" />
                      <span className="font-semibold truncate">{prog.eligibility || 'Open enrollment'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#172B50]">
                      <Users className="w-3.5 h-3.5 text-[#172B50] opacity-70" />
                      <span>
                        <strong>{linkedBatches.length}</strong> batches • <strong>{enrolledCount}</strong> kids
                      </span>
                    </div>
                    <div className="text-right font-extrabold text-[#172B50]">
                      {prog.feeMonthly ? `₹${Number(prog.feeMonthly).toLocaleString()}/mo` : 'Custom Fee'}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {progLocations.map((loc) => (
                      <span
                        key={loc}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#172B500B] text-[#172B50]"
                      >
                        <MapPin className="w-2.5 h-2.5 text-[#F4510B]" /> {loc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#172B5010] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditProgramModal(prog)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#172B50] bg-[#FFF4E8] hover:bg-[#172B50] hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleProgramStatus(prog.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        pStatus === 'Active'
                          ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      <Power className="w-3 h-3" /> {pStatus === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>

                  {onNavigateModule && (
                    <button
                      type="button"
                      onClick={() => onNavigateModule('batches')}
                      className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#F4510B] hover:underline cursor-pointer"
                    >
                      Batches <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Sports Program Modal */}
      <Modal
        isOpen={isProgramModalOpen}
        onClose={() => setIsProgramModalOpen(false)}
        title={editingProgram ? `Edit Program: ${editingProgram.name}` : 'Create Sports Program'}
        subtitle="Configure curriculum metadata, age eligibility, duration, and active training centres."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveProgram} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#172B50] mb-1">Program Name *</label>
              <input
                type="text"
                required
                value={programForm.name}
                onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                placeholder="e.g., Little Strikers, Professional Gymnastics"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] focus:outline-none focus:border-[#F4510B]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Icon Emoji</label>
              <input
                type="text"
                value={programForm.icon}
                onChange={(e) => setProgramForm({ ...programForm, icon: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] focus:outline-none focus:border-[#F4510B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">Program Description</label>
            <textarea
              rows={2}
              value={programForm.description}
              onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
              placeholder="Core training focus, skill milestones, and coaching structure..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] focus:outline-none focus:border-[#F4510B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Age Group *</label>
              <input
                type="text"
                required
                value={programForm.ageGroup}
                onChange={(e) => setProgramForm({ ...programForm, ageGroup: e.target.value })}
                placeholder="e.g., 4 - 8 Yrs"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] focus:outline-none focus:border-[#F4510B]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Session Duration *</label>
              <input
                type="text"
                required
                value={programForm.duration}
                onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })}
                placeholder="e.g., 60 mins"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] focus:outline-none focus:border-[#F4510B]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Monthly Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={programForm.feeMonthly}
                onChange={(e) => setProgramForm({ ...programForm, feeMonthly: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] focus:outline-none focus:border-[#F4510B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Eligibility / Prerequisites</label>
              <input
                type="text"
                value={programForm.eligibility}
                onChange={(e) => setProgramForm({ ...programForm, eligibility: e.target.value })}
                placeholder="e.g., Open enrollment / Trial assessment"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] focus:outline-none focus:border-[#F4510B]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Program Status</label>
              <select
                value={programForm.status}
                onChange={(e) => setProgramForm({ ...programForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] focus:outline-none focus:border-[#F4510B]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1.5">
              Available Academy Locations
            </label>
            <div className="flex flex-wrap gap-2">
              {activeLocations.map((loc) => {
                const selected = programForm.locations.includes(loc.name);
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleToggleProgramLocation(loc.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selected
                        ? 'bg-[#172B50] text-white border-[#172B50]'
                        : 'bg-[#FFF4E8] text-[#172B50] border-[#172B501F] hover:border-[#F4510B]'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {loc.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#172B5014]">
            <button
              type="button"
              onClick={() => setIsProgramModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#F4510B] text-white hover:bg-[#d84306] cursor-pointer"
            >
              {editingProgram ? 'Save Changes' : 'Create Program'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Academy Locations Manager Modal (Add, Edit & Deactivate Locations dynamically) */}
      <Modal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title="Manage Academy Locations & Courts"
        subtitle="Add new centres (e.g. Yoker Yard, Swrl Evng, Vidhai Evng), edit courts, or deactivate centres."
        maxWidth="max-w-3xl"
      >
        <div className="space-y-5">
          <form onSubmit={handleSaveLocation} className="bg-[#FFF4E8] p-4 rounded-2xl border border-[#172B5015] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[#172B50] uppercase tracking-wider">
                {editingLocation ? `Editing: ${editingLocation.name}` : 'Add New Academy Location'}
              </h4>
              {editingLocation && (
                <button
                  type="button"
                  onClick={() => openLocationEditor(null)}
                  className="text-[11px] font-bold text-[#F4510B] hover:underline cursor-pointer"
                >
                  + Switch to Add New
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#172B50] mb-1">Location Name *</label>
                <input
                  type="text"
                  required
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                  placeholder="e.g., YOKER YARD"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] bg-white text-[#172B50]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#172B50] mb-1">City</label>
                <input
                  type="text"
                  value={locationForm.city}
                  onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] bg-white text-[#172B50]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#172B50] mb-1">Courts / Venues (comma-separated)</label>
                <input
                  type="text"
                  value={locationForm.courts}
                  onChange={(e) => setLocationForm({ ...locationForm, courts: e.target.value })}
                  placeholder="Main Arena, Mat Zone"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] bg-white text-[#172B50]"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <input
                type="text"
                value={locationForm.address}
                onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                placeholder="Centre street address / landmark..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#172B5022] bg-white text-[#172B50]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#F4510B] text-white hover:bg-[#d84306] cursor-pointer shrink-0"
              >
                {editingLocation ? 'Update Location' : 'Add Location'}
              </button>
            </div>
          </form>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {allLocations.map((loc) => {
              const isInactive = loc.status === 'Inactive';
              return (
                <div
                  key={loc.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border ${
                    isInactive ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-white border-[#172B5015]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#172B50]">{loc.name}</span>
                      <span className="text-[10px] font-semibold text-[#172B50] opacity-60">({loc.city || 'Chennai'})</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isInactive ? 'bg-slate-200 text-slate-700' : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {loc.status || 'Active'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#172B50] opacity-65 mt-0.5">
                      Venues: {(loc.courts || []).join(', ') || 'Main Arena'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openLocationEditor(loc)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-[#FFF4E8] text-[#172B50] hover:bg-[#172B50] hover:text-white cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLocationStatus(loc.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                        isInactive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      {isInactive ? 'Activate' : 'Deactivate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
}
