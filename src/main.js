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
        //debug: true
      }
    },
  });
  game.scene.add('play', new PlayScene());
  return game;
}

const PlayScene = util.extend(Phaser.Scene, 'PlayScene', {
  constructor: function() {
    this.constructor$Scene();
    this.statics = null;
    this.enemies = null;
    this.player = null;
    this.inputHandler = null;
    this.bullets = null;
    this.shooter = null;
    this.bulletHitKill = null;
    this.bulletHitStop = null;
    this.hud = null;
    this.enemyCollision = null;
    this.timeHandler = null;
    this.pickups = null;
    this.playerPickup = null;
  },
  create() {
    this.timeHandler = new TimeHandler();
    this.inputHandler = new InputHandler(this);

    this.enemies = new EnemyGroup(this);
    this.statics = new StaticGroup(this);
    this.player = new Player(0, 0, this);

    this.physics.add.collider(this.player.sprite, this.statics.group);
    this.physics.add.collider(this.enemies.group, this.statics.group);

    this.pickups = new PickupGroup(this);
    this.playerPickup = new PlayerPickup(this);

    this.bullets = new BulletGroup(this);
    this.shooter = new Shooter(this);
    this.bulletHitKill = new BulletHitKill(this);
    this.bulletHitStop = new BulletHitStop(this);

    this.hud = new Hud(this);
    this.enemyCollision = new EnemyCollision(this);
  },
  update(time, delta) {
    this.timeHandler.update(time, delta);
    this.player.update();
    this.enemies.update();
    this.shooter.update();
    this.inputHandler.update();
    this.bulletHitKill.update();
    this.bulletHitStop.update();
    this.enemyCollision.update();
    this.playerPickup.update();
    this.hud.update();
  }
});

