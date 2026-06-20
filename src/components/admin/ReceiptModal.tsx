"use client";

import { useEffect, useRef, useState } from "react";
import { isPdfUrl } from "@/lib/validations/payment";

type ReceiptModalProps = {
  url: string;
  participantName: string;
  onClose: () => void;
};

export function ReceiptModal({ url, participantName, onClose }: ReceiptModalProps) {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const isPdf = isPdfUrl(url);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.25, 5));
      if (e.key === "-") setZoom((z) => Math.max(z - 0.25, 0.25));
      if (e.key === "0") {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll while modal open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Reset pan when zoom returns to 1
  useEffect(() => {
    if (zoom === 1) setOffset({ x: 0, y: 0 });
  }, [zoom]);

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom((z) => Math.min(Math.max(z + delta, 0.25), 5));
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging || !dragStart.current) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  }

  function handleMouseUp() {
    setIsDragging(false);
    dragStart.current = null;
  }

  function handleDownload() {
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${participantName.replace(/\s+/g, "-")}`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Payment Receipt"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md px-6 py-4 border-b border-white/5 flex-shrink-0">
        <div className="min-w-0 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex-shrink-0">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-white truncate">{participantName}</p>
            <p className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Payment Receipt</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {!isPdf && (
            <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition text-base font-bold"
                title="Zoom out (−)"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setOffset({ x: 0, y: 0 });
                }}
                className="min-w-[60px] text-center text-xs font-bold text-white/80 hover:text-white transition px-1"
                title="Reset zoom (0)"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(z + 0.25, 5))}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition text-base font-bold"
                title="Zoom in (+)"
              >
                +
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-xs font-bold text-white transition shadow-sm"
            title="Download"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Download Receipt</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="h-8.5 w-8.5 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition"
            title="Close (Esc)"
          >
            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div
        className="flex-1 overflow-hidden flex items-center justify-center relative p-4"
        onWheel={isPdf ? undefined : handleWheel}
        onMouseDown={isPdf ? undefined : handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? "grabbing" : zoom > 1 ? "grab" : "default" }}
      >
        {isPdf ? (
          <iframe
            src={`${url}#toolbar=0`}
            title={`Receipt – ${participantName}`}
            className="w-full h-full max-w-4xl rounded-2xl border border-white/5 bg-slate-900 shadow-2xl"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={url}
            alt={`Receipt – ${participantName}`}
            className="max-w-full max-h-full object-contain select-none transition-transform duration-100 rounded-lg shadow-2xl border border-white/5"
            style={{
              transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
              transformOrigin: "center center",
            }}
            draggable={false}
          />
        )}
      </div>

      {/* Mobile zoom controls */}
      {!isPdf && (
        <div className="sm:hidden flex items-center justify-center gap-3 bg-slate-900/90 backdrop-blur-md border-t border-white/5 py-4 flex-shrink-0">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white text-lg font-bold"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            className="min-w-[64px] text-center text-xs font-bold text-white/80"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(z + 0.25, 5))}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white text-lg font-bold"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
