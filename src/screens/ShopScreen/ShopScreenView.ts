import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import type { Item } from "../../Player/Item.ts";
import { ItemRarity } from "../../Player/ItemTypes.ts";
import { ShopInventoryUI } from "../../ui/ShopInventoryUI.ts";
import type { Inventory } from "../../Player/Inventory.ts";

/**
 * Shop screen view - renders shop UI with inventory management
 */
export class ShopScreenView implements View {
  private group: Konva.Group;
  private background: Konva.Rect;
  private moneyText: Konva.Text;
  private backButton: Konva.Group;
  private shopkeepButton: Konva.Group;

  // Podium item displays (placeholder)
  private podiumItemsGroup: Konva.Group;

  // NPC selection screen
  private npcSelectionGroup: Konva.Group;
  private npcBackButton: Konva.Group;

  // Inventory UI
  private inventoryUI: ShopInventoryUI | null = null;

  // Bartering UI
  private barteringGroup: Konva.Group;
  private barteringBackButton: Konva.Group;
  private dialogueBox: Konva.Group;
  private dialogueText: Konva.Text;
  private offerInput: Konva.Text;
  private offerButtons: Konva.Group;

  constructor() {
    this.group = new Konva.Group({
      x: 0,
      y: 0,
      visible: false,
    });

    // Placeholder background (dark gray until image loads)
    this.background = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#1a1a2e",
    });
    this.group.add(this.background);

    // Background image - loads asynchronously
    Konva.Image.fromURL("./Shop_Backgroud.png", (img) => {
      img.x(0);
      img.y(0);
      img.width(STAGE_WIDTH);
      img.height(STAGE_HEIGHT);
      // Remove the placeholder background
      this.background.destroy();
      // Add image as the new background
      this.group.add(img);
      img.moveToBottom();
      // Redraw to show the image
      this.group.getLayer()?.batchDraw();
      console.log("Shop background image loaded successfully");
    });

    // Money display (keep this)
    this.moneyText = new Konva.Text({
      x: 20,
      y: 10,
      text: "Gold: 0",
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#FFD700",
    });
    this.group.add(this.moneyText);

    // Back button
    this.backButton = this.createButton("Back", 20, STAGE_HEIGHT - 70);
    this.group.add(this.backButton);

    // Talk to Shopkeep button (above back button) - wider with smaller font
    this.shopkeepButton = this.createButton("Talk to Shopkeep", 20, STAGE_HEIGHT - 130, 200, 16);
    this.group.add(this.shopkeepButton);

    // Remove title text - no longer needed with background image

    // Podium items section - keep but hide for now
    this.podiumItemsGroup = new Konva.Group({
      x: 50,
      y: 180,
      visible: false, // Hidden until we add proper shop UI
    });
    this.group.add(this.podiumItemsGroup);

    // NPC selection screen - initially hidden
    this.npcSelectionGroup = new Konva.Group({
      x: 0,
      y: 0,
      visible: false,
    });
    this.group.add(this.npcSelectionGroup);

    // NPC back button
    this.npcBackButton = this.createButton("Back", 20, STAGE_HEIGHT - 70);
    this.npcSelectionGroup.add(this.npcBackButton);

    // Bartering UI - initially hidden
    this.barteringGroup = new Konva.Group({
      x: 0,
      y: 0,
      visible: false,
    });
    this.group.add(this.barteringGroup);

    // Bartering back button
    this.barteringBackButton = this.createButton("Back", 20, STAGE_HEIGHT - 70);
    this.barteringGroup.add(this.barteringBackButton);

    this.createBarteringUI();
  }

  /**
   * Create a simple button
   */
  private createButton(text: string, x: number, y: number, width: number = 150, fontSize: number = 20): Konva.Group {
    const buttonGroup = new Konva.Group({ x, y });

    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: width,
      height: 50,
      fill: "#8B4513",
      cornerRadius: 5,
      shadowColor: "black",
      shadowBlur: 5,
      shadowOffset: { x: 2, y: 2 },
      shadowOpacity: 0.5,
    });

    const label = new Konva.Text({
      x: 0,
      y: 15,
      width: width,
      text: text,
      fontSize: fontSize,
      fontFamily: "Arial",
      fill: "white",
      align: "center",
    });

    buttonGroup.add(bg);
    buttonGroup.add(label);

    // Hover effect
    buttonGroup.on("mouseenter", () => {
      bg.fill("#A0522D");
      buttonGroup.getLayer()?.batchDraw();
    });

    buttonGroup.on("mouseleave", () => {
      bg.fill("#8B4513");
      buttonGroup.getLayer()?.batchDraw();
    });

    return buttonGroup;
  }

  /**
   * Create bartering UI (dialogue box and input system)
   */
  private createBarteringUI(): void {
    const padding = 20;
    const boxWidth = STAGE_WIDTH - padding * 2;
    const boxHeight = 200;
    const boxY = STAGE_HEIGHT / 2 - boxHeight / 2;

    // Dialogue box container
    this.dialogueBox = new Konva.Group({
      x: padding,
      y: boxY,
    });

    // Background box
    const dialogueBg = new Konva.Rect({
      x: 0,
      y: 0,
      width: boxWidth,
      height: boxHeight,
      fill: "#ddd",
      stroke: "#555",
      strokeWidth: 5,
      cornerRadius: 10,
      shadowColor: "black",
      shadowBlur: 10,
      shadowOffsetX: 10,
      shadowOffsetY: 10,
      shadowOpacity: 0.2,
    });

    // Dialogue text
    this.dialogueText = new Konva.Text({
      x: 20,
      y: 20,
      text: "",
      fontSize: 24,
      fontFamily: "Courier New",
      fill: "#555",
      width: boxWidth - 40,
      padding: 10,
      align: "left",
    });

    this.dialogueBox.add(dialogueBg);
    this.dialogueBox.add(this.dialogueText);
    this.barteringGroup.add(this.dialogueBox);

    // Offer input area (below dialogue box)
    const inputY = boxY + boxHeight + 20;

    this.offerInput = new Konva.Text({
      x: padding + 20,
      y: inputY + 15,
      text: "Your offer: 0 gold",
      fontSize: 20,
      fontFamily: "Arial",
      fill: "#FFD700",
    });
    this.barteringGroup.add(this.offerInput);

    // Offer buttons
    this.offerButtons = new Konva.Group({
      x: padding,
      y: inputY + 60,
    });

    // Offer button
    const offerBtn = this.createButton("Make Offer", 0, 0);
    offerBtn.on("click tap", () => {
      // Will be handled by controller
    });

    // Accept button
    const acceptBtn = this.createButton("Accept Deal", 170, 0);
    acceptBtn.on("click tap", () => {
      // Will be handled by controller
    });

    // Decline button
    const declineBtn = this.createButton("Walk Away", 340, 0);
    declineBtn.on("click tap", () => {
      // Will be handled by controller
    });

    this.offerButtons.add(offerBtn);
    this.offerButtons.add(acceptBtn);
    this.offerButtons.add(declineBtn);
    this.barteringGroup.add(this.offerButtons);
  }

  /**
   * Set back button callback
   */
  setBackButtonCallback(callback: () => void): void {
    this.backButton.on("click tap", callback);
  }

  /**
   * Set shopkeep button callback
   */
  setShopkeepButtonCallback(callback: () => void): void {
    this.shopkeepButton.on("click tap", callback);
  }

  /**
   * Set NPC back button callback
   */
  setNPCBackButtonCallback(callback: () => void): void {
    this.npcBackButton.on("click tap", callback);
  }

  /**
   * Set bartering back button callback
   */
  setBarteringBackButtonCallback(callback: () => void): void {
    this.barteringBackButton.on("click tap", callback);
  }

  /**
   * Set bartering offer button callbacks
   */
  setBarteringCallbacks(
    onOffer: () => void,
    onAccept: () => void,
    onDecline: () => void
  ): void {
    const buttons = this.offerButtons.getChildren();
    buttons[0].on("click tap", onOffer);
    buttons[1].on("click tap", onAccept);
    buttons[2].on("click tap", onDecline);
  }

  /**
   * Update money display
   */
  updateMoney(amount: number): void {
    this.moneyText.text(`Gold: ${amount}`);
    this.group.getLayer()?.batchDraw();
  }

  /**
   * Display podium items on shelves (2 items per shelf)
   */
  displayPodiumItems(items: Item[], onPurchase: (item: Item) => void): void {
    this.podiumItemsGroup.destroyChildren();
    this.podiumItemsGroup.visible(true);

    // Shelf positions (approximate based on the background image)
    const topShelfY = -70;
    const bottomShelfY = 180;
    const itemSize = 70;

    // Spacing for 2 items per shelf (evenly distributed)
    const shelfWidth = 1000;
    const spacing = shelfWidth / 3;

    items.forEach((item, index) => {
      // Determine which shelf (top or bottom)
      const isTopShelf = index < 2;
      const shelfY = isTopShelf ? topShelfY : bottomShelfY;

      // Position within the shelf (0 or 1)
      const positionOnShelf = index % 2;
      const itemX = spacing * (positionOnShelf + 1) - itemSize / 2 + 300;

      // Create item group
      const itemGroup = new Konva.Group({
        x: itemX,
        y: shelfY,
      });

      // Border around item and button
      const border = new Konva.Rect({
        x: -5,
        y: -5,
        width: itemSize + 10,
        height: itemSize + 60,
        stroke: "#ffffffff",
        strokeWidth: 2,
        cornerRadius: 5,
      });
      itemGroup.add(border);

      // Create item icon
      const icon = item.createIcon(itemSize);
      itemGroup.add(icon);

      // Price label below item
      const priceText = new Konva.Text({
        x: 0,
        y: itemSize + 5,
        width: itemSize,
        text: `${item.price}g`,
        fontSize: 14,
        fontFamily: "Arial",
        fill: "#FFD700",
        align: "center",
      });
      itemGroup.add(priceText);

      // Purchase button
      const buttonY = itemSize + 25;
      const buttonWidth = itemSize;
      const buttonHeight = 25;

      const buttonBg = new Konva.Rect({
        x: 0,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        fill: "#8B4513",
        cornerRadius: 3,
      });

      const buttonText = new Konva.Text({
        x: 0,
        y: buttonY + 5,
        width: buttonWidth,
        text: "Buy",
        fontSize: 14,
        fontFamily: "Arial",
        fill: "white",
        align: "center",
      });

      const buttonGroup = new Konva.Group();
      buttonGroup.add(buttonBg);
      buttonGroup.add(buttonText);

      // Hover effect
      buttonGroup.on("mouseenter", () => {
        buttonBg.fill("#A0522D");
        this.group.getLayer()?.batchDraw();
      });

      buttonGroup.on("mouseleave", () => {
        buttonBg.fill("#8B4513");
        this.group.getLayer()?.batchDraw();
      });

      // Click handler
      buttonGroup.on("click tap", () => {
        onPurchase(item);
      });

      itemGroup.add(buttonGroup);

      this.podiumItemsGroup.add(itemGroup);
    });

    this.group.getLayer()?.batchDraw();
  }

  /**
   * Display NPC items (3 rare+ upgrades for bartering) - large, centered
   */
  displayNPCItems(items: Item[], onItemClick: (index: number) => void): void {
    // Clear only item groups, not the back button
    // Get all children except the first one (back button)
    const children = this.npcSelectionGroup.getChildren().slice(1);
    children.forEach((child) => {
      child.destroy();
    });

    // Back button is already added to npcSelectionGroup in constructor

    // Display 3 large items centered on screen
    const itemSize = 150;
    const spacing = 220;
    const totalWidth = items.length * itemSize + (items.length - 1) * (spacing - itemSize);
    const startX = (STAGE_WIDTH - totalWidth) / 2;
    const centerY = STAGE_HEIGHT / 2 - 100;

    items.forEach((item, index) => {
      const itemX = startX + index * spacing;

      // Create item group
      const itemGroup = new Konva.Group({
        x: itemX,
        y: centerY,
      });

      // Border (white when selected, transparent otherwise)
      const border = new Konva.Rect({
        x: -10,
        y: -10,
        width: itemSize + 20,
        height: itemSize + 120,
        stroke: "transparent",
        strokeWidth: 4,
        cornerRadius: 10,
      });
      itemGroup.add(border);

      // Store border reference for later selection
      (itemGroup as any)._border = border;
      (itemGroup as any)._itemIndex = index;

      // Create item icon (large)
      const icon = item.createIcon(itemSize);
      itemGroup.add(icon);

      // Item name below icon
      const nameText = new Konva.Text({
        x: 0,
        y: itemSize + 10,
        width: itemSize,
        text: item.name,
        fontSize: 18,
        fontFamily: "Arial",
        fill: "#FFD700",
        align: "center",
        fontStyle: "bold",
      });
      itemGroup.add(nameText);

      // Rarity label
      const rarityName = Object.keys(ItemRarity).find(
        key => ItemRarity[key as keyof typeof ItemRarity] === item.rarity
      ) || 'UNKNOWN';

      const rarityText = new Konva.Text({
        x: 0,
        y: itemSize + 35,
        width: itemSize,
        text: rarityName,
        fontSize: 14,
        fontFamily: "Arial",
        fill: "#FFD700",
        align: "center",
      });
      itemGroup.add(rarityText);

      // Description text
      const descText = new Konva.Text({
        x: -25,
        y: itemSize + 55,
        width: itemSize + 50,
        text: item.description,
        fontSize: 12,
        fontFamily: "Arial",
        fill: "#FFFFFF",
        align: "center",
        wrap: "word",
      });
      itemGroup.add(descText);

      // Click handler
      itemGroup.on("click tap", () => {
        onItemClick(index);
      });

      // Hover effect
      itemGroup.on("mouseenter", () => {
        if (border.stroke() !== "white") {
          border.stroke("#888");
          this.group.getLayer()?.batchDraw();
        }
      });

      itemGroup.on("mouseleave", () => {
        if (border.stroke() !== "white") {
          border.stroke("transparent");
          this.group.getLayer()?.batchDraw();
        }
      });

      this.npcSelectionGroup.add(itemGroup);
    });

    this.group.getLayer()?.batchDraw();
  }

  /**
   * Highlight selected NPC item with white border
   */
  highlightNPCItem(index: number): void {
    // Clear all borders first
    this.npcSelectionGroup.getChildren().forEach((child) => {
      const border = (child as any)._border;
      if (border) {
        border.stroke("transparent");
      }
    });

    // Highlight selected item (skip first child which is back button)
    const itemGroup = this.npcSelectionGroup.getChildren()[index + 1];
    if (itemGroup) {
      const border = (itemGroup as any)._border;
      if (border) {
        border.stroke("white");
      }
    }

    this.group.getLayer()?.batchDraw();
  }

  /**
   * Clear NPC item selection
   */
  clearNPCSelection(): void {
    this.npcSelectionGroup.getChildren().forEach((child) => {
      const border = (child as any)._border;
      if (border) {
        border.stroke("transparent");
      }
    });
    this.group.getLayer()?.batchDraw();
  }

  /**
   * Initialize inventory UI
   */
  initInventoryUI(inventory: Inventory): void {
    if (this.inventoryUI) {
      this.inventoryUI.destroy();
    }

    // Center the inventory UI both horizontally and vertically
    const invUIWidth = 9 * 60 + 8 * 10; // 9 slots * 60px + 8 gaps * 10px
    const invUIHeight = 450; // Approximate height (title + hotbar + storage + upgrades + labels)
    const centerX = STAGE_WIDTH / 2 - invUIWidth / 2;
    const centerY = STAGE_HEIGHT / 2 - invUIHeight / 2;

    this.inventoryUI = new ShopInventoryUI(inventory, centerX, centerY);
    this.inventoryUI.hide(); // Start hidden, show on Tab press
    this.group.add(this.inventoryUI.getGroup());
  }

  /**
   * Toggle inventory UI visibility
   */
  toggleInventoryUI(): void {
    if (this.inventoryUI) {
      this.inventoryUI.toggle();
    }
  }

  /**
   * Refresh inventory display
   */
  refreshInventory(): void {
    if (this.inventoryUI) {
      this.inventoryUI.refresh();
    }
  }

  /**
   * Show NPC selection screen
   */
  showNPCSelection(): void {
    // Hide main shop elements
    this.podiumItemsGroup.visible(false);
    this.backButton.visible(false);
    this.shopkeepButton.visible(false);
    if (this.inventoryUI) {
      this.inventoryUI.hide();
    }

    // Show NPC selection
    this.npcSelectionGroup.visible(true);
    this.group.getLayer()?.batchDraw();
  }

  /**
   * Hide NPC selection screen (back to main shop)
   */
  hideNPCSelection(): void {
    // Show main shop elements
    this.podiumItemsGroup.visible(true);
    this.backButton.visible(true);
    this.shopkeepButton.visible(true);

    // Clear selection and hide
    this.clearNPCSelection();
    this.npcSelectionGroup.visible(false);
    this.group.getLayer()?.batchDraw();
  }

  /**
   * Show bartering screen
   */
  showBarteringScreen(): void {
    // Hide NPC selection
    this.npcSelectionGroup.visible(false);

    // Show bartering UI
    this.barteringGroup.visible(true);
    this.group.getLayer()?.batchDraw();
  }

  /**
   * Hide bartering screen (back to NPC selection)
   */
  hideBarteringScreen(): void {
    // Show NPC selection
    this.npcSelectionGroup.visible(true);

    // Clear NPC selection
    this.clearNPCSelection();

    // Hide bartering UI
    this.barteringGroup.visible(false);
    this.group.getLayer()?.batchDraw();
  }

  /**
   * Update dialogue text in bartering screen
   */
  updateDialogueText(text: string): void {
    this.dialogueText.text(text);
    this.group.getLayer()?.batchDraw();
  }

  /**
   * Update offer input display
   */
  updateOfferInput(amount: number): void {
    this.offerInput.text(`Your offer: ${amount} gold`);
    this.group.getLayer()?.batchDraw();
  }

  // View interface implementation
  getGroup(): Konva.Group {
    return this.group;
  }

  show(): void {
    this.group.visible(true);
    this.group.getLayer()?.batchDraw();
  }

  hide(): void {
    this.group.visible(false);
    this.group.getLayer()?.batchDraw();
  }
}
