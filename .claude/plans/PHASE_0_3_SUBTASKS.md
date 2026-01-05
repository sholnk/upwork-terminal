# Phase 0-3 詳細サブタスク分割リプラン（フルリビルド対応）

**目的**: Phase 0-3 を完全にサブタスク化し、他のプロジェクトでもリビルド可能にする

---

## Phase 0: Prismaスキーマ & データベース マイグレーション

### 0.1 Prismaプロジェクト初期化
**ゴール**: Prismaの基本セットアップ完了

**サブタスク**:
- [ ] 0.1.1 Prismaをインストール
  ```bash
  npm install prisma @prisma/client
  npx prisma init
  ```
  - ファイル: `prisma/schema.prisma` 自動生成
  - ファイル: `.env` 自動生成

- [ ] 0.1.2 prisma.config.ts 作成
  - ファイル: `prisma.config.ts`
  - datasource に DATABASE_URL を指定
  ```ts
  import "dotenv/config";
  import { defineConfig } from "prisma/config";

  export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
      url: process.env["DATABASE_URL"],
    },
  });
  ```

- [ ] 0.1.3 データベース接続確認
  ```bash
  npx prisma db push --skip-generate
  ```
  - PostgreSQLへの接続確認
  - エラーが出た場合は DATABASE_URL を修正

**成果物**: Prismaが PostgreSQL に接続可能

---

### 0.2 Enumsの定義
**ゴール**: 列挙型を schema.prisma に追加

**サブタスク**:
- [ ] 0.2.1 ProfileSource Enum
  ```prisma
  enum ProfileSource {
    paste
    file
    upwork_api
  }
  ```

- [ ] 0.2.2 SophiaTargetType Enum
  ```prisma
  enum SophiaTargetType {
    profile
    job
    proposal
  }
  ```

- [ ] 0.2.3 InboxProvider Enum
  ```prisma
  enum InboxProvider {
    gmail
    forwarded_email
    manual
  }
  ```

- [ ] 0.2.4 InboxStatus Enum
  ```prisma
  enum InboxStatus {
    new
    processed
    ignored
  }
  ```

- [ ] 0.2.5 InboxExtractType Enum
  ```prisma
  enum InboxExtractType {
    job_link
    text_extract
  }
  ```

- [ ] 0.2.6 JobSource Enum
  ```prisma
  enum JobSource {
    upwork
    inbox
    manual
  }
  ```

- [ ] 0.2.7 ProposalTemplateType Enum
  ```prisma
  enum ProposalTemplateType {
    A_short_deliverable
    B_audit_then_build
  }
  ```

**成果物**: 7つの Enum が定義される

---

### 0.3 ProfileSnapshot モデル追加
**ゴール**: プロフィール原文を保存するモデル

**サブタスク**:
- [ ] 0.3.1 ProfileSnapshot モデル定義
  ```prisma
  model ProfileSnapshot {
    id                  String        @id @default(cuid())
    userId              String
    user                User          @relation(fields: [userId], references: [id], onDelete: Cascade)

    source              ProfileSource
    rawProfileText      String        @db.Text
    intentMemoJa        String?       @db.Text
    portfolios          Json?
    firstMonthStrategy  String?
    englishConfidence   Int?

    createdAt           DateTime      @default(now())
    updatedAt           DateTime      @updatedAt

    @@index([userId])
    @@map("profile_snapshots")
  }
  ```

- [ ] 0.3.2 User モデルに profileSnapshots リレーション追加
  ```prisma
  profileSnapshots  ProfileSnapshot[]
  ```

**成果物**: ProfileSnapshot モデル完成

---

### 0.4 SophiaReport モデル追加
**ゴール**: Sophia分析結果を JSON で保存

**サブタスク**:
- [ ] 0.4.1 SophiaReport モデル定義
  ```prisma
  model SophiaReport {
    id                String          @id @default(cuid())
    userId            String
    user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)

    targetType        SophiaTargetType
    targetId          String
    userAnswerJa      String?         @db.Text

    qMetaJson         Json
    fUltimateJson     Json
    artifactsJson     Json

    isValid           Boolean         @default(true)
    rawResponse       Json?
    retryCount        Int             @default(0)

    createdAt         DateTime        @default(now())
    updatedAt         DateTime        @updatedAt

    @@index([userId])
    @@index([targetType])
    @@index([createdAt])
    @@map("sophia_reports")
  }
  ```

