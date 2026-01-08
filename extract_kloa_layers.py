from PIL import Image
import numpy as np
import os

# Configuration
IMAGE_PATH = r"C:\Users\alan0\.gemini\antigravity\brain\3c2b9b54-61d9-4c84-930a-5687bdd284e6\uploaded_image_1_1767613285881.jpg"
OUTPUT_DIR = r"d:\Vibe Coding專案庫\像素腳色\data\library"

# Color Mappings (Target Key -> RGB/Description)
# We will check pixel distance to these targets
LAYERS = {
    'headwear/kloa_hat.js': {
        'key': 'B',
        'colors': [(40, 50, 100), (20, 30, 60), (60, 70, 140)], # Blue ranges
        'name': 'SPRITE_KLOA_HAT',
        'slot': 'HEADWEAR (10)'
    },
    'neckwear/kloa_scarf.js': {
        'key': 'R',
        'colors': [(255, 100, 50), (180, 60, 20), (230, 80, 40)], # Orange/Red
        'name': 'SPRITE_KLOA_SCARF',
        'slot': 'NECKWEAR (8)'
    },
    'tops/kloa_tunic.js': {
        'key': 'G',
        'colors': [(0, 160, 140), (0, 100, 90), (40, 180, 160)], # Teal/Green
        'name': 'SPRITE_KLOA_TUNIC',
        'slot': 'TOPS (7)'
    },
    'shoes/kloa_boots.js': {
        'key': 'L',
        'colors': [(100, 60, 30), (70, 40, 20), (60, 30, 10)], # Brown
        'name': 'SPRITE_KLOA_BOOTS',
        'slot': 'SHOES (5)'
    },
    'bodies/kloa_base.js': {
        'key': 'S', # Default fallback if not others, but we must distinguish skin vs empty
        'colors': [(235, 200, 180), (200, 160, 130), (30, 30, 40), (10, 10, 20)], # Skin + Hair
        'name': 'SPRITE_KLOA_BASE',
        'slot': 'BODY (2)'
    }
}

def get_closest_layer(r, g, b):
    # Determine which layer this pixel belongs to based on color
    min_dist = 1000
    chosen_layer = None
    chosen_char = ' '

    # Filter out background (Dark Grey #222222 or Black)
    if r < 40 and g < 40 and b < 40:
        return None, ' '
    
    # Check specific layer colors
    for path, data in LAYERS.items():
        if path == 'bodies/kloa_base.js': continue # Check base last
        
        for cr, cg, cb in data['colors']:
            dist = ((r - cr)**2 + (g - cg)**2 + (b - cb)**2) ** 0.5
            if dist < 60: # Threshold
                return path, data['key']

    # If no specific gear matched, default to Base (Skin/Hair) or Outline
    # Skin check
    if (r > 150 and g > 120 and b > 100): return 'bodies/kloa_base.js', 'S'
    # Hair/Outline check (Dark but not background)
    if (r < 60 and g < 60 and b < 80): return 'bodies/kloa_base.js', 'H'
    
    return None, ' '

def process():
    try:
        img = Image.open(IMAGE_PATH).convert('RGB')
        
        # 1. Edge Detection & Cropping (Find the character)
        # Convert to numpy array
        arr = np.array(img)
        # Create mask of non-dark pixels (Background is dark)
        # R,G,B sum > 50 (very loose check) or specific color distance
        mask = np.sum(arr, axis=2) > 100 
        
        # Find BBox
        rows = np.any(mask, axis=1)
        cols = np.any(mask, axis=0)
        
        if not np.any(rows) or not np.any(cols):
            print("No character found!")
            return

        ymin, ymax = np.where(rows)[0][[0, -1]]
        xmin, xmax = np.where(cols)[0][[0, -1]]
        
        # Crop
        img_cropped = img.crop((xmin, ymin, xmax+1, ymax+1))
        
        # 2. Smart Scale to 32x48 (Keep Aspect Ratio)
        target_w, target_h = 32, 48
        w, h = img_cropped.size
        
        # Scale factor - fit to height (leave some margin) or width
        scale = min(target_w / w, (target_h - 2) / h) # -2 for 1px margin top/bottom
        
        new_w = int(w * scale)
        new_h = int(h * scale)
        
        img_resized = img_cropped.resize((new_w, new_h), Image.Resampling.NEAREST)
        
        # Quantize to reduce noise (Optional, but good for flat pixel art)
        img_resized = img_resized.quantize(colors=16).convert('RGB')

        # 3. Paste into center of 32x48
        final_img = Image.new('RGB', (target_w, target_h), (34, 34, 34)) # Dark background
        paste_x = (target_w - new_w) // 2
        paste_y = (target_h - new_h) // 2
        
        final_img.paste(img_resized, (paste_x, paste_y))
        pixels = final_img.load()
        
        print(f"Smart Cropped form {w}x{h} to {new_w}x{new_h}. Centered at {paste_x},{paste_y}")

        # Initialize grids
        grids = {path: [[' ' for _ in range(32)] for _ in range(48)] for path in LAYERS.keys()}
        
        # Fill grids
        for y in range(48):
            for x in range(32):
                r, g, b = pixels[x, y]
                path, char = get_closest_layer(r, g, b)
                
                if path:
                    grids[path][y][x] = char
        
        # Post-Processing: Fill holes (Simple neighbor check)
        # If a pixel is empty but surrounded by Hat, make it Hat.
        # ... (Skipping complex logic for now, reliance on NEAREST should fix most holes)

        # Write files
        for path, grid in grids.items():
            full_path = os.path.join(OUTPUT_DIR, path)
            var_name = LAYERS[path]['name']
            slot_name = LAYERS[path]['slot']
            
            content = f"/**\n * {var_name} (Smart Extracted)\n * Layer: {slot_name}\n */\n\n"
            content += f"export const {var_name} = [\n"
            for row in grid:
                line = "".join(row)
                content += f"    '{line}',\n"
            content += "];\n"
            
            # Ensure dir exists
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"Generated {full_path}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    process()
