import React, { useState } from 'react';
import { useCrm } from './context/CrmContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ToastContainer from './components/common/ToastContainer';
import LoginModal from './components/common/LoginModal';
import SpartzenLoginPage from './components/auth/SpartzenLoginPage';

// Admin Portal 9 Master Modules
import AdminDashboard from './portals/admin/AdminDashboard';
import EnquiryManagement from './portals/admin/EnquiryManagement';
import PeopleManagementModule from './portals/admin/PeopleManagementModule';
import ProgramsClassesModule from './portals/admin/ProgramsClassesModule';
import AttendanceCompensationModule from './portals/admin/AttendanceCompensationModule';
import FeesPaymentsModule from './portals/admin/FeesPaymentsModule';
import SportsEventsModule from './portals/admin/SportsEventsModule';
import CommunicationModule from './portals/admin/CommunicationModule';
import ReportsSettingsModule from './portals/admin/ReportsSettingsModule';

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

  // Render view for Admin Portal (Strictly 9 Master Modules + backwards-compatible routing)
  const renderAdminView = () => {
    switch (currentView) {
      // 1. Dashboard
      case 'dashboard':
        return <AdminDashboard />;

      // 2. Enquiries
      case 'enquiries':
        return <EnquiryManagement />;

      // 3. People Management (Students, Parents, Coaches, Account Management)
      case 'people':
      case 'students':
      case 'parents':
      case 'coaches':
      case 'accounts':
        return <PeopleManagementModule />;

      // 4. Programs & Classes (Sports Programs, Batches, Class Schedules, Coach Assignments)
      case 'programs':
      case 'classes':
      case 'batches':
      case 'schedules':
        return <ProgramsClassesModule />;

      // 5. Attendance & Compensation (Student Attendance, Coach Attendance, Compensation Classes)
      case 'attendance_compensation':
      case 'attendance':
      case 'compensation':
      case 'leaves':
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

      // 9. Reports & Settings (Analytics, Data Export, Backup & Recovery, User Permissions, Settings)
      case 'reports_settings':
      case 'reports':
      case 'settings':
      case 'export':
      case 'backup':
      case 'permissions':
        return <ReportsSettingsModule />;

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
        
        {/* Subtle Branded Background Watermark (img2) */}
        <div 
          aria-hidden="true"
          className="absolute inset-0 top-16 pointer-events-none select-none flex items-center justify-center z-0 overflow-hidden"
        >
          <img 
            src="/assets/zenconnect-bg-watermark.png" 
            alt="" 
            className="w-[320px] sm:w-[480px] lg:w-[600px] max-w-[85%] h-auto object-contain opacity-[0.12] mix-blend-multiply"
          />
        </div>

        {/* Right Top Navbar: starts immediately after left sidebar */}
        <Navbar onOpenLogin={() => setIsLoginModalOpen(true)} />

        {/* Right Main Dashboard Content: independently scrollable */}
        <main className="flex-1 overflow-y-auto relative z-10">
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
