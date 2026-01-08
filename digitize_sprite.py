from PIL import Image
import sys

# Character mapping for brightness/color roughly
CHARS = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@']

def image_to_ascii(image_path):
    try:
        img = Image.open(image_path)
        img = img.resize((32, 48), Image.Resampling.NEAREST)
        pixels = img.load()
        
        print(f"Analyzing {image_path} (32x48)")
        print("-" * 34)

        for y in range(48):
            line = ""
            for x in range(32):
                r, g, b = pixels[x, y][:3] # Ignore alpha for now or handle it
                
                # Simple color detection to map to our keys
                if r < 50 and g < 50 and b < 50: char = ' ' # Black/Dark Background
                elif r > 200 and g > 150 and b > 100: char = 'S' # Skin
                elif r < 60 and g < 70 and b > 100: char = 'B' # Blue Hat
                elif r < 50 and g > 100 and b > 100: char = 'G' # Teal
                elif r > 200 and g > 80 and b < 50: char = 'R' # Orange
                elif r > 200 and g > 200 and b > 200: char = 'W' # White
                else: char = '.' # Unknown
                
                # Check for transparency if png
                if len(pixels[x, y]) > 3 and pixels[x, y][3] < 128:
                    char = ' '

                line += char
            print(f'"{line}", // {y}')
        print("-" * 34)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Use the uploaded image path
    path = r"C:\Users\alan0\.gemini\antigravity\brain\3c2b9b54-61d9-4c84-930a-5687bdd284e6\uploaded_image_1_1767611992889.jpg"
    image_to_ascii(path)
