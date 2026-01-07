# GitHub Issues トレーサビリティ & ロギングシステム

## 概要

このドキュメントは、UpWork Terminal プロジェクトのGitHub Issues を使用したトレーサビリティと進捗管理の仕組みを定義します。

**目的**: 全作業をGitHub Issuesで可視化・追跡し、エージェント割り当てと自動実行が可能な状態を実現する。

---

## Issue 管理の構造

### フェーズ別整理

#### 🔴 Phase 1: MVP 確実化 (CRITICAL - 緊急対応)
| # | Issue | 優先度 | 状態 | 見積 | 担当 |
|---|-------|--------|------|------|------|
| 1 | Inbox 完全動作確認 | CRITICAL | OPEN | 4-5h | - |
| 2 | Sophia 改善ループ完成 | CRITICAL | OPEN | 3-4h | - |
| 3 | 提案テンプレート A/B 精度向上 | CRITICAL | OPEN | 3-4h | - |

**完了条件**: MVP3機能が動作確認・テスト合格
**ゴール達成時期**: 本日中
**ブロッカー**: なし

#### 🟠 Phase 2: 運用品質向上 (HIGH - 今週中)
| # | Issue | 優先度 | 状態 | 見積 | 担当 |
|---|-------|--------|------|------|------|
| 4 | 入力バリデーション & エラー処理 | HIGH | OPEN | 2-3h | - |
| 5 | ジョブデータ品質管理 | HIGH | OPEN | 2-3h | - |
| 6 | UI/UX 初心者向け改善 | HIGH | OPEN | 2-3h | - |

**完了条件**: ユーザー体験向上・エラー日本語化完了
**ゴール達成時期**: 今週中
**ブロッカー**: Phase 1 完了に依存

#### 🟡 Phase 3-4: 実運用最適化・テスト (MEDIUM - 来週中)
| # | Issue | 優先度 | 状態 | 見積 | 担当 |
|---|-------|--------|------|------|------|
| 7 | CSV インポート機能 | MEDIUM | OPEN | 3-4h | - |
| 8 | Contract & Timesheet 機能 | MEDIUM | OPEN | 4-5h | - |
| 9 | 提案履歴 & 勝ちパターン分析 | MEDIUM | OPEN | 4-5h | - |
| 10 | ユニットテスト実装 | MEDIUM | OPEN | 4-5h | - |
| 11 | E2E テスト実装 | MEDIUM | OPEN | 4-5h | - |

**完了条件**: 拡張機能実装・テスト自動化完了
**ゴール達成時期**: 来週中
**ブロッカー**: Phase 1 完了に依存

#### 🟢 Phase 5-6: パフォーマンス・デプロイメント (LOW - 今月中)
| # | Issue | 優先度 | 状態 | 見積 | 担当 |
|---|-------|--------|------|------|------|
| 12 | パフォーマンス最適化 | LOW | OPEN | 3-4h | - |
| 13 | デプロイメント構築 | LOW | OPEN | 3-4h | - |
| 14 | モニタリング & ロギング | LOW | OPEN | 2-3h | - |

**完了条件**: 本番環境デプロイ準備・監視体制構築
**ゴール達成時期**: 今月中
**ブロッカー**: Phase 1-2 完了に依存

#### 🔵 Phase 7: 将来 (FUTURE - SaaS化時)
| # | Issue | 優先度 | 状態 | 見積 | 担当 |
|---|-------|--------|------|------|------|
| 15 | マルチユーザー対応 (SaaS化) | FUTURE | OPEN | 6-8h | - |

**完了条件**: NextAuth.js統合・テナント分離実装
**ゴール達成時期**: 将来のSaaS化検討時
**ブロッカー**: Phase 1-6 完了に依存

---

## コメント・ログ管理ガイドライン

### Issue コメント規約

各Issue には以下のタイプのコメントを記録します：

#### 1. **ステータス更新コメント** (Definition of Done進捗)

```
## 進捗報告 - [日付]

**現在のステータス**: [TODO | In Progress | In Review | Done]

**完了したタスク**:
- [x] Sub-Issue A
- [x] Sub-Issue B
- [ ] Sub-Issue C (ブロック: [理由])

**次のステップ**: [具体的な次のアクション]

**ログ**:
```
[実行ログ、テスト結果、エラーメッセージ等]
```

**所要時間**: [予定 vs 実績]

---
```

