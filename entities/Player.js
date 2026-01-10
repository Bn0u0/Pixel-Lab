/**
 * Player (Slime)
 * 主角 (Component Container)
 */
import { Entity } from './Entity.js';
import { CONSTANTS } from '../core/Constants.js';

// Components
import { PhysicsComponent } from './components/PhysicsComponent.js';
import { CombatComponent } from './components/CombatComponent.js';
import { VisualComponent } from './components/VisualComponent.js';
import { InteractionComponent } from './components/InteractionComponent.js';

export class Player extends Entity {
    constructor(x, y, input) {
        super(x, y);
        this.width = 30;
        this.height = 30;
        this.input = input;

        // --- Initialize Components ---
        // Pass 'this' so components can modify entity state
        this.physics = new PhysicsComponent(this);
        this.combat = new CombatComponent(this);
        this.visuals = new VisualComponent(this);
        this.interaction = new InteractionComponent(this);

        // State Machine
        this.state = 'IDLE';
        this.stateTimer = 0;
    }

    update(dt, physicsWorld, entities = []) {
        if (this.isDead) return;

        // 1. Input Processing (Controller Logic)
        this._handleInput(entities);

        // 2. Component Updates
        this.interaction.update(dt, entities, this.input.state);
        this.combat.update(dt, entities);
        this.visuals.update(dt);

        // Physics last to resolve all movements
        this.physics.update(dt, physicsWorld);

        // Update State Timer
        if (this.state === 'ATTACK') {
            this.stateTimer += dt;
            // End Attack Check
            if (this.stateTimer > 0.4) { // Cooldown match
                this.state = 'IDLE';
                // Reset friction if needed?
            }
        }
    }

    _handleInput(entities) {
        // Attack Trigger
        if (this.input.state.attack) {
            this.combat.performAttack(entities);
        }

        // X Movement
        if (this.state !== 'ATTACK') { // Lock movement during attack? Or allow?
            if (this.input.state.x !== 0) {
                this.velocity.x += this.input.state.x * CONSTANTS.MOVE_SPEED * 0.2;
                this.facing = this.input.state.x;
                if (this.isGrounded) this.state = 'RUN';
            } else {
                if (this.isGrounded) this.state = 'IDLE';
            }
        } else {
            // Attack Friction
            this.velocity.x *= 0.9;
        }

        // Jump
        if (this.input.state.jump && this.isGrounded) {
            this.velocity.y = CONSTANTS.JUMP_FORCE;
            this.isGrounded = false;
            this.visuals.squashState = { x: 0.8, y: 1.3 };
            this.state = 'JUMP';
        }
    }

    // Proxy methods for external calls if needed (e.g. from GlitchySweeper)
    takeDamage(amount, sourceX) {
        this.combat.takeDamage(amount, sourceX);
    }

    equip(slot, _sprite) {
        this.visuals.equip(slot);
    }

    // Compatibility Wrapper for Morph
    morph(type) {
        this.interaction.morph(type);
    }
}
