import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Check,
  CheckCircle2,
  ArrowRight,
  Shield,
  FileText,
  AlertCircle,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import {
  TERMS_AND_CONDITIONS_DOC,
  PARENT_DOS_AND_DONTS_DOC,
} from '../../data/termsAndPoliciesContent';

export default function FirstTimeTermsModal({ isOpen = true, currentUser, currentPortal }) {
  const { 
    logout, 
    recordTermsAcceptance, 
    addToast,
    termsDocument,
    dosDontsDocument
  } = useCrm();

  const activeTermsDoc = termsDocument || TERMS_AND_CONDITIONS_DOC;
  const activeDosDontsDoc = dosDontsDocument || PARENT_DOS_AND_DONTS_DOC;

  const [activeTab, setActiveTab] = useState('terms'); // 'terms' | 'dosDonts'

  // Scroll detection state
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const [hasScrolledDosDonts, setHasScrolledDosDonts] = useState(false);

  // Checkbox agreement state
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [dosDontsAgreed, setDosDontsAgreed] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Container refs for scroll detection
  const termsScrollRef = useRef(null);
  const dosDontsScrollRef = useRef(null);

  // Non-dismissible: Prevent closing on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Auto-detect if container fits without scroll on large screens
  useEffect(() => {
    if (termsScrollRef.current) {
      const el = termsScrollRef.current;
      if (el.scrollHeight <= el.clientHeight + 20) {
        setHasScrolledTerms(true);
      }
    }
    if (dosDontsScrollRef.current) {
      const el = dosDontsScrollRef.current;
      if (el.scrollHeight <= el.clientHeight + 20) {
        setHasScrolledDosDonts(true);
      }
    }
  }, []);

  // Scroll listeners
  const handleTermsScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 35) {
      setHasScrolledTerms(true);
    }
  };

  const handleDosDontsScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 35) {
      setHasScrolledDosDonts(true);
    }
  };

  // Cancel button returns user to sign-in screen
  const handleCancel = () => {
    addToast('Sign-in cancelled. Acceptance of Terms & Conditions is required to access your account.', 'info');
    logout();
  };

  // Accept & Continue button
  const handleAcceptAndContinue = async () => {
    if (!termsAgreed || !dosDontsAgreed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        userId: currentUser?.email || currentUser?.name || 'ACC-PARENT',
        userEmail: currentUser?.email || '',
        userName: currentUser?.name || 'Academy Parent',
        userRole: currentPortal || 'parent',
        termsVersion: activeTermsDoc.version || '1.0',
        dosDontsVersion: activeDosDontsDoc.version || '1.0',
      };

      const res = await recordTermsAcceptance(payload);
      if (res.success) {
        addToast("Welcome to Little Spartans! Terms & Conditions accepted.", 'success');
      } else {
        addToast(res.error || 'Failed to save acknowledgement. Please try again.', 'error');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error saving terms acceptance:', err);
      addToast('An error occurred while saving acknowledgement. Please try again.', 'error');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const canContinue = termsAgreed && dosDontsAgreed;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-heading"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-[#172B50]/65 backdrop-blur-xs animate-in fade-in duration-200 select-none overflow-y-auto"
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-[28px] sm:rounded-[32px] border border-[#172B5014] shadow-[0_25px_70px_rgba(23,43,80,0.22)] p-6 sm:p-8 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Top Decorative Subtle Orange Accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F4510B]/5 rounded-bl-full pointer-events-none" />
        <div className="absolute top-0 left-0 w-24 h-24 bg-[#FFF4E8]/60 rounded-br-full pointer-events-none" />

        {/* ======================================================== */}
        {/* 1. Header Section: Illustration + Title + Subtitle      */}
        {/* ======================================================== */}
        <div className="flex flex-col items-center text-center relative z-10">
          {/* Clipboard & Shield Custom SVG Illustration */}
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-tr from-[#FFF4E8] via-[#FFEADB] to-[#FFF9F5] border border-[#F4510B20] flex items-center justify-center relative shadow-sm">
            {/* Clipboard Frame */}
            <svg
              className="w-12 h-12 text-[#172B50] drop-shadow-xs"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Clipboard Backboard */}
              <rect x="8" y="10" width="32" height="34" rx="5" fill="#172B50" />
              {/* Paper Sheet */}
              <rect x="11" y="13" width="26" height="28" rx="3" fill="#FFFFFF" />
              {/* Clip at top */}
              <rect x="18" y="7" width="12" height="6" rx="2" fill="#F4510B" />
              <rect x="21" y="9" width="6" height="2" rx="1" fill="#FFFFFF" />
              {/* Text Lines on paper */}
              <line x1="16" y1="19" x2="30" y2="19" stroke="#172B50" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="24" x2="32" y2="24" stroke="#172B50" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.75" />
              <line x1="16" y1="29" x2="28" y2="29" stroke="#172B50" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.75" />
              <line x1="16" y1="34" x2="26" y2="34" stroke="#172B50" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
            </svg>

            {/* Overlapping Shield with Security Checkmark */}
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-[#F4510B] text-white flex items-center justify-center shadow-md shadow-[#F4510B]/35 border-2 border-white">
              <Shield className="w-4 h-4 fill-white text-[#F4510B]" />
            </div>
          </div>

          {/* Heading */}
          <h2
            id="terms-modal-heading"
            className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight mt-3 sm:mt-4"
          >
            Welcome to Little Spartans! 👋
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-[#172B50]/70 font-medium mt-1 max-w-lg leading-relaxed">
            Before you continue, please review and accept the following to set up your account.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 2. Document Tabs                                        */}
        {/* ======================================================== */}
        <div className="flex items-center justify-center border-b border-[#172B5014] gap-6 sm:gap-10 mt-5">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`pb-2.5 px-2 text-xs sm:text-sm font-black transition-all relative flex items-center gap-2 cursor-pointer ${
              activeTab === 'terms'
                ? 'text-[#F4510B] border-b-2 border-[#F4510B]'
                : 'text-[#172B50] hover:text-[#F4510B] border-b-2 border-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms &amp; Conditions</span>
            {hasScrolledTerms && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Read to bottom" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dosDonts')}
            className={`pb-2.5 px-2 text-xs sm:text-sm font-black transition-all relative flex items-center gap-2 cursor-pointer ${
              activeTab === 'dosDonts'
                ? 'text-[#F4510B] border-b-2 border-[#F4510B]'
                : 'text-[#172B50] hover:text-[#F4510B] border-b-2 border-transparent'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Parent Do’s &amp; Don’ts</span>
            {hasScrolledDosDonts && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Read to bottom" />
            )}
          </button>
        </div>

        {/* ======================================================== */}
        {/* 3. Document Header Bar & Scrollable Content Area        */}
        {/* ======================================================== */}
        <div className="mt-3.5 space-y-2">
          {/* Document Meta Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#172B50]">
                {activeTab === 'terms'
                  ? activeTermsDoc.title
                  : activeDosDontsDoc.title}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B25]">
                Version {activeTab === 'terms' ? activeTermsDoc.version : activeDosDontsDoc.version}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#172B50]/60 font-semibold">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#F4510B]" />
                <span>Last Updated: {activeTab === 'terms' ? activeTermsDoc.lastUpdated : activeDosDontsDoc.lastUpdated}</span>
              </span>

              {/* Scroll Status Pill */}
              {activeTab === 'terms' ? (
                hasScrolledTerms ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Check className="w-3 h-3" />
                    <span>Scrolled to bottom</span>
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <ChevronDown className="w-3 h-3 animate-bounce" />
                    <span>Scroll to bottom</span>
                  </span>
                )
              ) : hasScrolledDosDonts ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3" />
                  <span>Scrolled to bottom</span>
                </span>
              ) : (
                <span className="text-amber-700 font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <ChevronDown className="w-3 h-3 animate-bounce" />
                  <span>Scroll to bottom</span>
                </span>
              )}
            </div>
          </div>

          {/* Scrollable Document Container */}
          <div className="bg-[#F8FAFC]/80 border border-[#172B5014] rounded-2xl p-4 sm:p-5 h-[270px] sm:h-[300px] md:h-[330px] shadow-inner relative overflow-hidden">
            {/* Terms and Conditions Document */}
            <div
              ref={termsScrollRef}
              onScroll={handleTermsScroll}
              className={`h-full overflow-y-auto space-y-4 pr-2 text-xs sm:text-[13px] leading-relaxed ${
                activeTab === 'terms' ? 'block' : 'hidden'
              }`}
            >
              {(activeTermsDoc.sections || []).map((sec) => (
                <div key={sec.number} className="space-y-1.5 pb-2 border-b border-[#172B500C] last:border-b-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[#FFF4E8] text-[#F4510B] font-black text-xs flex items-center justify-center border border-[#F4510B25] shrink-0">
                      {sec.number}
                    </div>
                    <h4 className="font-black text-[#172B50] text-sm tracking-tight">
                      {sec.title}
                    </h4>
                  </div>

                  <ul className="space-y-1.5 pl-8 list-disc marker:text-[#F4510B]">
                    {(sec.points || []).map((pt, i) => (
                      <li key={i} className="text-[#172B50]/80">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Parent Do's & Don'ts Document */}
            <div
              ref={dosDontsScrollRef}
              onScroll={handleDosDontsScroll}
              className={`h-full overflow-y-auto space-y-5 pr-2 text-xs sm:text-[13px] leading-relaxed ${
                activeTab === 'dosDonts' ? 'block' : 'hidden'
              }`}
            >
              {/* Parent Do's */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-1 border-b border-emerald-200">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                    ✓
                  </div>
                  <h4 className="font-black text-emerald-900 text-sm tracking-tight">
                    Parent Do’s
                  </h4>
                </div>

                <ol className="space-y-1.5 pl-7 list-decimal marker:font-bold marker:text-emerald-700">
                  {(activeDosDontsDoc.dos || []).map((item, i) => (
                    <li key={i} className="text-[#172B50]/80">
                      {item}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Parent Don'ts */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-1 border-b border-rose-200">
                  <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 font-black text-xs flex items-center justify-center">
                    ✕
                  </div>
                  <h4 className="font-black text-rose-900 text-sm tracking-tight">
                    Parent Don’ts
                  </h4>
                </div>

                <ol className="space-y-1.5 pl-7 list-decimal marker:font-bold marker:text-rose-700">
                  {(activeDosDontsDoc.donts || []).map((item, i) => (
                    <li key={i} className="text-[#172B50]/80">
                      {item}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Parent Acknowledgement Note */}
              <div className="p-3.5 rounded-xl bg-[#FFF4E8] border border-[#F4510B20] text-xs text-[#172B50]">
                <span className="font-black text-[#F4510B] block mb-1">
                  Parent Acknowledgement
                </span>
                <p className="text-[#172B50]/85">
                  {activeDosDontsDoc.acknowledgement}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. Mandatory Acknowledgement Checkboxes Section         */}
        {/* ======================================================== */}
        <div className="mt-3.5 bg-[#FFF9F5] border border-[#F4510B20] rounded-2xl p-3.5 sm:p-4 space-y-2 text-xs">
          {/* Checkbox 1: Terms & Conditions */}
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="termsCheckbox"
              disabled={!hasScrolledTerms}
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#172B5030] text-[#F4510B] focus:ring-[#F4510B] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            />
            <label
              htmlFor="termsCheckbox"
              className={`font-semibold cursor-pointer select-none leading-snug ${
                hasScrolledTerms ? 'text-[#172B50]' : 'text-[#172B50]/50'
              }`}
            >
              I have read and agree to the{' '}
              <strong className="text-[#F4510B] font-black">Terms &amp; Conditions</strong>.
              {!hasScrolledTerms && (
                <span className="text-[11px] text-[#F4510B] font-bold ml-1.5 inline-block">
                  (Please scroll to the bottom of Terms &amp; Conditions to enable)
                </span>
              )}
            </label>
          </div>

          {/* Checkbox 2: Parent Do's & Don'ts */}
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="dosDontsCheckbox"
              disabled={!hasScrolledDosDonts}
              checked={dosDontsAgreed}
              onChange={(e) => setDosDontsAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#172B5030] text-[#F4510B] focus:ring-[#F4510B] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            />
            <label
              htmlFor="dosDontsCheckbox"
              className={`font-semibold cursor-pointer select-none leading-snug ${
                hasScrolledDosDonts ? 'text-[#172B50]' : 'text-[#172B50]/50'
              }`}
            >
              I have read and acknowledge the{' '}
              <strong className="text-[#F4510B] font-black">Parent Do’s &amp; Don’ts</strong>.
              {!hasScrolledDosDonts && (
                <span className="text-[11px] text-[#F4510B] font-bold ml-1.5 inline-block">
                  (Please scroll to the bottom of Parent Do’s &amp; Don’ts to enable)
                </span>
              )}
            </label>
          </div>
        </div>

        {/* Policy Review Disclaimer */}
        <div className="mt-2 text-[10.5px] text-[#172B50]/50 text-center">
          * Operational Review Draft (v1.0) • Subject to Academy Board Approval
        </div>

        {/* ======================================================== */}
        {/* 5. Footer Buttons: Cancel & Accept & Continue            */}
        {/* ======================================================== */}
        <div className="mt-4 pt-3 border-t border-[#172B5014] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#172B5020] bg-white text-xs sm:text-sm font-bold text-[#172B50] hover:bg-[#FFF5ED] hover:border-[#F4510B40] transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canContinue || isSubmitting}
            onClick={handleAcceptAndContinue}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
              canContinue && !isSubmitting
                ? 'bg-[#F4510B] text-white hover:brightness-110 active:scale-95 shadow-md shadow-[#F4510B]/30 cursor-pointer'
                : 'bg-[#F4510B]/40 text-white/80 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Acknowledgement...</span>
              </>
            ) : (
              <>
                <span>Accept &amp; Continue</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
