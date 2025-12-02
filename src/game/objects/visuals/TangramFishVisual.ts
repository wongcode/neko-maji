import Phaser from 'phaser';
import { ToyVisual } from './ToyVisual';
import { ToyConfig } from '../../constants';

export class TangramFishVisual implements ToyVisual {
    create(scene: Phaser.Scene, config: ToyConfig): Phaser.GameObjects.Container {
        const container = scene.add.container(0, 0);

        const graphics = scene.add.graphics();

        if (config.version === 'v2') {
            this.drawTangramFishV2(graphics);
        } else {
            this.drawTangramFishV1(graphics);
        }

        container.add([graphics]);

        return container;
    }

    private drawTangramFishV1(graphics: Phaser.GameObjects.Graphics, alpha: number = 1) {
        // Palette
        const navy = 0x000080;
        const darkBlue = 0x00008B;
        const mediumBlue = 0x4169E1; // Royal Blue
        const lightBlue = 0x87CEEB; // Sky Blue
        const cyan = 0x00FFFF;

        // Red Triangle (Head) -> Dark Blue Gradient
        graphics.fillGradientStyle(mediumBlue, mediumBlue, navy, navy, alpha);
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

        // Green Square (Body) -> Blue Gradient
        graphics.fillGradientStyle(lightBlue, cyan, mediumBlue, mediumBlue, alpha);
        graphics.fillRect(-40, -20, 40, 40);
        graphics.strokeRect(-40, -20, 40, 40);

        // Yellow Triangle (Top Fin) -> Light Blue Gradient
        graphics.fillGradientStyle(cyan, lightBlue, mediumBlue, mediumBlue, alpha);
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

        // Orange Triangle (Bottom Fin) -> Light Blue Gradient
        graphics.fillGradientStyle(cyan, lightBlue, mediumBlue, mediumBlue, alpha);
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

        // Blue Triangle (Tail) -> Navy Gradient
        graphics.fillGradientStyle(navy, navy, darkBlue, darkBlue, alpha);
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

    private drawTangramFishV2(graphics: Phaser.GameObjects.Graphics, alpha: number = 1) {
        // Palette
        const navy = 0x000080;
        const darkBlue = 0x00008B;
        const mediumBlue = 0x4169E1; // Royal Blue
        const lightBlue = 0x87CEEB; // Sky Blue
        const cyan = 0x00FFFF;

        // Head (Triangle) - Pointing Right (Further out)
        // Vertices: (0, -30), (40, 0), (0, 30) relative to x=10
        // Absolute: (10, -30), (50, 0), (10, 30)
        graphics.fillGradientStyle(mediumBlue, mediumBlue, navy, navy, alpha);
        graphics.fillPoints([
            { x: 10, y: -30 },
            { x: 50, y: 0 },
            { x: 10, y: 30 }
        ], true, true);
        graphics.strokePoints([
            { x: 10, y: -30 },
            { x: 50, y: 0 },
            { x: 10, y: 30 }
        ], true, true);

        // Body (Rectangle / 2 Squares)
        // x: -10, width: 60, height: 50
        // Vertices: (-50, -25), (10, -25), (10, 25), (-50, 25)
        graphics.fillGradientStyle(lightBlue, cyan, mediumBlue, mediumBlue, alpha);
        graphics.fillRect(-50, -25, 60, 50);
        graphics.strokeRect(-50, -25, 60, 50);

        // Tail (Triangle)
        // Vertices: (-30, 0), (-70, -35), (-70, 35) relative to x=-20
        // Absolute: (-50, 0), (-90, -35), (-90, 35)
        graphics.fillGradientStyle(navy, navy, darkBlue, darkBlue, alpha);
        graphics.fillPoints([
            { x: -50, y: 0 },
            { x: -90, y: -35 },
            { x: -90, y: 35 }
        ], true, true);
        graphics.strokePoints([
            { x: -50, y: 0 },
            { x: -90, y: -35 },
            { x: -90, y: 35 }
        ], true, true);
    }
}
