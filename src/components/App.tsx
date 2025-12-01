import { useEffect, useRef, useState } from 'preact/hooks';
import { launchGame } from '../game/Game';

export function App() {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);
    const [nextItem, setNextItem] = useState<string>('');
    const [gameOver, setGameOver] = useState(false);

    const gameInstanceRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (gameContainerRef.current && !gameInstanceRef.current) {
            const game = launchGame(gameContainerRef.current, {
                onScoreChange: (newScore: number) => setScore(newScore),
                onNextItemChange: (emoji: string) => setNextItem(emoji),
                onGameOver: () => setGameOver(true),
            });
            gameInstanceRef.current = game;
        }

        return () => {
            if (gameInstanceRef.current) {
                gameInstanceRef.current.destroy(true);
                gameInstanceRef.current = null;
            }
        };
    }, [gameContainerRef]);

    const handleRestart = () => {
        if (gameInstanceRef.current) {
            const scene = gameInstanceRef.current.scene.getScene('MainScene');
            if (scene) {
                scene.events.emit('restart');
                setGameOver(false);
                setScore(0);
            }
        }
    };

    return (
        <div id="game-wrapper" style={{ width: '100%', height: '100%' }}>
            {/* UI Layer */}
            <div id="ui-layer">
                <div className="score-box">
                    <span className="score-label">SCORE</span>
                    <span id="score">{score}</span>
                </div>
                <div className="next-box">
                    <span className="next-label">NEXT</span>
                    <div id="next-item-display">
                        {nextItem}
                    </div>
                </div>
            </div>

            {/* Phaser Container */}
            <div ref={gameContainerRef} id="phaser-container" style={{ width: '100%', height: '100%' }} />

            {/* Game Over Screen */}
            {gameOver && (
                <div id="game-over">
                    <h1>Oh No!</h1>
                    <p>The toys overflowed.</p>
                    <p className="final-score">Final Score: {score}</p>
                    <button className="restart-btn" onClick={handleRestart}>Try Again</button>
                </div>
            )}
        </div>
    );
}
