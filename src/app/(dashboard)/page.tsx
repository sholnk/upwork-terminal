import { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  TrendingUp,
  Target,
  Zap,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ダッシュボード | UpWork Terminal",
  description: "Manage your freelance work on UpWork",
};

/**
 * Dashboard Home Page
 *
 * Main dashboard with key statistics and quick links
 */
export default async function DashboardPage() {
  const userId = process.env.SINGLE_USER_ID;
  if (!userId) {

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-700">
            The environment variable <code>SINGLE_USER_ID</code> is not set.
          </p>
          <p className="text-gray-600 mt-2 text-sm">
            Please configure this in your Vercel Project Settings.
          </p>
        </div>
      </div>
    );
  }

  // Fetch data for dashboard
  const [jobs, proposals, savedJobs] = await Promise.all([
    prisma.job.count({ where: { userId } }),
    prisma.proposal.count({ where: { userId } }),
    prisma.job.count({ where: { userId, saved: true } }),
  ]);

  // Get recent activities
  const recentJobs = await prisma.job.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      createdAt: true,
      saved: true,
    },
  });

  const recentProposals = await prisma.proposal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      job: {
        select: { title: true },
      },
    },
  });

  return (
    <div className="space-y-6 p-6 lg:ml-64">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-600 mt-2">
          UpWorkでのフリーランス活動を一元管理
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{jobs}</p>
                <p className="text-sm text-gray-600 mt-1">全案件</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{proposals}</p>
                <p className="text-sm text-gray-600 mt-1">送信提案</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{savedJobs}</p>
                <p className="text-sm text-gray-600 mt-1">保存案件</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600 mt-1">アクティブ契約</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/jobs">
          <Card className="hover:border-blue-300 transition cursor-pointer">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900">案件を探す</h3>
              <p className="text-sm text-gray-600 mt-2">
                UpWorkで新しい案件を検索・分析
              </p>
              <Button
                size="sm"
                className="mt-4 w-full"
                variant="outline"
              >
                案件リサーチ →
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/proposals">
          <Card className="hover:border-green-300 transition cursor-pointer">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900">提案を管理</h3>
              <p className="text-sm text-gray-600 mt-2">
                提案の作成・修正・送信
              </p>
              <Button
                size="sm"
                className="mt-4 w-full"
                variant="outline"
              >
                提案管理 →
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/settings">
          <Card className="hover:border-purple-300 transition cursor-pointer">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900">設定</h3>
              <p className="text-sm text-gray-600 mt-2">
                プロフィール・自動同期設定
              </p>
              <Button
                size="sm"
                className="mt-4 w-full"
                variant="outline"
              >
                設定ページ →
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>最近の案件</CardTitle>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-8">
                案件がまだありません
              </p>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {job.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(job.createdAt).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                      {job.saved && (
                        <Badge variant="secondary" className="text-xs">
                          保存
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Proposals */}
        <Card>
          <CardHeader>
            <CardTitle>最近の提案</CardTitle>
          </CardHeader>
          <CardContent>
            {recentProposals.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-8">
                提案がまだありません
              </p>
            ) : (
              <div className="space-y-3">
                {recentProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {proposal.job.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(proposal.createdAt).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                      <Badge
                        variant={
                          proposal.status === "draft"
                            ? "secondary"
                            : proposal.status === "submitted"
                              ? "default"
                              : proposal.status === "accepted"
                                ? "outline"
                                : "destructive"
                        }
                        className="text-xs"
                      >
                        {proposal.status === "draft"
                          ? "下書き"
                          : proposal.status === "submitted"
                            ? "送信"
                            : proposal.status === "accepted"
                              ? "採用"
                              : "不採用"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
