import { STAGE_WIDTH, STAGE_HEIGHT } from "../../../constants.ts";
import type { planetName } from "../../../types.ts";
import { BaseLevelSelectView } from "./BaseLevelSelectView.ts";

interface CampaignManifest {
    levels?: string[];
}

/**
 * CampaignLevelSelectView - Level selection for campaign planet
 * Displays levels in a simple grid layout
 */
export class CampaignLevelSelectView extends BaseLevelSelectView {
    private manifest: CampaignManifest = {};

    constructor(onLevelSelect: (level: number) => void, onBackClick: () => void, planetType: planetName) {
        super(onLevelSelect, onBackClick, planetType);
        this.loadManifestAndBuild();
    }

    private async loadManifestAndBuild(): Promise<void> {
        try {
            const response = await fetch('./levels/campaign/manifest.json');
            this.manifest = await response.json();
            this.buildLayout();
        } catch (error) {
            console.error('Failed to load campaign manifest:', error);
            // Fallback to empty manifest
            this.buildLayout();
        }
    }

    protected buildLayout(): void {
        // Create title
        const title = this.createTitle("SELECT LEVEL - ARADISE", {
            fontSize: 48,
            fontFamily: "Arial",
            fill: "white"
        });
        this.positionElement(title, STAGE_WIDTH / 2, 80);

        // Get total levels from manifest
        const totalLevels = this.manifest.levels?.length || 0;

        if (totalLevels === 0) {
            // Show "Coming Soon" message
            const comingSoon = this.createTitle("COMING SOON", {
                fontSize: 36,
                fontFamily: "Arial",
                fill: "#8a8aaa"
            });
            this.positionElement(comingSoon, STAGE_WIDTH / 2, STAGE_HEIGHT / 2);
        } else {
            // Create level buttons in a grid layout
            const buttonsPerRow = 5;
            const buttonSize = 100;
            const buttonSpacing = 40;
            const startX = STAGE_WIDTH / 2 - ((buttonsPerRow * (buttonSize + buttonSpacing)) - buttonSpacing) / 2;
            const startY = 200;

            for (let level = 1; level <= totalLevels; level++) {
                const col = (level - 1) % buttonsPerRow;
                const row = Math.floor((level - 1) / buttonsPerRow);
                const x = startX + col * (buttonSize + buttonSpacing) + buttonSize / 2;
                const y = startY + row * (buttonSize + buttonSpacing) + buttonSize / 2;
                this.createLevelButton(level, x, y, buttonSize);
            }
        }

        // Create back button
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
        this.positionElement(backBtn, STAGE_WIDTH / 2, STAGE_HEIGHT - 80);
    }
}
