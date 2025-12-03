import type { ScreenSwitcher, Screen, planetName } from "./types.ts";
import MenuScreenController from "./screens/MenuScreen/MenuScreenController.ts";
import PlanetSelectScreenController from "./screens/PlanetSelectScreen/PlanetSelectScreenController.ts";
import { LevelSelectScreenController } from "./screens/PlanetSelectScreen/LevelSelectScreen/LevelSelectScreenController.ts";
import GameScreenController from "./screens/GameScreen/GameScreenController.ts";
import { ShopScreenController } from "./screens/ShopScreen/ShopScreenController.ts";
// import { DebugScreenController } from "./screens/debug-screen/DebugScreenController.ts"; // DEBUG: Commented out for production
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants.ts";
import GameRenderer from "./rendering/GameRenderer.ts";
import { wordBank } from "./words/wordBank.ts";
import ItemRegistry from "./Player/ItemRegistry.ts";


class App implements ScreenSwitcher {
  private renderer: GameRenderer;
  private menuController: MenuScreenController;
  private planetSelectController: PlanetSelectScreenController;
  private levelSelectControllers: Map<planetName, LevelSelectScreenController> = new Map();
  private gameController: GameScreenController;
  private shopController: ShopScreenController;
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
    this.shopController = new ShopScreenController(this);
    this.planetSelectController = new PlanetSelectScreenController(this);
    // this.debugController = new DebugScreenController(this); // DEBUG: Commented out for production

    // Add each screen's Group to the renderer's layer
    const layer = this.renderer.getLayer();
    layer.add(this.menuController.getView().getGroup());
    layer.add(this.planetSelectController.getView().getGroup());
    layer.add(this.gameController.getView().getGroup());
    layer.add(this.shopController.getView().getGroup());
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
    this.levelSelectControllers.forEach(controller => controller.hide());
    this.gameController.hide();
    this.shopController.hide();
    // this.debugController.hide(); // DEBUG: Commented out for production

    switch (screen.type) {
      case "menu":
        this.menuController.show();
        break;
      case "game":
        this.gameController.startGame(screen.levelNumber, screen.isTutorial); // shows game screen inside
        break;
      case "shop":
        this.shopController.show();
        break;
      case "planetSelect":
        // Use regular show - transition should be triggered explicitly if needed
        this.planetSelectController.getView().showWithTransition();
        break;
      case "levelSelect":
        this.switchToLevelSelect(screen.planetType);
        break;
      // DEBUG: Debug case commented out for production
      // case "debug":
      //   this.debugController.show();
      //   break;
    }
  }

  private switchToLevelSelect(planetType: planetName) {
    // Get or create level select controller for this planet
    let levelSelectController = this.levelSelectControllers.get(planetType);
    if (!levelSelectController) {
      levelSelectController = new LevelSelectScreenController(this, planetType);
      this.levelSelectControllers.set(planetType, levelSelectController);
      // Add to layer
      this.renderer.getLayer().add(levelSelectController.getView().getGroup());
    }
    levelSelectController.show();
  }
}

// Boot the app
(async () => {
  await wordBank.load();        // load JSON once
  ItemRegistry.getInstance();   // Initialize item registry
  new App("container");         // then boot your app
})();