#### 2. **エラー・ブロッカーコメント** (問題報告)

```
## エラー報告 - [日付]

**エラー内容**:
[エラーの説明]

**再現手順**:
1. [ステップ1]
2. [ステップ2]

**エラーログ**:
```
[スタックトレース・ログ]
```

**推定原因**: [原因の仮説]

**提案する解決策**: [対応案]

---
```

#### 3. **レビュー・承認コメント** (コードレビュー)

```
## コードレビュー承認 - [日付]

**レビュアー**: [@user]

**チェック項目**:
- [x] コード品質
- [x] テストカバレッジ
- [x] パフォーマンス
- [x] セキュリティ
- [x] ドキュメント

**コメント**: [修正不要/軽微な指摘/要修正]

**承認**: ✅ APPROVED | ⚠️ CHANGES REQUESTED | ❌ REJECTED

---
```

#### 4. **スクリーンショット・証拠コメント** (ビジュアル確認)

```
## 動作確認スクリーンショット - [日付]

**環境**: [OS / ブラウザ / Node.js版]

[画像をアップロード]

**確認内容**: [動作の説明]

---
```

---

## ログ記録の方式

### 1. **GitHub Issues 標準ログ**

- **Issue作成時**: 説明 + 定義of Done + Sub-Issues チェックリスト
- **着手時**: コメントで "開始" 宣言
- **進捗中**: 日別に進捗コメント（午前・午後）
- **完了時**: 最終レポートと全Sub-Issues完了確認
- **テスト時**: テストログ・スクリーンショット添付

### 2. **ローカル実行ログ**

実行時のコマンドとログを `logs/` ディレクトリに保存：

```bash
# テスト実行
npm test -- issue-#1 > logs/issue-1-test-$(date +%Y%m%d_%H%M%S).log 2>&1

# ビルド実行
npm run build > logs/issue-1-build-$(date +%Y%m%d_%H%M%S).log 2>&1

# デプロイメント実行
npm run deploy > logs/issue-1-deploy-$(date +%Y%m%d_%H%M%S).log 2>&1
```

### 3. **環境変数・設定ログ**

Issue完了時に環境変数の状態をスナップショット：

```json
{
  "issue_id": 1,
  "date": "2026-01-07",
  "environment": {
    "NODE_ENV": "development",
    "NEXT_PUBLIC_API_URL": "http://localhost:3000",
    "INBOX_WEBHOOK_TOKEN": "[REDACTED]",
    "ANTHROPIC_API_KEY": "[REDACTED]"
  },
  "test_results": {
    "unit_tests": "PASSED",
    "e2e_tests": "PASSED",
    "manual_testing": "PASSED"
  }
}
```

---

## エージェント割り当て方法

### Step 1: Issue 準備完了の確認

各Issueが以下を満たしていることを確認：

- [x] タイトルが明確（優先度含む）
- [x] 説明が詳細で実装方針が明確
- [x] Sub-Issues がチェックリスト化されている
- [x] 定義of Done が明記されている
- [x] 見積時間が記載されている
- [x] ラベルが付けられている
- [x] 依存Issueが明記されている

### Step 2: エージェント割り当てコメント

Issue に割り当てるエージェントに対し、以下の形式でコメント：

```
## エージェント割り当て - [日付]

@[Agent Name] - このIssueをアサインします

**優先度**: CRITICAL / HIGH / MEDIUM / LOW
**見積時間**: X-Y 時間
**納期**: [具体的な日時]
**ブロッカー**: [依存Issue] (完了待機中)

**アクション**:
1. Issue内容を確認
2. Sub-Issues の順序を確認
3. 着手可能な場合、"進捗開始" コメントを記入
4. 問題発生時は "エラー報告" コメントを記入
5. 完了時は "完了報告" コメントで全Sub-Issues完了を確認

**チェックリスト**:
- [ ] Issue内容を理解した
- [ ] 環境構築が完了した
- [ ] テスト環境が整備された
- [ ] 進捗を開始できる状態である

---
```

### Step 3: 進捗追跡

エージェント実行中、以下のフローで追跡：

1. **着手確認**: エージェント "進捗開始" コメント → Issueステータス更新
2. **日次更新**: エージェント進捗レポート → Issue内コメントに記録
3. **ブロッカー通知**: エラー/ブロック状況 → "エラー報告" コメント
4. **完了確認**: エージェント "完了報告" → Issue自動クローズ

