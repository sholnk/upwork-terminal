export interface MiyabiConfig {
    model: string;
    apiKey: string;
    maxTokens: number;
    temperature: number;
    systemPrompt: string;
}

export const miyabiConfig: MiyabiConfig = {
    model: "claude-3-5-sonnet-20240620", // Default model for high quality generation
    apiKey: process.env.ANTHROPIC_API_KEY || "", // Ensure this is set in .env
    maxTokens: 1024,
    temperature: 0.7,
    systemPrompt: `You are an expert UpWork proposal writer.
Your goal is to write winning proposals that get freelancers hired.
Focus on:
1. Addressing the client's specific problem immediately.
2. Showing relevant experience.
3. Asking insightful questions.
4. Keeping it concise and professional.
Do not use generic templates. Adopt the persona of the user based on their profile.`
};
