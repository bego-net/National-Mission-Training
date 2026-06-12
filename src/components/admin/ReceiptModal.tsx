"use client";

import { useEffect, useState } from "react";
import { isPdfUrl } from "@/lib/validations/payment";

type ReceiptModalProps = {
  url: string;
  participantName: string;
  onClose: () => void;
};

export function ReceiptModal({ url, participantName, onClose }: ReceiptModalProps) {
  const [zoom, setZoom] = useState(1);
  const isPdf = isPdfUrl(url);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="የክፍያ ማረጋገጫ"
      onClick={onClose}
    >
      <div
        className="flex max-h-[95vh] w-full max-w-3xl flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-900">
              የክፍያ ማረጋገጫ
            </h2>
            <p className="truncate text-sm text-slate-500">{participantName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            ዝጋ
          </button>
        </div>

        {!isPdf && (
          <div className="flex items-center justify-center gap-2 border-b border-slate-200 px-4 py-2">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
            >
              −
            </button>
            <span className="min-w-16 text-center text-sm text-slate-600">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
            >
              +
            </button>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-slate-100 p-4">
          {isPdf ? (
            <iframe
              src={`${url}#toolbar=0`}
              title={`የክፍያ ማረጋገጫ - ${participantName}`}
              className="h-[60vh] w-full rounded-lg border border-slate-200 bg-white"
            />
          ) : (
            <div className="flex min-h-[50vh] items-center justify-center overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`የክፍያ ማረጋገጫ - ${participantName}`}
                className="max-w-none rounded-lg shadow-md transition-transform duration-200"
                style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
              />
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 px-4 py-3 sm:px-6">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 sm:w-auto"
          >
            በአዲስ ትር ክፈት
          </a>
        </div>
      </div>
    </div>
  );
}
