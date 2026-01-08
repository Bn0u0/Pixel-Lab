/**
 * Semantic Palette System
 * 語義化調色盤系統
 * 
 * Maps character keys (S, M, C...) to RGBA values.
 */

// Basic Dark Knight Palette
export const PALETTE_DARK_KNIGHT = {
    // Standard Materials
    '#': [10, 10, 10, 255],    // Outline (Black)
    ' ': [0, 0, 0, 0],         // Transparent

    // Body
    'S': [235, 200, 180, 255], // Skin (Pale)
    's': [200, 160, 130, 255], // Skin Shadow

    // Eyes
    'E': [30, 30, 30, 255],    // Eye Dark
    'p': [255, 255, 255, 255], // Pupil White

    // Cloth (Red/Dark Grey)
    'C': [80, 20, 30, 255],    // Primary Cloth
    'c': [50, 10, 20, 255],    // Cloth Shadow

    // Metal (Silver)
    'M': [180, 190, 200, 255], // Metal Base
    'm': [100, 110, 120, 255], // Metal Shadow

    // Leather (Brown)
    'L': [100, 60, 30, 255],   // Leather
    'l': [70, 40, 20, 255],    // Leather Shadow

    // Forest Hero Extras (Kloa Style)
    'B': [40, 50, 100, 255],   // Blue (Hat) - Primary
    'b': [20, 30, 60, 255],    // Blue Shadow

    'G': [0, 160, 140, 255],   // Green/Teal (Tunic) - Primary
    'g': [0, 100, 90, 255],    // Green Shadow

    'R': [255, 100, 50, 255],  // Red/Orange (Scarf) - Primary
    'r': [180, 60, 20, 255],   // Red Shadow

    'H': [30, 30, 40, 255],    // Hair (Dark/Black)
    'h': [10, 10, 20, 255],    // Hair Shadow
};

export const PALETTE_SLIME = {
    // J: Jelly Body (Blue) - Slightly transparent base
    'J': [66, 174, 255, 200],
    // H: Highlight (Shiny)
    'H': [255, 255, 255, 255],
    // E: Eyes (Black)
    'E': [20, 20, 30, 255],
    // C: Cheek (Blush)
    'C': [255, 150, 150, 200],
    // S: Shadow (Darker Blue)
    'S': [40, 100, 180, 200],
    // 0: Transparent
    ' ': [0, 0, 0, 0]
};
