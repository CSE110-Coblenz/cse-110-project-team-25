import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../../constants.ts";
import { BaseMenuView } from "../../base/BaseMenuView.ts";
import type { planetName } from "../../../types.ts";

/**
 * BaseLevelSelectView - Base class for level selection screens
 * Provides common functionality for creating level buttons
 */
export abstract class BaseLevelSelectView extends BaseMenuView {
    protected onLevelSelect: (level: number) => void;
    protected onBackClick: () => void;
    protected onShopClick?: () => void;
    protected levelGroups: Map<number, Konva.Group> = new Map();
    protected planetType: planetName;

    constructor(onLevelSelect: (level: number) => void, onBackClick: () => void, planetType: planetName, onShopClick?: () => void) {
        super("#0f0f23", false, true);
        this.onLevelSelect = onLevelSelect;
        this.onBackClick = onBackClick;
        this.onShopClick = onShopClick;
        this.planetType = planetType;
        // Don't set visible(true) here - let show() handle it after layout is built
    }

    /**
     * Rebuild the entire layout. Clears previous children and rebuilds.
     */
    public rebuild(): void {
        // Preserve background (if present) and remove other children
        const bgNode = (this as any).background?.image;
        const children = this.group.getChildren().slice();
        for (const child of children) {
            if (bgNode && child === bgNode) continue;
            try {
                child.destroy();
            } catch (e) {
                // ignore
            }
        }
        this.levelGroups.clear();
        // Re-run layout build from subclass
        this.buildLayout();
        this.group.getLayer()?.batchDraw();
    }

    /**
     * Create a styled level button
     */
    protected createLevelButton(level: number, x: number, y: number, size: number = 100, isLocked: boolean = false): void {
        const levelGroup = new Konva.Group({
            x,
            y,
        });

        // Determine colors based on lock status
        const fillColor = isLocked ? "#1a1a2a" : "#2a2a4a";
        const strokeColor = isLocked ? "#3a3a5a" : "#4a4a8a";
        const hoverFill = isLocked ? "#1a1a2a" : "#3a3a6a";
        const hoverStroke = isLocked ? "#3a3a5a" : "#6a6aaa";
        const textColor = isLocked ? "#5a5a7a" : "white";

        // Create rounded rectangle background
        const rect = new Konva.Rect({
            width: size,
            height: size,
            offsetX: size / 2,
            offsetY: size / 2,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth: 3,
            cornerRadius: 15,
            listening: !isLocked,
        });

        // Create level number text
        const text = new Konva.Text({
            text: level.toString(),
            fontSize: 36,
            fontFamily: "Arial",
            fill: textColor,
            align: "center",
            verticalAlign: "middle",
            width: size,
            height: size,
            offsetX: size / 2,
            offsetY: size / 2,
            listening: false,
        });

        levelGroup.add(rect);
        levelGroup.add(text);

        // Add lock icon if locked
        if (isLocked) {
            const lockText = new Konva.Text({
                text: "🔒",
                fontSize: 30,
                fill: "#5a5a7a",
                align: "center",
                verticalAlign: "middle",
                width: size,
                height: size,
                offsetX: size / 2,
                offsetY: size / 2,
                listening: false,
            });
            levelGroup.add(lockText);
        } else {
            // Hover effects only for unlocked levels
            rect.on("mouseenter", () => {
                rect.fill(hoverFill);
                rect.stroke(hoverStroke);
                rect.scale({ x: 1.1, y: 1.1 });
                text.scale({ x: 1.1, y: 1.1 });
                document.body.style.cursor = "pointer";
                levelGroup.getLayer()?.batchDraw();
            });

            rect.on("mouseleave", () => {
                rect.fill(fillColor);
                rect.stroke(strokeColor);
                rect.scale({ x: 1, y: 1 });
                text.scale({ x: 1, y: 1 });
                document.body.style.cursor = "default";
                levelGroup.getLayer()?.batchDraw();
            });

            rect.on("click", () => {
                this.onLevelSelect(level);
            });
        }

        this.group.add(levelGroup);
        this.levelGroups.set(level, levelGroup);
        this.group.getLayer()?.batchDraw();
    }

    /**
     * Create a row label
     */
    protected createRowLabel(text: string, x: number, y: number): void {
        const label = new Konva.Text({
            text,
            fontSize: 24,
            fontFamily: "Arial",
            fill: "#8a8aaa",
            align: "right",
            verticalAlign: "middle",
            width: 150,
            x: x - 150,
            y: y - 12,
        });
        this.group.add(label);
    }

    /**
     * Abstract method to be implemented by subclasses
     */
    protected abstract buildLayout(): void;
}
