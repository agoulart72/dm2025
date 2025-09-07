import { BaseEntity } from './BaseEntity.js';

export class Character extends BaseEntity {
    constructor(data) {
        super(data);

        // Basic properties
        this.type = data.type || 'character';
        this.characterClass = data.characterClass || 'warrior';
        
        // Core Attributes (6 main attributes)
        this.attributes = {
            BDY: data.attributes?.BDY || 10, // Body - Physical strength, health, endurance
            AGI: data.attributes?.AGI || 10, // Agility - Speed, reflexes, coordination
            INT: data.attributes?.INT || 10, // Intelligence - Knowledge, problem-solving, magic
            WIL: data.attributes?.WIL || 10, // Willpower - Mental fortitude, resistance, determination
            GNO: data.attributes?.GNO || 10, // Gnosis - Mystical knowledge, spiritual power
            SOL: data.attributes?.SOL || 10  // Soul - Charisma, leadership, divine connection
        };
        
        // Derived stats based on attributes
        this.maxHp = data.maxHp || this.calculateMaxHp();
        this.currentHp = data.currentHp || this.maxHp;
        this.level = data.level || 1;
        this.experience = data.experience || 0;
        this.experienceToNext = this.calculateExperienceToNext();
        
        // Action system
        this.actionPoints = data.actionPoints || 3;
        this.maxActionPoints = data.maxActionPoints || 3;
        
        // Reaction system (for defense)
        this.reactions = data.reactions || this.calculateMaxReactions();
        this.maxReactions = this.calculateMaxReactions();
        
        // Log combat system initialization
        console.log(`⚔️ Combat system initialized for ${this.name}: ${this.maxReactions} reactions (AGI: ${this.attributes.AGI})`);
        
        // Combat stats
        this.attack = data.attack || 10;
        this.defense = data.defense || 5;
        this.speed = data.speed || 1;
        
        // Equipment and inventory
        this.equipment = data.equipment || {};
        this.inventory = data.inventory || [];
        this.maxInventorySize = data.maxInventorySize || 20;
        
        // Status effects
        this.statusEffects = data.statusEffects || [];
        
        // Map reference
        this.map = null;
        
        // Visual properties
        this.sprite = data.sprite || null;
        this.color = data.color || '#4ecdc4';
        
        // AI properties (for NPCs)
        this.ai = data.ai || null;
        this.aiState = 'idle';
        
        // Movement
        this.movementRange = data.movementRange || 1;
        this.canMove = true;
        
        // Skills system
        this.skills = this.migrateSkills(data.skills) || this.initializeSkills();
        this.skillPoints = data.skillPoints || this.getStartingSkillPoints();
        this.skillPointsByGroup = data.skillPointsByGroup || this.getStartingSkillPointsByGroup();
        
        // Actions
        this.actions = data.actions || ['move', 'attack', 'use_item'];
        
        // Skill shortcuts - map keyboard keys to skill actions
        this.skillShortcuts = data.skillShortcuts || this.initializeSkillShortcuts();
    }
    
    // Migrate skills to include group property
    migrateSkills(existingSkills) {
        if (!existingSkills) return null;
        
        const skillGroups = {
            // Combat Skills
            heavy_melee: 'combat',
            light_melee: 'combat',
            unarmed_combat: 'combat',
            ranged: 'combat',
            dodge: 'combat',
            block: 'combat',
            
            // General Skills
            athletics: 'general',
            stealth: 'general',
            lore: 'general',
            deduction: 'general',
            crafting: 'general',
            medicine: 'general',
            deception: 'general',
            persuasion: 'general',
            intimidation: 'general',
            performance: 'general',
            thievery: 'general',
            perception: 'general',
            survival: 'general',
            animal_handling: 'general',
            
            // Magic Skills
            abjuration: 'magic',
            arcane: 'magic',
            alchemy: 'magic',
            channel: 'magic',
            summoning: 'magic',
            second_sight: 'magic',
            parma: 'magic',
            purification: 'magic',
            ritual: 'magic'
        };
        
        const migratedSkills = {};
        Object.entries(existingSkills).forEach(([key, skill]) => {
            migratedSkills[key] = {
                ...skill,
                group: skillGroups[key] || 'general'
            };
        });
        
        return migratedSkills;
    }
    
