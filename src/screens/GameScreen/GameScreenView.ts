import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import Enemy from "../../objects/Enemy";
import Effect from "../../objects/Effect.ts"
import Shot from "../../objects/Effects/Shot.ts";
import Explosion from "../../objects/Effects/Explosion.ts";

export class GameScreenView implements View {
  private group: Konva.Group;
  private typedText: Konva.Text;
  private moneyText: Konva.Text;
  private healthText: Konva.Text; //TODO show health with pixel hearts
  private levelText: Konva.Text;
  private waveText: Konva.Text;
  private enemiesLeftText: Konva.Text;
  enemyContainer: Konva.Group;
  effectContainer: Konva.Group;
  private hudContainer: Konva.Group; 
  enemies = new Map<number, Enemy>();
  effects = new Map<number, Effect>();
  private targetedId: number | null = null;

  constructor() {
    this.group = new Konva.Group({ visible: false });
	Konva.Image.fromURL("/space.png", (bg) => {
		this.group.add(bg);
		bg.moveToBottom();
	});

    // Containers layered: bg (bottom) -> enemies -> effects -> hud (top)
    this.enemyContainer = new Konva.Group();
    this.effectContainer = new Konva.Group();
    this.hudContainer = new Konva.Group();

    // this.group.add(bg);
    this.group.add(this.enemyContainer);
    this.group.add(this.effectContainer);
    this.group.add(this.hudContainer);

    // HUD: center text
    this.typedText = new Konva.Text({
      x: STAGE_WIDTH / 2, y: STAGE_HEIGHT / 2, text: "",
      fontSize: 32, fontFamily: "Courier New", fill: "white", align: "center", listening: false,
    });
    this.typedText.offsetX(this.typedText.width() / 2);
    this.typedText.offsetY(this.typedText.height() / 2);

    // Money counter
    this.moneyText = new Konva.Text({
      x: 20, y: 20, text: "$0",
      fontSize: 24, fontFamily: "Courier New", fill: "#ffd700", align: "left", listening: false,
    });

    this.healthText = new Konva.Text({
      x: STAGE_WIDTH - 200, y: 20, text: "Health: ",
      fontSize: 24, fontFamily: "Courier New", fill: "#ff0000", align: "right", listening: false,
    });

    // Level display (top left)
    this.levelText = new Konva.Text({
      x: 20, y: STAGE_HEIGHT - 90, text: "Level: 1",
      fontSize: 20, fontFamily: "Courier New", fill: "white", align: "left", listening: false,
    });

    // Wave display (top right, next to level)
    this.waveText = new Konva.Text({
      x: 20, y: STAGE_HEIGHT - 60, text: "Waves: 0",
      fontSize: 20, fontFamily: "Courier New", fill: "white", align: "left", listening: false,
    });

    // Enemies left display
    this.enemiesLeftText = new Konva.Text({
      x: 20, y: STAGE_HEIGHT - 30, text: "Enemies: 0",
      fontSize: 20, fontFamily: "Courier New", fill: "white", align: "left", listening: false,
    });
    
    // this.hudContainer.add(this.typedText);
    this.hudContainer.add(this.moneyText);
    this.hudContainer.add(this.healthText);
    this.hudContainer.add(this.levelText);
    this.hudContainer.add(this.waveText);
    this.hudContainer.add(this.enemiesLeftText);
  }

  // Spawn enemy visuals (no world coords here yet)
  spawnEnemyVisuals(En: Enemy): number {
    this.enemyContainer.add(En.prompt.image);
    this.enemyContainer.add(En.image);
    this.enemyContainer.add(En.healthBar);
    this.enemyContainer.add(En.healthBarFill);
    this.enemies.set(En.id, En);
    this.group.getLayer()?.draw();
    return En.id;
  }

  spawnEffectVisuals(Ef: Effect): number {
    this.effectContainer.add(Ef.image);
    this.effects.set(Ef.id, Ef);
    this.group.getLayer()?.draw();
    return Ef.id;
  }

