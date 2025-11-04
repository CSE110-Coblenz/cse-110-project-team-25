import Konva from "konva";
import { GameScreenModel } from "../screens/GameScreen/GameScreenModel";
import { GameScreenView } from "../screens/GameScreen/GameScreenView";
import { wordBank } from "../words/wordBank";
import Enemy from "../objects/Enemy";
import type { ScreenSwitcher } from "../types";
import { KeyboardController } from "./KeyboardController";

/**
 * GameController handles the core game logic including:
 * - Enemy management and waves
 * - Typing input and targeting
 * - Game loop and collision detection
 * - Score and game over conditions
 */
export class GameController {
    private model: GameScreenModel;
    private view: GameScreenView;
    private screenSwitcher: ScreenSwitcher;
    
    // Game state
    private mult: number = 1;
    private anim?: Konva.Animation;
    
    // Keyboard controller
    private keyboardController?: KeyboardController;
    
    // Enemy management
    private enemies = new Map<number, Enemy>();
    private letterToId = new Map<string, number[]>();
    private activeWords = new Set<string>();
    
    // Game parameters
    private readonly NEAR_GAME_OVER = 10;

    constructor(model: GameScreenModel, view: GameScreenView, screenSwitcher: ScreenSwitcher) {
        this.model = model;
        this.view = view;
        this.screenSwitcher = screenSwitcher;
    }

    /**
     * Initialize and start the game
     */
    async startGame(): Promise<void> {
        await wordBank.load("/wordbank.json");
        this.resetGameState();
        this.testSpawnEnemies(3, "test");
        this.testSpawnEnemies(3, "tesk");
        // this.spawnWave(3); // placeholder test
        this.setupKeyboardInput();
        this.startGameLoop();
    }

    /**
     * Stop the game and clean up resources
     */
    stopGame(): void {
        this.stopGameLoop();
        this.cleanupKeyboardInput();
        this.clearAllEnemies();
    }

    /**
     * Reset all game state to initial values
     */
    private resetGameState(): void {
        this.keyboardController?.reset();
        this.view.updateText("");
        this.clearAllEnemies();
        this.view.setTarget([]);
        this.mult = 1;
    }

    /**
     * Clear all enemies and enemy trackers from the game.
     */
    private clearAllEnemies(): void {
        for (const enemy of Array.from(this.enemies.values())) {
            this.view.destroyEnemy(enemy.id);
        }
        this.enemies.clear();
        this.letterToId.clear();
        this.activeWords.clear();
    }

    // ---------- Wave Management ----------

    /**
     * Spawn a wave of enemies
     */
    private spawnWave(n: number): void {
        for (let i = 0; i < n; i++) {
            this.spawnEnemy();
        }
        this.view.setDrawOrder(this.getSortedIdsByDistance());
    }

    private spawnEnemy(word: string | null = null, type: string = "circle"): void {
        if (!word) {
            word = wordBank.getRandomWord(this.activeWords);
            if (!word) { return; }
        }

        const lane = Math.random() * 6 - 3; // -3..+3
        const z = 40 + Math.random() * 30;  // 40..70
        const speed = (5 + Math.random() * 4) * this.mult;

        // Use simple circle visuals by default; sprite assets can be wired later
        const enemy = new Enemy(type, word, 1, z, 0, speed);

        enemy.x = lane;
        this.enemies.set(enemy.id, enemy);

        // Add to view
        this.view.spawnEnemyVisuals(enemy);
        this.view.updateEnemyTransform(enemy.id, lane, z);

        // Track for targeting - support multiple enemies with same initial
        const initial = word[0].toLowerCase();
        const existingIds = this.letterToId.get(initial) || [];
        this.letterToId.set(initial, [...existingIds, enemy.id]);
        this.activeWords.add(word);
    }
    /**
     * Handle enemy defeat
     */
    private onEnemyDefeated(id: number): void {
        const enemy = this.enemies.get(id);
        if (!enemy) return;

        // Remove from tracking
        const initial = enemy.initial;
        const ids = this.letterToId.get(initial) || [];
        const filteredIds = ids.filter(existingId => existingId !== id);
        if (filteredIds.length > 0) {
            this.letterToId.set(initial, filteredIds);
        } else {
            this.letterToId.delete(initial);
        }
        this.activeWords.delete(enemy.word);
        this.enemies.delete(id);

        // Remove from view
        this.view.destroyEnemy(id);

        // Reset targeting if this was the target (handled by KeyboardController)
        const targetedIds = this.keyboardController?.getTargetedIds();
        if (targetedIds && targetedIds.includes(id)) {
            if (this.keyboardController) {
                this.keyboardController.reset();
            }
            for (const tid in targetedIds) {
                // let En: Enemy = this.enemies.get(Number(tid));
            }
            this.view.updateText("");
            this.view.setTarget([]);
        }
            
        // Check for wave completion
        if (this.enemies.size === 0) {
            this.mult *= 1.2;
            //this.spawnWave(3);
            this.testSpawnEnemies(2, "j");
            this.testSpawnEnemies(2, "k");
        }
    }

