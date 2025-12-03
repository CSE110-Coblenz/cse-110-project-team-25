import { ScreenController, type ScreenSwitcher } from "../../types.ts";
import { ShopScreenModel } from "./ShopScreenModel.ts";
import { ShopScreenView } from "./ShopScreenView.ts";
import { ShopInventory } from "../../Shop/ShopInventory.ts";
import { BarteringSystem } from "../../Shop/BarteringSystem.ts";
import { Player } from "../../Player/Player.ts";
import type { Item } from "../../Player/Item.ts";
import { ItemType, ItemRarity } from "../../Player/ItemTypes.ts";

/**
 * Shop screen controller - handles shop logic and bartering
 */
export class ShopScreenController extends ScreenController {
  private model: ShopScreenModel;
  private view: ShopScreenView;
  private screenSwitcher: ScreenSwitcher;
  private shopInventory: ShopInventory;
  private barteringSystem: BarteringSystem;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  // Bartering state
  private currentOfferAmount: number = 0;
  private currentBarteringItem: Item | null = null;
  private lastNPCMessage: string = "";

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.model = new ShopScreenModel();
    this.view = new ShopScreenView();
    this.shopInventory = new ShopInventory();
    this.barteringSystem = new BarteringSystem();

    // Set up back button
    this.view.setBackButtonCallback(() => this.goBack());

    // Set up shopkeep button
    this.view.setShopkeepButtonCallback(() => this.openNPCSelection());

    // Set up NPC back button
    this.view.setNPCBackButtonCallback(() => this.closeNPCSelection());

    // Set up bartering back button
    this.view.setBarteringBackButtonCallback(() => this.exitBartering());

