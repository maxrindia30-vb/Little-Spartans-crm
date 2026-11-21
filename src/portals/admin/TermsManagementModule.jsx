import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Send,
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Shield,
  Check,
  X,
  UserCheck,
  History,
  Layers,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export default function TermsManagementModule() {
  const {
    termsDocument,
    dosDontsDocument,
    termsAcceptances,
    activeSubTab,
    setActiveSubTab,
    addTermsSection,
    updateTermsSection,
    deleteTermsSection,
    addConductRule,
    updateConductRule,
    deleteConductRule,
    updateParentAcknowledgementText,
    publishNewTermsVersion,
    resetTermsDataToDefault,
    resetTermsAcceptanceForTesting,
    addToast
  } = useCrm();

  // Active Tab: 'terms' | 'dos_donts' | 'acceptances'
  const currentTab = activeSubTab || 'terms';
  const setTab = (tab) => {
    if (setActiveSubTab) setActiveSubTab(tab);
  };

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null); // null = new, object = edit

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleModalType, setRuleModalType] = useState('dos'); // 'dos' | 'donts'
  const [editingRuleIndex, setEditingRuleIndex] = useState(null);
  const [ruleText, setRuleText] = useState('');

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [newVersionInput, setNewVersionInput] = useState('1.1');
  const [versionNotes, setVersionNotes] = useState('');

  const [isAckModalOpen, setIsAckModalOpen] = useState(false);
  const [ackTextDraft, setAckTextDraft] = useState('');

  // Forms state for Add/Edit Terms Section
  const [secNumber, setSecNumber] = useState('');
  const [secTitle, setSecTitle] = useState('');
  const [secPoints, setSecPoints] = useState(['']);

  const handleOpenAddSection = () => {
    const nextNum = (termsDocument?.sections?.length || 0) + 1;
    setEditingSection(null);
    setSecNumber(nextNum);
    setSecTitle('');
    setSecPoints(['']);
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (sec) => {
    setEditingSection(sec);
    setSecNumber(sec.number);
    setSecTitle(sec.title);
    setSecPoints(sec.points && sec.points.length > 0 ? [...sec.points] : ['']);
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = (e) => {
    e.preventDefault();
    if (!secTitle.trim()) {
      addToast('Please enter a section title', 'warning');
      return;
    }
    const cleanPoints = secPoints.map(p => p.trim()).filter(Boolean);
    if (cleanPoints.length === 0) {
      addToast('Please provide at least one clause or bullet point', 'warning');
      return;
    }

    if (editingSection) {
      updateTermsSection(editingSection.number, {
        title: secTitle.trim(),
        points: cleanPoints,
      });
    } else {
      addTermsSection({
        number: parseInt(secNumber) || ((termsDocument?.sections?.length || 0) + 1),
        title: secTitle.trim(),
        points: cleanPoints,
      });
    }
    setIsSectionModalOpen(false);
  };

  // Conduct Rule Modal Openers
  const handleOpenAddRule = (type) => {
    setRuleModalType(type);
    setEditingRuleIndex(null);
    setRuleText('');
    setIsRuleModalOpen(true);
  };

  const handleOpenEditRule = (type, index, text) => {
    setRuleModalType(type);
    setEditingRuleIndex(index);
    setRuleText(text);
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = (e) => {
    e.preventDefault();
    if (!ruleText.trim()) return;
    if (editingRuleIndex !== null) {
      updateConductRule(ruleModalType, editingRuleIndex, ruleText.trim());
    } else {
      addConductRule(ruleModalType, ruleText.trim());
    }
    setIsRuleModalOpen(false);
  };

  // Preview Parent Modal handler
  const handlePreviewParentModal = () => {
    window.dispatchEvent(new CustomEvent('little-spartans:open-terms-modal'));
  };

  // Export audit logs to CSV
  const handleExportAuditLogs = () => {
    if (!termsAcceptances || termsAcceptances.length === 0) {
      addToast('No acceptance records to export yet.', 'info');
      return;
    }
    const headers = 'ID,Parent Name,Email,Role,Terms Version,Conduct Version,Accepted At,IP Address,Status\n';
    const rows = termsAcceptances.map(a => 
      `"${a.id}","${a.userName}","${a.userEmail}","${a.userRole}","${a.termsVersion}","${a.dosDontsVersion}","${a.termsAcceptedAt}","${a.ipAddress}","${a.status}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LittleSpartans_TermsAcceptance_Audit_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Audit log exported successfully.', 'success');
  };

  // Counts
  const termsSections = termsDocument?.sections || [];
  const totalTermsPoints = termsSections.reduce((acc, s) => acc + (s.points?.length || 0), 0);
  const totalDos = (dosDontsDocument?.dos || []).length;
  const totalDonts = (dosDontsDocument?.donts || []).length;
  const totalAcceptances = (termsAcceptances || []).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ======================================================== */}
      {/* 1. Module Header & Action Bar                            */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#172B5014] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#F4510B] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Governance &amp; Legal Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight">
            Terms &amp; Policies Governance
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50]/70 font-medium mt-1 max-w-2xl">
            Administer academy terms of service, parent code of conduct guidelines, manage clauses, and monitor digital acceptance audit trails.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handlePreviewParentModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#172B5025] text-xs font-bold text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B40] hover:text-[#F4510B] transition-all cursor-pointer shadow-xs"
            title="Preview the exact popup parents see upon login"
          >
            <Eye className="w-3.5 h-3.5 text-[#F4510B]" />
            <span>Preview Parent Modal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setNewVersionInput(
                termsDocument?.version ? `${(parseFloat(termsDocument.version) + 0.1).toFixed(1)}` : '1.1'
              );
              setIsPublishModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#172B50] text-white text-xs font-bold hover:bg-[#1f3763] transition-all cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5 text-[#F4510B]" />
            <span>Publish Revision</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddSection}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F4510B] text-white text-xs font-black hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md shadow-[#F4510B]/25"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. KPI Cards: Overview Metrics                           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Version */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#172B5014] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#172B50]/60 uppercase tracking-wider">
              Enforced Version
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center border border-[#F4510B20]">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#172B50]">
              v{termsDocument?.version || '1.0'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active
            </span>
          </div>
          <p className="text-[11px] text-[#172B50]/65 font-medium mt-1 truncate">
            Last Updated: {termsDocument?.lastUpdated || '21 Nov 2026'}
          </p>
        </div>

        {/* Terms Sections */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#172B5014] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#172B50]/60 uppercase tracking-wider">
              Terms &amp; Conditions
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#172B50] flex items-center justify-center border border-[#172B5015]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#172B50]">
              {termsSections.length}
            </span>
            <span className="text-xs font-bold text-[#172B50]/60">Sections</span>
          </div>
          <p className="text-[11px] text-[#172B50]/65 font-medium mt-1">
            {totalTermsPoints} active legal clauses &amp; terms
          </p>
        </div>

        {/* Conduct Guidelines */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#172B5014] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#172B50]/60 uppercase tracking-wider">
              Parent Conduct Rules
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#172B50]">
              {totalDos + totalDonts}
            </span>
            <span className="text-xs font-bold text-[#172B50]/60">Rules</span>
          </div>
          <p className="text-[11px] text-[#172B50]/65 font-medium mt-1">
            {totalDos} Do’s • {totalDonts} Don’ts codified
          </p>
        </div>

        {/* Digital Acceptances */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#172B5014] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#172B50]/60 uppercase tracking-wider">
              Parent Signatures
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center border border-[#F4510B20]">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#172B50]">
              {totalAcceptances}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified
            </span>
          </div>
          <p className="text-[11px] text-[#172B50]/65 font-medium mt-1">
            Mandatory gate on Parent Portal login
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. Navigation Tabs                                       */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#172B5014] pb-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setTab('terms')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              currentTab === 'terms'
                ? 'bg-[#F4510B] text-white shadow-md shadow-[#F4510B]/25'
                : 'bg-white text-[#172B50] hover:bg-[#FFF4E8] border border-[#172B5014]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms &amp; Conditions ({termsSections.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('dos_donts')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              currentTab === 'dos_donts'
                ? 'bg-[#F4510B] text-white shadow-md shadow-[#F4510B]/25'
                : 'bg-white text-[#172B50] hover:bg-[#FFF4E8] border border-[#172B5014]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Parent Do’s &amp; Don’ts ({totalDos + totalDonts})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('acceptances')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              currentTab === 'acceptances'
                ? 'bg-[#F4510B] text-white shadow-md shadow-[#F4510B]/25'
                : 'bg-white text-[#172B50] hover:bg-[#FFF4E8] border border-[#172B5014]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Parent Acceptances ({totalAcceptances})</span>
          </button>
        </div>

        {/* Right Tab Tools */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetTermsDataToDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#172B50]/70 hover:text-[#F4510B] hover:bg-[#FFF4E8] rounded-lg transition-colors cursor-pointer"
            title="Restore default academy legal template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. Tab 1: Terms & Conditions Sections                    */}
      {/* ======================================================== */}
      {currentTab === 'terms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#172B5014]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#172B50]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search terms, titles or clause keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#172B5020] text-xs focus:ring-2 focus:ring-[#F4510B] focus:border-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#172B50]/60 font-semibold">
                Showing {termsSections.length} sections
              </span>
              <button
                type="button"
                onClick={handleOpenAddSection}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B25] rounded-lg text-xs font-bold hover:bg-[#F4510B] hover:text-white transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
            </div>
          </div>

          {/* Section Cards */}
          <div className="grid grid-cols-1 gap-4">
            {termsSections
              .filter((sec) => {
                if (!searchTerm.trim()) return true;
                const q = searchTerm.toLowerCase();
                return (
                  sec.title.toLowerCase().includes(q) ||
                  sec.points?.some((p) => p.toLowerCase().includes(q))
                );
              })
              .map((sec) => (
                <div
                  key={sec.number}
                  className="bg-white rounded-2xl p-5 border border-[#172B5014] shadow-xs hover:border-[#F4510B30] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FFF4E8] text-[#F4510B] font-black text-sm flex items-center justify-center border border-[#F4510B25] shrink-0">
                        {sec.number}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-[#172B50]">
                          {sec.title}
                        </h3>
                        <p className="text-[11px] text-[#172B50]/60 font-medium">
                          {sec.points?.length || 0} sub-clauses
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSection(sec)}
                        className="p-1.5 rounded-lg border border-[#172B5015] text-[#172B50] hover:text-[#F4510B] hover:bg-[#FFF4E8] transition-colors cursor-pointer"
                        title="Edit section"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete Section ${sec.number}: "${sec.title}"?`)) {
                            deleteTermsSection(sec.number);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-[#172B5015] text-[#172B50] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <ul className="space-y-1.5 pl-11 list-disc marker:text-[#F4510B] text-xs text-[#172B50]/80 leading-relaxed">
                    {(sec.points || []).map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. Tab 2: Parent Do's & Don'ts                           */}
      {/* ======================================================== */}
      {currentTab === 'dos_donts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Parent Do's Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-base font-black text-emerald-950">
                      Parent Do’s
                    </h3>
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      {(dosDontsDocument?.dos || []).length} positive guidelines
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAddRule('dos')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Do</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {(dosDontsDocument?.dos || []).map((rule, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start justify-between gap-3 p-2.5 rounded-xl bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-100/60 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 text-xs text-[#172B50]/90 leading-relaxed">
                      <span className="font-bold text-emerald-700 shrink-0 mt-0.5">
                        {idx + 1}.
                      </span>
                      <span>{rule}</span>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditRule('dos', idx, rule)}
                        className="p-1 rounded text-[#172B50]/60 hover:text-emerald-700 hover:bg-white"
                        title="Edit guideline"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove this Parent Do guideline?`)) {
                            deleteConductRule('dos', idx);
                          }
                        }}
                        className="p-1 rounded text-[#172B50]/60 hover:text-rose-600 hover:bg-white"
                        title="Delete guideline"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parent Don'ts Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-rose-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 font-black text-sm flex items-center justify-center">
                    ✕
                  </div>
                  <div>
                    <h3 className="text-base font-black text-rose-950">
                      Parent Don’ts
                    </h3>
                    <p className="text-[11px] text-rose-700 font-semibold">
                      {(dosDontsDocument?.donts || []).length} prohibited behaviors
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAddRule('donts')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Don't</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {(dosDontsDocument?.donts || []).map((rule, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start justify-between gap-3 p-2.5 rounded-xl bg-rose-50/40 hover:bg-rose-50 border border-rose-100/60 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 text-xs text-[#172B50]/90 leading-relaxed">
                      <span className="font-bold text-rose-700 shrink-0 mt-0.5">
                        {idx + 1}.
                      </span>
                      <span>{rule}</span>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditRule('donts', idx, rule)}
                        className="p-1 rounded text-[#172B50]/60 hover:text-rose-700 hover:bg-white"
                        title="Edit guideline"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove this Parent Don't guideline?`)) {
                            deleteConductRule('donts', idx);
                          }
                        }}
                        className="p-1 rounded text-[#172B50]/60 hover:text-rose-600 hover:bg-white"
                        title="Delete guideline"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Parent Acknowledgement Statement Box */}
          <div className="bg-[#FFF9F5] rounded-2xl p-5 border border-[#F4510B25] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-black text-[#F4510B] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                <span>Parent Acknowledgement Clause</span>
              </span>
              <p className="text-xs text-[#172B50]/80 leading-relaxed max-w-3xl">
                {dosDontsDocument?.acknowledgement ||
                  'By selecting the acknowledgement checkbox, the parent confirms that they have read and understood the Parent Do’s & Don’ts and will cooperate with the academy.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setAckTextDraft(dosDontsDocument?.acknowledgement || '');
                setIsAckModalOpen(true);
              }}
              className="px-3.5 py-2 bg-white text-xs font-bold text-[#172B50] border border-[#172B5020] rounded-xl hover:border-[#F4510B] hover:text-[#F4510B] transition-colors cursor-pointer shrink-0"
            >
              Edit Statement
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. Tab 3: Parent Acceptance Audit Trail                  */}
      {/* ======================================================== */}
      {currentTab === 'acceptances' && (
        <div className="bg-white rounded-2xl border border-[#172B5014] shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-[#172B50]">
                Digital Acceptance Audit Trail
              </h3>
              <p className="text-xs text-[#172B50]/60 font-medium">
                Verified records of parents who have reviewed and accepted the active academy terms and code of conduct.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportAuditLogs}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B25] text-xs font-bold hover:bg-[#F4510B] hover:text-white transition-all cursor-pointer shadow-xs shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Audit Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#172B5014] bg-[#F8FAFC] text-[#172B50]/70 font-bold">
                  <th className="py-3 px-3">Parent Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Terms Ver.</th>
                  <th className="py-3 px-3">Conduct Ver.</th>
                  <th className="py-3 px-3">Accepted Date &amp; Time</th>
                  <th className="py-3 px-3">IP Address</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B500C]">
                {termsAcceptances && termsAcceptances.length > 0 ? (
                  termsAcceptances.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#FFF9F5]/50 transition-colors">
                      <td className="py-3 px-3 font-extrabold text-[#172B50]">
                        {rec.userName || 'Parent User'}
                      </td>
                      <td className="py-3 px-3 text-[#172B50]/80">
                        {rec.userEmail || '—'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {rec.userRole || 'parent'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#172B50]">
                        v{rec.termsVersion || '1.0'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#172B50]">
                        v{rec.dosDontsVersion || '1.0'}
                      </td>
                      <td className="py-3 px-3 text-[#172B50]/70">
                        {rec.termsAcceptedAt
                          ? new Date(rec.termsAcceptedAt).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#172B50]/60">
                        {rec.ipAddress || '127.0.0.1'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                          <Check className="w-2.5 h-2.5" />
                          <span>Accepted</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Reset acceptance for ${rec.userEmail}? This will require them to accept terms again on next login.`)) {
                              resetTermsAcceptanceForTesting(rec.userEmail);
                            }
                          }}
                          className="px-2 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors cursor-pointer"
                          title="Reset acceptance for this user"
                        >
                          Reset
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#172B50]/60">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Shield className="w-8 h-8 text-[#172B50]/30" />
                        <p className="font-bold text-sm">No acceptance records yet</p>
                        <p className="text-xs max-w-sm">
                          When parents log into the Parent Portal and accept the terms modal, their verified timestamped audit records will appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. Modal: Add / Edit Terms Section                       */}
      {/* ======================================================== */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#172B50]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-[#172B5014] shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#172B5014]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#F4510B]" />
                <h3 className="text-lg font-black text-[#172B50]">
                  {editingSection ? `Edit Section ${editingSection.number}` : 'Add Terms Section'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSectionModalOpen(false)}
                className="p-1 rounded-lg text-[#172B50]/60 hover:text-[#172B50] hover:bg-[#172B5010] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#172B50] mb-1">
                    Section #
                  </label>
                  <input
                    type="number"
                    value={secNumber}
                    onChange={(e) => setSecNumber(e.target.value)}
                    disabled={!!editingSection}
                    className="w-full px-3 py-2 rounded-xl border border-[#172B5025] text-xs font-bold focus:ring-2 focus:ring-[#F4510B] outline-none disabled:bg-gray-100"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-bold text-[#172B50] mb-1">
                    Section Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Attendance &amp; Class Compensation"
                    value={secTitle}
                    onChange={(e) => setSecTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#172B5025] text-xs focus:ring-2 focus:ring-[#F4510B] outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#172B50]">
                    Clauses &amp; Points ({secPoints.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setSecPoints([...secPoints, ''])}
                    className="text-xs font-bold text-[#F4510B] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Clause Point</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {secPoints.map((pt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#172B50]/50 w-5">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={pt}
                        onChange={(e) => {
                          const updated = [...secPoints];
                          updated[idx] = e.target.value;
                          setSecPoints(updated);
                        }}
                        placeholder={`Clause point #${idx + 1}`}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-[#172B5020] text-xs focus:ring-2 focus:ring-[#F4510B] outline-none"
                      />
                      {secPoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSecPoints(secPoints.filter((_, i) => i !== idx))}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          title="Remove point"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#172B5014] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F4510B] text-white text-xs font-bold rounded-xl hover:brightness-110 active:scale-95 shadow-md shadow-[#F4510B]/25"
                >
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. Modal: Add / Edit Conduct Rule                        */}
      {/* ======================================================== */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#172B50]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#172B5014] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#172B5014]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#F4510B]" />
                <h3 className="text-lg font-black text-[#172B50]">
                  {editingRuleIndex !== null ? 'Edit' : 'Add'} Parent {ruleModalType === 'dos' ? 'Do' : "Don't"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                className="p-1 rounded-lg text-[#172B50]/60 hover:text-[#172B50] hover:bg-[#172B5010] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">
                  Category
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-emerald-800 cursor-pointer">
                    <input
                      type="radio"
                      name="ruleType"
                      checked={ruleModalType === 'dos'}
                      onChange={() => setRuleModalType('dos')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Parent Do (Encouraged Action)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-rose-800 cursor-pointer">
                    <input
                      type="radio"
                      name="ruleType"
                      checked={ruleModalType === 'donts'}
                      onChange={() => setRuleModalType('donts')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>Parent Don't (Prohibited Action)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">
                  Guideline Statement
                </label>
                <textarea
                  rows={4}
                  value={ruleText}
                  onChange={(e) => setRuleText(e.target.value)}
                  placeholder="e.g., Ensure your child arrives 10 minutes prior to training session."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#172B5025] text-xs focus:ring-2 focus:ring-[#F4510B] outline-none leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-[#172B5014] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F4510B] text-white text-xs font-bold rounded-xl hover:brightness-110 active:scale-95 shadow-md shadow-[#F4510B]/25"
                >
                  Save Guideline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. Modal: Edit Acknowledgement Statement                 */}
      {/* ======================================================== */}
      {isAckModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#172B50]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#172B5014] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#172B5014]">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#F4510B]" />
                <h3 className="text-lg font-black text-[#172B50]">
                  Edit Parent Acknowledgement Statement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAckModalOpen(false)}
                className="p-1 rounded-lg text-[#172B50]/60 hover:text-[#172B50] hover:bg-[#172B5010] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#172B50]">
                Statement displayed above acceptance checkbox
              </label>
              <textarea
                rows={5}
                value={ackTextDraft}
                onChange={(e) => setAckTextDraft(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#172B5025] text-xs focus:ring-2 focus:ring-[#F4510B] outline-none leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-[#172B5014] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAckModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateParentAcknowledgementText(ackTextDraft);
                  setIsAckModalOpen(false);
                }}
                className="px-5 py-2 bg-[#F4510B] text-white text-xs font-bold rounded-xl hover:brightness-110 active:scale-95 shadow-md shadow-[#F4510B]/25"
              >
                Save Statement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 10. Modal: Publish New Revision                          */}
      {/* ======================================================== */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#172B50]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#172B5014] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#172B5014]">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#F4510B]" />
                <h3 className="text-lg font-black text-[#172B50]">
                  Publish Policy Revision
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="p-1 rounded-lg text-[#172B50]/60 hover:text-[#172B50] hover:bg-[#172B5010] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Notice to Academy Administrator</span>
              </p>
              <p>
                Publishing a new revision (e.g., from v{termsDocument?.version || '1.0'} to v{newVersionInput}) will mandate that <strong>all parents re-review and accept the updated terms</strong> upon their next login to the Parent Portal.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">
                  New Version Number
                </label>
                <input
                  type="text"
                  value={newVersionInput}
                  onChange={(e) => setNewVersionInput(e.target.value)}
                  placeholder="e.g., 1.1"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#172B5025] text-xs font-bold focus:ring-2 focus:ring-[#F4510B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B50] mb-1">
                  Revision Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={versionNotes}
                  onChange={(e) => setVersionNotes(e.target.value)}
                  placeholder="Summary of modifications, additions or changes..."
                  className="w-full px-3 py-2 rounded-xl border border-[#172B5025] text-xs focus:ring-2 focus:ring-[#F4510B] outline-none leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#172B5014] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#172B50] hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  publishNewTermsVersion({
                    termsVersion: newVersionInput.trim() || '1.1',
                    dosDontsVersion: newVersionInput.trim() || '1.1',
                    changeNotes: versionNotes.trim(),
                  });
                  setIsPublishModalOpen(false);
                }}
                className="px-5 py-2 bg-[#F4510B] text-white text-xs font-bold rounded-xl hover:brightness-110 active:scale-95 shadow-md shadow-[#F4510B]/25"
              >
                Confirm &amp; Publish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
