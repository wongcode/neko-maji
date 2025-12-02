import Phaser from 'phaser';
import { ToyVisual } from './ToyVisual';
import { ToyConfig } from '../../constants';

export class SimpleToyVisual implements ToyVisual {
    private getBallTexture(scene: Phaser.Scene, radius: number, color: number): string {
        const key = `ball_${radius}_${color}`;
        if (scene.textures.exists(key)) return key;

        const diameter = radius * 2;
        // Create a canvas texture
        const texture = scene.textures.createCanvas(key, diameter, diameter);
        if (!texture) return key; // Should not happen

        const ctx = texture.getContext();
        const centerX = radius;
        const centerY = radius;

        // 3D Ball Gradient
        // Light source top-left (offset from center)
        const lightX = radius * 0.7;
        const lightY = radius * 0.7;

        // Radial gradient from light source
        const grd = ctx.createRadialGradient(lightX, lightY, radius * 0.1, centerX, centerY, radius);

        const c = Phaser.Display.Color.IntegerToColor(color) as any;

        // Calculate gradient colors
        const lightHex = `rgb(${Math.min(255, c.r + 60)}, ${Math.min(255, c.g + 60)}, ${Math.min(255, c.b + 60)})`;
        const mainHex = `rgb(${c.r}, ${c.g}, ${c.b})`;
        const darkHex = `rgb(${Math.max(0, c.r - 60)}, ${Math.max(0, c.g - 60)}, ${Math.max(0, c.b - 60)})`;

        grd.addColorStop(0, lightHex);     // Highlight
        grd.addColorStop(0.4, mainHex);    // Body
        grd.addColorStop(1, darkHex);      // Shadow

        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        texture.refresh();
        return key;
    }

    create(scene: Phaser.Scene, config: ToyConfig): Phaser.GameObjects.Container {
        const container = scene.add.container(0, 0);

        let shapeVisual: Phaser.GameObjects.Sprite;
        let borderVisual: Phaser.GameObjects.Shape;
        let width = config.radius * 2;
        let height = config.radius * 2;

        // 1. Create Base Shape & Border using 3D Gradient Texture
        const textureKey = this.getBallTexture(scene, config.radius, config.color);

        // Use a sprite with the generated texture
        shapeVisual = scene.add.sprite(0, 0, textureKey);

        if (config.shape === 'oval') {
            shapeVisual.setScale(config.scaleX || 1, config.scaleY || 1);
            width = config.radius * 2 * (config.scaleX || 1);
            height = config.radius * 2 * (config.scaleY || 1);
            borderVisual = scene.add.ellipse(0, 0, width, height);
        } else {
            // Default to circle
            borderVisual = scene.add.circle(0, 0, config.radius);
        }

        // 2. Create Shine (Common)
        // Use a container for the shine to allow for complex effects (glow + core)
        const shine = scene.add.container(0, 0);

        // Soft glow background
        const shineGlow = scene.add.circle(0, 0, config.radius * 0.25, 0xffffff, 0.4);

        // Twinkle Star (4-pointed)
        const shineStar = scene.add.graphics();
        shineStar.fillStyle(0xffffff, 1);

        const r = config.radius * 0.25; // Outer radius of star
        const rInner = r * 0.2; // Inner radius (thickness)

        shineStar.beginPath();
        // Top point
        shineStar.moveTo(0, -r);
        shineStar.lineTo(rInner, -rInner);
        // Right point
        shineStar.lineTo(r, 0);
        shineStar.lineTo(rInner, rInner);
        // Bottom point
        shineStar.lineTo(0, r);
        shineStar.lineTo(-rInner, rInner);
        // Left point
        shineStar.lineTo(-r, 0);
        shineStar.lineTo(-rInner, -rInner);
        shineStar.closePath();
        shineStar.fillPath();

        shine.add([shineGlow, shineStar]);

        // Add sparkle animation
        // 1. Pulse scale
        scene.tweens.add({
            targets: shine,
            scale: { from: 0.8, to: 1.2 },
            alpha: { from: 0.7, to: 1 },
            duration: 2000 + Math.random() * 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 2. Rotate star slightly
        scene.tweens.add({
            targets: shineStar,
            angle: { from: -15, to: 15 },
            duration: 3000 + Math.random() * 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 3. Configure Border
        borderVisual.setStrokeStyle(2, 0x000000, 0.1);

        // 4. Create Emoji (Common)
        const fontSize = config.radius * 1.0;
        const emoji = scene.add.text(0, 0, config.emoji, {
            fontSize: `${fontSize}px`,
            fontFamily: 'sans-serif',
            padding: { x: 0, y: 0 }
        }).setOrigin(0.5);

        container.add([shapeVisual, borderVisual, emoji, shine]);

        // Keep shine stationary relative to the light source (top-left)
        // by counter-rotating its position
        const shineOffsetX = -config.radius * 0.3;
        const shineOffsetY = -config.radius * 0.3;

        const updateShine = () => {
            if (!container.scene) {
                scene.events.off('update', updateShine);
                return;
            }
            // Rotate the offset by -container.rotation to keep it fixed in world space
            const angle = -container.rotation;
            const x = shineOffsetX * Math.cos(angle) - shineOffsetY * Math.sin(angle);
            const y = shineOffsetX * Math.sin(angle) + shineOffsetY * Math.cos(angle);
            shine.setPosition(x, y);
        };

        scene.events.on('update', updateShine);
        container.on('destroy', () => {
            scene.events.off('update', updateShine);
        });

        return container;
    }
}
