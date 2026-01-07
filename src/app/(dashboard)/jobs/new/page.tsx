import { Metadata } from "next";
import { redirect } from "next/navigation";
import { JobManualEntryForm } from "@/components/jobs/job-manual-entry-form";

export const metadata: Metadata = {
  title: "新規ジョブ追加 | UpWork Terminal",
  description: "新しいジョブを追加または Upwork からインポートします",
};

export default function NewJobPage() {
  const userId = process.env.SINGLE_USER_ID;

  if (!userId) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">新規ジョブ追加</h1>
          <p className="text-gray-600 mt-2">
            Upwork ジョブをインポートするか、手動で新しいジョブを追加します
          </p>
        </div>

        {/* Form */}
        <JobManualEntryForm />

        {/* Info Section */}
        <div className="mt-8 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 text-sm">💡 使い方のヒント</h3>
            <ul className="mt-2 text-sm text-blue-800 space-y-1 ml-4 list-disc">
              <li>
                <strong>Upwork URL から自動取得:</strong> Upwork ジョブ URL を貼り付けて「自動取得」
                ボタンを押すと、詳細情報が自動抽出されます
              </li>
              <li>
                <strong>手動入力:</strong> フォームに直接情報を入力して、ジョブを追加します
              </li>
              <li>
                <strong>スキル管理:</strong> 複数のスキルを追加でき、提案生成時に活用されます
              </li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 text-sm">
              ✓ ジョブ追加後の流れ
            </h3>
            <ul className="mt-2 text-sm text-green-800 space-y-1 ml-4 list-decimal">
              <li>ジョブが保存されます</li>
              <li>分析ページで Sophia 分析を実行できます</li>
              <li>スコア付けと提案生成が可能になります</li>
              <li>提案文を自動生成して、そのまま Upwork に投稿できます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
