import os
import re
import sys

# Configuration
TARGET_WIDTH = 32
TARGET_HEIGHT = 48
SEARCH_DIR = os.path.join("data", "library")

def validate_file(filepath):
    """
    Parses a JS file and checks if all exported sprite arrays match 32x48.
    Returns a list of error strings.
    """
    errors = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return [f"Could not read file: {e}"]

    # Find all exported arrays: export const NAME = [ ... ];
    # This regex is a bit loose but works for the strict Constitution format
    matches = re.finditer(r'export const (\w+)\s*=\s*\[([\s\S]*?)\];', content)
    
    found_any = False
    for match in matches:
        found_any = True
        sprite_name = match.group(1)
        body_content = match.group(2)
        
        # Extract rows (strings in quotes)
        # Regex to find content inside "..." or '...'
        row_matches = re.findall(r'["\'](.*?)["\']', body_content)
        
        # Check Height
        if len(row_matches) != TARGET_HEIGHT:
            errors.append(f"{sprite_name}: Height mismatch. Expected {TARGET_HEIGHT}, got {len(row_matches)}.")
            continue
            
        # Check Widths
        for idx, row in enumerate(row_matches):
            if len(row) != TARGET_WIDTH:
                errors.append(f"{sprite_name}: Row {idx} width mismatch. Expected {TARGET_WIDTH}, got {len(row)}.")
    
    # If no sprite block found, maybe warn? But utility files might exist.
    # For now, only validate if we found a sprite pattern.
    return errors

def main():
    print(f"🔍 Validating Assets in {SEARCH_DIR}...")
    
    all_errors = []
    scanned_count = 0
    
    if not os.path.exists(SEARCH_DIR):
        print(f"Warning: Directory {SEARCH_DIR} not found.")
        sys.exit(0)

    for root, dirs, files in os.walk(SEARCH_DIR):
        for file in files:
            if file.endswith(".js"):
                filepath = os.path.join(root, file)
                scanned_count += 1
                file_id = os.path.relpath(filepath, "data")
                
                file_errors = validate_file(filepath)
                for err in file_errors:
                    all_errors.append(f"[{file_id}] {err}")

    if all_errors:
        print(f"❌ Validation FAILED. Found {len(all_errors)} errors:")
        for err in all_errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print(f"✅ All {scanned_count} files passed validation. (Target: {TARGET_WIDTH}x{TARGET_HEIGHT})")
        sys.exit(0)

if __name__ == "__main__":
    main()
