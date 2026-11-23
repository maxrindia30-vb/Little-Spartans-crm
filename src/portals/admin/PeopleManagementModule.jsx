import React, { useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import StudentManagement from './StudentManagement';
import ParentManagement from './ParentManagement';
import CoachManagement from './CoachManagement';

export default function PeopleManagementModule() {
  const { 
    data, 
    currentView,
    setCurrentView,
    activeSubTab, 
    setActiveSubTab
  } = useCrm();

  // Active tab: 'students' | 'parents' | 'coaches'
  const currentTab = 
    currentView === 'coaches' || activeSubTab === 'coaches'
      ? 'coaches'
      : currentView === 'parents' || activeSubTab === 'parents'
      ? 'parents'
      : 'students';

  // Synchronize activeSubTab if it got desynchronized
  useEffect(() => {
    if (activeSubTab !== currentTab && setActiveSubTab) {
      setActiveSubTab(currentTab);
    }
  }, [currentTab, activeSubTab, setActiveSubTab]);

  const tabConfigs = {
    students: {
      id: 'students',
      label: 'Kids',
      breadcrumb: 'Kids',
      title: 'Kids Management',
      subtitle: 'Manage enrolled student athletes, admission profiles, batch allocations and attendance',
      icon: GraduationCap,
      count: data.students?.length || 0,
    },
    parents: {
      id: 'parents',
      label: 'Parents',
      breadcrumb: 'Parents',
      title: 'Parents Management',
      subtitle: 'Admin oversight for Spartan families, fee schedules, linked children, credentials and communications',
      icon: Users,
      count: data.parents?.length || 0,
    },
    coaches: {
      id: 'coaches',
      label: 'Coaches',
      breadcrumb: 'Coaches',
      title: 'Coaches Management',
      subtitle: 'Faculty roster, certifications, assigned locations, batches and evaluations',
      icon: UserCheck,
      count: data.coaches?.length || 0,
    },
  };

  const currentConfig = tabConfigs[currentTab] || tabConfigs.students;
  const ActiveIcon = currentConfig.icon;

  const handleSelectTab = (tabKey) => {
    if (setActiveSubTab) {
      setActiveSubTab(tabKey);
    }
    setCurrentView('people', tabKey);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-[#172B50]/65 font-medium select-none pt-0.5">
        <button
          type="button"
          onClick={() => setCurrentView('dashboard')}
          className="hover:text-[#F4510B] transition-colors cursor-pointer"
        >
          Admin Portal
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#172B50]/35 shrink-0" />
        <button
          type="button"
          onClick={() => handleSelectTab('students')}
          className="hover:text-[#F4510B] transition-colors cursor-pointer"
        >
          People Management
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#172B50]/35 shrink-0" />
        <span className="text-[#F4510B] font-bold">
          {currentConfig.breadcrumb}
        </span>
      </div>

      {/* Module Header & Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#F4510B] text-white flex items-center justify-center shrink-0 shadow-sm">
            <ActiveIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight">
              {currentConfig.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#172B50]/75 mt-0.5">
              {currentConfig.subtitle}
            </p>
          </div>
        </div>

        {/* Tab Switcher: 3 clean tabs (Kids, Parents, Coaches) */}
        <div className="flex items-center gap-2 self-start lg:self-auto overflow-x-auto max-w-full bg-white/80 p-1 rounded-full border border-[#172B5018] shadow-2xs">
          <button
            type="button"
            onClick={() => handleSelectTab('students')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer shadow-2xs ${
              currentTab === 'students'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'bg-transparent text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Kids ({data.students?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('parents')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer shadow-2xs ${
              currentTab === 'parents'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'bg-transparent text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Parents ({data.parents?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('coaches')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer shadow-2xs ${
              currentTab === 'coaches'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'bg-transparent text-[#172B50] hover:bg-[#FFF4E8]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Coaches ({data.coaches?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Render Active Subtab Content */}
      {currentTab === 'students' && <StudentManagement />}
      {currentTab === 'parents' && <ParentManagement />}
      {currentTab === 'coaches' && <CoachManagement />}
    </div>
  );
}
