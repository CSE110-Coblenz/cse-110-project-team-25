import Konva from "konva";
import Effect from "../Effect";
import { STAGE_HEIGHT } from "../../constants";
import { STAGE_WIDTH } from "../../constants";


class Keyboard extends Effect {
    private keyMap: Map<string, Konva.Group>;
    private nextLetter: string;
    private Group: Konva.Group;

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
        this.Group = Group;

        //hands
        const leftHand = new Image();
        const rightHand = new Image();
        const leftAnimations = {
            a: [0, 0, 480, 480],
            s: [0, 0, 480, 480],
            d: [0, 0, 480, 480],
            f: [0, 0, 480, 480],
            space: [0, 0, 480, 480],
            backspace: [0, 0, 480, 480],
            y: [0, 0, 480, 480],
            u: [0, 0, 480, 480],
            i: [0, 0, 480, 480],
            o: [0, 0, 480, 480],
            p: [0, 0, 480, 480],
            h: [0, 0, 480, 480],
            j: [0, 0, 480, 480],
            k: [0, 0, 480, 480],
            l: [0, 0, 480, 480],
            semicolon: [0, 0, 480, 480],
            b: [0, 0, 480, 480],
            n: [0, 0, 480, 480],
            m: [0, 0, 480, 480],
            comma: [0, 0, 480, 480],
            period: [0, 0, 480, 480],
            forwardSlash: [0, 0, 480, 480],
            rightShift: [0,0,480,480],
            c: [480, 0, 480, 480],
            e: [480*2, 0, 480, 480],
            g: [480*3, 0, 480, 480],
            leftShift: [480*4, 0, 480, 480],
            q: [480*5, 0, 480, 480],
            r: [480*6, 0, 480, 480],
            t: [480*7, 0, 480, 480],
            tab: [480*8, 0, 480, 480],
            v: [480*9, 0, 480, 480],
            w: [480*10, 0, 480, 480],
            x: [480*11, 0, 480, 480],
            z: [480*12, 0, 480, 480],
            apostrophe: [0, 0, 480, 480],
        };
        const rightAnimations = {
            a: [480*6, 0, 480, 480],
            s: [480*6, 0, 480, 480],
            d: [480*6, 0, 480, 480],
            f: [480*6, 0, 480, 480],
            space: [480*6, 0, 480, 480],
            backspace: [480*6, 0, 480, 480],
            y: [480*14, 0, 480, 480],
            u: [480*13, 0, 480, 480],
            i: [480*2, 0, 480, 480],
            o: [480*9, 0, 480, 480],
            p: [480*10, 0, 480, 480],
            h: [480*5, 0, 480, 480],
            j: [480*6, 0, 480, 480],
            k: [480*6, 0, 480, 480],
            l: [480*6, 0, 480, 480],
            semicolon: [480*6, 0, 480, 480],
            b: [480*3, 0, 480, 480],
            n: [480*8, 0, 480, 480],
            m: [480*7, 0, 480, 480],
            comma: [480*1, 0, 480, 480],
            period: [480*11, 0, 480, 480],
            forwardSlash: [480*4, 0, 480, 480],
            rightShift: [480*12,0,480,480],
            c: [480*6, 0, 480, 480],
            e: [480*6, 0, 480, 480],
            g: [480*6, 0, 480, 480],
            leftShift: [480*4, 0, 480, 480],
            q: [480*6, 0, 480, 480],
            r: [480*6, 0, 480, 480],
            t: [480*6, 0, 480, 480],
            tab: [480*6, 0, 480, 480],
            v: [480*6, 0, 480, 480],
            w: [480*6, 0, 480, 480],
            x: [480*6, 0, 480, 480],
            z: [480*6, 0, 480, 480],
            apostrophe: [480*12, 0, 480, 480]
        };
        
        leftHand.src = "/leftHand.png";
        leftHand.onload = function() {
            const hand = new Konva.Sprite({
                x: 50,
                y: -50,
                scale: { x: 1, y: 1},
                offset: { x: 0, y: 0},
                image: leftHand,
                animation: 'a',
                animations: leftAnimations,
                frameRate: 15,
                frameIndex: 0,
                opacity: 0.5,
                id: 'leftHand'
            });
            Group.add(hand);
            Group.getLayer()?.batchDraw?.();
        }
        rightHand.src = "/rightHand.png";
        rightHand.onload = function() {
            const hand = new Konva.Sprite({
                x: 520,
                y: -50,
                scale: { x: 1, y: 1},
                offset: { x: 0, y: 0},
                image: rightHand,
                animation: 'a',
                animations: rightAnimations,
                frameRate: 15,
                frameIndex: 0,
                opacity: 0.5,
                id: 'rightHand'
            });
            Group.add(hand);
            Group.getLayer()?.batchDraw?.();
        }

        this.nextLetter = ""

        this.keyMap = new Map<string, Konva.Group>;
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
            ["semicolon", 138+72*9, 150],
            ["apostrophe", 138+72*10, 150],
            ['enter', 138+72*11, 150],
            ['leftShift', 20, 222],
            ['z', 178+72*0, 222],
            ['x', 178+72*1, 222],
            ['c', 178+72*2, 222],
            ['v', 178+72*3, 222],
            ['b', 178+72*4, 222],
            ['n', 178+72*5, 222],
            ['m', 178+72*6, 222],
            ['comma', 178+72*7, 222],
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
            this.keyMap.set(key, img)
            Group.add(img)
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
        // keyImg.onload = function() {
        //     const keySprite = new Konva.Sprite({
        //         x: 0,
        //         y: 0,
        //         image: keyImg,
        //         animation: 'idle',
        //         animations: animations,
        //         frameRate: 1,
        //         frameIndex: 0,
        //         name: "zach"
        //     });
        //     Group.add(keySprite);
        // }
        return Group
    }


    override update(dt:number, nextLetter: string){
        if(this.nextLetter != nextLetter){
            //cleanup old
            this.cleanupHighlight()

            //put highlight
            let high = this.keyMap.get(nextLetter)
            if(high == undefined) return;
            const circle = new Konva.Circle({
                    x: 36, y: 36, radius: 40,
                    fill: "#f0f04dff", stroke: "#0b5ea8", strokeWidth: 0, opacity: 0.5
                })
            high.add(circle)
            circle.moveToTop()
            this.nextLetter = nextLetter

            //change animation
            const leftHand = this.Group.find('#leftHand')[0] as Konva.Sprite
            if(leftHand){leftHand.animation(nextLetter)}
            const rightHand = this.Group.find('#rightHand')[0] as Konva.Sprite
            if(rightHand){rightHand.animation(nextLetter)}
        }
    }

    cleanupHighlight(){
        let high = this.keyMap.get(this.nextLetter)
        if(high == undefined) return;

        let children = high.getChildren();
        for(let i = 0; i < children.length; i++){
            if (children[i] instanceof Konva.Circle) {
                children[i].destroy()
            }
        }
    }


    
}

export default Keyboard;