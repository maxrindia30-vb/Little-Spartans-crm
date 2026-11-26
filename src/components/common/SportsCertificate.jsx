import React from 'react';
import { Award, Shield, CheckCircle2, Star, Trophy, Sparkles } from 'lucide-react';

/**
 * Returns formatted certificate titles, subtitles and badges based on certificate title / type
 */
export function getCertificateTypeMeta(title = '', program = '') {
  const t = (title || '').toLowerCase();
  
  if (t.includes('participation')) {
    return {
      mainTitle: 'PARTICIPATION CERTIFICATE',
      subtitle: 'For Participation, Effort and Team Spirit',
      accentColor: '#F4510B',
      sealType: 'PARTICIPATION',
    };
  }
  if (t.includes('mastery') || t.includes('level 1') || t.includes('level 2')) {
    return {
      mainTitle: 'SKILL MASTERY CERTIFICATE',
      subtitle: 'For Demonstrating Technical Mastery and Dedicated Practice',
      accentColor: '#10B981',
      sealType: 'MASTERY',
    };
  }
  if (t.includes('completion')) {
    return {
      mainTitle: 'PROGRAMME COMPLETION CERTIFICATE',
      subtitle: 'For Successful Curriculum Completion and Athletic Development',
      accentColor: '#3B82F6',
      sealType: 'COMPLETION',
    };
  }
  if (t.includes('performance') || t.includes('outstanding')) {
    return {
      mainTitle: 'OUTSTANDING PERFORMANCE CERTIFICATE',
      subtitle: 'For Exceptional Performance, Sportsmanship and Leadership',
      accentColor: '#8B5CF6',
      sealType: 'EXCELLENCE',
    };
  }
  if (t.includes('spirit') || t.includes('team')) {
    return {
      mainTitle: 'TEAM SPIRIT CERTIFICATE',
      subtitle: 'For Inspiring Teamwork, Positivity and Peer Encouragement',
      accentColor: '#F59E0B',
      sealType: 'TEAM SPIRIT',
    };
  }
  if (t.includes('recognition') || t.includes('special')) {
    return {
      mainTitle: 'SPECIAL RECOGNITION CERTIFICATE',
      subtitle: 'In Special Recognition of Remarkable Progress and Tenacity',
      accentColor: '#EC4899',
      sealType: 'RECOGNITION',
    };
  }

  // Default: Sports Achievement Certificate
  return {
    mainTitle: 'SPORTS ACHIEVEMENT CERTIFICATE',
    subtitle: 'For Participation, Effort and Team Spirit',
    accentColor: '#F4510B',
    sealType: 'ACHIEVEMENT',
  };
}

/**
 * Hand-crafted SVG Sports Illustrations for the certificate
 */
