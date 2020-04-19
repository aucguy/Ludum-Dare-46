import * as util from '/lib/util.js';
import { StaticGroup, Building } from './terrain.js';
import { EnemyGroup, Enemy } from './enemy.js';
import { PickupGroup, AmmoPickup, MedsPickup } from './pickup.js';
import { Home } from './home.js';
import { constants } from './constants.js';

const mapSize = constants().mapSize;

export function generateTerrain(scene) {
  const statics = new StaticGroup(scene);
  const enemies = new EnemyGroup(scene);
  const pickups = new PickupGroup(scene);
  const home = new Home(scene, 0, 0);
  const objs = new Set();
  objs.add(home);

  const buildingFactory = (x, y) => new Building(statics, x, y);

  const buildingTex = scene.textures.get('building').getSourceImage();
  for(let x = -mapSize / 2; x < mapSize / 2; x += buildingTex.width) {
    createObj(statics, objs, buildingFactory, x, -mapSize / 2 - buildingTex.height / 2);
    createObj(statics, objs, buildingFactory, x, mapSize / 2 + buildingTex.height / 2);
  }

  for(let y = -mapSize / 2; y < mapSize / 2; y += buildingTex.height) {
    createObj(statics, objs, buildingFactory, -mapSize / 2 - buildingTex.width / 2, y);
    createObj(statics, objs, buildingFactory, mapSize / 2 + buildingTex.width / 2, y);
  }

  spawn(scene, constants().buildingInitSpawn, objs, statics, 'building', buildingFactory);
  spawn(scene, constants().pickupInitSpawn, objs, pickups, 'ammo', (x, y) => {
    if(Math.random() < constants().ammoInitSpawnProp) {
      return new AmmoPickup(scene, x, y);
    } else {
      return new MedsPickup(scene, x, y);
    }
  });
  //spawn(scene, constants().enemyInitSpawn, objs, enemies, 'enemies',
  //    (x, y) =>new Enemy(scene, x, y));

  return {
    statics,
    enemies,
    pickups,
    home
  };
}

function spawn(scene, attempts, objs, group, key, factory) {
  const texture = scene.textures.get(key).getSourceImage();
  const margin = texture.width * constants().marginFactor;

  for(let i = 0; i < attempts; i++) {
    let attemptX = Math.random() * mapSize - mapSize / 2;
    let attemptY = Math.random() * mapSize - mapSize / 2;
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

function getSpawnType() {
  let chance = Math.random();
  if(chance < constants().enemySpawnChance) {
    return 'enemy';
  }
  chance -= constants().enemySpawnChance;
  if(chance < constants().ammoSpawnChance) {
    return 'ammo';
  }
  chance -= constants.ammoSpawnChance;
  if(chance < constants().medsSpawnChance) {
    return 'meds';
  } else {
    return 'none';
  }
}

export const Spawner = util.extend(Object, 'Spawner', {
  constructor: function(scene) {
    this.scene = scene;
    this.nextSpawn = -1;
  },
  update() {
    if(this.nextSpawn === -1) {
      this.nextSpawn = this.scene.timeHandler.time; //+ constants().firstSpawnTime;
    } else if(this.nextSpawn <= this.scene.timeHandler.time) {
      this.nextSpawn = this.scene.timeHandler.time + 1; //+ constants().spawnTime;

      const objs = [
        this.scene.statics.group.getChildren(),
        this.scene.enemies.group.getChildren(),
        this.scene.pickups.group.getChildren(),
        this.scene.home.sprite,
        this.scene.player.sprite
      ].flat();

      const type = getSpawnType();

      if(type === 'none') {
        return;
      }

      const texture = this.scene.textures.get(type).getSourceImage();
      let attemptX = Math.random() * mapSize - mapSize / 2;
      let attemptY = Math.random() * mapSize - mapSize / 2;
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
    }
  }
});