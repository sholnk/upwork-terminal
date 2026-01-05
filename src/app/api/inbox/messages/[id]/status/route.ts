import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateInboxStatusSchema } from "@/lib/schemas/inbox";

/**
 * PATCH /api/inbox/messages/:id/status
 *
 * Update message status (new -> processed/ignored)
 *
 * Body:
 * {
 *   status: "new" | "processed" | "ignored"
 * }
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

    // Parse and validate body
    const body = await req.json();
    const data = UpdateInboxStatusSchema.parse(body);

    // Verify message exists and belongs to user
    const existing = await prisma.inboxMessage.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "not_found" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: "forbidden" },
        { status: 403 }
      );
    }

    // Update status
    const updated = await prisma.inboxMessage.update({
      where: { id },
      data: { status: data.status },
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error("[Inbox Status Update Error]", error);

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
