from PIL import Image, ImageDraw
import os

# Configuration
WIDTH = 1024
HEIGHT = 144
OUTPUT_PATH = 'data/levels/level_1.png'

# Colors (R, G, B)
COLOR_AIR = (0, 0, 0)
COLOR_SAND = (255, 255, 0)
COLOR_STONE = (128, 128, 128)
COLOR_START = (0, 0, 255)

def create_level():
    img = Image.new('RGB', (WIDTH, HEIGHT), COLOR_AIR)
    draw = ImageDraw.Draw(img)

    # 1. Floor (Bedrock) - Stone
    # Bottom 10 pixels are solid stone
    draw.rectangle([(0, HEIGHT - 10), (WIDTH, HEIGHT)], fill=COLOR_STONE)

    # 2. Walls (Castle Borders)
    # Left and Right walls
    draw.rectangle([(0, 0), (10, HEIGHT)], fill=COLOR_STONE)
    draw.rectangle([(WIDTH - 10, 0), (WIDTH, HEIGHT)], fill=COLOR_STONE)

    # 3. Platforms (Stone Bricks)
    # Floating platforms for jumping
    platforms = [
        (100, 100, 200, 110),
        (250, 80, 350, 90),
        (400, 60, 500, 70),
        (600, 90, 800, 100) # Long platform
    ]
    for p in platforms:
        draw.rectangle(p, fill=COLOR_STONE)

    # 4. Sand Piles (Debris)
    # Piles of sand on the floor
    draw.polygon([(150, HEIGHT-10), (200, HEIGHT-40), (250, HEIGHT-10)], fill=COLOR_SAND)
    draw.polygon([(650, 90), (700, 70), (750, 90)], fill=COLOR_SAND) # Sand on platform

    # 5. Player Spawn Point
    # Blue dot at spawn location (e.g., left side, above floor)
    # 320 is roughly screen center relative to 0 start? No.
    # Spawn at x=50, y=100 (above floor)
    draw.point((50, 100), fill=COLOR_START)

    # Ensure directory exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    
    img.save(OUTPUT_PATH)
    print(f"Level generated at {OUTPUT_PATH}")

if __name__ == "__main__":
    create_level()
