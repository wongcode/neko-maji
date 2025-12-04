import Phaser from 'phaser';

export class MoodMeter extends Phaser.GameObjects.Container {
    private moodFill: Phaser.GameObjects.Graphics;
    public readonly METER_WIDTH = 300;
    public readonly METER_HEIGHT = 8;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        scene.add.existing(this);

        const radius = this.METER_HEIGHT / 2;

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

        // Calculate width based on mood %
        const percent = Phaser.Math.Clamp(currentMood / maxMood, 0, 1);
        const fillWidth = this.METER_WIDTH * percent;

        // Color gradient? Or just solid pink/orange
        const color = 0xff7043; // Orange

        this.moodFill.fillStyle(color, 1);

        const radius = this.METER_HEIGHT / 2;

        // Fill from left
        // Fix clipping: Round left corners always, right corners if full?
        // Actually fillRoundedRect handles radius well if width is small?
        // If width < radius * 2, it might look weird.

        // Let's just use fillRoundedRect with variable width.
        // If we want it to look like a bar filling up, we should probably mask it or just draw rect.
        // But rounded rect is nicer.

        if (fillWidth > 0) {
            this.moodFill.fillRoundedRect(0, 0, fillWidth, this.METER_HEIGHT, { tl: radius, tr: 0, bl: radius, br: 0 });
            // If nearly full, round right side too?
            if (percent > 0.95) {
                this.moodFill.clear();
                this.moodFill.fillStyle(color, 1);
                this.moodFill.fillRoundedRect(0, 0, fillWidth, this.METER_HEIGHT, radius);
            }
        }
    }
}
