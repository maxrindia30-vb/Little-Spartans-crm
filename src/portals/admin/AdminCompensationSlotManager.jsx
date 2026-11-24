import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  User,
  Layers,
  Sparkles,
  Search,
  Filter,
  Check
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';

export default function AdminCompensationSlotManager() {
  const {
    data,
    createCompensationSlot,
    updateCompensationSlot,
    deleteCompensationSlot,
    allocateCompensationSlot,
    addToast
  } = useCrm();

  const [activeSubTab, setActiveSubTab] = useState('slots'); // 'slots' | 'requests'

  // Filter states
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterProgram, setFilterProgram] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State: Create New Slot
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newLocation, setNewLocation] = useState('KK NAGAR');
  const [newProgram, setNewProgram] = useState('Athletics');
  const [newBatch, setNewBatch] = useState('LE - B1');
  const [newDate, setNewDate] = useState('2026-11-29');
  const [newStartTime, setNewStartTime] = useState('08:00 AM');
  const [newEndTime, setNewEndTime] = useState('09:00 AM');
  const [newCoachId, setNewCoachId] = useState('COACH-SAM');
  const [newCapacity, setNewCapacity] = useState(10);

  // Modal State: Allocate Student to Slot
  const [selectedReqForAllocation, setSelectedReqForAllocation] = useState(null);
  const [targetSlotId, setTargetSlotId] = useState('');
  const [allocationNotes, setAllocationNotes] = useState('');

  const academyLocations = ['KK NAGAR', 'KILPAUK', 'MAHALINGAPURAM', 'ANNA NAGAR', 'KOLATHUR'];

  // All Compensation Slots
  const slots = useMemo(() => {
    return (data.compensationSlots || []).filter(slot => {
      if (filterLocation !== 'All' && slot.location !== filterLocation) return false;
      if (filterProgram !== 'All' && slot.program !== filterProgram) return false;
      if (filterStatus !== 'All' && slot.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = (slot.batch || '').toLowerCase().includes(q) ||
          (slot.coachName || '').toLowerCase().includes(q) ||
          (slot.location || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [data.compensationSlots, filterLocation, filterProgram, filterStatus, searchQuery]);

  // Compensation Requests requiring Slot Allocation
  const pendingAllocations = useMemo(() => {
    return (data.compensationRequests || []).filter(r => r.status === 'Approved' || r.status === 'Pending');
  }, [data.compensationRequests]);

  const scheduledAllocations = useMemo(() => {
    return (data.compensationRequests || []).filter(r => r.status === 'Scheduled');
  }, [data.compensationRequests]);

  const handleCreateSlot = (e) => {
    e.preventDefault();
    const coach = (data.coaches || []).find(c => c.id === newCoachId) || data.coaches?.[0];
    const res = createCompensationSlot({
      location: newLocation,
      program: newProgram,
      batch: newBatch,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      coachId: newCoachId,
      coachName: coach?.name || 'Coach Sam',
      maxCapacity: Number(newCapacity) || 10
    });

    if (res?.success) {
      setIsCreateModalOpen(false);
    }
  };

  const handleOpenAllocateModal = (req) => {
    setSelectedReqForAllocation(req);
    // Find compatible available slot (same location & program if possible)
    const matchingSlot = (data.compensationSlots || []).find(s =>
      s.location === req.location &&
      s.status === 'Available' &&
      s.availableSeats > 0
    ) || (data.compensationSlots || []).find(s => s.status === 'Available' && s.availableSeats > 0);

    setTargetSlotId(matchingSlot?.id || '');
    setAllocationNotes(`Allocated based on parent preference: ${req.preferredDate || 'any slot'}`);
  };

  const handleConfirmAllocation = () => {
    if (!selectedReqForAllocation || !targetSlotId) {
      addToast('Please select a target compensation slot.', 'error');
      return;
    }

    const res = allocateCompensationSlot({
      requestId: selectedReqForAllocation.id,
      slotId: targetSlotId,
      adminNotes: allocationNotes
    });

    if (res?.success) {
      setSelectedReqForAllocation(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* =================================================================== */}
      {/* 1. TOP HEADER & ACTION BUTTON                                       */}
      {/* =================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-[#F4510B]" />
            <span>Compensation Class Slot Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#172B50]/70 mt-0.5">
            Admin centralized control: Create makeup slots, manage coach capacity, and allocate approved parent requests
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F4510B] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Compensation Slot</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* 2. SUB-TAB TOGGLE: SLOTS VS PENDING ALLOCATIONS                     */}
      {/* =================================================================== */}
      <div className="flex items-center gap-2 border-b border-[#172B5014] pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('slots')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'slots'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'text-[#172B50] hover:bg-[#FFF4E8]'
          }`}
        >
          Available Slots ({slots.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'requests'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'text-[#172B50] hover:bg-[#FFF4E8]'
          }`}
        >
          <span>Pending Student Allocations</span>
          {pendingAllocations.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900">
              {pendingAllocations.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('scheduled')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'scheduled'
              ? 'bg-[#F4510B] text-white shadow-xs'
              : 'text-[#172B50] hover:bg-[#FFF4E8]'
          }`}
        >
          Confirmed Schedules ({scheduledAllocations.length})
        </button>
      </div>

      {/* =================================================================== */}
      {/* 3. FILTER BAR                                                       */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl p-4 border border-[#172B5014] shadow-card flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-[#FFF4E8]/60 border border-[#172B5014] rounded-xl px-3 py-1.5 text-xs">
          <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="bg-transparent border-0 font-bold text-[#172B50] outline-none cursor-pointer"
          >
            <option value="All">All Locations</option>
            {academyLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-[#FFF4E8]/60 border border-[#172B5014] rounded-xl px-3 py-1.5 text-xs">
          <Layers className="w-3.5 h-3.5 text-[#F4510B]" />
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="bg-transparent border-0 font-bold text-[#172B50] outline-none cursor-pointer"
          >
            <option value="All">All Programs</option>
            <option value="Foundational Movement">Foundational Movement</option>
            <option value="Athletics">Athletics</option>
            <option value="Football">Football</option>
            <option value="Basketball">Basketball</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-[#FFF4E8]/60 border border-[#172B5014] rounded-xl px-3 py-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-[#F4510B]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent border-0 font-bold text-[#172B50] outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Full">Full</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px] flex items-center bg-[#FFF4E8]/30 border border-[#172B5015] rounded-xl px-3 py-1.5">
          <Search className="w-3.5 h-3.5 text-[#172B50]/40 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search slots, coaches, or batches..."
            className="w-full bg-transparent border-0 text-xs font-medium text-[#172B50] pl-2 outline-none"
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. VIEW A: SLOTS MANAGEMENT                                         */}
      {/* =================================================================== */}
      {activeSubTab === 'slots' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B5014] shadow-card">
          <h3 className="text-base font-black text-[#172B50] mb-3">
            Active Compensation Class Slots ({slots.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#172B5012] text-[#172B50]/60 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Slot ID &amp; Location</th>
                  <th className="py-3 px-3">Program &amp; Batch</th>
                  <th className="py-3 px-3">Date &amp; Time</th>
                  <th className="py-3 px-3">Assigned Coach</th>
                  <th className="py-3 px-3 text-center">Seats / Capacity</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3">Enrolled Athletes</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B500A]">
                {slots.map(slot => (
                  <tr key={slot.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-bold text-[#F4510B] text-[11px]">{slot.id}</div>
                      <div className="text-xs font-bold text-[#172B50] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#F4510B]" />
                        <span>{slot.location}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#172B50]">{slot.program}</div>
                      <div className="text-[10px] text-[#172B50]/70 font-semibold">{slot.batch}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#172B50]">{slot.date}</div>
                      <div className="text-[11px] font-mono text-[#172B50]/80">{slot.startTime} – {slot.endTime}</div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[#172B50]">
                      {slot.coachName}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold">
                      <span className="text-emerald-700">{slot.availableSeats}</span> / {slot.maxCapacity}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        slot.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                        slot.status === 'Full' ? 'bg-rose-100 text-rose-800' :
                        slot.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {slot.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {(slot.enrolledChildren || []).length === 0 ? (
                        <span className="text-[11px] text-[#172B50]/40">None enrolled</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {slot.enrolledChildren.map((c, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-[#FFF4E8] text-[#F4510B] text-[10px] font-bold border border-[#F4510B20]">
                              {c.childName}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {slot.status !== 'Completed' && (
                        <button
                          type="button"
                          onClick={() => deleteCompensationSlot(slot.id)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. VIEW B: PENDING REQUESTS REQUIRING ALLOCATION                    */}
      {/* =================================================================== */}
      {activeSubTab === 'requests' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B5014] shadow-card">
          <h3 className="text-base font-black text-[#172B50] mb-3">
            Parent Compensation Requests Awaiting Slot Assignment ({pendingAllocations.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#172B5012] text-[#172B50]/60 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Child Name &amp; ID</th>
                  <th className="py-3 px-3">Parent Info</th>
                  <th className="py-3 px-3">Location &amp; Program</th>
                  <th className="py-3 px-3">Missed Date &amp; Reason</th>
                  <th className="py-3 px-3">Parent Preference</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Assign Slot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B500A]">
                {pendingAllocations.map(req => (
                  <tr key={req.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#172B50]">{req.childName || req.studentName}</div>
                      <div className="text-[10px] font-mono text-[#F4510B]">{req.childId || req.studentId}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-[#172B50]">{req.parentName}</div>
                      <div className="text-[10px] text-[#172B50]/60">{req.parentId}</div>
                    </td>
                    <td className="py-3.5 px-3 text-[#172B50]/80">
                      {req.location} • {req.program}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#172B50]">{req.missedDate}</div>
                      <div className="text-[11px] text-[#172B50]/70">{req.reason}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-[#172B50]">
                        {req.preferredDate || 'Flexible'}
                      </div>
                      <div className="text-[10px] text-[#172B50]/60">
                        {req.preferredTime || 'Any slot'}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenAllocateModal(req)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#F4510B] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer"
                      >
                        Allocate Slot
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. VIEW C: CONFIRMED SCHEDULED COMPENSATION SESSIONS                */}
      {/* =================================================================== */}
      {activeSubTab === 'scheduled' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B5014] shadow-card">
          <h3 className="text-base font-black text-[#172B50] mb-3">
            Confirmed &amp; Synchronized Compensation Sessions ({scheduledAllocations.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#172B5012] text-[#172B50]/60 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Athlete</th>
                  <th className="py-3 px-3">Original Missed Date</th>
                  <th className="py-3 px-3">Confirmed Makeup Date</th>
                  <th className="py-3 px-3">Time Slot</th>
                  <th className="py-3 px-3">Location &amp; Coach</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B500A]">
                {scheduledAllocations.map(req => (
                  <tr key={req.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#172B50]">{req.childName || req.studentName}</div>
                      <div className="text-[10px] text-[#172B50]/60">{req.parentId}</div>
                    </td>
                    <td className="py-3.5 px-3 text-[#172B50]/80">
                      {req.missedDate} ({req.reason})
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[#F4510B]">
                      {req.confirmedDate}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-[#172B50]">
                      {req.confirmedTime}
                    </td>
                    <td className="py-3.5 px-3 text-[#172B50]">
                      {req.confirmedLocation} • {req.confirmedCoach}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800">
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 7. MODAL: CREATE COMPENSATION SLOT                                  */}
      {/* =================================================================== */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Compensation Slot"
          subtitle="Configure date, location, program, coach assignment and student capacity"
        >
          <form onSubmit={handleCreateSlot} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Location *</label>
                <select
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-[#FFF4E8]/60 border border-[#172B5018] rounded-xl px-3 py-2 text-xs font-bold text-[#172B50] outline-none"
                >
                  {academyLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Program *</label>
                <select
                  value={newProgram}
                  onChange={(e) => setNewProgram(e.target.value)}
                  className="w-full bg-[#FFF4E8]/60 border border-[#172B5018] rounded-xl px-3 py-2 text-xs font-bold text-[#172B50] outline-none"
                >
                  <option value="Athletics">Athletics</option>
                  <option value="Foundational Movement">Foundational Movement</option>
                  <option value="Football">Football</option>
                  <option value="Basketball">Basketball</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Batch Identifier *</label>
                <input
                  type="text"
                  required
                  value={newBatch}
                  onChange={(e) => setNewBatch(e.target.value)}
                  className="w-full bg-white border border-[#172B5018] rounded-xl px-3 py-2 text-xs font-bold text-[#172B50] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Session Date *</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-white border border-[#172B5018] rounded-xl px-3 py-2 text-xs font-bold text-[#172B50] outline-none cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Start Time *</label>
                <input
                  type="text"
                  required
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  placeholder="08:00 AM"
                  className="w-full bg-white border border-[#172B5018] rounded-xl px-3 py-2 text-xs font-bold text-[#172B50] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">End Time *</label>
                <input
                  type="text"
                  required
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  placeholder="09:00 AM"
                  className="w-full bg-white border border-[#172B5018] rounded-xl px-3 py-2 text-xs font-bold text-[#172B50] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Assigned Coach *</label>
                <select
                  value={newCoachId}
                  onChange={(e) => setNewCoachId(e.target.value)}
                  className="w-full bg-[#FFF4E8]/60 border border-[#172B5018] rounded-xl px-3 py-2 text-xs font-bold text-[#172B50] outline-none cursor-pointer"
                >
                  {(data.coaches || []).map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.center || 'All'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Maximum Capacity *</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  className="w-full bg-white border border-[#172B5018] rounded-xl px-3 py-2 text-xs font-bold text-[#172B50] outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#172B5010] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-xs hover:brightness-110"
              >
                Create Slot
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* =================================================================== */}
      {/* 8. MODAL: ALLOCATE STUDENT TO SLOT                                  */}
      {/* =================================================================== */}
      {selectedReqForAllocation && (
        <Modal
          isOpen={!!selectedReqForAllocation}
          onClose={() => setSelectedReqForAllocation(null)}
          title={`Allocate Compensation Slot: ${selectedReqForAllocation.childName || selectedReqForAllocation.studentName}`}
          subtitle={`Missed on ${selectedReqForAllocation.missedDate} (${selectedReqForAllocation.reason}) • Parent Preferred: ${selectedReqForAllocation.preferredDate || 'Any'}`}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">
                Select Available Slot *
              </label>
              <select
                value={targetSlotId}
                onChange={(e) => setTargetSlotId(e.target.value)}
                className="w-full bg-[#FFF4E8]/60 border border-[#172B5018] rounded-xl px-3 py-2.5 text-xs font-bold text-[#172B50] outline-none"
              >
                <option value="">-- Choose an available slot --</option>
                {(data.compensationSlots || []).filter(s => s.status !== 'Completed' && s.availableSeats > 0).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.location} • {s.date} ({s.startTime} – {s.endTime}) • {s.coachName} • Seats Left: {s.availableSeats}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">
                Admin Notes for Parent &amp; Coach
              </label>
              <textarea
                rows="2"
                value={allocationNotes}
                onChange={(e) => setAllocationNotes(e.target.value)}
                className="w-full bg-white border border-[#172B5018] rounded-xl px-3 py-2 text-xs font-medium text-[#172B50] outline-none resize-none"
              />
            </div>

            <div className="pt-3 border-t border-[#172B5010] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedReqForAllocation(null)}
                className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAllocation}
                className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-xs hover:brightness-110 cursor-pointer"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
