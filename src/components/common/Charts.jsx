import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';

// Monthly Revenue & Enrollments Area/Bar Chart (Dynamically computed from actual CRM payments and admissions)
export function RevenueTrendChart() {
  const { data } = useCrm();
  const payments = data.payments || [];
  const students = data.students || [];

  const totalPayments = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const hasData = payments.length > 0 || students.length > 0;

  // Last 6 months labels
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-GB', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }

  // Aggregate actual payments and admissions per month
  const monthlyStats = months.map(m => {
    const rev = payments
      .filter(p => {
        if (!p.date) return false;
        const d = new Date(p.date);
        return d.getFullYear() === m.year && d.getMonth() === m.month && p.status !== 'Failed';
      })
      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    const enr = students.filter(s => {
      const dt = s.admissionDate || s.createdAt || s.enrollmentDate;
      if (!dt) return false;
      const d = new Date(dt);
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    }).length;

    return {
      label: m.label,
      revenueK: Math.round(rev / 1000),
      rawRevenue: rev,
      enrollments: enr,
    };
  });

  const maxRevK = Math.max(...monthlyStats.map(s => s.revenueK), 10);
  const maxEnr = Math.max(...monthlyStats.map(s => s.enrollments), 5);
  const currentMonthGross = monthlyStats[monthlyStats.length - 1]?.rawRevenue || 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#172B5012] gap-2">
        <div>
          <h4 className="text-sm font-extrabold text-[#172B50]">Academy Revenue & Growth Velocity</h4>
          <p className="text-xs text-[#172B50] opacity-70">
            {hasData ? 'Monthly tuition collections & new admissions' : 'Tuition collections & new admission trends'}
          </p>
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

      {!hasData ? (
        <div className="mt-6 h-56 flex flex-col items-center justify-center p-6 text-center rounded-xl bg-[#FFF4E8]/40 border border-dashed border-[#172B50]/15">
          <div className="w-12 h-12 rounded-full bg-[#172B50]/10 flex items-center justify-center text-[#172B50] mb-2 font-black text-lg">
            ₹
          </div>
          <p className="text-sm font-bold text-[#172B50]">No Revenue or Enrollment Records Found</p>
          <p className="text-xs text-[#172B50]/70 max-w-sm mt-1">
            Collections and admissions recorded via Payments and B2C Enquiries will automatically render dynamic growth velocity curves.
          </p>
        </div>
      ) : (
        <div className="mt-6 h-56 flex items-end justify-between gap-3 pt-6 px-2">
          {monthlyStats.map((item) => {
            const revHeight = maxRevK > 0 ? (item.revenueK / maxRevK) * 100 : 0;
            const enrHeight = maxEnr > 0 ? (item.enrollments / maxEnr) * 100 : 0;

            return (
              <div key={item.label} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1.5 h-full relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#172B50] text-white text-[10px] py-1 px-2 rounded font-bold shadow-dropdown pointer-events-none whitespace-nowrap z-20">
                    ₹{item.revenueK}k • {item.enrollments} kids
                  </div>

                  {/* Revenue Bar: Spartan Orange */}
                  <div
                    style={{ height: `${Math.max(revHeight, 4)}%` }}
                    className="w-1/2 max-w-[28px] bg-[#F4510B] rounded-t-lg transition-all group-hover:brightness-110 shadow-sm"
                  />

                  {/* Enrollment Bar: Navy Blue */}
                  <div
                    style={{ height: `${Math.max(enrHeight, 4)}%` }}
                    className="w-1/2 max-w-[28px] bg-[#172B50] rounded-t-lg transition-all group-hover:brightness-125 shadow-sm"
                  />
                </div>

                <span className="text-[11px] font-bold text-[#172B50] group-hover:text-[#F4510B] transition-colors">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-[#172B5012] flex items-center justify-between text-xs">
        <span className="font-semibold text-[#172B50]">
          Total Realized Revenue: ₹{totalPayments.toLocaleString('en-IN')}
        </span>
        <span className="font-bold text-[#F4510B]">
          {hasData ? `${students.length} Total Athletes` : '0 Recorded Records'}
        </span>
      </div>
    </div>
  );
}

// Attendance Donut Chart (Dynamically computed from actual attendance data - 0 dummy records)
export function AttendanceDonutChart({ 
  presentRate, 
  totalRecords, 
  attendedCount, 
  absentCount 
}) {
  const { data } = useCrm();
  const attList = data.attendanceRecords || [];
  
  const effectiveTotal = totalRecords !== undefined ? totalRecords : attList.length;
  const effectiveAttended = attendedCount !== undefined ? attendedCount : attList.filter(r => r.status === 'Present').length;
  const effectiveAbsent = absentCount !== undefined ? absentCount : attList.filter(r => r.status === 'Absent').length;
  const effectiveRate = presentRate !== undefined 
    ? presentRate 
    : (effectiveTotal > 0 ? Math.round((effectiveAttended / effectiveTotal) * 100) : 0);

  const absentRate = effectiveTotal > 0 ? 100 - effectiveRate : 0;
  // Circumference for r=38 is 2 * PI * 38 = ~238.76
  const strokeDashoffset = effectiveTotal > 0 
    ? 238.76 - (238.76 * effectiveRate) / 100 
    : 238.76;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card flex flex-col justify-between">
      <div className="pb-3 border-b border-[#172B5012]">
        <h4 className="text-sm font-extrabold text-[#172B50]">Today's Academy Attendance</h4>
        <p className="text-xs text-[#172B50] opacity-70">
          {effectiveTotal > 0 
            ? `${effectiveTotal} session check-in${effectiveTotal === 1 ? '' : 's'} recorded`
            : 'Live attendance check-in register across centers'}
        </p>
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
            className="opacity-15"
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
          <span className="text-2xl font-black text-[#172B50]">{effectiveRate}%</span>
          <span className="text-[10px] font-bold text-[#F4510B] uppercase tracking-wider">
            {effectiveTotal > 0 ? 'Present' : '0 Marked'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#172B5012] text-center text-xs">
        <div className="p-2 rounded-xl bg-[#FFF4E8]">
          <span className="text-[11px] font-bold text-[#172B50] block">Attended</span>
          <span className="text-sm font-extrabold text-[#F4510B]">
            {effectiveTotal > 0 ? `${effectiveAttended} (${effectiveRate}%)` : '0 (0%)'}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-[#FFF4E8]">
          <span className="text-[11px] font-bold text-[#172B50] block">Absent / Leave</span>
          <span className="text-sm font-extrabold text-[#172B50]">
            {effectiveTotal > 0 ? `${effectiveAbsent} (${absentRate}%)` : '0 (0%)'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Sports Distribution Progress Chart (Computed dynamically from real student enrollments)
export function ProgramDistributionChart() {
  const { data } = useCrm();
  const students = data.students || [];
  const programsList = data.programs || [
    { name: 'Junior Athletics' },
    { name: 'Gymnastics & Agility' },
    { name: 'Football Champions' },
    { name: 'Basketball Stars' },
    { name: 'Martial Arts & Karate' },
    { name: 'Little Cubs Multi-Sport' }
  ];

  const sports = programsList.map(prog => {
    const count = students.filter(s => (s.program || '').toLowerCase() === prog.name.toLowerCase()).length;
    const pct = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
    return { name: prog.name, students: count, pct };
  });

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
      <div className="pb-3 border-b border-[#172B5012] mb-4">
        <h4 className="text-sm font-extrabold text-[#172B50]">Batch Capacity & Student Distribution</h4>
        <p className="text-xs text-[#172B50] opacity-70">
          {students.length > 0 
            ? `Enrollments across ${students.length} active athletes` 
            : 'Real-time athlete enrollments per sports curriculum'}
        </p>
      </div>

      <div className="space-y-3.5">
        {sports.map(item => (
          <div key={item.name}>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-[#172B50]">{item.name}</span>
              <span className="text-[#F4510B]">
                {item.students} Student{item.students === 1 ? '' : 's'} ({item.pct}%)
              </span>
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
