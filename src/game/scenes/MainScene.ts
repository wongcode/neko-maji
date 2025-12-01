import Phaser from 'phaser';
import { GameConfig } from '../Game';
import { ToyRenderer } from '../objects/ToyRenderer';

import { TOYS, BOARD_WIDTH, BOARD_HEIGHT, DANGER_LINE_Y, SPAWN_Y } from '../constants';

export class MainScene extends Phaser.Scene {
    private config: GameConfig;
    private currentToyIdx: number = 0;
    private nextToyIdx: number = 0;
    private score: number = 0;
    private isDropping: boolean = false;
    private gameOver: boolean = false;
    private dropCooldown: boolean = false;
    private mouseX: number = 0;

    // Layout
    private boardX: number = 0;
    private boardY: number = 0;

    // Visuals
    private aimLine!: Phaser.GameObjects.Graphics;
    private ghostToy!: Phaser.GameObjects.Container;
    private dangerLine!: Phaser.GameObjects.Graphics;
    private wallGraphics!: Phaser.GameObjects.Graphics;

    constructor(config: GameConfig) {
        super('MainScene');
        this.config = config;
    }

    create() {
        // Reset State
        this.score = 0;
        this.gameOver = false;
        this.dropCooldown = false;
        this.config.onScoreChange(0);

        // Initial Layout Calculation
        this.updateLayout();

        // Scale Event
        this.scale.on('resize', this.handleResize, this);

        // Initialize Toys
        this.nextToyIdx = this.getRandomToyIndex();
        this.setNextToy();

        // Graphics
        this.createVisuals();

        // Inputs
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.mouseX = pointer.x;
            this.updateGhost();
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            this.mouseX = pointer.x;
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            this.mouseX = pointer.x;
            if (!this.gameOver) {
                this.dropToy();
            }
        });

        // Collisions
        this.matter.world.on('collisionstart', this.handleCollisions, this);

        // Game Over Check Loop
        this.time.addEvent({ delay: 500, callback: this.checkGameOver, callbackScope: this, loop: true });

        // Restart Listener
        this.events.on('restart', this.restartGame, this);
    }

    private handleResize(gameSize: Phaser.Structs.Size) {
        this.updateLayout();
        this.createVisuals(); // Re-draw visuals
    }

    private updateLayout() {
        const { width, height } = this.scale;
        this.boardX = (width - BOARD_WIDTH) / 2;
        this.boardY = (height - BOARD_HEIGHT) / 2;

        // Update Physics Bounds
        // We need to clear old bounds if possible or just update them.
        // Matter.js bounds are tricky to update dynamically for the world, 
        // but we can update the wall bodies.
        // For simplicity, let's just recreate the bounds.

        const wallThickness = 4;
        this.matter.world.setBounds(
            this.boardX + wallThickness,
            -1000,
            BOARD_WIDTH - (wallThickness * 2),
            this.boardY + BOARD_HEIGHT - wallThickness + 1000,
            60, true, true, false, true
        );
    }

    update() {
        if (this.gameOver) return;

        this.updateGhost();
    }

    private createVisuals() {
        if (this.dangerLine) this.dangerLine.destroy();
        if (this.wallGraphics) this.wallGraphics.destroy();
        if (this.aimLine) this.aimLine.destroy();
        if (this.ghostToy) this.ghostToy.destroy();

        // Danger Line (Dotted)
        this.dangerLine = this.add.graphics();
        this.dangerLine.lineStyle(2, 0xD7CCC8);

        const dashLength = 10;
        const gapLength = 10;
        let currentX = 0;

        this.dangerLine.beginPath();
        while (currentX < BOARD_WIDTH) {
            this.dangerLine.moveTo(this.boardX + currentX, this.boardY + DANGER_LINE_Y);
            this.dangerLine.lineTo(Math.min(this.boardX + currentX + dashLength, this.boardX + BOARD_WIDTH), this.boardY + DANGER_LINE_Y);
            currentX += dashLength + gapLength;
        }
        this.dangerLine.strokePath();

        // Container Walls (U-Shape)
        this.wallGraphics = this.add.graphics();
        const wallThickness = 4;
        this.wallGraphics.lineStyle(wallThickness, 0x8d6e63);

        const inset = wallThickness / 2;
        const radius = 12;

        this.wallGraphics.beginPath();
        // Left Wall Top (Start off-screen)
        this.wallGraphics.moveTo(this.boardX + inset, -50);
        // Left Wall Bottom
        this.wallGraphics.lineTo(this.boardX + inset, this.boardY + BOARD_HEIGHT - radius - inset);
        // Bottom Left Curve
        this.wallGraphics.arc(this.boardX + inset + radius, this.boardY + BOARD_HEIGHT - radius - inset, radius, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(90), true);
        // Bottom Floor
        this.wallGraphics.lineTo(this.boardX + BOARD_WIDTH - radius - inset, this.boardY + BOARD_HEIGHT - inset);
        // Bottom Right Curve
        this.wallGraphics.arc(this.boardX + BOARD_WIDTH - radius - inset, this.boardY + BOARD_HEIGHT - radius - inset, radius, Phaser.Math.DegToRad(90), Phaser.Math.DegToRad(0), true);
        // Right Wall Top
        this.wallGraphics.lineTo(this.boardX + BOARD_WIDTH - inset, -50);

        this.wallGraphics.strokePath();

        // Aim Line
        this.aimLine = this.add.graphics();

        // Ghost Toy
        // Initialize with default toy (index 0)
        const defaultToy = TOYS[0];
        this.ghostToy = ToyRenderer.createToyVisuals(this, defaultToy);
        this.ghostToy.setAlpha(0.5);
        this.ghostToy.setVisible(false);
        this.ghostToy.setAlpha(0.6); // Make ghost semi-transparent
    }

    private updateGhost() {
        if (this.dropCooldown || this.gameOver) {
            this.aimLine.clear();
            this.ghostToy.setVisible(false);
            return;
        }

        const currentToy = TOYS[this.currentToyIdx];
        const scaleX = currentToy.scaleX || 1;
        const scaleY = currentToy.scaleY || 1;
        const width = currentToy.radius * 2 * scaleX;
        const height = currentToy.radius * 2 * scaleY;

        // Constrain X relative to board
        // Use half-width for constraint
        const halfWidth = width / 2;
        let relativeX = this.mouseX - this.boardX;
        if (relativeX < halfWidth + 5) relativeX = halfWidth + 5;
        if (relativeX > BOARD_WIDTH - halfWidth - 5) relativeX = BOARD_WIDTH - halfWidth - 5;

        const absX = this.boardX + relativeX;
        const absY = this.boardY + SPAWN_Y;

        // Draw Aim Line
        this.aimLine.clear();
        this.aimLine.lineStyle(2, 0x8D6E63, 0.2);
        this.aimLine.beginPath();
        this.aimLine.moveTo(absX, absY);
        this.aimLine.lineTo(absX, this.boardY + BOARD_HEIGHT);
        this.aimLine.strokePath();

        // Update Ghost
        if (this.ghostToy) {
            this.ghostToy.destroy();
        }

        this.ghostToy = ToyRenderer.createToyVisuals(this, currentToy);
        this.ghostToy.setAlpha(0.5);
        this.ghostToy.setPosition(absX, absY);
        this.ghostToy.setVisible(true);
    }

    private getRandomToyIndex() {
        return Math.floor(Math.random() * 3);
    }

    private setNextToy() {
        this.currentToyIdx = this.nextToyIdx;
        this.nextToyIdx = this.getRandomToyIndex();
        this.config.onNextItemChange(TOYS[this.nextToyIdx].emoji);
    }

    private spawnToy(x: number, y: number, index: number) {
        const toyConfig = TOYS[index];
        let body: Matter.Body;

        if (toyConfig.bodies) {
            const parts: Matter.Body[] = [];

            toyConfig.bodies.forEach(partDef => {
                let part: Matter.Body;
                if (partDef.type === 'circle') {
                    part = this.matter.bodies.circle(x + partDef.x, y + partDef.y, partDef.radius!) as Matter.Body;
                } else if (partDef.type === 'polygon' && partDef.vertices) {
                    part = this.matter.bodies.fromVertices(x + partDef.x, y + partDef.y, [partDef.vertices]) as Matter.Body;
                } else {
                    part = this.matter.bodies.circle(x + partDef.x, y + partDef.y, 10) as Matter.Body;
                }

                if (partDef.scaleX || partDef.scaleY) {
                    this.matter.body.scale(part as any, partDef.scaleX || 1, partDef.scaleY || 1);
                }

                parts.push(part);
            });

            body = this.matter.body.create({
                parts: parts as any[],
                restitution: 0.2,
                friction: 0.1,
                density: 0.002,
                label: index.toString()
            }) as Matter.Body;

        } else {
            body = this.matter.add.circle(x, y, toyConfig.radius, {
                restitution: 0.2,
                friction: 0.1,
                density: 0.002,
                label: index.toString()
            }) as Matter.Body;

            if (toyConfig.shape === 'oval' && toyConfig.scaleX && toyConfig.scaleY) {
                this.matter.body.scale(body as any, toyConfig.scaleX, toyConfig.scaleY);
            }
        }

        // Create Visuals using Renderer
        const container = ToyRenderer.createToyVisuals(this, toyConfig);

        // Adjust container position to match body center of mass
        // When we attach gameObject to body, Phaser sets gameObject position to body.position.
        // If body.position (COM) is different from the "visual center" (x,y),
        // we need to offset the visuals inside the container.

        // Calculate offset between original (x,y) and new body.position
        // Actually, we just place the container at the body position.
        // But the visuals inside the container are centered at (0,0).
        // If the body COM is shifted, (0,0) of the container (which aligns with COM)
        // will not align with the "intended" visual center.

        // Example: Fish. Main body at (0,0). Tail at (-60,0). COM at (-10,0).
        // Body position = (x-10, y).
        // Container position = (x-10, y).
        // Visuals at (0,0) in container -> World (x-10, y).
        // But we want Main Body Visual at World (x, y).
        // So we need to shift visuals by (+10, 0).
        // Offset = (x, y) - body.position.

        // Note: We haven't added the body to the world yet if we used Matter.Body.create
        // so body.position might be just the calculated COM.
        // If we created parts at (x... , y...), the body position is already absolute.

        const offset = {
            x: x - body.position.x,
            y: y - body.position.y
        };

        // Apply offset to all children in container
        container.each((child: Phaser.GameObjects.GameObject) => {
            if ('x' in child && 'y' in child) {
                (child as any).x += offset.x;
                (child as any).y += offset.y;
            }
        });

        container.setPosition(body.position.x, body.position.y);

        // Attach physics
        // If we created body manually, we need to add it to world
        if (toyConfig.bodies) {
            this.matter.world.add(body);
        }

        this.matter.add.gameObject(container, body);

        // Store data on the body for collision logic
        (body as any).toyIndex = index;

        return body;
    }

    private dropToy() {
        if (this.dropCooldown || this.gameOver) return;

        this.dropCooldown = true;

        this.dropCooldown = true;

        const currentToy = TOYS[this.currentToyIdx];
        const scaleX = currentToy.scaleX || 1;
        const radius = currentToy.radius * scaleX; // Use effective width radius for clamping

        // Calculate relative X first
        let relativeX = this.mouseX - this.boardX;

        // Clamp relative X
        if (relativeX < radius + 5) relativeX = radius + 5;
        if (relativeX > BOARD_WIDTH - radius - 5) relativeX = BOARD_WIDTH - radius - 5;

        // Convert back to absolute for spawning
        this.spawnToy(this.boardX + relativeX, this.boardY + SPAWN_Y, this.currentToyIdx);
        this.playSound('drop');

        this.time.delayedCall(600, () => {
            this.setNextToy();
            this.dropCooldown = false;
        });
    }

    private handleCollisions(event: Phaser.Physics.Matter.Events.CollisionStartEvent) {
        const pairs = event.pairs;

        for (let i = 0; i < pairs.length; i++) {
            const bodyA = pairs[i].bodyA as Matter.Body;
            const bodyB = pairs[i].bodyB as Matter.Body;

            // Check labels (we stored index as string in label)
            // For compound bodies, we must check the parent's label
            const parentA = bodyA.parent;
            const parentB = bodyB.parent;

            if (parentA.label === parentB.label && !parentA.isStatic && !parentB.isStatic) {
                const tier = parseInt(parentA.label);

                if (tier < TOYS.length - 1) {
                    // Check if already processed
                    if (!(parentA as any).toRemove && !(parentB as any).toRemove) {
                        (parentA as any).toRemove = true;
                        (parentB as any).toRemove = true;

                        const midX = (parentA.position.x + parentB.position.x) / 2;
                        const midY = (parentA.position.y + parentB.position.y) / 2;

                        this.score += TOYS[tier].score;
                        this.config.onScoreChange(this.score);
                        this.playSound('merge');

                        // Remove bodies and their game objects
                        // In Phaser Matter, removing the GameObject usually removes the body too if linked
                        // But for compound bodies, the gameObject is linked to the parent body.
                        if ((parentA as any).gameObject) (parentA as any).gameObject.destroy();
                        if ((parentB as any).gameObject) (parentB as any).gameObject.destroy();

                        // Just to be safe, remove from world if not destroyed
                        this.matter.world.remove(parentA);
                        this.matter.world.remove(parentB);

                        this.spawnToy(midX, midY, tier + 1);
                    }
                }
            }
        }
    }

    private gameOverTimer: number = 0;

    private checkGameOver() {
        if (this.gameOver) return;

        // Get all bodies
        const bodies = this.matter.world.getAllBodies();
        const thresholdY = this.boardY + DANGER_LINE_Y;

        let isDanger = false;

        for (const body of bodies) {
            if (!body.isStatic && !(body as any).toRemove) {
                // Check against absolute Y position of the danger line
                if (body.position.y < thresholdY) {
                    // Loose speed check to allow for some jitter, but ignore falling pieces
                    if (body.speed < 1.0) {
                        isDanger = true;
                        break;
                    }
                }
            }
        }

        if (isDanger) {
            this.gameOverTimer += 500; // We call this every 500ms
            console.log('Danger! Timer:', this.gameOverTimer);
            if (this.gameOverTimer >= 2000) { // 2 seconds threshold
                console.log('GAME OVER TRIGGERED (Time Limit)');
                this.endGame();
            }
        } else {
            this.gameOverTimer = 0;
        }
    }

    private endGame() {
        this.gameOver = true;
        this.config.onGameOver();
    }

    private restartGame() {
        this.scene.restart();
    }

    private playSound(type: 'drop' | 'merge') {
        // Use Phaser's shared AudioContext to avoid hitting browser limits
        if (this.sound instanceof Phaser.Sound.WebAudioSoundManager) {
            const audioCtx = this.sound.context;

            // Ensure context is running (it might be suspended if no user interaction yet)
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const now = audioCtx.currentTime;

            if (type === 'drop') {
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'merge') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(600, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            }
        }
    }
}
