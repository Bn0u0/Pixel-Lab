import { Player } from '../entities/Player.js';
import { PhysicsWorld, MATERIALS } from '../core/PhysicsWorld.js';

// Mock Input
const input = { isKeyDown: () => false }; // No input, just velocity

const physics = new PhysicsWorld();
physics.reset();
// Build a wall at x=20
for (let y = 0; y < 48; y++) physics.set(20, y, MATERIALS.STONE);

const player = new Player(10, 10, input);

console.log('--- Test 1: No Collision ---');
player.velocity.x = 100; // Moving right
player.update(0.01, physics); // Move a bit
if (player.x > 10) {
    console.log(`✅ Player moved to ${player.x.toFixed(2)}`);
} else {
    console.error('FAILED: Player did not move in air');
    process.exit(1);
}

console.log('--- Test 2: Wall Impact ---');
player.x = 10; // Start back at 10
player.velocity.x = 500; // Fast move
player.update(0.1, physics); // 0.1s -> would move to 60.

// Wall is at 20.
// Player Radius 8.
// Should stop when Right Edge (x+8) hits 20.
// So x should be 12.

console.log(`Pos: ${player.x}, Vel: ${player.velocity.x}`);

if (Math.abs(player.x - 12) < 2 && player.velocity.x === 0) {
    console.log('✅ Wall Collision Detected (Stopped at ~12)');
} else {
    console.error(`FAILED: Player tunnelled to ${player.x}`);
    process.exit(1);
}
