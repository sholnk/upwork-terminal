"use client";

import { Progress } from "@/components/ui/progress";
import {
  calculateScoring,
  getScoreLabel,
  getScorePercentage,
  getScoreColor,
} from "@/lib/job/scoring";
import { Badge } from "@/components/ui/badge";

interface JobScoreCardProps {
  scores: {
    fit: number;
    clarity: number;
    budgetRoi: number;
    clientQuality: number;
    winChance: number;
  };
}

const SCORE_LABELS: Record<
  keyof JobScoreCardProps["scores"],
  { label: string; description: string }
> = {
  fit: {
    label: "適合度",
    description: "あなたのスキルとジョブ要件のマッチ度",
  },
  clarity: {
    label: "要件の明確さ",
    description: "ジョブの説明が明確でわかりやすいか",
  },
  budgetRoi: {
    label: "予算対効果",
    description: "提示された予算は適正か",
  },
  clientQuality: {
    label: "クライアント品質",
    description: "クライアントの信頼度・過去の実績",
  },
  winChance: {
    label: "受注可能性",
    description: "このジョブを受注できる可能性",
  },
};

/**
 * JobScoreCard Component
 *
 * 5つのスコアを視覚的に表示
 * - プログレスバー
 * - 総合スコア
 * - 分類（Excellent/Good/Fair/Poor）
 */
export function JobScoreCard({ scores }: JobScoreCardProps) {
  const result = calculateScoring(scores);
  const totalScore = result.totalScore;

  const getClassificationColor = () => {
    switch (result.classification) {
      case "excellent":
        return "bg-green-50 border-green-200";
      case "good":
        return "bg-blue-50 border-blue-200";
      case "fair":
        return "bg-yellow-50 border-yellow-200";
      case "poor":
        return "bg-red-50 border-red-200";
    }
  };

  const getClassificationBadgeVariant = ():
    | "default"
    | "secondary"
    | "destructive"
    | "outline" => {
    switch (result.classification) {
      case "excellent":
        return "default";
      case "good":
        return "default";
      case "fair":
        return "secondary";
      case "poor":
        return "destructive";
    }
  };

  return (
    <div className="space-y-6">
      {/* 総合スコア */}
      <div className={`p-6 rounded-lg border ${getClassificationColor()}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">総合スコア</h3>
          <Badge variant={getClassificationBadgeVariant()}>
            {result.classification.toUpperCase()}
          </Badge>
        </div>

        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-gray-900">
              {totalScore}
            </span>
            <span className="text-xl text-gray-600">/100</span>
          </div>
          <Progress value={totalScore} className="h-2" />
        </div>

        <p className="text-sm text-gray-700">{result.description}</p>
      </div>

      {/* 個別スコア */}
      <div className="space-y-4">
        {(Object.keys(scores) as Array<keyof typeof scores>).map((key) => {
          const score = scores[key];
          const percentage = getScorePercentage(score);

          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {SCORE_LABELS[key].label}
                  </p>
                  <p className="text-xs text-gray-600">
                    {SCORE_LABELS[key].description}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <span className="text-lg font-bold text-gray-900">
                    {score}
                  </span>
                  <span className="text-xs text-gray-600">/20</span>
                </div>
              </div>
              <Progress value={percentage} className="h-1.5" />
              <p className="text-xs text-gray-600">
                {getScoreLabel(key, score)}
              </p>
            </div>
          );
        })}
      </div>

      {/* 推奨アクション */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm font-semibold text-blue-900 mb-1">
          推奨アクション
        </p>
        <p className="text-sm text-blue-800">{result.recommendation}</p>
      </div>
    </div>
  );
}
