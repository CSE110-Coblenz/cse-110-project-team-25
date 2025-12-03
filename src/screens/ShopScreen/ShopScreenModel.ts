import type { Item } from "../../Player/Item.ts";

/**
 * Shop screen model - manages shop state
 */
export class ShopScreenModel {
  // Shop inventory
  podiumItems: Item[] = [];
  npcItems: Item[] = [];

  // Bartering state
  selectedNPCItemIndex: number | null = null;
  barteringActive: boolean = false;
  playerBannedFromNPC: boolean = false;

  // UI state
  currentScreen: 'main' | 'npc_barter' = 'main';

  /**
   * Reset shop state
   */
  reset(): void {
    this.podiumItems = [];
    this.npcItems = [];
    this.selectedNPCItemIndex = null;
    this.barteringActive = false;
    this.currentScreen = 'main';
  }

  /**
   * Get selected NPC item
   */
  getSelectedNPCItem(): Item | null {
    if (this.selectedNPCItemIndex === null) return null;
    return this.npcItems[this.selectedNPCItemIndex] ?? null;
  }

  /**
   * Ban player from NPC until they complete a level
   */
  banFromNPC(): void {
    this.playerBannedFromNPC = true;
  }

  /**
   * Unban player (call when level is completed)
   */
  unbanFromNPC(): void {
    this.playerBannedFromNPC = false;
  }
}
