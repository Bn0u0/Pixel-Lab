import { Entity } from '../entities/Entity.js';

export class StrikeBox extends Entity {
    constructor(x, y, width, height, lifespan, sourceEntity) {
        super(x, y);
        this.width = width;
        this.height = height;
        this.lifespan = lifespan; // in seconds
        this.sourceEntity = sourceEntity; // owner (player)
        this.markedForDeletion = false;

        // Visuals (Debug)
        this.color = '#FF0000'; // Red
    }

    update(dt, physics, entities) {
        this.lifespan -= dt;
        if (this.lifespan <= 0) {
            this.markedForDeletion = true;
            return;
        }

        // Check Collisions with Enemies
        // We need a way to filter enemies. For now, check all entities != source
        for (const e of entities) {
            if (e === this.sourceEntity || e === this) continue;

            // Simple AABB
            if (this.x < e.x + e.width &&
                this.x + this.width > e.x &&
                this.y < e.y + e.height &&
                this.y + this.height > e.y) {

                // Hit!
                if (e.takeDamage) {
                    e.takeDamage(10, this.sourceEntity); // 10 damage
                    this.markedForDeletion = true; // Destroy on hit? or piercing?
                    // For now, destroy on hit to prevent multi-hit in one frame (unless desired)
                    // Actually, usually we add to a "hit list" to avoid hitting same enemy twice, 
                    // but allow hitting multiple enemies.
                    // For simplicity: Destroy on first hit.
                    break;
                }
            }
        }
    }
}
