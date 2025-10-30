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


    private static typeToImage(type: string): Konva.Group {
        const enemyGroup = new Konva.Group({ width: 80, height: 80 });

        if (type === "circle") {
            const circle = new Konva.Circle({
            x: 0, y: 0, radius: 40,
            fill: "#2aa1ff", stroke: "#0b5ea8", strokeWidth: 4,
            });
            enemyGroup.add(circle);
            return enemyGroup;
        }

        if (type === "ufo") {
            const animations = {
            idle: [
              0, 0, 480, 220,    
              480, 0, 480, 220,     
              960, 0, 480, 220,   
              1440, 0, 480, 220,    
              1920, 0, 480, 220,
            ],};
            const imageObj = new Image();
            imageObj.src = "/ufo.png";
            imageObj.onload = function() {
            const scale = Math.min(80 / 480, 80 / 220);
            const ufo = new Konva.Sprite({
              x: -35,
              y: 0,
              scale: { x: scale, y: scale},
              offset: { x: (220 * scale) / 2, y: (480 * scale) / 2},
              image: imageObj,
              animation: 'idle',
              animations: animations,
              frameRate: 15,
              frameIndex: Math.round(Math.random() * 5)
            });
            ufo.start();
            enemyGroup.add(ufo);
            enemyGroup.getLayer()?.batchDraw?.();
           }
            return enemyGroup;

        }
        if (type === "meteor") {
            const animations = {
            idle: [
              0, 0, 480, 480,    
              480, 0, 480, 480,     
              960, 0, 480, 480,   
              1440, 0, 480, 480,    
              1920, 0, 480, 480,
              2400, 0, 480, 480,
              3360, 0, 480, 480,
              3840, 0, 480, 480,
              4320, 0, 480, 480,
              4800, 0, 480, 480,
              5280, 0, 480, 480,
              5760, 0, 480, 480,
              6240, 0, 480, 480,
              6720, 0, 480, 480,
              7200, 0, 480, 480,
              7680, 0, 480, 480,
              8160, 0, 480, 480,
              8640, 0, 480, 480,
              9120, 0, 480, 480, 
            ],};
            const imageObj = new Image();
            imageObj.src = "/meteor.png";
            imageObj.onload = function() {
            const scale = Math.min(80 / 480, 80 / 220);
            const ufo = new Konva.Sprite({
              x: -35,
              y: 0,
              scale: { x: scale, y: scale},
              offset: { x: (220 * scale) / 2, y: (480 * scale) / 2},
              image: imageObj,
              animation: 'idle',
              animations: animations,
              frameRate: 15,
              frameIndex: Math.round(Math.random() * 20)
            });
            ufo.start();
            enemyGroup.add(ufo);
            enemyGroup.getLayer()?.batchDraw?.();
           }
            return enemyGroup;

        }

        // default empty group (still 80×80)
        return enemyGroup;
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
