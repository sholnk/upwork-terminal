import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "設定 | UpWork Terminal",
  description: "Application settings and preferences",
};

/**
 * Settings Page
 *
 * ユーザー設定・自動同期等の管理
 */
export default function SettingsPage() {
  return (
    <div className="space-y-6 p-6 lg:ml-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">設定</h1>
        <p className="text-gray-600 mt-2">
          アプリケーション設定・プロフィール管理
        </p>
      </div>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">自動同期設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>同期間隔</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                placeholder="30"
                className="w-24"
                defaultValue="30"
              />
              <span className="flex items-center text-sm text-gray-600">
                分ごと
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              UpWorkから案件・提案・契約を自動同期します
            </p>
          </div>

          <Button variant="outline" className="w-full">
            今すぐ同期
          </Button>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">プロフィール設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>時給（参考値）</Label>
            <Input
              type="number"
              placeholder="50"
              className="mt-2"
            />
          </div>

          <div>
            <Label>主要スキル</Label>
            <Input
              type="text"
              placeholder="JavaScript, React, Node.js"
              className="mt-2"
            />
          </div>

          <Button variant="outline" className="w-full">
            保存
          </Button>
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

          <Button variant="outline" className="w-full">
            保存
          </Button>
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
            <span className="font-medium text-green-600">稼働中</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
