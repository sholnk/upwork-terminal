import type { JobScoreItem } from "@/lib/schemas/job-analysis";

/**
 * Job スコアリング計算ロジック
 */

export interface ScoringResult {
  totalScore: number;
  classification: "excellent" | "good" | "fair" | "poor";
  description: string;
  recommendation: string;
}

/**
 * スコアを計算して分類
 *
 * 区分:
 * - 80-100: Excellent (すぐに提案)
 * - 60-79: Good (提案の価値あり)
 * - 40-59: Fair (慎重に検討)
 * - 0-39: Poor (スキップ推奨)
 */
export function calculateScoring(scores: JobScoreItem): ScoringResult {
  const totalScore =
    scores.fit +
    scores.clarity +
    scores.budgetRoi +
    scores.clientQuality +
    scores.winChance;

  let classification: "excellent" | "good" | "fair" | "poor";
  let description: string;
  let recommendation: string;

  if (totalScore >= 80) {
    classification = "excellent";
    description =
      "このジョブは高いポテンシャルを持っており、即座に提案することをお勧めします。";
    recommendation = "✅ 推奨: すぐに提案を進める";
  } else if (totalScore >= 60) {
    classification = "good";
    description =
      "このジョブは良い機会です。あなたのスキルと要件がよく合致しています。";
    recommendation = "👍 推奨: 提案を進める価値あり";
  } else if (totalScore >= 40) {
    classification = "fair";
    description =
      "このジョブには改善の余地があります。慎重に検討してからの決定をお勧めします。";
    recommendation = "⚠️ 注意: 詳細を確認してから判断";
  } else {
    classification = "poor";
    description =
      "このジョブはあなたのニーズや能力と十分に合致していません。スキップを推奨します。";
    recommendation = "❌ 推奨: スキップ";
  }

  return {
    totalScore,
    classification,
    description,
    recommendation,
  };
}

/**
 * スコアアイテムの詳細説明を取得
 */
export function getScoreLabel(
  item: "fit" | "clarity" | "budgetRoi" | "clientQuality" | "winChance",
  value: number
): string {
  const labels: Record<string, string[]> = {
    fit: [
      "不適切",
      "かなり低い",
      "低い",
      "やや低い",
      "中程度",
      "適合",
    ],
    clarity: [
      "非常に不明確",
      "不明確",
      "やや不明確",
      "中程度",
      "明確",
      "非常に明確",
    ],
    budgetRoi: [
      "悪い",
      "低い",
      "やや低い",
      "中程度",
      "良い",
      "優秀",
    ],
    clientQuality: [
      "低い",
      "やや低い",
      "中程度",
      "良い",
      "非常に良い",
      "優秀",
    ],
    winChance: [
      "非常に低い",
      "低い",
      "やや低い",
      "中程度",
      "高い",
      "非常に高い",
    ],
  };

  const itemLabels = labels[item];
  const index = Math.floor(value / 4); // 0-20 を 0-5 に変換
  return itemLabels?.[Math.min(index, itemLabels.length - 1)] || "未評価";
}

/**
 * スコアの視覚的表現（%）
 */
export function getScorePercentage(score: number): number {
  return (score / 20) * 100;
}

/**
 * スコアの色分け
 */
export function getScoreColor(score: number): string {
  if (score >= 16) return "green"; // 16-20
  if (score >= 12) return "blue"; // 12-15
  if (score >= 8) return "yellow"; // 8-11
  if (score >= 4) return "orange"; // 4-7
  return "red"; // 0-3
}

/**
 * スコアリング結果のサマリーを生成
 */
export function generateScoringSummary(scores: JobScoreItem): string {
  const result = calculateScoring(scores);

  return `
【スコアサマリー】
- 総合スコア: ${result.totalScore}/100 (${result.classification})
- 適合度: ${scores.fit}/20 (${getScoreLabel("fit", scores.fit)})
- 要件の明確さ: ${scores.clarity}/20 (${getScoreLabel("clarity", scores.clarity)})
- 予算対効果: ${scores.budgetRoi}/20 (${getScoreLabel("budgetRoi", scores.budgetRoi)})
- クライアント品質: ${scores.clientQuality}/20 (${getScoreLabel("clientQuality", scores.clientQuality)})
- 受注可能性: ${scores.winChance}/20 (${getScoreLabel("winChance", scores.winChance)})

【判定】
${result.description}

【推奨アクション】
${result.recommendation}
  `.trim();
}
