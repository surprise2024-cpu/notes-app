import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters"),

    email: z.email("Enter a valid email address"),

    password: z.string().min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

export const profileSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters"),

    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: z.string(),

    confirmNewPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword && data.newPassword.length < 8) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "New password must be at least 8 characters",
      });
    }

    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmNewPassword"],
        message: "New passwords do not match",
      });
    }
  });

export type ProfileFormData = z.infer<typeof profileSchema>;

export const recoverySetupSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
});

export const resetPasswordSchema = z
  .object({
    email: z.email("Enter a valid email address"),

    recoveryCode: z.string().trim().min(1, "Recovery code is required"),

    newPassword: z.string().min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
