/**
 * Input Handler
 * 輸入管理器
 * Maps PC Keyboard to Mobile-like Virtual Controller state.
 */
import { CONSTANTS } from './Constants.js';

export class InputHandler {
    constructor() {
        this.keys = new Set();
        this.state = {
            x: 0, // -1 (Left), 0, 1 (Right)
            y: 0, // -1 (Up), 0, 1 (Down)
            jump: false,
            attack: false,
            dash: false
        };

        window.addEventListener('keydown', (e) => this._onKeyDown(e));
        window.addEventListener('keyup', (e) => this._onKeyUp(e));
    }

    _onKeyDown(e) {
        this.keys.add(e.code);
        this._updateState();
    }

    _onKeyUp(e) {
        this.keys.delete(e.code);
        this._updateState();
    }

    _updateState() {
        // Horizontal
        this.state.x = 0;
        if (CONSTANTS.KEYS.LEFT.some(k => this.keys.has(k))) this.state.x -= 1;
        if (CONSTANTS.KEYS.RIGHT.some(k => this.keys.has(k))) this.state.x += 1;

        // Vertical
        this.state.y = 0;
        if (CONSTANTS.KEYS.UP.some(k => this.keys.has(k))) this.state.y -= 1;
        if (CONSTANTS.KEYS.DOWN.some(k => this.keys.has(k))) this.state.y += 1;

        // Actions
        this.state.jump = CONSTANTS.KEYS.JUMP.some(k => this.keys.has(k));
        this.state.attack = CONSTANTS.KEYS.ATTACK.some(k => this.keys.has(k));
        this.state.dash = CONSTANTS.KEYS.DASH.some(k => this.keys.has(k));
    }

    // Check if a specific semantic action is pressed
    isPressed(action) {
        return this.state[action];
    }
}
