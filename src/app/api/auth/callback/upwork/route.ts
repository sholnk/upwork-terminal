/**
 * UpWork OAuth Callback Endpoint
 *
 * GET /api/auth/callback/upwork
 *
 * Handles OAuth callback from UpWork, exchanges code for tokens
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens, saveTokens } from "@/lib/upwork/oauth";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
        const errorDescription = searchParams.get("error_description") || error;
        return NextResponse.redirect(
            new URL(`/settings?error=${encodeURIComponent(errorDescription)}`, request.url)
        );
    }

    // Verify code is present
    if (!code) {
        console.error("Callback error: No code");
        return NextResponse.redirect(
            new URL("/settings?error=No authorization code received", request.url)
        );
    }

    // Verify state (CSRF protection)
    // SKIP in Mock Mode to simplify testing
    if (process.env.UPWORK_MOCK_MODE !== "true") {
        const cookieStore = await cookies();
        const storedState = cookieStore.get("upwork_oauth_state")?.value;

        if (!storedState || storedState !== state) {
            console.error("Callback error: Invalid state", { storedState, state });
            return NextResponse.redirect(
                new URL("/settings?error=Invalid state parameter", request.url)
            );
        }

        // Clear state cookie
        cookieStore.delete("upwork_oauth_state");
    } else {
        console.log("Mock Mode: Skipping state verification");
    }



    // Get user ID (single-user mode)
    const userId = process.env.SINGLE_USER_ID;

    if (!userId) {
        return NextResponse.redirect(
            new URL("/settings?error=User not found", request.url)
        );
    }

    try {
        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(code);

        // Save tokens to database
        await saveTokens(
            userId,
            tokens.accessToken,
            tokens.refreshToken,
            tokens.expiresIn
        );

        // Redirect to settings with success message
        return NextResponse.redirect(
            new URL("/settings?success=UpWork連携が完了しました", request.url)
        );
    } catch (err) {
        console.error("OAuth callback error:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.redirect(
            new URL(`/settings?error=${encodeURIComponent(message)}`, request.url)
        );
    }
}
