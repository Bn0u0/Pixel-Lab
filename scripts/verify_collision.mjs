
import { PhysicsWorld, MATERIALS } from '../core/PhysicsWorld.js';
import { Player } from '../entities/Player.js';
import { CONSTANTS } from '../core/Constants.js';

// Mock Input
const mockInput = {
    state: { x: 0, y: 0, jump: false, attack: false }
};

// Setup World
const physics = new PhysicsWorld();
physics.reset();

// 1. Create a Wall at x=100
// Wall is vertical line
for (let y = 0; y < 200; y++) {
    physics.set(100, y, MATERIALS.STONE);
}

// 2. Create Player at x=80 (Left of wall)
const player = new Player(80, 100, mockInput);
player.width = 24; // Ensure width is known
player.height = 24;

console.log('--- Starting Physics Verification ---');
console.log(`Player Start X: ${player.x}`);
console.log(`Wall X: 100`);
console.log(`Expected Stop X: 100 - Width/2 = ${100 - 12} = 88 (Approx)`);

// 3. Move Right
mockInput.state.x = 1;

// Simulate 60 Frames (1 Second)
const dt = 1 / 60;
for (let i = 0; i < 60; i++) {
    player.update(dt, physics, []);

    // Log typical frame
    if (i % 10 === 0 || i === 59) {
        console.log(`Frame ${i}: X=${player.x.toFixed(2)} VX=${player.velocity.x.toFixed(2)}`);
    }
}

// 4. Verification
const expectedMaxX = 100 - player.width / 2;
// Actually current logic: this.x = (leftX + 1) + width/2?? 
// Wait, if moving Right.
// Logic:
// if (velocity.x > 0 && isSolid(rightX))
//    this.x = rightX - width/2;
// rightX is Math.floor(this.x + width/2).
// if Wall is at 100.
// We want rightX to NOT be 100? No, if rightX IS 100 (Solid), we snap.
// Snap to 100 - 12 = 88.

if (Math.abs(player.x - 88) < 1.0) {
    console.log('SUCCESS: Player stopped at the wall correctly.');
} else {
    console.error(`FAILURE: Player passed the wall! X=${player.x}`);
}

// Test 2: Walking Into steps
console.log('\n--- Test 2: Low Step Verification ---');
physics.reset();
// Ground at 100
for (let x = 0; x < 200; x++) physics.set(x, 100, MATERIALS.STONE);
// Low Step at x=150, y=96 (Height 4px)
for (let y = 96; y < 100; y++) physics.set(150, y, MATERIALS.STONE);

player.x = 140;
player.y = 100; // Feet on ground
player.velocity.x = 0;
// Move Right
mockInput.state.x = 1;

for (let i = 0; i < 60; i++) {
    player.update(dt, physics, []);
    if (i % 10 === 0 || i === 59) {
        console.log(`Frame ${i}: X=${player.x.toFixed(2)} Y=${player.y.toFixed(2)}`);
    }
}

// Expected: Stop at 150 - 12 = 138.
if (Math.abs(player.x - 138) < 1.0) {
    console.log('SUCCESS: Player stopped at the low step.');
} else {
    console.log(`FAILURE: Player walked into/over the step? X=${player.x}`);
}
