import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"], {
    message: "Select a valid status",
  }),
});
