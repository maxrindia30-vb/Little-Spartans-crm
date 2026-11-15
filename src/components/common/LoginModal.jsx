import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, UserCheck2, GraduationCap, LifeBuoy, CheckCircle2 } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from './Modal';

export default function LoginModal({ isOpen, onClose }) {
  const { currentPortal, setCurrentPortal, addToast } = useCrm();

  const [selectedRole, setSelectedRole] = useState(currentPortal);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('••••••••');

  const roleCredentials = {
    admin: { email: 'director@littlespartans.co.in', title: 'Admin Command Login', roleDesc: 'Director / Operations Head' },
    super_coach: { email: 'supercoach@littlespartans.co.in', title: 'Super Coach Portal Login', roleDesc: 'Multi-Location Lead' },
    parent: { email: 'rohan.sharma@gmail.com', title: 'Parent Portal Login', roleDesc: 'Parent / Guardian' },
    coach: { email: 'vikram@littlespartans.co.in', title: 'Coach Portal Login', roleDesc: 'Certified Academy Coach' },
    support: { email: 'support@littlespartans.co.in', title: 'Customer Support Login', roleDesc: 'Relations & Admissions Desk' },
  };

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setEmail(roleCredentials[roleKey].email);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setCurrentPortal(selectedRole);
    addToast(`Authenticated successfully into ${roleCredentials[selectedRole].title}!`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Academy Portal Authentication"
      subtitle="Role-based access gateway for Little Spartans Sports Academy"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        
        {/* Role Selector Tabs */}
        <div>
          <label className="text-xs font-bold text-[#080B0C] block mb-1.5">Select Role Account</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'admin', label: 'Admin', icon: Shield },
              { id: 'super_coach', label: 'Super Coach', icon: Shield },
              { id: 'coach', label: 'Coach', icon: UserCheck2 },
              { id: 'parent', label: 'Parent', icon: GraduationCap },
              { id: 'support', label: 'Support', icon: LifeBuoy },
            ].map(r => {
              const Icon = r.icon;
              const isActive = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r.id)}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    isActive
                      ? 'bg-[#55CDB3] text-[#080B0C] border-[#55CDB3] shadow-sm font-black'
                      : 'bg-[#493548]/15 text-[#080B0C] border-[#493548]/25 hover:bg-[#493548]/25'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#080B0C]' : 'text-[#493548]'}`} />
                  <div>
                    <span className="text-xs font-black block leading-tight">{r.label}</span>
                    <span className="text-[10px] opacity-75 block leading-tight">{roleCredentials[r.id].roleDesc.split('/')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Demo Credentials Box */}
        <div className="p-3 rounded-xl bg-[#493548]/15 border border-[#493548]/25 text-xs text-[#080B0C]">
          <span className="text-[10px] font-black uppercase text-[#55CDB3] block">Demo Access</span>
          <p className="font-bold mt-0.5">{roleCredentials[selectedRole].title}</p>
          <p className="opacity-75">Demo Email: <span className="font-mono font-semibold">{roleCredentials[selectedRole].email}</span></p>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#080B0C] block mb-1">Academy Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#493548] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email || roleCredentials[selectedRole].email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white text-[#080B0C] border border-[#493548]/30 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#080B0C] block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#493548] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white text-[#080B0C] border border-[#493548]/30 rounded-xl focus:ring-2 focus:ring-[#55CDB3] outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#493548]/20 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#493548] hover:bg-[#55CDB3]/15 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black bg-[#55CDB3] text-[#080B0C] hover:bg-[#48bfa5] rounded-xl shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Login to {selectedRole.toUpperCase()}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>
    </Modal>
  );
}
