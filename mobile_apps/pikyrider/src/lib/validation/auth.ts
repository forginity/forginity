import { z } from "zod";

/**
 * Standard email validation schema
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email address is required")
  .email("Please enter a valid email address (e.g. name@example.com)");

/**
 * International phone number validation schema
 * Supports formats with optional +, spaces, dashes, parentheses and 7-15 digits
 */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine(
    (val) => {
      const cleaned = val.replace(/[\s().-]/g, "");
      return /^\+?[1-9]\d{6,14}$/.test(cleaned);
    },
    { message: "Please enter a valid phone number (e.g. +1 555 123 4567)" }
  );

/**
 * Combined authentication identifier schema (email or phone)
 */
export const authIdentifierSchema = z
  .string()
  .trim()
  .min(1, "Mobile number or email is required")
  .superRefine((val, ctx) => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const cleanedDigits = val.replace(/[\s().-]/g, "");
    const isPhone = /^\+?[1-9]\d{6,14}$/.test(cleanedDigits);

    if (!isEmail && !isPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid email address or mobile number",
      });
    }
  });

/**
 * 6-digit OTP verification schema
 */
export const otpSchema = z
  .string()
  .trim()
  .length(6, "Code must be exactly 6 digits")
  .regex(/^\d{6}$/, "Code must contain numbers only");

/**
 * Profile step schema
 */
export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  userName: z
    .string()
    .trim()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
});

/**
 * Gender selection schema
 */
export const genderSchema = z.enum([
  "man",
  "woman",
  "nonbinary",
  "prefer_not_to_say",
]);

/**
 * Country selection schema
 */
export const countrySchema = z.object({
  id: z.string().min(1, "Please select a country"),
  name: z.string().min(1),
  region: z.string().min(1),
  flagEmoji: z.string().optional(),
  flagUrl: z.string().optional(),
});

/**
 * Detects whether the input string is an email or phone number
 */
export const detectAuthMethod = (input: string): "email" | "phone" => {
  const trimmed = input.trim();
  if (trimmed.includes("@")) {
    return "email";
  }
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly.length >= 7) {
    return "phone";
  }
  return "email";
};

/**
 * Helper to validate an email string
 */
export const validateEmail = (
  email: string
): { success: boolean; error?: string } => {
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message };
  }
  return { success: true };
};

/**
 * Helper to validate email or phone identifier
 */
export const validateIdentifier = (
  identifier: string
): {
  success: boolean;
  error?: string;
  method: "email" | "phone";
} => {
  const method = detectAuthMethod(identifier);
  const result = authIdentifierSchema.safeParse(identifier);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message,
      method,
    };
  }
  return { success: true, method };
};

/**
 * Helper to validate OTP
 */
export const validateOtp = (
  otp: string
): { success: boolean; error?: string } => {
  const result = otpSchema.safeParse(otp);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message };
  }
  return { success: true };
};

/**
 * Helper to validate Profile fields individually or together
 */
export const validateProfile = (data: {
  firstName: string;
  lastName: string;
  userName: string;
}): {
  success: boolean;
  errors: Partial<Record<"firstName" | "lastName" | "userName", string>>;
} => {
  const result = profileSchema.safeParse(data);
  if (!result.success) {
    const errors: Partial<Record<"firstName" | "lastName" | "userName", string>> =
      {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as "firstName" | "lastName" | "userName";
      if (field && !errors[field]) {
        errors[field] = issue.message;
      }
    }
    return { success: false, errors };
  }
  return { success: true, errors: {} };
};
