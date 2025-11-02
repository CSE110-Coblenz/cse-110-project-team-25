const MAX_WORD_LENGTH = 18;

export class WordBank {
    private banks: Record<number, string[]> | null = null;

    async load(url = "/wordbank.json"): Promise<void> {
        if (this.banks) return;
        const res = await fetch(url);
        this.banks = await res.json();
    }

    getRandomWord(difficulty?: number, length?: number): string {
        if (!this.banks) throw new Error("WordBank not loaded. Call load() first.");

        if (difficulty && length) {
            throw new Error("Cannot specify both difficulty and length");
        } else if (!difficulty && !length) { // Base case for testing
            const pool = this.banks[Math.floor(Math.random() * MAX_WORD_LENGTH + 1)];
            return pool[Math.floor(Math.random() * pool.length + 1)];
        } else if (difficulty) { // difficulty determines random length
            const length = this.detRandomLength(difficulty);
            const pool = this.banks[length];
            return pool[Math.floor(Math.random() * pool.length + 1)];
        } else { // length is specified 
            const pool = this.banks[length!];
            return pool[Math.floor(Math.random() * pool.length + 1)];
        }
    }

    private detRandomLength(difficulty: number): number {
        return difficulty + 1;
    }
}

export const wordBank = new WordBank();
