import React, { useState } from 'react';
import { CreditCard, Search, Plus, Download, Printer, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';

export default function PaymentsBilling() {
  const { data, addPayment, addToast } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState(null);

  // Form states
  const [studentId, setStudentId] = useState(data.students[0]?.id || '');
  const [amount, setAmount] = useState('4500');
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR Code');
  const [billingMonth, setBillingMonth] = useState('November 2026');

  const filteredPayments = data.payments.filter(p => {
    const matchesSearch = 
      p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCollected = data.payments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = data.payments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleRecordPayment = (e) => {
    e.preventDefault();
    const stu = data.students.find(s => s.id === studentId) || data.students[0];

    addPayment({
      studentId: stu.id,
      studentName: stu.name,
      parentName: stu.parentName,
      amount: parseInt(amount) || 4500,
      program: stu.program,
      billingMonth,
      paymentMethod
    });

    setIsCollectOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Payments, Invoices & Fee Collection
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Real-time academy tuition ledger, pending dues and GST tax receipts
          </p>
        </div>

        <button
          onClick={() => setIsCollectOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Record Tuition Payment</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#172B501A] shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#172B50] opacity-70">
            Total Collections (Nov)
          </span>
          <h3 className="text-2xl font-extrabold text-[#172B50] mt-1">₹{totalCollected.toLocaleString()}</h3>
          <p className="text-[11px] font-bold text-[#F4510B] mt-1">All verified academy deposits</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#172B501A] shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#172B50] opacity-70">
            Pending Dues Unpaid
          </span>
          <h3 className="text-2xl font-extrabold text-[#F4510B] mt-1">₹{totalPending.toLocaleString()}</h3>
          <p className="text-[11px] font-semibold text-[#172B50] opacity-75 mt-1">
            {data.payments.filter(p => p.status === 'Pending').length} pending invoices
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#172B501A] shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#172B50] opacity-70">
            Collection Efficiency
          </span>
          <h3 className="text-2xl font-extrabold text-[#172B50] mt-1">96.8%</h3>
          <p className="text-[11px] font-bold text-[#172B50] mt-1">Zero bad debts reported</p>
        </div>
      </div>

      {/* Filter and Search Bar: Pure White (#FFFFFF) */}
      <div className="bg-white rounded-2xl p-4 border border-[#172B501A] shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#172B50] opacity-50 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student, parent, or invoice..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] placeholder-[#172B5080] border border-[#172B5020] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto">
          {['All', 'Paid', 'Pending'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-[#172B50] text-white shadow-sm'
                  : 'bg-[#FFF4E8] text-[#172B50] hover:bg-white border border-[#172B5015]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table: Pure White (#FFFFFF) */}
      <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FFF4E8] text-[#172B50] font-extrabold uppercase tracking-wider text-[11px] border-b border-[#172B5015]">
                <th className="py-3 px-4">Invoice # & Date</th>
                <th className="py-3 px-4">Student Athlete</th>
                <th className="py-3 px-4">Parent Guardian</th>
                <th className="py-3 px-4">Tuition Fee</th>
                <th className="py-3 px-4">Method / Ref</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172B5010]">
              {filteredPayments.map(pay => (
                <tr key={pay.id} className="hover:bg-[#FFF4E8]/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-[#172B50] block">{pay.invoiceNumber}</span>
                    <span className="text-[10px] text-[#172B50] opacity-60">{pay.billingMonth}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-extrabold text-[#172B50] block">{pay.studentName}</span>
                    <span className="text-[10px] text-[#F4510B] font-semibold">{pay.program}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-[#172B50]">{pay.parentName}</span>
                  </td>

                  <td className="py-3 px-4 font-black text-sm text-[#172B50]">
                    ₹{pay.amount.toLocaleString()}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#172B50] block">{pay.paymentMethod}</span>
                    <span className="text-[10px] text-[#172B50] opacity-60">{pay.transactionId}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      pay.status === 'Paid'
                        ? 'bg-[#172B50] text-white'
                        : 'bg-[#F4510B] text-white'
                    }`}>
                      {pay.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {pay.status === 'Paid' ? (
                      <button
                        onClick={() => setReceiptInvoice(pay)}
                        className="px-2.5 py-1 text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] hover:bg-[#F4510B] hover:text-white rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-[#F4510B]">Unpaid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isCollectOpen}
        onClose={() => setIsCollectOpen(false)}
        title="Record Student Fee Payment"
        subtitle="Log tuition fee collection into academy ledger"
      >
        <form onSubmit={handleRecordPayment} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Select Student Athlete *</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            >
              {data.students.map(s => (
                <option key={s.id} value={s.id}>{s.name} - {s.program} ({s.parentName})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Fee Amount (₹) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Billing Month</label>
              <input
                type="text"
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            >
              <option value="UPI / PhonePe">UPI / PhonePe</option>
              <option value="UPI / GooglePay">UPI / GooglePay</option>
              <option value="HDFC Net Banking">HDFC Net Banking</option>
              <option value="Credit Card (Visa/Mastercard)">Credit Card (Visa/Mastercard)</option>
              <option value="Cash at Front Desk">Cash at Front Desk</option>
            </select>
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCollectOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Confirm Fee Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* Receipt Modal: Styled in brand colors */}
      {receiptInvoice && (
        <Modal
          isOpen={!!receiptInvoice}
          onClose={() => setReceiptInvoice(null)}
          title="Little Spartans Academy • Official Fee Receipt"
          subtitle={`Receipt Ref: ${receiptInvoice.invoiceNumber}`}
        >
          <div className="p-5 rounded-2xl bg-[#FFF4E8] border border-[#172B5020] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#172B5020]">
              <div>
                <h4 className="text-base font-extrabold text-[#172B50]">LITTLE SPARTANS</h4>
                <p className="text-[10px] text-[#172B50] opacity-75">Children's Sports Academy Bengaluru</p>
                <p className="text-[9px] text-[#172B50] opacity-60">GSTIN: 29AAAAA0000A1Z5</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#172B50] text-white">PAID</span>
                <p className="text-[10px] text-[#172B50] font-bold mt-1">{receiptInvoice.paymentDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-[#172B50] opacity-60 block">Billed To (Student)</span>
                <span className="font-extrabold text-[#172B50]">{receiptInvoice.studentName}</span>
                <span className="text-[10px] text-[#172B50] opacity-75 block">Guardian: {receiptInvoice.parentName}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#172B50] opacity-60 block">Program & Period</span>
                <span className="font-bold text-[#172B50]">{receiptInvoice.program}</span>
                <span className="text-[10px] text-[#F4510B] font-bold block">{receiptInvoice.billingMonth}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#172B5015] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#172B50]">Total Paid Amount</span>
                <span className="text-[10px] text-[#172B50] opacity-60 block">Via {receiptInvoice.paymentMethod}</span>
              </div>
              <span className="text-xl font-extrabold text-[#172B50]">
                ₹{receiptInvoice.amount.toLocaleString()}
              </span>
            </div>

            <p className="text-[9px] text-[#172B50] opacity-60 text-center">
              This is an academy computer-generated receipt. Thank you for empowering your young Spartan champion!
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  addToast('Receipt printed / exported to PDF.');
                  setReceiptInvoice(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl hover:brightness-110 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>Download PDF Receipt</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
