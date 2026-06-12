import type { Gender, MaritalStatus, RegistrationStatus } from "@prisma/client";

export const genderLabels: Record<Gender, string> = {
  MALE: "ወንድ",
  FEMALE: "ሴት",
};

export const maritalStatusLabels: Record<MaritalStatus, string> = {
  SINGLE: "ያላገባ/ች",
  MARRIED: "ያገባ/ች",
  DIVORCED: "የፈታ/ች",
  WIDOWED: "የሞተበት/ባት",
};

export const statusLabels: Record<RegistrationStatus, string> = {
  PENDING: "በመጠባበቅ ላይ",
  APPROVED: "ተፀድቋል",
  REJECTED: "ተቀባይነት አልተሰጠም",
};

export const statusStyles: Record<RegistrationStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};
