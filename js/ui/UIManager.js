import { CharacterDialogManager } from './CharacterDialogManager.js';

export class UIManager {
    constructor() {
        this.elements = {
            actionPoints: document.getElementById('action-points'),
            turnCounter: document.getElementById('turn-counter'),
            charName: document.getElementById('char-name'),
            charHp: document.getElementById('char-hp'),
            charLevel: document.getElementById('char-level'),
            selectedCharacter: document.getElementById('selected-character'),
            groupMembers: document.getElementById('group-members'),
            prevCharacterBtn: document.getElementById('prev-character-btn'),
            nextCharacterBtn: document.getElementById('next-character-btn')
        };
        
        this.characterDialog = new CharacterDialogManager();
    }
    
    updateCharacterInfo(character) {
        if (!character) return;
        
        // Update character details
        this.elements.charName.textContent = character.name;
        this.elements.charHp.textContent = `${character.currentHp}/${character.maxHp}`;
        this.elements.charLevel.textContent = character.level;
        
        // Update character sprite
        this.updateCharacterSprite(character);
    }
    
    updateGroupInfo(group, currentCharacter) {
        if (!group || group.length === 0) return;
        
        // Update character info for the active character
        this.updateCharacterInfo(currentCharacter);
        
        // Add group indicator to character name
        const charNameElement = this.elements.charName;
        if (charNameElement) {
            const groupIndex = group.findIndex(c => c === currentCharacter) + 1;
            charNameElement.textContent = `${currentCharacter.name} (${groupIndex}/${group.length})`;
        }
        
        // Update group switcher interface
        this.updateGroupSwitcher(group, currentCharacter);
    }
    
    updateGroupSwitcher(group, currentCharacter) {
        const groupMembersElement = this.elements.groupMembers;
        if (!groupMembersElement) return;
        
        // Clear existing group members
        groupMembersElement.innerHTML = '';
        
        // Create group member elements
        group.forEach((character, index) => {
            const isActive = character === currentCharacter;
            const hasActionPoints = character.actionPoints > 0;
            
            const memberElement = document.createElement('div');
            memberElement.className = `group-member ${isActive ? 'active' : 'inactive'}`;
            memberElement.dataset.characterIndex = index;
            
            // Character sprite
            const spriteElement = document.createElement('div');
            spriteElement.className = 'group-member-sprite';
            spriteElement.textContent = this.getCharacterSprite(character.type);
            
            // Character name
            const nameElement = document.createElement('div');
            nameElement.className = 'group-member-name';
            nameElement.textContent = character.name;
            
            // Action points
            const apElement = document.createElement('div');
            apElement.className = 'group-member-ap';
            apElement.textContent = `${character.actionPoints}/${character.maxActionPoints}`;
            
            // Status indicator
            const statusElement = document.createElement('div');
            statusElement.className = 'group-member-status';
            
            if (isActive) {
                statusElement.textContent = 'Active';
                statusElement.classList.add('active');
            } else if (!hasActionPoints) {
                statusElement.textContent = 'No AP';
                statusElement.classList.add('no-ap');
            } else {
                statusElement.textContent = 'Ready';
                statusElement.classList.add('inactive');
            }
            
            // Assemble the member element
            memberElement.appendChild(spriteElement);
            memberElement.appendChild(nameElement);
            memberElement.appendChild(apElement);
            memberElement.appendChild(statusElement);
            
            // Add click handler to switch to this character
            memberElement.addEventListener('click', () => {
                if (this.onCharacterSwitchRequested) {
                    this.onCharacterSwitchRequested(index);
                }
            });
            
            groupMembersElement.appendChild(memberElement);
        });
        
        // Update navigation buttons
        this.updateNavigationButtons(group, currentCharacter);
    }
    
    updateNavigationButtons(group, currentCharacter) {
        const prevBtn = this.elements.prevCharacterBtn;
        const nextBtn = this.elements.nextCharacterBtn;
        
        if (!prevBtn || !nextBtn) return;
        
        const currentIndex = group.findIndex(c => c === currentCharacter);
        const hasMultipleMembers = group.length > 1;
        
        // Previous button
        prevBtn.disabled = !hasMultipleMembers;
        prevBtn.style.opacity = hasMultipleMembers ? '1' : '0.5';
        
        // Next button
        nextBtn.disabled = !hasMultipleMembers;
        nextBtn.style.opacity = hasMultipleMembers ? '1' : '0.5';
    }
    
