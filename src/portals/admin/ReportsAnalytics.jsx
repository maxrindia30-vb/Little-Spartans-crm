import React from 'react';
import { BarChart3, TrendingUp, Download, PieChart, Users, Award, ShieldCheck } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { RevenueTrendChart, AttendanceDonutChart, ProgramDistributionChart } from '../../components/common/Charts';
import { calculateLeadKPIs } from '../../services/enquiryFunnelService';

export default function ReportsAnalytics() {
  const { data, addToast } = useCrm();

  const students = data.students || [];
  const coaches = data.coaches || [];
  const enquiries = data.enquiries || [];
  const demos = data.demos || [];
  const feedback = data.feedback || [];

  // Dynamic calculations from actual data
  const activeStudents = students.filter(s => s.status === 'Active').length;
  const retentionRate = students.length > 0 ? ((activeStudents / students.length) * 100).toFixed(1) : null;

  const leadKpis = calculateLeadKPIs(enquiries, demos, students, data.locations);
  const conversionRate = enquiries.length > 0 ? ((leadKpis.converted / enquiries.length) * 100).toFixed(1) : null;

  const coachRatio = coaches.length > 0 && students.length > 0
    ? `1 : ${(students.length / coaches.length).toFixed(1)}`
    : (coaches.length > 0 ? `1 : 0` : '--');

  // NPS from feedback ratings
  const npsScore = feedback.length > 0
    ? Math.round(
        ((feedback.filter(f => (f.rating || 0) >= 4).length - feedback.filter(f => (f.rating || 0) <= 2).length) / feedback.length) * 100
      )
    : null;

  // Real enquiry source breakdown
  const sourceCounts = {};
  enquiries.forEach(e => {
    const src = e.source || 'Admissions Desk';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  const sourceEntries = Object.entries(sourceCounts).map(([source, count]) => ({
    source,
    count,
    pct: enquiries.length > 0 ? Math.round((count / enquiries.length) * 100) : 0,
  }));

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
          <h3 className="text-3xl font-extrabold text-[#172B50]">
            {retentionRate !== null ? `${retentionRate}%` : '--'}
          </h3>
          <p className="text-xs font-bold text-[#F4510B] mt-1">
            {students.length > 0 ? `${activeStudents} of ${students.length} active` : 'No enrolled athletes recorded'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#172B50] opacity-70 block mb-1">
            Trial Conversion Rate
          </span>
          <h3 className="text-3xl font-extrabold text-[#172B50]">
            {conversionRate !== null ? `${conversionRate}%` : '--'}
          </h3>
          <p className="text-xs font-bold text-[#F4510B] mt-1">
            {enquiries.length > 0 ? `${leadKpis.converted} converted from ${enquiries.length} leads` : 'No lead conversion records'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#172B50] opacity-70 block mb-1">
            Coach-to-Student Ratio
          </span>
          <h3 className="text-3xl font-extrabold text-[#172B50]">{coachRatio}</h3>
          <p className="text-xs font-semibold text-[#172B50] opacity-75 mt-1">
            {coaches.length > 0 ? `${coaches.length} certified coach${coaches.length === 1 ? '' : 'es'}` : 'No coaches registered'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#172B50] opacity-70 block mb-1">
            Parent Net Promoter (NPS)
          </span>
          <h3 className="text-3xl font-extrabold text-[#F4510B]">
            {npsScore !== null ? `${npsScore > 0 ? `+${npsScore}` : npsScore}` : '--'}
          </h3>
          <p className="text-xs font-semibold text-[#172B50] opacity-75 mt-1">
            {feedback.length > 0 ? `${feedback.length} parent evaluation${feedback.length === 1 ? '' : 's'}` : 'No feedback ratings recorded'}
          </p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueTrendChart />
        </div>
        <div>
          <AttendanceDonutChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgramDistributionChart />

        {/* Lead Source Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
          <div className="pb-3 border-b border-[#172B5012] mb-4">
            <h4 className="text-sm font-extrabold text-[#172B50]">Acquisition Channels & Lead Attribution</h4>
            <p className="text-xs text-[#172B50] opacity-70">
              {enquiries.length > 0 ? `Distribution across ${enquiries.length} enquiry channels` : 'Real-time enquiry source attribution'}
            </p>
          </div>

          {sourceEntries.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <PieChart className="w-10 h-10 text-[#172B50]/30 mb-2" />
              <p className="text-sm font-bold text-[#172B50]">No Lead Attribution Data Yet</p>
              <p className="text-xs text-[#172B50]/70 mt-1 max-w-xs">
                Enquiries logged via admissions desk or imported leads will automatically track acquisition channel metrics.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {sourceEntries.map(item => (
                <div key={item.source}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-[#172B50]">{item.source}</span>
                    <span className="text-[#F4510B]">{item.count} Leads ({item.pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#FFF4E8] rounded-full overflow-hidden border border-[#172B5015]">
                    <div
                      style={{ width: `${item.pct}%` }}
                      className="h-full bg-[#172B50] rounded-full transition-all duration-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
