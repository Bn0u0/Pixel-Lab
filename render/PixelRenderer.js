/**
 * Pixel Renderer
 * 像素渲染器
 * The "Compiler" that turns semantic data into pixels.
 */
import { CONFIG } from '../data/config_v2.js';
import { MATERIALS, PhysicsWorld } from '../core/PhysicsWorld.js';

export class PixelRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            // Auto-create if not found (for safety)
            this.canvas = document.createElement('canvas');
            this.canvas.id = canvasId;
            document.body.appendChild(this.canvas);
        }
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // No alpha for background optimization

        // Configuration
        this.scale = CONFIG.PIXEL_SCALE;
        this.width = CONFIG.GRID_WIDTH;
        this.height = CONFIG.GRID_HEIGHT;

        // Set Canvas Size
        this.canvas.width = this.width * this.scale;
        this.canvas.height = this.height * this.scale;

        // Disable Smoothing (Critical for Pixel Art)
        this.ctx.imageSmoothingEnabled = false;

        // Camera
        this.camera = { x: 0, y: 0 };
    }

    clear() {
        this.ctx.fillStyle = '#111'; // Dark background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateCamera(target) {
        // Simple Center Follow
        const screenW = this.canvas.width / this.scale;
        const screenH = this.canvas.height / this.scale;

        // Target is center of screen
        let camX = target.x - screenW / 2;
        let camY = target.y - screenH / 2;

        // Clamp to World Bounds
        camX = Math.max(0, Math.min(camX, this.width - screenW));
        camY = Math.max(0, Math.min(camY, this.height - screenH));

        this.camera.x = camX;
        this.camera.y = camY;
    }

    renderPhysics(physicsWorld, _time) {
        // const activeChunks = physicsWorld.activeChunks;

        // Only render visible range
        const screenW = this.canvas.width / this.scale;
        const screenH = this.canvas.height / this.scale;

        const startX = Math.floor(this.camera.x);
        const endX = Math.min(this.width, Math.ceil(this.camera.x + screenW));
        const startY = Math.floor(this.camera.y);
        const endY = Math.min(this.height, Math.ceil(this.camera.y + screenH));

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const mat = physicsWorld.get(x, y);
                if (mat !== MATERIALS.AIR) {
                    const props = PhysicsWorld.getProperties(mat);
                    this._drawPixel(x, y, props.color);
                }
            }
        }
    }

    render(entity, palette, time) {
        // Fallback for entities without sprite (e.g., Items)
        if (!entity.sprite) {
            if (entity.color && entity.width && entity.height) {
                const dx = entity.x - this.camera.x;
                const dy = entity.y - this.camera.y;

                // Draw simple rect centered at x, and bottom at y
                const rx = dx - entity.width / 2;
                const ry = dy - entity.height;

                this._drawPixelRect(rx, ry, entity.width, entity.height, entity.color);
            }
            return;
        }

        const dx = entity.x - this.camera.x;
        const dy = entity.y - this.camera.y;

        // 1. Dynamic Injection (Bobbing / Breath)
        // Only if Idle
        // const yOffset = 0;
        let stretchX = 1;
        let stretchY = 1;

        if (Math.abs(entity.velocity.x) < 5 && Math.abs(entity.velocity.y) < 5) {
            // Idle Breathing
            const breath = Math.sin(time * 5); // Speed
            stretchX = 1 + breath * 0.02;
            stretchY = 1 - breath * 0.02;
        }

        // Squash & Stretch state override
        if (entity.squashState) {
            stretchX = entity.squashState.x;
            stretchY = entity.squashState.y;
        }

        // Draw Sprite
        this._drawSprite(entity.sprite, palette, dx, dy, stretchX, stretchY, entity.facing);
    }

    _drawSprite(spriteData, palette, x, y, sx, sy, facing) {
        const cx = x + 16; // Center X (Sprite is 32 wide, so 16 is center)
        const cy = y + 32; // Bottom Y (Sprite is 32 tall, we align bottom)

        // Face Decoupling Keys
        const FACE_KEYS = new Set(['E', 'C']); // Eyes and Core

        const pixels = spriteData.layers;
        const w = spriteData.width;
        const h = spriteData.height;

        for (let r = 0; r < h; r++) {
            for (let c = 0; c < w; c++) {
                const char = pixels[r][c];
                if (char === '.' || char === ' ') continue; // Transparent

                const color = palette[char];
                if (!color) continue;

                // Identify if this is a "Face" pixel (Protected) or "Body" pixel (Squashed)
                const isFace = FACE_KEYS.has(char);

                // Geometry Calculation
                // Original relative pos from top-left (0,0) of sprite grid
                let px = c;
                const py = r;

                // Flip if facing left
                if (facing < 0) {
                    px = w - 1 - c;
                }

                // Pivot is (16, 32) in local sprite coords
                const localX = px - 16;
                const localY = py - 32;

                let finalX, finalY, finalW, finalH;

                if (isFace) {
                    // Face: Position scales with Body (Anchored), but Size stays 1:1
                    // Scale position
                    const scaledX = localX * sx;
                    const scaledY = localY * sy;

                    finalX = cx + scaledX;
                    finalY = cy + scaledY;

                    // Fixed Size (1x1 Grid)
                    finalW = 1;
                    finalH = 1;
                } else {
                    // Body: Full deformation (Position + Size)
                    const scaledX = localX * sx;
                    const scaledY = localY * sy;

                    finalX = cx + scaledX;
                    finalY = cy + scaledY;

                    // Deformed Size
                    finalW = sx;
                    finalH = sy;
                }

                // Draw
                this.ctx.fillStyle = (typeof color === 'number') ? '#' + color.toString(16).padStart(6, '0') : color;

                const globalX = finalX * this.scale;
                const globalY = finalY * this.scale;
                const globalW = finalW * this.scale;
                const globalH = finalH * this.scale;

                // Snap to Grid for crisp edges
                // FIX: Add small epsilon to width/height to prevent sub-pixel gaps (White Flicker)
                this.ctx.fillRect(
                    Math.floor(globalX),
                    Math.floor(globalY),
                    Math.ceil(globalW + 0.5),
                    Math.ceil(globalH + 0.5)
                );
            }
        }
    }

    _drawPixel(x, y, color) {
        if (typeof color === 'number') {
            color = '#' + color.toString(16).padStart(6, '0');
        }

        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            Math.floor(x * this.scale),
            Math.floor(y * this.scale),
            Math.ceil(this.scale),
            Math.ceil(this.scale)
        );
    }

    _drawPixelRect(x, y, w, h, color) {
        if (typeof color === 'number') {
            color = '#' + color.toString(16).padStart(6, '0');
        }
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            Math.floor(x * this.scale),
            Math.floor(y * this.scale),
            Math.ceil(w * this.scale),
            Math.ceil(h * this.scale)
        );
    }
}
