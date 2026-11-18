import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Receipt, 
  ShieldCheck, 
  Clock, 
  ArrowLeft, 
  Bell, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  FileText, 
  Search,
  Filter,
  RefreshCw,
  Send,
  Calendar,
  AlertTriangle,
  Trophy,
  Users,
  ChevronDown,
  Eye,
  Check,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Hash,
  Download,
  AlertCircle
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import {
  computeStudentPackage,
  calculatePackageOverviewMetrics,
  calculatePackageExpiryDate,
  PACKAGE_STATUS_CONFIG,
  PACKAGE_TOTAL_CLASSES,
  PACKAGE_STATUSES,
  PACKAGE_REMINDER_THRESHOLD
} from '../../services/packageService';
import { getCommonLocations } from '../../services/locationService';

export default function FeesPaymentsModule() {
  const { 
    data, 
    setCurrentView, 
    updateStudent,
    activateStudentPackage, 
    renewStudentPackage, 
    sendManualPackageReminder,
    addToast 
  } = useCrm();

  const commonLocations = getCommonLocations(data);
  const todayYmd = new Date().toISOString().split('T')[0];

  // Primary Subtab: 'packages' (Default) | 'gateway' (Upcoming Online Invoices)
  const [activeTab, setActiveTab] = useState('packages');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterProgram, setFilterProgram] = useState('All');
  const [filterBatch, setFilterBatch] = useState('All');
  const [filterPackageStatus, setFilterPackageStatus] = useState('All');
  const [filterReminderStatus, setFilterReminderStatus] = useState('All');

  // Interactive Fee Status Dropdown State
  const [openFeeDropdownId, setOpenFeeDropdownId] = useState(null);

  // Modals state
  const [activateTargetStudent, setActivateTargetStudent] = useState(null);
  const [activationDateInput, setActivationDateInput] = useState(todayYmd);

  const [renewTargetStudent, setRenewTargetStudent] = useState(null);
  const [renewDateInput, setRenewDateInput] = useState(todayYmd);

  const [viewHistoryStudent, setViewHistoryStudent] = useState(null);
  const [manualReminderTarget, setManualReminderTarget] = useState(null);

  // Coming Soon Notification subscription
  const [isNotified, setIsNotified] = useState(false);

  const handleNotifyMe = () => {
    setIsNotified(true);
    addToast('You have been subscribed for Little Spartans Fees & Payment Gateway launch updates!', 'success');
  };

  // Close fee status dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.fee-status-dropdown-container')) {
        setOpenFeeDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Package info for all students
  const studentPackageList = useMemo(() => {
    return (data.students || []).map((student) => {
      const pkg = computeStudentPackage(student, data.attendanceRecords || [], todayYmd);
      return {
        student,
        pkg
      };
    });
  }, [data.students, data.attendanceRecords, todayYmd]);

  // Aggregate Metrics for Top Summary Cards
  const metrics = useMemo(() => {
    return calculatePackageOverviewMetrics(data.students || [], data.attendanceRecords || [], todayYmd);
  }, [data.students, data.attendanceRecords, todayYmd]);

  // Available unique batches for filter dropdown
  const availableBatches = useMemo(() => {
    const batches = new Set();
    (data.students || []).forEach((s) => {
      if (s.batchName) batches.add(s.batchName);
      if (Array.isArray(s.enrolledClasses)) {
        s.enrolledClasses.forEach((b) => batches.add(b));
      }
    });
    return Array.from(batches).filter(Boolean);
  }, [data.students]);

  // Filtered Student Packages List
  const filteredPackages = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return studentPackageList.filter(({ student, pkg }) => {
      // 1. Search Query
      if (q) {
        const matchId = (student.id || '').toLowerCase().includes(q);
        const matchName = (student.name || '').toLowerCase().includes(q);
        const matchParent = (student.parentName || '').toLowerCase().includes(q);
        const matchPhone = (student.parentPhone || '').includes(q);
        if (!matchId && !matchName && !matchParent && !matchPhone) return false;
      }

      // 2. Location Filter
      if (filterLocation !== 'All' && student.center !== filterLocation) {
        return false;
      }

      // 3. Program Filter
      if (filterProgram !== 'All' && student.program !== filterProgram) {
        return false;
      }

      // 4. Batch Filter
      if (filterBatch !== 'All') {
        const matchesBatch =
          student.batchName === filterBatch ||
          (Array.isArray(student.enrolledClasses) && student.enrolledClasses.includes(filterBatch));
        if (!matchesBatch) return false;
      }

      // 5. Package Status Filter
      if (filterPackageStatus !== 'All' && pkg.status !== filterPackageStatus) {
        return false;
      }

      // 6. Reminder Status Filter
      if (filterReminderStatus !== 'All') {
        if (filterReminderStatus === 'Reminder Due' && pkg.status !== PACKAGE_STATUSES.REMINDER_DUE) {
          return false;
        }
        if (filterReminderStatus === 'Renewal Due' && pkg.status !== PACKAGE_STATUSES.COMPLETED) {
          return false;
        }
        if (filterReminderStatus === 'On Track' && pkg.reminderStatus !== 'On Track') {
          return false;
        }
      }

      return true;
    });
  }, [studentPackageList, searchTerm, filterLocation, filterProgram, filterBatch, filterPackageStatus, filterReminderStatus]);

  // Handle Fee Status Change
  const handleSelectFeeStatus = (student, newStatus) => {
    updateStudent(student.id, { feeStatus: newStatus });
    setOpenFeeDropdownId(null);
    addToast(`Fee status for "${student.name}" updated to ${newStatus}.`, 'success');
  };

  // Open Activation Modal
  const handleOpenActivate = (student) => {
    setActivateTargetStudent(student);
    setActivationDateInput(todayYmd);
  };

  // Confirm Activation
  const handleConfirmActivate = () => {
    if (!activateTargetStudent) return;
    activateStudentPackage(activateTargetStudent.id, activationDateInput);
    setActivateTargetStudent(null);
  };

  // Open Renew Modal
  const handleOpenRenew = (student) => {
    setRenewTargetStudent(student);
    setRenewDateInput(todayYmd);
  };

  // Confirm Renewal
  const handleConfirmRenew = () => {
    if (!renewTargetStudent) return;
    renewStudentPackage(renewTargetStudent.id, renewDateInput);
    setRenewTargetStudent(null);
  };

  // Confirm Manual Reminder
  const handleConfirmSendReminder = () => {
    if (!manualReminderTarget) return;
    sendManualPackageReminder(manualReminderTarget.id);
    setManualReminderTarget(null);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredPackages.length === 0) {
      addToast('No package records available to export.', 'error');
      return;
    }

    const headers = [
      'Kid ID',
      'Kid Name',
      'Parent Name',
      'Parent Phone',
      'Location',
      'Program',
      'Batch',
      'Fee Status',
      'Package Activation Date',
      'Package Expiry Date',
      'Total Classes',
      'Classes Attended',
      'Classes Remaining',
      'Package Status',
      'Reminder Status'
    ];

    const rows = filteredPackages.map(({ student, pkg }) => [
      `"${student.id}"`,
      `"${student.name}"`,
      `"${student.parentName || ''}"`,
      `"${student.parentPhone || ''}"`,
      `"${student.center || ''}"`,
      `"${student.program || ''}"`,
      `"${student.batchName || (student.enrolledClasses || []).join(', ')}"`,
      `"${student.feeStatus || 'Pending'}"`,
      `"${pkg.activationDate || 'N/A'}"`,
      `"${pkg.expiryDate || 'N/A'}"`,
      pkg.totalClasses,
      pkg.classesAttended,
      pkg.classesRemaining,
      `"${pkg.status}"`,
      `"${pkg.reminderStatus}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Little-Spartans-Class-Packages-${todayYmd}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Exported ${filteredPackages.length} package records to CSV.`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#172B5012]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#172B50]/60 mb-1">
            <span>ZenConnect</span>
            <span>/</span>
            <span className="text-[#F4510B]">Fees &amp; Payments</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF5ED] text-[#F4510B] border border-[#F4510B25] shadow-2xs flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#F4510B]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight">
                Fees &amp; Class Package Tracking
              </h1>
              <p className="text-xs sm:text-sm font-medium text-[#172B50]/65 mt-0.5">
                Individual 24-class packages, 3-month validity tracking, automated renewal alerts &amp; tuition governance
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#172B5018] text-[#172B50] text-xs font-bold flex items-center gap-2 hover:bg-[#FFF4E8] hover:border-[#F4510B30] transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-[#172B50]" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. Module Subtabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#172B500C]">
        <button
          type="button"
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'packages'
              ? 'bg-[#172B50] text-white shadow-sm'
              : 'bg-white text-[#172B50]/70 hover:bg-[#FFF4E8] hover:text-[#172B50] border border-[#172B5010]'
          }`}
        >
          <Layers className={`w-4 h-4 ${activeTab === 'packages' ? 'text-[#F4510B]' : 'text-[#172B50]/60'}`} />
          <span>Student Class Packages</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'packages' ? 'bg-white/20 text-white' : 'bg-[#172B500C] text-[#172B50]'
          }`}>
            {data.students?.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gateway')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'gateway'
              ? 'bg-[#172B50] text-white shadow-sm'
              : 'bg-white text-[#172B50]/70 hover:bg-[#FFF4E8] hover:text-[#172B50] border border-[#172B5010]'
          }`}
        >
          <Receipt className={`w-4 h-4 ${activeTab === 'gateway' ? 'text-[#F4510B]' : 'text-[#172B50]/60'}`} />
          <span>Payment Gateway &amp; Invoices</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4510B18] text-[#F4510B]">
            Coming Soon
          </span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 3. TAB 1: INDIVIDUAL STUDENT CLASS PACKAGE TRACKING          */}
      {/* ============================================================ */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          
          {/* Summary KPI Cards (5 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            
            {/* Card 1 – Active Packages */}
            <div 
              onClick={() => setFilterPackageStatus('Active')}
              className="bg-gradient-to-br from-[#F0FDF4] to-white rounded-[22px] p-4.5 border border-[#BBF7D0] shadow-2xs flex flex-col justify-between hover:border-[#16A34A] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Active Packages</span>
                <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight">{metrics.activePackages}</p>
                <p className="text-[10.5px] font-medium text-emerald-700/70 mt-0.5">Consuming 24 sessions</p>
              </div>
            </div>

            {/* Card 2 – 20-Class Reminder Due */}
            <div 
              onClick={() => { setFilterPackageStatus('All'); setFilterReminderStatus('Reminder Due'); }}
              className="bg-gradient-to-br from-[#FFFBEB] to-white rounded-[22px] p-4.5 border border-[#FDE68A] shadow-2xs flex flex-col justify-between hover:border-[#D97706] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">20-Class Reminder</span>
                <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                  <Bell className="w-4 h-4 text-[#D97706]" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-amber-900 tracking-tight">{metrics.reminderDueCount}</p>
                <p className="text-[10.5px] font-medium text-amber-700/70 mt-0.5">20 of 24 attended (4 left)</p>
              </div>
            </div>

            {/* Card 3 – 1-4 Classes Remaining */}
            <div 
              onClick={() => { setFilterPackageStatus('All'); setFilterReminderStatus('All'); }}
              className="bg-gradient-to-br from-[#FFF4E8] to-white rounded-[22px] p-4.5 border border-[#FED7AA] shadow-2xs flex flex-col justify-between hover:border-[#F4510B] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#F4510B] uppercase tracking-wider">1–4 Left</span>
                <div className="w-8 h-8 rounded-xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#F4510B]" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight">{metrics.lowClassesCount}</p>
                <p className="text-[10.5px] font-medium text-[#172B50]/60 mt-0.5">Approaching term completion</p>
              </div>
            </div>

            {/* Card 4 – Completed Packages */}
            <div 
              onClick={() => setFilterPackageStatus('Completed')}
              className="bg-gradient-to-br from-[#EEF2FF] to-white rounded-[22px] p-4.5 border border-[#C7D2FE] shadow-2xs flex flex-col justify-between hover:border-indigo-600 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">Completed</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-indigo-700" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">{metrics.completedPackages}</p>
                <p className="text-[10.5px] font-medium text-indigo-700/70 mt-0.5">24 of 24 finished (Renewal Due)</p>
              </div>
            </div>

            {/* Card 5 – Expired Packages */}
            <div 
              onClick={() => setFilterPackageStatus('Expired')}
              className="bg-gradient-to-br from-[#FFF1F2] to-white rounded-[22px] p-4.5 border border-[#FECDD3] shadow-2xs flex flex-col justify-between hover:border-[#E11D48] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Expired</span>
                <div className="w-8 h-8 rounded-xl bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-[#E11D48]" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-rose-900 tracking-tight">{metrics.expiredPackages}</p>
                <p className="text-[10.5px] font-medium text-rose-700/70 mt-0.5">Passed 3-month window</p>
              </div>
            </div>

          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-[#172B5012] shadow-2xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#172B50]/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by Kid ID, student name, or parent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#FFF4E8]/40 border border-[#172B5015] rounded-xl text-xs font-bold text-[#172B50] placeholder:text-[#172B50]/40 focus:outline-none focus:border-[#F4510B]"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Location Filter */}
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="px-3 py-2 bg-white border border-[#172B5015] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B] cursor-pointer"
                >
                  <option value="All">All Locations</option>
                  {commonLocations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>

                {/* Program Filter */}
                <select
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  className="px-3 py-2 bg-white border border-[#172B5015] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B] cursor-pointer"
                >
                  <option value="All">All Programs</option>
                  {(data.programs || []).map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>

                {/* Batch Filter */}
                <select
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="px-3 py-2 bg-white border border-[#172B5015] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B] cursor-pointer max-w-[150px] truncate"
                >
                  <option value="All">All Batches</option>
                  {availableBatches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                {/* Package Status Filter */}
                <select
                  value={filterPackageStatus}
                  onChange={(e) => setFilterPackageStatus(e.target.value)}
                  className="px-3 py-2 bg-white border border-[#172B5015] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B] cursor-pointer"
                >
                  <option value="All">All Package Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Reminder Due">Reminder Due (20+ attended)</option>
                  <option value="Completed">Completed (24 attended)</option>
                  <option value="Expired">Expired</option>
                  <option value="Not Activated">Not Activated</option>
                </select>

                {/* Reminder Status Filter */}
                <select
                  value={filterReminderStatus}
                  onChange={(e) => setFilterReminderStatus(e.target.value)}
                  className="px-3 py-2 bg-white border border-[#172B5015] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B] cursor-pointer"
                >
                  <option value="All">All Reminders</option>
                  <option value="Reminder Due">Reminder Due (4 Left)</option>
                  <option value="Renewal Due">Renewal Due (0 Left)</option>
                  <option value="On Track">On Track</option>
                </select>

                {(searchTerm || filterLocation !== 'All' || filterProgram !== 'All' || filterBatch !== 'All' || filterPackageStatus !== 'All' || filterReminderStatus !== 'All') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterLocation('All');
                      setFilterProgram('All');
                      setFilterBatch('All');
                      setFilterPackageStatus('All');
                      setFilterReminderStatus('All');
                    }}
                    className="px-3 py-2 text-xs font-black text-[#F4510B] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Student Class Package Table */}
          <div className="bg-white rounded-3xl border border-[#172B5015] shadow-sm overflow-hidden relative">
            <div className="overflow-x-auto min-h-[380px] pb-24">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#FFF4E8] text-[#172B50] border-b border-[#172B5012] font-black uppercase tracking-wider text-[10.5px]">
                    <th className="py-3.5 px-4"># Kid ID</th>
                    <th className="py-3.5 px-4">Athlete &amp; Parent</th>
                    <th className="py-3.5 px-4">Location &amp; Program</th>
                    <th className="py-3.5 px-4">Fee Status</th>
                    <th className="py-3.5 px-4">Package Validity (3 Mo)</th>
                    <th className="py-3.5 px-4 text-center">Attended / Total</th>
                    <th className="py-3.5 px-4 text-center">Remaining</th>
                    <th className="py-3.5 px-4" style={{ minWidth: '160px' }}>Usage Progress</th>
                    <th className="py-3.5 px-4">Package Status</th>
                    <th className="py-3.5 px-4">Reminder Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B500C]">
                  {filteredPackages.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="py-16 text-center text-[#172B50]/60">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                          <Layers className="w-10 h-10 text-[#F4510B]/50" />
                          <p className="font-black text-sm text-[#172B50]">No student packages found</p>
                          <p className="text-xs text-[#172B50]/60">
                            No enrolled students match your active filters. Try adjusting search or filter options.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPackages.map(({ student, pkg }) => {
                      const cfg = PACKAGE_STATUS_CONFIG[pkg.status] || PACKAGE_STATUS_CONFIG['Active'];

                      return (
                        <tr key={student.id} className="hover:bg-[#FFF4E8]/35 transition-colors">
                          {/* 1. Kid ID */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 font-black text-[#F4510B] bg-[#FFF5ED] px-2.5 py-1 rounded-lg border border-[#F4510B30] text-xs font-mono shadow-2xs">
                              {student.id}
                            </span>
                          </td>

                          {/* 2. Athlete & Parent */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={student.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'}
                                alt={student.name}
                                className="w-8 h-8 rounded-xl object-cover ring-1 ring-[#172B5015] shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-black text-[#172B50] truncate">{student.name}</p>
                                <p className="text-[10.5px] font-medium text-[#172B50]/60 truncate">
                                  {student.parentName || 'Guardian'} {student.parentPhone ? `• ${student.parentPhone}` : ''}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* 3. Location & Program */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-xs font-bold text-[#F4510B]">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{student.center}</span>
                            </div>
                            <p className="text-[10.5px] text-[#172B50]/70 font-semibold truncate max-w-[180px]">
                              {student.program} {student.batchName ? `• ${student.batchName}` : ''}
                            </p>
                          </td>

                          {/* 4. Fee Status (With Interactive Pill Dropdown) */}
                          <td className="py-3 px-4">
                            <div className="relative inline-block text-left fee-status-dropdown-container">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenFeeDropdownId((prev) => (prev === student.id ? null : student.id));
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-extrabold border transition-all cursor-pointer shadow-2xs hover:opacity-90 active:scale-95 ${
                                  (student.feeStatus || 'Pending') === 'Paid'
                                    ? 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]'
                                    : (student.feeStatus || 'Pending') === 'Unpaid'
                                    ? 'bg-[#FFE4E6] text-[#E11D48] border-[#FECDD3]'
                                    : 'bg-[#FFF5ED] text-[#F4510B] border-[#F4510B30]'
                                } ${
                                  openFeeDropdownId === student.id ? 'ring-2 ring-offset-1 ring-[#172B5020]' : ''
                                }`}
                                title="Click to change Fee Status"
                              >
                                <span>{student.feeStatus || 'Pending'}</span>
                                <ChevronDown
                                  className={`w-3 h-3 stroke-[2.5] transition-transform duration-200 ${
                                    openFeeDropdownId === student.id ? 'rotate-180' : ''
                                  } ${
                                    (student.feeStatus || 'Pending') === 'Paid'
                                      ? 'text-[#16A34A]'
                                      : (student.feeStatus || 'Pending') === 'Unpaid'
                                      ? 'text-[#E11D48]'
                                      : 'text-[#F4510B]'
                                  }`}
                                />
                              </button>

                              {openFeeDropdownId === student.id && (
                                <div 
                                  className="absolute left-0 top-full mt-1.5 w-36 bg-white rounded-2xl border border-[#172B5018] shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 backdrop-blur-sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#172B50]/50 border-b border-[#172B500C] mb-1">
                                    Fee Status
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectFeeStatus(student, 'Unpaid')}
                                    className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                      student.feeStatus === 'Unpaid'
                                        ? 'bg-[#FFE4E6]/70 text-[#E11D48] font-black'
                                        : 'text-[#172B50] hover:bg-rose-50 hover:text-[#E11D48]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-[#E11D48] shrink-0" />
                                      <span>Unpaid</span>
                                    </div>
                                    {student.feeStatus === 'Unpaid' && <Check className="w-3.5 h-3.5 text-[#E11D48] stroke-[2.5]" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectFeeStatus(student, 'Paid')}
                                    className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                      student.feeStatus === 'Paid'
                                        ? 'bg-[#DCFCE7]/70 text-[#16A34A] font-black'
                                        : 'text-[#172B50] hover:bg-emerald-50 hover:text-[#16A34A]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
                                      <span>Paid</span>
                                    </div>
                                    {student.feeStatus === 'Paid' && <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[2.5]" />}
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 5. Package Validity (3 Mo) */}
                          <td className="py-3 px-4">
                            {pkg.packageActivated ? (
                              <div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-[#172B50]">
                                  <Calendar className="w-3.5 h-3.5 text-[#F4510B]" />
                                  <span>{pkg.activationDate} &rarr; {pkg.expiryDate}</span>
                                </div>
                                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                                  pkg.isExpired ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {pkg.isExpired ? 'Expired' : '3 Months Active'}
                                </span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenActivate(student)}
                                className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#FFF5ED] text-[#F4510B] border border-[#F4510B30] hover:bg-[#F4510B] hover:text-white transition-all cursor-pointer shadow-2xs"
                              >
                                + Activate Package
                              </button>
                            )}
                          </td>

                          {/* 6. Attended / Total */}
                          <td className="py-3 px-4 text-center">
                            <span className="text-sm font-black text-[#172B50]">
                              {pkg.classesAttended} <span className="text-xs text-[#172B50]/50 font-normal">/ {PACKAGE_TOTAL_CLASSES}</span>
                            </span>
                            <span className="text-[10px] text-[#172B50]/60 block font-semibold">Classes Attended</span>
                          </td>

                          {/* 7. Remaining Classes */}
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-xl text-xs font-black border ${
                              pkg.classesRemaining === 0
                                ? 'bg-indigo-100 text-indigo-900 border-indigo-200'
                                : pkg.classesRemaining <= 4
                                ? 'bg-amber-100 text-amber-900 border-amber-200 font-extrabold animate-pulse'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}>
                              {pkg.classesRemaining} Left
                            </span>
                          </td>

                          {/* 8. Usage Progress Bar */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold text-[#172B50]/75">
                                <span>{pkg.usagePercentage}% Used</span>
                                <span>{pkg.classesAttended}/24</span>
                              </div>
                              <div className="w-full bg-[#172B5010] h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 rounded-full ${
                                    pkg.classesAttended >= 24
                                      ? 'bg-indigo-600'
                                      : pkg.classesAttended >= 20
                                      ? 'bg-amber-500'
                                      : 'bg-[#F4510B]'
                                  }`}
                                  style={{ width: `${pkg.usagePercentage}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* 9. Package Status */}
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-extrabold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              <span>{pkg.status}</span>
                            </span>
                          </td>

                          {/* 10. Reminder Status */}
                          <td className="py-3 px-4">
                            {pkg.status === PACKAGE_STATUSES.COMPLETED ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                                <Trophy className="w-3 h-3 text-indigo-700" />
                                Renewal Due
                              </span>
                            ) : pkg.status === PACKAGE_STATUSES.REMINDER_DUE ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                                <Bell className="w-3 h-3 text-amber-700" />
                                Reminder Due (4 Left)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#172B50]/70">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                On Track
                              </span>
                            )}
                          </td>

                          {/* 11. Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Classes History */}
                              <button
                                type="button"
                                onClick={() => setViewHistoryStudent(student)}
                                className="p-1.5 rounded-lg border border-[#172B5018] bg-white hover:bg-[#FFF4E8] text-[#172B50] hover:text-[#F4510B] transition-colors cursor-pointer shadow-2xs"
                                title="View Attended Classes Breakdown"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Activate or Renew Action */}
                              {!pkg.packageActivated ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenActivate(student)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#F4510B] text-white hover:bg-[#d94406] transition-all cursor-pointer shadow-2xs"
                                  title="Activate Package"
                                >
                                  Activate
                                </button>
                              ) : pkg.status === PACKAGE_STATUSES.COMPLETED ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenRenew(student)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-600 text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-2xs"
                                  title="Renew 24-Class Package"
                                >
                                  Renew
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setManualReminderTarget(student)}
                                  className="p-1.5 rounded-lg border border-amber-200 bg-white hover:bg-amber-50 text-amber-700 transition-colors cursor-pointer shadow-2xs"
                                  title="Send Parent Renewal Reminder"
                                >
                                  <Bell className="w-3.5 h-3.5" />
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

            {/* Table Footer */}
            <div className="p-3 bg-[#FFF4E8]/20 border-t border-[#172B500C] flex items-center justify-between text-xs text-[#172B50]/65 font-bold">
              <span>Showing {filteredPackages.length} of {studentPackageList.length} student packages</span>
              <span>All packages calculated from real attendance records (Present only • 24 classes • 3 months)</span>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* 4. TAB 2: PAYMENT GATEWAY & INVOICES SHOWCASE (COMING SOON)  */}
      {/* ============================================================ */}
      {activeTab === 'gateway' && (
        <div className="bg-white rounded-3xl border border-[#172B5014] shadow-xs relative overflow-hidden p-6 sm:p-10 lg:p-12">
          <div className="max-w-2xl mx-auto text-center relative z-10 space-y-6">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#FFF0E6] via-[#FFE4D1] to-[#FFF5ED] flex items-center justify-center shadow-inner relative">
                <Sparkles className="w-5 h-5 text-[#F4510B] absolute -top-1 -right-1 animate-bounce" />
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-[#F4510B25] shadow-md flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-[#F4510B]" />
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30] mb-3">
                <Sparkles className="w-3 h-3 text-[#F4510B]" />
                <span>Coming Soon</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#172B50] tracking-tight">
                Online Payment Gateway &amp; Tax Invoices
              </h2>
              <p className="text-xs sm:text-sm text-[#172B50]/75 font-medium max-w-lg mx-auto mt-2 leading-relaxed">
                Automated online tuition collection with UPI QR settlement, debit/credit cards, and automated GST-compliant invoice dispatch via WhatsApp &amp; Email.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleNotifyMe}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-sm ${
                  isNotified
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#F4510B] text-white hover:bg-[#d94103] active:scale-95'
                }`}
              >
                {isNotified ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Subscribed for Launch Alert ✓</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 text-white" />
                    <span>Notify Me at Launch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. MODAL: ACTIVATE 24-CLASS PACKAGE                           */}
      {/* ============================================================ */}
      <Modal
        isOpen={Boolean(activateTargetStudent)}
        onClose={() => setActivateTargetStudent(null)}
        title="Activate Student Class Package"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#FFF4E8] border border-[#F4510B25] flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#F4510B] border border-[#F4510B30] flex items-center justify-center shrink-0 font-black">
              24
            </div>
            <div className="text-xs text-[#172B50] space-y-1">
              <p className="font-black text-sm">
                Activate 24-Class Package for <strong className="text-[#F4510B]">{activateTargetStudent?.name}</strong>
              </p>
              <p className="text-[#172B50]/75">
                Kid ID: <strong className="font-mono">{activateTargetStudent?.id}</strong> &bull; Location: {activateTargetStudent?.center} &bull; Program: {activateTargetStudent?.program}
              </p>
              <p className="text-[11px] text-[#172B50]/65">
                Demo classes and absences are never deducted. Only verified regular Present attendance records deduct classes.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#172B50] mb-1">Package Activation Date *</label>
            <input
              type="date"
              value={activationDateInput}
              onChange={(e) => setActivationDateInput(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-[#172B5018] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B]"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <span className="font-medium text-slate-600">Calculated Expiry Date (3 Months):</span>
            <span className="font-black text-[#172B50] font-mono">
              {calculatePackageExpiryDate(activationDateInput)}
            </span>
          </div>

          <div className="pt-3 border-t border-[#172B5010] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setActivateTargetStudent(null)}
              className="px-4 py-2 rounded-xl border border-[#172B5018] text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmActivate}
              className="px-5 py-2 rounded-xl bg-[#F4510B] hover:bg-[#d94406] text-white text-xs font-black shadow-sm cursor-pointer active:scale-95 transition-all"
            >
              Confirm Package Activation
            </button>
          </div>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* 6. MODAL: RENEW 24-CLASS PACKAGE                             */}
      {/* ============================================================ */}
      <Modal
        isOpen={Boolean(renewTargetStudent)}
        onClose={() => setRenewTargetStudent(null)}
        title="Renew Student Class Package"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
            <Trophy className="w-6 h-6 text-indigo-700 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 space-y-1">
              <p className="font-black text-sm">
                Renew Term for <strong className="text-indigo-700">{renewTargetStudent?.name}</strong>
              </p>
              <p>
                Student completed all 24 classes of Cycle {renewTargetStudent?.packageCycle || 1}.
              </p>
              <p className="text-indigo-800">
                A fresh 24-class quota will be allocated for the next 3-month cycle.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#172B50] mb-1">New Package Activation Date *</label>
            <input
              type="date"
              value={renewDateInput}
              onChange={(e) => setRenewDateInput(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-[#172B5018] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B]"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <span className="font-medium text-slate-600">New Expiry Date (3 Months):</span>
            <span className="font-black text-[#172B50] font-mono">
              {calculatePackageExpiryDate(renewDateInput)}
            </span>
          </div>

          <div className="pt-3 border-t border-[#172B5010] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRenewTargetStudent(null)}
              className="px-4 py-2 rounded-xl border border-[#172B5018] text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRenew}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm cursor-pointer active:scale-95 transition-all"
            >
              Confirm 24-Class Package Renewal
            </button>
          </div>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* 7. MODAL: CLASS ATTENDANCE & PACKAGE BREAKDOWN               */}
      {/* ============================================================ */}
      <Modal
        isOpen={Boolean(viewHistoryStudent)}
        onClose={() => setViewHistoryStudent(null)}
        title={viewHistoryStudent ? `Package Attendance: ${viewHistoryStudent.name}` : 'Package Attendance'}
      >
        {viewHistoryStudent && (() => {
          const pkg = computeStudentPackage(viewHistoryStudent, data.attendanceRecords || [], todayYmd);
          const allRecords = (data.attendanceRecords || [])
            .filter(r => r.studentId === viewHistoryStudent.id)
            .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

          return (
            <div className="space-y-4">
              {/* Package Summary Header */}
              <div className="p-4 rounded-2xl bg-[#FFF4E8] border border-[#F4510B25] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-[#172B50]">{viewHistoryStudent.name}</span>
                    <span className="font-mono text-xs font-bold text-[#F4510B] bg-white px-2 py-0.5 rounded-md border border-[#F4510B30]">
                      {viewHistoryStudent.id}
                    </span>
                  </div>
                  <p className="text-xs text-[#172B50]/70 mt-1 font-medium">
                    Package: {pkg.packageActivated ? `${pkg.activationDate} to ${pkg.expiryDate} (3 Mo)` : 'Not Activated'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black text-[#172B50]">{pkg.classesAttended} / 24</p>
                  <p className="text-[10px] font-bold text-[#F4510B]">{pkg.classesRemaining} Classes Remaining</p>
                </div>
              </div>

              {/* Attendance Log Table */}
              <div>
                <h4 className="text-xs font-black text-[#172B50] mb-2 uppercase tracking-wider">
                  Session Attendance Breakdown
                </h4>
                <div className="max-h-60 overflow-y-auto border border-[#172B5015] rounded-xl divide-y divide-[#172B500C]">
                  {allRecords.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#172B50]/60">
                      No attendance records logged yet for this athlete.
                    </div>
                  ) : (
                    allRecords.map((r, i) => {
                      const isCounted = pkg.eligibleRecords.some(er => er.id === r.id || (er.date === r.date && er.batchId === r.batchId));
                      const isDemo = r.isDemo || r.batchId === 'DEMO' || r.type === 'demo';

                      return (
                        <div key={r.id || i} className="p-2.5 px-3 flex items-center justify-between text-xs hover:bg-[#FFF4E8]/20 transition-colors">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#172B50]">{r.date}</span>
                              <span className="text-[10.5px] font-medium text-[#172B50]/60">{r.batchName || 'Regular Batch'}</span>
                            </div>
                            <span className="text-[10px] text-[#172B50]/50 block">Coach: {r.coachName || 'Assigned'}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              r.status === 'Present' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FFE4E6] text-[#E11D48]'
                            }`}>
                              {r.status}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isCounted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isDemo
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {isCounted ? 'Deducted 1' : isDemo ? 'Demo (Excluded)' : '0 Deducted'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setViewHistoryStudent(null)}
                  className="px-4 py-2 text-xs font-bold bg-[#172B50] text-white rounded-xl hover:bg-[#F4510B] transition-colors cursor-pointer"
                >
                  Close History
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ============================================================ */}
      {/* 8. MODAL: SEND MANUAL PACKAGE REMINDER                       */}
      {/* ============================================================ */}
      <Modal
        isOpen={Boolean(manualReminderTarget)}
        onClose={() => setManualReminderTarget(null)}
        title="Send Package Renewal Reminder"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <Bell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 space-y-1">
              <p className="font-black text-sm">
                Dispatch renewal notification for <strong className="text-amber-800">{manualReminderTarget?.name}</strong>?
              </p>
              <p>
                Recipient: <strong className="font-bold">{manualReminderTarget?.parentName}</strong> ({manualReminderTarget?.parentPhone || 'Parent Portal'})
              </p>
              <p className="text-amber-800">
                This will trigger an in-app priority alert and notification in the Parent Portal notifying that the 24-class term renewal is approaching.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#172B5010] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setManualReminderTarget(null)}
              className="px-4 py-2 rounded-xl border border-[#172B5018] text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSendReminder}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-sm cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>Send Renewal Reminder</span>
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
