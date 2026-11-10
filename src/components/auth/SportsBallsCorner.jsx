import React from 'react';

/**
 * 4K Ultra-Sharp Vector Sports Balls
 * Pure SVG - Scales infinitely without pixelation or compression artifacts
 * Includes: Basketball, Soccer ball, Tennis ball, Cricket ball, and Badminton Shuttlecock
 */
export function SportsBallsCorner({ position = 'bottom-left', className = '' }) {
  const isBottomLeft = position === 'bottom-left';

  return (
    <div 
      className={`pointer-events-none select-none transition-all duration-300 ${className}`}
      aria-hidden="true"
    >
      <svg 
        viewBox="0 0 380 200" 
        className="w-full h-auto drop-shadow-[0_12px_24px_rgba(23,43,80,0.12)]"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: isBottomLeft ? 'none' : 'scaleX(-1)' }}
      >
        <defs>
          {/* ============================================================ */}
          {/* BASKETBALL GRADIENTS                                          */}
          {/* ============================================================ */}
          <radialGradient id="bball-grad" cx="35%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FF8542" />
            <stop offset="40%" stopColor="#F4510B" />
            <stop offset="80%" stopColor="#C93B00" />
            <stop offset="100%" stopColor="#752000" />
          </radialGradient>
          <radialGradient id="bball-sheen" cx="32%" cy="28%" r="40%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          {/* ============================================================ */}
          {/* SOCCER BALL GRADIENTS                                         */}
          {/* ============================================================ */}
          <radialGradient id="soccer-grad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F8FAFC" />
            <stop offset="80%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#94A3B8" />
          </radialGradient>
          <radialGradient id="soccer-sheen" cx="32%" cy="26%" r="40%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          {/* ============================================================ */}
          {/* TENNIS BALL GRADIENTS                                         */}
          {/* ============================================================ */}
          <radialGradient id="tennis-grad" cx="36%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#E9F542" />
            <stop offset="45%" stopColor="#C8D826" />
            <stop offset="80%" stopColor="#9FA81B" />
            <stop offset="100%" stopColor="#6C720E" />
          </radialGradient>

          {/* ============================================================ */}
          {/* CRICKET BALL GRADIENTS                                        */}
          {/* ============================================================ */}
          <radialGradient id="cricket-grad" cx="34%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="40%" stopColor="#DC2626" />
            <stop offset="78%" stopColor="#991B1B" />
            <stop offset="100%" stopColor="#450A0A" />
          </radialGradient>

          {/* ============================================================ */}
          {/* SHUTTLECOCK GRADIENTS                                         */}
          {/* ============================================================ */}
          <linearGradient id="shuttle-cork" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FED7AA" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="feather-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="65%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          {/* ============================================================ */}
          {/* CONTACT GROUND SHADOWS                                        */}
          {/* ============================================================ */}
          <radialGradient id="ground-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#172B50" stopOpacity="0.32" />
            <stop offset="50%" stopColor="#172B50" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#172B50" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ------------------------------------------------------------ */}
        {/* GROUND CONTACT SHADOWS                                       */}
        {/* ------------------------------------------------------------ */}
        <ellipse cx="70" cy="182" rx="65" ry="14" fill="url(#ground-shadow)" />
        <ellipse cx="185" cy="184" rx="60" ry="13" fill="url(#ground-shadow)" />
        <ellipse cx="275" cy="186" rx="42" ry="10" fill="url(#ground-shadow)" />
        <ellipse cx="330" cy="187" rx="36" ry="9" fill="url(#ground-shadow)" />
        <ellipse cx="230" cy="186" rx="30" ry="8" fill="url(#ground-shadow)" />

        {/* ============================================================ */}
        {/* 1. BASKETBALL (Left, prominent, Spartan Orange)              */}
        {/* ============================================================ */}
        <g id="basketball" transform="translate(15, 60)">
          {/* Ball Base Sphere */}
          <circle cx="58" cy="58" r="54" fill="url(#bball-grad)" stroke="#6B1D00" strokeWidth="1.2" />

          {/* Characteristic Black/Navy Curved Rib Lines */}
          <g stroke="#172B50" strokeWidth="3" strokeLinecap="round" opacity="0.92">
            {/* Horizontal central curve */}
            <path d="M 5 58 Q 58 48 111 58" fill="none" />
            {/* Vertical central curve */}
            <path d="M 58 5 Q 48 58 58 111" fill="none" />
            {/* Left curved channel */}
            <path d="M 24 16 C 42 36 42 80 24 100" fill="none" />
            {/* Right curved channel */}
            <path d="M 92 16 C 74 36 74 80 92 100" fill="none" />
          </g>

          {/* Pebble Texture Overlay (Subtle Depth) */}
          <circle cx="58" cy="58" r="54" fill="none" stroke="#FFA366" strokeWidth="1" opacity="0.25" strokeDasharray="1,3" />

          {/* 3D Light Highlight */}
          <ellipse cx="40" cy="36" rx="26" ry="16" transform="rotate(-30 40 36)" fill="url(#bball-sheen)" />
        </g>

        {/* ============================================================ */}
        {/* 2. SOCCER BALL (Classic Navy/White Hexagon Pattern)          */}
        {/* ============================================================ */}
        <g id="soccer-ball" transform="translate(130, 72)">
          {/* Ball Base Sphere */}
          <circle cx="54" cy="54" r="50" fill="url(#soccer-grad)" stroke="#CBD5E1" strokeWidth="1.2" />

          {/* Center Pentagon (Navy Blue) */}
          <polygon 
            points="54,34 69,45 63,63 45,63 39,45" 
            fill="#172B50" 
            stroke="#0F172A" 
            strokeWidth="1.5" 
            strokeLinejoin="round" 
          />

          {/* Radiating Seams from Center Pentagon */}
          <g stroke="#334155" strokeWidth="2.2" strokeLinecap="round">
            <line x1="54" y1="34" x2="54" y2="18" />
            <line x1="69" y1="45" x2="84" y2="40" />
            <line x1="63" y1="63" x2="76" y2="78" />
            <line x1="45" y1="63" x2="32" y2="78" />
            <line x1="39" y1="45" x2="24" y2="40" />
          </g>

          {/* Outer Partial Pentagons along the Sphere Rim */}
          {/* Top Pentagon */}
          <path 
            d="M 42 4 C 49 5 59 5 66 4 L 62 14 L 54 18 L 46 14 Z" 
            fill="#172B50" 
            stroke="#0F172A" 
            strokeWidth="1.5" 
          />
          {/* Top-Right Pentagon */}
          <path 
            d="M 97 28 L 84 40 L 87 53 L 101 49 C 100 41 99 34 97 28 Z" 
            fill="#172B50" 
            stroke="#0F172A" 
            strokeWidth="1.5" 
          />
          {/* Bottom-Right Pentagon */}
          <path 
            d="M 76 78 L 68 93 C 76 90 85 84 92 78 L 88 66 Z" 
            fill="#172B50" 
            stroke="#0F172A" 
            strokeWidth="1.5" 
          />
          {/* Bottom-Left Pentagon */}
          <path 
            d="M 32 78 L 40 93 C 32 90 23 84 16 78 L 20 66 Z" 
            fill="#172B50" 
            stroke="#0F172A" 
            strokeWidth="1.5" 
          />
          {/* Top-Left Pentagon */}
          <path 
            d="M 11 28 L 24 40 L 21 53 L 7 49 C 8 41 9 34 11 28 Z" 
            fill="#172B50" 
            stroke="#0F172A" 
            strokeWidth="1.5" 
          />

          {/* Hexagon Interconnecting Outer Seam Lines */}
          <g stroke="#475569" strokeWidth="2" strokeLinecap="round">
            <line x1="46" y1="14" x2="24" y2="40" />
            <line x1="62" y1="14" x2="84" y2="40" />
            <line x1="87" y1="53" x2="88" y2="66" />
            <line x1="21" y1="53" x2="20" y2="66" />
            <line x1="40" y1="93" x2="68" y2="93" />
          </g>

          {/* 3D Specular Sheen */}
          <ellipse cx="38" cy="32" rx="22" ry="14" transform="rotate(-30 38 32)" fill="url(#soccer-sheen)" />
        </g>

        {/* ============================================================ */}
        {/* 3. TENNIS BALL (Optic Yellow with White Seams)               */}
        {/* ============================================================ */}
        <g id="tennis-ball" transform="translate(242, 108)">
          {/* Sphere */}
          <circle cx="34" cy="34" r="32" fill="url(#tennis-grad)" stroke="#827717" strokeWidth="1" />
          
          {/* White Double-Curved Seam Lines */}
          <path 
            d="M 14 10 C 30 20 30 48 14 58" 
            stroke="#FFFFFF" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
            fill="none" 
            opacity="0.95" 
          />
          <path 
            d="M 54 10 C 38 20 38 48 54 58" 
            stroke="#FFFFFF" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
            fill="none" 
            opacity="0.95" 
          />

          {/* Specular Highlight */}
          <ellipse cx="25" cy="22" rx="14" ry="8" transform="rotate(-30 25 22)" fill="#FFFFFF" opacity="0.4" />
        </g>

        {/* ============================================================ */}
        {/* 4. CRICKET BALL (Deep Crimson with White Stitched Seam)      */}
        {/* ============================================================ */}
        <g id="cricket-ball" transform="translate(305, 118)">
          {/* Red Leather Sphere */}
          <circle cx="30" cy="30" r="28" fill="url(#cricket-grad)" stroke="#450A0A" strokeWidth="1" />
          
          {/* Raised White Stitched Seam */}
          <path 
            d="M 10 14 Q 30 30 50 46" 
            stroke="#FFFFFF" 
            strokeWidth="2.8" 
            strokeDasharray="3,1.8" 
            strokeLinecap="round" 
            fill="none" 
            opacity="0.95" 
          />
          <path 
            d="M 9 15 Q 29 31 49 47" 
            stroke="#7F1D1D" 
            strokeWidth="1" 
            fill="none" 
            opacity="0.7" 
          />

          {/* Leather Gloss Glint */}
          <ellipse cx="22" cy="18" rx="12" ry="6" transform="rotate(-35 22 18)" fill="#FFFFFF" opacity="0.5" />
        </g>

        {/* ============================================================ */}
        {/* 5. BADMINTON SHUTTLECOCK (Resting angled near balls)         */}
        {/* ============================================================ */}
        <g id="shuttlecock" transform="translate(202, 112) rotate(-16 30 40)">
          {/* Feather Skirt (Overlapping crisp vector feathers) */}
          <path d="M 18 10 L 26 48 L 34 48 L 42 10 Z" fill="url(#feather-grad)" stroke="#CBD5E1" strokeWidth="0.8" />
          <path d="M 12 12 L 26 48 L 18 10 Z" fill="url(#feather-grad)" stroke="#CBD5E1" strokeWidth="0.8" />
          <path d="M 48 12 L 34 48 L 42 10 Z" fill="url(#feather-grad)" stroke="#CBD5E1" strokeWidth="0.8" />
          
          {/* Quill Center Ribs */}
          <line x1="15" y1="11" x2="27" y2="48" stroke="#94A3B8" strokeWidth="0.9" />
          <line x1="30" y1="10" x2="30" y2="48" stroke="#94A3B8" strokeWidth="0.9" />
          <line x1="45" y1="11" x2="33" y2="48" stroke="#94A3B8" strokeWidth="0.9" />

          {/* Spartan Orange Binding Threads */}
          <path d="M 15 26 Q 30 28 45 26" stroke="#F4510B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M 21 38 Q 30 40 39 38" stroke="#F4510B" strokeWidth="2.2" fill="none" strokeLinecap="round" />

          {/* Cork Base (Rounded Dome) */}
          <path 
            d="M 24 48 C 24 56, 36 56, 36 48 Z" 
            fill="url(#shuttle-cork)" 
            stroke="#C2410C" 
            strokeWidth="1" 
          />
          {/* Cork White Rim */}
          <rect x="24" y="47" width="12" height="3" rx="1.5" fill="#FFFFFF" opacity="0.9" />
        </g>
      </svg>
    </div>
  );
}

export default SportsBallsCorner;
