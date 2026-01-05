import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProposalInputSchema } from "@/lib/schemas/proposal";
import { generateProposal } from "@/lib/proposal/generator";

export const dynamic = "force-dynamic";

/**
 * POST /api/proposals/generate
 *
 * Generate a proposal using Claude API
 * - Type A: Short deliverable template
 * - Type B: Audit → Build template
 *
 * Body:
 * {
 *   jobId: string,
 *   jobTitle: string,
 *   jobDescription: string,
 *   type: "A" | "B",
 *   summaryJa?: string,
 *   approachJa?: string,
 *   ...
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = process.env.SINGLE_USER_ID;
    if (!userId) {
      throw new Error("SINGLE_USER_ID not configured");
    }

    // Parse and validate request
    const body = await req.json();
    const input = ProposalInputSchema.parse(body);

    // Verify job exists and belongs to user
    const job = await prisma.job.findUnique({
      where: { id: input.jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "job_not_found" }, { status: 404 });
    }

    if (job.userId !== userId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // Generate proposal using Claude
    const proposal = await generateProposal(input);

    return NextResponse.json({
      success: true,
      proposal,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Proposal Generate Error]", error);

    if (error instanceof Error && error.message.includes("ZodError")) {
      return NextResponse.json(
        { error: "invalid_request" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "internal_error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
