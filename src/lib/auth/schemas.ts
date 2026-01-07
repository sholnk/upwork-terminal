import { z } from "zod";

/**
 * User registration schema
 */
export const RegisterSchema = z.object({
  name: z.string().min(2, "名前は2文字以上必要です"),
  email: z.string().email("有効なメールアドレスが必要です"),
  password: z.string().min(8, "パスワードは8文字以上必要です"),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "パスワードが一致しません",
  path: ["passwordConfirm"],
});

export type RegisterRequest = z.infer<typeof RegisterSchema>;

/**
 * User login schema
 */
export const LoginSchema = z.object({
  email: z.string().email("有効なメールアドレスが必要です"),
  password: z.string().min(1, "パスワードが必要です"),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

/**
 * Email verification schema
 */
export const VerifyEmailSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
});

export type VerifyEmailRequest = z.infer<typeof VerifyEmailSchema>;

/**
 * User profile schema
 */
export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().url().optional(),
  role: z.enum(["user", "admin"]).default("user"),
  emailVerified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Session schema
 */
export const SessionSchema = z.object({
  user: UserProfileSchema,
  expires: z.date(),
});

export type Session = z.infer<typeof SessionSchema>;
