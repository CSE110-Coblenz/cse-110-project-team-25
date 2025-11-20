import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { BaseMenuView } from "../base/BaseMenuView.ts";
import type { planetName } from "../../types.ts";
import Background from "../../objects/Background.ts";

/**
 * PlanetSelectScreenView - Renders the planet selection screen
 */
export default class PlanetSelectScreenView extends BaseMenuView {
    private onBackClick: () => void;
    private onLevelClick: (planetName: planetName) => void;
    private planets: Konva.Group[] = [];
    private planetData: Array<{ name: planetName; label: string; x: number; y: number }> = [
        { name: "tutorial_planet", label: "Earth", x: STAGE_WIDTH * 0.2, y: STAGE_HEIGHT * 0.35 },
        { name: "campaign_planet", label: "L'maarxion", x: STAGE_WIDTH * 0.8, y: STAGE_HEIGHT * 0.55 },
    ];
    private panoramicBackground: Konva.Group | null = null;
    private isTransitioning: boolean = false;

    constructor(onBackClick: () => void, onPlanetClick: (planetName: planetName) => void) {
        super("#0f0f23", false); // Don't auto-build
        this.onBackClick = onBackClick;
        this.onLevelClick = onPlanetClick;
        
        // Replace the default background with planetSelect.png
        // Initial draw to make elements visible
        this.group.getLayer()?.draw();
    }

    /**
     * Creates background konva for planet select screen
     */
    private createPlanetSelectBackground(): void {
        const bgGroup = new Konva.Group({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            listening: false,
        });

        const imageObj = new Image();
        imageObj.onload = () => {
            const bgImage = new Konva.Image({
                image: imageObj,
                x: 0,
                y: 0,
                width: STAGE_WIDTH,
                height: STAGE_HEIGHT,
            });
            
            // Add image to group first
            bgGroup.add(bgImage);
            
            // Apply brightness filter
            bgImage.cache();
            bgImage.filters([Konva.Filters.Brightness]);
            bgImage.brightness(-0.5);
            
            bgGroup.zIndex(0);
            
            // Redraw the layer to apply the filter
            this.group.getLayer()?.batchDraw();
        };
        imageObj.src = "/assets/backgrounds/planetselectbg.png";

        this.background = new Background(bgGroup);
        this.group.add(this.background.image);
        this.background.image.zIndex(0); // Ensure it's at the back
    }

    protected buildLayout(): void {
        // Create title
        const title = this.createTitle("SELECT YOUR Planet", {
            fontSize: 42,
            fontFamily: "Times New Roman",
            fill: "white",
        });
        this.positionElement(title, STAGE_WIDTH / 2, 80);

        // Create planet buttons
        this.createPlanetButtons();

        // Create back button
        const backBtn = this.createButton({
            text: "BACK",
            width: 150,
            height: 50,
            fill: "gray",
            hoverFill: "lightgray",
            stroke: "darkgray",
            strokeWidth: 3,
            fontSize: 20,
            onClick: this.onBackClick,
        });
        this.positionElement(backBtn, STAGE_WIDTH / 2, STAGE_HEIGHT - 80);
    }

    /**
     * Create planet buttons for level selection
     */
    private createPlanetButtons(): void {
        this.planetData.forEach((planet) => {
            const planetGroup = new Konva.Group({
                x: planet.x, // Start at final position
                y: planet.y,
            });

            // Load planet image
            const imageObj = new Image();
            imageObj.onload = () => {
                const planetImage = new Konva.Image({
                    image: imageObj,
                    width: 150,
                    height: 150,
                    offsetX: 75,
                    offsetY: 75,
                });
                
                planetImage.zIndex(10);

                // Add hover effect
                planetImage.on("mouseenter", () => {
                    planetImage.scale({ x: 1.1, y: 1.1 });
                    document.body.style.cursor = "pointer";
                });

                planetImage.on("mouseleave", () => {
                    planetImage.scale({ x: 1, y: 1 });
                    document.body.style.cursor = "default";
                });

                planetImage.on("click", () => {
                    this.onLevelClick(planet.name);
                });

                planetGroup.add(planetImage);

                // Add label below planet
                const label = new Konva.Text({
                    text: planet.label,
                    fontSize: 20,
                    fontFamily: "Arial",
                    fill: "white",
                    stroke: "black",
                    strokeWidth: 1,
                    align: "center",
                    y: 85,
                    offsetX: 0,
                });
                label.offsetX(label.width() / 2);
                planetGroup.add(label);
                // Redraw the layer after adding the image
                this.group.getLayer()?.draw();
            };
            imageObj.src = `/assets/planets/${planet.name}.png`;

            this.planets.push(planetGroup);
            this.group.add(planetGroup);
        });
    }

