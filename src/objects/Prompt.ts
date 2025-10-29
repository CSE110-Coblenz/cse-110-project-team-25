import Ui from "./Ui";
import Konva from "konva";

class Prompt extends Ui {
    _word: string;
    _typedNode: Konva.Text;
    _restNode: Konva.Text;

  
  constructor(word: string) {

    const typedNode = new Konva.Text({
          x: 0, y: 0, text: "", fontSize: 28, fontFamily: "Courier New", fill: "#12d44e", listening: false,
        });
    const restNode = new Konva.Text({
        x: 0, y: 0, text: word, fontSize: 28, fontFamily: "Courier New", fill: "#ffffff", listening: false,
    });
    const promptGroup = new Konva.Group();
    promptGroup.add(typedNode);
    promptGroup.add(restNode);

    super(promptGroup, false);

    this._typedNode = typedNode;
    this._restNode = restNode;
    this._word = word;
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
}

export default Prompt;
