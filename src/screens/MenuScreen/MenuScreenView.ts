import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { BaseMenuView } from "../base/BaseMenuView.ts";

/**
 * MenuScreenView - Renders the menu screen
 */
export default class MenuScreenView extends BaseMenuView {
    private onStartClick: () => void;
    // private onDebugClick: () => void; // DEBUG: Commented out for production
    private onPlanetSelectClick: () => void;

    constructor(onStartClick: () => void, onPlanetSelectClick: () => void /* , onDebugClick: () => void */) { // debug
        super("#0f0f23", false); // Don't auto-build
        this.onStartClick = onStartClick;
        this.onPlanetSelectClick = onPlanetSelectClick;
        // this.onDebugClick = onDebugClick; //
        this.buildLayout(); // Build after callback is assigned
        // Make menu visible by default (main menu shows first)
        this.group.visible(true);
    }

    protected buildLayout(): void {
        // Create title
        const title = this.createTitle("Cosmic Keyboard Captain", {
            fontSize: 48,
            fontFamily: "Times New Roman",
            fill: "white",
            stroke: "black",
            strokeWidth: 2,
        });
        this.positionElement(title, STAGE_WIDTH / 2, 150);

        // Create start button
        
        const levelSelectBtn = this.createButton({
            text: "PLANET SELECT",
            width: 200,
            height: 60,
            fill: "blue",
            hoverFill: "lightblue",
            stroke: "darkblue",
            strokeWidth: 3,
            fontSize: 24,
            onClick: this.onPlanetSelectClick,
        });
        this.positionElement(levelSelectBtn, STAGE_WIDTH / 2, STAGE_HEIGHT / 2 + 80);

        const startBtn = this.createButton({
            text: "PLAY ENDLESS",
            width: 200,
            height: 60,
            fill: "green",
            hoverFill: "lightgreen",
            stroke: "darkgreen",
            strokeWidth: 3,
            fontSize: 24,
            onClick: this.onStartClick,
        });
        this.positionElement(startBtn, STAGE_WIDTH / 2, STAGE_HEIGHT / 2);

        // debug: 
        // const debugBtn = this.createButton({
        //   text: "DEBUG SCREEN",
        //   width: 200,
        //   height: 60,
        //   fill: "orange",
        //   hoverFill: "lightyellow",
        //   stroke: "darkorange",
        //   strokeWidth: 3,
        //   fontSize: 24,
        //   onClick: this.onDebugClick,
        // });
        // this.positionElement(debugBtn, STAGE_WIDTH / 2, STAGE_HEIGHT / 2 + 80);
    }
}
