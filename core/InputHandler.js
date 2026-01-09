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

        // --- Touch Support (Mobile) ---
        this.touches = new Map(); // Track active touches by ID
        this.leftTouchId = null;  // Virtual Joystick ID
        this.leftOrigin = { x: 0, y: 0 };

        window.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
        window.addEventListener('touchmove', (e) => this.handleTouch(e), { passive: false });
        window.addEventListener('touchend', (e) => this.handleTouch(e));
        window.addEventListener('touchcancel', (e) => this.handleTouch(e));
    }

    handleTouch(e) {
        e.preventDefault(); // Prevent scrolling/zooming

        const activeIds = new Set();
        const width = window.innerWidth;
        const halfWidth = width / 2;

        // Process current touches
        for (let i = 0; i < e.touches.length; i++) {
            const t = e.touches[i];
            activeIds.add(t.identifier);

            // 1. Assign new touches
            if (!this.touches.has(t.identifier)) {
                this.touches.set(t.identifier, { x: t.clientX, y: t.clientY });

                // Logic: Left side = Joystick, Right side = Jump
                if (t.clientX < halfWidth) {
                    if (this.leftTouchId === null) {
                        this.leftTouchId = t.identifier;
                        this.leftOrigin = { x: t.clientX, y: t.clientY };
                    }
                } else {
                    // Right Screen -> Jump (KeyW)
                    this.keys.add('KeyW');
                    // Also Dash if tap? For now simple Jump.
                }
            } else {
                // Update existing touch
                this.touches.set(t.identifier, { x: t.clientX, y: t.clientY });
            }

            // 2. Logic for Virtual Joystick (Left)
            if (t.identifier === this.leftTouchId) {
                const deltaX = t.clientX - this.leftOrigin.x;
                const threshold = 20; // Deadzone

                this.keys.delete('KeyA');
                this.keys.delete('KeyD');

                if (deltaX < -threshold) this.keys.add('KeyA');
                if (deltaX > threshold) this.keys.add('KeyD');
            }
        }

        // 3. Cleanup ended touches
        for (const id of this.touches.keys()) {
            if (!activeIds.has(id)) {
                this.touches.delete(id);

                // If Joystick lifted
                if (id === this.leftTouchId) {
                    this.leftTouchId = null;
                    this.keys.delete('KeyA');
                    this.keys.delete('KeyD');
                }
                // If Right Touch lifted -> Stop Jump
                // Note: limitation - if multiple right touches, lifting one stops jump. 
                // For better robustness, check if ANY right touch remains.
                // But simplified: assuming single finger action per side.
                if (id !== this.leftTouchId) {
                    // Try to be smart: Check if any OTHER touch is on right side?
                    // Simple approach: Just remove Jump key if this was likely the jump finger.
                    // But since we add 'KeyW' on start, let's remove it if we don't find a right touch in active list.
                }
            }
        }

        // Re-evaluate Jump Key based on Active Right Touches
        let hasRightTouch = false;
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].clientX >= halfWidth) {
                hasRightTouch = true;
                break;
            }
        }

        if (hasRightTouch) this.keys.add('KeyW');
        else this.keys.delete('KeyW');
    }

    isKeyDown(code) {
        return this.keys.has(code);
    }

    getMousePos() {
        return { x: this.mouseX, y: this.mouseY };
    }
}
