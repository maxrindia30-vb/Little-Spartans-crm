import React, { useState, useMemo } from 'react';
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
  Sparkles
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  CONDITION_COLORS,
  REPORT_STATUSES,
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
    verifyEquipmentReport,
    adminApproveEquipmentReport,
    currentUser,
    addToast,
    activeSubTab,
    setActiveSubTab
  } = useCrm();

  // Active view tab: 'inventory' | 'reports' | 'audit'
  const [activeTab, setActiveTab] = useState(() => {
    return activeSubTab === 'reports' ? 'reports' : 'inventory';
  });

  // Sync activeTab when activeSubTab changes from sidebar
  useEffect(() => {
    if (activeSubTab === 'reports' || activeSubTab === 'inventory') {
      setActiveTab(activeSubTab);
    }
  }, [activeSubTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (setActiveSubTab) {
      setActiveSubTab(tabId);
    }
  };

  // Filter states
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isAdminApproveModalOpen, setIsAdminApproveModalOpen] = useState(false);

  // Selected item / report for modal actions
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

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
    remarks: ''
  });

  // Form states for Coach Condition Report
  const [reportForm, setReportForm] = useState({
    equipmentId: '',
    reportedCondition: 'Needs Maintenance',
    damagedCount: 1,
    missingCount: 0,
    remarks: '',
    photoNote: ''
  });

  // Verification form state
  const [verifyForm, setVerifyForm] = useState({
    notes: '',
    action: 'Verified',
    updateInventory: true,
    conditionOverride: ''
  });

  // Admin approval form state
  const [adminApproveForm, setAdminApproveForm] = useState({
    notes: '',
    action: 'Approved' // 'Approved' | 'PO Sanctioned' | 'Written Off' | 'Rejected'
  });

  // Available locations scoped to allowedLocations
  const availableLocations = useMemo(() => {
    const all = data.locations ? data.locations.map((l) => l.name) : data.academy?.centers || [];
    if (allowedLocations && Array.isArray(allowedLocations) && allowedLocations.length > 0) {
      return all.filter((loc) => allowedLocations.includes(loc));
    }
    return all;
  }, [data.locations, data.academy, allowedLocations]);

  // Scoped equipment list based on allowed locations
  const scopedEquipmentList = useMemo(() => {
    const list = data.equipment || [];
    if (allowedLocations && Array.isArray(allowedLocations) && allowedLocations.length > 0) {
      return list.filter((i) => allowedLocations.includes(i.location));
    }
    return list;
  }, [data.equipment, allowedLocations]);

  // Scoped reports list based on allowed locations
  const scopedReportsList = useMemo(() => {
    const list = data.equipmentReports || [];
    if (allowedLocations && Array.isArray(allowedLocations) && allowedLocations.length > 0) {
      return list.filter((r) => allowedLocations.includes(r.location));
    }
    return list;
  }, [data.equipmentReports, allowedLocations]);

  // Filtered equipment inventory
  const filteredEquipment = useMemo(() => {
    return filterEquipment(scopedEquipmentList, {
      location: selectedLocation,
      category: selectedCategory,
      condition: selectedCondition,
      search: searchTerm
    });
  }, [scopedEquipmentList, selectedLocation, selectedCategory, selectedCondition, searchTerm]);

  // Filtered equipment reports
  const filteredReports = useMemo(() => {
    return scopedReportsList.filter((r) => {
      const matchLoc = selectedLocation === 'All' || r.location === selectedLocation;
      const matchSearch =
        !searchTerm ||
        r.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.submittedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.remarks?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchLoc && matchSearch;
    });
  }, [scopedReportsList, selectedLocation, searchTerm]);

  // Metrics
  const metrics = useMemo(() => {
    return calculateEquipmentMetrics(scopedEquipmentList, scopedReportsList, selectedLocation);
  }, [scopedEquipmentList, scopedReportsList, selectedLocation]);

  // Handlers
  const handleOpenAdd = () => {
    setItemForm({
      name: '',
      category: EQUIPMENT_CATEGORIES[0],
      location: availableLocations[0] || 'KK NAGAR',
      totalQty: 10,
      availableQty: 10,
      damagedQty: 0,
      missingQty: 0,
      condition: 'Good',
      purchaseDate: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!itemForm.name.trim() || !itemForm.location) {
      addToast('Please provide an equipment name and location.', 'error');
      return;
    }

    addEquipmentItem({
      ...itemForm,
      lastUpdatedBy: currentUser?.name || 'Administrator'
    });
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setItemForm({
      name: item.name,
      category: item.category,
      location: item.location,
      totalQty: item.totalQty,
      availableQty: item.availableQty,
      damagedQty: item.damagedQty,
      missingQty: item.missingQty,
      condition: item.condition,
      purchaseDate: item.purchaseDate || '',
      remarks: item.remarks || ''
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
        lastUpdatedBy: currentUser?.name || 'Administrator',
        action: 'Manual Calibration'
      },
      `Inventory re-calibrated by ${currentUser?.name || 'Administrator'}`
    );
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = (item) => {
    if (window.confirm(`Are you sure you want to remove "${item.name}" from ${item.location} inventory?`)) {
      deleteEquipmentItem(item.id);
    }
  };

  const handleOpenReport = (item = null) => {
    const targetItem = item || (scopedEquipmentList.length > 0 ? scopedEquipmentList[0] : null);
    if (!targetItem) {
      addToast('No equipment registered to report.', 'error');
      return;
    }
    setReportForm({
      equipmentId: targetItem.id,
      reportedCondition: 'Needs Maintenance',
      damagedCount: 1,
      missingCount: 0,
      remarks: '',
      photoNote: ''
    });
    setIsReportModalOpen(true);
  };

  const handleSaveReport = (e) => {
    e.preventDefault();
    const item = scopedEquipmentList.find((i) => i.id === reportForm.equipmentId);
    if (!item) {
      addToast('Invalid equipment selected.', 'error');
      return;
    }

    submitEquipmentReport({
      equipmentId: item.id,
      equipmentName: item.name,
      location: item.location,
      category: item.category,
      reportedCondition: reportForm.reportedCondition,
      damagedCount: Number(reportForm.damagedCount) || 0,
      missingCount: Number(reportForm.missingCount) || 0,
      remarks: reportForm.remarks,
      photoNote: reportForm.photoNote || 'Condition notes attached.',
      submittedBy: currentUser?.name || 'Coach'
    });
    setIsReportModalOpen(false);
  };

  const handleOpenVerify = (report) => {
    setSelectedReport(report);
    setVerifyForm({
      notes: `Inspected at ${report.location}. Verified ${report.reportedCondition} condition.`,
      action: 'Verified',
      updateInventory: true,
      conditionOverride: report.reportedCondition
    });
    setIsVerifyModalOpen(true);
  };

  const handleSaveVerify = (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    verifyEquipmentReport(selectedReport.id, {
      reviewer: currentUser?.name || 'Senior Coach Kabir Rao',
      notes: verifyForm.notes,
      action: verifyForm.action,
      updateInventory: verifyForm.updateInventory,
      status: REPORT_STATUSES.VERIFIED_BY_SUPER_COACH
    });
    setIsVerifyModalOpen(false);
    setSelectedReport(null);
  };

  const handleOpenAdminApprove = (report) => {
    setSelectedReport(report);
    setAdminApproveForm({
      notes: 'Sanctioned for immediate maintenance / replacement.',
      action: 'Approved'
    });
    setIsAdminApproveModalOpen(true);
  };

  const handleSaveAdminApprove = (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    adminApproveEquipmentReport(selectedReport.id, {
      reviewer: currentUser?.name || 'Commander Vikramaditya',
      notes: adminApproveForm.notes,
      action: adminApproveForm.action,
      status: REPORT_STATUSES.APPROVED_BY_ADMIN
    });
    setIsAdminApproveModalOpen(false);
    setSelectedReport(null);
  };

  const handleExportCSV = () => {
    const csv = exportEquipmentToCsv(filteredEquipment);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Little_Spartans_Equipment_${selectedLocation}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Equipment inventory exported to CSV successfully.', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ============================================================ */}
      {/* 1. HEADER & ACTION STRIP                                     */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-[#172B5014] shadow-card relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center font-black">
              <Package className="w-5 h-5 text-[#F4510B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">
                  Equipment Management
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFF5ED] text-[#F4510B] border border-[#F4510B30]">
                  {role === 'super_coach' ? 'Super Coach Operations' : role === 'admin' ? 'Central Inventory' : 'Coach Portal'}
                </span>
              </div>
              <p className="text-xs text-[#172B50] opacity-70">
                Location-scoped sports gear inventory, condition inspections, and audit logs
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#172B50] hover:bg-white border border-[#172B501A] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-[#F4510B]" />
            <span>Export CSV</span>
          </button>

          {(role === 'coach' || role === 'super_coach') && (
            <button
              type="button"
              onClick={() => handleOpenReport()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report Condition</span>
            </button>
          )}

          {(role === 'super_coach' || role === 'admin') && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F4510B] hover:bg-[#E04505] text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Equipment</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. OPERATIONAL KPI SUMMARY CARDS                             */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Equipment */}
        <FloatingCard className="bg-white rounded-2xl p-4 sm:p-5 border border-[#172B5014] shadow-card flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#172B50] opacity-75 block">
              Total Inventory Units
            </span>
            <p className="text-2xl sm:text-3xl font-black text-[#172B50] mt-0.5">
              <AnimatedCounter value={metrics.totalItems} />
            </p>
            <span className="text-[11px] font-semibold text-[#172B50] opacity-60">
              {metrics.totalTypes} distinct gear items
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-[#F4510B]" />
          </div>
        </FloatingCard>

        {/* Available Condition */}
        <FloatingCard className="bg-white rounded-2xl p-4 sm:p-5 border border-[#172B5014] shadow-card flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-800 block">
              Available &amp; Ready
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-0.5">
              <AnimatedCounter value={metrics.availableItems} />
            </p>
            <span className="text-[11px] font-bold text-emerald-600">
              {metrics.healthRate}% overall health
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </FloatingCard>

        {/* Damaged & Missing */}
        <FloatingCard className="bg-white rounded-2xl p-4 sm:p-5 border border-[#172B5014] shadow-card flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-rose-800 block">
              Damaged / Missing
            </span>
            <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-0.5">
              <AnimatedCounter value={metrics.damagedItems + metrics.missingItems} />
            </p>
            <span className="text-[11px] font-semibold text-rose-600">
              {metrics.damagedItems} damaged · {metrics.missingItems} missing
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
        </FloatingCard>

        {/* Pending Reports Queue */}
        <FloatingCard className="bg-white rounded-2xl p-4 sm:p-5 border border-[#172B5014] shadow-card flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-800 block">
              Pending Reports
            </span>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-0.5">
              <AnimatedCounter value={metrics.pendingReports} />
            </p>
            <span className="text-[11px] font-bold text-amber-600">
              {metrics.verifiedReports} verified for Admin
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
        </FloatingCard>
      </div>

      {/* ============================================================ */}
      {/* 3. SUB-TAB SWITCHER & FILTER BAR                             */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl p-4 border border-[#172B5014] shadow-card space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#172B5010] pb-3">
          {/* Sub-tabs */}
          <div className="flex items-center gap-2">
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
              <span>Location Inventory</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'inventory' ? 'bg-[#F4510B] text-white' : 'bg-[#172B5020]'}`}>
                {filteredEquipment.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('reports')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'reports'
                  ? 'bg-[#172B50] text-white shadow-sm'
                  : 'bg-[#FFF4E8] text-[#172B50] hover:bg-white border border-[#172B5015]'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Condition Reports Queue</span>
              {metrics.pendingReports > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white animate-pulse">
                  {metrics.pendingReports}
                </span>
              )}
            </button>
          </div>

          {/* Quick Counter label */}
          <div className="text-xs font-semibold text-[#172B50] opacity-70 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
            <span>
              Authorized Locations: <strong className="text-[#172B50]">{availableLocations.join(', ')}</strong>
            </span>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Location Filter */}
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-[#F4510B] absolute left-3 top-3 pointer-events-none" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B] cursor-pointer"
            >
              <option value="All">All Authorized Locations ({availableLocations.length})</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc} ({scopedEquipmentList.filter((i) => i.location === loc).length} items)
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Layers className="w-3.5 h-3.5 text-[#172B50] opacity-60 absolute left-3 top-3 pointer-events-none" />
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

          {/* Condition Filter */}
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-[#172B50] opacity-60 absolute left-3 top-3 pointer-events-none" />
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

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#172B50] opacity-50 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search gear by name, ID, or remarks..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] placeholder-[#172B5080] border border-[#172B5020] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
            />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. TAB 1: INVENTORY TABLE                                     */}
      {/* ============================================================ */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-[#172B5014] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B50]">
              <thead className="bg-[#FFF4E8] border-b border-[#172B5015] text-[10.5px] font-extrabold uppercase tracking-wider text-[#172B50] select-none">
                <tr>
                  <th className="py-3 px-4">Equipment ID &amp; Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3 text-center">Total</th>
                  <th className="py-3 px-3 text-center">Available</th>
                  <th className="py-3 px-3 text-center">Damaged / Missing</th>
                  <th className="py-3 px-3">Condition</th>
                  <th className="py-3 px-3">Last Inspected</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B5010]">
                {filteredEquipment.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-xs text-[#172B50] opacity-60">
                      No equipment records found matching the active filters.
                    </td>
                  </tr>
                ) : (
                  filteredEquipment.map((item) => {
                    const condStyle = CONDITION_COLORS[item.condition] || CONDITION_COLORS.Good;
                    return (
                      <tr key={item.id} className="hover:bg-[#FFF4E8]/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-[#172B5010] text-[#172B50] font-black">
                              {item.id}
                            </span>
                            <span className="text-[13px] font-black text-[#172B50]">{item.name}</span>
                          </div>
                          {item.remarks && (
                            <p className="text-[11px] text-[#172B50] opacity-65 font-normal truncate max-w-xs mt-0.5">
                              {item.remarks}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-[#172B5010] text-[#172B50]">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1 font-bold text-[#F4510B]">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{item.location}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center font-black text-sm">
                          {item.totalQty}
                        </td>
                        <td className="py-3.5 px-3 text-center font-black text-sm text-emerald-700">
                          {item.availableQty}
                        </td>
                        <td className="py-3.5 px-3 text-center text-xs font-bold">
                          {item.damagedQty > 0 || item.missingQty > 0 ? (
                            <span className="text-rose-600 font-black">
                              {item.damagedQty > 0 && `${item.damagedQty} damaged`}
                              {item.damagedQty > 0 && item.missingQty > 0 && ' · '}
                              {item.missingQty > 0 && `${item.missingQty} missing`}
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-semibold">— None —</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold border ${condStyle.bg} ${condStyle.text} ${condStyle.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${condStyle.dot}`} />
                            {item.condition}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-[11px] opacity-75 font-medium">
                          {item.lastInspectionDate || 'Not recorded'}
                          <span className="block text-[10px] opacity-60">By {item.lastUpdatedBy || 'Staff'}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsDetailsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-[#FFF4E8] text-[#172B50] opacity-75 hover:opacity-100 transition-colors"
                              title="Audit History & Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {(role === 'coach' || role === 'super_coach') && (
                              <button
                                type="button"
                                onClick={() => handleOpenReport(item)}
                                className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 opacity-80 hover:opacity-100 transition-colors"
                                title="Report Condition or Damage"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {(role === 'super_coach' || role === 'admin') && (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 rounded-lg hover:bg-[#FFF4E8] text-[#172B50] opacity-75 hover:opacity-100 transition-colors"
                                title="Edit / Calibrate Stock"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {role === 'admin' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 opacity-75 hover:opacity-100 transition-colors"
                                title="Delete Equipment Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
      {/* 5. TAB 2: CONDITION REPORTS QUEUE (Super Coach / Admin)      */}
      {/* ============================================================ */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-[#172B5014] shadow-card overflow-hidden">
          <div className="p-4 bg-[#FFF4E8]/60 border-b border-[#172B5015] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#172B50]">
                Coach-Submitted Equipment Reports Queue
              </h3>
              <p className="text-[11px] text-[#172B50] opacity-70">
                Super Coaches review, inspect, and verify field reports before inventory updates or Admin approvals
              </p>
            </div>
            <span className="text-xs font-bold text-[#172B50]">
              Total Reports: {filteredReports.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172B50]">
              <thead className="bg-[#FFF4E8] border-b border-[#172B5015] text-[10.5px] font-extrabold uppercase tracking-wider text-[#172B50] select-none">
                <tr>
                  <th className="py-3 px-4">Report ID &amp; Equipment</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Submitted By</th>
                  <th className="py-3 px-3">Reported Condition</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Super Coach Verification</th>
                  <th className="py-3 px-3">Admin Sanction</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B5010]">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-[#172B50] opacity-60">
                      No condition reports currently pending for your selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-[#FFF4E8]/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold">
                        <span className="font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-[#172B5010] text-[#172B50] font-black mr-2">
                          {report.id}
                        </span>
                        <span className="font-black text-[#172B50] text-[13px]">{report.equipmentName}</span>
                        <p className="text-[11px] text-[#172B50] opacity-75 font-normal mt-0.5">
                          {report.remarks}
                        </p>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-[#F4510B]">
                        {report.location}
                      </td>
                      <td className="py-3.5 px-3 text-[11px]">
                        <span className="font-bold block">{report.submittedBy}</span>
                        <span className="text-[10px] opacity-60">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                          {report.reportedCondition}
                          {report.damagedCount > 0 && ` (${report.damagedCount})`}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                            report.status === REPORT_STATUSES.PENDING_REVIEW
                              ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                              : report.status === REPORT_STATUSES.VERIFIED_BY_SUPER_COACH
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : report.status === REPORT_STATUSES.APPROVED_BY_ADMIN
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[11px]">
                        {report.superCoachReview ? (
                          <div>
                            <span className="font-bold text-blue-900 block flex items-center gap-1">
                              <Check className="w-3 h-3 text-blue-600" />
                              {report.superCoachReview.reviewer}
                            </span>
                            <span className="text-[10px] opacity-75 truncate max-w-[140px] block">
                              {report.superCoachReview.notes}
                            </span>
                          </div>
                        ) : (
                          <span className="text-amber-700 font-semibold text-[10.5px]">Awaiting Super Coach</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-[11px]">
                        {report.adminApproval ? (
                          <div>
                            <span className="font-bold text-emerald-900 block flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {report.adminApproval.action}
                            </span>
                            <span className="text-[10px] opacity-75 truncate max-w-[140px] block">
                              {report.adminApproval.notes}
                            </span>
                          </div>
                        ) : report.status === REPORT_STATUSES.VERIFIED_BY_SUPER_COACH ? (
                          <span className="text-blue-700 font-semibold text-[10.5px]">Pending Admin Sanction</span>
                        ) : (
                          <span className="text-gray-400 text-[10.5px]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {role === 'super_coach' && report.status === REPORT_STATUSES.PENDING_REVIEW && (
                            <button
                              type="button"
                              onClick={() => handleOpenVerify(report)}
                              className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#172B50] hover:bg-[#F4510B] text-white transition-all cursor-pointer shadow-xs flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Verify</span>
                            </button>
                          )}

                          {role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleOpenAdminApprove(report)}
                              className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#F4510B] hover:bg-[#E04505] text-white transition-all cursor-pointer shadow-xs flex items-center gap-1"
                            >
                              <Shield className="w-3 h-3" />
                              <span>Sanction</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: ADD EQUIPMENT RECORD                                 */}
      {/* ============================================================ */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Equipment Record"
        subtitle="Register new sports inventory for an academy location"
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
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Total Qty</label>
              <input
                type="number"
                min={1}
                value={itemForm.totalQty}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 0;
                  setItemForm({ ...itemForm, totalQty: val, availableQty: val });
                }}
                className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020] focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Condition</label>
              <select
                value={itemForm.condition}
                onChange={(e) => setItemForm({ ...itemForm, condition: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020] focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
              >
                {Object.values(EQUIPMENT_CONDITIONS).map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Purchase Date</label>
              <input
                type="date"
                value={itemForm.purchaseDate}
                onChange={(e) => setItemForm({ ...itemForm, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020] focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Remarks / Specifications</label>
            <textarea
              rows={2}
              value={itemForm.remarks}
              onChange={(e) => setItemForm({ ...itemForm, remarks: e.target.value })}
              placeholder="e.g. Official match balls stored in court equipment box."
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020] focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Register Equipment
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 2: EDIT / CALIBRATE STOCK (Super Coach / Admin)        */}
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
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020] focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
            />
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-[#172B50] block mb-1">Total Qty</label>
              <input
                type="number"
                min={0}
                value={itemForm.totalQty}
                onChange={(e) => setItemForm({ ...itemForm, totalQty: parseInt(e.target.value, 10) || 0 })}
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
                onChange={(e) => setItemForm({ ...itemForm, damagedQty: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-2.5 py-2 text-xs font-bold bg-rose-50 text-rose-800 rounded-xl border border-rose-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-purple-800 block mb-1">Missing</label>
              <input
                type="number"
                min={0}
                value={itemForm.missingQty}
                onChange={(e) => setItemForm({ ...itemForm, missingQty: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-2.5 py-2 text-xs font-bold bg-purple-50 text-purple-800 rounded-xl border border-purple-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Equipment Condition</label>
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
            <label className="text-xs font-bold text-[#172B50] block mb-1">Inspection Notes &amp; Remarks</label>
            <textarea
              rows={2}
              value={itemForm.remarks}
              onChange={(e) => setItemForm({ ...itemForm, remarks: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Save Calibration
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 3: AUDIT HISTORY & DETAILS MODAL                         */}
      {/* ============================================================ */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Equipment Audit & Maintenance Log"
        subtitle={`${selectedItem?.name} (${selectedItem?.id})`}
        maxWidth="max-w-xl"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-[#FFF4E8] border border-[#172B5014]">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">Location</span>
                <span className="text-xs font-black text-[#F4510B]">{selectedItem.location}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">Condition</span>
                <span className="text-xs font-black text-[#172B50]">{selectedItem.condition}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">Total Qty</span>
                <span className="text-xs font-black text-[#172B50]">{selectedItem.totalQty} Units</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block">Available</span>
                <span className="text-xs font-black text-emerald-700">{selectedItem.availableQty} Units</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-[#172B50] mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#F4510B]" />
                <span>Audit History &amp; Inspection Trail</span>
              </h4>

              {(!selectedItem.history || selectedItem.history.length === 0) ? (
                <p className="text-xs text-[#172B50] opacity-60 py-4 text-center">
                  No historical audits recorded for this item yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedItem.history.map((h, idx) => (
                    <div key={h.id || idx} className="p-2.5 rounded-xl bg-white border border-[#172B5015] shadow-2xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-[#172B50]">{h.action}</span>
                        <span className="text-[10px] opacity-60">
                          {new Date(h.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#172B50] opacity-75 mt-0.5">{h.details}</p>
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
      {/* MODAL 4: COACH SUBMIT CONDITION REPORT                        */}
      {/* ============================================================ */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Submit Equipment Condition Report"
        subtitle="Report maintenance, wear, damage, or missing items to Super Coach"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveReport} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Target Equipment *</label>
            <select
              value={reportForm.equipmentId}
              onChange={(e) => setReportForm({ ...reportForm, equipmentId: e.target.value })}
              className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            >
              {scopedEquipmentList.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.location}) - [{i.id}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Reported Condition</label>
              <select
                value={reportForm.reportedCondition}
                onChange={(e) => setReportForm({ ...reportForm, reportedCondition: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              >
                <option value="Needs Maintenance">Needs Maintenance</option>
                <option value="Damaged">Damaged</option>
                <option value="Missing">Missing</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Affected Units Count</label>
              <input
                type="number"
                min={1}
                value={reportForm.damagedCount}
                onChange={(e) => setReportForm({ ...reportForm, damagedCount: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Remarks &amp; Cause of Damage *</label>
            <textarea
              required
              rows={3}
              value={reportForm.remarks}
              onChange={(e) => setReportForm({ ...reportForm, remarks: e.target.value })}
              placeholder="Explain how damage occurred during class, e.g. stitching tore during agility tumble drill..."
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Photo Reference / Evidence Note</label>
            <input
              type="text"
              value={reportForm.photoNote}
              onChange={(e) => setReportForm({ ...reportForm, photoNote: e.target.value })}
              placeholder="e.g. IMG_20261115_torn_seam.jpg / Shared on Coach WhatsApp"
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm cursor-pointer"
            >
              Submit Report
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 5: SUPER COACH VERIFY REPORT                            */}
      {/* ============================================================ */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title="Verify Equipment Condition Report"
        subtitle={`Reviewing ${selectedReport?.id} submitted by ${selectedReport?.submittedBy}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveVerify} className="space-y-4">
          <div className="p-3 rounded-2xl bg-[#FFF4E8] border border-[#172B5014] text-xs">
            <span className="font-bold text-[#172B50] block">{selectedReport?.equipmentName}</span>
            <span className="text-[11px] text-[#F4510B] font-extrabold">{selectedReport?.location} · {selectedReport?.reportedCondition} ({selectedReport?.damagedCount} units)</span>
            <p className="text-[11px] opacity-75 mt-1 italic font-serif">"{selectedReport?.remarks}"</p>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Super Coach Verification Notes *</label>
            <textarea
              required
              rows={3}
              value={verifyForm.notes}
              onChange={(e) => setVerifyForm({ ...verifyForm, notes: e.target.value })}
              placeholder="Enter on-site physical inspection findings..."
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={verifyForm.updateInventory}
                onChange={(e) => setVerifyForm({ ...verifyForm, updateInventory: e.target.checked })}
                className="w-4 h-4 text-[#F4510B] rounded focus:ring-0"
              />
              <span className="text-xs font-bold text-blue-900">
                Update Location Inventory Quantities automatically
              </span>
            </label>
            <p className="text-[10.5px] text-blue-700 ml-6 mt-0.5">
              Increases damaged/missing count and decreases available count in official register.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsVerifyModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#172B50] hover:bg-[#F4510B] text-white rounded-xl shadow-sm cursor-pointer"
            >
              Verify &amp; Forward to Admin
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 6: ADMIN SANCTION / APPROVE REPORT                      */}
      {/* ============================================================ */}
      <Modal
        isOpen={isAdminApproveModalOpen}
        onClose={() => setIsAdminApproveModalOpen(false)}
        title="Admin Sanction &amp; Procurement Authorization"
        subtitle={`Report ${selectedReport?.id} (${selectedReport?.equipmentName})`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveAdminApprove} className="space-y-4">
          <div className="p-3 rounded-2xl bg-[#FFF4E8] border border-[#172B5014] text-xs">
            <span className="font-bold text-[#172B50] block">{selectedReport?.equipmentName}</span>
            <span className="text-[11px] text-[#F4510B] font-extrabold">{selectedReport?.location} · {selectedReport?.reportedCondition}</span>
            {selectedReport?.superCoachReview && (
              <p className="text-[11px] text-blue-800 mt-1 font-semibold">
                Super Coach Verified: {selectedReport.superCoachReview.notes}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Administrative Decision</label>
            <select
              value={adminApproveForm.action}
              onChange={(e) => setAdminApproveForm({ ...adminApproveForm, action: e.target.value })}
              className="w-full px-3 py-2 text-xs font-bold bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            >
              <option value="Approved">Approved for Repair</option>
              <option value="PO Sanctioned">PO Sanctioned (New Purchase Order)</option>
              <option value="Written Off">Written Off (Decommission)</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Admin Approval Notes *</label>
            <textarea
              required
              rows={3}
              value={adminApproveForm.notes}
              onChange={(e) => setAdminApproveForm({ ...adminApproveForm, notes: e.target.value })}
              placeholder="e.g. Purchase order PO-2026-88 issued to supplier for 2 replacements..."
              className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] rounded-xl border border-[#172B5020]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdminApproveModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm cursor-pointer"
            >
              Sanction Decision
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
