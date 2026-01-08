import { GameLoop } from '../core/GameLoop.js';

// Mock Browser APIs
let currentTime = 0;
global.performance = {
    now: () => currentTime
};
global.requestAnimationFrame = (cb) => {
    // Don't auto-schedule, we control the loop manually in test
    return 1;
};
global.cancelAnimationFrame = () => { };

// Test Variables
let updateCount = 0;
let totalDt = 0;
const targetFps = 60;
const step = 1 / targetFps;

const loop = new GameLoop(
    (dt) => {
        updateCount++;
        totalDt += dt;
    },
    () => { }, // Draw
    targetFps
);

// Start
loop.start();

console.log('--- Test 1: Stable 60FPS ---');
// Simulate 1 second passing in perfect 60 chunks
// Actually GameLoop uses current time, so we just advance time and call loop manually
for (let i = 0; i < 60; i++) {
    currentTime += 1000 / 60; // Advance 16.66ms
    loop.loop(currentTime);
}

// Expect 60 updates
console.log(`Updates: ${updateCount} (Expected ~60)`);
if (Math.abs(updateCount - 60) > 1) {
    console.error('FAILED: Update count mismatch');
    process.exit(1);
}

console.log('--- Test 2: Lag Spike (Catch-up) ---');
updateCount = 0;
currentTime += 100; // Jump 100ms (should be ~6 frames)
loop.loop(currentTime);
console.log(`Lag Updates: ${updateCount} (Expected ~6)`);
if (updateCount < 5 || updateCount > 7) {
    console.error('FAILED: Lag catch-up failed');
    process.exit(1);
}

console.log('--- Test 3: Spiral of Death Protection ---');
updateCount = 0;
currentTime += 5000; // Jump 5 seconds! (Massive lag)
// Protection caps dt at 0.1s (100ms), so roughly 6 updates per frame max, 
// no wait, code says: if (deltaTime > 0.1) deltaTime = 0.1;
// So accumulator gets +0.1.
// 0.1 / (1/60) = 6 updates.
loop.loop(currentTime);
console.log(`Spiral Updates: ${updateCount} (Expected ~6)`);

if (updateCount !== 6) {
    console.error(`FAILED: Spiral protection failed. Got ${updateCount}`);
    process.exit(1);
}

console.log('✅ GameLoop Verified');
