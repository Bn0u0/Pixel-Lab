/**
 * Entity Base
 * 實體基底類別
 */
export class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = { x: 0, y: 0 };
        this.width = 24; // Hitbox width
        this.height = 24; // Hitbox height (Slime default)
        this.facing = 1; // 1 = Right, -1 = Left
        this.isGrounded = false;

        this.sprite = null;
    }

    update(_dt, _physics) {
        // Override me
    }
}
