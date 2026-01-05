import { z } from "zod";

/**
 * Job Analysis Schema
 *
 * スコアリングシステム: 5つの項目、各0-20点、合計100点
 */

// 個別スコアスキーマ
export const JobScoreItemSchema = z.object({
  fit: z.number().min(0).max(20).int(), // 適合度
  clarity: z.number().min(0).max(20).int(), // 要件の明確さ
  budgetRoi: z.number().min(0).max(20).int(), // 予算対効果
  clientQuality: z.number().min(0).max(20).int(), // クライアント品質
  winChance: z.number().min(0).max(20).int(), // 受注可能性
});

export type JobScoreItem = z.infer<typeof JobScoreItemSchema>;

// スコアの根拠
export const JobScoreReasonSchema = z.object({
  fitReason: z.string().optional(),
  clarityReason: z.string().optional(),
  budgetRoiReason: z.string().optional(),
  clientQualityReason: z.string().optional(),
  winChanceReason: z.string().optional(),
});

export type JobScoreReason = z.infer<typeof JobScoreReasonSchema>;

// 完全な分析スキーマ
export const JobAnalysisSchema = z.object({
  scores: JobScoreItemSchema,
  reasons: JobScoreReasonSchema,
  totalScore: z.number().min(0).max(100).int(),
  classification: z.enum(["excellent", "good", "fair", "poor"]),
  decision: z.enum(["propose", "hold", "drop"]).optional(),
  notesJa: z.string().optional(),
  tags: z.array(z.string()).default([]),
  analyzedAt: z.date().optional(),
});

export type JobAnalysis = z.infer<typeof JobAnalysisSchema>;

// Job スコアリングリクエスト
export const JobScoringRequestSchema = z.object({
  fit: z.number().min(0).max(20).int(),
  clarity: z.number().min(0).max(20).int(),
  budgetRoi: z.number().min(0).max(20).int(),
  clientQuality: z.number().min(0).max(20).int(),
  winChance: z.number().min(0).max(20).int(),
  fitReason: z.string().optional(),
  clarityReason: z.string().optional(),
  budgetRoiReason: z.string().optional(),
  clientQualityReason: z.string().optional(),
  winChanceReason: z.string().optional(),
  decision: z.enum(["propose", "hold", "drop"]).optional(),
  notesJa: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type JobScoringRequest = z.infer<typeof JobScoringRequestSchema>;
