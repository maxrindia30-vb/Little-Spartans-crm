import React, { useState } from 'react';

// Monthly Revenue & Enrollments Area/Bar Chart
export function RevenueTrendChart() {
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const revenueData = [180, 220, 290, 340, 410, 485]; // in thousands ₹
  const enrollmentData = [35, 42, 58, 70, 85, 96];

  const maxRev = 550;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#172B5012] gap-2">
        <div>
          <h4 className="text-sm font-extrabold text-[#172B50]">Academy Revenue & Growth Velocity</h4>
          <p className="text-xs text-[#172B50] opacity-70">Monthly tuition collections & new admissions (H2 2026)</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#F4510B]" />
            <span className="text-[#172B50]">Revenue (₹ K)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#172B50]" />
            <span className="text-[#172B50]">Enrollments</span>
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
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#172B50] text-white text-[10px] py-1 px-2 rounded font-bold shadow-dropdown pointer-events-none whitespace-nowrap z-20">
                  ₹{revenueData[idx]}k • {enrollmentData[idx]} kids
                </div>

                {/* Revenue Bar: Spartan Orange */}
                <div 
                  style={{ height: `${revHeight}%` }}
                  className="w-1/2 max-w-[28px] bg-[#F4510B] rounded-t-lg transition-all group-hover:brightness-110 shadow-sm"
                />

                {/* Enrollment Bar: Navy Blue */}
                <div 
                  style={{ height: `${enrHeight}%` }}
                  className="w-1/2 max-w-[28px] bg-[#172B50] rounded-t-lg transition-all group-hover:brightness-125 shadow-sm"
                />
              </div>

              <span className="text-[11px] font-bold text-[#172B50] group-hover:text-[#F4510B] transition-colors">
                {m}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[#172B5012] flex items-center justify-between text-xs">
        <span className="font-semibold text-[#172B50]">November Gross Run-rate: ₹4,85,000</span>
        <span className="font-bold text-[#F4510B]">+18.2% MoM</span>
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
    <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card flex flex-col justify-between">
      <div className="pb-3 border-b border-[#172B5012]">
        <h4 className="text-sm font-extrabold text-[#172B50]">Today's Academy Attendance</h4>
        <p className="text-xs text-[#172B50] opacity-70">Across all 4 training centers</p>
      </div>

      <div className="my-4 flex items-center justify-center relative">
        <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle: Navy Blue subtle */}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="#172B50"
            strokeWidth="11"
            fill="transparent"
            className="opacity-20"
          />
          {/* Active present arc: Spartan Orange */}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="#F4510B"
            strokeWidth="11"
            fill="transparent"
            strokeDasharray="238.76"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-[#172B50]">{presentRate}%</span>
          <span className="text-[10px] font-bold text-[#F4510B] uppercase tracking-wider">Present</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#172B5012] text-center text-xs">
        <div className="p-2 rounded-xl bg-[#FFF4E8]">
          <span className="text-[11px] font-bold text-[#172B50] block">Attended</span>
          <span className="text-sm font-extrabold text-[#F4510B]">{presentRate}%</span>
        </div>
        <div className="p-2 rounded-xl bg-[#FFF4E8]">
          <span className="text-[11px] font-bold text-[#172B50] block">Absent / Leave</span>
          <span className="text-sm font-extrabold text-[#172B50]">{absentRate}%</span>
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
    <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
      <div className="pb-3 border-b border-[#172B5012] mb-4">
        <h4 className="text-sm font-extrabold text-[#172B50]">Batch Capacity & Student Distribution</h4>
        <p className="text-xs text-[#172B50] opacity-70">Enrollments per sports curriculum</p>
      </div>

      <div className="space-y-3.5">
        {sports.map(item => (
          <div key={item.name}>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-[#172B50]">{item.name}</span>
              <span className="text-[#F4510B]">{item.students} Students ({item.pct}%)</span>
            </div>
            <div className="w-full h-2.5 bg-[#FFF4E8] rounded-full overflow-hidden border border-[#172B5015]">
              <div 
                style={{ width: `${item.pct}%` }} 
                className="h-full bg-[#172B50] rounded-full transition-all duration-700 hover:bg-[#F4510B]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
