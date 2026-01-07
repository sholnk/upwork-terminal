import { z } from "zod";

/**
 * Job Creation Schema
 * Used for manual job entry and validation
 */
export const CreateJobSchema = z.object({
  title: z.string().min(3, "タイトルは3文字以上必要です").max(255),
  description: z.string().min(10, "説明は10文字以上必要です").max(5000),
  upworkJobId: z.string().optional(), // Optional for non-upwork jobs
  url: z.string().url("有効なURLを入力してください").optional(),
  skills: z.array(z.string().min(1)).default([]),
  budget: z.number().positive("予算は正の数値である必要があります").optional(),
  budgetType: z.enum(["hourly", "fixed"]).optional(),
  experienceLevel: z.enum(["entry", "intermediate", "expert"]).optional(),
  duration: z.string().optional(),
  jobType: z.enum(["contract", "freelance"]).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  postedAt: z.coerce.date().optional(),
  clientInfo: z.record(z.string(), z.any()).optional(),
  source: z.enum(["manual", "inbox", "upwork"]).default("manual"),
  createdFromInboxMessageId: z.string().optional(),
});

export type CreateJobRequest = z.infer<typeof CreateJobSchema>;

/**
 * Job Update Schema
 */
export const UpdateJobSchema = CreateJobSchema.partial().omit({
  source: true,
});

export type UpdateJobRequest = z.infer<typeof UpdateJobSchema>;

/**
 * Batch Job Import Schema (for CSV)
 */
export const BatchJobImportSchema = z.array(CreateJobSchema);

export type BatchJobImportRequest = z.infer<typeof BatchJobImportSchema>;
