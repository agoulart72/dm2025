export class EventSystem {
    constructor() {
        this.listeners = new Map();
        this.eventHistory = [];
        this.maxHistorySize = 100; // Keep last 100 events
    }

    // Event types
    static EVENT_TYPES = {
        TURN_START: 'turn_start',
        TURN_END: 'turn_end',
        DOOR_OPEN: 'door_open',
        DOOR_BASH: 'door_bash',
        PLAYER_MOVE: 'player_move',
        PLAYER_ATTACK: 'player_attack',
        ENEMY_MOVE: 'enemy_move',
        ENEMY_ATTACK: 'enemy_attack',
        ITEM_PICKUP: 'item_pickup',
        LEVEL_UP: 'level_up',
        GAME_START: 'game_start',
        GAME_END: 'game_end'
    };

    // Subscribe to an event type
    on(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push(callback);
    }

    // Unsubscribe from an event type
    off(eventType, callback) {
        if (this.listeners.has(eventType)) {
            const callbacks = this.listeners.get(eventType);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // Emit an event
    emit(eventType, data = {}) {
        const event = {
            type: eventType,
            data: data,
            timestamp: Date.now()
        };

        // Add to history
        this.eventHistory.push(event);
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }

        // Notify listeners
        if (this.listeners.has(eventType)) {
            this.listeners.get(eventType).forEach(callback => {
                try {
                    callback(event);
                } catch (error) {
                    console.error('Error in event listener:', error);
                }
            });
        }

        // Also notify global listeners (for all events)
        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(callback => {
                try {
                    callback(event);
                } catch (error) {
                    console.error('Error in global event listener:', error);
                }
            });
        }

        return event;
    }

    // Get recent events
    getRecentEvents(count = 10) {
        return this.eventHistory.slice(-count);
    }

    // Get events by type
    getEventsByType(eventType) {
        return this.eventHistory.filter(event => event.type === eventType);
    }

    // Clear event history
    clearHistory() {
        this.eventHistory = [];
    }

    // Get all listeners for debugging
    getListeners() {
        return this.listeners;
    }
}
