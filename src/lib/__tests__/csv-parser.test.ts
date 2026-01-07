/**
 * CSV Job Import Parser Tests
 */

import { parseCSVContent, generateCSVTemplate } from '@/lib/csv/job-import-parser';

describe('CSV Job Import Parser', () => {
  it('should parse valid CSV content', () => {
    const csv = `title,description,skills,budget,budgetType
"React開発","フロントエンドのコンポーネント開発","React,TypeScript","5000","fixed"`;

    const result = parseCSVContent(csv);

    expect(result.success).toBe(1);
    expect(result.failed).toBe(0);
    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].title).toBe('React開発');
    expect(result.jobs[0].skills).toContain('React');
    expect(result.jobs[0].budget).toBe(5000);
  });

  it('should handle missing required fields', () => {
    const csv = `title,description,skills,budget
"React開発","説明が足りない","React","1000"`;

    const result = parseCSVContent(csv);

    // skills array requires at least 1 element, description must be 10+ chars
    // This row will fail validation
    expect(result.success).toBe(0);
    expect(result.failed).toBe(1);
    expect(result.errors).toHaveLength(1);
  });

  it('should parse multiple rows', () => {
    const csv = `title,description,skills,budget,budgetType
"開発案件1","Reactコンポーネント開発を行う","React","1000","fixed"
"開発案件2","Vueアプリケーション構築作業","Vue","2000","hourly"`;

    const result = parseCSVContent(csv);

    expect(result.success).toBe(2);
    expect(result.jobs).toHaveLength(2);
  });

  it('should generate CSV template', () => {
    const template = generateCSVTemplate();

    expect(template).toContain('title,description');
    expect(template).toContain('React');
  });

  it('should handle quoted fields with commas', () => {
    const csv = `title,description,skills
"React API開発","API開発とテスト対応を含む","React,Node.js"`;

    const result = parseCSVContent(csv);

    expect(result.success).toBe(1);
    expect(result.jobs[0].title).toBe('React API開発');
  });
});
