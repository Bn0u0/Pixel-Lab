export class GameLoop {
    constructor(updateCallback, drawCallback, fps = 60) {
        this.updateCallback = updateCallback;
        this.drawCallback = drawCallback;
        this.fps = fps;
        this.step = 1 / fps; // Fixed time step (seconds)
        this.lastTime = 0;
        this.accumulator = 0;
        this.rafId = null;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.rafId = requestAnimationFrame((timestamp) => this.loop(timestamp));
        console.log('GameLoop Started');
    }

    stop() {
        this.isRunning = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        console.log('GameLoop Stopped');
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        // Calculate delta time in seconds
        // 計算經過的時間 (秒)
        let deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Prevent spiral of death if lag occurs (cap dt at 0.1s)
        // 防止過大延遲導致的死循環
        if (deltaTime > 0.1) deltaTime = 0.1;

        this.accumulator += deltaTime;

        // Fixed Update Step
        // 固定時間步長更新
        while (this.accumulator >= this.step) {
            this.updateCallback(this.step);
            this.accumulator -= this.step;
        }

        // Render
        // 渲染
        this.drawCallback();

        this.rafId = requestAnimationFrame((t) => this.loop(t));
    }
}