export function CertificateSportsIllustrations() {
  return (
    <>
      {/* ========================================================= */}
      {/* TOP-LEFT: PLAYFUL BASKETBALL + ENERGY RAYS               */}
      {/* ========================================================= */}
      <g transform="translate(42, 42)">
        {/* Basketball Sphere */}
        <circle cx="36" cy="36" r="32" fill="#F97316" stroke="#172B50" strokeWidth="3" />
        {/* Basketball Seams */}
        <path d="M 4 36 Q 36 36 68 36" stroke="#172B50" strokeWidth="2.5" fill="none" />
        <path d="M 36 4 Q 36 36 36 68" stroke="#172B50" strokeWidth="2.5" fill="none" />
        <path d="M 12 12 Q 36 30 60 12" stroke="#172B50" strokeWidth="2.2" fill="none" />
        <path d="M 12 60 Q 36 42 60 60" stroke="#172B50" strokeWidth="2.2" fill="none" />
        {/* Ball Highlight */}
        <ellipse cx="26" cy="22" rx="7" ry="4" fill="#FED7AA" opacity="0.6" transform="rotate(-30 26 22)" />
        {/* Motion swoosh lines */}
        <path d="M -8 18 Q -16 28 -8 44" stroke="#F4510B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M -16 24 Q -22 32 -16 40" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Small stars */}
        <polygon points="56,0 58,6 64,8 58,10 56,16 54,10 48,8 54,6" fill="#F59E0B" />
        <polygon points="10,-6 12,-1 17,1 12,3 10,8 8,3 3,1 8,-1" fill="#F4510B" />
      </g>

      {/* ========================================================= */}
      {/* TOP-RIGHT: FOOTBALL (SOCCER BALL) + STAR BURSTS          */}
      {/* ========================================================= */}
      <g transform="translate(862, 42)">
        {/* Football Base Sphere */}
        <circle cx="36" cy="36" r="32" fill="#FFFFFF" stroke="#172B50" strokeWidth="3" />
        {/* Center Pentagon */}
        <polygon points="36,22 47,30 43,43 29,43 25,30" fill="#172B50" />
        {/* Seams connecting to outer edge */}
        <line x1="36" y1="22" x2="36" y2="5" stroke="#172B50" strokeWidth="2.5" />
        <line x1="47" y1="30" x2="65" y2="24" stroke="#172B50" strokeWidth="2.5" />
        <line x1="43" y1="43" x2="57" y2="59" stroke="#172B50" strokeWidth="2.5" />
        <line x1="29" y1="43" x2="15" y2="59" stroke="#172B50" strokeWidth="2.5" />
        <line x1="25" y1="30" x2="7" y2="24" stroke="#172B50" strokeWidth="2.5" />
        {/* Partial border patches */}
        <polygon points="30,4 42,4 40,9 32,9" fill="#172B50" />
        <polygon points="63,22 68,26 64,34 59,28" fill="#172B50" />
        <polygon points="56,60 62,56 65,63 59,66" fill="#172B50" />
        <polygon points="16,60 10,56 7,63 13,66" fill="#172B50" />
        <polygon points="9,22 4,26 8,34 13,28" fill="#172B50" />
        {/* Motion swoosh lines */}
        <path d="M 80 18 Q 88 28 80 44" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 88 24 Q 94 32 88 40" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Small stars */}
        <polygon points="16,-6 18,-1 23,1 18,3 16,8 14,3 9,1 14,-1" fill="#F4510B" />
        <polygon points="64,2 66,7 71,9 66,11 64,16 62,11 57,9 62,7" fill="#F59E0B" />
      </g>

      {/* ========================================================= */}
      {/* BOTTOM-LEFT: SPORTS AGILITY CONES & RUNNER STARS         */}
      {/* ========================================================= */}
      <g transform="translate(42, 508)">
        {/* Agility Training Cone 1 */}
        <polygon points="26,62 10,62 14,30 22,30" fill="#F4510B" stroke="#172B50" strokeWidth="2" />
        <ellipse cx="18" cy="62" rx="14" ry="4" fill="#EA580C" stroke="#172B50" strokeWidth="2" />
        <ellipse cx="18" cy="46" rx="6" ry="2" fill="#FFFFFF" opacity="0.9" />
        {/* Agility Training Cone 2 (Slightly behind, yellow/lime) */}
        <polygon points="52,62 38,62 42,36 48,36" fill="#F59E0B" stroke="#172B50" strokeWidth="2" />
        <ellipse cx="45" cy="62" rx="12" ry="3.5" fill="#D97706" stroke="#172B50" strokeWidth="2" />
        <ellipse cx="45" cy="49" rx="5" ry="1.8" fill="#FFFFFF" opacity="0.9" />
        {/* Little Whistle */}
        <g transform="translate(36, 12) rotate(-15)">
          <ellipse cx="16" cy="14" rx="10" ry="7" fill="#94A3B8" stroke="#172B50" strokeWidth="2" />
          <rect x="2" y="10" width="8" height="6" rx="2" fill="#64748B" stroke="#172B50" strokeWidth="1.5" />
          <circle cx="18" cy="14" r="3" fill="#172B50" />
        </g>
        {/* Decorative sparkles */}
        <polygon points="12,14 14,18 19,20 14,22 12,26 10,22 5,20 10,18" fill="#10B981" />
        <polygon points="68,40 70,44 75,46 70,48 68,52 66,48 61,46 66,44" fill="#F4510B" />
      </g>

      {/* ========================================================= */}
      {/* BOTTOM-RIGHT: GOLDEN TROPHY & LAUREL LEAVES               */}
      {/* ========================================================= */}
      <g transform="translate(862, 508)">
        {/* Trophy Base */}
        <rect x="20" y="56" width="32" height="8" rx="2" fill="#172B50" />
        <rect x="26" y="48" width="20" height="8" fill="#D97706" stroke="#172B50" strokeWidth="2" />
        {/* Trophy Stem */}
        <rect x="32" y="38" width="8" height="10" fill="#F59E0B" stroke="#172B50" strokeWidth="2" />
        {/* Trophy Cup Body */}
        <path d="M 22 14 C 22 34, 50 34, 50 14 Z" fill="#FBBF24" stroke="#172B50" strokeWidth="2.5" />
        {/* Trophy Handles */}
        <path d="M 22 18 C 14 18, 14 28, 22 28" fill="none" stroke="#172B50" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 50 18 C 58 18, 58 28, 50 28" fill="none" stroke="#172B50" strokeWidth="2.5" strokeLinecap="round" />
        {/* Trophy Star */}
        <polygon points="36,19 38,24 43,24 39,27 41,32 36,29 32,32 34,27 30,24 35,24" fill="#F4510B" />
        {/* Laurel Leaves around Trophy */}
        <path d="M 12 44 Q 8 28 16 12" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 60 44 Q 64 28 56 12" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <ellipse cx="10" cy="30" rx="3" ry="1.5" fill="#10B981" transform="rotate(-30 10 30)" />
        <ellipse cx="12" cy="20" rx="3" ry="1.5" fill="#10B981" transform="rotate(-45 12 20)" />
        <ellipse cx="62" cy="30" rx="3" ry="1.5" fill="#10B981" transform="rotate(30 62 30)" />
        <ellipse cx="60" cy="20" rx="3" ry="1.5" fill="#10B981" transform="rotate(45 60 20)" />
      </g>
    </>
  );
}

