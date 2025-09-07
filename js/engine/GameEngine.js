export class GameEngine {
    constructor(canvas, ctx, eventSystem) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.eventSystem = eventSystem;
        this.tileSize = 64; // 64x64 pixel tiles
        
        // Game state
        this.map = null;
        this.player = null;
        this.turn = 1;
        this.actionPoints = 3;
        this.maxActionPoints = 3;
        
        // Rendering
        this.cameraX = 0;
        this.cameraY = 0;
        
        // Character images
        this.characterImages = {};
        this.loadCharacterImages();
        
        // Tile colors for different types
        this.tileColors = {
            floor: '#4a4a6a',
            wall: '#2a2a4a',
            door: '#8b4513',
            stairs: '#ffd700',
            water: '#4169e1',
            lava: '#ff4500'
        };
        
        // Entity colors
        this.entityColors = {
            player: '#4ecdc4',
            enemy: '#ff6b6b',
            npc: '#98fb98',
            item: '#ffd700'
        };
    }
    
    setMap(map) {
        this.map = map;
        this.centerCameraOnPlayer();
    }
    
    setPlayer(player) {
        this.player = player;
        this.centerCameraOnPlayer();
    }
    
    loadCharacterImages() {
        const characterTypes = ['warrior', 'mage', 'rogue', 'cleric'];
        console.log('Loading character images for types:', characterTypes);
        
        characterTypes.forEach(type => {
            this.loadCharacterImage(type);
        });
    }
    
    loadCharacterImage(type) {
        const img = new Image();
        
        img.onload = () => {
            console.log(`Loaded character image for ${type}`);
            // Store the image type for potential special handling
            img.isSVG = img.src.endsWith('.svg');
            this.characterImages[type] = img;
        };
        
        img.onerror = () => {
            console.warn(`Failed to load SVG for ${type}, trying PNG...`);
            // Try PNG as fallback
            const pngImg = new Image();
            pngImg.onload = () => {
                console.log(`Loaded PNG character image for ${type}`);
                pngImg.isSVG = false;
                this.characterImages[type] = pngImg;
            };
            pngImg.onerror = () => {
                console.warn(`Failed to load both SVG and PNG for ${type}`);
            };
            pngImg.src = `assets/tokens/${type}.png`;
        };
        
        // Try SVG first for better resolution
        img.src = `assets/tokens/${type}.svg`;
    }
    
    centerCameraOnPlayer() {
        if (this.player && this.map) {
            this.cameraX = this.player.x * this.tileSize - this.canvas.width / 2;
            this.cameraY = this.player.y * this.tileSize - this.canvas.height / 2;
            
            // Clamp camera to map bounds
            this.cameraX = Math.max(0, Math.min(this.cameraX, this.map.width * this.tileSize - this.canvas.width));
            this.cameraY = Math.max(0, Math.min(this.cameraY, this.map.height * this.tileSize - this.canvas.height));
        }
    }
    
    canMovePlayer(dx, dy) {
        if (!this.player) {
            return false;
        }
        
        // Check if player has action points
        if (this.player.actionPoints <= 0) {
            return false;
        }
        
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        // Check map bounds
        if (newX < 0 || newX >= this.map.width || newY < 0 || newY >= this.map.height) {
            return false;
        }
        
        // Check if movement is blocked by borders
        if (!this.map.canMoveBetween(this.player.x, this.player.y, newX, newY)) {
            return false;
        }
        
        // Check if tile is walkable
        const tile = this.map.getTile(newX, newY);
        if (!tile.walkable) {
            return false;
        }
        
        return true;
    }
    
    movePlayer(dx, dy) {
        if (!this.canMovePlayer(dx, dy)) return false;
        
        // Remove player from current tile
        this.map.removeEntity(this.player);
        
        // Update player position
        this.player.x += dx;
        this.player.y += dy;
        
        // Add player to new tile
        this.map.addEntity(this.player);
        
        // Consume action point from the player character
        this.player.actionPoints--;
        
        // Center camera on player
        this.centerCameraOnPlayer();
        
        // Emit player move event
        if (this.eventSystem) {
            this.eventSystem.emit('player_move', {
                player: this.player,
                fromX: this.player.x - dx,
                fromY: this.player.y - dy,
                toX: this.player.x,
                toY: this.player.y,
                actionPointsRemaining: this.player.actionPoints
            });
        }
        
        return true;
    }
        
    update() {
        // Update game logic here
        // For now, just ensure camera follows player
        this.centerCameraOnPlayer();
    }
    
    render() {
        if (!this.map) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate visible tile range
        const startX = Math.floor(this.cameraX / this.tileSize);
        const startY = Math.floor(this.cameraY / this.tileSize);
        const endX = Math.min(startX + Math.ceil(this.canvas.width / this.tileSize) + 1, this.map.width);
        const endY = Math.min(startY + Math.ceil(this.canvas.height / this.tileSize) + 1, this.map.height);
        
        // Render tiles
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                this.renderTile(x, y);
            }
        }
        
        // Render entities
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                this.renderEntitiesAt(x, y);
            }
        }
        
        // Render UI overlays
        this.renderUI();
        
        // Render spawn point indicator (for debugging)
        this.renderSpawnPoint();
    }
    
    renderSpawnPoint() {
        if (!this.map || !this.map.spawnPoint) return;
        
        const screenX = this.map.spawnPoint.x * this.tileSize - this.cameraX;
        const screenY = this.map.spawnPoint.y * this.tileSize - this.cameraY;
        
        // Draw spawn point indicator
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(screenX + 2, screenY + 2, this.tileSize - 4, this.tileSize - 4);
        this.ctx.setLineDash([]);
        
        // Draw spawn point text
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SPAWN', screenX + this.tileSize / 2, screenY + this.tileSize / 2);
    }
    
    renderTile(x, y) {
        const tile = this.map.getTile(x, y);
        const screenX = x * this.tileSize - this.cameraX;
        const screenY = y * this.tileSize - this.cameraY;
        
        // Fill tile background
        this.ctx.fillStyle = this.tileColors[tile.type] || '#4a4a6a';
        this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
        
        // Draw tile border
        this.ctx.strokeStyle = '#2a2a4a';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
        
        // Render borders around this tile
        this.renderBorders(x, y, screenX, screenY);
        
        // Highlight current player tile (disabled to test for visual artifacts)
        // if (this.player && this.player.x === x && this.player.y === y) {
        //     this.ctx.strokeStyle = '#4ecdc4';
        //     this.ctx.lineWidth = 2;
        //     this.ctx.strokeRect(screenX + 1, screenY + 1, this.tileSize - 2, this.tileSize - 2);
        // }
    }
    
    renderBorders(x, y, screenX, screenY) {
        const borderSize = 4; // Thickness of border lines
        
        // Check each direction for borders
        const directions = [
            { dir: 'north', x: screenX, y: screenY, width: this.tileSize, height: borderSize },
            { dir: 'south', x: screenX, y: screenY + this.tileSize - borderSize, width: this.tileSize, height: borderSize },
            { dir: 'east', x: screenX + this.tileSize - borderSize, y: screenY, width: borderSize, height: this.tileSize },
            { dir: 'west', x: screenX, y: screenY, width: borderSize, height: this.tileSize }
        ];
        
        directions.forEach(direction => {
            const border = this.map.getBorder(x, y, direction.dir);
            
            if (border.type === 'wall') {
                this.ctx.fillStyle = '#2a2a4a';
                this.ctx.fillRect(direction.x, direction.y, direction.width, direction.height);
            } else if (border.type === 'door') {
                if (border.open) {
                    // Door is open - draw a clear opening with door frame
                    this.ctx.fillStyle = '#8b4513';
                    this.ctx.fillRect(direction.x, direction.y, direction.width, direction.height);
                    
                    // Draw a larger opening in the middle
                    this.ctx.fillStyle = '#4a4a6a';
                    const gapSize = 4;
                    const gapX = direction.x + (direction.width - gapSize) / 2;
                    const gapY = direction.y + (direction.height - gapSize) / 2;
                    this.ctx.fillRect(gapX, gapY, gapSize, gapSize);
                    
                    // Draw door frame outline
                    this.ctx.strokeStyle = '#654321';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(direction.x, direction.y, direction.width, direction.height);
                    
                    // Add visual indicator that door is open
                    this.ctx.fillStyle = '#4ecdc4';
                    this.ctx.fillRect(direction.x + 1, direction.y + 1, 2, 2);
                    this.ctx.fillRect(direction.x + direction.width - 3, direction.y + 1, 2, 2);
                } else {
                    // Door is closed - draw solid door
                    this.ctx.fillStyle = '#8b4513';
                    this.ctx.fillRect(direction.x, direction.y, direction.width, direction.height);
                    
                    // Draw door handle
                    this.ctx.fillStyle = '#ffd700';
                    const handleSize = 2;
                    const handleX = direction.x + (direction.width - handleSize) / 2;
                    const handleY = direction.y + (direction.height - handleSize) / 2;
                    this.ctx.fillRect(handleX, handleY, handleSize, handleSize);
                    
                    // Draw door outline
                    this.ctx.strokeStyle = '#654321';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(direction.x, direction.y, direction.width, direction.height);
                }
            }
        });
    }
    
    renderEntitiesAt(x, y) {
        const entities = this.map.getEntitiesAt(x, y);
        if (entities.length === 0) return;
        
        const screenX = x * this.tileSize - this.cameraX;
        const screenY = y * this.tileSize - this.cameraY;
        
        // Calculate positions based on number of entities
        const positions = this.calculateEntityPositions(entities.length);
        
        entities.forEach((entity, index) => {
            const position = positions[index];
            const entityX = screenX + position.x * this.tileSize;
            const entityY = screenY + position.y * this.tileSize;
            const entitySize = this.tileSize * 0.4; // Slightly larger for images            

            // Check if this is a character with an image
            if (this.characterImages[entity.characterClass]) {
                const img = this.characterImages[entity.characterClass];
                if (img.complete && img.naturalHeight !== 0) {
                    // Draw colored background circle first
                    const circleRadius = entitySize / 2;
                    this.ctx.save();
                    
                    // Get character-specific color
                    const characterColors = {
                        'warrior': '#8B4513', // Brown
                        'mage': '#4B0082',    // Purple
                        'rogue': '#2F4F4F',   // Dark slate gray
                        'cleric': '#FFD700'   // Gold
                    };
                    
                    const bgColor = characterColors[entity.characterClass] || '#4ecdc4';
                    
                    // Draw background circle
                    this.ctx.fillStyle = bgColor;
                    this.ctx.beginPath();
                    this.ctx.arc(entityX, entityY, circleRadius, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Draw a subtle border around the circle
                    this.ctx.strokeStyle = '#000000';
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                    
                    // Draw character image on top with improved quality
                    const imgSize = entitySize;
                    this.ctx.globalAlpha = 0.9; // Slight transparency
                    
                    // Enable image smoothing for better quality
                    this.ctx.imageSmoothingEnabled = true;
                    this.ctx.imageSmoothingQuality = 'high';
                    
                    this.ctx.drawImage(
                        img, 
                        entityX - imgSize/2, 
                        entityY - imgSize/2, 
                        imgSize, 
                        imgSize
                    );
                    this.ctx.restore();
                } else {
                    console.log(`Image not ready for ${entity.characterType}, falling back to circle`);
                    // Fallback to circle if image not loaded
                    this.drawEntityCircle(entityX, entityY, entitySize, entity);
                }
            } else {
                // Draw other entity types as circles
                this.drawEntityCircle(entityX, entityY, entitySize, entity);
            }
        });
    }
    
    drawEntityCircle(entityX, entityY, entitySize, entity) {
        // Draw entity circle
        this.ctx.fillStyle = this.entityColors[entity.type] || '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(entityX, entityY, entitySize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw entity border
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Draw entity symbol
        this.ctx.fillStyle = '#000000';
        this.ctx.font = `${entitySize * 0.6}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        let symbol = '?';
        switch (entity.type) {
            case 'player':
                symbol = 'P';
                break;
            case 'enemy':
                symbol = 'E';
                break;
            case 'npc':
                symbol = 'N';
                break;
            case 'item':
                symbol = 'I';
                break;
        }
        
        this.ctx.fillText(symbol, entityX, entityY);
    }
    
    calculateEntityPositions(count) {
        const positions = [];
        
        if (count === 1) {
            // Single entity in center
            positions.push({ x: 0.5, y: 0.5 });
        } else if (count === 2) {
            // Two entities side by side
            positions.push({ x: 0.3, y: 0.5 });
            positions.push({ x: 0.7, y: 0.5 });
        } else if (count === 3) {
            // Three entities in triangle formation
            positions.push({ x: 0.5, y: 0.3 });
            positions.push({ x: 0.3, y: 0.7 });
            positions.push({ x: 0.7, y: 0.7 });
        } else if (count === 4) {
            // Four entities in corners
            positions.push({ x: 0.3, y: 0.3 });
            positions.push({ x: 0.7, y: 0.3 });
            positions.push({ x: 0.3, y: 0.7 });
            positions.push({ x: 0.7, y: 0.7 });
        } else {
            // For more than 4 entities, use a grid pattern
            const gridSize = Math.ceil(Math.sqrt(count));
            const spacing = 0.8 / gridSize;
            const offset = (1 - spacing * (gridSize - 1)) / 2;
            
            for (let i = 0; i < count; i++) {
                const gridX = i % gridSize;
                const gridY = Math.floor(i / gridSize);
                positions.push({
                    x: offset + gridX * spacing,
                    y: offset + gridY * spacing
                });
            }
        }
        
        return positions;
    }
    
    renderUI() {
        // Draw action points indicator
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 30);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Actions: ${this.actionPoints}/${this.maxActionPoints}`, 20, 30);
        
        // Draw turn indicator
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 50, 150, 30);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`Turn: ${this.turn}`, 20, 70);
        
        // Draw movement hint when no actions left
        if (this.actionPoints <= 0) {
            this.ctx.fillStyle = 'rgba(255, 193, 7, 0.8)';
            this.ctx.fillRect(10, 90, 350, 30);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText('Press any action key to auto-end turn and continue', 20, 110);
        }
    }
    
    getGameStats() {
        return {
            turn: this.turn,
            actionPoints: this.player ? this.player.actionPoints : 0,
            maxActionPoints: this.player ? this.player.maxActionPoints : 0
        };
    }
}
