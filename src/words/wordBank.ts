export type Category =
  | "asdfjkl;" | "gh" | "qwer" | "uiop" | "ty" | "zxcv" | "bnm,." | "capitals";

export type WordBanks = Record<Category, string[]>;

export class WordBank {
  private banks: WordBanks | null = null;

  // Load once from a served JSON file (Vite/CRA/etc will copy from /src to /dist if imported or referenced)
  async load(url = "/src/data/wordbanks.json"): Promise<void> {
    if (this.banks) return;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load wordbanks.json: ${res.status}`);
    this.banks = await res.json();
  }

  /** Return a random word from the given categories (unioned). */
  getRandomWord(categories: Category[] | "any"): string {
    if (!this.banks) throw new Error("WordBank not loaded. Call load() first.");
    const pool: string[] =
      categories === "any"
        ? Object.values(this.banks).flat()
        : categories.flatMap(c => this.banks![c] ?? []);
    const list = pool.filter(Boolean);
    // Fallback if empty
    if (list.length === 0) return "quickly";
    return list[Math.floor(Math.random() * list.length)];
  }
}

// A shared instance you can import anywhere
export const wordBank = new WordBank();
