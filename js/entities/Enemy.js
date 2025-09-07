import { Character } from './Character.js';

export class Enemy extends Character {
    constructor(data) {
        super(data);
        
        // Enemy-specific properties
        this.enemyType = data.enemyType || 'basic';
        this.aggression = data.aggression || 'passive'; // passive, aggressive, defensive
        this.visionRange = data.visionRange || 3;
        this.soundRange = data.soundRange || 6;
        this.attackRange = data.attackRange || 1;
        this.patrolRadius = data.patrolRadius || 2;
        
        // AI properties
        this.originalX = this.x;
        this.originalY = this.y;
        this.target = null;
        this.lastSeenPlayer = null;
        this.stunned = false;
        this.stunDuration = 0;
        
        // Enemy-specific stats
        this.experienceValue = data.experienceValue || this.level * 10;
        this.goldValue = data.goldValue || this.level * 5;
        
        // Loot table
        this.lootTable = data.lootTable || [];
        this.dropChance = data.dropChance || 0.3;
        
        // Override type
        this.type = 'enemy';
        this.characterClass = 'enemy';
        
        // Set up AI based on enemy type
        this.setupAI();
    }
    
    setupAI() {
        // Use the AI type from the monster data, default to 'patrol' if not specified
        this.ai = this.ai || 'patrol';
        this.aggression = 'aggressive'; // Default aggression level
        
        // Set patrol radius for guard-type enemies
        if (this.ai === 'guard') {
            this.patrolRadius = 3;
        }
        
        console.log(`${this.name} (${this.enemyType}) initialized with AI: ${this.ai}, vision: ${this.visionRange}, sound: ${this.soundRange}, attack range: ${this.attackRange}`);
    }
    
    // Override AI behavior for enemies
    updateAI() {
        console.log(`${this.name} updating AI`);
        // Only act if we have action points
        if (this.actionPoints <= 0) {
            return;
        }
        
        super.updateStatusEffects();
        
        // Check for vision detection first
        const visionTarget = this.checkVisionDetection();
        
        // If we see the player, prioritize vision and ignore sound
        if (visionTarget) {
            this.target = visionTarget;
            this.lastSeenPlayer = { x: visionTarget.x, y: visionTarget.y };
            const distance = this.map.getDistance(this.x, this.y, visionTarget.x, visionTarget.y);
            
            // PRIORITY: Attack immediately if possible (ranged attacks prioritized over movement)
            console.log(`📍 ${this.name} at (${this.x}, ${this.y}) sees player at (${visionTarget.x}, ${visionTarget.y}) - distance: ${distance}, attackRange: ${this.attackRange}`);
            console.log(`🔢 Distance calculation: |${this.x} - ${visionTarget.x}| + |${this.y} - ${visionTarget.y}| = |${this.x - visionTarget.x}| + |${this.y - visionTarget.y}| = ${Math.abs(this.x - visionTarget.x)} + ${Math.abs(this.y - visionTarget.y)} = ${distance}`);
            
            // Check for immediate attack opportunity
            if (distance == 0) {
                // Can perform melee attack immediately (adjacent)
                console.log(`⚔️ ${this.name} at (${this.x}, ${this.y}) can perform melee attack on player at (${visionTarget.x}, ${visionTarget.y}) - distance: ${distance} <= 1 - attempting melee attack immediately`);
                this.aiState = 'melee_attack';
            } else if (this.attackRange > 1 && this.attackRange >= distance) {
                // Can perform ranged attack immediately
                console.log(`🏹 ${this.name} at (${this.x}, ${this.y}) can perform ranged attack on player at (${visionTarget.x}, ${visionTarget.y}) - distance: ${distance}, range: ${this.attackRange} - attempting ranged attack immediately`);
                this.aiState = 'ranged_attack';
            } else {
                // Too far to attack, switch to chase
                console.log(`🏃 ${this.name} at (${this.x}, ${this.y}) too far from player at (${visionTarget.x}, ${visionTarget.y}) - distance: ${distance} > range: ${this.attackRange} - switching to chase mode`);
                this.aiState = 'chase';
            }
        } else {
            // Only check for sound if we don't see the player
            const soundTarget = this.checkSoundDetection();
            if (soundTarget) {
                this.target = soundTarget;
                this.aiState = 'investigate';
                console.log(`${this.name} hears sound at (${soundTarget.x}, ${soundTarget.y}) - investigating`);
            } else if (this.target) {
                // Lost detection, return to normal behavior
                this.target = null;
                if (this.ai === 'guard') {
                    this.returnToGuardPosition();
                } else {
                    this.aiState = 'patrol';
                }
            }
        }
        
        // Execute AI behavior
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
            case 'investigate':
                this.investigateBehavior();
                break;
            case 'melee_attack':
                this.meleeAttackBehavior();
                break;
            case 'ranged_attack':
                this.rangedAttackBehavior();
                break;
            case 'guard':
                this.guardBehavior();
                break;
        }

