import Ui from "./Ui";
import Konva from "konva";

class Prompt extends Ui {

    _text: Konva.Text;

    constructor(image: Konva.Group, text: Konva.Text, isClickable: boolean = false){
        
        if (isClickable === null) {
            isClickable = false;
        }

        isClickable ? super(image, true) : super(image);
        
        this._text = text;
    }

}

export default Prompt; 