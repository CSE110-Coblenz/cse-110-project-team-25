import { Wave } from "../WaveGen/Wave";
import EnemyFactory from "../WaveGen/EnemyFactory";
import type { GameScreenView } from "../screens/GameScreen/GameScreenView";
import type { ScreenSwitcher, Screen } from "../types";

/**
 * LevelManager manages game progression through levels
 * Handles level counter, waves, and spawning enemies to the screen
 */
class LevelManager {
    private _currentLevel: number = 1;
    // private _waveLevels: Map<number, Wave[]> = new Map(); 
    // private _difficulty: number = 1;
    // private _isEndless: boolean = false;
    private _waves: Wave[] = [];
    private _currentWave: Wave | null = null;
    private enemyFactory: EnemyFactory;
    private view: GameScreenView;
    private screenSwitcher: ScreenSwitcher;
    private activeInitials: Set<string> = new Set();
    private letterToId: Map<string, number> = new Map();


    constructor(view: GameScreenView, screenSwitcher: ScreenSwitcher) {
        this.enemyFactory = new EnemyFactory();
        this.view = view;
        this.screenSwitcher = screenSwitcher;
    }

    /** If isEndless, game will continue indefinitely and not use _waveLevels */
    // set isEndless(value: boolean) {
    //     this._isEndless = value;
    // }

    // get isEndless(): boolean {
    //     return this._isEndless;
    // }

    /** Returns the current level (for UI purposes) */
    get currentLevel(): number {
        return this._currentLevel;
    }

    /** Get waves array */
    get waves(): Wave[] {
        return this._waves;
    }

    /** Get current wave */
    get currentWave(): Wave | null {
        return this._currentWave;
    }

    /** Set the view for rendering enemies */
    setView(view: GameScreenView): void {
        this.view = view;
    }

    /** Advances to the next level. */
    advanceLevel(): void {
        this._currentLevel += 1;
    }

    /** Sets the current level (for testing) */
    setLevel(level: number): void {
        if (level < 1) {
            throw new Error("Level must be at least 1.");
        }
        this._currentLevel = level;
    }

    /**
     * Adds a wave to the waves queue
     */
    addWave(wave: Wave): void {
        this._waves.push(wave);
    }

    /**
     * Pop the next wave from the waves array
     * When currentWave.isEmpty(), this is called to get the next wave
     * When waves array is empty, generate a new level
     */
    private popNextWave(): void {
        if (this._waves.length > 0) {
            this._currentWave = this._waves.shift()!;
        } else {
            // No more waves, increment level and generate new waves
            this.advanceLevel();
            this.generateNewLevel();
            if (this._waves.length > 0) {
                this._currentWave = this._waves.shift()!;
            }
        }
    }

    /**
     * Generate a new set of random waves for the current level
     */
    private generateNewLevel(difficulty?: number): void {
        const wavesPerLevel = 3; // Number of waves per level
        const baseEnemyCount = 3;
        const speedMultiplier = 1 + (this._currentLevel * 0.2);

        for (let i = 0; i < wavesPerLevel; i++) {
            const enemyCount = baseEnemyCount + this._currentLevel + i;
            const wave = this.enemyFactory.generateRandomWave(
                enemyCount,
                speedMultiplier
            );
            this._waves.push(wave);
        }
    }

    /**
     * Check if current wave is empty and handle wave/level progression
     * Call this when an enemy is defeated
     */
    onWaveCheck(): void {
        if (this._currentWave && this._currentWave.isEmpty()) {
            this.popNextWave();
            if (this._currentWave) {
                this.spawnEnemies(this._currentWave);
            }
        }
    }

    /**
     * Initialize the first level
     */
    initializeLevel(): void {
        this.generateNewLevel();
        this.popNextWave();
        if (this._currentWave) {
            this.spawnEnemies(this._currentWave);
        }
    }

    /**
     * Spawn enemies from a wave onto the player's screen
     * Iterates through all entries in the Wave and renders them to the view
     */
    spawnEnemies(wave: Wave): void {
        if (!this.view) {
            throw new Error("View not set. Call setView() before spawning enemies.");
        }

        // Clear tracking data
        this.activeInitials.clear();
        this.letterToId.clear();

        // Iterate through all enemies in the wave
        wave.forEach((enemy) => {
            // Add to view
            this.view!.spawnEnemyVisuals(enemy);
            this.view!.updateEnemyTransform(enemy.id, enemy.x, enemy.distance);

            // Track for targeting
            this.activeInitials.add(enemy.initial.toLowerCase());
            this.letterToId.set(enemy.initial.toLowerCase(), enemy.id);
        });

        // Set draw order based on distance
        const sortedIds = this.getIdsSortedByDistance(wave);
        this.view.setDrawOrder(sortedIds);
    }

    /**
     * Remove an enemy from the current wave
     * Call this when an enemy is defeated
     */
    removeEnemyFromWave(id: number): void {
        if (this._currentWave) {
            const enemy = this._currentWave.getEnemy(id);
            if (enemy) {
                // Remove from letterToId map
                this.letterToId.delete(enemy.initial.toLowerCase());
                // Remove from activeInitials
                this.activeInitials.delete(enemy.initial.toLowerCase());
                // Remove from wave
                this._currentWave.removeEnemy(id);
            }
        }
    }

    /**
     * Get enemy ID by initial character
     * Returns null if no enemy starts with that character
     */
    getEnemyIdByInitial(char: string): number | null {
        return this.letterToId.get(char.toLowerCase()) ?? null;
    }

    /**
     * Switch to a different screen
     */
    switchToScreen(screen: Screen): void {
        this.screenSwitcher.switchToScreen(screen);
    }

    /**
     * Get enemy IDs sorted by distance (closest first)
     */
    private getIdsSortedByDistance(wave: Wave): number[] {
        const enemies = Array.from(wave.getAllEnemies().values());
        return enemies
            .sort((a, b) => a.distance - b.distance)
            .map(e => e.id);
    }

    /**
     * Get tracking data for targeting system
     */
    getActiveInitials(): Set<string> {
        return this.activeInitials;
    }
}

export default LevelManager;