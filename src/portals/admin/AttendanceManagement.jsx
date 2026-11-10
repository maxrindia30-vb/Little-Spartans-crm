import React, { useState } from 'react';
import { ClipboardCheck, Calendar, Users, Check, X, Clock, CheckCircle2 } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export default function AttendanceManagement() {
  const { data, markAttendance, addToast } = useCrm();

  const [selectedClassId, setSelectedClassId] = useState(data.classes[0]?.id || 'CLS-101');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance state per student: { [studentId]: 'Present' | 'Absent' | 'Late' }
  const [attendanceState, setAttendanceState] = useState({
    'STU-001': 'Present',
    'STU-002': 'Absent',
    'STU-003': 'Present',
    'STU-004': 'Present',
    'STU-005': 'Late',
    'STU-006': 'Present',
    'STU-007': 'Present',
    'STU-008': 'Present',
  });

  const selectedClass = data.classes.find(c => c.id === selectedClassId) || data.classes[0];

  const handleToggle = (studentId, status) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: status
    }));
    markAttendance(selectedClassId, studentId, status);
  };

  const handleMarkAllPresent = () => {
    const updated = {};
    data.students.forEach(s => {
      updated[s.id] = 'Present';
    });
    setAttendanceState(updated);
    addToast('All athletes marked Present for today\'s session!');
  };

  const presentCount = Object.values(attendanceState).filter(s => s === 'Present').length;
  const absentCount = Object.values(attendanceState).filter(s => s === 'Absent').length;
  const lateCount = Object.values(attendanceState).filter(s => s === 'Late').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B50] tracking-tight">
            Daily Attendance Register
          </h1>
          <p className="text-xs sm:text-sm text-[#172B50] opacity-75 mt-0.5">
            Mark athlete turnout, track punctuality drills, and record excused absences
          </p>
        </div>

        <button
          onClick={handleMarkAllPresent}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#F4510B] text-white rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>Mark All Present</span>
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#172B501A] shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div>
            <label className="text-[10px] font-extrabold uppercase text-[#172B50] opacity-70 block mb-1">
              Select Batch
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none"
            >
              {data.classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.coach})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase text-[#172B50] opacity-70 block mb-1">
              Training Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] outline-none"
            />
          </div>
        </div>

        {/* Realtime Stats Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="px-3 py-1.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015] text-center">
            <span className="text-[10px] font-bold text-[#172B50] block">Present</span>
            <span className="text-xs font-black text-[#F4510B]">{presentCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015] text-center">
            <span className="text-[10px] font-bold text-[#172B50] block">Absent</span>
            <span className="text-xs font-black text-[#172B50]">{absentCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#FFF4E8] border border-[#172B5015] text-center">
            <span className="text-[10px] font-bold text-[#172B50] block">Late</span>
            <span className="text-xs font-black text-[#172B50]">{lateCount}</span>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-[#172B501A] shadow-card overflow-hidden">
        <div className="p-4 border-b border-[#172B5015] bg-[#FFF4E8]/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#172B50]">{selectedClass.name}</h3>
            <p className="text-xs text-[#172B50] opacity-75">{selectedClass.schedule} • {selectedClass.coach}</p>
          </div>
          <span className="text-xs font-bold text-[#F4510B]">
            {Math.round((presentCount / (data.students.length || 1)) * 100)}% Turnout Today
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FFF4E8] text-[#172B50] font-extrabold uppercase tracking-wider text-[11px] border-b border-[#172B5015]">
                <th className="py-3 px-4">Athlete</th>
                <th className="py-3 px-4">Spartan Rank</th>
                <th className="py-3 px-4">Term Attendance %</th>
                <th className="py-3 px-4">Emergency Contact</th>
                <th className="py-3 px-4 text-right">Attendance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172B5010]">
              {data.students.map(student => {
                const currentStatus = attendanceState[student.id] || 'Present';

                return (
                  <tr key={student.id} className="hover:bg-[#FFF4E8]/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#172B5020]"
                        />
                        <div>
                          <span className="font-extrabold text-[#172B50] block">{student.name}</span>
                          <span className="text-[10px] text-[#172B50] opacity-60">{student.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-[#172B50]">{student.rank}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-[#FFF4E8] rounded-full overflow-hidden border border-[#172B5015]">
                          <div 
                            style={{ width: `${student.attendanceRate}%` }}
                            className="h-full bg-[#172B50] rounded-full"
                          />
                        </div>
                        <span className="font-bold text-[#172B50]">{student.attendanceRate}%</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-[#172B50]">{student.parentPhone}</span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center bg-[#FFF4E8] p-1 rounded-xl border border-[#172B5015] gap-1">
                        <button
                          onClick={() => handleToggle(student.id, 'Present')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                            currentStatus === 'Present'
                              ? 'bg-[#172B50] text-white shadow-sm'
                              : 'text-[#172B50] hover:bg-white'
                          }`}
                        >
                          Present
                        </button>

                        <button
                          onClick={() => handleToggle(student.id, 'Absent')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                            currentStatus === 'Absent'
                              ? 'bg-[#F4510B] text-white shadow-sm'
                              : 'text-[#172B50] hover:bg-white'
                          }`}
                        >
                          Absent
                        </button>

                        <button
                          onClick={() => handleToggle(student.id, 'Late')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                            currentStatus === 'Late'
                              ? 'bg-[#172B50] text-white shadow-sm'
                              : 'text-[#172B50] hover:bg-white'
                          }`}
                        >
                          Late
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
