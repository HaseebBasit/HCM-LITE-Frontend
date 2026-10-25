'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { FaceDetector as MediaPipeFaceDetector } from '@mediapipe/tasks-vision';
import { apiFetch } from '../lib/api';
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const isRoutineVisionRuntimeNotice = (args: unknown[]) => {
  const message = args.filter((part): part is string => typeof part === 'string').join(' ');
  return message.includes('OpenGL error checking is disabled') ||
    message.includes('Created TensorFlow Lite XNNPACK delegate for CPU') ||
    message.includes('Feedback manager requires a model with a single signature inference');
};

// MediaPipe's WASM runtime writes these non-actionable startup notices directly
// to the browser console. Filter only those exact notices while this scanner is
// active; unrelated warnings and errors continue to reach the console.
const silenceRoutineVisionNotices = () => {
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;
  const filteredLog = (...args: unknown[]) => {
    if (!isRoutineVisionRuntimeNotice(args)) originalLog.apply(console, args);
  };
  const filteredWarn = (...args: unknown[]) => {
    if (!isRoutineVisionRuntimeNotice(args)) originalWarn.apply(console, args);
  };
  const filteredInfo = (...args: unknown[]) => {
    if (!isRoutineVisionRuntimeNotice(args)) originalInfo.apply(console, args);
  };
  const filteredError = (...args: unknown[]) => {
    if (!isRoutineVisionRuntimeNotice(args)) originalError.apply(console, args);
  };

  console.log = filteredLog;
  console.info = filteredInfo;
  console.warn = filteredWarn;
  console.error = filteredError;

  return () => {
    if (console.log === filteredLog) console.log = originalLog;
    if (console.info === filteredInfo) console.info = originalInfo;
    if (console.warn === filteredWarn) console.warn = originalWarn;
    if (console.error === filteredError) console.error = originalError;
  };
};

export default function AttendanceModal({
  isOpen,
  onClose,
  onSuccess,
}: AttendanceModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [faceCount, setFaceCount] = useState(0);
  const [faceBox, setFaceBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [scannerReady, setScannerReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Camera and local face detector are stopped when the modal closes.
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    let cameraStream: MediaStream | null = null;
    let detector: MediaPipeFaceDetector | null = null;
    let animationFrame = 0;
    let lastDetectionAt = 0;
    const restoreConsole = silenceRoutineVisionNotices();
    setFaceCount(0);
    setFaceBox(null);
    setScannerReady(false);
    setError(null);
    setSuccess(false);

    const startCamera = async () => {
      try {
        // Load MediaPipe only after the temporary diagnostic filter is active,
        // since its WASM module captures console methods during initialization.
        const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision');
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is unavailable in this browser.');
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        cameraStream = stream;
        const video = videoRef.current;
        if (!video) throw new Error('Camera preview could not be initialized.');
        video.srcObject = cameraStream;
        await video.play();

        const wasm = await FilesetResolver.forVisionTasks('/mediapipe/wasm');
        const faceDetector = await FaceDetector.createFromOptions(wasm, {
          baseOptions: { modelAssetPath: '/models/blaze_face_short_range.tflite' },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.6,
          minSuppressionThreshold: 0.3,
        });
        if (!active) {
          faceDetector.close();
          return;
        }
        detector = faceDetector;
        setScannerReady(true);

        const scanFrame = () => {
          if (!active) return;
          const now = performance.now();
          const currentVideo = videoRef.current;
          if (detector && currentVideo && currentVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && now - lastDetectionAt >= 120) {
            lastDetectionAt = now;
            const detections = detector.detectForVideo(currentVideo, now).detections;
            setFaceCount(detections.length);
            const box = detections.length === 1 ? detections[0].boundingBox : undefined;
            setFaceBox(box && currentVideo.videoWidth && currentVideo.videoHeight ? {
              x: (box.originX / currentVideo.videoWidth) * 100,
              y: (box.originY / currentVideo.videoHeight) * 100,
              width: (box.width / currentVideo.videoWidth) * 100,
              height: (box.height / currentVideo.videoHeight) * 100,
            } : null);
          }
          animationFrame = requestAnimationFrame(scanFrame);
        };
        animationFrame = requestAnimationFrame(scanFrame);
      } catch (cameraError: any) {
        if (active) setError(cameraError?.name === 'NotAllowedError'
          ? 'Allow camera access to scan for exactly one face.'
          : cameraError?.message || 'Could not start the face detector.');
      }
    };

    startCamera();
    return () => {
      active = false;
      restoreConsole();
      cancelAnimationFrame(animationFrame);
      detector?.close();
      cameraStream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [isOpen]);

  const handleCheckIn = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const res = await apiFetch('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({
          faceVerified: faceCount === 1 && scannerReady,
        }),
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else {
        setError(res.message || 'Check-in failed');
      }
    } catch (err: any) {
      setError(err.message || 'Check-in rejected by attendance rules');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const faceVerified = scannerReady && faceCount === 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0D1928] border border-[#203044] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#03101D] border-b border-[#203044] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#F8FAFC] flex items-center gap-2">
                <span>Face Verification Check-In</span>
                <span className="text-[10px] bg-emerald-950/70 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/50 font-semibold uppercase font-mono">
                  Verified Check-In
                </span>
              </h3>
              <p className="text-[11px] text-[#94A3B8]">Camera check-in requires exactly one face in frame</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/70 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="m-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Face verified. Attendance stamped successfully.</span>
          </div>
        )}

        {/* Video & Face Overlay */}
        <div className="relative bg-[#020817] w-full aspect-[4/3] flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />

          {faceBox && (
            <div
              className="absolute pointer-events-none rounded-xl border-2 border-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.45)]"
              style={{ left: `${faceBox.x}%`, top: `${faceBox.y}%`, width: `${faceBox.width}%`, height: `${faceBox.height}%` }}
            />
          )}
          <div className="absolute left-3 top-3 rounded-lg bg-black/65 px-2.5 py-1.5 text-[10px] font-mono text-white">
            {!scannerReady ? 'LOADING FACE SCANNER…' : faceCount === 1 ? 'ONE FACE DETECTED' : `${faceCount} FACES — SHOW EXACTLY ONE`}
          </div>
        </div>

        {/* Live Face Verification Status */}
        <div className="p-4 bg-[#03101D] border-t border-[#203044] space-y-3">
          <div className="grid grid-cols-1 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0D1928] border border-[#203044]">
              <span className="text-[10px] text-[#94A3B8] uppercase font-semibold block">Face Scan</span>
              <div className="font-mono text-[#F8FAFC] text-xs mt-0.5">
                {!scannerReady ? 'Starting local face scanner…' : `${faceCount} face${faceCount === 1 ? '' : 's'} detected`}
              </div>
              <div className="mt-1">
                {faceVerified ? (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> Exactly one face in frame
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3 h-3" /> Show exactly one face
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="p-4 bg-[#03101D] border-t border-[#203044] flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111E30] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCheckIn}
            disabled={submitting || !faceVerified}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-bold text-xs shadow-lg shadow-emerald-950/50 disabled:opacity-40 transition cursor-pointer"
          >
            {submitting ? (
              <span>Verifying & Stamping...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Face Check-In</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
