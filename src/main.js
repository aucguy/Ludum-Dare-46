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
    this.shooter = null;
    var bulletHitKill = null;
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

    this.player = new Player(0, 0, this);
    this.physics.add.collider(this.player.sprite, this.enemies.group);
    
    this.shooter = new Shooter(this);
    this.bulletHitKill = new BulletHitKill(this);
    this.bulletHitStop = new BulletHitStop(this);
  },
  update() {
    this.player.update();
    this.enemies.update();
    this.shooter.update();
    this.inputHandler.update();
    this.bulletHitKill.update();
    this.bulletHitStop.update();
  }
});

const InputHandler = util.extend(Object, 'InputHandler', {
  constructor: function(scene) {
    this.downKeys = new Set();
    this.mouseClicked = false;
    this.mousePos = [0, 0];

    scene.input.keyboard.on('keydown', event => {
      this.downKeys.add(event.key.toUpperCase());
    });

    scene.input.keyboard.on('keyup', event => {
      this.downKeys.delete(event.key.toUpperCase());
    });
    
    scene.input.on('pointerdown', pointer => {
        this.mouseClicked = true;
    });
    
    scene.input.on('pointermove', pointer => {
       this.mousePos = [pointer.x, pointer.y]; 
    });
  },
  isKeyDown(key) {
      return this.downKeys.has(key);
  },
  wasMouseClicked() {
      return this.mouseClicked;
  },
  getMousePos() {
      return this.mousePos;
  },
  update() {
      this.mouseClicked = false;
  }
});

const Player = util.extend(Object, 'Player', {
  constructor: function(x, y, scene) {
    this.sprite = scene.physics.add.sprite(x, y, 'player');
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
    let xVel = 0;
    let yVel = 0;
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

      const enemyBounds = this.sprite.getBounds();
      const testBounds = Phaser.Geom.Rectangle.Offset(enemyBounds, x, y);
      
      const objs = [
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

const Shooter = util.extend(Object, 'Shooter', {
   constructor: function(scene) {
       this.scene = scene;
       this.bullets = new Set;
   },
   update() {
       if(this.scene.inputHandler.wasMouseClicked()) {
           const mousePos = this.scene.inputHandler.getMousePos();
           const mouseX = mousePos[0] - this.scene.sys.game.canvas.width / 2;
           const mouseY = mousePos[1] - this.scene.sys.game.canvas.height / 2;
           let x = mouseX - this.scene.cameras.main.x;
           let y = mouseY - this.scene.cameras.main.y;
           
           const resize = 1000 / Math.sqrt(x*x + y*y);
           
           x *= resize;
           y *= resize;
                      
           this.bullets.add(new Bullet(this.scene, this.scene.player.sprite.x,
                   this.scene.player.sprite.y, x, y));
       }
   }
});

const Bullet = util.extend(Object, 'Bullet', {
    constructor: function(scene, xPos, yPos, xVel, yVel) {
        this.sprite = scene.add.sprite(xPos, yPos, 'bullet');
        const DURATION = 3;
        scene.add.tween({
            targets: this.sprite,
            duration: DURATION * 1000,
            props: {
                x: xPos + xVel * DURATION,
                y: yPos + yVel * DURATION
            },
            onComplete: () => {
                this.sprite.destroy();
                scene.shooter.bullets.delete(this);
            }
        });
    }
});

const BulletHitKill = util.extend(Object, 'BulletHitKill', {
   constructor: function(scene) {
       this.scene = scene;
   },
   update() {
       for(let bullet of this.scene.shooter.bullets) {
           for(let enemy of this.scene.enemies.children) {
               let bulletBounds = bullet.sprite.getBounds();
               let enemyBounds = enemy.sprite.getBounds();
               if(Phaser.Geom.Rectangle.Overlaps(bulletBounds, enemyBounds)) {
                   this.scene.enemies.children.delete(enemy);
                   enemy.sprite.destroy();
                   
                   this.scene.shooter.bullets.delete(bullet);
                   bullet.sprite.destroy();
               }
           }
       }
   }
});

const BulletHitStop = util.extend(Object, 'BulletHitStop', {
    constructor: function(scene) {
        this.scene = scene;
    },
    update() {
        for(let bullet of this.scene.shooter.bullets) {
            for(let building of this.scene.buildings.getChildren()) {
                let bulletBounds = bullet.sprite.getBounds();
                let buildingBounds = building.getBounds();
                if(Phaser.Geom.Rectangle.Overlaps(bulletBounds, buildingBounds)) {
                    this.scene.shooter.bullets.delete(bullet);
                    bullet.sprite.destroy();
                }
            }
        }
    }
});