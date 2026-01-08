/**
 * UpWork GraphQL API Client
 *
 * Handles authenticated requests to UpWork GraphQL API
 */

import { getValidAccessToken } from "./oauth";

const UPWORK_GRAPHQL_URL = "https://api.upwork.com/graphql";

export interface GraphQLResponse<T> {
    data?: T;
    errors?: Array<{
        message: string;
        locations?: Array<{ line: number; column: number }>;
        path?: string[];
    }>;
}

export class UpworkApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public graphqlErrors?: GraphQLResponse<unknown>["errors"]
    ) {
        super(message);
        this.name = "UpworkApiError";
    }
}

/**
 * Execute GraphQL query against UpWork API
 */
export async function executeGraphQL<T>(
    userId: string,
    query: string,
    variables?: Record<string, unknown>
): Promise<T> {
    // Mock Mode Support
    if (process.env.UPWORK_MOCK_MODE === "true") {
        console.log("Mock Mode: Returning mock data for GraphQL query");

        // Dynamic import to avoid circular dependencies if any
        // or just strict check
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { MOCK_USER_PROFILE } = require("./mock-data");

        // Simple mock response logic based on query content
        // This is a basic implementation for development
        if (query.includes("user {")) {
            // Return structure matching getCurrentUserProfile expectation
            // getCurrentUserProfile expects: user: { id, nid, name, email }
            // MOCK_USER_PROFILE doesn't exactly match this structure in the "profile" section vs root.
            // We need to adapt it.
            return {
                user: {
                    id: MOCK_USER_PROFILE.identity.id,
                    nid: "mock_nid_123",
                    name: `${MOCK_USER_PROFILE.identity.firstName} ${MOCK_USER_PROFILE.identity.lastName}`,
                    email: MOCK_USER_PROFILE.personalData.email,
                }
            } as unknown as T;
        }

        if (query.includes("talentProfileByProfileKey")) {
            // Return structure matching getTalentProfile expectation
            return {
                talentProfileByProfileKey: {
                    id: MOCK_USER_PROFILE.identity.id,
                    title: MOCK_USER_PROFILE.profile.title,
                    description: MOCK_USER_PROFILE.profile.overview,
                    skills: MOCK_USER_PROFILE.profile.skills.map((s: string) => ({ name: s })),
                    hourlyRate: {
                        amount: MOCK_USER_PROFILE.profile.hourlyRate.amount,
                        currency: MOCK_USER_PROFILE.profile.hourlyRate.currencyCode,
                    },
                    availability: {
                        hoursPerWeek: 40, // Mock value
                    }
                }
            } as unknown as T;
        }

        if (query.includes("updateTalentProfile")) {
            console.log("Mock Mode: Simulating profile update", variables);
            const varsRecord = variables as Record<string, unknown> | undefined;
            const inputRaw = varsRecord?.input as Record<string, unknown> | undefined;
            const input = {
                title: inputRaw?.title as string | undefined,
                description: inputRaw?.description as string | undefined,
                hourlyRate: inputRaw?.hourlyRate as { amount?: number; currencyCode?: string } | undefined,
            };

            return {
                updateTalentProfile: {
                    id: MOCK_USER_PROFILE.identity.id,
                    title: input.title || MOCK_USER_PROFILE.profile.title,
                    description: input.description || MOCK_USER_PROFILE.profile.overview,
                    hourlyRate: {
                        amount: input.hourlyRate?.amount || MOCK_USER_PROFILE.profile.hourlyRate.amount,
                        currency: input.hourlyRate?.currencyCode || MOCK_USER_PROFILE.profile.hourlyRate.currencyCode,
                    }
                }
            } as unknown as T;
        }

        throw new Error("Mock data not implemented for this query");
    }

    const accessToken = await getValidAccessToken(userId);

    if (!accessToken) {
        throw new UpworkApiError("Not authenticated with UpWork", 401);
    }

    const response = await fetch(UPWORK_GRAPHQL_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    });

    if (!response.ok) {
        throw new UpworkApiError(
            `UpWork API request failed: ${response.statusText}`,
            response.status
        );
    }

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors && result.errors.length > 0) {
        throw new UpworkApiError(
            result.errors[0].message,
            undefined,
            result.errors
        );
    }

    if (!result.data) {
        throw new UpworkApiError("No data returned from UpWork API");
    }

    return result.data;
}

/**
 * Get current user's UpWork profile
 */
export async function getCurrentUserProfile(userId: string) {
    const query = `
    query {
      user {
        id
        nid
        name
        email
      }
    }
  `;

    return executeGraphQL<{
        user: {
            id: string;
            nid: string;
            name: string;
            email: string;
        };
    }>(userId, query);
}

/**
 * Get talent profile by profile key
 */
export async function getTalentProfile(userId: string, profileKey: string) {
    const query = `
    query GetTalentProfile($profileKey: String!) {
      talentProfileByProfileKey(profileKey: $profileKey) {
        id
        title
        description
        skills {
          name
        }
        hourlyRate {
          amount
          currency
        }
        availability {
          hoursPerWeek
        }
      }
    }
  `;

    return executeGraphQL<{
        talentProfileByProfileKey: {
            id: string;
            title: string;
            description: string;
            skills: Array<{ name: string }>;
            hourlyRate: { amount: number; currency: string };
            availability: { hoursPerWeek: number };
        };
    }>(userId, query, { profileKey });
}

/**
 * Update talent profile
 */
export async function updateTalentProfile(
    userId: string,
    profileKey: string,
    updates: {
        title?: string;
        description?: string;
        hourlyRate?: { amount: number; currencyCode: string };
    }
) {
    const mutation = `
    mutation UpdateTalentProfile($input: UpdateTalentProfileInput!) {
      updateTalentProfile(input: $input) {
        id
        title
        description
        hourlyRate {
            amount
            currency
        }
      }
    }
  `;

    const input = {
        profileKey,
        ...updates,
    };

    return executeGraphQL<{
        updateTalentProfile: {
            id: string;
            title: string;
            description: string;
            hourlyRate: { amount: number; currency: string };
        };
    }>(userId, mutation, { input });
}

/**
 * Check if user is connected to UpWork
 */
export async function isConnectedToUpwork(userId: string): Promise<boolean> {
    const token = await getValidAccessToken(userId);
    return !!token;
}
