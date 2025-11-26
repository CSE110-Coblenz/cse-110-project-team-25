import Enemy from "../Enemy";
import Konva from "konva";
import Circle from "./Circle";
import type LevelManager from "../../Level/LevelManager";

class Shooter extends Enemy {
    private _manager: LevelManager;
    private _bullet_speed: number;
    private _timer: number;

    private spawnRate = 3;   

    constructor(
        word: string,
        distance: number = 40, // spawn far by default
        speed: number = 6,      // default speed
        manager: LevelManager,
        x: number = 0,
        y: number = 0,
        health: number = 1,
    ) {
        const enemyGroup = new Konva.Group({ width: 160, height: 160 });
        const circle = new Konva.Circle({
            x: 0, y: 0, radius: 40,
            fill: "#ffc32aff", stroke: "#5a470dff", strokeWidth: 4,
        });
        enemyGroup.add(circle);
        super("shooter", word, enemyGroup, distance, 0, x, y, health);
        this._manager = manager;
        this._bullet_speed = speed;
        this._timer = this.spawnRate;
    }

    override updateTransform(dt: number): void {
        this._timer -= dt;

        if(this._timer <= 0){
            this._timer = this.spawnRate;
            this._manager.spawnAdditionalEnemy(new Circle(this._manager.getWord(), this.distance,this._bullet_speed, this.x, this.y + (this.scale * 40)));
        }

        this.placePrompt();
    }

}

export default Shooter;