import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { BaseMenuView } from "../base/BaseMenuView.ts";
import Konva from "konva";

/**
 * LevelSelectScreenView - Renders the level select screen with image-based level representations
 * Levels are displayed as images (similar to enemy sprites) positioned freely on the background
 */
export class LevelSelectScreenView extends BaseMenuView {
    private onLevelSelect: (level: number) => void;
    private onBackClick: () => void;
    private levelGroups: Map<number, Konva.Group> = new Map();
    private levelHighlights: Map<number, Konva.Image> = new Map();

    constructor(onLevelSelect: (level: number) => void, onBackClick: () => void) {
        super("#0f0f23", false);
        this.onLevelSelect = onLevelSelect;
        this.onBackClick = onBackClick;
        this.buildLayout(); // Build after callbacks are assigned
        this.group.visible(true);
    }

    protected buildLayout(): void {
        // Create title
        const title = this.createTitle("SELECT LEVEL", {
            fontSize: 48,
            fontFamily: "Arial",
            fill: "white"
        });
        this.positionElement(title, STAGE_WIDTH / 2, 80);

        // Create level images positioned in 
        // Layout: distribute levels across the screen for free positioning
        const positions = [
            { x: 200, y: 250 },
            { x: 600, y: 250 },
            { x: 1000, y: 250 },
            { x: 400, y: 500 },
            { x: 800, y: 500 },
        ];

        for (let level = 1; level <= 5; level++) {
            const pos = positions[level - 1] || { x: 640, y: 360 };
            this.loadLevelImage(level, pos.x, pos.y);
        }

        // Create back button
        const backBtn = this.createButton({
            text: "BACK",
            fontFamily: "Arial",
            width: 150,
            height: 50,
            fill: "#666",
            hoverFill: "#888",
            stroke: "#333",
            strokeWidth: 2,
            fontSize: 20,
            onClick: this.onBackClick,
        });
        this.positionElement(backBtn, STAGE_WIDTH / 2, STAGE_HEIGHT - 80);
    }

    /**
     * Load and display a level image from /public
     * Expects image files named level1.png, level2.png,...
     */
    private loadLevelImage(level: number, x: number, y: number): void {
        const imagePath = `./level${level}.png`;
        
        Konva.Image.fromURL(imagePath, (image) => {
            const levelGroup = new Konva.Group({
                width: 120,
                height: 120,
                listening: true,
                x,
                y,
            });
            levelGroup.offsetX(60);
            levelGroup.offsetY(60);

            image.width(120);
            image.height(120);
            image.x(0);
            image.y(0);

            levelGroup.add(image);

            levelGroup.on("click", () => {
                this.onLevelSelect(level);
            });

            levelGroup.on("mouseenter", () => {
                //image.opacity(0.8);
                const highlightPath = `./level${level}_highlight.png`;
                Konva.Image.fromURL(highlightPath, (highlight) => {

                    highlight.width(120);
                    highlight.height(120);
                    
                    highlight.globalCompositeOperation("lighter");
                    levelGroup.add(highlight);
                    this.levelHighlights.set(level, highlight);
                });

                levelGroup.getLayer()?.batchDraw();
            });

            levelGroup.on("mouseleave", () => {
                //image.opacity(1);
                const highlight = this.levelHighlights.get(level);
                if (highlight) {
                    highlight.destroy();
                    this.levelHighlights.delete(level);
                }

                levelGroup.getLayer()?.batchDraw();
            });

            this.group.add(levelGroup);
            this.levelGroups.set(level, levelGroup);
            this.group.getLayer()?.batchDraw();
        });
    }
}
