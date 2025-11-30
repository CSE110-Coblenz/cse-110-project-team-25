
import { Player } from "../Player/Player.ts";
import ItemRegistry from "../Player/ItemRegistry.ts";

export class Save {
    static levelComplete: number = 0;
    static _loaded: boolean = false;

    private static PLAYER_KEY = "PlayerSave";
    private static LEVEL_KEY = "LevelComplete";

    public static save(): void {
        try {

            if (!this._loaded) {
                console.warn("Skipping Save.save(): no save loaded yet.");
                return;
            }

            const player = Player.getInstance();
            const playerJson = player.toJSON();

            localStorage.setItem(this.PLAYER_KEY, JSON.stringify(playerJson));
            localStorage.setItem(this.LEVEL_KEY, JSON.stringify(Save.levelComplete ?? 0));

            console.log("Game Saved");
        } catch (e) {
            console.error("Failed to save game:", e);
        }
    }

    public static load(): void {
        try {
            
            const playerData = localStorage.getItem(this.PLAYER_KEY);

            if (playerData) {
                const parsed = JSON.parse(playerData);
                const registry = ItemRegistry.getInstance();
                const itemsMap = registry.getItemsMap();
                Player.fromJSON(parsed, itemsMap);
            }
        } catch (e) {
            console.warn("No player save found or failed to load player:", e);
        }

        try {
            const level = localStorage.getItem(this.LEVEL_KEY);
            if (level) {
                this.levelComplete = JSON.parse(level);
            }
        } catch (e) {
            console.log("No level data found");
        }

        this._loaded = true;
        console.log("Game Loaded");
    }

    public static set loaded(value: boolean) {
        this._loaded = value;
    }

    public static get loaded(): boolean {
        return this._loaded;
    }
}