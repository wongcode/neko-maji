import { describe, it, expect } from 'vitest';
import { TOYS, BOARD_WIDTH, BOARD_HEIGHT } from './constants';

describe('Game Configuration', () => {
    describe('TOYS Configuration', () => {
        it('should have exactly 11 levels of toys', () => {
            expect(TOYS.length).toBe(11);
        });

        it('should have increasing scores', () => {
            for (let i = 0; i < TOYS.length - 1; i++) {
                expect(TOYS[i + 1].score).toBeGreaterThan(TOYS[i].score);
            }
        });

        it('should have increasing radii', () => {
            for (let i = 0; i < TOYS.length - 1; i++) {
                expect(TOYS[i + 1].radius).toBeGreaterThan(TOYS[i].radius);
            }
        });

        it('should have valid colors', () => {
            TOYS.forEach(toy => {
                expect(toy.color).toBeGreaterThanOrEqual(0);
                expect(toy.color).toBeLessThanOrEqual(0xFFFFFF);
            });
        });

        it('should have emojis defined for all toys', () => {
            TOYS.forEach(toy => {
                expect(toy.emoji).toBeDefined();
                expect(toy.emoji.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Board Dimensions', () => {
        it('should have reasonable board dimensions', () => {
            expect(BOARD_WIDTH).toBeGreaterThan(300);
            expect(BOARD_HEIGHT).toBeGreaterThan(500);
        });
    });
});
