import { AIConfig, AIMessage, AIResponse } from '../common/types.js';
import { OpenRouterService } from './OpenRouterService.js';
import { OpenAIService } from './OpenAIService.js';
import { AnthropicService } from './AnthropicService.js';
import { CustomAIService } from './CustomAIService.js';

export interface IAIService {
  chat(messages: AIMessage[]): Promise<AIResponse>;
  isConfigured(): boolean;
}

export class AIServiceProvider {
  private service: IAIService | null = null;
  private config: AIConfig | null = null;

  public async initialize(config: AIConfig): Promise<void> {
    this.config = config;

    console.log('[KODY AIServiceProvider] Initialisation avec config:', {
      service: config.service,
      hasOpenRouter: !!config.openrouter?.apiKey,
      hasOpenAI: !!config.openai?.apiKey,
      hasAnthropic: !!config.anthropic?.apiKey,
      hasCustom: !!config.custom?.apiKey
    });

    switch (config.service) {
      case 'openrouter':
        if (!config.openrouter?.apiKey) {
          throw new Error('Clé API OpenRouter manquante dans la configuration');
        }
        if (!config.openrouter.model) {
          throw new Error('Modèle OpenRouter manquant dans la configuration');
        }
        this.service = new OpenRouterService(config.openrouter.apiKey, config.openrouter.model);
        break;
      case 'openai':
        if (!config.openai?.apiKey) {
          throw new Error('Clé API OpenAI manquante dans la configuration');
        }
        if (!config.openai.model) {
          throw new Error('Modèle OpenAI manquant dans la configuration');
        }
        this.service = new OpenAIService(config.openai.apiKey, config.openai.model);
        break;
      case 'anthropic':
        if (!config.anthropic?.apiKey) {
          throw new Error('Clé API Anthropic manquante dans la configuration');
        }
        if (!config.anthropic.model) {
          throw new Error('Modèle Anthropic manquant dans la configuration');
        }
        this.service = new AnthropicService(config.anthropic.apiKey, config.anthropic.model);
        break;
      case 'custom':
        if (!config.custom?.endpoint) {
          throw new Error('Endpoint personnalisé manquant dans la configuration');
        }
        if (!config.custom?.apiKey) {
          throw new Error('Clé API personnalisée manquante dans la configuration');
        }
        this.service = new CustomAIService(config.custom.endpoint, config.custom.apiKey);
        break;
      default:
        throw new Error(`Service inconnu: ${config.service}`);
    }

    if (!this.service || !this.service.isConfigured()) {
      throw new Error(`Service ${config.service} n'est pas correctement configuré après initialisation`);
    }

    console.log('[KODY AIServiceProvider] Service initialisé avec succès:', config.service);
  }

  public async chat(messages: AIMessage[]): Promise<AIResponse> {
    if (!this.service) {
      throw new Error('Service IA non initialisé. Appelez initialize() d\'abord.');
    }
    return this.service.chat(messages);
  }

  public isReady(): boolean {
    return this.service !== null && this.service.isConfigured();
  }

  public getCurrentService(): string | null {
    return this.config?.service || null;
  }
}

