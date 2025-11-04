/**
 * GameScreenModel - Manages game state
 */
export class GameScreenModel {
  private score: number;
  private level: number;
  private lives: number;

  // multi-enemy model
  private targetWords: string[] = [];

  constructor(initialScore = 0, initialLevel = 1, initialLives = 3) {
    this.score = initialScore;
    this.level = initialLevel;
    this.lives = initialLives;
  }

  reset(): void {
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.targetWords = [];
  }

  getScore(): number { return this.score; }
  setScore(newScore: number): void { this.score = newScore; }

  getLevel(): number { return this.level; }
  setLevel(newLevel: number): void { this.level = newLevel; }

  getLives(): number { return this.lives; }
  setLives(newLives: number): void { this.lives = newLives; }

  settargetWords(word: string): void { this.targetWords.push(word); }
  getTargetWords(): string[] { return this.targetWords; }
}
