export class MonsterLoader {
    constructor() {
        this.monsters = null;
        this.loaded = false;
    }
    
    async loadMonsters() {
        if (this.loaded && this.monsters) {
            return this.monsters;
        }
        
        try {
            const response = await fetch('maps/monsters.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.monsters = data.monsters;
            this.loaded = true;
            
            console.log(`Loaded ${Object.keys(this.monsters).length} monster types`);
            return this.monsters;
            
        } catch (error) {
            console.error('Failed to load monsters.json', error);
            throw new Error('Failed to load monster data');
        }
    }
    
    getMonsterData(monsterType) {
        if (!this.monsters || !this.monsters[monsterType]) {
            console.error(`Monster type '${monsterType}' not found`);
            return null;
        }
        
        return this.monsters[monsterType];
    }
    
    getRandomMonsterType() {
        if (!this.monsters) {
            console.error('Monsters not loaded');
            return 'goblin'; // fallback
        }
        
        const monsterTypes = Object.keys(this.monsters);
        return monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
    }
    
    getRandomVariant(monsterType) {
        const monsterData = this.getMonsterData(monsterType);
        if (!monsterData || !monsterData.variants) {
            return monsterType;
        }
        
        return monsterData.variants[Math.floor(Math.random() * monsterData.variants.length)];
    }
    
    getAllMonsterTypes() {
        if (!this.monsters) {
            return [];
        }
        
        return Object.keys(this.monsters);
    }
    
    getMonsterDescription(monsterType) {
        const monsterData = this.getMonsterData(monsterType);
        return monsterData ? monsterData.description : 'Unknown monster';
    }
}
