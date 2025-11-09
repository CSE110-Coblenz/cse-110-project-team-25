import Konva from "konva";
import Object from "./Object";


class Effect extends Object {

    private _lifeTime: number;
    private _dead: boolean

    constructor(image: Konva.Group, lifeTime: number, x: number, y: number, scale: number){
        super(image, undefined, x, y);
        this.image.scale({x: scale, y:scale});
        this._lifeTime = lifeTime;
        this._dead = false;
    }

    update(dt: number): void {
        this._lifeTime -= dt;
        if(this._lifeTime < 0){
            this.destroy();
        }
    }
    
    destroy(): void { 
        this.image.destroy();
        this._dead = true;
    }

    get dead(): boolean {return this._dead};

}

export default Effect;