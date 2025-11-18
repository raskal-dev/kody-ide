/**
 * Contribution KODY pour VSCode
 * Ce fichier enregistre toutes les contributions KODY dans le workbench VSCode
 */

import { WorkbenchPhase, registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { KodyService } from './kodyService.js';
import { KodyCommands } from './kodyCommands.js';
import { KodyActions } from './kodyActions.js';

// Enregistrer le service KODY
registerWorkbenchContribution2(KodyService.ID, KodyService, WorkbenchPhase.BlockRestore);

// Enregistrer les commandes
registerWorkbenchContribution2(KodyCommands.ID, KodyCommands, WorkbenchPhase.BlockRestore);

// Enregistrer les actions (menus, commandes)
registerWorkbenchContribution2(KodyActions.ID, KodyActions, WorkbenchPhase.BlockRestore);
