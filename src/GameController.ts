import Konva from "konva";
import { GameScreenModel } from "./screens/GameScreen/GameScreenModel";
import { GameScreenView } from "./screens/GameScreen/GameScreenView";
import { wordBank } from "./words/wordBank";
import Enemy from "./objects/Enemy";
import type { ScreenSwitcher } from "./types";
import { Money } from "./Money";

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
    private paused: Boolean = false;
    
    // Targeting and input
    private typedText = "";
    private targetedId: number | null = null;
    private keyboardHandler: ((e: KeyboardEvent) => void) | null = null;
    
    // Enemy management
    private enemies = new Map<number, Enemy>();
    private activeInitials = new Set<string>();
    private letterToId = new Map<string, number>();
    
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
        this.resetGameState();
        this.spawnWave(3);
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
     * pause all timely elements
     */
    pauseGame(): void {
        this.stopGameLoop();
        for (const [_, enemy] of this.enemies){
            enemy.pause();
        }
        this.paused = true;
    }

    /**
     * unpause all timely elements
     */
    unpauseGame(): void {
        this.startGameLoop();
        for (const [_, enemy] of this.enemies){
            enemy.unpause();
        }
        this.paused = false;
    }

    /**
     * Reset all game state to initial values
     */
    private resetGameState(): void {
        this.typedText = "";
        this.view.updateText(this.typedText);
        this.targetedId = null;
        this.clearAllEnemies();
        this.view.setTarget(null);
        this.mult = 1;
        Money.getInstance().reset();
        //TODO save money earned
        this.view.updateMoney(0);
    }

    /**
     * Clear all enemies from the game
     */
    private clearAllEnemies(): void {
        for (const enemy of Array.from(this.enemies.values())) {
            this.view.destroyEnemy(enemy.id);
        }
        this.enemies.clear();
        this.activeInitials.clear();
        this.letterToId.clear();
    }

    // ---------- Wave Management ----------

    /**
     * Spawn a wave of enemies
     */
    private spawnWave(n: number): void {
        for (let i = 0; i < n; i++) {
            const word = wordBank.getRandomWordExcludingInitials(this.activeInitials, ["bnm,.", "zxcv", "ty", "uiop", "qwer", "gh", "asdfjkl;"], Math.round(Math.random() * 4 + 1));

            // const word = words[i]
            if (!word) break;

            const lane = Math.random() * 6 - 3; // -3..+3
            const z = 40 + Math.random() * 30;  // 40..70
            const speed = (5 + Math.random() * 4) * this.mult;

            const type = Math.random() > 0.5 ? "meteor" : "ufo";
            const enemy = new Enemy(type, word, 1, z, 0, speed);

            enemy.x = lane;
            this.enemies.set(enemy.id, enemy);

            // Add to view
            this.view.spawnEnemyVisuals(enemy);
            this.view.updateEnemyTransform(enemy.id, lane, z);

            // Track for targeting
            this.activeInitials.add(word[0].toLowerCase());
            this.letterToId.set(word[0].toLowerCase(), enemy.id);
        }
        this.view.setDrawOrder(this.getIdsSortedByDistanceClosestFirst());
    }

    /**
     * Handle enemy defeat
     */
    private onEnemyDefeated(id: number): void {
        const enemy = this.enemies.get(id);
        if (!enemy) return;

        // Remove from tracking
        this.activeInitials.delete(enemy.initial);
        this.letterToId.delete(enemy.initial);
        this.enemies.delete(id);

        // Remove from view
        this.view.destroyEnemy(id);

        // Money rewward
        Money.getInstance().add(Money.getInstance().calculateReward(enemy.word.length, enemy.speed));
        this.view.updateMoney(Money.getInstance().amount);

        // Reset targeting if this was the target
        if (this.targetedId === id) {
            this.targetedId = null;
            this.typedText = "";
            this.view.updateText(this.typedText);
            this.view.setTarget(null);
        }

        // Check for wave completion
        if (this.enemies.size === 0) {
            this.mult *= 1.2;
            this.spawnWave(3);
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

        this.view.setDrawOrder(this.getIdsSortedByDistanceClosestFirst());

        // Check game over condition
        if (anyTooClose) {
            this.gameOver();
        }
    }

    /**
     * Handle game over
     */
    private gameOver(): void {
        this.stopGame();
        this.screenSwitcher.switchToScreen({ type: "menu" });
    }

    // ---------- Input Handling ----------

    /**
     * Set up keyboard input handling
     */
    private setupKeyboardInput(): void {
        this.cleanupKeyboardInput();

        this.keyboardHandler = (e: KeyboardEvent) => {
            if (e.key === "Escape"){
                if(this.paused){
                    this.unpauseGame()
                } else {
                    this.pauseGame()
                }
            }
            if(!this.paused){
                if (e.key === "Backspace") {
                    this.handleBackspace();
                    return;
                }

                if (e.key.length !== 1) return;
                this.handleCharacterInput(e.key.toLowerCase());
            }
        };

        window.addEventListener("keydown", this.keyboardHandler);
    }

    /**
     * Clean up keyboard input handling
     */
    private cleanupKeyboardInput(): void {
        if (this.keyboardHandler) {
            window.removeEventListener("keydown", this.keyboardHandler);
            this.keyboardHandler = null;
        }
    }

    /**
     * Handle backspace input
     */
    private handleBackspace(): void {
        if (this.targetedId !== null) {
            this.typedText = this.typedText.slice(0, -1);
            this.view.updateText(this.typedText);
            this.view.updateEnemyProgress(this.targetedId, this.typedText);
            
            if (this.typedText.length === 0) {
                this.view.setTarget(null);
                this.targetedId = null;
            }
        }
    }

    /**
     * Handle character input
     */
    private handleCharacterInput(char: string): void {
        // Acquire target if none selected
        if (this.targetedId === null) {
            const id = this.letterToId.get(char);
            if (!id) return; // No enemy with that initial
            
            this.targetedId = id;
            const word = this.enemies.get(id)?.word ?? "";
            this.model.setTargetWord(word);
            
            this.typedText = char;
            this.view.setTarget(id);
            this.view.updateText(this.typedText);
            this.view.updateEnemyProgress(id, this.typedText);
            this.checkCompletion();
            return;
        }

        // Progress existing target
        const id = this.targetedId;
        const word = this.enemies.get(id)?.word ?? "";
        const nextTyped = this.typedText + char;

        if (!word.toLowerCase().startsWith(nextTyped.toLowerCase())) {
            return; // Ignore wrong character
        }

        this.typedText = nextTyped;
        this.view.updateText(this.typedText);
        this.view.updateEnemyProgress(id, this.typedText);
        this.checkCompletion();
    }

    /**
     * Check if current word is complete
     */
    private checkCompletion(): void {
        if (this.targetedId === null) return;
        
        const id = this.targetedId;
        const word = this.enemies.get(id)?.word ?? "";
        
        if (word && this.typedText.length === word.length) {
            this.model.setScore(this.model.getScore() + 100);
            this.onEnemyDefeated(id);
        }
    }

    // ---------- Utility Methods ----------

    /**
     * Get enemy IDs sorted by distance (closest first)
     */
    private getIdsSortedByDistanceClosestFirst(): number[] {
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
}