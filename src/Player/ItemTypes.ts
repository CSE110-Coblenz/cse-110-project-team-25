/**
 * Item type determines where items can be stored and how they're used
 */
export const ItemType = {
  CONSUMABLE: 0,  // Goes in 1-9 inventory, can be used by player
  UPGRADE: 1      // Goes in 3-slot upgrade UI, auto-applied at level start
} as const;

export type ItemType = typeof ItemType[keyof typeof ItemType];

/**
 * Modifiers that items can apply to player or game state
 * Multipliers stack multiplicatively (1.5 * 1.5 = 2.25x)
 */
export interface ItemModifiers {
  // Stat bonuses (additive)
  maxHealthBonus?: number;        // +1 = add 1 max health

  // Multipliers (multiplicative, > 1.0 = buff, < 1.0 = debuff)
  damageMultiplier?: number;      // 2.0 = double damage per keystroke
  moneyMultiplier?: number;       // 1.5 = 50% more money from enemies

  // Enemy modifiers (applied to all enemies)
  enemyHealthMultiplier?: number; // 0.8 = enemies have 80% health
  enemySpeedMultiplier?: number;  // 0.9 = enemies move at 90% speed

  // Consumable effects (instant when used)
  healAmount?: number;            // Instant heal
  instantMoney?: number;          // Instant money gain
}

/**
 * Animation definition for sprite sheets (same format as enemies)
 */
export interface ItemAnimations {
  idle: number[];  // Array of [x, y, width, height] for each frame
}

/**
 * Serialized item data for save/load
 */
export interface ItemData {
  id: string;
  name: string;
  description: string;
  iconColor: string;              // Hex color for placeholder icon (fallback)
  type: ItemType;
  stackable: boolean;
  maxStack: number;
  modifiers: ItemModifiers;
  price: number;

  // Sprite/Animation properties (optional - same pattern as enemies)
  spriteSheet?: string;           // Path to sprite sheet image (e.g., "/items/health_potion.png")
  animations?: ItemAnimations;    // Animation frames
  frameRate?: number;             // FPS for animation (default 10)
  frameWidth?: number;            // Width of single frame (default 32)
  frameHeight?: number;           // Height of single frame (default 32)
}
