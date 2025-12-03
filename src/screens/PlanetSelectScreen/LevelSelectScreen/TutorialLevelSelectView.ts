import { STAGE_WIDTH, STAGE_HEIGHT } from "../../../constants.ts";
import type { planetName } from "../../../types.ts";
import { BaseLevelSelectView } from "./BaseLevelSelectView.ts";

interface TutorialManifest {
    homerow?: string[];
    toprow?: string[];
    botrow?: string[];
}

/**
 * TutorialLevelSelectView - Level selection for tutorial planet
 * Organizes levels by keyboard rows (homerow, toprow, botrow)
 */
export class TutorialLevelSelectView extends BaseLevelSelectView {
    private manifest: TutorialManifest = {};

    constructor(onLevelSelect: (level: number) => void, onBackClick: () => void, planetType: planetName, onShopClick?: () => void) {
        super(onLevelSelect, onBackClick, planetType, onShopClick);
        this.loadManifestAndBuild();
    }

    private async loadManifestAndBuild(): Promise<void> {
        try {
            const response = await fetch('./levels/tutorial/manifest.json');
            this.manifest = await response.json();
            this.buildLayout();
        } catch (error) {
            console.error('Failed to load tutorial manifest:', error);
            // Fallback to empty manifest
            this.buildLayout();
        }
    }

    protected buildLayout(): void {
        // Create title
        const title = this.createTitle("SELECT LEVEL - EARTH", {
            fontSize: 48,
            fontFamily: "Arial",
            fill: "white"
        });
        this.positionElement(title, STAGE_WIDTH / 2, 80);

        const buttonSize = 100;
        const buttonSpacing = 40;
        const rowSpacing = 120;
        const startY = 200;
        const labelX = STAGE_WIDTH / 2 - 350;

        let currentLevel = 1;

        // Homerow levels
        if (this.manifest.homerow && this.manifest.homerow.length > 0) {
            const rowY = startY;
            this.createRowLabel("Home Row", labelX, rowY);
            const levelsInRow = this.manifest.homerow.length;
            const startX = STAGE_WIDTH / 2 - ((levelsInRow * (buttonSize + buttonSpacing)) - buttonSpacing) / 2;
            
            this.manifest.homerow.forEach((_, index) => {
                const x = startX + index * (buttonSize + buttonSpacing) + buttonSize / 2;
                this.createLevelButton(currentLevel++, x, rowY, buttonSize);
            });
        }

        // Toprow levels
        if (this.manifest.toprow && this.manifest.toprow.length > 0) {
            const rowY = startY + rowSpacing;
            this.createRowLabel("Top Row", labelX, rowY);
            const levelsInRow = this.manifest.toprow.length;
            const startX = STAGE_WIDTH / 2 - ((levelsInRow * (buttonSize + buttonSpacing)) - buttonSpacing) / 2;
            
            this.manifest.toprow.forEach((_, index) => {
                const x = startX + index * (buttonSize + buttonSpacing) + buttonSize / 2;
                this.createLevelButton(currentLevel++, x, rowY, buttonSize);
            });
        }

        // Botrow levels
        if (this.manifest.botrow && this.manifest.botrow.length > 0) {
            const rowY = startY + rowSpacing * 2;
            this.createRowLabel("Bottom Row", labelX, rowY);
            const levelsInRow = this.manifest.botrow.length;
            const startX = STAGE_WIDTH / 2 - ((levelsInRow * (buttonSize + buttonSpacing)) - buttonSpacing) / 2;
            
            this.manifest.botrow.forEach((_, index) => {
                const x = startX + index * (buttonSize + buttonSpacing) + buttonSize / 2;
                this.createLevelButton(currentLevel++, x, rowY, buttonSize);
            });
        }

        // Create navigation buttons
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
            // Position back button to the left
            this.positionElement(backBtn, STAGE_WIDTH / 2 - 85, STAGE_HEIGHT - 80);

            // Create shop button to the right
            const shopBtn = this.createButton({
                text: "SHOP",
                width: 150,
                height: 50,
                fill: "darkblue",
                hoverFill: "lightblue",
                stroke: "blue",
                strokeWidth: 3,
                fontSize: 20,
                onClick: this.onShopClick,
            });
            this.positionElement(shopBtn, STAGE_WIDTH / 2 + 85, STAGE_HEIGHT - 80);
        } else {
            // Center back button if no shop
            this.positionElement(backBtn, STAGE_WIDTH / 2, STAGE_HEIGHT - 80);
        }
    }
}
