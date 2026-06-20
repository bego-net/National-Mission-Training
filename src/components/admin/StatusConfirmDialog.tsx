"use client";

import type { RegistrationStatus } from "@prisma/client";
import { statusLabels } from "@/lib/labels";

type StatusConfirmDialogProps = {
  participantName: string;
  currentStatus: RegistrationStatus;
  nextStatus: RegistrationStatus;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function StatusConfirmDialog({
  participantName,
  currentStatus,
  nextStatus,
  isLoading = false,
  onConfirm,
  onCancel,
}: StatusConfirmDialogProps) {
  const confirmBtnStyles = {
    PENDING: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/20",
    APPROVED: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/20",
    REJECTED: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/20",
  }[nextStatus];

  const badgeStyles = {
    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    REJECTED: "bg-rose-55 text-rose-800 border-rose-200",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-confirm-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100/80 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 id="status-confirm-title" className="text-base font-extrabold text-slate-900">
              Confirm Status Change
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registration Status Update</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-650 leading-relaxed space-y-3">
          <p>
            You are changing the registration status for <strong className="text-slate-900 font-extrabold">{participantName}</strong>.
          </p>
          <div className="flex items-center justify-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-xs font-bold">
            <span className={`px-2.5 py-1 rounded-lg border ${badgeStyles[currentStatus]}`}>
              {statusLabels[currentStatus]}
            </span>
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span className={`px-2.5 py-1 rounded-lg border ${badgeStyles[nextStatus]}`}>
              {statusLabels[nextStatus]}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white transition shadow-sm focus:ring-4 ${confirmBtnStyles} disabled:opacity-60`}
          >
            {isLoading ? "Updating..." : "Confirm Change"}
          </button>
        </div>
      </div>
    </div>
  );
}
