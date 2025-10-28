class GameLogicModel {
    private score: number;
    private level: number;
    private lives: number;
    private enemyList: dict<string, Enemy>;

    constructor() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
    }

    constructor(initialScore: number, initialLevel: number, initialLives: number) {
        this.score = initialScore;
        this.level = initialLevel;
        this.lives = initialLives;
    }

    getScore(): number {
        return this.score;
    }

    setScore(newScore: number): void {
        this.score = newScore;
    }

    getLevel(): number {
        return this.level;
    }

    setLevel(newLevel: number): void {
        this.level = newLevel;
    }

    getLives(): number {
        return this.lives;
    }

    setLives(newLives: number): void {
        this.lives = newLives;
    }
}