    getCharacterSprite(type) {
        switch (type) {
            case 'warrior': return '⚔️';
            case 'mage': return '🔮';
            case 'rogue': return '🗡️';
            case 'cleric': return '⛪';
            default: return '👤';
        }
    }
    
    updateCharacterSprite(character) {
        const spriteElement = this.elements.selectedCharacter;
        
        // Clear existing content
        spriteElement.innerHTML = '';
        
        // Create character symbol based on type
        let symbol = '?';
        let color = '#ffffff';
        
        switch (character.type) {
            case 'warrior':
                symbol = '⚔️';
                color = '#ff6b6b';
                break;
            case 'mage':
                symbol = '🔮';
                color = '#4ecdc4';
                break;
            case 'rogue':
                symbol = '🗡️';
                color = '#98fb98';
                break;
            case 'cleric':
                symbol = '⛪';
                color = '#ffd700';
                break;
            default:
                symbol = '👤';
                color = '#ffffff';
        }
        
        // Create and style the symbol
        const symbolElement = document.createElement('div');
        symbolElement.textContent = symbol;
        symbolElement.style.fontSize = '2rem';
        symbolElement.style.color = color;
        symbolElement.style.textAlign = 'center';
        symbolElement.style.lineHeight = '60px';
        
        spriteElement.appendChild(symbolElement);
    }
    
    // Character dialog delegation methods
    showCharacterDialog(characters, currentCharacter, group = []) {
        this.characterDialog.show(characters, currentCharacter, group);
    }
    
    hideCharacterDialog() {
        this.characterDialog.hide();
    }
    
    updateCharacterDialog(character) {
        this.characterDialog.updateCharacterDetails(character);
    }
    
    updateCharacterDialogIfOpen(characters, currentCharacter, group = []) {
        // Only update if the dialog is currently open
        if (this.characterDialog.dialog && this.characterDialog.dialog.style.display === 'block') {
            this.characterDialog.show(characters, currentCharacter, group);
        }
    }
    
    setCharacterDialogCallbacks(callbacks) {
        if (callbacks.onNewCharacterRequested) {
            this.characterDialog.setOnNewCharacterRequested(callbacks.onNewCharacterRequested);
        }
        if (callbacks.onClearGroupRequested) {
            this.characterDialog.setOnClearGroupRequested(callbacks.onClearGroupRequested);
        }
        if (callbacks.onCharacterSelected) {
            this.characterDialog.setOnCharacterSelected(callbacks.onCharacterSelected);
        }
        if (callbacks.onCharacterToggled) {
            this.characterDialog.setOnCharacterToggled(callbacks.onCharacterToggled);
        }
        if (callbacks.onSkillImproved) {
            this.characterDialog.setOnSkillImproved(callbacks.onSkillImproved);
        }
    }
    
    updateGameStats(stats) {
        if (!stats) return;
        
        // Update action points
        if (this.elements.actionPoints) {
            this.elements.actionPoints.textContent = stats.actionPoints;
            
            // Add visual feedback for low action points
            if (stats.actionPoints <= 0) {
                this.elements.actionPoints.style.color = '#ff6b6b';
                this.elements.actionPoints.style.animation = 'pulse 1s infinite';
            } else if (stats.actionPoints <= 1) {
                this.elements.actionPoints.style.color = '#ffa500';
                this.elements.actionPoints.style.animation = 'none';
            } else {
                this.elements.actionPoints.style.color = '#4ecdc4';
                this.elements.actionPoints.style.animation = 'none';
            }
        }
        
        // Update turn counter
        if (this.elements.turnCounter) {
            this.elements.turnCounter.textContent = stats.turn;
        }
    }
    
