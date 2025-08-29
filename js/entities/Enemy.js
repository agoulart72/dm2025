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
        if (this.stunned) {
            this.stunDuration--;
            if (this.stunDuration <= 0) {
                this.stunned = false;
            }
            return;
        }
        
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
            this.aiState = 'chase';
            console.log(`${this.name} sees player at (${visionTarget.x}, ${visionTarget.y}) - switching to chase mode`);
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
            case 'attack':
                this.attackBehavior();
                break;
            case 'guard':
                this.guardBehavior();
                break;
        }
    }
    
    checkVisionDetection() {
        if (!this.map) return null;
        
        const player = this.map.getPlayer();
        if (!player || !player.isAlive()) return null;
        
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
        console.log(`${this.name} chase: distance=${distance}, attackRange=${this.attackRange}, at (${this.x},${this.y}), target at (${this.target.x},${this.target.y})`);
        
        if (distance <= this.attackRange) {
            // Close enough to attack
            console.log(`${this.name} switching to attack mode (within attack range)`);
            this.aiState = 'attack';
        } else if (distance === 0) {
            // On the same tile as target - attack immediately
            console.log(`${this.name} switching to attack mode (same tile)`);
            this.aiState = 'attack';
        } else {
            // Move towards target
            console.log(`${this.name} moving towards target`);
            const path = this.map.findPath(this.x, this.y, this.target.x, this.target.y);
            if (path && path.length > 1) {
                const nextStep = path[1];
                this.moveTo(nextStep.x, nextStep.y);
            } else {
                // No path found, try direct movement
                this.moveTowardsTarget();
            }
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
    
    attackBehavior() {
        if (!this.target) {
            this.aiState = 'patrol';
            return;
        }
        
        // Don't attack sound targets
        if (this.target.isSoundTarget) {
            this.aiState = 'investigate';
            return;
        }
        
        // Check if target is still alive (for player targets)
        if (!this.target.isAlive()) {
            this.aiState = 'patrol';
            return;
        }
        
        const distance = this.map.getDistance(this.x, this.y, this.target.x, this.target.y);
        console.log(`${this.name} attack: distance=${distance}, attackRange=${this.attackRange}, actionPoints=${this.actionPoints}`);
        
        if (distance <= this.attackRange || distance === 0) {
            // Attack the target
            console.log(`${this.name} attempting to attack ${this.target.name}`);
            this.attack(this.target);
        } else {
            // Move closer
            console.log(`${this.name} too far to attack, switching to chase`);
            this.aiState = 'chase';
        }
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
        
        const damage = this.calculateDamage(target);
        const actualDamage = target.takeDamage(damage);
        
        // Show attack message
        console.log(`${this.name} attacks ${target.name} for ${actualDamage} damage!`);
        
        // Emit attack event for UI updates
        if (this.map && this.map.gameEngine && this.map.gameEngine.eventSystem) {
            this.map.gameEngine.eventSystem.emit('enemy_attack', {
                enemy: this,
                target: target,
                damage: actualDamage
            });
        }
        
        return actualDamage;
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