const TimeHandler = util.extend(Object, 'TimeHandler', {
  constructor: function() {
    this.time = 0;
    this.delta = 0;
  },
  update(time, delta) {
    this.time = time;
    this.delta = delta;
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
    this.movement = new PlayerMovement(this, scene);
    this.cameraCenter = new CameraCenter(this, scene);

    this.bullets = 10;
    this.health = 100;
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

const Group = util.extend(Object, 'Group', {
  constructor: function(scene) {
    this.children = new Set();
    this.group = this.makeGroup(scene);
    this.events = new Phaser.Events.EventEmitter();
  },
  makeGroup(scene) {
    return scene.add.group();
  },
  add(child) {
    this.children.add(child);
    this.group.add(child.sprite);
    this.events.emit('add', child);
  },
  delete(child) {
    this.children.delete(child);
    child.sprite.destroy();
  }
});

const PhysicsGroup = util.extend(Group, 'PhysicsGroup', {
  constructor: function(scene) {
    this.constructor$Group(scene);
  },
  makeGroup(scene) {
    return scene.physics.add.group();
  },
  add(child) {
    this.children.add(child);
  }
});

const StaticGroup = util.extend(PhysicsGroup, 'StaticGroup', {
  constructor: function(scene) {
    this.constructor$PhysicsGroup(scene);
    generateStatics(scene, this);
  },
  makeGroup(scene) {
    return scene.physics.add.staticGroup();
  }
});

const Building = util.extend(Object, 'Building', {
  constructor: function(group, x, y) {
    this.sprite = group.group.create(x, y, 'building');
  }
});

const PickupGroup = util.extend(Group, 'PickupGroup', {
  constructor: function(scene) {
    this.constructor$Group(scene);
    generatePickups(scene, this);
  }
});

const Pickup = util.extend(Object, 'Pickup', {
  constructor: function(scene, x, y, key) {
    this.sprite = scene.add.sprite(x, y, key);
    this.scene = scene;
  },
  onPickup() {}
});

const AmmoPickup = util.extend(Pickup, 'AmmoPickup', {
  constructor: function(scene, x, y) {
    this.constructor$Pickup(scene, x, y, 'ammo');
  },
  onPickup() {
    this.scene.player.bullets++;
  }
});

const MedsPickup = util.extend(Pickup, 'MedsPickup', {
  constructor: function(scene, x, y) {
    this.constructor$Pickup(scene, x, y, 'meds');
  },
  onPickup() {
    this.scene.player.health++;
  }
});

const PlayerPickup = util.extend(Object, 'PlayerPickup', {
  constructor: function(scene) {
    this.scene = scene;
  },
  update() {
    const playerBounds = this.scene.player.sprite.getBounds();
    for(let pickup of this.scene.pickups.children) {
      let pickupBounds = pickup.sprite.getBounds();
      if(Phaser.Geom.Rectangle.Overlaps(playerBounds, pickupBounds)) {
        pickup.onPickup();
        this.scene.pickups.delete(pickup);
      }
    }
  }
});

const EnemyGroup = util.extend(PhysicsGroup, 'EnemyGroup', {
  constructor: function(scene) {
    this.constructor$PhysicsGroup(scene);
    generateEnemies(scene, this);
  },
  update() {
    for(let child of this.children) {
      child.update();
    }
  }
});

function isTouching(sprite, objs, offsetX, offsetY) {
  const enemyBounds = sprite.getBounds();
  const testBounds = Phaser.Geom.Rectangle.Offset(enemyBounds, offsetX, offsetY);

  for(let obj of objs) {
    if(obj === sprite) {
      continue;
    }
    if(Phaser.Geom.Rectangle.Overlaps(testBounds, obj.getBounds())) {
      return true;
    }
  }
  return false;
}

const Enemy = util.extend(Object, 'Enemy', {
  constructor: function(scene, group, x, y) {
    this.scene = scene;
    this.sprite = group.group.create(x, y, 'enemy');
  },
  update() {
    const SPEED = 30;

    let x = this.scene.player.sprite.x - this.sprite.x;
    let y = this.scene.player.sprite.y - this.sprite.y;

    x = this.changeVel(x, true);
    y = this.changeVel(y, false);

    let dist = Math.sqrt(x * x + y * y);
    if(dist < 1) {
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

      const objs = [
        this.scene.statics.group.getChildren(),
        this.scene.enemies.group.getChildren(),
        this.scene.player.sprite
      ].flat();
      if(isTouching(this.sprite, objs, x, y)) {
        return 0;
      }
    }
    return original;
  }
});

const EnemyCollision = util.extend(Object, 'EnemyCollision', {
  constructor: function(scene) {
    this.scene = scene;
    this.nextDamage = -1;
  },
  update() {
    const DAMAGE_TIME = 1000;
    const sprite = this.scene.player.sprite;
    const objs = this.scene.enemies.group.getChildren();
    const touchingLeft = isTouching(sprite, objs, -1, 0);
    const touchingRight = isTouching(sprite, objs, 1, 0);
    const touchingUp = isTouching(sprite, objs, 0, -1);
    const touchingDown = isTouching(sprite, objs, 0, 1);

    if((touchingLeft || touchingRight || touchingUp || touchingDown) &&
      (this.nextDamage == -1 || this.nextDamage <= this.scene.timeHandler.time)) {
      this.scene.player.health--;
      this.nextDamage = this.scene.timeHandler.time + DAMAGE_TIME;
    }
  }
});

const BulletGroup = util.extend(Group, 'BulletGroup', {
  constructor: function(scene) {
    this.constructor$Group(scene);
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
        scene.bullets.delete(this);
      }
    });
  }
});

