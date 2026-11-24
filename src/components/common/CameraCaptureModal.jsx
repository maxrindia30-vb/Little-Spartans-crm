import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, X, ShieldCheck, Upload } from 'lucide-react';

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCaptureConfirm,
  title = 'Live Camera Verification',
  subtitle = 'Please capture a clear photo of yourself to confirm attendance.',
  location = 'KK NAGAR',
  actionType = 'checkin', // 'checkin' | 'checkout'
}) {
  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
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
  }, [stream]);

  // Start live webcam stream
  const startCamera = useCallback(async () => {
    setIsLoadingCamera(true);
    setCameraError(null);
    setCapturedPhoto(null);

    // Stop any existing stream first
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera hardware access is not supported by this browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Webcam stream unavailable:', err);
      let errMsg = 'Unable to access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'Camera permission was denied. Please allow camera access in browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = 'No camera device found on this system.';
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
      startCamera();
    } else {
      stopStream();
      setCapturedPhoto(null);
      setCameraError(null);
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

    // Flip horizontally for natural mirror feel if selfie
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhoto(dataUrl);
    stopStream();
  };

  // Retake photo: clear snapshot & restart camera
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // Confirm photo
  const handleConfirm = () => {
    if (!capturedPhoto) return;
    stopStream();
    onCaptureConfirm(capturedPhoto);
  };

  // Fallback: file upload if webcam is blocked/missing
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCapturedPhoto(event.target.result);
        stopStream();
      }
    };
    reader.readAsDataURL(file);
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
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-200 text-[#172B5080] hover:text-[#172B50] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder / Captured Preview Area */}
        <div className="p-6 flex flex-col items-center">
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
                  Please enable camera access or upload a photo to verify your attendance.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <label className="w-full py-2.5 px-4 bg-[#F4510B] hover:bg-[#d94406] text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2 shadow-md">
                    <Upload size={14} />
                    <span>Upload Verification Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={13} />
                    <span>Retry Camera Permission</span>
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

          {/* Subtext info */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#172B5080]">
            <ShieldCheck size={14} className="text-[#F4510B]" />
            <span>Attendance photo is tagged with timestamp and location coordinates.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#172B5012] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] hover:bg-slate-200 transition"
          >
            Cancel
          </button>

          {capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#172B50] bg-white border border-[#172B5020] hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw size={13} />
                <span>Retake Photo</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 rounded-xl text-xs font-black text-white bg-[#F4510B] hover:bg-[#d94406] transition flex items-center gap-1.5 shadow-md shadow-orange-500/20"
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
              className="px-6 py-2 rounded-xl text-xs font-black text-white bg-[#F4510B] hover:bg-[#d94406] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-md shadow-orange-500/20"
            >
              <Camera size={14} />
              <span>Capture Photo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
