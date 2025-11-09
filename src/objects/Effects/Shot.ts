import Konva from "konva";
import Effect from "../Effect";


class Shot extends Effect {

    constructor(x: number, y: number, scale: number, width:number = 80, height:number = 80){
        const effectGroup = new Konva.Group({ width: 80, height: 80 });
        const circle = new Konva.Circle({
            x: 0, y: 0, radius: 20,
            fill: "#fbff2aff", stroke: "#df8627ff", strokeWidth: 4,
        });
        effectGroup.add(circle);

        super(effectGroup, 0.05, x + (Math.random()*width - width/2)*scale, y + ((scale * height) / 2) + (Math.random()*height - height/2)*scale, scale / 2);
    }

}

export default Shot;