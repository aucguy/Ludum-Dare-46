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