import Konva from "konva";
import Effect from "../Effect";


class Explosion extends Effect {

    constructor(x: number, y: number, scale: number, width:number = 80, height:number = 80){
        const effectGroup = new Konva.Group({ width: 80, height: 80 });
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
        imageObj.src = "/explosion.png";
        imageObj.onload = function() {
            const scale = Math.min(80 / 480, 80 / 220);
            const explosion = new Konva.Sprite({
                x: 0,
                y: 0,
                scale: { x: scale, y: scale},
                offset: { x: 0, y: 0},
                image: imageObj,
                animation: 'idle',
                animations: animations,
                frameRate: 15,
                frameIndex: 0
            });
            explosion.start();
            effectGroup.add(explosion);
            effectGroup.getLayer()?.batchDraw?.();
        }

        super(effectGroup, 5/15, x - ((scale *2* height) / 2), y - ((scale * height) / 2), scale*2);
        //+ (Math.random()*width - width/2)*scale
    }

}

export default Explosion;