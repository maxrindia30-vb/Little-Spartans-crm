import React from 'react';
import { CalendarDays, ArrowRight, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

// Default realistic sample classes specified in requirements
const DEFAULT_TODAY_CLASSES = [
  {
    id: 'TC-1',
    time: '09:00 AM',
    program: 'Junior Soccer',
    coach: 'Coach Arjun Rao',
    location: 'Downtown',
    enrolled: 18,
    capacity: 20,
    status: 'nearly_full'
  },
  {
    id: 'TC-2',
    time: '10:30 AM',
    program: 'Gymnastics',
    coach: 'Coach Priya Nair',
    location: 'Westside',
    enrolled: 18,
    capacity: 18,
    status: 'full'
  },
  {
    id: 'TC-3',
    time: '02:00 PM',
    program: 'Elite Basketball',
    coach: 'Coach Daniel Fernandes',
    location: 'North Hub',
    enrolled: 11,
    capacity: 14,
    status: 'available'
  }
];

function CapacityBadge({ enrolled, capacity, status }) {
  const isFull = status === 'full' || enrolled >= capacity;
  const isNearlyFull = status === 'nearly_full' || (!isFull && enrolled / capacity >= 0.8);

  if (isFull) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#F4510B] text-white shadow-xs select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
        <span>Full {enrolled}/{capacity}</span>
      </span>
    );
  }

  if (isNearlyFull) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-xs select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        <span>{enrolled}/{capacity}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5014] shadow-xs select-none">
      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
      <span>{enrolled}/{capacity}</span>
    </span>
  );
}

export default function TodaysClassesSection({ className = '' }) {
  const { data, setCurrentView } = useCrm();

  // If live class schedules are added by admin, map them, otherwise display the realistic sample rows
  const classesList = (data.classSchedules && data.classSchedules.length > 0)
    ? data.classSchedules.slice(0, 5).map((s, idx) => {
        const enrolled = s.enrolledCount ?? (s.enrolledStudents ? s.enrolledStudents.length : 0);
        const capacity = s.capacity || 20;
        let status = 'available';
        if (enrolled >= capacity) status = 'full';
        else if (enrolled / capacity >= 0.8) status = 'nearly_full';

        return {
          id: s.id || `LIVE-${idx}`,
          time: s.startTime || s.time || '09:00 AM',
          program: s.className || s.program || 'Junior Multi-Sport',
          coach: s.coachName || s.coach || 'Assigned Coach',
          location: s.location || s.center || 'KK NAGAR',
          enrolled,
          capacity,
          status
        };
      })
    : DEFAULT_TODAY_CLASSES;

  return (
    <div
      className={`bg-white rounded-[22px] border border-[#172B5012] shadow-[0_4px_25px_rgba(23,43,80,0.03)] p-5 sm:p-6 overflow-hidden transition-all ${className}`}
    >
      {/* Header with Title, Calendar Icon and View Schedule CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#172B5010]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0 border border-[#F4510B22]">
            <CalendarDays className="w-4 h-4 text-[#F4510B]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#172B50] tracking-tight">
              Today's Classes
            </h2>
            <p className="text-[11px] font-semibold text-[#172B50]/60">
              Live court sessions and attendance tracking for today
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCurrentView('schedules')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#F4510B] hover:text-white bg-[#FFF4E8] hover:bg-[#F4510B] border border-[#F4510B25] rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <span>View Schedule</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Classes Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#172B5012] text-[#172B50]/60 font-black uppercase tracking-wider text-[10.5px]">
              <th className="py-3 px-3">Time</th>
              <th className="py-3 px-3">Class / Program</th>
              <th className="py-3 px-3">Assigned Coach</th>
              <th className="py-3 px-3">Location</th>
              <th className="py-3 px-3 text-right">Capacity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#172B500C]">
            {classesList.map((cls) => (
              <tr
                key={cls.id}
                className="hover:bg-[#FFF4E8]/40 transition-colors group cursor-default"
              >
                {/* Time */}
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2 font-black text-[#172B50]">
                    <Clock className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                    <span className="tracking-tight">{cls.time}</span>
                  </div>
                </td>

                {/* Class / Program */}
                <td className="py-3.5 px-3 font-extrabold text-[#172B50] text-xs sm:text-[13px]">
                  {cls.program}
                </td>

                {/* Assigned Coach */}
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2 font-bold text-[#172B50]/85">
                    <User className="w-3.5 h-3.5 text-[#172B50]/40 shrink-0" />
                    <span>{cls.coach}</span>
                  </div>
                </td>

                {/* Location */}
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-1.5 font-semibold text-[#172B50]/75">
                    <MapPin className="w-3.5 h-3.5 text-[#F4510B] shrink-0" />
                    <span>{cls.location}</span>
                  </div>
                </td>

                {/* Capacity */}
                <td className="py-3.5 px-3 text-right">
                  <CapacityBadge
                    enrolled={cls.enrolled}
                    capacity={cls.capacity}
                    status={cls.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
