import Konva from "konva";
import { GameScreenModel } from "./screens/GameScreen/GameScreenModel";
import { GameScreenView } from "./screens/GameScreen/GameScreenView";
import type { ScreenSwitcher } from "./types";
import { Money } from "./Money";
import LevelManager from "./Level/LevelManager";
import { Save } from "./GameLogic/Save";
import { Player } from "./Player/Player.ts";
import ItemRegistry from "./Player/ItemRegistry.ts";

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
        Save.load();

        // Sync Player with saved money
        const player = Player.getInstance();
        player.setMoney(Save.money);
        console.log("Loaded money:" + player.getMoney());

        this.resetGameState();
        this.addSampleItems(); // Add sample items for testing
        this.levelManager.initializeLevel();
        this.setupKeyboardInput();
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

    // ---------- Input Handling ----------

    /**
     * Set up keyboard input handling
     */
    private setupKeyboardInput(): void {
        this.cleanupKeyboardInput();

        this.keyboardHandler = (e: KeyboardEvent) => {
            // Tab key toggles inventory UI (works even when paused)
            if (e.key === "Tab") {
                e.preventDefault(); // Prevent default tab behavior
                this.view.toggleInventoryUI();
                return;
            }

            if (e.key === "Escape"){
                if(this.paused){
                    this.unpauseGame()
                } else {
                    this.pauseGame()
                }
                return;
            }
            if(!this.paused){
                // Handle number keys 1-9 for consumable items
                if (e.key >= '1' && e.key <= '9') {
                    const slot = parseInt(e.key) - 1; // Convert to 0-indexed
                    this.useConsumableItem(slot);
                    return;
                }

                if (e.key === "Backspace") {
                    e.preventDefault(); // Prevent default browser backspace behavior
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
     * Use consumable item from inventory
     */
    private useConsumableItem(slot: number): void {
        const player = Player.getInstance();
        const success = player.useConsumable(slot);

        if (success) {
            // Update health and money displays
            this.view.updateHealth(player.getHealth(), player.getEffectiveMaxHealth());
            this.view.updateMoney(player.getMoney());

            // Update inventory UI to reflect changes
            this.view.updateInventoryUI();

            console.log(`Used item in slot ${slot + 1}`);
        }
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
            const word = this.levelManager.currentWave?.getEnemy(this.targetedId)?.word ?? "";
            this.typedText = this.typedText.slice(0, -1);
            this.view.updateText(this.typedText);
            const isValid = this.isTypedTextValid(word, this.typedText);
            this.view.updateEnemyProgress(this.targetedId, this.typedText, isValid);

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
        // console.log(currentWave);
        if (!currentWave) return;
        console.log(this.targetedId);

        // Acquire target if none selected
        if (this.targetedId === null) {
            const id = this.levelManager.getEnemyIdByInitial(char);
            if (!id) return; // No enemy with that initial

            this.targetedId = id;
            const word = currentWave.getEnemy(id)?.word ?? "ERROR! NO WORD FOUND!";
            console.log(word);
            console.log("Hello")
            this.model.setTargetWord(word);

            this.typedText = char;
            this.view.setTarget(id);
            this.view.updateText(this.typedText);
            const isValid = this.isTypedTextValid(word, this.typedText);
            this.view.updateEnemyProgress(id, this.typedText, isValid);
            this.checkCompletion();
            this.view.showTypingSuccess(id);
            return;
        }

        // Progress existing target - accept ALL characters
        const id = this.targetedId;
        const word = currentWave.getEnemy(id)?.word ?? "";


        // Add character to typed text regardless of correctness
        this.typedText += char;
        this.view.updateText(this.typedText);

        // Check if typed text is valid
        const isValid = this.isTypedTextValid(word, this.typedText);
        this.view.updateEnemyProgress(id, this.typedText, isValid);

        // Show shake animation if wrong
        if (!isValid) {
            this.view.showTypingError(id);
        } else {
            this.view.showTypingSuccess(id);
        }

        this.checkCompletion();
    }

    /**
     * Check if typed text matches the target word so far
     */
    private isTypedTextValid(targetWord: string, typedText: string): boolean {
        return targetWord.toLowerCase().startsWith(typedText.toLowerCase());
    }

    /**
     * Check if current word is complete
     */
    private checkCompletion(): void {
        if (this.targetedId === null) return;
        
        const currentWave = this.levelManager.currentWave;
        if (!currentWave) return;

        const id = this.targetedId;
        const enemy = this.levelManager.currentWave?.getEnemy(this.targetedId)
        if(enemy === undefined) return;
        const word = enemy.word ?? "";

        // Only complete if length matches AND text is valid (correct)
        if (word && this.typedText.length === word.length && this.isTypedTextValid(word, this.typedText)) {
            // Apply damage with Player's damage multiplier
            const player = Player.getInstance();
            enemy.health -= player.getDamage();
            if(enemy.health > 0){
                // Reset targeting if this was the target
                if (this.targetedId === id) {
                    this.targetedId = null;
                    this.typedText = "";
                    this.view.updateText(this.typedText);
                    this.view.setTarget(null);
                    this.levelManager.changeWord(enemy, this.levelManager.getWord(word.length))
                }
            } else {
                this.model.setScore(this.model.getScore() + 100);
                this.onEnemyDefeated(id);
            }
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