import { z } from "zod";

/**
 * Contract Schema
 * Represents a freelance contract/job agreement
 */
export const CreateContractSchema = z.object({
  jobId: z.string().min(1, "ジョブIDが必要です"),
  title: z.string().min(3, "タイトルは3文字以上必要です"),
  clientName: z.string().min(2, "クライアント名が必要です"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  status: z.enum(["active", "completed", "paused", "cancelled"]).default("active"),
  totalAmount: z.number().positive("金額は正の数値である必要があります").optional(),
  hourlyRate: z.number().positive().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateContractRequest = z.infer<typeof CreateContractSchema>;

/**
 * Timesheet Entry Schema
 * Records hours worked on a contract
 */
export const CreateTimesheetSchema = z.object({
  contractId: z.string().min(1, "契約IDが必要です"),
  date: z.coerce.date(),
  hoursWorked: z.number().positive("時間は正の数値である必要があります"),
  description: z.string().optional(),
  billable: z.boolean().default(true),
  amount: z.number().optional(), // Calculated if hourly rate exists
});

export type CreateTimesheetRequest = z.infer<typeof CreateTimesheetSchema>;

/**
 * Contract Summary
 */
export const ContractSummarySchema = z.object({
  id: z.string(),
  jobId: z.string(),
  title: z.string(),
  clientName: z.string(),
  status: z.enum(["active", "completed", "paused", "cancelled"]),
  startDate: z.date(),
  endDate: z.date().optional(),
  totalHours: z.number(),
  totalEarnings: z.number(),
  lastUpdated: z.date(),
});

export type ContractSummary = z.infer<typeof ContractSummarySchema>;
