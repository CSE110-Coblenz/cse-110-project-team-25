import Konva from "konva";

export type EnemyVisualType = "circle" | "ufo" | "meteor";

/**
 * Factory for creating enemy visual representations.
 * Centralizes sprite creation, animation setup, and asset loading.
 */
export class EnemyVisualFactory {
    private static readonly ENEMY_SIZE = 80;
    
    private static readonly UFO_ANIMATIONS = {
        idle: [
            0, 0, 480, 220,
            480, 0, 480, 220,
            960, 0, 480, 220,
            1440, 0, 480, 220,
            1920, 0, 480, 220,
        ],
    };

    private static readonly METEOR_ANIMATIONS = {
        idle: [
            0, 0, 480, 480,    480, 0, 480, 480,   960, 0, 480, 480,
            1440, 0, 480, 480, 1920, 0, 480, 480,  2400, 0, 480, 480,
            3360, 0, 480, 480, 3840, 0, 480, 480,  4320, 0, 480, 480,
            4800, 0, 480, 480, 5280, 0, 480, 480,  5760, 0, 480, 480,
            6240, 0, 480, 480, 6720, 0, 480, 480,  7200, 0, 480, 480,
            7680, 0, 480, 480, 8160, 0, 480, 480,  8640, 0, 480, 480,
            9120, 0, 480, 480,
        ],
    };

    /**
     * Creates a Konva.Group visual for the specified enemy type.
     */
    static createVisual(type: EnemyVisualType): Konva.Group {
        const enemyGroup = new Konva.Group({ 
            width: this.ENEMY_SIZE, 
            height: this.ENEMY_SIZE 
        });

        switch (type) {
            case "circle":
                return this.createCircleVisual(enemyGroup);
            case "ufo":
                return this.createSpriteVisual(enemyGroup, "/ufo.png", this.UFO_ANIMATIONS, 15, 5);
            case "meteor":
                return this.createSpriteVisual(enemyGroup, "/meteor.png", this.METEOR_ANIMATIONS, 15, 20);
            default:
                return enemyGroup; // Empty group for unknown types
        }
    }

    private static createCircleVisual(group: Konva.Group): Konva.Group {
        const circle = new Konva.Circle({
            x: 0, 
            y: 0, 
            radius: this.ENEMY_SIZE / 2,
            fill: "#2aa1ff", 
            stroke: "#0b5ea8", 
            strokeWidth: 4,
        });
        group.add(circle);
        return group;
    }

    private static createSpriteVisual(
        group: Konva.Group, 
        imageSrc: string, 
        animations: Record<string, number[]>,
        frameRate: number,
        maxFrameIndex: number
    ): Konva.Group {
        // Add a temporary placeholder so something is visible immediately
        const placeholder = new Konva.Circle({
            x: 0,
            y: 0,
            radius: this.ENEMY_SIZE / 2,
            fill: "#444c", // semi-transparent
            stroke: "#888",
            strokeWidth: 2,
        });
        group.add(placeholder);

        const imageObj = new Image();
        imageObj.src = imageSrc;
        
        imageObj.onload = () => {
            const scale = Math.min(this.ENEMY_SIZE / 480, this.ENEMY_SIZE / 220);
            const sprite = new Konva.Sprite({
                x: -35,
                y: 0,
                scale: { x: scale, y: scale },
                offset: { x: (220 * scale) / 2, y: (480 * scale) / 2 },
                image: imageObj,
                animation: 'idle',
                animations: animations,
                frameRate: frameRate,
                frameIndex: Math.round(Math.random() * maxFrameIndex)
            });
            
            sprite.start();
            // Replace placeholder with actual sprite
            placeholder.destroy();
            group.add(sprite);
            group.getLayer()?.batchDraw?.();
        };
        
        return group;
    }
}