    // Initialize skills based on attributes
    initializeSkills() {
        return {
            // Combat Skills
            heavy_melee: { level: 0, maxLevel: 5, attributes: ['BDY'], name: 'Heavy Melee Combat', group: 'combat' },
            light_melee: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Light Melee Combat', group: 'combat' },
            unarmed_combat: { level: 0, maxLevel: 5, attributes: ['BDY'], name: 'Unarmed Combat', group: 'combat' },
            ranged: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Ranged Combat', group: 'combat' },
            dodge: { level: 0, maxLevel: 5, attributes: ['AGI', 'GNO'], name: 'Dodge', group: 'combat' },
            block: { level: 0, maxLevel: 5, attributes: ['BDY'], name: 'Block', group: 'combat' },
            
            // General Skills
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
            thievery: { level: 0, maxLevel: 5, attributes: ['AGI'], name: 'Thievery', group: 'general' },
            perception: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Perception', group: 'general' },
            survival: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Survival', group: 'general' },
            animal_handling: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Animal Handling', group: 'general' },
    
            // Magic Skills
            abjuration: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Abjuration', group: 'magic' },
            arcane: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Arcane', group: 'magic' },
            alchemy: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Alchemy', group: 'magic' },
            channel: { level: 0, maxLevel: 5, attributes: ['SOL'], name: 'Channel', group: 'magic' },
            summoning: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Summoning', group: 'magic' },
            second_sight: { level: 0, maxLevel: 5, attributes: ['GNO'], name: 'Second Sight', group: 'magic' },
            parma: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Parma', group: 'magic' },
            purification: { level: 0, maxLevel: 5, attributes: ['WIL'], name: 'Purification', group: 'magic' },
            ritual: { level: 0, maxLevel: 5, attributes: ['INT'], name: 'Ritual', group: 'magic' },
        };
    }
    
    // Get starting skill points based on character class
    getStartingSkillPoints() {
        const pointsByClass = {
            warrior: 6,  // 4 combat + 2 general
            cleric: 6,   // 2 combat + 2 general + 2 magic
            rogue: 6,    // 2 combat + 4 general
            mage: 6      // 2 general + 4 magic
        };
        return pointsByClass[this.characterType] || 6;
    }
    
    // Get starting skill points by group based on character class
    getStartingSkillPointsByGroup() {
        const pointsByClass = {
            warrior: { combat: 4, general: 2, magic: 0 },
            cleric: { combat: 2, general: 2, magic: 2 },
            rogue: { combat: 2, general: 4, magic: 0 },
            mage: { combat: 0, general: 2, magic: 4 }
        };
        return pointsByClass[this.characterType] || { combat: 2, general: 2, magic: 2 };
    }
    
    // Get remaining skill points for a specific group
    getSkillPointsForGroup(group) {
        const spent = this.getSpentSkillPointsForGroup(group);
        const total = this.skillPointsByGroup[group] || 0;
        return Math.max(0, total - spent);
    }
    
    // Get spent skill points for a specific group
    getSpentSkillPointsForGroup(group) {
        let spent = 0;
        Object.values(this.skills).forEach(skill => {
            if (skill.group === group) {
                spent += skill.level;
            }
        });
        return spent;
    }
    
    // Calculate maximum reactions (half agility, round up)
    calculateMaxReactions() {
        return Math.ceil(this.attributes.AGI / 2);
    }
    
    // Restore reactions at the beginning of turn
    restoreReactions() {
        this.reactions = this.maxReactions;
        console.log(`🛡️ ${this.name} restored ${this.reactions} reactions (AGI: ${this.attributes.AGI})`);
    }
    
    // Roll dice for a skill check
    rollSkill(skillName) {
        const skill = this.skills[skillName];
        if (!skill) {
            console.error(`Skill ${skillName} not found`);
            return { successes: 0, dice: [] };
        }
        
        // Calculate number of dice (attribute + skill level)
        let diceCount = 0;
        skill.attributes.forEach(attr => {
            diceCount += this.attributes[attr];
        });
        diceCount += skill.level;
        
        // Roll dice
        const dice = [];
        let successes = 0;
        
        for (let i = 0; i < diceCount; i++) {
            const roll = Math.floor(Math.random() * 6) + 1;
            dice.push(roll);
            if (roll >= 5) { // 5 or 6 is a success
                successes++;
            }
        }
        
        console.log(`🎲 ${this.name} rolls ${skillName}: ${diceCount} dice = [${dice.join(', ')}] → ${successes} successes`);
        
        return { successes, dice, diceCount };
    }
    
