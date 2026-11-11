import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Search, 
  UserCheck, 
  Award, 
  BookOpen, 
  CheckCircle2,
  CalendarDays,
  Filter,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  Check,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import ProgramsClasses from './ProgramsClasses';
import Modal from '../../components/common/Modal';

export default function ProgramsClassesModule() {
  const { 
    data, 
    activeSubTab, 
    setActiveSubTab, 
    createClassSchedule,
    updateClassSchedule,
    cancelClassSchedule,
    completeClassSchedule,
    checkScheduleConflictLive,
    addToast 
  } = useCrm();

  // Active tab: 'sports_programs' | 'batches' | 'schedules' | 'coach_assignments'
  const currentTab = activeSubTab || 'sports_programs';

  // Filters for Class Schedules
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterCoach, setFilterCoach] = useState('all');
  const [filterBatch, setFilterBatch] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Form State for Create/Edit
  const defaultLocation = (data.locations && data.locations[0]?.name) || "KK NAGAR";
  const [formLocation, setFormLocation] = useState(defaultLocation);
  const [formProgram, setFormProgram] = useState(data.programs[0]?.name || "Spartan Gymnastics & Agility");
  const [formBatch, setFormBatch] = useState(data.classes[0]?.name || "");
  const [formCoachId, setFormCoachId] = useState(data.coaches[0]?.id || "");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formStartTime, setFormStartTime] = useState("16:30");
  const [formEndTime, setFormEndTime] = useState("17:45");
  const [formVenue, setFormVenue] = useState(
    (data.locations && data.locations[0]?.courts[0]) || "Main Turf Ground"
  );
  const [formCapacity, setFormCapacity] = useState(18);
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState("Scheduled");

  // Get available courts/venues based on currently selected location
  const currentLocationObj = (data.locations || []).find(l => l.name === formLocation) || data.locations?.[0];
  const availableVenues = currentLocationObj ? currentLocationObj.courts : [
    "Main Turf Ground", "Training Court A", "Practice Arena B", "Warm-up Studio"
  ];

  // Helper to get coach name from ID
  const getCoachName = (id) => {
    const coach = data.coaches.find(c => c.id === id);
    return coach ? coach.name : "Coach Assigned";
  };

  // When location changes in form, auto-select first available court
  const handleLocationChange = (newLoc) => {
    setFormLocation(newLoc);
    const locObj = (data.locations || []).find(l => l.name === newLoc);
    if (locObj && locObj.courts && locObj.courts.length > 0) {
      setFormVenue(locObj.courts[0]);
    }
  };

  // Live conflict detection for modal preview
  const liveCandidate = {
    location: formLocation,
    coachId: formCoachId,
    coachName: getCoachName(formCoachId),
    date: formDate,
    startTime: formStartTime,
    endTime: formEndTime,
    venue: formVenue
  };
  const liveConflict = checkScheduleConflictLive(liveCandidate, selectedSchedule ? selectedSchedule.id : null);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setSelectedSchedule(null);
    const firstLoc = (data.locations && data.locations[0]?.name) || "KK NAGAR";
    setFormLocation(firstLoc);
    const locObj = (data.locations || []).find(l => l.name === firstLoc);
    setFormVenue(locObj?.courts[0] || "Main Turf Ground");
    setFormProgram(data.programs[0]?.name || "Spartan Gymnastics & Agility");
    setFormBatch(data.classes[0]?.name || "");
    setFormCoachId(data.coaches[0]?.id || "");
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormStartTime("16:30");
    setFormEndTime("17:45");
    setFormCapacity(18);
    setFormNotes("");
    setFormStatus("Scheduled");
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (schedule) => {
    setSelectedSchedule(schedule);
    setFormLocation(schedule.location);
    setFormProgram(schedule.program);
    setFormBatch(schedule.batch);
    setFormCoachId(schedule.coachId || data.coaches[0]?.id);
    setFormDate(schedule.date);
    setFormStartTime(schedule.startTime);
    setFormEndTime(schedule.endTime);
    setFormVenue(schedule.venue);
    setFormCapacity(schedule.capacity);
    setFormNotes(schedule.notes || "");
    setFormStatus(schedule.status || "Scheduled");
    setIsEditModalOpen(true);
  };

  // Submit Create Schedule
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const candidate = {
      location: formLocation,
      program: formProgram,
      batch: formBatch,
      coachId: formCoachId,
      coachName: getCoachName(formCoachId),
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      venue: formVenue,
      capacity: formCapacity,
      notes: formNotes
    };

    const res = createClassSchedule(candidate);
    if (res.success) {
      setIsCreateModalOpen(false);
    }
  };

  // Submit Edit Schedule
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    const updates = {
      location: formLocation,
      program: formProgram,
      batch: formBatch,
      coachId: formCoachId,
      coachName: getCoachName(formCoachId),
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      venue: formVenue,
      capacity: formCapacity,
      notes: formNotes,
      status: formStatus
    };

    const res = updateClassSchedule(selectedSchedule.id, updates);
    if (res.success) {
      setIsEditModalOpen(false);
      setSelectedSchedule(null);
    }
  };

  // Submit Cancel Schedule
  const handleCancelSubmit = (e) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    cancelClassSchedule(selectedSchedule.id, cancelReason);
    setIsCancelModalOpen(false);
    setSelectedSchedule(null);
    setCancelReason('');
  };

  // Filtered schedules list
  const schedulesList = (data.classSchedules || []).filter(s => {
    if (filterLocation !== 'all' && s.location !== filterLocation) return false;
    if (filterProgram !== 'all' && s.program !== filterProgram) return false;
    if (filterCoach !== 'all' && s.coachId !== filterCoach && !s.coachName?.includes(filterCoach)) return false;
    if (filterBatch !== 'all' && s.batch !== filterBatch) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (filterDate && s.date !== filterDate) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        s.batch?.toLowerCase().includes(q) ||
        s.program?.toLowerCase().includes(q) ||
        s.coachName?.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q) ||
        s.venue?.toLowerCase().includes(q) ||
        s.notes?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Status counts
  const totalCount = (data.classSchedules || []).length;
  const scheduledCount = (data.classSchedules || []).filter(s => s.status === 'Scheduled').length;
  const updatedCount = (data.classSchedules || []).filter(s => s.status === 'Updated').length;
  const cancelledCount = (data.classSchedules || []).filter(s => s.status === 'Cancelled').length;
  const completedCount = (data.classSchedules || []).filter(s => s.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Module Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#172B501A] pb-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Programs & Classes
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Sports curriculum, location-based class scheduling, court allocations & coach sync
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#172B5018] shadow-xs self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveSubTab('sports_programs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'sports_programs'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Sports Programs ({data.programs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('batches')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'batches'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Batches & Capacity ({data.classes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('schedules')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'schedules'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Class Timetable ({totalCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('coach_assignments')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'coach_assignments'
                ? 'bg-[#172B50] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#F4510B]" />
            <span>Coach Assignments</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1 & 2: Reuse existing refined ProgramsClasses view */}
      {(currentTab === 'sports_programs' || currentTab === 'batches') && (
        <ProgramsClasses />
      )}

      {/* SUBTAB 3: LOCATION-BASED CLASS SCHEDULING (Master Specification) */}
      {currentTab === 'schedules' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Operational Bar */}
          <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#F4510B]">
                    Multi-Branch Synchronized Scheduling
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-[#172B50] mt-0.5">
                  Academy Class Schedules & Venue Allocations
                </h2>
                <p className="text-xs text-[#172B50] opacity-75">
                  Publish schedules across 5 academy branches. Automatically updates assigned coaches in real time.
                </p>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#F4510B] text-white text-xs font-black rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all self-start lg:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Class Schedule</span>
              </button>
            </div>

            {/* Status Pills Counter */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#172B5010]">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  filterStatus === 'all' ? 'bg-[#172B50] text-white' : 'bg-[#FFF4E8] text-[#172B50] hover:bg-[#172B50]/10'
                }`}
              >
                All Statuses ({totalCount})
              </button>
              <button
                onClick={() => setFilterStatus('Scheduled')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  filterStatus === 'Scheduled' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Scheduled ({scheduledCount})
              </button>
              <button
                onClick={() => setFilterStatus('Updated')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  filterStatus === 'Updated' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Updated ({updatedCount})
              </button>
              <button
                onClick={() => setFilterStatus('Completed')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  filterStatus === 'Completed' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Completed ({completedCount})
              </button>
              <button
                onClick={() => setFilterStatus('Cancelled')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  filterStatus === 'Cancelled' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Cancelled ({cancelledCount})
              </button>
            </div>

            {/* Multi-Dimensional Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
              {/* 1. Location Filter */}
              <div>
                <label className="block text-[10px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                  1. Location / Branch
                </label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-bold text-[#172B50] bg-[#FFF4E8]/50 border border-[#172B5020] rounded-xl outline-none focus:border-[#F4510B]"
                >
                  <option value="all">All Locations</option>
                  {(data.locations || []).map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>

              {/* 2. Program Filter */}
              <div>
                <label className="block text-[10px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                  2. Sports Program
                </label>
                <select
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-bold text-[#172B50] bg-[#FFF4E8]/50 border border-[#172B5020] rounded-xl outline-none focus:border-[#F4510B]"
                >
                  <option value="all">All Programs</option>
                  {data.programs.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* 3. Coach Filter */}
              <div>
                <label className="block text-[10px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                  3. Assigned Coach
                </label>
                <select
                  value={filterCoach}
                  onChange={(e) => setFilterCoach(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-bold text-[#172B50] bg-[#FFF4E8]/50 border border-[#172B5020] rounded-xl outline-none focus:border-[#F4510B]"
                >
                  <option value="all">All Coaches</option>
                  {data.coaches.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* 4. Batch Filter */}
              <div>
                <label className="block text-[10px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                  4. Batch
                </label>
                <select
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-bold text-[#172B50] bg-[#FFF4E8]/50 border border-[#172B5020] rounded-xl outline-none focus:border-[#F4510B]"
                >
                  <option value="all">All Batches</option>
                  {data.classes.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* 5. Date Filter */}
              <div>
                <label className="block text-[10px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                  5. Specific Date
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-bold text-[#172B50] bg-[#FFF4E8]/50 border border-[#172B5020] rounded-xl outline-none focus:border-[#F4510B]"
                />
              </div>

              {/* 6. Search */}
              <div>
                <label className="block text-[10px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                  6. Search Query
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search venue, notes..."
                    className="w-full pl-8 pr-2.5 py-2 text-xs font-medium text-[#172B50] bg-[#FFF4E8]/50 border border-[#172B5020] rounded-xl outline-none focus:border-[#F4510B]"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {(filterLocation !== 'all' || filterProgram !== 'all' || filterCoach !== 'all' || filterBatch !== 'all' || filterStatus !== 'all' || filterDate || searchQuery) && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#172B50] opacity-70">
                  Showing <strong>{schedulesList.length}</strong> matching schedules
                </span>
                <button
                  onClick={() => {
                    setFilterLocation('all');
                    setFilterProgram('all');
                    setFilterCoach('all');
                    setFilterBatch('all');
                    setFilterStatus('all');
                    setFilterDate('');
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-[#F4510B] hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>

          {/* Schedule Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {schedulesList.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-[#172B501A] shadow-card space-y-3">
                <CalendarDays className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-extrabold text-[#172B50]">No Schedules Match Your Criteria</h3>
                <p className="text-xs text-[#172B50]/70 max-w-sm mx-auto">
                  Try adjusting your location, coach, date, or program filter, or create a new class schedule.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 bg-[#F4510B] text-white text-xs font-bold rounded-xl hover:brightness-110 shadow-sm"
                >
                  + Create Schedule Now
                </button>
              </div>
            ) : (
              schedulesList.map(item => {
                const isCancelled = item.status === 'Cancelled';
                const isCompleted = item.status === 'Completed';

                return (
                  <div 
                    key={item.id} 
                    className={`bg-white rounded-2xl p-5 border shadow-card flex flex-col justify-between transition-all hover:shadow-lg ${
                      isCancelled 
                        ? 'border-rose-200 bg-rose-50/20 opacity-80' 
                        : isCompleted
                        ? 'border-emerald-200'
                        : 'border-[#172B501A]'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#172B50] text-white">
                          {item.program.split(' ')[1] || item.program}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.status === 'Scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'Updated'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : item.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800 line-through'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      {/* Title & Batch */}
                      <h3 className={`text-base font-extrabold text-[#172B50] mt-2.5 leading-snug ${
                        isCancelled ? 'line-through text-gray-500' : ''
                      }`}>
                        {item.batch}
                      </h3>

                      {/* Location & Venue (Critical Feature) */}
                      <div className="mt-3 p-3 bg-[#FFF4E8]/60 rounded-xl border border-[#172B5010] space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-[#172B50]">
                          <MapPin className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                          <span>{item.location}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-[#F4510B] pl-5">
                          Court: {item.venue}
                        </div>
                      </div>

                      {/* Date & Time Slot */}
                      <div className="mt-3 space-y-1.5 text-xs text-[#172B50]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="font-semibold">{item.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="font-bold text-[#172B50]">{item.startTime} – {item.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="font-bold text-[#172B50]">{item.coachName}</span>
                        </div>
                      </div>

                      {/* Enrolled Students Capacity */}
                      <div className="mt-3 pt-2.5 border-t border-[#172B5010] flex items-center justify-between text-xs font-semibold text-[#172B50]">
                        <span>Capacity: {item.enrolledCount || item.enrolledStudents?.length || 0} / {item.capacity}</span>
                        <span className="text-[#F4510B]">
                          {Math.round(((item.enrolledCount || item.enrolledStudents?.length || 0) / item.capacity) * 100)}% Occupied
                        </span>
                      </div>

                      {/* Notes / Instructions */}
                      {item.notes && (
                        <p className="mt-2 text-[11px] text-[#172B50]/75 bg-[#FFF4E8]/30 p-2 rounded-lg italic">
                          "{item.notes}"
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="mt-4 pt-3 border-t border-[#172B5010] flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-gray-400">{item.id}</span>

                      <div className="flex items-center gap-1.5">
                        {!isCancelled && !isCompleted && (
                          <button
                            type="button"
                            onClick={() => completeClassSchedule(item.id)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Mark Completed"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {!isCancelled && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg border border-[#172B5020] text-[#172B50] hover:bg-[#FFF4E8] transition-colors"
                            title="Edit Schedule"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {!isCancelled && !isCompleted && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSchedule(item);
                              setIsCancelModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Cancel Schedule"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: Coach Assignments */}
      {currentTab === 'coach_assignments' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
            <h2 className="text-base font-extrabold text-[#172B50] mb-4">Discipline Coach Allocations</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF4E8] text-[#172B50] font-bold uppercase tracking-wider text-[11px] border-b border-[#172B501A]">
                  <tr>
                    <th className="px-5 py-3.5">Coach Name</th>
                    <th className="px-4 py-3.5">Primary Discipline</th>
                    <th className="px-4 py-3.5">Assigned Batches</th>
                    <th className="px-4 py-3.5">Arena Center</th>
                    <th className="px-4 py-3.5">Students</th>
                    <th className="px-4 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B5012]">
                  {data.coaches.map(c => (
                    <tr key={c.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-[#172B50] text-[13px]">{c.name}</td>
                      <td className="px-4 py-3.5 text-[#F4510B] font-semibold">{c.specialization}</td>
                      <td className="px-4 py-3.5 font-medium">{c.activeBatches} Active Batches</td>
                      <td className="px-4 py-3.5">{c.center}</td>
                      <td className="px-4 py-3.5 font-bold text-[#172B50]">{c.studentsCount} Athletes</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CREATE CLASS SCHEDULE MODAL (Prompt Workflow)                */}
      {/* ============================================================ */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create & Publish Class Schedule"
        subtitle="Schedule a class session at an academy branch. Automatically synchronizes with the Coach Portal."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {/* Step 1: Location & Program */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                1. Academy Location / Branch *
              </label>
              <select
                value={formLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl font-bold text-[#172B50] outline-none focus:border-[#F4510B]"
              >
                {(data.locations || []).map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name} ({loc.city})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                2. Sports Program *
              </label>
              <select
                value={formProgram}
                onChange={(e) => setFormProgram(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl font-bold text-[#172B50] outline-none focus:border-[#F4510B]"
              >
                {data.programs.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: Batch & Assigned Coach */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                3. Batch / Class *
              </label>
              <select
                value={formBatch}
                onChange={(e) => setFormBatch(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl font-bold text-[#172B50] outline-none focus:border-[#F4510B]"
              >
                {data.classes.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.level})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                4. Assigned Coach *
              </label>
              <select
                value={formCoachId}
                onChange={(e) => setFormCoachId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl font-bold text-[#172B50] outline-none focus:border-[#F4510B]"
              >
                {data.coaches.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 3: Date, Start Time & End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                5. Class Date *
              </label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl font-bold text-[#172B50] outline-none focus:border-[#F4510B]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                6. Start Time *
              </label>
              <input
                type="time"
                required
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl font-bold text-[#172B50] outline-none focus:border-[#F4510B]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                7. End Time *
              </label>
              <input
                type="time"
                required
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl font-bold text-[#172B50] outline-none focus:border-[#F4510B]"
              />
            </div>
          </div>

          {/* Step 4: Venue/Court & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                8. Available Court / Ground / Venue *
              </label>
              <select
                value={formVenue}
                onChange={(e) => setFormVenue(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl font-bold text-[#172B50] outline-none focus:border-[#F4510B]"
              >
                {availableVenues.map((court, idx) => (
                  <option key={idx} value={court}>{court}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                9. Student Capacity *
              </label>
              <input
                type="number"
                min="5"
                max="50"
                required
                value={formCapacity}
                onChange={(e) => setFormCapacity(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl font-bold text-[#172B50] outline-none focus:border-[#F4510B]"
              />
            </div>
          </div>

          {/* Step 5: Class Instructions or Notes */}
          <div>
            <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
              10. Class Instructions / Notes
            </label>
            <textarea
              rows="2"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Focus on balance beam routine. Bring personal shin guards and water bottles."
              className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl font-medium text-[#172B50] outline-none focus:border-[#F4510B]"
            />
          </div>

          {/* Conflict Warning or Availability Indicator */}
          {liveConflict.hasConflict ? (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-xs block">Scheduling Conflict Detected</span>
                <span className="text-[11px] opacity-90">{liveConflict.message}</span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[11px] font-bold">
                Time slot & venue available. No overlapping schedule for {getCoachName(formCoachId)}.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={liveConflict.hasConflict}
              className="px-5 py-2.5 bg-[#F4510B] text-white text-xs font-black rounded-xl shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              Save & Publish Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* EDIT CLASS SCHEDULE MODAL                                    */}
      {/* ============================================================ */}
      {isEditModalOpen && selectedSchedule && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Schedule (${selectedSchedule.id})`}
          subtitle="Modifications will update both Admin records and the Coach Portal in real time."
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                  Location / Branch
                </label>
                <select
                  value={formLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl font-bold text-[#172B50]"
                >
                  {(data.locations || []).map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                  Assigned Coach
                </label>
                <select
                  value={formCoachId}
                  onChange={(e) => setFormCoachId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl font-bold text-[#172B50]"
                >
                  {data.coaches.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl font-bold text-[#172B50]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl font-bold text-[#172B50]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  required
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl font-bold text-[#172B50]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                  Court / Venue
                </label>
                <select
                  value={formVenue}
                  onChange={(e) => setFormVenue(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl font-bold text-[#172B50]"
                >
                  {availableVenues.map((court, idx) => (
                    <option key={idx} value={court}>{court}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl font-bold text-[#172B50]"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Updated">Updated</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                Instructions / Notes
              </label>
              <textarea
                rows="2"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF4E8]/40 border border-[#172B5020] rounded-xl text-[#172B50]"
              />
            </div>

            {liveConflict.hasConflict && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-xs block">Conflict Detected</span>
                  <span className="text-[11px]">{liveConflict.message}</span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={liveConflict.hasConflict}
                className="px-5 py-2.5 bg-[#172B50] text-white text-xs font-black rounded-xl shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* CANCEL SCHEDULE CONFIRMATION MODAL                           */}
      {/* ============================================================ */}
      {isCancelModalOpen && selectedSchedule && (
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title="Cancel Scheduled Class"
          subtitle="This class will be marked as Cancelled and instantly updated on the Coach Portal."
        >
          <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 space-y-1">
              <p className="font-bold">{selectedSchedule.batch} • {selectedSchedule.location}</p>
              <p className="text-[11px] opacity-80">{selectedSchedule.date} ({selectedSchedule.startTime} - {selectedSchedule.endTime})</p>
              <p className="text-[11px] opacity-80">Assigned Coach: {selectedSchedule.coachName}</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1">
                Reason for Cancellation *
              </label>
              <textarea
                rows="2"
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Inclement weather / court maintenance / rescheduled by admin"
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-[#172B50] outline-none focus:border-rose-500"
              />
            </div>

            <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-rose-600 text-white text-xs font-black rounded-xl shadow-md hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
