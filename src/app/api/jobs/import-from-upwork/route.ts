/**
 * POST /api/jobs/import-from-upwork
 * Imports a job from Upwork by scraping its details
 * Falls back to manual entry if scraping fails
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { scrapeUpworkJob } from "@/lib/scraper/upwork-scraper";
import { extractUpworkJobId } from "@/lib/upwork/url-parser";

const ImportJobSchema = z.object({
  upworkJobUrl: z.string().url().or(z.string().regex(/^\d+$/)),
  manualOverrides: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      budget: z.number().optional(),
      budgetType: z.enum(["hourly", "fixed"]).optional(),
      skills: z.array(z.string()).optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Validate request
    const body = await request.json();
    const parsed = ImportJobSchema.parse(body);

    const userId = process.env.SINGLE_USER_ID;
    if (!userId) {
      return NextResponse.json(
        { error: "Single user ID not configured" },
        { status: 500 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extract job ID
    const jobId = extractUpworkJobId(parsed.upworkJobUrl);
    if (!jobId) {
      return NextResponse.json(
        { error: "Invalid Upwork job URL or ID" },
        { status: 400 }
      );
    }

    // Check if job already exists
    const existingJob = await prisma.job.findUnique({
      where: { upworkJobId: jobId },
    });

    if (existingJob) {
      return NextResponse.json(
        {
          jobId: existingJob.id,
          status: "already_exists",
          message: "This job is already in your database",
        },
        { status: 200 }
      );
    }

    // Attempt to scrape job details
    let scrapedData;
    let scrapingError;

    try {
      console.log("[API] Attempting to scrape job...");
      scrapedData = await scrapeUpworkJob(parsed.upworkJobUrl);
      console.log("[API] Scraping successful");
    } catch (error) {
      scrapingError = error instanceof Error ? error.message : "Unknown error";
      console.warn(`[API] Scraping failed: ${scrapingError}`);
      console.warn("[API] Will create job with minimal data");
    }

    // Merge scraped data with manual overrides
    const jobData = {
      upworkJobId: jobId,
      title: parsed.manualOverrides?.title || scrapedData?.title || `Job #${jobId}`,
      description:
        parsed.manualOverrides?.description || scrapedData?.description || "",
      skills: parsed.manualOverrides?.skills || scrapedData?.skills || [],
      budget: parsed.manualOverrides?.budget || scrapedData?.budget || undefined,
      budgetType:
        parsed.manualOverrides?.budgetType || scrapedData?.budgetType || undefined,
      category: scrapedData?.category,
      subcategory: scrapedData?.subcategory,
      duration: scrapedData?.duration,
      experienceLevel: scrapedData?.experienceLevel,
      postedAt: scrapedData?.postedAt || new Date(),
      url: scrapedData?.url || `https://www.upwork.com/jobs/${jobId}`,
      userId,
      source: "upwork" as const,
      saved: true,
      clientInfo: scrapedData?.clientInfo,
    };

    // Create job in database
    const newJob = await prisma.job.create({
      data: jobData,
    });

    // Return success response
    return NextResponse.json(
      {
        jobId: newJob.id,
        upworkJobId: newJob.upworkJobId,
        status: "created",
        title: newJob.title,
        scrapedSuccessfully: !scrapingError,
        scrapingError: scrapingError || null,
        message: scrapingError
          ? "Job created with minimal data. Please review and fill in details."
          : "Job imported successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Error importing job:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to import job",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/jobs/import-from-upwork?url=...
 * Preview what will be scraped without creating a job
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter required" },
        { status: 400 }
      );
    }

    const jobId = extractUpworkJobId(url);
    if (!jobId) {
      return NextResponse.json(
        { error: "Invalid Upwork job URL or ID" },
        { status: 400 }
      );
    }

    console.log("[API] Preview scraping job...");
    const scrapedData = await scrapeUpworkJob(url);

    return NextResponse.json(
      {
        jobId,
        preview: scrapedData,
        status: "preview_success",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Preview error:", error);

    return NextResponse.json(
      {
        status: "preview_failed",
        error: error instanceof Error ? error.message : "Unknown error",
        message:
          "Could not preview this job. You can still import it manually by filling in the details.",
      },
      { status: 400 }
    );
  }
}
