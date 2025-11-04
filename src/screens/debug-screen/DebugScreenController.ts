import type { ScreenSwitcher } from "../../types.ts";
import { BaseMenuController } from "../base/BaseMenuController.ts";
import { DebugScreenView } from "./DebugScreenView.ts";

/**
 * DebugScreenController - Handles debug screen interactions
 */
export class DebugScreenController extends BaseMenuController {
  constructor(screenSwitcher: ScreenSwitcher) {
    super(screenSwitcher);
    this.view = new DebugScreenView(() => this.handleBackClick());
  }

  /**
   * Handle back button click
   */
  private handleBackClick(): void {
    console.log("Going back to menu...");
    this.screenSwitcher.switchToScreen({ type: "menu" });
  }

  /**
   * Get the view
   */
  getView(): DebugScreenView {
    return this.view as DebugScreenView;
  }
}
