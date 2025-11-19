# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Space Typing Adventure** is a typing-based game built with TypeScript, Vite, and Konva.js. Players type words to defeat enemies that approach from deep space toward the screen.

## Development Commands

```bash
# Start development server (default port 5173)
npm run dev

# Build for production (TypeScript compilation + Vite build)
npm run build

# Preview production build
npm run preview
```

## Core Architecture

### Screen-Based Navigation (MVC Pattern)

The application uses a centralized `App` class (in `src/main.ts`) that implements `ScreenSwitcher` to manage navigation between screens. All screens follow the MVC pattern:

- **Model**: Data and game state (e.g., `GameScreenModel`)
- **View**: Konva.js rendering (extends `View` interface, returns `Konva.Group`)
- **Controller**: Logic and event handling (extends `ScreenController`)

Screen types are defined in `src/types.ts` as discriminated unions:
```typescript
type Screen =
  | { type: "menu" }
  | { type: "levelSelect" }
  | { type: "game"; levelNumber?: number }
  | { type: "pause" }
  | { type: "resume" }
```

To add a new screen:
1. Create Controller and View in `src/screens/YourScreen/`
2. Add screen type to `Screen` union in `types.ts`
3. Register in `App.switchToScreen()` in `main.ts`
4. Add the controller's view group to the renderer layer in `App` constructor

### Game Loop and Rendering

- **Renderer**: `GameRenderer` manages a single Konva `Stage` and `Layer`
- **Game Loop**: `GameController` uses `Konva.Animation` for frame-based updates
- All screens share the same layer; screens show/hide their groups via `group.visible()`

### Gameplay Architecture

**GameController** (`src/backend/GameController.ts`)
- Manages game loop, pause/unpause, health, and score
- Delegates to specialized components:
  - **KeyboardController**: All keyboard input and typing mechanics
  - **LevelManager**: Wave progression, enemy spawning, level loading
  - **Save**: LocalStorage persistence for money and progress

**KeyboardController** (`src/backend/KeyboardController.ts`)
- Handles typing input with two modes (configured via `REQUIRE_SPACEBAR_TO_FIRE`):
  - `true`: Type word + press Space to fire (default)
  - `false`: Auto-fire when word is complete
- Uses callbacks to communicate with GameController:
  - `onPauseToggle()`: Escape key handling
  - `onEnemyDefeated(id)`: Word completion
  - `isPaused()`: Prevents typing when paused

**LevelManager** (`src/Level/LevelManager.ts`)
- Manages waves and enemy spawning
- Loads level configurations from `public/levels/*.json`
- Maintains `letterToId` map for targeting enemies by initial character
- Handles wave transitions and level completion

### Enemy and Wave System

**Wave** (`src/WaveGen/Wave.ts`)
- Container for enemies and effects in current wave
- Key methods:
  - `forEachEnemy()`: Iterate over enemies (NOT `forEach`)
  - `forEachEffect()`: Iterate over effects
  - `addEnemy()`, `removeEnemy()`: Manage enemies
  - `activeInitials`: Set of enemy word initials for targeting

**EnemyFactory** (`src/WaveGen/EnemyFactory.ts`)
- Creates enemy instances by type (ufo, meteor, circle, etc.)
- All enemies extend base `Enemy` class (`src/objects/Enemy.ts`)
- Enemy types located in `src/objects/Enemies/`

**Enemy Types**:
- `Ufo`, `Meteor`, `Circle`, `Comet`, `Shooter`, `TextBox`, `Amiiba`, `Dummy`
- Each has unique visual sprite and behavior
- Enemy base class manages: `word`, `health`, `speed`, `distance`, `pause()/unpause()`

### Level Configuration

Levels are JSON files in `public/levels/` following `LevelConfig` interface:

```json
{
  "levelNumber": 1,
  "difficulty": 1.0,
  "waves": [
    {
      "types": { "1": "ufo", "2": "meteor" },
      "health": [1, 2],
      "speed": [5, 6],
      "distance": [40, 50],
      "words": ["hello", "world"],
      "x": [-1, 1]
    }
  ]
}
```

Word banks loaded from `public/wordbank.json` and `public/wordbanks.json`.

### Singleton Systems

Several game systems use singleton pattern:
- **Money** (`src/Money.ts`): Currency and rewards
- **Health** (`src/Health.ts`): Player lives
- **Save** (`src/backend/Save.ts`): LocalStorage persistence

Access via `Money.getInstance()`, `Health.getInstance()`, etc.

## Important Implementation Notes

### Method Name Changes in Wave Class
The `Wave` class uses `forEachEnemy()` and `forEachEffect()` methods (NOT standard `forEach`). This is critical when iterating:

```typescript
// Correct
currentWave.forEachEnemy((enemy) => { ... });

// Wrong - will cause compilation error
currentWave.forEach((enemy) => { ... });
```

### Pause Functionality
Pausing stops the game loop AND pauses enemy sprite animations:
```typescript
pauseGame(): void {
  this.stopGameLoop();
  currentWave.forEachEnemy((enemy) => enemy.pause());
  this.paused = true;
}
```

### Keyboard Input Flow
All keyboard input flows through KeyboardController → callbacks → GameController:
1. KeyboardController receives keydown event
2. Checks if paused (via `isPaused()` callback)
3. Handles typing, backspace, spacebar, or Escape
4. Calls appropriate callback when needed

Do not add keyboard listeners directly in GameController - use KeyboardController.

### Screen Switching Pattern
Always switch screens via `screenSwitcher.switchToScreen()`:
```typescript
// To show pause overlay
this.screenSwitcher.switchToScreen({ type: "pause" });

// To resume game
this.screenSwitcher.switchToScreen({ type: "resume" });

// To start game with specific level
this.screenSwitcher.switchToScreen({ type: "game", levelNumber: 2 });
```

The App class handles hiding all screens and showing the target screen.

## Common Pitfalls

1. **Boolean vs boolean**: Use primitive `boolean` type, not `Boolean` object for state variables
2. **Async initialization**: Always `await wordBank.load()` before creating App instance (see `main.ts`)
3. **Cleanup**: Always call `cleanup()` on KeyboardController in `stopGame()` to remove event listeners
4. **Effect updates**: `updateEffects(dt, nextLetter)` requires 2 parameters, pass empty string if no next letter

## Branch Management

This project uses feature branches. When merging branches with main:
- Main branch has the authoritative KeyboardController implementation
- Feature branches may have diverged with inline keyboard handling
- Always compare against main to avoid duplicating or removing functionality
- Key files to check during merges: `GameController.ts`, `Wave.ts`, `types.ts`, `main.ts`
