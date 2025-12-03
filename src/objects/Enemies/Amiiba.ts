import Enemy from "../Enemy";
import Konva from "konva";
import Circle from "./Circle";
import Meteor from "./Meteor";
import type LevelManager from "../../Level/LevelManager";

class Amiiba extends Enemy {
    private _split: number;
    private _manager: LevelManager;
    constructor(
        word: string,
        distance: number = 40, // spawn far by default
        speed: number = 6,      // default speed
        manager: LevelManager,
        x: number = 0,
        y: number = 0,
        split: number = 3,
        health: number = 1,
    ) {
        const enemyGroup = new Konva.Group({ width: 160, height: 160 });
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
              9600, 0, 480, 480, 
              10080, 0, 480, 480, 
              10560, 0, 480, 480, 
              11040, 0, 480, 480, 
              11520, 0, 480, 480, 
              12000, 0, 480, 480, 
              12480, 0, 480, 480, 
              12960, 0, 480, 480, 
              13440, 0, 480, 480, 
              13920, 0, 480, 480,  
            ]
        };
        const imageObj = new Image();
        imageObj.src = "/amiiba.png";
        imageObj.onload = function() {
            const scale = Math.min(80 / 480, 80 / 220);
            const meteor = new Konva.Sprite({
                x: -40,
                y: 0,
                scale: { x: scale, y: scale},
                offset: { x: (220 * scale) / 2, y: (480 * scale) / 2},
                image: imageObj,
                animation: 'idle',
                animations: animations,
                frameRate: 15,
                frameIndex: Math.round(Math.random() * 20)
            });
            meteor.start();
            enemyGroup.add(meteor);
            enemyGroup.getLayer()?.batchDraw?.();
        }
        super("amiiba", word, enemyGroup, distance, speed, x, y, health);
        this._manager = manager;
        this._split = split;
        if(split == 2) this.scale = 0.5;
        if(split == 1) this.scale = 0.25;
    }
    override destroy(): void {
        let length = Math.round(this.word.length / 2);
        if(this._split > 1){
            this._manager.spawnAdditionalEnemy(new Amiiba(this._manager.getWord(length),
                                               this.distance,this.speed * 1.15, this._manager,
                                               this.x - (32 * this._split), this.y, this._split - 1));
            this._manager.spawnAdditionalEnemy(new Amiiba(this._manager.getWord(length),
                                               this.distance,this.speed * 1.15, this._manager,
                                               this.x + (32 * this._split), this.y, this._split - 1));

        }
        this.image.destroy();
    }

}

export default Amiiba;