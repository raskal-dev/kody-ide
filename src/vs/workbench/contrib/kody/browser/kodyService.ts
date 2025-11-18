/**
 * Service KODY intégré dans VSCode
 * Ce fichier doit être placé dans: src/vs/workbench/contrib/kody/browser/kodyService.ts
 */

import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { AIServiceProvider } from '../services/AIServiceProvider.js';
import { ConfigManager } from './configManager.adapted.js';

export class KodyService extends Disposable implements IWorkbenchContribution {
  static readonly ID = 'workbench.contrib.kodyService';
  
  private aiServiceProvider: AIServiceProvider | null = null;
  private configManager: ConfigManager;

  constructor(
    @IConfigurationService configurationService: IConfigurationService,
    @ISecretStorageService secretStorage: ISecretStorageService
  ) {
    super();
    this.configManager = ConfigManager.getInstance(configurationService, secretStorage);
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      const config = await this.configManager.getAIConfig();
      this.aiServiceProvider = new AIServiceProvider();
      await this.aiServiceProvider.initialize(config);
      console.log(`[KODY] Service IA initialisé: ${config.service}`);
    } catch (error: any) {
      console.error('[KODY] Erreur lors de l\'initialisation:', error.message);
    }
  }

  public getAIService(): AIServiceProvider | null {
    return this.aiServiceProvider;
  }

  public isReady(): boolean {
    return this.aiServiceProvider !== null && this.aiServiceProvider.isReady();
  }
}

