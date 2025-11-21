// const MAX_WORD_LENGTH = 18;

export type Bank = "bnm,." | "zxcv" | "ty" | "uiop" | "qwer" | "gh" | "asdfjkl;";
type SubBank = Record<number, string[]>;

export class WordBank {
    private banks: Record<Bank, SubBank> | null = null;

    async load(): Promise<void> {
        if (this.banks) return;
        const res = await fetch("./wordbank.json");
        this.banks = await res.json();
    }

    /**
     * Calculate word length based on difficulty (1-100)
     * Difficulty 10: average 4 letters
     * Difficulty 100: average 7 letters
     * Higher difficulty increases variance towards longer words
     */
    private calculateWordLengthFromDifficulty(difficulty: number): number {
        // Clamp difficulty to 1-100 range
        difficulty = Math.max(1, Math.min(100, difficulty));
        
        // Base average length progression: 4 at difficulty 10, 7 at difficulty 100
        const baseAverage = 4 + (3 * (difficulty - 10) / 90);
        const clampedAverage = Math.max(3, Math.min(7, baseAverage));
        
        // Variance increases with difficulty
        // At low difficulty: mostly 3-5 letter words
        // At high difficulty: 5-10 letter words appear frequently
        const varianceMultiplier = difficulty / 100;
        
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
            if (difficulty <= 30) {
                // Low difficulty: favor shorter words (3-5 letters)
                if (length <= 5) weight *= 2;
                if (length >= 7) weight *= 0.3;
            } else if (difficulty <= 60) {
                // Medium difficulty: balanced distribution
                if (length >= 6) weight *= 1 + varianceMultiplier;
            } else {
                // High difficulty: favor longer words (6-10 letters)
                if (length >= 6) weight *= 1.5 + varianceMultiplier;
                if (length >= 8) weight *= 1 + varianceMultiplier;
                if (length <= 4) weight *= 0.5;
            }
            
            weights[length] = weight;
        }
        
        // Select length based on weighted random selection
        const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        
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
     * Get a random word based on difficulty level (1-100)
     * @param difficulty Difficulty level (1-100)
     * @param categories Word categories to select from
     * @param excludedInitials Optional set of initials to exclude
     */
    getRandomWordByDifficulty(
        difficulty: number, 
        categories: Bank[] = ["bnm,."], 
        excludedInitials?: Set<string> | string[]
    ): string | null {
        const length = this.calculateWordLengthFromDifficulty(difficulty);
        
        if (excludedInitials) {
            return this.getRandomWordExcludingInitials(excludedInitials, categories, length);
        } else {
            return this.getRandomWord(categories, length);
        }
    }

    // Original methods preserved for backward compatibility
    getRandomWordExcludingInitials(excluded: Set<string> | string[], categories: Bank[] = ["bnm,."], length: number): string | null {
        const ex = new Set(Array.from(excluded).map(c => c.toLowerCase()));
        const pool = this.pool(categories, length).filter(w => w && !ex.has(w[0].toLowerCase()));
        if (pool.length === 0) return this.getRandomWordExcludingInitials(excluded, categories, length+1);
        return pool[Math.floor(Math.random() * pool.length)];
    }

    getRandomWord(categories: Bank[], length: number): string {
        const pool = this.pool(categories, length);
        return pool[Math.floor(Math.random() * pool.length)];
    }

    pool(categories: Bank[], length: number): string[] {
        if (!this.banks) throw new Error("WordBank not loaded. Call load() first.");
        // const all = categories.flatMap(c => this.banks![c][length] ?? []);
        let all = [""];
        for(let c of categories){
            // all.concat(this.banks[c][length]);
            let temp = this.banks[c][length];
            if(temp) all = [...this.banks[c][length], ...all];
        }
        const list = all.filter(Boolean);
        return list.length ? list : ["wordnotfound"];
    }

    // private detRandomLength(difficulty: number): number {
    //     return difficulty + 1;
    // }
}

export const wordBank = new WordBank();
