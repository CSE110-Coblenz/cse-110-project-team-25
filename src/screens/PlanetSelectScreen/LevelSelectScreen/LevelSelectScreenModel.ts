import type { planetName } from "../../../types.ts";

/**
 * LevelSelectScreenModel - Data model for level select screen
 * Tracks available levels and selected level
 */
export class LevelSelectScreenModel {
    private selectedLevel: number = 1;
    private totalLevels: number = 0;
    private planetType: planetName;

    constructor(planetType: planetName) {
        this.planetType = planetType;
    }
    
    getSelectedLevel(): number {
        return this.selectedLevel;
    }

    setSelectedLevel(level: number): void {
        if (level >= 1 && level <= this.totalLevels) {
            this.selectedLevel = level;
        }
    }

    getPlanetType(): planetName {
        return this.planetType;
    }

    setTotalLevels(count: number): void {
        this.totalLevels = count;
    }

    getTotalLevels(): number {
        return this.totalLevels;
    }
}
