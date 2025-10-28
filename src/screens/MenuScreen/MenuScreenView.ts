import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

/**
 * MenuScreenView - Renders the menu screen
*/
export class MenuScreenView implements View {
	private group: Konva.Group;

	constructor(onStartClick: () => void) {
		this.group = new Konva.Group({ visible: true });

		// Background
		const bg = new Konva.Rect({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			fill: "#0f0f23",
		});
		this.group.add(bg);

		// Title text
		const title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 150,
			text: "Cosmic Keyboard Captain",
			fontSize: 48,
			fontFamily: "Times New Roman",
			fill: "white",
			stroke: "black",
			strokeWidth: 2,
			align: "center",
		});
		// Center the text using offsetX
		title.offsetX(title.width() / 2);
		this.group.add(title);

		const startButton = new Konva.Rect({
			x: STAGE_WIDTH / 2 - 100,
			y: 300,
			width: 200,
			height: 60,
			fill: "green",
			cornerRadius: 10,
			stroke: "darkgreen",
			strokeWidth: 3,
		});
		startButton.on("click", onStartClick);
		startButton.on("mouseenter", () => {
			startButton.fill("lightgreen");
			this.group.getLayer()?.draw();
		});
		startButton.on("mouseleave", () => {
			startButton.fill("green");
			this.group.getLayer()?.draw();
		});
		this.group.add(startButton);

		const startText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 315,
			text: "START GAME",
			fontSize: 24,
			fontFamily: "Arial",
			fill: "white",
			align: "center",
			listening: false, // Don't intercept mouse events
		});
		startText.offsetX(startText.width() / 2);
		this.group.add(startText);
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
