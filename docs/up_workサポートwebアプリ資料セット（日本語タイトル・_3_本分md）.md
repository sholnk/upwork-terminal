# UpWorkサポートWebアプリ資料セット（3本分MD）

> 注：キャンバス（Canmore）は**既存ドキュメントの「タイトル変更（リネーム）」ができません**。 そのため、\*\*日本語タイトルで3本のMDをここに“分割して収録”\*\*します。 他環境へは、このまま **各セクションを個別MDとしてコピペ**してください。

---

## 【MD-1】UpWorkサポートWebアプリ：FB全量まとめ

# UpWorkサポートWebアプリ（MVP v0.1）— ここまでのFB（全量まとめ / Markdown）

> 目的：\*\*自分用に“がっつり実運用”**しながら、将来的にSaaS化も見据える。 重要：****日数目標ではなくStep設計****（登録→案件リサーチ→応募まで）。 追加要望：UpWorkの**アラートメール（Inbox）\*\*もUIに統合し、案件分析まで一元化。 さらに：初期の自己分析・プロフィール最適化は \*\*Sophia構文（Q\_META / F\_ULTIMATE）\*\*でも支援。

---

## 1. このWebサービスは「何をする」もの？（プロジェクト説明）

UpWorkで活動する際の実務は、ざっくり以下に分散します。

- UpWork内：検索・保存・応募・契約管理
- メール：新着案件アラート、招待、返信通知、契約関連通知
- 自分の脳内：分析・意思決定・メモ・提案書の下書き・コネクト管理

このアプリは、それを**日本語UIで“一本道”にまとめる**サービスです。

### 実運用での価値（MVP v0.1）

- **Inboxで通知を一元化**（新着案件メール・返信通知・招待）
- Inboxから **Job（案件カード）を生成**
- Jobに対して **分析（Sophia/JobAgent）→提案下書き（ProposalAgent）**
- 提案履歴・コネクト消費・勝ち筋を **日本語で蓄積**

---

## 2. MVP v0.1での“Step型”運用設計（初心者向け）

### Step 1：プロフィール投入

- 既存プロフ（英語/日本語）を貼り付け・取り込み
- その原文を**ProfileSnapshot**として保存

### Step 2：Sophia分析（自己分析/訴求最適化）

- Q\_META / F\_ULTIMATE をJSONとして保存
- 「次に答えるべき1問（SocraticTrigger）」を出して改善ループ

### Step 3：Inbox（UpWork通知）を一元化

- UpWorkアラート・招待・返信通知を受け取り
- 本文からURL抽出し、**InboxExtract**に保存

### Step 4：Inbox → 案件カード化（Job作成）

- Inbox内のURL（or本文）を元にJobを生成
- `createdFromInboxMessageId` で追跡可能に

### Step 5：案件分析（スコア + 意思決定）

- スコアリング（fit/予算ROI/クライアント品質/勝率 等）
- 判断（propose/hold/drop）
- 日本語メモ（notes）・タグ

### Step 6：提案下書き（A/Bテンプレ）

- A：短納期デリバリー型
- B：監査→改善→構築の二段階型
- 日本語入力 → 英語カバーレター生成
- コネクト消費を記録

---

## 3. Inbox（メール統合）のMVP方針

### なぜInboxが重要か

- UpWorkの“回すべき作業”の多くは通知で始まる
- 初心者ほど「通知→案件→分析→応募」の導線が必要

### 最短・現実的なInbox取り込み（おすすめ）

**Inbound Webhook型**が最短です。

- 例：Postmark等のInboundで、受信メールをJSONとしてWebhookにPOST
- Gmail OAuth不要（面倒が激減）
- UpWork通知先を専用アドレスにして、そこへ転送

### MVPの注意（実務的な落としどころ）

- 添付でpayloadが肥大化しない運用（UpWork通知のみ転送）
- Webhook保護（推測困難なURL/簡易トークン等）

---

## 4. Inbox UI（/dashboard/inbox）— MVPで確実に回るUI

### UIゴール

- 左：通知一覧（New / Processed / Ignored）
- 右：通知詳細（本文抜粋 / 抽出URL）
- アクション：
  - **案件カード化（Job作成）→ /jobs/[id]/analyze へ遷移**
  - **無視（ignored）**
  - **処理済み（processed）**

### 画面構造（2ペイン）

- Tabs（status）＋検索（subject/from）
- 左：InboxList（選択）
- 右：InboxDetail（詳細＋アクション）

---

## 5. API（MVP最小）

### Inbox

- `GET /api/inbox/messages?status=new&q=...`
- `GET /api/inbox/messages/:id`
- `PATCH /api/inbox/messages/:id/status` body `{ status }`
- `POST /api/inbox/messages/:id/create-job` body `{ jobUrl, titleOverride? }`

### Onboarding / Sophia（次の段階）

