import { Entity } from './Entity.js';
import { CONSTANTS } from '../core/Constants.js';
import { MATERIALS } from '../core/PhysicsWorld.js';

export class GlitchySweeper extends Entity {
    constructor(x, y) {
        super(x, y);
        this.width = 32;
        this.height = 16;
        this.color = '#f1c40f'; // Warning Yellow

        // AI State
        this.dir = 1; // 1 = Right, -1 = Left
        this.speed = 40; // Slow patrol
        this.isAggro = false;

        // Stats
        this.hp = 20;
    }

    update(dt, physics, entities, player) {
        // 1. Gravity
        this.velocity.y += CONSTANTS.GRAVITY * dt;
        this.y += this.velocity.y * dt;

        // 2. Patrol Movement
        // Raycast ahead to check for walls or cliffs
        const lookAhead = 16 * this.dir;
        const nextX = Math.floor(this.x + lookAhead);
        const bottomY = Math.floor(this.y);

        const matWall = physics.get(nextX, bottomY - 8);
        const matFloor = physics.get(nextX, bottomY);

        if (matWall !== MATERIALS.AIR || matFloor === MATERIALS.AIR) {
            // Wall or Cliff -> Turn Around
            this.dir *= -1;
        }

        // 3. Aggro Logic (Simple Sight)
        const distToPlayer = Math.abs(player.x - this.x);
        const sameY = Math.abs(player.y - this.y) < 50;

        if (sameY && distToPlayer < 100) {
            // Spotted!
            if (!this.isAggro) {
                this.isAggro = true;
                this.speed = 150; // Charge!
                this.color = '#e74c3c'; // Red Alert
                // Face player
                this.dir = (player.x > this.x) ? 1 : -1;
            }
        } else {
            this.isAggro = false;
            this.speed = 40;
            this.color = '#f1c40f';
        }

        // Apply Move
        this.velocity.x = this.speed * this.dir;
        this.x += this.velocity.x * dt;

        // 4. Ground Collision
        const cx = Math.floor(this.x);
        const matDown = physics.get(cx, bottomY);
        if (matDown !== MATERIALS.AIR && matDown !== MATERIALS.WATER) {
            this.y = bottomY;
            this.velocity.y = 0;
        }

        // 5. Player Collision (Damage)
        // Simple AABB overlap Player
        if (this._checkOverlap(player)) {
            // console.log('Player hit by Sweeper!');
            if (player.takeDamage) {
                player.takeDamage(10, this.x);
            }
        }
    }

    takeDamage(amount, source) {
        this.hp -= amount;
        // console.log(`Sweeper HP: ${this.hp}`);
        if (this.hp <= 0) {
            this.markedForDeletion = true;
        } else {
            // Knockback
            this.velocity.x = -this.dir * 100;
            this.velocity.y = -50;
        }
    }

    _checkOverlap(e) {
        return (this.x < e.x + e.width &&
            this.x + this.width > e.x &&
            this.y < e.y + e.height &&
            this.y + this.height > e.y);
    }
}
