// src/screens/GameScreen/GameScreenView.ts
import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import Enemy from "../../objects/Enemy";
// import Prompt from "../../objects/Prompt";

export class GameScreenView implements View {
    private group: Konva.Group;
    private typedText: Konva.Text;
    enemyContainer: Konva.Group;
    private hudContainer: Konva.Group;
    enemies = new Map<number, Enemy>();
    private targetedIds: Set<number> = new Set();

    // Projection constants (tweak to taste)
    private readonly SCALE_K   = 60;                  // scale ≈ SCALE_K / z
    private readonly DROP_K    = 900;                 // vertical drop ≈ DROP_K / z
    private readonly UNITS_X   = 120;                 // world X units → px at z reference
    private readonly HORIZON_Y = STAGE_HEIGHT * 0.35;
    private readonly NEAR_CLIP = 1.0;                 // safety clamp

    constructor() {
        this.group = new Konva.Group({ visible: false });

        // Background at the very bottom
        // let bg = new Konva.Rect({
        //   x: 0, y: 0, width: STAGE_WIDTH, height: STAGE_HEIGHT, fill: "#1a1a2e",
        // });
        Konva.Image.fromURL("/space.png", (bg) => {
            this.group.add(bg);
            bg.moveToBottom();
        });

        // Containers layered: bg (bottom) -> enemies -> hud (top)
        this.enemyContainer = new Konva.Group();
        this.hudContainer = new Konva.Group();

        // this.group.add(bg);
        this.group.add(this.enemyContainer);
        this.group.add(this.hudContainer);

        // HUD: center text
        this.typedText = new Konva.Text({
            x: STAGE_WIDTH / 2, y: STAGE_HEIGHT / 2, text: "",
            fontSize: 32, fontFamily: "Courier New", fill: "white", align: "center", listening: false,
        });
        this.typedText.offsetX(this.typedText.width() / 2);
        this.typedText.offsetY(this.typedText.height() / 2);
        this.hudContainer.add(this.typedText);
    }

    // Spawn enemy visuals (no world coords here yet)
    spawnEnemyVisuals(En: Enemy): number {
        this.enemyContainer.add(En.image);
        this.enemyContainer.add(En.prompt.image);
        this.enemies.set(En.id, En);
        this.group.getLayer()?.draw();
        return En.id;
    }


    /** Project world (x,z) to screen (x,y,scale) and apply to enemy visuals. */
    updateEnemyTransform(id: number, worldX: number, distanceZ: number): void {
        const En = this.enemies.get(id);
        if (!En) return;

        // 1/z style perspective
        const z = Math.max(this.NEAR_CLIP, distanceZ);

        // scale grows as z shrinks; clamp so it doesn't explode near z≈0
        const sRaw = this.SCALE_K / z;               // e.g. z=60 -> 2.0, z=40 -> 3.0, z=20 -> 6.0
        const s = Math.min(6, Math.max(0.6, sRaw));  // clamp to [0.6, 6]

        // X spreads a bit with scale to enhance perspective
        const screenX = STAGE_WIDTH / 2 + worldX * this.UNITS_X * (0.75 + 0.25 * s);

        // Y “drops” from the horizon as they approach (bigger when closer)
        const screenY = this.HORIZON_Y + this.DROP_K / z;

        // Apply to enemy visual
        En.image.x(screenX);
        En.image.y(screenY);
        En.image.scale({ x: s, y: s });

        // Prompt directly under the circle, following scale
        En.prompt.restNode.x(En.prompt.typedNode.width());
        const width = En.prompt.typedNode.width() + En.prompt.restNode.width();
        const height = Math.max(En.prompt.typedNode.height(), En.prompt.restNode.height());
        const g = En.prompt.image;
        g.width(width); g.height(height);
        g.offsetX(width / 2); g.offsetY(height / 2);

        En.prompt.x = screenX;
        En.prompt.y = screenY + 55 * s;

        this.group.getLayer()?.batchDraw();
    }

