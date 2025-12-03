
import { Player } from "../Player/Player.ts";
import ItemRegistry from "../Player/ItemRegistry.ts";

export class Save {
    static levelComplete: number = 0;
    static _loaded: boolean = false;
    // Track unlocked levels per planet type
    static unlockedLevels: { [planetType: string]: number[] } = {
        tutorial_planet: [1], // Tutorial always starts with level 1 unlocked
        campaign_planet: [1], // Campaign always starts with level 1 unlocked
    };

    private static PLAYER_KEY = "PlayerSave";
    private static LEVEL_KEY = "LevelComplete";
    private static UNLOCKED_LEVELS_KEY = "UnlockedLevels";

    public static save(): void {
        try {

            if (!this._loaded) {
                console.warn("Skipping Save.save(): no save loaded yet.");
                return;
            }

            const player = Player.getInstance();
            const playerJson = player.toJSON();

            localStorage.setItem(this.PLAYER_KEY, JSON.stringify(playerJson));
            localStorage.setItem(this.LEVEL_KEY, JSON.stringify(Save.levelComplete ?? 0));
            localStorage.setItem(this.UNLOCKED_LEVELS_KEY, JSON.stringify(Save.unlockedLevels));

            console.log("Game Saved. Unlocked levels:", Save.unlockedLevels);
        } catch (e) {
            console.error("Failed to save game:", e);
        }
    }

    public static load(): void {
        try {
            
            const playerData = localStorage.getItem(this.PLAYER_KEY);

            if (playerData) {
                const parsed = JSON.parse(playerData);
                const registry = ItemRegistry.getInstance();
                const itemsMap = registry.getItemsMap();
                Player.fromJSON(parsed, itemsMap);
            }
        } catch (e) {
            console.warn("No player save found or failed to load player:", e);
        }

        try {
            const level = localStorage.getItem(this.LEVEL_KEY);
            if (level) {
                this.levelComplete = JSON.parse(level);
            }
        } catch (e) {
            console.log("No level data found");
        }

        try {
            const unlockedData = localStorage.getItem(this.UNLOCKED_LEVELS_KEY);
            if (unlockedData) {
                const parsed = JSON.parse(unlockedData);
                this.unlockedLevels = parsed;
                console.log("Loaded unlocked levels:", this.unlockedLevels);
            } else {
                console.log("No unlocked levels data found, using defaults");
            }
        } catch (e) {
            console.log("Failed to load unlocked levels:", e);
        }

        this._loaded = true;
        console.log("Game Loaded");
    }

    public static set loaded(value: boolean) {
        this._loaded = value;
    }

    public static get loaded(): boolean {
        return this._loaded;
    }

    public static unlockNextLevel(planetType: string, currentLevel: number): number {
        if (!this.unlockedLevels[planetType]) {
            this.unlockedLevels[planetType] = [];
        }

        const nextLevel = currentLevel + 1;
        const unlockedArray = this.unlockedLevels[planetType];

        // Check if already unlocked
        if (unlockedArray.includes(nextLevel)) {
            console.log(`Level ${nextLevel} already unlocked`);
            return -1;
        }

        // Unlock the next level
        unlockedArray.push(nextLevel);
        unlockedArray.sort((a, b) => a - b); // Keep sorted
        console.log(`Unlocked level ${nextLevel} for ${planetType}. Unlocked levels:`, unlockedArray);
        return nextLevel;
    }

    public static isLevelUnlocked(planetType: string, level: number): boolean {
        if (!this.unlockedLevels[planetType]) {
            return false;
        }
        return this.unlockedLevels[planetType].includes(level);
    }
}