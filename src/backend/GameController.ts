import Konva from "konva";
import { GameScreenModel } from "../screens/GameScreen/GameScreenModel";
import { GameScreenView } from "../screens/GameScreen/GameScreenView";
import type { ScreenSwitcher } from "../types";
import { KeyboardController } from "./KeyboardController";
import LevelManager from "../Level/LevelManager";
import { Health } from "../Health";
import { Money } from "../Money";
import { Save } from "./Save";
import { Player } from "../Player/Player.ts";
import ItemRegistry from "../Player/ItemRegistry.ts";

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
     */
    async startGame(): Promise<void> {
        Save.load();

        // Sync Player with saved money
        const player = Player.getInstance();
        player.setMoney(Save.money);
        console.log("Loaded money:" + player.getMoney());

        this.resetGameState();
        await this.levelManager.initializeLevel();
        this.keyboardController.setupInput();
        this.addSampleItems(); // Add sample items for testing
        this.levelManager.initializeLevel();
        this.startGameLoop();
    }

    /**
     * Add sample items to player inventory for testing
     * TODO: Remove this when shop is implemented
     */
    private addSampleItems(): void {
        const player = Player.getInstance();
        const registry = ItemRegistry.getInstance();

        // Clear existing items first (prevents duplicates on restart)
        player.getConsumableInventory().clear();
        player.getUpgradeInventory().clear();

        // Add some consumable items to inventory
        const healthPotion = registry.getItem("health_potion");
        const greaterHealthPotion = registry.getItem("greater_health_potion");
        const heartContainer = registry.getItem("heart_container");
        const moneyBag = registry.getItem("money_bag");

        if (healthPotion) {
            player.addConsumable(healthPotion, 3);
        }
        if (greaterHealthPotion) {
            player.addConsumable(greaterHealthPotion, 2);
        }
        if (heartContainer) {
            player.addConsumable(heartContainer, 2);
        }
        if (moneyBag) {
            player.addConsumable(moneyBag, 2);
        }

        // Add some upgrades
        const damageAmp = registry.getItem("damage_amplifier");
        const luckyToken = registry.getItem("money_multiplier");

        if (damageAmp) {
            player.equipUpgrade(damageAmp, 0);
        }
        if (luckyToken) {
            player.equipUpgrade(luckyToken, 1);
        }

        // Update UI to show items
        this.view.updatePlayerUI();
    }

    /**
     * Stop the game and clean up resources
     */
    stopGame(): void {
        // Save Player's money
        const player = Player.getInstance();
        Save.money = player.getMoney();
        Save.save();

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
        this.keyboardController.reset();
        this.clearAllEnemies();
        this.view.updateMoney(Money.getInstance().amount);
        Health.getInstance().reset();
        this.view.updateHealth(Health.getInstance().maxLives);
        this.view.setTarget(null);

        // Reset Player health
        const player = Player.getInstance();
        player.resetHealth();

        // Update displays with Player values
        this.view.updateMoney(player.getMoney());
        this.view.updateHealth(player.getHealth(), player.getEffectiveMaxHealth());
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

        // Money reward - use Player's money system with modifiers
        const player = Player.getInstance();
        const baseReward = Money.getInstance().calculateReward(enemy.word.length, enemy.speed);
        player.addMoney(baseReward); // This applies money multiplier!
        this.view.updateMoney(player.getMoney());

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
        currentWave.forEach((enemy) => {
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

            // Use Player's health system
            const player = Player.getInstance();
            player.takeDamage(1);
            this.view.updateHealth(player.getHealth(), player.getEffectiveMaxHealth());
            closeEnemy = null;

            if(player.isDead()){
                this.gameOver();
            }
        }
        this.levelManager.onWaveCheck();

        //update effects
        this.view.updateEffects(dt);
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