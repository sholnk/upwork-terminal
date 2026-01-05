# UpWork Freelance Management Web Service - 実装計画

## プロジェクト概要

UpWorkでのフリーランス活動を一元管理するWebサービス「**upwork-terminal**」。
プロフィール設定、案件リサーチ、提案管理、契約・進捗管理、クライアント管理、コネクト管理を含む包括的なプラットフォーム。

**プロジェクトディレクトリ**: `C:\Users\SH\Miyabi\upwork-terminal\` （新規作成）
**実装期間**: 17週間（9フェーズ）
**スコープ**: フル機能実装（MVP全機能 + Miyabi Agent統合 + 本番デプロイ）

**Miyabi統合**: 別ディレクトリで開発し、必要に応じてMCP/A2A経由で`my-miyabi-app`と連携

---

## 技術スタック

### Frontend & Backend
- **Next.js 15.1.4** (App Router with React Server Components)
- **TypeScript 5.7+** (strict mode)
- **Tailwind CSS 4** + shadcn/ui (UIコンポーネント)

### Database & ORM
- **PostgreSQL 16+** (本番用リレーショナルDB)
- **Prisma 6.2.1** (型安全ORM)

### 認証 & API
- **NextAuth.js 5** (OAuth2 for UpWork)
- **UpWork GraphQL API** (公式API統合)
- **Zod 4.2.1** (スキーマ検証 - 既存)

### 状態管理
- **React Server Components** (サーバーファーストデータ取得)
- **TanStack Query v5** (クライアント状態・キャッシング)
- **Zustand** (軽量クライアント状態)

### デプロイ
- **Vercel** (Next.js本番環境)
- **Railway or Supabase** (PostgreSQL)

---

## データベーススキーマ（Prisma）

### コアエンティティ

```prisma
// ユーザー & 認証
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  upworkUserId  String?   @unique
  accessToken   String?   @db.Text
  refreshToken  String?   @db.Text

  jobs          Job[]
  proposals     Proposal[]
  contracts     Contract[]
  clients       Client[]
  settings      UserSettings?
}

// ユーザー設定
model UserSettings {
  id                    String   @id @default(cuid())
  userId                String   @unique
  hourlyRate            Decimal? @db.Decimal(10, 2)
  skills                String[]
  autoSyncJobs          Boolean  @default(true)
  syncFrequencyMinutes  Int      @default(30)
}

// 案件（Job）
model Job {
  id              String      @id @default(cuid())
  upworkJobId     String      @unique
  title           String
  description     String      @db.Text
  skills          String[]
  budget          Decimal?    @db.Decimal(10, 2)
  budgetType      String?     // "hourly" | "fixed"
  postedAt        DateTime
  url             String

  userId          String
  user            User        @relation(fields: [userId], references: [id])

  saved           Boolean     @default(false)
  tags            String[]
  notes           String?     @db.Text
  rating          Int?        // 1-5

  proposals       Proposal[]
}

// 提案（Proposal）
model Proposal {
  id                String      @id @default(cuid())
  upworkProposalId  String?     @unique

  jobId             String
  job               Job         @relation(fields: [jobId], references: [id])
  userId            String
  user              User        @relation(fields: [userId], references: [id])

  coverLetter       String      @db.Text
  bidAmount         Decimal?    @db.Decimal(10, 2)
  connectsUsed      Int         @default(0)

  status            String      @default("draft") // draft | submitted | accepted | declined
  submittedAt       DateTime?
  clientViewed      Boolean     @default(false)

  contract          Contract?
}

// 提案テンプレート
model ProposalTemplate {
  id            String   @id @default(cuid())
  userId        String
  name          String
  content       String   @db.Text
  category      String?
  tags          String[]
}

// 契約（Contract）
model Contract {
  id                String      @id @default(cuid())
  upworkContractId  String      @unique

  proposalId        String      @unique
  proposal          Proposal    @relation(fields: [proposalId], references: [id])
  userId            String
  user              User        @relation(fields: [userId], references: [id])
  clientId          String
  client            Client      @relation(fields: [clientId], references: [id])

  title             String
  contractType      String      // "hourly" | "fixed"
  rate              Decimal?    @db.Decimal(10, 2)
  status            String      @default("active") // active | paused | completed
  startDate         DateTime
  totalEarned       Decimal     @default(0) @db.Decimal(10, 2)
  totalHours        Decimal     @default(0) @db.Decimal(10, 2)

  milestones        Milestone[]
  timesheets        Timesheet[]
}

// マイルストーン
model Milestone {
  id                String      @id @default(cuid())
  contractId        String
  contract          Contract    @relation(fields: [contractId], references: [id])

  title             String
  amount            Decimal     @db.Decimal(10, 2)
  dueDate           DateTime?
  status            String      @default("pending") // pending | submitted | approved | paid
}