- [ ] 0.4.2 User モデルに sophiaReports リレーション追加
  ```prisma
  sophiaReports     SophiaReport[]
  ```

**成果物**: SophiaReport モデル完成

---

### 0.5 Inbox モデル追加
**ゴール**: メール受信とURL抽出を管理

**サブタスク**:
- [ ] 0.5.1 InboxMessage モデル定義
  ```prisma
  model InboxMessage {
    id                String        @id @default(cuid())
    userId            String
    user              User          @relation(fields: [userId], references: [id], onDelete: Cascade)

    provider          InboxProvider
    from              String
    subject           String
    snippet           String?       @db.Text
    rawBodyText       String?       @db.Text
    receivedAt        DateTime
    status            InboxStatus   @default(new)
    createdJobId      String?

    extracts          InboxExtract[]

    createdAt         DateTime      @default(now())
    updatedAt         DateTime      @updatedAt

    @@index([userId])
    @@index([status])
    @@index([receivedAt])
    @@map("inbox_messages")
  }
  ```

- [ ] 0.5.2 InboxExtract モデル定義
  ```prisma
  model InboxExtract {
    id                String          @id @default(cuid())
    messageId         String
    message           InboxMessage    @relation(fields: [messageId], references: [id], onDelete: Cascade)

    type              InboxExtractType
    payloadJson       Json

    createdAt         DateTime        @default(now())

    @@index([messageId])
    @@map("inbox_extracts")
  }
  ```

- [ ] 0.5.3 User モデルに inboxMessages リレーション追加
  ```prisma
  inboxMessages     InboxMessage[]
  ```

**成果物**: InboxMessage & InboxExtract モデル完成

---

### 0.6 既存モデル (Job, Proposal) を拡張
**ゴール**: Job と Proposal に新フィールドを追加

**サブタスク**:
- [ ] 0.6.1 Job モデル拡張
  ```prisma
  source                    JobSource   @default(upwork)
  createdFromInboxMessageId String?
  analysisJson              Json?
  ```

- [ ] 0.6.2 Proposal モデル拡張
  ```prisma
  templateType              ProposalTemplateType?
  inputJson                 Json?
  ```

**成果物**: Job & Proposal の拡張フィールド追加

---

### 0.7 Prisma マイグレーション実行
**ゴール**: スキーマをデータベースに反映

**サブタスク**:
- [ ] 0.7.1 マイグレーション作成
  ```bash
  npx prisma migrate dev --name add_sophia_inbox_profiles
  ```
  - `prisma/migrations/[timestamp]_add_sophia_inbox_profiles/migration.sql` 生成

- [ ] 0.7.2 migration.sql の内容確認
  - Enum 作成コマンド（7つ）
  - テーブル作成コマンド
  - インデックス作成
  - 外部キー制約

- [ ] 0.7.3 Prisma Client 再生成
  ```bash
  npx prisma generate
  ```
  - `node_modules/@prisma/client` 更新

- [ ] 0.7.4 マイグレーション動作確認
  ```bash
  npx prisma db push
  ```

**成果物**: スキーマが本番DB に反映される

---

## Phase 1: Inbox Ingest & API

### 1.1 Zod スキーマ定義
**ゴール**: Inbox API のリクエスト・レスポンス形式を定義

**サブタスク**:
- [ ] 1.1.1 ファイル作成
  - ファイル: `src/lib/schemas/inbox.ts`

- [ ] 1.1.2 InboxIngestSchema（Webhook受信用）
  ```ts
  export const InboxIngestSchema = z.object({
    from: z.string().email(),
    subject: z.string(),
    snippet: z.string().optional(),
    rawBodyText: z.string(),
    receivedAt: z.string().datetime().or(z.date()),
    provider: z.enum(["gmail", "forwarded_email", "manual"]),
  });
  ```

- [ ] 1.1.3 InboxMessageSchema（レスポンス用）
  ```ts
  export const InboxMessageSchema = z.object({
    id: z.string(),
    userId: z.string(),
    from: z.string(),
    subject: z.string(),
    snippet: z.string().nullable(),
    status: z.enum(["new", "processed", "ignored"]),
    receivedAt: z.date(),
    extracts: z.array(z.object({
      id: z.string(),
      type: z.enum(["job_link", "text_extract"]),
      payloadJson: z.record(z.any()),
    })),
    // ... other fields
  });
  ```

