import React from 'react';
import { Lock, Check } from 'lucide-react';

/**
 * High-definition child-friendly SVG badge illustrations matching Little Spartans design.
 */

export function RabbitJumpingBadge({ size = 64, status = 'completed', className = '' }) {
  const isLocked = status === 'locked';
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`transition-all duration-300 drop-shadow-sm ${isLocked ? 'grayscale opacity-40 contrast-75' : 'hover:scale-105'}`}
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="innerShield" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ECFDF5" />
            <stop offset="100%" stopColor="#D1FAE5" />
          </linearGradient>
        </defs>
        {/* Shield Outer Border */}
        <path
          d="M 50 4 C 75 4 92 12 92 38 C 92 68 50 96 50 96 C 50 96 8 68 8 38 C 8 12 25 4 50 4 Z"
          fill="url(#shieldGrad)"
          stroke="#059669"
          strokeWidth="3"
        />
        {/* Inner Shield */}
        <path
          d="M 50 10 C 70 10 84 17 84 38 C 84 63 50 87 50 87 C 50 87 16 63 16 38 C 16 17 30 10 50 10 Z"
          fill="url(#innerShield)"
        />
        {/* Grass Meadow */}
        <path d="M 22 66 Q 50 56 78 66 L 78 74 Q 50 84 22 74 Z" fill="#6EE7B7" opacity="0.6" />
        {/* Hurdle Bar */}
        <line x1="28" y1="58" x2="48" y2="58" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="58" x2="32" y2="68" stroke="#D97706" strokeWidth="2.5" />
        <line x1="44" y1="58" x2="44" y2="68" stroke="#D97706" strokeWidth="2.5" />
        {/* Jumping Rabbit */}
        <g transform="translate(36, 24)">
          {/* Back leg & foot */}
          <ellipse cx="12" cy="28" rx="7" ry="4" fill="#E2E8F0" transform="rotate(-25 12 28)" />
          {/* Fluffy tail */}
          <circle cx="2" cy="22" r="4.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          {/* Body */}
          <ellipse cx="18" cy="20" rx="14" ry="11" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          {/* Head */}
          <circle cx="28" cy="12" r="9" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          {/* Cheeks */}
          <circle cx="26" cy="15" r="2.5" fill="#FCA5A5" opacity="0.6" />
          {/* Eye */}
          <circle cx="30" cy="11" r="1.5" fill="#1E293B" />
          <circle cx="30.5" cy="10.5" r="0.5" fill="#FFFFFF" />
          {/* Nose */}
          <polygon points="35,13 37,13 36,15" fill="#F43F5E" />
          {/* Ears */}
          <ellipse cx="26" cy="2" rx="3.5" ry="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" transform="rotate(-15 26 2)" />
          <ellipse cx="26" cy="2" rx="2" ry="6" fill="#FBCFE8" transform="rotate(-15 26 2)" />
          <ellipse cx="32" cy="3" rx="3.5" ry="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" transform="rotate(10 32 3)" />
          <ellipse cx="32" cy="3" rx="2" ry="6" fill="#FBCFE8" transform="rotate(10 32 3)" />
          {/* Front Paws */}
          <ellipse cx="28" cy="26" rx="3" ry="5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" transform="rotate(30 28 26)" />
        </g>
        {/* Stars */}
        <polygon points="72,22 74,26 78,27 75,30 76,34 72,32 68,34 69,30 66,27 70,26" fill="#FBBF24" />
        <polygon points="24,28 25,30 28,31 26,33 27,35 24,34 21,35 22,33 20,31 23,30" fill="#FBBF24" />
      </svg>
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-slate-800/80 text-white flex items-center justify-center shadow-md">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </div>
  );
}

