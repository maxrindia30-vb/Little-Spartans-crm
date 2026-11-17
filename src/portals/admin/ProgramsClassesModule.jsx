import React, { useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  UserCheck, 
  Search, 
  Bell, 
  Upload, 
  CalendarDays 
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import TrainingBatchesPage from './programs/TrainingBatchesPage';
import ClassSchedulesPage from './programs/ClassSchedulesPage';
import CoachAssignmentsPage from './programs/CoachAssignmentsPage';

const MODULE_TABS = [
  { id: 'batches', label: 'Training Batches', icon: Users },
  { id: 'schedules', label: 'Class Schedules', icon: Calendar },
  { id: 'coach_assignments', label: 'Coach Assignments', icon: UserCheck },
];

export default function ProgramsClassesModule() {
  const { currentView, activeSubTab, setActiveSubTab } = useCrm();

  const resolvedTab = MODULE_TABS.some((t) => t.id === activeSubTab)
    ? activeSubTab
    : currentView === 'schedules'
    ? 'schedules'
    : currentView === 'coach_assignments'
    ? 'coach_assignments'
    : 'batches';

  useEffect(() => {
    if (activeSubTab !== resolvedTab && setActiveSubTab) {
      setActiveSubTab(resolvedTab);
    }
  }, [activeSubTab, resolvedTab, setActiveSubTab]);

  return (
    <div className="space-y-5">
      {/* Top Header Row matching Reference UI/UX */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-1">
        {/* Left: Heading & Subtitle */}
        <div className="shrink-0">
          <h1 className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight flex items-center gap-2">
            Program &amp; Classes{' '}
            <span className="inline-block hover:rotate-12 transition-transform cursor-default select-none">
              👋
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#172B50]/65 mt-0.5">
            Dashboard
          </p>
        </div>

        {/* Center: Navigation Tabs in the same header row */}
        <div className="flex items-center bg-white p-1 rounded-full border border-[#172B5018] shadow-2xs self-start xl:self-center overflow-x-auto max-w-full">
          {MODULE_TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = resolvedTab === tab.id;
            return (
              <React.Fragment key={tab.id}>
                {idx > 0 && <span className="w-px h-4 bg-[#172B5018] mx-1 shrink-0" />}
                <button
                  type="button"
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F4510B] text-white shadow-xs'
                      : 'text-[#172B50] hover:bg-[#FFF4E8] hover:text-[#F4510B]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Right side: Action icons (Search, Notifications, Profile, Upload, Calendar) */}
        <div className="flex items-center gap-2.5 self-end xl:self-center shrink-0">
          {/* Search Icon */}
          <button
            type="button"
            title="Search"
            className="w-9 h-9 rounded-full bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B]/40 shadow-2xs transition-all cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#172B50]" />
          </button>

          {/* Notifications Icon with Badge 17 */}
          <div className="relative">
            <button
              type="button"
              title="Notifications"
              className="w-9 h-9 rounded-full bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B]/40 shadow-2xs transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4 text-[#172B50]" />
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F4510B] text-white text-[9px] font-black flex items-center justify-center shadow-xs pointer-events-none">
              17
            </span>
          </div>

          {/* User Profile Avatar */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
              alt="Admin Profile"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#F4510B30] shadow-2xs cursor-pointer hover:ring-[#F4510B] transition-all"
              title="Commander Vikramaditya"
            />
          </div>

          {/* Upload Icon */}
          <button
            type="button"
            title="Upload"
            className="w-9 h-9 rounded-full bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B]/40 shadow-2xs transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#172B50]" />
          </button>

          {/* Calendar Icon */}
          <button
            type="button"
            title="Calendar"
            className="w-9 h-9 rounded-full bg-white border border-[#172B5018] flex items-center justify-center text-[#172B50] hover:bg-[#FFF4E8] hover:border-[#F4510B]/40 shadow-2xs transition-all cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 text-[#172B50]" />
          </button>
        </div>
      </div>

      {/* Dedicated Management Page per Module */}
      {resolvedTab === 'batches' && (
        <TrainingBatchesPage onNavigateModule={(targetTab) => setActiveSubTab(targetTab)} />
      )}
      {resolvedTab === 'schedules' && <ClassSchedulesPage />}
      {resolvedTab === 'coach_assignments' && <CoachAssignmentsPage />}
    </div>
  );
}
