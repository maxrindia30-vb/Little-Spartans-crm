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
import KpiCard, { AnimatedCounter } from '../../components/common/KpiCard';
import FloatingCard from '../../components/common/FloatingCard';
import TodaysClassesSection from '../../components/common/TodaysClassesSection';
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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-[#F4F7F6] tracking-tight">
            Dashboard
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-[#55CDB3]/15 text-[#55CDB3] border border-[#55CDB3]/30 shadow-xs select-none">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#55CDB3] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#55CDB3]"></span>
            </span>
            <span className="tracking-wider">LIVE SYNC</span>
          </div>
        </div>

        {/* Quick Action CTAs */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setModalType('student')}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs font-extrabold bg-[#55CDB3] text-[#080B0C] rounded-2xl shadow-sm hover:bg-[#55CDB3]/90 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#080B0C]" />
            <span>Enroll Student</span>
          </button>

          <button
            onClick={() => setModalType('enquiry')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/25 rounded-2xl hover:border-[#55CDB3] hover:bg-[#55CDB3]/10 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <PhoneCall className="w-4 h-4 text-[#55CDB3]" />
            <span>Add Enquiry</span>
          </button>

          <button
            onClick={() => setModalType('payment')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/25 rounded-2xl hover:border-[#55CDB3] hover:bg-[#55CDB3]/10 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <CreditCard className="w-4 h-4 text-[#493548]" />
            <span>Record Fee</span>
          </button>
        </div>
      </div>

      {/* 4 Hero KPI Cards matching reference user design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard
          title="Total Enquiries"
          value={demoMetrics.totalEnquiries || 0}
          icon={Users}
          color="orange"
          onClick={() => setCurrentView('enquiries')}
        />

        <KpiCard
          title="Demo Scheduled"
          value={String(demoMetrics.upcomingDemos || 0).padStart(2, '0')}
          icon={Calendar}
          color="blue"
          onClick={() => setCurrentView('demos')}
        />

        <KpiCard
          title="Enrolled Students"
          value={totalStudents || 0}
          icon={GraduationCap}
          color="green"
          onClick={() => setCurrentView('people')}
        />

        <KpiCard
          title="Conversion Rate"
          value={`${demoMetrics.conversionRate || 0}%`}
          icon={TrendingUp}
          color="purple"
          onClick={() => setCurrentView('demos')}
        />
      </div>

      {/* Today's Classes Section matching reference UI/UX design */}
      <TodaysClassesSection />

      {/* Row 2: Secondary Academy Financial & Staff Operations Strip with Floating Physics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Tuition Collected */}
        <FloatingCard 
          onClick={() => setCurrentView('fees_payments')}
          className="bg-[#F4F7F6] rounded-[24px] p-5 border border-[#493548]/20 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-[#55CDB3]/15 text-[#55CDB3] flex items-center justify-center shrink-0">
              <Coins className="w-6 h-6 text-[#55CDB3]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#080B0C] opacity-80 block">
                Tuition Collected
              </span>
              <p className="text-2xl font-black text-[#080B0C] mt-0.5 tracking-tight">₹<AnimatedCounter value={paidRevenue} /></p>
              <span className="text-xs font-bold text-[#493548] block mt-0.5">
                {data.payments.filter((p) => p.status === 'Paid').length} paid invoices
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#55CDB3]/15 text-[#55CDB3] flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-[#55CDB3]" />
          </div>
        </FloatingCard>

        {/* Pending Dues */}
        <FloatingCard 
          onClick={() => setCurrentView('fees_payments')}
          className="bg-[#F4F7F6] rounded-[24px] p-5 border border-[#493548]/20 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-[#493548]/20 text-[#493548] flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-[#493548]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#080B0C] opacity-80 block">
                Pending Dues
              </span>
              <p className="text-2xl font-black text-[#080B0C] mt-0.5 tracking-tight">₹<AnimatedCounter value={pendingAmount} /></p>
              <span className="text-xs font-bold text-[#493548] block mt-0.5">
                {pendingPayments} outstanding invoices
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#493548]/20 text-[#493548] flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-[#493548]" />
          </div>
        </FloatingCard>

        {/* Certified Faculty */}
        <FloatingCard 
          onClick={() => setCurrentView('people')}
          className="bg-[#F4F7F6] rounded-[24px] p-5 border border-[#493548]/20 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-13 h-13 rounded-2xl bg-[#55CDB3]/15 text-[#55CDB3] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-[#55CDB3]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#080B0C] opacity-80 block">
                Certified Faculty
              </span>
              <p className="text-2xl font-black text-[#080B0C] mt-0.5 tracking-tight"><AnimatedCounter value={totalCoaches} /> Coaches</p>
              <span className="text-xs font-medium text-[#080B0C] opacity-70 block mt-0.5 truncate">
                {totalCoaches > 0 ? data.coaches.map(c => c.name).join(', ') : 'No coaches registered'}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#55CDB3]/15 text-[#55CDB3] flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-[#55CDB3]" />
          </div>
        </FloatingCard>
      </div>

      {/* Row 3: Two Big Analytics Panels (Donut + Funnel on left, Enquiries Trend on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Panel: Enquiry Sources & Demo Conversion Performance (7 cols) */}
        <div className="lg:col-span-7 bg-[#F4F7F6] rounded-[24px] p-5 sm:p-6 border border-[#493548]/20 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-1.5 h-5 rounded-full bg-[#55CDB3]" />
              <h3 className="text-base font-extrabold text-[#080B0C] tracking-tight">
                Enquiry Sources &amp; Demo Conversion Performance
              </h3>
            </div>
            <p className="text-xs text-[#080B0C] opacity-65 ml-4">
              Live funnel from multichannel leads to demo bookings and verified student admissions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mt-5 pt-2">
            {/* Donut Chart & Legend */}
            <div className="md:col-span-6 flex items-center gap-4">
              {/* SVG Donut */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg className="w-36 h-36" viewBox="0 0 160 160">
                  {/* Background track */}
                  <circle
                    cx="80"
                    cy="80"
                    r="50"
                    fill="transparent"
                    stroke="#493548"
                    strokeWidth="18"
                    opacity={demoMetrics.totalEnquiries > 0 ? "0.08" : "0.15"}
                  />
                  {demoMetrics.totalEnquiries > 0 && (
                    <>
                      {/* Segment 1: Manual / Walk-in */}
                      <circle
                        cx="80"
                        cy="80"
                        r="50"
                        fill="transparent"
                        stroke="#55CDB3"
                        strokeWidth="18"
                        strokeDasharray={`${(demoMetrics.manualEnquiries / demoMetrics.totalEnquiries) * 314.16} 314.16`}
                        strokeDashoffset="0"
                        transform="rotate(-90 80 80)"
                      />
                      {/* Segment 2: Website */}
                      <circle
                        cx="80"
                        cy="80"
                        r="50"
                        fill="transparent"
                        stroke="#493548"
                        strokeWidth="18"
                        strokeDasharray={`${(demoMetrics.websiteEnquiries / demoMetrics.totalEnquiries) * 314.16} 314.16`}
                        strokeDashoffset={`-${(demoMetrics.manualEnquiries / demoMetrics.totalEnquiries) * 314.16}`}
                        transform="rotate(-90 80 80)"
                      />
                      {/* Segment 3: Instagram */}
                      <circle
                        cx="80"
                        cy="80"
                        r="50"
                        fill="transparent"
                        stroke="#080B0C"
                        strokeWidth="18"
                        strokeDasharray={`${(demoMetrics.instagramEnquiries / demoMetrics.totalEnquiries) * 314.16} 314.16`}
                        strokeDashoffset={`-${((demoMetrics.manualEnquiries + demoMetrics.websiteEnquiries) / demoMetrics.totalEnquiries) * 314.16}`}
                        transform="rotate(-90 80 80)"
                      />
                      {/* Segment 4: WhatsApp */}
                      <circle
                        cx="80"
                        cy="80"
                        r="50"
                        fill="transparent"
                        stroke="#55CDB3"
                        strokeWidth="18"
                        strokeDasharray={`${(demoMetrics.whatsappEnquiries / demoMetrics.totalEnquiries) * 314.16} 314.16`}
                        strokeDashoffset={`-${((demoMetrics.manualEnquiries + demoMetrics.websiteEnquiries + demoMetrics.instagramEnquiries) / demoMetrics.totalEnquiries) * 314.16}`}
                        transform="rotate(-90 80 80)"
                      />
                    </>
                  )}
                  {/* Inner text */}
                  <text x="80" y="74" textAnchor="middle" className="text-3xl font-black fill-[#080B0C] font-sans">
                    {demoMetrics.totalEnquiries || 0}
                  </text>
                  <text x="80" y="91" textAnchor="middle" className="text-[10px] font-bold fill-[#080B0C] opacity-65 font-sans tracking-wider uppercase">
                    Total
                  </text>
                  <text x="80" y="103" textAnchor="middle" className="text-[10px] font-bold fill-[#080B0C] opacity-65 font-sans tracking-wider uppercase">
                    Enquiries
                  </text>
                </svg>
              </div>

              {/* Legend */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#55CDB3] shrink-0" />
                    <span className="font-semibold text-[#080B0C]">Manual / Walk-in</span>
                  </div>
                  <span className="font-bold text-[#080B0C]">
                    {demoMetrics.totalEnquiries > 0 ? Math.round((demoMetrics.manualEnquiries / demoMetrics.totalEnquiries) * 100) : 0}% ({demoMetrics.manualEnquiries || 0})
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] shrink-0" />
                    <span className="font-semibold text-[#080B0C]">Website</span>
                  </div>
                  <span className="font-bold text-[#080B0C]">
                    {demoMetrics.totalEnquiries > 0 ? Math.round((demoMetrics.websiteEnquiries / demoMetrics.totalEnquiries) * 100) : 0}% ({demoMetrics.websiteEnquiries || 0})
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EC4899] shrink-0" />
                    <span className="font-semibold text-[#080B0C]">Instagram</span>
                  </div>
                  <span className="font-bold text-[#080B0C]">
                    {demoMetrics.totalEnquiries > 0 ? Math.round((demoMetrics.instagramEnquiries / demoMetrics.totalEnquiries) * 100) : 0}% ({demoMetrics.instagramEnquiries || 0})
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                    <span className="font-semibold text-[#080B0C]">WhatsApp</span>
                  </div>
                  <span className="font-bold text-[#080B0C]">
                    {demoMetrics.totalEnquiries > 0 ? Math.round((demoMetrics.whatsappEnquiries / demoMetrics.totalEnquiries) * 100) : 0}% ({demoMetrics.whatsappEnquiries || 0})
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Conversion Funnel */}
            <div className="md:col-span-6 flex flex-col justify-between h-full pl-0 md:pl-5 border-t md:border-t-0 md:border-l border-[#493548]/20 pt-4 md:pt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#080B0C]">Conversion Funnel</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#55CDB3]/20 text-[#080B0C] border border-[#55CDB3]/40 shadow-xs">
                  {demoMetrics.conversionRate || 0}% Conversion Rate
                </span>
              </div>

              {/* 4 Pillars with chevrons */}
              <div className="flex items-end justify-between gap-1.5 sm:gap-2 mt-4 pt-2">
                {/* 1: Enquiries */}
                <div className="flex flex-col items-center group cursor-pointer" onClick={() => setCurrentView('enquiries')}>
                  <span className="text-xs font-black text-[#080B0C] mb-1.5">
                    <AnimatedCounter value={demoMetrics.totalEnquiries || 0} />
                  </span>
                  <div className="w-11 sm:w-13 h-24 bg-[#493548]/30 rounded-2xl shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-[#493548]/50" />
                  <span className="text-[10px] font-bold text-[#080B0C] opacity-75 mt-2 text-center">Enquiries</span>
                </div>

                <span className="text-[#080B0C] opacity-40 font-bold mb-8 select-none">&gt;</span>

                {/* 2: Demos */}
                <div className="flex flex-col items-center group cursor-pointer" onClick={() => setCurrentView('demos')}>
                  <span className="text-xs font-black text-[#080B0C] mb-1.5">
                    <AnimatedCounter value={demoMetrics.upcomingDemos || 0} padZero />
                  </span>
                  <div className="w-11 sm:w-13 h-18 bg-[#55CDB3]/30 rounded-2xl shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-[#55CDB3]/50" />
                  <span className="text-[10px] font-bold text-[#080B0C] opacity-75 mt-2 text-center">Demos</span>
                </div>

                <span className="text-[#080B0C] opacity-40 font-bold mb-8 select-none">&gt;</span>

                {/* 3: Completed Demos */}
                <div className="flex flex-col items-center group cursor-pointer" onClick={() => setCurrentView('demos')}>
                  <span className="text-xs font-black text-[#080B0C] mb-1.5">
                    <AnimatedCounter value={demoMetrics.completedDemos || 0} padZero />
                  </span>
                  <div className="w-11 sm:w-13 h-13 bg-[#493548]/50 rounded-2xl shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-[#493548]/70" />
                  <span className="text-[10px] font-bold text-[#080B0C] opacity-75 mt-2 text-center leading-tight">
                    Completed<br />Demos
                  </span>
                </div>

                <span className="text-[#080B0C] opacity-40 font-bold mb-8 select-none">&gt;</span>

                {/* 4: Enrolled */}
                <div className="flex flex-col items-center group cursor-pointer" onClick={() => setCurrentView('people')}>
                  <span className="text-xs font-black text-[#080B0C] mb-1.5">
                    <AnimatedCounter value={totalStudents || 0} />
                  </span>
                  <div className="w-11 sm:w-13 h-20 bg-[#55CDB3] rounded-2xl shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-[#55CDB3]/90" />
                  <span className="text-[10px] font-bold text-[#080B0C] opacity-75 mt-2 text-center">Enrolled</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Enquiries Trend (5 cols) */}
        <div className="lg:col-span-5 bg-[#F4F7F6] rounded-[24px] p-5 sm:p-6 border border-[#493548]/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-5 rounded-full bg-[#55CDB3]" />
              <h3 className="text-base font-extrabold text-[#080B0C] tracking-tight">Enquiries Trend</h3>
            </div>

            <div className="relative">
              <select 
                aria-label="Enquiries trend time period"
                className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-bold bg-white text-[#080B0C] border border-[#493548]/20 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#55CDB3]"
                defaultValue="30d"
              >
                <option value="30d">Last 30 Days</option>
                <option value="7d">Last 7 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#080B0C] opacity-60 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* SVG Area Chart or Empty State */}
          <div className="mt-4 pt-1 w-full">
            {demoMetrics.totalEnquiries === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4">
                <TrendingUp className="w-8 h-8 text-[#080B0C]/20 mb-2" />
                <p className="text-xs font-bold text-[#080B0C]/60">No enquiry trends recorded yet</p>
                <p className="text-[11px] text-[#080B0C]/40 mt-0.5">Enquiry progression curve will appear here once leads are logged</p>
              </div>
            ) : (
              <svg className="w-full h-48 overflow-visible" viewBox="0 0 380 180">
                <defs>
                  <linearGradient id="mintTealTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#55CDB3" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#55CDB3" stopOpacity="0.0" />
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
                      stroke="#493548"
                      strokeOpacity="0.08"
                      strokeDasharray="3 3"
                    />
                    <text
                      x="25"
                      y={tick.y + 4}
                      textAnchor="end"
                      className="text-[10px] font-semibold fill-[#080B0C] opacity-50 font-sans"
                    >
                      {tick.val}
                    </text>
                  </g>
                ))}

                {/* Shaded Area */}
                <path
                  d="M 50,140 C 75,140 80,115 100,115 C 120,115 130,132 150,132 C 170,132 180,115 200,115 C 220,115 230,95 250,95 C 270,95 280,80 300,80 C 320,80 335,38 355,38 L 355,160 L 50,160 Z"
                  fill="url(#mintTealTrendGrad)"
                />

                {/* Line Curve */}
                <path
                  d="M 50,140 C 75,140 80,115 100,115 C 120,115 130,132 150,132 C 170,132 180,115 200,115 C 220,115 230,95 250,95 C 270,95 280,80 300,80 C 320,80 335,38 355,38"
                  fill="none"
                  stroke="#55CDB3"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data Node Circles with Live Ping on Latest Node */}
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
                    {i === 6 && (
                      <circle cx={pt.x} cy={pt.y} r="10" fill="#55CDB3" opacity="0.4" className="animate-ping" />
                    )}
                    <circle cx={pt.x} cy={pt.y} r="5.5" fill="#55CDB3" opacity="0.25" />
                    <circle cx={pt.x} cy={pt.y} r="4" fill="#FFFFFF" stroke="#55CDB3" strokeWidth="2.5" />
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
                    className="text-[10px] font-semibold fill-[#080B0C] opacity-60 font-sans"
                  >
                    {lbl.label}
                  </text>
                ))}
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Five Source Breakdown Cards with Floating Physics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Enquiries */}
        <FloatingCard 
          onClick={() => setCurrentView('enquiries')}
          className="bg-[#F4F7F6] border border-[#493548]/20 rounded-[22px] p-4 flex items-center gap-3.5 shadow-sm hover:border-[#55CDB3]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#55CDB3]/15 text-[#55CDB3] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#55CDB3]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#080B0C] opacity-70 block">
              Total Enquiries
            </span>
            <p className="text-2xl font-black text-[#080B0C] mt-0.5">
              <AnimatedCounter value={demoMetrics.totalEnquiries || 0} />
            </p>
            <span className="text-[11px] font-semibold text-[#080B0C] opacity-60 block">All lead channels</span>
          </div>
        </FloatingCard>

        {/* Website Enquiries */}
        <FloatingCard 
          onClick={() => setCurrentView('enquiries')}
          className="bg-[#F4F7F6] border border-[#493548]/20 rounded-[22px] p-4 flex items-center gap-3.5 shadow-sm hover:border-[#55CDB3]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#493548]/15 text-[#493548] flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-[#0284C7]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#493548] block">
              Website Enquiries
            </span>
            <p className="text-2xl font-black text-[#080B0C] mt-0.5">
              <AnimatedCounter value={demoMetrics.websiteEnquiries || 0} />
            </p>
            <span className="text-[11px] font-semibold text-[#493548] block">Online Web Ingestion</span>
          </div>
        </FloatingCard>

        {/* Instagram Enquiries */}
        <FloatingCard 
          onClick={() => setCurrentView('enquiries')}
          className="bg-[#F4F7F6] border border-[#493548]/20 rounded-[22px] p-4 flex items-center gap-3.5 shadow-sm hover:border-[#55CDB3]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#55CDB3]/15 text-[#55CDB3] flex items-center justify-center shrink-0">
            <InstagramIcon className="w-5 h-5 text-[#EC4899]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#493548] block">
              Instagram Enquiries
            </span>
            <p className="text-2xl font-black text-[#080B0C] mt-0.5">
              <AnimatedCounter value={demoMetrics.instagramEnquiries || 0} />
            </p>
            <span className="text-[11px] font-semibold text-[#493548] block">Social Media Leads</span>
          </div>
        </FloatingCard>

        {/* WhatsApp Enquiries */}
        <FloatingCard 
          onClick={() => setCurrentView('enquiries')}
          className="bg-[#F4F7F6] border border-[#493548]/20 rounded-[22px] p-4 flex items-center gap-3.5 shadow-sm hover:border-[#55CDB3]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#493548]/15 text-[#493548] flex items-center justify-center shrink-0">
            <WhatsAppIcon className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#493548] block">
              WhatsApp Enquiries
            </span>
            <p className="text-2xl font-black text-[#080B0C] mt-0.5">
              <AnimatedCounter value={demoMetrics.whatsappEnquiries || 0} />
            </p>
            <span className="text-[11px] font-semibold text-[#493548] block">Direct Inquiries</span>
          </div>
        </FloatingCard>

        {/* Manual / Walk-in */}
        <FloatingCard 
          onClick={() => setCurrentView('enquiries')}
          className="bg-[#F4F7F6] border border-[#493548]/20 rounded-[22px] p-4 flex items-center gap-3.5 shadow-sm hover:border-[#55CDB3] col-span-2 sm:col-span-1"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#55CDB3]/15 text-[#55CDB3] flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-[#55CDB3]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#493548] block">
              Manual / Walk-in
            </span>
            <p className="text-2xl font-black text-[#55CDB3] mt-0.5">
              <AnimatedCounter value={demoMetrics.manualEnquiries || 0} />
            </p>
            <span className="text-[11px] font-semibold text-[#493548] block">Reception Desk</span>
          </div>
        </FloatingCard>
      </div>

      {/* Row 5: Four Demo & Admission Funnel Cards with Floating Physics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Demos */}
        <FloatingCard 
          onClick={() => setCurrentView('demos')}
          className="bg-[#F4F7F6] border border-[#493548]/20 rounded-[22px] p-4 flex items-center gap-3.5 shadow-sm hover:border-[#55CDB3]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#493548]/15 text-[#493548] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-[#0284C7]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#493548] block">
              Total Demos
            </span>
            <p className="text-2xl font-black text-[#080B0C] mt-0.5">
              <AnimatedCounter value={demoMetrics.totalDemos || 0} />
            </p>
            <span className="text-[11px] font-semibold text-[#493548] block">Trials Scheduled</span>
          </div>
        </FloatingCard>

        {/* Upcoming Demos */}
        <FloatingCard 
          onClick={() => setCurrentView('demos')}
          className="bg-[#F4F7F6] border border-[#493548]/20 rounded-[22px] p-4 flex items-center gap-3.5 shadow-sm hover:border-[#55CDB3]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#55CDB3]/15 text-[#55CDB3] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-[#9333EA]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#493548] block">
              Upcoming Demos
            </span>
            <p className="text-2xl font-black text-[#080B0C] mt-0.5">
              <AnimatedCounter value={demoMetrics.upcomingDemos || 0} />
            </p>
            <span className="text-[11px] font-semibold text-[#493548] block">Active Bookings</span>
          </div>
        </FloatingCard>

        {/* Completed Demos */}
        <FloatingCard 
          onClick={() => setCurrentView('demos')}
          className="bg-[#F4F7F6] border border-[#493548]/20 rounded-[22px] p-4 flex items-center gap-3.5 shadow-sm hover:border-[#55CDB3]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#493548]/15 text-[#493548] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#493548] block">
              Completed Demos
            </span>
            <p className="text-2xl font-black text-[#080B0C] mt-0.5">
              <AnimatedCounter value={demoMetrics.completedDemos || 0} />
            </p>
            <span className="text-[11px] font-semibold text-[#493548] block">Sessions Finished</span>
          </div>
        </FloatingCard>

        {/* Student Conversions */}
        <FloatingCard 
          onClick={() => setCurrentView('demos')}
          className="bg-[#F4F7F6] border border-[#493548]/20 rounded-[22px] p-4 flex items-center gap-3.5 shadow-sm hover:border-[#55CDB3]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#55CDB3]/15 text-[#55CDB3] flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-[#55CDB3]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#55CDB3] block">
              Student Conversions
            </span>
            <p className="text-2xl font-black text-[#55CDB3] mt-0.5">
              <AnimatedCounter value={demoMetrics.studentConversions || 0} />
            </p>
            <span className="text-[11px] font-semibold text-[#55CDB3] block">
              {demoMetrics.conversionRate || 0}% Conversion Rate
            </span>
          </div>
        </FloatingCard>
      </div>

      {/* Live Enquiry Pipeline */}
      <div className="bg-[#F4F7F6] rounded-2xl p-5 border border-[#493548]/20 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#493548]/20">
          <div>
            <h4 className="text-sm font-extrabold text-[#080B0C]">Recent Admission Enquiries</h4>
            <p className="text-xs text-[#080B0C] opacity-70">Prospective young athletes awaiting trial or counseling</p>
          </div>
          <button
            onClick={() => setCurrentView('enquiries')}
            className="text-xs font-bold text-[#55CDB3] hover:underline flex items-center gap-1"
          >
            <span>View All ({data.enquiries.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {data.enquiries.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#080B0C]/50 font-medium">
            No recent enquiries logged yet. Click "Add Enquiry" above to create your first lead.
          </div>
        ) : (
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#493548]/20 text-[#080B0C] opacity-75 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Child & Age</th>
                  <th className="pb-2">Parent Contact</th>
                  <th className="pb-2">Program</th>
                  <th className="pb-2">Stage</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#493548]/15">
                {data.enquiries.slice(0, 4).map(enq => (
                  <tr key={enq.id} className="hover:bg-[#55CDB3]/10 transition-colors">
                    <td className="py-2.5 font-bold text-[#080B0C]">
                      <div>{enq.childName}</div>
                      <span className="text-[10px] text-[#080B0C] opacity-60">{enq.childAge} yrs • {enq.center}</span>
                    </td>
                    <td className="py-2.5">
                      <div className="font-semibold text-[#080B0C]">{enq.parentName}</div>
                      <span className="text-[10px] text-[#080B0C] opacity-60">{enq.phone}</span>
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#493548]/15 text-[#080B0C] border border-[#493548]/25">
                        {enq.interestedProgram.replace('Spartan ', '')}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        enq.stage === 'Enrolled' 
                          ? 'bg-[#080B0C] text-[#F4F7F6]' 
                          : enq.stage === 'Trial Scheduled'
                          ? 'bg-[#55CDB3] text-[#080B0C] font-bold'
                          : 'bg-[#493548]/15 text-[#080B0C] border border-[#493548]/25'
                      }`}>
                        {enq.stage}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => setCurrentView('enquiries')}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#080B0C] bg-[#55CDB3] hover:bg-[#55CDB3]/90 rounded-lg transition-colors cursor-pointer"
                      >
                        Follow up
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upcoming Competitions & Academy Notices Banner */}
      <div className="bg-[#F4F7F6] rounded-2xl p-5 border border-[#493548]/20 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#493548]/20 gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#55CDB3]" />
            <div>
              <h4 className="text-sm font-extrabold text-[#080B0C]">Upcoming Academy Tournaments & Fixtures</h4>
              <p className="text-xs text-[#080B0C] opacity-70">Inter-center championships, grading evaluations and external cups</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('competitions')}
            className="text-xs font-bold text-[#55CDB3] hover:underline flex items-center gap-1"
          >
            <span>Competition Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {data.competitions.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#080B0C]/50 font-medium">
            No upcoming academy tournaments or fixtures scheduled yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {data.competitions.map(comp => (
              <div key={comp.id} className="p-4 rounded-xl bg-[#F4F7F6] border border-[#493548]/20 hover:border-[#55CDB3] transition-colors flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#55CDB3] block">
                    {comp.sport}
                  </span>
                  <h5 className="text-xs font-bold text-[#080B0C] mt-1 leading-snug">{comp.title}</h5>
                  <p className="text-[11px] text-[#080B0C] opacity-75 mt-1.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#080B0C]" />
                    <span>{comp.date} • {comp.venue.split(',')[0]}</span>
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-[#493548]/20 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#080B0C]">
                    {comp.registeredCount}/{comp.maxParticipants} Registered
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#55CDB3] text-[#080B0C] font-bold">
                    {comp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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
            <label className="text-xs font-bold text-[#080B0C] block mb-1">Athlete Full Name *</label>
            <input
              type="text"
              required
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="e.g. Advait Rao"
              className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/30 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Age *</label>
              <input
                type="number"
                min="3"
                max="16"
                required
                value={newStudentAge}
                onChange={(e) => setNewStudentAge(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/30 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Training Program *</label>
              <select
                value={newStudentProgram}
                onChange={(e) => setNewStudentProgram(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/30 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              >
                {data.programs.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                value={newStudentParent}
                onChange={(e) => setNewStudentParent(e.target.value)}
                placeholder="e.g. Shalini Rao"
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/30 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Contact Phone *</label>
              <input
                type="tel"
                required
                value={newStudentPhone}
                onChange={(e) => setNewStudentPhone(e.target.value)}
                placeholder="+91 98888 77777"
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/30 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#493548]/20 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs font-semibold text-[#080B0C] hover:bg-[#493548]/15 rounded-xl text-[#493548]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#55CDB3] text-[#080B0C] font-bold rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
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
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Child Name *</label>
              <input
                type="text"
                required
                value={enqChild}
                onChange={(e) => setEnqChild(e.target.value)}
                placeholder="Child's name"
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/30 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Parent Name *</label>
              <input
                type="text"
                required
                value={enqParent}
                onChange={(e) => setEnqParent(e.target.value)}
                placeholder="Parent's name"
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/30 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={enqPhone}
                onChange={(e) => setEnqPhone(e.target.value)}
                placeholder="+91 98..."
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/30 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Parent Email ID</label>
              <input
                type="email"
                value={enqEmail}
                onChange={(e) => setEnqEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/30 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Location *</label>
              <select
                value={enqLocation}
                onChange={(e) => setEnqLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/30 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              >
                {commonLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#080B0C] block mb-1">Interested Program</label>
              <select
                value={enqProgram}
                onChange={(e) => setEnqProgram(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/30 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              >
                {data.programs.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-[#493548]/20 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs font-semibold text-[#080B0C] hover:bg-[#493548]/15 rounded-xl text-[#493548]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#55CDB3] text-[#080B0C] font-bold rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
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
            <label className="text-xs font-bold text-[#080B0C] block mb-1">Select Student</label>
            <select
              value={payStudent}
              onChange={(e) => setPayStudent(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/30 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
            >
              {data.students.map(s => (
                <option key={s.id} value={s.name}>{s.name} ({s.program})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#080B0C] block mb-1">Fee Amount (₹)</label>
            <input
              type="number"
              required
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F4F7F6] text-[#080B0C] border border-[#493548]/30 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#493548]/20 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs font-semibold text-[#080B0C] hover:bg-[#493548]/15 rounded-xl text-[#493548]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#55CDB3] text-[#080B0C] font-bold rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Record Payment
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
