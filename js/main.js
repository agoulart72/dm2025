import { GameEngine } from './engine/GameEngine.js';
import { InputManager } from './input/InputManager.js';
import { UIManager } from './ui/UIManager.js';
import { MapLoader } from './map/MapLoader.js';
import { Character } from './entities/Character.js';
import { EventSystem } from './events/EventSystem.js';
import { DataManager } from './data/DataManager.js';

class DungeonMaster2025 {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize game systems
        this.eventSystem = new EventSystem();
        this.gameEngine = new GameEngine(this.canvas, this.ctx, this.eventSystem);
        this.inputManager = new InputManager();
        this.uiManager = new UIManager();
        this.mapLoader = new MapLoader();
        this.dataManager = new DataManager();
        
        // Game state
        this.currentMap = null;
        this.characters = [];
        this.group = []; // Active group of characters (max 3)
        this.currentCharacterIndex = 0; // Index within the group
        this.turnOrder = []; // Characters ordered by AGI for turn rotation
        this.gameRunning = false;
        this.enemyTurnPhase = false; // Track when it's enemy turn
        
        // Set up event listeners for debugging
        this.setupEventListeners();
        
        this.init();
    }
    
    get player() {
        return this.group[this.currentCharacterIndex] || null;
    }
    
    async init() {
        try {
            // Load game data
            const gameData = this.dataManager.loadGame();
            
            // Load initial map
            this.currentMap = await this.mapLoader.loadMap('maps/tutorial.json', this.gameEngine);
            
            // Create characters from saved data or defaults
            this.createCharactersFromData(gameData.characters);

            console.log('Characters created:', this.characters);
            
            this.setupGroupFromData(gameData.group);

            // Ensure we have at least one character in the group
            if (this.group.length === 0 && this.characters.length > 0) {
                console.log('No characters in group, adding first character');
                this.setupGroup([0]);
            }
            
            // Add all group members to map
            this.group.forEach(character => {
                this.currentMap.addEntity(character);
            });
            
            // Initialize game engine
            this.gameEngine.setMap(this.currentMap);
            
            // Ensure sound system is initialized on the map
            if (this.currentMap && typeof this.currentMap.initializeSoundSystem === 'function') {
                this.currentMap.initializeSoundSystem();
            }
            
            if (this.player) {
                this.gameEngine.setPlayer(this.player);
            }
            
            console.log('Game engine initialized with player:', this.gameEngine.player);
            console.log('Player position:', this.gameEngine.player.x, this.gameEngine.player.y);
            console.log('Action points:', this.gameEngine.actionPoints);
            
            // Set up input handlers
            this.setupInputHandlers();
            
            // Set up UI handlers
            this.setupUIHandlers();
        
            // Set up character dialog handlers
            this.setupCharacterDialogHandlers();
            
            // Start game loop
            this.gameRunning = true;
            this.gameLoop();
            
            // Update UI
            this.uiManager.updateGroupInfo(this.group, this.player);
            this.uiManager.updateGameStats(this.gameEngine.getGameStats());
            
            // Update character dialog if it's open
            this.uiManager.updateCharacterDialogIfOpen(this.characters, this.player, this.group);
            
            // Emit game start event
            this.eventSystem.emit('game_start', {
                player: this.player,
                map: this.currentMap,
                turn: this.gameEngine.turn
            });
            
            console.log('Dungeon Master 2025 initialized successfully!');
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to load game. Please refresh the page.');
        }
    }
    
    setupInputHandlers() {
        // Movement controls
        this.inputManager.onKeyDown('ArrowUp', () => {
            if (this.gameEngine.canMovePlayer(0, -1)) {
                this.gameEngine.movePlayer(0, -1);
                this.updateUI();
            }
        });
        
        this.inputManager.onKeyDown('ArrowDown', () => {
            if (this.gameEngine.canMovePlayer(0, 1)) {
                this.gameEngine.movePlayer(0, 1);
                this.updateUI();
            }
        });
        
        this.inputManager.onKeyDown('ArrowLeft', () => {
            if (this.gameEngine.canMovePlayer(-1, 0)) {
                this.gameEngine.movePlayer(-1, 0);
                this.updateUI();
            }
        });
        
        this.inputManager.onKeyDown('ArrowRight', () => {
            if (this.gameEngine.canMovePlayer(1, 0)) {
                this.gameEngine.movePlayer(1, 0);
                this.updateUI();
            }
        });
        
        // End turn
        this.inputManager.onKeyDown('KeyQ', () => {
            this.endTurn();
        });
        
        // Reset game
        this.inputManager.onKeyDown('KeyR', () => {
            this.resetGame();
        });
        
        // Interact with doors
        this.inputManager.onKeyDown('KeyE', () => {
            this.interactWithDoor('open');
        });
        
        // Bash doors
        this.inputManager.onKeyDown('KeyB', () => {
            this.interactWithDoor('bash');
        });
        
        // Character dialog
        this.inputManager.onKeyDown('KeyC', () => {
            this.showCharacterDialog();
        });
        
        // Help dialog
        this.inputManager.onKeyDown('KeyH', () => {
            this.uiManager.showHelpDialog();
        });
        
        // Character switching
        this.inputManager.onKeyDown('Tab', () => {
            this.switchToNextCharacter();
        });
        
        this.inputManager.onKeyDown('ShiftLeft', () => {
            if (this.inputManager.isKeyPressed('Tab')) {
                this.switchToPreviousCharacter();
            }
        });
        
        // Skill shortcuts
        this.inputManager.onKeyDown('Digit1', () => {
            this.useSkillShortcut('Digit1');
        });
        
        this.inputManager.onKeyDown('Digit2', () => {
            this.useSkillShortcut('Digit2');
        });
        
        this.inputManager.onKeyDown('Digit3', () => {
            this.useSkillShortcut('Digit3');
        });
        
        // Mouse/touch for tile info
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.handleMouseMove(x, y);
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.hideTileInfo();
        });
    }
    
    setupUIHandlers() {
        document.getElementById('end-turn-btn').addEventListener('click', () => {
            this.endTurn();
        });
        
        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveGame();
        });
        
        document.getElementById('load-btn').addEventListener('click', () => {
            this.loadGame();
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('character-btn').addEventListener('click', () => {
            this.showCharacterDialog();
        });
        
        // Group navigation buttons
        document.getElementById('prev-character-btn').addEventListener('click', () => {
            this.switchToPreviousCharacter();
        });
        
        document.getElementById('next-character-btn').addEventListener('click', () => {
            this.switchToNextCharacter();
        });
        
        document.getElementById('help-btn').addEventListener('click', () => {
            this.uiManager.showHelpDialog();
        });
        
        // Set up character switch callback for UI
        this.uiManager.onCharacterSwitchRequested = (index) => {
            this.switchToGroupCharacter(index);
        };
    }
    
    setupCharacterDialogHandlers() {
        // Set up callbacks for the character dialog
        this.uiManager.setCharacterDialogCallbacks({
            onNewCharacterRequested: () => {
                this.createNewCharacter();
                this.uiManager.showCharacterDialog(this.characters, this.player, this.group);
                this.updateUI();
            },
            onClearGroupRequested: () => {
                this.setupGroup([]);
                this.uiManager.showCharacterDialog(this.characters, this.player, this.group);
                this.autoSaveGame();
            },
            onCharacterSelected: (characterId) => {
                // Just update the character details display (no group changes)
                const character = this.characters.find(c => c.id === characterId);
                if (character) {
                    this.uiManager.updateCharacterDialogIfOpen(this.characters, character, this.group);
                } else {
                    console.error('Character not found:', characterId);
                }
            },
            onCharacterToggled: (characterId) => {
                const characterIndex = this.characters.findIndex(c => c.id === characterId);
                if (characterIndex !== -1) {
                    this.toggleCharacterInGroup(characterIndex);
                } else {
                    console.error('Character not found:', characterId);
                }
            },
            onSkillImproved: (character) => {
                this.updateUI();
                this.autoSaveGame();
            }
        });
    }
    
    showCharacterDialog() {
        console.log('Showing character dialog');
        console.log('Characters:', this.characters);
        console.log('Player:', this.player);
        console.log('Group:', this.group);
        this.uiManager.showCharacterDialog(this.characters, this.player, this.group);
    }
    
    handleMouseMove(x, y) {
        // Convert mouse coordinates to world coordinates by adding camera offset
        const worldX = x + this.gameEngine.cameraX;
        const worldY = y + this.gameEngine.cameraY;
        
        // Calculate tile coordinates in world space
        const tileX = Math.floor(worldX / this.gameEngine.tileSize);
        const tileY = Math.floor(worldY / this.gameEngine.tileSize);
        
        if (tileX >= 0 && tileX < this.currentMap.width && 
            tileY >= 0 && tileY < this.currentMap.height) {
            this.showTileInfo(tileX, tileY, x, y);
        } else {
            this.hideTileInfo();
        }
    }
    
    showTileInfo(tileX, tileY, mouseX, mouseY) {
        const tile = this.currentMap.getTile(tileX, tileY);
        const entities = this.currentMap.getEntitiesAt(tileX, tileY);
        
        const tileInfo = document.getElementById('tile-info');
        let info = `<strong>Tile (${tileX}, ${tileY})</strong><br>`;
        info += `Type: ${tile.type}<br>`;
        
        if (entities.length > 0) {
            info += `<br><strong>Entities:</strong><br>`;
            entities.forEach(entity => {
                info += `• ${entity.name} (${entity.type})<br>`;
            });
        }
        
        tileInfo.innerHTML = info;
        tileInfo.style.display = 'block';
        tileInfo.style.left = mouseX + 10 + 'px';
        tileInfo.style.top = mouseY + 10 + 'px';
    }
    
    hideTileInfo() {
        document.getElementById('tile-info').style.display = 'none';
    }
    
    endTurn() {
        // Check if any character still has action points
        const charactersWithActions = this.group.filter(character => character.actionPoints > 0);
        
        if (charactersWithActions.length > 0) {
            // Show confirmation dialog
            this.showEndTurnConfirmation();
        } else {
            // No actions left, proceed directly to next round
            this.endGroupTurn();
        }
    }
    
    showEndTurnConfirmation() {
        const remainingActions = this.group.reduce((total, char) => total + char.actionPoints, 0);
        const message = `You have ${remainingActions} action point${remainingActions > 1 ? 's' : ''} remaining. Do you want to end the round and proceed to the next turn?`;
        
        if (confirm(message)) {
            this.endGroupTurn();
        }
    }
    
    interactWithDoor(action) {
        if (!this.player) return;
        
        // Check if player has action points
        if (this.player.actionPoints <= 0) {
            this.uiManager.showMessage(`No action points left to ${action} door.`, 'warning');
            return;
        }
        
        // Check all four directions for doors
        const directions = [
            { key: 'north', dx: 0, dy: -1 },
            { key: 'south', dx: 0, dy: 1 },
            { key: 'east', dx: 1, dy: 0 },
            { key: 'west', dx: -1, dy: 0 }
        ];
        
        for (const dir of directions) {
            const border = this.currentMap.getBorder(this.player.x, this.player.y, dir.key);
            if (border.type === 'door') {
                if (action === 'open') {
                    const wasOpen = border.open;
                    this.currentMap.toggleDoor(this.player.x, this.player.y, dir.key);
                    
                    if (wasOpen !== border.open) {
                        // Consume action point from the player character
                        this.player.actionPoints--;
                        this.updateUI();
                        console.log(`Door ${border.open ? 'opened' : 'closed'}!`);
                        this.uiManager.showMessage(`Door ${border.open ? 'opened' : 'closed'}!`, 'info');
                        
                        // Emit door open event
                        this.eventSystem.emit('door_open', {
                            player: this.player,
                            doorX: this.player.x,
                            doorY: this.player.y,
                            direction: dir.key,
                            newState: border.open ? 'opened' : 'closed',
                            actionPointsRemaining: this.player.actionPoints
                        });
                        return;
                    }
                } else if (action === 'bash') {
                    // Bash the door - destroy it
                    this.currentMap.destroyDoor(this.player.x, this.player.y, dir.key);
                    // Consume action point from the player character
                    this.player.actionPoints--;
                    this.updateUI();
                    console.log('Door bashed and destroyed!');
                    this.uiManager.showMessage('Door bashed and destroyed!', 'success');
                    
                    // Add sound event for door bashing
                    if (this.currentMap.addSoundEvent && typeof this.currentMap.addSoundEvent === 'function') {
                        this.currentMap.addSoundEvent(this.player.x, this.player.y, 2, 'door_bash');
                    }
                    
                    // Emit door bash event
                    this.eventSystem.emit('door_bash', {
                        player: this.player,
                        doorX: this.player.x,
                        doorY: this.player.y,
                        direction: dir.key,
                        actionPointsRemaining: this.player.actionPoints
                    });
                    return;
                }
            }
        }
        
        this.uiManager.showMessage(`No door nearby to ${action}.`, 'warning');
    }
    
    useSkillShortcut(keyCode) {
        if (!this.player) return;
        
        const skillName = this.player.getSkillShortcut(keyCode);
        if (!skillName) {
            this.uiManager.showMessage(`No skill assigned to key ${keyCode}`, 'warning');
            return;
        }
        
        if (!this.player.canUseSkill(skillName)) {
            this.uiManager.showMessage(`Cannot use ${skillName} - not enough action points or skill not available`, 'error');
            return;
        }
        
        const result = this.player.useSkill(skillName);
        if (result.success) {
            this.uiManager.showMessage(result.message, 'success');
            this.updateUI();
            
            // Add sound event for loud actions
            if (result.loudAction && this.currentMap && this.currentMap.addSoundEvent && typeof this.currentMap.addSoundEvent === 'function') {
                this.currentMap.addSoundEvent(this.player.x, this.player.y, 1, skillName);
            }
            
            // Emit skill use event
            this.eventSystem.emit('skill_used', {
                character: this.player,
                skill: skillName,
                result: result
            });
        } else {
            this.uiManager.showMessage(result.message, 'error');
        }
    }
    
    resetGame() {
        if (confirm('Are you sure you want to reset the game?')) {
            location.reload();
        }
    }
    
    updateUI() {
        this.uiManager.updateGroupInfo(this.group, this.player);
        this.uiManager.updateGameStats(this.gameEngine.getGameStats());
        this.uiManager.updateSkillShortcuts(this.player);
        
        // Show turn phase indicator
        if (this.enemyTurnPhase) {
            this.uiManager.showMessage('Enemy turn in progress...', 'info');
        }
        
        // Show end turn hint if actions are available
        if (this.hasRemainingActions()) {
            this.showEndTurnHint();
        }
    }
    
    showEndTurnHint() {
        const remainingActions = this.group.reduce((total, char) => total + char.actionPoints, 0);
        const hintElement = document.getElementById('end-turn-hint');
        
        if (hintElement) {
            if (remainingActions > 0) {
                hintElement.textContent = `Press Q or click "End Turn" to end round (${remainingActions} action${remainingActions > 1 ? 's' : ''} remaining)`;
                hintElement.style.display = 'block';
            } else {
                hintElement.style.display = 'none';
            }
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and render
        this.gameEngine.update();
        this.gameEngine.render();
                
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    processEnemyAI() {
        if (!this.currentMap) return;
        
        // Update sound events (with safety check)
        if (this.currentMap.updateSoundEvents && typeof this.currentMap.updateSoundEvents === 'function') {
            this.currentMap.updateSoundEvents();
        }
        
        // Only process enemy AI during enemy turn phase
        if (this.enemyTurnPhase) {
            this.processEnemyTurn();
        }
    }
    
    processEnemyTurn() {
        console.log('Processing enemy turn');
        if (!this.currentMap) return;
        
        // Get all enemies on the map
        const enemies = this.currentMap.allEntities.filter(entity => entity.type === 'enemy');
        
        console.log(`Processing ${enemies.length} enemies`);

        // Process each enemy's turn
        enemies.forEach(enemy => {
            console.log(`Processing enemy turn for : ${enemy.name}`);
            if (enemy.isAlive()) {
                // Restore action points for this enemy
                enemy.restoreActionPoints();
                
                // Process enemy AI until they run out of action points
                while (enemy.actionPoints > 0 && enemy.isAlive()) {
                    enemy.updateAI();
                }
            }
        });
        
        // End enemy turn phase
        this.enemyTurnPhase = false;
        
        console.log('Enemy turn completed');
    }
    
    createCharactersFromData(characterData) {
        this.characters = characterData.map(charData => new Character(charData));
    }

    setupGroupFromData(groupIds) {
        this.group = groupIds.map(id => this.characters.find(c => c.id === id));
    }
        
    createNewCharacter() {
        const characterClasses = ['warrior', 'mage', 'rogue', 'cleric'];
        const characterClass = characterClasses[Math.floor(Math.random() * characterClasses.length)];
        const type = "character";
        const names = ['Aria', 'Blade', 'Crystal', 'Dusk', 'Echo', 'Frost', 'Gale', 'Haven'];
        const name = names[Math.floor(Math.random() * names.length)];
        
        const character = new Character({
            id: `${type}-${Date.now()}`,
            name: name,
            type: type,
            characterClass: characterClass,
            x: 6,
            y: 6,
            level: 1,
            attributes: this.getRandomAttributes(type),
            skillPoints: 4
        });
        
        this.characters.push(character);
        
        // Add to group if there's room
        if (this.group.length < 3) {
            this.group.push(character);
            this.updateTurnOrder();
            this.switchToGroupCharacter(this.group.length - 1);
        }
        
        // Auto-save after creating new character
        this.autoSaveGame();
        
        return character;
    }
    
    getRandomAttributes(type) {
        const baseAttributes = {
            warrior: { BDY: 14, AGI: 12, INT: 10, WIL: 12, GNO: 8, SOL: 10 },
            mage: { BDY: 8, AGI: 10, INT: 16, WIL: 14, GNO: 12, SOL: 10 },
            rogue: { BDY: 10, AGI: 16, INT: 12, WIL: 10, GNO: 8, SOL: 12 },
            cleric: { BDY: 12, AGI: 10, INT: 12, WIL: 14, GNO: 14, SOL: 12 }
        };
        
        return baseAttributes[type] || baseAttributes.warrior;
    }
    
    switchCharacter(index) {
        if (index < 0 || index >= this.characters.length) return;
        
        // Remove current character from map
        if (this.player) {
            this.currentMap.removeEntity(this.player);
        }
        
        // Update current character index
        this.currentCharacterIndex = index;
        
        // Add new character to map and set as player
        const newPlayer = this.characters[index];
        this.currentMap.addEntity(newPlayer);
        this.gameEngine.setPlayer(newPlayer);
        
        // Update UI
        this.updateUI();
        
        // Update character dialog if it's open
        this.uiManager.updateCharacterDialogIfOpen(this.characters, this.player, this.group);
        
        console.log(`Switched to character: ${newPlayer.name} (${newPlayer.type})`);
    }
    
    // Group management methods
    setupGroup(characterIndices) {
        // Remove all current group members from map
        this.group.forEach(character => {
            this.currentMap.removeEntity(character);
        });
        
        // Clear current group
        this.group = [];
        this.currentCharacterIndex = 0;
        
        // Add characters to group
        characterIndices.forEach(index => {
            if (index >= 0 && index < this.characters.length) {
                this.group.push(this.characters[index]);
            }
        });
        
        // Add all group members to map
        this.group.forEach(character => {
            this.currentMap.addEntity(character);
        });
        
        // Sort group by AGI for turn order
        this.updateTurnOrder();
        
        // Set first character as active
        if (this.group.length > 0) {
            this.switchToGroupCharacter(0);
        }
        
        console.log(`Group set up with ${this.group.length} characters:`, this.group.map(c => c.name));
    }
        
    updateTurnOrder() {
        // Use group order for turn order (no AGI sorting)
        this.turnOrder = [...this.group];
        console.log('Turn order updated:', this.turnOrder.map(c => c.name));
    }
    
    switchToGroupCharacter(index) {
        if (index < 0 || index >= this.group.length) return;
        
        // Update current character index
        this.currentCharacterIndex = index;
        
        // Set new character as active player (without removing from map)
        const newPlayer = this.group[index];
        this.gameEngine.setPlayer(newPlayer);
        
        // Update UI
        this.updateUI();
        
        // Update character dialog if it's open
        this.uiManager.updateCharacterDialogIfOpen(this.characters, this.player, this.group);
        
        console.log(`Switched to group character: ${newPlayer.name} (${newPlayer.type})`);
    }
    
    nextCharacterTurn() {
        // Move to next character in group order
        const nextIndex = (this.currentCharacterIndex + 1) % this.group.length;
        this.switchToGroupCharacter(nextIndex);
    }
    
    // Method to check if any character has action points
    hasRemainingActions() {
        return this.group.some(character => character.actionPoints > 0);
    }
    
    switchToPreviousCharacter() {
        if (this.group.length <= 1) return;
        
        const currentIndex = this.currentCharacterIndex;
        const previousIndex = (currentIndex - 1 + this.group.length) % this.group.length;
        this.switchToGroupCharacter(previousIndex);
    }
    
    switchToNextCharacter() {
        if (this.group.length <= 1) return;
        
        const currentIndex = this.currentCharacterIndex;
        const nextIndex = (currentIndex + 1) % this.group.length;
        this.switchToGroupCharacter(nextIndex);
    }
    
    endGroupTurn() {
        // End the round and start a new one
        this.endRound();
    }
    
    endRound() {
        console.log('Ending round and starting new turn...');
        
        // Start enemy turn phase
        this.enemyTurnPhase = true;
        
        // Process enemy turns immediately
        this.processEnemyTurn();
        
        // Restore action points and reactions for all characters in group
        this.group.forEach(character => {
            character.restoreActionPoints();
            character.restoreReactions();
            console.log(`${character.name} restored ${character.actionPoints} action points and ${character.reactions} reactions`);
        });
        
        // Reset to first character in group order
        this.switchToGroupCharacter(0);
        
        // Attempt enemy spawning
        this.attemptEnemySpawn();
        
        // Update UI
        this.updateUI();
        
        console.log('Round ended, all characters restored action points');
        
        // Show round start message
        this.uiManager.showMessage('New round started!', 'info');
    }
    
    attemptEnemySpawn() {
        if (this.currentMap) {
            const spawnedEnemy = this.currentMap.attemptEnemySpawn();
            if (spawnedEnemy) {
                this.uiManager.showMessage(`A ${spawnedEnemy.name} has appeared!`, 'warning');
            }
        }
    }
    
    toggleCharacterInGroup(characterIndex) {
        const character = this.characters[characterIndex];
        const isInGroup = this.group.includes(character);
        
        if (isInGroup) {
            // Remove from group and map
            this.group = this.group.filter(c => c !== character);
            this.currentMap.removeEntity(character);
            console.log(`Removed ${character.name} from group`);
        } else {
            // Add to group (if not at max)
            if (this.group.length < 3) {
                this.group.push(character);
                // Ensure character is at their current saved position
                this.currentMap.addEntity(character);
                console.log(`Added ${character.name} to group at position (${character.x}, ${character.y})`);
            } else {
                console.log('Group is full (max 3 characters)');
                return;
            }
        }
        
        // Update turn order
        this.updateTurnOrder();
        
        // If group is empty, clear current player
        if (this.group.length === 0) {
            this.currentCharacterIndex = 0;
        } else {
            // Switch to first character in group if current player is not in group
            if (!this.group.includes(this.player)) {
                this.switchToGroupCharacter(0);
            }
        }
        
        // Update UI
        this.updateUI();
        
        // Update character dialog if it's open
        this.uiManager.updateCharacterDialogIfOpen(this.characters, this.player, this.group);
        
        // Auto-save after group changes
        this.autoSaveGame();
    }
    
    setupEventListeners() {
        // Listen to all events for debugging
        this.eventSystem.on('*', (event) => {
            console.log('🎯 Event:', event.type, event.data);
        });
        
        // Listen to specific events
        this.eventSystem.on('turn_start', (event) => {
            console.log(`🔄 Turn ${event.data.turn} started with ${event.data.actionPoints} action points`);
        });
        
        this.eventSystem.on('turn_end', (event) => {
            console.log(`⏹️ Turn ${event.data.turn} ended, spent ${event.data.actionPointsSpent} action points`);
        });
        
        this.eventSystem.on('player_move', (event) => {
            console.log(`🚶 Player moved from (${event.data.fromX}, ${event.data.fromY}) to (${event.data.toX}, ${event.data.toY})`);
        });
        
        this.eventSystem.on('door_open', (event) => {
            console.log(`🚪 Door ${event.data.newState} at (${event.data.doorX}, ${event.data.doorY}) ${event.data.direction}`);
        });
        
        this.eventSystem.on('door_bash', (event) => {
            console.log(`💥 Door bashed at (${event.data.doorX}, ${event.data.doorY}) ${event.data.direction}`);
        });
        
        this.eventSystem.on('game_start', (event) => {
            console.log(`🎮 Game started with player at (${event.data.player.x}, ${event.data.player.y})`);
        });
        
        this.eventSystem.on('enemy_attack', (event) => {
            console.log(`⚔️ Enemy attack: ${event.data.enemy.name} attacks ${event.data.target.name} for ${event.data.damage} damage`);
            this.uiManager.showMessage(`${event.data.enemy.name} attacks ${event.data.target.name} for ${event.data.damage} damage!`, 'warning');
        });
    }
    
    saveGame() {
        const success = this.dataManager.saveGame({
            characters: this.characters,
            group: this.group,
            currentCharacterIndex: this.currentCharacterIndex,
            turnOrder: this.turnOrder,
            gameEngine: this.gameEngine,
            currentMap: this.currentMap,
            player: this.player
        });
        
        if (success) {
            this.uiManager.showMessage('Game saved successfully!', 'success');
        } else {
            this.uiManager.showMessage('Failed to save game!', 'error');
        }
    }
    
    autoSaveGame() {
        const success = this.dataManager.saveGame({
            characters: this.characters,
            group: this.group,
            currentCharacterIndex: this.currentCharacterIndex,
            turnOrder: this.turnOrder,
            gameEngine: this.gameEngine,
            currentMap: this.currentMap,
            player: this.player
        });
        
        if (success) {
            console.log('Game auto-saved successfully');
        } else {
            console.error('Failed to auto-save game');
        }
    }
    
    loadGame() {
        // Reload the page to load the saved game
        window.location.reload();
    }
    
    showError(message) {
        alert(message);
    }
    

}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DungeonMaster2025();
});
