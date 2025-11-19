import type { ScreenSwitcher, Screen } from "./types.ts";
import MenuScreenController from "./screens/MenuScreen/MenuScreenController.ts";
import PlanetSelectScreenController from "./screens/PlanetSelectScreen/PlanetSelectScreenController.ts";
import GameScreenController from "./screens/GameScreen/GameScreenController.ts";
// import { DebugScreenController } from "./screens/debug-screen/DebugScreenController.ts"; // DEBUG: Commented out for production
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants.ts";
import GameRenderer from "./rendering/GameRenderer.ts";
import { wordBank } from "./words/wordBank.ts";
import ItemRegistry from "./Player/ItemRegistry.ts";
import { testPlayerSystem } from "./testPlayerSystem.ts";


class App implements ScreenSwitcher {
  private renderer: GameRenderer;

  private menuController: MenuScreenController;
  private planetSelectController: PlanetSelectScreenController;
  private gameController: GameScreenController;
  // private debugController: DebugScreenController; // DEBUG: Commented out for production

  constructor(container: string) {
    // Create the renderer (owns Stage + Layer)
    this.renderer = new GameRenderer({
      container,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
    });

    // Init controllers (they still return Konva.Groups via their Views)
    this.menuController = new MenuScreenController(this);
    this.gameController = new GameScreenController(this);
    this.planetSelectController = new PlanetSelectScreenController(this);
    // this.debugController = new DebugScreenController(this); // DEBUG: Commented out for production

    // Add each screen's Group to the renderer's layer
    const layer = this.renderer.getLayer();
    layer.add(this.menuController.getView().getGroup());
    layer.add(this.planetSelectController.getView().getGroup());
    layer.add(this.gameController.getView().getGroup());
    // layer.add(this.debugController.getView().getGroup()); // DEBUG: Commented out for production

    // Initial draw and (optional) start the lightweight render loop
    layer.draw();
    this.renderer.start();

    // Show the menu first
    this.menuController.getView().show();
  }



  switchToScreen(screen: Screen): void {
    // Hide all screens
    this.menuController.hide();
    this.planetSelectController.hide();
    this.gameController.hide();
    // this.debugController.hide(); // DEBUG: Commented out for production

    switch (screen.type) {
      case "menu":
        this.menuController.show();
        break;
      case "game":
        this.gameController.startGame(screen.levelNumber); // shows game screen inside
        break;
      case "planetSelect":
        this.planetSelectController.getView().showWithTransition();
        break;
      // DEBUG: Debug case commented out for production
      // case "debug":
      //   this.debugController.show();
      //   break;
    }
  }
}

// Boot the app
(async () => {
  await wordBank.load();        // load JSON once
  ItemRegistry.getInstance();   // Initialize item registry
  new App("container");         // then boot your app

  // Make test function available globally for console testing
  if (typeof window !== "undefined") {
    (window as any).testPlayerSystem = testPlayerSystem;
  }
  console.log("Run testPlayerSystem() in console to test the Player system!");
})();
