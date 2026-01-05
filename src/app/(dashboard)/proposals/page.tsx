import { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "提案 | UpWork Terminal",
  description: "Your proposals and draft submissions",
};

/**
 * Proposals Page
 *
 * Shows all proposals with stats
 */
export default async function ProposalsPage() {
  const userId = process.env.SINGLE_USER_ID;
  if (!userId) {
    redirect("/");
  }

  // Fetch proposals with job details
  const proposals = await prisma.proposal.findMany({
    where: { userId },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          budget: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate stats
  const stats = {
    total: proposals.length,
    draft: proposals.filter((p) => p.status === "draft").length,
    submitted: proposals.filter((p) => p.status === "submitted").length,
    accepted: proposals.filter((p) => p.status === "accepted").length,
    declined: proposals.filter((p) => p.status === "declined").length,
  };

  const getStatusColor = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "draft":
        return "secondary";
      case "submitted":
        return "default";
      case "accepted":
        return "outline";
      case "declined":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "draft":
        return "下書き";
      case "submitted":
        return "送信済み";
      case "accepted":
        return "採用";
      case "declined":
        return "不採用";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">提案管理</h1>
        <p className="text-gray-600 mt-2">
          {stats.total}件の提案を管理中
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600 mt-1">全体</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-blue-600">{stats.draft}</p>
            <p className="text-sm text-gray-600 mt-1">下書き</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-green-600">{stats.submitted}</p>
            <p className="text-sm text-gray-600 mt-1">送信済み</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-purple-600">{stats.accepted}</p>
            <p className="text-sm text-gray-600 mt-1">採用</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
            <p className="text-sm text-gray-600 mt-1">不採用</p>
          </CardContent>
        </Card>
      </div>

      {/* Proposals List */}
      <Card>
        <CardHeader>
          <CardTitle>全提案</CardTitle>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-600">提案がまだありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {proposal.job.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {proposal.coverLetter.substring(0, 100)}...
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {proposal.bidAmount && (
                      <p className="text-sm font-semibold text-gray-900">
                        ${proposal.bidAmount}
                      </p>
                    )}
                    <Badge variant={getStatusColor(proposal.status)}>
                      {getStatusLabel(proposal.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
