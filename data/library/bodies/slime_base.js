/**
 * Sprite: Slime Base Form
 * 史萊姆基礎型態
 * Grid: 32x24 (Bottom part of 32x48 canvas)
 */

export const SPRITE_SLIME_BASE = {
    id: 'slime_base',
    width: 32,
    height: 32, // Logical height for the sprite array
    // Uses Semantic Keys:
    // . = Transparent
    // # = Outline
    // S = Skin (Body)
    // L = Highlight
    // D = Shadow
    // E = Eye
    // C = Core
    layers: [
        // This is a flattened array or array of strings. 
        // Array of strings is easier to edit manually.
        // We act as "Bottom Aligned" usually, but here we draw from top-left of the 32x32 block.
        // Let's assume this 32x32 block is rendered at the FEET of the entity.

        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "...........#######..............",
        ".........##SSSSSSS##............",
        ".......##SSLLSSSSSSS##..........",
        "......#SSLLSSSSSSSSSSS#.........",
        ".....#SSLLSSSSSSSSSSSSS#........",
        "....#SSLLSSSSSSSSSSSSSSS#.......",
        "...#SSLLSSSSSSSSSSSSSSSSS#......",
        "..#SSSLLSSSSSSSSSSSSSSSSSS#.....",
        "..#SSSSS#######SSS#######S#.....",
        ".#SSSSSS#EEEEE#SSS#EEEEE#SS#....", // Big Eyes
        ".#SSSSSS#EEEEE#SSS#EEEEE#SS#....",
        ".#SSSSSS#######SSS#######SS#....",
        ".#SSSSSSSSSSSSSSSSSSSSSSSSS#....",
        ".#SSSSSSSSSSSSSSSSSSSSSSSSS#....",
        ".#SSSSSSSSSSSSSSSSSSSSSSSSS#....", // Core Removed
        ".#SSSSSSSSSSSSSSSSSSSSSSSSS#....",
        ".#SSSSSSSSSSSSSSSSSSSSSSSSS#....",
        ".#SSSSSSSSSSSSSSSSSSSSSSSSS#....",
        ".#SSSSSSSSSSSSSSSSSSSSSSSSS#....",
        "..#DDDSSSSSSSSSSSSSSSSSSSDD#....",
        "..#DDDDSSSSSSSSSSSSSSSSDDDD#....",
        "...#DDDDDDSSSSSSSSSSDDDDDD#.....",
        "....#DDDDDDDDDDDDDDDDDDDD#......",
        ".....####################.......",
        "................................"
    ]
};
