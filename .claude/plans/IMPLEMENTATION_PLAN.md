# UpWork Freelance Management Web Service - 統合実装計画 v1.0

**最短で"実運用"できるMVP設計 × 本番レベルの拡張性**

---

## 🎯 プロジェクト概要

### ビジョン
UpWorkでのフリーランス活動を **日本語UIで一本道にまとめ、実運用から SaaS化まで** 対応するWebサービス

### MVP目標
「登録 → Inbox確認 → 案件分析 → 提案作成」を **Step型**で実運用可能にする（日数目標ではなくStep設計）

### 重要な制約・方針
- 🇯🇵 **英語が苦手な初心者でも迷わない日本語導線**
- 📧 **UpWork通知メール（Inbox）をUI内で一元管理**
- 🤖 **Sophia（自己分析/最適化）を初期フェーズに組み込み**
- 🔒 **UpWerkへの自動送信はしない（安全なコピペ運用）**
- 📊 **SophiaのJSON・提案テンプレ・勝ち筋を資産化**
- ⚡ **最短で回すことを優先（本番化→AI Agents→SaaS化の順）**

---

## 📋 技術スタック

### Frontend & Backend
- **Next.js 15.1.4** (App Router with React Server Components)
- **TypeScript 5.7+** (strict mode)
- **Tailwind CSS 4** + shadcn/ui

### Database & ORM
- **PostgreSQL 16+** (本番用)
- **Prisma 6.2.1** (型安全ORM)

### 認証 & API
- **NextAuth.js 5** (OAuth2 for UpWork)
- **UpWork GraphQL API** (公式API統合)
- **Inbound Webhook** (メール統合最速)

### 状態管理 & ユーティリティ
- **React Server Components** (サーバーファーストデータ取得)
- **TanStack Query v5** (クライアント状態)
- **Zustand** (軽量状態管理)
- **Zod** (スキーマ検証)
- **Claude AI API** (Sophia分析・提案生成)

### デプロイ
- **Vercel** (Next.js本番)
- **Railway / Supabase** (PostgreSQL)

---

## 📊 MVP v0.1: 実装優先順（Step型実行設計）

### Step 1: プロフィール投入 & Sophia初期分析
**ゴール**: ユーザーが既存プロフを入力 → Sophia分析で改善ループスタート

**実装内容**:
- ProfileSnapshot モデル（原文保存）
- Onboarding フロー（/onboarding/import）
- Sophia初期分析エンドポイント（Q_META/F_ULTIMATE JSON保存）
- SocraticTrigger（次に答えるべき1問の出力）

**画面**: `/onboarding/import` → `/onboarding/sophia-analysis` → `/onboarding/profile-builder`

---

### Step 2: Inbox（UpWork通知）一元化
**ゴール**: UpWork通知をメール→DBに取り込み、UIで確認できる状態

**実装内容**:
- InboxMessage / InboxExtract モデル
- Webhook endpoint: `/api/inbox/ingest` （Postmark等からのPOST受け取り）
- URL抽出ロジック（正規表現で job_link 抽出）
- Inbox UI（2ペイン）: `/dashboard/inbox`
  - 左: 通知一覧（status: new/processed/ignored）
  - 右: 詳細 + アクション

**コンポーネント**:
```
components/inbox/
  ├── inbox-shell.tsx (状態管理)
  ├── inbox-filters.tsx (タブ + 検索)
  ├── inbox-list.tsx (一覧)
  ├── inbox-detail.tsx (詳細 + アクション)
  └── inbox-empty.tsx
```

**アクション**:
- 新着案件 → **「案件カード化」ボタン → Job作成 → /jobs/[id]/analyze へ遷移**
- 無視 / 処理済み へステータス更新

---

### Step 3: 案件分析 UI & Sophia統合
**ゴール**: Inboxから生成されたJobに対して、スコアリング + Sophia分析 + 意思決定

**実装内容**:
- Job.analysisJson フィールド（任意のJSON保存）
- `/jobs/[id]/analyze` ページ
  - **スコアリング**: fit / clarity / budgetROI / clientQuality / winChance（合計0-100）
  - **意思決定**: propose / hold / drop
  - **タグ・メモ**: 日本語で自由記録
  - **Sophia分析ボタン**: Job を targetType として分析 → Report保存 → 次の1問表示

**SophiaReport保存フィールド**:
- targetType: "job"
- targetId: Job.id
- qMeta: Q_META JSON
- fUltimate: F_ULTIMATE JSON
- socraticTrigger: 改善への1問

---

### Step 4: A/Bテンプレ提案生成（日本語入力→英語出力）
**ゴール**: 日本語で提案内容を入力 → 英語カバーレター自動生成 → 手動でUpWorkにコピペ

