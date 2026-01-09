import { CONFIG } from '../data/config_v2.js';
import { SpriteCompositor } from './SpriteCompositor.js';

export class PixelRenderer {
    constructor(canvasId) {

        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element with ID '${canvasId}' not found.`);
        }
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.compositor = new SpriteCompositor();

        // Cache for composed sprites to improve performance (optional optimization for later)
        // 精靈快取 (後續可優化)

        this.init();
    }

    init() {
        this.ctx.imageSmoothingEnabled = false;

        // Initialize Scale from Config
        this.scale = CONFIG.PIXEL_SCALE;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Zoom Handler
        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.001;
            // Negative deltaY is zoom in (scroll up)
            this.scale -= e.deltaY * zoomSpeed * this.scale;

            // Clamp Scale (Min 1x, Max 20x)
            this.scale = Math.max(1, Math.min(this.scale, 20));
        }, { passive: false });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.imageSmoothingEnabled = false;

        // Removed fixed offset. We will calculate dynamic Camera Offset in render()
        this.cameraX = 0;
        this.cameraY = 0;

        // this.clear(); // Main loop handles clear
    }

    updateCamera(entity) {
        if (!entity) return;
        const scale = this.scale; // Use dynamic scale

        // Goal: Keep entity in center of screen
        const screenCX = this.canvas.width / 2;
        const screenCY = this.canvas.height / 2;

        // Target Camera Position (Entity World Pos * Scale) - Screen Center
        // We want Camera * Scale to be the offset.
        // Actually simplest is: Camera is top-left of Viewport in scaled pixels.
        // Player is at PlayerX, PlayerY.
        // We want (PlayerX * Scale - CameraX) = ScreenWidth/2
        // So CameraX = PlayerX * Scale - ScreenWidth/2

        const targetCamX = (entity.x * scale) - screenCX;
        const targetCamY = (entity.y * scale) - screenCY;

        // Smooth Camera (Lerp)
        const lerp = 0.1;
        this.cameraX += (targetCamX - this.cameraX) * lerp;
        this.cameraY += (targetCamY - this.cameraY) * lerp;

        // Clamp
        const maxCamX = (CONFIG.GRID_WIDTH * scale) - this.canvas.width;
        const maxCamY = (CONFIG.GRID_HEIGHT * scale) - this.canvas.height;

        if (maxCamX < 0) { // Center if world smaller than screen
            this.cameraX = (CONFIG.GRID_WIDTH * scale - this.canvas.width) / 2;
        } else {
            this.cameraX = Math.max(0, Math.min(this.cameraX, maxCamX));
        }

        if (maxCamY < 0) {
            this.cameraY = (CONFIG.GRID_HEIGHT * scale - this.canvas.height) / 2;
        } else {
            this.cameraY = Math.max(0, Math.min(this.cameraY, maxCamY));
        }
    }

    clear() {
        this.ctx.fillStyle = '#1a1a1a'; // Dark background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Main Render Method
     * 主要渲染方法
     * @param {Object} entity - The entity to focus camera on (Player)
     * @param {Object} palette - The palette to use
     * @param {number} time - Global time for shaders
     */
    render(entity, palette, time) {
        this.ctx.save();

        const scale = this.scale; // Use dynamic scale

        // Apply Camera Transform (Float for smooth movement)
        // 移除 Math.floor 以獲得更平滑的運鏡 (Sub-pixel camera)
        this.ctx.translate(-this.cameraX, -this.cameraY);
        this.ctx.scale(scale, scale);

        // 1. Compose Sprite
        const composedSprite = this.compositor.compose(entity.equipment);

        // 2. Clear & Draw to Offscreen Buffer (Sprite Buffer)
        if (!this.spriteBuffer || this.spriteBuffer.width !== CONFIG.GRID_WIDTH) {
            this.spriteBuffer = document.createElement('canvas');
            this.spriteBuffer.width = CONFIG.GRID_WIDTH;
            this.spriteBuffer.height = CONFIG.GRID_HEIGHT;
            this.spriteCtx = this.spriteBuffer.getContext('2d');
        }
        this.spriteCtx.clearRect(0, 0, CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);

        // Draw Pixels to Buffer
        for (let y = 0; y < composedSprite.length; y++) {
            const row = composedSprite[y];
            if (!row) continue;
            for (let x = 0; x < row.length; x++) {
                const char = row[x];
                if (char === ' ' || char === '.') continue;

                let color = palette[char] || '#ff00ff';

                if (char === 'M') {
                    if ((x + y + time * 10) % 20 > 18) color = '#ffffff';
                }

                if (color && !this._isTransparent(color)) {
                    this.spriteCtx.fillStyle = this._rgbaToCss(color);
                    this.spriteCtx.fillRect(x, y, 1, 1);
                }
            }
        }

        // 3. Apply Transforms to Main Canvas (Squash/Stretch/Pos/Jump)
        // 套用變形 (擠壓/位置/跳躍)

        // Calculate Position
        // Visual Anchor Correction: Player.y is Feet. Canvas draws from Top-Left.
        // Sprite Height is approx 48.

        // Fix: Only bob when idle (low velocity)
        // 修正：只有在靜止時呼吸擺動
        const vy = entity.velocity ? entity.velocity.y : 0;
        const bobOffset = (Math.abs(vy) < 10) ? Math.sin(time * 5) * 1 : 0;

        const drawX = Math.floor(entity.x - 16); // Center X (16) to Left X
        const drawY = Math.floor(entity.y - 48 + bobOffset); // Feet Y to Top Y

        // Draw Buffer to Main Canvas with Transform
        const pivotX = drawX + 16;
        const pivotY = drawY + 48;

        this.ctx.translate(pivotX, pivotY);

        // Use Entity Scale (controlled by Player.js)
        if (entity.scale) {
            this.ctx.scale(entity.scale.x, entity.scale.y);
        }

        this.ctx.translate(-pivotX, -pivotY);

        this.ctx.drawImage(this.spriteBuffer, drawX, drawY);

        this.ctx.restore();
    }

    // ... (previous methods)

    // --- Day 1: Physics Rendering ---
    // 物理渲染
    renderPhysics(physics, _time) {
        // 使用獨立的物理緩衝區 (Physics Buffer)
        if (!this.physicsBuffer) {
            this.physicsBuffer = document.createElement('canvas');
            this.physicsBuffer.width = CONFIG.GRID_WIDTH;
            this.physicsBuffer.height = CONFIG.GRID_HEIGHT;
            this.physicsCtx = this.physicsBuffer.getContext('2d', { willReadFrequently: true });
        }

        // Clear Physics Buffer specifically!
        this.physicsCtx.clearRect(0, 0, physics.width, physics.height);

        // 1. Get ImageData (Low-level pixel manipulation for speed)
        // 使用 ImageData 直接操作像素以提升效能
        const imageData = this.physicsCtx.getImageData(0, 0, physics.width, physics.height);
        const data = imageData.data;

        for (let i = 0; i < physics.length; i++) {
            const materialId = physics.grid[i];

            // Skip AIR (0) - Transparent
            if (materialId === 0) continue;

            // Get Props
            // 獲取材質屬性
            const props = physics.constructor.getProperties(materialId); // Access static method

            let color = props.color;

            // Reverse Violence: Undefined Color -> Magic Pink
            // 反向暴力驗收：未定義顏色 -> 洋紅色
            if (color === undefined) {
                color = 0xFF00FF; // Magenta
            }

            // Convert Hex (0xRRGGBB) to R, G, B
            // 位元運算提取 RGB
            const r = (color >> 16) & 0xFF;
            const g = (color >> 8) & 0xFF;
            const b = color & 0xFF;

            const idx = i * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = 255; // Alpha
        }

        // 2. Put back to buffer
        this.physicsCtx.putImageData(imageData, 0, 0);

        // 3. Draw Buffer to Main Canvas (Scaled)
        // 繪製到主畫布
        this.ctx.imageSmoothingEnabled = false; // Ensure crisp edges (Task 109)
        const scale = this.scale; // Use dynamic scale

        // Apply Camera (Inverse)
        const camX = Math.floor(this.cameraX || 0); // Use stored camera pos from render()
        const camY = Math.floor(this.cameraY || 0);

        // We need to draw the physics world relative to the camera
        // render() sets the context to (Scale, Scale) AND Translate(-Cam).
        // But renderPhysics is called BEFORE render() in main.js

        // Wait, main.js calls:
        // 1. renderPhysics
        // 2. render(player)

        // If renderPhysics is dealing with Context directly, it needs to apply the same Camera.
        // BUT, 'this.cameraX' is updated in 'render(entity)'.
        // So Physics will lag one frame or use old camera? 
        // Better: Update Camera in a separate 'updateCamera(entity)' method called before both?

        // For now, let's just use the current cameraX/Y (which might be 0 on frame 1).

        this.ctx.save();
        this.ctx.translate(-camX, -camY);
        this.ctx.scale(scale, scale);

        this.ctx.drawImage(
            this.physicsBuffer,
            0, 0, physics.width, physics.height,
            0, 0, physics.width, physics.height // 1:1 in Scaled Space
        );

        this.ctx.restore();
    }

    _isTransparent(color) {
        if (Array.isArray(color)) {
            return color[3] === 0;
        }
        return false;
    }

    _rgbaToCss(color) {
        if (Array.isArray(color)) {
            return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`;
        }
        return color;
    }
}
