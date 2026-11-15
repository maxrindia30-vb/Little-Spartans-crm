import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  ArrowRight,
  UserPlus,
  History,
  FileText,
  Eye,
  CalendarDays,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  GraduationCap,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import KpiCard from '../../components/common/KpiCard';
import { getCommonLocations } from '../../services/locationService';
import {
  DEMO_STATUSES,
  DEMO_STATUS_CONFIG,
  filterCoachesForDemo,
  calculateDemoMetrics,
} from '../../services/demoService';

export default function DemoManagementModule({ initialFilterLocation = 'All' }) {
  const {
    data,
    addDemo,
    updateDemoStatus,
    rescheduleDemo,
    convertDemoToStudent,
    navigateToPersonRecord,
  } = useCrm();

  const commonLocations = getCommonLocations(data);
  const activeLocations = (data.locations || []).filter((l) => l.status !== 'Inactive');
  const todayYmd = new Date().toISOString().split('T')[0];

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState(initialFilterLocation);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterProgram, setFilterProgram] = useState('All');
  const [filterCoach, setFilterCoach] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Add Demo Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    enquiryId: '',
    childName: '',
    childAge: '6',
    gender: 'Male',
    dob: '',
    parentName: '',
    phone: '',
    email: '',
    location: commonLocations[0]?.name || 'KK NAGAR',
    program: data.programs[0]?.name || 'Spartan Gymnastics & Agility',
    demoDate: todayYmd,
    demoTime: '17:00',
    coachId: '',
    coachName: '',
    notes: '',
  });

  // Reschedule Modal State
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    demoDate: '',
    demoTime: '',
    location: '',
    coachId: '',
    coachName: '',
    rescheduleReason: '',
  });

  // Demo Details / History Modal State
  const [detailDemo, setDetailDemo] = useState(null);

  // Status Change Modal / Quick Action
  const [statusChangeTarget, setStatusChangeTarget] = useState(null);
  const [newStatusValue, setNewStatusValue] = useState(DEMO_STATUSES.COMPLETED);
  const [statusNote, setStatusNote] = useState('');

  // Convert to Student Confirmation Modal
  const [convertTarget, setConvertTarget] = useState(null);
  const [convertOverrides, setConvertOverrides] = useState({
    preferredBatchId: '',
    notes: '',
  });
  const [convertResult, setConvertResult] = useState(null);
  const [isConverting, setIsConverting] = useState(false);

  // Eligible coaches dynamically filtered by location + program for add modal
  const eligibleCoachesForAdd = useMemo(() => {
    return filterCoachesForDemo({
      coaches: data.coaches || [],
      location: addForm.location,
      program: addForm.program,
    });
  }, [data.coaches, addForm.location, addForm.program]);

  // Eligible coaches for reschedule modal
  const eligibleCoachesForReschedule = useMemo(() => {
    if (!rescheduleTarget) return data.coaches || [];
    return filterCoachesForDemo({
      coaches: data.coaches || [],
      location: rescheduleForm.location || rescheduleTarget.location,
      program: rescheduleTarget.program,
    });
  }, [data.coaches, rescheduleTarget, rescheduleForm.location]);

  // Filtered Demos
  const filteredDemos = useMemo(() => {
    const list = data.demos || [];
    const query = searchTerm.trim().toLowerCase();

    return list.filter((d) => {
      const matchLoc = filterLocation === 'All' || d.location === filterLocation;
      const matchStatus = filterStatus === 'All' || d.status === filterStatus;
      const matchProg = filterProgram === 'All' || d.program === filterProgram;
      const matchCoach =
        filterCoach === 'All' || d.coachId === filterCoach || d.coachName === filterCoach;
      const matchDate = !filterDate || d.demoDate === filterDate;
      const matchQuery =
        !query ||
        d.id.toLowerCase().includes(query) ||
        (d.enquiryId && d.enquiryId.toLowerCase().includes(query)) ||
        d.childName.toLowerCase().includes(query) ||
        d.parentName.toLowerCase().includes(query) ||
        d.phone.includes(query);

      return matchLoc && matchStatus && matchProg && matchCoach && matchDate && matchQuery;
    });
  }, [
    data.demos,
    searchTerm,
    filterLocation,
    filterStatus,
    filterProgram,
    filterCoach,
    filterDate,
  ]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredDemos.length / pageSize));
  const paginatedDemos = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDemos.slice(start, start + pageSize);
  }, [filteredDemos, currentPage, pageSize]);

  // Overall metrics
  const metrics = useMemo(() => {
    return calculateDemoMetrics(data.enquiries || [], data.demos || [], data.students || []);
  }, [data.enquiries, data.demos, data.students]);

  // Handlers
  const handleOpenAddModal = (fromEnquiry = null) => {
    if (fromEnquiry) {
      setAddForm({
        enquiryId: fromEnquiry.id || '',
        childName: fromEnquiry.childName || '',
        childAge: fromEnquiry.childAge || '6',
        gender: fromEnquiry.gender || 'Male',
        dob: fromEnquiry.dob || '',
        parentName: fromEnquiry.parentName || '',
        phone: fromEnquiry.phone || '',
        email: fromEnquiry.email || '',
        location: fromEnquiry.center || commonLocations[0]?.name || 'KK NAGAR',
        program: fromEnquiry.interestedProgram || data.programs[0]?.name || '',
        demoDate: todayYmd,
        demoTime: '17:00',
        coachId: '',
        coachName: '',
        notes: fromEnquiry.notes ? `Enquiry note: ${fromEnquiry.notes}` : '',
      });
    } else {
      setAddForm({
        enquiryId: '',
        childName: '',
        childAge: '6',
        gender: 'Male',
        dob: '',
        parentName: '',
        phone: '',
        email: '',
        location: commonLocations[0]?.name || 'KK NAGAR',
        program: data.programs[0]?.name || 'Spartan Gymnastics & Agility',
        demoDate: todayYmd,
        demoTime: '17:00',
        coachId: '',
        coachName: '',
        notes: '',
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSaveAddDemo = (e) => {
    e.preventDefault();
    const coachObj = (data.coaches || []).find((c) => c.id === addForm.coachId);
    const payload = {
      ...addForm,
      coachName: coachObj ? coachObj.name : addForm.coachName || 'Assigned Coach',
    };

    const res = addDemo(payload);
    if (res.success) {
      setIsAddModalOpen(false);
    }
  };

  const handleOpenRescheduleModal = (demo) => {
    setRescheduleTarget(demo);
    setRescheduleForm({
      demoDate: demo.demoDate,
      demoTime: demo.demoTime,
      location: demo.location,
      coachId: demo.coachId,
      coachName: demo.coachName,
      rescheduleReason: '',
    });
  };

  const handleSaveReschedule = (e) => {
    e.preventDefault();
    if (!rescheduleTarget) return;

    const coachObj = (data.coaches || []).find((c) => c.id === rescheduleForm.coachId);
    const updates = {
      demoDate: rescheduleForm.demoDate,
      demoTime: rescheduleForm.demoTime,
      location: rescheduleForm.location,
      coachId: rescheduleForm.coachId,
      coachName: coachObj ? coachObj.name : rescheduleForm.coachName || rescheduleTarget.coachName,
      rescheduleReason: rescheduleForm.rescheduleReason,
      status: DEMO_STATUSES.RESCHEDULED,
    };

    const res = rescheduleDemo(rescheduleTarget.id, updates);
    if (res.success) {
      setRescheduleTarget(null);
    }
  };

  const handleOpenStatusModal = (demo, defaultStatus) => {
    setStatusChangeTarget(demo);
    setNewStatusValue(defaultStatus || demo.status);
    setStatusNote('');
  };

  const handleSaveStatusChange = (e) => {
    e.preventDefault();
    if (!statusChangeTarget) return;
    updateDemoStatus(statusChangeTarget.id, newStatusValue, statusNote);
    setStatusChangeTarget(null);
  };

  const handleOpenConvertModal = (demo) => {
    setConvertTarget(demo);
    setConvertOverrides({
      preferredBatchId: '',
      notes: demo.notes ? `Converted from Demo ${demo.id}: ${demo.notes}` : `Converted from Demo ${demo.id}`,
    });
    setConvertResult(null);
  };

  const handleExecuteConversion = () => {
    if (!convertTarget) return;
    setIsConverting(true);
    try {
      const res = convertDemoToStudent(convertTarget.id, convertOverrides);
      if (res.success) {
        setConvertResult(res);
      }
    } finally {
      setIsConverting(false);
    }
  };

  // Batches available at the demo's location
  const matchingBatchesForConvert = useMemo(() => {
    if (!convertTarget) return [];
    return (data.classes || []).filter(
      (c) =>
        c.center === convertTarget.location &&
        (!convertTarget.program || c.program === convertTarget.program)
    );
  }, [data.classes, convertTarget]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#172B50] text-white tracking-wider">
              Admission Pipeline
            </span>
            <span className="text-xs font-semibold text-[#172B50] opacity-60">
              Demo Bookings &amp; Student Conversion
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Demo Class Management
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Convert enquiries into trial sessions, track attendance &amp; coach evaluation, and enroll verified athletes seamlessly.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAddModal()}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Book Demo Session</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard
          title="Total Demos"
          value={metrics.totalDemos || 0}
          subtitle={`Across ${activeLocations.length} locations`}
          icon={Calendar}
          color="orange"
        />

        <KpiCard
          title="Demo Scheduled"
          value={String(metrics.upcomingDemos || 0).padStart(2, '0')}
          subtitle="Upcoming Trial Sessions"
          icon={Clock}
          color="blue"
        />

        <KpiCard
          title="Completed Demos"
          value={metrics.completedDemos || 0}
          subtitle="Trials Finished"
          icon={CheckCircle2}
          color="green"
        />

        <KpiCard
          title="Conversion Rate"
          value={`${metrics.conversionRate || 0}%`}
          subtitle={`${metrics.studentConversions || 0} enrolled athletes`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#172B5014] shadow-card space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#172B50] opacity-40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Child Name, Parent Name, Phone, Demo ID, Enquiry ID..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#172B5020] text-[#172B50] focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          {/* Quick Date Filter */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-[#172B5020] text-[#172B50] bg-white"
            />
            {filterDate && (
              <button
                type="button"
                onClick={() => setFilterDate('')}
                className="text-[11px] font-bold text-[#F4510B] hover:underline"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-[#172B5010]">
          <div>
            <label className="block text-[10px] font-extrabold text-[#172B50] uppercase opacity-60 mb-1">
              Location
            </label>
            <select
              value={filterLocation}
              onChange={(e) => {
                setFilterLocation(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#172B5020] bg-white font-semibold text-[#172B50]"
            >
              <option value="All">All Locations</option>
              {activeLocations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-[#172B50] uppercase opacity-60 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#172B5020] bg-white font-semibold text-[#172B50]"
            >
              <option value="All">All Statuses</option>
              {Object.values(DEMO_STATUSES).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-[#172B50] uppercase opacity-60 mb-1">
              Program
            </label>
            <select
              value={filterProgram}
              onChange={(e) => {
                setFilterProgram(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#172B5020] bg-white font-semibold text-[#172B50]"
            >
              <option value="All">All Programs</option>
              {(data.programs || []).map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-[#172B50] uppercase opacity-60 mb-1">
              Assigned Coach
            </label>
            <select
              value={filterCoach}
              onChange={(e) => {
                setFilterCoach(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#172B5020] bg-white font-semibold text-[#172B50]"
            >
              <option value="All">All Coaches</option>
              {(data.coaches || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Demo List Table */}
      <div className="bg-white rounded-2xl border border-[#172B5014] shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#172B5012] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-[#172B50]">Demo Class Register</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FFF4E8] text-[#F4510B]">
              {filteredDemos.length} Bookings
            </span>
          </div>
          <span className="text-[11px] text-[#172B50] opacity-60">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {filteredDemos.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Calendar className="w-10 h-10 text-[#172B50] opacity-30 mx-auto" />
            <h3 className="text-sm font-extrabold text-[#172B50]">No Demo Classes Found</h3>
            <p className="text-xs text-[#172B50] opacity-60 max-w-md mx-auto">
              No demo bookings match your current filter selections. Book a new demo or adjust your filters.
            </p>
            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Book First Demo</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B50]">
              <thead className="bg-[#FFF4E8]/60 text-[10px] font-extrabold uppercase tracking-wider text-[#172B50] border-b border-[#172B5014]">
                <tr>
                  <th className="py-3 px-4">Demo ID &amp; Time</th>
                  <th className="py-3 px-4">Athlete / Child</th>
                  <th className="py-3 px-4">Parent / Contact</th>
                  <th className="py-3 px-4">Location &amp; Sport</th>
                  <th className="py-3 px-4">Assigned Coach</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Conversion</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B500C]">
                {paginatedDemos.map((demo) => {
                  const cfg = DEMO_STATUS_CONFIG[demo.status] || DEMO_STATUS_CONFIG[DEMO_STATUSES.SCHEDULED];
                  const isCompleted = demo.status === DEMO_STATUSES.COMPLETED;
                  const isConverted = Boolean(demo.convertedToStudent);

                  return (
                    <tr key={demo.id} className="hover:bg-[#FFF4E8]/30 transition-colors">
                      {/* Demo ID & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setDetailDemo(demo)}
                          className="font-extrabold text-[#172B50] hover:text-[#F4510B] cursor-pointer block"
                        >
                          {demo.id}
                        </button>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#172B50] opacity-70 mt-0.5">
                          <CalendarDays className="w-3 h-3 text-[#F4510B]" />
                          <span>{demo.demoDate}</span>
                          <span>•</span>
                          <span>{demo.demoTime}</span>
                        </div>
                        {demo.enquiryId && (
                          <span className="text-[10px] font-mono text-[#172B50] opacity-50 block mt-0.5">
                            Ref: {demo.enquiryId}
                          </span>
                        )}
                      </td>

                      {/* Child */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-[#172B50] text-sm block">
                          {demo.childName}
                        </span>
                        <span className="text-[11px] text-[#172B50] opacity-65">
                          {demo.childAge ? `${demo.childAge} yrs` : ''} {demo.gender ? `• ${demo.gender}` : ''}
                        </span>
                      </td>

                      {/* Parent */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-[#172B50]">{demo.parentName}</div>
                        <div className="text-[11px] text-[#172B50] opacity-75">{demo.phone}</div>
                        {demo.email && (
                          <div className="text-[10px] text-[#172B50] opacity-55 truncate max-w-[150px]">
                            {demo.email}
                          </div>
                        )}
                      </td>

                      {/* Location & Program */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#F4510B] uppercase">
                          <MapPin className="w-3 h-3" />
                          {demo.location}
                        </span>
                        <div className="text-xs font-semibold text-[#172B50] opacity-85 truncate max-w-[170px] mt-0.5">
                          {demo.program}
                        </div>
                      </td>

                      {/* Coach */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#172B50]">
                          <UserCheck className="w-3.5 h-3.5 text-[#172B50] opacity-60" />
                          {demo.coachName || 'Unassigned'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(demo, demo.status)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border transition-all cursor-pointer hover:shadow-xs ${cfg.badgeClass}`}
                          title="Click to change status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                          <span>{demo.status}</span>
                        </button>
                      </td>

                      {/* Conversion Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isConverted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Enrolled ({demo.studentId})</span>
                          </span>
                        ) : isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30]">
                            Ready for Admission
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-[#172B50] opacity-50">
                            Pending Demo
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailDemo(demo)}
                          className="p-1.5 rounded-lg text-[#172B50] hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View Details & History"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenRescheduleModal(demo)}
                          className="p-1.5 rounded-lg text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                          title="Reschedule Demo"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        {!isConverted ? (
                          <button
                            type="button"
                            onClick={() => handleOpenConvertModal(demo)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs transition-all cursor-pointer ${
                              isCompleted
                                ? 'bg-[#F4510B] text-white hover:brightness-110 active:scale-95'
                                : 'bg-[#172B50] text-white hover:bg-[#F4510B]'
                            }`}
                            title="Convert into registered Student"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Convert to Student</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (demo.studentId && navigateToPersonRecord) {
                                navigateToPersonRecord('student', demo.studentId);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-[#172B50] hover:bg-slate-200 cursor-pointer"
                          >
                            <span>View Athlete</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-[#172B5012] flex items-center justify-between">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 text-xs font-bold rounded-lg border border-[#172B5020] text-[#172B50] disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  type="button"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer ${
                    currentPage === i + 1
                      ? 'bg-[#172B50] text-white'
                      : 'text-[#172B50] hover:bg-[#FFF4E8]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 text-xs font-bold rounded-lg border border-[#172B5020] text-[#172B50] disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: ADD / SCHEDULE NEW DEMO                                    */}
      {/* =================================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={addForm.enquiryId ? `Book Demo for Lead: ${addForm.enquiryId}` : 'Book New Demo Class'}
        subtitle="Hierarchy: Academy Location → Sports Program → Filtered Coach"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveAddDemo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Academy Location *</label>
              <select
                required
                value={addForm.location}
                onChange={(e) => setAddForm({ ...addForm, location: e.target.value, coachId: '' })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] font-semibold"
              >
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
                value={addForm.program}
                onChange={(e) => setAddForm({ ...addForm, program: e.target.value, coachId: '' })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] font-semibold"
              >
                {(data.programs || []).map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#172B50] mb-1">Child / Athlete Name *</label>
              <input
                type="text"
                required
                value={addForm.childName}
                onChange={(e) => setAddForm({ ...addForm, childName: e.target.value })}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Age / Gender</label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="number"
                  min="2"
                  max="18"
                  value={addForm.childAge}
                  onChange={(e) => setAddForm({ ...addForm, childAge: e.target.value })}
                  placeholder="Age"
                  className="w-full px-2 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
                />
                <select
                  value={addForm.gender}
                  onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                  className="w-full px-2 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                value={addForm.parentName}
                onChange={(e) => setAddForm({ ...addForm, parentName: e.target.value })}
                placeholder="e.g. Vikram Sharma"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Parent Mobile Number *</label>
              <input
                type="tel"
                required
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                placeholder="e.g. +91 98401 23456"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Demo Date *</label>
              <input
                type="date"
                required
                value={addForm.demoDate}
                onChange={(e) => setAddForm({ ...addForm, demoDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Demo Time *</label>
              <input
                type="time"
                required
                value={addForm.demoTime}
                onChange={(e) => setAddForm({ ...addForm, demoTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Assigned Coach</label>
              <select
                value={addForm.coachId}
                onChange={(e) => {
                  const id = e.target.value;
                  const c = data.coaches.find((x) => x.id === id);
                  setAddForm({ ...addForm, coachId: id, coachName: c ? c.name : '' });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              >
                <option value="">Select Coach</option>
                {eligibleCoachesForAdd.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.center})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">Special Notes / Goals</label>
            <textarea
              rows={2}
              value={addForm.notes}
              onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
              placeholder="e.g. Focus on balance beam safety, first time in gymnastics academy..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#172B5014]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#F4510B] text-white hover:brightness-110 active:scale-95 cursor-pointer shadow-sm"
            >
              Confirm Demo Booking
            </button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 2: RESCHEDULE DEMO                                            */}
      {/* =================================================================== */}
      <Modal
        isOpen={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        title={rescheduleTarget ? `Reschedule Demo: ${rescheduleTarget.id}` : 'Reschedule Demo'}
        subtitle={rescheduleTarget ? `${rescheduleTarget.childName} • Current: ${rescheduleTarget.demoDate} ${rescheduleTarget.demoTime}` : ''}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveReschedule} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Academy Location *</label>
              <select
                required
                value={rescheduleForm.location}
                onChange={(e) =>
                  setRescheduleForm({ ...rescheduleForm, location: e.target.value, coachId: '' })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              >
                {activeLocations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Assigned Coach</label>
              <select
                value={rescheduleForm.coachId}
                onChange={(e) => {
                  const id = e.target.value;
                  const c = data.coaches.find((x) => x.id === id);
                  setRescheduleForm({
                    ...rescheduleForm,
                    coachId: id,
                    coachName: c ? c.name : '',
                  });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              >
                <option value="">Select Coach</option>
                {eligibleCoachesForReschedule.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.center})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">New Demo Date *</label>
              <input
                type="date"
                required
                value={rescheduleForm.demoDate}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, demoDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">New Demo Time *</label>
              <input
                type="time"
                required
                value={rescheduleForm.demoTime}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, demoTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">Reason for Rescheduling *</label>
            <input
              type="text"
              required
              value={rescheduleForm.rescheduleReason}
              onChange={(e) =>
                setRescheduleForm({ ...rescheduleForm, rescheduleReason: e.target.value })
              }
              placeholder="e.g. Parent requested weekend morning session due to school exam"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#172B5014]">
            <button
              type="button"
              onClick={() => setRescheduleTarget(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#F4510B] text-white hover:brightness-110 cursor-pointer shadow-sm"
            >
              Confirm Reschedule
            </button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 3: UPDATE DEMO STATUS                                         */}
      {/* =================================================================== */}
      <Modal
        isOpen={Boolean(statusChangeTarget)}
        onClose={() => setStatusChangeTarget(null)}
        title={statusChangeTarget ? `Update Status: ${statusChangeTarget.id}` : 'Update Status'}
        subtitle={statusChangeTarget ? `${statusChangeTarget.childName} • ${statusChangeTarget.program}` : ''}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveStatusChange} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">Select New Status *</label>
            <select
              value={newStatusValue}
              onChange={(e) => setNewStatusValue(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] font-bold"
            >
              {Object.values(DEMO_STATUSES).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">Audit Note / Outcome</label>
            <textarea
              rows={3}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g. Attended session on time. Coach notes high enthusiasm and motor readiness."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#172B5014]">
            <button
              type="button"
              onClick={() => setStatusChangeTarget(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#F4510B] text-white hover:brightness-110 cursor-pointer shadow-sm"
            >
              Save Status
            </button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 4: DEMO DETAILS & TIMELINE HISTORY                            */}
      {/* =================================================================== */}
      <Modal
        isOpen={Boolean(detailDemo)}
        onClose={() => setDetailDemo(null)}
        title={detailDemo ? `Demo Class Dossier: ${detailDemo.id}` : 'Demo Details'}
        subtitle={detailDemo ? `${detailDemo.childName} • ${detailDemo.location}` : ''}
        maxWidth="max-w-2xl"
      >
        {detailDemo && (
          <div className="space-y-5">
            {/* Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-[#FFF4E8]/60 border border-[#172B5015]">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60">Status</span>
                <p className="text-xs font-extrabold text-[#172B50] mt-0.5">{detailDemo.status}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60">Date &amp; Time</span>
                <p className="text-xs font-extrabold text-[#172B50] mt-0.5">
                  {detailDemo.demoDate} • {detailDemo.demoTime}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60">Location</span>
                <p className="text-xs font-extrabold text-[#F4510B] mt-0.5">{detailDemo.location}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60">Coach</span>
                <p className="text-xs font-extrabold text-[#172B50] mt-0.5">
                  {detailDemo.coachName || 'Unassigned'}
                </p>
              </div>
            </div>

            {/* Child & Parent Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-[#172B5012] bg-white space-y-1.5">
                <span className="text-[10px] font-extrabold text-[#172B50] uppercase tracking-wider block">
                  Athlete Details
                </span>
                <p className="text-sm font-extrabold text-[#172B50]">{detailDemo.childName}</p>
                <p className="text-xs text-[#172B50] opacity-75">
                  Age: {detailDemo.childAge || 'N/A'} yrs • Gender: {detailDemo.gender || 'N/A'}
                </p>
                <p className="text-xs text-[#172B50] opacity-75">Program: {detailDemo.program}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#172B5012] bg-white space-y-1.5">
                <span className="text-[10px] font-extrabold text-[#172B50] uppercase tracking-wider block">
                  Parent / Guardian
                </span>
                <p className="text-sm font-extrabold text-[#172B50]">{detailDemo.parentName}</p>
                <p className="text-xs text-[#172B50] opacity-75">Phone: {detailDemo.phone}</p>
                {detailDemo.email && (
                  <p className="text-xs text-[#172B50] opacity-75">Email: {detailDemo.email}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            {detailDemo.notes && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#172B50]">
                <span className="font-bold block mb-0.5">Notes &amp; Session Brief:</span>
                <p className="opacity-80">{detailDemo.notes}</p>
              </div>
            )}

            {/* Timeline Audit History */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#172B50] uppercase tracking-wider">
                <History className="w-4 h-4 text-[#F4510B]" />
                <span>Demo Audit History &amp; Transitions</span>
              </div>

              <div className="relative pl-6 space-y-4 border-l-2 border-[#172B5015] ml-2">
                {(detailDemo.history || []).map((h, idx) => (
                  <div key={h.id || idx} className="relative">
                    <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#F4510B] ring-4 ring-white" />
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#172B50]">{h.action}</span>
                      <span className="text-[#172B50] opacity-50">
                        {h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}
                      </span>
                    </div>
                    <p className="text-xs text-[#172B50] opacity-80 mt-0.5">{h.note}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#172B50] opacity-60 mt-1">
                      <span>Updated by: {h.updatedBy || 'Admin'}</span>
                      {h.coachName && <span>• Coach: {h.coachName}</span>}
                      {h.location && <span>• Location: {h.location}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-[#172B5014]">
              <div className="flex items-center gap-2">
                {!detailDemo.convertedToStudent && (
                  <button
                    type="button"
                    onClick={() => {
                      const tgt = detailDemo;
                      setDetailDemo(null);
                      handleOpenConvertModal(tgt);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#F4510B] text-white hover:brightness-110 cursor-pointer shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Convert to Student</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDetailDemo(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 5: CONVERT DEMO TO STUDENT                                    */}
      {/* =================================================================== */}
      <Modal
        isOpen={Boolean(convertTarget)}
        onClose={() => {
          setConvertTarget(null);
          setConvertResult(null);
        }}
        title={convertResult ? 'Enrollment Confirmed!' : 'Convert Demo to Student'}
        subtitle={
          convertTarget
            ? `Demo ${convertTarget.id} → Student Record (${convertTarget.childName})`
            : ''
        }
        maxWidth="max-w-xl"
      >
        {convertResult ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 text-sm font-extrabold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Student Successfully Enrolled!</span>
              </div>
              <p className="text-xs opacity-90">
                Created athlete record for <strong>{convertResult.student.name}</strong> (
                {convertResult.student.id}) at <strong>{convertResult.student.center}</strong>.
              </p>
              <p className="text-xs opacity-90">
                Linked to Parent <strong>{convertResult.parent.name}</strong> (
                {convertResult.parent.id}).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-xl bg-[#FFF4E8]/60 border border-[#172B5014]">
              <div>
                <span className="font-bold text-[#172B50] opacity-60 block text-[10px] uppercase">
                  Student ID
                </span>
                <span className="font-extrabold text-[#172B50] text-sm">
                  {convertResult.student.id}
                </span>
              </div>
              <div>
                <span className="font-bold text-[#172B50] opacity-60 block text-[10px] uppercase">
                  Parent ID
                </span>
                <span className="font-extrabold text-[#172B50] text-sm">
                  {convertResult.parent.id}
                </span>
              </div>
              <div>
                <span className="font-bold text-[#172B50] opacity-60 block text-[10px] uppercase">
                  Location
                </span>
                <span className="font-extrabold text-[#F4510B]">
                  {convertResult.student.center}
                </span>
              </div>
              <div>
                <span className="font-bold text-[#172B50] opacity-60 block text-[10px] uppercase">
                  Program
                </span>
                <span className="font-bold text-[#172B50]">
                  {convertResult.student.program}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConvertTarget(null);
                  setConvertResult(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#172B50] text-white hover:bg-[#F4510B] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          convertTarget && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                <span className="font-bold block mb-0.5">Automated Pre-population:</span>
                Child and parent information, selected academy location (
                <strong>{convertTarget.location}</strong>), and sport program (
                <strong>{convertTarget.program}</strong>) will be transferred automatically into
                People Management.
              </div>

              {/* Readonly Summary */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#FFF4E8]/50 border border-[#172B5014] text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">
                    Athlete Name
                  </span>
                  <span className="font-extrabold text-[#172B50]">{convertTarget.childName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">
                    Parent / Guardian
                  </span>
                  <span className="font-extrabold text-[#172B50]">{convertTarget.parentName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">
                    Mandatory Location
                  </span>
                  <span className="font-extrabold text-[#F4510B]">{convertTarget.location}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">
                    Sports Program
                  </span>
                  <span className="font-bold text-[#172B50]">{convertTarget.program}</span>
                </div>
              </div>

              {/* Assign Batch */}
              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">
                  Assign Training Batch (Optional)
                </label>
                {matchingBatchesForConvert.length > 0 ? (
                  <select
                    value={convertOverrides.preferredBatchId}
                    onChange={(e) =>
                      setConvertOverrides({
                        ...convertOverrides,
                        preferredBatchId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
                  >
                    <option value="">No Batch Assigned Yet (Assign Later)</option>
                    {matchingBatchesForConvert.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.schedule || 'Regular'}) • Cap {b.capacity}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[11px] text-[#172B50] opacity-60 italic">
                    No active batches found at {convertTarget.location} for {convertTarget.program}.
                    Batch can be assigned later under Programs &amp; Batches.
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">
                  Admission Notes / Medical Record
                </label>
                <input
                  type="text"
                  value={convertOverrides.notes}
                  onChange={(e) =>
                    setConvertOverrides({ ...convertOverrides, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#172B5014]">
                <button
                  type="button"
                  onClick={() => setConvertTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isConverting}
                  onClick={handleExecuteConversion}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-extrabold bg-[#F4510B] text-white hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isConverting ? 'Enrolling...' : 'Confirm Student Enrollment'}</span>
                </button>
              </div>
            </div>
          )
        )}
      </Modal>
    </div>
  );
}
