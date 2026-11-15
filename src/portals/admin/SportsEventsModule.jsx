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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#493548]/20 pb-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#080B0C] tracking-tight">
            Sports & Tournaments
          </h1>
          <p className="text-xs sm:text-sm text-[#080B0C] opacity-75 mt-0.5">
            Championships, student squad registrations, podium results and merit certificates
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4F7F6] rounded-xl border border-[#493548]/20 shadow-xs self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveSubTab('competitions')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'competitions'
                ? 'bg-[#55CDB3] text-[#080B0C] font-bold shadow-xs'
                : 'text-[#080B0C] hover:bg-[#55CDB3]/15'
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
                ? 'bg-[#55CDB3] text-[#080B0C] font-bold shadow-xs'
                : 'text-[#080B0C] hover:bg-[#55CDB3]/15'
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
                ? 'bg-[#55CDB3] text-[#080B0C] font-bold shadow-xs'
                : 'text-[#080B0C] hover:bg-[#55CDB3]/15'
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
                ? 'bg-[#080B0C] text-[#F4F7F6] shadow-xs'
                : 'text-[#080B0C] hover:bg-[#55CDB3]/15'
            }`}
          >
            <Award className="w-4 h-4 text-[#55CDB3]" />
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
          <div className="bg-[#F4F7F6] rounded-2xl p-5 border border-[#493548]/20 shadow-card">
            <h2 className="text-base font-extrabold text-[#080B0C] mb-4">Confirmed Tournament Registrations</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#493548]/15 text-[#080B0C] font-bold uppercase tracking-wider text-[11px] border-b border-[#493548]/20">
                  <tr>
                    <th className="px-5 py-3.5">Athlete</th>
                    <th className="px-4 py-3.5">Discipline</th>
                    <th className="px-4 py-3.5">Registered Tournament</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#493548]/15">
                  {data.students.slice(0, 5).map((s, idx) => (
                    <tr key={s.id} className="hover:bg-[#55CDB3]/15/20 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-[#080B0C]">{s.name}</td>
                      <td className="px-4 py-3.5">{s.program}</td>
                      <td className="px-4 py-3.5 font-semibold text-[#55CDB3]">
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
          <div className="bg-[#F4F7F6] rounded-2xl p-5 border border-[#493548]/20 shadow-card">
            <h2 className="text-base font-extrabold text-[#080B0C] mb-4">Latest Tournament Honors & Medals</h2>
            {data.competitions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#080B0C] opacity-65">
                No tournament results recorded yet. Create a competition and record results to view honors here.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.competitions.slice(0, 3).map(comp => (
                  <div key={comp.id} className="p-4 rounded-xl border border-[#493548]/20 bg-[#493548]/15/40">
                    <span className="font-extrabold text-sm text-[#080B0C] block">{comp.title}</span>
                    <p className="text-xs text-[#080B0C]/80 mt-1">{comp.sport} • {comp.venue}</p>
                    <span className="text-[10px] font-bold text-[#55CDB3] mt-2 block">{comp.status}</span>
                  </div>
                ))}
              </div>
            )}
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
