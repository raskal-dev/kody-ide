#!/bin/bash
# Script pour créer un package Arch Linux pour KODY IDE

set -e

VERSION="0.1.0"
ARCH="x86_64"
PKGNAME="kody-ide"
BUILDDIR=".build/arch"
PKGDIR="$BUILDDIR/$PKGNAME"

echo "🔨 Construction du package Arch Linux pour KODY IDE..."

# Nettoyer
rm -rf "$BUILDDIR"
mkdir -p "$PKGDIR"

# Compiler VSCode si nécessaire
if [ ! -d "out-vscode" ]; then
    echo "📦 Compilation de VSCode..."
    npm run compile
    npm run gulp -- vscode-linux-x64-min
fi

# Créer la structure du package
echo "📁 Création de la structure du package..."
mkdir -p "$PKGDIR/usr/share/kody-ide"
mkdir -p "$PKGDIR/usr/bin"
mkdir -p "$PKGDIR/usr/share/applications"
mkdir -p "$PKGDIR/usr/share/pixmaps"
mkdir -p "$PKGDIR/usr/share/icons/hicolor/512x512/apps"

# Copier les fichiers
echo "📋 Copie des fichiers..."
cp -r VSCode-linux-x64/* "$PKGDIR/usr/share/kody-ide/"

# Créer le script de lancement
cat > "$PKGDIR/usr/bin/kody" << 'EOF'
#!/bin/bash
exec /usr/share/kody-ide/bin/code "$@"
EOF
chmod +x "$PKGDIR/usr/bin/kody"

# Créer le fichier .desktop
cat > "$PKGDIR/usr/share/applications/kody-ide.desktop" << 'EOF'
[Desktop Entry]
Name=KODY IDE
Comment=IDE intelligent avec IA intégrée
GenericName=Text Editor
Exec=/usr/bin/kody %F
Icon=kody-ide
Type=Application
StartupNotify=true
StartupWMClass=Code
Categories=Utility;TextEditor;Development;IDE;
MimeType=text/plain;inode/directory;
Actions=new-empty-window;
Keywords=vscode;

[Desktop Action new-empty-window]
Name=New Empty Window
Exec=/usr/bin/kody --new-window %F
Icon=kody-ide
EOF

# Copier l'icône
cp resources/linux/code.png "$PKGDIR/usr/share/pixmaps/kody-ide.png"
cp resources/linux/code.png "$PKGDIR/usr/share/icons/hicolor/512x512/apps/kody-ide.png"

# Créer le fichier PKGBUILD
cat > "$BUILDDIR/PKGBUILD" << EOF
# Maintainer: KODY IDE Team
pkgname=$PKGNAME
pkgver=$VERSION
pkgrel=1
pkgdesc="IDE intelligent basé sur VSCode avec intégration IA (OpenRouter, OpenAI, etc.)"
arch=('x86_64')
url="https://github.com/kody-ide/kody-ide"
license=('MIT')
depends=('gtk3' 'libxss1' 'libasound2' 'nss' 'libdrm' 'mesa')
provides=('kody')
conflicts=('kody')
source=("kody-ide-\${pkgver}.tar.gz")
sha256sums=('SKIP')

package() {
    cd "\$srcdir"
    cp -r usr "\$pkgdir/"
}
EOF

# Créer le package
echo "📦 Création du package..."
cd "$BUILDDIR"
tar -czf "$PKGNAME-$VERSION.tar.gz" "$PKGNAME/"
cd "$PKGNAME"
makepkg -f

echo "✅ Package créé : $BUILDDIR/$PKGNAME/$PKGNAME-$VERSION-1-$ARCH.pkg.tar.zst"
echo ""
echo "Pour installer :"
echo "  sudo pacman -U $BUILDDIR/$PKGNAME/$PKGNAME-$VERSION-1-$ARCH.pkg.tar.zst"

