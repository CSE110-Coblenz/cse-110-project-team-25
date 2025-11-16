# Level Customization Guide

This guide explains how to create and customize levels using JSON files.

## Overview

Levels can now be customized using JSON configuration files. Each level contains multiple waves, and each wave contains multiple enemies with customizable properties.

## Level JSON Structure

### Top-Level Fields

```json
{
  "levelNumber": 1,           // Optional: display level number (defaults to 1)
  "difficulty": 1.0,          // Optional: difficulty multiplier (affects speed, health)
  "waves": [                  // Required: array of wave configurations
    { /* wave config */ }
  ]
}
```

### Wave Configuration Fields

Each wave object contains enemy definitions:

```json
{
  "types": {
    "1": "circle",            // Required: enemy type by index
    "2": "ufo",
    "3": "meteor"
  },
  "health": [1, 1, 2],        // Optional: health for each enemy (default: 1)
  "speed": [5, 6, 7],         // Optional: movement speed (default: 6)
  "distance": [40, 45, 50],   // Optional: initial Z-distance from player (default: 40)
  "words": ["hello", "world", "test"],  // Optional: word for each enemy (auto-generated if missing)
  "x": [-1, 0, 1]             // Optional: lane position (-3 to +3, default: 0)
}
```

## Enemy Types

Supported enemy types:
- `circle` - Basic circular enemy
- `ufo` - UFO-shaped enemy
- `meteor` - Meteor enemy
- `amiiba` - Amiiba enemy (splits on destroy)
- `shooter` - Shooter enemy (fires projectiles)
- `comet` - Comet enemy
- `dummy` - Dummy enemy (for testing)

## Configuration Array Format

All attribute arrays must have the same length as the number of enemies defined in the `types` object.

If an array is shorter than the number of enemies, it will **repeat** the pattern. For example:
- If `types` has 5 enemies but `speed` has only 2 values `[5, 7]`, it will expand to `[5, 7, 5, 7, 5]`

## Usage

### In Code

```typescript
// Load a custom level
const levelManager = new LevelManager(view, screenSwitcher);
await levelManager.loadLevelFromJSON('/levels/level1.json');

// Or use playCustomLevel to set level number first
await levelManager.playCustomLevel('/levels/level2.json', 2);

// Or load with fallback to random generation
await levelManager.loadOrGenerateLevel('/levels/custom.json');
```

## Example Levels

### Simple Level (3 enemies per wave)

```json
{
  "levelNumber": 1,
  "waves": [
    {
      "types": {
        "1": "circle",
        "2": "circle",
        "3": "ufo"
      },
      "health": [1, 1, 1],
      "speed": [5, 5, 6],
      "distance": [40, 45, 50],
      "words": ["hello", "world", "test"],
      "x": [-1, 0, 1]
    }
  ]
}
```

### Progressive Difficulty Level

```json
{
  "levelNumber": 3,
  "difficulty": 1.5,
  "waves": [
    {
      "types": {
        "1": "circle",
        "2": "circle"
      },
      "health": [1, 1],
      "speed": [5, 5],
      "distance": [50, 55],
      "words": ["easy", "start"]
    },
    {
      "types": {
        "1": "ufo",
        "2": "meteor",
        "3": "circle"
      },
      "health": [1, 2, 1],
      "speed": [6, 7, 6],
      "distance": [40, 45, 50],
      "words": ["medium", "harder", "challenge"]
    },
    {
      "types": {
        "1": "meteor",
        "2": "meteor",
        "3": "ufo",
        "4": "circle"
      },
      "health": [2, 2, 2, 1],
      "speed": [8, 8.5, 8, 7],
      "distance": [35, 40, 45, 50],
      "words": ["hard", "extreme", "boss", "final"]
    }
  ]
}
```

## Tips

1. **Waves per Level**: Start with 2-3 waves per level for a good difficulty progression
2. **Health and Speed**: Increase both as you add more waves to create progression
3. **Word Length**: Longer words are harder to type, consider mix of short and long
4. **Lanes**: Spread enemies across lanes using `x` values from -3 to +3
5. **Distance**: Lower values = enemies start closer, higher values = start farther away
6. **Array Patterns**: Use array repetition for consistent difficulty patterns

## Default Values

If a field is omitted or an array is too short:
- `health`: defaults to `1`
- `speed`: defaults to `6`
- `distance`: defaults to `40`
- `x`: defaults to `0`
- `words`: auto-generated from word bank

## Files Included

- `level1.json` - Tutorial/introduction level
- `level2.json` - Intermediate level with increased difficulty
- `template.json` - Template for creating custom levels
