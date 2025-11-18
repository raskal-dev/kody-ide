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

    switch (config.service) {
      case 'openrouter':
        if (config.openrouter?.apiKey) {
          this.service = new OpenRouterService(config.openrouter.apiKey, config.openrouter.model);
        }
        break;
      case 'openai':
        if (config.openai?.apiKey) {
          this.service = new OpenAIService(config.openai.apiKey, config.openai.model);
        }
        break;
      case 'anthropic':
        if (config.anthropic?.apiKey) {
          this.service = new AnthropicService(config.anthropic.apiKey, config.anthropic.model);
        }
        break;
      case 'custom':
        if (config.custom?.endpoint && config.custom?.apiKey) {
          this.service = new CustomAIService(config.custom.endpoint, config.custom.apiKey);
        }
        break;
    }

    if (!this.service || !this.service.isConfigured()) {
      throw new Error(`Service ${config.service} n'est pas correctement configuré`);
    }
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