export function FoxBearTurnsBadge({ size = 64, status = 'completed', className = '' }) {
  const isLocked = status === 'locked';
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`transition-all duration-300 drop-shadow-sm ${isLocked ? 'grayscale opacity-40 contrast-75' : 'hover:scale-105'}`}
      >
        <defs>
          <linearGradient id="scallopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <radialGradient id="sunBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="100%" stopColor="#FEF3C7" />
          </radialGradient>
        </defs>
        {/* Scalloped Medallion Outer */}
        <circle cx="50" cy="50" r="46" fill="url(#scallopGrad)" stroke="#B45309" strokeWidth="2" />
        {/* Scalloped teeth effect */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 360) / 16;
          const rad = (angle * Math.PI) / 180;
          const cx = 50 + 44 * Math.cos(rad);
          const cy = 50 + 44 * Math.sin(rad);
          return <circle key={i} cx={cx} cy={cy} r="5" fill="#F59E0B" />;
        })}
        {/* Center Canvas */}
        <circle cx="50" cy="50" r="39" fill="url(#sunBg)" stroke="#FDE68A" strokeWidth="2" />
        {/* Tiny Red Heart above */}
        <path d="M 50 24 C 47 20 42 21 42 25 C 42 29 50 35 50 35 C 50 35 58 29 58 25 C 58 21 53 20 50 24 Z" fill="#EF4444" />
        {/* Little Bear (Brown) */}
        <g transform="translate(48, 38)">
          <circle cx="16" cy="16" r="13" fill="#92400E" />
          <circle cx="7" cy="6" r="4.5" fill="#92400E" />
          <circle cx="7" cy="6" r="2.5" fill="#FDE68A" />
          <circle cx="25" cy="6" r="4.5" fill="#92400E" />
          <circle cx="25" cy="6" r="2.5" fill="#FDE68A" />
          <ellipse cx="14" cy="19" rx="6" ry="4.5" fill="#FDE68A" />
          <circle cx="13" cy="17" r="1.8" fill="#451A03" />
          <circle cx="11" cy="13" r="1.3" fill="#1E293B" />
          <circle cx="17" cy="13" r="1.3" fill="#1E293B" />
          <circle cx="7" cy="17" r="2" fill="#FCA5A5" opacity="0.6" />
        </g>
        {/* Little Fox (Orange) */}
        <g transform="translate(22, 36)">
          <path d="M 16 10 L 26 26 L 8 26 Z" fill="#EA580C" />
          <polygon points="10,8 14,16 6,16" fill="#EA580C" />
          <polygon points="10,9 13,15 7,15" fill="#FFF7ED" />
          <polygon points="22,8 26,16 18,16" fill="#EA580C" />
          <polygon points="22,9 25,15 19,15" fill="#FFF7ED" />
          <circle cx="16" cy="20" r="10" fill="#EA580C" />
          <path d="M 16 20 C 10 20 8 26 8 28 C 11 30 21 30 24 28 C 24 26 22 20 16 20 Z" fill="#FFF7ED" />
          <circle cx="16" cy="26" r="1.8" fill="#1E293B" />
          <circle cx="12" cy="18" r="1.3" fill="#1E293B" />
          <circle cx="20" cy="18" r="1.3" fill="#1E293B" />
          <circle cx="10" cy="22" r="2" fill="#FCA5A5" opacity="0.6" />
          <circle cx="22" cy="22" r="2" fill="#FCA5A5" opacity="0.6" />
        </g>
        {/* Flowers at base */}
        <circle cx="34" cy="74" r="3" fill="#EC4899" />
        <circle cx="50" cy="76" r="3.5" fill="#F59E0B" />
        <circle cx="66" cy="74" r="3" fill="#3B82F6" />
      </svg>
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-slate-800/80 text-white flex items-center justify-center shadow-md">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </div>
  );
}

