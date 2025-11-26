import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import GameScreenModel from "./GameScreenModel.ts";
import GameScreenView from "./GameScreenView.ts";
import { GameController } from "../../backend/GameController.ts";

export default class GameScreenController extends ScreenController {
    private model: GameScreenModel;
    private view: GameScreenView;
    private screenSwitcher: ScreenSwitcher;
    private gameController: GameController;

    constructor(screenSwitcher: ScreenSwitcher) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.model = new GameScreenModel();
        this.view = new GameScreenView();
        this.gameController = new GameController(this.model, this.view, this.screenSwitcher);
    }

    /**
     * Start the game screen and initialize the game
     * @param levelNumber - Optional level number to load (defaults to level 1)
     * @param isTutorial - true for tutorial, false for campaign, null for endless mode
     */
    async startGame(levelNumber?: number, isTutorial: boolean | undefined = undefined): Promise<void> {
        this.model.reset();
        
        if (isTutorial === undefined) {
            await this.gameController.startGame(isTutorial, levelNumber);
        } else {
            await this.gameController.startGame(isTutorial, levelNumber);
        }
        
        this.view.show();
    }

    /**
     * Hide the screen and stop the game
     */
    hide(): void {
        this.gameController.stopGame();
        super.hide();
    }

    /**
     * Get the view for this screen
     */
    getView(): GameScreenView { 
        return this.view; 
    }

    /**
     * Get the game controller for this screen
     */
    getGameController(): GameController {
        return this.gameController;
    }
}
