import { Item } from "./Item.ts";
import { Inventory, type InventorySlot } from "./Inventory.ts";
import { UpgradeInventory } from "./UpgradeInventory.ts";
import { type PlayerStats, createDefaultStats } from "./PlayerStats.ts";

/**
 * Serialized player data for save/load
 */
export interface PlayerSaveData {
  health: number;
  maxHealth: number;
  money: number;
  consumableInventory: any;
  upgradeInventory: any;
  stats: PlayerStats;
}

/**
 * Player singleton class
 * Manages player stats, inventory, and modifiers
 * Replaces old Health and Money singletons
 */
export class Player {
  private static instance: Player | null = null;

  // Core stats
  private health: number;
  private maxHealth: number;
  private money: number;
  private invincible = false;

  // Inventory systems
  private consumableInventory: Inventory;
  private upgradeInventory: UpgradeInventory;

  // Statistics
  private stats: PlayerStats;

  // Damage system
  private baseDamage: number = 1; // Base damage per correct word

  // Max health cap
  private static readonly ABSOLUTE_MAX_HEALTH = 6;

  private constructor() {
    this.health = 3;
    this.maxHealth = 3;
    this.money = 0;
    this.consumableInventory = new Inventory();
    this.upgradeInventory = new UpgradeInventory();
    this.stats = createDefaultStats();
  }

  /**
   * Get the singleton Player instance
   */
  static getInstance(): Player {
    if (!Player.instance) {
      Player.instance = new Player();
    }
    return Player.instance;
  }

  /**
   * Reset player instance (for testing or new game)
   */
  static resetInstance(): void {
    Player.instance = null;
  }

  // ==================== HEALTH MANAGEMENT ====================

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  /**
   * Get max health with upgrade bonuses applied
   */
  getEffectiveMaxHealth(): number {
    const modifiers = this.upgradeInventory.getAllModifiers();
    const bonus = modifiers.maxHealthBonus || 0;
    return this.maxHealth + bonus;
  }

  /**
   * Set max health (also heals to new max if health is full)
   * Capped at ABSOLUTE_MAX_HEALTH
   */
  setMaxHealth(value: number): void {
    const wasFull = this.health >= this.maxHealth;
    this.maxHealth = Math.max(1, Math.min(Player.ABSOLUTE_MAX_HEALTH, value));
    if (wasFull) {
      this.health = this.maxHealth;
    }
  }

  /**
   * Toggle invincibility state
   */
  toggleInvincibility(): void {
    this.invincible = !this.invincible;
  }

  /**
   * Check if player is invincible
   */
  invincibleStatus(): boolean {
    return this.invincible;
  }

  /**
   * Take damage (reduces health)
   */
  takeDamage(amount: number): void {
    if (this.invincible) {
      return;
    }
    this.health = Math.max(0, this.health - amount);
  }

  /**
   * Heal player
   */
  heal(amount: number): void {
    const effectiveMax = this.getEffectiveMaxHealth();
    this.health = Math.min(effectiveMax, this.health + amount);
  }

  /**
   * Check if player is dead
   */
  isDead(): boolean {
    return this.health <= 0;
  }

  /**
   * Reset health to max (called on level start or death)
   */
  resetHealth(): void {
    this.health = this.getEffectiveMaxHealth();
  }

  // ==================== MONEY MANAGEMENT ====================

  getMoney(): number {
    return this.money;
  }

  /**
   * Add money with modifiers applied
   */
  addMoney(baseAmount: number): void {
    const multiplier = this.getMoneyMultiplier();
    const actualAmount = Math.floor(baseAmount * multiplier);
    this.money += actualAmount;
  }

  /**
   * Spend money (returns false if insufficient funds)
   */
  spendMoney(amount: number): boolean {
    if (this.money < amount) {
      return false;
    }
    this.money -= amount;
    return true;
  }

  /**
   * Set money directly (for loading saves)
   */
  setMoney(amount: number): void {
    this.money = Math.max(0, amount);
  }

  // ==================== DAMAGE SYSTEM ====================

  /**
   * Get damage dealt per correct word with modifiers applied
   */
  getDamage(): number {
    const multiplier = this.getDamageMultiplier();
    return Math.floor(this.baseDamage * multiplier);
  }

  /**
   * Set base damage
   */
  setBaseDamage(damage: number): void {
    this.baseDamage = Math.max(1, damage);
  }

  // ==================== CONSUMABLE INVENTORY ====================

