"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, X } from "lucide-react";

interface JobFormData {
  upworkUrl?: string;
  title: string;
  description: string;
  skills: string[];
  category?: string;
  budgetType: "hourly" | "fixed";
  budget?: number;
  experienceLevel?: string;
  duration?: string;
}

interface JobManualEntryFormProps {
  onSuccess?: (jobId: string) => void;
  defaultValues?: Partial<JobFormData>;
}

export function JobManualEntryForm({
  onSuccess,
  defaultValues,
}: JobManualEntryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<JobFormData>({
    upworkUrl: defaultValues?.upworkUrl || "",
    title: defaultValues?.title || "",
    description: defaultValues?.description || "",
    skills: defaultValues?.skills || [],
    category: defaultValues?.category || "",
    budgetType: defaultValues?.budgetType || "fixed",
    budget: defaultValues?.budget,
    experienceLevel: defaultValues?.experienceLevel || "Intermediate",
    duration: defaultValues?.duration || "",
  });

  const [skillInput, setSkillInput] = useState("");

  // Add skill to list
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, trimmed],
      });
      setSkillInput("");
    }
  };

  // Remove skill from list
  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  // Scrape job details from URL
  const handleScrapeUrl = async () => {
    if (!formData.upworkUrl) {
      setError("Please enter an Upwork URL");
      return;
    }

    setScraping(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/jobs/import-from-upwork?url=${encodeURIComponent(
          formData.upworkUrl
        )}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.message || data.error || "Failed to scrape job details"
        );
      }

      const data = await response.json();
      const preview = data.preview;

      // Populate form with scraped data
      setFormData({
        ...formData,
        title: preview.title || formData.title,
        description: preview.description || formData.description,
        skills: preview.skills || formData.skills,
        budget: preview.budget || formData.budget,
        budgetType: preview.budgetType || formData.budgetType,
        experienceLevel:
          preview.experienceLevel || formData.experienceLevel,
        duration: preview.duration || formData.duration,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to scrape job details. You can fill in the form manually."
      );
    } finally {
      setScraping(false);
    }
  };

  // Submit form to create job
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }
      if (!formData.description.trim()) {
        throw new Error("Description is required");
      }

      // If we have a URL, use the import endpoint
      if (formData.upworkUrl) {
        const response = await fetch("/api/jobs/import-from-upwork", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            upworkJobUrl: formData.upworkUrl,
            manualOverrides: {
              title: formData.title,
              description: formData.description,
              skills: formData.skills,
              budget: formData.budget,
              budgetType: formData.budgetType,
            },
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to import job");
        }

        const data = await response.json();

        if (onSuccess) {
          onSuccess(data.jobId);
        } else {
          router.push(`/jobs/${data.jobId}/analyze`);
        }
      } else {
        // Create manual job (no URL)
        const response = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            upworkJobId: `manual-${Date.now()}`,
            title: formData.title,
            description: formData.description,
            skills: formData.skills,
            category: formData.category || undefined,
            budget: formData.budget,
            budgetType: formData.budgetType,
            experienceLevel: formData.experienceLevel,
            duration: formData.duration,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create job");
        }

        const data = await response.json();

        if (onSuccess) {
          onSuccess(data.jobId);
        } else {
          router.push(`/jobs/${data.jobId}/analyze`);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save job"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>新規ジョブ追加</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upwork URL Section */}
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <Label htmlFor="url" className="text-sm font-medium">
                Upwork ジョブ URL (オプション)
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                URL を入力すると自動で詳細情報を取得できます
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                id="url"
                type="text"
                placeholder="https://www.upwork.com/jobs/1234567"
                value={formData.upworkUrl}
                onChange={(e) =>
                  setFormData({ ...formData, upworkUrl: e.target.value })
                }
                disabled={scraping || loading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleScrapeUrl}
                disabled={scraping || loading || !formData.upworkUrl}
              >
                {scraping && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {scraping ? "取得中..." : "自動取得"}
              </Button>
            </div>
            {success && (
              <p className="text-xs text-green-600">✓ 情報を取得しました</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              タイトル *
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="例: React Developer needed for e-commerce site"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              disabled={loading}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              説明 *
            </Label>
            <Textarea
              id="description"
              placeholder="ジョブの詳細説明を入力してください..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={loading}
              required
              rows={5}
            />
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label htmlFor="skills" className="text-sm font-medium">
              スキル
            </Label>
            <div className="flex gap-2">
              <Input
                id="skills"
                type="text"
                placeholder="スキル名を入力"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                disabled={loading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSkill}
                disabled={loading || !skillInput.trim()}
              >
                追加
              </Button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Budget Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetType" className="text-sm font-medium">
                予算タイプ
              </Label>
              <select
                id="budgetType"
                value={formData.budgetType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budgetType: e.target.value as "hourly" | "fixed",
                  })
                }
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="fixed">固定料金</option>
                <option value="hourly">時間単価</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget" className="text-sm font-medium">
                予算額 (USD)
              </Label>
              <Input
                id="budget"
                type="number"
                placeholder="1000"
                value={formData.budget || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                disabled={loading}
                min="0"
              />
            </div>
          </div>

          {/* Experience Level & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expLevel" className="text-sm font-medium">
                経験レベル
              </Label>
              <select
                id="expLevel"
                value={formData.experienceLevel || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    experienceLevel: e.target.value,
                  })
                }
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">選択してください</option>
                <option value="Entry Level">Entry Level</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium">
                期間
              </Label>
              <Input
                id="duration"
                type="text"
                placeholder="例: 1-3 months"
                value={formData.duration || ""}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                disabled={loading}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              カテゴリ
            </Label>
            <Input
              id="category"
              type="text"
              placeholder="例: Web Development"
              value={formData.category || ""}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || scraping}
              className="flex-1"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "保存中..." : "保存"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
