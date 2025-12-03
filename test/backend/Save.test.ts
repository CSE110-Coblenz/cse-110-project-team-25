import { Save } from '../../src/backend/Save';
import { Player } from '../../src/Player/Player';
import ItemRegistry from '../../src/Player/ItemRegistry';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock localStorage globally (works in node test environment)
global.localStorage = localStorageMock as any;

describe('Save System', () => {
  beforeEach(() => {
    // Clear localStorage and reset Save state before each test
    localStorage.clear();
    Save.loaded = false;
    Save.levelComplete = 0;
    Player.resetInstance();
  });

  describe('Save.load()', () => {
    it('should mark as loaded even if no save exists', () => {
      expect(Save.loaded).toBe(false);
      Save.load();
      expect(Save.loaded).toBe(true);
    });

    it('should restore player data from localStorage', () => {
      // Create a player and modify it
      const player = Player.getInstance();
      player.setMoney(500);
      player.setMaxHealth(4);

      // Manually save to localStorage (simulating prior save)
      const playerData = player.toJSON();
      localStorage.setItem('PlayerSave', JSON.stringify(playerData));
      Save.levelComplete = 3;
      localStorage.setItem('LevelComplete', JSON.stringify(3));

      // Reset player instance
      Player.resetInstance();
      Save.loaded = false;

      // Load from storage
      Save.load();

      // Verify restoration
      const restoredPlayer = Player.getInstance();
      expect(restoredPlayer.getMoney()).toBe(500);
      expect(restoredPlayer.getMaxHealth()).toBe(4);
      expect(Save.levelComplete).toBe(3);
    });

    it('should handle missing PlayerSave gracefully', () => {
      localStorage.setItem('LevelComplete', JSON.stringify(2));
      expect(() => Save.load()).not.toThrow();
      expect(Save.levelComplete).toBe(2);
      expect(Save.loaded).toBe(true);
    });

    it('should handle corrupted JSON gracefully', () => {
      localStorage.setItem('PlayerSave', 'invalid json {');
      localStorage.setItem('LevelComplete', 'not a number');
      expect(() => Save.load()).not.toThrow();
      expect(Save.loaded).toBe(true);
    });
  });

  describe('Save.save()', () => {
    it('should not save if _loaded is false', () => {
      Save.loaded = false;
      Save.levelComplete = 5;
      Save.save();

      // Verify nothing was written to localStorage
      expect(localStorage.getItem('PlayerSave')).toBeNull();
      expect(localStorage.getItem('LevelComplete')).toBeNull();
    });

    it('should save player data when _loaded is true', () => {
      // First load (or set manually)
      Save.loaded = true;
      Save.levelComplete = 7;

      // Modify player
      const player = Player.getInstance();
      player.setMoney(1000);
      player.setMaxHealth(5);

      // Save
      Save.save();

      // Verify data in storage
      const savedPlayer = localStorage.getItem('PlayerSave');
      const savedLevel = localStorage.getItem('LevelComplete');

      expect(savedPlayer).not.toBeNull();
      expect(savedLevel).toBe(JSON.stringify(7));

      // Verify it can be parsed
      const parsed = JSON.parse(savedPlayer!);
      expect(parsed.money).toBe(1000);
      expect(parsed.maxHealth).toBe(5);
    });

    it('should update level progress when saved', () => {
      Save.loaded = true;
      Save.levelComplete = 2;
      Save.save();

      expect(localStorage.getItem('LevelComplete')).toBe(JSON.stringify(2));

      // Update and save again
      Save.levelComplete = 5;
      Save.save();

      expect(localStorage.getItem('LevelComplete')).toBe(JSON.stringify(5));
    });

    it('should handle save errors without crashing', () => {
      Save.loaded = true;
      const player = Player.getInstance();
      player.setMoney(100);

      // Mock localStorage.setItem to throw
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => Save.save()).not.toThrow();

      // Restore
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Save and Load cycle', () => {
    it('should persist and restore full player state', () => {
      // Setup: Create initial player with inventory
      const registry = ItemRegistry.getInstance();
      const player = Player.getInstance();
      player.setMoney(750);
      player.setMaxHealth(4);

      // Add consumable item
      const healthPotion = registry.getItem('health_potion');
      if (healthPotion) {
        player.addConsumable(healthPotion, 2);
      }

      // Save
      Save.loaded = true;
      Save.levelComplete = 2;
      Save.save();

      // Reset and load
      Player.resetInstance();
      Save.loaded = false;
      Save.load();

      // Verify all state restored
      const restoredPlayer = Player.getInstance();
      expect(restoredPlayer.getMoney()).toBe(750);
      expect(restoredPlayer.getMaxHealth()).toBe(4);
      expect(Save.levelComplete).toBe(2);

      // Verify inventory restored
      const consumables = restoredPlayer.getConsumableInventory().getHotbarSlots();
      const healthPotionSlot = consumables.find(slot => slot?.item?.id === 'health_potion');
      expect(healthPotionSlot?.quantity).toBe(2);
    });

    it('should handle empty save on load', () => {
      // Load with no prior save
      Save.load();

      const player = Player.getInstance();
      expect(player.getMoney()).toBe(0);
      expect(Save.levelComplete).toBe(0);
      expect(Save.loaded).toBe(true);
    });
  });

  describe('Save state guard', () => {
    it('should prevent overwriting save with default state on unload', () => {
      // Simulate: user loads saved data
      const player = Player.getInstance();
      player.setMoney(500);

      const playerData = player.toJSON();
      localStorage.setItem('PlayerSave', JSON.stringify(playerData));

      // User refreshes/closes tab
      Player.resetInstance();
      Save.loaded = false;

      // beforeunload fires and calls Save.save() - should be skipped
      Save.save();

      // Verify original data still there (not overwritten by default player)
      const storedData = JSON.parse(localStorage.getItem('PlayerSave')!);
      expect(storedData.money).toBe(500);
    });

    it('should allow save after explicit load', () => {
      Save.load(); // This sets _loaded = true even if storage is empty
      Save.levelComplete = 3;

      const player = Player.getInstance();
      player.setMoney(200);

      Save.save(); // Should now work

      expect(localStorage.getItem('LevelComplete')).toBe(JSON.stringify(3));
      const saved = JSON.parse(localStorage.getItem('PlayerSave')!);
      expect(saved.money).toBe(200);
    });
  });
});
