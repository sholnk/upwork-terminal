
// Mock Data for UpWork API
export const MOCK_ACCESS_TOKEN = "mock_access_token_12345";
export const MOCK_REFRESH_TOKEN = "mock_refresh_token_67890";
export const MOCK_UPWORK_USER_ID = "mock_user_id_abcde";
export const MOCK_PROFILE_KEY = "mock_profile_key_xyz";

export const MOCK_USER_PROFILE = {
    identity: {
        id: MOCK_UPWORK_USER_ID,
        firstName: "Mock",
        lastName: "Freelancer",
        profileKey: MOCK_PROFILE_KEY,
    },
    personalData: {
        email: "mock.freelancer@example.com",
        timezone: "Asia/Tokyo",
        address: {
            country: "Japan",
            city: "Tokyo",
        },
    },
    profile: {
        title: "Senior Full Stack Developer",
        overview: "Experienced developer specializing in Next.js and TypeScript. This is a mock profile for development purposes.",
        skills: ["TypeScript", "Next.js", "React", "Node.js", "GraphQL"],
        hourlyRate: {
            amount: 50.0,
            currencyCode: "USD",
        },
        availability: {
            capacity: "more_than_30_hrs_per_week",
            available: true,
        },
        stats: {
            jobSuccessScore: 100,
            totalHours: 1500,
            totalJobs: 25,
        },
    },
};

export const MOCK_AUTH_RESPONSE = {
    access_token: MOCK_ACCESS_TOKEN,
    refresh_token: MOCK_REFRESH_TOKEN,
    expires_in: 86400, // 24 hours
    token_type: "Bearer",
};
