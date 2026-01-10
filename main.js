import { CONFIG } from './data/config_v2.js';
import { GameLoop } from './core/GameLoop.js';
import { PixelRenderer } from './render/PixelRenderer.js';
import { InputHandler } from './core/InputHandler.js';
import { PhysicsWorld } from './core/PhysicsWorld.js';
import { MapManager } from './core/MapManager.js';
import { Player } from './entities/Player.js';
import { SPRITE_SLIME_BASE } from './data/library/bodies/slime_base.js';
import { PALETTE_SLIME } from './data/palettes.js';

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
        // Pass player to entity update for AI targeting
        player.update(dt, physics, entities);
        renderer.updateCamera(player);
    }

    // Update Entities
    entities.forEach(e => {
        // Pass player to enemies
        if (e.update.length > 2) {
            e.update(dt, physics, entities, player);
        } else {
            e.update(dt, physics);
        }
    });

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
        // 1. Create Player Instance
        player = new Player(0, 0, input);

        // 2. Load Map (Will update Player Position)
        await mapManager.loadLevel('level_1', physics, player);

        // 3. Equip Visuals
        player.equip('body', SPRITE_SLIME_BASE);

        // 4. Spawn Entities (Clean Gym Mode)
        // No extra items or enemies for physics testing
        // const sword = new Item(150, 200, 'sword');
        // entities.push(sword);

        // const shield = new Item(400, 150, 'shield');
        // entities.push(shield);

        // const sweeper = new GlitchySweeper(350, 250);
        // entities.push(sweeper);

        // const dummy = new DummyEnemy(650, 200);
        // entities.push(dummy);

        // 5. Start Loop
        gameLoop = new GameLoop(update, draw, CONFIG.FPS);
        gameLoop.start();

    } catch (e) {
        console.error('❌ Critical Failure:', e);
    }
}

// Start
startGame();
