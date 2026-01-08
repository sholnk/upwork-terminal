import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { isTokenExpired, isOAuthConfigured } from "@/lib/upwork/oauth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpworkConnectionCard } from "@/components/settings/upwork-connection-card";

export const metadata: Metadata = {
  title: "設定 | UpWork Terminal",
  description: "Application settings and preferences",
};

export const dynamic = "force-dynamic";

async function getConnectionStatus() {
  const userId = process.env.SINGLE_USER_ID;

  if (!userId) {
    return { isConnected: false, oauthConfigured: false };
  }

  const oauthConfigured = isOAuthConfigured();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      accessToken: true,
      tokenExpiry: true,
      upworkUserId: true,
    },
  });

  const isConnected = !!(user?.accessToken && !isTokenExpired(user.tokenExpiry));


  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: userId },
  });

  return {
    isConnected,
    oauthConfigured,
    upworkUserId: user?.upworkUserId,
    tokenExpiry: user?.tokenExpiry,
    userSettings,
  };
}

/**
 * Settings Page
 *
 * ユーザー設定・自動同期等の管理
 */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { isConnected, oauthConfigured, tokenExpiry } = await getConnectionStatus();
  const params = await searchParams;

  return (
    <div className="space-y-6 p-6 lg:ml-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">設定</h1>
        <p className="text-gray-600 mt-2">
          アプリケーション設定・プロフィール管理
        </p>
      </div>

      {/* Success/Error Messages */}
      {params.success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {params.success}
        </div>
      )}
      {params.error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {params.error}
        </div>
      )}

      {/* UpWork Connection */}
      <UpworkConnectionCard
        isConnected={isConnected}
        oauthConfigured={oauthConfigured}
        tokenExpiry={tokenExpiry?.toISOString()}
      />

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">自動同期設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">同期間隔</label>
            <div className="flex gap-2 mt-2">
              <input
                type="number"
                placeholder="30"
                className="w-24 px-3 py-2 border rounded-md"
                defaultValue="30"
                disabled={!isConnected}
              />
              <span className="flex items-center text-sm text-gray-600">
                分ごと
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              UpWorkから案件・提案・契約を自動同期します
            </p>
          </div>

          <button
            className="w-full px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isConnected}
          >
            今すぐ同期
          </button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">通知設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900">
              新規案件の通知
            </label>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900">
              提案返信の通知
            </label>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 cursor-pointer"
            />
          </div>

          <button className="w-full px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">
            保存
          </button>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">アプリケーション情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">バージョン</span>
            <span className="font-medium text-gray-900">0.1.0 (Beta)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">ステータス</span>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "UpWork連携中" : "未連携"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
