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

        // Static Background Buffer
        this.bgCanvas = document.createElement('canvas');
        this.bgCanvas.width = this.canvas.width;
        this.bgCanvas.height = this.canvas.height;
        this.bgCtx = this.bgCanvas.getContext('2d', { alpha: false });
        this.bgCtx.imageSmoothingEnabled = false;

        this.bgDirty = true; // Flag to trigger redraw

        // Camera
        this.camera = { x: 0, y: 0 };
    }

    clear() {
        // Clear logic handled by background overwrite usually
        // But for entities, we need to clear?
        // Actually, if we draw BG over everything, we don't need clear().
        // But let's keep it safe.
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
        // 1. Check if we need to bake the static layer
        if (this.bgDirty) {
            this._renderStaticLayer(physicsWorld);
            this.bgDirty = false;
        }

        // 2. Draw the cached background (Cropped by Camera)
        // Source: bgCanvas (Full Resolution)
        // Camera X/Y are in World Logic Units (e.g. 0-1024)
        // bgCanvas pixels are Scaled (e.g. 0-6144)

        const sx = this.camera.x * this.scale;
        const sy = this.camera.y * this.scale;
        const sWidth = this.canvas.width;
        const sHeight = this.canvas.height;

        this.ctx.drawImage(
            this.bgCanvas,
            sx, sy, sWidth, sHeight, // Source Rect
            0, 0, this.canvas.width, this.canvas.height // Dest Rect
        );
    }

    _renderStaticLayer(physicsWorld) {
        // console.log('Baking Static Background Layer...');
        // Fill Background
        this.bgCtx.fillStyle = '#111';
        this.bgCtx.fillRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);

        // Iterate entire world grid
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const mat = physicsWorld.get(x, y);
                if (mat !== MATERIALS.AIR) {
                    const props = PhysicsWorld.getProperties(mat);
                    let color = props.color;
                    if (typeof color === 'number') {
                        color = '#' + color.toString(16).padStart(6, '0');
                    }
                    this.bgCtx.fillStyle = color;
                    this.bgCtx.fillRect(
                        Math.floor(x * this.scale),
                        Math.floor(y * this.scale),
                        Math.ceil(this.scale),
                        Math.ceil(this.scale)
                    );
                }
            }
        }
        // console.log('Baking Complete.');
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
        const cx = x; // Center X (Matches Entity.x)
        const cy = y; // Bottom Y (Matches Entity.y)

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
