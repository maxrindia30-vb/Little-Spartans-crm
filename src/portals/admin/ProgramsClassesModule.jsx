import React, { useEffect } from 'react';
import { Calendar, Users, Clock, UserCheck } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import SportsProgramsPage from './programs/SportsProgramsPage';
import TrainingBatchesPage from './programs/TrainingBatchesPage';
import ClassSchedulesPage from './programs/ClassSchedulesPage';
import CoachAssignmentsPage from './programs/CoachAssignmentsPage';

const MODULE_TABS = [
  { id: 'sports_programs', label: 'Sports Programs', icon: Calendar },
  { id: 'batches', label: 'Training Batches', icon: Users },
  { id: 'schedules', label: 'Class Schedules', icon: Clock },
  { id: 'coach_assignments', label: 'Coach Assignments', icon: UserCheck },
];

export default function ProgramsClassesModule() {
  const { currentView, activeSubTab, setActiveSubTab } = useCrm();

  const resolvedTab = MODULE_TABS.some((t) => t.id === activeSubTab)
    ? activeSubTab
    : currentView === 'batches'
    ? 'batches'
    : currentView === 'schedules'
    ? 'schedules'
    : 'sports_programs';

  useEffect(() => {
    if (activeSubTab !== resolvedTab && setActiveSubTab) {
      setActiveSubTab(resolvedTab);
    }
  }, [activeSubTab, resolvedTab, setActiveSubTab]);

  return (
    <div className="space-y-5">
      {/* Compact Breadcrumb / Module Indicator Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#172B50] text-white px-4 py-2.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-white/70">Programs & Classes</span>
          <span className="text-white/40">/</span>
          <span className="font-extrabold text-[#F4510B]">
            {MODULE_TABS.find((t) => t.id === resolvedTab)?.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {MODULE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = resolvedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#F4510B] text-white shadow-xs'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dedicated Management Page per Module */}
      {resolvedTab === 'sports_programs' && (
        <SportsProgramsPage onNavigateModule={(targetTab) => setActiveSubTab(targetTab)} />
      )}
      {resolvedTab === 'batches' && (
        <TrainingBatchesPage onNavigateModule={(targetTab) => setActiveSubTab(targetTab)} />
      )}
      {resolvedTab === 'schedules' && <ClassSchedulesPage />}
      {resolvedTab === 'coach_assignments' && <CoachAssignmentsPage />}
    </div>
  );
}