- [ ] 1.1.4 UpdateInboxStatusSchema（ステータス更新用）
  ```ts
  export const UpdateInboxStatusSchema = z.object({
    status: z.enum(["new", "processed", "ignored"]),
  });
  ```

- [ ] 1.1.5 InboxCreateJobSchema（Job作成用）
  ```ts
  export const InboxCreateJobSchema = z.object({
    jobUrl: z.string().url(),
    titleOverride: z.string().optional(),
  });
  ```

- [ ] 1.1.6 InboxListQuerySchema（クエリパラメータ用）
  ```ts
  export const InboxListQuerySchema = z.object({
    status: z.enum(["new", "processed", "ignored"]).optional(),
    q: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).default(0),
  });
  ```

**成果物**: 5つの Zod スキーマが定義される

---

### 1.2 URL 抽出ロジック実装
**ゴール**: メール本文から URL と キーワード を抽出

**サブタスク**:
- [ ] 1.2.1 ファイル作成
  - ファイル: `src/lib/inbox/extract.ts`

- [ ] 1.2.2 extractEmailContent 関数
  - 入力: subject + body
  - 出力: { jobLinks: [], textExtracts: [] }
  - 正規表現で URL を抽出

- [ ] 1.2.3 UpWork ジョブ URL パターンマッチング
  ```ts
  const UPWORK_JOB_REGEX = /https?:\/\/(?:www\.)?upwork\.com\/jobs\/[\w\-]+/gi;
  ```
  - ジョブリンクのみを分離

- [ ] 1.2.4 キーワードスニペット抽出
  - "job", "budget", "contract" 等のキーワードを含む文を抽出
  - 最大3行まで

- [ ] 1.2.5 UpWork ジョブ ID 抽出関数
  ```ts
  export function extractUpworkJobId(url: string): string | null
  ```
  - URL から `123456789` を抽出

- [ ] 1.2.6 URL 判定関数
  ```ts
  export function isUpworkJobUrl(url: string): boolean
  ```

**成果物**: URL 抽出エンジンが完成

---

### 1.3 Webhook エンドポイント実装
**ゴール**: POST /api/inbox/ingest で メール を受け取り

**サブタスク**:
- [ ] 1.3.1 ディレクトリ & ファイル作成
  - ファイル: `src/app/api/inbox/ingest/route.ts`

- [ ] 1.3.2 セキュリティ検証
  - Header: `x-inbox-token` チェック
  - 環境変数 `INBOX_WEBHOOK_TOKEN` と比較
  - 401 Unauthorized 返却

- [ ] 1.3.3 リクエスト解析 & バリデーション
  - JSON パース
  - InboxIngestSchema で検証
  - 400 Bad Request 返却

- [ ] 1.3.4 InboxMessage 作成
  ```ts
  await prisma.inboxMessage.create({
    data: {
      userId,
      from: ingestData.from,
      subject: ingestData.subject,
      // ... other fields
      extracts: {
        create: [ /* extracted items */ ]
      }
    }
  });
  ```

- [ ] 1.3.5 InboxExtract 作成（自動）
  - job_link タイプの extract
  - text_extract タイプの extract

- [ ] 1.3.6 レスポンス返却
  ```json
  {
    "id": "clxxxxxxxxxxxx",
    "status": "created",
    "extractsCount": 2
  }
  ```

- [ ] 1.3.7 エラーハンドリング
  - ZodError → 400
  - DB エラー → 500
  - SINGLE_USER_ID 未設定 → 500

**成果物**: Webhook エンドポイント動作

---

### 1.4 Inbox メッセージ一覧 API
**ゴール**: GET /api/inbox/messages で フィルタ・検索付き一覧

**サブタスク**:
- [ ] 1.4.1 ファイル作成
  - ファイル: `src/app/api/inbox/messages/route.ts`

- [ ] 1.4.2 クエリパラメータ解析
  - status (new/processed/ignored)
  - q (検索文字列)
  - limit (1-100)
  - offset (ページネーション)

- [ ] 1.4.3 where 句構築
  ```ts
  const where = {
    userId,
    ...(status && { status }),
    ...(q && {
      OR: [
        { subject: { contains: q, mode: "insensitive" } },
        { from: { contains: q, mode: "insensitive" } },
      ]
    })
  };
  ```

