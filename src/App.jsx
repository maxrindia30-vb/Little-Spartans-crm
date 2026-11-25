import React, { useState, useEffect } from 'react';
import { Menu, Smartphone } from 'lucide-react';
import { useCrm } from './context/CrmContext';
import Sidebar from './components/common/Sidebar';
import ToastContainer from './components/common/ToastContainer';
import LoginModal from './components/common/LoginModal';
import SpartzenLoginPage from './components/auth/SpartzenLoginPage';
import MouseFloatingGlow from './components/common/MouseFloatingGlow';
import DailyMotivationalModal from './components/common/DailyMotivationalModal';
import FirstTimeTermsModal from './components/auth/FirstTimeTermsModal';
import ErrorBoundary from './components/common/ErrorBoundary';
import IPhone18ProMaxSimulator from './components/mobile/IPhone18ProMaxSimulator';

// Admin Portal Master Modules
import AdminDashboard from './portals/admin/AdminDashboard';
import EnquiryManagement from './portals/admin/EnquiryManagement';
import DemoManagementModule from './portals/admin/DemoManagementModule';
import PeopleManagementModule from './portals/admin/PeopleManagementModule';
import ProgramsClassesModule from './portals/admin/ProgramsClassesModule';
import AttendanceCompensationModule from './portals/admin/AttendanceCompensationModule';
import FeesPaymentsModule from './portals/admin/FeesPaymentsModule';
import SportsEventsModule from './portals/admin/SportsEventsModule';
import CommunicationModule from './portals/admin/CommunicationModule';
import ReportsSettingsModule from './portals/admin/ReportsSettingsModule';
import AccessManagementModule from './portals/admin/AccessManagementModule';
import TermsManagementModule from './portals/admin/TermsManagementModule';
import AcademySettings from './portals/admin/AcademySettings';

// Other Portals
import ParentPortalView from './portals/parent/ParentPortalView';
import CoachPortalView from './portals/coach/CoachPortalView';
import SuperCoachPortalView from './portals/supercoach/SuperCoachPortalView';
import SupportPortalView from './portals/support/SupportPortalView';
import EquipmentManagementModule from './portals/common/EquipmentManagementModule';
import EvaluationReviewModule from './portals/supercoach/EvaluationReviewModule';

