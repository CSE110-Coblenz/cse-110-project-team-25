import Object from "./Object";
import Konva from "konva";
import Prompt from "./Prompt"

class Enemy extends Object {
  _distance: number;   // "z" (units from camera)
  _speed: number;      // units/sec toward the player
  _health: number;
  _scoreValue: number;
  _prompt: Prompt;
  _id: number;
  _type: string;
  private static seq = 1;

    private static typeToImage(type: string): Konva.Group{
        if(type === "circle"){
            let enemyGroup = new Konva.Group({ width: 80, height: 80 });
            let circle = new Konva.Circle({
                x: 0, y: 0, radius: 40, fill: "#2aa1ff", stroke: "#0b5ea8", strokeWidth: 4,
                });
            enemyGroup.add(circle);
            return enemyGroup;
        }
        return new Konva.Group({ width: 80, height: 80 });
    }

  constructor(
    type: string,
    word: string,
    health: number = 1,
    distance: number = 40, // spawn far by default
    scoreValue: number = 0,
    speed: number = 6      // default speed
  ) {
    let image = Enemy.typeToImage(type);
    super(image);
    this._type = type;
    this._prompt = new Prompt(word);
    this._health = health;
    this._distance = distance;
    this._scoreValue = scoreValue;
    this._speed = speed;
    this._id = Enemy.seq++;
  }

  get distance(): number { return this._distance; }
  set distance(value: number) { this._distance = value; }

  get speed(): number { return this._speed; }
  set speed(value: number) { this._speed = value; }

  get health(): number { return this._health; }
  set health(value: number) { this._health = value; }

  get scoreValue(): number { return this._scoreValue; }
  set scoreValue(value: number) { this._scoreValue = value; }

  get prompt(): Prompt { return this._prompt; }
  set prompt(value: Prompt){ this._prompt = value; }

  get word(): string { return this._prompt.word; }

  get initial(): string {return this._prompt.word[0]}
  
  get type(): string { return this._type}

  destroy(): void { this.image.destroy(); }
}

export default Enemy;
