export class Health {
    private static _instance: Health | null = null;
    private _lives: number;
    private _maxLives: number = 3;

    private constructor() {
        this._lives = 3;
    }

    //Health singleton method
    public static getInstance(): Health {
        if (!Health._instance) {
            Health._instance = new Health();
        }
        return Health._instance;
    }

    public get lives(): number {
        return this._lives;
    }   

    public get maxLives(): number {
        return this._maxLives;
    }

    public set lives(value: number) {
        this._lives = Math.max(0, value);
    }

    public loseLife(): void {
        this._lives = Math.max(0, this._lives - 1);
    }

    public gainLife(): void {
        this._lives = Math.min(this._maxLives, this._lives + 1);
    }   

    public reset(): void {
        this._lives = this._maxLives;
    }
}