    // Roll defense skill (Mobility/Dodge or Block)
    rollDefense(defenseType = 'dodge') {
        if (this.reactions <= 0) {
            console.log(`${this.name} has no reactions left to defend!`);
            return { successes: 0, dice: [] };
        }
        
        // Spend one reaction
        this.reactions--;
        
        let skillName;
        if (defenseType === 'block' && this.equipment.shield) {
            skillName = 'block';
        } else {
            skillName = 'dodge'; // Use dodge as mobility/dodge
        }
        
        const result = this.rollSkill(skillName);
        console.log(`🛡️ ${this.name} uses ${skillName} defense: ${result.successes} successes (${result.dice.join(', ')}) - ${this.reactions} reactions remaining`);
        
        return result;
    }
    
    // Get total remaining skill points across all groups
    getTotalRemainingSkillPoints() {
        let total = 0;
        Object.keys(this.skillPointsByGroup).forEach(group => {
            total += this.getSkillPointsForGroup(group);
        });
        return total;
    }
    
    // Initialize skill shortcuts based on character type
    initializeSkillShortcuts() {
        const shortcuts = {};
        
        // Default shortcuts for all characters
        shortcuts['Digit1'] = 'attack'; // Key "1" for basic attack
        
        // Character-specific shortcuts
        switch (this.characterType) {
            case 'warrior':
                shortcuts['Digit2'] = 'heavy_melee'; // Key "2" for heavy melee
                shortcuts['Digit3'] = 'block'; // Key "3" for block
                break;
            case 'mage':
                shortcuts['Digit2'] = 'arcane'; // Key "2" for arcane magic
                shortcuts['Digit3'] = 'abjuration'; // Key "3" for abjuration
                break;
            case 'rogue':
                shortcuts['Digit2'] = 'light_melee'; // Key "2" for light melee
                shortcuts['Digit3'] = 'stealth'; // Key "3" for stealth
                break;
            case 'cleric':
                shortcuts['Digit2'] = 'channel'; // Key "2" for divine channeling
                shortcuts['Digit3'] = 'purification'; // Key "3" for purification
                break;
        }
        
        return shortcuts;
    }
    
    // Attribute calculations
    calculateMaxHp() {
        return 10 + this.attributes.BDY + (this.attributes.level * 2);
    }
    
    calculateAttack() {
        return (this.attributes.BDY * 2) + (this.attributes.AGI * 1) + (this.skills.heavy_melee.level * 3);
    }
    
    calculateDefense() {
        return 3 + (this.attributes.BDY * 1) + (this.attributes.AGI * 1) + (this.skills.dodge.level * 2);
    }
    
    calculateSpeed() {
        return 1 + Math.floor(this.attributes.AGI / 5) + (this.skills.athletics.level * 1);
    }
    
    calculateMaxActionPoints() {
        return 3 + Math.floor(this.attributes.AGI / 8) + Math.floor(this.attributes.WIL / 10);
    }
    
    // Skill action methods
    getSkillShortcut(key) {
        return this.skillShortcuts[key];
    }
    
    canUseSkill(skillName) {
        // Check if character has the skill and enough action points
        if (!this.skills[skillName]) {
            return false;
        }
        
        // Basic skills cost 1 action point, advanced skills cost 2
        const skillCost = this.skills[skillName].level > 0 ? 1 : 2;
        return this.actionPoints >= skillCost;
    }
    
    useSkill(skillName, target = null) {
        if (!this.canUseSkill(skillName)) {
            return { success: false, message: `Cannot use ${skillName}` };
        }
        
        const skill = this.skills[skillName];
        const skillCost = skill.level > 0 ? 1 : 2;
        
        // Deduct action points
        this.actionPoints -= skillCost;
        
        // Calculate skill effectiveness based on attributes and skill level
        const highestAttribute = this.getHighestAttribute(skill.attributes);
        const skillModifier = skill.level * 2;
        const totalBonus = highestAttribute + skillModifier;
        
        // Generate result based on skill type
        let result = {
            success: true,
            skillName: skillName,
            skillLevel: skill.level,
            actionPointsUsed: skillCost,
            totalBonus: totalBonus,
            message: `Used ${skill.name} (Level ${skill.level})`
        };
        
        // Add skill-specific effects
        switch (skillName) {
            case 'attack':
            case 'light_melee':
                result.damage = Math.floor(totalBonus / 2) + 5;
                result.message += ` - Dealt ${result.damage} damage`;
                break;
            case 'heavy_melee':
                result.damage = Math.floor(totalBonus / 2) + 8;
                result.message += ` - Dealt ${result.damage} damage`;
                result.loudAction = true; // Heavy melee makes noise
                break;
            case 'arcane':
            case 'abjuration':
            case 'channel':
                result.magicalEffect = true;
                result.effectPower = totalBonus;
                result.message += ` - Magical effect (Power: ${result.effectPower})`;
                result.loudAction = true; // Spells make noise
                break;
            case 'stealth':
                result.stealthBonus = totalBonus;
                result.message += ` - Stealth bonus: ${result.stealthBonus}`;
                break;
            case 'block':
                result.defenseBonus = totalBonus;
                result.message += ` - Defense bonus: ${result.defenseBonus}`;
                break;
            default:
                result.genericEffect = true;
                result.message += ` - Effect bonus: ${totalBonus}`;
        }
        
        return result;
    }
    
