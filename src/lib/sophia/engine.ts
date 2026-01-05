/**
 * Sophia Analysis Engine
 *
 * Main execution logic with:
 * - Validation via Zod
 * - Retry mechanism (max 2 retries on failure)
 * - Raw response logging for debugging
 */

import { SophiaOutputSchema, type SophiaOutput } from "@/lib/sophia/schemas";
import {
  buildSophiaPrompt,
  type SophiaTargetType,
  type SophiaPrompt,
} from "@/lib/sophia/prompt";

export interface LLMProvider {
  /**
   * Complete JSON generation
   *
   * @param system - System prompt with rules and format
   * @param user - User payload with target and context
   * @param temperature - Model temperature (0.0-1.0), default 0.2 (deterministic)
   * @returns Parsed JSON object matching expected schema
   */
  completeJson(args: {
    system: string;
    user: string;
    temperature?: number;
  }): Promise<unknown>;
}

export interface RunSophiaArgs {
  provider: LLMProvider;
  targetType: SophiaTargetType;
  targetTitle?: string;
  targetText: string;
  userAnswerJa?: string;
}

export interface SophiaEngineResult {
  output: SophiaOutput;
  isValid: boolean;
  rawResponse?: unknown;
  retryCount: number;
}

/**
 * Run Sophia analysis with validation and retry
 *
 * Flow:
 * 1. Build prompt from args
 * 2. Call LLM provider with low temperature (0.2) for determinism
 * 3. Validate output against schema
 * 4. Retry up to 2 times on validation failure
 * 5. Return result with metadata
 */
export async function runSophia(
  args: RunSophiaArgs
): Promise<SophiaEngineResult> {
  const { system, user } = buildSophiaPrompt(args);

  let lastError: Error | null = null;
  let rawResponse: unknown = null;
  let retryCount = 0;

  // Retry loop (max 2 attempts)
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      if (attempt > 0) {
        retryCount++;
        console.log(`[Sophia] Retry attempt ${attempt}/2`);
      }

      // Call LLM provider
      rawResponse = await args.provider.completeJson({
        system,
        user,
        temperature: 0.2, // Low temperature for determinism
      });

      // Validate output
      const parsed = SophiaOutputSchema.safeParse(rawResponse);

      if (!parsed.success) {
        const error = new Error(
          `Sophia output validation failed: ${parsed.error.message}`
        );
        lastError = error;

        if (attempt === 2) {
          // Final attempt failed, log and return invalid result
          console.error("[Sophia] Validation failed after 2 retries", {
            errors: parsed.error.issues,
            rawResponse,
          });

          return {
            output: createEmptyOutput(),
            isValid: false,
            rawResponse,
            retryCount,
          };
        }

        continue; // Retry
      }

      // Success
      return {
        output: parsed.data,
        isValid: true,
        rawResponse,
        retryCount,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === 2) {
        // Final attempt failed
        console.error("[Sophia] Execution failed after 2 retries", lastError);

        return {
          output: createEmptyOutput(),
          isValid: false,
          rawResponse,
          retryCount,
        };
      }
    }
  }

  // Should not reach here, but handle gracefully
  throw lastError || new Error("Sophia analysis failed");
}

/**
 * Create empty/default Sophia output (for error cases)
 */
function createEmptyOutput(): SophiaOutput {
  return {
    q_meta: {
      intention: "(分析失敗)",
      misalignment: "(再度実行してください)",
      latent_frame: "N/A",
      premise_reflection: "N/A",
      feedback: "N/A",
      socratic_trigger: {
        question_ja: "別の角度から再度分析してみますか？",
        why_this_question: "初回の分析が失敗したため",
        answer_format_hint: "はい/いいえ",
      },
    },
    f_ultimate: {
      awareness: "分析失敗",
      classification: "エラー",
      navigation: {
        next_step: "再度実行",
        options: ["再試行", "スキップ"],
        recommended: "再試行",
      },
      verification: {
        assumptions: [],
        risks: ["分析エラー"],
        what_to_confirm_next: ["入力内容の確認"],
      },
      redefine: "N/A",
      meta_check: "N/A",
      r_update: {
        metrics: [],
        cadence: "N/A",
      },
    },
    artifacts: {
      summary_ja: "(分析失敗 - 再度実行してください)",
    },
  };
}
