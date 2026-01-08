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

    update(dt) {
        // Movement Logic
        // 移動邏輯
        let dx = 0;
        let dy = 0;

        // Arrow Keys or WASD for Horizontal Movement
        if (this.input.isKeyDown('ArrowUp') || this.input.isKeyDown('KeyW')) {
            dy -= 1;
        }
        if (this.input.isKeyDown('ArrowDown') || this.input.isKeyDown('KeyS')) {
            dy += 1;
        }
        if (this.input.isKeyDown('ArrowLeft') || this.input.isKeyDown('KeyA')) {
            dx -= 1;
        }
        if (this.input.isKeyDown('ArrowRight') || this.input.isKeyDown('KeyD')) {
            dx += 1;
        }

        // Normalize vector if moving diagonally
        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
            this.x += dx * this.speed * dt;
            this.y += dy * this.speed * dt;
        }

        // Jump / Vertical Physics
        // 跳躍 / 垂直物理
        const GRAVITY = 800;
        const JUMP_FORCE = -200;

        // Apply Gravity
        this.velocity.y += GRAVITY * dt;

        // Z (Height) management - Mapping Z to Y for top-down 2D pseudo-3D
        // Since this is top-down, "Jumping" is basically an offset.
        // But for physics, let's track a 'z' property or just use a separate velocity component for "bounce".
        // Let's use a specialized 'z' and 'vz' for the bounce effect to keep x/y movement clean.

        if (this.input.isKeyDown('Space') && this.z >= 0) {
            this.vz = JUMP_FORCE;
        }

        this.vz += GRAVITY * dt;
        this.z += this.vz * dt;

        // Ground Collision
        if (this.z > 0) {
            this.z = 0;
            this.vz = 0;
            // Visual squash on land could be triggered here
        }
    }
}
