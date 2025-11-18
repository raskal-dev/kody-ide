import { AIMessage, AIResponse } from '../common/types.js';
import { IAIService } from './AIServiceProvider.js';

export class CustomAIService implements IAIService {
  private endpoint: string;
  private apiKey: string;
  private headers: Record<string, string>;

  constructor(endpoint: string, apiKey: string) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  public isConfigured(): boolean {
    return !!this.endpoint && !!this.apiKey;
  }

  public async chat(messages: AIMessage[]): Promise<AIResponse> {
    try {
      // Format compatible OpenAI pour faciliter l'intégration
      const url = this.endpoint.endsWith('/chat/completions') 
        ? this.endpoint 
        : `${this.endpoint}/chat/completions`;

      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur service personnalisé: ${errorData.error?.message || response.statusText}`);
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
          promptTokens: data.usage.prompt_tokens || data.usage.promptTokens || 0,
          completionTokens: data.usage.completion_tokens || data.usage.completionTokens || 0,
          totalTokens: data.usage.total_tokens || data.usage.totalTokens || 0,
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

