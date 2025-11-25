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

    constructor(onLevelSelect: (level: number) => void, onBackClick: () => void, onShopClick: () => void, planetType: planetName) {
        super("#0f0f23", false, true);
        this.onLevelSelect = onLevelSelect;
        this.onBackClick = onBackClick;
        this.onShopClick = onShopClick;
        this.planetType = planetType;
        this.group.visible(true);
    }

    /**
     * Create a styled level button
     */
    protected createLevelButton(level: number, x: number, y: number, size: number = 100): void {
        const levelGroup = new Konva.Group({
            x,
            y,
        });

        // Create rounded rectangle background
        const rect = new Konva.Rect({
            width: size,
            height: size,
            offsetX: size / 2,
            offsetY: size / 2,
            fill: "#2a2a4a",
            stroke: "#4a4a8a",
            strokeWidth: 3,
            cornerRadius: 15,
            listening: true,
        });

        // Create level number text
        const text = new Konva.Text({
            text: level.toString(),
            fontSize: 36,
            fontFamily: "Arial",
            fill: "white",
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

        // Hover effects
        rect.on("mouseenter", () => {
            rect.fill("#3a3a6a");
            rect.stroke("#6a6aaa");
            rect.scale({ x: 1.1, y: 1.1 });
            text.scale({ x: 1.1, y: 1.1 });
            document.body.style.cursor = "pointer";
            levelGroup.getLayer()?.batchDraw();
        });

        rect.on("mouseleave", () => {
            rect.fill("#2a2a4a");
            rect.stroke("#4a4a8a");
            rect.scale({ x: 1, y: 1 });
            text.scale({ x: 1, y: 1 });
            document.body.style.cursor = "default";
            levelGroup.getLayer()?.batchDraw();
        });

        rect.on("click", () => {
            this.onLevelSelect(level);
        });

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

    /**
     * Create navigation buttons (back + shop)
     */
    protected createNavigationButtons(y: number): void {
        const centerX = STAGE_WIDTH / 2;
        const offset = 100;

        const backBtn = this.createButton({
            text: "BACK",
            width: 150,
            height: 50,
            fill: "gray",
            hoverFill: "lightgray",
            stroke: "darkgray",
            strokeWidth: 3,
            fontSize: 20,
            onClick: this.onBackClick,
        });

        if (this.onShopClick) {
            // When shop is available, place buttons side by side
            this.positionElement(backBtn, centerX - offset, y);

            const shopBtn = this.createButton({
                text: "SHOP",
                width: 150,
                height: 50,
                fill: "#DAA520",
                hoverFill: "#FFD700",
                stroke: "#B8860B",
                strokeWidth: 3,
                fontSize: 20,
                onClick: this.onShopClick,
            });
            this.positionElement(shopBtn, centerX + offset, y);
        } else {
            this.positionElement(backBtn, centerX, y);
        }
    }
}
