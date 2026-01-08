import { Entity } from '../core/Entity.js';

/**
 * Player Class
 * 玩家類別
 */
export class Player extends Entity {
    constructor(x, y, inputHandler) {
        super(x, y);
        this.input = inputHandler;
        this.speed = 40; // Pixels per second / 每秒像素速度

        // 3D/Jump Physics
        this.z = 0;   // Height from ground (0 is ground, negative is up)
        this.vz = 0;  // Vertical velocity
        this.velocity = { x: 0, y: 0 }; // For compatibility with renderer logic
    }

    update(dt, physics) {
        // --- 1. Control Force (Input) ---
        // 輸入控制力
        const ACCEL = 500;
        const FRICTION = 8; // Damping

        let ax = 0;
        let ay = 0;

        // AIMING (Twin Stick)
        const mouse = this.input.getMousePos();
        // Calculate angle relative to center screen (which is where player is, relatively, or need camera offset?)
        // For MVP, assume player is center.
        // Or better, convert player.x to screen coords?
        // Player (x,y) is in Grid Space. Mouse is in Screen Space.
        // ScreenX = (PlayerX * Scale) + OffsetX.
        // But we don't know OffsetX here easily without Camera.
        // Let's simplified: If mouse is on right half of screen, aim right.
        if (mouse.x > window.innerWidth / 2) {
            this.facing = 1; // Right
        } else {
            this.facing = -1; // Left
        }

        // WASD / Arrow Keys
        if (this.input.isKeyDown('ArrowUp') || this.input.isKeyDown('KeyW')) ay -= 1;
        if (this.input.isKeyDown('ArrowDown') || this.input.isKeyDown('KeyS')) ay += 1;
        if (this.input.isKeyDown('ArrowLeft') || this.input.isKeyDown('KeyA')) ax -= 1;
        if (this.input.isKeyDown('ArrowRight') || this.input.isKeyDown('KeyD')) ax += 1;

        // Normalize Acceleration
        if (ax !== 0 || ay !== 0) {
            const len = Math.sqrt(ax * ax + ay * ay);
            ax /= len;
            ay /= len;
        }

        // Apply Acceleration
        this.velocity.x += ax * ACCEL * dt;
        this.velocity.y += ay * ACCEL * dt;

        // --- 2. Apply Friction (Damping) ---
        // 摩擦力
        this.velocity.x -= this.velocity.x * FRICTION * dt;
        this.velocity.y -= this.velocity.y * FRICTION * dt;

        // Stop if too slow (Snap to 0)
        if (Math.abs(this.velocity.x) < 1) this.velocity.x = 0;
        if (Math.abs(this.velocity.y) < 1) this.velocity.y = 0;

        // --- 3. Update Position (Integration) & Collision ---
        // 位置更新與碰撞預判

        // Helper: Swept Collision (prevent tunneling)
        // Perform movement in small steps (e.g. 1/4 of grid size) or grid-walking.
        // For simplicity: Check every tile between start and end.

        const STEP_SIZE = 1; // Check every 1 pixel for precision against 1-pixel walls

        // --- Horizontal Collision ---
        let finalX = this.x;
        const totalDx = this.velocity.x * dt;
        const absDx = Math.abs(totalDx);
        const signDx = Math.sign(totalDx);

        // Move in steps
        let movedX = 0;
        while (movedX < absDx) {
            const step = Math.min(STEP_SIZE, absDx - movedX);
            const tryX = finalX + signDx * step;

            // Check Collision at tryX
            // Use NextX + Offset to define hitbox edge
            // If moving right, check right edge. If left, check left edge.
            // Edge Offset = 8 (Radius)
            const edgeX = tryX + (signDx > 0 ? 8 : -8);

            if (this.checkCollision(edgeX, this.y, physics)) {
                this.velocity.x = 0; // Bonk
                break; // Stop moving
            } else {
                finalX = tryX;
                movedX += step;
            }
        }
        this.x = finalX;

        // --- Vertical Collision ---
        let finalY = this.y;
        const totalDy = this.velocity.y * dt;
        const absDy = Math.abs(totalDy);
        const signDy = Math.sign(totalDy);

        let movedY = 0;
        while (movedY < absDy) {
            const step = Math.min(STEP_SIZE, absDy - movedY);
            const tryY = finalY + signDy * step;

            // Edge Offset = 24? (Height 48). 
            // Pivot is bottom-center (48).
            // Check feet (0 offset from pivot?).
            // If moving down, check feet (0). If moving up, check head (-48).
            const edgeY = tryY + (signDy > 0 ? 0 : -48);

            if (this.checkCollision(this.x, edgeY, physics)) { // Use updated this.x
                this.velocity.y = 0;
                break;
            } else {
                finalY = tryY;
                movedY += step;
            }
        }
        this.y = finalY;

        // --- 4. Z-Axis Physics (Jump) ---
        const GRAVITY = 800;
        const JUMP_FORCE = -200;

        // Apply Gravity to Vz
        this.vz += GRAVITY * dt;

        if (this.input.isKeyDown('Space') && this.z >= 0) {
            this.vz = JUMP_FORCE;
        }

        this.z += this.vz * dt;

        // Ground Collision
        if (this.z > 0) {
            this.z = 0;
            this.vz = 0;
        }
    }

    checkCollision(x, y, physics) {
        if (!physics) return false;

        // MVP: Check Center Bottom point (Feet)
        // Sprite is 32x24 ? No scaling applied here?
        // Coordinate system: Player.x is in "Game Pixels" (32x48 grid space? No, visual space / scale?)
        // Wait, main.js spawns at GRID_WIDTH/2 = 16.
        // So Player.x IS in Grid Space.

        const gx = Math.floor(x);
        const gy = Math.floor(y);

        // Get material
        const mat = physics.get(gx, gy);
        const props = physics.constructor.getProperties(mat);

        // Collide if solid
        return props.type === 'solid';
    }
}
