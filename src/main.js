import * as util from '/lib/util.js';
import { PlayScene } from './play.js';

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
    pixelArt: true
  });
  game.scene.add('play', new PlayScene());
  game.scene.add('lose', new LoseScene());
  return game;
}

const LoseScene = util.extend(Phaser.Scene, 'LoseScene', {
  constructor: function() {
    this.constructor$Scene();
  },
  create: function() {
    this.add.text(100, 100, 'You lost!');
  }
});