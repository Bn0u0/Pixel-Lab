import { SPRITE_HUMAN_BASE } from './library/bodies/human_base.js';
import { SPRITE_KLOA_BASE } from './library/bodies/kloa_base.js';
import { SPRITE_SLIME_BASE } from './library/bodies/slime_base.js';

import { SPRITE_HELM_DARK } from './library/headwear/knight_helm.js';
import { SPRITE_WIZARD_HAT } from './library/headwear/wizard_hat.js';
import { SPRITE_KLOA_HAT } from './library/headwear/kloa_hat.js';

import { SPRITE_ARMOR_DARK_CHEST } from './library/tops/knight_armor.js';
import { SPRITE_WIZARD_ROBE } from './library/tops/wizard_robe.js';
import { SPRITE_KLOA_TUNIC } from './library/tops/kloa_tunic.js';

import { SPRITE_PANTS_BASIC } from './library/bottoms/pants_basic.js';

import { SPRITE_SCARF_RED } from './library/neckwear/scarf_red.js';
import { SPRITE_KLOA_SCARF } from './library/neckwear/kloa_scarf.js';

import { SPRITE_KLOA_BOOTS } from './library/shoes/kloa_boots.js';

/**
 * Asset Registry
 * 資產註冊表
 */

// eslint-disable-next-line no-unused-vars
export const ASSET_REGISTRY = [
    // BODIES
    { id: 'human_base', name: 'Human Base', slot: 'body', sprite: SPRITE_HUMAN_BASE },
    { id: 'kloa_base', name: 'Kloa Base', slot: 'body', sprite: SPRITE_KLOA_BASE },
    { id: 'slime_base', name: 'Slime Base', slot: 'body', sprite: SPRITE_SLIME_BASE },

    // HEADWEAR
    { id: 'knight_helm', name: 'Dark Helm', slot: 'headwear', sprite: SPRITE_HELM_DARK },
    { id: 'wizard_hat', name: 'Wizard Hat', slot: 'headwear', sprite: SPRITE_WIZARD_HAT },
    { id: 'kloa_hat', name: 'Kloa Hat', slot: 'headwear', sprite: SPRITE_KLOA_HAT },

    // TOPS
    { id: 'knight_armor', name: 'Dark Armor', slot: 'tops', sprite: SPRITE_ARMOR_DARK_CHEST },
    { id: 'wizard_robe', name: 'Wizard Robe', slot: 'tops', sprite: SPRITE_WIZARD_ROBE },
    { id: 'kloa_tunic', name: 'Kloa Tunic', slot: 'tops', sprite: SPRITE_KLOA_TUNIC },

    // BOTTOMS
    { id: 'pants_basic', name: 'Basic Pants', slot: 'bottoms', sprite: SPRITE_PANTS_BASIC },

    // NECKWEAR
    { id: 'scarf_red', name: 'Red Scarf', slot: 'neckwear', sprite: SPRITE_SCARF_RED },
    { id: 'kloa_scarf', name: 'Kloa Scarf', slot: 'neckwear', sprite: SPRITE_KLOA_SCARF },

    // SHOES
    { id: 'kloa_boots', name: 'Kloa Boots', slot: 'shoes', sprite: SPRITE_KLOA_BOOTS },
];

export function getAsset(id) {
    return ASSET_REGISTRY.find(item => item.id === id);
}

export function getAssetsBySlot(slot) {
    return ASSET_REGISTRY.filter(item => item.slot === slot);
}
