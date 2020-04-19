import * as util from '/lib/util.js';

export const Player = util.extend(Object, 'Player', {
  constructor: function(x, y, scene) {
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.movement = new PlayerMovement(this, scene);
    this.cameraCenter = new CameraCenter(this, scene);

    this.bullets = 10;
    this.health = 5;
    this.meds = 0;
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

export const MedHeal = util.extend(Object, 'MedHeal', {
  constructor: function(scene) {
    this.scene = scene;
  },
  update() {
    if(this.scene.inputHandler.wasKeyJustPressed('R')) {
      if(this.scene.player.meds > 0) {
        this.scene.player.meds--;
        this.scene.player.health++;
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