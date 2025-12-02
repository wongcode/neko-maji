import Phaser from 'phaser';

export class MoodMeter extends Phaser.GameObjects.Container {
    private moodFill: Phaser.GameObjects.Graphics;
    public readonly METER_WIDTH = 16;
    public readonly METER_HEIGHT = 400;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        scene.add.existing(this);

        const radius = this.METER_WIDTH / 2;

        // Background
        const bg = scene.add.graphics();
        bg.fillStyle(0x3e2723, 0.5); // Dark brown, semi-transparent
        bg.fillRoundedRect(0, 0, this.METER_WIDTH, this.METER_HEIGHT, radius);
        this.add(bg);

        // Fill Graphics
        this.moodFill = scene.add.graphics();
        this.add(this.moodFill);

        // Border
        const border = scene.add.graphics();
        border.lineStyle(2, 0x3e2723, 1);
        border.strokeRoundedRect(0, 0, this.METER_WIDTH, this.METER_HEIGHT, radius);
        this.add(border);

        this.updateMood(0, 100);
    }

    public updateMood(currentMood: number, maxMood: number) {
        this.moodFill.clear();

        // Calculate height based on mood %
        const percent = Phaser.Math.Clamp(currentMood / maxMood, 0, 1);
        const fillHeight = this.METER_HEIGHT * percent;

        // Color gradient? Or just solid pink/orange
        const color = 0xff7043; // Orange

        this.moodFill.fillStyle(color, 1);

        // Fill from bottom
        const y = this.METER_HEIGHT - fillHeight;
        const radius = this.METER_WIDTH / 2;

        // Fix clipping: Round bottom corners
        this.moodFill.fillRoundedRect(0, y, this.METER_WIDTH, fillHeight, { tl: 0, tr: 0, bl: radius, br: radius });
    }
}
