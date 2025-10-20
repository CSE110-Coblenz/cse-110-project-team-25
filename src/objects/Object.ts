import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../constants";

let ID = 0;
class Object{
    
	_id: number;
	_rank: number; 
	_rotation: number;
	_scale: number;
	_x: number;
	_y: number;
	_image: Konva.Group;	

	constructor(image: Konva.Group, rank: number = 1, x: number = STAGE_WIDTH / 2, y: number = STAGE_HEIGHT / 2) {
		this._id = ID++;
		this._rank = rank;
		this._rotation = 0;
		this._scale = 1;
		this._x = x;
		this._y = y;
		this._image = image;

		//this is to make x, y correspond to the center of the image instead of having the top left corner as the origin
		this._image.offsetX(this._image.width() / 2)
		this._image.offsetY(this._image.height() / 2)
	}

	get id(): number {
		return this._id;
	}

	get rank(): number {
		return this._rank;
	}
	set rank(value: number){
		this._rank = value;
	}

	get rotation(){
		return this._rotation;
	}
	set rotation(value: number){
		this._rotation = value;
		this._image.rotation(this._rotation);
	}

	get scale(){
		return this._scale;
	}
	set scale(value: number){
		this._scale = value;
		this._image.scaleX(value);
		this._image.scaleY(value);
	}

	get x(){
		return this._x;
	}
	set x(value:number){
		this._x = value;
		this._image.x(value);
	}

	get y(){
		return this._y;
	}
	set y(value:number){
		this._y = value;
		this._image.y(value);
	}

	get image(){
		return this._image;
	}
	set image(value: Konva.Group){
		this._image = value;
	}
}

export default Object;