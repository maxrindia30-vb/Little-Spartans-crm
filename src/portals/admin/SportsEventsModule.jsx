import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Medal, 
  Users, 
  Sparkles, 
  ArrowLeft, 
  Bell, 
  CheckCircle2, 
  Flame, 
  Calendar,
  Layers,
  Flag
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export default function SportsEventsModule() {
  const { setCurrentView, addToast } = useCrm();
  const [isNotified, setIsNotified] = useState(false);

  const handleNotifyMe = () => {
    setIsNotified(true);
    addToast('You have been subscribed for Little Spartans Sports & Tournaments launch updates!', 'success');
  };

  const upcomingFeatures = [
    {
      icon: Trophy,
      title: 'Inter-Branch Championships',
      badge: 'Tournaments',
      desc: 'Host annual cups, inter-center leagues, and discipline-specific championships with custom brackets and fixtures.'
    },
    {
      icon: Users,
      title: 'Squad Rosters & Registration',
      badge: 'Team Roster',
      desc: 'Nominate athlete squads, manage age brackets, weight categories, and process participant permissions seamlessly.'
    },
    {
      icon: Medal,
      title: 'Live Podiums & Standings',
      badge: 'Live Results',
      desc: 'Real-time scorecard updates, live medal tallies, and academy-wide athlete rankings across all branches.'
    },
    {
      icon: Award,
      title: 'Official Merit Certificates',
      badge: 'QR Verifiable',
      desc: 'Automated generation of branded Little Spartans diplomas, participation awards, and verifiable digital merit certificates.'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header with Breadcrumb and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#172B50]/60 mb-1">
            <span>ZenConnect</span>
            <span>/</span>
            <span className="text-[#F4510B]">Sports & Events</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172B50] tracking-tight flex items-center gap-2.5">
            <span>Sports & Events</span>
            <span className="text-xl">🏆</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50]/70 font-medium mt-0.5">
            Academy tournaments, inter-branch cups, live leaderboards and verifiable merit certificates
          </p>
        </div>

        {/* Development Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#F4510B] animate-pulse" />
            <span>Under Active Development</span>
          </div>
        </div>
      </div>

      {/* 2. Main Coming Soon Showcase Card */}
      <div className="bg-white rounded-3xl border border-[#172B5014] shadow-xs relative overflow-hidden p-6 sm:p-10 lg:p-12">
        {/* Subtle Running Kids Watermark Bottom-Right */}
        <div className="absolute right-4 sm:right-10 bottom-3 sm:bottom-4 opacity-15 pointer-events-none select-none hidden sm:block">
          <svg className="w-48 h-36 text-[#F4510B]" viewBox="0 0 160 120" fill="currentColor">
            <circle cx="50" cy="25" r="12" />
            <path d="M45 40 L35 70 L20 85 L25 90 L40 75 L48 55 L60 70 L75 80 L80 72 L65 62 L55 45 Z" />
            <path d="M40 45 L25 55 L20 50 L35 40 Z" />
            <path d="M50 45 L65 52 L75 48 L73 40 L62 45 Z" />
            <circle cx="110" cy="20" r="14" />
            <path d="M105 37 L92 68 L75 82 L80 88 L98 73 L108 52 L122 68 L138 78 L142 70 L128 60 L116 42 Z" />
            <path d="M100 42 L82 52 L78 46 L95 37 Z" />
            <path d="M112 42 L128 50 L140 45 L138 37 L125 42 Z" />
          </svg>
        </div>

        {/* Warm Cream Wave Gradient at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FFF4E8]/50 to-transparent pointer-events-none" />

        {/* Center Content */}
        <div className="max-w-2xl mx-auto text-center relative z-10 space-y-6">
          {/* Centered Decorative Illustration */}
          <div className="relative inline-flex items-center justify-center">
            {/* Glow Background */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#FFF0E6] via-[#FFE4D1] to-[#FFF5ED] flex items-center justify-center shadow-inner relative">
              {/* Floating Sparkles */}
              <Sparkles className="w-5 h-5 text-[#F4510B] absolute -top-1 -right-1 animate-bounce" />
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-[#F4510B25] shadow-[0_8px_24px_rgba(244,81,11,0.15)] flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-[#F4510B]" />
              </div>
            </div>
          </div>

          {/* Badge & Headings */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B30] mb-3">
              <Sparkles className="w-3 h-3 text-[#F4510B]" />
              <span>Coming Soon</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#172B50] tracking-tight">
              Sports Tournaments & Events Coming Soon
            </h2>
            <p className="text-xs sm:text-sm text-[#172B50]/75 font-medium max-w-lg mx-auto mt-2 leading-relaxed">
              We&apos;re crafting an end-to-end competition platform for Little Spartans athletes.
              Organize multi-center cups, nominate squad rosters, celebrate podium triumphs, and issue official verified certificates.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleNotifyMe}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-sm ${
                isNotified
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-[#F4510B] text-white hover:bg-[#d94103] active:scale-95 shadow-[0_4px_14px_rgba(244,81,11,0.3)]'
              }`}
            >
              {isNotified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Subscribed for Launch Alert ✓</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-white" />
                  <span>Notify Me at Launch</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold bg-[#FFF4E8] text-[#172B50] border border-[#172B5018] hover:bg-[#ffe7d1] active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-[#172B50]" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* 3. Feature Sneak Peek Grid */}
        <div className="mt-12 pt-10 border-t border-[#172B5010] relative z-10">
          <div className="text-center mb-6">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#F4510B]">
              Module Sneak Peek
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[#172B50] tracking-tight mt-0.5">
              What&apos;s Arriving in Sports & Events
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-xs rounded-2xl p-5 border border-[#172B5012] hover:border-[#F4510B40] hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF4E8] group-hover:bg-[#FFF0E6] flex items-center justify-center text-[#F4510B] transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#172B500A] text-[#172B50]/70 font-mono">
                      {feature.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-[#172B50] tracking-tight mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-[#172B50]/70 leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
