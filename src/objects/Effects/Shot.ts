import Konva from "konva";
import Effect from "../Effect";


class Shot extends Effect {
    constructor(x: number, y: number, scale: number, width:number = 80, height:number = 80){
        const effectGroup = new Konva.Group({ width: 80, height: 80 });
        const animations = {
            idle: [
                0, 0, 120, 120,    
            ]
        };

        const imageObj = new Image();
        imageObj.src = "/shot.png";
        imageObj.onload = function() {
            const scale = Math.min(80 / 480, 80 / 220);
            const shot = new Konva.Sprite({
                x: 0,
                y: 0,
                scale: { x: scale, y: scale},
                offset: { x: 0, y: 0},
                image: imageObj,
                animation: 'idle',
                animations: animations,
                frameRate: 15,
                frameIndex: 0,
                globalCompositeOperation: 'lighter',
                rotation: 0//Math.random()*360
            });
            shot.start();
            effectGroup.add(shot);
            effectGroup.getLayer()?.batchDraw?.();
        }

        super(effectGroup, 0.1, x + (Math.random()*width - width/2)*scale, y + ((scale * height) / 2) + (Math.random()*height - height/2)*scale, scale * 2);
    }

}

export default Shot;