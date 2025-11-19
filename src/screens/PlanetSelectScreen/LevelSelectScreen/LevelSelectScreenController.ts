import { ScreenController } from "../../../types.ts";
import type { ScreenSwitcher } from "../../../types.ts";
import { LevelSelectScreenModel } from "./LevelSelectScreenModel.ts";
import { LevelSelectScreenView } from "./LevelSelectScreenView.ts";

/**
 * LevelSelectScreenController - Manages level selection logic
 */
export class LevelSelectScreenController extends ScreenController {
    private model: LevelSelectScreenModel;
    private view: LevelSelectScreenView;
    private screenSwitcher: ScreenSwitcher;

    constructor(screenSwitcher: ScreenSwitcher) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.model = new LevelSelectScreenModel();
        this.view = new LevelSelectScreenView(
            (level) => this.selectLevel(level),
            () => this.goBackToMenu()
        );
    }

    /**
     * Handle level selection
     */
    private selectLevel(level: number): void {
        this.model.setSelectedLevel(level);
 
        this.screenSwitcher.switchToScreen({ type: "game", levelNumber: level });
    }

    /**
     * Handle back button
     */
    private goBackToMenu(): void {
        this.screenSwitcher.switchToScreen({ type: "menu" });
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