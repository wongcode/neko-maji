import Phaser from 'phaser';
import { ToyVisual } from './ToyVisual';
import { ToyConfig } from '../../constants';

export class TangramFishVisual implements ToyVisual {
    create(scene: Phaser.Scene, config: ToyConfig): Phaser.GameObjects.Container {
        const container = scene.add.container(0, 0);

        // Common Shine
        const shine = scene.add.circle(
            -config.radius * 0.3,
            -config.radius * 0.3,
            config.radius * 0.2,
            0xffffff,
            0.3
        );

        const graphics = scene.add.graphics();
        this.drawTangramFish(graphics);

        // Draw Googly Eye on the Red Triangle (Head)
        // Head is roughly (0, -40), (60, 0), (0, 40). Center approx (20, 0).
        const eyeX = 20;
        const eyeY = -5;
        const eye = scene.add.circle(eyeX, eyeY, 8, 0xffffff); // White
        const pupil = scene.add.circle(eyeX + 2, eyeY, 3, 0x000000); // Black pupil

        container.add([graphics, shine, eye, pupil]);

        return container;
    }

    private drawTangramFish(graphics: Phaser.GameObjects.Graphics, alpha: number = 1) {
        // Red Triangle (Head) - Pointing Right
        graphics.fillStyle(0xff0000, alpha); // Red
        graphics.fillPoints([
            { x: 0, y: -40 },
            { x: 60, y: 0 },
            { x: 0, y: 40 }
        ], true, true);
        graphics.lineStyle(2, 0xffffff, alpha);
        graphics.strokePoints([
            { x: 0, y: -40 },
            { x: 60, y: 0 },
            { x: 0, y: 40 }
        ], true, true);

        // Green Square (Body) - Left of Head
        graphics.fillStyle(0x00ff00, alpha); // Green
        graphics.fillRect(-40, -20, 40, 40); // x, y, width, height
        graphics.strokeRect(-40, -20, 40, 40);

        // Yellow Triangle (Top Fin) - Above Green Square
        graphics.fillStyle(0xffff00, alpha); // Yellow
        graphics.fillPoints([
            { x: -40, y: -20 },
            { x: 0, y: -20 },
            { x: -20, y: -40 }
        ], true, true);
        graphics.strokePoints([
            { x: -40, y: -20 },
            { x: 0, y: -20 },
            { x: -20, y: -40 }
        ], true, true);

        // Orange Triangle (Bottom Fin) - Below Green Square
        graphics.fillStyle(0xffa500, alpha); // Orange
        graphics.fillPoints([
            { x: -40, y: 20 },
            { x: 0, y: 20 },
            { x: -20, y: 40 }
        ], true, true);
        graphics.strokePoints([
            { x: -40, y: 20 },
            { x: 0, y: 20 },
            { x: -20, y: 40 }
        ], true, true);

        // Blue Triangle (Tail) - Left of Green Square
        graphics.fillStyle(0x0000ff, alpha); // Blue
        graphics.fillPoints([
            { x: -40, y: 0 },
            { x: -80, y: -30 },
            { x: -80, y: 30 }
        ], true, true);
        graphics.strokePoints([
            { x: -40, y: 0 },
            { x: -80, y: -30 },
            { x: -80, y: 30 }
        ], true, true);
    }
}