- `POST /api/onboarding/profile-snapshots`
- `POST /api/sophia/analyze`

---

## 6. Prismaスキーマ（MVP v0.1 追加分・概念）

### 新規モデル

- **ProfileSnapshot**：プロフィール原文の保存
- **SophiaReport**：Q\_META / F\_ULTIMATE（JSON）保存
- **InboxMessage**：通知メール
- **InboxExtract**：抽出URL等

### 既存の追記

- Job：source / createdFromInboxMessageId / analysisJson（任意）
- Proposal：templateType / inputJson（任意）

---

## 7. 実装順（最短で回る順）

1. Prisma migrate（追加モデル）
2. Inbox ingest（まずデータが入ることを確認）
3. Inbox UI（一覧・詳細・Job化・無視）
4. Job analyze UI（スコア+メモ+Sophia）
5. Proposal A/B生成（日本語入力→英語カバー）

---

## 8. MVPの運用原則

- UpWorkへの自動送信はしない（安全に**コピペ運用**）
- SophiaのJSONは必ず保存（改善ループを資産化）
- UI導線は迷わない：**Inbox → Job化 → 分析 → 提案**

---

## 【MD-2】UpWorkサポートWebアプリ：FB YAMLスナップショット

```yaml
meta:
  project:
    name: "UpWork Freelance Management Web Service"
    goal:
      primary: "自分用の実運用（日本語UI）でUpWork活動を一元管理"
      milestone_style: "日数ではなくStepで、登録→案件リサーチ→応募まで到達"
      key_constraints:
        - "英語が苦手な初心者でも迷わない導線"
        - "UpWork通知メール（アラート/返信/招待）もUI内で扱う"
        - "Sophia（自己分析/最適化）支援を初期フェーズに組み込む"

mvp_v0_1_scope:
  core_user_flow:
    - step: 1
      name: "プロフィール投入"
      description: "既存プロフ原文（英語/日本語）を貼り付け or 取り込み"
      output:
        - "ProfileSnapshot保存"
        - "Sophia分析用入力が揃う"
    - step: 2
      name: "Sophia分析（自己分析/訴求最適化）"
      description: "Q_META/F_ULTIMATEのJSONを資産化し、次の一問で改善ループ"
      output:
        - "SophiaReport保存（qMetaJson, fUltimateJson）"
        - "次に答えるべき1問（SocraticTrigger）"
    - step: 3
      name: "Inbox（UpWork通知）を一元化"
      description: "新着通知→案件URL抽出→Jobカード化→分析へ"
      output:
        - "InboxMessage保存"
        - "InboxExtract（job_link）保存"
    - step: 4
      name: "案件カード化"
      description: "InboxからJobを生成し、追跡・分析の起点にする"
      output:
        - "Job作成（source=inbox, createdFromInboxMessageIdで紐付け）"
    - step: 5
      name: "案件分析（スコア+メモ）"
      description: "スコアリング・意思決定（propose/hold/drop）を日本語で記録"
      output:
        - "Job.analysisJson（任意） or notes/tagsに保存"
    - step: 6
      name: "提案下書き（A/Bテンプレ）"
      description: "日本語入力→英語カバーレター生成、コネクト消費を記録"
      output:
        - "Proposal作成（coverLetter=英語最終文）"
        - "Proposal.templateType, Proposal.inputJson（任意）"

ui_mvp:
  route_map:
    dashboard:
      inbox:
        path: "/inbox"
        layout: "2ペイン（左：一覧 / 右：詳細）"
        features:
          - "ステータス切替（new/processed/ignored）"
          - "検索（subject/from）"
          - "抽出リンク表示"
          - "案件カード化（Job作成）→ /jobs/{jobId}/analyze へ遷移"
          - "無視/処理済みの更新"

inbox_ingest_strategy_mvp:
  recommended:
    method: "Inbound Webhook（例：Postmarkなど）"
    reason:
      - "Gmail OAuth不要で最短"
      - "UpWork通知を専用アドレスに集約し、受信時にJSONでPOST"
  guardrails:
    - "添付でpayloadが肥大化しない運用（UpWork通知のみ転送）"
    - "Webhook保護（推測困難なURL/簡易トークン）"

implementation_order_next:
  phase_0_mvp_start:
    - "Prisma migrate: add_sophia_inbox_models"
    - "Inbox ingest endpoint（/api/inbox/ingest/...）を先に作り、データが入ることを確認"
    - "Dashboard Inbox UI（/inbox）を作り、一覧/詳細/Job化/無視が動くことを確認"
  after_inbox:
    - "Job analyze UI（スコア+メモ+Sophia）"
    - "Proposal A/B生成（日本語入力→英語カバー）"
    - "Connects消費と結果ログの可視化"

notes:
  mvp_principles:
    - "UpWorkへ自動送信はしない（安全にコピペ運用）"
    - "SophiaのJSONは必ず保存（改善ループを資産化）"
    - "UIは迷わない導線優先：Inbox→Job化→分析→提案"
```

