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
  Star,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Check
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
    submitCompensationRequest,
    addToast 
  } = useCrm();

  // Current logged in parent profile
  const parentProfile = data.parents[0] || { id: '', name: 'Parent Account', email: '' };
  const myChildren = parentProfile.id
    ? data.students.filter(s => s.parentId === parentProfile.id)
    : [];

  // States for modals
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveChild, setLeaveChild] = useState(myChildren[0]?.name || '');
  const [leaveStart, setLeaveStart] = useState('2026-11-20');
  const [leaveEnd, setLeaveEnd] = useState('2026-11-22');
  const [leaveReason, setLeaveReason] = useState('');

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('4500');
  const [selectedChildForPay, setSelectedChildForPay] = useState(myChildren[0]?.name || '');

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [fbComment, setFbComment] = useState('');
  const [fbRating, setFbRating] = useState('5');

  // Compensation Request Modal
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compChild, setCompChild] = useState(myChildren[0]?.name || '');
  const [missedDate, setMissedDate] = useState('2026-11-12');
  const [compReason, setCompReason] = useState('Medical fever - Doctor visit');
  const [selectedSlot, setSelectedSlot] = useState('Saturday 10:00 AM - 11:30 AM (Batch B-Gym)');

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
    const child = myChildren.find(c => c.name === selectedChildForPay) || myChildren[0] || data.students[0];
    if (!child) {
      addToast('No student profile is linked yet.', 'error');
      return;
    }
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
      studentName: myChildren[0]?.name || 'Student',
      coachName: myChildren[0]?.coachName || 'Academy Coach',
      rating: parseInt(fbRating) || 5,
      category: 'Parent Review',
      comment: fbComment,
      program: myChildren[0]?.program || data.programs[0]?.name || ''
    });
    setIsFeedbackModalOpen(false);
    setFbComment('');
  };

  const handleSubmitCompensation = (e) => {
    e.preventDefault();
    const child = myChildren.find(c => c.name === compChild) || myChildren[0];
    if (!child) {
      addToast('No student profile is linked yet.', 'error');
      return;
    }
    submitCompensationRequest({
      studentId: child.id,
      studentName: child.name,
      parentName: parentProfile.name,
      missedDate: missedDate,
      reason: compReason,
      replacementSlot: selectedSlot,
      status: 'Pending Admin Approval'
    });
    setIsCompModalOpen(false);
    setCompReason('');
  };

  // Filter parent's compensation requests
  const parentCompRequests = (data.compensationRequests || []).filter(
    c => c.parentName?.includes('Rohan') || c.studentName?.includes('Aarav') || c.studentName?.includes('Sanya')
  );

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
              onClick={() => setCurrentView('progress')}
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
                    <div className="mt-3 flex items-center gap-3 text-xs">
                      <span className="font-bold text-[#172B50]">Attendance: {child.attendanceRate}%</span>
                      <span className="text-[#172B50] opacity-40">•</span>
                      <span className="font-bold text-[#172B50]">Coach: {child.coachName}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MY CHILDREN */}
      {currentView === 'children' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            My Registered Spartan Children
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

      {/* 3. CLASSES & SCHEDULE */}
      {currentView === 'classes' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Class Timetable & Sessions
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.classes.slice(0, 3).map(cls => (
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

      {/* 4. ATTENDANCE & COMPENSATION (Combined Master Navigation Item) */}
      {(currentView === 'attendance_compensation' || currentView === 'attendance') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Attendance Record & Compensation Classes
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Monitor monthly session attendance and book replacement compensation classes for missed sessions
              </p>
            </div>

            <button
              onClick={() => setIsCompModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Book Compensation Class</span>
            </button>
          </div>

          {/* Attendance Cards */}
          <div className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card">
            <h3 className="text-sm font-extrabold text-[#172B50] pb-3 border-b border-[#172B5012] mb-4">
              Monthly Attendance Register (November 2026)
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
                    19 sessions attended out of 20 scheduled. 1 missed session eligible for compensation.
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Compensation Requests Section */}
          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <div className="p-5 border-b border-[#172B5010] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#172B50]">Compensation & Makeup Classes History</h3>
                <p className="text-xs text-[#172B50] opacity-70">Replacement sessions booked for excused medical or exam leaves</p>
              </div>
              <span className="text-xs font-bold text-[#F4510B]">
                {parentCompRequests.length} Requests
              </span>
            </div>

            <div className="divide-y divide-[#172B500C]">
              {parentCompRequests.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#172B50] opacity-70">
                  No active compensation requests. Missed an authorized session? Click "Book Compensation Class".
                </div>
              ) : (
                parentCompRequests.map(comp => (
                  <div key={comp.id} className="p-4 hover:bg-[#FFF4E8]/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#172B50]">{comp.studentName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          comp.status.includes('Approved') || comp.status.includes('Completed')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {comp.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#172B50] opacity-75 mt-0.5">
                        Missed Class: <strong>{comp.missedDate}</strong> • Reason: "{comp.reason}"
                      </p>
                      <p className="text-[11px] text-[#F4510B] font-semibold mt-0.5">
                        Makeup Slot: {comp.replacementSlot} {comp.coach ? `(Coach ${comp.coach})` : ''}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-gray-500 block">ID: {comp.id}</span>
                      <span className="text-[11px] font-bold text-emerald-700">No Extra Charge</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. FEES & PAYMENTS (Combined Master Navigation Item) */}
      {(currentView === 'fees_payments' || currentView === 'payments') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Fees, Payments & Official Receipts
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Transparent fee structures, sibling discount credits, online payment gateway & tax invoices
              </p>
            </div>

            <button
              onClick={() => setIsPayModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Online Now</span>
            </button>
          </div>

          {/* Fee Structure Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#172B50] opacity-70 block mb-1">
                Aarav's Fee Plan
              </span>
              <h3 className="text-2xl font-black text-[#172B50]">Quarterly Tuition</h3>
              <p className="text-xs text-[#172B50] opacity-80 mt-1">₹12,000 / Quarter (Gymnastics)</p>
              <div className="mt-3 pt-3 border-t border-[#172B5010] flex justify-between text-xs">
                <span className="text-emerald-700 font-bold">Paid till Dec 2026</span>
                <span className="font-mono text-gray-500">Zero Due</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#172B50] opacity-70 block mb-1">
                Family Benefit Applied
              </span>
              <h3 className="text-2xl font-black text-emerald-600">Sibling Discount 10%</h3>
              <p className="text-xs text-[#172B50] opacity-80 mt-1">Automatically applied for 2 enrolled children</p>
              <div className="mt-3 pt-3 border-t border-[#172B5010] flex justify-between text-xs">
                <span className="text-[#F4510B] font-bold">Saves ₹2,400 / yr</span>
                <span className="font-mono text-gray-500">Active</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#172B50] opacity-70 block mb-1">
                Upcoming Cycle Due
              </span>
              <h3 className="text-2xl font-black text-[#F4510B]">₹4,500</h3>
              <p className="text-xs text-[#172B50] opacity-80 mt-1">Due Date: 05 Jan 2027</p>
              <div className="mt-3 pt-3 border-t border-[#172B5010] flex justify-between text-xs">
                <span className="text-[#172B50] font-bold">UPI / Cards / NetBanking</span>
                <span className="text-[#F4510B] font-bold cursor-pointer hover:underline" onClick={() => setIsPayModalOpen(true)}>Pay Early &rarr;</span>
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <div className="p-4 border-b border-[#172B5010] flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#172B50]">
                Payment Receipts & Invoices
              </h3>
              <span className="text-xs text-[#172B50] opacity-70">Official Tax Invoices</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF4E8] text-[#172B50] font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Athlete</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B5010]">
                {data.payments.filter(p => p.parentName.includes('Rohan') || p.studentName.includes('Aarav') || p.studentName.includes('Sanya')).map(p => (
                  <tr key={p.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-[#172B50]">{p.invoiceNumber}</td>
                    <td className="p-3.5 font-semibold text-[#172B50]">{p.studentName}</td>
                    <td className="p-3.5 font-black text-[#172B50]">₹{p.amount.toLocaleString()}</td>
                    <td className="p-3.5 text-[#172B50] opacity-80">{p.paymentMethod}</td>
                    <td className="p-3.5 text-[#172B50]">{p.date}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#172B50] text-white">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button 
                        onClick={() => addToast(`Official receipt ${p.invoiceNumber} downloaded as PDF.`)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#F4510B] hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. PROGRESS & ACHIEVEMENTS */}
      {currentView === 'progress' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Spartan Progress & Belt Milestones
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myChildren.map(child => (
              <div key={child.id} className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#172B5015]">
                  <div>
                    <h3 className="text-lg font-black text-[#172B50]">{child.name}</h3>
                    <p className="text-xs font-bold text-[#F4510B]">{child.rank}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-[#172B50] text-white">
                    Level 3 Advanced
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-[#172B50]">Agility & Speed Obstacle Drill</span>
                      <span className="font-black text-[#F4510B]">9 / 10</span>
                    </div>
                    <div className="w-full h-2 bg-[#FFF4E8] rounded-full overflow-hidden">
                      <div className="w-[90%] h-full bg-[#F4510B] rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-[#172B50]">Balance Beam Routine</span>
                      <span className="font-black text-[#F4510B]">8.5 / 10</span>
                    </div>
                    <div className="w-full h-2 bg-[#FFF4E8] rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-[#F4510B] rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-[#172B50]">Spartan Discipline & Team Spirit</span>
                      <span className="font-black text-[#F4510B]">10 / 10</span>
                    </div>
                    <div className="w-full h-2 bg-[#FFF4E8] rounded-full overflow-hidden">
                      <div className="w-full h-full bg-[#172B50] rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#FFF4E8] rounded-xl border border-[#172B5015] text-xs">
                  <span className="font-bold text-[#172B50] block mb-0.5">Head Coach Remark:</span>
                  <p className="text-[#172B50] opacity-80 italic">
                    "Excellent motor coordination. Ready for the upcoming Karnataka State Junior Cup nomination!"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SPORTS & EVENTS / COMPETITIONS */}
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
                    onClick={() => myChildren[0] && registerCompetition(comp.id, myChildren[0].name)}
                    className="px-3 py-1.5 text-xs font-bold bg-[#F4510B] text-white rounded-lg hover:brightness-110 cursor-pointer"
                  >
                    Register Child
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. COMMUNICATION */}
      {currentView === 'communication' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
              Announcements & Circulars
            </h1>
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              Send Feedback to Coach
            </button>
          </div>
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

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}

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

      {/* Compensation Class Request Modal */}
      <Modal
        isOpen={isCompModalOpen}
        onClose={() => setIsCompModalOpen(false)}
        title="Book Compensation Class"
        subtitle="Request an authorized replacement slot for a missed class"
      >
        <form onSubmit={handleSubmitCompensation} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Select Child</label>
            <select
              value={compChild}
              onChange={(e) => setCompChild(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            >
              {myChildren.map(c => (
                <option key={c.id} value={c.name}>{c.name} ({c.program})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Missed Class Date</label>
            <input
              type="date"
              required
              value={missedDate}
              onChange={(e) => setMissedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Reason for Absence</label>
            <input
              type="text"
              required
              value={compReason}
              onChange={(e) => setCompReason(e.target.value)}
              placeholder="e.g. Doctor appointment, illness, school clash"
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Preferred Replacement Slot</label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            >
              <option value="Saturday 10:00 AM - 11:30 AM (Batch B-Gym)">Saturday 10:00 AM - 11:30 AM (Batch B-Gym)</option>
              <option value="Sunday 04:00 PM - 05:30 PM (Batch C-Athletics)">Sunday 04:00 PM - 05:30 PM (Batch C-Athletics)</option>
              <option value="Wednesday 05:30 PM - 07:00 PM (Batch D-Martial)">Wednesday 05:30 PM - 07:00 PM (Batch D-Martial)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCompModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              Request Replacement Slot
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
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Select Child</label>
            <select
              value={selectedChildForPay}
              onChange={(e) => setSelectedChildForPay(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            >
              {myChildren.map(c => (
                <option key={c.id} value={c.name}>{c.name} ({c.program})</option>
              ))}
            </select>
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
