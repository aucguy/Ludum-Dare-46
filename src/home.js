import * as util from '/lib/util.js';

export const Home = util.extend(Object, 'Home', {
  constructor: function(scene, x, y) {
    this.sprite = scene.add.sprite(x, y, 'home');
  }
});

export const DropOffMeds = util.extend(Object, 'DropOffMeds', {
  constructor: function(scene) {
    this.scene = scene;
  },
  update() {
    const playerBounds = this.scene.player.sprite.getBounds();
    const homeBounds = this.scene.home.sprite.getBounds();
    const keypressed = this.scene.inputHandler.wasKeyJustPressed('F');
    if(Phaser.Geom.Rectangle.Overlaps(playerBounds, homeBounds) && keypressed &&
      this.scene.player.meds > 0) {
      this.scene.player.meds--;
      this.scene.hud.setScore(this.scene.hud.getScore() + 1);
    }
  }
});