const MAX_WORD_LENGTH = 16;

export class WordBank {
    private banks: Record<number, string[]> | null = null;

    async load(url = "/wordbank.json"): Promise<void> {
        if (this.banks) return;
        const res = await fetch(url);
        this.banks = await res.json();
    }

    /**
     * Gets a random word from the wordbank, avoiding conflicts with active words.
     * 
     * @param activeWords Set of currently active words to avoid substring conflicts
     * @param difficulty Optional difficulty level to influence word length
     * @param length Optional specific length of the word, mainly for testing.
     * 
     * @returns A random word as a string
     */
    getRandomWord(activeWords: Set<string>, difficulty: number | null = null, length: number | null = null): string | null {
        if (!this.banks) throw new Error("WordBank not loaded. Call load() first.");

        if (difficulty && length) {
            throw new Error("Cannot specify both difficulty and length");
        }

        let word = null;
        const pool = this.getPool(difficulty, length);

        // Keep trying until we find a word that doesn't conflict with active words
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loop
        do {
            word = pool[Math.floor(Math.random() * pool.length)];
            attempts++;
        } while (this.isSubstringConflict(word, activeWords) && attempts < maxAttempts);

        return word;
    }

    /**
     * Get a pool of words based on difficulty or length parameters.
     * Returns a concatenation of words from multiple lengths for variety.
     * 
     * @param difficulty Optional difficulty level (determines 3 random lengths)
     * @param length Optional specific length (returns single length pool)
     * 
     * @returns Array of words from the selected length(s)
     */
    private getPool(difficulty: number | null, length: number | null): string[] {
        if (!this.banks) throw new Error("WordBank not loaded. Call load() first.");

        if (!difficulty && !length) {
            // Base case: randomly select 3 different lengths and concatenate
            const length1 = Math.floor(Math.random() * MAX_WORD_LENGTH) + 1;
            const length2 = Math.floor(Math.random() * MAX_WORD_LENGTH) + 1;
            const length3 = Math.floor(Math.random() * MAX_WORD_LENGTH) + 1;
            
            return [
                ...this.banks[length1],
                ...this.banks[length2],
                ...this.banks[length3]
            ];
        } else if (difficulty) {
            // Difficulty: call detRandomLength 3 times and concatenate
            const length1 = this.detRandomLength(difficulty);
            const length2 = this.detRandomLength(difficulty);
            const length3 = this.detRandomLength(difficulty);
            
            return [
                ...this.banks[length1],
                ...this.banks[length2],
                ...this.banks[length3]
            ];
        } else {
            // Length specified: return just that length pool
            return this.banks[length!];
        }
    }

    /**
     * Check if the word is a substring (from index 0) of any word in the active set.
     * Returns true if there's a conflict (word should be rejected).
     * 
     * Example:
     * - "word" conflicts with "wordless" (word is substring from start)
     * - "word" does NOT conflict with "sword" (word is not substring from start)
     * 
     * @param word The candidate word to check
     * @param activeWords Set of currently active words
     * 
     * @returns true if there's a substring conflict, false otherwise
     */
    private isSubstringConflict(word: string, activeWords: Set<string>): boolean {
        const lowerWord = word.toLowerCase();
        for (const activeWord of activeWords) {
            const lowerActive = activeWord.toLowerCase();
            // Check if word is a prefix of an active word
            if (lowerActive.startsWith(lowerWord) && lowerActive !== lowerWord) {
                return true;
            }
        }
        return false;
    }

    /**
     * Placeholder function to determine random word length based on difficulty.
     * 
     * @param difficulty The difficulty level
     * 
     * @returns The determined word length
     */
    private detRandomLength(difficulty: number): number {
        return difficulty + 1;
    }
}

export const wordBank = new WordBank();
