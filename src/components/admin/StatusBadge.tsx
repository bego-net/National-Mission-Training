import type { RegistrationStatus } from "@prisma/client";
import { statusLabels, statusStyles } from "@/lib/labels";

type StatusBadgeProps = {
  status: RegistrationStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
