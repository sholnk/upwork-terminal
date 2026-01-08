#!/bin/bash

# GitHub Issues 一括作成スクリプト
# UpWork Terminal MVP - フェーズ別の全 Issues

set -e

# GITHUB_TOKEN は環境変数 (.env) から読み込まれます

echo "📌 Creating GitHub Issues..."
echo "Repository: sholnk/upwork-terminal"
echo ""

# Phase 1: MVP 確実化 (Critical)

echo "🔴 Phase 1: MVP Stabilization - Creating CRITICAL Issues..."

gh issue create \
  --title "Issue #1 [CRITICAL]: Inbox 完全動作確認 - 案件化～分析導線" \
  --body "## 説明
UpWork Terminal MVP の最重要機能: メール → 案件 → 分析 → 提案 の完全導線を確実に動かす。

## マイルストーン
Inbox 機能の完全動作確認と必要な API エンドポイント実装

## Sub-Issues
- [ ] メール Webhook トークン認証完成（INBOX_WEBHOOK_TOKEN 環境変数設定）
- [ ] Inbox UI バグ修正（存在確認）
- [ ] POST /api/jobs エンドポイント実装（手入力 Job 対応）
- [ ] Inbox → Job 化の導線テスト
- [ ] エラーメッセージすべて日本語化
- [ ] ローカル Postmark でメール取り込みテスト実施

## 定義 of Done
- [ ] Inbox → Job 化の導線が完全に動く
- [ ] エラーが日本語で表示される
- [ ] メール Webhook が正常に受け取れる
- [ ] テスト完了・ログ記録

## 見積もり
4-5 時間

## 優先度
🔴 CRITICAL - 今すぐ必須（今日中に着手）" \
  --label "critical,inbox,backend,frontend,mvp" \
  --assignee sholnk

echo "✅ Issue #1 created"

gh issue create \
  --title "Issue #2 [CRITICAL]: Sophia 改善ループ完成 - 自己分析サイクル" \
  --body "## 説明
SophiaReport の JSON 確実保存、SocraticTrigger（次の一問）の表示と改善ループの実装。
自己分析が実用的になるフェーズ。

## マイルストーン
- SophiaReport JSON 保存確認
- UI: SocraticTrigger 質問の表示
- 改善ループ（回答→再分析）実装
- テンプレート最適化

## Sub-Issues
- [ ] SophiaReport の JSON 保存確認
- [ ] UI: SocraticTrigger 質問の表示・レイアウト改善
- [ ] API: 改善ループ用エンドポイント確認
- [ ] プロンプト微調整（プロフィール分析用）
- [ ] テスト: 複数ユースケースで確認

## 定義 of Done
- [ ] Sophia 分析結果が確実に保存される
- [ ] 次の一問が表示される
- [ ] 改善ループが動く
- [ ] 日本語表示改善

## 見積もり
3-4 時間

## 優先度
🔴 CRITICAL - MVP 価値提供のコア機能" \
  --label "critical,sophia,ai,backend,mvp" \
  --assignee sholnk

echo "✅ Issue #2 created"

gh issue create \
  --title "Issue #3 [CRITICAL]: 提案テンプレート A/B 精度向上 - 英語カバーレター生成" \
  --body "## 説明
日本語入力 → 英語カバーレター生成の精度向上。
テンプレート A（短納期）B（二段階）の使い分けと実用性確保。

## マイルストーン
- プロンプト微調整（Template A/B）
- Proposal UI 改善
- テスト: 複数案件で生成テスト
- コネクト消費の記録

## Sub-Issues
- [ ] Template A プロンプト微調整（短納期型）
- [ ] Template B プロンプト微調整（二段階型）
- [ ] Proposal UI の改善・表示確認
- [ ] テスト: 5 案件以上で生成テスト
- [ ] エラーハンドリング改善

## 定義 of Done
- [ ] テンプレート A/B が使い分けられる
- [ ] 英語が実用レベル
- [ ] コネクト消費が記録される
- [ ] 複数テストケース合格

## 見積もり
3-4 時間

## 優先度
🔴 CRITICAL - 提案効果に直結" \
  --label "critical,proposal,ai,backend,mvp" \
  --assignee sholnk

echo "✅ Issue #3 created"

# Phase 2: 運用品質向上 (High Priority)

echo ""
echo "🟠 Phase 2: Operational Quality - Creating HIGH Priority Issues..."

gh issue create \
  --title "Issue #4 [HIGH]: 入力バリデーション & エラー処理 - ユーザーフレンドリー化" \
  --body "## 説明
すべてのエラーメッセージを日本語化し、ユーザーが迷わない状態を実現。

