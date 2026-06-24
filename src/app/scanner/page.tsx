"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

type ScanResult = {
  status: "SUCCESS" | "ALREADY_SCANNED" | "NOT_FOUND" | "NOT_APPROVED";
  checkpoint?: "ENTRY" | "LUNCH";
  scannedAt?: string;
  error?: string;
  participant?: {
    id?: string;
    fullName: string;
    churchName: string;
    registrationNumber: string;
    status?: string;
  };
};

export default function ScannerPage() {
  const [checkpoint, setCheckpoint] = useState<"ENTRY" | "LUNCH">("ENTRY");
  const [cameraActive, setCameraActive] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt");

  const qrReaderRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  // Play browser-generated audio feedback using AudioContext synth
  const playBeep = (type: "success" | "warning" | "error") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch A5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "warning") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, ctx.currentTime); // Medium pitch A4
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime); // Low pitch buzz
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.error("Audio feedback failed:", e);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    // Haptic feedback (Vibration)
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(100);
    }

    await submitScan(decodedText);

    // Debounce scanning next code by 2.5 seconds to prevent double scans
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 2500);
  };

  const submitScan = async (qrData: string) => {
    setIsSubmitting(true);
    setScanResult(null);
    try {
      const response = await fetch("/api/scanner/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData, checkpoint }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.status === "SUCCESS") {
          playBeep("success");
        } else if (data.status === "ALREADY_SCANNED") {
          playBeep("warning");
        }
        setScanResult(data);
      } else {
        playBeep("error");
        setScanResult({
          status: data.status || "NOT_APPROVED",
          error: data.error || "Verification failed",
          participant: data.participant,
        });
      }
    } catch (err) {
      playBeep("error");
      setScanResult({
        status: "NOT_FOUND",
        error: "Network connection error.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    submitScan(manualInput.trim().toUpperCase());
  };

  // Start Camera QR scanner
  const startCamera = async () => {
    setCameraError("");
    try {
      const qrScanner = new Html5Qrcode("qr-video-container");
      qrReaderRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          },
        },
        handleScanSuccess,
        () => {} // Silent verbosity
      );

      setCameraActive(true);
      setCameraPermission("granted");
    } catch (err: any) {
      console.error("Camera start failed:", err);
      setCameraError("Unable to access back camera. Please grant camera permission.");
      setCameraActive(false);
    }
  };

  // Stop Camera scanner
  const stopCamera = async () => {
    if (qrReaderRef.current && qrReaderRef.current.isScanning) {
      try {
        await qrReaderRef.current.stop();
      } catch (err) {
        console.error("Camera stop error:", err);
      }
    }
    setCameraActive(false);
  };

  useEffect(() => {
    // Start camera automatically on mount
    startCamera();

    return () => {
      // Cleanup camera on unmount
      if (qrReaderRef.current) {
        qrReaderRef.current.stop().catch(console.error);
      }
    };
  }, [checkpoint]); // restart scanner when checkpoint toggles to bind callbacks correctly

  function formatTime(timeString?: string) {
    if (!timeString) return "";
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Africa/Nairobi",
    }).format(new Date(timeString));
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-slate-950/80 border-b border-slate-800/60 py-4 px-6 sticky top-0 z-30 backdrop-blur-md flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold text-blue-400">ስምህ ይቀደስ</h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Attendance Scanner</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (cameraActive) stopCamera();
              else startCamera();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              cameraActive
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${cameraActive ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`} />
            {cameraActive ? "Stop Camera" : "Start Camera"}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md p-5 space-y-6 flex-1 flex flex-col justify-start">
        {/* Checkpoint selector capsules */}
        <div className="bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80 flex">
          <button
            type="button"
            onClick={() => setCheckpoint("ENTRY")}
            className={`flex-1 py-3 text-center text-xs font-black rounded-xl transition ${
              checkpoint === "ENTRY"
                ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🚪 GATE ENTRY
          </button>
          <button
            type="button"
            onClick={() => setCheckpoint("LUNCH")}
            className={`flex-1 py-3 text-center text-xs font-black rounded-xl transition ${
              checkpoint === "LUNCH"
                ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🍽️ LUNCH CHECK
          </button>
        </div>

        {/* Video feed viewport container */}
        <div className="relative aspect-square w-full rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col items-center justify-center shadow-xl">
          <div id="qr-video-container" className="w-full h-full object-cover" />
          
          {/* Aim assist target bounds overlay */}
          {cameraActive && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[60%] aspect-square border-2 border-dashed border-blue-500/60 rounded-2xl relative">
                {/* Scanner line animation */}
                <div className="absolute left-0 right-0 top-0 h-0.5 bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-bounce" />
              </div>
            </div>
          )}

          {/* Stopped camera state banner */}
          {!cameraActive && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center space-y-2">
              <span className="text-3xl">📷</span>
              <p className="text-sm font-bold text-slate-400">Camera is inactive</p>
              <button
                onClick={startCamera}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Activate Camera
              </button>
            </div>
          )}

          {/* Camera loading or error states */}
          {cameraError && (
            <div className="absolute inset-0 bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-2xl text-rose-500">⚠️</span>
              <p className="text-xs text-rose-400 font-semibold">{cameraError}</p>
            </div>
          )}
        </div>

        {/* Scanning status banner */}
        {cameraActive && !isSubmitting && !scanResult && (
          <p className="text-center text-xs text-slate-400 animate-pulse font-semibold">
            Point camera at participant QR badge...
          </p>
        )}

        {/* Submitting indicator */}
        {isSubmitting && (
          <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl flex items-center justify-center gap-3">
            <svg className="animate-spin h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs font-bold text-slate-300">Verifying credential...</span>
          </div>
        )}

        {/* Dynamic scan result response cards */}
        {scanResult && (
          <div className="space-y-4">
            {/* 1. SUCCESS CARD (Green) */}
            {scanResult.status === "SUCCESS" && scanResult.participant && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Success check-in
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h3 className="font-extrabold text-emerald-400 text-base">
                      {scanResult.participant.fullName}
                    </h3>
                    <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-wider">
                      {checkpoint} APPROVED
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 border-t border-emerald-500/20 pt-3 text-xs text-emerald-300/95 font-semibold">
                  <div>
                    <p className="text-[9px] uppercase text-emerald-500/70 font-extrabold">Church</p>
                    <p>{scanResult.participant.churchName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase text-emerald-500/70 font-extrabold">Reg Number</p>
                    <p className="font-mono">{scanResult.participant.registrationNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] uppercase text-emerald-500/70 font-extrabold">Scan Timestamp</p>
                    <p>{formatTime(scanResult.scannedAt)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ALREADY SCANNED WARNING CARD (Amber) */}
            {scanResult.status === "ALREADY_SCANNED" && scanResult.participant && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Already scanned
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="font-extrabold text-amber-400 text-base">
                      {scanResult.participant.fullName}
                    </h3>
                    <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider">
                      Duplicate Checkpoint Claim
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 border-t border-amber-500/20 pt-3 text-xs text-amber-300/95 font-semibold">
                  <div>
                    <p className="text-[9px] uppercase text-amber-500/70 font-extrabold">Checkpoint</p>
                    <p>{checkpoint}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase text-amber-500/70 font-extrabold">Reg Number</p>
                    <p className="font-mono">{scanResult.participant.registrationNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] uppercase text-amber-500/70 font-extrabold">Original Scan Time</p>
                    <p className="text-amber-300">{formatTime(scanResult.scannedAt)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ERROR/INVALID/NOT APPROVED CARD (Red) */}
            {(scanResult.status === "NOT_FOUND" || scanResult.status === "NOT_APPROVED") && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Access Denied
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <h3 className="font-extrabold text-rose-400 text-sm">
                      {scanResult.error || "Verification Denied"}
                    </h3>
                    <p className="text-[10px] text-rose-500/85 font-bold uppercase tracking-wider">
                      Invalid Participant Status
                    </p>
                  </div>
                </div>
                {scanResult.participant && (
                  <div className="grid grid-cols-2 gap-y-2 pt-3 border-t border-rose-500/20 text-xs text-rose-300 font-semibold">
                    <div>
                      <p className="text-[9px] uppercase text-rose-500/70 font-extrabold">Name</p>
                      <p>{scanResult.participant.fullName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase text-rose-500/70 font-extrabold">Status</p>
                      <p className="text-rose-400 font-extrabold">{scanResult.participant.status}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Clear result helper */}
            <button
              onClick={() => setScanResult(null)}
              className="w-full bg-slate-800 hover:bg-slate-755 text-slate-300 font-bold py-2 rounded-xl text-xs transition"
            >
              Clear scan result
            </button>
          </div>
        )}

        {/* Manual Input Form fallback */}
        <form onSubmit={handleManualSubmit} className="space-y-2 bg-slate-950/40 border border-slate-800/80 p-4 rounded-2xl">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
            Manual Registration Number Input
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="e.g. HGM-2026-0001"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono tracking-wide text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition disabled:opacity-60"
            >
              Verify
            </button>
          </div>
        </form>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `
        #qr-video-container video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 24px !important;
        }
      `}} />
    </div>
  );
}
