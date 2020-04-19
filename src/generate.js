import { StaticGroup, Building } from './terrain.js';
import { EnemyGroup, Enemy } from './enemy.js';
import { PickupGroup, AmmoPickup, MedsPickup } from './pickup.js';
import { Home } from './home.js';

export function generateTerrain(scene) {
  const statics = new StaticGroup(scene);
  const enemies = new EnemyGroup(scene);
  const pickups = new PickupGroup(scene);
  const home = new Home(scene, 0, 0);
  const objs = new Set();
  objs.add(home);

  spawn(scene, 250, objs, statics, 'building', (x, y) => new Building(statics, x, y));
  spawn(scene, 250, objs, pickups, 'ammo', (x, y) => {
    if(Math.random() < 0.5) {
      return new AmmoPickup(scene, x, y);
    } else {
      return new MedsPickup(scene, x, y);
    }
  });
  spawn(scene, 250, objs, enemies, 'enemies', (x, y) => new Enemy(scene, enemies, x, y));

  return {
    statics,
    enemies,
    pickups,
    home
  };
}

function spawn(scene, attempts, objs, group, key, factory) {
  const texture = scene.textures.get(key).getSourceImage();
  const margin = texture.width;

  for(let i = 0; i < attempts; i++) {
    let attemptX = Math.random() * 1000 - 500;
    let attemptY = Math.random() * 1000 - 500;
    let halfWidth = texture.width / 2;
    let halfHeight = texture.height / 2;
    let bounds = new Phaser.Geom.Rectangle(attemptX - halfWidth - margin,
      attemptY - halfHeight - margin, texture.width + 2 * margin,
      texture.height + 2 * margin);

    let found = false;
    for(let obj of objs) {
      if(Phaser.Geom.Rectangle.Overlaps(bounds, obj.sprite.getBounds())) {
        found = true;
        break;
      }
    }

    if(!found) {
      let created = factory(attemptX, attemptY);
      group.add(created);
      objs.add(created);
    }
  }
}

/*export function generateStatics(scene, group) {
  const BUILDINGS_AMOUNT = 10;
  const WIDTH = scene.sys.game.canvas.width;
  const HEIGHT = scene.sys.game.canvas.height;
  for(let i = 0; i < BUILDINGS_AMOUNT; i++) {
    let x = Math.floor(Math.random() * WIDTH);
    let y = Math.floor(Math.random() * HEIGHT);
    group.add(new Building(group, x, y));
  }
}

export function generateEnemies(scene, group) {
  const ENEMY_AMOUNT = 10;
  const WIDTH = scene.sys.game.canvas.width;
  const HEIGHT = scene.sys.game.canvas.height;

  for(let i = 0; i < ENEMY_AMOUNT; i++) {
    const x = Math.floor(Math.random() * WIDTH);
    const y = Math.floor(Math.random() * HEIGHT);
    group.add(new Enemy(scene, group, x, y));
  }
}

export function generatePickups(scene, group) {
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
}*/