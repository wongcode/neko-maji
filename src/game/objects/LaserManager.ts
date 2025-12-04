import Phaser from 'phaser';

export class LaserManager {
    private scene: Phaser.Scene;
    private graphics: Phaser.GameObjects.Graphics;
    private width: number;
    private duration: number;
    private color: number;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.graphics = this.scene.add.graphics();
        this.width = 10;
        this.duration = 200; // ms
        this.color = 0xff0000; // Red
    }

    public fire(startPoint: Phaser.Math.Vector2, endPoint: Phaser.Math.Vector2, onObjectHit?: (body: Matter.Body) => void) {
        this.drawLaser(startPoint, endPoint);

        // Schedule clearing the laser
        this.scene.time.delayedCall(this.duration, () => {
            this.clear();
        });

        const hitBody = this.checkCollisions(startPoint, endPoint);
        if (hitBody && onObjectHit) {
            onObjectHit(hitBody);
        }
    }

    private drawLaser(start: Phaser.Math.Vector2, end: Phaser.Math.Vector2) {
        this.graphics.clear();
        this.graphics.lineStyle(this.width, this.color);
        this.graphics.lineBetween(start.x, start.y, end.x, end.y);
    }

    private checkCollisions(start: Phaser.Math.Vector2, end: Phaser.Math.Vector2): Matter.Body | null {
        const bodies = this.scene.matter.world.getAllBodies();
        // Access Matter via the Phaser property to avoid type issues or use 'any' cast if needed
        const Matter: any = (Phaser.Physics.Matter as any).Matter;
        const collisions = Matter.Query.ray(bodies, start, end, this.width);

        if (collisions.length > 0) {
            // Find the closest collision
            // Collisions are not guaranteed to be sorted by distance
            // We want the first object hit from the start point

            // Simple distance check to start point
            let closestBody: Matter.Body | null = null;
            let minDistance = Infinity;

            collisions.forEach((collision: any) => {
                const body = collision.body as Matter.Body;
                // Skip static bodies (walls) if we want, or stop at them
                // For now, let's assume we want to hit toys
                if (body.label !== 'Rectangle Body' && !body.isStatic) {
                    // Calculate distance from start to body position (approximate)
                    const dist = Phaser.Math.Distance.Between(start.x, start.y, body.position.x, body.position.y);
                    if (dist < minDistance) {
                        minDistance = dist;
                        closestBody = body;
                    }
                }
            });

            return closestBody;
        }

        return null;
    }

    public clear() {
        this.graphics.clear();
    }
}
