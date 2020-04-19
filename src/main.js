import * as util from '/lib/util.js';
import { PlayScene } from './play.js';
import { getScore } from './hud.js';

export function init() {
  const game = new Phaser.Game({
    width: 640,
    height: 480,
    parent: 'gameContainer',
    scene: new util.BootScene('menu'),
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

function addPlayButton(scene) {
  const x = scene.cameras.main.width / 2;
  const y = scene.cameras.main.height / 2;

  const playButton = scene.add.sprite(x, y, 'play');
  playButton.setInteractive();
  playButton.on('pointerdown', () => {
    scene.scene.start('play');
  });
}

const MenuScene = util.extend(Phaser.Scene, 'MenuScene', {
  constructor: function() {
    this.constructor$Scene();
    this.playButton = null;
  },
  create() {
    addPlayButton(this);
  }
});

const LoseScene = util.extend(Phaser.Scene, 'LoseScene', {
  constructor: function() {
    this.constructor$Scene();
  },
  create: function() {
    this.add.text(100, 100, 'You lost!');
    this.add.text(100, 200, 'Your score was ' + getScore());
    addPlayButton(this);
  }
});