  updateEffects(dt: number, nextLetter: string): void {
    this.effects.forEach((Ef, id) => {
      Ef.update(dt, nextLetter);
      if(Ef.dead == true){
        this.effects.delete(id);
      }
    });
  }
	/** Project world (x,z) to screen (x,y,scale) and apply to enemy visuals. */
	updateEnemyTransform(En: Enemy, dt: number): void {
    En.updateTransform(dt);
    this.group.getLayer()?.batchDraw();
	}

  /** Project world (x,z) to screen (x,y,scale) and apply to enemy visuals. */
	updateEffectTransform(Ef: Effect, dt: number, nextLetter: string): void {
    Ef.update(dt, nextLetter);
    this.group.getLayer()?.batchDraw();
	}


  updateEnemyProgress(id: number, typed: string, isValid: boolean): void {
    const En = this.enemies.get(id);
    if (!En) return;
    const target = En.word;
    const len = Math.min(typed.length, target.length);

    // Show what user actually typed
    En.prompt.typedNode.text(typed);
    En.prompt.restNode.text(target.slice(len));
    En.prompt.restNode.x(En.prompt.typedNode.width());

    // Set color based on validity: green if correct, red if any errors
    if (isValid) {
      En.prompt.typedNode.fill("#12d44e"); // Green for correct
    } else {
      En.prompt.typedNode.fill("red"); // Red for errors
    }

    this.group.getLayer()?.batchDraw();
  }

  destroyEnemy(id: number): void {
    const En = this.enemies.get(id);
    if (!En) return;
    En.prompt.image.destroy();
    En.healthBar.destroy();
    En.healthBarFill.destroy();
    En.destroy();
    this.enemies.delete(id);
    if (this.targetedId === id) this.targetedId = null;
    this.group.getLayer()?.draw();
    this.spawnEffectVisuals(new Explosion(En.x,En.y, En.image.scaleX()));
  }

  destroyEffect(id: number): void {
    const Ef = this.effects.get(id);
    if (!Ef) return;
    Ef.destroy();
    this.effects.delete(id);
  }

  setTarget(id: number | null): void {
    // clear old
    if (this.targetedId && this.enemies.get(this.targetedId)) {
      const old = this.enemies.get(this.targetedId)!;
	  if(old.type === "circle"){
		const circle = old.image.findOne<Konva.Circle>('Circle');
		if(circle){
			circle.shadowBlur(0);
			circle.shadowColor("transparent");
			circle.stroke("#0b5ea8");
			circle.strokeWidth(4);
		}
	  }
    }
    this.targetedId = id;
    // highlight new
    if (id && this.enemies.get(id)) {
      const En = this.enemies.get(id)!;
	  if(En.type === "circle"){
		const circle = En.image.findOne<Konva.Circle>('Circle');
		if(circle){
			circle.stroke("#ffd54a");
      		circle.strokeWidth(4);
	  	}
	  }
    }
    this.group.getLayer()?.batchDraw();
  }

  updateText(text: string): void {
    this.typedText.text(text);
    this.typedText.offsetX(this.typedText.width() / 2);
    this.group.getLayer()?.draw();
  }

    /**
   * Show feedback when user types correct character (shake animation)
   */
  showTypingSuccess(enemyId: number): void {
    const enemy = this.enemies.get(enemyId);
    if (!enemy) return;


    // Create Shot Effect
    // this.spawnEffectVisuals(new Shot(enemy.x,enemy.y, enemy.image.scaleX()));
    // this.spawnEffectVisuals(new Shot(enemy.x,enemy.y, enemy.image.scaleX()));


    // Shake animation parameters
    const originalX = enemy.x;
    const shakeAmount = 10;
    const shakeDuration = 50; // ms per shake

    // Enemy shake
    const Tween = new Konva.Tween({
      node: enemy.image,
      duration: shakeDuration / 1000,
      x: originalX - shakeAmount,
      easing: Konva.Easings.EaseInOut,
      onFinish: () => {
        const Tween2 = new Konva.Tween({
          node: enemy.image,
          duration: shakeDuration / 1000,
          x: originalX + shakeAmount,
          easing: Konva.Easings.EaseInOut,
          onFinish: () => {
            const Tween3 = new Konva.Tween({
              node: enemy.image,
              duration: shakeDuration / 1000,
              x: originalX,
              easing: Konva.Easings.EaseInOut
            });
            Tween3.play();
          }
        });
        Tween2.play();
      }
    });
    Tween.play();
  }

