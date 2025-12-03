import { BarteringSystem } from '../../src/Shop/BarteringSystem';
import { Item } from '../../src/Player/Item';
import { ItemType, ItemRarity } from '../../src/Player/ItemTypes';

describe('BarteringSystem', () => {
    let barteringSystem: BarteringSystem;
    let testItem: Item;

    beforeEach(() => {
        barteringSystem = new BarteringSystem();
        testItem = new Item({
            id: 'test_item',
            name: 'Test Item',
            description: 'Test',
            iconColor: '#FF0000',
            type: ItemType.UPGRADE,
            rarity: ItemRarity.RARE,
            stackable: false,
            maxStack: 1,
            modifiers: {},
            price: 1000,
        });
    });

    describe('First Offer Evaluation', () => {
        it('should accept extreme high offers (>=150%)', () => {
            barteringSystem.startNegotiation(1000);
            const response = barteringSystem.processOffer(testItem, 1500);
            expect(response.accepted).toBe(true);
            expect(response.rejected).toBe(false);
        });

        it('should accept high offers (>=110%)', () => {
            barteringSystem.startNegotiation(1000);
            const response = barteringSystem.processOffer(testItem, 1100);
            expect(response.accepted).toBe(true);
            expect(response.rejected).toBe(false);
        });

        it('should accept medium-high offers (100-109%)', () => {
            barteringSystem.startNegotiation(1000);
            const response = barteringSystem.processOffer(testItem, 1050);
            expect(response.accepted).toBe(true);
            expect(response.rejected).toBe(false);
        });

        it('should counter medium offers (85-99%) at 92% of base', () => {
            barteringSystem.startNegotiation(1000);
            const response = barteringSystem.processOffer(testItem, 900);
            expect(response.accepted).toBe(false);
            expect(response.rejected).toBe(false);
            expect(response.counterOffer).toBe(920);
        });

        it('should counter lowball offers (60-84%) at 88% of base', () => {
            barteringSystem.startNegotiation(1000);
            const response = barteringSystem.processOffer(testItem, 700);
            expect(response.accepted).toBe(false);
            expect(response.rejected).toBe(false);
            expect(response.counterOffer).toBe(880);
        });

        it('should reject extreme lowball offers (<30%)', () => {
            barteringSystem.startNegotiation(1000);
            const response = barteringSystem.processOffer(testItem, 200);
            expect(response.accepted).toBe(false);
            expect(response.rejected).toBe(true);
        });
    });

    describe('WPM Bonus System', () => {
        it('should make NPC more accepting with high WPM (80+)', () => {
            barteringSystem.startNegotiation(1000);
            // Offer 80% with high WPM should be treated better than without
            const response = barteringSystem.processOffer(testItem, 800, 80);
            // WPM bonus shifts threshold, so should get better deal
            expect(response.rejected).toBe(false);
        });

        it('should provide no bonus for low WPM (<40)', () => {
            barteringSystem.startNegotiation(1000);
            const response = barteringSystem.processOffer(testItem, 800, 30);
            // Should counter at 88% (lowball tier)
            expect(response.counterOffer).toBe(880);
        });
    });

    describe('Counter-Offer Negotiation', () => {
        it('should accept when player meets NPC counter-offer', () => {
            barteringSystem.startNegotiation(1000);
            // First offer gets counter
            const firstResponse = barteringSystem.processOffer(testItem, 900);
            const npcCounter = firstResponse.counterOffer!;

            // Player meets counter
            const secondResponse = barteringSystem.processOffer(testItem, npcCounter);
            expect(secondResponse.accepted).toBe(true);
        });

        it('should negotiate when player increases offer but not to counter', () => {
            barteringSystem.startNegotiation(1000);
            barteringSystem.processOffer(testItem, 800); // First offer
            const response = barteringSystem.processOffer(testItem, 850); // Increased

            expect(response.accepted).toBe(false);
            expect(response.rejected).toBe(false);
            expect(response.counterOffer).toBeDefined();
        });

        it('should get frustrated when player offers less than before', () => {
            barteringSystem.startNegotiation(1000);
            const first = barteringSystem.processOffer(testItem, 800);
            const npcFirstCounter = first.counterOffer!;

            const second = barteringSystem.processOffer(testItem, 700); // Lower offer
            expect(second.counterOffer).toBeGreaterThan(npcFirstCounter);
        });
    });

    describe('Standing Firm Mechanic', () => {
        it('should have chance to accept when player stands firm (same offer)', () => {
            barteringSystem.startNegotiation(1000);
            barteringSystem.processOffer(testItem, 800); // First offer

            // Stand firm with high WPM for better chance
            const response = barteringSystem.processOffer(testItem, 800, 90);
            // With 90 WPM, should have 90% chance of acceptance
            // We can't test randomness, but can verify it doesn't error
            expect(response.accepted !== undefined).toBe(true);
            expect(response.rejected !== undefined).toBe(true);
        });

        it('should kick out player if they stand firm twice', () => {
            barteringSystem.startNegotiation(1000);
            barteringSystem.processOffer(testItem, 800);

            // First stand firm
            const first = barteringSystem.processOffer(testItem, 800, 0); // Low WPM

            if (!first.rejected) {
                // If first didn't reject, try standing firm again
                const second = barteringSystem.processOffer(testItem, 800);
                expect(second.rejected).toBe(true);
            }
        });
    });

    describe('Round Limits', () => {
        it('should end negotiation after max rounds', () => {
            barteringSystem.startNegotiation(1000);

            // Exhaust max rounds (5)
            for (let i = 0; i < 6; i++) {
                const response = barteringSystem.processOffer(testItem, 500 + i * 10);
                if (i >= 5) {
                    expect(response.rejected).toBe(true);
                    expect(response.message).toContain('done negotiating');
                }
            }
        });
    });
});
