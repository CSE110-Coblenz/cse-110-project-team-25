import Enemy from "../objects/Enemy";

/**
 * Wave class holds a collection of enemies for a single wave
 * Main functionality is to manage the {id: Enemy} dictionary
 */
class Wave {
    private enemies: Map<number, Enemy>;

    constructor() {
        this.enemies = new Map<number, Enemy>();
    }

    /**
     * Add an enemy to the wave
     */
    addEnemy(enemy: Enemy): void {
        this.enemies.set(enemy.id, enemy);
    }

    /**
     * Remove an enemy from the wave by ID
     */
    removeEnemy(id: number): void {
        this.enemies.delete(id);
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

    /**
     * Iterate through all enemies
     */
    forEach(callback: (enemy: Enemy, id: number) => void): void {
        this.enemies.forEach(callback);
    }
}

export { Wave };
export default Wave;