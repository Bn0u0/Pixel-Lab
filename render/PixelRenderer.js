import { CONFIG } from '../data/config.js';
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
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.imageSmoothingEnabled = false;
        this.clear();
    }

    clear() {
        this.ctx.fillStyle = '#1a1a1a'; // Dark background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Main Render Method
     * 主要渲染方法
     * @param {Object} entity - The entity to render (must have 'equipment' and 'pos')
     * @param {Object} palette - The palette to use
     * @param {number} time - Global time for shaders
     */
    render(entity, palette, time) {
        this.clear();

        this.ctx.save();
        const scale = CONFIG.PIXEL_SCALE;
        this.ctx.scale(scale, scale);

        // 1. Compose Sprite
        const composedSprite = this.compositor.compose(entity.equipment);

        // 2. Clear & Draw to Offscreen Buffer (32x48)
        // 清除並繪製到離屏緩衝區
        if (!this.bufferCanvas) {
            this.bufferCanvas = document.createElement('canvas');
            this.bufferCanvas.width = CONFIG.GRID_WIDTH;
            this.bufferCanvas.height = CONFIG.GRID_HEIGHT;
            this.bufferCtx = this.bufferCanvas.getContext('2d');
        }
        this.bufferCtx.clearRect(0, 0, CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);

        // Draw Pixels to Buffer
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            const row = composedSprite[y];
            if (!row) continue;
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                const char = row[x];
                if (char === ' ' || char === '.') continue;

                let color = palette[char] || '#ff00ff';

                // --- Material Shaders (Simplified for Buffer) ---
                if (char === 'M') { // Metal Scanline
                    if ((x + y + time * 10) % 20 > 18) color = '#ffffff';
                }
                if (char === 'J') { // Jelly Wobble (Internal color logic only)
                    // We can't do vertex wobble here easily without distorting the pixel grid.
                    // But we CAN do outline highlights.
                }

                if (color && !this._isTransparent(color)) {
                    this.bufferCtx.fillStyle = this._rgbaToCss(color);
                    this.bufferCtx.fillRect(x, y, 1, 1);
                }
            }
        }

        // 3. Apply Transforms to Main Canvas (Squash/Stretch/Pos/Jump)
        // 套用變形 (擠壓/位置/跳躍)

        // Calculate Position
        const bounceHeight = entity.z || 0; // Use Z from player for height
        const bobOffset = Math.sin(time * 5) * 1;

        const drawX = Math.floor(entity.x);
        const drawY = Math.floor(entity.y + bobOffset + bounceHeight); // Add Z to Y offset

        // Calculate Stretch based on Velocity (use entity.velocity.y which logic maps to vz)
        let stretch = 1.0;
        let vy = entity.velocity ? entity.velocity.y : 0;

        if (Math.abs(vy) > 10) { // Threshold for movement stretch
            // 垂直移動時拉長 (Velocity is usually high, e.g. -200 to +200)
            // Normalize: 200 => 0.2 stretch factor
            stretch = 1.0 + Math.min(Math.abs(vy) * 0.001, 0.3); // Cap at 1.3x

            // Invert stretch direction if falling? 
            // Usually falling is also stretched (speed lines).
            // Landing (sudden stop) is squash.
        } else {
            // Idle breathing
            stretch = 1.0 + Math.sin(time * 8) * 0.05;
        }

        const squash = 1.0 / stretch;

        // Draw Buffer to Main Canvas with Transform
        const pivotX = drawX + 16;
        const pivotY = drawY + 48;

        this.ctx.translate(pivotX, pivotY);
        this.ctx.scale(squash, stretch);
        this.ctx.translate(-pivotX, -pivotY);

        this.ctx.drawImage(this.bufferCanvas, drawX, drawY);

        this.ctx.restore();
    }

    // ... (previous methods)

    // --- Day 1: Physics Rendering ---
    // 物理渲染
    renderPhysics(physics, time) {
        if (!this.bufferCanvas) {
            this.bufferCanvas = document.createElement('canvas');
            this.bufferCanvas.width = CONFIG.GRID_WIDTH;
            this.bufferCanvas.height = CONFIG.GRID_HEIGHT;
            this.bufferCtx = this.bufferCanvas.getContext('2d');
        }

        // 1. Get ImageData (Low-level pixel manipulation for speed)
        // 使用 ImageData 直接操作像素以提升效能
        const imageData = this.bufferCtx.getImageData(0, 0, physics.width, physics.height);
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
        this.bufferCtx.putImageData(imageData, 0, 0);

        // 3. Draw Buffer to Main Canvas (Scaled)
        // 繪製到主畫布
        this.ctx.imageSmoothingEnabled = false; // Ensure crisp edges (Task 109)
        const scale = CONFIG.PIXEL_SCALE;

        // Center the grid on screen
        const drawX = (this.canvas.width - physics.width * scale) / 2;
        const drawY = (this.canvas.height - physics.height * scale) / 2;

        this.ctx.drawImage(
            this.bufferCanvas,
            0, 0, physics.width, physics.height,
            drawX, drawY, physics.width * scale, physics.height * scale
        );

        // Draw debug border
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(drawX, drawY, physics.width * scale, physics.height * scale);
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
