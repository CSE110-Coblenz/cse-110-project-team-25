import type { ScreenSwitcher, Screen } from "./types.ts";
import { MenuScreenController } from "./screens/MenuScreen/MenuScreenController.ts";
import { LevelSelectScreenController } from "./screens/LevelSelectScreen/LevelSelectScreenController.ts";
import { GameScreenController } from "./screens/GameScreen/GameScreenController.ts";
import { ShopScreenController } from "./screens/ShopScreen/ShopScreenController.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants.ts";
import GameRenderer from "./rendering/GameRenderer.ts";
import { wordBank } from "./words/wordBank.ts";
import ItemRegistry from "./Player/ItemRegistry.ts";
import { testPlayerSystem } from "./testPlayerSystem.ts";
import { testShopBartering, testShopInventory } from "./testShopBartering.ts";


class App implements ScreenSwitcher {
  private renderer: GameRenderer;

  private menuController: MenuScreenController;
  private levelSelectController: LevelSelectScreenController;
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
    this.levelSelectController = new LevelSelectScreenController(this);
    this.gameController = new GameScreenController(this);
    this.shopController = new ShopScreenController(this);
    // this.debugController = new DebugScreenController(this); // DEBUG: Commented out for production

    // Add each screen's Group to the renderer's layer
    const layer = this.renderer.getLayer();
    layer.add(this.menuController.getView().getGroup());
    layer.add(this.levelSelectController.getView().getGroup());
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
    this.levelSelectController.hide();
    this.gameController.hide();
    this.shopController.hide();
    // this.debugController.hide(); // DEBUG: Commented out for production

    switch (screen.type) {
      case "menu":
        this.menuController.show();
        break;
      case "levelSelect":
        this.levelSelectController.show();
        break;
      case "game":
        this.gameController.startGame(screen.levelNumber); // shows game screen inside
        break;
      case "shop":
        this.shopController.show();
        break;
    }
  }
}

// Boot the app
(async () => {
  await wordBank.load();        // load JSON once
  ItemRegistry.getInstance();   // Initialize item registry
  new App("container");         // then boot your app

  // Make test functions available globally for console testing
  if (typeof window !== "undefined") {
    (window as any).testPlayerSystem = testPlayerSystem;
    (window as any).testShopBartering = testShopBartering;
    (window as any).testShopInventory = testShopInventory;
  }
  console.log("Run testPlayerSystem() in console to test the Player system!");
  console.log("Run testShopBartering() in console to test the bartering system!");
  console.log("Run testShopInventory() in console to test shop inventory generation!");
})();
