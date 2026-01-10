/**
 * Item Entity
 * 可拾取物品
 */
import { Entity } from './Entity.js';
import { CONSTANTS } from '../core/Constants.js';
import { MATERIALS } from '../core/PhysicsWorld.js';

export class Item extends Entity {
    constructor(x, y, type) {
        super(x, y);
        this.type = type; // 'sword', 'shield'
        this.width = 16;
        this.height = 16;

        // Visuals
        this.color = (type === 'sword') ? 0xDDDDDD : 0x8B4513; // Grey or Wood
    }

    update(dt, physics) {
        // Simple Gravity
        this.velocity.y += CONSTANTS.GRAVITY * dt;
        this.y += this.velocity.y * dt;

        // Ground Collision
        const bottomY = Math.floor(this.y);
        const centerX = Math.floor(this.x);

        const mat = physics.get(centerX, bottomY);
        if (mat !== MATERIALS.AIR && mat !== MATERIALS.WATER) {
            // Landed
            this.y = bottomY;
            this.velocity.y = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
    }
}
