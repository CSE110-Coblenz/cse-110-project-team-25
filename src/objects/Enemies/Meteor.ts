import Enemy from "../Enemy";
import Konva from "konva";

class Meteor extends Enemy {
    constructor(
        word: string[],
        distance: number = 40, // spawn far by default
        speed: number = 6,      // default speed
        x: number = 0,
        y: number = 0
    ) {
        const enemyGroup = new Konva.Group({ width: 80, height: 80 });
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
            ]
        };

        const imageObj = new Image();
        imageObj.src = "/meteor.png";
        imageObj.onload = function() {
            const scale = Math.min(80 / 480, 80 / 220);
            const meteor = new Konva.Sprite({
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
            meteor.start();
            enemyGroup.add(meteor);
            enemyGroup.getLayer()?.batchDraw?.();
        }
        
        super("meteor", word, enemyGroup, distance, speed, x, y);

    }
}

export default Meteor;