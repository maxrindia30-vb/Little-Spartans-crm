import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export function AnimatedCounter({ value, duration = 1100, padZero = false }) {
  const [displayValue, setDisplayValue] = useState(() => String(value ?? '0'));

  useEffect(() => {
    const strVal = String(value ?? 0);
    const cleaned = strVal.replace(/,/g, '');
    const match = cleaned.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)([^0-9]*)$/);

    if (!match) {
      setDisplayValue(strVal);
      return;
    }

    const prefix = match[1] || '';
    const targetNum = parseFloat(match[2]);
    const suffix = match[3] || '';
    const isZeroPadded = padZero || (match[2].length > 1 && match[2].startsWith('0'));
    const isCurrency = prefix.includes('₹') || prefix.includes('$');

    if (isNaN(targetNum)) {
      setDisplayValue(strVal);
      return;
    }

    let startTimestamp = null;
    let animId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(targetNum * ease);

      let formatted = `${current}`;
      if (isCurrency) {
        formatted = current.toLocaleString('en-IN');
      } else if (isZeroPadded && current < 10) {
        formatted = `0${current}`;
      }

      setDisplayValue(`${prefix}${formatted}${suffix}`);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [value, duration, padZero]);

  return <>{displayValue}</>;
}

const COLOR_THEMES = {
  orange: {
    bgGradient: 'bg-[#F4F7F6]',
    border: 'border-[#493548]/20',
    iconBg: 'bg-[#55CDB3]/15',
    iconColor: 'text-[#55CDB3]',
    waveColor: '#55CDB3',
    hoverRing: 'group-hover:border-[#55CDB3]',
    shadow: 'shadow-[0_8px_25px_rgba(8,11,12,0.35)]',
  },
  blue: {
    bgGradient: 'bg-[#F4F7F6]',
    border: 'border-[#493548]/20',
    iconBg: 'bg-[#493548]/15',
    iconColor: 'text-[#493548]',
    waveColor: '#493548',
    hoverRing: 'group-hover:border-[#493548]',
    shadow: 'shadow-[0_8px_25px_rgba(8,11,12,0.35)]',
  },
  green: {
    bgGradient: 'bg-[#F4F7F6]',
    border: 'border-[#493548]/20',
    iconBg: 'bg-[#55CDB3]/15',
    iconColor: 'text-[#55CDB3]',
    waveColor: '#55CDB3',
    hoverRing: 'group-hover:border-[#55CDB3]',
    shadow: 'shadow-[0_8px_25px_rgba(8,11,12,0.35)]',
  },
  purple: {
    bgGradient: 'bg-[#F4F7F6]',
    border: 'border-[#493548]/20',
    iconBg: 'bg-[#493548]/15',
    iconColor: 'text-[#493548]',
    waveColor: '#493548',
    hoverRing: 'group-hover:border-[#493548]',
    shadow: 'shadow-[0_8px_25px_rgba(8,11,12,0.35)]',
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

  // Floating 3D mouse physics
  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 12;
    const rotateY = (x - 0.5) * 12;

    setTilt({
      rotateX: Number(rotateX.toFixed(2)),
      rotateY: Number(rotateY.toFixed(2)),
      glareX: Number((x * 100).toFixed(1)),
      glareY: Number((y * 100).toFixed(1)),
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setTilt({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false,
    });
  };

  // Format trend string e.g. "+12%" or "12%" -> "↑ 12%"
  let trendText = null;
  let isPositiveTrend = true;

  if (trend !== undefined && trend !== null && trend !== '') {
    const rawNum = typeof trend === 'number' ? trend : parseFloat(String(trend).replace('%', ''));
    isPositiveTrend = isNaN(rawNum) || rawNum >= 0;
    const absVal = isNaN(rawNum) ? String(trend) : `${Math.abs(rawNum)}%`;
    trendText = `${isPositiveTrend ? '↑' : '↓'} ${absVal}`;
  }

  const transformStyle = tilt.isHovered
    ? `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(-6px) scale(1.025)`
    : 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setTilt((prev) => ({ ...prev, isHovered: true }))}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden rounded-[24px] p-5 border ${theme.border} ${theme.bgGradient} ${theme.shadow} ${
        theme.hoverRing
      } select-none will-change-transform ${
        onClick ? 'cursor-pointer' : ''
      } ${highlight ? 'ring-2 ring-[#55CDB3]' : ''}`}
      style={{
        transform: transformStyle,
        transition: tilt.isHovered
          ? 'transform 0.08s ease-out, box-shadow 0.2s ease-out'
          : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s ease',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Dynamic Specular Spotlight Glare on Hover */}
      {tilt.isHovered && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[24px] z-20 transition-opacity duration-200"
          style={{
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.5) 0%, rgba(85, 205, 179, 0.12) 50%, transparent 80%)`,
          }}
        />
      )}

      <div
        className="relative z-10 flex items-center gap-4"
        style={{
          transform: tilt.isHovered ? 'translateZ(8px)' : 'translateZ(0px)',
          transition: 'transform 0.2s ease',
        }}
      >
        {/* Left: Squircle pastel icon container */}
        {Icon && (
          <div
            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl ${theme.iconBg} flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${theme.iconColor}`} />
          </div>
        )}

        {/* Right: Numbers, Trend & Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-2xl sm:text-3xl font-black text-[#080B0C] tracking-tight leading-none">
              <AnimatedCounter value={value} />
            </h3>

            {trendText && (
              <span
                className={`inline-flex items-center text-xs sm:text-[13px] font-extrabold shrink-0 ${
                  isPositiveTrend ? 'text-[#55CDB3]' : 'text-[#493548]'
                }`}
              >
                {trendText}
              </span>
            )}

            {!trendText && highlight && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-extrabold bg-[#55CDB3] text-[#080B0C] animate-pulse">
                <Sparkles className="w-2.5 h-2.5" />
                LIVE
              </span>
            )}
          </div>

          <p className="text-xs sm:text-[13px] font-bold text-[#080B0C] tracking-tight mt-1 truncate">
            {title}
          </p>

          {subtitle && (
            <p className="text-[10.5px] font-semibold text-[#493548] truncate mt-0.5">
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
