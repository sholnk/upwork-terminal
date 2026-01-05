# Phase 4-6 詳細サブタスク分割リプラン

**完成状況**: Phase 0-3 完了 ✅
- Prismaスキーマ & マイグレーション
- Inbox Ingest & API (5エンドポイント)
- Inbox UI (2ペイン)
- Sophia分析エンジン & API

**残り**: Phase 4-6 (約2-3週間の実装)

---

## Phase 4: Job分析UI & Sophia統合

### 4.1 スコアリングシステム実装
**ゴール**: 案件に対して数値ベースの判断を支援

**サブタスク**:
- [ ] 4.1.1 スコアリングZodスキーマ作成
  - fit (適合度: 0-20)
  - clarity (要件の明確さ: 0-20)
  - budgetRoi (予算対効果: 0-20)
  - clientQuality (クライアント品質: 0-20)
  - winChance (受注可能性: 0-20)
  - ファイル: `src/lib/schemas/job-analysis.ts`

- [ ] 4.1.2 スコアリング計算ロジック
  - 各スコア計算式の実装
  - 合計スコア (0-100)
  - スコア区分別ラベリング (Excellent/Good/Fair/Poor)
  - ファイル: `src/lib/job/scoring.ts`

- [ ] 4.1.3 Job.analysisJson構造設計
  - スコア各項目の保存形式
  - スコア計算の履歴追跡
  - Prismaへの保存・取得

**成果物**: Job分析のスコアリング基盤

---

### 4.2 Job分析詳細ページ実装
**ゴール**: Jobをクリックするとスコアと分析が見える

**サブタスク**:
- [ ] 4.2.1 ページレイアウト作成
  - ファイル: `src/app/(dashboard)/jobs/[id]/analyze/page.tsx`
  - ヘッダー: Job title + 基本情報
  - 左パネル: Job詳細（説明、予算、スキル等）
  - 右パネル: スコアリング & 分析UI

- [ ] 4.2.2 Jobスコアカード表示
  - コンポーネント: `src/components/jobs/job-score-card.tsx`
  - 5つのスコア表示（プログレスバー）
  - 総合スコア表示
  - スコア根拠表示

- [ ] 4.2.3 スコア入力フォーム
  - コンポーネント: `src/components/jobs/job-score-form.tsx`
  - 各スコアのスライダー入力
  - 根拠テキスト入力フィールド
  - バリデーション (0-20)

- [ ] 4.2.4 判断ボタン（propose/hold/drop）
  - コンポーネント: `src/components/jobs/job-decision-buttons.tsx`
  - Propose: 提案を進める（Phase 5へ）
  - Hold: 保留（後で検討）
  - Drop: 却下（記録のみ）

**成果物**: Job詳細ページ + スコアリングUI

---

### 4.3 Sophia分析実行UI統合
**ゴール**: Job分析ページからSophia分析を実行

**サブタスク**:
- [ ] 4.3.1 Sophia実行ボタン & 状態管理
  - コンポーネント: `src/components/jobs/job-sophia-button.tsx`
  - 「Sophia分析を実行」ボタン
  - ローディング状態
  - エラー時の再試行

- [ ] 4.3.2 Sophia分析結果表示パネル
  - コンポーネント: `src/components/sophia/sophia-report-display.tsx`
  - Q_META表示: intention, misalignment, feedback等
  - F_ULTIMATE表示: awareness, navigation, verification等
  - Artifacts表示: job_analysis_ja等

- [ ] 4.3.3 Socratic Triggerの表示 & 回答フロー
  - コンポーネント: `src/components/sophia/socratic-trigger.tsx`
  - 「次に答えるべき1問」表示
  - テキスト入力フィールド
  - 「再分析」ボタン（userAnswerJa付きで再実行）

- [ ] 4.3.4 Sophia分析履歴表示
  - コンポーネント: `src/components/sophia/sophia-history.tsx`
  - 過去の分析を時系列で表示
  - 各分析のタイムスタンプ
  - クリックで詳細表示

**成果物**: Job分析ページからSophia分析が可能に

---

### 4.4 Jobメモ・タグ機能
**ゴール**: Job分析の備考と分類を記録

