import { Health } from '../src/Health';

describe('Health', () => {
    let health: Health;

    beforeEach(() => {
        // Reset singleton for each test
        (Health as any)._instance = null;
        health = Health.getInstance();
    });

    describe('getInstance', () => {
        it('should return a singleton instance', () => {
            const instance1 = Health.getInstance();
            const instance2 = Health.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe('lives getter', () => {
        it('should return initial lives value of 3', () => {
            expect(health.lives).toBe(3);
        });
    });

    describe('maxLives getter', () => {
        it('should return max lives value of 3', () => {
            expect(health.maxLives).toBe(3);
        });
    });

    describe('lives setter', () => {
        it('should set lives to the given value', () => {
            health.lives = 2;
            expect(health.lives).toBe(2);
        });

        it('should not allow negative lives', () => {
            health.lives = -5;
            expect(health.lives).toBe(0);
        });

        it('should allow zero lives', () => {
            health.lives = 0;
            expect(health.lives).toBe(0);
        });

        it('should allow values above maxLives', () => {
            health.lives = 10;
            expect(health.lives).toBe(10);
        });
    });

    describe('loseLife', () => {
        it('should decrease lives by 1', () => {
            health.loseLife();
            expect(health.lives).toBe(2);
        });

        it('should not go below 0', () => {
            health.lives = 1;
            health.loseLife();
            health.loseLife();
            expect(health.lives).toBe(0);
        });

        it('should handle multiple consecutive calls', () => {
            health.loseLife();
            health.loseLife();
            health.loseLife();
            expect(health.lives).toBe(0);
        });
    });

    describe('gainLife', () => {
        it('should increase lives by 1', () => {
            health.lives = 2;
            health.gainLife();
            expect(health.lives).toBe(3);
        });

        it('should not exceed maxLives', () => {
            health.gainLife();
            expect(health.lives).toBe(3);
        });

        it('should work when at 0 lives', () => {
            health.lives = 0;
            health.gainLife();
            expect(health.lives).toBe(1);
        });
    });

    describe('reset', () => {
        it('should reset lives to maxLives', () => {
            health.lives = 1;
            health.reset();
            expect(health.lives).toBe(3);
        });

        it('should work when lives is 0', () => {
            health.lives = 0;
            health.reset();
            expect(health.lives).toBe(3);
        });

        it('should work when lives is above maxLives', () => {
            health.lives = 10;
            health.reset();
            expect(health.lives).toBe(3);
        });
    });
});
