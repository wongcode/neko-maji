import Phaser from 'phaser';
import { ToyConfig } from '../../constants';

export interface ToyVisual {
    create(scene: Phaser.Scene, config: ToyConfig): Phaser.GameObjects.Container;
}
