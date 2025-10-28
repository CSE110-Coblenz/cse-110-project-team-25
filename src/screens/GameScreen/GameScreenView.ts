import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import Enemy from "../../objects/Enemy";
import Prompt from "../../objects/Prompt";

export class GameScreenView implements View {
  private group: Konva.Group;
  private typedText: Konva.Text;

  // New:
  private enemy?: Enemy;
  private prompt?: Prompt;

  constructor() {
    this.group = new Konva.Group({ visible: false });

    // Background
    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#1a1a2e",
    });
    this.group.add(bg);

    // Debug/Info typed text (center)
    this.typedText = new Konva.Text({
      x: STAGE_WIDTH / 2,
      y: STAGE_HEIGHT / 2,
      text: "",
      fontSize: 32,
      fontFamily: "Courier New",
      fill: "white",
      align: "center",
      listening: false,
    });
    this.typedText.offsetX(this.typedText.width() / 2);
    this.typedText.offsetY(this.typedText.height() / 2);
    this.group.add(this.typedText);
  }

  /** Create an enemy (circle) with a prompt text underneath. */
  spawnEnemyWithPrompt(word: string): void {
    this.destroyEnemy(); // clear any existing

    // Enemy circle group
    const enemyGroup = new Konva.Group({ width: 80, height: 80 });
    const circle = new Konva.Circle({
      x: 0, y: 0, radius: 40,
      fill: "#2aa1ff",
      stroke: "#0b5ea8",
      strokeWidth: 4,
    });
    enemyGroup.add(circle);

    // Wrap in Enemy Object and position mid-top-ish
    this.enemy = new Enemy(enemyGroup, word, 1, 0, 100);
    this.enemy.x = STAGE_WIDTH / 2;
    this.enemy.y = STAGE_HEIGHT / 3;
    this.group.add(this.enemy.image);

    // Prompt group (text)
    const textNode = new Konva.Text({
      x: 0, y: 0,
      text: word,
      fontSize: 28,
      fontFamily: "Courier New",
      fill: "#ffffff",
      align: "center",
      listening: false,
    });
    // Fixed width for alignment below the circle
    const promptWidth = Math.max(140, textNode.width());
    textNode.width(promptWidth);
    textNode.offsetX(promptWidth / 2);
    textNode.offsetY(textNode.height() / 2);

    const promptGroup = new Konva.Group({ width: promptWidth, height: textNode.height() });
    promptGroup.add(textNode);

    this.prompt = new Prompt(promptGroup, textNode, false);
    this.prompt.x = this.enemy.x;
    this.prompt.y = this.enemy.y + 70; // under the circle
    this.group.add(this.prompt.image);

    this.group.getLayer()?.draw();
  }

  /** Update both the big center text and the prompt coloring to show progress. */
  updateText(text: string): void {
    this.typedText.text(text);
    this.typedText.offsetX(this.typedText.width() / 2);
    this.group.getLayer()?.draw();
  }

  /** Color the typed prefix green, remainder white. */
  updatePromptProgress(typed: string): void {
    if (!this.prompt) return;
    const target = this.prompt.textNode.text();
    const clamped = typed.slice(0, target.length);


    // Remove old children and rebuild two pieces
    const g = this.prompt.image;
    g.destroyChildren();

    const typedNode = new Konva.Text({
      x: 0, y: 0,
      text: target.slice(0, clamped.length),
      fontSize: 28,
      fontFamily: "Courier New",
      fill: "#12d44e",
      listening: false,
    });

    const restNode = new Konva.Text({
      x: typedNode.width(), // position right after green
      y: 0,
      text: target.slice(clamped.length),
      fontSize: 28,
      fontFamily: "Courier New",
      fill: "#ffffff",
      listening: false,
    });

    const width = typedNode.width() + restNode.width();
    const height = Math.max(typedNode.height(), restNode.height());

    g.width(width);
    g.height(height);
    g.offsetX(width / 2);
    g.offsetY(height / 2);

    g.add(typedNode);
    g.add(restNode);

    // Keep it under the enemy
    if (this.enemy) {
      this.prompt.x = this.enemy.x;
      this.prompt.y = this.enemy.y + 70;
    }

    this.group.getLayer()?.batchDraw();
  }

  /** Remove enemy + prompt visuals. */
  destroyEnemy(): void {
    if (this.prompt) {
      this.prompt.image.destroy();
      this.prompt = undefined;
    }
    if (this.enemy) {
      this.enemy.destroy();
      this.enemy = undefined;
    }
    this.group.getLayer()?.draw();
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
