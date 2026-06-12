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
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-confirm-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="status-confirm-title" className="text-lg font-semibold text-slate-900">
          ሁኔታ ለመቀየር ያረጋግጡ
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          <span className="font-medium text-slate-900">{participantName}</span> ምዝገባ
          ከ <span className="font-medium">{statusLabels[currentStatus]}</span> ወደ{" "}
          <span className="font-medium">{statusLabels[nextStatus]}</span> ይቀየራል።
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            ይቅር
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 disabled:opacity-60"
          >
            {isLoading ? "በመቀየር ላይ..." : "አረጋግጥ"}
          </button>
        </div>
      </div>
    </div>
  );
}
