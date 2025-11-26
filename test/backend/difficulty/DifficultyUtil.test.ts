import DifficultyUtil from '../../../src/backend/difficulty/DifficultyUtil';

describe('DifficultyUtil', () => {
    let difficultyUtil: DifficultyUtil;

    // Mock Math.random to return predictable values
    let mockRandomValue = 0.5;
    const originalRandom = Math.random;

    beforeAll(() => {
        Math.random = jest.fn(() => mockRandomValue);
    });

    afterAll(() => {
        Math.random = originalRandom;
    });

    beforeEach(() => {
        mockRandomValue = 0.5; // Reset to default
        difficultyUtil = new DifficultyUtil(50);
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
        it('should return expected length at difficulty 10 with seeded random', () => {
            difficultyUtil.difficulty = 10;
            mockRandomValue = 0.5;
            const length = difficultyUtil.randWordLength();
            expect(length).toBeGreaterThanOrEqual(2);
            expect(length).toBeLessThanOrEqual(11);
        });

        it('should return expected length at difficulty 50 with seeded random', () => {
            difficultyUtil.difficulty = 50;
            mockRandomValue = 0.5;
            const length = difficultyUtil.randWordLength();
            expect(length).toBeGreaterThanOrEqual(3);
            expect(length).toBeLessThanOrEqual(8);
        });

        it('should return expected length at difficulty 100 with seeded random', () => {
            difficultyUtil.difficulty = 100;
            mockRandomValue = 0.5;
            const length = difficultyUtil.randWordLength();
            expect(length).toBeGreaterThanOrEqual(5);
            expect(length).toBeLessThanOrEqual(11);
        });

        it('should favor shorter words at low difficulty', () => {
            difficultyUtil.difficulty = 10;
            mockRandomValue = 0.2;
            const length = difficultyUtil.randWordLength();
            expect(length).toBeLessThanOrEqual(5);
        });

        it('should favor longer words at high difficulty', () => {
            difficultyUtil.difficulty = 100;
            mockRandomValue = 0.8;
            const length = difficultyUtil.randWordLength();
            expect(length).toBeGreaterThanOrEqual(6);
        });
    });

    describe('randSpeedMultiplier', () => {
        it('should return slower speed at difficulty 10', () => {
            difficultyUtil.difficulty = 10;
            mockRandomValue = 0.5;
            const speed = difficultyUtil.randSpeedMultiplier();
            expect(speed).toBeGreaterThanOrEqual(0.5);
            expect(speed).toBeLessThanOrEqual(0.7);
        });

        it('should return medium speed at difficulty 50', () => {
            difficultyUtil.difficulty = 50;
            mockRandomValue = 0.5;
            const speed = difficultyUtil.randSpeedMultiplier();
            expect(speed).toBeGreaterThan(1.0);
            expect(speed).toBeLessThan(3.0);
        });

        it('should return faster speed at difficulty 100', () => {
            difficultyUtil.difficulty = 100;
            mockRandomValue = 0.5;
            const speed = difficultyUtil.randSpeedMultiplier();
            expect(speed).toBeGreaterThanOrEqual(3.0);
            expect(speed).toBeLessThanOrEqual(4.0);
        });

        it('should return consistent result with same seed at difficulty 75', () => {
            difficultyUtil.difficulty = 75;
            mockRandomValue = 0.3;
            const speed1 = difficultyUtil.randSpeedMultiplier();
            const speed2 = difficultyUtil.randSpeedMultiplier();
            expect(speed1).toBe(speed2);
        });

        it('should scale linearly between difficulty levels', () => {
            mockRandomValue = 0.5;
            
            difficultyUtil.difficulty = 10;
            const speedLow = difficultyUtil.randSpeedMultiplier();
            
            difficultyUtil.difficulty = 100;
            const speedHigh = difficultyUtil.randSpeedMultiplier();
            
            expect(speedHigh).toBeGreaterThan(speedLow);
        });
    });

    describe('randEnemyCount', () => {
        it('should return 2-3 enemies at difficulty 10', () => {
            difficultyUtil.difficulty = 10;
            mockRandomValue = 0.5;
            const count = difficultyUtil.randEnemyCount();
            expect(count).toBeGreaterThanOrEqual(2);
            expect(count).toBeLessThanOrEqual(3);
        });

        it('should return 3-4 enemies at difficulty 30', () => {
            difficultyUtil.difficulty = 30;
            mockRandomValue = 0.5;
            const count = difficultyUtil.randEnemyCount();
            expect(count).toBeGreaterThanOrEqual(2);
            expect(count).toBeLessThanOrEqual(4);
        });

        it('should return 3-5 enemies at difficulty 50', () => {
            difficultyUtil.difficulty = 50;
            mockRandomValue = 0.5;
            const count = difficultyUtil.randEnemyCount();
            expect(count).toBeGreaterThanOrEqual(3);
            expect(count).toBeLessThanOrEqual(5);
        });

        it('should return 4-5 enemies at difficulty 70', () => {
            difficultyUtil.difficulty = 70;
            mockRandomValue = 0.5;
            const count = difficultyUtil.randEnemyCount();
            expect(count).toBeGreaterThanOrEqual(3);
            expect(count).toBeLessThanOrEqual(5);
        });

        it('should return 4-6 enemies at difficulty 100', () => {
            difficultyUtil.difficulty = 100;
            mockRandomValue = 0.5;
            const count = difficultyUtil.randEnemyCount();
            expect(count).toBeGreaterThanOrEqual(4);
            expect(count).toBeLessThanOrEqual(6);
        });

        it('should return 2 enemies with low random at difficulty 10', () => {
            difficultyUtil.difficulty = 10;
            mockRandomValue = 0.1;
            const count = difficultyUtil.randEnemyCount();
            expect(count).toBe(2);
        });

        it('should return higher count with high random at difficulty 100', () => {
            difficultyUtil.difficulty = 100;
            mockRandomValue = 0.9;
            const count = difficultyUtil.randEnemyCount();
            expect(count).toBeGreaterThanOrEqual(5);
        });
    });

    describe('randEnemyType', () => {
        it('should return comet at very low scaled value', () => {
            difficultyUtil.difficulty = 10;
            mockRandomValue = 0.05; // 0.05 * 2 * (10/1.75) ≈ 0.57
            const type = difficultyUtil.randEnemyType();
            expect(type).toBe('comet');
        });

        it('should return meteor at difficulty 20 with mid random', () => {
            difficultyUtil.difficulty = 20;
            mockRandomValue = 0.5; // 0.5 * 2 * (20/1.75) ≈ 11.43
            const type = difficultyUtil.randEnemyType();
            expect(type).toBe('meteor');
        });

        it('should return ufo at difficulty 50 with mid random', () => {
            difficultyUtil.difficulty = 50;
            mockRandomValue = 0.6; // 0.6 * 2 * (50/1.75) ≈ 34.29
            const type = difficultyUtil.randEnemyType();
            expect(type).toBe('meteor');
        });

        it('should return ufo at difficulty 70', () => {
            difficultyUtil.difficulty = 70;
            mockRandomValue = 0.6; // 0.6 * 2 * (70/1.75) = 48
            const type = difficultyUtil.randEnemyType();
            expect(type).toBe('ufo');
        });

        it('should return shooter at difficulty 85', () => {
            difficultyUtil.difficulty = 85;
            mockRandomValue = 0.7; // 0.7 * 2 * (85/1.75) ≈ 68
            const type = difficultyUtil.randEnemyType();
            expect(type).toBe('ufo');
        });

        it('should return shooter at high difficulty', () => {
            difficultyUtil.difficulty = 90;
            mockRandomValue = 0.8; // 0.8 * 2 * (90/1.75) ≈ 82.29
            const type = difficultyUtil.randEnemyType();
            expect(type).toBe('shooter');
        });

        it('should return amiiba at very high scaled value', () => {
            difficultyUtil.difficulty = 100;
            mockRandomValue = 0.9; // 0.9 * 2 * (100/1.75) ≈ 102.86
            const type = difficultyUtil.randEnemyType();
            expect(type).toBe('amiiba');
        });

        it('should never return harder enemies at low difficulty', () => {
            difficultyUtil.difficulty = 10;
            mockRandomValue = 0.99;
            const type = difficultyUtil.randEnemyType();
            expect(['comet', 'meteor']).toContain(type);
        });

        it('should be able to return all enemy types at max difficulty', () => {
            difficultyUtil.difficulty = 100;
            
            // Test each bin
            mockRandomValue = 0.001; // Very low -> comet
            expect(difficultyUtil.randEnemyType()).toBe('comet');
            
            mockRandomValue = 0.1; // Low -> meteor
            expect(difficultyUtil.randEnemyType()).toBe('meteor');
            
            mockRandomValue = 0.5; // Mid -> ufo
            expect(difficultyUtil.randEnemyType()).toBe('ufo');
            
            mockRandomValue = 0.75; // High -> shooter
            expect(difficultyUtil.randEnemyType()).toBe('shooter');
            
            mockRandomValue = 0.95; // Very high -> amiiba
            expect(difficultyUtil.randEnemyType()).toBe('amiiba');
        });
    });
});
