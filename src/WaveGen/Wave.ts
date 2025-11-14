import Enemy from "../objects/Enemy";

/**
 * Wave class holds a collection of enemies for a single wave
 * Main functionality is to manage the {id: Enemy} dictionary
 */
class Wave {
    private enemies: Map<number, Enemy>;
    private objects: Map<number, Object>;
    private _activeLanes: Set<number> = new Set<number>();
    private _activeInitials: Set<string>;
    constructor() {
        this.enemies = new Map<number, Enemy>();
        this.objects = new Map<number, Object>();
        this._activeInitials = new Set<string>;
    }

    /**
     * Add an enemy to the wave
     */
    addEnemy(enemy: Enemy): void {
        this.enemies.set(enemy.id, enemy);
        this.activeInitials.add(enemy.word[0]);
    }

    /**
     * Remove an enemy from the wave by ID
     */
    removeEnemy(id: number): void {
        let temp = this.getEnemy(id);
        if(temp != undefined){
            this.activeInitials.delete(temp.word[0]);
            this.enemies.delete(id);
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
     * Clear all enemies from the wave
     */
    clear(): void {
        this.enemies.clear();
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
            const lane = Math.floor(Math.random() * 6) - 3; // -3 to +2
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
    forEach(callback: (enemy: Enemy, id: number) => void): void {
        this.enemies.forEach(callback);
    }

    get activeLanes(): Set<number> { return this._activeLanes; }

    set activeLanes(lanes: Set<number>) { this._activeLanes = lanes; }    

    get activeInitials(): Set<string> { return this._activeInitials; }
}

export { Wave };
export default Wave;