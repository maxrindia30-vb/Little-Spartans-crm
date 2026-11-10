import React, { useState } from 'react';
import { UserCheck, Star, Award, Phone, Mail, Calendar, Plus, CheckCircle2 } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';

export default function CoachManagement() {
  const { data, setData, addToast } = useCrm();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('Gymnastics & Conditioning');
  const [experience, setExperience] = useState('5 years');
  const [certification, setCertification] = useState('Certified Youth Specialist');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [center, setCenter] = useState(data.academy.centers[0]);

  const handleAddCoach = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCoach = {
      id: `COACH-${data.coaches.length + 1}`,
      name,
      specialization,
      experience,
      certification,
      phone: phone || '+91 98000 11111',
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@littlespartans.co.in`,
      center,
      rating: 5.0,
      activeBatches: 2,
      studentsCount: 20,
      status: 'Active'
    };

    setData(prev => ({
      ...prev,
      coaches: [...prev.coaches, newCoach]
    }));
    addToast(`Coach ${name} onboarded into academy roster!`);
    setIsAddOpen(false);
    setName('');
    setPhone('');
    setEmail('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Coach Management & Faculty
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Faculty credentials, national certifications, assigned training batches and performance ratings
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add New Coach</span>
        </button>
      </div>

      {/* Coaches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.coaches.map(coach => (
          <div key={coach.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card flex flex-col justify-between hover:shadow-dropdown transition-shadow">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F4510B]">
                    {coach.id} • {coach.center}
                  </span>
                  <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{coach.name}</h3>
                  <p className="text-xs font-semibold text-[#172B50] opacity-80 mt-0.5">
                    {coach.specialization}
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-[#FFF4E8] px-2 py-1 rounded-lg border border-[#172B5015]">
                  <Star className="w-3.5 h-3.5 text-[#F4510B] fill-[#F4510B]" />
                  <span className="text-xs font-black text-[#172B50]">{coach.rating}</span>
                </div>
              </div>

              {/* Certification Badge */}
              <div className="mt-3.5 p-2.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#F4510B] shrink-0" />
                <span className="text-[11px] font-bold text-[#172B50]">
                  {coach.certification}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#172B5012] text-xs">
                <div className="p-2 rounded-lg bg-white border border-[#172B5015]">
                  <span className="text-[10px] text-[#172B50] opacity-60 block">Active Batches</span>
                  <span className="font-extrabold text-[#172B50] text-sm">{coach.activeBatches} Batches</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-[#172B5015]">
                  <span className="text-[10px] text-[#172B50] opacity-60 block">Trained Athletes</span>
                  <span className="font-extrabold text-[#F4510B] text-sm">{coach.studentsCount} Kids</span>
                </div>
              </div>

              {/* Contact info */}
              <div className="mt-3 space-y-1 text-xs text-[#172B50]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#F4510B]" />
                  <span className="font-semibold">{coach.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#F4510B]" />
                  <span className="opacity-80 truncate">{coach.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#172B5015] flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#172B50]">Experience: {coach.experience}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#172B50] text-white">
                {coach.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Coach Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Spartan Academy Coach"
        subtitle="Register certified trainer into faculty directory"
      >
        <form onSubmit={handleAddCoach} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Coach Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Coach Siddharth Rao"
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Specialization</label>
              <input
                type="text"
                required
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Sprinting & Hurdles"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Coaching Experience</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 6 years"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Certifications & Licenses</label>
            <input
              type="text"
              value={certification}
              onChange={(e) => setCertification(e.target.value)}
              placeholder="e.g. FIG Level 1 / AFC Diploma"
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98..."
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Base Academy Center</label>
              <select
                value={center}
                onChange={(e) => setCenter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {data.academy.centers.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Save Coach Record
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