    updateSkillShortcuts(character) {
        if (!character || !character.skillShortcuts) return;
        
        // Find or create skill shortcuts display
        let shortcutsContainer = document.getElementById('skill-shortcuts');
        if (!shortcutsContainer) {
            shortcutsContainer = document.createElement('div');
            shortcutsContainer.id = 'skill-shortcuts';
            shortcutsContainer.className = 'skill-shortcuts';
            
            // Insert after the game stats
            const gameStats = document.querySelector('.game-stats');
            if (gameStats) {
                gameStats.parentNode.insertBefore(shortcutsContainer, gameStats.nextSibling);
            }
        }
        
        // Clear existing shortcuts
        shortcutsContainer.innerHTML = '';
        
        // Add title
        const title = document.createElement('h3');
        title.textContent = 'Skill Shortcuts';
        shortcutsContainer.appendChild(title);
        
        // Add skill shortcuts
        Object.entries(character.skillShortcuts).forEach(([key, skillName]) => {
            const shortcutElement = document.createElement('div');
            shortcutElement.className = 'skill-shortcut';
            
            const keyElement = document.createElement('span');
            keyElement.className = 'shortcut-key';
            keyElement.textContent = key.replace('Digit', '');
            
            const skillElement = document.createElement('span');
            skillElement.className = 'shortcut-skill';
            skillElement.textContent = character.skills[skillName]?.name || skillName;
            
            const costElement = document.createElement('span');
            costElement.className = 'shortcut-cost';
            const skillCost = character.skills[skillName]?.level > 0 ? 1 : 2;
            costElement.textContent = `${skillCost} AP`;
            
            shortcutElement.appendChild(keyElement);
            shortcutElement.appendChild(skillElement);
            shortcutElement.appendChild(costElement);
            shortcutsContainer.appendChild(shortcutElement);
        });
    }
    

    

    

    
    showMessage(message, type = 'info') {
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `game-message game-message-${type}`;
        messageElement.textContent = message;
        
        // Style the message
        messageElement.style.position = 'fixed';
        messageElement.style.top = '20px';
        messageElement.style.left = '50%';
        messageElement.style.transform = 'translateX(-50%)';
        messageElement.style.padding = '10px 20px';
        messageElement.style.borderRadius = '5px';
        messageElement.style.color = 'white';
        messageElement.style.fontWeight = 'bold';
        messageElement.style.zIndex = '1000';
        messageElement.style.animation = 'fadeInOut 3s ease-in-out';
        
        // Set background color based on type
        switch (type) {
            case 'success':
                messageElement.style.backgroundColor = '#4ecdc4';
                break;
            case 'error':
                messageElement.style.backgroundColor = '#ff6b6b';
                break;
            case 'warning':
                messageElement.style.backgroundColor = '#ffa500';
                break;
            default:
                messageElement.style.backgroundColor = '#4a4a6a';
        }
        
        // Add to document
        document.body.appendChild(messageElement);
        
        // Remove after animation
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 3000);
    }
    
    showTileInfo(tileX, tileY, tile, entities) {
        const tileInfo = document.getElementById('tile-info');
        if (!tileInfo) return;
        
        let info = `<strong>Tile (${tileX}, ${tileY})</strong><br>`;
        info += `Type: ${tile.type}<br>`;
        info += `Walkable: ${tile.walkable ? 'Yes' : 'No'}<br>`;
        
        if (entities && entities.length > 0) {
            info += `<br><strong>Entities (${entities.length}):</strong><br>`;
            entities.forEach(entity => {
                info += `• ${entity.name} (${entity.type})<br>`;
                if (entity.currentHp !== undefined) {
                    info += `  HP: ${entity.currentHp}/${entity.maxHp}<br>`;
                }
            });
        }
        
        tileInfo.innerHTML = info;
        tileInfo.style.display = 'block';
    }
    
    hideTileInfo() {
        const tileInfo = document.getElementById('tile-info');
        if (tileInfo) {
            tileInfo.style.display = 'none';
        }
    }
    
    updateHealthBar(character) {
        const hpElement = this.elements.charHp;
        if (!hpElement || !character) return;
        
        const percentage = (character.currentHp / character.maxHp) * 100;
        
        // Update text
        hpElement.textContent = `${character.currentHp}/${character.maxHp}`;
        
        // Update color based on health percentage
        if (percentage <= 25) {
            hpElement.style.color = '#ff6b6b';
        } else if (percentage <= 50) {
            hpElement.style.color = '#ffa500';
        } else {
            hpElement.style.color = '#4ecdc4';
        }
    }
    
    showGameOver() {
        this.showMessage('Game Over! Press R to restart.', 'error');
    }
    
    showVictory() {
        this.showMessage('Victory! You have completed the dungeon!', 'success');
    }
}
