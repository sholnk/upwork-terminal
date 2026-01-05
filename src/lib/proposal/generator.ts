import Anthropic from "@anthropic-ai/sdk";
import type { ProposalInput, ProposalOutput } from "@/lib/schemas/proposal";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate proposal in Japanese and English using Claude
 */
export async function generateProposal(input: ProposalInput): Promise<ProposalOutput> {
  const { jobTitle, jobDescription, type } = input;

  // Build the prompt based on template type
  let templatePrompt = "";
  if (type === "A") {
    // Type A: Short Deliverable
    templatePrompt = `
Please generate a SHORT and DIRECT proposal in Japanese (then English) for this job.

Format (Japanese):
---
【提案概要】
${input.summaryJa || "（要約を記入）"}

【実装方法】
${input.approachJa || "（アプローチを記入）"}

【期間】
${input.timelineJa || "（期間を記入）"}

【価格】
${input.rateJa || "（価格を記入）"}
---

Keep it concise and focused on quick value delivery. 2-3 sentences per section max.
Then provide the same proposal in English with the same structure.`;
  } else {
    // Type B: Audit → Build (2-phase)
    templatePrompt = `
Please generate a DETAILED 2-phase proposal in Japanese (then English) for this job.

Format (Japanese):
---
【プロジェクト概要】
${input.summaryJa || "（要約を記入）"}

【Phase 1: 監査・分析】
スコープ: ${input.auditScopeJa || "（監査スコープを記入）"}
期間: ${input.auditTimelineJa || "（期間を記入）"}
費用: ${input.auditRate || "TBD"}円

【Phase 2: 実装】
スコープ: ${input.buildScopeJa || "（実装スコープを記入）"}
期間: ${input.buildTimelineJa || "（期間を記入）"}
費用: ${input.buildRate || "TBD"}円

【合計】
総費用: ${input.totalRate || "TBD"}円
---

Provide a professional 2-phase approach with clear deliverables for each phase.
Then provide the same proposal in English with the same structure.`;
  }

  const prompt = `
Job Title: ${jobTitle}
Job Description: ${jobDescription}

${templatePrompt}

IMPORTANT:
- Write the Japanese proposal first
- Then write the English proposal
- Make them professional, concise, and compelling
- Show clear understanding of the job requirements
- Highlight unique value you bring
- Format with clear sections using 【】 for Japanese and **bold** for English sections
`;

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Extract text content
  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const responseText = content.text;

  // Split into Japanese and English sections
  const sections = responseText.split(/(?=(?:^|\n)\*\*)/);
  const japaneseText = sections[0].trim();
  const englishText = sections[1]?.trim() || responseText;

  // Create summary
  const summary = japaneseText.split("\n")[0].substring(0, 100) + "...";

  return {
    type,
    textJa: japaneseText,
    textEn: englishText,
    estimatedWords: japaneseText.split(" ").length + englishText.split(" ").length,
    summary,
  };
}
