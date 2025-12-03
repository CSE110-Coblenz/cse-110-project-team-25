import { ScreenController } from "../../../types.ts";
import type { ScreenSwitcher, planetName } from "../../../types.ts";
import { LevelSelectScreenModel } from "./LevelSelectScreenModel.ts";
import { LevelSelectScreenView } from "./LevelSelectScreenView.ts";

/**
 * LevelSelectScreenController - Manages level selection logic
 */
export class LevelSelectScreenController extends ScreenController {
    private model: LevelSelectScreenModel;
    private view: LevelSelectScreenView;
    private screenSwitcher: ScreenSwitcher;

    constructor(screenSwitcher: ScreenSwitcher, planetType: planetName) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.model = new LevelSelectScreenModel(planetType);
        this.view = new LevelSelectScreenView(
            (level) => this.selectLevel(level),
            () => this.goBackToMenu(),
            planetType,
            () => this.goToShop()
        );
    }

    /**
     * Handle level selection
     */
    private selectLevel(level: number): void {
        this.model.setSelectedLevel(level);
 
        this.screenSwitcher.switchToScreen({ type: "game", levelNumber: level, isTutorial: this.model.getPlanetType() === "tutorial_planet" });
    }

    /**
     * Handle back button
     */
    private goBackToMenu(): void {
        this.screenSwitcher.switchToScreen({ type: "planetSelect" });
    }

    /**
     * Handle shop button
     */
    private goToShop(): void {
        this.screenSwitcher.switchToScreen({ type: "shop" });
    }

    /**
     * Get the view for this screen
     */
    getView(): LevelSelectScreenView {
        return this.view;
    }

    /**
     * Get the selected level
     */
    getSelectedLevel(): number {
        return this.model.getSelectedLevel();
    }
}