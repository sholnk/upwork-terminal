/**
 * UpWork Connection Status Endpoint
 *
 * GET /api/auth/upwork/status
 *
 * Returns current UpWork connection status
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isTokenExpired, isOAuthConfigured } from "@/lib/upwork/oauth";

export async function GET() {
    const userId = process.env.SINGLE_USER_ID;

    if (!userId) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 401 }
        );
    }

    // Check if OAuth is configured
    const oauthConfigured = isOAuthConfigured();

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                accessToken: true,
                tokenExpiry: true,
                upworkUserId: true,
                upworkProfile: true,
            },
        });

        const isConnected = !!(user?.accessToken && !isTokenExpired(user.tokenExpiry));

        return NextResponse.json({
            oauthConfigured,
            isConnected,
            upworkUserId: user?.upworkUserId || null,
            tokenExpiry: user?.tokenExpiry || null,
        });
    } catch (err) {
        console.error("Status check error:", err);
        return NextResponse.json(
            { error: "Failed to check status" },
            { status: 500 }
        );
    }
}
