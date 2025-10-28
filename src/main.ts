import type { ScreenSwitcher, Screen } from "./types.ts";
import { MenuScreenController } from "./screens/MenuScreen/MenuScreenController.ts";
import { GameScreenController } from "./screens/GameScreen/GameScreenController.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants.ts";
import GameRenderer from "./rendering/GameRenderer.ts";

class App implements ScreenSwitcher {
  private renderer: GameRenderer;

  private menuController: MenuScreenController;
  private gameController: GameScreenController;

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

    // Add each screen's Group to the renderer's layer
    const layer = this.renderer.getLayer();
    layer.add(this.menuController.getView().getGroup());
    layer.add(this.gameController.getView().getGroup());

    // Initial draw and (optional) start the lightweight render loop
    layer.draw();
    this.renderer.start();

    // Show the menu first
    this.menuController.getView().show();
  }

  switchToScreen(screen: Screen): void {
    // Hide all screens
    this.menuController.hide();
    this.gameController.hide();

    // Show the requested one
    switch (screen.type) {
      case "menu":
        this.menuController.show();
        break;
      case "game":
        this.gameController.startGame(); // shows game screen inside
        break;
    }
  }
}

// Boot the app
new App("container");
