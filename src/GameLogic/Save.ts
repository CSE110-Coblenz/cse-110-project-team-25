
export class Save {
    static levelComplete: number;
    static money: number;
    static items: string[];

    public static save(){
        localStorage.setItem("LevelComplete", JSON.stringify(Save.levelComplete));
        localStorage.setItem("Money", JSON.stringify(Save.money));
        localStorage.setItem("Items", JSON.stringify(Save.items));
        console.log("Game Saved");
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

        console.log("Game Loaded");
    }

}