/**
 * Upwork URL & Job ID Parsing Utilities
 * Handles extraction of job IDs from various Upwork URL formats
 */

/**
 * Extracts Upwork job ID from various URL formats
 * Supports:
 * - https://www.upwork.com/jobs/1234567
 * - upwork.com/jobs/1234567
 * - /jobs/1234567
 * - Just "1234567"
 */
export function extractUpworkJobId(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  // Pattern: /jobs/[digits]
  const match = url.match(/\/jobs\/(\d+)/);
  if (match && match[1]) {
    return match[1];
  }

  // If it's just digits, assume it's a job ID
  if (/^\d+$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * Constructs full Upwork job URL from job ID
 */
export function constructUpworkJobUrl(jobId: string): string {
  return `https://www.upwork.com/jobs/${jobId}`;
}

/**
 * Validates if a string is a valid Upwork URL or job ID
 */
export function isValidUpworkJob(input: string): boolean {
  return extractUpworkJobId(input) !== null;
}

/**
 * Extracts multiple URLs/IDs from text
 * Finds all Upwork job URLs in a text block
 */
export function extractAllUpworkJobIds(text: string): string[] {
  const regex = /\/jobs\/(\d+)|upwork\.com\/jobs\/(\d+)|(^|\s)(\d{7,})/gm;
  const matches = [...text.matchAll(regex)];

  const jobIds = new Set<string>();
  matches.forEach((match) => {
    // match[1] or match[2] from the URL patterns, or match[4] from standalone ID
    const jobId = match[1] || match[2] || match[4];
    if (jobId && /^\d+$/.test(jobId)) {
      jobIds.add(jobId);
    }
  });

  return Array.from(jobIds);
}