- [ ] 1.4.4 メッセージ取得
  ```ts
  const messages = await prisma.inboxMessage.findMany({
    where,
    select: {
      id, from, subject, snippet, status, receivedAt,
      createdJobId,
      _count: { select: { extracts: true } }
    },
    orderBy: { receivedAt: "desc" },
    take: limit,
    skip: offset
  });
  ```

- [ ] 1.4.5 レスポンス形成
  ```json
  {
    "messages": [ /* lightweight items */ ],
    "total": 42,
    "limit": 20,
    "offset": 0
  }
  ```

**成果物**: 一覧 API 動作

---

### 1.5 Inbox メッセージ詳細 API
**ゴール**: GET /api/inbox/messages/:id で 完全なメッセージ

**サブタスク**:
- [ ] 1.5.1 ファイル作成
  - ファイル: `src/app/api/inbox/messages/[id]/route.ts`

- [ ] 1.5.2 メッセージ取得（extract 含む）
  ```ts
  const message = await prisma.inboxMessage.findUnique({
    where: { id: params.id },
    include: {
      extracts: {
        select: { id, type, payloadJson }
      }
    }
  });
  ```

- [ ] 1.5.3 所有権確認
  - message.userId === SINGLE_USER_ID → 403

- [ ] 1.5.4 レスポンス返却
  - rawBodyText 含める
  - extracts 全件含める

**成果物**: 詳細 API 動作

---

### 1.6 ステータス更新 API
**ゴール**: PATCH /api/inbox/messages/:id/status

**サブタスク**:
- [ ] 1.6.1 ファイル作成
  - ファイル: `src/app/api/inbox/messages/[id]/status/route.ts`

- [ ] 1.6.2 リクエスト検証
  - UpdateInboxStatusSchema で検証

- [ ] 1.6.3 メッセージ確認
  - 存在確認
  - 所有権確認

- [ ] 1.6.4 ステータス更新
  ```ts
  const updated = await prisma.inboxMessage.update({
    where: { id },
    data: { status: newStatus }
  });
  ```

- [ ] 1.6.5 レスポンス返却
  ```json
  { "id": "...", "status": "processed", "updatedAt": "..." }
  ```

**成果物**: ステータス更新 API 動作

---

### 1.7 Job 作成 API
**ゴール**: POST /api/inbox/messages/:id/create-job

**サブタスク**:
- [ ] 1.7.1 ファイル作成
  - ファイル: `src/app/api/inbox/messages/[id]/create-job/route.ts`

- [ ] 1.7.2 リクエスト検証
  - InboxCreateJobSchema で検証

- [ ] 1.7.3 InboxMessage 確認
  - 存在確認
  - 所有権確認
  - createdJobId チェック（すでに作成済みか）

- [ ] 1.7.4 Job 作成
  ```ts
  const job = await prisma.job.create({
    data: {
      userId,
      upworkJobId: extractUpworkJobId(input.jobUrl) || `temp-${Date.now()}`,
      title: input.titleOverride || message.subject,
      description: message.rawBodyText || "From Inbox",
      postedAt: message.receivedAt,
      url: input.jobUrl,
      source: "inbox",
      createdFromInboxMessageId: message.id,
      saved: true
    }
  });
  ```

- [ ] 1.7.5 InboxMessage 更新
  ```ts
  await prisma.inboxMessage.update({
    where: { id },
    data: {
      createdJobId: job.id,
      status: "processed"
    }
  });
  ```

- [ ] 1.7.6 レスポンス返却
  ```json
  { "jobId": "clxxxx", "status": "created" }
  ```

**成果物**: Job 作成 API 動作

---

### 1.8 API ドキュメント & 環境変数設定
**ゴール**: API 使用方法と環境変数を記録

**サブタスク**:
- [ ] 1.8.1 README.md 作成
  - ファイル: `src/app/api/inbox/README.md`
  - 5つのエンドポイント説明
  - リクエスト・レスポンス例

- [ ] 1.8.2 .env.example 更新
  ```bash
  INBOX_WEBHOOK_TOKEN=your_webhook_token_here
  SINGLE_USER_ID=clxxxxxxxxxxxx
  ```

- [ ] 1.8.3 Webhook トークン生成ガイド
  ```bash
  openssl rand -base64 32
  ```

**成果物**: API ドキュメント & 環境変数テンプレート

---

## Phase 2: Inbox UI (2ペイン)

