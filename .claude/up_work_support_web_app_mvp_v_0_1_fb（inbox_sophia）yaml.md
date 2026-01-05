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
  components:
    - "components/inbox/inbox-shell.tsx: 状態管理・左右ペイン統合"
    - "components/inbox/inbox-filters.tsx: Tabs + 検索"
    - "components/inbox/inbox-list.tsx: 一覧（選択）"
    - "components/inbox/inbox-detail.tsx: 詳細 + アクション"

schemas_zod_mvp:
  forms:
    profile_import:
      path: "/onboarding/import"
      schema: "ProfileImportSchema"
      fields:
        - source: "paste|file|upwork_api"
        - rawProfileText: "string(min:50)"
        - intentMemoJa: "string(optional)"
        - portfolios: "[{title,url?,descriptionJa?}]"
        - firstMonthStrategy: "review_focus|balanced|rate_focus?"
        - englishConfidence: "1..5?"
    sophia_followup:
      path: "/onboarding/sophia"
      schema: "SophiaFollowupSchema"
      fields:
        - profileSnapshotId: "string"
        - answerJa: "string(5..2000)"
    profile_builder:
      path: "/onboarding/profile-builder"
      schema: "ProfileBuilderInputSchema"
      fields:
        - profileSnapshotId: "string"
        - offerJa: "{who,problem,deliverables[],processSteps[]}"
        - proofJa: "{proofLine,portfolioLinks[]}"
        - tone: "direct|friendly|premium"
    inbox_create_job:
      path: "/inbox"
      schema: "InboxCreateJobSchema"
      fields:
        - inboxMessageId: "string"
        - jobUrl: "url"
        - titleOverride: "string?"
    job_analyze:
      path: "/jobs/{id}/analyze"
      schema: "JobAnalyzeFormSchema"
      fields:
        - score: "fit/clarity/budgetRoi/clientQuality/winChance（合計0..100）"
        - decision: "propose|hold|drop"
        - tags: "string[]"
        - notesJa: "string?"
    proposal_draft:
      path: "/proposals/new"
      schema: "ProposalDraftSchema"
      fields:
        - jobId: "string"
        - templateType: "A_short_deliverable|B_audit_then_build"
        - problemSummaryJa: "string"
        - deliverablesJa/stepsJa: "string[]"
        - auditItemsJa/phaseAJa/phaseBJa: "string[]/string?"
        - proofLineJa: "string"
        - portfolioUrl: "url?"
        - singleQuestionJa: "string"
        - connectsUsed: "int"
        - status: "draft|submitted"

prisma_schema_delta_mvp:
  new_enums:
    - ProfileSource: [paste, file, upwork_api]
    - SophiaTargetType: [profile, job, proposal]
    - InboxProvider: [gmail, forwarded_email, manual]
    - InboxStatus: [new, processed, ignored]
    - InboxExtractType: [job_link, text_extract]
    - JobSource: [upwork, inbox, manual]
    - ProposalTemplateType: [A_short_deliverable, B_audit_then_build]
  new_models:
    ProfileSnapshot:
      purpose: "プロフィール投入の原文と投入時メタを保存"
      relations:
        - "User 1:N ProfileSnapshot"
    SophiaReport:
      purpose: "Q_META/F_ULTIMATEのJSONを保存し改善ループを資産化"
      relations:
        - "User 1:N SophiaReport"
    InboxMessage:
      purpose: "UpWork通知メール（または転送）を保存"
      relations:
        - "User 1:N InboxMessage"
        - "InboxMessage 1:N InboxExtract"
        - "InboxMessage 1:N Job（createdFromInboxMessageId）"
    InboxExtract:
      purpose: "本文/件名から抽出したURL等の構造化結果を保存"
  existing_model_additions:
    User:
      add_relations:
        - profileSnapshots: "ProfileSnapshot[]"
        - sophiaReports: "SophiaReport[]"
        - inboxMessages: "InboxMessage[]"
    Job:
      add_fields:
        - source: "JobSource @default(upwork)"
        - createdFromInboxMessageId: "String?"
        - analysisJson: "Json? (任意)"
    Proposal:
      add_fields:
        - templateType: "ProposalTemplateType?"
        - inputJson: "Json? (任意)"

api_contract_mvp:
  inbox:
    list:
      method: GET
      path: "/api/inbox/messages?status=new&q=..."
      response: "InboxMessageListItem[]（extractsCountのみ）"
    detail:
      method: GET
      path: "/api/inbox/messages/{id}"
      response: "InboxMessageDetail（extracts込み）"
    set_status:
      method: PATCH
      path: "/api/inbox/messages/{id}/status"
      body: { status: "new|processed|ignored" }
      response: { ok: true }
    create_job:
      method: POST
      path: "/api/inbox/messages/{id}/create-job"
      body: { jobUrl: "url", titleOverride: "string?" }
      response: { jobId: "string" }
  onboarding:
    profile_snapshot_create:
      method: POST
      path: "/api/onboarding/profile-snapshots"
      body: "ProfileImportInput"
      response: { profileSnapshotId: "string" }
    sophia_analyze:
      method: POST
      path: "/api/sophia/analyze"
      body:
        targetType: "profile|job|proposal"
        targetId: "string"
        userAnswerJa: "string?"
      response:
        sophiaReportId: "string"
        qMeta: "QMeta"
        fUltimate: "FUltimate"
  proposals:
    create:
      method: POST
      path: "/api/proposals"
      body: "ProposalDraftInput"
      response: { proposalId: "string", coverLetterEn: "string" }

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

