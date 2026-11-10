import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Calendar, 
  Users, 
  Plus, 
  Search, 
  Medal, 
  CheckCircle2, 
  Download, 
  Printer,
  Sparkles
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import CompetitionsModule from './CompetitionsModule';
import CertificatesModule from './CertificatesModule';

export default function SportsEventsModule() {
  const { data, activeSubTab, setActiveSubTab } = useCrm();

  // Active subtab: 'competitions' | 'registrations' | 'results' | 'certificates'
  const currentTab = activeSubTab || 'competitions';

  return (
    <div className="space-y-6">
      {/* Module Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#172B501A] pb-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Sports & Tournaments
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Championships, student squad registrations, podium results and merit certificates
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#172B5018] shadow-xs self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveSubTab('competitions')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'competitions'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Tournaments & Cups ({data.competitions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('registrations')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'registrations'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Squad Rosters</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('results')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'results'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <Medal className="w-4 h-4" />
            <span>Podium Results</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('certificates')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'certificates'
                ? 'bg-[#172B50] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <Award className="w-4 h-4 text-[#F4510B]" />
            <span>Certificates ({data.certificates.length})</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Competitions Module */}
      {currentTab === 'competitions' && (
        <CompetitionsModule />
      )}

      {/* SUBTAB 2: Squad Registrations */}
      {currentTab === 'registrations' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
            <h2 className="text-base font-extrabold text-[#172B50] mb-4">Confirmed Tournament Registrations</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF4E8] text-[#172B50] font-bold uppercase tracking-wider text-[11px] border-b border-[#172B501A]">
                  <tr>
                    <th className="px-5 py-3.5">Athlete</th>
                    <th className="px-4 py-3.5">Discipline</th>
                    <th className="px-4 py-3.5">Registered Tournament</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B5012]">
                  {data.students.slice(0, 5).map((s, idx) => (
                    <tr key={s.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-[#172B50]">{s.name}</td>
                      <td className="px-4 py-3.5">{s.program}</td>
                      <td className="px-4 py-3.5 font-semibold text-[#F4510B]">
                        {data.competitions[idx % data.competitions.length].title}
                      </td>
                      <td className="px-4 py-3.5 font-medium">Under-{s.age + 1} Division</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Confirmed & Cleared
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Podium Results */}
      {currentTab === 'results' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
            <h2 className="text-base font-extrabold text-[#172B50] mb-4">Latest Tournament Honors & Medals</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                <span className="text-2xl block mb-1">🥇</span>
                <span className="font-extrabold text-sm text-[#172B50] block">Ananya Nair</span>
                <p className="text-xs text-[#172B50]/80 mt-1">1st Place - 100m Sprint Under-10</p>
                <span className="text-[10px] font-bold text-amber-700 mt-2 block">State Athletics Championship</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-2xl block mb-1">🥈</span>
                <span className="font-extrabold text-sm text-[#172B50] block">Aarav Sharma</span>
                <p className="text-xs text-[#172B50]/80 mt-1">Silver Medal - Agility Course Time Trial</p>
                <span className="text-[10px] font-bold text-slate-700 mt-2 block">Bangalore Junior Cup</span>
              </div>
              <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/50">
                <span className="text-2xl block mb-1">🥉</span>
                <span className="font-extrabold text-sm text-[#172B50] block">Dev Mehta</span>
                <p className="text-xs text-[#172B50]/80 mt-1">Bronze Medal - 3-Point Shootout</p>
                <span className="text-[10px] font-bold text-orange-700 mt-2 block">Whitefield Hoops League</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Certificates Module */}
      {currentTab === 'certificates' && (
        <CertificatesModule />
      )}
    </div>
  );
}
