"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Job, Proposal } from "@prisma/client";
import { JobBasicInfo } from "./job-basic-info";
import { JobScoreCard } from "./job-score-card";
import { JobScoringForm } from "./job-scoring-form";
import { JobMemoEditor } from "./job-memo-editor";
import { JobTagEditor } from "./job-tag-editor";
import { JobDecisionButtons } from "./job-decision-buttons";
import { JobSophiaButton } from "./job-sophia-button";
import { SophiaReportDisplay } from "@/components/sophia/sophia-report-display";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface JobAnalyzeShellProps {
  job: Job & {
    proposals: Array<{
      id: string;
      status: string;
      connectsUsed: number;
      createdAt: Date;
    }>;
  };
}

/**
 * JobAnalyzeShell Component
 *
 * Job分析ページのメイン状態管理
 * - スコアリング入力
 * - Sophia分析実行
 * - メモ・タグ管理
 * - 意思決定（propose/hold/drop）
 */
export function JobAnalyzeShell({ job }: JobAnalyzeShellProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("analysis");
  const [scores, setScores] = useState({
    fit: 10,
    clarity: 10,
    budgetRoi: 10,
    clientQuality: 10,
    winChance: 10,
  });
  const [decision, setDecision] = useState<"propose" | "hold" | "drop" | null>(
    null
  );
  const [notesJa, setNotesJa] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // 分析結果を取得
  const { data: analysisData } = useQuery({
    queryKey: ["job-analysis", job.id],
    queryFn: async () => {
      if (!job.analysisJson) return null;
      return job.analysisJson;
    },
  });

  // Sophia報告書を取得
  const { data: sophiaReports, isLoading: isSophiaLoading } = useQuery({
    queryKey: ["job-sophia-reports", job.id],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${job.id}/sophia-reports`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Job更新
  const { mutate: updateJob, isPending: isUpdatingJob } = useMutation({
    mutationFn: async (data: {
      scores?: typeof scores;
      decision?: string;
      notesJa?: string;
      tags?: string[];
    }) => {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisJson: {
            scores: data.scores || scores,
            decision: data.decision || decision,
          },
          notes: data.notesJa || notesJa,
          tags: data.tags || tags,
        }),
      });

      if (!res.ok) throw new Error("Failed to update job");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-analysis", job.id] });
    },
  });

  const handleScoresChange = (newScores: typeof scores) => {
    setScores(newScores);
    updateJob({ scores: newScores });
  };

  const handleDecision = (newDecision: "propose" | "hold" | "drop") => {
    setDecision(newDecision);
    updateJob({ decision: newDecision });
  };

  return (
    <div className="flex h-full gap-6 p-6 overflow-hidden">
      {/* Left: Job情報 + スコアリング */}
      <div className="flex-1 overflow-y-auto space-y-6">
        <JobBasicInfo job={job} />

        <Separator />

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            スコアリング
          </h2>
          <JobScoreCard scores={scores} />
          <JobScoringForm
            scores={scores}
            onScoresChange={handleScoresChange}
            isLoading={isUpdatingJob}
          />
        </div>

        <Separator />

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">メモ</h2>
          <JobMemoEditor
            value={notesJa}
            onChange={(value) => {
              setNotesJa(value);
              updateJob({ notesJa: value });
            }}
          />
        </div>

        <Separator />

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">タグ</h2>
          <JobTagEditor
            value={tags}
            onChange={(newTags) => {
              setTags(newTags);
              updateJob({ tags: newTags });
            }}
          />
        </div>

        <Separator />

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">意思決定</h2>
          <JobDecisionButtons
            currentDecision={decision}
            onDecision={handleDecision}
            isLoading={isUpdatingJob}
          />
        </div>
      </div>

      {/* Right: Sophia分析 + Proposal履歴 */}
      <div className="w-96 overflow-y-auto border-l pl-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analysis">Sophia分析</TabsTrigger>
            <TabsTrigger value="proposals">提案履歴</TabsTrigger>
          </TabsList>

          {/* Sophia分析タブ */}
          <TabsContent value="analysis" className="mt-4 space-y-4">
            <JobSophiaButton jobId={job.id} jobTitle={job.title} />

            {isSophiaLoading ? (
              <div className="text-center text-sm text-gray-600">
                分析中...
              </div>
            ) : sophiaReports && sophiaReports.length > 0 ? (
              <div className="space-y-4">
                {sophiaReports.map((report: unknown) => (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  <SophiaReportDisplay key={(report as any).id} report={report as any} />
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500">
                まだ分析がありません
              </div>
            )}
          </TabsContent>

          {/* 提案履歴タブ */}
          <TabsContent value="proposals" className="mt-4 space-y-2">
            {job.proposals.length > 0 ? (
              <div className="space-y-2">
                {job.proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="p-3 bg-gray-50 rounded border text-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{proposal.status}</span>
                      <span className="text-xs text-gray-600">
                        {proposal.connectsUsed} connects
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(proposal.createdAt).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500">
                提案がまだありません
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
