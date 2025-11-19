import type { planetName } from "../../types.ts";

export default class PlanetSelectScreenModel {
    private selectedPlanet: planetName | null;

    constructor() {
        this.selectedPlanet = null;
    }

    getSelectedPlanet(): planetName | null {
        return this.selectedPlanet;
    }

    setSelectedPlanet(planet: planetName): void {
        this.selectedPlanet = planet;
    }
}