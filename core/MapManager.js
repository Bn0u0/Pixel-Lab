/**
 * Map Manager
 * 地圖管理器
 * Handles loading level images and populating the physics grid.
 */
import { MATERIALS } from './PhysicsWorld.js';

export class MapManager {
    constructor() {
        this.levelData = null;
    }

    /**
     * Load a level from an image file
     * 從圖片讀取關卡
     * @param {string} levelId - 'level_1'
     * @param {PhysicsWorld} physics - Reference to physics world
     * @param {Player} player - Reference to player (to set spawn pos)
     * @returns {Promise<void>}
     */
    async loadLevel(levelId, physics, player) {
        const src = `./data/levels/${levelId}.png`;

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this._parseMap(img, physics, player);
                resolve();
            };
            img.onerror = (e) => {
                console.error(`Failed to load level: ${src}`, e);
                reject(e);
            };
            img.src = src;
        });
    }

    _parseMap(img, physics, player) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        const width = img.width;
        const height = img.height;

        // Ensure physics world matches map size or config
        // Assuming Config GRID_WIDTH/HEIGHT matches image for now
        // Or we might need to resize physics grid?
        // physics.resize(width, height); // Future feature

        // Clear Grid
        physics.grid.fill(MATERIALS.AIR || 0);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                // const a = data[idx + 3];

                const gridIndex = y * width + x;

                // Color Mapping
                // 1. Yellow (255, 255, 0) -> SAND
                if (r === 255 && g === 255 && b === 0) {
                    physics.set(x, y, MATERIALS.SAND);
                }
                // 2. Grey (128, 128, 128) -> STONE
                else if (r === 128 && g === 128 && b === 128) {
                    physics.set(x, y, MATERIALS.STONE);
                }
                // 3. Blue (0, 0, 255) -> PLAYER START
                else if (r === 0 && g === 0 && b === 255) {
                    if (player) {
                        player.x = x;
                        player.y = y;
                        player.velocity = { x: 0, y: 0 };
                    }
                    physics.set(x, y, MATERIALS.AIR); // Clear spawn point
                }
                // 4. Dodger Blue (30, 144, 255) -> WATER
                else if (r === 30 && g === 144 && b === 255) {
                    physics.set(x, y, MATERIALS.WATER);
                }
                // Default: AIR
            }
        }

        console.log(`Level ${img.src} loaded. Size: ${width}x${height}`);
    }
}
