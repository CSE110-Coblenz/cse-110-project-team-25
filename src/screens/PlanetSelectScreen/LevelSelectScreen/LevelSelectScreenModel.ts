<<<<<<< HEAD
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { BaseMenuView } from "../base/BaseMenuView.ts";
=======
/**
 * LevelSelectScreenModel - Data model for level select screen
 * Tracks available levels and selected level
 */
export class LevelSelectScreenModel {
    private selectedLevel: number = 1;
    private totalLevels: number = 5;

    constructor() {}
    
    getSelectedLevel(): number {
        return this.selectedLevel;
    }

    setSelectedLevel(level: number): void {
        if (level >= 1 && level <= this.totalLevels) {
            this.selectedLevel = level;
        }
    }
}
>>>>>>> a75aa57e0126830395aa410617705b04eba1c791
