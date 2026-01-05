"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";

interface JobSophiaButtonProps {
  jobId: string;
  jobTitle: string;
}

/**
 * JobSophiaButton Component
 *
 * Sophia分析実行ボタン
 * - クリックで POST /api/sophia/analyze 実行
 * - ローディング状態表示
 * - 成功時は SophiaReportDisplay へ
 */
export function JobSophiaButton({
  jobId,
  jobTitle,
}: JobSophiaButtonProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: runAnalysis, isPending } = useMutation({
    mutationFn: async () => {
      // ジョブ詳細をまず取得
      const jobRes = await fetch(`/api/jobs/${jobId}`);
      if (!jobRes.ok) throw new Error("Failed to fetch job");
      const jobData = await jobRes.json();

      // Sophia分析を実行
      const res = await fetch("/api/sophia/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "job",
          targetId: jobId,
          targetTitle: jobTitle,
          targetText: jobData.description || jobData.title,
        }),
      });

      if (!res.ok) throw new Error("Failed to run Sophia analysis");
      return res.json();
    },
    onSuccess: () => {
      // キャッシュ無効化
      queryClient.invalidateQueries({
        queryKey: ["job-sophia-reports", jobId],
      });
      setIsOpen(false);
    },
  });

  return (
    <div className="space-y-3">
      <Button
        onClick={() => runAnalysis()}
        disabled={isPending}
        className="w-full"
        variant="default"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            分析中...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 mr-2" />
            Sophia分析を実行
          </>
        )}
      </Button>

      <p className="text-xs text-gray-600">
        このジョブに対してSophia分析を実行します。
        Q_META（意図・ズレ・前提）とF_ULTIMATE（戦略・検証）を得られます。
      </p>
    </div>
  );
}
