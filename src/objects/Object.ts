import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../constants";

let ID = 0;
class Object {
  _id: number;
  _rank: number;
  _rotation: number;
  _scale: number;
  _x: number;
  _y: number;
  _image: Konva.Group;

  constructor(
    image: Konva.Group,
    rank: number = 1,
    x: number = STAGE_WIDTH / 2,
    y: number = STAGE_HEIGHT / 2
  ) {
    this._id = ID++;
    this._rank = rank;
    this._rotation = 0;
    this._scale = 1;
    this._x = x;
    this._y = y;
    this._image = image;
    

    // Center origin based on the group's visual content, not width()/height()
    this.recenterOriginToContent();

    // Place at initial position
    this._image.x(this._x);
    this._image.y(this._y);
  }

  /** Recompute offset so the group's origin is its visual center. */
  recenterOriginToContent(): void {
    // Measure children without current transforms
    const rect = this._image.getClientRect({ skipTransform: true });
    // If children start at negative coords, include rect.x/y in the offset
    this._image.offsetX(rect.x + rect.width / 2);
    this._image.offsetY(rect.y + rect.height / 2);
  }

  // --- getters/setters unchanged below ---
  get id(): number { return this._id; }

  get rank(): number { return this._rank; }
  set rank(value: number) { this._rank = value; }

  get rotation() { return this._rotation; }
  set rotation(value: number) {
    this._rotation = value;
    this._image.rotation(this._rotation);
  }

  get scale() { return this._scale; }
  set scale(value: number) {
    this._scale = value;
    // this._image.scaleX(value);
    // this._image.scaleY(value);
  }

  get x() { return this._x; }
  set x(value: number) { this._x = value; this._image.x(value); }

  get y() { return this._y; }
  set y(value: number) { this._y = value; this._image.y(value); }

  get image() { return this._image; }
  set image(value: Konva.Group) { this._image = value; }
}

export default Object;
