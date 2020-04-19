import * as util from '/lib/util.js';
import { PhysicsGroup } from './group.js';

export const StaticGroup = util.extend(PhysicsGroup, 'StaticGroup', {
  constructor: function(scene) {
    this.constructor$PhysicsGroup(scene);
  },
  makeGroup(scene) {
    return scene.physics.add.staticGroup();
  }
});

export const Building = util.extend(Object, 'Building', {
  constructor: function(group, x, y) {
    this.sprite = group.group.create(x, y, 'building');
    this.sprite.setScale(4);
    this.sprite.refreshBody();
  }
});