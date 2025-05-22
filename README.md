# Tiled Map Tester

An interactive web-based tool for testing and visualizing Tiled Map Editor JSON exports using Phaser 3. Perfect for game developers who want to quickly test their tile-based maps.

![Tiled Map Tester](screenshot.png)

## Features

- **Instant Map Loading**: Drag & drop or upload your Tiled JSON map and tileset images
- **Real-time Testing**: Move around your map with a smooth, glowing player character
- **Visual Effects**:
  - Player glow and pulse animations
  - Movement trails
  - Teleport effects with right-click
- **Debug Tools**:
  - Toggle collision visualization with SPACE
  - Optional debug panel showing player coordinates
  - Visual feedback for collisions
- **Customization**:
  - Adjustable player movement speed
  - Configurable tile dimensions
  - Fullscreen support
  - Collision layer toggle

## Getting Started

### Prerequisites

- A modern web browser
- Maps exported from [Tiled Map Editor](https://www.mapeditor.org/) in JSON format
- Tileset images (PNG/JPG)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tiled-map-tester.git
cd tiled-map-tester
```

2. Open `index.html` in a web browser or serve using a local server.

### Usage

1. Export your map from Tiled:
   - File → Export As → JSON
   - **Important**: Uncheck "Embed tilesets" when exporting

2. In the Tiled Map Tester:
   - Upload your JSON map file
   - Upload your tileset image
   - Enter the exact tileset name (as used in Tiled)
   - Click "Load Map & Start"

3. Controls:
   - **Arrow Keys**: Move player
   - **Right Click**: Teleport
   - **Space**: Toggle collision debug
   - **Fullscreen Button**: Toggle fullscreen mode

## Collision Support

There are two ways to define collision layers:

1. Name a layer "collision" (case-insensitive)
2. Add a custom property `collision: true` to any layer in Tiled

## Technical Details

- Built with [Phaser 3](https://phaser.io/) v3.80.1
- Pure vanilla JavaScript - no build tools required
- Responsive design that works on all screen sizes
- Supports multiple map layers and collision detection
- Drag & drop file support
- Built-in error handling and validation

## Project Structure

```
├── index.html       # Main HTML file
├── style.css        # Styles and animations
├── main.js         # Game logic and Phaser implementation
└── README.md       # Documentation
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Phaser](https://phaser.io/) - HTML5 game framework
- [Tiled Map Editor](https://www.mapeditor.org/) - Level editor
