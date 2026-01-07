"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, Mail, FileText, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface InboxMessage {
  id: string;
  from: string;
  subject: string;
  snippet?: string;
  status: string;
  extractsCount: number;
  createdJobId?: string;
}

interface ScrapedJobPreview {
  title: string;
  description: string;
  skills: string[];
  budget?: number;
  budgetType?: string;
}

export default function JobImportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("email");
  const [loading, setLoading] = useState(false);
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(false);

  // Tab 1: Email
  const loadInboxMessages = async () => {
    setLoadingInbox(true);
    try {
      const response = await fetch("/api/inbox/messages?status=new&limit=20");
      if (!response.ok) throw new Error("Failed to load inbox");
      const data = await response.json();
      setInboxMessages(data.messages || []);
    } catch (error) {
      console.error("Error loading inbox:", error);
    } finally {
      setLoadingInbox(false);
    }
  };

  const handleImportFromEmail = async (messageId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/inbox/messages/${messageId}/create-job`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobUrl: "auto" }),
        }
      );

      if (!response.ok) throw new Error("Failed to import from email");
      const data = await response.json();

      // Update local state
      setInboxMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, createdJobId: data.jobId, status: "processed" }
            : msg
        )
      );

      // Show success and redirect
      setTimeout(() => {
        router.push(`/jobs/${data.jobId}/analyze`);
      }, 1000);
    } catch (error) {
      console.error("Error importing from email:", error);
      alert("Failed to import job from email");
    } finally {
      setLoading(false);
    }
  };

  // Tab 2: Manual Form
  const handleManualForm = () => {
    router.push("/jobs/new");
  };

  // Tab 3: URL Scraping
  const [urlInput, setUrlInput] = useState("");
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapePreview, setScrapePreview] = useState<ScrapedJobPreview | null>(
    null
  );
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  const handleScrapeUrl = async () => {
    if (!urlInput.trim()) return;

    setScrapeLoading(true);
    setScrapeError(null);
    setScrapePreview(null);

    try {
      const response = await fetch(
        `/api/jobs/import-from-upwork?url=${encodeURIComponent(urlInput)}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error);
      }

      const data = await response.json();
      setScrapePreview(data.preview);
    } catch (error) {
      setScrapeError(
        error instanceof Error ? error.message : "Failed to scrape job"
      );
    } finally {
      setScrapeLoading(false);
    }
  };

  const handleImportScrapedJob = async () => {
    if (!urlInput.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/jobs/import-from-upwork", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upworkJobUrl: urlInput,
        }),
      });

      if (!response.ok) throw new Error("Failed to import job");
      const data = await response.json();

      router.push(`/jobs/${data.jobId}/analyze`);
    } catch (error) {
      alert("Failed to import job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ジョブをインポート</h1>
          <p className="text-gray-600 mt-2">
            複数の方法でジョブを追加できます
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">メール</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">手入力</span>
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">URL</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Email */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>メール から ジョブをインポート</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  受け取ったメールから Upwork ジョブ URL を自動検出して、ワンクリックでインポートします
                </p>

                <Button
                  onClick={() => {
                    loadInboxMessages();
                    setActiveTab("email");
                  }}
                  disabled={loadingInbox}
                >
                  {loadingInbox && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  メール をロード
                </Button>

                <div className="space-y-3 mt-4">
                  {loadingInbox && (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  )}

                  {inboxMessages.length === 0 && !loadingInbox && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-sm">
                        メールはまだありません
                      </p>
                    </div>
                  )}

                  {inboxMessages.map((message) => (
                    <div
                      key={message.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {message.subject}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            From: {message.from}
                          </p>
                          {message.snippet && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                              {message.snippet}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Links found: {message.extractsCount}
                          </p>
                        </div>
                        {message.createdJobId ? (
                          <Badge variant="default" className="flex-shrink-0">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            済み
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleImportFromEmail(message.id)}
                            disabled={loading}
                            className="flex-shrink-0"
                          >
                            {loading && (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            )}
                            インポート
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Manual */}
          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>手入力 でジョブを追加</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  ジョブの詳細情報をフォームに入力して、新しいジョブを作成します
                </p>
                <Button onClick={handleManualForm}>
                  ジョブ追加フォーム を開く
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: URL */}
          <TabsContent value="url">
            <Card>
              <CardHeader>
                <CardTitle>URL から スクレイピング</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Upwork のジョブ URL を貼り付けると、自動で詳細情報を取得します
                </p>

                {/* URL Input */}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="https://www.upwork.com/jobs/1234567"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setScrapeError(null);
                      setScrapePreview(null);
                    }}
                    disabled={scrapeLoading}
                  />
                  <Button
                    onClick={handleScrapeUrl}
                    disabled={scrapeLoading || !urlInput.trim()}
                  >
                    {scrapeLoading && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    プレビュー
                  </Button>
                </div>

                {/* Error */}
                {scrapeError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    {scrapeError}
                  </div>
                )}

                {/* Preview */}
                {scrapePreview && (
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold text-sm mb-3">
                      プレビュー (取得済み)
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">
                          {scrapePreview.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 line-clamp-2">
                          {scrapePreview.description}
                        </p>
                      </div>
                      {scrapePreview.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {scrapePreview.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {scrapePreview.budget && (
                        <div className="text-gray-600">
                          Budget: ${scrapePreview.budget}{" "}
                          {scrapePreview.budgetType === "hourly"
                            ? "/hr"
                            : ""}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleImportScrapedJob}
                      disabled={loading}
                      className="w-full mt-4"
                    >
                      {loading && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      このジョブ をインポート
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
