"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface ProposalDisplayProps {
  proposal: {
    type: "A" | "B";
    textJa: string;
    textEn: string;
    summary: string;
    estimatedWords: number;
    generatedAt: string;
  };
}

/**
 * ProposalDisplay Component
 *
 * 生成された提案を表示
 * - 日本語・英語タブ
 * - コピー機能
 */
export function ProposalDisplay({ proposal }: ProposalDisplayProps) {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">生成された提案</CardTitle>
            <Badge className="mt-2" variant={proposal.type === "A" ? "default" : "secondary"}>
              {proposal.type === "A" ? "テンプレートA: 短納期デリバリー" : "テンプレートB: 監査→実装"}
            </Badge>
          </div>
          <p className="text-xs text-gray-600">
            {new Date(proposal.generatedAt).toLocaleString("ja-JP")}
          </p>
        </div>
        <p className="text-sm text-gray-600 mt-3">{proposal.summary}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="ja" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ja">日本語</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>

          {/* Japanese Tab */}
          <TabsContent value="ja" className="mt-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600">
                  {proposal.estimatedWords}単語
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(proposal.textJa)}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  コピー
                </Button>
              </div>
              <p className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                {proposal.textJa}
              </p>
            </div>
          </TabsContent>

          {/* English Tab */}
          <TabsContent value="en" className="mt-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600">
                  {Math.round(proposal.estimatedWords / 1.2)}words
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(proposal.textEn)}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
              <p className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                {proposal.textEn}
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button className="flex-1" variant="default">
            この提案を保存
          </Button>
          <Button className="flex-1" variant="outline">
            提案を修正して再生成
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
