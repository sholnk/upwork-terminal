"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { SophiaOutput } from "@/lib/sophia/schemas";

interface SophiaReportDisplayProps {
  report: {
    id: string;
    targetType: string;
    qMetaJson: SophiaOutput["q_meta"];
    fUltimateJson: SophiaOutput["f_ultimate"];
    artifactsJson: SophiaOutput["artifacts"];
    isValid: boolean;
    createdAt: Date;
  };
}

/**
 * SophiaReportDisplay Component
 *
 * Sophia分析結果を表示
 * - Q_META: intention, misalignment, feedback等
 * - F_ULTIMATE: awareness, classification, navigation等
 * - Artifacts: 生成されたテキスト
 */
export function SophiaReportDisplay({ report }: SophiaReportDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const qMeta = report.qMetaJson;
  const fUltimate = report.fUltimateJson;
  const artifacts = report.artifactsJson;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="cursor-pointer pb-3" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Sophia分析</CardTitle>
            {!report.isValid && (
              <Badge variant="destructive">検証失敗</Badge>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {new Date(report.createdAt).toLocaleString("ja-JP")}
        </p>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <Tabs defaultValue="q_meta" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="q_meta">Q_META</TabsTrigger>
              <TabsTrigger value="f_ultimate">F_ULTIMATE</TabsTrigger>
              <TabsTrigger value="artifacts">成果物</TabsTrigger>
            </TabsList>

            {/* Q_META タブ */}
            <TabsContent value="q_meta" className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  意図
                </p>
                <p className="text-sm text-gray-900">{qMeta.intention}</p>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  ズレの可能性
                </p>
                <p className="text-sm text-gray-900">{qMeta.misalignment}</p>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  潜在フレーム
                </p>
                <p className="text-sm text-gray-900">{qMeta.latent_frame}</p>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  前提の再確認
                </p>
                <p className="text-sm text-gray-900">
                  {qMeta.premise_reflection}
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  改善フィードバック
                </p>
                <p className="text-sm text-gray-900">{qMeta.feedback}</p>
              </div>

              <Separator />

              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <p className="text-xs font-semibold text-yellow-900 mb-2">
                  次に答えるべき1問
                </p>
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  {qMeta.socratic_trigger.question_ja}
                </p>
                <p className="text-xs text-yellow-800 mb-2">
                  <strong>理由:</strong>{" "}
                  {qMeta.socratic_trigger.why_this_question}
                </p>
                <p className="text-xs text-yellow-800">
                  <strong>回答ヒント:</strong>{" "}
                  {qMeta.socratic_trigger.answer_format_hint}
                </p>
              </div>
            </TabsContent>

            {/* F_ULTIMATE タブ */}
            <TabsContent value="f_ultimate" className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  気づき
                </p>
                <p className="text-sm text-gray-900">{fUltimate.awareness}</p>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  状況分類
                </p>
                <p className="text-sm text-gray-900">
                  {fUltimate.classification}
                </p>
              </div>

              <Separator />

              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="text-xs font-semibold text-green-900 mb-2">
                  ナビゲーション
                </p>
                <p className="text-sm font-semibold text-green-900 mb-2">
                  次のステップ: {fUltimate.navigation.next_step}
                </p>
                <div className="mb-2">
                  <p className="text-xs font-semibold text-green-900">選肢:</p>
                  <ul className="text-sm text-green-900 list-disc list-inside ml-1">
                    {fUltimate.navigation.options.map((opt, i) => (
                      <li key={i}>{opt}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-green-900">
                  <strong>推奨:</strong> {fUltimate.navigation.recommended}
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  検証
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold">前提:</p>
                    <ul className="list-disc list-inside ml-1 text-gray-900">
                      {fUltimate.verification.assumptions.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">リスク:</p>
                    <ul className="list-disc list-inside ml-1 text-gray-900">
                      {fUltimate.verification.risks.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">確認事項:</p>
                    <ul className="list-disc list-inside ml-1 text-gray-900">
                      {fUltimate.verification.what_to_confirm_next.map(
                        (c, i) => (
                          <li key={i}>{c}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  再定義
                </p>
                <p className="text-sm text-gray-900">{fUltimate.redefine}</p>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  メタチェック
                </p>
                <p className="text-sm text-gray-900">{fUltimate.meta_check}</p>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  更新・推進
                </p>
                <div className="text-sm">
                  <p className="text-gray-900">
                    <strong>メトリクス:</strong>
                  </p>
                  <ul className="list-disc list-inside ml-1 text-gray-900">
                    {fUltimate.r_update.metrics.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                  <p className="text-gray-900 mt-2">
                    <strong>頻度:</strong> {fUltimate.r_update.cadence}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Artifacts タブ */}
            <TabsContent value="artifacts" className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  日本語要約
                </p>
                <p className="text-sm text-gray-900">
                  {artifacts.summary_ja}
                </p>
              </div>

              {artifacts.profile_pitch_ja && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      プロフィール提案（日本語）
                    </p>
                    <p className="text-sm text-gray-900">
                      {artifacts.profile_pitch_ja}
                    </p>
                  </div>
                </>
              )}

              {artifacts.job_analysis_ja && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      案件分析（日本語）
                    </p>
                    <p className="text-sm text-gray-900">
                      {artifacts.job_analysis_ja}
                    </p>
                  </div>
                </>
              )}

              {artifacts.proposal_draft_en && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      提案下書き（英語）
                    </p>
                    <p className="text-sm text-gray-900">
                      {artifacts.proposal_draft_en}
                    </p>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}
