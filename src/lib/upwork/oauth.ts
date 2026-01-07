/**
 * UpWork OAuth 2.0 Utilities
 *
 * Handles OAuth authorization flow with UpWork API
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Environment variables
const UPWORK_CLIENT_ID = process.env.UPWORK_CLIENT_ID;
const UPWORK_CLIENT_SECRET = process.env.UPWORK_CLIENT_SECRET;
const UPWORK_REDIRECT_URI = process.env.UPWORK_REDIRECT_URI || "http://localhost:3000/api/auth/callback/upwork";

// UpWork OAuth endpoints
const UPWORK_AUTH_URL = "https://www.upwork.com/ab/account-security/oauth2/authorize";
const UPWORK_TOKEN_URL = "https://www.upwork.com/api/v3/oauth2/token";
const UPWORK_MOCK_MODE = process.env.UPWORK_MOCK_MODE === "true";

// Import mock data
import { MOCK_ACCESS_TOKEN, MOCK_REFRESH_TOKEN } from "./mock-data";

/**
 * Check if OAuth is configured
 */
export function isOAuthConfigured(): boolean {
    if (UPWORK_MOCK_MODE) return true;
    return !!(UPWORK_CLIENT_ID && UPWORK_CLIENT_SECRET);
}

/**
 * Generate OAuth authorization URL
 */
export function getAuthorizationUrl(state: string): string {
    if (UPWORK_MOCK_MODE) {
        // In mock mode, redirect immediately to callback with a mock code
        const params = new URLSearchParams({
            code: "mock_auth_code",
            state: state,
        });
        return `${UPWORK_REDIRECT_URI}?${params.toString()}`;
    }

    if (!UPWORK_CLIENT_ID) {
        throw new Error("UPWORK_CLIENT_ID is not configured");
    }

    const params = new URLSearchParams({
        client_id: UPWORK_CLIENT_ID,
        redirect_uri: UPWORK_REDIRECT_URI,
        response_type: "code",
        state: state,
    });

    return `${UPWORK_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}> {
    if (UPWORK_MOCK_MODE) {
        return {
            accessToken: MOCK_ACCESS_TOKEN,
            refreshToken: MOCK_REFRESH_TOKEN,
            expiresIn: 86400,
        };
    }

    if (!UPWORK_CLIENT_ID || !UPWORK_CLIENT_SECRET) {
        throw new Error("OAuth credentials are not configured");
    }

    const response = await fetch(UPWORK_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            client_id: UPWORK_CLIENT_ID,
            client_secret: UPWORK_CLIENT_SECRET,
            redirect_uri: UPWORK_REDIRECT_URI,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token exchange failed: ${error}`);
    }

    const data = await response.json();

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in || 3600, // Default to 1 hour
    };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}> {
    if (UPWORK_MOCK_MODE) {
        return {
            accessToken: MOCK_ACCESS_TOKEN,
            refreshToken: MOCK_REFRESH_TOKEN,
            expiresIn: 86400,
        };
    }

    if (!UPWORK_CLIENT_ID || !UPWORK_CLIENT_SECRET) {
        throw new Error("OAuth credentials are not configured");
    }

    const response = await fetch(UPWORK_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: UPWORK_CLIENT_ID,
            client_secret: UPWORK_CLIENT_SECRET,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token refresh failed: ${error}`);
    }

    const data = await response.json();

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken, // Some providers don't return a new refresh token
        expiresIn: data.expires_in || 3600,
    };
}

/**
 * Check if token is expired (with 5 minute buffer)
 */
export function isTokenExpired(tokenExpiry: Date | null): boolean {
    if (!tokenExpiry) return true;

    const bufferMs = 5 * 60 * 1000; // 5 minutes
    return new Date().getTime() > tokenExpiry.getTime() - bufferMs;
}

/**
 * Save tokens to user record
 */
export async function saveTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number
): Promise<void> {
    const tokenExpiry = new Date(Date.now() + expiresIn * 1000);

    await prisma.user.update({
        where: { id: userId },
        data: {
            accessToken,
            refreshToken,
            tokenExpiry,
        },
    });
}

/**
 * Clear tokens from user record (disconnect)
 */
export async function clearTokens(userId: string): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: {
            accessToken: null,
            refreshToken: null,
            tokenExpiry: null,
            upworkUserId: null,
            upworkProfile: Prisma.JsonNull,
        },
    });
}

/**
 * Get valid access token (refreshing if necessary)
 */
export async function getValidAccessToken(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            accessToken: true,
            refreshToken: true,
            tokenExpiry: true,
        },
    });

    if (!user?.accessToken) {
        return null;
    }

    // Check if token is still valid
    if (!isTokenExpired(user.tokenExpiry)) {
        return user.accessToken;
    }

    // Try to refresh
    if (!user.refreshToken) {
        return null;
    }

    try {
        const tokens = await refreshAccessToken(user.refreshToken);
        await saveTokens(userId, tokens.accessToken, tokens.refreshToken, tokens.expiresIn);
        return tokens.accessToken;
    } catch {
        // Refresh failed, clear tokens
        await clearTokens(userId);
        return null;
    }
}
