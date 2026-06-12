import type { Gender, MaritalStatus, RegistrationStatus } from "@prisma/client";

export const genderLabels: Record<Gender, string> = {
  MALE: "Male",
  FEMALE: "Female",
};

export const maritalStatusLabels: Record<MaritalStatus, string> = {
  SINGLE: "Single",
  MARRIED: "Married",
  DIVORCED: "Divorced",
  WIDOWED: "Widowed",
};

export const statusLabels: Record<RegistrationStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const statusStyles: Record<RegistrationStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800 border border-amber-200/60",
  APPROVED: "bg-emerald-50 text-emerald-800 border border-emerald-200/60",
  REJECTED: "bg-rose-50 text-rose-800 border border-rose-200/60",
};

export const statusActionLabels: Record<RegistrationStatus, string> = {
  PENDING: "Set Pending",
  APPROVED: "Approve",
  REJECTED: "Reject",
};

export const statusActionStyles: Record<RegistrationStatus, string> = {
  PENDING: "bg-amber-600 hover:bg-amber-700",
  APPROVED: "bg-green-600 hover:bg-green-700",
  REJECTED: "bg-red-600 hover:bg-red-700",
};

export const ALL_REGISTRATION_STATUSES: RegistrationStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
];
