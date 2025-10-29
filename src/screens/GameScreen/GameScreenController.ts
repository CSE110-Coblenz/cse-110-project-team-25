import { ScreenController } from "../../types.ts";
import Konva from "konva";
import type { ScreenSwitcher } from "../../types.ts";
import { GameScreenModel } from "./GameScreenModel.ts";
import { GameScreenView } from "./GameScreenView.ts";
import { wordBank } from "../../words/wordBank.ts";

type EnemySim = {
  id: number;
  word: string;
  initial: string;
  x: number;      // world X (units, e.g., lanes -3..+3)
  z: number;      // distance from player (units)
  speed: number;  // units/sec toward player
};

export class GameScreenController extends ScreenController {
  private model: GameScreenModel;
  private view: GameScreenView;
  private screenSwitcher: ScreenSwitcher;

  private keyboardHandler: ((e: KeyboardEvent) => void) | null = null;
  private anim?: Konva.Animation;

	private getIdsSortedByDistanceClosestFirst(): number[] {
	return Array.from(this.enemies.values())
		.sort((a, b) => a.z - b.z) // smaller z = closer
		.map(e => e.id);
	}


  // targeting
  private typedText = "";
  private targetedId: number | null = null;

  // waves & enemies
  private enemies = new Map<number, EnemySim>();
  private activeInitials = new Set<string>();      // for uniqueness constraint
  private letterToId = new Map<string, number>();  // initial -> id

  // parameters
  private readonly NEAR_GAME_OVER = 10;             // units

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.model = new GameScreenModel();
    this.view = new GameScreenView();
  }

  async startGame(): Promise<void> {
    await wordBank.load("/wordbanks.json");
    this.resetState();

    // first wave
    this.spawnWave(3);

    this.setupKeyboardInput();
    // Start a Konva animation loop tied to the view's layer
    const layer = this.view.getGroup().getLayer()!;
    this.anim = new Konva.Animation((frame) => {
      const dt = (frame?.timeDiff ?? 0) / 1000;
      if (dt > 0) this.update(dt);
    }, layer);
    this.anim.start();

    this.view.show();
  }

  private resetState(): void {
    this.model.reset();
    this.typedText = "";
    this.view.updateText(this.typedText);
    this.targetedId = null;
    this.enemies.clear();
    this.activeInitials.clear();
    this.letterToId.clear();
    this.view.setTarget(null);
  }

  // ---------- Waves ----------

  private spawnWave(n: number): void {
    for (let i = 0; i < n; i++) {
      const word = wordBank.getRandomWordExcludingInitials(this.activeInitials, "any");
      if (!word) break;

      // pick a lane/worldX in [-3 .. +3] (float), and a far distance with a speed
      const lane = (Math.random() * 6 - 3); // -3..+3
      const z = 40 + Math.random() * 30;    // 40..70 units away
      const speed = 5 + Math.random() * 4;  // 5..9 units/sec

      const id = this.view.spawnEnemyVisuals(word);
      this.enemies.set(id, {
        id,
        word,
        initial: word[0].toLowerCase(),
        x: lane,
        z,
        speed,
      });

      this.activeInitials.add(word[0].toLowerCase());
      this.letterToId.set(word[0].toLowerCase(), id);

      // Initial projection
      this.view.updateEnemyTransform(id, lane, z);
    }
	this.view.setDrawOrder(this.getIdsSortedByDistanceClosestFirst());
  }

  private onEnemyDefeated(id: number): void {
    const sim = this.enemies.get(id);
    if (!sim) return;

    // remove from sets/maps
    this.activeInitials.delete(sim.initial);
    this.letterToId.delete(sim.initial);
    this.enemies.delete(id);

    // remove visuals
    this.view.destroyEnemy(id);

    // reset targeting if needed
    if (this.targetedId === id) {
      this.targetedId = null;
      this.typedText = "";
      this.view.updateText(this.typedText);
      this.view.setTarget(null);
    }

    // wave cleared?
    if (this.enemies.size === 0) {
      this.spawnWave(3);
    }
  }

  // ---------- Game loop ----------

  private update(dt: number): void {
    // Move enemies forward (reduce z), update transforms, check game over
    let anyTooClose = false;

    for (const sim of this.enemies.values()) {
      sim.z = Math.max(0, sim.z - sim.speed * dt);
      this.view.updateEnemyTransform(sim.id, sim.x, sim.z);
      if (sim.z <= this.NEAR_GAME_OVER) {
        anyTooClose = true;
      }
    }

	this.view.setDrawOrder(this.getIdsSortedByDistanceClosestFirst());

    if (anyTooClose) {
      this.gameOverToMenu();
    }
  }

  private gameOverToMenu(): void {
    // stop loop & cleanup
    this.anim?.stop();
    this.anim = undefined;

    // destroy all current enemies
    for (const sim of Array.from(this.enemies.values())) {
      this.view.destroyEnemy(sim.id);
    }
    this.enemies.clear();
    this.activeInitials.clear();
    this.letterToId.clear();

    // switch screens
    this.screenSwitcher.switchToScreen({ type: "menu" });
  }

  // ---------- Input / typing ----------

  private setupKeyboardInput(): void {
    if (this.keyboardHandler) window.removeEventListener("keydown", this.keyboardHandler);

    this.keyboardHandler = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        if (this.targetedId !== null) {
          this.typedText = this.typedText.slice(0, -1);
          this.view.updateText(this.typedText);
          this.view.updateEnemyProgress(this.targetedId, this.typedText);
          if (this.typedText.length === 0) {
            this.view.setTarget(null);
            this.targetedId = null;
          }
        }
        return;
      }

      if (e.key.length !== 1) return;
      const ch = e.key.toLowerCase();

      // acquire target
      if (this.targetedId === null) {
        const id = this.letterToId.get(ch);
        if (!id) return; // no enemy with that initial
        this.targetedId = id;
        const word = this.enemies.get(id)?.word ?? "";
        this.model.setTargetWord(word);

        this.typedText = e.key;
        this.view.setTarget(id);
        this.view.updateText(this.typedText);
        this.view.updateEnemyProgress(id, this.typedText);
        this.checkCompletion();
        return;
      }

      // progress existing target
      const id = this.targetedId;
      const word = this.enemies.get(id)?.word ?? "";
      const nextTyped = this.typedText + e.key;

      if (!word.toLowerCase().startsWith(nextTyped.toLowerCase())) {
        return; // ignore wrong char
      }

      this.typedText = nextTyped;
      this.view.updateText(this.typedText);
      this.view.updateEnemyProgress(id, this.typedText);
      this.checkCompletion();
    };

    window.addEventListener("keydown", this.keyboardHandler);
  }

  private checkCompletion(): void {
    if (this.targetedId === null) return;
    const id = this.targetedId;
    const word = this.enemies.get(id)?.word ?? "";
    if (word && this.typedText.length === word.length) {
      this.model.setScore(this.model.getScore() + 100);
      this.onEnemyDefeated(id);
    }
  }

  // ---------- Lifecycle ----------

  hide(): void {
    if (this.keyboardHandler) {
      window.removeEventListener("keydown", this.keyboardHandler);
      this.keyboardHandler = null;
    }
    this.anim?.stop();
    this.anim = undefined;
    super.hide();
  }

  getView(): GameScreenView { return this.view; }
}
