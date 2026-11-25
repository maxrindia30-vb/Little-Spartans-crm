import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Wifi,
  BatteryCharging,
  Signal,
  Bell,
  Menu,
  Shield,
  Activity,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink,
  Volume2,
  Camera,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Flame,
  Search,
  Settings,
  Users,
  Award
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import IPhoneMobileTabBar from './IPhoneMobileTabBar';

// Admin Portal Master Modules
import AdminDashboard from '../../portals/admin/AdminDashboard';
import EnquiryManagement from '../../portals/admin/EnquiryManagement';
import DemoManagementModule from '../../portals/admin/DemoManagementModule';
import PeopleManagementModule from '../../portals/admin/PeopleManagementModule';
import ProgramsClassesModule from '../../portals/admin/ProgramsClassesModule';
import AttendanceCompensationModule from '../../portals/admin/AttendanceCompensationModule';
import FeesPaymentsModule from '../../portals/admin/FeesPaymentsModule';
import SportsEventsModule from '../../portals/admin/SportsEventsModule';
import CommunicationModule from '../../portals/admin/CommunicationModule';
import ReportsSettingsModule from '../../portals/admin/ReportsSettingsModule';
import AccessManagementModule from '../../portals/admin/AccessManagementModule';
import AcademySettings from '../../portals/admin/AcademySettings';
import EquipmentManagementModule from '../../portals/common/EquipmentManagementModule';
import EvaluationReviewModule from '../../portals/supercoach/EvaluationReviewModule';

// Other Portals
import ParentPortalView from '../../portals/parent/ParentPortalView';
import CoachPortalView from '../../portals/coach/CoachPortalView';
import SuperCoachPortalView from '../../portals/supercoach/SuperCoachPortalView';
import SupportPortalView from '../../portals/support/SupportPortalView';
import ErrorBoundary from '../common/ErrorBoundary';

// Titanium finishes configuration
const TITANIUM_FINISHES = {
  desert: {
    id: 'desert',
    name: 'Desert Titanium',
    chassisBg: 'linear-gradient(135deg, #c7aa85 0%, #a88a64 50%, #8c6e49 100%)',
    chassisRing: 'ring-[#b89a74]',
    borderGradient: 'from-[#dfc6a6] via-[#ad8e69] to-[#7f633f]',
    accentColor: '#c5a880',
    antennaColor: '#967852',
    chipColor: '#fff2df',
  },
  natural: {
    id: 'natural',
    name: 'Natural Titanium',
    chassisBg: 'linear-gradient(135deg, #a6a39d 0%, #87847e 50%, #68655f 100%)',
    chassisRing: 'ring-[#93908a]',
    borderGradient: 'from-[#c2bfb9] via-[#8c8983] to-[#5b5853]',
    accentColor: '#9b9893',
    antennaColor: '#706d67',
    chipColor: '#f1f0ee',
  },
  black: {
    id: 'black',
    name: 'Black Titanium',
    chassisBg: 'linear-gradient(135deg, #35363a 0%, #222326 50%, #151618 100%)',
    chassisRing: 'ring-[#2e2f33]',
    borderGradient: 'from-[#4e5056] via-[#2a2b2f] to-[#111214]',
    accentColor: '#282829',
    antennaColor: '#1d1e21',
    chipColor: '#2b2c30',
  },
  white: {
    id: 'white',
    name: 'White Titanium',
    chassisBg: 'linear-gradient(135deg, #eceeef 0%, #d8dade 50%, #bdc0c4 100%)',
    chassisRing: 'ring-[#cfd2d6]',
    borderGradient: 'from-[#ffffff] via-[#d6d9dd] to-[#a8abb0]',
    accentColor: '#e2e4e6',
    antennaColor: '#a6a9ad',
    chipColor: '#f8f9fa',
  },
};

