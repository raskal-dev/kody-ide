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
        aiConfig.openrouter = {
          apiKey: (await this.secretStorage.get('kody.openrouter.apiKey')) || '',
          model: this.configurationService.getValue<string>('kody.ai.openrouter.model') || 'openai/gpt-4-turbo',
        };
        break;
      case 'openai':
        aiConfig.openai = {
          apiKey: (await this.secretStorage.get('kody.openai.apiKey')) || '',
          model: this.configurationService.getValue<string>('kody.ai.openai.model') || 'gpt-4-turbo-preview',
        };
        break;
      case 'anthropic':
        aiConfig.anthropic = {
          apiKey: (await this.secretStorage.get('kody.anthropic.apiKey')) || '',
          model: this.configurationService.getValue<string>('kody.ai.anthropic.model') || 'claude-3-opus-20240229',
        };
        break;
      case 'custom':
        aiConfig.custom = {
          endpoint: this.configurationService.getValue<string>('kody.ai.custom.endpoint') || '',
          apiKey: (await this.secretStorage.get('kody.custom.apiKey')) || '',
        };
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

