import Phaser from 'phaser';
import { ToyConfig } from '../constants';
import { ToyVisual } from './visuals/ToyVisual';
import { TangramFishVisual } from './visuals/TangramFishVisual';
import { TangramCatVisual } from './visuals/TangramCatVisual';
import { SimpleToyVisual } from './visuals/SimpleToyVisual';

export class ToyRenderer {
    private static visuals: Map<string, ToyVisual> = new Map();

    static initialize() {
        this.visuals.set('Big Fish', new TangramFishVisual());
        this.visuals.set('Big Cat', new TangramCatVisual());
        this.visuals.set('default', new SimpleToyVisual());
    }

    static createToyVisuals(scene: Phaser.Scene, config: ToyConfig): Phaser.GameObjects.Container {
        if (this.visuals.size === 0) {
            this.initialize();
        }

        const visual = this.visuals.get(config.label) || this.visuals.get('default');
        return visual!.create(scene, config);
    }
}
