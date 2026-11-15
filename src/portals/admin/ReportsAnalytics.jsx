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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Academy Analytics & Executive Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Cohort retention, revenue run-rate, facility capacity and lead conversion velocity
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-white" />
          <span>Export Analytics Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#172B50] opacity-70 block mb-1">
            Student Retention
          </span>
          <h3 className="text-3xl font-extrabold text-[#172B50]">94.2%</h3>
          <p className="text-xs font-bold text-[#F4510B] mt-1">+3.5% vs Q2 2026</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#172B50] opacity-70 block mb-1">
            Trial Conversion Rate
          </span>
          <h3 className="text-3xl font-extrabold text-[#172B50]">76.8%</h3>
          <p className="text-xs font-bold text-[#F4510B] mt-1">From trial to paid enroll</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#172B50] opacity-70 block mb-1">
            Coach-to-Student Ratio
          </span>
          <h3 className="text-3xl font-extrabold text-[#172B50]">1 : 8.5</h3>
          <p className="text-xs font-semibold text-[#172B50] opacity-75 mt-1">Olympic standard coaching</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#172B50] opacity-70 block mb-1">
            Parent Net Promoter (NPS)
          </span>
          <h3 className="text-3xl font-extrabold text-[#F4510B]">+84</h3>
          <p className="text-xs font-semibold text-[#172B50] opacity-75 mt-1">World-class benchmark</p>
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
        <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
          <div className="pb-3 border-b border-[#172B5012] mb-4">
            <h4 className="text-sm font-extrabold text-[#172B50]">Acquisition Channels & Lead Attribution</h4>
            <p className="text-xs text-[#172B50] opacity-70">Where new Spartan students come from</p>
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
                  <span className="text-[#172B50]">{item.source}</span>
                  <span className="text-[#F4510B]">{item.count} Leads ({item.pct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-[#FFF4E8] rounded-full overflow-hidden border border-[#172B5015]">
                  <div
                    style={{ width: `${item.pct}%` }}
                    className="h-full bg-[#172B50] rounded-full"
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
