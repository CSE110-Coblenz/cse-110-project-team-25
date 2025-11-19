import type { PlayerSaveData } from "../Player/Player";

export class Save {
    static levelComplete: number;
    static money: number; // Kept for backward compatibility
    static items: string[]; // Kept for backward compatibility
    static playerData: PlayerSaveData | null = null;
    static _loaded: boolean = false;

    public static save(){
        console.log("=== SAVING GAME ===");
        console.log("Save.playerData:", Save.playerData);
        console.log("Consumable inventory:", Save.playerData?.consumableInventory);
        console.log("Upgrade inventory:", Save.playerData?.upgradeInventory);

        localStorage.setItem("LevelComplete", JSON.stringify(Save.levelComplete));
        localStorage.setItem("Money", JSON.stringify(Save.money));
        localStorage.setItem("Items", JSON.stringify(Save.items));

        // Save full player data
        if (Save.playerData) {
            localStorage.setItem("PlayerData", JSON.stringify(Save.playerData));
            console.log("PlayerData saved to localStorage");
        }

        console.log("=== GAME SAVED ===");
    }

    public static load(){
        const level = localStorage.getItem("LevelComplete");
        try {
            this.levelComplete = JSON.parse(level!);
        } catch (e) {
            console.log("No level data found");
        }

        const money = localStorage.getItem("Money");
        try {
            this.money = JSON.parse(money!);
            console.log("money:" + this.money);
        } catch (e) {
            console.log("No money data found");

        }

        const items = localStorage.getItem("Items");
        try {
            this.items = JSON.parse(items!);
        } catch (e) {
            console.log("No items data found");

        }

        // Load full player data
        const playerData = localStorage.getItem("PlayerData");
        console.log("=== LOADING PLAYER DATA ===");
        console.log("Raw localStorage PlayerData:", playerData);
        if (playerData === null || playerData === "null") {
            console.log("No player data found - Save.playerData will be null");
            this.playerData = null;
        } else {
            try {
                this.playerData = JSON.parse(playerData);
                console.log("Player data loaded successfully");
                console.log("Loaded consumable inventory:", this.playerData?.consumableInventory);
                console.log("Loaded upgrade inventory:", this.playerData?.upgradeInventory);
            } catch (e) {
                console.log("Error parsing player data");
                this.playerData = null;
            }
        }

        console.log("=== GAME LOADED ===");
    }

    public static set loaded(value: boolean){
        this._loaded = value;
    }

    public static get loaded(): boolean{
        return this._loaded;
    }

}
