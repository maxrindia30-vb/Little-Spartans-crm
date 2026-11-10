import React, { useState } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  CreditCard, 
  ClipboardCheck, 
  Trophy, 
  CalendarOff, 
  Award, 
  Bell, 
  MessageSquare, 
  UserCheck2,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Plus,
  Download,
  AlertCircle,
  Star
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import KpiCard from '../../components/common/KpiCard';
import Modal from '../../components/common/Modal';

export default function ParentPortalView() {
  const { 
    currentView, 
    setCurrentView, 
    data, 
    applyLeave, 
    addFeedback, 
    addPayment, 
    registerCompetition,
    addToast 
  } = useCrm();

  // Current logged in parent: Dr. Rohan Sharma
  const parentProfile = data.parents[0];
  const myChildren = data.students.filter(s => s.parentId === parentProfile.id);

  // States for modals
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveChild, setLeaveChild] = useState(myChildren[0]?.name || 'Aarav Sharma');
  const [leaveStart, setLeaveStart] = useState('2026-11-20');
  const [leaveEnd, setLeaveEnd] = useState('2026-11-22');
  const [leaveReason, setLeaveReason] = useState('');

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('4500');

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [fbComment, setFbComment] = useState('');
  const [fbRating, setFbRating] = useState('5');

  const handleApplyChildLeave = (e) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    applyLeave({
      type: 'Student',
      applicantName: `${leaveChild} (Parent: ${parentProfile.name})`,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason,
      reviewedBy: 'Pending Admin Review'
    });

    setIsLeaveModalOpen(false);
    setLeaveReason('');
  };

  const handlePayTuition = (e) => {
    e.preventDefault();
    const child = myChildren[0] || data.students[0];
    addPayment({
      studentId: child.id,
      studentName: child.name,
      parentName: parentProfile.name,
      amount: parseInt(payAmount) || 4500,
      program: child.program,
      billingMonth: 'December 2026',
      paymentMethod: 'UPI Instant Portal'
    });
    setIsPayModalOpen(false);
  };

  const handleSendFeedback = (e) => {
    e.preventDefault();
    if (!fbComment.trim()) return;
    addFeedback({
      parentName: parentProfile.name,
      studentName: myChildren[0]?.name || 'Aarav Sharma',
      coachName: 'Coach Vikram Singh',
      rating: parseInt(fbRating) || 5,
      category: 'Parent Review',
      comment: fbComment,
      program: myChildren[0]?.program || 'Spartan Gymnastics & Agility'
    });
    setIsFeedbackModalOpen(false);
    setFbComment('');
  };

  // Render view depending on active currentView
  return (
    <div className="space-y-6">
      
      {/* 1. PARENT DASHBOARD */}
      {currentView === 'dashboard' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#F4510B] text-white tracking-wider animate-pulse">
                  Parent Access
                </span>
                <span className="text-xs font-semibold text-[#172B50] opacity-60">Term 2026-27</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Welcome, {parentProfile.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Little Spartans Parent Dashboard • Tracking {myChildren.length} Registered Champions
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPayModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-md hover:bg-[#DC4405] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-white" />
                <span>Pay Term Fee</span>
              </button>

              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-white text-[#172B50] border border-[#172B5025] rounded-xl hover:bg-[#FFF4E8] hover:border-[#F4510B55] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <CalendarOff className="w-4 h-4 text-[#F4510B]" />
                <span>Apply Leave</span>
              </button>
            </div>
          </div>

          {/* Motivational Attendance Streak Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#172B50] via-[#1D3560] to-[#233966] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-[#F4510B]/20 to-transparent pointer-events-none" />
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl animate-flame shrink-0">
                🔥
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#FFA366]">
                    14-Session Champion Streak
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#F4510B] text-white">
                    TOP 5%
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                  Aarav & Ananya have maintained 100% punctuality this month!
                </h4>
              </div>
            </div>
            <button 
              onClick={() => setCurrentView('certificates')}
              className="relative z-10 px-4 py-2 rounded-xl bg-[#F4510B] hover:bg-[#DC4405] text-white text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
            >
              View Badges & Awards &rarr;
            </button>
          </div>

          {/* Children Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myChildren.map(child => (
              <div key={child.id} className="interactive-card bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card group">
                <div className="flex items-start gap-4">
                  <img
                    src={child.avatar}
                    alt={child.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#F4510B] group-hover:scale-105 transition-transform duration-300 shadow-sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-[#172B50] group-hover:text-[#F4510B] transition-colors">
                          {child.name}
                        </h3>
                        <span className="text-xs font-bold text-[#F4510B]">{child.rank}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#172B50] text-white shadow-xs">
                        {child.feeStatus}
                      </span>
                    </div>
                    <p className="text-xs text-[#172B50] opacity-75 mt-1">
                      {child.program} • {child.center}
                    </p>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="mt-3.5">
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-[#172B50] opacity-75">Term Attendance & Consistency</span>
                    <span className="text-[#F4510B] font-extrabold">{child.attendanceRate}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#FFF4E8] overflow-hidden border border-[#F4510B22]">
                    <div 
                      className="h-full bg-gradient-to-r from-[#F4510B] via-[#FF8542] to-[#F4510B] rounded-full transition-all duration-700 ease-out" 
                      style={{ width: `${child.attendanceRate}%` }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#172B5015] text-center text-xs">
                  <div className="p-2 rounded-xl bg-[#FFF4E8] group-hover:bg-[#FFEDE0] transition-colors">
                    <span className="text-[10px] text-[#172B50] opacity-70 block font-semibold">Attendance</span>
                    <span className="font-black text-[#172B50]">{child.attendanceRate}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FFF4E8] group-hover:bg-[#FFEDE0] transition-colors">
                    <span className="text-[10px] text-[#172B50] opacity-70 block font-semibold">Spartan Badges</span>
                    <span className="font-black text-[#F4510B]">{child.badges.length} Won</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FFF4E8] group-hover:bg-[#FFEDE0] transition-colors">
                    <span className="text-[10px] text-[#172B50] opacity-70 block font-semibold">Head Coach</span>
                    <span className="font-bold text-[#172B50] truncate block">{child.coachName.split(' ')[1]}</span>
                  </div>
                </div>

                {/* Badges Pill List with Animated Trophy */}
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {child.badges.map((b, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-[#FFF4E8] text-[#172B50] border border-[#F4510B25] flex items-center gap-1.5 hover:border-[#F4510B] hover:scale-105 transition-all duration-200 cursor-default"
                    >
                      <Trophy className="w-3.5 h-3.5 text-[#F4510B] animate-bounce-soft" />
                      <span>{b}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Today's Training Schedule & Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Today's Classes */}
            <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
              <div className="flex items-center justify-between pb-3 border-b border-[#172B5012]">
                <h3 className="text-sm font-extrabold text-[#172B50] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#F4510B]" />
                  <span>Next Training Sessions</span>
                </h3>
                <span className="text-xs font-bold text-[#F4510B]">Indiranagar Arena</span>
              </div>

              <div className="space-y-3 mt-3.5">
                <div className="p-3.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-[#172B50] block">Aarav Sharma • Gymnastics Batch A</span>
                    <span className="text-[11px] text-[#172B50] opacity-75 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#F4510B]" />
                      <span>Wed, 4:30 PM - 5:45 PM (Court 2)</span>
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded-lg text-[10px] font-black bg-[#172B50] text-white">
                    Confirmed
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-[#172B50] block">Sanya Kapoor • Athletics Sprinting</span>
                    <span className="text-[11px] text-[#172B50] opacity-75 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#F4510B]" />
                      <span>Wed, 6:00 AM - 7:15 AM (Track 1)</span>
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded-lg text-[10px] font-black bg-[#172B50] text-white">
                    Confirmed
                  </span>
                </div>
              </div>
            </div>

            {/* Academy Announcements */}
            <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
              <div className="flex items-center justify-between pb-3 border-b border-[#172B5012]">
                <h3 className="text-sm font-extrabold text-[#172B50] flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-[#F4510B]" />
                  <span>Academy Circulars</span>
                </h3>
                <span className="text-xs font-bold text-[#172B50] opacity-60">Latest Updates</span>
              </div>

              <div className="space-y-3 mt-3.5">
                {data.announcements.slice(0, 2).map(ann => (
                  <div key={ann.id} className="p-3 rounded-xl bg-[#FFF4E8] border border-[#172B5015]">
                    <span className="text-xs font-bold text-[#172B50] block">{ann.title}</span>
                    <p className="text-[11px] text-[#172B50] opacity-75 mt-1">{ann.content}</p>
                    <span className="text-[9px] text-[#F4510B] font-bold block mt-1">{ann.date}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Tournaments Registration */}
          <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
            <h3 className="text-sm font-extrabold text-[#172B50] pb-3 border-b border-[#172B5012] mb-4">
              Open Tournaments & Spartan Championships
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.competitions.map(comp => (
                <div key={comp.id} className="p-4 rounded-xl bg-[#FFF4E8] border border-[#172B5015] flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#F4510B] block">{comp.sport}</span>
                    <h4 className="text-xs font-bold text-[#172B50] mt-1">{comp.title}</h4>
                    <p className="text-[11px] text-[#172B50] opacity-75 mt-1">{comp.date} • {comp.venue}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#172B5015] flex items-center justify-between">
                    <span className="text-xs font-black text-[#172B50]">{comp.entryFee}</span>
                    <button
                      onClick={() => registerCompetition(comp.id, myChildren[0]?.name || 'Aarav')}
                      className="px-2.5 py-1 text-xs font-bold bg-[#F4510B] text-white rounded-lg hover:brightness-110"
                    >
                      Register Child
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. MY CHILDREN */}
      {currentView === 'children' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            My Enrolled Children
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myChildren.map(child => (
              <div key={child.id} className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card">
                <div className="flex items-center gap-4 pb-4 border-b border-[#172B5015]">
                  <img src={child.avatar} alt={child.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#F4510B]" />
                  <div>
                    <h3 className="text-lg font-black text-[#172B50]">{child.name}</h3>
                    <p className="text-xs font-bold text-[#F4510B]">{child.rank}</p>
                    <p className="text-xs text-[#172B50] opacity-75">ID: {child.id} • DOB: {child.dob}</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#172B5010]">
                    <span className="text-[#172B50] opacity-70">Program Enrolled:</span>
                    <span className="font-bold text-[#172B50]">{child.program}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#172B5010]">
                    <span className="text-[#172B50] opacity-70">Assigned Head Coach:</span>
                    <span className="font-bold text-[#172B50]">{child.coachName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#172B5010]">
                    <span className="text-[#172B50] opacity-70">Overall Attendance:</span>
                    <span className="font-bold text-[#F4510B]">{child.attendanceRate}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#172B5010]">
                    <span className="text-[#172B50] opacity-70">Tuition Status:</span>
                    <span className="font-bold text-[#172B50]">{child.feeStatus}</span>
                  </div>
                  <div className="p-3 bg-[#FFF4E8] rounded-xl border border-[#172B5015]">
                    <span className="font-bold text-[#172B50] block mb-1">Medical Record Note:</span>
                    <span className="text-[#172B50] opacity-80">{child.medicalNote}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CLASSES */}
      {currentView === 'classes' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Class Timetable & Sessions
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.classes.slice(0, 2).map(cls => (
              <div key={cls.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
                <span className="text-[10px] font-bold uppercase text-[#F4510B]">{cls.program}</span>
                <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{cls.name}</h3>
                <div className="mt-3 space-y-1.5 text-xs text-[#172B50]">
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F4510B]" />
                    <span className="font-semibold">{cls.schedule}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                    <span>{cls.center}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <UserCheck2 className="w-3.5 h-3.5 text-[#F4510B]" />
                    <span>{cls.coach}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ATTENDANCE */}
      {currentView === 'attendance' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Attendance Record & Turnout
          </h1>
          <div className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card">
            <h3 className="text-sm font-extrabold text-[#172B50] pb-3 border-b border-[#172B5012] mb-4">
              Monthly Attendance History (November 2026)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myChildren.map(child => (
                <div key={child.id} className="p-4 rounded-xl bg-[#FFF4E8] border border-[#172B5015]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-extrabold text-[#172B50]">{child.name}</span>
                    <span className="text-xs font-black text-[#F4510B]">{child.attendanceRate}% Present</span>
                  </div>
                  <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[#172B5015]">
                    <div style={{ width: `${child.attendanceRate}%` }} className="h-full bg-[#172B50] rounded-full" />
                  </div>
                  <p className="text-[11px] text-[#172B50] opacity-75 mt-2">
                    19 sessions attended out of 20 scheduled. Punctuality score: 98%.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. PAYMENTS */}
      {currentView === 'payments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
              Payments & Fee Invoices
            </h1>
            <button
              onClick={() => setIsPayModalOpen(true)}
              className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              Pay Online
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF4E8] text-[#172B50] font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Athlete</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B5010]">
                {data.payments.filter(p => p.parentName.includes('Rohan') || p.studentName.includes('Aarav') || p.studentName.includes('Sanya')).map(p => (
                  <tr key={p.id}>
                    <td className="p-3.5 font-bold text-[#172B50]">{p.invoiceNumber}</td>
                    <td className="p-3.5 font-semibold text-[#172B50]">{p.studentName}</td>
                    <td className="p-3.5 font-black text-[#172B50]">₹{p.amount.toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#172B50] text-white">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button 
                        onClick={() => addToast('Receipt downloaded.')}
                        className="text-xs font-bold text-[#F4510B] hover:underline"
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. COMPETITIONS */}
      {currentView === 'competitions' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Academy Competitions & Tournaments
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {data.competitions.map(comp => (
              <div key={comp.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#F4510B]">{comp.sport}</span>
                  <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{comp.title}</h3>
                  <p className="text-xs text-[#172B50] opacity-75 mt-2">{comp.date} • {comp.venue}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#172B5015] flex justify-between items-center">
                  <span className="text-xs font-black text-[#172B50]">{comp.entryFee}</span>
                  <button
                    onClick={() => registerCompetition(comp.id, myChildren[0]?.name || 'Aarav')}
                    className="px-3 py-1.5 text-xs font-bold bg-[#F4510B] text-white rounded-lg hover:brightness-110"
                  >
                    Register Child
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. LEAVE REQUESTS */}
      {currentView === 'leaves' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
              Child Leave Requests
            </h1>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              Apply Leave
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.leaveRequests.filter(l => l.applicantName.includes('Rohan') || l.applicantName.includes('Aarav')).map(l => (
              <div key={l.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-extrabold text-[#172B50]">{l.applicantName}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#172B50] text-white">
                    {l.status}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#F4510B] mt-1">{l.startDate} to {l.endDate}</p>
                <p className="text-xs text-[#172B50] opacity-80 mt-1 italic">"{l.reason}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. CERTIFICATES */}
      {currentView === 'certificates' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Spartan Certificates & Honors
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.certificates.slice(0, 2).map(c => (
              <div key={c.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#F4510B] uppercase">{c.category}</span>
                  <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{c.title}</h3>
                  <p className="text-xs text-[#172B50] opacity-75 mt-1">Awarded to: {c.studentName} ({c.issuedDate})</p>
                </div>
                <button
                  onClick={() => addToast(`Certificate "${c.title}" downloaded.`)}
                  className="px-3 py-1.5 text-xs font-bold bg-[#172B50] text-white rounded-xl hover:bg-[#F4510B] flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. COMMUNICATION */}
      {currentView === 'communication' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Announcements & Messages
          </h1>
          <div className="space-y-4">
            {data.announcements.map(ann => (
              <div key={ann.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
                <span className="text-[10px] font-bold text-[#F4510B] uppercase">{ann.date} • {ann.target}</span>
                <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{ann.title}</h3>
                <p className="text-xs text-[#172B50] opacity-80 mt-2 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. FEEDBACK */}
      {currentView === 'feedback' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
              Share Feedback for Coaches
            </h1>
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              Submit Review
            </button>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card">
            <p className="text-xs text-[#172B50] opacity-80">
              Your feedback directly guides our coaching staff in tailoring age-appropriate drill intensity, agility focus, and personal encouragement for your children.
            </p>
          </div>
        </div>
      )}

      {/* 11. PROFILE */}
      {currentView === 'profile' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Parent Profile & Guardian Records
          </h1>
          <div className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card space-y-4 text-xs">
            <div className="flex items-center gap-4 pb-4 border-b border-[#172B5015]">
              <div className="w-16 h-16 rounded-2xl bg-[#172B50] flex items-center justify-center text-white text-xl font-bold">
                RS
              </div>
              <div>
                <h3 className="text-lg font-black text-[#172B50]">{parentProfile.name}</h3>
                <p className="text-xs text-[#172B50] opacity-75">{parentProfile.email} • {parentProfile.phone}</p>
                <span className="text-[10px] font-bold text-[#F4510B]">{parentProfile.center}</span>
              </div>
            </div>
            <div className="space-y-2 text-[#172B50]">
              <p><span className="font-bold">Home Address:</span> {parentProfile.address}</p>
              <p><span className="font-bold">Emergency Hotline:</span> {parentProfile.emergencyContact}</p>
              <p><span className="font-bold">Registered Children:</span> {parentProfile.children.join(', ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Apply Planned Leave for Child"
        subtitle="Notify coaches and excuse student from training roster"
      >
        <form onSubmit={handleApplyChildLeave} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Select Child</label>
            <select
              value={leaveChild}
              onChange={(e) => setLeaveChild(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            >
              {myChildren.map(c => (
                <option key={c.id} value={c.name}>{c.name} ({c.program})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">From Date</label>
              <input
                type="date"
                required
                value={leaveStart}
                onChange={(e) => setLeaveStart(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">To Date</label>
              <input
                type="date"
                required
                value={leaveEnd}
                onChange={(e) => setLeaveEnd(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Reason for Leave *</label>
            <textarea
              rows="3"
              required
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="e.g. School midterm exams, out of town..."
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              Submit Leave Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Pay Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Pay Term Tuition Fee"
        subtitle="Secure UPI & Net Banking Payment Gateway"
      >
        <form onSubmit={handlePayTuition} className="space-y-3.5">
          <div className="p-3 bg-[#FFF4E8] rounded-xl border border-[#172B5015] text-xs">
            <span className="font-bold text-[#172B50] block">Child: Aarav Sharma</span>
            <span className="text-[#172B50] opacity-75">Spartan Gymnastics & Agility (Monthly Tuition)</span>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Fee Amount (₹)</label>
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              Proceed to Pay ₹{payAmount}
            </button>
          </div>
        </form>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title="Review Coach Vikram Singh"
        subtitle="Rate session quality and child progress"
      >
        <form onSubmit={handleSendFeedback} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Star Rating</label>
            <select
              value={fbRating}
              onChange={(e) => setFbRating(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            >
              <option value="5">★★★★★ (5/5 Exceptional)</option>
              <option value="4">★★★★☆ (4/5 Very Good)</option>
              <option value="3">★★★☆☆ (3/5 Good)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Your Feedback & Comments *</label>
            <textarea
              rows="3"
              required
              value={fbComment}
              onChange={(e) => setFbComment(e.target.value)}
              placeholder="What did you love about recent sessions?"
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFeedbackModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
