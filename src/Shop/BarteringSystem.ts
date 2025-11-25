import type { Item } from "../Player/Item.ts";

/**
 * Offer tiers based on percentage of base price (FIRST offer only)
 */
export type OfferTier =
  | 'extreme_high'      // >= 150%
  | 'high'              // >= 110%
  | 'medium_high'       // 100-109%
  | 'medium'            // 85-99%
  | 'lowball'           // 60-84%
  | 'extreme_low'       // 30-59%
  | 'extreme_extreme_low'; // < 30%

/**
 * NPC response to player's offer
 */
export interface NPCResponse {
  tier: OfferTier | 'counter_response';
  message: string;
  counterOffer?: number; // undefined if rejected or accepted
  accepted: boolean;
  rejected: boolean;
}

/**
 * Negotiation state for tracking back-and-forth
 */
interface NegotiationState {
  basePrice: number;
  lastPlayerOffer: number;
  lastNPCCounter?: number;
  round: number;
  hasStoodFirm: boolean; // Track if player already stood firm once
}

/**
 * Bartering system for shop NPC interactions
 * Handles offer evaluation, counter-offers, and flexible negotiation with WPM bonus
 */
export class BarteringSystem {
  private negotiationState: NegotiationState | null = null;
  private readonly MAX_ROUNDS = 5;

  /**
   * Start a new negotiation session
   */
  startNegotiation(basePrice: number): void {
    this.negotiationState = {
      basePrice,
      lastPlayerOffer: 0,
      lastNPCCounter: undefined,
      round: 0,
      hasStoodFirm: false,
    };
  }

  /**
   * Process player's offer and generate NPC response
   * Handles both initial offers and counter-offers during negotiation
   */
  processOffer(
    item: Item,
    playerOffer: number,
    playerWPM?: number
  ): NPCResponse {
    if (!this.negotiationState) {
      throw new Error("Negotiation not started! Call startNegotiation() first.");
    }

    const state = this.negotiationState;
    state.round++;

    // Check if max rounds exceeded
    if (state.round > this.MAX_ROUNDS) {
      return {
        tier: 'counter_response',
        message: "I'm done negotiating. The price is final!",
        rejected: true,
        accepted: false,
      };
    }

    // FIRST OFFER: Evaluate based on base price tiers
    if (state.lastNPCCounter === undefined) {
      return this.handleFirstOffer(item, playerOffer, state, playerWPM);
    }

    // SUBSEQUENT OFFERS: Handle counter-negotiation
    return this.handleCounterOffer(item, playerOffer, state, playerWPM);
  }

  /**
   * Handle player's first offer
   */
  private handleFirstOffer(
    item: Item,
    playerOffer: number,
    state: NegotiationState,
    playerWPM?: number
  ): NPCResponse {
    const tier = this.evaluateFirstOffer(playerOffer, state.basePrice, playerWPM);
    state.lastPlayerOffer = playerOffer;

    switch (tier) {
      case 'extreme_high':
        return {
          tier,
          message: `${playerOffer} gold?! You're too generous, friend! Deal! *shopkeeper is very excited*`,
          accepted: true,
          rejected: false,
        };

      case 'high':
        return {
          tier,
          message: `${playerOffer} gold for ${item.name}? Pleasure doing business with you!`,
          accepted: true,
          rejected: false,
        };

      case 'medium_high': {
        // 100-109%: NPC accepts immediately (was too stingy before)
        return {
          tier,
          message: `${playerOffer} gold for ${item.name}? That's fair. You got a deal!`,
          accepted: true,
          rejected: false,
        };
      }

      case 'medium': {
        // 85-99%: NPC counters at 92% of base (more willing to negotiate)
        const counter = Math.floor(state.basePrice * 0.92);
        state.lastNPCCounter = counter;
        return {
          tier,
          message: `Hmm, ${playerOffer} gold is a bit low. How about ${counter} gold?`,
          counterOffer: counter,
          accepted: false,
          rejected: false,
        };
      }

      case 'lowball': {
        // 60-84%: NPC counters at 88% of base (was 96%, now more generous)
        const counter = Math.floor(state.basePrice * 0.88);
        state.lastNPCCounter = counter;
        return {
          tier,
          message: `${playerOffer} gold? That's quite the lowball! I'll need at least ${counter} gold for this ${item.name}.`,
          counterOffer: counter,
          accepted: false,
          rejected: false,
        };
      }

      case 'extreme_low': {
        // 30-59%: NPC angry, counters at 150% (punishment)
        const counter = Math.floor(state.basePrice * 1.5);
        state.lastNPCCounter = counter;
        return {
          tier,
          message: `${playerOffer} gold?! Are you trying to insult me? The price is now ${counter} gold. Take it or leave it!`,
          counterOffer: counter,
          accepted: false,
          rejected: false,
        };
      }

      case 'extreme_extreme_low':
        return {
          tier,
          message: `GET OUT! ${playerOffer} gold for a ${item.name}?! Come back when you learn some respect! *shopkeeper kicks you out*`,
          accepted: false,
          rejected: true,
        };
    }
  }