    // ---------- Game Loop ----------

    /**
     * Start the game animation loop
     */
    private startGameLoop(): void {
        const layer = this.view.getGroup().getLayer()!;
        this.anim = new Konva.Animation((frame) => {
            const dt = (frame?.timeDiff ?? 0) / 1000;
            if (dt > 0) this.update(dt);
        }, layer);
        this.anim.start();
    }

    /**
     * Stop the game animation loop
     */
    private stopGameLoop(): void {
        this.anim?.stop();
        this.anim = undefined;
    }

    /**
     * Main game update loop
     */
    private update(dt: number): void {
        let anyTooClose = false;

        // Update all enemies
        for (const enemy of this.enemies.values()) {
            enemy.distance = Math.max(0, enemy.distance - enemy.speed * dt);
            this.view.updateEnemyTransform(enemy.id, enemy.x, enemy.distance);
            
            if (enemy.distance <= this.NEAR_GAME_OVER) {
                anyTooClose = true;
            }
        }

        this.view.setDrawOrder(this.getSortedIdsByDistance());


        // Check game over condition
        if (anyTooClose) {
            this.gameOver();
        }
        // console.log("Enemies remaining:", this.enemies.size);
        // console.log("Active words:", Array.from(this.activeWords).join(", "));
    }

    /**
     * Handle game over
     */
    private gameOver(): void {
        this.stopGame();
        this.screenSwitcher.switchToScreen({ type: "menu" });
    }

    /**
     * Set up keyboard input handling
     */
    private setupKeyboardInput(): void {
        this.cleanupKeyboardInput();
        this.keyboardController = new KeyboardController({
            onTextUpdate: (text: string) => {
                this.view.updateText(text);
            },
            onTargetsAcquired: (ids: number[], word: string) => {
                this.model.setTargetWords(word);
                this.view.setTarget(ids);
            },
            onTargetsCleared: () => {
                this.view.setTarget([]);
            },
            onWordComplete: (id: number) => {
                this.model.setScore(this.model.getScore() + 100);
                this.onEnemyDefeated(id);
            },
            onProgressUpdate: (id: number, matchedText: string, unmatchedText: string) => {
                this.view.updateEnemyProgress(id, matchedText, unmatchedText);
            },
            onHighlightClosest: (closestId: number | null) => {
                this.view.highlightClosestMatch(closestId);
            },
            getWordForId: (id: number) => {
                return this.enemies.get(id)?.word;
            },
            getIdsForInitial: (char: string) => {
                return this.letterToId.get(char) || [];
            },
            getClosestMatchingEnemy: (ids: number[], typedText: string) => {
                return this.findClosestMatchingEnemy(ids, typedText);
            },
            getAllEnemyIds: () => {
                return Array.from(this.enemies.keys());
            }
        });
        this.keyboardController.start();
    }

    /**
     * Clean up keyboard input handling
     */
    private cleanupKeyboardInput(): void {
        this.keyboardController?.stop();
        this.keyboardController = undefined;
    }

    // ---------- Utility Methods ----------

    /**
     * Find the closest matching enemy from a list of IDs based on typed text
     * Selects the enemy with the closest distance (z-coordinate)
     */
    private findClosestMatchingEnemy(ids: number[], typedText: string): number | null {
        if (ids.length === 0) return null;
        
        // Filter to only enemies that match the typed text
        const matchingEnemies = ids
            .map(id => this.enemies.get(id))
            .filter((enemy): enemy is Enemy => {
                if (!enemy) return false;
                return enemy.word.toLowerCase().startsWith(typedText.toLowerCase());
            });
        
        if (matchingEnemies.length === 0) return null;
        
        // Find the closest enemy (smallest distance)
        const closest = matchingEnemies.reduce((closest, current) => {
            return current.distance < closest.distance ? current : closest;
        });
        
        return closest.id;
    }

    /**
     * Get enemy IDs sorted by distance (closest first)
     */
    private getSortedIdsByDistance(): number[] {
        return Array.from(this.enemies.values())
            .sort((a, b) => a.distance - b.distance)
            .map(e => e.id);
    }

    /**
     * Get current enemy count
     */
    getEnemyCount(): number {
        return this.enemies.size;
    }

    /**
     * Check if game is currently running
     */
    isRunning(): boolean {
        return this.anim !== undefined;
    }


    // ---------- Test Methods ----------

    private testSpawnEnemies(n: number, word: string | null = null): void {
         for (let i = 0; i < n; i++) {
            this.spawnEnemy(word);
        }
        this.view.setDrawOrder(this.getSortedIdsByDistance());
    }
}
