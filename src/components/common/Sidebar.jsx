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
  CalendarOff, 
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
  ChevronDown,
  Pin,
  PinOff,
  Database,
  Download,
  Settings,
  HardDrive,
  CalendarDays,
  Package,
  MapPin,
  Activity,
  Sparkles,
  LifeBuoy,
  ClipboardCheck,
  RotateCcw,
  CalendarPlus,
  Megaphone,
  Layers,
  Rocket,
  ArrowLeftRight
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

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
    resetTermsAcceptanceForTesting,
    addToast,
    currentUser
  } = useCrm();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Mouse hover state: when mouse enters navbar, opens full view; when mouse leaves, closes!
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    try {
      const saved = localStorage.getItem('little_spartans_sidebar_pinned');
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return true;
  });

  const togglePin = () => {
    setIsPinned(prev => {
      const next = !prev;
      try {
        localStorage.setItem('little_spartans_sidebar_pinned', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Is full view currently visible? (on hover, or if user pins it, or on mobile)
  const isFullView = isHovered || isPinned;

  const navbarLeaveTimerRef = useRef(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (navbarLeaveTimerRef.current) clearTimeout(navbarLeaveTimerRef.current);
    };
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.profile-section-container')) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [profileMenuOpen]);

  // Check if current portal is Admin Portal for targeted Blue+Teal styling
  const isAdminPortal = currentPortal === 'admin';

  // =========================================================================
  // 1. ADMIN HIERARCHICAL NAVIGATION (9 Master Modules with Submenus)
  // =========================================================================
  const adminNavStructure = [
    {
      id: 'academy_management',
      label: 'Academy Management',
      icon: Sparkles,
      children: [
        { id: 'enquiries', label: 'Enquiries', view: 'enquiries' },
        { id: 'demos', label: 'Demo', view: 'demos' },
      ],
    },
    {
      id: 'people',
      label: 'People Management',
      icon: Users,
      children: [
        { id: 'students', label: 'Kids', view: 'people', subTab: 'students' },
        { id: 'parents', label: 'Parents', view: 'people', subTab: 'parents' },
        { id: 'coaches', label: 'Coaches', view: 'people', subTab: 'coaches' },
      ],
    },
    {
      id: 'programs',
      label: 'Programs & Classes',
      icon: Calendar,
      children: [
        { id: 'batches', label: 'Create Batch', view: 'programs', subTab: 'batches' },
        { id: 'schedules', label: 'Class Schedule', view: 'programs', subTab: 'schedules' },
        { id: 'evaluations', label: 'Evaluation Reviews', view: 'evaluations' },
      ],
    },
    {
      id: 'attendance_compensation',
      label: 'Attendance Management',
      icon: CalendarCheck,
      children: [
        { id: 'attendance_overview', label: 'Attendance Overview', view: 'attendance_compensation', subTab: 'attendance_overview' },
        { id: 'location_wise', label: 'Location Attendance', view: 'attendance_compensation', subTab: 'location_wise' },
        { id: 'student_attendance', label: 'Kids Attendance', view: 'attendance_compensation', subTab: 'student_attendance' },
        { id: 'coach_attendance', label: 'Coach Attendance', view: 'attendance_compensation', subTab: 'coach_attendance' },
        { id: 'leave_requests', label: 'Leave Requests', view: 'attendance_compensation', subTab: 'leave_requests' },
        { id: 'compensation_management', label: 'Compensation Classes', view: 'attendance_compensation', subTab: 'compensation_management' },
      ],
    },
    {
      id: 'fees_payments',
      label: 'Fees & Payments',
      icon: CreditCard,
      children: [
        { id: 'packages', label: 'Students Class Packages', view: 'fees_payments', subTab: 'packages' },
        { id: 'gateway', label: 'Payments Features', view: 'fees_payments', subTab: 'gateway' },
      ],
    },
    {
      id: 'equipment',
      label: 'Equipment Management',
      icon: Package,
      children: [
        { id: 'inventory', label: 'Location Inventory', view: 'equipment', subTab: 'inventory' },
        { id: 'reports', label: 'Condition Reports', view: 'equipment', subTab: 'reports' },
      ],
    },
    {
      id: 'access_management',
      label: 'Access Management',
      icon: ShieldCheck,
      children: [
        { id: 'overview', label: 'Access Overview', view: 'access_management', subTab: 'overview' },
        { id: 'accounts', label: 'Accounts Directory', view: 'access_management', subTab: 'accounts' },
        { id: 'locations', label: 'Location Access', view: 'access_management', subTab: 'locations' },
        { id: 'permissions', label: 'Roles & Permissions', view: 'access_management', subTab: 'permissions' },
        { id: 'activity', label: 'Activity History', view: 'access_management', subTab: 'activity' },
      ],
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: MessageSquare,
      children: [
        { id: 'inbox', label: 'Inbox', view: 'communication', subTab: 'inbox' },
        { id: 'announcements', label: 'Announcements', view: 'communication', subTab: 'announcements' },
        { id: 'broadcasts', label: 'Broadcasts', view: 'communication', subTab: 'broadcasts' },
        { id: 'templates', label: 'Templates', view: 'communication', subTab: 'templates' },
        { id: 'sent', label: 'Sent Messages', view: 'communication', subTab: 'sent' },
        { id: 'scheduled', label: 'Scheduled Messages', view: 'communication', subTab: 'scheduled' },
        { id: 'reports', label: 'Message Reports', view: 'communication', subTab: 'reports' },
      ],
    },
    {
      id: 'reports_settings',
      label: 'Reports & Settings',
      icon: BarChart2,
      children: [
        { id: 'analytics', label: 'Academy Analytics', view: 'reports_settings', subTab: 'analytics' },
        { id: 'export', label: 'Raw Data Export', view: 'reports_settings', subTab: 'export' },
        { id: 'backup', label: 'Backup & Recovery', view: 'reports_settings', subTab: 'backup' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      children: [
        { id: 'academy_settings', label: 'Academy Settings', view: 'settings', subTab: 'academy' },
        { id: 'brand_identity', label: 'Brand & Identity', view: 'settings', subTab: 'brand' },
        { id: 'center_management', label: 'Center Management', view: 'settings', subTab: 'centers' },
        { id: 'academic_calendar', label: 'Academic Calendar', view: 'settings', subTab: 'calendar' },
        { id: 'terms_conditions', label: 'Terms & Conditions', view: 'settings', subTab: 'terms' },
        { id: 'settings_audit', label: 'Settings Audit Log', view: 'settings', subTab: 'audit' },
      ],
    },
  ];

  const isChildActive = (child) => {
    // People Management: Kids (students), Parents, Coaches
    if (child.view === 'people' || ['students', 'parents', 'coaches', 'kids'].includes(child.id)) {
      if (['people', 'students', 'parents', 'coaches', 'kids'].includes(currentView)) {
        if (child.id === 'students' || child.subTab === 'students') {
          return (
            currentView === 'students' ||
            currentView === 'kids' ||
            (currentView === 'people' && (!activeSubTab || activeSubTab === 'students'))
          );
        }
        if (child.id === 'parents' || child.subTab === 'parents') {
          return currentView === 'parents' || (currentView === 'people' && activeSubTab === 'parents');
        }
        if (child.id === 'coaches' || child.subTab === 'coaches') {
          return currentView === 'coaches' || (currentView === 'people' && activeSubTab === 'coaches');
        }
      }
    }
    if (child.view === 'programs' && ['batches', 'schedules'].includes(currentView)) {
      return (child.subTab || child.id) === currentView;
    }
    if (child.view === 'attendance_compensation' && ['attendance_overview', 'location_wise', 'student_attendance', 'coach_attendance', 'leave_requests', 'compensation_management', 'coach_leaves', 'student_compensation'].includes(currentView)) {
      return (child.subTab || child.id) === currentView;
    }
    if (child.view === 'settings' || child.view === 'terms_policies') {
      if (['settings', 'academy_settings', 'terms_policies', 'terms', 'policies'].includes(currentView)) {
        if (child.subTab === 'terms' && ['terms', 'dos_donts', 'acceptances'].includes(activeSubTab)) {
          return true;
        }
        if (child.subTab === 'academy' && (!activeSubTab || activeSubTab === 'academy' || activeSubTab === 'settings')) {
          return true;
        }
        return activeSubTab === child.subTab;
      }
      return false;
    }
    if (child.view !== currentView) return false;
    if (child.subTab) {
      if (child.view === 'people' && !activeSubTab) return child.subTab === 'students';
      if (child.view === 'programs' && !activeSubTab) return child.subTab === 'batches';
      if (child.view === 'attendance_compensation' && !activeSubTab) return child.subTab === 'attendance_overview';
      if (child.view === 'fees_payments' && !activeSubTab) return child.subTab === 'packages';
      if (child.view === 'equipment' && !activeSubTab) return child.subTab === 'inventory';
      if (child.view === 'access_management' && !activeSubTab) return child.subTab === 'overview';
      if (child.view === 'communication' && !activeSubTab) return child.subTab === 'inbox';
      if (child.view === 'reports_settings' && !activeSubTab) return child.subTab === 'analytics';
      return activeSubTab === child.subTab;
    }
    return true;
  };

  const isParentActive = (parent) => {
    if (parent.id === 'people' && ['people', 'students', 'parents', 'coaches', 'kids'].includes(currentView)) {
      return true;
    }
    return parent.children.some(child => isChildActive(child));
  };

  // Accordion state: only one parent submenu open at a time
  const [expandedMenu, setExpandedMenu] = useState(() => {
    if (!isAdminPortal || currentView === 'dashboard') return null;
    if (['people', 'students', 'parents', 'coaches', 'kids'].includes(currentView)) {
      return 'people';
    }
    const activeParent = adminNavStructure.find(p => isParentActive(p));
    return activeParent ? activeParent.id : null;
  });

  // Auto-expand the active section whenever navigation occurs
  const lastNavKeyRef = useRef(`${currentView}_${activeSubTab}`);
  useEffect(() => {
    const navKey = `${currentView}_${activeSubTab}`;
    if (lastNavKeyRef.current !== navKey) {
      lastNavKeyRef.current = navKey;
      if (isAdminPortal && currentView !== 'dashboard') {
        if (['people', 'students', 'parents', 'coaches', 'kids'].includes(currentView)) {
          setExpandedMenu('people');
        } else {
          const activeParent = adminNavStructure.find(p => isParentActive(p));
          if (activeParent) {
            setExpandedMenu(activeParent.id);
          }
        }
      }
    }
  }, [currentView, activeSubTab, isAdminPortal]);

  const handleParentClick = (parent) => {
    const parentActive = isParentActive(parent);

    // If already active and in full view, clicking parent row toggles accordion
    if (parentActive && isFullView) {
      setExpandedMenu(prev => prev === parent.id ? null : parent.id);
      return;
    }

    // Otherwise navigate to this module's primary view & subTab
    const firstChild = parent.children && parent.children.length > 0 ? parent.children[0] : null;
    if (firstChild) {
      if (firstChild.subTab && setActiveSubTab) {
        setActiveSubTab(firstChild.subTab);
      }
      setCurrentView(firstChild.view, firstChild.subTab);
    } else {
      setCurrentView(parent.id);
    }

    // Keep the clicked section expanded
    setExpandedMenu(parent.id);

    if (!isFullView) {
      setIsHovered(true);
    }
  };

  const handleChevronClick = (e, parent) => {
    e.stopPropagation();
    // Clicking chevron only toggles accordion without navigating
    setExpandedMenu(prev => prev === parent.id ? null : parent.id);
  };

  const handleSubItemClick = (parent, child) => {
    if (child.subTab && setActiveSubTab) {
      setActiveSubTab(child.subTab);
    }
    setCurrentView(child.view, child.subTab);
    setSidebarOpen(false);
  };

  // Fallback flat navigation items for legacy compatibility
  const adminNavItems = [
    { id: 'enquiries', label: 'Enquiries', icon: Users },
    { id: 'demos', label: 'Demo Management', icon: CalendarDays },
    { id: 'people', label: 'People Management', icon: GraduationCap },
    { id: 'programs', label: 'Programs & Classes', icon: Calendar },
    { id: 'attendance_compensation', label: 'Attendance & Compensation', icon: CalendarCheck },
    { id: 'equipment', label: 'Equipment Management', icon: Package },
    { id: 'fees_payments', label: 'Fees & Payments', icon: CreditCard },
    { id: 'sports_events', label: 'Sports & Events', icon: Trophy },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'access_management', label: 'Access Management', icon: ShieldCheck },
    { id: 'reports_settings', label: 'Reports & Settings', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // =========================================================================
  // 2. SUPER COACH NAVIGATION: MULTI-LOCATION MANAGEMENT
  // =========================================================================
  const superCoachNavItems = [
    { id: 'evaluations', label: 'Evaluation Review', icon: ShieldCheck },
    { id: 'locations', label: 'Multi-Location Hub', icon: MapPin },
    { id: 'coaches', label: 'Coach Management', icon: UserCheck },
    { id: 'leaves', label: 'Leave Management', icon: CalendarOff },
    { id: 'equipment', label: 'Equipment Management', icon: Package },
    { id: 'schedules', label: 'Class & Schedules', icon: Calendar },
    { id: 'attendance', label: 'Attendance & Progress', icon: CalendarCheck },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart2 },
  ];

  // =========================================================================
  // 3. COACH NAVIGATION: CLEANED & CONSOLIDATED NAVIGATION
  // =========================================================================
  const coachNavItems = [
    { id: 'batches', label: 'My Batches', icon: Layers },
    { id: 'attendance', label: 'Attendance & Leave', icon: CalendarCheck },
    { id: 'evaluations', label: 'Evaluations', icon: ClipboardCheck },
    { id: 'equipment', label: 'Equipment Check', icon: Package },
    { id: 'performance', label: 'My Performance', icon: Trophy },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  // =========================================================================
  // 4. PARENT NAVIGATION (Matching Reference Screenshot & Consolidated Order)
  // =========================================================================
  const parentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'programs', label: 'Programs', icon: Layers },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'communication', label: 'Announcements', icon: Megaphone },
    { id: 'feedback', label: 'Feedback & Suggestions', icon: MessageSquare },
    { id: 'fees_payments', label: 'Fees & Payments', icon: CreditCard },
  ];

  // Section title & items depending on active portal
  let sectionTitle = 'ACADEMY MANAGEMENT';
  let navItems = adminNavItems;
  let profilePhoto = currentUser?.avatar || null;
  let profileInitials = currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AD';
  let profileName = currentUser?.name || 'Administrator';
  let profileRole = currentUser?.designation || currentUser?.badge || 'Super Admin';

  if (currentPortal === 'super_coach') {
    sectionTitle = 'SUPER COACH PORTAL';
    navItems = superCoachNavItems;
    profilePhoto = currentUser?.avatar || null;
    profileInitials = currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SC';
    profileName = currentUser?.name || 'Super Coach';
    profileRole = currentUser?.designation || currentUser?.badge || 'Super Coach';
  } else if (currentPortal === 'parent') {
    sectionTitle = 'PARENT PORTAL';
    navItems = parentNavItems;
    profilePhoto = currentUser?.avatar || null;
    profileInitials = currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'PA';
    profileName = currentUser?.name || 'Parent User';
    profileRole = currentUser?.designation || currentUser?.badge || 'Parent / Guardian';
  } else if (currentPortal === 'coach') {
    sectionTitle = 'COACH PORTAL';
    navItems = coachNavItems;
    profilePhoto = currentUser?.avatar || null;
    profileInitials = currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CO';
    profileName = currentUser?.name || 'Coach User';
    profileRole = currentUser?.designation || currentUser?.badge || 'Certified Coach';
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
    }, 180);
  };

  // Direct navigation handler on click
  const handleNavItemClick = (itemId) => {
    if (currentPortal === 'parent') {
      if (itemId === 'programs') {
        setCurrentView('programs');
        setSidebarOpen(false);
        return;
      }
      if (itemId === 'achievements') {
        setCurrentView('achievements');
        setSidebarOpen(false);
        return;
      }
      if (itemId === 'attendance') {
        setCurrentView('attendance');
        setSidebarOpen(false);
        return;
      }
      if (itemId === 'communication') {
        setCurrentView('communication');
        setSidebarOpen(false);
        return;
      }
      if (itemId === 'feedback') {
        setCurrentView('feedback');
        setSidebarOpen(false);
        return;
      }
      if (itemId === 'fees_payments') {
        setCurrentView('fees_payments');
        setSidebarOpen(false);
        return;
      }
    }

    if (currentPortal === 'coach') {
      if (itemId === 'batches') {
        setCurrentView('batches');
        setSidebarOpen(false);
        return;
      }
      if (itemId === 'attendance') {
        setCurrentView('attendance');
        setSidebarOpen(false);
        return;
      }
      if (itemId === 'evaluations') {
        setCurrentView('evaluations');
        setSidebarOpen(false);
        return;
      }
    }

    if (itemId === 'people' && setActiveSubTab) {
      setActiveSubTab('students');
      setCurrentView('people', 'students');
      setSidebarOpen(false);
      return;
    } else if (itemId === 'programs' && setActiveSubTab) {
      const validProgramTabs = ['batches', 'schedules', 'coach_assignments'];
      if (!validProgramTabs.includes(activeSubTab)) {
        setActiveSubTab('batches');
      }
    } else if ((itemId === 'attendance_compensation' || itemId === 'attendance') && setActiveSubTab) {
      const validAttendanceTabs = ['student_attendance', 'coach_attendance', 'student_compensation', 'coach_leaves'];
      if (!validAttendanceTabs.includes(activeSubTab)) {
        setActiveSubTab('student_attendance');
      }
    } else if (itemId === 'fees_payments' && setActiveSubTab) {
      const validFeeTabs = ['packages', 'gateway'];
      if (!validFeeTabs.includes(activeSubTab)) {
        setActiveSubTab('packages');
      }
    } else if (itemId === 'access_management' && setActiveSubTab) {
      const validAccessTabs = ['overview', 'accounts', 'locations', 'permissions', 'activity'];
      if (!validAccessTabs.includes(activeSubTab)) {
        setActiveSubTab('overview');
      }
    } else if (itemId === 'reports_settings' && setActiveSubTab) {
      const validReportTabs = ['analytics', 'export', 'backup'];
      if (!validReportTabs.includes(activeSubTab)) {
        setActiveSubTab('analytics');
      }
    } else if (itemId === 'settings' && setActiveSubTab) {
      const validSettingsTabs = ['academy', 'brand', 'centers', 'calendar', 'terms', 'audit'];
      if (!validSettingsTabs.includes(activeSubTab)) {
        setActiveSubTab('academy');
      }
    } else if (itemId === 'communication' && setActiveSubTab) {
      const validCommTabs = ['inbox', 'announcements', 'broadcasts', 'templates', 'sent', 'scheduled', 'reports', 'feedback', 'support_requests'];
      if (!validCommTabs.includes(activeSubTab)) {
        setActiveSubTab('inbox');
      }
    } else if (itemId === 'equipment' && setActiveSubTab) {
      const validEquipTabs = ['inventory', 'reports'];
      if (!validEquipTabs.includes(activeSubTab)) {
        setActiveSubTab('inventory');
      }
    }

    setCurrentView(itemId);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* 
        PREMIUM BLUE + TEAL GRADIENT SIDEBAR (No Floating Hover Popovers):
        - Exact Palette:
            Deep Blue:   #082B49 (Top)
            Ocean Blue:  #064B68 (Middle)
            Teal Glow:   #00AFA3 (Bottom subtle flowing aura)
        - Active Dashboard & Active Navigation: #F4510B (Spartan Orange) with subtle glow
        - Rounded outer corners (lg:rounded-2xl) with elevation shadow (shadow-2xl)
        - Expanded width: 256px (w-64) | Collapsed width: 72px (w-[72px])
        - Independent vertical scrolling strictly for navigation area
        - Fixed Brand Header at top (shrink-0)
        - Fixed User Profile Section at bottom (shrink-0)
      */}
      <aside 
        onMouseEnter={handleNavbarMouseEnter}
        onMouseLeave={handleNavbarMouseLeave}
        className={`fixed inset-y-0 left-0 z-50 text-white flex flex-col font-sans transition-[width,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none lg:static lg:inset-auto lg:h-[calc(100vh-16px)] lg:my-2 lg:ml-2.5 lg:rounded-2xl border shadow-2xl overflow-hidden lg:shrink-0 lg:z-auto relative ${
          isAdminPortal
            ? 'bg-gradient-to-b from-[#082B49] via-[#064B68] to-[#043347] border-white/12'
            : 'bg-[#0B0F17] border-white/10'
        } ${isFullView ? 'w-64' : 'w-[72px]'} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Subtle flowing Teal glow near the bottom (Elegant & professional) */}
        {isAdminPortal && (
          <div 
            aria-hidden="true" 
            className="absolute -bottom-10 -left-12 -right-12 h-64 pointer-events-none select-none z-0 overflow-hidden"
          >
            {/* Soft radial teal aura */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(0,175,163,0.30)_0%,_rgba(6,75,104,0.12)_45%,_transparent_72%)] blur-xl" />
            {/* Flowing bottom curved shimmer */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-72 h-32 rounded-[100%] bg-gradient-to-t from-[#00AFA3]/22 via-[#00AFA3]/6 to-transparent blur-lg" />
          </div>
        )}

        {/* ============================================================ */}
        {/* 1. FIXED BRAND HEADER: Logo + ZenConnect Title + Pin Toggle  */}
        {/* ============================================================ */}
        <div className={`px-3.5 py-3.5 flex items-center justify-between border-b border-white/12 shrink-0 h-16 overflow-hidden relative z-10 ${
          isAdminPortal ? 'bg-[#082B49]/50 backdrop-blur-xs' : 'bg-[#0B0F17]'
        }`}>
          {isFullView ? (
            <div className="flex items-center justify-between w-full animate-in fade-in duration-200">
              <div className="flex items-center gap-2 min-w-0">
                <img 
                  src="/assets/little-spartans-logo-4k.png" 
                  alt="Little Spartans" 
                  className="h-8 sm:h-9 w-auto object-contain pointer-events-none select-none drop-shadow-xs"
                  style={{ 
                    imageRendering: '-webkit-optimize-contrast',
                    transform: 'translateZ(0)'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div 
                  className="hidden items-center gap-1.5" 
                  style={{ display: 'none' }}
                >
                  <span className="font-extrabold text-white text-sm tracking-tight">Little Spartans</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-2 py-0.5 rounded-full border border-[#F4510B] text-white text-[10.5px] font-semibold tracking-wide bg-[#F4510B]/15 shadow-xs select-none">
                  ZenConnect
                </span>
                {/* Pin toggle to lock full view permanently if desired */}
                <button
                  type="button"
                  onClick={togglePin}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isPinned ? 'text-[#F4510B] bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  title={isPinned ? "Unpin sidebar (auto-collapses when mouse leaves)" : "Pin sidebar permanently expanded"}
                  aria-label="Pin sidebar"
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
              <div className={`w-10 h-10 rounded-xl ${
                isAdminPortal 
                  ? 'bg-gradient-to-br from-[#082B49] to-[#064B68] border border-[#F4510B]/60' 
                  : 'bg-gradient-to-br from-[#1A2234] to-[#0E131F] border border-[#F4510B]/50'
              } flex items-center justify-center shadow-sm hover:border-[#F4510B] transition-colors cursor-pointer`}>
                <span className="text-[#F4510B] font-black text-sm tracking-tighter">LS</span>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 2. SCROLLABLE NAVIGATION AREA (Independent Vertical Scroll)  */}
        {/* ============================================================ */}
        <div className={`flex-1 overflow-y-auto py-3 overscroll-contain relative z-10 transition-all duration-200 ${
          isFullView 
            ? 'px-2.5 space-y-1 [&::-webkit-scrollbar]:w-1.5' 
            : 'px-0 space-y-1.5 [&::-webkit-scrollbar]:w-0 flex flex-col items-center'
        } [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/15 hover:[&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full`}>
          
          {/* Section 1 Header: DASHBOARD */}
          {isFullView ? (
            <div className="pb-1 px-2">
              <span className={`text-[10px] font-bold tracking-widest uppercase block truncate animate-in fade-in duration-200 select-none ${
                isAdminPortal ? 'text-[#9BB8D3]' : 'text-[#8A99AD]'
              }`}>
                DASHBOARD
              </span>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center pb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>
          )}

          {/* Item 1: Dashboard (Always First Item) */}
          <button
            type="button"
            onClick={() => handleNavItemClick('dashboard')}
            className={`flex items-center transition-all duration-200 group cursor-pointer ${
              isFullView
                ? 'w-full px-3 py-2 justify-start rounded-xl text-[13.5px]'
                : 'w-11 h-11 justify-center mx-auto rounded-xl shrink-0'
            } ${
              currentView === 'dashboard'
                ? 'bg-[#F4510B] text-white font-semibold shadow-md shadow-[#F4510B]/35'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
            title={!isFullView ? "Dashboard" : undefined}
          >
            <div className={`flex items-center ${isFullView ? 'gap-3 min-w-0' : 'justify-center'}`}>
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <Home 
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    currentView === 'dashboard' ? 'text-white' : 'text-white/80 group-hover:text-white'
                  }`} 
                  strokeWidth={1.75} 
                />
              </div>
              {isFullView && (
                <span className="truncate whitespace-nowrap animate-in fade-in duration-200 font-medium text-white">
                  Dashboard
                </span>
              )}
            </div>
          </button>

          {/* ============================================================ */}
          {/* Section Divider & Header: ACADEMY MANAGEMENT                 */}
          {/* ============================================================ */}
          {isFullView ? (
            <div className="pt-3 pb-1 px-2">
              <div className="border-t border-white/12 mb-2.5" />
              <span className={`text-[10px] font-bold tracking-widest uppercase block truncate animate-in fade-in duration-200 select-none ${
                isAdminPortal ? 'text-[#9BB8D3]' : 'text-[#8A99AD]'
              }`}>
                {sectionTitle}
              </span>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center py-1">
              <div className="w-6 border-t border-white/15" />
            </div>
          )}

          {/* Navigation Items: Accordion Hierarchy for Admin Portal, Flat for other portals */}
          {isAdminPortal ? (
            <div className={isFullView ? 'space-y-1 w-full' : 'space-y-1.5 w-full flex flex-col items-center'}>
              {adminNavStructure.map((parent) => {
                const ParentIcon = parent.icon;
                const isExpanded = expandedMenu === parent.id;
                const parentActive = isParentActive(parent);

                return (
                  <div key={parent.id} className={`flex flex-col ${isFullView ? 'w-full' : 'items-center'}`}>
                    {/* Parent Menu Item */}
                    <button
                      type="button"
                      onClick={() => handleParentClick(parent)}
                      className={`flex items-center transition-all duration-200 group cursor-pointer ${
                        isFullView
                          ? 'w-full px-3 py-2 justify-between rounded-xl text-[13.5px]'
                          : 'w-11 h-11 justify-center mx-auto rounded-xl shrink-0'
                      } ${
                        parentActive
                          ? 'bg-white/12 text-white font-medium'
                          : 'text-white/85 hover:text-white hover:bg-white/10'
                      }`}
                      title={!isFullView ? parent.label : undefined}
                      aria-expanded={isExpanded}
                    >
                      <div className={`flex items-center ${isFullView ? 'gap-3 min-w-0' : 'justify-center'}`}>
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                          <ParentIcon
                            className={`w-5 h-5 shrink-0 transition-colors ${
                              parentActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                            }`}
                            strokeWidth={1.75}
                          />
                        </div>
                        {isFullView && (
                          <span className="truncate whitespace-nowrap animate-in fade-in duration-200 font-medium text-white">
                            {parent.label}
                          </span>
                        )}
                      </div>

                      {/* Expand/Collapse Chevron (Rotates 180° when expanded, hidden in collapsed rail) */}
                      {isFullView && (
                        <div 
                          className="shrink-0 ml-1.5 p-0.5 text-white/70 group-hover:text-white transition-colors"
                          onClick={(e) => handleChevronClick(e, parent)}
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ease-in-out ${
                              isExpanded ? 'rotate-180 text-white' : 'rotate-0 text-white/60'
                            }`}
                          />
                        </div>
                      )}
                    </button>

                    {/* Submenu Accordion Container */}
                    {isFullView && (
                      <div
                        className={`overflow-hidden transition-all duration-200 ease-in-out ${
                          isExpanded
                            ? 'max-h-96 opacity-100 py-1 space-y-0.5'
                            : 'max-h-0 opacity-0 pointer-events-none'
                        }`}
                      >
                        {parent.children.map((child) => {
                          const childActive = isChildActive(child);
                          return (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => handleSubItemClick(parent, child)}
                              className={`w-full flex items-center pl-9 pr-3 py-1.5 rounded-lg text-[12.5px] transition-all duration-150 group/sub cursor-pointer ${
                                childActive
                                  ? 'bg-[#F4510B] text-white font-semibold shadow-xs'
                                  : 'text-white/80 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full mr-2.5 shrink-0 transition-colors ${
                                  childActive ? 'bg-white' : 'bg-white/40 group-hover/sub:bg-white'
                                }`}
                              />
                              <span className="truncate whitespace-nowrap">
                                {child.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            navItems
              .filter((item) => item.id !== 'dashboard')
              .map((item) => {
              const Icon = item.icon;
              const isActive =
                currentView === item.id ||
                (item.id === 'batches' && (currentView === 'batches' || currentView === 'classes' || currentView === 'schedule' || currentView === 'schedules')) ||
                (item.id === 'attendance' && (currentView === 'attendance' || currentView === 'attendance_leave' || currentView === 'leave_requests' || currentView === 'compensation_class' || currentView === 'leaves' || currentView === 'compensation' || currentView === 'attendance_compensation')) ||
                (item.id === 'evaluations' && (currentView === 'evaluations' || currentView === 'child_evaluations' || currentView === 'evaluation_history' || currentView === 'returned_evaluations')) ||
                (item.id === 'child_evaluations' && currentView === 'evaluations') ||
                (item.id === 'programs' && (currentView === 'programs' || (currentView === 'programs_achievements' && activeSubTab === 'explore'))) ||
                (item.id === 'achievements' && (currentView === 'achievements' || currentView === 'progress' || currentView === 'children' || (currentView === 'programs_achievements' && activeSubTab !== 'explore') || currentView === 'learning_journey')) ||
                (item.id === 'communication' && (currentView === 'communication' || currentView === 'announcements')) ||
                (item.id === 'feedback' && currentView === 'feedback') ||
                (item.id === 'fees_payments' && (currentView === 'fees_payments' || currentView === 'payments')) ||
                (item.id === 'classes' && currentView === 'schedule') ||
                (item.id === 'leave_requests' && (currentView === 'leaves' || currentView === 'workspace' || currentView === 'leave_requests')) ||
                (item.id === 'compensation_class' && (currentView === 'compensation_class' || currentView === 'compensation')) ||
                (item.id === 'profile' && (currentView === 'profile' || currentView === 'workspace'));

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavItemClick(item.id)}
                  className={`flex items-center transition-all duration-200 group cursor-pointer ${
                    isFullView
                      ? 'w-full px-3 py-2 rounded-xl text-[13.5px]'
                      : 'w-11 h-11 justify-center mx-auto rounded-xl shrink-0'
                  } ${
                    isActive
                      ? 'bg-[#F4510B] text-white font-semibold shadow-md shadow-[#F4510B]/35'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                  title={!isFullView ? item.label : undefined}
                >
                  <div className={`flex items-center ${isFullView ? 'gap-3 min-w-0' : 'justify-center'}`}>
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      <Icon 
                        className={`w-5 h-5 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                        }`} 
                        strokeWidth={1.75} 
                      />
                    </div>
                    {isFullView && (
                      <span className="truncate whitespace-nowrap animate-in fade-in duration-200 font-medium text-white">
                        {item.label}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}

          {/* Bottom safety spacer to prevent clipping */}
          <div className="h-4" />
        </div>

        {/* ============================================================ */}
        {/* 3. FIXED BOTTOM PROFILE SECTION: Avatar + Name/Role + 3-Dots */}
        {/* ============================================================ */}
        <div className={`border-t border-white/12 relative shrink-0 select-none profile-section-container z-10 ${
          isAdminPortal ? 'bg-transparent' : 'bg-[#0B0F17]'
        } ${isFullView ? 'p-3' : 'py-3 px-0 flex justify-center'}`}>
          <div className={`flex items-center ${isFullView ? 'justify-between gap-2.5 w-full' : 'justify-center'}`}>
            
            {/* User Profile Avatar with Online Status */}
            <div 
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="relative shrink-0 cursor-pointer group flex items-center justify-center"
              title={profileName}
            >
              <img 
                src={profilePhoto} 
                alt={profileName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20 group-hover:ring-[#F4510B] transition-all"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div 
                className="hidden w-10 h-10 rounded-full bg-gradient-to-br from-[#082B49] to-[#064B68] border border-[#F4510B]/60 text-white font-bold text-xs items-center justify-center shadow-xs"
              >
                {profileInitials}
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-[#064B68]" />
            </div>

            {/* Admin Name & Role (Rendered when expanded) */}
            {isFullView && (
              <>
                <div 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex-1 min-w-0 cursor-pointer animate-in fade-in duration-200"
                >
                  <p className="text-[13px] font-bold text-white truncate leading-tight hover:text-[#F4510B] transition-colors">
                    {profileName}
                  </p>
                  <p className={`text-[11px] truncate leading-tight mt-0.5 ${
                    isAdminPortal ? 'text-[#9BB8D3]' : 'text-[#8A99AD]'
                  }`}>
                    {profileRole}
                  </p>
                </div>

                {/* Three-dot menu button */}
                <button 
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
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
            <div className={`absolute bottom-16 ${isFullView ? 'right-3 w-56' : 'left-14 w-56'} ${
              isAdminPortal ? 'bg-[#06334D]' : 'bg-[#161B26]'
            } border border-white/15 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95`}>
              <div className="px-3 py-2 border-b border-white/12 mb-1">
                <p className="text-xs font-bold text-white truncate">{profileName}</p>
                <p className="text-[10px] text-[#9BB8D3] truncate">{profileRole}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('maxr:open-daily-motivational'));
                  setProfileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-white/90 hover:bg-white/10 rounded-lg flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00AFA3]" />
                <span>Daily Motivation</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('little-spartans:open-terms-modal'));
                  setProfileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-white/90 hover:bg-white/10 rounded-lg flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#F4510B]" />
                <span>Terms &amp; Policies</span>
              </button>
              {resetTermsAcceptanceForTesting && (
                <button
                  type="button"
                  onClick={() => {
                    resetTermsAcceptanceForTesting(currentUser?.email);
                    setProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-white/90 hover:bg-white/10 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reset Terms for Testing</span>
                </button>
              )}
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
                className="w-full text-left px-3 py-2 text-xs text-[#F4510B] hover:bg-white/10 rounded-lg flex items-center gap-2 mt-1 border-t border-white/12 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
