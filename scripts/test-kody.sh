#!/bin/bash
# Script pour tester KODY IDE sans installation complète
# Usage: ./test-kody.sh

set -e

ROOT=$(dirname "$(dirname "$(readlink -f "$0")")")
cd "$ROOT"

echo "🧪 Test de KODY IDE"
echo "==================="
echo ""

# Vérifier si VSCode est compilé
if [ ! -d ".build/electron" ] && [ ! -d "out-vscode" ]; then
    echo "❌ VSCode n'est pas encore compilé."
    echo "   Compilation en cours..."
    npm run compile
    echo "✅ Compilation terminée"
fi

# Préparer le lancement
if [[ -z "${VSCODE_SKIP_PRELAUNCH}" ]]; then
    echo "📦 Préparation du lancement..."
    node build/lib/preLaunch.js
fi

# Configuration
export NODE_ENV=development
export VSCODE_DEV=1
export VSCODE_CLI=1

# Détecter le binaire Electron
if [ -d ".build/electron" ]; then
    NAME=$(node -p "require('./product.json').applicationName")
    CODE=".build/electron/$NAME"
    
    if [ ! -f "$CODE" ]; then
        echo "⚠️  Binaire Electron non trouvé, compilation nécessaire..."
        echo "   Exécutez: npm run gulp -- vscode-linux-x64-min"
        exit 1
    fi
else
    echo "⚠️  Répertoire .build/electron non trouvé"
    echo "   Exécutez: npm run gulp -- vscode-linux-x64-min"
    exit 1
fi

echo "🚀 Lancement de KODY IDE..."
echo ""

# Lancer KODY IDE
exec "$CODE" . "$@"

