import { Player } from '../entities/Player.js';

// Mock InputHandler
class MockInput {
    constructor() {
        this.keys = new Set();
    }
    isKeyDown(code) { return this.keys.has(code); }
    press(code) { this.keys.add(code); }
    release(code) { this.keys.delete(code); }
}

const input = new MockInput();
// Mock PhysicsWorld (not used for this test yet, can be null)
const physics = null;

const player = new Player(0, 0, input);

console.log('--- Test 1: Idle (Friction) ---');
// Set some velocity
player.velocity.x = 100;
player.update(0.1, physics); // 0.1s
console.log(`Velocity after friction: ${player.velocity.x}`);
if (player.velocity.x < 100) {
    console.log('✅ Friction applied');
} else {
    console.error('FAILED: Friction not working');
    process.exit(1);
}

console.log('--- Test 2: Acceleration (Input) ---');
player.velocity.x = 0;
input.press('KeyD'); // Move Right
player.update(0.1, physics);
console.log(`Velocity after input: ${player.velocity.x}`);
console.log(`Position after input: ${player.x}`);

if (player.velocity.x > 0 && player.x > 0) {
    console.log('✅ Acceleration applied');
} else {
    console.error('FAILED: Player did not move');
    process.exit(1);
}

console.log('--- Test 3: Diagonal Normalization ---');
player.velocity.x = 0;
player.velocity.y = 0;
input.press('KeyW'); // Up (-y)
input.press('KeyD'); // Right (+x)
// input is currently D and W
player.update(1, physics); // 1 second

// Max speed per axis should be less than ACCEL * 1
// If normalized, ax and ay are 0.707. 
// Accel 500. Speed += 500 * 0.707 = 353.5.
// Friction will reduce it, but let's check input direction vector logic implicity.
// Logic: if (ax !== 0 || ay !== 0) normalize.
// We just verify x and y are roughly equal magnitude (and correct sign)
console.log(`Vel X: ${player.velocity.x}, Vel Y: ${player.velocity.y}`);

if (Math.abs(Math.abs(player.velocity.x) - Math.abs(player.velocity.y)) < 1) {
    console.log('✅ Diagonal Normalized');
} else {
    console.error(`FAILED: Diagonal movement uneven. X:${player.velocity.x}, Y:${player.velocity.y}`);
    process.exit(1);
}
