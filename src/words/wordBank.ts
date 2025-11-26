// const MAX_WORD_LENGTH = 18;

export type Bank = "bn" | "vm" | "c," | "x." | "z/" | "ty" | "ru" | "ei" | "wo" | "qp" | "gh" | "a;" | "sl" | "dk" | "fj"
type SubBank = Record<number, string[]>;

export class WordBank {
    private banks: Record<Bank, SubBank> | null = null;

    async load(): Promise<void> {
        if (this.banks) return;
        const res = await fetch("./wordbank.json");
        this.banks = await res.json();
    }

    // Original methods preserved for backward compatibility
    getRandomWordExcludingInitials(excluded: Set<string> | string[], categories: Bank[] = ["bn"], length: number): string | null {
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