**サブタスク**:
- [ ] 4.4.1 メモ入力フォーム
  - コンポーネント: `src/components/jobs/job-memo-editor.tsx`
  - テキストエリア（自動保存）
  - マークダウン簡易プレビュー
  - API: `PATCH /api/jobs/:id` で notes フィールド更新

- [ ] 4.4.2 タグ管理UI
  - コンポーネント: `src/components/jobs/job-tag-editor.tsx`
  - タグ追加・削除ボタン
  - 候補タグのオートコンプリート
  - API: `PATCH /api/jobs/:id` で tags フィールド更新

- [ ] 4.4.3 API実装
  - `PATCH /api/jobs/:id` - メモ・タグ更新
  - ファイル: `src/app/api/jobs/[id]/route.ts`

**成果物**: Job分析の記録・分類機能

---

### 4.5 API実装 (Job周辺)
**サブタスク**:
- [ ] 4.5.1 `GET /api/jobs/:id` - Job詳細取得
  - 関連情報（分析、メモ、タグ）を含める

- [ ] 4.5.2 `PATCH /api/jobs/:id` - Job更新
  - notes, tags, rating, analysisJson対応

- [ ] 4.5.3 `GET /api/jobs/:id/sophia-reports` - 分析履歴取得
  - 時系列で複数の分析レポートを返す

**成果物**: Job分析用API完成

---

## Phase 5: A/Bテンプレ提案生成 & UI

### 5.1 提案テンプレートシステム設計
**ゴール**: A/Bテンプレで提案下書きを生成

**サブタスク**:
- [ ] 5.1.1 テンプレート定義
  - テンプレートA: 短納期デリバリー型（5-10日）
  - テンプレートB: 監査→改善→構築（3段階、3-6週間）
  - 各テンプレートのセクション構成を定義
  - ファイル: `src/lib/schemas/proposal-template.ts`

- [ ] 5.1.2 テンプレート入力スキーマ
  - 共通フィールド: jobId, templateType, problemSummaryJa
  - テンプレートA: deliverablesJa[], stepsJa[], portfolioUrl
  - テンプレートB: auditItemsJa[], phaseAJa, phaseBJa, portfolioUrl
  - 共通: proofLineJa, singleQuestionJa, connectsUsed
  - ファイル: `src/lib/schemas/proposal-draft.ts`

**成果物**: テンプレート仕様書

---

### 5.2 提案フォーム実装（フロントエンド）
**ゴール**: 日本語で提案内容を入力

**サブタスク**:
- [ ] 5.2.1 提案テンプレート選択コンポーネント
  - コンポーネント: `src/components/proposals/proposal-template-selector.tsx`
  - テンプレートA・Bの説明
  - ビジュアル比較
  - 選択時に対応フォーム表示

- [ ] 5.2.2 テンプレートA用フォーム
  - コンポーネント: `src/components/proposals/proposal-form-a.tsx`
  - 問題要約
  - デリバリー予定物（配列）
  - 実施ステップ（配列）
  - ポートフォリオURL
  - 実績説明（proofLine）
  - クライアント確認質問

- [ ] 5.2.3 テンプレートB用フォーム
  - コンポーネント: `src/components/proposals/proposal-form-b.tsx`
  - 監査項目（配列）
  - フェーズA説明
  - フェーズB説明
  - ポートフォリオURL
  - 実績説明（proofLine）
  - クライアント確認質問

- [ ] 5.2.4 共通フォーム要素
  - コンポーネント: `src/components/proposals/proposal-form-common.tsx`
  - コネクト数入力（デフォルト6-10）
  - 下書き保存ボタン
  - バリデーション表示

**成果物**: 日本語提案入力フロントエンド完成

---

### 5.3 提案生成API（日本語→英語）
**ゴール**: Claudeで日本語を英語カバーレターに変換

**サブタスク**:
- [ ] 5.3.1 提案生成プロンプト設計
  - テンプレートAのプロンプト
  - テンプレートBのプロンプト
  - 英語品質ガイド（プロフェッショナル、簡潔）
  - ファイル: `src/lib/proposal/prompt.ts`

