from PIL import Image, ImageDraw
import os
import random

# Configuration
WIDTH = 1024
HEIGHT = 360
OUTPUT_PATH = 'data/levels/level_1.png'

# Colors (R, G, B)
COLOR_AIR = (0, 0, 0)
COLOR_START = (0, 0, 255)       # Blue Pixel (Player Spawn)
COLOR_SOLID = (128, 128, 128)   # Grey (Main Ground)
COLOR_ACID = (0, 255, 0)        # Green (Toxic Hazard)

def create_level():
    img = Image.new('RGB', (WIDTH, HEIGHT), COLOR_AIR)
    draw = ImageDraw.Draw(img)
    
    # -- Physics Test Gym --
    # Simple geometry to verify Wall, Floor, and Corner collisions.
    
    # 1. Main Floor (Solid Grey)
    # y=300 to 360
    draw.rectangle([(0, HEIGHT-60), (WIDTH, HEIGHT)], fill=COLOR_SOLID)

    # 2. Left Wall (Tall)
    draw.rectangle([(0, HEIGHT-200), (32, HEIGHT)], fill=COLOR_SOLID)

    # 3. Right Wall (Tall)
    draw.rectangle([(WIDTH-32, HEIGHT-200), (WIDTH, HEIGHT)], fill=COLOR_SOLID)

    # 4. Testing Steps (For Multi-Point Check)
    # Step A (Height 16px - Knee height)
    draw.rectangle([(200, HEIGHT-76), (300, HEIGHT-60)], fill=COLOR_SOLID)
    
    # Step B (Height 32px - Waist height)
    draw.rectangle([(300, HEIGHT-92), (400, HEIGHT-60)], fill=COLOR_SOLID)

    # Step C (Floating Block - For Head Collision)
    draw.rectangle([(500, HEIGHT-150), (600, HEIGHT-120)], fill=COLOR_SOLID)

    # Spawn Point (Safe on ground)
    draw.point((100, HEIGHT-100), fill=COLOR_START)

    # Ensure directory exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    img.save(OUTPUT_PATH)
    print(f"Physics Test Gym generated at {OUTPUT_PATH}")

if __name__ == "__main__":
    create_level()