**実装内容**:
- ProposalTemplate enum: `A_short_deliverable | B_audit_then_build`
- `/proposals/new` ページ
  - **Template A** (短納期): 問題→デリバリー→証拠
  - **Template B** (二段階): 問題→監査→改善→証拠
  - **入力フォーム**: 日本語で「問題サマリー」「デリバリー内容」「証拠」など
  - **生成**: Claude APIで英語カバーレター生成
  - **確認**: 生成結果を表示 → コピペ用に整形
  - **記録**: Proposal保存（templateType, inputJson, status=draft）

**Proposal フィールド追加**:
- templateType: ProposalTemplateType
- inputJson: 日本語入力を JSON保存（改善ループ資産化）
- coverLetter: 生成された英語最終文

---

### Step 5: 実運用ルーティング確認
**ゴール**: 毎日回すルーティンが動作することを確認

**ユースケース**:
1. 朝：Inbox（新着）を確認
2. 気になる通知を「案件カード化」
3. Job分析ページで「スコア・意思決定」
4. A/Bテンプレで提案下書き
5. 手動でUpWorkにコピペ応募
6. Proposal に結果・コネクト消費・フィードバック記録
7. 勝ち筋（反応良い訴求・テンプレ型）が資産として蓄積

---

## 📦 Prismaスキーマ更新

### 新規 Enum
```prisma
enum ProfileSource {
  paste
  file
  upwork_api
}

enum SophiaTargetType {
  profile
  job
  proposal
}

enum InboxProvider {
  gmail
  forwarded_email
  manual
}

enum InboxStatus {
  new
  processed
  ignored
}

enum InboxExtractType {
  job_link
  text_extract
}

enum JobSource {
  upwork
  inbox
  manual
}

enum ProposalTemplateType {
  A_short_deliverable
  B_audit_then_build
}
```

### 新規 Model: ProfileSnapshot
```prisma
model ProfileSnapshot {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  source        ProfileSource
  rawProfileText String  @db.Text
  intentMemoJa  String?  @db.Text
  portfolios    Json?    // [{title, url?, descriptionJa?}]

  firstMonthStrategy String? // review_focus | balanced | rate_focus
  englishConfidence  Int?    // 1-5

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
  @@map("profile_snapshots")
}
```

### 新規 Model: SophiaReport
```prisma
model SophiaReport {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  targetType    SophiaTargetType
  targetId      String
  userAnswerJa  String?  @db.Text

  qMetaJson     Json?    // Q_META structure
  fUltimateJson Json?    // F_ULTIMATE structure
  socraticTrigger String? // 次に答えるべき1問

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
  @@index([targetType, targetId])
  @@map("sophia_reports")
}
```

### 新規 Model: InboxMessage
```prisma
model InboxMessage {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  provider      InboxProvider
  from          String   @db.Text
  subject       String   @db.Text
  snippet       String   @db.Text
  rawBodyText   String   @db.Text

  status        InboxStatus @default(new)
  receivedAt    DateTime

  extracts      InboxExtract[]
  createdJobId  String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@index([receivedAt])
  @@map("inbox_messages")
}
```

### 新規 Model: InboxExtract
```prisma
model InboxExtract {
  id            String   @id @default(cuid())
  messageId     String
  message       InboxMessage @relation(fields: [messageId], references: [id], onDelete: Cascade)

  type          InboxExtractType
  payloadJson   Json     // { url: "..." } または { text: "..." }

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([messageId])
  @@map("inbox_extracts")
}
```

### 既存 Model 更新

#### User
```prisma
model User {
  // ... 既存フィールド ...

  // 新規リレーション
  profileSnapshots  ProfileSnapshot[]
  sophiaReports     SophiaReport[]
  inboxMessages     InboxMessage[]
}
```

#### Job
```prisma
model Job {
  // ... 既存フィールド ...

  source                String?       // JobSource @default("upwork")
  createdFromInboxMessageId String?
  analysisJson          Json?         // 任意の分析メモJSON
}
```

#### Proposal
```prisma
model Proposal {
  // ... 既存フィールド ...

  templateType          String?       // ProposalTemplateType
  inputJson             Json?         // 日本語入力を保存（改善ループ資産化）
}
```

---

## 🗺️ ページ・API マップ

### ページ (Next.js App Router)

#### Onboarding
- `/onboarding/import` - プロフィール投入 (ProfileSnapshot作成)
- `/onboarding/sophia-analysis` - Sophia初期分析 (SophiaReport作成)
- `/onboarding/profile-builder` - プロフィール最適化ビルダー

