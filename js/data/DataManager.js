export class DataManager {
    constructor() {
        this.storageKey = 'dungeon_master_2025_save';
        this.defaultData = this.createDefaultData();
    }
    
    createDefaultData() {
        return {
            version: '1.0.0',
            characters: [
                {
                    id: 'warrior-1',
                    name: 'Thorin',
                    type: 'warrior',
                    x: 6,
                    y: 6,
                    level: 1,
                    experience: 0,
                    attributes: {
                        BDY: 14,
                        AGI: 12,
                        INT: 10,
                        WIL: 12,
                        GNO: 8,
                        SOL: 10
                    },
                    skills: {
                        heavy_melee: { level: 0, maxLevel: 5, attributes: ['BDY'], name: 'Heavy Melee Combat', group: 'combat' },
                        light_melee: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Light Melee Combat', group: 'combat' },
                        unarmed_combat: { level: 0, maxLevel: 5, attributes: ['BDY'], name: 'Unarmed Combat', group: 'combat' },
                        ranged: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Ranged Combat', group: 'combat' },
                        dodge: { level: 0, maxLevel: 5, attributes: ['AGI', 'GNO'], name: 'Dodge', group: 'combat' },
                        block: { level: 0, maxLevel: 5, attributes: ['BDY'], name: 'Block', group: 'combat' },
                        athletics: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Athletics', group: 'general' },
                        stealth: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Stealth', group: 'general' },
                        lore: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Lore', group: 'general' },
                        deduction: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Deduction', group: 'general' },
                        crafting: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Crafting', group: 'general' },
                        medicine: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Medicine', group: 'general' },
                        deception: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Deception', group: 'general' },
                        persuasion: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Persuasion', group: 'general' },
                        intimidation: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Intimidation', group: 'general' },
                        performance: { level: 0, maxLevel: 5, attributes: ['SOL'], name: 'Performance', group: 'general' },
                        abjuration: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Abjuration', group: 'magic' },
                        arcane: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Arcane', group: 'magic' },
                        alchemy: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Alchemy', group: 'magic' },
                        channel: { level: 0, maxLevel: 5, attributes: ['SOL'], name: 'Channel', group: 'magic' },
                        summoning: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Summoning', group: 'magic' },
                        second_sight: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Second Sight', group: 'magic' },
                        parma: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Parma', group: 'magic' },
                        purification: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Purification', group: 'magic' },
                        ritual: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Ritual', group: 'magic' },
                        thievery: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Thievery', group: 'general' },
                        perception: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Perception', group: 'general' },
                        survival: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Survival', group: 'general' },
                        animal_handling: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Animal Handling', group: 'general' }
                    },
                    skillPoints: 6,
                    skillPointsByGroup: { combat: 4, general: 2, magic: 0 },
                    maxHp: 24,
                    currentHp: 24,
                    actionPoints: 3,
                    maxActionPoints: 3,
                    attack: 38,
                    defense: 17,
                    speed: 1,
                    equipment: {},
                    inventory: [],
                    statusEffects: [],
                    skillShortcuts: {
                        'Digit1': 'attack',
                        'Digit2': 'heavy_melee',
                        'Digit3': 'block'
                    }
                },
                {
                    id: 'mage-1',
                    name: 'Zara',
                    type: 'mage',
                    x: 7,
                    y: 6,
                    level: 1,
                    experience: 0,
                    attributes: {
                        BDY: 8,
                        AGI: 10,
                        INT: 16,
                        WIL: 14,
                        GNO: 12,
                        SOL: 10
                    },
                    skills: {
                        heavy_melee: { level: 0, maxLevel: 5, attributes: ['BDY'], name: 'Heavy Melee Combat' },
                        light_melee: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Light Melee Combat' },
                        unarmed_combat: { level: 0, maxLevel: 5, attributes: ['BDY'], name: 'Unarmed Combat' },
                        ranged: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Ranged Combat' },
                        dodge: { level: 0, maxLevel: 5, attributes: ['AGI', 'GNO'], name: 'Dodge' },
                        block: { level: 0, maxLevel: 5, attributes: ['BDY'], name: 'Block' },
                        athletics: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Athletics' },
                        stealth: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Stealth' },
                        lore: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Lore' },
                        deduction: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Deduction' },
                        crafting: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Crafting' },
                        medicine: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Medicine' },
                        deception: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Deception' },
                        persuasion: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Persuasion' },
                        intimidation: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Intimidation' },
                        performance: { level: 0, maxLevel: 5, attributes: ['SOL'], name: 'Performance' },
                        abjuration: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Abjuration' },
                        arcane: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Arcane' },
                        alchemy: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Alchemy' },
                        channel: { level: 0, maxLevel: 5, attributes: ['SOL'], name: 'Channel' },
                        summoning: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Summoning' },
                        second_sight: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Second Sight' },
                        parma: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Parma' },
                        purification: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Purification' },
                        ritual: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Ritual' },
                        thievery: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Thievery' },
                        perception: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Perception' },
                        survival: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Survival' },
                        animal_handling: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Animal Handling' }
                    },
                    skillPoints: 6,
                    skillPointsByGroup: { combat: 0, general: 2, magic: 4 },
                    maxHp: 18,
                    currentHp: 18,
                    actionPoints: 3,
                    maxActionPoints: 3,
                    attack: 26,
                    defense: 11,
                    speed: 1,
                    equipment: {},
                    inventory: [],
                    statusEffects: [],
                    skillShortcuts: {
                        'Digit1': 'attack',
                        'Digit2': 'arcane',
                        'Digit3': 'abjuration'
                    }
                },
                {
                    id: 'rogue-1',
                    name: 'Shadow',
                    type: 'rogue',
                    x: 6,
                    y: 7,
                    level: 1,
                    experience: 0,
                    attributes: {
                        BDY: 10,
                        AGI: 16,
                        INT: 12,
                        WIL: 10,
                        GNO: 8,
                        SOL: 12
                    },
                    skills: {
                        heavy_melee: { level: 0, maxLevel: 5, attributes: ['BDY'], name: 'Heavy Melee Combat' },
                        light_melee: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Light Melee Combat' },
                        unarmed_combat: { level: 0, maxLevel: 5, attributes: ['BDY'], name: 'Unarmed Combat' },
                        ranged: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Ranged Combat' },
                        dodge: { level: 0, maxLevel: 5, attributes: ['AGI', 'GNO'], name: 'Dodge' },
                        block: { level: 0, maxLevel: 5, attributes: ['BDY'], name: 'Block' },
                        athletics: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Athletics' },
                        stealth: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Stealth' },
                        lore: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Lore' },
                        deduction: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Deduction' },
                        crafting: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Crafting' },
                        medicine: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Medicine' },
                        deception: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Deception' },
                        persuasion: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Persuasion' },
                        intimidation: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Intimidation' },
                        performance: { level: 0, maxLevel: 5, attributes: ['SOL'], name: 'Performance' },
                        abjuration: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Abjuration' },
                        arcane: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Arcane' },
                        alchemy: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Alchemy' },
                        channel: { level: 0, maxLevel: 5, attributes: ['SOL'], name: 'Channel' },
                        summoning: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Summoning' },
                        second_sight: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Second Sight' },
                        parma: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Parma' },
                        purification: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Purification' },
                        ritual: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Ritual' },
                        thievery: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Thievery' },
                        perception: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Perception' },
                        survival: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Survival' },
                        animal_handling: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Animal Handling' }
                    },
                    skillPoints: 6,
                    skillPointsByGroup: { combat: 2, general: 4, magic: 0 },
                    maxHp: 20,
                    currentHp: 20,
                    attack: 32,
                    defense: 13,
                    speed: 1,
                    actionPoints: 3,
                    maxActionPoints: 3,
                    equipment: {},
                    inventory: [],
                    statusEffects: [],
                    skillShortcuts: {
                        'Digit1': 'attack',
                        'Digit2': 'light_melee',
                        'Digit3': 'stealth'
                    }
                },
                {
                    id: 'cleric-1',
                    name: 'Aria',
                    type: 'cleric',
                    x: 7,
                    y: 7,
                    level: 1,
                    experience: 0,
                    attributes: {
                        BDY: 12,
                        AGI: 10,
                        INT: 12,
                        WIL: 14,
                        GNO: 14,
                        SOL: 12
                    },
                    skills: {
                        heavy_melee: { level: 0, maxLevel: 5, attributes: ['BDY'], name: 'Heavy Melee Combat', group: 'combat' },
                        light_melee: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Light Melee Combat', group: 'combat' },
                        unarmed_combat: { level: 0, maxLevel: 5, attributes: ['BDY'], name: 'Unarmed Combat', group: 'combat' },
                        ranged: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Ranged Combat', group: 'combat' },
                        dodge: { level: 0, maxLevel: 5, attributes: ['AGI', 'GNO'], name: 'Dodge', group: 'combat' },
                        block: { level: 0, maxLevel: 5, attributes: ['BDY'], name: 'Block', group: 'combat' },
                        athletics: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Athletics', group: 'general' },
                        stealth: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Stealth', group: 'general' },
                        lore: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Lore', group: 'general' },
                        deduction: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Deduction', group: 'general' },
                        crafting: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Crafting', group: 'general' },
                        medicine: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Medicine', group: 'general' },
                        deception: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Deception', group: 'general' },
                        persuasion: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Persuasion', group: 'general' },
                        intimidation: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Intimidation', group: 'general' },
                        performance: { level: 0, maxLevel: 5, attributes: ['SOL'], name: 'Performance', group: 'general' },
                        abjuration: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Abjuration', group: 'magic' },
                        arcane: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Arcane', group: 'magic' },
                        alchemy: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Alchemy', group: 'magic' },
                        channel: { level: 0, maxLevel: 5, attributes: ['SOL'], name: 'Channel', group: 'magic' },
                        summoning: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Summoning', group: 'magic' },
                        second_sight: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Second Sight', group: 'magic' },
                        parma: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Parma', group: 'magic' },
                        purification: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Purification', group: 'magic' },
                        ritual: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Ritual', group: 'magic' },
                        thievery: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Thievery', group: 'general' },
                        perception: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Perception', group: 'general' },
                        survival: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Survival', group: 'general' },
                        animal_handling: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Animal Handling', group: 'general' }
                    },
                    skillPoints: 6,
                    skillPointsByGroup: { combat: 2, general: 2, magic: 2 },
                    maxHp: 22,
                    currentHp: 22,
                    actionPoints: 3,
                    maxActionPoints: 3,
                    attack: 34,
                    defense: 15,
                    speed: 1,
                    equipment: {},
                    inventory: [],
                    statusEffects: [],
                    skillShortcuts: {
                        'Digit1': 'attack',
                        'Digit2': 'channel',
                        'Digit3': 'purification'
                    }
                }
            ],
            group: ['warrior-1', 'mage-1', 'rogue-1'], // IDs of characters in the group
            currentCharacterIndex: 0,
            turnOrder: ['warrior-1', 'mage-1', 'rogue-1'],
            gameState: {
                turn: 1,
                currentMap: 'tutorial',
                playerPosition: { x: 6, y: 6 }
            },
            maps: {
                tutorial: {
                    width: 20,
                    height: 15,
                    tiles: [
                        // This will be generated by MapLoader
                    ],
                    borders: {
                        horizontal: [
                            // Horizontal borders
                        ],
                        vertical: [
                            // Vertical borders
                        ]
                    }
                }
            }
        };
    }
    
    saveGame(gameData) {
        try {
            const saveData = {
                version: this.defaultData.version,
                characters: gameData.characters.map(char => this.serializeCharacter(char)),
                group: gameData.group.map(char => char.id),
                currentCharacterIndex: gameData.currentCharacterIndex,
                turnOrder: gameData.turnOrder.map(char => char.id),
                gameState: {
                    turn: gameData.gameEngine.turn,
                    currentMap: gameData.currentMap.name || 'tutorial',
                    playerPosition: {
                        x: gameData.player ? gameData.player.x : 6,
                        y: gameData.player ? gameData.player.y : 6
                    }
                },
                maps: {
                    [gameData.currentMap.name || 'tutorial']: gameData.currentMap.toJSON()
                }
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(saveData));
            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }
    
    loadGame() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (!savedData) {
                console.log('No save data found, using default data');
                return this.defaultData;
            }
            
            const parsedData = JSON.parse(savedData);
            
            // Validate version
            if (parsedData.version !== this.defaultData.version) {
                console.warn('Save data version mismatch, using default data');
                return this.defaultData;
            }
            
            console.log('Game loaded successfully');
            return parsedData;
        } catch (error) {
            console.error('Failed to load game:', error);
            return this.defaultData;
        }
    }
    
    serializeCharacter(character) {
        return {
            id: character.id,
            name: character.name,
            type: character.type,
            x: character.x,
            y: character.y,
            level: character.level,
            experience: character.experience,
            attributes: character.attributes,
            skills: character.skills,
            skillPoints: character.skillPoints,
            skillPointsByGroup: character.skillPointsByGroup,
            maxHp: character.maxHp,
            currentHp: character.currentHp,
            actionPoints: character.actionPoints,
            maxActionPoints: character.maxActionPoints,
            attack: character.attack,
            defense: character.defense,
            speed: character.speed,
            equipment: character.equipment,
            inventory: character.inventory,
            statusEffects: character.statusEffects,
            skillShortcuts: character.skillShortcuts
        };
    }
    
    deserializeCharacter(characterData) {
        // This will be used when loading characters from save data
        return characterData; // For now, return as-is since Character constructor handles it
    }
    
    clearSave() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('Save data cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear save data:', error);
            return false;
        }
    }
    
    hasSaveData() {
        return localStorage.getItem(this.storageKey) !== null;
    }
    
    exportSaveData() {
        const saveData = localStorage.getItem(this.storageKey);
        if (saveData) {
            const blob = new Blob([saveData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'dungeon_master_2025_save.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    }
    
    importSaveData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    localStorage.setItem(this.storageKey, JSON.stringify(data));
                    console.log('Save data imported successfully');
                    resolve(true);
                } catch (error) {
                    console.error('Failed to import save data:', error);
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
}
