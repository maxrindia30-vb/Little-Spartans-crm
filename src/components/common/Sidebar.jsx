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
  PinOff,
  Database,
  Download,
  Settings,
  HardDrive
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

// Comprehensive submenu configuration matching the Master Specification
const submenuConfig = {
  // 1. Dashboard
  dashboard: {
    title: 'Command Center',
    items: [
      { parentId: 'dashboard', subTab: '', label: 'Live Operations', desc: 'Real-time KPIs & operational metrics', icon: Zap },
      { parentId: 'dashboard', subTab: '', label: 'Ongoing Batches', desc: 'Current court sessions & attendance %', icon: Clock },
      { parentId: 'dashboard', subTab: '', label: 'Revenue Velocity', desc: 'Monthly tuition growth & new admissions', icon: TrendingUp },
    ]
  },

  // 2. Enquiries
  enquiries: {
    title: 'Enquiry Management',
    items: [
      { parentId: 'enquiries', subTab: 'all', label: 'Active Pipeline', desc: 'Track prospective spartans & conversion', icon: Users },
      { parentId: 'enquiries', subTab: 'trials', label: 'Trial Sessions', desc: 'Booked demo trials & appointments', icon: CalendarCheck },
      { parentId: 'enquiries', subTab: 'new', label: 'Capture New Lead', desc: 'Walk-in or telephone enquiry registration', icon: PlusCircle },
    ]
  },

  // 3. People Management (Students, Parents, Coaches, Account Management)
  people: {
    title: 'People Management',
    items: [
      { parentId: 'people', subTab: 'students', label: 'Students Roster', desc: 'Full active roster, contacts & medical records', icon: GraduationCap },
      { parentId: 'people', subTab: 'parents', label: 'Parents Directory', desc: 'Guardian records & linked children', icon: Users },
      { parentId: 'people', subTab: 'coaches', label: 'Coaching Roster', desc: 'Head coaches & discipline specialists', icon: UserCheck },
      { parentId: 'people', subTab: 'accounts', label: 'Admin-Only Accounts', desc: 'Create credentials & temp passwords (No public signup)', icon: ShieldCheck },
    ]
  },

  // 4. Programs & Classes (Sports Programs, Batches, Class Schedules, Coach Assignments)
  programs: {
    title: 'Programs & Classes',
    items: [
      { parentId: 'programs', subTab: 'sports_programs', label: 'Sports Programs', desc: 'Programs, age groups, duration & locations', icon: Calendar },
      { parentId: 'programs', subTab: 'batches', label: 'Training Batches', desc: 'Capacities, enrolled athletes & waitlists', icon: Users },
      { parentId: 'programs', subTab: 'schedules', label: 'Class Schedules', desc: 'Daily, weekly & calendar timetable', icon: Clock },
      { parentId: 'programs', subTab: 'coach_assignments', label: 'Coach Assignments', desc: 'Lead & assistant trainer allocations', icon: UserCheck },
    ]
  },

  // 5. Attendance & Compensation (Student Attendance, Coach Attendance, Compensation Classes)
  attendance_compensation: {
    title: 'Attendance & Compensation',
    items: [
      { parentId: 'attendance_compensation', subTab: 'student_att', label: 'Student Attendance', desc: 'Daily check-in register & absence alerts', icon: CalendarCheck },
      { parentId: 'attendance_compensation', subTab: 'coach_att', label: 'Coach Attendance', desc: 'Staff check-ins & arena punch-ins', icon: UserCheck },
      { parentId: 'attendance_compensation', subTab: 'student_comp', label: 'Student Compensation', desc: 'Book replacement slots for missed classes', icon: RefreshCw },
      { parentId: 'attendance_compensation', subTab: 'coach_comp', label: 'Coach Compensation', desc: 'Substitute coverage & payout logs', icon: Clock },
      { parentId: 'attendance_compensation', subTab: 'audit', label: 'Compensation History', desc: 'Audit log of past approvals & credits', icon: History },
    ]
  },

  // 6. Fees & Payments (Fee Structures, Student Fee Assignments, Invoices, Payments, Pending Fees)
  fees_payments: {
    title: 'Fees & Payments',
    items: [
      { parentId: 'fees_payments', subTab: 'structures', label: 'Fee Structures', desc: 'Monthly, quarterly, admission & kit fees', icon: CreditCard },
      { parentId: 'fees_payments', subTab: 'assignments', label: 'Student Assignments', desc: 'Assigned plans, sibling & custom discounts', icon: Users },
      { parentId: 'fees_payments', subTab: 'invoices', label: 'Invoices & Receipts', desc: 'Official Little Spartans receipts', icon: FileText },
      { parentId: 'fees_payments', subTab: 'pending', label: 'Pending Dues Recovery', desc: 'Outstanding balances & payment reminders', icon: AlertCircle },
    ]
  },

  // 7. Sports & Events (Competitions, Registrations, Results, Certificates)
  sports_events: {
    title: 'Sports & Events',
    items: [
      { parentId: 'sports_events', subTab: 'competitions', label: 'Championships & Cups', desc: 'State tournaments & inter-branch cups', icon: Trophy },
      { parentId: 'sports_events', subTab: 'registrations', label: 'Squad Registrations', desc: 'Participant rosters & weight categories', icon: Users },
      { parentId: 'sports_events', subTab: 'results', label: 'Podium & Results', desc: 'Medal tallies & leaderboard rankings', icon: Medal },
      { parentId: 'sports_events', subTab: 'certificates', label: 'Official Certificates', desc: 'Issue verifiable branded diplomas', icon: Award },
    ]
  },

  // 8. Communication (Announcements, Feedback, Parent Communication, Support Requests)
  communication: {
    title: 'Academy Communication',
    items: [
      { parentId: 'communication', subTab: 'announcements', label: 'Announcements & Circulars', desc: 'Broadcast academy notices & alerts', icon: MessageSquare },
      { parentId: 'communication', subTab: 'feedback', label: 'Feedback & Reviews', desc: 'Parent satisfaction & coach notes', icon: Star },
      { parentId: 'communication', subTab: 'parent_comm', label: 'Parent Direct Chat', desc: 'Direct guardian messaging channel', icon: Users },
      { parentId: 'communication', subTab: 'support', label: 'Support & Tickets', desc: 'Operational assistance desk', icon: CheckCircle2 },
    ]
  },

  // 9. Reports & Settings (Analytics, Data Export, Backup & Recovery, User Permissions, Settings)
  reports_settings: {
    title: 'Reports & Settings',
    items: [
      { parentId: 'reports_settings', subTab: 'analytics', label: 'Academy Analytics', desc: 'Retention rates, revenues & funnel KPIs', icon: BarChart2 },
      { parentId: 'reports_settings', subTab: 'export', label: 'Raw Data Export', desc: 'Download CSV, Excel or PDF datasets', icon: Download },
      { parentId: 'reports_settings', subTab: 'backup', label: 'Backup & Recovery', desc: 'Daily automated snapshots & manual backup', icon: HardDrive },
      { parentId: 'reports_settings', subTab: 'permissions', label: 'Permissions (RBAC)', desc: 'Role clearance matrix & security governance', icon: ShieldCheck },
      { parentId: 'reports_settings', subTab: 'settings', label: 'Academy Settings', desc: 'Little Spartans branding & center config', icon: Settings },
    ]
  },

  // Parent Portal Submenus
  children: {
    title: 'My Children',
    items: [
      { parentId: 'children', subTab: '', label: 'Child Profiles', desc: 'View details, health & emergency contacts', icon: GraduationCap },
      { parentId: 'progress', subTab: '', label: 'Skill Progression', desc: 'Belt milestones & physical assessments', icon: Award },
    ]
  },
  classes: {
    title: 'Classes & Batches',
    items: [
      { parentId: 'classes', subTab: '', label: 'Weekly Timetable', desc: 'Schedule, arena courts & lead coaches', icon: Calendar },
      { parentId: 'attendance_compensation', subTab: '', label: 'Makeup Sessions', desc: 'Book compensation classes for absences', icon: RefreshCw },
    ]
  }
};