    // Set up bartering callbacks
    this.view.setBarteringCallbacks(
      () => this.makeOffer(),
      () => this.acceptDeal(),
      () => this.walkAway()
    );
  }

  /**
   * Show shop screen and initialize shop
   */
  show(): void {
    // Reset and generate new shop inventory
    this.model.reset();
    this.model.podiumItems = this.shopInventory.generatePodiumItems();
    this.model.npcItems = this.shopInventory.generateNPCItems();

    // Update view
    const player = Player.getInstance();
    this.view.updateMoney(player.getMoney());
    this.view.displayPodiumItems(
      this.model.podiumItems,
      (item) => this.handlePurchase(item),
      (item) => this.shopInventory.getPodiumPrice(item)
    );
    this.view.displayNPCItems(this.model.npcItems, (index) => this.selectNPCItem(index));

    // Initialize inventory UI with player's inventory
    this.view.initInventoryUI(player.getConsumableInventory());

    // Set up keyboard listener for Tab key
    this.setupKeyboardInput();

    this.view.show();
  }

  /**
   * Hide shop screen
   */
  hide(): void {
    this.cleanupKeyboardInput();
    this.view.hide();
  }

  /**
   * Set up keyboard input listeners
   */
  private setupKeyboardInput(): void {
    this.keydownHandler = (e: KeyboardEvent) => {
      // Bartering screen: handle number input
      if (this.model.barteringActive) {
        if (e.key >= "0" && e.key <= "9") {
          this.currentOfferAmount = this.currentOfferAmount * 10 + parseInt(e.key);
          this.view.updateOfferInput(this.currentOfferAmount);
        } else if (e.key === "Backspace") {
          this.currentOfferAmount = Math.floor(this.currentOfferAmount / 10);
          this.view.updateOfferInput(this.currentOfferAmount);
        }
        return;
      }

      // Main shop screen: handle inventory toggle
      if (e.key === "Tab") {
        e.preventDefault();
        this.view.toggleInventoryUI();
      }
    };

    window.addEventListener("keydown", this.keydownHandler);
  }

  /**
   * Clean up keyboard input listeners
   */
  private cleanupKeyboardInput(): void {
    if (this.keydownHandler) {
      window.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = null;
    }
  }

  /**
   * Go back to planet select
   */
  private goBack(): void {
    this.screenSwitcher.switchToScreen({ type: "planetSelect" });
  }

  /**
   * Get view instance
   */
  getView(): ShopScreenView {
    return this.view;
  }

  /**
   * Handle purchase of an item
   */
  private handlePurchase(item: Item): void {
    const player = Player.getInstance();
    const price = this.shopInventory.getPodiumPrice(item);

    // Check if player has enough money (simple comparison)
    if (player.getMoney() < price) {
      console.log(`Not enough gold! Need ${price}g, have ${player.getMoney()}g`);
      return;
    }

    // Deduct money
    player.spendMoney(price);

    // Add item to player inventory
    if (item.type === 0) {
      // Consumable
      player.addConsumable(item, 1);
    } else {
      // Upgrade - find first empty slot
      const upgradeInv = player.getUpgradeInventory();
      let emptySlot = -1;
      for (let i = 0; i < 3; i++) {
        if (upgradeInv.getSlot(i) === null) {
          emptySlot = i;
          break;
        }
      }
      if (emptySlot !== -1) {
        player.equipUpgrade(item, emptySlot);
      } else {
        console.log("No empty upgrade slots! Cannot equip upgrade.");
        // Refund the money
        player.addMoney(price);
        return;
      }
    }

    // Update money display and refresh inventory
    this.view.updateMoney(player.getMoney());
    this.view.refreshInventory();

    // Redisplay podium items to refresh button handlers
    this.view.displayPodiumItems(
      this.model.podiumItems,
      (item) => this.handlePurchase(item),
      (item) => this.shopInventory.getPodiumPrice(item)
    );

    console.log(`Purchased ${item.name} for ${price}g. Remaining: ${player.getMoney()}g`);
  }

  /**
   * Purchase item from podium (fixed price, no bartering)
   */
  purchasePodiumItem(itemIndex: number): boolean {
    const item = this.model.podiumItems[itemIndex];
    if (!item) return false;

    const player = Player.getInstance();
    const price = this.shopInventory.getPodiumPrice(item);

    // Check if player has enough money
    if (!player.spendMoney(price)) {
      console.log("Not enough gold!");
      return false;
    }

    // Add item to player inventory
    if (item.type === 0) {
      // Consumable
      player.addConsumable(item, 1);
    } else {
      // Upgrade - for now, just log (we'll implement upgrade purchase later)
      console.log("Upgrade purchase not yet implemented");
      player.addMoney(price); // Refund for now
      return false;
    }

    // Update money display
    this.view.updateMoney(player.getMoney());
    return true;
  }

  /**
   * Start bartering for NPC item (legacy method - now using random selection)
   * For now, this is a placeholder
   */
  startBartering(itemIndex: number): void {
    const item = this.model.npcItems[itemIndex];
    if (!item) return;

    if (this.model.playerBannedFromNPC) {
      console.log("Shopkeeper refuses to talk to you! Complete a level first.");
      return;
    }

    this.model.selectedNPCItemIndex = itemIndex;
    this.model.barteringActive = true;
    this.model.currentScreen = 'npc_barter';

    const basePrice = this.shopInventory.getBasePrice(item);
    this.barteringSystem.startNegotiation(basePrice);

    console.log(`Started bartering for ${item.name} (Base: ${basePrice}g)`);
    console.log("Bartering UI will be implemented next!");
  }

  /**
   * Open NPC selection screen
   */
  private openNPCSelection(): void {
    if (this.model.playerBannedFromNPC) {
      console.log("The shopkeeper refuses to talk to you! Come back after completing a level.");
      return;
    }

    this.view.showNPCSelection();
  }

  /**
   * Close NPC selection screen
   */
  private closeNPCSelection(): void {
    this.view.hideNPCSelection();
  }

  /**
   * Select an NPC item for bartering
   */
  private selectNPCItem(index: number): void {
    // Highlight selected item
    this.view.highlightNPCItem(index);
    this.model.selectedNPCItemIndex = index;

    // Start bartering immediately after selection
    this.startNPCBartering();
  }

  /**
   * Start NPC bartering (uses selected item)
   */
  private startNPCBartering(): void {
    if (this.model.selectedNPCItemIndex === null) {
      console.warn("No NPC item selected!");
      return;
    }

    const npcItems = this.model.npcItems;
    if (npcItems.length === 0) {
      console.warn("No NPC items available!");
      return;
    }

    this.currentBarteringItem = npcItems[this.model.selectedNPCItemIndex];
    this.model.barteringActive = true;
    this.model.currentScreen = 'npc_barter';

    // Start negotiation
    const basePrice = this.shopInventory.getBasePrice(this.currentBarteringItem);
    this.barteringSystem.startNegotiation(basePrice);

    // Show initial dialogue
    const rarityName = Object.keys(ItemRarity).find(
      key => ItemRarity[key as keyof typeof ItemRarity] === this.currentBarteringItem?.rarity
    ) || 'UNKNOWN';

    this.lastNPCMessage = `Ah, interested in the ${this.currentBarteringItem?.name}? A fine ${rarityName.toLowerCase()} piece! What's your offer?`;
    this.view.updateDialogueText(this.lastNPCMessage);
    this.currentOfferAmount = 0;
    this.view.updateOfferInput(0);
    this.view.showBarteringScreen();
  }

  /**
   * Make an offer during bartering
   */
  private makeOffer(): void {
    if (!this.currentBarteringItem || this.currentOfferAmount <= 0) {
      this.view.updateDialogueText("You need to enter a valid offer amount using the number keys!");
      return;
    }

    const response = this.barteringSystem.processOffer(
      this.currentBarteringItem,
      this.currentOfferAmount
    );

    // Update dialogue with NPC response
    this.lastNPCMessage = response.message;
    this.view.updateDialogueText(response.message);

    // Handle acceptance
    if (response.accepted) {
      setTimeout(() => this.completePurchase(this.currentOfferAmount), 1500);
      return;
    }

    // Handle rejection (banned)
    if (response.rejected) {
      this.model.playerBannedFromNPC = true;
      setTimeout(() => this.exitBartering(), 2000);
      return;
    }

    // Reset offer input for next round
    this.currentOfferAmount = 0;
    this.view.updateOfferInput(0);
  }

  /**
   * Accept the current deal (NPC's counter-offer)
   */
  private acceptDeal(): void {
    const lastCounter = this.barteringSystem.getLastNPCCounter();

    if (lastCounter === undefined) {
      this.view.updateDialogueText("Make an offer first, then we can negotiate!");
      return;
    }

    this.completePurchase(lastCounter);
  }

  /**
   * Complete the purchase at agreed price
   */
  private completePurchase(price: number): void {
    if (!this.currentBarteringItem) return;

    const player = Player.getInstance();

    // Check if player has enough money
    if (!player.spendMoney(price)) {
      this.view.updateDialogueText(`You don't have ${price} gold! Come back when you have the money.`);
      setTimeout(() => this.exitBartering(), 2000);
      return;
    }

    // Add item to inventory
    if (this.currentBarteringItem.type === ItemType.CONSUMABLE) {
      player.addConsumable(this.currentBarteringItem, 1);
    } else if (this.currentBarteringItem.type === ItemType.UPGRADE) {
      // For upgrades, add to storage inventory
      player.getConsumableInventory().addItem(this.currentBarteringItem, 1);
    }

    // Update money display
    this.view.updateMoney(player.getMoney());
    this.view.refreshInventory();

    // Exit bartering after showing success message
    setTimeout(() => this.exitBartering(), 1500);
  }

  /**
   * Walk away from bartering
   */
  private walkAway(): void {
    this.view.updateDialogueText("Come back anytime!");
    setTimeout(() => this.exitBartering(), 1000);
  }

  /**
   * Exit bartering and return to NPC selection
   */
  private exitBartering(): void {
    this.model.barteringActive = false;
    this.model.currentScreen = 'npc_barter';
    this.currentBarteringItem = null;
    this.currentOfferAmount = 0;
    this.model.selectedNPCItemIndex = null;
    this.view.hideBarteringScreen();
  }
}
