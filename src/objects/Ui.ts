import Konva from "konva";
import Object from "./Object";


class Ui extends Object {

    _isClickable: boolean;

    constructor(image: Konva.Group, isClickable: boolean = false){
        super(image);
        this._isClickable = isClickable;
    }

    get isClickable(): boolean {
        return this._isClickable;
    }

    set isClickable(value: boolean){
        this._isClickable = value;
    }
}

export default Ui;