### 2.1 型定義
**ゴール**: TypeScript型を定義

**サブタスク**:
- [ ] 2.1.1 ファイル作成
  - ファイル: `src/types/inbox.ts`

- [ ] 2.1.2 型定義
  ```ts
  export interface InboxMessageItem { /* 一覧用 */ }
  export interface InboxExtract { /* 抽出データ */ }
  export interface InboxMessageDetail extends InboxMessageItem { /* 詳細用 */ }
  export interface InboxListResponse { /* API応答 */ }
  export type InboxStatusFilter = InboxStatus | "all";
  export interface InboxUIState { /* UI状態 */ }
  ```

**成果物**: 型定義完成

---

### 2.2 InboxShell コンポーネント
**ゴール**: メイン状態管理とレイアウト

**サブタスク**:
- [ ] 2.2.1 ファイル作成
  - ファイル: `src/components/inbox/inbox-shell.tsx`

- [ ] 2.2.2 状態管理
  - statusFilter (useState)
  - searchQuery (useState)
  - selectedId (useState)

- [ ] 2.2.3 useQuery でメッセージ一覧取得
  - queryKey: ["inbox-messages", statusFilter, searchQuery]
  - `/api/inbox/messages?status=...&q=...`

- [ ] 2.2.4 useQuery で詳細取得
  - queryKey: ["inbox-message", selectedId]
  - `/api/inbox/messages/{id}`
  - enabled: !!selectedId

- [ ] 2.2.5 2カラムレイアウト
  - 左（w-1/3）: InboxList
  - 右（flex-1）: InboxDetail

- [ ] 2.2.6 フィルタ変更時に selectedId リセット
  - useEffect で setSelectedId(null)

**成果物**: InboxShell コンポーネント動作

---

### 2.3 InboxFilters コンポーネント
**ゴール**: ステータスタブ + 検索入力

**サブタスク**:
- [ ] 2.3.1 ファイル作成
  - ファイル: `src/components/inbox/inbox-filters.tsx`

- [ ] 2.3.2 Tabs コンポーネント
  - 4つのタブ: New, Processed, Ignored, All
  - onValueChange で statusFilter 更新

- [ ] 2.3.3 Search Input
  - placeholder: "Search subject, from..."
  - onChange で searchQuery 更新
  - Search アイコン付き

**成果物**: InboxFilters コンポーネント動作

---

### 2.4 InboxList コンポーネント
**ゴール**: メッセージ一覧表示

**サブタスク**:
- [ ] 2.4.1 ファイル作成
  - ファイル: `src/components/inbox/inbox-list.tsx`

- [ ] 2.4.2 ローディング状態
  - isLoading === true → Skeleton x5 表示

- [ ] 2.4.3 メッセージアイテム表示
  ```
  【From】 【Status Badge】 【Extract Count】
  【Subject】
  【Snippet】
  【Timestamp】 【Job Created Badge?】
  ```

- [ ] 2.4.4 選択インジケーター
  - selectedId === message.id → border-l-blue-500 + bg-blue-50

- [ ] 2.4.5 クリックハンドラー
  - onClick → onSelectMessage(message.id)

**成果物**: InboxList コンポーネント動作

---

### 2.5 InboxDetail コンポーネント
**ゴール**: メッセージ詳細とアクション

**サブタスク**:
- [ ] 2.5.1 ファイル作成
  - ファイル: `src/components/inbox/inbox-detail.tsx`

- [ ] 2.5.2 ヘッダー表示
  - Title
  - From
  - Status Badge
  - Timestamp

- [ ] 2.5.3 メッセージ本文表示
  - rawBodyText を <pre> で表示
  - white-space-pre-wrap で折り返し

- [ ] 2.5.4 抽出コンテンツ表示
  - Job Links セクション
    - 各 URL に「→ Job」ボタン
    - createdJobId あれば「✓ Job created」表示
  - Text Extracts セクション
    - 文字列表示

- [ ] 2.5.5 アクション実装
  - 「Mark Processed」ボタン
    - PATCH /api/inbox/messages/:id/status (status: "processed")
  - 「Ignore」ボタン
    - PATCH /api/inbox/messages/:id/status (status: "ignored")
  - 「→ Job」ボタン
    - POST /api/inbox/messages/:id/create-job
    - 成功後、自動で /dashboard/jobs/:jobId/analyze へ遷移

