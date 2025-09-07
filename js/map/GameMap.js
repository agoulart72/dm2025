import { Character } from '../entities/Character.js';
import { Enemy } from '../entities/Enemy.js';
import { MonsterLoader } from '../data/MonsterLoader.js';

export class GameMap {
    constructor(mapData, gameEngine = null) {
        this.name = mapData.name || 'Unknown Map';
        this.width = mapData.width;
        this.height = mapData.height;
        this.tiles = mapData.tiles;
        this.borders = mapData.borders || { horizontal: [], vertical: [] };
        this.gameEngine = gameEngine;
        this.monsterLoader = new MonsterLoader();
        
        // Entity management - organized by position for quick lookup
        this.entities = new Map(); // key: "x,y", value: array of entities
        this.allEntities = []; // flat list of all entities
        
        // Enemy spawning system
        this.spawnPoint = null;
        this.spawnChance = 0.3; // 30% chance per turn
        this.maxEnemies = 5; // Maximum enemies on map at once
        
        // Sound event system
        this.soundEvents = []; // Array of recent sound events
        this.soundEventDuration = 3; // How many turns sound events last
        
        // Store entities data for later initialization
        this.entitiesData = mapData.entities || [];
        
        // Set up spawn point
        this.setupSpawnPoint();
        
        // Ensure sound system is initialized
        this.initializeSoundSystem();
    }
    
    async initialize() {
        // Initialize monster loader
        await this.initializeMonsterLoader();
        
        // Now initialize entities with monster data available
        this.initializeEntities(this.entitiesData);
    }
    
    async initializeMonsterLoader() {
        try {
            await this.monsterLoader.loadMonsters();
        } catch (error) {
            console.error('Failed to initialize monster loader:', error);
        }
    }
    
    initializeSoundSystem() {
        // Ensure sound system properties exist
        if (!this.soundEvents) {
            this.soundEvents = [];
        }
        if (!this.soundEventDuration) {
            this.soundEventDuration = 3;
        }
        
        // Ensure sound system methods exist
        if (!this.addSoundEvent) {
            this.addSoundEvent = (x, y, intensity = 1, source = 'unknown') => {
                const soundEvent = {
                    x: x,
                    y: y,
                    intensity: intensity,
                    source: source,
                    duration: this.soundEventDuration,
                    turn: 1
                };
                this.soundEvents.push(soundEvent);
                console.log(`Sound event: ${source} at (${x}, ${y}) with intensity ${intensity}`);
            };
        }
        
        if (!this.updateSoundEvents) {
            this.updateSoundEvents = () => {
                this.soundEvents = this.soundEvents.filter(event => event.duration > 0);
                this.soundEvents.forEach(event => {
                    event.duration--;
                });
            };
        }
        
        if (!this.getSoundEventsInRange) {
            this.getSoundEventsInRange = (x, y, range) => {
                return this.soundEvents.filter(event => {
                    const distance = this.getDistance(x, y, event.x, event.y);
                    return distance <= range && event.duration > 0;
                });
            };
        }
    }
    
    initializeEntities(entitiesData) {
        entitiesData.forEach(entityData => {
            let entity;
            
            if (entityData.type === 'enemy') {
                // For enemies, merge with monster data from monsters.json
                const enemyData = this.createEnemyDataFromMap(entityData);
                entity = new Enemy(enemyData);
            } else {
                entity = new Character(entityData);
            }
            
            this.addEntity(entity);
        });
    }
    
