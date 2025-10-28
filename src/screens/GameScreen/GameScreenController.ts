import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { GameScreenModel } from "./GameScreenModel.ts";
import { GameScreenView } from "./GameScreenView.ts";

/**
 * GameScreenController - Coordinates game logic between Model and View
 */
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

	/**
	 * Start the game
	 */
	startGame(): void {
		// Reset
		this.model.reset();
		this.typedText = "";

		// Set up keyboard input handler
		this.setupKeyboardInput();

		// Show view
		this.view.show();
	}

	/**
	 * Setup keyboard input handling
	 */
	private setupKeyboardInput(): void {
		// Remove existing handler if any
		if (this.keyboardHandler) {
			window.removeEventListener("keydown", this.keyboardHandler);
		}

		// Create new handler
		this.keyboardHandler = (e: KeyboardEvent) => {
			// Handle backspace
			if (e.key === "Backspace") {
				this.typedText = this.typedText.slice(0, -1);
				this.view.updateText(this.typedText);
				return;
			}

			// Only accept single character keys
			if (e.key.length !== 1) return;

			// Add character to typed text
			this.typedText += e.key;
			this.view.updateText(this.typedText);
		};

		window.addEventListener("keydown", this.keyboardHandler);
	}

	/**
	 * Hide the screen and clean up
	 */
	hide(): void {
		// Remove keyboard listener
		if (this.keyboardHandler) {
			window.removeEventListener("keydown", this.keyboardHandler);
			this.keyboardHandler = null;
		}

		super.hide();
	}

	/**
	 * Get the view group
	 */
	getView(): GameScreenView {
		return this.view;
	}
}
