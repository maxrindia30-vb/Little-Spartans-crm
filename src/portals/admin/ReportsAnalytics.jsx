import React from 'react';
import { BarChart3, TrendingUp, Download, PieChart, Users, Award, ShieldCheck } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { RevenueTrendChart, AttendanceDonutChart, ProgramDistributionChart } from '../../components/common/Charts';

export default function ReportsAnalytics() {
  const { data, addToast } = useCrm();

  const handleExport = () => {
    addToast('Academy performance metrics exported to CSV/Excel report.');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#080B0C] tracking-tight">
            Academy Analytics & Executive Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#080B0C] opacity-75 mt-0.5">
            Cohort retention, revenue run-rate, facility capacity and lead conversion velocity
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#55CDB3] text-[#080B0C] font-bold rounded-xl shadow-sm hover:bg-[#55CDB3]/90 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-white" />
          <span>Export Analytics Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#F4F7F6] rounded-2xl p-5 border border-[#493548]/20 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#493548] block mb-1">
            Student Retention
          </span>
          <h3 className="text-3xl font-extrabold text-[#080B0C]">94.2%</h3>
          <p className="text-xs font-bold text-[#55CDB3] mt-1">+3.5% vs Q2 2026</p>
        </div>

        <div className="bg-[#F4F7F6] rounded-2xl p-5 border border-[#493548]/20 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#493548] block mb-1">
            Trial Conversion Rate
          </span>
          <h3 className="text-3xl font-extrabold text-[#080B0C]">76.8%</h3>
          <p className="text-xs font-bold text-[#55CDB3] mt-1">From trial to paid enroll</p>
        </div>

        <div className="bg-[#F4F7F6] rounded-2xl p-5 border border-[#493548]/20 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#493548] block mb-1">
            Coach-to-Student Ratio
          </span>
          <h3 className="text-3xl font-extrabold text-[#080B0C]">1 : 8.5</h3>
          <p className="text-xs font-semibold text-[#080B0C] opacity-75 mt-1">Olympic standard coaching</p>
        </div>

        <div className="bg-[#F4F7F6] rounded-2xl p-5 border border-[#493548]/20 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#493548] block mb-1">
            Parent Net Promoter (NPS)
          </span>
          <h3 className="text-3xl font-extrabold text-[#55CDB3]">+84</h3>
          <p className="text-xs font-semibold text-[#080B0C] opacity-75 mt-1">World-class benchmark</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueTrendChart />
        </div>
        <div>
          <AttendanceDonutChart presentRate={92} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgramDistributionChart />

        {/* Lead Source Breakdown */}
        <div className="bg-[#F4F7F6] rounded-2xl p-5 border border-[#493548]/20 shadow-card">
          <div className="pb-3 border-b border-[#493548]/20 mb-4">
            <h4 className="text-sm font-extrabold text-[#080B0C]">Acquisition Channels & Lead Attribution</h4>
            <p className="text-xs text-[#493548]">Where new Spartan students come from</p>
          </div>

          <div className="space-y-3.5">
            {[
              { source: 'Parent Word-of-Mouth & Referrals', pct: 45, count: 68 },
              { source: 'Google Local Search & Maps', pct: 25, count: 38 },
              { source: 'Instagram Academy Reels & Ads', pct: 20, count: 30 },
              { source: 'School Sports Partnerships', pct: 10, count: 15 },
            ].map(item => (
              <div key={item.source}>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#080B0C]">{item.source}</span>
                  <span className="text-[#55CDB3]">{item.count} Leads ({item.pct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-[#493548]/15 rounded-full overflow-hidden border border-[#493548]/20">
                  <div
                    style={{ width: `${item.pct}%` }}
                    className="h-full bg-[#080B0C] rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
