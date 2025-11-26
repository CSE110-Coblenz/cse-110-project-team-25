/**
 * Test file to verify Player system works correctly
 * This can be run in the browser console to test items
 */

import { Player } from "./Player/Player.ts";
import ItemRegistry from "./Player/ItemRegistry.ts";

/**
 * Initialize the item registry
 */
export function initItemRegistry(): void {
  ItemRegistry.getInstance();
  console.log("✅ ItemRegistry initialized");
}

/**
 * Test adding items to player inventory
 */
export function testPlayerSystem(): void {
  const player = Player.getInstance();
  const registry = ItemRegistry.getInstance();

  console.log("=== Testing Player System ===");

  // Test adding consumables
  const healthPotion = registry.getItem("health_potion");
  const moneyBag = registry.getItem("money_bag");

  if (healthPotion) {
    const success = player.addConsumable(healthPotion, 3);
    console.log(`Added 3x Health Potion: ${success ? "✅" : "❌"}`);
  }

  if (moneyBag) {
    const success = player.addConsumable(moneyBag, 5);
    console.log(`Added 5x Money Bag: ${success ? "✅" : "❌"}`);
  }

  // Test adding upgrades
  const damageAmp = registry.getItem("damage_amplifier");
  const luckyToken = registry.getItem("money_multiplier");
  const enemyWeakener = registry.getItem("enemy_weakener");

  if (damageAmp) {
    const success = player.equipUpgrade(damageAmp, 0);
    console.log(`Equipped Damage Amplifier: ${success ? "✅" : "❌"}`);
  }

  if (luckyToken) {
    const success = player.equipUpgrade(luckyToken, 1);
    console.log(`Equipped Lucky Coin: ${success ? "✅" : "❌"}`);
  }

  if (enemyWeakener) {
    const success = player.equipUpgrade(enemyWeakener, 2);
    console.log(`Equipped Enemy Weakener: ${success ? "✅" : "❌"}`);
  }

  // Test modifiers
  console.log("\n=== Player Stats ===");
  console.log(`Health: ${player.getHealth()}/${player.getEffectiveMaxHealth()}`);
  console.log(`Money: $${player.getMoney()}`);
  console.log(`Damage: ${player.getDamage()}x`);
  console.log(`Money Multiplier: ${player.getMoneyMultiplier()}x`);
  console.log(`Damage Multiplier: ${player.getDamageMultiplier()}x`);
  console.log(`Enemy Health Multiplier: ${player.getEnemyHealthMultiplier()}x`);

  // Test consumable usage
  console.log("\n=== Testing Consumables ===");
  player.takeDamage(2); // Lose 2 health
  console.log(`Health after damage: ${player.getHealth()}/${player.getEffectiveMaxHealth()}`);

  player.useConsumable(0); // Use health potion in slot 0
  console.log(`Health after potion: ${player.getHealth()}/${player.getEffectiveMaxHealth()}`);

  const beforeMoney = player.getMoney();
  player.useConsumable(1); // Use money bag in slot 1
  console.log(`Money before: $${beforeMoney}, after: $${player.getMoney()}`);

  console.log("\n=== Test Complete ===");
}

// Make functions available globally for console testing
if (typeof window !== "undefined") {
  (window as any).testPlayerSystem = testPlayerSystem;
  (window as any).initItemRegistry = initItemRegistry;
  (window as any).Player = Player;
  (window as any).ItemRegistry = ItemRegistry;
}
