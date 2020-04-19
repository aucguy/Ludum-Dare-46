import * as util from '/lib/util.js';
import { PhysicsGroup } from './group.js';

export const StaticGroup = util.extend(PhysicsGroup, 'StaticGroup', {
  constructor: function(scene) {
    this.constructor$PhysicsGroup(scene);
    generateStatics(scene, this);
  },
  makeGroup(scene) {
    return scene.physics.add.staticGroup();
  }
});

const Building = util.extend(Object, 'Building', {
  constructor: function(group, x, y) {
    this.sprite = group.group.create(x, y, 'building');
  }
});

function generateStatics(scene, group) {
  const BUILDINGS_AMOUNT = 10;
  const WIDTH = scene.sys.game.canvas.width;
  const HEIGHT = scene.sys.game.canvas.height;
  for(let i = 0; i < BUILDINGS_AMOUNT; i++) {
    let x = Math.floor(Math.random() * WIDTH);
    let y = Math.floor(Math.random() * HEIGHT);
    group.add(new Building(group, x, y));
  }
}