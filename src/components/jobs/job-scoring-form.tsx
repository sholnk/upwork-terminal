"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getScoreLabel } from "@/lib/job/scoring";

type ScoresType = {
  fit: number;
  clarity: number;
  budgetRoi: number;
  clientQuality: number;
  winChance: number;
};

interface JobScoringFormProps {
  scores: ScoresType;
  onScoresChange: (scores: ScoresType) => void;
  isLoading?: boolean;
}

const SCORE_ITEMS = [
  {
    key: "fit" as const,
    label: "適合度",
    description: "あなたのスキル・経験とジョブ要件のマッチ度（0=不適切, 20=完璧なマッチ）",
  },
  {
    key: "clarity" as const,
    label: "要件の明確さ",
    description: "ジョブの説明が明確で理解しやすいか（0=不明確, 20=非常に明確）",
  },
  {
    key: "budgetRoi" as const,
    label: "予算対効果",
    description: "提示される予算が適正か（0=悪い, 20=優秀）",
  },
  {
    key: "clientQuality" as const,
    label: "クライアント品質",
    description: "クライアントの信頼度・実績・ペイメント確認（0=低い, 20=優秀）",
  },
  {
    key: "winChance" as const,
    label: "受注可能性",
    description: "このジョブを受注できる可能性（0=非常に低い, 20=確実）",
  },
];

/**
 * JobScoringForm Component
 *
 * 5つのスコアをスライダーで入力
 * - リアルタイムで値を更新
 * - ラベルと説明付き
 */
export function JobScoringForm({
  scores,
  onScoresChange,
  isLoading = false,
}: JobScoringFormProps) {
  const handleScoreChange = (key: keyof typeof scores, value: number[]) => {
    const newScores = {
      ...scores,
      [key]: value[0],
    };
    onScoresChange(newScores);
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base">スコア入力</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {SCORE_ITEMS.map(({ key, label, description }) => (
          <div key={key} className="space-y-3">
            <div>
              <Label className="text-sm font-semibold text-gray-900">
                {label}
              </Label>
              <p className="text-xs text-gray-600 mt-1">{description}</p>
            </div>

            <div className="flex items-center gap-4">
              <Slider
                min={0}
                max={20}
                step={1}
                value={[scores[key]]}
                onValueChange={(value) => handleScoreChange(key, value)}
                disabled={isLoading}
                className="flex-1"
              />
              <div className="text-right min-w-16">
                <span className="text-lg font-bold text-gray-900">
                  {scores[key]}
                </span>
                <span className="text-xs text-gray-600 ml-1">/20</span>
              </div>
            </div>

            <p className="text-xs text-gray-600">
              {getScoreLabel(key, scores[key])}
            </p>
          </div>
        ))}

        {/* 補足記入欄（今後の拡張用） */}
        <div className="pt-4 space-y-2">
          <Label className="text-sm font-semibold text-gray-900">
            補足（オプション）
          </Label>
          <Textarea
            placeholder="スコアの根拠や判断理由を記入してください..."
            className="h-24 text-sm"
            disabled={isLoading}
          />
        </div>

        {isLoading && (
          <div className="text-center text-sm text-gray-500">
            保存中...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
