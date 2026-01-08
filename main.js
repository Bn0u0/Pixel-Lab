import { CONFIG } from './data/config.js';
import { GameLoop } from './core/GameLoop.js';
import { PixelRenderer } from './render/PixelRenderer.js';
import { InputHandler } from './core/InputHandler.js';
import { PhysicsWorld } from './core/PhysicsWorld.js';

import { SPRITE_SLIME_BASE } from './data/library/bodies/slime_base.js';
// import { SPRITE_HUMAN_BASE } from './data/library/bodies/human_base.js';
// import { SPRITE_PANTS_BASIC } from './data/library/bottoms/pants_basic.js';
import { PALETTE_DARK_KNIGHT, PALETTE_SLIME } from './data/palettes.js';
import { Player } from './entities/Player.js';
import { WardrobeUI } from './ui/WardrobeUI.js';

console.log('Project Initialized');
console.log(`Pixel Scale: ${CONFIG.PIXEL_SCALE}`);

let gameLoop;
let renderer;
let input;
let player;
let wardrobe;
let physics;
let globalTime = 0;

window.onload = () => {
    try {
        // Initialize Renderer
        // 初始化渲染器
        renderer = new PixelRenderer('game-world');

        // Initialize Physics (Day 1 Core)
        // 初始化物理引擎
        physics = new PhysicsWorld();

        // Initialize Input
        // 初始化輸入
        input = new InputHandler();

        // Initialize Player
        // 初始化玩家
        const startX = (window.innerWidth / CONFIG.PIXEL_SCALE / 2) - 16;
        const startY = (window.innerHeight / CONFIG.PIXEL_SCALE / 2) - 24;
        player = new Player(startX, startY, input);

        // Equip Starting Gear (Base + Pants for decency)
        // 裝備初始裝備
        player.equip('body', SPRITE_SLIME_BASE);
        // player.equip('bottoms', SPRITE_PANTS_BASIC); // Slimes don't wear pants... yet

        // Initialize UI
        // 初始化介面
        wardrobe = new WardrobeUI(player);

        // Initialize Game Loop
        // 初始化遊戲迴圈
        gameLoop = new GameLoop(
            (dt) => update(dt),
            () => draw()
        );

        gameLoop.start();

    } catch (e) {
        console.error('Initialization Failed:', e);
    }
};

function update(dt) {
    globalTime += dt;

    if (player) {
        player.update(dt);
    }

    if (physics) {
        physics.update(dt);
    }
}

function draw() {
    if (renderer && player) {
        renderer.render(player, PALETTE_SLIME, globalTime);
    }
}
