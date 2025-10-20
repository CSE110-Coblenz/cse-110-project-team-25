import type { Group } from "konva/lib/Group";
import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH } from "./constants";

export interface View {
	getGroup(): Group;
	show(): void;
	hide(): void;
}

/**
 * Screen types for navigation
 *
 * - "menu": Main menu screen
 * - "game": Gameplay screen
 * - "result": Results screen with final score
 *   - score: Final score to display on results screen
 */
export type Screen =
	| { type: "menu" }
	| { type: "game" };

export abstract class ScreenController {
	abstract getView(): View;

	show(): void {
		this.getView().show();
	}

	hide(): void {
		this.getView().hide();
	}
}

export interface ScreenSwitcher {
	switchToScreen(screen: Screen): void;
}

/**
 * Object classes
 *		all the classes below are inteneded for rendering on the screen (ie backgrounds, enemies, ui etc)
 *
 *
 */

let ID = 0;
class Object {
	_Id: number;
	_rank: number;
	_rotation: number;
	_scale: number;
	_x: number;
	_y: number;
	_image: Konva.Group;

	constructor(image: Konva.Group, rank: number = 1, x: number = STAGE_WIDTH / 2, y: number = STAGE_HEIGHT / 2) {
		this._Id = ID++;
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

	get Id(): number {
		return this._Id;
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
