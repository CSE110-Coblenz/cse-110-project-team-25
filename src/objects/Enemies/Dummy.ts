import Enemy from "../Enemy";
import Konva from "konva";

class Dummy extends Enemy {
    constructor(
        word: string,
        distance: number = 40, // spawn far by default
        x: number = 0,
        y: number = 0,
        health: number = 1,
    ) {
        const enemyGroup = new Konva.Group({ width: 80, height: 80 });
        const animations = {
            off: [
              480, 0, 480, 480
            ],
            green: [
              0, 0, 480, 480
            ],
            red: [
              960, 0, 480, 480
            ]
        };

        const imageObj = new Image();
        imageObj.src = "./dummy.png";
        imageObj.onload = function() {
            const scale = Math.min(80 / 480, 80 / 220);
            const meteor = new Konva.Sprite({
                x: -35,
                y: 0,
                scale: { x: scale, y: scale},
                offset: { x: (220 * scale) / 2, y: (480 * scale) / 2},
                image: imageObj,
                animation: 'green',
                animations: animations,
                frameRate: 15,
                frameIndex: Math.round(Math.random() * 20)
            });
            meteor.start();
            enemyGroup.add(meteor);
            enemyGroup.getLayer()?.batchDraw?.();
        }
        
        super("dummy", word, enemyGroup, distance, 0, x, y, health);

    }
}

export default Dummy;