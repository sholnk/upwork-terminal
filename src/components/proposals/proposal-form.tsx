"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ProposalFormProps {
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  onSuccess?: () => void;
}

/**
 * ProposalForm Component
 *
 * 提案生成フォーム
 * - テンプレートタイプ選択（A/B）
 * - 必要な情報入力
 * - Claude APIで提案生成
 */
export function ProposalForm({
  jobId,
  jobTitle,
  jobDescription,
  onSuccess,
}: ProposalFormProps) {
  const [type, setType] = useState<"A" | "B">("A");
  const [formData, setFormData] = useState({
    summaryJa: "",
    approachJa: "",
    timelineJa: "",
    rateJa: "",
    auditScopeJa: "",
    auditTimelineJa: "",
    buildScopeJa: "",
    buildTimelineJa: "",
  });

  const { mutate: generateProposal, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          jobTitle,
          jobDescription,
          type,
          ...formData,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate proposal");
      return res.json();
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = () => {
    generateProposal();
  };

  return (
    <div className="space-y-6">
      {/* Template Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">テンプレートタイプ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Type A */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                type === "A"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setType("A")}
            >
              <h3 className="font-bold text-sm mb-2">A: 短納期デリバリー</h3>
              <p className="text-xs text-gray-600">
                シンプルで実装が早いプロジェクト向け
              </p>
            </div>

            {/* Type B */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                type === "B"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setType("B")}
            >
              <h3 className="font-bold text-sm mb-2">B: 監査→実装</h3>
              <p className="text-xs text-gray-600">
                複雑で要件定義が必要なプロジェクト向け
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">提案詳細</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {type === "A" ? (
            <>
              {/* Type A Fields */}
              <div>
                <Label>提案概要</Label>
                <Textarea
                  value={formData.summaryJa}
                  onChange={(e) => handleInputChange("summaryJa", e.target.value)}
                  placeholder="この案件に対する提案の要約（1-2文）"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>実装方法</Label>
                <Textarea
                  value={formData.approachJa}
                  onChange={(e) => handleInputChange("approachJa", e.target.value)}
                  placeholder="あなたのアプローチ方法"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>期間</Label>
                  <Input
                    value={formData.timelineJa}
                    onChange={(e) => handleInputChange("timelineJa", e.target.value)}
                    placeholder="例: 2週間"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>価格</Label>
                  <Input
                    value={formData.rateJa}
                    onChange={(e) => handleInputChange("rateJa", e.target.value)}
                    placeholder="例: $1,000"
                    className="mt-1"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Type B Fields */}
              <div>
                <Label>監査スコープ</Label>
                <Textarea
                  value={formData.auditScopeJa}
                  onChange={(e) => handleInputChange("auditScopeJa", e.target.value)}
                  placeholder="監査で確認する内容"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>監査期間</Label>
                  <Input
                    value={formData.auditTimelineJa}
                    onChange={(e) => handleInputChange("auditTimelineJa", e.target.value)}
                    placeholder="例: 1週間"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>実装スコープ</Label>
                <Textarea
                  value={formData.buildScopeJa}
                  onChange={(e) => handleInputChange("buildScopeJa", e.target.value)}
                  placeholder="監査後に実装する内容"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>実装期間</Label>
                  <Input
                    value={formData.buildTimelineJa}
                    onChange={(e) => handleInputChange("buildTimelineJa", e.target.value)}
                    placeholder="例: 2週間"
                    className="mt-1"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleGenerate}
          disabled={isPending}
          className="flex-1"
          size="lg"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            "提案を生成"
          )}
        </Button>
      </div>

      <p className="text-xs text-gray-600">
        Claudeがあなたの入力をもとに、プロフェッショナルな提案を日本語・英語で生成します。
      </p>
    </div>
  );
}
