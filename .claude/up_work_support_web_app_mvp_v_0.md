# UpWorkサポートWebアプリ（MVP v0.1）— ここまでのFB（全量まとめ / Markdown）

> 目的：\*\*自分用に“がっつり実運用”**しながら、将来的にSaaS化も見据える。 重要：********日数目標ではなくStep設計********（登録→案件リサーチ→応募まで）。 追加要望：UpWorkの**アラートメール（Inbox）\*\*もUIに統合し、案件分析まで一元化。 さらに：初期の自己分析・プロフィール最適化は \*\*Sophia構文（Q\_META / F\_ULTIMATE）\*\*でも支援。

---

## 1. このWebサービスは「何をする」もの？（プロジェクト説明）

UpWorkで活動する際の実務は、ざっくり以下に分散します。

- UpWork内：検索・保存・応募・契約管理
- メール：新着案件アラート、招待、返信通知、契約関連通知
- 自分の脳内：分析・意思決定・メモ・提案書の下書き・コネクト管理

このアプリは、それを**日本語UIで“一本道”にまとめる**サービスです。

### 1) 実運用での価値（MVP v0.1）

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

- 例：PostmarkなどのInboundで、受信メールをJSONとしてWebhookにPOST
- Gmail OAuth不要（面倒が激減）
- UpWork通知先を専用アドレスにして、そこへ転送

### MVPでの注意（実務的な落としどころ）

- 添付が多いメールはpayloadが重くなる可能性 → **UpWork通知だけ転送対象**にする
- Webhookは公開URLになる → **推測困難なパス / 簡易トークン / Basic Auth**等で保護

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

- 上部：Tabs（status）＋検索（subject/from）
- 左ペイン：InboxList（選択）
- 右ペイン：InboxDetail（詳細＋アクション）

### コンポーネント分割（追加）

```
src/
  app/
    (dashboard)/
      inbox/
        page.tsx
  components/
    inbox/
      inbox-shell.tsx
      inbox-filters.tsx
      inbox-list.tsx
      inbox-detail.tsx
      inbox-empty.tsx
  types/
    inbox.ts
```

---

## 5. API（MVP最小）

### Inbox

- `GET /api/inbox/messages?status=new&q=...`
  - 一覧（軽量）：extractsは件数だけ
- `GET /api/inbox/messages/:id`
  - 詳細：extracts込み
- `PATCH /api/inbox/messages/:id/status` body `{ status: new|processed|ignored }`
- `POST /api/inbox/messages/:id/create-job` body `{ jobUrl, titleOverride? }`
  - Job作成後にInboxMessageをprocessedへ

### Onboarding / Sophia（次の段階）

- `POST /api/onboarding/profile-snapshots`
- `POST /api/sophia/analyze`

---

## 6. Prismaスキーマ（MVP v0.1 追加分）

### 追加Enums

- ProfileSource: `paste | file | upwork_api`
- SophiaTargetType: `profile | job | proposal`
- InboxProvider: `gmail | forwarded_email | manual`
- InboxStatus: `new | processed | ignored`
- InboxExtractType: `job_link | text_extract`
- JobSource: `upwork | inbox | manual`
- ProposalTemplateType: `A_short_deliverable | B_audit_then_build`

### 新規Models

- **ProfileSnapshot**：プロフィール原文を保存（投入資産）
- **SophiaReport**：Q\_META / F\_ULTIMATEをJSONで保存（改善ループの資産化）
- **InboxMessage**：通知メール本体
- **InboxExtract**：URL等の抽出結果

### 既存モデルの追記

- User：profileSnapshots / sophiaReports / inboxMessages 追加
- Job：source / createdFromInboxMessageId / analysisJson（任意）
- Proposal：templateType / inputJson（任意）

> ここは \*\*「既存を壊さず足す」\*\*方針。

---

## 7. Inbox UIの“実装骨格”（Next.js App Router前提）

### Page

- `src/app/(dashboard)/inbox/page.tsx`
  - 殻だけ（初期statusの受け取り）

### Shell

- `InboxShell`
  - status / search / items / selected / detail を管理
  - 左（一覧）選択で右（詳細）更新

### Detailのアクション

- 処理済み・無視 → status更新
- Job化 → `create-job` → `/jobs/{jobId}/analyze` へ遷移

---

## 8. “メール→案件カード化”を成立させるための最小ロジック

### InboxMessage保存

- `from / subject / receivedAt / snippet / rawBodyText / status`

### URL抽出

- subject + body から正規表現でURL抽出
- `InboxExtract(type=job_link, payloadJson={url})`

### Job作成（MVP）

- URLを保持してJobを作成
- UpWork Job IDがまだ取れない場合は暫定ID（ユニーク制約回避）
- `source=inbox`
- `createdFromInboxMessageId=InboxMessage.id`

---

## 9. 実運用ルーティン（毎日回す）

1. 朝：Inbox（新着）を見る
2. 気になる通知を「案件カード化」
3. Jobページで「分析（スコア / Sophia）」
4. A/Bテンプレで提案下書き → 手動でUpWorkに応募
5. コネクト消費と結果をProposalに残す
6. 勝ち筋（反応の良い訴求・型）が資産として溜まる

---

## 10. 実装順（最短で“回る”順）

### 0) Prisma migrate（追加モデル）

- `add_sophia_inbox_models`

### 1) Inbox Ingest（まずデータが入ることを確認）

- `/api/inbox/ingest/...`

### 2) Inbox UI（一覧・詳細・Job化・無視）

- `/dashboard/inbox`

### 3) Job analyze UI（スコア + メモ + Sophia）

- `/jobs/[id]/analyze`

### 4) Proposal A/B生成（日本語入力→英語カバー）

- `/proposals/new`

---

## 11. MVPの運用原則（安全・確実）

- UpWorkへの自動送信はしない（安全に**コピペ運用**）
- SophiaのJSONは必ず保存（改善ループを資産化）
- UI導線は迷わない：**Inbox → Job化 → 分析 → 提案**

---

## 12. 次に作るべき画面（次のFB候補）

- **/jobs/[id]/analyze**（最重要）
  - スコアリング（合計100）
  - 判断（propose/hold/drop）
  - Sophia分析ボタン（JobをtargetにSophiaReport保存）
  - 「A/Bテンプレで提案作成」導線

---

# 付録：MVP v0.1の要点（超要約）

- **Inbox統合**でUpWork通知を一本化
- Inboxから**案件カード化（Job）**
- Jobに対して**分析 → 提案下書き（A/B）**
- その過程を**日本語で記録**し、勝ち筋を資産化
- 初期はSophiaで**自己分析・訴求最適化**を支援

