import Konva from "konva";
import { GameScreenModel } from "./screens/GameScreen/GameScreenModel";
import { GameScreenView } from "./screens/GameScreen/GameScreenView";
import type { ScreenSwitcher } from "./types";
import { Money } from "./Money";
import { Health } from "./Health";
import LevelManager from "./Level/LevelManager";

/**
 * GameController handles the core game logic including:
 * - Typing input and targeting
 * - Game loop and collision detection
 * - Score and game over conditions
 * - Delegates enemy/wave management to LevelManager
 */
export class GameController {
    private model: GameScreenModel;
    private view: GameScreenView;
    private screenSwitcher: ScreenSwitcher;
    private levelManager: LevelManager;
    
    // Game state
    private anim?: Konva.Animation;
    private paused: Boolean = false;
    
    // Targeting and input
    private typedText = "";
    private targetedId: number | null = null;
    private keyboardHandler: ((e: KeyboardEvent) => void) | null = null;
    
    // Game parameters
    private readonly NEAR_GAME_OVER = 10;

    constructor(model: GameScreenModel, view: GameScreenView, screenSwitcher: ScreenSwitcher) {
        this.model = model;
        this.view = view;
        this.screenSwitcher = screenSwitcher;
        this.levelManager = new LevelManager(view, screenSwitcher);
    }

    /**
     * Initialize and start the game
     */
    async startGame(): Promise<void> {
        this.resetGameState();
        this.levelManager.initializeLevel();
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
        const currentWave = this.levelManager.currentWave;
        if (currentWave) {
            currentWave.forEach((enemy) => {
                enemy.pause();
            });
        }
        this.paused = true;
    }

    /**
     * unpause all timely elements
     */
    unpauseGame(): void {
        this.startGameLoop();
        const currentWave = this.levelManager.currentWave;
        if (currentWave) {
            currentWave.forEach((enemy) => {
                enemy.unpause();
            });
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
        Money.getInstance().reset();
        //TODO save money earned
        this.view.updateMoney(0);
        Health.getInstance().reset();
        this.view.updateHealth(Health.getInstance().maxLives);
    }

    /**
     * Clear all enemies from the game
     */
    private clearAllEnemies(): void {
        const currentWave = this.levelManager.currentWave;
        if (currentWave) {
            currentWave.forEach((enemy) => {
                this.view.destroyEnemy(enemy.id);
            });
            currentWave.clear();
        }
    }

    // ---------- Wave Management ----------

    /**
     * Handle enemy defeat
     */
    private onEnemyDefeated(id: number): void {
        const currentWave = this.levelManager.currentWave;
        if (!currentWave) return;

        const enemy = currentWave.getEnemy(id);
        if (!enemy) return;

        // Remove from wave and view
        this.levelManager.removeEnemyFromWave(id);
        this.view.destroyEnemy(id);

        // Money reward
        Money.getInstance().add(Money.getInstance().calculateReward(enemy.word.length, enemy.speed));
        this.view.updateMoney(Money.getInstance().amount);

        // Reset targeting if this was the target
        if (this.targetedId === id) {
            this.targetedId = null;
            this.typedText = "";
            this.view.updateText(this.typedText);
            this.view.setTarget(null);
        }

        // Check for wave completion and advance
        this.levelManager.onWaveCheck();
    }

    /**
     * Handle enemy giving damage to player
     */
    private EnemyHitsPlayer(id: number): void {
        const currentWave = this.levelManager.currentWave;
        if (!currentWave) return;

        const enemy = currentWave.getEnemy(id);
        if (!enemy) return;

        // Remove from wave and view
        this.levelManager.removeEnemyFromWave(id);
        this.view.destroyEnemy(id);

        // Reset targeting if this was the target
        if (this.targetedId === id) {
            this.targetedId = null;
            this.typedText = "";
            this.view.updateText(this.typedText);
            this.view.setTarget(null);
        }

        // Check for wave completion and advance
        this.levelManager.onWaveCheck();
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
        let closeEnemy = null;
        const currentWave = this.levelManager.currentWave;
        
        if (!currentWave) return;

        // Update all enemies
        currentWave.forEach((enemy) => {
            enemy.distance = Math.max(0, enemy.distance - enemy.speed * dt);
            this.view.updateEnemyTransform(enemy.id, enemy.x, enemy.distance);
            
            if (enemy.distance <= this.NEAR_GAME_OVER) {
                closeEnemy = enemy.id;
            }
        });

        this.view.setDrawOrder(this.getIdsSortedByDistanceClosestFirst());

        // Check game over condition
        if (closeEnemy !== null) {
            this.EnemyHitsPlayer(closeEnemy);
            Health.getInstance().loseLife();
            this.view.updateHealth(Health.getInstance().lives);
            closeEnemy = null;

            if(Health.getInstance().lives <= 0){
                this.gameOver();
            }
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
        const currentWave = this.levelManager.currentWave;
        console.log(currentWave);
        if (!currentWave) return;

        // Acquire target if none selected
        if (this.targetedId === null) {
            const id = this.levelManager.getEnemyIdByInitial(char);
            if (!id) return; // No enemy with that initial
            
            this.targetedId = id;
            const word = currentWave.getEnemy(id)?.word ?? "ERROR! NO WORD FOUND!";
            console.log(word);
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
        const word = currentWave.getEnemy(id)?.word ?? "";

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
        
        const currentWave = this.levelManager.currentWave;
        if (!currentWave) return;
        
        const id = this.targetedId;
        const word = currentWave.getEnemy(id)?.word ?? "";
        
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
        const currentWave = this.levelManager.currentWave;
        if (!currentWave) return [];
        
        return Array.from(currentWave.getAllEnemies().values())
            .sort((a, b) => a.distance - b.distance)
            .map(e => e.id);
    }

    /**
     * Get current enemy count
     */
    getEnemyCount(): number {
        const currentWave = this.levelManager.currentWave;
        return currentWave ? currentWave.getCount() : 0;
    }

    /**
     * Check if game is currently running
     */
    isRunning(): boolean {
        return this.anim !== undefined;
    }
}