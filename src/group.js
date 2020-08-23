import * as util from '/lib/util.js';

export const Group = util.extend(Object, 'Group', {
  constructor: function(scene) {
    this.children = new Set();
    this.group = this.makeGroup(scene);
    this.events = new Phaser.Events.EventEmitter();
  },
  makeGroup(scene) {
    return scene.add.group();
  },
  add(child) {
    this.children.add(child);
    this.group.add(child.sprite);
    this.events.emit('add', child);
  },
  delete(child) {
    this.children.delete(child);
    child.sprite.destroy();
  }
});

export const PhysicsGroup = util.extend(Group, 'PhysicsGroup', {
  constructor: function(scene) {
    this.constructor$Group(scene);
  },
  makeGroup(scene) {
    return scene.physics.add.group();
  },
  add(child) {
    this.children.add(child);
    this.events.emit('add', child);
  }
});

export const DigitGroup = util.extend(Object, 'DigitGroup', {
  constructor: function(scene, num, x, y, hide, scale) {
    this.children = new Set();
    this.scene = scene;
    this.num = null;
    this.x = x;
    this.y = y;
    this.hide = hide;
    this.scale = scale;
    this.setText(num, x, y);
  },
  setText(num) {
    if(num === this.num) {
      return;
    }
    this.num = num;

    let sprite;
    for(let sprite of this.children) {
      sprite.destroy();
    }

    num = '' + num;
    let x = this.x;
    for(let i = 0; i < num.length; i++) {
      let c = num[i];
      sprite = this.scene.add.sprite(x, this.y, 'digits');
      sprite.setScale(this.scale);
      sprite.anims.play('digit' + c);
      this.children.add(sprite);
      if(this.hide) {
        this.scene.cameras.main.ignore(sprite);
      }
      x += 8 * this.scale + 2;
    }
  }
});