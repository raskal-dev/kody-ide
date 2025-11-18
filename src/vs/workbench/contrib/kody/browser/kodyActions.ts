/**
 * Actions et menus KODY pour VSCode
 * Ce fichier doit être placé dans: src/vs/workbench/contrib/kody/browser/kodyActions.ts
 */

import { IWorkbenchContribution } from '../../../common/contributions.js';
import { MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import { KeyMod, KeyCode } from '../../../../base/common/keyCodes.js';
import { KeybindingsRegistry, KeybindingWeight } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { localize } from '../../../../nls.js';
import { Disposable } from '../../../../base/common/lifecycle.js';

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

    // Ajouter au menu View
    MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
      group: '1_panels',
      command: {
        id: 'kody.openAIPanel',
        title: localize('kody.viewAIPanel', 'KODY AI')
      },
      order: 10
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

