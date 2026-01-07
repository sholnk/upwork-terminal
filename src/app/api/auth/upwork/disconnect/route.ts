/**
 * UpWork OAuth Disconnect Endpoint
 *
 * POST /api/auth/upwork/disconnect
 *
 * Clears UpWork connection and tokens
 */

import { NextResponse } from "next/server";
import { clearTokens } from "@/lib/upwork/oauth";

export async function POST() {
    const userId = process.env.SINGLE_USER_ID;

    if (!userId) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 401 }
        );
    }

    try {
        await clearTokens(userId);

        return NextResponse.json({
            success: true,
            message: "UpWork連携を解除しました",
        });
    } catch (err) {
        console.error("Disconnect error:", err);
        return NextResponse.json(
            { error: "Failed to disconnect" },
            { status: 500 }
        );
    }
}
