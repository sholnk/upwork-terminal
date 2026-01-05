import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/inbox/messages/:id
 *
 * Get detailed inbox message with all extracts
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

    const message = await prisma.inboxMessage.findUnique({
      where: { id },
      include: {
        extracts: {
          select: {
            id: true,
            type: true,
            payloadJson: true,
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: "not_found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (message.userId !== userId) {
      return NextResponse.json(
        { error: "forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: message.id,
      from: message.from,
      subject: message.subject,
      snippet: message.snippet,
      rawBodyText: message.rawBodyText,
      status: message.status,
      receivedAt: message.receivedAt,
      createdJobId: message.createdJobId,
      extracts: message.extracts,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    });
  } catch (error) {
    console.error("[Inbox Detail Error]", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
