"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProposalGenerator() {
    const [jobDescription, setJobDescription] = useState("");
    const [generatedProposal, setGeneratedProposal] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGenerate = async () => {
        if (!jobDescription) return;

        setIsLoading(true);
        setError("");
        setGeneratedProposal("");

        try {
            const response = await fetch("/api/agent/proposal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    jobDescription,
                    tone: "professional", // Default for now
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate proposal");
            }

            setGeneratedProposal(data.proposal);
        } catch (err) {
            console.error(err);
            setError("提案の生成に失敗しました。API Keyやネットワークを確認してください。");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    AI Proposal Generator
                </CardTitle>
                <CardDescription>
                    Miyabi Agent (Claude 3.5 Sonnet) が、案件内容に合わせて最適な提案文を作成します。
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="job-description">Job Description (案件内容)</Label>
                    <Textarea
                        id="job-description"
                        placeholder="ここに案件の詳細文を貼り付けてください..."
                        className="min-h-[150px]"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                    />
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleGenerate}
                        disabled={!jobDescription || isLoading}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Proposal
                            </>
                        )}
                    </Button>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {generatedProposal && (
                    <div className="mt-8 border-t pt-6">
                        <h3 className="text-lg font-semibold mb-3">Generated Proposal</h3>
                        <Tabs defaultValue="preview" className="w-full">
                            <TabsList>
                                <TabsTrigger value="preview">Preview</TabsTrigger>
                                <TabsTrigger value="raw">Raw Markdown</TabsTrigger>
                            </TabsList>
                            <TabsContent value="preview" className="mt-4 p-4 border rounded-md bg-gray-50 min-h-[200px]">
                                <article className="prose prose-sm max-w-none">
                                    <ReactMarkdown>{generatedProposal}</ReactMarkdown>
                                </article>
                            </TabsContent>
                            <TabsContent value="raw">
                                <Textarea
                                    className="mt-4 font-mono text-sm min-h-[300px]"
                                    value={generatedProposal}
                                    readOnly
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
