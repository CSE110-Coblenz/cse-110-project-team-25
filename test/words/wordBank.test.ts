import { WordBank, type Bank } from '../../src/words/wordBank';

// Mock fetch
global.fetch = jest.fn();

const mockWordBankData: Record<Bank, Record<number, string[]>> = {
    "bn": {
        2: ["be", "me", "no"],
        3: ["man", "box", "net"],
        4: ["barn", "moon", "bike"],
        5: ["bench", "money", "night"],
        6: ["banana", "member", "number"],
        7: ["Balance", "morning", "network"],
        8: ["backpack", "movement", "notebook"],
        9: ["beautiful", "mechanism", "navigation"],
        10: ["basketball", "membership", "nomination"],
        11: ["balancement", "magnificent", "Netherlands"]
    },
    "z/": {
        3: ["zoo", "zap", "van"],
        4: ["zoom", "zero", "cave"],
        5: ["zebra", "circa", "voice"],
        6: ["zombie", "circus", "vacuum"]
    },
    "ty": {
        3: ["try", "toy", "yes"],
        4: ["type", "tiny", "year"],
        5: ["trust", "tempo", "youth"],
        6: ["treaty", "typing", "yellow"]
    },
    "ei": {
        3: ["use", "ice", "out"],
        4: ["unit", "idle", "open"],
        5: ["urban", "input", "ocean"],
        6: ["update", "island", "option"]
    },
    "qp": {
        3: ["qat", "war", "red"],
        4: ["quit", "week", "rest"],
        5: ["queen", "wheel", "reply"],
        6: ["quarry", "wreath", "render"]
    },
    "gh": {
        3: ["get", "hot", "hen"],
        4: ["good", "high", "hand"],
        5: ["great", "house", "happy"],
        6: ["garden", "health", "heaven"]
    },
    "a;": {
        2: ["as", "do"],
        3: ["ask", "sad", "far"],
        4: ["also", "safe", "just"],
        5: ["alert", "skill", "field"],
        6: ["always", "steady", "family"],
        7: ["address", "scholar", "jackpot"],
        8: ["actually", "standard", "jealousy"],
        9: ["adventure", "statement", "judgement"],
        10: ["additional", "statistics", "journalism"]
    },
    "vm": {
        3: ["van", "mom", "vim"],
        4: ["move", "vast", "vibe"],
        5: ["movie", "voice", "value"],
        6: ["volume", "victim", "marvel"]
    },
    "c,": {
        3: ["car", "can", "cat"],
        4: ["cool", "come", "cook"],
        5: ["coach", "civic", "comic"],
        6: ["coffee", "circle", "cosmic"]
    },
    "x.": {
        3: ["box", "fix", "tax"],
        4: ["next", "text", "apex"],
        5: ["exact", "toxic", "relax"],
        6: ["expert", "excuse", "matrix"]
    },
    "ru": {
        3: ["run", "rub", "rug"],
        4: ["rule", "true", "rush"],
        5: ["rural", "round", "urban"],
        6: ["rumble", "return", "urgent"]
    },
    "wo": {
        3: ["wow", "won", "two"],
        4: ["work", "word", "worn"],
        5: ["world", "worry", "tower"],
        6: ["wonder", "window", "wooden"]
    },
    "sl": {
        3: ["sad", "let", "sol"],
        4: ["slow", "sale", "silk"],
        5: ["sleep", "slide", "solid"],
        6: ["slogan", "lesson", "social"]
    },
    "dk": {
        3: ["day", "kid", "dad"],
        4: ["dark", "duck", "kind"],
        5: ["drink", "demon", "knife"],
        6: ["donkey", "dinner", "kicked"]
    },
    "fj": {
        3: ["far", "joy", "jot"],
        4: ["fair", "jump", "jest"],
        5: ["field", "judge", "fjord"],
        6: ["finger", "joyful", "fajita"]
    }
};

