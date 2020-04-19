import * as util from '/lib/util.js';
import { StaticGroup, Building } from './terrain.js';
import { EnemyGroup, Enemy } from './enemy.js';
import { PickupGroup, AmmoPickup, MedsPickup } from './pickup.js';
import { Home } from './home.js';

const MAP_SIZE = 1000;

export function generateTerrain(scene) {
  const statics = new StaticGroup(scene);
  const enemies = new EnemyGroup(scene);
  const pickups = new PickupGroup(scene);
  const home = new Home(scene, 0, 0);
  const objs = new Set();
  objs.add(home);

  const buildingFactory = (x, y) => new Building(statics, x, y);

  const buildingTex = scene.textures.get('building').getSourceImage();
  for(let x = -MAP_SIZE / 2; x < MAP_SIZE / 2; x += buildingTex.width) {
    createObj(statics, objs, buildingFactory, x, -MAP_SIZE / 2 - buildingTex.height / 2);
    createObj(statics, objs, buildingFactory, x, MAP_SIZE / 2 + buildingTex.height / 2);
  }

  for(let y = -MAP_SIZE / 2; y < MAP_SIZE / 2; y += buildingTex.height) {
    createObj(statics, objs, buildingFactory, -MAP_SIZE / 2 - buildingTex.width / 2, y);
    createObj(statics, objs, buildingFactory, MAP_SIZE / 2 + buildingTex.width / 2, y);
  }

  spawn(scene, 250, objs, statics, 'building', buildingFactory);
  spawn(scene, 250, objs, pickups, 'ammo', (x, y) => {
    if(Math.random() < 0.5) {
      return new AmmoPickup(scene, x, y);
    } else {
      return new MedsPickup(scene, x, y);
    }
  });
  //spawn(scene, 250, objs, enemies, 'enemies', (x, y) => new Enemy(scene, x, y));

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
    let attemptX = Math.random() * MAP_SIZE - MAP_SIZE / 2;
    let attemptY = Math.random() * MAP_SIZE - MAP_SIZE / 2;
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
      createObj(group, objs, factory, attemptX, attemptY);
    }
  }
}

function createObj(group, objs, factory, x, y) {
  const created = factory(x, y);
  group.add(created);
  objs.add(created);
}

export const Spawner = util.extend(Object, 'Spawner', {
  constructor: function(scene) {
    this.scene = scene;
    this.nextSpawn = -1;
  },
  update() {
    if(this.nextSpawn === -1) {
      this.nextSpawn = this.scene.timeHandler.time; //+ 10000;
    } else if(this.nextSpawn <= this.scene.timeHandler.time) {
      const objs = [
        this.scene.statics.group.getChildren(),
        this.scene.enemies.group.getChildren(),
        this.scene.pickups.group.getChildren(),
        this.scene.home.sprite,
        this.scene.player.sprite
      ].flat();

      let type;
      let chance = Math.random();

      if(chance < 0.33) {
        type = 'enemy';
      } else if(chance < 0.66) {
        type = 'ammo';
      } else {
        type = 'meds';
      }

      const texture = this.scene.textures.get(type).getSourceImage();
      let attemptX = Math.random() * MAP_SIZE - MAP_SIZE / 2;
      let attemptY = Math.random() * MAP_SIZE - MAP_SIZE / 2;
      const spawnBounds = new Phaser.Geom.Rectangle(attemptX, attemptY,
        texture.width, texture.height);

      let found = false;
      for(let obj of objs) {
        let objBounds = obj.getBounds();
        if(Phaser.Geom.Rectangle.Overlaps(objBounds, spawnBounds)) {
          found = true;
          break;
        }
      }

      if(!found) {
        if(type == 'enemy') {
          this.scene.enemies.add(new Enemy(this.scene, attemptX, attemptY));
        } else if(type == 'ammo') {
          this.scene.pickups.add(new AmmoPickup(this.scene, attemptX, attemptY));
        } else if(type == 'meds') {
          this.scene.pickups.add(new MedsPickup(this.scene, attemptX, attemptY));
        }
      }

      this.nextSpawn = this.scene.timeHandler.time + 1; //+ 5000;
    }
  }
});