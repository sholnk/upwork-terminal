"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  InboxMessageItem,
  InboxMessageDetail,
  InboxStatusFilter,
  InboxListResponse,
} from "@/types/inbox";
import { InboxFilters } from "./inbox-filters";
import { InboxList } from "./inbox-list";
import { InboxDetail } from "./inbox-detail";
import { InboxEmpty } from "./inbox-empty";

/**
 * InboxShell Component
 *
 * Main container that manages:
 * - Filter state (status, search)
 * - List data fetching
 * - Selected message detail view
 * - Layout coordination (2 panes)
 */
export function InboxShell() {
  const [statusFilter, setStatusFilter] = useState<InboxStatusFilter>("new");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch messages based on filters
  const { data: listData, isLoading: isListLoading } = useQuery({
    queryKey: ["inbox-messages", statusFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (searchQuery) {
        params.append("q", searchQuery);
      }

      const res = await fetch(`/api/inbox/messages?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json() as Promise<InboxListResponse>;
    },
  });

  // Fetch detail for selected message
  const { data: detailData, isLoading: isDetailLoading } = useQuery({
    queryKey: ["inbox-message", selectedId],
    queryFn: async () => {
      if (!selectedId) return null;
      const res = await fetch(`/api/inbox/messages/${selectedId}`);
      if (!res.ok) throw new Error("Failed to fetch message");
      return res.json() as Promise<InboxMessageDetail>;
    },
    enabled: !!selectedId,
  });

  // Clear selection when filters change
  useEffect(() => {
    setSelectedId(null);
  }, [statusFilter, searchQuery]);

  const messages = listData?.messages || [];

  if (!isListLoading && messages.length === 0) {
    return (
      <InboxEmpty
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        onClearSearch={() => setSearchQuery("")}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b">
        <InboxFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Main Content: 2 Panes */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane: List */}
        <div className="w-1/3 border-r overflow-y-auto">
          <InboxList
            messages={messages}
            selectedId={selectedId}
            onSelectMessage={setSelectedId}
            isLoading={isListLoading}
          />
        </div>

        {/* Right Pane: Detail */}
        <div className="flex-1 overflow-y-auto">
          {selectedId && detailData ? (
            <InboxDetail
              message={detailData}
              isLoading={isDetailLoading}
              onStatusChange={(newStatus) => {
                // Refetch list after status change
                setSelectedId(null);
              }}
              onCreateJob={(jobId) => {
                // Navigate to job detail
                window.location.href = `/dashboard/jobs/${jobId}/analyze`;
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              {selectedId && isDetailLoading
                ? "Loading message..."
                : "Select a message to view details"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