#### Dashboard
- `/dashboard/inbox` - Inbox一覧・詳細（2ペイン）
- `/dashboard/jobs/[id]/analyze` - 案件分析 & Sophia
- `/dashboard/proposals/new` - A/Bテンプレ提案生成
- `/dashboard/jobs` - 保存案件一覧
- `/dashboard/proposals` - 提案履歴
- `/dashboard/contracts` - 契約管理（Phase 2以降）
- `/dashboard/clients` - クライアント管理（Phase 2以降）

#### Auth
- `/login` - UpWork OAuth ログイン
- `/logout` - ログアウト

### API Endpoints

#### Inbox
```
GET    /api/inbox/messages?status=new&q=...  → InboxMessageListItem[]
GET    /api/inbox/messages/:id                → InboxMessageDetail
PATCH  /api/inbox/messages/:id/status         → { ok: true }
POST   /api/inbox/messages/:id/create-job     → { jobId: string }
POST   /api/inbox/ingest                      → { ok: true, messageId: string }
```

#### Onboarding & Sophia
```
POST   /api/onboarding/profile-snapshots      → { profileSnapshotId: string }
POST   /api/sophia/analyze                    → { sophiaReportId, qMeta, fUltimate }
```

#### Jobs
```
GET    /api/jobs/:id                          → Job (analysisJson含む)
PATCH  /api/jobs/:id/analyze                  → { ok: true }
```

#### Proposals
```
POST   /api/proposals/generate                → { coverLetterEn: string }
POST   /api/proposals                         → { proposalId: string }
```

---

## 📝 実装ロードマップ（Step優先順）

### Phase 0: Prismaスキーマ更新 & マイグレーション
**期間**: 1-2日

1. Enum 追加
2. ProfileSnapshot, SophiaReport, InboxMessage, InboxExtract モデル追加
3. User, Job, Proposal に新フィールド追加
4. `npx prisma migrate dev` → migration実行
5. Prisma Client 再生成

**成果物**:
- Migration ファイル
- 更新済みスキーマ
- Prisma Client

---

### Phase 1: Inbox Ingest & API
**期間**: 3-4日

1. `/api/inbox/ingest` エンドポイント実装
   - Webhook SECRET検証
   - メール本文からURL抽出（正規表現）
   - InboxMessage + InboxExtract 作成
2. `/api/inbox/messages` API（一覧・詳細）
3. `/api/inbox/messages/:id/status` API（ステータス更新）
4. `/api/inbox/messages/:id/create-job` API（Job生成）

**テスト**:
- Postman / cURL で Webhook POST
- UI なしでDB確認

**成果物**:
- Ingest エンドポイント
- Inbox API完全実装
- InboxMessage / InboxExtract にデータが入ることを確認

---

### Phase 2: Inbox UI (2ペイン)
**期間**: 4-5日

1. InboxShell コンポーネント（状態管理）
2. InboxFilters（Tabs + 検索）
3. InboxList（一覧・選択）
4. InboxDetail（詳細 + アクション）
5. `/dashboard/inbox` ページ統合

**機能確認**:
- 一覧表示 ✓
- 検索 ✓
- ステータス切替 ✓
- Job化 → /jobs/[id]/analyze へ遷移 ✓

**成果物**:
- Inbox UI完全実装
- 実運用でのInbox確認が可能に

---

### Phase 3: Sophia分析エンジン & Report API
**期間**: 5-6日

1. `/api/sophia/analyze` エンドポイント
   - Claude API 統合
   - Q_META 生成（ユーザーのスキル・立場・目標の構造化）
   - F_ULTIMATE 生成（最高の訴求・ポジション提案）
   - SocraticTrigger 生成（次の改善質問）
2. SophiaReport モデル保存
3. Sophia JSON スキーマ定義（Zod）

**テスト**:
- `/api/sophia/analyze` で JSON 生成確認
- SophiaReport に保存確認

**成果物**:
- Sophia分析エンジン
- Q_META / F_ULTIMATE JSON 生成可能

---

### Phase 4: Job分析UI & Sophia統合
**期間**: 4-5日

1. `/dashboard/jobs/[id]/analyze` ページ
   - スコアリング フォーム（fit, clarity, budgetROI, clientQuality, winChance）
   - 意思決定（propose / hold / drop）
   - タグ・メモ入力
   - **「Sophia分析」ボタン** → API呼び出し → Report表示
2. `/api/jobs/:id/analyze` PATCH エンドポイント

**UI確認**:
- Inbox → Job化 → 分析ページ遷移 ✓
- スコアリング・メモ保存 ✓
- Sophia分析実行 ✓

