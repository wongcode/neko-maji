import Phaser from 'phaser';
import { GameConfig } from '../Game';
import { ToyRenderer } from '../objects/ToyRenderer';
import { MoodMeter } from '../objects/MoodMeter';

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

    // Mood Meter
    private mood: number = 0;
    private readonly MAX_MOOD: number = 100;
    private moodMeter!: MoodMeter;

    // Visuals
    private aimLine!: Phaser.GameObjects.Graphics;
    private ghostToy!: Phaser.GameObjects.Container;
    private dangerLine!: Phaser.GameObjects.Graphics;
    private wallGraphics!: Phaser.GameObjects.Graphics;

    // Pause System
    private toysGroup!: Phaser.GameObjects.Group;
    private pauseMenuContainer?: Phaser.GameObjects.Container;
    private isPaused: boolean = false;

    constructor(config: GameConfig) {
        super('MainScene');
        this.config = config;
    }

    preload() {
        this.load.spritesheet('cat_dozing', 'assets/tangram_cat_dozing.png', {
            frameWidth: 510,
            frameHeight: 340
        });
    }

    create() {
        // Reset State
        this.score = 0;
        this.gameOver = false;
        this.dropCooldown = false;
        this.isCatAwake = false;
        this.isPaused = false;
        this.blockNextDrop = false;
        this.pauseMenuContainer = undefined;
        this.config.onScoreChange(0);

        // Ensure physics is running (in case it was paused)
        this.matter.world.resume();

        // Initial Layout Calculation
        this.updateLayout();

        // Scale Event
        this.scale.on('resize', this.handleResize, this);

        // Initialize Toys Group
        this.toysGroup = this.add.group();

        // Initialize Toys
        this.nextToyIdx = this.getRandomToyIndex();
        this.setNextToy();

        // Initialize mouseX to center of board (will be updated by layout)
        this.mouseX = this.scale.width / 2;

        // Graphics
        this.createVisuals();

        // Vanity Animation: Dozing Cat
        this.anims.create({
            key: 'doze_start',
            frames: this.anims.generateFrameNumbers('cat_dozing', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: 0
        });

        this.anims.create({
            key: 'sleeping',
            frames: this.anims.generateFrameNumbers('cat_dozing', { start: 4, end: 5 }),
            frameRate: 6,
            repeat: -1,
            yoyo: true
        });

        this.anims.create({
            key: 'dozing_cycle',
            frames: this.anims.generateFrameNumbers('cat_dozing', { frames: [2, 1] }),
            frameRate: 1,
            repeat: -1,
            yoyo: true
        });

        const cat = this.add.sprite(0, 0, 'cat_dozing');
        cat.setOrigin(0.5, 1); // Anchor at bottom center
        cat.play('doze_start');
        cat.chain('sleeping');
        cat.setScale(0.75); // 3x larger than previous 0.25
        cat.setDepth(200); // Ensure cat is above pause menu (depth 100)

        // Interactivity
        cat.setInteractive({ useHandCursor: true });
        cat.on('pointerover', () => {
            cat.play('dozing_cycle');
        });
        cat.on('pointerout', () => {
            if (this.isCatAwake) {
                cat.stop();
                cat.setFrame(0);
            } else {
                cat.play('sleeping');
            }
        });
        cat.on('pointerdown', () => {
            this.blockNextDrop = true;
            this.togglePause();
        });

        // Position at top center of screen, independent of board
        // We'll update this in handleResize as well if needed, but for now just center it
        cat.setName('vanity_cat');

        // Initial layout update to position everything correctly
        this.updateLayout();


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
            if (!this.gameOver && !this.blockNextDrop) {
                this.dropToy();
            }
            this.blockNextDrop = false; // Reset flag
        });

        // Collisions
        this.matter.world.on('collisionstart', this.handleCollisions, this);

        // Game Over Check Loop
        this.time.addEvent({ delay: 500, callback: this.checkGameOver, callbackScope: this, loop: true });

        // Restart Listener
        this.events.on('restart', this.restartGame, this);

        // ESC Key to Pause
        this.input.keyboard?.on('keydown-ESC', () => {
            this.togglePause();
        });

        // Keyboard Controls
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.keys = this.input.keyboard.addKeys({
                A: Phaser.Input.Keyboard.KeyCodes.A,
                D: Phaser.Input.Keyboard.KeyCodes.D,
                SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE
            }) as any;

            // Space to Drop
            this.input.keyboard.on('keydown-SPACE', () => {
                if (!this.gameOver && !this.isPaused && !this.blockNextDrop) {
                    this.dropToy();
                }
            });
        }
    }

    private blockNextDrop: boolean = false;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys!: { A: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key; SPACE: Phaser.Input.Keyboard.Key };

    // Movement Physics
    private currentVelocity: number = 0;
    private readonly ACCELERATION = 0.05; // Reduced from 0.5
    private readonly MAX_SPEED = 10; // Reduced from 15
    private readonly FRICTION = 0.2; // Increased from 0.85 (more slide, but slower accel)
    // Actually, for friction as a multiplier:
    // 0.9 = slippery (glides)
    // 0.5 = stops quickly
    // Let's try 0.85 for a balance.

    private handleResize(gameSize: Phaser.Structs.Size) {
        this.updateLayout();
        this.createVisuals(); // Re-draw visuals
    }

    private updateLayout() {
        const { width, height } = this.scale;

        // Store old position to calculate delta
        const oldBoardX = this.boardX;
        const oldBoardY = this.boardY;

        // Calculate zoom to fit board AND mood meter with some padding
        const padding = 20;
        const gap = 20;
        // We need to access static constants or instance properties if we haven't created it yet?
        // Actually, we create visuals (and mood meter) in createVisuals which is called in create() BEFORE updateLayout is called?
        // Wait, create() calls updateLayout() at line 59.
        // createVisuals() is called at line 75.
        // So on first updateLayout, moodMeter might not exist.
        // But we need dimensions for layout.
        // Let's hardcode dimensions here or create it earlier?
        // Or just use the constants from MoodMeter class if they were static.
        // They are instance readonly.
        const METER_WIDTH = 16;
        const METER_HEIGHT = 400;

        const totalContentWidth = METER_WIDTH + gap + BOARD_WIDTH;

        const targetWidth = totalContentWidth + padding * 2;
        let zoom = 1;

        if (width < targetWidth) {
            zoom = width / targetWidth;
        }

        // Apply zoom to camera
        this.cameras.main.setZoom(zoom);
        this.cameras.main.centerOn(width / 2, height / 2);

        // Recalculate positions
        // We want to center the GROUP (Meter + Gap + Board)
        const startX = (width - totalContentWidth) / 2;

        // Meter Position
        // const meterX = startX + this.METER_WIDTH / 2; 
        // We position the container at top-left of its area

        // Board Position
        this.boardX = startX + METER_WIDTH + gap;
        this.boardY = (height - BOARD_HEIGHT) / 2;

        // Update Meter Position
        if (this.moodMeter) {
            this.moodMeter.setPosition(startX, (height - METER_HEIGHT) / 2);
        }

        // Calculate Delta
        const diffX = this.boardX - oldBoardX;
        const diffY = this.boardY - oldBoardY;

        // Shift existing toys if board moved (and it's not the first run)
        if (this.toysGroup && (diffX !== 0 || diffY !== 0)) {
            // We only shift if oldBoardX was not 0 (or if we are sure it's a resize)
            // Actually, even if it was 0, if toys exist, they were placed relative to 0.
            // So shifting them is correct.

            this.toysGroup.getChildren().forEach((child: any) => {
                if (child.body) {
                    // Move the physics body
                    this.matter.body.translate(child.body, { x: diffX, y: diffY });
                    // The GameObject position will be updated automatically by Phaser-Matter sync
                }
            });

            // Also shift mouseX so the ghost doesn't jump
            this.mouseX += diffX;
        }

        // If we are zoomed out, the effective visible height is larger.
        // But we want the board to be visible.

        // Update Physics Bounds
        const wallThickness = 4;
        this.matter.world.setBounds(
            this.boardX + wallThickness,
            -2000, // Allow pieces to stack high
            BOARD_WIDTH - (wallThickness * 2),
            this.boardY + BOARD_HEIGHT - wallThickness + 2000,
            60, true, true, false, true
        );

        // Update Vanity Cat Scale
        const cat = this.children.getByName('vanity_cat') as Phaser.GameObjects.Sprite;
        if (cat) {
            // Base scale is 0.75
            // If zoomed out (small screen), we might need to shrink it further 
            // OR the camera zoom handles it?
            // The camera zoom handles everything in the scene.
            // BUT the user said "the cat needs to shrink if im on iphone as its halfway into the danger line".
            // If we zoom out the whole scene, the cat shrinks with it.
            // However, on a narrow screen (iPhone), the aspect ratio is tall.
            // The board fits width-wise (zoomed out).
            // The cat is at Y=260. The Danger Line is at boardY + 150.
            // If boardY shifts down (centering), the cat might overlap.

            // Let's adjust cat position relative to boardY
            // Cat should be above the danger line.
            // Danger Line Y = this.boardY + DANGER_LINE_Y (150)
            // Cat Y was 260 absolute.
            // Let's place cat relative to board top?
            // Board Top = this.boardY.
            // Cat should be above board? Or inside?
            // "vanity animation... on the top of the screen"

            // If we want it at the top of the screen, we should use 0 (relative to camera).
            // But with camera zoom/center, "top of screen" in world coordinates changes.
            // Let's stick to world coordinates.

            // If we simply scale the cat based on zoom, it might help.
            // User: "the cat needs to shrink if im on iphone"
            // Let's apply an extra scale factor if zoom < 1

            const baseScale = 0.75;
            // If zoom is small, maybe shrink cat more?
            // Or just position it better.

            // Let's position cat relative to the board top, but clamped to screen top.
            // Actually, let's just scale it down if width is small.
            if (zoom < 1) {
                // Aggressively shrink the cat on small screens
                cat.setScale(baseScale * zoom * 0.5);
            } else {
                cat.setScale(baseScale);
            }

            // Re-center cat
            // Position it near the top of the visible screen
            // Since camera is centered at (width/2, height/2) and zoomed:
            const visibleTop = (height / 2) - (height / (2 * zoom));

            // We want the TOP of the cat to be at visibleTop + padding.
            // Since origin is (0.5, 1) [bottom], we need to place the cat at:
            // y = visibleTop + padding + catHeight
            // We use the max height (frame height) so it doesn't jump when animation changes
            const catHeight = 340 * cat.scaleY;

            console.log('UpdateLayout: Zoom:', zoom, 'VisibleTop:', visibleTop, 'CatHeight:', catHeight);
            console.log('Setting Cat Y to:', visibleTop + 10 + catHeight);

            cat.setPosition(width / 2, visibleTop + 10 + catHeight);
        }
    }

    update() {
        if (this.gameOver || this.isPaused) return;

        // Keyboard Movement with Inertia
        let inputActive = false;

        if (this.cursors.left.isDown || this.keys.A.isDown) {
            this.currentVelocity -= this.ACCELERATION;
            inputActive = true;
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            this.currentVelocity += this.ACCELERATION;
            inputActive = true;
        }

        // Apply Friction if no input
        if (!inputActive) {
            this.currentVelocity *= this.FRICTION;
            // Snap to 0 if very slow
            if (Math.abs(this.currentVelocity) < 0.1) {
                this.currentVelocity = 0;
            }
        }

        // Clamp Velocity
        if (this.currentVelocity > this.MAX_SPEED) this.currentVelocity = this.MAX_SPEED;
        if (this.currentVelocity < -this.MAX_SPEED) this.currentVelocity = -this.MAX_SPEED;

        // Apply Velocity
        if (Math.abs(this.currentVelocity) > 0) {
            this.mouseX += this.currentVelocity;

            // Clamp mouseX to board bounds
            if (this.mouseX < this.boardX) {
                this.mouseX = this.boardX;
                this.currentVelocity = 0; // Stop hitting wall
            }
            if (this.mouseX > this.boardX + BOARD_WIDTH) {
                this.mouseX = this.boardX + BOARD_WIDTH;
                this.currentVelocity = 0; // Stop hitting wall
            }
        }

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
        this.createMoodMeter();
    }

    private createMoodMeter() {
        if (!this.moodMeter) {
            this.moodMeter = new MoodMeter(this, 0, 0);
        }
        this.updateMoodMeter();
    }

    private updateMoodMeter() {
        if (this.moodMeter) {
            this.moodMeter.updateMood(this.mood, this.MAX_MOOD);
        }
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

    private isCatAwake: boolean = false;

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

            if (toyConfig.scaleX || toyConfig.scaleY) {
                this.matter.body.scale(body as any, toyConfig.scaleX || 1, toyConfig.scaleY || 1);
            }

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
        this.toysGroup.add(container);

        // Store data on the body for collision logic
        (body as any).toyIndex = index;

        // Check for "Box" (Index 8) to wake up the cat
        if (index === 8) {
            this.isCatAwake = true;
            const cat = this.children.getByName('vanity_cat') as Phaser.GameObjects.Sprite;
            if (cat) {
                // User requested "transition to frame 1 and stay still being awake"
                // We stop any current animation and set the frame.
                cat.stop();
                cat.setFrame(0); // Using frame 0 as "awake" based on sprite sheet logic (0 is usually start)
            }
        }

        return body;
    }

    private dropToy() {
        if (this.dropCooldown || this.gameOver || this.isPaused) return;

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

                        // Increment Mood
                        // "each merge adds to the meter equivalent to the points added to the score"
                        // Points = TOYS[tier].score
                        this.mood += TOYS[tier].score;
                        if (this.mood > this.MAX_MOOD) this.mood = this.MAX_MOOD;
                        this.updateMoodMeter();

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
        if (this.gameOver || this.isPaused) return;

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

    private createPauseMenu() {
        const { width, height } = this.scale;
        this.pauseMenuContainer = this.add.container(0, 0);
        this.pauseMenuContainer.setVisible(false);
        this.pauseMenuContainer.setDepth(100); // Ensure it's on top

        // 1. Overlay
        // Use a large rectangle to cover the screen
        // Since camera zooms, we need to cover the visible area or just make it huge
        // Camera is centered.
        // We need to account for zoom. If we add to container, it scales with camera?
        // Yes, if container is in scene.
        // But if camera is zoomed out, we need a bigger overlay?
        // Actually, if we add it to the scene, it's in world space.
        // If we want it to be fixed to the camera (HUD), we should use scrollFactor(0).
        // But MainScene camera moves/zooms.
        // Let's just make it huge.
        const overlay = this.add.rectangle(width / 2, height / 2, width * 4, height * 4, 0x000000, 0.8);
        overlay.setInteractive(); // Block clicks
        this.pauseMenuContainer.add(overlay);

        // 2. Buttons
        const resumeBtn = this.createButton(width / 2, height / 2 - 60, 'Resume', () => this.togglePause(), '▶');
        const restartBtn = this.createButton(width / 2, height / 2 + 60, 'Restart', () => this.scene.restart(), '↻');

        this.pauseMenuContainer!.add([resumeBtn, restartBtn]);

        // 3. Infographic
        // Display toys in a row/grid at the bottom

        // Responsive Layout
        const isSmallScreen = width < 600;
        const itemsPerRow = isSmallScreen ? Math.ceil(TOYS.length / 2) : TOYS.length;
        const rows = isSmallScreen ? 2 : 1;

        const totalWidth = width - 40;
        const gap = totalWidth / itemsPerRow;
        const startX = 20 + gap / 2;

        // Adjust startY based on rows
        // If 2 rows, move up
        const rowHeight = 80;
        const startY = height - 100 - (rows - 1) * (rowHeight / 2);

        TOYS.forEach((toy, index) => {
            // Create a small visual for the toy
            const visual = ToyRenderer.createToyVisuals(this, toy);

            // Normalize size
            const targetRadius = 25;
            const baseScale = toy.scaleX || 1;
            const currentRadius = toy.radius * baseScale;
            const scale = targetRadius / currentRadius;

            visual.setScale(scale);

            // Calculate Row and Col
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;

            // Position
            const x = startX + col * gap;
            const y = startY + row * rowHeight;

            visual.setPosition(x, y);
            this.pauseMenuContainer!.add(visual);

            // Add arrow to next toy
            // Only add if not the last item overall
            // AND not the last item in the row (unless we want to connect rows, but that looks messy)
            if (index < TOYS.length - 1) {
                // Check if this is the last item in the row
                if (col < itemsPerRow - 1) {
                    const arrow = this.add.text(x + gap / 2, y, '→', {
                        fontSize: '32px',
                        fontFamily: 'Arial',
                        color: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 4
                    }).setOrigin(0.5);
                    this.pauseMenuContainer!.add(arrow);
                }
            }
        });
    }

    private createButton(x: number, y: number, text: string, onClick: () => void, icon?: string): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        // Style constants from CSS
        const bgColor = 0xff7043;
        const shadowColor = 0xd84315;
        const width = 200;
        const height = 60;
        const radius = 30;

        // Shadow (offset y+6)
        const shadow = this.add.graphics();
        shadow.fillStyle(shadowColor, 1);
        shadow.fillRoundedRect(-width / 2, -height / 2 + 6, width, height, radius);

        // Background
        const bg = this.add.graphics();
        bg.fillStyle(bgColor, 1);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

        // Content Container (for centering text + icon)
        const content = this.add.container(0, 0);

        // Create objects first to get dimensions
        let iconObj: Phaser.GameObjects.Text | undefined;
        let iconWidth = 0;
        const spacing = 10;

        if (icon) {
            iconObj = this.add.text(0, 0, icon, {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ffffff'
            }).setOrigin(0.5);
            iconWidth = iconObj.width;
        }

        const label = this.add.text(0, 0, text, {
            fontSize: '24px',
            fontFamily: '"Fredoka One", cursive',
            color: '#ffffff'
        }).setOrigin(0.5);
        const labelWidth = label.width;

        // Calculate total width and starting position
        const totalWidth = iconWidth + (icon ? spacing : 0) + labelWidth;
        const startX = -totalWidth / 2;

        // Position elements
        if (iconObj) {
            iconObj.x = startX + iconWidth / 2;
            // Adjust Y for vertical alignment if needed (Arial vs Fredoka)
            iconObj.y = 2;
            content.add(iconObj);
        }

        label.x = startX + iconWidth + (icon ? spacing : 0) + labelWidth / 2;
        content.add(label);

        container.add([shadow, bg, content]);

        // Interactivity
        // We need a hit area. Graphics don't have automatic hit areas.
        // Use a rectangle shape for hit area
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.blockNextDrop = true;
                // Press effect
                bg.y += 6;
                content.y += 6;
            })
            .on('pointerup', () => {
                // Release effect
                bg.y -= 6;
                content.y -= 6;
                onClick();
            })
            .on('pointerout', () => {
                // Reset if dragged out
                bg.y = 0;
                content.y = 0;
            });

        return container;
    }

    private togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.game.events.emit('pause');
            this.matter.world.pause();
            // this.toysGroup.setVisible(false); // User requested to keep pieces visible

            // Create menu if not exists
            if (!this.pauseMenuContainer) {
                this.createPauseMenu();
            }
            // Now it must exist
            if (this.pauseMenuContainer) {
                this.pauseMenuContainer.setVisible(true);

                // Ensure menu is centered on current camera view
                const { width, height } = this.scale;
                // Actually, if camera is zoomed/centered, (0,0) of world is not (0,0) of screen.
                // But our container is at (0,0).
                // If we want the menu to cover the screen, we should position the container at the camera center?
                // Or use scrollFactor(0)?
                // Container doesn't support scrollFactor on children easily in v3.60?
                // Actually `container.setScrollFactor(0)` works.
                this.pauseMenuContainer.setScrollFactor(0);
            }

            // Also need to scale the container to counteract zoom?
            // If camera zoom is 0.5, UI will look small if scrollFactor is 0?
            // No, scrollFactor 0 means it ignores camera movement.
            // But zoom? `setScrollFactor` usually ignores zoom too in Phaser 3?
            // Let's check. Usually UI scenes are better.
            // If scrollFactor is 0, it renders in screen space.
            // So we don't need to worry about zoom if we set scrollFactor(0).

            // Hide other UI if needed (aim line, ghost)
            this.aimLine.setVisible(false);
            if (this.ghostToy) this.ghostToy.setVisible(false);

        } else {
            this.game.events.emit('resume');
            this.matter.world.resume();
            // this.toysGroup.setVisible(true);
            if (this.pauseMenuContainer) {
                this.pauseMenuContainer.setVisible(false);
            }

            this.aimLine.setVisible(true);
            if (this.ghostToy) this.ghostToy.setVisible(true);
        }
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
