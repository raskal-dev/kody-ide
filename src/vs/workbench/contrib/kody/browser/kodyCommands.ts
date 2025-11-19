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
    CommandsRegistry.registerCommand('kody.changeAIService', () => this.changeAIService());
    CommandsRegistry.registerCommand('kody.changeAIModel', () => this.changeAIModel());
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

  private async changeAIService(): Promise<void> {
    const configManager = ConfigManager.getInstance(this.configurationService, this.secretStorage);
    const currentService = this.configurationService.getValue<AIService>('kody.ai.service') || 'openrouter';

    // 1. Choisir le service IA
    const serviceItems: IQuickPickItem[] = [
      { label: 'OpenRouter', description: 'Accès à plusieurs modèles via une seule API (recommandé)', id: 'openrouter' },
      { label: 'OpenAI', description: 'Accès direct à GPT-4, GPT-3.5, etc.', id: 'openai' },
      { label: 'Anthropic', description: 'Accès à Claude', id: 'anthropic' },
      { label: 'Service personnalisé', description: 'Endpoint personnalisé', id: 'custom' }
    ];

    const servicePick = await this.quickInputService.pick(serviceItems, {
      placeHolder: `Service actuel: ${currentService}`,
      title: 'KODY: Changer le service IA',
      activeItem: serviceItems.find(item => item.id === currentService)
    });

    if (!servicePick || !servicePick.id) {
      return;
    }

    const selectedService = servicePick.id as AIService;

    // Vérifier si une clé API existe pour ce service
    const hasApiKey = await configManager.hasAPIKey(selectedService);
    if (!hasApiKey) {
      const configure = await this.quickInputService.pick([
        { label: 'Oui', id: 'yes' },
        { label: 'Non', id: 'no' }
      ], {
        placeHolder: `Aucune clé API configurée pour ${servicePick.label}. Voulez-vous la configurer maintenant ?`
      });

      if (configure?.id === 'yes') {
        await this.configureAIService();
        return;
      } else {
        return;
      }
    }

    // Changer le service
    try {
      await this.configurationService.updateValue('kody.ai.service', selectedService);
      this.notificationService.info(`✅ Service IA changé vers ${servicePick.label}`);
    } catch (error: any) {
      this.notificationService.error(`Erreur lors du changement de service: ${error.message}`);
    }
  }

  private async changeAIModel(): Promise<void> {
    const currentService = this.configurationService.getValue<AIService>('kody.ai.service') || 'openrouter';
    const configManager = ConfigManager.getInstance(this.configurationService, this.secretStorage);

    // Vérifier si une clé API existe
    const hasApiKey = await configManager.hasAPIKey(currentService);
    if (!hasApiKey) {
      this.notificationService.warn('Veuillez d\'abord configurer votre clé API pour ce service.');
      return;
    }

    let currentModel: string;
    let modelItems: IQuickPickItem[] = [];

    switch (currentService) {
      case 'openrouter':
        currentModel = this.configurationService.getValue<string>('kody.ai.openrouter.model') || 'google/gemini-flash-1.5-8b';
        modelItems = [
          { label: 'google/gemini-flash-1.5-8b', description: 'Gemini Flash 1.5 8B (Gratuit)', id: 'google/gemini-flash-1.5-8b' },
          { label: 'meta-llama/llama-3.2-3b-instruct:free', description: 'Llama 3.2 3B Instruct (Gratuit)', id: 'meta-llama/llama-3.2-3b-instruct:free' },
          { label: 'qwen/qwen-2-7b-instruct:free', description: 'Qwen 2 7B Instruct (Gratuit)', id: 'qwen/qwen-2-7b-instruct:free' },
          { label: 'openai/gpt-4o', description: 'GPT-4o (Payant)', id: 'openai/gpt-4o' },
          { label: 'openai/gpt-4-turbo', description: 'GPT-4 Turbo (Payant)', id: 'openai/gpt-4-turbo' },
          { label: 'anthropic/claude-3.5-sonnet', description: 'Claude 3.5 Sonnet (Payant)', id: 'anthropic/claude-3.5-sonnet' },
          { label: 'Autre...', description: 'Entrer un modèle personnalisé', id: 'custom' }
        ];
        break;
      case 'openai':
        currentModel = this.configurationService.getValue<string>('kody.ai.openai.model') || 'gpt-4-turbo-preview';
        modelItems = [
          { label: 'gpt-4-turbo-preview', description: 'GPT-4 Turbo Preview', id: 'gpt-4-turbo-preview' },
          { label: 'gpt-4', description: 'GPT-4', id: 'gpt-4' },
          { label: 'gpt-3.5-turbo', description: 'GPT-3.5 Turbo', id: 'gpt-3.5-turbo' },
          { label: 'Autre...', description: 'Entrer un modèle personnalisé', id: 'custom' }
        ];
        break;
      case 'anthropic':
        currentModel = this.configurationService.getValue<string>('kody.ai.anthropic.model') || 'claude-3-opus-20240229';
        modelItems = [
          { label: 'claude-3-opus-20240229', description: 'Claude 3 Opus', id: 'claude-3-opus-20240229' },
          { label: 'claude-3-sonnet-20240229', description: 'Claude 3 Sonnet', id: 'claude-3-sonnet-20240229' },
          { label: 'claude-3-haiku-20240307', description: 'Claude 3 Haiku', id: 'claude-3-haiku-20240307' },
          { label: 'Autre...', description: 'Entrer un modèle personnalisé', id: 'custom' }
        ];
        break;
      default:
        this.notificationService.warn('Service non supporté pour le changement de modèle.');
        return;
    }

    const modelPick = await this.quickInputService.pick(modelItems, {
      placeHolder: `Modèle actuel: ${currentModel}`,
      title: `KODY: Changer le modèle ${currentService}`,
      activeItem: modelItems.find(item => item.id === currentModel)
    });

    if (!modelPick || !modelPick.id) {
      return;
    }

    let selectedModel = modelPick.id;

    // Si l'utilisateur choisit "Autre..."
    if (selectedModel === 'custom') {
      const customModel = await this.quickInputService.input({
        placeHolder: 'Entrez le nom du modèle',
        title: `KODY: Modèle personnalisé pour ${currentService}`,
        value: currentModel
      });

      if (!customModel) {
        return;
      }
      selectedModel = customModel;
    }

    // Sauvegarder le modèle
    try {
      const configKey = `kody.ai.${currentService}.model` as 'kody.ai.openrouter.model' | 'kody.ai.openai.model' | 'kody.ai.anthropic.model';
      await this.configurationService.updateValue(configKey, selectedModel);
      this.notificationService.info(`✅ Modèle changé vers ${selectedModel}`);
    } catch (error: any) {
      this.notificationService.error(`Erreur lors du changement de modèle: ${error.message}`);
    }
  }
}

