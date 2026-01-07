import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InboxListQuerySchema } from "@/lib/schemas/inbox";
import type { InboxStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/inbox/messages
 *
 * List inbox messages with filtering
 *
 * Query parameters:
 * - status: "new" | "processed" | "ignored" (optional)
 * - q: search query (searches subject + from) (optional)
 * - limit: max results, default 20, max 100
 * - offset: pagination offset, default 0
 *
 * Returns lightweight list (extracts count only, not full content)
 */
export async function GET(req: NextRequest) {
  try {
    const userId = process.env.SINGLE_USER_ID;
    if (!userId) {
      throw new Error("SINGLE_USER_ID not configured");
    }

    // Parse and validate query params
    const searchParams = req.nextUrl.searchParams;
    const query = InboxListQuerySchema.parse({
      status: searchParams.get("status"),
      q: searchParams.get("q"),
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
    });

    // Build where clause
    const where: Prisma.InboxMessageWhereInput = { userId };

    if (query.status) {
      where.status = query.status as InboxStatus;
    }

    if (query.q) {
      where.OR = [
        { subject: { contains: query.q, mode: "insensitive" } },
        { from: { contains: query.q, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.inboxMessage.count({ where });

    // Get paginated messages (lightweight)
    const messages = await prisma.inboxMessage.findMany({
      where,
      select: {
        id: true,
        from: true,
        subject: true,
        snippet: true,
        status: true,
        receivedAt: true,
        createdJobId: true,
        createdAt: true,
        _count: {
          select: { extracts: true },
        },
      },
      orderBy: { receivedAt: "desc" },
      take: query.limit,
      skip: query.offset,
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        from: m.from,
        subject: m.subject,
        snippet: m.snippet,
        status: m.status,
        receivedAt: m.receivedAt,
        createdJobId: m.createdJobId,
        extractsCount: m._count.extracts,
        createdAt: m.createdAt,
      })),
      total,
      limit: query.limit,
      offset: query.offset,
    });
  } catch (error) {
    console.error("[Inbox List Error]", error);

    if (error instanceof Error && error.message.includes("ZodError")) {
      return NextResponse.json(
        { error: "invalid_query" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
