#!/usr/bin/env python3
"""
Script pour générer les logos KODY à différentes tailles
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_k_logo(size, output_path):
    """Crée un logo avec la lettre K"""
    # Créer une image avec fond dégradé
    img = Image.new('RGB', (size, size), color='#6366f1')
    draw = ImageDraw.Draw(img)
    
    # Dessiner un fond avec dégradé simple (carré arrondi)
    corner_radius = int(size * 0.1875)  # 15% du size pour arrondi
    draw.rounded_rectangle([(0, 0), (size, size)], radius=corner_radius, fill='#6366f1')
    
    # Dessiner la lettre K
    try:
        # Essayer d'utiliser une police système
        font_size = int(size * 0.625)  # 62.5% du size
        font = ImageFont.truetype("/usr/share/fonts/TTF/DejaVuSans-Bold.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            # Police par défaut si aucune n'est trouvée
            font = ImageFont.load_default()
    
    # Positionner le K au centre
    text = "K"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - bbox[1]
    
    # Dessiner le K en blanc
    draw.text((x, y), text, fill='white', font=font)
    
    # Sauvegarder
    img.save(output_path, 'PNG')
    print(f"✅ Logo créé: {output_path} ({size}x{size})")

if __name__ == "__main__":
    sizes = [70, 150, 192, 512]
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    for size in sizes:
        output_path = os.path.join(base_dir, f"kody_{size}x{size}.png")
        create_k_logo(size, output_path)
    
    print("\n✅ Tous les logos ont été générés !")

