import Phaser from 'phaser';
import { ToyVisual } from './ToyVisual';
import { ToyConfig } from '../../constants';

export class SimpleToyVisual implements ToyVisual {
    create(scene: Phaser.Scene, config: ToyConfig): Phaser.GameObjects.Container {
        const container = scene.add.container(0, 0);

        let shapeVisual: Phaser.GameObjects.Shape;
        let borderVisual: Phaser.GameObjects.Shape;
        let width = config.radius * 2;
        let height = config.radius * 2;

        // 1. Create Base Shape & Border
        if (config.shape === 'oval') {
            width = config.radius * 2 * (config.scaleX || 1);
            height = config.radius * 2 * (config.scaleY || 1);
            shapeVisual = scene.add.ellipse(0, 0, width, height, config.color);
            borderVisual = scene.add.ellipse(0, 0, width, height);
        } else {
            // Default to circle
            shapeVisual = scene.add.circle(0, 0, config.radius, config.color);
            borderVisual = scene.add.circle(0, 0, config.radius);
        }

        // 2. Create Shine (Common)
        const shine = scene.add.circle(
            -config.radius * 0.3,
            -config.radius * 0.3,
            config.radius * 0.2,
            0xffffff,
            0.3
        );

        // 3. Configure Border
        borderVisual.setStrokeStyle(2, 0x000000, 0.1);

        // 4. Create Emoji (Common)
        const fontSize = config.radius * 1.0;
        const emoji = scene.add.text(0, 0, config.emoji, {
            fontSize: `${fontSize}px`,
            fontFamily: 'sans-serif',
            padding: { x: 0, y: 0 }
        }).setOrigin(0.5);

        container.add([shapeVisual, shine, borderVisual, emoji]);

        return container;
    }
}
