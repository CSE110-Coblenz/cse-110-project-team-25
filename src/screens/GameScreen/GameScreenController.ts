import { ScreenController } from "../../types.ts";
import Konva from "konva";
import type { ScreenSwitcher } from "../../types.ts";
import { GameScreenModel } from "./GameScreenModel.ts";
import { GameScreenView } from "./GameScreenView.ts";
import { wordBank } from "../../words/wordBank.ts";
import Enemy from "../../objects/Enemy.ts"

export class GameScreenController extends ScreenController {
  private model: GameScreenModel;
  private view: GameScreenView;
  private screenSwitcher: ScreenSwitcher;

  private keyboardHandler: ((e: KeyboardEvent) => void) | null = null;
  private anim?: Konva.Animation;
  private mult: number;

	private getIdsSortedByDistanceClosestFirst(): number[] {
		return Array.from(this.enemies.values())
			.sort((a, b) => a.distance - b.distance) 
			.map(e => e.id);
	}


  // targeting
  private typedText = "";
  private targetedId: number | null = null;

  // waves & enemies
  private enemies = new Map<number, Enemy>();
  private activeInitials = new Set<string>();      // for uniqueness constraint
  private letterToId = new Map<string, number>();  // initial -> id

  // parameters
  private readonly NEAR_GAME_OVER = 10;             // units

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.model = new GameScreenModel();
    this.view = new GameScreenView();
	this.mult = 1;
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
	this.mult = 1;
  }

  // ---------- Waves ----------

  private spawnWave(n: number): void {
	for (let i = 0; i < n; i++) {
		const word = wordBank.getRandomWordExcludingInitials(this.activeInitials, "any");
		if (!word) break;

		const lane = Math.random() * 6 - 3; // -3..+3
		const z = 40 + Math.random() * 30;  // 40..70
		const speed = (5 + Math.random() * 4) * this.mult;

		const En = new Enemy("circle", word, 1, z, 0, speed);

		En.x = lane;

		this.enemies.set(En.id, En);

		// visuals
		this.view.spawnEnemyVisuals(En);
		this.view.updateEnemyTransform(En.id, lane, z);

		this.activeInitials.add(word[0].toLowerCase());
		this.letterToId.set(word[0].toLowerCase(), En.id);
	}
	this.view.setDrawOrder(this.getIdsSortedByDistanceClosestFirst());
  }

  private onEnemyDefeated(id: number): void {
    const En = this.enemies.get(id);
    if (!En) return;

    // remove from sets/maps
    this.activeInitials.delete(En.initial);
    this.letterToId.delete(En.initial);
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
	  this.mult *= 1.2;
      this.spawnWave(3);
    }
  }

  // ---------- Game loop ----------

  private update(dt: number): void {
    // Move enemies forward (reduce z), update transforms, check game over
    let anyTooClose = false;

    for (const En of this.enemies.values()) {
      En.distance = Math.max(0, En.distance - En.speed * dt);
      this.view.updateEnemyTransform(En.id, En.x, En.distance);
      if (En.distance <= this.NEAR_GAME_OVER) {
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
    for (const En of Array.from(this.enemies.values())) {
      this.view.destroyEnemy(En.id);
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
