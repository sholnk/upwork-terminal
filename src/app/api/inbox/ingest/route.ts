import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InboxIngestSchema } from "@/lib/schemas/inbox";
import { extractEmailContent, isUpworkJobUrl } from "@/lib/inbox/extract";

export const dynamic = "force-dynamic";

/**
 * POST /api/inbox/ingest
 *
 * Webhook endpoint for receiving email messages from external service
 * (e.g., Postmark inbound webhook)
 *
 * This endpoint:
 * 1. Validates incoming email data
 * 2. Creates InboxMessage record
 * 3. Extracts URLs and content
 * 4. Creates InboxExtract records
 * 5. Returns created message ID
 *
 * Security: Requires webhook token validation
 */
export async function POST(req: NextRequest) {
  try {
    // Validate webhook token
    const token = req.headers.get("x-inbox-token");
    if (
      !token ||
      token !== process.env.INBOX_WEBHOOK_TOKEN ||
      !process.env.INBOX_WEBHOOK_TOKEN
    ) {
      return NextResponse.json(
        { error: "unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const ingestData = InboxIngestSchema.parse(body);

    // Get or create single-user (MVP mode)
    const userId = process.env.SINGLE_USER_ID;
    if (!userId) {
      throw new Error("SINGLE_USER_ID not configured");
    }

    // Extract content (URLs and snippets)
    const extracted = extractEmailContent(
      ingestData.subject,
      ingestData.rawBodyText
    );

    // Create InboxMessage with extracted content
    const message = await prisma.inboxMessage.create({
      data: {
        userId,
        from: ingestData.from,
        subject: ingestData.subject,
        snippet: ingestData.snippet || null,
        rawBodyText: ingestData.rawBodyText,
        provider: ingestData.provider,
        receivedAt: new Date(ingestData.receivedAt),
        status: "new",
        extracts: {
          create: [
            // Job links
            ...extracted.jobLinks.map((url) => ({
              type: "job_link" as const,
              payloadJson: { url },
            })),
            // Text extracts
            ...extracted.textExtracts.map((text) => ({
              type: "text_extract" as const,
              payloadJson: { text },
            })),
          ],
        },
      },
      include: {
        extracts: true,
      },
    });

    return NextResponse.json({
      id: message.id,
      status: "created",
      extractsCount: message.extracts.length,
    });
  } catch (error) {
    console.error("[Inbox Ingest Error]", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "invalid_json" },
        { status: 400 }
      );
    }

    // Zod validation error
    if (
      error instanceof Error &&
      error.message.includes("ZodError") &&
      error.constructor.name === "ZodError"
    ) {
      return NextResponse.json(
        { error: "invalid_request", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
