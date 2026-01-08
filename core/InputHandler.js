export class InputHandler {
    constructor() {
        this.keys = new Set();
        this.init();
    }

    init() {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });

        // Mouse Position tracking for Twin Stick Aiming
        this.mouseX = 0;
        this.mouseY = 0;
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }

    isKeyDown(code) {
        return this.keys.has(code);
    }

    getMousePos() {
        return { x: this.mouseX, y: this.mouseY };
    }
}
