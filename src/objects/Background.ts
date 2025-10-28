import Konva from "konva";
import Object from "./Object";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../constants";

class Background extends Object {
  constructor(image: Konva.Group) {
    // Ensure the group itself reports stage-sized dimensions
    image.width(STAGE_WIDTH);
    image.height(STAGE_HEIGHT);

    // Ensure there is a Rect that fills the stage
    let rect = image.findOne<Konva.Rect>("Rect");
    if (!rect) {
      rect = new Konva.Rect({ x: 0, y: 0 });
      image.add(rect);
    }
    rect.width(STAGE_WIDTH);
    rect.height(STAGE_HEIGHT);

    // Now call the base constructor (which centers via offset)
    super(image);

    // Place the background so it fills the stage with your center-offset logic
    this.x = STAGE_WIDTH / 2;
    this.y = STAGE_HEIGHT / 2;
  }
}

export default Background;