## マイルストーン
- エラーメッセージ日本語化
- クライアント側バリデーション追加
- 404/500 カスタムエラーページ
- Toast/Modal での友好的なエラー表示

## Sub-Issues
- [ ] エラーメッセージすべてを日本語化
- [ ] クライアント側 Zod バリデーション追加
- [ ] API エラーレスポンス改善（日本語）
- [ ] 404/500 カスタムエラーページ実装
- [ ] Toast/Modal コンポーネント実装
- [ ] テスト: 各エラーケース確認

## 定義 of Done
- [ ] エラーが日本語で表示される
- [ ] ユーザーが何をすべきか明確
- [ ] すべてのエラーケースでテスト合格

## 見積もり
2-3 時間

## 優先度
🟠 HIGH - 初心者向け UX 改善" \
  --label "high,frontend,ux,bug-fix" \
  --assignee sholnk

echo "✅ Issue #4 created"

gh issue create \
  --title "Issue #5 [HIGH]: ジョブデータの品質管理 - スクレイピング & 重複対策" \
  --body "## 説明
Web スクレイピング（Puppeteer）の安定性向上と、重複データの検出・防止。

## マイルストーン
- スクレイピング失敗時のログ & リトライ
- 重複ジョブの検出・防止
- 手入力漏れ項目の警告

## Sub-Issues
- [ ] Puppeteer スクレイピング: リトライロジック実装（3 回まで）
- [ ] スクレイピング失敗時のログ記録（エラーハンドリング）
- [ ] 重複 Job 検出ロジック実装
- [ ] 重複警告 UI 実装
- [ ] 手入力必須項目の検証メッセージ
- [ ] ローカルテスト（複数 URL）

## 定義 of Done
- [ ] スクレイピング失敗時のリトライが動く
- [ ] 重複ジョブが検出される
- [ ] ユーザーが入力漏れを気づける

## 見積もり
2-3 時間

## 優先度
🟠 HIGH - データ品質確保" \
  --label "high,backend,scraper,quality" \
  --assignee sholnk

echo "✅ Issue #5 created"

gh issue create \
  --title "Issue #6 [HIGH]: UI/UX 初心者向け改善 - ガイダンス & 導線最適化" \
  --body "## 説明
英語が苦手な初心者フリーランサーでも迷わないような UI/UX を実現。

## マイルストーン
- ツールチップ実装
- 導線ガイダンス（Step 1 → 6 の進捗表示）
- 画面サイズ最適化（モバイル対応）

## Sub-Issues
- [ ] ツールチップ実装（初回アクセス時に表示）
- [ ] Dashboard に Step 進捗表示
- [ ] 各ページに「次は何をする？」ガイド
- [ ] モバイル UI テスト（iPhone/Android）
- [ ] 画面幅 320px でのテスト
- [ ] ボタンサイズ最適化（最小 44px）

## 定義 of Done
- [ ] 初心者が迷わない導線が実現
- [ ] モバイル対応完了
- [ ] ツールチップが表示される

## 見積もり
2-3 時間

## 優先度
🟠 HIGH - 初心者体験向上" \
  --label "high,frontend,ux,mobile" \
  --assignee sholnk

echo "✅ Issue #6 created"

# Phase 3: 実運用最適化 (Medium Priority)

echo ""
echo "🟡 Phase 3: Operational Optimization - Creating MEDIUM Priority Issues..."

gh issue create \
  --title "Issue #7 [MEDIUM]: CSV インポート機能 - 複数案件一括取り込み" \
  --body "## 説明
複数案件を CSV で一括インポートする機能。
初心者向けに既存案件を一度に登録可能にする。

## マイルストーン
- CSV テンプレート作成
- Parser 実装
- Batch job creation
- エラー行の処理

## Sub-Issues
- [ ] CSV テンプレート作成（Figma/Excel）
- [ ] PapaParse ライブラリ導入
- [ ] CSV Parser 実装
- [ ] POST /api/jobs/import-csv エンドポイント実装
- [ ] Batch job creation ロジック
- [ ] エラー行の個別処理表示
- [ ] テスト: サンプル CSV での確認

## 定義 of Done
- [ ] CSV をアップロードできる
- [ ] 複数案件が一括作成される
- [ ] エラー行が明示される

## 見積もり
3-4 時間

## 優先度
🟡 MEDIUM - 来週中に実装" \
  --label "medium,backend,frontend,feature" \
  --assignee sholnk

echo "✅ Issue #7 created"

gh issue create \
  --title "Issue #8 [MEDIUM]: Contract & Timesheet 機能 - 契約・納期管理" \
  --body "## 説明
