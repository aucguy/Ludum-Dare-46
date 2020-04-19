import * as util from '/lib/util.js';
import { Player, MedHeal, HealthDeath } from './player.js';
import { Group, PhysicsGroup } from './group.js';
import { StaticGroup } from './terrain.js';
import { PickupGroup, AmmoPickup, MedsPickup, PlayerPickup } from './pickup.js';
import { EnemyGroup, EnemyCollision } from './enemy.js';
import { BulletGroup, Shooter, BulletHitKill, BulletHitStop } from './bullet.js';
import { Home, DropOffMeds } from './home.js';
import { Hud } from './hud.js';
import { generateTerrain } from './generate.js';

export const PlayScene = util.extend(Phaser.Scene, 'PlayScene', {
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
    this.home = null;
    this.dropOffMeds = null;
    this.medHeal = null;
    this.healthDeath = null;
    this.background = null;
  },
  create() {
    this.background = new Background(this);
    this.timeHandler = new TimeHandler();
    this.inputHandler = new InputHandler(this);

    const terrain = generateTerrain(this);
    this.player = new Player(0, 0, this);
    this.statics = terrain.statics;
    this.enemies = terrain.enemies;
    this.pickups = terrain.pickups;
    this.home = terrain.home;

    this.physics.add.collider(this.player.sprite, this.statics.group);
    this.physics.add.collider(this.enemies.group, this.statics.group);

    this.playerPickup = new PlayerPickup(this);
    this.dropOffMeds = new DropOffMeds(this);
    this.medHeal = new MedHeal(this);
    this.healthDeath = new HealthDeath(this);

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
    this.bulletHitKill.update();
    this.bulletHitStop.update();
    this.enemyCollision.update();
    this.playerPickup.update();
    this.dropOffMeds.update();
    this.medHeal.update();
    this.hud.update();
    this.inputHandler.update();
    this.healthDeath.update();
    this.background.update();
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
    this.keys = new Map();
    this.justPressed = new Set();
    this.mouseClicked = false;
    this.mousePos = [0, 0];

    for(let name of ['W', 'A', 'S', 'D', 'F', 'R']) {
      let key = scene.input.keyboard.addKey(name);
      key.setEmitOnRepeat(false);
      key.on('down', () => {
        this.justPressed.add(name);
      });
      this.keys.set(name, key);
    }

    scene.input.on('pointerdown', pointer => {
      this.mouseClicked = true;
    });

    scene.input.on('pointermove', pointer => {
      this.mousePos = [pointer.x, pointer.y];
    });
  },
  isKeyDown(key) {
    return this.keys.get(key).isDown;
  },
  wasKeyJustPressed(key) {
    return this.justPressed.has(key);
  },
  wasMouseClicked() {
    return this.mouseClicked;
  },
  getMousePos() {
    return this.mousePos;
  },
  update() {
    this.mouseClicked = false;
    this.justPressed.clear();
  }
});

const Background = util.extend(Object, 'Background', {
  constructor: function(scene) {
    this.scene = scene;
    const screenWidth = scene.cameras.main.width;
    const screenHeight = scene.cameras.main.height;
    this.tile = scene.add.sprite(0, 0, 'grass');
    this.tile.setScale(4);
    const tileWidth = this.tile.getBounds().width;
    const tileHeight = this.tile.getBounds().height;
    const backgroundWidth = Math.ceil(screenWidth + tileWidth);
    const backgroundHeight = Math.ceil(screenHeight + tileHeight);
    this.sprite = scene.add.renderTexture(-screenWidth / 2, -screenHeight / 2,
      backgroundWidth, backgroundHeight);

    for(let x = 0; x < backgroundWidth + tileWidth; x += tileWidth) {
      for(let y = 0; y < backgroundHeight + tileHeight; y += tileHeight) {
        this.sprite.draw(this.tile, Math.floor(x - tileWidth / 2),
          Math.floor(y - tileHeight / 2));
      }
    }
    //tile.destroy();
  },
  update() {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;

    const tileWidth = this.tile.getBounds().width;
    const tileHeight = this.tile.getBounds().height;

    const shiftX = Math.floor(this.scene.player.sprite.x / tileWidth) * (tileWidth);
    const shiftY = Math.floor(this.scene.player.sprite.y / tileHeight) * tileHeight;

    this.sprite.x = -screenWidth / 2 + shiftX;
    this.sprite.y = -screenHeight / 2 + shiftY;
  }
});