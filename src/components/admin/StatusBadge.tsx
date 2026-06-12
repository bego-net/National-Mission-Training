import type { RegistrationStatus } from "@prisma/client";
import { statusLabels, statusStyles } from "@/lib/labels";

type StatusBadgeProps = {
  status: RegistrationStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const dotColor = {
    PENDING: "bg-amber-500",
    APPROVED: "bg-emerald-500",
    REJECTED: "bg-rose-500",
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${statusStyles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {statusLabels[status]}
    </span>
  );
}
