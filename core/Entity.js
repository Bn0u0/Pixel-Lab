/**
 * Base Entity Class
 * 實體基礎類別
 */
export class Entity {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.equipment = {}; // Modular equipment slots
    }

    /**
     * Equip a sprite to a specific slot.
     * 裝備一個精靈到指定插槽。
     * @param {string} slot - e.g., 'body', 'headwear', 'tops'
     * @param {Array} sprite - The 16x24 sprite array
     */
    equip(slot, sprite) {
        this.equipment[slot] = sprite;
    }

    /**
     * Update logic (override in subclasses)
     * 更新邏輯 (子類別覆寫)
     * @param {number} dt - Delta time in seconds
     */
    update(_dt) {
        // Base entity does nothing
    }
}
