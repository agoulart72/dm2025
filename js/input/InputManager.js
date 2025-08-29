export class InputManager {
    constructor() {
        this.keys = {};
        this.keyHandlers = {};
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        // Set up event listeners
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyDown(e.code);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Prevent default behavior for game keys
        document.addEventListener('keydown', (e) => {
            const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyQ', 'KeyR'];
            if (gameKeys.includes(e.code)) {
                e.preventDefault();
            }
        });
        
        this.isInitialized = true;
    }
    
    handleKeyDown(keyCode) {
        if (this.keyHandlers[keyCode]) {
            this.keyHandlers[keyCode].forEach(handler => {
                try {
                    handler();
                } catch (error) {
                    console.error('Error in key handler:', error);
                }
            });
        }
    }
    
    onKeyDown(keyCode, handler) {
        if (!this.keyHandlers[keyCode]) {
            this.keyHandlers[keyCode] = [];
        }
        this.keyHandlers[keyCode].push(handler);
    }
    
    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }
    
    getPressedKeys() {
        return Object.keys(this.keys).filter(key => this.keys[key]);
    }
    
    clearHandlers() {
        this.keyHandlers = {};
    }
    
    removeHandler(keyCode, handler) {
        if (this.keyHandlers[keyCode]) {
            const index = this.keyHandlers[keyCode].indexOf(handler);
            if (index > -1) {
                this.keyHandlers[keyCode].splice(index, 1);
            }
        }
    }
}
