/**
 * Player (Slime)
 * 主角邏輯
 */
import { Entity } from './Entity.js';
import { CONSTANTS } from '../core/Constants.js';
import { MATERIALS } from '../core/PhysicsWorld.js';
import { SPRITE_SLIME_BASE } from '../data/library/bodies/slime_base.js';
import { SPRITE_SLIME_SWORD } from '../data/library/bodies/slime_sword.js';
import { SPRITE_SLIME_SHIELD } from '../data/library/bodies/slime_shield.js';
import { StrikeBox } from '../core/StrikeBox.js';

export class Player extends Entity {
    constructor(x, y, input) {
        super(x, y);
        this.input = input;

        // Physics Params
        this.jumpTimer = 0;
        this.squashState = null; // { x: 1, y: 1 } for animation

        // Interaction
        this.interactCooldown = 0;
        this.currentForm = 'base'; // 'base', 'sword', 'shield'

        // State Machine
        this.state = 'IDLE'; // IDLE, RUN, JUMP, ATTACK
        this.stateTimer = 0;
        this.attackCooldown = 0;
    }

    equip(slot, spriteData) {
        // Simple slot system for now
        this.sprite = spriteData;
    }

    update(dt, physics, entities = []) {
        // 1. Input Processing
        this._handleInput(entities);

        // 2. Physics Integration
        this._applyPhysics(dt);

        // 3. Collision Detection & Resolution
        this._handleCollisions(physics);

        // 4. Interaction (Items)
        this._handleInteraction(dt, entities);

        // 5. Animation Logic (Squash recovery)
        this._updateAnimation(dt);
    }

    _handleInput(entities) {
        // Attack Trigger
        if (this.input.state.attack && this.attackCooldown <= 0) {
            this._enterAttack(entities);
            return;
        }

        // X Movement
        if (this.input.state.x !== 0) {
            this.velocity.x += this.input.state.x * CONSTANTS.MOVE_SPEED * 0.2; // Accel
            this.facing = this.input.state.x;
            this.state = 'RUN';
        } else {
            this.state = 'IDLE';
        }

        // Jump
        if (this.input.state.jump && this.isGrounded) {
            this.velocity.y = CONSTANTS.JUMP_FORCE;
            this.isGrounded = false;
            // Squash Effect (Stretch up)
            this.squashState = { x: 0.8, y: 1.3 };
            this.state = 'JUMP';
        }
    }

    _enterAttack(entities) {
        this.state = 'ATTACK';
        this.stateTimer = 0;
        this.attackCooldown = 0.4; // Cooldown

        console.log('Player Attacked!');

        // Spawn StrikeBox
        // Offset based on facing
        const reach = 24;
        const sx = (this.facing > 0) ? this.x + this.width / 2 : this.x - this.width / 2 - reach;

        // Create StrikeBox
        const box = new StrikeBox(sx, this.y - 5, reach, 20, 0.1, this);
        entities.push(box);

        // Lunge forward slightly
        this.velocity.x = this.facing * 200;

        // Squish
        this.squashState = { x: 1.2, y: 0.8 };
    }

    _updateAttack(dt, entities) {
        // Brief Friction during attack
        this.velocity.x *= 0.9;

        // End Attack after 0.2s
        if (this.stateTimer > 0.2) {
            this.state = 'IDLE';
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
        // We check a few points at the feet
        // const footY = Math.floor(this.y + 1); // Unused

        const leftX = Math.floor(this.x - this.width / 2);
        const rightX = Math.floor(this.x + this.width / 2);
        const bottomY = Math.floor(this.y);
        // const topY = Math.floor(this.y - this.height); // Unused

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

    _handleInteraction(dt, entities) {
        // Cooldown
        if (this.interactCooldown > 0) {
            this.interactCooldown -= dt;
        }

        // Check Input (Down Key)
        if (this.input.state.y > 0 && this.interactCooldown <= 0) {
            this._checkForItem(entities);
        }
    }

    _checkForItem(entities) {
        // Find item close to player
        const item = entities.find(e => {
            if (e === this) return false;
            // Simple distance check
            const dx = Math.abs(e.x - this.x);
            const dy = Math.abs(e.y - this.y);
            return dx < 16 && dy < 16 && e.type; // e.type implies it's an Item (duck typing)
        });

        if (item) {
            console.log(`吞噬了 ${item.type}!`);
            this.morph(item.type);
            item.markedForDeletion = true; // Signal to main to remove
            this.interactCooldown = 0.5; // Prevent double eat
        }
    }

    morph(type) {
        this.currentForm = type;
        console.log(`變身為: ${type}`);

        // Change Sprite
        if (type === 'sword') {
            this.equip('body', SPRITE_SLIME_SWORD);
        } else if (type === 'shield') {
            this.equip('body', SPRITE_SLIME_SHIELD);
        } else {
            this.equip('body', SPRITE_SLIME_BASE);
        }

        // ToDo: Change Stats
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
