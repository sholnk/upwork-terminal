import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/proposals
 *
 * Get all proposals for user
 * Returns proposals with related job information
 */
export async function GET(req: NextRequest) {
  try {
    const userId = process.env.SINGLE_USER_ID;
    if (!userId) {
      throw new Error("SINGLE_USER_ID not configured");
    }

    const proposals = await prisma.proposal.findMany({
      where: { userId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error("[Proposals List Error]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

/**
 * POST /api/proposals
 *
 * Create new proposal draft
 * Body:
 * {
 *   jobId: string,
 *   type: "A" | "B",
 *   coverLetter: string,
 *   bidAmount?: number
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = process.env.SINGLE_USER_ID;
    if (!userId) {
      throw new Error("SINGLE_USER_ID not configured");
    }

    const body = await req.json();
    const { jobId, type, coverLetter, bidAmount } = body;

    if (!jobId || !coverLetter) {
      return NextResponse.json(
        { error: "missing_fields" },
        { status: 400 }
      );
    }

    // Verify job exists and belongs to user
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "job_not_found" }, { status: 404 });
    }

    if (job.userId !== userId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // Create proposal
    const proposal = await prisma.proposal.create({
      data: {
        jobId,
        userId,
        coverLetter,
        bidAmount: bidAmount ? parseFloat(bidAmount) : null,
        status: "draft",
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error("[Proposal Create Error]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
