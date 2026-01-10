from PIL import Image, ImageDraw
import os

# Configuration
WIDTH = 1024
HEIGHT = 360
OUTPUT_PATH = 'data/levels/level_1.png'

# Colors (R, G, B)
COLOR_AIR = (0, 0, 0)
COLOR_SAND = (255, 255, 0)
COLOR_STONE = (128, 128, 128)
COLOR_START = (0, 0, 255)
COLOR_WATER = (30, 144, 255)

def create_level():
    img = Image.new('RGB', (WIDTH, HEIGHT), COLOR_AIR)
    draw = ImageDraw.Draw(img)

    # 1. Floor (Bedrock) - Stone
    # Bottom 32 pixels are solid stone
    draw.rectangle([(0, HEIGHT - 32), (WIDTH, HEIGHT)], fill=COLOR_STONE)

    # 2. Walls (Castle Borders)
    draw.rectangle([(0, 0), (32, HEIGHT)], fill=COLOR_STONE)
    draw.rectangle([(WIDTH - 32, 0), (WIDTH, HEIGHT)], fill=COLOR_STONE)

    # 3. Platforms (Stone Bricks)
    # Layer 1 (Low)
    draw.rectangle([(100, HEIGHT - 80), (250, HEIGHT - 70)], fill=COLOR_STONE)
    draw.rectangle([(300, HEIGHT - 120), (450, HEIGHT - 110)], fill=COLOR_STONE)
    
    # Layer 2 (Mid)
    draw.rectangle([(50, HEIGHT - 180), (200, HEIGHT - 170)], fill=COLOR_STONE)
    draw.rectangle([(500, HEIGHT - 180), (800, HEIGHT - 170)], fill=COLOR_STONE) # Long platform

    # Layer 3 (High)
    draw.rectangle([(200, HEIGHT - 250), (350, HEIGHT - 240)], fill=COLOR_STONE)

    # 4. Sand Piles (Debris)
    draw.polygon([(150, HEIGHT-32), (200, HEIGHT-60), (250, HEIGHT-32)], fill=COLOR_SAND)
    draw.polygon([(650, HEIGHT - 170), (700, HEIGHT - 190), (750, HEIGHT - 170)], fill=COLOR_SAND) # Sand on mid platform

    # 5. Player Spawn Point (Blue Dot)
    # Spawn above the ground, left side
    draw.point((100, HEIGHT - 100), fill=COLOR_START)

    # 6. Water Tank (Test Fluid)
    # A tank on the right side
    draw.rectangle([(850, HEIGHT - 100), (950, HEIGHT - 32)], fill=COLOR_STONE) # Tank Walls (Solid block for now, need hollow to hold water? PhysicsWorld handles simple pixels)
    # Let's just draw a block of water floating for test
    draw.rectangle([(800, HEIGHT - 200), (832, HEIGHT - 180)], fill=COLOR_WATER)

    # Ensure directory exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    # 7. Save
    img.save(OUTPUT_PATH)
    print(f"Level generated at {OUTPUT_PATH}")

if __name__ == "__main__":
    create_level()
