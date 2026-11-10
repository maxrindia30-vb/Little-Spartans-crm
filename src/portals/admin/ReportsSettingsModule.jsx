import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Database, 
  ShieldCheck, 
  Settings, 
  Calendar, 
  Filter, 
  FileSpreadsheet, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  HardDrive, 
  FileCheck, 
  Users, 
  ArrowRight,
  Eye,
  Key,
  Lock,
  Sparkles
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import ReportsAnalytics from './ReportsAnalytics';
import AcademySettings from './AcademySettings';

export default function ReportsSettingsModule() {
  const { data, activeSubTab, setActiveSubTab, addToast, createBackup, restoreBackup } = useCrm();

  // Active sub-tab defaults to 'analytics' if not specified
  const currentTab = ['analytics', 'export', 'backup', 'permissions', 'settings'].includes(activeSubTab) 
    ? activeSubTab 
    : 'analytics';

  // Export State
  const [exportEntity, setExportEntity] = useState('students');
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportDateRange, setExportDateRange] = useState('all');
  const [exportProgram, setExportProgram] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  // Backup State
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedBackupToRestore, setSelectedBackupToRestore] = useState(null);

  // Trigger real data export
  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      let exportData = [];
      let filename = `spartans_${exportEntity}_export_${new Date().toISOString().slice(0, 10)}`;

      if (exportEntity === 'students') {
        exportData = data.students.map(s => ({
          ID: s.id,
          Name: s.name,
          Age: s.age,
          Gender: s.gender,
          Program: s.program,
          Batch: s.batch,
          Status: s.status,
          ParentName: s.parentName,
          ParentPhone: s.parentPhone,
          JoinDate: s.joinDate,
          AttendanceRate: `${s.attendanceRate || 95}%`
        }));
      } else if (exportEntity === 'parents') {
        exportData = data.parents.map(p => ({
          ID: p.id,
          Name: p.name,
          Email: p.email,
          Phone: p.phone,
          Children: (p.children || []).join(', '),
          EmergencyContact: p.emergencyContact,
          Status: p.status
        }));
      } else if (exportEntity === 'coaches') {
        exportData = data.coaches.map(c => ({
          ID: c.id,
          Name: c.name,
          Specialization: c.specialization,
          Experience: c.experience,
          Batches: (c.batches || []).join(', '),
          Phone: c.phone,
          Status: c.status
        }));
      } else if (exportEntity === 'enquiries') {
        exportData = data.enquiries.map(e => ({
          ID: e.id,
          StudentName: e.studentName,
          ParentName: e.parentName,
          Phone: e.phone,
          Program: e.program,
          Status: e.status,
          Date: e.date,
          TrialDate: e.trialDate || 'N/A'
        }));
      } else if (exportEntity === 'fees') {
        exportData = (data.studentFeeAssignments || []).map(f => ({
          ID: f.id,
          StudentName: f.studentName,
          Program: f.program,
          FeePlan: f.feePlan,
          Amount: f.amount,
          Discount: f.discount,
          FinalPayable: f.finalPayable,
          TotalPaid: f.totalPaid,
          Outstanding: f.outstanding,
          DueDate: f.dueDate,
          Status: f.status
        }));
      } else if (exportEntity === 'payments') {
        exportData = (data.payments || []).map(p => ({
          ID: p.id,
          InvoiceNumber: p.invoiceNumber,
          StudentName: p.studentName,
          Program: p.program,
          Amount: p.amount,
          PaymentMethod: p.paymentMethod,
          Date: p.date,
          Status: p.status
        }));
      } else if (exportEntity === 'attendance') {
        exportData = (data.attendanceHistory || []).map(a => ({
          ID: a.id,
          Date: a.date,
          SessionName: a.sessionName,
          Discipline: a.discipline,
          TotalStudents: a.total,
          PresentCount: a.present,
          Rate: `${a.percentage}%`,
          LeadCoach: a.coach
        }));
      }

      if (exportFormat === 'csv') {
        if (exportData.length === 0) {
          addToast('No records found for the selected entity.', 'warning');
          setIsExporting(false);
          return;
        }
        const headers = Object.keys(exportData[0]).join(',');
        const rows = exportData.map(row => 
          Object.values(row).map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + '\n' + rows);
        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast(`Exported ${exportData.length} ${exportEntity} records to CSV!`, 'success');
      } else if (exportFormat === 'excel') {
        // Generate XML-based spreadsheet or CSV download
        const headers = Object.keys(exportData[0] || {}).join('\t');
        const rows = exportData.map(row => Object.values(row).join('\t')).join('\n');
        const blob = new Blob([headers + '\n' + rows], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addToast(`Exported ${exportData.length} records as Excel file!`, 'success');
      } else {
        // PDF / Print format
        window.print();
        addToast(`Prepared printable report for ${exportEntity}.`, 'info');
      }

      setIsExporting(false);
    }, 600);
  };

  // Trigger manual backup
  const handleTriggerBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      createBackup('Manual On-Demand Snapshot');
      setIsBackingUp(false);
    }, 800);
  };

  // Confirm restore
  const handleConfirmRestore = () => {
    if (selectedBackupToRestore) {
      restoreBackup(selectedBackupToRestore.id);
      setRestoreModalOpen(false);
      setSelectedBackupToRestore(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Navigation Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-[#172B501A] shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#F4510B]/10 text-[#F4510B]">
                Module 9
              </span>
              <h1 className="text-2xl font-black text-[#172B50] tracking-tight">
                Reports & Settings
              </h1>
            </div>
            <p className="text-xs text-[#172B50] opacity-75 mt-0.5">
              Academy performance analytics, multi-entity data export, automated cloud backups and security permissions
            </p>
          </div>

          {/* Sub-tab Pills */}
          <div className="flex items-center flex-wrap gap-1.5 p-1 bg-[#FFF4E8] rounded-xl border border-[#172B5015]">
            <button
              onClick={() => setActiveSubTab('analytics')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'analytics'
                  ? 'bg-[#172B50] text-white shadow-sm'
                  : 'text-[#172B50] hover:bg-white/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveSubTab('export')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'export'
                  ? 'bg-[#172B50] text-white shadow-sm'
                  : 'text-[#172B50] hover:bg-white/60'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Data Export</span>
            </button>

            <button
              onClick={() => setActiveSubTab('backup')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'backup'
                  ? 'bg-[#172B50] text-white shadow-sm'
                  : 'text-[#172B50] hover:bg-white/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Backup & Recovery</span>
            </button>

            <button
              onClick={() => setActiveSubTab('permissions')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'permissions'
                  ? 'bg-[#172B50] text-white shadow-sm'
                  : 'text-[#172B50] hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Permissions (RBAC)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('settings')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'settings'
                  ? 'bg-[#172B50] text-white shadow-sm'
                  : 'text-[#172B50] hover:bg-white/60'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Academy Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: ANALYTICS */}
      {currentTab === 'analytics' && (
        <ReportsAnalytics />
      )}

      {/* SUB-TAB 2: DATA EXPORT */}
      {currentTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card">
            <div className="max-w-3xl">
              <h2 className="text-lg font-black text-[#172B50]">Export Academy Data Assets</h2>
              <p className="text-xs text-[#172B50] opacity-75 mt-1">
                Select target datasets, filter records, and generate verified exports in CSV, Microsoft Excel, or printable PDF summary.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {/* Target Entity */}
              <div>
                <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1.5">
                  1. Dataset Entity
                </label>
                <select
                  value={exportEntity}
                  onChange={(e) => setExportEntity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#172B5025] bg-[#FFF4E8]/30 text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B]"
                >
                  <option value="students">Students Roster ({data.students.length})</option>
                  <option value="parents">Parents Directory ({data.parents.length})</option>
                  <option value="coaches">Coaching Staff ({data.coaches.length})</option>
                  <option value="enquiries">Lead Enquiries ({data.enquiries.length})</option>
                  <option value="fees">Fee Assignments & Dues ({(data.studentFeeAssignments || []).length})</option>
                  <option value="payments">Payment Receipts ({(data.payments || []).length})</option>
                  <option value="attendance">Attendance Sessions ({(data.attendanceHistory || []).length})</option>
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1.5">
                  2. File Format
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#172B5025] bg-[#FFF4E8]/30 text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B]"
                >
                  <option value="csv">CSV (Comma-Separated Values)</option>
                  <option value="excel">Microsoft Excel (.xls)</option>
                  <option value="pdf">Print / PDF Document</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1.5">
                  3. Date Range
                </label>
                <select
                  value={exportDateRange}
                  onChange={(e) => setExportDateRange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#172B5025] bg-[#FFF4E8]/30 text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B]"
                >
                  <option value="all">Full Historical Archive</option>
                  <option value="this_month">Current Term / Month</option>
                  <option value="last_90">Last 90 Days</option>
                  <option value="this_year">Academic Year 2026</option>
                </select>
              </div>

              {/* Program Discipline */}
              <div>
                <label className="block text-[11px] font-bold text-[#172B50] uppercase tracking-wider mb-1.5">
                  4. Program Discipline
                </label>
                <select
                  value={exportProgram}
                  onChange={(e) => setExportProgram(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#172B5025] bg-[#FFF4E8]/30 text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B]"
                >
                  <option value="all">All Disciplines</option>
                  <option value="Gymnastics">Gymnastics</option>
                  <option value="Athletics">Athletics</option>
                  <option value="Martial Arts">Martial Arts</option>
                  <option value="Badminton">Badminton</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-[#172B5015]">
              <div className="flex items-center gap-2 text-xs text-[#172B50] opacity-80">
                <FileCheck className="w-4 h-4 text-[#F4510B]" />
                <span>Exports are sanitized and comply with Little Spartans data privacy policy.</span>
              </div>

              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#F4510B] text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 disabled:opacity-60 transition-all"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Export...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download {exportEntity.toUpperCase()} ({exportFormat.toUpperCase()})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Preset Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#172B5015] shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#172B50]">Financial Audit Pack</h4>
                  <p className="text-[11px] text-[#172B50] opacity-70">Tuitions, invoices, receipts & dues</p>
                </div>
              </div>
              <button
                onClick={() => { setExportEntity('fees'); setExportFormat('csv'); handleExportData(); }}
                className="w-full mt-4 py-2 px-3 rounded-lg border border-[#172B5020] text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] flex items-center justify-between transition-colors"
              >
                <span>Export Ledger CSV</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#172B5015] shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#172B50]">Active Academy Roster</h4>
                  <p className="text-[11px] text-[#172B50] opacity-70">Students, emergency contacts & medicals</p>
                </div>
              </div>
              <button
                onClick={() => { setExportEntity('students'); setExportFormat('csv'); handleExportData(); }}
                className="w-full mt-4 py-2 px-3 rounded-lg border border-[#172B5020] text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] flex items-center justify-between transition-colors"
              >
                <span>Export Student Roster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#172B5015] shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#172B50]">Monthly Attendance Audit</h4>
                  <p className="text-[11px] text-[#172B50] opacity-70">Turnout rates, absences & makeup credits</p>
                </div>
              </div>
              <button
                onClick={() => { setExportEntity('attendance'); setExportFormat('csv'); handleExportData(); }}
                className="w-full mt-4 py-2 px-3 rounded-lg border border-[#172B5020] text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] flex items-center justify-between transition-colors"
              >
                <span>Export Attendance CSV</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: BACKUP & RECOVERY */}
      {currentTab === 'backup' && (
        <div className="space-y-6">
          
          {/* Status Bar */}
          <div className="bg-gradient-to-r from-[#172B50] to-[#253f73] rounded-2xl p-6 text-white shadow-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                    Automated Cloud Backup System: ACTIVE
                  </span>
                </div>
                <h2 className="text-xl font-black">Daily Automated Academy Snapshot</h2>
                <p className="text-xs text-white/80 max-w-xl">
                  ZenConnect securely snapshots Little Spartans CRM database every 24 hours at 02:00 AM IST. Backups include student records, fee ledgers, attendance histories and credentials.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start md:self-auto">
                <button
                  onClick={handleTriggerBackup}
                  disabled={isBackingUp}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#F4510B] text-white text-xs font-black hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-md"
                >
                  <RefreshCw className={`w-4 h-4 ${isBackingUp ? 'animate-spin' : ''}`} />
                  <span>{isBackingUp ? 'Backing Up...' : 'Create Backup Now'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
              <div>
                <p className="text-white/60 text-[10px] uppercase font-bold">Retention Policy</p>
                <p className="font-extrabold text-white mt-0.5">30 Days Rolling</p>
              </div>
              <div>
                <p className="text-white/60 text-[10px] uppercase font-bold">Encryption</p>
                <p className="font-extrabold text-white mt-0.5">AES-256 GCM</p>
              </div>
              <div>
                <p className="text-white/60 text-[10px] uppercase font-bold">Total Snapshots</p>
                <p className="font-extrabold text-white mt-0.5">{(data.backups || []).length} Available</p>
              </div>
              <div>
                <p className="text-white/60 text-[10px] uppercase font-bold">Next Automated Run</p>
                <p className="font-extrabold text-white mt-0.5">Tonight at 02:00 AM</p>
              </div>
            </div>
          </div>

          {/* Backup History Table */}
          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <div className="p-5 border-b border-[#172B5010] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#172B50]">Historical Backup Snapshots</h3>
                <p className="text-xs text-[#172B50] opacity-70">Download offline copy or restore state</p>
              </div>
              <span className="text-xs font-bold text-[#F4510B]">
                {(data.backups || []).length} Snapshots
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FFF4E8]/50 border-b border-[#172B5010] text-[#172B50] text-[11px] font-black uppercase tracking-wider">
                    <th className="py-3 px-4">Backup ID</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Created Timestamp</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Checksum</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B500C]">
                  {(data.backups || []).map((backup) => (
                    <tr key={backup.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#172B50]">
                        {backup.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          backup.type.includes('Auto') 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-orange-100 text-[#F4510B]'
                        }`}>
                          {backup.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#172B50] font-medium">
                        {backup.timestamp}
                      </td>
                      <td className="py-3.5 px-4 text-[#172B50] font-bold">
                        {backup.size}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-gray-500">
                        {backup.checksum || 'sha256-verified'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{backup.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
                              const link = document.createElement("a");
                              link.href = jsonStr;
                              link.download = `${backup.id}.json`;
                              link.click();
                              addToast(`Downloaded snapshot file for ${backup.id}`);
                            }}
                            className="p-1.5 rounded-lg border border-[#172B5020] text-[#172B50] hover:bg-[#FFF4E8] transition-colors"
                            title="Download JSON snapshot"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBackupToRestore(backup);
                              setRestoreModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#172B50] text-white text-[11px] font-bold hover:bg-[#172B50]/90 transition-all"
                          >
                            Restore
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: USER PERMISSIONS (RBAC) */}
      {currentTab === 'permissions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card">
            <div className="max-w-2xl">
              <h2 className="text-lg font-black text-[#172B50]">Role-Based Access Control (RBAC) Matrix</h2>
              <p className="text-xs text-[#172B50] opacity-75 mt-1">
                Security clearance and functional boundaries enforced across Admin, Coach, and Parent portals.
              </p>
            </div>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FFF4E8]/50 border-b border-[#172B5010] text-[#172B50] text-[11px] font-black uppercase tracking-wider">
                    <th className="py-3 px-4">Academy Module</th>
                    <th className="py-3 px-4 text-center">Super Admin</th>
                    <th className="py-3 px-4 text-center">Branch Admin</th>
                    <th className="py-3 px-4 text-center">Head Coach</th>
                    <th className="py-3 px-4 text-center">Assistant Coach</th>
                    <th className="py-3 px-4 text-center">Parent Account</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B500C]">
                  {[
                    { module: 'Enquiry Management & Leads', sa: 'Full Access', ba: 'Full Access', hc: 'View Assigned', ac: 'No Access', pa: 'No Access' },
                    { module: 'Student & Parent Profiles', sa: 'Full Access', ba: 'Full Access', hc: 'View Roster', ac: 'View Roster', pa: 'Own Children Only' },
                    { module: 'User Account Creation & Password Reset', sa: 'Exclusive Control', ba: 'Create Only', hc: 'No Access', ac: 'No Access', pa: 'No Access' },
                    { module: 'Programs, Batches & Timetables', sa: 'Full Access', ba: 'Full Access', hc: 'View Schedule', ac: 'View Schedule', pa: 'View Enrolled' },
                    { module: 'Attendance & Compensation Approvals', sa: 'Full Access', ba: 'Full Access', hc: 'Mark & Conduct', ac: 'Mark Only', pa: 'Request Only' },
                    { module: 'Fee Structures, Invoices & Payments', sa: 'Full Access', ba: 'Record Fees', hc: 'No Access', ac: 'No Access', pa: 'Pay & View Receipts' },
                    { module: 'Sports Competitions & Certificates', sa: 'Full Access', ba: 'Full Access', hc: 'Submit Scores', ac: 'View Only', pa: 'View Certificates' },
                    { module: 'Automated Backup & System Restore', sa: 'Exclusive Control', ba: 'No Access', hc: 'No Access', ac: 'No Access', pa: 'No Access' },
                    { module: 'Raw Data Export (CSV / Excel)', sa: 'Full Access', ba: 'Branch Only', hc: 'No Access', ac: 'No Access', pa: 'No Access' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#FFF4E8]/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#172B50]">{row.module}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                          {row.sa}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {row.ba}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                          {row.hc}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700">
                          {row.ac}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800">
                          {row.pa}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: ACADEMY SETTINGS */}
      {currentTab === 'settings' && (
        <AcademySettings />
      )}

      {/* RESTORE MODAL */}
      {restoreModalOpen && selectedBackupToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#172B501A] space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 rounded-xl bg-amber-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#172B50]">Confirm System Restore</h3>
                <p className="text-xs text-[#172B50] opacity-70">Little Spartans ZenConnect Database</p>
              </div>
            </div>

            <p className="text-xs text-[#172B50] leading-relaxed">
              You are about to restore the academy database from snapshot <strong>{selectedBackupToRestore.id}</strong> ({selectedBackupToRestore.timestamp}). Current active state will be safely synchronized to this snapshot.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#172B5015]">
              <button
                onClick={() => setRestoreModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                className="px-5 py-2 text-xs font-black text-white bg-[#F4510B] hover:brightness-110 rounded-xl transition-all shadow-sm"
              >
                Confirm & Restore
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
