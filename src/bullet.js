import * as util from '/lib/util.js';
import { Group } from './group.js';

export const BulletGroup = util.extend(Group, 'BulletGroup', {
  constructor: function(scene) {
    this.constructor$Group(scene);
  }
});


const Bullet = util.extend(Object, 'Bullet', {
  constructor: function(scene, xPos, yPos, xVel, yVel) {
    this.sprite = scene.add.sprite(xPos, yPos, 'bullet');
    const DURATION = 3;
    scene.add.tween({
      targets: this.sprite,
      duration: DURATION * 1000,
      props: {
        x: xPos + xVel * DURATION,
        y: yPos + yVel * DURATION
      },
      onComplete: () => {
        scene.bullets.delete(this);
      }
    });
  }
});

export const Shooter = util.extend(Object, 'Shooter', {
  constructor: function(scene) {
    this.scene = scene;
  },
  update() {
    if(this.scene.inputHandler.wasMouseClicked() && this.scene.player.bullets > 0) {
      const mousePos = this.scene.inputHandler.getMousePos();
      const mouseX = mousePos[0] - this.scene.sys.game.canvas.width / 2;
      const mouseY = mousePos[1] - this.scene.sys.game.canvas.height / 2;
      let x = mouseX - this.scene.cameras.main.x;
      let y = mouseY - this.scene.cameras.main.y;

      const resize = 1000 / Math.sqrt(x * x + y * y);

      x *= resize;
      y *= resize;

      let bullet = new Bullet(this.scene, this.scene.player.sprite.x,
        this.scene.player.sprite.y, x, y);
      this.scene.bullets.add(bullet);

      this.scene.player.bullets--;
    }
  }
});

export const BulletHitKill = util.extend(Object, 'BulletHitKill', {
  constructor: function(scene) {
    this.scene = scene;
  },
  update() {
    for(let bullet of this.scene.bullets.children) {
      for(let enemy of this.scene.enemies.children) {
        let bulletBounds = bullet.sprite.getBounds();
        let enemyBounds = enemy.sprite.getBounds();
        if(Phaser.Geom.Rectangle.Overlaps(bulletBounds, enemyBounds)) {
          this.scene.enemies.delete(enemy);
          this.scene.bullets.delete(bullet);
        }
      }
    }
  }
});

export const BulletHitStop = util.extend(Object, 'BulletHitStop', {
  constructor: function(scene) {
    this.scene = scene;
  },
  update() {
    for(let bullet of this.scene.bullets.children) {
      for(let obj of this.scene.statics.children) {
        let bulletBounds = bullet.sprite.getBounds();
        let staticBounds = obj.sprite.getBounds();
        if(Phaser.Geom.Rectangle.Overlaps(bulletBounds, staticBounds)) {
          this.scene.bullets.delete(bullet);
        }
      }
    }
  }
});