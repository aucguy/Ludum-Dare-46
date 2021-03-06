import * as util from '/lib/util.js';
import { DigitGroup } from './group.js';
import { constants } from './constants.js';

let score = 0;

export function getScore() {
  return score;
}

export const Hud = util.extend(Object, 'Hud', {
  constructor: function(scene) {
    this.scene = scene;
    this.setScore(0);

    this.hudSprite = scene.add.sprite(0, 0, 'hud');
    this.hudSprite.setScale(4);
    this.hudSprite.x = this.hudSprite.getBounds().width / 2;
    this.hudSprite.y = scene.cameras.main.height - this.hudSprite.getBounds().height / 2;

    let unpack = this.addIndicator(scene, constants().ammoHudX, 'ammo');
    this.bulletSprite = unpack.sprite;
    this.bulletText = unpack.text;

    unpack = this.addIndicator(scene, constants().medsHudX, 'meds');
    this.medsSprite = unpack.sprite;
    this.medsText = unpack.text;

    unpack = this.addIndicator(scene, constants().healthHudX, 'health');
    this.healthSprite = unpack.sprite;
    this.healthText = unpack.text;

    unpack = this.addIndicator(scene, constants().scoreHudX, 'home');
    this.scoreSprite = unpack.sprite;
    this.scoreText = unpack.text;

    this.camera = scene.cameras.add(0, 0, scene.cameras.main.width,
      scene.cameras.main.height);

    scene.cameras.main.ignore([this.bulletText, this.healthText, this.medsText,
      this.scoreText, scene.background.tile, this.hudSprite, this.bulletSprite,
      this.healthSprite, this.medsSprite, this.scoreSprite
    ]);

    this.camera.ignore([scene.player.sprite, scene.statics.group,
      scene.enemies.group, scene.bullets.group, scene.pickups.group,
      scene.home.sprite, scene.background.sprite, scene.background.tile,
    ]);

    this.registerGroup(scene.enemies);
    this.registerGroup(scene.pickups);
    this.registerGroup(scene.bullets);
  },
  update() {
    this.bulletText.setText('' + this.scene.player.bullets);
    this.healthText.setText('' + this.scene.player.health);
    this.medsText.setText('' + this.scene.player.meds);
    this.scoreText.setText('' + this.getScore());
  },
  addIndicator(scene, x, key) {
    const sprite = scene.add.sprite(x, this.hudSprite.y, key);
    sprite.setScale(4);
    const text = new DigitGroup(this.scene, 0, sprite.getBounds().right + 16, this.hudSprite.y, true, 2);
    //const text = scene.add.text(sprite.getBounds().right + 8, this.hudSprite.y, '0');
    //text.y -= text.getBounds().height / 2;

    return {
      sprite,
      text
    };
  },
  registerGroup(group) {
    group.events.on('add', child => {
      this.camera.ignore(child.sprite);
    });
  },
  getScore() {
    return score;
  },
  setScore(x) {
    score = x;
  }
});