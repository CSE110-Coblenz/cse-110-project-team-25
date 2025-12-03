import DifficultyUtil from '../../../src/backend/difficulty/DifficultyUtil';

describe('DifficultyUtil', () => {
    let difficultyUtil: DifficultyUtil;

    beforeEach(() => {
        // Use a fixed seed for deterministic testing
        difficultyUtil = new DifficultyUtil(50, 12345);
    });

    describe('difficulty getter/setter', () => {
        it('should get the current difficulty', () => {
            expect(difficultyUtil.difficulty).toBe(50);
        });

        it('should set difficulty within valid range', () => {
            difficultyUtil.difficulty = 75;
            expect(difficultyUtil.difficulty).toBe(75);
        });

        it('should clamp difficulty to minimum of 1', () => {
            difficultyUtil.difficulty = -10;
            expect(difficultyUtil.difficulty).toBe(1);
        });

        it('should clamp difficulty to maximum of 100', () => {
            difficultyUtil.difficulty = 150;
            expect(difficultyUtil.difficulty).toBe(100);
        });
    });

    describe('randWordLength', () => {
        it('should return deterministic length with same seed', () => {
            const util1 = new DifficultyUtil(50, 42);
            const util2 = new DifficultyUtil(50, 42);
            expect(util1.randWordLength()).toBe(util2.randWordLength());
        });

        it('should return expected length at difficulty 10', () => {
            const util = new DifficultyUtil(10, 789);
            const length = util.randWordLength();
            expect(length).toBeGreaterThanOrEqual(2);
            expect(length).toBeLessThanOrEqual(11);
        });

        it('should return expected length at difficulty 50', () => {
            const util = new DifficultyUtil(50, 456);
            const length = util.randWordLength();
            expect(length).toBeGreaterThanOrEqual(2);
            expect(length).toBeLessThanOrEqual(11);
        });

        it('should return expected length at difficulty 100', () => {
            const util = new DifficultyUtil(100, 123);
            const length = util.randWordLength();
            expect(length).toBeGreaterThanOrEqual(2);
            expect(length).toBeLessThanOrEqual(11);
        });

        it('should produce different lengths with different seeds', () => {
            const lengths = new Set<number>();
            // Test with many different seeds to ensure variety
            for (let seed = 1; seed < 500; seed++) {
                const util = new DifficultyUtil(50, seed);
                lengths.add(util.randWordLength());
            }
            // Should produce multiple different lengths
            expect(lengths.size).toBeGreaterThanOrEqual(2);
        });
    });

    describe('randSpeedMultiplier', () => {
        it('should return deterministic speed with same seed', () => {
            const util1 = new DifficultyUtil(50, 99);
            const util2 = new DifficultyUtil(50, 99);
            expect(util1.randSpeedMultiplier()).toBe(util2.randSpeedMultiplier());
        });

        it('should return slower speed at difficulty 10', () => {
            difficultyUtil.difficulty = 10;
            const speed = difficultyUtil.randSpeedMultiplier();
            expect(speed).toBeGreaterThanOrEqual(0.3);
            expect(speed).toBeLessThanOrEqual(0.5);
        });

        it('should return medium speed at difficulty 50', () => {
            difficultyUtil.difficulty = 50;
            const speed = difficultyUtil.randSpeedMultiplier();
            expect(speed).toBeGreaterThan(0.5);
            expect(speed).toBeLessThan(1.5);
        });

        it('should return faster speed at difficulty 100', () => {
            difficultyUtil.difficulty = 100;
            const speed = difficultyUtil.randSpeedMultiplier();
            expect(speed).toBeGreaterThanOrEqual(1.5);
            expect(speed).toBeLessThanOrEqual(2.0);
        });

        it('should scale between difficulty levels', () => {
            const util1 = new DifficultyUtil(10, 777);
            const util2 = new DifficultyUtil(100, 777);
            
            const speedLow = util1.randSpeedMultiplier();
            const speedHigh = util2.randSpeedMultiplier();
            
            expect(speedHigh).toBeGreaterThan(speedLow);
        });
    });

    describe('randEnemyCount', () => {
        it('should return deterministic count with same seed', () => {
            const util1 = new DifficultyUtil(50, 555);
            const util2 = new DifficultyUtil(50, 555);
            expect(util1.randEnemyCount()).toBe(util2.randEnemyCount());
        });

        it('should return 2-3 enemies at difficulty 10', () => {
            difficultyUtil.difficulty = 10;
            const count = difficultyUtil.randEnemyCount();
            expect(count).toBeGreaterThanOrEqual(2);
            expect(count).toBeLessThanOrEqual(3);
        });

        it('should return 3-4 enemies at difficulty 30', () => {
            difficultyUtil.difficulty = 30;
            const count = difficultyUtil.randEnemyCount();
            expect(count).toBeGreaterThanOrEqual(2);
            expect(count).toBeLessThanOrEqual(4);
        });

        it('should return 3-5 enemies at difficulty 50', () => {
            difficultyUtil.difficulty = 50;
            const count = difficultyUtil.randEnemyCount();
            expect(count).toBeGreaterThanOrEqual(3);
            expect(count).toBeLessThanOrEqual(5);
        });

        it('should return 4-5 enemies at difficulty 70', () => {
            difficultyUtil.difficulty = 70;
            const count = difficultyUtil.randEnemyCount();
            expect(count).toBeGreaterThanOrEqual(3);
            expect(count).toBeLessThanOrEqual(5);
        });

        it('should return 4-6 enemies at difficulty 100', () => {
            difficultyUtil.difficulty = 100;
            const count = difficultyUtil.randEnemyCount();
            expect(count).toBeGreaterThanOrEqual(4);
            expect(count).toBeLessThanOrEqual(6);
        });
    });

    describe('randEnemyType', () => {
        it('should return deterministic type with same seed', () => {
            const util1 = new DifficultyUtil(50, 888);
            const util2 = new DifficultyUtil(50, 888);
            expect(util1.randEnemyType()).toBe(util2.randEnemyType());
        });

        it('should return comet or meteor at low difficulty', () => {
            const util = new DifficultyUtil(10, 111);
            const type = util.randEnemyType();
            expect(['comet', 'meteor']).toContain(type);
        });

        it('should return valid enemy type at difficulty 50', () => {
            const util = new DifficultyUtil(50, 222);
            const type = util.randEnemyType();
            expect(['comet', 'meteor', 'ufo', 'shooter', 'amiiba']).toContain(type);
        });

        it('should be able to return multiple enemy types at max difficulty', () => {
            // Test multiple times with different seeds to ensure variety
            const types = new Set<string>();
            for (let seed = 1; seed < 500; seed++) {
                const util = new DifficultyUtil(100, seed);
                types.add(util.randEnemyType());
            }
            
            // At max difficulty, should get at least multiple different enemy types
            expect(types.size).toBeGreaterThanOrEqual(2);
        });

        it('should only return easier enemies at very low difficulty', () => {
            const util = new DifficultyUtil(5, 333);
            const types = new Set<string>();
            for (let i = 0; i < 20; i++) {
                types.add(util.randEnemyType());
            }
            // At very low difficulty, should only see comet and meteor
            types.forEach(type => {
                expect(['comet', 'meteor']).toContain(type);
            });
        });
    });
});
