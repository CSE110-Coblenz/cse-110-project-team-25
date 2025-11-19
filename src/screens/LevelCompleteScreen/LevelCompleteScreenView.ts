import { STAGE_WIDTH } from "../../constants.ts";
import { BaseMenuView } from "../base/BaseMenuView.ts";

/**
 * LevelCompleteScreenView - Renders the level completion screen
 */
export class LevelCompleteScreenView extends BaseMenuView {
    private level: number;
    private score: number;
    private onNextLevelClick: () => void;
    private onMenuClick: () => void;

    constructor(
        level: number,
        score: number,
        onNextLevelClick: () => void,
        onMenuClick: () => void
    ) {
        super("#1a1a2e", false); // Don't auto-build
        this.level = level;
        this.score = score;
        this.onNextLevelClick = onNextLevelClick;
        this.onMenuClick = onMenuClick;
        this.buildLayout(); // Build after callbacks are assigned
        this.group.visible(true); // Show by default
    }

    protected buildLayout(): void {
        // Create title
        const title = this.createTitle("Level Complete!", {
            fontSize: 48,
            fontFamily: "Arial",
            fill: "#00ff00",
        });
        this.positionElement(title, STAGE_WIDTH / 2, 150);

        // Create level info text
        const levelInfo = this.createText(`Level ${this.level} Completed!\nScore: ${this.score}`, {
            fontSize: 32,
            fontFamily: "Arial",
            fill: "white",
        });
        this.positionElement(levelInfo, STAGE_WIDTH / 2, 250);

        // Create Next Level button
        const nextLevelBtn = this.createButton({
            text: "NEXT LEVEL",
            width: 250,
            height: 60,
            fill: "#4CAF50",
            hoverFill: "#5CBF60",
            stroke: "#45a049",
            strokeWidth: 3,
            fontSize: 24,
            onClick: this.onNextLevelClick,
        });
        this.positionElement(nextLevelBtn, STAGE_WIDTH / 2, 370);

        // Create Main Menu button
        const menuBtn = this.createButton({
            text: "MAIN MENU",
            width: 250,
            height: 60,
            fill: "#2196F3",
            hoverFill: "#42A5F5",
            stroke: "#1976D2",
            strokeWidth: 3,
            fontSize: 24,
            onClick: this.onMenuClick,
        });
        this.positionElement(menuBtn, STAGE_WIDTH / 2, 450);
    }
}