- [ ] 5.3.2 Claudeプロバイダ統合
  - 日本語入力を英語に変換
  - モデル: claude-3-5-sonnet-20241022
  - 出力検証（最小文字数、最大文字数）
  - ファイル: `src/lib/proposal/generator.ts`

- [ ] 5.3.3 提案生成API実装
  - ファイル: `src/app/api/proposals/generate/route.ts`
  - リクエスト: テンプレートA/Bの日本語入力
  - レスポンス: 英語カバーレター
  - バリデーション + エラーハンドリング

**成果物**: 日本語→英語変換API

---

### 5.4 提案ページ実装
**ゴール**: 提案作成〜プレビュー〜保存

**サブタスク**:
- [ ] 5.4.1 提案作成ページレイアウト
  - ファイル: `src/app/(dashboard)/proposals/new/page.tsx`
  - ステップ表示（選択 → 入力 → プレビュー）
  - 左: フォーム、右: プレビュー

- [ ] 5.4.2 提案プレビューコンポーネント
  - コンポーネント: `src/components/proposals/proposal-preview.tsx`
  - 日本語版表示
  - 英語版（カバーレター）表示
  - コネクト数確認
  - 「UpWorkにコピー」ボタン（クリップボード）

- [ ] 5.4.3 提案保存UI
  - コンポーネント: `src/components/proposals/proposal-actions.tsx`
  - 「下書き保存」ボタン（ステータス: draft）
  - 「提案実行済み」マーク用（ステータス: submitted、手動）
  - 下書き一覧への移動

**成果物**: 完全な提案作成フロー

---

### 5.5 提案一覧 & 統計
**ゴール**: 提案履歴と成功率を可視化

**サブタスク**:
- [ ] 5.5.1 提案一覧ページ
  - ファイル: `src/app/(dashboard)/proposals/page.tsx`
  - テーブル: Job名、ステータス、日付、コネクト消費
  - フィルタ: status (draft/submitted/accepted/declined)
  - ソート: 作成日、ステータス

- [ ] 5.5.2 提案統計ダッシュボード
  - コンポーネント: `src/components/proposals/proposal-stats.tsx`
  - 総提案数
  - 返信率 (=clientViewed / submittedProposals)
  - 受注率 (=accepted / submitted)
  - コネクト消費総数
  - 平均コネクト数

- [ ] 5.5.3 提案詳細ページ
  - ファイル: `src/app/(dashboard)/proposals/[id]/page.tsx`
  - 提案内容（A/B別表示）
  - クライアント返信状況
  - 関連Job情報
  - 編集ボタン（draft状態のみ）

**成果物**: 提案管理画面完成

---

### 5.6 API実装 (Proposal周辺)
**サブタスク**:
- [ ] 5.6.1 `POST /api/proposals` - 提案作成
  - リクエスト: template (A/B), 各フィールド、jobId
  - レスポンス: proposalId, status: 'draft'

- [ ] 5.6.2 `PATCH /api/proposals/:id` - 提案更新
  - 下書き修正（status: draft）
  - ステータス更新（submitted etc）

- [ ] 5.6.3 `GET /api/proposals` - 一覧取得
  - クエリ: status, jobId でフィルタ
  - ソート対応

- [ ] 5.6.4 `GET /api/proposals/:id` - 詳細取得
  - 完全な提案内容 + 関連Job情報

**成果物**: 提案管理API完成

---

## Phase 6: 実運用ルーティング & Polish

### 6.1 ナビゲーション & 導線設計
**ゴール**: Inbox → Job → 提案 の一本道を整備

**サブタスク**:
- [ ] 6.1.1 メインナビゲーション実装
  - コンポーネント: `src/components/layout/main-nav.tsx`
  - ダッシュボード、Inbox、Jobs、Proposals
  - ステータス表示（新着Inbox数、ドラフト提案数）

- [ ] 6.1.2 パンくずナビゲーション
  - コンポーネント: `src/components/layout/breadcrumb.tsx`
  - Inbox → Job → 提案 の流れを表示
  - 戻る・進むボタン

- [ ] 6.1.3 グローバル検索機能
  - コンポーネント: `src/components/layout/global-search.tsx`
  - Job検索、クライアント検索
  - API: `GET /api/search` (全文検索)

