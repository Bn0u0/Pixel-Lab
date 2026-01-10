/**
 * Game Loop
 * 遊戲主迴圈
 * Implements Fixed Time Step pattern for consistent physics.
 */
export class GameLoop {
    constructor(updateFn, drawFn, targetFPS = 60) {
        this.updateFn = updateFn;
        this.drawFn = drawFn;
        this.fps = targetFPS;
        this.timestep = 1 / this.fps;

        this.isRunning = false;
        this.lastTime = 0;
        this.accumulator = 0;

        this._loop = this._loop.bind(this);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now() / 1000; // Seconds
        this.accumulator = 0;
        requestAnimationFrame(this._loop);
    }

    stop() {
        this.isRunning = false;
    }

    _loop(currentTime) {
        if (!this.isRunning) return;

        // Convert to seconds
        const time = currentTime / 1000;
        const frameTime = Math.min(time - this.lastTime, 0.25); // Cap at 0.25s to prevent spiral of death
        this.lastTime = time;

        this.accumulator += frameTime;

        // Update Physics (Fixed Steps)
        while (this.accumulator >= this.timestep) {
            this.updateFn(this.timestep);
            this.accumulator -= this.timestep;
        }

        // Render (Interpolation could be added here later using accumulator/timestep alpha)
        this.drawFn();

        requestAnimationFrame(this._loop);
    }
}
