import Ui from "./Ui";
import Konva from "konva";

class Prompt extends Ui {
  _word: string;
  _typedNode: Konva.Text;
  _restNode: Konva.Text;
  _background: Konva.Rect
  
  constructor(word: string) {

    const typedNode = new Konva.Text({
          x: 0, y: 0, text: "", fontSize: 28, fontFamily: "Courier New", fill: "#12d44e", listening: false,
        });
    const restNode = new Konva.Text({
        x: 0, y: 0, text: word, fontSize: 28, fontFamily: "Courier New", fill: "#ffffff", listening: false,
    });

    // Padding inside the background so text doesn't touch the rect edges
    const padding = 1;

    const background = new Konva.Rect({
      x: -padding,
      y: 0,
      width: typedNode.width() + restNode.width() + padding * 2,
      height: Math.max(typedNode.height(), restNode.height()) + padding * 2,
      fill: 'grey',
      cornerRadius: 5,
      listening: false,
      opacity: 0.4
    });

    const promptGroup = new Konva.Group();
    promptGroup.add(background);
    promptGroup.add(typedNode);
    promptGroup.add(restNode);

    super(promptGroup, false);

    this._typedNode = typedNode;
    this._restNode = restNode;
    this._word = word;
    this._background = background;
  }

  get typedNode(): Konva.Text {
    return this._typedNode;
  }

  get restNode(): Konva.Text {
    return this._restNode;
  }

  get word(): string {
    return this._word;
  }

  get background(): Konva.Rect {
    return this._background;
  }
}

export default Prompt;
