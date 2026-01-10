import { Entity } from './Entity.js';
import { CONSTANTS } from '../core/Constants.js';
import { MATERIALS } from '../core/PhysicsWorld.js';

export class DummyEnemy extends Entity {
    constructor(x, y) {
        super(x, y);
        this.width = 30; // Slightly smaller than player
        this.height = 30;
        this.color = '#FFA500'; // Orange

        // Stats
        this.hp = 30;
        this.isDead = false;

        // Physics
        this.velocity = { x: 0, y: 0 };
        this.isGrounded = false;
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
            this.y = bottomY;
            this.velocity.y = 0;
            this.isGrounded = true;
        }
    }

    takeDamage(amount, source) {
        if (this.isDead) return;

        this.hp -= amount;
        console.log(`Enemy took ${amount} damage! HP: ${this.hp}`);

        // Knockback
        const dir = (this.x - source.x > 0) ? 1 : -1;
        this.velocity.x = dir * 100; // Knockback force
        this.velocity.y = -100; // Pop up

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        this.color = '#555555'; // Dead Grey
        console.log('Enemy Died!');
        this.markedForDeletion = true; // Remove from game
    }
}
