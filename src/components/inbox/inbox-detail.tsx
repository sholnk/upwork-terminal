"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { InboxMessageDetail } from "@/types/inbox";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { AlertCircle, CheckCircle2, Trash2, LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface InboxDetailProps {
  message: InboxMessageDetail;
  isLoading: boolean;
  onStatusChange: (newStatus: string) => void;
  onCreateJob: (jobId: string) => void;
}

/**
 * InboxDetail Component
 *
 * Right pane: Shows message details and actions
 * - Full message text
 * - Extracted URLs with action buttons
 * - Status management (Mark processed/ignored)
 * - Create Job action
 */
export function InboxDetail({
  message,
  isLoading,
  onStatusChange,
  onCreateJob,
}: InboxDetailProps) {
  const router = useRouter();
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [creatingJob, setCreatingJob] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdatingStatus(newStatus);
      const res = await fetch(`/api/inbox/messages/${message.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      onStatusChange(newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleCreateJob = async (url: string) => {
    try {
      setCreatingJob(true);
      const res = await fetch(`/api/inbox/messages/${message.id}/create-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobUrl: url }),
      });

      if (!res.ok) throw new Error("Failed to create job");

      const data = await res.json();
      onCreateJob(data.jobId);
      router.push(`/dashboard/jobs/${data.jobId}/analyze`);
    } catch (error) {
      console.error("Failed to create job:", error);
    } finally {
      setCreatingJob(false);
    }
  };

  const jobLinkExtracts = message.extracts.filter(
    (e) => e.type === "job_link"
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b sticky top-0 bg-white">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 line-clamp-2">
              {message.subject}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              From: <span className="font-medium">{message.from}</span>
            </p>
          </div>
          <Badge
            variant={
              message.status === "new"
                ? "default"
                : message.status === "processed"
                  ? "secondary"
                  : "outline"
            }
          >
            {message.status}
          </Badge>
        </div>

        <p className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(message.receivedAt), {
            addSuffix: true,
            locale: ja,
          })}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Message Body */}
        {message.rawBodyText && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Message Content
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap break-words">
              {message.rawBodyText}
            </div>
          </div>
        )}

        <Separator />

        {/* Extracted Links */}
        {message.extracts.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Extracted Content ({message.extracts.length})
            </h3>
            <div className="space-y-2">
              {jobLinkExtracts.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Job Links
                  </p>
                  <div className="space-y-1">
                    {jobLinkExtracts.map((extract) => (
                      <div
                        key={extract.id}
                        className="flex items-start gap-2 bg-blue-50 p-2 rounded border border-blue-200"
                      >
                        <LinkIcon className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <a
                            href={extract.payloadJson.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline truncate block"
                          >
                            {extract.payloadJson.url}
                          </a>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleCreateJob(String(extract.payloadJson.url || ""))
                          }
                          disabled={creatingJob || !!message.createdJobId}
                          className="flex-shrink-0"
                        >
                          {message.createdJobId ? "✓" : "→ Job"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Extracts */}
              {message.extracts.filter((e) => e.type !== "job_link").length >
                0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Text Extracts
                    </p>
                    <div className="space-y-1">
                      {message.extracts
                        .filter((e) => e.type !== "job_link")
                        .map((extract) => (
                          <div
                            key={extract.id}
                            className="text-xs bg-gray-50 p-2 rounded border border-gray-200 text-gray-700"
                          >
                            {extract.payloadJson.text ||
                              extract.payloadJson.url ||
                              JSON.stringify(extract.payloadJson)}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="p-4 border-t bg-gray-50 space-y-2">
        {message.createdJobId && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
            <CheckCircle2 className="h-4 w-4" />
            <span>Job created successfully</span>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {message.status !== "processed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate("processed")}
              disabled={updatingStatus === "processed"}
            >
              Mark Processed
            </Button>
          )}

          {message.status !== "ignored" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleStatusUpdate("ignored")}
              disabled={updatingStatus === "ignored"}
              className="text-gray-600"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Ignore
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
