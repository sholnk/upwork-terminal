"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface JobDecisionButtonsProps {
  currentDecision: "propose" | "hold" | "drop" | null;
  onDecision: (decision: "propose" | "hold" | "drop") => void;
  isLoading?: boolean;
}

/**
 * JobDecisionButtons Component
 *
 * 意思決定ボタン群
 * - Propose: 提案を進める → Phase 5へ
 * - Hold: 保留（後で検討）
 * - Drop: 却下（記録のみ）
 */
export function JobDecisionButtons({
  currentDecision,
  onDecision,
  isLoading = false,
}: JobDecisionButtonsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {/* Proposeボタン */}
        <Button
          onClick={() => onDecision("propose")}
          disabled={isLoading}
          variant={currentDecision === "propose" ? "default" : "outline"}
          className="flex flex-col items-center gap-2 h-auto py-4"
        >
          <CheckCircle2 className="h-6 w-6" />
          <span className="text-sm font-semibold">提案する</span>
        </Button>

        {/* Holdボタン */}
        <Button
          onClick={() => onDecision("hold")}
          disabled={isLoading}
          variant={currentDecision === "hold" ? "default" : "outline"}
          className="flex flex-col items-center gap-2 h-auto py-4"
        >
          <Clock className="h-6 w-6" />
          <span className="text-sm font-semibold">保留</span>
        </Button>

        {/* Dropボタン */}
        <Button
          onClick={() => onDecision("drop")}
          disabled={isLoading}
          variant={currentDecision === "drop" ? "destructive" : "outline"}
          className="flex flex-col items-center gap-2 h-auto py-4"
        >
          <XCircle className="h-6 w-6" />
          <span className="text-sm font-semibold">却下</span>
        </Button>
      </div>

      {/* 説明テキスト */}
      <div className="text-xs text-gray-600 space-y-1">
        <p>
          <strong>提案する:</strong> このジョブに対して提案を作成します
        </p>
        <p>
          <strong>保留:</strong> 後から検討するため、保留します
        </p>
        <p>
          <strong>却下:</strong> このジョブはスキップします
        </p>
      </div>

      {/* 現在の状態表示 */}
      {currentDecision && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm font-semibold text-blue-900">
            現在の状態:
            {currentDecision === "propose" && "提案予定"}
            {currentDecision === "hold" && "保留中"}
            {currentDecision === "drop" && "却下"}
          </p>
        </div>
      )}
    </div>
  );
}