// タイムシート
model Timesheet {
  id            String      @id @default(cuid())
  contractId    String
  contract      Contract    @relation(fields: [contractId], references: [id])

  date          DateTime    @db.Date
  hours         Decimal     @db.Decimal(5, 2)
  description   String?     @db.Text
  status        String      @default("pending")
}

// クライアント
model Client {
  id                String      @id @default(cuid())
  upworkClientId    String      @unique
  userId            String
  user              User        @relation(fields: [userId], references: [id])

  name              String
  company           String?
  location          String?
  totalSpent        Decimal?    @db.Decimal(12, 2)
  paymentVerified   Boolean     @default(false)
  rating            Decimal?    @db.Decimal(3, 2)

  tags              String[]
  notes             String?     @db.Text
  favorited         Boolean     @default(false)

  contracts         Contract[]
  communications    ClientCommunication[]
}

// クライアントとのコミュニケーション履歴
model ClientCommunication {
  id            String      @id @default(cuid())
  clientId      String
  client        Client      @relation(fields: [clientId], references: [id])

  type          String      // "message" | "call" | "meeting" | "note"
  subject       String?
  content       String      @db.Text
  communicatedAt DateTime   @default(now())
}

// 同期ログ
model SyncLog {
  id            String      @id @default(cuid())
  userId        String
  syncType      String      // "jobs" | "proposals" | "contracts" | "profile"
  status        String      // "success" | "partial" | "failed"
  recordsSynced Int         @default(0)
  startedAt     DateTime
  completedAt   DateTime?
}
```

---

## ディレクトリ構造

```
C:\Users\SH\Miyabi\
├── my-miyabi-app/              # 既存Miyabiフレームワーク
│   ├── .claude/
│   ├── src/
│   │   ├── a2a/                # A2A Protocol（upwork-terminalから利用可能）
│   │   ├── agents/
│   │   └── mcp/
│   └── ...
│
└── upwork-terminal/            # 新規プロジェクト（このプラン対象）
    ├── .next/                  # Next.jsビルド出力
    ├── node_modules/
    │
    ├── prisma/                 # データベーススキーマ
    │   ├── schema.prisma
    │   ├── migrations/
    │   └── seed.ts
    │
    ├── public/                 # 静的アセット
    │   └── images/
    │
    ├── src/
    │   ├── app/                # Next.js App Router
    │   │   ├── (auth)/
    │   │   │   ├── login/page.tsx
    │   │   │   └── callback/page.tsx   # OAuth callback
    │   │   │
    │   │   ├── (dashboard)/    # 保護されたダッシュボード
    │   │   │   ├── layout.tsx
    │   │   │   ├── page.tsx
    │   │   │   ├── jobs/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── [id]/page.tsx
    │   │   │   ├── proposals/
    │   │   │   │   ├── page.tsx
    │   │   │   │   ├── [id]/page.tsx
    │   │   │   │   └── new/page.tsx
    │   │   │   ├── contracts/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── [id]/
    │   │   │   │       ├── page.tsx
    │   │   │   │       ├── milestones/page.tsx
    │   │   │   │       └── timesheets/page.tsx
    │   │   │   ├── clients/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── [id]/page.tsx
    │   │   │   ├── profile/page.tsx
    │   │   │   └── settings/page.tsx
    │   │   │
    │   │   ├── api/            # API Routes
    │   │   │   ├── auth/[...nextauth]/route.ts
    │   │   │   ├── upwork/
    │   │   │   │   ├── jobs/route.ts
    │   │   │   │   ├── proposals/route.ts
    │   │   │   │   ├── contracts/route.ts
    │   │   │   │   └── sync/route.ts
    │   │   │   ├── agents/route.ts     # Miyabi Agent統合API
    │   │   │   └── webhooks/upwork/route.ts
    │   │   │
    │   │   ├── layout.tsx
    │   │   └── globals.css
    │   │
    │   ├── components/         # Reactコンポーネント
    │   │   ├── ui/             # shadcn/ui
    │   │   ├── jobs/
    │   │   │   ├── job-card.tsx
    │   │   │   ├── job-filters.tsx
    │   │   │   └── job-search.tsx
    │   │   ├── proposals/
    │   │   │   ├── proposal-form.tsx
    │   │   │   ├── proposal-stats.tsx
    │   │   │   └── template-selector.tsx
    │   │   ├── contracts/
    │   │   │   ├── contract-card.tsx
    │   │   │   ├── milestone-tracker.tsx
    │   │   │   └── timesheet-entry.tsx
    │   │   ├── clients/
    │   │   │   ├── client-card.tsx
    │   │   │   └── communication-history.tsx
    │   │   └── dashboard/
    │   │       ├── stats-card.tsx
    │   │       └── activity-feed.tsx
    │   │
    │   ├── lib/                # 共有ユーティリティ
    │   │   ├── auth.ts
    │   │   ├── prisma.ts
    │   │   ├── upwork-client.ts
    │   │   ├── sync/
    │   │   │   ├── jobs.ts
    │   │   │   ├── proposals.ts
    │   │   │   └── contracts.ts
    │   │   ├── miyabi-bridge.ts    # Miyabi A2A連携（オプション）
    │   │   ├── utils.ts
    │   │   └── constants.ts
    │   │
    │   ├── hooks/              # Reactフック
    │   │   ├── use-jobs.ts
    │   │   ├── use-proposals.ts
    │   │   ├── use-contracts.ts
    │   │   └── use-sync.ts
    │   │
    │   ├── agents/             # UpWork専用Agent（Miyabi連携用）
    │   │   ├── job-agent.ts
    │   │   ├── proposal-agent.ts
    │   │   ├── contract-agent.ts
    │   │   └── client-agent.ts
    │   │
    │   ├── types/              # 型定義
    │   │   ├── upwork.ts
    │   │   ├── database.ts
    │   │   └── index.ts
    │   │
    │   └── __tests__/          # テスト
    │       ├── lib/
    │       ├── agents/
    │       ├── api/
    │       └── components/
    │
    ├── tests/                  # E2Eテスト
    │   └── e2e/
    │       ├── jobs.spec.ts
    │       ├── proposals.spec.ts
    │       └── contracts.spec.ts
    │
    ├── .env.local              # ローカル環境変数
    ├── .env.example
    ├── .gitignore
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── components.json
    ├── tsconfig.json
    ├── playwright.config.ts
    ├── package.json
    ├── package-lock.json
    └── README.md
