import React, { useState } from 'react';
import { useCrm } from './context/CrmContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ToastContainer from './components/common/ToastContainer';
import LoginModal from './components/common/LoginModal';
import SpartzenLoginPage from './components/auth/SpartzenLoginPage';

// Admin Portal Modules
import AdminDashboard from './portals/admin/AdminDashboard';
import EnquiryManagement from './portals/admin/EnquiryManagement';
import StudentManagement from './portals/admin/StudentManagement';
import ParentManagement from './portals/admin/ParentManagement';
import CoachManagement from './portals/admin/CoachManagement';
import ProgramsClasses from './portals/admin/ProgramsClasses';
import PaymentsBilling from './portals/admin/PaymentsBilling';
import AttendanceManagement from './portals/admin/AttendanceManagement';
import CompetitionsModule from './portals/admin/CompetitionsModule';
import LeaveManagement from './portals/admin/LeaveManagement';
import FeedbackModule from './portals/admin/FeedbackModule';
import CertificatesModule from './portals/admin/CertificatesModule';
import ReportsAnalytics from './portals/admin/ReportsAnalytics';
import AcademySettings from './portals/admin/AcademySettings';

// Other Portals
import ParentPortalView from './portals/parent/ParentPortalView';
import CoachPortalView from './portals/coach/CoachPortalView';
import SupportPortalView from './portals/support/SupportPortalView';

export default function App() {
  const { currentPortal, currentView, setCurrentPortal, isLoggedIn } = useCrm();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // If logged out, display exact Little Spartans Spartzen login screen matching reference
  if (!isLoggedIn) {
    return (
      <>
        <SpartzenLoginPage />
        <ToastContainer />
      </>
    );
  }

  // Render view for Admin Portal
  const renderAdminView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'enquiries':
        return <EnquiryManagement />;
      case 'students':
        return <StudentManagement />;
      case 'parents':
        return <ParentManagement />;
      case 'coaches':
        return <CoachManagement />;
      case 'classes':
        return <ProgramsClasses />;
      case 'payments':
        return <PaymentsBilling />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'competitions':
        return <CompetitionsModule />;
      case 'leaves':
        return <LeaveManagement />;
      case 'feedback':
        return <FeedbackModule />;
      case 'certificates':
        return <CertificatesModule />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'settings':
        return <AcademySettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="h-screen w-full bg-[#FFF4E8] text-[#172B50] flex overflow-hidden font-sans selection:bg-[#F4510B] selection:text-white">
      
      {/* ============================================================ */}
      {/* 1. LEFT SIDEBAR: Independent Navigation (100vh, fixed width) */}
      {/* ============================================================ */}
      <Sidebar />

      {/* ============================================================ */}
      {/* 2. RIGHT SECTION: Separate Header & Independent Dashboard    */}
      {/* ============================================================ */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative">
        
        {/* Right Top Navbar: starts immediately after left sidebar */}
        <Navbar onOpenLogin={() => setIsLoginModalOpen(true)} />

        {/* Right Main Dashboard Content: independently scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            
            {/* Active Portal Content */}
            {currentPortal === 'admin' && renderAdminView()}
            {currentPortal === 'parent' && <ParentPortalView />}
            {currentPortal === 'coach' && <CoachPortalView />}
            {currentPortal === 'support' && <SupportPortalView />}

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

    </div>
  );
}
