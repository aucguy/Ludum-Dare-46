import * as util from '/lib/util.js';
import { constants } from './constants.js';

export const Player = util.extend(Object, 'Player', {
  constructor: function(x, y, scene) {
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setScale(4);
    this.movement = new PlayerMovement(this, scene);
    this.cameraCenter = new CameraCenter(this, scene);

    this.bullets = constants().initBullets;
    this.health = constants().initHealth;
    this.meds = constants().initMeds;
  },
  update() {
    this.movement.update();
    this.cameraCenter.update();
  }
});

export const PlayerMovement = util.extend(Object, 'PlayerMovement', {
  constructor: function(player, scene) {
    this.player = player;
    this.inputHandler = scene.inputHandler;
    this.facing = 'walkRight';
  },
  update() {
    let xVel = 0;
    let yVel = 0;

    if(this.inputHandler.isKeyDown('D')) {
      xVel = constants().playerSpeed;
      this.facing = 'walkRight';
    } else if(this.inputHandler.isKeyDown('A')) {
      xVel = -constants().playerSpeed;
      this.facing = 'walkLeft';
    }

    if(this.inputHandler.isKeyDown('S')) {
      yVel = constants().playerSpeed;
    } else if(this.inputHandler.isKeyDown('W')) {
      yVel = -constants().playerSpeed;
    }

    this.player.sprite.setVelocity(xVel, yVel);

    if(xVel != 0 || yVel != 0) {
      this.player.sprite.anims.play(this.facing, true);
    } else {
      this.player.sprite.anims.stop();
    }
  }
});

export const MedHeal = util.extend(Object, 'MedHeal', {
  constructor: function(scene) {
    this.scene = scene;
  },
  update() {
    if(this.scene.inputHandler.wasKeyJustPressed('R')) {
      if(this.scene.player.meds >= constants().healMedsDecr) {
        this.scene.player.meds -= constants().healMedsDecr;
        this.scene.player.health += constants().healHealthIncr;
        this.scene.sound.play('use');
      }
    }
  }
});

export const HealthDeath = util.extend(Object, 'HealthDeath', {
  constructor: function(scene) {
    this.scene = scene;
  },
  update() {
    if(this.scene.player.health <= 0) {
      this.scene.scene.start('lose');
    }
  }
});

export const CameraCenter = util.extend(Object, 'CameraCenter', {
  constructor: function(player, scene) {
    this.player = player;
    this.camera = scene.cameras.main;
  },
  update() {
    this.camera.centerOn(this.player.sprite.x, this.player.sprite.y);
  }
});