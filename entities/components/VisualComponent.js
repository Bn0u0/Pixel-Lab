
import { SPRITE_SLIME_BASE } from '../../data/library/bodies/slime_base.js';

export class VisualComponent {
    constructor(entity) {
        this.entity = entity;
        this.entity.squashState = null; // Initialize on entity for Renderer access

        // Default Sprite
        this.equip('base');
    }

    update(dt) {
        // Recover Squash/Stretch
        if (this.entity.squashState) {
            const speed = 10 * dt;
            const s = this.entity.squashState;

            // Lerp towards 1.0
            s.x += (1 - s.x) * speed;
            s.y += (1 - s.y) * speed;

            if (Math.abs(s.x - 1) < 0.01) this.entity.squashState = null;
        }
    }

    equip(_type) {
        // Map string type to Sprite Data
        // Currently only 'base' is supported for MVP1
        this.entity.sprite = SPRITE_SLIME_BASE;
    }

    // Helper to set squash manually
    set squashState(val) {
        this.entity.squashState = val;
    }

    get squashState() {
        return this.entity.squashState;
    }
}