const Shooter = util.extend(Object, 'Shooter', {
  constructor: function(scene) {
    this.scene = scene;
  },
  update() {
    if(this.scene.inputHandler.wasMouseClicked() && this.scene.player.bullets > 0) {
      const mousePos = this.scene.inputHandler.getMousePos();
      const mouseX = mousePos[0] - this.scene.sys.game.canvas.width / 2;
      const mouseY = mousePos[1] - this.scene.sys.game.canvas.height / 2;
      let x = mouseX - this.scene.cameras.main.x;
      let y = mouseY - this.scene.cameras.main.y;

      const resize = 1000 / Math.sqrt(x * x + y * y);

      x *= resize;
      y *= resize;

      let bullet = new Bullet(this.scene, this.scene.player.sprite.x,
        this.scene.player.sprite.y, x, y);
      this.scene.bullets.add(bullet);

      this.scene.player.bullets--;
    }
  }
});

const BulletHitKill = util.extend(Object, 'BulletHitKill', {
  constructor: function(scene) {
    this.scene = scene;
  },
  update() {
    for(let bullet of this.scene.bullets.children) {
      for(let enemy of this.scene.enemies.children) {
        let bulletBounds = bullet.sprite.getBounds();
        let enemyBounds = enemy.sprite.getBounds();
        if(Phaser.Geom.Rectangle.Overlaps(bulletBounds, enemyBounds)) {
          this.scene.enemies.delete(enemy);
          this.scene.bullets.delete(bullet);
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
    for(let bullet of this.scene.bullets.children) {
      for(let obj of this.scene.statics.children) {
        let bulletBounds = bullet.sprite.getBounds();
        let staticBounds = obj.sprite.getBounds();
        if(Phaser.Geom.Rectangle.Overlaps(bulletBounds, staticBounds)) {
          this.scene.bullets.delete(bullet);
        }
      }
    }
  }
});

function generateStatics(scene, group) {
  const BUILDINGS_AMOUNT = 10;
  const WIDTH = scene.sys.game.canvas.width;
  const HEIGHT = scene.sys.game.canvas.height;
  for(let i = 0; i < BUILDINGS_AMOUNT; i++) {
    let x = Math.floor(Math.random() * WIDTH);
    let y = Math.floor(Math.random() * HEIGHT);
    group.add(new Building(group, x, y));
  }
}

function generateEnemies(scene, group) {
  const ENEMY_AMOUNT = 10;
  const WIDTH = scene.sys.game.canvas.width;
  const HEIGHT = scene.sys.game.canvas.height;

  for(let i = 0; i < ENEMY_AMOUNT; i++) {
    const x = Math.floor(Math.random() * WIDTH);
    const y = Math.floor(Math.random() * HEIGHT);
    group.add(new Enemy(scene, group, x, y));
  }
}

function generatePickups(scene, group) {
  const PICKUP_AMOUNT = 10;
  const WIDTH = scene.sys.game.canvas.width;
  const HEIGHT = scene.sys.game.canvas.height;

  for(let i = 0; i < PICKUP_AMOUNT; i++) {
    const x = Math.floor(Math.random() * WIDTH);
    const y = Math.floor(Math.random() * HEIGHT);
    group.add(new AmmoPickup(scene, x, y));
  }

  for(let i = 0; i < PICKUP_AMOUNT; i++) {
    const x = Math.floor(Math.random() * WIDTH);
    const y = Math.floor(Math.random() * HEIGHT);
    group.add(new MedsPickup(scene, x, y));
  }
}

const Hud = util.extend(Object, 'Hud', {
  constructor: function(scene) {
    this.scene = scene;
    this.bulletText = scene.add.text(0, 0, 'Bullets: 0');
    this.healthText = scene.add.text(0, 20, 'Health: 100');

    this.camera = scene.cameras.add(0, 0, scene.cameras.main.width,
      scene.cameras.main.height);
    scene.cameras.main.ignore([this.bulletText, this.healthText]);

    this.camera.ignore([scene.player.sprite, scene.statics.group,
      scene.enemies.group, scene.bullets.group, scene.pickups.group
    ]);

    scene.bullets.events.on('add', child => {
      this.camera.ignore(child.sprite);
    });
  },
  update() {
    this.bulletText.setText('Bullets: ' + this.scene.player.bullets);
    this.healthText.setText('Health: ' + this.scene.player.health);
  }
});