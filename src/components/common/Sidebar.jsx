import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  Users, 
  GraduationCap, 
  User, 
  Calendar, 
  CreditCard, 
  CalendarCheck, 
  Trophy, 
  CalendarX, 
  MessageSquare, 
  Award, 
  BarChart2, 
  MoreVertical,
  X,
  LogOut,
  RefreshCw,
  Clock,
  Zap,
  PlusCircle,
  UserPlus,
  Star,
  UserCheck,
  AlertCircle,
  CheckSquare,
  Medal,
  UserX,
  History,
  CheckCircle2,
  FileText,
  ShieldCheck,
  TrendingUp,
  PieChart,
  ChevronRight,
  Pin,
  PinOff
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

// Comprehensive submenu configuration for all 13 Academy Management items
const submenuConfig = {
  dashboard: {
    title: 'Dashboard Overview',
    items: [
      { id: 'dashboard', label: 'Command Center', desc: 'Real-time KPIs & operational metrics', icon: Zap },
      { id: 'dashboard', label: 'Live Sessions', desc: 'Current ongoing batches & courts', icon: Clock },
      { id: 'dashboard', label: 'Growth & Turnout', desc: 'Revenue growth & attendance charts', icon: TrendingUp },
    ]
  },
  enquiries: {
    title: 'Enquiry Management',
    items: [
      { id: 'enquiries', label: 'Active Pipeline', desc: 'Track prospective spartans & status', icon: Users },
      { id: 'enquiries', label: 'Trial Sessions', desc: 'Booked demo trials & appointments', icon: CalendarCheck },
      { id: 'enquiries', label: 'Capture New Lead', desc: 'Walk-in or telephone enquiry registration', icon: PlusCircle },
    ]
  },
  students: {
    title: 'Student Management',
    items: [
      { id: 'students', label: 'Student Directory', desc: 'Full active roster, contacts & medical', icon: Users },
      { id: 'students', label: 'Enroll Spartan', desc: 'Quick onboarding & batch assignment', icon: UserPlus },
      { id: 'students', label: 'Rank & Milestones', desc: 'Skill levels & belt progression', icon: Award },
    ]
  },
  parents: {
    title: 'Parent Management',
    items: [
      { id: 'parents', label: 'Parent Directory', desc: 'Guardian records & primary emergency', icon: Users },
      { id: 'parents', label: 'Broadcasts & SMS', desc: 'Academy circulars & announcements', icon: MessageSquare },
      { id: 'parents', label: 'Parent Feedback', desc: 'Satisfaction ratings & review log', icon: Star },
    ]
  },
  coaches: {
    title: 'Coach Management',
    items: [
      { id: 'coaches', label: 'Staff Roster', desc: 'Head coaches & discipline specialists', icon: UserCheck },
      { id: 'coaches', label: 'Batch Allocation', desc: 'Arena schedule & trainer assignments', icon: Calendar },
      { id: 'coaches', label: 'Certifications', desc: 'FIG credentials & safety badges', icon: Award },
    ]
  },
  classes: {
    title: 'Programs & Classes',
    items: [
      { id: 'classes', label: 'All Disciplines', desc: 'Gymnastics, Martial Arts & Athletics', icon: Calendar },
      { id: 'classes', label: 'Weekly Timetable', desc: 'Time slots & court allocations', icon: Clock },
      { id: 'classes', label: 'Batch Availability', desc: 'Slot capacities & waiting lists', icon: Users },
    ]
  },
  payments: {
    title: 'Payments & Billing',
    items: [
      { id: 'payments', label: 'Transactions Ledger', desc: 'Paid invoices & fee receipts', icon: CreditCard },
      { id: 'payments', label: 'Pending Dues', desc: 'Outstanding fee recovery & alerts', icon: AlertCircle },
      { id: 'payments', label: 'Record Fee', desc: 'Log cash, UPI or card payment', icon: PlusCircle },
    ]
  },
  attendance: {
    title: 'Attendance Tracking',
    items: [
      { id: 'attendance', label: 'Daily Register', desc: 'Real-time check-in & check-out', icon: CheckSquare },
      { id: 'attendance', label: 'Batch History', desc: 'Past attendance sheets & attendance %', icon: CalendarCheck },
      { id: 'attendance', label: 'Absence Alerts', desc: 'Automated guardian notifications', icon: AlertCircle },
    ]
  },
  competitions: {
    title: 'Competitions & Cups',
    items: [
      { id: 'competitions', label: 'Tournament Calendar', desc: 'State cups, inter-branch championships', icon: Trophy },
      { id: 'competitions', label: 'Squad Selection', desc: 'Team rosters & competition lineups', icon: Users },
      { id: 'competitions', label: 'Medal Tally', desc: 'Academy trophies & podium finishes', icon: Medal },
    ]
  },
  leaves: {
    title: 'Leave Management',
    items: [
      { id: 'leaves', label: 'Student Leaves', desc: 'Absence slips & doctor requests', icon: CalendarX },
      { id: 'leaves', label: 'Coach Leaves', desc: 'Staff leave & substitute cover', icon: UserX },
      { id: 'leaves', label: 'Leave History', desc: 'Past approvals & attendance credit', icon: History },
    ]
  },
  feedback: {
    title: 'Feedback & Reviews',
    items: [
      { id: 'feedback', label: 'Parent Reviews', desc: 'Class satisfaction & coach ratings', icon: Star },
      { id: 'feedback', label: 'Coach Notes', desc: 'Student drill assessments & remarks', icon: MessageSquare },
      { id: 'feedback', label: 'Resolution Desk', desc: 'Queries, requests & complaints log', icon: CheckCircle2 },
    ]
  },
  certificates: {
    title: 'Certificates & Awards',
    items: [
      { id: 'certificates', label: 'Issue Certificates', desc: 'Grade advancement & achievement awards', icon: Award },
      { id: 'certificates', label: 'Brand Templates', desc: 'Official Spartan certificate designs', icon: FileText },
      { id: 'certificates', label: 'Verified Badges', desc: 'Digital QR credentials & passports', icon: ShieldCheck },
    ]
  },
  reports: {
    title: 'Reports & Analytics',
    items: [
      { id: 'reports', label: 'Financial Analytics', desc: 'Revenue breakdown & collection rate', icon: BarChart2 },
      { id: 'reports', label: 'Retention & Growth', desc: 'Enrollment funnels & dropout rates', icon: TrendingUp },
      { id: 'reports', label: 'Slot Utilization', desc: 'Batch occupancy & coach efficiency', icon: PieChart },
    ]
  }
};

