import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  User, 
  ShieldCheck, 
  Plus, 
  Search, 
  Key, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Lock, 
  UserCheck, 
  UserX,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import StudentManagement from './StudentManagement';
import ParentManagement from './ParentManagement';
import CoachManagement from './CoachManagement';
import Modal from '../../components/common/Modal';
import { getCommonLocations } from '../../services/locationService';

export default function PeopleManagementModule() {
  const { 
    data, 
    activeSubTab, 
    setActiveSubTab, 
    createAccount, 
    resetAccountPassword, 
    toggleAccountStatus,
    addToast 
  } = useCrm();
  const commonLocations = getCommonLocations(data);

  // Active tab: 'students' | 'parents' | 'coaches' | 'accounts'
  const currentTab = activeSubTab || 'students';

  // Account creation modal state
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [accountRole, setAccountRole] = useState('parent');
  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPhone, setAccountPhone] = useState('');
  const [accountCenter, setAccountCenter] = useState(commonLocations[0]?.name || 'KK NAGAR');
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [accountSearch, setAccountSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showPasswordMap, setShowPasswordMap] = useState({});

  const toggleShowPassword = (id) => {
    setShowPasswordMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateAccountSubmit = (e) => {
    e.preventDefault();
    if (!accountName.trim() || !accountEmail.trim()) {
      addToast('Please enter full name and a valid unique email.', 'error');
      return;
    }

    const payload = {
      role: accountRole,
      name: accountName.trim(),
      email: accountEmail.trim(),
      phone: accountPhone.trim(),
      center: accountCenter,
      linkedStudents: accountRole === 'parent' ? selectedChildren : undefined,
      assignedPrograms: accountRole === 'coach' ? selectedPrograms : undefined,
    };

    const res = createAccount(payload);
    if (res.success) {
      setIsCreateAccountOpen(false);
      setAccountName('');
      setAccountEmail('');
      setAccountPhone('');
      setSelectedChildren([]);
      setSelectedPrograms([]);
    }
  };

  const accounts = (data.userAccounts || []).filter(acc => {
    const matchesSearch = 
      acc.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
      acc.email.toLowerCase().includes(accountSearch.toLowerCase());
    const matchesRole = roleFilter === 'All' || acc.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Module Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#493548]/20 pb-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#080B0C] tracking-tight">
            People & Access Management
          </h1>
          <p className="text-xs sm:text-sm text-[#080B0C] opacity-75 mt-0.5">
            Admin oversight for Students, Guardians, Coaches and Role-based Login Access
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4F7F6] rounded-xl border border-[#493548]/20 shadow-xs self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveSubTab('students')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'students'
                ? 'bg-[#55CDB3] text-[#080B0C] font-bold shadow-xs'
                : 'text-[#080B0C] hover:bg-[#55CDB3]/15'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Students ({data.students.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('parents')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'parents'
                ? 'bg-[#55CDB3] text-[#080B0C] font-bold shadow-xs'
                : 'text-[#080B0C] hover:bg-[#55CDB3]/15'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Parents ({data.parents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('coaches')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'coaches'
                ? 'bg-[#55CDB3] text-[#080B0C] font-bold shadow-xs'
                : 'text-[#080B0C] hover:bg-[#55CDB3]/15'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Coaches ({data.coaches.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('accounts')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              currentTab === 'accounts'
                ? 'bg-[#080B0C] text-[#F4F7F6] shadow-xs'
                : 'text-[#080B0C] hover:bg-[#55CDB3]/15'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#55CDB3]" />
            <span>Account Management ({(data.userAccounts || []).length})</span>
          </button>
        </div>
      </div>

      {/* Render Active Subtab Content */}
      {currentTab === 'students' && <StudentManagement />}
      {currentTab === 'parents' && <ParentManagement />}
      {currentTab === 'coaches' && <CoachManagement />}

      {/* TAB 4: Account Management (Section 5: Admin-only Account Creation & Login Access) */}
      {currentTab === 'accounts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Banner Notice */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#080B0C] to-[#493548]/50 border border-[#493548]/30 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-card">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#55CDB3]" />
                <h2 className="text-base font-extrabold tracking-wide">
                  Admin Authority: Zero Public Self-Registration
                </h2>
              </div>
              <p className="text-xs text-white/80 mt-1 max-w-2xl leading-relaxed">
                Parents and Coaches cannot publicly register. As Academy Admin, you create user profiles, validate unique email addresses, issue secure temporary credentials, and control portal activation.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateAccountOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#55CDB3] text-[#080B0C] font-bold text-xs font-bold rounded-xl shadow-sm hover:bg-[#55CDB3]/90 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create User Account</span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="bg-[#F4F7F6] rounded-2xl p-4 border border-[#493548]/20 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="w-4 h-4 text-[#493548] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email address, role..."
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#493548]/15/40 border border-[#493548]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#55CDB3]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-[#493548]">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F4F7F6] border border-[#493548]/20 rounded-xl text-[#080B0C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#55CDB3]"
              >
                <option value="All">All Roles</option>
                <option value="parent">Parents</option>
                <option value="coach">Coaches</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          {/* Accounts Table */}
          <div className="bg-[#F4F7F6] rounded-2xl border border-[#493548]/20 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#493548]/15 text-[#080B0C] font-bold uppercase tracking-wider text-[11px] border-b border-[#493548]/20">
                  <tr>
                    <th className="px-5 py-3.5">User & Credentials</th>
                    <th className="px-4 py-3.5">Portal Role</th>
                    <th className="px-4 py-3.5">Linked Records</th>
                    <th className="px-4 py-3.5">Temp Password / Status</th>
                    <th className="px-4 py-3.5">Last Login</th>
                    <th className="px-4 py-3.5 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#493548]/15">
                  {accounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-[#55CDB3]/15/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            acc.role === 'admin' ? 'bg-[#080B0C] text-[#F4F7F6]' :
                            acc.role === 'coach' ? 'bg-[#55CDB3] text-[#080B0C] font-bold' : 'bg-[#00D1C1] text-[#0A0E17]'
                          }`}>
                            {acc.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <span className="font-bold text-[#080B0C] block text-[13px]">{acc.name}</span>
                            <span className="text-[11px] text-[#080B0C]/70 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-[#55CDB3]" />
                              {acc.email}
                            </span>
                            {acc.phone && (
                              <span className="text-[10px] text-[#080B0C]/60 flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5" />
                                {acc.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-block ${
                          acc.role === 'admin' ? 'bg-[#080B0C] text-[#F4F7F6]' :
                          acc.role === 'coach' ? 'bg-[#55CDB3]/15 text-[#55CDB3]' :
                          'bg-[#00D1C1]/20 text-[#008B80]'
                        }`}>
                          {acc.role.toUpperCase()} PORTAL
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {acc.role === 'parent' && acc.linkedStudents && (
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-semibold text-[#080B0C] block">Children:</span>
                            <span className="text-[10px] text-[#080B0C]/80 block">{acc.linkedStudents.join(', ')}</span>
                          </div>
                        )}
                        {acc.role === 'coach' && acc.assignedPrograms && (
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-semibold text-[#080B0C] block">Specialty:</span>
                            <span className="text-[10px] text-[#080B0C]/80 block">{acc.assignedPrograms.join(', ')}</span>
                          </div>
                        )}
                        {acc.role === 'admin' && (
                          <span className="text-[11px] text-[#080B0C]/70 font-medium">Academy Oversight</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${acc.status === 'Active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                            <span className="font-bold text-[#080B0C] text-[11px]">{acc.status}</span>
                          </div>
                          {acc.isTemporaryPassword && (
                            <div className="flex items-center gap-1.5 bg-[#493548]/15 px-2 py-1 rounded-lg border border-[#55CDB3]/20">
                              <Key className="w-3 h-3 text-[#55CDB3] shrink-0" />
                              <span className="text-[10px] font-mono font-bold text-[#080B0C]">
                                {showPasswordMap[acc.id] ? acc.tempPasswordDisplay || 'Spartan@2026' : '••••••••'}
                              </span>
                              <button 
                                type="button" 
                                onClick={() => toggleShowPassword(acc.id)}
                                className="text-[#080B0C]/60 hover:text-[#080B0C] ml-1"
                                title="Toggle visibility"
                              >
                                {showPasswordMap[acc.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-[11px] text-[#080B0C]/80 font-medium block">{acc.lastLogin}</span>
                        <span className="text-[10px] text-[#080B0C]/50 block">Created: {acc.createdAt}</span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {acc.role !== 'admin' && (
                            <>
                              <button
                                type="button"
                                onClick={() => resetAccountPassword(acc.id)}
                                className="p-1.5 rounded-lg border border-[#493548]/20 text-[#080B0C] hover:bg-[#55CDB3]/15 transition-colors"
                                title="Reset Temporary Password & Re-send Invite"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-[#55CDB3]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleAccountStatus(acc.id)}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  acc.status === 'Active' 
                                    ? 'border-red-200 text-red-600 hover:bg-red-50' 
                                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={acc.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                              >
                                {acc.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      <Modal
        isOpen={isCreateAccountOpen}
        onClose={() => setIsCreateAccountOpen(false)}
        title="Create Parent or Coach Account (Admin Authority)"
        size="md"
      >
        <form onSubmit={handleCreateAccountSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-[#493548]/15 border border-[#55CDB3]/20 text-[11px] text-[#080B0C] flex items-start gap-2">
            <Lock className="w-4 h-4 text-[#55CDB3] shrink-0 mt-0.5" />
            <p>
              Admin must provide a unique email address. The system automatically issues a secure temporary password and sends an invitation notification. Upon first login, the user will be prompted to reset their password.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#080B0C] mb-1">Account Role *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccountRole('parent')}
                className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  accountRole === 'parent' 
                    ? 'bg-[#55CDB3] text-[#080B0C] font-bold border-[#55CDB3]' 
                    : 'bg-[#F4F7F6] text-[#080B0C] border-[#493548]/20 hover:bg-[#55CDB3]/15'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Parent Account</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountRole('coach')}
                className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  accountRole === 'coach' 
                    ? 'bg-[#55CDB3] text-[#080B0C] font-bold border-[#55CDB3]' 
                    : 'bg-[#F4F7F6] text-[#080B0C] border-[#493548]/20 hover:bg-[#55CDB3]/15'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Coach Account</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#080B0C] mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder={accountRole === 'parent' ? "e.g. Dr. Rohan Sharma" : "e.g. Coach Vikram Singh"}
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F4F7F6] border border-[#493548]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#55CDB3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#080B0C] mb-1">
              Mandatory Unique Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. parent.name@example.com"
              value={accountEmail}
              onChange={(e) => setAccountEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F4F7F6] border border-[#493548]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#55CDB3]"
            />
            <span className="text-[10px] text-[#080B0C]/60 mt-0.5 block">
              Duplicate email check is strictly enforced.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#080B0C] mb-1">Mobile Contact</label>
            <input
              type="tel"
              placeholder="+91 99000 12345"
              value={accountPhone}
              onChange={(e) => setAccountPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F4F7F6] border border-[#493548]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#55CDB3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#080B0C] mb-1">Academy Location *</label>
            <select
              value={accountCenter}
              onChange={(e) => setAccountCenter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-[#F4F7F6] border border-[#493548]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#55CDB3]"
            >
              {commonLocations.map(loc => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>

          {accountRole === 'parent' && (
            <div>
              <label className="block text-xs font-bold text-[#080B0C] mb-1">
                Link Children to this Parent Account
              </label>
              <div className="max-h-32 overflow-y-auto border border-[#493548]/20 rounded-xl p-2 space-y-1 bg-[#F4F7F6]">
                {data.students.map(stu => (
                  <label key={stu.id} className="flex items-center gap-2 text-xs text-[#080B0C] cursor-pointer hover:bg-[#55CDB3]/15 p-1 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedChildren.includes(stu.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedChildren([...selectedChildren, stu.name]);
                        } else {
                          setSelectedChildren(selectedChildren.filter(n => n !== stu.name));
                        }
                      }}
                      className="rounded border-[#493548]/20 text-[#55CDB3] focus:ring-[#55CDB3]"
                    />
                    <span>{stu.name} ({stu.program})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {accountRole === 'coach' && (
            <div>
              <label className="block text-xs font-bold text-[#080B0C] mb-1">
                Assign Sports Disciplines
              </label>
              <div className="max-h-32 overflow-y-auto border border-[#493548]/20 rounded-xl p-2 space-y-1 bg-[#F4F7F6]">
                {data.programs.map(prog => (
                  <label key={prog.id} className="flex items-center gap-2 text-xs text-[#080B0C] cursor-pointer hover:bg-[#55CDB3]/15 p-1 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedPrograms.includes(prog.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPrograms([...selectedPrograms, prog.name]);
                        } else {
                          setSelectedPrograms(selectedPrograms.filter(n => n !== prog.name));
                        }
                      }}
                      className="rounded border-[#493548]/20 text-[#55CDB3] focus:ring-[#55CDB3]"
                    />
                    <span>{prog.name} ({prog.ageGroup})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[#493548]/20">
            <button
              type="button"
              onClick={() => setIsCreateAccountOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#080B0C] hover:bg-[#55CDB3]/15 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#55CDB3] text-[#080B0C] font-bold rounded-xl shadow-xs hover:bg-[#55CDB3]/90 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Issue Account Invitation</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
