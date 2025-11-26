import { Item } from "./Item.ts";
import { ItemType, type ItemData } from "./ItemTypes.ts";

/**
 * Central registry of all items in the game
 * Items are registered at startup and can be retrieved by ID
 */
class ItemRegistry {
  private static instance: ItemRegistry | null = null;
  private items: Map<string, Item> = new Map();

  private constructor() {
    this.registerDefaultItems();
  }

  static getInstance(): ItemRegistry {
    if (!ItemRegistry.instance) {
      ItemRegistry.instance = new ItemRegistry();
    }
    return ItemRegistry.instance;
  }

  /**
   * Register all default items
   */
  private registerDefaultItems(): void {
    // ==================== CONSUMABLE ITEMS ====================

    // Health Potion - Restores 1 health
    this.registerItem({
      id: "health_potion",
      name: "Health Potion",
      description: "Restores 1 health",
      iconColor: "#FF6B6B", // Red
      type: ItemType.CONSUMABLE,
      stackable: true,
      maxStack: 5,
      modifiers: { healAmount: 1 },
      price: 50,
      spriteSheet: "./ufo.png",
      animations: {
        idle: [
          0, 0, 480, 220,
          480, 0, 480, 220,
          960, 0, 480, 220,
          1440, 0, 480, 220,
          1920, 0, 480, 220,
        ]
      },
      frameRate: 15,
      frameWidth: 480,
      frameHeight: 220,
    });

    // Greater Health Potion - Restores 2 health
    this.registerItem({
      id: "greater_health_potion",
      name: "Greater Health Potion",
      description: "Restores 2 health",
      iconColor: "#FF4444", // Dark Red
      type: ItemType.CONSUMABLE,
      stackable: true,
      maxStack: 3,
      modifiers: { healAmount: 2 },
      price: 100,
    });

    // Money Bag - Instant 100 coins
    this.registerItem({
      id: "money_bag",
      name: "Money Bag",
      description: "Gain 100 coins instantly",
      iconColor: "#FFD700", // Gold
      type: ItemType.CONSUMABLE,
      stackable: true,
      maxStack: 10,
      modifiers: { instantMoney: 100 },
      price: 80,
    });

    // Heart Container - Permanently increases max health
    this.registerItem({
      id: "heart_container",
      name: "Heart Container",
      description: "Permanently +1 Max Health",
      iconColor: "#FF69B4", // Hot Pink
      type: ItemType.CONSUMABLE,
      stackable: true,
      maxStack: 5,
      modifiers: { maxHealthBonus: 1 },
      price: 150,
    });

    // ==================== UPGRADE ITEMS ====================

    // Extra Heart - Increases max health
    this.registerItem({
      id: "extra_heart",
      name: "Extra Heart",
      description: "+1 Max Health",
      iconColor: "#FF1493", // Deep Pink
      type: ItemType.UPGRADE,
      stackable: false,
      maxStack: 1,
      modifiers: { maxHealthBonus: 1 },
      price: 300,
    });

    // Damage Amplifier - 50% more damage
    this.registerItem({
      id: "damage_amplifier",
      name: "Damage Amplifier",
      description: "Deal 50% more damage",
      iconColor: "#FF4500", // Orange Red
      type: ItemType.UPGRADE,
      stackable: false,
      maxStack: 1,
      modifiers: { damageMultiplier: 1.5 },
      price: 250,
    });

    // Double Damage - 2x damage
    this.registerItem({
      id: "double_damage",
      name: "Double Damage",
      description: "Deal 2x damage",
      iconColor: "#DC143C", // Crimson
      type: ItemType.UPGRADE,
      stackable: false,
      maxStack: 1,
      modifiers: { damageMultiplier: 2.0 },
      price: 500,
    });

    // Money Multiplier - 50% more money
    this.registerItem({
      id: "money_multiplier",
      name: "Lucky Coin",
      description: "Earn 50% more money",
      iconColor: "#DAA520", // Goldenrod
      type: ItemType.UPGRADE,
      stackable: false,
      maxStack: 1,
      modifiers: { moneyMultiplier: 1.5 },
      price: 200,
    });

    // Enemy Weakener - Enemies have 20% less health
    this.registerItem({
      id: "enemy_weakener",
      name: "Enemy Weakener",
      description: "Enemies have 20% less health",
      iconColor: "#8B00FF", // Violet
      type: ItemType.UPGRADE,
      stackable: false,
      maxStack: 1,
      modifiers: { enemyHealthMultiplier: 0.8 },
      price: 300,
    });

    // Time Dilator - Enemies move 25% slower
    this.registerItem({
      id: "time_dilator",
      name: "Time Dilator",
      description: "Enemies move 25% slower",
      iconColor: "#4169E1", // Royal Blue
      type: ItemType.UPGRADE,
      stackable: false,
      maxStack: 1,
      modifiers: { enemySpeedMultiplier: 0.75 },
      price: 350,
    });

    // Ultimate Power - Multiple bonuses
    this.registerItem({
      id: "ultimate_power",
      name: "Ultimate Power",
      description: "2x damage, 2x money, enemies 50% slower",
      iconColor: "#9400D3", // Dark Violet
      type: ItemType.UPGRADE,
      stackable: false,
      maxStack: 1,
      modifiers: {
        damageMultiplier: 2.0,
        moneyMultiplier: 2.0,
        enemySpeedMultiplier: 0.5,
      },
      price: 1000,
    });
  }

  /**
   * Register a new item
   */
  registerItem(data: ItemData): void {
    const item = new Item(data);
    this.items.set(item.id, item);
  }

  /**
   * Get item by ID
   */
  getItem(id: string): Item | undefined {
    return this.items.get(id);
  }

  /**
   * Get all items
   */
  getAllItems(): Item[] {
    return Array.from(this.items.values());
  }

  /**
   * Get all consumable items
   */
  getConsumables(): Item[] {
    return this.getAllItems().filter(item => item.type === ItemType.CONSUMABLE);
  }

  /**
   * Get all upgrade items
   */
  getUpgrades(): Item[] {
    return this.getAllItems().filter(item => item.type === ItemType.UPGRADE);
  }

  /**
   * Get the items map (for serialization)
   */
  getItemsMap(): Map<string, Item> {
    return this.items;
  }
}

export default ItemRegistry;