/**
 * Official Academy Verification Seal (SVG)
 */
export function AcademyVerificationSeal({ label = 'AUTHENTIC ACHIEVEMENT' }) {
  return (
    <div className="relative w-24 h-24 sm:w-26 sm:h-26 flex items-center justify-center select-none shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <path id="sealTextPath" d="M 50 14 A 36 36 0 1 1 49.9 14" fill="none" />
          <linearGradient id="sealGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="sealNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#172B50" />
          </linearGradient>
        </defs>

        {/* Scalloped outer seal edge (32 points) */}
        <circle cx="50" cy="50" r="46" fill="url(#sealGoldGrad)" stroke="#172B50" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 2" />

        {/* Inner Navy Core */}
        <circle cx="50" cy="50" r="34" fill="url(#sealNavyGrad)" stroke="#F59E0B" strokeWidth="2" />

        {/* Circular Text */}
        <text className="text-[6.5px] font-black uppercase tracking-widest fill-amber-200">
          <textPath href="#sealTextPath" startOffset="50%" textAnchor="middle">
            LITTLE SPARTANS ACADEMY &bull; VERIFIED
          </textPath>
        </text>

        {/* Center Star and Checkmark */}
        <polygon points="50,34 53,42 61,42 55,47 57,55 50,50 43,55 45,47 39,42 47,42" fill="#FBBF24" />
        <circle cx="50" cy="58" r="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="1" />
        <path d="M 47.5 58 L 49.5 60 L 52.5 56" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  );
}

/**
 * Landscape Sports Certificate Component
 * Rendered at exact 16:10 aspect ratio (1000px × 625px viewBox)
 */
