/* DifficultyUtil.ts
 * 
 * Utility functions that are based off of game difficulty. These functions use difficulty
 * as a baseline and calculate random values with variance. All difficulty related calculations
 * should be centralized here. 
 */

// ============ SPEED MULTIPLIER CONSTANTS ============
// Configure these values to adjust enemy speed multipliers

// Difficulty 10 speed multiplier range
const SPEED_MULTIPLIER_MIN_AT_DIFFICULTY_10 = 0.3;
const SPEED_MULTIPLIER_MAX_AT_DIFFICULTY_10 = 0.5;

// Difficulty 100 speed multiplier range
const SPEED_MULTIPLIER_MIN_AT_DIFFICULTY_100 = 1.5;
const SPEED_MULTIPLIER_MAX_AT_DIFFICULTY_100 = 2;

// Reference difficulty levels for speed scaling
const SPEED_LOW_DIFFICULTY_REF = 10;
const SPEED_HIGH_DIFFICULTY_REF = 100;

// ================================================

export default class DifficultyUtil {
    private _difficulty: number; // Between 1-100
    private _seed: number = 42;
    private _rngState: number;

    set seed(value: number) {
        this._seed = value;
        this._rngState = value;
    }

    get seed(): number {
        return this._seed;
    }
    
    constructor(initialDifficulty: number = 1, seed: number = 42) {
        this._difficulty = initialDifficulty;
        this._seed = seed;
        this._rngState = seed;
    }

    /**
     * Seeded pseudo-random number generator using a simple LCG algorithm
     * Returns a number between 0 and 1
     */
    private seededRandom(): number {
        // Linear Congruential Generator (LCG) constants
        const a = 1664525;
        const c = 1013904223;
        const m = Math.pow(2, 32);
        
        this._rngState = (a * this._rngState + c) % m;
        return this._rngState / m;
    }

    get difficulty(): number {
        return this._difficulty;
    }

    set difficulty(value: number) {
        if (value < 1) {
            this._difficulty = 1;
        } else if (value > 100) {
            this._difficulty = 100;
        } else {
            this._difficulty = value;
        }
    }

    /**
     * Calculate word length based on difficulty (1-100)
     * Difficulty 10: average 3 letters
     * Difficulty 100: average 7 letters
     * Higher difficulty increases variance towards longer words
     */
    randWordLength(): number {
        // Base average length progression: 3 at difficulty 10, 7 at difficulty 100
        const baseAverage = 3 + (4 * (this._difficulty - 10) / 90);
        const clampedAverage = Math.max(3, Math.min(7, baseAverage));
        
        // Variance increases with difficulty
        // At low difficulty: mostly 3-5 letter words
        // At high difficulty: 5-10 letter words appear frequently
        const varianceMultiplier = this._difficulty / 100;
        
        // Create weighted distribution based on difficulty
        const weights: Record<number, number> = {};
        
        // Available word lengths from the wordbank
        const availableLengths = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        
        for (const length of availableLengths) {
            // Distance from target average (closer = higher weight)
            const distance = Math.abs(length - clampedAverage);
            
            // Base weight decreases with distance from average
            let weight = Math.max(0.1, 1 - (distance / 4));
            
            // Adjust weights based on difficulty level
            if (this._difficulty <= 30) {
                // Low difficulty: favor shorter words (3-5 letters)
                if (length <= 3) weight *= 2;
                if (length <= 5) weight *= 2;
                if (length >= 6) weight *= 0.3;
            } else if (this._difficulty <= 60) {
                // Medium difficulty: balanced distribution
                if (length >= 5) weight *= 1 + varianceMultiplier;
            } else {
                // High difficulty: favor longer words (6-10 letters)
                if (length >= 5) weight *= 1.5 + varianceMultiplier;
                if (length >= 7) weight *= 1 + varianceMultiplier;
                if (length <= 3) weight *= 0.5;
            }
            
            weights[length] = weight;
        }
        
        // Select length based on weighted random selection
        const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
        let random = this.seededRandom() * totalWeight;
        
        for (const [lengthStr, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) {
                return parseInt(lengthStr);
            }
        }
        
        // Fallback to clamped average
        return Math.round(clampedAverage);
    }