**成果物**:
- Job分析UI完全実装
- Sophia統合（改善ループが動作開始）

---

### Phase 5: A/Bテンプレ提案生成 & UI
**期間**: 5-6日

1. `/api/proposals/generate` エンドポイント
   - 日本語入力 (templateType別) を受け取り
   - Claude API で英語カバーレター生成
2. `/dashboard/proposals/new` ページ
   - Template A: 短納期型（問題→デリバリー→証拠）
   - Template B: 二段階型（問題→監査→改善→証拠）
   - 日本語入力フォーム
   - 生成結果表示 + コピーボタン
3. `/api/proposals` POST エンドポイント（Proposal保存）

**実運用確認**:
- Inbox → Job化 → 分析 → 提案生成 → コピペUpWork ✓
- コネクト消費・結果記録 ✓

**成果物**:
- A/Bテンプレ提案生成完全実装
- 日本語入力→英語出力パイプライン

---

### Phase 6: 実運用ルーティング & Polish
**期間**: 3-4日

1. ダッシュボードホーム（概要・最近の案件・提案状況）
2. エラーハンドリング・ローディング状態
3. UI Polish（レスポンシブ・アクセシビリティ）
4. ドキュメント・ユーザーガイド

**テスト**:
- 1週間分の実運用シミュレーション
- 改善フィードバック反映

**成果物**:
- MVP v0.1 本番準備完了
- 実運用可能な状態

---

## 📈 Phase 2+ (エンハンス・拡張)

### Phase 7: Onboarding & Sophia初期分析
**内容**: プロフィール投入 → 自己分析 → 改善ループ開始

**画面**:
- `/onboarding/import` - ProfileSnapshot 作成
- `/onboarding/sophia-analysis` - Sophia初期分析
- `/onboarding/profile-builder` - プロフィール最適化

---

### Phase 8: UpWork API直接統合（オプション）
**内容**:
- UpWork GraphQL API で Job/Proposal/Contract 取得
- 自動同期（30分ごと）
- スケール化

---

### Phase 9-11: AI Agent統合 & 自動化
**内容**:
- JobAgent: 自動案件スコアリング
- ProposalAgent: 自動提案生成サジェスト
- ContractAgent: 契約期限アラート
- ClientAgent: クライアント関係自動化

---

### Phase 12+: SaaS化・本番デプロイ
**内容**:
- マルチテナント対応
- サブスクリプション課金
- Vercel 本番デプロイ
- 監視・分析

---

## 🗂️ ディレクトリ構造

