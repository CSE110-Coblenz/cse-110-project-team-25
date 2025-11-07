import Enemy from "../Enemy";
import Konva from "konva";
import Circle from "./Circle";
import Meteor from "./Meteor";
import type LevelManager from "../../Level/LevelManager";

class Amiiba extends Enemy {
    private _split: number;
    private _manager: LevelManager;
    constructor(
        word: string[],
        distance: number = 40, // spawn far by default
        speed: number = 6,      // default speed
        manager: LevelManager,
        x: number = 0,
        y: number = 0,
        split: number = 3,
    ) {
        const enemyGroup = new Konva.Group({ width: 80, height: 80 });
        const circle = new Konva.Circle({
            x: 0, y: 0, radius: 40,
            fill: "#2aa1ff", stroke: "#0b5ea8", strokeWidth: 4,
        });
        enemyGroup.add(circle);
        super("amiiba", word, enemyGroup, distance, speed, x, y);
        this._manager = manager;
        this._split = split;
        if(split == 2) this.scale = 0.5;
        if(split == 1) this.scale = 0.25;
    }
    override destroy(): void {
        // let length = this.word[0].length;
        if(this._split > 1){
            this._manager.spawnAdditionalEnemy(new Amiiba([this._manager.getWord()], this._distance,this._speed / 2, this._manager, this._x - 0.5, this._y, this._split - 1));
            this._manager.spawnAdditionalEnemy(new Amiiba([this._manager.getWord()], this._distance,this._speed / 2, this._manager, this._x + 0.5, this._y, this._split - 1));

        }
        // this._manager.spawnAdditionalEnemy(new Circle([this._manager.getWord()], this._distance, this._speed / 2, this._x, this._y));
        // this._manager.spawnAdditionalEnemy(new Amiiba([this._manager.getWord()], this._distance,this._speed / 2, this._manager, this._x, this._y));
        this.image.destroy();
    }

}

export default Amiiba;