import { AIMessage, AIResponse } from '../common/types.js';
import { IAIService } from './AIServiceProvider.js';

export class OpenRouterService implements IAIService {
  private baseURL: string = 'https://openrouter.ai/api/v1';
  private apiKey: string;
  private model: string;
  private headers: Record<string, string>;

  constructor(apiKey: string, model: string = 'openai/gpt-4-turbo') {
    this.apiKey = apiKey;
    this.model = model;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/kody-ide/kody',
      'X-Title': 'KODY IDE',
    };
  }

  public isConfigured(): boolean {
    return !!this.apiKey;
  }

  public async chat(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const payload = {
        model: this.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      };

      console.log('[KODY OpenRouter] Envoi de la requête:', {
        url: `${this.baseURL}/chat/completions`,
        model: this.model,
        messagesCount: messages.length,
        hasApiKey: !!this.apiKey,
        apiKeyPrefix: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'N/A'
      });

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
      });

      console.log('[KODY OpenRouter] Réponse reçue:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[KODY OpenRouter] Erreur HTTP:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500)
        });
        
        let errorData: any = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          // Ignore JSON parse errors
        }
        
        const errorMessage = errorData.error?.message || errorData.message || response.statusText || 'Erreur inconnue';
        throw new Error(`Erreur OpenRouter (${response.status}): ${errorMessage}`);
      }

      const data = await response.json();
      console.log('[KODY OpenRouter] Données reçues:', {
        hasChoices: !!data.choices,
        choicesCount: data.choices?.length || 0,
        model: data.model
      });

      const choice = data.choices?.[0];

      if (!choice) {
        console.error('[KODY OpenRouter] Aucun choix dans la réponse:', data);
        throw new Error('Aucune réponse du modèle');
      }

      const content = choice.message?.content || '';
      console.log('[KODY OpenRouter] Contenu extrait:', {
        contentLength: content.length,
        hasContent: !!content
      });

      return {
        content: content,
        model: data.model,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens || 0,
          completionTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0,
        } : undefined,
      };
    } catch (error: any) {
      console.error('[KODY OpenRouter] Erreur dans chat:', {
        message: error.message,
        stack: error.stack?.substring(0, 500)
      });
      
      if (error.message) {
        throw error;
      }
      throw new Error(`Erreur de connexion: ${error.message || error.toString()}`);
    }
  }
}

