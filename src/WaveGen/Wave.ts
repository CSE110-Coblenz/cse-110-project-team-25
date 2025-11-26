import Enemy from "../objects/Enemy"
import Effect from "../objects/Effect"

const NUM_LANES = 6

/**
 * Wave class holds a collection of enemies for a single wave
 * Main functionality is to manage the {id: Enemy} dictionary
 */
class Wave {
    private enemies: Map<number, Enemy>;
    private _activeLanes: Set<number> = new Set<number>();
    private effects: Map<number, Effect>;
    private _activeInitials: Set<string>;
    constructor() {
        this.enemies = new Map<number, Enemy>();
        this._activeInitials = new Set<string>();
        this.effects = new Map<number, Effect>();
    }

    /**
     * return number of enemies
     */
    count(): number {
        return this._activeInitials.size
    }

    /**
     * Add an enemy to the wave
     */
    addEnemy(enemy: Enemy, lane?: number): void {
        this.enemies.set(enemy.id, enemy);
        this._activeInitials.add(enemy.word[0]);
        if (lane !== undefined) {
            this._activeLanes.add(lane);
        }
    }

    /**
     * Remove an enemy from the wave by ID
     */
    removeEnemy(id: number): void {
        let temp = this.getEnemy(id);
        if(temp != undefined){
            this.enemies.delete(id);
            // Only remove the initial if no other enemies start with it
            const initial = temp.word[0];
            const hasOtherEnemyWithInitial = Array.from(this.enemies.values()).some(
                enemy => enemy.word[0] === initial
            );
            if (!hasOtherEnemyWithInitial) {
                this._activeInitials.delete(initial);
            }
        }
    }

    /**
     * Get an enemy by ID
     */
    getEnemy(id: number): Enemy | undefined {
        return this.enemies.get(id);
    }

    /**
     * Check if the wave is empty (no enemies remaining)
     */
    isEmpty(): boolean {
        return this.enemies.size === 0;
    }

    /**
     * Get all enemies in the wave
     */
    getAllEnemies(): Map<number, Enemy> {
        return this.enemies;
    }

    /**
     * Get the number of enemies in the wave
     */
    getCount(): number {
        return this.enemies.size;
    }

    /**
     * Clear all enemies and effects from the wave
     */
    clear(): void {
        this.enemies.clear();
        this.effects.clear();
        this._activeInitials.clear();
    }

    /**
     * Get all enemy IDs
     */
    getEnemyIds(): number[] {
        return Array.from(this.enemies.keys());
    }

    addLane(lane: number): void {
        this._activeLanes.add(lane);
    }

    getInactiveLane(): number {
        let tries = 0;
        while (tries < 100) {
            const lane = Math.floor(Math.random() * NUM_LANES) - 3; // -3 to +2
            if (!this._activeLanes.has(lane)) {
                return lane;
            }
            tries++;
        }
        // Fallback in case all lanes are active
        return 0;
    }


    /**
     * Iterate through all enemies
     */
    forEachEnemy(callback: (enemy: Enemy, id: number) => void): void {
        this.enemies.forEach(callback);
    }
    
    /**
     * Iterate through all effects
     */
    forEachEffect(callback: (effect: Effect, id: number) => void): void {
        this.effects.forEach(callback);
    }

    /**
     * Add an effect to the wave
     */
    addEffect(effect: Effect): void {
        this.effects.set(effect.id, effect);
    }

    /**
     * Remove an effect from the wave by ID
     */
    removeEffect(id: number): void {
        let temp = this.getEffect(id);
        if(temp != undefined){
            this.effects.delete(id);
        }
    }

    /**
     * Get an enemy by ID
     */
    getEffect(id: number): Effect | undefined {
        return this.effects.get(id);
    }

    get activeLanes(): Set<number> { return this._activeLanes; }

    set activeLanes(lanes: Set<number>) { this._activeLanes = lanes; }    

    get activeInitials(): Set<string> { return this._activeInitials; }
}

export { Wave };
export default Wave;