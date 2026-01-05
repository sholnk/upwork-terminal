"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { InboxMessageItem } from "@/types/inbox";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface InboxListProps {
  messages: InboxMessageItem[];
  selectedId: string | null;
  onSelectMessage: (id: string) => void;
  isLoading: boolean;
}

/**
 * InboxList Component
 *
 * Left pane: Shows list of messages
 * - Clickable items with sender, subject, timestamp
 * - Visual selection indicator
 * - Status badge
 * - Extracts count badge
 */
export function InboxList({
  messages,
  selectedId,
  onSelectMessage,
  isLoading,
}: InboxListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y">
      {messages.map((message) => (
        <button
          key={message.id}
          onClick={() => onSelectMessage(message.id)}
          className={`w-full text-left p-3 hover:bg-gray-50 transition border-l-4 ${
            selectedId === message.id
              ? "border-l-blue-500 bg-blue-50"
              : "border-l-transparent"
          }`}
        >
          {/* From / Status */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-medium truncate">{message.from}</span>
            <div className="flex gap-1 flex-shrink-0">
              <Badge variant="outline" className="text-xs">
                {message.status}
              </Badge>
              {message.extractsCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {message.extractsCount} items
                </Badge>
              )}
            </div>
          </div>

          {/* Subject */}
          <p className="text-sm font-semibold text-gray-900 truncate mb-1">
            {message.subject}
          </p>

          {/* Snippet */}
          {message.snippet && (
            <p className="text-xs text-gray-600 truncate">{message.snippet}</p>
          )}

          {/* Timestamp */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(message.receivedAt), {
                addSuffix: true,
                locale: ja,
              })}
            </span>
            {message.createdJobId && (
              <Badge variant="secondary" className="text-xs">
                ✓ Job created
              </Badge>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
