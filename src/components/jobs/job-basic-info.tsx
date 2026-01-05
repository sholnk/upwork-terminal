"use client";

import type { Job } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { ExternalLink, Calendar, DollarSign, Briefcase } from "lucide-react";

interface JobBasicInfoProps {
  job: Job;
}

/**
 * JobBasicInfo Component
 *
 * Job の基本情報表示
 * - タイトル、説明
 * - 予算、カテゴリー、スキル
 * - 投稿日時
 */
export function JobBasicInfo({ job }: JobBasicInfoProps) {
  return (
    <div className="space-y-4">
      {/* タイトル */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
        <p className="text-sm text-gray-600">
          {job.category}
          {job.subcategory && ` / ${job.subcategory}`}
        </p>
      </div>

      {/* 説明 */}
      {job.description && (
        <div>
          <p className="text-sm text-gray-700 line-clamp-3">
            {job.description}
          </p>
        </div>
      )}

      {/* 情報行 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 予算 */}
        {job.budget && (
          <div className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-600">予算</p>
              <p className="text-sm font-semibold text-gray-900">
                ${job.budget.toFixed(0)}
                {job.budgetType === "hourly" && "/時間"}
              </p>
            </div>
          </div>
        )}

        {/* 投稿日 */}
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-600">投稿</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatDistanceToNow(new Date(job.postedAt), {
                addSuffix: true,
                locale: ja,
              })}
            </p>
          </div>
        </div>

        {/* 期間 */}
        {job.duration && (
          <div className="flex items-start gap-2">
            <Briefcase className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-600">期間</p>
              <p className="text-sm font-semibold text-gray-900">
                {job.duration}
              </p>
            </div>
          </div>
        )}

        {/* ジョブタイプ */}
        {job.jobType && (
          <div className="flex items-start gap-2">
            <Briefcase className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-600">タイプ</p>
              <p className="text-sm font-semibold text-gray-900">
                {job.jobType}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* スキル */}
      {job.skills && job.skills.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">
            必要なスキル
          </p>
          <div className="flex flex-wrap gap-1">
            {job.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* リンク */}
      <div className="pt-2">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
        >
          UpWorkで見る
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
