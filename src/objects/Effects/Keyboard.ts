import Konva from "konva";
import Effect from "../Effect";
import { STAGE_HEIGHT } from "../../constants";
import { STAGE_WIDTH } from "../../constants";


class Keyboard extends Effect {


    constructor(){
        const Group = new Konva.Group({ width: 80, height: 80 });
        const keyboard = new Image();
        keyboard.src = "/keyboard.png";
        const animations = {
            idle: [
                0, 0, 1080, 390,    
            ]
        };
        let scale = 0.7
        keyboard.onload = function() {
            const board = new Konva.Sprite({
                x: 0,
                y: 0,
                scale: { x: 1, y: 1},
                offset: { x: 0, y: 0},
                image: keyboard,
                animation: 'idle',
                animations: animations,
                frameRate: 1,
                frameIndex: 0
            });
            Group.add(board);
            board.moveToBottom();
            Group.getLayer()?.batchDraw?.();
        }
        super(Group, 100000000000, STAGE_WIDTH / 2 - 1080 * scale / 2, STAGE_HEIGHT - 390 * scale, scale);

        let keyMap = new Map<string, Konva.Group>;
        type KeyEntry = [string, number, number];

        let keys: KeyEntry[] = [
            ['~', 17, 6],
            ['1', 17+72*1, 6],
            ['2', 17+72*2, 6],
            ['3', 17+72*3, 6],
            ['4', 17+72*4, 6],
            ['5', 17+72*5, 6],
            ['6', 17+72*6, 6],
            ['7', 17+72*7, 6],
            ['8', 17+72*8, 6],
            ['9', 17+72*9, 6],
            ['0', 17+72*10, 6],
            ['-', 17+72*11, 6],
            ['=', 17+72*12, 6],
            ['backspace', 17+72*13, 6],
            ['tab', 17, 78],
            ['q', 123+72*0, 78],
            ['w', 123+72*1, 78],
            ['e', 123+72*2, 78],
            ['r', 123+72*3, 78],
            ['t', 123+72*4, 78],
            ['y', 123+72*5, 78],
            ['u', 123+72*6, 78],
            ['i', 123+72*7, 78],
            ['o', 123+72*8, 78],
            ['p', 123+72*9, 78],
            ['[', 123+72*10, 78],
            [']', 123+72*11, 78],
            ['slash', 123+72*12, 78],
            ['capslock', 20, 150],
            ['a', 138+72*0, 150],
            ['s', 138+72*1, 150],
            ['d', 138+72*2, 150],
            ['f', 138+72*3, 150],
            ['g', 138+72*4, 150],
            ['h', 138+72*5, 150],
            ['j', 138+72*6, 150],
            ['k', 138+72*7, 150],
            ['l', 138+72*8, 150],
            [";", 138+72*9, 150],
            ["'", 138+72*10, 150],
            ['enter', 138+72*11, 150],
            ['leftShift', 20, 222],
            ['z', 178+72*0, 222],
            ['x', 178+72*1, 222],
            ['c', 178+72*2, 222],
            ['v', 178+72*3, 222],
            ['b', 178+72*4, 222],
            ['n', 178+72*5, 222],
            ['m', 178+72*6, 222],
            [',', 178+72*7, 222],
            ['period', 178+72*8, 222],
            ['forwardSlash', 178+72*9, 222],
            ['rightShift', 178+72*10, 222],
            ['space', 330, 300]
        ];

        for(let i = 0; i < keys.length; i++){
            const key = keys[i][0]
            const x = keys[i][1]
            const y = keys[i][2]
            const img = this.KeyImg(key, x, y)
            keyMap.set(key, img)
            Group.add(img)
        }
        Group.getLayer()?.batchDraw?.();

        Group.add()



        let high = keyMap.get("a")
        if(high == undefined) return;

        // ... assuming 'myGroup' is a Konva.Group
        let spriteNodes = high.find('.zach');

        // Check if the collection is not empty
        if (spriteNodes.length === 0){
            console.log("sadly empty")
            console.log(high.width())
            return;
        } 

        // Get the first element
        let spriteCandidate = spriteNodes[0];

        // Use an 'instanceof' type guard to ensure it's a Konva.Shape (which Konva.Sprite extends)
        if (spriteCandidate instanceof Konva.Shape) {
            // Inside this block, TypeScript recognizes 'spriteCandidate' 
            // as a Konva.Shape, and it now allows shape properties like shadowColor.

            // Apply the highlight style
            spriteCandidate.shadowColor('cyan');
            spriteCandidate.shadowBlur(15);
            spriteCandidate.shadowOffset({ x: 0, y: 0 });
            spriteCandidate.shadowOpacity(1.0);

            // Apply stroke if desired
            spriteCandidate.stroke('yellow');
            spriteCandidate.strokeWidth(5);
            
            // Redraw
            spriteCandidate.getLayer()?.batchDraw();
        } else {
            // Optional: Log a message if the found node isn't a shape
            console.warn("Node found with selector '.player-sprite' is not a Konva.Shape.");
        }
        

        Group.getLayer()?.batchDraw?.();
    }

    private KeyImg(key: string, x: number, y: number): Konva.Group{
        const keyImg = new Image();
        const Group = new Konva.Group({ width: 72, height: 72, x: x, y: y});
        Group.x(x)
        Group.y(y)
        keyImg.src = key;

        
        let width = 72;
        if(key === "space") width = 354
        if(key === "leftShift" || key === "rightShift") width = 158
        if(key === "enter" || key === "capslock") width = 124
        if(key === "tab" || key === "backspace") width = 106
        const animations = {
            idle: [
                0, 0, width, 72,    
            ]
        };
        keyImg.src = 'keys/' +  key + '.png'
        keyImg.onload = function() {
            const keySprite = new Konva.Sprite({
                x: 0,
                y: 0,
                image: keyImg,
                animation: 'idle',
                animations: animations,
                frameRate: 1,
                frameIndex: 0,
                name: "zach"
            });
            Group.add(keySprite);
        }
        return Group
    }



    
}

export default Keyboard;