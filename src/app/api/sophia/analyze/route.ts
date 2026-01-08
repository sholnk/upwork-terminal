import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { runSophia } from "@/lib/sophia/engine";
import { SophiaAnalyzeRequestSchema } from "@/lib/sophia/schemas";
import { getProvider } from "@/lib/sophia/provider";
import type { SophiaTargetType } from "@/lib/sophia/prompt";

export const dynamic = "force-dynamic";

/**
 * POST /api/sophia/analyze
 *
 * Execute Sophia analysis on a target (profile, job, or proposal)
 *
 * Request body:
 * {
 *   targetType: "profile" | "job" | "proposal",
 *   targetId: string,
 *   targetTitle?: string,
 *   targetText: string (min 10 chars),
 *   userAnswerJa?: string (user response to previous socratic question)
 * }
 *
 * Response:
 * {
 *   sophiaReportId: string,
 *   output: SophiaOutput,
 *   isValid: boolean,
 *   retryCount: number
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Get user ID (MVP single-user mode)
    const userId = process.env.SINGLE_USER_ID;
    if (!userId) {
      throw new Error("SINGLE_USER_ID not configured");
    }

    // Parse and validate request
    const body = await req.json();
    const request = SophiaAnalyzeRequestSchema.parse(body);

    // Run Sophia analysis
    const result = await runSophia({
      provider: getProvider(),
      targetType: request.targetType as SophiaTargetType,
      targetTitle: request.targetTitle,
      targetText: request.targetText,
      userAnswerJa: request.userAnswerJa,
    });

    // Save report to database
    const report = await prisma.sophiaReport.create({
      data: {
        userId,
        targetType: request.targetType as SophiaTargetType,
        targetId: request.targetId,
        userAnswerJa: request.userAnswerJa || null,
        qMetaJson: result.output.q_meta,
        fUltimateJson: result.output.f_ultimate,
        artifactsJson: result.output.artifacts,
        isValid: result.isValid,
        retryCount: result.retryCount,
      },
    });

    return NextResponse.json(
      {
        sophiaReportId: report.id,
        output: result.output,
        isValid: result.isValid,
        retryCount: result.retryCount,
      },
      { status: result.isValid ? 200 : 206 } // 206 Partial Content if validation failed
    );
  } catch (error) {
    console.error("[Sophia API Error]", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "invalid_json" },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message.includes("ZodError")
    ) {
      return NextResponse.json(
        {
          error: "invalid_request",
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "internal_error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