export default function Sidebar() {
  const { 
    currentPortal, 
    currentView, 
    setCurrentView,
    activeSubTab,
    setActiveSubTab,
    navigateTo,
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

  // =========================================================================
  // 1. ADMIN NAVIGATION: STRICTLY 9 ITEMS (Master Development Prompt Section 3)
  // =========================================================================
  const adminNavItems = [
    { id: 'enquiries', label: 'Enquiries', icon: Users },
    { id: 'people', label: 'People Management', icon: GraduationCap },
    { id: 'programs', label: 'Programs & Classes', icon: Calendar },
    { id: 'attendance_compensation', label: 'Attendance & Compensation', icon: CalendarCheck },
    { id: 'fees_payments', label: 'Fees & Payments', icon: CreditCard },
    { id: 'sports_events', label: 'Sports & Events', icon: Trophy },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'reports_settings', label: 'Reports & Settings', icon: BarChart2 },
  ];

  // =========================================================================
  // 2. COACH NAVIGATION: STRICTLY 8 ITEMS (Master Development Prompt Section 3)
  // =========================================================================
  const coachNavItems = [
    { id: 'classes', label: 'My Classes', icon: Calendar },
    { id: 'students', label: 'My Students', icon: GraduationCap },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'evaluations', label: 'Student Performance', icon: Award },
    { id: 'compensation', label: 'Compensation Classes', icon: RefreshCw },
    { id: 'competitions', label: 'Sports & Events', icon: Trophy },
    { id: 'workspace', label: 'My Workspace', icon: UserCheck },
  ];

  // =========================================================================
  // 3. PARENT NAVIGATION: STRICTLY 8 ITEMS (Master Development Prompt Section 3)
  // =========================================================================
  const parentNavItems = [
    { id: 'children', label: 'My Children', icon: GraduationCap },
    { id: 'classes', label: 'Classes & Schedule', icon: Calendar },
    { id: 'attendance_compensation', label: 'Attendance & Compensation', icon: CalendarCheck },
    { id: 'fees_payments', label: 'Fees & Payments', icon: CreditCard },
    { id: 'progress', label: 'Progress & Achievements', icon: Award },
    { id: 'competitions', label: 'Sports & Events', icon: Trophy },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
  ];

  // Section title & items depending on active portal
  let sectionTitle = 'ACADEMY MANAGEMENT';
  let navItems = adminNavItems;
  let profileInitials = 'LS';
  let profileName = 'Little Spartans';
  let profileRole = 'Admin / Super Admin';

  if (currentPortal === 'parent') {
    sectionTitle = 'PARENT PORTAL';
    navItems = parentNavItems;
    profileInitials = 'RS';
    profileName = 'Dr. Rohan Sharma';
    profileRole = 'Parent Account';
  } else if (currentPortal === 'coach') {
    sectionTitle = 'COACH PORTAL';
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
    const estimatedHeight = 260;
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

  // Submenu click handler (supports both parent view & target sub-tab)
  const handleSubmenuClick = (parentId, subTab, label) => {
    if (navigateTo) {
      navigateTo(parentId, subTab);
    } else {
      setCurrentView(parentId);
      if (subTab && setActiveSubTab) setActiveSubTab(subTab);
      setSidebarOpen(false);
    }
    setHoveredItem(null);
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
          {/* Item 1: Dashboard (Always First Item) */}
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

          {/* Navigation Items (The remaining items: strictly max 8 items here + Dashboard = max 9 total) */}
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isHoveredItem = hoveredItem === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  if (item.id === 'programs' && setActiveSubTab) {
                    const validProgramTabs = ['sports_programs', 'batches', 'schedules', 'coach_assignments'];
                    if (!validProgramTabs.includes(activeSubTab)) {
                      setActiveSubTab('sports_programs');
                    }
                  }
                  setCurrentView(item.id);
                  if (submenuConfig[item.id]) {
                    handleItemMouseEnter(item.id, e);
                  }
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
          className="fixed z-50 min-w-[280px] max-w-[340px] bg-[#0E131F]/95 backdrop-blur-xl border border-white/12 rounded-2xl shadow-2xl p-2.5 animate-submenu pointer-events-auto hidden lg:block"
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
              Submenu
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
                  onClick={() => handleSubmenuClick(sub.parentId, sub.subTab, sub.label)}
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
