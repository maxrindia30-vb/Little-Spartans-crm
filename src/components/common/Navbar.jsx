import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Menu, 
  X, 
  LogOut, 
  Sparkles
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export default function Navbar() {
  const { 
    currentUser, 
    globalSearch, 
    setGlobalSearch, 
    sidebarOpen, 
    setSidebarOpen,
    data,
    logout
  } = useCrm();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FFF4E8] border-b border-[#172B501A] px-4 sm:px-6 py-3 shrink-0 transition-colors duration-200">
      <div className="flex items-center justify-between gap-3 sm:gap-4 w-full">
        
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-[#172B50] hover:bg-white transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-[#172B50]" /> : <Menu className="w-5 h-5 text-[#172B50]" />}
          </button>

          <div 
            className="lg:hidden flex items-center gap-2 cursor-pointer select-none group py-0.5" 
            onClick={() => window.location.reload()}
            title="Little Spartans ZenConnect CRM"
          >
            <img 
              src="/assets/zenconnect-navbar-logo.png" 
              alt="Little Spartans ZenConnect" 
              className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              style={{ 
                imageRendering: '-webkit-optimize-contrast',
                transform: 'translateZ(0)'
              }}
            />
          </div>
        </div>

        {/* Center: Global Search bar */}
        <div className="relative flex-1 max-w-lg mx-2 sm:mx-4">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#172B50] opacity-50" />
          </div>
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search students, classes, coaches, enquiries..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white text-[#172B50] placeholder-[#172B5070] border border-[#172B5018] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B] focus:border-transparent shadow-xs transition-all font-sans"
          />
        </div>

        {/* Right Action Icons: Notifications, User Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              className="relative p-2 rounded-xl bg-white border border-[#172B5020] text-[#172B50] hover:bg-[#FFF4E8] transition-colors shadow-sm"
              aria-label="Academy Notifications"
            >
              <Bell className="w-4 h-4 text-[#172B50]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F4510B] rounded-full ring-2 ring-white"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-dropdown border border-[#172B501A] p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-[#172B5015] mb-2">
                  <span className="text-xs font-bold text-[#172B50] uppercase tracking-wider">
                    Academy Alerts ({data.announcements.length + 1})
                  </span>
                  <span className="text-[10px] text-[#F4510B] font-bold cursor-pointer hover:underline">
                    Mark Read
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  <div className="p-2.5 rounded-lg bg-[#FFF4E8] border border-[#172B5015]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#172B50]">
                      <Sparkles className="w-3.5 h-3.5 text-[#F4510B]" />
                      <span>Agility Cup 2026 Registrations</span>
                    </div>
                    <p className="text-[11px] text-[#172B50] opacity-80 mt-1">
                      42 participants registered. Only 18 spots remaining!
                    </p>
                    <span className="text-[9px] text-[#172B50] opacity-60 mt-1 block">15 mins ago</span>
                  </div>

                  {data.announcements.slice(0, 2).map(ann => (
                    <div key={ann.id} className="p-2 rounded-lg bg-white border border-[#172B5010] hover:bg-[#FFF4E8] transition-colors">
                      <span className="text-xs font-semibold text-[#172B50] block">{ann.title}</span>
                      <p className="text-[10px] text-[#172B50] opacity-75 line-clamp-2 mt-0.5">{ann.content}</p>
                      <span className="text-[9px] text-[#172B50] opacity-50 block mt-1">{ann.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-white border border-[#172B5020] hover:bg-[#FFF4E8] transition-colors shadow-sm"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#172B5020]"
              />
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-[#172B50] block leading-tight">{currentUser.name}</span>
                <span className="text-[10px] font-semibold text-[#F4510B] block leading-tight">{currentUser.badge}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#172B50] opacity-60" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-dropdown border border-[#172B501A] p-2.5 z-50">
                <div className="px-3 py-2.5 bg-[#FFF4E8] rounded-lg">
                  <p className="text-xs font-bold text-[#172B50]">{currentUser.name}</p>
                  <p className="text-[11px] font-medium text-[#172B50] opacity-80 truncate mt-0.5">
                    {currentUser.email}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-[#172B5015]">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#F4510B] font-bold hover:bg-[#FFF4E8] rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#F4510B]" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
