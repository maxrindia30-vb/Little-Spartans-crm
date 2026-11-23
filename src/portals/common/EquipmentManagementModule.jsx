import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Download,
  Eye,
  FileText,
  Wrench,
  RefreshCw,
  Layers,
  Check,
  X,
  MapPin,
  Calendar,
  AlertCircle,
  HelpCircle,
  UserCheck,
  Shield,
  Sparkles,
  ArrowRight,
  Camera,
  Image,
  Upload,
  User,
  CheckSquare
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  CONDITION_COLORS,
  REPORT_STATUSES,
  STATUS_COLORS,
  EQUIPMENT_REQUEST_TYPES,
  filterEquipment,
  calculateEquipmentMetrics,
  exportEquipmentToCsv
} from '../../services/equipmentService';
import { AnimatedCounter } from '../../components/common/KpiCard';
import FloatingCard from '../../components/common/FloatingCard';
import Modal from '../../components/common/Modal';

export default function EquipmentManagementModule({
  role = 'super_coach', // 'super_coach' | 'admin' | 'coach'
  allowedLocations = null // null means all locations
}) {
  const {
    data,
    addEquipmentItem,
    updateEquipmentItem,
    deleteEquipmentItem,
    submitEquipmentReport,
    submitEquipmentRequest,
    reviewEquipmentRequest,
    fulfillEquipmentRequest,
    confirmEquipmentCheck,
    adminApproveEquipmentReport,
    currentUser,
    addToast,
    activeSubTab,
    setActiveSubTab
  } = useCrm();

  const isCoach = role === 'coach';
  const isSuperCoach = role === 'super_coach';
  const isAdmin = role === 'admin';

  // Active view tab: 'inventory' | 'requests' | 'audit' | 'my_requests'
  const [activeTab, setActiveTab] = useState(() => {
    if (isCoach) return 'inventory';
    return activeSubTab === 'reports' ? 'requests' : 'inventory';
  });

  // Sync activeTab when activeSubTab changes from sidebar (for Admin/SuperCoach)
  useEffect(() => {
    if (!isCoach) {
      if (activeSubTab === 'reports') {
        setActiveTab('requests');
      } else if (activeSubTab === 'inventory') {
        setActiveTab('inventory');
      }
    }
  }, [activeSubTab, isCoach]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (setActiveSubTab && !isCoach) {
      setActiveSubTab(tabId === 'requests' ? 'reports' : 'inventory');
    }
  };

  // For Coach Portal: allow selecting a coach to test different locations (KK Nagar, Kilpauk, Anna Nagar, etc.)
  const [activeCoachId, setActiveCoachId] = useState(() => {
    return data.coaches && data.coaches[0] ? data.coaches[0].id : '';
  });

  const activeCoach = useMemo(() => {
    if (!isCoach) return null;
    return (data.coaches || []).find((c) => c.id === activeCoachId) || (data.coaches && data.coaches[0]) || {
      name: currentUser?.name || 'Coach Arun Prakash',
      center: 'KK NAGAR',
      id: 'COACH-1'
    };
  }, [data.coaches, activeCoachId, isCoach, currentUser]);

  // Determine effective allowed locations
  const effectiveAllowedLocations = useMemo(() => {
    if (isCoach) {
      const loc = activeCoach?.center || activeCoach?.location || (allowedLocations && allowedLocations[0]) || 'KK NAGAR';
      return [loc];
    }
    if (allowedLocations && Array.isArray(allowedLocations) && allowedLocations.length > 0) {
      return allowedLocations;
    }
    return null; // All locations
  }, [isCoach, activeCoach, allowedLocations]);

  // Available locations list
  const availableLocations = useMemo(() => {
    const rawLocations = data.locations || data.academy?.centers || ['KK NAGAR', 'KILPAUK', 'MAHALINGAPURAM', 'ANNA NAGAR', 'KOLATHUR'];
    const all = rawLocations.map((l) => (typeof l === 'object' && l ? (l.name || l.id) : l)).filter(Boolean);
    const finalLocations = all.length > 0 ? all : ['KK NAGAR', 'KILPAUK', 'MAHALINGAPURAM', 'ANNA NAGAR', 'KOLATHUR'];
    if (effectiveAllowedLocations && effectiveAllowedLocations.length > 0) {
      return finalLocations.filter((loc) => effectiveAllowedLocations.includes(loc));
    }
    return finalLocations;
  }, [data.locations, data.academy, effectiveAllowedLocations]);

  // Filter states
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedRequestStatus, setSelectedRequestStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isRequestDetailsModalOpen, setIsRequestDetailsModalOpen] = useState(false);

  // Selected item / report for modal actions
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Form states for Add / Edit Equipment
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'Football',
    location: '',
    totalQty: 10,
    availableQty: 10,
    damagedQty: 0,
    missingQty: 0,
    condition: 'Good',
    purchaseDate: new Date().toISOString().split('T')[0],
    remarks: '',
    imageUrl: '',
    linkedRequestId: ''
  });

  // Form states for Coach Equipment Request / Report
  const [requestForm, setRequestForm] = useState({
    equipmentMode: 'existing', // 'existing' | 'new'
    equipmentId: '',
    equipmentName: '',
    category: 'Football',
    location: '',
    requestType: 'New Equipment Required',
    requiredQty: 1,
    damagedCount: 0,
    missingCount: 0,
    reportedCondition: 'Good',
    remarks: '',
    photoNote: '',
    photoUrl: ''
  });

  // Review modal form state (for Super Coach / Admin)
  const [reviewForm, setReviewForm] = useState({
    status: 'Approved',
    notes: '',
    action: 'Approved'
  });

  // Scoped equipment list based on allowed locations
  const scopedEquipmentList = useMemo(() => {
    const list = data.equipment || [];
    if (effectiveAllowedLocations && effectiveAllowedLocations.length > 0) {
      return list.filter((i) => effectiveAllowedLocations.includes(i.location));
    }
    return list;
  }, [data.equipment, effectiveAllowedLocations]);

  // Scoped requests/reports list based on allowed locations
  const scopedRequestsList = useMemo(() => {
    const list = data.equipmentReports || [];
    if (effectiveAllowedLocations && effectiveAllowedLocations.length > 0) {
      return list.filter((r) => effectiveAllowedLocations.includes(r.location));
    }
    return list;
  }, [data.equipmentReports, effectiveAllowedLocations]);

  // Filtered equipment inventory
  const filteredEquipment = useMemo(() => {
    return filterEquipment(scopedEquipmentList, {
      location: isCoach ? availableLocations[0] || 'All' : selectedLocation,
      category: selectedCategory,
      condition: selectedCondition,
      search: searchTerm
    });
  }, [scopedEquipmentList, isCoach, availableLocations, selectedLocation, selectedCategory, selectedCondition, searchTerm]);

  // Filtered requests queue
  const filteredRequests = useMemo(() => {
    return scopedRequestsList.filter((r) => {
      const matchLoc = isCoach
        ? r.location === availableLocations[0]
        : selectedLocation === 'All' || r.location === selectedLocation;
      const matchStatus = selectedRequestStatus === 'All' || r.status === selectedRequestStatus;
      const query = searchTerm.trim().toLowerCase();
      const matchSearch =
        !query ||
        r.equipmentName?.toLowerCase().includes(query) ||
        r.id?.toLowerCase().includes(query) ||
        r.coachName?.toLowerCase().includes(query) ||
        r.submittedBy?.toLowerCase().includes(query) ||
        r.requestType?.toLowerCase().includes(query) ||
        r.remarks?.toLowerCase().includes(query);
      return matchLoc && matchStatus && matchSearch;
    });
  }, [scopedRequestsList, isCoach, availableLocations, selectedLocation, selectedRequestStatus, searchTerm]);

  // Coach's own submitted requests
  const mySubmittedRequests = useMemo(() => {
    if (!isCoach) return [];
    const coachName = activeCoach?.name || currentUser?.name || '';
    const loc = activeCoach?.center || availableLocations[0] || '';
    return (data.equipmentReports || []).filter((r) => {
      return r.location === loc || (coachName && r.coachName === coachName);
    });
  }, [isCoach, activeCoach, currentUser, availableLocations, data.equipmentReports]);

  // KPI Metrics
  const metrics = useMemo(() => {
    return calculateEquipmentMetrics(scopedEquipmentList, scopedRequestsList, isCoach ? availableLocations[0] || 'All' : selectedLocation);
  }, [scopedEquipmentList, scopedRequestsList, isCoach, availableLocations, selectedLocation]);

  // Handlers for Add Equipment (Super Coach / Admin)
  const handleOpenAdd = (prefill = null) => {
    const defaultLoc = (prefill && prefill.location) || (selectedLocation !== 'All' ? selectedLocation : availableLocations[0]) || 'KK NAGAR';
    setItemForm({
      name: prefill?.equipmentName || '',
      category: prefill?.category || EQUIPMENT_CATEGORIES[0],
      location: defaultLoc,
      totalQty: prefill?.requiredQty || 10,
      availableQty: prefill?.requiredQty || 10,
      damagedQty: 0,
      missingQty: 0,
      condition: 'Good',
      purchaseDate: new Date().toISOString().split('T')[0],
      remarks: prefill ? `Added to fulfill coach request ${prefill.id} (${prefill.remarks})` : '',
      imageUrl: prefill?.photoUrl || '',
      linkedRequestId: prefill?.id || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!itemForm.name.trim()) {
      addToast('Please provide an equipment name.', 'error');
      return;
    }
    if (!itemForm.location) {
      addToast('Please select a valid academy location.', 'error');
      return;
    }

    addEquipmentItem({
      ...itemForm,
      lastUpdatedBy: currentUser?.name || (isSuperCoach ? 'Anita R. (Super Coach)' : 'Administrator')
    });
    setIsAddModalOpen(false);
  };

  // Handlers for Edit / Calibrate Equipment
  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setItemForm({
      name: item.name,
      category: item.category,
      location: item.location,
      totalQty: item.totalQty,
      availableQty: item.availableQty,
      damagedQty: item.damagedQty || 0,
      missingQty: item.missingQty || 0,
      condition: item.condition,
      purchaseDate: item.purchaseDate || '',
      remarks: item.remarks || '',
      imageUrl: item.imageUrl || '',
      linkedRequestId: ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    updateEquipmentItem(
      selectedItem.id,
      {
        ...itemForm,
        lastUpdatedBy: currentUser?.name || (isSuperCoach ? 'Anita R. (Super Coach)' : 'Administrator'),
        action: 'Stock Calibration'
      },
      `Inventory re-calibrated by ${currentUser?.name || (isSuperCoach ? 'Super Coach' : 'Admin')}`
    );
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = (item) => {
    if (window.confirm(`Are you sure you want to remove "${item.name}" from ${item.location} inventory?`)) {
      deleteEquipmentItem(item.id);
    }
  };

  // Coach Equipment Check Confirmation
  const handleConfirmCheck = () => {
    const loc = availableLocations[0] || 'KK NAGAR';
    const cName = activeCoach?.name || currentUser?.name || 'Coach';
    confirmEquipmentCheck(loc, cName);
  };

  // Handlers for Coach Equipment Requirement / Damage Report
  const handleOpenRequestModal = (targetItem = null) => {
    const loc = availableLocations[0] || 'KK NAGAR';
    const cName = activeCoach?.name || currentUser?.name || 'Arun Prakash';

    if (targetItem) {
      setRequestForm({
        equipmentMode: 'existing',
        equipmentId: targetItem.id,
        equipmentName: targetItem.name,
        category: targetItem.category,
        location: targetItem.location,
        requestType: 'Damaged Equipment',
        requiredQty: 1,
        damagedCount: 1,
        missingCount: 0,
        reportedCondition: 'Damaged',
        remarks: '',
        photoNote: '',
        photoUrl: ''
      });
    } else {
      setRequestForm({
        equipmentMode: 'new',
        equipmentId: '',
        equipmentName: '',
        category: EQUIPMENT_CATEGORIES[0],
        location: loc,
        requestType: 'New Equipment Required',
        requiredQty: 2,
        damagedCount: 0,
        missingCount: 0,
        reportedCondition: 'Good',
        remarks: '',
        photoNote: '',
        photoUrl: ''
      });
    }
    setIsRequestModalOpen(true);
  };

  const handleSaveRequest = (e) => {
    e.preventDefault();
    const loc = availableLocations[0] || requestForm.location || 'KK NAGAR';
    const cName = activeCoach?.name || currentUser?.name || 'Coach';
    const cId = activeCoach?.id || 'COACH-1';

    let eqName = requestForm.equipmentName.trim();
    let eqCat = requestForm.category;

    if (requestForm.equipmentMode === 'existing' && requestForm.equipmentId) {
      const match = scopedEquipmentList.find((i) => i.id === requestForm.equipmentId);
      if (match) {
        eqName = match.name;
        eqCat = match.category;
      }
    }

    if (!eqName) {
      addToast('Please specify the equipment name.', 'error');
      return;
    }

    const payload = {
      coachName: cName,
      coachId: cId,
      location: loc,
      equipmentName: eqName,
      equipmentId: requestForm.equipmentMode === 'existing' ? requestForm.equipmentId : '',
      category: eqCat,
      requestType: requestForm.requestType,
      requiredQty: Number(requestForm.requiredQty) || 1,
      damagedCount: Number(requestForm.damagedCount) || 0,
      missingCount: Number(requestForm.missingCount) || 0,
      reportedCondition: requestForm.reportedCondition,
      remarks: requestForm.remarks,
      photoNote: requestForm.photoNote,
      photoUrl: requestForm.photoUrl,
      submissionDate: new Date().toISOString().split('T')[0]
    };

    if (submitEquipmentRequest) {
      submitEquipmentRequest(payload);
    } else {
      submitEquipmentReport(payload);
    }

    setIsRequestModalOpen(false);
  };

  // Handlers for Super Coach / Admin Review of Coach Requests
  const handleOpenReview = (request, defaultStatus = 'Approved') => {
    setSelectedRequest(request);
    setReviewForm({
      status: defaultStatus,
      notes: defaultStatus === 'Approved' ? 'Approved for center allocation.' : defaultStatus === 'Rejected' ? 'Request cannot be fulfilled at this time.' : 'Reviewed and forwarded for batch planning.',
      action: defaultStatus
    });
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (reviewEquipmentRequest) {
      reviewEquipmentRequest(selectedRequest.id, {
        reviewer: currentUser?.name || (isSuperCoach ? 'Anita R. (Super Coach)' : 'Administrator'),
        status: reviewForm.status,
        action: reviewForm.status,
        notes: reviewForm.notes
      });
    } else if (verifyEquipmentReport) {
      verifyEquipmentReport(selectedRequest.id, {
        reviewer: currentUser?.name || 'Super Coach',
        status: reviewForm.status,
        notes: reviewForm.notes
      });
    }

    setIsReviewModalOpen(false);
  };

  const handleMarkFulfilled = (request) => {
    if (fulfillEquipmentRequest) {
      fulfillEquipmentRequest(request.id, {
        fulfilledBy: currentUser?.name || (isSuperCoach ? 'Anita R. (Super Coach)' : 'Administrator'),
        notes: 'Equipment received on site and cataloged in inventory.'
      });
    } else {
      addToast(`Request ${request.id} marked as Fulfilled.`, 'success');
    }
  };

  const handleExportCSV = () => {
    const csvContent = exportEquipmentToCsv(scopedEquipmentList);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Little_Spartans_Equipment_${isCoach ? availableLocations[0] : selectedLocation}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Equipment inventory exported to CSV.', 'success');
  };

  return (
    <div className="space-y-5 animate-slide-up pb-10">
      
      {/* ============================================================ */}
      {/* 1. TOP HEADER & WORKFLOW CONTEXT                             */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#172B5014] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-13 h-13 rounded-2xl bg-[#FFF5ED] border border-[#F4510B30] flex items-center justify-center shrink-0 shadow-sm text-[#F4510B]">
            <Package className="w-6.5 h-6.5 text-[#F4510B]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">
                {isCoach ? 'Equipment Check' : 'Equipment Management'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-[#FFF5ED] text-[#F4510B] border border-[#F4510B30]">
                {isCoach ? 'Coach Session Inspection' : isSuperCoach ? 'Super Coach Operations' : 'Central Inventory Oversight'}
              </span>
            </div>
            <p className="text-xs text-[#172B50] opacity-70 mt-0.5">
              {isCoach
                ? `Location-scoped sports gear check-in, condition verification, and requirements reporting for ${availableLocations[0] || 'assigned center'}`
                : isSuperCoach
                ? 'Review coach requirements, maintain location-wise inventory, and calibrate sports gear across authorized centers'
                : 'Consolidated academy-wide sports equipment, multi-location stock control, and procurement sanctions'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          {/* Coach-only: Confirm Equipment Received */}
          {isCoach && (
            <button
              type="button"
              onClick={handleConfirmCheck}
              className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              title="Confirm that today's training equipment was physically verified on site"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Confirm Equipment Check</span>
            </button>
          )}

          {/* Coach-only: Submit Requirement / Damage */}
          {isCoach && (
            <button
              type="button"
              onClick={() => handleOpenRequestModal()}
              className="px-4 py-2 rounded-xl text-xs font-black bg-[#F4510B] hover:bg-[#E04505] text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Request / Report Damage</span>
            </button>
          )}

          {/* Super Coach / Admin: Add Equipment */}
          {(isSuperCoach || isAdmin) && (
            <button
              type="button"
              onClick={() => handleOpenAdd()}
              className="px-4 py-2 rounded-xl text-xs font-black bg-[#F4510B] hover:bg-[#E04505] text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Equipment</span>
            </button>
          )}

          {/* Export CSV for Super Coach & Admin */}
          {(isSuperCoach || isAdmin) && (
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#172B50] hover:bg-white border border-[#172B501A] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-[#F4510B]" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* LOCATION SCOPING & COACH ASSIGNMENT BANNER (FOR COACH)        */}
      {/* ============================================================ */}
      {isCoach && (
        <div className="bg-[#FFF9F5] rounded-2xl p-4 border border-[#F4510B22] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#F4510B30] flex items-center justify-center shrink-0 text-[#F4510B]">
              <MapPin className="w-5 h-5 text-[#F4510B]" />
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-[#F4510B] uppercase tracking-wider block">
                Assigned Academy Location Scope
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-[#172B50]">
                  {availableLocations[0] || 'KK NAGAR'}
                </span>
                <span className="text-xs font-bold text-[#172B50]/60">
                  (Showing only {availableLocations[0] || 'KK NAGAR'} equipment)
                </span>
              </div>
            </div>
          </div>

          {/* Coach Simulator Switcher (for immediate testing across KK Nagar, Kilpauk, Anna Nagar, etc.) */}
          {(data.coaches || []).length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#172B50]/70 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#F4510B]" />
                <span>Simulate Coach:</span>
              </span>
              <select
                value={activeCoachId}
                onChange={(e) => setActiveCoachId(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold bg-white text-[#172B50] border border-[#172B5025] rounded-xl outline-none focus:ring-2 focus:ring-[#F4510B] cursor-pointer"
              >
                {(data.coaches || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.center || 'KK NAGAR'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. OPERATIONAL KPI SUMMARY CARDS                             */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Equipment Units */}
        <FloatingCard className="bg-white rounded-2xl p-4 border border-[#172B5014] shadow-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#172B50] opacity-75 block">
              {isCoach ? 'Location Total Units' : 'Total Inventory Units'}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-[#172B50] mt-0.5">
              <AnimatedCounter value={metrics.totalItems} />
            </p>
            <span className="text-[11px] font-semibold text-[#172B50] opacity-60">
              {metrics.totalTypes} distinct sports gear types
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-[#F4510B]" />
          </div>
        </FloatingCard>

        {/* Available in Service */}
        <FloatingCard className="bg-white rounded-2xl p-4 border border-[#172B5014] shadow-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 opacity-80 block">
              In Service & Ready
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-0.5">
              <AnimatedCounter value={metrics.availableItems} />
            </p>
            <span className="text-[11px] font-semibold text-emerald-700">
              {metrics.healthRate}% Operational Health
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </FloatingCard>

        {/* Damaged & Missing */}
        <FloatingCard className="bg-white rounded-2xl p-4 border border-[#172B5014] shadow-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 opacity-80 block">
              Damaged / Missing
            </span>
            <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-0.5">
              <AnimatedCounter value={metrics.damagedItems + metrics.missingItems} />
            </p>
            <span className="text-[11px] font-semibold text-rose-700">
              {metrics.damagedItems} damaged · {metrics.missingItems} missing
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
        </FloatingCard>

        {/* Pending Requests Queue */}
        <FloatingCard className="bg-white rounded-2xl p-4 border border-[#172B5014] shadow-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 opacity-80 block">
              {isCoach ? 'My Pending Requests' : 'Coach Requests Queue'}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-0.5">
              <AnimatedCounter value={metrics.pendingReports} />
            </p>
            <span className="text-[11px] font-semibold text-amber-700">
              {metrics.pendingReports > 0 ? 'Requires Super Coach review' : 'All requests processed'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
        </FloatingCard>
      </div>

      {/* ============================================================ */}
      {/* 3. TABS SWITCHER & FILTERS                                   */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl p-4 border border-[#172B5014] shadow-card space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#172B5010] pb-3">
          {/* Sub-tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleTabChange('inventory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'inventory'
                  ? 'bg-[#172B50] text-white shadow-sm'
                  : 'bg-[#FFF4E8] text-[#172B50] hover:bg-white border border-[#172B5015]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{isCoach ? 'Location Equipment List' : 'Location Inventory'}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'inventory' ? 'bg-[#F4510B] text-white' : 'bg-[#172B5020]'}`}>
                {filteredEquipment.length}
              </span>
            </button>

            {/* Coach Requests Queue tab for Super Coach & Admin */}
            {!isCoach && (
              <button
                type="button"
                onClick={() => handleTabChange('requests')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'requests'
                    ? 'bg-[#172B50] text-white shadow-sm'
                    : 'bg-[#FFF4E8] text-[#172B50] hover:bg-white border border-[#172B5015]'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Coach Requests Queue</span>
                {metrics.pendingReports > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white animate-pulse font-black">
                    {metrics.pendingReports}
                  </span>
                )}
              </button>
            )}

            {/* Coach view: My Submitted Requests */}
            {isCoach && (
              <button
                type="button"
                onClick={() => handleTabChange('my_requests')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'my_requests'
                    ? 'bg-[#172B50] text-white shadow-sm'
                    : 'bg-[#FFF4E8] text-[#172B50] hover:bg-white border border-[#172B5015]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>My Submitted Requests & Status</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'my_requests' ? 'bg-[#F4510B] text-white' : 'bg-[#172B5020]'}`}>
                  {mySubmittedRequests.length}
                </span>
              </button>
            )}

            {/* Audit History tab for Super Coach & Admin */}
            {!isCoach && (
              <button
                type="button"
                onClick={() => handleTabChange('audit')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'audit'
                    ? 'bg-[#172B50] text-white shadow-sm'
                    : 'bg-[#FFF4E8] text-[#172B50] hover:bg-white border border-[#172B5015]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Audit History & Logs</span>
              </button>
            )}
          </div>

          {/* Quick Location Scope Badge */}
          <div className="text-xs font-bold text-[#172B50]/75 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
            <span>
              {isCoach ? (
                <>Center: <strong className="text-[#172B50]">{availableLocations[0]}</strong></>
              ) : (
                <>Authorized Locations: <strong className="text-[#172B50]">{availableLocations.join(', ')}</strong></>
              )}
            </span>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Location Filter (Super Coach / Admin only) */}
          {!isCoach && (
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-[#F4510B] absolute left-3 top-3 pointer-events-none" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B] cursor-pointer"
              >
                <option value="All">All Locations ({availableLocations.length})</option>
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc} ({scopedEquipmentList.filter((i) => i.location === loc).length} items)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category Filter */}
          <div className="relative">
            <Layers className="w-3.5 h-3.5 text-[#172B50]/60 absolute left-3 top-3 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B] cursor-pointer"
            >
              <option value="All">All Categories ({EQUIPMENT_CATEGORIES.length})</option>
              {EQUIPMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter (Inventory tab) or Status Filter (Requests tab) */}
          {activeTab === 'inventory' ? (
            <div className="relative">
              <Filter className="w-3.5 h-3.5 text-[#172B50]/60 absolute left-3 top-3 pointer-events-none" />
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B] cursor-pointer"
              >
                <option value="All">All Conditions</option>
                {Object.values(EQUIPMENT_CONDITIONS).map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="relative">
              <Filter className="w-3.5 h-3.5 text-[#172B50]/60 absolute left-3 top-3 pointer-events-none" />
              <select
                value={selectedRequestStatus}
                onChange={(e) => setSelectedRequestStatus(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B] cursor-pointer"
              >
                <option value="All">All Request Statuses</option>
                {Object.values(REPORT_STATUSES).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#172B50]/60 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search gear name, ID, coach..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-xs font-semibold bg-[#FFF4E8] text-[#172B50] placeholder:text-[#172B50]/40 border border-[#172B5020] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-[#172B50]/50 hover:text-[#172B50]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MAIN CONTENT VIEW: TAB 1 - INVENTORY TABLE                */}
      {/* ============================================================ */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-[#172B5014] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#FFF4E8]/60 border-b border-[#172B5014] text-[11px] font-black uppercase tracking-wider text-[#172B50]/80">
                  <th className="py-3 px-4">Equipment Details</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-2 text-center">Total</th>
                  <th className="py-3 px-2 text-center text-emerald-800">Available</th>
                  <th className="py-3 px-2 text-center text-rose-800">Damaged</th>
                  <th className="py-3 px-2 text-center text-purple-800">Missing</th>
                  <th className="py-3 px-3">Condition</th>
                  <th className="py-3 px-3">Last Checked</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B500C] text-xs">
                {filteredEquipment.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center">
                      <div className="max-w-sm mx-auto space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center mx-auto">
                          <Package className="w-6 h-6 text-[#F4510B]" />
                        </div>
                        <h4 className="text-sm font-black text-[#172B50]">No equipment records found</h4>
                        <p className="text-xs text-[#172B50]/60">
                          {isCoach
                            ? `No equipment registered for ${availableLocations[0]}. Submit an equipment request to notify the Super Coach.`
                            : 'No matching equipment found for the selected filter.'}
                        </p>
                        {isCoach ? (
                          <button
                            type="button"
                            onClick={() => handleOpenRequestModal()}
                            className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#F4510B] text-white cursor-pointer"
                          >
                            + Submit Equipment Requirement
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenAdd()}
                            className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#F4510B] text-white cursor-pointer"
                          >
                            + Add Equipment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEquipment.map((item) => {
                    const condStyle = CONDITION_COLORS[item.condition] || CONDITION_COLORS['Good'];
                    return (
                      <tr key={item.id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                        {/* Equipment Name & ID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#FFF5ED] text-[#F4510B] border border-[#F4510B25] flex items-center justify-center shrink-0">
                              <Package className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <span className="font-black text-[#172B50] block text-xs">
                                {item.name}
                              </span>
                              <span className="text-[10px] font-mono text-[#F4510B] font-bold">
                                {item.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#172B50] bg-[#FFF4E8] px-2 py-0.5 rounded-md border border-[#172B5014]">
                            <MapPin className="w-3 h-3 text-[#F4510B]" />
                            {item.location}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3 font-semibold text-[#172B50]/80 text-[11.5px]">
                          {item.category}
                        </td>

                        {/* Total Qty */}
                        <td className="py-3.5 px-2 text-center font-black text-[#172B50]">
                          {item.totalQty}
                        </td>

                        {/* Available Qty */}
                        <td className="py-3.5 px-2 text-center font-black text-emerald-600 bg-emerald-50/40">
                          {item.availableQty}
                        </td>

                        {/* Damaged Qty */}
                        <td className="py-3.5 px-2 text-center font-bold text-rose-600">
                          {item.damagedQty || 0}
                        </td>

                        {/* Missing Qty */}
                        <td className="py-3.5 px-2 text-center font-bold text-purple-600">
                          {item.missingQty || 0}
                        </td>

                        {/* Condition Badge */}
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${condStyle.bg} ${condStyle.text} ${condStyle.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${condStyle.dot}`} />
                            {item.condition}
                          </span>
                        </td>

                        {/* Last Checked */}
                        <td className="py-3.5 px-3 text-[10.5px]">
                          <span className="font-bold text-[#172B50] block">
                            {item.lastInspectionDate || 'Today'}
                          </span>
                          <span className="text-[9.5px] text-[#172B50]/60 block truncate max-w-[110px]" title={item.lastUpdatedBy}>
                            by {item.lastUpdatedBy || 'Staff'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Coach-only: Quick Report Damage / Missing */}
                            {isCoach && (
                              <button
                                type="button"
                                onClick={() => handleOpenRequestModal(item)}
                                className="px-2.5 py-1 rounded-lg text-[10.5px] font-black bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 cursor-pointer flex items-center gap-1"
                                title="Report Damaged or Missing units for this equipment"
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>Report</span>
                              </button>
                            )}

                            {/* View Details Modal */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsDetailsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-[#172B50]/70 hover:text-[#172B50] hover:bg-[#FFF4E8] cursor-pointer"
                              title="View Equipment Specifications & Audit History"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Super Coach / Admin: Calibrate / Edit */}
                            {(isSuperCoach || isAdmin) && (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer"
                                title="Calibrate Inventory Quantities & Condition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Super Coach / Admin: Delete */}
                            {(isSuperCoach || isAdmin) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                                title="Delete Equipment Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MAIN CONTENT VIEW: TAB 2 - COACH REQUESTS QUEUE           */}
      {/* ============================================================ */}
      {!isCoach && activeTab === 'requests' && (
        <div className="bg-white rounded-3xl border border-[#172B5014] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-[#FFF4E8]/60 border-b border-[#172B5014] text-[11px] font-black uppercase tracking-wider text-[#172B50]/80">
                  <th className="py-3 px-4">Coach Name</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Equipment Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Request Type</th>
                  <th className="py-3 px-2 text-center">Req Qty</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 px-3">Submitted</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B500C] text-xs">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center">
                      <div className="max-w-sm mx-auto space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h4 className="text-sm font-black text-[#172B50]">No equipment requests pending</h4>
                        <p className="text-xs text-[#172B50]/60">
                          All coach equipment requirements, damaged items, and replacement requests have been processed.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => {
                    const stColor = STATUS_COLORS[req.status] || STATUS_COLORS['Pending Review'];
                    return (
                      <tr key={req.id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                        {/* Coach Name */}
                        <td className="py-3.5 px-4 font-black text-[#172B50]">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center font-black text-xs shrink-0">
                              {(req.coachName || req.submittedBy || 'C').charAt(0)}
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-[#172B50]">
                                {req.coachName || req.submittedBy}
                              </span>
                              <span className="text-[10px] font-mono text-[#F4510B] font-semibold">
                                {req.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#172B50] bg-[#FFF4E8] px-2 py-0.5 rounded-md border border-[#172B5014]">
                            <MapPin className="w-3 h-3 text-[#F4510B]" />
                            {req.location}
                          </span>
                        </td>

                        {/* Equipment Name */}
                        <td className="py-3.5 px-3 font-bold text-[#172B50]">
                          <span>{req.equipmentName}</span>
                          {req.equipmentId && (
                            <span className="block text-[10px] font-mono text-[#172B50]/50">
                              Ref: {req.equipmentId}
                            </span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3 text-[11.5px] text-[#172B50]/80">
                          {req.category}
                        </td>

                        {/* Request Type */}
                        <td className="py-3.5 px-3">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#172B500C] text-[#172B50]">
                            {req.requestType || 'Requirement'}
                          </span>
                        </td>

                        {/* Required Qty */}
                        <td className="py-3.5 px-2 text-center font-black text-[#172B50]">
                          {req.requiredQty || req.damagedCount || 1}
                        </td>

                        {/* Remarks */}
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <p className="text-[11.5px] text-[#172B50]/80 truncate" title={req.remarks}>
                            {req.remarks || 'No notes provided'}
                          </p>
                          {req.photoNote && (
                            <span className="text-[10px] text-blue-600 font-semibold block truncate" title={req.photoNote}>
                              📷 {req.photoNote}
                            </span>
                          )}
                        </td>

                        {/* Submitted Date */}
                        <td className="py-3.5 px-3 text-[11px] text-[#172B50]/70 whitespace-nowrap">
                          {req.submissionDate || req.createdAt?.split('T')[0] || 'Today'}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${stColor.bg} ${stColor.text} ${stColor.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${stColor.badge}`} />
                            {req.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Request details */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRequest(req);
                                setIsRequestDetailsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-[#172B50]/70 hover:text-[#172B50] hover:bg-[#FFF4E8] cursor-pointer"
                              title="View Request Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Review action */}
                            {req.status === 'Pending Review' && (
                              <button
                                type="button"
                                onClick={() => handleOpenReview(req, 'Approved')}
                                className="px-2.5 py-1 rounded-lg text-[10.5px] font-black bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                                title="Review and Approve / Reject"
                              >
                                Review
                              </button>
                            )}

                            {/* Add to Inventory shortcut (if new equipment requested) */}
                            {req.status === 'Approved' && !req.equipmentId && (
                              <button
                                type="button"
                                onClick={() => handleOpenAdd(req)}
                                className="px-2.5 py-1 rounded-lg text-[10.5px] font-black bg-[#F4510B] text-white hover:brightness-110 cursor-pointer shadow-2xs"
                                title="Add equipment record to inventory for this location"
                              >
                                + Add Stock
                              </button>
                            )}

                            {/* Mark as Fulfilled shortcut */}
                            {(req.status === 'Approved' || req.status === 'Reviewed') && (
                              <button
                                type="button"
                                onClick={() => handleMarkFulfilled(req)}
                                className="px-2.5 py-1 rounded-lg text-[10.5px] font-black bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-2xs"
                                title="Mark equipment requirement as Fulfilled"
                              >
                                Fulfill
                              </button>
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
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MAIN CONTENT VIEW: TAB 2 (COACH) - MY SUBMITTED REQUESTS  */}
      {/* ============================================================ */}
      {isCoach && activeTab === 'my_requests' && (
        <div className="bg-white rounded-3xl border border-[#172B5014] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#FFF4E8]/60 border-b border-[#172B5014] text-[11px] font-black uppercase tracking-wider text-[#172B50]/80">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-3">Equipment Name</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Request Type</th>
                  <th className="py-3 px-2 text-center">Qty</th>
                  <th className="py-3 px-4">Description / Remarks</th>
                  <th className="py-3 px-3">Submitted Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B500C] text-xs">
                {mySubmittedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="max-w-sm mx-auto space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center mx-auto">
                          <FileText className="w-6 h-6 text-[#F4510B]" />
                        </div>
                        <h4 className="text-sm font-black text-[#172B50]">No submitted requests yet</h4>
                        <p className="text-xs text-[#172B50]/60">
                          Submit new equipment requirements, damaged gear alerts, or missing stock reports using the button below.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenRequestModal()}
                          className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#F4510B] text-white cursor-pointer"
                        >
                          + Submit Equipment Requirement
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  mySubmittedRequests.map((req) => {
                    const stColor = STATUS_COLORS[req.status] || STATUS_COLORS['Pending Review'];
                    return (
                      <tr key={req.id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#F4510B]">
                          {req.id}
                        </td>
                        <td className="py-3.5 px-3 font-black text-[#172B50]">
                          {req.equipmentName}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-[#172B50]">
                          {req.location}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#172B500C] text-[#172B50]">
                            {req.requestType}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-center font-black text-[#172B50]">
                          {req.requiredQty || req.damagedCount || 1}
                        </td>
                        <td className="py-3.5 px-4 max-w-[220px]">
                          <p className="text-[11.5px] text-[#172B50]/80 truncate" title={req.remarks}>
                            {req.remarks}
                          </p>
                        </td>
                        <td className="py-3.5 px-3 text-[11px] text-[#172B50]/70">
                          {req.submissionDate || 'Today'}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${stColor.bg} ${stColor.text} ${stColor.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${stColor.badge}`} />
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRequest(req);
                              setIsRequestDetailsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-[#172B50]/70 hover:text-[#172B50] hover:bg-[#FFF4E8] cursor-pointer"
                            title="View Status & Review Notes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MAIN CONTENT VIEW: TAB 3 (SUPER COACH/ADMIN) - AUDIT LOGS */}
      {/* ============================================================ */}
      {!isCoach && activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-5 border border-[#172B5014] shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#172B5010]">
            <div>
              <h3 className="text-base font-black text-[#172B50]">
                Equipment Inventory Audit Trail
              </h3>
              <p className="text-xs text-[#172B50]/60 mt-0.5">
                Every physical check-in, quantity calibration, condition report, and review recorded across centers
              </p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {scopedEquipmentList.flatMap((item) => (item.history || []).map((h) => ({ ...h, itemName: item.name, itemLoc: item.location, itemId: item.id })))
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((log, idx) => (
                <div key={log.id || idx} className="p-3 rounded-2xl bg-[#FFF9F5] border border-[#172B5010] flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#F4510B25] flex items-center justify-center shrink-0 text-[#F4510B] mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-[#172B50]">{log.action}</span>
                        <span className="px-2 py-0.2 rounded-md bg-[#FFF4E8] text-[10px] font-bold text-[#F4510B] border border-[#172B5014]">
                          {log.itemLoc} · {log.itemName}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[#172B50]/80 mt-1">{log.details}</p>
                      <span className="text-[10px] font-bold text-[#172B50]/60 block mt-1">
                        Logged by <strong className="text-[#172B50]">{log.user}</strong> ({log.role || 'Staff'})
                      </span>
                    </div>
                  </div>
                  <span className="text-[10.5px] font-semibold text-[#172B50]/50 shrink-0 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: ADD EQUIPMENT RECORD (Super Coach & Admin)           */}
      {/* ============================================================ */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Equipment to Inventory"
        subtitle={isSuperCoach ? "Register new sports gear for your authorized center" : "Register academy-wide equipment for any location"}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Equipment Name *</label>
            <input
              type="text"
              required
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              placeholder="e.g. Size 4 Pro Match Footballs"
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020] focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Category *</label>
              <select
                value={itemForm.category}
                onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020] focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
              >
                {EQUIPMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Academy Location *</label>
              <select
                value={itemForm.location}
                onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020] focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
              >
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-[#172B50]/60 block mt-0.5">
                Belongs strictly to this center's inventory
              </span>
            </div>
          </div>

          {/* Quantities Grid: Total, Available, Damaged, Missing */}
          <div className="grid grid-cols-4 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-[#172B50] block mb-1">Total Qty *</label>
              <input
                type="number"
                min={1}
                required
                value={itemForm.totalQty}
                onChange={(e) => {
                  const total = parseInt(e.target.value, 10) || 0;
                  const avail = Math.max(0, total - (itemForm.damagedQty || 0) - (itemForm.missingQty || 0));
                  setItemForm({ ...itemForm, totalQty: total, availableQty: avail });
                }}
                className="w-full px-2.5 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-emerald-800 block mb-1">Available</label>
              <input
                type="number"
                min={0}
                value={itemForm.availableQty}
                onChange={(e) => setItemForm({ ...itemForm, availableQty: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-2.5 py-2 text-xs font-bold bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-rose-800 block mb-1">Damaged</label>
              <input
                type="number"
                min={0}
                value={itemForm.damagedQty}
                onChange={(e) => {
                  const damaged = parseInt(e.target.value, 10) || 0;
                  const avail = Math.max(0, itemForm.totalQty - damaged - (itemForm.missingQty || 0));
                  setItemForm({ ...itemForm, damagedQty: damaged, availableQty: avail });
                }}
                className="w-full px-2.5 py-2 text-xs font-bold bg-rose-50 text-rose-800 rounded-xl border border-rose-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-purple-800 block mb-1">Missing</label>
              <input
                type="number"
                min={0}
                value={itemForm.missingQty}
                onChange={(e) => {
                  const missing = parseInt(e.target.value, 10) || 0;
                  const avail = Math.max(0, itemForm.totalQty - (itemForm.damagedQty || 0) - missing);
                  setItemForm({ ...itemForm, missingQty: missing, availableQty: avail });
                }}
                className="w-full px-2.5 py-2 text-xs font-bold bg-purple-50 text-purple-800 rounded-xl border border-purple-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Condition</label>
              <select
                value={itemForm.condition}
                onChange={(e) => setItemForm({ ...itemForm, condition: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              >
                {Object.values(EQUIPMENT_CONDITIONS).map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Purchase / Added Date</label>
              <input
                type="date"
                value={itemForm.purchaseDate}
                onChange={(e) => setItemForm({ ...itemForm, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Optional Photo / Image URL</label>
            <input
              type="text"
              placeholder="e.g. https://... or catalog reference"
              value={itemForm.imageUrl}
              onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Remarks & Specifications</label>
            <textarea
              rows={2}
              value={itemForm.remarks}
              onChange={(e) => setItemForm({ ...itemForm, remarks: e.target.value })}
              placeholder="e.g. Stored in court equipment locker #2. Dedicated for junior squads."
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 cursor-pointer"
            >
              Register Equipment
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 2: EDIT / CALIBRATE EQUIPMENT (Super Coach & Admin)    */}
      {/* ============================================================ */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Calibrate Equipment Record"
        subtitle={`Editing ${selectedItem?.id} (${selectedItem?.location})`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Equipment Name</label>
            <input
              type="text"
              required
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-[#172B50] block mb-1">Total Qty</label>
              <input
                type="number"
                min={0}
                value={itemForm.totalQty}
                onChange={(e) => {
                  const total = parseInt(e.target.value, 10) || 0;
                  const avail = Math.max(0, total - (itemForm.damagedQty || 0) - (itemForm.missingQty || 0));
                  setItemForm({ ...itemForm, totalQty: total, availableQty: avail });
                }}
                className="w-full px-2.5 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-emerald-800 block mb-1">Available</label>
              <input
                type="number"
                min={0}
                value={itemForm.availableQty}
                onChange={(e) => setItemForm({ ...itemForm, availableQty: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-2.5 py-2 text-xs font-bold bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-rose-800 block mb-1">Damaged</label>
              <input
                type="number"
                min={0}
                value={itemForm.damagedQty}
                onChange={(e) => {
                  const damaged = parseInt(e.target.value, 10) || 0;
                  const avail = Math.max(0, itemForm.totalQty - damaged - (itemForm.missingQty || 0));
                  setItemForm({ ...itemForm, damagedQty: damaged, availableQty: avail });
                }}
                className="w-full px-2.5 py-2 text-xs font-bold bg-rose-50 text-rose-800 rounded-xl border border-rose-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-purple-800 block mb-1">Missing</label>
              <input
                type="number"
                min={0}
                value={itemForm.missingQty}
                onChange={(e) => {
                  const missing = parseInt(e.target.value, 10) || 0;
                  const avail = Math.max(0, itemForm.totalQty - (itemForm.damagedQty || 0) - missing);
                  setItemForm({ ...itemForm, missingQty: missing, availableQty: avail });
                }}
                className="w-full px-2.5 py-2 text-xs font-bold bg-purple-50 text-purple-800 rounded-xl border border-purple-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Condition</label>
              <select
                value={itemForm.condition}
                onChange={(e) => setItemForm({ ...itemForm, condition: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              >
                {Object.values(EQUIPMENT_CONDITIONS).map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Category</label>
              <select
                value={itemForm.category}
                onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              >
                {EQUIPMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Remarks &amp; Audit Note</label>
            <textarea
              rows={2}
              value={itemForm.remarks}
              onChange={(e) => setItemForm({ ...itemForm, remarks: e.target.value })}
              placeholder="e.g. Stock reconciled after session inspection. Replaced 2 torn straps."
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 cursor-pointer"
            >
              Save Calibration
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 3: VIEW EQUIPMENT DETAILS & COMPLETE AUDIT HISTORY     */}
      {/* ============================================================ */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Equipment Specifications & Audit History"
        subtitle={selectedItem ? `${selectedItem.name} [${selectedItem.id}]` : ''}
        maxWidth="max-w-xl"
      >
        {selectedItem && (
          <div className="space-y-4">
            {/* Quick Metrics Header */}
            <div className="grid grid-cols-4 gap-2.5 p-3 rounded-2xl bg-[#FFF9F5] border border-[#172B5014] text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#172B50]/60 block">Total</span>
                <span className="text-lg font-black text-[#172B50]">{selectedItem.totalQty}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Available</span>
                <span className="text-lg font-black text-emerald-600">{selectedItem.availableQty}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-700 block">Damaged</span>
                <span className="text-lg font-black text-rose-600">{selectedItem.damagedQty || 0}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-700 block">Missing</span>
                <span className="text-lg font-black text-purple-600">{selectedItem.missingQty || 0}</span>
              </div>
            </div>

            {/* Core Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#172B5014] space-y-1">
                <span className="text-[10.5px] font-bold text-[#172B50]/60 uppercase block">Location & Category</span>
                <p className="font-black text-[#172B50]">{selectedItem.location}</p>
                <p className="text-[11px] text-[#172B50]/80">{selectedItem.category}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#172B5014] space-y-1">
                <span className="text-[10.5px] font-bold text-[#172B50]/60 uppercase block">Inspection & Status</span>
                <p className="font-black text-[#172B50]">{selectedItem.condition}</p>
                <p className="text-[11px] text-[#172B50]/80">Last check: {selectedItem.lastInspectionDate || 'N/A'}</p>
              </div>
            </div>

            {selectedItem.remarks && (
              <div className="p-3 rounded-xl bg-[#FFF4E8]/60 border border-[#172B5010] text-xs">
                <span className="text-[10.5px] font-bold text-[#172B50]/60 uppercase block mb-0.5">Remarks / Notes</span>
                <p className="text-[#172B50] font-medium">{selectedItem.remarks}</p>
              </div>
            )}

            {/* Audit History Timeline */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#172B50] mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F4510B]" />
                <span>Audit Trail ({selectedItem.history?.length || 0} events)</span>
              </h4>

              {(!selectedItem.history || selectedItem.history.length === 0) ? (
                <p className="text-xs text-[#172B50]/60 py-3 text-center">No historical audits recorded for this item yet.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedItem.history.map((h, idx) => (
                    <div key={h.id || idx} className="p-2.5 rounded-xl bg-white border border-[#172B5015] shadow-2xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-[#172B50]">{h.action}</span>
                        <span className="text-[10px] text-[#172B50]/60">
                          {new Date(h.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#172B50]/75 mt-0.5">{h.details}</p>
                      <span className="text-[9.5px] font-bold text-[#F4510B] block mt-1">
                        Logged by {h.user} ({h.role || 'Staff'})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold bg-[#172B50] text-white rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 4: COACH SUBMIT EQUIPMENT REQUIREMENT / DAMAGE REPORT  */}
      {/* ============================================================ */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Submit Equipment Requirement / Report"
        subtitle="Report damaged, missing, replacement, or new gear requirements to Super Coach"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveRequest} className="space-y-4">
          {/* Read-Only Location & Coach Banner */}
          <div className="p-3 rounded-2xl bg-[#FFF9F5] border border-[#F4510B25] flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#F4510B] uppercase block">Assigned Academy Location</span>
              <span className="font-black text-[#172B50] text-sm">{availableLocations[0] || 'KK NAGAR'}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-[#172B50]/60 uppercase block">Coach Name</span>
              <span className="font-bold text-[#172B50]">{activeCoach?.name || currentUser?.name || 'Coach'}</span>
            </div>
          </div>

          {/* Request Type Selector */}
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Request Type *</label>
            <select
              value={requestForm.requestType}
              onChange={(e) => {
                const reqType = e.target.value;
                setRequestForm({
                  ...requestForm,
                  requestType: reqType,
                  equipmentMode: (reqType === 'New Equipment Required' || reqType === 'Additional Quantity Required') ? 'new' : 'existing'
                });
              }}
              className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020] focus:ring-2 focus:ring-[#F4510B]"
            >
              {EQUIPMENT_REQUEST_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Mode toggle: Existing vs New equipment */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => setRequestForm({ ...requestForm, equipmentMode: 'existing' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                requestForm.equipmentMode === 'existing'
                  ? 'bg-[#172B50] text-white'
                  : 'bg-[#FFF4E8] text-[#172B50] border border-[#172B5015]'
              }`}
            >
              Select Existing Item
            </button>
            <button
              type="button"
              onClick={() => setRequestForm({ ...requestForm, equipmentMode: 'new', equipmentId: '' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                requestForm.equipmentMode === 'new'
                  ? 'bg-[#172B50] text-white'
                  : 'bg-[#FFF4E8] text-[#172B50] border border-[#172B5015]'
              }`}
            >
              New Item Name
            </button>
          </div>

          {requestForm.equipmentMode === 'existing' ? (
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Select Registered Equipment *</label>
              <select
                value={requestForm.equipmentId}
                onChange={(e) => {
                  const sel = scopedEquipmentList.find((i) => i.id === e.target.value);
                  setRequestForm({
                    ...requestForm,
                    equipmentId: e.target.value,
                    equipmentName: sel ? sel.name : '',
                    category: sel ? sel.category : requestForm.category
                  });
                }}
                className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              >
                <option value="">-- Choose item from {availableLocations[0]} inventory --</option>
                {scopedEquipmentList.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} (Total: {i.totalQty}, Avail: {i.availableQty}) - [{i.id}]
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Junior Gymnastics Beam"
                  value={requestForm.equipmentName}
                  onChange={(e) => setRequestForm({ ...requestForm, equipmentName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Equipment Category *</label>
                <select
                  value={requestForm.category}
                  onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
                >
                  {EQUIPMENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Quantities */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Required Quantity *</label>
              <input
                type="number"
                min={1}
                required
                value={requestForm.requiredQty}
                onChange={(e) => setRequestForm({ ...requestForm, requiredQty: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              />
            </div>

            {(requestForm.requestType.includes('Damaged') || requestForm.requestType.includes('Missing') || requestForm.requestType.includes('Replacement')) && (
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Damaged/Missing Units</label>
                <input
                  type="number"
                  min={0}
                  value={requestForm.damagedCount}
                  onChange={(e) => setRequestForm({ ...requestForm, damagedCount: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
                />
              </div>
            )}
          </div>

          {/* Description & Remarks */}
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Description / Remarks *</label>
            <textarea
              required
              rows={3}
              value={requestForm.remarks}
              onChange={(e) => setRequestForm({ ...requestForm, remarks: e.target.value })}
              placeholder="Describe condition, cause of wear, or why additional stock is required for upcoming batches..."
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          {/* Optional Photo / Reference */}
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Optional Photo Upload / Evidence Note</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. IMG_20261123_torn_seam.jpg or photo link"
                value={requestForm.photoNote}
                onChange={(e) => setRequestForm({ ...requestForm, photoNote: e.target.value, photoUrl: e.target.value })}
                className="flex-1 px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              />
            </div>
            <span className="text-[10px] text-[#172B50]/60 block mt-0.5">
              Reference file name or note for Super Coach physical verification
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 cursor-pointer"
            >
              Submit Request to Super Coach
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 5: SUPER COACH / ADMIN REVIEW & APPROVAL                */}
      {/* ============================================================ */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Review Coach Equipment Request"
        subtitle={selectedRequest ? `${selectedRequest.id} · Submitted by Coach ${selectedRequest.coachName || selectedRequest.submittedBy}` : ''}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveReview} className="space-y-4">
          {selectedRequest && (
            <div className="p-3 rounded-2xl bg-[#FFF9F5] border border-[#172B5014] text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#172B50] text-sm">{selectedRequest.equipmentName}</span>
                <span className="font-bold text-[#F4510B]">{selectedRequest.location}</span>
              </div>
              <p className="text-[11px] text-[#172B50]/75">
                Type: <strong>{selectedRequest.requestType}</strong> · Required Qty: <strong>{selectedRequest.requiredQty || selectedRequest.damagedCount}</strong>
              </p>
              <p className="text-[11.5px] italic text-[#172B50]/90 font-serif pt-1">
                "{selectedRequest.remarks}"
              </p>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Decision / Status *</label>
            <select
              value={reviewForm.status}
              onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
              className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            >
              <option value="Approved">Approved</option>
              <option value="Reviewed">Reviewed (Pending Procurement)</option>
              <option value="Rejected">Rejected</option>
              <option value="Fulfilled">Fulfilled</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Review Notes &amp; Action Plan *</label>
            <textarea
              required
              rows={3}
              value={reviewForm.notes}
              onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
              placeholder="e.g. Verified requirements on site. Stock allocated from central warehouse."
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black bg-[#172B50] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 cursor-pointer"
            >
              Submit Review
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 6: VIEW REQUEST DETAILS & STATUS TIMELINE               */}
      {/* ============================================================ */}
      <Modal
        isOpen={isRequestDetailsModalOpen}
        onClose={() => setIsRequestDetailsModalOpen(false)}
        title="Equipment Request Details"
        subtitle={selectedRequest ? `${selectedRequest.id} · ${selectedRequest.location}` : ''}
        maxWidth="max-w-md"
      >
        {selectedRequest && (
          <div className="space-y-4 text-xs">
            {/* Header pill */}
            <div className="p-3 rounded-2xl bg-[#FFF9F5] border border-[#172B5014] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#172B50] text-sm">{selectedRequest.equipmentName}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[selectedRequest.status]?.bg || 'bg-amber-50'} ${STATUS_COLORS[selectedRequest.status]?.text || 'text-amber-700'}`}>
                  {selectedRequest.status}
                </span>
              </div>
              <p className="text-[11px] text-[#172B50]/75">
                Submitted by Coach <strong>{selectedRequest.coachName || selectedRequest.submittedBy}</strong> on {selectedRequest.submissionDate || 'Today'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-xl bg-white border border-[#172B5014]">
                <span className="text-[10px] uppercase font-bold text-[#172B50]/60 block">Request Type</span>
                <span className="font-bold text-[#172B50]">{selectedRequest.requestType}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#172B5014]">
                <span className="text-[10px] uppercase font-bold text-[#172B50]/60 block">Required Units</span>
                <span className="font-black text-[#172B50]">{selectedRequest.requiredQty || selectedRequest.damagedCount || 1} units</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#172B5014]">
              <span className="text-[10.5px] uppercase font-bold text-[#172B50]/60 block mb-0.5">Coach Description & Remarks</span>
              <p className="text-[#172B50] font-medium">{selectedRequest.remarks}</p>
              {selectedRequest.photoNote && (
                <p className="text-blue-600 font-bold mt-1">📷 {selectedRequest.photoNote}</p>
              )}
            </div>

            {/* Super Coach Review details if available */}
            {selectedRequest.superCoachReview && (
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-black text-blue-900">Super Coach Review</span>
                  <span className="text-[10px] text-blue-700">
                    {new Date(selectedRequest.superCoachReview.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[11.5px] text-blue-950 font-medium mt-1">
                  {selectedRequest.superCoachReview.notes}
                </p>
                <span className="text-[10px] font-bold text-blue-800 block mt-1">
                  Reviewed by {selectedRequest.superCoachReview.reviewer} ({selectedRequest.superCoachReview.action})
                </span>
              </div>
            )}

            {/* Timeline Events */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#172B50] mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F4510B]" />
                <span>Request Workflow History</span>
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {(selectedRequest.history || []).map((h, idx) => (
                  <div key={h.id || idx} className="p-2 rounded-xl bg-white border border-[#172B5010] text-[11px]">
                    <div className="flex items-center justify-between">
                      <strong className="text-[#172B50]">{h.action}</strong>
                      <span className="text-[10px] text-[#172B50]/50">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[#172B50]/75 text-[10.5px]">{h.details}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsRequestDetailsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold bg-[#172B50] text-white rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
