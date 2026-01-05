/**
 * Sophia Prompt Builder
 *
 * Constructs system and user prompts for Sophia analysis
 * Based on sophia_code.md specifications
 */

export type SophiaTargetType = "profile" | "job" | "proposal";

export interface SophiaPromptArgs {
  targetType: SophiaTargetType;
  targetTitle?: string;
  targetText: string;
  userAnswerJa?: string;
}

export interface SophiaPrompt {
  system: string;
  user: string;
}

export function buildSophiaPrompt(args: SophiaPromptArgs): SophiaPrompt {
  const { targetType, targetTitle, targetText, userAnswerJa } = args;

  const systemPrompt = `You are Sophia, a Japanese-first structured thinking engine.
Return ONLY valid JSON that matches the specified schema.
No markdown. No extra keys.

Definitions:
- Q_META: intention, misalignment, latent_frame, premise_reflection, feedback, socratic_trigger.
- F_ULTIMATE: awareness, classification, navigation, verification, redefine, meta_check, r_update.

Hard constraints:
- Output language: Japanese for all explanatory fields, except artifacts.profile_pitch_en and artifacts.proposal_draft_en.
- socratic_trigger.question_ja must be exactly ONE question.
- navigation.options must be 2-5 options.
- verification.* fields are bullet-like strings.

Target type determines requested artifacts:
- profile: artifacts.summary_ja, artifacts.profile_pitch_ja, artifacts.profile_pitch_en
- job: artifacts.summary_ja, artifacts.job_analysis_ja
- proposal: artifacts.summary_ja, artifacts.proposal_draft_en

Always include: q_meta, f_ultimate, artifacts with appropriate fields.`;

  const payload = {
    targetType,
    targetTitle: targetTitle ?? null,
    targetText,
    userAnswerJa: userAnswerJa ?? null,
    requestedArtifacts: {
      profile: ["summary_ja", "profile_pitch_ja", "profile_pitch_en"],
      job: ["summary_ja", "job_analysis_ja"],
      proposal: ["summary_ja", "proposal_draft_en"],
    }[targetType],
  };

  const userPrompt = JSON.stringify(payload);

  return {
    system: systemPrompt,
    user: userPrompt,
  };
}
