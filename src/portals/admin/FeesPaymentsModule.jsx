import React, { useState } from 'react';
import { 
  CreditCard, 
  Receipt, 
  Percent, 
  AlertCircle, 
  Plus, 
  Search, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Send,
  Building,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import PaymentsBilling from './PaymentsBilling';
import Modal from '../../components/common/Modal';

export default function FeesPaymentsModule() {
  const { 
    data, 
    activeSubTab, 
    setActiveSubTab, 
    createFeeStructure, 
    assignStudentFee, 
    addPayment,
    addToast 
  } = useCrm();

  // Active subtab: 'fee_structures' | 'fee_assignments' | 'invoices' | 'payments' | 'pending_fees' | 'receipts' | 'discounts'
  const currentTab = activeSubTab || 'fee_structures';

  // Fee Structure Creation Modal
  const [isCreateStructureOpen, setIsCreateStructureOpen] = useState(false);
  const [progName, setProgName] = useState('Spartan Gymnastics & Agility');
  const [mFee, setMFee] = useState('4500');
  const [qFee, setQFee] = useState('12500');
  const [aFee, setAFee] = useState('45000');
  const [admFee, setAdmFee] = useState('2500');
  const [kitFee, setKitFee] = useState('1500');
  const [siblingDisc, setSiblingDisc] = useState('10');
  const [lateCharge, setLateCharge] = useState('50');

  // Student Fee Assignment Modal
  const [isAssignFeeOpen, setIsAssignFeeOpen] = useState(false);
  const [assignStuId, setAssignStuId] = useState(data.students[0]?.id || '');
  const [selectedStructureId, setSelectedStructureId] = useState('FS-01');
  const [planType, setPlanType] = useState('Monthly');
  const [discountType, setDiscountType] = useState('Sibling Concession (10%)');
  const [dueDate, setDueDate] = useState('2026-11-10');

  const handleCreateStructureSubmit = (e) => {
    e.preventDefault();
    createFeeStructure({
      programName: progName,
      monthlyFee: parseInt(mFee) || 4500,
      quarterlyFee: parseInt(qFee) || 12500,
      annualFee: parseInt(aFee) || 45000,
      admissionFee: parseInt(admFee) || 2500,
      kitCharges: parseInt(kitFee) || 1500,
      siblingDiscountPercent: parseInt(siblingDisc) || 10,
      lateFeePerDay: parseInt(lateCharge) || 50
    });
    setIsCreateStructureOpen(false);
  };

  const handleAssignFeeSubmit = (e) => {
    e.preventDefault();
    const stu = data.students.find(s => s.id === assignStuId) || data.students[0];
    const structure = (data.feeStructures || []).find(f => f.id === selectedStructureId) || data.feeStructures[0];
    
    let base = structure.monthlyFee;
    if (planType === 'Quarterly') base = structure.quarterlyFee;
    if (planType === 'Annual') base = structure.annualFee;

    const discountPct = discountType.includes('10%') ? 10 : discountType.includes('20%') ? 20 : 0;
    const finalFee = Math.round(base * (1 - discountPct / 100));

    assignStudentFee({
      studentId: stu.id,
      studentName: stu.name,
      parentName: stu.parentName,
      parentEmail: stu.parentEmail,
      program: stu.program,
      feeStructureId: structure.id,
      planType,
      baseFee: base,
      discountPercent: discountPct,
      discountReason: discountType,
      finalFee,
      admissionFeePaid: structure.admissionFee,
      dueDate,
      paidSoFar: 0,
      remainingBalance: finalFee
    });

    setIsAssignFeeOpen(false);
  };

  const handleSendReminder = (parentEmail, studentName, amount) => {
    addToast(`Payment reminder sent to ${parentEmail} for ${studentName} (Dues: ₹${amount.toLocaleString()}) via Email & SMS.`);
  };

  const feeStructures = data.feeStructures || [];
  const assignments = data.studentFeeAssignments || [];

  return (
    <div className="space-y-6">
      {/* Module Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#172B501A] pb-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Fees & Billing Authority
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Fee structure design, student tuition assignments, online payments and receipt generation
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#172B5018] shadow-xs self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveSubTab('fee_structures')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'fee_structures'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Fee Structures ({feeStructures.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('fee_assignments')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'fee_assignments'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Student Assignments ({assignments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('payments')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'payments'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Payments & Invoices</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('pending_fees')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'pending_fees'
                ? 'bg-[#172B50] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-[#F4510B]" />
            <span>Pending Recovery</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Fee Structures (Section 4.9) */}
      {currentTab === 'fee_structures' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h2 className="text-base font-extrabold text-[#172B50]">Discipline Fee Structures</h2>
              <p className="text-xs text-[#172B50]/70 mt-0.5">Admin-configured plans supporting monthly, quarterly, annual, sibling discounts & kit fees</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateStructureOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-xs hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Fee Structure</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feeStructures.map(fs => (
              <div key={fs.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card hover:border-[#F4510B]/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold text-[#F4510B] uppercase tracking-wider bg-[#FFF4E8] px-2 py-0.5 rounded-md">
                      {fs.id}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {fs.status}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#172B50] mt-2">{fs.programName}</h3>

                  <div className="mt-4 space-y-2 border-t border-[#172B5010] pt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#172B50]/70">Monthly Tuition:</span>
                      <span className="font-extrabold text-[#172B50]">₹{fs.monthlyFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#172B50]/70">Quarterly (3 Mos):</span>
                      <span className="font-bold text-[#172B50]">₹{fs.quarterlyFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#172B50]/70">Annual Plan:</span>
                      <span className="font-bold text-[#172B50]">₹{fs.annualFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#172B50]/60 pt-1 border-t border-dashed border-[#172B5015]">
                      <span>One-time Admission:</span>
                      <span>₹{fs.admissionFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#172B50]/60">
                      <span>Official Kit & Jersey:</span>
                      <span>₹{fs.kitCharges.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-emerald-700 font-semibold">
                      <span>Sibling Discount:</span>
                      <span>{fs.siblingDiscountPercent}% Off</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#172B5010] flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStructureId(fs.id);
                      setIsAssignFeeOpen(true);
                    }}
                    className="text-xs font-bold text-[#F4510B] hover:underline cursor-pointer"
                  >
                    Assign to Students &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: Student Fee Assignments */}
      {currentTab === 'fee_assignments' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h2 className="text-base font-extrabold text-[#172B50]">Student Tuition Allocations</h2>
              <p className="text-xs text-[#172B50]/70 mt-0.5">Assigned fee structures, discount reasons, due dates and outstanding balances</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAssignFeeOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-xs hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Fee to Student</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF4E8] text-[#172B50] font-bold uppercase tracking-wider text-[11px] border-b border-[#172B501A]">
                  <tr>
                    <th className="px-5 py-3.5">Student & Program</th>
                    <th className="px-4 py-3.5">Billing Plan</th>
                    <th className="px-4 py-3.5">Base & Concession</th>
                    <th className="px-4 py-3.5">Final Payable</th>
                    <th className="px-4 py-3.5">Next Due Date</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B5012]">
                  {assignments.map(asg => (
                    <tr key={asg.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-[#172B50] text-[13px] block">{asg.studentName}</span>
                        <span className="text-[11px] text-[#172B50]/70 block">{asg.program}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#172B50] text-white">
                          {asg.planType}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="block text-[#172B50] font-medium">Base: ₹{asg.baseFee.toLocaleString()}</span>
                        {asg.discountPercent > 0 && (
                          <span className="text-[10px] text-emerald-600 font-bold block">
                            -{asg.discountPercent}% ({asg.discountReason})
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-extrabold text-[#172B50] text-sm block">
                          ₹{asg.finalFee.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#172B50]/60 block">Paid: ₹{asg.paidSoFar.toLocaleString()}</span>
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-[#172B50]">{asg.dueDate}</td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          asg.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {asg.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {asg.status !== 'Paid' && (
                          <button
                            type="button"
                            onClick={() => handleSendReminder(asg.parentEmail, asg.studentName, asg.remainingBalance)}
                            className="px-2.5 py-1 text-xs font-bold text-[#F4510B] hover:bg-[#FFF4E8] rounded-lg transition-colors cursor-pointer"
                          >
                            Send Reminder
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Payments & Invoices (Reuses existing PaymentsBilling) */}
      {currentTab === 'payments' && (
        <PaymentsBilling />
      )}

      {/* SUBTAB 4: Pending Fees & Recovery */}
      {currentTab === 'pending_fees' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-[#FFF4E8] border border-[#F4510B]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-[#172B50] text-sm">Automated Fee Collection Engine</h3>
              <p className="text-xs text-[#172B50]/80 mt-0.5">
                Dispatch personalized payment gateway links via WhatsApp & Email directly to registered parents.
              </p>
            </div>
            <button
              type="button"
              onClick={() => addToast('Batch payment reminder dispatched to 3 pending parent accounts.')}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#F4510B] text-white text-xs font-bold rounded-xl shadow-xs hover:brightness-110 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Reminders to All Pending</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF4E8] text-[#172B50] font-bold uppercase tracking-wider text-[11px] border-b border-[#172B501A]">
                <tr>
                  <th className="px-5 py-3.5">Parent & Student</th>
                  <th className="px-4 py-3.5">Overdue Program</th>
                  <th className="px-4 py-3.5">Outstanding Amount</th>
                  <th className="px-4 py-3.5">Days Overdue</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B5012]">
                {data.payments.filter(p => p.status === 'Pending').map(p => (
                  <tr key={p.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-[#172B50] block">{p.parentName}</span>
                      <span className="text-[11px] text-[#172B50]/70 block">{p.studentName}</span>
                    </td>
                    <td className="px-4 py-3.5">{p.program}</td>
                    <td className="px-4 py-3.5 font-extrabold text-[#F4510B] text-sm">
                      ₹{p.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-amber-600 font-semibold">5 Days Overdue</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleSendReminder('parent@example.com', p.studentName, p.amount)}
                        className="px-3 py-1 text-xs font-bold bg-[#172B50] text-white rounded-lg hover:bg-[#20365F] transition-colors cursor-pointer"
                      >
                        Send Payment Link
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Fee Structure Modal */}
      <Modal
        isOpen={isCreateStructureOpen}
        onClose={() => setIsCreateStructureOpen(false)}
        title="Create New Sports Program Fee Structure"
        size="md"
      >
        <form onSubmit={handleCreateStructureSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">Target Sports Program *</label>
            <select
              value={progName}
              onChange={(e) => setProgName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
            >
              {data.programs.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Monthly Fee (₹) *</label>
              <input
                type="number"
                required
                value={mFee}
                onChange={(e) => setMFee(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Quarterly (₹) *</label>
              <input
                type="number"
                required
                value={qFee}
                onChange={(e) => setQFee(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Annual (₹) *</label>
              <input
                type="number"
                required
                value={aFee}
                onChange={(e) => setAFee(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">One-time Admission (₹)</label>
              <input
                type="number"
                value={admFee}
                onChange={(e) => setAdmFee(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Uniform & Jersey Kit (₹)</label>
              <input
                type="number"
                value={kitFee}
                onChange={(e) => setKitFee(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Sibling Discount (%)</label>
              <input
                type="number"
                value={siblingDisc}
                onChange={(e) => setSiblingDisc(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Daily Late Charge (₹)</label>
              <input
                type="number"
                value={lateCharge}
                onChange={(e) => setLateCharge(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#172B5015]">
            <button
              type="button"
              onClick={() => setIsCreateStructureOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Save Fee Structure
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Fee to Student Modal */}
      <Modal
        isOpen={isAssignFeeOpen}
        onClose={() => setIsAssignFeeOpen(false)}
        title="Assign Fee Structure to Student"
        size="md"
      >
        <form onSubmit={handleAssignFeeSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">Student *</label>
            <select
              value={assignStuId}
              onChange={(e) => setAssignStuId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
            >
              {data.students.map(s => (
                <option key={s.id} value={s.id}>{s.name} - {s.program} ({s.parentName})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">Program Fee Structure *</label>
            <select
              value={selectedStructureId}
              onChange={(e) => setSelectedStructureId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
            >
              {feeStructures.map(f => (
                <option key={f.id} value={f.id}>{f.programName} (Monthly ₹{f.monthlyFee})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Billing Frequency</label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B50] mb-1">Discount Concession</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs font-semibold text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
              >
                <option value="None (0%)">None (0%)</option>
                <option value="Sibling Concession (10%)">Sibling Concession (10%)</option>
                <option value="Merit Sports Scholarship (20%)">Merit Scholarship (20%)</option>
                <option value="Early Bird (5%)">Early Bird (5%)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B50] mb-1">First Payment Due Date *</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#172B5020] rounded-xl text-xs text-[#172B50] focus:ring-2 focus:ring-[#F4510B]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#172B5015]">
            <button
              type="button"
              onClick={() => setIsAssignFeeOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Confirm Fee Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
