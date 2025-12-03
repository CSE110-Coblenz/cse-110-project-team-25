import type { Item } from "../Player/Item.ts";
import { ItemType, ItemRarity } from "../Player/ItemTypes.ts";
import ItemRegistry from "../Player/ItemRegistry.ts";

/**
 * Shop inventory manager
 * Handles item selection, pricing, and rarity-based availability
 */
export class ShopInventory {
  private registry: ItemRegistry;

  // Base prices for each rarity tier
  private readonly RARITY_PRICES: Record<ItemRarity, number> = {
    [ItemRarity.COMMON]: 300,
    [ItemRarity.UNCOMMON]: 600,
    [ItemRarity.RARE]: 1000,
    [ItemRarity.EPIC]: 2000,
    [ItemRarity.LEGENDARY]: 5000,
  };

  constructor() {
    this.registry = ItemRegistry.getInstance();
  }

  /**
   * Generate 4 random podium items
   * Podiums sell: ALL consumables + common/uncommon upgrades
   */
  generatePodiumItems(): Item[] {
    const allItems = this.registry.getAllItems();
    const validItems = allItems.filter(item =>
      // Include all consumables
      item.type === ItemType.CONSUMABLE ||
      // Include only common/uncommon upgrades
      (item.type === ItemType.UPGRADE &&
       (item.rarity === ItemRarity.COMMON || item.rarity === ItemRarity.UNCOMMON))
    );

    if (validItems.length === 0) {
      console.warn("No valid items for podium generation!");
      return [];
    }

    // Randomly select 4 items (or fewer if not enough exist)
    return this.randomSample(validItems, Math.min(4, validItems.length));
  }

  /**
   * Generate 3 NPC items
   * NPC sells: rare/epic/legendary UPGRADES only
   */
  generateNPCItems(): Item[] {
    const allItems = this.registry.getAllItems();
    const validItems = allItems.filter(item =>
      item.type === ItemType.UPGRADE &&
      (item.rarity === ItemRarity.RARE ||
       item.rarity === ItemRarity.EPIC ||
       item.rarity === ItemRarity.LEGENDARY)
    );

    if (validItems.length === 0) {
      console.warn("No valid items for NPC generation!");
      return [];
    }

    // Randomly select 3 items (or fewer if not enough exist)
    return this.randomSample(validItems, Math.min(3, validItems.length));
  }

  /**
   * Get base price for item based on rarity
   * This is the starting price for bartering
   */
  getBasePrice(item: Item): number {
    return this.RARITY_PRICES[item.rarity];
  }

  /**
   * Get fixed price for podium items (no bartering)
   * Currently same as base price, but could be different
   */
  getPodiumPrice(item: Item): number {
    return this.getBasePrice(item);
  }

  /**
   * Randomly sample N items from array without replacement
   */
  private randomSample<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get all items of a specific rarity
   */
  getItemsByRarity(rarity: ItemRarity): Item[] {
    return this.registry.getAllItems().filter(item => item.rarity === rarity);
  }

  /**
   * Get all consumables
   */
  getConsumables(): Item[] {
    return this.registry.getConsumables();
  }

  /**
   * Get all upgrades
   */
  getUpgrades(): Item[] {
    return this.registry.getUpgrades();
  }
}
