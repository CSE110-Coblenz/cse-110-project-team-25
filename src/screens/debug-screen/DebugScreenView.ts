import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { BaseMenuView } from "../base/BaseMenuView.ts";

/**
 * DebugScreenView - A test screen for debugging and to see if new BaseMenuController and BaseMenuView actually work 
 */
export class DebugScreenView extends BaseMenuView {
  private onBackClick: () => void;

  constructor(onBackClick: () => void) {
    super("#2a2a4a", false); //Dark blue background, don't auto-build
    this.onBackClick = onBackClick;
    this.buildLayout();
    this.group.visible(false); //Hidden by default
  }

  protected buildLayout(): void {
    //Create title
    const title = this.createTitle("Debug Screen", {
      fontSize: 48,
      fontFamily: "Arial",
      fill: "#ffff00",
    });
    this.positionElement(title, STAGE_WIDTH / 2, 150);

    //Create some debug info
    const debugInfo = this.createText("Test Screen.", {
      fontSize: 24,
      fontFamily: "Arial",
      fill: "white",
    });
    this.positionElement(debugInfo, STAGE_WIDTH / 2, 250);

    //Create back button
    const backBtn = this.createButton({
      text: "Back to Menu",
      width: 250,
      height: 60,
      fill: "#ff6b6b",
      hoverFill: "#ff8787",
      stroke: "#c92a2a",
      strokeWidth: 3,
      fontSize: 24,
      onClick: this.onBackClick,
    });
    this.positionElement(backBtn, STAGE_WIDTH / 2, STAGE_HEIGHT / 2 + 100);
  }
}
