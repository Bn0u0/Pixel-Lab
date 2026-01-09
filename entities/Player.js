import { Entity } from '../core/Entity.js';

export const STATE = {
    IDLE: 'IDLE',
    MOVE: 'MOVE',
    JUMP: 'JUMP',
    FALL: 'FALL',
    DASH: 'DASH',
    DEVOUR: 'DEVOUR'
};

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

        // Visual Properties (Squash & Stretch)
        this.scale = { x: 1, y: 1 };

        // State Machine
        this.state = STATE.FALL;
        this.stateTimer = 0; // For tracking state duration (Dash/Devour)

        // Jump Mechanics
        this.jumpCount = 0;
        this.wasJumpDown = false; // Input debouncing

        // Constants
        this.CONST = {
            SPEED: 80,         // Max Run Speed
            ACCEL: 600,        // Horizontal Acceleration
            FRICTION: 12,      // Ground Friction
            AIR_RESISTANCE: 2, // Air Friction
            GRAVITY: 900,      // Gravity Force
            JUMP_FORCE: -350,  // Jump Impulse
            MAX_JUMPS: 2,      // Double Jump
            MAX_FALL: 600,     // Terminal Velocity
            DASH_SPEED: 250,   // Dash Speed
            DASH_TIME: 0.15,   // Dash Duration (seconds)
            DEVOUR_TIME: 0.4,  // Devour Duration (seconds)
            HEIGHT: 15         // Hitbox Height
        };
    }

    update(dt, physics) {
        const { SPEED, ACCEL, FRICTION, AIR_RESISTANCE, GRAVITY, JUMP_FORCE, MAX_FALL, DASH_SPEED, HEIGHT } = this.CONST;

        // --- Visuals: Smooth Scale (Lerp back to 1) ---
        // Lerp speed: 10.0 for snappy return
        const lerpSpeed = 10.0 * dt;
        this.scale.x += (1 - this.scale.x) * lerpSpeed;
        this.scale.y += (1 - this.scale.y) * lerpSpeed;

        // --- Input State Handling (Debounce) ---
        const jumpKeyDown = this.input.isKeyDown('KeyW') || this.input.isKeyDown('Space') || this.input.isKeyDown('ArrowUp');
        const jumpJustPressed = jumpKeyDown && !this.wasJumpDown;
        this.wasJumpDown = jumpKeyDown;

        // --- 1. State Machine Logic ---
        switch (this.state) {
            case STATE.IDLE:
                this.handleMovement(dt, ACCEL, FRICTION);
                if (jumpJustPressed && this.tryJump(JUMP_FORCE)) break;
                if (this.tryDash()) break;
                if (this.tryDevour()) break;

                // Transition
                if (Math.abs(this.velocity.x) > 10) this.setState(STATE.MOVE);
                if (!this.isGrounded) this.setState(STATE.FALL);
                break;

            case STATE.MOVE:
                this.handleMovement(dt, ACCEL, FRICTION);
                if (jumpJustPressed && this.tryJump(JUMP_FORCE)) break;
                if (this.tryDash()) break;
                if (this.tryDevour()) break;

                // Transition
                if (Math.abs(this.velocity.x) <= 10) this.setState(STATE.IDLE);
                if (!this.isGrounded) this.setState(STATE.FALL);
                break;

            case STATE.JUMP:
            case STATE.FALL:
                this.handleMovement(dt, ACCEL, AIR_RESISTANCE); // Air control? Yes
                if (jumpJustPressed && this.tryJump(JUMP_FORCE)) break; // Air Jump
                if (this.tryDash()) break;
                // Note: No Devour in Air

                // Gravity
                this.velocity.y += GRAVITY * dt;

                // Transition
                if (this.velocity.y > 0) this.state = STATE.FALL; // Just update label
                if (this.isGrounded) this.setState(STATE.IDLE);
                break;

            case STATE.DASH:
                this.stateTimer -= dt;
                this.velocity.x = this.facing * DASH_SPEED;
                this.velocity.y = 0; // Defy gravity

                if (this.stateTimer <= 0) {
                    this.velocity.x = 0; // Stop after dash? or carry momentum? Let's stop to be snappy.
                    this.setState(this.isGrounded ? STATE.IDLE : STATE.FALL);
                }
                break;

            case STATE.DEVOUR:
                this.stateTimer -= dt;
                this.velocity.x *= 0.9; // Rapid slowdown
                // Gravity applies? Yes, in case platform breaks
                this.velocity.y += GRAVITY * dt;

                if (this.stateTimer <= 0) {
                    this.setState(STATE.IDLE);
                }
                break;
        }

        // Clamp & Terminal Velocity
        if (this.state !== STATE.DASH) {
            if (this.velocity.x > SPEED) this.velocity.x = SPEED;
            if (this.velocity.x < -SPEED) this.velocity.x = -SPEED;
            if (this.velocity.y > MAX_FALL) this.velocity.y = MAX_FALL;
        }

        // --- 2. Physics Integration ---
        this.applyPhysics(dt, physics, HEIGHT);
    }

    // --- Actions ---

    handleMovement(dt, accel, damping) {
        let dirX = 0;
        if (this.input.isKeyDown('KeyA') || this.input.isKeyDown('ArrowLeft')) dirX -= 1;
        if (this.input.isKeyDown('KeyD') || this.input.isKeyDown('ArrowRight')) dirX += 1;

        if (dirX !== 0) {
            this.facing = dirX;
            this.velocity.x += dirX * accel * dt;
        } else {
            this.velocity.x -= this.velocity.x * damping * dt;
            if (Math.abs(this.velocity.x) < 5) this.velocity.x = 0;
        }
    }

    tryJump(jumpForce) {
        // Ground Jump or Air Jump
        if (this.isGrounded) {
            this.triggerSquash(0.7, 1.3); // Stretch Up
            this.velocity.y = jumpForce;
            this.isGrounded = false;
            this.jumpCount = 1;
            this.setState(STATE.JUMP);
            return true;
        } else if (this.jumpCount < this.CONST.MAX_JUMPS) {
            this.triggerSquash(0.6, 1.4); // Air Jump Stretch (More exaggerated)
            this.velocity.y = jumpForce; // Full Reset of vertical velocity
            this.jumpCount++;
            this.setState(STATE.JUMP);
            return true;
        }
        return false;
    }

    tryDash() {
        // Press 'Shift' or 'Z' to Dash
        if (this.input.isKeyDown('KeyZ') || this.input.isKeyDown('ShiftLeft')) {
            this.triggerSquash(1.4, 0.6); // Flat Stretch
            this.setState(STATE.DASH);
            return true;
        }
        return false;
    }

    tryDevour() {
        // Press 'X' or 'E' to Devour
        if (this.input.isKeyDown('KeyX') || this.input.isKeyDown('KeyE')) {
            this.setState(STATE.DEVOUR);
            return true;
        }
        return false;
    }

    triggerSquash(x, y) {
        this.scale.x = x;
        this.scale.y = y;
    }

    setState(newState) {
        if (this.state === newState) return;

        // Exit Logic
        // ...

        this.state = newState;

        // Enter Logic
        switch (newState) {
            case STATE.DASH:
                this.stateTimer = this.CONST.DASH_TIME;
                break;
            case STATE.DEVOUR:
                this.stateTimer = this.CONST.DEVOUR_TIME;
                // console.log('Nom nom nom...'); // Debug for Devour
                break;
        }
        // console.log(`State: ${newState}`);
    }

    applyPhysics(dt, physics, height) {
        // --- X Axis ---
        let nextX = this.x + this.velocity.x * dt;

        // World Boundary
        if (nextX < 2) nextX = 2;
        if (nextX > physics.width - 2) nextX = physics.width - 2;

        // Collision X
        const wallCheckY = this.y - 4;
        if (this.checkCollision(nextX + (this.velocity.x > 0 ? 5 : -5), wallCheckY, physics)) {
            this.velocity.x = 0;
        } else {
            this.x = nextX;
        }

        // --- Y Axis ---
        let finalY = this.y;
        let remainingDy = this.velocity.y * dt;
        const stepY = 1;
        const signY = Math.sign(remainingDy);

        while (Math.abs(remainingDy) > 0) {
            const step = Math.min(Math.abs(remainingDy), stepY) * signY;
            const tryY = finalY + step;

            if (this.velocity.y > 0) {
                // Falling
                if (this.checkCollision(this.x, tryY, physics)) {
                    // Landed Logic
                    if (!this.isGrounded) {
                        // Impact Squash based on speed
                        // Small fall -> small squash. Big fall -> big squash.
                        // Max squash limited to 1.5, 0.5
                        const impact = Math.min(Math.abs(this.velocity.y) / 600, 0.5);
                        if (impact > 0.1) this.triggerSquash(1 + impact, 1 - impact);
                    }

                    finalY = Math.floor(tryY);
                    this.velocity.y = 0;
                    this.isGrounded = true;
                    this.jumpCount = 0; // Reset Jump Count
                    remainingDy = 0;
                    break;
                } else {
                    finalY = tryY;
                    this.isGrounded = false; // Falling
                    remainingDy -= step;
                }
            } else {
                // Jumping
                if (this.checkCollision(this.x, tryY - height, physics)) {
                    this.velocity.y = 0; // Head bonk
                    remainingDy = 0;
                    break;
                } else {
                    finalY = tryY;
                    remainingDy -= step;
                }
            }
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
        return props.type === 'solid';
    }
}
