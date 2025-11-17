import type { levelName } from "../../types.ts";
import { BaseMenuController } from "../base/BaseMenuController.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { LevelSelectScreenView } from "./LevelSelectScreenView.ts";

/**
 * LevelSelectScreenController - Controls the level selection screen
 */
export class LevelSelectScreenController extends BaseMenuController {
	constructor(screenSwitcher: ScreenSwitcher) {
		super(screenSwitcher);
		this.view = new LevelSelectScreenView(
			() => this.handleBackClick(),
			(level: levelName) => this.handleLevelClick(level)
		);
	}

    private handleBackClick(): void {
        console.log("Back button clicked from Level Select");
        this.screenSwitcher.switchToScreen({type: "menu"});
    }

    private handleLevelClick(level: levelName): void {
        console.log(`Level selected: ${level}`);
        this.screenSwitcher.switchToScreen({type: level});
    }

    public getView(): LevelSelectScreenView {
        return this.view as LevelSelectScreenView;
    }
}


