import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JobAnalyzeShell } from "@/components/jobs/job-analyze-shell";

interface JobAnalyzePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata(
  { params }: JobAnalyzePageProps
): Promise<Metadata> {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
  });

  if (!job) {
    return { title: "Job Not Found" };
  }

  return {
    title: `分析: ${job.title} | UpWork Terminal`,
    description: job.description?.substring(0, 160),
  };
}

export default async function JobAnalyzePage({
  params,
}: JobAnalyzePageProps) {
  // サーバー側で Job を取得
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      proposals: {
        select: {
          id: true,
          status: true,
          connectsUsed: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!job) {
    notFound();
  }

  return (
    <div className="h-screen bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900">案件分析</h1>
        <p className="text-sm text-gray-600">{job.title}</p>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-120px)]">
        <JobAnalyzeShell job={job} />
      </div>
    </div>
  );
}
