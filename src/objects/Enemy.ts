import Object from "./Object";
import Konva from "konva";
import Prompt from "./Prompt"
import { STAGE_WIDTH, STAGE_HEIGHT } from "../constants.ts";

class Enemy extends Object {
    private _distance: number;   // "z" (units from camera)
    private _speed: number;      // units/sec toward the player
    private _prompt: Prompt;
    private readonly UFO_PROMPT_OFFSET = 40;
    private readonly METEOR_PROMPT_OFFSET = 65;
    private readonly DEAULT_PROMPT_OFFSET = 100;
    private _type: string;
    private _health: number;
    _word: string;
    _maxHealth: number = 100;
    _healthBar: Konva.Rect;
    _healthBarFill: Konva.Rect;
    _healthBarWidth: number = 50;
    _healthBarHeight: number = 6;
    private static seq = 1;

    // Projection constants (tweak to taste)
    private readonly SCALE_K = 60;               // scale ≈ SCALE_K / z
    private readonly DROP_K = 900;               // vertical drop ≈ DROP_K / z
    private readonly UNITS_X = 120;                // world X units → px at z reference
    private readonly HORIZON_Y = STAGE_HEIGHT * 0.35;
    private readonly NEAR_CLIP = 1.0;               // safety clamp

    constructor(
        type: string,
        word: string,
        image: Konva.Group,
        distance: number = 40, // spawn far by default
        speed: number = 6,      // default speed
        x: number = 0,
        y: number = 0,
        health: number = 1
    ) {
        super(image, 0, x, y);
        this._type = type;
        this._word = word;
        this._prompt = new Prompt(word);
        this._distance = distance;
        this._speed = speed;
        this._id = Enemy.seq++;
        this._health = health;
        this._healthBar = new Konva.Rect({
            width: this._healthBarWidth,
            height: this._healthBarHeight,
            fill: 'grey',
        });
        this._healthBarFill = new Konva.Rect({
            width: this._healthBarWidth,
            height: this._healthBarHeight,
            fill: 'green',
        });
    }

    get distance(): number { return this._distance; }
    set distance(value: number) { this._distance = value; }

    get speed(): number { return this._speed; }
    set speed(value: number) { this._speed = value; }

    get health(): number { return this._health; }
    set health(value: number) { value > this.maxHealth ? this._health = this._maxHealth : this._health = value; }

    get maxHealth(): number { return this._maxHealth; }
    set maxHealth(value: number) { this._maxHealth = value; }


    get prompt(): Prompt { return this._prompt; }
    set prompt(value: Prompt) { this._prompt = value; }

    get healthBar(): Konva.Rect { return this._healthBar; }
    set healthBar(value: Konva.Rect) { this._healthBar = value; }

    get healthBarFill(): Konva.Rect { return this._healthBarFill; }
    set healthBarFill(value: Konva.Rect) { this._healthBarFill = value; }

    healthBarUpdate(): void {
        const ratio = this._health / this._maxHealth;
        this._healthBarFill.width(this._healthBarWidth * ratio);
    }

    get word(): string { return this._prompt.word; }
    set word(word: string) {
        this._prompt.word = word
        this._word = word;
    }

    get initial(): string { console.log("this:", this.prompt.word); return this._prompt.word[0] }

    get type(): string { return this._type }


    pause(): void {
        var graphic: Konva.Sprite | undefined = this.image.findOne('Sprite');
        if (graphic) {
            graphic.stop()
        }
    }

    unpause(): void {
        var graphic: Konva.Sprite | undefined = this.image.findOne('Sprite');
        if (graphic) {
            graphic.start()
        }
    }

    destroy(): void {
        this.image.destroy();
    }

    updateTransform(dt: number): void {
        //scale
        let s = this.SCALE_K * this.scale / this.distance;
        let timeLeft = this.distance / this.speed;
        let xDist = STAGE_WIDTH / 2 - this.x;
        let yDist = STAGE_HEIGHT / 2 - this.y;
        this.x += (xDist * dt * s * 2) / (timeLeft * this.distance);
        this.y += (yDist * dt * s * 2) / (timeLeft * this.distance);

        this.image.scale({ x: s, y: s });

        this.placePrompt();
    }

    placePrompt(): void {
        let En = this;
        let s = this.image.scaleX();
        En.prompt.restNode.x(En.prompt.typedNode.width());
        const width = En.prompt.typedNode.width() + En.prompt.restNode.width();
        const height = Math.max(En.prompt.typedNode.height(), En.prompt.restNode.height());
        const g = En.prompt.image;
        g.width(width); g.height(height);
        g.offsetX(width / 2); g.offsetY(height / 2);

        En.prompt.x = En.x;
        if (En.type === "ufo") {
            En.prompt.y = En.y + this.UFO_PROMPT_OFFSET * s;
        }
        else if (En.type === "meteor") {
            En.prompt.y = En.y + this.METEOR_PROMPT_OFFSET * s;
        }
        else {
            En.prompt.y = En.y + this.DEAULT_PROMPT_OFFSET * s;
        }

        g.scale({ x: s, y: s });

        En.healthBar.x(En.x - (En.healthBar.width() * s) / 2);
        En.healthBar.y(En.y - 20 * s);
        En.healthBar.scale({ x: s, y: s });

        En.healthBarUpdate();
        En.healthBarFill.x(En.healthBar.x());
        En.healthBarFill.y(En.y - 20 * s);
        En.healthBarFill.scale({ x: s * 50, y: s });
    }
}

export default Enemy;
