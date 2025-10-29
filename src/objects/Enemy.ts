import Object from "./Object";
import Konva from "konva";

class Enemy extends Object {
  _distance: number;   // "z" (units from camera)
  _speed: number;      // units/sec toward the player
  _health: number;
  _scoreValue: number;
  _prompt: string;

  constructor(
    image: Konva.Group,
    prompt: string = "",
    health: number = 1,
    distance: number = 40, // spawn far by default
    scoreValue: number = 0,
    speed: number = 6      // default speed
  ) {
    super(image);
    this._prompt = prompt;
    this._health = health;
    this._distance = distance;
    this._scoreValue = scoreValue;
    this._speed = speed;
  }

  get distance(): number { return this._distance; }
  set distance(value: number) { this._distance = value; }

  get speed(): number { return this._speed; }
  set speed(value: number) { this._speed = value; }

  get health(): number { return this._health; }
  set health(value: number) { this._health = value; }

  get scoreValue(): number { return this._scoreValue; }
  set scoreValue(value: number) { this._scoreValue = value; }

  get prompt(): string { return this._prompt; }
  set prompt(value: string){ this._prompt = value; }

  destroy(): void { this.image.destroy(); }
}

export default Enemy;
