# KODY IDE

**KODY IDE** est un fork personnalisé de Visual Studio Code (Code-OSS) avec des fonctionnalités d'IA intégrées directement dans le core de l'IDE.

## 🚀 Fonctionnalités

- **IA intégrée** : Support pour OpenRouter, OpenAI, Anthropic et services personnalisés
- **Analyse de projet** : Analyse automatique de la structure de votre projet
- **Panel IA** : Interface dédiée pour interagir avec l'IA
- **Thème sombre par défaut** : Interface optimisée pour le développement
- **Branding personnalisé** : Logo et identité visuelle KODY

## 📦 Installation

### EndeavourOS / Arch Linux

Voir [scripts/INSTALL_ENDEAVOUROS.md](scripts/INSTALL_ENDEAVOUROS.md) pour les instructions complètes.

**Installation rapide :**
```bash
./scripts/KodySetup.sh
```

**Test en mode développement :**
```bash
./scripts/test-kody.sh
```

## 🔧 Développement

### Prérequis

- Node.js 18+ (recommandé: Node.js 18 LTS)
- Python 3
- Build tools (g++, make, etc.)
- Git

### Compilation

```bash
# Installation des dépendances
npm install

# Compilation du client
npm run gulp -- compile-client

# Compilation complète
npm run compile
```

### Lancement en mode développement

```bash
./scripts/code.sh
```

## 📁 Structure du projet

```
vscode/
├── src/vs/workbench/contrib/kody/    # Code KODY intégré
│   ├── browser/                      # Code côté client
│   │   ├── kodyService.ts           # Service principal
│   │   ├── kodyCommands.ts          # Commandes KODY
│   │   ├── kodyActions.ts           # Actions et menus
│   │   └── kody.contribution.ts     # Enregistrement des contributions
│   ├── services/                     # Services IA
│   │   ├── AIServiceProvider.ts
│   │   ├── OpenRouterService.ts
│   │   ├── OpenAIService.ts
│   │   ├── AnthropicService.ts
│   │   └── CustomAIService.ts
│   └── common/                       # Code partagé
├── resources/kody/                   # Ressources KODY (logos, etc.)
└── scripts/                          # Scripts d'installation et de test
```

## 🔗 Liens

- **Repository** : [github.com/raskal-dev/kody-ide](https://github.com/raskal-dev/kody-ide)
- **Upstream** : [github.com/microsoft/vscode](https://github.com/microsoft/vscode)

## 📝 Configuration Git

```bash
# Remote origin (votre fork)
git remote set-url origin git@github.com:raskal-dev/kody-ide.git

# Remote upstream (repo Microsoft)
git remote add upstream https://github.com/microsoft/vscode.git
```

## 🐛 Débogage

Voir [DEBUG.md](DEBUG.md) pour le guide de débogage.

## 📄 Licence

Ce projet est basé sur Visual Studio Code (Code-OSS) qui est sous licence MIT.
Voir [LICENSE.txt](LICENSE.txt) pour plus de détails.

