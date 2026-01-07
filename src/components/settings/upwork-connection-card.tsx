"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link2, Link2Off, AlertCircle, CheckCircle2 } from "lucide-react";

interface UpworkConnectionCardProps {
    isConnected: boolean;
    oauthConfigured: boolean;
    tokenExpiry?: string | null;
}

export function UpworkConnectionCard({
    isConnected,
    oauthConfigured,
    tokenExpiry,
}: UpworkConnectionCardProps) {
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const handleDisconnect = async () => {
        if (!confirm("UpWork連携を解除しますか？")) {
            return;
        }

        setIsDisconnecting(true);

        try {
            const response = await fetch("/api/auth/upwork/disconnect", {
                method: "POST",
            });

            if (response.ok) {
                window.location.reload();
            } else {
                alert("連携解除に失敗しました");
            }
        } catch {
            alert("連携解除に失敗しました");
        } finally {
            setIsDisconnecting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">UpWork連携</CardTitle>
                    <Badge variant={isConnected ? "default" : "secondary"}>
                        {isConnected ? (
                            <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                連携中
                            </>
                        ) : (
                            "未連携"
                        )}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {!oauthConfigured && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <p className="font-medium">OAuth設定が必要です</p>
                            <p className="mt-1">
                                <code className="bg-yellow-100 px-1 rounded">UPWORK_CLIENT_ID</code>
                                と
                                <code className="bg-yellow-100 px-1 rounded">UPWORK_CLIENT_SECRET</code>
                                を .env に設定してください。
                            </p>
                            <p className="mt-1">
                                <a
                                    href="https://www.upwork.com/developer/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-yellow-900 underline"
                                >
                                    UpWork Developer Portal →
                                </a>
                            </p>
                        </div>
                    </div>
                )}

                {isConnected ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            UpWorkアカウントと連携しています
                        </div>

                        {tokenExpiry && (
                            <div className="text-xs text-gray-500">
                                トークン有効期限:{" "}
                                {new Date(tokenExpiry).toLocaleString("ja-JP")}
                            </div>
                        )}

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleDisconnect}
                            disabled={isDisconnecting}
                        >
                            <Link2Off className="w-4 h-4 mr-2" />
                            {isDisconnecting ? "解除中..." : "連携を解除"}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                            UpWorkアカウントと連携して、プロフィール・案件・提案を同期します。
                        </p>

                        <Button
                            asChild
                            className="w-full"
                            disabled={!oauthConfigured}
                        >
                            <a href="/api/auth/upwork">
                                <Link2 className="w-4 h-4 mr-2" />
                                UpWorkと連携
                            </a>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
