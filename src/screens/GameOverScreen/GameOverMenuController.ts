import type { ScreenSwitcher } from "../../types.ts";
import { BaseMenuController } from "../base/BaseMenuController.ts";
import GameOverMenuView from "./GameOverMenuView.ts";

/**
 * GameOverMenuController - Handles GameOver menu interactions
 */
export default class GameOverMenuController extends BaseMenuController {
  private onQuit: () => void;

  constructor(screenSwitcher: ScreenSwitcher, onQuit: () => void) {
    super(screenSwitcher);
    this.onQuit = onQuit;
    this.view = new GameOverMenuView(
      () => this.handleQuitClick()
    );
  }


  /**
   * Handle quit button click
   */
  private handleQuitClick(): void {
    this.onQuit();
  }

  /**
   * Get the view
   */
  getView(): GameOverMenuView {
    return this.view as GameOverMenuView;
  }
}