  /**
   * Show error feedback when user types wrong character (shake animation)
   */
  showTypingError(enemyId: number): void {
    const enemy = this.enemies.get(enemyId);
    if (!enemy) return;

    // Shake animation parameters
    const originalTextX = this.typedText.x();
    const originalPromptX = enemy.prompt.x;
    const shakeAmount = 10;
    const shakeDuration = 50; // ms per shake

    // Main text shake
    const textTween = new Konva.Tween({
      node: this.typedText,
      duration: shakeDuration / 1000,
      x: originalTextX - shakeAmount,
      easing: Konva.Easings.EaseInOut,
      onFinish: () => {
        const textTween2 = new Konva.Tween({
          node: this.typedText,
          duration: shakeDuration / 1000,
          x: originalTextX + shakeAmount,
          easing: Konva.Easings.EaseInOut,
          onFinish: () => {
            const textTween3 = new Konva.Tween({
              node: this.typedText,
              duration: shakeDuration / 1000,
              x: originalTextX,
              easing: Konva.Easings.EaseInOut
            });
            textTween3.play();
          }
        });
        textTween2.play();
      }
    });
    textTween.play();

    // Enemy prompt shake
    const promptTween = new Konva.Tween({
      node: enemy.prompt.image,
      duration: shakeDuration / 1000,
      x: originalPromptX - shakeAmount,
      easing: Konva.Easings.EaseInOut,
      onFinish: () => {
        const promptTween2 = new Konva.Tween({
          node: enemy.prompt.image,
          duration: shakeDuration / 1000,
          x: originalPromptX + shakeAmount,
          easing: Konva.Easings.EaseInOut,
          onFinish: () => {
            const promptTween3 = new Konva.Tween({
              node: enemy.prompt.image,
              duration: shakeDuration / 1000,
              x: originalPromptX,
              easing: Konva.Easings.EaseInOut
            });
            promptTween3.play();
          }
        });
        promptTween2.play();
      }
    });
    promptTween.play();
  }

	setDrawOrder(idsClosestFirst: number[]): void {
		let z = 0;
		const idsFarthestFirst = [...idsClosestFirst].reverse();

		for (const id of idsFarthestFirst) {
			const En = this.enemies.get(id);
			if (!En) continue;
      En.prompt.image.zIndex(z++);
			En.image.zIndex(z++);
		}

		this.enemyContainer.getLayer()?.batchDraw();
	}


  updateMoney(amount: number): void {
    this.moneyText.text(`$${amount}`);
    this.group.getLayer()?.batchDraw();
  }

  updateHealth(lives: number): void {
    const hearts = "♥".repeat(lives);
    this.healthText.text(`Health: ${hearts}`);
    this.group.getLayer()?.batchDraw();
  }

  updateLevel(level: number): void {
    this.levelText.text(`Level: ${level}`);
    this.group.getLayer()?.batchDraw();
  }

  updateWaves(wavesRemaining: number): void {
    this.waveText.text(`Waves: ${wavesRemaining}`);
    this.group.getLayer()?.batchDraw();
  }

  updateEnemiesLeft(enemiesLeft: number): void {
    this.enemiesLeftText.text(`Enemies: ${enemiesLeft}`);
    this.group.getLayer()?.batchDraw();
  }

  show(): void { this.group.visible(true); this.group.getLayer()?.draw(); }
  hide(): void { this.group.visible(false); this.group.getLayer()?.draw(); }
  getGroup(): Konva.Group { return this.group; }
}
