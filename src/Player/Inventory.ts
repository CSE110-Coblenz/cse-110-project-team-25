import { Item } from "./Item.ts";
import { ItemType } from "./ItemTypes.ts";

/**
 * Represents a single slot in the inventory
 */
export interface InventorySlot {
  item: Item;
  quantity: number;
}

/**
 * Serialized inventory slot data
 */
interface InventorySlotData {
  itemId: string;
  quantity: number;
}

/**
 * Consumable inventory with 9 slots (mapped to keyboard 1-9)
 * Handles stackable items and slot management
 */
export class Inventory {
  private slots: (InventorySlot | null)[];
  private readonly MAX_SLOTS = 9;

  constructor() {
    this.slots = Array(this.MAX_SLOTS).fill(null);
  }

  /**
   * Add an item to the inventory
   * If stackable and already exists, adds to existing stack
   * Otherwise finds first empty slot
   * Returns true if successfully added, false if inventory full
   */
  addItem(item: Item, quantity: number = 1): boolean {
    if (item.type !== ItemType.CONSUMABLE) {
      console.error("Cannot add non-consumable item to consumable inventory");
      return false;
    }

    // If stackable, try to add to existing stack
    if (item.stackable) {
      for (let i = 0; i < this.MAX_SLOTS; i++) {
        const slot = this.slots[i];
        if (slot && slot.item.id === item.id) {
          const newQuantity = slot.quantity + quantity;
          if (newQuantity <= item.maxStack) {
            slot.quantity = newQuantity;
            return true;
          } else {
            // Stack would overflow, add what we can
            const overflow = newQuantity - item.maxStack;
            slot.quantity = item.maxStack;
            // Try to add overflow to another slot
            return this.addItem(item, overflow);
          }
        }
      }
    }

    // Find first empty slot
    for (let i = 0; i < this.MAX_SLOTS; i++) {
      if (this.slots[i] === null) {
        this.slots[i] = { item, quantity };
        return true;
      }
    }

    // No space available
    return false;
  }

  /**
   * Remove item from a specific slot
   * Returns the removed item or null if slot was empty
   */
  removeItem(slotIndex: number): Item | null {
    if (slotIndex < 0 || slotIndex >= this.MAX_SLOTS) {
      return null;
    }

    const slot = this.slots[slotIndex];
    if (!slot) {
      return null;
    }

    const item = slot.item;
    this.slots[slotIndex] = null;
    return item;
  }

  /**
   * Use item in a specific slot
   * Decrements quantity if stackable, removes if quantity reaches 0
   * Returns true if item was successfully used
   */
  useItem(slotIndex: number, player: any): boolean {
    if (slotIndex < 0 || slotIndex >= this.MAX_SLOTS) {
      return false;
    }

    const slot = this.slots[slotIndex];
    if (!slot) {
      return false;
    }

    // Try to use the item
    const success = slot.item.use(player);
    if (!success) {
      return false;
    }

    // Decrement quantity or remove if not stackable
    if (slot.item.stackable) {
      slot.quantity--;
      if (slot.quantity <= 0) {
        this.slots[slotIndex] = null;
      }
    } else {
      this.slots[slotIndex] = null;
    }

    return true;
  }

  /**
   * Get item at specific slot
   */
  getSlot(slotIndex: number): InventorySlot | null {
    if (slotIndex < 0 || slotIndex >= this.MAX_SLOTS) {
      return null;
    }
    return this.slots[slotIndex];
  }

  /**
   * Get all slots
   */
  getSlots(): (InventorySlot | null)[] {
    return [...this.slots];
  }

  /**
   * Check if inventory is full (no empty slots)
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
   * Clear all slots
   */
  clear(): void {
    this.slots = Array(this.MAX_SLOTS).fill(null);
  }

  /**
   * Serialize inventory to JSON for save/load
   */
  toJSON(): (InventorySlotData | null)[] {
    return this.slots.map(slot => {
      if (!slot) return null;
      return {
        itemId: slot.item.id,
        quantity: slot.quantity,
      };
    });
  }

  /**
   * Create Inventory from JSON data
   * Note: Requires ItemRegistry to reconstruct Item objects from IDs
   */
  static fromJSON(data: (InventorySlotData | null)[], itemRegistry: Map<string, Item>): Inventory {
    const inventory = new Inventory();

    for (let i = 0; i < data.length && i < inventory.MAX_SLOTS; i++) {
      const slotData = data[i];
      if (slotData) {
        const item = itemRegistry.get(slotData.itemId);
        if (item) {
          inventory.slots[i] = {
            item,
            quantity: slotData.quantity,
          };
        }
      }
    }

    return inventory;
  }
}
