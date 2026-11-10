import React, { useState } from 'react';
import { Trophy, Calendar, MapPin, Users, Plus, Award, CheckCircle2 } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';

export default function CompetitionsModule() {
  const { data, setData, addToast, registerCompetition } = useCrm();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [registerModalComp, setRegisterModalComp] = useState(null);
  const [selectedStudentName, setSelectedStudentName] = useState(data.students[0]?.name || '');

  // Form state
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState('Gymnastics & Obstacle Run');
  const [date, setDate] = useState('2026-12-10');
  const [venue, setVenue] = useState('Little Spartans Arena, Indiranagar');
  const [maxParticipants, setMaxParticipants] = useState('50');
  const [entryFee, setEntryFee] = useState('₹500');

  const handleAddCompetition = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newComp = {
      id: `COMP-${data.competitions.length + 1}`,
      title,
      sport,
      date,
      venue,
      ageCategories: ["Under-8", "Under-12"],
      registeredCount: 0,
      maxParticipants: parseInt(maxParticipants) || 50,
      status: "Registrations Open",
      entryFee,
      prizes: "Spartan Gold & Silver Medals + Certificates"
    };

    setData(prev => ({
      ...prev,
      competitions: [...prev.competitions, newComp]
    }));
    addToast(`Tournament "${title}" scheduled!`);
    setIsAddOpen(false);
    setTitle('');
  };

  const handleRegisterAthlete = (e) => {
    e.preventDefault();
    if (!registerModalComp) return;
    registerCompetition(registerModalComp.id, selectedStudentName);
    setRegisterModalComp(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Competitions, Derbies & Tournaments
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Inter-center tournaments, state championship qualifiers and Spartan medal fixtures
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Host New Tournament</span>
        </button>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.competitions.map(comp => (
          <div key={comp.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card flex flex-col justify-between hover:shadow-dropdown transition-shadow">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F4510B]">
                    {comp.sport}
                  </span>
                  <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{comp.title}</h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#FFF4E8] flex items-center justify-center shrink-0 border border-[#172B5015]">
                  <Trophy className="w-4 h-4 text-[#F4510B]" />
                </div>
              </div>

              {/* Details */}
              <div className="mt-3.5 space-y-1.5 text-xs text-[#172B50]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#F4510B]" />
                  <span className="font-semibold">{comp.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                  <span className="opacity-80 truncate">{comp.venue}</span>
                </div>
              </div>

              {/* Age Categories */}
              <div className="mt-3 p-2.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015]">
                <span className="text-[10px] font-bold uppercase text-[#172B50] opacity-60 block mb-1">
                  Eligible Age Divisions
                </span>
                <div className="flex flex-wrap gap-1">
                  {comp.ageCategories.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-[#172B50] border border-[#172B5015]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prizes */}
              <div className="mt-2.5 text-[11px] text-[#172B50] opacity-80 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                <span>{comp.prizes}</span>
              </div>
            </div>

            {/* Registration Progress */}
            <div className="mt-4 pt-3 border-t border-[#172B5015]">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#172B50]">Spots Filled</span>
                <span className="text-[#F4510B]">{comp.registeredCount}/{comp.maxParticipants}</span>
              </div>
              <div className="w-full h-2 bg-[#FFF4E8] rounded-full overflow-hidden border border-[#172B5015]">
                <div
                  style={{ width: `${(comp.registeredCount / comp.maxParticipants) * 100}%` }}
                  className="h-full bg-[#172B50] rounded-full"
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-black text-[#172B50]">{comp.entryFee}</span>
                <button
                  onClick={() => setRegisterModalComp(comp)}
                  className="px-3 py-1.5 text-xs font-bold bg-[#F4510B] text-white rounded-lg shadow-sm hover:brightness-110 transition-all"
                >
                  Register Athlete
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Host Competition Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Host New Academy Competition"
        subtitle="Publish fixture to academy calendar and open registrations"
      >
        <form onSubmit={handleAddCompetition} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Tournament Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Spartan Sprint Challenge 2026"
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Sport Discipline</label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                <option value="Gymnastics & Obstacle Run">Gymnastics & Obstacle Run</option>
                <option value="Football Derby (5v5)">Football Derby (5v5)</option>
                <option value="Athletics & Track">Athletics & Track</option>
                <option value="Basketball 3x3">Basketball 3x3</option>
                <option value="Martial Arts Kata">Martial Arts Kata</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Event Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Venue Location</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Max Participant Cap</label>
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
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
              Publish Tournament
            </button>
          </div>
        </form>
      </Modal>

      {/* Register Athlete Modal */}
      {registerModalComp && (
        <Modal
          isOpen={!!registerModalComp}
          onClose={() => setRegisterModalComp(null)}
          title={`Register Athlete for ${registerModalComp.title}`}
          subtitle={`Entry Fee: ${registerModalComp.entryFee} • Venue: ${registerModalComp.venue}`}
        >
          <form onSubmit={handleRegisterAthlete} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Select Spartan Athlete *</label>
              <select
                value={selectedStudentName}
                onChange={(e) => setSelectedStudentName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {data.students.map(s => (
                  <option key={s.id} value={s.name}>{s.name} ({s.age} yrs - {s.rank})</option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-xl bg-[#FFF4E8] text-xs text-[#172B50] border border-[#172B5015]">
              <p className="font-bold">Tournament Confirmation Notice:</p>
              <p className="opacity-80 mt-1">Official Little Spartans competition jersey and hydration kit will be issued at center reception before event day.</p>
            </div>

            <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRegisterModalComp(null)}
                className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
              >
                Confirm Athlete Registration
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
