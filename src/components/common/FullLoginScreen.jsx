import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  GraduationCap, 
  UserCheck2, 
  LifeBuoy, 
  Trophy, 
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export default function FullLoginScreen() {
  const { data, login, addToast } = useCrm();

  const [activeRole, setActiveRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('Spartan2026!');
  const [rememberMe, setRememberMe] = useState(true);

  const firstParentAcc = (data.userAccounts || []).find(a => a.role === 'parent') || data.parents?.[0];
  const firstCoachAcc = (data.userAccounts || []).find(a => a.role === 'coach') || data.coaches?.[0];

  const roleConfigs = {
    admin: {
      id: 'admin',
      roleLabel: 'Admin Portal',
      userTitle: 'Commander Vikramaditya',
      roleSubtitle: 'Academy Director & Super Admin',
      defaultEmail: 'director@littlespartans.co.in',
      badge: 'Super Admin Access',
      icon: Shield,
      description: 'Complete academy administration: financials, student roster, faculty allocations, and executive analytics.',
      highlights: ['Revenue & Fee Ledger', 'Enquiry Conversion Pipeline', 'Class Timetables & Capacities']
    },
    parent: {
      id: 'parent',
      roleLabel: 'Parent Portal',
      userTitle: firstParentAcc?.name || 'Parent Account',
      roleSubtitle: firstParentAcc?.center ? `Guardian • ${firstParentAcc.center}` : 'Add Parent via Admin Portal first',
      defaultEmail: firstParentAcc?.email || 'parent@littlespartans.co.in',
      badge: 'Verified Guardian',
      icon: GraduationCap,
      description: 'Monitor your children’s training timetable, punctuality records, fee dues, certificates, and coach assessments.',
      highlights: ['Live Children Progress', 'Instant Online Fee Receipts', 'Tournament Registrations']
    },
    coach: {
      id: 'coach',
      roleLabel: 'Coach Portal',
      userTitle: firstCoachAcc?.name || 'Coach Account',
      roleSubtitle: firstCoachAcc?.specialization || 'Assign Coach via Admin Portal',
      defaultEmail: firstCoachAcc?.email || 'coach@littlespartans.co.in',
      badge: 'Academy Faculty',
      icon: UserCheck2,
      description: 'Manage session rosters, record athlete attendance, evaluate motor agility, and review drill manuals.',
      highlights: ['Session Attendance Marker', 'Skill & Agility Rubrics', 'Competition Squad Nominations']
    },
    support: {
      id: 'support',
      roleLabel: 'Customer Support Portal',
      userTitle: 'Priya Menon',
      roleSubtitle: 'Lead Relations Officer',
      defaultEmail: 'support@littlespartans.co.in',
      badge: 'Support Desk Lead',
      icon: LifeBuoy,
      description: 'Handle parent queries, admissions inquiries, trial booking calls, and customer service grievances.',
      highlights: ['Threaded Support Tickets', 'Enquiry Pipeline CRM', 'Scheduled Callback Register']
    }
  };

  const currentConfig = roleConfigs[activeRole];
  const [email, setEmail] = useState(currentConfig.defaultEmail);

  const handleRoleChange = (roleKey) => {
    setActiveRole(roleKey);
    setEmail(roleConfigs[roleKey].defaultEmail);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    login(activeRole);
    addToast(`Welcome to Little Spartans ${currentConfig.roleLabel}!`);
  };

  const handleInstantDemoLogin = (roleKey) => {
    login(roleKey);
    addToast(`Signed in to ${roleConfigs[roleKey].roleLabel} as ${roleConfigs[roleKey].userTitle}!`);
  };

  return (
    <div className="min-h-screen bg-[#493548]/15] text-[#080B0C] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#55CDB3] selection:text-white">
      
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#080B0C] flex items-center justify-center shadow-subtle border border-[#080B0C]">
            <Shield className="w-7 h-7 text-[#55CDB3] fill-[#55CDB3]" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-[#080B0C] block leading-none font-sans">
              LITTLE <span className="text-[#55CDB3]">SPARTANS</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#080B0C] opacity-75">
              Children's Sports Academy CRM
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-[#F4F7F6] px-3 py-1.5 rounded-full border border-[#080B0C15] shadow-xs text-xs font-bold text-[#080B0C]">
          <span className="w-2 h-2 rounded-full bg-[#55CDB3] animate-pulse" />
          <span>Multi-Portal Authentication Gateway</span>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="max-w-5xl w-full mx-auto my-auto py-4">
        <div className="bg-[#F4F7F6] rounded-3xl shadow-dropdown border border-[#080B0C1A] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Hero / Role Selector Sidebar (5 Cols) */}
          <div className="lg:col-span-5 bg-[#493548]/15] p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#080B0C15] flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#55CDB3] block">
                SELECT LOGIN PORTAL
              </span>
              <h2 className="text-xl font-extrabold text-[#080B0C] mt-1">
                Choose Academy Role
              </h2>
              <p className="text-xs text-[#080B0C] opacity-75 mt-1 leading-relaxed">
                Click any portal to load credentials and test its role permissions.
              </p>

              {/* Role Buttons */}
              <div className="space-y-2.5 mt-5">
                {Object.values(roleConfigs).map(role => {
                  const Icon = role.icon;
                  const isSelected = activeRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleChange(role.id)}
                      className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-[#080B0C] text-white border-[#080B0C] shadow-sm'
                          : 'bg-[#F4F7F6] text-[#080B0C] border-[#080B0C15] hover:border-[#55CDB3]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#55CDB3] text-white' : 'bg-[#493548]/15] text-[#55CDB3]'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black block leading-tight">{role.roleLabel}</span>
                          <span className={`text-[10px] block leading-tight mt-0.5 ${
                            isSelected ? 'text-white opacity-80' : 'text-[#080B0C] opacity-60'
                          }`}>
                            {role.userTitle}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#55CDB3] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role Highlight Pill */}
            <div className="p-3.5 bg-[#F4F7F6] rounded-2xl border border-[#080B0C15]">
              <span className="text-[10px] font-extrabold text-[#080B0C] block uppercase opacity-60">
                {currentConfig.roleLabel} Scope
              </span>
              <p className="text-[11px] text-[#080B0C] opacity-80 mt-1">
                {currentConfig.description}
              </p>
            </div>
          </div>

          {/* Right Login Form (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#493548]/15] text-[#55CDB3] border border-[#080B0C15]">
                  {currentConfig.badge}
                </span>
                <span className="text-xs font-mono font-bold text-[#080B0C] opacity-60">
                  Chennai Hub
                </span>
              </div>

              <h1 className="text-2xl font-black text-[#080B0C] mt-3 tracking-tight">
                Sign In to {currentConfig.roleLabel}
              </h1>
              <p className="text-xs text-[#080B0C] opacity-75 mt-1">
                Logging in as <span className="font-extrabold text-[#080B0C]">{currentConfig.userTitle}</span> ({currentConfig.roleSubtitle})
              </p>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4 mt-6">
                <div>
                  <label className="text-xs font-bold text-[#080B0C] block mb-1">
                    Academy Email ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#080B0C] opacity-50 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@littlespartans.co.in"
                      className="w-full pl-10 pr-3 py-2.5 text-xs bg-[#493548]/15] text-[#080B0C] border border-[#080B0C20] rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-[#080B0C]">
                      Password
                    </label>
                    <span className="text-[11px] font-bold text-[#55CDB3] hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#080B0C] opacity-50 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-[#493548]/15] text-[#080B0C] border border-[#080B0C20] rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-[#080B0C] opacity-60 hover:opacity-100"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-[#080B0C]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded accent-[#55CDB3] text-[#55CDB3]"
                    />
                    <span>Remember this session</span>
                  </label>
                  <span className="text-[10px] text-[#080B0C] opacity-60 font-semibold">
                    Encrypted TLS 256-bit
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 text-xs font-black bg-[#55CDB3] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <span>Authenticate & Enter {currentConfig.roleLabel.replace(' Portal', '')}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </form>

              {/* 1-Click Fast Demo Launcher */}
              <div className="mt-5 pt-4 border-t border-[#080B0C15]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#080B0C] opacity-60 block mb-2">
                  Instant Demo Shortcuts:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.values(roleConfigs).map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleInstantDemoLogin(r.id)}
                      className="px-2 py-1.5 rounded-lg text-[10px] font-bold bg-[#493548]/15] hover:bg-[#080B0C] hover:text-white text-[#080B0C] border border-[#080B0C15] transition-colors truncate"
                    >
                      {r.roleLabel.replace(' Portal', '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#080B0C] opacity-60 text-center pt-2">
              Little Spartans Sports Academy CRM • Official Frontend Prototype
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center pt-4 text-xs text-[#080B0C] opacity-75">
        Official Brand Colors: Warm Cream (#493548]/15) • Spartan Orange (#55CDB3) • Navy Blue (#080B0C) • Pure White (#FFFFFF)
      </footer>

    </div>
  );
}
