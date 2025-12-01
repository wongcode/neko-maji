import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export interface GameConfig {
    onScoreChange: (score: number) => void;
    onNextItemChange: (emoji: string) => void;
    onGameOver: () => void;
}

export const launchGame = (container: HTMLElement, config: GameConfig) => {
    const gameConfig: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: container,
        width: 450,
        height: 700,
        backgroundColor: '#fcf0e1',
        physics: {
            default: 'matter',
            matter: {
                gravity: { x: 0, y: 1.8 },
                // debug: true // Enable for debugging physics
            }
        },
        scene: [new MainScene(config)],
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.NO_CENTER
        }
    };

    return new Phaser.Game(gameConfig);
};
