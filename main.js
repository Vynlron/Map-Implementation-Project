// main.js
// Contains all JavaScript and Phaser 3 logic for the Enhanced Tiled Map Tester

// --- Define this object globally to share configuration ---
const gameConfig = {
  mapData: null,
  tilesetImage: null,
  tilesetKey: 'tileset_dynamic',
  playerSpeed: 200,
  debugMode: false,
  showPhysics: false,
  tilesetName: '',
  tileWidth: 32,
  tileHeight: 32,
  enableCollision: true
};

// --- DOM References ---
const mapFileInput = document.getElementById('mapFile');
const tilesetFileInput = document.getElementById('tilesetFile');
const tilesetNameInput = document.getElementById('tilesetNameInTiled');
const tileWidthInput = document.getElementById('tileWidth');
const tileHeightInput = document.getElementById('tileHeight');
const loadButton = document.getElementById('loadButton');
const showDebugCheckbox = document.getElementById('showDebug');
const enableCollisionCheckbox = document.getElementById('enableCollision');
const statusMsg = document.getElementById('statusMsg');
const warningPanel = document.getElementById('warningPanel');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const debugPanel = document.getElementById('debugPanel');
const speedButtons = document.querySelectorAll('.speed-btn');
const customSpeedInput = document.getElementById('customSpeed');

let game = null;

// --- UI Handlers ---
mapFileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        gameConfig.mapData = JSON.parse(e.target.result);
        showStatus("Map JSON loaded successfully!", "success");

        const tileset = gameConfig.mapData.tilesets[0];
        if (tileset.name && !tilesetNameInput.value)
          tilesetNameInput.value = tileset.name;
        if (tileset.tilewidth && tileset.tileheight) {
          tileWidthInput.value = tileset.tilewidth;
          tileHeightInput.value = tileset.tileheight;
        }

        const hasCollision = gameConfig.mapData.layers?.some(
          l => l.properties?.some(p => p.name === "collision" && p.value === true)
        );
        if (!hasCollision && enableCollisionCheckbox.checked)
          showWarning("No layer with 'collision' property found. Collisions may not work.");
        else hideWarning();

      } catch (err) {
        showStatus("Error parsing map JSON", "error");
        console.error(err);
      }
    };
    reader.readAsText(file);
  }
});

tilesetFileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      gameConfig.tilesetImage = e.target.result;
      showStatus("Tileset image loaded successfully!", "success");
    };
    reader.readAsDataURL(file);
  }
});

loadButton.addEventListener('click', () => {
  gameConfig.tilesetName = tilesetNameInput.value.trim();
  gameConfig.tileWidth = parseInt(tileWidthInput.value);
  gameConfig.tileHeight = parseInt(tileHeightInput.value);
  gameConfig.debugMode = showDebugCheckbox.checked;
  gameConfig.enableCollision = enableCollisionCheckbox.checked;

  if (!gameConfig.mapData || !gameConfig.tilesetImage || !gameConfig.tilesetName) {
    showStatus("Missing input. Please fill all required fields.", "error");
    return;
  }

  debugPanel.style.display = gameConfig.debugMode ? 'block' : 'none';
  if (!gameConfig.debugMode) debugPanel.innerHTML = '';

  showLoading("Initializing game...");

  if (game) game.destroy(true);

  game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'gameContainer',
    backgroundColor: '#2d2d2d',
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [GameScene]
  });
});

showDebugCheckbox.addEventListener('change', e => {
  debugPanel.style.display = e.target.checked ? 'block' : 'none';
  if (!e.target.checked) debugPanel.innerHTML = '';
});

enableCollisionCheckbox.addEventListener('change', e => {
  gameConfig.enableCollision = e.target.checked;
  showStatus("Collision setting changed. Reload map to apply.", "warning");
});

