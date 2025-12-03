import { Wave } from "../WaveGen/Wave";
import DifficultyUtil from "../backend/difficulty/DifficultyUtil";
import EnemyFactory from "../WaveGen/EnemyFactory";
import type GameScreenView from "../screens/GameScreen/GameScreenView";
import type { ScreenSwitcher, Screen } from "../types";
import Enemy from "../objects/Enemy"
import Effect from "../objects/Effect"

/**
 * LevelManager manages game progression through levels
 * Handles level counter, waves, and spawning enemies to the screen
 */
class LevelManager {
    private _currentLevel: number = 1;
    private _isEndless: boolean = false;
    private _waves: Wave[] = [];
    private _currentWave: Wave | null = null;
    private _difficultyUtil: DifficultyUtil;
    private enemyFactory: EnemyFactory;
    private view: GameScreenView;
    private screenSwitcher: ScreenSwitcher;
    private letterToId: Map<string, number> = new Map();
    private _isTransitioning: boolean = false;
    private isTutorial: boolean | undefined = undefined;

    constructor(view: GameScreenView, screenSwitcher: ScreenSwitcher) {
        this._difficultyUtil = new DifficultyUtil(10);
        this.enemyFactory = new EnemyFactory(this._difficultyUtil);
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

    set difficulty(value: number) {
        this._difficultyUtil.difficulty = value;
    }
    /**
     * Get the current difficulty level
     */
    get difficulty(): number {
        return this._difficultyUtil.difficulty;
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
     * returns true if new level was generated, false otherwise
     */
    async popNextWave(): Promise<boolean> {
        if (this._waves.length > 0) {
            this._currentWave = this._waves.shift()!;
            return false;
        } else {
            // No more waves, increment level and generate new waves
            this.advanceLevel();
            await this.generateNewLevel();
            if (this._waves.length > 0) {
                this._currentWave = this._waves.shift()!;
            }
            return true;
        }
    }

    /**
     * Generate a new set of random waves for the current level (endless mode)
     */
    private generateRandomLevel(): void {
        const wavesPerLevel = 3; // Number of waves per level

        for (let i = 0; i < wavesPerLevel; i++) {
            // Use difficulty-based enemy count if available, otherwise use level scaling
            const speedMultiplier = this._difficultyUtil.randSpeedMultiplier();
            const enemyCount = this._difficultyUtil.randEnemyCount();
            const wave = this.enemyFactory.generateRandomWave(
                enemyCount,
                speedMultiplier,
                this
            );
            this._waves.push(wave);
        }
    }

    /**
     * Generate a new level from config or random (for endless mode)
     */
    async generateNewLevel(): Promise<void> {
        // Endless mode: generate random waves
        if (this.isTutorial === undefined) {
            this.generateRandomLevel();
            return;
        }
        
        // Tutorial or campaign mode: load from JSON
        if (this.isTutorial) {
            await this.loadLevelFromJSON(`./levels/tutorial/level${this.currentLevel}.json`)
        } else {
            await this.loadLevelFromJSON(`./levels/campaign/level${this.currentLevel}.json`)
        }
    }

    /**
     * Check if current wave is empty and handle wave/level progression
     * Call this when an enemy is defeated
     * If newLevel wants to be generated from popNextWave(), switch to level select screen if isTutorial is true or false.
     * If isTutorial is undefined (endless mode), just generate new level and continue.
     */
    async onWaveCheck(): Promise<void> {
        if (this._currentWave && this._currentWave.isEmpty()) {
 
            this._currentWave.forEachEffect((effect) => {
                this.view.destroyEffect(effect.id);
            })

            if (this._isTransitioning) return;
            this._isTransitioning = true;
            try {
                const newLevel = await this.popNextWave();
                if (newLevel && this.isTutorial) {
                    this.screenSwitcher.switchToScreen({ type: "levelSelect", planetType: "tutorial_planet"});
                }
                else if (newLevel && this.isTutorial === false) {
                    this.screenSwitcher.switchToScreen({ type: "levelSelect", planetType: "campaign_planet"});
                }
                else if (this._currentWave) {
                    this.spawnNewWave();
                }
            } finally {
                this._isTransitioning = false;
            }
        }
    }

    /**
     * Initialize the first level
     * @param isTutorial - true for tutorial, false for campaign, undefined for endless mode
     */
    async initializeLevel(isTutorial?: boolean): Promise<void> {
        // Clear any existing state from previous game sessions
        if (this._currentWave) {
            // Clean up old effects
            this._currentWave.forEachEffect((effect) => {
                this.view.destroyEffect(effect.id);
            });
            // Clean up old enemies
            this._currentWave.forEachEnemy((enemy) => {
                this.view.destroyEnemy(enemy.id);
            });
            this._currentWave.clear();
        }
        this._waves = [];
        this._currentWave = null;
        this.letterToId.clear();

        // Set the tutorial mode
        this.isTutorial = isTutorial;
        console.log("Tutorial mode:", this.isTutorial);

        // Generate and start new level
        await this.generateNewLevel();
        await this.popNextWave();
        if (this._currentWave) {
            this.spawnNewWave();
        }
    }

    /**
     * Spawn enemies from currentWave onto the player's screen
     * Iterates through all entries in the Wave and renders them to the view
     */
    spawnNewWave(): void {
        if(this._currentWave == undefined) return
        // Clear tracking data
        this.letterToId.clear();

        // Iterate through all enemies in the wave
        this._currentWave.forEachEnemy((enemy) => {
            this.spawnEnemy(enemy);
        });

        // Iterate through all effects in the wave
        this._currentWave.forEachEffect((effect) => {
            this.spawnEffect(effect);
        });
    }

    spawnEnemy(enemy: Enemy): void {
        if(this._currentWave == undefined) return

        if (!this.view) {
            throw new Error("View not set. Call setView() before spawning enemies.");
        }

        // Add to view
        this.view!.spawnEnemyVisuals(enemy);
        this.view!.updateEnemyTransform(enemy, 0);

        // Track for targeting
        let initial;
        if(enemy.initial != undefined){
            initial = enemy.initial.toLowerCase()
        } else {
            initial = " "
        }
        this.letterToId.set(initial, enemy.id);

        // Set draw order based on distance
        const sortedIds = this.getIdsSortedByDistance(this._currentWave);
        this.view.setDrawOrder(sortedIds);

        // Update level and wave display
        this.view.updateLevel(this._currentLevel);
        this.view.updateWaves(this._waves.length);
        this.view.updateEnemiesLeft(this._currentWave.getCount());
    }

    spawnEffect(effect: Effect): void {
        if(this._currentWave == undefined) return

        if (!this.view) {
            throw new Error("View not set. Call setView() before spawning enemies.");
        }

        // Add to view
        this.view!.spawnEffectVisuals(effect);
        this.view!.updateEffectTransform(effect, 0, "");
    }

    spawnAdditionalEnemy(enemy: Enemy): void {
        this._currentWave?.addEnemy(enemy);
        this.spawnEnemy(enemy);
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
                let initial;
                if(enemy.initial != undefined){
                    initial = enemy.initial.toLowerCase()
                } else {
                    initial = " "
                }
                this.letterToId.delete(initial);
                // Remove from wave
                this._currentWave.removeEnemy(id);
                
                // Update enemies left display
                this.view.updateEnemiesLeft(this._currentWave.getCount());
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

    changeWord(En: Enemy, word: string): void {
        this.letterToId.delete(En.word[0]);
        En.word = word;
        this.letterToId.set(word[0], En.id);
    }
    /**
     * Get a word based on current difficulty level
     * @param length Optional specific length (overrides difficulty-based selection)
     */
    getWord(length?: number): string {
        if(this._currentWave != undefined){
            if (length !== undefined) {
                // If length is specified, use the original method
                return this.enemyFactory.getRandomWord(this._currentWave.activeInitials, length);
            } else {
                length = this._difficultyUtil.randWordLength();
                return this.enemyFactory.getRandomWord(this._currentWave.activeInitials, length);
            }
        }
        return "CANT USE GET WORD WITHOUT CURRENTWAVE"
    }
  
    /**
     * Load level configuration from JSON, 
     * generate random wave if none provided.
     * @param url - Path to the level JSON file (e.g., './levels/level1.json')
     */
    async loadLevelFromJSON(url: string): Promise<void> {
        if (url){
            try {
                const waves = await this.enemyFactory.loadLevelFromJSON(url, this);
                this._waves = waves;
                return;
            } catch (error) {
                throw new Error(`Failed to load level from ${url}: ${error}`);
            }
        }
    }

}

export default LevelManager;