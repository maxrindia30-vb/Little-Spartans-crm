import React, { useMemo, useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  TrendingUp,
  GraduationCap,
  Filter,
  Layers,
  X,
  MoreHorizontal,
  Phone,
  Mail,
  MessageSquare,
  UploadCloud,
  RotateCw,
  Clock,
  Zap,
  XCircle,
  RefreshCw,
  PlayCircle,
  BarChart2,
  LayoutGrid,
  FileText,
  SlidersHorizontal,
  Download,
  Check,
  ArrowUpDown,
  UserCheck,
  Sparkles,
  Inbox,
  Share2,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
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
} from '../../services/demoService';
import {
  LEAD_STATUS,
  STATUS_COLORS,
  calculateDaysSince,
  formatDisplayDate,
  resolveLeadStatus,
  calculateLeadKPIs,
  calculateLeadFunnel,
  getDonutChartData,
  getStoredAutomationLogs,
  saveAutomationLog,
  getEnquiryActivities,
  addEnquiryActivity,
  parseCSVLeads,
  getSampleLeadsCSV,
} from '../../services/enquiryFunnelService';

export default function EnquiryManagement() {
  const {
    data,
    addEnquiry,
    updateEnquiry,
    enrollFromEnquiry,
    addDemo,
    navigateToPersonRecord,
    addToast,
  } = useCrm();

  const commonLocations = getCommonLocations(data);
  const todayYmd = new Date().toISOString().split('T')[0];

  // ==========================================
  // Filters, Search, Tabs & Sorting State
  // ==========================================
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('all'); // all, today, 7days, 30days
  const [activeTab, setActiveTab] = useState('All');
  const [sortField, setSortField] = useState('enquiryDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedSource, setSelectedSource] = useState('All');

  // Multi-select Checkboxes
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Active Dropdown Action Menu
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Close 3-dot menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==========================================
  // Modals State
  // ==========================================
  // 1. Add / Edit Enquiry Modal
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
    interestedProgram: data.programs[0]?.name || 'Football',
    center: commonLocations[0]?.name || 'KK NAGAR',
    preferredBatchId: '',
    source: ENQUIRY_SOURCES.MANUAL,
    enquiryDate: todayYmd,
    lastParentResponse: todayYmd,
    notes: '',
    stage: 'New',
  });

  // 2. Convert to Demo Modal State
  const [demoModalEnquiry, setDemoModalEnquiry] = useState(null);
  const [demoModalForm, setDemoModalForm] = useState({
    demoDate: todayYmd,
    demoTime: '17:00',
    coachId: '',
    coachName: '',
    notes: '',
  });

  // 3. Enquiry Details Modal
  const [detailEnquiryId, setDetailEnquiryId] = useState(null);

  // 4. Enrollment Confirmation Modal
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

  // 5. Follow-up Modal
  const [followUpModalEnquiry, setFollowUpModalEnquiry] = useState(null);
  const [followUpForm, setFollowUpForm] = useState({
    type: 'Phone Call',
    date: todayYmd,
    notes: '',
    parentResponded: true,
    outcome: 'Interested',
  });

  // 6. Quick Status Update Modal
  const [statusUpdateEnquiry, setStatusUpdateEnquiry] = useState(null);
  const [newStatusChoice, setNewStatusChoice] = useState('');
  const [statusReason, setStatusReason] = useState('');

  // 7. Activity History Modal
  const [activityHistoryEnquiry, setActivityHistoryEnquiry] = useState(null);
  const [currentActivities, setCurrentActivities] = useState([]);

  // 8. View Automation Logs Modal
  const [isAutomationLogsModalOpen, setIsAutomationLogsModalOpen] = useState(false);
  const [automationLogs, setAutomationLogs] = useState([]);

  // 9. Import Leads Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importPreview, setImportPreview] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // 10. Lead Funnel Popup Modal
  const [isLeadFunnelModalOpen, setIsLeadFunnelModalOpen] = useState(false);

  // Load automation logs
  useEffect(() => {
    setAutomationLogs(getStoredAutomationLogs());
  }, [isAutomationLogsModalOpen]);

  // Load activities when activity modal opens
  useEffect(() => {
    if (activityHistoryEnquiry) {
      const stored = getEnquiryActivities(activityHistoryEnquiry.id);
      if (stored.length === 0) {
        // Generate baseline intake activity
        const initActivity = {
          type: 'Lead Created',
          description: `Enquiry received via ${activityHistoryEnquiry.source || 'Admissions Desk'}`,
          timestamp: activityHistoryEnquiry.enquiryDate || activityHistoryEnquiry.createdAt || todayYmd,
          author: 'Admissions Desk',
        };
        addEnquiryActivity(activityHistoryEnquiry.id, initActivity);
        setCurrentActivities([initActivity]);
      } else {
        setCurrentActivities(stored);
      }
    }
  }, [activityHistoryEnquiry, todayYmd]);

  // ==========================================
  // Dynamic KPIs, Funnel & Status Resolution
  // ==========================================
  const rawEnquiries = useMemo(() => data.enquiries || [], [data.enquiries]);
  const demos = useMemo(() => data.demos || [], [data.demos]);
  const students = useMemo(() => data.students || [], [data.students]);

  // Enrich enquiries with dynamic status and days
  const enrichedEnquiries = useMemo(() => {
    return rawEnquiries.map((enq) => {
      const resolvedStatus = resolveLeadStatus(enq, demos, students);
      const lastResponseDate = enq.lastParentResponse || enq.enquiryDate || enq.createdAt || todayYmd;
      const days = calculateDaysSince(lastResponseDate);
      return {
        ...enq,
        resolvedStatus,
        daysSinceResponse: days,
      };
    });
  }, [rawEnquiries, demos, students, todayYmd]);

  // Dynamic KPI Metrics
  const kpis = useMemo(() => {
    return calculateLeadKPIs(enrichedEnquiries, demos, students, commonLocations);
  }, [enrichedEnquiries, demos, students, commonLocations]);

  // Dynamic Funnel Metrics
  const funnelData = useMemo(() => {
    return calculateLeadFunnel(enrichedEnquiries, demos, students);
  }, [enrichedEnquiries, demos, students]);

  // Dynamic Donut Chart Data
  const donutData = useMemo(() => {
    return getDonutChartData(kpis);
  }, [kpis]);

  // ==========================================
  // Filtering & Sorting
  // ==========================================
  const filteredEnquiries = useMemo(() => {
    return enrichedEnquiries.filter((enq) => {
      // 1. Status Filter Tab
      if (activeTab === 'New') {
        const isNew = enq.daysSinceResponse <= 2 && enq.resolvedStatus !== LEAD_STATUS.CONVERTED && enq.resolvedStatus !== LEAD_STATUS.LOST;
        if (!isNew) return false;
      } else if (activeTab !== 'All') {
        if (enq.resolvedStatus !== activeTab) return false;
      }

      // 2. Location Filter
      if (selectedLocation !== 'All' && enq.center !== selectedLocation) {
        return false;
      }

      // 3. Program Filter
      if (selectedProgram !== 'All' && enq.interestedProgram !== selectedProgram) {
        return false;
      }

      // 4. Status Dropdown Filter
      if (selectedStatusFilter !== 'All' && enq.resolvedStatus !== selectedStatusFilter) {
        return false;
      }

      // 5. Source Filter
      if (selectedSource !== 'All' && (enq.source || ENQUIRY_SOURCES.MANUAL) !== selectedSource) {
        return false;
      }

      // 6. Date Range Filter
      if (selectedDateRange !== 'all') {
        const enqDate = enq.enquiryDate || enq.createdAt;
        if (selectedDateRange === 'today' && enqDate !== todayYmd) {
          return false;
        } else if (selectedDateRange === '7days') {
          if (calculateDaysSince(enqDate) > 7) return false;
        } else if (selectedDateRange === '30days') {
          if (calculateDaysSince(enqDate) > 30) return false;
        }
      }

      // 7. Search Input Filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const child = (enq.childName || '').toLowerCase();
        const parent = (enq.parentName || '').toLowerCase();
        const phone = (enq.phone || '').toLowerCase();
        const email = (enq.email || '').toLowerCase();
        const id = (enq.id || '').toLowerCase();
        if (!child.includes(q) && !parent.includes(q) && !phone.includes(q) && !email.includes(q) && !id.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [
    enrichedEnquiries,
    activeTab,
    selectedLocation,
    selectedProgram,
    selectedStatusFilter,
    selectedSource,
    selectedDateRange,
    searchTerm,
    todayYmd,
  ]);

  // Sort
  const sortedEnquiries = useMemo(() => {
    return [...filteredEnquiries].sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (sortField === 'enquiryDate') {
        valA = a.enquiryDate || a.createdAt || '';
        valB = b.enquiryDate || b.createdAt || '';
      }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredEnquiries, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedEnquiries.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedEnquiries = sortedEnquiries.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Detail Enquiry object
  const detailEnquiry = useMemo(
    () => enrichedEnquiries.find((e) => e.id === detailEnquiryId) || null,
    [enrichedEnquiries, detailEnquiryId]
  );

  // Available batches for modals
  const availableFormBatches = useMemo(() => {
    return (data.classes || []).filter(
      (c) =>
        c.status !== 'Inactive' &&
        (!formState.center || c.center === formState.center) &&
        (!formState.interestedProgram || c.program === formState.interestedProgram)
    );
  }, [data.classes, formState.center, formState.interestedProgram]);

  const availableEnrollBatches = useMemo(() => {
    const loc = enrollOverrides.center || enrollModalEnquiry?.center;
    const prog = enrollOverrides.interestedProgram || enrollModalEnquiry?.interestedProgram;
    return (data.classes || []).filter(
      (c) => c.status !== 'Inactive' && (!loc || c.center === loc) && (!prog || c.program === prog)
    );
  }, [data.classes, enrollModalEnquiry, enrollOverrides]);

  const eligibleCoachesForDemoModal = useMemo(() => {
    if (!demoModalEnquiry) return data.coaches || [];
    return filterCoachesForDemo({
      coaches: data.coaches || [],
      location: demoModalEnquiry.center,
      program: demoModalEnquiry.interestedProgram,
    });
  }, [data.coaches, demoModalEnquiry]);

  // ==========================================
  // Checkbox Handlers
  // ==========================================
  const isAllSelected = paginatedEnquiries.length > 0 && paginatedEnquiries.every((e) => selectedLeadIds.includes(e.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const pageIds = new Set(paginatedEnquiries.map((e) => e.id));
      setSelectedLeadIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const newIds = new Set([...selectedLeadIds, ...paginatedEnquiries.map((e) => e.id)]);
      setSelectedLeadIds(Array.from(newIds));
    }
  };

  const handleToggleSelectLead = (id) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
    setCurrentPage(1);
  };

  // ==========================================
  // Action Handlers
  // ==========================================
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
      interestedProgram: data.programs[0]?.name || 'Football',
      center: initialCenter,
      preferredBatchId: '',
      source: ENQUIRY_SOURCES.MANUAL,
      enquiryDate: todayYmd,
      lastParentResponse: todayYmd,
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
      interestedProgram: enq.interestedProgram || data.programs[0]?.name || 'Football',
      center: enq.center || commonLocations[0]?.name || 'KK NAGAR',
      preferredBatchId: enq.preferredBatchId || '',
      source: enq.source || ENQUIRY_SOURCES.MANUAL,
      enquiryDate: enq.enquiryDate || enq.createdAt || todayYmd,
      lastParentResponse: enq.lastParentResponse || enq.enquiryDate || todayYmd,
      notes: enq.notes || '',
      stage: enq.stage || 'New',
    });
    setIsFormModalOpen(true);
    setActiveMenuId(null);
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
      lastParentResponse: formState.lastParentResponse || formState.enquiryDate || todayYmd,
      notes: formState.notes.trim() || 'Enquiry recorded at admissions desk.',
      stage: formState.stage || 'New',
    };

    if (editingEnquiry) {
      updateEnquiry(editingEnquiry.id, payload);
      addEnquiryActivity(editingEnquiry.id, {
        type: 'Enquiry Updated',
        description: `Lead details updated by Admin.`,
        author: 'Admin Desk',
      });
      addToast(`Enquiry ${editingEnquiry.id} updated successfully.`, 'success');
    } else {
      const created = addEnquiry({
        ...payload,
        trialDate: '-',
        assignedTo: 'Admissions Desk',
      });
      if (created?.id) {
        addEnquiryActivity(created.id, {
          type: 'Lead Created',
          description: `Initial enquiry intake via ${created.source}.`,
          author: 'Admissions Desk',
        });
      }
    }

    setIsFormModalOpen(false);
    setEditingEnquiry(null);
  };

  // Convert to Demo
  const handleOpenConvertDemo = (enq) => {
    setDemoModalEnquiry(enq);
    setDemoModalForm({
      demoDate: todayYmd,
      demoTime: '17:00',
      coachId: '',
      coachName: '',
      notes: enq.notes ? `Enquiry note: ${enq.notes}` : '',
    });
    setActiveMenuId(null);
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
      updateEnquiry(demoModalEnquiry.id, {
        status: LEAD_STATUS.DEMO_REQUESTED,
        stage: 'Trial Scheduled',
        demoId: res.demo.id,
        lastParentResponse: todayYmd,
      });
      addEnquiryActivity(demoModalEnquiry.id, {
        type: 'Demo Scheduled',
        description: `Trial demo session scheduled for ${demoModalForm.demoDate} at ${demoModalForm.demoTime} (${demoModalEnquiry.center}).`,
        author: 'Admissions Desk',
      });
      setDemoModalEnquiry(null);
    }
  };

  // Mark as Lost
  const handleMarkAsLost = (enq) => {
    updateEnquiry(enq.id, {
      status: LEAD_STATUS.LOST,
      isLost: true,
      autoMarkedLost: false,
    });
    saveAutomationLog({
      enquiryId: enq.id,
      childName: enq.childName,
      fromStatus: enq.resolvedStatus,
      toStatus: LEAD_STATUS.LOST,
      rule: 'Manual Mark as Lost',
      reason: 'Admin manually marked enquiry as Lost.',
    });
    addEnquiryActivity(enq.id, {
      type: 'Status Changed',
      description: 'Lead marked as Lost.',
      author: 'Admin Desk',
    });
    addToast(`Lead ${enq.id} (${enq.childName}) marked as Lost.`, 'info');
    setActiveMenuId(null);
  };

  // Reopen Lead
  const handleReopenLead = (enq) => {
    updateEnquiry(enq.id, {
      status: LEAD_STATUS.ACTIVE,
      isLost: false,
      autoMarkedLost: false,
      lastParentResponse: todayYmd,
    });
    saveAutomationLog({
      enquiryId: enq.id,
      childName: enq.childName,
      fromStatus: LEAD_STATUS.LOST,
      toStatus: LEAD_STATUS.ACTIVE,
      rule: 'Manual Lead Reopen',
      reason: 'Lead reopened by Admin. Follow-up cycle restored to Active (0-5 days).',
    });
    addEnquiryActivity(enq.id, {
      type: 'Lead Reopened',
      description: 'Lead reopened by Admin. Activity timer reset to 0 days.',
      author: 'Admin Desk',
    });
    addToast(`Lead ${enq.id} (${enq.childName}) successfully reopened as Active.`, 'success');
    setActiveMenuId(null);
  };

  // Follow-up
  const handleOpenFollowUp = (enq) => {
    setFollowUpModalEnquiry(enq);
    setFollowUpForm({
      type: 'Phone Call',
      date: todayYmd,
      notes: '',
      parentResponded: true,
      outcome: 'Interested',
    });
    setActiveMenuId(null);
  };

  const handleSaveFollowUp = (e) => {
    e.preventDefault();
    if (!followUpModalEnquiry) return;

    const updates = {
      notes: followUpForm.notes ? `${followUpModalEnquiry.notes || ''}\n[${todayYmd} ${followUpForm.type}]: ${followUpForm.notes}`.trim() : followUpModalEnquiry.notes,
    };

    if (followUpForm.parentResponded) {
      updates.lastParentResponse = todayYmd;
      updates.status = LEAD_STATUS.ACTIVE;
      updates.isLost = false;
    }

    updateEnquiry(followUpModalEnquiry.id, updates);

    addEnquiryActivity(followUpModalEnquiry.id, {
      type: followUpForm.type,
      description: `${followUpForm.type} conducted. Outcome: ${followUpForm.outcome}. Parent responded: ${followUpForm.parentResponded ? 'Yes' : 'No'}. Notes: ${followUpForm.notes || 'None'}`,
      author: 'Admissions Desk',
    });

    addToast(`Follow-up logged for ${followUpModalEnquiry.childName}.`, 'success');
    setFollowUpModalEnquiry(null);
  };

  // Quick Status Update
  const handleOpenStatusUpdate = (enq) => {
    setStatusUpdateEnquiry(enq);
    setNewStatusChoice(enq.resolvedStatus);
    setStatusReason('');
    setActiveMenuId(null);
  };

  const handleSaveStatusUpdate = (e) => {
    e.preventDefault();
    if (!statusUpdateEnquiry || !newStatusChoice) return;

    updateEnquiry(statusUpdateEnquiry.id, {
      status: newStatusChoice,
      lastParentResponse: newStatusChoice === LEAD_STATUS.ACTIVE ? todayYmd : statusUpdateEnquiry.lastParentResponse,
    });

    saveAutomationLog({
      enquiryId: statusUpdateEnquiry.id,
      childName: statusUpdateEnquiry.childName,
      fromStatus: statusUpdateEnquiry.resolvedStatus,
      toStatus: newStatusChoice,
      rule: 'Manual Status Update',
      reason: statusReason || 'Status changed by Admin.',
    });

    addEnquiryActivity(statusUpdateEnquiry.id, {
      type: 'Status Changed',
      description: `Status updated from "${statusUpdateEnquiry.resolvedStatus}" to "${newStatusChoice}". Reason: ${statusReason || 'Manual update'}`,
      author: 'Admin Desk',
    });

    addToast(`Lead ${statusUpdateEnquiry.id} status updated to ${newStatusChoice}.`, 'success');
    setStatusUpdateEnquiry(null);
  };

  // Open Activity History
  const handleOpenActivityHistory = (enq) => {
    setActivityHistoryEnquiry(enq);
    setActiveMenuId(null);
  };

  // Enroll Student Confirmation
  const openEnrollConfirmation = (enq) => {
    if (enq.resolvedStatus === LEAD_STATUS.CONVERTED || enq.stage === 'Enrolled') return;
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
    setActiveMenuId(null);
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

    updateEnquiry(enrollModalEnquiry.id, {
      status: LEAD_STATUS.CONVERTED,
      stage: 'Enrolled',
      enrolledStudentId: res.student?.id,
    });

    addEnquiryActivity(enrollModalEnquiry.id, {
      type: 'Student Enrolled',
      description: `Successfully converted and enrolled as Student ${res.student?.id || ''}.`,
      author: 'Admissions Desk',
    });

    setEnrollmentResult(res);
    setIsSubmittingEnrollment(false);
  };

  // CSV Import Handlers
  const handleCSVTextChange = (text) => {
    setCsvText(text);
    if (!text.trim()) {
      setImportPreview(null);
      return;
    }
    const parsed = parseCSVLeads(text);
    setImportPreview(parsed);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        handleCSVTextChange(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCSV = () => {
    const csvContent = getSampleLeadsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `little_spartans_sample_leads.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmImport = () => {
    if (!importPreview || importPreview.valid.length === 0) return;
    setIsImporting(true);

    let count = 0;
    importPreview.valid.forEach((lead) => {
      const created = addEnquiry(lead);
      if (created?.id) {
        addEnquiryActivity(created.id, {
          type: 'CSV Lead Imported',
          description: `Imported via bulk CSV intake.`,
          author: 'Admin Desk',
        });
      }
      count++;
    });

    addToast(`Successfully imported ${count} admission lead${count === 1 ? '' : 's'}.`, 'success');
    setIsImporting(false);
    setIsImportModalOpen(false);
    setCsvText('');
    setImportPreview(null);
  };

  // CSV Export of current filtered leads
  const handleExportCSV = () => {
    if (filteredEnquiries.length === 0) {
      addToast('No leads match the current filters to export.', 'info');
      return;
    }
    const headers = ['Enquiry ID', 'Enquiry Date', 'Child Name', 'Age', 'Gender', 'Parent Name', 'Phone', 'Email', 'Location', 'Program', 'Status', 'Last Response', 'Days'];
    const rows = filteredEnquiries.map((e) => [
      e.id,
      e.enquiryDate || e.createdAt,
      `"${e.childName || ''}"`,
      e.childAge || '',
      e.gender || '',
      `"${e.parentName || ''}"`,
      `"${e.phone || ''}"`,
      `"${e.email || ''}"`,
      `"${e.center || ''}"`,
      `"${e.interestedProgram || ''}"`,
      `"${e.resolvedStatus || ''}"`,
      e.lastParentResponse || e.enquiryDate,
      e.daysSinceResponse,
    ]);
    const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `enquiries_export_${todayYmd}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for Age pill color
  const getAgeBadgeStyle = (ageStr) => {
    const ageNum = parseInt(ageStr, 10) || 6;
    if (ageNum % 2 === 0) {
      return 'bg-[#EBF5FB] text-[#2980B9] border border-[#AED6F1]';
    }
    return 'bg-[#FDEDEC] text-[#E74C3C] border border-[#FADBD8]';
  };

  // Helper for Days color
  const getDaysBadgeStyle = (days, status) => {
    if (status === LEAD_STATUS.LOST) {
      return 'text-[#EF4444] font-extrabold';
    }
    if (days <= 2) {
      return 'text-[#10B981] font-extrabold';
    }
    if (days <= 5) {
      return 'text-[#059669] font-bold';
    }
    return 'text-[#F59E0B] font-extrabold';
  };

  return (
    <div className="space-y-5 pb-10">
      {/* ======================================================== */}
      {/* 1. Header with Spartan Helmet Badge & Top Actions       */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Spartan Helmet Icon Container */}
          <div className="w-11 h-11 rounded-2xl bg-[#F4510B] flex items-center justify-center text-white shadow-md shadow-[#F4510B]/25 shrink-0">
            <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
              <path d="M12 2C8.5 2 5 4.5 4 8v5c0 4.5 3.5 8 8 9s8-4.5 8-9V8c-1-3.5-4.5-6-8-6zm0 2.2c2.8 0 5.4 1.8 6.1 4.5H13.5V6h-3v2.7H5.9C6.6 6 9.2 4.2 12 4.2zm-2.5 6.3h5v2.5h-5V10.5zm-3.5 4.8c.8 2.8 3.3 5 6 5.4v-3.7H6zm12 0h-4.3v3.7c2.7-.4 5.2-2.6 6-5.4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">
              Enquiries &amp; Lead Funnel
            </h1>
            <p className="text-xs sm:text-sm text-[#172B50]/70 font-medium mt-0.5">
              Manage all enquiries, track demo progress, and convert leads into enrolled students.
            </p>
          </div>
        </div>

        {/* Top-Right Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Lead Funnel Trigger Button */}
          <button
            type="button"
            onClick={() => setIsLeadFunnelModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B35] rounded-xl shadow-2xs hover:bg-[#F4510B] hover:text-white transition-all cursor-pointer group active:scale-95"
            title="Open Lead Funnel & Conversion Analytics"
          >
            <Filter className="w-4 h-4 text-[#F4510B] group-hover:text-white transition-colors" />
            <span>Lead Funnel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white text-[#172B50] border border-[#172B5020] rounded-xl shadow-2xs hover:bg-[#FFF5ED] hover:border-[#F4510B40] transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-[#172B50]" />
            <span>Import Leads</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm shadow-[#F4510B]/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span>New Admission Lead</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. Seven Dynamic KPI Cards (1 Row on Desktop)           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-3.5">
        {/* KPI 1: Total Enquiries */}
        <div className="bg-white rounded-2xl border border-[#172B5015] p-3.5 shadow-2xs relative overflow-hidden flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] flex items-center justify-center text-[#F4510B]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 z-10">
            <div className="text-2xl font-black text-[#172B50] tracking-tight">{kpis.totalEnquiries}</div>
            <div className="text-xs font-bold text-[#172B50] mt-0.5">Total Enquiries</div>
            <div className="text-[10.5px] text-[#172B50]/60 font-semibold mt-0.5">Across {kpis.locationsCount} locations</div>
          </div>
          {/* Subtle Orange Bottom Arc Decor */}
          <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full border-4 border-[#F4510B18] pointer-events-none" />
        </div>

        {/* KPI 2: Active Leads */}
        <div className="bg-white rounded-2xl border border-[#172B5015] p-3.5 shadow-2xs relative overflow-hidden flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#E8F8F0] flex items-center justify-center text-[#10B981]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 z-10">
            <div className="text-2xl font-black text-[#172B50] tracking-tight">{kpis.activeLeads}</div>
            <div className="text-xs font-bold text-[#172B50] mt-0.5">Active Leads</div>
            <div className="text-[10.5px] text-[#10B981] font-bold mt-0.5">≤ 5 days</div>
          </div>
        </div>

        {/* KPI 3: Stale Leads */}
        <div className="bg-white rounded-2xl border border-[#172B5015] p-3.5 shadow-2xs relative overflow-hidden flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#F59E0B]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 z-10">
            <div className="text-2xl font-black text-[#172B50] tracking-tight">{kpis.staleLeads}</div>
            <div className="text-xs font-bold text-[#172B50] mt-0.5">Stale Leads</div>
            <div className="text-[10.5px] text-[#F59E0B] font-bold mt-0.5">&gt; 5 days</div>
          </div>
          {/* Subtle Amber Bottom Arc Decor */}
          <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full border-4 border-[#F59E0B18] pointer-events-none" />
        </div>

        {/* KPI 4: Demo Requested */}
        <div className="bg-white rounded-2xl border border-[#172B5015] p-3.5 shadow-2xs relative overflow-hidden flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 z-10">
            <div className="text-2xl font-black text-[#172B50] tracking-tight">{kpis.demoRequested}</div>
            <div className="text-xs font-bold text-[#172B50] mt-0.5">Demo Requested</div>
            <div className="text-[10.5px] text-[#3B82F6] font-semibold mt-0.5">In trial funnel</div>
          </div>
        </div>

        {/* KPI 5: Demo Attended */}
        <div className="bg-white rounded-2xl border border-[#172B5015] p-3.5 shadow-2xs relative overflow-hidden flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 z-10">
            <div className="text-2xl font-black text-[#172B50] tracking-tight">{kpis.demoAttended}</div>
            <div className="text-xs font-bold text-[#172B50] mt-0.5">Demo Attended</div>
            <div className="text-[10.5px] text-[#2563EB] font-semibold mt-0.5">Trial completed</div>
          </div>
        </div>

        {/* KPI 6: Converted */}
        <div className="bg-white rounded-2xl border border-[#172B5015] p-3.5 shadow-2xs relative overflow-hidden flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-[#10B981]">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 z-10">
            <div className="text-2xl font-black text-[#172B50] tracking-tight">{kpis.converted}</div>
            <div className="text-xs font-bold text-[#172B50] mt-0.5">Converted</div>
            <div className="text-[10.5px] text-[#10B981] font-bold mt-0.5">(Enrolled)</div>
          </div>
        </div>

        {/* KPI 7: Lost Leads */}
        <div className="bg-white rounded-2xl border border-[#172B5015] p-3.5 shadow-2xs relative overflow-hidden flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-[#EF4444]">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 z-10">
            <div className="text-2xl font-black text-[#172B50] tracking-tight">{kpis.lostLeads}</div>
            <div className="text-xs font-bold text-[#172B50] mt-0.5">Lost Leads</div>
            <div className="text-[10.5px] text-[#EF4444] font-semibold mt-0.5">No response for 5 days</div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. Lead Status Filter Tabs (8 Segmented Buttons)         */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: 'All', label: 'All Leads', count: kpis.totalEnquiries, icon: Layers },
          { key: 'New', label: 'New', count: kpis.newLeads, icon: Sparkles },
          { key: 'Active', label: 'Active', count: kpis.activeLeads, icon: Zap },
          { key: 'Stale', label: 'Stale', count: kpis.staleLeads, icon: Clock },
          { key: 'Demo Requested', label: 'Demo Requested', count: kpis.demoRequested, icon: Calendar },
          { key: 'Demo Attended', label: 'Demo Attended', count: kpis.demoAttended, icon: PlayCircle },
          { key: 'Converted', label: 'Converted', count: kpis.converted, icon: GraduationCap },
          { key: 'Lost', label: 'Lost', count: kpis.lostLeads, icon: XCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                isActive
                  ? 'bg-[#172B50] text-white border border-[#172B50]'
                  : 'bg-white text-[#172B50] border border-[#172B5018] hover:border-[#F4510B40] hover:bg-[#FFF5ED]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#172B50]/70'}`} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#172B500C] text-[#172B50]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 6. Search and Filters Toolbar Bar                       */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#172B5015] shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
          {/* Location Selector */}
          <div className="relative inline-flex items-center">
            <MapPin className="w-3.5 h-3.5 text-[#F4510B] absolute left-3 pointer-events-none z-10" />
            <select
              aria-label="Filter enquiries by location"
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-7 py-2 text-xs font-bold bg-[#F8FAFC] text-[#172B50] border border-[#172B5018] rounded-xl hover:border-[#F4510B50] focus:outline-none focus:ring-2 focus:ring-[#F4510B20] focus:border-[#F4510B] cursor-pointer appearance-none"
            >
              <option value="All">All Locations</option>
              {commonLocations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#172B50]/50 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Program Selector */}
          <div className="relative inline-flex items-center">
            <LayoutGrid className="w-3.5 h-3.5 text-[#F4510B] absolute left-3 pointer-events-none z-10" />
            <select
              aria-label="Filter enquiries by program"
              value={selectedProgram}
              onChange={(e) => {
                setSelectedProgram(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-7 py-2 text-xs font-bold bg-[#F8FAFC] text-[#172B50] border border-[#172B5018] rounded-xl hover:border-[#F4510B50] focus:outline-none focus:ring-2 focus:ring-[#F4510B20] focus:border-[#F4510B] cursor-pointer appearance-none"
            >
              <option value="All">All Programs</option>
              {data.programs.map((prog) => (
                <option key={prog.id} value={prog.name}>
                  {prog.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#172B50]/50 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative inline-flex items-center">
            <UserCheck className="w-3.5 h-3.5 text-[#F4510B] absolute left-3 pointer-events-none z-10" />
            <select
              aria-label="Filter enquiries by lead status"
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-7 py-2 text-xs font-bold bg-[#F8FAFC] text-[#172B50] border border-[#172B5018] rounded-xl hover:border-[#F4510B50] focus:outline-none focus:ring-2 focus:ring-[#F4510B20] focus:border-[#F4510B] cursor-pointer appearance-none"
            >
              <option value="All">All Status</option>
              <option value={LEAD_STATUS.ACTIVE}>Active</option>
              <option value={LEAD_STATUS.STALE}>Stale</option>
              <option value={LEAD_STATUS.DEMO_REQUESTED}>Demo Requested</option>
              <option value={LEAD_STATUS.DEMO_ATTENDED}>Demo Attended</option>
              <option value={LEAD_STATUS.CONVERTED}>Converted</option>
              <option value={LEAD_STATUS.LOST}>Lost</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#172B50]/50 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Enquiry Date Range Selector */}
          <div className="relative inline-flex items-center">
            <Calendar className="w-3.5 h-3.5 text-[#F4510B] absolute left-3 pointer-events-none z-10" />
            <select
              aria-label="Filter enquiries by date range"
              value={selectedDateRange}
              onChange={(e) => {
                setSelectedDateRange(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-7 py-2 text-xs font-bold bg-[#F8FAFC] text-[#172B50] border border-[#172B5018] rounded-xl hover:border-[#F4510B50] focus:outline-none focus:ring-2 focus:ring-[#F4510B20] focus:border-[#F4510B] cursor-pointer appearance-none"
            >
              <option value="all">Enquiry Date: All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#172B50]/50 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#172B50]/40 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by child, parent, phone, email, or Enquiry ID..."
              className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-[#F8FAFC] text-[#172B50] placeholder-[#172B5060] border border-[#172B5018] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B20] focus:border-[#F4510B]"
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

          {/* Advanced Filter Button */}
          <button
            type="button"
            onClick={() => setShowFilterDrawer((prev) => !prev)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
              showFilterDrawer || selectedSource !== 'All'
                ? 'bg-[#FFF5ED] border-[#F4510B] text-[#F4510B]'
                : 'bg-[#F8FAFC] border-[#172B5018] text-[#F4510B] hover:bg-[#FFF5ED]'
            }`}
            title="Toggle Lead Source Filters"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Export Report / CSV button */}
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#172B50] bg-white border border-[#172B5018] rounded-xl hover:bg-[#FFF5ED] transition-colors cursor-pointer shrink-0"
          title="Export Filtered Enquiries to CSV"
        >
          <Download className="w-3.5 h-3.5 text-[#172B50]" />
          <span>Export</span>
        </button>
      </div>

      {/* Advanced Filter Drawer (Sources) */}
      {showFilterDrawer && (
        <div className="bg-white rounded-2xl p-4 border border-[#172B5015] shadow-2xs space-y-2 animate-in fade-in duration-150">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#172B50]/60">
            Filter by Acquisition Channel:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedSource('All');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSource === 'All'
                  ? 'bg-[#172B50] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-[#172B50] hover:bg-[#FFF5ED] border border-[#172B5018]'
              }`}
            >
              All Sources ({enrichedEnquiries.length})
            </button>
            {Object.values(ENQUIRY_SOURCES).map((src) => {
              const count = enrichedEnquiries.filter(
                (e) => (e.source || ENQUIRY_SOURCES.MANUAL).toLowerCase() === src.toLowerCase()
              ).length;
              const cfg = ENQUIRY_SOURCE_CONFIG[src] || ENQUIRY_SOURCE_CONFIG[ENQUIRY_SOURCES.OTHER];
              const isSelected = selectedSource === src;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => {
                    setSelectedSource(src);
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
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

      {/* ======================================================== */}
      {/* 7. Enquiry Table (13 Exact Columns)                     */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-[#172B5015] shadow-xs overflow-hidden relative">
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FFF9F5] text-[#172B50] border-b border-[#172B5010]">
                {/* 1. Checkbox */}
                <th className="py-3.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    aria-label="Select all enquiries on this page"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-[#172B5030] text-[#F4510B] focus:ring-[#F4510B] cursor-pointer"
                  />
                </th>

                {/* 2. Enquiry ID */}
                <th className="py-3.5 px-3 font-extrabold text-[#172B50] whitespace-nowrap">
                  Enquiry ID
                </th>

                {/* 3. Enquiry Date (Sortable) */}
                <th className="py-3.5 px-3 font-extrabold text-[#172B50] whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('enquiryDate')}
                    className="inline-flex items-center gap-1 hover:text-[#F4510B] cursor-pointer"
                  >
                    <span>Enquiry Date</span>
                    <ArrowUpDown className="w-3 h-3 text-[#172B50]/50" />
                  </button>
                </th>

                {/* 4. Child Name (Sortable) */}
                <th className="py-3.5 px-3 font-extrabold text-[#172B50] whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort('childName')}
                    className="inline-flex items-center gap-1 hover:text-[#F4510B] cursor-pointer"
                  >
                    <span>Child Name</span>
                    <ArrowUpDown className="w-3 h-3 text-[#172B50]/50" />
                  </button>
                </th>

                {/* 5. Age */}
                <th className="py-3.5 px-3 font-extrabold text-[#172B50] text-center whitespace-nowrap">
                  Age
                </th>

                {/* 6. Parent Name */}
                <th className="py-3.5 px-3 font-extrabold text-[#172B50] whitespace-nowrap">
                  Parent Name
                </th>

                {/* 7. Phone */}
                <th className="py-3.5 px-3 font-extrabold text-[#172B50] whitespace-nowrap">
                  Phone
                </th>

                {/* 8. Email ID */}
                <th className="py-3.5 px-3 font-extrabold text-[#172B50] whitespace-nowrap">
                  Email ID
                </th>

                {/* 9. Program */}
                <th className="py-3.5 px-3 font-extrabold text-[#172B50] whitespace-nowrap">
                  Program
                </th>

                {/* 10. Status */}
                <th className="py-3.5 px-3 font-extrabold text-[#172B50] whitespace-nowrap">
                  Status
                </th>

                {/* 11. Last Parent Response */}
                <th className="py-3.5 px-3 font-extrabold text-[#172B50] whitespace-nowrap">
                  Last Parent Response
                </th>

                {/* 12. Days */}
                <th className="py-3.5 px-3 font-extrabold text-[#172B50] whitespace-nowrap">
                  Days
                </th>

                {/* 13. Actions */}
                <th className="py-3.5 px-3 font-extrabold text-[#172B50] text-right whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#172B500C]">
              {paginatedEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-16 px-4 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-[#FFF5ED] flex items-center justify-center text-[#F4510B] mb-3 shadow-2xs">
                        <Inbox className="w-8 h-8" />
                      </div>
                      <h3 className="text-base font-black text-[#172B50]">No enquiries found</h3>
                      <p className="text-xs text-[#172B50]/70 mt-1 max-w-sm">
                        No enquiries match the current filters or search term. Try resetting your filters or create a new admission lead.
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#F4510B] text-white text-xs font-bold rounded-xl shadow-sm hover:brightness-110 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Add Admission Lead</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEnquiries.map((enq) => {
                  const isChecked = selectedLeadIds.includes(enq.id);
                  const isMenuOpen = activeMenuId === enq.id;
                  const status = enq.resolvedStatus;
                  const ageDisplay = `${enq.childAge || 6} Y`;

                  return (
                    <tr
                      key={enq.id}
                      className={`hover:bg-[#FFF9F5]/70 transition-colors ${
                        isChecked ? 'bg-[#FFF5ED]/50' : ''
                      }`}
                    >
                      {/* 1. Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Select lead ${enq.id}`}
                          checked={isChecked}
                          onChange={() => handleToggleSelectLead(enq.id)}
                          className="w-4 h-4 rounded border-[#172B5030] text-[#F4510B] focus:ring-[#F4510B] cursor-pointer"
                        />
                      </td>

                      {/* 2. Enquiry ID */}
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() => setDetailEnquiryId(enq.id)}
                          className="font-black text-[#172B50] hover:text-[#F4510B] cursor-pointer text-left"
                        >
                          {enq.id}
                        </button>
                      </td>

                      {/* 3. Enquiry Date */}
                      <td className="py-3.5 px-3 text-[#172B50]/80 whitespace-nowrap font-medium">
                        {formatDisplayDate(enq.enquiryDate || enq.createdAt)}
                      </td>

                      {/* 4. Child Name */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-black text-[#172B50]">
                        {enq.childName}
                      </td>

                      {/* 5. Age */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-extrabold ${getAgeBadgeStyle(
                            enq.childAge
                          )}`}
                        >
                          {ageDisplay}
                        </span>
                      </td>

                      {/* 6. Parent Name */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-[#172B50] font-semibold">
                        {enq.parentName}
                      </td>

                      {/* 7. Phone */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <a
                          href={`tel:${enq.phone}`}
                          onClick={() => {
                            addEnquiryActivity(enq.id, {
                              type: 'Phone Call Initiated',
                              description: `Clicked to dial ${enq.phone}`,
                              author: 'Admin Desk',
                            });
                          }}
                          className="inline-flex items-center gap-1.5 text-[#172B50] hover:text-[#F4510B] font-medium"
                          title="Click to dial parent"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#F4510B]" />
                          <span>{enq.phone}</span>
                        </a>
                      </td>

                      {/* 8. Email ID */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {enq.email ? (
                          <a
                            href={`mailto:${enq.email}`}
                            onClick={() => {
                              addEnquiryActivity(enq.id, {
                                type: 'Email Initiated',
                                description: `Clicked to email ${enq.email}`,
                                author: 'Admin Desk',
                              });
                            }}
                            className="inline-flex items-center gap-1.5 text-[#172B50]/80 hover:text-[#F4510B] font-medium"
                            title="Click to email parent"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#172B50]/60" />
                            <span className="truncate max-w-[150px]">{enq.email}</span>
                          </a>
                        ) : (
                          <span className="text-[#172B50]/40">—</span>
                        )}
                      </td>

                      {/* 9. Program */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-[#172B50] font-medium">
                        {enq.interestedProgram || 'Football'}
                      </td>

                      {/* 10. Status Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {status === LEAD_STATUS.DEMO_ATTENDED && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#D4F4DD] text-[#059669] border border-[#A7F3D0]">
                            <PlayCircle className="w-3 h-3 text-[#059669]" />
                            <span>Demo Attended</span>
                          </span>
                        )}
                        {status === LEAD_STATUS.DEMO_REQUESTED && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#DCEEFA] text-[#2563EB] border border-[#BAE6FD]">
                            <Calendar className="w-3 h-3 text-[#2563EB]" />
                            <span>Demo Requested</span>
                          </span>
                        )}
                        {status === LEAD_STATUS.STALE && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                            <Clock className="w-3 h-3 text-[#D97706]" />
                            <span>Stale Lead</span>
                          </span>
                        )}
                        {status === LEAD_STATUS.LOST && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
                            <XCircle className="w-3 h-3 text-[#DC2626]" />
                            <span>Lost Lead</span>
                          </span>
                        )}
                        {status === LEAD_STATUS.ACTIVE && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                            <Zap className="w-3 h-3 text-[#059669]" />
                            <span>Active Lead</span>
                          </span>
                        )}
                        {status === LEAD_STATUS.CONVERTED && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#D4F4DD] text-[#059669] border border-[#A7F3D0]">
                            <GraduationCap className="w-3 h-3 text-[#059669]" />
                            <span>Converted</span>
                          </span>
                        )}
                      </td>

                      {/* 11. Last Parent Response */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-[#172B50]/80 font-medium">
                        {formatDisplayDate(enq.lastParentResponse || enq.enquiryDate || enq.createdAt)}
                      </td>

                      {/* 12. Days */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={getDaysBadgeStyle(enq.daysSinceResponse, status)}>
                          {enq.daysSinceResponse} {enq.daysSinceResponse === 1 ? 'day' : 'days'}
                        </span>
                      </td>

                      {/* 13. Actions (Three-Dot Menu) */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : enq.id);
                          }}
                          className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#172B5015] hover:bg-[#FFF5ED] hover:border-[#F4510B50] text-[#172B50] flex items-center justify-center transition-all cursor-pointer ml-auto"
                          title="Actions menu"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            ref={menuRef}
                            className="absolute right-3 top-10 w-52 bg-white rounded-2xl shadow-[0_10px_35px_rgba(23,43,80,0.15)] border border-[#172B5015] py-1.5 z-50 text-left text-xs animate-in fade-in zoom-in-95 duration-100"
                          >
                            {/* View Details */}
                            <button
                              type="button"
                              onClick={() => {
                                setDetailEnquiryId(enq.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-[#172B50] hover:bg-[#FFF5ED] flex items-center gap-2.5 font-bold cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#172B50]/70" />
                              <span>View Details</span>
                            </button>

                            {/* Edit Enquiry */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(enq)}
                              className="w-full px-3.5 py-2 text-[#172B50] hover:bg-[#FFF5ED] flex items-center gap-2.5 font-bold cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#172B50]/70" />
                              <span>Edit Enquiry</span>
                            </button>

                            {/* Call Parent */}
                            <a
                              href={`tel:${enq.phone}`}
                              onClick={() => {
                                addEnquiryActivity(enq.id, {
                                  type: 'Phone Call Initiated',
                                  description: `Direct dial to ${enq.phone}`,
                                  author: 'Admin Desk',
                                });
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-[#172B50] hover:bg-[#FFF5ED] flex items-center gap-2.5 font-bold cursor-pointer"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#F4510B]" />
                              <span>Call Parent</span>
                            </a>

                            {/* WhatsApp */}
                            <a
                              href={`https://wa.me/${(enq.phone || '').replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                addEnquiryActivity(enq.id, {
                                  type: 'WhatsApp Initiated',
                                  description: `Opened WhatsApp chat with ${enq.phone}`,
                                  author: 'Admin Desk',
                                });
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-[#172B50] hover:bg-[#FFF5ED] flex items-center gap-2.5 font-bold cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-[#10B981]" />
                              <span>WhatsApp</span>
                            </a>

                            {/* Schedule Demo */}
                            {status !== LEAD_STATUS.CONVERTED && (
                              <button
                                type="button"
                                onClick={() => handleOpenConvertDemo(enq)}
                                className="w-full px-3.5 py-2 text-[#172B50] hover:bg-[#FFF5ED] flex items-center gap-2.5 font-bold cursor-pointer"
                              >
                                <Calendar className="w-3.5 h-3.5 text-[#3B82F6]" />
                                <span>Schedule Demo</span>
                              </button>
                            )}

                            {/* Add Follow-up */}
                            <button
                              type="button"
                              onClick={() => handleOpenFollowUp(enq)}
                              className="w-full px-3.5 py-2 text-[#172B50] hover:bg-[#FFF5ED] flex items-center gap-2.5 font-bold cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                              <span>Add Follow-up</span>
                            </button>

                            {/* Update Status */}
                            <button
                              type="button"
                              onClick={() => handleOpenStatusUpdate(enq)}
                              className="w-full px-3.5 py-2 text-[#172B50] hover:bg-[#FFF5ED] flex items-center gap-2.5 font-bold cursor-pointer"
                            >
                              <RotateCw className="w-3.5 h-3.5 text-[#6366F1]" />
                              <span>Update Status</span>
                            </button>

                            {/* Mark as Lost (Red button) */}
                            {status !== LEAD_STATUS.LOST && status !== LEAD_STATUS.CONVERTED && (
                              <button
                                type="button"
                                onClick={() => handleMarkAsLost(enq)}
                                className="w-full px-3.5 py-2 text-[#EF4444] hover:bg-rose-50 flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5 text-[#EF4444]" />
                                <span>Mark as Lost</span>
                              </button>
                            )}

                            {/* Reopen Lead (Green button) */}
                            {status === LEAD_STATUS.LOST && (
                              <button
                                type="button"
                                onClick={() => handleReopenLead(enq)}
                                className="w-full px-3.5 py-2 text-[#10B981] hover:bg-emerald-50 flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-[#10B981]" />
                                <span>Reopen Lead</span>
                              </button>
                            )}

                            {/* View Activity History */}
                            <button
                              type="button"
                              onClick={() => handleOpenActivityHistory(enq)}
                              className="w-full px-3.5 py-2 text-[#172B50] hover:bg-[#FFF5ED] flex items-center gap-2.5 font-bold border-t border-[#172B5010] mt-1 cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#172B50]/60" />
                              <span>View Activity History</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 bg-white border-t border-[#172B5010] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#172B50]">
          <div className="flex items-center gap-2 text-[#172B50]/70 font-semibold">
            <div className="w-4 h-4 rounded-full border border-[#F4510B] text-[#F4510B] flex items-center justify-center text-[10px] font-black shrink-0">
              i
            </div>
            <span>
              Showing Page {safePage} of {totalPages} • {filteredEnquiries.length} enquiry record
              {filteredEnquiries.length === 1 ? '' : 's'}
              {selectedLeadIds.length > 0 && ` (${selectedLeadIds.length} selected)`}
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

      {/* ======================================================== */}
      {/* MODAL 0: Lead Funnel & Conversion Analytics Popup       */}
      {/* ======================================================== */}
      <Modal
        isOpen={isLeadFunnelModalOpen}
        onClose={() => setIsLeadFunnelModalOpen(false)}
        title="Lead Funnel & Conversion Analytics"
        subtitle="End-to-end conversion progression, status distribution, and automated follow-up rules"
        maxWidth="max-w-5xl"
      >
        <div className="space-y-4">
          {/* Top Section: Funnel Card & Status Overview Card Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {/* Card A: Lead Funnel */}
            <div className="bg-white rounded-2xl border border-[#172B5015] p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#172B500C] mb-4">
                <h3 className="text-sm font-black text-[#172B50] tracking-tight flex items-center gap-2">
                  <span>Lead Funnel</span>
                </h3>
                <div
                  className="text-[#172B50]/40 hover:text-[#172B50] cursor-pointer"
                  title="Visual progression from Initial Enquiry to Enrollment. Click any stage to filter leads."
                >
                  <Info className="w-4 h-4" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center">
                {/* Visual Funnel Stack (Clickable Stages) */}
                <div className="sm:col-span-7 space-y-2 py-1">
                  {/* Funnel Stage 1: Enquiries */}
                  <div
                    onClick={() => {
                      setActiveTab('All');
                      setIsLeadFunnelModalOpen(false);
                    }}
                    className="w-full py-2.5 px-3 bg-[#FCD5B5] text-[#172B50] rounded-xl flex items-center justify-center font-extrabold text-xs shadow-2xs transition-all hover:scale-[1.02] hover:brightness-95 cursor-pointer select-none"
                    style={{ clipPath: 'polygon(2% 0%, 98% 0%, 95% 100%, 5% 100%)' }}
                    title="Click to view all enquiries"
                  >
                    <span>
                      <strong className="text-sm font-black mr-2">{funnelData.stages.enquiries}</strong> Enquiries (100%)
                    </span>
                  </div>

                  {/* Funnel Stage 2: Demo Requested */}
                  <div
                    onClick={() => {
                      setActiveTab('Demo Requested');
                      setIsLeadFunnelModalOpen(false);
                    }}
                    className="w-[88%] mx-auto py-2.5 px-3 bg-[#DCEEFA] text-[#172B50] rounded-xl flex items-center justify-center font-extrabold text-xs shadow-2xs transition-all hover:scale-[1.02] hover:brightness-95 cursor-pointer select-none"
                    style={{ clipPath: 'polygon(3% 0%, 97% 0%, 93% 100%, 7% 100%)' }}
                    title="Click to filter Demo Requested leads"
                  >
                    <span>
                      <strong className="text-sm font-black mr-2">{funnelData.stages.demoRequested}</strong> Demo Requested ({funnelData.percentages.demoRequested}%)
                    </span>
                  </div>

                  {/* Funnel Stage 3: Demo Attended */}
                  <div
                    onClick={() => {
                      setActiveTab('Demo Attended');
                      setIsLeadFunnelModalOpen(false);
                    }}
                    className="w-[76%] mx-auto py-2.5 px-3 bg-[#CCE3F7] text-[#172B50] rounded-xl flex items-center justify-center font-extrabold text-xs shadow-2xs transition-all hover:scale-[1.02] hover:brightness-95 cursor-pointer select-none"
                    style={{ clipPath: 'polygon(4% 0%, 96% 0%, 91% 100%, 9% 100%)' }}
                    title="Click to filter Demo Attended leads"
                  >
                    <span>
                      <strong className="text-sm font-black mr-2">{funnelData.stages.demoAttended}</strong> Demo Attended ({funnelData.percentages.demoAttended}%)
                    </span>
                  </div>

                  {/* Funnel Stage 4: Converted */}
                  <div
                    onClick={() => {
                      setActiveTab('Converted');
                      setIsLeadFunnelModalOpen(false);
                    }}
                    className="w-[64%] mx-auto py-2.5 px-3 bg-[#D4F4DD] text-[#172B50] rounded-xl flex items-center justify-center font-extrabold text-xs shadow-2xs transition-all hover:scale-[1.02] hover:brightness-95 cursor-pointer select-none"
                    style={{ clipPath: 'polygon(5% 0%, 95% 0%, 90% 100%, 10% 100%)' }}
                    title="Click to filter Converted leads"
                  >
                    <span>
                      <strong className="text-sm font-black mr-2">{funnelData.stages.converted}</strong> Converted ({funnelData.percentages.converted}%)
                    </span>
                  </div>
                </div>

                {/* Funnel Insights */}
                <div className="sm:col-span-5 space-y-3 pl-0 sm:pl-2 border-t sm:border-t-0 sm:border-l border-[#172B500C] pt-3 sm:pt-0">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-[#172B50]/60">
                    Funnel Insights
                  </h4>

                  <div className="space-y-3 text-xs">
                    {/* Metric 1 */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#FFF4E8] flex items-center justify-center text-[#F4510B] shrink-0">
                        <BarChart2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-black text-[#172B50] text-sm">
                          {funnelData.insights.enquiryToDemoRate}%
                        </div>
                        <div className="text-[11px] text-[#172B50]/70 font-semibold">
                          Enquiry → Demo Request
                        </div>
                      </div>
                    </div>

                    {/* Metric 2 */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] shrink-0">
                        <PlayCircle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-black text-[#172B50] text-sm">
                          {funnelData.insights.demoToAttendedRate}%
                        </div>
                        <div className="text-[11px] text-[#172B50]/70 font-semibold">
                          Demo Request → Attended
                        </div>
                      </div>
                    </div>

                    {/* Metric 3 */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[#10B981] shrink-0">
                        <GraduationCap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-black text-[#172B50] text-sm">
                          {funnelData.insights.attendedToConvertedRate}%
                        </div>
                        <div className="text-[11px] text-[#172B50]/70 font-semibold">
                          Attended → Converted
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card B: Lead Status Overview */}
            <div className="bg-white rounded-2xl border border-[#172B5015] p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#172B500C] mb-4">
                <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                  Lead Status Overview
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* SVG Donut Chart with Center Total */}
                <div className="sm:col-span-5 flex items-center justify-center relative">
                  <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Ring if total is 0 */}
                    {donutData.total === 0 ? (
                      <circle
                        cx="50"
                        cy="50"
                        r={donutData.radius}
                        fill="transparent"
                        stroke="#E2E8F0"
                        strokeWidth="12"
                      />
                    ) : (
                      donutData.slices.map((slice, idx) => (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r={donutData.radius}
                          fill="transparent"
                          stroke={slice.color}
                          strokeWidth="12"
                          strokeDasharray={slice.strokeDasharray}
                          strokeDashoffset={slice.strokeDashoffset}
                          className="transition-all duration-500"
                        />
                      ))
                    )}
                  </svg>
                  {/* Donut Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-2xl font-black text-[#172B50] leading-none">
                      {donutData.total}
                    </span>
                    <span className="text-[10px] font-bold text-[#172B50]/60 mt-0.5">
                      Total Leads
                    </span>
                  </div>
                </div>

                {/* Status Legend Table (Clickable Rows) */}
                <div className="sm:col-span-7 space-y-2 text-xs">
                  {donutData.slices.map((slice, idx) => {
                    const statusTarget =
                      slice.label.startsWith('Active') ? 'Active' :
                      slice.label.startsWith('Stale') ? 'Stale' :
                      slice.label.startsWith('Demo Requested') ? 'Demo Requested' :
                      slice.label.startsWith('Demo Attended') ? 'Demo Attended' :
                      slice.label.startsWith('Converted') ? 'Converted' :
                      slice.label.startsWith('Lost') ? 'Lost' : 'All';

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setActiveTab(statusTarget);
                          setIsLeadFunnelModalOpen(false);
                        }}
                        className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-[#FFF4E8]/60 cursor-pointer transition-colors group"
                        title={`Click to filter by ${slice.label}`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                            style={{ backgroundColor: slice.color }}
                          />
                          <span className="text-[#172B50] font-semibold truncate text-[11.5px] group-hover:text-[#F4510B] transition-colors">
                            {slice.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-extrabold text-[#172B50]">{slice.count}</span>
                          <span className="text-[11px] text-[#172B50]/60 font-semibold w-11 text-right">
                            {slice.percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Automatic Lead Status Rules Horizontal Strip */}
          <div className="bg-[#FFF9F5] rounded-2xl border border-[#F4510B20] p-3 sm:px-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 flex-1">
              {/* Header Tag */}
              <div className="flex items-center gap-2 font-black text-[#172B50] shrink-0">
                <Calendar className="w-4 h-4 text-[#F4510B]" />
                <span>Lead Status Rule (Auto)</span>
              </div>

              <div className="hidden lg:block w-px h-6 bg-[#172B5018]" />

              {/* Rule 1: Active 0-5 days */}
              <div
                onClick={() => {
                  setActiveTab('Active');
                  setIsLeadFunnelModalOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                title="Filter Active Leads"
              >
                <div className="w-5 h-5 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#10B981] shrink-0">
                  <Zap className="w-3 h-3" />
                </div>
                <div>
                  <span className="font-extrabold text-[#172B50]">Active: 0 – 5 days</span>
                  <span className="text-[11px] text-[#172B50]/60 block sm:inline sm:ml-1.5">
                    New enquiry, under follow-up
                  </span>
                </div>
              </div>

              <div className="hidden lg:block w-px h-6 bg-[#172B5018]" />

              {/* Rule 2: Stale > 5 days */}
              <div
                onClick={() => {
                  setActiveTab('Stale');
                  setIsLeadFunnelModalOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                title="Filter Stale Leads"
              >
                <div className="w-5 h-5 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#F59E0B] shrink-0">
                  <Clock className="w-3 h-3" />
                </div>
                <div>
                  <span className="font-extrabold text-[#172B50]">Stale: &gt; 5 days</span>
                  <span className="text-[11px] text-[#172B50]/60 block sm:inline sm:ml-1.5">
                    No response after 5 days
                  </span>
                </div>
              </div>

              <div className="hidden lg:block w-px h-6 bg-[#172B5018]" />

              {/* Rule 3: Lost */}
              <div
                onClick={() => {
                  setActiveTab('Lost');
                  setIsLeadFunnelModalOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                title="Filter Lost Leads"
              >
                <div className="w-5 h-5 rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#EF4444] shrink-0">
                  <XCircle className="w-3 h-3" />
                </div>
                <div>
                  <span className="font-extrabold text-[#172B50]">Lost: No response for 5 days</span>
                  <span className="text-[11px] text-[#172B50]/60 block sm:inline sm:ml-1.5">
                    Automatically marked as Lost
                  </span>
                </div>
              </div>
            </div>

            {/* View Automation Logs Button */}
            <button
              type="button"
              onClick={() => setIsAutomationLogsModalOpen(true)}
              className="px-3.5 py-1.5 bg-white border border-[#172B5018] rounded-xl text-xs font-bold text-[#172B50] hover:bg-[#FFF5ED] hover:border-[#F4510B40] transition-colors flex items-center gap-1.5 shrink-0 self-start lg:self-center cursor-pointer shadow-2xs active:scale-95"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#172B50]" />
              <span>View Automation Logs</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 1: Add / Edit Admission Lead                      */}
      {/* ======================================================== */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingEnquiry ? `Edit Enquiry: ${editingEnquiry.id}` : 'New Admission Lead'}
        subtitle="Capture prospective student details, batch preferences, and parent contact information"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Child Name *</label>
              <input
                type="text"
                required
                value={formState.childName}
                onChange={(e) => setFormState({ ...formState, childName: e.target.value })}
                placeholder="e.g. Aarav Krishna"
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
                placeholder="e.g. Rohit Krishna"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
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
              <label className="text-xs font-bold text-[#172B50] block mb-1">Age (Years)</label>
              <input
                type="number"
                min="3"
                max="18"
                value={formState.childAge}
                onChange={(e) => setFormState({ ...formState, childAge: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Gender</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Contact Phone *</label>
              <input
                type="tel"
                required
                value={formState.phone}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Email ID</label>
              <input
                type="email"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                placeholder="parent@example.com"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Academy Location *</label>
              <select
                value={formState.center}
                onChange={(e) => setFormState({ ...formState, center: e.target.value, preferredBatchId: '' })}
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
              <label className="text-xs font-bold text-[#172B50] block mb-1">Sports Program *</label>
              <select
                value={formState.interestedProgram}
                onChange={(e) => setFormState({ ...formState, interestedProgram: e.target.value, preferredBatchId: '' })}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Preferred Batch</label>
              <select
                value={formState.preferredBatchId}
                onChange={(e) => setFormState({ ...formState, preferredBatchId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                <option value="">Open / Unscheduled Batch</option>
                {availableFormBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.timeSlot || 'Batch'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Lead Source</label>
              <select
                value={formState.source}
                onChange={(e) => setFormState({ ...formState, source: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {Object.values(ENQUIRY_SOURCES).map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Notes / Preferences</label>
            <textarea
              rows={2}
              value={formState.notes}
              onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
              placeholder="e.g. Interested in trial session on weekends, previous sports experience..."
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF5ED] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              {editingEnquiry ? 'Update Enquiry' : 'Save Admission Lead'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: Import Leads Modal (CSV Parser)                */}
      {/* ======================================================== */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportPreview(null);
          setCsvText('');
        }}
        title="Import Admission Leads"
        subtitle="Bulk import enquiries from CSV file or copy-pasted tabular records"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#FFF9F5] border border-[#F4510B25] flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-[#172B50] block">Need the standard format template?</span>
              <span className="text-[11px] text-[#172B50]/70">
                Headers: Child Name, Parent Name, Phone, Email ID, Program, Location, Age, Notes
              </span>
            </div>
            <button
              type="button"
              onClick={handleDownloadSampleCSV}
              className="px-3 py-1.5 bg-white border border-[#F4510B] text-[#F4510B] rounded-xl font-bold flex items-center gap-1.5 shadow-2xs hover:bg-[#FFF5ED] cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sample CSV</span>
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="w-full text-xs text-[#172B50] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#172B50] file:text-white hover:file:bg-[#F4510B] file:cursor-pointer cursor-pointer border border-[#172B5020] rounded-xl p-2 bg-[#F8FAFC]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">
              Or Paste CSV / Tabular Text Directly
            </label>
            <textarea
              rows={5}
              value={csvText}
              onChange={(e) => handleCSVTextChange(e.target.value)}
              placeholder="Child Name,Parent Name,Phone,Email ID,Program,Location,Age,Notes&#10;Aarav Krishna,Rohit Krishna,+91 98765 43210,rohit@gmail.com,Football,KK NAGAR,6,Interested in trials"
              className="w-full px-3 py-2 text-xs font-mono bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          {importPreview && (
            <div className="space-y-2 pt-2 border-t border-[#172B5015]">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{importPreview.valid.length} Valid Leads Ready to Import</span>
                </span>
                {importPreview.errors.length > 0 && (
                  <span className="text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{importPreview.errors.length} Warning/Errors</span>
                  </span>
                )}
              </div>

              {/* Preview table snippet */}
              {importPreview.valid.length > 0 && (
                <div className="max-h-36 overflow-y-auto border border-[#172B5015] rounded-xl">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#F8FAFC] text-[#172B50] border-b border-[#172B5010]">
                      <tr>
                        <th className="p-2">Child</th>
                        <th className="p-2">Parent</th>
                        <th className="p-2">Phone</th>
                        <th className="p-2">Program</th>
                        <th className="p-2">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#172B500A]">
                      {importPreview.valid.slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-[#172B50]">{row.childName}</td>
                          <td className="p-2">{row.parentName}</td>
                          <td className="p-2 font-mono">{row.phone}</td>
                          <td className="p-2">{row.interestedProgram}</td>
                          <td className="p-2">{row.center}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsImportModalOpen(false);
                setImportPreview(null);
                setCsvText('');
              }}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF5ED] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!importPreview || importPreview.valid.length === 0 || isImporting}
              onClick={handleConfirmImport}
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isImporting ? 'Importing Leads...' : `Import ${importPreview?.valid.length || 0} Leads`}
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: Convert to Scheduled Demo                      */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(demoModalEnquiry)}
        onClose={() => setDemoModalEnquiry(null)}
        title="Schedule Demo Class"
        subtitle={
          demoModalEnquiry
            ? `Scheduling trial for ${demoModalEnquiry.childName} (${demoModalEnquiry.center} • ${demoModalEnquiry.interestedProgram})`
            : ''
        }
      >
        {demoModalEnquiry && (
          <form onSubmit={handleSaveDemoFromEnquiry} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
              <span className="font-bold block">Carried Forward from Lead:</span>
              <p>
                Location <strong>{demoModalEnquiry.center}</strong>, Program <strong>{demoModalEnquiry.interestedProgram}</strong>, and contact <strong>{demoModalEnquiry.phone}</strong> are automatically linked.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Demo Date *</label>
                <input
                  type="date"
                  required
                  value={demoModalForm.demoDate}
                  onChange={(e) => setDemoModalForm({ ...demoModalForm, demoDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Session Time *</label>
                <input
                  type="time"
                  required
                  value={demoModalForm.demoTime}
                  onChange={(e) => setDemoModalForm({ ...demoModalForm, demoTime: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              >
                <option value="">Select coach...</option>
                {eligibleCoachesForDemoModal.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} • {c.center} ({c.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Session Goals / Notes</label>
              <textarea
                rows={2}
                value={demoModalForm.notes}
                onChange={(e) => setDemoModalForm({ ...demoModalForm, notes: e.target.value })}
                placeholder="Specific instructions or assessment focus..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5022] text-[#172B50]"
              />
            </div>

            <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDemoModalEnquiry(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-[#172B50] text-white rounded-xl shadow-sm hover:bg-[#F4510B] cursor-pointer"
              >
                Confirm Demo Session
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 4: Follow-up Logger                               */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(followUpModalEnquiry)}
        onClose={() => setFollowUpModalEnquiry(null)}
        title="Add Parent Follow-up"
        subtitle={
          followUpModalEnquiry
            ? `Logging outreach for ${followUpModalEnquiry.childName} (Parent: ${followUpModalEnquiry.parentName})`
            : ''
        }
      >
        {followUpModalEnquiry && (
          <form onSubmit={handleSaveFollowUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Contact Channel *</label>
                <select
                  value={followUpForm.type}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, type: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5025] text-[#172B50]"
                >
                  <option value="Phone Call">Phone Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                  <option value="In-Person Meeting">In-Person Meeting</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Interaction Date *</label>
                <input
                  type="date"
                  required
                  value={followUpForm.date}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5025] text-[#172B50]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Parent Response Outcome</label>
              <select
                value={followUpForm.outcome}
                onChange={(e) => setFollowUpForm({ ...followUpForm, outcome: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5025] text-[#172B50]"
              >
                <option value="Interested - Trial Requested">Interested - Trial Requested</option>
                <option value="Interested - Deciding on Schedule">Interested - Deciding on Schedule</option>
                <option value="Call Back Later">Call Back Later</option>
                <option value="Not Reachable / Busy">Not Reachable / Busy</option>
                <option value="Not Interested at this time">Not Interested at this time</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Follow-up Notes / Summary</label>
              <textarea
                rows={3}
                required
                value={followUpForm.notes}
                onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                placeholder="Parent confirmed they will attend weekend session, prefers morning slot..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5025] text-[#172B50]"
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
              <input
                type="checkbox"
                id="parentRespondedCheck"
                checked={followUpForm.parentResponded}
                onChange={(e) => setFollowUpForm({ ...followUpForm, parentResponded: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-[#10B981] focus:ring-[#10B981] cursor-pointer"
              />
              <label htmlFor="parentRespondedCheck" className="text-xs text-emerald-900 font-bold cursor-pointer">
                Parent responded (resets inactivity timer to 0 days, restores Active status)
              </label>
            </div>

            <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setFollowUpModalEnquiry(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 cursor-pointer"
              >
                Save Follow-up
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 5: Manual Status Update                           */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(statusUpdateEnquiry)}
        onClose={() => setStatusUpdateEnquiry(null)}
        title="Update Lead Status"
        subtitle={statusUpdateEnquiry ? `Changing status for ${statusUpdateEnquiry.childName} (${statusUpdateEnquiry.id})` : ''}
      >
        {statusUpdateEnquiry && (
          <form onSubmit={handleSaveStatusUpdate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">New Status</label>
              <select
                value={newStatusChoice}
                onChange={(e) => setNewStatusChoice(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5025] text-[#172B50]"
              >
                <option value={LEAD_STATUS.ACTIVE}>Active Lead (0-5 days)</option>
                <option value={LEAD_STATUS.STALE}>Stale Lead (&gt; 5 days)</option>
                <option value={LEAD_STATUS.DEMO_REQUESTED}>Demo Requested</option>
                <option value={LEAD_STATUS.DEMO_ATTENDED}>Demo Attended</option>
                <option value={LEAD_STATUS.CONVERTED}>Converted (Enrolled)</option>
                <option value={LEAD_STATUS.LOST}>Lost Lead</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Reason for Status Change</label>
              <textarea
                rows={2}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Parent confirmed relocation, scheduling conflict, etc."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5025] text-[#172B50]"
              />
            </div>

            <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStatusUpdateEnquiry(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-[#172B50] text-white rounded-xl shadow-sm hover:bg-[#F4510B] cursor-pointer"
              >
                Update Status
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 6: Activity History Timeline                      */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(activityHistoryEnquiry)}
        onClose={() => setActivityHistoryEnquiry(null)}
        title="Activity History Timeline"
        subtitle={activityHistoryEnquiry ? `${activityHistoryEnquiry.childName} • ${activityHistoryEnquiry.id} • ${activityHistoryEnquiry.center}` : ''}
        maxWidth="max-w-2xl"
      >
        {activityHistoryEnquiry && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-[#FFF9F5] border border-[#F4510B20] flex items-center justify-between text-xs">
              <span className="font-bold text-[#172B50]">
                Current Status:{' '}
                <strong className="text-[#F4510B]">{activityHistoryEnquiry.resolvedStatus}</strong>
              </span>
              <span className="text-[#172B50]/70">
                Inactivity:{' '}
                <strong>
                  {activityHistoryEnquiry.daysSinceResponse}{' '}
                  {activityHistoryEnquiry.daysSinceResponse === 1 ? 'day' : 'days'}
                </strong>
              </span>
            </div>

            {currentActivities.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#172B50]/60">
                No past activities recorded yet.
              </div>
            ) : (
              <div className="relative border-l-2 border-[#172B5015] ml-4 space-y-4 py-2">
                {currentActivities.map((act, index) => (
                  <div key={index} className="relative pl-6">
                    {/* Circle Node */}
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#F4510B] border-2 border-white shadow-2xs" />
                    <div className="bg-white p-3 rounded-xl border border-[#172B5012] shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-xs text-[#172B50]">{act.type}</span>
                        <span className="text-[10px] text-[#172B50]/50 font-medium">
                          {formatDisplayDate(act.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-[#172B50]/80 mt-1">{act.description}</p>
                      {act.author && (
                        <span className="text-[10px] text-[#F4510B] font-bold block mt-1">
                          By: {act.author}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActivityHistoryEnquiry(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#172B50] text-white hover:bg-[#F4510B] cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 7: Automation Logs                                */}
      {/* ======================================================== */}
      <Modal
        isOpen={isAutomationLogsModalOpen}
        onClose={() => setIsAutomationLogsModalOpen(false)}
        title="Automatic Lead Status Logs"
        subtitle="Audit logs of automated and rule-based status transitions"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
            <span>
              Rules active: <strong>Active (0-5 days)</strong>, <strong>Stale (&gt; 5 days)</strong>, and <strong>Lost (no response for 5 days)</strong>.
            </span>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('little_spartans_lead_automation_logs');
                setAutomationLogs([]);
                addToast('Automation logs cleared.', 'info');
              }}
              className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
            >
              Clear Logs
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto border border-[#172B5015] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#172B50] border-b border-[#172B5010]">
                <tr>
                  <th className="p-2.5">Timestamp</th>
                  <th className="p-2.5">Lead / Enquiry</th>
                  <th className="p-2.5">Transition</th>
                  <th className="p-2.5">Applied Rule</th>
                  <th className="p-2.5">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B500C]">
                {automationLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-[#172B50]/60">
                      No automated status change logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  automationLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-2.5 text-[11px] text-[#172B50]/60 whitespace-nowrap">
                        {formatDisplayDate(log.timestamp)}
                      </td>
                      <td className="p-2.5 font-bold text-[#172B50] whitespace-nowrap">
                        {log.childName} ({log.enquiryId})
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold bg-[#172B500A] px-2 py-0.5 rounded text-[#172B50]">
                          {log.fromStatus} → {log.toStatus}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-[#F4510B] text-[11px] whitespace-nowrap">
                        {log.rule}
                      </td>
                      <td className="p-2.5 text-[11px] text-[#172B50]/80">
                        {log.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsAutomationLogsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#172B50] text-white hover:bg-[#F4510B] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 8: Enquiry Full Details View                      */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(detailEnquiry)}
        onClose={() => setDetailEnquiryId(null)}
        title={detailEnquiry ? `Enquiry Details: ${detailEnquiry.id}` : 'Enquiry Details'}
        subtitle={
          detailEnquiry
            ? `${detailEnquiry.center} • ${detailEnquiry.interestedProgram} • Status: ${detailEnquiry.resolvedStatus}`
            : ''
        }
        maxWidth="max-w-2xl"
      >
        {detailEnquiry && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#FFF9F5] border border-[#F4510B20]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#172B50]">Source:</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-white border border-[#172B5020] text-[#172B50]">
                  {detailEnquiry.source || 'Manual Desk'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-[#172B50]">Current Status:</span>
                <span className="px-2.5 py-0.5 rounded-md font-extrabold bg-[#172B50] text-white text-[11px]">
                  {detailEnquiry.resolvedStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-[#172B5015]">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50]/60 block">Child Information</span>
                <p className="text-sm font-black text-[#172B50] mt-0.5">{detailEnquiry.childName}</p>
                <p className="text-xs text-[#172B50]/80">
                  Age: {detailEnquiry.childAge} yrs • Gender: {detailEnquiry.gender || 'Not specified'}
                </p>
                {detailEnquiry.dob && <p className="text-xs text-[#172B50]/70">DOB: {detailEnquiry.dob}</p>}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50]/60 block">Parent / Contact</span>
                <p className="text-sm font-black text-[#172B50] mt-0.5">{detailEnquiry.parentName}</p>
                <p className="text-xs text-[#172B50]/80">Phone: {detailEnquiry.phone}</p>
                <p className="text-xs text-[#172B50]/80">Email: {detailEnquiry.email || '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-[#172B5015] bg-[#F8FAFC]">
                <span className="text-[10px] font-bold uppercase text-[#172B50]/60 block">Academy Location</span>
                <span className="font-black text-[#F4510B]">{detailEnquiry.center}</span>
              </div>
              <div className="p-3 rounded-xl border border-[#172B5015] bg-[#F8FAFC]">
                <span className="text-[10px] font-bold uppercase text-[#172B50]/60 block">Sports Program</span>
                <span className="font-bold text-[#172B50]">{detailEnquiry.interestedProgram}</span>
              </div>
              <div className="p-3 rounded-xl border border-[#172B5015] bg-[#F8FAFC]">
                <span className="text-[10px] font-bold uppercase text-[#172B50]/60 block">Preferred Batch</span>
                <span className="font-bold text-[#172B50] block">
                  {detailEnquiry.preferredBatchName || 'Open Batch'}
                </span>
              </div>
            </div>

            {detailEnquiry.notes && (
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#172B5015] text-xs">
                <span className="text-[10px] font-bold uppercase text-[#172B50]/60 block mb-0.5">Notes:</span>
                <p className="text-[#172B50]/85 whitespace-pre-wrap">{detailEnquiry.notes}</p>
              </div>
            )}

            <div className="pt-3 border-t border-[#172B5015] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditModal(detailEnquiry);
                    setDetailEnquiryId(null);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#172B5020] text-xs font-bold text-[#172B50] hover:bg-[#FFF5ED] cursor-pointer"
                >
                  Edit Enquiry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenActivityHistory(detailEnquiry);
                    setDetailEnquiryId(null);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#172B5020] text-xs font-bold text-[#172B50] hover:bg-[#FFF5ED] cursor-pointer"
                >
                  Activity History
                </button>
              </div>

              <div className="flex items-center gap-2">
                {detailEnquiry.resolvedStatus !== LEAD_STATUS.CONVERTED && (
                  <button
                    type="button"
                    onClick={() => {
                      openEnrollConfirmation(detailEnquiry);
                      setDetailEnquiryId(null);
                    }}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#F4510B] text-white hover:brightness-110 cursor-pointer shadow-2xs"
                  >
                    Enroll Student
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDetailEnquiryId(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#172B50] text-white hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 9: Enroll Student Confirmation & Result           */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(enrollModalEnquiry)}
        onClose={() => {
          setEnrollModalEnquiry(null);
          setEnrollmentResult(null);
        }}
        title={enrollmentResult ? 'Student Enrolled Successfully' : 'Confirm Student Enrollment'}
        subtitle={
          enrollmentResult
            ? `Student profile and parent credentials established`
            : enrollModalEnquiry
            ? `Converting lead ${enrollModalEnquiry.id} into active enrolled student`
            : ''
        }
        maxWidth="max-w-2xl"
      >
        {enrollmentResult ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Enrollment Successful!</span>
              </div>
              <p className="text-xs">
                <strong>{enrollmentResult.student?.name}</strong> is now enrolled at{' '}
                <strong>{enrollmentResult.student?.center}</strong>.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  Student ID: <strong>{enrollmentResult.student?.id}</strong>
                </div>
                <div>
                  Parent ID: <strong>{enrollmentResult.parent?.id}</strong>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setEnrollModalEnquiry(null);
                  setEnrollmentResult(null);
                }}
                className="px-5 py-2 text-xs font-bold bg-[#172B50] text-white rounded-xl hover:bg-[#F4510B] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          enrollModalEnquiry && (
            <form onSubmit={handleConfirmEnrollment} className="space-y-4">
              {enrollErrors.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                  <div className="font-bold">Please resolve the following:</div>
                  <ul className="list-disc list-inside">
                    {enrollErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#172B50] block mb-1">Location *</label>
                  <select
                    value={enrollOverrides.center || enrollModalEnquiry.center}
                    onChange={(e) => setEnrollOverrides({ ...enrollOverrides, center: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5025] text-[#172B50]"
                  >
                    {commonLocations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#172B50] block mb-1">Program *</label>
                  <select
                    value={enrollOverrides.interestedProgram || enrollModalEnquiry.interestedProgram}
                    onChange={(e) => setEnrollOverrides({ ...enrollOverrides, interestedProgram: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5025] text-[#172B50]"
                  >
                    {data.programs.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Assigned Training Batch</label>
                <select
                  value={enrollOverrides.preferredBatchId || enrollModalEnquiry.preferredBatchId}
                  onChange={(e) => setEnrollOverrides({ ...enrollOverrides, preferredBatchId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#172B5025] text-[#172B50]"
                >
                  <option value="">Open / Standard Batch</option>
                  {availableEnrollBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.center} • {b.timeSlot || 'Session'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEnrollModalEnquiry(null)}
                  className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEnrollment}
                  className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 disabled:opacity-40 cursor-pointer"
                >
                  {isSubmittingEnrollment ? 'Enrolling...' : 'Confirm & Complete Enrollment'}
                </button>
              </div>
            </form>
          )
        )}
      </Modal>
    </div>
  );
}
