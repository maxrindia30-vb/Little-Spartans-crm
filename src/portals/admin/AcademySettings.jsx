import React, { useState } from 'react';
import { Settings, Shield, Building, Phone, Mail, Globe, Palette, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export default function AcademySettings() {
  const { data, setData, addToast, resetAllData } = useCrm();

  const [academyName, setAcademyName] = useState(data.academy.name);
  const [tagline, setTagline] = useState(data.academy.tagline);
  const [phone, setPhone] = useState(data.academy.phone);
  const [email, setEmail] = useState(data.academy.email);
  const [website, setWebsite] = useState(data.academy.website);

  const handleSave = (e) => {
    e.preventDefault();
    setData(prev => ({
      ...prev,
      academy: {
        ...prev.academy,
        name: academyName,
        tagline,
        phone,
        email,
        website
      }
    }));
    addToast('Academy configuration updated successfully.');
  };

  const brandColors = [
    { name: 'Warm Cream', hex: '#FFF4E8', usage: 'Main Background & Navbar Background' },
    { name: 'Spartan Orange', hex: '#F4510B', usage: 'Active Nav, CTAs, Badges & Highlights' },
    { name: 'Navy Blue', hex: '#172B50', usage: 'Page Titles, Headings & Primary Text' },
    { name: 'Pure White', hex: '#FFFFFF', usage: 'Sidebar, Dashboard Cards & Containers' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Academy Configuration & Brand Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Little Spartans official branding, sports centers, academic calendar and role governance
          </p>
        </div>

        <button
          onClick={resetAllData}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-white text-[#172B50] border border-[#172B5025] rounded-xl hover:bg-[#FFF4E8] active:scale-95 transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-[#F4510B]" />
          <span>Reset Demo Database</span>
        </button>
      </div>

      {/* Brand Color Palette Verification Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card">
        <div className="flex items-center gap-2 pb-3 border-b border-[#172B5012]">
          <Palette className="w-5 h-5 text-[#F4510B]" />
          <div>
            <h3 className="text-sm font-extrabold text-[#172B50]">
              Official Brand Identity Palette (Strictly Enforced)
            </h3>
            <p className="text-xs text-[#172B50] opacity-70">
              Only four official colors across all four portals and responsive modules
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {brandColors.map(c => (
            <div key={c.name} className="p-4 rounded-xl border border-[#172B5015] bg-[#FFF4E8] flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div 
                  style={{ backgroundColor: c.hex }} 
                  className="w-10 h-10 rounded-xl border border-[#172B5020] shadow-sm shrink-0" 
                />
                <div>
                  <h4 className="text-xs font-extrabold text-[#172B50]">{c.name}</h4>
                  <span className="text-[11px] font-mono font-bold text-[#F4510B]">{c.hex}</span>
                </div>
              </div>
              <p className="text-[10px] text-[#172B50] opacity-75 mt-3 pt-2 border-t border-[#172B5015]">
                {c.usage}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Academy Profile Form */}
      <div className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card">
        <h3 className="text-sm font-extrabold text-[#172B50] pb-3 border-b border-[#172B5012] mb-4">
          Academy General Information
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Academy Name</label>
              <input
                type="text"
                value={academyName}
                onChange={(e) => setAcademyName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Academy Motto / Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Official Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Website URL</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          {/* Active Training Centers */}
          <div className="pt-2">
            <label className="text-xs font-bold text-[#172B50] block mb-2">Registered Academy Centers</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {data.academy.centers.map((center, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#FFF4E8] border border-[#172B5015] flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#F4510B] shrink-0" />
                  <span className="text-xs font-bold text-[#172B50]">{center}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
