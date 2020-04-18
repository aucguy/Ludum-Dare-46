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
        this.player = null;
        this.inputHandler = null;
    },
    create() {
        this.inputHandler = new InputHandler(this);
        
        this.buildings = this.physics.add.staticGroup();
        
        const BUILDINGS_AMOUNT = 10;
        const WIDTH = 640;
        const HEIGHT = 480;
        for(let i = 0; i < BUILDINGS_AMOUNT; i++) {
            let x = Math.floor(Math.random() * WIDTH);
            let y = Math.floor(Math.random() * HEIGHT);
            this.buildings.create(x, y, 'building');
        }
        
        this.player = new Player(32, 32, this);
    },
    update() {
        this.player.update();
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
        //this.camera.centerOn(50, 50);
    }
});