import { CONFIG } from '../data/config_v2.js';

export const MATERIALS = {
    AIR: 0,
    SAND: 1,
    STONE: 2,
    WATER: 3,
    FIRE: 4,
    WOOD: 5,
    SMOKE: 6,
    ACID: 7,
    LAVA: 8,
    STEAM: 9
};

const MATERIAL_PROPS = {
    [MATERIALS.AIR]: { type: 'gas', gravity: false },
    [MATERIALS.SAND]: { type: 'solid', gravity: true, color: 0xFFD700 },
    [MATERIALS.STONE]: { type: 'solid', gravity: false, color: 0x808080 },
    [MATERIALS.WATER]: { type: 'liquid', gravity: true, color: 0x1E90FF },
    [MATERIALS.FIRE]: { type: 'gas', gravity: false, color: 0xFF4500 },
    [MATERIALS.ACID]: { type: 'liquid', gravity: true, color: 0x00FF00 },
    [MATERIALS.WOOD]: { type: 'solid', gravity: false, color: 0x8B4513 },
    // Defaults for others
};

export class PhysicsWorld {
    static MATERIALS = MATERIALS;

    constructor() {
        this.width = CONFIG.GRID_WIDTH;
        this.height = CONFIG.GRID_HEIGHT;
        this.length = this.width * this.height;

        // The main grid: 1 byte per pixel, storing Material ID
        this.grid = new Uint8Array(this.length);

        // Optimization: Chunk Management with Set (Unlimited World Size)
        // 32x48 grid, 16x16 chunks
        this.CHUNK_SIZE = 16;
        this.cols = Math.ceil(this.width / this.CHUNK_SIZE);
        this.rows = Math.ceil(this.height / this.CHUNK_SIZE);

        // Active Chunks Set (Stores Chunk Index: cy * cols + cx)
        this.activeChunks = new Set();

        // Initial state: Activate all chunks
        this.reset();
    }

    reset() {
        this.grid.fill(MATERIALS.AIR);
        this.activeChunks.clear();
        for (let i = 0; i < this.cols * this.rows; i++) {
            this.activeChunks.add(i);
        }
    }

    // Get material ID at (x, y)
    get(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return MATERIALS.AIR; // Border is Void (Air), not Stone
        return this.grid[y * this.width + x];
    }

    // Set material ID at (x, y)
    set(x, y, materialId) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        this.grid[y * this.width + x] = materialId;
        this.wakeChunkAt(x, y);
    }

    // Wake up the chunk containing (x, y) and its neighbors (to be safe)
    wakeChunkAt(x, y) {
        const cx = (x / this.CHUNK_SIZE) | 0;
        const cy = (y / this.CHUNK_SIZE) | 0;
        this.activateChunk(cx, cy);

        // Wake neighbors to ensure seamless flow across boundaries
        this.activateChunk(cx - 1, cy);
        this.activateChunk(cx + 1, cy);
        this.activateChunk(cx, cy - 1);
        this.activateChunk(cx, cy + 1);
    }

    activateChunk(cx, cy) {
        if (cx < 0 || cx >= this.cols || cy < 0 || cy >= this.rows) return;
        const id = cy * this.cols + cx;
        this.activeChunks.add(id);
    }

    isActive(cx, cy) {
        if (cx < 0 || cx >= this.cols || cy < 0 || cy >= this.rows) return false;
        return this.activeChunks.has(cy * this.cols + cx);
    }

    static getProperties(materialId) {
        return MATERIAL_PROPS[materialId] || { type: 'unknown', gravity: false };
    }

    // Main step - Simplified Physics (Static World)
    update(_dt) {
        // No cellular automata update for MVP1.
        // Static terrain is handled by collision checks in Entity.js
        this.activeChunks.clear();
    }
}

