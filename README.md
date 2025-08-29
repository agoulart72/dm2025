# Dungeon Master 2025

A 2D dungeon crawler game built with HTML5 Canvas and JavaScript. Navigate through dungeons, battle enemies, and progress your character in this turn-based tactical game.

## Features

### Core Gameplay
- **Turn-based Movement**: Move your character using action points
- **Grid-based Combat**: Strategic positioning on a 4x4 sub-grid within each tile
- **Character Progression**: Level up and gain experience from defeating enemies
- **Multiple Character Types**: Choose from different character classes (Warrior, Mage, Rogue, Cleric)

### Map System
- **Dynamic Map Loading**: Load maps from JSON files
- **Multiple Tile Types**: Floor, walls, doors, stairs, water, and lava
- **Entity Management**: Up to 16 entities can occupy a single tile
- **Pathfinding**: A* algorithm for enemy AI and movement

### Combat System
- **Action Points**: Spend points to move and attack
- **Turn Management**: End your turn to restore action points
- **Enemy AI**: Different enemy types with unique behaviors
- **Status Effects**: Poison, healing, and other effects

### User Interface
- **Modern Design**: Dark theme with gradient backgrounds
- **Real-time Stats**: Action points, turn counter, and character info
- **Tile Information**: Hover over tiles to see details
- **Responsive Layout**: Works on desktop and mobile devices

## How to Play

### Controls
- **Arrow Keys**: Move your character
- **Q**: End turn and restore action points
- **R**: Reset the game
- **Mouse**: Hover over tiles to see information

### Game Rules
1. **Movement**: Each movement costs 1 action point
2. **Action Points**: You start with 3 action points per turn
3. **Ending Turns**: Press Q to end your turn and restore action points
4. **Combat**: Move adjacent to enemies to attack them
5. **Leveling**: Gain experience from defeating enemies to level up

### Character Classes
- **Warrior**: High HP and attack, good for beginners
- **Mage**: Powerful spells and ranged attacks
- **Rogue**: High speed and critical hits
- **Cleric**: Healing abilities and support spells

## Installation and Setup

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software required

### Running the Game
1. Clone or download this repository
2. Open `index.html` in your web browser
3. The game will start automatically

### Development Setup
If you want to modify the game:

1. **File Structure**:
   ```
   dm2025/
   ├── index.html          # Main HTML file
   ├── styles/
   │   └── main.css        # Game styles
   ├── js/
   │   ├── main.js         # Game entry point
   │   ├── engine/
   │   │   └── GameEngine.js
   │   ├── input/
   │   │   └── InputManager.js
   │   ├── ui/
   │   │   └── UIManager.js
   │   ├── map/
   │   │   ├── GameMap.js
   │   │   └── MapLoader.js
   │   └── entities/
   │       ├── Character.js
   │       └── Enemy.js
   └── maps/               # Map files (future)
   ```

2. **Local Development Server**:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Then open http://localhost:8000 in your browser
   ```

## Game Architecture

### Core Systems
- **GameEngine**: Main game loop, rendering, and state management
- **InputManager**: Keyboard and mouse input handling
- **UIManager**: Interface updates and user feedback
- **MapLoader**: Map data loading and caching
- **GameMap**: Map data structure and entity management

### Entity System
- **Character**: Base class for all characters (player and NPCs)
- **Enemy**: Enemy-specific AI and behavior
- **Future**: Item, Spell, and Effect classes

### Map System
- **Tile-based**: Each tile can contain multiple entities
- **4x4 Sub-grid**: Entities are positioned within tiles
- **Pathfinding**: A* algorithm for movement
- **Collision Detection**: Prevents invalid movements

## Customization

### Adding New Maps
1. Create a JSON file in the `maps/` directory
2. Follow the map data structure:
   ```json
   {
     "name": "My Custom Map",
     "width": 15,
     "height": 15,
     "tiles": [...],
     "entities": [...]
   }
   ```

### Adding New Character Types
1. Extend the `Character` class
2. Add new character data to the map loader
3. Update the UI manager for character sprites

### Adding New Enemy Types
1. Extend the `Enemy` class or modify existing enemy types
2. Add AI behavior patterns
3. Update the map loader with new enemy data

## Future Features

### Planned Enhancements
- **Server Integration**: Save scores and download new maps
- **More Character Classes**: Additional character types and abilities
- **Equipment System**: Weapons, armor, and items
- **Spell System**: Magic spells and abilities
- **Multiplayer**: Cooperative and competitive modes
- **Map Editor**: Visual map creation tool
- **Sound Effects**: Audio feedback and music
- **Particle Effects**: Visual enhancements

### Technical Improvements
- **WebGL Rendering**: Hardware-accelerated graphics
- **State Management**: More robust game state handling
- **Modding Support**: Plugin system for custom content
- **Performance Optimization**: Better rendering and AI algorithms

## Contributing

This is a learning project, but contributions are welcome! Areas that need work:

1. **Bug Fixes**: Report and fix any issues you find
2. **New Features**: Implement planned features
3. **Code Quality**: Improve code organization and performance
4. **Documentation**: Better documentation and comments
5. **Testing**: Add unit tests and integration tests

## License

This project is open source and available under the MIT License.

## Credits

- **Game Design**: Inspired by classic dungeon crawlers
- **Graphics**: Placeholder graphics (replace with custom assets)
- **Code**: Built with modern JavaScript and HTML5 Canvas
- **UI Design**: Modern, responsive design with CSS3

---

**Enjoy playing Dungeon Master 2025!** 🎮⚔️🏰