実際の Contract データと Timesheet（時給案件）の管理機能。
支払い確認や納期管理を一元化。

## マイルストーン
- Contract UI 実装
- Timesheet ログ UI
- 基本機能（作成・編集・削除）

## Sub-Issues
- [ ] Contract モデルの UI ページ実装（/contracts）
- [ ] Contract 作成フォーム
- [ ] Timesheet 入力 UI
- [ ] Contract 一覧・フィルター
- [ ] Contract → Proposal の紐付け確認
- [ ] テスト: Contract のライフサイクル

## 定義 of Done
- [ ] Contract が管理できる
- [ ] Timesheet がログできる
- [ ] 基本機能が動作

## 見積もり
4-5 時間

## 優先度
🟡 MEDIUM - 来週中に着手" \
  --label "medium,backend,frontend,contracts" \
  --assignee sholnk

echo "✅ Issue #8 created"

gh issue create \
  --title "Issue #9 [MEDIUM]: 提案履歴 & 勝ちパターン分析 - 勝率向上" \
  --body "## 説明
提案履歴を蓄積し、勝ちパターン（スキル・予算帯・クライアント質）を可視化。
次の提案に生かす。

## マイルストーン
- Proposal 検索・フィルター
- Win rate 計算ロジック
- 勝ちパターン可視化（グラフ）

## Sub-Issues
- [ ] Proposal 検索・フィルター UI
- [ ] Proposal ステータス集計ロジック
- [ ] Win rate 計算ロジック
- [ ] スキル別 win rate グラフ
- [ ] 予算帯別 win rate グラフ
- [ ] クライアント品質別 win rate グラフ

## 定義 of Done
- [ ] 提案履歴が検索・分析できる
- [ ] Win rate が計算・表示される
- [ ] 勝ちパターンが見える

## 見積もり
4-5 時間

## 優先度
🟡 MEDIUM - 来週中に実装" \
  --label "medium,backend,frontend,analytics" \
  --assignee sholnk

echo "✅ Issue #9 created"

# Phase 4: Testing & Quality

echo ""
echo "🟡 Phase 4: Testing & Quality - Creating Test Issues..."

gh issue create \
  --title "Issue #10 [MEDIUM]: ユニットテスト実装 - 重要ロジックのテスト化" \
  --body "## 説明
Upwork スクレイピング、Sophia エンジン、提案生成など、重要ロジックのユニットテスト。

## マイルストーン
- upwork-scraper.ts テスト
- url-parser.ts テスト
- Job API テスト
- Proposal generator テスト

## Sub-Issues
- [ ] upwork-scraper.ts テスト実装（Jest）
- [ ] url-parser.ts テスト
- [ ] Job CRUD API テスト
- [ ] Proposal generator テスト
- [ ] Sophia engine テスト
- [ ] カバレッジレポート作成（目標 80%+）

## 定義 of Done
- [ ] 重要ロジックがテストカバーされる
- [ ] カバレッジ 80% 達成
- [ ] テストが CI で実行される

## 見積もり
4-5 時間

## 優先度
🟡 MEDIUM - テスト品質確保" \
  --label "medium,test,backend,quality" \
  --assignee sholnk

echo "✅ Issue #10 created"

gh issue create \
  --title "Issue #11 [MEDIUM]: E2E テスト実装 - ユーザーフロー検証" \
  --body "## 説明
Playwright で完全なユーザーフローをテスト。
実際の使用シーンが動く確認。

## マイルストーン
- E2E テスト実装（Playwright）
- CI/CD 統合
- テスト実行の自動化

## Sub-Issues
- [ ] Scenario 1: Job URL インポート → 分析
- [ ] Scenario 2: 手入力 Job → 分析
- [ ] Scenario 3: メール → Job → 分析
- [ ] Scenario 4: 提案生成 → 保存
- [ ] E2E テスト実行・修正
- [ ] GitHub Actions 統合

## 定義 of Done
- [ ] 全主要フローが E2E テストされる
- [ ] テストが自動実行される
- [ ] テスト失敗時に通知される

## 見積もり
4-5 時間

## 優先度
🟡 MEDIUM - 信頼性向上" \
  --label "medium,test,e2e,quality" \
  --assignee sholnk

echo "✅ Issue #11 created"

# Phase 5: Performance & Deployment

echo ""
echo "🟢 Phase 5: Performance & Deployment - Creating GREEN Priority Issues..."

gh issue create \
  --title "Issue #12 [LOW]: パフォーマンス最適化 - 高速化 & 軽量化" \
  --body "## 説明