export function DuckHoppingBadge({ size = 64, status = 'completed', className = '' }) {
  const isLocked = status === 'locked';
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`transition-all duration-300 drop-shadow-sm ${isLocked ? 'grayscale opacity-40 contrast-75' : 'hover:scale-105'}`}
      >
        <defs>
          <linearGradient id="shieldBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
        </defs>
        {/* Rounded Shield */}
        <path
          d="M 50 6 C 74 6 90 14 90 38 C 90 68 50 94 50 94 C 50 94 10 68 10 38 C 10 14 26 6 50 6 Z"
          fill="url(#shieldBlue)"
          stroke="#0284C7"
          strokeWidth="3"
        />
        <path
          d="M 50 12 C 70 12 83 18 83 38 C 83 63 50 86 50 86 C 50 86 17 63 17 38 C 17 18 30 12 50 12 Z"
          fill="#F0F9FF"
        />
        {/* Little Splash Rings at bottom */}
        <ellipse cx="50" cy="72" rx="16" ry="4" fill="#BAE6FD" opacity="0.7" />
        <ellipse cx="50" cy="72" rx="8" ry="2" fill="#38BDF8" opacity="0.8" />
        {/* Duckling Hopping */}
        <g transform="translate(34, 26)">
          {/* Standing Leg (bent hopping posture) */}
          <line x1="16" y1="34" x2="16" y2="44" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 11 44 L 16 44 L 21 44" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
          {/* Lifted Leg */}
          <line x1="22" y1="32" x2="26" y2="38" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="26" y1="38" x2="22" y2="40" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
          {/* Body */}
          <ellipse cx="16" cy="24" rx="14" ry="11" fill="#FBBF24" />
          {/* Wing flapping */}
          <ellipse cx="14" cy="20" rx="7" ry="5" fill="#F59E0B" transform="rotate(-30 14 20)" />
          {/* Head */}
          <circle cx="26" cy="14" r="9" fill="#FBBF24" />
          {/* Beak */}
          <polygon points="33,14 43,16 34,19" fill="#EA580C" />
          {/* Eye */}
          <circle cx="28" cy="12" r="1.6" fill="#1E293B" />
          <circle cx="28.5" cy="11.5" r="0.6" fill="#FFFFFF" />
          {/* Rosy Cheek */}
          <circle cx="24" cy="17" r="2.2" fill="#FCA5A5" opacity="0.6" />
        </g>
      </svg>
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-slate-800/80 text-white flex items-center justify-center shadow-md">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </div>
  );
}

export function BeamBalancingBadge({ size = 64, status = 'completed', className = '' }) {
  const isLocked = status === 'locked';
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`transition-all duration-300 drop-shadow-sm ${isLocked ? 'grayscale opacity-40 contrast-75' : 'hover:scale-105'}`}
      >
        <defs>
          <linearGradient id="octGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
        </defs>
        {/* Octagon Shape */}
        <polygon
          points="30,6 70,6 94,30 94,70 70,94 30,94 6,70 6,30"
          fill="url(#octGrad)"
          stroke="#4F46E5"
          strokeWidth="3"
        />
        <polygon
          points="31,12 69,12 88,31 88,69 69,88 31,88 12,69 12,31"
          fill="#EEF2FF"
        />
        {/* Wooden Balance Beam */}
        <rect x="18" y="66" width="64" height="6" rx="2" fill="#B45309" stroke="#78350F" strokeWidth="1" />
        <rect x="26" y="72" width="6" height="10" fill="#92400E" />
        <rect x="68" y="72" width="6" height="10" fill="#92400E" />
        {/* Balancing Kid Figure */}
        <g transform="translate(36, 22)">
          {/* Head & Ponytail */}
          <circle cx="14" cy="10" r="7" fill="#FCD34D" />
          <path d="M 8 10 C 6 4 14 3 17 6 C 18 10 13 13 8 10 Z" fill="#92400E" />
          <circle cx="16" cy="11" r="1.2" fill="#1E293B" />
          {/* Torso in purple shirt */}
          <rect x="10" y="18" width="8" height="14" rx="3" fill="#8B5CF6" />
          {/* Arms wide (airplane posture) */}
          <line x1="-3" y1="21" x2="12" y2="21" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round" />
          <line x1="16" y1="21" x2="31" y2="21" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round" />
          {/* Legs standing steadily on beam */}
          <line x1="12" y1="32" x2="12" y2="44" stroke="#4338CA" strokeWidth="3" strokeLinecap="round" />
          <line x1="16" y1="32" x2="16" y2="44" stroke="#4338CA" strokeWidth="3" strokeLinecap="round" />
          {/* Shoes */}
          <rect x="9" y="42" width="5" height="3" rx="1.5" fill="#EF4444" />
          <rect x="14" y="42" width="5" height="3" rx="1.5" fill="#EF4444" />
        </g>
      </svg>
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-slate-800/80 text-white flex items-center justify-center shadow-md">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </div>
  );
}

