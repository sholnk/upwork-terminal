import { Metadata } from "next";
import { InboxShell } from "@/components/inbox/inbox-shell";

export const metadata: Metadata = {
  title: "Inbox | UpWork Terminal",
  description: "UpWork notifications and job leads",
};

/**
 * Inbox Page
 *
 * 2-pane interface for managing UpWork notifications:
 * - Left: Messages list with filtering
 * - Right: Message detail with extraction and actions
 */
export default function InboxPage() {
  return (
    <div className="h-screen bg-white">
      <div className="px-4 py-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
        <p className="text-sm text-gray-600">
          UpWork notifications and job leads
        </p>
      </div>

      <div className="h-[calc(100vh-120px)]">
        <InboxShell />
      </div>
    </div>
  );
}
