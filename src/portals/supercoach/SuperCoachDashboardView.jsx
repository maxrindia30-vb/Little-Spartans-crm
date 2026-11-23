import React from 'react';
import {
  MapPin,
  Users,
  UserCheck,
  Calendar,
  CalendarDays,
  Activity,
  Plus,
  CheckCircle2,
  Package,
  Clock,
  ArrowRight,
  AlertTriangle,
  BarChart2,
  Building2
} from 'lucide-react';

export default function SuperCoachDashboardView({
  kpis,
  scopedLocations,
  scopedStudents,
  scopedCoaches,
  locationFilteredCoaches,
  todayClasses,
  assignedLocations,
  setSelectedLocation,
  setActiveTab,
  setIsCreateScheduleModalOpen,
  handleOpenIssueModal,
  handleOpenReassign
}) {
  return (
    <div className="space-y-4 sm:space-y-4.5 animate-slide-up">
      
      {/* ============================================================ */}
      {/* 1. TOP SUMMARY CARDS (4 COMPACT HORIZONTAL CARDS)            */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        
        {/* 1. Authorized Locations */}
        <div 
          onClick={() => setActiveTab('locations')}
          className="bg-[#FFF9F5] rounded-2xl p-3.5 border border-[#F4510B18] shadow-2xs flex items-center justify-between hover:border-[#F4510B35] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFF5ED] text-[#F4510B] border border-[#F4510B22] flex items-center justify-center shrink-0 shadow-2xs">
              <MapPin className="w-4.5 h-4.5 text-[#F4510B]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#172B50]/70 block leading-tight">
                Authorized Locations
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#172B50] leading-none mt-1 block">
                {kpis.assignedLocationsCount}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-black bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
            Active
          </span>
        </div>

        {/* 2. Faculty & Coaches */}
        <div 
          onClick={() => setActiveTab('coaches')}
          className="bg-[#FAF5FF] rounded-2xl p-3.5 border border-[#8B5CF618] shadow-2xs flex items-center justify-between hover:border-[#8B5CF635] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE] flex items-center justify-center shrink-0 shadow-2xs">
              <Users className="w-4.5 h-4.5 text-[#7C3AED]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#172B50]/70 block leading-tight">
                Faculty & Coaches
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#172B50] leading-none mt-1 block">
                {locationFilteredCoaches.length}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-black bg-[#EDE9FE] text-[#7C3AED] border border-[#DDD6FE]">
            {locationFilteredCoaches.length === 0 ? 'Unassigned' : 'Assigned'}
          </span>
        </div>

        {/* 3. Class Schedule */}
        <div 
          onClick={() => setActiveTab('schedules')}
          className="bg-[#F4FDF7] rounded-2xl p-3.5 border border-[#16A34A18] shadow-2xs flex items-center justify-between hover:border-[#16A34A35] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] flex items-center justify-center shrink-0 shadow-2xs">
              <Calendar className="w-4.5 h-4.5 text-[#16A34A]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#172B50]/70 block leading-tight">
                Class Schedule
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#172B50] leading-none mt-1 block">
                {todayClasses.length}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-black bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
            Today
          </span>
        </div>

        {/* 4. Operations Command */}
        <div 
          onClick={() => setActiveTab('reports')}
          className="bg-[#FFF9F5] rounded-2xl p-3.5 border border-[#F4510B18] shadow-2xs flex items-center justify-between hover:border-[#F4510B35] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFF5ED] text-[#F4510B] border border-[#F4510B22] flex items-center justify-center shrink-0 shadow-2xs">
              <Activity className="w-4.5 h-4.5 text-[#F4510B]" />
            </div>
            <div>
              <span className="text-xs font-black text-[#172B50] block leading-tight">
                Operations Command
              </span>
              <span className="text-[11px] font-medium text-[#172B50]/60 block leading-tight mt-0.5">
                Super Coach execution
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. FOUR MAIN DASHBOARD CARDS IN ONE HORIZONTAL ROW           */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 items-stretch">
        
        {/* Card A: Authorized Locations */}
        <div className="bg-[#FFF9F5] rounded-[22px] p-4 border border-[#F4510B18] shadow-2xs flex flex-col justify-between h-[300px]">
          <div>
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#172B500C]">
              <div className="w-7 h-7 rounded-lg bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
              </div>
              <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                Authorized Locations
              </h3>
            </div>

            {scopedLocations.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white text-[#F4510B] flex items-center justify-center mb-1.5 shadow-2xs">
                  <MapPin className="w-5 h-5 text-[#F4510B]" />
                </div>
                <p className="text-xs font-black text-[#172B50]">No authorized centers</p>
              </div>
            ) : (
              <div className="py-2 space-y-1.5 max-h-[195px] overflow-y-auto scrollbar-thin pr-0.5">
                {scopedLocations.map((loc) => {
                  const locStudents = scopedStudents.filter(s => s.center === loc.name).length;
                  const locCoaches = scopedCoaches.filter(c => c.center === loc.name).length;
                  return (
                    <div
                      key={loc.id}
                      className="bg-white/90 rounded-xl px-2.5 py-1.5 border border-[#172B500A] flex items-center justify-between gap-2 shadow-2xs hover:border-[#F4510B25] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-[11.5px] font-black text-[#172B50] leading-tight truncate">
                          {loc.name}
                        </p>
                        <p className="text-[10px] font-medium text-[#172B50]/60 mt-0.5 truncate leading-tight">
                          {locStudents} Athletes • {locCoaches} Coaches
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedLocation(loc.name)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-[#FFF4E8] text-[#F4510B] hover:bg-[#F4510B] hover:text-white transition-colors cursor-pointer shrink-0"
                      >
                        Focus
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-[11px] font-bold shrink-0">
            <span className="text-[#172B50]/60 uppercase tracking-wider text-[10px]">
              Location Scope
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('locations')}
              className="text-[#F4510B] hover:text-[#d44105] flex items-center gap-1 cursor-pointer"
            >
              <span>View Hub ({scopedLocations.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card B: Faculty & Coaches */}
        <div className="bg-[#F4FAFF] rounded-[22px] p-4 border border-[#0284C718] shadow-2xs flex flex-col justify-between h-[300px]">
          <div>
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#172B500C]">
              <div className="w-7 h-7 rounded-lg bg-white text-[#0284C7] flex items-center justify-center shrink-0 shadow-2xs">
                <UserCheck className="w-3.5 h-3.5 text-[#0284C7]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#172B50] tracking-tight leading-tight">
                  Faculty & Coaches
                </h3>
                <p className="text-[10px] font-medium text-[#172B50]/60 leading-tight">
                  Supervised faculty team
                </p>
              </div>
            </div>

            {locationFilteredCoaches.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white text-[#0284C7] flex items-center justify-center mb-1.5 shadow-2xs">
                  <Users className="w-5 h-5 text-[#0284C7]" />
                </div>
                <p className="text-xs font-black text-[#172B50]">No coaches assigned</p>
              </div>
            ) : (
              <div className="py-2 space-y-1.5 max-h-[195px] overflow-y-auto scrollbar-thin pr-0.5">
                {locationFilteredCoaches.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white/90 rounded-xl px-2.5 py-1.5 border border-[#172B500A] flex items-center justify-between gap-2 shadow-2xs hover:border-[#0284C725] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-[11.5px] font-black text-[#172B50] leading-tight truncate">
                        {c.name}
                      </p>
                      <p className="text-[10px] font-medium text-[#172B50]/60 mt-0.5 truncate leading-tight">
                        {c.center} • {c.specialization} ({c.rating}★)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenIssueModal(c)}
                      className="w-6 h-6 rounded-lg bg-white border border-[#172B5015] flex items-center justify-center text-rose-600 hover:bg-rose-50 transition-all cursor-pointer shrink-0"
                      title="Report Faculty Issue"
                    >
                      <AlertTriangle className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-[11px] font-bold shrink-0">
            <span className="text-[#172B50]/60 uppercase tracking-wider text-[10px]">
              Staff Oversight
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('coaches')}
              className="text-[#0284C7] hover:text-[#0369a1] flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Faculty ({locationFilteredCoaches.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card C: Class Schedule */}
        <div className="bg-[#F4FDF7] rounded-[22px] p-4 border border-[#16A34A18] shadow-2xs flex flex-col justify-between h-[300px]">
          <div>
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#172B500C]">
              <div className="w-7 h-7 rounded-lg bg-white text-[#16A34A] flex items-center justify-center shrink-0 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-[#16A34A]" />
              </div>
              <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                Class Schedule
              </h3>
            </div>

            {todayClasses.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white text-[#16A34A] flex items-center justify-center mb-1.5 shadow-2xs">
                  <Clock className="w-5 h-5 text-[#16A34A]" />
                </div>
                <p className="text-xs font-black text-[#172B50]">No classes today</p>
                <button
                  type="button"
                  onClick={() => setIsCreateScheduleModalOpen(true)}
                  className="mt-2.5 px-3 py-1 text-[11px] font-bold text-[#16A34A] bg-white border border-[#16A34A30] hover:bg-[#16A34A] hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  + Create Class
                </button>
              </div>
            ) : (
              <div className="py-2 space-y-1.5 max-h-[195px] overflow-y-auto scrollbar-thin pr-0.5">
                {todayClasses.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/90 rounded-xl px-2.5 py-1.5 border border-[#172B500A] flex items-center justify-between gap-2 shadow-2xs hover:border-[#16A34A25] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-[11.5px] font-black text-[#172B50] leading-tight truncate">
                        {item.startTime} • {item.className || item.batch}
                      </p>
                      <p className="text-[10px] font-medium text-[#172B50]/60 mt-0.5 truncate leading-tight">
                        {item.location} • {item.coachName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenReassign(item)}
                      className="px-2 py-0.5 rounded-lg text-[9.5px] font-bold bg-[#172B500C] text-[#172B50] hover:bg-[#F4510B] hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      Reassign
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-[11px] font-bold shrink-0">
            <span className="text-[#172B50]/60 uppercase tracking-wider text-[10px]">
              Class Schedule
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('schedules')}
              className="text-[#16A34A] hover:text-[#15803d] flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({todayClasses.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card D: Operations Command */}
        <div className="bg-white rounded-[22px] p-4 border border-[#172B5012] shadow-2xs flex flex-col justify-between h-[300px]">
          <div>
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#172B500C]">
              <div className="w-7 h-7 rounded-lg bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0 shadow-2xs">
                <Activity className="w-3.5 h-3.5 text-[#F4510B]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#172B50] tracking-tight leading-tight">
                  Operations Command
                </h3>
                <p className="text-[10px] font-medium text-[#172B50]/60 leading-tight">
                  Super Coach execution
                </p>
              </div>
            </div>

            <div className="py-2">
              <div className="grid grid-cols-2 gap-2">
                {/* Tile 1: Create Class */}
                <button
                  type="button"
                  onClick={() => setIsCreateScheduleModalOpen(true)}
                  className="bg-[#0B3B60] text-white rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-2xs hover:bg-[#082d4a] active:scale-95 transition-all cursor-pointer min-h-[84px] group"
                >
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <Plus className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[11px] font-black text-white leading-tight">
                    Create Class
                  </span>
                </button>

                {/* Tile 2: Attendance */}
                <button
                  type="button"
                  onClick={() => setActiveTab('attendance')}
                  className="bg-white text-[#172B50] rounded-xl p-2.5 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[84px] group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#FFF4E8] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#172B50]" />
                  </div>
                  <span className="text-[11px] font-black text-[#172B50] leading-tight">
                    Attendance
                  </span>
                </button>

                {/* Tile 3: Equipment */}
                <button
                  type="button"
                  onClick={() => setActiveTab('equipment')}
                  className="bg-white text-[#172B50] rounded-xl p-2.5 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#F0FDF4] active:scale-95 transition-all cursor-pointer min-h-[84px] group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <Package className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-[11px] font-black text-[#172B50] leading-tight">
                    Equipment
                  </span>
                </button>

                {/* Tile 4: Location Hub */}
                <button
                  type="button"
                  onClick={() => setActiveTab('locations')}
                  className="bg-white text-[#172B50] rounded-xl p-2.5 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#172B5035] hover:bg-[#F0F7FF] active:scale-95 transition-all cursor-pointer min-h-[84px] group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#F0F7FF] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <MapPin className="w-3.5 h-3.5 text-[#0284C7]" />
                  </div>
                  <span className="text-[11px] font-black text-[#172B50] leading-tight">
                    Location Hub
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-[#172B500C] flex items-center justify-between text-[11px] font-bold shrink-0">
            <span className="text-[#172B50]/60 uppercase tracking-wider text-[10px]">
              Quick Access
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className="text-[#172B50] hover:text-[#F4510B] flex items-center gap-1 cursor-pointer"
            >
              <span>Reports & Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. BOTTOM DASHBOARD SECTION (3 COMPACT CARDS IN ONE ROW)     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 items-stretch">
        
        {/* Bottom Card A: Today's Classes */}
        <div className="bg-white rounded-[22px] p-4 sm:p-4.5 border border-[#172B5012] shadow-2xs flex flex-col justify-between h-[230px]">
          <div>
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#172B500C]">
              <div className="w-7 h-7 rounded-lg bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0 shadow-2xs">
                <CalendarDays className="w-3.5 h-3.5 text-[#F4510B]" />
              </div>
              <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                Today's Classes
              </h3>
            </div>

            {todayClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center mb-1 shadow-2xs">
                  <CalendarDays className="w-4.5 h-4.5" />
                </div>
                <p className="text-xs font-black text-[#172B50]">No classes scheduled for today</p>
                <p className="text-[10.5px] text-[#172B50]/60 mt-0.5 max-w-[220px]">
                  Active classes across your centers will appear here
                </p>
              </div>
            ) : (
              <div className="py-1 max-h-[135px] overflow-y-auto space-y-1.5 scrollbar-thin pr-0.5">
                {todayClasses.slice(0, 3).map((cls) => (
                  <div key={cls.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="min-w-0">
                      <span className="font-bold text-[#172B50] block truncate">
                        {cls.startTime} • {cls.className || cls.batch}
                      </span>
                      <span className="text-[10px] text-[#172B50]/60 truncate block">
                        {cls.location} • Coach: {cls.coachName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenReassign(cls)}
                      className="px-2 py-0.5 rounded-lg text-[9.5px] font-bold bg-[#FFF4E8] text-[#F4510B] hover:bg-[#F4510B] hover:text-white transition-colors shrink-0"
                    >
                      Reassign
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#172B500C] flex items-center justify-between text-[11px] font-bold shrink-0">
            <span className="text-[#172B50]/60 uppercase tracking-wider text-[10px]">
              Daily Timetable
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('schedules')}
              className="text-[#F4510B] hover:text-[#d44307] flex items-center gap-1 cursor-pointer"
            >
              <span>Explore all classes</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Bottom Card B: Operations Performance */}
        <div className="bg-white rounded-[22px] p-4 sm:p-4.5 border border-[#172B5012] shadow-2xs flex flex-col justify-between h-[230px]">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#172B500C]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0 shadow-2xs">
                  <BarChart2 className="w-3.5 h-3.5 text-[#F4510B]" />
                </div>
                <h3 className="text-sm font-black text-[#172B50] tracking-tight">
                  Operations Performance
                </h3>
              </div>
              <span className="text-[10px] font-black text-[#F4510B] bg-[#FFF5ED] px-2 py-0.5 rounded-full border border-[#F4510B20]">
                {kpis.totalClasses} Sessions
              </span>
            </div>

            <div className="py-2.5">
              <div className="grid grid-cols-4 gap-2">
                {/* KPI 1: Locations */}
                <div 
                  onClick={() => setActiveTab('locations')}
                  className="p-2 rounded-xl bg-[#F0F7FF] border border-[#0284C720] text-center cursor-pointer hover:border-[#0284C750] transition-colors"
                >
                  <div className="flex items-center justify-center gap-1 text-[#0284C7] mb-0.5">
                    <MapPin className="w-3 h-3 text-[#0284C7]" />
                    <span className="text-[9.5px] font-bold text-[#172B50]">Locations</span>
                  </div>
                  <strong className="text-base sm:text-lg font-black text-[#172B50] block leading-tight">
                    {kpis.assignedLocationsCount}
                  </strong>
                  <span className="text-[8.5px] font-bold text-[#172B50]/55 uppercase tracking-tight block mt-0.5">
                    Centers
                  </span>
                </div>

                {/* KPI 2: Faculty */}
                <div 
                  onClick={() => setActiveTab('coaches')}
                  className="p-2 rounded-xl bg-[#FAF5FF] border border-[#9333EA20] text-center cursor-pointer hover:border-[#9333EA50] transition-colors"
                >
                  <div className="flex items-center justify-center gap-1 text-[#9333EA] mb-0.5">
                    <Users className="w-3 h-3 text-[#9333EA]" />
                    <span className="text-[9.5px] font-bold text-[#172B50]">Faculty</span>
                  </div>
                  <strong className="text-base sm:text-lg font-black text-[#172B50] block leading-tight">
                    {locationFilteredCoaches.length}
                  </strong>
                  <span className="text-[8.5px] font-bold text-[#172B50]/55 uppercase tracking-tight block mt-0.5">
                    Coaches
                  </span>
                </div>

                {/* KPI 3: Today */}
                <div 
                  onClick={() => setActiveTab('schedules')}
                  className="p-2 rounded-xl bg-[#F0FDF4] border border-[#16A34A20] text-center cursor-pointer hover:border-[#16A34A50] transition-colors"
                >
                  <div className="flex items-center justify-center gap-1 text-[#16A34A] mb-0.5">
                    <Clock className="w-3 h-3 text-[#16A34A]" />
                    <span className="text-[9.5px] font-bold text-[#172B50]">Today</span>
                  </div>
                  <strong className="text-base sm:text-lg font-black text-[#172B50] block leading-tight">
                    {todayClasses.length}
                  </strong>
                  <span className="text-[8.5px] font-bold text-[#172B50]/55 uppercase tracking-tight block mt-0.5">
                    Classes
                  </span>
                </div>

                {/* KPI 4: Equipment */}
                <div 
                  onClick={() => setActiveTab('equipment')}
                  className="p-2 rounded-xl bg-[#FFF5ED] border border-[#F4510B20] text-center cursor-pointer hover:border-[#F4510B50] transition-colors"
                >
                  <div className="flex items-center justify-center gap-1 text-[#F4510B] mb-0.5">
                    <Package className="w-3 h-3 text-[#F4510B]" />
                    <span className="text-[9.5px] font-bold text-[#172B50]">Equipment</span>
                  </div>
                  <strong className="text-base sm:text-lg font-black text-[#172B50] block leading-tight">
                    {kpis.equipmentHealth}%
                  </strong>
                  <span className="text-[8.5px] font-bold text-[#172B50]/55 uppercase tracking-tight block mt-0.5">
                    Health
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#172B500C] flex items-center justify-between text-[11px] font-bold shrink-0">
            <span className="text-[#172B50]/60 uppercase tracking-wider text-[10px]">
              Operational Metrics
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className="text-[#F4510B] hover:text-[#d44307] flex items-center gap-1 cursor-pointer"
            >
              <span>Explore performance</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Bottom Card C: Academy Operations */}
        <div className="bg-white rounded-[22px] p-4 sm:p-4.5 border border-[#172B5012] shadow-2xs flex flex-col justify-between h-[230px]">
          <div>
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#172B500C]">
              <div className="w-7 h-7 rounded-lg bg-[#FFF5ED] text-[#F4510B] flex items-center justify-center shrink-0 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-[#F4510B]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#172B50] tracking-tight leading-tight">
                  Academy Operations
                </h3>
                <p className="text-[10px] font-medium text-[#172B50]/60 leading-tight">
                  Centers, faculty & equipment
                </p>
              </div>
            </div>

            <div className="py-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                {/* Tile 1: Coaches & Staff */}
                <button
                  type="button"
                  onClick={() => setActiveTab('coaches')}
                  className="bg-[#0B3B60] text-white rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-2xs hover:bg-[#082d4a] active:scale-95 transition-all cursor-pointer min-h-[78px] group"
                >
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <UserCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[11.5px] font-black text-white leading-tight">
                    Coaches & Staff
                  </span>
                  <span className="text-[10px] font-medium text-white/70 mt-0.5">
                    {locationFilteredCoaches.length} Faculty
                  </span>
                </button>

                {/* Tile 2: Training Centers */}
                <button
                  type="button"
                  onClick={() => setActiveTab('locations')}
                  className="bg-white text-[#172B50] rounded-xl p-2.5 border border-[#172B5015] flex flex-col items-center justify-center text-center shadow-2xs hover:border-[#F4510B35] hover:bg-[#FFF4E8]/40 active:scale-95 transition-all cursor-pointer min-h-[78px] group"
                >
                  <div className="w-5 h-5 rounded-full bg-[#FFF5ED] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                  </div>
                  <span className="text-[11.5px] font-black text-[#172B50] leading-tight">
                    Training Centers
                  </span>
                  <span className="text-[10px] font-medium text-[#172B50]/60 mt-0.5">
                    {assignedLocations.length} Centers
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#172B500C] flex items-center justify-between text-[11px] font-bold shrink-0">
            <span className="text-[#172B50]/60 uppercase tracking-wider text-[10px]">
              Academy Network
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('locations')}
              className="text-[#172B50] hover:text-[#F4510B] flex items-center gap-1 cursor-pointer"
            >
              <span>View All Locations ({assignedLocations.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
