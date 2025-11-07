import Enemy from "../Enemy";
import Konva from "konva";

class Ufo extends Enemy {
    constructor(
        word: string[],
        distance: number = 40, // spawn far by default
        speed: number = 6,      // default speed
        x: number = 0,
        y: number = 0
    ){
        const animations = {
            idle: [
                0, 0, 480, 220,    
                480, 0, 480, 220,     
                960, 0, 480, 220,   
                1440, 0, 480, 220,    
                1920, 0, 480, 220,
            ]
        };
        const enemyGroup = new Konva.Group({ width: 80, height: 80 });
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
        super("ufo", word, enemyGroup, distance, speed, x, y);
    }
}

export default Ufo;