import React, { useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  User
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import StudentManagement from './StudentManagement';
import ParentManagement from './ParentManagement';
import CoachManagement from './CoachManagement';

export default function PeopleManagementModule() {
  const { 
    data, 
    currentView,
    activeSubTab, 
    setActiveSubTab
  } = useCrm();

  // Active tab: 'students' | 'parents' | 'coaches'
  const currentTab = currentView === 'coaches' 
    ? 'coaches'
    : currentView === 'parents'
    ? 'parents'
    : currentView === 'students' 
    ? 'students' 
    : (['students', 'parents', 'coaches'].includes(activeSubTab) ? activeSubTab : 'students');

  useEffect(() => {
    if (['students', 'parents', 'coaches'].includes(currentView)) {
      setActiveSubTab(currentView);
    } else if (!activeSubTab || !['students', 'parents', 'coaches'].includes(activeSubTab)) {
      setActiveSubTab('students');
    }
  }, [currentView, activeSubTab, setActiveSubTab]);

  return (
    <div className="space-y-6">
      {/* Module Navigation Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#F4510B] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight">
              People &amp; Access Management
            </h1>
            <p className="text-xs sm:text-sm text-[#172B50]/75 mt-0.5">
              Admin oversight for Students, Guardians, Coaches and Role-based Login Access
            </p>
          </div>
        </div>

        {/* Tab Switcher: 3 clean tabs (Students, Parents, Coaches) */}
        <div className="flex items-center gap-2 self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveSubTab('students')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer shadow-2xs ${
              currentTab === 'students'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'bg-white text-[#172B50] border border-[#172B5018] hover:bg-[#FFF4E8]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Students ({data.students.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('parents')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer shadow-2xs ${
              currentTab === 'parents'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'bg-white text-[#172B50] border border-[#172B5018] hover:bg-[#FFF4E8]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Parents ({data.parents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('coaches')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer shadow-2xs ${
              currentTab === 'coaches'
                ? 'bg-[#F4510B] text-white shadow-xs'
                : 'bg-white text-[#172B50] border border-[#172B5018] hover:bg-[#FFF4E8]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Coaches ({data.coaches.length})</span>
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
