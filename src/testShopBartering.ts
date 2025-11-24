import { BarteringSystem } from "./Shop/BarteringSystem.ts";
import { ShopInventory } from "./Shop/ShopInventory.ts";
import { Item } from "./Player/Item.ts";
import { ItemRarity } from "./Player/ItemTypes.ts";

/**
 * Console-based test for shop bartering system
 * Run this in the browser console after the app loads:
 * > testShopBartering()
 */
export function testShopBartering(): void {
  console.log("=".repeat(60));
  console.log("SHOP BARTERING SYSTEM TEST");
  console.log("=".repeat(60));

  const bartering = new BarteringSystem();
  const shopInventory = new ShopInventory();

  // Create a test item
  const testItem: Item | undefined = shopInventory.getUpgrades()[0];

  if (!testItem) {
    console.error("No test items available! Make sure ItemRegistry has items with rarity.");
    return;
  }

  const basePrice = shopInventory.getBasePrice(testItem);

  const rarityName = Object.keys(ItemRarity).find(key => ItemRarity[key as keyof typeof ItemRarity] === testItem.rarity) || 'UNKNOWN';

  console.log(`\nTest Item: ${testItem.name}`);
  console.log(`Rarity: ${rarityName}`);
  console.log(`Base Price: ${basePrice} gold`);
  console.log("\n" + "=".repeat(60));

  // Test initial offers at different tiers
  console.log("\nTEST 1: Initial Offer Tiers (No WPM Bonus)");
  console.log("=".repeat(60));
  testInitialOffers(bartering, testItem, basePrice);

  console.log("\n" + "=".repeat(60));
  console.log("TEST 2: Full Negotiation (No WPM)");
  console.log("=".repeat(60));
  testFullNegotiation(bartering, testItem, basePrice, undefined);

  console.log("\n" + "=".repeat(60));
  console.log("TEST 3: Full Negotiation (80 WPM - High Bonus)");
  console.log("=".repeat(60));
  testFullNegotiation(bartering, testItem, basePrice, 80);

  console.log("\n" + "=".repeat(60));
  console.log("TEST 4: Player Lowballs Again (NPC Gets Frustrated)");
  console.log("=".repeat(60));
  testFrustratedNPC(bartering, testItem, basePrice);

  console.log("\n" + "=".repeat(60));
  console.log("Test complete! Type testShopBartering() to run again.");
  console.log("=".repeat(60));
}

/**
 * Test initial offer tiers
 */
function testInitialOffers(
  bartering: BarteringSystem,
  item: Item,
  basePrice: number
): void {
  const testOffers = [
    { name: "Extreme Highball", amount: Math.floor(basePrice * 1.6) },
    { name: "Highball", amount: Math.floor(basePrice * 1.2) },
    { name: "Medium-High (just above base)", amount: Math.floor(basePrice * 1.05) },
    { name: "Exact Base Price", amount: Math.floor(basePrice) },
    { name: "Medium (just under)", amount: Math.floor(basePrice * 0.9) },
    { name: "Lowball", amount: Math.floor(basePrice * 0.7) },
    { name: "Extreme Lowball", amount: Math.floor(basePrice * 0.45) },
    { name: "Extreme Extreme Lowball", amount: Math.floor(basePrice * 0.2) },
  ];

  testOffers.forEach(({ name, amount }) => {
    bartering.startNegotiation(basePrice);
    console.log(`\n${name}: ${amount} gold (${Math.round((amount / basePrice) * 100)}%)`);
    console.log("-".repeat(60));

    const response = bartering.processOffer(item, amount);
    console.log(`NPC says: "${response.message}"`);

    if (response.accepted) {
      console.log("✅ DEAL ACCEPTED!");
    } else if (response.rejected) {
      console.log("❌ REJECTED - Kicked out!");
    } else if (response.counterOffer) {
      console.log(`💰 Counter-offer: ${response.counterOffer} gold`);
    }
  });
}

/**
 * Test full negotiation flow with meet-halfway logic
 */