    updateEnemyProgress(id: number, matchedText: string, unmatchedText: string): void {
        const En = this.enemies.get(id);
        if (!En) return;
        En.prompt.typedNode.text(matchedText);
        En.prompt.restNode.text(unmatchedText);
        En.prompt.restNode.x(En.prompt.typedNode.width());
        this.group.getLayer()?.batchDraw();
    }

    destroyEnemy(id: number): void {
        const En = this.enemies.get(id);
        if (!En) return;
        En.prompt.image.destroy();
        En.destroy();
        this.enemies.delete(id);
        this.targetedIds.delete(id);
        this.group.getLayer()?.draw();
    }

    setTarget(ids: number[]): void {
        // Clear old targets
        for (const oldId of this.targetedIds) {
            if (this.enemies.get(oldId)) {
                const old = this.enemies.get(oldId)!;
                if (old.type === "circle") {
                    const circle = old.image.findOne<Konva.Circle>('Circle');
                    if (circle) {
                        circle.shadowBlur(0);
                        circle.shadowColor("transparent");
                        circle.stroke("#0b5ea8");
                        circle.strokeWidth(4);
                    }
                }
            }
        }
        
        // Update targeted IDs
        this.targetedIds.clear();
        for (const id of ids) {
            this.targetedIds.add(id);
        }

        // Highlight new targets
        for (const id of ids) {
            const En = this.enemies.get(id);
            if (En && En.type === "circle") {
                const circle = En.image.findOne<Konva.Circle>('Circle');
                if (circle) {
                    const highlight =  "rgba(255, 213, 74, 0.8)";
                    circle.stroke(highlight);
                    circle.strokeWidth(4);
                }
            }
        }
        this.group.getLayer()?.batchDraw();
    }

    updateText(text: string): void {
        this.typedText.text(text);
        this.typedText.offsetX(this.typedText.width() / 2);
        this.group.getLayer()?.draw();
    }

    /** Set draw order so closer enemies render on top.
     *  Pass IDs sorted with closest first. Prompts are kept above their circles. */
    setDrawOrder(idsClosestFirst: number[]): void {
        let z = 0;
        const idsFarthestFirst = [...idsClosestFirst].reverse();

        for (const id of idsFarthestFirst) {
            const En = this.enemies.get(id);
            if (!En) continue;
            En.image.zIndex(z++);
            En.prompt.image.zIndex(z++);
        }

        this.enemyContainer.getLayer()?.batchDraw();
    }

    /**
     * Highlight the closest matching enemy with a green border
     */
    highlightClosestMatch(closestId: number | null): void {
        // Clear all green highlights first
        for (const En of this.enemies.values()) {
            if (En.type === "circle") {
                const circle = En.image.findOne<Konva.Circle>('Circle');
                if (circle) {
                    // Check if this enemy is in targetedIds to maintain yellow highlight
                    const isTargeted = this.targetedIds.has(En.id);
                    if (isTargeted) {
                        circle.stroke("rgba(255, 213, 74, 0.8)"); // Yellow for targeted
                    } else {
                        circle.stroke("#0b5ea8"); // Default blue
                    }
                    circle.strokeWidth(4);
                }
            }
        }

        // Highlight the closest matching enemy with green
        if (closestId !== null) {
            const En = this.enemies.get(closestId);
            if (En && En.type === "circle") {
                const circle = En.image.findOne<Konva.Circle>('Circle');
                if (circle) {
                    circle.stroke("#00ff00"); // Green for closest match
                    circle.strokeWidth(6);
                }
            }
        }

        this.group.getLayer()?.batchDraw();
    }

    show(): void { this.group.visible(true); this.group.getLayer()?.draw(); }
    hide(): void { this.group.visible(false); this.group.getLayer()?.draw(); }
    getGroup(): Konva.Group { return this.group; }
}