    setupSpawnPoint() {
        // Find a random walkable tile for spawning
        const walkableTiles = [];
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.getTile(x, y);
                if (tile.walkable && this.getEntitiesAt(x, y).length === 0) {
                    walkableTiles.push({ x, y });
                }
            }
        }
        
        if (walkableTiles.length > 0) {
            const randomTile = walkableTiles[Math.floor(Math.random() * walkableTiles.length)];
            this.spawnPoint = randomTile;
            console.log(`Enemy spawn point set at (${this.spawnPoint.x}, ${this.spawnPoint.y})`);
        } else {
            console.warn('No suitable spawn point found!');
        }
    }
    
    getEnemyCount() {
        return this.allEntities.filter(entity => entity.type === 'enemy').length;
    }
    
    canSpawnEnemy() {
        if (!this.spawnPoint) return false;
        if (this.getEnemyCount() >= this.maxEnemies) return false;
        
        // Check if spawn point is clear
        const entitiesAtSpawn = this.getEntitiesAt(this.spawnPoint.x, this.spawnPoint.y);
        return entitiesAtSpawn.length === 0;
    }
    
    spawnEnemy() {
        if (!this.canSpawnEnemy()) return null;
        
        // Select random enemy type from monster loader
        const enemyType = this.monsterLoader.getRandomMonsterType();
        const enemyData = this.createEnemyData(enemyType);
        
        const enemy = new Enemy(enemyData);
        this.addEntity(enemy);
        
        console.log(`Enemy ${enemy.name} (${enemyType}) spawned at (${this.spawnPoint.x}, ${this.spawnPoint.y})`);
        return enemy;
    }
    
    createEnemyData(enemyType) {
        // Get monster data from the loader
        const monsterData = this.monsterLoader.getMonsterData(enemyType);
        if (!monsterData) {
            console.error(`Monster type '${enemyType}' not found in monster data`);
            return null;
        }
        
        // Get a random variant name
        const variantName = this.monsterLoader.getRandomVariant(enemyType);
        
        const baseData = {
            id: `${enemyType}-${Date.now()}`,
            name: variantName,
            type: 'enemy',
            enemyType: enemyType,
            x: this.spawnPoint.x,
            y: this.spawnPoint.y,
            level: 1,
            experience: 0
        };
        
        // Combine base data with monster stats from JSON
        return {
            ...baseData,
            attributes: monsterData.attributes,
            maxHp: monsterData.stats.maxHp,
            currentHp: monsterData.stats.maxHp,
            actionPoints: monsterData.stats.actionPoints,
            maxActionPoints: monsterData.stats.maxActionPoints,
            attack: monsterData.stats.attack,
            defense: monsterData.stats.defense,
            speed: monsterData.stats.speed,
            attackRange: monsterData.stats.attackRange,
            visionRange: monsterData.stats.visionRange,
            soundRange: monsterData.stats.soundRange,
            experienceValue: monsterData.rewards.experienceValue,
            goldValue: monsterData.rewards.goldValue,
            ai: monsterData.ai || 'patrol'
        };
    }
    
    createEnemyDataFromMap(mapEntityData) {
        // Determine enemy type from the name (assuming name matches monster type)
        const enemyType = mapEntityData.name.toLowerCase();
        
        // Get monster data from the loader
        const monsterData = this.monsterLoader.getMonsterData(enemyType);
        if (!monsterData) {
            console.error(`Monster type '${enemyType}' not found in monster data`);
            // Fallback to basic enemy data
            return {
                ...mapEntityData,
                type: 'enemy',
                enemyType: enemyType,
                attackRange: 1,
                visionRange: 3,
                soundRange: 6,
                ai: 'patrol'
            };
        }
        
        // Get a random variant name
        const variantName = this.monsterLoader.getRandomVariant(enemyType);
        
        // Merge map entity data with monster data
        return {
            ...mapEntityData, // Map data takes precedence for position, HP, etc.
            name: variantName, // Use variant name from monster data
            type: 'enemy',
            enemyType: enemyType,
            attributes: monsterData.attributes,
            actionPoints: monsterData.stats.actionPoints,
            maxActionPoints: monsterData.stats.maxActionPoints,
            attack: monsterData.stats.attack,
            defense: monsterData.stats.defense,
            speed: monsterData.stats.speed,
            attackRange: monsterData.stats.attackRange,
            visionRange: monsterData.stats.visionRange,
            soundRange: monsterData.stats.soundRange,
            experienceValue: monsterData.rewards.experienceValue,
            goldValue: monsterData.rewards.goldValue,
            ai: monsterData.ai || 'patrol'
        };
    }
    

    
    attemptEnemySpawn() {
        if (Math.random() < this.spawnChance && this.canSpawnEnemy()) {
            return this.spawnEnemy();
        }
        return null;
    }
    
    // Sound event system
    addSoundEvent(x, y, intensity = 1, source = 'unknown') {
        const soundEvent = {
            x: x,
            y: y,
            intensity: intensity,
            source: source,
            duration: this.soundEventDuration,
            turn: this.currentTurn || 1
        };
        
        this.soundEvents.push(soundEvent);
        console.log(`Sound event: ${source} at (${x}, ${y}) with intensity ${intensity}`);
    }
    
    updateSoundEvents() {
        // Remove expired sound events
        this.soundEvents = this.soundEvents.filter(event => event.duration > 0);
        
        // Decrease duration of remaining events
        this.soundEvents.forEach(event => {
            event.duration--;
        });
    }
    
    getSoundEventsInRange(x, y, range) {
        return this.soundEvents.filter(event => {
            const distance = this.getDistance(x, y, event.x, event.y);
            return distance <= range && event.duration > 0;
        });
    }
    
    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return { type: 'wall', walkable: false };
        }
        return this.tiles[y][x];
    }
    
    getBorder(x, y, direction) {
        // direction: 'north', 'south', 'east', 'west'
        switch (direction) {
            case 'north':
                if (y > 0 && this.borders.horizontal[y - 1] && this.borders.horizontal[y - 1][x]) {
                    return this.borders.horizontal[y - 1][x];
                }
                break;
            case 'south':
                if (y < this.height - 1 && this.borders.horizontal[y] && this.borders.horizontal[y][x]) {
                    return this.borders.horizontal[y][x];
                }
                break;
            case 'east':
                if (x < this.width - 1 && this.borders.vertical[y] && this.borders.vertical[y][x]) {
                    return this.borders.vertical[y][x];
                }
                break;
            case 'west':
                if (x > 0 && this.borders.vertical[y] && this.borders.vertical[y][x - 1]) {
                    return this.borders.vertical[y][x - 1];
                }
                break;
        }
        return { type: 'none', walkable: true };
    }
    
    canMoveBetween(fromX, fromY, toX, toY) {
        // Check if movement is blocked by a border
        const dx = toX - fromX;
        const dy = toY - fromY;
        
        if (dx === 1) { // Moving east
            const border = this.getBorder(fromX, fromY, 'east');
            if (border.type === 'wall') return false;
            if (border.type === 'door' && !border.open) return false;
            return true;
        } else if (dx === -1) { // Moving west
            const border = this.getBorder(fromX, fromY, 'west');
            if (border.type === 'wall') return false;
            if (border.type === 'door' && !border.open) return false;
            return true;
        } else if (dy === 1) { // Moving south
            const border = this.getBorder(fromX, fromY, 'south');
            if (border.type === 'wall') return false;
            if (border.type === 'door' && !border.open) return false;
            return true;
        } else if (dy === -1) { // Moving north
            const border = this.getBorder(fromX, fromY, 'north');
            if (border.type === 'wall') return false;
            if (border.type === 'door' && !border.open) return false;
            return true;
        }
        
        return true;
    }
    
    setBorder(x, y, direction, borderData) {
        switch (direction) {
            case 'north':
                if (y > 0 && this.borders.horizontal[y - 1]) {
                    this.borders.horizontal[y - 1][x] = { ...borderData };
                }
                break;
            case 'south':
                if (y < this.height - 1 && this.borders.horizontal[y]) {
                    this.borders.horizontal[y][x] = { ...borderData };
                }
                break;
            case 'east':
                if (x < this.width - 1 && this.borders.vertical[y]) {
                    this.borders.vertical[y][x] = { ...borderData };
                }
                break;
            case 'west':
                if (x > 0 && this.borders.vertical[y]) {
                    this.borders.vertical[y][x - 1] = { ...borderData };
                }
                break;
        }
    }
    
    toggleDoor(x, y, direction) {
        const border = this.getBorder(x, y, direction);
        if (border.type === 'door') {
            border.open = !border.open;
            this.setBorder(x, y, direction, border);
            return border.open;
        }
        return false;
    }
    
    destroyDoor(x, y, direction) {
        // Replace door with an open passage (no border)
        this.setBorder(x, y, direction, { type: 'none', walkable: true });
        return true;
    }
    
    setTile(x, y, tileData) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.tiles[y][x] = { ...tileData };
        }
    }
    
    addEntity(entity) {
        const key = `${entity.x},${entity.y}`;
        
        if (!this.entities.has(key)) {
            this.entities.set(key, []);
        }
        
        this.entities.get(key).push(entity);
        this.allEntities.push(entity);
        
        // Update entity's reference to this map
        entity.map = this;
    }
    
    removeEntity(entity) {
        const key = `${entity.x},${entity.y}`;
        
        if (this.entities.has(key)) {
            const entitiesAtPosition = this.entities.get(key);
            const index = entitiesAtPosition.indexOf(entity);
            
            if (index > -1) {
                entitiesAtPosition.splice(index, 1);
                
                // Remove the position key if no entities remain
                if (entitiesAtPosition.length === 0) {
                    this.entities.delete(key);
                }
            }
        }
        
        // Remove from all entities list
        const allIndex = this.allEntities.indexOf(entity);
        if (allIndex > -1) {
            this.allEntities.splice(allIndex, 1);
        }
        
        // Clear entity's map reference
        entity.map = null;
    }
    
    moveEntity(entity, newX, newY) {
        // Check if movement is allowed
        if (!this.canMoveBetween(entity.x, entity.y, newX, newY)) {
            return false;
        }
        
        // Remove from current position
        this.removeEntity(entity);
        
        // Update entity position
        entity.x = newX;
        entity.y = newY;
        
        // Add to new position
        this.addEntity(entity);
        
        return true;
    }
    
    getEntitiesAt(x, y) {
        const key = `${x},${y}`;
        return this.entities.get(key) || [];
    }
    
    getPlayer() {
        return this.allEntities.find(entity => entity.type === 'player' || entity.type === 'character');
    }
    
    // Method for enemy AI to check if a position is walkable
    isWalkableForEnemy(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        
        const tile = this.getTile(x, y);
        if (!tile.walkable) return false;
        
        return true;
    }
    
    getDistance(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1); // Manhattan distance
    }
    
    getEntitiesByType(type) {
        return this.allEntities.filter(entity => entity.type === type);
    }
    
    getPlayer() {
        return this.allEntities.find(entity => entity.type === 'player');
    }
    
    getEnemies() {
        return this.getEntitiesByType('enemy');
    }
    
    isWalkable(x, y) {
        const tile = this.getTile(x, y);
        if (!tile.walkable) return false;
        
        // Check if tile is full (max 16 entities per tile)
        const entitiesAtPosition = this.getEntitiesAt(x, y);
        return entitiesAtPosition.length < 16;
    }
    
    canPlaceEntity(x, y, entityType = null) {
        if (!this.isWalkable(x, y)) return false;
        
        // Additional checks for specific entity types could go here
        // For example, some entities might not be able to share tiles with others
        
        return true;
    }
    
    getAdjacentTiles(x, y) {
        const adjacent = [];
        const directions = [
            { dx: -1, dy: 0, direction: 'west' }, // left
            { dx: 1, dy: 0, direction: 'east' },  // right
            { dx: 0, dy: -1, direction: 'north' }, // up
            { dx: 0, dy: 1, direction: 'south' }   // down
        ];
        
        directions.forEach(dir => {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            
            if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height) {
                // Check if movement is blocked by borders
                if (this.canMoveBetween(x, y, newX, newY)) {
                    adjacent.push({
                        x: newX,
                        y: newY,
                        tile: this.getTile(newX, newY),
                        entities: this.getEntitiesAt(newX, newY),
                        border: this.getBorder(x, y, dir.direction)
                    });
                }
            }
        });
        
        return adjacent;
    }
    
    getDistance(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1); // Manhattan distance
    }
    
    findPath(startX, startY, endX, endY) {
        // Simple A* pathfinding implementation
        const openSet = [{ x: startX, y: startY, g: 0, h: this.getDistance(startX, startY, endX, endY) }];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        gScore.set(`${startX},${startY}`, 0);
        fScore.set(`${startX},${startY}`, this.getDistance(startX, startY, endX, endY));
        
        while (openSet.length > 0) {
            // Find node with lowest f score
            openSet.sort((a, b) => a.g + a.h - (b.g + b.h));
            const current = openSet.shift();
            
            if (current.x === endX && current.y === endY) {
                // Reconstruct path
                const path = [];
                let currentPos = `${endX},${endY}`;
                
                while (cameFrom.has(currentPos)) {
                    const [x, y] = currentPos.split(',').map(Number);
                    path.unshift({ x, y });
                    currentPos = cameFrom.get(currentPos);
                }
                
                path.unshift({ x: startX, y: startY });
                return path;
            }
            
            closedSet.add(`${current.x},${current.y}`);
            
            // Check neighbors
            const neighbors = this.getAdjacentTiles(current.x, current.y);
            neighbors.forEach(neighbor => {
                if (closedSet.has(`${neighbor.x},${neighbor.y}`)) {
                    return;
                }
                
                const tentativeG = gScore.get(`${current.x},${current.y}`) + 1;
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                
                if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, `${current.x},${current.y}`);
                    gScore.set(neighborKey, tentativeG);
                    fScore.set(neighborKey, tentativeG + this.getDistance(neighbor.x, neighbor.y, endX, endY));
                    
                    if (!openSet.find(node => node.x === neighbor.x && node.y === neighbor.y)) {
                        openSet.push({
                            x: neighbor.x,
                            y: neighbor.y,
                            g: tentativeG,
                            h: this.getDistance(neighbor.x, neighbor.y, endX, endY)
                        });
                    }
                }
            });
        }
        
        return null; // No path found
    }
    
    // Utility methods for map analysis
    getEmptyTiles() {
        const empty = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.isWalkable(x, y) && this.getEntitiesAt(x, y).length === 0) {
                    empty.push({ x, y });
                }
            }
        }
        return empty;
    }
    
    getRandomEmptyTile() {
        const emptyTiles = this.getEmptyTiles();
        if (emptyTiles.length === 0) return null;
        
        return emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    }
    
    // Serialization for saving/loading
    toJSON() {
        return {
            name: this.name,
            width: this.width,
            height: this.height,
            tiles: this.tiles,
            borders: this.borders,
            entities: this.allEntities.map(entity => entity.toJSON())
        };
    }
}
