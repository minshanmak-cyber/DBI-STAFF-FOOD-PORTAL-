import { z } from "zod";

export const LoginSchema = z.object({
  staffId: z
    .string()
    .trim()
    .min(2, "Staff ID must be at least 2 characters")
    .max(50, "Staff ID is too long"),
  password: z.string().min(1, "Password is required"),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one digit"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation do not match",
    path: ["confirmPassword"],
  });

export const FirstLoginPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one digit"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation do not match",
    path: ["confirmPassword"],
  });

export const CreateUserSchema = z.object({
  staffId: z
    .string()
    .trim()
    .min(2, "Staff ID must be at least 2 characters")
    .max(30, "Staff ID must not exceed 30 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Staff ID may only contain letters, numbers, underscores, and dashes"),
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  department: z.string().trim().max(100).optional().nullable(),
  role: z.enum(["ADMIN", "STAFF", "CANTEEN"]),
  initialPassword: z
    .string()
    .min(8, "Initial password must be at least 8 characters"),
});

export const UpdateUserSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  department: z.string().trim().max(100).optional().nullable(),
  isActive: z.boolean(),
  role: z.enum(["ADMIN", "STAFF", "CANTEEN"]),
});

export const ResetPasswordSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit"),
});

export const DateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Service date must be in YYYY-MM-DD format");

export const MealTypeSchema = z.enum(["BREAKFAST", "LUNCH", "DINNER"]);

export const ResponseStatusSchema = z.enum(["OPT_IN", "OPT_OUT", "NO_RESPONSE"]);

export const SubmitMealPreferencesSchema = z.object({
  serviceDate: DateStringSchema,
  selections: z.array(
    z.object({
      mealType: MealTypeSchema,
      status: z.enum(["OPT_IN", "OPT_OUT", "NO_RESPONSE"]),
    })
  ),
});

export const AdminOverrideMealResponseSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  serviceDate: DateStringSchema,
  mealType: MealTypeSchema,
  status: z.enum(["OPT_IN", "OPT_OUT", "NO_RESPONSE"]),
  reason: z
    .string()
    .trim()
    .min(5, "A clear reason (at least 5 characters) is required for audit compliance")
    .max(500),
});

export const VerifyCollectionSchema = z.object({
  qrToken: z.string().trim().min(10, "Valid QR token is required"),
});

