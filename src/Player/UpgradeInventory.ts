import { Item } from "./Item.ts";
import { ItemType, type ItemModifiers } from "./ItemTypes.ts";

/**
 * Upgrade inventory with 3 slots for permanent upgrades
 * Upgrades are passive and apply their modifiers automatically
 * Applied at level start, not mid-level
 */
export class UpgradeInventory {
  private slots: (Item | null)[];
  private readonly MAX_UPGRADES = 3;

  constructor() {
    this.slots = Array(this.MAX_UPGRADES).fill(null);
  }

  /**
   * Equip an upgrade in a specific slot (0-2)
   * Returns true if successful, false if slot invalid or item not an upgrade
   */
  equipUpgrade(item: Item, slot: number): boolean {
    if (slot < 0 || slot >= this.MAX_UPGRADES) {
      console.error(`Invalid upgrade slot: ${slot}`);
      return false;
    }

    if (item.type !== ItemType.UPGRADE) {
      console.error("Cannot equip non-upgrade item in upgrade slot");
      return false;
    }

    this.slots[slot] = item;
    return true;
  }

  /**
   * Unequip upgrade from a specific slot
   * Returns the unequipped item or null if slot was empty
   */
  unequipUpgrade(slot: number): Item | null {
    if (slot < 0 || slot >= this.MAX_UPGRADES) {
      return null;
    }

    const item = this.slots[slot];
    this.slots[slot] = null;
    return item;
  }

  /**
   * Get upgrade at specific slot
   */
  getSlot(slot: number): Item | null {
    if (slot < 0 || slot >= this.MAX_UPGRADES) {
      return null;
    }
    return this.slots[slot];
  }

  /**
   * Get all upgrade slots
   */
  getSlots(): (Item | null)[] {
    return [...this.slots];
  }

  /**
   * Get all equipped upgrades (non-null slots)
   */
  getEquippedUpgrades(): Item[] {
    return this.slots.filter(item => item !== null) as Item[];
  }

  /**
   * Aggregate all modifiers from equipped upgrades
   * Multipliers stack multiplicatively
   * Bonuses stack additively
   */
  getAllModifiers(): ItemModifiers {
    const aggregated: ItemModifiers = {};

    for (const item of this.slots) {
      if (!item) continue;

      const mods = item.modifiers;

      // Additive bonuses
      if (mods.maxHealthBonus) {
        aggregated.maxHealthBonus = (aggregated.maxHealthBonus || 0) + mods.maxHealthBonus;
      }

      // Multiplicative modifiers
      if (mods.damageMultiplier) {
        aggregated.damageMultiplier = (aggregated.damageMultiplier || 1) * mods.damageMultiplier;
      }

      if (mods.moneyMultiplier) {
        aggregated.moneyMultiplier = (aggregated.moneyMultiplier || 1) * mods.moneyMultiplier;
      }

      if (mods.enemyHealthMultiplier) {
        aggregated.enemyHealthMultiplier = (aggregated.enemyHealthMultiplier || 1) * mods.enemyHealthMultiplier;
      }

      if (mods.enemySpeedMultiplier) {
        aggregated.enemySpeedMultiplier = (aggregated.enemySpeedMultiplier || 1) * mods.enemySpeedMultiplier;
      }
    }

    return aggregated;
  }

  /**
   * Check if all upgrade slots are full
   */
  isFull(): boolean {
    return this.slots.every(slot => slot !== null);
  }

  /**
   * Get number of empty slots
   */
  getEmptySlotCount(): number {
    return this.slots.filter(slot => slot === null).length;
  }

  /**
   * Clear all upgrade slots
   */
  clear(): void {
    this.slots = Array(this.MAX_UPGRADES).fill(null);
  }

  /**
   * Serialize upgrade inventory to JSON for save/load
   */
  toJSON(): (string | null)[] {
    return this.slots.map(item => item ? item.id : null);
  }

  /**
   * Create UpgradeInventory from JSON data
   * Requires ItemRegistry to reconstruct Item objects from IDs
   */
  static fromJSON(data: (string | null)[], itemRegistry: Map<string, Item>): UpgradeInventory {
    const upgradeInventory = new UpgradeInventory();

    for (let i = 0; i < data.length && i < upgradeInventory.MAX_UPGRADES; i++) {
      const itemId = data[i];
      if (itemId) {
        const item = itemRegistry.get(itemId);
        if (item && item.type === ItemType.UPGRADE) {
          upgradeInventory.slots[i] = item;
        }
      }
    }

    return upgradeInventory;
  }
}
