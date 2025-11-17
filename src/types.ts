import type { Group } from "konva/lib/Group";

/**
 * Wave configuration JSON format
 * Format: {"1": "type", "2": "type", ...}, {"health": [1, 2, ...], "speed": [...], ...}
 * Each attribute array should match the number of enemies
 */
export interface WaveConfig {
	types: Record<string, string>;  // {"1": "ufo", "2": "meteor", ...}
	health?: number[];
	speed?: number[];                // Optional speed values for each enemy
	distance?: number[];             // Optional initial distance values
	words?: string[];                // Optional word assignments
	x?: number[];                    // Optional x positions (lanes)
	y?: number[];
}

/**
 * Level configuration JSON format
 * Allows customization of entire levels with multiple waves
 * Format: { "levelNumber": 1, "waves": [{wave config}, {wave config}, ...] }
 */
export interface LevelConfig {
	levelNumber?: number;            // Optional level number (defaults to 1)
	difficulty?: number;             // Optional difficulty multiplier for speed/health
	waves: WaveConfig[];             // Array of wave configurations
}

export interface View {
	getGroup(): Group;
	show(): void;
	hide(): void;
}

/**
 * Screen types for navigation
 *
 * - "menu": Main menu screen
 * - "levelSelect": Level selection screen
 * - "game": Gameplay screen with optional levelNumber
 */
export type Screen =
	| { type: "menu" }
	| { type: "levelSelect" }
	| { type: "game"; levelNumber?: number };

export abstract class ScreenController {
	abstract getView(): View;

	show(): void {
		this.getView().show();
	}

	hide(): void {
		this.getView().hide();
	}
}

export interface ScreenSwitcher {
	switchToScreen(screen: Screen): void;
}
