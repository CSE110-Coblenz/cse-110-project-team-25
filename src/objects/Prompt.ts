import Ui from "./Ui";
import Konva from "konva";

class Prompt extends Ui {
  _text: Konva.Text;

  constructor(image: Konva.Group, text: Konva.Text, isClickable: boolean = false) {
    super(image, !!isClickable);
    this._text = text;
  }

  get textNode(): Konva.Text {
    return this._text;
  }
}

export default Prompt;
