import Konva from "konva";
import type { Inventory, InventorySlot } from "../Player/Inventory.ts";
import { Player } from "../Player/Player.ts";
import type { Item } from "../Player/Item.ts";

/**
 * Drag state for inventory items
 */
interface DragState {
  dragging: boolean;
  source: 'hotbar' | 'storage' | 'upgrade' | null;
  sourceIndex: number | null;
  draggedSlot: InventorySlot | Item | null;
  ghostImage: Konva.Group | null;
}

/**
 * Shop Inventory UI with drag-and-drop support
 * Displays hotbar (9 slots) and larger storage (27 slots)
 * Minecraft-style inventory management for shop screen
 */
export class ShopInventoryUI {
  private group: Konva.Group;
  private inventory: Inventory;

  // Slot visuals
  private hotbarSlots: Konva.Group[] = [];
  private storageSlots: Konva.Group[] = [];
  private upgradeSlots: Konva.Group[] = [];

  // Drag state
  private dragState: DragState = {
    dragging: false,
    source: null,
    sourceIndex: null,
    draggedSlot: null,
    ghostImage: null,
  };

  private readonly SLOT_SIZE = 50;
  private readonly SLOT_PADDING = 5;
  private readonly HOTBAR_COLS = 9;
  private readonly STORAGE_COLS = 9;
  private readonly STORAGE_ROWS = 3;
  private readonly UPGRADE_SLOTS = 3;

  constructor(inventory: Inventory, x: number, y: number) {
    this.inventory = inventory;
    this.group = new Konva.Group({ x, y });

    this.buildUI();
    this.setupDragAndDrop();
  }

  /**
   * Build the inventory UI
   */
  private buildUI(): void {
    // Title
    const title = new Konva.Text({
      x: 0,
      y: 0,
      text: "Inventory",
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#FFFFFF",
    });
    this.group.add(title);

    // Hotbar label
    const hotbarLabel = new Konva.Text({
      x: 0,
      y: 40,
      text: "Hotbar (1-9)",
      fontSize: 16,
      fontFamily: "Arial",
      fill: "#CCCCCC",
    });
    this.group.add(hotbarLabel);

    // Create hotbar slots (9 slots in 1 row)
    const hotbarY = 70;
    for (let i = 0; i < this.HOTBAR_COLS; i++) {
      const slotGroup = this.createSlot(
        i * (this.SLOT_SIZE + this.SLOT_PADDING),
        hotbarY,
        'hotbar',
        i
      );
      this.hotbarSlots.push(slotGroup);
      this.group.add(slotGroup);
    }

    // Storage label
    const storageLabel = new Konva.Text({
      x: 0,
      y: hotbarY + this.SLOT_SIZE + 20,
      text: "Storage (27 slots)",
      fontSize: 16,
      fontFamily: "Arial",
      fill: "#CCCCCC",
    });
    this.group.add(storageLabel);

    // Create storage slots (27 slots in 3x9 grid)
    const storageY = hotbarY + this.SLOT_SIZE + 50;
    for (let row = 0; row < this.STORAGE_ROWS; row++) {
      for (let col = 0; col < this.STORAGE_COLS; col++) {
        const index = row * this.STORAGE_COLS + col;
        const slotGroup = this.createSlot(
          col * (this.SLOT_SIZE + this.SLOT_PADDING),
          storageY + row * (this.SLOT_SIZE + this.SLOT_PADDING),
          'storage',
          index
        );
        this.storageSlots.push(slotGroup);
        this.group.add(slotGroup);
      }
    }

    // Upgrade slots label
    const upgradeLabel = new Konva.Text({
      x: 0,
      y: storageY + this.STORAGE_ROWS * (this.SLOT_SIZE + this.SLOT_PADDING) + 20,
      text: "Equipped Upgrades",
      fontSize: 16,
      fontFamily: "Arial",
      fill: "#FFD700",
    });
    this.group.add(upgradeLabel);

    // Create upgrade slots (3 slots in 1 row)
    const upgradeY = storageY + this.STORAGE_ROWS * (this.SLOT_SIZE + this.SLOT_PADDING) + 50;
    for (let i = 0; i < this.UPGRADE_SLOTS; i++) {
      const slotGroup = this.createSlot(
        i * (this.SLOT_SIZE + this.SLOT_PADDING),
        upgradeY,
        'upgrade',
        i
      );
      this.upgradeSlots.push(slotGroup);
      this.group.add(slotGroup);
    }
  }

