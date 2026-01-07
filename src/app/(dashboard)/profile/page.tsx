import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { isTokenExpired, isOAuthConfigured } from "@/lib/upwork/oauth";
import { ProfileView } from "@/components/profile/profile-view";

export const metadata: Metadata = {
    title: "Profile | UpWork Terminal",
    description: "Manage your UpWork profile and visibility",
};

export const dynamic = "force-dynamic";

async function getConnectionStatus() {
    const userId = process.env.SINGLE_USER_ID;

    if (!userId) {
        return { isConnected: false, userSettings: null };
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            accessToken: true,
            tokenExpiry: true,
        },
    });

    const isConnected = !!(user?.accessToken && !isTokenExpired(user.tokenExpiry));

    const userSettings = await prisma.userSettings.findUnique({
        where: { userId: userId },
        select: {
            title: true,
            overview: true,
            hourlyRate: true,
            skills: true,
            location: true,
            timezone: true,
        }
    });

    return {
        isConnected,
        userSettings: userSettings ? {
            title: userSettings.title,
            overview: userSettings.overview,
            hourlyRate: userSettings.hourlyRate ? userSettings.hourlyRate.toNumber() : null,
            skills: userSettings.skills,
            location: userSettings.location,
            timezone: userSettings.timezone,
        } : null,
    };
}

export default async function ProfilePage() {
    const { isConnected, userSettings } = await getConnectionStatus();

    return (
        <div className="space-y-6 p-6 lg:ml-0 min-h-screen bg-gray-50/50">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600 mt-2">
                    Manage your professional presence and settings
                </p>
            </div>

            <ProfileView
                userSettings={userSettings}
                isConnected={isConnected}
            />
        </div>
    );
}