export default function SportsCertificate({
  cert,
  child,
  coach,
  innerRef = null,
}) {
  const childName = child?.name || cert?.studentName || 'Aarav K';
  const programName = cert?.program || child?.program || 'Foundational Movement';
  const issueDate = cert?.issueDate || 'Nov 16, 2026';
  const certNumber = cert?.certNumber || cert?.id || 'LS-CERT-2026-089';
  const coachName = cert?.coachName || coach?.name || child?.coachName || 'Coach Karthik';
  const coachTitle = coach?.title || 'Primary Coach & Trainer';
  const location = cert?.location || child?.location || child?.center || 'KK Nagar';
  const certTypeMeta = getCertificateTypeMeta(cert?.title, programName);

  return (
    <div
      ref={innerRef}
      className="w-full max-w-[1000px] aspect-[16/10] bg-[#FFFDF8] rounded-3xl relative overflow-hidden shadow-2xl border-4 border-[#172B50] select-none text-slate-800 flex flex-col justify-between"
      style={{
        boxShadow: '0 25px 50px -12px rgba(23, 43, 80, 0.25), 0 0 0 1px rgba(23, 43, 80, 0.1)',
      }}
    >
      {/* ========================================================================= */}
      {/* 1. DECORATIVE SVG FRAMEWORK (SPORTS BORDERS, STARS, CORNER ILLUSTRATIONS) */}
      {/* ========================================================================= */}
      <svg
        viewBox="0 0 1000 625"
        className="w-full h-full absolute inset-0 pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="certBgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF4E8" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFF8F0" stopOpacity="0.8" />
          </linearGradient>

          {/* Ribbon Orange Gradient */}
          <linearGradient id="ribbonOrange" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F4510B" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          {/* Soft Watermark Shield */}
          <pattern id="spartanWatermark" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path
              d="M 50 15 L 75 25 L 75 55 C 75 72, 50 85, 50 85 C 50 85, 25 72, 25 55 L 25 25 Z"
              fill="none"
              stroke="#F4510B"
              strokeWidth="1"
              strokeOpacity="0.04"
            />
          </pattern>
        </defs>

        {/* Soft Warm Certificate Background */}
        <rect x="0" y="0" width="1000" height="625" fill="url(#certBgGlow)" />
        <rect x="0" y="0" width="1000" height="625" fill="url(#spartanWatermark)" />

        {/* OUTER DECORATIVE BORDER (Navy Blue with Rounded Corners) */}
        <rect
          x="16"
          y="16"
          width="968"
          height="593"
          rx="20"
          fill="none"
          stroke="#172B50"
          strokeWidth="6"
        />

        {/* SECONDARY INNER ACCENT BORDER (Spartan Orange) */}
        <rect
          x="26"
          y="26"
          width="948"
          height="573"
          rx="14"
          fill="none"
          stroke="#F4510B"
          strokeWidth="2.5"
        />

        {/* DOTTED SPORTS-STYLE INNER TRACK BORDER */}
        <rect
          x="34"
          y="34"
          width="932"
          height="557"
          rx="10"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeDasharray="6 6"
        />

        {/* Hand-drawn Sports-Style Corner Anchors */}
        <g stroke="#172B50" strokeWidth="3" fill="none">
          {/* Top-Left Corner Anchor */}
          <path d="M 38 60 L 60 38" />
          <circle cx="50" cy="50" r="4" fill="#F4510B" />
          {/* Top-Right Corner Anchor */}
          <path d="M 962 60 L 940 38" />
          <circle cx="950" cy="50" r="4" fill="#F4510B" />
          {/* Bottom-Left Corner Anchor */}
          <path d="M 38 565 L 60 587" />
          <circle cx="50" cy="575" r="4" fill="#F4510B" />
          {/* Bottom-Right Corner Anchor */}
          <path d="M 962 565 L 940 587" />
          <circle cx="950" cy="575" r="4" fill="#F4510B" />
        </g>

        {/* Playful Floating Sports Stars & Confetti in Margins */}
        <g opacity="0.8">
          <polygon points="170,44 172,48 177,50 172,52 170,56 168,52 163,50 168,48" fill="#F59E0B" />
          <polygon points="830,44 832,48 837,50 832,52 830,56 828,52 823,50 828,48" fill="#F59E0B" />
          <polygon points="140,580 142,584 147,586 142,588 140,592 138,588 133,586 138,584" fill="#10B981" />
          <polygon points="860,580 862,584 867,586 862,588 860,592 858,588 853,586 858,584" fill="#3B82F6" />
          <circle cx="210" cy="38" r="3" fill="#F4510B" />
          <circle cx="790" cy="38" r="3" fill="#10B981" />
          <circle cx="160" cy="550" r="3" fill="#F59E0B" />
          <circle cx="840" cy="550" r="3" fill="#EA580C" />
        </g>

        {/* Corner Sports Illustrations: Basketball, Football, Cones, Trophy */}
        <CertificateSportsIllustrations />
      </svg>

      {/* ========================================================================= */}
      {/* 2. CERTIFICATE CONTENT LAYER                                              */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full h-full p-8 sm:p-10 flex flex-col justify-between text-center">
        
        {/* TOP HEADER SECTION */}
        <div className="pt-2 sm:pt-4">
          {/* Academy Brand Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#172B50] text-white shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F4510B] animate-pulse" />
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest">
              LITTLE SPARTANS SPORTS ACADEMY
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#F4510B] animate-pulse" />
          </div>

          {/* Main Certificate Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#172B50] tracking-tight mt-2.5 uppercase leading-none drop-shadow-2xs">
            {certTypeMeta.mainTitle}
          </h1>

          {/* Subtitle / Motto */}
          <p className="text-xs sm:text-sm font-bold text-[#F4510B] italic tracking-wide mt-1.5">
            "{certTypeMeta.subtitle}"
          </p>
        </div>

        {/* CENTER AWARD PRESENTATION SECTION */}
        <div className="my-auto py-2 sm:py-3 space-y-2">
          {/* Presentation Line */}
          <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-widest">
            This certificate is proudly presented to
          </p>

          {/* Athlete Child Full Name */}
          <div className="relative inline-block my-1">
            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-[#172B50] tracking-tight leading-tight px-6 sm:px-12 py-1">
              {childName}
            </h2>
            {/* Elegant Spartan Orange underline flourish with stars */}
            <div className="flex items-center justify-center gap-2 -mt-1">
              <span className="h-[2px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#F4510B]" />
              <Star className="w-4 h-4 fill-[#F4510B] text-[#F4510B]" />
              <span className="h-[2.5px] w-24 sm:w-36 bg-[#F4510B] rounded-full" />
              <Star className="w-4 h-4 fill-[#F4510B] text-[#F4510B]" />
              <span className="h-[2px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#F4510B]" />
            </div>
          </div>

          {/* Programme & Achievement Title */}
          <div className="max-w-xl mx-auto">
            <h3 className="text-base sm:text-lg font-black text-[#172B50]">
              {cert?.title || `${programName} Excellence Award`}
            </h3>
            {/* Short achievement description */}
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1 leading-relaxed max-w-lg mx-auto">
              {cert?.description ||
                `In recognition of outstanding dedication, positive energy, teamwork, and high proficiency in the ${programName} curriculum at Little Spartans.`}
            </p>
          </div>
        </div>

        {/* BOTTOM METADATA & SIGNATURES SECTION */}
        <div className="grid grid-cols-3 items-end gap-4 pb-2 sm:pb-3 pt-2 border-t border-slate-200/60 max-w-3xl mx-auto w-full text-xs">
          
          {/* Left: Coach / Teacher Signature */}
          <div className="text-center sm:text-left flex flex-col items-center sm:items-start pl-2">
            {/* Stylized Script Signature */}
            <div className="font-serif italic text-base sm:text-lg text-[#172B50] font-black tracking-wider -mb-0.5 select-none">
              {coachName}
            </div>
            <div className="w-36 sm:w-44 border-b-2 border-slate-400 mt-1" />
            <span className="font-black text-[#172B50] text-[11px] sm:text-xs mt-1 block">
              {coachName}
            </span>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              {coachTitle}
            </span>
          </div>

          {/* Center: Official Verified Academy Seal & Certificate ID */}
          <div className="flex flex-col items-center justify-center -mb-2">
            <AcademyVerificationSeal label={certTypeMeta.sealType} />
            <div className="mt-1 px-3 py-0.5 rounded-full bg-slate-100 text-[9.5px] sm:text-[10px] font-mono font-black text-slate-600 tracking-wider">
              ID: {certNumber}
            </div>
          </div>

          {/* Right: Technical Director Signature & Location/Date */}
          <div className="text-center sm:text-right flex flex-col items-center sm:items-end pr-2">
            {/* Stylized Authorized Stamp / Signature */}
            <div className="font-serif italic text-base sm:text-lg text-[#172B50] font-black tracking-wider -mb-0.5 select-none">
              Alex Sterling
            </div>
            <div className="w-36 sm:w-44 border-b-2 border-slate-400 mt-1" />
            <span className="font-black text-[#172B50] text-[11px] sm:text-xs mt-1 block">
              {cert?.issuedBy || 'Academy Technical Director'}
            </span>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              {location} &bull; {issueDate}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