---

## 【MD-3】Sophiaエンジン（MVP）：コード一式

### 1) 出力フォーマット（MVP固定）

```ts
export type SophiaOutput = {
  q_meta: {
    intention: string;
    misalignment: string;
    latent_frame: string;
    premise_reflection: string;
    feedback: string;
    socratic_trigger: {
      question_ja: string;
      why_this_question: string;
      answer_format_hint: string;
    };
  };
  f_ultimate: {
    awareness: string;
    classification: string;
    navigation: {
      next_step: string;
      options: string[];
      recommended: string;
    };
    verification: {
      assumptions: string[];
      risks: string[];
      what_to_confirm_next: string[];
    };
    redefine: string;
    meta_check: string;
    r_update: {
      metrics: string[];
      cadence: string;
    };
  };
  artifacts: {
    summary_ja: string;
    profile_pitch_ja?: string;
    profile_pitch_en?: string;
    job_analysis_ja?: string;
    proposal_draft_en?: string;
  };
};
```

### 2) Zodスキーマ

```ts
import { z } from "zod";

export const SophiaOutputSchema = z.object({
  q_meta: z.object({
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
  }),
  f_ultimate: z.object({
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
  }),
  artifacts: z.object({
    summary_ja: z.string(),
    profile_pitch_ja: z.string().optional(),
    profile_pitch_en: z.string().optional(),
    job_analysis_ja: z.string().optional(),
    proposal_draft_en: z.string().optional(),
  }),
});

export type SophiaOutput = z.infer<typeof SophiaOutputSchema>;
```

### 3) プロンプト構文

```ts
export type SophiaTargetType = "profile" | "job" | "proposal";

export function buildSophiaPrompt(args: {
  targetType: SophiaTargetType;
  targetTitle?: string;
  targetText: string;
  userAnswerJa?: string;
}) {
  const { targetType, targetTitle, targetText, userAnswerJa } = args;

  const system = `You are Sophia, a Japanese-first structured thinking engine.
Return ONLY valid JSON that matches the specified schema.
No markdown. No extra keys.

Definitions:
- Q_META: intention, misalignment, latent_frame, premise_reflection, feedback, socratic_trigger.
- F_ULTIMATE: awareness, classification, navigation, verification, redefine, meta_check, r_update.

Hard constraints:
- Output language: Japanese for all explanatory fields, except artifacts.profile_pitch_en and artifacts.proposal_draft_en.
- socratic_trigger.question_ja must be exactly ONE question.
- navigation.options must be 2-5 options.
- verification.* fields are bullet-like strings.
`;

  const payload = {
    targetType,
    targetTitle: targetTitle ?? null,
    targetText,
    userAnswerJa: userAnswerJa ?? null,
    requestedArtifacts: {
      profile: ["summary_ja", "profile_pitch_ja", "profile_pitch_en"],
      job: ["summary_ja", "job_analysis_ja"],
      proposal: ["summary_ja", "proposal_draft_en"],
    }[targetType],
  };

  return { system, user: JSON.stringify(payload) };
}
```

### 4) エンジン（実行 + 検証）

```ts
export interface LLMProvider {
  completeJson(args: {
    system: string;
    user: string;
    temperature?: number;
  }): Promise<unknown>;
}

export async function runSophia(args: {
  provider: LLMProvider;
  targetType: SophiaTargetType;
  targetTitle?: string;
  targetText: string;
  userAnswerJa?: string;
}): Promise<SophiaOutput> {
  const { system, user } = buildSophiaPrompt(args);

  const raw = await args.provider.completeJson({
    system,
    user,
    temperature: 0.2,
  });

  const parsed = SophiaOutputSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Sophia output validation failed");
  return parsed.data;
}
```

### 5) API Route（保存まで）

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { provider } from "@/lib/sophia/provider";

export async function POST(req: Request) {
  const body = await req.json();
  const userId = process.env.SINGLE_USER_ID as string;

  const targetType = body?.targetType as SophiaTargetType;
  const targetId = String(body?.targetId ?? "");
  const targetText = String(body?.targetText ?? "");

  if (!targetType || !targetId || !targetText) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const output = await runSophia({
    provider,
    targetType,
    targetText,
    targetTitle: body?.targetTitle,
    userAnswerJa: body?.userAnswerJa,
  });

  const saved = await prisma.sophiaReport.create({
    data: {
      userId,
      targetType,
      targetId,
      qMetaJson: output.q_meta,
      fUltimateJson: output.f_ultimate,
      artifactsJson: output.artifacts,
    },
    select: { id: true },
  });

  return NextResponse.json({ sophiaReportId: saved.id, output });
}
```