export function TargetThrowingBadge({ size = 64, status = 'completed', className = '' }) {
  const isLocked = status === 'locked';
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`transition-all duration-300 drop-shadow-sm ${isLocked ? 'grayscale opacity-40 contrast-75' : 'hover:scale-105'}`}
      >
        <defs>
          <linearGradient id="targetShield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#BE185D" />
          </linearGradient>
        </defs>
        {/* Shield */}
        <path
          d="M 50 6 C 74 6 90 14 90 38 C 90 68 50 94 50 94 C 50 94 10 68 10 38 C 10 14 26 6 50 6 Z"
          fill="url(#targetShield)"
          stroke="#DB2777"
          strokeWidth="3"
        />
        <path
          d="M 50 12 C 70 12 83 18 83 38 C 83 63 50 86 50 86 C 50 86 17 63 17 38 C 17 18 30 12 50 12 Z"
          fill="#FDF2F8"
        />
        {/* Target Concentric Rings */}
        <circle cx="50" cy="48" r="26" fill="#F43F5E" />
        <circle cx="50" cy="48" r="20" fill="#FFFFFF" />
        <circle cx="50" cy="48" r="14" fill="#3B82F6" />
        <circle cx="50" cy="48" r="8" fill="#FBBF24" />
        <circle cx="50" cy="48" r="3" fill="#EF4444" />
        {/* Crossed Target Lines */}
        <line x1="20" y1="48" x2="80" y2="48" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        <line x1="50" y1="18" x2="50" y2="78" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      </svg>
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-slate-800/80 text-white flex items-center justify-center shadow-md">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </div>
  );
}

export function SprinterRunningBadge({ size = 52, status = 'completed', className = '' }) {
  const isLocked = status === 'locked';
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`transition-all duration-300 drop-shadow-sm ${isLocked ? 'grayscale opacity-40' : 'hover:scale-105'}`}
      >
        <circle cx="50" cy="50" r="46" fill="#ECFDF5" stroke="#10B981" strokeWidth="4" />
        {/* Running figure */}
        <g transform="translate(32, 22)">
          <circle cx="20" cy="10" r="8" fill="#FCD34D" />
          <path d="M 14 18 L 22 28 L 30 22" stroke="#F4510B" strokeWidth="6" strokeLinecap="round" fill="none" />
          <line x1="12" y1="24" x2="2" y2="34" stroke="#FCD34D" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="24" y1="22" x2="36" y2="28" stroke="#FCD34D" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 22 28 L 12 40 L 4 48" stroke="#172B50" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 22 28 L 28 38 L 36 36" stroke="#172B50" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
        <path d="M 16 78 L 84 78" stroke="#10B981" strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" />
      </svg>
      {isLocked && <Lock className="absolute w-4 h-4 text-slate-700" />}
    </div>
  );
}

