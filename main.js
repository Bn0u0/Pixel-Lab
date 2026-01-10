import { CONFIG } from './data/config_v2.js';
import { GameLoop } from './core/GameLoop.js';
import { PixelRenderer } from './render/PixelRenderer.js';
import { InputHandler } from './core/InputHandler.js';
import { PhysicsWorld } from './core/PhysicsWorld.js';
import { MapManager } from './core/MapManager.js';
import { Player } from './entities/Player.js';
import { Item } from './entities/Item.js';
import { DummyEnemy } from './entities/DummyEnemy.js';
import { SPRITE_SLIME_BASE } from './data/library/bodies/slime_base.js';
import { PALETTE_SLIME } from './data/palettes.js';
// import { WardrobeUI } from './ui/WardrobeUI.js';
// import { MainMenu } from './ui/MainMenu.js';

// --- System Initialization ---
const renderer = new PixelRenderer('game-world');
const physics = new PhysicsWorld(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
const input = new InputHandler();
const mapManager = new MapManager();

// --- Game State ---
let player;
let entities = [];
let gameLoop;
let globalTime = 0;

// --- Core Logic ---

const update = (dt) => {
    globalTime += dt;
    if (player) {
        player.update(dt, physics, entities);
        renderer.updateCamera(player);
    }

    // Update Entities
    entities.forEach(e => e.update(dt, physics));

    // Cleanup
    entities = entities.filter(e => !e.markedForDeletion);

    physics.update(dt);
};

const draw = () => {
    renderer.clear();

    // 1. Render Background / Physics
    renderer.renderPhysics(physics, globalTime);

    // 2. Render Entities (Items, Enemies)
    entities.forEach(e => renderer.render(e, PALETTE_SLIME, globalTime));

    // 3. Render Player
    if (player) {
        renderer.render(player, PALETTE_SLIME, globalTime);
    }
};

// --- Initialization Sequence ---

async function startGame() {
    try {
        // console.log('🚀 System Init...');

        // 1. Create Player Instance (Temp Position)
        player = new Player(0, 0, input);

        // 2. Load Map (Will update Player Position)
        // console.log('🗺️ Loading Level 1...');
        await mapManager.loadLevel('level_1', physics, player);

        // 3. Equip Visuals
        // console.log('👕 Equipping Gear...');
        player.equip('body', SPRITE_SLIME_BASE);

        // TEST: Spawn Item
        const sword = new Item(player.x + 40, player.y - 50, 'sword');
        entities.push(sword);

        const shield = new Item(player.x - 40, player.y - 50, 'shield');
        entities.push(shield);

        // TEST: Spawn Enemy
        const enemy = new DummyEnemy(player.x + 100, player.y - 50);
        entities.push(enemy);

        // 4. Init In-Game UI
        // new WardrobeUI(player);

        // 5. Show Main Menu & Wait for User
        // console.log('📺 Auto-Starting Engine (UI Skipped)...');
        // new MainMenu('game-container', () => {
        // console.log('✅ Starting Rules Engine...');
        gameLoop = new GameLoop(update, draw, CONFIG.FPS);
        gameLoop.start();
        // });

    } catch (e) {
        // console.error('❌ Critical Failure:', e);
        // Fallback: Draw Error or alert
    }
}

// Start
startGame();
