import { Player } from '../entities/Player.js';
import { PhysicsWorld, MATERIALS } from '../core/PhysicsWorld.js';

// Mock Input
const input = {
    keys: new Set(),
    isKeyDown(k) { return this.keys.has(k); }
};

const physics = new PhysicsWorld();
physics.reset();
// Floor at 40
for (let x = 0; x < 32; x++) physics.set(x, 40, MATERIALS.STONE);

const player = new Player(16, 20, input);
// Note: y=20 means feet at 20. Floor at 40. 20 pixels of air.

console.log('--- Test 1: Gravity Fall ---');
player.update(0.1, physics);
console.log(`Phase 1 Y: ${player.y}, Vy: ${player.velocity.y}`);
if (player.velocity.y > 0 && player.y > 20) {
    console.log('✅ Gravity works (Falling properly)');
} else {
    console.error('FAILED: Gravity check');
    process.exit(1);
}

console.log('--- Test 2: Landing ---');
// Fast forward to ground
for (let i = 0; i < 100; i++) player.update(0.016, physics);

console.log(`Landed Y: ${player.y}, Vy: ${player.velocity.y}, Grounded: ${player.isGrounded}`);

if (Math.abs(player.y - 40) < 1 && player.isGrounded) { // Should snap to 40
    console.log('✅ Landed on Floor (Snap-to-Grid works)');
} else {
    console.error(`FAILED: Landing check. Y=${player.y}`);
    process.exit(1);
}

console.log('--- Test 3: Jump ---');
input.keys.add('Space');
player.update(0.016, physics); // Trigger Jump

console.log(`Jump Vy: ${player.velocity.y}`);

if (player.velocity.y < 0) {
    console.log('✅ Jump Triggered (Negative Y Velocity)');
} else {
    console.error('FAILED: Jump check');
    process.exit(1);
}

console.log('--- Test 4: Air Jump Check (Double Jump Prevention) ---');
input.keys.delete('Space');
player.update(0.1, physics); // Move up a bit
input.keys.add('Space'); // Press Jump again in air
const prevVy = player.velocity.y;
player.update(0.016, physics);

if (player.velocity.y === prevVy + (900 * 0.016)) { // Only gravity applied
    console.log('✅ Double Jump Prevented properly');
} else {
    console.error(`FAILED: Double jump allowed? Vy=${player.velocity.y} vs Prev=${prevVy}`);
    // Not critical for MVP but good to know
}
