import { z } from "zod";

export const genderOptions = [
  { value: "MALE", label: "ወንድ" },
  { value: "FEMALE", label: "ሴት" },
] as const;

export const maritalStatusOptions = [
  { value: "SINGLE", label: "ያላገባ/ች" },
  { value: "MARRIED", label: "ያገባ/ች" },
  { value: "DIVORCED", label: "የፈታ/ች" },
  { value: "WIDOWED", label: "የሞተበት/ባት" },
] as const;

const phoneRegex = /^(\+251|0)?9\d{8}$/;

export const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "ሙሉ ስም አስገዳጅ ነው"),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "ትክክለኛ የስልክ ቁጥር ያስገቡ (09xxxxxxxx)"),
  age: z.coerce
    .number()
    .int("ዕድሜ ቁጥር መሆን አለበት")
    .min(15, "ዕድሜ ቢያንስ 15 መሆን አለበት")
    .max(80, "ዕድሜ እስከ 80 ብቻ"),
  gender: z.enum(["MALE", "FEMALE"], {
    message: "ጾታ ይምረጡ",
  }),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"], {
    message: "የጋብቻ ሁኔታ ይምረጡ",
  }),
  occupation: z.string().trim().min(2, "ሙያ/ስራ አስገዳጅ ነው"),
  address: z.string().trim().min(3, "አድራሻ አስገዳጅ ነው"),
  churchName: z.string().trim().min(2, "የቤተ ክርስቲያን ስም አስገዳጅ ነው"),
  ministryArea: z.string().trim().min(2, "የአገልግሎት ዘርፍ አስገዳጅ ነው"),
  needsAccommodation: z.boolean(),
  needsTshirt: z.boolean(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\s+/g, "");
  if (digits.startsWith("+251")) return `0${digits.slice(4)}`;
  if (digits.startsWith("251")) return `0${digits.slice(3)}`;
  return digits;
}
