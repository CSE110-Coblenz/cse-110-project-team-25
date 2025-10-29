export type Category =
  | "asdfjkl;" | "gh" | "qwer" | "uiop" | "ty" | "zxcv" | "bnm,." | "capitals";

export class WordBank {
  private banks: Record<Category, string[]> | null = null;

  async load(url = "/wordbanks.json"): Promise<void> {
    if (this.banks) return;
    const res = await fetch(url);
    this.banks = await res.json();
  }

  getRandomWord(categories: Category[] | "any"): string {
    const pool = this.pool(categories);
    return pool[Math.floor(Math.random() * pool.length)];
  }

    getRandomWordExcludingInitials(
    excluded: Set<string> | string[],
    categories: Category[] | "any" = "any"
    ): string | null {
    const ex = new Set(Array.from(excluded).map(c => c.toLowerCase()));
    const pool = this.pool(categories).filter(w => w && !ex.has(w[0].toLowerCase()));
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
    }


  private pool(categories: Category[] | "any"): string[] {
    if (!this.banks) throw new Error("WordBank not loaded. Call load() first.");
    const all = categories === "any"
      ? Object.values(this.banks).flat()
      : categories.flatMap(c => this.banks![c] ?? []);
    const list = all.filter(Boolean);
    return list.length ? list : ["quickly"];
  }
}

export const wordBank = new WordBank();
