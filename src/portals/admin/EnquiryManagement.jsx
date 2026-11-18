import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  CheckCircle2,
  Calendar,
  ArrowRight,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Info,
  Eye,
  Edit3,
  UserPlus,
  User,
  Users,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  CalendarDays,
  Globe,
  Sparkles,
  TrendingUp,
  GraduationCap,
  Filter,
  Layers,
  X,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import KpiCard from '../../components/common/KpiCard';
import { getCommonLocations, filterEnquiries } from '../../services/locationService';
import {
  calculateAgeFromDob,
  findExistingParent,
  validateEnquiryForEnrollment,
} from '../../services/enrollmentService';
import {
  ENQUIRY_SOURCES,
  ENQUIRY_SOURCE_CONFIG,
  DEMO_STATUSES,
  filterCoachesForDemo,
  calculateDemoMetrics,
} from '../../services/demoService';

const WORKFLOW_STAGES = [
  'All',
  'New',
  'Follow-up',
  'Interested',
  'Trial Scheduled',
  'Trial Completed',
  'Enrolled',
];

const formatDateLabel = (ymdStr) => {
  if (!ymdStr) return '';
  try {
    const [y, m, d] = ymdStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (err) {
    return ymdStr;
  }
};

export default function EnquiryManagement() {
  const {
    data,
    addEnquiry,
    updateEnquiry,
    updateEnquiryStage,
    enrollFromEnquiry,
    addDemo,
    navigateToPersonRecord,
    setCurrentView,
  } = useCrm();

  const commonLocations = getCommonLocations(data);
  const todayYmd = new Date().toISOString().split('T')[0];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Create / Edit Enquiry Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [formState, setFormState] = useState({
    childName: '',
    dob: '',
    childAge: '6',
    gender: 'Male',
    parentName: '',
    phone: '',
    email: '',
    interestedProgram: data.programs[0]?.name || '',
    center: commonLocations[0]?.name || 'KK NAGAR',
    preferredBatchId: '',
    source: ENQUIRY_SOURCES.MANUAL,
    enquiryDate: todayYmd,
    notes: '',
    stage: 'New',
  });

  // Convert to Demo Modal State
  const [demoModalEnquiry, setDemoModalEnquiry] = useState(null);
  const [demoModalForm, setDemoModalForm] = useState({
    demoDate: todayYmd,
    demoTime: '17:00',
    coachId: '',
    coachName: '',
    notes: '',
  });

  // Enquiry Details Modal state
  const [detailEnquiryId, setDetailEnquiryId] = useState(null);

  // Enrollment Confirmation & Success Modal state
  const [enrollModalEnquiry, setEnrollModalEnquiry] = useState(null);
  const [enrollOverrides, setEnrollOverrides] = useState({
    dob: '',
    childAge: '',
    gender: 'Male',
    preferredBatchId: '',
    center: '',
    interestedProgram: '',
    email: '',
    phone: '',
  });
  const [enrollErrors, setEnrollErrors] = useState([]);
  const [isSubmittingEnrollment, setIsSubmittingEnrollment] = useState(false);
  const [enrollmentResult, setEnrollmentResult] = useState(null);

  const locationScopedEnquiries = filterEnquiries(data.enquiries || [], {
    location: selectedLocation,
    date: selectedDate,
  });

  const filteredEnquiries = filterEnquiries(data.enquiries || [], {
    location: selectedLocation,
    stage: selectedStage,
    source: selectedSource,
    date: selectedDate,
    search: searchTerm,
  });

  const totalPages = Math.max(1, Math.ceil(filteredEnquiries.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedEnquiries = filteredEnquiries.slice((safePage - 1) * pageSize, safePage * pageSize);

  const detailEnquiry = useMemo(
    () => (data.enquiries || []).find((e) => e.id === detailEnquiryId) || null,
    [data.enquiries, detailEnquiryId]
  );

  const pipelineMetrics = useMemo(() => {
    return calculateDemoMetrics(data.enquiries || [], data.demos || [], data.students || []);
  }, [data.enquiries, data.demos, data.students]);

  // Matching batches filtered dynamically to Location & Program inside Enquiry Form
  const availableFormBatches = useMemo(() => {
    return (data.classes || []).filter(
      (c) =>
        c.status !== 'Inactive' &&
        (!formState.center || c.center === formState.center) &&
        (!formState.interestedProgram || c.program === formState.interestedProgram)
    );
  }, [data.classes, formState.center, formState.interestedProgram]);

  // Matching batches inside Enrollment Confirmation modal
  const availableEnrollBatches = useMemo(() => {
    const loc = enrollOverrides.center || enrollModalEnquiry?.center;
    const prog = enrollOverrides.interestedProgram || enrollModalEnquiry?.interestedProgram;
    return (data.classes || []).filter(
      (c) => c.status !== 'Inactive' && (!loc || c.center === loc) && (!prog || c.program === prog)
    );
  }, [data.classes, enrollModalEnquiry, enrollOverrides]);

  // Live parent match preview during Enrollment Confirmation
  const matchedExistingParentPreview = useMemo(() => {
    if (!enrollModalEnquiry) return null;
    return findExistingParent(data.parents || [], {
      email: enrollOverrides.email || enrollModalEnquiry.email,
      phone: enrollOverrides.phone || enrollModalEnquiry.phone,
    });
  }, [data.parents, enrollModalEnquiry, enrollOverrides]);

  const handleLocationChange = (locName) => {
    setSelectedLocation(locName);
    setCurrentPage(1);
    if (locName !== 'All') {
      setFormState((prev) => ({ ...prev, center: locName, preferredBatchId: '' }));
    }
  };

  const eligibleCoachesForDemoModal = useMemo(() => {
    if (!demoModalEnquiry) return data.coaches || [];
    return filterCoachesForDemo({
      coaches: data.coaches || [],
      location: demoModalEnquiry.center,
      program: demoModalEnquiry.interestedProgram,
    });
  }, [data.coaches, demoModalEnquiry]);

  const handleOpenConvertDemo = (enq) => {
    setDemoModalEnquiry(enq);
    setDemoModalForm({
      demoDate: todayYmd,
      demoTime: '17:00',
      coachId: '',
      coachName: '',
      notes: enq.notes ? `Enquiry note: ${enq.notes}` : '',
    });
  };

  const handleSaveDemoFromEnquiry = (e) => {
    e.preventDefault();
    if (!demoModalEnquiry) return;
    const coachObj = (data.coaches || []).find((c) => c.id === demoModalForm.coachId);
    const payload = {
      enquiryId: demoModalEnquiry.id,
      childName: demoModalEnquiry.childName,
      childAge: demoModalEnquiry.childAge,
      gender: demoModalEnquiry.gender,
      dob: demoModalEnquiry.dob,
      parentName: demoModalEnquiry.parentName,
      phone: demoModalEnquiry.phone,
      email: demoModalEnquiry.email,
      location: demoModalEnquiry.center,
      program: demoModalEnquiry.interestedProgram,
      demoDate: demoModalForm.demoDate,
      demoTime: demoModalForm.demoTime,
      coachId: demoModalForm.coachId,
      coachName: coachObj ? coachObj.name : 'Assigned Coach',
      notes: demoModalForm.notes,
    };

    const res = addDemo(payload);
    if (res.success) {
      setDemoModalEnquiry(null);
    }
  };

  const handleOpenAddModal = () => {
    const initialCenter = selectedLocation !== 'All' ? selectedLocation : commonLocations[0]?.name || 'KK NAGAR';
    setEditingEnquiry(null);
    setFormState({
      childName: '',
      dob: '',
      childAge: '6',
      gender: 'Male',
      parentName: '',
      phone: '',
      email: '',
      interestedProgram: data.programs[0]?.name || '',
      center: initialCenter,
      preferredBatchId: '',
      source: ENQUIRY_SOURCES.MANUAL,
      enquiryDate: todayYmd,
      notes: '',
      stage: 'New',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (enq) => {
    setEditingEnquiry(enq);
    setFormState({
      childName: enq.childName || '',
      dob: enq.dob || '',
      childAge: String(enq.childAge || 6),
      gender: enq.gender || 'Male',
      parentName: enq.parentName || '',
      phone: enq.phone || '',
      email: enq.email || '',
      interestedProgram: enq.interestedProgram || data.programs[0]?.name || '',
      center: enq.center || commonLocations[0]?.name || 'KK NAGAR',
      preferredBatchId: enq.preferredBatchId || '',
      source: enq.source || ENQUIRY_SOURCES.MANUAL,
      enquiryDate: enq.enquiryDate || enq.createdAt || todayYmd,
      notes: enq.notes || '',
      stage: enq.stage || 'New',
    });
    setIsFormModalOpen(true);
  };

  const handleDobChange = (dobValue) => {
    const computedAge = calculateAgeFromDob(dobValue);
    setFormState((prev) => ({
      ...prev,
      dob: dobValue,
      childAge: computedAge !== null ? String(computedAge) : prev.childAge,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formState.childName.trim() || !formState.parentName.trim() || !formState.phone.trim()) return;

    const pickedBatch = (data.classes || []).find((c) => c.id === formState.preferredBatchId);
    const payload = {
      childName: formState.childName.trim(),
      dob: formState.dob,
      childAge: parseInt(formState.childAge, 10) || calculateAgeFromDob(formState.dob) || 6,
      gender: formState.gender,
      parentName: formState.parentName.trim(),
      phone: formState.phone.trim(),
      email: formState.email.trim(),
      interestedProgram: formState.interestedProgram,
      center: formState.center,
      preferredBatchId: pickedBatch?.id || '',
      preferredBatchName: pickedBatch?.name || '',
      source: formState.source || ENQUIRY_SOURCES.MANUAL,
      enquiryDate: formState.enquiryDate || todayYmd,
      notes: formState.notes.trim() || 'Enquiry received via admissions desk.',
      stage: formState.stage || 'New',
    };

    if (editingEnquiry) {
      updateEnquiry(editingEnquiry.id, payload);
    } else {
      addEnquiry({
        ...payload,
        trialDate: '-',
        assignedTo: 'Support Agent Priya',
      });
    }

    setIsFormModalOpen(false);
    setEditingEnquiry(null);
  };

  const openEnrollConfirmation = (enq) => {
    if (enq.stage === 'Enrolled') return;
    setEnrollModalEnquiry(enq);
    setEnrollOverrides({
      dob: enq.dob || '',
      childAge: String(enq.childAge || ''),
      gender: enq.gender || 'Male',
      preferredBatchId: enq.preferredBatchId || '',
      center: enq.center || '',
      interestedProgram: enq.interestedProgram || '',
      email: enq.email || '',
      phone: enq.phone || '',
    });
    setEnrollErrors([]);
    setEnrollmentResult(null);
    setIsSubmittingEnrollment(false);
  };

  const handleConfirmEnrollment = (e) => {
    e.preventDefault();
    if (!enrollModalEnquiry || isSubmittingEnrollment) return;

    setIsSubmittingEnrollment(true);
    setEnrollErrors([]);

    const pickedBatch = (data.classes || []).find((c) => c.id === enrollOverrides.preferredBatchId);
    const overridesPayload = {
      dob: enrollOverrides.dob,
      childAge: parseInt(enrollOverrides.childAge, 10) || calculateAgeFromDob(enrollOverrides.dob) || enrollModalEnquiry.childAge,
      gender: enrollOverrides.gender,
      preferredBatchId: pickedBatch?.id || '',
      preferredBatchName: pickedBatch?.name || '',
      center: enrollOverrides.center,
      interestedProgram: enrollOverrides.interestedProgram,
      email: enrollOverrides.email.trim(),
      phone: enrollOverrides.phone.trim(),
    };

    // Pre-validate locally for crisp inline feedback before running context transaction
    const check = validateEnquiryForEnrollment(enrollModalEnquiry, overridesPayload, commonLocations);
    if (!check.valid) {
      setEnrollErrors(check.errors);
      setIsSubmittingEnrollment(false);
      return;
    }

    const res = enrollFromEnquiry(enrollModalEnquiry.id, overridesPayload);
    if (!res.success) {
      setEnrollErrors(res.errors || ['Unable to complete enrollment.']);
      setIsSubmittingEnrollment(false);
      return;
    }

    setEnrollmentResult(res);
    setIsSubmittingEnrollment(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Enquiries
          </h1>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>New Admission Lead</span>
        </button>
      </div>

      {/* 4 Hero Funnel KPI Cards matching reference design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard
          title="Total Enquiries"
          value={pipelineMetrics.totalEnquiries || (data.enquiries || []).length || 0}
          subtitle={`Across ${commonLocations.length} locations`}
          icon={Users}
          color="orange"
        />

        <KpiCard
          title="Demo Scheduled"
          value={String(pipelineMetrics.upcomingDemos || 0).padStart(2, '0')}
          subtitle="Trial sessions in progress"
          icon={Calendar}
          color="blue"
        />

        <KpiCard
          title="Enrolled Students"
          value={(data.students || []).length || 0}
          subtitle="Enrolled from enquiries"
          icon={GraduationCap}
          color="green"
        />

        <KpiCard
          title="Conversion Rate"
          value={`${pipelineMetrics.conversionRate || 0}%`}
          subtitle={`${pipelineMetrics.studentConversions || 0} enrolled athletes`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* 1. Filter and Action Bar (Matching Reference Image 1) */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[320px]">
            {/* Location Selector (White pill with MapPin & ChevronDown) */}
            <div className="relative inline-flex items-center">
              <MapPin className="w-4 h-4 text-[#F4510B] absolute left-3.5 pointer-events-none z-10" />
              <select
                aria-label="Filter enquiries by academy location"
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="pl-9 pr-8 py-2 text-xs font-bold bg-white text-[#172B50] border border-[#172B5018] rounded-2xl shadow-2xs hover:border-[#F4510B50] focus:outline-none focus:ring-2 focus:ring-[#F4510B20] focus:border-[#F4510B] cursor-pointer appearance-none transition-all"
              >
                <option value="All">All Locations ({(data.enquiries || []).length})</option>
                {commonLocations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name} ({(data.enquiries || []).filter((e) => e.center === loc.name).length})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/50 absolute right-3 pointer-events-none" />
            </div>

            {/* Search Input (White pill with Search icon) */}
            <div className="relative flex-1 min-w-[240px] max-w-lg">
              <Search className="w-4 h-4 text-[#172B50]/40 absolute left-3.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by child, parent, phone, or Enquiry ID..."
                className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-white text-[#172B50] placeholder-[#172B5060] border border-[#172B5018] rounded-2xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#F4510B20] focus:border-[#F4510B] transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-2.5 text-[#172B50]/40 hover:text-[#172B50] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Today Quick Preset Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedDate(selectedDate === todayYmd ? '' : todayYmd);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-2xl border transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 ${
                selectedDate === todayYmd
                  ? 'bg-[#FFF5ED] border-[#F4510B] text-[#F4510B]'
                  : 'bg-white border-[#F4510B55] text-[#172B50] hover:border-[#F4510B] hover:bg-[#FFF5ED]'
              }`}
              title="Filter by Today's Date"
            >
              <Calendar className="w-3.5 h-3.5 text-[#F4510B]" />
              <span>Today</span>
            </button>

            {/* Date Picker Button (Native Picker trigger) */}
            <div className="relative inline-flex items-center justify-center">
              <button
                type="button"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                  selectedDate && selectedDate !== todayYmd
                    ? 'bg-[#FFF5ED] border-[#F4510B] text-[#F4510B]'
                    : 'bg-white border-[#F4510B55] text-[#F4510B] hover:border-[#F4510B] hover:bg-[#FFF5ED]'
                }`}
                title={selectedDate ? `Date Filter: ${selectedDate}` : 'Filter by Date'}
              >
                <Calendar className="w-4 h-4 text-[#F4510B]" />
              </button>
              <input
                type="date"
                aria-label="Filter enquiries by specific date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>

            {/* Filter Funnel Toggle Button */}
            <button
              type="button"
              onClick={() => setShowFilterDrawer((prev) => !prev)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                showFilterDrawer || selectedStage !== 'All' || selectedSource !== 'All'
                  ? 'bg-[#FFF5ED] border-[#F4510B] text-[#F4510B]'
                  : 'bg-white border-[#172B5018] text-[#F4510B] hover:border-[#F4510B55] hover:bg-[#FFF5ED]'
              }`}
              title="Toggle Stage & Source Filters"
            >
              <Filter className="w-4 h-4 text-[#F4510B]" />
            </button>
          </div>

          {/* Right Summary Text */}
          <div className="text-xs font-semibold text-[#172B50]/75 whitespace-nowrap ml-auto">
            Showing <strong className="text-[#172B50] font-black">{filteredEnquiries.length}</strong>{' '}
            {selectedLocation === 'All' ? 'across all locations' : `at ${selectedLocation}`}
          </div>
        </div>

        {/* Optional Active Filters Badge Bar */}
        {(selectedDate || selectedStage !== 'All' || selectedSource !== 'All') && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {selectedDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF5ED] border border-[#F4510B40] text-[#F4510B] font-bold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date: {formatDateLabel(selectedDate) || selectedDate}</span>
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="hover:text-[#172B50] ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedStage !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF5ED] border border-[#F4510B40] text-[#F4510B] font-bold">
                <span>Stage: {selectedStage}</span>
                <button
                  type="button"
                  onClick={() => setSelectedStage('All')}
                  className="hover:text-[#172B50] ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedSource !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF5ED] border border-[#F4510B40] text-[#F4510B] font-bold">
                <span>Source: {selectedSource}</span>
                <button
                  type="button"
                  onClick={() => setSelectedSource('All')}
                  className="hover:text-[#172B50] ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Collapsible Advanced Filters Drawer (revealed when filter funnel clicked) */}
        {showFilterDrawer && (
          <div className="bg-white rounded-2xl p-4 border border-[#172B5015] shadow-xs space-y-3 animate-in fade-in duration-150">
            {/* Stage Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#172B50]/60 mr-1 shrink-0">
                Stage:
              </span>
              {WORKFLOW_STAGES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setSelectedStage(st);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedStage === st
                      ? 'bg-[#172B50] text-white shadow-xs'
                      : 'bg-[#FFF5ED] text-[#172B50] hover:bg-[#FFE8D6] border border-[#172B5010]'
                  }`}
                >
                  {st}{' '}
                  {st !== 'All'
                    ? `(${locationScopedEnquiries.filter((e) => e.stage === st).length})`
                    : `(${locationScopedEnquiries.length})`}
                </button>
              ))}
            </div>

            {/* Source Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#172B500C]">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#172B50]/60 mr-1 shrink-0">
                Source:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedSource('All');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedSource === 'All'
                    ? 'bg-[#172B50] text-white shadow-xs'
                    : 'bg-slate-100 text-[#172B50] hover:bg-slate-200'
                }`}
              >
                All Sources ({locationScopedEnquiries.length})
              </button>
              {Object.values(ENQUIRY_SOURCES).map((src) => {
                const count = locationScopedEnquiries.filter(
                  (e) => (e.source || ENQUIRY_SOURCES.MANUAL).toLowerCase() === src.toLowerCase()
                ).length;
                const cfg = ENQUIRY_SOURCE_CONFIG[src];
                const isSelected = selectedSource === src;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => {
                      setSelectedSource(src);
                      setCurrentPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? `${cfg.badgeClass} ring-2 ring-[#F4510B]`
                        : `${cfg.badgeClass} opacity-85 hover:opacity-100`
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                    <span>
                      {src} ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Enquiries Table (Matching Reference Image 1) */}
      <div className="bg-white rounded-3xl border border-[#172B5015] shadow-[0_4px_25px_rgba(23,43,80,0.03)] overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FFF5ED] text-[#172B50] border-b border-[#172B5010]">
                <th className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#F4510B]" />
                    <span className="font-extrabold text-[#172B50] text-xs sm:text-[13px] tracking-tight">
                      Enquiry ID &amp; Date
                    </span>
                  </div>
                </th>
                <th className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#F4510B]" />
                    <span className="font-extrabold text-[#172B50] text-xs sm:text-[13px] tracking-tight">
                      Lead Source
                    </span>
                  </div>
                </th>
                <th className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#F4510B]" />
                    <span className="font-extrabold text-[#172B50] text-xs sm:text-[13px] tracking-tight">
                      Child Details
                    </span>
                  </div>
                </th>
                <th className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#F4510B]" />
                    <span className="font-extrabold text-[#172B50] text-xs sm:text-[13px] tracking-tight">
                      Parent &amp; Contact
                    </span>
                  </div>
                </th>
                <th className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#F4510B]" />
                    <span className="font-extrabold text-[#172B50] text-xs sm:text-[13px] tracking-tight">
                      Location &amp; Program
                    </span>
                  </div>
                </th>
                <th className="py-4 px-5 text-right">
                  <span className="font-extrabold text-[#172B50] text-xs sm:text-[13px] tracking-tight block text-right">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172B5010]">
              {paginatedEnquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-14 sm:py-16 px-4 text-center">
                    <div className="flex flex-col items-center justify-center max-w-lg mx-auto">
                      {/* Stylized Illustrated Graphic: Clipboard + Checklist + Magnifying Glass + Radiating Rays */}
                      <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                        <div className="absolute inset-0 bg-[#FFF5ED] rounded-full blur-[1px] transform scale-95" />
                        <svg 
                          className="w-20 h-20 relative z-10 text-[#F4510B]" 
                          viewBox="0 0 80 80" 
                          fill="none" 
                          stroke="currentColor" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {/* Radiating sparkle rays at top-right */}
                          <path d="M55 12L60 8" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M63 19L68 17" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M59 26L64 27" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" />

                          {/* Clipboard base */}
                          <rect 
                            x="22" 
                            y="18" 
                            width="33" 
                            height="43" 
                            rx="6" 
                            stroke="#F4510B" 
                            strokeWidth="2.5" 
                            fill="#FFFFFF" 
                          />

                          {/* Clip at top */}
                          <path 
                            d="M31 18V15C31 13.3431 32.3431 12 34 12H43C44.6569 12 46 13.3431 46 15V18" 
                            stroke="#F4510B" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                          />
                          <circle cx="38.5" cy="15" r="1.5" fill="#F4510B" />

                          {/* Checklist item 1 */}
                          <path d="M28 29L30.5 31.5L34 28" stroke="#F4510B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="37" y1="29.5" x2="47" y2="29.5" stroke="#F4510B" strokeWidth="2" strokeLinecap="round" />

                          {/* Checklist item 2 */}
                          <path d="M28 38L30.5 40.5L34 37" stroke="#F4510B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="37" y1="38.5" x2="44" y2="38.5" stroke="#F4510B" strokeWidth="2" strokeLinecap="round" />

                          {/* Checklist item 3 */}
                          <path d="M28 47L30.5 49.5L34 46" stroke="#F4510B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="37" y1="47.5" x2="42" y2="47.5" stroke="#F4510B" strokeWidth="2" strokeLinecap="round" />

                          {/* Magnifying Glass (sitting at bottom right) */}
                          <circle 
                            cx="47" 
                            cy="48" 
                            r="8" 
                            stroke="#F4510B" 
                            strokeWidth="2.5" 
                            fill="#FFFFFF" 
                          />
                          <line 
                            x1="53" 
                            y1="54" 
                            x2="60" 
                            y2="61" 
                            stroke="#F4510B" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                          />
                        </svg>
                      </div>

                      {/* Heading */}
                      <h3 className="text-lg sm:text-xl font-black text-[#172B50] tracking-tight mb-2">
                        No enquiries found
                      </h3>

                      {/* Subtitle */}
                      <p className="text-xs sm:text-[13px] text-[#172B50]/70 max-w-md mx-auto mb-6 leading-relaxed">
                        No enquiries match the selected location, date range, or search filter.
                      </p>

                      {/* CTA Button */}
                      <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#F4510B] hover:bg-[#d94103] active:scale-95 text-white text-xs sm:text-sm font-bold rounded-full shadow-[0_4px_14px_rgba(244,81,11,0.35)] transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                        <span>Add New Enquiry</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEnquiries.map((enq) => {
                  const src = enq.source || ENQUIRY_SOURCES.MANUAL;
                  const srcCfg =
                    ENQUIRY_SOURCE_CONFIG[src] || ENQUIRY_SOURCE_CONFIG[ENQUIRY_SOURCES.OTHER];

                  return (
                    <tr key={enq.id} className="hover:bg-[#FFF5ED]/40 transition-colors">
                      <td className="py-3.5 px-5">
                        <button
                          type="button"
                          onClick={() => setDetailEnquiryId(enq.id)}
                          className="font-extrabold text-[#172B50] hover:text-[#F4510B] block cursor-pointer"
                        >
                          {enq.id}
                        </button>
                        <span className="text-[10px] text-[#172B50]/60 font-semibold block">
                          {enq.enquiryDate || enq.createdAt}
                        </span>
                      </td>

                      {/* Lead Source Badge & Stage */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${srcCfg.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${srcCfg.dotClass}`} />
                            <span>{src}</span>
                          </span>
                          {enq.stage && (
                            <span className="text-[10px] font-bold text-[#172B50]/60 bg-[#172B5008] px-2 py-0.5 rounded-md border border-[#172B5010]">
                              {enq.stage}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className="font-extrabold text-[#172B50] text-sm block">
                          {enq.childName}
                        </span>
                        <span className="text-[11px] text-[#172B50]/70">
                          {enq.childAge} yrs {enq.gender ? `• ${enq.gender}` : ''}
                          {enq.dob ? ` • DOB ${enq.dob}` : ''}
                        </span>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="font-bold text-[#172B50]">{enq.parentName}</div>
                        <div className="text-[11px] text-[#172B50]/75">{enq.phone}</div>
                        <div className="text-[10px] text-[#172B50]/55 truncate max-w-[165px]">
                          {enq.email}
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className="text-[10px] text-[#F4510B] font-extrabold uppercase block">
                          {enq.center}
                        </span>
                        <span className="font-bold text-[#172B50] block">{enq.interestedProgram}</span>
                        {enq.preferredBatchName && (
                          <span className="text-[10px] text-[#172B50]/70">
                            Batch: {enq.preferredBatchName}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setDetailEnquiryId(enq.id)}
                            title="View Enquiry Details"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B501A] rounded-lg hover:border-[#F4510B] cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          {enq.stage !== 'Enrolled' ? (
                            <>
                              {!enq.demoId ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenConvertDemo(enq)}
                                  title="Convert Lead into Scheduled Demo Class"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-[#172B50] text-white rounded-lg shadow-sm hover:bg-[#F4510B] transition-all cursor-pointer"
                                >
                                  <CalendarDays className="w-3.5 h-3.5" />
                                  <span>Convert to Demo</span>
                                </button>
                              ) : (
                                <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">
                                  Demo: {enq.demoId}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(enq)}
                                title="Edit Enquiry"
                                className="p-1.5 text-[#172B50] hover:bg-[#FFF4E8] rounded-lg cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEnrollConfirmation(enq)}
                                className="px-3 py-1.5 text-xs font-bold bg-[#F4510B] text-white rounded-lg shadow-sm hover:brightness-110 transition-all inline-flex items-center gap-1 cursor-pointer"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Enroll Student</span>
                              </button>
                            </>
                          ) : (
                            <div className="inline-flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Enrolled</span>
                              </span>
                              {enq.enrolledStudentId && (
                                <button
                                  type="button"
                                  onClick={() => navigateToPersonRecord('student', enq.enrolledStudentId)}
                                  className="text-[10px] font-extrabold text-[#F4510B] hover:underline cursor-pointer"
                                >
                                  {enq.enrolledStudentId}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Pagination Footer (Matching Reference Image 1) */}
        <div className="px-5 py-3.5 bg-white border-t border-[#172B5010] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#172B50]">
          <div className="flex items-center gap-2 text-[#172B50]/70 font-semibold">
            <div className="w-4 h-4 rounded-full border border-[#F4510B] text-[#F4510B] flex items-center justify-center text-[10px] font-black shrink-0">
              i
            </div>
            <span>
              Page {safePage} of {totalPages} • {filteredEnquiries.length} enquiry record
              {filteredEnquiries.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-1.5 rounded-xl border border-[#172B5020] bg-white text-xs font-bold text-[#172B50] hover:bg-[#FFF5ED] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              &lt; Prev
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3.5 py-1.5 rounded-xl border border-[#172B5020] bg-white text-xs font-bold text-[#172B50] hover:bg-[#FFF5ED] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>



      {/* Add / Edit Enquiry Lead Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingEnquiry ? `Edit Enquiry: ${editingEnquiry.id}` : 'Add New Enquiry'}
        subtitle="Capture prospective student information"
      >
        <form onSubmit={handleFormSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Child Name *</label>
              <input
                type="text"
                required
                value={formState.childName}
                onChange={(e) => setFormState({ ...formState, childName: e.target.value })}
                placeholder="Child's name"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Parent Name *</label>
              <input
                type="text"
                required
                value={formState.parentName}
                onChange={(e) => setFormState({ ...formState, parentName: e.target.value })}
                placeholder="Parent's name"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formState.phone}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                placeholder="+91 98..."
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Parent Email ID</label>
              <input
                type="email"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                placeholder="parent@example.com"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Location *</label>
              <select
                value={formState.center}
                onChange={(e) => setFormState({ ...formState, center: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {commonLocations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Interested Program</label>
              <select
                value={formState.interestedProgram}
                onChange={(e) => setFormState({ ...formState, interestedProgram: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {data.programs.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Save Enquiry
            </button>
          </div>
        </form>
      </Modal>

      {/* Enquiry Details & Action Modal */}
      <Modal
        isOpen={Boolean(detailEnquiry)}
        onClose={() => setDetailEnquiryId(null)}
        title={detailEnquiry ? `Enquiry Details: ${detailEnquiry.id}` : 'Enquiry Details'}
        subtitle={
          detailEnquiry
            ? `${detailEnquiry.center} • ${detailEnquiry.interestedProgram} • Stage: ${detailEnquiry.stage}`
            : ''
        }
        maxWidth="max-w-2xl"
      >
        {detailEnquiry && (
          <div className="space-y-4">
            {/* Header info bar with Source & Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white border border-[#172B5014]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#172B50]">Enquiry Source:</span>
                {(() => {
                  const src = detailEnquiry.source || ENQUIRY_SOURCES.MANUAL;
                  const srcCfg =
                    ENQUIRY_SOURCE_CONFIG[src] || ENQUIRY_SOURCE_CONFIG[ENQUIRY_SOURCES.OTHER];
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${srcCfg.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${srcCfg.dotClass}`} />
                      <span>{src}</span>
                    </span>
                  );
                })()}
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-[#172B50]">Current Stage:</span>
                <span className="px-2 py-0.5 rounded-md font-extrabold bg-[#172B50] text-white text-[11px]">
                  {detailEnquiry.stage}
                </span>
              </div>
            </div>

            {/* Admission & Demo Progression Strip */}
            <div className="p-3 rounded-xl bg-[#FFF4E8]/80 border border-[#172B5014] space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F4510B] block">
                Workflow Progression:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                {[
                  { name: 'New Enquiry', active: true },
                  {
                    name: 'Demo Scheduled',
                    active:
                      Boolean(detailEnquiry.demoId) ||
                      detailEnquiry.stage === 'Demo Scheduled' ||
                      detailEnquiry.stage === 'Demo Completed' ||
                      detailEnquiry.stage === 'Enrolled',
                  },
                  {
                    name: 'Demo Completed',
                    active:
                      detailEnquiry.stage === 'Demo Completed' || detailEnquiry.stage === 'Enrolled',
                  },
                  { name: 'Student Enrolled', active: detailEnquiry.stage === 'Enrolled' },
                ].map((step, idx, arr) => (
                  <React.Fragment key={step.name}>
                    <span
                      className={`px-2.5 py-1 rounded-lg border text-[10px] ${
                        step.active
                          ? 'bg-[#172B50] text-white border-[#172B50]'
                          : 'bg-white text-[#172B50] border-[#172B5020] opacity-60'
                      }`}
                    >
                      {step.name}
                    </span>
                    {idx < arr.length - 1 && <ArrowRight className="w-3 h-3 text-[#F4510B]" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FFF4E8] p-4 rounded-2xl border border-[#172B5014]">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">
                  Child Information
                </span>
                <p className="text-sm font-extrabold text-[#172B50] mt-0.5">{detailEnquiry.childName}</p>
                <p className="text-xs text-[#172B50] opacity-80">
                  Age: {detailEnquiry.childAge} yrs • Gender: {detailEnquiry.gender || 'Not specified'}
                </p>
                {detailEnquiry.dob && (
                  <p className="text-xs text-[#172B50] opacity-75">DOB: {detailEnquiry.dob}</p>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">
                  Parent / Guardian
                </span>
                <p className="text-sm font-extrabold text-[#172B50] mt-0.5">{detailEnquiry.parentName}</p>
                <p className="text-xs text-[#172B50] opacity-80">{detailEnquiry.phone}</p>
                <p className="text-xs text-[#172B50] opacity-80">{detailEnquiry.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-[#172B5015] bg-white">
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">
                  Academy Location
                </span>
                <span className="font-extrabold text-[#F4510B]">{detailEnquiry.center}</span>
              </div>
              <div className="p-3 rounded-xl border border-[#172B5015] bg-white">
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">
                  Sports Program
                </span>
                <span className="font-bold text-[#172B50]">{detailEnquiry.interestedProgram}</span>
              </div>
              <div className="p-3 rounded-xl border border-[#172B5015] bg-white">
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">
                  Preferred Batch / Date
                </span>
                <span className="font-bold text-[#172B50] block">
                  {detailEnquiry.preferredBatchName || 'Open Batch'}
                </span>
                <span className="text-[10px] text-[#172B50] opacity-60">
                  Enquiry: {detailEnquiry.enquiryDate || detailEnquiry.createdAt}
                </span>
              </div>
            </div>

            {/* Linked Demo Dossier if exists */}
            {detailEnquiry.demoId && (
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 text-xs text-blue-900 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-blue-700" />
                    <span>Linked Demo Class ({detailEnquiry.demoId})</span>
                  </span>
                  {setCurrentView && (
                    <button
                      type="button"
                      onClick={() => {
                        setDetailEnquiryId(null);
                        setCurrentView('demos');
                      }}
                      className="text-[11px] font-bold text-blue-800 hover:underline cursor-pointer"
                    >
                      Open in Demo Management →
                    </button>
                  )}
                </div>
                <p className="text-[11px] opacity-80">
                  A trial class is attached to this enquiry record. Status transitions and reschedule
                  history are tracked in the Demo Management Module.
                </p>
              </div>
            )}

            <div className="p-3 rounded-xl border border-[#172B5015] bg-white text-xs text-[#172B50]">
              <span className="text-[10px] font-bold uppercase opacity-60 block mb-1">Additional Notes</span>
              <p>{detailEnquiry.notes || 'No notes recorded.'}</p>
            </div>

            {detailEnquiry.stage === 'Enrolled' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enrollment Completed &amp; Synchronized</span>
                </div>
                <p className="text-xs text-emerald-900">
                  Student ID <strong>{detailEnquiry.enrolledStudentId}</strong> and Parent ID{' '}
                  <strong>{detailEnquiry.enrolledParentId}</strong> are connected to this enquiry under{' '}
                  <strong>{detailEnquiry.center}</strong>.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {detailEnquiry.enrolledStudentId && (
                    <button
                      type="button"
                      onClick={() => {
                        setDetailEnquiryId(null);
                        navigateToPersonRecord('student', detailEnquiry.enrolledStudentId);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#172B50] text-white text-xs font-bold hover:bg-[#F4510B] cursor-pointer"
                    >
                      <span>View Student Record</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {detailEnquiry.enrolledParentId && (
                    <button
                      type="button"
                      onClick={() => {
                        setDetailEnquiryId(null);
                        navigateToPersonRecord('parent', detailEnquiry.enrolledParentId);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#172B50] border border-[#172B5022] text-xs font-bold hover:border-[#F4510B] cursor-pointer"
                    >
                      <span>View Parent Record</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#172B5014] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {detailEnquiry.stage !== 'Enrolled' && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = detailEnquiry;
                      setDetailEnquiryId(null);
                      handleOpenEditModal(target);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF4E8] text-[#172B50] text-xs font-bold border border-[#172B501C] hover:border-[#F4510B] cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Lead</span>
                  </button>
                )}
                {!detailEnquiry.demoId && detailEnquiry.stage !== 'Enrolled' && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = detailEnquiry;
                      setDetailEnquiryId(null);
                      handleOpenConvertDemo(target);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#172B50] text-white text-xs font-bold hover:bg-[#F4510B] transition-all cursor-pointer shadow-sm"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Convert to Demo</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailEnquiryId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                {detailEnquiry.stage !== 'Enrolled' && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = detailEnquiry;
                      setDetailEnquiryId(null);
                      openEnrollConfirmation(target);
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-extrabold bg-[#F4510B] text-white hover:brightness-110 shadow-sm cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Enroll Student</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Enroll Student Confirmation & Result Modal */}
      <Modal
        isOpen={Boolean(enrollModalEnquiry)}
        onClose={() => {
          setEnrollModalEnquiry(null);
          setEnrollmentResult(null);
        }}
        title={
          enrollmentResult
            ? 'Enrollment Completed Successfully'
            : `Confirm Student Enrollment: ${enrollModalEnquiry?.childName || ''}`
        }
        subtitle={
          enrollmentResult
            ? `Original Enquiry ${enrollmentResult.enquiry.id} marked Enrolled — Location synced to ${enrollmentResult.student.center}`
            : 'Automatically creates Student record & creates/links Parent record in one atomic transaction'
        }
        maxWidth="max-w-2xl"
      >
        {enrollModalEnquiry && !enrollmentResult && (
          <form onSubmit={handleConfirmEnrollment} className="space-y-4">
            {enrollErrors.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-extrabold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Please complete missing required information before enrolling:</span>
                </div>
                <ul className="list-disc pl-5 text-xs space-y-0.5">
                  {enrollErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Carried-forward Student Preview */}
            <div className="bg-[#FFF4E8] p-4 rounded-2xl border border-[#172B5015] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#172B50] uppercase tracking-wider">
                  Student Details Transferred From Enquiry ({enrollModalEnquiry.id})
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F4510B] text-white">
                  Location: {enrollOverrides.center || enrollModalEnquiry.center}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#172B50] opacity-65 block">Child Name</span>
                  <span className="font-extrabold text-[#172B50]">{enrollModalEnquiry.childName}</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#172B50] opacity-75 block mb-0.5">
                    Gender *
                  </label>
                  <select
                    value={enrollOverrides.gender}
                    onChange={(e) => setEnrollOverrides({ ...enrollOverrides, gender: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#172B5022] bg-white text-[#172B50]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#172B50] opacity-75 block mb-0.5">
                    Age (Years) *
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="18"
                    value={enrollOverrides.childAge}
                    onChange={(e) => setEnrollOverrides({ ...enrollOverrides, childAge: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#172B5022] bg-white text-[#172B50]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-[#172B50] opacity-75 block mb-0.5">
                    Sports Program *
                  </label>
                  <select
                    value={enrollOverrides.interestedProgram}
                    onChange={(e) =>
                      setEnrollOverrides({
                        ...enrollOverrides,
                        interestedProgram: e.target.value,
                        preferredBatchId: '',
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#172B5022] bg-white text-[#172B50]"
                  >
                    {data.programs.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#172B50] opacity-75 block mb-0.5">
                    Assign Batch at {enrollOverrides.center}
                  </label>
                  <select
                    value={enrollOverrides.preferredBatchId}
                    onChange={(e) =>
                      setEnrollOverrides({ ...enrollOverrides, preferredBatchId: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#172B5022] bg-white text-[#172B50]"
                  >
                    <option value="">No batch assigned yet</option>
                    {availableEnrollBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.enrolled || 0}/{b.capacity || 15})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Parent Resolution Preview (Auto-Create or Auto-Link Existing) */}
            <div
              className={`p-4 rounded-2xl border space-y-2 ${
                matchedExistingParentPreview
                  ? 'bg-sky-50 border-sky-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#172B50]">
                {matchedExistingParentPreview ? (
                  <>
                    <Users className="w-4 h-4 text-sky-700" />
                    <span>
                      Existing Parent Found ({matchedExistingParentPreview.id}: {matchedExistingParentPreview.name}) — Will Link Child Without Creating Duplicate
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>
                      New Parent Record &amp; Portal Account Will Be Created at {enrollOverrides.center}
                    </span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-[#172B50] opacity-75 block mb-0.5">
                    Parent Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={enrollOverrides.phone}
                    onChange={(e) => setEnrollOverrides({ ...enrollOverrides, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#172B5022] bg-white text-[#172B50]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#172B50] opacity-75 block mb-0.5">
                    Parent Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={enrollOverrides.email}
                    onChange={(e) => setEnrollOverrides({ ...enrollOverrides, email: e.target.value })}
                    placeholder="parent@example.com"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#172B5022] bg-white text-[#172B50]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#172B5014]">
              <button
                type="button"
                onClick={() => setEnrollModalEnquiry(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingEnrollment}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-extrabold bg-[#F4510B] text-white hover:brightness-110 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmittingEnrollment ? 'Enrolling...' : 'Confirm & Complete Enrollment'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Post-Enrollment Success View with Direct Links */}
        {enrollmentResult && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Student &amp; Parent Records Synchronized</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#172B50]">
                <div className="bg-white p-3 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-[#F4510B] block">
                    Student Created
                  </span>
                  <p className="font-extrabold text-sm mt-0.5">{enrollmentResult.student.name}</p>
                  <p className="text-[11px] font-semibold">
                    ID: {enrollmentResult.student.id} • Status: {enrollmentResult.student.status}
                  </p>
                  <p className="text-[11px] opacity-75">
                    {enrollmentResult.student.center} • {enrollmentResult.student.program}
                  </p>
                  {enrollmentResult.student.batchName && (
                    <p className="text-[11px] opacity-75">
                      Batch: {enrollmentResult.student.batchName} ({enrollmentResult.batchEnrollmentState})
                    </p>
                  )}
                </div>

                <div className="bg-white p-3 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-[#172B50] block">
                    {enrollmentResult.parentAction === 'linked_existing'
                      ? 'Existing Parent Linked'
                      : 'Parent Record Created'}
                  </span>
                  <p className="font-extrabold text-sm mt-0.5">{enrollmentResult.parent.name}</p>
                  <p className="text-[11px] font-semibold">
                    ID: {enrollmentResult.parent.id} • Location: {enrollmentResult.parent.center}
                  </p>
                  <p className="text-[11px] opacity-75">
                    Linked Children: {(enrollmentResult.parent.children || []).join(', ')}
                  </p>
                  {enrollmentResult.accountCreated && (
                    <p className="text-[10px] font-mono text-emerald-700 mt-1">
                      Portal Temp Password: {enrollmentResult.accountCreated.tempPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#172B5014]">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const id = enrollmentResult.student.id;
                    setEnrollModalEnquiry(null);
                    setEnrollmentResult(null);
                    navigateToPersonRecord('student', id);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-[#172B50] text-white hover:bg-[#F4510B] cursor-pointer"
                >
                  <span>View Student Record ({enrollmentResult.student.id})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = enrollmentResult.parent.id;
                    setEnrollModalEnquiry(null);
                    setEnrollmentResult(null);
                    navigateToPersonRecord('parent', id);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-[#FFF4E8] text-[#172B50] border border-[#172B5022] hover:border-[#F4510B] cursor-pointer"
                >
                  <span>View Parent Record ({enrollmentResult.parent.id})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEnrollModalEnquiry(null);
                  setEnrollmentResult(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Convert to Demo Modal */}
      <Modal
        isOpen={Boolean(demoModalEnquiry)}
        onClose={() => setDemoModalEnquiry(null)}
        title={
          demoModalEnquiry
            ? `Convert Enquiry to Demo Class: ${demoModalEnquiry.id}`
            : 'Book Demo Session'
        }
        subtitle={
          demoModalEnquiry
            ? `${demoModalEnquiry.childName} • Mandatory Location: ${demoModalEnquiry.center}`
            : ''
        }
        maxWidth="max-w-xl"
      >
        {demoModalEnquiry && (
          <form onSubmit={handleSaveDemoFromEnquiry} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
              <span className="font-bold block">Enquiry Information Carried Forward:</span>
              <p>
                Location <strong>{demoModalEnquiry.center}</strong>, Sports Program{' '}
                <strong>{demoModalEnquiry.interestedProgram}</strong>, and parent contact details are
                automatically bound from the original lead.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">Demo Date *</label>
                <input
                  type="date"
                  required
                  value={demoModalForm.demoDate}
                  onChange={(e) =>
                    setDemoModalForm({ ...demoModalForm, demoDate: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">Demo Time *</label>
                <input
                  type="time"
                  required
                  value={demoModalForm.demoTime}
                  onChange={(e) =>
                    setDemoModalForm({ ...demoModalForm, demoTime: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Assigned Coach ({demoModalEnquiry.center}) *
              </label>
              <select
                required
                value={demoModalForm.coachId}
                onChange={(e) => {
                  const id = e.target.value;
                  const c = data.coaches.find((x) => x.id === id);
                  setDemoModalForm({
                    ...demoModalForm,
                    coachId: id,
                    coachName: c ? c.name : '',
                  });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50] font-semibold"
              >
                <option value="">Select Coach</option>
                {eligibleCoachesForDemoModal.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} • {c.center} ({c.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">
                Demo Session Notes / Objectives
              </label>
              <textarea
                rows={2}
                value={demoModalForm.notes}
                onChange={(e) =>
                  setDemoModalForm({ ...demoModalForm, notes: e.target.value })
                }
                placeholder="Specific session goals or parent instructions..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#172B5014]">
              <button
                type="button"
                onClick={() => setDemoModalEnquiry(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#F4510B] text-white hover:brightness-110 cursor-pointer shadow-sm"
              >
                Schedule &amp; Link Demo
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