    /**
     * Perform panoramic transition from space1 to planetSelect
     * Combines both backgrounds side-by-side and pans right (180 degrees)
     */
    public startPanoramicTransition(onComplete: () => void): void {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Move planets off-screen to the right before starting transition
        this.planetData.forEach((planetInfo, index) => {
            const planet = this.planets[index];
            if (planet) {
                planet.x(planetInfo.x + STAGE_WIDTH);
            }
        });

        // Create panoramic background container
        this.panoramicBackground = new Konva.Group({
            x: 0,
            y: 0,
        });

        // Load both backgrounds
        const space1Img = new Image();
        const planetSelectImg = new Image();
        
        let loadedCount = 0;
        const onImageLoad = () => {
            loadedCount++;
            if (loadedCount === 2) {
                // Both images loaded, create panorama
                this.createPanorama(space1Img, planetSelectImg, onComplete.bind(this));
            }
        };

        space1Img.onload = onImageLoad;
        planetSelectImg.onload = onImageLoad;
        space1Img.src = "/assets/backgrounds/space.png";
        planetSelectImg.src = "/assets/backgrounds/planetselectbg.png";
    }

    /**
     * Create and animate the panoramic background
     */
    private createPanorama(space1Img: HTMLImageElement, planetSelectImg: HTMLImageElement, onComplete?: () => void): void {
        if (!this.panoramicBackground) return;

        // Create first background (space1) on the left
        const bg1 = new Konva.Image({
            image: space1Img,
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
        });

        // Create second background (planetSelect) on the right
        const bg2 = new Konva.Image({
            image: planetSelectImg,
            x: STAGE_WIDTH,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
        });

        this.panoramicBackground.add(bg1);
        // this.panoramicBackground.add(bg2);

        // Add panoramic background to the group (behind everything else)
        this.panoramicBackground.zIndex(0);
        this.group.add(this.panoramicBackground);

        // Animate the panoramic pan (move left, revealing planetSelect)
        const panDuration = 2; // 2 seconds
        const anim = new Konva.Animation((frame) => {
            if (!frame || !this.panoramicBackground) return;
            
            const time = frame.time / 1000; // Convert to seconds
            const progress = Math.min(time / panDuration, 1);
            
            // Move background left to reveal planetSelect
            this.panoramicBackground.x(-STAGE_WIDTH * progress);

            // Slide planets from right to left
            this.planetData.forEach((planetInfo, index) => {
                const planet = this.planets[index];
                if (planet) {
                    const startX = planetInfo.x + STAGE_WIDTH;
                    planet.x(startX - (STAGE_WIDTH * progress));
                }
            });

            if (progress >= 1) {
                anim.stop();
                this.isTransitioning = false;
                
                // Ensure planets are at their final positions
                this.planetData.forEach((planetInfo, index) => {
                    const planet = this.planets[index];
                    if (planet) {
                        planet.x(planetInfo.x);
                    }
                });
                
                if (onComplete) {
                    onComplete();

                }
            }
        }, this.group.getLayer());

        anim.start();
    }

    private onTransitionComplete(): void {
        this.background.image.destroy();
        this.createPlanetSelectBackground();
        this.buildLayout();
    }
    /**
     * Override show to make screen visible without animation
     */
    public show(): void {
        this.group.visible(true);
        this.group.getLayer()?.draw();
    }

    /**
     * Show with panoramic transition animation
     */
    public showWithTransition(): void {
        this.group.visible(true);
        this.startPanoramicTransition(this.onTransitionComplete);
    }

    public hide(): void {
        this.group.visible(false);
    }

    public getGroup(): Konva.Group {
        return this.group;
    }
}
