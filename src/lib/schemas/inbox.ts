import { z } from "zod";
import { InboxStatus, InboxProvider, InboxExtractType } from "@prisma/client";

/**
 * Inbox Message Schemas
 * Used for webhook ingestion, API responses, and validation
 */

// Webhook ingest schema (from Postmark or other email service)
export const InboxIngestSchema = z.object({
  from: z.string().email(),
  subject: z.string(),
  snippet: z.string().optional(),
  rawBodyText: z.string(),
  receivedAt: z.string().datetime().or(z.date()),
  provider: z.enum(["gmail", "forwarded_email", "manual"]),
});

export type InboxIngestInput = z.infer<typeof InboxIngestSchema>;

// Inbox message response
export const InboxMessageSchema = z.object({
  id: z.string(),
  userId: z.string(),
  from: z.string(),
  subject: z.string(),
  snippet: z.string().nullable(),
  rawBodyText: z.string().nullable(),
  status: z.enum(["new", "processed", "ignored"]),
  provider: z.enum(["gmail", "forwarded_email", "manual"]),
  receivedAt: z.date(),
  createdJobId: z.string().nullable(),
  extracts: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["job_link", "text_extract"]),
      payloadJson: z.record(z.string(), z.any()),
    })
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type InboxMessage = z.infer<typeof InboxMessageSchema>;

// Update status request
export const UpdateInboxStatusSchema = z.object({
  status: z.enum(["new", "processed", "ignored"]),
});

export type UpdateInboxStatusInput = z.infer<typeof UpdateInboxStatusSchema>;

// Create Job from Inbox request
export const InboxCreateJobSchema = z.object({
  jobUrl: z.string().url(),
  titleOverride: z.string().optional(),
});

export type InboxCreateJobInput = z.infer<typeof InboxCreateJobSchema>;

// List query params
export const InboxListQuerySchema = z.object({
  status: z.enum(["new", "processed", "ignored"]).optional(),
  q: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type InboxListQuery = z.infer<typeof InboxListQuerySchema>;
