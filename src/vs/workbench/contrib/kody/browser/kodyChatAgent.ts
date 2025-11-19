/*---------------------------------------------------------------------------------------------
 *  Copyright (c) KODY IDE. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IWorkbenchContribution } from '../../../common/contributions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IChatAgentService, IChatAgentRequest, IChatAgentResult, IChatAgentHistoryEntry, IChatAgentData } from '../../chat/common/chatAgents.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { ConfigManager } from './configManager.adapted.js';
import { AIServiceProvider } from '../services/AIServiceProvider.js';
import { AIMessage } from '../common/types.js';
import { IChatProgress, IChatMarkdownContent } from '../../chat/common/chatService.js';
import { ChatAgentLocation, ChatModeKind } from '../../chat/common/constants.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';

export class KodyChatAgent extends Disposable implements IWorkbenchContribution {
  static readonly ID = 'workbench.contrib.kodyChatAgent';

  constructor(
    @IChatAgentService private readonly chatAgentService: IChatAgentService,
    @IConfigurationService private readonly configurationService: IConfigurationService,
    @ISecretStorageService private readonly secretStorage: ISecretStorageService
  ) {
    super();
    this.registerAgent();
    
    // Attendre un peu avant de mettre à jour la description pour éviter les erreurs au démarrage
    setTimeout(() => {
      this.updateAgentDescription();
    }, 1000);
    
    // Écouter les changements de configuration pour mettre à jour la description
    this._register(this.configurationService.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('kody.ai.service') || 
          e.affectsConfiguration('kody.ai.openrouter.model') ||
          e.affectsConfiguration('kody.ai.openai.model') ||
          e.affectsConfiguration('kody.ai.anthropic.model')) {
        // Délai pour éviter les mises à jour trop rapides
        setTimeout(() => {
          this.updateAgentDescription();
        }, 100);
      }
    }));
  }

  private getCurrentServiceAndModel(): { service: string; model: string } {
    const service = this.configurationService.getValue<string>('kody.ai.service') || 'openrouter';
    let model = '';
    
    switch (service) {
      case 'openrouter':
        model = this.configurationService.getValue<string>('kody.ai.openrouter.model') || 'google/gemini-flash-1.5-8b';
        break;
      case 'openai':
        model = this.configurationService.getValue<string>('kody.ai.openai.model') || 'gpt-4-turbo-preview';
        break;
      case 'anthropic':
        model = this.configurationService.getValue<string>('kody.ai.anthropic.model') || 'claude-3-opus-20240229';
        break;
      case 'custom':
        model = 'Custom';
        break;
    }
    
    return { service, model };
  }

  private updateAgentDescription(): void {
    try {
      const { service, model } = this.getCurrentServiceAndModel();
      const serviceNames: Record<string, string> = {
        'openrouter': 'OpenRouter',
        'openai': 'OpenAI',
        'anthropic': 'Anthropic',
        'custom': 'Custom'
      };
      
      const serviceName = serviceNames[service] || service;
      const shortModel = model.split('/').pop() || model;
      
      const helpText = localize('kody.chat.helpText', "**KODY AI** - {0} ({1})\n\nUtilisez les commandes 'KODY: Changer le service IA' ou 'KODY: Changer le modèle' pour modifier la configuration.", serviceName, shortModel);
      
      // Vérifier que l'agent existe avant de le mettre à jour
      const agent = this.chatAgentService.getAgent('kody');
      if (agent) {
        // Mettre à jour uniquement les métadonnées (helpTextPrefix)
        this.chatAgentService.updateAgent('kody', {
          helpTextPrefix: new MarkdownString(helpText),
        });
      }
    } catch (error: any) {
      // Ignorer les erreurs silencieusement pour éviter de casser l'IDE
      console.error('[KODY] Erreur lors de la mise à jour de la description:', error);
    }
  }

  private registerAgent(): void {
    const agentId = 'kody';
    const agentName = 'KODY';
    const { service, model } = this.getCurrentServiceAndModel();
    const serviceNames: Record<string, string> = {
      'openrouter': 'OpenRouter',
      'openai': 'OpenAI',
      'anthropic': 'Anthropic',
      'custom': 'Custom'
    };
    const serviceName = serviceNames[service] || service;
    const shortModel = model.split('/').pop() || model;

    // Créer les données de l'agent
    const agentData: IChatAgentData = {
      id: agentId,
      name: agentName,
      description: localize('kody.chat.agent.description', 'Chat avec KODY AI - {0} ({1})', serviceName, shortModel),
      isDefault: true, // Remplacer Copilot par défaut
      isCore: true,
      modes: [ChatModeKind.Ask],
      locations: [ChatAgentLocation.Chat, ChatAgentLocation.EditorInline, ChatAgentLocation.Terminal],
      slashCommands: [],
      disambiguation: [],
      metadata: {
        isSticky: false,
        helpTextPrefix: new MarkdownString(localize('kody.chat.helpText', "**KODY AI** - {0} ({1})\n\nUtilisez les commandes 'KODY: Changer le service IA' ou 'KODY: Changer le modèle' pour modifier la configuration.", serviceName, shortModel)),
      },
      extensionId: new ExtensionIdentifier('kody.ide'),
      extensionVersion: undefined,
      extensionDisplayName: 'KODY IDE',
      extensionPublisherId: 'kody'
    };

    // Enregistrer l'agent
    const agentDisposable = this.chatAgentService.registerAgent(agentId, agentData);
    this._register(agentDisposable);

    // Enregistrer l'implémentation de l'agent
    const implementationDisposable = this.chatAgentService.registerAgentImplementation(agentId, {
      invoke: async (request: IChatAgentRequest, progress: (parts: IChatProgress[]) => void, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatAgentResult> => {
        return this.invokeAgent(request, progress, history, token);
      },
      provideFollowups: async () => {
        return [];
      }
    });

    this._register(implementationDisposable);
  }

  private async invokeAgent(
    request: IChatAgentRequest,
    progress: (parts: IChatProgress[]) => void,
    history: IChatAgentHistoryEntry[],
    token: CancellationToken
  ): Promise<IChatAgentResult> {
    try {
      // Obtenir la configuration
      const configManager = ConfigManager.getInstance(this.configurationService, this.secretStorage);
      const aiConfig = await configManager.getAIConfig();

      console.log('[KODY] Configuration récupérée:', {
        service: aiConfig.service,
        hasOpenRouter: !!aiConfig.openrouter?.apiKey,
        hasOpenAI: !!aiConfig.openai?.apiKey,
        hasAnthropic: !!aiConfig.anthropic?.apiKey,
        hasCustom: !!aiConfig.custom?.apiKey
      });

      // Vérifier si une clé API est configurée
      const hasApiKey = await configManager.hasAPIKey(aiConfig.service);
      if (!hasApiKey) {
        console.error('[KODY] Aucune clé API trouvée pour le service:', aiConfig.service);
        return {
          errorDetails: {
            message: localize('kody.chat.noApiKey', 'Aucune clé API configurée pour {0}. Utilisez la commande "KODY: Configure AI Service" pour configurer votre clé API.', aiConfig.service),
            responseIsIncomplete: false,
            responseIsFiltered: false
          }
        };
      }

      // Initialiser le service IA
      const aiServiceProvider = new AIServiceProvider();
      try {
        await aiServiceProvider.initialize(aiConfig);
      } catch (initError: any) {
        console.error('[KODY] Erreur lors de l\'initialisation du service:', initError);
        return {
          errorDetails: {
            message: localize('kody.chat.initError', 'Erreur lors de l\'initialisation du service IA: {0}', initError.message || initError.toString()),
            responseIsIncomplete: false,
            responseIsFiltered: false
          }
        };
      }

      if (!aiServiceProvider.isReady()) {
        console.error('[KODY] Service IA non prêt après initialisation');
        return {
          errorDetails: {
            message: localize('kody.chat.serviceNotReady', 'Service IA non prêt. Vérifiez votre configuration et votre clé API.'),
            responseIsIncomplete: false,
            responseIsFiltered: false
          }
        };
      }

      // Convertir l'historique en messages
      const messages: AIMessage[] = [];

      // Ajouter l'historique
      for (const entry of history) {
        if (entry.request?.message) {
          messages.push({
            role: 'user',
            content: entry.request.message
          });
        }
        if (entry.response && entry.response.length > 0) {
          // Extraire le contenu de la réponse
          const responseContent = entry.response
            .filter((r: any) => r.kind === 'markdownContent' || r.kind === 'text')
            .map((r: any) => typeof r.content === 'string' ? r.content : r.content.value)
            .join('\n');
          
          if (responseContent) {
            messages.push({
              role: 'assistant',
              content: responseContent
            });
          }
        }
      }

      // Ajouter la requête actuelle
      messages.push({
        role: 'user',
        content: request.message
      });

      // Afficher un message de progression
      const progressMessage: IChatMarkdownContent = {
        kind: 'markdownContent',
        content: {
          value: localize('kody.chat.processing', 'Traitement de votre demande avec {0}...', aiConfig.service)
        }
      };
      progress([progressMessage]);

      // Appeler le service IA
      let modelName = 'N/A';
      if (aiConfig.service === 'openrouter' && aiConfig.openrouter) {
        modelName = aiConfig.openrouter.model;
      } else if (aiConfig.service === 'openai' && aiConfig.openai) {
        modelName = aiConfig.openai.model;
      } else if (aiConfig.service === 'anthropic' && aiConfig.anthropic) {
        modelName = aiConfig.anthropic.model;
      } else if (aiConfig.service === 'custom' && aiConfig.custom) {
        modelName = aiConfig.custom.endpoint;
      }
      
      console.log('[KODY] Envoi de la requête au service IA:', {
        service: aiConfig.service,
        model: modelName,
        messagesCount: messages.length
      });

      const response = await aiServiceProvider.chat(messages);

      console.log('[KODY] Réponse reçue:', {
        model: response.model,
        contentLength: response.content?.length || 0
      });

      // Envoyer la réponse via progress
      const responseContent: IChatMarkdownContent = {
        kind: 'markdownContent',
        content: {
          value: response.content || localize('kody.chat.emptyResponse', 'Réponse vide du service IA')
        }
      };
      progress([responseContent]);

      // Retourner le résultat
      return {
        errorDetails: undefined,
        metadata: {
          model: response.model,
          usage: response.usage
        }
      };
    } catch (error: any) {
      console.error('[KODY] Erreur dans invokeAgent:', error);
      const errorMessage = error.message || error.toString() || localize('kody.chat.error', 'Erreur lors de l\'appel au service IA');
      return {
        errorDetails: {
          message: errorMessage,
          responseIsIncomplete: false,
          responseIsFiltered: false
        }
      };
    }
  }
}

