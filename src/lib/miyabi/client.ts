import { miyabiConfig } from './config';

export interface ProposalRequest {
    jobDescription: string;
    userProfile: string; // Summarized profile context
    clientName?: string;
    tone?: 'professional' | 'casual' | 'urgent';
}

export async function generateProposal(request: ProposalRequest): Promise<string> {
    const apiKey = miyabiConfig.apiKey;

    if (!apiKey) {
        throw new Error("Miyabi Agent: API Key is missing. Check ANTHROPIC_API_KEY in .env");
    }

    const prompt = `
Task: Write an UpWork proposal for the following job.

Job Description:
"${request.jobDescription}"

My Profile Context:
"${request.userProfile}"

Client Name (if known): ${request.clientName || "Unknown"}
Desired Tone: ${request.tone || "professional"}

Instructions:
- Start with a strong hook.
- Highlight specific matching skills from my profile.
- Propose a brief plan or next step.
- Ask a relevant question to start a conversation.
- Output ONLY the proposal body (markdown format).
`;

    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            body: JSON.stringify({
                model: miyabiConfig.model,
                max_tokens: miyabiConfig.maxTokens,
                temperature: miyabiConfig.temperature,
                system: miyabiConfig.systemPrompt,
                messages: [
                    { role: "user", content: prompt }
                ]
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Anthropic API Error:", errorText);
            throw new Error(`Anthropic API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.content[0].text;

    } catch (error) {
        console.error("Miyabi Proposal Generation Failed:", error);
        throw new Error("Failed to generate proposal using Miyabi Agent.");
    }
}
