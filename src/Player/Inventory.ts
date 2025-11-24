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
 * Expanded inventory system with hotbar + larger storage
 *
 * Hotbar (9 slots): Consumables only, accessible during gameplay (1-9 keys)
 * Larger Inventory (27 slots): Both consumables and upgrades, accessible in shop/menus only
 *
 * Total: 36 slots for consumables/upgrades (9 hotbar + 27 storage)
 */
export class Inventory {
  private hotbar: (InventorySlot | null)[];
  private largerInventory: (InventorySlot | null)[];

  private readonly HOTBAR_SLOTS = 9;
  private readonly STORAGE_SLOTS = 27;

  constructor() {
    this.hotbar = Array(this.HOTBAR_SLOTS).fill(null);
    this.largerInventory = Array(this.STORAGE_SLOTS).fill(null);
  }

  /**
   * Add an item to the inventory
   * Priority: 1) Stack in hotbar, 2) Empty hotbar, 3) Stack in storage, 4) Empty storage
   * Returns true if successfully added, false if inventory full
   */
  addItem(item: Item, quantity: number = 1): boolean {
    // Upgrades can only go in larger inventory (not hotbar)
    if (item.type === ItemType.UPGRADE) {
      return this.addToStorage(item, quantity);
    }

    // Consumables: try hotbar first, then storage
    if (item.type === ItemType.CONSUMABLE) {
      // Try to stack in hotbar first
      if (item.stackable) {
        const hotbarAdded = this.tryStackInArray(this.hotbar, item, quantity);
        if (hotbarAdded.success) {
          if (hotbarAdded.remaining > 0) {
            // Some overflow, try storage
            return this.addToStorage(item, hotbarAdded.remaining);
          }
          return true;
        }
      }

      // Try to find empty hotbar slot
      const hotbarIndex = this.hotbar.findIndex(slot => slot === null);
      if (hotbarIndex !== -1) {
        const toAdd = Math.min(quantity, item.maxStack);
        this.hotbar[hotbarIndex] = { item, quantity: toAdd };
        const remaining = quantity - toAdd;
        if (remaining > 0) {
          return this.addToStorage(item, remaining);
        }
        return true;
      }

      // Hotbar full, try storage
      return this.addToStorage(item, quantity);
    }

    return false;
  }

  /**
   * Add item to larger storage inventory
   */
  private addToStorage(item: Item, quantity: number): boolean {
    // Try to stack first
    if (item.stackable) {
      const result = this.tryStackInArray(this.largerInventory, item, quantity);
      if (result.success) {
        if (result.remaining > 0) {
          // Try to add remaining to empty slot
          return this.addToEmptyStorageSlot(item, result.remaining);
        }
        return true;
      }
    }

    // Find empty slot
    return this.addToEmptyStorageSlot(item, quantity);
  }

  /**
   * Add item to first empty storage slot
   */
  private addToEmptyStorageSlot(item: Item, quantity: number): boolean {
    const storageIndex = this.largerInventory.findIndex(slot => slot === null);
    if (storageIndex !== -1) {
      const toAdd = Math.min(quantity, item.maxStack);
      this.largerInventory[storageIndex] = { item, quantity: toAdd };
      const remaining = quantity - toAdd;
      if (remaining > 0) {
        // Recursively add remaining
        return this.addToEmptyStorageSlot(item, remaining);
      }
      return true;
    }

    // No space in storage
    return false;
  }

  /**
   * Try to stack item in an array of slots
   * Returns {success: boolean, remaining: number}
   */
  private tryStackInArray(
    slots: (InventorySlot | null)[],
    item: Item,
    quantity: number
  ): { success: boolean; remaining: number } {
    let remaining = quantity;

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (slot && slot.item.id === item.id) {
        const spaceInSlot = item.maxStack - slot.quantity;
        const toAdd = Math.min(remaining, spaceInSlot);
        slot.quantity += toAdd;
        remaining -= toAdd;

        if (remaining === 0) {
          return { success: true, remaining: 0 };
        }
      }
    }