### Step 4: レビュー & 承認

完了したIssueに対して：

1. **自動テスト実行**: GitHub Actions で CI/CD テスト
2. **手動レビュー**: コードレビューコメント
3. **承認**: Review承認コメント → Issue auto-close

---

## ログファイル構造

```
logs/
├── issue-tracking.json              # 全Issue メタデータ
├── issue-1/
│   ├── status-updates.log          # ステータス更新ログ
│   ├── test-results.log            # テスト実行ログ
│   ├── errors.log                  # エラー・ブロッカーログ
│   └── completion-report.json      # 完了レポート
├── issue-2/
│   └── ...
└── ...
```

### 例: `issue-1/status-updates.log`

```
[2026-01-07 09:00:00] 🔴 ISSUE START - Issue #1 Inbox 完全動作確認
[2026-01-07 09:30:00] ✏️  Sub-Issue開始: メール Webhook トークン認証
[2026-01-07 10:15:00] ✅ Sub-Issue完了: メール Webhook トークン認証設定完了
[2026-01-07 10:45:00] ⏸️  ブロック: Inbox UI のバグが見つかった→調査開始
[2026-01-07 12:00:00] ✅ Sub-Issue完了: Inbox UIバグ修正
[2026-01-07 14:30:00] ✅ Sub-Issue完了: POST /api/jobs エンドポイント実装
[2026-01-07 15:45:00] 🧪 テスト開始: 統合テスト実行中
[2026-01-07 16:30:00] ✅ テスト完了: 全テスト合格
[2026-01-07 17:00:00] 🎉 ISSUE COMPLETE - Issue #1 完了
```

---

## 自動化スクリプト（将来実装予定）

### `scripts/issue-logger.sh` - Issue ログ記録自動化

```bash
#!/bin/bash

ISSUE_NUM=$1
EVENT_TYPE=$2  # START / UPDATE / BLOCK / TEST / COMPLETE
MESSAGE=$3

LOG_DIR="logs/issue-${ISSUE_NUM}"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="$LOG_DIR/status-updates.log"

case $EVENT_TYPE in
  "START")
    echo "[$TIMESTAMP] 🔴 ISSUE START - Issue #${ISSUE_NUM} ${MESSAGE}" >> $LOG_FILE
    gh issue comment $ISSUE_NUM --body "進捗開始: $(date)"
    ;;
  "UPDATE")
    echo "[$TIMESTAMP] ✏️  ${MESSAGE}" >> $LOG_FILE
    ;;
  "BLOCK")
    echo "[$TIMESTAMP] ⏸️  ブロック: ${MESSAGE}" >> $LOG_FILE
    gh issue comment $ISSUE_NUM --body "❌ ブロッカー: ${MESSAGE}"
    ;;
  "TEST")
    echo "[$TIMESTAMP] 🧪 テスト: ${MESSAGE}" >> $LOG_FILE
    ;;
  "COMPLETE")
    echo "[$TIMESTAMP] 🎉 ISSUE COMPLETE - Issue #${ISSUE_NUM}" >> $LOG_FILE
    gh issue close $ISSUE_NUM
    ;;
esac
```

---

## チェックリスト: トレーサビリティ確立完了

- [x] GitHub Issues 15個を作成
- [x] Issue Template (bug_report.md, feature_request.md) を作成
- [x] フェーズ別優先度分類を実施
- [x] Sub-Issues チェックリストを記載
- [x] 定義of Done を明記
- [x] 見積時間を設定
- [ ] GitHub Project Board を構築（権限不足）
- [x] ログ記録ガイドラインを定義
- [x] コメント規約を制定
- [x] エージェント割り当てプロセスを設計
- [ ] 自動ログスクリプトを実装（次フェーズ）
- [ ] CI/CD テスト自動化（次フェーズ）

---

## 次のステップ

1. **Issue レビュー**: すべてのIssueが正確に記載されているか確認
2. **エージェント通知**: 割り当てられたエージェントにIssueを共有
3. **進捗追跡開始**: Phase 1 (CRITICAL) Issues から着手
4. **日次ログ報告**: エージェントが日別に進捗ログを記録
5. **完了時検証**: Sub-Issues チェックリストが全て完了したことを確認

---

**作成日**: 2026-01-07
**更新日**: 2026-01-07
**ステータス**: Active
