// src/screens/GameScreen/GameScreenController.ts
import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { GameScreenModel } from "./GameScreenModel.ts";
import { GameScreenView } from "./GameScreenView.ts";

export class GameScreenController extends ScreenController {
  private model: GameScreenModel;
  private view: GameScreenView;
  private screenSwitcher: ScreenSwitcher;
  private keyboardHandler: ((e: KeyboardEvent) => void) | null = null;
  private typedText: string = "";

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;

    this.model = new GameScreenModel();
    this.view = new GameScreenView();
  }

  startGame(): void {
    // Reset and spawn first enemy
    this.model.reset();
    const target = "quickly";
    this.model.setTargetWord(target);

    this.typedText = "";
    this.view.updateText(this.typedText);
    this.view.spawnEnemyWithPrompt(target);
    this.view.updatePromptProgress(this.typedText);

    this.setupKeyboardInput();
    this.view.show();
  }

  private setupKeyboardInput(): void {
    if (this.keyboardHandler) {
      window.removeEventListener("keydown", this.keyboardHandler);
    }

    this.keyboardHandler = (e: KeyboardEvent) => {
      // Backspace
      if (e.key === "Backspace") {
        this.typedText = this.typedText.slice(0, -1);
        this.view.updateText(this.typedText);
        this.view.updatePromptProgress(this.typedText);
        return;
      }

      const target = this.model.getTargetWord();
      if (!target) return;

      // Only accept single displayable chars
      if (e.key.length !== 1) return;

      // Only append if it keeps us as a prefix of the target
      const next = this.typedText + e.key;
      if (target.startsWith(next)) {
        this.typedText = next;
        this.view.updateText(this.typedText);
        this.view.updatePromptProgress(this.typedText);

        // Success condition
        if (this.typedText === target) {
          this.view.destroyEnemy();
          this.model.setScore(this.model.getScore() + 100);
          // Optional: spawn another, or show message, etc.
        }
      }
    };

    window.addEventListener("keydown", this.keyboardHandler);
  }

  hide(): void {
    if (this.keyboardHandler) {
      window.removeEventListener("keydown", this.keyboardHandler);
      this.keyboardHandler = null;
    }
    super.hide();
  }

  getView(): GameScreenView {
    return this.view;
  }
}