function testFullNegotiation(
  bartering: BarteringSystem,
  item: Item,
  basePrice: number,
  playerWPM?: number
): void {
  bartering.startNegotiation(basePrice);

  console.log(`\nNegotiating for: ${item.name} (Base: ${basePrice} gold)`);
  if (playerWPM) {
    console.log(`Player WPM: ${playerWPM} (${Math.round(bartering['calculateWPMBonus'](playerWPM) * 100)}% bonus)`);
  }
  console.log("Starting negotiation...\n");

  // Round 1: Player lowballs (70%)
  const offer1 = Math.floor(basePrice * 0.7);
  console.log(`[Round 1] Player offers: ${offer1} gold (70%)`);
  let response = bartering.processOffer(item, offer1, playerWPM);
  console.log(`NPC: "${response.message}"`);
  if (response.counterOffer) {
    console.log(`💰 NPC counters at: ${response.counterOffer} gold\n`);
  }

  if (response.accepted || response.rejected) return;

  // Round 2: Player increases offer (85%)
  const offer2 = Math.floor(basePrice * 0.85);
  console.log(`[Round 2] Player offers: ${offer2} gold (85%)`);
  response = bartering.processOffer(item, offer2, playerWPM);
  console.log(`NPC: "${response.message}"`);
  if (response.counterOffer) {
    console.log(`💰 NPC counters at: ${response.counterOffer} gold (meeting halfway!)\n`);
  }

  if (response.accepted || response.rejected) return;

  // Round 3: Player accepts NPC's counter
  const offer3 = response.counterOffer!;
  console.log(`[Round 3] Player accepts NPC's counter: ${offer3} gold`);
  response = bartering.processOffer(item, offer3, playerWPM);
  console.log(`NPC: "${response.message}"`);

  if (response.accepted) {
    console.log(`\n✅ DEAL CLOSED at ${offer3} gold!`);
    console.log(`Final price: ${Math.round((offer3 / basePrice) * 100)}% of base`);
  }
}

/**
 * Test NPC frustration when player keeps lowballing
 */
function testFrustratedNPC(
  bartering: BarteringSystem,
  item: Item,
  basePrice: number
): void {
  bartering.startNegotiation(basePrice);

  console.log(`\nNegotiating for: ${item.name} (Base: ${basePrice} gold)`);
  console.log("Player will lowball repeatedly...\n");

  // Round 1: Lowball
  const offer1 = Math.floor(basePrice * 0.7);
  console.log(`[Round 1] Player offers: ${offer1} gold`);
  let response = bartering.processOffer(item, offer1);
  console.log(`NPC: "${response.message}"`);
  if (response.counterOffer) {
    console.log(`💰 Counter: ${response.counterOffer} gold\n`);
  }

  // Round 2: Player offers SAME or LOWER (wasting time)
  const offer2 = Math.floor(basePrice * 0.65);
  console.log(`[Round 2] Player offers LOWER: ${offer2} gold (going backwards!)`);
  response = bartering.processOffer(item, offer2);
  console.log(`NPC: "${response.message}"`);
  if (response.counterOffer) {
    console.log(`💰 Counter INCREASED to: ${response.counterOffer} gold (punishment!)\n`);
  }

  console.log("⚠️ NPC is frustrated! Price went UP because player lowballed again.");
}

/**
 * Test shop inventory generation
 */
export function testShopInventory(): void {
  console.log("=".repeat(60));
  console.log("SHOP INVENTORY TEST");
  console.log("=".repeat(60));

  const shop = new ShopInventory();

  console.log("\nPODIUM ITEMS (4 random consumables + common/uncommon upgrades):");
  console.log("-".repeat(60));
  const podiumItems = shop.generatePodiumItems();
  podiumItems.forEach((item, i) => {
    const rarityName = Object.keys(ItemRarity).find(key => ItemRarity[key as keyof typeof ItemRarity] === item.rarity) || 'UNKNOWN';
    console.log(`${i + 1}. ${item.name} [${rarityName}] - ${shop.getPodiumPrice(item)} gold`);
    console.log(`   Type: ${item.type === 0 ? 'CONSUMABLE' : 'UPGRADE'}`);
    console.log(`   ${item.description}`);
  });

  console.log("\nNPC ITEMS (3 random rare/epic/legendary upgrades):");
  console.log("-".repeat(60));
  const npcItems = shop.generateNPCItems();
  npcItems.forEach((item, i) => {
    const rarityName = Object.keys(ItemRarity).find(key => ItemRarity[key as keyof typeof ItemRarity] === item.rarity) || 'UNKNOWN';
    console.log(`${i + 1}. ${item.name} [${rarityName}] - ${shop.getBasePrice(item)} gold (Base)`);
    console.log(`   Type: ${item.type === 0 ? 'CONSUMABLE' : 'UPGRADE'}`);
    console.log(`   ${item.description}`);
  });

  console.log("\n" + "=".repeat(60));
}
