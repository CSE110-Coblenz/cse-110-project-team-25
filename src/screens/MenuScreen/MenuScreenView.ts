import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import Ui from "../../objects/Ui";
import Background from "../../objects/Background";

/**
 * MenuScreenView - Renders the menu screen using Object-based elements
*/
export class MenuScreenView implements View {
  private group: Konva.Group;

  private background: Background;
  private titleUi: Ui;
  private startUi: Ui;

  constructor(onStartClick: () => void) {
    this.group = new Konva.Group({ visible: true });

    // ----------------------------
    // Background
    // ----------------------------
    const bgGroup = new Konva.Group({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      listening: false,
    });

    const bgRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#0f0f23",
    });
    bgGroup.add(bgRect);

    this.background = new Background(bgGroup);
    this.group.add(this.background.image);

    // ----------------------------
    // Title
    // ----------------------------
    const titleText = new Konva.Text({
      x: 0,
      y: 0,
      text: "Cosmic Keyboard Captain",
      fontSize: 48,
      fontFamily: "Times New Roman",
      fill: "white",
      stroke: "black",
      strokeWidth: 2,
      align: "center",
      listening: false,
    });

    const titleGroup = new Konva.Group({
      width: titleText.width(),
      height: titleText.height(),
      listening: false,
    });
    titleGroup.add(titleText);

    this.titleUi = new Ui(titleGroup, false);
    // centered horizontally, fixed near top
    this.titleUi.x = STAGE_WIDTH / 2;
    this.titleUi.y = 150;
    this.group.add(this.titleUi.image);

    // ----------------------------
    // Start Button (centered)
    // ----------------------------
    const btnWidth = 200;
    const btnHeight = 60;

    const btnRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: btnWidth,
      height: btnHeight,
      fill: "green",
      cornerRadius: 10,
      stroke: "darkgreen",
      strokeWidth: 3,
    });
    // center the rect inside its group
    btnRect.offsetX(btnWidth / 2);
    btnRect.offsetY(btnHeight / 2);

    const btnText = new Konva.Text({
      x: 0,
      y: 0,
      text: "START GAME",
      fontSize: 24,
      fontFamily: "Arial",
      fill: "white",
      align: "center",
      listening: false,
    });
    btnText.offsetX(btnText.width() / 2);
    btnText.offsetY(btnText.height() / 2);

    const btnGroup = new Konva.Group({
      width: btnWidth,
      height: btnHeight,
      listening: true,
    });
    btnGroup.add(btnRect);
    btnGroup.add(btnText);

    this.startUi = new Ui(btnGroup, true);
    this.startUi.x = STAGE_WIDTH / 2;
    this.startUi.y = STAGE_HEIGHT / 2;

    this.group.add(this.startUi.image);

    // Interactions
    btnGroup.on("click", onStartClick);
    btnGroup.on("mouseenter", () => {
      btnRect.fill("lightgreen");
      this.group.getLayer()?.batchDraw();
    });
    btnGroup.on("mouseleave", () => {
      btnRect.fill("green");
      this.group.getLayer()?.batchDraw();
    });
  }

  show(): void {
    this.group.visible(true);
    this.group.getLayer()?.draw();
  }

  hide(): void {
    this.group.visible(false);
    this.group.getLayer()?.draw();
  }

  getGroup(): Konva.Group {
    return this.group;
  }
}
