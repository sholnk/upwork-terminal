"use client";

import { Textarea } from "@/components/ui/textarea";

interface JobMemoEditorProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * JobMemoEditor Component
 *
 * メモ入力エリア
 * - マークダウン形式対応想定
 * - リアルタイム保存（onChange経由）
 */
export function JobMemoEditor({ value, onChange }: JobMemoEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`ジョブに関するメモを記入してください...

例:
- クライアントの過去の実績
- プロジェクトの特殊な要件
- 懸念点や質問事項
- 提案時の戦略メモ
`}
      className="min-h-32 text-sm font-mono"
    />
  );
}
