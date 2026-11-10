import React, { useState } from 'react';
import { Users, Search, Phone, Mail, MapPin, AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export default function ParentManagement() {
  const { data, addToast } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParents = data.parents.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReminder = (parentName) => {
    addToast(`SMS payment reminder dispatched to ${parentName}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Parent Directory & Billing
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Communication hub, emergency contacts and tuition fee status for guardian accounts
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-[#172B501A] shadow-card flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-[#172B50] opacity-50 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search parent by name, phone or email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] placeholder-[#172B5080] border border-[#172B5020] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4510B]"
          />
        </div>
        <span className="text-xs font-bold text-[#172B50] hidden sm:block">
          Total Guardians: {data.parents.length}
        </span>
      </div>

      {/* Parents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredParents.map(parent => (
          <div key={parent.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card flex flex-col justify-between hover:shadow-dropdown transition-shadow">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F4510B]">
                    {parent.id} • {parent.center}
                  </span>
                  <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{parent.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  parent.pendingDue === '₹0'
                    ? 'bg-[#172B50] text-white'
                    : 'bg-[#F4510B] text-white'
                }`}>
                  {parent.pendingDue === '₹0' ? 'No Dues' : `Due ${parent.pendingDue}`}
                </span>
              </div>

              {/* Children enrolled */}
              <div className="mt-3 p-2.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015]">
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-65 block mb-1">
                  Enrolled Spartan Children:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {parent.children.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md text-xs font-extrabold bg-white text-[#172B50] border border-[#172B5020]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact info */}
              <div className="mt-3 space-y-1.5 text-xs text-[#172B50]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#F4510B]" />
                  <span className="font-semibold">{parent.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#F4510B]" />
                  <span className="opacity-80 truncate">{parent.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                  <span className="opacity-75 truncate">{parent.address}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#172B5015] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#172B50] opacity-60 block">Lifetime Tuition</span>
                <span className="text-xs font-extrabold text-[#172B50]">{parent.totalFeesPaid}</span>
              </div>

              {parent.pendingDue !== '₹0' ? (
                <button
                  onClick={() => handleSendReminder(parent.name)}
                  className="px-3 py-1.5 text-xs font-bold bg-[#F4510B] text-white rounded-lg shadow-sm hover:brightness-110 transition-all flex items-center gap-1"
                >
                  <Send className="w-3 h-3 text-white" />
                  <span>Send Reminder</span>
                </button>
              ) : (
                <span className="text-[11px] font-bold text-[#172B50] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-[#F4510B]" />
                  <span>All Clear</span>
                </span>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