**成果物**: 統一されたナビゲーション

---

### 6.2 ダッシュボード（ホーム）実装
**ゴール**: 実運用の起点、全体像の把握

**サブタスク**:
- [ ] 6.2.1 ダッシュボードレイアウト
  - ファイル: `src/app/(dashboard)/page.tsx`
  - 今日のタスク表示
  - 統計サマリー

- [ ] 6.2.2 タスクカード群
  - コンポーネント: `src/components/dashboard/task-cards.tsx`
  - 新着Inbox: N件
  - 分析待ちJob: N件
  - ドラフト提案: N件
  - 返信待ちProposal: N件

- [ ] 6.2.3 最近の活動フィード
  - コンポーネント: `src/components/dashboard/activity-feed.tsx`
  - InboxMessage作成
  - Job分析完了
  - Proposal作成
  - 時系列表示

- [ ] 6.2.4 統計サマリー
  - コンポーネント: `src/components/dashboard/stats-summary.tsx`
  - 月間コネクト消費
  - 月間提案数
  - 返信率（直近）

**成果物**: ダッシュボード完成

---

### 6.3 エラーハンドリング & 例外処理
**ゴール**: 堅牢でユーザーフレンドリーなエラー処理

**サブタスク**:
- [ ] 6.3.1 エラーバウンダリコンポーネント
  - コンポーネント: `src/components/error-boundary.tsx`
  - 予期しないエラー時のフォールバックUI
  - リトライボタン

- [ ] 6.3.2 API層のエラーハンドリング
  - `src/lib/api-client.ts` - fetch wrapper
  - 401 (Unauthorized)
  - 429 (Rate Limited)
  - 500+ (Server Error)
  - 各ステータスコード別の対応

- [ ] 6.3.3 フォーム検証エラー表示
  - 全フォームで統一されたエラー表示
  - インライン検証フィードバック

- [ ] 6.3.4 Sophia分析失敗時の処理
  - リトライ提案
  - 入力内容の確認促し
  - ログ記録

**成果物**: エラー処理の統一

---

### 6.4 ローディング & スケルトン状態
**ゴール**: 読み込み中の良好なUX

**サブタスク**:
- [ ] 6.4.1 スケルトンコンポーネント群
  - `src/components/ui/skeleton-*`
  - InboxList向け
  - Job詳細向け
  - Sophia分析向け

- [ ] 6.4.2 ローディング表示
  - 全API呼び出しでローディング状態管理
  - ページ遷移時のプログレスバー
  - ボタン無効化

**成果物**: 統一されたローディングUX

---

### 6.5 アクセシビリティ & 国際化対応
**サブタスク**:
- [ ] 6.5.1 アクセシビリティ監査
  - キーボードナビゲーション確認
  - スクリーンリーダー対応
  - コントラスト比確認

- [ ] 6.5.2 言語対応（日本語メイン）
  - 全テキストを i18n 対応
  - ファイル: `src/lib/i18n/ja.json`
  - 将来の英語対応を想定

**成果物**: アクセシビリティ対応

---

### 6.6 テスト & QA
**ゴール**: 本番デプロイ前の品質保証

**サブタスク**:
- [ ] 6.6.1 ユニットテスト
  - Zod スキーマのテスト
  - 計算ロジック（スコアリング等）
  - ファイル: `src/__tests__/lib/*`

- [ ] 6.6.2 統合テスト
  - API エンドポイント
  - データベース操作
  - ファイル: `src/__tests__/api/*`

- [ ] 6.6.3 E2Eテスト
  - Playwrite で主要フロー
  - Inbox → Job → 提案の完全フロー
  - ファイル: `tests/e2e/*`

- [ ] 6.6.4 マニュアル QA チェックリスト
  - 全ページの表示確認
  - リンク・ボタン動作確認
  - エラーケースの確認
  - 日本語テキスト確認

**成果物**: テストスイート & 検証レポート

---

### 6.7 デプロイ & 本番準備
**ゴール**: Vercel へ安全にデプロイ

**サブタスク**:
- [ ] 6.7.1 環境変数設定
  - .env.local → .env.production
  - 本番DB接続文字列設定
  - API キー管理

