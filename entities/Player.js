import { Entity } from '../core/Entity.js';

/**
 * Player Class
 * 玩家類別
 */
export class Player extends Entity {
    constructor(x, y, inputHandler) {
        super(x, y); // x: Center, y: Feet (Bottom)
        this.input = inputHandler;

        // Physics Properties
        this.velocity = { x: 0, y: 0 };
        this.isGrounded = false;
        this.facing = 1; // 1: Right, -1: Left

        // Constants
        this.CONST = {
            SPEED: 80,         // Max Run Speed
            ACCEL: 600,        // Horizontal Acceleration
            FRICTION: 12,      // Ground Friction
            AIR_RESISTANCE: 2, // Air Friction
            GRAVITY: 900,      // Gravity Force (Pixels/s^2)
            JUMP_FORCE: -350,  // Jump Impulse (Negative Y is Up)
            MAX_FALL: 600,     // Terminal Velocity
            WIDTH: 6,          // Hitbox Width (Radius) - Slime is narrow
            HEIGHT: 15         // Hitbox Height (Slime is short, not 40!)
        };
    }

    update(dt, physics) {
        const { SPEED, ACCEL, FRICTION, AIR_RESISTANCE, GRAVITY, JUMP_FORCE, MAX_FALL, HEIGHT } = this.CONST;

        // --- 1. Input Processing (Horizontal) ---
        let dirX = 0;
        if (this.input.isKeyDown('KeyA') || this.input.isKeyDown('ArrowLeft')) dirX -= 1;
        if (this.input.isKeyDown('KeyD') || this.input.isKeyDown('ArrowRight')) dirX += 1;

        if (dirX !== 0) {
            this.facing = dirX;
            // Apply Acceleration
            this.velocity.x += dirX * ACCEL * dt;
        } else {
            // Apply Friction
            const damping = this.isGrounded ? FRICTION : AIR_RESISTANCE;
            this.velocity.x -= this.velocity.x * damping * dt;
            // Snap to 0
            if (Math.abs(this.velocity.x) < 5) this.velocity.x = 0;
        }

        // Clamp Speed
        if (this.velocity.x > SPEED) this.velocity.x = SPEED;
        if (this.velocity.x < -SPEED) this.velocity.x = -SPEED;

        // --- 2. Input Processing (Jump) ---
        // Jump only if grounded
        if (this.isGrounded && (this.input.isKeyDown('KeyW') || this.input.isKeyDown('Space') || this.input.isKeyDown('ArrowUp'))) {
            this.velocity.y = JUMP_FORCE;
            this.isGrounded = false;
        }

        // --- 3. Physics Integration (Y - Gravity) ---
        this.velocity.y += GRAVITY * dt;
        if (this.velocity.y > MAX_FALL) this.velocity.y = MAX_FALL;

        // --- 4. Movement & Collision (X Axis) ---
        let nextX = this.x + this.velocity.x * dt;

        // World Boundary Clamp (Invisible Walls)
        // 世界邊界限制
        if (nextX < 2) nextX = 2; // Left Wall (with small buffer)
        if (nextX > physics.width - 2) nextX = physics.width - 2; // Right Wall

        // Check Feet and Head for wall collision
        // Hitbox: Center X +/- 5
        const wallCheckY = this.y - 4; // Slightly above feet
        const wallHit = this.checkCollision(nextX + (this.velocity.x > 0 ? 5 : -5), wallCheckY, physics);

        if (wallHit) {
            this.velocity.x = 0;
        } else {
            this.x = nextX;
        }

        // --- 5. Movement & Collision (Y Axis) ---
        // Implement Swept Collision / Step Check for Y to prevent tunneling
        let finalY = this.y;
        let remainingDy = this.velocity.y * dt;
        const stepY = 1; // Check every 1 pixel (High precision for thin floors)

        // Direction
        const signY = Math.sign(remainingDy);

        while (Math.abs(remainingDy) > 0) {
            const step = Math.min(Math.abs(remainingDy), stepY) * signY;
            const tryY = finalY + step;

            // Falling
            if (this.velocity.y > 0) {
                if (this.checkCollision(this.x, tryY, physics)) {
                    // Landed
                    finalY = Math.floor(tryY);
                    this.velocity.y = 0;
                    this.isGrounded = true;
                    remainingDy = 0; // Stop
                    break;
                } else {
                    finalY = tryY;
                    remainingDy -= step;
                }
            }
            // Jumping
            else {
                if (this.checkCollision(this.x, tryY - HEIGHT, physics)) {
                    // Head Bonk
                    this.velocity.y = 0;
                    remainingDy = 0;
                    break;
                } else {
                    finalY = tryY;
                    remainingDy -= step;
                }
            }

            // Safety break for infinite loops (though math should be finite)
            if (Math.abs(remainingDy) < 0.001) break;
        }
        this.y = finalY;
    }

    checkCollision(x, y, physics) {
        if (!physics) return false;
        const gx = Math.floor(x);
        const gy = Math.floor(y);
        const mat = physics.get(gx, gy);
        const props = physics.constructor.getProperties(mat);
        // console.log(`Check Collision: (${x.toFixed(2)}, ${y.toFixed(2)}) -> [${gx}, ${gy}] = ID ${mat} (${props.type})`);
        return props.type === 'solid';
    }
}
