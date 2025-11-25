import Konva from "konva";
import { ItemType, ItemRarity, type ItemModifiers, type ItemData, type ItemAnimations } from "./ItemTypes.ts";

/**
 * Item class represents both consumable and upgrade items
 * Consumables can be used from inventory (1-9 slots)
 * Upgrades are equipped in upgrade slots and provide passive bonuses
 */
export class Item {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly iconColor: string;     // Placeholder color until we have sprites
  readonly type: ItemType;
  readonly rarity: ItemRarity;
  readonly stackable: boolean;
  readonly maxStack: number;
  readonly modifiers: ItemModifiers;
  readonly price: number;

  // Sprite/Animation properties (same pattern as enemies)
  readonly spriteSheet?: string;
  readonly animations?: ItemAnimations;
  readonly frameRate?: number;
  readonly frameWidth?: number;
  readonly frameHeight?: number;

  constructor(data: ItemData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.iconColor = data.iconColor;
    this.type = data.type;
    this.rarity = data.rarity;
    this.stackable = data.stackable;
    this.maxStack = data.maxStack;
    this.modifiers = data.modifiers;
    this.price = data.price;

    // Sprite/Animation properties
    this.spriteSheet = data.spriteSheet;
    this.animations = data.animations;
    this.frameRate = data.frameRate;
    this.frameWidth = data.frameWidth;
    this.frameHeight = data.frameHeight;
  }

  /**
   * Create a Konva icon for this item
   * Uses sprite sheet if available, falls back to colored rectangle
   * Follows same pattern as enemy sprites
   */
  createIcon(size: number = 40): Konva.Group {
    const group = new Konva.Group({
      width: size,
      height: size,
    });

    // Use sprite sheet if available
    if (this.spriteSheet) {
      const imageObj = new Image();
      imageObj.src = this.spriteSheet;
      imageObj.onload = () => {
        // If animations are defined, use Konva.Sprite (for animated sprites)
        if (this.animations) {
          const frameW = this.frameWidth || 32;
          const frameH = this.frameHeight || 32;
          const scale = Math.min(size / frameW, size / frameH);

          const sprite = new Konva.Sprite({
            x: size / 2,
            y: size / 2,
            scale: { x: scale, y: scale },
            offset: { x: frameW / 2, y: frameH / 2 },
            image: imageObj,
            animation: 'idle',
            animations: this.animations,
            frameRate: this.frameRate || 10,
            frameIndex: 0
          });

          sprite.start();
          group.add(sprite);
        } else {
          // For static images, use Konva.Image
          const scale = Math.min(size / imageObj.width, size / imageObj.height);
          const konvaImage = new Konva.Image({
            x: size / 2,
            y: size / 2,
            image: imageObj,
            scaleX: scale,
            scaleY: scale,
            offsetX: imageObj.width / 2,
            offsetY: imageObj.height / 2,
          });
          group.add(konvaImage);
        }
        group.getLayer()?.batchDraw?.();
      };
    } else {
      // Fallback to colored rectangle placeholder
      const bg = new Konva.Rect({
        x: 0,
        y: 0,
        width: size,
        height: size,
        fill: this.iconColor,
        cornerRadius: 5,
        stroke: "#333",
        strokeWidth: 2,
      });

      // Border highlight based on type
      const borderColor = this.type === ItemType.UPGRADE ? "#FFD700" : "#888";
      const border = new Konva.Rect({
        x: 2,
        y: 2,
        width: size - 4,
        height: size - 4,
        stroke: borderColor,
        strokeWidth: 1,
        cornerRadius: 3,
      });

      group.add(bg);
      group.add(border);
    }

    return group;
  }

  /**
   * Use this item (only for CONSUMABLE items)
   * Returns true if item was successfully used
   */
  use(player: any): boolean {
    if (!this.canUse()) {
      return false;
    }

    // Apply consumable effects
    if (this.modifiers.healAmount) {
      // If already at full health, increase max health by 1 instead
      if (player.getHealth() >= player.getEffectiveMaxHealth()) {
        player.setMaxHealth(player.getMaxHealth() + 1);
      } else {
        player.heal(this.modifiers.healAmount);
      }
    }

    if (this.modifiers.maxHealthBonus) {
      player.setMaxHealth(player.getMaxHealth() + this.modifiers.maxHealthBonus);
    }

    if (this.modifiers.instantMoney) {
      player.addMoney(this.modifiers.instantMoney);
    }

    return true;
  }

  /**
   * Check if this item can be used
   * Only CONSUMABLE items can be used
   */
  canUse(): boolean {
    return this.type === ItemType.CONSUMABLE;
  }

  /**
   * Serialize item to JSON for save/load
   */
  toJSON(): ItemData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      iconColor: this.iconColor,
      type: this.type,
      rarity: this.rarity,
      stackable: this.stackable,
      maxStack: this.maxStack,
      modifiers: this.modifiers,
      price: this.price,
    };
  }

  /**
   * Create Item from JSON data
   */
  static fromJSON(data: ItemData): Item {
    return new Item(data);
  }
}
