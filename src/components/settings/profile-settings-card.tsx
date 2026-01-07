
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Save, Check, AlertCircle } from "lucide-react";

interface ProfileSettingsCardProps {
    initialTitle?: string | null;
    initialOverview?: string | null;
    initialHourlyRate?: number | null;
    initialSkills?: string[];
    isConnected: boolean;
}

export function ProfileSettingsCard({
    initialTitle,
    initialOverview,
    initialHourlyRate,
    initialSkills,
    isConnected,
}: ProfileSettingsCardProps) {
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [formData, setFormData] = useState({
        title: initialTitle || "",
        overview: initialOverview || "",
        hourlyRate: initialHourlyRate?.toString() || "",
        skills: initialSkills?.join(", ") || "",
    });

    const handleSync = async () => {
        if (!isConnected) return;
        setSyncing(true);
        setStatus(null);
        try {
            const res = await fetch("/api/profile/sync");
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Sync failed");

            setFormData({
                title: data.profile.title || "",
                overview: data.profile.overview || "",
                hourlyRate: data.profile.hourlyRate || "",
                skills: data.profile.skills?.join(", ") || "",
            });
            setStatus({ type: "success", message: "同期しました" });
            setTimeout(() => setStatus(null), 3000);
        } catch (error) {
            console.error(error);
            setStatus({ type: "error", message: "同期に失敗しました" });
        } finally {
            setSyncing(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setStatus(null);
        try {
            const res = await fetch("/api/profile/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    overview: formData.overview,
                    hourlyRate: formData.hourlyRate,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Update failed");

            setStatus({ type: "success", message: "保存しました" });
            setTimeout(() => setStatus(null), 3000);
        } catch (error) {
            console.error(error);
            setStatus({ type: "error", message: error instanceof Error ? error.message : "保存に失敗しました" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">プロフィール設定</CardTitle>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSync}
                    disabled={!isConnected || syncing}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                    UpWorkから同期
                </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">タイトル ({formData.title.length}/70)</label>
                    <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        maxLength={70}
                        placeholder="Senior Full Stack Developer"
                        disabled={!isConnected}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">自己紹介 (Overview)</label>
                    <Textarea
                        value={formData.overview}
                        onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                        placeholder="I have 10 years of experience..."
                        className="h-32"
                        disabled={!isConnected}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">時給 ($)</label>
                        <Input
                            type="number"
                            value={formData.hourlyRate}
                            onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                            placeholder="50.00"
                            disabled={!isConnected}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">主要スキル (同期のみ)</label>
                        <Input
                            value={formData.skills}
                            readOnly
                            className="bg-gray-50"
                            placeholder="Skills from UpWork"
                            disabled={true}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {status && (
                        <span className={`text-sm flex items-center ${status.type === "success" ? "text-green-600" : "text-red-600"}`}>
                            {status.type === "success" ? <Check className="w-4 h-4 mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />}
                            {status.message}
                        </span>
                    )}
                    <Button
                        className="w-full md:w-auto ml-auto"
                        onClick={handleSave}
                        disabled={!isConnected || loading}
                    >
                        {loading ? "保存中..." : "UpWorkに保存"}
                        <Save className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
