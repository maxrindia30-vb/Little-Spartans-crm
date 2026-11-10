import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Search, 
  UserCheck, 
  Award, 
  BookOpen, 
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import ProgramsClasses from './ProgramsClasses';

export default function ProgramsClassesModule() {
  const { data, activeSubTab, setActiveSubTab, addToast } = useCrm();

  // Active tab: 'sports_programs' | 'batches' | 'schedules' | 'coach_assignments'
  const currentTab = activeSubTab || 'sports_programs';

  const [searchQuery, setSearchQuery] = useState('');

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      {/* Module Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#172B501A] pb-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Programs & Classes
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Sports curriculum, arena batches, weekly schedules and coach allocations
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#172B5018] shadow-xs self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveSubTab('sports_programs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'sports_programs'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Sports Programs ({data.programs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('batches')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'batches'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Batches & Capacity ({data.classes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('schedules')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'schedules'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Class Timetable</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('coach_assignments')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'coach_assignments'
                ? 'bg-[#172B50] text-white shadow-xs'
                : 'text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#F4510B]" />
            <span>Coach Assignments</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1 & 2: Reuse existing refined ProgramsClasses view */}
      {(currentTab === 'sports_programs' || currentTab === 'batches') && (
        <ProgramsClasses />
      )}

      {/* SUBTAB 3: Class Timetable Calendar View */}
      {currentTab === 'schedules' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#172B5015] mb-5">
              <div>
                <h2 className="text-base font-extrabold text-[#172B50]">Weekly Arena Timetable</h2>
                <p className="text-xs text-[#172B50]/70 mt-0.5">All ongoing training slots across Bangalore centers</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-[#172B50]">5 Active Arena Locations</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.classes.map(cls => (
                <div key={cls.id} className="p-4 rounded-xl border border-[#172B5018] bg-[#FFF4E8]/30 hover:border-[#F4510B]/50 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#172B50] text-white">
                      {cls.program.split(' ')[1] || 'Spartan'}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {cls.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#172B50] mt-2">{cls.name}</h3>
                  <div className="mt-3 space-y-1.5 text-xs text-[#172B50]/80">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#F4510B]" />
                      <span>{cls.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#172B50]" />
                      <span>{cls.center}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-[#F4510B]" />
                      <span>{cls.coach}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#172B5010] flex items-center justify-between text-xs font-semibold text-[#172B50]">
                    <span>Enrolled: {cls.enrolled} / {cls.capacity}</span>
                    <span className="text-[#F4510B]">{Math.round((cls.enrolled / cls.capacity) * 100)}% Full</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Coach Assignments */}
      {currentTab === 'coach_assignments' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
            <h2 className="text-base font-extrabold text-[#172B50] mb-4">Discipline Coach Allocations</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF4E8] text-[#172B50] font-bold uppercase tracking-wider text-[11px] border-b border-[#172B501A]">
                  <tr>
                    <th className="px-5 py-3.5">Coach Name</th>
                    <th className="px-4 py-3.5">Primary Discipline</th>
                    <th className="px-4 py-3.5">Assigned Batches</th>
                    <th className="px-4 py-3.5">Arena Center</th>
                    <th className="px-4 py-3.5">Students</th>
                    <th className="px-4 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172B5012]">
                  {data.coaches.map(c => (
                    <tr key={c.id} className="hover:bg-[#FFF4E8]/20 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-[#172B50] text-[13px]">{c.name}</td>
                      <td className="px-4 py-3.5 text-[#F4510B] font-semibold">{c.specialization}</td>
                      <td className="px-4 py-3.5 font-medium">{c.activeBatches} Active Batches</td>
                      <td className="px-4 py-3.5">{c.center}</td>
                      <td className="px-4 py-3.5 font-bold text-[#172B50]">{c.studentsCount} Athletes</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {c.status}
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
    </div>
  );
}
