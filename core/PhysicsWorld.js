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

    // Main step - Cellular Automata Logic
    update(_dt) {
        // Create Next Frame Active Set
        // We iterate currently active chunks. If anything moves, we add to next active set.
        // However, 'activeChunks' is modified during updateSand? 
        // Better: activeChunks accumulates. We verify if a chunk actually had activity?
        // Simplified Logic: 
        // 1. Snapshot current active chunks.
        // 2. Clear current active chunks (or use a 'next' set).
        // 3. Process snapshot. If activity happens, add to 'next'.

        const chunksToProcess = new Set(this.activeChunks);
        this.activeChunks.clear();

        // Iterate Chunks
        // Note: For bottom-up logic, we should sort chunks? 
        // Sand must be processed Bottom-Up globally or locally.
        // If we process chunks in arbitrary order (Set iteration), we might break sand stacking logic at chunk borders.
        // STABLE SOLUTION: Iterate *ALL CHUNKS* in correct order, but skip if not in Set.

        for (let cy = this.rows - 1; cy >= 0; cy--) {
            for (let cx = 0; cx < this.cols; cx++) {
                const id = cy * this.cols + cx;
                if (!chunksToProcess.has(id)) continue;

                // Keeps chunk active for at least one frame if it was active
                // Wait, if no sand moved, it should sleep.
                // But we just cleared activeChunks. 
                // We need to re-add ONLY if we find moving sand or if 'force awake' logic exists.
                // Actually, standard CA optimization:
                // If a cell changes, wake neighbors.
                // So here, we default to sleeping unless updateSand says "I moved".
                // But we must process the chunk to know if it moves?
                // Yes. 

                // Problem: If I don't add it to activeChunks, and nothing moves, it dies. Correct.
                // But what if sand is falling IN from above? The above chunk wakes THIS chunk.

                const startX = cx * this.CHUNK_SIZE;
                const endX = Math.min(startX + this.CHUNK_SIZE, this.width);
                const startY = cy * this.CHUNK_SIZE;
                const endY = Math.min(startY + this.CHUNK_SIZE, this.height);

                let chunkHasActivity = false;

                // Scan this chunk bottom-up
                for (let y = endY - 1; y >= startY; y--) {
                    for (let x = startX; x < endX; x++) {
                        const i = y * this.width + x;
                        const cell = this.grid[i];

                        if (cell === MATERIALS.SAND) {
                            const moved = this.updateSand(x, y, i);
                            if (moved) {
                                chunkHasActivity = true;
                                // updateSand handles waking destination chunk (and neighbors if needed)
                            }
                        }
                    }
                }

                // If invalid/static sand exists, we might falsely sleep? 
                // No, if sand didn't move, it's static.
                // BUT: If sand TRIES to move but is blocked, it's static.
                // Only if it MOVES do we wake.

                // If this chunk had activity, it (and potentially neighbors) should be active next frame.
                // Actually, if sand moved OUT, destination handles wake.
                // If sand moved IN, source handles wake?
                // Does this chunk need to stay awake? 
                // Only if there is still "unsettled" sand? 
                // If sand moved, it is unsettled.
                if (chunkHasActivity) {
                    this.activateChunk(cx, cy);
                }
            }
        }
    }

    updateSand(x, y, i) {
        const ty = y + 1;

        // 1. Bottom Boundary (Stop at bottom of world)
        if (ty >= this.height) {
            return false;
        }

        const below = i + this.width;
        let target = -1;
        let tx = x;

        // 2. Try passing down (Gravity)
        if (this.grid[below] === MATERIALS.AIR || this.grid[below] === MATERIALS.WATER) {
            target = below;
        }
        // 3. Try falling diagonal left
        else {
            // Check Left Boundary (Must exist)
            if (x > 0) {
                const belowLeft = below - 1;
                if (this.grid[belowLeft] === MATERIALS.AIR || this.grid[belowLeft] === MATERIALS.WATER) {
                    target = belowLeft;
                    tx = x - 1;
                }
            }
        }

        // 4. Try falling diagonal right
        if (target === -1) {
            // Check Right Boundary (Must exist)
            if (x < this.width - 1) {
                const belowRight = below + 1;
                if (this.grid[belowRight] === MATERIALS.AIR || this.grid[belowRight] === MATERIALS.WATER) {
                    target = belowRight;
                    tx = x + 1;
                }
            }
        }

        if (target !== -1) {
            // Swap
            this.grid[i] = this.grid[target];
            this.grid[target] = MATERIALS.SAND;

            // Wake up destination info
            this.wakeChunkAt(tx, ty); // Wake destination
            return true;
        }

        return false;
    }
}
