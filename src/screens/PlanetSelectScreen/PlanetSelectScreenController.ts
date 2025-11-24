import type { planetName } from "../../types.ts";
import { BaseMenuController } from "../base/BaseMenuController.ts";
import type { ScreenSwitcher } from "../../types.ts";
import PlanetSelectScreenView from "./PlanetSelectScreenView.ts";
import PlanetSelectScreenModel from "./PlanetSelectScreenModel.ts";

/**
 * PlanetSelectScreenController - Controls the planet selection screen
 */
export default class PlanetSelectScreenController extends BaseMenuController {
    private model: PlanetSelectScreenModel;
    
	constructor(screenSwitcher: ScreenSwitcher) {
		super(screenSwitcher);
		this.view = new PlanetSelectScreenView(
			() => this.handleBackClick(),
			(planet: planetName) => this.handlePlanetClick(planet)
		);
        this.model = new PlanetSelectScreenModel();
	}

    private handleBackClick(): void {
        console.log("Back button clicked from Level Select");
        this.screenSwitcher.switchToScreen({type: "menu"});
    }

    private handlePlanetClick(planet: planetName): void {
        console.log(`Planet selected: ${planet}`);
        this.screenSwitcher.switchToScreen({type: "levelSelect", planetType: planet});
        this.model.setSelectedPlanet(planet);
    }

    public getView(): PlanetSelectScreenView {
        return this.view as PlanetSelectScreenView;
    }

    public getSelectedPlanet(): planetName | null {
        return this.model.getSelectedPlanet();
    }

}


