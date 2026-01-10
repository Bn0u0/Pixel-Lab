/**
 * Sprite: Slime Shield Form
 * 史萊姆盾型態
 */

export const SPRITE_SLIME_SHIELD = {
    id: 'slime_shield',
    width: 32,
    height: 32,
    layers: [
        // Holding a shield in front
        // H = Wood, I = Iron Rim

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
        ".#SSSSSS#EEEEE#SSS#EEEEE#SS#....",
        ".#SSSSSS#EEEEE#SSS#EEEEE#SS#....",
        ".#SSSSSS#######SSS#######SS#....",
        ".#SSSSSSSSSSSSSSSSSSSSSSSSS#....",
        ".#SSSSSSSSSSSSSSSSSSSSSSSSS#....",
        ".#SSSSSSSSSSSSSSSSSSSSSSSSS#....",
        ".#SSSSSSSS##IIIII##SSSSSSSS#....", // Shield Top
        ".#SSSSSSSS#HIIIIIH#SSSSSSSS#....",
        ".#SSSSSSSS#HHIIIHH#SSSSSSSS#....", // Shield Body
        ".#SSSSSSSS#HHHOHHH#SSSSSSSS#....", // O is Gold? (G)
        "..#DDDSSSS#HHHHHHH#SSSSSSDD#....",
        "..#DDDDSSS#HHHHHHH#SSSSDDDD#....",
        "...#DDDDDD##HHHHH##SDDDDDD#.....", // Shield Bottom
        "....#DDDDDD##HHH##DDDDDDD#......",
        ".....####################.......",
        "................................"
    ]
};
