import { AIMessage, AIResponse } from '../common/types.js';
import { IAIService } from './AIServiceProvider.js';

export class AnthropicService implements IAIService {
  private baseURL: string = 'https://api.anthropic.com/v1';
  private apiKey: string;
  private model: string;
  private headers: Record<string, string>;

  constructor(apiKey: string, model: string = 'claude-3-opus-20240229') {
    this.apiKey = apiKey;
    this.model = model;
    this.headers = {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    };
  }

  public isConfigured(): boolean {
    return !!this.apiKey;
  }

  public async chat(messages: AIMessage[]): Promise<AIResponse> {
    try {
      // Anthropic nécessite un format différent - le premier message doit être user
      const systemMessage = messages.find(m => m.role === 'system');
      const conversationMessages = messages.filter(m => m.role !== 'system');

      const payload: any = {
        model: this.model,
        max_tokens: 4096,
        messages: conversationMessages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        })),
      };

      if (systemMessage) {
        payload.system = systemMessage.content;
      }

      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur Anthropic: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.content?.[0];

      if (!content) {
        throw new Error('Aucune réponse du modèle');
      }

      return {
        content: content.text || '',
        model: data.model,
        usage: data.usage ? {
          promptTokens: data.usage.input_tokens || 0,
          completionTokens: data.usage.output_tokens || 0,
          totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0),
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

