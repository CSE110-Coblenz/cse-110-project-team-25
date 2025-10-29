// src/screens/GameScreen/GameScreenView.ts
import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import Enemy from "../../objects/Enemy";
import Prompt from "../../objects/Prompt";

type EnemyView = {
  id: number;
  word: string;
  enemy: Enemy;
  prompt: Prompt;
  typedNode: Konva.Text;
  restNode: Konva.Text;
  circle: Konva.Circle;
};

export class GameScreenView implements View {
  private group: Konva.Group;
  private typedText: Konva.Text;
  private seq = 1;
  private enemyContainer: Konva.Group;
  private hudContainer: Konva.Group; 
  private enemies = new Map<number, EnemyView>();
  private targetedId: number | null = null;

    // Projection constants (tweak to taste)
    private readonly PERSPECTIVE = 450;   // bigger = more dramatic scaling
    private readonly BASE_RISE = 220;     // how much below horizon enemies appear at z=1
    private readonly SCALE_K   = 60;               // scale ≈ SCALE_K / z
	private readonly DROP_K    = 900;               // vertical drop ≈ DROP_K / z
	private readonly UNITS_X   = 120;                // world X units → px at z reference
	private readonly HORIZON_Y = STAGE_HEIGHT * 0.35;
	private readonly NEAR_CLIP = 1.0;               // safety clamp

   constructor() {
    this.group = new Konva.Group({ visible: false });

    // Background at the very bottom
    const bg = new Konva.Rect({
      x: 0, y: 0, width: STAGE_WIDTH, height: STAGE_HEIGHT, fill: "#1a1a2e",
    });

    // Containers layered: bg (bottom) -> enemies -> hud (top)
    this.enemyContainer = new Konva.Group();
    this.hudContainer = new Konva.Group();

    this.group.add(bg);
    this.group.add(this.enemyContainer);
    this.group.add(this.hudContainer);

    // HUD: center text
    this.typedText = new Konva.Text({
      x: STAGE_WIDTH / 2, y: STAGE_HEIGHT / 2, text: "",
      fontSize: 32, fontFamily: "Courier New", fill: "white", align: "center", listening: false,
    });
    this.typedText.offsetX(this.typedText.width() / 2);
    this.typedText.offsetY(this.typedText.height() / 2);
    this.hudContainer.add(this.typedText);
  }

  // Spawn enemy visuals (no world coords here yet)
  spawnEnemyVisuals(word: string): number {
    const id = this.seq++;

    const enemyGroup = new Konva.Group({ width: 80, height: 80 });
    const circle = new Konva.Circle({
      x: 0, y: 0, radius: 40, fill: "#2aa1ff", stroke: "#0b5ea8", strokeWidth: 4,
    });
    enemyGroup.add(circle);

    const enemy = new Enemy(enemyGroup, word);

	this.enemyContainer.add(enemy.image);


    const typedNode = new Konva.Text({
      x: 0, y: 0, text: "", fontSize: 28, fontFamily: "Courier New", fill: "#12d44e", listening: false,
    });
    const restNode = new Konva.Text({
      x: 0, y: 0, text: word, fontSize: 28, fontFamily: "Courier New", fill: "#ffffff", listening: false,
    });
    const promptGroup = new Konva.Group();
    promptGroup.add(typedNode);
    promptGroup.add(restNode);

    const prompt = new Prompt(promptGroup, restNode, false);
    this.enemyContainer.add(prompt.image);

    this.enemies.set(id, { id, word, enemy, prompt, typedNode, restNode, circle });
    this.group.getLayer()?.draw();
    return id;
  }


	/** Project world (x,z) to screen (x,y,scale) and apply to enemy visuals. */
	updateEnemyTransform(id: number, worldX: number, distanceZ: number): void {
	const ev = this.enemies.get(id);
	if (!ev) return;

	// 1/z style perspective
	const z = Math.max(this.NEAR_CLIP, distanceZ);

	// scale grows as z shrinks; clamp so it doesn't explode near z≈0
	const sRaw = this.SCALE_K / z;               // e.g. z=60 -> 2.0, z=40 -> 3.0, z=20 -> 6.0
	const s = Math.min(6, Math.max(0.6, sRaw));  // clamp to [0.6, 6]

	// X spreads a bit with scale to enhance perspective
	const screenX = STAGE_WIDTH / 2 + worldX * this.UNITS_X * (0.75 + 0.25 * s);

	// Y “drops” from the horizon as they approach (bigger when closer)
	const screenY = this.HORIZON_Y + this.DROP_K / z;

	// Apply to enemy visual
	ev.enemy.image.x(screenX);
	ev.enemy.image.y(screenY);
	ev.enemy.image.scale({ x: s, y: s });

	// Prompt directly under the circle, following scale
	ev.restNode.x(ev.typedNode.width());
	const width  = ev.typedNode.width() + ev.restNode.width();
	const height = Math.max(ev.typedNode.height(), ev.restNode.height());
	const g = ev.prompt.image;
	g.width(width); g.height(height);
	g.offsetX(width / 2); g.offsetY(height / 2);

	ev.prompt.x = screenX;
	ev.prompt.y = screenY + 55 * s;

	this.group.getLayer()?.batchDraw();
	}


  updateEnemyProgress(id: number, typed: string): void {
    const ev = this.enemies.get(id);
    if (!ev) return;
    const target = ev.word;
    const len = Math.min(typed.length, target.length);
    ev.typedNode.text(target.slice(0, len));
    ev.restNode.text(target.slice(len));
    ev.restNode.x(ev.typedNode.width());
    this.group.getLayer()?.batchDraw();
  }

  destroyEnemy(id: number): void {
    const ev = this.enemies.get(id);
    if (!ev) return;
    ev.prompt.image.destroy();
    ev.enemy.destroy();
    this.enemies.delete(id);
    if (this.targetedId === id) this.targetedId = null;
    this.group.getLayer()?.draw();
  }

  setTarget(id: number | null): void {
    // clear old
    if (this.targetedId && this.enemies.get(this.targetedId)) {
      const old = this.enemies.get(this.targetedId)!;
      old.circle.shadowBlur(0);
      old.circle.shadowColor("transparent");
      old.circle.stroke("#0b5ea8");
      old.circle.strokeWidth(4);
    }
    this.targetedId = id;
    // highlight new
    if (id && this.enemies.get(id)) {
      const ev = this.enemies.get(id)!;
    //   ev.circle.shadowColor("#ffd54a");
    //   ev.circle.shadowBlur(20);
      ev.circle.stroke("#ffd54a");
      ev.circle.strokeWidth(4);
    }
    this.group.getLayer()?.batchDraw();
  }

  updateText(text: string): void {
    this.typedText.text(text);
    this.typedText.offsetX(this.typedText.width() / 2);
    this.group.getLayer()?.draw();
  }

	/** Set draw order so closer enemies render on top.
	 *  Pass IDs sorted with closest first. Prompts are kept above their circles. */
	setDrawOrder(idsClosestFirst: number[]): void {
		let z = 0;
		const idsFarthestFirst = [...idsClosestFirst].reverse();

		for (const id of idsFarthestFirst) {
			const ev = this.enemies.get(id);
			if (!ev) continue;
			ev.enemy.image.zIndex(z++);
			ev.prompt.image.zIndex(z++);
		}

		this.enemyContainer.getLayer()?.batchDraw();
	}


  show(): void { this.group.visible(true); this.group.getLayer()?.draw(); }
  hide(): void { this.group.visible(false); this.group.getLayer()?.draw(); }
  getGroup(): Konva.Group { return this.group; }
}