    getHighestAttribute(attributeNames) {
        let highest = 0;
        for (const attrName of attributeNames) {
            if (this.attributes[attrName] > highest) {
                highest = this.attributes[attrName];
            }
        }
        return highest;
    }
    
    // Experience and leveling
    calculateExperienceToNext() {
        return this.level * 100; // Simple formula
    }
    
    gainExperience(amount) {
        this.experience += amount;
        
        while (this.experience >= this.experienceToNext) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level++;
        this.experience -= this.experienceToNext;
        this.experienceToNext = this.calculateExperienceToNext();
        
        // Gain skill points by group based on character class
        const pointsByClass = {
            warrior: { combat: 1, general: 1, magic: 0 },
            cleric: { combat: 0, general: 1, magic: 1 },
            rogue: { combat: 0, general: 2, magic: 0 },
            mage: { combat: 0, general: 0, magic: 2 }
        };
        
        const levelUpPoints = pointsByClass[this.characterType] || { combat: 1, general: 1, magic: 0 };
        
        // Add points to each group
        Object.entries(levelUpPoints).forEach(([group, points]) => {
            this.skillPointsByGroup[group] = (this.skillPointsByGroup[group] || 0) + points;
        });
        
        // Recalculate derived stats based on attributes
        this.maxHp = this.calculateMaxHp();
        this.currentHp = this.maxHp; // Full heal on level up
        this.attack = this.calculateAttack();
        this.defense = this.calculateDefense();
        this.speed = this.calculateSpeed();
        this.maxActionPoints = this.calculateMaxActionPoints();
        this.actionPoints = this.maxActionPoints;
        
        console.log(`${this.name} reached level ${this.level}!`);
        console.log(`Gained skill points:`, levelUpPoints);
        
        // Trigger save event
        if (this.onLevelUp) {
            this.onLevelUp(this);
        }
    }
    
    // Health management
    takeDamage(amount) {
        const actualDamage = Math.max(1, amount - this.defense);
        this.currentHp = Math.max(0, this.currentHp - actualDamage);
        
        if (this.currentHp <= 0) {
            this.die();
        }
        
        return actualDamage;
    }
    
    heal(amount) {
        this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
    }
    
    isAlive() {
        return this.currentHp > 0;
    }
    
    // Skill management
    canImproveSkill(skillName) {
        const skill = this.skills[skillName];
        if (!skill) return false;
        
        // Check if we have enough skill points for this group
        const groupPoints = this.getSkillPointsForGroup(skill.group);
        if (groupPoints <= 0) return false;
        
        // Check if skill is at max level
        if (skill.level >= skill.maxLevel) return false;
        
        // Check if we meet the attribute requirement (use highest attribute value)
        const requiredLevel = Math.floor(skill.level / 2) + 8; // Skill level 0 needs attribute 8, level 1 needs 8, level 2 needs 9, etc.
        const highestAttribute = Math.max(...skill.attributes.map(attr => this.attributes[attr]));
        
        return highestAttribute >= requiredLevel;
    }
    
    improveSkill(skillName) {
        if (!this.canImproveSkill(skillName)) {
            console.log(`Cannot improve skill ${skillName}`);
            return false;
        }
        
        this.skills[skillName].level++;
        
        // Recalculate derived stats that depend on this skill
        this.attack = this.calculateAttack();
        this.defense = this.calculateDefense();
        this.speed = this.calculateSpeed();
        
        console.log(`${this.name} improved ${this.skills[skillName].name} to level ${this.skills[skillName].level}!`);
        
        // Trigger save event
        if (this.onSkillImproved) {
            this.onSkillImproved(this);
        }
        
        return true;
    }
    
