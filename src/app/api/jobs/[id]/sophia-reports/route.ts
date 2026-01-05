import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/jobs/:id/sophia-reports
 *
 * 特定のジョブに対するSophia分析報告書を取得
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

    // ジョブの所有権を確認
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    if (job.userId !== userId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // Sophia報告書を取得（最新順）
    const reports = await prisma.sophiaReport.findMany({
      where: {
        targetId: id,
        targetType: "job"
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("[Sophia Reports Get Error]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