- [ ] 6.7.2 Vercel デプロイ設定
  - ファイル: `vercel.json`
  - ビルドコマンド: `next build`
  - スタートコマンド: `next start`

- [ ] 6.7.3 CI/CD パイプライン
  - ファイル: `.github/workflows/deploy.yml`
  - push to main → test → deploy to Vercel

- [ ] 6.7.4 本番DB初期化
  - Prisma migrate を本番環境で実行
  - データベースバックアップ

**成果物**: デプロイ完了

---

### 6.8 監視 & ロギング
**サブタスク**:
- [ ] 6.8.1 エラーログシステム
  - Sentry or LogRocket 統合
  - 本番エラーの自動通知

- [ ] 6.8.2 分析・メトリクス
  - Vercel Analytics
  - API レスポンスタイム監視

**成果物**: 本番監視体制

---

### 6.9 ドキュメント & ユーザーガイド
**サブタスク**:
- [ ] 6.9.1 API ドキュメント
  - 全エンドポイント一覧
  - リクエスト・レスポンス例
  - エラーコード説明

- [ ] 6.9.2 ユーザーガイド
  - 初期セットアップ手順
  - 各機能の使い方
  - トラブルシューティング

- [ ] 6.9.3 デベロッパードキュメント
  - アーキテクチャ図
  - ディレクトリ構造説明
  - 開発環境セットアップ

**成果物**: 完全なドキュメント

---

## 📊 実装順序と依存関係

```
Phase 4 (3-4日)
├── 4.1 スコアリングシステム
├── 4.2 Job詳細ページ
├── 4.3 Sophia統合
├── 4.4 メモ・タグ
└── 4.5 API実装

↓

Phase 5 (4-5日)
├── 5.1 テンプレート設計
├── 5.2 提案フォーム
├── 5.3 日本語→英語生成API
├── 5.4 提案ページ
├── 5.5 提案一覧・統計
└── 5.6 API実装

↓

Phase 6 (2-3日)
├── 6.1 ナビゲーション
├── 6.2 ダッシュボード
├── 6.3 エラーハンドリング
├── 6.4 ローディング状態
├── 6.5 アクセシビリティ
├── 6.6 テスト
├── 6.7 デプロイ
├── 6.8 監視
└── 6.9 ドキュメント
```

---

## ✅ 実装チェックリスト

### Phase 4 完了判定
- [ ] Jobスコアリング（5項目）が計算できる
- [ ] Job詳細ページで視覚的にスコアが見える
- [ ] Job分析ページからSophia分析を実行できる
- [ ] Sophia結果（Q_META/F_ULTIMATE/Artifacts）が表示される
- [ ] Socratic Trigger に回答できる
- [ ] メモ・タグが保存される

### Phase 5 完了判定
- [ ] テンプレートA・Bで提案フォームが出る
- [ ] 日本語入力→英語カバーレター生成が動く
- [ ] プレビューが正しく表示される
- [ ] 提案が保存される
- [ ] 提案一覧・統計が見える

### Phase 6 完了判定
- [ ] Inbox → Job → 提案 の導線が完璧
- [ ] ダッシュボードに全体統計が見える
- [ ] エラーメッセージが親切
- [ ] ローディング中のUXが良い
- [ ] テストが 80% 以上のカバレッジ
- [ ] Vercel へデプロイ完了
- [ ] ドキュメント完成

---

## 🎯 優先順位

### 最優先 (初日)
- 4.1, 4.2, 4.3 (Job分析 + Sophia統合)

### 高優先 (2-3日目)
- 4.4, 4.5 (メモ・タグ・API)
- 5.1, 5.2, 5.3 (テンプレート・フォーム・生成API)

### 標準優先 (4-5日目)
- 5.4, 5.5, 5.6 (提案ページ・統計・API)
- 6.1, 6.2 (ナビゲーション・ダッシュボード)

### 最終段階 (6-7日目)
- 6.3-6.9 (エラー・ローディング・テスト・デプロイ)

---

## 📝 注記

- **Phase 4-6 全体では 10-12日程度の実装時間を想定**
- **各フェーズ完了後に git commit**
- **テストは段階的に、QA は最終段階前に実施**
- **ドキュメントは同時進行**