    getSkillLevel(skillName) {
        return this.skills[skillName]?.level || 0;
    }
    
    getSkillModifier(skillName) {
        const skill = this.skills[skillName];
        if (!skill) return 0;
        
        // Calculate skill level modifier
        const skillModifier = skill.level * 2; // Each skill level provides +2 modifier
        
        // Calculate attribute modifier (use highest attribute value)
        const highestAttributeModifier = Math.max(...skill.attributes.map(attr => this.getAttributeModifier(attr)));
        
        return skillModifier + highestAttributeModifier;
    }
    
    // Attribute management
    canImproveAttribute(attributeName) {
        // For now, attributes can only be improved through leveling or special events
        // This could be expanded later with attribute points
        return false;
    }
    
    getAttributeModifier(attributeName) {
        const attribute = this.attributes[attributeName];
        if (!attribute) return 0;
        
        return Math.floor((attribute - 10) / 2); // Standard D&D-style modifier
    }
    
    die() {
        console.log(`${this.name} has died!`);
        this.currentHp = 0;
        
        // Remove from map
        if (this.map) {
            this.map.removeEntity(this);
        }
    }
    
    // Action system
    canPerformAction(actionType) {
        if (this.actionPoints <= 0) return false;
        if (!this.actions.includes(actionType)) return false;
        
        return true;
    }
    
    spendActionPoints(amount = 1) {
        if (this.actionPoints >= amount) {
            this.actionPoints -= amount;
            return true;
        }
        return false;
    }
    
    restoreActionPoints() {
        this.actionPoints = this.maxActionPoints;
    }
    
    // Movement
    canMoveTo(x, y) {
        if (!this.canMove) return false;
        if (!this.map) return false;
        
        return this.map.isWalkable(x, y);
    }
    
    moveTo(x, y) {
        if (!this.canMoveTo(x, y)) return false;
        if (!this.spendActionPoints(1)) return false;
        
        if (this.map) {
            this.map.moveEntity(this, x, y);
        } else {
            this.x = x;
            this.y = y;
        }
        
        return true;
    }
    
    // Combat
    attack(target) {
        if (!this.canPerformAction('attack')) return false;
        if (!this.spendActionPoints(1)) return false;
        
        if (!target || !target.isAlive()) return false;
        
        // Determine which melee skill to use
        let skillName;
        if (this.equipment.weapon && this.equipment.weapon.type === 'heavy') {
            skillName = 'heavy_melee';
        } else if (this.equipment.weapon && this.equipment.weapon.type === 'light') {
            skillName = 'light_melee';
        } else {
            skillName = 'unarmed_combat';
        }
        
        // Roll for melee weapon skill
        const rollResult = this.rollSkill(skillName);
        const damage = rollResult.successes; // Each success causes 1 point of damage
        
        console.log(`⚔️ ${this.name} attacks ${target.name} with ${skillName}: ${rollResult.successes} successes (${rollResult.dice.join(', ')}) = ${damage} damage!`);
        
        // For now, just show the damage message without affecting HP
        if (damage > 0) {
            console.log(`💥 *** ${this.name} causes ${damage} damage to ${target.name}! ***`);
        } else {
            console.log(`❌ *** ${this.name}'s attack misses ${target.name}! ***`);
        }
        
        return damage;
    }
    
    calculateDamage(target) {
        let damage = this.attack;
        
        // Apply equipment bonuses
        if (this.equipment.weapon) {
            damage += this.equipment.weapon.attack || 0;
        }
        
        // Apply status effects
        this.statusEffects.forEach(effect => {
            if (effect.type === 'attack_boost') {
                damage += effect.value;
            }
        });
        
        return Math.max(1, damage);
    }
    
    // Equipment
    equipItem(item, slot) {
        if (!this.equipment[slot]) {
            this.equipment[slot] = item;
            this.applyEquipmentStats(item);
            return true;
        }
        return false; // Slot occupied
    }
    
    unequipItem(slot) {
        const item = this.equipment[slot];
        if (item) {
            this.removeEquipmentStats(item);
            this.equipment[slot] = null;
            return item;
        }
        return null;
    }
    
    applyEquipmentStats(item) {
        if (item.stats) {
            this.maxHp += item.stats.hp || 0;
            this.attack += item.stats.attack || 0;
            this.defense += item.stats.defense || 0;
        }
    }
    
