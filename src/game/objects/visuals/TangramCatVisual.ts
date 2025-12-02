import Phaser from 'phaser';
import { ToyVisual } from './ToyVisual';
import { ToyConfig } from '../../constants';

export class TangramCatVisual implements ToyVisual {
    create(scene: Phaser.Scene, config: ToyConfig): Phaser.GameObjects.Container {
        const container = scene.add.container(0, 0);

        const graphics = scene.add.graphics();

        if (config.version === 'v2') {
            // Placeholder for V2
            this.drawTangramCatV1(graphics);
        } else {
            this.drawTangramCatV1(graphics);
        }

        container.add([graphics]);

        return container;
    }

    private drawTangramCatV1(graphics: Phaser.GameObjects.Graphics, alpha: number = 1) {
        // Palette: Oranges
        const darkOrange = 0xFF8C00;
        const orange = 0xFFA500;
        const gold = 0xFFD700;
        const redOrange = 0xFF4500;

        // Head: Diamond (Rotated Square)
        // Center at (0, -15)
        // Size: 30x30 approx
        // Vertices relative to (0, -15): (0, -20), (20, 0), (0, 20), (-20, 0)
        // Absolute: (0, -35), (20, -15), (0, 5), (-20, -15)
        graphics.fillGradientStyle(orange, orange, darkOrange, darkOrange, alpha);
        graphics.fillPoints([
            { x: 0, y: -35 },
            { x: 20, y: -15 },
            { x: 0, y: 5 },
            { x: -20, y: -15 }
        ], true, true);
        graphics.lineStyle(2, 0xffffff, alpha);
        graphics.strokePoints([
            { x: 0, y: -35 },
            { x: 20, y: -15 },
            { x: 0, y: 5 },
            { x: -20, y: -15 }
        ], true, true);

        // Left Ear: Triangle
        // Touching Head Top-Left edge: (-10, -25) approx?
        // Let's place it on the top-left side of the diamond.
        // Vertices: (-10, -25), (-20, -15), (-20, -35)
        graphics.fillGradientStyle(gold, orange, darkOrange, darkOrange, alpha);
        graphics.fillPoints([
            { x: -10, y: -25 }, // Touch Head
            { x: -20, y: -15 }, // Touch Head Left Corner
            { x: -25, y: -35 }  // Tip
        ], true, true);
        graphics.strokePoints([
            { x: -10, y: -25 },
            { x: -20, y: -15 },
            { x: -25, y: -35 }
        ], true, true);

        // Right Ear: Triangle
        graphics.fillGradientStyle(gold, orange, darkOrange, darkOrange, alpha);
        graphics.fillPoints([
            { x: 10, y: -25 }, // Touch Head
            { x: 20, y: -15 }, // Touch Head Right Corner
            { x: 25, y: -35 }  // Tip
        ], true, true);
        graphics.strokePoints([
            { x: 10, y: -25 },
            { x: 20, y: -15 },
            { x: 25, y: -35 }
        ], true, true);

        // Body: Triangle (Large)
        // Below Head. Head bottom corner is (0, 5).
        // Vertices: (0, 5), (-30, 35), (30, 35)
        graphics.fillGradientStyle(darkOrange, redOrange, orange, orange, alpha);
        graphics.fillPoints([
            { x: 0, y: 5 },
            { x: -30, y: 35 },
            { x: 30, y: 35 }
        ], true, true);
        graphics.strokePoints([
            { x: 0, y: 5 },
            { x: -30, y: 35 },
            { x: 30, y: 35 }
        ], true, true);

        // Tail: Triangle (Curved up?)
        // Attached to Body Right Bottom (30, 35)
        // Vertices: (30, 35), (50, 15), (40, 35)
        graphics.fillGradientStyle(orange, gold, darkOrange, darkOrange, alpha);
        graphics.fillPoints([
            { x: 30, y: 35 },
            { x: 50, y: 15 },
            { x: 45, y: 35 }
        ], true, true);
        graphics.strokePoints([
            { x: 30, y: 35 },
            { x: 50, y: 15 },
            { x: 45, y: 35 }
        ], true, true);
    }
}
