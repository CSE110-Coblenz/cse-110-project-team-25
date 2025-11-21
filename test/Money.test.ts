import { Money } from '../src/Money';

describe('Money', () => {
    let money: Money;

    beforeEach(() => {
        // Reset singleton for each test
        (Money as any)._instance = null;
        money = Money.getInstance();
    });

    describe('getInstance', () => {
        it('should return a singleton instance', () => {
            const instance1 = Money.getInstance();
            const instance2 = Money.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe('amount getter', () => {
        it('should return initial amount of 0', () => {
            expect(money.amount).toBe(0);
        });
    });

    describe('amount setter', () => {
        it('should set amount to the given value', () => {
            money.amount = 100;
            expect(money.amount).toBe(100);
        });

        it('should not allow negative amounts', () => {
            money.amount = -50;
            expect(money.amount).toBe(0);
        });

        it('should allow zero amount', () => {
            money.amount = 0;
            expect(money.amount).toBe(0);
        });
    });

    describe('add', () => {
        it('should add positive value to amount', () => {
            money.amount = 100;
            money.add(50);
            expect(money.amount).toBe(150);
        });

        it('should work with zero initial amount', () => {
            money.add(75);
            expect(money.amount).toBe(75);
        });

        it('should handle multiple additions', () => {
            money.add(10);
            money.add(20);
            money.add(30);
            expect(money.amount).toBe(60);
        });

        it('should handle negative additions (decreases amount)', () => {
            money.amount = 100;
            money.add(-50);
            expect(money.amount).toBe(50);
        });
    });

    describe('subtract', () => {
        it('should subtract value from amount', () => {
            money.amount = 100;
            money.subtract(30);
            expect(money.amount).toBe(70);
        });

        it('should not go below zero', () => {
            money.amount = 50;
            money.subtract(75);
            expect(money.amount).toBe(0);
        });

        it('should handle exact subtraction', () => {
            money.amount = 100;
            money.subtract(100);
            expect(money.amount).toBe(0);
        });

        it('should handle multiple subtractions', () => {
            money.amount = 100;
            money.subtract(10);
            money.subtract(20);
            money.subtract(30);
            expect(money.amount).toBe(40);
        });
    });

    describe('calculateReward', () => {
        it('should calculate reward based on word length and speed', () => {
            // Formula: floor((wordLength * 10) * (speed / 6))
            const reward = money.calculateReward(5, 6);
            expect(reward).toBe(50); // (5 * 10) * (6 / 6) = 50
        });

        it('should return 0 for zero word length', () => {
            const reward = money.calculateReward(0, 6);
            expect(reward).toBe(0);
        });

        it('should return 0 for zero speed', () => {
            const reward = money.calculateReward(5, 0);
            expect(reward).toBe(0);
        });

        it('should handle high speed multiplier', () => {
            const reward = money.calculateReward(5, 12);
            expect(reward).toBe(100); // (5 * 10) * (12 / 6) = 100
        });

        it('should floor decimal results', () => {
            const reward = money.calculateReward(3, 5);
            expect(reward).toBe(25); // floor((3 * 10) * (5 / 6)) = floor(25)
        });

        it('should handle various word lengths', () => {
            expect(money.calculateReward(1, 6)).toBe(10);
            expect(money.calculateReward(10, 6)).toBe(100);
            expect(money.calculateReward(7, 6)).toBe(70);
        });

        it('should scale with speed correctly', () => {
            expect(money.calculateReward(5, 3)).toBe(25);  // half speed
            expect(money.calculateReward(5, 6)).toBe(50);  // normal speed
            expect(money.calculateReward(5, 9)).toBe(75);  // 1.5x speed
        });
    });

    describe('reset', () => {
        it('should reset amount to 0', () => {
            money.amount = 500;
            money.reset();
            expect(money.amount).toBe(0);
        });

        it('should work when amount is already 0', () => {
            money.reset();
            expect(money.amount).toBe(0);
        });
    });

    describe('integration', () => {
        it('should handle complex money management', () => {
            money.add(100);
            money.subtract(30);
            const reward = money.calculateReward(5, 6);
            money.add(reward);
            expect(money.amount).toBe(120); // 100 - 30 + 50
        });

        it('should maintain non-negative invariant through operations', () => {
            money.subtract(100); // starts at 0
            expect(money.amount).toBe(0);
            money.add(50);
            money.subtract(100);
            expect(money.amount).toBe(0);
        });
    });
});
