import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { BaseMenuView } from "../base/BaseMenuView.ts";
import Konva from "konva";
import Background from "../../objects/Background.ts";

/**
 * GameOverMenuView - Renders the GameOver menu overlay during gameplay
 */
export default class GameOverMenuView extends BaseMenuView {
  private onQuitClick: () => void;

  constructor(onQuitClick: () => void) {
    super("rgba(0, 0, 0, 0.7)", false); // Semi-transparent dark overlay
    this.onQuitClick = onQuitClick;
    this.buildLayout();
    // GameOver menu hidden by default
    this.group.visible(false);
  }

  protected buildLayout(): void {
    // Override background to be semi-transparent
    this.createSemiTransparentBackground();

    // Create "GameOverD" title
    const title = this.createTitle("GAME OVER", {
      fontSize: 64,
      fontFamily: "Arial",
      fill: "white",
      stroke: "black",
      strokeWidth: 3,
    });
    this.positionElement(title, STAGE_WIDTH / 2, STAGE_HEIGHT / 3);

    // Create Quit button
    const quitBtn = this.createButton({
      text: "QUIT TO MENU",
      width: 200,
      height: 60,
      fill: "red",
      hoverFill: "lightcoral",
      stroke: "darkred",
      strokeWidth: 3,
      fontSize: 24,
      onClick: this.onQuitClick,
    });
    this.positionElement(quitBtn, STAGE_WIDTH / 2, STAGE_HEIGHT / 2 + 80);
  }

  /**
   * Override background creation to make it semi-transparent
   */
  private createSemiTransparentBackground(): void {
    // Remove existing background
    this.background.image.destroy();

    const bgGroup = new Konva.Group({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      listening: true, // Capture clicks to prevent interaction with game
    });

    const bgRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "rgba(0, 0, 0, 0.7)", // Semi-transparent black
      opacity: 0.9,
    });
    bgGroup.add(bgRect);

    this.background = new Background(bgGroup);
    this.group.add(this.background.image);
    this.background.image.moveToBottom(); // Ensure background is behind buttons
  }
}
