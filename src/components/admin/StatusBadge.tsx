import type { RegistrationStatus } from "@prisma/client";
import { statusLabels } from "@/lib/labels";

type StatusBadgeProps = {
  status: RegistrationStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-800 border-amber-200/80",
    APPROVED: "bg-emerald-50 text-emerald-800 border-emerald-200/85",
    REJECTED: "bg-rose-50 text-rose-850 border-rose-200/80",
  }[status];

  const dotColor = {
    PENDING: "bg-amber-500",
    APPROVED: "bg-emerald-500",
    REJECTED: "bg-rose-500",
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {statusLabels[status]}
    </span>
  );
}
