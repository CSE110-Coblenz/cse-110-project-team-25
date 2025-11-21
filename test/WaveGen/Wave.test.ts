import Wave from '../../src/WaveGen/Wave';
import Enemy from '../../src/objects/Enemy';
import Effect from '../../src/objects/Effect';
import Konva from 'konva';

// Mock Enemy and Effect classes
class MockEnemy {
    id: number;
    word: string;
    constructor(id: number, word: string) {
        this.id = id;
        this.word = word;
    }
}

class MockEffect {
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}

describe('Wave', () => {
    let wave: Wave;

    beforeEach(() => {
        wave = new Wave();
    });

    describe('constructor', () => {
        it('should initialize with empty enemies map', () => {
            expect(wave.getCount()).toBe(0);
        });

        it('should initialize with empty active initials set', () => {
            expect(wave.activeInitials.size).toBe(0);
        });
    });

    describe('count', () => {
        it('should return number of active initials', () => {
            const enemy1 = new MockEnemy(1, 'apple') as any as Enemy;
            const enemy2 = new MockEnemy(2, 'banana') as any as Enemy;
            wave.addEnemy(enemy1);
            wave.addEnemy(enemy2);
            expect(wave.count()).toBe(2);
        });

        it('should count unique initials only', () => {
            const enemy1 = new MockEnemy(1, 'apple') as any as Enemy;
            const enemy2 = new MockEnemy(2, 'avocado') as any as Enemy;
            wave.addEnemy(enemy1);
            wave.addEnemy(enemy2);
            // Both start with 'a', so count should be 1
            expect(wave.count()).toBe(1);
        });

        it('should return 0 for empty wave', () => {
            expect(wave.count()).toBe(0);
        });
    });

    describe('addEnemy', () => {
        it('should add enemy to the wave', () => {
            const enemy = new MockEnemy(1, 'test') as any as Enemy;
            wave.addEnemy(enemy);
            expect(wave.getEnemy(1)).toBe(enemy);
        });

        it('should add initial to active initials set', () => {
            const enemy = new MockEnemy(1, 'test') as any as Enemy;
            wave.addEnemy(enemy);
            expect(wave.activeInitials.has('t')).toBe(true);
        });

        it('should handle multiple enemies', () => {
            const enemy1 = new MockEnemy(1, 'apple') as any as Enemy;
            const enemy2 = new MockEnemy(2, 'banana') as any as Enemy;
            wave.addEnemy(enemy1);
            wave.addEnemy(enemy2);
            expect(wave.getCount()).toBe(2);
        });
    });

    describe('removeEnemy', () => {
        it('should remove enemy from wave', () => {
            const enemy = new MockEnemy(1, 'test') as any as Enemy;
            wave.addEnemy(enemy);
            wave.removeEnemy(1);
            expect(wave.getEnemy(1)).toBeUndefined();
        });

        it('should remove initial from active initials', () => {
            const enemy = new MockEnemy(1, 'test') as any as Enemy;
            wave.addEnemy(enemy);
            wave.removeEnemy(1);
            expect(wave.activeInitials.has('t')).toBe(false);
        });

        it('should handle removing non-existent enemy', () => {
            wave.removeEnemy(999);
            // Should not throw error
            expect(wave.getCount()).toBe(0);
        });

        it('should only remove initials when last enemy with that initial is removed', () => {
            const enemy1 = new MockEnemy(1, 'apple') as any as Enemy;
            const enemy2 = new MockEnemy(2, 'avocado') as any as Enemy;
            wave.addEnemy(enemy1);
            wave.addEnemy(enemy2);
            wave.removeEnemy(1);
            // 'a' should still be active because enemy2 starts with 'a'
            expect(wave.activeInitials.has('a')).toBe(true);
        });
    });

    describe('getEnemy', () => {
        it('should return enemy by ID', () => {
            const enemy = new MockEnemy(1, 'test') as any as Enemy;
            wave.addEnemy(enemy);
            expect(wave.getEnemy(1)).toBe(enemy);
        });

        it('should return undefined for non-existent ID', () => {
            expect(wave.getEnemy(999)).toBeUndefined();
        });
    });

    describe('getAllEnemies', () => {
        it('should return map of all enemies', () => {
            const enemy1 = new MockEnemy(1, 'apple') as any as Enemy;
            const enemy2 = new MockEnemy(2, 'banana') as any as Enemy;
            wave.addEnemy(enemy1);
            wave.addEnemy(enemy2);
            const enemies = wave.getAllEnemies();
            expect(enemies.size).toBe(2);
            expect(enemies.get(1)).toBe(enemy1);
            expect(enemies.get(2)).toBe(enemy2);
        });
    });

    describe('getCount', () => {
        it('should return number of enemies', () => {
            const enemy1 = new MockEnemy(1, 'apple') as any as Enemy;
            const enemy2 = new MockEnemy(2, 'banana') as any as Enemy;
            wave.addEnemy(enemy1);
            wave.addEnemy(enemy2);
            expect(wave.getCount()).toBe(2);
        });
    });

    describe('clear', () => {
        it('should remove all enemies', () => {
            const enemy1 = new MockEnemy(1, 'apple') as any as Enemy;
            const enemy2 = new MockEnemy(2, 'banana') as any as Enemy;
            wave.addEnemy(enemy1);
            wave.addEnemy(enemy2);
            wave.clear();
            expect(wave.getCount()).toBe(0);
        });

        it('should clear active initials', () => {
            const enemy = new MockEnemy(1, 'test') as any as Enemy;
            wave.addEnemy(enemy);
            wave.clear();
            expect(wave.activeInitials.size).toBe(0);
        });
    });

    describe('getEnemyIds', () => {
        it('should return array of enemy IDs', () => {
            const enemy1 = new MockEnemy(1, 'apple') as any as Enemy;
            const enemy2 = new MockEnemy(2, 'banana') as any as Enemy;
            wave.addEnemy(enemy1);
            wave.addEnemy(enemy2);
            const ids = wave.getEnemyIds();
            expect(ids).toContain(1);
            expect(ids).toContain(2);
            expect(ids.length).toBe(2);
        });

        it('should return empty array for empty wave', () => {
            expect(wave.getEnemyIds()).toEqual([]);
        });
    });

    describe('forEachEnemy', () => {
        it('should iterate through all enemies', () => {
            const enemy1 = new MockEnemy(1, 'apple') as any as Enemy;
            const enemy2 = new MockEnemy(2, 'banana') as any as Enemy;
            wave.addEnemy(enemy1);
            wave.addEnemy(enemy2);
            
            const visited: number[] = [];
            wave.forEachEnemy((enemy, id) => {
                visited.push(id);
            });
            
            expect(visited).toContain(1);
            expect(visited).toContain(2);
            expect(visited.length).toBe(2);
        });
    });

    describe('effects management', () => {
        it('should add effect to wave', () => {
            const effect = new MockEffect(1) as any as Effect;
            wave.addEffect(effect);
            expect(wave.getEffect(1)).toBe(effect);
        });

        it('should remove effect from wave', () => {
            const effect = new MockEffect(1) as any as Effect;
            wave.addEffect(effect);
            wave.removeEffect(1);
            expect(wave.getEffect(1)).toBeUndefined();
        });

        it('should iterate through all effects', () => {
            const effect1 = new MockEffect(1) as any as Effect;
            const effect2 = new MockEffect(2) as any as Effect;
            wave.addEffect(effect1);
            wave.addEffect(effect2);
            
            const visited: number[] = [];
            wave.forEachEffect((effect, id) => {
                visited.push(id);
            });
            
            expect(visited).toContain(1);
            expect(visited).toContain(2);
            expect(visited.length).toBe(2);
        });
    });

    describe('activeInitials', () => {
        it('should return set of active initial letters', () => {
            const enemy1 = new MockEnemy(1, 'apple') as any as Enemy;
            const enemy2 = new MockEnemy(2, 'banana') as any as Enemy;
            wave.addEnemy(enemy1);
            wave.addEnemy(enemy2);
            const initials = wave.activeInitials;
            expect(initials.has('a')).toBe(true);
            expect(initials.has('b')).toBe(true);
            expect(initials.size).toBe(2);
        });
    });
});
