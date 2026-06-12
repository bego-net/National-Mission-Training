import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"], {
    message: "Select a valid status",
  }),
});
