import Konva from "konva";
import { Player } from "../Player/Player.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../constants.ts";

/**
 * Animation state for inventory UI
 */
type AnimationState = "hidden" | "showing" | "visible" | "hiding";

/**
 * InventoryUI displays the 9-slot consumable inventory at the bottom-middle of the screen
 * Players can use items by pressing 1-9 keys
 * Slides up from bottom when toggled
 */
export class InventoryUI {
  private group: Konva.Group;
  private slots: Konva.Group[] = [];
  private readonly SLOT_SIZE = 50;
  private readonly SLOT_SPACING = 10;
  private readonly NUM_SLOTS = 9;
  private readonly VISIBLE_Y = STAGE_HEIGHT - 80;
  private readonly HIDDEN_Y = STAGE_HEIGHT + 100; // Off-screen below
  private readonly ANIMATION_DURATION = 0.5; // seconds

  private animationState: AnimationState = "hidden";
  private currentTween: Konva.Tween | null = null;

  constructor() {
    this.group = new Konva.Group({
      x: STAGE_WIDTH / 2,
      y: this.HIDDEN_Y, // Start off-screen
    });

    this.createSlots();
  }

  /**
   * Create the 9 inventory slots
   */
  private createSlots(): void {
    const totalWidth = this.NUM_SLOTS * this.SLOT_SIZE + (this.NUM_SLOTS - 1) * this.SLOT_SPACING;
    const startX = -totalWidth / 2;

    for (let i = 0; i < this.NUM_SLOTS; i++) {
      const x = startX + i * (this.SLOT_SIZE + this.SLOT_SPACING);
      const slot = this.createSlot(i, x, 0);
      this.slots.push(slot);
      this.group.add(slot);
    }
  }

  /**
   * Create a single inventory slot
   */
  private createSlot(index: number, x: number, y: number): Konva.Group {
    const slotGroup = new Konva.Group({ x, y });

    // Slot background
    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.SLOT_SIZE,
      height: this.SLOT_SIZE,
      fill: "#2a2a2a",
      stroke: "#555",
      strokeWidth: 2,
      cornerRadius: 5,
    });

    // Slot number (1-9)
    const numberText = new Konva.Text({
      x: 2,
      y: 2,
      text: `${index + 1}`,
      fontSize: 12,
      fontFamily: "Courier New",
      fill: "#888",
      listening: false,
    });

    slotGroup.add(bg);
    slotGroup.add(numberText);

    return slotGroup;
  }

  /**
   * Update the inventory display to match Player's current inventory
   */
  update(): void {
    const player = Player.getInstance();
    const inventory = player.getConsumableInventory();

    for (let i = 0; i < this.NUM_SLOTS; i++) {
      const slot = this.slots[i];
      const inventorySlot = inventory.getSlot(i);

      // Clear existing item display (keep bg and number)
      const children = slot.getChildren();
      while (children.length > 2) {
        children[children.length - 1].destroy();
      }

      if (inventorySlot) {
        // Add item icon
        const icon = inventorySlot.item.createIcon(this.SLOT_SIZE - 4);
        icon.x(2);
        icon.y(2);
        slot.add(icon);

        // Add quantity text if stackable and > 1
        if (inventorySlot.item.stackable && inventorySlot.quantity > 1) {
          const quantityText = new Konva.Text({
            x: this.SLOT_SIZE - 18,
            y: this.SLOT_SIZE - 18,
            text: `${inventorySlot.quantity}`,
            fontSize: 14,
            fontFamily: "Courier New",
            fill: "white",
            stroke: "black",
            strokeWidth: 1,
            listening: false,
          });
          slot.add(quantityText);
        }
      }
    }

    this.group.getLayer()?.batchDraw();
  }

  /**
   * Get the Konva group
   */
  getGroup(): Konva.Group {
    return this.group;
  }

  /**
   * Toggle inventory visibility with slide animation
   */
  toggle(): void {
    if (this.animationState === "hidden" || this.animationState === "hiding") {
      this.slideIn();
    } else if (this.animationState === "visible" || this.animationState === "showing") {
      this.slideOut();
    }
  }

  /**
   * Slide inventory in from bottom (show)
   */
  private slideIn(): void {
    // Stop current animation if running
    if (this.currentTween) {
      this.currentTween.destroy();
    }

    this.animationState = "showing";
    this.group.visible(true);

    const currentY = this.group.y();
    this.currentTween = new Konva.Tween({
      node: this.group,
      duration: this.ANIMATION_DURATION,
      y: this.VISIBLE_Y,
      easing: Konva.Easings.EaseInOut,
      onFinish: () => {
        this.animationState = "visible";
        this.currentTween = null;
      }
    });

    this.currentTween.play();
  }

  /**
   * Slide inventory out to bottom (hide)
   */
  private slideOut(): void {
    // Stop current animation if running
    if (this.currentTween) {
      this.currentTween.destroy();
    }

    this.animationState = "hiding";

    this.currentTween = new Konva.Tween({
      node: this.group,
      duration: this.ANIMATION_DURATION,
      y: this.HIDDEN_Y,
      easing: Konva.Easings.EaseInOut,
      onFinish: () => {
        this.animationState = "hidden";
        this.group.visible(false);
        this.currentTween = null;
      }
    });

    this.currentTween.play();
  }

  /**
   * Check if inventory is visible or showing
   */
  isVisible(): boolean {
    return this.animationState === "visible" || this.animationState === "showing";
  }

  /**
   * Show the inventory UI (legacy method - use toggle instead)
   */
  show(): void {
    this.group.visible(true);
  }

  /**
   * Hide the inventory UI (legacy method - use toggle instead)
   */
  hide(): void {
    this.group.visible(false);
  }
}