- [ ] 2.5.6 ローディング状態
  - 更新中は ボタン disabled

**成果物**: InboxDetail コンポーネント動作

---

### 2.6 InboxEmpty コンポーネント
**ゴール**: 空状態表示

**サブタスク**:
- [ ] 2.6.1 ファイル作成
  - ファイル: `src/components/inbox/inbox-empty.tsx`

- [ ] 2.6.2 メッセージ表示
  - ステータスに応じた文言
  - フィルタ検索時の別メッセージ

- [ ] 2.6.3 「Clear Filters」ボタン
  - hasFilters === true の場合のみ表示

**成果物**: InboxEmpty コンポーネント動作

---

### 2.7 Inbox ページ実装
**ゴール**: /dashboard/inbox ページ

**サブタスク**:
- [ ] 2.7.1 ファイル作成
  - ファイル: `src/app/(dashboard)/inbox/page.tsx`

- [ ] 2.7.2 メタデータ設定
  ```ts
  export const metadata: Metadata = {
    title: "Inbox | UpWork Terminal",
    description: "UpWork notifications and job leads",
  };
  ```

- [ ] 2.7.3 ページレイアウト
  - ヘッダー: "Inbox" + 説明文
  - h-[calc(100vh-120px)] で InboxShell 配置

**成果物**: /dashboard/inbox ページ動作

---

## Phase 3: Sophia 分析エンジン & API

### 3.1 Sophia スキーマ定義
**ゴール**: Sophia 出力形式を Zod で定義

**サブタスク**:
- [ ] 3.1.1 ファイル作成
  - ファイル: `src/lib/sophia/schemas.ts`

- [ ] 3.1.2 SophiaQMetaSchema
  ```ts
  z.object({
    intention: z.string(),
    misalignment: z.string(),
    latent_frame: z.string(),
    premise_reflection: z.string(),
    feedback: z.string(),
    socratic_trigger: z.object({
      question_ja: z.string(),
      why_this_question: z.string(),
      answer_format_hint: z.string(),
    }),
  })
  ```

- [ ] 3.1.3 SophiaFUltimateSchema
  ```ts
  z.object({
    awareness: z.string(),
    classification: z.string(),
    navigation: z.object({
      next_step: z.string(),
      options: z.array(z.string()).min(2).max(5),
      recommended: z.string(),
    }),
    verification: z.object({
      assumptions: z.array(z.string()),
      risks: z.array(z.string()),
      what_to_confirm_next: z.array(z.string()),
    }),
    redefine: z.string(),
    meta_check: z.string(),
    r_update: z.object({
      metrics: z.array(z.string()),
      cadence: z.string(),
    }),
  })
  ```

- [ ] 3.1.4 SophiaArtifactsSchema
  ```ts
  z.object({
    summary_ja: z.string(),
    profile_pitch_ja: z.string().optional(),
    profile_pitch_en: z.string().optional(),
    job_analysis_ja: z.string().optional(),
    proposal_draft_en: z.string().optional(),
  })
  ```

- [ ] 3.1.5 SophiaOutputSchema（統合）
  ```ts
  z.object({
    q_meta: SophiaQMetaSchema,
    f_ultimate: SophiaFUltimateSchema,
    artifacts: SophiaArtifactsSchema,
  })
  ```

- [ ] 3.1.6 リクエストスキーマ
  ```ts
  export const SophiaAnalyzeRequestSchema = z.object({
    targetType: z.enum(["profile", "job", "proposal"]),
    targetId: z.string(),
    targetTitle: z.string().optional(),
    targetText: z.string().min(10),
    userAnswerJa: z.string().optional(),
  });
  ```

**成果物**: Sophia スキーマ完成

---

### 3.2 Sophia プロンプトビルダー
**ゴール**: ターゲットをシステム・ユーザープロンプトに変換

**サブタスク**:
- [ ] 3.2.1 ファイル作成
  - ファイル: `src/lib/sophia/prompt.ts`

- [ ] 3.2.2 型定義
  ```ts
  export type SophiaTargetType = "profile" | "job" | "proposal";
  export interface SophiaPromptArgs { /* 入力 */ }
  export interface SophiaPrompt { system, user }
  ```

- [ ] 3.2.3 buildSophiaPrompt 関数
  - Input: { targetType, targetTitle, targetText, userAnswerJa }
  - Output: { system, user }