    removeEquipmentStats(item) {
        if (item.stats) {
            this.maxHp -= item.stats.hp || 0;
            this.attack -= item.stats.attack || 0;
            this.defense -= item.stats.defense || 0;
        }
    }
    
    // Inventory
    addToInventory(item) {
        if (this.inventory.length < this.maxInventorySize) {
            this.inventory.push(item);
            return true;
        }
        return false;
    }
    
    removeFromInventory(item) {
        const index = this.inventory.indexOf(item);
        if (index > -1) {
            this.inventory.splice(index, 1);
            return true;
        }
        return false;
    }
    
    // Status effects
    addStatusEffect(effect) {
        this.statusEffects.push(effect);
    }
    
    removeStatusEffect(effectId) {
        const index = this.statusEffects.findIndex(effect => effect.id === effectId);
        if (index > -1) {
            this.statusEffects.splice(index, 1);
        }
    }
    
    updateStatusEffects() {
        this.statusEffects.forEach(effect => {
            if (effect.duration > 0) {
                effect.duration--;
                
                // Apply effect
                if (effect.type === 'poison') {
                    this.takeDamage(effect.value);
                } else if (effect.type === 'heal') {
                    this.heal(effect.value);
                }
            }
        });
        
        // Remove expired effects
        this.statusEffects = this.statusEffects.filter(effect => effect.duration > 0);
    }
    
    // AI (for NPCs)
    updateAI() {
        if (!this.ai) return;
        
        this.updateStatusEffects();
        
        // Simple AI behavior
        switch (this.aiState) {
            case 'idle':
                this.idleBehavior();
                break;
            case 'patrol':
                this.patrolBehavior();
                break;
            case 'chase':
                this.chaseBehavior();
                break;
            case 'attack':
                this.attackBehavior();
                break;
        }
    }
    
    idleBehavior() {
        // Do nothing, or maybe look around
        if (Math.random() < 0.1) {
            this.aiState = 'patrol';
        }
    }
    
    patrolBehavior() {
        // Simple random movement
        if (this.actionPoints > 0) {
            const directions = [
                { dx: -1, dy: 0 },
                { dx: 1, dy: 0 },
                { dx: 0, dy: -1 },
                { dx: 0, dy: 1 }
            ];
            
            const direction = directions[Math.floor(Math.random() * directions.length)];
            const newX = this.x + direction.dx;
            const newY = this.y + direction.dy;
            
            if (this.canMoveTo(newX, newY)) {
                this.moveTo(newX, newY);
            }
        }
    }
    
    chaseBehavior() {
        // Chase the player
        const player = this.map ? this.map.getPlayer() : null;
        if (!player) {
            this.aiState = 'idle';
            return;
        }
        
        const path = this.map.findPath(this.x, this.y, player.x, player.y);
        if (path && path.length > 1 && this.actionPoints > 0) {
            const nextStep = path[1];
            this.moveTo(nextStep.x, nextStep.y);
        }
    }
    
    attackBehavior() {
        // Attack nearby enemies
        const adjacent = this.map.getAdjacentTiles(this.x, this.y);
        const targets = adjacent.flatMap(tile => tile.entities.filter(entity => entity.type === 'enemy'));
        
        if (targets.length > 0 && this.actionPoints > 0) {
            this.attack(targets[0]);
        }
    }
    
    // Serialization
    toJSON() {
        return {
            name: this.name,
            type: this.type,
            x: this.x,
            y: this.y,
            maxHp: this.maxHp,
            currentHp: this.currentHp,
            level: this.level,
            experience: this.experience,
            actionPoints: this.actionPoints,
            maxActionPoints: this.maxActionPoints,
            attack: this.attack,
            defense: this.defense,
            speed: this.speed,
            equipment: this.equipment,
            inventory: this.inventory,
            statusEffects: this.statusEffects,
            ai: this.ai,
            aiState: this.aiState,
            actions: this.actions
        };
    }

    // Helper for generating UUIDs
    generateUUID() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        } else {
            // Fallback for older browsers or environments without crypto
            const hexDigits = '0123456789ABCDEF';
            let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
            for (let i = 0; i < 36; i++) {
                if (uuid[i] === 'x') {
                    uuid = uuid.replace('x', hexDigits[Math.floor(Math.random() * 16)]);
                } else if (uuid[i] === 'y') {
                    uuid = uuid.replace('y', hexDigits[Math.floor(Math.random() * 16) & 0x3 | 0x8]);
                }
            }
            return uuid;
        }
    }
}
