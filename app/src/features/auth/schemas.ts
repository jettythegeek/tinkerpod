import { z } from 'zod';

const nigerianPhoneRegex = /^(?:0[789][01]\d{8}|234[789][01]\d{8}|\+234[789][01]\d{8})$/;

export const parentRegisterSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.'),
  email: z.string().trim().email('Please enter a valid email address.'),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => nigerianPhoneRegex.test(val.replace(/[\s\-()]+/g, '')),
      'Enter a valid Nigerian phone number (080..., 234..., or +234...).',
    ),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export type ParentRegisterFormValues = z.infer<typeof parentRegisterSchema>;

export const parentLoginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, 'Enter your email address or Nigerian phone number.'),
  password: z.string().min(1, 'Enter your password.'),
});

export type ParentLoginFormValues = z.infer<typeof parentLoginSchema>;

export const forgotPasswordRequestSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, 'Enter your registered email address or phone number.'),
});

export type ForgotPasswordRequestFormValues = z.infer<typeof forgotPasswordRequestSchema>;

export const resetPasswordConfirmSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code sent to you.'),
  password: z.string().min(8, 'New password must be at least 8 characters.'),
});

export type ResetPasswordConfirmFormValues = z.infer<typeof resetPasswordConfirmSchema>;

export const kidLookupSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, 'Enter your username, or your parent’s phone or email.'),
});

export type KidLookupFormValues = z.infer<typeof kidLookupSchema>;
