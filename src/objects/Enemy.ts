import Object from "./Object";
import Konva from "konva";

class Enemy extends Object {

    _distance: number;
    _health: number;
    _scoreValue: number;
    _prompt: string;

    constructor(image: Konva.Group, prompt: string = "", health: number = 1, distance: number = 0, scoreValue: number = 0){
        
        super(image);
        this._prompt = prompt;
        this._health = health;
        this._distance = distance;
        this._scoreValue = scoreValue;
    }

    get distance(): number {
        return this.distance;
    }

    set distance(value: number){
        this._distance = value;
    }

    get health(): number {
        return this._health;
    }

    set health(value: number){
        this._health = value;
    }

    get scoreValue(): number {
        return this._scoreValue;
    }
    
    set scoreValue(value: number){
        this._scoreValue = value;
    }
    
    get prompt(): string {
        return this._prompt;
    }

    set prompt(value: string){
        this._prompt = value;
    }
}

export default Enemy;