customSpeedInput.addEventListener('change', (e) => {
  const speed = Math.min(1000, Math.max(50, parseInt(e.target.value) || 200));
  e.target.value = speed;
  gameConfig.playerSpeed = speed;
  
  // Update speed buttons state
  speedButtons.forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.speed) === speed);
  });
});

speedButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const speed = parseInt(btn.dataset.speed);
    speedButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    gameConfig.playerSpeed = speed;
    customSpeedInput.value = speed;
  });
});

function showStatus(message, type = "info") {
  statusMsg.className = `status ${type}`;
  statusMsg.innerHTML = message;
  statusMsg.style.display = "block";
}

function showWarning(message) {
  warningPanel.innerText = message;
  warningPanel.style.display = "block";
}

function hideWarning() {
  warningPanel.style.display = "none";
}

function showLoading(text = "Loading map...") {
  loadingText.textContent = text;
  loadingOverlay.style.display = "flex";
}

function hideLoading() {
  loadingOverlay.style.display = "none";
}

function updateDebugInfo(info) {
  debugPanel.innerHTML = info;
}

// --- Game Scene Class ---
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.cursors = null;
    this.collisionLayers = [];
  }

  preload() {
    this.load.image(gameConfig.tilesetKey, gameConfig.tilesetImage);
    this.cache.json.remove('tilemap');
    this.load.tilemapTiledJSON('tilemap', gameConfig.mapData);

    // Create player graphics programmatically
    const playerGraphics = this.add.graphics();
    
    // Core body
    playerGraphics.fillStyle(0x00ffcc, 1);
    playerGraphics.fillCircle(16, 16, 12);
    
    // Inner glow
    playerGraphics.fillStyle(0x33ffdd, 1);
    playerGraphics.fillCircle(16, 16, 8);
    
    // Core center
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillCircle(16, 16, 4);
    
    // Save as texture
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
  }

  create() {
    const map = this.make.tilemap({ key: 'tilemap' });
    const tiles = map.addTilesetImage(
      gameConfig.tilesetName, gameConfig.tilesetKey,
      gameConfig.tileWidth, gameConfig.tileHeight
    );

    map.layers.forEach((layerData) => {
      const layer = map.createLayer(layerData.name, tiles, 0, 0);
      if (!layer) return;

      // Collision if layer name is "collision" (case-insensitive) or has property collision:true
      const isCollision =
        layerData.name.toLowerCase() === 'collision' ||
        (layerData.properties?.some(
          p => p.name === 'collision' && p.value === true
        ));

      if (isCollision && gameConfig.enableCollision) {
        layer.setCollisionByExclusion([-1]);
        this.collisionLayers.push(layer);
      }
    });

    const spawnX = map.widthInPixels / 2;
    const spawnY = map.heightInPixels / 2;
    
    // Create player with new texture and effects
    this.player = this.physics.add.sprite(spawnX, spawnY, 'player')
      .setCircle(12, 4, 4) // Set circular hitbox
      .setCollideWorldBounds(true);
    
    // Add glow effect
    const glowFX = this.player.postFX.addGlow(0x00ffcc, 0, 0, false, 0.1, 16);
    
    // Add pulse animation
    this.tweens.add({
      targets: this.player,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Add rotation animation
    this.tweens.add({
      targets: glowFX,
      outerStrength: 4,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Update movement visuals
    this.player.setDrag(500);
    this.player.setAngularDrag(500);

    this.collisionLayers.forEach(layer => {
      this.physics.add.collider(this.player, layer);
    });

    // Update camera settings
    this.cameras.main.setZoom(1);
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setDeadzone(50, 50);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.spaceKey.on('down', () => {
      gameConfig.showPhysics = !gameConfig.showPhysics;
      this.collisionLayers.forEach(layer => {
        layer.setAlpha(gameConfig.showPhysics ? 0.5 : 1);
      });
    });

    // Add right-click teleport
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        
        // Check if the clicked point is within map bounds
        if (worldPoint.x >= 0 && worldPoint.x <= this.physics.world.bounds.width &&
            worldPoint.y >= 0 && worldPoint.y <= this.physics.world.bounds.height) {
          
          // Create a flash effect at player's position
          const flash = this.add.circle(this.player.x, this.player.y, 20, 0x00ffcc, 1);
          this.tweens.add({
            targets: flash,
            scale: 0,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy()
          });

          // Teleport player
          this.player.setPosition(worldPoint.x, worldPoint.y);
          
          // Create arrival effect
          const arrive = this.add.circle(worldPoint.x, worldPoint.y, 0, 0x00ffcc, 0.8);
          this.tweens.add({
            targets: arrive,
            scale: 1,
            radius: 20,
            alpha: 0,
            duration: 300,
            onComplete: () => arrive.destroy()
          });
        }
      }
    });

    // Prevent right-click context menu
    this.game.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    hideLoading();
    showStatus("Map loaded! Use arrow keys to move. SPACE to toggle debug.", "success");
  }

  update() {
    if (!this.cursors || !this.player.body) return;
    const speed = gameConfig.playerSpeed;
    let vx = 0, vy = 0;
    
    // Update movement with rotation
    if (this.cursors.left.isDown) {
      vx = -speed;
      this.player.rotation -= 0.05;
    }
    else if (this.cursors.right.isDown) {
      vx = speed;
      this.player.rotation += 0.05;
    }
    if (this.cursors.up.isDown) vy = -speed;
    else if (this.cursors.down.isDown) vy = speed;

    this.player.body.setVelocity(vx, vy);
    if (vx !== 0 && vy !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }

    // Add trail effect when moving
    if (vx !== 0 || vy !== 0) {
      const trail = this.add.circle(
        this.player.x,
        this.player.y,
        8,
        0x00ffcc,
        0.4
      );
      
      this.tweens.add({
        targets: trail,
        alpha: 0,
        scale: 0.1,
        duration: 200,
        onComplete: () => trail.destroy()
      });
    }

    if (gameConfig.debugMode) {
      updateDebugInfo(`Player: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`);
    }
  }
}

