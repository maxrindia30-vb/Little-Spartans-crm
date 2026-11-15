import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  User,
  Plus, 
  Download, 
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Calendar,
  CalendarDays,
  Globe,
  TrendingUp,
  Search,
  Bell,
  Upload,
  Star,
  BarChart2,
  MapPin,
  Inbox,
  Mail,
  Trophy,
  Share2
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';
import { getCommonLocations } from '../../services/locationService';
import { calculateDemoMetrics } from '../../services/demoService';

export default function AdminDashboard() {
  const { data, setCurrentView, addStudent, addEnquiry, addPayment, addToast } = useCrm();
  const commonLocations = getCommonLocations(data);

  const [modalType, setModalType] = useState(null); // 'student' | 'enquiry' | 'payment'

  // Quick form states
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAge, setNewStudentAge] = useState('7');
  const [newStudentProgram, setNewStudentProgram] = useState(data.programs?.[0]?.name || '');
  const [newStudentParent, setNewStudentParent] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');

  const [enqChild, setEnqChild] = useState('');
  const [enqParent, setEnqParent] = useState('');
  const [enqPhone, setEnqPhone] = useState('');
  const [enqEmail, setEnqEmail] = useState('');
  const [enqLocation, setEnqLocation] = useState(commonLocations[0]?.name || 'KK NAGAR');
  const [enqProgram, setEnqProgram] = useState(data.programs?.[0]?.name || '');

  const [payStudent, setPayStudent] = useState(data.students?.[0]?.name || '');
  const [payAmount, setPayAmount] = useState('4500');

  // Live dynamic CRM metrics (NO hardcoded fake numbers)
  const demoMetrics = calculateDemoMetrics(data.enquiries || [], data.demos || [], data.students || []);
  const totalEnquiries = demoMetrics.totalEnquiries || 0;
  const websiteCount = demoMetrics.websiteEnquiries || 0;
  const manualCount = demoMetrics.manualEnquiries || 0;
  const websitePct = totalEnquiries > 0 ? Math.round((websiteCount / totalEnquiries) * 100) : 0;
  const manualPct = totalEnquiries > 0 ? Math.round((manualCount / totalEnquiries) * 100) : 0;

  // Live lists
  const activeEnquiries = (data.enquiries || []).filter(e => e.stage === 'New' || e.stage === 'Follow-up' || e.stage === 'Interested');
  const activeDemos = (data.demos || []).filter(d => d.status !== 'Cancelled');
  const activeStudents = (data.students || []).slice(-3).reverse();
  const liveClasses = data.classSchedules || [];

  const handleCreateStudent = (e) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentParent.trim()) return;
    addStudent({
      name: newStudentName,
      age: parseInt(newStudentAge) || 7,
      gender: 'Youth',
      parentName: newStudentParent,
      parentPhone: newStudentPhone || '+91 98000 00000',
      parentEmail: `${newStudentParent.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      program: newStudentProgram || 'Junior Football Champions',
      center: data.academy?.centers?.[0] || 'KK NAGAR',
      coachName: data.coaches?.[0]?.name || 'Unassigned Coach',
      rank: 'Little Spartan Recruit',
      medicalNote: 'Routine fitness check passed'
    });
    setModalType(null);
    setNewStudentName('');
    setNewStudentParent('');
    setNewStudentPhone('');
  };

  const handleCreateEnquiry = (e) => {
    e.preventDefault();
    if (!enqChild.trim() || !enqParent.trim()) return;
    addEnquiry({
      childName: enqChild,
      childAge: 6,
      parentName: enqParent,
      phone: enqPhone || '+91 98765 00000',
      email: enqEmail.trim() || `${enqParent.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      interestedProgram: enqProgram || 'Junior Football Champions',
      center: enqLocation || commonLocations[0]?.name || 'KK NAGAR',
      notes: 'Parent submitted quick walk-in lead at academy reception desk.',
      stage: 'New'
    });
    setModalType(null);
    setEnqChild('');
    setEnqParent('');
    setEnqPhone('');
    setEnqEmail('');
  };

  const handleQuickPayment = (e) => {
    e.preventDefault();
    const stu = data.students.find(s => s.name === payStudent) || data.students[0];
    if (!stu) {
      addToast('Enroll a student first before recording a payment.', 'error');
      return;
    }
    addPayment({
      studentId: stu.id,
      studentName: stu.name,
      parentName: stu.parentName,
      amount: parseInt(payAmount) || 4500,
      program: stu.program,
      billingMonth: 'November 2026',
      paymentMethod: 'UPI Instant Desk'
    });
    setModalType(null);
  };

  return (
    <div className="space-y-6 sm:space-y-7 animate-slide-up pb-8">
      
      {/* ============================================================ */}
      {/* 1. TOP HEADER: Good Morning, Admin! & Action Icons           */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Heading & Subtitle */}
        <div>
          <h1 className="text-2xl sm:text-[28px] font-black text-[#172B50] tracking-tight flex items-center gap-2">
            <span>Good Morning, Admin!</span>
            <span className="inline-block transform origin-bottom hover:rotate-12 transition-transform cursor-default">👋</span>
          </h1>
          <p className="text-xs sm:text-[13px] font-semibold text-[#172B50]/60 mt-0.5 tracking-tight">
            Dashboard
          </p>
        </div>

        {/* Right: Quick Action Round Buttons (Search, Bell, Profile, Plus, Export, Calendar) */}
        <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2.5 self-start sm:self-auto shrink-0">
          {/* Top Row: Search, Bell with Orange Dot, Admin Profile */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => addToast('Search active roster and records')}
              className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4 text-[#172B50]" />
            </button>

            <button
              type="button"
              onClick={() => addToast('No unread notifications')}
              className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-[#172B50]" />
              <span className="w-2 h-2 rounded-full bg-[#F4510B] absolute top-2 right-2 ring-1 ring-white" />
            </button>

            <div 
              onClick={() => setCurrentView('people')}
              className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full ring-2 ring-white shadow-2xs overflow-hidden cursor-pointer" 
              title="Admin Profile"
            >
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"
                alt="Admin"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Bottom Row: Plus, Share/Export, Calendar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalType('student')}
              className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer"
              title="Enroll Student"
            >
              <Plus className="w-4 h-4 text-[#172B50]" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('export')}
              className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer"
              title="Export Academy Data"
            >
              <Upload className="w-4 h-4 text-[#172B50]" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('schedules')}
              className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white border border-[#172B5015] shadow-2xs flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] transition-all cursor-pointer"
              title="Class Schedules"
            >
              <Calendar className="w-4 h-4 text-[#172B50]" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. FOUR PIPELINE SECTIONS WITH SVG FORK / BRACKET CONNECTORS  */}
      {/* ============================================================ */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
          
          {/* ---------------------------------------------------- */}
          {/* Card 1: Enquiry Intake (Lead Capture)                 */}
          {/* ---------------------------------------------------- */}
          <div className="relative bg-[#FFF9F5] rounded-[24px] p-4.5 sm:p-5 border border-[#F4510B18] shadow-[0_4px_25px_rgba(244,81,11,0.03)] flex flex-col justify-between min-h-[290px]">
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white text-[#F4510B] border border-[#F4510B25] shadow-2xs flex items-center justify-center shrink-0">
                  <Inbox className="w-4.5 h-4.5 text-[#F4510B]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                    Enquiry Intake
                  </h3>
                  <p className="text-[11px] font-medium text-[#172B50]/60">
                    Capture and qualify new leads
                  </p>
                </div>
              </div>

              {/* Dynamic Enquiries or Clean Zero State */}
              {activeEnquiries.length === 0 ? (
                <div className="py-7 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#F4510B] border border-[#F4510B20] flex items-center justify-center mb-2 shadow-2xs">
                    <Inbox className="w-5 h-5 text-[#F4510B]" />
                  </div>
                  <p className="text-xs font-black text-[#172B50]">No enquiries logged yet</p>
                  <p className="text-[10.5px] font-medium text-[#172B50]/55 mt-0.5">Capture new leads to start pipeline</p>
                  <button
                    type="button"
                    onClick={() => setModalType('enquiry')}
                    className="mt-3 px-3.5 py-1.5 text-xs font-bold text-[#F4510B] bg-white border border-[#F4510B30] hover:bg-[#F4510B] hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    + Add Enquiry
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeEnquiries.slice(0, 3).map((enq) => (
                    <div key={enq.id} className="bg-white rounded-2xl p-3 sm:p-3.5 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-[#172B50] truncate">{enq.childName}</p>
                        <p className="text-[10.5px] font-medium text-[#172B50]/60 mt-0.5 truncate">{enq.interestedProgram || 'Sports'} • {enq.center || 'KK NAGAR'}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => addToast(`${enq.childName} enquiry verified`)}
                          className="w-7 h-7 rounded-lg bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
                          title="Verify"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentView('demos')}
                          className="w-7 h-7 rounded-lg bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B] transition-all cursor-pointer"
                          title="Schedule Trial"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Label */}
            <p className="text-[11.5px] font-bold text-[#172B50] text-center pt-4 tracking-tight">
              Lead Capture
            </p>

            {/* Desktop Connector 1 to Card 2: Cyan/Blue Bracket Curve */}
            {activeEnquiries.length > 0 && (
              <div className="hidden lg:block absolute -right-[22px] top-[48%] -translate-y-1/2 w-[22px] h-[105px] pointer-events-none z-20">
                <svg className="w-full h-full" viewBox="0 0 24 105" fill="none" preserveAspectRatio="none">
                  <path 
                    d="M 0,28 C 9,28 10,52 14,52 C 18,52 19,22 24,22" 
                    stroke="#0284C7" 
                    strokeWidth="1.8" 
                    fill="none" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M 14,52 L 24,52" 
                    stroke="#0284C7" 
                    strokeWidth="1.8" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M 0,77 C 9,77 10,52 14,52 C 18,52 19,82 24,82" 
                    stroke="#0284C7" 
                    strokeWidth="1.8" 
                    fill="none" 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------- */}
          {/* Card 2: Demo & Assessment (Demo Management)           */}
          {/* ---------------------------------------------------- */}
          <div className="relative bg-[#F4FAFF] rounded-[24px] p-4.5 sm:p-5 border border-[#0284C718] shadow-[0_4px_25px_rgba(2,132,199,0.03)] flex flex-col justify-between min-h-[290px]">
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white text-[#0284C7] border border-[#0284C725] shadow-2xs flex items-center justify-center shrink-0">
                  <Mail className="w-4.5 h-4.5 text-[#0284C7]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                    Demo &amp; Assessment
                  </h3>
                  <p className="text-[11px] font-medium text-[#172B50]/60">
                    Schedule and track demo sessions
                  </p>
                </div>
              </div>

              {/* Dynamic Demos or Clean Zero State */}
              {activeDemos.length === 0 ? (
                <div className="py-7 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#0284C7] border border-[#0284C720] flex items-center justify-center mb-2 shadow-2xs">
                    <Mail className="w-5 h-5 text-[#0284C7]" />
                  </div>
                  <p className="text-xs font-black text-[#172B50]">No demos scheduled</p>
                  <p className="text-[10.5px] font-medium text-[#172B50]/55 mt-0.5">Trials will appear here once booked</p>
                  <button
                    type="button"
                    onClick={() => setCurrentView('demos')}
                    className="mt-3 px-3.5 py-1.5 text-xs font-bold text-[#0284C7] bg-white border border-[#0284C730] hover:bg-[#0284C7] hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    Demo Register
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeDemos.slice(0, 3).map((demo) => (
                    <div key={demo.id} className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-[#172B50] truncate">{demo.childName}</p>
                        <p className="text-[10.5px] font-medium text-[#172B50]/60 mt-0.5 truncate">{demo.program || 'Trial'} Demo</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => addToast(`${demo.childName} demo verified`)}
                          className="w-7 h-7 rounded-lg bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
                          title="Verify Demo"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentView('demos')}
                          className="w-7 h-7 rounded-lg bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-[#F0F7FF] hover:text-[#0284C7] transition-all cursor-pointer"
                          title="View Slot"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Label */}
            <p className="text-[11.5px] font-bold text-[#172B50] text-center pt-4 tracking-tight">
              Demo Management
            </p>

            {/* Desktop Connector 2 to Card 3: Orange Bracket Curve */}
            {activeDemos.length > 0 && (
              <div className="hidden lg:block absolute -right-[22px] top-[48%] -translate-y-1/2 w-[22px] h-[105px] pointer-events-none z-20">
                <svg className="w-full h-full" viewBox="0 0 24 105" fill="none" preserveAspectRatio="none">
                  <path 
                    d="M 0,22 C 9,22 10,52 14,52 C 18,52 19,22 24,22" 
                    stroke="#F4510B" 
                    strokeWidth="1.8" 
                    fill="none" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M 0,52 L 24,52" 
                    stroke="#F4510B" 
                    strokeWidth="1.8" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M 0,82 C 9,82 10,52 14,52 C 18,52 19,82 24,82" 
                    stroke="#F4510B" 
                    strokeWidth="1.8" 
                    fill="none" 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------- */}
          {/* Card 3: Admission & Enrollment (Enrollment)          */}
          {/* ---------------------------------------------------- */}
          <div className="relative bg-[#F4FDF7] rounded-[24px] p-4.5 sm:p-5 border border-[#16A34A18] shadow-[0_4px_25px_rgba(22,163,74,0.03)] flex flex-col justify-between min-h-[290px]">
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white text-[#16A34A] border border-[#16A34A25] shadow-2xs flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4.5 h-4.5 text-[#16A34A]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                    Admission &amp; Enrollment
                  </h3>
                  <p className="text-[11px] font-medium text-[#172B50]/60">
                    Convert demo to enrollment
                  </p>
                </div>
              </div>

              {/* Dynamic Students or Clean Zero State */}
              {activeStudents.length === 0 ? (
                <div className="py-7 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#16A34A] border border-[#16A34A20] flex items-center justify-center mb-2 shadow-2xs">
                    <GraduationCap className="w-5 h-5 text-[#16A34A]" />
                  </div>
                  <p className="text-xs font-black text-[#172B50]">No enrolled students yet</p>
                  <p className="text-[10.5px] font-medium text-[#172B50]/55 mt-0.5">Enrolled recruits will appear here</p>
                  <button
                    type="button"
                    onClick={() => setModalType('student')}
                    className="mt-3 px-3.5 py-1.5 text-xs font-bold text-[#16A34A] bg-white border border-[#16A34A30] hover:bg-[#16A34A] hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    + Enroll Student
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeStudents.map((stu) => (
                    <div key={stu.id} className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#172B500C] shadow-2xs flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-[#172B50] truncate">{stu.name}</p>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] mt-0.5">
                          Enrolled
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => addToast(`${stu.name} roster active`)}
                          className="w-7 h-7 rounded-lg bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
                          title="Enrolled"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentView('people')}
                          className="w-7 h-7 rounded-lg bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
                          title="View Profile"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Label */}
            <p className="text-[11.5px] font-bold text-[#172B50] text-center pt-4 tracking-tight">
              Enrollment
            </p>

            {/* Desktop Connector 3 to Card 4: S-curve line directly to Class Schedule tile */}
            {activeStudents.length > 0 && (
              <div className="hidden lg:block absolute -right-[22px] top-[48%] -translate-y-1/2 w-[22px] h-[105px] pointer-events-none z-20">
                <svg className="w-full h-full" viewBox="0 0 24 105" fill="none" preserveAspectRatio="none">
                  <path 
                    d="M 0,82 C 10,82 12,30 24,30" 
                    stroke="#0284C7" 
                    strokeWidth="1.8" 
                    fill="none" 
                    strokeLinecap="round" 
                  />
                  <circle cx="2" cy="82" r="2" fill="#0284C7" />
                  <circle cx="22" cy="30" r="2" fill="#0284C7" />
                </svg>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------- */}
          {/* Card 4: Student Engagement (After Enrollment)        */}
          {/* ---------------------------------------------------- */}
          <div className="relative bg-white rounded-[24px] p-4.5 sm:p-5 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)] flex flex-col justify-between min-h-[290px]">
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#FFF5ED] text-[#F4510B] border border-[#F4510B25] shadow-2xs flex items-center justify-center shrink-0">
                  <Calendar className="w-4.5 h-4.5 text-[#F4510B]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                    Student Engagement
                  </h3>
                  <p className="text-[11px] font-medium text-[#172B50]/60">
                    Ongoing student lifecycle
                  </p>
                </div>
              </div>

              {/* 4 Action Tiles: 2x2 grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Tile 1: Class Schedule (Active dark blue) */}
                <button
                  type="button"
                  onClick={() => setCurrentView('schedules')}
                  className="bg-[#0B3B60] text-white rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm hover:bg-[#082d4a] active:scale-95 transition-all cursor-pointer min-h-[72px]"
                >
                  <Calendar className="w-4.5 h-4.5 text-white mb-1.5" />
                  <span className="text-[11px] font-black text-white leading-tight">
                    Class Schedule
                  </span>
                </button>

                {/* Tile 2: Attendance */}
                <button
                  type="button"
                  onClick={() => setCurrentView('attendance_compensation')}
                  className="bg-white text-[#172B50] rounded-2xl p-3 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[72px]"
                >
                  <BarChart2 className="w-4.5 h-4.5 text-[#172B50] mb-1.5" />
                  <span className="text-[11px] font-black text-[#172B50] leading-tight">
                    Attendance
                  </span>
                </button>

                {/* Tile 3: Performance */}
                <button
                  type="button"
                  onClick={() => setCurrentView('sports_events')}
                  className="bg-white text-[#172B50] rounded-2xl p-3 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[72px]"
                >
                  <Star className="w-4.5 h-4.5 text-[#172B50] mb-1.5" />
                  <span className="text-[11px] font-black text-[#172B50] leading-tight">
                    Performance
                  </span>
                </button>

                {/* Tile 4: Parent Updates */}
                <button
                  type="button"
                  onClick={() => setCurrentView('communication')}
                  className="bg-white text-[#172B50] rounded-2xl p-3 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[72px]"
                >
                  <Users className="w-4.5 h-4.5 text-[#172B50] mb-1.5" />
                  <span className="text-[11px] font-black text-[#172B50] leading-tight">
                    Parent Updates
                  </span>
                </button>
              </div>
            </div>

            {/* Bottom Label */}
            <p className="text-[11.5px] font-bold text-[#172B50] text-center pt-4 tracking-tight">
              After Enrollment
            </p>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MIDDLE ROW: Today's Classes & Enquiry Sources (Side-by-Side) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* ---------------------------------------------------- */}
        {/* Left: Today's Classes Table (~60% / 7-8 cols)         */}
        {/* ---------------------------------------------------- */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-[24px] p-5 sm:p-6 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#172B5010]">
              <div className="w-7 h-7 rounded-lg bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4 text-[#F4510B]" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#172B50] tracking-tight">
                Today's Classes
              </h2>
            </div>

            {/* Live Classes Table or Clean Zero State */}
            {liveClasses.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center mb-2">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <p className="text-xs font-black text-[#172B50]">No classes scheduled for today</p>
                <p className="text-[11px] text-[#172B50]/60 mt-0.5">Scheduled training sessions will appear here live</p>
                <button
                  type="button"
                  onClick={() => setCurrentView('schedules')}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#F4510B] bg-[#FFF5ED] hover:bg-[#F4510B] hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <span>Open Class Schedules</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto mt-1">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-[#172B5010] text-[#172B50]/60 font-black uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">TIME</th>
                      <th className="py-2.5 px-3">CLASS / PROGRAM</th>
                      <th className="py-2.5 px-3">COACH</th>
                      <th className="py-2.5 px-3">LOCATION</th>
                      <th className="py-2.5 px-3 text-right">CAPACITY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#172B500C]">
                    {liveClasses.slice(0, 5).map((cls) => {
                      const enrolled = cls.enrolledCount ?? (cls.enrolledStudents ? cls.enrolledStudents.length : 0);
                      const capacity = cls.capacity || 20;
                      const isFull = enrolled >= capacity;
                      const isNearlyFull = !isFull && (enrolled / capacity >= 0.8);

                      return (
                        <tr key={cls.id} className="hover:bg-[#FFF4E8]/30 transition-colors cursor-pointer" onClick={() => setCurrentView('schedules')}>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2 font-black text-[#172B50]">
                              <Clock className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                              <span>{cls.startTime || cls.time || '09:00 AM'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-extrabold text-[#172B50]">
                            {cls.className || cls.program || 'Sports Session'}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 font-bold text-[#172B50]/85">
                              <User className="w-3.5 h-3.5 text-[#172B50]/40 shrink-0" />
                              <span>{cls.coachName || cls.coach || 'Assigned Coach'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 font-bold text-[#172B50]/75">
                              <MapPin className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                              <span>{cls.location || cls.center || 'KK NAGAR'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {isFull ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#F4510B] text-white shadow-2xs">
                                <Check className="w-3 h-3 text-white" />
                                <span>Full {enrolled}/{capacity}</span>
                              </span>
                            ) : isNearlyFull ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>{enrolled}/{capacity}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>{enrolled}/{capacity}</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Right: Enquiry Sources Donut Chart (~40% / 4-5 cols)  */}
        {/* ---------------------------------------------------- */}
        <div 
          onClick={() => setCurrentView('enquiries')}
          className="lg:col-span-5 xl:col-span-4 bg-white rounded-[24px] p-5 sm:p-6 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)] flex flex-col justify-between cursor-pointer hover:border-[#F4510B35] transition-all"
        >
          <div>
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#172B5010]">
              <div className="w-7 h-7 rounded-lg bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-[#F4510B]" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#172B50] tracking-tight">
                Enquiry Sources
              </h2>
            </div>

            {/* Donut and Legend */}
            <div className="flex items-center justify-center sm:justify-start gap-5 sm:gap-7 mt-4 pt-1">
              {/* SVG Donut */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg className="w-36 h-36" viewBox="0 0 160 160">
                  {/* Background track circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="50"
                    fill="transparent"
                    stroke="#172B50"
                    strokeWidth="20"
                    opacity={totalEnquiries > 0 ? "0.08" : "0.12"}
                  />

                  {totalEnquiries > 0 && (
                    <>
                      {/* Website Segment */}
                      <circle
                        cx="80"
                        cy="80"
                        r="50"
                        fill="transparent"
                        stroke="#F4510B"
                        strokeWidth="20"
                        strokeDasharray={`${(websiteCount / totalEnquiries) * 314.16} 314.16`}
                        strokeDashoffset="0"
                        transform="rotate(-90 80 80)"
                      />
                      {/* Manual / Walk-in Segment */}
                      <circle
                        cx="80"
                        cy="80"
                        r="50"
                        fill="transparent"
                        stroke="#0284C7"
                        strokeWidth="20"
                        strokeDasharray={`${(manualCount / totalEnquiries) * 314.16} 314.16`}
                        strokeDashoffset={`-${(websiteCount / totalEnquiries) * 314.16}`}
                        transform="rotate(-90 80 80)"
                      />
                    </>
                  )}

                  {/* Inner text matching live metrics */}
                  <text x="80" y="74" textAnchor="middle" className="text-3xl font-black fill-[#172B50] font-sans">
                    {totalEnquiries}
                  </text>
                  <text x="80" y="90" textAnchor="middle" className="text-[10px] font-bold fill-[#172B50] opacity-65 font-sans tracking-wider uppercase">
                    Total
                  </text>
                  <text x="80" y="102" textAnchor="middle" className="text-[10px] font-bold fill-[#172B50] opacity-65 font-sans tracking-wider uppercase">
                    Enquiries
                  </text>
                </svg>
              </div>

              {/* Dynamic Legend */}
              <div className="space-y-3 text-xs w-full max-w-[150px]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F4510B] shrink-0" />
                    <span className="font-extrabold text-[#172B50]">Website</span>
                  </div>
                  <span className="font-black text-[#172B50]">{websitePct}% ({websiteCount})</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] shrink-0" />
                    <span className="font-extrabold text-[#172B50]">Manual / Walk-in</span>
                  </div>
                  <span className="font-black text-[#172B50]">{manualPct}% ({manualCount})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 4. BOTTOM SECTION: Demo Performance (4 Cards in a Strip)      */}
      {/* ============================================================ */}
      <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)]">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0">
            <BarChart2 className="w-4 h-4 text-[#F4510B]" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#172B50] tracking-tight">
            Demo Performance
          </h2>
        </div>

        {/* 4 Metric Cards Bound to Real Live CRM Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Demos */}
          <div 
            onClick={() => setCurrentView('demos')}
            className="bg-gradient-to-br from-[#F0F7FF] via-[#F8FBFF] to-white rounded-2xl p-4 sm:p-5 border border-[#BAE6FD]/60 flex items-center gap-4 shadow-2xs hover:border-[#0284C7] transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
              <Calendar className="w-5.5 h-5.5 text-[#0284C7]" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                {demoMetrics.totalDemos || 0}
              </p>
              <p className="text-xs font-bold text-[#172B50]/70 mt-1">
                Total Demos
              </p>
            </div>
          </div>

          {/* Card 2: Upcoming */}
          <div 
            onClick={() => setCurrentView('demos')}
            className="bg-gradient-to-br from-[#FAF5FF] via-[#FCF9FF] to-white rounded-2xl p-4 sm:p-5 border border-[#E9D5FF]/60 flex items-center gap-4 shadow-2xs hover:border-[#9333EA] transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
              <Clock className="w-5.5 h-5.5 text-[#9333EA]" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                {demoMetrics.upcomingDemos || 0}
              </p>
              <p className="text-xs font-bold text-[#172B50]/70 mt-1">
                Upcoming
              </p>
            </div>
          </div>

          {/* Card 3: Completed */}
          <div 
            onClick={() => setCurrentView('demos')}
            className="bg-gradient-to-br from-[#F0FDF4] via-[#F8FDF9] to-white rounded-2xl p-4 sm:p-5 border border-[#BBF7D0]/60 flex items-center gap-4 shadow-2xs hover:border-[#16A34A] transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5.5 h-5.5 text-[#16A34A]" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                {demoMetrics.completedDemos || 0}
              </p>
              <p className="text-xs font-bold text-[#172B50]/70 mt-1">
                Completed
              </p>
            </div>
          </div>

          {/* Card 4: Conversions */}
          <div 
            onClick={() => setCurrentView('demos')}
            className="bg-gradient-to-br from-[#FFF5ED] via-[#FFF9F5] to-white rounded-2xl p-4 sm:p-5 border border-[#FED7AA]/60 flex items-center gap-4 shadow-2xs hover:border-[#F4510B] transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FFE2D1] text-[#F4510B] flex items-center justify-center shrink-0">
              <Trophy className="w-5.5 h-5.5 text-[#F4510B]" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#172B50] leading-none tracking-tight">
                {demoMetrics.studentConversions || 0}
              </p>
              <p className="text-xs font-bold text-[#172B50]/70 mt-1">
                Conversions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. MODALS (Enroll Student, Add Enquiry, Quick Payment)         */}
      {/* ============================================================ */}
      {/* 1. Enroll Student Modal */}
      <Modal
        isOpen={modalType === 'student'}
        onClose={() => setModalType(null)}
        title="Enroll New Spartan Student"
        subtitle="Register athlete into official Little Spartans Academy roster"
      >
        <form onSubmit={handleCreateStudent} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Athlete Full Name *</label>
            <input
              type="text"
              required
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Age *</label>
              <input
                type="number"
                min="3"
                max="16"
                required
                value={newStudentAge}
                onChange={(e) => setNewStudentAge(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Assigned Program</label>
              <select
                value={newStudentProgram}
                onChange={(e) => setNewStudentProgram(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {data.programs.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                value={newStudentParent}
                onChange={(e) => setNewStudentParent(e.target.value)}
                placeholder="e.g. Shalini Rao"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Contact Phone *</label>
              <input
                type="tel"
                required
                value={newStudentPhone}
                onChange={(e) => setNewStudentPhone(e.target.value)}
                placeholder="+91 98888 77777"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Enroll Athlete Now
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Add Enquiry Modal */}
      <Modal
        isOpen={modalType === 'enquiry'}
        onClose={() => setModalType(null)}
        title="Add New Enquiry"
        subtitle="Capture prospective student information"
      >
        <form onSubmit={handleCreateEnquiry} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Child Name *</label>
              <input
                type="text"
                required
                value={enqChild}
                onChange={(e) => setEnqChild(e.target.value)}
                placeholder="Child's name"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Parent Name *</label>
              <input
                type="text"
                required
                value={enqParent}
                onChange={(e) => setEnqParent(e.target.value)}
                placeholder="Parent's name"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={enqPhone}
                onChange={(e) => setEnqPhone(e.target.value)}
                placeholder="+91 98..."
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Parent Email ID</label>
              <input
                type="email"
                value={enqEmail}
                onChange={(e) => setEnqEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Location *</label>
              <select
                value={enqLocation}
                onChange={(e) => setEnqLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {commonLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Interested Program</label>
              <select
                value={enqProgram}
                onChange={(e) => setEnqProgram(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {data.programs.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Save Enquiry
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Quick Payment Modal */}
      <Modal
        isOpen={modalType === 'payment'}
        onClose={() => setModalType(null)}
        title="Record Fee Collection"
        subtitle="Generate instant receipt for tuition fee"
      >
        <form onSubmit={handleQuickPayment} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Select Student</label>
            <select
              value={payStudent}
              onChange={(e) => setPayStudent(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            >
              {data.students.map(s => (
                <option key={s.id} value={s.name}>{s.name} ({s.program})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Fee Amount (₹)</label>
            <input
              type="number"
              required
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Record Payment
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
