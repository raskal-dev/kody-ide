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

export class KodyCommands extends Disposable implements IWorkbenchContribution {
  static readonly ID = 'workbench.contrib.kodyCommands';
  
  private kodyService: KodyService | null = null;

  constructor(
    @IInstantiationService instantiationService: IInstantiationService,
    @INotificationService private readonly notificationService: INotificationService,
    @IWorkspaceContextService private readonly workspaceService: IWorkspaceContextService
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
    const analyzer = new ProjectAnalyzer(this.workspaceService);
    
    try {
      this.notificationService.info('Analyse du projet en cours...');
      const analysis = await analyzer.analyzeProject();
      this.notificationService.info(`Analyse terminée: ${analysis.summary}`);
    } catch (error: any) {
      this.notificationService.error(`Erreur lors de l'analyse: ${error.message}`);
    }
  }

  private async configureAIService(): Promise<void> {
    // TODO: Implémenter l'interface de configuration
    this.notificationService.info('Configuration du service IA - Ouvrir les paramètres (Ctrl+,) et rechercher "KODY AI"');
  }
}

