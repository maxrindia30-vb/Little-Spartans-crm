import React from 'react';
import { Sparkles } from 'lucide-react';

const COLOR_THEMES = {
  orange: {
    bgGradient: 'bg-gradient-to-br from-[#FFF5ED] via-[#FFF9F5] to-white',
    border: 'border-[#FED7AA]/70',
    iconBg: 'bg-[#FFE2D1]',
    iconColor: 'text-[#F4510B]',
    waveColor: '#F4510B',
    hoverRing: 'group-hover:border-[#F4510B]/50',
    shadow: 'shadow-[0_8px_25px_rgba(244,81,11,0.06)]',
  },
  blue: {
    bgGradient: 'bg-gradient-to-br from-[#F0F7FF] via-[#F8FBFF] to-white',
    border: 'border-[#BAE6FD]/70',
    iconBg: 'bg-[#D6ECFF]',
    iconColor: 'text-[#0284C7]',
    waveColor: '#0284C7',
    hoverRing: 'group-hover:border-[#0284C7]/50',
    shadow: 'shadow-[0_8px_25px_rgba(2,132,199,0.06)]',
  },
  green: {
    bgGradient: 'bg-gradient-to-br from-[#F0FDF4] via-[#F8FDF9] to-white',
    border: 'border-[#BBF7D0]/70',
    iconBg: 'bg-[#DCFCE7]',
    iconColor: 'text-[#16A34A]',
    waveColor: '#16A34A',
    hoverRing: 'group-hover:border-[#16A34A]/50',
    shadow: 'shadow-[0_8px_25px_rgba(22,163,74,0.06)]',
  },
  purple: {
    bgGradient: 'bg-gradient-to-br from-[#FAF5FF] via-[#FCF9FF] to-white',
    border: 'border-[#E9D5FF]/70',
    iconBg: 'bg-[#F3E8FF]',
    iconColor: 'text-[#9333EA]',
    waveColor: '#9333EA',
    hoverRing: 'group-hover:border-[#9333EA]/50',
    shadow: 'shadow-[0_8px_25px_rgba(147,51,234,0.06)]',
  },
};

export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'orange',
  highlight = false,
  onClick,
}) {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.orange;

  // Format trend string e.g. "+12%" or "12%" -> "↑ 12%"
  let trendText = null;
  let isPositiveTrend = true;

  if (trend !== undefined && trend !== null && trend !== '') {
    const rawNum = typeof trend === 'number' ? trend : parseFloat(String(trend).replace('%', ''));
    isPositiveTrend = isNaN(rawNum) || rawNum >= 0;
    const absVal = isNaN(rawNum) ? String(trend) : `${Math.abs(rawNum)}%`;
    trendText = `${isPositiveTrend ? '↑' : '↓'} ${absVal}`;
  }

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[24px] p-5 border ${theme.border} ${theme.bgGradient} ${theme.shadow} ${
        theme.hoverRing
      } transition-all duration-300 hover:-translate-y-0.5 select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${highlight ? 'ring-2 ring-[#F4510B]' : ''}`}
    >
      <div className="relative z-10 flex items-center gap-4">
        {/* Left: Squircle pastel icon container */}
        {Icon && (
          <div
            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl ${theme.iconBg} flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-105`}
          >
            <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${theme.iconColor}`} />
          </div>
        )}

        {/* Right: Numbers, Trend & Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight leading-none">
              {value}
            </h3>

            {trendText && (
              <span
                className={`inline-flex items-center text-xs sm:text-[13px] font-extrabold shrink-0 ${
                  isPositiveTrend ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {trendText}
              </span>
            )}

            {!trendText && highlight && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-extrabold bg-[#F4510B] text-white animate-pulse">
                <Sparkles className="w-2.5 h-2.5" />
                LIVE
              </span>
            )}
          </div>

          <p className="text-xs sm:text-[13px] font-bold text-[#172B50]/80 tracking-tight mt-1 truncate">
            {title}
          </p>

          {subtitle && (
            <p className="text-[10.5px] font-semibold text-[#172B50]/55 truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Elegant bottom-right curved glowing wave sparkline SVG */}
      <svg
        className="absolute right-0 bottom-0 w-28 h-12 pointer-events-none opacity-85 transition-opacity duration-300 group-hover:opacity-100"
        viewBox="0 0 120 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`kpi-wave-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={theme.waveColor} stopOpacity="0" />
            <stop offset="30%" stopColor={theme.waveColor} stopOpacity="0.25" />
            <stop offset="70%" stopColor={theme.waveColor} stopOpacity="0.75" />
            <stop offset="100%" stopColor={theme.waveColor} stopOpacity="1" />
          </linearGradient>
          <filter id={`kpi-glow-${color}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path
          d="M0 38 C35 38, 55 35, 75 28 C95 21, 108 10, 120 4"
          stroke={`url(#kpi-wave-${color})`}
          strokeWidth="2.75"
          strokeLinecap="round"
          fill="none"
          filter={`url(#kpi-glow-${color})`}
        />
      </svg>
    </div>
  );
}
