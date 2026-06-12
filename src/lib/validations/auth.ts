import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "የተጠቃሚ ስም ያስገቡ"),
  password: z.string().min(1, "የይለፍ ቃል ያስገቡ"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"], {
    message: "ትክክለኛ ሁኔታ ይምረጡ",
  }),
});
