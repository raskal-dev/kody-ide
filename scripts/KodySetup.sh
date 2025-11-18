#!/bin/bash
# Script d'installation KODY IDE pour EndeavourOS / Arch Linux
# Usage: ./KodySetup.sh

set -e

VERSION="0.1.0"
INSTALL_DIR="/opt/kody-ide"
BIN_DIR="/usr/local/bin"
DESKTOP_DIR="/usr/share/applications"
ICON_DIR="/usr/share/pixmaps"

echo "🚀 Installation de KODY IDE pour EndeavourOS / Arch Linux"
echo "=========================================================="
echo ""

# Vérifier que nous sommes sur Arch/EndeavourOS
if [ ! -f /etc/arch-release ]; then
    echo "⚠️  Ce script est conçu pour Arch Linux / EndeavourOS"
    read -p "Continuer quand même ? (o/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        exit 1
    fi
fi

# Vérifier les dépendances
echo "📦 Vérification des dépendances..."
MISSING_DEPS=()
for dep in gtk3 libxss libasound2 nss libdrm mesa; do
    if ! pacman -Qi "$dep" &>/dev/null; then
        MISSING_DEPS+=("$dep")
    fi
done

if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    echo "⚠️  Dépendances manquantes : ${MISSING_DEPS[*]}"
    read -p "Installer les dépendances maintenant ? (O/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        sudo pacman -S --needed "${MISSING_DEPS[@]}"
    fi
fi

# Vérifier si VSCode est compilé
if [ ! -d "VSCode-linux-x64" ] && [ ! -d "out-vscode" ]; then
    echo "❌ VSCode n'est pas encore compilé."
    echo "   Veuillez d'abord compiler VSCode :"
    echo "   npm run compile"
    echo "   npm run gulp -- vscode-linux-x64-min"
    exit 1
fi

# Créer le répertoire d'installation
echo "📁 Création du répertoire d'installation..."
sudo mkdir -p "$INSTALL_DIR"
sudo mkdir -p "$BIN_DIR"
sudo mkdir -p "$DESKTOP_DIR"
sudo mkdir -p "$ICON_DIR"

# Copier les fichiers
echo "📋 Copie des fichiers..."
if [ -d "VSCode-linux-x64" ]; then
    sudo cp -r VSCode-linux-x64/* "$INSTALL_DIR/"
else
    echo "⚠️  VSCode-linux-x64 non trouvé, utilisation de out-vscode..."
    # Il faudrait packager out-vscode, mais pour l'instant on utilise ce qui existe
    echo "   Veuillez d'abord compiler avec: npm run gulp -- vscode-linux-x64-min"
    exit 1
fi

# Créer le script de lancement
echo "🔧 Création du script de lancement..."
sudo tee "$BIN_DIR/kody" > /dev/null << 'EOF'
#!/bin/bash
exec /opt/kody-ide/bin/code "$@"
EOF
sudo chmod +x "$BIN_DIR/kody"

# Créer le fichier .desktop
echo "📝 Création du fichier .desktop..."
sudo tee "$DESKTOP_DIR/kody-ide.desktop" > /dev/null << 'EOF'
[Desktop Entry]
Name=KODY IDE
Comment=IDE intelligent avec IA intégrée
GenericName=Text Editor
Exec=/usr/local/bin/kody %F
Icon=kody-ide
Type=Application
StartupNotify=true
StartupWMClass=Code
Categories=Utility;TextEditor;Development;IDE;
MimeType=text/plain;inode/directory;
Actions=new-empty-window;
Keywords=vscode;kody;ide;ai;

[Desktop Action new-empty-window]
Name=New Empty Window
Exec=/usr/local/bin/kody --new-window %F
Icon=kody-ide
EOF

# Copier l'icône
echo "🎨 Installation de l'icône..."
if [ -f "resources/linux/code.png" ]; then
    sudo cp resources/linux/code.png "$ICON_DIR/kody-ide.png"
else
    echo "⚠️  Icône non trouvée, création d'une icône par défaut..."
    # Créer une icône simple si elle n'existe pas
    sudo cp resources/kody/kody_512x512.png "$ICON_DIR/kody-ide.png" 2>/dev/null || echo "   Icône manquante, vous pouvez l'ajouter plus tard"
fi

# Mettre à jour la base de données des applications
echo "🔄 Mise à jour de la base de données des applications..."
sudo update-desktop-database 2>/dev/null || true
sudo gtk-update-icon-cache -f -t /usr/share/icons/hicolor 2>/dev/null || true

echo ""
echo "✅ Installation terminée !"
echo ""
echo "KODY IDE a été installé dans : $INSTALL_DIR"
echo ""
echo "Pour lancer KODY IDE :"
echo "  kody"
echo ""
echo "Ou depuis le menu d'applications : KODY IDE"
echo ""
echo "Pour désinstaller :"
echo "  sudo rm -rf $INSTALL_DIR"
echo "  sudo rm $BIN_DIR/kody"
echo "  sudo rm $DESKTOP_DIR/kody-ide.desktop"
echo "  sudo rm $ICON_DIR/kody-ide.png"

