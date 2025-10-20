import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

/**
 * GameScreenView - Renders the game UI using Konva
 */
export class GameScreenView implements View {
	private group: Konva.Group;
	private typedText: Konva.Text;

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

		// Text display for what user types
		this.typedText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: STAGE_HEIGHT / 2,
			text: '',
			fontSize: 48,
			fontFamily: 'Courier New',
			fill: 'white',
			align: 'center',
		});
		this.typedText.offsetX(this.typedText.width() / 2);
		this.typedText.offsetY(this.typedText.height() / 2);
		this.group.add(this.typedText);
	}

	/**
	 * Update the displayed text
	 */
	updateText(text: string): void {
		this.typedText.text(text);
		this.typedText.offsetX(this.typedText.width() / 2);
		this.group.getLayer()?.draw();
	}

	/**
	 * Show the screen
	 */
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	/**
	 * Hide the screen
	 */
	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}
}
