import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher, View } from "../../types.ts";

/**
 * BaseMenuController - Abstract base class for menu screen controllers
 * Provides common controller setup and navigation helpers
 */
export abstract class BaseMenuController extends ScreenController {
  protected screenSwitcher: ScreenSwitcher;
  protected view!: View; // Definite assignment assertion - subclasses will initialize

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;
  }

  /**
   * Get the view for this controller
   */
  abstract getView(): View;
}
