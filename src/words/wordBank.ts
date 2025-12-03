// const MAX_WORD_LENGTH = 18;

export type Bank = "bn" | "vm" | "c," | "x." | "z/" | "ty" | "ru" | "ei" | "wo" | "qp" | "gh" | "a;" | "sl" | "dk" | "fj"
type SubBank = Record<number, string[]>;

export class WordBank {
    private banks: Record<Bank, SubBank> | null = null;
    private _rngState: number = 42;
    private _useSeededRandom: boolean = false;

    async load(): Promise<void> {
        if (this.banks) return;
        const res = await fetch("./wordbank.json");
        this.banks = await res.json();
    }

    /**
     * Set the seed for random word selection
     * @param seed - The seed value for the random number generator
     */
    setSeed(seed: number): void {
        this._rngState = seed;
        this._useSeededRandom = true;
    }

    /**
     * Disable seeded random and use Math.random()
     */
    disableSeed(): void {
        this._useSeededRandom = false;
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

    /**
     * Get a random number using either seeded or Math.random
     */
    private getRandom(): number {
        return this._useSeededRandom ? this.seededRandom() : Math.random();
    }

    // Original methods preserved for backward compatibility
    getRandomWordExcludingInitials(excluded: Set<string> | string[], categories: Bank[] = ["bn"], length: number): string | null {
        const ex = new Set(Array.from(excluded).map(c => c.toLowerCase()));
        const pool = this.pool(categories, length).filter(w => w && !ex.has(w[0].toLowerCase()));
        if (pool.length === 0) return this.getRandomWordExcludingInitials(excluded, categories, length+1);
        return pool[Math.floor(this.getRandom() * pool.length)];
    }

    getRandomWord(categories: Bank[], length: number): string {
        const pool = this.pool(categories, length);
        return pool[Math.floor(this.getRandom() * pool.length)];
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
