# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Space Typing Adventure is a typing game built with TypeScript, Vite, and Konva.js. Players type words to destroy enemies (meteors and UFOs) that approach from a distance using a 3D perspective rendering system.

## Commands

**Development:**
- `npm run dev` - Start Vite dev server
- `npm run build` - Type-check with TypeScript and build for production
- `npm run preview` - Preview production build locally

## Architecture

### MVC Pattern
The codebase follows a Model-View-Controller pattern with screens:
- **Controllers** (e.g., `GameScreenController`, `MenuScreenController`) - Handle user input and coordinate between model and view
- **Views** (e.g., `GameScreenView`, `MenuScreenView`) - Manage Konva.js rendering and visual updates
- **Models** (e.g., `GameScreenModel`) - Store game state (score, target word, etc.)

### Core Systems

**Screen Management:**
- App entry point ([src/main.ts](src/main.ts)) implements `ScreenSwitcher` interface
- Each screen has a Controller and View that extend base classes from [src/types.ts](src/types.ts)
- All screens are added to a single Konva layer; visibility toggled via `show()`/`hide()`

**Game Loop:**
- [src/GameController.ts](src/GameController.ts) manages core game logic: enemy spawning, typing input, targeting, collision detection
- Uses Konva.Animation for the main game loop updating enemy positions based on distance/speed
- Enemies stored in `Map<number, Enemy>` with tracking for targeting by initial letter

**Rendering:**
- [src/rendering/GameRenderer.ts](src/rendering/GameRenderer.ts) owns the Konva Stage and Layer
- 3D perspective projection in `GameScreenView.updateEnemyTransform()` converts world coordinates (x, z-distance) to screen position and scale
- Enemies rendered with z-ordering (closer enemies on top) via `setDrawOrder()`

**Enemy System:**
- [src/objects/Enemy.ts](src/objects/Enemy.ts) - Base enemy class with word, distance, speed, health, and type (meteor/ufo)
- Each enemy has a `Prompt` object showing typed/remaining characters
- Enemies are sprite-based with idle animations loaded from spritesheets

**Word System:**
- [src/words/wordBank.ts](src/words/wordBank.ts) loads words from `/wordbank.json` on startup
- Words organized by keyboard zones (Bank type: "bnm,.", "zxcv", etc.) and length
- `getRandomWordExcludingInitials()` ensures unique starting letters for active enemies

### Key Files

- [src/main.ts](src/main.ts) - App initialization, word bank loading, screen setup
- [src/GameController.ts](src/GameController.ts) - Game loop, enemy management, typing logic, targeting
- [src/screens/GameScreen/GameScreenView.ts](src/screens/GameScreen/GameScreenView.ts) - 3D perspective rendering, enemy visuals
- [src/objects/Enemy.ts](src/objects/Enemy.ts) - Enemy entity with sprite animations
- [src/words/wordBank.ts](src/words/wordBank.ts) - Word loading and selection

### Game Flow

1. App loads word bank from JSON
2. Menu screen shown first
3. On game start: `GameController.startGame()` spawns wave of 3 enemies, sets up keyboard listener, starts game loop
4. Player types to target and destroy enemies by matching words
5. When wave complete: difficulty multiplier increases, new wave spawns
6. Game over when any enemy reaches distance ≤ 10

## Menu Screen Refactoring

The project recently refactored menu screens to use base classes that eliminate boilerplate code.

### Base Classes

**[src/screens/base/BaseMenuView.ts](src/screens/base/BaseMenuView.ts)** - Provides reusable UI creation helpers:
- `createBackground(color)` - Creates background with specified color
- `createTitle(text, config)` - Creates styled title text
- `createText(text, config)` - Creates body text
- `createButton(config)` - Creates button with hover effects and click handler
- `positionElement(element, x, y)` - Positions and adds element to scene

**[src/screens/base/BaseMenuController.ts](src/screens/base/BaseMenuController.ts)** - Base controller that manages:
- `screenSwitcher` reference for navigation
- `view` reference to the screen's view
- Common `getView()` implementation

### Creating New Menu Screens

To create a new menu screen (e.g., Settings, Store, Game Over):

1. **Create View** extending `BaseMenuView`:
   ```typescript
   export class MyMenuView extends BaseMenuView {
     private onButtonClick: () => void;

     constructor(onButtonClick: () => void) {
       super("#background-color", false); // Don't auto-build
       this.onButtonClick = onButtonClick;
       this.buildLayout(); // Build after properties assigned
       this.group.visible(false); // Hidden by default
     }

     protected buildLayout(): void {
       const title = this.createTitle("My Menu", { fontSize: 48 });
       this.positionElement(title, STAGE_WIDTH / 2, 150);

       const btn = this.createButton({
         text: "CLICK ME",
         onClick: this.onButtonClick,
         fill: "green",
         hoverFill: "lightgreen"
       });
       this.positionElement(btn, STAGE_WIDTH / 2, STAGE_HEIGHT / 2);
     }
   }
   ```

2. **Create Controller** extending `BaseMenuController`:
   ```typescript
   export class MyMenuController extends BaseMenuController {
     constructor(screenSwitcher: ScreenSwitcher) {
       super(screenSwitcher);
       this.view = new MyMenuView(() => this.handleClick());
     }

     private handleClick(): void {
       this.screenSwitcher.switchToScreen({ type: "menu" });
     }

     getView(): MyMenuView {
       return this.view as MyMenuView;
     }
   }
   ```

3. **Register in main.ts** (see Known Issues below)

### Known Issues & Future Improvements

**Current Issue: Manual Screen Registration**

Adding a new screen currently requires changes in 4 places in [src/main.ts](src/main.ts):
1. Add controller property
2. Instantiate controller in constructor
3. Add view to layer
4. Add case to `switchToScreen()`

**Potential Solutions (for future refactoring when we have 4+ screens):**

*Option 1: Map-Based Registry (Recommended)*
```typescript
private screens = new Map<string, ScreenController>([
  ["menu", new MenuScreenController(this)],
  ["game", new GameScreenController(this)],
  // Adding new screen = just one line here
]);
```

*Option 2: Screen Factory Pattern*
- Create `ScreenFactory` class to manage registration
- Better for 10+ screens

*Option 3: Lifecycle Methods*
- Add optional `activate()` method to `ScreenController`
- Eliminates special cases like `GameScreenController.startGame()`

**When to refactor:** When adding the 4th or 5th screen to reduce boilerplate.

### Why GameScreen Doesn't Use BaseMenuView

`GameScreenView` is intentionally NOT refactored to use `BaseMenuView` because:
- It's a real-time game renderer, not a menu
- Has unique concerns: 3D perspective projection, enemy management, dynamic rendering
- Shares <5% code with menu screens (only `show()`/`hide()`/`getGroup()`)
- Forcing it to extend `BaseMenuView` would create conceptual confusion
- The base class helpers (`createButton()`, `createTitle()`) aren't used in gameplay
