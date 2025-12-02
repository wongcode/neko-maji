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
    version?: string; // 'v1', 'v2', etc.
}

export const FISH_LAYOUTS: Record<string, PhysicsPart[]> = {
    v1: [
        // Head (Red Triangle)
        {
            type: 'polygon',
            x: 20,
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
            x: -66.66, // Centroid of (-40, -80, -80) is -66.66
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
    ],
    v2: [
        // V2: "Long Fish" / Rocket
        // Head (Triangle)
        {
            type: 'polygon',
            x: 23.33, // Centroid of (10, 50, 10) is 23.33
            y: 0,
            vertices: [
                { x: 0, y: -30 },
                { x: 40, y: 0 },
                { x: 0, y: 30 }
            ]
        },
        // Body (Rectangle / 2 Squares)
        {
            type: 'polygon',
            x: -20, // Centroid of (-50, 10, 10, -50) is -20
            y: 0,
            vertices: [
                { x: -40, y: -25 },
                { x: 20, y: -25 },
                { x: 20, y: 25 },
                { x: -40, y: 25 }
            ]
        },
        // Tail (Triangle)
        {
            type: 'polygon',
            x: -76.66, // Centroid of (-50, -90, -90) is -76.66
            y: 0,
            vertices: [
                { x: -30, y: 0 },
                { x: -70, y: -35 },
                { x: -70, y: 35 }
            ]
        }
    ]
};

export const TOYS: ToyConfig[] = [
    { radius: 20, color: 0xA1887F, emoji: '☁️', label: 'Dust Bunny', score: 2 }, // 0
    { radius: 30, color: 0x8D6E63, emoji: '🥔', label: 'Kibble', score: 4 }, // 1
    {
        radius: 40,
        color: 0x4169E1, // Royal Blue
        emoji: '🐟',
        label: 'Fish',
        score: 6,
        shape: 'oval',
        scaleX: 1.5,
        scaleY: 0.8,
        version: 'v2', // Set to v2 to test
        bodies: FISH_LAYOUTS.v2 // Use v2 layout
    }, // 2
    { radius: 50, color: 0xFFCC80, emoji: '🧶', label: 'Yarn Ball', score: 8 }, // 3
    { radius: 60, color: 0x90CAF9, emoji: '🎾', label: 'Tennis Ball', score: 10 }, // 4
    { radius: 70, color: 0xF48FB1, emoji: '🐁', label: 'Mouse Toy', score: 12 }, // 5
    { radius: 80, color: 0xCE93D8, emoji: '🥫', label: 'Canned Food', score: 14 }, // 6
    { radius: 90, color: 0x80CBC4, emoji: '�', label: 'Milk', score: 16 }, // 7
    { radius: 100, color: 0xFFAB91, emoji: '�', label: 'Box', score: 18 }, // 8
    { radius: 110, color: 0xB39DDB, emoji: '🐈', label: 'Cat', score: 20 }, // 9
    { radius: 120, color: 0xFFD54F, emoji: '👑', label: 'Golden Cat', score: 22 }, // 10
];

export const BOARD_WIDTH = 450;
export const BOARD_HEIGHT = 700;
export const DANGER_LINE_Y = 150;
export const SPAWN_Y = 110;
