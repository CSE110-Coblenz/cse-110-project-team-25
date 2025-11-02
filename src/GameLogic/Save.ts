
export class Save {
    static level: number = 1;
    static money: number = 0;
    static items: string[];

    static save(){
        localStorage.setItem("Level", JSON.stringify(Save.level));
        localStorage.setItem("Money", JSON.stringify(Save.money));
        localStorage.setItem("items", JSON.stringify(Save.items));
    }

    static load(){
        const Level = localStorage.getItem("Level");
        if (Level !== null) Save.level = JSON.parse(Level);

        const Money = localStorage.getItem("Money");
        if (Money !== null) Save.money = JSON.parse(Money);;

        const Items = localStorage.getItem("Items");
        if (Items !== null) Save.items = JSON.parse(Items);
    }

    static initialize(){
        const Money = localStorage.getItem("Money");
        if (Money == null){
            Save.save();
        }
    }


}