/**
 * LLM Provider Implementation - Anthropic Claude
 *
 * Implements LLMProvider interface using Claude API
 * Uses claude-3-5-sonnet-20241022 for high quality JSON output
 */

import type { LLMProvider } from "@/lib/sophia/engine";

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeResponse {
  content: Array<{
    type: "text" | "tool_use";
    text?: string;
  }>;
}

/**
 * Anthropic Claude API Provider
 */
class ClaudeProvider implements LLMProvider {
  private apiKey: string;
  private model = "claude-3-5-sonnet-20241022";
  private maxTokens = 2048;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable not set");
    }
  }

  async completeJson(args: {
    system: string;
    user: string;
    temperature?: number;
  }): Promise<unknown> {
    const { system, user, temperature = 0.2 } = args;

    const messages: ClaudeMessage[] = [
      {
        role: "user",
        content: `${system}\n\n${user}`,
      },
    ];

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          temperature,
          messages,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(
          `Claude API error: ${response.status} - ${error}`
        );
      }

      const data = (await response.json()) as ClaudeResponse;

      // Extract text from response
      const textContent = data.content.find((c) => c.type === "text");
      if (!textContent || !textContent.text) {
        throw new Error("No text content in Claude response");
      }

      // Parse JSON from response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(
          `No JSON object found in response: ${textContent.text}`
        );
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("[Claude Provider] Error:", error);
      throw error;
    }
  }
}

// Lazy singleton - only instantiates when first accessed
let _provider: ClaudeProvider | null = null;

export function getProvider(): LLMProvider {
  if (!_provider) {
    _provider = new ClaudeProvider();
  }
  return _provider;
}

// For backward compatibility (but will throw at import time if used directly)
// export const provider = new ClaudeProvider();

