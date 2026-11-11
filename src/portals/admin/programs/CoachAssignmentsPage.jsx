import React, { useMemo, useState } from 'react';
import {
  UserCheck,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Edit3,
  Users,
  CheckCircle2,
  AlertCircle,
  Search,
} from 'lucide-react';
import { useCrm } from '../../../context/CrmContext';
import { getCommonLocations } from '../../../services/locationService';
import Modal from '../../../components/common/Modal';

export default function CoachAssignmentsPage() {
  const { data, assignCoachesToBatch } = useCrm();
  const activeLocations = getCommonLocations(data);

  const [locationFilter, setLocationFilter] = useState('All');
  const [programFilter, setProgramFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Coach Assignment Modal
  const [assigningBatch, setAssigningBatch] = useState(null);
  const [primaryCoachId, setPrimaryCoachId] = useState('');
  const [additionalCoachIds, setAdditionalCoachIds] = useState([]);

  const filteredBatches = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return (data.classes || []).filter((cls) => {
      const matchesLoc = locationFilter === 'All' || cls.center === locationFilter;
      const matchesProg = programFilter === 'All' || cls.program === programFilter;
      const matchesSearch =
        !q ||
        cls.name?.toLowerCase().includes(q) ||
        cls.coach?.toLowerCase().includes(q) ||
        cls.program?.toLowerCase().includes(q);
      return matchesLoc && matchesProg && matchesSearch;
    });
  }, [data.classes, locationFilter, programFilter, searchTerm]);

  const coachesList = data.coaches || [];

  const getCoachWorkload = (coachId, coachName) => {
    const first = (coachName || '').split(' ')[0].toLowerCase();
    const assignedBatches = (data.classes || []).filter(
      (c) =>
        c.coachId === coachId ||
        (c.additionalCoaches || []).some((ac) => ac.coachId === coachId) ||
        (first && c.coach?.toLowerCase().includes(first))
    );
    const assignedSchedules = (data.classSchedules || []).filter(
      (s) =>
        s.status !== 'Cancelled' &&
        (s.coachId === coachId ||
          (s.additionalCoaches || []).some((ac) => ac.coachId === coachId) ||
          (first && s.coachName?.toLowerCase().includes(first)))
    );
    return { assignedBatches, assignedSchedules };
  };

  const openAssignmentModal = (batch) => {
    setAssigningBatch(batch);
    setPrimaryCoachId(batch.coachId || '');
    setAdditionalCoachIds((batch.additionalCoaches || []).map((c) => c.coachId));
  };

  const toggleAdditionalCoach = (coachId) => {
    if (coachId === primaryCoachId) return;
    setAdditionalCoachIds((prev) =>
      prev.includes(coachId) ? prev.filter((id) => id !== coachId) : [...prev, coachId]
    );
  };

  const handleSaveAssignment = (e) => {
    e.preventDefault();
    if (!assigningBatch) return;
    const res = assignCoachesToBatch({
      batchId: assigningBatch.id,
      primaryCoachId,
      additionalCoachIds,
    });
    if (res.success) {
      setAssigningBatch(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#172B5012] shadow-card">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F4510B]">
          <UserCheck className="w-3.5 h-3.5" /> Module 4 • Coach Assignments & Portal Sync
        </div>
        <h2 className="text-xl font-extrabold text-[#172B50] tracking-tight mt-0.5">
          Coach Assignments, Availability & Timetables
        </h2>
        <p className="text-xs text-[#172B50] opacity-70 mt-0.5">
          Assign primary and additional coaches per Location → Sports Program → Training Batch. Changes immediately sync to all active schedules and the Coach Portal.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#172B5012] shadow-card flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#172B50] opacity-40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search batch or coach..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#172B501A] bg-[#FFF4E8]/40 text-[#172B50]"
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
      </div>

      {/* Batch Coach Assignment Table */}
      <div className="bg-white rounded-2xl border border-[#172B5014] shadow-card overflow-hidden">
        <div className="px-5 py-3.5 bg-[#FFF4E8] border-b border-[#172B5012] flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#172B50]">
            Batch Coach Allocations ({filteredBatches.length})
          </h3>
          <span className="text-[11px] font-semibold text-[#172B50] opacity-70">
            Reassigning checks live schedule conflicts automatically
          </span>
        </div>

        {filteredBatches.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#172B50] opacity-65">
            No training batches available. Create batches in Module 2 (Training Batches) first.
          </div>
        ) : (
          <div className="divide-y divide-[#172B5010]">
            {filteredBatches.map((batch) => {
              const linkedSchedules = (data.classSchedules || []).filter(
                (s) =>
                  s.status !== 'Cancelled' &&
                  (s.batchId === batch.id || (s.batch === batch.name && s.location === batch.center))
              );

              return (
                <div
                  key={batch.id}
                  className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FFF4E8]/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-[#FFF4E8] text-[#F4510B]">
                        <MapPin className="w-2.5 h-2.5" /> {batch.center}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#172B500D] text-[#172B50]">
                        {batch.program}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-[#172B50]">{batch.name}</h4>
                    <p className="text-[11px] text-[#172B50] opacity-70">
                      {linkedSchedules.length} scheduled sessions linked • {batch.enrolled || 0}/{batch.capacity || 15} athletes enrolled
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-[#FFF4E8]/80 px-3.5 py-2 rounded-xl border border-[#172B5012] min-w-[220px]">
                      <p className="text-[10px] font-bold uppercase text-[#172B50] opacity-60">Primary Coach</p>
                      <p className="text-xs font-extrabold text-[#172B50]">
                        {batch.coach || 'Unassigned'}
                      </p>
                      {(batch.additionalCoaches || []).length > 0 && (
                        <p className="text-[10px] font-semibold text-[#F4510B] mt-0.5">
                          + Additional: {batch.additionalCoaches.map((c) => c.coachName).join(', ')}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => openAssignmentModal(batch)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-[#172B50] text-white hover:bg-[#F4510B] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {batch.coachId ? 'Reassign Coach' : 'Assign Coach'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Coach Availability & Assigned Schedules Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-[#172B50] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#F4510B]" />
          Coach Roster Availability & Portal Schedules
        </h3>

        {coachesList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#172B5026] p-8 text-center">
            <Users className="w-9 h-9 text-[#F4510B] opacity-60 mx-auto mb-2" />
            <p className="text-xs font-bold text-[#172B50]">No Coaches Added Yet</p>
            <p className="text-xs text-[#172B50] opacity-65 mt-1">
              Add coach accounts in User & Staff Access so they appear here for location, program & batch allocation.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {coachesList.map((coach) => {
              const { assignedBatches, assignedSchedules } = getCoachWorkload(coach.id, coach.name);
              const isBusy = assignedSchedules.length > 0;

              return (
                <div
                  key={coach.id}
                  className="bg-white rounded-2xl border border-[#172B5014] p-4 shadow-card space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-[#172B50]">{coach.name}</h4>
                      <p className="text-[11px] font-semibold text-[#F4510B]">
                        {coach.specialization || 'Academy Coach'}
                      </p>
                      <p className="text-[11px] text-[#172B50] opacity-65 mt-0.5">
                        Home Centre: {coach.center || 'Multi-centre'}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isBusy
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {isBusy ? `${assignedSchedules.length} Active Slots` : 'Available'}
                    </span>
                  </div>

                  <div className="bg-[#FFF4E8]/60 p-3 rounded-xl border border-[#172B500D] space-y-1.5">
                    <p className="text-[10px] font-bold uppercase text-[#172B50] opacity-60">
                      Assigned Batches ({assignedBatches.length})
                    </p>
                    {assignedBatches.length === 0 ? (
                      <p className="text-[11px] text-[#172B50] opacity-60">No batches assigned yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {assignedBatches.map((b) => (
                          <span
                            key={b.id}
                            className="px-2 py-0.5 rounded-md bg-white text-[10px] font-bold text-[#172B50] border border-[#172B5012]"
                          >
                            {b.name} ({b.center})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {assignedSchedules.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase text-[#172B50] opacity-60">
                        Upcoming Synced Coach Portal Sessions
                      </p>
                      {assignedSchedules.slice(0, 3).map((sch) => (
                        <div
                          key={sch.id}
                          className="flex items-center justify-between text-[11px] text-[#172B50] bg-slate-50 px-2.5 py-1.5 rounded-lg"
                        >
                          <span className="font-semibold truncate">
                            {sch.batch} ({sch.location})
                          </span>
                          <span className="text-[10px] font-bold text-[#F4510B] shrink-0 ml-2">
                            {sch.date} • {sch.startTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assign Primary & Additional Coaches Modal */}
      <Modal
        isOpen={Boolean(assigningBatch)}
        onClose={() => setAssigningBatch(null)}
        title={assigningBatch ? `Assign Coaches: ${assigningBatch.name}` : 'Assign Coaches'}
        subtitle={
          assigningBatch
            ? `${assigningBatch.center} • ${assigningBatch.program} — Automatically syncs to Class Schedules & Coach Portal`
            : ''
        }
      >
        {assigningBatch && (
          <form onSubmit={handleSaveAssignment} className="space-y-4">
            {coachesList.length === 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>No coaches registered in the system yet. Please create a Coach account first.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Primary Coach</label>
              <select
                value={primaryCoachId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setPrimaryCoachId(nextId);
                  setAdditionalCoachIds((prev) => prev.filter((id) => id !== nextId));
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              >
                <option value="">Unassigned</option>
                {coachesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.center || 'Multi-centre'} ({c.specialization || 'Coach'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1.5">
                Additional / Assistant Coaches (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {coachesList
                  .filter((c) => c.id !== primaryCoachId)
                  .map((c) => {
                    const checked = additionalCoachIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleAdditionalCoach(c.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          checked
                            ? 'bg-[#172B50] text-white border-[#172B50]'
                            : 'bg-[#FFF4E8] text-[#172B50] border-[#172B501C]'
                        }`}
                      >
                        {checked ? '✓ ' : '+ '}
                        {c.name}
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#172B5014]">
              <button
                type="button"
                onClick={() => setAssigningBatch(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#F4510B] text-white hover:bg-[#d84306] cursor-pointer"
              >
                Save & Sync Coach Portal
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