- [ ] 3.2.4 システムプロンプト生成
  ```
  "You are Sophia, a Japanese-first structured thinking engine.
  Return ONLY valid JSON...
  Hard constraints: ..."
  ```

- [ ] 3.2.5 ユーザープロンプト生成
  ```ts
  JSON.stringify({
    targetType,
    targetTitle,
    targetText,
    userAnswerJa,
    requestedArtifacts: { /* target別 */ }
  })
  ```

**成果物**: プロンプトビルダー動作

---

### 3.3 Sophia エンジン実装
**ゴール**: LLM 呼び出し + バリデーション + リトライ

**サブタスク**:
- [ ] 3.3.1 ファイル作成
  - ファイル: `src/lib/sophia/engine.ts`

- [ ] 3.3.2 LLMProvider インターフェース定義
  ```ts
  export interface LLMProvider {
    completeJson(args: {
      system: string;
      user: string;
      temperature?: number;
    }): Promise<unknown>;
  }
  ```

- [ ] 3.3.3 runSophia 関数実装
  - Input: { provider, targetType, targetTitle, targetText, userAnswerJa }
  - Output: { output, isValid, rawResponse, retryCount }

- [ ] 3.3.4 リトライロジック
  - for loop: 0-2 (3回まで試行)
  - 1回目失敗 → log + 再試行
  - 2回目失敗 → return invalid result

- [ ] 3.3.5 バリデーション
  ```ts
  const parsed = SophiaOutputSchema.safeParse(rawResponse);
  if (!parsed.success) {
    // リトライ or エラー返却
  }
  ```

- [ ] 3.3.6 エラーハンドリング
  - createEmptyOutput() で デフォルト値作成
  - 日本語エラーメッセージ

**成果物**: Sophia エンジン動作

---

### 3.4 Claude API プロバイダ
**ゴール**: Anthropic Claude API との統合

**サブタスク**:
- [ ] 3.4.1 ファイル作成
  - ファイル: `src/lib/sophia/provider.ts`

- [ ] 3.4.2 ClaudeProvider クラス実装
  ```ts
  class ClaudeProvider implements LLMProvider {
    private apiKey: string;
    private model = "claude-3-5-sonnet-20241022";
    private maxTokens = 2048;
  }
  ```

- [ ] 3.4.3 completeJson メソッド
  - fetch で `https://api.anthropic.com/v1/messages` に POST
  - ヘッダー: x-api-key, anthropic-version
  - body: { model, max_tokens, temperature, messages }

- [ ] 3.4.4 レスポンス処理
  - data.content[0].text から JSON 抽出
  - JSON.parse で オブジェクト化
  - エラー時は throw

- [ ] 3.4.5 シングルトン export
  ```ts
  export const provider = new ClaudeProvider();
  ```

**成果物**: Claude プロバイダ動作

---

### 3.5 Sophia API エンドポイント
**ゴール**: POST /api/sophia/analyze

**サブタスク**:
- [ ] 3.5.1 ファイル作成
  - ファイル: `src/app/api/sophia/analyze/route.ts`

- [ ] 3.5.2 リクエスト検証
  - JSON パース
  - SophiaAnalyzeRequestSchema で 検証
  - 400 Bad Request 返却

- [ ] 3.5.3 runSophia 実行
  ```ts
  const result = await runSophia({
    provider,
    targetType,
    targetTitle,
    targetText,
    userAnswerJa,
  });
  ```

- [ ] 3.5.4 SophiaReport 保存
  ```ts
  const report = await prisma.sophiaReport.create({
    data: {
      userId,
      targetType,
      targetId,
      userAnswerJa,
      qMetaJson: result.output.q_meta,
      fUltimateJson: result.output.f_ultimate,
      artifactsJson: result.output.artifacts,
      isValid: result.isValid,
      rawResponse: result.rawResponse,
      retryCount: result.retryCount,
    },
  });
  ```

- [ ] 3.5.5 レスポンス返却
  ```json
  {
    "sophiaReportId": "...",
    "output": { /* SophiaOutput */ },
    "isValid": true,
    "retryCount": 0
  }
  ```
  - Status: 200 (valid) or 206 (invalid)

- [ ] 3.5.6 エラーハンドリング
  - ZodError → 400
  - ANTHROPIC_API_KEY なし → 500
  - API エラー → 500

**成果物**: Sophia API 動作

