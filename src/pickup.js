import * as util from '/lib/util.js';
import { Group } from './group.js';

export const PickupGroup = util.extend(Group, 'PickupGroup', {
  constructor: function(scene) {
    this.constructor$Group(scene);
    generatePickups(scene, this);
  }
});

const Pickup = util.extend(Object, 'Pickup', {
  constructor: function(scene, x, y, key) {
    this.sprite = scene.add.sprite(x, y, key);
    this.scene = scene;
  },
  onPickup() {}
});

export const AmmoPickup = util.extend(Pickup, 'AmmoPickup', {
  constructor: function(scene, x, y) {
    this.constructor$Pickup(scene, x, y, 'ammo');
  },
  onPickup() {
    this.scene.player.bullets++;
  }
});

export const MedsPickup = util.extend(Pickup, 'MedsPickup', {
  constructor: function(scene, x, y) {
    this.constructor$Pickup(scene, x, y, 'meds');
  },
  onPickup() {
    this.scene.player.meds++;
  }
});

export const PlayerPickup = util.extend(Object, 'PlayerPickup', {
  constructor: function(scene) {
    this.scene = scene;
  },
  update() {
    const playerBounds = this.scene.player.sprite.getBounds();
    for(let pickup of this.scene.pickups.children) {
      let pickupBounds = pickup.sprite.getBounds();
      if(Phaser.Geom.Rectangle.Overlaps(playerBounds, pickupBounds)) {
        pickup.onPickup();
        this.scene.pickups.delete(pickup);
      }
    }
  }
});

function generatePickups(scene, group) {
  const PICKUP_AMOUNT = 10;
  const WIDTH = scene.sys.game.canvas.width;
  const HEIGHT = scene.sys.game.canvas.height;

  for(let i = 0; i < PICKUP_AMOUNT; i++) {
    const x = Math.floor(Math.random() * WIDTH);
    const y = Math.floor(Math.random() * HEIGHT);
    group.add(new AmmoPickup(scene, x, y));
  }

  for(let i = 0; i < PICKUP_AMOUNT; i++) {
    const x = Math.floor(Math.random() * WIDTH);
    const y = Math.floor(Math.random() * HEIGHT);
    group.add(new MedsPickup(scene, x, y));
  }
}