  /**
   * Add consumable item to inventory
   */
  addConsumable(item: Item, quantity: number = 1): boolean {
    return this.consumableInventory.addItem(item, quantity);
  }

  /**
   * Remove consumable from specific slot
   */
  removeConsumable(slotIndex: number): Item | null {
    return this.consumableInventory.removeHotbarItem(slotIndex);
  }

  /**
   * Use consumable in specific slot (1-9)
   */
  useConsumable(slotIndex: number): boolean {
    return this.consumableInventory.useItem(slotIndex, this);
  }

  /**
   * Get consumable inventory
   */
  getConsumableInventory(): Inventory {
    return this.consumableInventory;
  }

  /**
   * Get consumable slot
   */
  getConsumableSlot(slotIndex: number): InventorySlot | null {
    return this.consumableInventory.getSlot(slotIndex);
  }

  // ==================== UPGRADE INVENTORY ====================

  /**
   * Equip upgrade in specific slot (0-2)
   */
  equipUpgrade(item: Item, slot: number): boolean {
    return this.upgradeInventory.equipUpgrade(item, slot);
  }

  /**
   * Unequip upgrade from specific slot
   */
  unequipUpgrade(slot: number): Item | null {
    return this.upgradeInventory.unequipUpgrade(slot);
  }

  /**
   * Get upgrade inventory
   */
  getUpgradeInventory(): UpgradeInventory {
    return this.upgradeInventory;
  }

  /**
   * Get all equipped upgrades
   */
  getEquippedUpgrades(): Item[] {
    return this.upgradeInventory.getEquippedUpgrades();
  }

  // ==================== MODIFIER CALCULATIONS ====================

  /**
   * Get money multiplier from all equipped upgrades
   */
  getMoneyMultiplier(): number {
    const modifiers = this.upgradeInventory.getAllModifiers();
    return modifiers.moneyMultiplier || 1.0;
  }

  /**
   * Get damage multiplier from all equipped upgrades
   */
  getDamageMultiplier(): number {
    const modifiers = this.upgradeInventory.getAllModifiers();
    return modifiers.damageMultiplier || 1.0;
  }

  /**
   * Get enemy health multiplier (applied when enemies spawn)
   */
  getEnemyHealthMultiplier(): number {
    const modifiers = this.upgradeInventory.getAllModifiers();
    return modifiers.enemyHealthMultiplier || 1.0;
  }

  /**
   * Get enemy speed multiplier (applied when enemies spawn)
   */
  getEnemySpeedMultiplier(): number {
    const modifiers = this.upgradeInventory.getAllModifiers();
    return modifiers.enemySpeedMultiplier || 1.0;
  }

  // ==================== STATISTICS ====================

  /**
   * Record a word typed
   */
  recordWordTyped(): void {
    this.stats.totalWordsTyped++;
  }

  /**
   * Record an enemy defeated
   */
  recordEnemyDefeated(): void {
    this.stats.totalEnemiesDefeated++;
  }

  /**
   * Get player statistics
   */
  getStats(): PlayerStats {
    return { ...this.stats };
  }

  // ==================== PERSISTENCE ====================

  /**
   * Serialize player to JSON for save
   */
  toJSON(): PlayerSaveData {
    return {
      health: this.health,
      maxHealth: this.maxHealth,
      money: this.money,
      consumableInventory: this.consumableInventory.toJSON(),
      upgradeInventory: this.upgradeInventory.toJSON(),
      stats: this.stats,
    };
  }

  /**
   * Load player from JSON data
   * Requires ItemRegistry for reconstructing items
   */
  static fromJSON(data: PlayerSaveData, itemRegistry: Map<string, Item>): Player {
    const player = Player.getInstance();
    player.health = data.health;
    player.maxHealth = data.maxHealth;
    player.money = data.money;
    player.consumableInventory = Inventory.fromJSON(data.consumableInventory, itemRegistry);
    player.upgradeInventory = UpgradeInventory.fromJSON(data.upgradeInventory, itemRegistry);
    player.stats = data.stats;
    return player;
  }

  /**
   * Reset player state (health to max, keeps items/money/stats)
   */
  reset(): void {
    this.resetHealth();
  }

  /**
   * Full reset (clear everything - for new game)
   */
  fullReset(): void {
    this.health = 3;
    this.maxHealth = 3;
    this.money = 0;
    this.consumableInventory.clear();
    this.upgradeInventory.clear();
    this.stats = createDefaultStats();
  }
}
