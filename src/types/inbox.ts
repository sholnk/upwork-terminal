import type { InboxStatus } from "@prisma/client";

/**
 * Inbox UI Types
 */

export interface InboxMessageItem {
  id: string;
  from: string;
  subject: string;
  snippet: string | null;
  status: InboxStatus;
  receivedAt: Date;
  createdJobId: string | null;
  extractsCount: number;
  createdAt: Date;
}

export interface InboxExtract {
  id: string;
  type: "job_link" | "text_extract";
  payloadJson: Record<string, unknown>;
}

export interface InboxMessageDetail extends InboxMessageItem {
  rawBodyText: string | null;
  extracts: InboxExtract[];
  updatedAt: Date;
}

export interface InboxListResponse {
  messages: InboxMessageItem[];
  total: number;
  limit: number;
  offset: number;
}

export type InboxStatusFilter = InboxStatus | "all";

export interface InboxUIState {
  statusFilter: InboxStatusFilter;
  searchQuery: string;
  selectedMessageId: string | null;
  isLoadingDetail: boolean;
  error: string | null;
}
