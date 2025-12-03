import type { planetName } from "../../../types.ts";
import { TutorialLevelSelectView } from "./TutorialLevelSelectView.ts";
import { CampaignLevelSelectView } from "./CampaignLevelSelectView.ts";
import { BaseLevelSelectView } from "./BaseLevelSelectView.ts";

/**
 * LevelSelectScreenView - Factory for creating planet-specific level selection views
 */
export class LevelSelectScreenView {
    private view: BaseLevelSelectView;

    constructor(onLevelSelect: (level: number) => void, onBackClick: () => void, planetType: planetName, onShopClick?: () => void) {
        // Create the appropriate view based on planet type
        if (planetType === "tutorial_planet") {
            this.view = new TutorialLevelSelectView(onLevelSelect, onBackClick, planetType, onShopClick);
        } else {
            this.view = new CampaignLevelSelectView(onLevelSelect, onBackClick, planetType, onShopClick);
        }
    }

    public getGroup() {
        return this.view.getGroup();
    }

    public show(): void {
        this.view.show();
    }

    public hide(): void {
        this.view.hide();
    }

    /**
     * Refresh the underlying view (rebuild layout to pick up unlock changes)
     */
    public refresh(): void {
        // Delegate to inner view which is a BaseLevelSelectView subclass
        // @ts-ignore - subclasses implement rebuild
        if (typeof (this.view as any).rebuild === 'function') {
            (this.view as any).rebuild();
        }
    }
}
