import type { ScreenSwitcher } from "../../types.ts";
import { BaseMenuController } from "../base/BaseMenuController.ts";
import MenuScreenView from "./MenuScreenView.ts";

/**
 * MenuScreenController - Handles menu interactions
 */
export default class MenuScreenController extends BaseMenuController {
	constructor(screenSwitcher: ScreenSwitcher) {
		super(screenSwitcher);
		this.view = new MenuScreenView(
			() => this.handleStartClick()
			, () => this.handleLevelSelectClick()
			// , () => this.handleDebugClick() // DEBUG: Commented out for production
		);
	}

	/**
	 * Handle start button click
	 */
	private handleStartClick(): void {
		console.log("Start button clicked!");
		this.screenSwitcher.switchToScreen({type: "planetSelect"});
	}

	/**
	 * Handle level select click
	 */
	private handleLevelSelectClick(): void {
		console.log("Level Select button clicked!");
		this.screenSwitcher.switchToScreen({type: "planetSelect"});
	}

	// DEBUG: Debug handler commented out for production
	// /**
	//  * Handle debug button click
	//  */
	// private handleDebugClick(): void {
	// 	console.log("Debug button clicked!");
	// 	this.screenSwitcher.switchToScreen({type: "debug"});
	// }

	/**
	 * Get the view
	 */
	getView(): MenuScreenView {
		return this.view as MenuScreenView;
	}
}
