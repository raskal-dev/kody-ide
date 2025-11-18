# 🧪 Guide de test de KODY IDE

## ✅ KODY est lancé !

L'écran vide est normal - VS Code affiche un écran vide quand aucun dossier n'est ouvert.

## 📋 Étapes pour tester KODY

### 1. Ouvrir un dossier de test

**Option A: Via le menu**
- Cliquez sur **File > Open Folder** (ou `Ctrl+K Ctrl+O`)
- Sélectionnez un dossier (par exemple: `/home/raskal/Coding/KODY`)

**Option B: Via la ligne de commande**
```bash
cd /home/raskal/Coding/KODY/vscode
./scripts/code.sh /home/raskal/Coding/KODY
```

### 2. Vérifier l'interface KODY

Une fois un dossier ouvert, vous devriez voir:
- ✅ L'explorateur de fichiers à gauche
- ✅ L'éditeur au centre
- ✅ Le thème dark actif
- ✅ Le logo "K" dans la barre de titre (si configuré)

### 3. Tester les commandes KODY

**Ouvrir la palette de commandes:**
- Appuyez sur `Ctrl+Shift+P` (ou `Cmd+Shift+P` sur Mac)

**Rechercher les commandes KODY:**
- Tapez `KODY` dans la palette
- Vous devriez voir:
  - `KODY: Ouvrir le panneau IA`
  - `KODY: Analyser le projet`
  - `KODY: Configurer le service IA`

**Tester le raccourci clavier:**
- Appuyez sur `Ctrl+Shift+K` pour ouvrir le panneau IA

### 4. Vérifier la console développeur

**Ouvrir la console:**
- Menu: **Help > Toggle Developer Tools** (ou `Ctrl+Shift+I`)
- Allez dans l'onglet **Console**

**Vérifier les logs KODY:**
- Recherchez les messages commençant par `[KODY]`
- Vous devriez voir: `[KODY] Service IA initialisé: ...`

**Vérifier les erreurs:**
- Si vous voyez des erreurs liées à KODY, notez-les

### 5. Configurer un service IA

**Ouvrir les paramètres:**
- Menu: **File > Preferences > Settings** (ou `Ctrl+,`)
- Ou via la palette: `Ctrl+Shift+P` puis "Preferences: Open Settings"

**Rechercher KODY:**
- Dans la barre de recherche des paramètres, tapez `KODY AI`
- Configurez:
  - **Service**: OpenRouter, OpenAI, Anthropic, ou Custom
  - **Modèle**: Le modèle à utiliser
  - **Clé API**: Votre clé API (stockée de manière sécurisée)

### 6. Tester l'analyse de projet

**Lancer l'analyse:**
- Ouvrez un dossier avec du code
- `Ctrl+Shift+P` → `KODY: Analyser le projet`
- Une notification devrait apparaître avec le résultat

### 7. Tester le panneau IA

**Ouvrir le panneau:**
- `Ctrl+Shift+K` ou `Ctrl+Shift+P` → `KODY: Ouvrir le panneau IA`
- Le panneau IA devrait s'ouvrir (à implémenter complètement)

## 🔍 Dépannage

### L'interface est toujours vide
- Vérifiez la console développeur (`Ctrl+Shift+I`)
- Regardez les erreurs dans l'onglet Console
- Vérifiez que le dossier est bien ouvert

### Les commandes KODY n'apparaissent pas
- Vérifiez la console développeur pour les erreurs
- Vérifiez que `kody.contribution.ts` est bien compilé dans `out/`
- Redémarrez KODY après compilation

### Le service IA ne fonctionne pas
- Vérifiez que vous avez configuré une clé API
- Vérifiez la console développeur pour les erreurs de connexion
- Vérifiez que le service choisi est correctement configuré

## 📝 Notes

- Le panneau IA est actuellement une notification - l'interface complète sera implémentée plus tard
- L'analyse de projet fonctionne mais peut être améliorée
- Les services IA nécessitent une clé API valide pour fonctionner

