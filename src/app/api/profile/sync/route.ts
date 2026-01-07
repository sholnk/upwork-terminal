
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    getTalentProfile,
    updateTalentProfile,
    UpworkApiError,
} from "@/lib/upwork/client";

/**
 * GET /api/profile/sync
 * UpWorkからプロフィールを取得してDBに保存 (Sync Down)
 */
export async function GET(request: NextRequest) {
    const userId = process.env.SINGLE_USER_ID;
    if (!userId) {
        return NextResponse.json({ error: "User configuration error" }, { status: 500 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.upworkUserId) {
            // If upworkUserId is missing, we might need to fetch current user first or use mock ID
            // For Issue 1.2, assuming connection flow set upworkUserId is a bit premature if we just did auth
            // But in Mock Mode we can rely on mock IDs.
        }

        // In Mock Mode, we use the Mock ID if user.upworkUserId is null
        const targetUpworkId = user?.upworkUserId || (process.env.UPWORK_MOCK_MODE === "true" ? "mock_user_id_abcde" : null);

        if (!targetUpworkId) {
            return NextResponse.json({ error: "Not connected to UpWork" }, { status: 400 });
        }

        // Use a mock profile key for now if not stored
        // In real app, we would probably have stored the profile key during auth or initial fetch
        const profileKey = "mock_profile_key_xyz";

        const profileData = await getTalentProfile(userId, profileKey);
        const { talentProfileByProfileKey: profile } = profileData;

        // Update DB
        const updatedSettings = await prisma.userSettings.upsert({
            where: { userId: userId },
            create: {
                userId: userId,
                title: profile.title,
                overview: profile.description,
                hourlyRate: profile.hourlyRate.amount,
                skills: profile.skills.map(s => s.name),
                // Location is not in getTalentProfile mock yet, skipping or empty
            },
            update: {
                title: profile.title,
                overview: profile.description,
                hourlyRate: profile.hourlyRate.amount,
                skills: profile.skills.map(s => s.name),
            }
        });

        return NextResponse.json({ success: true, profile: updatedSettings });

    } catch (error) {
        console.error("Profile sync error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Sync failed" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/profile/sync
 * DBの変更をUpWorkに反映 (Sync Up)
 */
export async function POST(request: NextRequest) {
    const userId = process.env.SINGLE_USER_ID;
    if (!userId) {
        return NextResponse.json({ error: "User configuration error" }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { title, overview, hourlyRate } = body;

        // Validate
        if (title && title.length > 70) {
            return NextResponse.json({ error: "Title must be 70 characters or less" }, { status: 400 });
        }

        // Mock Profile Key
        const profileKey = "mock_profile_key_xyz";

        // Update UpWork
        const result = await updateTalentProfile(userId, profileKey, {
            title,
            description: overview,
            hourlyRate: hourlyRate ? { amount: parseFloat(hourlyRate), currencyCode: "USD" } : undefined
        });

        // Update Local DB to match
        const updatedProfile = result.updateTalentProfile;

        await prisma.userSettings.update({
            where: { userId: userId },
            data: {
                title: updatedProfile.title,
                overview: updatedProfile.description,
                hourlyRate: updatedProfile.hourlyRate.amount,
            }
        });

        return NextResponse.json({ success: true, profile: updatedProfile });

    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Update failed" },
            { status: 500 }
        );
    }
}
