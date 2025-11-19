/**
 * ConfigManager adapté pour l'intégration VSCode
 * Ce fichier montre comment adapter ConfigManager.ts pour fonctionner dans VSCode
 */

import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { AIConfig, AIService } from '../common/types.js';

export class ConfigManager {
  private static instance: ConfigManager | null = null;

  private constructor(
    private readonly configurationService: IConfigurationService,
    private readonly secretStorage: ISecretStorageService
  ) {}

  public static getInstance(
    configurationService: IConfigurationService,
    secretStorage: ISecretStorageService
  ): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager(configurationService, secretStorage);
    }
    return ConfigManager.instance;
  }

  /**
   * Récupère la configuration complète de l'IA
   */
  public async getAIConfig(): Promise<AIConfig> {
    const service = this.configurationService.getValue<AIService>('kody.ai.service') || 'openrouter';

    const aiConfig: AIConfig = { service };

    // Récupération des clés API depuis le secret storage
    switch (service) {
      case 'openrouter':
        const openrouterApiKey = await this.secretStorage.get('kody.openrouter.apiKey');
        const openrouterModel = this.configurationService.getValue<string>('kody.ai.openrouter.model') || 'google/gemini-flash-1.5-8b';
        aiConfig.openrouter = {
          apiKey: openrouterApiKey || '',
          model: openrouterModel,
        };
        console.log('[KODY ConfigManager] OpenRouter config:', {
          hasApiKey: !!openrouterApiKey,
          apiKeyLength: openrouterApiKey?.length || 0,
          model: openrouterModel
        });
        break;
      case 'openai':
        const openaiApiKey = await this.secretStorage.get('kody.openai.apiKey');
        const openaiModel = this.configurationService.getValue<string>('kody.ai.openai.model') || 'gpt-4-turbo-preview';
        aiConfig.openai = {
          apiKey: openaiApiKey || '',
          model: openaiModel,
        };
        console.log('[KODY ConfigManager] OpenAI config:', {
          hasApiKey: !!openaiApiKey,
          apiKeyLength: openaiApiKey?.length || 0,
          model: openaiModel
        });
        break;
      case 'anthropic':
        const anthropicApiKey = await this.secretStorage.get('kody.anthropic.apiKey');
        const anthropicModel = this.configurationService.getValue<string>('kody.ai.anthropic.model') || 'claude-3-opus-20240229';
        aiConfig.anthropic = {
          apiKey: anthropicApiKey || '',
          model: anthropicModel,
        };
        console.log('[KODY ConfigManager] Anthropic config:', {
          hasApiKey: !!anthropicApiKey,
          apiKeyLength: anthropicApiKey?.length || 0,
          model: anthropicModel
        });
        break;
      case 'custom':
        const customApiKey = await this.secretStorage.get('kody.custom.apiKey');
        const customEndpoint = this.configurationService.getValue<string>('kody.ai.custom.endpoint') || '';
        aiConfig.custom = {
          endpoint: customEndpoint,
          apiKey: customApiKey || '',
        };
        console.log('[KODY ConfigManager] Custom config:', {
          hasApiKey: !!customApiKey,
          apiKeyLength: customApiKey?.length || 0,
          endpoint: customEndpoint
        });
        break;
    }

    return aiConfig;
  }

  /**
   * Sauvegarde une clé API de manière sécurisée
   */
  public async saveAPIKey(service: AIService, apiKey: string): Promise<void> {
    const keyName = `kody.${service}.apiKey`;
    await this.secretStorage.set(keyName, apiKey);
  }

  /**
   * Vérifie si une clé API est configurée
   */
  public async hasAPIKey(service: AIService): Promise<boolean> {
    const keyName = `kody.${service}.apiKey`;
    const apiKey = await this.secretStorage.get(keyName);
    return !!apiKey;
  }
}

