import Konva from "konva";
import { Player } from "../Player/Player.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../constants.ts";

/**
 * UpgradeUI displays the 3 permanent upgrade slots on the right-middle of the screen
 * Shows equipped upgrades that provide passive bonuses
 */
export class UpgradeUI {
  private group: Konva.Group;
  private slots: Konva.Group[] = [];
  private readonly SLOT_SIZE = 60;
  private readonly SLOT_SPACING = 10;
  private readonly NUM_SLOTS = 3;

  constructor() {
    this.group = new Konva.Group({
      x: STAGE_WIDTH - 90,
      y: STAGE_HEIGHT / 2 - 100,
    });

    this.createSlots();
  }

  /**
   * Create the 3 upgrade slots
   */
  private createSlots(): void {
    // Title - centered above the slots
    const title = new Konva.Text({
      x: this.SLOT_SIZE / 2,
      y: -30,
      text: "UPGRADES",
      fontSize: 14,
      fontFamily: "Courier New",
      fill: "#FFD700",
      listening: false,
    });
    // Center the title
    title.offsetX(title.width() / 2);
    this.group.add(title);

    // Create 3 vertical slots
    for (let i = 0; i < this.NUM_SLOTS; i++) {
      const y = i * (this.SLOT_SIZE + this.SLOT_SPACING);
      const slot = this.createSlot(i, 0, y);
      this.slots.push(slot);
      this.group.add(slot);
    }
  }

  /**
   * Create a single upgrade slot
   */
  private createSlot(_index: number, x: number, y: number): Konva.Group {
    const slotGroup = new Konva.Group({ x, y });

    // Slot background with golden border (indicates upgrades)
    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.SLOT_SIZE,
      height: this.SLOT_SIZE,
      fill: "#1a1a1a",
      stroke: "#FFD700",
      strokeWidth: 3,
      cornerRadius: 5,
    });

    slotGroup.add(bg);

    return slotGroup;
  }

  /**
   * Update the upgrade display to match Player's equipped upgrades
   */
  update(): void {
    const player = Player.getInstance();
    const upgradeInventory = player.getUpgradeInventory();

    for (let i = 0; i < this.NUM_SLOTS; i++) {
      const slot = this.slots[i];
      const upgrade = upgradeInventory.getSlot(i);

      // Clear existing item display (keep bg)
      const children = slot.getChildren();
      while (children.length > 1) {
        children[children.length - 1].destroy();
      }

      if (upgrade) {
        // Add upgrade icon
        const icon = upgrade.createIcon(this.SLOT_SIZE - 6);
        icon.x(3);
        icon.y(3);
        slot.add(icon);

        // Add a glow effect for equipped upgrades
        const glow = new Konva.Rect({
          x: 0,
          y: 0,
          width: this.SLOT_SIZE,
          height: this.SLOT_SIZE,
          stroke: "#FFD700",
          strokeWidth: 2,
          cornerRadius: 5,
          shadowColor: "#FFD700",
          shadowBlur: 10,
          shadowOpacity: 0.6,
          listening: false,
        });
        slot.add(glow);
        glow.moveToBottom();
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
   * Show the upgrade UI
   */
  show(): void {
    this.group.visible(true);
  }

  /**
   * Hide the upgrade UI
   */
  hide(): void {
    this.group.visible(false);
  }
}
