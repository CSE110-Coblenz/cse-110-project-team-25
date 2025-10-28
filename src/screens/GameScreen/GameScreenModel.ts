/**
 * GameScreenModel - Manages game state
 */
export class GameScreenModel {
  private score: number;
  private level: number;
  private lives: number;

  // simple one-enemy model for now
  private targetWord: string | null = null;

  constructor(initialScore = 0, initialLevel = 1, initialLives = 3) {
    this.score = initialScore;
    this.level = initialLevel;
    this.lives = initialLives;
  }

  reset(): void {
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.targetWord = null;
  }

  getScore(): number { return this.score; }
  setScore(newScore: number): void { this.score = newScore; }

  getLevel(): number { return this.level; }
  setLevel(newLevel: number): void { this.level = newLevel; }

  getLives(): number { return this.lives; }
  setLives(newLives: number): void { this.lives = newLives; }

  setTargetWord(word: string): void { this.targetWord = word; }
  getTargetWord(): string | null { return this.targetWord; }
}
