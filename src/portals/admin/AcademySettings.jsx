import React, { useState, useEffect } from 'react';
import {
  Home,
  Shield,
  Palette,
  MapPin,
  Calendar,
  History,
  Building,
  Phone,
  Mail,
  Globe,
  Eye,
  Edit2,
  Plus,
  CheckCircle2,
  Search,
  Bell,
  ChevronDown,
  X,
  Target,
  RotateCcw,
  Users,
  Clock,
  Sparkles,
  Download,
  AlertTriangle,
  ArrowRight,
  Check,
  Building2,
  Layers,
  FileText
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import TermsManagementModule from './TermsManagementModule';

const SETTINGS_TABS = [
  { id: 'academy', label: 'Academy Settings', icon: Home },
  { id: 'brand', label: 'Brand & Identity', icon: Palette },
  { id: 'centers', label: 'Center Management', icon: MapPin },
  { id: 'calendar', label: 'Academic Calendar', icon: Calendar },
  { id: 'terms', label: 'Terms & Conditions', icon: FileText },
  { id: 'audit', label: 'Settings Audit Log', icon: History },
];

export default function AcademySettings() {
  const {
    data,
    currentUser,
    activeSubTab,
    setActiveSubTab,
    setCurrentPortal,
    currentView,
    setCurrentView,
    addLocation,
    updateLocation,
    toggleLocationStatus,
    updateAcademyGeneralInfo,
    updateAcademicYear,
    addAcademicTerm,
    addAcademicHoliday,
    deleteAcademicHoliday,
    addToast
  } = useCrm();

  // Active Navigation Tab:
  // 'academy' | 'brand' | 'centers' | 'calendar' | 'terms' | 'audit'
  const [activeTab, setActiveTab] = useState(() => {
    if (activeSubTab) {
      if (['terms', 'dos_donts', 'acceptances'].includes(activeSubTab)) return 'terms';
      if (['academy', 'brand', 'centers', 'calendar', 'audit'].includes(activeSubTab)) return activeSubTab;
    }
    if (currentView === 'centers' || currentView === 'locations') return 'centers';
    return 'academy';
  });

  useEffect(() => {
    if (activeSubTab) {
      if (['terms', 'dos_donts', 'acceptances'].includes(activeSubTab)) {
        setActiveTab('terms');
      } else if (['academy', 'brand', 'centers', 'calendar', 'audit'].includes(activeSubTab)) {
        setActiveTab(activeSubTab);
      }
    } else if (currentView === 'centers' || currentView === 'locations') {
      setActiveTab('centers');
    }
  }, [activeSubTab, currentView]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (setActiveSubTab) {
      setActiveSubTab(tabId);
    }
  };

  // General Information State
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [academyName, setAcademyName] = useState(data.academy?.name || 'Little Spartans Sports Academy');
  const [tagline, setTagline] = useState(data.academy?.tagline || 'Empowering Young Champions Through Sports & Discipline');
  const [phone, setPhone] = useState(data.academy?.phone || '+91 98765 43210');
  const [email, setEmail] = useState(data.academy?.email || 'contact@littlespartans.co.in');
  const [website, setWebsite] = useState(data.academy?.website || 'https://www.littlespartans.co.in');
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);

  // Center Modal States (Add & Edit)
  const [isCenterModalOpen, setIsCenterModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null); // null = Add, object = Edit
  const [centerForm, setCenterForm] = useState({
    name: '',
    code: '',
    address: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600001',
    contactPerson: '',
    contactPhone: '',
    operatingDays: 'Mon - Sat',
    operatingHours: '06:00 AM - 08:30 PM',
    capacity: 150,
    facilities: 'Main Turf Ground, Training Court A, Warm-up Studio',
    programs: ['Spartan Gymnastics & Agility', 'Junior Football Champions', 'Spartan Athletics & Sprinting'],
    status: 'Active'
  });

  // Calendar State
  const [academicYearInput, setAcademicYearInput] = useState(data.academicCalendar?.academicYear || data.academy?.academicYear || '2026-2027');
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [newHolidayForm, setNewHolidayForm] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Academy Holiday'
  });

  // Audit Search
  const [auditSearch, setAuditSearch] = useState('');

  // Brand Palette Constants (Strictly Enforced 4 Brand Colors)
  const brandColors = [
    {
      name: 'Warm Cream',
      hex: '#FFF4E8',
      swatchBg: '#FFF4E8',
      borderStyle: 'border border-[#172B5015]',
      usage: 'Main Background & Navbar'
    },
    {
      name: 'Spartan Orange',
      hex: '#F4510B',
      swatchBg: '#F4510B',
      borderStyle: 'border border-[#F4510B]',
      usage: 'Active Nav, CTAs & Highlights'
    },
    {
      name: 'Navy Blue',
      hex: '#172B50',
      swatchBg: '#172B50',
      borderStyle: 'border border-[#172B50]',
      usage: 'Headings, Titles & Primary Text'
    },
    {
      name: 'Pure White',
      hex: '#FFFFFF',
      swatchBg: '#FFFFFF',
      borderStyle: 'border border-[#172B5015]',
      usage: 'Cards, Containers & Surfaces'
    }
  ];

  // Centers list from CRM data
  const centersList = data.locations || [];

  // Open Add Center modal
  const handleOpenAddCenter = () => {
    setEditingCenter(null);
    setCenterForm({
      name: '',
      code: `LS-C${(centersList.length + 1)}`,
      address: '',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pinCode: '600001',
      contactPerson: 'Operations Lead',
      contactPhone: '+91 98765 43210',
      operatingDays: 'Mon - Sat',
      operatingHours: '06:00 AM - 08:30 PM',
      capacity: 150,
      facilities: 'Main Turf Ground, Training Court A, Practice Arena B, Warm-up Studio',
      programs: ['Spartan Gymnastics & Agility', 'Junior Football Champions', 'Spartan Athletics & Sprinting'],
      status: 'Active'
    });
    setIsCenterModalOpen(true);
  };

  // Open Edit Center modal
  const handleOpenEditCenter = (center) => {
    setEditingCenter(center);
    setCenterForm({
      name: center.name || '',
      code: center.code || `LS-${center.name?.substring(0, 3)}`,
      address: center.address || '',
      city: center.city || 'Chennai',
      state: center.state || 'Tamil Nadu',
      pinCode: center.pinCode || '600001',
      contactPerson: center.contactPerson || 'Center Operations Manager',
      contactPhone: center.contactPhone || '+91 98765 43210',
      operatingDays: center.operatingDays || 'Mon - Sat',
      operatingHours: center.operatingHours || '06:00 AM - 08:30 PM',
      capacity: center.capacity || 150,
      facilities: Array.isArray(center.facilities || center.courts)
        ? (center.facilities || center.courts).join(', ')
        : (center.facilities || center.courts || ''),
      programs: Array.isArray(center.programs) ? center.programs : [],
      status: center.status || 'Active'
    });
    setIsCenterModalOpen(true);
  };

  // Save Center handler
  const handleSaveCenter = (e) => {
    e.preventDefault();
    if (!centerForm.name.trim()) {
      addToast('Please enter a valid center name.', 'error');
      return;
    }

    const payload = {
      ...centerForm,
      facilities: centerForm.facilities.split(',').map(f => f.trim()).filter(Boolean),
      courts: centerForm.facilities.split(',').map(f => f.trim()).filter(Boolean),
    };

    if (editingCenter) {
      updateLocation(editingCenter.id, payload);
    } else {
      addLocation(payload);
    }
    setIsCenterModalOpen(false);
  };

  // Save General Info with confirmation
  const handleSaveGeneralInfo = (e) => {
    e.preventDefault();
    // Validate inputs
    if (!academyName.trim() || !email.trim()) {
      addToast('Academy name and email are mandatory.', 'warning');
      return;
    }
    setIsConfirmSaveOpen(true);
  };

  const executeConfirmSaveInfo = () => {
    updateAcademyGeneralInfo({
      name: academyName.trim(),
      tagline: tagline.trim(),
      phone: phone.trim(),
      email: email.trim(),
      website: website.trim()
    });
    setIsConfirmSaveOpen(false);
    setIsEditingInfo(false);
  };

  const handleCancelEditInfo = () => {
    setAcademyName(data.academy?.name || 'Little Spartans Sports Academy');
    setTagline(data.academy?.tagline || 'Empowering Young Champions Through Sports & Discipline');
    setPhone(data.academy?.phone || '+91 98765 43210');
    setEmail(data.academy?.email || 'contact@littlespartans.co.in');
    setWebsite(data.academy?.website || 'https://www.littlespartans.co.in');
    setIsEditingInfo(false);
  };

  // Export audit logs to CSV
  const handleExportAuditCSV = () => {
    const logs = data.settingsAuditLogs || [];
    if (logs.length === 0) {
      addToast('No audit entries recorded yet.', 'info');
      return;
    }
    const headers = 'ID,Date & Time,Administrator,Role,Category,Action,Field,Old Value,New Value,Status,IP Address\n';
    const rows = logs.map(l =>
      `"${l.id}","${l.timestamp}","${l.user}","${l.role}","${l.category}","${l.action}","${l.field}","${l.oldValue}","${l.newValue}","${l.status}","${l.ipAddress}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LittleSpartans_Settings_Audit_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Audit log exported successfully.', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 select-none pb-10">
      
      {/* ============================================================ */}
      {/* 1. TOP HEADER: Title, Subtitle, Search, Bell & Admin Profile */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight">
            Settings &amp; Configuration
          </h1>
          <p className="text-xs sm:text-[13px] text-[#172B50]/70 font-medium mt-1">
            Manage academy information, branding, centers, academic calendar and access governance.
          </p>
        </div>

        {/* Top-Right Tools */}
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          {/* Search Icon */}
          <button
            type="button"
            onClick={() => addToast('Search system configuration settings', 'info')}
            className="w-9 h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer"
            title="Search settings"
          >
            <Search className="w-4 h-4 text-[#172B50]" />
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => addToast('1 pending setting verification alert', 'info')}
            className="w-9 h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#172B50]" />
            <span className="w-2 h-2 rounded-full bg-[#F4510B] absolute top-2 right-2 ring-1 ring-white" />
          </button>

          {/* Admin Profile Pill */}
          <div className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-white border border-[#172B5015] shadow-2xs">
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"}
              alt="Admin"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-[#F4510B]/30"
            />
            <div className="text-left hidden md:block">
              <p className="text-xs font-black text-[#172B50] leading-tight">Admin</p>
              <p className="text-[10px] font-semibold text-[#172B50]/60 leading-tight">Super Admin</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#172B50]/60" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SIX HORIZONTAL NAVIGATION TABS (Settings & Configuration) */}
      {/* ============================================================ */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B] shadow-2xs'
                  : 'bg-white text-[#172B50] border border-[#172B5015] hover:bg-[#FFF4E8]/60 hover:text-[#F4510B]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 3. TAB 1: ACADEMY SETTINGS (Matches Screenshot Exactly)      */}
      {/* ============================================================ */}
      {activeTab === 'academy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: 8 Columns (~68% on Desktop)                 */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* ------------------------------------------------------ */}
            {/* CARD A: Academy Configuration & Brand Settings         */}
            {/* ------------------------------------------------------ */}
            <div className="bg-white rounded-[26px] p-5 sm:p-6 border border-[#172B5014] shadow-xs space-y-5">
              {/* Card Header & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">
                    Academy Configuration &amp; Brand Settings
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#172B50]/70 font-medium mt-0.5">
                    Official academy details, brand identity and system-wide configuration.
                  </p>
                </div>

                {/* Right Top Action Buttons */}
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (setCurrentPortal) setCurrentPortal('parent');
                      addToast('Previewing Little Spartans as Parent Portal.', 'info');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#172B5020] text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#172B50]" />
                    <span>View as Parent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditingInfo(!isEditingInfo)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F4510B] text-white text-xs font-black hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md shadow-[#F4510B]/25"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isEditingInfo ? 'Exit Edit' : 'Edit Settings'}</span>
                  </button>
                </div>
              </div>

              {/* Sub-Box: Official Brand Identity Palette (Strictly Enforced) */}
              <div className="bg-[#FFF9F5]/70 rounded-2xl p-4 sm:p-4.5 border border-[#F4510B18] space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <Palette className="w-4 h-4 text-[#F4510B] shrink-0" />
                  <div>
                    <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                      Official Brand Identity Palette (Strictly Enforced)
                    </h3>
                    <p className="text-[11px] text-[#172B50]/65 font-medium">
                      Only four official colors across all portals and responsive modules.
                    </p>
                  </div>
                </div>

                {/* Four Brand Swatch Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {brandColors.map((color) => (
                    <div
                      key={color.name}
                      className="bg-[#FFF4E8] rounded-xl p-3 border border-[#172B5012] flex flex-col justify-between space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          style={{ backgroundColor: color.swatchBg }}
                          className={`w-10 h-10 rounded-xl shrink-0 shadow-2xs ${color.borderStyle}`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-[#172B50] truncate">{color.name}</p>
                          <p className="text-[11px] font-mono font-bold text-[#F4510B]">{color.hex}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#172B50]/65 font-semibold pt-1.5 border-t border-[#172B5010] leading-tight">
                        {color.usage}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------ */}
            {/* CARD B: Academy General Information & Centers          */}
            {/* ------------------------------------------------------ */}
            <div className="bg-white rounded-[26px] p-5 sm:p-6 border border-[#172B5014] shadow-xs space-y-6">
              
              {/* SECTION B1: Academy General Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-[#F4510B]" />
                    <h3 className="text-base font-black text-[#172B50] tracking-tight">
                      Academy General Information
                    </h3>
                  </div>
                  {isEditingInfo && (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Editing Mode Active
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveGeneralInfo} className="space-y-3.5">
                  {/* Row 1: Academy Name & Tagline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-[#172B50] flex items-center gap-1.5 mb-1.5">
                        <Building className="w-3.5 h-3.5 text-[#F4510B]" />
                        <span>Academy Name</span>
                      </label>
                      <input
                        type="text"
                        value={academyName}
                        onChange={(e) => setAcademyName(e.target.value)}
                        disabled={!isEditingInfo}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-extrabold text-[#172B50] transition-all outline-none ${
                          isEditingInfo
                            ? 'bg-white border-2 border-[#F4510B] shadow-xs focus:ring-2 focus:ring-[#F4510B]/20'
                            : 'bg-[#FFF4E8] border border-[#172B5015] cursor-default'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] flex items-center gap-1.5 mb-1.5">
                        <Target className="w-3.5 h-3.5 text-[#F4510B]" />
                        <span>Academy Motto / Tagline</span>
                      </label>
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        disabled={!isEditingInfo}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-extrabold text-[#172B50] transition-all outline-none ${
                          isEditingInfo
                            ? 'bg-white border-2 border-[#F4510B] shadow-xs focus:ring-2 focus:ring-[#F4510B]/20'
                            : 'bg-[#FFF4E8] border border-[#172B5015] cursor-default'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone, Email, Website */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-[#172B50] flex items-center gap-1.5 mb-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#F4510B]" />
                        <span>Official Contact Phone</span>
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={!isEditingInfo}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-[#172B50] transition-all outline-none ${
                          isEditingInfo
                            ? 'bg-white border-2 border-[#F4510B] shadow-xs focus:ring-2 focus:ring-[#F4510B]/20'
                            : 'bg-[#FFF4E8] border border-[#172B5015] cursor-default'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] flex items-center gap-1.5 mb-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#F4510B]" />
                        <span>Official Email</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isEditingInfo}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-[#172B50] transition-all outline-none ${
                          isEditingInfo
                            ? 'bg-white border-2 border-[#F4510B] shadow-xs focus:ring-2 focus:ring-[#F4510B]/20'
                            : 'bg-[#FFF4E8] border border-[#172B5015] cursor-default'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172B50] flex items-center gap-1.5 mb-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#F4510B]" />
                        <span>Website URL</span>
                      </label>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        disabled={!isEditingInfo}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-[#172B50] transition-all outline-none ${
                          isEditingInfo
                            ? 'bg-white border-2 border-[#F4510B] shadow-xs focus:ring-2 focus:ring-[#F4510B]/20'
                            : 'bg-[#FFF4E8] border border-[#172B5015] cursor-default'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Actions when in edit mode */}
                  {isEditingInfo && (
                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#172B5010] animate-in fade-in">
                      <button
                        type="button"
                        onClick={handleCancelEditInfo}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] border border-[#172B5020] hover:bg-[#FFF4E8] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-xs font-black bg-[#F4510B] text-white hover:brightness-110 shadow-md shadow-[#F4510B]/25 transition-all cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* SECTION B2: Registered Academy Centers (5) */}
              <div className="pt-4 border-t border-[#172B5012] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#F4510B]" />
                    <h3 className="text-base font-black text-[#172B50] tracking-tight">
                      Registered Academy Centers ({centersList.length})
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenAddCenter}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-[#F4510B] bg-white text-[#F4510B] hover:bg-[#FFF4E8] text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Center</span>
                  </button>
                </div>

                {/* 5 Center Cards in One Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {centersList.map((center) => (
                    <div
                      key={center.id}
                      onClick={() => handleOpenEditCenter(center)}
                      className="bg-white rounded-2xl p-3 border border-[#172B5014] shadow-2xs hover:border-[#F4510B50] hover:shadow-xs transition-all flex items-center gap-2.5 cursor-pointer group"
                      title={`Click to view/edit ${center.name}`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0 border border-[#F4510B20] group-hover:scale-105 transition-transform">
                        <Building className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-[#172B50] truncate capitalize">
                          {center.name?.toLowerCase()}
                        </p>
                        <span className={`inline-block px-1.5 py-0.2 rounded-full text-[9.5px] font-bold ${
                          center.status !== 'Inactive'
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : 'text-gray-600 bg-gray-100 border border-gray-200'
                        }`}>
                          {center.status !== 'Inactive' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: 4 Columns (~32% on Desktop)                */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* ------------------------------------------------------ */}
            {/* CARD C: Configuration Overview                         */}
            {/* ------------------------------------------------------ */}
            <div className="bg-white rounded-[26px] p-5 sm:p-6 border border-[#172B5014] shadow-xs space-y-3.5">
              <h2 className="text-base font-black text-[#172B50] tracking-tight">
                Configuration Overview
              </h2>

              <div className="space-y-2.5">
                {/* Total Centers */}
                <div className="bg-[#FFF9F5] border border-[#F4510B18] rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center border border-[#F4510B20]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-extrabold text-[#172B50]">
                      Total Centers
                    </span>
                  </div>
                  <span className="text-2xl font-black text-[#F4510B]">
                    {centersList.length}
                  </span>
                </div>

                {/* Active Programs */}
                <div className="bg-[#F0F7FF] border border-[#0284C718] rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0284C7] flex items-center justify-center border border-[#0284C720]">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-extrabold text-[#172B50]">
                      Active Programs
                    </span>
                  </div>
                  <span className="text-2xl font-black text-[#172B50]">
                    {(data.programs || []).length}
                  </span>
                </div>

                {/* Academic Year */}
                <div className="bg-[#FAF5FF] border border-[#7C3AED18] rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center border border-[#7C3AED20]">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-extrabold text-[#172B50]">
                      Academic Year
                    </span>
                  </div>
                  <span className="text-sm font-black text-[#7C3AED]">
                    {data.academicCalendar?.academicYear || data.academy?.academicYear || '2026 – 2027'}
                  </span>
                </div>

                {/* Portal Access Roles */}
                <div className="bg-[#F0FDF4] border border-[#16A34A18] rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-extrabold text-[#172B50]">
                      Portal Access Roles
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-emerald-800 pl-10.5">
                    4 (Admin, Super Coach, Coach, Parent)
                  </p>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------ */}
            {/* CARD D: Quick Actions                                  */}
            {/* ------------------------------------------------------ */}
            <div className="bg-white rounded-[26px] p-5 sm:p-6 border border-[#172B5014] shadow-xs space-y-3.5">
              <h2 className="text-base font-black text-[#172B50] tracking-tight">
                Quick Actions
              </h2>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Action 1: Add Center */}
                <button
                  type="button"
                  onClick={handleOpenAddCenter}
                  className="bg-white rounded-2xl p-3.5 border border-[#172B5014] hover:border-[#F4510B50] hover:bg-[#FFF4E8]/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-2xs group"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center border border-[#F4510B20] group-hover:scale-105 transition-transform">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-extrabold text-[#F4510B] mt-2.5 leading-tight">
                    Add Center
                  </span>
                </button>

                {/* Action 2: Set Academic Calendar */}
                <button
                  type="button"
                  onClick={() => handleTabChange('calendar')}
                  className="bg-white rounded-2xl p-3.5 border border-[#172B5014] hover:border-[#F4510B50] hover:bg-[#FFF4E8]/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-2xs group"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#F0F7FF] text-[#172B50] flex items-center justify-center border border-[#172B5015] group-hover:scale-105 transition-transform">
                    <Calendar className="w-4 h-4 text-[#172B50]" />
                  </div>
                  <span className="text-[11px] font-extrabold text-[#172B50] mt-2.5 leading-tight">
                    Set Academic Calendar
                  </span>
                </button>

                {/* Action 3: Configuration Audit Log */}
                <button
                  type="button"
                  onClick={() => handleTabChange('audit')}
                  className="bg-white rounded-2xl p-3.5 border border-[#172B5014] hover:border-[#F4510B50] hover:bg-[#FFF4E8]/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-2xs group"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] text-[#172B50] flex items-center justify-center border border-[#172B5015] group-hover:scale-105 transition-transform">
                    <RotateCcw className="w-4 h-4 text-[#172B50]" />
                  </div>
                  <span className="text-[11px] font-extrabold text-[#172B50] mt-2.5 leading-tight">
                    Configuration Audit Log
                  </span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. TAB 2: BRAND & IDENTITY VIEW                              */}
      {/* ============================================================ */}
      {activeTab === 'brand' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[26px] p-6 border border-[#172B5014] shadow-xs space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">
                Brand &amp; Identity Standards
              </h2>
              <p className="text-xs sm:text-sm text-[#172B50]/70 font-medium mt-1">
                Visual tokens, brand colors, typography hierarchy, and portal theme consistency.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {brandColors.map((c) => (
                <div key={c.name} className="p-5 rounded-2xl bg-[#FFF4E8] border border-[#172B5015] space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: c.swatchBg }}
                      className={`w-12 h-12 rounded-xl shrink-0 shadow-xs ${c.borderStyle}`}
                    />
                    <div>
                      <h4 className="text-sm font-black text-[#172B50]">{c.name}</h4>
                      <p className="text-xs font-mono font-black text-[#F4510B]">{c.hex}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#172B50]/80 pt-2 border-t border-[#172B5015] leading-relaxed">
                    {c.usage}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#172B5014] space-y-3">
              <h4 className="text-sm font-black text-[#172B50] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F4510B]" />
                <span>Portal Visual Uniformity Covenant</span>
              </h4>
              <p className="text-xs text-[#172B50]/75 leading-relaxed">
                The Little Spartans brand experience strictly prohibits external or improvised color accents. Admin, Super Coach, Coach, and Parent portals uniformly share these four verified tokens ensuring seamless SaaS visual hierarchy.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. TAB 3: CENTER MANAGEMENT VIEW                             */}
      {/* ============================================================ */}
      {activeTab === 'centers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[26px] p-6 border border-[#172B5014] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">
                  Academy Centers Directory
                </h2>
                <p className="text-xs sm:text-sm text-[#172B50]/70 font-medium mt-1">
                  Manage branch locations, facility courts, operating hours, capacity, and active status.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddCenter}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F4510B] text-white text-xs font-black hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md shadow-[#F4510B]/25"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Center</span>
              </button>
            </div>

            {/* Centers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#172B5014] bg-[#F8FAFC] text-[#172B50]/70 font-bold">
                    <th className="py-3 px-3">Center Name</th>
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Address &amp; City</th>
                    <th className="py-3 px-3">Contact Person &amp; Phone</th>
                    <th className="py-3 px-3">Operating Hours</th>
                    <th className="py-3 px-3">Capacity</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B500C]">
                  {centersList.map((center) => (
                    <tr key={center.id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                      <td className="py-3 px-3 font-extrabold text-[#172B50]">
                        {center.name}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#F4510B]">
                        {center.code || 'LS-CEN'}
                      </td>
                      <td className="py-3 px-3 text-[#172B50]/80">
                        {center.address || center.name}, {center.city || 'Chennai'}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-[#172B50]">{center.contactPerson || 'Operations Lead'}</p>
                        <p className="text-[11px] text-[#172B50]/60">{center.contactPhone || '+91 98765 43210'}</p>
                      </td>
                      <td className="py-3 px-3 text-[#172B50]/80">
                        {center.operatingDays || 'Mon-Sat'}, {center.operatingHours || '06:00-20:30'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#172B50]">
                        {center.capacity || 150} Athletes
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          center.status !== 'Inactive'
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : 'text-rose-700 bg-rose-50 border border-rose-200'
                        }`}>
                          {center.status !== 'Inactive' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCenter(center)}
                            className="p-1.5 rounded-lg border border-[#172B5015] text-[#172B50] hover:text-[#F4510B] hover:bg-[#FFF4E8] cursor-pointer"
                            title="Edit Center"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleLocationStatus(center.id)}
                            className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer border ${
                              center.status !== 'Inactive'
                                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                            }`}
                            title={center.status !== 'Inactive' ? 'Deactivate Center' : 'Activate Center'}
                          >
                            {center.status !== 'Inactive' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
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
      {/* 6. TAB 4: ACADEMIC CALENDAR VIEW                             */}
      {/* ============================================================ */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[26px] p-6 border border-[#172B5014] shadow-xs space-y-6">
            {/* Header with Academic Year Config */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#172B5012]">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">
                  Academic Calendar &amp; Term Governance
                </h2>
                <p className="text-xs sm:text-sm text-[#172B50]/70 font-medium mt-1">
                  Manage active academic year, term schedules, holidays, and academy breaks.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={academicYearInput}
                  onChange={(e) => setAcademicYearInput(e.target.value)}
                  placeholder="e.g. 2026-2027"
                  className="px-3.5 py-2 rounded-xl border border-[#172B5025] text-xs font-bold w-36 outline-none focus:ring-2 focus:ring-[#F4510B]"
                />
                <button
                  type="button"
                  onClick={() => updateAcademicYear(academicYearInput)}
                  className="px-4 py-2 rounded-xl bg-[#F4510B] text-white text-xs font-black hover:brightness-110 cursor-pointer shadow-sm"
                >
                  Set Year
                </button>
              </div>
            </div>

            {/* Terms List */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#172B50] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#F4510B]" />
                <span>Academic Training Terms</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(data.academicCalendar?.terms || []).map((term) => (
                  <div key={term.id} className="p-4 rounded-2xl bg-[#FFF9F5] border border-[#F4510B18] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#172B50]">{term.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#172B5015] text-[#172B50]">
                        {term.status}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-[#172B50]/70">
                      {term.startDate} to {term.endDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Holidays List */}
            <div className="space-y-3 pt-3 border-t border-[#172B5012]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[#172B50] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#F4510B]" />
                  <span>Academy Holidays &amp; Scheduled Closures</span>
                </h3>

                <button
                  type="button"
                  onClick={() => setIsHolidayModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#F4510B] bg-white text-[#F4510B] hover:bg-[#FFF4E8] text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Holiday</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(data.academicCalendar?.holidays || []).map((h) => (
                  <div key={h.id} className="p-3.5 rounded-xl bg-white border border-[#172B5014] flex items-center justify-between shadow-2xs">
                    <div>
                      <p className="text-xs font-bold text-[#172B50]">{h.name}</p>
                      <p className="text-[11px] text-[#172B50]/60 mt-0.5">{h.date} • {h.type}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteAcademicHoliday(h.id)}
                      className="p-1 rounded text-[#172B50]/40 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Remove holiday"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. TAB 5: TERMS & CONDITIONS (Governance & Policies)         */}
      {/* ============================================================ */}
      {activeTab === 'terms' && (
        <TermsManagementModule embedded={true} />
      )}

      {/* ============================================================ */}
      {/* 8. TAB 6: SETTINGS AUDIT LOG VIEW                            */}
      {/* ============================================================ */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[26px] p-6 border border-[#172B5014] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight">
                  Configuration Audit Trail
                </h2>
                <p className="text-xs sm:text-sm text-[#172B50]/70 font-medium mt-1">
                  Immutable historical log of changes across academy profile, centers, calendar and governance.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search audit trail..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-[#172B5020] text-xs outline-none focus:ring-2 focus:ring-[#F4510B] w-48 sm:w-60"
                />

                <button
                  type="button"
                  onClick={handleExportAuditCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B25] text-xs font-black hover:bg-[#F4510B] hover:text-white transition-all cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#172B5014] bg-[#F8FAFC] text-[#172B50]/70 font-bold">
                    <th className="py-3 px-3">Date &amp; Time</th>
                    <th className="py-3 px-3">Administrator</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Action</th>
                    <th className="py-3 px-3">Field</th>
                    <th className="py-3 px-3">Old Value</th>
                    <th className="py-3 px-3">New Value</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B500C]">
                  {(data.settingsAuditLogs || [])
                    .filter((l) => {
                      if (!auditSearch.trim()) return true;
                      const q = auditSearch.toLowerCase();
                      return (
                        l.category?.toLowerCase().includes(q) ||
                        l.action?.toLowerCase().includes(q) ||
                        l.field?.toLowerCase().includes(q) ||
                        l.user?.toLowerCase().includes(q)
                      );
                    })
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-[#172B50]/80">
                          {log.timestamp
                            ? new Date(log.timestamp).toLocaleString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '—'}
                        </td>
                        <td className="py-3 px-3 font-extrabold text-[#172B50]">
                          {log.user}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {log.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-[#172B50]">
                          {log.action}
                        </td>
                        <td className="py-3 px-3 text-[#172B50]/80">
                          {log.field}
                        </td>
                        <td className="py-3 px-3 text-[#172B50]/60 max-w-[140px] truncate" title={log.oldValue}>
                          {log.oldValue}
                        </td>
                        <td className="py-3 px-3 font-bold text-[#F4510B] max-w-[160px] truncate" title={log.newValue}>
                          {log.newValue}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                            <Check className="w-2.5 h-2.5" />
                            <span>{log.status || 'Verified'}</span>
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
      {/* 8. MODAL: ADD / EDIT ACADEMY CENTER (10 Required Fields)     */}
      {/* ============================================================ */}
      {isCenterModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#172B50]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-[#172B5014] shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#172B5014]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#F4510B]" />
                <h3 className="text-lg font-black text-[#172B50]">
                  {editingCenter ? `Edit Center: ${editingCenter.name}` : 'Add New Academy Center'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCenterModalOpen(false)}
                className="p-1 rounded-lg text-[#172B50]/60 hover:text-[#172B50] hover:bg-[#172B5010] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCenter} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-[#172B50] mb-1">Center Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adyar Center"
                    value={centerForm.name}
                    onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#172B5025] font-bold outline-none focus:ring-2 focus:ring-[#F4510B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#172B50] mb-1">Center Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LS-ADY"
                    value={centerForm.code}
                    onChange={(e) => setCenterForm({ ...centerForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#172B5025] font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-[#F4510B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#172B50] mb-1">Full Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 24 Gandhi Road, Adyar"
                  value={centerForm.address}
                  onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#172B5025] outline-none focus:ring-2 focus:ring-[#F4510B]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#172B50] mb-1">City</label>
                  <input
                    type="text"
                    value={centerForm.city}
                    onChange={(e) => setCenterForm({ ...centerForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#172B5025] outline-none focus:ring-2 focus:ring-[#F4510B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#172B50] mb-1">State</label>
                  <input
                    type="text"
                    value={centerForm.state}
                    onChange={(e) => setCenterForm({ ...centerForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#172B5025] outline-none focus:ring-2 focus:ring-[#F4510B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#172B50] mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={centerForm.pinCode}
                    onChange={(e) => setCenterForm({ ...centerForm, pinCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#172B5025] outline-none focus:ring-2 focus:ring-[#F4510B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#172B50] mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Center Coordinator"
                    value={centerForm.contactPerson}
                    onChange={(e) => setCenterForm({ ...centerForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#172B5025] outline-none focus:ring-2 focus:ring-[#F4510B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#172B50] mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98840 55441"
                    value={centerForm.contactPhone}
                    onChange={(e) => setCenterForm({ ...centerForm, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#172B5025] outline-none focus:ring-2 focus:ring-[#F4510B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#172B50] mb-1">Operating Days</label>
                  <input
                    type="text"
                    value={centerForm.operatingDays}
                    onChange={(e) => setCenterForm({ ...centerForm, operatingDays: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#172B5025] outline-none focus:ring-2 focus:ring-[#F4510B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#172B50] mb-1">Operating Timings</label>
                  <input
                    type="text"
                    value={centerForm.operatingHours}
                    onChange={(e) => setCenterForm({ ...centerForm, operatingHours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#172B5025] outline-none focus:ring-2 focus:ring-[#F4510B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#172B50] mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={centerForm.capacity}
                    onChange={(e) => setCenterForm({ ...centerForm, capacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#172B5025] font-bold outline-none focus:ring-2 focus:ring-[#F4510B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#172B50] mb-1">
                  Available Facilities &amp; Courts (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Main Turf Ground, Training Court A, Practice Arena B"
                  value={centerForm.facilities}
                  onChange={(e) => setCenterForm({ ...centerForm, facilities: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#172B5025] outline-none focus:ring-2 focus:ring-[#F4510B]"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFF9F5] border border-[#F4510B18]">
                <div>
                  <p className="font-bold text-[#172B50]">Operating Status</p>
                  <p className="text-[11px] text-[#172B50]/60">
                    Deactivating preserves all historical batches and attendance.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCenterForm({
                      ...centerForm,
                      status: centerForm.status === 'Active' ? 'Inactive' : 'Active'
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                    centerForm.status === 'Active'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {centerForm.status}
                </button>
              </div>

              <div className="pt-3 border-t border-[#172B5014] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCenterModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F4510B] text-white text-xs font-black hover:brightness-110 active:scale-95 shadow-md shadow-[#F4510B]/25 cursor-pointer"
                >
                  {editingCenter ? 'Save Center' : 'Create Center'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 9. MODAL: CONFIRM GENERAL INFO SAVE                          */}
      {/* ============================================================ */}
      {isConfirmSaveOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#172B50]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#172B5014] shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 rounded-xl bg-amber-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-[#172B50]">
                Confirm Academy Configuration Update
              </h3>
            </div>

            <p className="text-xs text-[#172B50]/80 leading-relaxed">
              Updating these official academy details will immediately synchronize across all Admin, Coach, Super Coach, and Parent portals. A timestamped audit entry will be logged under your administrator credentials.
            </p>

            <div className="pt-3 border-t border-[#172B5014] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmSaveOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmSaveInfo}
                className="px-5 py-2 rounded-xl bg-[#F4510B] text-white text-xs font-black hover:brightness-110 active:scale-95 shadow-md shadow-[#F4510B]/25 cursor-pointer"
              >
                Confirm &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 10. MODAL: ADD ACADEMIC HOLIDAY                             */}
      {/* ============================================================ */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#172B50]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 border border-[#172B5014] shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#172B5014]">
              <h3 className="text-sm font-black text-[#172B50]">Add Scheduled Holiday</h3>
              <button
                type="button"
                onClick={() => setIsHolidayModalOpen(false)}
                className="p-1 rounded text-[#172B50]/60 hover:text-[#172B50]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#172B50] mb-1">Holiday Name</label>
                <input
                  type="text"
                  placeholder="e.g. Festival Holiday Break"
                  value={newHolidayForm.name}
                  onChange={(e) => setNewHolidayForm({ ...newHolidayForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#172B5020] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172B50] mb-1">Date</label>
                <input
                  type="date"
                  value={newHolidayForm.date}
                  onChange={(e) => setNewHolidayForm({ ...newHolidayForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#172B5020] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172B50] mb-1">Holiday Category</label>
                <select
                  value={newHolidayForm.type}
                  onChange={(e) => setNewHolidayForm({ ...newHolidayForm, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#172B5020] outline-none"
                >
                  <option value="National Holiday">National Holiday</option>
                  <option value="Festival Holiday">Festival Holiday</option>
                  <option value="Academy Holiday">Academy Holiday</option>
                  <option value="Weather / Emergency Break">Weather / Emergency Break</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-[#172B5014] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsHolidayModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#172B50] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newHolidayForm.name.trim()) return;
                  addAcademicHoliday(newHolidayForm);
                  setIsHolidayModalOpen(false);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-black bg-[#F4510B] text-white"
              >
                Add Holiday
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
