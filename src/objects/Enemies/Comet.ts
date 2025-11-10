import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants";
import LevelManager from "../../Level/LevelManager";
import Enemy from "../Enemy";
import Konva from "konva";

class Comet extends Enemy {
    private _timer;
    private _manager: LevelManager;

    constructor(
        word: string,
        x: number = 0,
        y: number = 0,
        manager: LevelManager,
        timeWindow: number = 5,
        health: number = 1,
    ) {
        const enemyGroup = new Konva.Group({ width: 80, height: 80 });
        const animations = {
            idle: [
                0, 0, 116, 480
            ]
        };

        const imageObj = new Image();
        imageObj.src = "/comet.png";
        imageObj.onload = function() {
            const scale = (80*3)/480;
            const comet = new Konva.Sprite({
                x: 40,
                y: -100,
                scale: { x: scale, y: scale},
                offset: { x: (116 * scale) / 2, y: (480 * scale) / 2},
                image: imageObj,
                animation: 'idle',
                animations: animations,
                rotation: (Math.acos(y / x) * 180) / Math.PI,
                frameRate: 1,
                frameIndex: 0
            });
            console.log(Math.acos(y / x))
            comet.start();
            enemyGroup.add(comet);
            enemyGroup.getLayer()?.batchDraw?.();
        }
        super("comet", word, enemyGroup, 40, 0, x, y, health);
        this._timer = timeWindow;
        this._manager = manager;
    }

    override updateTransform(dt: number): void {
        this._timer -= dt;
        let xDist = 0 - this.x;
        let yDist = STAGE_HEIGHT - this.y;
        let timeLeft = this._timer;

        this.x += (xDist * dt) / (timeLeft);
        this.y += (yDist * dt) / (timeLeft);

        if(this._timer <= 0){
            this._manager.removeEnemyFromWave(this.id);
            this.destroy();
        }

        this.placePrompt();
    }

}

export default Comet;