├── prisma/                          # 新規: データベース
│   ├── schema.prisma                # スキーマ定義
│   ├── migrations/                  # マイグレーション履歴
│   └── seed.ts                      # 初期データ
│
├── public/                          # 新規: 静的アセット
│   └── images/
│
├── src/
│   ├── app/                         # 新規: Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── callback/page.tsx   # OAuth callback
│   │   │
│   │   ├── (dashboard)/            # 保護されたダッシュボード
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # ダッシュボードホーム
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx        # 案件検索・保存
│   │   │   │   └── [id]/page.tsx   # 案件詳細
│   │   │   ├── proposals/
│   │   │   │   ├── page.tsx        # 提案一覧
│   │   │   │   ├── [id]/page.tsx   # 提案詳細
│   │   │   │   └── new/page.tsx    # 提案作成
│   │   │   ├── contracts/
│   │   │   │   ├── page.tsx        # 契約一覧
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # 契約ダッシュボード
│   │   │   │       ├── milestones/
│   │   │   │       └── timesheets/
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx        # クライアント一覧
│   │   │   │   └── [id]/page.tsx   # クライアント詳細
│   │   │   ├── profile/page.tsx    # プロフィール管理
│   │   │   └── settings/page.tsx   # 設定
│   │   │
│   │   ├── api/                    # API Routes
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── upwork/
│   │   │   │   ├── jobs/route.ts
│   │   │   │   ├── proposals/route.ts
│   │   │   │   ├── contracts/route.ts
│   │   │   │   └── sync/route.ts
│   │   │   ├── agents/route.ts     # Agent実行API
│   │   │   └── webhooks/upwork/route.ts
│   │   │
│   │   ├── layout.tsx              # ルートレイアウト
│   │   └── globals.css
│   │
│   ├── components/                 # 新規: Reactコンポーネント
│   │   ├── ui/                     # shadcn/ui
│   │   ├── jobs/
│   │   │   ├── job-card.tsx
│   │   │   ├── job-filters.tsx
│   │   │   └── job-search.tsx
│   │   ├── proposals/
│   │   │   ├── proposal-form.tsx
│   │   │   ├── proposal-stats.tsx
│   │   │   └── template-selector.tsx
│   │   ├── contracts/
│   │   │   ├── contract-card.tsx
│   │   │   ├── milestone-tracker.tsx
│   │   │   └── timesheet-entry.tsx
│   │   ├── clients/
│   │   │   ├── client-card.tsx
│   │   │   └── communication-history.tsx
│   │   └── dashboard/
│   │       ├── stats-card.tsx
│   │       └── activity-feed.tsx
│   │
│   ├── lib/                        # 新規: 共有ユーティリティ
│   │   ├── auth.ts                 # NextAuth設定
│   │   ├── prisma.ts               # Prismaクライアント
│   │   ├── upwork-client.ts        # UpWork APIクライアント
│   │   ├── sync/
│   │   │   ├── jobs.ts
│   │   │   ├── proposals.ts
│   │   │   └── contracts.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   │
│   ├── hooks/                      # 新規: Reactフック
│   │   ├── use-jobs.ts
│   │   ├── use-proposals.ts
│   │   ├── use-contracts.ts
│   │   └── use-sync.ts
│   │
│   ├── agents/upwork/              # 新規: UpWork専用Agent
│   │   ├── job-agent.ts            # 案件リサーチ自動化
│   │   ├── proposal-agent.ts       # 提案最適化
│   │   ├── contract-agent.ts       # 契約ライフサイクル管理
│   │   └── client-agent.ts         # クライアント関係自動化
│   │
│   ├── types/
│   │   ├── upwork.ts               # 新規: UpWork API型定義
│   │   └── database.ts             # 新規: Prisma生成型
│   │
│   └── generated/prisma/           # 新規: 生成コード
│
├── next.config.ts                  # 新規: Next.js設定
├── tailwind.config.ts              # 新規: Tailwind設定
├── components.json                 # 新規: shadcn/ui設定
└── tsconfig.json                   # 更新: Next.js対応
```

---

## 実装フェーズ（17週間）

### Phase 1: 基盤構築 (Week 1-2)

**目標**: Next.js、DB、認証のセットアップ

**タスク**:
1. Next.js 15インストール・設定
2. Tailwind CSS + shadcn/ui導入
3. PostgreSQLとPrismaセットアップ
4. 初期マイグレーション実行
5. NextAuth.js設定（UpWork OAuth2）
6. ログイン・コールバックページ作成

**成果物**:
- 動作するNext.jsアプリ + 認証
- DB接続完了
- UpWork OAuthでログイン可能

**プロジェクトディレクトリ作成**:
```bash
cd C:\Users\SH\Miyabi
mkdir upwork-terminal
cd upwork-terminal
```

**Critical Files**:
- `upwork-terminal/prisma/schema.prisma`
- `src/lib/auth.ts`
- `src/lib/prisma.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/callback/page.tsx`
- `next.config.ts`
- `tailwind.config.ts`
- `components.json`

---

### Phase 2: 案件リサーチ & 保存 (Week 3-4)

**目標**: MVP案件検索・ブックマーク機能

**タスク**:
1. UpWork APIクライアント作成（GraphQL）
2. レート制限・エラーハンドリング実装
3. Zodスキーマでバリデーション
4. 案件検索ページ（フィルタ付き）
5. 案件カードコンポーネント
6. 保存・タグ・メモ機能
7. 手動 & 自動同期（30分ごと）

**成果物**:
- 機能的な案件検索
- 案件保存・タグ付け
- UpWork APIからの自動同期

**Critical Files** (全て`upwork-terminal/`配下):
- `src/lib/upwork-client.ts`
- `src/lib/sync/jobs.ts`
- `src/app/(dashboard)/jobs/page.tsx`
- `src/app/(dashboard)/jobs/[id]/page.tsx`
- `src/app/api/upwork/jobs/route.ts`
- `src/app/api/upwork/sync/route.ts`
- `src/components/jobs/job-card.tsx`
- `src/components/jobs/job-search.tsx`
- `src/components/jobs/job-filters.tsx`
- `src/hooks/use-jobs.ts`
- `src/types/upwork.ts`

---

### Phase 3: 提案管理 (Week 5-6)

**目標**: 提案追跡とコネクト使用量管理

**タスク**:
1. 提案CRUD実装
2. 案件との紐付け
3. コネクト使用量計算
4. 下書き保存機能
5. テンプレートシステム（CRUD）
6. テンプレート変数（案件名、クライアント名等）
7. 分析ダッシュボード（返信率、コネクト使用チャート）

**成果物**:
- 提案作成・追跡
- テンプレートシステム
- コネクト使用ダッシュボード

**Critical Files** (全て`upwork-terminal/`配下):
- `src/app/(dashboard)/proposals/page.tsx`
- `src/app/(dashboard)/proposals/[id]/page.tsx`
- `src/app/(dashboard)/proposals/new/page.tsx`
- `src/app/api/upwork/proposals/route.ts`
- `src/components/proposals/proposal-form.tsx`
- `src/components/proposals/proposal-stats.tsx`
- `src/components/proposals/template-selector.tsx`
- `src/hooks/use-proposals.ts`
- `src/lib/sync/proposals.ts`

---

### Phase 4: 契約管理 (Week 7-8)

**目標**: アクティブ契約とマイルストーン管理

**タスク**:
1. 契約ダッシュボード（アクティブ・過去）
2. 契約詳細ページ
3. 契約と提案の紐付け
4. マイルストーン表示・追跡
5. マイルストーンステータス管理
6. タイムシート記録（日次）
7. 手動時間入力
8. 週次サマリー

**成果物**:
- 契約ダッシュボード
- マイルストーントラッカー
- タイムシート管理

**Critical Files** (全て`upwork-terminal/`配下):
- `src/app/(dashboard)/contracts/page.tsx`
- `src/app/(dashboard)/contracts/[id]/page.tsx`
- `src/app/(dashboard)/contracts/[id]/milestones/page.tsx`
- `src/app/(dashboard)/contracts/[id]/timesheets/page.tsx`
- `src/app/api/upwork/contracts/route.ts`
- `src/components/contracts/contract-card.tsx`
- `src/components/contracts/milestone-tracker.tsx`
- `src/components/contracts/timesheet-entry.tsx`
- `src/hooks/use-contracts.ts`
- `src/lib/sync/contracts.ts`

---

### Phase 5: クライアント管理 (Week 9-10)

**目標**: クライアント関係追跡

**タスク**:
1. 契約からクライアント自動作成
2. クライアント詳細ページ
3. クライアント指標（総支払額、採用数）
4. コミュニケーション履歴ログ
5. メモ・タグ機能
6. お気に入りクライアント
7. リピートクライアント特定
8. クライアント満足度追跡

**成果物**:
- クライアント管理システム
- コミュニケーションログ
- リピートクライアント追跡

**Critical Files** (全て`upwork-terminal/`配下):
- `src/app/(dashboard)/clients/page.tsx`
- `src/app/(dashboard)/clients/[id]/page.tsx`
- `src/app/api/upwork/clients/route.ts`
- `src/components/clients/client-card.tsx`
- `src/components/clients/communication-history.tsx`
- `src/hooks/use-clients.ts`

---

### Phase 6: プロフィール管理 (Week 11)

**目標**: UpWorkプロフィール設定管理

**タスク**:
1. プロフィール表示
2. スキル・レート・稼働状況
3. プロフィールデータ同期
4. 通知設定
5. 自動同期設定
6. コネクトアラート

**成果物**:
- プロフィール管理
- ユーザー設定

**Critical Files** (全て`upwork-terminal/`配下):
- `src/app/(dashboard)/profile/page.tsx`
- `src/app/(dashboard)/settings/page.tsx`
- `src/app/api/upwork/profile/route.ts`

---

### Phase 7: Miyabi Agent統合 (Week 12-14)

**目標**: UpWork専用自律エージェント作成

**タスク**:

#### 7.1 JobAgent（案件エージェント）
- ユーザー条件に合致する案件を自動検索
- 案件スコアリング（スキルマッチ、予算、クライアント品質）
- 高スコア案件のGitHub Issue自動作成
- CoordinatorAgentとA2A通信

#### 7.2 ProposalAgent（提案エージェント）
- テンプレートを使った提案自動下書き
- 提案改善提案
- 提案パフォーマンス追跡
- クライアント返信アラート

#### 7.3 ContractAgent（契約エージェント）
- 契約期限監視
- マイルストーン期日アラート
- 自動タイムシートログ（外部トラッキング連携時）
- 週次レポート生成

#### 7.4 ClientAgent（クライアントエージェント）
- クライアントコミュニケーションパターン追跡
- リピートクライアントへのフォローアップ提案
- クライアント満足度レポート生成

**Agent統合パターン** (オプション - Miyabi連携時):
```typescript
// ../my-miyabi-app の A2AAdapter を活用（必要に応じて）
// または、upwork-terminal内で独自のAgent実装も可能

