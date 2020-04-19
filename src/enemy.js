import * as util from '/lib/util.js';
import { PhysicsGroup } from './group.js';

export const EnemyGroup = util.extend(PhysicsGroup, 'EnemyGroup', {
  constructor: function(scene) {
    this.constructor$PhysicsGroup(scene);
    generateEnemies(scene, this);
  },
  update() {
    for(let child of this.children) {
      child.update();
    }
  }
});

function isTouching(sprite, objs, offsetX, offsetY) {
  const enemyBounds = sprite.getBounds();
  const testBounds = Phaser.Geom.Rectangle.Offset(enemyBounds, offsetX, offsetY);

  for(let obj of objs) {
    if(obj === sprite) {
      continue;
    }
    if(Phaser.Geom.Rectangle.Overlaps(testBounds, obj.getBounds())) {
      return true;
    }
  }
  return false;
}

const Enemy = util.extend(Object, 'Enemy', {
  constructor: function(scene, group, x, y) {
    this.scene = scene;
    this.sprite = group.group.create(x, y, 'enemy');
  },
  update() {
    const SPEED = 30;

    let x = this.scene.player.sprite.x - this.sprite.x;
    let y = this.scene.player.sprite.y - this.sprite.y;

    x = this.changeVel(x, true);
    y = this.changeVel(y, false);

    let dist = Math.sqrt(x * x + y * y);
    if(dist < 1) {
      this.sprite.setVelocity(0, 0);
    } else {
      let resize = SPEED / dist;

      x *= resize;
      y *= resize;

      if(isNaN(x) || isNaN(y)) {
        let a = 0;
      }
      this.sprite.setVelocity(x, y);
    }
  },
  changeVel(original, isX) {
    if(original != 0) {
      let offset;
      if(original < 0) {
        offset = -1;
      } else {
        offset = 1;
      }

      let x, y;
      if(isX) {
        x = offset;
        y = 0;
      } else {
        x = 0;
        y = offset;
      }

      const objs = [
        this.scene.statics.group.getChildren(),
        this.scene.enemies.group.getChildren(),
        this.scene.player.sprite
      ].flat();
      if(isTouching(this.sprite, objs, x, y)) {
        return 0;
      }
    }
    return original;
  }
});

export const EnemyCollision = util.extend(Object, 'EnemyCollision', {
  constructor: function(scene) {
    this.scene = scene;
    this.nextDamage = -1;
  },
  update() {
    const DAMAGE_TIME = 1000;
    const sprite = this.scene.player.sprite;
    const objs = this.scene.enemies.group.getChildren();
    const touchingLeft = isTouching(sprite, objs, -1, 0);
    const touchingRight = isTouching(sprite, objs, 1, 0);
    const touchingUp = isTouching(sprite, objs, 0, -1);
    const touchingDown = isTouching(sprite, objs, 0, 1);

    if((touchingLeft || touchingRight || touchingUp || touchingDown) &&
      (this.nextDamage == -1 || this.nextDamage <= this.scene.timeHandler.time)) {
      this.scene.player.health--;
      this.nextDamage = this.scene.timeHandler.time + DAMAGE_TIME;
    }
  }
});

function generateEnemies(scene, group) {
  const ENEMY_AMOUNT = 10;
  const WIDTH = scene.sys.game.canvas.width;
  const HEIGHT = scene.sys.game.canvas.height;

  for(let i = 0; i < ENEMY_AMOUNT; i++) {
    const x = Math.floor(Math.random() * WIDTH);
    const y = Math.floor(Math.random() * HEIGHT);
    group.add(new Enemy(scene, group, x, y));
  }
}