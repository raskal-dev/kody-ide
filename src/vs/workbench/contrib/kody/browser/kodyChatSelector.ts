/*---------------------------------------------------------------------------------------------
 *  Copyright (c) KODY IDE. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService, ConfigurationTarget } from '../../../../platform/configuration/common/configuration.js';
import { IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { getSelectBoxStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { localize } from '../../../../nls.js';
import * as dom from '../../../../base/browser/dom.js';
import { SelectBox, ISelectOptionItem } from '../../../../base/browser/ui/selectBox/selectBox.js';
import { ISelectBoxOptions } from '../../../../base/browser/ui/selectBox/selectBox.js';
import { AIService } from '../common/types.js';

const $ = dom.$;

export class KodyChatSelector extends Disposable {
  private container: HTMLElement | null = null;
  private serviceSelectBox: SelectBox | null = null;
  private modelSelectBox: SelectBox | null = null;
  private serviceContainer: HTMLElement | null = null;
  private modelContainer: HTMLElement | null = null;

  constructor(
    private readonly parent: HTMLElement,
    @IConfigurationService private readonly configurationService: IConfigurationService,
    @IContextViewService private readonly contextViewService: IContextViewService
  ) {
    super();
    this.render();
  }

  private render(): void {
    // Créer le conteneur pour les sélecteurs
    this.container = $('.kody-chat-selector-container');
    this.container.style.display = 'flex';
    this.container.style.gap = '8px';
    this.container.style.padding = '8px 12px';
    this.container.style.borderTop = '1px solid var(--vscode-panel-border)';
    this.container.style.backgroundColor = 'var(--vscode-input-background)';
    this.container.style.alignItems = 'center';

    // Conteneur pour le service
    this.serviceContainer = $('.kody-service-selector');
    this.serviceContainer.style.display = 'flex';
    this.serviceContainer.style.alignItems = 'center';
    this.serviceContainer.style.gap = '4px';
    
    const serviceLabel = $('label');
    serviceLabel.textContent = localize('kody.chat.service.label', 'Service:');
    serviceLabel.style.fontSize = '12px';
    serviceLabel.style.color = 'var(--vscode-foreground)';
    this.serviceContainer.appendChild(serviceLabel);

    // Sélecteur de service
    const serviceOptions: ISelectBoxOptions = {
      ariaLabel: localize('kody.chat.service.ariaLabel', 'Sélectionner le service IA'),
      optionsAsChildren: false
    };

    const serviceItems = [
      { text: 'OpenRouter', value: 'openrouter' },
      { text: 'OpenAI', value: 'openai' },
      { text: 'Anthropic', value: 'anthropic' },
      { text: 'Custom', value: 'custom' }
    ];

    const serviceSelectContainer = $('.kody-service-select');
    const serviceSelectItems: ISelectOptionItem[] = serviceItems.map(item => ({ text: item.text }));
    const selectBoxStyles = getSelectBoxStyles({});
    this.serviceSelectBox = new SelectBox(
      serviceSelectItems,
      0,
      this.contextViewService,
      selectBoxStyles,
      serviceOptions
    );

    this.serviceSelectBox.render(serviceSelectContainer);
    this.serviceSelectBox.setOptions(serviceSelectItems, 0);
    this.serviceContainer.appendChild(serviceSelectContainer);

    // Écouter les changements de service
    this._register(this.serviceSelectBox.onDidSelect(e => {
      const selectedService = serviceItems[e.index]?.value as AIService;
      if (selectedService) {
        this.configurationService.updateValue('kody.ai.service', selectedService, ConfigurationTarget.USER);
        this.updateModelOptions(selectedService);
      }
    }));

    // Conteneur pour le modèle
    this.modelContainer = $('.kody-model-selector');
    this.modelContainer.style.display = 'flex';
    this.modelContainer.style.alignItems = 'center';
    this.modelContainer.style.gap = '4px';
    
    const modelLabel = $('label');
    modelLabel.textContent = localize('kody.chat.model.label', 'Modèle:');
    modelLabel.style.fontSize = '12px';
    modelLabel.style.color = 'var(--vscode-foreground)';
    this.modelContainer.appendChild(modelLabel);

    // Sélecteur de modèle
    const modelOptions: ISelectBoxOptions = {
      ariaLabel: localize('kody.chat.model.ariaLabel', 'Sélectionner le modèle')
    };

    const modelSelectContainer = $('.kody-model-select');
    const modelSelectBoxStyles = getSelectBoxStyles({});
    this.modelSelectBox = new SelectBox([], 0, this.contextViewService, modelSelectBoxStyles, modelOptions);
    this.modelSelectBox.render(modelSelectContainer);
    this.modelContainer.appendChild(modelSelectContainer);

    // Ajouter les conteneurs au parent
    this.container.appendChild(this.serviceContainer);
    this.container.appendChild(this.modelContainer);
    this.parent.appendChild(this.container);

    // Initialiser avec les valeurs actuelles
    this.initialize();

    // Écouter les changements de configuration
    this._register(this.configurationService.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('kody.ai.service') || 
          e.affectsConfiguration('kody.ai.openrouter.model') ||
          e.affectsConfiguration('kody.ai.openai.model') ||
          e.affectsConfiguration('kody.ai.anthropic.model')) {
        this.initialize();
      }
    }));
  }

  private async initialize(): Promise<void> {
    const currentService = this.configurationService.getValue<AIService>('kody.ai.service') || 'openrouter';
    
    // Mettre à jour le sélecteur de service
    const serviceIndex = ['openrouter', 'openai', 'anthropic', 'custom'].indexOf(currentService);
    if (serviceIndex >= 0 && this.serviceSelectBox) {
      this.serviceSelectBox.select(serviceIndex);
    }

    // Mettre à jour les options de modèle
    await this.updateModelOptions(currentService);
  }

  private async updateModelOptions(service: AIService): Promise<void> {
    if (!this.modelSelectBox) return;

    let modelItems: Array<{ text: string; value: string }> = [];
    let currentModel = '';

    switch (service) {
      case 'openrouter':
        currentModel = this.configurationService.getValue<string>('kody.ai.openrouter.model') || 'google/gemini-flash-1.5-8b';
        modelItems = [
          { text: 'Gemini Flash 1.5 8B (Gratuit)', value: 'google/gemini-flash-1.5-8b' },
          { text: 'Llama 3.2 3B (Gratuit)', value: 'meta-llama/llama-3.2-3b-instruct:free' },
          { text: 'Qwen 2 7B (Gratuit)', value: 'qwen/qwen-2-7b-instruct:free' },
          { text: 'GPT-4o (Payant)', value: 'openai/gpt-4o' },
          { text: 'GPT-4 Turbo (Payant)', value: 'openai/gpt-4-turbo' },
          { text: 'Claude 3.5 Sonnet (Payant)', value: 'anthropic/claude-3.5-sonnet' }
        ];
        break;
      case 'openai':
        currentModel = this.configurationService.getValue<string>('kody.ai.openai.model') || 'gpt-4-turbo-preview';
        modelItems = [
          { text: 'GPT-4 Turbo Preview', value: 'gpt-4-turbo-preview' },
          { text: 'GPT-4', value: 'gpt-4' },
          { text: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' }
        ];
        break;
      case 'anthropic':
        currentModel = this.configurationService.getValue<string>('kody.ai.anthropic.model') || 'claude-3-opus-20240229';
        modelItems = [
          { text: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
          { text: 'Claude 3 Sonnet', value: 'claude-3-sonnet-20240229' },
          { text: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' }
        ];
        break;
      case 'custom':
        currentModel = this.configurationService.getValue<string>('kody.ai.custom.endpoint') || '';
        modelItems = [];
        break;
    }

    // Mettre à jour le sélecteur de modèle
    const modelSelectItems: ISelectOptionItem[] = modelItems.map(item => ({ text: item.text }));
    const currentIndex = modelItems.findIndex(item => item.value === currentModel);
    this.modelSelectBox.setOptions(modelSelectItems, currentIndex >= 0 ? currentIndex : 0);

    // Désenregistrer l'ancien listener et en créer un nouveau
    const modelListener = this.modelSelectBox.onDidSelect(e => {
      const selectedModel = modelItems[e.index]?.value;
      if (selectedModel) {
        if (service === 'openrouter') {
          this.configurationService.updateValue('kody.ai.openrouter.model', selectedModel, ConfigurationTarget.USER);
        } else if (service === 'openai') {
          this.configurationService.updateValue('kody.ai.openai.model', selectedModel, ConfigurationTarget.USER);
        } else if (service === 'anthropic') {
          this.configurationService.updateValue('kody.ai.anthropic.model', selectedModel, ConfigurationTarget.USER);
        }
      }
    });
    this._register(modelListener);
  }

  public override dispose(): void {
    if (this.serviceSelectBox) {
      this.serviceSelectBox.dispose();
    }
    if (this.modelSelectBox) {
      this.modelSelectBox.dispose();
    }
    if (this.container) {
      this.container.remove();
    }
    super.dispose();
  }
}

