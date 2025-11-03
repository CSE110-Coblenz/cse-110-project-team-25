export class Money {
    private static _instance: Money | null = null;
    private _amount: number;

    private constructor() {
        this._amount = 0;
    }

    //Money singleton method
    public static getInstance(): Money {
        if (!Money._instance) {
            Money._instance = new Money();
        }
        return Money._instance;
    }

    public get amount(): number {
        return this._amount;
    }

    public set amount(value: number) {
        this._amount = Math.max(0, value);
    }

    public add(value: number): void {
        this._amount += value;
    }

    public subtract(value: number): void {
        this._amount = Math.max(0, this._amount - value);
    }

    public calculateReward(wordLength: number, speed: number): number {
        return Math.floor((wordLength * 10) * (speed / 6));
    }

    public reset(): void {
        this._amount = 0;
    }
}
