# 🐛 Guide de débogage KODY

## Problème: Le workbench ne se charge pas

### Étapes de diagnostic

1. **Ouvrir la Console des Developer Tools**
   - Dans KODY, les Developer Tools sont déjà ouverts
   - Cliquez sur l'onglet **"Console"** (pas "Elements")
   - Regardez les erreurs en **rouge**

2. **Erreurs à rechercher**

   **Erreurs d'import:**
   ```
   Cannot find module '...'
   Failed to load module '...'
   ```

   **Erreurs de contribution:**
   ```
   registerWorkbenchContribution2 is not a function
   WorkbenchPhase is not defined
   ```

   **Erreurs de classe:**
   ```
   Cannot read property 'ID' of undefined
   Class is not a constructor
   ```

3. **Actions à prendre**

   **Si vous voyez des erreurs d'import:**
   - Vérifiez que tous les fichiers sont compilés dans `out/`
   - Vérifiez que les chemins d'import sont corrects

   **Si vous voyez des erreurs de contribution:**
   - Vérifiez que `registerWorkbenchContribution2` est bien importé
   - Vérifiez que `WorkbenchPhase` est bien importé

   **Si vous voyez des erreurs de classe:**
   - Vérifiez que les IDs statiques sont bien définis
   - Vérifiez que les classes sont bien exportées

4. **Solution temporaire: Désactiver KODY**

   Si KODY bloque le chargement, vous pouvez temporairement désactiver l'import:
   
   Dans `src/vs/workbench/workbench.common.main.ts`, commentez la ligne:
   ```typescript
   // import './contrib/kody/browser/kody.contribution.js';
   ```
   
   Puis recompilez:
   ```bash
   npm run gulp -- compile-client
   ```

5. **Partager les erreurs**

   Copiez toutes les erreurs de la console et partagez-les pour qu'on puisse les corriger.