export default function IPhone18ProMaxSimulator() {
  const {
    currentPortal,
    setCurrentPortal,
    currentView,
    setCurrentView,
    toggleIphoneView,
    data,
  } = useCrm();

  const [finish, setFinish] = useState('desert');
  const [isLandscape, setIsLandscape] = useState(false);
  const [scale, setScale] = useState(() => {
    if (typeof window !== 'undefined') {
      const availH = window.innerHeight - 130;
      const calculated = +(availH / 980).toFixed(2);
      return Math.min(1.0, Math.max(0.68, calculated));
    }
    return 0.78;
  });
  const [islandExpanded, setIslandExpanded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [batteryLevel] = useState(94);
  const containerRef = useRef(null);

  // Live iOS Status Bar Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      // Format 9:41 style or 12h without seconds
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut to exit iPhone view: Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !drawerOpen && !islandExpanded) {
        toggleIphoneView(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen, islandExpanded, toggleIphoneView]);

  const activeFinish = TITANIUM_FINISHES[finish] || TITANIUM_FINISHES.desert;

  // Portals configuration
  const portalsList = [
    { id: 'admin', label: 'Admin Portal', icon: '🏢', badge: 'Academy Admin', defaultView: 'dashboard' },
    { id: 'super_coach', label: 'Super Coach', icon: '🌟', badge: 'Super Coach QA', defaultView: 'evaluations' },
    { id: 'coach', label: 'Coach Portal', icon: '🏃', badge: 'Faculty Coach', defaultView: 'dashboard' },
    { id: 'parent', label: 'Parent Portal', icon: '👨‍👩‍👧', badge: 'Little Spartan Parent', defaultView: 'dashboard' },
  ];

  const currentPortalConfig = portalsList.find(p => p.id === currentPortal) || portalsList[0];

  // Render view for Admin Portal within mobile screen
  const renderAdminView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'enquiries':
        return <EnquiryManagement />;
      case 'demos':
        return <DemoManagementModule />;
      case 'people':
      case 'students':
      case 'kids':
      case 'parents':
      case 'coaches':
        return <PeopleManagementModule />;
      case 'programs':
      case 'classes':
      case 'batches':
      case 'schedules':
        return <ProgramsClassesModule />;
      case 'evaluations':
      case 'evaluation_review':
        return <EvaluationReviewModule />;
      case 'attendance_compensation':
      case 'attendance':
      case 'compensation':
      case 'leaves':
      case 'coach_leaves':
        return <AttendanceCompensationModule />;
      case 'fees_payments':
      case 'payments':
      case 'fees':
      case 'invoices':
        return <FeesPaymentsModule />;
      case 'sports_events':
      case 'competitions':
      case 'certificates':
        return <SportsEventsModule />;
      case 'communication':
      case 'feedback':
      case 'announcements':
        return <CommunicationModule />;
      case 'access_management':
      case 'access':
      case 'accounts':
      case 'users':
        return <AccessManagementModule />;
      case 'reports_settings':
      case 'reports':
      case 'export':
      case 'backup':
      case 'analytics':
        return <ReportsSettingsModule />;
      case 'settings':
      case 'academy_settings':
      case 'centers':
      case 'locations':
      case 'terms_policies':
      case 'terms':
      case 'policies':
        return <AcademySettings />;
      case 'equipment':
      case 'equipment_management':
        return <EquipmentManagementModule role="admin" />;
      default:
        return <AdminDashboard />;
    }
  };

  // Drawer menu items per portal for mobile navigation
  const getDrawerItems = () => {
    switch (currentPortal) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard & Overview', icon: Activity },
          { id: 'enquiries', label: 'Enquiries & Leads', icon: Users },
          { id: 'demos', label: 'Demo Management', icon: Sparkles },
          { id: 'attendance_compensation', label: 'Attendance & Leaves', icon: Calendar },
          { id: 'people', label: 'People (Kids, Parents, Coaches)', icon: Users },
          { id: 'programs', label: 'Programs & Batches', icon: Layers },
          { id: 'evaluations', label: 'Quality Evaluations', icon: Shield },
          { id: 'fees_payments', label: 'Fees & Invoicing', icon: CheckCircle2 },
          { id: 'sports_events', label: 'Events & Tournaments', icon: Award },
          { id: 'access_management', label: 'User Governance & Roles', icon: Settings },
          { id: 'settings', label: 'Academy Settings', icon: Settings },
        ];
      case 'super_coach':
        return [
          { id: 'evaluations', label: 'Coach Evaluations', icon: Shield },
          { id: 'locations', label: 'Multi-Location Hub', icon: MapPin },
          { id: 'coaches', label: 'Coaching Faculty', icon: Users },
          { id: 'leaves', label: 'Leave Oversight', icon: Clock },
          { id: 'schedules', label: 'Academy Timetable', icon: Calendar },
          { id: 'reports', label: 'Performance Analytics', icon: Activity },
        ];
      case 'coach':
        return [
          { id: 'dashboard', label: 'Coach Dashboard', icon: Activity },
          { id: 'batches', label: 'Assigned Batches', icon: Layers },
          { id: 'classes', label: 'Today\'s Classes', icon: Calendar },
          { id: 'attendance', label: 'Mark Attendance & Camera', icon: CheckCircle2 },
          { id: 'leave_requests', label: 'Leave Requests', icon: Clock },
          { id: 'evaluations', label: 'Athlete Evaluations', icon: Award },
          { id: 'compensation', label: 'Replacement Sessions', icon: Sparkles },
        ];
      case 'parent':
        return [
          { id: 'dashboard', label: 'Parent Dashboard', icon: Activity },
          { id: 'attendance', label: 'Child Attendance & Calendar', icon: Calendar },
          { id: 'programs', label: 'Programs Catalog', icon: Layers },
          { id: 'achievements', label: 'Achievements Vault', icon: Award },
          { id: 'children', label: 'My Child\'s Profile', icon: Users },
          { id: 'fees_payments', label: 'Fee Payments', icon: CheckCircle2 },
          { id: 'communication', label: 'Academy Announcements', icon: Bell },
        ];
      default:
        return [];
    }
  };

  // Dimensions
  // iPhone 18 Pro Max: 6.9-inch OLED display, viewport 430 x 932 pt
  const screenWidth = isLandscape ? 932 : 430;
  const screenHeight = isLandscape ? 430 : 932;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between overflow-hidden select-none">
      
      {/* ==================================================================== */}
      {/* 1. TOP SIMULATOR CONTROL BAR                                         */}
      {/* ==================================================================== */}
      <header className="w-full bg-slate-900/90 border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 z-30 shadow-2xl">
        
        {/* Left: Device Label & Active Specs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/30 text-white">
            <Smartphone className="w-4 h-4 text-[#F4510B]" />
            <span className="text-xs font-black tracking-wide bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
              iPhone 18 Pro Max
            </span>
            <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
              6.9" Super Retina XDR
            </span>
          </div>

          {/* Orientation Toggle */}
          <button
            type="button"
            onClick={() => setIsLandscape(!isLandscape)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            title="Toggle Device Orientation"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{isLandscape ? 'Landscape (932×430)' : 'Portrait (430×932)'}</span>
          </button>
        </div>

        {/* Center: Live Portal Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 shadow-inner">
          {portalsList.map((p) => {
            const isActive = currentPortal === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setCurrentPortal(p.id);
                  if (setCurrentView) setCurrentView(p.defaultView);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#F4510B] to-[#d83f05] text-white shadow-md shadow-orange-950/40 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{p.icon}</span>
                <span className="hidden md:inline">{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Titanium Finishes, Scaling & Exit */}
        <div className="flex items-center gap-2">
          
          {/* Titanium Finish Picker */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-black text-slate-500 mr-1">Finish:</span>
            {Object.values(TITANIUM_FINISHES).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFinish(f.id)}
                title={f.name}
                className={`w-5 h-5 rounded-full transition-transform cursor-pointer border ${
                  finish === f.id ? 'scale-125 ring-2 ring-orange-500 border-white' : 'border-slate-600 opacity-60 hover:opacity-100'
                }`}
                style={{ background: f.accentColor }}
              />
            ))}
          </div>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800 text-slate-300 text-xs">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.65, +(s - 0.05).toFixed(2)))}
              className="p-1 hover:text-white cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 font-semibold">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(1.15, +(s + 0.05).toFixed(2)))}
              className="p-1 hover:text-white cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const availH = window.innerHeight - 130;
                const calculated = +(availH / 980).toFixed(2);
                setScale(Math.min(1.0, Math.max(0.65, calculated)));
              }}
              className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 font-bold ml-1 cursor-pointer"
              title="Fit Device to Screen"
            >
              Fit
            </button>
          </div>

          {/* Exit Simulator / Full Desktop View */}
          <button
            type="button"
            onClick={() => toggleIphoneView(false)}
            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:text-white"
            title="Exit iPhone Simulator & Return to Desktop (Esc)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Desktop View</span>
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. DEVICE STAGE / CENTER VIEWPORT                                    */}
      {/* ==================================================================== */}
      <div 
        ref={containerRef}
        className="flex-1 w-full flex items-center justify-center p-2 sm:p-4 overflow-auto relative"
      >
        
        {/* Transform Scale Wrapper */}
        <div
          className="transition-transform duration-200 ease-out flex items-center justify-center relative"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
        >

          {/* ================================================================== */}
          {/* HARDWARE BUTTONS (Protruding from Titanium Frame)                 */}
          {/* ================================================================== */}
          {!isLandscape && (
            <>
              {/* Left Side: Action Button */}
              <div 
                className="absolute -left-[5px] top-[145px] w-[5px] h-[34px] rounded-l-md shadow-md"
                style={{ background: activeFinish.accentColor, filter: 'brightness(0.85)' }}
                title="Action Button"
              />
              {/* Left Side: Volume Up */}
              <div 
                className="absolute -left-[5px] top-[195px] w-[5px] h-[58px] rounded-l-md shadow-md"
                style={{ background: activeFinish.accentColor, filter: 'brightness(0.85)' }}
                title="Volume Up"
              />
              {/* Left Side: Volume Down */}
              <div 
                className="absolute -left-[5px] top-[265px] w-[5px] h-[58px] rounded-l-md shadow-md"
                style={{ background: activeFinish.accentColor, filter: 'brightness(0.85)' }}
                title="Volume Down"
              />

              {/* Right Side: Power / Side Button */}
              <div 
                className="absolute -right-[5px] top-[210px] w-[5px] h-[78px] rounded-r-md shadow-md"
                style={{ background: activeFinish.accentColor, filter: 'brightness(0.85)' }}
                title="Side / Power Button"
              />
              {/* Right Side: Camera Control Sensor */}
              <div 
                className="absolute -right-[4px] top-[335px] w-[4px] h-[64px] rounded-r-md shadow-md opacity-90 border-l border-black/30"
                style={{ background: activeFinish.accentColor, filter: 'brightness(0.75)' }}
                title="Camera Control Sensor"
              />

              {/* Titanium Antenna Bands */}
              <div className="absolute -left-[2px] top-[95px] w-[2px] h-[6px] rounded-sm" style={{ background: activeFinish.antennaColor }} />
              <div className="absolute -right-[2px] top-[95px] w-[2px] h-[6px] rounded-sm" style={{ background: activeFinish.antennaColor }} />
              <div className="absolute -left-[2px] bottom-[110px] w-[2px] h-[6px] rounded-sm" style={{ background: activeFinish.antennaColor }} />
              <div className="absolute -right-[2px] bottom-[110px] w-[2px] h-[6px] rounded-sm" style={{ background: activeFinish.antennaColor }} />
            </>
          )}

          {/* ================================================================== */}
          {/* IPHONE 18 PRO MAX CHASSIS (Titanium Outer Frame)                   */}
          {/* ================================================================== */}
          <div
            className={`relative p-[11px] rounded-[56px] shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_35px_rgba(255,255,255,0.06)] border border-white/20`}
            style={{
              background: activeFinish.chassisBg,
              transition: 'all 0.3s ease',
            }}
          >
            
            {/* Subtle Metallic Chamfer Edge Ring */}
            <div className="rounded-[48px] p-[2.5px] bg-gradient-to-b from-white/30 via-black/40 to-black/80 shadow-inner">
              
              {/* Inner Black Bezel Frame */}
              <div className="rounded-[46px] p-[1.5px] bg-black shadow-2xl relative overflow-hidden">
                
                {/* ============================================================ */}
                {/* SUPER RETINA XDR DISPLAY (Screen Viewport)                   */}
                {/* ============================================================ */}
                <div
                  className="bg-white rounded-[44px] overflow-hidden relative flex flex-col select-text iphone-screen"
                  style={{
                    width: `${screenWidth}px`,
                    height: `${screenHeight}px`,
                  }}
                >

                  {/* ========================================================== */}
                  {/* iOS 18 STATUS BAR & DYNAMIC ISLAND                         */}
                  {/* ========================================================== */}
                  <div className="w-full bg-white/95 backdrop-blur-md pt-3 px-7 pb-1 flex items-center justify-between shrink-0 z-40 relative select-none">
                    
                    {/* Status Bar Left: Time */}
                    <div className={`w-20 flex items-center transition-opacity duration-200 ${islandExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                      <span className="text-xs font-black tracking-tight text-slate-900 font-sans">
                        {currentTime || '9:41'}
                      </span>
                    </div>

                    {/* DYNAMIC ISLAND (Interactive Pill) */}
                    <div
                      onClick={() => setIslandExpanded(!islandExpanded)}
                      className={`transition-all duration-300 ease-out bg-black text-white cursor-pointer flex items-center justify-between relative shadow-lg ${
                        islandExpanded
                          ? 'w-[320px] h-[72px] rounded-[30px] px-3.5 py-2.5 z-50'
                          : 'w-[124px] h-[34px] rounded-full px-2.5 z-40'
                      }`}
                      title="Tap to toggle Dynamic Island Live Activity"
                    >
                      {/* FaceTime Camera Specular Dot & FaceID Infrared Sensor */}
                      <div className="absolute left-[26px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#0a0a0f] ring-1 ring-white/10 flex items-center justify-center pointer-events-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#172033]" />
                      </div>
                      <div className="absolute right-[24px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#07070a] ring-1 ring-white/5 pointer-events-none" />

                      {/* Island Content */}
                      {!islandExpanded ? (
                        <div className="w-full flex items-center justify-between pl-6 pr-5 text-[10px] font-bold">
                          <span className="text-[#F4510B] flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5 fill-[#F4510B]" />
                          </span>
                          <span className="text-slate-300 text-[9px] tracking-tight">LS Live</span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col justify-between pl-6 pr-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              <span className="text-[11px] font-black text-white">Little Spartans Live Activity</span>
                            </div>
                            <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-orange-500/30 text-orange-300 font-bold">
                              {currentPortalConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1">
                            <span>Field 2 • KK Nagar Center</span>
                            <span className="text-emerald-400 font-bold">90% Attendance</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status Bar Right: Signal, 5G, Wi-Fi, Battery */}
                    <div className={`w-20 flex items-center justify-end gap-1.5 text-slate-900 transition-opacity duration-200 ${islandExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                      <Signal className="w-3.5 h-3.5 fill-current" />
                      <span className="text-[10px] font-black tracking-tight">5G</span>
                      <Wifi className="w-3.5 h-3.5" />
                      
                      {/* iOS Battery Pill */}
                      <div className="flex items-center gap-0.5">
                        <div className="w-5 h-2.5 rounded-sm border border-slate-900/80 p-0.5 flex items-center">
                          <div
                            className="h-full rounded-2xs bg-emerald-500"
                            style={{ width: `${batteryLevel}%` }}
                          />
                        </div>
                        <div className="w-0.5 h-1 bg-slate-900/80 rounded-r-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* ========================================================== */}
                  {/* MOBILE HEADER (Inside Device Display)                      */}
                  {/* ========================================================== */}
                  <div className="w-full bg-white border-b border-[#172B5014] px-4 py-2.5 flex items-center justify-between shrink-0 z-30 shadow-2xs">
                    
                    {/* Brand Logo & Portal Switcher Dropdown */}
                    <div className="flex items-center gap-2">
                      <img
                        src="/assets/zenconnect-navbar-logo.png"
                        alt="Little Spartans ZenConnect"
                        className="h-7 w-auto object-contain"
                      />
                      
                      {/* Portal Badge Pill */}
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF4E8] border border-[#F4510B]/30 text-[10.5px] font-black text-[#172B50]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F4510B] animate-pulse" />
                        <span className="capitalize">{currentPortal.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {/* Mobile Menu Drawer Button */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-[#FFF4E8] text-[#172B50] transition-colors cursor-pointer"
                        aria-label="Toggle Portal Navigation Menu"
                      >
                        <Menu className="w-4 h-4 text-[#172B50]" />
                      </button>
                    </div>
                  </div>

                  {/* ========================================================== */}
                  {/* MOBILE SLIDE-OVER DRAWER (Portal Modules Navigation)       */}
                  {/* ========================================================== */}
                  {drawerOpen && (
                    <div className="absolute inset-0 top-[88px] bottom-[54px] z-50 bg-slate-950/70 backdrop-blur-sm flex">
                      <div className="w-4/5 max-w-[320px] h-full bg-white shadow-2xl p-4 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                            <div>
                              <p className="text-xs font-black text-[#172B50] uppercase tracking-wider">
                                {currentPortalConfig.label}
                              </p>
                              <p className="text-[10px] text-slate-500">Navigation Menu</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setDrawerOpen(false)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            {getDrawerItems().map((item) => {
                              const Icon = item.icon;
                              const isActive = currentView === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setCurrentView(item.id);
                                    setDrawerOpen(false);
                                  }}
                                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                    isActive
                                      ? 'bg-[#FFF4E8] text-[#F4510B]'
                                      : 'text-[#172B50] hover:bg-slate-50'
                                  }`}
                                >
                                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F4510B]' : 'text-slate-400'}`} />
                                  <span>{item.label}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Quick Portal Switcher in Drawer */}
                          <div className="mt-6 pt-4 border-t border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                              Switch Portal
                            </p>
                            <div className="grid grid-cols-2 gap-1.5">
                              {portalsList.map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    setCurrentPortal(p.id);
                                    if (setCurrentView) setCurrentView(p.defaultView);
                                    setDrawerOpen(false);
                                  }}
                                  className={`p-2 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                                    currentPortal === p.id
                                      ? 'bg-[#FFF4E8] border-[#F4510B] text-[#F4510B]'
                                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                  }`}
                                >
                                  <div>{p.icon}</div>
                                  <div className="truncate mt-0.5">{p.label.split(' ')[0]}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 text-[10px] text-center text-slate-400">
                          Little Spartans ZenConnect CRM Mobile v2.0
                        </div>
                      </div>

                      {/* Click outside to close drawer */}
                      <div className="flex-1 h-full cursor-pointer" onClick={() => setDrawerOpen(false)} />
                    </div>
                  )}

                  {/* ========================================================== */}
                  {/* MAIN SCROLLABLE PORTAL VIEWPORT                            */}
                  {/* ========================================================== */}
                  <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/50 relative scroll-smooth">
                    <div className="p-3.5 pb-24 w-full">
                      
                      {/* Active Portal Content */}
                      <ErrorBoundary key={`${currentPortal}_${currentView}_mobile`}>
                        {currentPortal === 'admin' && renderAdminView()}
                        {currentPortal === 'super_coach' && <SuperCoachPortalView />}
                        {currentPortal === 'parent' && <ParentPortalView />}
                        {currentPortal === 'coach' && <CoachPortalView />}
                        {currentPortal === 'support' && <SupportPortalView />}
                      </ErrorBoundary>

                    </div>
                  </main>

                  {/* ========================================================== */}
                  {/* iOS NATIVE BOTTOM TAB BAR & HOME INDICATOR                  */}
                  {/* ========================================================== */}
                  <div className="shrink-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 z-30 pb-1">
                    
                    {/* Bottom Tab Bar */}
                    <IPhoneMobileTabBar currentPortal={currentPortal} />

                    {/* iOS Home Indicator Pill */}
                    <div className="w-full flex items-center justify-center pt-1 pb-1">
                      <div className="w-36 h-1 bg-slate-900/60 rounded-full" />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. BOTTOM TIP BAR                                                    */}
      {/* ==================================================================== */}
      <footer className="w-full bg-slate-900/80 border-t border-slate-800 px-4 py-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-4 shrink-0">
        <span>💡 <b>Pro Tip:</b> Tap the <b>Dynamic Island</b> for Live Activity, or use the bottom tabs to navigate.</span>
        <span className="hidden md:inline text-slate-600">•</span>
        <span className="hidden md:inline">Press <b>Esc</b> to return to Desktop CRM mode.</span>
      </footer>

    </div>
  );
}
