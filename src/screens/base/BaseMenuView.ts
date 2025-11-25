import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import Ui from "../../objects/Ui.ts";
import Background from "../../objects/Background.ts";

/**
 * Configuration for creating buttons
 */
export interface ButtonConfig {
  text: string;
  width?: number;
  height?: number;
  fill?: string;
  hoverFill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  textFill?: string;
  cornerRadius?: number;
  onClick: () => void;
}

/**
 * Configuration for creating text elements
 */
export interface TextConfig {
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  align?: string;
}

/**
 * BaseMenuView - Abstract base class for menu screens
 * Provides common UI creation methods to reduce boilerplate
 */
export abstract class BaseMenuView implements View {
  protected group: Konva.Group;
  protected background!: Background; // Definite assignment assertion - initialized in createBackground

  constructor(backgroundColor: string = "#0f0f23", autoBuild: boolean = true, buildbackground: boolean = true) {
    this.group = new Konva.Group({ visible: false });
    this.createBackground(backgroundColor, buildbackground);
    // Only auto-build if requested (subclasses can override this)
    if (autoBuild) {
      this.buildLayout();
    }
  }

  /**
   * Create the background for the menu
   */
  protected createBackground(color: string, tocreate?: boolean): void {
    if (tocreate === false) return;
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
      fill: color,
    });
    bgGroup.add(bgRect);

    this.background = new Background(bgGroup);
    this.group.add(this.background.image);
  }

  /**
   * Create a title text element
   */
  protected createTitle(text: string, config: Partial<TextConfig> = {}): Ui {
    const titleText = new Konva.Text({
      x: 0,
      y: 0,
      text,
      fontSize: config.fontSize ?? 48,
      fontFamily: config.fontFamily ?? "Arial",
      fill: config.fill ?? "white",
      stroke: config.stroke,
      strokeWidth: config.strokeWidth,
      align: config.align ?? "center",
      listening: false,
    });

    const titleGroup = new Konva.Group({
      width: titleText.width(),
      height: titleText.height(),
      listening: false,
    });
    if(text === "Cosmic Keyboard Captain"){
      const animations = {
          idle: [
              0, 0, 720, 188,    
          ]
      };

      const imageObj = new Image();
      imageObj.src = "/titleBase.png";
      imageObj.onload = function() {
          const scale = 1;
          const shot = new Konva.Sprite({
              x: 0,
              y: 0,
              scale: { x: scale, y: scale},
              offset: { x: 720/2, y: 0},
              image: imageObj,
              animation: 'idle',
              animations: animations,
              frameRate: 15,
              frameIndex: 0,
              rotation: 0//Math.random()*360
          });
          shot.start();
          titleGroup.add(shot);
          shot.moveToBottom();
          titleGroup.getLayer()?.batchDraw?.();
          shot.moveToBottom();
      }
      const imageObjGlow = new Image();
      imageObjGlow.src = "/titleGlow.png";
      imageObjGlow.onload = function() {
          const scale = 1;
          const shot = new Konva.Sprite({
              x: 0,
              y: 0,
              scale: { x: scale, y: scale},
              offset: { x: 720/2, y: 0},
              image: imageObjGlow,
              animation: 'idle',
              animations: animations,
              frameRate: 15,
              frameIndex: 0,
              globalCompositeOperation: 'lighter',
              rotation: 0//Math.random()*360
          });
          shot.start();
          titleGroup.add(shot);
          shot.moveToTop();
          titleGroup.getLayer()?.batchDraw?.();
          shot.moveToTop();
      }
    } else {
      titleGroup.add(titleText);
    }

    return new Ui(titleGroup, false);
  }

  /**
   * Create a text element
   */
  protected createText(text: string, config: Partial<TextConfig> = {}): Ui {
    const textNode = new Konva.Text({
      x: 0,
      y: 0,
      text,
      fontSize: config.fontSize ?? 32,
      fontFamily: config.fontFamily ?? "Arial",
      fill: config.fill ?? "white",
      stroke: config.stroke,
      strokeWidth: config.strokeWidth,
      align: config.align ?? "center",
      listening: false,
    });

    const textGroup = new Konva.Group({
      width: textNode.width(),
      height: textNode.height(),
      listening: false,
    });
    textGroup.add(textNode);

    return new Ui(textGroup, false);
  }

  /**
   * Create a button with hover effects
   */
  protected createButton(config: ButtonConfig): Ui {
    const btnWidth = config.width ?? 200;
    const btnHeight = config.height ?? 60;
    const btnFill = config.fill ?? "green";
    const btnHoverFill = config.hoverFill ?? "lightgreen";
    const btnStroke = config.stroke ?? "darkgreen";
    const btnStrokeWidth = config.strokeWidth ?? 3;

    const btnRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: btnWidth,
      height: btnHeight,
      fill: btnFill,
      cornerRadius: config.cornerRadius ?? 10,
      stroke: btnStroke,
      strokeWidth: btnStrokeWidth,
    });
    btnRect.offsetX(btnWidth / 2);
    btnRect.offsetY(btnHeight / 2);

    const btnText = new Konva.Text({
      x: 0,
      y: 0,
      text: config.text,
      fontSize: config.fontSize ?? 24,
      fontFamily: config.fontFamily ?? "Arial",
      fill: config.textFill ?? "white",
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

    // Add interactions
    btnGroup.on("click", config.onClick);
    btnGroup.on("mouseenter", () => {
      btnRect.fill(btnHoverFill);
      this.group.getLayer()?.batchDraw();
    });
    btnGroup.on("mouseleave", () => {
      btnRect.fill(btnFill);
      this.group.getLayer()?.batchDraw();
    });

    return new Ui(btnGroup, true);
  }

  /**
   * Position and add a UI element to the group
   */
  protected positionElement(element: Ui, x: number, y: number): void {
    element.x = x;
    element.y = y;
    this.group.add(element.image);
  }

  /**
   * Abstract method that subclasses implement to build their specific layout
   */
  protected abstract buildLayout(): void;

  // View interface implementation
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
