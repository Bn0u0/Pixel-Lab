/**
 * Player (Slime)
 * 主角邏輯
 */
import { Entity } from './Entity.js';
import { CONSTANTS } from '../core/Constants.js';
import { MATERIALS } from '../core/PhysicsWorld.js';

export class Player extends Entity {
    constructor(x, y, input) {
        super(x, y);
        this.input = input;

        // Physics Params
        this.jumpTimer = 0;
        this.squashState = null; // { x: 1, y: 1 } for animation
    }

    equip(slot, spriteData) {
        // Simple slot system for now
        this.sprite = spriteData;
    }

    update(dt, physics) {
        // 1. Input Processing
        this._handleInput();

        // 2. Physics Integration
        this._applyPhysics(dt);

        // 3. Collision Detection & Resolution
        this._handleCollisions(physics);

        // 4. Animation Logic (Squash recovery)
        this._updateAnimation(dt);
    }

    _handleInput() {
        // X Movement
        if (this.input.state.x !== 0) {
            this.velocity.x += this.input.state.x * CONSTANTS.MOVE_SPEED * 0.2; // Accel
            this.facing = this.input.state.x;
        }

        // Jump
        if (this.input.state.jump && this.isGrounded) {
            this.velocity.y = CONSTANTS.JUMP_FORCE;
            this.isGrounded = false;
            // Squash Effect (Stretch up)
            this.squashState = { x: 0.8, y: 1.3 };
        }
    }

    _applyPhysics(dt) {
        // Gravity
        this.velocity.y += CONSTANTS.GRAVITY * dt;

        // Friction (Air resistance too?)
        this.velocity.x *= CONSTANTS.FRICTION;

        // Clamp Speed
        if (Math.abs(this.velocity.x) < 1) this.velocity.x = 0;

        // Apply Velocity
        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;

        // World Bounds (Temporary)
        // Hard floor at bottom if physics collision fails?
        // Handled by collision.
    }

    _handleCollisions(physics) {
        // Simple AABB vs Grid
        // Check Bottom (Ground)

        // We check a few points at the feet
        const footY = Math.floor(this.y + 1); // 1px below center? No, Y is feet? 
        // Note: Entity Y in this engine usually means "Position".
        // Renderer draws sprite relative to it.
        // Let's assume (x,y) is Bottom-Center of Hitbox.

        const leftX = Math.floor(this.x - this.width / 2);
        const rightX = Math.floor(this.x + this.width / 2);
        const bottomY = Math.floor(this.y);
        const topY = Math.floor(this.y - this.height);

        // Ground Check
        const matLeft = physics.get(leftX, bottomY);
        const matRight = physics.get(rightX, bottomY);
        const matCenter = physics.get(Math.floor(this.x), bottomY);

        // If any foot pixel touches Solid
        if (this._isSolid(matLeft) || this._isSolid(matRight) || this._isSolid(matCenter)) {
            if (this.velocity.y > 0) {
                // Landed
                this.y = bottomY; // Snap? 
                this.velocity.y = 0;
                this.isGrounded = true;

                // Landing Squash (Flatten)
                if (!this.wasGroundedLastFrame) {
                    this.squashState = { x: 1.3, y: 0.7 };
                }
            }
        } else {
            this.isGrounded = false;
        }

        this.wasGroundedLastFrame = this.isGrounded;

        // Wall Check (Left/Right) - ToDo
    }

    _isSolid(matId) {
        return matId === MATERIALS.STONE || matId === MATERIALS.WOOD || matId === MATERIALS.SAND;
    }

    _updateAnimation(dt) {
        // Recover Squash
        if (this.squashState) {
            // Lerp back to 1,1
            const speed = 10 * dt;
            this.squashState.x += (1 - this.squashState.x) * speed;
            this.squashState.y += (1 - this.squashState.y) * speed;

            if (Math.abs(this.squashState.x - 1) < 0.01) this.squashState = null;
        }
    }
}
