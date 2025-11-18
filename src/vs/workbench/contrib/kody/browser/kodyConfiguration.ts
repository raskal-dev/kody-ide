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
            localize('kody.ai.service.openrouter', 'OpenRouter - Accès à plusieurs modèles via une seule API'),
            localize('kody.ai.service.openai', 'OpenAI - Accès direct à GPT-4, GPT-3.5, etc.'),
            localize('kody.ai.service.anthropic', 'Anthropic - Accès à Claude'),
            localize('kody.ai.service.custom', 'Service personnalisé - Endpoint personnalisé')
          ],
          default: 'openrouter',
          description: localize('kody.ai.service.description', 'Service IA à utiliser pour KODY'),
          order: 1
        },
        'kody.ai.openrouter.model': {
          type: 'string',
          default: 'google/gemini-flash-1.5-8b',
          description: localize('kody.ai.openrouter.model.description', 'Modèle OpenRouter à utiliser. Modèles gratuits: google/gemini-flash-1.5-8b, meta-llama/llama-3.2-3b-instruct:free, qwen/qwen-2-7b-instruct:free'),
          order: 2
        },
        'kody.ai.openai.model': {
          type: 'string',
          default: 'gpt-4-turbo-preview',
          description: localize('kody.ai.openai.model.description', 'Modèle OpenAI à utiliser (ex: gpt-4-turbo-preview, gpt-3.5-turbo)'),
          order: 3
        },
        'kody.ai.anthropic.model': {
          type: 'string',
          default: 'claude-3-opus-20240229',
          description: localize('kody.ai.anthropic.model.description', 'Modèle Anthropic à utiliser (ex: claude-3-opus-20240229, claude-3-sonnet-20240229)'),
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

