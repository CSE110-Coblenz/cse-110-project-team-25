import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../constants";
import ObjectClass from "../objects/Object"; // your class named `Object`

export default class GameRenderer {
  private stage: Konva.Stage;
  private layer: Konva.Layer;
  private objects = new Map<number, ObjectClass>();
  private animation?: Konva.Animation;

  constructor(params:
    | { container: string | HTMLDivElement; width?: number; height?: number }
    | { stage: Konva.Stage; layer?: Konva.Layer }
  ) {
    if ("stage" in params) {
      this.stage = params.stage;
      this.layer = params.layer ?? new Konva.Layer();
      if (!params.layer) this.stage.add(this.layer);
    } else {
      const { container, width = STAGE_WIDTH, height = STAGE_HEIGHT } = params;
      this.stage = new Konva.Stage({ container, width, height });
      this.layer = new Konva.Layer();
      this.stage.add(this.layer);
    }
  }

  /** Add an object’s Group to the layer and track it by id. */
  add(obj: ObjectClass): void {
    if (this.objects.has(obj.id)) return;

    const group = obj.image;

    // Ensure position reflects object (constructor already does this, but it's safe)
    group.x(obj.x);
    group.y(obj.y);
    group.rotation(obj.rotation);
    group.scale({ x: obj.scale, y: obj.scale });

    this.layer.add(group);
    this.objects.set(obj.id, obj);
    this.resortByRank();
    this.layer.batchDraw();
  }

  /** Remove an object from the stage. */
  remove(objOrId: ObjectClass | number): void {
    const id = typeof objOrId === "number" ? objOrId : objOrId.id;
    const obj = this.objects.get(id);
    if (!obj) return;
    obj.image.remove(); // detaches from layer
    this.objects.delete(id);
    this.layer.batchDraw();
  }

  /** Call after you change ranks to keep z-order correct. */
  resortByRank(): void {
    // Sort by rank, then set zIndex accordingly.
    const sorted = Array.from(this.objects.values()).sort((a, b) => a.rank - b.rank);
    sorted.forEach((o, idx) => o.image.zIndex(idx));
  }

  /** Call when you programmatically changed x/y/scale/rotation and want a redraw. */
  draw(): void {
    this.layer.draw();
  }

  /** Optional: lightweight render loop (only draws each frame). */
  start(): void {
    if (this.animation) return;
    this.animation = new Konva.Animation(() => {
      // If you have per-frame logic, do it here.
      // For now we just batch draw.
      this.layer.batchDraw();
    }, this.layer);
    this.animation.start();
  }

  stop(): void {
    this.animation?.stop();
    this.animation = undefined;
  }

  getStage(): Konva.Stage {
    return this.stage;
  }

  getLayer(): Konva.Layer {
    return this.layer;
  }
}
