import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/jobs/:id
 *
 * Job詳細取得
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = process.env.SINGLE_USER_ID;
    if (!userId) {
      throw new Error("SINGLE_USER_ID not configured");
    }

    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        proposals: {
          select: {
            id: true,
            status: true,
            connectsUsed: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // Verify ownership
    if (job.userId !== userId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("[Job Get Error]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

/**
 * PATCH /api/jobs/:id
 *
 * Job更新（notes, tags, analysisJson, rating）
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = process.env.SINGLE_USER_ID;
    if (!userId) {
      throw new Error("SINGLE_USER_ID not configured");
    }

    const { id } = await params;

    const body = await req.json();
    const {
      notes,
      tags,
      analysisJson,
      rating,
    } = body;

    // Verify job exists and belongs to user
    const existing = await prisma.job.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // Update job
    const updated = await prisma.job.update({
      where: { id },
      data: {
        ...(notes !== undefined && { notes }),
        ...(tags !== undefined && { tags }),
        ...(analysisJson !== undefined && { analysisJson }),
        ...(rating !== undefined && { rating }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Job Patch Error]", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
