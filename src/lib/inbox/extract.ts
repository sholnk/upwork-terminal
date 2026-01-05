/**
 * URL and content extraction from email text
 * Handles UpWork job links and other important content
 */

/**
 * Extract URLs from email text (subject + body)
 * Returns both URLs and extracted text
 */
export interface ExtractedContent {
  jobLinks: string[];
  textExtracts: string[];
}

/**
 * URL regex pattern - matches http/https URLs
 */
const URL_REGEX =
  /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&/=]*)/gi;

/**
 * UpWork job URL pattern
 * Examples:
 * - https://www.upwork.com/jobs/...
 * - https://upwork.com/jobs/...
 */
const UPWORK_JOB_REGEX = /https?:\/\/(?:www\.)?upwork\.com\/jobs\/[\w\-]+/gi;

/**
 * Extract content from email (subject + body)
 */
export function extractEmailContent(
  subject: string,
  body: string
): ExtractedContent {
  const fullText = `${subject}\n${body}`;

  // Extract UpWork job links
  const jobLinks: string[] = [];
  const jobMatches = fullText.match(UPWORK_JOB_REGEX);
  if (jobMatches) {
    jobLinks.push(
      ...jobMatches.map((url) => url.toLowerCase()).filter((url, i, arr) => arr.indexOf(url) === i) // dedupe
    );
  }

  // Extract other URLs (non-UpWork)
  const allUrls: string[] = [];
  const urlMatches = fullText.match(URL_REGEX);
  if (urlMatches) {
    allUrls.push(
      ...urlMatches
        .map((url) => url.toLowerCase())
        .filter((url) => !url.includes("upwork.com")) // exclude UpWork URLs
        .filter((url, i, arr) => arr.indexOf(url) === i) // dedupe
    );
  }

  // Extract text snippets (sentences containing certain keywords)
  const textExtracts = extractKeywordSnippets(fullText);

  return {
    jobLinks,
    textExtracts: [...allUrls, ...textExtracts],
  };
}

/**
 * Extract snippets containing important keywords
 */
function extractKeywordSnippets(text: string): string[] {
  const keywords = [
    "job",
    "project",
    "proposal",
    "connect",
    "bid",
    "contract",
    "invite",
    "message",
    "urgent",
    "fixed",
    "hourly",
    "budget",
  ];

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
  const snippets: string[] = [];

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (keywords.some((kw) => lower.includes(kw))) {
      const snippet = sentence.trim().substring(0, 200); // limit length
      if (snippet && !snippets.includes(snippet)) {
        snippets.push(snippet);
      }
    }
  }

  return snippets.slice(0, 3); // return top 3 snippets
}

/**
 * Extract a single canonical UpWork job ID from a URL
 * Example: https://www.upwork.com/jobs/123456789-description => 123456789
 */
export function extractUpworkJobId(url: string): string | null {
  const match = url.match(/\/jobs\/([\d]+)/);
  return match ? match[1] : null;
}

/**
 * Check if a URL is likely an UpWork job URL
 */
export function isUpworkJobUrl(url: string): boolean {
  return /upwork\.com\/jobs\/[\w\-]+/i.test(url);
}
