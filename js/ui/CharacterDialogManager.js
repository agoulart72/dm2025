export class CharacterDialogManager {
    constructor() {
        this.dialog = null;
        this.characterList = null;
        this.newCharacterBtn = null;
        this.clearGroupBtn = null;
        this.closeBtn = null;
        this.attributesContainer = null;
        this.skillsContainer = null;
        
        this.initializeElements();
        this.setupEventListeners();
    }
    
    initializeElements() {
        this.dialog = document.getElementById('character-dialog');
        this.characterList = document.getElementById('character-list');
        this.newCharacterBtn = document.getElementById('new-character-btn');
        this.clearGroupBtn = document.getElementById('clear-group-btn');
        this.closeBtn = this.dialog?.querySelector('.close');
        this.attributesContainer = document.getElementById('character-attributes');
        this.skillsContainer = document.getElementById('character-skills');
        
        if (!this.dialog) {
            console.error('Character dialog element not found!');
        }
    }
    
    setupEventListeners() {
        if (!this.dialog) return;
        
        // Close dialog
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }
        
        // Close dialog when clicking outside
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog) {
                this.hide();
            }
        });
        
        // Create new character
        if (this.newCharacterBtn) {
            this.newCharacterBtn.addEventListener('click', () => {
                this.onNewCharacterRequested?.();
            });
        }
        
        // Clear group
        if (this.clearGroupBtn) {
            this.clearGroupBtn.addEventListener('click', () => {
                this.onClearGroupRequested?.();
            });
        }
        
        // Character selection (for viewing stats)
        if (this.characterList) {
            this.characterList.addEventListener('click', (e) => {
                const characterItem = e.target.closest('.character-item');
                if (characterItem && !e.target.closest('.toggle-group-btn')) {
                    const characterId = characterItem.dataset.characterId;
                    console.log('Character selected for viewing:', characterId);
                    this.onCharacterSelected?.(characterId);
                }
            });
        }
    }
    
    show(characters, currentCharacter, group = []) {
        if (!this.dialog) {
            console.error('Character dialog element not found!');
            return;
        }
        
        console.log('CharacterDialogManager: show called');
        console.log('Characters:', characters.length);
        console.log('Current character:', currentCharacter);
        console.log('Group:', group.length);
        
        this.updateCharacterList(characters, currentCharacter, group);
        this.updateCharacterDetails(currentCharacter);
        this.dialog.style.display = 'block';
        console.log('Character dialog should now be visible');
    }
    
    hide() {
        if (this.dialog) {
            this.dialog.style.display = 'none';
        }
    }
    
    updateCharacterList(characters, currentCharacter, group = []) {
        if (!this.characterList) return;
        
        this.characterList.innerHTML = '';
        
        const attributeNames = {
            BDY: 'Body',
            AGI: 'Agility',
            INT: 'Intelligence', 
            WIL: 'Willpower',
            GNO: 'Gnosis',
            SOL: 'Soul'
        };
        
        characters.forEach(character => {
            const characterItem = document.createElement('div');
            const isInGroup = group.includes(character);
            const isActive = character === currentCharacter;
            
            characterItem.className = `character-item ${isActive ? 'active' : ''} ${isInGroup ? 'in-group' : ''}`;
            characterItem.dataset.characterId = character.id;
            
            const sprite = this.getCharacterSprite(character.type);
            const toggleText = isInGroup ? 'Remove' : 'Add';
            const toggleClass = isInGroup ? 'toggle-group-btn remove' : 'toggle-group-btn add';
            
            characterItem.innerHTML = `
                <div class="character-item-sprite">${sprite}</div>
                <div class="character-item-info">
                    <div class="character-item-name">${character.name}</div>
                    <div class="character-item-details">Level ${character.level} ${character.type} (AGI: ${character.attributes.AGI})</div>
                </div>
                <button class="${toggleClass}" data-character-id="${character.id}">
                    ${toggleText}
                </button>
            `;
            
            this.characterList.appendChild(characterItem);
        });
        
        // Add event listeners for toggle buttons
        this.addToggleButtonHandlers();
    }
    
    updateCharacterDetails(character) {
        if (!character) return;
        
        this.updateAttributesDisplay(character);
        this.updateSkillsDisplay(character);
    }
    
    updateAttributesDisplay(character) {
        if (!this.attributesContainer) return;
        
        let attributesHTML = '<h4>Attributes</h4>';
        attributesHTML += '<div class="attributes-grid">';
        
        const attributeNames = {
            BDY: 'Body',
            AGI: 'Agility', 
            INT: 'Intelligence',
            WIL: 'Willpower',
            GNO: 'Gnosis',
            SOL: 'Soul'
        };
        
        Object.entries(character.attributes).forEach(([key, value]) => {
            const modifier = character.getAttributeModifier(key);
            const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            attributesHTML += `
                <div class="attribute-item">
                    <span class="attribute-name">${attributeNames[key]}</span>
                    <span class="attribute-value">${value}</span>
                    <span class="attribute-modifier">${modifierText}</span>
                </div>
            `;
        });
        
        attributesHTML += '</div>';
        this.attributesContainer.innerHTML = attributesHTML;
    }
    
    updateSkillsDisplay(character) {
        if (!this.skillsContainer) return;
        
        let skillsHTML = '<h4>Skills</h4>';
        skillsHTML += `<div class="skill-points">Skill Points: Combat ${character.getSkillPointsForGroup('combat')}, General ${character.getSkillPointsForGroup('general')}, Magic ${character.getSkillPointsForGroup('magic')}</div>`;
        
        const attributeNames = {
            BDY: 'Body',
            AGI: 'Agility',
            INT: 'Intelligence', 
            WIL: 'Willpower',
            GNO: 'Gnosis',
            SOL: 'Soul'
        };
        
        // Group skills by category
        const skillGroups = {
            combat: { title: 'Combat Skills', skills: [] },
            general: { title: 'General Skills', skills: [] },
            magic: { title: 'Magic Skills', skills: [] }
        };
        
        // Sort skills into groups
        Object.entries(character.skills).forEach(([key, skill]) => {
            const group = skill.group || 'general';
            if (skillGroups[group]) {
                skillGroups[group].skills.push({ key, skill });
            }
        });
        
        // Render each group
        Object.values(skillGroups).forEach(group => {
            if (group.skills.length > 0) {
                skillsHTML += `<div class="skill-group">`;
                skillsHTML += `<h5 class="skill-group-title">${group.title}</h5>`;
                skillsHTML += '<div class="skills-grid">';
                
                group.skills.forEach(({ key, skill }) => {
                    const canImprove = character.canImproveSkill(key);
                    const improveClass = canImprove ? 'can-improve' : 'cannot-improve';
                    
                    // Handle multiple attributes
                    let attributeText;
                    if (skill.attributes.length === 1) {
                        attributeText = attributeNames[skill.attributes[0]];
                    } else {
                        attributeText = skill.attributes.map(attr => attributeNames[attr]).join(' or ');
                    }
                    
                    skillsHTML += `
                        <div class="skill-item ${improveClass}" data-skill="${key}">
                            <span class="skill-name">${skill.name}</span>
                            <span class="skill-level">${skill.level}/${skill.maxLevel}</span>
                            <span class="skill-attribute">${attributeText}</span>
                            <span class="skill-modifier">+${character.getSkillModifier(key)}</span>
                        </div>
                    `;
                });
                
                skillsHTML += '</div></div>';
            }
        });
        
        this.skillsContainer.innerHTML = skillsHTML;
        
        // Add click handlers for skill improvement
        this.addSkillClickHandlers(character);
    }
    
    addSkillClickHandlers(character) {
        const skillItems = document.querySelectorAll('.skill-item.can-improve');
        skillItems.forEach(item => {
            item.addEventListener('click', () => {
                const skillName = item.dataset.skill;
                if (character.improveSkill(skillName)) {
                    this.updateCharacterDetails(character);
                    this.onSkillImproved?.(character);
                }
            });
        });
    }
    
    addToggleButtonHandlers() {
        const toggleButtons = document.querySelectorAll('.toggle-group-btn');
        toggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent character selection
                const characterId = button.dataset.characterId;
                console.log('Toggle group button clicked:', characterId);
                this.onCharacterToggled?.(characterId);
            });
        });
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
    
    // Callback setters for external event handling
    setOnNewCharacterRequested(callback) {
        this.onNewCharacterRequested = callback;
    }
    
    setOnClearGroupRequested(callback) {
        this.onClearGroupRequested = callback;
    }
    
    setOnCharacterSelected(callback) {
        this.onCharacterSelected = callback;
    }
    
    setOnCharacterToggled(callback) {
        this.onCharacterToggled = callback;
    }
    
    setOnSkillImproved(callback) {
        this.onSkillImproved = callback;
    }
}
