
import { StrikeBox } from '../../core/StrikeBox.js';
import { CONSTANTS } from '../../core/Constants.js';

export class CombatComponent {
    constructor(entity) {
        this.entity = entity;
        this.hp = 100;
        this.maxHp = 100;
        this.isDead = false;
        this.invulnTimer = 0;

        // Attack State
        this.attackCooldown = 0;
    }

    update(dt, entities) {
        if (this.isDead) return;

        // I-Frame Timer
        if (this.invulnTimer > 0) {
            this.invulnTimer -= dt;
        }

        // Attack Cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        }
    }

    takeDamage(amount, sourceX) {
        if (this.invulnTimer > 0 || this.isDead) return;

        this.hp -= amount;
        this.invulnTimer = 1.0; // 1s iframe
        console.log(`Damage Taken! HP: ${this.hp}`);

        // Knockback (Physics Effect)
        // Accessing Physics directly via Entity
        if (this.entity.velocity) {
            this.entity.velocity.y = -200; // Pop up
            if (sourceX !== undefined) {
                const dir = (this.entity.x - sourceX > 0) ? 1 : -1;
                this.entity.velocity.x = dir * 150;
            } else {
                // General hazard
                this.entity.velocity.x = -(this.entity.facing || 1) * 100;
            }
        }

        // Visual Feedback
        if (this.entity.visuals) {
            this.entity.visuals.squashState = { x: 1.4, y: 0.6 };
        }

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        this.entity.isDead = true; // Sync state
        console.log('Entity Died!');
    }

    performAttack(entities) {
        if (this.attackCooldown > 0) return;

        // Set State on Player
        this.entity.state = 'ATTACK';
        this.entity.stateTimer = 0;
        this.attackCooldown = 0.4;

        // console.log('Attack Triggered');

        const e = this.entity;
        const reach = 24;
        const facing = e.facing || 1;
        const sx = (facing > 0) ? e.x + e.width / 2 : e.x - e.width / 2 - reach;

        // Create StrikeBox
        const box = new StrikeBox(sx, e.y - 5, reach, 20, 0.1, e);
        entities.push(box);

        // Lunge (Physics)
        if (e.velocity) {
            e.velocity.x = facing * 200;
        }

        // Visual
        if (e.visuals) {
            e.visuals.squashState = { x: 1.2, y: 0.8 };
        }
    }
}
