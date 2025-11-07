import Enemy from "../Enemy";
import Konva from "konva";

class Circle extends Enemy {
    constructor(
        word: string[],
        distance: number = 40, // spawn far by default
        speed: number = 6,      // default speed
        x: number = 0,
        y: number = 0
    ) {
        const enemyGroup = new Konva.Group({ width: 80, height: 80 });
        const circle = new Konva.Circle({
            x: 0, y: 0, radius: 40,
            fill: "#2aa1ff", stroke: "#0b5ea8", strokeWidth: 4,
        });
        enemyGroup.add(circle);
        super("circle", word, enemyGroup, distance, speed, x, y);
    }
}

export default Circle;