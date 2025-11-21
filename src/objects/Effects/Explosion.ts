import Konva from "konva";
import Effect from "../Effect";


class Explosion extends Effect {

    constructor(x: number, y: number, scale: number, width:number = 80, height:number = 80){
        const effectGroup = new Konva.Group({ width: 80, height: 80 });
        const frameRate = 15;
        const animations = {
            idle: [
                0, 0, 480, 480,    
                480, 0, 480, 480,     
                960, 0, 480, 480,   
                1440, 0, 480, 480,    
                1920, 0, 480, 480,
            ]
        };

        const baseObj = new Image();
        baseObj.src = "./explosion_base.png";
        baseObj.onload = function() {
            const scale = Math.min(80 / 480, 80 / 220);
            const explosion_base = new Konva.Sprite({
                x: 0,
                y: 0,
                scale: { x: scale, y: scale},
                offset: { x: 0, y: 0},
                image: baseObj,
                animation: 'idle',
                animations: animations,
                frameRate: frameRate,
                frameIndex: 0
            });
            explosion_base.start();
            effectGroup.add(explosion_base);
            effectGroup.getLayer()?.batchDraw?.();
        }

        const glowObj = new Image();
        glowObj.src = "./explosion_emission.png";
        glowObj.onload = function() {
            const scale = Math.min(80 / 480, 80 / 220);
            const explosion_glow = new Konva.Sprite({
                x: 0,
                y: 0,
                scale: { x: scale, y: scale},
                offset: { x: 0, y: 0},
                image: glowObj,
                animation: 'idle',
                animations: animations,
                frameRate: frameRate,
                frameIndex: 0,
                globalCompositeOperation: 'lighter',
            });
            explosion_glow.start();
            effectGroup.add(explosion_glow);
            effectGroup.getLayer()?.batchDraw?.();
        }

        super(effectGroup, 5/frameRate, x - ((scale *2* height) / 2), y - ((scale * height) / 2), scale*2);
        //+ (Math.random()*width - width/2)*scale
    }

}

export default Explosion;