/**
 * Upwork Job Scraper
 * Fetches job details from Upwork using Puppeteer
 * Used as fallback when official API is unavailable
 */

import puppeteer, { Browser, Page } from "puppeteer";
import { extractUpworkJobId, constructUpworkJobUrl } from "@/lib/upwork/url-parser";

/**
 * Scraped job details interface
 * Matches our Job schema requirements
 */
export interface ScrapedJobDetails {
  upworkJobId: string;
  title: string;
  description: string;
  category?: string;
  subcategory?: string;
  skills: string[];
  budget?: number;
  budgetType?: "hourly" | "fixed";
  duration?: string;
  experienceLevel?: string;
  postedAt: Date;
  url: string;
  clientInfo?: {
    name?: string;
    location?: string;
    memberSince?: string;
    totalSpent?: number;
  };
}

/**
 * Scrapes Upwork job details from job page
 * Returns structured job data
 */
export async function scrapeUpworkJob(
  jobUrlOrId: string
): Promise<ScrapedJobDetails | null> {
  let browser: Browser | null = null;

  try {
    const jobId = extractUpworkJobId(jobUrlOrId);
    if (!jobId) {
      throw new Error(`Invalid Upwork job URL or ID: ${jobUrlOrId}`);
    }

    const jobUrl = constructUpworkJobUrl(jobId);

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();

    // Set reasonable timeout
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(10000);

    // Set user agent to avoid blocking
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    );

    console.log(`[Scraper] Fetching job: ${jobUrl}`);

    // Navigate to job page
    await page.goto(jobUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for main job content to load
    await page.waitForSelector('[data-test="job-title"]', { timeout: 10000 });

    // Extract job details
    const jobDetails = await extractJobData(page, jobId, jobUrl);

    console.log(`[Scraper] Successfully scraped job: ${jobDetails.title}`);

    return jobDetails;
  } catch (error) {
    console.error("[Scraper] Error scraping job:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Extracts structured data from loaded job page
 */
async function extractJobData(
  page: Page,
  jobId: string,
  jobUrl: string
): Promise<ScrapedJobDetails> {
  // Use page.evaluate to run code in browser context
  const data = await page.evaluate(() => {
    const result: Record<string, unknown> = {};

    // Title
    const titleEl = document.querySelector('[data-test="job-title"]');
    result.title = titleEl?.textContent?.trim() || "";

    // Description
    const descEl = document.querySelector('[data-test="job-description"]');
    result.description = descEl?.textContent?.trim() || "";

    // Skills
    const skillEls = document.querySelectorAll('[data-test="skill-tag"]');
    result.skills = Array.from(skillEls)
      .map((el) => el.textContent?.trim())
      .filter(Boolean);

    // Budget
    const budgetEl = document.querySelector('[data-test="job-budget"]');
    const budgetText = budgetEl?.textContent || "";
    result.budgetText = budgetText;

    // Experience level
    const expEl = document.querySelector('[data-test="experience-level"]');
    result.experienceLevel = expEl?.textContent?.trim() || "";

    // Duration
    const durEl = document.querySelector('[data-test="job-duration"]');
    result.duration = durEl?.textContent?.trim() || "";

    // Client info
    const clientNameEl = document.querySelector('[data-test="client-name"]');
    const clientLocEl = document.querySelector('[data-test="client-location"]');
    result.clientName = clientNameEl?.textContent?.trim() || "";
    result.clientLocation = clientLocEl?.textContent?.trim() || "";

    // Posted time
    const timeEl = document.querySelector('time');
    result.postedTime = timeEl?.getAttribute("datetime") || new Date().toISOString();

    return result;
  });

  // Parse budget
  let budget: number | undefined;
  let budgetType: "hourly" | "fixed" | undefined;

  if (data.budgetText) {
    // Extract amount: "$50 - $100" or "$50/hr"
    const match = data.budgetText.match(/\$[\d,]+/);
    if (match) {
      budget = parseInt(match[0].replace(/[$,]/g, ""), 10);
      budgetType = data.budgetText.includes("/hr") ? "hourly" : "fixed";
    }
  }

  // Parse posted date
  let postedAt: Date;
  try {
    postedAt = new Date(data.postedTime);
  } catch {
    postedAt = new Date();
  }

  return {
    upworkJobId: jobId,
    title: data.title,
    description: data.description,
    skills: data.skills || [],
    budget,
    budgetType,
    duration: data.duration || undefined,
    experienceLevel: data.experienceLevel || undefined,
    postedAt,
    url: jobUrl,
    clientInfo: {
      name: data.clientName || undefined,
      location: data.clientLocation || undefined,
    },
  };
}

/**
 * Batch scrape multiple jobs
 */
export async function scrapeMultipleJobs(
  jobUrlsOrIds: string[]
): Promise<Array<{ jobId: string; data?: ScrapedJobDetails; error?: string }>> {
  const results: Array<{ jobId: string; data?: ScrapedJobDetails; error?: string }> = [];

  for (const jobUrlOrId of jobUrlsOrIds) {
    try {
      const data = await scrapeUpworkJob(jobUrlOrId);
      if (data) {
        results.push({
          jobId: data.upworkJobId,
          data,
        });
      }
    } catch (error) {
      results.push({
        jobId: jobUrlOrId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}
