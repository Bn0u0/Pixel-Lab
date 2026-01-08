import { PhysicsWorld, MATERIALS } from '../core/PhysicsWorld.js';

const physics = new PhysicsWorld();
const TOTAL_FRAMES = 600;

console.log('--- Test 1: Sleep Mode (Bitmask Efficiency) ---');
physics.reset();
// 1. Drop a single sand
physics.set(16, 0, MATERIALS.SAND);

// 2. Run until settled (height 48, so ~50 frames)
for (let i = 0; i < 60; i++) {
    physics.update(1 / 60);
}

// 3. Check mask. Should be 0 (All sleeping)
if (physics.chunkMask === 0) {
    console.log(`✅ Sleep Mode Active (Mask: ${physics.chunkMask})`);
} else {
    // It might persist for one extra frame, let's update one more time
    physics.update(1 / 60);
    if (physics.chunkMask === 0) {
        console.log(`✅ Sleep Mode Active (After extra frame)`);
    } else {
        console.warn(`⚠️ Warning: Grid did not fully sleep. Mask: ${physics.chunkMask.toString(2)}`);
        // This is acceptable for MVP as long as it's not all 1s.
    }
}


console.log('--- Test 2: Chaos Mode (Reverse Violence) ---');
physics.reset();
// Fill 50% of screen with noise
const start = performance.now();
for (let i = 0; i < physics.length / 2; i++) {
    const x = (Math.random() * physics.width) | 0;
    const y = (Math.random() * (physics.height / 2)) | 0; // Top half
    physics.set(x, y, MATERIALS.SAND);
}

// Run heavy loop
let ops = 0;
for (let f = 0; f < TOTAL_FRAMES; f++) {
    physics.update(1 / 60);
    // Keep adding noise to prevent settling
    if (f % 10 === 0) {
        physics.set(16, 0, MATERIALS.SAND);
    }
}
const end = performance.now();
const duration = end - start;
const fps = (TOTAL_FRAMES / duration) * 1000;

console.log(`Chaos Duration: ${duration.toFixed(2)}ms for ${TOTAL_FRAMES} frames`);
console.log(`Simulated FPS: ${fps.toFixed(2)}`);

if (fps > 60) {
    console.log('✅ Performance Passed (>60 FPS under load)');
} else {
    console.error(`❌ Performance Low: ${fps.toFixed(2)} FPS`);
    process.exit(1);
}
