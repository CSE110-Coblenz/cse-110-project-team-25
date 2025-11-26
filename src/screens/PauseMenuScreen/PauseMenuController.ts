import type { ScreenSwitcher } from "../../types.ts";
import { BaseMenuController } from "../base/BaseMenuController.ts";
import PauseMenuView from "./PauseMenuView.ts";

/**
 * PauseMenuController - Handles pause menu interactions
 */
export default class PauseMenuController extends BaseMenuController {
  private onResume: () => void;
  private onQuit: () => void;

  constructor(screenSwitcher: ScreenSwitcher, onResume: () => void, onQuit: () => void) {
    super(screenSwitcher);
    this.onResume = onResume;
    this.onQuit = onQuit;
    this.view = new PauseMenuView(
      () => this.handleResumeClick(),
      () => this.handleQuitClick()
    );
  }

  /**
   * Handle resume button click
   */
  private handleResumeClick(): void {
    this.onResume();
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
  getView(): PauseMenuView {
    return this.view as PauseMenuView;
  }
}
