import { AIMessage, AIResponse } from '../common/types.js';
import { IAIService } from './AIServiceProvider.js';

export class OpenAIService implements IAIService {
  private baseURL: string = 'https://api.openai.com/v1';
  private apiKey: string;
  private model: string;
  private headers: Record<string, string>;

  constructor(apiKey: string, model: string = 'gpt-4-turbo-preview') {
    this.apiKey = apiKey;
    this.model = model;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  public isConfigured(): boolean {
    return !!this.apiKey;
  }

  public async chat(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: this.model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur OpenAI: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];

      if (!choice) {
        throw new Error('Aucune réponse du modèle');
      }

      return {
        content: choice.message?.content || '',
        model: data.model,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens || 0,
          completionTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0,
        } : undefined,
      };
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error(`Erreur de connexion: ${error.message}`);
    }
  }
}

