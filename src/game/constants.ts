export interface PhysicsPart {
    type: 'circle' | 'rectangle' | 'polygon';
    x: number;
    y: number;
    radius?: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
    vertices?: { x: number, y: number }[];
}

export interface ToyConfig {
    radius: number;
    color: number;
    emoji: string;
    label: string;
    score: number;
    shape?: 'circle' | 'oval' | 'rectangle' | 'polygon';
    scaleX?: number;
    scaleY?: number;
    bodies?: PhysicsPart[];
}

export const TOYS: ToyConfig[] = [
    { radius: 20, color: 0xA1887F, emoji: '☁️', label: 'Dust Bunny', score: 2 }, // 0
    { radius: 30, color: 0x8D6E63, emoji: '🥔', label: 'Kibble', score: 4 }, // 1
    {
        radius: 40,
        color: 0x42A5F5,
        emoji: '🐟',
        label: 'Fish',
        score: 6,
        shape: 'oval',
        scaleX: 1.5,
        scaleY: 0.8,
        bodies: [
            // Head (Red Triangle)
            {
                type: 'polygon',
                x: 20, // Centroid approx
                y: 0,
                vertices: [
                    { x: 0, y: -40 },
                    { x: 60, y: 0 },
                    { x: 0, y: 40 }
                ]
            },
            // Body (Green Square)
            {
                type: 'polygon',
                x: -20,
                y: 0,
                vertices: [
                    { x: -40, y: -20 },
                    { x: 0, y: -20 },
                    { x: 0, y: 20 },
                    { x: -40, y: 20 }
                ]
            },
            // Tail (Blue Triangle)
            {
                type: 'polygon',
                x: -60,
                y: 0,
                vertices: [
                    { x: -40, y: 0 },
                    { x: -80, y: -30 },
                    { x: -80, y: 30 }
                ]
            },
            // Top Fin (Yellow Triangle)
            {
                type: 'polygon',
                x: -20,
                y: -26.66,
                vertices: [
                    { x: -40, y: -20 },
                    { x: 0, y: -20 },
                    { x: -20, y: -40 }
                ]
            },
            // Bottom Fin (Orange Triangle)
            {
                type: 'polygon',
                x: -20,
                y: 26.66,
                vertices: [
                    { x: -40, y: 20 },
                    { x: 0, y: 20 },
                    { x: -20, y: 40 }
                ]
            }
        ]
    }, // 2
    { radius: 52, color: 0xFFFFFF, emoji: '⚪', label: 'Ping Pong', score: 8 }, // 3
    { radius: 65, color: 0x81C784, emoji: '🎾', label: 'Tennis Ball', score: 12 }, // 4
    { radius: 80, color: 0x4FC3F7, emoji: '🧶', label: 'Small Yarn', score: 18 }, // 5
    { radius: 95, color: 0xBA68C8, emoji: '🥫', label: 'Canned Food', score: 26 }, // 6
    { radius: 115, color: 0xEF5350, emoji: '🧶', label: 'Big Yarn', score: 36 }, // 7
    { radius: 135, color: 0xFFB74D, emoji: '😺', label: 'Tabby Cat', score: 50 }, // 8
    { radius: 155, color: 0x78909C, emoji: '🐈‍⬛', label: 'Grey Cat', score: 100 }, // 9
    { radius: 180, color: 0xFFCA28, emoji: '🦁', label: 'Lion King', score: 200 } // 10
];

export const BOARD_WIDTH = 450;
export const BOARD_HEIGHT = 700;
export const DANGER_LINE_Y = 150;
export const SPAWN_Y = 110;
