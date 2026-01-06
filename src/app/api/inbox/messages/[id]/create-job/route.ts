import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InboxCreateJobSchema } from "@/lib/schemas/inbox";
import { extractUpworkJobId } from "@/lib/inbox/extract";

export const dynamic = "force-dynamic";

/**
 * POST /api/inbox/messages/:id/create-job
 *
 * Create a Job record from an Inbox message
 *
 * This endpoint:
 * 1. Validates the job URL
 * 2. Creates Job record (inbox source)
 * 3. Updates InboxMessage.createdJobId
 * 4. Sets InboxMessage status to "processed"
 * 5. Returns created job ID
 *
 * Body:
 * {
 *   jobUrl: "https://www.upwork.com/jobs/...",
 *   titleOverride?: "Custom job title" (optional)
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = process.env.SINGLE_USER_ID;
    if (!userId) {
      throw new Error("SINGLE_USER_ID not configured");
    }

    // Parse and validate body
    const body = await req.json();
    const input = InboxCreateJobSchema.parse(body);

    // Await params in Next.js 15+
    const { id } = await params;

    // Get and verify inbox message
    const message = await prisma.inboxMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json(
        { error: "message_not_found" },
        { status: 404 }
      );
    }

    if (message.userId !== userId) {
      return NextResponse.json(
        { error: "forbidden" },
        { status: 403 }
      );
    }

    // If job already created from this message, return it
    if (message.createdJobId) {
      return NextResponse.json({
        jobId: message.createdJobId,
        status: "already_created",
      });
    }

    // Extract job ID from URL (if UpWork URL)
    const upworkJobId = extractUpworkJobId(input.jobUrl);

    // Create job with inbox source
    const job = await prisma.job.create({
      data: {
        userId,
        upworkJobId: upworkJobId || `temp-${Date.now()}`, // Use temp ID if not UpWork format
        title:
          input.titleOverride ||
          message.subject ||
          "Job from Inbox",
        description: message.rawBodyText || "From Inbox message",
        postedAt: message.receivedAt,
        url: input.jobUrl,
        source: "inbox",
        createdFromInboxMessageId: message.id,
        saved: true, // Auto-save when created from inbox
      },
    });

    // Update inbox message with job ID and mark processed
    await prisma.inboxMessage.update({
      where: { id },
      data: {
        createdJobId: job.id,
        status: "processed",
      },
    });

    return NextResponse.json(
      {
        jobId: job.id,
        status: "created",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Inbox Create Job Error]", error);

    if (error instanceof Error && error.message.includes("ZodError")) {
      return NextResponse.json(
        { error: "invalid_request" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
