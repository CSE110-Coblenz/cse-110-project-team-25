import type { Group } from "konva/lib/Group";


/**
 * Type for level screens.
 */
export type planetName = "tutorial_planet" | "campaign_planet"

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
	text?: string[];
	keyboard?: boolean
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
 * - "planetSelect": Planet selection screen
 * - "levelSelect": Level selection screen (with planet type)
 * - "game": Gameplay screen with optional levelNumber and isTutorial flag
 * - "shop": Shop screen for purchasing items
 */
export type Screen =
	| { type: "menu" }
	| { type: "planetSelect" }
	| { type: "levelSelect"; planetType: planetName }
	| { type: planetName }
	| { type: "game"; levelNumber?: number, isTutorial: boolean | null }
	| { type: "shop" };
	// | { type: "debug" }; // DEBUG: Commented out for production

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