バンドルサイズ削減、画像最適化、データベース クエリ最適化。
Lighthouse スコア 90+ を目指す。

## マイルストーン
- Bundle size 分析・削減
- 画像最適化
- DB クエリ最適化

## Sub-Issues
- [ ] Webpack Bundle Analyzer 実行
- [ ] コード分割（Code Splitting）実装
- [ ] 画像最適化（next/image 活用）
- [ ] DB クエリプロファイリング
- [ ] Lighthouse 監査実施
- [ ] 不要な依存ライブラリ削除

## 定義 of Done
- [ ] バンドルサイズ 50% 削減
- [ ] Lighthouse スコア 90+ 達成
- [ ] ページロード時間 50% 削減

## 見積もり
3-4 時間

## 優先度
🟢 LOW - 今月中" \
  --label "low,backend,frontend,performance" \
  --assignee sholnk

echo "✅ Issue #12 created"

# Phase 6: Deployment & Monitoring

gh issue create \
  --title "Issue #13 [LOW]: デプロイメント構築 - 本番環境への移行" \
  --body "## 説明
Vercel/Railway への本番デプロイ。
CI/CD パイプライン構築。

## マイルストーン
- ホスティング選定・セットアップ
- 環境変数管理
- データベースバックアップ
- DNS 設定

## Sub-Issues
- [ ] Vercel セットアップ（or Railway）
- [ ] 環境変数管理（GitHub Secrets）
- [ ] データベース バックアップ戦略
- [ ] SSL/HTTPS 設定
- [ ] CDN 設定
- [ ] ドメイン設定

## 定義 of Done
- [ ] 本番環境にデプロイ可能
- [ ] 自動デプロイが実行される
- [ ] バックアップが自動化される

## 見積もり
3-4 時間

## 優先度
🟢 LOW - 今月中" \
  --label "low,devops,deployment" \
  --assignee sholnk

echo "✅ Issue #13 created"

gh issue create \
  --title "Issue #14 [LOW]: モニタリング & ロギング - 本番監視体制" \
  --body "## 説明
エラートラッキング、パフォーマンス監視、ロギング。

## マイルストーン
- Sentry 統合
- パフォーマンス監視
- ロギング システム

## Sub-Issues
- [ ] Sentry セットアップ（エラートラッキング）
- [ ] New Relic or Datadog セットアップ（パフォーマンス）
- [ ] 構造化ロギング実装
- [ ] アラート設定
- [ ] ダッシュボード構築
- [ ] 月次レビュープロセス

## 定義 of Done
- [ ] エラーが自動で報告される
- [ ] パフォーマンス問題が検出される
- [ ] ロギングが機能している

## 見積もり
2-3 時間

## 優先度
🟢 LOW - 今月中" \
  --label "low,devops,monitoring" \
  --assignee sholnk

echo "✅ Issue #14 created"

# Phase 7: Future - SaaS化準備

gh issue create \
  --title "Issue #15 [FUTURE]: マルチユーザー対応 - SaaS 化準備" \
  --body "## 説明
現在の SINGLE_USER_ID から NextAuth.js による複数ユーザー対応へ。
将来の SaaS 化を見据えた設計。

## マイルストーン
- NextAuth.js 導入
- User Authentication 改造
- Tenant isolation

## Sub-Issues
- [ ] NextAuth.js セットアップ
- [ ] ユーザー登録・ログイン UI
- [ ] Email 確認フロー
- [ ] ユーザーコンテキスト管理
- [ ] データ isolation 実装
- [ ] DB マイグレーション戦略

## 定義 of Done
- [ ] 複数ユーザーが利用可能
- [ ] テナント分離が実装される
- [ ] セキュリティテスト合格

## 見積もり
6-8 時間

## 優先度
🔵 FUTURE - SaaS 化時" \
  --label "future,backend,auth,saas" \
  --assignee sholnk

echo "✅ Issue #15 created"

echo ""
echo "=========================================="
echo "✅ All 15 Issues Created Successfully!"
echo "=========================================="
echo ""
echo "📊 Summary:"
echo "  🔴 CRITICAL:   3 issues (Phase 1)"
echo "  🟠 HIGH:       3 issues (Phase 2)"
echo "  🟡 MEDIUM:     6 issues (Phase 3-4)"
echo "  🟢 LOW:        2 issues (Phase 5-6)"
echo "  🔵 FUTURE:     1 issue  (Phase 7)"
echo ""
echo "📍 Repository: https://github.com/sholnk/upwork-terminal"
echo "🔗 Issues: https://github.com/sholnk/upwork-terminal/issues"
echo ""
