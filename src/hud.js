import * as util from '/lib/util.js';

export const Hud = util.extend(Object, 'Hud', {
  constructor: function(scene) {
    this.scene = scene;
    this.score = 0;
    this.bulletText = scene.add.text(0, 0, 'Bullets: 0');
    this.healthText = scene.add.text(0, 20, 'Health: 100');
    this.medsText = scene.add.text(0, 40, 'Meds: 0');
    this.scoreText = scene.add.text(0, 60, 'Score: 0');

    this.camera = scene.cameras.add(0, 0, scene.cameras.main.width,
      scene.cameras.main.height);
    scene.cameras.main.ignore([this.bulletText, this.healthText, this.medsText,
      this.scoreText
    ]);

    this.camera.ignore([scene.player.sprite, scene.statics.group,
      scene.enemies.group, scene.bullets.group, scene.pickups.group,
      scene.home.sprite
    ]);

    scene.bullets.events.on('add', child => {
      this.camera.ignore(child.sprite);
    });
  },
  update() {
    this.bulletText.setText('Bullets: ' + this.scene.player.bullets);
    this.healthText.setText('Health: ' + this.scene.player.health);
    this.medsText.setText('Meds: ' + this.scene.player.meds);
    this.scoreText.setText('Score: ' + this.score);
  }
});