// Option 1: Miyabi A2A連携
import { A2AClient } from '../../my-miyabi-app/src/a2a/client';

export class JobAgent {
  private a2aClient: A2AClient;

  async executeTask(task: UpWorkTask) {
    // 案件検索 → スコアリング → 通知
    await this.a2aClient.sendTask('CoordinatorAgent', {
      id: task.id,
      type: 'job-research',
      status: 'done',
      ...
    });
  }
}

// Option 2: 独立したAgent実装（Miyabi連携なし）
export class JobAgent {
  async executeTask(task: UpWorkTask) {
    // UpWork案件を検索・スコアリング
    // 結果をDBに保存、通知を送信
  }
}
```

**成果物**:
- 4つのUpWork専用Agent
- CoordinatorAgentとのA2A統合
- 自動案件リサーチ・提案最適化

**Critical Files** (全て`upwork-terminal/`配下):
- `src/agents/job-agent.ts`
- `src/agents/proposal-agent.ts`
- `src/agents/contract-agent.ts`
- `src/agents/client-agent.ts`
- `src/lib/miyabi-bridge.ts` （Miyabi連携用、オプション）
- `src/app/api/agents/route.ts`

**GitHub Actions統合** (オプション - upwork-terminal/.github/workflows/):
- `.github/workflows/upwork-job-saved.yml`
- `.github/workflows/upwork-proposal-review.yml`
- `.github/workflows/upwork-contract-alert.yml`

**または、既存my-miyabi-appのGitHub Actionsから呼び出す方法もあり**

---

### Phase 8: テスト & 洗練 (Week 15-16)

**目標**: 本番レベル品質

**タスク**:
1. **テスト**
   - ユニットテスト（APIクライアント）
   - 統合テスト（同期ロジック）
   - E2Eテスト（Playwright）
   - Agentテスト

2. **パフォーマンス**
   - DBクエリ最適化
   - キャッシング（必要に応じてRedis）
   - 画像最適化

3. **UI/UX洗練**
   - レスポンシブデザイン
   - ローディング状態
   - エラーバウンダリ
   - アクセシビリティ監査

4. **ドキュメント**
   - APIドキュメント
   - ユーザーガイド
   - Agent設定ガイド

**成果物**:
- 80%+テストカバレッジ
- パフォーマンス最適化
- 本番準備完了

**Critical Files** (全て`upwork-terminal/`配下):
- `src/__tests__/lib/upwork-client.test.ts`
- `src/__tests__/lib/sync/jobs.test.ts`
- `src/__tests__/agents/job-agent.test.ts`
- `tests/e2e/jobs.spec.ts`
- `tests/e2e/proposals.spec.ts`
- `playwright.config.ts`

---

### Phase 9: デプロイ (Week 17)

**目標**: 本番環境へデプロイ

**タスク**:
1. **インフラ**
   - Railway/SupabaseでPostgreSQL構築
   - 環境変数設定
   - Vercelデプロイ設定

2. **CI/CD**
   - Next.js用GitHub Actions追加
   - DBマイグレーションワークフロー
   - 自動テストパイプライン

3. **監視**
   - エラートラッキング（Sentry）
   - アナリティクス（Vercel Analytics）
   - 稼働監視

**成果物**:
- 本番デプロイ完了
- 監視体制整備
- CI/CDパイプライン稼働

**Critical Files** (全て`upwork-terminal/`配下):
- `.github/workflows/nextjs-deploy.yml`
- `.github/workflows/prisma-migrate.yml`
- `vercel.json`
- `.env.production`

---

## Critical Files Summary

### 新規作成が必要な主要ファイル

**設定ファイル（6個）** - 全て`upwork-terminal/`配下:
- `prisma/schema.prisma` - データベーススキーマ
- `next.config.ts` - Next.js設定
- `tailwind.config.ts` - Tailwind設定
- `components.json` - shadcn/ui設定
- `playwright.config.ts` - E2Eテスト設定
- `vercel.json` - Vercelデプロイ設定

**コアライブラリ（5個）** - 全て`upwork-terminal/src/lib/`配下:
- `auth.ts` - NextAuth.js設定
- `prisma.ts` - Prismaクライアントシングルトン
- `upwork-client.ts` - UpWork APIクライアント
- `utils.ts` - 共有ユーティリティ
- `miyabi-bridge.ts` - Miyabi連携用（オプション）

**同期ロジック（3個）** - 全て`upwork-terminal/src/lib/sync/`配下:
- `jobs.ts` - 案件同期
- `proposals.ts` - 提案同期
- `contracts.ts` - 契約同期

**Agentファイル（4個）** - 全て`upwork-terminal/src/agents/`配下:
- `job-agent.ts`
- `proposal-agent.ts`
- `contract-agent.ts`
- `client-agent.ts`

**Next.js ページ（15+個）** - 全て`upwork-terminal/src/app/`配下:
- 認証: `(auth)/login/page.tsx`, `(auth)/callback/page.tsx`
- ダッシュボード: `(dashboard)/page.tsx`
- 案件: `(dashboard)/jobs/page.tsx`, `jobs/[id]/page.tsx`
- 提案: `(dashboard)/proposals/page.tsx`, `proposals/[id]/page.tsx`, `proposals/new/page.tsx`
- 契約: `(dashboard)/contracts/page.tsx`, `contracts/[id]/page.tsx`, `milestones/`, `timesheets/`
- クライアント: `(dashboard)/clients/page.tsx`, `clients/[id]/page.tsx`
- 設定: `(dashboard)/profile/page.tsx`, `settings/page.tsx`

**API Routes（6個）** - 全て`upwork-terminal/src/app/api/`配下:
- `auth/[...nextauth]/route.ts`
- `upwork/jobs/route.ts`
- `upwork/proposals/route.ts`
- `upwork/contracts/route.ts`
- `upwork/sync/route.ts`
- `agents/route.ts`

**Reactコンポーネント（20+個）** - 全て`upwork-terminal/src/components/`配下:
- UI: `ui/` (shadcn/ui)
- 案件: `jobs/job-card.tsx`, `jobs/job-search.tsx`, `jobs/job-filters.tsx`
- 提案: `proposals/proposal-form.tsx`, `proposals/proposal-stats.tsx`, `proposals/template-selector.tsx`
- 契約: `contracts/contract-card.tsx`, `contracts/milestone-tracker.tsx`, `contracts/timesheet-entry.tsx`
- クライアント: `clients/client-card.tsx`, `clients/communication-history.tsx`
- ダッシュボード: `dashboard/stats-card.tsx`, `dashboard/activity-feed.tsx`

**カスタムフック（4個）** - 全て`upwork-terminal/src/hooks/`配下:
- `use-jobs.ts`
- `use-proposals.ts`
- `use-contracts.ts`
- `use-sync.ts`

**型定義（2個）** - 全て`upwork-terminal/src/types/`配下:
- `upwork.ts` - UpWork API型
- `database.ts` - Prisma生成型

### 新規作成: package.json

**upwork-terminal/package.json**:
追加する主な依存関係:
```json
{
  "dependencies": {
    "next": "^15.1.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@prisma/client": "^6.2.1",
    "next-auth": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "graphql": "^16.0.0",
    "graphql-request": "^7.0.0",
    "tailwindcss": "^4.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "prisma": "^6.2.1",
    "@playwright/test": "^1.40.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

**upwork-terminal/tsconfig.json**:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@a2a/*": ["src/a2a/*"],
      "@agents/*": ["src/agents/*"],
      "@types/*": ["src/types/*"],
      "@mcp/*": ["src/mcp/*"]
    },
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "src/**/*", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**upwork-terminal/.env.example**:
```bash
# UpWork API
UPWORK_CLIENT_ID=your_upwork_client_id
UPWORK_CLIENT_SECRET=your_upwork_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/upwork_manager

# 既存
GITHUB_TOKEN=ghp_xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

---

## UpWork API統合戦略

### OAuth2認証フロー

1. ユーザーが「UpWorkでログイン」をクリック
2. UpWork認証ページへリダイレクト
3. ユーザーが承認
4. コールバックURLでトークン受信
5. アクセストークン・リフレッシュトークンをDBに保存
6. UpWork GraphQL APIでデータ取得開始

### 主要APIエンドポイント

**Jobs（案件）**:
- `jobs(input: JobSearchInput)` - 案件検索（フィルタ付き）
- `job(id: ID!)` - 案件詳細取得

**Proposals（提案）**:
- `proposals(userId: ID!)` - ユーザーの提案一覧
- `submitProposal(input: SubmitProposalInput!)` - 提案送信
- `withdrawProposal(id: ID!)` - 提案撤回

**Contracts（契約）**:
- `contracts(userId: ID!)` - 契約一覧
- `contract(id: ID!)` - 契約詳細（マイルストーン・タイムシート含む）
- `submitMilestone(input: MilestoneInput!)` - マイルストーン提出
- `addTimesheet(input: TimesheetInput!)` - 時間ログ

**Profile（プロフィール）**:
- `user(id: ID!)` - ユーザープロフィール取得
- `updateProfile(input: ProfileInput!)` - プロフィール更新

### レート制限

- **制限**: 約100リクエスト/分 (OAuthトークンあたり)
- **戦略**:
  - 非重要データは5-15分ごとにポーリング
  - キャッシング活用（TanStack Query）
  - バックグラウンド同期（Vercel Cron or BullMQ）

### データ同期戦略

1. **手動同期**: ユーザーが「同期」ボタンクリック
2. **自動同期**: ユーザー設定に基づき30分ごと（デフォルト）
3. **バックグラウンドジョブ**: Vercel Cronで全ユーザーの定期同期
4. **Webhook**: UpWork側でWebhookサポートがあれば即時同期

---

## Miyabi Agent統合アーキテクチャ

### Miyabi連携（オプション）

**Option 1: A2A Protocol活用**

`../my-miyabi-app/src/a2a/client.ts`を使用:

```typescript
// upwork-terminal/src/lib/miyabi-bridge.ts
import { A2AClient } from '../../../my-miyabi-app/src/a2a/client';

export class MiyabiBridge {
  private client: A2AClient;

  constructor() {
    this.client = new A2AClient({
      baseUrl: 'http://localhost:3001', // my-miyabi-app のポート
    });
  }

  async notifyJobFound(job: UpWorkJob) {
    await this.client.sendTask('CoordinatorAgent', {
      id: `upwork-job-${job.id}`,
      title: `新規案件: ${job.title}`,
      description: job.description,
      type: 'job-research',
      status: 'pending',
      metadata: { upworkJobId: job.upworkJobId },
    });
  }
}
```

**Option 2: 完全独立**

Miyabi連携なしで、upwork-terminal独自のAgent実装。
必要に応じて後からMCP経由で連携を追加可能。

### GitHub Issuesとの連携

- **高スコア案件** → GitHub Issue自動作成（レビュー用）
- **提案下書き** → GitHub PR作成（ReviewAgent品質チェック）
- **契約期限アラート** → GitHub Issue作成（通知）

### Agent通信フロー

```
ユーザーアクション（案件保存）
  ↓
JobAgent（スコアリング・分析）
  ↓ (A2A Protocol)
CoordinatorAgent（DAG作成）
  ↓
ProposalAgent（提案下書き）
  ↓ (A2A Protocol)
ReviewAgent（品質チェック: 80点以上で次へ）
  ↓
PRAgent（GitHub PR作成 - レビュー用）
  ↓
ユーザーレビュー & 承認
  ↓
ProposalAgent（UpWorkへ送信）
```

### イベント駆動アーキテクチャ

GitHub Actions webhookでAgent起動:

```yaml
# .github/workflows/upwork-job-saved.yml
name: UpWork Job Saved

on:
  repository_dispatch:
    types: [upwork_job_saved]

jobs:
  analyze-job:
    runs-on: ubuntu-latest
    steps:
      - name: Run JobAgent
        run: npm run agent:job -- --jobId=${{ github.event.client_payload.jobId }}
```

---

## 環境変数（必須）

```bash
# UpWork API（Phase 1で取得）
UPWORK_CLIENT_ID=your_upwork_client_id
UPWORK_CLIENT_SECRET=your_upwork_client_secret

# NextAuth.js（Phase 1で生成）
NEXTAUTH_URL=http://localhost:3000  # 本番: https://your-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret  # openssl rand -base64 32

# Database（Phase 1でセットアップ）
DATABASE_URL=postgresql://user:password@localhost:5432/upwork_manager

# 既存（Miyabi）
GITHUB_TOKEN=ghp_xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

---

## 次のステップ（実装開始前）

### 前提条件

1. **UpWork API認証情報取得**
   - UpWorkデベロッパーポータルでAPI申請
   - Client ID / Client Secret取得
   - OAuth2リダイレクトURL設定

2. **PostgreSQLセットアップ**
   - オプション1: Railway ($5/月スターター)
   - オプション2: Supabase (無料プランあり)
   - オプション3: ローカルPostgreSQL（開発用）

3. **Vercelアカウント準備**（デプロイ用）

### Phase 1開始時の初期コマンド

```bash
# プロジェクトディレクトリ作成
cd C:\Users\SH\Miyabi
mkdir upwork-terminal
cd upwork-terminal

# Next.js初期化
npx create-next-app@latest . --typescript --tailwind --app --src-dir

# Prisma初期化
npm install prisma @prisma/client
npx prisma init

# shadcn/ui初期化
npx shadcn@latest init

# NextAuth.js
npm install next-auth

# その他依存関係
npm install @tanstack/react-query zustand graphql graphql-request zod
npm install -D @playwright/test

# Gitリポジトリ初期化
git init
git add .
git commit -m "Initial commit: upwork-terminal project"
```

---

## デプロイ構成

**推奨構成**: Vercel (Next.js) + Railway/Supabase (PostgreSQL)

**理由**:
- VercelはNext.jsネイティブプラットフォーム（自動デプロイ、Edge Functions、ゼロ設定）
- RailwayまたはSupabaseは簡単PostgreSQLセットアップ
- 無料枠でMVPスタート可能

**代替**: 自己ホスト（Docker Compose）
- より多くの制御だが、メンテナンス負担増

---

## 成功指標

- [ ] 全5つのMVP機能が動作（Profile、Job、Proposal、Contract、Client管理）
- [ ] UpWork APIとの双方向同期が安定動作
- [ ] 4つのMiyabi Agentが自律実行
- [ ] 80%+テストカバレッジ達成
- [ ] Vercel本番環境デプロイ完了
- [ ] ユーザーがUpWorkの全活動を1か所で管理可能

---

## リスクと対策

**リスク1**: UpWork API制限・変更
- **対策**: API抽象化レイヤー作成、エラーハンドリング徹底、手動入力バックアップ

**リスク2**: レート制限超過
- **対策**: キャッシング、ポーリング間隔調整、優先度ベース同期

**リスク3**: Agent統合の複雑さ
- **対策**: 段階的実装（Phase 7）、既存A2A Adapterパターン活用

**リスク4**: データ整合性
- **対策**: Prismaトランザクション、同期ログ記録、ロールバック機能

---

## 結論

この計画は、**新規ディレクトリ`upwork-terminal`**で独立したプロジェクトとして、
最新のNext.js 15 + Prisma + PostgreSQLスタックで本番レベルのUpWork管理Webサービスを構築します。

17週間で、**プロフィール管理、案件リサーチ、提案管理、契約・進捗管理、クライアント管理**の全機能と、
**4つの自律Agentによる自動化**を実現し、本番デプロイまで完了します。

**Miyabi連携**: 必要に応じて、`../my-miyabi-app`のA2A ProtocolやMCP経由で連携可能（オプション）。
まずは独立したプロジェクトとして構築し、後から統合を検討することも可能。

**プロジェクト構造**:
```
C:\Users\SH\Miyabi\
├── my-miyabi-app/      # 既存Miyabiフレームワーク
└── upwork-terminal/    # 新規UpWork管理サービス（このプラン）
```

**Let's build it! 🚀**
