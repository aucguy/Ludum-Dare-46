import * as util from '/lib/util.js';
import { PlayScene } from './play.js';
import { getScore } from './hud.js';
import { DigitGroup } from './group.js';

export function init() {
  const game = new Phaser.Game({
    width: 640,
    height: 480,
    parent: 'gameContainer',
    scene: new CustomBootScene('menu'),
    physics: {
      default: 'arcade',
      arcade: {
        //debug: true
      }
    },
    pixelArt: true
  });
  game.scene.add('menu', new MenuScene());
  game.scene.add('play', new PlayScene());
  game.scene.add('lose', new LoseScene());
  return game;
}

const CustomBootScene = util.extend(util.BootScene, 'CustomBootScene', {
  constructor: function(nextScene) {
    this.constructor$BootScene(nextScene);
  },
  create() {
    this.create$BootScene();

    this.anims.create({
      key: 'walkRight',
      frames: this.anims.generateFrameNumbers('player', {
        start: 0,
        end: 1
      }),
      frameRate: 2,
      repeat: -1
    });

    this.anims.create({
      key: 'walkLeft',
      frames: this.anims.generateFrameNumbers('player', {
        start: 2,
        end: 3
      }),
      frameRate: 2,
      repeat: -1
    });

    this.anims.create({
      key: 'enemyWalk',
      frames: this.anims.generateFrameNumbers('enemy', {
        start: 0,
        end: 1
      }),
      frameRate: 2,
      repeat: -1
    });

    for(let i = 0; i < 10; i++) {
      this.anims.create({
        key: 'digit' + i,
        frames: this.anims.generateFrameNumbers('digits', {
          start: i,
          end: i
        })
      });
    }
  }
});

function addPlayButton(scene) {
  const x = scene.cameras.main.width / 2;
  const y = scene.cameras.main.height / 2;

  const playButton = scene.add.sprite(x, y, 'play');
  playButton.setScale(4);
  playButton.setInteractive();
  playButton.on('pointerdown', () => {
    scene.scene.start('play');
  });
}

function addWallpaper(scene) {
  const width = scene.cameras.main.width;
  const height = scene.cameras.main.height;
  scene.add.sprite(width / 2, height / 2, 'wallpaper');
}

const MenuScene = util.extend(Phaser.Scene, 'MenuScene', {
  constructor: function() {
    this.constructor$Scene();
    this.playButton = null;
  },
  create() {
    addWallpaper(this);
    addPlayButton(this);
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const title = this.add.sprite(width / 2, height / 4, 'title');
    title.setScale(4);
  }
});

const LoseScene = util.extend(Phaser.Scene, 'LoseScene', {
  constructor: function() {
    this.constructor$Scene();
  },
  create: function() {
    addWallpaper(this);
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loseTitle = this.add.sprite(width / 2, height / 4, 'loseTitle');
    loseTitle.setScale(4);
    const scoreTitle = this.add.sprite(width / 2, height / 4 * 3, 'scoreTitle');
    scoreTitle.setScale(4);
    const scoreText = new DigitGroup(this, getScore(), width / 2 + 64,
      height / 4 * 3, false, 4);
    addPlayButton(this);
  }
});