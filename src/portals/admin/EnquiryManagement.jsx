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
  Info,
  Eye,
  Edit3,
  UserPlus,
  Users,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import { getCommonLocations, filterEnquiries } from '../../services/locationService';
import {
  calculateAgeFromDob,
  findExistingParent,
  validateEnquiryForEnrollment,
} from '../../services/enrollmentService';

const WORKFLOW_STAGES = [
  'All',
  'New',
  'Follow-up',
  'Interested',
  'Trial Scheduled',
  'Trial Completed',
  'Enrolled',
];

export default function EnquiryManagement() {
  const {
    data,
    addEnquiry,
    updateEnquiry,
    updateEnquiryStage,
    enrollFromEnquiry,
    navigateToPersonRecord,
  } = useCrm();

  const commonLocations = getCommonLocations(data);
  const todayYmd = new Date().toISOString().split('T')[0];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
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
    enquiryDate: todayYmd,
    notes: '',
    stage: 'New',
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
        source: 'Direct Phone / Walk-in',
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
            Enquiry &amp; Lead Management
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Capture child &amp; guardian details, track admission readiness, and convert enquiries automatically into linked Student &amp; Parent records
          </p>
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

      {/* Workflow Progression Strip */}
      <div className="bg-white rounded-2xl px-4 py-3 border border-[#172B5015] shadow-card flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#172B50]">
        <span className="text-[#F4510B] uppercase tracking-wider mr-1">Admission Pipeline:</span>
        {[
          'New Enquiry',
          'Follow-up',
          'Interested',
          'Enroll Student',
          'Student Created',
          'Parent Linked/Created',
          'Enrolled',
        ].map((step, i, arr) => (
          <React.Fragment key={step}>
            <span className="px-2.5 py-1 rounded-lg bg-[#FFF4E8] border border-[#172B5014]">{step}</span>
            {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-[#F4510B]" />}
          </React.Fragment>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#172B501A] shadow-card space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            {/* Location Filter Dropdown */}
            <div className="relative min-w-[210px]">
              <MapPin className="w-4 h-4 text-[#F4510B] absolute left-3 top-2.5 pointer-events-none" />
              <select
                aria-label="Filter enquiries by academy location"
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5025] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B] cursor-pointer"
              >
                <option value="All">All Locations ({(data.enquiries || []).length})</option>
                {commonLocations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name} ({(data.enquiries || []).filter((e) => e.center === loc.name).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#172B50] opacity-50 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by child, parent, phone, or ID..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] placeholder-[#172B5080] border border-[#172B5020] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-[#172B50] opacity-60 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="date"
                  aria-label="Filter enquiries by created or enquiry date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 pr-2.5 py-2 text-xs font-semibold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
                />
              </div>
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate('');
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-2 text-[11px] font-bold text-[#F4510B] bg-[#FFF4E8] border border-[#F4510B30] rounded-xl hover:bg-white transition-all cursor-pointer"
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#172B50] opacity-75">
            <span>
              Showing <strong className="text-[#172B50]">{filteredEnquiries.length}</strong>{' '}
              {selectedLocation === 'All' ? 'across all locations' : `at ${selectedLocation}`}
            </span>
          </div>
        </div>

        {/* Stage Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {WORKFLOW_STAGES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setSelectedStage(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedStage === st
                  ? 'bg-[#172B50] text-white shadow-sm'
                  : 'bg-[#FFF4E8] text-[#172B50] hover:bg-white border border-[#172B5015]'
              }`}
            >
              {st}{' '}
              {st !== 'All'
                ? `(${locationScopedEnquiries.filter((e) => e.stage === st).length})`
                : `(${locationScopedEnquiries.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FFF4E8] text-[#172B50] font-extrabold uppercase tracking-wider text-[11px] border-b border-[#172B5015]">
                <th className="py-3.5 px-4">Enquiry ID &amp; Date</th>
                <th className="py-3.5 px-4">Child Details</th>
                <th className="py-3.5 px-4">Parent &amp; Contact</th>
                <th className="py-3.5 px-4">Location, Program &amp; Batch</th>
                <th className="py-3.5 px-4">Stage</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172B5010]">
              {paginatedEnquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#172B50] opacity-60">
                    No enquiries match the selected location, stage, date, or search filter.
                  </td>
                </tr>
              ) : (
                paginatedEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-[#FFF4E8]/40 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setDetailEnquiryId(enq.id)}
                        className="font-extrabold text-[#172B50] hover:text-[#F4510B] block cursor-pointer"
                      >
                        {enq.id}
                      </button>
                      <span className="text-[10px] text-[#172B50] opacity-60">
                        {enq.enquiryDate || enq.createdAt}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-extrabold text-[#172B50] text-sm block">{enq.childName}</span>
                      <span className="text-[11px] text-[#172B50] opacity-70">
                        {enq.childAge} yrs {enq.gender ? `• ${enq.gender}` : ''}
                        {enq.dob ? ` • DOB ${enq.dob}` : ''}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-[#172B50]">{enq.parentName}</div>
                      <div className="text-[11px] text-[#172B50] opacity-75">{enq.phone}</div>
                      <div className="text-[10px] text-[#172B50] opacity-55 truncate max-w-[165px]">
                        {enq.email}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] text-[#F4510B] font-extrabold uppercase block">
                        {enq.center}
                      </span>
                      <span className="font-bold text-[#172B50] block">{enq.interestedProgram}</span>
                      {enq.preferredBatchName && (
                        <span className="text-[10px] text-[#172B50] opacity-70">
                          Batch: {enq.preferredBatchName}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={enq.stage}
                        disabled={enq.stage === 'Enrolled'}
                        onChange={(e) => updateEnquiryStage(enq.id, e.target.value)}
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border border-[#172B5025] outline-none ${
                          enq.stage === 'Enrolled'
                            ? 'bg-[#172B50] text-white cursor-not-allowed'
                            : enq.stage === 'Interested' || enq.stage === 'Trial Scheduled'
                            ? 'bg-[#F4510B] text-white cursor-pointer'
                            : 'bg-[#FFF4E8] text-[#172B50] cursor-pointer'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Interested">Interested</option>
                        <option value="Trial Scheduled">Trial Scheduled</option>
                        <option value="Trial Completed">Trial Completed</option>
                        {enq.stage === 'Enrolled' && <option value="Enrolled">Enrolled</option>}
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-[#FFF4E8]/60 border-t border-[#172B5015] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#172B50]">
          <span className="font-semibold opacity-75">
            Page {safePage} of {totalPages} • {filteredEnquiries.length} enquiry record
            {filteredEnquiries.length === 1 ? '' : 's'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1.5 rounded-lg border border-[#172B5020] bg-white font-bold text-[#172B50] disabled:opacity-40 hover:bg-[#FFF4E8] inline-flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1.5 rounded-lg border border-[#172B5020] bg-white font-bold text-[#172B50] disabled:opacity-40 hover:bg-[#FFF4E8] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Backend API / Persistence Transparency Notice */}
      <div className="flex items-start gap-2.5 px-4 py-2.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015] text-[11px] text-[#172B50]">
        <Info className="w-4 h-4 text-[#F4510B] shrink-0 mt-0.5" />
        <span>
          Atomic Enquiry → Student → Parent enrollment currently executes in browser state (no live server API connected). Backend database persistence requires transactional endpoint{' '}
          <code className="font-bold">POST /api/v1/enquiries/:id/enroll</code> enforcing unique{' '}
          <code className="font-bold">enquiry_id</code> and parent deduplication constraints.
        </span>
      </div>

      {/* Add / Edit Enquiry Lead Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingEnquiry ? `Edit Enquiry: ${editingEnquiry.id}` : 'Register Prospective Student Enquiry'}
        subtitle="Capture complete child, guardian, location, sports program & preferred batch details"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#172B50] block mb-1">Child Athlete Name *</label>
              <input
                type="text"
                required
                value={formState.childName}
                onChange={(e) => setFormState({ ...formState, childName: e.target.value })}
                placeholder="e.g. Samar Sen"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Gender *</label>
              <select
                value={formState.gender}
                onChange={(e) => setFormState({ ...formState, gender: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Date of Birth</label>
              <input
                type="date"
                value={formState.dob}
                onChange={(e) => handleDobChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Age (Years) *</label>
              <input
                type="number"
                min="2"
                max="18"
                required
                value={formState.childAge}
                onChange={(e) => setFormState({ ...formState, childAge: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Enquiry Date *</label>
              <input
                type="date"
                required
                value={formState.enquiryDate}
                onChange={(e) => setFormState({ ...formState, enquiryDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                value={formState.parentName}
                onChange={(e) => setFormState({ ...formState, parentName: e.target.value })}
                placeholder="Parent's Name"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Parent Mobile Number *</label>
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
              <label className="text-xs font-bold text-[#172B50] block mb-1">Parent Email Address *</label>
              <input
                type="email"
                required
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                placeholder="parent@example.com"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Preferred Academy Location *</label>
              <select
                value={formState.center}
                onChange={(e) =>
                  setFormState({ ...formState, center: e.target.value, preferredBatchId: '' })
                }
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
              <label className="text-xs font-bold text-[#172B50] block mb-1">Interested Sports Program *</label>
              <select
                value={formState.interestedProgram}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    interestedProgram: e.target.value,
                    preferredBatchId: '',
                  })
                }
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {data.programs.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Preferred Batch (Optional)</label>
              <select
                value={formState.preferredBatchId}
                onChange={(e) => setFormState({ ...formState, preferredBatchId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                <option value="">Select later / Open</option>
                {availableFormBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.enrolled || 0}/{b.capacity || 15})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Additional Notes</label>
            <textarea
              rows="3"
              value={formState.notes}
              onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
              placeholder="e.g. Trial slot preference, prior experience, medical notes..."
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
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
              {editingEnquiry ? 'Save Enquiry Changes' : 'Create Enquiry Lead'}
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
              {detailEnquiry.stage !== 'Enrolled' ? (
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
                  <span>Edit Enquiry Details</span>
                </button>
              ) : (
                <span />
              )}

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
    </div>
  );
}
