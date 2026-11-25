import React from 'react';
import {
  Home,
  CalendarCheck,
  Calendar,
  Users,
  GraduationCap,
  ShieldCheck,
  MapPin,
  UserCheck,
  CalendarOff,
  CalendarPlus,
  Layers,
  Rocket,
  Trophy,
  User,
  Settings,
  ArrowLeftRight
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export default function IPhoneMobileTabBar({ currentPortal }) {
  const { currentView, setCurrentView } = useCrm();

  const getNavItems = () => {
    switch (currentPortal) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Home', icon: Home },
          { id: 'enquiries', label: 'Enquiries', icon: Users },
          { id: 'attendance_compensation', label: 'Attendance', icon: CalendarCheck },
          { id: 'people', label: 'People', icon: GraduationCap },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case 'super_coach':
        return [
          { id: 'evaluations', label: 'Reviews', icon: ShieldCheck },
          { id: 'locations', label: 'Hub', icon: MapPin },
          { id: 'coaches', label: 'Coaches', icon: UserCheck },
          { id: 'leaves', label: 'Leaves', icon: CalendarOff },
          { id: 'schedules', label: 'Schedule', icon: Calendar },
        ];
      case 'coach':
        return [
          { id: 'dashboard', label: 'Home', icon: Home },
          { id: 'batches', label: 'Batches', icon: Layers },
          { id: 'classes', label: 'Schedule', icon: Calendar },
          { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
          { id: 'leave_requests', label: 'Leaves', icon: CalendarPlus },
        ];
      case 'parent':
        return [
          { id: 'dashboard', label: 'Home', icon: Home },
          { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
          { id: 'programs', label: 'Programs', icon: Rocket },
          { id: 'achievements', label: 'Vault', icon: Trophy },
          { id: 'children', label: 'Profile', icon: User },
        ];
      default:
        return [
          { id: 'dashboard', label: 'Home', icon: Home },
          { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
        ];
    }
  };

  const navItems = getNavItems();

  const isItemActive = (item) => {
    if (currentView === item.id) return true;
    if (item.id === 'attendance_compensation' && ['attendance', 'attendance_compensation', 'student_attendance', 'coach_attendance'].includes(currentView)) return true;
    if (item.id === 'programs' && ['programs', 'programs_achievements'].includes(currentView)) return true;
    if (item.id === 'achievements' && ['achievements', 'progress'].includes(currentView)) return true;
    if (item.id === 'people' && ['people', 'students', 'kids', 'parents', 'coaches'].includes(currentView)) return true;
    if (item.id === 'evaluations' && ['evaluations', 'evaluation_review'].includes(currentView)) return true;
    if (item.id === 'leaves' && ['leaves', 'coach_leaves', 'leave_requests'].includes(currentView)) return true;
    if (item.id === 'classes' && ['classes', 'schedules'].includes(currentView)) return true;
    return false;
  };

  return (
    <nav className="w-full z-40 bg-white/95 backdrop-blur-md px-2 pt-1 pb-1 select-none">
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer relative group ${
                active ? 'text-[#F4510B]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${
                active ? 'bg-[#FFF4E8] text-[#F4510B] scale-110 shadow-2xs' : 'group-hover:bg-slate-100'
              }`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className={`text-[10px] mt-0.5 font-bold tracking-tight truncate max-w-full ${
                active ? 'font-black text-[#F4510B]' : 'text-slate-600'
              }`}>
                {item.label}
              </span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#F4510B] absolute -bottom-0.5 shadow-2xs" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