export default function App() {
  const {
    currentPortal,
    currentView,
    setCurrentPortal,
    isLoggedIn,
    sidebarOpen,
    setSidebarOpen,
    currentUser,
    checkUserTermsAcceptance,
    isIphoneView,
    toggleIphoneView,
  } = useCrm();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [forceShowTermsModal, setForceShowTermsModal] = useState(false);

  useEffect(() => {
    const handler = () => setForceShowTermsModal(true);
    window.addEventListener('little-spartans:open-terms-modal', handler);
    return () => window.removeEventListener('little-spartans:open-terms-modal', handler);
  }, []);

  // If logged out, display exact Little Spartans Spartzen login screen matching reference
  if (!isLoggedIn) {
    return (
      <>
        <SpartzenLoginPage />
        <ToastContainer />
      </>
    );
  }

  const isParentPortal = currentPortal === 'parent';
  const hasAcceptedTerms = checkUserTermsAcceptance
    ? checkUserTermsAcceptance(currentUser?.id, currentUser?.email, currentPortal)
    : true;
  // First-Time Terms & Conditions mandatory popup is strictly for the Parent Portal
  const shouldShowTermsModal = (isParentPortal && !hasAcceptedTerms) || forceShowTermsModal;

  // Render view for Admin Portal (Strictly 9 Master Modules + backwards-compatible routing)
  const renderAdminView = () => {
    switch (currentView) {
      // 1. Dashboard
      case 'dashboard':
        return <AdminDashboard />;

      // 2. Enquiries & Leads
      case 'enquiries':
        return <EnquiryManagement />;

      // Demo Management (Enquiry-to-Demo Conversion & Tracking)
      case 'demos':
        return <DemoManagementModule />;

      // 3. People Management (Kids / Students, Parents, Coaches)
      case 'people':
      case 'students':
      case 'kids':
      case 'parents':
      case 'coaches':
        return <PeopleManagementModule />;

      // 4. Programs & Classes (Sports Programs, Batches, Class Schedules, Coach Assignments)
      case 'programs':
      case 'classes':
      case 'batches':
      case 'schedules':
        return <ProgramsClassesModule />;

      // Evaluation & Quality Assurance (Two-Way Super Coach <-> Admin Evaluation Sync)
      case 'evaluations':
      case 'evaluation_review':
        return <EvaluationReviewModule />;

      // 5. Attendance & Compensation (Student Attendance, Coach Attendance, Compensation Classes)
      case 'attendance_compensation':
      case 'attendance':
      case 'compensation':
      case 'leaves':
      case 'coach_leaves':
        return <AttendanceCompensationModule />;

      // 6. Fees & Payments (Fee Structures, Student Assignments, Invoices, Payments, Pending Fees)
      case 'fees_payments':
      case 'payments':
      case 'fees':
      case 'invoices':
        return <FeesPaymentsModule />;

      // 7. Sports & Events (Competitions, Registrations, Results, Certificates)
      case 'sports_events':
      case 'competitions':
      case 'certificates':
        return <SportsEventsModule />;

      // 8. Communication (Announcements, Feedback, Parent Communication, Support Requests)
      case 'communication':
      case 'feedback':
      case 'announcements':
        return <CommunicationModule />;

      // 9. Access Management (User Governance, Location Access, Roles & Permissions, Activity History, Accounts)
      case 'access_management':
      case 'access':
      case 'accounts':
      case 'users':
        return <AccessManagementModule />;

      // 10. Reports & Settings (Analytics, Data Export, Backup & Recovery)
      case 'reports_settings':
      case 'reports':
      case 'export':
      case 'backup':
      case 'analytics':
        return <ReportsSettingsModule />;

      // 11. Settings & Configuration (Academy Settings, Brand & Identity, Center Management, Academic Calendar, Terms & Conditions, Audit Log)
      case 'settings':
      case 'academy_settings':
      case 'centers':
      case 'locations':
      case 'terms_policies':
      case 'terms':
      case 'policies':
        return <AcademySettings />;

      // 12. Sports Equipment Management (Academy-Wide Inventory & Sanctions)
      case 'equipment':
      case 'equipment_management':
        return <EquipmentManagementModule role="admin" />;

      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="h-screen w-full bg-white text-[#172B50] flex overflow-hidden font-sans selection:bg-[#F4510B] selection:text-white">
      
      {/* ============================================================ */}
      {/* 1. LEFT SIDEBAR: Independent Navigation (100vh, fixed width) */}
      {/* ============================================================ */}
      <Sidebar />

      {/* ============================================================ */}
      {/* 2. RIGHT SECTION: Separate Header & Independent Dashboard    */}
      {/* ============================================================ */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative">
        
        {/* Ambient Mouse Floating Glow */}
        <MouseFloatingGlow />

        {/* Subtle Branded Background Watermark (img2) */}
        <div 
          aria-hidden="true"
          className="absolute inset-0 top-16 pointer-events-none select-none flex items-center justify-center z-0 overflow-hidden"
        >
          <img 
            src="/assets/zenconnect-bg-watermark.png" 
            alt="" 
            className="w-[320px] sm:w-[480px] lg:w-[600px] max-w-[85%] h-auto object-contain opacity-[0.035] mix-blend-multiply"
          />
        </div>

        {/* Mobile Header Menu (Only visible on screens < 1024px) */}
        <div className="lg:hidden p-3 flex items-center justify-between bg-white border-b border-[#172B501A] shrink-0 z-20">
          <button 
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-[#172B50] hover:bg-white transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5 text-[#172B50]" />
          </button>
        </div>

        {/* Right Main Dashboard Content: independently scrollable */}
        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="px-5 sm:px-7 lg:px-9 py-6 w-full space-y-6">
            
            {/* Active Portal Content guarded by ErrorBoundary to prevent white screens */}
            <ErrorBoundary key={`${currentPortal}_${currentView}`}>
              {currentPortal === 'admin' && renderAdminView()}
              {currentPortal === 'super_coach' && <SuperCoachPortalView />}
              {currentPortal === 'parent' && <ParentPortalView />}
              {currentPortal === 'coach' && <CoachPortalView />}
              {currentPortal === 'support' && <SupportPortalView />}
            </ErrorBoundary>

          </div>
        </main>

      </div>

      {/* Global Interactive Notification Toasts */}
      <ToastContainer />

      {/* Role-based Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      {/* Mandatory First-Time Account Login Terms & Conditions Modal */}
      {shouldShowTermsModal && (
        <FirstTimeTermsModal
          isOpen={true}
          currentUser={currentUser}
          currentPortal={currentPortal}
        />
      )}

      {/* Daily Sports Motivational Welcome Modal (Displays once per day immediately after terms acceptance) */}
      {!shouldShowTermsModal && <DailyMotivationalModal />}

      {/* iPhone 18 Pro Max Simulator Viewport */}
      {isIphoneView && <IPhone18ProMaxSimulator />}

      {/* Floating iPhone 18 Pro Max Switcher Pill */}
      {!isIphoneView && (
        <button
          type="button"
          onClick={() => toggleIphoneView && toggleIphoneView(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-slate-950 to-[#172B50] hover:from-[#F4510B] hover:to-[#d83f05] text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.35)] border border-white/20 flex items-center gap-2.5 text-xs font-black transition-all hover:scale-105 active:scale-95 group cursor-pointer"
          title="Switch to iPhone 18 Pro Max Mobile Simulator"
        >
          <span className="p-1 rounded-full bg-white/10 group-hover:bg-white/25 text-white flex items-center justify-center">
            <Smartphone className="w-3.5 h-3.5 text-[#F4510B] group-hover:text-white" />
          </span>
          <span>iPhone 18 Pro Max View</span>
          <span className="px-1.5 py-0.5 rounded-full bg-[#F4510B] text-white text-[9.5px] font-black uppercase tracking-wider group-hover:bg-white group-hover:text-[#F4510B]">
            iOS 18
          </span>
        </button>
      )}

    </div>
  );
}
