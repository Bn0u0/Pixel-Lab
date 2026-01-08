import { PhysicsWorld, MATERIALS } from '../core/PhysicsWorld.js';

// Setup
const physics = new PhysicsWorld();
physics.reset();

console.log('--- Test 1: Gravity (Vertical Fall) ---');
// Place sand in mid-air
physics.set(5, 0, MATERIALS.SAND);
// Update one frame
physics.update(1 / 60);
// Should be at 5, 1
if (physics.get(5, 1) === MATERIALS.SAND && physics.get(5, 0) === MATERIALS.AIR) {
    console.log('✅ Gravity works');
} else {
    console.error('FAILED: Sand did not fall');
    process.exit(1);
}

console.log('--- Test 2: Piling (Diagonal Slip) ---');
physics.reset();
// Create a floor
for (let x = 0; x < physics.width; x++) physics.set(x, physics.height - 1, MATERIALS.STONE);

// Drop a column of sand
const centerX = 16;
for (let i = 0; i < 10; i++) {
    physics.set(centerX, i, MATERIALS.SAND);
}

// Run simulation
for (let f = 0; f < 300; f++) {
    physics.update(1 / 60);
}

// Check spread
// If it was just gravity, all sand would be stacked at centerX.
// With diagonal slip, we expect sand at centerX-1 or centerX+1.
const left = physics.get(centerX - 1, physics.height - 2);
const right = physics.get(centerX + 1, physics.height - 2);

console.log(`Left Pile: ${left === MATERIALS.SAND}, Right Pile: ${right === MATERIALS.SAND}`);

if (left === MATERIALS.SAND || right === MATERIALS.SAND) {
    console.log('✅ Sand spread naturally (Triangle formation)');
} else {
    console.error('FAILED: Sand formed a vertical column (No diagonal slip)');
    process.exit(1);
}

console.log('✅ Sand Logic Verified');
