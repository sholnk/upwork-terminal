# Sophiaエンジン（単体）— コード出力（TypeScript / Next.js）

> **このドキュメントは「Sophia部分だけ」**です（FBまとめ等は含めません）。

---

## 1) 出力フォーマット（MVP固定）

```ts
// Sophiaが必ず返すJSON（MVP固定）
export type SophiaOutput = {
  q_meta: {
    intention: string;
    misalignment: string;
    latent_frame: string;
    premise_reflection: string;
    feedback: string;
    socratic_trigger: {
      question_ja: string;         // 必ず1問
      why_this_question: string;
      answer_format_hint: string;
    };
  };
  f_ultimate: {
    awareness: string;
    classification: string;
    navigation: {
      next_step: string;
      options: string[];           // 2〜5個
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

---

## 2) Zodスキーマ（検証）

```ts
// src/lib/sophia/schemas.ts
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

---

## 3) Sophiaプロンプト（構文）

```ts
// src/lib/sophia/prompt.ts
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

---

## 4) Sophiaエンジン（実行 + バリデーション）

```ts
// src/lib/sophia/engine.ts
import { SophiaOutputSchema, type SophiaOutput } from "@/lib/sophia/schemas";
import { buildSophiaPrompt, type SophiaTargetType } from "@/lib/sophia/prompt";

export interface LLMProvider {
  completeJson(args: {
    system: string;
    user: string;
    temperature?: number;
  }): Promise<unknown>; // raw JSON
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
  if (!parsed.success) {
    throw new Error("Sophia output validation failed");
  }

  return parsed.data;
}
```

---

## 5) Next.js API Route（/api/sophia/analyze）

```ts
// src/app/api/sophia/analyze/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runSophia } from "@/lib/sophia/engine";
import type { SophiaTargetType } from "@/lib/sophia/prompt";

// 例：ここをOpenAI/Anthropic実装に差し替える
import { provider } from "@/lib/sophia/provider";

export async function POST(req: Request) {
  const body = await req.json();

  // MVP: 単一ユーザー運用なら env で固定してもOK
  const userId = process.env.SINGLE_USER_ID as string;

  const targetType = body?.targetType as SophiaTargetType;
  const targetId = String(body?.targetId ?? "");
  const targetText = String(body?.targetText ?? "");
  const targetTitle = body?.targetTitle ? String(body.targetTitle) : undefined;
  const userAnswerJa = body?.userAnswerJa ? String(body.userAnswerJa) : undefined;

  if (!targetType || !targetId || !targetText) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const output = await runSophia({
    provider,
    targetType,
    targetTitle,
    targetText,
    userAnswerJa,
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

  return NextResponse.json({
    sophiaReportId: saved.id,
    output,
  });
}
```

---

## 6) Provider実装（差し替え用：最小サンプル）

```ts
// src/lib/sophia/provider.ts
import type { LLMProvider } from "@/lib/sophia/engine";

export const provider: LLMProvider = {
  async completeJson({ system, user, temperature }) {
    // --- ここを実際のLLMに接続する ---
    // 返すのは「JSONオブジェクト（parsed）」のみ。

    // MVPダミー（開発時のモック）
    return {
      q_meta: {
        intention: "（ダミー）意図を整理",
        misalignment: "（ダミー）ズレの可能性",
        latent_frame: "（ダミー）前提フレーム",
        premise_reflection: "（ダミー）前提の再確認",
        feedback: "（ダミー）改善フィードバック",
        socratic_trigger: {
          question_ja: "（ダミー）次に一つだけ答えてほしい質問は？",
          why_this_question: "（ダミー）この質問が前に進める理由",
          answer_format_hint: "（ダミー）箇条書きでOK",
        },
      },
      f_ultimate: {
        awareness: "（ダミー）現状の気づき",
        classification: "（ダミー）状況分類",
        navigation: {
          next_step: "（ダミー）次の一歩",
          options: ["A案", "B案"],
          recommended: "A案",
        },
        verification: {
          assumptions: ["前提A"],
          risks: ["リスクA"],
          what_to_confirm_next: ["確認A"],
        },
        redefine: "（ダミー）再定義",
        meta_check: "（ダミー）メタチェック",
        r_update: {
          metrics: ["返信率", "応募数"],
          cadence: "週次",
        },
      },
      artifacts: {
        summary_ja: "（ダミー）要約",
      },
    };
  },
};
```

---

## 7) UIからの呼び出し例（Job分析ボタン）

```ts
async function runSophiaOnJob(jobId: string, jobText: string) {
  const res = await fetch("/api/sophia/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      targetType: "job",
      targetId: jobId,
      targetTitle: "Job Analysis",
      targetText: jobText,
    }),
  });
  if (!res.ok) throw new Error("Sophia analyze failed");
  return res.json();
}
```

---

## 8) 実運用のガード（壊れにくくする）

- **Zod検証は必須**（JSON崩壊が最大事故）
- 崩れたら：rawをログ保存 → temperature低下 → schema_hint厳格化 → リトライ最大2回
- SophiaReportは資産：Profile / Job / Proposal の3種で保存し、週次で勝ち筋抽出

