import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, X, ShieldCheck, FileText, UserCheck, AlertTriangle } from 'lucide-react';

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCaptureConfirm,
  title = 'Live Camera Verification',
  subtitle = 'Please capture a clear photo of yourself to confirm attendance.',
  location = 'KK NAGAR',
  coachName = 'Coach',
  actionType = 'checkin', // 'checkin' | 'checkout'
}) {
  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [showExceptionForm, setShowExceptionForm] = useState(false);

  // Exception form state
  const [exceptionReason, setExceptionReason] = useState('Camera Hardware Unavailable');
  const [exceptionApprovedBy, setExceptionApprovedBy] = useState('Balavivek S (Director)');
  const [exceptionNotes, setExceptionNotes] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Stop camera tracks cleanly
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (_) {}
      });
      setStream(null);
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch (_) {}
    }
  }, [stream]);

  // Start live webcam stream
  const startCamera = useCallback(async () => {
    setIsLoadingCamera(true);
    setCameraError(null);
    setCapturedPhoto(null);
    setShowExceptionForm(false);

    // Stop any existing stream first
    if (stream) {
      stream.getTracks().forEach((t) => {
        try { t.stop(); } catch (_) {}
      });
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera hardware access is not supported by this browser.');
      }

      // Check secure context
      if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        throw new Error('Camera access requires a secure connection (HTTPS or localhost).');
      }

      let mediaStream = null;
      try {
        // Preferred: front-facing user camera with HD preference
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'user' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (firstErr) {
        // Fallback: any available video input
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Webcam stream unavailable:', err);
      let errMsg = 'Unable to access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'Camera permission was denied. Please allow camera access in browser site settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = 'No camera hardware device found on this system.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errMsg = 'Camera is already in use by another application. Please close other camera apps and retry.';
      } else {
        errMsg = err.message || 'Camera initialization failed.';
      }
      setCameraError(errMsg);
    } finally {
      setIsLoadingCamera(false);
    }
  }, [stream]);

  // Attach stream to video whenever videoRef becomes ready
  useEffect(() => {
    if (videoRef.current && stream && !capturedPhoto) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream, capturedPhoto]);

  // Open modal effect
  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      setShowExceptionForm(false);
      startCamera();
    } else {
      stopStream();
      setCapturedPhoto(null);
      setCameraError(null);
      setShowExceptionForm(false);
    }
    return () => {
      stopStream();
    };
  }, [isOpen]);

  // Capture snapshot from video onto canvas
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally for natural mirror selfie view
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(dataUrl);
    stopStream();
  };

  // Retake photo: clear snapshot & restart camera
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // Confirm photo capture
  const handleConfirm = () => {
    if (!capturedPhoto) return;
    stopStream();
    onCaptureConfirm({
      photo: capturedPhoto,
      isException: false,
    });
  };

  // Submit Admin-authorized exception
  const handleSubmitException = (e) => {
    e.preventDefault();
    stopStream();
    onCaptureConfirm({
      photo: null,
      isException: true,
      exceptionReason,
      exceptionApprovedBy,
      exceptionNotes: exceptionNotes.trim(),
    });
  };

  if (!isOpen) return null;

  const nowFormatted = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#172B5018] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#172B5012] flex items-center justify-between bg-[#F8FAFC]">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${actionType === 'checkin' ? 'bg-emerald-500' : 'bg-orange-500'} animate-pulse`} />
              <h3 className="text-base font-black text-[#172B50] tracking-tight">{title}</h3>
            </div>
            <p className="text-xs text-[#172B5099] mt-0.5">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-200 text-[#172B5080] hover:text-[#172B50] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder / Captured Preview Area */}
        <div className="p-6 flex flex-col items-center">
          {showExceptionForm ? (
            /* State: Admin-Authorized Exception Workflow */
            <form onSubmit={handleSubmitException} className="w-full space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">Camera Unavailable Exception Workflow</p>
                  <p className="mt-0.5 text-amber-800">
                    If camera permission is restricted or hardware is unavailable, an Admin-authorized exception records attendance with a mandatory audit reason.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#172B50] mb-1">
                  Reason for Camera Exception *
                </label>
                <select
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFF4E8]/40 border border-[#172B5018] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B]"
                >
                  <option value="Camera Hardware Unavailable">Camera Hardware Unavailable / Damaged</option>
                  <option value="Browser Permission Denied">Browser Permission Restricted by OS / Browser</option>
                  <option value="Camera Already in Use">Camera Device Already in Use by Another Application</option>
                  <option value="Field Device Without Camera">Field Tablet Device Without Functional Camera</option>
                  <option value="Emergency Shift Verification">Emergency Shift Verification by Center Head</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-[#172B50] mb-1">
                  Approving Administrator / Super Coach *
                </label>
                <select
                  value={exceptionApprovedBy}
                  onChange={(e) => setExceptionApprovedBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFF4E8]/40 border border-[#172B5018] rounded-xl text-xs font-bold text-[#172B50] focus:outline-none focus:border-[#F4510B]"
                >
                  <option value="Balavivek S (Director)">Balavivek S (Academy Director)</option>
                  <option value="Anita R. (Super Coach)">Anita R. (Super Coach)</option>
                  <option value="Center Operations Coordinator">Center Operations Coordinator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-[#172B50] mb-1">
                  Exception Remarks / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={exceptionNotes}
                  onChange={(e) => setExceptionNotes(e.target.value)}
                  placeholder="e.g. Verified in person at KK Nagar Academy grounds"
                  className="w-full px-3.5 py-2 bg-[#FFF4E8]/40 border border-[#172B5018] rounded-xl text-xs text-[#172B50] focus:outline-none focus:border-[#F4510B]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExceptionForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-100 transition"
                >
                  Back to Camera
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-amber-600 hover:bg-amber-700 transition flex items-center gap-1.5 shadow-md"
                >
                  <UserCheck size={14} />
                  <span>Submit Authorized Exception</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="relative w-full aspect-4/3 max-w-md bg-[#0F172A] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border border-[#172B501A]">
              {/* Hidden canvas for taking snapshot */}
              <canvas ref={canvasRef} className="hidden" />

              {/* State 1: Photo captured preview */}
              {capturedPhoto ? (
                <div className="relative w-full h-full">
                  <img
                    src={capturedPhoto}
                    alt="Captured Attendance Verification"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/20">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Photo Captured</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-black/65 backdrop-blur-xs text-white text-[11px] px-3 py-1.5 rounded-xl flex items-center justify-between border border-white/20">
                    <span>📍 {location}</span>
                    <span>🕒 {nowFormatted}</span>
                  </div>
                </div>
              ) : cameraError ? (
                /* State 2: Camera error / permission fallback */
                <div className="p-6 text-center text-white flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                    <AlertCircle size={26} />
                  </div>
                  <p className="text-xs font-semibold text-rose-200 mb-2">{cameraError}</p>
                  <p className="text-[11px] text-slate-300 max-w-xs mb-4">
                    Please grant camera access in browser permissions, or submit an Admin-authorized exception.
                  </p>
                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>Retry Camera Permission</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowExceptionForm(true)}
                      className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2 shadow-md"
                    >
                      <FileText size={14} />
                      <span>Request Admin-Authorized Exception</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* State 3: Live Video Stream */
                <div className="relative w-full h-full flex items-center justify-center">
                  {isLoadingCamera && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white z-10">
                      <RefreshCw size={24} className="animate-spin text-orange-500 mb-2" />
                      <span className="text-xs text-slate-300">Initializing live camera...</span>
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {/* Viewfinder Guideline Box */}
                  <div className="absolute inset-8 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none flex items-center justify-center">
                    <div className="w-32 h-40 rounded-full border border-white/30" />
                  </div>
                  {/* Live Badge */}
                  <div className="absolute top-3 left-3 bg-emerald-500/90 text-white text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>LIVE CAM</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] px-3 py-1.5 rounded-xl flex items-center justify-between border border-white/20">
                    <span>📍 {location}</span>
                    <span>🕒 {nowFormatted}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subtext info */}
          {!showExceptionForm && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-[#172B5080]">
              <ShieldCheck size={14} className="text-[#F4510B]" />
              <span>Attendance photo is tagged with timestamp and location coordinates.</span>
            </div>
          )}
        </div>

        {/* Footer Actions (when not in exception form) */}
        {!showExceptionForm && (
          <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#172B5012] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                stopStream();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>

            {capturedPhoto ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] bg-white border border-[#172B5020] hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Retake</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-[#F4510B] hover:bg-[#d94406] transition flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>Confirm & {actionType === 'checkin' ? 'Check In' : 'Check Out'}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={!!cameraError || isLoadingCamera}
                onClick={handleCapture}
                className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-[#F4510B] hover:bg-[#d94406] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <Camera size={14} />
                <span>Capture Photo</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