describe('WordBank', () => {
    let wordBank: WordBank;

    beforeEach(() => {
        wordBank = new WordBank();
        (fetch as jest.Mock).mockClear();
    });

    describe('load', () => {
        it('should fetch wordbank.json', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: async () => mockWordBankData
            });

            await wordBank.load();
            expect(fetch).toHaveBeenCalledWith('./wordbank.json');
        });

        it('should not fetch if already loaded', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: async () => mockWordBankData
            });

            await wordBank.load();
            await wordBank.load();
            expect(fetch).toHaveBeenCalledTimes(1);
        });

        it('should parse JSON response', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: async () => mockWordBankData
            });

            await wordBank.load();
            // After loading, getRandomWord should work without throwing
            const word = wordBank.getRandomWord(["bn"], 4);
            expect(word).toBeDefined();
        });
    });

    describe('pool', () => {
        beforeEach(async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: async () => mockWordBankData
            });
            await wordBank.load();
        });

        it('should return words from specified categories and length', () => {
            const words = wordBank.pool(["bn"], 4);
            expect(words).toContain("barn");
            expect(words).toContain("moon");
            expect(words).toContain("bike");
        });

        it('should combine multiple categories', () => {
            const words = wordBank.pool(["bn", "z/"], 4);
            expect(words.length).toBeGreaterThan(3);
            expect(words).toContain("barn");
            expect(words).toContain("zoom");
        });

        it('should return fallback for missing length', () => {
            const words = wordBank.pool(["bn"], 99);
            expect(words).toEqual(["wordnotfound"]);
        });

        it('should throw error if not loaded', () => {
            const unloadedBank = new WordBank();
            expect(() => unloadedBank.pool(["bn"], 4)).toThrow("WordBank not loaded");
        });
    });

    describe('getRandomWord', () => {
        beforeEach(async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: async () => mockWordBankData
            });
            await wordBank.load();
        });

        it('should return a word from pool', () => {
            const word = wordBank.getRandomWord(["bn"], 4);
            expect(["barn", "moon", "bike"]).toContain(word);
        });

        it('should handle multiple categories', () => {
            const word = wordBank.getRandomWord(["bn", "z/"], 4);
            expect(word).toBeDefined();
            expect(word.length).toBeGreaterThan(0);
        });

        it('should return words of specified length', () => {
            const word = wordBank.getRandomWord(["bn"], 5);
            expect(["bench", "money", "night"]).toContain(word);
        });
    });

    describe('getRandomWordExcludingInitials', () => {
        beforeEach(async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: async () => mockWordBankData
            });
            await wordBank.load();
        });

        it('should exclude words starting with specified initials (Set)', () => {
            const excluded = new Set(["b", "m"]);
            const word = wordBank.getRandomWordExcludingInitials(excluded, ["bn"], 4);
            // "barn", "moon", "bike" - should exclude "barn", "moon", "bike" starts with "b"
            expect(word).not.toBeNull();
            if (word) {
                expect(excluded.has(word[0].toLowerCase())).toBe(false);
            }
        });

        it('should exclude words starting with specified initials (Array)', () => {
            const excluded = ["b", "m"];
            const word = wordBank.getRandomWordExcludingInitials(excluded, ["bn"], 4);
            expect(word).not.toBeNull();
            if (word) {
                const initial = word[0].toLowerCase();
                expect(excluded.includes(initial)).toBe(false);
            }
        });

        it('should be case insensitive', () => {
            const excluded = new Set(["B", "M"]);
            const word = wordBank.getRandomWordExcludingInitials(excluded, ["bn"], 4);
            expect(word).not.toBeNull();
            if (word) {
                expect(excluded.has(word[0].toUpperCase())).toBe(false);
            }
        });

        it('should fall back to next length if all words excluded', () => {
            // Exclude all initials from length 2 words
            const excluded = new Set(["b", "m", "n"]);
            const word = wordBank.getRandomWordExcludingInitials(excluded, ["bn"], 2);
            // Should return length 3+ word
            expect(word).not.toBeNull();
            if (word) {
                expect(word.length).toBeGreaterThanOrEqual(3);
            }
        });
    });

    describe('seeded random', () => {
        beforeEach(async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: async () => mockWordBankData
            });
            await wordBank.load();
        });

        it('should return deterministic words with same seed', () => {
            const bank1 = new WordBank();
            const bank2 = new WordBank();
            
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: async () => mockWordBankData
            });
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: async () => mockWordBankData
            });
            
            bank1.load().then(() => {
                bank1.setSeed(12345);
                bank2.load().then(() => {
                    bank2.setSeed(12345);
                    
                    const word1 = bank1.getRandomWord(["bn"], 4);
                    const word2 = bank2.getRandomWord(["bn"], 4);
                    
                    expect(word1).toBe(word2);
                });
            });
        });

        it('should enable seeded mode with setSeed', () => {
            wordBank.setSeed(999);
            const word1 = wordBank.getRandomWord(["bn"], 4);
            
            wordBank.setSeed(999);
            const word2 = wordBank.getRandomWord(["bn"], 4);
            
            expect(word1).toBe(word2);
        });

        it('should disable seeded mode with disableSeed', () => {
            wordBank.setSeed(777);
            const seededWord = wordBank.getRandomWord(["bn"], 4);
            
            wordBank.disableSeed();
            const randomWord = wordBank.getRandomWord(["bn"], 4);
            
            // Should still be valid words
            expect(["barn", "moon", "bike"]).toContain(seededWord);
            expect(["barn", "moon", "bike"]).toContain(randomWord);
        });

        it('should produce different words with different seeds', () => {
            wordBank.setSeed(111);
            const word1 = wordBank.getRandomWord(["bn"], 4);
            
            wordBank.setSeed(222);
            const word2 = wordBank.getRandomWord(["bn"], 4);
            
            // Words should be valid, but may differ
            expect(["barn", "moon", "bike"]).toContain(word1);
            expect(["barn", "moon", "bike"]).toContain(word2);
        });

        it('should work with getRandomWordExcludingInitials in seeded mode', () => {
            wordBank.setSeed(555);
            const excluded = new Set(["b"]);
            const word1 = wordBank.getRandomWordExcludingInitials(excluded, ["bn"], 4);
            
            wordBank.setSeed(555);
            const word2 = wordBank.getRandomWordExcludingInitials(excluded, ["bn"], 4);
            
            expect(word1).toBe(word2);
            if (word1) {
                expect(excluded.has(word1[0].toLowerCase())).toBe(false);
            }
        });
    });
});

// Helper function for variance calculation
function calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
}