```
upwork-terminal/
├── prisma/
│   ├── schema.prisma         ✅ (更新)
│   └── migrations/
│       └── [timestamp]_add_sophia_inbox_models/
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── callback/
│   │   │
│   │   ├── (onboarding)/      🆕 Phase 7
│   │   │   ├── import/
│   │   │   ├── sophia-analysis/
│   │   │   └── profile-builder/
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── inbox/         🆕 Phase 2
│   │   │   ├── jobs/          🆕 Phase 4
│   │   │   │   └── [id]/
│   │   │   │       └── analyze/
│   │   │   ├── proposals/     🆕 Phase 5
│   │   │   │   └── new/
│   │   │   ├── contracts/
│   │   │   └── clients/
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── inbox/         🆕
│   │   │   ├── onboarding/    🆕 Phase 7
│   │   │   ├── sophia/        🆕
│   │   │   ├── jobs/          🆕
│   │   │   └── proposals/     🆕
│   │   │
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── inbox/             🆕
│   │   │   ├── inbox-shell.tsx
│   │   │   ├── inbox-filters.tsx
│   │   │   ├── inbox-list.tsx
│   │   │   ├── inbox-detail.tsx
│   │   │   └── inbox-empty.tsx
│   │   │
│   │   ├── jobs/
│   │   │   ├── job-card.tsx
│   │   │   ├── job-analyze-form.tsx    🆕
│   │   │   └── job-score-input.tsx     🆕
│   │   │
│   │   ├── proposals/
│   │   │   ├── proposal-form.tsx       🆕
│   │   │   ├── template-a-form.tsx     🆕
│   │   │   ├── template-b-form.tsx     🆕
│   │   │   └── proposal-preview.tsx    🆕
│   │   │
│   │   ├── sophia/                     🆕
│   │   │   ├── sophia-button.tsx
│   │   │   ├── sophia-report-display.tsx
│   │   │   └── socratic-trigger.tsx
│   │   │
│   │   └── ui/
│   │       └── (shadcn components)
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── upwork-client.ts      (Phase 8で活用)
│   │   ├── claude-api.ts         🆕 (Sophia・提案生成)
│   │   ├── inbox/                🆕
│   │   │   └── extract-urls.ts
│   │   ├── sophia/               🆕
│   │   │   ├── analyzer.ts
│   │   │   └── schemas.ts
│   │   ├── proposals/            🆕
│   │   │   ├── templates.ts
│   │   │   └── generator.ts
│   │   └── utils.ts
│   │
│   ├── types/
│   │   ├── inbox.ts             🆕
│   │   ├── sophia.ts            🆕
│   │   ├── proposals.ts         🆕
│   │   └── upwork.ts
│   │
│   └── __tests__/
│       ├── lib/
│       │   ├── inbox/
│       │   └── sophia/
│       └── api/
│
├── .claude/
│   └── plans/
│       └── IMPLEMENTATION_PLAN.md ✅ (このファイル)
│
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 実装優先順（最短で"回す"）

### Week 1:
- [ ] Phase 0: Prismaスキーマ更新 & migrate
- [ ] Phase 1: Inbox Ingest API完成

### Week 2:
- [ ] Phase 2: Inbox UI（2ペイン）完成

### Week 3:
- [ ] Phase 3: Sophia分析エンジン完成

### Week 4:
- [ ] Phase 4: Job分析UI & Sophia統合

### Week 5:
- [ ] Phase 5: A/Bテンプレ提案生成

### Week 6:
- [ ] Phase 6: Polish & 実運用確認

**6週間で実運用MVP完成 🎉**

---

## ✅ MVP v0.1 成功基準

- [ ] ユーザー登録（NextAuth）✓
- [ ] Inbox受信 & UI表示 ✓
- [ ] 案件カード化（Job作成）✓
- [ ] 案件分析UI（スコア・メモ）✓
- [ ] Sophia分析実行可能 ✓
- [ ] A/Bテンプレ提案生成 ✓
- [ ] 提案履歴保存 ✓
- [ ] Inbox → Job → 分析 → 提案の一本道が動作 ✓
- [ ] 実運用1週間で問題なし ✓

---

## 📋 MVP運用原則（安全・確実）

1. **UpWorkへの自動送信はしない** → 生成結果をコピペで手動送信
2. **SophiaのJSONは必ず保存** → 改善ループを資産化
3. **UI導線は迷わない** → Inbox → Job化 → 分析 → 提案
4. **日本語優先** → 初心者も迷わないUI
5. **実運用から逆算** → 机上の理想ではなく、毎日使えることが最優先

---

## 🔮 次フェーズの展望（Phase 7-12+）

### Phase 7: 自己分析・プロフィール最適化
- プロフィール投入 → Sophia分析 → 改善提案 → 最適化ビルダー

### Phase 8: UpWork API直接統合 & 自動同期
- GraphQL API で Job/Proposal/Contract 自動取得
- 30分ごと自動同期

### Phase 9-11: AI Agent群
- JobAgent: 自動スコアリング
- ProposalAgent: 提案サジェスト
- ContractAgent: 進捗アラート
- ClientAgent: 関係管理自動化

### Phase 12+: SaaS化
- マルチテナント対応
- 課金・サブスク
- 本番デプロイ（Vercel）
- アナリティクス・監視

---

## 💡 設計原則まとめ

| 観点 | MVP v0.1 | 理由 |
|------|----------|------|
| **最初のフロー** | Inbox → Job → 分析 → 提案 | 実務に最も即効性 |
| **Sophia統合** | 案件分析段階から | 提案の勝率向上 |
| **UpWork API** | 段階的（Phase 8で直接統合） | MVP段階では不要 |
| **テンプレ** | A/Bの2パターン | 実運用で区別明確 |
| **日本語** | UI全体 + 入力フォーム | 初心者UX重視 |
| **自動化** | 安全なコピペ運用 | 誤送信リスク排除 |
| **資産化** | Sophia JSON + Proposal JSON | 改善ループ永続化 |

---

## 📞 質問・判断点

1. **Inboxメール方式**: Postmark Inbound Webhook推奨 (Gmail OAuth不要・最速)
2. **Claude API**: 提案生成・Sophia分析用（独立したKey管理）
3. **実運用開始**: Phase 6完了後、実際に毎日使用テスト1週間

---

## 🎯 ゴール文

> 「6週間で、UpWork初心者が毎日使える、日本語の一本道を完成させる。
> Inboxから始まり、案件を分析し、Sophiaに相談して、英語提案を生成して、コピペで応募する。
> その過程を全て日本語で記録し、勝ち筋を資産として蓄積する。
> これが実運用で回ることで、次のAI Agent群やSaaS化への基盤ができる。」
