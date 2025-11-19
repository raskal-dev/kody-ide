/**
 * Actions et menus KODY pour VSCode
 * Ce fichier doit être placé dans: src/vs/workbench/contrib/kody/browser/kodyActions.ts
 */

import { IWorkbenchContribution } from '../../../common/contributions.js';
import { MenuRegistry, MenuId, registerAction2, Action2 } from '../../../../platform/actions/common/actions.js';
import { KeyMod, KeyCode } from '../../../../base/common/keyCodes.js';
import { KeybindingsRegistry, KeybindingWeight } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { localize, localize2 } from '../../../../nls.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { ChatContextKeys } from '../../chat/common/chatContextKeys.js';

export class KodyActions extends Disposable implements IWorkbenchContribution {
  static readonly ID = 'workbench.contrib.kodyActions';
  
  constructor() {
    super();
    this.registerCommands();
    this.registerMenus();
  }

  private registerCommands(): void {
    // Les commandes sont enregistrées dans kodyCommands.ts
    // Ici on enregistre uniquement les menus
    // Pas besoin de faire quoi que ce soit ici
  }

  private registerMenus(): void {
    // Ajouter au menu de la palette de commandes
    MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
      command: {
        id: 'kody.openAIPanel',
        title: localize('kody.openAIPanel', 'KODY: Ouvrir le panneau IA')
      }
    });

    MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
      command: {
        id: 'kody.analyzeProject',
        title: localize('kody.analyzeProject', 'KODY: Analyser le projet')
      }
    });

    MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
      command: {
        id: 'kody.configureAIService',
        title: localize('kody.configureAIService', 'KODY: Configurer le service IA')
      }
    });

    MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
      command: {
        id: 'kody.changeAIService',
        title: localize('kody.changeAIService', 'KODY: Changer le service IA')
      }
    });

    MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
      command: {
        id: 'kody.changeAIModel',
        title: localize('kody.changeAIModel', 'KODY: Changer le modèle IA')
      }
    });

    // Ajouter au menu View
    MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
      group: '1_panels',
      command: {
        id: 'kody.openAIPanel',
        title: localize('kody.viewAIPanel', 'KODY AI')
      },
      order: 10
    });

    // Ajouter au menu du chat (ChatTitleBarMenu)
    MenuRegistry.appendMenuItem(MenuId.ChatTitleBarMenu, {
      command: {
        id: 'kody.changeAIService',
        title: localize2('kody.changeAIService', 'Changer le service IA...')
      },
      group: 'z_kody',
      order: 1,
      when: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        ContextKeyExpr.or(
          ChatContextKeys.Setup.installed.negate(),
          ChatContextKeys.Setup.disabled.negate()
        )
      )
    });

    MenuRegistry.appendMenuItem(MenuId.ChatTitleBarMenu, {
      command: {
        id: 'kody.changeAIModel',
        title: localize2('kody.changeAIModel', 'Changer le modèle...')
      },
      group: 'z_kody',
      order: 2,
      when: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        ContextKeyExpr.or(
          ChatContextKeys.Setup.installed.negate(),
          ChatContextKeys.Setup.disabled.negate()
        )
      )
    });

    MenuRegistry.appendMenuItem(MenuId.ChatTitleBarMenu, {
      command: {
        id: 'kody.configureAIService',
        title: localize2('kody.configureAIService', 'Configurer KODY AI...')
      },
      group: 'z_kody',
      order: 3,
      when: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        ContextKeyExpr.or(
          ChatContextKeys.Setup.installed.negate(),
          ChatContextKeys.Setup.disabled.negate()
        )
      )
    });

    // Raccourcis clavier
    KeybindingsRegistry.registerKeybindingRule({
      id: 'kody.openAIPanel',
      weight: KeybindingWeight.WorkbenchContrib,
      when: undefined,
      primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyK,
    });
  }
}

// Enregistrer les actions pour les commandes
registerAction2(class ChangeAIServiceAction extends Action2 {
  constructor() {
    super({
      id: 'kody.changeAIService',
      title: localize2('kody.changeAIService', 'KODY: Changer le service IA'),
      category: localize2('kody.category', 'KODY'),
      f1: true
    });
  }

  async run(accessor: ServicesAccessor): Promise<void> {
    const commandService = accessor.get(ICommandService);
    await commandService.executeCommand('kody.changeAIService');
  }
});

registerAction2(class ChangeAIModelAction extends Action2 {
  constructor() {
    super({
      id: 'kody.changeAIModel',
      title: localize2('kody.changeAIModel', 'KODY: Changer le modèle IA'),
      category: localize2('kody.category', 'KODY'),
      f1: true
    });
  }

  async run(accessor: ServicesAccessor): Promise<void> {
    const commandService = accessor.get(ICommandService);
    await commandService.executeCommand('kody.changeAIModel');
  }
});