  /**
   * Create a single inventory slot
   */
  private createSlot(x: number, y: number, type: 'hotbar' | 'storage' | 'upgrade', index: number): Konva.Group {
    const slotGroup = new Konva.Group({
      x,
      y,
      name: `${type}_${index}`,
    });

    // Slot background (gold border for upgrades)
    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.SLOT_SIZE,
      height: this.SLOT_SIZE,
      fill: "#2a2a3e",
      stroke: type === 'upgrade' ? "#FFD700" : "#666",
      strokeWidth: 2,
      cornerRadius: 3,
    });
    slotGroup.add(bg);

    // Slot index number (for hotbar)
    if (type === 'hotbar') {
      const indexText = new Konva.Text({
        x: 2,
        y: 2,
        text: `${index + 1}`,
        fontSize: 10,
        fontFamily: "Arial",
        fill: "#888",
      });
      slotGroup.add(indexText);
    }

    return slotGroup;
  }

  /**
   * Set up drag-and-drop event handlers
   */
  private setupDragAndDrop(): void {
    // Mouse down: start drag
    this.group.on("mousedown touchstart", (e) => {
      const target = e.target;
      if (!target || target === this.group) return;

      const slotGroup = this.findSlotGroup(target);
      if (!slotGroup) return;

      const [type, indexStr] = slotGroup.name().split('_');
      const index = parseInt(indexStr);

      let item: InventorySlot | Item | null = null;

      if (type === 'hotbar') {
        item = this.inventory.getHotbarSlot(index);
      } else if (type === 'storage') {
        item = this.inventory.getStorageSlot(index);
      } else if (type === 'upgrade') {
        const player = Player.getInstance();
        item = player.getUpgradeInventory().getSlot(index);
      }

      if (!item) return; // Empty slot, can't drag

      // Start dragging
      this.dragState.dragging = true;
      this.dragState.source = type as 'hotbar' | 'storage' | 'upgrade';
      this.dragState.sourceIndex = index;
      this.dragState.draggedSlot = item;

      // Create ghost image at current mouse position
      const stage = this.group.getStage();
      if (stage) {
        const pos = stage.getPointerPosition();
        if (pos) {
          const parentX = this.group.getParent()?.x() || 0;
          const parentY = this.group.getParent()?.y() || 0;
          this.createGhostImage(item, pos.x - this.group.x() - parentX, pos.y - this.group.y() - parentY);
        }
      }
    });

    // Mouse move: move ghost
    this.group.on("mousemove touchmove", (e) => {
      if (!this.dragState.dragging || !this.dragState.ghostImage) return;

      const stage = this.group.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (pos && this.dragState.ghostImage) {
        const parentX = this.group.getParent()?.x() || 0;
        const parentY = this.group.getParent()?.y() || 0;
        this.dragState.ghostImage.position({
          x: pos.x - this.group.x() - parentX,
          y: pos.y - this.group.y() - parentY,
        });
        this.group.getLayer()?.batchDraw();
      }
    });

    // Mouse up: drop
    this.group.on("mouseup touchend", (e) => {
      if (!this.dragState.dragging) return;

      const target = e.target;
      const targetSlot = this.findSlotGroup(target);

      if (targetSlot && this.dragState.source && this.dragState.sourceIndex !== null) {
        const [targetType, targetIndexStr] = targetSlot.name().split('_');
        const targetIndex = parseInt(targetIndexStr);

        // Perform the move/swap
        this.handleDrop(
          this.dragState.source,
          this.dragState.sourceIndex,
          targetType as 'hotbar' | 'storage' | 'upgrade',
          targetIndex
        );
      }

      // Clean up drag state
      this.endDrag();
      this.refresh();
    });
  }

  /**
   * Find the slot group from a clicked element
   */
  private findSlotGroup(node: Konva.Node): Konva.Group | null {
    let current: Konva.Node | null = node;
    while (current && current !== this.group) {
      if (current instanceof Konva.Group && current.name().includes('_')) {
        return current;
      }
      current = current.getParent();
    }
    return null;
  }

  /**
   * Create ghost image for dragging
   */
  private createGhostImage(slot: InventorySlot | Item, x: number = 0, y: number = 0): void {
    const ghost = new Konva.Group({
      x: x,
      y: y,
      opacity: 0.7,
      listening: false,
    });

    const item = 'item' in slot ? slot.item : slot;

    // Use the actual item icon instead of just a colored rectangle
    const icon = item.createIcon(this.SLOT_SIZE);
    icon.x(-this.SLOT_SIZE / 2);
    icon.y(-this.SLOT_SIZE / 2);
    icon.opacity(0.7);
    ghost.add(icon);

    // Add white border
    const border = new Konva.Rect({
      x: -this.SLOT_SIZE / 2,
      y: -this.SLOT_SIZE / 2,
      width: this.SLOT_SIZE,
      height: this.SLOT_SIZE,
      stroke: "#FFF",
      strokeWidth: 2,
      cornerRadius: 3,
    });
    ghost.add(border);

    // Show quantity only for InventorySlot (not single Items like upgrades)
    if ('quantity' in slot) {
      const quantityText = new Konva.Text({
        x: -this.SLOT_SIZE / 2 + 5,
        y: -this.SLOT_SIZE / 2 + this.SLOT_SIZE - 20,
        text: `${slot.quantity}`,
        fontSize: 14,
        fontFamily: "Arial",
        fill: "#FFF",
        fontStyle: "bold",
      });
      ghost.add(quantityText);
    }

    this.group.add(ghost);
    this.dragState.ghostImage = ghost;
  }

  /**
   * Handle dropping an item
   */
  private handleDrop(
    sourceType: 'hotbar' | 'storage' | 'upgrade',
    sourceIndex: number,
    targetType: 'hotbar' | 'storage' | 'upgrade',
    targetIndex: number
  ): void {
    // Same slot, do nothing
    if (sourceType === targetType && sourceIndex === targetIndex) {
      return;
    }

    const player = Player.getInstance();
    const upgradeInv = player.getUpgradeInventory();

    // Perform the move/swap based on source and target
    if (sourceType === 'hotbar' && targetType === 'hotbar') {
      this.inventory.swapHotbarSlots(sourceIndex, targetIndex);
    } else if (sourceType === 'storage' && targetType === 'storage') {
      this.inventory.swapStorageSlots(sourceIndex, targetIndex);
    } else if (sourceType === 'hotbar' && targetType === 'storage') {
      this.inventory.moveHotbarToStorage(sourceIndex, targetIndex);
    } else if (sourceType === 'storage' && targetType === 'hotbar') {
      const success = this.inventory.moveStorageToHotbar(sourceIndex, targetIndex);
      if (!success) {
        console.log("Cannot move upgrades to hotbar!");
      }
    } else if (sourceType === 'upgrade' && targetType === 'storage') {
      // Unequip upgrade to storage
      const upgrade = upgradeInv.unequipUpgrade(sourceIndex);
      if (upgrade) {
        this.inventory.addItem(upgrade, 1);
      }
    } else if (sourceType === 'storage' && targetType === 'upgrade') {
      // Equip upgrade from storage
      const slot = this.inventory.getStorageSlot(sourceIndex);
      if (slot && slot.item.type === 1) { // ItemType.UPGRADE = 1
        const itemToEquip = slot.item;
        const existingUpgrade = upgradeInv.unequipUpgrade(targetIndex);

        // Remove from storage
        this.inventory.removeStorageItem(sourceIndex);

        // Equip the new upgrade
        upgradeInv.equipUpgrade(itemToEquip, targetIndex);

        // Add existing upgrade back to storage (if there was one)
        if (existingUpgrade) {
          this.inventory.addItem(existingUpgrade, 1);
        }
      }
    } else if (sourceType === 'upgrade' && targetType === 'upgrade') {
      // Swap upgrades - need to store both before swapping
      const upgrade1 = upgradeInv.getSlot(sourceIndex);
      const upgrade2 = upgradeInv.getSlot(targetIndex);

      // Unequip both first
      upgradeInv.unequipUpgrade(sourceIndex);
      upgradeInv.unequipUpgrade(targetIndex);

      // Then equip in swapped positions
      if (upgrade1) upgradeInv.equipUpgrade(upgrade1, targetIndex);
      if (upgrade2) upgradeInv.equipUpgrade(upgrade2, sourceIndex);
    }
  }

  /**
   * End drag operation
   */
  private endDrag(): void {
    if (this.dragState.ghostImage) {
      this.dragState.ghostImage.destroy();
    }

    this.dragState = {
      dragging: false,
      source: null,
      sourceIndex: null,
      draggedSlot: null,
      ghostImage: null,
    };
  }

  /**
   * Refresh the inventory display
   */
  refresh(): void {
    // Update hotbar slots
    for (let i = 0; i < this.HOTBAR_COLS; i++) {
      const slot = this.inventory.getHotbarSlot(i);
      this.updateSlotDisplay(this.hotbarSlots[i], slot);
    }

    // Update storage slots
    for (let i = 0; i < this.STORAGE_ROWS * this.STORAGE_COLS; i++) {
      const slot = this.inventory.getStorageSlot(i);
      this.updateSlotDisplay(this.storageSlots[i], slot);
    }

    // Update upgrade slots
    const player = Player.getInstance();
    const upgradeInv = player.getUpgradeInventory();
    for (let i = 0; i < this.UPGRADE_SLOTS; i++) {
      const upgrade = upgradeInv.getSlot(i);
      this.updateUpgradeSlotDisplay(this.upgradeSlots[i], upgrade);
    }

    this.group.getLayer()?.batchDraw();
  }

  /**
   * Update a single slot's display
   */
  private updateSlotDisplay(slotGroup: Konva.Group, slot: InventorySlot | null): void {
    const slotType = slotGroup.name().split('_')[0];

    // Remove old item display
    // Hotbar slots have: [bg, indexText, ...items]
    // Storage slots have: [bg, ...items]
    const keepChildren = slotType === 'hotbar' ? 2 : 1;
    const children = slotGroup.getChildren();
    for (let i = children.length - 1; i >= keepChildren; i--) {
      children[i].destroy();
    }

    if (!slot) return;

    // Add item icon using the item's createIcon method
    const icon = slot.item.createIcon(this.SLOT_SIZE - 10);
    icon.x(5);
    icon.y(5);
    slotGroup.add(icon);

    // Add quantity text
    if (slot.quantity > 1 || slot.item.stackable) {
      const quantityText = new Konva.Text({
        x: this.SLOT_SIZE - 20,
        y: this.SLOT_SIZE - 20,
        text: `${slot.quantity}`,
        fontSize: 14,
        fontFamily: "Arial",
        fill: "#FFF",
        fontStyle: "bold",
        shadowColor: "black",
        shadowBlur: 2,
      });
      slotGroup.add(quantityText);
    }
  }

  /**
   * Update a single upgrade slot's display
   */
  private updateUpgradeSlotDisplay(slotGroup: Konva.Group, upgrade: Item | null): void {
    // Remove old item display (keep bg)
    const children = slotGroup.getChildren();
    for (let i = children.length - 1; i >= 1; i--) {
      children[i].destroy();
    }

    if (!upgrade) return;

    // Add item icon using the item's createIcon method
    const icon = upgrade.createIcon(this.SLOT_SIZE - 10);
    icon.x(5);
    icon.y(5);
    slotGroup.add(icon);
  }

  /**
   * Get the Konva group
   */
  getGroup(): Konva.Group {
    return this.group;
  }

  /**
   * Show inventory UI
   */
  show(): void {
    this.group.visible(true);
    this.refresh();
  }

  /**
   * Hide inventory UI
   */
  hide(): void {
    this.group.visible(false);
    this.group.getLayer()?.batchDraw();
  }

  /**
   * Toggle inventory UI visibility
   */
  toggle(): void {
    if (this.group.visible()) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Destroy inventory UI
   */
  destroy(): void {
    this.endDrag();
    this.group.destroy();
  }
}
