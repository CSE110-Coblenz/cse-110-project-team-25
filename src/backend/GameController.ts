import Konva from "konva";
import { GameScreenModel } from "../screens/GameScreen/GameScreenModel";
import { GameScreenView } from "../screens/GameScreen/GameScreenView";
import type { ScreenSwitcher } from "../types";
import { Money } from "../Money";
import { Health } from "../Health";
import LevelManager from "../Level/LevelManager";
import { Save } from "./Save";
import { KeyboardController } from "./KeyboardController";

/**
 * GameController handles the core game logic including:
 * - Game loop and collision detection
 * - Score and game over conditions
 * - Delegates enemy/wave management to LevelManager
 * - Delegates input handling to KeyboardController
 */
export class GameController {
    private view: GameScreenView;
    private screenSwitcher: ScreenSwitcher;
    private levelManager: LevelManager;
    private keyboardController: KeyboardController;
    
    // Game state
    private anim?: Konva.Animation;
    private paused: Boolean = false;
    
    // Game parameters
    private readonly NEAR_GAME_OVER = 10;

    constructor(model: GameScreenModel, view: GameScreenView, screenSwitcher: ScreenSwitcher) {
        this.view = view;
        this.screenSwitcher = screenSwitcher;
        this.levelManager = new LevelManager(view, screenSwitcher);
        
        // Initialize keyboard controller with callbacks
        this.keyboardController = new KeyboardController(
            view,
            model,
            this.levelManager,
            {
                onPauseToggle: () => this.togglePause(),
                onEnemyDefeated: (id: number) => this.onEnemyDefeated(id),
                isPaused: () => this.paused as boolean
            }
        );
    }

    /**
     * Initialize and start the game
     * @param levelNumber - Optional level number to load (defaults to 1)
     */
    async startGame(levelNumber?: number): Promise<void> {

        Save.load();
        Save.loaded = true;
        Money.getInstance().amount = Save.money;
        console.log("Loaded money:" + Money.getInstance().amount);
        
        this.resetGameState();
        if (levelNumber !== undefined) {
            this.levelManager.setLevel(levelNumber);
        }
        await this.levelManager.initializeLevel();
        this.keyboardController.setupInput();
        this.startGameLoop();
    }

    /**
     * Stop the game and clean up resources
     */
    stopGame(): void {

        if (Save.loaded) {
            Save.money = Money.getInstance().amount;
            Save.save();
        }
        this.stopGameLoop();
        this.keyboardController.cleanup();
        this.clearAllEnemies();
    }

    /**
     * Toggle pause state
     */
    private togglePause(): void {
        if (this.paused) {
            this.unpauseGame();
        } else {
            this.pauseGame();
        }
    }

    /**
     * pause all timely elements
     */
    pauseGame(): void {
        this.stopGameLoop();
        const currentWave = this.levelManager.currentWave;
        if (currentWave) {
            currentWave.forEachEnemy((enemy) => {
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
            currentWave.forEachEnemy((enemy) => {
                enemy.unpause();
            });
        }
        this.paused = false;
    }

    /**
     * Reset all game state to initial values
     */
    private resetGameState(): void {
        this.keyboardController.reset();
        this.clearAllEnemies();
        this.view.updateMoney(Money.getInstance().amount);
        Health.getInstance().reset();
        this.view.updateHealth(Health.getInstance().maxLives);
    }

    /**
     * Clear all enemies from the game
     */
    private clearAllEnemies(): void {
        const currentWave = this.levelManager.currentWave;
        if (currentWave) {
            currentWave.forEachEnemy((enemy) => {
                this.view.destroyEnemy(enemy.id);
            });
            currentWave.forEachEffect((effect) => {
                this.view.destroyEffect(effect.id);
            })
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

        // Reset targeting if this was the target (handled by KeyboardController)
        this.keyboardController.clearTargetIfMatches(id);

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

        // Reset targeting if this was the target (handled by KeyboardController)
        this.keyboardController.clearTargetIfMatches(id);

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
        currentWave.forEachEnemy((enemy) => {
            enemy.distance = Math.max(0, enemy.distance - enemy.speed * dt);
            this.view.updateEnemyTransform(enemy, dt);
            
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
        this.levelManager.onWaveCheck();

        //update effects
        let word = this.keyboardController.nextLetter()
        if(word === ';') word = "semicolon";
        if(word === '.') word = "period";
        if(word === ',') word = "comma";
        if(word === '/') word = "forwardSlash"
        if(word === "'") word = "apostrophe"
        this.view.updateEffects(dt, word);
    }



    /**
     * Handle game over
     */
    private gameOver(): void {
        this.stopGame();
        this.screenSwitcher.switchToScreen({ type: "menu" });
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