export function JumpRopeSkippingBadge({ size = 52, status = 'completed', className = '' }) {
  const isLocked = status === 'locked';
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`transition-all duration-300 drop-shadow-sm ${isLocked ? 'grayscale opacity-40' : 'hover:scale-105'}`}
      >
        <circle cx="50" cy="50" r="46" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="4" />
        {/* Jump rope looping over head */}
        <path d="M 24 58 Q 50 10 76 58" fill="none" stroke="#D97706" strokeWidth="3.5" strokeLinecap="round" />
        {/* Kid jumping */}
        <g transform="translate(36, 26)">
          <circle cx="14" cy="10" r="8" fill="#FCD34D" />
          <rect x="8" y="19" width="12" height="14" rx="4" fill="#3B82F6" />
          <line x1="8" y1="22" x2="-2" y2="30" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round" />
          <line x1="20" y1="22" x2="30" y2="30" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round" />
          <line x1="11" y1="33" x2="8" y2="44" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <line x1="17" y1="33" x2="20" y2="44" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
      {isLocked && <Lock className="absolute w-4 h-4 text-slate-700" />}
    </div>
  );
}

export function FocusStarBadge({ size = 52, status = 'completed', className = '' }) {
  const isLocked = status === 'locked';
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`transition-all duration-300 drop-shadow-sm ${isLocked ? 'grayscale opacity-40' : 'hover:scale-105'}`}
      >
        <defs>
          <linearGradient id="starGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="3" />
        <polygon
          points="50,14 61,37 86,40 68,58 72,83 50,71 28,83 32,58 14,40 39,37"
          fill="url(#starGold)"
          stroke="#D97706"
          strokeWidth="2.5"
        />
        {/* Smiling face on star */}
        <circle cx="43" cy="48" r="2.5" fill="#78350F" />
        <circle cx="57" cy="48" r="2.5" fill="#78350F" />
        <path d="M 44 56 Q 50 62 56 56" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
      {isLocked && <Lock className="absolute w-4 h-4 text-slate-700" />}
    </div>
  );
}

export function TeamPlayerBadge({ size = 52, status = 'completed', className = '' }) {
  const isLocked = status === 'locked';
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`transition-all duration-300 drop-shadow-sm ${isLocked ? 'grayscale opacity-40' : 'hover:scale-105'}`}
      >
        <circle cx="50" cy="50" r="46" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="4" />
        {/* 3 friends hugging */}
        <g transform="translate(24, 28)">
          {/* Friend 1 (Left - Yellow) */}
          <circle cx="10" cy="12" r="6" fill="#FBBF24" />
          <ellipse cx="10" cy="28" rx="8" ry="12" fill="#F59E0B" />
          {/* Friend 3 (Right - Green) */}
          <circle cx="42" cy="12" r="6" fill="#34D399" />
          <ellipse cx="42" cy="28" rx="8" ry="12" fill="#10B981" />
          {/* Friend 2 (Center - Blue) */}
          <circle cx="26" cy="8" r="7" fill="#60A5FA" />
          <ellipse cx="26" cy="26" rx="9" ry="14" fill="#2563EB" />
        </g>
      </svg>
      {isLocked && <Lock className="absolute w-4 h-4 text-slate-700" />}
    </div>
  );
}

/**
 * Universal dynamic badge resolver
 */
export function DynamicBadgeIcon({ iconType, size = 64, status = 'completed', className = '' }) {
  switch (iconType) {
    case 'rabbit':
      return <RabbitJumpingBadge size={size} status={status} className={className} />;
    case 'fox_bear':
      return <FoxBearTurnsBadge size={size} status={status} className={className} />;
    case 'duck':
      return <DuckHoppingBadge size={size} status={status} className={className} />;
    case 'beam_girl':
      return <BeamBalancingBadge size={size} status={status} className={className} />;
    case 'target':
      return <TargetThrowingBadge size={size} status={status} className={className} />;
    case 'sprinter':
      return <SprinterRunningBadge size={size} status={status} className={className} />;
    case 'rope_kid':
      return <JumpRopeSkippingBadge size={size} status={status} className={className} />;
    case 'star':
      return <FocusStarBadge size={size} status={status} className={className} />;
    case 'friends':
      return <TeamPlayerBadge size={size} status={status} className={className} />;
    default:
      return <FocusStarBadge size={size} status={status} className={className} />;
  }
}