  /**
   * Handle subsequent offers (player responding to NPC's counter)
   */
  private handleCounterOffer(
    item: Item,
    playerOffer: number,
    state: NegotiationState,
    playerWPM?: number
  ): NPCResponse {
    const npcCounter = state.lastNPCCounter!;

    // Player meets or exceeds NPC's counter → Accept
    if (playerOffer >= npcCounter) {
      return {
        tier: 'counter_response',
        message: `${playerOffer} gold? You got yourself a deal!`,
        accepted: true,
        rejected: false,
      };
    }

    // Player is making progress (offered more than last time)
    const isMovingUp = playerOffer > state.lastPlayerOffer;

    // Player offered between their last offer and NPC's counter → Meet halfway
    if (isMovingUp && playerOffer > state.lastPlayerOffer) {
      const newCounter = this.calculateFlexibleCounter(
        playerOffer,
        npcCounter,
        state.basePrice,
        playerWPM
      );

      state.lastPlayerOffer = playerOffer;
      state.lastNPCCounter = newCounter;

      return {
        tier: 'counter_response',
        message: `${playerOffer} gold... You drive a hard bargain. How about we settle on ${newCounter} gold?`,
        counterOffer: newCounter,
        accepted: false,
        rejected: false,
      };
    }

    // Player stands firm (offers same amount as before)
    if (playerOffer === state.lastPlayerOffer) {
      // If player already stood firm once, kick them out
      if (state.hasStoodFirm) {
        return {
          tier: 'counter_response',
          message: `You're wasting my time! I already told you my price. GET OUT!`,
          accepted: false,
          rejected: true,
        };
      }

      // First time standing firm - chance-based acceptance
      state.hasStoodFirm = true;
      const acceptChance = this.calculateStandFirmChance(playerWPM);
      const roll = Math.random();

      if (roll < acceptChance) {
        // Shopkeeper accepts!
        return {
          tier: 'counter_response',
          message: `*sigh* You're stubborn, I'll give you that. ${playerOffer} gold it is. Deal!`,
          accepted: true,
          rejected: false,
        };
      } else {
        // Shopkeeper rejects and kicks out
        return {
          tier: 'counter_response',
          message: `I've made my offer clear. If you're not willing to negotiate, then we're done here. GET OUT!`,
          accepted: false,
          rejected: true,
        };
      }
    }

    // Player is lowballing (offered less than last time) → NPC gets frustrated
    if (playerOffer < state.lastPlayerOffer) {
      const increasedCounter = Math.floor(npcCounter * 1.1); // Increase by 10%
      state.lastNPCCounter = increasedCounter;
      return {
        tier: 'counter_response',
        message: `${playerOffer} gold? You're wasting my time! The price is now ${increasedCounter} gold, final offer!`,
        counterOffer: increasedCounter,
        accepted: false,
        rejected: false,
      };
    }

    // Fallback: not enough progress
    return {
      tier: 'counter_response',
      message: `${playerOffer} gold is still too low. My offer of ${npcCounter} gold stands.`,
      counterOffer: npcCounter,
      accepted: false,
      rejected: false,
    };
  }

  /**
   * Evaluate player's first offer against base price
   */
  private evaluateFirstOffer(
    offer: number,
    basePrice: number,
    playerWPM?: number
  ): OfferTier {
    let percentage = (offer / basePrice) * 100;

    // WPM bonus: shift thresholds downward (make NPC more accepting)
    const wpmBonus = this.calculateWPMBonus(playerWPM);
    percentage += wpmBonus * 5; // Up to 7.5% threshold shift at high WPM

    if (percentage >= 150) return 'extreme_high';
    if (percentage >= 110) return 'high';
    if (percentage >= 100) return 'medium_high';
    if (percentage >= 85) return 'medium';
    if (percentage >= 60) return 'lowball';
    if (percentage >= 30) return 'extreme_low';
    return 'extreme_extreme_low';
  }

  /**
   * Calculate flexible counter-offer (meet halfway with WPM bonus)
   */
  private calculateFlexibleCounter(
    playerOffer: number,
    npcCounter: number,
    basePrice: number,
    playerWPM?: number
  ): number {
    // Base halfway point
    const halfway = Math.floor((playerOffer + npcCounter) / 2);

    // Apply WPM bonus: NPC moves closer to player's offer
    const wpmBonus = this.calculateWPMBonus(playerWPM);
    const adjustment = Math.floor((halfway - playerOffer) * wpmBonus);
    const finalCounter = halfway - adjustment;

    // Never go below player's offer or above base price
    return Math.max(playerOffer, Math.min(finalCounter, basePrice));
  }

  /**
   * Calculate WPM bonus multiplier (0.0 to 0.3)
   * Higher WPM = NPC more willing to negotiate down
   */
  private calculateWPMBonus(playerWPM?: number): number {
    if (!playerWPM) return 0;

    if (playerWPM >= 80) return 0.3;  // 30% bonus
    if (playerWPM >= 60) return 0.2;  // 20% bonus
    if (playerWPM >= 40) return 0.1;  // 10% bonus
    return 0; // No bonus
  }

  /**
   * Calculate chance of shopkeeper accepting when player stands firm
   * Based on WPM: higher WPM = higher chance
   */
  private calculateStandFirmChance(playerWPM?: number): number {
    if (!playerWPM) return 0.33; // 33% base chance

    if (playerWPM >= 80) return 0.90; // 90% chance
    if (playerWPM >= 60) return 0.75; // 75% chance
    if (playerWPM >= 40) return 0.50; // 50% chance
    return 0.33; // 33% chance for low WPM
  }

  /**
   * Get current negotiation round
   */
  getCurrentRound(): number {
    return this.negotiationState?.round ?? 0;
  }

  /**
   * Get last NPC counter-offer
   */
  getLastNPCCounter(): number | undefined {
    return this.negotiationState?.lastNPCCounter;
  }

  /**
   * Get last player offer
   */
  getLastPlayerOffer(): number {
    return this.negotiationState?.lastPlayerOffer ?? 0;
  }

  /**
   * Check if negotiations should be forced to end
   */
  shouldForceEnd(): boolean {
    return (this.negotiationState?.round ?? 0) >= this.MAX_ROUNDS;
  }
}
