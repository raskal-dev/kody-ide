# Installation de KODY IDE sur EndeavourOS / Arch Linux

## Méthode 1 : Script d'installation directe (Recommandé)

### Prérequis

1. **Compiler VSCode** (si pas déjà fait) :
```bash
cd /home/raskal/Coding/KODY/vscode
npm run compile
npm run gulp -- vscode-linux-x64-min
```

2. **Exécuter le script d'installation** :
```bash
cd /home/raskal/Coding/KODY/vscode
./scripts/KodySetup.sh
```

Le script va :
- Vérifier les dépendances
- Installer KODY IDE dans `/opt/kody-ide`
- Créer le lien symbolique `/usr/local/bin/kody`
- Créer le fichier `.desktop` pour le menu
- Installer l'icône

## Méthode 2 : Package Arch (.pkg.tar.zst)

### Créer le package

```bash
cd /home/raskal/Coding/KODY/vscode
./scripts/build-arch-package.sh
```

Cela créera un package dans `.build/arch/kody-ide/`

### Installer le package

```bash
sudo pacman -U .build/arch/kody-ide/kody-ide-0.1.0-1-x86_64.pkg.tar.zst
```

## Méthode 3 : Package AUR (Arch User Repository)

### Créer le package AUR

1. Créer un répertoire pour le package AUR :
```bash
mkdir -p ~/aur/kody-ide
cd ~/aur/kody-ide
```

2. Copier le PKGBUILD :
```bash
cp /home/raskal/Coding/KODY/vscode/scripts/PKGBUILD .
```

3. Créer le fichier .SRCINFO :
```bash
makepkg --printsrcinfo > .SRCINFO
```

4. Créer le tarball source :
```bash
# Depuis le répertoire vscode
cd /home/raskal/Coding/KODY/vscode
tar -czf kody-ide-0.1.0.tar.gz VSCode-linux-x64/
```

5. Publier sur AUR (optionnel) :
   - Créer un compte sur aur.archlinux.org
   - Créer un nouveau package "kody-ide"
   - Uploader le PKGBUILD et .SRCINFO

### Installer depuis AUR

```bash
yay -S kody-ide
# ou
paru -S kody-ide
```

## Utilisation

### Lancer KODY IDE

```bash
kody
```

Ou depuis le menu d'applications : **KODY IDE**

### Options de lancement

```bash
kody .                    # Ouvrir le répertoire actuel
kody fichier.txt          # Ouvrir un fichier
kody --new-window         # Nouvelle fenêtre
kody --help               # Aide
```

## Désinstallation

### Si installé avec le script

```bash
sudo rm -rf /opt/kody-ide
sudo rm /usr/local/bin/kody
sudo rm /usr/share/applications/kody-ide.desktop
sudo rm /usr/share/pixmaps/kody-ide.png
sudo update-desktop-database
```

### Si installé avec pacman

```bash
sudo pacman -R kody-ide
```

## Dépannage

### Erreur : "code: command not found"

Vérifier que le lien symbolique existe :
```bash
ls -l /usr/local/bin/kody
```

### L'icône n'apparaît pas

Mettre à jour le cache des icônes :
```bash
sudo gtk-update-icon-cache -f -t /usr/share/icons/hicolor
```

### Permissions

Si vous avez des problèmes de permissions :
```bash
sudo chown -R $USER:$USER /opt/kody-ide
```

## Notes

- KODY IDE est installé dans `/opt/kody-ide`
- Le binaire est accessible via `kody` dans le PATH
- Les données utilisateur sont dans `~/.kody`
- Les extensions sont dans `~/.kody/extensions`

