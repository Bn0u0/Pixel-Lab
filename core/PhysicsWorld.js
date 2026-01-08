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

        // Optimization: Chunk Bitmask
        // 32x48 grid, 16x16 chunks => 2x3 = 6 chunks.
        // We can store active state in a single integer (bitmask).
        this.CHUNK_SIZE = 16;
        this.cols = Math.ceil(this.width / this.CHUNK_SIZE);
        this.rows = Math.ceil(this.height / this.CHUNK_SIZE);

        // Current frame active mask and Next frame active mask
        this.chunkMask = 0xFFFFFFFF; // Start with all active to settle initial state
        this.nextChunkMask = 0;
    }

    reset() {
        this.grid.fill(MATERIALS.AIR);
        this.chunkMask = 0xFFFFFFFF; // Wake everything
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
        this.wakeChunkAt(x, y);
    }

    // Wake up the chunk containing (x, y) and its neighbors (to be safe)
    wakeChunkAt(x, y) {
        const cx = (x / this.CHUNK_SIZE) | 0;
        const cy = (y / this.CHUNK_SIZE) | 0;
        this.activateChunk(cx, cy);

        // Wake neighbors if on edge (simplified: just wake 3x3 area around it for robustness)
        // For strict optimization, we'd check strict boundaries.
        // For this MVP, waking the specific chunk is primary.
        // If we place sand at bottom of chunk, it moves to next chunk next frame.
        // The update logic will handle propagating wakefulness.
        // But for 'set' (user input), we should ensure the target is awake.
    }

    activateChunk(cx, cy) {
        if (cx < 0 || cx >= this.cols || cy < 0 || cy >= this.rows) return;
        const bit = 1 << (cy * this.cols + cx);
        this.chunkMask |= bit;
        this.nextChunkMask |= bit; // Keep it awake for next frame too
    }

    isActive(cx, cy) {
        if (cx < 0 || cx >= this.cols || cy < 0 || cy >= this.rows) return false;
        return (this.chunkMask & (1 << (cy * this.cols + cx))) !== 0;
    }

    static getProperties(materialId) {
        return MATERIAL_PROPS[materialId] || { type: 'unknown', gravity: false };
    }

    // Main step - Cellular Automata Logic with Bitmasking
    update(dt) {
        this.nextChunkMask = 0; // Reset next frame mask

        // Iterate Chunks
        for (let cy = 0; cy < this.rows; cy++) {
            for (let cx = 0; cx < this.cols; cx++) {
                // Skip if chunk is sleeping
                if (!this.isActive(cx, cy)) continue;

                // Define Chunk Bounds
                const startX = cx * this.CHUNK_SIZE;
                const endX = Math.min(startX + this.CHUNK_SIZE, this.width);
                const startY = cy * this.CHUNK_SIZE;
                const endY = Math.min(startY + this.CHUNK_SIZE, this.height);

                // Update pixels in this chunk
                // Note: We still scan bottom-up, but within chunks or global?
                // Global bottom-up scan is safest for Sand.
                // If we iterate chunks, we must do bottom chunks first.
                // Let's iterate chunks in reverse Y order to maintain bottom-up logic.
            }
        }

        // REFORMATTED LOOP: Iterate pixels, but skip chunks
        // To strictly maintain bottom-up, we iterate chunks bottom-up

        for (let cy = this.rows - 1; cy >= 0; cy--) {
            for (let cx = 0; cx < this.cols; cx++) { // X order matters less
                if (!this.isActive(cx, cy)) continue;

                const startX = cx * this.CHUNK_SIZE;
                const endX = Math.min(startX + this.CHUNK_SIZE, this.width);
                const startY = cy * this.CHUNK_SIZE;
                const endY = Math.min(startY + this.CHUNK_SIZE, this.height);

                // Scan this chunk bottom-up
                for (let y = endY - 1; y >= startY; y--) {
                    for (let x = startX; x < endX; x++) {
                        const i = y * this.width + x;
                        const cell = this.grid[i];

                        if (cell === MATERIALS.SAND) {
                            const moved = this.updateSand(x, y, i);
                            if (moved) {
                                // If moved, keep this chunk active
                                this.activateChunk(cx, cy);
                                // And the chunk we moved INTO (handled in updateSand or implicitly by bounds)
                                // Actually updateSand moves to neighbors. We should ensure they wake up.
                                // For simplicity, updateSand will return 'targetX, targetY' or we just 'wakeChunkAt(n)' inside.
                            }
                        }
                    }
                }
            }
        }

        this.chunkMask = this.nextChunkMask;
    }

    updateSand(x, y, i) {
        if (y >= this.height - 1) return false; // Bottom boundary

        const below = i + this.width;
        let target = -1;
        let tx = x;
        let ty = y + 1;

        // 1. Try passing down (Gravity)
        if (this.grid[below] === MATERIALS.AIR || this.grid[below] === MATERIALS.WATER) {
            target = below;
        }
        // 2. Try falling diagonal left
        else if (x > 0) {
            const belowLeft = below - 1;
            if (this.grid[belowLeft] === MATERIALS.AIR || this.grid[belowLeft] === MATERIALS.WATER) {
                target = belowLeft;
                tx = x - 1;
            }
        }
        // 3. Try falling diagonal right
        if (target === -1 && x < this.width - 1) { // Check right only if not already moved
            const belowRight = below + 1;
            if (this.grid[belowRight] === MATERIALS.AIR || this.grid[belowRight] === MATERIALS.WATER) {
                target = belowRight;
                tx = x + 1;
            }
        }

        if (target !== -1) {
            // Swap
            this.grid[i] = this.grid[target];
            this.grid[target] = MATERIALS.SAND;

            // Wake up destination info
            // Since we moved, we must ensure the destination chunk is active next frame
            // AND the source chunk (since we left a hole that might be filled)
            this.wakeChunkAt(tx, ty); // Wake destination
            // Source is kept awake by the caller using return value
            return true;
        }

        return false;
    }
}
