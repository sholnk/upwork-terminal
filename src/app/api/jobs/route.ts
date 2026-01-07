import { NextRequest, NextResponse } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";
import { CreateJobSchema, UpdateJobSchema } from "@/lib/schemas/job";
import { extractUpworkJobId } from "@/lib/upwork/url-parser";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/jobs
 * List all jobs for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = process.env.SINGLE_USER_ID;
    if (!userId) {
      return NextResponse.json(
        { error: "ユーザーIDが設定されていません" },
        { status: 500 }
      );
    }

    // Get search/filter params
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    const where: Prisma.JobWhereInput = { userId };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { skills: { hasSome: [search] } },
      ];
    }
    // TODO: Add status filter once Job model includes status field

    // Get jobs
    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Get total count
    const total = await prisma.job.count({ where });

    return NextResponse.json({
      jobs,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[Jobs List Error]", error);
    return NextResponse.json(
      { error: "ジョブ一覧取得に失敗しました" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/jobs
 * Create a new job manually (手入力)
 *
 * Body:
 * {
 *   title: "Job title",
 *   description: "Job description",
 *   upworkJobId?: "12345",
 *   url?: "https://upwork.com/jobs/...",
 *   skills?: ["skill1", "skill2"],
 *   budget?: 5000,
 *   budgetType?: "fixed",
 *   experienceLevel?: "expert",
 *   postedAt?: "2026-01-07T12:00:00Z"
 * }
 *
 * Response:
 * {
 *   id: "job_id",
 *   status: "created",
 *   url: "/jobs/job_id"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = process.env.SINGLE_USER_ID;
    if (!userId) {
      return NextResponse.json(
        { error: "ユーザーIDが設定されていません" },
        { status: 500 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const data = CreateJobSchema.parse(body);

    // Extract upworkJobId if URL provided
    let upworkJobId = data.upworkJobId;
    if (data.url && !upworkJobId) {
      const extractedId = extractUpworkJobId(data.url);
      if (extractedId) {
        upworkJobId = extractedId;
      }
    }

    // Generate temporary job ID if not provided
    if (!upworkJobId) {
      upworkJobId = `manual-${Date.now()}`;
    }

    // Create job in database
    const job = await prisma.job.create({
      data: {
        userId,
        upworkJobId,
        title: data.title,
        description: data.description,
        skills: data.skills || [],
        budget: data.budget ? new Decimal(data.budget.toString()) : null,
        budgetType: data.budgetType,
        experienceLevel: data.experienceLevel,
        duration: data.duration,
        jobType: data.jobType,
        category: data.category,
        subcategory: data.subcategory,
        postedAt: data.postedAt || new Date(),
        url: data.url || `https://upwork.com/jobs/${upworkJobId}`,
        source: data.source,
        createdFromInboxMessageId: data.createdFromInboxMessageId,
        saved: true,
      },
    });

    // Log to issue tracker
    console.log(`[Issue #1 Sub-Task] ✅ Job created: ${job.id}`);
    console.log(`  - Title: ${job.title}`);
    console.log(`  - Source: ${job.source}`);

    return NextResponse.json(
      {
        id: job.id,
        status: "created",
        url: `/jobs/${job.id}`,
        title: job.title,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Jobs Create Error]", error);

    // Zod validation error
    if (error instanceof Error && error.constructor.name === "ZodError") {
      return NextResponse.json(
        {
          error: "入力値が無効です",
          details: error.message,
        },
        { status: 400 }
      );
    }

    // Unique constraint error (upworkJobId already exists)
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      return NextResponse.json(
        {
          error: "このジョブは既に登録されています",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "ジョブ作成に失敗しました",
      },
      { status: 500 }
    );
  }
}