    /**
     * Calculate a random speed multiplier based on difficulty (1-100)
     * Uses weighted randomization within a difficulty-based range
     * 
     * Difficulty 10: 0.5 - 0.7 multiplier (slower)
     * Difficulty 100: 3.0 - 4.0 multiplier (faster)
     * 
     * @returns A random speed multiplier appropriate for the current difficulty
     */
    randSpeedMultiplier(): number {
        // Clamp difficulty to reference range
        const clampedDifficulty = Math.max(
            SPEED_LOW_DIFFICULTY_REF, 
            Math.min(SPEED_HIGH_DIFFICULTY_REF, this._difficulty)
        );
        
        // Calculate interpolation factor (0 at difficulty 10, 1 at difficulty 100)
        const difficultyRange = SPEED_HIGH_DIFFICULTY_REF - SPEED_LOW_DIFFICULTY_REF;
        const interpolationFactor = (clampedDifficulty - SPEED_LOW_DIFFICULTY_REF) / difficultyRange;
        
        // Interpolate min and max speed multiplier based on difficulty
        const minMultiplier = SPEED_MULTIPLIER_MIN_AT_DIFFICULTY_10 + 
            (SPEED_MULTIPLIER_MIN_AT_DIFFICULTY_100 - SPEED_MULTIPLIER_MIN_AT_DIFFICULTY_10) * interpolationFactor;
        const maxMultiplier = SPEED_MULTIPLIER_MAX_AT_DIFFICULTY_10 + 
            (SPEED_MULTIPLIER_MAX_AT_DIFFICULTY_100 - SPEED_MULTIPLIER_MAX_AT_DIFFICULTY_10) * interpolationFactor;
        
        // Generate random speed multiplier within the calculated range
        const multiplierRange = maxMultiplier - minMultiplier;
        const randomMultiplier = minMultiplier + this.seededRandom() * multiplierRange;
        
        return randomMultiplier;
    }

    /**
     * Calculate a random enemy count per wave based on difficulty (1-100)
     * Uses weighted distribution to create varied but predictable scaling
     * 
     * Difficulty 10: Average 2 (75% = 2, 25% = 3)
     * Difficulty 30: Average 3 (evenly between 2-4)
     * Difficulty 50: Average 3 (tends towards 4, never 2)
     * Difficulty 70: Average 4 (tends towards 5)
     * Difficulty 100: Average 5 (sometimes 6, rarely 4)
     * 
     * @returns A random enemy count appropriate for the current difficulty
     */
    randEnemyCount(): number {
        const difficulty = this._difficulty;
        const weights: Record<number, number> = {};

        if (difficulty <= 10) {
            // Difficulty 10: avg 2 (75% = 2, 25% = 3)
            weights[2] = 0.75;
            weights[3] = 0.25;
        } else if (difficulty <= 30) {
            // Difficulty 30: avg 3 (evenly between 2-4)
            const progress = (difficulty - 10) / 20; // 0 to 1
            weights[2] = 0.75 * (1 - progress) + 0.33 * progress;
            weights[3] = 0.25 * (1 - progress) + 0.34 * progress;
            weights[4] = 0.33 * progress;
        } else if (difficulty <= 50) {
            // Difficulty 50: avg 3 (tends towards 4, never 2)
            const progress = (difficulty - 30) / 20; // 0 to 1
            weights[2] = 0.33 * (1 - progress);
            weights[3] = 0.34 + 0.2 * (1 - progress);
            weights[4] = 0.33 + 0.46 * progress;
            weights[5] = 0.1 * progress;
        } else if (difficulty <= 70) {
            // Difficulty 70: avg 4 (tends towards 5)
            const progress = (difficulty - 50) / 20; // 0 to 1
            weights[3] = 0.54 * (1 - progress) + 0.1 * progress;
            weights[4] = 0.36 * (1 - progress) + 0.35 * progress;
            weights[5] = 0.1 * (1 - progress) + 0.55 * progress;
        } else {
            // Difficulty 100: avg 5
            const progress = (difficulty - 70) / 30; // 0 to 1
            weights[3] = 0.1 * (1 - progress);
            weights[4] = 0.35 * (1 - progress) + 0.15 * progress;
            weights[5] = 0.55 * (1 - progress) + 0.6 * progress;
        }

        // Select count based on weighted random selection
        const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
        let random = this.seededRandom() * totalWeight;

        for (const [countStr, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) {
                return parseInt(countStr);
            }
        }

        // Fallback
        return 3;
    }

    /**
     * Select a random enemy type based on difficulty (1-100)
     * Uses weighted bins to determine enemy type selection
     * 
     * Enemy difficulty ranking: meteor < ufo < shooter < amiiba
     * Comet is a special case with no difficulty
     * 
     * Bins (based on random value * difficulty / 2):
     * - comet:   [0, 1)
     * - meteor:  (1, 35]
     * - ufo:     (35, 70]
     * - shooter: (70, 90]
     * - amiiba:  (90, 100]
     * 
     * @returns The enemy type key: "amiiba" | "meteor" | "ufo" | "shooter" | "comet"
     */
    randEnemyType(): "amiiba" | "meteor" | "ufo" | "shooter" | "comet" {
        // Generate random number between 0-2
        const baseRandom = this.seededRandom() * 1.3;
        
        // Multiply by difficulty / 1.5 to get scaled value
        const scaledValue = baseRandom * (this._difficulty / 1.3);
        if (scaledValue > 80) {
            console.log(scaledValue)
        }
        
        // Determine enemy type based on bin
        if (scaledValue <= 5) {
            return "comet";
        } else if (scaledValue <= 40) {
            return "meteor";
        } else if (scaledValue <= 60) {
            return "ufo";
        } else if (scaledValue <= 80) {
            return "shooter";
        } else {
            return "amiiba";
        }
    }

    increaseDifficulty(levels: number): void {
        const increment = Math.floor(Math.min(1, this.seededRandom() * 3));
        this.difficulty += Math.floor(levels / 1.5) + increment;
    }
}