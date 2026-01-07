/**
 * CSV Job Import Parser
 * Parses job data from CSV file
 */

import { z } from "zod";

export const CSVJobRowSchema = z.object({
  title: z.string().min(3, "タイトルは3文字以上必要です"),
  description: z.string().min(10, "説明は10文字以上必要です"),
  upworkJobId: z.string().optional(),
  skills: z.array(z.string()).min(1, "少なくとも1つのスキルが必要です"), // Array of skills
  budget: z.number().optional(),
  budgetType: z.enum(["hourly", "fixed"]).optional(),
  experienceLevel: z.enum(["entry", "intermediate", "expert"]).optional(),
  url: z.string().url().optional(),
  source: z.literal("csv").optional(),
});

export type CSVJobRow = z.infer<typeof CSVJobRowSchema>;

export interface ParsedJob {
  title: string;
  description: string;
  upworkJobId?: string;
  skills: string[];
  budget?: number;
  budgetType?: "hourly" | "fixed";
  experienceLevel?: string;
  url?: string;
  source: "csv";
}

export interface ParseResult {
  success: number;
  failed: number;
  jobs: ParsedJob[];
  errors: Array<{
    row: number;
    error: string;
  }>;
}

/**
 * Parse CSV content and return job records
 */
export function parseCSVContent(content: string): ParseResult {
  const lines = content.split("\n").filter((line) => line.trim());
  const result: ParseResult = {
    success: 0,
    failed: 0,
    jobs: [],
    errors: [],
  };

  if (lines.length < 2) {
    result.errors.push({
      row: 0,
      error: "CSVファイルにヘッダーと少なくとも1行のデータが必要です",
    });
    return result;
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);
  const titleIdx = headers.indexOf("title");
  const descIdx = headers.indexOf("description");
  const skillsIdx = headers.indexOf("skills");
  const budgetIdx = headers.indexOf("budget");
  const budgetTypeIdx = headers.indexOf("budgetType");
  const expIdx = headers.indexOf("experienceLevel");
  const urlIdx = headers.indexOf("url");
  const jobIdIdx = headers.indexOf("upworkJobId");

  if (titleIdx === -1 || descIdx === -1 || skillsIdx === -1) {
    result.errors.push({
      row: 1,
      error: "必須列 (title, description, skills) がありません",
    });
    return result;
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCSVLine(lines[i]);

    try {
      const job: ParsedJob = {
        title: cells[titleIdx] || "",
        description: cells[descIdx] || "",
        skills: (cells[skillsIdx] || "")
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
        source: "csv",
      };

      // Optional fields
      if (jobIdIdx !== -1 && cells[jobIdIdx]) {
        job.upworkJobId = cells[jobIdIdx];
      }

      if (budgetIdx !== -1 && cells[budgetIdx]) {
        const budget = parseFloat(cells[budgetIdx]);
        if (!isNaN(budget)) job.budget = budget;
      }

      if (budgetTypeIdx !== -1 && cells[budgetTypeIdx]) {
        job.budgetType = cells[budgetTypeIdx] as "hourly" | "fixed";
      }

      if (expIdx !== -1 && cells[expIdx]) {
        job.experienceLevel = cells[expIdx];
      }

      if (urlIdx !== -1 && cells[urlIdx]) {
        job.url = cells[urlIdx];
      }

      // Validate
      CSVJobRowSchema.parse(job);

      result.jobs.push(job);
      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push({
        row: i + 1,
        error: error instanceof Error ? error.message : "パースエラー",
      });
    }
  }

  return result;
}

/**
 * Parse CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Generate CSV template for download
 */
export function generateCSVTemplate(): string {
  const headers = [
    "title",
    "description",
    "skills",
    "budget",
    "budgetType",
    "experienceLevel",
    "upworkJobId",
    "url",
  ];

  const template = [
    headers.join(","),
    `"React コンポーネント開発","React 18で新しいダッシュボードコンポーネントを開発してください","React,TypeScript,Tailwind","5000","fixed","expert","12345","https://upwork.com/jobs/..."`,
  ];

  return template.join("\n");
}
