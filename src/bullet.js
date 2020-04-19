import * as util from '/lib/util.js';
import { Group } from './group.js';
import { constants } from './constants.js';

export const BulletGroup = util.extend(Group, 'BulletGroup', {
  constructor: function(scene) {
    this.constructor$Group(scene);
  }
});


const Bullet = util.extend(Object, 'Bullet', {
  constructor: function(scene, xPos, yPos, xVel, yVel) {
    this.sprite = scene.add.sprite(xPos, yPos, 'bullet');
    scene.add.tween({
      targets: this.sprite,
      duration: constants().bulletTravelTime * 1000,
      props: {
        x: xPos + xVel * constants().bulletTravelTime,
        y: yPos + yVel * constants().bulletTravelTime
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
    if(this.scene.inputHandler.wasMouseClicked() &&
      this.scene.player.bullets >= constants().bulletShootNum) {
      const mousePos = this.scene.inputHandler.getMousePos();
      const mouseX = mousePos[0] - this.scene.sys.game.canvas.width / 2;
      const mouseY = mousePos[1] - this.scene.sys.game.canvas.height / 2;
      let x = mouseX - this.scene.cameras.main.x;
      let y = mouseY - this.scene.cameras.main.y;

      const resize = constants().bulletSpeed / Math.sqrt(x * x + y * y);

      x *= resize;
      y *= resize;

      let bullet = new Bullet(this.scene, this.scene.player.sprite.x,
        this.scene.player.sprite.y, x, y);
      this.scene.bullets.add(bullet);

      this.scene.player.bullets -= constants().bulletShootNum;

      this.scene.sound.play('shoot');
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