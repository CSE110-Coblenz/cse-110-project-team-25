import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import Ui from "../../objects/Ui";
import Background from "../../objects/Background";

/**
 * LevelCompleteScreenView - Renders the level completion screen
 */
export class LevelCompleteScreenView implements View {
  private group: Konva.Group;

  private background: Background;
  private titleUi: Ui;
  private levelInfoUi: Ui;
  private nextLevelUi: Ui;
  private menuUi: Ui;

  constructor(
    level: number, 
    score: number, 
    onNextLevelClick: () => void, 
    onMenuClick: () => void
  ) {
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
      fill: "#1a1a2e",
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
      text: "Level Complete!",
      fontSize: 48,
      fontFamily: "Arial",
      fill: "#00ff00",
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
    this.titleUi.x = STAGE_WIDTH / 2;
    this.titleUi.y = 150;
    this.group.add(this.titleUi.image);

    // ----------------------------
    // Level Info
    // ----------------------------
    const levelInfoText = new Konva.Text({
      x: 0,
      y: 0,
      text: `Level ${level} Completed!\nScore: ${score}`,
      fontSize: 32,
      fontFamily: "Arial",
      fill: "white",
      align: "center",
      listening: false,
    });

    const levelInfoGroup = new Konva.Group({
      width: levelInfoText.width(),
      height: levelInfoText.height(),
      listening: false,
    });
    levelInfoGroup.add(levelInfoText);

    this.levelInfoUi = new Ui(levelInfoGroup, false);
    this.levelInfoUi.x = STAGE_WIDTH / 2;
    this.levelInfoUi.y = 250;
    this.group.add(this.levelInfoUi.image);

    // ----------------------------
    // Next Level Button
    // ----------------------------
    const btnWidth = 250;
    const btnHeight = 60;

    const nextLevelBtnRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: btnWidth,
      height: btnHeight,
      fill: "#4CAF50",
      cornerRadius: 10,
      stroke: "#45a049",
      strokeWidth: 3,
    });
    nextLevelBtnRect.offsetX(btnWidth / 2);
    nextLevelBtnRect.offsetY(btnHeight / 2);

    const nextLevelBtnText = new Konva.Text({
      x: 0,
      y: 0,
      text: "NEXT LEVEL",
      fontSize: 24,
      fontFamily: "Arial",
      fill: "white",
      align: "center",
      listening: false,
    });
    nextLevelBtnText.offsetX(nextLevelBtnText.width() / 2);
    nextLevelBtnText.offsetY(nextLevelBtnText.height() / 2);

    const nextLevelBtnGroup = new Konva.Group({
      width: btnWidth,
      height: btnHeight,
      listening: true,
    });
    nextLevelBtnGroup.add(nextLevelBtnRect);
    nextLevelBtnGroup.add(nextLevelBtnText);

    this.nextLevelUi = new Ui(nextLevelBtnGroup, true);
    this.nextLevelUi.x = STAGE_WIDTH / 2;
    this.nextLevelUi.y = 370;

    this.group.add(this.nextLevelUi.image);

    // Next Level Button Interactions
    nextLevelBtnGroup.on("click", onNextLevelClick);
    nextLevelBtnGroup.on("mouseenter", () => {
      nextLevelBtnRect.fill("#5CBF60");
      this.group.getLayer()?.batchDraw();
    });
    nextLevelBtnGroup.on("mouseleave", () => {
      nextLevelBtnRect.fill("#4CAF50");
      this.group.getLayer()?.batchDraw();
    });

    // ----------------------------
    // Main Menu Button
    // ----------------------------
    const menuBtnRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: btnWidth,
      height: btnHeight,
      fill: "#2196F3",
      cornerRadius: 10,
      stroke: "#1976D2",
      strokeWidth: 3,
    });
    menuBtnRect.offsetX(btnWidth / 2);
    menuBtnRect.offsetY(btnHeight / 2);

    const menuBtnText = new Konva.Text({
      x: 0,
      y: 0,
      text: "MAIN MENU",
      fontSize: 24,
      fontFamily: "Arial",
      fill: "white",
      align: "center",
      listening: false,
    });
    menuBtnText.offsetX(menuBtnText.width() / 2);
    menuBtnText.offsetY(menuBtnText.height() / 2);

    const menuBtnGroup = new Konva.Group({
      width: btnWidth,
      height: btnHeight,
      listening: true,
    });
    menuBtnGroup.add(menuBtnRect);
    menuBtnGroup.add(menuBtnText);

    this.menuUi = new Ui(menuBtnGroup, true);
    this.menuUi.x = STAGE_WIDTH / 2;
    this.menuUi.y = 450;

    this.group.add(this.menuUi.image);

    // Main Menu Button Interactions
    menuBtnGroup.on("click", onMenuClick);
    menuBtnGroup.on("mouseenter", () => {
      menuBtnRect.fill("#42A5F5");
      this.group.getLayer()?.batchDraw();
    });
    menuBtnGroup.on("mouseleave", () => {
      menuBtnRect.fill("#2196F3");
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