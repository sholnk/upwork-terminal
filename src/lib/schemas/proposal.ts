import { z } from "zod";

/**
 * Proposal Template Type A: Short Deliverable
 * - Focused on quick value delivery
 * - 2-3 sentences per section
 * - Best for straightforward projects
 */
export const ProposalTypeASchema = z.object({
  summary: z.string().min(10).max(500).describe("1-2 sentence summary"),
  approach: z.string().min(10).max(500).describe("Your approach (2-3 sentences)"),
  timeline: z.string().min(5).max(200).describe("Expected timeline"),
  rate: z.number().positive().describe("Your proposed rate/budget"),
});

/**
 * Proposal Template Type B: Audit → Build
 * - 2-phase approach: Analysis first, then implementation
 * - Detailed discovery process
 * - Best for complex projects
 */
export const ProposalTypeBSchema = z.object({
  auditScope: z.string().min(10).max(500).describe("What will be audited/analyzed"),
  auditTimeline: z.string().min(5).max(200).describe("Audit phase duration"),
  auditRate: z.number().positive().describe("Audit phase cost"),
  buildScope: z.string().min(10).max(500).describe("What will be built after audit"),
  buildTimeline: z.string().min(5).max(200).describe("Build phase duration"),
  buildRate: z.number().positive().describe("Build phase cost"),
  totalRate: z.number().positive().describe("Total project cost"),
});

/**
 * Proposal Input (Japanese template data)
 */
export const ProposalInputSchema = z.object({
  jobId: z.string(),
  jobTitle: z.string(),
  jobDescription: z.string(),
  type: z.enum(["A", "B"]).describe("Template type: A=Short, B=Audit→Build"),
  // Type A fields
  summaryJa: z.string().optional(),
  approachJa: z.string().optional(),
  timelineJa: z.string().optional(),
  rateJa: z.string().optional().describe("Rate in JPY or description for Type A"),
  // Type B fields
  auditScopeJa: z.string().optional(),
  auditTimelineJa: z.string().optional(),
  auditRate: z.string().optional().describe("Audit phase cost"),
  buildScopeJa: z.string().optional(),
  buildTimelineJa: z.string().optional(),
  buildRate: z.string().optional().describe("Build phase cost"),
  totalRate: z.string().optional().describe("Total project cost"),
});

/**
 * Proposal Output (Generated proposal)
 */
export const ProposalOutputSchema = z.object({
  type: z.enum(["A", "B"]),
  textJa: z.string().describe("Full proposal text in Japanese"),
  textEn: z.string().describe("Full proposal text in English"),
  estimatedWords: z.number(),
  summary: z.string().describe("Short summary for preview"),
});

export type ProposalInput = z.infer<typeof ProposalInputSchema>;
export type ProposalOutput = z.infer<typeof ProposalOutputSchema>;
