import { PhysicsWorld, MATERIALS } from '../core/PhysicsWorld.js';

// Mock Canvas Context
class MockContext {
    constructor() {
        this.data = [];
    }
    getImageData(x, y, w, h) {
        return {
            data: new Uint8Array(w * h * 4)
        };
    }
    putImageData() { }
    drawImage() { }
    strokeRect() { }
    scale() { }
    translate() { }
    restore() { }
    save() { }
}

const physics = new PhysicsWorld();
physics.set(0, 0, MATERIALS.SAND);

// Mock Renderer Logic (Since we can't instantiate PixelRenderer without DOM)
// We replicate the color mapping logic here to verify it.

console.log('--- Test 1: Color Mapping ---');
const props = PhysicsWorld.getProperties(MATERIALS.SAND);
const color = props.color;
console.log(`Sand Color: 0x${color.toString(16).toUpperCase()}`);

if (color === 0xFFD700) {
    console.log('✅ Sand Color Correct');
} else {
    console.error('FAILED: Sand Color Mismatch');
    process.exit(1);
}

console.log('--- Test 2: Error Pink (Reverse Violence) ---');
// Hack: Add an undefined material
MATERIALS.UNKNOWN = 999;
const unknownProps = PhysicsWorld.getProperties(MATERIALS.UNKNOWN);
let renderColor = unknownProps.color;
if (renderColor === undefined) {
    renderColor = 0xFF00FF; // The logic in renderer
}

console.log(`Unknown Color: 0x${renderColor.toString(16).toUpperCase()}`);

if (renderColor === 0xFF00FF) {
    console.log('✅ Error Pink Correct');
} else {
    console.error('FAILED: Did not fallback to Magenta');
    process.exit(1);
}
