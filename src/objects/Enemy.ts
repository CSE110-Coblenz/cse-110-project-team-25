import Object from "./Object";
import Konva from "konva";
import Prompt from "./Prompt"
import { STAGE_WIDTH, STAGE_HEIGHT } from "../constants.ts";

class Enemy extends Object {
  _distance: number;   // "z" (units from camera)
  _speed: number;      // units/sec toward the player
  _prompt: Prompt;
  _words: string[];
  _id: number;
  _type: string;
  private static seq = 1;

  // Projection constants (tweak to taste)
  private readonly SCALE_K   = 60;               // scale ≈ SCALE_K / z
  private readonly DROP_K    = 900;               // vertical drop ≈ DROP_K / z
  private readonly UNITS_X   = 120;                // world X units → px at z reference
  private readonly HORIZON_Y = STAGE_HEIGHT * 0.35;
  private readonly NEAR_CLIP = 1.0;               // safety clamp

  constructor(
    type: string,
    words: string[],
    image: Konva.Group,
    distance: number = 40, // spawn far by default
    speed: number = 6,      // default speed
    x: number = 0,
    y: number = 0
  ) {
    super(image, 0, x, y);
    this._type = type;
    this._words = words;
    this._prompt = new Prompt(words.shift());
    this._distance = distance;
    this._speed = speed;
    this._id = Enemy.seq++;
  }

  get distance(): number { return this._distance; }
  set distance(value: number) { this._distance = value; }

  get speed(): number { return this._speed; }
  set speed(value: number) { this._speed = value; }

  get prompt(): Prompt { return this._prompt; }
  set prompt(value: Prompt){ this._prompt = value; }

  get word(): string { return this._prompt.word; }

  get initial(): string {return this._prompt.word[0]}
  
  get type(): string { return this._type}

  pause(): void {
    var graphic: Konva.Sprite | undefined = this.image.findOne('Sprite');
    if(graphic){
      graphic.stop()
    }
  }

  unpause(): void {
    var graphic: Konva.Sprite | undefined = this.image.findOne('Sprite');
    if(graphic){
      graphic.start()
    }
  }

  destroy(): void { this.image.destroy(); }

  updateTransform(dt: number): void {
    //scale
    let s = this.SCALE_K * this.scale / this.distance;
    let timeLeft = this.distance / this.speed;
    let xDist = STAGE_WIDTH / 2 - this.x;
    let yDist = STAGE_HEIGHT / 2 - this.y;
    this.x += (xDist * dt * s * 2) / (timeLeft * this.distance);
    this.y += (yDist * dt * s * 2) / (timeLeft * this.distance);

    this.image.scale({x: s, y: s});

    this.placePrompt();

	}

  placePrompt(): void {
    this.prompt.restNode.x(this.prompt.typedNode.width());
    const width  = this.prompt.typedNode.width() + this.prompt.restNode.width();
    const height = Math.max(this.prompt.typedNode.height(), this.prompt.restNode.height());
    const g = this.prompt.image;
    g.width(width); g.height(height);
    g.offsetX(width / 2); g.offsetY(height / 2);

    this.prompt.x = this.x;
    this.prompt.y = this.y + (g.height() * this.image.scaleX() * 2.2);
}
}

export default Enemy;
