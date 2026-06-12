import type { RegistrationStatus } from "@prisma/client";

export type { RegistrationInput } from "@/lib/validations/registration";

export type ApiError = {
  error: string;
  details?: Record<string, string[]>;
};

export type RegistrationResponse = {
  id: string;
  fullName: string;
  status: RegistrationStatus;
};
