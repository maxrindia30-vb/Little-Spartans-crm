import React, { useState, useEffect } from 'react';
import { Zap, Radio, MapPin, Sparkles, Activity, Clock } from 'lucide-react';

const LIVE_EVENTS = [
  { location: 'KK NAGAR', event: 'Gymnastics & Tumbling (Batch Alpha) court session active', time: 'Just now', color: '#F4510B' },
  { location: 'KILPAUK', event: 'Junior Football squad completing sprint agility drills', time: '2m ago', color: '#0284C7' },
  { location: 'MAHALINGAPURAM', event: 'Foundational Movement & Tumbling assessment synced', time: '4m ago', color: '#16A34A' },
  { location: 'ANNA NAGAR', event: 'Basketball Rising Stars shooting & scrimmage live', time: '6m ago', color: '#9333EA' },
  { location: 'KOLATHUR', event: 'Agility cone coordination circuit running on Court 1', time: '8m ago', color: '#F59E0B' }
];

export default function LiveActivityTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeStr, setTimeStr] = useState('');

  // Cycle events every 4.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LIVE_EVENTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const activeEvent = LIVE_EVENTS[currentIndex];

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2 border border-[#172B5014] shadow-xs flex items-center justify-between gap-3 text-xs select-none overflow-hidden">
      {/* Left Beacon */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F4510B] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F4510B]"></span>
        </span>
        <span className="font-black text-[10.5px] uppercase tracking-wider text-[#172B50] flex items-center gap-1">
          <Radio className="w-3.5 h-3.5 text-[#F4510B]" />
          <span>LIVE ARENA ACTIVITY</span>
        </span>
      </div>

      {/* Middle Animated Event Ticker */}
      <div className="flex-1 min-w-0 overflow-hidden flex items-center gap-2">
        <span
          className="px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase text-white shrink-0 transition-colors duration-300"
          style={{ backgroundColor: activeEvent.color }}
        >
          {activeEvent.location}
        </span>
        <p className="text-[11.5px] font-bold text-[#172B50] truncate animate-slide-up key={currentIndex}">
          {activeEvent.event}
        </p>
        <span className="text-[10px] text-[#172B50] opacity-50 shrink-0 hidden sm:inline">
          ({activeEvent.time})
        </span>
      </div>

      {/* Right Clock */}
      <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-[#172B50] opacity-75 shrink-0 bg-[#FFF4E8] px-2.5 py-0.5 rounded-lg border border-[#172B5010]">
        <Clock className="w-3 h-3 text-[#F4510B]" />
        <span>{timeStr}</span>
      </div>
    </div>
  );
}
