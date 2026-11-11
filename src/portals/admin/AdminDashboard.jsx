import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
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
  Clock
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import KpiCard from '../../components/common/KpiCard';
import { RevenueTrendChart, AttendanceDonutChart, ProgramDistributionChart } from '../../components/common/Charts';
import Modal from '../../components/common/Modal';

export default function AdminDashboard() {
  const { data, setCurrentView, addStudent, addEnquiry, addPayment, addToast } = useCrm();

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
      email: `${enqParent.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      interestedProgram: enqProgram,
      center: data.academy.centers[0] || 'KK NAGAR',
      notes: 'Parent submitted quick walk-in lead at academy reception desk.',
      stage: 'New'
    });
    setModalType(null);
    setEnqChild('');
    setEnqParent('');
    setEnqPhone('');
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
      
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase bg-[#172B50] text-white tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span>LIVE OPERATIONS</span>
            </span>
            <span className="text-xs font-semibold text-[#172B50] opacity-60">Chennai Headquarters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Academy Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Little Spartans Chennai • Real-time Operations & Student Performance
          </p>
        </div>

        {/* Quick Action CTAs: Spartan Orange (#F4510B) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setModalType('student')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-md hover:bg-[#DC4405] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Enroll Student</span>
          </button>

          <button
            onClick={() => setModalType('enquiry')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-white text-[#172B50] border border-[#172B5025] rounded-xl hover:bg-[#FFF4E8] hover:border-[#F4510B55] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <PhoneCall className="w-4 h-4 text-[#F4510B]" />
            <span>Add Enquiry</span>
          </button>

          <button
            onClick={() => setModalType('payment')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-white text-[#172B50] border border-[#172B5025] rounded-xl hover:bg-[#FFF4E8] hover:border-[#F4510B55] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <CreditCard className="w-4 h-4 text-[#172B50]" />
            <span>Record Fee</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Students"
          value={totalStudents}
          subtitle={`${data.locations?.length || 5} training facilities`}
          icon={GraduationCap}
          trend={0}
          trendLabel="manual onboarding"
        />

        <KpiCard
          title="New Enquiries"
          value={newEnquiries}
          subtitle="Trial pipeline active"
          icon={PhoneCall}
          trend={0}
          trendLabel="leads recorded"
          highlight={true}
        />

        <KpiCard
          title="Collected Revenue"
          value={`₹${paidRevenue.toLocaleString()}`}
          subtitle={`${data.payments.filter(p => p.status === 'Paid').length} paid invoices`}
          icon={CreditCard}
          trend={0}
          trendLabel="live ledger"
        />

        <KpiCard
          title="Pending Fees"
          value={`₹${pendingAmount.toLocaleString()}`}
          subtitle={`${pendingPayments} invoices pending`}
          icon={AlertCircle}
        />
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
