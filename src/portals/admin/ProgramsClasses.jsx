import React, { useState } from 'react';
import { Calendar, Award, Users, Plus, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import Modal from '../../components/common/Modal';

export default function ProgramsClasses() {
  const { data, setData, addToast } = useCrm();
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);

  // New class state
  const [className, setClassName] = useState('');
  const [program, setProgram] = useState(data.programs[0]?.name || '');
  const [coach, setCoach] = useState(data.coaches[0]?.name || '');
  const [center, setCenter] = useState(data.academy.centers[0]);
  const [schedule, setSchedule] = useState('Mon, Wed, Fri (5:00 PM - 6:15 PM)');
  const [capacity, setCapacity] = useState('18');
  const [level, setLevel] = useState('Beginner');

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!className.trim()) return;

    const newClass = {
      id: `CLS-${100 + data.classes.length + 1}`,
      name: className,
      program,
      coach: `Coach ${coach.replace('Coach ', '')}`,
      center,
      schedule,
      capacity: parseInt(capacity) || 18,
      enrolled: 1,
      level,
      status: 'Active'
    };

    setData(prev => ({
      ...prev,
      classes: [...prev.classes, newClass]
    }));
    addToast(`New class batch "${className}" created!`);
    setIsAddClassOpen(false);
    setClassName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Programs & Training Batches
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Curriculum pathways, batch timetables, coach allocation and court capacity
          </p>
        </div>

        <button
          onClick={() => setIsAddClassOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Create New Class Batch</span>
        </button>
      </div>

      {/* Programs Overview Cards */}
      <div>
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#172B50] mb-3">
          Spartan Sports Disciplines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.programs.map(prog => (
            <div key={prog.id} className="bg-white rounded-2xl p-4 border border-[#172B501A] shadow-card flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-[#F4510B] uppercase block">
                  {prog.ageGroup}
                </span>
                <h4 className="text-sm font-extrabold text-[#172B50] mt-0.5">{prog.name}</h4>
                <p className="text-xs font-bold text-[#172B50] opacity-75 mt-1">
                  ₹{prog.feeMonthly.toLocaleString()}/mo • {prog.studentsCount} Active Kids
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FFF4E8] flex items-center justify-center shrink-0 border border-[#172B5015]">
                <Award className="w-5 h-5 text-[#F4510B]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Class Timetables Table */}
      <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
        <div className="p-4 border-b border-[#172B5015] bg-[#FFF4E8]/50 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#172B50]">Active Academy Batches & Capacity</h3>
          <span className="text-xs font-bold text-[#172B50] opacity-70">
            {data.classes.length} Schedules Running
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FFF4E8] text-[#172B50] font-extrabold uppercase tracking-wider text-[11px] border-b border-[#172B5015]">
                <th className="py-3 px-4">Batch Name & Program</th>
                <th className="py-3 px-4">Center & Facility</th>
                <th className="py-3 px-4">Assigned Coach</th>
                <th className="py-3 px-4">Schedule Timings</th>
                <th className="py-3 px-4">Capacity Utilization</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172B5010]">
              {data.classes.map(cls => {
                const fillPct = Math.round((cls.enrolled / cls.capacity) * 100);
                return (
                  <tr key={cls.id} className="hover:bg-[#FFF4E8]/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-[#172B50] text-sm block">{cls.name}</span>
                      <span className="text-[10px] text-[#F4510B] font-bold">{cls.program} • {cls.level}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-[#172B50] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                        <span>{cls.center}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-extrabold text-[#172B50]">{cls.coach}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#172B50] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#172B50] opacity-60" />
                        <span>{cls.schedule}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-[#FFF4E8] rounded-full overflow-hidden border border-[#172B5015]">
                          <div 
                            style={{ width: `${fillPct}%` }}
                            className={`h-full rounded-full ${fillPct >= 90 ? 'bg-[#F4510B]' : 'bg-[#172B50]'}`}
                          />
                        </div>
                        <span className="font-extrabold text-[#172B50] text-[11px]">
                          {cls.enrolled}/{cls.capacity} ({fillPct}%)
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#172B50] text-white">
                        {cls.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Class Modal */}
      <Modal
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        title="Schedule New Training Batch"
        subtitle="Set up days, venue, capacity and assign coach"
      >
        <form onSubmit={handleAddClass} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Batch Title *</label>
            <input
              type="text"
              required
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. Football Tigers - Weekend League"
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Sports Program</label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {data.programs.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Skill Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Assigned Coach</label>
              <select
                value={coach}
                onChange={(e) => setCoach(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              >
                {data.coaches.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Center Venue</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Schedule & Days</label>
              <input
                type="text"
                required
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="Tue, Thu, Sat (5:00 PM - 6:30 PM)"
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">Max Student Capacity</label>
              <input
                type="number"
                min="5"
                max="40"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddClassOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Create Batch
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
