import { CONFIG } from '../data/config.js';

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
    [MATERIALS.WOOD]: { type: 'solid', gravity: false, color: 0x8B4513 },
    // Defaults for others
};

export class PhysicsWorld {
    constructor() {
        this.width = CONFIG.GRID_WIDTH;
        this.height = CONFIG.GRID_HEIGHT;
        this.length = this.width * this.height;

        // The main grid: 1 byte per pixel, storing Material ID
        this.grid = new Uint8Array(this.length);

        console.log(`PhysicsWorld initialized: ${this.width}x${this.height} (${this.length} cells)`);
    }

    reset() {
        this.grid.fill(MATERIALS.AIR);
    }

    // Get material ID at (x, y)
    get(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return MATERIALS.STONE; // Border is stone
        return this.grid[y * this.width + x];
    }

    // Set material ID at (x, y)
    set(x, y, materialId) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        this.grid[y * this.width + x] = materialId;
    }

    static getProperties(materialId) {
        return MATERIAL_PROPS[materialId] || { type: 'unknown', gravity: false };
    }

    // Main step - to be implemented
    update(dt) {
        // Placeholder for cellular automata logic
    }
}
