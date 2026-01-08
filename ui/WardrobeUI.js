import { ASSET_REGISTRY, getAssetsBySlot } from '../data/registry.js';

/**
 * Wardrobe UI Manager
 * 衣櫃介面管理器
 */
export class WardrobeUI {
    constructor(player) {
        this.player = player;
        this.container = document.getElementById('wardrobe-panel');
        if (!this.container) {
            console.error("WardrobeUI: Container #wardrobe-panel not found.");
            return;
        }
        this.init();
    }

    init() {
        this.container.innerHTML = "<h2>WARDROBE</h2>";

        // Define display slots in order (Slime only has body for now)
        const slots = ['body']; // , 'headwear', 'tops', 'bottoms', 'neckwear', 'shoes'

        slots.forEach(slot => {
            this.createSlotSection(slot);
        });
    }

    createSlotSection(slot) {
        const section = document.createElement('div');
        section.className = 'wardrobe-section';

        const title = document.createElement('h3');
        title.textContent = slot.toUpperCase();
        section.appendChild(title);

        const assets = getAssetsBySlot(slot);

        // "Unequip" button (Clear slot) - except for body
        if (slot !== 'body') {
            const unequipBtn = document.createElement('button');
            unequipBtn.textContent = 'None';
            unequipBtn.onclick = () => {
                this.player.equip(slot, null);
                console.log(`Unequipped ${slot}`);
            };
            section.appendChild(unequipBtn);
        }

        // Asset buttons
        assets.forEach(asset => {
            const btn = document.createElement('button');
            btn.textContent = asset.name;
            btn.className = 'item-btn';
            btn.onclick = () => {
                this.player.equip(slot, asset.sprite);
                console.log(`Equipped ${asset.name} to ${slot}`);
            };
            section.appendChild(btn);
        });

        this.container.appendChild(section);
    }
}
