
import { CONSTANTS } from '../../core/Constants.js';
import { MATERIALS } from '../../core/PhysicsWorld.js';

export class PhysicsComponent {
    constructor(entity) {
        this.entity = entity;
        this.wasGroundedLastFrame = false;
        // Ensure entity has velocity
        if (!this.entity.velocity) {
            this.entity.velocity = { x: 0, y: 0 };
        }
    }

    update(dt, physicsWorld) {
        if (this.entity.isDead) return;

        // 1. Apply Physics (Gravity, Friction)
        this._applyPhysics(dt);

        // 2. Resolve Collisions
        this._handleCollisions(physicsWorld);
    }

    _applyPhysics(dt) {
        // Gravity
        this.entity.velocity.y += CONSTANTS.GRAVITY * dt;

        // Friction
        this.entity.velocity.x *= CONSTANTS.FRICTION;

        // Clamp Speed
        if (Math.abs(this.entity.velocity.x) < 1) this.entity.velocity.x = 0;

        // Apply Velocity
        this.entity.x += this.entity.velocity.x * dt;
        this.entity.y += this.entity.velocity.y * dt;
    }

    _handleCollisions(physics) {
        // Aliases for readability
        const e = this.entity;

        // Bounding Box
        const leftX = Math.floor(e.x - e.width / 2);
        const rightX = Math.floor(e.x + e.width / 2);
        const bottomY = Math.floor(e.y);

        // --------------------------
        // 1. Ground / Hazard Check
        // --------------------------
        const matLeft = physics.get(leftX, bottomY);
        const matRight = physics.get(rightX, bottomY);
        const matCenter = physics.get(Math.floor(e.x), bottomY);

        // Hazard (Acid)
        if (matCenter === MATERIALS.ACID || matLeft === MATERIALS.ACID || matRight === MATERIALS.ACID) {
            if (e.combat) e.combat.takeDamage(20); // Delegate to Combat Component
        }

        // Ground Collision
        if (this._isSolid(matLeft) || this._isSolid(matRight) || this._isSolid(matCenter)) {
            if (e.velocity.y > 0) {
                // Landed logic
                // 1. Find true surface (Surface Snapping for Anti-Embed)
                let surfaceY = bottomY;
                let searchLimit = 20;
                while (searchLimit > 0 && this._isSolid(physics.get(Math.floor(e.x), surfaceY))) {
                    surfaceY--;
                    searchLimit--;
                }

                // Snap to surface
                e.y = surfaceY + 1;
                e.velocity.y = 0;
                e.isGrounded = true;

                // Visual Feedback (Delegate via Event or direct call?)
                // Accessing VisualComponent directly for now
                if (!this.wasGroundedLastFrame && e.visuals) {
                    e.visuals.squashState = { x: 1.3, y: 0.7 };
                }
            }
        } else {
            e.isGrounded = false;
        }

        this.wasGroundedLastFrame = e.isGrounded;

        // --------------------------
        // 2. Wall Check (Left/Right)
        // --------------------------
        // Check 3 points: Head, Mid, Feet
        const feetY = Math.floor(e.y - 1);
        const midY = Math.floor(e.y - e.height / 2);
        const headY = Math.floor(e.y - e.height + 1);

        // Left Edge
        const wallLeftTop = physics.get(leftX, headY);
        const wallLeftMid = physics.get(leftX, midY);
        const wallLeftBot = physics.get(leftX, feetY);

        if (e.velocity.x < 0) {
            if (this._isSolid(wallLeftTop) || this._isSolid(wallLeftMid) || this._isSolid(wallLeftBot)) {
                // console.log(`Blocked LEFT: ${leftX},${feetY}`);
                e.x = (leftX + 1) + e.width / 2;
                e.velocity.x = 0;
            }
        }

        // Right Edge
        const wallRightTop = physics.get(rightX, headY);
        const wallRightMid = physics.get(rightX, midY);
        const wallRightBot = physics.get(rightX, feetY);

        if (e.velocity.x > 0) {
            if (this._isSolid(wallRightTop) || this._isSolid(wallRightMid) || this._isSolid(wallRightBot)) {
                // console.log(`Blocked RIGHT: ${rightX},${feetY}`);
                e.x = rightX - e.width / 2;
                e.velocity.x = 0;
            }
        }

        // --------------------------
        // 3. Ceiling Check
        // --------------------------
        const topY = Math.floor(e.y - e.height);
        const matTop = physics.get(Math.floor(e.x), topY);
        if (e.velocity.y < 0 && this._isSolid(matTop)) {
            e.y = topY + e.height + 1; // Snap below
            e.velocity.y = 0;
        }
    }

    _isSolid(matId) {
        return matId === MATERIALS.STONE || matId === MATERIALS.WOOD || matId === MATERIALS.SAND;
    }
}
