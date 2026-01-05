"use client";

import { Button } from "@/components/ui/button";
import { InboxIcon } from "lucide-react";
import type { InboxStatusFilter } from "@/types/inbox";

interface InboxEmptyProps {
  statusFilter: InboxStatusFilter;
  searchQuery: string;
  onClearSearch: () => void;
}

/**
 * InboxEmpty Component
 *
 * Empty state when no messages match filters
 */
export function InboxEmpty({
  statusFilter,
  searchQuery,
  onClearSearch,
}: InboxEmptyProps) {
  const hasFilters = statusFilter !== "all" || searchQuery;

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <InboxIcon className="h-12 w-12 text-gray-400 mb-4" />

      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        {searchQuery
          ? "No messages found"
          : statusFilter === "new"
            ? "No new messages"
            : statusFilter === "processed"
              ? "No processed messages"
              : statusFilter === "ignored"
                ? "No ignored messages"
                : "No messages yet"}
      </h2>

      <p className="text-sm text-gray-600 mb-6 max-w-sm">
        {searchQuery
          ? `No messages match "${searchQuery}"`
          : statusFilter === "new"
            ? "You're all caught up! No new UpWork notifications."
            : statusFilter === "processed"
              ? "No messages have been processed yet."
              : statusFilter === "ignored"
                ? "No ignored messages."
                : "Configure your email webhook to receive UpWork notifications here."}
      </p>

      {hasFilters && (
        <Button onClick={onClearSearch} variant="outline">
          Clear Filters
        </Button>
      )}
    </div>
  );
}
