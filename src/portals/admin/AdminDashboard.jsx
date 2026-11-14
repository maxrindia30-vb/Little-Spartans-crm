import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  User,
  PhoneCall, 
  CreditCard, 
  AlertCircle, 
  Trophy, 
  Calendar, 
  Plus, 
  Download, 
  ArrowRight,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Clock,
  CalendarDays,
  Globe,
  TrendingUp,
  Coins,
  ChevronDown
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import KpiCard from '../../components/common/KpiCard';
import { RevenueTrendChart, AttendanceDonutChart, ProgramDistributionChart } from '../../components/common/Charts';
import Modal from '../../components/common/Modal';
import { getCommonLocations } from '../../services/locationService';
import { calculateDemoMetrics } from '../../services/demoService';

const InstagramIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const WhatsAppIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export default function AdminDashboard() {
  const { data, setCurrentView, addStudent, addEnquiry, addPayment, addToast } = useCrm();
  const commonLocations = getCommonLocations(data);

  const [modalType, setModalType] = useState(null); // 'student' | 'enquiry' | 'payment'

  // Quick form states
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAge, setNewStudentAge] = useState('7');
  const [newStudentProgram, setNewStudentProgram] = useState(data.programs[0]?.name || '');
  const [newStudentParent, setNewStudentParent] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');

  const [enqChild, setEnqChild] = useState('');
  const [enqParent, setEnqParent] = useState('');
  const [enqPhone, setEnqPhone] = useState('');
  const [enqEmail, setEnqEmail] = useState('');
  const [enqLocation, setEnqLocation] = useState(commonLocations[0]?.name || 'KK NAGAR');
  const [enqProgram, setEnqProgram] = useState(data.programs[0]?.name || '');

  const [payStudent, setPayStudent] = useState(data.students[0]?.name || '');
  const [payAmount, setPayAmount] = useState('4500');

  // KPI Computations
  const totalStudents = data.students.length;
  const totalParents = data.parents.length;
  const totalCoaches = data.coaches.length;
  const newEnquiries = data.enquiries.filter(e => e.stage === 'New' || e.stage === 'Trial Scheduled').length;
  const paidRevenue = data.payments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = data.payments.filter(p => p.status === 'Pending').length;
  const pendingAmount = data.payments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const demoMetrics = calculateDemoMetrics(data.enquiries || [], data.demos || [], data.students || []);

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
      program: newStudentProgram,
      center: data.academy.centers[0] || 'KK NAGAR',
      coachName: data.coaches[0]?.name || 'Unassigned Coach',
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
      interestedProgram: enqProgram,
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
    <div className="space-y-6 animate-slide-up">
      
      {/* Top Header & Quick Action Buttons matching reference image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight">
            Academy Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Little Spartans Chennai • Real-time Operations &amp; Student Performance
          </p>
        </div>

        {/* Quick Action CTAs */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setModalType('student')}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-2xl shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Enroll Student</span>
          </button>

          <button
            onClick={() => setModalType('enquiry')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-white text-[#172B50] border border-[#172B5020] rounded-2xl hover:bg-[#FFF4E8] hover:border-[#F4510B55] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <PhoneCall className="w-4 h-4 text-[#F4510B]" />
            <span>Add Enquiry</span>
          </button>

          <button
            onClick={() => setModalType('payment')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-white text-[#172B50] border border-[#172B5020] rounded-2xl hover:bg-[#FFF4E8] hover:border-[#F4510B55] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <CreditCard className="w-4 h-4 text-[#172B50]" />
            <span>Record Fee</span>
          </button>
        </div>
      </div>

      {/* 4 Hero KPI Cards matching reference user design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard
          title="Total Enquiries"
          value={demoMetrics.totalEnquiries || 25}
          subtitle={`${data.locations?.length || 5} Academy Branches`}
          icon={Users}
          color="orange"
          trend={12}
          onClick={() => setCurrentView('enquiries')}
        />

        <KpiCard
          title="Demo Scheduled"
          value={String(demoMetrics.upcomingDemos || 8).padStart(2, '0')}
          subtitle="Upcoming Trial Sessions"
          icon={Calendar}
          color="blue"
          trend={8}
          onClick={() => setCurrentView('demos')}
        />

        <KpiCard
          title="Enrolled Students"
          value={totalStudents || 12}
          subtitle="Active Enrolled Athletes"
          icon={GraduationCap}
          color="green"
          trend={20}
          onClick={() => setCurrentView('people')}
        />

        <KpiCard
          title="Conversion Rate"
          value={`${demoMetrics.conversionRate || 48}%`}
          subtitle="Lead-to-Admission Funnel"
          icon={TrendingUp}
          color="purple"
          trend={10}
          onClick={() => setCurrentView('demos')}
        />
      </div>

      {/* Row 2: Secondary Academy Financial & Staff Operations Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Tuition Collected */}
        <div 
          onClick={() => setCurrentView('fees_payments')}
          className="bg-white rounded-[24px] p-5 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)] flex items-center justify-between cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-[#FFF5ED] text-[#F59E0B] flex items-center justify-center shrink-0">
              <Coins className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#172B50] opacity-80 block">
                Tuition Collected
              </span>
              <p className="text-2xl font-black text-[#172B50] mt-0.5 tracking-tight">₹{paidRevenue.toLocaleString()}</p>
              <span className="text-xs font-bold text-emerald-600 block mt-0.5">
                {data.payments.filter((p) => p.status === 'Paid').length} paid invoices
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] text-emerald-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Pending Dues */}
        <div 
          onClick={() => setCurrentView('fees_payments')}
          className="bg-white rounded-[24px] p-5 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)] flex items-center justify-between cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#172B50] opacity-80 block">
                Pending Dues
              </span>
              <p className="text-2xl font-black text-rose-600 mt-0.5 tracking-tight">₹{pendingAmount.toLocaleString()}</p>
              <span className="text-xs font-bold text-rose-500 block mt-0.5">
                {pendingPayments} outstanding invoices
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
        </div>

        {/* Certified Faculty */}
        <div 
          onClick={() => setCurrentView('people')}
          className="bg-white rounded-[24px] p-5 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)] flex items-center justify-between cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-[#F4510B]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#172B50] opacity-80 block">
                Certified Faculty
              </span>
              <p className="text-2xl font-black text-[#172B50] mt-0.5 tracking-tight">{totalCoaches} Coaches</p>
              <span className="text-xs font-medium text-[#172B50] opacity-70 block mt-0.5">
                Kapil, Dibi, Hanif, Teja
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-[#F4510B]" />
          </div>
        </div>
      </div>

      {/* Row 3: Two Big Analytics Panels (Donut + Funnel on left, Enquiries Trend on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Panel: Enquiry Sources & Demo Conversion Performance (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[24px] p-5 sm:p-6 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-1.5 h-5 rounded-full bg-[#F4510B]" />
              <h3 className="text-base font-extrabold text-[#172B50] tracking-tight">
                Enquiry Sources &amp; Demo Conversion Performance
              </h3>
            </div>
            <p className="text-xs text-[#172B50] opacity-65 ml-4">
              Live funnel from multichannel leads to demo bookings and verified student admissions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mt-5 pt-2">
            {/* Donut Chart & Legend */}
            <div className="md:col-span-6 flex items-center gap-4">
              {/* SVG Donut */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg className="w-36 h-36" viewBox="0 0 160 160">
                  {/* Segment 1: Manual / Walk-in (40% - Orange #F4510B) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="50"
                    fill="transparent"
                    stroke="#F4510B"
                    strokeWidth="18"
                    strokeDasharray="125.66 188.5"
                    strokeDashoffset="0"
                    transform="rotate(-90 80 80)"
                  />
                  {/* Segment 2: Website (20% - Blue #0284C7) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="50"
                    fill="transparent"
                    stroke="#0284C7"
                    strokeWidth="18"
                    strokeDasharray="62.83 251.33"
                    strokeDashoffset="-125.66"
                    transform="rotate(-90 80 80)"
                  />
                  {/* Segment 3: Instagram (20% - Pink #EC4899) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="50"
                    fill="transparent"
                    stroke="#EC4899"
                    strokeWidth="18"
                    strokeDasharray="62.83 251.33"
                    strokeDashoffset="-188.49"
                    transform="rotate(-90 80 80)"
                  />
                  {/* Segment 4: WhatsApp (20% - Green #10B981) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="50"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="18"
                    strokeDasharray="62.83 251.33"
                    strokeDashoffset="-251.32"
                    transform="rotate(-90 80 80)"
                  />
                  {/* Inner text */}
                  <text x="80" y="74" textAnchor="middle" className="text-3xl font-black fill-[#172B50] font-sans">
                    {demoMetrics.totalEnquiries || 5}
                  </text>
                  <text x="80" y="91" textAnchor="middle" className="text-[10px] font-bold fill-[#172B50] opacity-65 font-sans tracking-wider uppercase">
                    Total
                  </text>
                  <text x="80" y="103" textAnchor="middle" className="text-[10px] font-bold fill-[#172B50] opacity-65 font-sans tracking-wider uppercase">
                    Enquiries
                  </text>
                </svg>
              </div>

              {/* Legend */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F4510B] shrink-0" />
                    <span className="font-semibold text-[#172B50]">Manual / Walk-in</span>
                  </div>
                  <span className="font-bold text-[#172B50]">40% ({demoMetrics.manualEnquiries || 2})</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] shrink-0" />
                    <span className="font-semibold text-[#172B50]">Website</span>
                  </div>
                  <span className="font-bold text-[#172B50]">20% ({demoMetrics.websiteEnquiries || 1})</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EC4899] shrink-0" />
                    <span className="font-semibold text-[#172B50]">Instagram</span>
                  </div>
                  <span className="font-bold text-[#172B50]">20% ({demoMetrics.instagramEnquiries || 1})</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                    <span className="font-semibold text-[#172B50]">WhatsApp</span>
                  </div>
                  <span className="font-bold text-[#172B50]">20% ({demoMetrics.whatsappEnquiries || 1})</span>
                </div>
              </div>
            </div>

            {/* Right: Conversion Funnel */}
            <div className="md:col-span-6 flex flex-col justify-between h-full pl-0 md:pl-5 border-t md:border-t-0 md:border-l border-[#172B5010] pt-4 md:pt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172B50]">Conversion Funnel</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#DCFCE7] text-[#16A34A] shadow-xs">
                  {demoMetrics.conversionRate || 48}% Conversion Rate
                </span>
              </div>

              {/* 4 Pillars with chevrons */}
              <div className="flex items-end justify-between gap-1.5 sm:gap-2 mt-4 pt-2">
                {/* 1: Enquiries */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-black text-[#172B50] mb-1.5">{demoMetrics.totalEnquiries || 25}</span>
                  <div className="w-11 sm:w-13 h-24 bg-[#D6ECFF] rounded-2xl shadow-xs" />
                  <span className="text-[10px] font-bold text-[#172B50] opacity-75 mt-2 text-center">Enquiries</span>
                </div>

                <span className="text-[#172B50] opacity-40 font-bold mb-8">&gt;</span>

                {/* 2: Demos */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-black text-[#172B50] mb-1.5">{String(demoMetrics.upcomingDemos || 8).padStart(2, '0')}</span>
                  <div className="w-11 sm:w-13 h-18 bg-[#F3E8FF] rounded-2xl shadow-xs" />
                  <span className="text-[10px] font-bold text-[#172B50] opacity-75 mt-2 text-center">Demos</span>
                </div>

                <span className="text-[#172B50] opacity-40 font-bold mb-8">&gt;</span>

                {/* 3: Completed Demos */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-black text-[#172B50] mb-1.5">{String(demoMetrics.completedDemos || 4).padStart(2, '0')}</span>
                  <div className="w-11 sm:w-13 h-13 bg-[#DCFCE7] rounded-2xl shadow-xs" />
                  <span className="text-[10px] font-bold text-[#172B50] opacity-75 mt-2 text-center leading-tight">
                    Completed<br />Demos
                  </span>
                </div>

                <span className="text-[#172B50] opacity-40 font-bold mb-8">&gt;</span>

                {/* 4: Enrolled */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-black text-[#172B50] mb-1.5">{totalStudents || 12}</span>
                  <div className="w-11 sm:w-13 h-20 bg-[#FFE2D1] rounded-2xl shadow-xs" />
                  <span className="text-[10px] font-bold text-[#172B50] opacity-75 mt-2 text-center">Enrolled</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Enquiries Trend (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[24px] p-5 sm:p-6 border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-5 rounded-full bg-[#F4510B]" />
              <h3 className="text-base font-extrabold text-[#172B50] tracking-tight">Enquiries Trend</h3>
            </div>

            <div className="relative">
              <select 
                aria-label="Enquiries trend time period"
                className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-bold bg-white text-[#172B50] border border-[#172B5018] shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
                defaultValue="30d"
              >
                <option value="30d">Last 30 Days</option>
                <option value="7d">Last 7 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#172B50] opacity-60 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* SVG Area Chart */}
          <div className="mt-4 pt-1 w-full">
            <svg className="w-full h-48 overflow-visible" viewBox="0 0 380 180">
              <defs>
                <linearGradient id="orangeTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F4510B" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F4510B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines & Y-ticks */}
              {[
                { y: 22, val: 25 },
                { y: 50, val: 20 },
                { y: 78, val: 15 },
                { y: 106, val: 10 },
                { y: 134, val: 5 },
                { y: 160, val: 0 },
              ].map((tick) => (
                <g key={tick.val}>
                  <line
                    x1="35"
                    y1={tick.y}
                    x2="370"
                    y2={tick.y}
                    stroke="#172B50"
                    strokeOpacity="0.08"
                    strokeDasharray="3 3"
                  />
                  <text
                    x="25"
                    y={tick.y + 4}
                    textAnchor="end"
                    className="text-[10px] font-semibold fill-[#172B50] opacity-50 font-sans"
                  >
                    {tick.val}
                  </text>
                </g>
              ))}

              {/* Shaded Area */}
              <path
                d="M 50,140 C 75,140 80,115 100,115 C 120,115 130,132 150,132 C 170,132 180,115 200,115 C 220,115 230,95 250,95 C 270,95 280,80 300,80 C 320,80 335,38 355,38 L 355,160 L 50,160 Z"
                fill="url(#orangeTrendGrad)"
              />

              {/* Line Curve */}
              <path
                d="M 50,140 C 75,140 80,115 100,115 C 120,115 130,132 150,132 C 170,132 180,115 200,115 C 220,115 230,95 250,95 C 270,95 280,80 300,80 C 320,80 335,38 355,38"
                fill="none"
                stroke="#F4510B"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data Node Circles */}
              {[
                { x: 50, y: 140 },
                { x: 100, y: 115 },
                { x: 150, y: 132 },
                { x: 200, y: 115 },
                { x: 250, y: 95 },
                { x: 300, y: 80 },
                { x: 355, y: 38 },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="5.5" fill="#F4510B" opacity="0.25" />
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#FFFFFF" stroke="#F4510B" strokeWidth="2.5" />
                </g>
              ))}

              {/* X-axis labels */}
              {[
                { x: 50, label: '1 Jan' },
                { x: 100, label: '5 Jan' },
                { x: 150, label: '10 Jan' },
                { x: 200, label: '15 Jan' },
                { x: 250, label: '20 Jan' },
                { x: 300, label: '25 Jan' },
                { x: 355, label: '30 Jan' },
              ].map((lbl) => (
                <text
                  key={lbl.label}
                  x={lbl.x}
                  y="176"
                  textAnchor="middle"
                  className="text-[10px] font-semibold fill-[#172B50] opacity-60 font-sans"
                >
                  {lbl.label}
                </text>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Row 4: Five Source Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Enquiries */}
        <div 
          onClick={() => setCurrentView('enquiries')}
          className="bg-gradient-to-br from-[#FFF5ED] to-white border border-[#FED7AA]/70 rounded-[22px] p-4 flex items-center gap-3.5 shadow-[0_4px_20px_rgba(244,81,11,0.04)] cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FFE2D1] text-[#F4510B] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#F4510B]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#172B50] opacity-70 block">
              Total Enquiries
            </span>
            <p className="text-2xl font-black text-[#172B50] mt-0.5">{demoMetrics.totalEnquiries || 5}</p>
            <span className="text-[11px] font-semibold text-[#172B50] opacity-60 block">All lead channels</span>
          </div>
        </div>

        {/* Website Enquiries */}
        <div 
          onClick={() => setCurrentView('enquiries')}
          className="bg-gradient-to-br from-[#F0F7FF] to-white border border-[#BAE6FD]/70 rounded-[22px] p-4 flex items-center gap-3.5 shadow-[0_4px_20px_rgba(2,132,199,0.04)] cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#D6ECFF] text-[#0284C7] flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-[#0284C7]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 block">
              Website Enquiries
            </span>
            <p className="text-2xl font-black text-blue-900 mt-0.5">{demoMetrics.websiteEnquiries || 1}</p>
            <span className="text-[11px] font-semibold text-blue-700 block">Online Web Ingestion</span>
          </div>
        </div>

        {/* Instagram Enquiries */}
        <div 
          onClick={() => setCurrentView('enquiries')}
          className="bg-gradient-to-br from-[#FAF5FF] to-white border border-[#F5D0FE]/70 rounded-[22px] p-4 flex items-center gap-3.5 shadow-[0_4px_20px_rgba(236,72,153,0.04)] cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] text-[#EC4899] flex items-center justify-center shrink-0">
            <InstagramIcon className="w-5 h-5 text-[#EC4899]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-fuchsia-800 block">
              Instagram Enquiries
            </span>
            <p className="text-2xl font-black text-fuchsia-900 mt-0.5">{demoMetrics.instagramEnquiries || 1}</p>
            <span className="text-[11px] font-semibold text-fuchsia-700 block">Social Media Leads</span>
          </div>
        </div>

        {/* WhatsApp Enquiries */}
        <div 
          onClick={() => setCurrentView('enquiries')}
          className="bg-gradient-to-br from-[#F0FDF4] to-white border border-[#BBF7D0]/70 rounded-[22px] p-4 flex items-center gap-3.5 shadow-[0_4px_20px_rgba(16,185,129,0.04)] cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
            <WhatsAppIcon className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
              WhatsApp Enquiries
            </span>
            <p className="text-2xl font-black text-emerald-900 mt-0.5">{demoMetrics.whatsappEnquiries || 1}</p>
            <span className="text-[11px] font-semibold text-emerald-700 block">Direct Inquiries</span>
          </div>
        </div>

        {/* Manual / Walk-in */}
        <div 
          onClick={() => setCurrentView('enquiries')}
          className="bg-gradient-to-br from-[#FFF9F5] to-white border border-[#FED7AA]/70 rounded-[22px] p-4 flex items-center gap-3.5 shadow-[0_4px_20px_rgba(244,81,11,0.04)] cursor-pointer hover:-translate-y-0.5 transition-all duration-200 col-span-2 sm:col-span-1"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FFE2D1] text-[#F4510B] flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-[#F4510B]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 block">
              Manual / Walk-in
            </span>
            <p className="text-2xl font-black text-[#F4510B] mt-0.5">{demoMetrics.manualEnquiries || 2}</p>
            <span className="text-[11px] font-semibold text-amber-800 block">Reception Desk</span>
          </div>
        </div>
      </div>

      {/* Row 5: Four Demo & Admission Funnel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Demos */}
        <div 
          onClick={() => setCurrentView('demos')}
          className="bg-gradient-to-br from-[#F0F7FF] via-[#F8FBFF] to-white border border-[#BAE6FD]/70 rounded-[22px] p-4 flex items-center gap-3.5 shadow-[0_4px_20px_rgba(2,132,199,0.04)] cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#D6ECFF] text-[#0284C7] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-[#0284C7]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 block">
              Total Demos
            </span>
            <p className="text-2xl font-black text-blue-900 mt-0.5">{demoMetrics.totalDemos || 3}</p>
            <span className="text-[11px] font-semibold text-blue-700 block">Trials Scheduled</span>
          </div>
        </div>

        {/* Upcoming Demos */}
        <div 
          onClick={() => setCurrentView('demos')}
          className="bg-gradient-to-br from-[#FAF5FF] via-[#FCF9FF] to-white border border-[#E9D5FF]/70 rounded-[22px] p-4 flex items-center gap-3.5 shadow-[0_4px_20px_rgba(147,51,234,0.04)] cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-[#9333EA]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800 block">
              Upcoming Demos
            </span>
            <p className="text-2xl font-black text-purple-900 mt-0.5">{demoMetrics.upcomingDemos || 1}</p>
            <span className="text-[11px] font-semibold text-purple-700 block">Active Bookings</span>
          </div>
        </div>

        {/* Completed Demos */}
        <div 
          onClick={() => setCurrentView('demos')}
          className="bg-gradient-to-br from-[#F0FDF4] via-[#F8FDF9] to-white border border-[#BBF7D0]/70 rounded-[22px] p-4 flex items-center gap-3.5 shadow-[0_4px_20px_rgba(22,163,74,0.04)] cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
              Completed Demos
            </span>
            <p className="text-2xl font-black text-emerald-900 mt-0.5">{demoMetrics.completedDemos || 2}</p>
            <span className="text-[11px] font-semibold text-emerald-700 block">Sessions Finished</span>
          </div>
        </div>

        {/* Student Conversions */}
        <div 
          onClick={() => setCurrentView('demos')}
          className="bg-gradient-to-br from-[#FFF5ED] via-[#FFF9F5] to-white border border-[#FED7AA]/70 rounded-[22px] p-4 flex items-center gap-3.5 shadow-[0_4px_20px_rgba(244,81,11,0.04)] cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FFE2D1] text-[#F4510B] flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-[#F4510B]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F4510B] block">
              Student Conversions
            </span>
            <p className="text-2xl font-black text-[#F4510B] mt-0.5">{demoMetrics.studentConversions || 4}</p>
            <span className="text-[11px] font-semibold text-[#F4510B] block">
              {demoMetrics.conversionRate || 80}% Conversion Rate
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Attendance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueTrendChart />
        </div>
        <div>
          <AttendanceDonutChart presentRate={92} />
        </div>
      </div>

      {/* Program Distribution & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Program Capacity Bar */}
        <div className="lg:col-span-1">
          <ProgramDistributionChart />
        </div>

        {/* Live Enquiry Pipeline */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-[#172B5012]">
            <div>
              <h4 className="text-sm font-extrabold text-[#172B50]">Recent Admission Enquiries</h4>
              <p className="text-xs text-[#172B50] opacity-70">Prospective young athletes awaiting trial or counseling</p>
            </div>
            <button
              onClick={() => setCurrentView('enquiries')}
              className="text-xs font-bold text-[#F4510B] hover:underline flex items-center gap-1"
            >
              <span>View All ({data.enquiries.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#172B5015] text-[#172B50] opacity-75 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Child & Age</th>
                  <th className="pb-2">Parent Contact</th>
                  <th className="pb-2">Program</th>
                  <th className="pb-2">Stage</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B5010]">
                {data.enquiries.slice(0, 4).map(enq => (
                  <tr key={enq.id} className="hover:bg-[#FFF4E8]/50 transition-colors">
                    <td className="py-2.5 font-bold text-[#172B50]">
                      <div>{enq.childName}</div>
                      <span className="text-[10px] text-[#172B50] opacity-60">{enq.childAge} yrs • {enq.center}</span>
                    </td>
                    <td className="py-2.5">
                      <div className="font-semibold text-[#172B50]">{enq.parentName}</div>
                      <span className="text-[10px] text-[#172B50] opacity-60">{enq.phone}</span>
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020]">
                        {enq.interestedProgram.replace('Spartan ', '')}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        enq.stage === 'Enrolled' 
                          ? 'bg-[#172B50] text-white' 
                          : enq.stage === 'Trial Scheduled'
                          ? 'bg-[#F4510B] text-white'
                          : 'bg-[#FFF4E8] text-[#172B50] border border-[#172B5020]'
                      }`}>
                        {enq.stage}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => setCurrentView('enquiries')}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#172B50] hover:bg-[#F4510B] rounded-lg transition-colors"
                      >
                        Follow up
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Upcoming Competitions & Academy Notices Banner */}
      <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#172B5012] gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#F4510B]" />
            <div>
              <h4 className="text-sm font-extrabold text-[#172B50]">Upcoming Academy Tournaments & Fixtures</h4>
              <p className="text-xs text-[#172B50] opacity-70">Inter-center championships, grading evaluations and external cups</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('competitions')}
            className="text-xs font-bold text-[#F4510B] hover:underline flex items-center gap-1"
          >
            <span>Competition Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {data.competitions.map(comp => (
            <div key={comp.id} className="p-4 rounded-xl bg-[#FFF4E8] border border-[#172B501A] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F4510B] block">
                  {comp.sport}
                </span>
                <h5 className="text-xs font-bold text-[#172B50] mt-1 leading-snug">{comp.title}</h5>
                <p className="text-[11px] text-[#172B50] opacity-75 mt-1.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#172B50]" />
                  <span>{comp.date} • {comp.venue.split(',')[0]}</span>
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-[#172B5015] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#172B50]">
                  {comp.registeredCount}/{comp.maxParticipants} Registered
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#F4510B] text-white">
                  {comp.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK MODALS */}
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
              placeholder="e.g. Advait Rao"
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
              <label className="text-xs font-bold text-[#172B50] block mb-1">Training Program *</label>
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
