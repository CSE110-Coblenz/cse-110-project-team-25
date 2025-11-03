const MAX_WORD_LENGTH = 18;

export class WordBank {
    private banks: Record<number, string[]> | null = null;

    async load(url = "/wordbank.json"): Promise<void> {
        if (this.banks) return;
        const res = await fetch(url);
        this.banks = await res.json();
    }

    getRandomWord(activeWords: Set<string>, difficulty?: number, length?: number): string {
        if (!this.banks) throw new Error("WordBank not loaded. Call load() first.");

        if (difficulty && length) {
            throw new Error("Cannot specify both difficulty and length");
        }

        let word = "";
        let pool: string[];

        if (!difficulty && !length) { // Base case for testing
            pool = this.banks[Math.floor(Math.random() * MAX_WORD_LENGTH + 1)];
        } else if (difficulty) { // difficulty determines random length
            const targetLength = this.detRandomLength(difficulty);
            pool = this.banks[targetLength];
        } else { // length is specified 
            pool = this.banks[length!];
        }

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
     * Check if the word is a substring (from index 0) of any word in the active set.
     * Returns true if there's a conflict (word should be rejected).
     * 
     * Example:
     * - "word" conflicts with "wordless" (word is substring from start)
     * - "word" does NOT conflict with "sword" (word is not substring from start)
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

    private detRandomLength(difficulty: number): number {
        return difficulty + 1;
    }
}

export const wordBank = new WordBank();
