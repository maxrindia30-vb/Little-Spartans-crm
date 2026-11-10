import React from 'react';
import { ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

export default function KpiCard({ title, value, subtitle, icon: Icon, trend, trendLabel, highlight = false }) {
  return (
    <div className={`interactive-card bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card relative overflow-hidden group select-none ${
      highlight ? 'ring-2 ring-[#F4510B] bg-gradient-to-br from-white to-[#FFF4E8]/60' : ''
    }`}>
      {/* Decorative Warm Cream & Spartan Orange corner glow */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-[#FFF4E8] rounded-bl-full -z-0 pointer-events-none group-hover:scale-125 group-hover:bg-[#FFEDE0] transition-transform duration-500 ease-out" />
      
      {/* Subtle top edge gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 ${
        highlight ? 'bg-gradient-to-r from-[#F4510B] via-[#FFA366] to-[#F4510B] opacity-100' : 'bg-[#F4510B] opacity-0 group-hover:opacity-100'
      }`} />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#172B50] opacity-75 block">
              {title}
            </span>
            {highlight && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-extrabold bg-[#F4510B] text-white animate-pulse">
                <Sparkles className="w-2.5 h-2.5" />
                ACTIVE
              </span>
            )}
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight group-hover:text-[#F4510B] transition-colors duration-200">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-[#FFF4E8] border border-[#F4510B22] flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#F4510B] group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
            <Icon className="w-6 h-6 text-[#F4510B] group-hover:text-white transition-colors duration-200" />
          </div>
        )}
      </div>

      <div className="relative z-10 mt-3 pt-3 border-t border-[#172B5010] flex items-center justify-between text-xs">
        {trend !== undefined && (
          <div className="flex items-center gap-1 font-bold text-[#F4510B]">
            <div className="p-0.5 rounded-md bg-[#FFF4E8] group-hover:bg-[#F4510B] group-hover:text-white transition-colors">
              {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            </div>
            <span>{Math.abs(trend)}%</span>
            <span className="font-normal text-[#172B50] opacity-70 ml-1">{trendLabel || 'vs last month'}</span>
          </div>
        )}

        {subtitle && !trend && (
          <span className="text-[11.5px] font-semibold text-[#172B50] opacity-75">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
