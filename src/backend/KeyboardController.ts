import { GameScreenModel } from "../screens/GameScreen/GameScreenModel";
import { GameScreenView } from "../screens/GameScreen/GameScreenView";
import LevelManager from "../Level/LevelManager";
import { Player } from "../Player/Player.ts";

/**
 * KeyboardController handles all keyboard input for the game
 * Manages typing mechanics, targeting, and input validation
 * 
 * CONFIGURATION: Set REQUIRE_SPACEBAR_TO_FIRE to toggle firing mode
 * - true: Must press spacebar after typing word to fire
 * - false: Auto-fires immediately when word is complete
 */
export class KeyboardController {
    // Configuration: Toggle spacebar firing requirement
    private static readonly REQUIRE_SPACEBAR_TO_FIRE = true; // Set to false for auto-fire mode

    private view: GameScreenView;
    private model: GameScreenModel;
    private levelManager: LevelManager;
    
    // Typing state
    private typedText: string = "";
    private targetedId: number | null = null;
    private keyboardHandler: ((e: KeyboardEvent) => void) | null = null;
    
    // Callbacks for game events
    private onPauseToggle: () => void;
    private onEnemyDefeated: (id: number) => void;
    private isPaused: () => boolean;
    private onToggleInventory: () => void;
    private onUseConsumable: (slot: number) => void;

    constructor(
        view: GameScreenView,
        model: GameScreenModel,
        levelManager: LevelManager,
        callbacks: {
            onPauseToggle: () => void;
            onEnemyDefeated: (id: number) => void;
            isPaused: () => boolean;
            onToggleInventory: () => void;
            onUseConsumable: (slot: number) => void;
        }
    ) {
        this.view = view;
        this.model = model;
        this.levelManager = levelManager;
        this.onPauseToggle = callbacks.onPauseToggle;
        this.onEnemyDefeated = callbacks.onEnemyDefeated;
        this.isPaused = callbacks.isPaused;
        this.onToggleInventory = callbacks.onToggleInventory;
        this.onUseConsumable = callbacks.onUseConsumable;
    }

    /**
     * Set up keyboard input handling
     */
    setupInput(): void {
        this.cleanup();

        this.keyboardHandler = (e: KeyboardEvent) => {
            // Tab key toggles inventory UI (works even when paused)
            if (e.key === "Tab") {
                e.preventDefault();
                this.onToggleInventory();
                return;
            }

            if (e.key === "Escape") {
                this.onPauseToggle();
                return;
            }

            if (!this.isPaused()) {
                // Handle number keys 1-9 for consumable items
                if (e.key >= '1' && e.key <= '9') {
                    const slot = parseInt(e.key) - 1;
                    this.onUseConsumable(slot);
                    return;
                }

                //check for textboxes
                let id = this.levelManager.getEnemyIdByInitial(" ");
                if(id != null) this.fireAtEnemy();
                if (e.key === "Backspace") {
                    e.preventDefault(); // Prevent default browser backspace behavior
                    this.handleBackspace();
                    return;
                }

                if (KeyboardController.REQUIRE_SPACEBAR_TO_FIRE && e.key === " ") {
                    e.preventDefault(); // Prevent default spacebar behavior (page scroll)
                    this.handleSpacebar();
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
    cleanup(): void {
        if (this.keyboardHandler) {
            window.removeEventListener("keydown", this.keyboardHandler);
            this.keyboardHandler = null;
        }
    }

    /**
     * Reset typing state
     */
    reset(): void {
        this.typedText = "";
        this.targetedId = null;
        this.view.updateText(this.typedText);
        this.view.setTarget(null);
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
        if (!currentWave) return;

        // Acquire target if none selected
        if (this.targetedId === null) {
            const id = this.levelManager.getEnemyIdByInitial(char);
            if (!id) return; // No enemy with that initial

            this.targetedId = id;
            const word = currentWave.getEnemy(id)?.word ?? "ERROR! NO WORD FOUND!";
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
     * Check if the current word is fully typed (ready to fire)
     */
    private isWordComplete(): boolean {
        if (this.targetedId === null) return false;
        
        const currentWave = this.levelManager.currentWave;
        if (!currentWave) return false;

        const enemy = currentWave.getEnemy(this.targetedId);
        if (!enemy) return false;
        
        const word = enemy.word ?? "";
        return !!word && this.typedText.length === word.length && this.isTypedTextValid(word, this.typedText);
    }

    /**
     * Handle spacebar press to fire at enemy
     */
    private handleSpacebar(): void {
        // Simply call checkCompletion with manual fire flag
        if(this.isWordComplete()){
            this.fireAtEnemy();
        } else {
            this.handleCharacterInput(" ");
        }
    }

    /**
     * Check if current word is complete and fire automatically (if spacebar mode is disabled)
     */
    private checkCompletion(): void {
        // If spacebar mode is enabled, do nothing (user must press spacebar to fire)
        if (KeyboardController.REQUIRE_SPACEBAR_TO_FIRE) {
            return;
        }

        // Auto-fire mode: Fire immediately when word is complete
        this.fireAtEnemy();
    }

    /**
     * Fire at the targeted enemy (shared logic for both auto-fire and manual spacebar fire)
     */
    private fireAtEnemy(): void {
        let id = this.levelManager.getEnemyIdByInitial(" ");
        const currentWave = this.levelManager.currentWave;
        if (!currentWave) return;
        if(id === null){
            if (!this.isWordComplete()) return;

            id = this.targetedId;
            if (id === null) return;
        }

        const enemy = currentWave.getEnemy(id);
        if (!enemy) return;

        const word = enemy.word ?? "";

        // Fire! Decrease enemy health using Player's damage multiplier
        const player = Player.getInstance();
        enemy.health -= player.getDamage();
        if (enemy.health > 0) {
            // Enemy still alive, change word
            this.targetedId = null;
            this.typedText = "";
            this.view.updateText(this.typedText);
            this.view.setTarget(null);
            this.levelManager.changeWord(enemy, this.levelManager.getWord(word.length));
        } else {
            // Enemy defeated!
            this.model.setScore(this.model.getScore() + 100);
            this.onEnemyDefeated(id);
        }
    }

    /**
     * Clear target if it matches the given enemy ID
     * Called when an enemy is defeated or hits the player
     */
    clearTargetIfMatches(id: number): void {
        if (this.targetedId === id) {
            this.targetedId = null;
            this.typedText = "";
            this.view.updateText(this.typedText);
            this.view.setTarget(null);
        }
    }


    nextLetter(): string {
        //case target is locked
        if(this.targetedId !== null){
            const word = this.levelManager.currentWave?.getEnemy(this.targetedId)?.word ?? "";
            const isValid = this.isTypedTextValid(word, this.typedText);
            //case incorrect currently
            if(!isValid) return "backspace"
            if(word.length <= this.typedText.length){
                return "space"
            }
            return word.charAt(this.typedText.length)
        }
        //case target is not locked and theres only one enemy
        let x = this.levelManager.currentWave;
        if(x?.count() == 1){
            const word = this.levelManager.currentWave?.getEnemy(x.getEnemyIds()[0])?.word ?? "";
            if(word == ""){
                return "space"
            }
            return word.charAt(0)
        }
        

        //other
        return ""
    }
}