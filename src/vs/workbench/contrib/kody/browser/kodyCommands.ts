/**
 * Commandes KODY pour VSCode
 * Ce fichier doit être placé dans: src/vs/workbench/contrib/kody/browser/kodyCommands.ts
 */

import { IWorkbenchContribution } from '../../../common/contributions.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { KodyService } from './kodyService.js';
import { ProjectAnalyzer } from '../common/projectAnalyzer.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IQuickInputService, IQuickPickItem } from '../../../../platform/quickinput/common/quickInput.js';
import { ConfigManager } from './configManager.adapted.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { AIService } from '../common/types.js';

export class KodyCommands extends Disposable implements IWorkbenchContribution {
  static readonly ID = 'workbench.contrib.kodyCommands';
  
  private kodyService: KodyService | null = null;

  constructor(
    @IInstantiationService instantiationService: IInstantiationService,
    @INotificationService private readonly notificationService: INotificationService,
    @IWorkspaceContextService private readonly workspaceService: IWorkspaceContextService,
    @IFileService private readonly fileService: IFileService,
    @IQuickInputService private readonly quickInputService: IQuickInputService,
    @IConfigurationService private readonly configurationService: IConfigurationService,
    @ISecretStorageService private readonly secretStorage: ISecretStorageService
  ) {
    super();
    this.registerCommands();
  }

  public setKodyService(service: KodyService): void {
    this.kodyService = service;
  }

  private registerCommands(): void {
    // Enregistrer les commandes
    CommandsRegistry.registerCommand('kody.openAIPanel', () => this.openAIPanel());
    CommandsRegistry.registerCommand('kody.analyzeProject', () => this.analyzeProject());
    CommandsRegistry.registerCommand('kody.configureAIService', () => this.configureAIService());
  }

  private openAIPanel(): void {
    if (!this.kodyService || !this.kodyService.isReady()) {
      this.notificationService.warn('Service IA non configuré. Veuillez configurer votre service IA dans les paramètres.');
      return;
    }

    // TODO: Créer et afficher le panneau IA
    this.notificationService.info('Panneau IA KODY - À implémenter');
  }

  private async analyzeProject(): Promise<void> {
    const analyzer = new ProjectAnalyzer(this.workspaceService, this.fileService);
    
    try {
      this.notificationService.info('Analyse du projet en cours...');
      const analysis = await analyzer.analyzeProject();
      this.notificationService.info(`Analyse terminée: ${analysis.summary}`);
    } catch (error: any) {
      this.notificationService.error(`Erreur lors de l'analyse: ${error.message}`);
    }
  }

  private async configureAIService(): Promise<void> {
    const configManager = ConfigManager.getInstance(this.configurationService, this.secretStorage);

    // 1. Choisir le service IA
    const serviceItems: IQuickPickItem[] = [
      { label: 'OpenRouter', description: 'Accès à plusieurs modèles via une seule API (recommandé)', id: 'openrouter' },
      { label: 'OpenAI', description: 'Accès direct à GPT-4, GPT-3.5, etc.', id: 'openai' },
      { label: 'Anthropic', description: 'Accès à Claude', id: 'anthropic' },
      { label: 'Service personnalisé', description: 'Endpoint personnalisé', id: 'custom' }
    ];

    const servicePick = await this.quickInputService.pick(serviceItems, {
      placeHolder: 'Choisissez un service IA',
      title: 'Configuration KODY - Service IA'
    });

    if (!servicePick || !servicePick.id) {
      return;
    }

    const selectedService = servicePick.id as AIService;

    // 2. Demander la clé API
    const apiKey = await this.quickInputService.input({
      placeHolder: 'Entrez votre clé API',
      title: `Configuration KODY - Clé API ${servicePick.label}`,
      password: true,
      prompt: `Votre clé API sera stockée de manière sécurisée dans le secret storage de VSCode.`
    });

    if (!apiKey) {
      return;
    }

    // 3. Sauvegarder la clé API
    try {
      await configManager.saveAPIKey(selectedService, apiKey);
      
      // 4. Configurer le service par défaut si nécessaire
      const currentService = this.configurationService.getValue<AIService>('kody.ai.service');
      if (currentService !== selectedService) {
        await this.configurationService.updateValue('kody.ai.service', selectedService);
      }

      this.notificationService.info(`✅ Clé API ${servicePick.label} configurée avec succès !`);
      
      // 5. Si c'est un service personnalisé, demander l'endpoint
      if (selectedService === 'custom') {
        const endpoint = await this.quickInputService.input({
          placeHolder: 'https://api.example.com/v1',
          title: 'Configuration KODY - Endpoint personnalisé',
          prompt: 'Entrez l\'URL de votre endpoint (format compatible OpenAI)',
          value: this.configurationService.getValue<string>('kody.ai.custom.endpoint') || ''
        });

        if (endpoint) {
          await this.configurationService.updateValue('kody.ai.custom.endpoint', endpoint);
        }
      }

      // Recharger le service KODY si disponible
      if (this.kodyService) {
        // Le service se rechargera automatiquement au prochain appel
        this.notificationService.info('Redémarrez KODY ou rechargez la fenêtre pour appliquer les changements.');
      }
    } catch (error: any) {
      this.notificationService.error(`Erreur lors de la configuration: ${error.message}`);
    }
  }
}

