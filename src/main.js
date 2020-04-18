import * as util from '/lib/util.js';

export function init() {
  const game = new Phaser.Game({
    width: 640,
    height: 480,
    parent: 'gameContainer',
    scene: new util.BootScene('play'),
    physics: {
      default: 'arcade',
      arcade: {
        debug: true
      }
    },
  });
  game.scene.add('play', new PlayScene());
  return game;
}

const PlayScene = util.extend(Phaser.Scene, 'PlayScene', {
  constructor: function() {
    this.constructor$Scene();
    this.buildings = null;
    this.enemyGroup = null;
    this.player = null;
    this.inputHandler = null;
  },
  create() {
    this.inputHandler = new InputHandler(this);

    this.buildings = this.physics.add.staticGroup();
    this.enemies = new EnemyGroup(this);

    const BUILDINGS_AMOUNT = 10;
    const WIDTH = 640;
    const HEIGHT = 480;
    for(let i = 0; i < BUILDINGS_AMOUNT; i++) {
      let x = Math.floor(Math.random() * WIDTH);
      let y = Math.floor(Math.random() * HEIGHT);
      this.buildings.create(x, y, 'building');
    }

    this.player = new Player(32, 32, this);
    this.physics.add.collider(this.player.sprite, this.enemies.group);
  },
  update() {
    this.player.update();
    this.enemies.update();
  }
});

const InputHandler = util.extend(Object, 'InputHandler', {
  constructor: function(scene) {
    this.downKeys = new Set();

    scene.input.keyboard.on('keydown', event => {
      this.downKeys.add(event.key.toUpperCase());
    });

    scene.input.keyboard.on('keyup', event => {
      this.downKeys.delete(event.key.toUpperCase());
    });
  },
  isKeyDown(key) {
    return this.downKeys.has(key);
  }
});

const Player = util.extend(Object, 'Player', {
  constructor: function(x, y, scene) {
    this.sprite = scene.physics.add.sprite(32, 32, 'player');
    scene.physics.add.collider(this.sprite, scene.buildings);
    this.movement = new PlayerMovement(this, scene);
    this.cameraCenter = new CameraCenter(this, scene);
  },
  update() {
    this.movement.update();
    this.cameraCenter.update();
  }
});

const PlayerMovement = util.extend(Object, 'PlayerMovement', {
  constructor: function(player, scene) {
    this.player = player;
    this.inputHandler = scene.inputHandler;
  },
  update() {
    var xVel = 0;
    var yVel = 0;
    const MOVE_SPEED = 100;
    if(this.inputHandler.isKeyDown('D')) {
      xVel = MOVE_SPEED;
    }
    if(this.inputHandler.isKeyDown('A')) {
      xVel = -MOVE_SPEED;
    }
    if(this.inputHandler.isKeyDown('S')) {
      yVel = MOVE_SPEED;
    }
    if(this.inputHandler.isKeyDown('W')) {
      yVel = -MOVE_SPEED;
    }
    this.player.sprite.setVelocity(xVel, yVel);
  }
});

const CameraCenter = util.extend(Object, 'CameraCenter', {
  constructor: function(player, scene) {
    this.player = player;
    this.camera = scene.cameras.main;
  },
  update() {
    this.camera.centerOn(this.player.sprite.x, this.player.sprite.y);
  }
});

const EnemyGroup = util.extend(Object, 'EnemyGroup', {
  constructor: function(scene) {
    this.group = scene.physics.add.group();
    scene.physics.add.collider(this.group, scene.buildings);
    scene.physics.add.collider(this.group);
    this.children = new Set();

    const ENEMY_AMOUNT = 10;

    for(let i = 0; i < ENEMY_AMOUNT; i++) {
      this.children.add(new Enemy(scene, this));
    }
  },
  update() {
    for(let child of this.children) {
      child.update();
    }
  }
});

const Enemy = util.extend(Object, 'Enemy', {
  constructor: function(scene, group) {
    this.scene = scene;

    const WIDTH = 640;
    const HEIGHT = 480;

    const x = Math.floor(Math.random() * WIDTH);
    const y = Math.floor(Math.random() * HEIGHT);
    this.sprite = group.group.create(x, y, 'enemy');
  },
  update() {
    const SPEED = 30;

    let x = this.scene.player.sprite.x - this.sprite.x;
    let y = this.scene.player.sprite.y - this.sprite.y;
    
    x = this.changeVel(x, true);
    y = this.changeVel(y, false);
    
    let dist = Math.sqrt(x * x + y * y);
    if(dist < 5) {
        this.sprite.setVelocity(0, 0);
    } else {
        let resize = SPEED / dist;
        
        x *= resize;
        y *= resize;
        
        if(isNaN(x) || isNaN(y)) {
            let a = 0;
        }
        this.sprite.setVelocity(x, y);
    }
  },
  changeVel(original, isX) {
    if(original != 0) {
      let offset;
      if(original < 0) {
          offset = -1;
      } else {
          offset = 1;
      }

      let x, y;
      if(isX) {
          x = offset;
        y = 0;
      } else {
          x = 0;
          y = offset;
      }

      let enemyBounds = this.sprite.getBounds();
      let testBounds = Phaser.Geom.Rectangle.Offset(enemyBounds, x, y);
      
      var objs = [
          this.scene.buildings.getChildren(),
          this.scene.enemies.group.getChildren(),
          this.scene.player.sprite
      ].flat();
      for(let obj of objs) {
          if(obj === this.sprite) {
              continue;
          }
          if(Phaser.Geom.Rectangle.Overlaps(testBounds, obj.getBounds())) {
              return 0;
          }
      }
    }
    return original;
  }
});