# Guide d'installation et de test - KODY IDE

## 🧪 Tester KODY IDE (sans installation)

Pour tester rapidement KODY IDE sans installation complète :

```bash
cd /home/raskal/Coding/KODY/vscode
./scripts/test-kody.sh
```

Ce script va :
- Vérifier si VSCode est compilé
- Compiler si nécessaire
- Lancer KODY IDE en mode développement

## 📦 Installation complète sur EndeavourOS

### Étape 1 : Compiler VSCode

```bash
cd /home/raskal/Coding/KODY/vscode

# Installer les dépendances (si pas déjà fait)
npm install

# Compiler
npm run compile

# Créer le package Linux
npm run gulp -- vscode-linux-x64-min
```

**Note** : Cela peut prendre 10-30 minutes selon votre machine.

### Étape 2 : Installer avec le script

```bash
./scripts/KodySetup.sh
```

Le script va :
- ✅ Vérifier les dépendances système
- ✅ Installer KODY dans `/opt/kody-ide`
- ✅ Créer le lien `kody` dans `/usr/local/bin`
- ✅ Ajouter KODY au menu d'applications
- ✅ Installer l'icône

### Étape 3 : Lancer KODY IDE

```bash
kody
```

Ou depuis le menu : **KODY IDE**

## 🔧 Créer un package Arch (.pkg.tar.zst)

Pour créer un package Arch installable :

```bash
./scripts/build-arch-package.sh
```

Puis installer :
```bash
sudo pacman -U .build/arch/kody-ide/kody-ide-0.1.0-1-x86_64.pkg.tar.zst
```

## 📋 Dépendances requises

- `gtk3`
- `libxss`
- `libasound2`
- `nss`
- `libdrm`
- `mesa`
- `libsecret` (pour le stockage des clés API)

Installation :
```bash
sudo pacman -S gtk3 libxss libasound2 nss libdrm mesa libsecret
```

## 🗑️ Désinstallation

```bash
sudo rm -rf /opt/kody-ide
sudo rm /usr/local/bin/kody
sudo rm /usr/share/applications/kody-ide.desktop
sudo rm /usr/share/pixmaps/kody-ide.png
sudo update-desktop-database
```

## 🐛 Dépannage

### Erreur : "code: command not found"
Vérifier que le script d'installation a bien créé le lien :
```bash
ls -l /usr/local/bin/kody
```

### L'icône n'apparaît pas
```bash
sudo gtk-update-icon-cache -f -t /usr/share/icons/hicolor
```

### Problèmes de permissions
```bash
sudo chown -R $USER:$USER /opt/kody-ide
```

## 📝 Notes

- Les données utilisateur sont dans `~/.kody`
- Les extensions sont dans `~/.kody/extensions`
- Les logs sont dans `~/.kody/logs`

