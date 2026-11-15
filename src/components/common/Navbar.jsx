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
    currentPortal,
    currentUser, 
    globalSearch, 
    setGlobalSearch, 
    sidebarOpen, 
    setSidebarOpen,
    data,
    markNotificationsRead,
    logout
  } = useCrm();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const portalNotifications = (data.notifications || []).filter(
    n => n.targetRole === 'all' || n.targetRole === currentPortal
  );
  const unreadCount = portalNotifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#080B0C] border-b border-[#493548]/30 px-4 sm:px-6 py-3 shrink-0 transition-colors duration-200">
      <div className="flex items-center justify-between gap-3 sm:gap-4 w-full">
        
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-[#F4F7F6] hover:bg-[#493548]/30 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-[#55CDB3]" /> : <Menu className="w-5 h-5 text-[#55CDB3]" />}
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
            <Search className="h-4 w-4 text-[#55CDB3]" />
          </div>
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search students, classes, coaches, enquiries..."
            className="w-full pl-9 pr-14 py-2 text-xs bg-[#080B0C] text-[#F4F7F6] placeholder-[#F4F7F6]/50 border border-[#493548]/40 rounded-full focus:outline-none focus:ring-2 focus:ring-[#55CDB3] focus:border-[#55CDB3] shadow-xs hover:border-[#55CDB3]/60 transition-all font-medium"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9.5px] font-bold text-[#F4F7F6]/60 bg-[#493548]/30 rounded border border-[#493548]/50 select-none">
              ⌘K
            </kbd>
          </div>
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
              className="relative p-2.5 rounded-full bg-[#080B0C] border border-[#493548]/40 text-[#F4F7F6] hover:bg-[#493548]/30 hover:border-[#55CDB3] transition-all shadow-xs cursor-pointer active:scale-95"
              aria-label="Academy Notifications"
            >
              <Bell className="w-4 h-4 text-[#F4F7F6]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#55CDB3] text-[#080B0C] text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-[#080B0C] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#080B0C] rounded-2xl shadow-dropdown border border-[#493548]/40 p-3.5 z-50 animate-slide-up text-[#F4F7F6]">
                <div className="flex items-center justify-between pb-2 border-b border-[#493548]/30 mb-2">
                  <span className="text-xs font-black text-[#F4F7F6] uppercase tracking-wider">
                    Academy Alerts ({portalNotifications.length + (data.announcements || []).length})
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markNotificationsRead(currentPortal)}
                      className="text-[10px] text-[#55CDB3] font-bold cursor-pointer hover:underline"
                    >
                      Mark All Read
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {portalNotifications.length === 0 && (data.announcements || []).length === 0 ? (
                    <p className="text-[11px] text-[#F4F7F6]/60 py-4 text-center">
                      No new alerts yet. Schedule updates &amp; compensation notifications will appear here.
                    </p>
                  ) : (
                    <>
                      {portalNotifications.slice(0, 6).map(ntf => (
                        <div
                          key={ntf.id}
                          className={`p-2.5 rounded-xl border transition-colors ${
                            ntf.read
                              ? 'bg-[#080B0C] border-[#493548]/30'
                              : 'bg-[#493548]/20 border-[#55CDB3]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#F4F7F6]">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#55CDB3] shrink-0" />
                              <span>{ntf.title}</span>
                            </span>
                            {!ntf.read && (
                              <span className="w-2 h-2 rounded-full bg-[#55CDB3] shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#F4F7F6]/80 mt-1">{ntf.message}</p>
                        </div>
                      ))}

                      {(data.announcements || []).slice(0, 2).map(ann => (
                        <div key={ann.id} className="p-2 rounded-xl bg-[#080B0C] border border-[#493548]/30 hover:bg-[#493548]/20 transition-colors">
                          <span className="text-xs font-semibold text-[#F4F7F6] block">{ann.title}</span>
                          <p className="text-[10px] text-[#F4F7F6]/75 line-clamp-2 mt-0.5">{ann.content}</p>
                          <span className="text-[9px] text-[#55CDB3]/80 block mt-1">{ann.date}</span>
                        </div>
                      ))}
                    </>
                  )}
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
              className="flex items-center gap-2.5 p-1 pl-1.5 pr-3 rounded-full bg-[#080B0C] border border-[#493548]/40 hover:bg-[#493548]/30 hover:border-[#55CDB3] transition-all shadow-xs cursor-pointer select-none active:scale-95 group"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-[#55CDB3]/40"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#55CDB3] ring-2 ring-[#080B0C]"></span>
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-black text-[#F4F7F6] block leading-tight">{currentUser.name}</span>
                <span className="text-[10.5px] font-bold text-[#55CDB3] block leading-tight tracking-wide">{currentUser.badge || 'SuperAdmin'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#F4F7F6]/60 group-hover:text-[#55CDB3] group-hover:translate-y-0.5 transition-all" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#080B0C] rounded-xl shadow-dropdown border border-[#493548]/40 p-2.5 z-50 text-[#F4F7F6]">
                <div className="px-3 py-2.5 bg-[#493548]/25 rounded-lg border border-[#493548]/30">
                  <p className="text-xs font-bold text-[#F4F7F6]">{currentUser.name}</p>
                  <p className="text-[11px] font-medium text-[#55CDB3] truncate mt-0.5">
                    {currentUser.email}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-[#493548]/30">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#55CDB3] font-bold hover:bg-[#493548]/30 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#55CDB3]" />
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
  );
}