    return { success: remaining < quantity, remaining };
  }

  /**
   * Remove item from hotbar slot
   */
  removeHotbarItem(slotIndex: number): Item | null {
    if (slotIndex < 0 || slotIndex >= this.HOTBAR_SLOTS) {
      return null;
    }

    const slot = this.hotbar[slotIndex];
    if (!slot) return null;

    const item = slot.item;
    this.hotbar[slotIndex] = null;
    return item;
  }

  /**
   * Remove item from storage slot
   */
  removeStorageItem(slotIndex: number): Item | null {
    if (slotIndex < 0 || slotIndex >= this.STORAGE_SLOTS) {
      return null;
    }

    const slot = this.largerInventory[slotIndex];
    if (!slot) return null;

    const item = slot.item;
    this.largerInventory[slotIndex] = null;
    return item;
  }

  /**
   * Use item from hotbar (during gameplay)
   */
  useItem(hotbarIndex: number, player: any): boolean {
    if (hotbarIndex < 0 || hotbarIndex >= this.HOTBAR_SLOTS) {
      return false;
    }

    const slot = this.hotbar[hotbarIndex];
    if (!slot) return false;

    // Try to use the item
    const success = slot.item.use(player);
    if (!success) return false;

    // Decrement quantity or remove
    if (slot.item.stackable) {
      slot.quantity--;
      if (slot.quantity <= 0) {
        this.hotbar[hotbarIndex] = null;
      }
    } else {
      this.hotbar[hotbarIndex] = null;
    }

    return true;
  }

  /**
   * Move item from hotbar to storage
   */
  moveHotbarToStorage(hotbarIndex: number, storageIndex: number): boolean {
    if (hotbarIndex < 0 || hotbarIndex >= this.HOTBAR_SLOTS) return false;
    if (storageIndex < 0 || storageIndex >= this.STORAGE_SLOTS) return false;

    const hotbarSlot = this.hotbar[hotbarIndex];
    if (!hotbarSlot) return false;

    const storageSlot = this.largerInventory[storageIndex];

    // If storage slot is empty, just move
    if (!storageSlot) {
      this.largerInventory[storageIndex] = hotbarSlot;
      this.hotbar[hotbarIndex] = null;
      return true;
    }

    // If storage slot has same item and stackable, merge
    if (storageSlot.item.id === hotbarSlot.item.id && hotbarSlot.item.stackable) {
      const spaceInStorage = hotbarSlot.item.maxStack - storageSlot.quantity;
      const toMove = Math.min(hotbarSlot.quantity, spaceInStorage);
      storageSlot.quantity += toMove;
      hotbarSlot.quantity -= toMove;

      if (hotbarSlot.quantity <= 0) {
        this.hotbar[hotbarIndex] = null;
      }
      return true;
    }

    // Otherwise swap
    this.largerInventory[storageIndex] = hotbarSlot;
    this.hotbar[hotbarIndex] = storageSlot;
    return true;
  }

  /**
   * Move item from storage to hotbar
   */
  moveStorageToHotbar(storageIndex: number, hotbarIndex: number): boolean {
    if (storageIndex < 0 || storageIndex >= this.STORAGE_SLOTS) return false;
    if (hotbarIndex < 0 || hotbarIndex >= this.HOTBAR_SLOTS) return false;

    const storageSlot = this.largerInventory[storageIndex];
    if (!storageSlot) return false;

    // Upgrades cannot go in hotbar
    if (storageSlot.item.type === ItemType.UPGRADE) {
      return false;
    }

    const hotbarSlot = this.hotbar[hotbarIndex];

    // If hotbar slot is empty, just move
    if (!hotbarSlot) {
      this.hotbar[hotbarIndex] = storageSlot;
      this.largerInventory[storageIndex] = null;
      return true;
    }

    // If hotbar slot has same item and stackable, merge
    if (hotbarSlot.item.id === storageSlot.item.id && storageSlot.item.stackable) {
      const spaceInHotbar = storageSlot.item.maxStack - hotbarSlot.quantity;
      const toMove = Math.min(storageSlot.quantity, spaceInHotbar);
      hotbarSlot.quantity += toMove;
      storageSlot.quantity -= toMove;

      if (storageSlot.quantity <= 0) {
        this.largerInventory[storageIndex] = null;
      }
      return true;
    }

    // Otherwise swap
    this.hotbar[hotbarIndex] = storageSlot;
    this.largerInventory[storageIndex] = hotbarSlot;
    return true;
  }

  /**
   * Swap two hotbar slots
   */
  swapHotbarSlots(index1: number, index2: number): boolean {
    if (index1 < 0 || index1 >= this.HOTBAR_SLOTS) return false;
    if (index2 < 0 || index2 >= this.HOTBAR_SLOTS) return false;

    const temp = this.hotbar[index1];
    this.hotbar[index1] = this.hotbar[index2];
    this.hotbar[index2] = temp;
    return true;
  }

  /**
   * Swap two storage slots
   */
  swapStorageSlots(index1: number, index2: number): boolean {
    if (index1 < 0 || index1 >= this.STORAGE_SLOTS) return false;
    if (index2 < 0 || index2 >= this.STORAGE_SLOTS) return false;

    const temp = this.largerInventory[index1];
    this.largerInventory[index1] = this.largerInventory[index2];
    this.largerInventory[index2] = temp;
    return true;
  }

  /**
   * Get hotbar slot
   */
  getHotbarSlot(index: number): InventorySlot | null {
    if (index < 0 || index >= this.HOTBAR_SLOTS) return null;
    return this.hotbar[index];
  }

  /**
   * Get storage slot
   */
  getStorageSlot(index: number): InventorySlot | null {
    if (index < 0 || index >= this.STORAGE_SLOTS) return null;
    return this.largerInventory[index];
  }

  /**
   * Get all hotbar slots
   */
  getHotbarSlots(): (InventorySlot | null)[] {
    return [...this.hotbar];
  }

  /**
   * Get all storage slots
   */
  getStorageSlots(): (InventorySlot | null)[] {
    return [...this.largerInventory];
  }

  /**
   * LEGACY: Get slot (for backward compatibility - returns hotbar slot)
   */
  getSlot(slotIndex: number): InventorySlot | null {
    return this.getHotbarSlot(slotIndex);
  }

  /**
   * LEGACY: Get all slots (for backward compatibility - returns hotbar)
   */
  getSlots(): (InventorySlot | null)[] {
    return this.getHotbarSlots();
  }

  /**
   * Check if both hotbar and storage are full
   */
  isFull(): boolean {
    return this.hotbar.every(slot => slot !== null) &&
           this.largerInventory.every(slot => slot !== null);
  }

  /**
   * Get total empty slot count
   */
  getEmptySlotCount(): number {
    const hotbarEmpty = this.hotbar.filter(slot => slot === null).length;
    const storageEmpty = this.largerInventory.filter(slot => slot === null).length;
    return hotbarEmpty + storageEmpty;
  }

  /**
   * Clear all slots
   */
  clear(): void {
    this.hotbar = Array(this.HOTBAR_SLOTS).fill(null);
    this.largerInventory = Array(this.STORAGE_SLOTS).fill(null);
  }

  /**
   * Serialize inventory to JSON for save/load
   */
  toJSON(): { hotbar: (InventorySlotData | null)[]; storage: (InventorySlotData | null)[] } {
    const serializeSlots = (slots: (InventorySlot | null)[]) => {
      return slots.map(slot => {
        if (!slot) return null;
        return {
          itemId: slot.item.id,
          quantity: slot.quantity,
        };
      });
    };

    return {
      hotbar: serializeSlots(this.hotbar),
      storage: serializeSlots(this.largerInventory),
    };
  }

  /**
   * Create Inventory from JSON data
   */
  static fromJSON(
    data: { hotbar: (InventorySlotData | null)[]; storage: (InventorySlotData | null)[] } | (InventorySlotData | null)[],
    itemRegistry: Map<string, Item>
  ): Inventory {
    const inventory = new Inventory();

    // Handle legacy format (old save data with only hotbar)
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length && i < inventory.HOTBAR_SLOTS; i++) {
        const slotData = data[i];
        if (slotData) {
          const item = itemRegistry.get(slotData.itemId);
          if (item) {
            inventory.hotbar[i] = {
              item,
              quantity: slotData.quantity,
            };
          }
        }
      }
      return inventory;
    }

    // New format with hotbar + storage
    const deserializeSlots = (slotDataArray: (InventorySlotData | null)[], targetArray: (InventorySlot | null)[]) => {
      for (let i = 0; i < slotDataArray.length && i < targetArray.length; i++) {
        const slotData = slotDataArray[i];
        if (slotData) {
          const item = itemRegistry.get(slotData.itemId);
          if (item) {
            targetArray[i] = {
              item,
              quantity: slotData.quantity,
            };
          }
        }
      }
    };

    deserializeSlots(data.hotbar, inventory.hotbar);
    deserializeSlots(data.storage, inventory.largerInventory);

    return inventory;
  }
}
