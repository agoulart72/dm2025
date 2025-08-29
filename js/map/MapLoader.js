import { GameMap } from './GameMap.js';

export class MapLoader {
    constructor() {
        this.loadedMaps = new Map();
    }
    
    async loadMap(mapPath, gameEngine = null) {
        // Check if map is already loaded
        if (this.loadedMaps.has(mapPath)) {
            const map = this.loadedMaps.get(mapPath);
            // Update game engine reference if provided
            if (gameEngine) {
                map.gameEngine = gameEngine;
            }
            return map;
        }
        
        try {
            // Load map from JSON file
            const response = await fetch(mapPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const mapData = await response.json();
            const map = new GameMap(mapData, gameEngine);
            await map.initialize();
            this.loadedMaps.set(mapPath, map);
            
            return map;
            
        } catch (error) {
            console.error(`Failed to load map: ${mapPath}`, error);
            throw new Error(`Failed to load map: ${mapPath}`);
        }
    }
    
    clearCache() {
        this.loadedMaps.clear();
    }
}