---

## 🎯 Phase 0-3 全体サマリー

| フェーズ | サブフェーズ数 | 主要成果物 | 見積もり |
|---------|---------|--------|--------|
| **Phase 0** | 7 | Prismaスキーマ + マイグレーション | 1-2日 |
| **Phase 1** | 8 | Inbox API (5エンドポイント) | 2-3日 |
| **Phase 2** | 7 | Inbox UI (5コンポーネント + ページ) | 2日 |
| **Phase 3** | 5 | Sophia分析エンジン + Claude統合 | 2日 |
| **合計** | 27 | 完全なInbox + Sophia基盤 | 7-10日 |

---

## ✅ 各フェーズ完了判定

### Phase 0 完了条件
- [ ] 7つのEnum が schema.prisma に定義されている
- [ ] 4つのModel が定義されている
- [ ] `npx prisma migrate dev` が成功
- [ ] `npx prisma generate` で Prisma Client 生成
- [ ] `npx prisma db push` で DB に反映

### Phase 1 完了条件
- [ ] 5つの API エンドポイントが動作
- [ ] Webhook で メール受信可能
- [ ] URL 抽出が動作
- [ ] InboxMessage & InboxExtract が保存される
- [ ] すべてのAPI がバリデーション機能あり

### Phase 2 完了条件
- [ ] /dashboard/inbox ページが表示される
- [ ] メッセージ一覧 + 詳細表示が動作
- [ ] ステータスフィルター + 検索が動作
- [ ] 「Mark Processed」「Ignore」ボタンが動作
- [ ] 「Create Job」ボタンで Job 作成可能

### Phase 3 完了条件
- [ ] POST /api/sophia/analyze が動作
- [ ] Q_META/F_ULTIMATE/Artifacts が返却される
- [ ] Sophia 結果が DB に保存される
- [ ] Socratic Trigger が 必ず1問出力される
- [ ] リトライ機能が動作

---

## 🔄 リビルド手順（別プロジェクトでの再実装）

```bash
# 1. Next.js プロジェクト初期化
npx create-next-app@latest my-app --typescript --tailwind --app

# 2. Phase 0: Prisma 初期化
npm install prisma @prisma/client
npx prisma init

# 3. Phase 0.1-0.7 に従い schema.prisma 構築 + migrate

# 4. Phase 1: Zod & API 実装
npm install zod

# 5. Phase 1.1-1.8 に従い API 実装

# 6. Phase 2: UI コンポーネント実装
npm install @tanstack/react-query

# 7. Phase 2.1-2.7 に従い UI 構築

# 8. Phase 3: Sophia エンジン
# 8a. Zod スキーマ定義
# 8b. プロンプトビルダー
# 8c. エンジン実装
# 8d. Claude プロバイダ
# 8e. API エンドポイント

# 9. 環境変数設定
# DATABASE_URL, ANTHROPIC_API_KEY, INBOX_WEBHOOK_TOKEN, SINGLE_USER_ID

# 10. デプロイ
npm run build
```

---

## 📚 ファイル構成（最終）

```
src/
├── app/
│   ├── api/
│   │   ├── inbox/
│   │   │   ├── ingest/route.ts
│   │   │   └── messages/
│   │   │       ├── route.ts
│   │   │       ├── [id]/route.ts
│   │   │       ├── [id]/status/route.ts
│   │   │       └── [id]/create-job/route.ts
│   │   └── sophia/
│   │       └── analyze/route.ts
│   └── (dashboard)/
│       └── inbox/page.tsx
│
├── components/
│   └── inbox/
│       ├── inbox-shell.tsx
│       ├── inbox-filters.tsx
│       ├── inbox-list.tsx
│       ├── inbox-detail.tsx
│       └── inbox-empty.tsx
│
├── lib/
│   ├── schemas/
│   │   └── inbox.ts
│   ├── inbox/
│   │   └── extract.ts
│   └── sophia/
│       ├── schemas.ts
│       ├── prompt.ts
│       ├── engine.ts
│       └── provider.ts
│
└── types/
    └── inbox.ts

prisma/
├── schema.prisma
├── migrations/
│   └── [timestamp]_add_sophia_inbox_profiles/
│       └── migration.sql
└── prisma.config.ts
```

---

このドキュメントを使用すれば、別のプロジェクトでも Phase 0-3 を完全にリビルドできます！
