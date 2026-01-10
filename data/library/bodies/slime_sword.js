/**
 * Sprite: Slime Sword Form
 * 史萊姆劍型態
 * Grid: 32x24 (Relative)
 */

export const SPRITE_SLIME_SWORD = {
    id: 'slime_sword',
    width: 32,
    height: 32,
    layers: [
        // A Sword sticking out of the head
        // I = Iron, H = Handle

        "................................",
        "................................",
        "..............##................", // Sword Tip
        ".............#II#...............",
        ".............#II#...............",
        ".............#II#...............",
        ".............#II#...............",
        ".............#II#...............",
        "...........#######..............",
        ".........##SSSSSSS##............", // Body Starts
        ".......##SSLLSSSSSSS##..........",
        "......#SSLLSSSSSSSSSSS#.........",
        ".....#SSLLSS#III#SSSSSS#........", // Sword entering body
        "....#SSLLSSSS#H#SSSSSSSS#.......",
        "...#SSLLSSSSSS#H#SSSSSSSS#......", // Handle inside?
        "..#SSSLLSSSSSSSSSSSSSSSSSS#.....",
        "..#SSSSS#######SSS#######S#.....",
        ".#SSSSSS#EEEEE#SSS#EEEEE#SS#....",
        ".#SSSSSS#EEEEE#SSS#EEEEE#SS#....",
        ".#SSSSSS#######SSS#######SS#....",
        ".#SSSSSSSSSSSSSSSSSSSSSSSSS#....",
        ".#SSSSSSSSSSSSSSSSSSSSSSSSS#....",
        ".#SSSSSSSSSSSSSSSSSSSSSSSSS#....",
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
