import { CONFIG } from '../data/config.js';

/**
 * Sprite Compositor
 * 精靈合成器
 * 
 * Responsible for merging multiple 16x24 sprite layers into a single composite sprite.
 * 負責將多個 16x24 精靈圖層合併為單以複合精靈。
 */
export class SpriteCompositor {
    constructor() {
        // Define the strict Z-Index order (Layer 0 to Layer 10)
        // 定義嚴格的 Z-Index 順序 (第 0 層到第 10 層)
        this.layerOrder = [
            'back',      // 0: CapeBack / Wings
            'body',      // 1: Base Body
            'eyes',      // 2: Eyes / Expression
            'socks',     // 3: Socks / Hosiery
            'bottoms',   // 4: Pants / Skirts
            'footwear',  // 5: Boots / Shoes
            'tops',      // 6: Armor / Shirts
            'neckwear',  // 7: Necklaces / Scarves
            'gloves',    // 8: Gloves / Rings
            'headwear',  // 9: Helmets / Hats
            'front'      // 10: CapeFront / Held Items
        ];
    }

    /**
     * Composes a character from a set of equipped assets.
     * 根據裝備資產組裝角色。
     * 
     * @param {Object} equipment - Map of slot names to sprite arrays. e.g. { body: [...], headwear: [...] }
     * @returns {Array<string>} - A flattened 16x24 sprite array.
     */
    compose(equipment) {
        // Initialize an empty 16x24 grid with transparency
        // 初始化全透明網格
        let composite = new Array(CONFIG.GRID_HEIGHT).fill(" ".repeat(CONFIG.GRID_WIDTH));

        // Iterate through layers in order
        // 依序遍歷圖層
        for (const slot of this.layerOrder) {
            const spriteLayer = equipment[slot];
            if (spriteLayer) {
                composite = this.mergeLayers(composite, spriteLayer);
            }
        }

        return composite;
    }

    /**
     * Merges a source layer ON TOP of the base layer.
     * 將來源圖層疊加在底層之上。
     */
    mergeLayers(base, source) {
        const result = [...base]; // Copy base

        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            const baseRow = result[y];
            const sourceRow = source[y];

            // Check if source row exists (safety)
            if (!sourceRow) continue;

            let newRow = "";
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                const sourceChar = sourceRow[x] || ' ';
                const baseChar = baseRow[x] || ' ';

                // If source has content (not space/transparent), it overwrites base
                // 若來源有內容 (非空格/透明)，則覆蓋底層
                if (sourceChar !== ' ' && sourceChar !== '.') {
                    newRow += sourceChar;
                } else {
                    newRow += baseChar;
                }
            }
            result[y] = newRow;
        }

        return result;
    }
}
