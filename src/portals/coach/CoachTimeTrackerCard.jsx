import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Maximize2,
  X,
  Timer,
  CalendarCheck,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import CameraCaptureModal from '../../components/common/CameraCaptureModal';
import {
  COACH_ATTENDANCE_STATUS,
  formatDisplayTime,
  calculateWorkingDuration,
  formatLiveDuration,
} from '../../services/coachAttendanceService';

export default function CoachTimeTrackerCard({
  coachProfile,
  todayAttendance,
  hasSavedStudentAttendance,
  onCheckIn,
  onCheckOut,
  onOpenStudentAttendance,
}) {
  const [now, setNow] = useState(new Date());
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState('checkin'); // 'checkin' | 'checkout'
  const [isPhotoZoomOpen, setIsPhotoZoomOpen] = useState(false);
  const [zoomPhotoData, setZoomPhotoData] = useState(null);

  const availableLocations = useMemo(() => {
    if (coachProfile?.assignedLocations && coachProfile.assignedLocations.length > 0) {
      return coachProfile.assignedLocations;
    }
    return [coachProfile?.center || 'KK NAGAR'];
  }, [coachProfile]);

  const [selectedLocation, setSelectedLocation] = useState(availableLocations[0] || 'KK NAGAR');

  // Update selected location if coach profile updates
  useEffect(() => {
    if (availableLocations.length > 0 && !availableLocations.includes(selectedLocation)) {
      setSelectedLocation(availableLocations[0]);
    }
  }, [availableLocations, selectedLocation]);

  // Live ticking clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeFormatted = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateFormatted = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isCheckedIn = todayAttendance?.status === COACH_ATTENDANCE_STATUS.CHECKED_IN;
  const isCompleted = todayAttendance?.status === COACH_ATTENDANCE_STATUS.COMPLETED;
  const isNotCheckedIn = !todayAttendance || todayAttendance.status === COACH_ATTENDANCE_STATUS.NOT_CHECKED_IN;

  // Working duration calculation
  const workingDuration = useMemo(() => {
    if (isCompleted && todayAttendance) {
      return todayAttendance.totalDurationFormatted || calculateWorkingDuration(todayAttendance.checkInIso, todayAttendance.checkOutIso).formatted;
    }
    if (isCheckedIn && todayAttendance?.checkInIso) {
      return formatLiveDuration(todayAttendance.checkInIso, now);
    }
    return '--';
  }, [isCompleted, isCheckedIn, todayAttendance, now]);

  // Check-In handler
  const handleOpenCheckIn = () => {
    setCameraMode('checkin');
    setIsCameraOpen(true);
  };

  // Check-Out handler
  const handleOpenCheckOut = () => {
    if (!hasSavedStudentAttendance) return;
    setCameraMode('checkout');
    setIsCameraOpen(true);
  };

  // Capture callback
  const handleCaptureConfirm = (photoData) => {
    setIsCameraOpen(false);
    if (cameraMode === 'checkin') {
      onCheckIn({
        coachId: coachProfile.id,
        coachName: coachProfile.name,
        location: selectedLocation,
        photo: photoData,
      });
    } else {
      onCheckOut({
        coachId: coachProfile.id,
        location: todayAttendance?.locationName || selectedLocation,
        photo: photoData,
      });
    }
  };

  const openPhotoZoom = (photoUrl, title, time) => {
    if (!photoUrl) return;
    setZoomPhotoData({ photoUrl, title, time, location: todayAttendance?.locationName || selectedLocation });
    setIsPhotoZoomOpen(true);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-4 sm:p-5 border border-[#172B5014] shadow-[0_4px_24px_rgba(23,43,80,0.04)] mb-4 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Clock, Status Badge, Location */}
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
          {/* Active Photo Thumbnail or Avatar */}
          <div className="relative group shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-[#172B5018] shadow-xs flex items-center justify-center">
              {todayAttendance?.checkInPhoto ? (
                <img
                  src={todayAttendance.checkInPhoto}
                  alt={coachProfile.name}
                  className="w-full h-full object-cover cursor-pointer transition group-hover:scale-105"
                  onClick={() => openPhotoZoom(todayAttendance.checkInPhoto, 'Check-In Photo', todayAttendance.checkInTime)}
                />
              ) : coachProfile.avatar ? (
                <img
                  src={coachProfile.avatar}
                  alt={coachProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-6 h-6 text-slate-400" />
              )}
            </div>

            {todayAttendance?.checkInPhoto && (
              <button
                type="button"
                onClick={() => openPhotoZoom(todayAttendance.checkInPhoto, 'Check-In Photo', todayAttendance.checkInTime)}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#172B5020] shadow-xs flex items-center justify-center text-[#172B50] hover:text-[#F4510B] transition"
                title="View full-resolution photo"
              >
                <Maximize2 size={11} />
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-[#172B50] tracking-tight font-mono">
                {timeFormatted}
              </span>

              {/* Status Badge */}
              {isCheckedIn && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Checked In
                </span>
              )}

              {isCompleted && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                  <CheckCircle2 size={13} className="text-blue-600" />
                  Shift Completed
                </span>
              )}

              {isNotCheckedIn && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Not Checked In Today
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-[#172B5090] flex-wrap">
              <span>{dateFormatted}</span>
              <span>•</span>
              <div className="flex items-center gap-1 font-semibold text-[#172B50]">
                <MapPin size={13} className="text-[#F4510B]" />
                {isNotCheckedIn && availableLocations.length > 1 ? (
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="bg-transparent border-b border-[#172B5030] text-xs font-bold text-[#172B50] focus:outline-none cursor-pointer"
                  >
                    {availableLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>{todayAttendance?.locationName || selectedLocation}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Timing KPI Strip */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 py-2 px-3 sm:px-4 bg-[#F8FAFC] rounded-2xl border border-[#172B500C] self-stretch items-center">
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#172B5070] block">
              Check-In
            </span>
            <span className="text-xs sm:text-sm font-black text-[#172B50] font-mono mt-0.5 block">
              {todayAttendance?.checkInTime || '--:--'}
            </span>
          </div>

          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#172B5070] block">
              Check-Out
            </span>
            <span className="text-xs sm:text-sm font-black text-[#172B50] font-mono mt-0.5 block">
              {todayAttendance?.checkOutTime || '--:--'}
            </span>
          </div>

          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#172B5070] block flex items-center gap-1">
              <Timer size={11} className="text-[#F4510B]" />
              Duration
            </span>
            <span className="text-xs sm:text-sm font-black text-[#F4510B] font-mono mt-0.5 block">
              {workingDuration}
            </span>
          </div>
        </div>

        {/* Right: Actions (Check In / Check Out) */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0">
          {isNotCheckedIn && (
            <button
              type="button"
              onClick={handleOpenCheckIn}
              className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-[#F4510B] hover:bg-[#d94406] shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera size={15} />
              <span>Camera Check-In</span>
            </button>
          )}

          {isCheckedIn && (
            <div className="flex flex-col items-end gap-1.5 w-full">
              <button
                type="button"
                onClick={handleOpenCheckOut}
                disabled={!hasSavedStudentAttendance}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                  hasSavedStudentAttendance
                    ? 'text-white bg-[#F4510B] hover:bg-[#d94406] shadow-md shadow-orange-500/20 cursor-pointer'
                    : 'text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed opacity-75'
                }`}
                title={
                  hasSavedStudentAttendance
                    ? 'Click to capture checkout photo and complete shift'
                    : "Save today's student attendance to enable Check Out."
                }
              >
                {hasSavedStudentAttendance ? <Unlock size={15} /> : <Lock size={15} />}
                <span>Check Out</span>
              </button>

              {!hasSavedStudentAttendance ? (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-xl border border-amber-200/80">
                  <AlertTriangle size={12} className="shrink-0 text-amber-600" />
                  <span>Save today's student attendance to enable Check Out.</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  <span>Student Attendance Verified</span>
                </div>
              )}
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2">
              {todayAttendance?.checkOutPhoto && (
                <button
                  type="button"
                  onClick={() => openPhotoZoom(todayAttendance.checkOutPhoto, 'Check-Out Photo', todayAttendance.checkOutTime)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#172B50] bg-[#F8FAFC] border border-[#172B5018] hover:bg-slate-100 transition flex items-center gap-1.5"
                >
                  <Camera size={13} />
                  <span>Check-Out Photo</span>
                </button>
              )}
              <div className="px-3.5 py-2 rounded-2xl text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>Attendance Logged</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCaptureConfirm={handleCaptureConfirm}
        actionType={cameraMode}
        title={cameraMode === 'checkin' ? 'Coach Check-In Verification' : 'Coach Check-Out Verification'}
        subtitle={
          cameraMode === 'checkin'
            ? `Please capture a live photo to confirm check-in at ${selectedLocation}.`
            : `Please capture a live photo to complete your coaching shift at ${todayAttendance?.locationName || selectedLocation}.`
        }
        location={todayAttendance?.locationName || selectedLocation}
      />

      {/* Full-Resolution Photo Zoom Modal */}
      {isPhotoZoomOpen && zoomPhotoData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#172B5020]">
            <div className="px-5 py-3.5 border-b border-[#172B5012] flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <h4 className="text-sm font-black text-[#172B50]">{zoomPhotoData.title}</h4>
                <p className="text-[11px] text-[#172B5080]">
                  {coachProfile.name} • 📍 {zoomPhotoData.location} • 🕒 {zoomPhotoData.time}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoZoomOpen(false)}
                className="p-1 rounded-full hover:bg-slate-200 text-[#172B5080] hover:text-[#172B50] transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 bg-slate-900 flex items-center justify-center">
              <img
                src={zoomPhotoData.photoUrl}
                alt={zoomPhotoData.title}
                className="max-h-[420px] w-auto rounded-2xl object-contain shadow-lg"
              />
            </div>
            <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#172B5012] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsPhotoZoomOpen(false)}
                className="px-4 py-2 bg-[#172B50] text-white rounded-xl text-xs font-bold hover:bg-[#172B50EE] transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
