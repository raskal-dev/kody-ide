/**
 * Contribution KODY pour VSCode
 * Ce fichier enregistre toutes les contributions KODY dans le workbench VSCode
 */

import { WorkbenchPhase, registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { KodyService } from './kodyService.js';
import { KodyCommands } from './kodyCommands.js';
import { KodyActions } from './kodyActions.js';
import { KodyConfiguration } from './kodyConfiguration.js';
import { KodyChatAgent } from './kodyChatAgent.js';

// Enregistrer la configuration
registerWorkbenchContribution2(KodyConfiguration.ID, KodyConfiguration, WorkbenchPhase.BlockStartup);

// Enregistrer le service KODY
registerWorkbenchContribution2(KodyService.ID, KodyService, WorkbenchPhase.BlockRestore);

// Enregistrer les commandes
registerWorkbenchContribution2(KodyCommands.ID, KodyCommands, WorkbenchPhase.BlockRestore);

// Enregistrer les actions (menus, commandes)
registerWorkbenchContribution2(KodyActions.ID, KodyActions, WorkbenchPhase.BlockRestore);

// Enregistrer le chat agent KODY (remplace Copilot)
registerWorkbenchContribution2(KodyChatAgent.ID, KodyChatAgent, WorkbenchPhase.BlockRestore);
