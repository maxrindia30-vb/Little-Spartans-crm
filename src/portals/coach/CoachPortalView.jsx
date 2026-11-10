import React, { useState } from 'react';
import { 
  Calendar, 
  GraduationCap, 
  ClipboardCheck, 
  Trophy, 
  CalendarOff, 
  BookOpen, 
  Bell, 
  UserCheck2,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  Star,
  Activity,
  Award,
  Shield,
  Heart
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import KpiCard from '../../components/common/KpiCard';
import Modal from '../../components/common/Modal';

export default function CoachPortalView() {
  const { currentView, setCurrentView, data, markAttendance, applyLeave, addToast } = useCrm();

  const coachProfile = data.coaches[0]; // Coach Vikram Singh
  const myClasses = data.classes.filter(c => c.coachId === coachProfile.id || c.coach.includes(coachProfile.name.split(' ')[0]));
  const myStudents = data.students.filter(s => s.coachName.includes('Vikram') || s.program.includes('Gymnastics'));

  // Attendance state
  const [attendanceMap, setAttendanceMap] = useState({
    'STU-001': 'Present',
    'STU-003': 'Present',
    'STU-007': 'Present',
  });

  // Evaluation states
  const [evalStudent, setEvalStudent] = useState(myStudents[0]?.id || 'STU-001');
  const [evalScores, setEvalScores] = useState({
    agility: 9,
    speed: 8,
    balance: 9,
    discipline: 10,
    spirit: 10
  });

  // Leave Modal
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [leaveStart, setLeaveStart] = useState('2026-11-25');
  const [leaveEnd, setLeaveEnd] = useState('2026-11-26');
  const [leaveReason, setLeaveReason] = useState('');

  const handleApplyCoachLeave = (e) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    applyLeave({
      type: 'Coach',
      applicantName: coachProfile.name,
      coachId: coachProfile.id,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason,
      reviewedBy: 'Pending Head Coach'
    });

    setIsLeaveOpen(false);
    setLeaveReason('');
  };

  const handleSaveEvaluation = () => {
    addToast('Athlete performance assessment saved and synced to parent report card!');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. COACH DASHBOARD */}
      {currentView === 'dashboard' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#172B50] text-white tracking-wider animate-pulse">
                  Coach Workspace
                </span>
                <span className="text-xs font-semibold text-[#172B50] opacity-60">FIG Certified Faculty</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
                Coach Command: {coachProfile.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
                Head Coach • {coachProfile.specialization} ({coachProfile.center})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('attendance')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-md hover:bg-[#DC4405] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <ClipboardCheck className="w-4 h-4 text-white" />
                <span>Mark Attendance</span>
              </button>

              <button
                onClick={() => setIsLeaveOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-white text-[#172B50] border border-[#172B5025] rounded-xl hover:bg-[#FFF4E8] hover:border-[#F4510B55] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <CalendarOff className="w-4 h-4 text-[#F4510B]" />
                <span>Coach Leave</span>
              </button>
            </div>
          </div>

          {/* Live On-Court Training Session Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#172B50] via-[#1E345D] to-[#254173] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-[#F4510B]/20 to-transparent pointer-events-none" />
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#F4510B]/20 border border-[#F4510B]/40 flex items-center justify-center text-xl shrink-0">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F4510B] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#F4510B]"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#FFA366]">
                    Live On-Court Training Session
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#F4510B] text-white animate-pulse">
                    IN PROGRESS
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                  Gymnastics & Agility Batch A • Court 2 (24 Athletes Active)
                </h4>
              </div>
            </div>
            <button 
              onClick={() => setCurrentView('attendance')}
              className="relative z-10 px-4 py-2 rounded-xl bg-[#F4510B] hover:bg-[#DC4405] text-white text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
            >
              Take Live Roll Call &rarr;
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Active Batches"
              value={coachProfile.activeBatches}
              subtitle="Indiranagar Arena"
              icon={Calendar}
            />
            <KpiCard
              title="Athletes Trained"
              value={coachProfile.studentsCount}
              subtitle="Across Junior Programs"
              icon={GraduationCap}
              highlight={true}
            />
            <KpiCard
              title="Coach Rating"
              value={`${coachProfile.rating} / 5.0`}
              subtitle="From 42 Parent Reviews"
              icon={Star}
            />
            <KpiCard
              title="Punctuality Score"
              value="99.2%"
              subtitle="Official FIG Certified"
              icon={Award}
            />
          </div>

          {/* Today's Training Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
              <div className="flex items-center justify-between pb-3 border-b border-[#172B5012]">
                <h3 className="text-sm font-extrabold text-[#172B50] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#F4510B]" />
                  <span>Today's Training Drills Schedule</span>
                </h3>
                <span className="text-xs font-bold text-[#F4510B]">Active Day</span>
              </div>

              <div className="space-y-3 mt-3.5">
                {myClasses.map(cls => (
                  <div key={cls.id} className="p-3.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-[#172B50] block">{cls.name}</span>
                      <p className="text-[11px] text-[#172B50] opacity-75 mt-0.5">{cls.schedule}</p>
                      <span className="text-[10px] font-bold text-[#F4510B]">{cls.enrolled}/{cls.capacity} Athletes Expected</span>
                    </div>
                    <button
                      onClick={() => setCurrentView('attendance')}
                      className="px-3 py-1.5 text-xs font-bold bg-[#172B50] text-white rounded-lg hover:bg-[#F4510B] transition-colors"
                    >
                      Roster
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Athlete Skill Evaluation */}
            <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
              <div className="flex items-center justify-between pb-3 border-b border-[#172B5012]">
                <h3 className="text-sm font-extrabold text-[#172B50] flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-[#F4510B]" />
                  <span>Quick Athlete Evaluation</span>
                </h3>
                <button
                  onClick={() => setCurrentView('evaluations')}
                  className="text-xs font-bold text-[#F4510B] hover:underline"
                >
                  Full Rubric
                </button>
              </div>

              <div className="mt-3.5 space-y-3">
                <div className="p-3 rounded-xl bg-[#FFF4E8] border border-[#172B5015]">
                  <span className="text-xs font-bold text-[#172B50] block">Athlete: Aarav Sharma (7 yrs)</span>
                  <p className="text-[11px] text-[#172B50] opacity-75 mt-0.5">Agility: 9/10 • Balance: 9/10 • Discipline: 10/10</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#172B50] text-white">
                    Recommended for Agility Cup 2026
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FFF4E8] border border-[#172B5015]">
                  <span className="text-xs font-bold text-[#172B50] block">Athlete: Kabir Patel (6 yrs)</span>
                  <p className="text-[11px] text-[#172B50] opacity-75 mt-0.5">Agility: 8/10 • Balance: 8/10 • Flexibility: 9/10</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#F4510B] text-white">
                    Punctuality Honor Nominee
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MY CLASSES */}
      {currentView === 'classes' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            My Training Batches & Drill Plans
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myClasses.map(cls => (
              <div key={cls.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
                <span className="text-[10px] font-bold uppercase text-[#F4510B]">{cls.program}</span>
                <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{cls.name}</h3>
                <div className="mt-3 space-y-1.5 text-xs text-[#172B50]">
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F4510B]" />
                    <span className="font-semibold">{cls.schedule}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#F4510B]" />
                    <span>{cls.center} (Court 2)</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#F4510B]" />
                    <span className="font-bold">{cls.enrolled} Enrolled / {cls.capacity} Capacity</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#172B5015] flex gap-2">
                  <button
                    onClick={() => setCurrentView('attendance')}
                    className="flex-1 py-1.5 text-xs font-bold bg-[#F4510B] text-white rounded-lg hover:brightness-110"
                  >
                    Take Attendance
                  </button>
                  <button
                    onClick={() => setCurrentView('induction')}
                    className="flex-1 py-1.5 text-xs font-bold bg-white text-[#172B50] border border-[#172B5020] rounded-lg hover:bg-[#FFF4E8]"
                  >
                    View Drills
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MY STUDENTS */}
      {currentView === 'students' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            My Athlete Roster
          </h1>
          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF4E8] text-[#172B50] font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Athlete</th>
                  <th className="p-3.5">Age & Rank</th>
                  <th className="p-3.5">Attendance</th>
                  <th className="p-3.5">Medical Alert</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B5010]">
                {myStudents.map(s => (
                  <tr key={s.id}>
                    <td className="p-3.5">
                      <span className="font-extrabold text-[#172B50] block">{s.name}</span>
                      <span className="text-[10px] text-[#172B50] opacity-60">{s.id}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-[#172B50]">{s.age} yrs • {s.rank}</span>
                    </td>
                    <td className="p-3.5 font-bold text-[#F4510B]">
                      {s.attendanceRate}%
                    </td>
                    <td className="p-3.5 text-[#172B50] opacity-80 text-[11px]">
                      {s.medicalNote}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setCurrentView('evaluations')}
                        className="px-2.5 py-1 text-xs font-bold bg-[#172B50] text-white rounded-lg hover:bg-[#F4510B]"
                      >
                        Evaluate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ATTENDANCE */}
      {currentView === 'attendance' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
              Mark Session Attendance: Gymnastics Batch A
            </h1>
            <button
              onClick={() => addToast('Session attendance locked and submitted to academy director!')}
              className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              Submit Attendance
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
            <div className="p-4 bg-[#FFF4E8] border-b border-[#172B5015] flex justify-between items-center">
              <span className="text-xs font-bold text-[#172B50]">
                Session Date: {new Date().toISOString().split('T')[0]} • Indiranagar Arena
              </span>
              <span className="text-xs font-black text-[#F4510B]">
                {Object.values(attendanceMap).filter(v => v === 'Present').length} Athletes Present
              </span>
            </div>

            <div className="divide-y divide-[#172B5010]">
              {myStudents.map(s => {
                const status = attendanceMap[s.id] || 'Present';
                return (
                  <div key={s.id} className="p-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-[#172B50] text-sm block">{s.name}</span>
                      <span className="text-[10px] text-[#172B50] opacity-60">{s.rank}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {['Present', 'Absent', 'Late'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => setAttendanceMap(prev => ({ ...prev, [s.id]: opt }))}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            status === opt
                              ? opt === 'Present' ? 'bg-[#172B50] text-white' : opt === 'Absent' ? 'bg-[#F4510B] text-white' : 'bg-[#172B50] text-white'
                              : 'bg-[#FFF4E8] text-[#172B50]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. EVALUATIONS */}
      {currentView === 'evaluations' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Spartan Athlete Skill Assessments
          </h1>

          <div className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#172B5015]">
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Select Athlete to Evaluate</label>
                <select
                  value={evalStudent}
                  onChange={(e) => setEvalStudent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] rounded-xl outline-none"
                >
                  {myStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.age} yrs - {s.rank})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#172B50] block mb-1">Assessment Term</label>
                <input
                  type="text"
                  disabled
                  value="Q4 2026 Term Final Evaluation"
                  className="w-full px-3 py-2 text-xs bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Rubrics */}
            <div className="space-y-3">
              {[
                { key: 'agility', label: 'Motor Agility & Obstacle Navigation' },
                { key: 'speed', label: 'Reaction Time & Sprint Velocity' },
                { key: 'balance', label: 'Core Strength & Balance Beam Stance' },
                { key: 'discipline', label: 'Coach Punctuality & Listening Discipline' },
                { key: 'spirit', label: 'Spartan Spirit & Team Encouragement' },
              ].map(rubric => (
                <div key={rubric.key} className="p-3 bg-[#FFF4E8] rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-[#172B50]">{rubric.label}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={evalScores[rubric.key]}
                      onChange={(e) => setEvalScores(prev => ({ ...prev, [rubric.key]: parseInt(e.target.value) }))}
                      className="accent-[#F4510B]"
                    />
                    <span className="text-xs font-black text-[#F4510B] w-6 text-right">
                      {evalScores[rubric.key]}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#172B5015] flex justify-end">
              <button
                onClick={handleSaveEvaluation}
                className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl hover:brightness-110 shadow-sm"
              >
                Save Evaluation Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. COMPETITIONS */}
      {currentView === 'competitions' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Tournament Squad Nominations
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {data.competitions.map(comp => (
              <div key={comp.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#F4510B]">{comp.sport}</span>
                  <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{comp.title}</h3>
                  <p className="text-xs text-[#172B50] opacity-75 mt-1">{comp.date} • {comp.venue}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#172B5015]">
                  <button
                    onClick={() => addToast(`Squad list for ${comp.title} submitted to organizers.`)}
                    className="w-full py-2 text-xs font-bold bg-[#172B50] text-white rounded-lg hover:bg-[#F4510B] transition-colors"
                  >
                    Nominate Squad ({comp.registeredCount} Kids)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. LEAVE MANAGEMENT */}
      {currentView === 'leaves' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
              Coach Leave Requests
            </h1>
            <button
              onClick={() => setIsLeaveOpen(true)}
              className="px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              Apply Leave
            </button>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
            <div className="p-3.5 bg-[#FFF4E8] rounded-xl border border-[#172B5015] flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-[#172B50]">National Coaches Clinic in Patiala</span>
                <p className="text-[11px] text-[#172B50] opacity-75">Nov 20 to Nov 21, 2026</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#172B50] text-white">
                Pending Approval
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 8. COACH INDUCTION & DRILLS */}
      {currentView === 'induction' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Little Spartans Coaching Manual & Drills
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
              <h3 className="text-sm font-extrabold text-[#172B50] pb-2 border-b border-[#172B5012]">
                Phase 1: Dynamic Warm-Up & Joint Mobility (15 mins)
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-[#172B50] opacity-85 list-disc pl-4">
                <li>High knees & Butt kicks (2 x 20m)</li>
                <li>Bear crawls & Crab walks across mat (core stabilization)</li>
                <li>Ankle & wrist rotations before balance beam routines</li>
                <li>Dynamic leg swings (front-back and lateral)</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
              <h3 className="text-sm font-extrabold text-[#172B50] pb-2 border-b border-[#172B5012]">
                Phase 2: Spartan Agility Obstacle Circuit (25 mins)
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-[#172B50] opacity-85 list-disc pl-4">
                <li>Station 1: Agility ladder icky-shuffle with speed ball touch</li>
                <li>Station 2: Low hurdle hop & roll into landing mat</li>
                <li>Station 3: Balance beam walk with medicine ball pass</li>
                <li>Station 4: 10m sprint dash to finish buzzer</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
              <h3 className="text-sm font-extrabold text-[#172B50] pb-2 border-b border-[#172B5012]">
                Pediatric Safety & Hydration Mandates
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-[#172B50] opacity-85 list-disc pl-4">
                <li>Mandatory 3-minute water break every 20 minutes</li>
                <li>Always ensure spotters on beam heights above 3 feet</li>
                <li>Check student medical alerts in roster before high intensity sprints</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
              <h3 className="text-sm font-extrabold text-[#172B50] pb-2 border-b border-[#172B5012]">
                Spartan Warrior Oath (End of Session)
              </h3>
              <p className="mt-3 text-xs italic text-[#172B50] bg-[#FFF4E8] p-3 rounded-xl border border-[#172B5015]">
                "I am strong. I am brave. I never give up. I respect my teammates and coaches. I am a Spartan!"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 9. ANNOUNCEMENTS */}
      {currentView === 'announcements' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Faculty Notices & Academy Circulars
          </h1>
          <div className="space-y-4">
            {data.announcements.map(ann => (
              <div key={ann.id} className="bg-white rounded-2xl p-5 border border-[#172B501A] shadow-card">
                <span className="text-[10px] font-bold text-[#F4510B] uppercase">{ann.date} • {ann.target}</span>
                <h3 className="text-base font-extrabold text-[#172B50] mt-0.5">{ann.title}</h3>
                <p className="text-xs text-[#172B50] opacity-80 mt-2">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. PROFILE */}
      {currentView === 'profile' && (
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Coach Profile & Credentials
          </h1>
          <div className="bg-white rounded-2xl p-6 border border-[#172B501A] shadow-card space-y-4 text-xs">
            <div className="flex items-center gap-4 pb-4 border-b border-[#172B5015]">
              <div className="w-16 h-16 rounded-2xl bg-[#172B50] flex items-center justify-center text-white text-xl font-bold">
                VS
              </div>
              <div>
                <h3 className="text-lg font-black text-[#172B50]">{coachProfile.name}</h3>
                <p className="text-xs text-[#172B50] opacity-75">{coachProfile.email} • {coachProfile.phone}</p>
                <span className="text-[10px] font-bold text-[#F4510B]">{coachProfile.certification}</span>
              </div>
            </div>
            <div className="space-y-2 text-[#172B50]">
              <p><span className="font-bold">Specialization:</span> {coachProfile.specialization}</p>
              <p><span className="font-bold">Coaching Experience:</span> {coachProfile.experience}</p>
              <p><span className="font-bold">Base Training Facility:</span> {coachProfile.center}</p>
              <p><span className="font-bold">Overall Faculty Rating:</span> {coachProfile.rating} / 5.0 (5 Star)</p>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isLeaveOpen}
        onClose={() => setIsLeaveOpen(false)}
        title="Apply Coach Leave"
        subtitle="Request substitute coverage for training batch"
      >
        <form onSubmit={handleApplyCoachLeave} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">From Date</label>
              <input
                type="date"
                required
                value={leaveStart}
                onChange={(e) => setLeaveStart(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#172B50] block mb-1">To Date</label>
              <input
                type="date"
                required
                value={leaveEnd}
                onChange={(e) => setLeaveEnd(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#172B50] block mb-1">Reason & Substitute Note *</label>
            <textarea
              rows="3"
              required
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="e.g. Attending NIS Gymnastics Clinic. Coach Rahul will cover Friday batch."
              className="w-full px-3 py-2 text-xs bg-white text-[#172B50] border border-[#172B5025] rounded-xl focus:ring-2 focus:ring-[#F4510B] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#172B5015] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsLeaveOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#172B50] hover:bg-[#FFF4E8] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110"
            >
              Submit Leave
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
