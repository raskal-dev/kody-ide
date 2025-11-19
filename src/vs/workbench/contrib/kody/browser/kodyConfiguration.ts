/*---------------------------------------------------------------------------------------------
 *  Copyright (c) KODY IDE. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IWorkbenchContribution } from '../../../common/contributions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as ConfigurationExtensions, IConfigurationRegistry, IConfigurationNode } from '../../../../platform/configuration/common/configurationRegistry.js';
import { localize } from '../../../../nls.js';

export class KodyConfiguration extends Disposable implements IWorkbenchContribution {
  static readonly ID = 'workbench.contrib.kodyConfiguration';

  constructor() {
    super();
    this.registerConfiguration();
  }

  private registerConfiguration(): void {
    const configurationRegistry = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration);

    const kodyConfiguration: IConfigurationNode = {
      id: 'kody',
      title: localize('kody.configuration.title', 'KODY AI'),
      type: 'object',
      properties: {
        'kody.ai.service': {
          type: 'string',
          enum: ['openrouter', 'openai', 'anthropic', 'custom'],
          enumDescriptions: [
            localize('kody.ai.service.openrouter', 'OpenRouter - Accès à plusieurs modèles (GPT-4, Claude, Llama, etc.) via une seule API. Recommandé pour tester avec des modèles gratuits.'),
            localize('kody.ai.service.openai', 'OpenAI - Accès direct à GPT-4, GPT-3.5, etc. Nécessite une clé API OpenAI.'),
            localize('kody.ai.service.anthropic', 'Anthropic - Accès à Claude (Opus, Sonnet, Haiku). Nécessite une clé API Anthropic.'),
            localize('kody.ai.service.custom', 'Service personnalisé - Utilisez votre propre endpoint compatible OpenAI.')
          ],
          default: 'openrouter',
          description: localize('kody.ai.service.description', 'Service IA à utiliser pour KODY. Configurez votre clé API dans les paramètres secrets (Ctrl+Shift+P > "KODY: Configure AI Service").'),
          markdownDescription: localize('kody.ai.service.markdownDescription', 'Service IA à utiliser pour KODY.\n\n**Important:** Après avoir sélectionné un service, vous devez configurer votre clé API en utilisant la commande **"KODY: Configure AI Service"** (Ctrl+Shift+P).\n\n**Recommandation:** Utilisez **OpenRouter** pour tester avec des modèles gratuits avant de passer à un service payant.'),
          order: 1
        },
        'kody.ai.openrouter.model': {
          type: 'string',
          default: 'google/gemini-flash-1.5-8b',
          description: localize('kody.ai.openrouter.model.description', 'Modèle OpenRouter à utiliser. Modèles gratuits recommandés: google/gemini-flash-1.5-8b, meta-llama/llama-3.2-3b-instruct:free, qwen/qwen-2-7b-instruct:free. Modèles payants: openai/gpt-4o, openai/gpt-4-turbo, anthropic/claude-3.5-sonnet'),
          markdownDescription: localize('kody.ai.openrouter.model.markdownDescription', 'Modèle OpenRouter à utiliser.\n\n**Modèles gratuits (recommandés pour tester):**\n- `google/gemini-flash-1.5-8b` - Rapide et gratuit\n- `meta-llama/llama-3.2-3b-instruct:free` - Llama 3.2 gratuit\n- `qwen/qwen-2-7b-instruct:free` - Qwen 2 gratuit\n\n**Modèles payants:**\n- `openai/gpt-4o` - GPT-4o (le plus puissant)\n- `openai/gpt-4-turbo` - GPT-4 Turbo\n- `anthropic/claude-3.5-sonnet` - Claude 3.5 Sonnet'),
          order: 2
        },
        'kody.ai.openai.model': {
          type: 'string',
          default: 'gpt-4-turbo-preview',
          description: localize('kody.ai.openai.model.description', 'Modèle OpenAI à utiliser'),
          markdownDescription: localize('kody.ai.openai.model.markdownDescription', 'Modèle OpenAI à utiliser.\n\n**Modèles disponibles:**\n- `gpt-4-turbo-preview` - GPT-4 Turbo (recommandé)\n- `gpt-4` - GPT-4 standard\n- `gpt-3.5-turbo` - GPT-3.5 Turbo (plus rapide, moins cher)'),
          order: 3
        },
        'kody.ai.anthropic.model': {
          type: 'string',
          default: 'claude-3-opus-20240229',
          description: localize('kody.ai.anthropic.model.description', 'Modèle Anthropic à utiliser'),
          markdownDescription: localize('kody.ai.anthropic.model.markdownDescription', 'Modèle Anthropic à utiliser.\n\n**Modèles disponibles:**\n- `claude-3-opus-20240229` - Claude 3 Opus (le plus puissant)\n- `claude-3-sonnet-20240229` - Claude 3 Sonnet (équilibré)\n- `claude-3-haiku-20240307` - Claude 3 Haiku (rapide)'),
          order: 4
        },
        'kody.ai.custom.endpoint': {
          type: 'string',
          default: '',
          description: localize('kody.ai.custom.endpoint.description', 'Endpoint personnalisé pour le service IA (format compatible OpenAI)'),
          order: 5
        }
      }
    };

    configurationRegistry.registerConfiguration(kodyConfiguration);
  }
}

