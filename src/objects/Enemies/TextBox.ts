import { STAGE_WIDTH } from "../../constants";
import Enemy from "../Enemy";
import Konva from "konva";

class TextBox extends Enemy {
    private _prog: number;
    private _timer: number;
    private _textNode: Konva.Text;
    private _text: string[];
    private _chars: number;
    private _rect: Konva.Rect;
    private readonly TEXTSPEED: number = 30;
    constructor(
        text: string[]
    ) {
        //variable setup
        const enemyGroup = new Konva.Group({ width: 80, height: 80 });
        super("textbox", "", enemyGroup, 100, 0, 0, 0, text.length);
        this._prog = 0;
        this._timer = 0;
        this._chars = 0;
        this._text = text;
        const padding = 20

        //konva display setup
        this._textNode = new Konva.Text({
            x: padding,
            y: 60,
            text: text[this._prog][this._chars],
            fontSize: 36,
            fontFamily: 'Courier New',
            fill: '#555',
            width: STAGE_WIDTH - padding * 2,
            padding: padding,
            align: 'left'
        });

        this._rect = new Konva.Rect({
            x: padding,
            y: 60,
            stroke: '#555',
            strokeWidth: 5,
            fill: '#ddd',
            width: STAGE_WIDTH - padding * 2,
            height: this._textNode.height(),
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffsetX: 10,
            shadowOffsetY: 10,
            shadowOpacity: 0.2,
            cornerRadius: 10
        });

        enemyGroup.add(this._rect);
        enemyGroup.add(this._textNode);
    }

    override updateTransform(dt: number): void {
        this._timer += dt;
        this._chars = Math.round(this._timer * this.TEXTSPEED);
        this._textNode.text(this._text[this._prog].slice(0, this._chars));
        this._rect.height(this._textNode.height());
    }
}

export default TextBox;