// Fix: Drag and drop support for map and tileset (use .advanced-controls)
const controls = document.querySelector('.advanced-controls');
if (controls && mapFileInput && tilesetFileInput) {
  controls.addEventListener('dragover', e => { e.preventDefault(); controls.style.background = '#e0ffe0'; });
  controls.addEventListener('dragleave', e => { e.preventDefault(); controls.style.background = ''; });
  controls.addEventListener('drop', e => {
    e.preventDefault();
    controls.style.background = '';
    for (const file of e.dataTransfer.files) {
      if (file.name.endsWith('.json')) mapFileInput.files = new DataTransfer().items.add(file).files;
      else if (file.type.startsWith('image/')) tilesetFileInput.files = new DataTransfer().items.add(file).files;
    }
    // Trigger change events
    mapFileInput.dispatchEvent(new Event('change'));
    tilesetFileInput.dispatchEvent(new Event('change'));
  });
}

// Add fullscreen button logic
const fullscreenBtn = document.getElementById('fullscreenBtn');
const gameContainer = document.getElementById('gameContainer');
if (fullscreenBtn && gameContainer) {
  fullscreenBtn.addEventListener('click', () => {
    // Use the standard Fullscreen API for all browsers
    if (
      document.fullscreenElement === gameContainer ||
      document.webkitFullscreenElement === gameContainer ||
      document.mozFullScreenElement === gameContainer ||
      document.msFullscreenElement === gameContainer
    ) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    } else {
      if (gameContainer.requestFullscreen) gameContainer.requestFullscreen();
      else if (gameContainer.webkitRequestFullscreen) gameContainer.webkitRequestFullscreen();
      else if (gameContainer.mozRequestFullScreen) gameContainer.mozRequestFullScreen();
      else if (gameContainer.msRequestFullscreen) gameContainer.msRequestFullscreen();
    }
  });
}
