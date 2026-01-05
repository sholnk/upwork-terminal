import { z } from "zod";

/**
 * Sophia Output Schema (MVP Fixed Format)
 *
 * Based on sophia_code.md specifications
 * Validates Q_META, F_ULTIMATE, and Artifacts JSON structure
 */

// Q_META Schema
export const SophiaQMetaSchema = z.object({
  intention: z.string(),
  misalignment: z.string(),
  latent_frame: z.string(),
  premise_reflection: z.string(),
  feedback: z.string(),
  socratic_trigger: z.object({
    question_ja: z.string(), // 必ず1問
    why_this_question: z.string(),
    answer_format_hint: z.string(),
  }),
});

export type SophiaQMeta = z.infer<typeof SophiaQMetaSchema>;

// F_ULTIMATE Schema
export const SophiaFUltimateSchema = z.object({
  awareness: z.string(),
  classification: z.string(),
  navigation: z.object({
    next_step: z.string(),
    options: z.array(z.string()).min(2).max(5), // 2〜5個
    recommended: z.string(),
  }),
  verification: z.object({
    assumptions: z.array(z.string()),
    risks: z.array(z.string()),
    what_to_confirm_next: z.array(z.string()),
  }),
  redefine: z.string(),
  meta_check: z.string(),
  r_update: z.object({
    metrics: z.array(z.string()),
    cadence: z.string(),
  }),
});

export type SophiaFUltimate = z.infer<typeof SophiaFUltimateSchema>;

// Artifacts Schema
export const SophiaArtifactsSchema = z.object({
  summary_ja: z.string(),
  profile_pitch_ja: z.string().optional(),
  profile_pitch_en: z.string().optional(),
  job_analysis_ja: z.string().optional(),
  proposal_draft_en: z.string().optional(),
});

export type SophiaArtifacts = z.infer<typeof SophiaArtifactsSchema>;

// Complete Sophia Output Schema
export const SophiaOutputSchema = z.object({
  q_meta: SophiaQMetaSchema,
  f_ultimate: SophiaFUltimateSchema,
  artifacts: SophiaArtifactsSchema,
});

export type SophiaOutput = z.infer<typeof SophiaOutputSchema>;

// Sophia Analysis Request (for API)
export const SophiaAnalyzeRequestSchema = z.object({
  targetType: z.enum(["profile", "job", "proposal"]),
  targetId: z.string(),
  targetTitle: z.string().optional(),
  targetText: z.string().min(10),
  userAnswerJa: z.string().optional(),
});

export type SophiaAnalyzeRequest = z.infer<typeof SophiaAnalyzeRequestSchema>;