export default function Sidebar() {
  const { 
    currentPortal, 
    currentView, 
    setCurrentView, 
    sidebarOpen, 
    setSidebarOpen, 
    logout, 
    resetAllData,
    addToast
  } = useCrm();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Mouse hover state: when mouse enters navbar, opens full view; when mouse leaves, closes!
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  // Is full view currently visible? (on hover, or if user pins it, or on mobile)
  const isFullView = isHovered || isPinned;

  // Interactive hover states for floating submenu
  const [hoveredItem, setHoveredItem] = useState(null);
  const [submenuPos, setSubmenuPos] = useState({ top: 0, left: 260 });
  
  const closeTimerRef = useRef(null);
  const navbarLeaveTimerRef = useRef(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (navbarLeaveTimerRef.current) clearTimeout(navbarLeaveTimerRef.current);
    };
  }, []);

  // Exact 12 navigation items matching reference under ACADEMY MANAGEMENT
  const adminNavItems = [
    { id: 'enquiries', label: 'Enquiry Management', icon: Users },
    { id: 'students', label: 'Student Management', icon: GraduationCap },
    { id: 'parents', label: 'Parent Management', icon: Users },
    { id: 'coaches', label: 'Coach Management', icon: User },
    { id: 'classes', label: 'Programs & Classes', icon: Calendar },
    { id: 'payments', label: 'Payments & Billing', icon: CreditCard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'competitions', label: 'Competitions', icon: Trophy },
    { id: 'leaves', label: 'Leave Management', icon: CalendarX },
    { id: 'feedback', label: 'Feedback & Reviews', icon: MessageSquare },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart2 },
  ];

  // Parent portal navigation items in same dark aesthetic
  const parentNavItems = [
    { id: 'children', label: 'My Children', icon: GraduationCap },
    { id: 'classes', label: 'Classes & Schedule', icon: Calendar },
    { id: 'attendance', label: 'Attendance Record', icon: CalendarCheck },
    { id: 'payments', label: 'Payments & Receipts', icon: CreditCard },
    { id: 'competitions', label: 'Competitions & Cups', icon: Trophy },
    { id: 'leaves', label: 'Apply Leave', icon: CalendarX },
    { id: 'certificates', label: 'Certificates & Badges', icon: Award },
    { id: 'communication', label: 'Announcements', icon: MessageSquare },
    { id: 'feedback', label: 'Give Feedback', icon: MessageSquare },
  ];

  // Coach portal navigation items in same dark aesthetic
  const coachNavItems = [
    { id: 'classes', label: 'My Batches & Drills', icon: Calendar },
    { id: 'students', label: 'My Student Roster', icon: GraduationCap },
    { id: 'attendance', label: 'Mark Attendance', icon: CalendarCheck },
    { id: 'evaluations', label: 'Skill Evaluations', icon: Trophy },
    { id: 'competitions', label: 'Tournaments & Squads', icon: Award },
    { id: 'leaves', label: 'Apply Coach Leave', icon: CalendarX },
    { id: 'induction', label: 'Spartan Drills Guide', icon: Calendar },
    { id: 'announcements', label: 'Academy Circulars', icon: MessageSquare },
  ];

  // Section title & items depending on active portal
  let sectionTitle = 'ACADEMY MANAGEMENT';
  let navItems = adminNavItems;
  let profileInitials = 'LS';
  let profileName = 'Little Spartans';
  let profileRole = 'Admin / Super Admin';

  if (currentPortal === 'parent') {
    sectionTitle = 'PARENT WORKSPACE';
    navItems = parentNavItems;
    profileInitials = 'RS';
    profileName = 'Dr. Rohan Sharma';
    profileRole = 'Parent Account';
  } else if (currentPortal === 'coach') {
    sectionTitle = 'COACH WORKSPACE';
    navItems = coachNavItems;
    profileInitials = 'VS';
    profileName = 'Coach Vikram Singh';
    profileRole = 'Head Coach - Athletics';
  }

  // Navbar mouse enter: opens full view
  const handleNavbarMouseEnter = () => {
    if (navbarLeaveTimerRef.current) {
      clearTimeout(navbarLeaveTimerRef.current);
      navbarLeaveTimerRef.current = null;
    }
    setIsHovered(true);
  };

  // Navbar mouse leave: closes back to compact
  const handleNavbarMouseLeave = () => {
    navbarLeaveTimerRef.current = setTimeout(() => {
      setIsHovered(false);
      setHoveredItem(null);
    }, 180);
  };

  // Hover handlers for menu item
  const handleItemMouseEnter = (itemId, event) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (navbarLeaveTimerRef.current) {
      clearTimeout(navbarLeaveTimerRef.current);
      navbarLeaveTimerRef.current = null;
    }
    setIsHovered(true);

    const rect = event.currentTarget.getBoundingClientRect();
    const estimatedHeight = 240;
    const top = Math.max(12, Math.min(rect.top - 6, window.innerHeight - estimatedHeight - 16));
    
    // Position floating panel cleanly adjacent to the current sidebar edge
    const leftEdge = isFullView ? 260 : 76;
    setSubmenuPos({ top, left: leftEdge });
    setHoveredItem(itemId);
  };

  const handleItemMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 180);
  };

  // Hover handlers for floating submenu panel
  const handleSubmenuMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (navbarLeaveTimerRef.current) {
      clearTimeout(navbarLeaveTimerRef.current);
      navbarLeaveTimerRef.current = null;
    }
    setIsHovered(true);
  };

  const handleSubmenuMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 180);
    navbarLeaveTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 220);
  };

  // Submenu click handler
  const handleSubmenuClick = (viewId, label) => {
    setCurrentView(viewId);
    setHoveredItem(null);
    setSidebarOpen(false);
    if (addToast) {
      addToast(`Opened ${label}`);
    }
  };

  // Active submenu data
  const currentSubmenu = hoveredItem ? submenuConfig[hoveredItem] : null;

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* 
        LEFT SIDEBAR:
        - When mouse enters: OPENS FULL VIEW (w-64 = 256px).
        - When mouse leaves: CLOSES (w-[72px]).
        - In flex layout (shrink-0): right side smoothly adapts without EVER overlapping or cutting off content!
        - Between nav bar and right side: transparent vertical dividing line (border-r border-white/10).
      */}
      <aside 
        onMouseEnter={handleNavbarMouseEnter}
        onMouseLeave={handleNavbarMouseLeave}
        className={`fixed inset-y-0 left-0 z-40 bg-[#0B0F17] text-white border-r border-white/10 flex flex-col font-sans transition-[width,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none lg:static lg:inset-auto lg:h-full lg:shrink-0 lg:z-auto ${
          isFullView ? 'w-64' : 'w-[72px]'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Header: Full Brand Logo + ZenConnect Badge when full, Compact LS Emblem when closed */}
        <div className="px-3.5 py-3.5 flex items-center justify-between border-b border-white/10 shrink-0 h-16 overflow-hidden">
          {isFullView ? (
            <div className="flex items-center justify-between w-full animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 min-w-0">
                <img 
                  src="/assets/little-spartans-logo-4k.png" 
                  alt="Little Spartans" 
                  className="h-8 sm:h-9 w-auto object-contain pointer-events-none select-none drop-shadow-xs"
                  style={{ 
                    imageRendering: '-webkit-optimize-contrast',
                    transform: 'translateZ(0)'
                  }}
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-2 py-0.5 rounded-full border border-[#F4510B] text-white text-[10.5px] font-semibold tracking-wide bg-transparent shadow-xs select-none">
                  ZenConnect
                </span>
                {/* Pin toggle to lock full view permanently if desired */}
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-1 rounded-md transition-colors ${
                    isPinned ? 'text-[#F4510B] bg-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                  title={isPinned ? "Unpin navbar (closes when mouse leaves)" : "Pin navbar permanently in full view"}
                  aria-label="Pin navbar"
                >
                  {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                </button>
                {/* Close button on mobile */}
                <button 
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-1 text-white/60 hover:text-white rounded-lg cursor-pointer"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center animate-in fade-in duration-200">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A2234] to-[#0E131F] border border-[#F4510B]/40 flex items-center justify-center shadow-sm hover:border-[#F4510B] transition-colors">
                <span className="text-[#F4510B] font-black text-sm tracking-tighter">LS</span>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Area with independent vertical scroll */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          {/* Item 1: Dashboard */}
          <button
            type="button"
            onClick={() => {
              setCurrentView('dashboard');
              setSidebarOpen(false);
            }}
            onMouseEnter={(e) => handleItemMouseEnter('dashboard', e)}
            onMouseLeave={handleItemMouseLeave}
            className={`w-full flex items-center ${isFullView ? 'justify-between px-3' : 'justify-center px-0'} py-2.5 rounded-xl text-[13.5px] transition-all duration-200 group cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-[#F4510B] text-white font-semibold shadow-md shadow-[#F4510B]/30'
                : hoveredItem === 'dashboard'
                ? 'bg-white/10 text-white'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            title={!isFullView ? "Dashboard" : undefined}
          >
            <div className={`flex items-center ${isFullView ? 'gap-3 min-w-0' : 'justify-center'}`}>
              <Home 
                className={`w-5 h-5 shrink-0 transition-colors ${
                  currentView === 'dashboard' ? 'text-white' : 'text-white/80 group-hover:text-white'
                }`} 
                strokeWidth={1.75} 
              />
              {isFullView && (
                <span className="truncate whitespace-nowrap animate-in fade-in duration-200">
                  Dashboard
                </span>
              )}
            </div>
            {isFullView && (
              <ChevronRight 
                className={`w-3.5 h-3.5 transition-all ${
                  hoveredItem === 'dashboard' ? 'opacity-100 translate-x-0 text-white' : 'opacity-0 -translate-x-1'
                }`}
              />
            )}
          </button>

          {/* Section Divider & Header: ACADEMY MANAGEMENT */}
          <div className={`pt-2.5 pb-1 ${isFullView ? 'px-2' : 'px-1'}`}>
            <div className="border-t border-white/10 mb-2" />
            {isFullView ? (
              <span className="text-[10.5px] font-bold tracking-widest text-[#8A99AD] uppercase block truncate animate-in fade-in duration-200">
                {sectionTitle}
              </span>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 mx-auto my-0.5" />
            )}
          </div>

          {/* Navigation Items (The 12 items matching reference) */}
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isHoveredItem = hoveredItem === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
                onMouseEnter={(e) => handleItemMouseEnter(item.id, e)}
                onMouseLeave={handleItemMouseLeave}
                className={`w-full flex items-center ${isFullView ? 'justify-between px-3' : 'justify-center px-0'} py-2 rounded-xl text-[13.5px] transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? 'bg-[#F4510B] text-white font-semibold shadow-md shadow-[#F4510B]/30'
                    : isHoveredItem
                    ? 'bg-white/10 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
                title={!isFullView ? item.label : undefined}
              >
                <div className={`flex items-center ${isFullView ? 'gap-3 min-w-0' : 'justify-center'}`}>
                  <Icon 
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-white/75 group-hover:text-white'
                    }`} 
                    strokeWidth={1.75} 
                  />
                  {isFullView && (
                    <span className="truncate whitespace-nowrap animate-in fade-in duration-200">
                      {item.label}
                    </span>
                  )}
                </div>
                {isFullView && (
                  <ChevronRight 
                    className={`w-3.5 h-3.5 transition-all ${
                      isHoveredItem ? 'opacity-100 translate-x-0 text-white' : 'opacity-0 -translate-x-1'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Profile Footer: LS Teal circle + Little Spartans + Admin / Super Admin + 3 dots */}
        <div className="p-3 border-t border-white/10 bg-[#0B0F17] relative shrink-0">
          <div className={`flex items-center ${isFullView ? 'justify-between gap-2.5' : 'justify-center'}`}>
            <div 
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-9 h-9 rounded-full bg-[#00D1C1] text-[#0A0E17] font-black text-sm flex items-center justify-center shrink-0 shadow-sm cursor-pointer hover:ring-2 hover:ring-white/20 transition-all"
              title={profileName}
            >
              {profileInitials}
            </div>
            {isFullView && (
              <>
                <div className="flex-1 min-w-0 animate-in fade-in duration-200">
                  <p className="text-[13px] font-bold text-white truncate leading-tight">
                    {profileName}
                  </p>
                  <p className="text-[11px] text-[#8A99AD] truncate leading-tight mt-0.5">
                    {profileRole}
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="text-[#8A99AD] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  title="Profile Options"
                  aria-label="Profile Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Quick profile popup */}
          {profileMenuOpen && (
            <div className={`absolute bottom-16 ${isFullView ? 'right-3 w-52' : 'left-14 w-52'} bg-[#161B26] border border-white/15 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95`}>
              <button
                type="button"
                onClick={() => {
                  resetAllData();
                  setProfileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-white/90 hover:bg-white/10 rounded-lg flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#F4510B]" />
                <span>Reset Mock Data</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setProfileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#F4510B] hover:bg-white/10 rounded-lg flex items-center gap-2 mt-1 border-t border-white/10 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================ */}
      {/* FLOATING SUBMENU PANEL: Dark Glassmorphism with Smooth Hover  */}
      {/* ============================================================ */}
      {currentSubmenu && (
        <div 
          className="fixed z-50 min-w-[280px] max-w-[320px] bg-[#0E131F]/95 backdrop-blur-xl border border-white/12 rounded-2xl shadow-2xl p-2.5 animate-submenu pointer-events-auto hidden lg:block"
          style={{ 
            top: `${submenuPos.top}px`, 
            left: `${submenuPos.left}px` 
          }}
          onMouseEnter={handleSubmenuMouseEnter}
          onMouseLeave={handleSubmenuMouseLeave}
        >
          {/* Invisible hover bridge connecting sidebar item to submenu to prevent cursor drop */}
          <div className="absolute -left-3 top-0 bottom-0 w-3.5 bg-transparent" />

          {/* Submenu Header */}
          <div className="px-3 pt-2 pb-2.5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F4510B] animate-pulse" />
              <span className="text-[12px] font-bold text-white tracking-wide uppercase">
                {currentSubmenu.title}
              </span>
            </div>
            <span className="text-[10px] text-white/50 font-semibold tracking-wider uppercase">
              Module
            </span>
          </div>

          {/* Submenu Child Items */}
          <div className="py-1.5 space-y-1">
            {currentSubmenu.items.map((sub, idx) => {
              const SubIcon = sub.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSubmenuClick(sub.id, sub.label)}
                  className="w-full text-left p-2.5 rounded-xl transition-all duration-200 group flex items-start gap-3 hover:bg-[#F4510B] text-white cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 text-white shrink-0 transition-colors mt-0.5">
                    <SubIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-white group-hover:text-white flex items-center justify-between">
                      <span>{sub.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-white/80" />
                    </div>
                    <p className="text-[11px] text-white/70 group-hover:text-white/90 leading-tight mt-0.5 truncate">
                      {sub.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}