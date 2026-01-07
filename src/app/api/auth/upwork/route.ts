/**
 * UpWork OAuth Authorization Endpoint
 *
 * GET /api/auth/upwork
 *
 * Redirects user to UpWork authorization page
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthorizationUrl, isOAuthConfigured } from "@/lib/upwork/oauth";

export async function GET() {
    // Check if OAuth is configured
    if (!isOAuthConfigured()) {
        return NextResponse.json(
            {
                error: "OAuth not configured",
                message: "UPWORK_CLIENT_ID and UPWORK_CLIENT_SECRET are required",
            },
            { status: 500 }
        );
    }

    // Generate state for CSRF protection
    const state = crypto.randomUUID();

    // Store state in cookie for verification
    const cookieStore = await cookies();
    cookieStore.set("upwork_oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 10, // 10 minutes
    });

    // Generate authorization URL
    const authUrl = getAuthorizationUrl(state);

    // Redirect to UpWork authorization page
    return NextResponse.redirect(authUrl);
}
