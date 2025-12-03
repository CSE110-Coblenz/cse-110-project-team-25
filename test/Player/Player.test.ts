import { Player } from '../../src/Player/Player';
import { Item } from '../../src/Player/Item';
import { ItemType, ItemRarity } from '../../src/Player/ItemTypes';

describe('Player', () => {
    let player: Player;

    beforeEach(() => {
        // Reset singleton
        (Player as any).instance = null;
        player = Player.getInstance();
    });

    describe('Singleton Pattern', () => {
        it('should return the same instance', () => {
            const instance1 = Player.getInstance();
            const instance2 = Player.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe('Health Management', () => {
        it('should start with 3 health', () => {
            expect(player.getHealth()).toBe(3);
        });

        it('should start with max health of 3', () => {
            expect(player.getMaxHealth()).toBe(3);
        });

        it('should heal player', () => {
            player.takeDamage(2);
            expect(player.getHealth()).toBe(1);
            player.heal(1);
            expect(player.getHealth()).toBe(2);
        });

        it('should not heal beyond max health', () => {
            player.heal(10);
            expect(player.getHealth()).toBe(3);
        });

        it('should take damage', () => {
            player.takeDamage(1);
            expect(player.getHealth()).toBe(2);
        });

        it('should not go below 0 health', () => {
            player.takeDamage(10);
            expect(player.getHealth()).toBe(0);
        });

        it('should detect when dead', () => {
            player.takeDamage(10);
            expect(player.isDead()).toBe(true);
        });

        it('should increase max health up to cap', () => {
            player.setMaxHealth(5);
            expect(player.getMaxHealth()).toBe(5);
        });

        it('should not exceed absolute max health cap (5)', () => {
            player.setMaxHealth(10);
            expect(player.getMaxHealth()).toBe(5);
        });
    });

    describe('Invincibility', () => {
        it('should not take damage when invincible', () => {
            player.toggleInvincibility();
            expect(player.invincibleStatus()).toBe(true);

            player.takeDamage(2);
            expect(player.getHealth()).toBe(3); // No damage taken
        });

        it('should toggle invincibility on and off', () => {
            expect(player.invincibleStatus()).toBe(false);
            player.toggleInvincibility();
            expect(player.invincibleStatus()).toBe(true);
            player.toggleInvincibility();
            expect(player.invincibleStatus()).toBe(false);
        });
    });

    describe('Money Management', () => {
        it('should start with 0 money', () => {
            expect(player.getMoney()).toBe(0);
        });

        it('should add money', () => {
            player.addMoney(100);
            expect(player.getMoney()).toBe(100);
        });

        it('should spend money when sufficient funds', () => {
            player.addMoney(100);
            const success = player.spendMoney(50);
            expect(success).toBe(true);
            expect(player.getMoney()).toBe(50);
        });

        it('should not spend money when insufficient funds', () => {
            player.addMoney(30);
            const success = player.spendMoney(50);
            expect(success).toBe(false);
            expect(player.getMoney()).toBe(30);
        });

        it('should set money directly', () => {
            player.setMoney(500);
            expect(player.getMoney()).toBe(500);
        });

        it('should not allow negative money', () => {
            player.setMoney(-100);
            expect(player.getMoney()).toBe(0);
        });
    });

    describe('Consumable Inventory', () => {
        let healthPotion: Item;

        beforeEach(() => {
            healthPotion = new Item({
                id: 'health_potion',
                name: 'Health Potion',
                description: 'Restores 1 health',
                iconColor: '#FF0000',
                type: ItemType.CONSUMABLE,
                rarity: ItemRarity.COMMON,
                stackable: true,
                maxStack: 5,
                modifiers: { healAmount: 1 },
                price: 50,
            });
        });

        it('should add consumable to inventory', () => {
            const success = player.addConsumable(healthPotion, 2);
            expect(success).toBe(true);

            const slot = player.getConsumableSlot(0);
            expect(slot?.item).toBe(healthPotion);
            expect(slot?.quantity).toBe(2);
        });

        it('should use consumable and apply heal effect', () => {
            player.addConsumable(healthPotion, 1);
            player.takeDamage(2); // Health at 1

            const success = player.useConsumable(0);
            expect(success).toBe(true);
            expect(player.getHealth()).toBe(2);
        });

        it('should remove consumable slot when used up', () => {
            player.addConsumable(healthPotion, 1);
            player.useConsumable(0);

            const slot = player.getConsumableSlot(0);
            expect(slot).toBe(null);
        });
    });

    describe('Upgrade Inventory', () => {
        let damageUpgrade: Item;

        beforeEach(() => {
            damageUpgrade = new Item({
                id: 'double_damage',
                name: 'Double Damage',
                description: '2x damage',
                iconColor: '#FF4500',
                type: ItemType.UPGRADE,
                rarity: ItemRarity.RARE,
                stackable: false,
                maxStack: 1,
                modifiers: { damageMultiplier: 2.0 },
                price: 500,
            });
        });

        it('should equip upgrade', () => {
            const success = player.equipUpgrade(damageUpgrade, 0);
            expect(success).toBe(true);

            const upgrade = player.getUpgradeInventory().getSlot(0);
            expect(upgrade).toBe(damageUpgrade);
        });

        it('should apply damage multiplier from upgrade', () => {
            player.equipUpgrade(damageUpgrade, 0);
            const damage = player.getDamage();
            expect(damage).toBe(2); // Base 1 * 2.0 multiplier
        });

        it('should unequip upgrade', () => {
            player.equipUpgrade(damageUpgrade, 0);
            const unequipped = player.unequipUpgrade(0);
            expect(unequipped).toBe(damageUpgrade);

            const slot = player.getUpgradeInventory().getSlot(0);
            expect(slot).toBe(null);
        });

        it('should stack damage multipliers multiplicatively', () => {
            const secondDamageUpgrade = new Item({
                id: 'damage_amp',
                name: 'Damage Amp',
                description: '1.5x damage',
                iconColor: '#FF0000',
                type: ItemType.UPGRADE,
                rarity: ItemRarity.UNCOMMON,
                stackable: false,
                maxStack: 1,
                modifiers: { damageMultiplier: 1.5 },
                price: 250,
            });

            player.equipUpgrade(damageUpgrade, 0); // 2.0x
            player.equipUpgrade(secondDamageUpgrade, 1); // 1.5x
            const damage = player.getDamage();
            expect(damage).toBe(3); // Base 1 * 2.0 * 1.5 = 3.0
        });
    });

    describe('Money Multiplier from Upgrades', () => {
        it('should apply money multiplier when adding money', () => {
            const moneyUpgrade = new Item({
                id: 'lucky_coin',
                name: 'Lucky Coin',
                description: '1.5x money',
                iconColor: '#FFD700',
                type: ItemType.UPGRADE,
                rarity: ItemRarity.UNCOMMON,
                stackable: false,
                maxStack: 1,
                modifiers: { moneyMultiplier: 1.5 },
                price: 200,
            });

            player.equipUpgrade(moneyUpgrade, 0);
            player.addMoney(100);
            expect(player.getMoney()).toBe(150);
        });
    });

    describe('Reset Health', () => {
        it('should reset health to effective max', () => {
            player.takeDamage(2);
            expect(player.getHealth()).toBe(1);

            player.resetHealth();
            expect(player.getHealth()).toBe(3);
        });

        it('should reset to effective max with upgrades', () => {
            const healthUpgrade = new Item({
                id: 'extra_heart',
                name: 'Extra Heart',
                description: '+1 max health',
                iconColor: '#FF1493',
                type: ItemType.UPGRADE,
                rarity: ItemRarity.COMMON,
                stackable: false,
                maxStack: 1,
                modifiers: { maxHealthBonus: 1 },
                price: 300,
            });

            player.equipUpgrade(healthUpgrade, 0);
            player.takeDamage(2);
            player.resetHealth();
            expect(player.getHealth()).toBe(4); // 3 base + 1 upgrade
        });
    });
});
