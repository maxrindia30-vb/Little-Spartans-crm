import React, { useState } from 'react';

// Monthly Revenue & Enrollments Area/Bar Chart
export function RevenueTrendChart() {
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const revenueData = [180, 220, 290, 340, 410, 485]; // in thousands ₹
  const enrollmentData = [35, 42, 58, 70, 85, 96];

  const maxRev = 550;

  return (
    <div className="bg-[#F4F7F6] text-[#080B0C] rounded-2xl p-5 border border-[#493548]/20 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#493548]/15 gap-2">
        <div>
          <h4 className="text-sm font-extrabold text-[#080B0C]">Academy Revenue & Growth Velocity</h4>
          <p className="text-xs text-[#493548]">Monthly tuition collections & new admissions (H2 2026)</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#55CDB3]" />
            <span className="text-[#080B0C]">Revenue (₹ K)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#493548]" />
            <span className="text-[#080B0C]">Enrollments</span>
          </div>
        </div>
      </div>

      <div className="mt-6 h-56 flex items-end justify-between gap-3 pt-6 px-2">
        {months.map((m, idx) => {
          const revHeight = (revenueData[idx] / maxRev) * 100;
          const enrHeight = (enrollmentData[idx] / 120) * 100;

          return (
            <div key={m} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <div className="w-full flex items-end justify-center gap-1.5 h-full relative">
                
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#080B0C] text-[#F4F7F6] text-[10px] py-1 px-2 rounded font-bold shadow-dropdown border border-[#493548]/40 pointer-events-none whitespace-nowrap z-20">
                  ₹{revenueData[idx]}k • {enrollmentData[idx]} kids
                </div>

                {/* Revenue Bar: Mint Teal */}
                <div 
                  style={{ height: `${revHeight}%` }}
                  className="w-1/2 max-w-[28px] bg-[#55CDB3] rounded-t-lg transition-all group-hover:brightness-110 shadow-sm"
                />

                {/* Enrollment Bar: Deep Plum */}
                <div 
                  style={{ height: `${enrHeight}%` }}
                  className="w-1/2 max-w-[28px] bg-[#493548] rounded-t-lg transition-all group-hover:brightness-125 shadow-sm"
                />
              </div>

              <span className="text-[11px] font-bold text-[#080B0C] group-hover:text-[#55CDB3] transition-colors">
                {m}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[#493548]/15 flex items-center justify-between text-xs">
        <span className="font-semibold text-[#080B0C]">November Gross Run-rate: ₹4,85,000</span>
        <span className="font-extrabold text-[#55CDB3]">+18.2% MoM</span>
      </div>
    </div>
  );
}

// Attendance Donut Chart
export function AttendanceDonutChart({ presentRate = 92 }) {
  const absentRate = 100 - presentRate;
  // Circumference for r=38 is 2 * PI * 38 = ~238.76
  const strokeDashoffset = 238.76 - (238.76 * presentRate) / 100;

  return (
    <div className="bg-[#F4F7F6] text-[#080B0C] rounded-2xl p-5 border border-[#493548]/20 shadow-card flex flex-col justify-between">
      <div className="pb-3 border-b border-[#493548]/15">
        <h4 className="text-sm font-extrabold text-[#080B0C]">Today's Academy Attendance</h4>
        <p className="text-xs text-[#493548]">Across all 5 training centers</p>
      </div>

      <div className="my-4 flex items-center justify-center relative">
        <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle: Deep Plum subtle */}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="#493548"
            strokeWidth="11"
            fill="transparent"
            className="opacity-20"
          />
          {/* Active present arc: Mint Teal */}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="#55CDB3"
            strokeWidth="11"
            fill="transparent"
            strokeDasharray="238.76"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-[#080B0C]">{presentRate}%</span>
          <span className="text-[10px] font-black text-[#55CDB3] uppercase tracking-wider">Present</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#493548]/15 text-center text-xs">
        <div className="p-2 rounded-xl bg-[#493548]/15 border border-[#493548]/20">
          <span className="text-[11px] font-bold text-[#080B0C] block">Attended</span>
          <span className="text-sm font-black text-[#55CDB3]">{presentRate}%</span>
        </div>
        <div className="p-2 rounded-xl bg-[#493548]/15 border border-[#493548]/20">
          <span className="text-[11px] font-bold text-[#080B0C] block">Absent / Leave</span>
          <span className="text-sm font-extrabold text-[#493548]">{absentRate}%</span>
        </div>
      </div>
    </div>
  );
}

// Sports Distribution Progress Chart
export function ProgramDistributionChart() {
  const sports = [
    { name: 'Gymnastics & Agility', students: 48, pct: 90 },
    { name: 'Junior Football', students: 64, pct: 95 },
    { name: 'Athletics & Sprints', students: 38, pct: 76 },
    { name: 'Basketball Stars', students: 42, pct: 84 },
    { name: 'Martial Arts & Karate', students: 32, pct: 70 },
    { name: 'Little Cubs Multi-Sport', students: 36, pct: 80 }
  ];

  return (
    <div className="bg-[#F4F7F6] text-[#080B0C] rounded-2xl p-5 border border-[#493548]/20 shadow-card">
      <div className="pb-3 border-b border-[#493548]/15 mb-4">
        <h4 className="text-sm font-extrabold text-[#080B0C]">Batch Capacity & Student Distribution</h4>
        <p className="text-xs text-[#493548]">Enrollments per sports curriculum</p>
      </div>

      <div className="space-y-3.5">
        {sports.map(item => (
          <div key={item.name}>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-[#080B0C]">{item.name}</span>
              <span className="text-[#55CDB3] font-black">{item.students} Students ({item.pct}%)</span>
            </div>
            <div className="w-full h-2.5 bg-[#493548]/15 rounded-full overflow-hidden border border-[#493548]/20">
              <div 
                style={{ width: `${item.pct}%` }} 
                className="h-full bg-[#55CDB3] rounded-full transition-all duration-700 hover:bg-[#48bfa5]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
