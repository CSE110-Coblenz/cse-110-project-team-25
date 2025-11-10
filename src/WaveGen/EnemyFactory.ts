import Enemy from "../objects/Enemy";
import Wave from "./Wave";
import { wordBank } from "../words/wordBank";
import type { WaveConfig } from "../types";

/**
 * Factory class for creating enemies and waves
 * Generates enemies with configurable attributes but does NOT render them
 */
class EnemyFactory {
    /**
     * Create a single enemy with all configurable attributes
     */
    createEnemy(
        type: string,
        word: string,
        health: number = 100,
        distance: number = 40,
        scoreValue: number = 0,
        speed: number = 6,
        x: number = 0
    ): Enemy {
        const enemy = new Enemy(type, word, health, distance, scoreValue, speed);
        enemy.x = x;
        return enemy;
    }

    /**
     * Create multiple enemies from attribute lists
     * All lists must be the same length
     */
    createMultipleEnemies(
        types: string[],
        words: string[],
        health: number[],
        distances: number[],
        scoreValues: number[],
        speeds: number[],
        xPositions: number[]
    ): Wave {
        // Validate all lists are equal length
        const length = types.length;
        const lists = [words, health, distances, scoreValues, speeds, xPositions];
        const listNames = ['words', 'health', 'distances', 'scoreValues', 'speeds', 'xPositions'];
        
        for (let i = 0; i < lists.length; i++) {
            if (lists[i].length !== length) {
                throw new Error(
                    `All attribute lists must be the same length. ` +
                    `Expected ${length}, but ${listNames[i]} has ${lists[i].length}`
                );
            }
        }

        const wave: Wave = new Wave();
        for (let i = 0; i < length; i++) {
            const enemy = this.createEnemy(
                types[i],
                words[i],
                health[i],
                distances[i],
                scoreValues[i],
                speeds[i],
                xPositions[i]
            );
            wave.addEnemy(enemy);
        }
        return wave;
    }

    /**
     * Load WaveConfig from an external JSON file (e.g., from /public/)
     * @param url - The URL or path to the JSON file
     * @returns Promise that resolves to a WaveConfig object
     */
    async loadWaveConfigFromJSON(url: string): Promise<WaveConfig> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load wave config from ${url}: ${response.statusText}`);
            }
            const data = await response.json();
            
            // Validate that it has the required structure
            if (!data.types || typeof data.types !== 'object') {
                throw new Error('Invalid wave config: missing or invalid "types" field');
            }
            
            return data as WaveConfig;
        } catch (error) {
            throw new Error(`Error loading wave config: ${error}`);
        }
    }

    /**
     * Load a wave from an external JSON file
     * @param url - The URL or path to the JSON file (e.g., '/waveConfig.json')
     * @returns Promise that resolves to a Wave object
     */
    async loadWaveFromJSON(url: string, activeInitials: Set<string> = new Set()): Promise<Wave> {
        const config = await this.loadWaveConfigFromJSON(url);
        return this.generateWaveFromJSON(config, activeInitials);
    }

    /**
     * Generate a wave from JSON configuration
     * JSON format: {"types": {"1": "ufo", "2": "meteor"}, "health": [1, 2], "speed": [5, 6], ...}
     */
    generateWaveFromJSON(config: WaveConfig, activeInitials: Set<string> = new Set()): Wave {
        const decodedConfig = this.decodeJSON(config);
        const wave = new Wave();

        for (let i = 0; i < decodedConfig.count; i++) {
            const type = decodedConfig.types[i];
            const word = decodedConfig.words[i] || this.getRandomWord(activeInitials);
            const health = decodedConfig.health[i];
            const speed = decodedConfig.speed[i];
            const distance = decodedConfig.distance[i];
            const scoreValue = decodedConfig.scoreValue[i];
            const x = decodedConfig.x[i];

            const enemy = this.createEnemy(type, word, health, distance, scoreValue, speed, x);
            wave.addEnemy(enemy);
        }

        return wave;
    }

    /**
     * Decode JSON configuration into arrays for each attribute
     * Ensures all arrays are the same length as the number of enemies
     */
    private decodeJSON(config: WaveConfig): {
        count: number;
        types: string[];
        health: number[];
        speed: number[];
        distance: number[];
        scoreValue: number[];
        words: string[];
        x: number[];
    } {
        // Get enemy count from types object
        const typeKeys = Object.keys(config.types);
        const count = typeKeys.length;

        // Extract types in order
        const types: string[] = [];
        for (let i = 1; i <= count; i++) {
            types.push(config.types[i.toString()] || "ufo");
        }

        // Helper to expand array or use defaults
        const expandArray = <T>(arr: T[] | undefined, defaultValue: T): T[] => {
            if (!arr || arr.length === 0) {
                return Array(count).fill(defaultValue);
            }
            if (arr.length < count) {
                // Repeat pattern if array is shorter than count
                const expanded: T[] = [];
                for (let i = 0; i < count; i++) {
                    expanded.push(arr[i % arr.length]);
                }
                return expanded;
            }
            return arr.slice(0, count);
        };

        return {
            count,
            types,
            health: expandArray(config.health, 100),
            speed: expandArray(config.speed, 6),
            distance: expandArray(config.distance, 40),
            scoreValue: expandArray(config.scoreValue, 0),
            words: expandArray(config.words, ""),
            x: expandArray(config.x, 0)
        };
    }

    /**
     * Generate a random wave with n enemies.
     */
    generateRandomWave(
        n: number,
        speedMultiplier: number = 1
    ): Wave {
        const wave = new Wave();
        
const activeInitials: Set<string> = new Set();
        for (let i = 0; i < n; i++) {
            const word = this.getRandomWord(activeInitials);
            const lane = Math.random() * 6 - 3; // -3..+3
            const z = 40 + Math.random() * 30;  // 40..70
            const speed = (5 + Math.random() * 4) * speedMultiplier;
            const type = Math.random() > 0.5 ? "meteor" : "ufo";

            const enemy = this.createEnemy(type, word, 100, z, 0, speed, lane);
            activeInitials.add(word[0].toLowerCase());
            wave.addEnemy(enemy);
        }

        return wave;
    }

    /**
     * Get a random word that doesn't conflict with active initials
     */
    private getRandomWord(activeInitials: Set<string>): string {
        const word = wordBank.getRandomWordExcludingInitials(
            activeInitials,
            ["bnm,.", "zxcv", "ty", "uiop", "qwer", "gh", "asdfjkl;"],
            Math.round(Math.random() * 4 + 1)
        );
        return word || "default";
    }
}

export default EnemyFactory;