import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight, X } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { getDailyMotivationalQuote } from '../../data/dailyMotivationalQuotes';

/**
 * Premium Daily Sports Motivational Welcome Modal
 * Displays immediately after successful login across Admin, Super Coach, Coach & Parent portals.
 * Conforms strictly to MAXR CRM 4-colour palette:
 * - Deep Black: #080B0C
 * - Mint Teal: #55CDB3
 * - Soft White: #F4F7F6
 * - Deep Plum: #493548
 * STRICTLY NO branding, Spartan helmets, or wordmarks.
 * Displays only once per user per calendar day.
 */
export default function DailyMotivationalModal({ forceOpen = false, onCloseCallback = null }) {
  const { currentUser, currentPortal, isLoggedIn, showMotivationalModal, setShowMotivationalModal } = useCrm();
  const [isOpen, setIsOpen] = useState(false);
  const [dailyData, setDailyData] = useState(null);

  // Compute daily quote and check display rule
  useEffect(() => {
    if (!isLoggedIn && !forceOpen) {
      setIsOpen(false);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const userIdentifier = currentUser?.email || currentUser?.name || currentPortal || 'guest';
    const storageKey = `maxr_motivational_viewed_${todayStr}_${userIdentifier}`;

    const quoteInfo = getDailyMotivationalQuote();
    setDailyData(quoteInfo);

    if (forceOpen || showMotivationalModal) {
      setIsOpen(true);
      return;
    }

    try {
      const alreadyViewedToday = localStorage.getItem(storageKey);
      if (!alreadyViewedToday) {
        setIsOpen(true);
      }
    } catch (e) {
      setIsOpen(true);
    }

    // Support manual trigger from profile menu or navigation
    const handleManualOpen = () => {
      const freshQuote = getDailyMotivationalQuote();
      setDailyData(freshQuote);
      setIsOpen(true);
      if (setShowMotivationalModal) setShowMotivationalModal(true);
    };
    window.addEventListener('maxr:open-daily-motivational', handleManualOpen);
    return () => {
      window.removeEventListener('maxr:open-daily-motivational', handleManualOpen);
    };
  }, [isLoggedIn, showMotivationalModal, currentUser, currentPortal, forceOpen]);

  const handleClose = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const userIdentifier = currentUser?.email || currentUser?.name || currentPortal || 'guest';
    const storageKey = `maxr_motivational_viewed_${todayStr}_${userIdentifier}`;

    try {
      localStorage.setItem(storageKey, 'true');
    } catch (e) {
      console.warn('Could not save motivational view state', e);
    }

    if (setShowMotivationalModal) {
      setShowMotivationalModal(false);
    }
    setIsOpen(false);
    if (onCloseCallback) {
      onCloseCallback();
    }
  };

  if (!isOpen || !dailyData) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      {/* Blurred Dark Backdrop Overlay */}
      <div 
        onClick={handleClose}
        className="fixed inset-0 bg-[#080B0C]/75 backdrop-blur-md transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* Main Centered Premium White Modal Card */}
      <div 
        className="relative w-full max-w-[820px] bg-[#F4F7F6] rounded-[32px] sm:rounded-[38px] border border-[#493548]/15 shadow-[0_25px_70px_rgba(8,11,12,0.45)] overflow-hidden z-10 flex flex-col md:flex-row items-stretch animate-in zoom-in-95 duration-300"
      >
        {/* Top-Right Circular Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-[#080B0C]/5 hover:bg-[#080B0C]/10 text-[#080B0C] flex items-center justify-center transition-all cursor-pointer z-30 group"
          aria-label="Close daily greeting"
        >
          <X className="w-4 h-4 text-[#080B0C] group-hover:scale-110 transition-transform" />
        </button>

        {/* ============================================================ */}
        {/* LEFT SIDE: Grayscale Sports Player with Football & Turf FX    */}
        {/* ============================================================ */}
        <div className="w-full md:w-[44%] bg-gradient-to-br from-[#F4F7F6] via-[#EAEFEA] to-[#DDECE8] relative overflow-hidden flex items-end justify-center min-h-[220px] md:min-h-[380px] p-4">
          
          {/* Mint Teal Diagonal Speed Accents & Geometric Strips */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Broad Diagonal Accent Band */}
            <div 
              className="absolute -top-16 -left-20 w-80 h-96 bg-gradient-to-tr from-[#55CDB3]/35 via-[#55CDB3]/15 to-transparent transform -rotate-35 rounded-3xl blur-xs"
            />
            {/* Secondary Parallel Accent Stripe */}
            <div 
              className="absolute top-10 -left-12 w-12 h-96 bg-[#55CDB3]/20 transform -rotate-35"
            />
            {/* Ground Turf Ambient Glow */}
            <div 
              className="absolute -bottom-8 left-0 right-0 h-28 bg-gradient-to-t from-[#55CDB3]/30 via-[#55CDB3]/10 to-transparent blur-md"
            />
          </div>

          {/* Grayscale Athlete & Soccer Ball Vector Artwork */}
          <div className="relative z-10 w-full max-w-[280px] flex flex-col items-center justify-end">
            <svg 
              viewBox="0 0 320 340" 
              className="w-full h-auto drop-shadow-[0_12px_24px_rgba(8,11,12,0.25)]"
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Diagonal stripes pattern for movement */}
                <linearGradient id="mintStreak" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#55CDB3" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#55CDB3" stopOpacity="0" />
                </linearGradient>

                {/* Grayscale player body gradient */}
                <linearGradient id="playerShade" x1="20%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0%" stopColor="#2A3138" />
                  <stop offset="50%" stopColor="#14191E" />
                  <stop offset="100%" stopColor="#080B0C" />
                </linearGradient>

                {/* Subtle highlight gradient */}
                <linearGradient id="bodyHighlight" x1="0%" y1="0%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#5C6670" />
                  <stop offset="100%" stopColor="#1F252B" />
                </linearGradient>

                {/* Ball pattern */}
                <radialGradient id="ballShade" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="65%" stopColor="#D5DCDB" />
                  <stop offset="100%" stopColor="#879594" />
                </radialGradient>
              </defs>

              {/* Dynamic Speed Lines */}
              <line x1="30" y1="280" x2="170" y2="90" stroke="#55CDB3" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
              <line x1="60" y1="310" x2="200" y2="120" stroke="#55CDB3" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
              <line x1="15" y1="250" x2="120" y2="100" stroke="#55CDB3" strokeWidth="2" strokeLinecap="round" opacity="0.25" />

              {/* Turf Splash / Ground Spray Particles */}
              <ellipse cx="230" cy="305" rx="45" ry="10" fill="#080B0C" opacity="0.18" />
              <ellipse cx="140" cy="318" rx="28" ry="7" fill="#080B0C" opacity="0.22" />
              
              {/* Splashing turf droplets */}
              <circle cx="210" cy="285" r="3" fill="#55CDB3" opacity="0.8" />
              <circle cx="195" cy="292" r="2" fill="#080B0C" opacity="0.6" />
              <circle cx="245" cy="290" r="2.5" fill="#55CDB3" opacity="0.7" />
              <circle cx="260" cy="280" r="1.8" fill="#080B0C" opacity="0.5" />
              <circle cx="180" cy="300" r="3" fill="#080B0C" opacity="0.7" />
              <circle cx="225" cy="275" r="2" fill="#55CDB3" opacity="0.9" />

              {/* ATHLETE: Dynamic Kicking Posture (Grayscale) */}
              <g id="athlete">
                {/* Left/Supporting Leg in motion */}
                <path d="M125 190 L115 250 L102 285 L125 292 L138 255 Z" fill="url(#playerShade)" />
                {/* Left Cleat */}
                <path d="M96 280 L130 294 L132 302 L90 290 Z" fill="#080B0C" />

                {/* Right/Kicking Leg striking forward */}
                <path d="M148 185 L180 225 L218 258 L230 248 L192 212 L160 178 Z" fill="url(#bodyHighlight)" />
                {/* Right Cleat striking ball */}
                <path d="M214 250 L238 266 L244 260 L224 242 Z" fill="#080B0C" />
                <path d="M218 255 L232 264" stroke="#55CDB3" strokeWidth="2" strokeLinecap="round" />

                {/* Athletic Shorts (#10) */}
                <path d="M118 150 L168 150 L176 195 L144 195 L138 185 L120 195 Z" fill="url(#playerShade)" />
                {/* Number 10 on shorts */}
                <text x="146" y="180" fill="#F4F7F6" fontSize="13" fontWeight="900" fontFamily="sans-serif" fontStyle="italic" opacity="0.9">
                  10
                </text>

                {/* Torso & Athletic Jersey leaning into kick */}
                <path d="M120 85 L165 80 L172 152 L116 150 Z" fill="url(#playerShade)" />
                
                {/* Jersey folds & contour */}
                <path d="M130 85 Q145 115 138 148" stroke="#493548" strokeWidth="1.5" opacity="0.4" fill="none" />
                <path d="M152 82 Q160 110 156 148" stroke="#5C6670" strokeWidth="1.5" opacity="0.5" fill="none" />

                {/* Left Arm extended for balance */}
                <path d="M118 90 L85 110 L68 122 L76 130 L95 118 L122 102 Z" fill="url(#bodyHighlight)" />
                {/* Left Hand */}
                <circle cx="68" cy="125" r="5" fill="#75828D" />

                {/* Right Arm swinging forward */}
                <path d="M162 86 L188 108 L202 125 L196 132 L178 114 L158 96 Z" fill="url(#bodyHighlight)" />
                {/* Right Hand */}
                <circle cx="202" cy="128" r="5" fill="#75828D" />

                {/* Neck & Head in focused athletic gaze */}
                <path d="M136 70 L148 70 L148 84 L136 84 Z" fill="#5C6670" />
                <circle cx="145" cy="56" r="18" fill="url(#bodyHighlight)" />
                {/* Athletic Hair styling */}
                <path d="M130 52 Q144 34 162 48 Q155 42 142 42 Q132 46 130 52 Z" fill="#080B0C" />
                {/* Face profile facing ball */}
                <path d="M154 50 L163 58 L155 64 Z" fill="#5C6670" />
              </g>

              {/* SOCCER BALL: High detail with classic pentagon panels */}
              <g id="soccerBall" transform="translate(210, 248)">
                {/* Ball sphere */}
                <circle cx="24" cy="24" r="22" fill="url(#ballShade)" stroke="#080B0C" strokeWidth="1.5" />
                
                {/* Center Pentagon */}
                <polygon points="24,14 31,19 28,28 20,28 17,19" fill="#080B0C" />
                
                {/* Outer Connecting Pentagon Panels */}
                <polygon points="24,14 24,6 33,8 31,19" fill="#080B0C" opacity="0.85" />
                <polygon points="31,19 41,20 39,29 28,28" fill="#080B0C" opacity="0.85" />
                <polygon points="28,28 32,38 23,41 20,28" fill="#080B0C" opacity="0.85" />
                <polygon points="20,28 13,36 7,29 17,19" fill="#080B0C" opacity="0.85" />
                <polygon points="17,19 8,16 11,8 24,6" fill="#080B0C" opacity="0.85" />

                {/* Seam Lines */}
                <circle cx="24" cy="24" r="22" fill="none" stroke="#080B0C" strokeWidth="1.2" />
                {/* Ball Specular Highlight */}
                <ellipse cx="18" cy="14" rx="6" ry="3" fill="#FFFFFF" opacity="0.6" transform="rotate(-25 18 14)" />
              </g>
            </svg>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT SIDE: Greeting Pill, Quote & Action Button             */}
        {/* ============================================================ */}
        <div className="w-full md:w-[56%] p-6 sm:p-9 md:py-10 flex flex-col justify-center items-center md:items-start text-center md:text-left relative z-10">
          
          {/* Greeting Pill with Calendar Icon */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border-2 border-[#55CDB3] bg-[#55CDB3]/10 shadow-xs mb-5 sm:mb-6">
            <Calendar className="w-4.5 h-4.5 text-[#55CDB3] shrink-0" />
            <span className="text-base sm:text-lg font-black tracking-tight text-[#080B0C]">
              Happy <span className="text-[#55CDB3] italic">{dailyData.dayName}!</span>
            </span>
          </div>

          {/* Motivational Quote with Mint Teal Quotation Marks */}
          <div className="relative my-2 sm:my-3 max-w-[420px]">
            <div className="flex items-start gap-1.5 sm:gap-2">
              <span 
                className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-[#55CDB3] leading-none shrink-0 select-none -mt-1 sm:-mt-2"
                aria-hidden="true"
              >
                “
              </span>
              <p className="text-base sm:text-lg md:text-[20px] font-bold italic text-[#080B0C] leading-snug tracking-tight">
                {dailyData.quote}
              </p>
              <span 
                className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-[#55CDB3] leading-none self-end select-none -mb-2 sm:-mb-3"
                aria-hidden="true"
              >
                ”
              </span>
            </div>

            {/* Subtle Mint Wave Underline Accent */}
            <div className="mt-3 sm:mt-4 flex justify-center md:justify-start">
              <svg 
                className="w-28 sm:w-36 h-2 text-[#55CDB3]" 
                viewBox="0 0 140 8" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M2 5.5C38 1.5 98 1.5 138 5.5" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                />
              </svg>
            </div>
          </div>

          {/* Action Button: Continue to Dashboard */}
          <div className="mt-6 sm:mt-8">
            <button
              type="button"
              onClick={handleClose}
              className="px-7 sm:px-8 py-3.5 rounded-full bg-[#080B0C] text-[#55CDB3] hover:bg-[#151D20] active:scale-95 font-bold text-sm tracking-wide shadow-lg shadow-[#080B0C]/25 inline-flex items-center gap-2.5 group transition-all duration-200 cursor-pointer"
            >
              <span>Continue to Dashboard</span>
              <ChevronRight className="w-4 h-4 text-[#55CDB3] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
