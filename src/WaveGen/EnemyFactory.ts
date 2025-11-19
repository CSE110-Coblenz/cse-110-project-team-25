import Enemy from "../objects/Enemy";
import Wave from "./Wave";
import { wordBank } from "../words/wordBank";
import type { WaveConfig, LevelConfig } from "../types";
import Ufo from "../objects/Enemies/Ufo";
import Circle from "../objects/Enemies/Circle";
import Meteor from "../objects/Enemies/Meteor";
import Amiiba from "../objects/Enemies/Amiiba";
import type LevelManager from "../Level/LevelManager";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../constants";
import Shooter from "../objects/Enemies/Shooter";
import Comet from "../objects/Enemies/Comet";
import Dummy from "../objects/Enemies/Dummy";
import TextBox from "../objects/Enemies/TextBox";
import Keyboard from "../objects/Effects/Keyboard";
import type Effect from "../objects/Effect";

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
        health: number = 1,
        distance: number = 40,
        speed: number = 6,
        x: number = STAGE_WIDTH / 2,
        y: number = STAGE_HEIGHT / 2,
        split?: number,
        manager?: LevelManager,
        text?: string[]

    ): Enemy {
        if(type === "ufo"){
            return new Ufo(word, distance, speed, x, y, health);
        } else if(type === "meteor"){
            return new Meteor(word, distance, speed, x, y, health);
        } else if(type === "amiiba" && manager != undefined){
            return new Amiiba(word, distance, speed, manager, x, y, split, health)
        } else if(type === "shooter" && manager != undefined){
            return new Shooter(word, distance, speed, manager, x, y, health);
        } else if(type === "comet" && manager != undefined){
            return new Comet(word, x, y, manager, 10, health);
        } else if(type === "dummy"){
            return new Dummy(word, distance, x, y, health);
        } else if(type === "textbox" && text != undefined){
            return new TextBox(text)
        }
        return new Circle(word, distance, speed, x, y, health)
    }

    createEffect(
        type: string
    ): Effect {
        return new Keyboard();
    }

    /**
     * Create multiple enemies from attribute lists
     * All lists must be the same length
     */
    createMultipleEnemies(
        types: string[],
        words: string[],
        distances: number[],
        speeds: number[],
        xPositions: number[],
        yPositions: number[]
    ): Wave {
        // Validate all lists are equal length
        const length = types.length;
        const lists = [words, distances, speeds, xPositions];
        const listNames = ['words', 'distances', 'speeds', 'xPositions', 'yPositions'];
        
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
            // No explicit health list provided here, default to 1
            const enemy = this.createEnemy(
                types[i],
                words[i],
                1,
                distances[i],
                speeds[i],
                xPositions[i],
                yPositions[i]
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
    async loadWaveFromJSON(url: string): Promise<Wave> {
        const config = await this.loadWaveConfigFromJSON(url);
        return this.generateWaveFromJSON(config);
    }

    /**
     * Generate a wave from JSON configuration
     * JSON format: {"types": {"1": "ufo", "2": "meteor"}, "health": [1, 2], "speed": [5, 6], ...}
     */
    generateWaveFromJSON(config: WaveConfig, manager?: LevelManager): Wave {
        const decodedConfig = this.decodeJSON(config);
        const wave = new Wave();

        const activeInitials: Set<string> = new Set();
        for (let i = 0; i < decodedConfig.count; i++) {
            const type = decodedConfig.types[i];
            let word = this.getRandomWord(activeInitials);
            if (config.words !== undefined && config.words.length > i){
                word = decodedConfig.words[i];
            }
            const speed = decodedConfig.speed[i];
            const distance = decodedConfig.distance[i];
            const health = decodedConfig.health[i];
            let x = STAGE_WIDTH / 2;
            let y = STAGE_HEIGHT / 2;
            if(config.x !== undefined){
                x = decodedConfig.x[i];
            }
            else{
                console.log("Warning: x positions are undefined in wave config JSON.");
            }
          
            if (config.y !== undefined){
                y = decodedConfig.y[i];
            }
            else{
                console.log("Warning: y positions are undefined in wave config JSON.");
            }

            // createEnemy(type, word, health=1, distance=40, speed=6, x, y)
            const enemy = this.createEnemy(type, word, health, distance, speed, x, y, undefined, manager);
            wave.addEnemy(enemy);

            activeInitials.add(word[0].toLowerCase());
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
        words: string[];
        x: number[];
        y: number[];
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
            health: expandArray(config.health, 1),
            speed: expandArray(config.speed, 6),
            distance: expandArray(config.distance, 40),
            words: expandArray(config.words, ""),
            x: expandArray(config.x, 0),
            y: expandArray(config.y, 0)
        };
    }

    /**
     * Generate a random wave with n enemies.
     */
    generateRandomWave(
        n: number = 1,
        speedMultiplier: number = 1,
        manager: LevelManager
    ): Wave {
        const keyboardIncluded = true;
        const wave = new Wave();
        const activeInitials: Set<string> = new Set();
        for (let i = 0; i < n; i++) {
            const word = this.getRandomWord(activeInitials);
            const lane = Math.floor(Math.random() * 7) - 3; // -3..+3 lanes
            const distance = 40 + Math.random() * 30;  // 40..70
            const speed = (5 + Math.random() * 4) * speedMultiplier;
            const types = ["meteor", "ufo", "amiiba", "comet", "shooter", "dummy", "circle", "textbox"];
            const type = types[Math.floor(Math.random() * types.length)];
            const health = Math.random() < 0.8 ? 1 : 2;

            const laneWidth = 60; // horizontal spacing for lanes
            const x = STAGE_WIDTH / 2 + lane * laneWidth;
            const y = 100 + Math.random() * 200;

            const enemy = this.createEnemy(type, word, health, distance, speed, x, y, 2, manager, ["test textbox"]);
            activeInitials.add(word[0].toLowerCase());
            wave.addEnemy(enemy);
        }
        const effect = this.createEffect("keyboard")
        if(keyboardIncluded) wave.addEffect(effect)
        return wave;
    }

    /**
     * Get a random word that doesn't conflict with active initials
     */
    getRandomWord(activeInitials: Set<string>, length?: number): string {
        let len = Math.round(Math.random() * 4 + 1);
        if(length != undefined){
            len = length;
        }
        const word = wordBank.getRandomWordExcludingInitials(
            activeInitials,
            ["bnm,.", "zxcv", "ty", "uiop", "qwer", "gh", "asdfjkl;"],
            len
        );
        return word || "default";
    }

    /**
     * Get a random word based on difficulty level (1-100)
     * @param activeInitials Set of initials to exclude
     * @param difficulty Difficulty level (1-100)
     */
    getRandomWordByDifficulty(activeInitials: Set<string>, difficulty: number): string {
        const word = wordBank.getRandomWordByDifficulty(
            difficulty,
            ["bnm,.", "zxcv", "ty", "uiop", "qwer", "gh", "asdfjkl;"],
            activeInitials
        );
        return word || "default";
   
    /**
     * Load a LevelConfig from an external JSON file
     * @param url - The URL or path to the JSON file (e.g., '/levels/level1.json')
     * @returns Promise that resolves to a LevelConfig object
     */
    async loadLevelConfigFromJSON(url: string): Promise<LevelConfig> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load level config from ${url}: ${response.statusText}`);
            }
            const data = await response.json();
            
            // Validate that it has the required structure
            if (!data.waves || !Array.isArray(data.waves)) {
                throw new Error('Invalid level config: missing or invalid "waves" array');
            }
            
            return data as LevelConfig;
        } catch (error) {
            throw new Error(`Error loading level config: ${error}`);
        }
    }

    /**
     * Generate multiple waves from a LevelConfig
     * Returns an array of Wave objects based on the level configuration
     * @param config - The level configuration
     * @returns Array of Wave objects
     */
    generateWavesFromLevelConfig(config: LevelConfig, manager?: LevelManager): Wave[] {
        const waves: Wave[] = [];
        
        for (const waveConfig of config.waves) {
            const wave = this.generateWaveFromJSON(waveConfig, manager);
            waves.push(wave);
        }
        
        return waves;
    }

    /**
     * Load level from JSON file and return the waves
     * @param url - The URL or path to the level JSON file
     * @returns Promise that resolves to an array of Wave objects
     */
    async loadLevelFromJSON(url: string, manager?: LevelManager): Promise<Wave[]> {
        const config = await this.loadLevelConfigFromJSON(url);
        return this.generateWavesFromLevelConfig(config, manager);
    }
}

export default EnemyFactory;