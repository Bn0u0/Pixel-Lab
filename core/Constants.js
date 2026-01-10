/**
 * Core Constants
 * 核心常數
 */
// import { CONFIG } from '../data/config_v2.js';

export const CONSTANTS = {
    GRAVITY: 800, // Pixels per second squared
    TERMINAL_VELOCITY: 300,
    FRICTION: 0.8,
    MOVE_SPEED: 120,
    JUMP_FORCE: -220,

    // Virtual Controller Map
    KEYS: {
        LEFT: ['ArrowLeft', 'KeyA'],
        RIGHT: ['ArrowRight', 'KeyD'],
        UP: ['ArrowUp', 'KeyW'],
        DOWN: ['ArrowDown', 'KeyS'],
        JUMP: ['Space', 'KeyZ', 'KeyJ'],
        ATTACK: ['KeyX', 'KeyK'],
        DASH: ['ShiftLeft', 'KeyL']
    }
};
