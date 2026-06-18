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
      if (e.key === "0") { setZoom(1); setOffset({ x: 0, y: 0 }); }
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
      className="fixed inset-0 z-50 flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Payment Receipt"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 bg-black/80 backdrop-blur-sm px-4 py-3 border-b border-white/10 flex-shrink-0">
        <div className="min-w-0 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white flex-shrink-0">
            🧾
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{participantName}</p>
            <p className="text-[10px] text-white/50">Payment Receipt</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!isPdf && (
            <div className="hidden sm:flex items-center gap-1 bg-white/10 rounded-lg px-1 py-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
                className="h-7 w-7 flex items-center justify-center rounded-md text-white hover:bg-white/20 transition text-base font-bold"
                title="Zoom out (−)"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
                className="min-w-[52px] text-center text-xs font-bold text-white/80 hover:text-white transition px-1"
                title="Reset zoom (0)"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(z + 0.25, 5))}
                className="h-7 w-7 flex items-center justify-center rounded-md text-white hover:bg-white/20 transition text-base font-bold"
                title="Zoom in (+)"
              >
                +
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-bold text-white transition"
            title="Download"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition"
            title="Close (Esc)"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div
        className="flex-1 overflow-hidden flex items-center justify-center"
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
            className="w-full h-full border-0"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={url}
            alt={`Receipt – ${participantName}`}
            className="max-w-full max-h-full object-contain select-none transition-transform duration-100"
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
        <div className="sm:hidden flex items-center justify-center gap-3 bg-black/80 backdrop-blur-sm border-t border-white/10 py-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/10 text-white text-lg font-bold"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
            className="min-w-[60px] text-center text-sm font-bold text-white/80"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(z + 0.25, 5))}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/10 text-white text-lg font-bold"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
