"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, DollarSign, Plus, Pencil, Save, ExternalLink } from "lucide-react";

interface ProfileViewProps {
    userSettings: {
        title?: string | null;
        overview?: string | null;
        hourlyRate?: number | null;
        skills?: string[];
        location?: string | null;
        timezone?: string | null;
    } | null;
    isConnected: boolean;
}

export function ProfileView({ userSettings, isConnected }: ProfileViewProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: userSettings?.title || "",
        overview: userSettings?.overview || "",
        hourlyRate: userSettings?.hourlyRate || 0,
        location: userSettings?.location || "Tokyo, Japan", // Mock default
    });

    const handleSave = async () => {
        // API Call logic here (reuse from settings card)
        setIsEditing(false);
        // console.log("Saved", formData);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Main Content) */}
            <div className="lg:col-span-2 space-y-6">

                {/* Header / Basic Info */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src="/avatar-placeholder.png" alt="Profile" />
                                <AvatarFallback>ME</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold">Your Name</h2>
                                        <div className="flex items-center text-gray-500 mt-1 space-x-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{formData.location}</span>
                                            <span className="text-gray-300">|</span>
                                            <Clock className="h-4 w-4" />
                                            <span>{new Date().toLocaleTimeString()} local time</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => window.open('https://www.upwork.com/freelancers/~', '_blank')}>
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View Public Profile
                                        </Button>
                                        {!isEditing && (
                                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Edit Profile
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    {isEditing ? (
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="text-lg font-semibold"
                                            placeholder="Title"
                                        />
                                    ) : (
                                        <h3 className="text-xl font-semibold">{formData.title || "No Title Set"}</h3>
                                    )}
                                </div>

                                <div className="mt-4">
                                    {isEditing ? (
                                        <Textarea
                                            value={formData.overview}
                                            onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                                            className="min-h-[200px]"
                                            placeholder="Overview"
                                        />
                                    ) : (
                                        <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                            {formData.overview || "No overview provided."}
                                        </p>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="mt-4 flex justify-end gap-2">
                                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                        <Button onClick={handleSave}>Save Changes</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Portfolio / Projects */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Portfolio</CardTitle>
                        <Button variant="ghost" size="icon"><Plus className="h-5 w-5" /></Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Mock Projects */}
                            <div className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden border hover:shadow-md transition cursor-pointer">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    Project Thumbnail
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white">
                                    <h4 className="font-semibold">E-commerce Platform</h4>
                                </div>
                            </div>
                            <div className="border-2 border-dashed border-gray-200 rounded-lg aspect-video flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer transition">
                                <Plus className="h-8 w-8 mb-2" />
                                <span>Add Project</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Skills</CardTitle>
                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {userSettings?.skills?.map(skill => (
                                <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">
                                    {skill}
                                </Badge>
                            ))}
                            {!userSettings?.skills?.length && <span className="text-gray-500">No skills synced.</span>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-6">
                {/* Availability & Rates */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Visibility & Rates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Availability</h4>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-green-500 hover:bg-green-600">Available now</Badge>
                                <span className="text-sm text-gray-600">Off</span>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Hours per week</h4>
                            <p className="font-medium">More than 30 hrs/week</p>
                            <p className="text-sm text-gray-500">Open to contract to hire</p>
                        </div>

                        <Separator />

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="text-sm font-medium text-gray-500">Hourly Rate</h4>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        value={formData.hourlyRate}
                                        onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                                        className="w-24 h-8 text-right"
                                    />
                                ) : (
                                    <Button variant="ghost" size="icon" className="h-6 w-6"><Pencil className="h-3 w-3" /></Button>
                                )}
                            </div>
                            <p className="text-xl font-bold flex items-center">
                                <DollarSign className="h-5 w-5 text-gray-400" />
                                {formData.hourlyRate}.00
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Completion (Gamification) */}
                <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="pt-6">
                        <div className="flex justify-between mb-2">
                            <span className="font-semibold text-blue-900">Profile Completion</span>
                            <span className="font-bold text-blue-700">100%</span>
                        </div>
                        <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 w-full" />
                        </div>
                        <p className="text-xs text-blue-700 mt-2">
                            Great job! Your profile is fully optimized.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