        this.actionPoints--;
    }
    
    checkVisionDetection() {
        if (!this.map) return null;
        
        console.log(`${this.name} checking vision detection`);

        const players = this.map.allEntities.filter(entity => entity.type === 'character' && entity.isAlive());

        console.log(`${this.name} checking vision detection for ${players.length} players`);

        for (const player of players) {
            const distance = this.map.getDistance(this.x, this.y, player.x, player.y);
            let effectiveVisionRange = this.visionRange;
            
            // Check if player has stealth active
            if (player.skills && player.skills.stealth && player.skills.stealth.level > 0) {
                effectiveVisionRange = Math.max(1, effectiveVisionRange - player.skills.stealth.level);
            }
            
            if (distance <= effectiveVisionRange) {
                // Check line of sight (simple implementation)
                if (this.hasLineOfSight(player.x, player.y)) {
                    return player;
                }
            }
        }

        return null;
    }
    
    checkSoundDetection() {
        if (!this.map) return null;
        
        // Safety check for sound system
        if (!this.map.getSoundEventsInRange || typeof this.map.getSoundEventsInRange !== 'function') {
            return null;
        }
        
        const soundEvents = this.map.getSoundEventsInRange(this.x, this.y, this.soundRange);
        if (soundEvents.length === 0) return null;
        
        // Find the closest sound event
        let closestSound = null;
        let closestDistance = Infinity;
        
        soundEvents.forEach(event => {
            const distance = this.map.getDistance(this.x, this.y, event.x, event.y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestSound = event;
            }
        });
        
        if (closestSound) {
            // Return a target object for the sound location
            return {
                x: closestSound.x,
                y: closestSound.y,
                isSoundTarget: true,
                source: closestSound.source
            };
        }
        
        return null;
    }
    
    hasLineOfSight(targetX, targetY) {
        // Improved line of sight check using Bresenham's line algorithm
        const dx = Math.abs(targetX - this.x);
        const dy = Math.abs(targetY - this.y);
        const sx = this.x < targetX ? 1 : -1;
        const sy = this.y < targetY ? 1 : -1;
        let err = dx - dy;
        
        let currentX = this.x;
        let currentY = this.y;
        
        while (currentX !== targetX || currentY !== targetY) {
            // Check if current position blocks line of sight
            const tile = this.map.getTile(currentX, currentY);
            if (!tile.walkable) {
                return false; // Line of sight blocked by wall
            }
            
            const e2 = 2 * err;
            let nextX = currentX;
            let nextY = currentY;
            
            // Determine next position based on Bresenham's algorithm
            if (e2 > -dy) {
                nextX = currentX + sx;
            }
            if (e2 < dx) {
                nextY = currentY + sy;
            }
            
            // Check if there's a wall or closed door between current and next position
            if (this.isBlockedByBorder(currentX, currentY, nextX, nextY)) {
                return false; // Line of sight blocked by border
            }
            
            // Update position based on Bresenham's algorithm
            if (e2 > -dy) {
                err -= dy;
                currentX += sx;
            }
            if (e2 < dx) {
                err += dx;
                currentY += sy;
            }
        }
        
        return true; // Line of sight is clear
    }
    
    isBlockedByBorder(fromX, fromY, toX, toY) {
        // Check if there's a wall or closed door between two adjacent positions
        const dx = toX - fromX;
        const dy = toY - fromY;
        
        // Only check borders for adjacent tiles
        if (Math.abs(dx) + Math.abs(dy) !== 1) {
            return false;
        }
        
        let border;
        if (dx === 1) { // Moving east
            border = this.map.getBorder(fromX, fromY, 'east');
        } else if (dx === -1) { // Moving west
            border = this.map.getBorder(fromX, fromY, 'west');
        } else if (dy === 1) { // Moving south
            border = this.map.getBorder(fromX, fromY, 'south');
        } else if (dy === -1) { // Moving north
            border = this.map.getBorder(fromX, fromY, 'north');
        } else {
            return false;
        }
        
        // Check if border blocks line of sight
        if (border.type === 'wall') {
            return true; // Wall blocks line of sight
        } else if (border.type === 'door' && !border.open) {
            return true; // Closed door blocks line of sight
        }
        
        return false; // No blocking border
    }
    
    idleBehavior() {
        // Enemies in idle state might become alert
        if (Math.random() < 0.05) {
            this.aiState = 'patrol';
        }
    }
    
    patrolBehavior() {
        // Check if we should return to original position
        const distanceFromOriginal = this.map.getDistance(this.x, this.y, this.originalX, this.originalY);
        
        if (distanceFromOriginal > this.patrolRadius) {
            // Return to patrol area
            const path = this.map.findPath(this.x, this.y, this.originalX, this.originalY);
            if (path && path.length > 1) {
                const nextStep = path[1];
                this.moveTo(nextStep.x, nextStep.y);
            }
        } else {
            // Random patrol movement
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
        if (!this.target || !this.target.isAlive()) {
            this.aiState = 'patrol';
            return;
        }
        
        const distance = this.map.getDistance(this.x, this.y, this.target.x, this.target.y);
        console.log(`🏃 ${this.name} at (${this.x}, ${this.y}) chase: distance=${distance}, attackRange=${this.attackRange}, target at (${this.target.x}, ${this.target.y})`);
        
        // Check if we're now close enough to attack
        if (distance <= 1 || (this.attackRange > 1 && distance <= this.attackRange)) {
            console.log(`🎯 ${this.name} at (${this.x}, ${this.y}) now within attack range of target at (${this.target.x}, ${this.target.y}) - distance: ${distance}, range: ${this.attackRange}, switching to attack mode`);
            this.aiState = 'attack';
            return;
        }
        
        // Move towards target
        console.log(`🏃 ${this.name} at (${this.x}, ${this.y}) moving towards target at (${this.target.x}, ${this.target.y}) - distance: ${distance} > range: ${this.attackRange}, actionPoints: ${this.actionPoints}`);
        
        if (this.actionPoints <= 0) {
            console.log(`⏸️ ${this.name} has no action points left, ending turn`);
            return;
        }
        
        const path = this.map.findPath(this.x, this.y, this.target.x, this.target.y);
        if (path && path.length > 1) {
            const nextStep = path[1];
            console.log(`🦶 ${this.name} attempting to move from (${this.x}, ${this.y}) to (${nextStep.x}, ${nextStep.y}) with ${this.actionPoints} action points`);
            this.moveTo(nextStep.x, nextStep.y);
        } else {
            // No path found, try direct movement
            console.log(`🦶 ${this.name} no path found, trying direct movement with ${this.actionPoints} action points`);
            this.moveTowardsTarget();
        }
    }
    
    moveTowardsTarget() {
        if (!this.target) return;
        
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        
        // Try to move in the direction of the target
        if (Math.abs(dx) > Math.abs(dy)) {
            // Move horizontally first
            const newX = this.x + (dx > 0 ? 1 : -1);
            if (this.canMoveTo(newX, this.y)) {
                this.moveTo(newX, this.y);
                return;
            }
        }
        
        // Try vertical movement
        const newY = this.y + (dy > 0 ? 1 : -1);
        if (this.canMoveTo(this.x, newY)) {
            this.moveTo(this.x, newY);
            return;
        }
        
        // If we can't move towards target, stay in place
        console.log(`${this.name} cannot move towards target, staying in place`);
    }
    
    investigateBehavior() {
        if (!this.target) {
            this.aiState = 'patrol';
            return;
        }
        
        // Move towards the sound location
        const distance = this.map.getDistance(this.x, this.y, this.target.x, this.target.y);
        
        if (distance <= 1) {
            // Reached the sound location, look around
            console.log(`${this.name} investigates the sound at (${this.target.x}, ${this.target.y})`);
            this.target = null;
            this.aiState = 'patrol';
        } else {
            // Move towards sound
            const path = this.map.findPath(this.x, this.y, this.target.x, this.target.y);
            if (path && path.length > 1) {
                const nextStep = path[1];
                this.moveTo(nextStep.x, nextStep.y);
            }
        }
    }


    meleeAttackBehavior() {
        this.attack(this.target);
    }

    rangedAttackBehavior() {
        this.rangedAttack(this.target);
    }
    
    
    guardBehavior() {
        // Guard enemies stay near their original position
        const distanceFromOriginal = this.map.getDistance(this.x, this.y, this.originalX, this.originalY);
        
        if (distanceFromOriginal > 1) {
            // Return to guard position
            const path = this.map.findPath(this.x, this.y, this.originalX, this.originalY);
            if (path && path.length > 1) {
                const nextStep = path[1];
                this.moveTo(nextStep.x, nextStep.y);
            }
        } else {
            // Guard position reached, stay idle
            this.aiState = 'idle';
        }
    }
    
    returnToGuardPosition() {
        this.aiState = 'guard';
    }
    
    // Override die method to handle loot drops
    die() {
        console.log(`${this.name} has been defeated!`);
        
        // Drop loot
        this.dropLoot();
        
        // Give experience to player
        const player = this.map ? this.map.getPlayer() : null;
        if (player) {
            player.gainExperience(this.experienceValue);
            console.log(`Gained ${this.experienceValue} experience!`);
        }
        
        super.die();
    }
    
    dropLoot() {
        if (Math.random() < this.dropChance) {
            // Select random item from loot table
            if (this.lootTable.length > 0) {
                const lootItem = this.lootTable[Math.floor(Math.random() * this.lootTable.length)];
                
                // Create item entity at enemy's position
                if (this.map) {
                    const item = {
                        name: lootItem.name,
                        type: 'item',
                        x: this.x,
                        y: this.y,
                        itemType: lootItem.type,
                        value: lootItem.value || 0,
                        description: lootItem.description || ''
                    };
                    
                    // Add item to map (you'd need an Item class for this)
                    console.log(`${this.name} dropped ${lootItem.name}!`);
                }
            }
        }
    }
    
    // Enemy-specific status effects
    stun(duration) {
        this.stunned = true;
        this.stunDuration = duration;
        console.log(`${this.name} is stunned for ${duration} turns!`);
    }
    
    // Override canMoveTo for enemy-specific movement
    canMoveTo(x, y) {
        if (!this.canMove) return false;
        if (!this.map) return false;
        
        return this.map.isWalkableForEnemy(x, y);
    }
    
    // Override restoreActionPoints to use enemy-specific max action points
    restoreActionPoints() {
        this.actionPoints = this.maxActionPoints;
    }
    
    // Override attack method to show enemy attack messages
    attack(target) {
        if (!this.canPerformAction('attack')) return false;
        if (!this.spendActionPoints(1)) return false;
        
        if (!target || !target.isAlive()) return false;
        
        // Enemies use their attack skill value directly (no dice rolling)
        const baseDamage = this.attack;
        
        // Check if target can defend (has reactions)
        if (target.reactions && target.reactions > 0) {
            // Target rolls defense
            const defenseResult = target.rollDefense();
            const finalDamage = Math.max(0, baseDamage - defenseResult.successes);
            
            console.log(`⚔️ ${this.name} attacks ${target.name} for ${baseDamage} damage!`);
            console.log(`🛡️ ${target.name} defends with ${defenseResult.successes} successes, reducing damage to ${finalDamage}`);
            
            if (finalDamage > 0) {
                console.log(`💥 *** ${this.name} causes ${finalDamage} damage to ${target.name}! ***`);
            } else {
                console.log(`✅ *** ${target.name} completely avoids ${this.name}'s attack! ***`);
            }
            
            // Emit attack event for UI updates
            if (this.map && this.map.gameEngine && this.map.gameEngine.eventSystem) {
                this.map.gameEngine.eventSystem.emit('enemy_attack', {
                    enemy: this,
                    target: target,
                    damage: finalDamage,
                    attackType: 'melee',
                    baseDamage: baseDamage,
                    defenseSuccesses: defenseResult.successes
                });
            }
            
            return finalDamage;
        } else {
            // Target has no reactions, takes full damage
            console.log(`⚔️ ${this.name} attacks ${target.name} for ${baseDamage} damage! (${target.name} has no reactions left)`);
            console.log(`💥 *** ${this.name} causes ${baseDamage} damage to ${target.name}! ***`);
            
            // Emit attack event for UI updates
            if (this.map && this.map.gameEngine && this.map.gameEngine.eventSystem) {
                this.map.gameEngine.eventSystem.emit('enemy_attack', {
                    enemy: this,
                    target: target,
                    damage: baseDamage,
                    attackType: 'melee',
                    baseDamage: baseDamage,
                    defenseSuccesses: 0
                });
            }
            
            return baseDamage;
        }
    }
    
    // Ranged attack method for enemies with attackRange > 1
    rangedAttack(target) {
        if (!this.canPerformAction('attack')) return false;
        if (!this.spendActionPoints(1)) return false;
        
        if (!target || !target.isAlive()) return false;
        
        const distance = this.map.getDistance(this.x, this.y, target.x, target.y);
        
        // Check if target is within ranged attack range
        if (distance > this.attackRange) {
            console.log(`${this.name} cannot perform ranged attack - target too far (${distance} > ${this.attackRange})`);
            return false;
        }
        
        // Check line of sight for ranged attacks
        if (!this.hasLineOfSight(target.x, target.y)) {
            console.log(`${this.name} cannot perform ranged attack - no line of sight to ${target.name}`);
            return false;
        }
        
        // Enemies use their attack skill value directly (no dice rolling)
        const baseDamage = this.attack;
        
        // Check if target can defend (has reactions)
        if (target.reactions && target.reactions > 0) {
            // Target rolls defense
            const defenseResult = target.rollDefense();
            const finalDamage = Math.max(0, baseDamage - defenseResult.successes);
            
            console.log(`🏹 ${this.name} performs a ranged attack on ${target.name} for ${baseDamage} damage!`);
            console.log(`🛡️ ${target.name} defends with ${defenseResult.successes} successes, reducing damage to ${finalDamage}`);
            
            if (finalDamage > 0) {
                console.log(`💥 *** ${this.name} causes ${finalDamage} damage to ${target.name} with ranged attack! ***`);
            } else {
                console.log(`✅ *** ${target.name} completely avoids ${this.name}'s ranged attack! ***`);
            }
            
            // Emit ranged attack event for UI updates
            if (this.map && this.map.gameEngine && this.map.gameEngine.eventSystem) {
                this.map.gameEngine.eventSystem.emit('enemy_attack', {
                    enemy: this,
                    target: target,
                    damage: finalDamage,
                    attackType: 'ranged',
                    distance: distance,
                    baseDamage: baseDamage,
                    defenseSuccesses: defenseResult.successes
                });
            }
            
            return finalDamage;
        } else {
            // Target has no reactions, takes full damage
            console.log(`🏹 ${this.name} performs a ranged attack on ${target.name} for ${baseDamage} damage! (${target.name} has no reactions left)`);
            console.log(`💥 *** ${this.name} causes ${baseDamage} damage to ${target.name} with ranged attack! ***`);
            
            // Emit ranged attack event for UI updates
            if (this.map && this.map.gameEngine && this.map.gameEngine.eventSystem) {
                this.map.gameEngine.eventSystem.emit('enemy_attack', {
                    enemy: this,
                    target: target,
                    damage: baseDamage,
                    attackType: 'ranged',
                    distance: distance,
                    baseDamage: baseDamage,
                    defenseSuccesses: 0
                });
            }
            
            return baseDamage;
        }
    }
    
    // Override toJSON to include enemy-specific properties
    toJSON() {
        const base = super.toJSON();
        return {
            ...base,
            enemyType: this.enemyType,
            aggression: this.aggression,
            visionRange: this.visionRange,
            soundRange: this.soundRange,
            attackRange: this.attackRange,
            patrolRadius: this.patrolRadius,
            originalX: this.originalX,
            originalY: this.originalY,
            experienceValue: this.experienceValue,
            goldValue: this.goldValue,
            lootTable: this.lootTable,
            dropChance: this.dropChance,
            target: this.target ? { x: this.target.x, y: this.target.y } : null,
            lastSeenPlayer: this.lastSeenPlayer,
            stunned: this.stunned,
            stunDuration: this.stunDuration
        };
    }
}
