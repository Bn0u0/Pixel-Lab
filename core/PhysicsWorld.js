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

    // Main step - Cellular Automata Logic
    update(dt) {
        // Simple bottom-up iteration to prevent falling particles from moving multiple times per frame
        // In a real optimized system, we might use double buffering or dirty rects.
        // For Day 1, we use naive scanning from bottom to top.

        for (let y = this.height - 1; y >= 0; y--) {
            for (let x = 0; x < this.width; x++) {
                const i = y * this.width + x;
                const cell = this.grid[i];

                if (cell === MATERIALS.SAND) {
                    this.updateSand(x, y, i);
                }
            }
        }
    }

    updateSand(x, y, i) {
        if (y >= this.height - 1) return; // Bottom boundary

        const below = i + this.width;

        // 1. Try passing down (Gravity)
        if (this.grid[below] === MATERIALS.AIR || this.grid[below] === MATERIALS.WATER) {
            // Swap
            this.grid[i] = this.grid[below];
            this.grid[below] = MATERIALS.SAND;
            return;
        }

        // 2. Try falling diagonal left
        if (x > 0) {
            const belowLeft = below - 1;
            if (this.grid[belowLeft] === MATERIALS.AIR || this.grid[belowLeft] === MATERIALS.WATER) {
                this.grid[i] = this.grid[belowLeft];
                this.grid[belowLeft] = MATERIALS.SAND;
                return;
            }
        }

        // 3. Try falling diagonal right
        if (x < this.width - 1) {
            const belowRight = below + 1;
            if (this.grid[belowRight] === MATERIALS.AIR || this.grid[belowRight] === MATERIALS.WATER) {
                this.grid[i] = this.grid[belowRight];
                this.grid[belowRight] = MATERIALS.SAND;
                return;
            }
        }
    }
}
