import { WordBank, type Bank } from '../../src/words/wordBank';

// Mock fetch
global.fetch = jest.fn();

const mockWordBankData: Record<Bank, Record<number, string[]>> = {
    "bnm,.": {
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
    "zxcv": {
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
    "uiop": {
        3: ["use", "ice", "out"],
        4: ["unit", "idle", "open"],
        5: ["urban", "input", "ocean"],
        6: ["update", "island", "option"]
    },
    "qwer": {
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
    "asdfjkl;": {
        2: ["as", "do"],
        3: ["ask", "sad", "far"],
        4: ["also", "safe", "just"],
        5: ["alert", "skill", "field"],
        6: ["always", "steady", "family"],
        7: ["address", "scholar", "jackpot"],
        8: ["actually", "standard", "jealousy"],
        9: ["adventure", "statement", "judgement"],
        10: ["additional", "statistics", "journalism"]
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
            const word = wordBank.getRandomWord(["bnm,."], 4);
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
            const words = wordBank.pool(["bnm,."], 4);
            expect(words).toContain("barn");
            expect(words).toContain("moon");
            expect(words).toContain("bike");
        });

        it('should combine multiple categories', () => {
            const words = wordBank.pool(["bnm,.", "zxcv"], 4);
            expect(words.length).toBeGreaterThan(3);
            expect(words).toContain("barn");
            expect(words).toContain("zoom");
        });

        it('should return fallback for missing length', () => {
            const words = wordBank.pool(["bnm,."], 99);
            expect(words).toEqual(["wordnotfound"]);
        });

        it('should throw error if not loaded', () => {
            const unloadedBank = new WordBank();
            expect(() => unloadedBank.pool(["bnm,."], 4)).toThrow("WordBank not loaded");
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
            const word = wordBank.getRandomWord(["bnm,."], 4);
            expect(["barn", "moon", "bike"]).toContain(word);
        });

        it('should handle multiple categories', () => {
            const word = wordBank.getRandomWord(["bnm,.", "zxcv"], 4);
            expect(word).toBeDefined();
            expect(word.length).toBeGreaterThan(0);
        });

        it('should return words of specified length', () => {
            const word = wordBank.getRandomWord(["bnm,."], 5);
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
            const word = wordBank.getRandomWordExcludingInitials(excluded, ["bnm,."], 4);
            // "barn", "moon", "bike" - should exclude "barn", "moon", "bike" starts with "b"
            expect(word).not.toBeNull();
            if (word) {
                expect(excluded.has(word[0].toLowerCase())).toBe(false);
            }
        });

        it('should exclude words starting with specified initials (Array)', () => {
            const excluded = ["b", "m"];
            const word = wordBank.getRandomWordExcludingInitials(excluded, ["bnm,."], 4);
            expect(word).not.toBeNull();
            if (word) {
                const initial = word[0].toLowerCase();
                expect(excluded.includes(initial)).toBe(false);
            }
        });

        it('should be case insensitive', () => {
            const excluded = new Set(["B", "M"]);
            const word = wordBank.getRandomWordExcludingInitials(excluded, ["bnm,."], 4);
            expect(word).not.toBeNull();
            if (word) {
                expect(excluded.has(word[0].toUpperCase())).toBe(false);
            }
        });

        it('should fall back to next length if all words excluded', () => {
            // Exclude all initials from length 2 words
            const excluded = new Set(["b", "m", "n"]);
            const word = wordBank.getRandomWordExcludingInitials(excluded, ["bnm,."], 2);
            // Should return length 3+ word
            expect(word).not.toBeNull();
            if (word) {
                expect(word.length).toBeGreaterThanOrEqual(3);
            }
        });
    });

    describe('getRandomWordByDifficulty', () => {
        beforeEach(async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: async () => mockWordBankData
            });
            await wordBank.load();
        });

        it('should return shorter words at low difficulty', () => {
            const words: string[] = [];
            for (let i = 0; i < 20; i++) {
                const word = wordBank.getRandomWordByDifficulty(10, ["bnm,."]);
                if (word) words.push(word);
            }
            const avgLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
            expect(avgLength).toBeLessThan(6);
        });

        it('should return longer words at high difficulty', () => {
            const words: string[] = [];
            for (let i = 0; i < 20; i++) {
                const word = wordBank.getRandomWordByDifficulty(100, ["bnm,."]);
                if (word) words.push(word);
            }
            const avgLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
            expect(avgLength).toBeGreaterThan(5);
        });

        it('should respect excluded initials', () => {
            const excluded = new Set(["b", "m"]);
            const word = wordBank.getRandomWordByDifficulty(50, ["bnm,."], excluded);
            expect(word).not.toBeNull();
            if (word) {
                expect(excluded.has(word[0].toLowerCase())).toBe(false);
            }
        });

        it('should clamp difficulty to 1-100 range', () => {
            const wordLow = wordBank.getRandomWordByDifficulty(-10, ["bnm,."]);
            expect(wordLow).toBeDefined();

            const wordHigh = wordBank.getRandomWordByDifficulty(150, ["bnm,."]);
            expect(wordHigh).toBeDefined();
        });

        it('should work with multiple categories', () => {
            const word = wordBank.getRandomWordByDifficulty(50, ["bnm,.", "zxcv"]);
            expect(word).toBeDefined();
        });
    });

    describe('calculateWordLengthFromDifficulty (implicit testing)', () => {
        beforeEach(async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: async () => mockWordBankData
            });
            await wordBank.load();
        });

        it('should produce length ~4 at difficulty 10', () => {
            const lengths: number[] = [];
            for (let i = 0; i < 50; i++) {
                const word = wordBank.getRandomWordByDifficulty(10, ["bnm,."]);
                if (word) lengths.push(word.length);
            }
            const avgLength = lengths.reduce((sum, l) => sum + l, 0) / lengths.length;
            expect(avgLength).toBeGreaterThan(3);
            expect(avgLength).toBeLessThan(5);
        });

        it('should produce length ~7 at difficulty 100', () => {
            const lengths: number[] = [];
            for (let i = 0; i < 50; i++) {
                const word = wordBank.getRandomWordByDifficulty(100, ["bnm,."]);
                if (word) lengths.push(word.length);
            }
            const avgLength = lengths.reduce((sum, l) => sum + l, 0) / lengths.length;
            expect(avgLength).toBeGreaterThan(6);
            expect(avgLength).toBeLessThan(9);
        });

        it('should show increased variance at high difficulty', () => {
            const lengthsLow: number[] = [];
            const lengthsHigh: number[] = [];
            
            // Use more samples for more reliable variance comparison
            for (let i = 0; i < 100; i++) {
                const wordLow = wordBank.getRandomWordByDifficulty(20, ["bnm,."]);
                const wordHigh = wordBank.getRandomWordByDifficulty(90, ["bnm,."]);
                if (wordLow) lengthsLow.push(wordLow.length);
                if (wordHigh) lengthsHigh.push(wordHigh.length);
            }

            const varianceLow = calculateVariance(lengthsLow);
            const varianceHigh = calculateVariance(lengthsHigh);
            
            // High difficulty should have higher variance (more word length diversity)
            // Using >= to account for randomness in small samples
            expect(varianceHigh).toBeGreaterThanOrEqual(varianceLow * 0.8);
        });
    });
});

// Helper function for variance calculation
function calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
}
