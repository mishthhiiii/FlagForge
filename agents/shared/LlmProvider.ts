import type { AgentConfig } from '../../configs/index.js';
import type { LlmCompletionOptions, LlmMessage, LlmProvider } from '../types/index.js';

class NoOpLlmProvider implements LlmProvider {
  isConfigured(): boolean {
    return false;
  }

  async complete(messages: LlmMessage[], _options?: LlmCompletionOptions): Promise<string> {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    return `[Framework mode — configure AGENT_LLM_PROVIDER and API key]\nReceived: ${lastUser?.content ?? 'empty request'}`;
  }
}

class OpenAiProvider implements LlmProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(messages: LlmMessage[], options?: LlmCompletionOptions): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${body}`);
    }

    const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
    return data.choices[0]?.message?.content ?? '';
  }
}

class AnthropicProvider implements LlmProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(messages: LlmMessage[], options?: LlmCompletionOptions): Promise<string> {
    const system = messages.find((m) => m.role === 'system')?.content ?? '';
    const chatMessages = messages.filter((m) => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options?.maxTokens ?? 4096,
        system,
        messages: chatMessages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${body}`);
    }

    const data = (await response.json()) as { content: Array<{ text: string }> };
    return data.content[0]?.text ?? '';
  }
}

class GeminiProvider implements LlmProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(messages: LlmMessage[], _options?: LlmCompletionOptions): Promise<string> {
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const systemInstruction = messages.find((m) => m.role === 'system')?.content;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        contents,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${body}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }
}

export function createLlmProvider(config: AgentConfig): LlmProvider {
  const { provider, model, openaiApiKey, anthropicApiKey, geminiApiKey } = config.llm;

  switch (provider) {
    case 'openai':
      return openaiApiKey ? new OpenAiProvider(openaiApiKey, model) : new NoOpLlmProvider();
    case 'anthropic':
      return anthropicApiKey ? new AnthropicProvider(anthropicApiKey, model) : new NoOpLlmProvider();
    case 'gemini':
      return geminiApiKey ? new GeminiProvider(geminiApiKey, model) : new NoOpLlmProvider();
    default:
      return new NoOpLlmProvider();
  }
}

export { NoOpLlmProvider };
