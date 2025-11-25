import type { ScreenSwitcher } from "../../types.ts";
import { BaseMenuController } from "../base/BaseMenuController.ts";
import { LevelCompleteScreenView } from "./LevelCompleteScreenView.ts";

/**
 * LevelCompleteScreenController - Handles level completion screen interactions
 */
export class LevelCompleteScreenController extends BaseMenuController {
	private level: number;

	constructor(screenSwitcher: ScreenSwitcher, level: number, score: number) {
		super(screenSwitcher);
		this.level = level;
		this.view = new LevelCompleteScreenView(
			level,
			score,
			() => this.handleNextLevelClick(),
			() => this.handleMenuClick()
		);
	}

	/**
	 * Handle next level button click
	 */
	private handleNextLevelClick(): void {
		console.log(`Starting level ${this.level + 1}...`);
		this.screenSwitcher.switchToScreen({type: "game", levelNumber: this.level + 1, isTutorial: null});
	}

	/**
	 * Handle main menu button click
	 */
	private handleMenuClick(): void {
		console.log("Returning to main menu...");
		this.screenSwitcher.switchToScreen({type: "menu"});
	}

	/**
	 * Get the view
	 */
	getView(): LevelCompleteScreenView {
		return this.view as LevelCompleteScreenView;
	}
}
